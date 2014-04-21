var assert = require('assert');
var retrievers = require('../index.js').defaultPluginRetrievers;

suite('Retriever Tests',function(){

  test('module retriever', function (done)  {
  	var rstring = './test/fakes/hello.js';

  	var pluginMethod = retrievers.module(rstring);

  	assert(typeof(pluginMethod) === 'function', 'plugins must be functions');
  	
  	pluginMethod({'name':'whocares'},function(err,plugin){
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