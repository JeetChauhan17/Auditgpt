import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const token = process.env.TELEGRAM_TOKEN;
const API_BASE = process.env.VITE_API_URL || "http://localhost:3000/api";

if (!token) {
  console.error("TELEGRAM_TOKEN is not defined in the environment.");
  process.exit(1);
}

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start|\/help|\/guide/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMsg = `*Welcome to AuditGPT Bot!* 🚀\nI can help you analyze companies for fraud risks.\n\n` +
    `Here are some commands you can use:\n` +
    `/search \\<company name\\> \\- Search for a company\n` +
    `/report \\<company id\\> \\- Get a detailed report\n` +
    `/sectors \\- List all sectors\n` +
    `/top \\<sector\\> \\- Get top companies by risk score\n\n` +
    `_Powered by AuditGPT_`;
  bot.sendMessage(chatId, welcomeMsg, { parse_mode: 'MarkdownV2' });
});

bot.onText(/\/search (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match ? match[1] : '';

  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    const data: any = await res.json();
    if (data.length === 0) {
      bot.sendMessage(chatId, `No companies found matching "${query}".`);
      return;
    }
    
    let reply = `*Search Results for "${query}"*\n\n`;
    data.forEach((c: any) => {
      reply += `📌 *${c.company_name}*\nID: \`${c.company_id}\`\nSector: ${c.sector}\nRisk: ${c.risk_level}\n\n`;
    });
    bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, "Error fetching search results.");
  }
});

bot.onText(/\/report (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const companyId = match ? match[1] : '';

  try {
    const res = await fetch(`${API_BASE}/report/${encodeURIComponent(companyId)}`);
    if (res.status === 404) {
      bot.sendMessage(chatId, `Report not found for ID: ${companyId}`);
      return;
    }
    const data: any = await res.json();
    
    let reply = `📊 *Audit Report: ${data.company_name}*\n\n`;
    reply += `*Sector:* ${data.sector}\n`;
    reply += `*Fraud Risk:* ${data.fraud_risk_score}\n`;
    reply += `*M-Score:* ${data.beneish?.m_score?.toFixed(2)}\n`;
    reply += `*Z-Score:* ${data.altman?.z_score?.toFixed(2)}\n\n`;
    reply += `*Reasoning:* ${data.risk_reasoning}\n`;
    
    bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, "Error fetching report.");
  }
});

console.log("Bot is running!");
