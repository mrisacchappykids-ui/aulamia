import json
import uuid
import hashlib
import os
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path
import tempfile
from app.core.config import DATA_DIR, BASE_DIR
from app.models.schemas import UserRegisterRequest, UserLoginRequest, UserResponse, AuthResponse, GoogleAuthRequest

USERS_FILE = DATA_DIR / "users.json"

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    """Genera hash seguro de contraseña usando PBKDF2-HMAC-SHA256."""
    if not salt:
        salt = os.urandom(16).hex()
    pwd_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(salt),
        100000
    ).hex()
    return pwd_hash, salt

def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    """Verifica si la contraseña ingresada coincide con el hash guardado."""
    new_hash, _ = hash_password(password, salt)
    return new_hash == stored_hash

def get_default_users() -> List[Dict[str, Any]]:
    """Usuario demo precargado para pruebas pedagógicas."""
    demo_hash, demo_salt = hash_password("docente123")
    return [
        {
            "id": "usr-demo-docente",
            "name": "Profesor Demo AulaMIA",
            "email": "profesor@aulamia.edu.co",
            "password_hash": demo_hash,
            "salt": demo_salt,
            "institution": "Colegio San José - Sede Principal",
            "specialty": "Docente de Primaria y Tecnología",
            "role": "Docente",
            "created_at": datetime.now().isoformat()
        }
    ]

