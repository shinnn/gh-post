# gh-post

[![npm version](https://img.shields.io/npm/v/gh-post.svg)](https://www.npmjs.com/package/gh-post)
[![Build Status](https://travis-ci.org/shinnn/gh-post.svg?branch=master)](https://travis-ci.org/shinnn/gh-post)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/gh-post.svg)](https://coveralls.io/github/shinnn/gh-post?branch=master)

A [Node.js](https://nodejs.org/) module to create a POST request to GitHub GraphQL API v4

```javascript
const getMode = require('gh-post');

(async () => {
  const mode = getMode('index.js'); //=> 33188
  mode.toString(8); //=> '100644'
})();
```

## Installation

[Use](https://docs.npmjs.com/cli/install) [npm](https://docs.npmjs.com/getting-started/what-is-npm).

```
npm install gh-post
```

## API

```javascript
const getMode = require('gh-post');
```

### getMode(*path* [, *option*])

*path*: `string` `Buffer` `URL` (file, directory or symbolic link path)  
*option*: `Object`  
Return: `Promise<Integer>`

#### option.followSymlinks

Type: `boolean`  
Default: `false`

Whether to resolve all symbolic links before checking the mode, or get the mode of the symbolic link file itself.

```javascript
(async () => {
  (await getMode('./symlink-to-directory')).toString(8);
  //=> '120755'

  (await getMode('./symlink-to-directory', {followSymlinks: true})).toString(8);
  //=> '40755'
})();
```

## License

Copyright (c) 2015 - 2016 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).
