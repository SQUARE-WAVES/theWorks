var configmasticator = require('../index.js');
var assert = require('assert');
var _ = require('lodash');

var cf1 = {
	'a':'b',
	'c':'d'
};

var cf2 = {
	'a':'new',
	'd':'not in the original'
};

var cf3 = {
	'a':'evenNewer',
	'c':null
};

var finalCfg = {
	'a':'horse'
};

var finalCfg2 ={
	'a':undefined
};

suite('Config Masticator Tests',function(){

	test('overlayMerge', function (done)  {

		var cf1clone = _.clone(cf1);

		var configs = [cf1, cf2, cf3];
	  var merged = configmasticator.overlay(configs);

	  assert.equal(merged.a,cf3.a,'the final overlay should shine through for a');
	  assert.equal(merged.c,null,'the final overlay should have nulled out c');
	  assert.equal(merged.d,cf2.d,'the second overlay should have added the d thing');
	  assert.deepEqual(cf1clone,cf1,'the original configs should not be mutated')

	  done();
	});

	test('overlay merge with null/undefined',function(done){

		var configs = [null,finalCfg];
		var configs2 = [undefined,finalCfg];

		var merged = configmasticator.overlay(configs);
		var merged2 = configmasticator.overlay(configs2);

		assert.deepEqual(merged,finalCfg,'the merge should result in the same thing going on');
		assert.deepEqual(merged2,finalCfg,'the undefined merge should result in the same thing going on');
		done();
	});

	test('trimmed merge', function (done) {

		var configs = [cf1, cf2, cf3, finalCfg];
	  
	  var merged = configmasticator.trimout(configs);
	  assert.equal(merged.a,finalCfg.a,'the final config should have overridden everything');
	  assert.equal(merged.b,undefined,'the merged config should not have things not in the last config');

	  done();
	});

	test('trimmed merge with undefined fields in final config',function(done){

		var configs = [cf1, cf2, cf3, finalCfg2];
	  
	  var merged = configmasticator.trimout(configs);

	  assert.equal(merged.a,cf3.a,'the final config should have not overriden the 3rd config');
	  assert.equal(merged.b,undefined,'the merged config should not have things not in the last config');

	  done();
	});

	test('trimmed merge with null/undefined',function(done){

		var configs = [null,finalCfg];
		var configs2 = [undefined,finalCfg];

		var merged = configmasticator.trimout(configs);
		var merged2 = configmasticator.trimout(configs2);

		assert.deepEqual(merged,finalCfg,'the merge should result in the same thing going on');
		assert.deepEqual(merged2,finalCfg,'the undefined merge should result in the same thing going on');
		done();
	});

});