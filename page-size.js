#!/usr/bin/env node
var phantomjs = require('phantomjs-prebuilt');
var argv = require('yargs').argv;
var _ = require('lodash');
var _async = require('async');

var getPageSizeSample = function (callback) {
  var phantom = phantomjs.exec.apply(null, [
    'yslow.js',
    '--info',
    'basic',
    '--format',
    'json',
    '-vp',
    '1200x800',
    argv._[0]
  ]);

  var stdout = '';
  phantom.stdout.on('data', function(buf) {
      stdout += buf;
    });

  phantom.on('exit', function(code) {
    var loadTime = JSON.parse(stdout).w;
    callback(null, loadTime);
  });
};

var runCount = _.has(argv, 'count') ? argv.count : 3;

_async.series(
  _.map(_.times(runCount), function() { return getPageSizeSample; }),
  function (err, results) {
    var averageLoadTime = _.reduce(results, function(memo, num) {
       return memo + num;
    }, 0) / (results.length === 0 ? 1 : results.length);
    console.log(Math.floor(averageLoadTime));
  }
);
