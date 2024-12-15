// file thư viện
import { v4 as uuidv4 } from "uuid";

// danh sách các tỷ giá
import jsonSource from "../input/input.json" assert { type: "json" };

// file tự viết
import { logFile, logFileWithOuputPath } from "./logFile.js";
import config from "../config/config.js";

export async function convertToPostgresSQL() {
  try {
    let script = "";
    if (jsonSource) {
    }
    if (script) {
      await logFileWithOuputPath(script, config.outputGenScript);
    }
  } catch (error) {
    await logFile(error, "runTool");
  }
}
