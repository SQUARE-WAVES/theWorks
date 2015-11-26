var isArray = function (val) {
  return Array.isArray(val);
}

var isObject = function (val) {
  var truthy = !!val
  var x = (typeof (val) === "object" && !Array.isArray(val)) && truthy
  return x
}

var isString = function (val) {
  return typeof (val) === "string"
}

var isFunction = function (val) {
  return typeof (val) === "function"
}

var isNull = function (val) {
  return val === null;
}

var isUndefined = function (val) {
  return typeof (val) === "undefined";
}

module.exports = {
  "array": isArray,
  "object": isObject,
  "string": isString,
  "function": isFunction,
  "null": isNull,
  "undefined": isUndefined
};