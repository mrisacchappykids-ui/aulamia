import {
  ClassroomProfile,
  LessonPlan,
  ActivitySet,
  EvaluationResource,
  EducationalGame,
  AdaptationResult,
  DashboardStats,
  EducationalMaterial,
  FeedbackRating
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Error en API (${res.status}): ${errorBody || res.statusText}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`API Request failed on ${endpoint}:`, err);
    throw err;
  }
}

// ----------------- Classroom Profiles -----------------

export async function getClassrooms(): Promise<ClassroomProfile[]> {
  return fetchJson<ClassroomProfile[]>("/classrooms/");
}

export async function getClassroom(id: string): Promise<ClassroomProfile> {
  return fetchJson<ClassroomProfile>(`/classrooms/${id}`);
}

export async function createClassroom(profile: Omit<ClassroomProfile, "id" | "created_at">): Promise<ClassroomProfile> {
  return fetchJson<ClassroomProfile>("/classrooms/", {
    method: "POST",
    body: JSON.stringify(profile),
  });
}

export async function updateClassroom(id: string, profile: Omit<ClassroomProfile, "id" | "created_at">): Promise<ClassroomProfile> {
  return fetchJson<ClassroomProfile>(`/classrooms/${id}`, {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

export async function deleteClassroom(id: string): Promise<{ message: string }> {
  return fetchJson<{ message: string }>(`/classrooms/${id}`, {
    method: "DELETE",
  });
}

// ----------------- Generators -----------------

export async function generateLessonPlan(data: {
  classroom_id: string;
  topic: string;
  learning_objective: string;
  specific_competencies?: string[];
  custom_notes?: string;
}): Promise<LessonPlan> {
  return fetchJson<LessonPlan>("/planner/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function generateActivities(data: {
  classroom_id: string;
  topic: string;
  main_focus?: string;
}): Promise<ActivitySet> {
  return fetchJson<ActivitySet>("/activities/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function generateEvaluation(data: {
  classroom_id: string;
  topic: string;
  evaluation_type?: string;
  question_count?: number;
}): Promise<EvaluationResource> {
  return fetchJson<EvaluationResource>("/evaluations/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function generateGame(data: {
  classroom_id: string;
  topic: string;
  game_style?: string;
}): Promise<EducationalGame> {
  return fetchJson<EducationalGame>("/games/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function adaptResource(data: {
  classroom_id: string;
  original_title: string;
  original_content: string;
  target_barrier?: string;
}): Promise<AdaptationResult> {
  return fetchJson<AdaptationResult>("/adaptations/adapt", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function generateMaterial(data: {
  classroom_id: string;
  topic: string;
  material_type?: string;
  custom_title?: string;
}): Promise<EducationalMaterial> {
  return fetchJson<EducationalMaterial>("/materials/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ----------------- Stats, History & Feedback -----------------

export async function getStats(): Promise<DashboardStats> {
  return fetchJson<DashboardStats>("/resources/stats");
}

export async function getResources(type?: string): Promise<any[]> {
  const query = type ? `?resource_type=${encodeURIComponent(type)}` : "";
  return fetchJson<any[]>(`/resources/${query}`);
}

export async function deleteResource(id: string): Promise<{ message: string }> {
  return fetchJson<{ message: string }>(`/resources/${id}`, {
    method: "DELETE",
  });
}

export async function submitFeedback(data: FeedbackRating): Promise<{ message: string }> {
  return fetchJson<{ message: string }>("/resources/feedback", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

