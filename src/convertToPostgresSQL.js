import jsonSource from "../input/input.json" with { type: "json" };

// file tự viết
import { logFile, logFileWithOuputPath } from "./logFile.js";
import config from "../config/config.js";

const STRING_JOIN = ", ";
const STRING_JOIN_BREAKLINE = ";\n";
const NULL_VALUE = "null";
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
  }catch (error) {
    await logFile(error, "runTool");
  }
}

/**
 * build ra script insert dữ liệu
 * @param {array} source input cần build script
 */
function buildCreateTableScript(source) {
  let createTableScript = "";
  if (source && Array.isArray(source) && config?.tableName) {
    let samples = source.slice(0, 3); // Take the first 3 samples
    let columns = Object.keys(samples[0]).map((key) => {
      let isPrimaryKey = key === config.primaryKeyField;
      let values = samples.map((record) => record[key]).filter((v) => v !== null);

      let dataType = "text"; // Default to text
      if (values.every((v) => typeof v === "number")) {
        dataType = values.every((v) => Number.isInteger(v)) ? "integer" : "text";
      } else if (values.every((v) => typeof v === "boolean")) {
        dataType = "boolean";
      } else if (
        values.every(
          (v) =>
            typeof v === "string" &&
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(v)
        )
      ) {
        dataType = "uuid";
      } else if (
        values.every((v) => typeof v === "string" && !isNaN(Date.parse(v)))
      ) {
        dataType = "timestamp";
      }
      return `${key} ${dataType}${isPrimaryKey ? " not null" : " null"}`;
    });

    const primaryKeyConstraint = config.primaryKeyField
      ? `, primary key ("${config.primaryKeyField}")`
      : "";

    createTableScript = `create table if not exists ${config.tableName} (\n  ${columns.join(",\n  ")}${primaryKeyConstraint}\n);`;
    }
  return createTableScript;
}

function buildScriptPostgreSQLScript(source) {
  let script = "";
  if (source && Array.isArray(source)) {
    let createTableScript = config.enableCreateTable
      ? buildCreateTableScript(source)
      : "";
    let deleteScript = buildDeleteAllScript(source);
    let insertScripts = buildInsertAllScript(source);
    if (deleteScript && insertScripts && Array.isArray(insertScripts)) {
      let arrayScript = [createTableScript, deleteScript, ...insertScripts];
      script = arrayScript.join(STRING_JOIN_BREAKLINE);
      if (script) {
        script += STRING_JOIN_BREAKLINE;
      }
    }
  }
  return script;
}

/**
 * build ra script insert toàn bộ các dòng có trong json soucr
 * @param {array} source input cần build script
 */
function buildInsertAllScript(source) {
  let insertScripts = [];
  if (source && Array.isArray(source) && config?.tableName) {
    source.forEach((item) => {
      // lọc qua từng item mới build danh sách key, do có thể mỗi item trong mảng json có số lượng key khác nhau
      let allKeyFields = Object.keys(item);
      if (allKeyFields?.length > 0) {
        let insertFieldText = allKeyFields.join(STRING_JOIN);
        let insertValues = [];
        allKeyFields.forEach((key) => {
          if (key && item.hasOwnProperty(key)) {
            let valueInsert = item[key];
            if (valueInsert == null) {
              insertValues.push(NULL_VALUE);
            } else if (checkIsText(valueInsert)) {
              insertValues.push(getStringText(valueInsert));
            } else {
              insertValues.push(valueInsert);
            }
          }
        });
        let insertValuesText = insertValues.join(STRING_JOIN);
        let insertScript = `insert into ${config.tableName} (${insertFieldText}) values (${insertValuesText})`;
        insertScripts.push(insertScript);
      }
    });
  }
  return insertScripts;
}

/**
 * trả về text kèm ''
 * @param {string} text từ cần thêm ''
 * @returns text
 */
function getStringText(text) {
  return `'${text}'`;
}

/**
 * kiểm tra xem nội dung có phải text không
 * @param {*} input đoạn input cần kiểm tra
 * @returns
 */
function checkIsText(input) {
  return typeof input === "string" || input instanceof String;
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
      if (checkIsText(tempPrimaryValue)) {
        arrayPrimaryDelete = allPrimaryValue
          .map((x) => getStringText(x))
          .join(STRING_JOIN);
      } else {
        arrayPrimaryDelete = allPrimaryValue.join(STRING_JOIN);
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
