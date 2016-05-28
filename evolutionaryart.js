var fs = require('fs'),
    PNG = require('pngjs').PNG,
    evoart = require('./lib/convert');

fs.createReadStream('images/input/monkey.png')
    .pipe(new PNG({
        filterType: 4
    }))
    .on('parsed', function() {

        // large in frame deletion
        this.data = evoart.mutate(this, 'deletion', '24bit', {deletionPercent: 0.01});

        // small potentially frameshift deletion
        // this.data = evoart.mutate(this, 'frameshift', '24bit', {deletionBases: 4});

        // convert to dna and back again, should get original image
        // this.data = evoart.dna2Img( evoart.img2Dna(this, '8bit'), '8bit' );

        this.pack().pipe(fs.createWriteStream('out.png'));
    });