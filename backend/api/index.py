"""Vercel serverless entry point — wraps the Flask app."""
import sys
import os
import traceback as _tb

# Ensure backend root is on path
_backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)

os.environ["VERCEL"] = "1"

# Top-level `app` required by Vercel's static analyser — overwritten below.
from flask import Flask as _Flask, jsonify as _jsonify
app = _Flask(__name__)
_import_error = None

try:
    import importlib as _il
    _mod = _il.import_module("app")
    app = _mod.app
except Exception:
    _import_error = _tb.format_exc()

    @app.route("/api/health")
    def _health():
        return _jsonify({"ok": False, "error": _import_error}), 500

    @app.route("/api/debug")
    def _debug():
        return _jsonify({"ok": False, "error": _import_error,
                         "python": sys.version, "path": sys.path}), 500
