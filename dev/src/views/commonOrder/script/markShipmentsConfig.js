// 未标
export const noMarkConfig = {
  ebay: [
    'syncIgnore', 'remainTimeType', 'syncStatus', 'hasTrackingNumber', 'tagIdList', 'saleAccountIds', 'shippingMethodModel',
    'orderNo', 'buyerCountryCodeList', 'buyerName', 'buyerAccountId', 'webstoreItemId', 'webstoreSku', 'searchValue', 'deliveryStatus',
    'warehouseCode'
  ],
  otto: [
    'syncIgnore', 'syncStatus', 'hasTrackingNumber', 'tagIdList', 'saleAccountIds', 'shippingMethodModel', 'orderNo', 'buyerCountryCodeList',
    'buyerName', 'buyerAccountId', 'webstoreItemId', 'webstoreSku', 'businessDeptIdList', 'isCashOnDelivery', 'searchValue', 'warehouseCode',
    'deliveryStatus'
  ],
  shopify: [
    'syncIgnore', 'syncStatus', 'hasTrackingNumber', 'tagIdList', 'saleAccountIds', 'shippingMethodModel', 'orderNo', 'buyerCountryCodeList',
    'buyerName', 'buyerAccountId', 'webstoreItemId', 'webstoreSku', 'isCashOnDelivery', 'searchValue', 'warehouseCode', 'deliveryStatus'
  ],
  aliexpress: [
    'syncIgnore', 'syncStatus', 'hasTrackingNumber', 'tagIdList', 'saleAccountIds', 'shippingMethodModel', 'orderNo', 'buyerCountryCodeList', 'buyerName',
    'buyerAccountId', 'webstoreItemId', 'webstoreSku', 'searchValue', 'warehouseCode', 'deliveryStatus', 'remainTimeType'
  ],
  amazon: [
    'syncIgnore', 'syncStatus', 'hasTrackingNumber', 'tagIdList', 'saleAccountIds', 'shippingMethodModel', 'orderNo', 'buyerCountryCodeList', 'buyerName',
    'buyerAccountId', 'webstoreItemId', 'webstoreSku', 'searchValue', 'warehouseCode', 'deliveryStatus', 'remainTimeType', 'hasTrackingNumber',
    'amazonIsBusinessOrder', 'amazonIsPrime', 'asin'
  ],
  wish: [
    'syncIgnore', 'syncStatus', 'hasTrackingNumber', 'tagIdList', 'saleAccountIds', 'shippingMethodModel', 'orderNo', 'buyerCountryCodeList',
    'buyerName', 'buyerAccountId', 'webstoreItemId', 'webstoreSku', 'searchValue', 'warehouseCode', 'deliveryStatus',
    'wishIsCombinedOrder', 'wishIsAdvancedLogistics', 'wishIsPremiumcarrierUpgrade', 'wishIsWishExpress'
  ],
  ozon: [
    'syncIgnore', 'syncStatus', 'hasTrackingNumber', 'tagIdList', 'saleAccountIds', 'shippingMethodModel', 'orderNo', 'buyerCountryCodeList',
    'buyerName', 'buyerAccountId', 'webstoreItemId', 'webstoreSku', 'searchValue', 'warehouseCode', 'deliveryStatus',
    'remainTimeType'
  ],
  tiktok: [
    'syncIgnore', 'syncStatus', 'hasTrackingNumber', 'tagIdList', 'saleAccountIds', 'shippingMethodModel', 'orderNo', 'buyerCountryCodeList',
    'buyerName', 'buyerAccountId', 'webstoreItemId', 'webstoreSku', 'searchValue', 'warehouseCode', 'deliveryStatus',
    'remainTimeType'
  ],
  default: [
    'syncIgnore', 'syncStatus', 'hasTrackingNumber', 'tagIdList', 'saleAccountIds', 'shippingMethodModel', 'orderNo', 'buyerCountryCodeList',
    'buyerName', 'buyerAccountId', 'webstoreItemId', 'webstoreSku', 'isCashOnDelivery', 'searchValue', 'warehouseCode', 'deliveryStatus'
  ],
  ebayColumn: [
    'selection', 'salesRecordNumber', 'packageCode', 'buyerName', 'buyerCountryCode', 'totalPrice', 'payTime', 'psw',
    'ebayOrderStatus', 'remainTime', 'tags', 'remarkContent', 'operate'
  ],
  aliexpressColumn: [
    'selection', 'salesRecordNumber', 'aliexpressOrderStatus', 'productList', 'remainTime', 'buyerNameLevel',
    'buyerCountryCode', 'totalPrice', 'payTime', 'psw', 'orderAbnormal', 'tags', 'remarkContent', 'operate'
  ],
  amazonColumn: [
    'selection', 'salesRecordNumber', 'packageCode', 'amazonIsBusinessOrder', 'buyerName', 'buyerCountryCode',
    'totalPrice', 'payTime', 'psw', 'orderAbnormal', 'remainTime', 'tags', 'remarkContent', 'operate'
  ],
  wishColumn: [
    'selection', 'salesRecordNumber', 'platformOrderStatus', 'wishIsAdvancedLogistics', 'wishIsPremiumcarrierUpgrade', 'wishIsWishExpress',
    'buyerAccountId', 'buyerCountryCode', 'totalPrice', 'salesTime', 'webstoreUpdatedDate', 'psw',
    'ebayOrderStatus', 'tags', 'remarkContent', 'operate'
  ],
  ozonColumn: [
    'selection', 'salesRecordNumber', 'packageCode', 'buyerName', 'buyerCountryCode', 'totalPrice', 'payTime', 'psw',
    'ebayOrderStatus', 'remainTime', 'tags', 'remarkContent', 'operate'
  ],
  tiktokColumn: [
    'selection', 'salesRecordNumber', 'packageCode', 'buyerName', 'buyerCountryCode', 'totalPrice', 'payTime', 'psw',
    'ebayOrderStatus', 'remainTime', 'tags', 'remarkContent', 'operate'
  ],
  defaultColumn: [
    'selection', 'salesRecordNumber', 'buyerName', 'buyerCountryCode', 'totalPrice', 'payTime', 'psw',
    'ebayOrderStatus', 'tags', 'remarkContent', 'operate'
  ],
}
// 运单号有更新
export const waybillUpdateConfig = {
  ebay: [
    'syncIgnore', 'syncStatus', 'tagIdList', 'saleAccountIds', 'buyerCountryCodeList', 'shippingMethodModel', 'orderNo',
    'buyerName', 'buyerAccountId',
    'webstoreItemId', 'webstoreSku', 'searchValue', 'warehouseCode', 'deliveryStatus', 'isRedelivery', 'updateTrackingType'
  ],
  otto: [
    'syncIgnore', 'syncStatus', 'tagIdList', 'saleAccountIds', 'buyerCountryCodeList', 'shippingMethodModel', 'orderNo',
    'buyerName', 'buyerAccountId', 'webstoreItemId', 'webstoreSku', 'businessDeptIdList', 'searchValue', 'warehouseCode',
    'deliveryStatus'
  ],
  shopify: [
    'syncIgnore', 'syncStatus', 'tagIdList', 'saleAccountIds', 'buyerCountryCodeList', 'shippingMethodModel', 'orderNo',
    'buyerName', 'buyerAccountId', 'webstoreItemId', 'webstoreSku', 'isCashOnDelivery', 'searchValue', 'warehouseCode',
    'deliveryStatus'
  ],
  amazon: [
    'syncIgnore', 'syncStatus', 'tagIdList', 'saleAccountIds', 'isFbaOrder', 'buyerCountryCodeList', 'shippingMethodModel',
    'orderNo', 'buyerName', 'buyerAccountId', 'webstoreItemId', 'webstoreSku', 'searchValue', 'warehouseCode', 'deliveryStatus',
    'amazonIsBusinessOrder', 'amazonIsPrime', 'asin'
  ],
  wish: [
    'syncIgnore', 'syncStatus', 'tagIdList', 'saleAccountIds', 'buyerCountryCodeList', 'shippingMethodModel', 'orderNo',
    'buyerName', 'buyerAccountId', 'webstoreItemId', 'webstoreSku', 'searchValue', 'warehouseCode', 'deliveryStatus',
    'wishIsCombinedOrder', 'wishIsAdvancedLogistics', 'wishIsPremiumcarrierUpgrade', 'wishIsWishExpress'
  ],
  ozon: [
    'syncIgnore', 'syncStatus', 'tagIdList', 'saleAccountIds', 'buyerCountryCodeList', 'shippingMethodModel', 'orderNo',
    'buyerName', 'buyerAccountId', 'webstoreItemId', 'webstoreSku', 'searchValue', 'warehouseCode', 'deliveryStatus',
    'isRedelivery', 'updateTrackingType'
  ],
  tiktok: [
    'syncIgnore', 'syncStatus', 'tagIdList', 'saleAccountIds', 'buyerCountryCodeList', 'shippingMethodModel', 'orderNo',
    'buyerName', 'buyerAccountId', 'webstoreItemId', 'webstoreSku', 'searchValue', 'warehouseCode', 'deliveryStatus',
    'isRedelivery', 'updateTrackingType'
  ],
  default: [
    'syncIgnore', 'syncStatus', 'tagIdList', 'saleAccountIds', 'buyerCountryCodeList', 'shippingMethodModel', 'orderNo',
    'buyerName', 'buyerAccountId', 'webstoreItemId', 'webstoreSku', 'searchValue', 'warehouseCode', 'deliveryStatus'
  ],
  ebayColumn: [
    'selection', 'salesRecordNumber', 'packageCode', 'buyerName', 'buyerCountryCode', 'totalPrice', 'payTime', 'psw', 'tags',
    'remarkContent', 'operate'
  ],
  aliexpressColumn: [
    'selection', 'salesRecordNumber', 'aliexpressOrderStatus', 'productList', 'buyerNameLevel', 'buyerCountryCode', 'totalPrice', 'payTime', 'psw', 'tags',
    'remarkContent', 'operate'
  ],
  amazonColumn: [
    'selection', 'salesRecordNumber', 'packageCode', 'amazonIsBusinessOrder', 'buyerName', 'buyerCountryCode',
    'totalPrice', 'payTime', 'psw', 'tags', 'remarkContent', 'operate'
  ],
  wishColumn: [
    'selection', 'salesRecordNumber', 'platformOrderStatus', 'wishIsAdvancedLogistics', 'wishIsPremiumcarrierUpgrade', 'wishIsWishExpress',
    'buyerAccountId', 'buyerCountryCode', 'totalPrice', 'salesTime', 'webstoreUpdatedDate', 'psw',
    'ebayOrderStatus', 'tags', 'remarkContent', 'operate'
  ],
  ozonColumn: [
    'selection', 'salesRecordNumber', 'packageCode', 'buyerName', 'buyerCountryCode', 'totalPrice', 'payTime', 'psw', 'tags',
    'remarkContent', 'operate'
  ],
  tiktokColumn: [
    'selection', 'salesRecordNumber', 'packageCode', 'buyerName', 'buyerCountryCode', 'totalPrice', 'payTime', 'psw', 'tags',
    'remarkContent', 'operate'
  ],
  defaultColumn: [
    'selection', 'salesRecordNumber', 'buyerName', 'buyerCountryCode', 'totalPrice', 'payTime', 'psw', 'tags',
    'remarkContent', 'operate'
  ],
}
