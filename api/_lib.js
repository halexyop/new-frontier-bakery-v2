const crypto = require("node:crypto");

const REGISTRATIONS_KEY = "nfb:registrations";

function sendJson(response, status, body) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

function isAdmin(request) {
  const password = process.env.ADMIN_PASSWORD || "";
  const supplied = request.headers.authorization?.replace(/^Bearer\s+/i, "") || "";
  if (!password || supplied.length !== password.length) return false;
  return crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(password));
}

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Upstash Redis is not configured.");
  return { url: url.replace(/\/$/, ""), token };
}

async function redis(command) {
  const { url, token } = getRedisConfig();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error || "Database request failed.");
  return data.result;
}

async function redisPipeline(commands) {
  const { url, token } = getRedisConfig();
  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(commands)
  });
  const data = await response.json();
  if (!response.ok || !Array.isArray(data)) throw new Error("Database request failed.");
  const failed = data.find((item) => item.error);
  if (failed) throw new Error(failed.error);
  return data.map((item) => item.result);
}

async function listRegistrations() {
  const values = await redis(["ZRANGE", REGISTRATIONS_KEY, "0", "-1", "REV"]);
  return (values || []).map((value) => JSON.parse(value));
}

async function notifyTelegram(registration, total) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new Error("Telegram is not configured.");

  const text = [
    "New website launch registration",
    "",
    `WhatsApp: ${registration.phone}`,
    `Registered: ${new Date(registration.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST`,
    `Total registrations: ${total}`
  ].join("\n");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });
  if (!response.ok) throw new Error(`Telegram returned ${response.status}.`);
}

module.exports = {
  REGISTRATIONS_KEY,
  isAdmin,
  listRegistrations,
  redis,
  redisPipeline,
  sendJson
};
