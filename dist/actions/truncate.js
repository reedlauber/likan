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
var TruncateAction = /** @class */ (function (_super) {
    __extends(TruncateAction, _super);
    function TruncateAction(model, executor) {
        var _this = _super.call(this, model, executor) || this;
        _this.commit = function (onSuccess) {
            var sql = sql_1.truncate(_this.model.table);
            _super.prototype.commitAction.call(_this, sql, [], onSuccess);
        };
        return _this;
    }
    return TruncateAction;
}(action_1["default"]));
function default_1(executor, model) {
    return new TruncateAction(model, executor);
}
exports["default"] = default_1;
