// https://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  parserOptions: {
    parser: "babel-eslint",
    ecmaVersion: 6,
  },
  env: {
    browser: true,
    node: true,
    jquery: true,
  },
  extends: ["plugin:vue/essential", "standard"],
  // extends: [
  //   "eslint:recommended",
  //   'plugin:vue/recommended',
  //   "plugin:prettier/recommended",
  //   "prettier/vue"
  // ],
  plugins: ["vue"],
  rules: {
    // 开发环境可以使用控制台
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    // 开发环境可以使用调试
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-nested-ternary": "off", //禁止使用嵌套的三目运算
    // allow async-await
    indent: [
      "error",
      2,
      {
        SwitchCase: 1,
        ignoredNodes: ["ConditionalExpression"],
        FunctionExpression: {
          body: 1,
          parameters: 2,
        },
      },
    ], // // 强制在对象字面量的属性中键和值之间使用一致的间距
    "generator-star-spacing": "off", // // 强制 generator 函数中 * 号周围使用一致的空格
    eqeqeq: "off", // 关闭全等检测
    // allow semicolon
    "no-callback-literal": 0,
    // 'semi': [2, 'always'], // 要求或禁止使用分号而不是 ASI（这个才是控制行尾部分号的，
    semi: 0, // 结尾不检查分号
    "no-tabs": "off", // 禁用 tab
    camelcase: [0, { properties: "always" }], // 是否强制使用驼峰
    "lines-between-class-members": "off", // 要求或禁止类成员之间出现空行
    "no-template-curly-in-string": "off", // 禁止在常规字符串中出现模板字面量占位符语法
    "no-mixed-spaces-and-tabs": "off", // 禁止空格和 tab 的混合缩进
    "no-inner-declarations": "off", // // 禁止 RegExp 构造函数中无效的正则表达式字符串
    // 有些便签自闭合
    "vue/no-parsing-error": [2,
      {
        "unexpected-character-in-attribute-name": false,
        "missing-whitespace-between-attributes": false,
        "x-invalid-end-tag": false,
        "invalid-first-character-of-tag-name": false
      }
    ],
    // 忽略方法参数未使用
    "no-unused-vars": [
      // 'error', { 'vars': 'all', 'args': 'after-used', 'ignoreRestSiblings': false }
      "error",
      { vars: "all", args: "none", ignoreRestSiblings: false },
    ],
    "vue/no-template-key": "off", // 禁止template 使用key
    "vue/valid-v-model": "off", //临时关闭，table-head.vue 使用到，后续修改
    "space-before-function-paren": "off", //函数前的空间
    quotes: "off", //强制一致使用反引号、双引号或单引号
    "comma-dangle": "off", //逗号悬垂
  },
};