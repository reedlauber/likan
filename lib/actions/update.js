var sql = require('../sql');

function update(execute, data) {
	var query = {}, model = this, sets = [], q = { params:[] };

	data.updated_at = new Date;

	for(var field in data) {
		if(data.hasOwnProperty(field) && field !== 'id') {
			sets.push(field + ' = ?');
			q.params.push(data[field]);
		}
	}

	query.error = function(fn) {
		q.error = fn;
		return query;
	};

	query.where = function(where, params) {
		q.where = where;
		q.params = q.params.concat(params);
		return query;
	};

	query.commit = function(callback) {
		var set_clauses = sets.join(', ');
			sql_str = sql.update(model.table, set_clauses, q.params, q.where);

		execute(sql_str, q.params, function() {
			if(typeof callback === 'function') {
				callback(data);
			}
		}, q.error);
	};

	if(typeof data.id !== 'undefined') {
		query.where('id = ?', [data.id]);
	}

	return query;
};

module.exports = update;
