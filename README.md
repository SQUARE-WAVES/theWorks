the-works
=========

really stupid dependency injection

#how do I install this thing

with npm! The package name is "the-works."

#what does this thing do?

it takes **configs** that look like this:

```javascript
{
	"apiKey":{
		"value":alniv9q2384y5qjzcv
	},
	"databaseConnection":{
		"plugin":{
			"path":"database_driver",
			"options":{
				"host":"database.company.com",
				"port":420,
				"user":"jim"
				"pw":"a password"
			}
		}
	},
	"resultsHeaderName":{
		"req":"./big_dogs.js"
	}
}
```

and pops out **packages** that look like this:

```javascript
{
	apiKey:alniv9q2384y5qjzcv,
	databaseConnection:{
		query:[function],
		disconnect:[function]
	},
	resultsHeaderName:"BIG DOG SHIRTS LIST"
}

```

which you can use to configurably manage your dependencies. Since configs are just Plain old objects (or arrays!), it's easy to seriaxlize them and pass them from place to place.

#why did you call it the works?

the works comes with experience from using broadway, where dependencies are injected by calling various different functions on an "app" object, then eventually calling "init" on that object, and after a callback occurs your "app" (which you allready had all kinds of access to) was actually for-reals ready.

Someone complained about the awkwardness of it likening it to going to a pizza place, where you get an uncooked crust and you have to wander around sprinkling toppings on it then handing it off to be baked. What you would really like to do is walk in there, hand them an order, and then later they hand you a finished pizza.

Long story short, it is a pizza metaphor, the name comes from "give me one with the works."

#ok walk me through this thing

to start using the works you need to create a **builder** which is a function that takes a config and a callback, and then calls back with a package (or an error)

```javascript
var the_works = require("the-works");
var builder = the_works.createBuilder();

```

out of the box, the builder can build configs using 4 different **providers**. **providers** are just functions which specify how you will inject a dependency. They are specified by a **keyword** in your configuration. Out of the box there are providers for **values**, **plugins**, **requirements**, and **packages**.

**values** are dirt simple, they are specified with the keyword **value** they are placed into your final package without any alteration. for example":

```javascript
var cool_config = {
	"box_wine":{
		"value":"crisp"
	},

	"spin class":{
		"value":"soggy"
	}
}

builder(cool_config,function(err,cool_pack){
	cool_pack.box_wine === "crisp";
	cool_pack["spin class"] === "soggy";
})

```

obviously that's pretty pointless, with values alone the works doesn't really do much useful stuff. However they can be handy for injecting things like api-keys or constraints. The other providers are where the real magic happens.

**plugins** are a bit more complicated, they let you use options to change the results.the main thing to remember about them is that a plugin is a function which plugs something in. They are specified by the keyword **plugin**. 

Plugins are basically factory functions, here is an example of a really dumb plugin:

```javascript
module.exports = function(options,callback){
	var bottom = Number(options.bottom) || 0;
	var top = Number(options.top);

	if(top > bottom){
		var rng = [];
		for(var i=bottom;i<=top;++i){
			rng.push(i);
		}

		callback(null,rng);
	}
	else{
		callback(new Error("the top of the range has to be greater than the bottom"))
	}
}
```

assuming this plugin is in a module called "range-plugin" you could use it in a config like so
```javascript
{
	"range":{
		"plugin":{
			"path":"range-plugin",
			"options":{
				"top":15,
				"bottom":10
			}
		}
	}
}
```

which would result in:
```
{
	"range":[10,11,12,13,14,15]
}
```

the configuration for a plugin has 2 parameters, "path" and "options".

path is more or less the same as you would pass to require, with a couple of caveats. If you give a relative path like "./figs.js" "./" is taken to mean process.cwd(). and if your plugin is not the only export of a module you can select it with a # clause after the path like "range-plugins#reverseRange" would require module.exports.reverseRange from the "range-plugins" module.

**plugins** are useful for attaching functions that have specific bits of state that your main program shouldn't care about, a good example is a database connection, like in the example at the very top.

**requirements** are specified using the **req** keyword, they are basically 1-to-1 calls to require, e.g

