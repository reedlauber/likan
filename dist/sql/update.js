"use strict";
exports.__esModule = true;
var params_1 = require("./params");
function update(table, sets, args, wheres) {
    var where = '';
    if (wheres) {
        where = " WHERE " + wheres;
    }
    var params = args || [];
    return params_1.swapParams("UPDATE " + table + " SET " + sets + where + ";", params);
}
exports["default"] = update;
