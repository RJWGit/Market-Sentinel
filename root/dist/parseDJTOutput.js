import { readFile, writeFile, RAW_TRUTH_OUTPUT_FILE_PATH, FILTERED_TRUTH_OUTPUT_FILE_PATH, isFileEmpty, } from "./utils.js";
//Go up 1 directory '..' since 'import.meta.url' gets path of JS file (../dist) and not TS file (../src)
/**
 * Processes and transforms data from DJT API and returns JSON
 *
 * @returns
 * -  `0`: Success.
 * - `-1`: Failed to read the input file.
 * - `-2`: Failed to write the result file.
 * - `-3`: Not valid JSON
 * - `-4`: No Updates
 */
export const parseOutput = () => {
    let rawOutputStr;
    try {
        rawOutputStr = readFile(RAW_TRUTH_OUTPUT_FILE_PATH);
    }
    catch (error) {
        return -1;
    }
    //No updates
    if (!rawOutputStr)
        return -4;
    const commaSeperatedObjects = rawOutputStr.replace(/\}(\s*)\{/g, "},$1{");
    let filteredTruthOutputs = "[" + commaSeperatedObjects + "]";
    let parsedTruthOutputs;
    //Turn strings into JSON
    try {
        parsedTruthOutputs = JSON.parse(filteredTruthOutputs);
    }
    catch (error) {
        console.error(error);
        return -3;
    }
    //Check for duplicate messages
    parsedTruthOutputs = hasPreviousResponse(parsedTruthOutputs);
    //Convert back to string before writing to file
    const finalOutputString = JSON.stringify(parsedTruthOutputs);
    //No updates
    if (!finalOutputString)
        return -4;
    try {
        console.log("Writing to output filtered file");
        writeFile(finalOutputString, FILTERED_TRUTH_OUTPUT_FILE_PATH);
    }
    catch (error) {
        return -2;
    }
    return 0;
};
//Check for duplicate messages and return only unique messages.
export const hasPreviousResponse = (newResponses) => {
    let filteredNewResponses = [];
    if (!isFileEmpty(FILTERED_TRUTH_OUTPUT_FILE_PATH)) {
        const oldResponses = JSON.parse(readFile(FILTERED_TRUTH_OUTPUT_FILE_PATH));
        filteredNewResponses = newResponses.filter((newResponse) => !oldResponses.some((oldResponse) => {
            if (JSON.stringify(oldResponse) === JSON.stringify(newResponse)) {
                return true;
            }
            return false;
        }));
    }
    else {
        return newResponses; //No messages from last call
    }
    return filteredNewResponses;
};
//# sourceMappingURL=parseDJTOutput.js.map