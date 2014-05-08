var _ = require('lodash');
var async = require('async');
var defaultPluginRetrievers = require('./pluginRetrievers.js');

var getPlugin = function(conf,pluginRetrievers){

  if(!_.isUndefined(conf.value)){
    //it's a value;
    return defaultPluginRetrievers.value(conf.value);
  }

  if(_.isString(conf.plugin)){
    return defaultPluginRetrievers.module(conf.plugin);
  }
  else if(_.isObject(conf.plugin)){
    var retriever = pluginRetrievers[conf.plugin.type];
    if(!_.isFunction(retriever)){
      throw new Error('could not find valid retriever for plugin type: ' + conf.plugin.type)
    }
    else{
      return retriever(conf.plugin.path);
    }
  }
  else{
    throw new Error('either a value or plugin must be supplied');
  }
}

var build = function (config,pluginRetrievers,cb) {
  var plugs = {};
  var errors = [];
  
  _.each(config, function (config, name) {

    try{
      var plugin =  getPlugin(config,pluginRetrievers);
    }
    catch(error){
      errors.push({'name':name,'err':error});
    }
    
    plugs[name] = function(next){
      plugin(config.options,next);
    }
  });

  if(errors.length){

    var errMessage = errors.map(function(pair){
      return pair.name + ' failed with error : ' + pair.err.message;
    })
    .join('\n');

    var finalErr = new Error(errMessage);

    cb(finalErr,null);
  }
  else{
    async.parallel(plugs,cb);  
  }
};

module.exports = function(pluginRetrievers){

  pluginRetrievers = pluginRetrievers || {};

  return function(config,cb){
    build(config,pluginRetrievers,cb);
  }
};