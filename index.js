'use strict';

const ghGet = require('gh-get');

module.exports = async function ghPost(...args) {
	const argLen = args.length;

	if (argLen !== 2) {
		throw new RangeError(`Expected 2 arguments (<string>, <Object>), but got ${
			argLen === 0 ? 'no' : argLen
		} arguments.`);
	}

	return ghGet(args[0], Object.assign({}, args[1], {method: 'POST'})); // eslint-disable-line prefer-object-spread
};
