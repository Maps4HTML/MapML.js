'use strict';

var path = require('path');
var helpers = require('./helpers');

module.exports = css;

function css(content, block, blockLine, blockContent, filepath) {
  var styles = [];
  var replacement;

  if (block.inline) {
    styles = obtainStyles(block, blockContent, this.options.includeBase || path.dirname(filepath));
    replacement = block.indent + '<style>' + this.linefeed +
                  styles.join(this.linefeed) +
                  block.indent + '</style>';

    return content.split(blockLine).join(replacement);
  }

  return content.replace(blockLine, block.indent + '<link rel="stylesheet" href="' + block.asset + '"/>');
}

function obtainStyles(block, html, baseDir) {
  var hrefRegEx = /.*href=[\'"]([^\'"]*)[\'"].*/gi;
  return helpers.obtainAssets(hrefRegEx, block, html, baseDir);
}
