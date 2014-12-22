var sql = require('../sql');

function query_done(execute, model, q, first, callback, count, no_process) {
	var sql_str = sql.select(model.table, q.select, q.joins, q.where, q.params, q.group_by, q.orders, q.limit, q.offset, q.alias);
	
	execute(sql_str, q.params, function(results) {
		if(results) {
			results = first ? results[0] : results;
			if(no_process) {
				callback(results, count);
			} else {
				model.process(results, function(processed) {
					callback(processed, count);
				});
			}
		} else {
			callback(first ? undefined : [], 0);
		}
	}, q.error);
}

function query(execute) {
	var query = {}, model = this, joins = [], q = { alias:this.alias };

	function fn(param) {
		return function(val) {
			q[param] = val;
			return query;
		};
	}

	query.alias = fn('alias');
	query.select = fn('select');
	query.params = fn('params');
	query.orders = fn('orders');
	query.group_by = fn('group_by');
	query.limit = fn('limit');
	query.error = fn('error');
	query.offset = fn('offset');
	query.where = function(clause, params) {
		q.where = clause;
		if(params) {
			q.params = params;
		}
		return query;
	};
	query.where_if = function(clause, params, condition) {
		if(condition) {
			if(q.where) {
				q.where += ' AND ' + clause;
			} else {
				q.where = clause;	
			}
			if(params) {
				q.params = (q.params || []).concat(params);
			}
		}
		return query;
	};
	query.join = function(join) {
		joins.push(join);
		q.joins = joins.join(' ');
		return query;
	};

	query.done = function(callback, no_process) {
		if(query.include_count) {
			query.count(function(count) {
				query_done(execute, model, q, false, callback, count, no_process);
			});
		} else {
			query_done(execute, model, q, false, callback, undefined, no_process);
		}
	};

	query.first = function(callback, no_process) {
		query_done(execute, model, q, true, callback, undefined, no_process);
	};

	query.count = function(callback) {
		if(typeof callback === 'boolean') {
			query.include_count = !!callback;
			return query;
		} else {
			var select = q.select,
				orders = q.orders; // temporarily clear order bys (they confuse count aggregation)
			q.select = q.orders = undefined;
			query.select('count(*) as the_count')
				.first(function(result) {
					var count;
					if(result) {
						count = parseInt(result.the_count);
					}
					q.select = select;
					q.orders = orders;
					callback(count);
				}, true);
		}
	};

	query.sql = function(callback) {
		var sql_str = sql.generate(model.table, q.select, q.joins, q.where, q.params, q.group_by, q.orders, q.limit, q.offset, q.alias);
		if(typeof callback === 'function') {
			callback(sql_str, q.params);
		} else {
			console.log(sql_str, q.params);
		}
		return query;
	};

	return query;
};

module.exports = query;

