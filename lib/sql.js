var params = require('./params'),
  sql = {};

sql.select = function(table, select, joins, where, args, group_bys, orders, limit, offset, alias) {
  var sql = 'SELECT ' + (select || '*') + ' FROM ' + table;

  if(alias) {
    sql += ' as '+ alias;
  }

  if(joins) {
    sql += ' ' + joins.trim();
  }

  if(where) {
    sql += ' WHERE ' + where;
  }

  if(group_bys) {
    sql += ' GROUP BY ' + group_bys;
  }

  if(orders && typeof orders === 'string') {
    sql += ' ORDER BY ' + orders;
  }

  if(args) {
    sql = params.swap(sql, args);
  }

  if(typeof limit === 'number') {
    sql += ' LIMIT ' + limit;
  }

  if(typeof offset === 'number') {
    sql += ' OFFSET ' + offset;
  }

  sql += ';';

  return sql;
};

sql.update = function(table, set, args, where) {
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

sql.insert = function(table, data, callback) {
  var sql = 'INSERT INTO ' + table,
    columns = [],
    value_params = [],
    values = [];

  for(var field in data) {
    if(data.hasOwnProperty(field)) {
      columns.push(field);
      value_params.push('?');
      values.push(data[field]);
    }
  }

  sql += ' (' + columns.join(', ') + ') values (' + value_params.join(', ') + ');';
  sql = params.swap(sql, values);

  callback(sql, values);
}

module.exports = sql;
