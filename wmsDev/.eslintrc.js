// https://eslint.org/docs/user-guide/configuring
module.exports = {
    root: true,
    parserOptions: {
        parser: "babel-eslint",
        ecmaVersion: 6
    },
    env: {
        browser: true,
        jquery: true
    },
    extends: ["plugin:vue/essential", "standard"],
    plugins: ["vue"],
    rules: {
        // allow async-await
        indent: [
            "error",
            2,
            {
                SwitchCase: 1,
                ignoredNodes: ["ConditionalExpression"],
                FunctionExpression: {
                    body: 1,
                    parameters: 2
                }
            }
        ], // // 强制在对象字面量的属性中键和值之间使用一致的间距
        "generator-star-spacing": "off", // // 强制 generator 函数中 * 号周围使用一致的空格
        "no-callback-literal": 0,
        // allow semicolon
        // 'semi': [2, 'always'], // 要求或禁止使用分号而不是 ASI（这个才是控制行尾部分号的，
        quotes: "off",//单引号
        semi: 0,
        "prefer-promise-reject-errors": 0,
        eqeqeq: "off", // 关闭全等检测
        "no-useless-escape": "off", // 关闭转义字符串、模板文字和正则表达式中的非特殊字符检测规则
        "standard/no-callback-literal": "off",
        "no-tabs": "off", // 禁用 tab
        camelcase: [0, { properties: "always" }], // 是否强制使用驼峰
        "no-template-curly-in-string": "off", // 禁止在常规字符串中出现模板字面量占位符语法
        "no-inner-declarations": "off", // // 禁止 RegExp 构造函数中无效的正则表达式字符串
        "vue/no-parsing-error": [2, { "x-invalid-end-tag": false }], // 有些便签自闭合
        "vue/no-template-key": "off", // 禁止template 使用key
        "space-before-function-paren": "off",//在函数定义和左括号之前强制执行一致的间距
        // 忽略方法参数未使用
        "no-unused-vars": [
            // 'error', { 'vars': 'all', 'args': 'after-used', 'ignoreRestSiblings': false }
            "error",
            { vars: "all", args: "none", ignoreRestSiblings: false }
        ],
        "space-before-function-paren": "off",
        // allow debugger during development
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
        "comma-dangle": "off",//最后一个逗号不必删掉
        "eol-last": "off",//不必换行
    }
};
