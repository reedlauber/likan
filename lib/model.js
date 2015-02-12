var client = require('./client'),
    actions = require('./actions');

// Returns an alias that is the first letter of the table.
// If the table is underscore-separated, the alias is each
// of the first letters of each separated "word"
// e.g. for table "bird_cat_dog", alias is "bcd"
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

  // Each interface method returns a chainable object, 
  // which contain at least "error" and "commit" methods.

  this.select = function(columns, callback) {
    if(typeof columns === 'function') {
      callback = columns;
      columns = null;
    }

    return actions.select(execute_query, this, columns, callback);
  };

  // this.insert = function(data) {
  //   return actions.insert(execute_query, data);
  // };

  this.update = function(data) {
    return actions.update(execute_query, data);
  };

  this.delete = function(where, params) {
    return actions.delete(execute_query, this, where, params);
  };

  this.truncate = function() {
    return actions.truncate(execute_query, this);
  };

  this.import = function(file_path, columns) {
    return actions.import(execute_query, this, file_path, columns);
  };

  this.delete_import = function(file_path, columns) {
    var thiz = this, self = {}, query = {};

    self.error = function(callback) {
      query.error = callback;
      return self;
    };

    self.where = function(where, params) {
      query.where = where;
      query.params = query.params.concat(params);
      return self;
    };

    self.commit = function(callback) {
      thiz.delete()
        .error(query.error)
        .where(query.where, query.params)
        .commit(function() {
          thiz.import(file_path, columns)
            .error(query.error)
            .commit(callback);
        });
    };

    return self;
  };
}

module.exports = Model;
