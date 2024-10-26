/*
 * @Author: w
 * @Date: 2021-07-27 15:40:23
 * @LastEditors: w
 * @LastEditTime: 2021-08-03 15:34:39
 */
// 新品开发新流程
export default {
  // SKC颜色管理
  queryProductColorList: "/pds/lapa/workbench/product/queryProductColorList", //设置-SKC颜色管理-查询
  saveProductColor: "/pds/lapa/workbench/product/saveProductColor", //设置-SKC颜色管理-添加
  exportProductColorList: "/pds/lapa/workbench/product/exportProductColorList", //设置-SKC颜色管理-导出

  // 现货创建需求
  queryLaPaProductInfoList: "/pds/lapa/workbench/product/queryLaPaProductInfoList", //查询-新品开发列表信息
  queryLaPaProductInfo: "/pds/lapa/workbench/product/queryLaPaProductInfo", //查询-新品基础资料信息
  productVerify: "/pds/lapa/workbench/product/productVerify", //修改-新品审核相关操作
  saveBase: "/pds/lapa/workbench/product/saveBase", //保存-新品开发基本信息
  queryLaPaProductListCount: "/pds/lapa/workbench/product/queryLaPaProductListCount", //查询-需求状态统计信息
  exportProductInfoList: "/pds/lapa/workbench/product/exportProductInfoList", //导出-新品开发列表信息-所有结果集
  exportProductInfoListByProductIds: "/pds/lapa/workbench/product/exportProductInfoListByProductIds", //导出-新品开发列表信息-选中结果集
  exportProductTortInfoList: "/pds/lapa/workbench/product/exportProductTortInfoList", //侵权审核导出
  userList: "/erpCommon/setting-service/userInfo/getAllUserByParm", //获取所有用户信息
  // 工作台-保存打版资料信息 http://192.168.91.7:882/project/243/interface/api/15594
  savePatternInfo: '/pds/lapa/workbench/productPattern/savePatternInfo',
  // 工作台-查询打版资料信息 http://192.168.91.7:882/project/243/interface/api/15595
  queryPatternInfo: '/pds/lapa/workbench/productPattern/queryPatternInfo',
  // 打版-根据物料 ID 获取对应供应商、颜色、单价  https://console-docs.apipost.cn/preview/0f3c2ce74338dd8f/d647cebbaffe759f?target_id=fe9c8d89-4e93-415f-b84c-4d8befeb6595
  queryProductMaterialSupplierInfo: '/pds/lapa/workbench/material/queryProductMaterialSupplierInfo',
  // 打版需求-物料资料保存 http://192.168.91.7:882/project/243/interface/api/15597
  saveMaterialInfo: '/pds/lapa/workbench/productMaterialInfo/saveMaterialInfo',
  // 物料资料-物料资料查询 http://192.168.91.7:882/project/243/interface/api/15598
  queryMaterialInfo: '/pds/lapa/workbench/productMaterialInfo/queryMaterialInfo',
  // 样衣制作-样衣路径保存 http://192.168.91.7:882/project/243/interface/api/15599
  saveSampleClothing: '/pds/lapa/workbench/productSampleClothing/saveSampleClothing',
  // 样衣制作-样衣路径查询 http://192.168.91.7:882/project/243/interface/api/15600
  querySampleClothingFileUrl: '/pds/lapa/workbench/productSampleClothing/querySampleClothingFileUrl',

  // 工序资料-保存工序资料 http://192.168.91.7:882/project/243/interface/api/15602
  saveProcesses: '/pds/lapa/workbench/productProcesses/saveProcesses',
  // 工序资料-查询工序资料 http://192.168.91.7:882/project/243/interface/api/15603
  queryProcesses: '/pds/lapa/workbench/productProcesses/queryProcesses',
  // 查询商品历史尺码信息 http://192.168.91.7:882/project/243/interface/api/16032
  getSizeHistory: '/pds/lapa/workbench/product/getSizeHistory',

  // 基础数据管理
  // 物流管理 - 列表查询 http://192.168.91.7:882/project/243/interface/api/15607
  queryProductMaterialList: '/pds/lapa/workbench/material/queryProductMaterialList',
  // 物流管理 - 详情 http://192.168.91.7:882/project/243/interface/api/15609
  queryProductMaterialDetail: '/pds/lapa/workbench/material/queryProductMaterialDetail',
  // 物流管理 - 通过名称或类型查询详情 http://192.168.91.7:882/project/243/interface/api/15610
  queryProductMaterialDetailByCondition: '/pds/lapa/workbench/material/queryProductMaterialDetailByCondition',
  // 物流管理 - 通过物料类型和名称查询物料 http://192.168.91.7:882/project/243/interface/api/15625
  queryProductMaterialListByApi: '/pds/api/material/queryProductMaterialListByApi',
  // 物流管理 - 保存 http://192.168.91.7:882/project/243/interface/api/15611
  saveProductMaterial: '/pds/lapa/workbench/material/saveProductMaterial',
  // 物流管理 - 编辑 http://192.168.91.7:882/project/243/interface/api/15612
  updateProductMaterial: '/pds/lapa/workbench/material/updateProductMaterial',
  // 工艺管理 - 查询列表 http://192.168.91.7:882/project/243/interface/api/15615
  queryProductTechnologyList: '/pds/lapa/workbench/technology/queryProductTechnologyList',
  // 工艺管理 - 新增 http://192.168.91.7:882/project/243/interface/api/15617
  pushProductTechnology: '/pds/lapa/workbench/technology/saveProductTechnology',
  // 工艺管理 - 编辑 http://192.168.91.7:882/project/243/interface/api/15616
  updateProductTechnology: '/pds/lapa/workbench/technology/updateProductTechnology',
  // 工艺管理 - 删除 http://192.168.91.7:882/project/243/interface/api/15618
  deleteProductTechnology: '/pds/lapa/workbench/technology/deleteProductTechnology',
  // 工艺管理 - 通过工艺类型和工艺名称查询工艺 http://192.168.91.7:882/project/243/interface/api/15626
  getProductTechnologyList: '/pds/api/technology/queryProductTechnologyList',
  // 二次工艺管理-新增二次工艺 http://192.168.91.7:882/project/243/interface/api/15693
  saveTwiceCraft: '/pds/lapa/workbench/secondaryProcess/saveNew',
  // 二次工艺管理-查询列表 http://192.168.91.7:882/project/243/interface/api/15694
  queryTwiceCraftList: '/pds/lapa/workbench/secondaryProcess/queryList',
  // 二次工艺管理-删除 http://192.168.91.7:882/project/243/interface/api/15695
  deleteTwiceCraftList: '/pds/lapa/workbench/secondaryProcess/delete',
  // 二次工艺管理-编辑 http://192.168.91.7:882/project/243/interface/api/15696
  editTwiceCraftList: '/pds/lapa/workbench/secondaryProcess/edit',
  // 二次工艺管理-导入 http://192.168.91.7:882/project/243/interface/api/15697
  importTwiceCraftList: '/pds/lapa/workbench/secondaryProcess/import',
  // 二次工艺管理-导出 http://192.168.91.7:882/project/243/interface/api/15698
  exportTwiceCraftList: '/pds/lapa/workbench/secondaryProcess/export',
  // 二次工艺管理-列表拖拽排序 http://192.168.91.7:882/project/243/interface/api/15699
  sortTwiceCraftList: '/pds/lapa/workbench/secondaryProcess/sort',
  // 打版-查询二次工艺 http://192.168.91.7:882/project/243/interface/api/15703
  queryPlateTwiceCraftList: '/pds/lapa/workbench/secondaryProcessInfo/queryList',
  // 打版-查询二次工艺供应商信息 http://192.168.91.7:882/project/243/interface/api/15704
  queryPlateListByName: '/pds/lapa/workbench/secondaryProcessInfo/queryListByName',
  // 打版-二次工艺-保存 http://192.168.91.7:882/project/243/interface/api/15705
  savePlateTwiceCraft: '/pds/lapa/workbench/secondaryProcessInfo/save',
  // 打版-二次工艺-查询打版信息 http://192.168.91.7:882/project/243/interface/api/15706
  queryPlateTwiceCraftInfo: '/pds/lapa/workbench/secondaryProcessInfo/query',

  // 待办任务
  myLaPaProductInfoList: "/pds/lapa/workbench/product/myLaPaProductInfoList", // 查询-我的待办任务列表信息

  // 图片
  queryPicture: "/pds/lapa/workbench/product/queryPicture", // 待完善图片（图片资料）-查询图片
  upload: "/pds/lapa/workbench/product/upload", // 待完善图片（图片资料）-上传图片
  remove: "/pds/lapa/workbench/product/remove", // 待完善图片（图片资料）-删除图片
  savePicture: "/pds/lapa/workbench/product/savePicture", // 待完善图片（图片资料）-保存图片
  download: "/pds/lapa/workbench/product/download", // 待完善图片（图片资料）-下载图片

  // 文本
  queryDescription: "/pds/lapa/workbench/product/queryDescription", // 待完善资料（文本资料）-查询文本描述信息
  saveProductDescription: "/pds/lapa/workbench/product/saveProductDescription", // 待完善资料（文本资料）-保存文本描述
  saveSizePicture: "/pds/lapa/workbench/product/saveSizePicture", // 保存生成的尺码图片

  // 审样
  qualitySampleReview: "/pds/lapa/workbench/product/qualitySampleReview", // 查询新品质检要求列表信息
  saveSampleReviewData: "/pds/lapa/workbench/product/saveSampleReviewData", // 审样核价
  createSku: "/pds/lapa/workbench/product/createSku", // 生成SKU
  saveUpc: "/pds/lapa/workbench/product/saveUpc", // 保存-UPC
  getSkuList: '/pds/lapa/workbench/product/getSkuList', // 新版生成SKU
  // 日志
  queryLog: "/pds/lapa/workbench/product/queryLog", // 查询新品日志信息

  // 尺码管理
  queryProductSizeList: "/pds/lapa/workbench/product/queryProductSizeList", // 查询-尺码管理
  saveProductSize: "/pds/lapa/workbench/product/saveProductSize", // 添加-尺码管理
  exportProductSizeList: "/pds/lapa/workbench/product/exportProductSizeList", // 导出-尺码管理
  queryProductSizeTypeList: "/pds/lapa/workbench/product/queryProductSizeTypeList", // 查询-尺码类型
  queryProductSizeByType: "/pds/lapa/workbench/product/queryProductSizeByType", // 查询-根据类型查询尺码
  queryProductSizeTypeRel: "/pds/lapa/workbench/product/queryProductSizeTypeRel", // 查询-尺码类型关联
  queryProductSizeClassificationInfo: "/pds/lapa/workbench/product/queryProductSizeClassificationInfo", // 分类尺码-详情  
  queryAllProductSizePartList: "/pds/lapa/workbench/product/queryAllProductSizePartList", // 尺码部位
  queryProductSizeTemplate: "/pds/lapa/workbench/product/queryProductSizeTemplate", // 尺码模板查询
  queryProductSizeTemplateToSizePicture: "/pds/lapa/workbench/product/queryProductSizeTemplateToSizePicture", // 尺码模板查询
  // 新增尺码组跳码 http://192.168.91.7:882/project/243/interface/api/16052
  addHoppingCode: '/pds/lapa/workbench/product/addHoppingCode',
  // 查询尺码组跳码 http://192.168.91.7:882/project/243/interface/api/16053
  queryHoppingCode: '/pds/lapa/workbench/product/queryHoppingCode',

  // 商品资料
  queryLaPaProductGoodsInfo: "/pds/lapa/workbench/product/queryLaPaProductGoodsInfo", // 查询-新品商品资料信息
  saveGoods: "/pds/lapa/workbench/product/saveGoods", // 保存-新品商品资料信息
  updateProductVariQuotation: '/pds/lapa/workbench/product/updateProductVariQuotation', // 完善基础资料-修改多属性
  searchproductQualityClassification: '/erpCommon/product-service/productQualityClassification/query',//查询质检分类(无分页)
  // 获取所有质检模板数据，get方式
  getAllQualityTemplate: '/erpCommon/product-service/productInfo/getAllQualityTemplate',
  queryProductQualityProjectListById: '/erpCommon/product-service/productQualityProject/queryProductQualityProjectListById',//根据项目id查询项目、内容
  // 1688信息采集 http://192.168.91.7:882/project/243/interface/api/15831
  getGrabInformation: '/pds/lapa/workbench/product/grab',

  // 商品管理的接口
  productCategoryqueryAll: '/erpCommon/product-service/productCategory/queryAll', // 商品分类管理
  productTagqueryAll: "/erpCommon/product-service/productTag/queryAll", // 查询-标签管理
  productBrandquery: "/erpCommon/product-service/productBrand/query", // 查询-品牌管理
  query_findAttribute: '/erpCommon/product-service/productInfo/findAttribute', // 查询商品分类属性值
  productCategoryIds: '/erpCommon/product-service/productCategory/api/productCategoryIds', // 根据分类详情productCategoryIds
  // 查询YMS商品分类 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-161018158
  getYmsProductCategory: '/pds/lapa/workbench/product/queryYmsProductCategory',
  // 查询YMS商品分类明细 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-161018159
  queryYmsProductCategory: '/pds/lapa/workbench/product/queryYmsProductCategory',
  // 同步YMS商品信息 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-161441259
  syncYmsProductInfo: '/pds/lapa/workbench/product/syncYmsProductInfo',
  // 商户数据 获取yms商户类型=供应商 http://192.168.91.7:882/project/343/interface/api/16099
  ymsMerchantAccount: '/erpCommon/setting-service/ymsMerchantAccount/api/list',

  // 云仓开发
  getCloudPicture: '/pds/lapa/workbench/product/getCloudPicture', // 获取云仓图库
  queryProductDefaulReviewer: "/pds/lapa/workbench/product/queryProductDefaulReviewer", //设置中心-新品默认审核人-查询

  queryTaskList: '/pds/lapa/workbench/material/queryTaskList',//导出(导入)查看
  querySynInfo: '/pds/lapa/workbench/product/querySynInfo',//查询商品是否有同步
  // 查询工序 http://192.168.91.7:882/project/243/interface/api/15621
  queryProductProcessList: '/pds/lapa/workbench/process/queryProductProcessList',
  // 新增工序 http://192.168.91.7:882/project/243/interface/api/15623
  saveProductProcess: '/pds/lapa/workbench/process/saveProductProcess',
  // 编辑工序 http://192.168.91.7:882/project/243/interface/api/15622
  updateProductProcess: '/pds/lapa/workbench/process/updateProductProcess',
  // 删除工序 http://192.168.91.7:882/project/243/interface/api/15624
  deleteProductProcess: '/pds/lapa/workbench/process/deleteProductProcess',
  // 导出-工序管理 http://192.168.91.7:882/project/243/interface/api/15620
  exportProcess: '/pds/lapa/workbench/process/exportProcess',
  // 导入-工序管理 http://192.168.91.7:882/project/243/interface/api/15640
  importProcess: '/pds/lapa/workbench/process/importProcess',
  // 打版-工艺资料-保存工艺资料 http://192.168.91.7:882/project/243/interface/api/15605
  saveProductTechnology: '/pds/lapa/workbench/productTechnology/saveProductTechnology',
  // 工艺资料-查询工艺资料 http://192.168.91.7:882/project/243/interface/api/15606
  queryProductTechnology: '/pds/lapa/workbench/productTechnology/queryProductTechnology',
  // 大货价格-查询大货价格 http://192.168.91.7:882/project/243/interface/api/15608
  queryPrice: '/pds/lapa/workbench/product/queryPrice',
  // 导出-工艺管理 http://192.168.91.7:882/project/243/interface/api/15619
  exportTechnology: '/pds/lapa/workbench/technology/exportTechnology',
  // 导入-工艺管理 http://192.168.91.7:882/project/243/interface/api/15639
  importTechnology: '/pds/lapa/workbench/technology/importTechnology',
  // 导出-物料管理 http://192.168.91.7:882/project/243/interface/api/15614
  exportMaterials: '/pds/lapa/workbench/material/exportMaterials',
  // 导出打版信息 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-139384101
  exportPlateMakingInfo: '/pds/lapa/workbench/product/exportPlateMakingInfo',
  // 获取店铺平台信息
  get_queryByStatus: '/erpCommon/order-service/merchantPlatform/queryByStatus',
  // 店铺授权失效提醒 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-201599204
  queryAuthWarn: '/erpCommon/setting-service/saleAccountCommon/queryAuthWarn',
};