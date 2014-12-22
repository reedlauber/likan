var Model = require('./model');

module.exports = function(conn_string) {
	return {
		create: function(table, options) {
			return new Model(conn_string, table, options);
		}
	};
};
