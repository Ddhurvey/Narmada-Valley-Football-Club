import { NextResponse } from "next/server";

type ToolType =
  | "club_report"
  | "match_report"
  | "news_draft"
  | "social_caption"
  | "sponsor_update"
  | "training_summary";

type GenerateRequest = {
  tool: ToolType;
  input: string;
  language?: "en" | "hi";
};

type ListModelsResponse = {
  models?: Array<{
    name?: string;
    supportedGenerationMethods?: string[];
  }>;
};

function buildPrompt(tool: ToolType, input: string, language: "en" | "hi") {
  const langNote = language === "hi" ? "Write in Hindi." : "Write in English.";

  switch (tool) {
    case "club_report":
      return `${langNote}
You are a football club analyst. Create a concise club report using the input data.
Format with these sections: Summary, Highlights, Key Stats (bullets), Risks/Issues, Next Actions.
Keep it professional and ready for sharing with management.

Input data:
${input}`;
    case "match_report":
      return `${langNote}
You are a match reporter. Write a match report using the input data.
Include: Result line, Match Summary, Key Moments, Standout Players, Coach Notes.
Keep it vivid but factual.

Input data:
${input}`;
    case "news_draft":
      return `${langNote}
You are a club communications writer. Draft a news article using the input data.
Include: Headline, Lead paragraph, Body (2-4 short paragraphs), Quote (optional), Closing line.
Tone: confident and community-friendly.

Input data:
${input}`;
    case "social_caption":
      return `${langNote}
You are a social media manager. Create 3 short caption options using the input data.
Include relevant emojis and up to 3 hashtags per option.

Input data:
${input}`;
    case "sponsor_update":
      return `${langNote}
You are writing a sponsor update. Summarize outcomes, exposure, and next opportunities.
Format: Overview, Impact Highlights (bullets), Upcoming Opportunities, CTA.

Input data:
${input}`;
    case "training_summary":
      return `${langNote}
You are a performance analyst. Summarize training session outcomes.
Include: Objectives, Attendance, Intensity notes, Key drills, Improvement points, Next session focus.

Input data:
${input}`;
    default:
      return `${langNote}
Summarize the following input as a concise report:
${input}`;
  }
}

function normalizeModelName(modelName?: string) {
  if (!modelName) return "";
  return modelName.replace(/^models\//, "");
}

async function getFallbackModel(apiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    { method: "GET" }
  );

  if (!response.ok) {
    return { model: null, available: [] as string[] };
  }

  const data = (await response.json()) as ListModelsResponse;
  const models = data.models ?? [];
  const supported = models
    .filter((model) =>
      model.supportedGenerationMethods?.includes("generateContent")
    )
    .map((model) => normalizeModelName(model.name));

  const preferredOrder = [
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-2.5-pro",
    "gemini-pro-latest",
    "gemini-2.5-flash-lite",
    "gemini-flash-lite-latest",
  ];

  const preferredMatch = preferredOrder.find((name) => supported.includes(name));
  if (preferredMatch) {
    return { model: preferredMatch, available: supported };
  }

  return { model: supported[0] ?? null, available: supported };
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
    // Default to a currently available model for this API key
    let model = process.env.GOOGLE_AI_MODEL || "gemini-2.5-flash";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GOOGLE_AI_STUDIO_API_KEY" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as GenerateRequest;
    const tool = body?.tool ?? "club_report";
    const input = body?.input?.trim();
    const language = body?.language ?? "en";

    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    const prompt = buildPrompt(tool, input, language);

    const makeRequest = async (modelName: string) =>
      fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

    const fallbackInfo = await getFallbackModel(apiKey);
    if (fallbackInfo.available.length > 0 && !fallbackInfo.available.includes(model)) {
      model = fallbackInfo.model ?? model;
    }

    let response = await makeRequest(model);

    if (!response.ok) {
      const errorText = await response.text();

      const shouldFallback =
        response.status === 404 ||
        errorText.toLowerCase().includes("not found") ||
        errorText.toLowerCase().includes("not supported");

      if (shouldFallback) {
        const fallbackModel = fallbackInfo.model;
        if (fallbackModel && fallbackModel !== model) {
          model = fallbackModel;
          response = await makeRequest(model);
        }
      }

      if (!response.ok) {
        const finalErrorText = await response.text();
        return NextResponse.json(
          {
            error: "AI request failed",
            modelUsed: model,
            details: finalErrorText,
          },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "No content returned.";

    return NextResponse.json({ result: text });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
