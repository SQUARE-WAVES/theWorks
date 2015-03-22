var assert = require('assert');
var retrievers = require('../lib/pluginRetrievers.js');

suite('Retriever Tests',function(){

  test('plugin retriever', function (done)  {
  	var rstring = {
      "path":'./test/fakes/hello.js',
      "options":{'name':'whocares'}
    };

  	var pluginMethod = retrievers.plugin(rstring);

  	assert(typeof(pluginMethod) === 'function', 'plugins must be functions');
  	
    //no builder is passed!
  	pluginMethod(null,function(err,plugin){
  		assert.ifError(err,'there should not be an error');
  		done();
  	});
  });

  test('value retriever',function(done){

  	var rval = 'a value';
  	var pluginMethod = retrievers.value(rval);

  	assert(typeof(pluginMethod) === 'function', 'value plugins are plugins and plugins must be functions');

  	pluginMethod(null,function(err,thing){
  		assert.ifError(err,'there should not be an error');
  		assert.equal(thing,rval,'the same value should be returned');
  		done();
  	});
  });
});