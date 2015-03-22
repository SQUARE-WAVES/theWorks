var path = require('path');
var _ = require('lodash');
//assert is used to give nicer error messages
var assert = require('assert');

//-------------------------------------------------------------------------------------------------
// a plugin retriever takes a single argument (usually a string but not necessarily) and returns a plugin
// this allows us to flexibly inject dependencies and use other plugin interfaces.
// the default plugin retriever uses require to fetch modules.
//-------------------------------------------------------------------------------------------------
var reqMod = function(reqString){

  assert(typeof(reqString) === 'string', 'module name is not a string');

  var pathAndProperty = reqString.split('#');
  var reqPath = pathAndProperty[0];
  var propName = pathAndProperty[1];
  var mod = null;

  //try to find it with regular old require
  try{
    mod = require(reqPath);
  }
  catch(requireErr){
    var error = true;
  }

  //if regular require couldn't find it, try a relative path
  if(error){
    mod = require(path.join(process.cwd(), reqPath));
  }

  //if a property name was given, use it
  if(propName) {
    return mod[propName];
  }
  else{
    return mod;
  }
}

//this is for a function(options,cb) style plugin
var plugin = function(reqOpts){
  var mod = reqMod(reqOpts.path);
  var options = reqOpts.options;

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
  return function(opts,cb){
    cb(null,reqValue);
  }
}

module.exports.plugin = plugin;
module.exports.value = value;
