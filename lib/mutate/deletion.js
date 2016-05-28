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