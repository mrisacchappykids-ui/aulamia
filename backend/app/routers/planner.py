from fastapi import APIRouter, HTTPException
from app.models.schemas import LessonPlan, LessonPlanRequest
from app.services.classroom_storage import ClassroomStorage
from app.services.ai_generator import AIGeneratorService

router = APIRouter(prefix="/planner", tags=["Planeaciones de Clase"])

@router.post("/generate", response_model=LessonPlan)
def generate_lesson_plan(request: LessonPlanRequest):
    """Genera una planeación de clase completa considerando el contexto del aula seleccionada."""
    classroom = ClassroomStorage.get_by_id(request.classroom_id)
    if not classroom:
        raise HTTPException(status_code=404, detail="Perfil de aula no encontrado")

    plan = AIGeneratorService.generate_lesson_plan(
        classroom=classroom,
        topic=request.topic,
        learning_objective=request.learning_objective,
        competencies=request.specific_competencies,
        custom_notes=request.custom_notes
    )

    # Persist in resources history
    ClassroomStorage.save_resource("lesson_plan", plan.model_dump())
    return plan
