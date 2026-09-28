from fastapi import APIRouter, HTTPException
from app.models.schemas import EvaluationResource, EvaluationRequest
from app.services.classroom_storage import ClassroomStorage
from app.services.ai_generator import AIGeneratorService

router = APIRouter(prefix="/evaluations", tags=["Evaluaciones y Rúbricas"])

@router.post("/generate", response_model=EvaluationResource)
def generate_evaluation(request: EvaluationRequest):
    """Genera una evaluación formativa con preguntas de andamiaje, pistas de inclusión y rúbrica cualitativa."""
    classroom = ClassroomStorage.get_by_id(request.classroom_id)
    if not classroom:
        raise HTTPException(status_code=404, detail="Perfil de aula no encontrado")

    eval_resource = AIGeneratorService.generate_evaluations(
        classroom=classroom,
        topic=request.topic,
        eval_type=request.evaluation_type
    )

    ClassroomStorage.save_resource("evaluation", eval_resource.model_dump())
    return eval_resource
