module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
//    concat: {
//      options: {
//        separator: ';'
//      },
//      dist: {
//        src: ['dist/mapml.js'],
//        dest: 'dist/c.js'
//      }
//    },
    cssmin: {
      options: {
        mergeIntoShorthands: false,
        roundingPrecision: -1
      },
      combine: {
        files: {
        'dist/mapml.css': ['node_modules/leaflet/dist/leaflet.css', 'src/mapml.css']
        }
      }
    },
    uglify: {
      options: {
       banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/mapml.min.js': ['<%= rollup.main.dest %>']
        }
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js','test/**/*.spec.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          console: true,
          module: true,
          document: true
        },
        // ensure that jshint keeps processing after an error
        force: true,
        esversion: 6

      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    },
    copy : {
    	 main : {
        files: [
          {
            expand: true,
            cwd: 'node_modules/leaflet/dist/',
            flatten: true,
            filter: 'isFile',
            src: ['leaflet.css','leaflet-src.js'],
            dest: 'dist/'
          },
          {
            expand: true,
            cwd: 'node_modules/proj4/dist/',
            flatten: true,
            filter: 'isFile',
            src: ['proj4-src.js'],
            dest: 'dist/'
          },
          {
            expand: true,
            cwd: 'node_modules/proj4leaflet/src/',
            flatten: true,
            filter: 'isFile',
            src: ['proj4leaflet.js'],
            dest: 'dist/'
          },
          {
            expand: true,
            cwd: 'src',
            flatten: true,
            filter: 'isFile',
            src: ['*.js','*.css','*.md','index.html','package.json'],
            dest: 'dist/'
          },
          {
            expand: true,
            flatten: true,
            filter: 'isFile',
            src: ['index.html'],
            dest: 'dist/'
          }
        ],
        options: {
          // leaflet and proj4 need to set their global variable on the window
          // object in order to use them as modules (it seems).
          process: function (content, srcpath) {
            var wndoh;
            if (srcpath.includes('leaflet-src.js')) {
              console.log('MODIFYING: ', srcpath);
              wndoh = /\}\(this\, \(function \(exports\) \{ \'use strict\'\;/gi;
              return content.replace(wndoh,"}(window, (function (exports) { 'use strict';");
            } else if (srcpath.includes('proj4leaflet.js')) {
              console.log('PATCHING: ', srcpath);
              // replace:
              // return new L.LatLng(point2[1], point2[0], unbounded);
              // with:
              // return new L.LatLng(point2[1] || 0, point2[0] || 0, unbounded);
              // so that Leaflet doesn't barf on the NaN that is recently
              // returned by proj4js (where it used to return 0)
              unproject = /return new L\.LatLng\(point2\[1\]\, point2\[0\]\, unbounded\)\;/gi;
              return content.replace(unproject, "return new L.LatLng(point2[1] || 0, point2[0] || 0, unbounded);");
            } else if (srcpath.includes('proj4-src.js')) {
              console.log('MODIFYING: ', srcpath);
              wndoh = /\}\(this\, \(function \(\) \{ \'use strict\'\;/gi;
              return content.replace(wndoh, "}(window, (function () { 'use strict';");
            } else if (srcpath.includes('index.html')) {
              console.log('MODIFYING: ', srcpath);
              var pathToModuleRE =  /dist\/web-map\.js/gi;
              return content.replace(pathToModuleRE,"web-map.js");
            } else {
              return content;
            }
          }
        }
      },
      images: {
        // if you pass images through the process function, it corrupts them,
        // so you have to do this in a separate grunt 'target' ('main' being the
        // default one, I believe).
        files: [
          {
            expand: true,
            cwd: 'node_modules/leaflet/dist/images/',
            flatten: true,
            filter: 'isFile',
            src: ['*.png'],
            dest: 'dist/images/'
          }
        ]
      }
    },
    clean: {
      dist: ['dist']
    },
    rollup: {
      options: {
        format: 'iife',
      },
      main: {
        dest: 'dist/mapml.js',
        src: 'src/mapml/index.js', // Only one source file is permitted
      },
    },
  });

  /*grunt.loadNpmTasks('grunt-html');*/
  grunt.loadNpmTasks('grunt-contrib-uglify-es');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
//  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-rollup');

/* grunt.loadNpmTasks('grunt-processhtml'); */


  grunt.registerTask('test', ['jshint']);

  grunt.registerTask('default', ['clean:dist', 'copy', 'jshint', 'rollup', 'uglify', 'cssmin']);
  grunt.registerTask('build', ['rollup']);

};
