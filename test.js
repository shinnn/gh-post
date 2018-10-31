'use strict';

const ghPost = require('.');
const test = require('tape');

test('ghPost()', async t => {
	t.plan(7);

	process.env.HTTPS_PROXY = 'https://example.org';

	try {
		await ghPost('query {}', {});
	} catch ({response}) {
		t.equal(
			response.status,
			400,
			'should fail when the request is unsuccessful.'
		);
	}

	delete process.env.HTTPS_PROXY;

	(async () => {
		t.deepEqual(
			await ghPost('query { repository(name: "gh-post", owner: "shinnn") { isPrivate } }'),
			{
				repository: {
					isPrivate: false
				}
			},
			'should create a request to GitHub API.'
		);
	})();

	(async () => {
		try {
			await ghPost('query {');
		} catch (err) {
			t.equal(
				err.toString(),
				'Error: Unexpected end of document',
				'should fail when the query is invalid.'
			);
		}
	})();

	(async () => {
		try {
			await ghPost('query { xxx { yyy } }');
		} catch (err) {
			t.equal(
				err.toString(),
				'Error: Field \'xxx\' doesn\'t exist on type \'Query\' (1:9)',
				'should fail when the requested type is not found.'
			);
		}
	})();

	(async () => {
		try {
			await ghPost('query { viewer { a, b} }');
		} catch (err) {
			t.equal(
				err.toString(),
				`Error: 2 errors returned:
1. Field 'a' doesn't exist on type 'User' (1:18)
2. Field 'b' doesn't exist on type 'User' (1:21)`,
				'should fail when the requested types are not found.'
			);
		}
	})();

	delete process.env.GITHUB_TOKEN;

	try {
		await ghPost('query {}');
	} catch ({message}) {
		t.ok(
			message.includes(' GitHub GraphQL API v4 requires a user to be authenticated. '),
			'should fail when it cannot find valid Github access token.'
		);
	}

	try {
		await ghPost('query {}', {token: 'abcdefghijklmnopqrstuvwxyzabcd'});
	} catch (err) {
		t.equal(
			err.toString(),
			'Error: 401 Unauthorized (Bad credentials)',
			'should include API response body to the error message if available.'
		);
	}
});

test('Argument validation', async t => {
	async function getError(...args) {
		try {
			return await ghPost(...args);
		} catch (err) {
			return err;
		}
	}

	t.equal(
		(await getError(new Uint8ClampedArray())).toString(),
		'TypeError: Expected a GraphQL query for Github API (<string>), but got a non-string value Uint8ClampedArray [].',
		'should fail when the first argument is not a string.'
	);

	t.ok(
		(await getError('')).message.startsWith('Expected a valid GraphQL query for Github API, but got \'\' (empty string).'),
		'should fail when the first argument is an empty string.'
	);

	t.ok(
		(await getError('\t')).message.startsWith('Expected a valid GraphQL query for Github API, but got a whitespace-only string \'\\t\''),
		'should fail when the first argument is a whitespace-only string.'
	);

	t.equal(
		(await getError('{licenses{spdxId}}', {headers: []})).toString(),
		'Error: `headers` option is not configurable, but a value [] was provided.',
		'should fail when it takes an unsupported option.'
	);

	t.equal(
		(await getError('{licenses{spdxId}}', {token: new Set()})).toString(),
		'TypeError: Expected `token` option to be a <string>, but got a non-string value Set {}.',
		'should fail when `token` option is not a string.'
	);

	t.equal(
		(await getError('{licenses{spdxId}}', {token: ''})).toString(),
		'Error: Expected `token` option to be a valid Github access token, but got \'\' (empty string).',
		'should fail when `token` option is an empty string.'
	);

	t.equal(
		(await getError('{licenses{spdxId}}', {token: '\r'})).toString(),
		'Error: Expected `token` option to be a valid Github access token, but got a whitespace-only string \'\\r\'.',
		'should fail when `token` option is a whitespace-only string.'
	);

	t.ok(
		(await getError('{licenses{spdxId}}', {token: 'abc\ndef'})).message.endsWith('but got a 2-line string \'abc\\ndef\'. A token must be a single line string.'),
		'should fail when `token` option includes a newline character.'
	);

	t.equal(
		(await getError()).toString(),
		'RangeError: Expected 1 or 2 arguments (<string>[, <Object>]), but got no arguments.',
		'should fail when it takes no arguments.'
	);

	t.equal(
		(await getError('1', '2', '3')).toString(),
		'RangeError: Expected 1 or 2 arguments (<string>[, <Object>]), but got 3 arguments.',
		'should fail when it takes too many arguments.'
	);

	t.end();
});
