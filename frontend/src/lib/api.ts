import {
  ClassroomProfile,
  LessonPlan,
  ActivitySet,
  EvaluationResource,
  EducationalGame,
  AdaptationResult,
  DashboardStats,
  EducationalMaterial,
  FeedbackRating,
  UserRegisterData,
  UserLoginData,
  AuthResponse,
  User
} from "@/types";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  (process.env.NODE_ENV === "production" ? "https://aulamia-76ay.vercel.app" : "http://localhost:8000")
).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  if (options?.body) headers.set("Content-Type", "application/json");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options, headers, signal: controller.signal, cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const detail = body?.detail;
      const message = typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((item) => `${item.loc?.at(-1) ?? "Campo"}: ${item.msg}`).join(". ")
          : `El servidor de AulaMIA respondió con un error (${res.status}).`;
      throw new ApiError(message, res.status);
    }
    if (res.status === 204) return undefined as T;
    if (!res.headers.get("content-type")?.includes("application/json")) {
      throw new ApiError("La dirección configurada no está devolviendo respuestas de la API de AulaMIA.", res.status);
    }
    return await res.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) {
      throw new Error("El servidor tardó demasiado en responder. Intenta de nuevo.");
    }
    throw new Error("No pudimos comunicarnos con el servidor de AulaMIA. Revisa tu conexión e intenta de nuevo.");
  } finally {
    clearTimeout(timeout);
  }
}

// ----------------- Authentication -----------------

export async function registerUser(data: UserRegisterData): Promise<AuthResponse> {
  return fetchJson<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: UserLoginData): Promise<AuthResponse> {
  return fetchJson<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function demoLogin(): Promise<AuthResponse> {
  return fetchJson<AuthResponse>("/auth/demo-login");
}

export async function googleLogin(credential: string): Promise<AuthResponse> {
  return fetchJson<AuthResponse>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

export async function getCurrentUser(token: string): Promise<User> {
  return fetchJson<User>("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
}

export async function endSession(token: string): Promise<void> {
  return fetchJson<void>("/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
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
