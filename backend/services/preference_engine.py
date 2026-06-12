"""
NEST Preference Engine — Self-learning consumer preference tracker.

Records client interactions with exponential time decay → computes affinity
scores → improves suggestions as more signals arrive. Accepted/rejected
suggestions feed back into the weights.
"""
from __future__ import annotations

import math
import time

# ---------------------------------------------------------------------------
# Product catalog
# ---------------------------------------------------------------------------
NEST_PRODUCTS: dict[str, dict] = {
    "bond_series_a":     {"label": "Series A Bond (75% LTC)",        "category": "structuring",   "href": "/bond-desk"},
    "bond_series_b":     {"label": "Series B Mezzanine (82% CLTV)",  "category": "structuring",   "href": "/bond-desk"},
    "credit_rating":     {"label": "Credit Rating Path",             "category": "credit",        "href": "/credit"},
    "hylant_surety":     {"label": "Hylant Surety / LC Enhancement", "category": "insurance",     "href": "/surety"},
    "hft_fund":          {"label": "HFT Fund (Quantum Agent)",       "category": "fund",          "href": "/institutional"},
    "ma_intelligence":   {"label": "M&A Intelligence (Merlin)",      "category": "ma",            "href": "/eagleeye"},
    "lender_scout":      {"label": "Direct Lender Sourcing",         "category": "placement",     "href": "/lenders"},
    "eagleeye":          {"label": "EagleEye CRE Intelligence",      "category": "intelligence",  "href": "/eagleeye"},
    "covenant_monitor":  {"label": "Covenant Monitoring",            "category": "admin",         "href": "/covenants"},
    "construction_loan": {"label": "Construction Loan Management",   "category": "structuring",   "href": "/construction"},
    "bridge_monitor":    {"label": "Perm Debt Bridge Monitor",       "category": "admin",         "href": "/surveillance"},
    "nisle_engine":      {"label": "NISLE Dynamic Pricing Engine",   "category": "intelligence",  "href": "/nisle"},
}

# Property type → product affinity baseline weights (0–1)
PROPERTY_AFFINITIES: dict[str, dict[str, float]] = {
    "multifamily":    {"bond_series_a": 0.92, "credit_rating": 0.80, "hylant_surety": 0.75, "lender_scout": 0.70, "nisle_engine": 0.60},
    "commercial":     {"bond_series_a": 0.80, "bond_series_b": 0.70, "credit_rating": 0.90, "nisle_engine": 0.72, "covenant_monitor": 0.60},
    "industrial":     {"bond_series_a": 0.72, "lender_scout": 0.82, "bridge_monitor": 0.68, "nisle_engine": 0.60},
    "retail":         {"bond_series_a": 0.70, "credit_rating": 0.80, "nisle_engine": 0.78, "covenant_monitor": 0.68},
    "construction":   {"construction_loan": 0.95, "bond_series_a": 0.82, "bond_series_b": 0.70, "hylant_surety": 0.90, "hft_fund": 0.60},
    "mixed_use":      {"bond_series_a": 0.80, "bond_series_b": 0.62, "credit_rating": 0.72, "lender_scout": 0.70},
    "land":           {"construction_loan": 0.80, "eagleeye": 0.90, "ma_intelligence": 0.82, "hylant_surety": 0.70},
    "hotel":          {"bond_series_a": 0.70, "credit_rating": 0.88, "nisle_engine": 0.80, "covenant_monitor": 0.70},
    "office":         {"bond_series_a": 0.62, "credit_rating": 0.90, "nisle_engine": 0.88, "bridge_monitor": 0.72},
    "business":       {"ma_intelligence": 0.95, "eagleeye": 0.90, "credit_rating": 0.72, "hft_fund": 0.62},
    "portfolio":      {"hft_fund": 0.90, "ma_intelligence": 0.82, "nisle_engine": 0.80, "bond_series_b": 0.72},
    "unknown":        {"eagleeye": 0.68, "nisle_engine": 0.60, "credit_rating": 0.58},
}

# How quickly recent signals outweigh old ones (7-day half-life)
_HALF_LIFE_SECS: float = 7 * 86_400


