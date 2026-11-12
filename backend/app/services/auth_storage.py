import hashlib
import hmac
import json
import os
import secrets
import time
import uuid
from datetime import datetime, timezone

from sqlalchemy import delete, select

from app.core.config import DATABASE_URL, GOOGLE_CLIENT_ID, LEGACY_USERS_FILE, SERVERLESS
from app.core.database import AuthSessionDB, DataImportDB, StorageUnavailable, UserDB, insert_if_absent, storage_session
from app.models.schemas import GoogleAuthRequest, UserLoginRequest, UserRegisterRequest, UserResponse

DEMO_ID = "usr-demo-docente"
DEMO_EMAIL = "profesor@aulamia.edu.co"
SESSION_SECONDS = 7 * 24 * 60 * 60


def _now():
    return datetime.now(timezone.utc).isoformat()


def hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    # Preserve the parameters used by earlier accounts during migration.
    salt = salt or os.urandom(16).hex()
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), 100_000)
    return digest.hex(), salt


def _import_legacy_users(session):
    if DATABASE_URL and not (SERVERLESS or os.getenv("AULAMIA_LEGACY_USERS_FILE")):
        return
    if session.get(DataImportDB, "legacy_users_v1") or not LEGACY_USERS_FILE.is_file():
        return
    if not insert_if_absent(session, DataImportDB, {"name": "legacy_users_v1"}):
        return
    try:
        users = json.loads(LEGACY_USERS_FILE.read_text(encoding="utf-8"))
        for user in users:
            email = user["email"].strip().lower()
            if email == DEMO_EMAIL or user["id"] == DEMO_ID:
                continue
            profile = {**user, "email": email}
            data = UserResponse.model_validate(profile).model_dump()
            data.update(password_hash=user.get("password_hash"), salt=user.get("salt"))
            insert_if_absent(session, UserDB, data)
    except (OSError, ValueError, TypeError, KeyError, AttributeError):
        raise StorageUnavailable("No se pudieron importar las cuentas anteriores de AulaMIA.") from None


def _public_user(user):
    return UserResponse.model_validate(user, from_attributes=True)


def _issue_session(session, user, message):
    now = int(time.time())
    session.execute(delete(AuthSessionDB).where(
        AuthSessionDB.user_id == user.id, AuthSessionDB.expires_at <= now
    ))
    token = secrets.token_urlsafe(32)
    session.add(AuthSessionDB(
        token_hash=_token_hash(token), user_id=user.id, expires_at=now + SESSION_SECONDS,
    ))
    return {"message": message, "token": token, "user": _public_user(user)}


def _token_hash(token):
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def register_user(req: UserRegisterRequest):
    email = req.email.strip().lower()
    if email == DEMO_EMAIL:
        raise ValueError("Este correo electrónico está reservado para la demostración.")
    if len(email) > 254 or "@" not in email or len(req.name.strip()) < 2:
        raise ValueError("Ingresa un nombre y un correo válidos.")
    password_hash, salt = hash_password(req.password)
    data = {
        "id": f"usr-{uuid.uuid4().hex}",
        "email": email,
        "name": req.name.strip(),
        "password_hash": password_hash,
        "salt": salt,
        "institution": (req.institution or "").strip() or "Institución Educativa",
        "specialty": (req.specialty or "").strip() or "Docente de Aula",
        "role": "Docente",
        "created_at": _now(),
    }
    with storage_session() as session:
        _import_legacy_users(session)
        if not insert_if_absent(session, UserDB, data):
            raise ValueError("Este correo electrónico ya se encuentra registrado.")
        return _issue_session(session, session.get(UserDB, data["id"]), "Registro completado exitosamente")


def login_user(req: UserLoginRequest):
    with storage_session() as session:
        _import_legacy_users(session)
        user = session.scalar(select(UserDB).filter_by(email=req.email.strip().lower()))
        if user and user.password_hash and user.salt:
            digest, _ = hash_password(req.password, user.salt)
            if hmac.compare_digest(digest, user.password_hash):
                return _issue_session(session, user, "Inicio de sesión exitoso")
        raise ValueError("Correo o contraseña incorrectos. Por favor verifica tus datos.")


def get_demo_user():
    with storage_session() as session:
        user = session.get(UserDB, DEMO_ID)
        if not user:
            insert_if_absent(session, UserDB, {
                "id": DEMO_ID, "email": DEMO_EMAIL, "name": "Profesor Demo AulaMIA",
                "institution": "Institución de demostración",
                "specialty": "Docente de Primaria y Tecnología",
                "role": "Docente", "created_at": _now(),
            })
            user = session.get(UserDB, DEMO_ID)
        return _issue_session(session, user, "Bienvenido como Docente Demo")


def current_user(token: str):
    with storage_session() as session:
        auth = session.get(AuthSessionDB, _token_hash(token))
        if auth is None or auth.expires_at <= int(time.time()):
            return None
        user = session.get(UserDB, auth.user_id)
        return _public_user(user) if user else None


def logout_user(token: str):
    with storage_session() as session:
        session.execute(delete(AuthSessionDB).where(AuthSessionDB.token_hash == _token_hash(token)))


def _google_identity(credential: str):
    if not GOOGLE_CLIENT_ID:
        raise StorageUnavailable("El inicio de sesión con Google requiere configuración.")
    from google.auth.exceptions import GoogleAuthError, TransportError
    from google.auth.transport.requests import Request
    from google.oauth2.id_token import verify_oauth2_token

    def request_with_timeout(url, method="GET", **kwargs):
        kwargs["timeout"] = 5
        return Request()(url, method=method, **kwargs)

    try:
        identity = verify_oauth2_token(credential, request_with_timeout, GOOGLE_CLIENT_ID)
    except TransportError:
        raise StorageUnavailable("No se pudo conectar con Google. Intenta de nuevo.") from None
    except (GoogleAuthError, ValueError):
        raise ValueError("Google no pudo verificar tu sesión.") from None
    if not (identity.get("sub") and identity.get("email") and identity.get("email_verified") is True):
        raise ValueError("Tu cuenta de Google debe tener un correo verificado.")
    return identity


def authenticate_google_user(req: GoogleAuthRequest):
    identity = _google_identity(req.credential)
    email = identity["email"].strip().lower()
    subject = identity["sub"]
    if email == DEMO_EMAIL:
        raise ValueError("Este correo electrónico está reservado para la demostración.")

    with storage_session() as session:
        _import_legacy_users(session)
        user = session.scalar(select(UserDB).filter_by(google_subject=subject))
        if user:
            return _issue_session(session, user, "Inicio de sesión con Google exitoso")

        # Serialize linking requests for an existing account.
        user = session.scalar(select(UserDB).filter_by(email=email).with_for_update())
        if user:
            if user.google_subject and user.google_subject != subject:
                raise ValueError("Esta cuenta está vinculada a otra identidad de Google.")
            if not (email.endswith("@gmail.com") or identity.get("hd")):
                raise ValueError("Usa tu contraseña de AulaMIA para acceder a esta cuenta.")
            user.google_subject = subject
        else:
            user_id = f"usr-google-{uuid.uuid4().hex}"
            if not insert_if_absent(session, UserDB, {
                "id": user_id, "email": email, "google_subject": subject,
                "name": identity.get("name") or email.split("@")[0],
                "institution": "Institución Educativa", "specialty": "Docente de Aula",
                "role": "Docente", "created_at": _now(),
            }):
                raise ValueError("Ya existe una cuenta para ese correo. Vuelve a iniciar sesión.")
            user = session.get(UserDB, user_id)
        return _issue_session(session, user, "Inicio de sesión con Google exitoso")
