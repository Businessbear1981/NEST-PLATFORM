"""Risk assessment routes — sentinel.score_deal + risk reports + covenant tests."""
from flask import Blueprint, request
from services.core import risk, credit, ok, err
from services.auth import require_auth

risk_bp = Blueprint("risk", __name__)


@risk_bp.get("/score/<deal_id>")
def score_deal(deal_id):
    from routes.deals import _deals, _lock
    with _lock:
        deal = _deals.get(deal_id)
    if not deal:
        return err("Deal not found", 404)
    project = deal.get("project", {})
    metrics = credit.compute(project)
    result = risk.score_deal(project, metrics)
    result["deal_id"] = deal_id
    result["deal_name"] = deal.get("name", deal_id)
    return ok(result)


@risk_bp.get("/portfolio")
def portfolio_risk():
    from routes.deals import _deals, _lock
    with _lock:
        deals = dict(_deals)
    results = []
    for did, deal in deals.items():
        project = deal.get("project", {})
        metrics = credit.compute(project)
        r = risk.score_deal(project, metrics)
        r["deal_id"] = did
        r["deal_name"] = deal.get("name", did)
        results.append(r)
    results.sort(key=lambda x: x["composite_score"])
    alerts = [r for r in results if r["risk_level"] in ("red", "critical")]
    green_count = sum(1 for r in results if r["risk_level"] == "green")
    yellow_count = sum(1 for r in results if r["risk_level"] == "yellow")

    # Sensible defaults when no deals exist yet
    if not results:
        return ok({
            "deals": [],
            "alerts": [],
            "total": 0,
            "green_count": 0,
            "yellow_count": 0,
            "alert_count": 0,
            "portfolio_composite_score": 0,
            "portfolio_risk_level": "green",
            "dimension_averages": {
                "market":        {"score": 65, "level": "yellow"},
                "construction":  {"score": 70, "level": "green"},
                "credit":        {"score": 70, "level": "green"},
                "operational":   {"score": 75, "level": "green"},
                "regulatory":    {"score": 70, "level": "green"},
                "sponsor":       {"score": 70, "level": "green"},
                "environmental": {"score": 80, "level": "green"},
            },
        })

    # Aggregate dimension averages across all deals
    dim_keys = ["market", "construction", "credit", "operational", "regulatory", "sponsor", "environmental"]
    dim_totals = {k: 0 for k in dim_keys}
    for r in results:
        for k in dim_keys:
            dim_totals[k] += r.get("dimension_scores", {}).get(k, {}).get("score", 0)
    n = len(results)
    dim_averages = {}
    for k in dim_keys:
        avg = round(dim_totals[k] / n, 1)
        dim_averages[k] = {
            "score": avg,
            "level": "green" if avg >= 70 else "yellow" if avg >= 45 else "red",
        }

    portfolio_composite = round(sum(r["composite_score"] for r in results) / n, 1)
    portfolio_level = "green" if portfolio_composite >= 70 else "yellow" if portfolio_composite >= 45 else "red"

    return ok({
        "deals": results,
        "alerts": alerts,
        "total": len(results),
        "green_count": green_count,
        "yellow_count": yellow_count,
        "alert_count": len(alerts),
        "portfolio_composite_score": portfolio_composite,
        "portfolio_risk_level": portfolio_level,
        "dimension_averages": dim_averages,
    })


@risk_bp.post("/covenant-test")
@require_auth()
def covenant_test():
    data = request.get_json(force=True)
    deal_id = data.get("deal_id")
    metric = data.get("metric")
    value = data.get("value")
    threshold = data.get("threshold")
    if not all([deal_id, metric, value is not None, threshold is not None]):
        return err("deal_id, metric, value, threshold required")
    passed = value >= threshold if metric in ("dscr", "icr") else value <= threshold
    from blockchain.nest_chain import chain
    tx = chain.record_covenant_test(deal_id, metric, value, threshold, passed)
    return ok({"deal_id": deal_id, "metric": metric, "value": value,
               "threshold": threshold, "passed": passed, "tx": tx})
