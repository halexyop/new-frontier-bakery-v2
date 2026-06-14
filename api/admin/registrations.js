const { isAdmin, listRegistrations, sendJson } = require("../_lib");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }
  if (!isAdmin(request)) {
    sendJson(response, 401, { error: "Incorrect admin password." });
    return;
  }

  try {
    sendJson(response, 200, { registrations: await listRegistrations() });
  } catch (error) {
    console.error("Admin list error:", error);
    sendJson(response, 500, { error: "Unable to load registrations." });
  }
};
