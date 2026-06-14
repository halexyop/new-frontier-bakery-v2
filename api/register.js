const crypto = require("node:crypto");
const {
  REGISTRATIONS_KEY,
  redis,
  redisPipeline,
  sendJson
} = require("./_lib");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  try {
    const phone = String(request.body?.phone || "").replace(/[^\d+]/g, "");
    if (!/^\+\d{7,15}$/.test(phone)) {
      sendJson(response, 400, { error: "Please enter a valid WhatsApp number." });
      return;
    }

    const forwardedIp = request.headers["x-forwarded-for"];
    const ip = String(Array.isArray(forwardedIp) ? forwardedIp[0] : forwardedIp || "unknown")
      .split(",")[0]
      .trim();
    const rateKey = `nfb:rate:${crypto.createHash("sha256").update(ip).digest("hex")}`;
    const rateCount = Number(await redis(["INCR", rateKey]));
    if (rateCount === 1) await redis(["EXPIRE", rateKey, "3600"]);
    if (rateCount > 10) {
      sendJson(response, 429, { error: "Too many attempts. Please try again later." });
      return;
    }

    const phoneHash = crypto.createHash("sha256").update(phone).digest("hex");
    const duplicateKey = `nfb:phone:${phoneHash}`;
    const reserved = await redis(["SET", duplicateKey, "1", "NX"]);
    if (reserved === null) {
      sendJson(response, 200, { success: true, duplicate: true });
      return;
    }

    const registration = {
      id: crypto.randomUUID(),
      phone,
      createdAt: new Date().toISOString(),
      source: "launch-page"
    };
    const score = Date.now();
    const [, total] = await redisPipeline([
      ["ZADD", REGISTRATIONS_KEY, score, JSON.stringify(registration)],
      ["ZCARD", REGISTRATIONS_KEY]
    ]);

    sendJson(response, 201, {
      success: true
    });
  } catch (error) {
    console.error("Registration error:", error);
    sendJson(response, 500, { error: "Registration is temporarily unavailable. Please try again." });
  }
};
