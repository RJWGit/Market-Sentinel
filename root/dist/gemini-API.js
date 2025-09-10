var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";
import { EMBED_MAX_CHARACTER_VALUE_FIELD, EMBED_MAX_CHARACTER_TITLE_FIELD, ANALYSIS_PROMPT } from "./constants.js";
import { truncateString } from "./utils.js";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const AI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const GEMINI_MODEL_VERSION = "gemini-2.5-flash";
export const geminiRequest = (content) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield AI.models.generateContent({
        model: GEMINI_MODEL_VERSION,
        contents: ANALYSIS_PROMPT + content,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    marketImpact: {
                        type: Type.INTEGER,
                        minimum: 1,
                        maximum: 10,
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
});
const validateGeminiResponse = (rawResponse) => {
    if (rawResponse === null || rawResponse === void 0 ? void 0 : rawResponse.text) {
        let parsedResponse = JSON.parse(rawResponse === null || rawResponse === void 0 ? void 0 : rawResponse.text);
        if ((parsedResponse === null || parsedResponse === void 0 ? void 0 : parsedResponse.summary.length) > EMBED_MAX_CHARACTER_VALUE_FIELD) {
            parsedResponse.summary = truncateString(parsedResponse.summary, EMBED_MAX_CHARACTER_VALUE_FIELD);
        }
        if ((parsedResponse === null || parsedResponse === void 0 ? void 0 : parsedResponse.title.length) > EMBED_MAX_CHARACTER_TITLE_FIELD) {
            parsedResponse.title = truncateString(parsedResponse.title, EMBED_MAX_CHARACTER_TITLE_FIELD);
        }
        return parsedResponse;
    }
    else {
        console.error("Gemini Response: ", JSON.stringify(rawResponse));
        throw new Error("Failed to parse Gemini response:");
    }
};
//# sourceMappingURL=gemini-API.js.map