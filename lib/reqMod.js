//assert is used to give nicer error messages
var path = require("path")
var assert = require('assert');

//-------------------------------------------------------------------------------------------------
// this is a util function that fetches a module, it takes a couple of tries to resolve whether the 
// module is a thing that can be required directly or if it needs to do some process.cwd()
// it also allows for # syntax to pick an export.
//-------------------------------------------------------------------------------------------------

module.exports = function(reqString){

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