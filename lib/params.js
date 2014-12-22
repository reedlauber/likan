function swap_params(sql, params) {
  var i = 0, len = params.length, idx, pg_var;

  for(; i < len; i++) {
    idx = sql.indexOf('?');

    if(idx === -1) {
      throw new Error('More expected values provided than params spots.');
    }

    pg_var = '$' + (i + 1);

    sql = sql.substr(0, idx) + pg_var + sql.substr(idx+1);
  }
  return sql;
}

module.exports = {
  swap: swap_params
};
