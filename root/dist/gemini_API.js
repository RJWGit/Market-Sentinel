"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiRequest = exports.GEMINI_API_KEY = void 0;
const genai_1 = require("@google/genai");
exports.GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new genai_1.GoogleGenAI({ apiKey: exports.GEMINI_API_KEY });
const geminiRequest = (content) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield ai.models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: content,
    });
    return response;
});
exports.geminiRequest = geminiRequest;
//# sourceMappingURL=gemini_API.js.map