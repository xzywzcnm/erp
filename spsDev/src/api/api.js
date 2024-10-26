/*
 * @Author: w
 * @Date: 2021-09-02 09:41:33
 * @LastEditors: w
 * @LastEditTime: 2022-01-18 14:17:40
 */
import supplierManagementApi from './supplierManagementApi'; // 供应商管理
import purchaseManagementApi from './purchaseManagementApi'; // 采购管理
import purchaseSettingApi from './purchaseSettingApi'; // 采购设置
import qualityTest from './qualityTest'; // 质检管理
import baseApi from '@/api/baseApi';

const flag = '/sps-service';
const settingPrefix = '/setting-service';

const allApi = {
  globalApi: {
    service: '/sps-service',
    token_time: 540000,
    get_token: flag + '/auth/', // 根据ticket获得用户信息
    logOut: flag + '/logout/', // 登出
    refresh_token: flag + '/refresh/', // 延长token过期时间
    tokenToId: flag + '/tokenToId/', // 根据token获得用户信息
    supplierlist: flag + '/sps/api/suplier/query/list', // 供应商管理服务入口-获取供应商列表

    baseDataList: flag + '/sps/common/baseDataList', // 供应商管理服务入口-根据类型获取对应基础数据列表
    alibaba: flag + '/sps/common/account/alibaba', // 获取1688帐号列表
    submitSupplierOrder: flag + '/sps/purchase/submitSupplierOrder', // 向供应商下单
    brandList: flag + '/sps/common/brandList', // 供应商管理服务入口-获取商品品牌列表
    categoryList: flag + '/sps/common/categoryList', // 供应商管理服务入口-获取商品分类列表
    categoryGoodsList: flag + '/erpCommon/product-service/productGoods/api/query', // 根据分类id查询商品列表
    get_queryByGoodsIds: flag + '/erpCommon/product-service/productGoods/api/queryByProductGoodsIds', // 批量查询商品集合
    amazonListing: flag + '/sps/common/amazonListing', // 新建FBI备货计划 查询商品列表
    get_expressage: flag + '/sps/common/expressage', // 运输方式
    userList: flag + '/erpCommon/setting-service/userInfo/getAllUser', // 供应商管理服务入口-获取用户列表
    get_menuResource: flag + '/erpCommon/setting-service/menuResource/all', // 获取自定义菜单
    commodityDeveloper: flag + '/erpCommon//setting-service/userInfo/queryByBusinessRoleType/commodityDeveloper', // 开发人员
    userInfo: flag + '/sps/common/userInfo', // 供应商管理服务入口-获取用户详情
    allCity: flag + '/erpCommon/common-service/city/queryByStateId', // 基础数据—城市列表
    province: flag + '/erpCommon/common-service/state/queryByCountryId', // 基础数据—省份列表
    country: flag + '/erpCommon/common-service/country/query', // 基础数据—国家列表
    goodsList: flag + '/sps/common/categoryGoodsList', // 供应商管理服务入口-获取商品明细列表
    collectData: flag + '/sps/common/collectData', // 采集数据
    allGoodsCategory: flag + '/sps/common/allGoodsCategory', // 查询所有商品分类
    warehouseUser: flag + '/erpCommon/wms-service/wmsWarehouse/queryUserAllwarehouse', // 获取所有仓库列表
    warehouse: flag + '/erpCommon/wms-service/wmsWarehouse/queryAllUserWarehouse', // 获取所有仓库列表
    allWarehouseList: flag + '/erpCommon/wms-service/wmsWarehouse/warehouse/list', // 获取所有仓库(可用不可用)列表
    label: flag + '/sps/common/label', // 获取标签列表
    warehouseType: flag + '/sps/common/warehouseType', // 获取仓库类型
    getCurrencyDropdownList: flag + '/sps/data/getCurrencyDropdownList', // 查询币种下拉框基础数据
    get_menus: flag + '/erpCommon/common-service/subsystem/query', // 查询子系统
    loadConfig: flag + '/erpCommon/loadConfig', // 图片前缀
    purchaseReceiveRecordQuery: flag + '/purchaseReceiveRecord/query', // 采购单管理-查询采购单收货记录
    get_suplier: flag + '/sps/api/suplier/query/list', // 采购单管理-查询采购单收货记录
    planBatchImport: flag + '/sps/plan/batchImport', // 备货计划-导入商品
    userInfoName: settingPrefix + '/userInfo/',
    get_menuRole: flag + '/erpCommon/setting-service/userInfo/queryMenu', // 查询用户菜单
    purchaseImport: flag + '/sps/purchase/batchImport', // 导入物流信息
    applyPayment: flag + '/sps/purchase/applyPayment', // 采购单管理-支付申请
    applyRefund: flag + '/sps/purchase/applyRefund', // 采购单管理-退款申请

    get_purchasePaymentInfo: flag + '/purchasePaymentInfo/query', // 采购单付款管理-采购单付款列表
    put_batchConfirm: flag + '/purchasePaymentInfo/batchConfirm', // 采购单付款管理-批量确认付款
    put_checkPass: flag + '/purchasePaymentInfo/check',  //采购单付款管理-审核通过
    purchasePaymentInfo_cancel: flag + '/purchasePaymentInfo/cancel', // 采购单付款管理-取消付款
    export_purchasePaymentInfo: flag + '/purchasePaymentInfo/export', // 采购单付款管理-导出采购单付款列表
    put_purchasePaymentInfo: flag + '/purchasePaymentInfo', // 采购单付款管理-确认付款

    get_purchaseRefundInfo: flag + '/purchaseRefundInfo/query', // 采购单退款管理-采购单退款列表
    put_refundBatchConfirm: flag + '/purchaseRefundInfo/batchConfirm', // 采购单退款管理-批量确认退款
    put_checkRefundPass: flag + '/purchaseRefundInfo/check',  //采购单退款管理-审核通过
    purchaseRefundInfo_cancel: flag + '/purchaseRefundInfo/cancel', // 采购单退款管理-取消退款
    export_purchaseRefundInfo: flag + '/purchaseRefundInfo/export', // 采购单退款管理-导出采购单退款列表
    put_purchaseRefundInfo: flag + '/purchaseRefundInfo', // 采购单付款管理-确认付款

    post_paymentUrl: flag + '/sps/purchase/paymentUrl', // 1688 付款
    post_aliPayLink: flag + '/purchasePaymentInfo/aliPayLink', // 获取1688支付链接
    post_crossBorderPayLink: flag + '/purchasePaymentInfo/crossBorderPayLink', //获取跨境宝支付链接
    export_planByIds: flag + '/sps/plan/exportByIds', // 导出选中备货计划
    export_purchaseCancel: flag + '/sps/purchaseCancel/export', // 备货计划-采购取消记录导出
    export_requirementByIds: flag + '/sps/requirement/exportByIds', // 导出选中采购需求
    export_purchaseByIds: flag + '/sps/purchase/exportByIds', // 导出选中采购单
    export_exportPurchaseByIds: flag + '/sps/purchase/exportPurchaseByIds', // 导出选中采购单excel
    export_exportPurchase: flag + '/sps/purchase/exportPurchase', // 导出所有采购单excel
    query_taskData: flag + '/erpCommon/queryTask', // 查询任务数据列表
    get_currencyInfo: flag + '/erpCommon/common-service/currencyInfo/query', // 获取币种
    purchaseRemark: flag + '/purchaseRemark', // 采购单 保存备注

    add_label: flag + '/erpCommon/product-service/productTag', // 添加标签
    get_label: flag + '/erpCommon/product-service/productTag/queryAll', // 查看标签
    del_label: flag + '/sps/purchaseTag/', //  +productTagId 删除标签
    get_labelNames: flag + '/erpCommon/product-service/productTag/queryTagNames', // 查看标签名称
    edit_labelNames: flag + '/erpCommon/product-service/productTag/tag/', // 编辑标签名称 put
    export_tag: flag + '/erpCommon/product-service/productTag/export', // 导出标签
    get_tagNum: flag + '/erpCommon/product-service/productTag/productCount', // 获取标签对应的产品数量
    get_TagName: flag + '/sps/purchaseTag/queryTagNames', // 获取商品标签的数据
    get_TotalNumber: flag + '/sps/purchase/getPurchaseInfos', // 获取已入库商品总金额

    // 全托管退货数据
    get_temuStore: flag + '/sps/return/temu/store', // 获取temu店铺权限信息
    query_list: flag + '/sps/return/list', // 全托管退货数据管理-获取列表信息
    get_temuDetailList: flag + '/sps/return/detail', // 全托管退货数据管理-获取temu明细列表信息
    export_temuList: flag + '/sps/return/temu/export', // 全托管退货数据管理-temu导出
    upload_files: flag + '/erpCommon/uploadFiles', // 图片上传
    get_logistics: flag + '/erpCommon/sps-service/sps/despatch/logistics', // 获取物流商(快递公司)
    get_refundAddress: flag + '/wmsReceiptBatchCheck/getRefundAddress', // 创建处理单-获取供应商退货地址
    update_Return: flag + '/sps/return/updateReturn',  // 全托管退货管理-更新退货单状态
    create_refundHandle: flag + '/sps/return/createRefundHandle', // 全托管退货管理-创建处理单
    cancel_refundHandle: flag + '/sps/return/cancelRefundHandle', // 全托管退货管理-作废处理单
    view_refundHandle: flag + '/sps/return/viewRefundHandle', // 全托管退货管理-查看处理单
    batchUpdateCheckInfo: flag + '/sps/return/batchUpdateCheckInfo', // 批量获取质检资料

    // 供应商询价管理
    save_supplierInquiry: flag + '/sps/supplierInquiryManage/saveSupplierInquiry', // 供应商询价管理-新增
    update_supplierInquiry: flag + '/sps/supplierInquiryManage/updateSupplierInquiry', // 供应商询价管理-编辑
    get_supplierInquiryDetail: flag + '/sps/supplierInquiryManage/getSupplierInquiryDetail', // 供应商询价管理-详情
    query_productGoodsDetail: flag + '/erpCommon/product-service/productGoods/api/queryProductGoodsDetail', // 供应商询价管理-根据skc和productId查询
    update_supplierInquiryStatus: flag + '/sps/supplierInquiryManage/updateSupplierInquiryStatus',  // 供应商询价管理-更新状态
    query_supplierInquiryList: flag + '/sps/supplierInquiryManage/querySupplierInquiryList', // 供应商询价管理-分页查询
    export_Bom: flag + '/sps/supplierInquiryManage/exportBom', //  供应商询价管理-BOM表导出

    //1688商品配对
    ali_getList: flag + '/sps/aliProduct/query', // 获取1688商品配对列表
    ali_addProduct: flag + '/sps/aliProduct/addProduct', // 更改配对
    ali_batchAddProduct: flag + '/sps/aliProduct/batchAddProduct', // 添加商品
    ali_querySku: flag + '/erpCommon/product-service/productGoods/query/sku', //获取sku列表
    ali_pairProduct: flag + '/sps/aliProduct/pairProduct', //更换配对
    ali_batchUnPairProduct: flag + '/sps/aliProduct/batchUnPairProduct', //取消配对
    ali_skuNoDefaultList: flag + '/sps/aliProduct/skuNoDefaultList', //skum默认列表
    // 获取交易方式
    createOrderPreview: flag + '/sps/purchase/createOrderPreview',

    // 权限
    role_authList: settingPrefix + '/role/', // 细化到按钮的权限
    del_role: settingPrefix + '/role/', // 删除权限
    edit_auth: settingPrefix + '/role',
    get_roleList: settingPrefix + '/role/query', // 角色
    user_list: settingPrefix + '/userInfo/query', // 表格数据
    check_user: settingPrefix + '/userInfo/', // 查看员工详情
    add_user: settingPrefix + '/userInfo', // 增加用户&& 更新用户
    check_email: settingPrefix + '/userInfo/check', // 邮箱验证
    update_user: settingPrefix + '/user/update', // 更新用户信息
    enable_user: settingPrefix + '/userInfo/enable', // 启用员工
    disable_user: settingPrefix + '/userInfo/disable', // 启用员工
  },
  supplierManagementApi: supplierManagementApi,
  purchaseManagementApi: purchaseManagementApi,
  purchaseSettingApi: purchaseSettingApi,
  baseApi: baseApi,
  qualityTest: qualityTest
};

let api = {};
let allKeys = [];
Object.keys(allApi).forEach(key => {
  allKeys = [...allKeys, ...Object.keys(allApi[key])];
  api = { ...api, ...allApi[key] }
})

let apiKeys = [];
let repetitionKey = {};
allKeys.forEach(key => {
  if (apiKeys.includes(key)) {
    repetitionKey[key] = typeof repetitionKey[key] == 'number' ? repetitionKey[key] + 1 : 1;
  } else {
    apiKeys.push(key);
  }
})

const errorKey = Object.keys(repetitionKey);
if (errorKey.length > 0) {
  errorKey.forEach(errKey => {
    console.error(`api ${errKey} 命名重复 ${repetitionKey[errKey]} 次`);
  })
}

export default api;
