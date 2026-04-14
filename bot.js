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

// client.on("messageCreate", async (message) => {
//   // Log incoming message
//   console.log("MESSAGE RECEIVED:", message.content);

//   // Ignore bots
//   if (message.author.bot) return;

//   // Only listen to specific channel
//   if (message.channel.name !== CHANNEL_NAME) return;

//   const content = message.content;

//   console.log("SENDING TO:", WEB_APP_URL);

//   try {
//     await fetch(WEB_APP_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         content: content,
//       }),
//     });

//     // ✅ Feedback in Discord
//     // message.react("✅");
//     message.reply("📊 Logged to system!");
//   } catch (error) {
//     console.error(error);
//     // message.react("❌");
//     message.reply("❌ Failed to log to system!");
//   }
// });

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!log")) return;

  try {
    const lines = message.content.split("\n");
    lines.shift(); // remove !log

    let data = {};

    lines.forEach((line) => {
      const [key, ...rest] = line.split(":");
      if (!key || rest.length === 0) return;

      const value = rest.join(":").trim();

      // normalize key (lowercase, remove spaces)
      const cleanKey = key.toLowerCase().replace(/\s+/g, "_");

      data[cleanKey] = value;
    });

    // 🧠 Helper: clean numbers (remove commas/spaces)
    const parseNumber = (val) => {
      if (!val) return 0;
      return Number(val.replace(/,/g, "").trim()) || 0;
    };

    // Extract fields
    const date = data["date"] || new Date().toISOString().split("T")[0];
    const branch = data["branch"] || "Unknown";

    const payload = {
      date,
      branch,

      shift1_cash_count: parseNumber(data["ist_shift_cash_count"]),
      cutoff: parseNumber(data["cut_off"]),
      shift1_dan_eric: parseNumber(data["1st_shift_dan_eric"]),
      shift1_expense: parseNumber(data["1st_shift_expense"]),
      shift1_discrepancy: parseNumber(data["1st_shift_discrepancy"]),
      shift1_cashier: data["1st_shift_cashier"] || "",

      shift2_cash_count: parseNumber(data["2nd_shift_cash_count"]),
      shift2_donut: parseNumber(data["2nd_shift_donut"]),
      shift2_dan_eric: parseNumber(data["2nd_shift_dan_eric"]),
      shift2_expense: parseNumber(data["2nd_shift_expenses"]),
      shift2_discrepancy: parseNumber(data["2nd_shift_discrepancy"]),
      shift2_cashier: data["2nd_shift_cashier"] || "",

      gross_sales: parseNumber(data["gross_sales"]),
      net_sales: parseNumber(data["net_sales"]),
      po: data["po"] || "",
      lo: data["lo"] || "",
      salary: parseNumber(data["salary"]),
    };

    console.log("Parsed data:", payload);

    // Send to Apps Script
    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log("Sheets response:", text);

    message.reply(`✅ Full report logged for ${branch} (${date})`);
  } catch (err) {
    console.error(err);
    message.reply("❌ Failed to log report. Check format.");
  }
});

client.login(TOKEN);
