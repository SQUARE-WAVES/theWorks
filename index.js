var createFactory = require('./lib/factory');
var configmasticator = require('./lib/configmasticator');
var reqMod = require('./lib/pluginRetrievers.js').module;

//-------------------------------------------------------------------------------------------------
// factory exports
//-------------------------------------------------------------------------------------------------
module.exports.createBuilder = createFactory;

//-------------------------------------------------------------------------------------------------
// config exports
//-------------------------------------------------------------------------------------------------
module.exports.config = {
	'overlay' : configmasticator.overlay,
	'trimout' : configmasticator.trimout
};

//-------------------------------------------------------------------------------------------------
// utility exports (helpers for making retrievers)
//-------------------------------------------------------------------------------------------------
module.exports.utilities = {
	'requireModule' : reqMod
};