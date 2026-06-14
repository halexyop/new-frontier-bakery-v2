const { isAdmin, listRegistrations, sendJson } = require("../_lib");

function escapeCsv(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

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
    const registrations = await listRegistrations();
    const rows = [
      ["WhatsApp number", "Registered at", "Source"],
      ...registrations.map((item) => [item.phone, item.createdAt, item.source])
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    response.statusCode = 200;
    response.setHeader("Content-Type", "text/csv; charset=utf-8");
    response.setHeader("Content-Disposition", 'attachment; filename="new-frontier-registrations.csv"');
    response.setHeader("Cache-Control", "no-store");
    response.end(csv);
  } catch (error) {
    console.error("CSV export error:", error);
    sendJson(response, 500, { error: "Unable to export registrations." });
  }
};
