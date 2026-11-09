import json
from typing import Optional, Dict, Any
from sqlalchemy import create_engine, Column, String, Integer, Text, JSON
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session
from app.core.config import DATABASE_URL, DATA_DIR

Base = declarative_base()

class ClassroomDB(Base):
    __tablename__ = "classrooms"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    grade = Column(String(128), nullable=False)
    subject = Column(String(128), nullable=False)
    student_count = Column(Integer, default=25)
    average_age = Column(Integer, default=10)
    session_duration_minutes = Column(Integer, default=60)
    methodology = Column(String(255), nullable=False)
    available_resources = Column(JSON, nullable=False)
    general_learning_pace = Column(Text, nullable=False)
    inclusion_support_needs = Column(JSON, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(String(64), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "grade": self.grade,
            "subject": self.subject,
            "student_count": self.student_count,
            "average_age": self.average_age,
            "session_duration_minutes": self.session_duration_minutes,
            "methodology": self.methodology,
            "available_resources": self.available_resources if isinstance(self.available_resources, list) else json.loads(self.available_resources or "[]"),
            "general_learning_pace": self.general_learning_pace,
            "inclusion_support_needs": self.inclusion_support_needs if isinstance(self.inclusion_support_needs, list) else json.loads(self.inclusion_support_needs or "[]"),
            "notes": self.notes or "",
            "created_at": self.created_at,
        }

class ResourceDB(Base):
    __tablename__ = "resources"

    id = Column(String(64), primary_key=True, index=True)
    resource_type = Column(String(64), nullable=False, index=True)
    classroom_id = Column(String(64), nullable=True)
    topic = Column(String(255), nullable=True)
    title = Column(String(255), nullable=True)
    data = Column(JSON, nullable=False)
    saved_at = Column(String(64), nullable=False)

    def to_dict(self):
        item_data = self.data if isinstance(self.data, dict) else json.loads(self.data or "{}")
        item_data["id"] = self.id
        item_data["resource_type"] = self.resource_type
        item_data["saved_at"] = self.saved_at
        return item_data

class FeedbackDB(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    resource_id = Column(String(64), nullable=False)
    stars = Column(Integer, default=5)
    relevance_rating = Column(Integer, default=5)
    estimated_minutes_saved = Column(Integer, default=60)
    qualitative_comment = Column(Text, nullable=True)
    created_at = Column(String(64), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "resource_id": self.resource_id,
            "stars": self.stars,
            "relevance_rating": self.relevance_rating,
            "estimated_minutes_saved": self.estimated_minutes_saved,
            "qualitative_comment": self.qualitative_comment,
            "created_at": self.created_at,
        }

engine = None
SessionLocal = None
_db_status = {
    "mode": "uninitialized",
    "postgres_connected": False,
    "error": None
}

def init_database():
    global engine, SessionLocal, _db_status

    if DATABASE_URL:
        try:
            pg_engine = create_engine(
                DATABASE_URL,
                pool_pre_ping=True,
                pool_recycle=300,
                pool_size=5,
                max_overflow=10,
            )
            # Test connection
            with pg_engine.connect() as conn:
                pass

            Base.metadata.create_all(bind=pg_engine)
            engine = pg_engine
            SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))
            _db_status = {
                "mode": "postgres",
                "postgres_connected": True,
                "error": None
            }
            print("Successfully connected to Supabase PostgreSQL!")
            return
        except Exception as e:
            err_msg = str(e)
            print(f"PostgreSQL connection failed ({err_msg}). Falling back to resilient SQLite...")
            _db_status = {
                "mode": "sqlite_fallback",
                "postgres_connected": False,
                "error": err_msg
            }

    # Fallback: SQLite in writable DATA_DIR (works on local and Vercel /tmp)
    try:
        sqlite_file = DATA_DIR / "aulamia.db"
        sqlite_url = f"sqlite:///{sqlite_file}"
        sqlite_engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=sqlite_engine)
        engine = sqlite_engine
        SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))
        if _db_status["mode"] != "sqlite_fallback":
            _db_status = {
                "mode": "sqlite",
                "postgres_connected": False,
                "error": "No DATABASE_URL configured"
            }
        print(f"Resilient database active: {sqlite_url}")
    except Exception as e:
        print(f"Fatal error initializing fallback database: {e}")
        engine = None
        SessionLocal = None

init_database()

def get_db_status() -> Dict[str, Any]:
    return _db_status

def get_db():
    if SessionLocal:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    else:
        yield None
