"""
NEST Surveillance Desk Routes — Portfolio monitoring, refunding identification,
risk re-rating, restructuring, and workout support.
"""
from flask import Blueprint, jsonify
from datetime import datetime

surveillance_bp = Blueprint("surveillance", __name__)


def _ok(data, code=200):
    return jsonify({
        "success": True,
        "data": data,
        "error": None,
        "timestamp": datetime.utcnow().isoformat(),
    }), code


@surveillance_bp.get("/pipeline")
def get_refunding_pipeline():
    """Return current refunding candidates with NPV savings analysis."""
    pipeline = [
        {
            "cusip": "34077EAA1",
            "name": "Jacaranda Trace 2025",
            "current_rate": 5.75,
            "market_rate": 4.85,
            "call_date": "2035-03-01",
            "par_outstanding": 231_000_000,
            "npv_savings": 8_200_000,
            "refunding_score": 0.82,
            "recommendation": "MONITOR",
            "dscr": 1.42,
            "sector": "senior_living",
            "state": "FL",
        },
        {
            "cusip": "NEST-DC-001",
            "name": "Dominion Edge Data Centers 2024",
            "current_rate": 5.25,
            "market_rate": 4.60,
            "call_date": "2034-08-01",
            "par_outstanding": 120_000_000,
            "npv_savings": 4_100_000,
            "refunding_score": 0.68,
            "recommendation": "WATCH",
            "dscr": 1.89,
            "sector": "data_centers",
            "state": "VA",
        },
    ]
    return _ok(pipeline)
