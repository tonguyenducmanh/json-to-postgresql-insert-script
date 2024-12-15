// file thư viện
import { v4 as uuidv4 } from "uuid";

// danh sách các tỷ giá
import jsonSource from "../input/input.json" assert { type: "json" };

// file tự viết
import { logFile, logFileWithOuputPath } from "./logFile.js";
import config from "../config/config.js";

/**
 * hàm chạy đầu tiên của tool
 */
export async function convertToPostgresSQL() {
  try {
    let source = buildSourceArray();
    if (source && Array.isArray(source)) {
      let script = buildScriptPostgreSQLScript(source);
      if (script) {
        await logFileWithOuputPath(script, config.outputGenScript);
      }
    }
  } catch (error) {
    await logFile(error, "runTool");
  }
}

/**
 * build ra script insert dữ liệu
 * @param {array} source input cần build script
 */
function buildScriptPostgreSQLScript(source) {
  let script = "";
  if (source && Array.isArray(source)) {
    let deleteScript = buildDeleteAllScript(source);
    let arrayScript = [deleteScript];
    script = arrayScript.join("; \n");
  }
  return script;
}

/**
 * build ra script delete dữ liệu cũ trước khi insert
 * @param {array} source input cần build script
 */
function buildDeleteAllScript(source) {
  let deleteScript = "";
  if (
    source &&
    Array.isArray(source) &&
    config &&
    config.primaryKeyField &&
    config.tableName
  ) {
    let allPrimaryValue = source.map((x) => x[config.primaryKeyField]);
    if (allPrimaryValue?.length > 0) {
      let tempPrimaryValue = allPrimaryValue[0];
      let arrayPrimaryDelete = "";
      if (
        typeof tempPrimaryValue === "string" ||
        tempPrimaryValue instanceof String
      ) {
        arrayPrimaryDelete = allPrimaryValue.map((x) => `'${x}'`).join(", ");
      } else {
        arrayPrimaryDelete = allPrimaryValue.join(", ");
      }
      deleteScript = `delete from ${config.tableName} where ${config.primaryKeyField} in (${arrayPrimaryDelete})`;
    }
  }
  return deleteScript;
}

/**
 * tạo ra mảng record để insert
 * @returns mảng record cần insert
 */
function buildSourceArray() {
  let source = [];
  if (jsonSource) {
    if (Array.isArray(jsonSource)) {
      source = jsonSource;
    } else {
      source = [jsonSource];
    }
  }
  return source;
}
