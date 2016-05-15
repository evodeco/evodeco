var encoding = {
	a : '00',
	c : '01',
	g : '10',
	t : '11'
}

var decoding = {
	'00' : 'a',
	'01' : 'c',
	'10' : 'g',
	'11' : 't'
}

function encode8Bit (img) {
	//RRRGGGBB
	// 3 bits red, 3 bits green, 2 bits blue
	var binary = '';
	for (var y = 0; y < img.height; y++) {
        for (var x = 0; x < img.width; x++) {
            var idx = (img.width * y + x) << 2;

            // Downsample 24bit (256 color) to 8 bit color
            var r = Math.round(img.data[idx] / (255/7)),
            	g = Math.round(img.data[idx+1] / (255/7)),
            	b = Math.round(img.data[idx+2] / (255/3))

            // Convert to binary
			binary += ("000" + r.toString(2)).slice(-3); // front zero padding to ensure 3 bits
			binary += ("000" + g.toString(2)).slice(-3); // front zero padding to ensure 3 bits
			binary += ("00" +  b.toString(2)).slice(-2); // front zero padding to ensure 2 bits
        }
    }
    return binary;
}

function decode8Bit(binary) {
	var pixels = [];

	for (var i=0; i < binary.length; i = i + 8) {
		// Convert binary to 8bit rgb (RRRGGGBB)
		var r = parseInt(binary.substr(i,3), 2),
			g = parseInt(binary.substr(i+3,3), 2),
			b = parseInt(binary.substr(i+3,2), 2);

		// Project 8bit color representation into 24bit color space and add to pixels
		pixels.push( Math.round(r * (255/7)) );
		pixels.push( Math.round(g * (255/7)) );
		pixels.push( Math.round(b * (255/3)) );
		pixels.push('255'); // alpha is always set to full
	}

	return pixels
}


function encode24Bit (img) {
	var binary = '';
	for (var y = 0; y < img.height; y++) {
        for (var x = 0; x < img.width; x++) {
            var idx = (img.width * y + x) << 2;

            // Grab colors
            var colors = [
            	img.data[idx], 	 // r
            	img.data[idx+1], // g
            	img.data[idx+2], // b
            	// img.data[idx+3]  // a - ignore alpha transpency
            ];

            // Convert to binary
            colors.forEach(function(c) {
				binary += ("00000000" + c.toString(2)).slice(-8); // front zero padding to ensure 8 bits
			})
        }
    }
    return binary;
}

function decode24Bit(binary) {
	var pixels = [];

	for (var i=0; i < binary.length; i = i + 8 * 3) {
		pixels.push( parseInt(binary.substr(i,8), 2) )    // r
		pixels.push( parseInt(binary.substr(i+8,8), 2) )  // g
		pixels.push( parseInt(binary.substr(i+16,8), 2) ) // b
		pixels.push('255'); // alpha is always set to full
	}

	return pixels
}

function binary2Dna (binary) {
	var dna = '';
	for (var i=0; i < binary.length; i = i +2) {
		dna += decoding[ binary.substr(i,2) ];
	}
	return dna;
}

function dna2Binary (dna) {
	var binary = '';
	for (var i=0; i < dna.length; i = i +1) {
		binary += encoding[ dna[i] ];
	}
	return binary;
}

module.exports.img2Dna = function(img, encode) {
	encode = encode || '24bit';

	// Get encoder
	var encoder;
	if (encode == '24bit')
		encoder = encode24Bit;
	else if (encode == '8bit')
		encoder = encode8Bit;

	// Encode image
	var binary = encoder(img);

	// Conver binary to dna
    return binary2Dna(binary);
}

module.exports.dna2Img = function (dna, decode) {
	decode = decode || '24bit';

	// Get decoder
	var decoder;
	if (decode == '24bit')
		decoder = decode24Bit;
	else if (decode == '8bit')
		decoder = decode8Bit;

	// Convert dna to binary
	var binary = dna2Binary(dna)

	// Decode binary to image
    return decoder(binary);
}

module.exports.mutate = function(img, mutation, encode, options) {
	var uv = require('./mutate/uv'),
		deletion = require('./mutate/deletion'),
		frameshift = require('./mutate/frameshift'),
		dna;

	mutation = mutation || 'uv';

	if(mutation == 'uv')
		dna = uv(this.img2Dna(img, encode), options);
	else if (mutation == 'deletion')
		dna = deletion(this.img2Dna(img, encode), encode, options);
	else if (mutation == 'frameshift')
		dna = frameshift(this.img2Dna(img, encode), options);

	return this.dna2Img(dna, encode);
}

