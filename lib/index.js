/**
 * Created by jonas on 2/12/14.
 */

var mongoose = require('mongoose');


var paginatePlugin = function (schema, options) {
    options = options || {};
    options.limit = options.limit || 25;
    options.direction = options.direction || 1;
    options.defaultKey = options.defaultKey || '_id';

    mongoose.Query.prototype.execPagination = function(callback) {
        var query = this;
        var _return = {};

        if (!query.options.paginateKey) throw new Error('Did you forget to use pagination plugin?');
        if (!query.options.limit) query.options.limit = options.limit;

        query.exec(function(err, objects) {
            if(!objects) objects = [];
            if(query.options.flip) objects.reverse();

            _return.results = objects;
            _return.perPage = query.options.limit;
            _return.thisPage = objects.length;

            var order = query.options.sort[query.options.paginateKey];
            var after, before;

            // if sorting is flipped, get initial sorting direction
            if (query.options.flip) order = order > 0 ? -1 : 1;

            // cases
            if(order === -1){
              after = 0;
              before = objects.length -1;
            } else {
              after = objects.length -1;
              before = 0;
            }

            _return.after = objects.length > 0 ? objects[after][query.options.paginateKey] : null;
            _return.before = objects.length > 0 ? objects[before][query.options.paginateKey] : null;

            return callback(err, _return);
        });
    };

    schema.statics['paginate'] = function(params, key, cb) {
      var q = this.find(),
          params = params || {},
          sorting = {},
          query = {},
          sortKey;
      q.options.flip = false;

      if('function' === typeof params) {
        cb = params;
        params = {};
      }
      if('string' === typeof params) {
        key = params;
        params = {};
      }

      if (!key) key = options.defaultKey;
      sortKey = key;
      if (params.after && params.before) throw new Error('Pagination can\'t have both after and before parameter');
      if (key === 'id') sortKey = '_id';

      sorting[sortKey] = normalizeSorting(params.sort) || options.direction;
      if (params.after || params.before) {
        query[key] = {};

        if(params.after) {
          q.options.method = 'after';
          if(sorting[sortKey] > 0) {
            query[key] = { $gt: params.after };
          } else {
            query[key] = { $gt: params.after };
            sorting[sortKey] = 1;
            q.options.flip = true;
          }
        }
        else if(params.before) {
          q.options.method = 'before';
          if(sorting[sortKey] > 0) {
            query[key] = { $lt: params.before };
            sorting[sortKey] = -1;
            q.options.flip = true;
          } else {
            query[key] = { $lt: params.before };
          }
        }
      }

      q.where(query);
      q.sort(sorting);
      q.limit(options.limit);
      q.options.paginateKey = key;

      if ('function' === typeof cb) q.exec(function(err, results){
        if(err) return cb(err);
        return cb(err, q.options.flip ? results.reverse() : results);
      });

      return q;
    };
};

/**
 *
 * @param sort
 * @returns {*}
 */
var normalizeSorting = function(sort) {
    if(!sort) return false;
    if(sort.toString().toLowerCase() === 'asc') return 1;
    if(sort.toString().toLowerCase() === 'desc') return -1;
    return sort;
};

module.exports.normalizeSorting = normalizeSorting;
module.exports.plugin = paginatePlugin;
