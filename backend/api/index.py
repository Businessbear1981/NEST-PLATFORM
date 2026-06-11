"""Vercel serverless entry point — wraps the Flask app."""
import sys
import os
import traceback

# Ensure backend root is on path
_backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)

# Disable SocketIO ticker and gevent for serverless
os.environ["VERCEL"] = "1"

_import_error = None
try:
    from app import app
except Exception as _e:
    _import_error = traceback.format_exc()
    # Create a minimal fallback app to expose the error
    from flask import Flask, jsonify
    app = Flask(__name__)

    @app.route("/api/health")
    def health():
        return jsonify({"ok": False, "error": _import_error}), 500

    @app.route("/api/debug")
    def debug():
        return jsonify({"ok": False, "error": _import_error, "python": sys.version, "path": sys.path}), 500
