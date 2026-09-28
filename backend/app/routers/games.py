from fastapi import APIRouter, HTTPException
from app.models.schemas import EducationalGame, EducationalGameRequest
from app.services.classroom_storage import ClassroomStorage
from app.services.ai_generator import AIGeneratorService

router = APIRouter(prefix="/games", tags=["Mini-Juegos Educativos"])

@router.post("/generate", response_model=EducationalGame)
def generate_game(request: EducationalGameRequest):
    """Genera una propuesta de gamificación y mini-juego interactivo con adaptaciones de ritmo e inclusión."""
    classroom = ClassroomStorage.get_by_id(request.classroom_id)
    if not classroom:
        raise HTTPException(status_code=404, detail="Perfil de aula no encontrado")

    game = AIGeneratorService.generate_game(
        classroom=classroom,
        topic=request.topic,
        game_style=request.game_style
    )

    ClassroomStorage.save_resource("game", game.model_dump())
    return game
