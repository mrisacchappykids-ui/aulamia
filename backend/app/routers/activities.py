from fastapi import APIRouter, HTTPException
from app.models.schemas import ActivitySet, ActivityRequest
from app.services.classroom_storage import ClassroomStorage
from app.services.ai_generator import AIGeneratorService

router = APIRouter(prefix="/activities", tags=["Actividades Diferenciadas"])

@router.post("/generate", response_model=ActivitySet)
def generate_activities(request: ActivityRequest):
    """Genera un set de 4 actividades multinivel (Base, Refuerzo, Profundización, Adaptada) ancladas al aula."""
    classroom = ClassroomStorage.get_by_id(request.classroom_id)
    if not classroom:
        raise HTTPException(status_code=404, detail="Perfil de aula no encontrado")

    activities = AIGeneratorService.generate_activities(
        classroom=classroom,
        topic=request.topic,
        main_focus=request.main_focus
    )

    ClassroomStorage.save_resource("activity_set", activities.model_dump())
    return activities
