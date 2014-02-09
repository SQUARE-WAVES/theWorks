var assert = require('assert');
var factory = require('../index.js');

var badConfig = {
  'hello':{
    'module':'./test/hello.js',
    'options':{
      'name':'nobody will know',
      'forceError':false
    },
  },
  'hello2':{
    'module':'./test/hello.js',
    'options':{
      'name':'nobody will know',
      'forceError':true
    }
  }
};

suite('Factory Tests',function(){
  
  test('Basic usage', function (done)  {
    
    var config = {
      'hello':{
        'module':'./test/hello.js',
        'options':{
          'name':'Borbat the Usurper'
        }
      }
    };

    factory.build(config,function(err,app){
      assert.ifError(err,'there should not be an error');
      assert.ok(app.hello, 'heloo?');
      assert.equal(app.hello.hello(), 'Hello Borbat the Usurper!', 'he must be named!');
      done();
    });
  });

  test('usage with nonexistant modules',function(done){
    var config = {
      'hello':{
        'module':'./test/dracula_city.js',
        'options':{
          'name':'nobody will know',
          'forceError':false
        },
      },
      'hello2':{
        'module':'./test/not_real.jerks',
        'options':{
          'name':'nobody will know',
          'forceError':true
        }
      }
    };

    factory.build(config,function(err,app){
      assert.ok(err,'there should not be error');
      assert.equal(app,null,'no app should have been made');
      console.error(err);

      done();
    });
  });

  test('usage with bad module entries',function(done){
    var config = {
      'hello':{
        'module':true,
        'options':{
          'name':'nobody will know',
          'forceError':false
        },
      }
    };

    factory.build(config,function(err,app){
      assert.ok(err,'there should not be error');
      assert.equal(app,null,'no app should have been made');
      console.error(err);

      done();
    });
  })

  test('Initialize with error', function (done) {

    factory.build(badConfig,function(err,app) {
      assert.ok(err,'there should be an error');

      assert.equal(app.hello2,null,'by searching for a null plugin we should be able to find the one which errored');

      done();
    });
  });
});

