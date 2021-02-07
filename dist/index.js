"use strict";
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
var model_1 = require("./model");
var likan = function (connectionString, connectionOptions) {
    return {
        create: function (table, modelOptions) {
            return new model_1["default"](connectionString, table, __assign(__assign({}, connectionOptions), modelOptions));
        }
    };
};
exports["default"] = likan;
