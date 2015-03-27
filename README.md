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
		"value":"BIG DOG SHIRTS LIST"
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

which you can use to configurably manage your dependencies. Since configs are just Plain old objects, it's easy to serialize them and pass them from place to place.

#why did you call it the works?

the works comes with experience from using broadway, where dependencies are injected by calling various different functions on an "app" object, then eventually calling "init" on that object, and after a callback occurs your app (which you allready had all kinds of access to) was actually for-reals ready.

Someone complained about the awkwardness of it likening it to going to a pizza place, where you get an uncooked crust and you have to wander around sprinkling toppings on it then handing it off to be baked. What you would really like to do is walk in there, hand them an order, and then later they hand you a finished pizza.

Long story short, it is a pizza metaphor, the name comes from "give me one with the works."

#ok walk me through this thing

to start using the works you need to create a **builder** which is a function that takes a config and a callback, and then calls back with a package (or an error)

```javascript
var the_works = require("the-works");
var builder = the_works.createBuilder();

```

out of the box, the builder can build configs with only kinds of things. **values** and **plugins**.

**values** are dirt simple, they are placed into your final package without any alteration. for example":
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

obviously that's pretty pointless, you could just write the finished object, so for that reason the builder can also take plugins.

**plugins** are a bit more complicated, the main thing to remember about them is that a plugin is a function which plugs something in.
here is an example of a really dumb plugin:

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

#can we add new things to put in specs, or change the meaning of value and/or plugin?

**YEAH YOU CAN, YOU HAVE THE POWER.**

plugin and value, are added by default to any builder, but you can pass in a set of other things or overwrite those things when creating a builder, check this out.

```javascript

	var sharedStuff = {
		//assuming we have these things already
		"logger":logger,
		"dracula":drac,
		"werewolf":rabian
	};

	var shared = function(sharedRef){
		return function(buidler,cb){
			var shared_thing = sharedStuff[sharedRef];

			if(shared_thing !== undefined){
				cb(null,shared_thing);
			}
			else{
				cb(new Error("shared reference: "+ sharedRef +" doesn't exist"))
			}
		}
	};

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

#hey so whats up with the builder thing in that shared function you made?

that's another cool trick. That builder is the builder using to build the present thing, it lets you do recursive stuff. Even value and plugin use it.
for example you can make a plugin like this:

```javascript
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

you can make packages that consist of packages that consist of packages, all the way down. As well the builder will be passed into any custom functions you use.


