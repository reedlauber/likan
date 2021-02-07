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
var ImportAction = /** @class */ (function (_super) {
    __extends(ImportAction, _super);
    function ImportAction(model, executor, filePath, columns) {
        var _this = _super.call(this, model, executor) || this;
        _this.columns = columns;
        _this.filePath = filePath;
        return _this;
    }
    ImportAction.prototype.commit = function (onSuccess) {
        var sql = sql_1["import"](this.model.table, this.filePath, this.columns);
        _super.prototype.commitAction.call(this, sql, [], onSuccess);
    };
    return ImportAction;
}(action_1["default"]));
function default_1(executor, model, filePath, columns) {
    return new ImportAction(model, executor, filePath, columns);
}
exports["default"] = default_1;
