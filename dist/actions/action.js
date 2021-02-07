"use strict";
exports.__esModule = true;
var Action = /** @class */ (function () {
    function Action(model, executor) {
        this.model = model;
        this.executor = executor;
    }
    Action.prototype.error = function (callback) {
        this.errorCallback = callback;
        return this;
    };
    Action.prototype.commitAction = function (sql, params, onSuccess) {
        this.executor.call(this.model, sql, params, onSuccess, this.errorCallback);
    };
    return Action;
}());
exports["default"] = Action;
