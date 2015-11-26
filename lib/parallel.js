var is = require("./is_x.js");

//a light version of async.parallel, that makes sure to properly defer values
var parallel_object = function (tasks, callback) {
  var error = false;
  var total = Object.keys(tasks).length;
  var count = 0;
  var final_results = {};

  Object.keys(tasks).forEach(function (key) {
    var task = tasks[key];
    task(function (err, task_results) {
      if (error) {
        return; //this whole ship sank
      }
      else if (err) {
        error = true;
        final_results[key] = task_results;
        callback(err, final_results);
      }
      else {
        final_results[key] = task_results;
        count = count + 1; //safe because this is JS and single threaded

        if (count === total) {
          callback(null, final_results)
        }
      }
    })
  });

  if (total === 0) {
    callback(null, {})
  }
}

var parallel_array = function (tasks, callback) {
  var error = false;
  var total = tasks.length;
  var count = 0;
  var final_results = new Array(tasks.length);

  tasks.forEach(function (task, index) {

    task(function (err, task_results) {
      if (error) {
        return; //this whole ship sank
      }
      else if (err) {
        error = true;
        final_results[index] = task_results;
        callback(err, final_results);
      }
      else {
        final_results[index] = task_results;
        count = count + 1; //safe because this is JS and single threaded

        if (count === total) {
          callback(null, final_results)
        }
      }
    })
  })

  if (total === 0) {
    callback(null, [])
  }
}

module.exports = function (tasks, callback) {
  var method;
  if (is.array(tasks)) {
    method = parallel_array
  }
  else if (is.object(tasks)) {
    method = parallel_object
  }
  else {
    method = function (t, c) {
      c(new Error("you must give an array or object of task functions"))
    }
  }

  process.nextTick(function () {
    method(tasks, callback)
  })
}