var paginate = require('../lib');
var mongoose = require('mongoose');
var async = require('async');
var assert = require('chai').assert;
var expect = require('chai').expect;


// global reference
var db,
    paginateSchema;


// initalize models
before(function(done){
  paginateSchema = new mongoose.Schema({}, { versionKey: false });
  paginateSchema.add({
    _id: Number,
    name: String,
    createdAt: Date
  });
  paginateSchema.plugin(paginate.plugin, {
    limit: 5
  });

  mongoose.connect('mongodb://localhost/test');
  mongoose.model('Paginate', paginateSchema);

  return mongoose.connection.once("connected", done); // wait for it
});


// clean prev test data
before(function(done){
  mongoose.model('Paginate').remove(done);
});


// initialize test data
before(function(done){
  var arr = [];
  for(var i = 1000; i >= 1; i--) arr.push(i);

  async.each(arr, function(i, cb){
    var obj = {
      _id: i,
      name: "paginate_" + i,
      createdAt: new Date().setDate(new Date().getDate() - i)
    };
    mongoose.model('Paginate')(obj).save(cb);
  }, done);

});



describe("Should", function(){
  var paginateKey = "_id";
  var normalizeSorting = paginate.normalizeSorting;

  it("accept sorting values", function(done){
    expect(normalizeSorting(-1)).to.equal(-1);
    expect(normalizeSorting(1)).to.equal(1);
    expect(normalizeSorting('asc')).to.equal(1);
    expect(normalizeSorting('ASC')).to.equal(1);
    expect(normalizeSorting('desc')).to.equal(-1);
    expect(normalizeSorting('DESC')).to.equal(-1);

    done();
  });

  it("paginate with default sortingKey asc", function(done){
    var q = mongoose.model('Paginate').paginate({}, paginateKey);

    expect(q).to.have.property('exec');
    expect(q).to.have.property('execPagination');
    expect(q).to.have.property('where');
    expect(q.options.sort).to.have.property('_id');
    expect(q.options.sort._id).to.equal(1);

    done();
  });

  it("paginate with default sortingKey desc", function(done){
    var q = mongoose.model('Paginate').paginate({ sort: 'desc' }, paginateKey);

    expect(q).to.have.property('exec');
    expect(q).to.have.property('execPagination');
    expect(q).to.have.property('where');
    expect(q.options.sort).to.have.property('_id');
    expect(q.options.sort._id).to.equal(-1);

    done();
  });

  it("paginate with custom sortingKey asc", function(done){
    var q = mongoose.model('Paginate').paginate("name", paginateKey);

    expect(q.options.sort).to.have.property('name');
    expect(q.options.sort).to.not.have.property('_id');
    expect(q.options.sort.name).to.equal(1);
    done();
  });

  it("paginate with custom sortingKey desc", function(done){
    var q = mongoose.model('Paginate').paginate({ sort: 'DESC' }, "name", paginateKey);

    expect(q.options.sort).to.have.property('name');
    expect(q.options.sort).to.not.have.property('_id');
    expect(q.options.sort.name).to.equal(-1);
    done();
  });

  it("paginate with params and key", function(done){
    var params = { after: 0 };

    mongoose.model('Paginate').paginate(params, paginateKey, function(err, results){
      assert.isArray(results);
      done(err);
    });
  });

  it("paginate with callback", function(done){
    mongoose.model('Paginate').paginate(function(err, result){
      assert.isArray(result);
      done(err);
    });
  });


  describe("ensure sorting", function() {

    describe("paginate after asc", function(){
      it("exec", function(done){
        var paginateKey = "_id";
        var params = { after: 950 };

        var queue = async.queue(function(task, callback){
          mongoose.model('Paginate').paginate(task, paginateKey, function(err, result){
            if(result.length === 0) {
              callback();
              return done(); // at the end;
            }

            result.forEach(function(d){
              assert.isTrue(d._id > task.after);
            });

            queue.push({
              after: result[result.length-1][paginateKey]
            });

            callback();
          });
        });
        queue.push(params);
      });

      it("execPagination", function(done){
        var paginateKey = "_id";
        var params = { after: 950 };

        var query = mongoose.model('Paginate')
          .paginate(params, paginateKey)
          .execPagination(function(err, result){
            expect(result.after).to.be.equal(955);
            expect(result.before).to.be.equal(951);

            var lastValue = params.after;
            result.results.forEach(function(o){
              expect(o._id).to.be.above(lastValue);
              lastValue = o[paginateKey];
            });

            done(err);
          });
      });
    });

    describe("paginate after desc", function(){
      it("exec", function(done){
        var paginateKey = "_id";
        var params = { after: 950, sort: -1 };

        var queue = async.queue(function(task, callback){
          var q = mongoose.model('Paginate').paginate(task, paginateKey, function(err, result){

            if(result.length === 0) {
              callback();
              return done(); // at the end;
            }

            result.forEach(function(d){
              assert.isTrue(d._id > task.after);
            });

            params.after = result[0][paginateKey];
            queue.push(params);

            callback();
          });
        });

        queue.push(params);
      });

      it("execPagination", function(done){
        var paginateKey = "_id";
        var params = { after: 950, sort: -1 };
        var query = mongoose.model('Paginate').paginate(params, paginateKey);

        expect(query.options).to.have.property('flip');
        expect(query.options).to.have.property('method').with.to.be.equal('after');

        query.execPagination(function(err, result){
          expect(result.after).to.be.equal(params.after + query.options.limit);
          expect(result.before).to.be.equal(params.after + 1);

          result.results.forEach(function(o){
            assert.isTrue(o._id > params.after);
          });

          done(err);
        });
      });
    });

    describe("paginate before asc", function() {

      it("exec", function(done){
        var paginateKey = "_id";
        var params = { before: 500 };

        var queue = async.queue(function(task, callback){
          var q = mongoose.model('Paginate').paginate(task, paginateKey, function(err, result){

            if(result.length === 0) {
              callback();
              return done();
            }

            result.forEach(function(d){
              assert.isTrue(d._id < task.before);
            });

            params.before = result[0][paginateKey];
            queue.push(params);

            callback();
          });
        });

        queue.push(params);
      });

      it("execPagination", function(done){
        var paginateKey = "_id";
        var params = { before: 500, sort: 1 };
        var query = mongoose.model('Paginate').paginate(params, paginateKey);

        query.execPagination(function(err, result){
          expect(result.after).to.be.equal(params.before - 1);
          expect(result.before).to.be.equal(params.before - query.options.limit);

          result.results.forEach(function(o){
            assert.isTrue(o._id < params.before);
          });

          done(err);
        });
      });
    });

    describe("paginate before desc", function(){

      it("exec", function(done){
        var paginateKey = "_id";
        var params = { before: 500, sort: -1 };

        var queue = async.queue(function(task, callback){
          var q = mongoose.model('Paginate').paginate(task, paginateKey, function(err, result){

            if(result.length === 0) {
              callback();
              return done();
            }

            result.forEach(function(d){
              assert.isTrue(d._id < task.before);
            });

            params.before = result[result.length-1][paginateKey];
            queue.push(params);

            callback();
          });
        });

        queue.push(params);
      });

      it("execPaginator", function(done){
        var paginateKey = "_id";
        var params = { before: 500, sort: -1 };
        var query = mongoose.model('Paginate')
          .paginate(params, paginateKey)
          .execPagination(function(err, result){

            expect(result).to.have.property('perPage');
            expect(result).to.have.property('thisPage');
            expect(result).to.have.property('after');
            expect(result).to.have.property('before');
            expect(result).to.have.property('results').with.to.be.a('array');

            expect(result.after).to.be.equal(499);
            expect(result.before).to.be.equal(495);

            result.results.forEach(function(o){
              assert.isTrue(o._id < params.before);
            });

            done(err);
          });
      });
    });
  });
});
