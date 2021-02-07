"use strict";
exports.__esModule = true;
var pg_1 = require("pg");
var LikanClient = /** @class */ (function () {
    function LikanClient(connectionString, ssl) {
        if (ssl === void 0) { ssl = false; }
        this.pool = new pg_1.Pool({ connectionString: connectionString, ssl: ssl });
    }
    LikanClient.prototype.onError = function (error, query) {
        console.error("Error running query \"" + query + "\"\n" + error);
    };
    LikanClient.prototype.query = function (query, params, onSuccess, onError) {
        if (onError === void 0) { onError = this.onError; }
        this.pool.connect(function (error, client, release) {
            if (error) {
                return console.error('Could not connect to postgres', error);
            }
            client.query(query, params, function (error, result) {
                release();
                if (error) {
                    return onError(error, query);
                }
                onSuccess(result);
            });
        });
    };
    return LikanClient;
}());
exports["default"] = LikanClient;
