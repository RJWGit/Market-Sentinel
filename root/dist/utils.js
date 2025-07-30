var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fs from "fs";
import * as fsp from "fs/promises"; // For promise-based file system operations
import * as path from "path"; // Needed for path.join
import { fileURLToPath } from "url"; // Needed for __dirname in ESM
import { execSync } from "child_process";
/**
 *
 * Working directory is from 'dist' folder
 */
export const getCurrentWorkingDirectory = () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return __dirname;
};
export const __dirname = getCurrentWorkingDirectory();
export const RAW_TRUTH_OUTPUT_DIRECTORY = path.join(__dirname, "../src/truth_output/raw_truth_output");
export const FILTERED_TRUTH_OUTPUT_DIRECTORY = path.join(__dirname, "../src/truth_output/filtered_truth_output");
export const RAW_TRUTH_OUTPUT_FILE_PATH = path.join(__dirname, "../src/truth_output/raw_truth_output/output.txt");
export const FILTERED_TRUTH_OUTPUT_FILE_PATH = path.join(__dirname, "../src/truth_output/filtered_truth_output/output.json");
export const TRUMP_PICS_PATH = path.join(__dirname, "../trumppics");
export const DJT_TRUTH_BATCH_UPDATE_PATH = path.join(__dirname, "../../fetch.bat");
export const writeFile = (content, path) => {
    try {
        fs.writeFileSync(path, content);
        return;
    }
    catch (error) {
        console.error("Error writing to file:", error);
        throw error;
    }
};
export const readFile = (path) => {
    try {
        const content = fs.readFileSync(path, "utf8");
        return content;
    }
    catch (error) {
        console.error("Error reading file:", error);
        throw error;
    }
};
export const getDirectoryContents = (dirPath) => {
    try {
        const allEntries = fs.readdirSync(dirPath);
        return allEntries;
    }
    catch (error) {
        console.error("Unable to read directory", error);
        return undefined;
    }
};
export const runBatch = (path) => {
    try {
        const output = execSync(path).toString();
        console.log("Batch runned succesfully: ", path, output);
    }
    catch (error) {
        console.error("ERROR: Script failed to execute.");
        console.error(error);
    }
};
/**
 * Deletes all files and subdirectories directly within the specified directory.
 * Assumes a single level of nesting within the target directory for clarity,
 * but uses fs.rm() which can handle deeper nesting if present.
 *
 * @param {string} directoryPath - The path to the directory whose contents you want to delete.
 * This path should be relative to the script's location.
 * @returns {Promise<void>} A Promise that resolves when all contents are deleted,
 * or rejects if a critical error occurs.
 */
export const deleteContentsOfDirectory = (directoryAbsolutePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Does directory exist
        const stats = yield fsp.stat(directoryAbsolutePath);
        if (!stats.isDirectory()) {
            console.warn(`Path is not a directory: ${directoryAbsolutePath}`);
            return -1;
        }
        // Read the names of all items (files and subdirectories) directly inside the directory
        const itemsInDir = yield fsp.readdir(directoryAbsolutePath);
        // Iterate and delete each item found
        const deletionPromises = itemsInDir.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            const itemFullPath = path.join(directoryAbsolutePath, item);
            try {
                // fs.rm() is used to delete.
                // recursive: true - allows deleting directories and their contents.
                // force: true - suppresses errors if the item doesn't exist (e.g., if deleted by another process).
                yield fsp.rm(itemFullPath, { recursive: true, force: true });
                console.log(`Deleted: ${itemFullPath}`);
            }
            catch (error) {
                console.error(`Error deleting ${itemFullPath}:`, error);
            }
        }));
        // Wait for all deletion operations to complete
        yield Promise.all(deletionPromises);
        return 0;
    }
    catch (error) {
        console.error("Diretory does not exist", error);
        return -2;
    }
});
export const isFileEmpty = (path) => {
    try {
        const stats = fs.statSync(path);
        if (stats.size === 0) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (error) {
        console.log(error);
        return true; //Do nothing
    }
};
export const isValidJSON = (str) => {
    try {
        JSON.parse(str);
    }
    catch (error) {
        return false;
    }
    return true;
};
//# sourceMappingURL=utils.js.map