var createFactory = require('./lib/factory');

module.exports.createBuilder = createFactory;

var configmasticator = require('./lib/configmasticator');

module.exports.config = {
	'overlay' : configmasticator.overlay,
	'trimout' : configmasticator.trimout
};