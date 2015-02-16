var sql = require('../sql');

function insert(execute, model, data, no_dates) {
  var self = {}, sets = [], query = { params:[] };

  if(!no_dates) {
    data.created_at = data.updated_at = new Date; 
  }

  self.error = function(callback) {
    query.error = callback;
    return self;
  };

  self.commit = function(callback) {
    sql.insert(model.table, data, function(sql_str, values) {
      execute(sql_str, values, function(results) {
        if(typeof callback === 'function') {
          if(results) {
            callback(results[0]); 
          } else {
            callback();
          }
        }
      }, query.error);
    });
  };

  return self;
};

module.exports = insert;
