// file config dữ liệu

export default {
  // tên bảng cần insert
  tableName: "sme.account_object",
  // khóa chính của bảng
  primaryKeyField: "account_object_id",
  // đường dẫn kết quả
  outputPath: "./output/result.txt",
  // đường dẫn kết quả
  outputLogPath: "./output/resultLog.txt",
  // file script gen sẵn
  outputGenScript: "./output/result.sql",
  logTime: "Thời gian chạy tổng cộng là: {0} phút",
  keyReplace: "{0}",
  logActionSuccess: "Đã thực hiện được: {0}%",
  startLog: "Bắt đầu thực hiện tác vụ",
  // có muốn ghi log không phải lỗi không
  isLogInfo: true,
  // định dạng ngày tháng khi ghi log
  logLocation: "vn-VN",
  // có muốn chạy hàm buildCreateTableScript không
  enableCreateTable: true,
};
