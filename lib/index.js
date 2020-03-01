const Model = require('./model');

module.exports = function(connectionString, connectionOptions = {}) {
  return {
    create: function(table, modelOptions = {}) {
      return new Model(
        connectionString,
        table,
        {
          ...connectionOptions,
          ...modelOptions
        }
      );
    }
  };
};
