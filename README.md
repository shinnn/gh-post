# gh-post

[![NPM version](https://img.shields.io/npm/v/gh-post.svg)](https://www.npmjs.com/package/gh-post)
[![Build Status](https://travis-ci.org/shinnn/gh-post.svg?branch=master)](https://travis-ci.org/shinnn/gh-post)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/gh-post.svg)](https://coveralls.io/github/shinnn/gh-post?branch=master)
[![Dependency Status](https://david-dm.org/shinnn/gh-post.svg)](https://david-dm.org/shinnn/gh-post)
[![devDependency Status](https://david-dm.org/shinnn/gh-post/dev-status.svg)](https://david-dm.org/shinnn/gh-post#info=devDependencies)

A [Node](https://nodejs.org/) module to create a [`POST`](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9.5) request to the [Github API](https://developer.github.com/v3/)

```javascript
const ghPost = require('gh-post');

ghPost('gists', {
  headers: {
    'user-agent': 'your application name'
  },
  token: 'your access token',
  body: {
    files: {
      'file1.txt': {
        content: 'Hi'
      }
    }
  }
}).then(response => {
  response.headers.status; //=> '201 Created'
  response.headers.location; //=> for example 'https://api.github.com/gists/6ba9f11f4e1acf13645'
});
```

## Installation

[Use npm.](https://docs.npmjs.com/cli/install)

```
npm install gh-post
```

## API

```javascript
const ghPost = require('gh-post');
```

### ghPost(*url* [, *options*])

*url*: `String` ("path" part of a Github API URL)  
*options*: `Object` ([`gh-get` options](https://github.com/shinnn/gh-get#options))  
Return: `Object` ([`Promise`](https://promisesaplus.com/) instance)

Almost the same as [gh-get](https://github.com/shinnn/gh-get), except that the `method` option defaults to `'POST'` and unchangable.

## License

Copyright (c) 2015 - 2018 [Shinnosuke Watanabe](https://github.com/shinnn)

Licensed under [the MIT License](./LICENSE).
