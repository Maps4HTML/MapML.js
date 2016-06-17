/**
 * cwd <https://github.com/jonschlinkert/cwd>
 * Copyright (c) 2014 Jon Schlinkert, contributors.
 * Licensed under the MIT license.
 */

var path = require('path');
var normalize = require('normalize-path');
var findup = require('findup-sync');

module.exports = function cwd() {
  var filepath = path.join.apply(path, [].slice.call(arguments));
  var base = path.dirname(findup('package.json', {
    cwd: process.cwd()
  }));
  return normalize(path.resolve(base, filepath || ''));
};