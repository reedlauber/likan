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
exports.__esModule = true;
var sql_1 = require("../sql");
var action_1 = require("./action");
var DeleteAction = /** @class */ (function (_super) {
    __extends(DeleteAction, _super);
    function DeleteAction(model, executor) {
        var _this = _super.call(this, model, executor) || this;
        _this.params = [];
        _this.whereClause = '';
        return _this;
    }
    DeleteAction.prototype.where = function (where, params) {
        if (typeof where === 'number') {
            this.params = [where];
            this.whereClause = "id = ?";
        }
        else {
            this.params = params || [];
            this.whereClause = where;
        }
        return this;
    };
    DeleteAction.prototype.commit = function (onSuccess) {
        var sql = sql_1["delete"](this.model.table, {
            params: this.params,
            where: this.whereClause
        });
        _super.prototype.commitAction.call(this, sql, this.params, onSuccess);
    };
    return DeleteAction;
}(action_1["default"]));
function default_1(execute, model, where, params) {
    var action = new DeleteAction(model, execute);
    if (where) {
        action.where(where, params);
    }
    return action;
}
exports["default"] = default_1;
