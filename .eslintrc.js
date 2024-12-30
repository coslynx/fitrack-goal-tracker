module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        jsx: true,
    },
    env: {
        browser: true,
        node: true,
        es6: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:prettier/recommended',
    ],
    plugins: [
        '@typescript-eslint',
        'react',
        'prettier'
    ],
    rules: {
        'react/react-in-jsx-scope': 'off',
        "prettier/prettier": ["error", {
            "semi": false,
            "tabWidth": 4,
            "singleQuote": true,
            "trailingComma": "all",
            "printWidth": 100
        }]
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};