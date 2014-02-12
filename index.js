/**
 * Created by jonas on 2/12/14.
 */

module.exports = function paginatePlugin(schema, options) {

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

        if (rQuery.after && rQuery.before) throw new Error('Pagination can\'t have both after and before parameter');
        if (key === 'id') sortKey = '_id';

        if (rQuery.after || rQuery.before) {
            sorting[sortKey] = normalizeSorting(rQuery.sort) || 1;
            query[key] = {};
            if(rQuery.after) {
                query[key] = sorting[sortKey] > 0 ? { $gt: rQuery.after } : { $lt: rQuery.after };
            } else if(rQuery.before) {
                query[key] = sorting[sortKey] > 0 ? { $lt: rQuery.before } : { $gt: rQuery.before };
            }
        }

        q.where(query);
        q.sort(sorting);

        if ('function' === typeof cb) return q.exec(cb);
        return q;
    }

    schema.statics['paginate'] = paginate;
};