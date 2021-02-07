"use strict";
exports.__esModule = true;
var params_1 = require("./params");
function insert(table, data) {
    var columns = [];
    var values = [];
    Object.keys(data).forEach(function (columnName) {
        columns.push(columnName);
        values.push(data[columnName]);
    });
    var valueParams = columns.map(function () { return '?'; }).join(', ');
    var sql = params_1.swapParams("INSERT INTO " + table + " (" + columns.join(', ') + ") values (" + valueParams + ") RETURNING *;", values);
    return [sql, values];
}
exports["default"] = insert;
