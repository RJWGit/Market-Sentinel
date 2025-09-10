var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { geminiRequest } from "./gemini-API.js";
import "dotenv/config";
import { readFile, isValidJSON, getDirectoryContents, isFileEmpty, runBatch, writeFile, } from "./utils.js";
import { parseOutput } from "./parse-DJT-Output.js";
import { Client, Events, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } from "discord.js";
import { console } from "inspector";
import { FILTERED_TRUTH_OUTPUT_FILE_PATH, RAW_TRUTH_OUTPUT_FILE_PATH, DJT_TRUTH_BATCH_UPDATE_PATH, EMBEDDED_IMAGES_PATH, } from "./constants.js";
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
// When the client is ready, run this code (only once).
client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});
// Bot login for discord
client.login(process.env.BOT_TOKEN);
let sendEmbed = (discordEmbed, imageName) => {
    // console.log(client.channels.cache);
    const image = new AttachmentBuilder(`${EMBEDDED_IMAGES_PATH}/${imageName}`);
    let channel;
    if (significantMarketImpact(discordEmbed)) {
        channel = client.channels.cache.get("1371300443715801209" /* DiscordChannelIds.MARKET */);
        channel.send({ embeds: [discordEmbed], files: [image] });
    }
};
const significantMarketImpact = (embed) => {
    var _a;
    try {
        if ((_a = embed === null || embed === void 0 ? void 0 : embed.data) === null || _a === void 0 ? void 0 : _a.fields) {
            for (const field of embed.data.fields) {
                if (field.name === "Market Impact" /* EmbedFieldNames.MARKET_IMPACT */) {
                    return parseInt(field.value, 10) >= 1;
                }
            }
        }
        else {
            console.error("Embed not defined");
            return false;
        }
    }
    catch (error) {
        console.error(error);
        return false;
    }
};
const generateDiscordEmbed = (geminiContent, rawContent, imageName) => {
    var _a, _b, _c, _d;
    try {
        let embed = new EmbedBuilder()
            .setColor(0xff00ff)
            .setTitle(String((_a = geminiContent === null || geminiContent === void 0 ? void 0 : geminiContent.title) !== null && _a !== void 0 ? _a : "\u200b"))
            .setURL(String((_b = rawContent === null || rawContent === void 0 ? void 0 : rawContent.url) !== null && _b !== void 0 ? _b : "\u200b"))
            .setDescription(String((_c = geminiContent === null || geminiContent === void 0 ? void 0 : geminiContent.summary) !== null && _c !== void 0 ? _c : "\u200b"))
            .setImage(`attachment://${imageName}`)
            .addFields({
            name: "Market Impact" /* EmbedFieldNames.MARKET_IMPACT */,
            value: String((_d = geminiContent === null || geminiContent === void 0 ? void 0 : geminiContent.marketImpact) !== null && _d !== void 0 ? _d : "\u200b"),
            inline: true,
        })
            .setTimestamp();
        return embed;
    }
    catch (error) {
        console.error("Gemini Contents: ", JSON.stringify(geminiContent), "rawContent.URL: ", rawContent.url);
        throw error;
    }
};
//Add content check to filter out empty content only containing HTML tags
const analyzeTruth = (content) => __awaiter(void 0, void 0, void 0, function* () {
    if ((content === null || content === void 0 ? void 0 : content.content) && content.content !== "" && content.content !== " " && content.content.length > 10) {
        try {
            let response = yield geminiRequest(content.content);
            return response;
        }
        catch (error) {
            console.error(error);
        }
    }
    else {
        console.log("No message (no content or content undefined):\n");
    }
});
const getRandomFolderImageName = (path) => {
    const imageNames = getDirectoryContents(path);
    if (imageNames && imageNames.length > 0) {
        return imageNames[Math.floor(Math.random() * ((imageNames === null || imageNames === void 0 ? void 0 : imageNames.length) - 1))];
    }
    else {
        console.error("Could not return random image 'getRandomFolderImageName', return empty string");
        return "";
    }
};
const processTruth = () => __awaiter(void 0, void 0, void 0, function* () {
    //No updates from Truth Social (DJT)
    if (isFileEmpty(RAW_TRUTH_OUTPUT_FILE_PATH)) {
        console.log("No updates");
        return;
    }
    if (parseOutput() === 0) {
        if (isValidJSON(readFile(FILTERED_TRUTH_OUTPUT_FILE_PATH))) {
            const filteredResponses = JSON.parse(readFile(FILTERED_TRUTH_OUTPUT_FILE_PATH));
            const imageName = getRandomFolderImageName(EMBEDDED_IMAGES_PATH);
            for (let response of filteredResponses) {
                let analyzedTruthMessage = yield analyzeTruth(response);
                if (analyzedTruthMessage) {
                    console.log("analyzedTruthMessage: ", JSON.stringify(analyzedTruthMessage));
                    sendEmbed(generateDiscordEmbed(analyzedTruthMessage, response, imageName), imageName);
                }
                else {
                    console.error("No valid JSON content from Gemini response");
                }
            }
        }
        else {
            console.log("Not valid JSON response");
        }
    }
    else {
        console.log("Unable to parse output");
    }
});
/**
 * Creates 'Truth' output files if don't exist for both raw (string) and filtered (JSON)
 */
const initOutputFiles = () => {
    //Create or refresh files
    writeFile("", RAW_TRUTH_OUTPUT_FILE_PATH);
    writeFile("", FILTERED_TRUTH_OUTPUT_FILE_PATH);
};
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    initOutputFiles();
    let numberOfMinutes = 5; // Should be same as batch time
    //How often to check for updates
    let pollingInterval = 60000 /* TimeUnit.MINUTE */ * numberOfMinutes;
    const loop = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("Batch fire");
            runBatch(DJT_TRUTH_BATCH_UPDATE_PATH);
        }
        catch (error) {
            //Likely 429 error
            pollingInterval += 60000 /* TimeUnit.MINUTE */;
            console.error(error, " Increase interval to: ", pollingInterval);
        }
        finally {
            console.log("Polling interval time:", pollingInterval);
            processTruth();
            setTimeout(loop, pollingInterval);
        }
    });
    loop();
});
main();
//# sourceMappingURL=index.js.map