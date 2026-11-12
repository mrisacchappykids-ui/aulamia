import json
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any

from sqlalchemy import func, select

from app.core.config import DATABASE_URL, DATA_DIR, SEED_DATA_DIR, SERVERLESS
from app.core.database import (
    ClassroomDB, DataImportDB, FeedbackDB, ResourceDB, StorageUnavailable,
    insert_if_absent, storage_session,
)
from app.models.schemas import ClassroomProfile, ClassroomProfileBase


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
        "created_at": "2026-09-14T18:37:26.205966"
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
        "created_at": "2026-09-14T18:37:26.206001"
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
        "created_at": "2026-09-14T18:37:26.206005"
    }
]

class ClassroomStorage:
    @staticmethod
    def _initialize(session) -> None:
        if session.get(DataImportDB, "pedagogical_data_v1"):
            return
        if not insert_if_absent(session, DataImportDB, {"name": "pedagogical_data_v1"}):
            return

        # Import data shipped with the deployment, or files beside a local SQLite database.
        # A local connection to remote PostgreSQL must not copy local files to that database.
        legacy_dir = SEED_DATA_DIR if SERVERLESS else DATA_DIR if not DATABASE_URL else None
        profiles = _read_legacy(legacy_dir / "classrooms.json") if legacy_dir else []
        if not profiles and not session.scalar(select(ClassroomDB.id).limit(1)):
            profiles = DEFAULT_CLASSROOMS
        for profile in profiles:
            validated = ClassroomProfile.model_validate(profile)
            insert_if_absent(session, ClassroomDB, validated.model_dump())

        if legacy_dir:
            for resource in _read_legacy(legacy_dir / "resources.json"):
                if resource.get("id") and resource.get("resource_type"):
                    insert_if_absent(session, ResourceDB, _resource_values(
                        resource["resource_type"], resource
                    ))
            if not session.scalar(select(FeedbackDB.id).limit(1)):
                for feedback in _read_legacy(legacy_dir / "feedbacks.json"):
                    session.add(FeedbackDB(**_feedback_values(feedback)))

    @classmethod
    def get_all(cls) -> List[ClassroomProfile]:
        with storage_session() as session:
            cls._initialize(session)
            records = session.scalars(select(ClassroomDB).order_by(ClassroomDB.created_at.desc()))
            return [ClassroomProfile(**record.to_dict()) for record in records]

    @classmethod
    def get_by_id(cls, classroom_id: str) -> Optional[ClassroomProfile]:
        with storage_session() as session:
            cls._initialize(session)
            record = session.get(ClassroomDB, classroom_id)
            return ClassroomProfile(**record.to_dict()) if record else None

    @classmethod
    def create(cls, profile: ClassroomProfileBase) -> ClassroomProfile:
        values = profile.model_dump()
        values["notes"] = profile.notes or ""
        item = ClassroomProfile(
            id=f"aula-{uuid.uuid4().hex[:8]}",
            created_at=datetime.now().isoformat(),
            **values,
        )
        with storage_session() as session:
            cls._initialize(session)
            session.add(ClassroomDB(**item.model_dump()))
        return item

    @classmethod
    def update(cls, classroom_id: str, profile: ClassroomProfileBase) -> Optional[ClassroomProfile]:
        with storage_session() as session:
            cls._initialize(session)
            record = session.get(ClassroomDB, classroom_id)
            if record is None:
                return None
            for key, value in profile.model_dump().items():
                setattr(record, key, value)
            return ClassroomProfile(**record.to_dict())

    @classmethod
    def delete(cls, classroom_id: str) -> bool:
        with storage_session() as session:
            cls._initialize(session)
            record = session.get(ClassroomDB, classroom_id)
            if record is None:
                return False
            session.delete(record)
            return True

    @classmethod
    def save_resource(cls, resource_type: str, resource_data: Dict[str, Any]) -> None:
        with storage_session() as session:
            cls._initialize(session)
            session.merge(ResourceDB(**_resource_values(resource_type, resource_data)))

    @classmethod
    def get_resources(cls, resource_type: Optional[str] = None) -> List[Dict[str, Any]]:
        with storage_session() as session:
            cls._initialize(session)
            query = select(ResourceDB).order_by(ResourceDB.saved_at.desc())
            if resource_type:
                query = query.filter_by(resource_type=resource_type)
            return [record.to_dict() for record in session.scalars(query)]

    @classmethod
    def delete_resource(cls, resource_id: str) -> bool:
        with storage_session() as session:
            cls._initialize(session)
            record = session.get(ResourceDB, resource_id)
            if record is None:
                return False
            session.delete(record)
            return True

    @classmethod
    def record_feedback(cls, feedback_data: Dict[str, Any]) -> None:
        with storage_session() as session:
            cls._initialize(session)
            session.add(FeedbackDB(**_feedback_values(feedback_data)))

    @classmethod
    def get_feedback_stats(cls) -> Dict[str, Any]:
        with storage_session() as session:
            cls._initialize(session)
            count, average, minutes = session.execute(
                select(func.count(FeedbackDB.id), func.avg(FeedbackDB.stars), func.sum(FeedbackDB.estimated_minutes_saved))
            ).one()
            return {
                "average_stars": round(float(average or 0), 1),
                "feedback_count": count,
                "total_minutes_saved": minutes or 0,
            }


def _read_legacy(path):
    if not path.is_file():
        return []
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        raise StorageUnavailable("No se pudieron leer los datos anteriores de AulaMIA.") from None


def _resource_values(resource_type, data):
    return {
        "id": data.get("id") or f"res-{uuid.uuid4().hex[:8]}",
        "resource_type": resource_type,
        "classroom_id": data.get("classroom_id"),
        "topic": data.get("topic"),
        "title": data.get("title") or data.get("game_title") or data.get("adapted_title"),
        "data": data,
        "saved_at": data.get("saved_at") or datetime.now().isoformat(),
    }


def _feedback_values(data):
    return {
        "resource_id": data["resource_id"],
        "stars": data.get("stars", 5),
        "relevance_rating": data.get("relevance_rating", 5),
        "estimated_minutes_saved": data.get("estimated_minutes_saved", 60),
        "qualitative_comment": data.get("qualitative_comment"),
        "created_at": data.get("created_at") or datetime.now().isoformat(),
    }
