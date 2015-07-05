var sql = require('../sql');

function update(execute, model, data) {
  var self = {}, sets = [], query = { params:[] };

  data.updated_at = new Date;

  for(var field in data) {
    if(data.hasOwnProperty(field) && field !== 'id') {
      sets.push(field + ' = ?');
      query.params.push(data[field]);
    }
  }

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
    var set_clauses = sets.join(', ');
        sql_str = sql.update(model.table, set_clauses, query.params, query.where);

    execute(sql_str, query.params, function() {
      if(typeof callback === 'function') {
        callback(data);
      }
    }, query.error);
  };

  if(typeof data.id !== 'undefined') {
    self.where('id = ?', [data.id]);
  }

  return self;
};

module.exports = update;
