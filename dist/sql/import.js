"use strict";
exports.__esModule = true;
function default_1(table, filePath, columns) {
    return "COPY " + table + " (" + columns.join(',') + ") FROM '" + filePath + "' WITH NULL 'NULL'";
}
exports["default"] = default_1;
