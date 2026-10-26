from fastapi import APIRouter, HTTPException, status
from app.models.schemas import UserRegisterRequest, UserLoginRequest, AuthResponse
from app.services import auth_storage

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(request: UserRegisterRequest):
    """
    Registra un nuevo docente en AulaMIA.
    """
    try:
        return auth_storage.register_user(request)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en el servidor al registrar usuario: {str(e)}"
        )

@router.post("/login", response_model=AuthResponse)
def login(request: UserLoginRequest):
    """
    Inicia sesión con correo y contraseña.
    """
    try:
        return auth_storage.login_user(request)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en el servidor al autenticar: {str(e)}"
        )

@router.get("/demo-login", response_model=AuthResponse)
def demo_login():
    """
    Inicia sesión rápida automática como Docente Demo para pruebas.
    """
    try:
        return auth_storage.get_demo_user()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error obteniendo usuario demo: {str(e)}"
        )

@router.get("/me")
def get_current_user():
    """
    Verifica el estado del servicio de autenticación.
    """
    return {
        "status": "active",
        "demo_user": "profesor@aulamia.edu.co",
        "authentication_mode": "local_storage_token"
    }
