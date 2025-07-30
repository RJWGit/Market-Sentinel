var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { geminiRequest } from "./gemini_API.js";
import "dotenv/config";
import { readFile, FILTERED_TRUTH_OUTPUT_FILE_PATH, deleteContentsOfDirectory, isValidJSON, RAW_TRUTH_OUTPUT_FILE_PATH, __dirname, getDirectoryContents, TRUMP_PICS_PATH, isFileEmpty, runBatch, DJT_TRUTH_BATCH_UPDATE_PATH, RAW_TRUTH_OUTPUT_DIRECTORY, FILTERED_TRUTH_OUTPUT_DIRECTORY, } from "./utils.js";
import { parseOutput } from "./parseDJTOutput.js";
// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } from "discord.js";
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});
// Log in to Discord with your client's token
client.login(process.env.BOT_TOKEN);
let sendEmbed = (discordEmbed, imageName) => {
    // console.log(client.channels.cache);
    const image = new AttachmentBuilder(`${__dirname}/../trumppics/${imageName}`);
    let channel;
    if (significantMarketImpact(discordEmbed)) {
        channel = client.channels.cache.get("1371300443715801209" /* DiscordChannelIds.MARKET */);
    }
    else {
        channel = client.channels.cache.get("1399172278012481718" /* DiscordChannelIds.TRUMP_MEMES */);
    }
    channel.send({ embeds: [discordEmbed], files: [image] });
};
const significantMarketImpact = (embed) => {
    var _a;
    try {
        if ((_a = embed === null || embed === void 0 ? void 0 : embed.data) === null || _a === void 0 ? void 0 : _a.fields) {
            for (const field of embed.data.fields) {
                if (field.name === "Market Impact" /* EmbedFieldNames.MARKET_IMPACT */) {
                    if (parseInt(field.value) > 5) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            }
        }
        else {
            console.log("Embed not defined");
            return false;
        }
    }
    catch (error) {
        console.log(error);
        return false;
    }
};
const generateDiscordEmbed = (geminiContent, rawContent, imageName) => {
    let embed = new EmbedBuilder()
        .setColor(0xff00ff)
        .setTitle(geminiContent.title)
        .setURL(rawContent.url)
        .setDescription(geminiContent.summary)
        .setImage(`attachment://${imageName}`)
        .addFields({ name: "Market Impact" /* EmbedFieldNames.MARKET_IMPACT */, value: `${geminiContent.marketImpact}`, inline: true }, { name: "Writing Grade Level" /* EmbedFieldNames.WRITING_LEVEL */, value: `${geminiContent.writingLevel}`, inline: true }, { name: "Regardation Level" /* EmbedFieldNames.REGARDED_LEVEL */, value: `${geminiContent.stupidityLevel}`, inline: true }, { name: "Highlight" /* EmbedFieldNames.HIGHLIGHT */, value: `${geminiContent.highlights}`, inline: true })
        .setTimestamp();
    return embed;
};
//Add content check to filter out empty content only containing HTML tags
const analyzeTruth = (content) => __awaiter(void 0, void 0, void 0, function* () {
    if ((content === null || content === void 0 ? void 0 : content.content) !== undefined &&
        content.content !== "" &&
        content.content !== " " &&
        content.content.length > 10) {
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
const loop = () => __awaiter(void 0, void 0, void 0, function* () {
    //No updates from Truth Social (DJT)
    if (isFileEmpty(RAW_TRUTH_OUTPUT_FILE_PATH)) {
        console.log("No updates");
        return;
    }
    if (parseOutput() === 0) {
        if (isValidJSON(readFile(FILTERED_TRUTH_OUTPUT_FILE_PATH))) {
            const filteredResponses = JSON.parse(readFile(FILTERED_TRUTH_OUTPUT_FILE_PATH));
            const imageName = getRandomFolderImageName(TRUMP_PICS_PATH);
            for (let response of filteredResponses) {
                let analyzedTruthMessage = yield analyzeTruth(response);
                if (analyzedTruthMessage === null || analyzedTruthMessage === void 0 ? void 0 : analyzedTruthMessage.text) {
                    // console.log(analyzedTruthMessage.text);
                    sendEmbed(generateDiscordEmbed(JSON.parse(analyzedTruthMessage.text), response, imageName), imageName);
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
    deleteContentsOfDirectory(RAW_TRUTH_OUTPUT_DIRECTORY);
    deleteContentsOfDirectory(FILTERED_TRUTH_OUTPUT_DIRECTORY);
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    setInterval(() => {
        runBatch(DJT_TRUTH_BATCH_UPDATE_PATH);
        loop();
    }, 60000 /* TimeUnit.MINUTE */);
});
main();
//TODO
//
//2. Set up auto timer to rerun every 20 seconds
//4. clean up code
//5. Check for overlap (previous pulled post) to avoid reposting same post
//6. Make batch script and code take same input time
//# sourceMappingURL=index.js.map