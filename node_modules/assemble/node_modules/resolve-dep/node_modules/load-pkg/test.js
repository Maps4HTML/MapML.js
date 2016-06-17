'use strict';
var assert = require('assert');
var pkg = require('./index');


it('should load the package.json for this project', function (done) {
  assert.equal(pkg.name, 'load-pkg');
  done();
});