export default {
  queryLogisticsTrackingInfo: '/wms-service/wmsLogisticsTrackingInfo/query', // 物流追踪分页查询
  queryDetailLogisticsTracking: '/wms-service/wmsLogisticsTrackingInfo/queryDetail', // 物流追踪明细  参数 trackingId get 方式
  queryOverseasWarehousing: '/wms-service/overseasWarehousing/queryOverseasWarehousing', // 入库海外仓-查询
  queryOverseasDetail: '/wms-service/overseasWarehousing/queryOverseasDetail', // 入库海外仓-查询详情信息
  warehouseConfirmation: '/wms-service/overseasWarehousing/warehouseConfirmation', // 入库海外仓-确认入库
  exportWarehousingConfirmation: '/wms-service/warehouseArrivalManagementExport/exportWarehousingConfirmation', // 入仓管理-导出入库确认单
  exportOverseasWarehouseProduct: '/wms-service/warehouseArrivalManagementExport/exportOverseasWarehouseProduct', // 入仓管理-导出入仓商品管理
  querySkuInfo: '/wms-service/overseasWarehousing/querySkuInfo', // 商品管理-查询商品信息
  querySkuDetail: '/wms-service/overseasWarehousing/querySkuDetail', // 商品管理-查询sku详情
  modifyProductType: '/wms-service/overseasWarehousing/modifyProductType', // 商品管理-批量修改商品类型
  modifySkuDetail: '/wms-service/overseasWarehousing/modifySkuDetail', // 商品管理-修改sku详情
  querySkuDetailList: '/wms-service/overseasWarehousing/querySkuDetailList', // 商品管理-海外仓发货记录
  batchUpdateStatus: '/wms-service/overseasWarehousing/batchUpdateStatus', // 入库海外仓-批量标记入仓完成
  deletePicking: '/wms-service/overseasWarehousing/deletePicking/', // 删除出库单
  exportBatch: '/wms-service/wmsLogisticsTrackingInfo/exportBatch', // 物流追踪导出
  exportOverseasWarehouseProductDetail: '/wms-service/warehouseArrivalManagementExport/exportOverseasWarehouseProductDetail', // 入仓管理-导出明细

  // 出库增值服务 https://apifox.com/apidoc/shared-f69d74b0-e4d0-47e6-a919-706f46e2cf85/api-214875648
  valAddService_queryList: '/wms-service/valueAddedService/queryList', // 查询增值服务列表
  valAddService_queryDetail: '/wms-service/valueAddedService/queryDetail/', // 查询增值服务明细
  valAddService_importPicking: '/wms-service/valueAddedService/importPicking/', // 导入增值服务信息
  valAddService_vasImport: '/wms-service/template/vasImport.xlsx', // 导入文件模板
  valAddService_queryAffiliatedBusinessDeptPersonByIds: '/dyt-cloud-upms-admin/api/erp/common/queryAffiliatedBusinessDeptPersonByIds', // 入参：[16] 获取永邦事业部人员
  valAddService_exportPicking: '/wms-service/valueAddedService/exportPicking/', // 导出增值服务信息
  valAddService_delete: '/wms-service/valueAddedService/delete/', // 删除增值服务信息
  valAddService_queryPickingInfo: '/wms-service/valueAddedService/queryPickingInfo/', // 查询出库单信息
  valAddService_savePicking: '/wms-service/valueAddedService/savePicking', // 新增出库单增值服务
  valAddService_queryPackageInfo: '/wms-service/valueAddedService/queryPackageInfo/', // 查询包裹信息
  valAddService_savePackage: '/wms-service/valueAddedService/savePackage', // 新增包裹增值服务
};
