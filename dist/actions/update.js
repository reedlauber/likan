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
        _this.where = function (where, params) {
            _this.query.where = where;
            _this.query.params = _this.query.params.concat(params);
            return _this;
        };
        _this.commit = function (onSuccess) {
            var sets = _this.query.sets.join(', ');
            var sql = sql_1.update(_this.model.table, sets, _this.query.params, _this.query.where);
            _super.prototype.commitAction.call(_this, sql, _this.query.params, function () {
                onSuccess(_this.data);
            });
        };
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
    return UpdateAction;
}(action_1["default"]));
function default_1(executor, model, data) {
    return new UpdateAction(model, executor, data);
}
exports["default"] = default_1;
