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
import { error } from "console";
import "dotenv/config";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
export const geminiRequest = (content) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let prefixPrompt = "Analyze this text from the president (Donald Trump). Return 'Reading Level', 'Market Impact', 'Stupidity Level', 'highlights', 'title', and 'summary'. For Market impact, return a number betwee 1 and 10, with 1 will not impact the US stock market widely at all and 10 will hugely impact the US stock market. Writing level is the level of writing of writer used in schools and colleges. Stupidity level is a number from 1 to 10 on how stupid the message is, with 1 being not stupid at all and 10 being extremely stupid (this in regards to how good or bad an idea this in regards to the topic and if it is likely to achieve said goal). For 'highlights', flame him and be condesending and critical as possible using facts, stats and logic. For 'title', provide a short title for text (a few words or less) and should be mean. For 'summary', provide a brief (no more than 50 words) summary of the text. Text from Donald Trump: ";
        const response = yield ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prefixPrompt + content,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        writingLevel: {
                            type: Type.INTEGER,
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
                        },
                        title: {
                            type: Type.STRING,
                        },
                        summary: {
                            type: Type.STRING,
                        },
                    },
                },
            },
        });
        return response;
    }
    catch (err) {
        console.error("Error with Gemini:", err);
        throw error;
    }
});
//# sourceMappingURL=gemini_API.js.map