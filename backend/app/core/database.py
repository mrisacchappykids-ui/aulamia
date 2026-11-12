import json
import logging
from contextlib import contextmanager
from threading import Lock

from sqlalchemy import create_engine, Column, String, Integer, Text, JSON, select
from sqlalchemy.engine import URL
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.schema import CreateSchema
from app.core.config import DATABASE_URL, DATA_DIR, SERVERLESS

Base = declarative_base()
logger = logging.getLogger(__name__)
PRIVATE_SCHEMA = "aulamia_private"

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
        item_data = dict(self.data) if isinstance(self.data, dict) else json.loads(self.data or "{}")
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

class UserDB(Base):
    __tablename__ = "aulamia_users"
    __table_args__ = {"schema": PRIVATE_SCHEMA}

    id = Column(String(64), primary_key=True)
    email = Column(String(254), unique=True, nullable=False)
    name = Column(Text, nullable=False)
    password_hash = Column(String(64), nullable=True)
    salt = Column(String(64), nullable=True)
    google_subject = Column(String(255), unique=True, nullable=True)
    institution = Column(Text, nullable=False)
    specialty = Column(Text, nullable=False)
    role = Column(String(64), nullable=False)
    created_at = Column(String(64), nullable=False)


class AuthSessionDB(Base):
    __tablename__ = "aulamia_sessions"
    __table_args__ = {"schema": PRIVATE_SCHEMA}

    token_hash = Column(String(64), primary_key=True)
    user_id = Column(String(64), index=True, nullable=False)
    expires_at = Column(Integer, index=True, nullable=False)


class DataImportDB(Base):
    __tablename__ = "aulamia_data_imports"
    __table_args__ = {"schema": PRIVATE_SCHEMA}

    name = Column(String(64), primary_key=True)


class StorageUnavailable(Exception):
    pass


engine = None
SessionLocal = None
_init_lock = Lock()


def create_postgres_engine():
    return create_engine(
        DATABASE_URL, pool_pre_ping=True, pool_recycle=300,
        pool_size=2, max_overflow=2, pool_timeout=5, hide_parameters=True,
        connect_args={"connect_timeout": 3},
    )


def get_session_factory():
    global engine, SessionLocal

    with _init_lock:
        if SessionLocal is not None:
            return SessionLocal
        if SERVERLESS and not DATABASE_URL:
            raise StorageUnavailable("Configura la conexión a PostgreSQL del backend.")

        if DATABASE_URL:
            candidate = create_postgres_engine()
        else:
            DATA_DIR.mkdir(parents=True, exist_ok=True)
            candidate = create_engine(
                URL.create("sqlite", database=str(DATA_DIR / "aulamia.db")),
                execution_options={"schema_translate_map": {PRIVATE_SCHEMA: None}},
            )

        try:
            with candidate.begin() as connection:
                if DATABASE_URL:
                    connection.execute(CreateSchema(PRIVATE_SCHEMA, if_not_exists=True))
                Base.metadata.create_all(bind=connection)
        except Exception:
            candidate.dispose()
            raise
        engine = candidate
        SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)
        return SessionLocal


@contextmanager
def storage_session():
    try:
        factory = get_session_factory()
    except (SQLAlchemyError, OSError, ValueError, ImportError) as error:
        logger.warning("Database initialization failed (%s)", type(error).__name__)
        raise StorageUnavailable("La base de datos no está disponible. Intenta de nuevo en unos minutos.") from None
    try:
        with factory.begin() as session:
            yield session
    except SQLAlchemyError as error:
        logger.warning("Database operation failed (%s)", type(error).__name__)
        raise StorageUnavailable("La base de datos no está disponible. Intenta de nuevo en unos minutos.") from None


def insert_if_absent(session, table, values):
    insert = pg_insert if session.bind.dialect.name == "postgresql" else sqlite_insert
    result = session.execute(insert(table).values(**values).on_conflict_do_nothing())
    return result.rowcount == 1


def get_db_status():
    if DATABASE_URL:
        # Preview and production may share the same database. A health check only pings it.
        active_engine = engine
        temporary_engine = None
        try:
            if active_engine is None:
                temporary_engine = active_engine = create_postgres_engine()
            with active_engine.connect() as connection:
                connection.execute(select(1))
        except (SQLAlchemyError, OSError, ValueError, ImportError):
            return {"mode": "unavailable", "postgres_connected": False}
        finally:
            if temporary_engine is not None:
                temporary_engine.dispose()
        return {"mode": "postgres", "postgres_connected": True}

    try:
        with storage_session() as session:
            session.execute(select(1))
    except StorageUnavailable:
        return {"mode": "unavailable", "postgres_connected": False}
    return {"mode": "sqlite", "postgres_connected": False}
