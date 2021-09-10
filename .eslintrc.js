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
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'no-magic-numbers': [
            'error',
            {
                ignore: [0, 1],
                ignoreArrayIndexes: true,
                ignoreDefaultValues: true,
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
