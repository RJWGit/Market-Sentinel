import { geminiRequest } from "./gemini_API.js";
import "dotenv/config";
import {
  readFile,
  FILTERED_TRUTH_OUTPUT_FILE_PATH,
  deleteContentsOfDirectory,
  isValidJSON,
  RAW_TRUTH_OUTPUT_FILE_PATH,
  __dirname,
  getDirectoryContents,
  TRUMP_PICS_PATH,
  isFileEmpty,
  runBatch,
  DJT_TRUTH_BATCH_UPDATE_PATH,
  RAW_TRUTH_OUTPUT_DIRECTORY,
  FILTERED_TRUTH_OUTPUT_DIRECTORY,
} from "./utils.js";
import { parseOutput } from "./parseDJTOutput.js";
// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits, TextChannel, EmbedBuilder, AttachmentBuilder, Embed } from "discord.js";
import { DJTAllResponses, DJTResponse, GeminiResponseDJT } from "./types.js";

const enum TimeUnit {
  SECOND = 1000,
  MINUTE = 60000,
}

const enum DiscordChannelIds {
  MARKET = "1371300443715801209",
  TRUMP_MEMES = "1399172278012481718",
}

const enum EmbedFieldNames {
  MARKET_IMPACT = "Market Impact",
  REGARDED_LEVEL = "Regardation Level",
  WRITING_LEVEL = "Writing Grade Level",
  HIGHLIGHT = "Highlight",
}
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

let sendEmbed = (discordEmbed: EmbedBuilder, imageName: string) => {
  // console.log(client.channels.cache);
  const image = new AttachmentBuilder(`${__dirname}/../trumppics/${imageName}`);
  let channel: TextChannel;
  if (significantMarketImpact(discordEmbed)) {
    channel = client.channels.cache.get(DiscordChannelIds.MARKET) as TextChannel;
  } else {
    channel = client.channels.cache.get(DiscordChannelIds.TRUMP_MEMES) as TextChannel;
  }

  channel.send({ embeds: [discordEmbed], files: [image] });
};

const significantMarketImpact = (embed: EmbedBuilder) => {
  try {
    if (embed?.data?.fields) {
      for (const field of embed.data.fields) {
        if (field.name === EmbedFieldNames.MARKET_IMPACT) {
          if (parseInt(field.value) > 5) {
            return true;
          } else {
            return false;
          }
        }
      }
    } else {
      console.log("Embed not defined");
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

const generateDiscordEmbed = (geminiContent: GeminiResponseDJT, rawContent: DJTResponse, imageName: string) => {
  let embed = new EmbedBuilder()
    .setColor(0xff00ff)
    .setTitle(geminiContent.title)
    .setURL(rawContent.url)
    .setDescription(geminiContent.summary)
    .setImage(`attachment://${imageName}`)
    .addFields(
      { name: EmbedFieldNames.MARKET_IMPACT, value: `${geminiContent.marketImpact}`, inline: true },
      { name: EmbedFieldNames.WRITING_LEVEL, value: `${geminiContent.writingLevel}`, inline: true },
      { name: EmbedFieldNames.REGARDED_LEVEL, value: `${geminiContent.stupidityLevel}`, inline: true },
      { name: EmbedFieldNames.HIGHLIGHT, value: `${geminiContent.highlights}`, inline: true }
    )
    .setTimestamp();

  return embed;
};

//Add content check to filter out empty content only containing HTML tags
const analyzeTruth = async (content: DJTResponse) => {
  if (
    content?.content !== undefined &&
    content.content !== "" &&
    content.content !== " " &&
    content.content.length > 10
  ) {
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

const loop = async () => {
  //No updates from Truth Social (DJT)
  if (isFileEmpty(RAW_TRUTH_OUTPUT_FILE_PATH)) {
    console.log("No updates");
    return;
  }

  if (parseOutput() === 0) {
    if (isValidJSON(readFile(FILTERED_TRUTH_OUTPUT_FILE_PATH))) {
      const filteredResponses = JSON.parse(readFile(FILTERED_TRUTH_OUTPUT_FILE_PATH)) as DJTAllResponses;
      const imageName = getRandomFolderImageName(TRUMP_PICS_PATH);

      for (let response of filteredResponses) {
        let analyzedTruthMessage = await analyzeTruth(response);
        if (analyzedTruthMessage?.text) {
          // console.log(analyzedTruthMessage.text);
          sendEmbed(generateDiscordEmbed(JSON.parse(analyzedTruthMessage.text), response, imageName), imageName);
        }
      }
    } else {
      console.log("Not valid JSON response");
    }
  } else {
    console.log("Unable to parse output");
  }

  deleteContentsOfDirectory(RAW_TRUTH_OUTPUT_DIRECTORY);
  deleteContentsOfDirectory(FILTERED_TRUTH_OUTPUT_DIRECTORY);
};

const main = async () => {
  setInterval(() => {
    runBatch(DJT_TRUTH_BATCH_UPDATE_PATH);
    loop();
  }, TimeUnit.MINUTE);
};
main();

//TODO
//
//2. Set up auto timer to rerun every 20 seconds
//4. clean up code
//5. Check for overlap (previous pulled post) to avoid reposting same post
//6. Make batch script and code take same input time
