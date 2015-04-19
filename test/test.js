var assert = require('assert');
var config = require('../config/local.json');

var likan = require('../index')(config.test_database_path);
var params = require('../lib/params');
var sql = require('../lib/sql');
var processor = require('../lib/processor');

describe('likan', function() {
  var model;

  beforeEach(function() {
    model = likan.create('cats', { dates:false });
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

    it('should handle params as array', function(done) {
      model.select()
        .where('foo = ?', ['bar'])
        .sql(function(sql, params) {
          assert.equal(sql, 'SELECT * FROM cats as c WHERE c.foo = $1;');
          assert.equal(params.length, 1);
          assert.equal(params[0], 'bar');
          done();
        });
    });

    it('should handle params as single value', function(done) {
      model.select()
        .where('foo = ?', 'bar')
        .sql(function(sql, params) {
          assert.equal(sql, 'SELECT * FROM cats as c WHERE c.foo = $1;');
          assert.equal(params.length, 1);
          assert.equal(params[0], 'bar');
          done();
        });
    });

    it('should handle params across multiple wheres', function(done) {
      model.select()
        .where('foo = ?', 'bar')
        .where('wut = ?', ['wat'])
        .sql(function(sql, params) {
          assert.equal(sql, 'SELECT * FROM cats as c WHERE c.foo = $1 AND c.wut = $2;');
          assert.equal(params.length, 2);
          assert.equal(params[0], 'bar');
          assert.equal(params[1], 'wat');
          done();
        });
    });

    it('should include JOIN params', function(done) {
      model.select()
        .join('toys t ON t.name = ?', 'mouse')
        .where('foo = ?', 'bar')
        .sql(function(sql, params) {
          assert.equal(sql, 'SELECT * FROM cats as c JOIN toys t ON t.name = $1 WHERE c.foo = $2;');
          assert.equal(params.length, 2);
          assert.equal(params[0], 'mouse');
          assert.equal(params[1], 'bar');
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

  describe('processor', function() {
    var datum;

    beforeEach(function() {
      datum = { a:'b', c:'d', e:123 };
    });

    it('should do nothing if no public fields are supplied', function(done) {
      processor.process(datum, null, function(processed) {
        assert.equal(processed, datum);
        done();
      });
    });

    it('should limit to public fields', function(done) {
      processor.process(datum, ['a', 'c'], function(processed) {
        assert.equal(typeof processed.e, 'undefined');
        done();
      });
    });

    it('should handle arrays', function(done) {
      var datum2 = { a:'z', c:'y', f:987 };
      var data = [datum, datum2];

      processor.process(data, ['a', 'c'], function(processed) {
        assert.equal(processed[0].a, datum.a);
        assert.equal(processed[1].a, datum2.a);
        assert.equal(typeof processed[0].e, 'undefined');
        assert.equal(typeof processed[1].f, 'undefined');
        done();
      });
    });

    it('should process after selects', function(done) {
      model = likan.create('cats', { dates:false, public_fields:['color'] });

      model.select()
        .first(function(record) {
          assert.equal(typeof record.cat_name, 'undefined');
          assert.equal(typeof record.id, 'number');
          done();
        });
    });

    it('should not process if processing is turned off', function(done) {
      model = likan.create('cats', { dates:false, public_fields:['color'] });

      model.select()
        .process(false)
        .first(function(record) {
          assert.notEqual(typeof record.cat_name, 'undefined');
          done();
        });
    });
  });
});
