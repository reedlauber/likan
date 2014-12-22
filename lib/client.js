var pg = require('pg');

function Client(connString) {
	this.connString = connString;

	this.query = function(query, params, success, error) {
		pg.connect(this.connString, function(err, client, done) {
			if(err) {
				return console.error('Could not connect to postgres', err);
			}

			if(typeof params === 'function') {
				error = success;
				sucess = params;
				params = [];
			}

			client.query(query, params, function(err, result) {
				if(err) {
					if(typeof error === 'function') {
						error(err);
					}
					return console.error('Error running query', query, '\n', err);
				}
				if(typeof success === 'function') {
					success(result);
				}
				done();
			});
		});
	};
}

module.exports = function(connString) {
	return new Client(connString);
};
