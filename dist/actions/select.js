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
        // Query-building Methods
        _this.alias = function (aliasName) {
            _this.query.alias = aliasName;
            return _this;
        };
        _this.columns = function (columns) {
            _this.query.columns = columns;
            return _this;
        };
        _this.groupBy = function (groupBys) {
            _this.query.groupBy = groupBys;
            return _this;
        };
        _this.group_by = function (group_bys) {
            return _this.groupBy(group_bys);
        };
        _this.join = function (join, params, type) {
            type = type || 'JOIN';
            _this.joins.push(type + " " + join);
            _this.query.joins = _this.joins.join(' ');
            addParamsToQuery(_this.query, params);
            return _this;
        };
        _this.limit = function (limit) {
            _this.query.limit = limit;
            return _this;
        };
        _this.offset = function (offset) {
            _this.query.offset = offset;
            return _this;
        };
        _this.orders = function (orderBys) {
            _this.query.orders = orderBys;
            return _this;
        };
        _this.params = function (params) {
            _this.query.params = params;
            return _this;
        };
        _this.process = function (shouldProcess) {
            if (typeof shouldProcess === 'object') {
                _this.processOptions = shouldProcess;
                _this.query.shouldProcess = true;
            }
            else {
                _this.query.shouldProcess = shouldProcess;
            }
            return _this;
        };
        _this.sql = function (callback) {
            var sql = sql_1.select(_this.model.table, _this.query);
            if (callback) {
                callback(sql, _this.query.params);
            }
            else {
                console.log(sql, _this.query.params);
            }
            return _this;
        };
        _this.where = function (whereClause, params) {
            _this.query.wheres.push(whereClause);
            addParamsToQuery(_this.query, params);
            return _this;
        };
        _this.whereIf = function (whereClause, params, condition) {
            if (condition) {
                _this.where(whereClause, params);
            }
            return _this;
        };
        // Commit Methods
        _this.all = function (onSuccess) {
            _this.commit(onSuccess);
        };
        _this.commit = function (onSuccess, query) {
            if (query === void 0) { query = _this.query; }
            var sql = sql_1.select(_this.model.table, query);
            _super.prototype.commitAction.call(_this, sql, query.params, function (rows) {
                var processedRows = rows;
                if (query.shouldProcess) {
                    // processedRows = this.model.process(rows, this.processOptions);
                    processedRows = _this.executeMiddleware(rows);
                }
                onSuccess(processedRows);
            });
        };
        _this.count = function (includeCount) {
            if (typeof includeCount === 'boolean') {
                _this.includeCount = includeCount;
            }
            else if (typeof includeCount === 'function') {
                var onSuccess_1 = includeCount;
                var countQuery = __assign(__assign({}, _this.query), { columns: 'count (*) as the_count', orders: '' });
                _this.first(function (result) {
                    var count;
                    if (result) {
                        count = parseInt(result.the_count, 10);
                        onSuccess_1(count);
                    }
                }, countQuery);
            }
        };
        _this.first = function (onSuccess, query) {
            if (query === void 0) { query = _this.query; }
            _this.commit(function (rows) {
                var firstRow = rows[0];
                onSuccess(firstRow);
            }, query);
        };
        _this.query.alias = alias_1.tableAlias(_this.model.table);
        _this.query.columns = columns || '*';
        _this.processOptions = processOptions;
        return _this;
    }
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
