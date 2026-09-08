import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ttsAudioCache = new Map<string, string>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  function parseQuotaError(error: any) {
    const errMsg =
      typeof error?.message === "string"
        ? error.message
        : JSON.stringify(error || "");

    const is429 =
      error?.status === 429 ||
      error?.code === 429 ||
      errMsg.includes("429") ||
      errMsg.includes("RESOURCE_EXHAUSTED") ||
      errMsg.includes("Quota exceeded");

    if (!is429) return null;

    let retrySeconds = 25;

    const matchDelay =
      errMsg.match(/retry in\s+([0-9.]+)\s*s/i) ||
      errMsg.match(/retryDelay"?:\s*"([0-9]+)s?"/i);

    if (matchDelay?.[1]) {
      const parsed = parseFloat(matchDelay[1]);

      if (!isNaN(parsed) && parsed > 0) {
        retrySeconds = Math.ceil(parsed);
      }
    }

    return {
      retrySeconds,
      message: `Gemini API quota reached. Please retry in ${retrySeconds}s.`,
    };
  }

  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voiceName, pitch } = req.body || {};

      if (!text || !text.trim()) {
        return res.status(400).json({
          error: "Text is required.",
        });
      }

      // Get the customer's Gemini API key from the request
      const userApiKey = req.headers["x-gemini-api-key"];

      if (!userApiKey || typeof userApiKey !== "string") {
        return res.status(401).json({
          error: "Gemini API key is required.",
        });
      }

      const apiKey = userApiKey.trim();

      if (!apiKey) {
        return res.status(401).json({
          error: "Gemini API key is required.",
        });
      }

      const validVoices = ["Charon", "Fenrir", "Puck"];

      const selectedVoice = validVoices.includes(voiceName)
        ? voiceName
        : "Charon";

      const normalizedText = text.trim();

      // Cache is separated by API key + voice + text
      const cacheKey = `${apiKey}:${selectedVoice}:${normalizedText}`;

      if (ttsAudioCache.has(cacheKey)) {
        return res.json({
          audio: ttsAudioCache.get(cacheKey),
          isFallback: false,
          voiceName: selectedVoice,
          cached: true,
        });
      }

      // Create Gemini client using the customer's key
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const modelsToTry = [
  "gemini-2.5-flash-preview-tts",
];

      let base64Audio: string | null = null;
      let lastError: any = null;

      for (const model of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: [
              {
                parts: [
                  {
                    text: `Please read this transcript aloud clearly and verbatim.
Pitch: ${pitch ?? 1.0}

Transcript:
${normalizedText}`,
                  },
                ],
              },
            ],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: selectedVoice,
                  },
                },
              },
            },
          });

          const data =
            response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

          if (data) {
            base64Audio = data;

            ttsAudioCache.set(cacheKey, data);

            break;
          }
        } catch (err: any) {
          lastError = err;

          console.warn(
            `[Gemini TTS ${model}] ${selectedVoice}:`,
            err?.message || err
          );
        }
      }

      if (base64Audio) {
        return res.json({
          audio: base64Audio,
          isFallback: false,
          voiceName: selectedVoice,
        });
      }

      const quotaInfo = parseQuotaError(lastError);

      if (quotaInfo) {
        return res.status(429).json({
          error: `Gemini API quota reached for ${selectedVoice}. Please try again in ${quotaInfo.retrySeconds}s.`,
          quotaExceeded: true,
          retryAfterSeconds: quotaInfo.retrySeconds,
          voiceName: selectedVoice,
        });
      }

      return res.status(500).json({
        error:
          lastError?.message ||
          "Failed to generate speech using Gemini official voice.",
      });
    } catch (error: any) {
      console.warn(
        "TTS generation warning:",
        error?.message || error
      );

      return res.status(500).json({
        error:
          error?.message ||
          "Unable to complete speech synthesis with Gemini API.",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
