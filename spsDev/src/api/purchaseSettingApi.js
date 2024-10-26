const flag = '/sps-service';
export default {
  // 安全交期
  deliveryList: flag + '/sps/setting/delivery/list', // 安全交期设置-查询列表
  deliveryRemove: flag + '/sps/setting/delivery/remove', // 安全交期设置-删除
  deliveryDefault: flag + '/sps/setting/delivery/default', // 安全交期设置-查询默认交期
  deliverySave: flag + '/sps/setting/delivery/save', // 安全交期设置-保存安全交期
  deliverySet: flag + '/sps/setting/delivery/set', // 安全交期设置-设置安全交期默认值

  // 备货策略设置
  strategyInfo: flag + '/sps/setting/strategy/info', // 备货策略设置-查询详情
  strategyList: flag + '/sps/setting/strategy/list', // 备货策略设置-查询列表
  strategyRemove: flag + '/sps/setting/strategy/remove', // 备货策略设置-查询详情
  strategySave: flag + '/sps/setting/strategy/save', // 备货策略设置-保存策略

  // 采购基础设置
  procurementBaseSave: flag + '/sps/procurementBase/save', // 采购基础设置-保存

  // 采购设置-仓库收货地址
  addressList: flag + '/sps/setting/address/list', // 仓库地址列表（分页）
  addressSave: flag + '/sps/setting/address/save', // 保存仓库地址
  addressDel: flag + '/sps/setting/address/del', // 删除仓库地址
  addressBinding: flag + '/sps/setting/address/binding', // 绑定仓库
  addressUpdate: flag + '/sps/setting/address/update', // 修改其他地址
  addressDefault: flag + '/sps/setting/address/default', // 仓库默认地址
  // 获取第三方标签信息 http://192.168.91.7:882/project/273/interface/api/15061
  getOverseaTaglist: flag + '/erpCommon/product-service/productOverseaTagRel/api/list',
  // 根据sku获取对应标签绑定信息 http://192.168.91.7:882/project/273/interface/api/15133
  listByProductGoodsId: flag + '/erpCommon/product-service/productOverseaTagRel/api/listByProductGoodsId',
  // 判断当前商品是否都存在第三方标签id http://192.168.91.7:882/project/273/interface/api/15065
  // checkSkusInOverseaTag: flag + '/erpCommon/product-service/productOverseaTagRel/api/checkSkusInOverseaTag',
  checkNewOverseaTag: flag + '/erpCommon/product-service/productOverseaTagRel/api/checkNewOverseaTag',

  // 采购设置-账号设置
  getAccountList: flag + '/sps/setting/accountParam/queryParam', // 获取所有账号
  postQueryAccount: flag + '/sps/setting/accountParam/queryAccount', // 获取 1688 账号
  getAccountDetails: flag + '/sps/setting/accountParam/', // 查询单个账户的参数信息 /sps/setting/accountParam/{accountId}
  addAccount: flag + '/sps/setting/accountParam/addParam', // 添加账号
  deleteAccount: flag + '/sps/setting/accountParam/', // 删除仓库地址
  editAccount: flag + '/sps/setting/accountParam/updateParam', // 修改仓库
  getAuthorizedAddress: flag + '/sps/aliAccount/getAuthorizedAddress?accountId=', // 修改仓库
};