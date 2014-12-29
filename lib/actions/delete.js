var sql = require('../sql');

function del(execute, model, where, params) {
  var self = {}, query = { where:where, params:params };

  // Allow shortcut of model.delete(123); 
  // to delete by ID
  if(typeof where === 'number') {
    params = [where];
    where = 'id = ?';
  }

  self.error = function(callback) {
    query.error = callback;
    return self;
  };

  self.commit = function(callback) {
    var sql_str = sql.delete(model.table, query);

    execute(sql_str, query.params, function() {
      if(typeof callback === 'function') {
        callback(data);
      }
    }, query.error);
  };

  return self;
};

module.exports = del;
