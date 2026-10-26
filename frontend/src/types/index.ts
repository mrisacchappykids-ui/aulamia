export interface ClassroomProfile {
  id: string;
  name: string;
  grade: string;
  subject: string;
  student_count: number;
  average_age: number;
  session_duration_minutes: number;
  methodology: string;
  available_resources: string[];
  general_learning_pace: string;
  inclusion_support_needs: string[];
  notes?: string;
  created_at: string;
}

export interface LessonPhase {
  phase_name: string;
  duration_minutes: number;
  teacher_action: string;
  student_action: string;
  required_materials: string[];
}

export interface LessonPlan {
  id: string;
  classroom_id: string;
  topic: string;
  title: string;
  grade: string;
  subject: string;
  learning_objective: string;
  competencies: string[];
  phases: LessonPhase[];
  universal_design_adaptations: string[];
  formative_evaluation_strategy: string;
  learning_evidences: string[];
  created_at: string;
}

export interface ActivityVariant {
  level: "base" | "refuerzo" | "profundizacion" | "adaptada";
  title: string;
  description: string;
  step_by_step_instructions: string[];
  pedagogical_support: string;
  expected_deliverable: string;
}

export interface ActivitySet {
  id: string;
  classroom_id: string;
  topic: string;
  title: string;
  estimated_time_minutes: number;
  base_activity: ActivityVariant;
  reinforcement_activity: ActivityVariant;
  deepening_activity: ActivityVariant;
  adapted_activity: ActivityVariant;
  pedagogical_rationale: string;
  created_at: string;
}

export interface QuizQuestion {
  id: number;
  question_text: string;
  question_type: "multiple_choice" | "open_reflection" | "practical_case";
  options?: string[];
  correct_option_index?: number;
  explanation_and_feedback: string;
  inclusion_hint?: string;
}

export interface RubricCriteria {
  criteria_name: string;
  level_emerging: string;
  level_developing: string;
  level_proficient: string;
  level_advanced: string;
}

export interface EvaluationResource {
  id: string;
  classroom_id: string;
  topic: string;
  title: string;
  evaluation_type: string;
  questions: QuizQuestion[];
  rubric: RubricCriteria[];
  adaptation_guidelines: string[];
  created_at: string;
}

export interface GameItem {
  id: number;
  prompt: string;
  options: string[];
  correct_index: number;
  points: number;
  fun_fact_or_feedback: string;
  visual_clue?: string;
}

export interface EducationalGame {
  id: string;
  classroom_id: string;
  topic: string;
  game_title: string;
  game_style: string;
  instructions: string;
  items: GameItem[];
  reward_badge_name: string;
  inclusion_accommodations: string[];
  created_at: string;
}

export interface AdaptationResult {
  id: string;
  classroom_id: string;
  original_title: string;
  adapted_title: string;
  applied_profile_summary: {
    grade: string;
    subject: string;
    student_count: number;
    key_supports: string[];
    target_barrier: string;
  };
  simplified_instructions: string[];
  visual_and_structural_supports: string[];
  differentiated_workload: string;
  recommended_pacing: string;
  teacher_pedagogical_guidance: string;
  created_at: string;
}

export interface DashboardStats {
  total_resources_generated: number;
  plans_count: number;
  activities_count: number;
  evaluations_count: number;
  games_count: number;
  adaptations_count: number;
  materials_count: number;
  estimated_hours_saved: number;
  average_pedagogical_rating?: number;
  feedback_responses_count?: number;
}

export interface MaterialSection {
  section_number: number;
  title: string;
  instructions: string;
  exercises_or_activities: string[];
  visual_clue_or_scaffolding?: string;
}

export interface EducationalMaterial {
  id: string;
  classroom_id: string;
  topic: string;
  title: string;
  material_type: string;
  grade: string;
  subject: string;
  header_fields: Record<string, string>;
  introductory_concept: string;
  sections: MaterialSection[];
  metacognitive_exit_ticket: string;
  teacher_implementation_tip: string;
  created_at: string;
}

export interface FeedbackRating {
  resource_id: string;
  stars: number;
  relevance_rating: number;
  estimated_minutes_saved: number;
  qualitative_comment?: string;
}



// ----------------- Authentication Types -----------------

export interface User {
  id: string;
  name: string;
  email: string;
  institution: string;
  specialty: string;
  role: string;
  created_at: string;
}

export interface UserRegisterData {
  name: string;
  email: string;
  password: string;
  institution?: string;
  specialty?: string;
  role?: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
