export default {
  // 亚马逊FBA美国仓
  query_amazonList: '/wms-service/wmsAmazonListing/query', // 亚马逊在线商品管理-查询信息列表
  update_amazonList: '/wms-service/wmsAmazonListing/update', // 关联sku
  query_fbaReceipt: '/wms-service/wmsFbaReceipt/query', // 获取入库单列表
  get_fbaReceiptDetail: '/wms-service/wmsFbaReceiptDetail/detail', // 根据FBA入库单Id查询详细数据
  query_fbaInventory: '/wms-service/wmsFbaInventory/query', // FBA库存管理-获取已有Fba库存列表信息
  put_sync: '/wms-service/wmsFbaInventory/sync', // 同步库存
  put_syncOnlineProduct: '/wms-service/wmsAmazonListing/sync', // 同步在线商品
  import_wmsAmazonListing: '/wms-service/wmsAmazonListing/skuRelatedImport' // 亚马逊sku关联导入
};
