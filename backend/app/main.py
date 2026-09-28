from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import PROJECT_NAME, VERSION, DESCRIPTION, CORS_ORIGINS
from app.routers import classrooms, planner, activities, evaluations, games, adaptations, resources, materials

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
    allow_origins=["*"],  # Allow all during prototyping
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
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
