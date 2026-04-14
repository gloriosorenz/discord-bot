// 🔧 CONFIG
const SHEET_NAME = "Sheet10";

// 🚀 This receives data from Discord
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  // Parse incoming JSON
  const data = JSON.parse(e.postData.contents);

  // Example: message content from Discord
  const content = data.content || "No message";

  // 🧾 OPTIONAL: parse structured message
  // Example format: "2026-04-14 | Branch A | 5000 | 2000"
  const parts = content.split("|").map((p) => p.trim());

  const date = parts[0] || new Date();
  const branch = parts[1] || "Unknown";
  const sales = parts[2] || 0;
  const expenses = parts[3] || 0;

  // Save to sheet
  sheet.appendRow([date, branch, sales, expenses]);

  return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(
    ContentService.MimeType.JSON,
  );
}
