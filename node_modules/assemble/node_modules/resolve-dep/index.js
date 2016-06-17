/*!
 * resolve-dep
 * https://github.com/jonschlinkert/resolve-dep
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var cwd = require('cwd');
var resolve = require('resolve');
var normalize = require('normalize-path');
var multimatch = require('multimatch');
var flatten = require('array-flatten');
var glob = require('globby');
var extend = require('xtend');
var pkg = require('load-pkg');


var arrayify = function(arr) {
  return flatten(!Array.isArray(arr) ? [arr] : arr).filter(Boolean);
};


/**
 * ## .resolveDep()
 *
 * Resolve both npm packages and local modules by:
 *
 *   1. Attempting to expand glob patterns to local modules, then
 *   1. Attempting to match glob patterns to deps in package.json
 *
 * **Examples:**
 *
 * ```js
 * // file path
 * resolve('foo/bar.js');
 * // glob patterns
 * resolve('foo/*.js');
 * // named npm module (installed in node_modules)
 * resolve('chai');
 * // combination
 * resolve(['chai', 'foo/*.js']);
 * ```
 *
 * @param  {Array|String} `patterns` Glob patterns for files or npm modules.
 * @param  {Object} `options`
 * @return {Array}
 */

var resolveDep = function (patterns, options) {
  var locals = resolveDep.local(patterns, options);
  var npm = resolveDep.npm(patterns, options);
  return locals.concat(npm);
};



/**
 * ## .resolveDep.npm()
 *
 * Resolve npm packages in node_modules by matching glob patterns to deps in
 * package.json. NPM modules will only be resolved if they are defined in
 * one of the "dependencies" fields in package.json.
 *
 * ```js
 * // resolve npm modules only
 * resolve.npm(['chai', 'lodash']);
 * ```
 *
 * @param  {Array|String} `patterns`
 * @param  {Object} `options`
 * @return {Array}
 */

resolveDep.npm = function (patterns, options) {
  options = options || {};
  var defaults = ['dependencies', 'devDependencies', 'peerDependencies'];
  var types = options.type || defaults;
  patterns = arrayify(patterns);
  types = arrayify(types);

  // if `all` is specified, then use all the dependency collections
  if (types[0] === 'all') {
    types = defaults;
  }

  // find all the collections from the package.json
  var configObj = options.config || pkg;
  var modules = flatten(types.map(function (type) {
    return configObj[type] ? Object.keys(configObj[type]) : null;
  })).filter(Boolean);

  if (!modules.length || !patterns.length) {
    return [];
  }

  var deps = [];
  var matches = multimatch(modules, patterns, options);
  if (matches.length) {
    matches.forEach(function (match) {
      deps = deps.concat(resolve.sync(match, {
        basedir: cwd()
      }));
    });
  }
  return deps.map(normalize);
};


/**
 * ## .resolveDep.local()
 *
 * Resolve local modules by expanding glob patterns to file paths.
 *
 * ```js
 * // resolve local modules only
 * resolve.local(['a/*.js', 'b/*.json']);
 * ```
 *
 * @param  {Array|String} `patterns`
 * @param  {Object} `options`
 * @return {Array}
 */

resolveDep.local = function (patterns, options) {
  options = options || {};
  options.cwd = options.srcBase = cwd(options.cwd || process.cwd());
  options.prefixBase = options.prefixBase || true;

  patterns = flatten(arrayify(patterns));
  if (!patterns.length) {
    return [];
  }

  // find local matches
  var p = glob.sync(patterns, options).map(function (filepath) {
    if (options.prefixBase) {
      filepath = path.join(options.cwd, filepath);
    }
    return normalize(filepath);
  });
  // console.log(p)
  return p;
};

resolveDep.deps = function (patterns, options) {
  return resolveDep.npm(patterns, extend({
    type: 'dependencies'
  }, options));
};

resolveDep.dev = function (patterns, options) {
  return resolveDep.npm(patterns, extend({
    type: 'devDependencies'
  }, options));
};

resolveDep.peer = function (patterns, options) {
  return resolveDep.npm(patterns, extend({
    type: 'peerDependencies'
  }, options));
};

module.exports = resolveDep;
