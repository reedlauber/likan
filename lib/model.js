var client = require('./client'),
  actions = require('./actions');

function get_table_alias(alias, table) {
  return alias || table.split('_').map(function(part) {
    return part[0];
  }).join('');
}

function Model(conn_string, table, options) {
  var _client = client(conn_string),
      _options = options || {},
      _public_fields = _options.public_fields || null,
      _alias = get_table_alias(_options.alias, table);

  this.CLASS = 'Model';
  this.table = table;
  this.alias = _alias; // Readonly

  function execute_query(sql, params, success, error) {
    _client.query(sql, params, function(result) {
      if(typeof success === 'function') {
        success(result.rows);
      }
    }, error);
  }

  this.process = function(data, callback) {
    callback(data);
  };

  this.query = function(agency_id) {
    return actions.query(execute_query, agency_id);
  };

  this.update = function(data) {
    return actions.update(execute_query, data);
  };
}

module.exports = Model;
