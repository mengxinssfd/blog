module.exports = {
  /* 优先级低于parse的语法解析配置 */
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // typescript-eslint推荐规则
    'prettier',
    'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  rules: {
    // 禁止使用 var
    'no-var': 'error',
    // 使用结尾分号
    semi: 'off',
    'no-case-declarations': 'off',
    // 优先使用 interface 而不是 type
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-this-alias': 'off',
  },
  overrides: [
    {
      files: ['apps/front/**/*.vue'],
      /* 指定如何解析语法。 */
      parser: 'vue-eslint-parser',
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:prettier/recommended',
        // vue nuxt
        '@nuxtjs/eslint-config-typescript',
        'plugin:nuxt/recommended',
        'plugin:vue/vue3-recommended',
      ],
      rules: {
        // 使用结尾分号
        semi: 'off',
        'vue/no-v-model-argument': 'off',
        'vue/html-indent': [
          'error',
          2,
          {
            attribute: 1,
            baseIndent: 1,
            closeBracket: 0,
            alignAttributesVertically: true,
            ignores: [],
          },
        ],
        'vue/max-attributes-per-line': [
          'error',
          {
            singleline: 10,
            multiline: 1,
          },
        ],
        'vue/multi-word-component-names': 'off',
      },
    },
    {
      files: ['**/__tests__/**'],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
};
