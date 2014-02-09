var util = require('util');
var events = require('events');
var async = require('async');
var broadway = require('broadway');
var App = require('./app.js');
var _ = require('lodash');
var pluginUtil = require('./pluginutil.js');
var	mixdownLogger = require('./logger');

/**
 * 
 *	Config - loads and manages configuration for environment and sites.
 * 	@param config - Object containing the server configuration.
**/
var Config = function(config) {
	this.config = config;
	this._externalConfig = null;
	this.services = null;

	if (!this.config.app) {
		throw new Error('There is no default app to initialize.');
	}

	this.config.app.id = 'default';
};

util.inherits(Config, events.EventEmitter);

Config.prototype.init = function(callback) {
	this.initLogger();
	
	// initialize services (sites or cli apps)
	var that = this;
	this.getExternalConfig(function(err, extConfig) {

		if (!extConfig && !err) {
			err = new Error('External config was not loaded.  This app likely won\'t function');
		}

		if (err) {
			_.isFunction(callback) ? callback(err) : null;
			return;
		}

		extConfig.getServices(function(err, services) {

			// Do not bubble exception on error here.  Just log the error and continue.
			if (err && logger) {
				logger.error(err);
			}

			that.services = services && services.length ? services : [that.config.app];
			that.initServices(callback);
		});

	});
};

Config.prototype.initLogger = function() {
	
	if (global.logger) {
		global.logger.clear();
	}

	var loggerConfig = this.config.logger || {
    "defaults": {
      "handleExceptions": true,
      "json": false,
      "timestamp": true,
      "colorize": true,
      "prettyPrint": true
    },
    "transports": [{ "transport": "Console" }]
  };

	// Init logger: Need to move this to external place where is can be injected with 
	// alpha, beta, and prod settings
	global.logger = mixdownLogger.create(this.config.logger);

	if (!logger) {
		console.error('There is no logger declared.');
	}

};

Config.prototype.getExternalConfig = function(callback) {

	if (this.services && this._externalConfig) {
		_.isFunction(callback) ? callback(null, this._externalConfig) : null;
		return;
	}

	// new bw to attach dist config module.
	var app = new broadway.App();
	var that = this;

	// resolve and attach dist config module.
	pluginUtil.use({
		plugin: _.defaults(this.config.services || {}, { module: "mixdown-config-filesystem" }),
		app: { plugins: app } // YUCK:  this is opaque
	});

	// initialize dist config module
	app.init(function(err) {
	
		if (!err) {
			that._externalConfig = app.externalConfig;
		}
		_.isFunction(callback) ? callback(err, that._externalConfig) : null;

	});
};

Config.prototype.initServices = function(callback) {
	var apps = {};
	var inits = [];
	var defaultApp = this.config.app;
	var main = this.config.main;
	var that = this;

	// enumerate and create the apps
	_.each(this.services, function(service) {

		_.bind(mergeSection, service, defaultApp, 'plugins')();
		var app = new App(service);

		app.main = main;
		app.vhosts = service.vhosts;
		app.on('error', function(err) {
			that.emit('error', err);
		});

		apps[service.id] = app;

		// enqueue the app init so we can attach a cb to the entire thing.
		inits.push(_.bind(app.init, app));
	});

	// async the inits and notify when they are done.
	// TODO: see if a single app failure could cause all apps to fail.
	async.parallel(inits, function(err) {
		if (!err) {
			that.apps = apps;
		}
		_.isFunction(callback) ? callback(err, that) : null;
	});

};

/**
* Applies the overrides from the env config.  Useful for setting a base config, then applying configuration overrides.
* @param env - String representing the env overrides for this config.  This will load the config 
**/
Config.prototype.env = function(env) {

	// apply merge of plugins at app level
	if (env && env.app) {

		// merge the core app
		_.bind(mergeSection, this.config.app, env.app, 'plugins', true)();

		// override the vhosts with the env specific hosts.
		if (env.app.vhosts) {
			this.config.app.vhosts = env.app.vhosts;
		}
		
		// logger does not get merged.
		if (env.logger) {
			this.config.logger = env.logger;
		}

		// main does not get merged.
		if (env.main) {
			this.config.main = env.main;
		}

		// services plugin config does not get merged.
		if (env.services) {
			this.config.services = env.services;
		}
	}

};

Config.prototype.stop = function(callback) {

	if (this.main) {
		this.main.stop(callback);
	}

	return this;
};

Config.prototype.start = function(callback) {
	var mainConfig = this.config.main;

	// resolve main module.
	var mainFactory = pluginUtil.require({ plugin: mainConfig });

	// Main modules are factories so call create()
	var main = this.main = mainFactory.create(this, mainConfig.options);

	this.init(function(errInit) {
		if (errInit) {
			_.isFunction(callback) ? callback(errInit) : null;
			return;
		}

		// app  is ready and initialized, call start
		main.start(callback);

	});

	return this;
};

// create local utility function to apply the merge.
var mergeSection = function(parent, section, reverse) {
	var that = this,
		parentSection = parent[section] || {},
		thisSection = this[section] || {},
		keys = _.keys(parentSection).concat(_.keys(thisSection)),
		newSection = {};

	_.each(keys, function(key) {
		var thisThing = (thisSection[key] || {}),
			parentThing = (parentSection[key] || {});

		// if the property explicitly exists, but is null then do not pull the parent version and do not add to object
		if (thisSection.hasOwnProperty(key) && thisSection[key] === null) {
			// do nothing.
		}
		// when the section/key prop exists, but is not explicitly null then we want to merge the props.  
		else if (reverse) {
			newSection[key] = _.clone(parentThing);
			newSection[key].module = newSection[key].module || thisThing.module;
			newSection[key].options = _.merge( _.cloneDeep(thisThing.options) || {}, newSection[key].options);
		}
		else {
			newSection[key] = _.clone(thisThing);
			newSection[key].module = newSection[key].module || parentThing.module;
			newSection[key].options = _.merge( _.cloneDeep(parentThing.options) || {}, newSection[key].options);
		}

	});	

	this[section] = newSection;

};

module.exports = Config;

