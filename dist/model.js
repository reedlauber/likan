"use strict";
exports.__esModule = true;
var actions = require("./actions");
var alias_1 = require("./alias");
var client_1 = require("./client");
var processor = require("./processor");
var Model = /** @class */ (function () {
    function Model(connectionString, table, options) {
        this.resultsMiddleware = [];
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
    Model.prototype["delete"] = function (where, params) {
        return actions["delete"](this.executeQuery, this, where, params);
    };
    Model.prototype["import"] = function (filePath, columns) {
        return actions["import"](this.executeQuery, this, filePath, columns);
    };
    Model.prototype.insert = function (data) {
        return actions.insert(this.executeQuery, this, data, this.options.dates);
    };
    Model.prototype.result = function (callback) {
        this.resultsMiddleware.push(callback);
    };
    Model.prototype.select = function (columns, options) {
        return actions.select(this.executeQuery, this, columns, options);
    };
    Model.prototype.truncate = function () {
        return actions.truncate(this.executeQuery, this);
    };
    Model.prototype.update = function (data) {
        return actions.update(this.executeQuery, this, data);
    };
    return Model;
}());
exports["default"] = Model;
