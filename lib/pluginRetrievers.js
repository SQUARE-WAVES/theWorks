var _ = require('lodash');
var reqMod = require("./reqMod.js");

//this is for a function(options,cb) style plugin
var plugin = function(reqOpts){
  var mod = reqMod(reqOpts.path);
  var options = reqOpts.options;

  if(!_.isFunction(mod)){
    throw new Error("path: " + reqOpts.path + " does not return a plugin function");
  }

  //this one is recursive, it needs the builder
  if(mod.length === 3){
    return function(builder,next){
      mod(options,builder,next)
    }
  }
  else{ //other wise ignore it
    return function(builder,next){
      mod(options,next)  
    }
  }
}

//this just creates a simple value to hold somewhere, kinda nice for leaving "notes to self", or passwords/apikeys
var value = function(reqValue){
  return function(builder,cb){
    cb(null,reqValue);
  }
}

var req = function(reqString){
  var mod = reqMod(reqString);

  return function(builder,next){
    cb(null,mod);
  }
}

var pkg = function(config){
  return function(builder,cb){
    builder(config,cb)
  }
}



module.exports.plugin = plugin;
module.exports.value = value;
module.exports.req = req;
module.exports.package = pkg;
