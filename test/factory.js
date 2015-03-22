var assert = require('assert');
var _= require("lodash");

var theWorks =require('../index.js');
var customRetriever = require('./fakes/retriever.js');

var defaultFactory = theWorks.createBuilder();

suite('Default Factory Tests',function(){

  test('Basic usage', function (done)  {
    
    var config = {
      'hello':{
        'plugin':{
          'path':'./test/fakes/hello.js',
          'options':{
            'name':'Borbat the Usurper'
          }
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

  test('array usage',function(done){
    var config = [
      {
        'plugin':{
          'path':'./test/fakes/hello.js',
          'options':{
            'name':'Borbat the Usurper'
          }
        }
      },
      {
        'plugin':{
          'path':'./test/fakes/hello.js',
          'options':{
            'name':'salgorth of the northlands'
          }
        }
      },
      {
        'plugin':{
          'path':'./test/fakes/hello.js',
          'options':{
            'name':'bartandalus'
          }
        }
      }
    ];

    defaultFactory(config,function(err,pack){
      assert.ifError(err,'there should not be an error');
      assert.equal(_.isArray(pack),true,'the package should be an array');
      assert.equal(pack[0].hello(), 'Hello Borbat the Usurper!', 'borbat must be named!');
      assert.equal(pack[1].hello(), 'Hello salgorth of the northlands!', 'salgorth must be named!');
      assert.equal(pack[2].hello(), 'Hello bartandalus!', 'bartandalus must be named!');
      done();
    });
  })

  test('usage with nonexistant modules',function(done){
    var config = {
      'hello':{
        'plugin':{
          'path':'./test/dracula_city.js',
          'options':{
            'name':'nobody will know',
            'forceError':false
          }
        }
      },
      'hello2':{
        'plugin':{
          'path':'./test/not_real.jerks',
          'options':{
            'name':'nobody will know',
            'forceError':true
          }
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
        'plugin':{
          'path':true,
          'options':{
            'name':'nobody will know',
            'forceError':false
          }
        }
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
        'plugin':{
          'path':'./test/fakes/hello.js',
          'options':{
            'name':'nobody will know',
            'forceError':false
          }
        }
      },
      'hello2':{
        'plugin':{
          'path':'./test/fakes/hello.js',
          'options':{
            'name':'nobody will know',
            'forceError':true
          }
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
        'plugin':{
          'path':'./test/fakes/hello.js',
          'options':{
            'name':'Borbat the Usurper'
          }
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
        'range':2
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

  test('build recursive plugin',function(done){
    var rootVal = 15;
    var multiVal = 'horse';
    var multiRangeIn = 2;
    var multiRangeOut = [0,1];

    //this is some insane config, 
    var config = {
      'zap':{
        'plugin':{
          'path':'./test/fakes/multiPlug.js',
          'options':{
            'root':rootVal,
            'multi':{
              'val':{
                'value':multiVal
              },
              'rng':{
                'range':multiRangeIn
              },
              're_cur':{
                'plugin':{
                  'path':'./test/fakes/multiPlug.js',
                  'options':{
                    'root':rootVal + 1,
                    'multi':{
                      'rng':{
                        'range':multiRangeIn
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    customFactory(config,function(err,pkg){
      assert.ifError(err,'there should not be an error');

      assert.equal(pkg.zap.root,rootVal,'the root should have the correct value');
      assert.equal(pkg.zap.multi.val,multiVal,'the sub package should be built with the correct values');
      assert.deepEqual(pkg.zap.multi.rng,multiRangeOut,'the sub package should be able to use custom builders');

      assert.equal(pkg.zap.multi.re_cur.root,rootVal + 1,'gotta be able to just keep going');
      assert.deepEqual(pkg.zap.multi.re_cur.multi.rng,multiRangeOut,'the same builder should be able to go arbitrarily deep');
      done();
    });

  });
});
