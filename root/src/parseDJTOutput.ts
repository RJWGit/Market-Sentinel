//Next steps: Check if response from DJT and has all the nessarry info. Format into correct JSON and move 'raw output' to 'filtered output'
import { DJTResponse } from "./types.js";
import {
  readFile,
  writeFile,
  getCurrentWorkingDirectory,
  RAW_TRUTH_OUTPUT_FILE_PATH,
  FILTERED_TRUTH_OUTPUT_FILE_PATH,
} from "./utils.js";

//Go up 1 directory '..' since 'import.meta.url' gets path of JS file (../dist) and not TS file (../src)

/**
 * Processes and transforms data from DJT API and returns JSON
 *
 * @returns
 * - `0`: Success.
 * - `-1`: Failed to read the input file.
 * - `-2`: Failed to write the result file.
 */
export const parseOutput = (): number => {
  let rawOutputStr: string;

  try {
    rawOutputStr = readFile(RAW_TRUTH_OUTPUT_FILE_PATH);
  } catch (err) {
    return -1;
  }
  const commaSeperatedObjects = rawOutputStr.replace(/\}(\s*)\{/g, "},$1{");
  const filteredTruthOutputs = "[" + commaSeperatedObjects + "]";

  try {
    writeFile(filteredTruthOutputs, FILTERED_TRUTH_OUTPUT_FILE_PATH);
  } catch (err) {
    return -2;
  }

  return 0;
};
