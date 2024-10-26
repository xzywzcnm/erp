/*
 * @Author: w
 * @Date: 2021-05-29 10:21:40
 * @LastEditors: w
 * @LastEditTime: 2021-06-12 16:19:31
 */
export default { // 公共接口
  get_erpConfig: '/erpCommon/loadConfig', // 订单
  upload_files: './erpCommon/uploadFiles',
  product_ueditor_enter: '/product-service/erpCommon/ueditorEnter',
  check_singleSaleAccountList: './platform/list', // 查询该商户下所有平台列表
  get_plateFormList: '/order-service/erpCommon/common-service/getPlatformList',
  get_shopList: '/setting-service/saleAccount/getSaleAccounts', // 查询店铺列表
  get_saleAccountById: './erpCommon/setting-service/saleAccount/getSaleAccountsByIds', // 根据店铺主键列表查询店铺列表
  get_saleAccountByIdNew: './erpCommon/setting-service/saleAccount/getSaleAccountsByIdList', // 根据店铺主键列表查询店铺列表
  // 临时新加处理url太长
  upload_URlFiles: './erpCommon/uploadNetworkFiles', // 上传网络图片
  get_commonCountry: '/country/queryZoneCountry', // 获取国家接口

  get_productBrandcommon: './erpCommon/product-service/productBrand/query', // 查询
  getAll_productBrandcommon: './erpCommon/product-service/productBrand/queryAll' // 查询
};
