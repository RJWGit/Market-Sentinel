import { getCurrentWorkingDirectory } from "./utils.js";
import * as path from "path"; // Needed for path.join
export const EMBED_MAX_CHARACTER_VALUE_FIELD = 1024;
export const EMBED_MAX_CHARACTER_TITLE_FIELD = 256;
export const ANALYSIS_PROMPT = `Analyze this text from the president (Donald Trump). Return 'Market Impact', 'title', and 'summary'. For Market impact, return a number betwee 1 and 10, with 1 will not impact the US stock market widely at all and 10 will hugely impact the US stock market. For 'title', provide a short title (a few words or less) that best suits the text. For 'summary', provide a brief (no more than 50 words) summary of the text. Text from Donald Trump: `;
export const __dirname = getCurrentWorkingDirectory();
export const RAW_TRUTH_OUTPUT_DIRECTORY = path.join(__dirname, "../src/truth_output/raw_truth_output");
export const FILTERED_TRUTH_OUTPUT_DIRECTORY = path.join(__dirname, "../src/truth_output/filtered_truth_output");
export const RAW_TRUTH_OUTPUT_FILE_PATH = path.join(__dirname, "../src/truth_output/raw_truth_output/output.txt");
export const FILTERED_TRUTH_OUTPUT_FILE_PATH = path.join(__dirname, "../src/truth_output/filtered_truth_output/output.json");
export const EMBEDDED_IMAGES_PATH = path.join(__dirname, "../embedded_images");
export const DJT_TRUTH_BATCH_UPDATE_PATH = path.join(__dirname, "../../fetch.bat");
//# sourceMappingURL=constants.js.map