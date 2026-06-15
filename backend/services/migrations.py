"""
NEST Auto-Migration Runner
Runs on Flask startup. Reads SQL files from backend/migrations/ in order.
Requires SUPABASE_DB_URL env var (direct PostgreSQL connection string from Supabase).
Fails silently so it never breaks the app — but logs warnings.
"""
import os
import glob
import logging

logger = logging.getLogger(__name__)

_MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), "..", "migrations")


def _get_connection():
    url = os.getenv("SUPABASE_DB_URL") or os.getenv("DATABASE_URL")
    if not url:
        return None
    try:
        import psycopg2
        return psycopg2.connect(url, connect_timeout=8, sslmode="require")
    except Exception as e:
        logger.warning("Migration: could not connect to DB — %s", e)
        return None


def _ensure_migrations_table(cur):
    cur.execute("""
        CREATE TABLE IF NOT EXISTS _nest_migrations (
            id SERIAL PRIMARY KEY,
            filename TEXT UNIQUE NOT NULL,
            ran_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)


def run_migrations():
    """
    Run any SQL migration files in backend/migrations/ that haven't been applied yet.
    Files are named NNN_description.sql and run in numeric order.
    Idempotent — safe to call on every startup.
    """
    conn = _get_connection()
    if not conn:
        logger.info("Migration: SUPABASE_DB_URL not set — skipping auto-migration")
        return 0

    ran = 0
    try:
        conn.autocommit = False
        with conn.cursor() as cur:
            _ensure_migrations_table(cur)
            conn.commit()

            files = sorted(glob.glob(os.path.join(_MIGRATIONS_DIR, "*.sql")))
            for path in files:
                filename = os.path.basename(path)
                cur.execute("SELECT 1 FROM _nest_migrations WHERE filename = %s", (filename,))
                if cur.fetchone():
                    continue  # already applied

                logger.info("Migration: applying %s", filename)
                with open(path, "r", encoding="utf-8") as f:
                    sql = f.read()

                try:
                    cur.execute(sql)
                    cur.execute(
                        "INSERT INTO _nest_migrations (filename) VALUES (%s) ON CONFLICT DO NOTHING",
                        (filename,)
                    )
                    conn.commit()
                    ran += 1
                    logger.info("Migration: %s applied ✓", filename)
                except Exception as e:
                    conn.rollback()
                    logger.error("Migration: %s FAILED — %s", filename, e)

    except Exception as e:
        logger.error("Migration runner error: %s", e)
    finally:
        conn.close()

    return ran
