var _ = require('lodash');

var arrayMerge = function(a, b) {
  return _.isArray(a) ? b : undefined;
};

var stripNulls = function(obj){
	var nullKeys = [];
	_.each(obj,function(v,k){
		if(v === null){
			nullKeys.push(k);
		}
	});

	nullKeys.forEach(function(key){
		delete obj[key];
	});

	return obj;
}

//note that merge mutates, but we are allways using a new object in
//a fold, so we don't mutate any passed in configs
var merge = function(dest, source) {
	_.merge(dest,source,arrayMerge);
	return stripNulls(dest);
}

var trimMerge = function(pkg,finals){
	var trimmed = _.pick(pkg, _.keys(finals));
	return merge(trimmed,finals);
}

var overlay = function(configs){
	return configs.reduce(merge,{});
}

module.exports.overlay = overlay;

module.exports.trimout = function(configs){
	var last = _.last(configs);
	var pkg = overlay(_.initial(configs));
	return trimMerge(pkg,last);
}