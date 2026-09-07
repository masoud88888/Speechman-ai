/**
 * Client service for Gemini TTS.
 * Each user provides their own Gemini API key.
 */

export interface GenerateSpeechParams {
  text: string;
  voiceName: string;
  rate?: number;
  pitch?: number;
}

export interface SpeechSynthesisResult {
  audio: string;
  isFallback?: boolean;
  quotaExceeded?: boolean;
  retryAfterSeconds?: number;
  message?: string;
}

export async function generateSpeech({
  text,
  voiceName,
  rate = 1.0,
  pitch = 1.0,
}: GenerateSpeechParams): Promise<SpeechSynthesisResult> {
  if (!text || !text.trim()) {
    throw new Error("Please enter some English text to convert to speech.");
  }

  // Ask the user for their own Gemini API key if one isn't saved for this session.
  let apiKey = sessionStorage.getItem("USER_GEMINI_API_KEY");

  if (!apiKey) {
    apiKey = window.prompt(
      "Enter your Gemini API Key.\n\nYour key is used only for your requests."
    );

    if (!apiKey || !apiKey.trim()) {
      throw new Error("Gemini API key is required.");
    }

    apiKey = apiKey.trim();
    sessionStorage.setItem("USER_GEMINI_API_KEY", apiKey);
  }

  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-gemini-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        voiceName,
        rate,
        pitch,
      }),
    });

    const rawText = await response.text();

    let data: any = null;

    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }

    if (!response.ok) {
      let errorMessage = `Speech synthesis failed with status ${response.status}`;

      if (data?.error) {
        errorMessage =
          typeof data.error === "string"
            ? data.error
            : data.error.message || errorMessage;
      }

      throw new Error(errorMessage);
    }

    if (!data?.audio) {
      throw new Error("No audio content was returned.");
    }

    return {
      audio: data.audio,
      isFallback: Boolean(data.isFallback),
      quotaExceeded: Boolean(data.quotaExceeded),
      retryAfterSeconds: data.retryAfterSeconds,
      message: data.message,
    };
  } catch (error: any) {
    console.warn(
      "Notice during speech request:",
      error?.message || "Service error"
    );

    throw error;
  }
}