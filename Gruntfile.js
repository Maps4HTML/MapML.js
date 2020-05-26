module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/**/a.js;src/**/b.js'],
        dest: 'dist/c.js'
      }
    },
    uglify: {
      options: {
       banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/mapml.min.js': ['<%= concat.dist.dest %>']
         /* ,'dist/leaflet.js': ['bower_components/polymer-leaflet/leaflet-src.js'] */
        }
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js'],
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
            cwd: 'node_modules/@runette/leaflet-fullscreen/dist/',
            flatten: true,
            filter: 'isFile', 
            src: ['Leaflet.fullscreen.js','leaflet.fullscreen.css'], 
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
            src: ['*.md','index.html','package.json'], 
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
            } else if (srcpath.includes('proj4-src.js')) {
              console.log('MODIFYING: ', srcpath);
              wndoh = /\}\(this\, \(function \(\) \{ \'use strict\'\;/gi;
              return content.replace(wndoh, "}(window, (function () { 'use strict';");
            } else if (srcpath.includes('Leaflet.fullscreen.js')) {
              console.log('MODIFYING: ', srcpath);
              wndoh = /fullscreenElement [\=\!]\=\= this\.getContainer\(\) \&\&/gi;
              return content.replace(wndoh, "");
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
            src: ['layers.png','layers-2x.png','marker-icon.png','marker-icon-2x.png','marker-shadow.png'], 
            dest: 'dist/images/'
          }
        ]
      }
    },
    clean: {
      dist: ['dist']
    }
  });

  /*grunt.loadNpmTasks('grunt-html');*/
  grunt.loadNpmTasks('grunt-contrib-uglify-es');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

/* grunt.loadNpmTasks('grunt-processhtml'); */


  grunt.registerTask('test', ['jshint']);

  grunt.registerTask('default', ['clean:dist', 'copy', 'jshint', 'concat', 'uglify']);

};