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
var InsertAction = /** @class */ (function (_super) {
    __extends(InsertAction, _super);
    function InsertAction(model, executor, data, dates) {
        var _this = _super.call(this, model, executor) || this;
        _this.commit = function (onSuccess) {
            var _a = sql_1.insert(_this.model.table, _this.data), sql = _a[0], paramValues = _a[1];
            _super.prototype.commitAction.call(_this, sql, paramValues, function (rows) {
                if (onSuccess) {
                    onSuccess(rows[0]);
                }
            });
        };
        _this.data = data;
        if (dates && dates.createdAt) {
            _this.data.created_at = new Date();
        }
        if (dates && dates.updatedAt) {
            _this.data.updated_at = new Date();
        }
        return _this;
    }
    return InsertAction;
}(action_1["default"]));
function default_1(execute, model, data, dates) {
    return new InsertAction(model, execute, data);
}
exports["default"] = default_1;
