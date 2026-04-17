const SHEET_NAME = "Sheet10";

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    // Get all gsheets name
    Logger.log("Available sheets:");
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheets()
      .forEach((s) => Logger.log("- " + s.getName()));

    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No POST body received");
    }

    // 🚨 DEBUG RAW REQUEST FIRST
    Logger.log("RAW BODY: " + e.postData.contents);

    // ✅ PARSE JSON PROPERLY
    const data = JSON.parse(e.postData.contents);

    Logger.log("PARSED DATA: " + JSON.stringify(data));

    sheet.appendRow([
      data.date || "No date",
      data.branch || "Unknown",

      data.s1_cash || 0,
      data.cutoff || 0,
      data.s1_dan_eric || 0,
      data.s1_donut || 0,
      data.s1_exp || 0,
      data.s1_disc || 0,
      data.s1_cashier || "",

      data.s2_cash || 0,
      data.s2_donut || 0,
      data.s2_dan_eric || 0,
      data.s2_exp || 0,
      data.s2_disc || 0,
      data.s2_cashier || "",

      data.gross || 0,
      data.net || 0,
      data.po || "",
      data.lo || "",
      data.salary || 0,
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (err) {
    Logger.log("ERROR: " + err.toString());

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: err.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
