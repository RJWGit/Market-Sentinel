//Next steps: Check if response from DJT and has all the nessarry info. Format into correct JSON and move 'raw output' to 'filtered output'
import { DJTAllResponses } from "./types.js";
import { readFile, writeFile, isFileEmpty } from "./utils.js";
import { RAW_TRUTH_OUTPUT_FILE_PATH, FILTERED_TRUTH_OUTPUT_FILE_PATH } from "./constants.js";

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
export const parseOutput = (): number => {
  let rawOutputStr: string;

  try {
    rawOutputStr = readFile(RAW_TRUTH_OUTPUT_FILE_PATH);
  } catch (error) {
    return -1;
  }

  //No updates
  if (!rawOutputStr) return -4;

  const commaSeperatedObjects = rawOutputStr.replace(/\}(\s*)\{/g, "},$1{");
  let filteredTruthOutputs = "[" + commaSeperatedObjects + "]";

  let parsedTruthOutputs: DJTAllResponses;

  //Turn strings into JSON
  try {
    parsedTruthOutputs = JSON.parse(filteredTruthOutputs) as DJTAllResponses;
  } catch (error) {
    console.error(error);
    return -3;
  }

  //Check for duplicate messages
  parsedTruthOutputs = hasPreviousResponse(parsedTruthOutputs);

  //Convert back to string before writing to file
  const finalOutputString = JSON.stringify(parsedTruthOutputs);

  //No updates
  if (!finalOutputString) return -4;

  try {
    console.log("Writing to output filtered file");
    writeFile(finalOutputString, FILTERED_TRUTH_OUTPUT_FILE_PATH);
  } catch (error) {
    return -2;
  }

  return 0;
};

//Check for duplicate messages and return only unique messages.
export const hasPreviousResponse = (newResponses: DJTAllResponses): DJTAllResponses => {
  let filteredNewResponses: DJTAllResponses = [];

  if (!isFileEmpty(FILTERED_TRUTH_OUTPUT_FILE_PATH)) {
    const oldResponses = JSON.parse(readFile(FILTERED_TRUTH_OUTPUT_FILE_PATH)) as DJTAllResponses;

    filteredNewResponses = newResponses.filter(
      (newResponse) =>
        !oldResponses.some((oldResponse) => {
          if (JSON.stringify(oldResponse) === JSON.stringify(newResponse)) {
            return true;
          }
          return false;
        })
    );
  } else {
    return newResponses; //No messages from last call
  }

  return filteredNewResponses;
};
