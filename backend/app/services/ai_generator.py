import os
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
import requests
from app.core.config import GEMINI_API_KEY
from app.models.schemas import (
    ClassroomProfile,
    LessonPlan,
    LessonPhase,
    ActivitySet,
    ActivityVariant,
    EvaluationResource,
    QuizQuestion,
    RubricCriteria,
    EducationalGame,
    GameItem,
    AdaptationResult,
    EducationalMaterial,
    MaterialSection
)

class AIGeneratorService:
    @staticmethod
    def _call_gemini_if_available(prompt: str, system_instruction: str) -> Optional[str]:
        if not GEMINI_API_KEY:
            return None
        try:
            # Using Gemini 1.5 or 2.0 API endpoint
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "system_instruction": {"parts": [{"text": system_instruction}]},
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "response_mime_type": "application/json",
                    "temperature": 0.4
                }
            }
            resp = requests.post(url, json=payload, timeout=20)
            if resp.status_code == 200:
                result = resp.json()
                text = result["candidates"][0]["content"]["parts"][0]["text"]
                return text
        except Exception:
            pass
        return None

    @classmethod
    def generate_lesson_plan(
        cls,
        classroom: ClassroomProfile,
        topic: str,
        learning_objective: str,
        competencies: Optional[List[str]] = None,
        custom_notes: Optional[str] = None
    ) -> LessonPlan:
        gemini_prompt = f"""
Genera una planeación de clase estructurada para AulaMIA en formato JSON.
Contexto del Aula:
- Grado: {classroom.grade}
- Asignatura: {classroom.subject}
- Estudiantes: {classroom.student_count} (Edad promedio: {classroom.average_age} años)
- Duración de sesión: {classroom.session_duration_minutes} minutos
- Metodología: {classroom.methodology}
- Recursos disponibles: {', '.join(classroom.available_resources)}
- Ritmo de aprendizaje: {classroom.general_learning_pace}
- Apoyos e inclusión requeridos: {', '.join(classroom.inclusion_support_needs)}
- Tema de la clase: {topic}
- Objetivo pedagógico: {learning_objective}
{f"- Competencias: {', '.join(competencies)}" if competencies else ""}
{f"- Notas del docente: {custom_notes}" if custom_notes else ""}

Estructura JSON requerida:
{{
  "title": "string",
  "competencies": ["string"],
  "phases": [
    {{
      "phase_name": "Inicio / Enganche",
      "duration_minutes": 10,
      "teacher_action": "string",
      "student_action": "string",
      "required_materials": ["string"]
    }},
    {{
      "phase_name": "Desarrollo / Exploración guiada",
      "duration_minutes": 30,
      "teacher_action": "string",
      "student_action": "string",
      "required_materials": ["string"]
    }},
    {{
      "phase_name": "Cierre / Metacognición",
      "duration_minutes": 10,
      "teacher_action": "string",
      "student_action": "string",
      "required_materials": ["string"]
    }}
  ],
  "universal_design_adaptations": ["string (ajuste DUA específico)"],
  "formative_evaluation_strategy": "string",
  "learning_evidences": ["string"]
}}
"""
        system_inst = "Eres un asistente pedagógico de élite para AulaMIA. Tu misión es generar planeaciones realistas, inclusivas y contextualizadas sin diagnósticos médicos clínicos."
        gemini_resp = cls._call_gemini_if_available(gemini_prompt, system_inst)

        if gemini_resp:
            try:
                data = json.loads(gemini_resp)
                return LessonPlan(
                    id=f"plan-{uuid.uuid4().hex[:8]}",
                    classroom_id=classroom.id,
                    topic=topic,
                    title=data.get("title", f"Planeación Contextual: {topic}"),
                    grade=classroom.grade,
                    subject=classroom.subject,
                    learning_objective=learning_objective,
                    competencies=data.get("competencies", competencies or [f"Apropiación contextual de {topic}"]),
                    phases=[LessonPhase(**p) for p in data.get("phases", [])],
                    universal_design_adaptations=data.get("universal_design_adaptations", classroom.inclusion_support_needs),
                    formative_evaluation_strategy=data.get("formative_evaluation_strategy", "Evaluación formativa continua basada en evidencias"),
                    learning_evidences=data.get("learning_evidences", ["Producción guiada y reflexión final"]),
                    created_at=datetime.now().isoformat()
                )
            except Exception:
                pass

        # Contextual Pedagogical Fallback Engine
        dur = classroom.session_duration_minutes
        inicio_dur = max(8, int(dur * 0.2))
        cierre_dur = max(8, int(dur * 0.2))
        desarrollo_dur = dur - inicio_dur - cierre_dur

        support_tags = ", ".join(classroom.inclusion_support_needs[:2])

        comp_list = competencies if competencies and len(competencies) > 0 else [
            f"Comprensión conceptual y aplicación práctica de {topic}",
            "Comunicación asertiva de ideas y razonamiento pedagógico",
            "Resolución colaborativa de desafíos en el aula"
        ]

        phases = [
            LessonPhase(
                phase_name="Inicio / Enganche y Activación de Saberes",
                duration_minutes=inicio_dur,
                teacher_action=f"El docente presenta un detonante cotidiano sobre '{topic}' mediante {classroom.available_resources[0] if classroom.available_resources else 'preguntas generadoras'}. Explica el propósito en lenguaje claro y modela visualmente el concepto clave.",
                student_action=f"Los estudiantes participan respondiendo preguntas cortas, comparten experiencias previas en parejas y activan organizadores gráficos rápidos en sus cuadernos.",
                required_materials=[classroom.available_resources[0] if classroom.available_resources else "Tablero", "Guía visual introductoria"]
            ),
            LessonPhase(
                phase_name="Desarrollo / Exploración Guiada y Práctica Multinivel",
                duration_minutes=desarrollo_dur,
                teacher_action=f"Implementa la metodología '{classroom.methodology}'. Dosifica la instrucción en 2 momentos breves. Circula por el aula ofreciendo andamiaje diferenciado (apoyos específicos: {support_tags}).",
                student_action=f"Trabajan en equipos heterogéneos resolviendo situaciones prácticas sobre '{topic}'. Utilizan {classroom.available_resources[-1] if classroom.available_resources else 'materiales del aula'} para experimentar y contrastar soluciones.",
                required_materials=classroom.available_resources[:3]
            ),
            LessonPhase(
                phase_name="Cierre / Metacognición y Síntesis Inclusiva",
                duration_minutes=cierre_dur,
                teacher_action=f"Facilita una ronda de síntesis con semáforo de autoevaluación o ticket de salida con apoyos gráficos. Refuerza positivamente los logros observados.",
                student_action="Cada estudiante completa un ticket de salida (opción escrita, gráfica o verbal) respondiendo: ¿Qué descubrí hoy sobre este tema y qué duda aún tengo?",
                required_materials=["Ticket de salida / organizador de síntesis"]
            )
        ]

        adaptations = [
            f"Principio DUA (Múltiples formas de representación): {classroom.inclusion_support_needs[0] if len(classroom.inclusion_support_needs) > 0 else 'Uso de apoyos visuales y modelado explícito'}.",
            f"Principio DUA (Múltiples formas de acción y expresión): Permitir entregables orales, esquemáticos o escritos según la preferencia del estudiante.",
            f"Ajuste razonable de tiempo: Segmentación del desarrollo en bloques de 15 minutos con comprobación de comprensión intermedia.",
            f"Acompañamiento entre pares: Asignación de parejas de apoyo colaborativo sin sobrecargar a ningún estudiante."
        ]

        return LessonPlan(
            id=f"plan-{uuid.uuid4().hex[:8]}",
            classroom_id=classroom.id,
            topic=topic,
            title=f"Secuencia Didáctica: {topic} en el contexto de {classroom.grade}",
            grade=classroom.grade,
            subject=classroom.subject,
            learning_objective=learning_objective,
            competencies=comp_list,
            phases=phases,
            universal_design_adaptations=adaptations,
            formative_evaluation_strategy=f"Observación formativa con lista de cotejo cualitativa durante la fase de desarrollo y ticket de salida de metacognición.",
            learning_evidences=[
                f"Ficha o producto de trabajo sobre {topic} completado en equipo o individualmente.",
                "Registro de participación y autoevaluación en el ticket de salida."
            ],
            created_at=datetime.now().isoformat()
        )

    @classmethod
    def generate_activities(cls, classroom: ClassroomProfile, topic: str, main_focus: Optional[str] = None) -> ActivitySet:
        focus = main_focus or "Práctica significativa y contextualizada"
        support_detail = "; ".join(classroom.inclusion_support_needs)

        base_variant = ActivityVariant(
            level="base",
            title=f"Desafío Central: Exploradores de {topic}",
            description=f"Actividad diseñada para el estándar de {classroom.grade}. Permite a los {classroom.student_count} estudiantes interactuar con el concepto central de manera colaborativa.",
            step_by_step_instructions=[
                f"1. Analizar el caso o problema guía planteado por el docente.",
                f"2. Identificar los elementos esenciales de {topic} utilizando {classroom.available_resources[0] if classroom.available_resources else 'apuntes'}.",
                f"3. Desarrollar la solución en parejas aplicando la metodología {classroom.methodology}.",
                f"4. Sintetizar las conclusiones en un esquema visual conjunto."
            ],
            pedagogical_support="Modelado inicial por parte del docente con 1 ejemplo resuelto paso a paso.",
            expected_deliverable="Esquema o solución fundamentada del problema en el cuaderno o formato de trabajo."
        )

        reinforcement_variant = ActivityVariant(
            level="refuerzo",
            title=f"Paso a Paso Guiado: Fundamentos de {topic}",
            description=f"Diseñada para afianzar conceptos previos y brindar seguridad metodológica a estudiantes que requieren ritmo más pautado.",
            step_by_step_instructions=[
                f"1. Observar la tarjeta de apoyo visual que desglosa {topic} en 3 partes fundamentales.",
                f"2. Completar los dos primeros ejercicios guiados con apoyo de pistas gráficas.",
                f"3. Contrastar las respuestas con la pareja de aprendizaje antes de continuar.",
                f"4. Formular en una frase sencilla qué significa el concepto aprendido."
            ],
            pedagogical_support=f"Instrucciones segmentadas con apoyos visuales ({classroom.inclusion_support_needs[0] if classroom.inclusion_support_needs else 'esquemas breves'}). Menor cantidad de ítems.",
            expected_deliverable="Ficha de andamiaje con ejercicios base completados y autoverificados."
        )

        deepening_variant = ActivityVariant(
            level="profundizacion",
            title=f"Laboratorio Creativo: Reto Avanzado de {topic}",
            description=f"Para estudiantes con avance acelerado que buscan transferir {topic} a situaciones complejas o de la vida real.",
            step_by_step_instructions=[
                f"1. Analizar un dilema o situación cotidiana no estructurada vinculada a {topic}.",
                f"2. Diseñar una propuesta innovadora o método alternativo de resolución.",
                f"3. Crear una analogía o mini-guía explicativa para enseñar este concepto a otros compañeros.",
                f"4. Proponer 2 preguntas desafiantes que inviten al debate grupal."
            ],
            pedagogical_support="Preguntas metacognitivas abiertas y autonomía investigativa.",
            expected_deliverable="Propuesta de transferencia aplicada o recurso didáctico creado para el aula."
        )

        adapted_variant = ActivityVariant(
            level="adaptada",
            title=f"Versión Accesible DUA: {topic} con Apoyo Multinivel",
            description=f"Ajuste específico para estudiantes que requieren adecuaciones de acceso y formato ({support_detail}), sin reducir la dignidad del aprendizaje.",
            step_by_step_instructions=[
                f"1. Revisar la lámina ilustrada con pictogramas/esquema que resume la idea clave de {topic}.",
                f"2. Realizar la actividad manipulativa o de emparejamiento utilizando {classroom.available_resources[-1] if classroom.available_resources else 'tarjetas de colores'}.",
                f"3. Expresar la respuesta seleccionando opciones visuales o mediante explicación oral grabada/asistida.",
                f"4. Recibir retroalimentación inmediata y celebrar el progreso del logro alcanzado."
            ],
            pedagogical_support=f"Ajustes razonables activos: {support_detail}. Reducción de carga cognitiva textual y apoyo de mediador.",
            expected_deliverable="Registro gráfico o selección de opciones verificada con el docente."
        )

        return ActivitySet(
            id=f"act-{uuid.uuid4().hex[:8]}",
            classroom_id=classroom.id,
            topic=topic,
            title=f"Set de Actividades Diferenciadas: {topic}",
            estimated_time_minutes=classroom.session_duration_minutes,
            base_activity=base_variant,
            reinforcement_activity=reinforcement_variant,
            deepening_activity=deepening_variant,
            adapted_activity=adapted_variant,
            pedagogical_rationale=f"Diseño Universal para el Aprendizaje (DUA). Permite al docente de {classroom.grade} atender la diversidad de ritmos en un solo espacio pedagógico sin segregar a los estudiantes.",
            created_at=datetime.now().isoformat()
        )

    @classmethod
    def generate_evaluations(cls, classroom: ClassroomProfile, topic: str, eval_type: str = "formativa") -> EvaluationResource:
        questions = [
            QuizQuestion(
                id=1,
                question_text=f"En el contexto de {topic}, ¿cuál de las siguientes afirmaciones describe mejor su propósito o funcionamiento principal?",
                question_type="multiple_choice",
                options=[
                    f"Permite estructurar y resolver situaciones problemáticas paso a paso con evidencia clara.",
                    "Es un procedimiento memorístico que se aplica únicamente de forma aislada sin relación con el entorno.",
                    "Corresponde solo a un concepto teórico sin aplicación demostrable en {classroom.grade}.",
                    "Es un requisito formal que no influye en la comprensión del área de {classroom.subject}."
                ],
                correct_option_index=0,
                explanation_and_feedback=f"Excelente: comprender el sentido práctico de {topic} es clave para su apropiación pedagógica.",
                inclusion_hint=f"Pista visual: Recuerda el ejemplo cotidiano que revisamos con {classroom.available_resources[0] if classroom.available_resources else 'el docente'}."
            ),
            QuizQuestion(
                id=2,
                question_text=f"Si un grupo de estudiantes en {classroom.grade} se enfrenta a un desafío práctico sobre {topic}, ¿cuál sería el primer paso metodológico recomendado?",
                question_type="multiple_choice",
                options=[
                    "Comenzar a escribir sin leer las condiciones del problema.",
                    "Identificar qué datos o elementos se conocen y qué objetivo se necesita alcanzar.",
                    "Esperar a que otro equipo complete todo el trabajo.",
                    "Cambiar de tema inmediatamente."
                ],
                correct_option_index=1,
                explanation_and_feedback="La comprensión inicial del problema es fundamental antes de ejecutar cualquier cálculo o procedimiento.",
                inclusion_hint="Pista: Primero leemos y subrayamos los datos que tenemos disponibles."
            ),
            QuizQuestion(
                id=3,
                question_text=f"Explica con tus propias palabras o mediante un dibujo cómo le explicarías a un compañero de clase qué es {topic} y para qué sirve.",
                question_type="open_reflection",
                options=None,
                correct_option_index=None,
                explanation_and_feedback=f"Esta pregunta valora la apropiación reflexiva y permite expresión escrita, oral o esquemática.",
                inclusion_hint="Puedes usar un esquema de tres partes: '¿Qué es?', '¿Un ejemplo?', '¿Por qué importa?'."
            ),
            QuizQuestion(
                id=4,
                question_text=f"Ante una dificultad al trabajar con {topic}, ¿qué estrategia de autorregulación resulta más efectiva?",
                question_type="multiple_choice",
                options=[
                    "Desistir y no entregar nada.",
                    "Consultar la guía de apoyo visual, releer el paso anterior o pedir clarificación a un par o al docente.",
                    "Borrar todo y empezar desde cero sin reflexionar sobre el error.",
                    "Adivinar la respuesta final."
                ],
                correct_option_index=1,
                explanation_and_feedback="El error pedagógico es una oportunidad de aprendizaje cuando se utilizan apoyos y mediación.",
                inclusion_hint="Pista: Apóyate en las tarjetas de andamiaje disponibles en el aula."
            )
        ]

        rubric = [
            RubricCriteria(
                criteria_name=f"Comprensión conceptual de {topic}",
                level_emerging="Reconoce términos aislados con apoyo docente constante y modelado.",
                level_developing="Identifica los elementos clave de la temática con asistencia ocasional.",
                level_proficient="Aplica los conceptos centrales con autonomía y precisión en situaciones estándar.",
                level_advanced="Transfiere el concepto a situaciones nuevas y propone soluciones creativas."
            ),
            RubricCriteria(
                criteria_name="Uso de estrategias y recursos de aprendizaje",
                level_emerging="Requiere mediación directa para utilizar los recursos y apoyos visuales disponibles.",
                level_developing="Utiliza los apoyos visuales o manipulativos cuando se le recuerda.",
                level_proficient="Selecciona y emplea eficientemente los recursos del aula para resolver el reto.",
                level_advanced="Optimiza el uso de recursos y colabora orientando a sus compañeros."
            ),
            RubricCriteria(
                criteria_name="Comunicación y justificación del resultado",
                level_emerging="Comunica ideas breves con asistencia de preguntas orientadoras.",
                level_developing="Describe el procedimiento seguido de manera sencilla.",
                level_proficient="Justifica con claridad sus conclusiones utilizando vocabulario acorde al grado.",
                level_advanced="Argumenta sólidamente su proceso y reflexiona sobre sus propios aprendizajes."
            )
        ]

        guidelines = [
            "Flexibilidad de formato: Permitir respuesta oral, señalización o apoyo gráfico a estudiantes que lo requieran.",
            "Segmentación de la evaluación: Posibilidad de aplicar las preguntas en 2 bloques con breve receso intermedio.",
            "Lectura guiada: Lectura en voz alta de las consignas por parte del docente o facilitador.",
            "Valoración positiva del esfuerzo y retroalimentación formativa inmediata no punitiva."
        ]

        return EvaluationResource(
            id=f"eval-{uuid.uuid4().hex[:8]}",
            classroom_id=classroom.id,
            topic=topic,
            title=f"Evaluación Formativa y Rúbrica Contextual: {topic}",
            evaluation_type=eval_type,
            questions=questions,
            rubric=rubric,
            adaptation_guidelines=guidelines,
            created_at=datetime.now().isoformat()
        )

    @classmethod
    def generate_game(cls, classroom: ClassroomProfile, topic: str, game_style: str = "trivia_interactiva") -> EducationalGame:
        items = [
            GameItem(
                id=1,
                prompt=f"🌟 Pregunta 1: Para iniciar nuestro viaje por {topic}, ¿cuál es la idea principal que debemos recordar?",
                options=[
                    f"Comprender el concepto y relacionarlo con nuestro día a día.",
                    "Memorizar una fórmula sin entender para qué sirve.",
                    "Resolver todo a máxima velocidad sin revisar.",
                    "Hacerlo individualmente sin compartir ideas."
                ],
                correct_index=0,
                points=100,
                fun_fact_or_feedback=f"¡Increíble! Relacionar {topic} con tu entorno te ayuda a comprenderlo para siempre.",
                visual_clue="💡 Pista: Pensar en cómo lo usamos en la vida diaria."
            ),
            GameItem(
                id=2,
                prompt=f"⚡ Desafío 2: En {classroom.subject}, cuando resolvemos una situación de {topic}, ¿qué herramienta o recurso nos ayuda a verificar el resultado?",
                options=[
                    "Cerrar los ojos e imaginarlo al azar.",
                    f"Utilizar {classroom.available_resources[-1] if classroom.available_resources else 'apoyos visuales o dibujos'} para comprobar.",
                    "Preguntar solo si está bien sin comprobar.",
                    "Borrar todo rápidamente."
                ],
                correct_index=1,
                points=150,
                fun_fact_or_feedback="¡Muy bien jugado! Comprobar con dibujos o materiales concretos refuerza tu seguridad.",
                visual_clue="🔍 Pista: Recuerda los apoyos que tenemos en el salón."
            ),
            GameItem(
                id=3,
                prompt=f"🚀 Misión 3: Si un compañero de equipo tiene dudas con este tema, ¿cuál es la mejor actitud colaborativa?",
                options=[
                    "Hacer su parte para terminar antes.",
                    "Explicarle con un ejemplo sencillo y con paciencia.",
                    "Decirle que no es importante.",
                    "Ignorar su pregunta."
                ],
                correct_index=1,
                points=200,
                fun_fact_or_feedback="¡Espíritu de equipo total! Enseñar a otros es una de las mejores formas de aprender.",
                visual_clue="🤝 Pista: Compartir saberes enriquece al grupo."
            ),
            GameItem(
                id=4,
                prompt=f"🏆 Gran Final: ¿Cuál de estas afirmaciones sobre {topic} es una verdad pedagógica?",
                options=[
                    "El error no existe, si te equivocas ya no puedes aprender.",
                    "Equivocarse y revisar el error es parte del camino para aprender mejor.",
                    "Solo las personas que terminan de primero son inteligentes.",
                    "Aprender este tema solo sirve para el examen de mañana."
                ],
                correct_index=1,
                points=250,
                fun_fact_or_feedback="¡Respuesta de campeonato! Los científicos y pensadores aprenden cada día de sus ensayos y revisiones.",
                visual_clue="✨ Pista: El aprendizaje es un proceso continuo."
            )
        ]

        return EducationalGame(
            id=f"game-{uuid.uuid4().hex[:8]}",
            classroom_id=classroom.id,
            topic=topic,
            game_title=f"Misión Interactiva: El Reto de {topic}",
            game_style=game_style,
            instructions=f"Juego pedagógico adaptado para {classroom.grade}. Responde cada desafío, acumula puntos para tu equipo y desbloquea la insignia de maestría en {topic}.",
            items=items,
            reward_badge_name=f"Insignia Maestro/a de {topic}",
            inclusion_accommodations=[
                "Sin temporizador estresante: el estudiante puede tomarse el tiempo necesario.",
                "Pista visual disponible en cada pregunta para andamiaje cognitivo.",
                "Retroalimentación positiva en cada intento sin penalizaciones frustrantes.",
                "Letra clara y alto contraste de color."
            ],
            created_at=datetime.now().isoformat()
        )

    @classmethod
    def adapt_content_to_classroom(
        cls,
        classroom: ClassroomProfile,
        original_title: str,
        original_content: str,
        target_barrier: Optional[str] = None
    ) -> AdaptationResult:
        applied_profile = {
            "grade": classroom.grade,
            "subject": classroom.subject,
            "student_count": classroom.student_count,
            "key_supports": classroom.inclusion_support_needs,
            "target_barrier": target_barrier or "Diversidad de ritmos y necesidad de apoyos visuales segmentados"
        }

        simplified_steps = [
            "Paso 1 (Activación visual): Presentar el objetivo central con una imagen o esquema simple de 1 sola idea.",
            "Paso 2 (Instrucción dosificada): Reducir la consigna original a oraciones breves numeradas, eliminando textos extensos.",
            "Paso 3 (Modelado previo): El docente o guía resuelve el primer ítem en conjunto con el estudiante antes de la práctica autónoma.",
            "Paso 4 (Comprobación formativa): Usar tarjetas de verificación rápida para confirmar que el estudiante se siente seguro antes de avanzar."
        ]

        supports = [
            f"Organizadores gráficos y pictogramas para {classroom.grade}.",
            "Resaltado con código de colores para datos o instrucciones clave.",
            "Uso de material manipulativo o digital accesible en el aula.",
            "Eliminación de distractores visuales y reducción de densidad en la página."
        ]

        return AdaptationResult(
            id=f"adapt-{uuid.uuid4().hex[:8]}",
            classroom_id=classroom.id,
            original_title=original_title,
            adapted_title=f"{original_title} (Adaptado para: {classroom.name})",
            applied_profile_summary=applied_profile,
            simplified_instructions=simplified_steps,
            visual_and_structural_supports=supports,
            differentiated_workload="Carga cognitiva ajustada: Se prioriza la profundidad de comprensión sobre la cantidad de ejercicios.",
            recommended_pacing=f"Sesión fragmentada en bloques de 12 a 15 minutos dentro de los {classroom.session_duration_minutes} min totales.",
            teacher_pedagogical_guidance="Importante: Esta adaptación es una propuesta pedagógica para facilitar el acceso al currículo. El docente tiene la potestad de ajustar los niveles y validar la pertinencia para cada estudiante.",
            created_at=datetime.now().isoformat()
        )

    @classmethod
    def generate_educational_material(
        cls,
        classroom: ClassroomProfile,
        topic: str,
        material_type: str = "ficha_de_trabajo",
        custom_title: Optional[str] = None
    ) -> EducationalMaterial:
        title = custom_title or f"Ficha de Aprendizaje Activo: {topic}"
        support_note = classroom.inclusion_support_needs[0] if classroom.inclusion_support_needs else "Apoyo visual reforzado"

        sections = [
            MaterialSection(
                section_number=1,
                title="Paso 1: ¿Qué vamos a explorar hoy? (Activación de saberes)",
                instructions="Observa atentamente el esquema gráfico y responde brevemente con tus propias palabras o un dibujo.",
                exercises_or_activities=[
                    f"Escribe o dibuja 1 ejemplo de tu vida cotidiana donde hayas observado o usado {topic}.",
                    f"Comenta en voz baja con tu compañero/a de al lado qué idea tienen en común."
                ],
                visual_clue_or_scaffolding=f"💡 Pista de apoyo ({support_note}): Recuerda lo aprendido en la sesión introductoria."
            ),
            MaterialSection(
                section_number=2,
                title="Paso 2: Manos a la obra (Práctica guiada en equipo o individual)",
                instructions=f"Resuelve los siguientes 3 desafíos aplicando la metodología {classroom.methodology}.",
                exercises_or_activities=[
                    f"Ejercicio A (Nivel Base): Identifica y señala los 2 elementos principales de {topic}.",
                    f"Ejercicio B (Aplicación): Utiliza los recursos del aula ({classroom.available_resources[-1] if classroom.available_resources else 'dibujos o esquemas'}) para representar la solución paso a paso.",
                    f"Ejercicio C (Comprobación): Explica brevemente por qué tu resultado tiene sentido lógico."
                ],
                visual_clue_or_scaffolding="🔍 Recuerda: Puedes consultar las tarjetas de apoyo visual y trabajar en parejas cooperativas."
            ),
            MaterialSection(
                section_number=3,
                title="Paso 3: Reto de Profundización / Aplicación Creativa",
                instructions="Imagina que debes enseñarle este concepto a un estudiante de un grado menor. ¿Cómo se lo explicarías?",
                exercises_or_activities=[
                    "Diseña una mini-regla mnemotécnica o un esquema visual en 3 pasos que resuma el aprendizaje de hoy."
                ],
                visual_clue_or_scaffolding="✨ Si prefieres, puedes grabar una nota de voz o realizar una demostración práctica para el docente."
            )
        ]

        exit_ticket = "Ticket de Salida (Autoevaluación DUA): Marca con una cara cómo te sentiste hoy: 🟢 Lo entendí y puedo explicarlo | 🟡 Lo entendí pero tengo una duda | 🔴 Necesito un poco más de práctica guiada. ¿Qué fue lo más interesante que aprendiste hoy?"

        teacher_tip = f"Orientación para el docente en {classroom.grade}: Esta ficha cuenta con andamiaje visual y menor densidad textual. Se recomienda dar 10 minutos para el Paso 1, 20 minutos para el Paso 2 con andamiaje activo, y 10 minutos finales para el ticket de salida."

        return EducationalMaterial(
            id=f"mat-{uuid.uuid4().hex[:8]}",
            classroom_id=classroom.id,
            topic=topic,
            title=title,
            material_type=material_type,
            grade=classroom.grade,
            subject=classroom.subject,
            header_fields={
                "Estudiante": "________________________________________",
                "Fecha": "____ / ____ / ________",
                "Grado": classroom.grade,
                "Asignatura": classroom.subject
            },
            introductory_concept=f"Hoy aprenderemos sobre '{topic}'. El objetivo no es memorizar, sino comprender cómo funciona y aplicar soluciones creativas utilizando los recursos a nuestro alcance.",
            sections=sections,
            metacognitive_exit_ticket=exit_ticket,
            teacher_implementation_tip=teacher_tip,
            created_at=datetime.now().isoformat()
        )

