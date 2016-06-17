/*
 * grunt-cssmin-ie8-clean
 *
 *
 * Copyright (c) 2015 Nick Schonning
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

  grunt.registerMultiTask('cssmin_ie8_clean', 'Fixes CSS minification issues in IE8 by breaking down the file into multiple lines', function () {

    // Merge task-specific and/or target-specific options with these defaults.
    //var options = this.options({});

    // Iterate over all specified file groups.
    this.files.forEach(function (file) {

      var css,
       src = file.src.filter(function (filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      });

      // Write the destination file, or source file if destination isn't specified.
      if ( typeof file.dest !== "undefined" ) {

        // Concat specified files.
        css = src.map(function( filepath ) {
          return grunt.file.read( filepath );
        }).join( grunt.util.linefeed );

        grunt.file.write( file.dest, ie8Replacements( css ) );
        grunt.log.writeln( "Cleaned file '" + file.dest + "' created." );

      } else {

        src.forEach(function(filepath) {
          grunt.file.write(filepath, ie8Replacements( grunt.file.read( filepath ) ) );
          grunt.log.writeln( "File '" + filepath + "' prefixed." );
        });
      }
    });
  });

  function ie8Replacements( css ) {
    return css.replace( /@/g, "\n@" );
  }
};
