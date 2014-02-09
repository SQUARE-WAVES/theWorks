var path = require('path');
var _ = require('lodash');
var async = require('async');

//assert is used to give nicer error messages
var assert = require('assert');


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

var build = function (config,cb) {
  var plugs = {};
  var errors = [];
  
  _.each(config, function (config, name) {
  
    try{
      var plugin = reqMod(config.module);  
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
    }).join('\n');
    var finalErr = new Error(errMessage);

    cb(finalErr,null);
  }
  else{
    async.parallel(plugs,cb);  
  }
};

module.exports = build;