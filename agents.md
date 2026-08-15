# AI Agents Integration

This document outlines the AI agents integrated into **Steps Guidance** to provide personalized career assessments. The application relies on Google's Gemini models to process student answers, derive insights, and generate narrative reports.

---

## 1. The Core AI Agent (Career Advisor)

The primary agent acts as an expert Career Advisor. It takes the quantitative results of the student's assessment (section scores and trait values) and produces a comprehensive, empathetic, and actionable career report.

### Responsibilities
- **Analyze Trait Profiles**: Interprets raw scores across 7 sections (A–G).
- **Determine Career Matches**: Suggests suitable career paths based on the student's unique combination of traits.
- **Generate AI Narrative**: Writes a 3-4 paragraph summary in plain, encouraging language tailored to the student.
- **Assess Readiness**: Outputs an "AI Readiness Score" indicating how prepared the student is for the changing job market.

### Configuration
- **Provider**: Google Gemini
- **Model**: Configured via `GEMINI_MODEL_PRO` (e.g., `gemini-2.5-pro` or `gemini-1.5-pro`).
- **Prompt Location**: The prompt engineering is handled entirely within `backend/services/resultService.js`.

---

## 2. The Data Pipeline

When a student clicks **Submit**, the following pipeline is triggered:

1. **Aggregation**: The backend calculates the student's score for each section based on their chosen options.
2. **Context Assembly**: The scores, student name, and metadata are combined into a structured prompt.
3. **Agent Invocation**: The prompt is sent to the Gemini API. The prompt explicitly instructs the LLM to return its response in **strictly valid JSON** format.
4. **Parsing & Validation**: The backend parses the JSON response, validates that all required fields (`ai_readiness_score`, `career_matches`, `ai_summary`) are present, and falls back to safe defaults if the agent hallucinates a malformed response.
5. **Persistence**: The validated result is stored in Firebase Firestore under the `results` collection and presented to the student.

---

## 3. Fallback & Resiliency Strategies

Because LLMs can occasionally timeout or return invalid structures, the system implements several resiliency measures:

### Model Fallbacks
If the primary `GEMINI_MODEL_PRO` fails or is overloaded, the system can be configured to automatically fall back to faster, lighter models (like `GEMINI_MODEL_FLASH`) as defined in `.env`.

### Rate Limiting & Queuing
To prevent hitting API rate limits during high-traffic events (e.g., a classroom of 30 students submitting simultaneously), the backend utilizes a queueing system (`GEMINI_QUEUE_DELAY_MS`). 

### Schema Enforcement
The backend strips out any markdown code blocks (e.g., ` ```json `) that the agent might accidentally include in its response before running `JSON.parse()`.

---

## 4. Environment Setup

To enable the AI agents, the following environment variables must be configured in `backend/.env`:

```dotenv
GEMINI_API_KEY="your-google-ai-studio-key"
GEMINI_MODEL_PRO="gemini-2.5-pro"
GEMINI_MODEL_FLASH="gemini-2.5-flash"
GEMINI_MODEL_SUMMARY="gemini-2.5-flash"
GEMINI_QUEUE_DELAY_MS=2000
GEMINI_QUEUE_MAX_SIZE=10
```

> **Note**: If the `GEMINI_API_KEY` is missing or invalid, the backend will fail to generate results, and students will see an error upon submission.
