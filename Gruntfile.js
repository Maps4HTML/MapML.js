module.exports = function(grunt) {
  const Diff = require('diff');
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    cssmin: {
      options: {
        mergeIntoShorthands: false,
        roundingPrecision: -1
      },
      combine: {
        files: {
        'dist/mapml.css': ['node_modules/leaflet/dist/leaflet.css', 'node_modules/leaflet.locatecontrol/dist/L.Control.Locate.css', 'node_modules/leaflet.locatecontrol/dist/L.Control.Locate.mapbox.css', 'src/mapml.css']
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
        sourceMap: {
          includeSources: true
        }
      },
      dist: {
        files: {
          'dist/mapml.js':        ['<%= rollup.main.dest %>'],
          'dist/web-map.js':      ['src/web-map.js'],
          'dist/mapml-viewer.js': ['src/mapml-viewer.js'],
          'dist/DOMTokenList.js': ['src/mapml/utils/DOMTokenList.js'],
          'dist/map-caption.js':  ['src/map-caption.js'],
          'dist/map-area.js':     ['src/map-area.js'],
          'dist/layer.js':        ['src/layer.js'],
          'dist/leaflet.js':      ['dist/leaflet-src.js',
                                   'dist/proj4-src.js',
                                   'dist/proj4leaflet.js']
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
        esversion: 11

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
            src: ['leaflet-src.js'],
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
            flatten: true,
            filter: 'isFile',
            src: ['index.html'],
            dest: 'dist/'
          },
          {
            expand: true,
            cwd: 'node_modules/leaflet.locatecontrol/src/',
            flatten: true,
            filter: 'isFile',
            src: ['L.Control.Locate.js'],
            dest: 'dist/'
          }
        ],
        options: {
          process: function (content, srcpath) {
            // see patch.diff file for comments on why patching is necessary
            if (srcpath.includes('proj4leaflet.js')) {
              console.log('PATCHING: ', srcpath);
              const patch = grunt.file.read('src/proj4leaflet/patch.diff');
              return Diff.applyPatch(content, patch);
            } else if (srcpath.includes('proj4-src.js')) {
              console.log('PATCHING: ', srcpath);
              const patch = grunt.file.read('src/proj4/patch.diff');
              return Diff.applyPatch(content, patch);
            } else if (srcpath.includes('index.html')) {
              console.log('MODIFYING: ', srcpath);
              var pathToModuleRE =  /dist\/mapml-viewer\.js/gi;
              return content.replace(pathToModuleRE,"./mapml-viewer.js");
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
      },
      experiments: {
        files: [
          {
            expand: true,
            src: ['dist/*'],
            dest: '../experiments'
      }
        ]
      }
    },
    clean: {
      dist: ['dist'],
      tidyup: ['dist/leaflet-src.js','dist/proj4-src.js','dist/proj4leaflet.js'],
      experiments: {
        options: {force: true},
        src: ['../experiments/dist']
      }
    },
    rollup: {
      options: {
        format: 'iife'
      },
      main: {
        dest: 'dist/mapml.js',
        src: 'src/mapml/index.js' // Only one source file is permitted
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-rollup');

  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('default', ['clean:dist', 'copy:main', 'copy:images', 'jshint', 'rollup', 
                                 'uglify', 'cssmin','clean:tidyup']);
  grunt.registerTask('experiments',['clean:experiments','default','copy:experiments']);

};
