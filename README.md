### mongoose-paginator

    Build to avoid usage of cursor.skip in mongodb
    
    The cursor.skip() method is often expensive because it requires the server to walk from the
    beginning of the collection or index to get the offset or skip position before beginning to
    return result. As offset (e.g. pageNumber above) increases, cursor.skip() will become slower
    and more CPU intensive. With larger collections, cursor.skip() may become IO bound.

    Consider using range-based pagination for these kinds of tasks.
    That is, query for a range of objects, using logic within the application to determine the
    pagination rather than the database itself. This approach features better index
    utilization, if you do not need to easily jump to a specific page.

    
[![NPM](https://nodei.co/npm/mongoose-paginator.png?downloads=true&stars=true)](https://nodei.co/npm/mongoose-paginator/)

#### Features
    * Sorting (asc, desc)
    * chained querying - returns query if no callback is given
    * configurable

#### Installation

```cli
npm install mongoose-paginator
```

#### Usage

```js
var mongoose = require('mongoose');
var paginator = require('mongoose-paginator');

var ExampleSchema = new mongoose.Schema({
    name: String
}, { versionKey: false });

ExampleSchema.plugin(paginator, {
    limit: 50,
    defaultKey: '_id',
    direction: 1
});

var example = mongoose.model('Example', ExampleSchema);

// example on query object
params = {
    after: "52fb4cd4205626aceddc7127"
};

// or
params = {
    before: "52fb4cd4205626aceddc7127"
};

example.paginate(params, '_id')
    .limit(20) // overrides default limit
    .exec(function(err, objs) {
        return res.send(200, objs);
    });

// or get more information
example.paginate(params, '_id')
    .limit(20) // overrides default limit
    .execPagination(function(err, obj) {
        /** obj = {
            "perPage": 20, <= same as limit
            "thisPage": 2,
            "after": "52fb4cd4205626aceddc7127",
            "before": "52fb4cca546de0dd61469e20",
            "results": [{}, {}]
        } */
        return res.send(200, obj);

    });

```
