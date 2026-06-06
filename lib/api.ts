// lib/api.ts
import { AuthResponse, Course, ReportCardResponse } from "../types";

// Replace this with your production Render backend URL when live
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong with the API call.");
  }

  return data as T;
}

export const api = {
  // Authentication Namespace
  auth: {
    register: (body: any) =>
      request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    login: (body: any) =>
      request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  // Courses Namespace
  courses: {
    getAll: () => request<Course[]>("/courses", { method: "GET" }),
    create: (body: {
      course_code: string;
      course_title: string;
      unit_counts: number;
    }) =>
      request<{ message: string; course: Course }>("/courses", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  // Results / CGPA Namespace
  results: {
    uploadScore: (body: {
      student_id: number;
      course_id: number;
      ca_score: number;
      exam_score: number;
      semester: string;
      academic_year: string;
    }) =>
      request<{ message: string; data: any }>("/results/score", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    getReportCard: (studentId: number) =>
      request<ReportCardResponse>(`/results/report/${studentId}`, {
        method: "GET",
      }),
  },
};
