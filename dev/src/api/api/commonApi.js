/**
 * @Description: 公共服务的接口，不同服务下的公用接口
 * @author jing
 * @date 2021/8/4 9:46
 * @params:
 */

const erpCommonApi = {
  // post_erpCommon_disableNoticeInfo: '/erpCommon/disableNoticeInfo', // 不再提醒版本迭代通知
  // get_erpCommon_queryNoticeInfo: '/erpCommon/queryNoticeInfo' // 查询版本迭代通知
};
// menuSetting
// location.pathname.includes()

const index = location.pathname.lastIndexOf('/');
const system = location.pathname.substring(0, index + 1);
for (let key in erpCommonApi) {
  if (system) {
    erpCommonApi[key] = `${system}${erpCommonApi[key]}`;
  }
}
let commonApi = Object.assign({}, erpCommonApi);
export default commonApi;
