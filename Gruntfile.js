module.exports = function(grunt) {
  const rollup = require('rollup');
  const rollupConfig = require('./rollup.config.js');
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
          'dist/mapml.css': ['node_modules/leaflet/dist/leaflet.css', 'node_modules/leaflet.locatecontrol/dist/L.Control.Locate.css', 'src/mapml.css']
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
        esversion: 11,
        laxbreak: true // used to fix differences with prettier 
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
            flatten: true,
            filter: 'isFile',
            src: ['index.html'],
            dest: 'dist/'
          },
          {
            expand: true,
            flatten: true,
            filter: 'isFile',
            src: ['src/pmtilesRules.js'],
            dest: 'dist/'
          }
        ],
        options: {
          process: function (content, srcpath) {
            // see patch.diff file for comments on why patching is necessary
            if (srcpath.includes('index.html')) {
              console.log('MODIFYING: ', srcpath);
              var pathToModuleRE =  /dist\/mapml\.js/gi;
              return content.replace(pathToModuleRE,"./mapml.js");
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
          },
          {
            expand: true,
            flatten: true,
            filter: 'isFile',
            src: ['w3community.ico'],
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
          },
          {
            expand: true,
            src: ['dist/images/*'],
            dest: '../experiments'
          }        ]
      },
      extension: {
        files: [
          {
            expand: true,
            src: ['dist/*'],
            dest: '../mapml-extension/src'
          }
        ]
      },
      geoserver: {
        files: [
          {
            expand: true,
            cwd: 'dist',
            src: ['*.js','*.map','*.css'],
            dest: '../geoserver/src/extension/mapml/src/main/resources/viewer/widget'
          }
        ]
      },
      docs: {
        files: [
          {
            expand: true,
            src: ['dist/*'],
            dest: '../web-map-doc/static'
          }
        ]
      }
    },
    clean: {
      dist: ['dist'],
      tidyup: ['dist/mapmlviewer.js'],
      experiments: {
        options: {force: true},
        src: ['../experiments/dist']
      },
      extension: {
        options: {force: true},
        src: ['../mapml-extension/src/dist']
      },
      geoserver: {
        options: {force: true},
        src: ['../geoserver/src/extension/mapml/src/main/resources/viewer/widget/*.js','../geoserver/src/extension/mapml/src/main/resources/viewer/widget/*.map','../geoserver/src/extension/mapml/src/main/resources/viewer/widget/*.css']
      },
      docs: {
        options: {force: true},
        src: ['../web-map-doc/dist']
      }
    },
    prettier: {
      options: {
        // https://prettier.io/docs/en/options.html
        progress: true
      },
      files: {
        src: [
          "src/**/*.js",
          "test/**/*.js"
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-prettier');

  // "grunt-rollup" plugin seems no longer maintained
  grunt.registerTask('customRollup', 'A custom Rollup build task', async function() {
    const done = this.async();
    try {
      // Use the configuration loaded from rollup.config.js
      const bundle = await rollup.rollup(rollupConfig);
      await bundle.write(rollupConfig.output);

      console.log('Rollup build completed successfully.');
      done();
    } catch (error) {
      console.error('Rollup build failed:', error);
      done(false);
    }
  });
  grunt.registerTask('format', ['prettier', 'jshint']);
  grunt.registerTask('default', ['clean:dist', 'copy:main', 'copy:images', 'format', 'customRollup', 'cssmin']);
  grunt.registerTask('experiments', ['clean:experiments', 'default', 'copy:experiments']);
  grunt.registerTask('extension', ['clean:extension', 'default', 'copy:extension']);
  grunt.registerTask('geoserver', ['clean:geoserver', 'default', 'copy:geoserver']);
  grunt.registerTask('basemap', ['clean:basemap', 'default', 'copy:basemap']);
  grunt.registerTask('docs', ['clean:docs', 'default', 'copy:docs']);
  grunt.registerTask('sync', ['default', 'experiments', 'extension', 'docs']);

};
