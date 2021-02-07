"use strict";
exports.__esModule = true;
var params_1 = require("./params");
function default_1(table, q) {
    return params_1.swapParams("DELETE FROM " + table + " WHERE " + q.where + ";", q.params);
}
exports["default"] = default_1;
;
