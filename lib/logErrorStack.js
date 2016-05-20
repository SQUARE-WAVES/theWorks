var logErr = function (err) {
  console.log(err.message);
}

var logStack = function (err) {
  console.log(err.stack);
}

//since javascript doesn't do TCO or anything
//I'm just gonna use a for loop to not deal with
//any kind of potential stack weirdness
var logErrTower = function (err, logger, depth) {
  var currentError = err;

  for (var i = 0; i < depth; ++i) {
    logger(currentError);

    if (currentError.parent === undefined) {
      return;
    }
    else {
      currentError = currentError.parent;
    }
  }

  console.log("error depth is too great to log.")
}

module.exports = function (err, showStack, depth) {
  var defaultDepth = depth || 10;

  var logFunction = logErr;

  if (showStack) {
    logFunction = logStack;
  }

  logErrTower(err, logFunction, defaultDepth);
}