export default { // paypal相关
  get_paypalList: '/setting-service/paypalAccount/query', // paypal账号分页
  add_paypalAccount: '/setting-service/paypalAccount', // 添加paypal账号
  auth_paypal: '/setting-service/paypalAccount/authorize', // 验证授权
  del_paypalAccount: '/setting-service/paypalAccount/' //  +id 删除paypal账号
};
