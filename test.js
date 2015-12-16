'use strong';

const ghPost = require('.');
const test = require('tape');

process.env.GITHUB_TOKEN = '';

test('ghPost()', t => {
  t.plan(2);

  t.equal(ghPost.name, 'ghPost', 'should have a function name.');

  ghPost('lipsum', {
    headers: {
      'user-agent': 'Shinnosuke Watanabe https://github.com/shinnn'
    },
    verbose: true,
    token: process.env.TOKEN_FOR_TEST
  }).then(t.fail, err => {
    t.strictEqual(err.response.request.method, 'POST', 'should create a POST request.');
  }).catch(t.fail);
});
