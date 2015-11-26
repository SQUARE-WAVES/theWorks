var is = require("./is_x.js")

var object_transform = function (obj, transformer, acc) {
  var transformed = Object.keys(obj).reduce(function (ac, key) {
    var val = obj[key];
    transformer(ac, val, key);
    return ac;
  }, acc)

  return transformed;
}

module.exports.transform = function (thingy, transformer) {
  var method = null;
  var defaulted_acc = null;

  if (is.null(thingy) || is.undefined(thingy)) {
    //a quick shortcut
    method = function (th, trans, acc) {
      return {}
    }
  }
  else if (is.array(thingy)) {
  	var defaulted_acc = [];
    method = object_transform
  }
  else if (is.object(thingy)) {
  	var defaulted_acc = {};
    method = object_transform
  }
  else {
    throw new Error("requested item cannot be transformed")
  }

  return method(thingy, transformer, defaulted_acc)
}

//we don't need full compatability as we are only doing this in one place
var def = function (obj, defs) {
  if (!is.object(defs)) {
    return;
  }


  Object.keys(defs).forEach(function (key) {
    if (is.undefined(obj[key])) {
      obj[key] = defs[key]
    }
  })
}

module.exports.defaults = function (layer1, layer2) {
  var init = {};
  def(init, layer1);
  def(init, layer2);
  return init;
}