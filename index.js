'use strict';

const {inspect} = require('util');

const inspectWithKind = require('inspect-with-kind');
const Fettuccine = require('fettuccine-class');
const loadGithubToken = require('load-gh-token');

const GUIDE_URL = 'https://developer.github.com/v4/guides/forming-calls/';
const TOKEN_ERROR = 'Expected `token` option to be a valid Github access token';
const UNSUPPORTED_OPTIONS = ['body', 'headers'];
const positionRe = /at \[\d+, \d+\]$/u;

function setCode(obj, value) {
	Object.defineProperty(obj, 'code', {
		value,
		enumerable: true
	});
}

function graphQlErrorToString({message, locations}) {
	return `${message}${
		positionRe.test(message) || !locations ? '' : ` (${
			locations.map(({line, column}) => `${line}:${column}`).join(',')
		})`
	}`;
}

function toErrorLine({message, locations}, index) {
	return `${index + 1}. ${graphQlErrorToString({message, locations})}`;
}

const instance = new Fettuccine({
	headers: {
		accept: 'application/json'
	},
	frozenOptions: new Set(['baseUrl', 'resolveUnsuccessfulResponse'])
});

module.exports = async function ghPost(...args) {
	const argLen = args.length;

	if (argLen !== 1 && argLen !== 2) {
		throw new RangeError(`Expected 1 or 2 arguments (<string>[, <Object>]), but got ${
			argLen === 0 ? 'no' : argLen
		} arguments.`);
	}

	const [query, options = {}] = args;

	if (typeof query !== 'string') {
		const error = new TypeError(`Expected a GraphQL query for Github API (<string>), but got a non-string value ${
			inspectWithKind(query)
		}.`);
		setCode(error, 'ERR_INVALID_ARG_TYPE');

		throw error;
	}

	if (query.trim().length === 0) {
		const error = new Error(`Expected a valid GraphQL query for Github API, but got ${
			query.length === 0 ? '\'\' (empty string)' : `a whitespace-only string ${inspect(query)}`
		}. At least one operation, either query or mutation, must be specified. ${GUIDE_URL}#about-query-and-mutation-operations`);
		setCode(error, 'ERR_INVALID_ARG_VALUE');

		throw error;
	}

	const {token} = options;

	if (argLen === 2) {
		for (const option of UNSUPPORTED_OPTIONS) {
			const val = options[option];

			if (val !== undefined) {
				throw new Error(`\`${option}\` option is not configurable, but a value ${inspect(val)} was provided.`);
			}
		}

		if (token !== undefined) {
			if (typeof token !== 'string') {
				throw new TypeError(`Expected \`token\` option to be a <string>, but got a non-string value ${
					inspectWithKind(token)
				}.`);
			}

			if (token.length === 0) {
				throw new Error(`${TOKEN_ERROR}, but got '' (empty string).`);
			}

			if (token.trim().length === 0) {
				throw new Error(`${TOKEN_ERROR}, but got a whitespace-only string ${inspect(token)}.`);
			}

			const lineNum = token.split('\n').length;

			if (lineNum !== 1) {
				throw new Error(`${TOKEN_ERROR}, but got a ${lineNum}-line string ${
					inspect(token)
				}. A token must be a single line string.`);
			}
		}
	}

	const newOptions = {
		...options,
		headers: {authorization: `bearer ${token}`},
		body: JSON.stringify({query})
	};

	try {
		newOptions.headers.authorization = `bearer ${await loadGithubToken()}`;
	} catch (err) {
		if (err.code === 'ERR_NO_GITHUB_TOKEN' && !options.token) {
			err.message += ' Prepare one of them or pass `token` option in your program, ';
			err.message += 'as GitHub GraphQL API v4 requires a user to be authenticated. ';
			err.message += `${GUIDE_URL}#authenticating-with-graphql`;

			throw err;
		}
	}

	let json;
	let response;

	try {
		response = await instance.post('https://api.github.com/graphql', newOptions);
		json = await response.json();
	} catch (err) {
		response = err.response;

		if (response && /application\/json/u.test(response.headers.get('content-type'))) {
			json = await response.json();
		} else {
			throw err;
		}

		const error = new Error(`${response.status} ${response.statusText} (${json.message})`);
		Object.defineProperty(error, 'response', {value: response});

		throw error;
	}

	if (json.errors !== undefined) {
		const {errors} = json;
		const message = errors.length === 1 ? graphQlErrorToString(errors[0]) : `${errors.length} errors returned:
${errors.map(toErrorLine).join('\n')}`;
		const error = new Error(message);

		Object.defineProperties(error, {
			code: {
				value: 'ERR_INVALID_QUERY',
				enumerable: true
			},
			errors: {
				value: errors
			},
			response: {
				value: response
			}
		});

		throw error;
	}

	Object.defineProperty(json.data, 'response', {value: response});
	return json.data;
};
