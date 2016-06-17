# grunt-cssmin-ie8-clean

> Fixes CSS minification issues in IE8 by breaking down the file into multiple lines

## Getting Started
This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-cssmin-ie8-clean --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-cssmin-ie8-clean');
```

## The "cssmin_ie8_clean" task

### Overview
In your project's Gruntfile, add a section named `cssmin_ie8_clean` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  cssmin_ie8_clean: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2015 Nick Schonning. Licensed under the MIT license.
