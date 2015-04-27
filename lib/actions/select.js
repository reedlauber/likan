var sql = require('../sql');

function query_done(execute, model, query, first, callback, count) {
	var sql_str = sql.select(model.table, query);
	
	execute(sql_str, query.params, function(results) {
		if(results) {
			results = first ? results[0] : results;
			if(query.process) {
				model._process(results, function(processed) {
					callback(processed, count);
				});
			} else {
				callback(results, count);
			}
		} else {
			callback(first ? undefined : [], 0);
		}
	}, query.error);
}

function include_params(query, params) {
	if(typeof params !== 'undefined') {
		if(!(params instanceof Array)) {
			params = [params];
		}
		query.params = query.params.concat(params);
	}
}

function query(execute, model, columns, quick_callback) {
	var self = {}, joins = [], query = { alias:model.alias, columns:columns, wheres:[], params:[], process:true };

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
	self.process = fn('process');
	self.join = function(join, params, type) {
		type = type || 'JOIN';
		joins.push(type + ' ' + join);
		query.joins = joins.join(' ');
		include_params(query, params);
		return self;
	};
	self.where = function(clause, params) {
		query.wheres.push(clause);
		include_params(query, params);
		return self;
	};
	self.where_if = function(clause, params, condition) {
		if(condition) {
			self.where(clause, params);
		}
		return self;
	};

	self.commit = function(callback) {
		if(self.include_count) {
			self.count(function(count) {
				query_done(execute, model, query, false, callback, count);
			});
		} else {
			query_done(execute, model, query, false, callback, undefined);
		}
	};

	// Alias "all" and "find" to "commit"
	self.all = self.find = self.commit;

	self.first = function(callback) {
		query_done(execute, model, query, true, callback, undefined);
	};

	self.count = function(callback) {
		if(typeof callback === 'boolean') {
			self.include_count = !!callback;
			return self;
		} else {
			var columns = query.columns,
				orders = query.orders; // temporarily clear order bys (they confuse count aggregation)

			query.columns = query.orders = undefined;

			self.columns('count(*) as the_count')
				.first(function(result) {
					var count;
					if(result) {
						count = parseInt(result.the_count, 10);
					}
					query.columns = columns;
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
