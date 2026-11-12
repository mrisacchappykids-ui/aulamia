from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.models.schemas import AuthResponse, GoogleAuthRequest, UserLoginRequest, UserRegisterRequest, UserResponse
from app.services import auth_storage

router = APIRouter(prefix="/auth", tags=["Autenticación"])
bearer = HTTPBearer(auto_error=False)


def session_token(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> str:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Inicia sesión para continuar.")
    return credentials.credentials


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(request: UserRegisterRequest):
    try:
        return auth_storage.register_user(request)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from None


@router.post("/login", response_model=AuthResponse)
def login(request: UserLoginRequest):
    try:
        return auth_storage.login_user(request)
    except ValueError as error:
        raise HTTPException(status_code=401, detail=str(error)) from None


@router.get("/demo-login", response_model=AuthResponse)
def demo_login(response: Response):
    response.headers["Cache-Control"] = "no-store"
    return auth_storage.get_demo_user()


@router.get("/me", response_model=UserResponse)
def get_current_user(response: Response, token: str = Depends(session_token)):
    response.headers["Cache-Control"] = "no-store"
    user = auth_storage.current_user(token)
    if user is None:
        raise HTTPException(status_code=401, detail="Tu sesión ha vencido. Inicia sesión de nuevo.")
    return user


@router.post("/logout", status_code=204)
def logout(token: str = Depends(session_token)):
    auth_storage.logout_user(token)
    return Response(status_code=204)


@router.post("/google", response_model=AuthResponse)
def google_auth(request: GoogleAuthRequest):
    try:
        return auth_storage.authenticate_google_user(request)
    except ValueError as error:
        raise HTTPException(status_code=401, detail=str(error)) from None
