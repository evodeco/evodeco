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
            	// img.data[idx+3]  // a
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
		// pixels.push( parseInt(binary.substr(i+24,8), 2) ) // a
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
	encode = encode || encode24Bit;

	var binary = encode(img);

    return binary2Dna(binary);
}

module.exports.dna2Img = function (dna, decode) {
	decode = decode || decode24Bit;

	var binary = dna2Binary(dna)

    return decode24Bit(binary);
}

module.exports.mutate = function(img, mutation) {
	var uv = require('./mutate/uv'),
		dna;

	mutation = mutation || 'uv';

	if(mutation == 'uv')
		dna = uv(this.img2Dna(img));

	return this.dna2Img(dna);
}

