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