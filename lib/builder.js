var util = require("./util.js");
var is = require("./is_x.js");
var parallel = require('./parallel.js');
var defaultPluginRetrievers = require('./pluginRetrievers.js');

var getPlugin = function (conf, pluginRetrievers) {
  //conf should look like {"key":.....}

  var keys = Object.keys(conf);
  var key = keys[0];

  var retriever = pluginRetrievers[key];
  var plugdata = conf[key];

  if (is.function(retriever)) {
    return retriever(plugdata);
  }
  else {
    throw new Error("no valid retriever found");
  }
}

var tag_plugin_error = function (err, plugName) {
  var pluginStack;

  if (err.components) {
    pluginStack = err.components;
  }
  else {
    pluginStack = [];
    err.components = pluginStack;
  }

  pluginStack.unshift(plugName);
  return err;
}

var build = function (config, pluginRetrievers, cb) {
  //for recursive building  
  var thisBuilder = function (config, cb) {
    build(config, pluginRetrievers, cb);
  }

  //a thing for errors while transforming
  var errors = [];

  var plugs = util.transform(config, function (result, conf, key) {

    try {
      var plugin = getPlugin(conf, pluginRetrievers);
    }
    catch (error) {
      errors.push({
        'key': key,
        'err': error
      });
    }

    result[key] = function (next) {
      plugin(thisBuilder, function (err, result) {

        if (err) {
          var tagged_err = tag_plugin_error(err, key);
          next(tagged_err, null);
        }
        else {
          next(null, result)
        }
      });
    }
  });

  if (errors.length) {

    var errMessage = errors.map(function (pair) {
      return pair.key + ' failed with error : ' + pair.err.message;
    }).
    join('\n');

    var keys = errors.map(function (pair) {
      return pair.key;
    })

    var finalErr = new Error(errMessage);
    var taggedErr = tag_plugin_error(finalErr, keys.join(", "));
    cb(taggedErr, null);
  }
  else {
    parallel(plugs, cb);
  }
};

module.exports = function (pluginRetrievers) {
  var retrievers = util.defaults(pluginRetrievers, defaultPluginRetrievers);

  return function (config, cb) {
    build(config, retrievers, cb);
  }
};