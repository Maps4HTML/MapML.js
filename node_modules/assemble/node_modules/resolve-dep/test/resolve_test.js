/**
 * Assemble <http://assemble.io>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors
 * Licensed under the MIT License (MIT).
 */
var expect = require('chai').expect;
var resolve = require('resolve');
var cwd = require('cwd');

var resolveDep = require('../');

var normalizeSlash = function(filepath) {
  return filepath.replace(/\\/g, '/');
};

describe('resolveDep', function () {

  /**
   * Explicit dependency type
   */

  describe('explicit dependency type', function () {
    describe('when "dependencies" is passed to the `type` option', function () {
      describe('when the module exists', function () {
        it('should return the resolved file path to the module', function () {
          var actual = resolveDep('cwd', {type: 'dependencies'});
          var expected = [resolve.sync('cwd')].map(normalizeSlash);
          expect(actual).to.eql(expected);
        });
        it('should return the resolved file path to the module', function () {
          var actual = resolveDep('chai', {type: 'devDependencies'});
          var expected = [resolve.sync('chai')].map(normalizeSlash);
          expect(actual).to.eql(expected);
        });
      });

      describe('when the module does not exist', function () {
        it('should return an empty array', function () {
          var actual = resolveDep('chai', {type: 'dependencies'});
          expect(actual).to.eql([]);
        });
      });
    });
  });


  /**
   * resolveDep()
   */

  describe('when named npm dependencies are specified', function () {
    describe('as a string', function () {
      it('should resolve the absolute filepath to the module', function () {
        var actual = resolveDep('cwd');
        var expected = [resolve.sync('cwd')].map(normalizeSlash);
        expect(actual).to.eql(expected);
      });
    });

    describe('as a glob pattern', function () {
      it('should resolve the absolute filepath to the module', function () {
        var actual = resolveDep('load*');
        var expected = [resolve.sync('load-pkg')].map(normalizeSlash);
        expect(actual).to.eql(expected);
      });
    });
  });


  describe('when a file path to a local module is passed', function () {
    describe('as a string', function () {
      it('should resolve the filepath', function () {
        var actual = resolveDep('index.js');
        var expected = [cwd('./index.js')];
        expect(actual).to.eql(expected);
      });
    });

    describe('as a glob pattern', function () {
      it('should resolve the filepath', function () {
        var actual = resolveDep('*.js');
        var expected = [cwd('./index.js')];
        expect(actual).to.eql(expected);
      });
    });

    describe('as a glob pattern', function () {
      it('should resolve the filepath', function () {
        var actual = resolveDep('*.json');
        var expected = [cwd('package.json')];
        expect(actual).to.eql(expected);
      });
    });
  });



  describe('when a file path to a non-existant local dependency is passed', function () {
    it('should return an empty array', function () {
      var actual = resolveDep('./something/that/does/not/exist.js');
      expect(actual).to.eql([]);
    });
  });

  describe('when a file path to non-requireable is passed', function () {
    it('should return the resolved path to the file', function () {
      var actual = resolveDep('./README.md');
      expect(actual.length).to.eql(1);
    });
  });

  describe('when a path to a local module and named npm dependencies are specified together', function () {
    it('should resolve the paths to both', function () {
      var actual = resolveDep(['cwd', './index.js']);
      expect(actual.length).to.eql(2);
    });
  });


  // /**
  //  * resolveDep.local()
  //  */

  describe('resolveDep.local()', function () {
    describe('when a path to a local module is passed)', function () {
      it('should resolve the filepath', function () {
        var actual = resolveDep.local('./index.js');
        var expected = [cwd('./index.js')];
        expect(actual).to.eql(expected);
      });
    });

    describe('when a path to a local module is passed)', function () {
      it('should resolve the filepath', function () {
        var actual = resolveDep.local(['./index.js', './test/fixtures/bar.js']);
        expect(actual.length).to.eql(2);
      });
    });

    describe('when an array of filepaths to both existing and non-existant local modules is passed)', function () {
      it('should resolve the filepath', function () {
        var actual = resolveDep.local(['./index.js', './blah.js']);
        expect(actual.length).to.eql(1);
      });
    });

    describe('when an array of filepaths to both existing and invalid local modules is passed)', function () {
      it('should resolve the filepath', function () {
        var actual = resolveDep.local(['./index.js', './README.md']);
        expect(actual.length).to.eql(2);
      });
    });

    describe('when a file path to a non-existant module is passed', function () {
      it('should return an empty array', function () {
        var actual = resolveDep.local('./something/that/does/not/exist.js');
        expect(actual).to.eql([]);
      });
    });

    describe('when a file path to an invalid module (e.g. non-module) is passed', function () {
      it('shoud return an empty array', function () {
        var actual = resolveDep.local('./README.md');
        expect(actual.length).to.eql(1);
      });
    });
  });


  /**
   * resolveDep.npm()
   */

  describe('resolveDep.npm()', function () {
    describe('when named npm dependencies are specified as a string', function () {
      it('should return an array of filepaths to resolved npm modules', function () {
        var actual = resolveDep.npm('cwd');
        var expected = [resolve.sync('cwd')].map(normalizeSlash);
        expect(actual).to.eql(expected);
      });
    });

    describe('when named dependencies are specified as a glob pattern', function () {
      it('should return an array of filepaths to resolved npm modules', function () {
        var actual = resolveDep.npm(['cwd']);
        var expected = [resolve.sync('cwd')].map(normalizeSlash);
        expect(actual).to.eql(expected);
      });
    });

    describe('when a path to a local module is passed to resolveDep.npm()', function () {
      it('should return an empty array', function () {
        var actual = resolveDep.npm('./index.js');
        expect(actual).to.eql([]);
      });
    });

    describe('when dependencies are specified as a glob pattern', function () {
      it('should return an array of all resolved modules', function () {
        var actual = resolveDep.npm('v*');
        expect(actual.length).to.eql(2);
      });
    });

    describe('when negation glob patterns are used', function () {
      it('should return an array of all resolved modules excluding negated modules', function () {
        var actual = resolveDep.npm(['v*', '!*-jscomments']);
        expect(actual.length).to.eql(1);
      });
    });
  });

  /**
   * explicit config
   */

  describe('when an explicit config if defined', function () {
    describe('when named, non-existant npm dependencies are specified as a string', function () {
      it('should return an empty array', function () {
        var foo = require('./fixtures/foo.json');
        var actual = resolveDep.npm('cwd', {config: foo});
        expect(actual).to.eql([]);
      });
    });
    describe('when named npm dependencies are specified as a string', function () {
      it('should return an empty array', function () {
        var foo = require('./fixtures/foo.json');
        var actual = resolveDep.npm('globby', {config: foo});
        var expected = [resolve.sync('globby')].map(normalizeSlash);
        expect(actual).to.eql(expected);
      });
    });
  });
});

