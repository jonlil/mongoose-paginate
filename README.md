### mongoose-paginator

    Build to avoid usage of cursor.skip in mongodb

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
