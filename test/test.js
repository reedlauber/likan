const assert = require('assert');
const config = require('../config/local.json');

main = require('../dist/index').default;

const likan = main(config.test_database_path, { ssl:false });
const params = require('../dist/sql/params');
const sql = require('../dist/sql');
const { assignAlias } = require('../dist/sql/aliases');
const processor = require('../dist/processor');

describe('likan', () => {
  let model;

  beforeEach(() => {
    model = likan.create('cats', { dates:false });
    restrictedModel = likan.create('cats', { dates:false, publicFields:['id', 'cat_name'] });
  });

  describe('Model', () => {
    it('should create a model with the correct table name', () => {
      assert.strictEqual(model.table, 'cats');
    });

    it('should create an alias with the first letter and lowercase', () => {
      assert.strictEqual(model.alias, 'c');
    });

    it('should create multi-char alias with _-separated table name', () => {
      model = likan.create('cat_dogs');
      assert.strictEqual(model.alias, 'cd');

      model = likan.create('cat_dog_fishes');
      assert.strictEqual(model.alias, 'cdf');
    });

    it('should override with custom alias', () => {
      model = likan.create('cats', { alias:'z' });
      assert.strictEqual(model.alias, 'z');
    });
  });

  describe('params', () => {
    it('should swap ? into $[1]', () => {
      var swapped = params.swapParams('WHERE a = ? AND b = ? AND c = ?', ['1', '2', '3']);
      assert.strictEqual('WHERE a = $1 AND b = $2 AND c = $3', swapped);
    });
  });

  describe('sql', () => {
    describe('assign_alias', function() {
      it('should do nothing if no alias is given', function() {
        var wheres = ['foo = ?'];
        var assigned = assignAlias(wheres, null);
        assert.strictEqual(wheres, assigned);
      });

      it('should prepend alias if not present', function() {
        var wheres = ['foo = ?'];
        var assigned = assignAlias(wheres, 'a');
        assert.strictEqual('a.foo = ?', assigned[0]);
      });

      it('should leave alias if manually set', function() {
        var wheres = ['b.foo = ?'];
        var assigned = assignAlias(wheres, 'a');
        assert.strictEqual('b.foo = ?', assigned[0]);
      });

      it('should only assign needed aliases', function() {
        var wheres = ['foo = ?', 'b.bar = ?'];
        var assigned = assignAlias(wheres, 'a');
        assert.strictEqual('a.foo = ?', assigned[0]);
        assert.strictEqual('b.bar = ?', assigned[1]);
      });

      it('should handle multi-part (complex) clauses', function() {
        var wheres = ['foo = ? OR bar = ?'];
        var assigned = assignAlias(wheres, 'a');
        assert.strictEqual('a.foo = ? OR a.bar = ?', assigned[0]);
      });

      it('should handle clauses inside functions', function() {
        var wheres = ['lower(foo) = ? OR lower(b.bar) = ?'];
        var assigned = assignAlias(wheres, 'a');
        assert.strictEqual('lower(a.foo) = ? OR lower(b.bar) = ?', assigned[0]);
      });
    });

    describe('select', function() {
      it('should generate select query', function() {
        var sql_text = sql.select('cats');
        assert.strictEqual('SELECT * FROM cats;', sql_text);
      });

      it('should override select', function() {
        var sql_text = sql.select('cats', { columns:'color, hair' });
        assert.strictEqual('SELECT color, hair FROM cats;', sql_text);
      });

      it('should override joins', function() {
        var join_statement = 'JOIN places ON cats.place = places.id';
        var sql_text = sql.select('cats', { joins:join_statement });
        assert.strictEqual('SELECT * FROM cats ' + join_statement + ';', sql_text);
      });

      it('should override where', function() {
        var sql_text = sql.select('cats', { wheres:['color = ?'] });
        assert.strictEqual('SELECT * FROM cats WHERE color = ?;', sql_text);
      });

      it('should set args', function() {
        var sql_text = sql.select('cats', { wheres:['color = ?'], params:['green'] });
        assert.strictEqual('SELECT * FROM cats WHERE color = $1;', sql_text);
      });
    });
  });

  describe('select', () => {
    it('should be able to run a select query', (done) => {
      model.select().commit((results) => {
        assert.strictEqual(results.length, 3);
        done();
      });
    });

    it('should return single object for "first"', (done) => {
      model.select().first((result) => {
        assert.strictEqual(typeof result.id, 'number');
        done();
      });
    });

    it('should alias "all" to "commit"', (done) => {
      model.select().all((results) => {
        assert.strictEqual(results.length, 3);
        done();
      });
    });

    it('should handle params as array', (done) => {
      model.select()
        .where('foo = ?', ['bar'])
        .sql((sql, params) => {
          assert.strictEqual(sql, 'SELECT * FROM cats as c WHERE c.foo = $1;');
          assert.strictEqual(params.length, 1);
          assert.strictEqual(params[0], 'bar');
          done();
        });
    });

    it('should handle params as single value', (done) => {
      model.select()
        .where('foo = ?', 'bar')
        .sql((sql, params) => {
          assert.strictEqual(sql, 'SELECT * FROM cats as c WHERE c.foo = $1;');
          assert.strictEqual(params.length, 1);
          assert.strictEqual(params[0], 'bar');
          done();
        });
    });

    it('should handle params across multiple wheres', (done) => {
      model.select()
        .where('foo = ?', 'bar')
        .where('wut = ?', ['wat'])
        .sql((sql, params) => {
          assert.strictEqual(sql, 'SELECT * FROM cats as c WHERE c.foo = $1 AND c.wut = $2;');
          assert.strictEqual(params.length, 2);
          assert.strictEqual(params[0], 'bar');
          assert.strictEqual(params[1], 'wat');
          done();
        });
    });

    it('should handle IN statements', (done) => {
      model.select()
        .where('c.color IN (?, ?)', ['black', 'orange'])
        .all((results) => {
          done();
        });
    });

    it('should include JOIN params', (done) => {
      model.select()
        .join('toys t ON t.name = ?', 'mouse')
        .where('foo = ?', 'bar')
        .sql((sql, params) => {
          assert.strictEqual(sql, 'SELECT * FROM cats as c JOIN toys t ON t.name = $1 WHERE c.foo = $2;');
          assert.strictEqual(params.length, 2);
          assert.strictEqual(params[0], 'mouse');
          assert.strictEqual(params[1], 'bar');
          done();
        });
    });

    it('should use custom post-processor', (done) => {
      var addedFieldValue = 'something';

      model.result((result) => {
        result.added = addedFieldValue;
        return result;
      });

      model.select().first((record) => {
        assert.strictEqual(record.added, addedFieldValue)
        done();
      });
    });

    it('should restrict to public fields only', (done) => {
      restrictedModel.select().first((record) => {
        assert.strictEqual(typeof record.id, 'number');
        assert.strictEqual(typeof record.cat_name, 'string');
        assert.strictEqual(typeof record.color, 'undefined');
        done();
      });
    });

    it('should show all fields when `public` is false', (done) => {
      restrictedModel.select().process({ public:false }).first((record) => {
        assert.strictEqual(typeof record.color, 'string');
        done();
      });
    });
  });

  describe('insert', () => {
    var color = 'tortoise';

    afterEach((done) => {
      model.delete('color = ?', [color]).commit(() => {
        done();
      });
    });

    it('should insert a row', (done) => {
      model.insert({ color:color }).commit((record) => {
        assert.strictEqual(typeof record, 'object');
        assert.strictEqual(typeof record.id, 'number');
        assert.strictEqual(record.color, color);
        done();
      });
    });
  });

  describe('processor', () => {
    var datum;

    beforeEach(() => {
      datum = { a:'b', c:'d', e:123 };
    });

    it('should limit to public fields', () => {
      const processed = processor.publicOnly(datum, ['a', 'c']);

      assert.strictEqual(typeof processed.e, 'undefined');
    });

    it('should skip public limits when option is disabled', () => {
      const processed = processor.publicOnly(datum, ['a', 'c'], { public: false });

      assert.strictEqual(processed.e, datum.e);
    });

    it('should handle arrays for public', () => {
      var datum2 = { a:'z', c:'y', f:987 };
      var data = [datum, datum2];

      const processed = processor.publicOnly(data, ['a', 'c'], null);

      assert.strictEqual(processed[0].a, datum.a);
      assert.strictEqual(processed[1].a, datum2.a);
      assert.strictEqual(typeof processed[0].e, 'undefined');
      assert.strictEqual(typeof processed[1].f, 'undefined');
    });

    it('should process after selects', (done) => {
      model = likan.create('cats', { dates:false, publicFields:['color'] });

      model.select()
        .first((record) => {
          assert.strictEqual(typeof record.cat_name, 'undefined');
          assert.strictEqual(typeof record.id, 'number');
          done();
        });
    });

    it('should not process if processing is turned off', (done) => {
      model = likan.create('cats', { dates:false, publicFields:['color'] });

      model.select()
        .process(false)
        .first((record) => {
          assert.notStrictEqual(typeof record.cat_name, 'undefined');
          done();
        });
    });
  });
});
