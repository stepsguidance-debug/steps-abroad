export type Role = "admin" | "student";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Student extends User {
  role: "student";
  status: "pending" | "in_progress" | "completed";
  aiReadiness: number | null;
}

export type QuestionType = "mcq" | "scale" | "forced";

export interface Question {
  _id: string;
  section: string;
  sectionTitle: string;
  text: string;
  type: QuestionType;
  options?: string[];
  order: number;
}

export type AiRisk = "low" | "medium" | "high";

export interface CareerFitItem {
  title: string;
  ug: string;
  pg: string;
  roles: string[];
  aiRisk: AiRisk;
  advice: string;
}

export interface SectionScore {
  section: string;
  title: string;
  score: number;
  fit: "Strong" | "Moderate" | "Weak";
}

export interface ContradictionFlag {
  area: string;
  note: string;
}

export interface Result {
  _id: string;
  userId: string;
  userName: string;
  aiReadinessIndex: number;
  traitScores: { Analytical: number; Creative: number; Applied: number; Social: number };
  behaviourProfile: string;
  sectionScores: SectionScore[];
  contradictionFlags: ContradictionFlag[];
  careerFit: { primary: CareerFitItem[]; secondary: CareerFitItem[] };
  aiSummary: string;
  generatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
