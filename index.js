var createFactory = require('./lib/factory');

module.exports.createBuilder = createFactory;
module.exports.defaultPluginRetrievers = require('./lib/pluginRetrievers');

var configmasticator = require('./lib/configmasticator');

module.exports.config = {
	'overlay' : configmasticator.overlay,
	'trimout' : configmasticator.trimout
};