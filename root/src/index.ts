import { geminiRequest } from "./gemini-API.js";
import "dotenv/config";
import {
  readFile,
  deleteContentsOfDirectory,
  isValidJSON,
  getDirectoryContents,
  isFileEmpty,
  runBatch,
  doesFileExist,
  writeFile,
} from "./utils.js";
import { parseOutput } from "./parse-DJT-Output.js";
import { Client, Events, GatewayIntentBits, TextChannel, EmbedBuilder, AttachmentBuilder } from "discord.js";
import { DJTAllResponses, DJTResponse, GeminiResponseDJT } from "./types.js";
import { console } from "inspector";
import {
  TimeUnit,
  DiscordChannelIds,
  EmbedFieldNames,
  FILTERED_TRUTH_OUTPUT_FILE_PATH,
  RAW_TRUTH_OUTPUT_FILE_PATH,
  DJT_TRUTH_BATCH_UPDATE_PATH,
  EMBEDDED_IMAGES_PATH,
} from "./constants.js";

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once).
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Bot login for discord
client.login(process.env.BOT_TOKEN);

let sendEmbed = (discordEmbed: EmbedBuilder, imageName: string) => {
  // console.log(client.channels.cache);
  const image = new AttachmentBuilder(`${EMBEDDED_IMAGES_PATH}/${imageName}`);
  let channel: TextChannel;
  if (significantMarketImpact(discordEmbed)) {
    channel = client.channels.cache.get(DiscordChannelIds.MARKET) as TextChannel;
    channel.send({ embeds: [discordEmbed], files: [image] });
  }
};

const significantMarketImpact = (embed: EmbedBuilder) => {
  try {
    if (embed?.data?.fields) {
      for (const field of embed.data.fields) {
        if (field.name === EmbedFieldNames.MARKET_IMPACT) {
          return parseInt(field.value, 10) >= 7;
        }
      }
    } else {
      console.error("Embed not defined");
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

const generateDiscordEmbed = (geminiContent: GeminiResponseDJT, rawContent: DJTResponse, imageName: string) => {
  try {
    let embed = new EmbedBuilder()
      .setColor(0xff00ff)
      .setTitle(String(geminiContent?.title ?? "\u200b"))
      .setURL(String(rawContent?.url ?? "\u200b"))
      .setDescription(String(geminiContent?.summary ?? "\u200b"))
      .setImage(`attachment://${imageName}`)
      .addFields({
        name: EmbedFieldNames.MARKET_IMPACT,
        value: String(geminiContent?.marketImpact ?? "\u200b"),
        inline: true,
      })
      .setTimestamp();

    return embed;
  } catch (error) {
    console.error("Gemini Contents: ", JSON.stringify(geminiContent), "rawContent.URL: ", rawContent.url);
    throw error;
  }
};

//Add content check to filter out empty content only containing HTML tags
const analyzeTruth = async (content: DJTResponse) => {
  if (content?.content && content.content !== "" && content.content !== " " && content.content.length > 10) {
    try {
      let response = await geminiRequest(content.content);
      return response;
    } catch (error) {
      console.error(error);
    }
  } else {
    console.log("No message (no content or content undefined):\n");
  }
};

const getRandomFolderImageName = (path: string) => {
  const imageNames: string[] | undefined = getDirectoryContents(path);

  if (imageNames && imageNames.length > 0) {
    return imageNames[Math.floor(Math.random() * (imageNames?.length - 1))];
  } else {
    console.error("Could not return random image 'getRandomFolderImageName', return empty string");
    return "";
  }
};

const processTruth = async () => {
  //No updates from Truth Social (DJT)
  if (isFileEmpty(RAW_TRUTH_OUTPUT_FILE_PATH)) {
    console.log("No updates");
    return;
  }

  if (parseOutput() === 0) {
    if (isValidJSON(readFile(FILTERED_TRUTH_OUTPUT_FILE_PATH))) {
      const filteredResponses = JSON.parse(readFile(FILTERED_TRUTH_OUTPUT_FILE_PATH)) as DJTAllResponses;
      const imageName = getRandomFolderImageName(EMBEDDED_IMAGES_PATH);

      for (let response of filteredResponses) {
        let analyzedTruthMessage = await analyzeTruth(response);
        if (analyzedTruthMessage) {
          console.log("analyzedTruthMessage: ", JSON.stringify(analyzedTruthMessage));
          sendEmbed(generateDiscordEmbed(analyzedTruthMessage, response, imageName), imageName);
        } else {
          console.error("No valid JSON content from Gemini response");
        }
      }
    } else {
      console.log("Not valid JSON response");
    }
  } else {
    console.log("Unable to parse output");
  }
};

/**
 * Creates 'Truth' output files if don't exist for both raw (string) and filtered (JSON)
 */
const initOutputFiles = (): void => {
  //Create or refresh files
  writeFile("", RAW_TRUTH_OUTPUT_FILE_PATH);
  writeFile("", FILTERED_TRUTH_OUTPUT_FILE_PATH);
};

const main = async () => {
  initOutputFiles();
  let numberOfMinutes = 5; // Should be same as batch time

  //How often to check for updates
  let pollingInterval = TimeUnit.MINUTE * numberOfMinutes;

  const loop = async () => {
    try {
      console.log("Batch fire");
      runBatch(DJT_TRUTH_BATCH_UPDATE_PATH);
    } catch (error) {
      //Likely 429 error
      pollingInterval += TimeUnit.MINUTE;
      console.error(error, " Increase interval to: ", pollingInterval);
    } finally {
      console.log("Polling interval time:", pollingInterval);
      processTruth();
      setTimeout(loop, pollingInterval);
    }
  };

  loop();
};

main();
