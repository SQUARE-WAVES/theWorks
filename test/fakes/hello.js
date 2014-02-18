var Test = function (name,forceError) {
    this.name = name;
    this.forceError = forceError;
};

Test.prototype.hello = function () {
    return 'Hello ' + this.name + '!';
};

Test.prototype.init = function(cb){
    if (this.forceError){
        cb(new Error('the error happened'),null);
    }
    else {
        cb(null,this);
    }
}

module.exports = function (options,cb) {
    var t = new Test(options.name, options.forceError);
    t.init(cb);
};  