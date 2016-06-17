# grunt-wget 0.1.3 [![NPM version](https://badge.fury.io/js/grunt-wget.png)](http://badge.fury.io/js/grunt-wget) [![Build Status](https://secure.travis-ci.org/shootaroo/grunt-wget.png?branch=master)](http://travis-ci.org/shootaroo/grunt-wget) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

Wget plugin for Grunt.


## Install

```
npm install grunt-wget --save-dev
```


## Wget task

Run this task with the `grunt wget` command.

Task targets, files and options may be specified according to the grunt Configuring tasks guide.


### Options

#### baseUrl

Type: `String`

This option is base url of download contents.

#### overwrite

Type: `Boolean`
Default: `false`

Whether to download the existing files. Set `true` to download the existing files.


## Usage Example

```js
module.exports = function (grunt) {
  grunt.initConfig({

    wget: {

      basic: {
        files: {
          'js/lib/jquery-1.11.0.js': 'http://code.jquery.com/jquery-1.11.0.js',
          'js/lib/jquery-2.1.0.js': 'http://code.jquery.com/jquery-2.1.0.js',
          'js/lib/underscore-1.6.0.js': 'https://raw.github.com/jashkenas/underscore/1.6.0/underscore.js',
          'js/lib/backbone.js-1.1.2.js': 'https://raw.github.com/jashkenas/backbone/1.1.2/backbone.js'
        }
      },

      baseUrl: {
        options: {
          baseUrl: 'http://code.jquery.com/'
        },
        src: [
          'jquery-2.1.0.js',
          'jquery-2.1.0.min.js'
          'jquery-1.11.0.js',
          'jquery-1.11.0.min.js'
        ],
        dest: 'js/lib'
      }
    }
  });

  grunt.loadNpmTasks('grunt-wget');
};

```

## License

The MIT License (MIT)

Copyright &copy; 2014 [Shotaro Tsubouchi](https://github.com/shootaroo)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
