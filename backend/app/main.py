from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import PROJECT_NAME, VERSION, DESCRIPTION, CORS_ORIGINS
from app.core.database import StorageUnavailable, get_db_status
from app.routers import classrooms, planner, activities, evaluations, games, adaptations, resources, materials, auth

app = FastAPI(
    title=PROJECT_NAME,
    version=VERSION,
    description=DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(StorageUnavailable)
async def database_unavailable(request, error):
    return JSONResponse(status_code=503, content={"detail": str(error)})

@app.exception_handler(RequestValidationError)
async def invalid_request(request, error):
    details = [{key: item[key] for key in ("loc", "msg", "type")} for item in error.errors()]
    return JSONResponse(status_code=422, content={"detail": details})

# Register routers
app.include_router(auth.router)
app.include_router(auth.router, prefix="/api")  # Compatibility for /api/auth/*
app.include_router(classrooms.router)
app.include_router(planner.router)
app.include_router(activities.router)
app.include_router(evaluations.router)
app.include_router(games.router)
app.include_router(adaptations.router)
app.include_router(materials.router)
app.include_router(resources.router)

@app.get("/")
def root():
    return {
        "message": "Bienvenido a la API de AulaMIA - La IA que entiende tu aula y te ayuda a enseñar",
        "version": VERSION,
        "docs": "/docs",
        "status": "operational"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/health/db")
def health_db():
    state = get_db_status()
    return JSONResponse(status_code=503 if state["mode"] == "unavailable" else 200, content=state)
