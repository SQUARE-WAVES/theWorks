module.exports = function(options,builder,callback){
	var pack = {};

	pack.root = options.root;
	builder(options.multi,function(err,pkg){
		if(err){
			callback(err);
		}
		else{
			pack.multi = pkg;
			callback(null,pack);	
		}
	});
}