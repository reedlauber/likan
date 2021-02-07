"use strict";
exports.__esModule = true;
exports.tableAlias = void 0;
// Returns an alias that is the first letter of the table.
// If the table is underscore-separated, the alias is each
// of the first letters of each separated "word"
// e.g. for table "bird_cat_dog", alias is "bcd"
function tableAlias(tableName, alias) {
    if (alias)
        return alias;
    return tableName.split('_').map(function (part) { return part[0]; }).join('');
}
exports.tableAlias = tableAlias;