```javascript
{
	"transform":{
		"req":"lodash#transform"
	}
}
```
would inject the function transform from the lodash library. It would be the same as saying
```javascript
{
	"transform":require("lodash").transform
}
```

The path follows the same rules as the plugin path configuration. Meaning you can use "./whatever.js" to get a local dependency (relative to process.cwd())

finally **packages** are just a nice way to nest dependency structures via namespaces, you use the keyword package, and the works builds whatever is under that keyword as a whole package. For example, we might make the dependencies for some kind of sequential task executing program like this

```javascript
{
	"steps":{
		"package":[
			{
				"plugin":{
					"path":"corn_extractor",
					"options":{
						"shuck":true
					}
				}
			},
			{
				"plugin":{
					"path":"corn_cobber"
					"options":{
						"butter":true,
						"chili_powder":true
					}
				}
			},
			{
				"req":"corn_gobbler#default_gobble"
			}
		]
	}
}

```

#can we add new providers to put in specs, or change the meaning of value/plugin/req/package?

**YEAH YOU CAN, YOU HAVE THE POWER.**

plugin, value, req, and package are added by default to any builder, but you can pass in a set of other providers or overwrite those things when creating a builder. 

Providers are **higher order functions** that take as their argument some specific config plan, and return a function that can be used to inject precisely what you want. The "config plan" is whatever we put after the keyword in the config, so for a value it's the value, for a plugin its the object with path and options. This is best shown with an example.

So for example if you wanted to create a new provider which just plugged in shared references, configured something like this:

```javascript
{
	"logger":{
		"shared":"syslog_writer"
	},
	"db_connection":{
		"shared":"postgres_connection"
	}
}

```
you would write some code like this.

```javascript

	var sharedStuff = {
		//assuming we have these things already
		"logger":logger,
		"dracula":drac,
		"werewolf":rabian
	};

	//as you can see the reference name is passed in here
	//so something like "logger" or "werewolf"
	var shared = function(sharedRef){
		//this is the actual function that will build this dependency, notice that "builder" is passed in!
		return function(buidler,cb){
			var shared_thing = sharedStuff[sharedRef];

			if(shared_thing !== undefined){
				cb(null,shared_thing);
			}
			else{
				//gotta give em an error!
				cb(new Error("shared reference: "+ sharedRef +" doesn't exist"))
			}
		}
	};

	//you specify the keyword when you create the builder
	var builder = the_works.createBuilder({
		"shared":shared
	});

	var config = {
		"log":{
			"shared":"logger"
		},
		"something":{
			"plugin":{
				"path":"a-module",
				"options":{
					"rock":"on"
				}
			}
		}
	}

	var config2 = {
		"monster":{
			"shared":"dracula"
		},
		"spectre":{
			"plugin":{
				"path":"ghost-builder",
				"options":{
					"polter":true,
					"chains":false,
					"tortured-soul":true
				}
			}
		},
		"beastMan":{
			"shared":"werewolf"
		}
	}

	builder(config,function(err,pkg){
		pkg.log === sharedStuff.logger;
	});

	builder(config2,funciton(err,pkg){
		pkg.beastMan === sharedStuff.werewolf
	})
```

you can also change the meaning of "plugin" and "value", but I wouldn't reccomend it.

#hey so whats up with the builder that gets passed into the provider function?

That builder is the builder using to build the present thing, it lets you do recursive stuff. It's how the **package** provider works, and it can be used to let you do neat recursive stuff. In secret even the regular plugin provider can use the recursive builder, just specify it in your plugin functions arguments (the-works checks the functions airity)

```javascript
//basically the package provider, but done as a plugin
module.exports = function(options,builder,cb){
	builder(options,function(err,subPack){
		cb(err,subPack)
	})
}
```

and with a config like this

```javascript
{
	"pack1":{
		"plugin":{
			"path":"./plugins/sub-package.js"
			"options":{
				"a":{
					"value":15
				},
				"b":{
					"plugin":{
						"path":"whatever",
						"options":{
							"something":"something"
						}
					}
				}
			}
		}
	}
}
```

you can make packages that consist of packages that consist of packages, all the way down.