var _ = require('lodash');
var async = require('async');
var defaultPluginRetrievers = require('./pluginRetrievers.js');

var getPlugin = function(conf,pluginRetrievers){
  for(k in pluginRetrievers){
    if(conf[k]){
    return pluginRetrievers[k](conf[k]);
    }
  }

  throw new Error('no retriever could be found');
}

var build = function (config,pluginRetrievers,cb) {
  var plugs = {};
  var errors = [];
  
  _.each(config, function (config, name) {

    try{
      //find the retriever you need
      
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

  pluginRetrievers = pluginRetrievers || defaultPluginRetrievers;

  return function(config,cb){
    build(config,pluginRetrievers,cb);
  }
};