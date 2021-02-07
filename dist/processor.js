"use strict";
exports.__esModule = true;
exports.publicOnly = void 0;
function processDatum(datum, publicFields) {
    var processed = {
        id: datum.id
    };
    // Shortcut for a pseudo field "dates" that expands to both standard date fields
    if (publicFields.includes('dates')) {
        processed.created_at = datum.created_at;
        processed.updated_at = datum.updated_at;
    }
    publicFields
        .filter(function (fieldName) { return fieldName !== 'dates' && datum.hasOwnProperty(fieldName); })
        .forEach(function (fieldName) {
        processed[fieldName] = datum[fieldName];
    });
    return processed;
}
function processData(data, publicFields) {
    if (data instanceof Array) {
        return data.map(function (datum) { return processDatum(datum, publicFields); });
    }
    return processDatum(data, publicFields);
}
var publicOnly = function (data, publicFields, options) {
    var processed = data;
    if (!options || options.public !== false) {
        processed = processData(data, publicFields);
    }
    return processed;
};
exports.publicOnly = publicOnly;
