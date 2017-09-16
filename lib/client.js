const { Client, Pool } = require('pg');

class LikanClient {
	constructor(connectionString, ssl = false) {
		this.pool = new Pool({ connectionString, ssl });
	}

	onError(err, query) {
		return console.error('Error running query', query, '\n', err);
	}

	query(query, params, success, error = this.onError) {
		this.pool.connect((err, client, release) => {
			if (err) {
				return console.error('Could not connect to postgres', err);
			}

			if (typeof params === 'function') {
				error = success;
				success = params;
				params = [];
			}

			client.query(query, params, (err, result) => {
				release();

				if (err) {
					return error(err, query);
				}

				if (typeof success === 'function') {
					success(result);
				}
			});
		});
	}
}

module.exports = class LikanClient {
	constructor(connectionString, ssl = false) {
		this.pool = new Pool({ connectionString, ssl });
	}

	onError(err, query) {
		return console.error('Error running query', query, '\n', err);
	}

	query(query, params, success, error = this.onError) {
		this.pool.connect((err, client, release) => {
			if (err) {
				return console.error('Could not connect to postgres', err);
			}

			if (typeof params === 'function') {
				error = success;
				success = params;
				params = [];
			}

			client.query(query, params, (err, result) => {
				release();

				if (err) {
					return error(err, query);
				}

				if (typeof success === 'function') {
					success(result);
				}
			});
		});
	}
};
