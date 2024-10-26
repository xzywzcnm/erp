let prefix = '/wms-service';
export default {
      // 仓库设置模块
      get_wareHouseListData: prefix + '/wmsWarehouse/list', // 获取仓库设置的已有仓库列表信息
      wareSetWatchDtl: prefix + '/wmsWarehouse/modify', // 仓库设置修改和查看仓库数据
      wareSetSearchData: prefix + '/wmsWarehouse/list', // 仓库设置的查询功能
      addWareSetData: prefix + '/wmsWarehouse/create', // 新增仓库信息
      selectManageWareName: prefix + '/wmsWarehouse/queryUserAllwarehouse', // 获取仓库下拉列表
      // 库区管理模块
      get_wareAreaListData: prefix + '/wmsWarehouseBlock/list', // 获取库区管理的已有仓库列表信息
      wareAreaWatchDtl: prefix + '/wmsWarehouseBlock/modify', // 库区管理修改和查看仓库数据
      wareAreaSearchData: prefix + '/wmsWarehouseBlock/list', // 库区管理的查询功能
      addWareAreaData: prefix + '/wmsWarehouseBlock/create', // 新增库区
      selectWareBlockName: prefix + '/wms/warehouse/block/allwh', // 库区管理仓库下拉列表
      // 库位管理模块
      get_wareLocateListData: prefix + '/wmsWarehouseLocation/list', // 获取库位管理的列表信息
      wareLocateWatchDtl: prefix + '/wmsWarehouseLocation/modify', // 库位管理的新建和查看仓库数据
      wareLocateSearchData: prefix + '/wmsWarehouseLocation/list', // 库位管理的查询功能
      addWareLocateData: prefix + '/wmsWarehouseLocation/create', // 新增库位
      selectWareHouseName: prefix + '/wms/warehouse/location/allWherhouse', // 选择仓库名称下拉列表
      selectBlockType: prefix + '/wmsWarehouseLocation/blockList', // 根据仓库联动获取库区类型
      // 商品组装加工
      productProList: prefix + '/wmsWorking/list', // 商品组装加工列表
      seeDtlProductPro: prefix + '/wmsWorking/workingById', // 查看组装加工单详情
      modalProductList: prefix + '/wms/working/productList', // 模态框产品列表
      cancelAllocationArea: prefix + '/wmsWorking/cancelAllocationArea', // 仓储加工单-取消分配
      allocationArea: prefix + '/wmsWorking/allocationArea', // 仓储加工单-分配库位
      createList: prefix + '/wmsWorking/create', // 创建加工单
      workingById: prefix + '/wmsWorking/workingById', // 仓储加工单-查看加工单明细
      workingDetail: prefix + '/wmsWorking/detail',
      stockLocation: prefix + '/wmsWorking/stockLocation', // 商品组装加工的库位列表
      blockList: prefix + '/wmsWorking/blockList', // 库区
      locationList: prefix + '/wmsWorking/locationList', // 库位
      workingBatch: prefix + '/wmsWorking/workingBatch', // 库位
      workingLog: prefix + '/wmsWorkingLog/workingLog', // 日志列表
      createWorkingLog: prefix + '/wmsWorkingLog/create', // 新增日志列表
      selectCancelAllocationArea:
            prefix + '/wmsWorking/selectCancelAllocationArea', // 取消分配
      selectAllocationArea: prefix + '/wmsWorking/selectAllocationArea', // 分配
      refreshWorking: prefix + '/wmsWorking/refreshWorking', // 分配或取消后更新详情
      locationDetailList: prefix + '/wmsWorking/locationDetailList', //
      workingFinish: prefix + '/wmsWorking/finish', //
      importWorking: prefix + '/wmsWorking/importWorking', //
      exportWorking: prefix + '/wmsWorking/exportWorking', //
      /** -------------------------------------------------------------------**/
      importReceipt: prefix + '/wmsReceipt/import',
      exportReceipt: prefix + '/wmsReceipt/export',
      getLocationList: prefix + '/wmsReceipt/locationList',
      createReceiptBatchList: prefix + '/wmsReceiptBatch/createList',
      closeReceiptOrder: prefix + '/wmsReceipt/close',
      importInventory: prefix + '/wmsInventoryMove/import',
      exportInventory: prefix + '/wmsInventoryMove/export',
      importWarehouseBlock: prefix + '/wmsWarehouseBlock/importWarehouseBlock',
      exportWarehouseBlock: prefix + '/wmsWarehouseBlock/exportWarehouseBlock',
      importWarehouseLocation:
            prefix + '/wmsWarehouseLocation/importWarehouseLocation',
      exportWarehouseLocation:
            prefix + '/wmsWarehouseLocation/exportWarehouseLocation',
      importAdjust: prefix + '/wmsInventoryAdjust/import',
      exportAdjust: prefix + '/wmsInventoryAdjust/export',
      importFrozen: prefix + '/wmsInventoryFrozen/import',
      exportFrozen: prefix + '/wmsInventoryFrozen/export',
      getCheckWarehouseLoction:
            prefix + '/wmsWarehouseLocation/getCheckWarehouseLoction/',
      modifyCheckLocation: prefix + '/wmsWarehouseLocation/modifyCheckLocation',
      importAllot: prefix + '/wmsInventoryAllot/import',
      exportAllot: prefix + '/wmsInventoryAllot/export',
      exportAllWh: prefix + '/wmsInventoryCheck/export',
      deleteAllot: prefix + '/wmsInventoryAllot/delete',
      importAllwh: prefix + '/wmsInventoryCheck/import',
      get_queryByStatus:
            prefix + '/erpCommon/order-service/merchantPlatform/queryByStatus', // 获取平台信息

      exportProductQualityInfo: prefix + '/wmsReceipt/exportProductQualityInfo', // 质检信息导出

      // 入库出库申请
      baseDataList: prefix + '/erpCommon/sps-service/sps/common/baseDataList', // 获取结算方式类型
      upload_files: prefix + '/erpCommon/uploadFiles', // 文件类型上传
      query_goodsStockApplyList: prefix + '/goodsStockApply/query', // 入库出库申请-列表查询
      get_goodsStockApplyDetail: prefix + '/goodsStockApply/detail', // 入库出库申请-查看详情
      add_stockApply: prefix + '/goodsStockApply/addStockApply', // 入库出库申请-新增申请单
      update_stockApply: prefix + '/goodsStockApply/updateStockApply', // 入库出库申请-更新申请单
      return_stockApply: prefix + '/goodsStockApply/returnStockApply', //  入库出库申请-退回申请单
      get_SupplierInfo: prefix + '/erpCommon/sps-service/sps/supplierBillApply/getSupplierInfo', // 入库出库申请-根据当前用户获取可查看事业部下的供应商
      import_goodsStockApply: prefix + '/goodsStockApply/importGoods', // 入库出库申请-导入
      export_goodsStockGoodsExport: prefix + '/goodsStockApply/export', // 入库出库申请-商品信息导出
      delete_apply: prefix + '/goodsStockApply/deleteApply', // 入库出库申请-删除申请
      export_syncApply: prefix + '/goodsStockApply/exportSync', // 入库出库申请-导出
      add_remark: prefix + '/goodsStockApply/addRemark', // 入库出库申请-添加备注
      planQueryGoodsInfo: prefix + '/erpCommon/sps-service/sps/plan/queryGoodsInfo', // 查询商品信息

      // 寄出运费核对
      query_freightCheckList: prefix + '/erpCommon/sps-service/sps/supplierFreightCheck/list', // 运费核对单-查询列表
      add_freightCheck: prefix + '/erpCommon/sps-service/sps/supplierFreightCheck/created', // 运费核对单-添加运费核对单
      add_freightCheckRemark: prefix + '/erpCommon/sps-service/sps/supplierFreightCheck/createdRemark', // 运费核对单-新增备注
      get_freightCheckDetail: prefix + '/erpCommon/sps-service/sps/supplierFreightCheck/detail', // 运费核对单-运费核对单详细
      cancel_freightCheck: prefix + '/erpCommon/sps-service/sps/supplierFreightCheck/cancel', // 运费核对单-寄出运费核对单作废
      submit_freightCheck: prefix + '/erpCommon/sps-service/sps/supplierFreightCheck/summit', // 运费核对单-提交
      save_freightCheck: prefix + '/erpCommon/sps-service/sps/supplierFreightCheck/save', // 运费核对单-保存
      back_freightCheck: prefix + '/erpCommon/sps-service/sps/supplierFreightCheck/back', // 运费核对单-退回
      batchSummit_freightCheck: prefix + '/erpCommon/sps-service/sps/supplierFreightCheck/batchSummit', // 运费核对单-批量审核
      export_freightCheck: prefix + '/wms/supplierFreightCheck/exportList', // 运费核对单-导出
      import_freightCheckFile: prefix + '/wms/supplierFreightCheck/import', // 运费核对单-导入
      query_freightCheckImport: prefix + '/erpCommon/sps-service/supplierFreightCheckImport/list', // 运费核对单导入数据查询
      export_freightCheckImport: prefix + '/wms/supplierFreightCheckImport/exportList', // 运费核对单导入-导出列表
      query_importRule: prefix  + '/erpCommon/sps-service/sps/supplierFreightCheck/importRule',  // 查询当前用户是否存在导入运费按钮权限
};
