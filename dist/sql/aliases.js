"use strict";
exports.__esModule = true;
exports.assignAlias = void 0;
function assignClauseAlias(alias, clause) {
    var _a = clause.split('='), left = _a[0], right = _a[1];
    var leftWithAlias = left;
    if (!/[a-z]?\.[a-z]?/i.test(left)) {
        leftWithAlias = alias + "." + left;
    }
    return leftWithAlias + "=" + right;
}
function assignAlias(wheres, alias) {
    if (!alias) {
        return wheres;
    }
    return wheres.map(function (where) {
        var matches = where.match(/[\.a-z_)]+ = \?/ig);
        var aliasedWhere = where;
        if (matches) {
            matches.forEach(function (match) {
                if (match.indexOf('.') === -1) {
                    aliasedWhere = aliasedWhere.replace(match, assignClauseAlias(alias, match));
                }
            });
        }
        return aliasedWhere;
    });
}
exports.assignAlias = assignAlias;
