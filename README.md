the-works
========

really stupid dependency injection

#how do I install this thing

with npm! The package name is "the-works."

#what does this thing do?

it takes **configs** that look like this:

```
{
	"apiKey":{
		"value":alniv9q2384y5qjzcv
	},
	"databaseConnection":{
		"plugin":"database_driver",
		"options":{
			"host":"database.company.com",
			"port":420,
			"user":"jim"
			"pw":"a password"
		}
	},
	"resultsHeaderName":{
		"value":"BIG DOG SHIRTS LIST"
	}
}


```

and pops out **packages** that look like this:

```

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

Long story short, it is a pizza metaphor, the name comes from "give me one with the works.""

#how does the works handle dependency injection?

the-works makes builders, which are functions that take a plain old js object as config, the dependencies are named by the keys of that object and the values of that object contain specifiers to either use a particular value, or a plugin. Builders come with a default way of fetching and installing plugins, but they can also have different mechanisms injected into them to handle different plugin interfaces, or retrieval methods.

#how would one go about using this, in the simplest way possible?

first make a default builder by calling createBuilder ()

```
var the_works = require('the-works')
var build = the-works.createBuilder();
```

then create a config (or fetch it from somewhere)

```
var conf = {
	~~~~~~~~SOME DEPENDENCIES~~~~~~~~~~~~
}

or

var conf = require("config.json")
```

then pass your conf, and a callback into the builder function, and then you are ready to go hog wild.

```
build(conf, function(err,package){
	if(err){
		tellMeWhatWentWrong(err);
		return;
	}

	goHogWildWithTheseDependencies(package);
});
```

#what kind of stuff can I put in a config?

configs have 2 basic units, *values* which are injected without any kind of change, and *plugins* which are functions that are executed with a hash of options passed int, and their results are placed in as the dependency.

##how do I configure a value?

to declare a dependency as a value, you give it the key "value" and then the value that you want to inject, it looks like this:
```
	"name":{
		"value":~~~~~~WHATEVER YOU WANT~~~~~~~~
	}
```

##how about a pluigin?

to declare a plugin, give it the key "plugin" associated with the path to that plugin (more about paths in a second) then give it the key "options" associated with a hash of various options you want to pass into the plugin.

```
	"name":{
		"plugin":~~PATH TO THE PLUGIN~~,
		"options":{
			key:val,
			key:val
			etc...
		}
	}
```

the path to a plugin is a string, more or less it is the same string you would pass into require in your main function. As well, since a module might export more than one plugin, or a plugin and something else, you can add a # followed by the export name to your path to get more specific.

for example, if your module "plugin-collection" exports a plugin called "plug" (module.exports.plug = ~~some plugin function~~) give it the path "plugin-collection#plug"

or if the module was in a local path like ./lib/plugins the path might look like "./lib/plugins/plugin_collection.js#plug."

#how do I write a plugin

By default, a plugin is a function that takes a hash of options and a callback, it calls the callback with the thing you want to inject, or an error. Here is an example:

```
var Thingy = require('some-library');

module.exports = function(options,callback){
	try{
		var thing = new Thingy(options.construction);
		thing.param1 = options.param1
		//etc..
	}
	catch(err){
		callback(err,null);
		return
	}

	callback(null,thing);
	
}
```

the plugin interface here isn't meant to force you to do much, you can wrap libraries, fetch values from files or servers. It's meant to provide you the ability to plug in dependenceies without telling you much about what you should plug.

#What if I want to do something different?

Then you need a custom builder! the_works.createBuilder accepts an optional argument that allows you to specify different plugin types. The argument looks like a hash from type names, to functions that take a path value (not neccesarily a string) and then those functions return "normal style" plugins (functions that take options hashes and callbacks.) Essentially they are pre-made wrappers for different types of things.

Here is an example of a custom retriever that lets you inject shared references to various objects:

```
var sharedStuff = {
	'dogs':~~some object~~,
	'cats':~~some object~~,
};

var sharedRetriever = function(path){
	return function(options,callback){
		var sharedRef = sharedStuff[path];
		if(sharedRef === undefined){
			callback(new Error("path: " + path + " is not a shared object"),null)
		}
		else{
			callback(null,sharedRef);
		}
	}
};

var customBuilder = the_works.createBuilder({'shared':sharedRetriever});
```

and to use a custom plugin type in a config, you pass an object into the plugin section with the type name and the "path" (which isn't a great name, but we couldn't think of a better one)

it looks like this (assuming you are using our custom builder above):
```
	"name":{
		"plugin":{
			"type":"shared",
			"path":"dogs"
		},
		//options aren't needed, but some custom retrievers will use them
	}
```

#what else does the-works export:

the-works exports a utilities section that for now contains the function "requireModule," this is the function that the default plugin retriever uses to require modules, it is handy for writing your own plugin retrievers.

