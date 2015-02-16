var assert = require('assert');
var config = require('../config/local.json');

var likan = require('../index')(config.test_database_path);
var params = require('../lib/params');
var sql = require('../lib/sql');

describe('likan', function() {
  var model;

  beforeEach(function() {
    model = likan.create('cats', { no_dates:true });
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
    describe('assign_alias', function() {
      it('should do nothing if no alias is given', function() {
        var wheres = ['foo = ?'];
        var assigned = sql._assign_alias(null, wheres);
        assert.equal(wheres, assigned);
      });

      it('should prepend alias if not present', function() {
        var wheres = ['foo = ?'];
        var assigned = sql._assign_alias('a', wheres);
        assert.equal('a.foo = ?', assigned[0]);
      });

      it('should leave alias if manually set', function() {
        var wheres = ['b.foo = ?'];
        var assigned = sql._assign_alias('a', wheres);
        assert.equal('b.foo = ?', assigned[0]);
      });

      it('should only assign needed aliases', function() {
        var wheres = ['foo = ?', 'b.bar = ?'];
        var assigned = sql._assign_alias('a', wheres);
        assert.equal('a.foo = ?', assigned[0]);
        assert.equal('b.bar = ?', assigned[1]);
      });
    });

    describe('select', function() {
      it('should generate select query', function() {
        var sql_text = sql.select('cats');
        assert.equal('SELECT * FROM cats;', sql_text);
      });

      it('should override select', function() {
        var sql_text = sql.select('cats', { columns:'color, hair' });
        assert.equal('SELECT color, hair FROM cats;', sql_text);
      });

      it('should override joins', function() {
        var join_statement = 'JOIN places ON cats.place = places.id';
        var sql_text = sql.select('cats', { joins:join_statement });
        assert.equal('SELECT * FROM cats ' + join_statement + ';', sql_text);
      });

      it('should override where', function() {
        var sql_text = sql.select('cats', { wheres:['color = ?'] });
        assert.equal('SELECT * FROM cats WHERE color = ?;', sql_text);
      });

      it('should set args', function() {
        var sql_text = sql.select('cats', { wheres:['color = ?'], params:['green'] });
        assert.equal('SELECT * FROM cats WHERE color = $1;', sql_text);
      });
    });
  });

  describe('select', function() {
    it('should be able to run a select query', function(done) {
      model.select().commit(function(results) {
        assert.equal(results.length, 2);
        done();
      });
    });

    it('should return single object for "first"', function(done) {
      model.select().first(function(result) {
        assert.equal(typeof result.id, 'number');
        done();
      });
    });

    it('should alias "all" to "commit"', function(done) {
      model.select().all(function(results) {
        assert.equal(results.length, 2);
        done();
      });
    });

    it('should alias "find" to "commit"', function(done) {
      model.select().find(function(results) {
        assert.equal(results.length, 2);
        done();
      });
    });

    it('should allow quick callbacks', function(done) {
      model.select(function(results) {
        assert.equal(results.length, 2);
        done();
      });
    });
  });

  describe('insert', function() {
    var color = 'tortoise';

    afterEach(function(done) {
      model.delete('color = ?', [color]).commit(done);
    });

    it('should insert a row', function(done) {
      model.insert({ color:color }).commit(function(record) {
        assert.equal(typeof record, 'object');
        assert.equal(typeof record.id, 'number');
        assert.equal(record.color, color);
        done();
      });
    });
  });
});
