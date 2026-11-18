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
    # Persist the official curricular reference selected in the form.
    plan.subject = "Tecnología e Informática"
    if request.curricular_grade:
        plan.grade = f"{request.curricular_grade}°"
    plan.curricular_grade = request.curricular_grade
    plan.curriculum_group = request.curriculum_group
    plan.curricular_component = request.curricular_component
    plan.curricular_evidence = request.curricular_evidence
    if request.curricular_evidence:
        plan.learning_evidences = [request.curricular_evidence]

    # Persist in resources history
    ClassroomStorage.save_resource("lesson_plan", plan.model_dump())
    return plan
