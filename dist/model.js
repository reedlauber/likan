"use strict";
exports.__esModule = true;
var actions = require("./actions");
var alias_1 = require("./alias");
var client_1 = require("./client");
var processor = require("./processor");
var Model = /** @class */ (function () {
    function Model(connectionString, table, options) {
        var _this = this;
        this.resultsMiddleware = [];
        this["delete"] = function (where, params) {
            return actions["delete"](_this.executeQuery, _this, where, params);
        };
        this["import"] = function (filePath, columns) {
            return actions["import"](_this.executeQuery, _this, filePath, columns);
        };
        this.insert = function (data) {
            return actions.insert(_this.executeQuery, _this, data, _this.options.dates);
        };
        this.result = function (callback) {
            _this.resultsMiddleware.push(callback);
        };
        this.select = function (columns, options) {
            return actions.select(_this.executeQuery, _this, columns, options);
        };
        this.truncate = function () {
            return actions.truncate(_this.executeQuery, _this);
        };
        this.update = function (data) {
            return actions.update(_this.executeQuery, _this, data);
        };
        this.table = table;
        this.options = options;
        this.client = new client_1["default"](connectionString, !!options.ssl);
        this.alias = alias_1.tableAlias(table, options.alias);
        if (typeof options.dates === 'undefined') {
            this.options.dates = { createdAt: true, updatedAt: true };
        }
        if (options.publicFields) {
            this.result(function (result, processOptions) { return processor.publicOnly(result, options.publicFields, processOptions); });
        }
    }
    Model.prototype.executeQuery = function (sql, params, onSuccess, onError) {
        this.client.query(sql, params, function (result) {
            if (typeof onSuccess === 'function') {
                onSuccess(result.rows);
            }
        }, onError);
    };
    return Model;
}());
exports["default"] = Model;
