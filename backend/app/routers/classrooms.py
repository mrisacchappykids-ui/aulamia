from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import ClassroomProfile, ClassroomProfileBase
from app.services.classroom_storage import ClassroomStorage

router = APIRouter(prefix="/classrooms", tags=["Perfiles de Aula"])

@router.get("/", response_model=List[ClassroomProfile])
def list_classrooms():
    """Retorna la lista de todos los contextos de aula registrados."""
    return ClassroomStorage.get_all()

@router.get("/{classroom_id}", response_model=ClassroomProfile)
def get_classroom(classroom_id: str):
    """Obtiene el detalle y contexto pedagógico de un aula específica."""
    classroom = ClassroomStorage.get_by_id(classroom_id)
    if not classroom:
        raise HTTPException(status_code=404, detail="Perfil de aula no encontrado")
    return classroom

@router.post("/", response_model=ClassroomProfile)
def create_classroom(profile: ClassroomProfileBase):
    """Registra un nuevo contexto de aula con sus características de inclusión."""
    return ClassroomStorage.create(profile)

@router.put("/{classroom_id}", response_model=ClassroomProfile)
def update_classroom(classroom_id: str, profile: ClassroomProfileBase):
    """Actualiza la información y ajustes de un aula existente."""
    updated = ClassroomStorage.update(classroom_id, profile)
    if not updated:
        raise HTTPException(status_code=404, detail="Perfil de aula no encontrado")
    return updated

@router.delete("/{classroom_id}")
def delete_classroom(classroom_id: str):
    """Elimina un perfil de aula."""
    success = ClassroomStorage.delete(classroom_id)
    if not success:
        raise HTTPException(status_code=404, detail="Perfil de aula no encontrado")
    return {"message": "Perfil de aula eliminado correctamente"}
