var sql = require('../sql');

function query_done(execute, model, query, first, callback, count, no_process) {
	var sql_str = sql.select(model.table, query);
	
	execute(sql_str, query.params, function(results) {
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
	}, query.error);
}

function query(execute, model, columns, quick_callback) {
	var self = {}, joins = [], query = { alias:model.alias, columns:columns, wheres:[], params:[] };

	function fn(param) {
		return function(val) {
			query[param] = val;
			return self;
		};
	}

	self.alias = fn('alias');
	self.columns = fn('columns');
	self.params = fn('params');
	self.orders = fn('orders');
	self.group_by = fn('group_by');
	self.limit = fn('limit');
	self.error = fn('error');
	self.offset = fn('offset');
	self.where = function(clause, params) {
		query.wheres.push(clause);
		if(params) {
			query.params = query.params.concat(params);
		}
		return self;
	};
	self.where_if = function(clause, params, condition) {
		if(condition) {
			self.where(clause, params);
		}
		return self;
	};
	self.join = function(join) {
		joins.push(join);
		query.joins = joins.join(' ');
		return self;
	};

	self.commit = function(callback, no_process) {
		if(self.include_count) {
			self.count(function(count) {
				query_done(execute, model, query, false, callback, count, no_process);
			});
		} else {
			query_done(execute, model, query, false, callback, undefined, no_process);
		}
	};

	// Alias "all" and "find" to "commit"
	self.all = self.find = self.commit;

	self.first = function(callback, no_process) {
		query_done(execute, model, query, true, callback, undefined, no_process);
	};

	self.count = function(callback) {
		if(typeof callback === 'boolean') {
			self.include_count = !!callback;
			return self;
		} else {
			var select = query.select,
				orders = query.orders; // temporarily clear order bys (they confuse count aggregation)
			query.select = query.orders = undefined;
			self.select('count(*) as the_count')
				.first(function(result) {
					var count;
					if(result) {
						count = parseInt(result.the_count);
					}
					query.select = select;
					query.orders = orders;
					callback(count);
				}, true);
		}
	};

	self.sql = function(callback) {
		var sql_str = sql.select(model.table, query);
		if(typeof callback === 'function') {
			callback(sql_str, query.params);
		} else {
			console.log(sql_str, query.params);
		}
		return self;
	};

	if(typeof quick_callback === 'function') {
		self.commit(quick_callback);
	}

	return self;
};

module.exports = query;
