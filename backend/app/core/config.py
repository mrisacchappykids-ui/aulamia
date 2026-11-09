import os
import re
import tempfile
import shutil
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
SEED_DATA_DIR = BASE_DIR / "data"

def resolve_data_dir() -> Path:
    """
    Retorna un directorio de datos con permisos de ESCRITURA y LECTURA garantizados.
    En entornos serverless (Vercel, AWS Lambda, Docker sin root, o /var/task),
    copia los archivos JSON originales a /tmp/aulamia_data y retorna esa ruta para
    que todas las lecturas y escrituras se hagan sobre la misma ruta con permisos totales.
    """
    base_data = BASE_DIR / "data"

    is_serverless = (
        bool(os.getenv("VERCEL"))
        or bool(os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
        or "/var/task" in str(BASE_DIR)
        or not os.access(str(BASE_DIR), os.W_OK)
    )

    if is_serverless:
        tmp_data = Path(tempfile.gettempdir()) / "aulamia_data"
        tmp_data.mkdir(parents=True, exist_ok=True)
        if base_data.exists():
            for src_file in base_data.glob("*.json"):
                dest_file = tmp_data / src_file.name
                if not dest_file.exists():
                    try:
                        shutil.copy2(src_file, dest_file)
                    except Exception as e:
                        print(f"Error copying {src_file.name} to tmp: {e}")
        return tmp_data

    try:
        base_data.mkdir(parents=True, exist_ok=True)
        test_file = base_data / ".write_test"
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
                    except Exception:
                        pass
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
    "https://aulamia-hrokwejal-mr-isaacc.vercel.app",
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
