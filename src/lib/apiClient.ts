// Single fetch wrapper. Falls back to in-memory mocks when VITE_API_BASE_URL is not set.
import {
  MOCK_ADMIN,
  MOCK_QUESTIONS,
  MOCK_RESULTS,
  MOCK_STUDENTS,
} from "./mocks";
import type { AuthResponse, NewQuestionInput, Question, Result, Student, User } from "./types";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "");
export const USING_MOCKS = !BASE_URL;

const TOKEN_KEY = "sg_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

let mockStudents: Student[] = [...MOCK_STUDENTS];
const mockResults: Record<string, Result> = { ...MOCK_RESULTS };

export const apiClient = {
  usingMocks: USING_MOCKS,

  async login(email: string, password: string, role: "admin" | "student"): Promise<AuthResponse> {
    if (USING_MOCKS) {
      if (role === "admin" && email === "admin" && password === "admin123") {
        return { token: "mock-admin-token", user: MOCK_ADMIN };
      }
      if (role === "student") {
        if (!email || !password) throw new Error("Enter email and password");
        return {
          token: "mock-student-token",
          user: { _id: "current-student", name: "Demo Student", email, role: "student" },
        };
      }
      throw new Error("Invalid credentials");
    }
    return request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    });
  },

  async getStudents(): Promise<Student[]> {
    if (USING_MOCKS) return mockStudents;
    return request<Student[]>("/api/admin/students");
  },

  async addStudent(input: { name: string; email: string; password: string }): Promise<Student> {
    if (USING_MOCKS) {
      const student: Student = {
        _id: `s-${Date.now()}`,
        name: input.name,
        email: input.email,
        role: "student",
        status: "pending",
        aiReadiness: null,
      };
      mockStudents = [student, ...mockStudents];
      return student;
    }
    return request<Student>("/api/admin/students", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async deleteStudent(id: string): Promise<void> {
    if (USING_MOCKS) {
      mockStudents = mockStudents.filter((student) => student._id !== id);
      return;
    }
    await request<void>(`/api/admin/students/${id}`, { method: "DELETE" });
  },

  async getQuestions(): Promise<Question[]> {
    if (USING_MOCKS) return MOCK_QUESTIONS;
    return request<Question[]>("/api/questions");
  },

  async addQuestion(input: NewQuestionInput): Promise<Question> {
    if (USING_MOCKS) {
      const created: Question = { _id: `q-${Date.now()}`, order: MOCK_QUESTIONS.length + 1, sectionTitle: input.section, ...input };
      (MOCK_QUESTIONS as Question[]).push(created);
      return created;
    }
    return request<Question>("/api/questions", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async deleteQuestion(id: string): Promise<void> {
    if (USING_MOCKS) {
      const index = MOCK_QUESTIONS.findIndex((question) => question._id === id);
      if (index >= 0) (MOCK_QUESTIONS as Question[]).splice(index, 1);
      return;
    }
    await request<void>(`/api/questions/${id}`, { method: "DELETE" });
  },

  async deleteQuestionOption(questionId: string, optionValue: string): Promise<Question> {
    if (USING_MOCKS) {
      const question = MOCK_QUESTIONS.find((item) => item._id === questionId);
      if (!question) throw new Error("Question not found");
      question.choices = question.choices.filter((choice) => choice.value !== optionValue);
      return question;
    }
    return request<Question>(`/api/questions/${questionId}/options/${encodeURIComponent(optionValue)}`, { method: "DELETE" });
  },

  async submitResponses(answers: Array<{ questionId: string; value: string; customAnswer?: string }>): Promise<Result> {
    if (USING_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 1800));
      return mockResults["current-student"];
    }
    return request<Result>("/api/responses/submit", {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  },

  async getResult(userId: string): Promise<Result | null> {
    if (USING_MOCKS) return mockResults[userId] ?? null;
    return request<Result>(`/api/results/${userId}`);
  },

  async getDraft(): Promise<{ answers: Array<{ questionId: string; selectedValue: string; selectedLabel: string; customAnswer?: string }> } | null> {
    if (USING_MOCKS) return null;
    try {
      return await request("/api/responses/draft");
    } catch {
      return null;
    }
  },

  async saveDraft(answers: Array<{ questionId: string; selectedValue: string; selectedLabel: string; customAnswer?: string }>): Promise<void> {
    if (USING_MOCKS) return;
    try {
      await request("/api/responses/draft", { method: "PATCH", body: JSON.stringify({ answers }) });
    } catch { /* best-effort */ }
  },

  async getQueueStatus(): Promise<{ position: number; isProcessing: boolean }> {
    if (USING_MOCKS) return { position: 0, isProcessing: false };
    try {
      return await request("/api/results/queue-status");
    } catch {
      return { position: 0, isProcessing: false };
    }
  },

  async getSystemHealth(): Promise<SystemHealthReport> {
    if (USING_MOCKS) {
      return {
        overall: "healthy",
        checks: [
          { name: "MongoDB Admin DB", status: "ok", detail: "stepsguidance_admin", responseMs: 12 },
          { name: "MongoDB Students DB", status: "ok", detail: "stepsguidance_students", responseMs: 18 },
          { name: "Gemini 2.5 Pro", status: "ok", detail: "gemini-2.5-pro", responseMs: 540 },
          { name: "Gemini 2.5 Flash (Search Grounding)", status: "ok", detail: "gemini-2.5-flash", responseMs: 380 },
          { name: "JWT Auth", status: "ok", detail: "Valid · expires in 7d" },
          { name: "Backend API", status: "ok", detail: "Mock mode (no backend)", responseMs: 0 },
        ],
      };
    }
    return request<SystemHealthReport>("/api/health/full");
  },

  saveAuth(token: string, user: User) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem("sg_user", JSON.stringify(user));
  },
  loadAuth(): { token: string; user: User } | null {
    const token = getToken();
    const userRaw = localStorage.getItem("sg_user");
    if (!token || !userRaw) return null;
    try {
      return { token, user: JSON.parse(userRaw) as User };
    } catch {
      return null;
    }
  },
  clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("sg_user");
  },
};
