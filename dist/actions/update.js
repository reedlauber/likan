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
var UpdateAction = /** @class */ (function (_super) {
    __extends(UpdateAction, _super);
    function UpdateAction(model, executor, data) {
        var _this = _super.call(this, model, executor) || this;
        _this.query = {};
        _this.data = data;
        _this.parseData(data);
        if (typeof data.id !== 'undefined') {
            _this.where('id = ?', [data.id]);
        }
        return _this;
    }
    UpdateAction.prototype.parseData = function (data) {
        var _this = this;
        Object.keys(data).forEach(function (fieldName) {
            if (fieldName !== 'id') {
                _this.query.sets.push(fieldName + " = ?");
                _this.query.params.push(data[fieldName]);
            }
        });
    };
    UpdateAction.prototype.where = function (where, params) {
        this.query.where = where;
        this.query.params = this.query.params.concat(params);
        return this;
    };
    UpdateAction.prototype.commit = function (onSuccess) {
        var _this = this;
        var sets = this.query.sets.join(', ');
        var sql = sql_1.update(this.model.table, sets, this.query.params, this.query.where);
        _super.prototype.commitAction.call(this, sql, this.query.params, function () {
            onSuccess(_this.data);
        });
    };
    return UpdateAction;
}(action_1["default"]));
function default_1(executor, model, data) {
    return new UpdateAction(model, executor, data);
}
exports["default"] = default_1;
