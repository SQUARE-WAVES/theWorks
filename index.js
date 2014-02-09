module.exports = {
	'build': require('./lib/factory'),
	'overlay' : require('./lib/configmasticator').overlay,
	'trimout' : require('./lib/configmasticator').trimout
};