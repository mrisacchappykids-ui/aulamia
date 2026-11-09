import os
import re
import tempfile
import shutil
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent

def resolve_data_dir() -> Path:
    """
    Retorna el directorio de datos garantizando permisos de escritura.
    En entornos serverless (como Vercel o AWS Lambda) donde /var/task es de solo lectura,
    utiliza el directorio temporal del sistema (/tmp/aulamia_data) inicializado con los
    archivos JSON base.
    """
    base_data = BASE_DIR / "data"
    test_file = base_data / ".write_test"
    try:
        base_data.mkdir(parents=True, exist_ok=True)
        test_file.touch(exist_ok=True)
        test_file.unlink(missing_ok=True)
        return base_data
    except (OSError, PermissionError):
        tmp_data = Path(tempfile.gettempdir()) / "aulamia_data"
        tmp_data.mkdir(parents=True, exist_ok=True)
        if base_data.exists():
            for src_file in base_data.glob("*.json"):
                dest_file = tmp_data / src_file.name
                if not dest_file.exists():
                    try:
                        shutil.copy2(src_file, dest_file)
                    except Exception as e:
                        print(f"Warning copying {src_file} to tmp: {e}")
        return tmp_data

DATA_DIR = resolve_data_dir()

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
