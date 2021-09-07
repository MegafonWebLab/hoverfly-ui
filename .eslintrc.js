module.exports = {
    extends: './node_modules/@megafon/frontend-presets/eslint',
    rules: {
        'react/react-in-jsx-scope': ['off'],
        'no-param-reassign': ['off'],
    },
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
