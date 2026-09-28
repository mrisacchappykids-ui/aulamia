from fastapi import APIRouter, HTTPException
from typing import Optional, List, Dict, Any
from app.services.classroom_storage import ClassroomStorage
from app.models.schemas import FeedbackRating

router = APIRouter(prefix="/resources", tags=["Historial y Biblioteca de Recursos"])

@router.get("/")
def list_resources(resource_type: Optional[str] = None) -> List[Dict[str, Any]]:
    """Lista todos los recursos generados y guardados en el historial."""
    return ClassroomStorage.get_resources(resource_type)

@router.delete("/{resource_id}")
def delete_resource(resource_id: str):
    """Elimina un recurso del historial guardado."""
    success = ClassroomStorage.delete_resource(resource_id)
    if not success:
        raise HTTPException(status_code=404, detail="Recurso no encontrado")
    return {"message": "Recurso eliminado correctamente"}

@router.post("/feedback")
def submit_feedback(feedback: FeedbackRating):
    """Registra la valoración de pertinencia pedagógica y tiempo ahorrado (métricas del Brief)."""
    ClassroomStorage.record_feedback(feedback.model_dump())
    return {"message": "Retroalimentación registrada con éxito"}

@router.get("/stats")
def get_stats():
    """Retorna métricas de impacto: recursos generados, desglose y estimación de tiempo ahorrado."""
    all_res = ClassroomStorage.get_resources()
    plans_count = len([r for r in all_res if r.get("resource_type") == "lesson_plan"])
    acts_count = len([r for r in all_res if r.get("resource_type") == "activity_set"])
    evals_count = len([r for r in all_res if r.get("resource_type") == "evaluation"])
    games_count = len([r for r in all_res if r.get("resource_type") == "game"])
    adapts_count = len([r for r in all_res if r.get("resource_type") == "adaptation"])
    materials_count = len([r for r in all_res if r.get("resource_type") == "material"])

    fb_stats = ClassroomStorage.get_feedback_stats()
    total_resources = len(all_res)
    # Estimación de ahorro pedagógico base + feedbacks reales
    base_hours = round(total_resources * 1.5, 1)
    if fb_stats["total_minutes_saved"] > 0:
        actual_hours = round(fb_stats["total_minutes_saved"] / 60.0, 1)
        estimated_hours = max(base_hours, actual_hours)
    else:
        estimated_hours = base_hours

    return {
        "total_resources_generated": total_resources,
        "plans_count": plans_count,
        "activities_count": acts_count,
        "evaluations_count": evals_count,
        "games_count": games_count,
        "adaptations_count": adapts_count,
        "materials_count": materials_count,
        "estimated_hours_saved": estimated_hours,
        "average_pedagogical_rating": fb_stats["average_stars"],
        "feedback_responses_count": fb_stats["feedback_count"]
    }
