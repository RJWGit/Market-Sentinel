import { GenerateContentResponse, GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";
import { EMBED_MAX_CHARACTER_VALUE_FIELD, EMBED_MAX_CHARACTER_TITLE_FIELD, ANALYSIS_PROMPT } from "./constants.js";
import { GeminiResponseDJT } from "./types.js";
import { truncateString } from "./utils.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const AI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const GEMINI_MODEL_VERSION = "gemini-2.5-flash";

export const geminiRequest = async (content: string): Promise<GeminiResponseDJT> => {
  const response = await AI.models.generateContent({
    model: GEMINI_MODEL_VERSION,
    contents: ANALYSIS_PROMPT + content,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          writingLevel: {
            type: Type.INTEGER,
            minimum: 1,
            maximum: 20,
          },
          marketImpact: {
            type: Type.INTEGER,
            minimum: 1,
            maximum: 10,
          },
          stupidityLevel: {
            type: Type.INTEGER,
            minimum: 1,
            maximum: 10,
          },
          highlights: {
            type: Type.STRING,
            maximum: EMBED_MAX_CHARACTER_VALUE_FIELD,
          },
          title: {
            type: Type.STRING,
            maximum: EMBED_MAX_CHARACTER_TITLE_FIELD,
          },
          summary: {
            type: Type.STRING,
            maximum: EMBED_MAX_CHARACTER_VALUE_FIELD,
          },
        },
      },
    },
  });

  let parsedResponse = validateGeminiResponse(response);

  return parsedResponse;
};

const validateGeminiResponse = (rawResponse: GenerateContentResponse): GeminiResponseDJT => {
  if (rawResponse?.text) {
    let parsedResponse: GeminiResponseDJT = JSON.parse(rawResponse?.text);

    if (parsedResponse?.summary.length > EMBED_MAX_CHARACTER_VALUE_FIELD) {
      parsedResponse.summary = truncateString(parsedResponse.summary, EMBED_MAX_CHARACTER_VALUE_FIELD);
    }

    if (parsedResponse?.highlights.length > EMBED_MAX_CHARACTER_VALUE_FIELD) {
      parsedResponse.highlights = truncateString(parsedResponse.highlights, EMBED_MAX_CHARACTER_VALUE_FIELD);
    }

    if (parsedResponse?.title.length > EMBED_MAX_CHARACTER_TITLE_FIELD) {
      parsedResponse.title = truncateString(parsedResponse.title, EMBED_MAX_CHARACTER_TITLE_FIELD);
    }

    return parsedResponse;
  } else {
    console.error("Gemini Response: ", JSON.stringify(rawResponse));
    throw new Error("Failed to parse Gemini response:");
  }
};
