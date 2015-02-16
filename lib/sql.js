var params = require('./params'),
    self = {};

self._assign_alias = function(alias, wheres) {
  if(!alias) return wheres;

  return wheres.map(function(where) {
    var pieces = where.split('='),
        left = pieces[0],
        right = pieces[1];

    if(!/[a-z]?\.[a-z]?/i.test(left)) {
      left = alias + '.' + left;
    }

    return left + '=' + right;
  });
};

self.select = function(table, q) {
  q = q || {};
  var sql = 'SELECT ' + (q.columns || '*') + ' FROM ' + table;

  if(q.alias) {
    sql += ' as '+ q.alias;
  }

  if(q.joins) {
    sql += ' ' + q.joins.trim();
  }

  if(q.wheres && q.wheres.length) {
    q.wheres = self._assign_alias(q.alias, q.wheres);
    sql += ' WHERE ' + q.wheres.join(' AND ');
  }

  if(q.group_by) {
    sql += ' GROUP BY ' + q.group_by;
  }

  if(q.orders && typeof q.orders === 'string') {
    sql += ' ORDER BY ' + q.orders;
  }

  if(q.params) {
    sql = params.swap(sql, q.params);
  }

  if(typeof q.limit === 'number') {
    sql += ' LIMIT ' + q.limit;
  }

  if(typeof q.offset === 'number') {
    sql += ' OFFSET ' + q.offset;
  }

  sql += ';';

  return sql;
};

self.update = function(table, set, args, where) {
  var sql = 'UPDATE ' + table;

  sql += ' SET ' + set;

  if(where) {
    sql += ' WHERE ' + where;
  }

  if(args) {
    sql = params.swap(sql, args);
  }

  sql += ';';

  return sql;
}

self.insert = function(table, data, callback) {
  var sql = 'INSERT INTO ' + table,
      columns = [],
      value_params = [],
      values = [],
      field;

  for(field in data) {
    if(data.hasOwnProperty(field)) {
      columns.push(field);
      value_params.push('?');
      values.push(data[field]);
    }
  }

  sql += ' (' + columns.join(', ') + ') values (' + value_params.join(', ') + ') RETURNING *;';
  sql = params.swap(sql, values);

  callback(sql, values);
}

self.delete = function(table, q) {
  var sql = 'DELETE FROM ' + table + ' WHERE ' + q.where;
  sql = params.swap(sql, q.params);
  sql += ';';
  return sql;
};

self.truncate = function(table) {
  return 'TRUNCATE table ' + table + ';';
};

self.import = function(table, file_path, columns) {
  return 'COPY ' + table + ' (' + columns.join(', ') + ') FROM \'' + file_path + '\' WITH NULL \'NULL\';';
};

module.exports = self;
