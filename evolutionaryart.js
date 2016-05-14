var fs = require('fs'),
    PNG = require('pngjs').PNG,
    evoart = require('./lib/convert');

fs.createReadStream('images/input/monkey.png')
    .pipe(new PNG({
        filterType: 4
    }))
    .on('parsed', function() {

        this.data = evoart.mutate(this, 'uv');

        this.pack().pipe(fs.createWriteStream('out.png'));
    });