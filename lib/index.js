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
            _return.results = objects;
            _return.perPage = query.options.limit;
            _return.thisPage = objects.length;
            _return.after = objects && objects.length > 0 ? objects[objects.length - 1][query.options.paginateKey] : null;
            _return.before = objects && objects.length > 0 ? objects[0][query.options.paginateKey] : null;
            return callback(err, _return);
        });
    };

    schema.statics['paginate'] = function(params, key, cb) {
        var q = this.find(),
            sorting = {},
            query = {},
            sortKey;

        if (!key) key = options.defaultKey;
        sortKey = key;
        if (params.after && params.before) throw new Error('Pagination can\'t have both after and before parameter');
        if (key === 'id') sortKey = '_id';

        sorting[sortKey] = normalizeSorting(params.sort) || options.direction;
        if (params.after || params.before) {
            query[key] = {};
            if(params.after) {
                query[key] = sorting[sortKey] > 0 ? { $gt: params.after } : { $lt: params.after };
            } else if(params.before) {
                query[key] = sorting[sortKey] > 0 ? { $lt: params.before } : { $gt: params.before };
            }
        }

        q.where(query);
        q.sort(sorting);
        q.limit(options.limit);
        q.options.paginateKey = key;

        if ('function' === typeof cb) return q.exec(cb);
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
