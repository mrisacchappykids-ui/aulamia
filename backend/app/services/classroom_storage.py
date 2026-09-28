import json
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path
from app.core.config import DATA_DIR
from app.models.schemas import ClassroomProfile, ClassroomProfileBase

CLASSROOMS_FILE = DATA_DIR / "classrooms.json"
RESOURCES_FILE = DATA_DIR / "resources.json"

DEFAULT_CLASSROOMS = [
    {
        "id": "aula-5to-matematicas",
        "name": "5° Primaria - Matemáticas Inclusiva",
        "grade": "5° de Primaria",
        "subject": "Matemáticas",
        "student_count": 25,
        "average_age": 10,
        "session_duration_minutes": 50,
        "methodology": "Aprendizaje Basado en Problemas y Manipulativo",
        "available_resources": [
            "Proyector interactivo",
            "1 computador docente",
            "Material concreto (bloques lógicos, fichas)",
            "Cuadernos de trabajo"
        ],
        "general_learning_pace": "Grupo heterogéneo con excelente disposición al trabajo en parejas",
        "inclusion_support_needs": [
            "Instrucciones breves y segmentadas por pasos",
            "Apoyo visual reforzado (gráficos e infografías)",
            "Menor densidad de ejercicios por hoja",
            "Tiempo flexible para procesar cálculos"
        ],
        "notes": "Tres estudiantes requieren andamiaje visual paso a paso; dos estudiantes tienen ritmo de avance rápido.",
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "aula-8vo-ciencias",
        "name": "8° Secundaria - Ciencias Naturales",
        "grade": "8° de Secundaria",
        "subject": "Ciencias Naturales y Educación Ambiental",
        "student_count": 32,
        "average_age": 13,
        "session_duration_minutes": 60,
        "methodology": "Aprendizaje Basado en la Indagación y Trabajo Colaborativo",
        "available_resources": [
            "Tablero acrílico",
            "Materiales reciclables de laboratorio escolar",
            "Conexión a internet intermitente"
        ],
        "general_learning_pace": "Ritmo medio, alta energía y preferencia por debates y casos reales",
        "inclusion_support_needs": [
            "Estructuración explícita de roles en trabajo en equipo",
            "Glosario previo de conceptos científicos",
            "Alternativas orales y gráficas para entregables"
        ],
        "notes": "Énfasis en vincular la temática con el entorno local del estudiante.",
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "aula-3ro-lengua",
        "name": "3° Primaria - Lenguaje y Comunicación",
        "grade": "3° de Primaria",
        "subject": "Lengua Castellana",
        "student_count": 22,
        "average_age": 8,
        "session_duration_minutes": 45,
        "methodology": "Taller de Lectoescritura Creativa y Gamificación",
        "available_resources": [
            "Biblioteca de aula",
            "Láminas ilustradas",
            "Parlante de audio para narraciones"
        ],
        "general_learning_pace": "Desarrollo progresivo de la fluidez lectora",
        "inclusion_support_needs": [
            "Uso de pictogramas y organizadores gráficos",
            "Lectura guiada en voz alta con pausas activas",
            "Consignas con modelado previo del docente"
        ],
        "notes": "Atención especial a la comprensión lectora literal e inferencial.",
        "created_at": datetime.now().isoformat()
    }
]

class ClassroomStorage:
    @staticmethod
    def _load_data(file_path: Path, default_data: Any) -> Any:
        if not file_path.exists():
            ClassroomStorage._save_data(file_path, default_data)
            return default_data
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return default_data

    @staticmethod
    def _save_data(file_path: Path, data: Any) -> None:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    @classmethod
    def get_all(cls) -> List[ClassroomProfile]:
        data = cls._load_data(CLASSROOMS_FILE, DEFAULT_CLASSROOMS)
        return [ClassroomProfile(**item) for item in data]

    @classmethod
    def get_by_id(cls, classroom_id: str) -> Optional[ClassroomProfile]:
        classrooms = cls.get_all()
        for c in classrooms:
            if c.id == classroom_id:
                return c
        return None

    @classmethod
    def create(cls, profile: ClassroomProfileBase) -> ClassroomProfile:
        classrooms = cls.get_all()
        new_profile = ClassroomProfile(
            id=f"aula-{uuid.uuid4().hex[:8]}",
            created_at=datetime.now().isoformat(),
            **profile.model_dump()
        )
        classrooms.insert(0, new_profile)
        cls._save_data(CLASSROOMS_FILE, [c.model_dump() for c in classrooms])
        return new_profile

    @classmethod
    def update(cls, classroom_id: str, profile: ClassroomProfileBase) -> Optional[ClassroomProfile]:
        classrooms = cls.get_all()
        for idx, c in enumerate(classrooms):
            if c.id == classroom_id:
                updated = ClassroomProfile(
                    id=classroom_id,
                    created_at=c.created_at,
                    **profile.model_dump()
                )
                classrooms[idx] = updated
                cls._save_data(CLASSROOMS_FILE, [item.model_dump() for item in classrooms])
                return updated
        return None

    @classmethod
    def delete(cls, classroom_id: str) -> bool:
        classrooms = cls.get_all()
        initial_len = len(classrooms)
        filtered = [c for c in classrooms if c.id != classroom_id]
        if len(filtered) < initial_len:
            cls._save_data(CLASSROOMS_FILE, [item.model_dump() for item in filtered])
            return True
        return False

    @classmethod
    def save_resource(cls, resource_type: str, resource_data: Dict[str, Any]) -> None:
        resources = cls._load_data(RESOURCES_FILE, [])
        resource_data["resource_type"] = resource_type
        resource_data["saved_at"] = datetime.now().isoformat()
        resources.insert(0, resource_data)
        cls._save_data(RESOURCES_FILE, resources)

    @classmethod
    def get_resources(cls, resource_type: Optional[str] = None) -> List[Dict[str, Any]]:
        resources = cls._load_data(RESOURCES_FILE, [])
        if resource_type:
            return [r for r in resources if r.get("resource_type") == resource_type]
        return resources

    @classmethod
    def delete_resource(cls, resource_id: str) -> bool:
        resources = cls._load_data(RESOURCES_FILE, [])
        initial_len = len(resources)
        filtered = [r for r in resources if r.get("id") != resource_id]
        if len(filtered) < initial_len:
            cls._save_data(RESOURCES_FILE, filtered)
            return True
        return False

    @classmethod
    def record_feedback(cls, feedback_data: Dict[str, Any]) -> bool:
        feedbacks_file = DATA_DIR / "feedbacks.json"
        feedbacks = cls._load_data(feedbacks_file, [])
        feedback_data["created_at"] = datetime.now().isoformat()
        feedbacks.insert(0, feedback_data)
        cls._save_data(feedbacks_file, feedbacks)
        return True

    @classmethod
    def get_feedback_stats(cls) -> Dict[str, Any]:
        feedbacks_file = DATA_DIR / "feedbacks.json"
        feedbacks = cls._load_data(feedbacks_file, [])
        if not feedbacks:
            return {"average_stars": 4.9, "feedback_count": 0, "total_minutes_saved": 0}
        avg_stars = sum(f.get("stars", 5) for f in feedbacks) / len(feedbacks)
        total_mins = sum(f.get("estimated_minutes_saved", 60) for f in feedbacks)
        return {
            "average_stars": round(avg_stars, 1),
            "feedback_count": len(feedbacks),
            "total_minutes_saved": total_mins
        }