class PreferenceEngine:
    """
    Per-client affinity scorer with exponential time decay + feedback loop.

    score(product) = Σ weight_i × exp(−λ × age_i)  +  Σ feedback_adj
    """

    def __init__(self) -> None:
        # {client_id → {product_id → [(timestamp, weight)]}}
        self._events: dict[str, dict[str, list[tuple[float, float]]]] = {}
        # {client_id → {product_id → cumulative_adjustment}}
        self._feedback: dict[str, dict[str, float]] = {}
        # {client_id → [photo_analysis_dict]}
        self._photos: dict[str, list[dict]] = {}

    # ------------------------------------------------------------------
    # Recording
    # ------------------------------------------------------------------

    def record_event(
        self, client_id: str, product_id: str, weight: float = 1.0
    ) -> None:
        """Record one client interaction with a product / page."""
        bucket = self._events.setdefault(client_id, {})
        bucket.setdefault(product_id, []).append((time.time(), max(0.0, weight)))

    def record_feedback(
        self, client_id: str, product_id: str, accepted: bool
    ) -> None:
        """
        Record whether a suggestion was acted on.
        Accepted → +0.5 boost; rejected → −0.3 penalty.
        """
        adj = 0.5 if accepted else -0.3
        bucket = self._feedback.setdefault(client_id, {})
        bucket[product_id] = bucket.get(product_id, 0.0) + adj

    def record_photo_analysis(self, client_id: str, result: dict) -> None:
        """
        Store a vision analysis result and auto-record weak events for the
        top suggestions so the preference profile reflects photo signals.
        """
        self._photos.setdefault(client_id, []).append(
            {"ts": time.time(), **result}
        )
        for s in result.get("suggestions", [])[:3]:
            pid = s.get("product_id")
            if pid and pid in NEST_PRODUCTS:
                self.record_event(client_id, pid, weight=s.get("confidence", 0.5) * 0.6)

    # ------------------------------------------------------------------
    # Scoring
    # ------------------------------------------------------------------

    def _decayed_score(self, events: list[tuple[float, float]]) -> float:
        lam = math.log(2) / _HALF_LIFE_SECS
        now = time.time()
        return sum(w * math.exp(-lam * (now - ts)) for ts, w in events)

    def scores(self, client_id: str) -> dict[str, float]:
        raw: dict[str, float] = {
            pid: self._decayed_score(evts)
            for pid, evts in self._events.get(client_id, {}).items()
        }
        for pid, adj in self._feedback.get(client_id, {}).items():
            raw[pid] = raw.get(pid, 0.0) + adj
        for pid in NEST_PRODUCTS:
            raw.setdefault(pid, 0.0)
        return raw

    def top_suggestions(self, client_id: str, n: int = 6) -> list[dict]:
        sc = self.scores(client_id)
        ranked = sorted(sc.items(), key=lambda x: x[1], reverse=True)
        return [
            {
                "product_id": pid,
                "label":      NEST_PRODUCTS[pid]["label"],
                "category":   NEST_PRODUCTS[pid]["category"],
                "href":       NEST_PRODUCTS[pid]["href"],
                "score":      round(score, 3),
                "confidence": round(min(score / 3.0, 1.0), 2),
            }
            for pid, score in ranked[:n]
            if score > 0.0
        ]

    def photo_history(self, client_id: str) -> list[dict]:
        return self._photos.get(client_id, [])

    def profile(self, client_id: str) -> dict:
        sc = self.scores(client_id)
        top = self.top_suggestions(client_id, 8)
        total_events = sum(
            len(v) for v in self._events.get(client_id, {}).values()
        )
        photo_count = len(self._photos.get(client_id, []))

        # Infer dominant category
        cats: dict[str, float] = {}
        for s in top:
            cats[s["category"]] = cats.get(s["category"], 0.0) + s["score"]
        primary_category = max(cats, key=lambda k: cats[k]) if cats else "unknown"

        signal_count = total_events + photo_count * 3
        if signal_count < 5:
            stage = "cold_start"
        elif signal_count < 20:
            stage = "learning"
        elif signal_count < 50:
            stage = "calibrated"
        else:
            stage = "optimized"

        return {
            "client_id":        client_id,
            "primary_category": primary_category,
            "top_suggestions":  top,
            "event_count":      total_events,
            "photo_count":      photo_count,
            "learning_stage":   stage,
            "signal_count":     signal_count,
        }


# Singleton — imported by routes/preferences.py
preference_engine = PreferenceEngine()
