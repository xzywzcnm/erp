export default { // 商品中心
  // 查询所有供应商
  queryAllSupplierInfo: './erpCommon/sps-service/sps/supplier/all',
  /* 商品中心--标签管理 */
  add_label: '/product-service/productTag', // 添加标签
  get_label: '/product-service/productTag/queryAll', // 查看标签
  del_label: '/product-service/productTag/', //  +productTagId 删除标签
  get_labelNames: '/product-service/productTag/queryTagNames', // 查看标签名称
  edit_labelNames: '/product-service/productTag/tag/', // 编辑标签名称 put
  export_tag: '/product-service/productTag/export', // 导出标签
  get_tagNum: '/product-service/productTag/productCount', // 获取标签对应的产品数量
  // 商品标签列表查询 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/endpoint-193524236
  querProductTag: '/product-service/productTag/queryList',
  /* 商品中心--品牌管理 */
  get_productBrand: '/product-service/productBrand/query', // 查询
  del_productBrand: '/product-service/productBrand/', // 删除
  stop_productBrand: '/product-service/productBrand/disable', // 停用
  star_productBrand: '/product-service/productBrand/enable', // 启用
  add_productBrand: '/product-service/productBrand', // 新增
  edit_productBrand: '/product-service/productBrand', // 编辑
  getAll_productBrand: '/product-service/productBrand/queryAll', // 查询所有品牌
  /* 商品中心--分类管理 */
  get_productCategory: '/product-service/productCategory/queryAll', // 查询
  get_tagProductCount: '/product-service/productCategory/productCount', // 查询个数
  look_productCategory: '/product-service/productCategory/', // 查看
  del_productCategory: '/product-service/productCategory/', // 删除
  edit_productCategory: '/product-service/productCategory', // 编辑(需要传 attributeId 属性 id)
  add_productCategory: '/product-service/productCategory', // 新增(需要传 attributeId 属性 id)
  // export_productCategory: '/product-service/productCategory/export', // 导出
  get_productAttribute: '/product-service/productCategory/productAttribute', // 查询绑定属性下拉框
  export_productCategory: '/product-service/productCategory/export', // 查询尺码类型列表

  /* 商品中心--sku映射 */
  get_productSkuMapping: '/product-service/productSkuMapping/query', // 查询
  leadin_productSkuMapping: '/product-service/productSkuMapping/excelImport', // 导入
  export_productSkuMapping: '/product-service/productSkuMapping/export', // 导出
  productSkuMapping_exportByIds: '/product-service/productSkuMapping/exportByIds', // 批量导出sku映射
  del_productSkuMapping: '/product-service/productSkuMapping/', // 删除
  del_AllproductSkuMapping: '/product-service/productSkuMapping/batchDelete', // 批量删除
  get_productSku: '/product-service/productSku/autogenerate', // 系统自动生成sku
  get_productGoods: '/product-service/productGoods/select/query', // 新建sku货品列表
  add_productSkuMapping: '/product-service/productSkuMapping', // 新建sku映射
  edit_productSkuMapping: '/product-service/productSkuMapping', // 更新sku映射
  /* 商品中心--商品管理 */
  productGoods_querySpu: '/product-service/productGoods/query/spu', // 查询(旧 spu/sku)
  // productGoods_querySpu: '/product-service/productGoods/query', // 查询(旧 spu/sku)
  productGoods_querySku: '/product-service/productGoods/query/sku', // 查询(新)sku
  createSku: '/product-service/productInfo/createSku', // 自动生成sku

  // SKU待办 列表查询 http://192.168.91.7:882/project/273/interface/api/15940
  skuAwaitList: '/product-service/productBacklog/list',
  // SKU待办 sku待办项导入 http://192.168.91.7:882/project/273/interface/api/15941
  skuAwaitImport: '/product-service/productBacklog/importBacklog',
  // SKU待办 单个更新 http://192.168.91.7:882/project/273/interface/api/15942
  skuAwaitEdit: '/product-service/productBacklog/editBacklog',
  // SKU待办 批量更新 http://192.168.91.7:882/project/273/interface/api/15943
  skuAwaitBatchEdit: '/product-service/productBacklog/batchEditBacklog',
  // SKU待办 批量标记已处理 http://192.168.91.7:882/project/273/interface/api/15944
  skuAwaitBatchHandle: '/product-service/productBacklog/batchHandleBacklog',
  // SKU待办 sku待办项导出 http://192.168.91.7:882/project/273/interface/api/15945
  skuAwaitExport: '/product-service/productBacklog/export',
  // SKU待办 sku待办项待处理数量 http://192.168.91.7:882/project/273/interface/api/15946
  skuAwaitNumber: '/product-service/productBacklog/queryNeedHandleNumber',

  // 商品详情页面图片导出 https://console-docs.apipost.cn/preview/21a9a2373888963a/d4e2da2dddf310ef?target_id=da77df8c-ad25-440f-9c6d-8d03dcbbbe99
  // Query:spu=60041; Body 请求参数为图片路径数组
  imageExport: '/product-service/productInfo/imageExport',
  productGoodsImage_queryByProductGoodsIds: '/product-service/productGoodsImage/queryByProductGoodsIds', // 获取商品货品图片
  productCategory_queryByProductCategoryIds: '/product-service/productCategory/queryByProductCategoryIds', // 获取分类导航
  del_productGoods: '/product-service/productGoods/', // 单个删除商品货品
  productGoods_batchDelete: '/product-service/productGoods/batchDelete', // 批量删除所有结果集
  // 商品信息同步明道云 http://192.168.91.7:882/project/273/interface/api/15949
  synProductInfoToMingDao: '/product-service/productInfo/synProductInfoToMingDao',
  // productGoods_deleteByIds: '/product-service/productGoods/deleteByIds', // 批量删除所选货品(这个接口去掉了)
  productInfo_insert: '/product-service/productInfo', // 新增产品
  productInfo_detail: '/product-service/productInfo/', // spu商品详情
  productInfo_update: '/product-service/productInfo/', // 更新商品
  productGoods_detail: '/product-service/productGoods/', // sku货品详情
  loadTemplate: '/product-service/productInfo/getTemplet', // 下载商品导入模板
  put_productInfo: '/product-service/productInfo/', // 下架SPU
  loadSkuMappingTemplate: '/product-service/productSkuMapping/getTemplet', // 下载商品映射导入模板
  update_productGoods: '/product-service/productGoods', // 更新SKU
  insert_productGoods: '/product-service/productGoods', // 新增SKU
  productImport_inport: '/product-service/productInfo/excelImport', // Excel导入
  assembleImport_import: '/product-service/productGoods/assembleImport', // Excel组装信息导入
  productImport_tagImport: '/product-service/productGoods/tagImport', // 标签导入
  uptate_checkType: '/product-service/productInfo/setCheck', // 批量修改spu质检类型、比例
  productImport_tagDeleteImport: '/product-service/productGoods/tagDeleteImport', // 解绑标签导入
  productImport_ymsImport: '/product-service/productInfo/excelImportCloudSell', // 云卖产品表格导入
  specialProductImport: '/product-service/productInfo/importSpecialDistributionProduct', // 特殊分销产品导入
  importReplaceSku: '/product-service/productGoods/importReplaceSku', // 导入替换SKU
  // 导入销售链接 http://192.168.91.7:882/project/273/interface/api/16092
  importPlatformUrl: '/product-service/productGoods/importPlatformUrl',
  productInfo_DownYmsExcel: '/product-service/productInfo/getCloudSellTemplet', // 下载云卖产品表格模板
  productImportTaskInfo_query: '/product-service/productImportTaskInfo/queryByType', // 查看导入任务列表
  productGoods_excelExport: '/product-service/productGoods/excelExport', // Excel导出商品SKU
  productInfo_DownExcel: '/product-service/productGoods/getProductGoodsTagTemplet ', // Excel导出商品
  productGoods_exportByIds: '/product-service/productGoods/exportByIds', // Excel导出所有结果集SKU
  query_productGoodsTab: '/product-service/productGoods/api/query', // 查询货品列表
  query_taskInfoData: '/product-service/productCommonTaskInfo/queryCommonTaskInfoData', // 查询任务数据列表
  // 修改定时导出助手 http://192.168.91.7:882/project/273/interface/api/15961
  updateTimedExport: '/product-service/productCommonTaskInfo/updateTimedExport',
  // 查询定时导出助手 http://192.168.91.7:882/project/273/interface/api/15960
  queryTimedExport: '/product-service/productCommonTaskInfo/queryTimedExport',
  put_batchUpdate: '/product-service/productGoods/batchUpdate', // 批量修改所有结果集货品
  getLog_productBrandSku: '/product-service/productGoodsOperationLog/query', // 获取操作日志
  getLog_productBrandSpu: '/product-service/productOperationLog/query', // 获取操作日志
  get_ymsProductSizeTemplate: './erpCommon/yms-core-service/ymsProductSizeTemplate/api/queryByYmsProductCategoryId/', // 获取尺码表的数据
  query_findAttribute: '/product-service/productInfo/findAttribute', // 查询商品分类属性值
  // 查询YMS商品分类 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-161018158
  getYmsProductCategory: '/pds-service/pds/lapa/workbench/product/queryYmsProductCategory',
  // 查询YMS商品分类明细 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-161018159
  queryYmsProductCategory: '/pds-service/pds/lapa/workbench/product/queryYmsProductCategory',
  // 同步YMS商品信息 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-161441259
  syncYmsProductInfo: '/product-service/productGoods/syncYmsProductInfo',
  query_findAttributeValue: '/product-service/productInfo/findAttributeValue', // 查询属性对应值下拉框
  query_findExistValue: '/product-service/productInfo/findExistValue', // 查询该spu是否有绑定的属性值
  insert_attributeSpu: '/product-service/productInfo/insertAttributeSpu', // 新增商品spu与分类属性值绑定
  query_allDeveloper: '/product-service/productGoods/select/allDeveloper', // 获取开发产品人员
  batchUpdateCategory: '/product-service/productGoods/batchUpdateCategory', // 批量修改分类，判断分类是否有冲突
  synProductInfoToListing: '/product-service/productInfo/synProductInfoToListing', // 批量同商品信息 到listing
  // 商户数据 获取yms商户类型=供应商 http://192.168.91.7:882/project/343/interface/api/16099
  ymsMerchantAccount: './erpCommon/setting-service/ymsMerchantAccount/api/list',
  // productInfo_exportByIds: '/product-service/productInfo/exportByIds', // 导出已选中SPU
  productInfo_excelExport: '/product-service/productInfo/excelExport', // 导出SPU（选中和所有 共用这一个接口）
  copyProductSpu: '/product-service/productInfo/copyProduct', // 复制SPU
  getProductPrice: '/product-service/productInfo/getProductPrice', // 获取sku产品报价信息
  /* 属性分类管理-属性管理 */
  attributeList: '/product-service/attributeClassify/list', // 属性管理列表
  attributeAdd: '/product-service/attributeClassify/add', // 新增属性分类
  attributeAttributeList: '/product-service/attributeClassify/attributeList', // 属性详情列表
  attributeAddAttribute: '/product-service/attributeClassify/addAttribute', // 新增属性（分类下的属性）
  attributeEdit: '/product-service/attributeClassify/edit', // 编辑属性分类
  attributeDelete: '/product-service/attributeClassify/delete', // 删除属性分类
  attributeIsBinding: '/product-service/attributeClassify/isBinding', // 是否绑定分类
  attributeEditAttribute: '/product-service/attributeClassify/editAttribute', // 编辑属性
  attributeDeleteAttribute: '/product-service/attributeClassify/deleteAttribute', // 删除属性
  // 属性分类管理-改版后的接口
  // 分类列表
  classificationList: '/product-service/classification/list',
  // 分类详情
  classificationDetails: '/product-service/classification/details',
  // 新增分类
  classificationAdd: '/product-service/classification/add',
  // 编辑分类
  classificationEdit: '/product-service/classification/edit',
  // 删除分类
  classificationDel: '/product-service/classification/del',
  // 是否绑定分类
  classificationIsBinding: '/product-service/attribute/isBinding',
  // 验证分类名称是否存在
  classificationIsExist: '/product-service/classification/isExist',
  // 属性列表
  attributeLists: '/product-service/attribute/list',
  // 新增属性
  addAttribute: '/product-service/attribute/addAttribute',
  // 编辑属性
  editAttribute: '/product-service/attribute/edit',
  // 删除属性
  attributeDel: '/product-service/attribute/del',
  // 返回所有属性
  attributeAll: '/product-service/attribute/all',
  // 属性详情
  attributeDetails: '/product-service/attribute/details',
  // 获取分类尺码
  queryAllProductSizeClassificationList: '/pds-service/pds/lapa/workbench/product/queryAllProductSizeClassificationList',
  // 获取颜色
  getColorList: '/pds-service/pds/lapa/workbench/product/queryProductColorList',
  // 获取所有分类尺码
  queryAllProductSizeType: '/pds-service/pds/lapa/workbench/product/queryAllProductSizeType',
  // 获取尺码
  getSizeList: '/pds-service/pds/lapa/workbench/product/queryProductSizeTypeRel',
  // 查询商品历史尺码信息 http://192.168.91.7:882/project/243/interface/api/16032
  getSizeHistory: '/pds-service/pds/lapa/workbench/product/getSizeHistory',
  // 质检项目管理-商品批量追加或覆盖
  batchUpdateProductQualityProjectInfo: '/product-service/productQualityProject/batchUpdateProductQualityProjectInfo',
  // 查询
  qualityClassificationByProductCategoryIdList: '/product-service/productQualityClassification/qualityClassificationByProductCategoryIdList',
  // 获取所有质检模板数据，get方式
  getAllQualityTemplate: '/product-service/productInfo/getAllQualityTemplate',
  // 批量修改质检 post 方式； templateId 为模板ID， body部分 [商品ID: '']
  batchUpdateProductQualityTemplate: '/product-service/productQualityProject/batchUpdateProductQualityTemplate/',

  /* 生成尺码图 begin */
  // 查询新品基础资料信息
  getNewProductInfo: '/pds-service/pds/lapa/workbench/product/queryLaPaProductInfo',
  queryProductSizeTemplateToSizePicture: '/pds-service/pds/lapa/workbench/product/queryProductSizeTemplateToSizePicture', // 尺码模板查询
  queryLaPaProductGoodsInfo: '/pds-service/pds/lapa/workbench/product/queryLaPaProductGoodsInfo', // 查询-新品商品资料信息
  queryAllProductSizePartList: '/pds-service/pds/lapa/workbench/product/queryAllProductSizePartList', // 获取尺码部位列表
  queryProductSizeClassificationInfo: '/pds-service/pds/lapa/workbench/product/queryProductSizeClassificationInfo', // 分类尺码-详情
  saveSizePicture: '/pds-service/pds/lapa/workbench/product/saveSizePicture', // 保存生成的尺码图片
  upload: '/pds-service/pds/lapa/workbench/product/upload',
  // 物流管理 - 列表查询 http://192.168.91.7:882/project/243/interface/api/15607
  queryProductMaterialList: '/pds-service/pds/lapa/workbench/material/queryProductMaterialList',
  // 打版-根据物料 ID 获取对应供应商、颜色、单价  https://console-docs.apipost.cn/preview/0f3c2ce74338dd8f/d647cebbaffe759f?target_id=fe9c8d89-4e93-415f-b84c-4d8befeb6595
  queryProductMaterialSupplierInfo: '/pds-service/pds/lapa/workbench/material/queryProductMaterialSupplierInfo',
  // 查询工序 http://192.168.91.7:882/project/243/interface/api/15621
  queryProductProcessList: '/pds-service/pds/lapa/workbench/process/queryProductProcessList',
  // 工艺管理 - 查询列表 http://192.168.91.7:882/project/243/interface/api/15615
  queryProductTechnologyList: '/pds-service/pds/lapa/workbench/technology/queryProductTechnologyList',
  // 打版-查询二次工艺 http://192.168.91.7:882/project/243/interface/api/15703
  queryPlateTwiceCraftList: '/pds-service/pds/lapa/workbench/secondaryProcessInfo/queryList',
  // 打版-查询二次工艺供应商信息 http://192.168.91.7:882/project/243/interface/api/15704
  queryPlateListByName: '/pds-service/pds/lapa/workbench/secondaryProcessInfo/queryListByName',
  // 打版-二次工艺-查询打版信息 http://192.168.91.7:882/project/243/interface/api/15706
  queryPlateTwiceCraftInfo: '/pds-service/pds/lapa/workbench/secondaryProcessInfo/query',
  // 查询尺码组跳码 http://192.168.91.7:882/project/243/interface/api/16053
  queryHoppingCode: '/pds-service/pds/lapa/workbench/product/queryHoppingCode',
  // 分类管理
  productCategory: '/product-service/productCategory', // 新增子分类

  // 质检项目管理
  queryProjectList: '/product-service/productQualityProject/queryProductQualityProjectList', // 条件查询质检项目
  addProjectList: '/product-service/productQualityProject/saveProductQualityProject', // 添加质检项目
  editProjectList: '/product-service/productQualityProject/updateProductQualityProject', // 修改质检项目(旧的接口，可能已弃用)
  modifyQualityProject: '/product-service/productQualityProject/modifyQualityProject', // 修改质检项目(put 方式)
  // 质检项目管理-查询操作日志 http://192.168.91.7:882/project/273/interface/api/15782
  qualityQueryOperate: '/product-service/productQualityProject/queryOperate',
  deleteProductQualityProjectById: '/product-service/productQualityProject/deleteProductQualityProjectById', // 删除质检项目
  qualityProjectDetails: '/product-service/productQualityProject/', // 通过质检项目ID 获取质检项目详情; 参数方式 /productQualityProject/{qualityProjectId}
  queryProductQualityProjectListById: '/product-service/productQualityProject/queryProductQualityProjectListById', // 条件查询质检项目-无分页

  // 质检标准
  queryQualityProjectList: '/product-service/productQualityProject/queryQualityProjectList', // 质检项目管理-查询商品质检项目
  queryProductQualityProjectAll: '/product-service/productQualityProject/queryProductQualityProjectAll', // 查询全部质检项目信息
  // 恢复已删除的sku模块
  // 查询已本删除的sku
  postQueryDeleteSkuPage: '/product-service/productGoods/queryDeleteSkuPage',
  // 查询需要恢复数量
  postQueryDeleteSpuSkuNumber: '/product-service/productGoods/queryDeleteSpuSkuNumber',
  // 恢复已被删除的SKU
  psotRestoreSpuSku: '/product-service/productGoods/restoreSpuSku',
  // 第三方标签管理
  // 获取所有海外仓标签 http://192.168.91.7:882/project/273/interface/api/15041
  postTagList: '/product-service/productOverseaTag/list',
  // 上传海外仓标签文件 http://192.168.91.7:882/project/273/interface/api/15029
  uploadThirdpartyTagFile: '/product-service/productOverseaTagRel/upload',
  // 新增海外仓标签 http://192.168.91.7:882/project/273/interface/api/15033
  addThirdpartyTag: '/product-service/productOverseaTag/insert',
  // 编辑海外仓标签 http://192.168.91.7:882/project/273/interface/api/15045
  updateThirdpartyTag: '/product-service/productOverseaTag/update',
  // 删除海外仓标签 http://192.168.91.7:882/project/273/interface/api/15049
  deleteThirdpartyTag: '/product-service/productOverseaTag/delete',
  // sku新增绑定标签 http://192.168.91.7:882/project/273/interface/api/15037
  insertSkuThirdpartyTag: '/product-service/productOverseaTagRel/insert',
  // 删除sku绑定的海外仓标签 http://192.168.91.7:882/project/273/interface/api/15057
  deleteSkuThirdpartyTag: '/product-service/productOverseaTagRel/delete',
  // 获取sku绑定的海外仓标签列表 http://192.168.91.7:882/project/273/interface/api/15053
  getSkuThirdpartyTagList: '/product-service/productOverseaTagRel/list',
  // 根据商品ID获取所有sku绑定的海外仓标签列表(未绑定的返回未绑定) http://192.168.91.7:882/project/273/interface/api/15053
  getSkuThirdpartyTagListDetail: '/product-service/productOverseaTagRel/listDetail',
  // 批量保存sku关联第三方标签 http://192.168.91.7:882/project/273/interface/api/15289
  addBatchInsertThirTag: '/product-service/productOverseaTagRel/batchInsert',

  // 第三方标签-获取平台 http://192.168.91.7:882/project/273/interface/api/15417
  queryPlatformId: '/product-service/thirdPartyTag/queryPlatformId',
  // 第三方标签-根据平台获取用户有权限的店铺 http://192.168.91.7:882/project/273/interface/api/15421
  queryAccountByPlatformId: '/product-service/thirdPartyTag/queryAccountByPlatformId',
  // 第三方标签-导入 http://192.168.91.7:882/project/273/interface/api/15425
  importThirdPartyTag: '/product-service/thirdPartyTag/importThirdPartyTag',
  // 第三方标签-查询列表 http://192.168.91.7:882/project/273/interface/api/15429
  thirdQueryPage: '/product-service/thirdPartyTag/queryPage',
  // 第三方标签-同步更新 http://192.168.91.7:882/project/273/interface/api/15433
  thirdSync: '/product-service/thirdPartyTag/sync',
  // 第三方标签-导出 http://192.168.91.7:882/project/273/interface/api/15437
  thirdExport: '/product-service/thirdPartyTag/export',
  // 第三方标签-获取Excel导入模板 http://192.168.91.7:882/project/273/interface/api/15441
  thirdTemplate: '/product-service/thirdPartyTag/getTemplate',
  // 第三方标签-编辑 http://192.168.91.7:882/project/273/interface/api/15445
  thirdEdit: '/product-service/thirdPartyTag/edit',
  // 第三方标签-匹配LAPAsku http://192.168.91.7:882/project/273/interface/api/15449
  thirdMatch: '/product-service/thirdPartyTag/match',
  // 第三方标签-删除平台sku http://192.168.91.7:882/project/273/interface/api/15453
  thirdDelete: '/product-service/thirdPartyTag/delete',
  // 下载标签 http://192.168.91.7:882/project/273/interface/api/16000
  downloadLabel: '/product-service/thirdPartyTag/downloadLabel',

  // 设置替换SKU https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-143154831
  setReplaceSku: '/product-service/productGoods/setReplaceSku',
  // 删除替换SKU  https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-143157301
  // /productGoods/removeReplaceSku/{replaceGoodsId}
  removeReplaceSku: '/product-service/productGoods/removeReplaceSku/',
  // 查询yms商品自动停售 http://192.168.91.7:882/project/273/interface/api/16035
  haltSalesQuery: '/product-service/productInfo/autoToHaltTheSales/query',
  // 导出yms商品自动停售 http://192.168.91.7:882/project/273/interface/api/16038
  haltSalesExport: '/product-service/productInfo/autoToHaltTheSales/export',
  // 查询sku商品历史状态列表 http://192.168.91.7:882/project/273/interface/api/16104
  historyGoodsStatusQuery: '/product-service/productGoodsStatusHistory/query',

  // 质检模块管理
  queryClassifyList: '/product-service/productQualityClassification/qualityClassificationVOS', // 条件查询质检模块
  addClassifyList: '/product-service/productQualityClassification/saveProductQualityProject', // 添加质检模块
  editClassifyList: '/product-service/productQualityClassification/updateProductQualityProject', // 修改质检模块
  deleteClassifyList: '/product-service/productQualityClassification/deleteProductQualityClassificationById' // 删除质检模块
};
