var createBuilder = require('./lib/builder.js');
var retrievers = require("./lib/pluginRetrievers.js")
var reqMod = require("./lib/reqMod.js");
var logError = require("./lib/logErrorStack.js");

//-------------------------------------------------------------------------------------------------
// factory export
//-------------------------------------------------------------------------------------------------
module.exports.createBuilder = createBuilder;

//-------------------------------------------------------------------------------------------------
//  default retrievers
//  these are exported as a new object
// 	because of how require works.
//  I don't want users being able to change the meaning of "plugin" or "value"
//  for all builders ever, just for the one they are building right now
//-------------------------------------------------------------------------------------------------
module.exports.retrierves = {
  "plugin": retrievers.plugin,
  "value": retrievers.value,
  "req": retrievers.req,
  "package": retrievers.package
};

module.exports.utilities = {
  "reqMod": reqMod,
  "logError":
}