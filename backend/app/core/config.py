import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
SEED_DATA_DIR = BASE_DIR / "data"
load_dotenv(BASE_DIR / ".env")

SERVERLESS = bool(
    os.getenv("VERCEL") or os.getenv("VERCEL_ENV") or os.getenv("AWS_LAMBDA_FUNCTION_NAME")
    or BASE_DIR.is_relative_to("/var/task")
)
DATA_DIR = Path(os.getenv("AULAMIA_DATA_DIR") or SEED_DATA_DIR)
LEGACY_USERS_FILE = Path(os.getenv("AULAMIA_LEGACY_USERS_FILE") or DATA_DIR / "users.json")

PROJECT_NAME = "AulaMIA API"
VERSION = "0.1.0"
DESCRIPTION = "Backend API para AulaMIA - Asistente Pedagógico Contextual con Inteligencia Artificial"

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "https://aulamia-pi.vercel.app",
    "https://aulamia.vercel.app",
]
CORS_ORIGINS.extend(origin.strip() for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin.strip())

def get_database_url() -> str:
    """Obtiene y normaliza la URL de conexión a PostgreSQL (Supabase)."""
    raw_url = (
        os.getenv("STORAGE_POSTGRES_URL")
        or os.getenv("POSTGRES_URL")
        or os.getenv("STORAGE_POSTGRES_PRISMA_URL")
        or os.getenv("STORAGE_POSTGRES_URL_NON_POOLING")
        or os.getenv("DATABASE_URL")
        or ""
    )
    if not raw_url:
        return ""

    url = raw_url.strip().strip('"').strip("'")
    if url.startswith("postgres://"):
        url = "postgresql+psycopg2://" + url[len("postgres://"):]
    elif url.startswith("postgresql://") and not url.startswith("postgresql+psycopg2://"):
        url = "postgresql+psycopg2://" + url[len("postgresql://"):]

    # Remove parameters that psycopg2/libpq does not recognize
    base, separator, query = url.partition("?")
    params = [part for part in query.split("&") if part and part.partition("=")[0] not in {"supa", "pgbouncer"}]
    url = base + ("?" + "&".join(params) if separator and params else "")

    # Ensure sslmode=require is preserved if not present
    if "sslmode=" not in url and ("supabase.co" in url or "pooler.supabase.com" in url):
        sep = "&" if "?" in url else "?"
        url += f"{sep}sslmode=require"

    return url

DATABASE_URL = "" if not SERVERLESS and os.getenv("AULAMIA_USE_SQLITE") == "1" else get_database_url()
