var createFactory = require('./lib/factory');
var reqMod = require('./lib/pluginRetrievers.js').module;

//-------------------------------------------------------------------------------------------------
// factory exports
//-------------------------------------------------------------------------------------------------
module.exports.createBuilder = createFactory;

//-------------------------------------------------------------------------------------------------
// utility exports (helpers for making retrievers)
//-------------------------------------------------------------------------------------------------
module.exports.utilities = {
	'requireModule' : reqMod
};