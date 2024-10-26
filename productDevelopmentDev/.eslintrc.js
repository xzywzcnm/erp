module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: ["eslint:recommended", "plugin:vue/essential"],
//   globals: {
//     Atomics: "readonly",
//     SharedArrayBuffer: "readonly",
//   },
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2018,
    sourceType: "module",
  },
  plugins: ["vue"],
  rules: {
    // 开发环境可以使用控制台
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    // 开发环境可以使用调试
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    'no-nested-ternary': 'off',//禁止使用嵌套的三目运算
    // 强制在对象字面量的属性中键和值之间使用一致的间距
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
    ],
    "generator-star-spacing": "off", // // 强制 generator 函数中 * 号周围使用一致的空格
    "vue/experimental-script-setup-vars": "off", //
    'eqeqeq': 'off', // 关闭全等检测
    "no-callback-literal": 0,
    // allow semicolon
    // 'semi': [2, 'always'], // 要求或禁止使用分号而不是 ASI（这个才是控制行尾部分号的，
    semi: 0,
    // "no-irregular-whitespace": "off",//不能有不规则的空格
    // "no-multi-spaces": 0,//不能用多余的空格
    'eqeqeq': 'off', // 关闭全等检测
    "no-tabs": "off", // 禁用 tab
    camelcase: [0, { properties: "always" }], // 是否强制使用驼峰
    "no-template-curly-in-string": "off", // 禁止在常规字符串中出现模板字面量占位符语法
    "no-inner-declarations": "off", // 禁止 RegExp 构造函数中无效的正则表达式字符串
    "vue/no-mutating-props": 'off', // 关闭 直接改变 props 值检测规则(原则上是不可以这样用，因为对 prop 的内容进行了修改，违反了单向数据流原则)
    "no-useless-escape": 'off', // 关闭转义字符串、模板文字和正则表达式中的非特殊字符检测规则
    "vue/no-parsing-error": [
      2,
      {
        "x-invalid-end-tag": false,
        'invalid-first-character-of-tag-name': false,
      }
    ], // 有些便签自闭合
    // 忽略方法参数未使用
    'no-unused-vars': [
      // 'error', { 'vars': 'all', 'args': 'after-used', 'ignoreRestSiblings': false }
      'error', { 'vars': 'all', 'args': 'none', 'ignoreRestSiblings': false }
    ],
    "vue/no-template-key": "off", // 禁止template 使用key
    // "no-unused-vars": "off",
    // allow debugger during development
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
  },
};
