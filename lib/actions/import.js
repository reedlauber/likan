var sql = require('../sql');

function _import(execute, model, file_path, columns) {
  var self = {}, query = { };

  self.error = function(callback) {
    query.error = callback;
    return self;
  };

  self.where = function() { return self; };

  self.commit = function(callback) {
    var sql_str = sql.import(model.table, file_path, columns);

    execute(sql_str, null, function() {
      if(typeof callback === 'function') {
        callback(data);
      }
    }, query.error);
  };

  return self;
}

module.exports = _import;
