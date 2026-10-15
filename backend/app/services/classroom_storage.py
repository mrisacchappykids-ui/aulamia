import json
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path
from app.core.config import DATA_DIR
from app.models.schemas import ClassroomProfile, ClassroomProfileBase
from app.core.database import SessionLocal, ClassroomDB, ResourceDB, FeedbackDB

CLASSROOMS_FILE = DATA_DIR / "classrooms.json"
RESOURCES_FILE = DATA_DIR / "resources.json"
FEEDBACKS_FILE = DATA_DIR / "feedbacks.json"

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
        if SessionLocal:
            db = SessionLocal()
            try:
                records = db.query(ClassroomDB).order_by(ClassroomDB.created_at.desc()).all()
                if not records:
                    # Seed defaults into database
                    for d in DEFAULT_CLASSROOMS:
                        item = ClassroomDB(
                            id=d["id"],
                            name=d["name"],
                            grade=d["grade"],
                            subject=d["subject"],
                            student_count=d["student_count"],
                            average_age=d["average_age"],
                            session_duration_minutes=d["session_duration_minutes"],
                            methodology=d["methodology"],
                            available_resources=d["available_resources"],
                            general_learning_pace=d["general_learning_pace"],
                            inclusion_support_needs=d["inclusion_support_needs"],
                            notes=d.get("notes"),
                            created_at=d["created_at"],
                        )
                        db.add(item)
                    db.commit()
                    records = db.query(ClassroomDB).all()
                return [ClassroomProfile(**r.to_dict()) for r in records]
            except Exception as e:
                print(f"Database query error (falling back to JSON): {e}")
                db.rollback()
            finally:
                db.close()

        data = cls._load_data(CLASSROOMS_FILE, DEFAULT_CLASSROOMS)
        return [ClassroomProfile(**item) for item in data]

    @classmethod
    def get_by_id(cls, classroom_id: str) -> Optional[ClassroomProfile]:
        if SessionLocal:
            db = SessionLocal()
            try:
                record = db.query(ClassroomDB).filter_by(id=classroom_id).first()
                if record:
                    return ClassroomProfile(**record.to_dict())
            except Exception as e:
                print(f"Database error in get_by_id: {e}")
            finally:
                db.close()

        classrooms = cls.get_all()
        for c in classrooms:
            if c.id == classroom_id:
                return c
        return None

    @classmethod
    def create(cls, profile: ClassroomProfileBase) -> ClassroomProfile:
        new_id = f"aula-{uuid.uuid4().hex[:8]}"
        created_time = datetime.now().isoformat()

        if SessionLocal:
            db = SessionLocal()
            try:
                record = ClassroomDB(
                    id=new_id,
                    created_at=created_time,
                    name=profile.name,
                    grade=profile.grade,
                    subject=profile.subject,
                    student_count=profile.student_count,
                    average_age=profile.average_age,
                    session_duration_minutes=profile.session_duration_minutes,
                    methodology=profile.methodology,
                    available_resources=profile.available_resources,
                    general_learning_pace=profile.general_learning_pace,
                    inclusion_support_needs=profile.inclusion_support_needs,
                    notes=profile.notes,
                )
                db.add(record)
                db.commit()
                return ClassroomProfile(**record.to_dict())
            except Exception as e:
                print(f"Database error in create: {e}")
                db.rollback()
            finally:
                db.close()

        classrooms = cls.get_all()
        new_profile = ClassroomProfile(
            id=new_id,
            created_at=created_time,
            **profile.model_dump()
        )
        classrooms.insert(0, new_profile)
        cls._save_data(CLASSROOMS_FILE, [c.model_dump() for c in classrooms])
        return new_profile

    @classmethod
    def update(cls, classroom_id: str, profile: ClassroomProfileBase) -> Optional[ClassroomProfile]:
        if SessionLocal:
            db = SessionLocal()
            try:
                record = db.query(ClassroomDB).filter_by(id=classroom_id).first()
                if record:
                    record.name = profile.name
                    record.grade = profile.grade
                    record.subject = profile.subject
                    record.student_count = profile.student_count
                    record.average_age = profile.average_age
                    record.session_duration_minutes = profile.session_duration_minutes
                    record.methodology = profile.methodology
                    record.available_resources = profile.available_resources
                    record.general_learning_pace = profile.general_learning_pace
                    record.inclusion_support_needs = profile.inclusion_support_needs
                    record.notes = profile.notes
                    db.commit()
                    return ClassroomProfile(**record.to_dict())
            except Exception as e:
                print(f"Database error in update: {e}")
                db.rollback()
            finally:
                db.close()

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
        if SessionLocal:
            db = SessionLocal()
            try:
                record = db.query(ClassroomDB).filter_by(id=classroom_id).first()
                if record:
                    db.delete(record)
                    db.commit()
                    return True
            except Exception as e:
                print(f"Database error in delete: {e}")
                db.rollback()
            finally:
                db.close()

        classrooms = cls.get_all()
        initial_len = len(classrooms)
        filtered = [c for c in classrooms if c.id != classroom_id]
        if len(filtered) < initial_len:
            cls._save_data(CLASSROOMS_FILE, [item.model_dump() for item in filtered])
            return True
        return False

    @classmethod
    def save_resource(cls, resource_type: str, resource_data: Dict[str, Any]) -> None:
        saved_time = datetime.now().isoformat()
        res_id = resource_data.get("id") or f"res-{uuid.uuid4().hex[:8]}"

        if SessionLocal:
            db = SessionLocal()
            try:
                rec = ResourceDB(
                    id=res_id,
                    resource_type=resource_type,
                    classroom_id=resource_data.get("classroom_id"),
                    topic=resource_data.get("topic"),
                    title=resource_data.get("title") or resource_data.get("game_title") or resource_data.get("adapted_title"),
                    data=resource_data,
                    saved_at=saved_time,
                )
                db.merge(rec)
                db.commit()
                return
            except Exception as e:
                print(f"Database error in save_resource: {e}")
                db.rollback()
            finally:
                db.close()

        resources = cls._load_data(RESOURCES_FILE, [])
        resource_data["resource_type"] = resource_type
        resource_data["saved_at"] = saved_time
        resources.insert(0, resource_data)
        cls._save_data(RESOURCES_FILE, resources)

    @classmethod
    def get_resources(cls, resource_type: Optional[str] = None) -> List[Dict[str, Any]]:
        if SessionLocal:
            db = SessionLocal()
            try:
                q = db.query(ResourceDB)
                if resource_type:
                    q = q.filter_by(resource_type=resource_type)
                records = q.order_by(ResourceDB.saved_at.desc()).all()
                return [r.to_dict() for r in records]
            except Exception as e:
                print(f"Database error in get_resources: {e}")
            finally:
                db.close()

        resources = cls._load_data(RESOURCES_FILE, [])
        if resource_type:
            return [r for r in resources if r.get("resource_type") == resource_type]
        return resources

    @classmethod
    def delete_resource(cls, resource_id: str) -> bool:
        if SessionLocal:
            db = SessionLocal()
            try:
                rec = db.query(ResourceDB).filter_by(id=resource_id).first()
                if rec:
                    db.delete(rec)
                    db.commit()
                    return True
            except Exception as e:
                print(f"Database error in delete_resource: {e}")
                db.rollback()
            finally:
                db.close()

        resources = cls._load_data(RESOURCES_FILE, [])
        initial_len = len(resources)
        filtered = [r for r in resources if r.get("id") != resource_id]
        if len(filtered) < initial_len:
            cls._save_data(RESOURCES_FILE, filtered)
            return True
        return False

    @classmethod
    def record_feedback(cls, feedback_data: Dict[str, Any]) -> bool:
        created_time = datetime.now().isoformat()

        if SessionLocal:
            db = SessionLocal()
            try:
                fb = FeedbackDB(
                    resource_id=feedback_data["resource_id"],
                    stars=feedback_data.get("stars", 5),
                    relevance_rating=feedback_data.get("relevance_rating", 5),
                    estimated_minutes_saved=feedback_data.get("estimated_minutes_saved", 60),
                    qualitative_comment=feedback_data.get("qualitative_comment"),
                    created_at=created_time,
                )
                db.add(fb)
                db.commit()
                return True
            except Exception as e:
                print(f"Database error in record_feedback: {e}")
                db.rollback()
            finally:
                db.close()

        feedbacks = cls._load_data(FEEDBACKS_FILE, [])
        feedback_data["created_at"] = created_time
        feedbacks.insert(0, feedback_data)
        cls._save_data(FEEDBACKS_FILE, feedbacks)
        return True

    @classmethod
    def get_feedback_stats(cls) -> Dict[str, Any]:
        if SessionLocal:
            db = SessionLocal()
            try:
                records = db.query(FeedbackDB).all()
                if records:
                    avg_stars = sum(r.stars for r in records) / len(records)
                    total_mins = sum(r.estimated_minutes_saved for r in records)
                    return {
                        "average_stars": round(avg_stars, 1),
                        "feedback_count": len(records),
                        "total_minutes_saved": total_mins
                    }
            except Exception as e:
                print(f"Database error in get_feedback_stats: {e}")
            finally:
                db.close()

        feedbacks = cls._load_data(FEEDBACKS_FILE, [])
        if not feedbacks:
            return {"average_stars": 4.9, "feedback_count": 0, "total_minutes_saved": 0}
        avg_stars = sum(f.get("stars", 5) for f in feedbacks) / len(feedbacks)
        total_mins = sum(f.get("estimated_minutes_saved", 60) for f in feedbacks)
        return {
            "average_stars": round(avg_stars, 1),
            "feedback_count": len(feedbacks),
            "total_minutes_saved": total_mins
        }
