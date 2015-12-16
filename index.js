/*!
 * gh-post | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/gh-post
*/
'use strict';

const ghGet = require('gh-get');

module.exports = function ghPost(url, options) {
  return ghGet(url, Object.assign({}, options, {method: 'POST'}));
};
