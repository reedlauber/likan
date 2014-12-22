var assert = require('assert');

var likan = require('../index')('postgres://reedlauber:5432@localhost/likan_test');
var params = require('../lib/params');
var sql = require('../lib/sql');

describe('likan', function() {
  var model;

  beforeEach(function() {
    model = likan.create('cats');
  });

  describe('Model', function() {
    it('should create a model with the correct table name', function() {
      assert.equal(model.table, 'cats');
    });

    it('should create an alias with the first letter and lowercase', function() {
      assert.equal(model.alias, 'c');
    });

    it('should create multi-char alias with _-separated table name', function() {
      model = likan.create('cat_dogs');
      assert.equal(model.alias, 'cd');

      model = likan.create('cat_dog_fishes');
      assert.equal(model.alias, 'cdf');
    });

    it('should override with custom alias', function() {
      model = likan.create('cat', { alias:'z' });
      assert.equal(model.alias, 'z');
    });
  });

  describe('params', function() {
    it('should swap ? into $[1]', function() {
      var swapped = params.swap('WHERE a = ? AND b = ? AND c = ?', ['1', '2', '3']);
      assert.equal('WHERE a = $1 AND b = $2 AND c = $3', swapped);
    });
  });

  describe('sql', function() {
    describe('select', function() {
      it('should generate select query', function() {
        var sql_text = sql.select('cats');
        assert.equal('SELECT * FROM cats;', sql_text);
      });

      it('should override select', function() {
        var sql_text = sql.select('cats', 'color, hair');
        assert.equal('SELECT color, hair FROM cats;', sql_text);
      });

      it('should override joins', function() {
        var join_statement = 'JOIN places ON cats.place = places.id';
        var sql_text = sql.select('cats', null, join_statement);
        assert.equal('SELECT * FROM cats ' + join_statement + ';', sql_text);
      });

      it('should override where', function() {
        var sql_text = sql.select('cats', null, null, 'color = ?');
        assert.equal('SELECT * FROM cats WHERE color = ?;', sql_text);
      });

      it('should set args', function() {
        var sql_text = sql.select('cats', null, null, 'color = ?', ['green']);
        assert.equal('SELECT * FROM cats WHERE color = $1;', sql_text);
      });
    });
  });

  describe('query', function() {
    it('should be able to run a query', function() {
      model.query().done(function(results) {
        assert.equal(results.length, 2);
        done();
      });
    });

    it('should return single object for "first"', function() {
      model.query().first(function(result) {
        assert.equal(typeof result.id, 'wat');
        done();
      });
    });
  });
});
