'use strict';
var fs = require('fs');
var path = require('path');
var url = require('url');

var async = require('async');
var request = require('request');

module.exports = function (grunt) {

  grunt.registerMultiTask('wget', 'Download web contents.', function () {

    var options = this.options({
      overwrite: false
    });

    var done = this.async();
    var log = grunt.log;
    var count = 0;

    async.forEach(this.files, function (filePair, done) {
      var isSingle = filePair.orig.src.length === 1;
      async.forEach(filePair.orig.src, function (src, done) {
        if (options.baseUrl) {
          src = options.baseUrl + src;
        }
        var srcUrl = url.parse(src);
        var dest = isSingle ? filePair.dest : path.join(filePair.dest, srcUrl.pathname.split('/').pop());
        if (!options.overwrite && grunt.file.exists(dest)) {
          return done();
        }
        log.verbose.writeln('Downloading', src.cyan, '->', dest.cyan);
        request({ url: src, encoding: null }, function (err, res, body) {
          if (err) {
            done(err);
          } else if (res.statusCode >= 400) {
            done(new Error(res.statusCode + ' ' + src));
          } else {
            count++;
            grunt.file.mkdir(isSingle ? path.dirname(filePair.dest) : filePair.dest);
            fs.writeFile(dest, body, done);
          }
        });
      }, done);
    }, function (err) {
      if (err) {
        grunt.fail.warn(err);
      }
      if (count) {
        log.writeln('Downloaded', String(count).cyan, count === 1 ? 'file' : 'files');
      }
      done();
    });
  });
};
