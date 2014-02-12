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

        if (!query.options.paginateKey) throw new Error('Did you forgett to use pagination plugin?');
        if (!query.options.limit) query.options.limit = options.limit;

        query.exec(function(err, objects) {
            _return.results = objects;
            _return.perPage = query.options.limit;
            _return.thisPage = objects.length;
            _return.after = objects && objects.length > 0 ? objects[objects.length - 1][query.options.paginateKey] : null;
            _return.before = objects && objects.length > 0 ? objects[0][query.options.paginateKey] : null;
            return callback(err, _return);
        });
    };

    var normalizeSorting = function(sort) {
        if(!sort) return false;
        if(sort.toString() === 'asc') return 1;
        if(sort.toString() === 'desc') return -1;
        return sort;
    };

    /**
     *
     * @param req - uses query.after, query.before, query.sort(asc, desc, 1, -1)
     * @param key
     * @param cb - optional, returns query if left empty
     * @returns {*}
     */
    function paginate(req, key, cb) {
        var q = this.find(),
            rQuery = req.query,
            sorting = {},
            query = {},
            sortKey = key;

        if (!key) key = options.defaultKey;
        if (rQuery.after && rQuery.before) throw new Error('Pagination can\'t have both after and before parameter');
        if (key === 'id') sortKey = '_id';

        if (rQuery.after || rQuery.before) {
            query[key] = {};
            if(rQuery.after) {
                query[key] = sorting[sortKey] > 0 ? { $gt: rQuery.after } : { $lt: rQuery.after };
            } else if(rQuery.before) {
                query[key] = sorting[sortKey] > 0 ? { $lt: rQuery.before } : { $gt: rQuery.before };
            }
        }
        sorting[sortKey] = normalizeSorting(rQuery.sort) || options.direction;

        q.where(query);
        q.sort(sorting);
        q.limit(options.limit);
        q.options.paginateKey = key;

        if ('function' === typeof cb) return q.exec(cb);
        return q;
    }

    schema.statics['paginate'] = paginate;
};

module.exports = paginatePlugin;