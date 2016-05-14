module.exports = function(dna) {
	var mutatedDna;

	mutatedDna = dna.replace(/cc/g, 'tt');

	return mutatedDna;
}