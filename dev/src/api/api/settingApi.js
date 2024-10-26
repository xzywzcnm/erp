// 设置中心
const settingService = {
  // 新增店铺-自动添加店铺超级管理员店铺权限
  addStore: '/storeSuperAdministrator/addStore',
  // 偏远地区费用模板 - 列表查询接口  post http://192.168.91.7:882/project/343/interface/api/15389
  queryRemoteAreaCostTemplateList: '/templateInfo/queryRemoteAreaCostTemplateList',
  // 偏远地区费用模板 - 详情查询接口 /{id} post http://192.168.91.7:882/project/343/interface/api/15393
  queryRemoteAreaCostTemplateDetail: '/templateInfo/queryRemoteAreaCostTemplateDetail',
  // 偏远地区费用模板 - 新增接口  post http://192.168.91.7:882/project/343/interface/api/15401
  insertRemoteAreaCostTemplate: '/templateInfo/insertRemoteAreaCostTemplate',
  // 偏远地区费用模板 - 修改接口 post http://192.168.91.7:882/project/343/interface/api/15397
  updateRemoteAreaCostTemplate: '/templateInfo/updateRemoteAreaCostTemplate',
  // 偏远地区费用模板 - 获取所有物流商及物流方式接口 get
  queryEnableCarriersAndShippingMethod: '/carrier/queryEnableCarriersAndShippingMethod',
  // 偏远地区费用模板 - 修改偏远的地区费用模板状态 post /{id}?status=1  http://192.168.91.7:882/project/343/interface/api/15405
  updateRemoteAreaCostTemplateStatus: '/templateInfo/updateRemoteAreaCostTemplateStatus',
  // 查询temu店铺主体  http://192.168.91.7:882/project/343/interface/api/15587
  developerList: '/saleAccount/temu/developerList',

  // wb 店铺添加新绑定 http://192.168.91.7:882/project/343/interface/api/16006
  createWb: '/wbAccount/create',
  // wb 店铺编辑/授权 http://192.168.91.7:882/project/343/interface/api/16010
  editWb: '/wbAccount/edit',
}
// 客服管理-自动回复
const replyTemplate = {
  // 新增模板 http://192.168.91.7:882/project/363/interface/api/15982
  add: '/replyTemplate/add',
  // 编辑 http://192.168.91.7:882/project/363/interface/api/15984
  edit: '/replyTemplate/edit',
  // 分页查询 http://192.168.91.7:882/project/363/interface/api/15985
  queryAll: '/replyTemplate/queryAll',
  // 上传图片 http://192.168.91.7:882/project/363/interface/api/15986
  uploadPicture: '/replyTemplate/uploadPicture',
  // 启用模板 http://192.168.91.7:882/project/363/interface/api/15987
  enable: '/replyTemplate/enable',
  // 停用模板 http://192.168.91.7:882/project/363/interface/api/15988
  stop: '/replyTemplate/stop',
  // 详情 http://192.168.91.7:882/project/363/interface/api/15989
  detail: '/replyTemplate/detail'
}

let settingApi = {};
const handApi = (base, baseKey, apiData) => {
  if (!baseKey) {
    for (let key in apiData) {
      settingApi[key] = `${base}${apiData[key]}`;
    }
  } else {
    settingApi[baseKey] = {};
    for (let key in apiData) {
      settingApi[baseKey][key] = `${base}${apiData[key]}`;
    }
  }
}

handApi('/setting-service', 'settingService', settingService);
handApi('/cs-service', 'replyTemplate', replyTemplate);

export default settingApi;
