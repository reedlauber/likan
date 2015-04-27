function process_datum(datum, public_fields) {
  var processed = {
    id: datum.id // always include id field
  };

  // Shortcut for a pseudo field "dates" that expands to both standard date fields
  var dates_idx = public_fields.indexOf('dates');
  if(dates_idx > -1) {
    processed.created_at = datum.created_at;
    processed.updated_at = datum.updated_at;
    public_fields.splice(dates_idx, 1);
  }

  public_fields.forEach(function(field_name) {
    if(field_name in datum) {
      processed[field_name] = datum[field_name];
    }
  });

  return processed;
}

function process_data(data, public_fields) {
  if(data instanceof Array) {
    data = data.map(function(datum) {
      return process_datum(datum, public_fields);
    });
    return data;
  }

  return process_datum(data, public_fields);
}

module.exports = exports = {
  public: function(data, public_fields, callback) {
    if(public_fields) {
      data = process_data(data, public_fields);
    }

    callback(data);
  }
};
