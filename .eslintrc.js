module.exports = {
    extends: './node_modules/@megafon/frontend-presets/eslint',
    settings: {
        'import/resolver': {
            node: {
                paths: ['src'],
                extensions: ['.ts', '.tsx'],
            },
            'eslint-import-resolver-typescript': true,
        },
    },
};
