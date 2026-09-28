from fastapi import APIRouter, HTTPException
from app.models.schemas import AdaptationResult, AdaptationRequest
from app.services.classroom_storage import ClassroomStorage
from app.services.ai_generator import AIGeneratorService

router = APIRouter(prefix="/adaptations", tags=["Adaptar para mi Aula"])

@router.post("/adapt", response_model=AdaptationResult)
def adapt_resource(request: AdaptationRequest):
    """Toma cualquier actividad, texto o recurso y lo adapta al contexto y diversidad del aula activa."""
    classroom = ClassroomStorage.get_by_id(request.classroom_id)
    if not classroom:
        raise HTTPException(status_code=404, detail="Perfil de aula no encontrado")

    result = AIGeneratorService.adapt_content_to_classroom(
        classroom=classroom,
        original_title=request.original_title,
        original_content=request.original_content,
        target_barrier=request.target_barrier
    )

    ClassroomStorage.save_resource("adaptation", result.model_dump())
    return result
