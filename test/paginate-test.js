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
    name: String
  });
  paginateSchema.plugin(paginate.plugin, {});

  mongoose.connect('mongodb://localhost/test');
  mongoose.model('Paginate', paginateSchema);

  return mongoose.connection.once("connected", done); // wait for it
});


// initialize test data
before(function(done){

  for(var i = 1; i <= 1000; i++){

  }
  done();

});


describe("Should", function(){
  var normalizeSorting = paginate.normalizeSorting;

  it("normalize sorting", function(done){
    expect(normalizeSorting(-1)).to.equal(-1);
    expect(normalizeSorting(1)).to.equal(1);
    expect(normalizeSorting('asc')).to.equal(1);
    expect(normalizeSorting('ASC')).to.equal(1);
    expect(normalizeSorting('desc')).to.equal(-1);
    expect(normalizeSorting('DESC')).to.equal(-1);

    done();
  });

  it("get data", function(done){

    mongoose.model('Paginate').find(function(){
      console.log(arguments);
    });
    done();
  })
});
