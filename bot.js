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

      // normalize keys
      const cleanKey = key.toLowerCase().trim();
      data[cleanKey] = value;
    });

    // 🧠 number cleaner
    const parseNumber = (val) => {
      if (!val) return 0;
      return Number(val.toString().replace(/,/g, "").trim()) || 0;
    };

    // 📦 BUILD PAYLOAD
    const payload = {
      date: data["date"],
      branch: data["branch"],

      s1_cash: parseNumber(data["s1_cash"]),
      cutoff: parseNumber(data["cutoff"]),
      s1_dan_eric: parseNumber(data["s1_dan_eric"]),
      s1_donut: parseNumber(data["s1_donut"]),
      s1_exp: parseNumber(data["s1_exp"]),
      s1_disc: parseNumber(data["s1_disc"]),
      s1_cashier: data["s1_cashier"] || "",

      s2_cash: parseNumber(data["s2_cash"]),
      s2_donut: parseNumber(data["s2_donut"]),
      s2_dan_eric: parseNumber(data["s2_dan_eric"]),
      s2_exp: parseNumber(data["s2_exp"]),
      s2_disc: parseNumber(data["s2_disc"]),
      s2_cashier: data["s2_cashier"] || "",

      gross: parseNumber(data["gross"]),
      net: parseNumber(data["net"]),
      po: data["po"] || "",
      lo: data["lo"] || "",
      salary: parseNumber(data["salary"]),
    };

    console.log("📦 FINAL PAYLOAD:", payload);

    const res = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log("📊 Sheets response:", text);

    message.reply(`✅ Logged successfully for **${payload.branch}** (${payload.date})
        \n
        s1_cash: ${payload.s1_cash}
        cutoff: ${payload.cutoff}
        s1_dan_eric: ${payload.s1_dan_eric}
        s1_donut: ${payload.s1_donut}
        s1_exp: ${payload.s1_exp}
        s1_disc: ${payload.s1_disc}
        s1_cashier: ${payload.s1_cashier}

        s2_cash: ${payload.s2_cash}
        s2_donut: ${payload.s2_donut}
        s2_dan_eric: ${payload.s2_dan_eric}
        s2_exp: ${payload.s2_exp}
        s2_disc: ${payload.s2_disc}
        s2_cashier: ${payload.s2_cashier}

        gross: ${payload.gross}
        net: ${payload.net}
        po: ${payload.po}
        lo: ${payload.lo}
        salary: ${payload.salary} 
        `);
  } catch (err) {
    console.error(err);
    message.reply("❌ Failed to log report.");
  }
});

client.login(TOKEN);
