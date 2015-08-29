var assert = require("assert");
var retrievers = require("../lib/pluginRetrievers.js");

suite("Retriever Tests",function(){

  test("plugin retriever", function (done)  {
  	var rstring = {
      "path":"./test/fakes/hello.js",
      "options":{"name":"whocares"}
    };

  	var pluginMethod = retrievers.plugin(rstring);

  	assert(typeof(pluginMethod) === "function", "plugins must be functions");
  	
    //no builder is passed!
  	pluginMethod(null,function(err,plugin){
  		assert.ifError(err,"there should not be an error");
  		done();
  	});
  });

  test("plugin retriever errors when path is not found",function(done){
    var rstring = {
      "path":"./test/fakes/hello.js#bad_thing",
      "options":{"name":"whocares"}
    };

    try{
      var pluginMethod = retrievers.plugin(rstring);  
    }
    catch(exc){
      assert.notEqual(exc.message.indexOf(rstring.path),-1,"the incorrect path should be included in the error message");
      done();
      return;
    }

    assert(false,"an exception should have been thrown");
  })

  test("value retriever",function(done){

  	var rval = "a value";
  	var pluginMethod = retrievers.value(rval);

  	assert(typeof(pluginMethod) === "function", "value plugins are plugins and plugins must be functions");

  	pluginMethod(null,function(err,thing){
  		assert.ifError(err,"there should not be an error");
  		assert.equal(thing,rval,"the same value should be returned");
  		done();
  	});
  });

  test("req retriever",function(done){
    var reqstring = "./test/fakes/reqval.js";
    var expected = require("./fakes/reqval.js");

    var method = retrievers.req(reqstring);

    method(null,function(err,thing){
      assert.ifError(err,"no errors should occur");
      assert.equal(expected,thing,"the correct module should be brought in");
      done()
    })
  })

  test("req retriever with mod hash",function(done){
    var reqStringWithMod = "./test/fakes/reqval.js#dogs";
    var expected = require("./fakes/reqval.js").dogs;

    var method = retrievers.req(reqStringWithMod);

    method(null,function(err,thing){
      assert.ifError(err,"no errors should occur");
      assert.equal(expected,thing,"the correct module should be brought in");
      done()
    })
  })

  test("req retriever errors with bad config",function(done){
    try{
      var method = retrievers.req(15);
    }
    catch(exc){
      done();
      return;
    }

    assert(false,"an exception should have been thrown")
  });

  test("package retriever",function(done){
    //not really much to test here
    var config = {};
    var flag = false;
    
    var fake_builder = function(cfg,cb){
      flag = true;
      assert.equal(cfg,config,"the config should be passed to the builder");
      cb(null,"WHO FREAKIN CARES!");
    }

    var method = retrievers.package(config);

    method(fake_builder,function(err,val){
      assert(flag,"the fake builder should have beencalled");
      done();
    })
  })
});