var assert = require('assert');
var theWorks =require('../index.js');
var defaultFactory = theWorks.createBuilder();
var customRetriever = require('./fakes/retriever.js');

suite('Default Factory Tests',function(){

  test('Basic usage', function (done)  {
    
    var config = {
      'hello':{
        'plugin':'./test/fakes/hello.js',
        'options':{
          'name':'Borbat the Usurper'
        }
      }
    };

    defaultFactory(config,function(err,app){
      assert.ifError(err,'there should not be an error');
      assert.ok(app.hello, 'heloo?');
      assert.equal(app.hello.hello(), 'Hello Borbat the Usurper!', 'he must be named!');
      done();
    });
  });

  test('usage with nonexistant modules',function(done){
    var config = {
      'hello':{
        'plugin':'./test/dracula_city.js',
        'options':{
          'name':'nobody will know',
          'forceError':false
        },
      },
      'hello2':{
        'plugin':'./test/not_real.jerks',
        'options':{
          'name':'nobody will know',
          'forceError':true
        }
      }
    };

    defaultFactory(config,function(err,app){
      assert.ok(err,'there should be an error');
      assert.equal(app,null,'no app should have been made');
      assert.notEqual(err.message.indexOf('hello'),-1,'the first module\'s name should appear in the error message');
      assert.notEqual(err.message.indexOf('hello2'),-1,'the second module\'s name should appear in the error message');

      done();
    });
  });

  test('usage with bad module entries',function(done){
    var config = {
      'hello':{
        'plugin':true,
        'options':{
          'name':'nobody will know',
          'forceError':false
        },
      }
    };

    defaultFactory(config,function(err,app){
      assert.ok(err,'there should not be error');
      assert.equal(app,null,'no app should have been made');
      assert.notEqual(err.message.indexOf('hello'),-1,'the module\'s name should appear in the error message');

      done();
    });
  });

  test('Initialize with error', function (done) {
    var badConfig = {
      'hello':{
        'plugin':'./test/fakes/hello.js',
        'options':{
          'name':'nobody will know',
          'forceError':false
        },
      },
      'hello2':{
        'plugin':'./test/fakes/hello.js',
        'options':{
          'name':'nobody will know',
          'forceError':true
        }
      }
    };

    defaultFactory(badConfig,function(err,app) {
      assert.ok(err,'there should be an error');
      assert.equal(app.hello2,null,'by searching for a null plugin we should be able to find the one which errored');

      done();
    });
  });

  test('Value retriever test',function(done){
    var config = {
      'notes':{
        'value':'testValue'
      }
    };

    defaultFactory(config,function(err,app){
      assert.ifError(err,'there should not be an error');
      assert.equal(app.notes,config.notes.value,'the value should have been plugged into the app');
      done();
    });
  });

  test('Mixed retriever test',function(done){
    var config = {
      'hello':{
        'plugin':'./test/fakes/hello.js',
        'options':{
          'name':'Borbat the Usurper'
        }
      },
      'notes':{
        'value':'testValue'
      }
    };

    defaultFactory(config,function(err,app){
      assert.ifError(err,'there should not be an error');
      assert.ok(app.hello, 'heloo?');
      assert.equal(app.notes,config.notes.value,'the value should have been plugged into the app');
      done();
    });
  });
});

suite('custom factory test',function(){
  var customFactory = theWorks.createBuilder({
    'range':customRetriever
  });

  test('custom retriever test',function(done){
    var config = {
      'notes':{
        'plugin':{
          'type':'range',
          'path': 2
        }
      }
    };

    customFactory(config,function(err,app){
      assert.ifError(err,'there should not be an error');
      assert.equal(app.notes[0],0,'the correct first part of the useless junk thing that comes out of this retriever should be there');
      assert.equal(app.notes[1],1,'the correct second part of theuseless junk thing that comes out of this retriever should be there');
      done();
    });
  });

  test('custom retriever error',function(done){
    var config = {
      'notes':{
        'range':'barg'
      }
    };

    customFactory(config,function(err,app){
      assert.ok(err,'there should be an error');
      assert.equal(app,null,'the app should not be made');
      done();
    });
  });

  test('build undefined package',function(done){
    defaultFactory(undefined,function(err,app){
      assert.ifError(err,'there should not be an error, an undefined package is legit');
      assert.deepEqual(app,{},'an empty app should be built');
      done();
    });
  });

  test('build null package',function(done){
    defaultFactory(null,function(err,app){
      assert.ifError(err,'there should not be an error, a null package is legit');
      assert.deepEqual(app,{},'an empty app should be built');
      done();
    });
  });


});