### mongoose-paginator

    Build to avoid usage of cursor.skip in mongodb

    #### Features
        * sorting
        * chained querying

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

ExampleSchema.plugin(paginator, { limit: 50 });

var example = mongoose.model('Example', ExampleSchema);

example.paginate(req, '_id')
    .limit(20) // overrides default limit
    .exec(function(err, objs) {
        return res.send(200, objs);
    });

```
