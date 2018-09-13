'use strong';

const ghPost = require('.');
const test = require('tape');

process.env.GITHUB_TOKEN = '';

test('ghPost()', async t => {
	try {
		await ghPost('lipsum', {
			userAgent: 'Shinnosuke Watanabe https://github.com/shinnn',
			verbose: true,
			token: process.env.TOKEN_FOR_TEST
		});
		t.fail('Unexpectedly succeeded.');
	} catch ({response}) {
		t.equal(response.request.method, 'POST', 'should create a POST request.');
	}

	try {
		await ghPost();
		t.fail('Unexpectedly succeeded.');
	} catch (err) {
		t.equal(
			err.toString(),
			'RangeError: Expected 2 arguments (<string>, <Object>), but got no arguments.',
			'should fail when it takes no arguments.'
		);
	}

	try {
		await ghPost(1, 2, 3);
		t.fail('Unexpectedly succeeded.');
	} catch (err) {
		t.equal(
			err.toString(),
			'RangeError: Expected 2 arguments (<string>, <Object>), but got 3 arguments.',
			'should fail when it takes too many arguments.'
		);
	}

	t.end();
});
