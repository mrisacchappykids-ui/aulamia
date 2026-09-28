import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

load_dotenv(BASE_DIR / ".env")

PROJECT_NAME = "AulaMIA API"
VERSION = "0.1.0"
DESCRIPTION = "Backend API para AulaMIA - Asistente Pedagógico Contextual con Inteligencia Artificial"

# Optional Gemini API key if user wants to use live LLM
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
]
