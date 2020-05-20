/* .eslintrc.js */
module.exports = {
    'extends': 'airbnb',
    "env": {
        "browser": true,
        "commonjs": true,
        "amd": true,
        "es6": true
    },
    'plugins': [
        'react'
    ],
    'parser': 'babel-eslint',
    'rules': {
        'semi': [2, 'never'],
        'indent': [2, 4],
        'react/jsx-filename-extension': [0, { 'extensions': ['.js', '.jsx'] }],
        'jsx-a11y/no-static-element-interactions': 1,
        'react/jsx-indent-props': [2, 4],
        'react/jsx-indent': [2, 4],
        'import/no-extraneous-dependencies': 1,
        'react/jsx-boolean-value': [2, 'always'],
        'arrow-parens': [2, 'as-needed'],
        "linebreak-style": 0
    },
};