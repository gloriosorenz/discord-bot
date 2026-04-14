import dotenv from "dotenv";
dotenv.config();

import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

// 🔧 CONFIG
const TOKEN = process.env.BOT_TOKEN;
const CHANNEL_NAME = "sales-log"; // your Discord channel
const WEB_APP_URL = process.env.WEB_APP_URL; // your Google Apps Script URL

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ✅ Bot is ready
client.on("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  //   console.log("TOKEN:", TOKEN);
  //   console.log("WEB_APP_URL:", WEB_APP_URL);
});

client.on("messageCreate", async (message) => {
  // Log incoming message
  console.log("MESSAGE RECEIVED:", message.content);

  // Ignore bots
  if (message.author.bot) return;

  // Only listen to specific channel
  if (message.channel.name !== CHANNEL_NAME) return;

  const content = message.content;

  console.log("SENDING TO:", WEB_APP_URL);

  try {
    await fetch(WEB_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: content,
      }),
    });

    // ✅ Feedback in Discord
    // message.react("✅");
    message.reply("📊 Logged to system!");
  } catch (error) {
    console.error(error);
    // message.react("❌");
    message.reply("❌ Failed to log to system!");
  }
});

client.login(TOKEN);
