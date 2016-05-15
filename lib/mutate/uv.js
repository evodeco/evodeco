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