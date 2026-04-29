// Single fetch wrapper. Falls back to in-memory mocks when VITE_API_BASE_URL is not set.
import {
  MOCK_ADMIN,
  MOCK_QUESTIONS,
  MOCK_RESULTS,
  MOCK_STUDENTS,
} from "./mocks";
import type { AuthResponse, Question, Result, Student, User } from "./types";

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

// Mutable in-memory copies for mock CRUD
let mockStudents: Student[] = [...MOCK_STUDENTS];
const mockResults: Record<string, Result> = { ...MOCK_RESULTS };

export const apiClient = {
  usingMocks: USING_MOCKS,

  async login(email: string, password: string, role: "admin" | "student"): Promise<AuthResponse> {
    if (USING_MOCKS) {
      // Demo creds
      if (role === "admin" && email === "admin@stepsguidance.com" && password === "Admin123!") {
        return { token: "mock-admin-token", user: MOCK_ADMIN };
      }
      if (role === "student") {
        // accept any non-empty creds for the demo
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
    return request<Student[]>("/api/admin/users");
  },

  async addStudent(input: { name: string; email: string; password: string }): Promise<Student> {
    if (USING_MOCKS) {
      const s: Student = {
        _id: `s-${Date.now()}`,
        name: input.name,
        email: input.email,
        role: "student",
        status: "pending",
        aiReadiness: null,
      };
      mockStudents = [s, ...mockStudents];
      return s;
    }
    return request<Student>("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async deleteStudent(id: string): Promise<void> {
    if (USING_MOCKS) {
      mockStudents = mockStudents.filter((s) => s._id !== id);
      return;
    }
    await request<void>(`/api/admin/users/${id}`, { method: "DELETE" });
  },

  async getQuestions(): Promise<Question[]> {
    if (USING_MOCKS) return MOCK_QUESTIONS;
    return request<Question[]>("/api/questions");
  },

  async submitResponses(answers: Array<{ questionId: string; value: string | number }>): Promise<Result> {
    if (USING_MOCKS) {
      // Simulate AI thinking
      await new Promise((r) => setTimeout(r, 1800));
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
