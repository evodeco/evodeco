(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
// Grab an existing iobio namespace object, or create a blank object
// if it doesn't exist
var evodeco = global.evodeco || {};
global.evodeco = evodeco;

// export if being used as a node module - needed for test framework
if ( typeof module === 'object' ) { module.exports = evodeco;}


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


// function encode24Bit (img) {
// 	var binary = '';
// 	for (var y = 0; y < img.height; y++) {
//         for (var x = 0; x < img.width; x++) {
//             var idx = (img.width * y + x) << 2;

//             // Grab colors
//             var colors = [
//             	img.data[idx], 	 // r
//             	img.data[idx+1], // g
//             	img.data[idx+2], // b
//             	// img.data[idx+3]  // a - ignore alpha transpency
//             ];

//             // Convert to binary
//             colors.forEach(function(c) {
// 				binary += ("00000000" + c.toString(2)).slice(-8); // front zero padding to ensure 8 bits
// 			})
//         }
//     }
//     return binary;
// }

function encode24Bit (img) {
	var binary = '';
	for (var y = 0; y < img.data.length; y++) {
		var c = img.data[y];
		binary += ("00000000" + c.toString(2)).slice(-8); // front zero padding to ensure 8 bits
    }
    return binary;
}

function decode24Bit(binary) {
	var pixels = [];

	for (var i=0; i < binary.length; i = i + 8 ) {
		pixels.push( parseInt(binary.substr(i,8), 2) )    // r
		// pixels.push( parseInt(binary.substr(i+8,8), 2) )  // g
		// pixels.push( parseInt(binary.substr(i+16,8), 2) ) // b
		// pixels.push('255'); // alpha is always set to full
	}

	return pixels
}

// function decode24Bit(binary) {
// 	var pixels = [];

// 	for (var i=0; i < binary.length; i = i + 8 * 3) {
// 		pixels.push( parseInt(binary.substr(i,8), 2) )    // r
// 		pixels.push( parseInt(binary.substr(i+8,8), 2) )  // g
// 		pixels.push( parseInt(binary.substr(i+16,8), 2) ) // b
// 		pixels.push('255'); // alpha is always set to full
// 	}

// 	return pixels
// }

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

evodeco.img2Dna = function(img, encode) {
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

evodeco.dna2Img = function (dna, decode) {
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

evodeco.mutate = function(img, mutation, encode, options) {
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


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mutate/deletion":2,"./mutate/frameshift":3,"./mutate/uv":4}],2:[function(require,module,exports){
var extend = require('extend');

module.exports = function(dna, encoding, opts) {
	var options = {
		// Defaults
		deletionPercent: 0.1
	};

	var bits = parseInt(encoding.split('bit')[0]);

	// Copy opts into options overwriting defaults
	extend(options, opts);

	var middle = Math.round(dna.length / 2);
	var deletionSize = Math.round(options.deletionPercent * dna.length);

	// Round deletion to a multiple of a whole frame
	deletionSize -= deletionSize % bits;

	return dna.slice(0,middle) + dna.slice(middle + deletionSize);
}
},{"extend":5}],3:[function(require,module,exports){
var extend = require('extend');

module.exports = function(dna, opts) {
	var options = {
		// Defaults
		deletionBases: 4
	};

	// Copy opts into options overwriting defaults
	extend(options, opts);

	var middle = Math.round(dna.length / 2);

	return dna.slice(0,middle) + dna.slice(middle + options.deletionBases);
}
},{"extend":5}],4:[function(require,module,exports){
var extend = require('extend');

module.exports = function(dna, opts) {
	var options = {
		// defaults
	};

	// Copy opts into options overwriting defaults
	extend(options, opts);

	var mutatedDna;

	mutatedDna = dna.replace(/cc/g, 'tt');

	return mutatedDna;
}
},{"extend":5}],5:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}]},{},[1]);
