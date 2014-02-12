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

ExampleSchema.plugin(paginator, /** optional */{ limit: 50, defaultKey: '_id', direction: 1 });

var example = mongoose.model('Example', ExampleSchema);

example.paginate(req, '_id')
    .limit(20) // overrides default limit
    .exec(function(err, objs) {
        return res.send(200, objs);
    });

```
