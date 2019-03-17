var async = require('async'),
    Client = require('./client'),
    actions = require('./actions'),
    processor = require('./processor');

// Returns an alias that is the first letter of the table.
// If the table is underscore-separated, the alias is each
// of the first letters of each separated "word"
// e.g. for table "bird_cat_dog", alias is "bcd"
function getTableAlias(alias, table) {
  return alias || table.split('_').map(function(part) {
    return part[0];
  }).join('');
}

function Model(connectionString, table, options) {
  var _self = this,
      _options = options || {},
      _client = new Client(connectionString, !!options.ssl),
      _public_fields = _options.public_fields || null,
      _alias = getTableAlias(_options.alias, table);

  if(typeof _options.dates === 'undefined') {
    _options.dates = { updated_at:true, created_at:true };
  }

  this.CLASS = 'Model';
  this.table = table;
  this.alias = _alias; // Readonly
  this.process = null; // function(data, callback) { callback(data); };

  function execute_query(sql, params, success, error) {
    _client.query(sql, params, function(result) {
      if(typeof success === 'function') {
        success(result.rows);
      }
    }, error);
  }

  this._process = function(data, options, callback) {
    processor.public(data, _public_fields, options, (data) => {
      if (!this.process) {
        return callback(data);
      }

      if(data instanceof Array) {
        var processed = [];
        async.eachSeries(data, function(datum, callback) {
          _self.process(datum, function(processedDatum) {
            processed.push(processedDatum);
            callback();
          });
        }, function() {
          callback(processed);
        });
      } else {
        _self.process(data, callback);
      }
    });
  };

  // Each interface method returns a chainable object, 
  // which contain at least "error" and "commit" methods.

  this.select = function(columns, options, callback) {
    if(typeof columns === 'function') {
      callback = columns;
      options = {};
      columns = null;
    } else if (typeof options === 'function') {
      callback = options;
      options = {};
    } else if(typeof columns === 'object') {
      options = columns;
      columns = undefined;
    }

    return actions.select(execute_query, this, columns, options, callback);
  };

  this.insert = function(data) {
    return actions.insert(execute_query, this, data, _options.dates);
  };

  this.update = function(data) {
    return actions.update(execute_query, this, data);
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
      query.params = (query.params || []).concat(params);
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
