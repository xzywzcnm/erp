/**
 * @Description: 正则匹配的整理归纳
 * @author jing
 * @date: 2020/10/9 15:11
 * @params:
 * 使用方法-例： this.$regular.isPhone
 */

let regular = {
  isPhone: /^1[34578]\d{9}$/g, // 校验手机号  /^([0-9]{3,4}-)?[0-9]{7,8}$/ /^\d{3,4}-\d{7,8}(-\d{3,4})?$/g
  isMob: /^((\+?86)|(\(\+86\)))?(1[1-9][0-9]{9})$/,
  maxNumber_25: /^\d{0,25}$/, // 请输入0-25位数字
  MatchChinese: /^[\u2E80-\u9FFF]+$/, // 只允许输入中文
  MatchEnglish: /^[a-zA-Z]+$/, // 只允许输入英文
  AllNumber: /^\d+$/, // 只允许数字
  hasPriceNum: /^\d*[.]?\d{1,2}$/, // 价格必须为数字,且最多允许两位小数
  NoDecima: /^\d+\.\d+$/, // 不能为小数
  isMailbox: /^[a-zA-Z0-9]+([_.-][a-zA-Z0-9]+)*@([a-zA-Z0-9_-]+[-_.]?[.])+[a-zA-Z]{2,3}$/, // 校验邮箱
  postalCode: /^[0-9]{6}$/, // 邮政编码
  integer: /^[0-9]+.?[0-9]*$/, // 大于0的整数
  fixedTelephone: /^\d{3,5}-\d{7,8}(-\d{3,5})?$/g, // 固定电话
  enterPhone: /^[\d-]*$/, // package.vue
  spuRegExp: /^[0-9#&+-./A-Z[\]^_a-z}{~ ]{0,100}$/, // product_mixin.js
  priceReg: /^\d*(\.)?(\d{1,2})?$/, // 该选项必须为数字
  enterCode: /^([a-zA-Z])([a-zA-Z0-9]*$)/, // 代号
  onlyLettersMessage: /^\w{3,30}$/, // 只允许输入字母、数字、下划线，长度在3-30位
  warelocateTip: /^[0-9#&+-./A-Z[\]^_a-z}{~ ]{0,100}$/, // 库位名称只能包含只能包含以下字符 0-9, #, &, +, -, ., /, A-Z, [, ], ^, _,
  // a-z, {, }, , ~
  specialCharacters: /^[\u4E00-\u9FA5A-Za-z0-9_]+$/ // 只能使用中文，大小写字母，数字，下划线
};
export default regular;
