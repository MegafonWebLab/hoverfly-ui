module.exports = {
    extends: './node_modules/@megafon/frontend-presets/eslint',
    rules: {
        'react/react-in-jsx-scope': ['off'],
        'no-param-reassign': ['off'],
        'react/jsx-no-bind': [
            'error',
            {
                allowFunctions: true,
            },
        ],
        'import/order': [
            'error',
            {
                groups: ['builtin', 'external', 'internal'],
                pathGroups: [
                    {
                        pattern: 'react',
                        group: 'external',
                        position: 'before',
                    },
                ],
                pathGroupsExcludedImportTypes: ['react'],
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true,
                },
            },
        ],
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
