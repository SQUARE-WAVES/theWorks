//this is a dumb useless retriever

var to = function(number){
	var ret = [];
	for(var i=0;i<number;++i){
		ret.push(i);
	}

	return ret;
}

module.exports = function(reqOptions) {
	if(typeof(reqOptions) !== 'number'){
		throw new Error('it\'s not a number');
	}
	else{
		return function(options,cb){
			cb(null,to(reqOptions));
		}
	}
}