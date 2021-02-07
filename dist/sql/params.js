"use strict";
exports.__esModule = true;
exports.swapParams = void 0;
// Takes a query string and converts '?' param placeholders with '$1' pg sql notation for params
function swapParams(sql, params) {
    var swapped = params.reduce(function (acc, param, i) {
        var idx = acc.indexOf('?');
        if (idx === -1) {
            throw new Error('More expected values provided than params spots.');
        }
        var pgVar = "$" + (i + 1);
        var pre = acc.substr(0, idx);
        var post = acc.substr(idx + 1);
        return "" + pre + pgVar + post;
    }, sql);
    return swapped;
}
exports.swapParams = swapParams;
