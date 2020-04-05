module.exports = {
	root: true,
	extends: '@conduitry',
	parserOptions: { sourceType: 'script', ecmaFeatures: { globalReturn: true } },
	env: { node: false },
	globals: { GM: 'readable', unsafeWindow: 'readable' },
};
