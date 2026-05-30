"""
Surety Universe Service — reverse-engineer the credit-enhancement
provider universe from the EMMA bond corpus.

Every muni Official Statement (OS) names its credit-enhancement
provider (if any) — "the obligations are insured by [BAM]",
"performance secured by surety bond from [Travelers Casualty]",
"irrevocable letter of credit issued by [JPMorgan Chase]".

This service:
  1. Scans the in-memory EMMA SEED_BONDS (and live EMMA when the
     plugin is configured).
  2. Extracts provider mentions from each bond's `enhancement`
     and related fields.
  3. Normalises mentions against a curated KNOWN_PROVIDERS dict
     (Bible §2.18 carrier roster plus monolines and LOC banks).
  4. Upserts each provider as a firm Contact via ContactsService
     with `serves_as` set to the matching counterparty role and
     `emma_track_record` JSON folded into background_notes.
  5. Returns a co-appearance graph showing each provider's
     most-frequent bond counsel / trustee / financial advisor
     partners across the corpus.

Backend-only. No UI surface — the existing
`GET /api/contacts/partners?role=surety_carrier` route exposes
the universe to any consumer.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime
from typing import Any, Iterable, Optional

from services.contacts_service import ContactsService
from services.data_connectors import EMMAPlugin

log = logging.getLogger(__name__)


# ── Provider taxonomy ─────────────────────────────────────────
#
# Bible §2.18 surety carrier universe + monoline insurers +
# top-tier LOC banks + federal credit programs. Aliases capture
# the most common short forms that appear in EMMA OS text.
#
# `type` maps 1:1 to a Counterparty role on the contact:
#   bond_insurer   → serves_as = ["bond_insurer"]
#   surety_carrier → serves_as = ["surety_carrier"]
#   loc_bank       → serves_as = ["loc_bank"]
#   federal_guarantee / state_credit → serves_as = ["credit_enhancer"]
KNOWN_PROVIDERS: dict[str, dict[str, Any]] = {
    # ── Bond insurers (monoline) ──────────────────────────────
    "Build America Mutual": {
        "type": "bond_insurer",
        "aliases": [
            "BAM",
            "Build America Mutual Assurance Company",
            "Build America Mutual Assurance",
        ],
    },
    "Assured Guaranty Municipal": {
        "type": "bond_insurer",
        "aliases": [
            "AGM",
            "Assured Guaranty",
            "AGC",
            "Assured Guaranty Corp",
            "Assured Guaranty (AGM)",
            "Assured Guaranty (AGC)",
        ],
    },
    # ── Surety carriers (Bible §2.18) ─────────────────────────
    "Travelers Casualty and Surety": {
        "type": "surety_carrier",
        "aliases": [
            "Travelers",
            "Travelers Casualty",
            "Travelers Casualty and Surety Company of America",
        ],
    },
    "Liberty Mutual": {
        "type": "surety_carrier",
        "aliases": ["Liberty Mutual Insurance", "Liberty Mutual Surety"],
    },
    "Zurich North America": {
        "type": "surety_carrier",
        "aliases": ["Zurich", "Zurich American", "Zurich American Insurance"],
    },
    "CNA Surety": {
        "type": "surety_carrier",
        "aliases": ["CNA", "CNA Financial"],
    },
    "Chubb Surety": {
        "type": "surety_carrier",
        "aliases": ["Chubb", "Chubb Group", "ACE Chubb"],
    },
    "Hartford Fire Insurance": {
        "type": "surety_carrier",
        "aliases": ["The Hartford", "Hartford", "Hartford Financial Services"],
    },
    "Arch Insurance Group": {
        "type": "surety_carrier",
        "aliases": ["Arch", "Arch Capital", "Arch Insurance"],
    },
    "AmTrust Financial Services": {
        "type": "surety_carrier",
        "aliases": ["AmTrust"],
    },
    "Old Republic International": {
        "type": "surety_carrier",
        "aliases": ["Old Republic", "Old Republic Surety", "ORI"],
    },
    # Hylant is a surety broker, not a carrier — but the SEED
    # data lists it as the enhancement provider so we capture it.
    "Hylant Group": {
        "type": "surety_broker",
        "aliases": ["Hylant", "Hylant Insurance"],
    },
    # ── Federal credit-enhancement programs ───────────────────
    "USDA Rural Development": {
        "type": "federal_guarantee",
        "aliases": ["USDA RD", "USDA", "USDA Rural Dev"],
    },
    "HUD Section 232": {
        "type": "federal_guarantee",
        "aliases": ["HUD 232", "FHA 232", "HUD Sec 232"],
    },
    "FHA Section 221(d)(4)": {
        "type": "federal_guarantee",
        "aliases": ["FHA 221", "FHA 221(d)(4)", "HUD 221"],
    },
    "GNMA": {
        "type": "federal_guarantee",
        "aliases": ["Ginnie Mae", "Government National Mortgage Association"],
    },
    # ── LOC banks (top tier) ──────────────────────────────────
    "JPMorgan Chase Bank N.A.": {
        "type": "loc_bank",
        "aliases": ["JPM", "JPMorgan", "JP Morgan", "JPMorgan Chase", "Chase"],
    },
    "Bank of America N.A.": {
        "type": "loc_bank",
        "aliases": ["BofA", "Bank of America", "BAC"],
    },
    "Wells Fargo Bank N.A.": {
        "type": "loc_bank",
        "aliases": ["Wells Fargo", "WFC"],
    },
    "U.S. Bank National Association": {
        "type": "loc_bank",
        "aliases": ["US Bank", "U.S. Bank", "USB"],
    },
    "Citibank N.A.": {
        "type": "loc_bank",
        "aliases": ["Citi", "Citibank", "Citigroup"],
    },
    "PNC Bank N.A.": {
        "type": "loc_bank",
        "aliases": ["PNC", "PNC Bank"],
    },
    "Truist Bank": {
        "type": "loc_bank",
        "aliases": ["Truist", "BB&T", "SunTrust"],
    },
    "TD Bank N.A.": {
        "type": "loc_bank",
        "aliases": ["TD Bank", "TD"],
    },
    # ── State credit-enhancement programs ─────────────────────
    "Florida Chapter 651": {
        "type": "state_credit",
        "aliases": ["FL 651", "Florida 651"],
    },
}


# Enhancement-type strings (from emma_engine.OS_PARSER_PROMPT and
# the SEED records) that map to a counterparty role when no
# specific provider is named.
_ENHANCEMENT_TYPE_ROLE = {
    "bond_insurance": "bond_insurer",
    "surety": "surety_carrier",
    "loc": "loc_bank",
    "cash_collateralized_lc": "loc_bank",
    "federal_guarantee": "credit_enhancer",
    "state_credit": "credit_enhancer",
}

# Map provider-type → contact serves_as role
_TYPE_TO_SERVES_AS = {
    "bond_insurer": "bond_insurer",
    "surety_carrier": "surety_carrier",
    "surety_broker": "surety_carrier",
    "loc_bank": "loc_bank",
    "federal_guarantee": "credit_enhancer",
    "state_credit": "credit_enhancer",
    "unknown": "credit_enhancer",
}

# OS field names to probe for provider mentions, in priority order.
_PROVIDER_FIELDS = (
    "enhancement_provider",
    "wrap_provider",
    "credit_enhancement",
    "enhancement",
    "insurer",
    "surety",
    "bond_insurance",
    "letter_of_credit_bank",
    "loc_bank",
    "guarantor",
    "federal_guarantee",
    "state_credit",
)


# ── helpers ──────────────────────────────────────────────────

def _external_id_for(provider_name: str) -> str:
    """Stable external_id for upsert/idempotency."""
    slug = (
        provider_name.lower()
        .replace("&", "and")
        .replace(".", "")
        .replace(",", "")
        .replace("(", "")
        .replace(")", "")
        .strip()
    )
    for ch in (" ", "/", "\\", "'"):
        slug = slug.replace(ch, "_")
    while "__" in slug:
        slug = slug.replace("__", "_")
    return f"surety_universe::{slug}"


def _normalise(raw: str) -> Optional[tuple[str, str]]:
    """Return (canonical_name, provider_type) if raw matches a
    known provider or alias. Otherwise None.

    Match is case-insensitive substring against the canonical name
    and every alias.
    """
    if not raw:
        return None
    haystack = raw.lower()
    # Prefer exact alias/name match before substring fall-through.
    for canonical, meta in KNOWN_PROVIDERS.items():
        candidates = [canonical] + meta.get("aliases", [])
        for cand in candidates:
            if cand.lower() == haystack.strip():
                return canonical, meta["type"]
    for canonical, meta in KNOWN_PROVIDERS.items():
        candidates = [canonical] + meta.get("aliases", [])
        for cand in candidates:
            if cand.lower() in haystack:
                return canonical, meta["type"]
    return None


def _extract_provider_string(value: Any) -> Optional[str]:
    """Pull a provider name out of a value that may be a string,
    dict (the SEED `enhancement` shape), or None."""
    if value is None:
        return None
    if isinstance(value, str):
        return value.strip() or None
    if isinstance(value, dict):
        for k in ("provider", "name", "issuer"):
            v = value.get(k)
            if isinstance(v, str) and v.strip():
                return v.strip()
    return None


def _enhancement_type(value: Any) -> Optional[str]:
    if isinstance(value, dict):
        t = value.get("type")
        if isinstance(t, str):
            return t
    return None


# ── service ──────────────────────────────────────────────────

class SuretyUniverseService:
    """Reverse-engineer the surety / credit-enhancement provider
    universe from EMMA bonds; persist each as a firm Contact."""

    def __init__(self, contacts_service: Optional[ContactsService] = None):
        self.contacts = contacts_service or ContactsService()
        self._emma = EMMAPlugin()

    # — public API —

    def extract_provider_mentions(self, bond_record: dict) -> list[dict]:
        """Return all enhancement provider mentions found in one bond.

        Each mention dict:
          provider_name, provider_type, source_field,
          bond_par_amount, bond_sector, bond_state, bond_year,
          bond_cusip, bond_borrower,
          bond_counsel, trustee, financial_advisor, underwriter
        """
        if not isinstance(bond_record, dict):
            return []

        mentions: list[dict] = []
        seen: set[tuple[str, str]] = set()  # (provider_name, source_field)

        bond_meta = {
            "bond_cusip": bond_record.get("cusip"),
            "bond_borrower": bond_record.get("borrower"),
            "bond_par_amount": bond_record.get("par_amount"),
            "bond_sector": bond_record.get("sector"),
            "bond_state": bond_record.get("state"),
            "bond_year": _year_from(bond_record.get("dated_date")),
        }
        cps = bond_record.get("counterparties") or {}
        bond_meta.update({
            "bond_counsel": cps.get("bond_counsel"),
            "trustee": cps.get("trustee"),
            "financial_advisor": cps.get("financial_advisor"),
            "underwriter": cps.get("underwriter"),
        })

        for field in _PROVIDER_FIELDS:
            value = bond_record.get(field)
            if value is None:
                continue

            raw_provider = _extract_provider_string(value)
            etype = _enhancement_type(value)

            # Skip explicit "none" enhancements without a provider.
            if etype == "none" and not raw_provider:
                continue
            if not raw_provider:
                continue

            normalised = _normalise(raw_provider)
            if normalised:
                canonical, ptype = normalised
            else:
                canonical = raw_provider
                # Fall back to the enhancement-type hint if available.
                ptype = _ENHANCEMENT_TYPE_ROLE.get(etype or "", "unknown")

            key = (canonical, field)
            if key in seen:
                continue
            seen.add(key)

            mentions.append({
                "provider_name": canonical,
                "provider_type": ptype,
                "source_field": field,
                "raw_value": raw_provider,
                "enhancement_type": etype,
                **bond_meta,
            })

        return mentions

    def upsert_provider_contacts(self, mentions: list[dict]) -> dict:
        """For each unique provider in `mentions`, find-or-create a
        firm Contact and update its `emma_track_record` aggregates.

        Idempotent. Returns:
          {contacts_created, contacts_updated, contacts_skipped,
           providers: {name: contact_id_or_null}}
        """
        summary = {
            "contacts_created": 0,
            "contacts_updated": 0,
            "contacts_skipped": 0,
            "providers": {},
            "warnings": [],
        }

        # Group mentions by canonical provider name.
        grouped: dict[str, list[dict]] = {}
        for m in mentions:
            grouped.setdefault(m["provider_name"], []).append(m)

        for provider_name, group in grouped.items():
            ptype = group[0]["provider_type"]
            track_record = _build_track_record(group)
            serves_as = _serves_as_for(ptype)

            ext_id = _external_id_for(provider_name)
            existing = self._safe_get_by_external_id(ext_id)

            payload = {
                "external_id": ext_id,
                "type": "firm",
                "name": provider_name,
                "firm_type": ptype,
                "serves_as": serves_as,
                "tags": ["surety_universe", f"category::{ptype}"],
                "background_notes": _serialise_track_record(
                    provider_name, ptype, track_record
                ),
            }

            if existing:
                # Merge prior track_record (if it round-trips through
                # background_notes) with the new one for honest counters.
                prior = _parse_track_record(existing.get("background_notes"))
                merged = _merge_track_records(prior, track_record)
                payload["background_notes"] = _serialise_track_record(
                    provider_name, ptype, merged
                )
                row = self.contacts.update_contact(existing["id"], payload)
                if row:
                    summary["contacts_updated"] += 1
                    summary["providers"][provider_name] = row.get("id")
                else:
                    summary["contacts_skipped"] += 1
                    summary["warnings"].append(
                        f"update failed for '{provider_name}'"
                    )
            else:
                try:
                    row = self.contacts.create_contact(payload)
                except ValueError as e:
                    summary["contacts_skipped"] += 1
                    summary["warnings"].append(
                        f"create failed for '{provider_name}': {e}"
                    )
                    continue
                if row:
                    summary["contacts_created"] += 1
                    summary["providers"][provider_name] = row.get("id")
                else:
                    # DB not configured — log but don't fail.
                    summary["contacts_skipped"] += 1
                    summary["providers"][provider_name] = None

        return summary

    def scan_emma_seed(self) -> dict:
        """Scan the in-memory SEED_BONDS, extract every provider
        mention, upsert Contacts. Idempotent."""
        # Lazy import to avoid circulars at module load.
        from services.emma_seed_data import SEED_BONDS

        all_mentions: list[dict] = []
        bonds_without_enhancement: list[str] = []

        for bond in SEED_BONDS:
            extracted = self.extract_provider_mentions(bond)
            if not extracted:
                bonds_without_enhancement.append(bond.get("cusip", "?"))
            all_mentions.extend(extracted)

        # Group for the per-provider summary.
        mentions_by_provider: dict[str, int] = {}
        sample_deals_per_provider: dict[str, list[str]] = {}
        for m in all_mentions:
            name = m["provider_name"]
            mentions_by_provider[name] = mentions_by_provider.get(name, 0) + 1
            sample_deals_per_provider.setdefault(name, [])
            label = f"{m.get('bond_borrower')} ({m.get('bond_state')})"
            if label not in sample_deals_per_provider[name]:
                sample_deals_per_provider[name].append(label)

        upsert = self.upsert_provider_contacts(all_mentions)

        return {
            "scanned_at": datetime.utcnow().isoformat(),
            "source": "SEED_BONDS",
            "bonds_scanned": len(SEED_BONDS),
            "bonds_without_enhancement": bonds_without_enhancement,
            "providers_detected": len(mentions_by_provider),
            "total_mentions": len(all_mentions),
            "mentions_by_provider": mentions_by_provider,
            "sample_deals_per_provider": sample_deals_per_provider,
            "contacts_created": upsert["contacts_created"],
            "contacts_updated": upsert["contacts_updated"],
            "contacts_skipped": upsert["contacts_skipped"],
            "warnings": upsert["warnings"],
        }

    def scan_emma_live(
        self, query_filters: Optional[dict] = None
    ) -> dict:
        """Scan live EMMA via the EMMAPlugin. Degrades gracefully when
        the plugin lacks an API key."""
        query_filters = query_filters or {}
        # EMMA public search is technically open, but the plugin's
        # `requires_key` is EMMA_API_KEY. Per the spec we honour
        # `is_configured()` strictly.
        import os
        if not os.getenv("EMMA_API_KEY"):
            log.warning("scan_emma_live: EMMA_API_KEY not set, returning fallback")
            return {
                "status": "EMMA_PLUGIN_NOT_CONFIGURED",
                "fallback": "seed_only",
                "scanned_at": datetime.utcnow().isoformat(),
            }

        issuer = query_filters.get("issuer") or query_filters.get("keyword") or ""
        cusip = query_filters.get("cusip") or ""
        try:
            result = self._emma.execute(issuer=issuer, cusip=cusip)
        except Exception as e:
            log.warning("scan_emma_live: EMMAPlugin.execute failed: %s", e)
            return {
                "status": "EMMA_QUERY_FAILED",
                "error": str(e),
                "fallback": "seed_only",
                "scanned_at": datetime.utcnow().isoformat(),
            }

        if not result.get("success"):
            return {
                "status": "EMMA_QUERY_FAILED",
                "error": result.get("error"),
                "fallback": "seed_only",
                "scanned_at": datetime.utcnow().isoformat(),
            }

        # Normalise live EMMA payload to a list of bond-like dicts
        # we can run through extract_provider_mentions.
        data = result.get("data") or {}
        if isinstance(data, list):
            records = data
        elif isinstance(data, dict):
            records = (
                data.get("results")
                or data.get("items")
                or data.get("issues")
                or []
            )
            if not records and data:
                records = [data]
        else:
            records = []

        all_mentions: list[dict] = []
        for rec in records:
            if isinstance(rec, dict):
                all_mentions.extend(self.extract_provider_mentions(rec))

        upsert = self.upsert_provider_contacts(all_mentions)

        return {
            "status": "ok",
            "scanned_at": datetime.utcnow().isoformat(),
            "source": "EMMA_live",
            "records_scanned": len(records),
            "providers_detected": len({m["provider_name"] for m in all_mentions}),
            "total_mentions": len(all_mentions),
            "contacts_created": upsert["contacts_created"],
            "contacts_updated": upsert["contacts_updated"],
            "contacts_skipped": upsert["contacts_skipped"],
            "warnings": upsert["warnings"],
        }

    def list_universe(
        self,
        category: Optional[str] = None,
        sector: Optional[str] = None,
        state: Optional[str] = None,
    ) -> list[dict]:
        """Return the current universe — firms tagged `surety_universe`.

        Filters:
          category: surety_carrier | bond_insurer | loc_bank |
                    federal_guarantee | state_credit | surety_broker
          sector:   filter by sector in the track-record JSON
          state:    filter by state in the track-record JSON
        """
        rows = self.contacts.find_contacts({"tag": "surety_universe"}) or []

        out: list[dict] = []
        for row in rows:
            ftype = row.get("firm_type")
            if category and ftype != category:
                continue
            tr = _parse_track_record(row.get("background_notes"))
            if sector and sector not in (tr.get("sectors") or []):
                continue
            if state and state not in (tr.get("states") or []):
                continue
            out.append({
                "id": row.get("id"),
                "external_id": row.get("external_id"),
                "name": row.get("name"),
                "firm_type": ftype,
                "serves_as": row.get("serves_as") or [],
                "emma_track_record": tr,
            })
        return out

    def relationship_graph(self) -> dict:
        """Count co-appearances between each provider and the bond
        counsel firms, trustees, and financial advisors that appear
        on the same EMMA bonds."""
        from services.emma_seed_data import SEED_BONDS

        provider_partners: dict[str, dict[str, dict[str, int]]] = {}

        for bond in SEED_BONDS:
            mentions = self.extract_provider_mentions(bond)
            if not mentions:
                continue
            cps = bond.get("counterparties") or {}
            bc = cps.get("bond_counsel")
            tr = cps.get("trustee")
            fa = cps.get("financial_advisor")

            for m in mentions:
                name = m["provider_name"]
                bucket = provider_partners.setdefault(name, {
                    "bond_counsels": {}, "trustees": {}, "financial_advisors": {},
                })
                if bc:
                    bucket["bond_counsels"][bc] = bucket["bond_counsels"].get(bc, 0) + 1
                if tr:
                    bucket["trustees"][tr] = bucket["trustees"].get(tr, 0) + 1
                if fa:
                    bucket["financial_advisors"][fa] = bucket["financial_advisors"].get(fa, 0) + 1

        # Pick top-3 per category.
        def _top(counts: dict[str, int], n: int = 3) -> list[dict]:
            ranked = sorted(counts.items(), key=lambda kv: -kv[1])
            return [{"name": k, "count": v} for k, v in ranked[:n]]

        return {
            "generated_at": datetime.utcnow().isoformat(),
            "provider_count": len(provider_partners),
            "graph": {
                name: {
                    "top_bond_counsels": _top(b["bond_counsels"]),
                    "top_trustees": _top(b["trustees"]),
                    "top_financial_advisors": _top(b["financial_advisors"]),
                }
                for name, b in provider_partners.items()
            },
        }

    # — internals —

    def _safe_get_by_external_id(self, ext_id: str) -> Optional[dict]:
        try:
            return self.contacts.get_by_external_id(ext_id)
        except Exception as e:
            log.warning("get_by_external_id failed for %s: %s", ext_id, e)
            return None


# ── module-level helpers ─────────────────────────────────────

def _year_from(date_str: Optional[str]) -> Optional[int]:
    if not date_str or not isinstance(date_str, str):
        return None
    try:
        return int(date_str[:4])
    except ValueError:
        return None


def _serves_as_for(ptype: str) -> list[str]:
    role = _TYPE_TO_SERVES_AS.get(ptype, "credit_enhancer")
    return [role]


def _build_track_record(mentions: list[dict]) -> dict:
    """Aggregate per-provider statistics from a list of mentions."""
    pars = [m["bond_par_amount"] for m in mentions
            if isinstance(m.get("bond_par_amount"), (int, float))]
    sectors = sorted({m["bond_sector"] for m in mentions
                      if m.get("bond_sector")})
    states = sorted({m["bond_state"] for m in mentions
                     if m.get("bond_state")})
    years = sorted({m["bond_year"] for m in mentions
                    if m.get("bond_year")})

    appearances = []
    for m in mentions:
        appearances.append({
            "cusip": m.get("bond_cusip"),
            "borrower": m.get("bond_borrower"),
            "state": m.get("bond_state"),
            "sector": m.get("bond_sector"),
            "par_amount": m.get("bond_par_amount"),
            "year": m.get("bond_year"),
            "source_field": m.get("source_field"),
        })

    return {
        "mention_count": len(mentions),
        "sectors": sectors,
        "states": states,
        "years": years,
        "par_range_min": min(pars) if pars else None,
        "par_range_max": max(pars) if pars else None,
        "recent_appearances": appearances[:20],
    }


def _merge_track_records(prior: dict, new: dict) -> dict:
    """Idempotent merge — counts replace (we re-derive from a full
    scan), but lists are unioned to preserve history if a prior
    scan included bonds we no longer see."""
    if not prior:
        return new

    def _u(a: Iterable, b: Iterable) -> list:
        seen, out = set(), []
        for x in list(a or []) + list(b or []):
            key = json.dumps(x, sort_keys=True, default=str) if isinstance(x, dict) else str(x)
            if key not in seen:
                seen.add(key)
                out.append(x)
        return out

    merged = {
        "mention_count": max(
            int(new.get("mention_count") or 0),
            int(prior.get("mention_count") or 0),
        ),
        "sectors": sorted(set((prior.get("sectors") or []) + (new.get("sectors") or []))),
        "states": sorted(set((prior.get("states") or []) + (new.get("states") or []))),
        "years": sorted(set((prior.get("years") or []) + (new.get("years") or []))),
        "par_range_min": _min_opt(prior.get("par_range_min"), new.get("par_range_min")),
        "par_range_max": _max_opt(prior.get("par_range_max"), new.get("par_range_max")),
        "recent_appearances": _u(new.get("recent_appearances"),
                                 prior.get("recent_appearances"))[:20],
    }
    return merged


def _min_opt(a, b):
    vals = [v for v in (a, b) if v is not None]
    return min(vals) if vals else None


def _max_opt(a, b):
    vals = [v for v in (a, b) if v is not None]
    return max(vals) if vals else None


_TRACK_PREFIX = "EMMA_TRACK_RECORD::"


def _serialise_track_record(name: str, ptype: str, track: dict) -> str:
    """Fold the track record into background_notes as a
    parseable JSON blob that round-trips. We prefix with a
    sentinel so casual readers can see what it is.
    """
    payload = {
        "provider_name": name,
        "provider_type": ptype,
        "track_record": track,
    }
    return _TRACK_PREFIX + json.dumps(payload, default=str)


def _parse_track_record(notes: Optional[str]) -> dict:
    if not notes or not isinstance(notes, str):
        return {}
    # Notes may have other content appended; pull the prefix.
    idx = notes.find(_TRACK_PREFIX)
    if idx < 0:
        return {}
    blob = notes[idx + len(_TRACK_PREFIX):]
    # Strip anything that looks like a trailing pipe-separator (the
    # contacts seed loader sometimes glues "| key: value" onto notes).
    cut = blob.find(" | ")
    if cut > 0:
        blob = blob[:cut]
    try:
        parsed = json.loads(blob)
        return parsed.get("track_record") or {}
    except (json.JSONDecodeError, ValueError):
        return {}


# Singleton used by route layer
surety_universe = SuretyUniverseService()
