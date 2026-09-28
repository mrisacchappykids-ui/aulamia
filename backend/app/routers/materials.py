from fastapi import APIRouter, HTTPException
from app.models.schemas import EducationalMaterial, EducationalMaterialRequest
from app.services.classroom_storage import ClassroomStorage
from app.services.ai_generator import AIGeneratorService

router = APIRouter(prefix="/materials", tags=["Material Educativo Imprimible"])

@router.post("/generate", response_model=EducationalMaterial)
def generate_material(request: EducationalMaterialRequest):
    """Genera una ficha de trabajo o guía de taller imprimible contextualizada con andamiaje DUA."""
    classroom = ClassroomStorage.get_by_id(request.classroom_id)
    if not classroom:
        raise HTTPException(status_code=404, detail="Perfil de aula no encontrado")

    material = AIGeneratorService.generate_educational_material(
        classroom=classroom,
        topic=request.topic,
        material_type=request.material_type,
        custom_title=request.custom_title
    )

    ClassroomStorage.save_resource("material", material.model_dump())
    return material
