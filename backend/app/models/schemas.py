from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# ----------------- Classroom Context Schemas -----------------

class ClassroomProfileBase(BaseModel):
    name: str = Field(..., example="5° A - Matemáticas Inclusiva")
    grade: str = Field(..., example="5° de Primaria")
    subject: str = Field(..., example="Matemáticas")
    student_count: int = Field(25, example=25)
    average_age: int = Field(10, example=10)
    session_duration_minutes: int = Field(60, example=60)
    methodology: str = Field("Aprendizaje Basado en Proyectos (ABP)", example="Aprendizaje Basado en Proyectos (ABP)")
    available_resources: List[str] = Field(
        default_factory=lambda: ["Computador docente", "Proyector", "Material concreto", "Cuadernos"],
        example=["Computador docente", "Proyector", "Material concreto", "Cuadernos"]
    )
    general_learning_pace: str = Field(
        "Ritmo diverso, requiere apoyos visuales y segmentación de tareas",
        example="Ritmo diverso, requiere apoyos visuales y segmentación de tareas"
    )
    inclusion_support_needs: List[str] = Field(
        default_factory=lambda: [
            "Instrucciones segmentadas en pasos breves",
            "Mayor apoyo visual y gráficos",
            "Tiempo adicional para procesar respuestas",
            "Menor cantidad de ítems por ficha"
        ]
    )
    notes: Optional[str] = Field(None, example="Grupo participativo con alta motivación en actividades prácticas")

class ClassroomProfile(ClassroomProfileBase):
    id: str
    created_at: str

# ----------------- Lesson Plan Schemas -----------------

class LessonPhase(BaseModel):
    phase_name: str
    duration_minutes: int
    teacher_action: str
    student_action: str
    required_materials: List[str]

class LessonPlanRequest(BaseModel):
    classroom_id: str
    topic: str = Field(..., example="Suma y resta de fracciones con igual y diferente denominador")
    learning_objective: str = Field(..., example="Resolver situaciones problemáticas cotidianas utilizando adición y sustracción de fracciones")
    specific_competencies: Optional[List[str]] = Field(default_factory=list)
    custom_notes: Optional[str] = None

class LessonPlan(BaseModel):
    id: str
    classroom_id: str
    topic: str
    title: str
    grade: str
    subject: str
    learning_objective: str
    competencies: List[str]
    phases: List[LessonPhase]
    universal_design_adaptations: List[str]
    formative_evaluation_strategy: str
    learning_evidences: List[str]
    created_at: str

# ----------------- Activity Schemas -----------------

class ActivityVariant(BaseModel):
    level: str  # "base", "refuerzo", "profundizacion", "adaptada"
    title: str
    description: str
    step_by_step_instructions: List[str]
    pedagogical_support: str
    expected_deliverable: str

class ActivityRequest(BaseModel):
    classroom_id: str
    topic: str
    main_focus: Optional[str] = "Práctica conceptual y colaborativa"

class ActivitySet(BaseModel):
    id: str
    classroom_id: str
    topic: str
    title: str
    estimated_time_minutes: int
    base_activity: ActivityVariant
    reinforcement_activity: ActivityVariant
    deepening_activity: ActivityVariant
    adapted_activity: ActivityVariant
    pedagogical_rationale: str
    created_at: str

# ----------------- Evaluation Schemas -----------------

class QuizQuestion(BaseModel):
    id: int
    question_text: str
    question_type: str = "multiple_choice"  # "multiple_choice" | "open_reflection" | "practical_case"
    options: Optional[List[str]] = None
    correct_option_index: Optional[int] = None
    explanation_and_feedback: str
    inclusion_hint: Optional[str] = None

class RubricCriteria(BaseModel):
    criteria_name: str
    level_emerging: str
    level_developing: str
    level_proficient: str
    level_advanced: str

class EvaluationRequest(BaseModel):
    classroom_id: str
    topic: str
    evaluation_type: str = "formativa"  # "formativa", "diagnostica", "sumativa"
    question_count: int = 5

class EvaluationResource(BaseModel):
    id: str
    classroom_id: str
    topic: str
    title: str
    evaluation_type: str
    questions: List[QuizQuestion]
    rubric: List[RubricCriteria]
    adaptation_guidelines: List[str]
    created_at: str

# ----------------- Educational Game Schemas -----------------

class GameItem(BaseModel):
    id: int
    prompt: str
    options: List[str]
    correct_index: int
    points: int = 100
    fun_fact_or_feedback: str
    visual_clue: Optional[str] = None

class EducationalGameRequest(BaseModel):
    classroom_id: str
    topic: str
    game_style: str = "trivia_interactiva"  # "trivia_interactiva", "desafio_relampago", "asociacion"

class EducationalGame(BaseModel):
    id: str
    classroom_id: str
    topic: str
    game_title: str
    game_style: str
    instructions: str
    items: List[GameItem]
    reward_badge_name: str
    inclusion_accommodations: List[str]
    created_at: str

# ----------------- Adaptation (1-Click) Schemas -----------------

class AdaptationRequest(BaseModel):
    classroom_id: str
    original_title: str
    original_content: str
    target_barrier: Optional[str] = None

class AdaptationResult(BaseModel):
    id: str
    classroom_id: str
    original_title: str
    adapted_title: str
    applied_profile_summary: Dict[str, Any]
    simplified_instructions: List[str]
    visual_and_structural_supports: List[str]
    differentiated_workload: str
    recommended_pacing: str
    teacher_pedagogical_guidance: str
    created_at: str

# ----------------- Educational Material (Fichas & Guías) Schemas -----------------

class MaterialSection(BaseModel):
    section_number: int
    title: str
    instructions: str
    exercises_or_activities: List[str]
    visual_clue_or_scaffolding: Optional[str] = None

class EducationalMaterialRequest(BaseModel):
    classroom_id: str
    topic: str
    material_type: str = "ficha_de_trabajo"  # "ficha_de_trabajo", "guia_taller", "organizador_grafico"
    custom_title: Optional[str] = None

class EducationalMaterial(BaseModel):
    id: str
    classroom_id: str
    topic: str
    title: str
    material_type: str
    grade: str
    subject: str
    header_fields: Dict[str, str]  # Estudiante, Fecha, Docente, Grado
    introductory_concept: str
    sections: List[MaterialSection]
    metacognitive_exit_ticket: str
    teacher_implementation_tip: str
    created_at: str

# ----------------- Pedagogical Feedback & Metrics -----------------

class FeedbackRating(BaseModel):
    resource_id: str
    stars: int = Field(5, ge=1, le=5)
    relevance_rating: int = Field(5, ge=1, le=5)
    estimated_minutes_saved: int = Field(60, ge=5)
    qualitative_comment: Optional[str] = None


# ----------------- Authentication Schemas -----------------

class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, example='María Rodríguez')
    email: str = Field(..., min_length=5, example='maria.rodriguez@aulamia.edu.co')
    password: str = Field(..., min_length=6, example='docente123')
    institution: Optional[str] = Field('Institución Educativa', example='Colegio San José')
    specialty: Optional[str] = Field('Docente de Aula', example='Matemáticas y Tecnología')
    role: Optional[str] = Field('Docente', example='Docente')

class UserLoginRequest(BaseModel):
    email: str = Field(..., example='profesor@aulamia.edu.co')
    password: str = Field(..., example='docente123')

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    institution: str
    specialty: str
    role: str
    created_at: str

class AuthResponse(BaseModel):
    message: str
    token: str
    user: UserResponse