def load_users() -> List[Dict[str, Any]]:
    """Carga los usuarios desde el archivo JSON local con soporte para entornos serverless."""
    global USERS_FILE
    target_path = USERS_FILE
    # Si no existe en la ruta actual, revisar si existe en el directorio base
    if not target_path.exists():
        fallback_base = BASE_DIR / "data" / "users.json"
        if fallback_base.exists():
            target_path = fallback_base
        else:
            defaults = get_default_users()
            save_users(defaults)
            return defaults
    try:
        with open(target_path, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if not content:
                defaults = get_default_users()
                save_users(defaults)
                return defaults
            return json.loads(content)
    except Exception as e:
        print(f"Error cargando users.json desde {target_path}: {e}")
        return get_default_users()

def save_users(users: List[Dict[str, Any]]) -> None:
    """Guarda los usuarios en el archivo JSON con tolerancia a entornos de solo lectura (Vercel)."""
    global USERS_FILE
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(users, f, indent=2, ensure_ascii=False)
    except (OSError, PermissionError) as e:
        print(f"Aviso: Ruta {USERS_FILE} es de solo lectura ({e}). Guardando en /tmp...")
        tmp_dir = Path(tempfile.gettempdir()) / "aulamia_data"
        tmp_dir.mkdir(parents=True, exist_ok=True)
        USERS_FILE = tmp_dir / "users.json"
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(users, f, indent=2, ensure_ascii=False)

def register_user(req: UserRegisterRequest) -> Dict[str, Any]:
    """Registra un nuevo docente en AulaMIA."""
    users = load_users()
    clean_email = req.email.strip().lower()

    # Validar duplicados
    for u in users:
        if u.get("email", "").lower() == clean_email:
            raise ValueError("Este correo electrónico ya se encuentra registrado.")

    pwd_hash, salt = hash_password(req.password)
    user_id = f"usr-{uuid.uuid4().hex[:12]}"
    now_str = datetime.now().isoformat()

    new_user = {
        "id": user_id,
        "name": req.name.strip(),
        "email": clean_email,
        "password_hash": pwd_hash,
        "salt": salt,
        "institution": req.institution.strip() if req.institution else "Institución Educativa",
        "specialty": req.specialty.strip() if req.specialty else "Docente de Aula",
        "role": req.role.strip() if req.role else "Docente",
        "created_at": now_str
    }

    users.append(new_user)
    save_users(users)

    # Token de sesión simulado seguro
    token = f"aulamia-token-{uuid.uuid4().hex}"

    user_response = {
        "id": new_user["id"],
        "name": new_user["name"],
        "email": new_user["email"],
        "institution": new_user["institution"],
        "specialty": new_user["specialty"],
        "role": new_user["role"],
        "created_at": new_user["created_at"]
    }

    return {
        "message": "Registro completado exitosamente",
        "token": token,
        "user": user_response
    }

def login_user(req: UserLoginRequest) -> Dict[str, Any]:
    """Inicia sesión validando credenciales."""
    users = load_users()
    clean_email = req.email.strip().lower()

    target_user = None
    for u in users:
        if u.get("email", "").lower() == clean_email:
            target_user = u
            break

    if not target_user:
        raise ValueError("Correo o contraseña incorrectos. Por favor verifique sus datos.")

    if not verify_password(req.password, target_user["password_hash"], target_user["salt"]):
        raise ValueError("Correo o contraseña incorrectos. Por favor verifique sus datos.")

    token = f"aulamia-token-{uuid.uuid4().hex}"

    user_response = {
        "id": target_user["id"],
        "name": target_user["name"],
        "email": target_user["email"],
        "institution": target_user.get("institution", "Institución Educativa"),
        "specialty": target_user.get("specialty", "Docente de Aula"),
        "role": target_user.get("role", "Docente"),
        "created_at": target_user.get("created_at", datetime.now().isoformat())
    }

    return {
        "message": "Inicio de sesión exitoso",
        "token": token,
        "user": user_response
    }

def get_demo_user() -> Dict[str, Any]:
    """Retorna sesión lista para el docente demo."""
    users = load_users()
    for u in users:
        if u.get("email") == "profesor@aulamia.edu.co":
            return {
                "message": "Bienvenido como Docente Demo",
                "token": f"aulamia-demo-{uuid.uuid4().hex}",
                "user": {
                    "id": u["id"],
                    "name": u["name"],
                    "email": u["email"],
                    "institution": u.get("institution", "Colegio San José"),
                    "specialty": u.get("specialty", "Docente de Primaria y Tecnología"),
                    "role": u.get("role", "Docente"),
                    "created_at": u.get("created_at", datetime.now().isoformat())
                }
            }
    # Si no existe, crearlo
    defaults = get_default_users()
    save_users(defaults)
    u = defaults[0]
    return {
        "message": "Bienvenido como Docente Demo",
        "token": f"aulamia-demo-{uuid.uuid4().hex}",
        "user": {
            "id": u["id"],
            "name": u["name"],
            "email": u["email"],
            "institution": u["institution"],
            "specialty": u["specialty"],
            "role": u["role"],
            "created_at": u["created_at"]
        }
    }


def authenticate_google_user(req: GoogleAuthRequest) -> Dict[str, Any]:
    """Autentica o registra un docente usando cuenta de Google."""
    email = (req.email or "").strip().lower()
    name = (req.name or "").strip()

    if req.credential and not email:
        try:
            import base64
            parts = req.credential.split(".")
            if len(parts) >= 2:
                payload_b64 = parts[1] + "=" * (-len(parts[1]) % 4)
                payload_json = base64.urlsafe_b64decode(payload_b64).decode("utf-8")
                payload = json.loads(payload_json)
                email = payload.get("email", "").strip().lower()
                name = payload.get("name", "").strip() or payload.get("given_name", "")
        except Exception as e:
            print(f"Aviso decodificando Google token: {e}")

    if not email:
        email = "docente.google@aulamia.edu.co"
    if not name:
        name = email.split("@")[0].replace(".", " ").title()

    users = load_users()
    target_user = None
    for u in users:
        if u.get("email", "").lower() == email:
            target_user = u
            break

    now_str = datetime.now().isoformat()
    if not target_user:
        pwd_hash, salt = hash_password(uuid.uuid4().hex)
        user_id = f"usr-google-{uuid.uuid4().hex[:8]}"
        target_user = {
            "id": user_id,
            "name": name,
            "email": email,
            "password_hash": pwd_hash,
            "salt": salt,
            "institution": req.institution or "Instituci?n Educativa (Google Workspace)",
            "specialty": req.specialty or "Docente de Aula",
            "role": "Docente",
            "created_at": now_str
        }
        users.append(target_user)
        save_users(users)

    token = f"aulamia-google-{uuid.uuid4().hex}"
    user_response = {
        "id": target_user["id"],
        "name": target_user["name"],
        "email": target_user["email"],
        "institution": target_user.get("institution", "Instituci?n Educativa"),
        "specialty": target_user.get("specialty", "Docente de Aula"),
        "role": target_user.get("role", "Docente"),
        "created_at": target_user.get("created_at", now_str)
    }

    return {
        "message": "Inicio de sesi?n con Google exitoso",
        "token": token,
        "user": user_response
    }
