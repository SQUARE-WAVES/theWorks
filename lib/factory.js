var _ = require('lodash');
var async = require('async');
var defaultPluginRetrievers = require('./pluginRetrievers.js');

var getPlugin = function(conf,pluginRetrievers){
  //conf should look like {"key":.....}

  for(key in pluginRetrievers){
    var plugdata = conf[key];

    if(!_.isUndefined(plugdata)){
      var retriever = pluginRetrievers[key];
      return retriever(plugdata);
    }
  }

  throw new Error("no valid retriever found");
}

var build = function (config,pluginRetrievers,cb) {
  //for recursive building  
  var thisBuilder = function(config,cb){
    build(config,pluginRetrievers,cb);
  }
  
  //a thing for errors while transforming
  var errors = [];

  var plugs = _.transform(config, function (result, config, key) {

    try{
      var plugin = getPlugin(config,pluginRetrievers);
    }
    catch(error){
      errors.push({'key':key,'err':error});
    }
    
    result[key] = function(next){
      plugin(thisBuilder,next);
    }
  });

  if(errors.length){

    var errMessage = errors.map(function(pair){
      return pair.key + ' failed with error : ' + pair.err.message;
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
  var retrievers = _.defaults({},pluginRetrievers,defaultPluginRetrievers);

  return function(config,cb){
    build(config,retrievers,cb);
  }
};