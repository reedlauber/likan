"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var alias_1 = require("../alias");
var sql_1 = require("../sql");
var action_1 = require("./action");
function addParamsToQuery(query, params) {
    if (params) {
        if (!Array.isArray(params)) {
            params = [params];
        }
        query.params = query.params.concat(params);
    }
}
var SelectAction = /** @class */ (function (_super) {
    __extends(SelectAction, _super);
    function SelectAction(model, executor, columns, processOptions) {
        var _this = _super.call(this, model, executor) || this;
        _this.includeCount = false;
        _this.joins = [];
        _this.query = { params: [], shouldProcess: true, wheres: [] };
        _this.processOptions = null;
        _this.query.alias = alias_1.tableAlias(_this.model.table);
        _this.query.columns = columns || '*';
        _this.processOptions = processOptions;
        return _this;
    }
    // Query-building Methods
    SelectAction.prototype.alias = function (aliasName) {
        this.query.alias = aliasName;
        return this;
    };
    SelectAction.prototype.columns = function (columns) {
        this.query.columns = columns;
        return this;
    };
    SelectAction.prototype.groupBy = function (groupBys) {
        this.query.groupBy = groupBys;
        return this;
    };
    SelectAction.prototype.group_by = function (group_bys) {
        return this.groupBy(group_bys);
    };
    SelectAction.prototype.join = function (join, params, type) {
        type = type || 'JOIN';
        this.joins.push(type + " " + join);
        this.query.joins = this.joins.join(' ');
        addParamsToQuery(this.query, params);
        return this;
    };
    SelectAction.prototype.limit = function (limit) {
        this.query.limit = limit;
        return this;
    };
    SelectAction.prototype.offset = function (offset) {
        this.query.offset = offset;
        return this;
    };
    SelectAction.prototype.orders = function (orderBys) {
        this.query.orders = orderBys;
        return this;
    };
    SelectAction.prototype.params = function (params) {
        this.query.params = params;
        return this;
    };
    SelectAction.prototype.process = function (shouldProcess) {
        if (typeof shouldProcess === 'object') {
            this.processOptions = shouldProcess;
            this.query.shouldProcess = true;
        }
        else {
            this.query.shouldProcess = shouldProcess;
        }
        return this;
    };
    SelectAction.prototype.sql = function (callback) {
        var sql = sql_1.select(this.model.table, this.query);
        if (callback) {
            callback(sql, this.query.params);
        }
        else {
            console.log(sql, this.query.params);
        }
        return this;
    };
    SelectAction.prototype.where = function (whereClause, params) {
        this.query.wheres.push(whereClause);
        addParamsToQuery(this.query, params);
        return this;
    };
    SelectAction.prototype.whereIf = function (whereClause, params, condition) {
        if (condition) {
            this.where(whereClause, params);
        }
        return this;
    };
    SelectAction.prototype.where_if = function (where_clause, params, condition) {
        return this.whereIf(where_clause, params, condition);
    };
    // Commit Methods
    SelectAction.prototype.all = function (onSuccess) {
        this.commit(onSuccess);
    };
    SelectAction.prototype.commit = function (onSuccess, query) {
        var _this = this;
        if (query === void 0) { query = this.query; }
        var sql = sql_1.select(this.model.table, query);
        _super.prototype.commitAction.call(this, sql, query.params, function (rows) {
            var processedRows = rows;
            if (query.shouldProcess) {
                // processedRows = this.model.process(rows, this.processOptions);
                processedRows = _this.executeMiddleware(rows);
            }
            onSuccess(processedRows);
        });
    };
    SelectAction.prototype.count = function (includeCount) {
        if (typeof includeCount === 'boolean') {
            this.includeCount = includeCount;
        }
        else if (typeof includeCount === 'function') {
            var onSuccess_1 = includeCount;
            var countQuery = __assign(__assign({}, this.query), { columns: 'count (*) as the_count', orders: '' });
            this.first(function (result) {
                var count;
                if (result) {
                    count = parseInt(result.the_count, 10);
                    onSuccess_1(count);
                }
            }, countQuery);
        }
    };
    SelectAction.prototype.first = function (onSuccess, query) {
        if (query === void 0) { query = this.query; }
        this.commit(function (rows) {
            var firstRow = rows[0];
            onSuccess(firstRow);
        }, query);
    };
    SelectAction.prototype.executeMiddleware = function (results) {
        var _this = this;
        var processed = results;
        this.model.resultsMiddleware.forEach(function (middleware) {
            processed = processed.map(function (result) { return middleware(result, _this.processOptions); });
        });
        return processed;
    };
    return SelectAction;
}(action_1["default"]));
function default_1(executor, model, columns, processOptions) {
    return new SelectAction(model, executor, columns, processOptions);
}
exports["default"] = default_1;
