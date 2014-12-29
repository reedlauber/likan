var sql = require('../sql');

function truncate(execute, model) {
  var self = {}, query = {};

  self.error = function(callback) {
    query.error = callback;
    return self;
  };

  self.commit = function(callback) {
    var sql_str = sql.truncate(model.table);

    execute(sql_str, null, function() {
      if(typeof callback === 'function') {
        callback(data);
      }
    }, query.error);
  };

  return self;
};

module.exports = truncate;
