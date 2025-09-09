import { getCurrentWorkingDirectory } from "./utils.js";
import * as path from "path"; // Needed for path.join

export const EMBED_MAX_CHARACTER_VALUE_FIELD = 1024;
export const EMBED_MAX_CHARACTER_TITLE_FIELD = 256;
export const ANALYSIS_PROMPT = `Analyze this text from the president (Donald Trump). Return 'Reading Level', 'Market Impact', 'Stupidity Level', 'highlights', 'title', and 'summary'. For Market impact, return a number betwee 1 and 10, with 1 will not impact the US stock market widely at all and 10 will hugely impact the US stock market. Writing level is the level of writing of writer used in schools and colleges. Stupidity level is a number from 1 to 10 on how stupid the message is, with 1 being not stupid at all and 10 being extremely stupid (this in regards to how good or bad an idea this in regards to the topic and if it is likely to achieve said goal). For 'highlights', flame him and be condesending and critical as possible using facts, stats and logic. For 'title', provide a short title for text (a few words or less) and should be mean. For 'summary', provide a brief (no more than 50 words) summary of the text. Text from Donald Trump: `;
export const __dirname = getCurrentWorkingDirectory();
export const RAW_TRUTH_OUTPUT_DIRECTORY = path.join(__dirname, "../src/truth_output/raw_truth_output");
export const FILTERED_TRUTH_OUTPUT_DIRECTORY = path.join(__dirname, "../src/truth_output/filtered_truth_output");
export const RAW_TRUTH_OUTPUT_FILE_PATH = path.join(__dirname, "../src/truth_output/raw_truth_output/output.txt");
export const FILTERED_TRUTH_OUTPUT_FILE_PATH = path.join(
  __dirname,
  "../src/truth_output/filtered_truth_output/output.json"
);
export const TRUMP_PICS_PATH = path.join(__dirname, "../trumppics");
export const DJT_TRUTH_BATCH_UPDATE_PATH = path.join(__dirname, "../../fetch.bat");
export const enum TimeUnit {
  SECOND = 1000,
  MINUTE = 60000,
}
export const enum DiscordChannelIds {
  MARKET = "1371300443715801209",
  TRUMP_MEMES = "1399172278012481718",
}
export const enum EmbedFieldNames {
  MARKET_IMPACT = "Market Impact",
  REGARDED_LEVEL = "Regardation Level",
  WRITING_LEVEL = "Writing Grade Level",
  HIGHLIGHT = "Highlight",
}
