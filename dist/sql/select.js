"use strict";
exports.__esModule = true;
var aliases_1 = require("./aliases");
var params_1 = require("./params");
function select(table, q) {
    q = q || {};
    var columns = q.columns || '*';
    var alias = '';
    var joins = '';
    var where = '';
    var groupBy = '';
    var orderBy = '';
    var limit = '';
    var offset = '';
    if (q.alias) {
        alias = " as " + q.alias;
    }
    if (q.joins) {
        joins = " " + q.joins.trim();
    }
    if (q.wheres && q.wheres.length) {
        var wheres = aliases_1.assignAlias(q.wheres, q.alias);
        where = " WHERE " + wheres.join(' AND ');
    }
    if (q.groupBy) {
        groupBy = " GROUP BY " + q.groupBy;
    }
    if (q.orders) {
        orderBy = " ORDER BY " + q.orders;
    }
    if (q.limit) {
        limit = " LIMIT " + q.limit;
    }
    if (q.offset) {
        offset = " OFFSET " + q.offset;
    }
    var sql = "SELECT " + columns + " FROM " + table + alias + joins + where + groupBy + limit + offset + ";";
    var params = q.params || [];
    return params_1.swapParams(sql, params);
}
exports["default"] = select;
