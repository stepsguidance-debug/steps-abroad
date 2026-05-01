export type Role = "admin" | "student";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  status?: "pending" | "answered";
}

export interface Student extends User {
  role: "student";
  status: "pending" | "answered";
  aiReadiness: number | null;
}

export type QuestionType = "mcq" | "scale" | "forced-choice";

export interface QuestionChoice {
  label: string;
  value: string;
  allowCustomInput?: boolean;
  customInputPlaceholder?: string;
  weights: {
    analytical: number;
    creative: number;
    applied: number;
    social: number;
    aiReadiness: number;
  };
}

export interface Question {
  _id: string;
  section: string;
  sectionTitle: string;
  questionText: string;
  type: QuestionType;
  layer: "L1" | "L2" | "L3" | "L4" | "L5";
  choices: QuestionChoice[];
  order: number;
}

export interface NewQuestionInput {
  section: string;
  questionText: string;
  type: QuestionType;
  layer: "L1" | "L2" | "L3" | "L4" | "L5";
  choices: QuestionChoice[];
}

export type AiRisk = "safe" | "at-risk" | "high-risk";

export interface CareerJobRole {
  title: string;
  aiRisk: AiRisk;
  riskLabel: "AI-resilient" | "Watch closely" | "High AI risk";
  whatAiIsDoing: string;
  whatStudentShouldDo: string;
}

export interface CareerFitItem {
  career: string;
  matchPercent: number;
  ugDegrees: string[];
  pgDegrees: string[];
  jobRoles: CareerJobRole[];
}

export interface RejectedCareer {
  career: string;
  matchPercent: number;
  reason: string;
}

export interface SectionScore {
  section: string;
  score: number;
  fit: "Strong" | "Moderate" | "Weak";
}

export interface BehaviourProfile {
  ambiguity: "High" | "Medium" | "Low";
  discipline: "High" | "Medium" | "Low";
  riskAppetite: "High" | "Medium" | "Low";
}

export interface Result {
  _id: string;
  userId: string;
  userName: string;
  aiReadinessIndex: number;
  traitScores: { analytical: number; creative: number; applied: number; social: number };
  behaviourProfile: BehaviourProfile;
  sectionScores: SectionScore[];
  contradictionFlags: string[];
  careerFit: { primary: CareerFitItem; secondary: CareerFitItem; rejected: RejectedCareer[] };
  aiSuggestionSummary: string;
  generatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
