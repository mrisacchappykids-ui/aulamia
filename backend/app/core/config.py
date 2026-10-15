import os
import re
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

load_dotenv(BASE_DIR / ".env")

PROJECT_NAME = "AulaMIA API"
VERSION = "0.1.0"
DESCRIPTION = "Backend API para AulaMIA - Asistente Pedagógico Contextual con Inteligencia Artificial"

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "https://aulamia-76ay.vercel.app",
    "https://*.vercel.app"
]

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
    url = re.sub(r"[?&]supa=[^&]+", "", url)
    url = re.sub(r"[?&]pgbouncer=[^&]+", "", url)

    # Ensure sslmode=require is preserved if not present
    if "sslmode=" not in url and ("supabase.co" in url or "pooler.supabase.com" in url):
        sep = "&" if "?" in url else "?"
        url += f"{sep}sslmode=require"

    return url

DATABASE_URL = get_database_url()
