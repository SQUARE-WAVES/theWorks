var _ = require('lodash');
var async = require('async');

var App = function () {
  this.plugins = {};
};

App.prototype.use = function (name, plugin, options) {
  this.plugins[name] = plugin(options);
};

App.prototype.init = function (callback) {
  var initFns = {};
  
  _.each(this.plugins, function (plugin, name) {
    if (plugin.init) {
      initFns[name] = plugin.init.bind(plugin);
    }
  });

  async.parallel(initFns, callback);
};

module.exports = App;
