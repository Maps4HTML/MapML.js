'use strict';

var path = require('path');
var helpers = require('./helpers');

module.exports = js;

function js(content, block, blockLine, blockContent, filepath) {
  var scripts = [];
  var replacement;

  if (block.inline) {
    scripts = obtainScripts(block, blockContent, this.options.includeBase || path.dirname(filepath));
    replacement = block.indent + '<script>' + this.linefeed +
                  scripts.join(this.linefeed) +
                  block.indent + '</script>';

    return content.split(blockLine).join(replacement);
  }

  return content.replace(blockLine, block.indent + '<script src="' + block.asset + '"><\/script>');
}

function obtainScripts(block, html, baseDir) {
  var srcRegEx = /.*src=[\'"]([^\'"]*)[\'"].*/gi;
  return helpers.obtainAssets(srcRegEx, block, html, baseDir);
}
