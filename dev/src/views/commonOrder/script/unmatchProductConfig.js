// 搜索栏设置
export const filterKey = {
  shopify: [
    'saleAccountIds', 'tagIdList', 'buyerCountryCodeList', 'payTime', 'orderNo', 'buyerName', 'buyerAccountId', 'webstoreItemId',
    'webstoreSku', 'isCashOnDelivery', 'searchValue', 'isSuspended'
  ],
  amazon: [
    'saleAccountIds', 'tagIdList', 'buyerCountryCodeList', 'payTime', 'orderNo', 'buyerName', 'buyerAccountId', 'webstoreItemId',
    'webstoreSku', 'searchValue', 'isSuspended', 'amazonIsBusinessOrder', 'amazonIsPrime', 'asin'
  ],
  wish: [
    'saleAccountIds', 'tagIdList', 'buyerCountryCodeList', 'payTime', 'orderNo', 'buyerName', 'buyerAccountId', 'webstoreItemId',
    'webstoreSku', 'searchValue', 'isSuspended', 'wishIsCombinedOrder', 'wishIsAdvancedLogistics', 'wishIsPremiumcarrierUpgrade', 'wishIsWishExpress'
  ],
  otto: [
    'saleAccountIds', 'brandIdList', 'tagIdList', 'buyerCountryCodeList', 'payTime', 'orderNo', 'buyerName', 'buyerAccountId', 'webstoreItemId',
    'webstoreSku', 'searchValue', 'isSuspended'
  ],
  default: [
    'saleAccountIds', 'tagIdList', 'buyerCountryCodeList', 'payTime', 'orderNo', 'buyerName', 'buyerAccountId', 'webstoreItemId',
    'webstoreSku', 'searchValue', 'isSuspended'
  ]
}
// 列表设置
export const columnKey = {
  aliexpress: [
    'selection', 'salesRecordNumber', 'aliexpressOrderStatus', 'productList', 'shippingLimiteTime', 'buyerName',
    'buyerCountryCodeList', 'totalPrice', 'isSuspended', 'suspendedReason',
    'payTime', 'tags', 'remarkContent', 'operate'
  ],
  amazon: [
    'selection', 'salesRecordNumber', 'amazonIsBusinessOrder',
    'productList', 'buyerName', 'buyerCountryCodeList', 'totalPrice', 'isSuspended', 'suspendedReason',
    'payTime', 'tags', 'remarkContent', 'operate'
  ],
  wish: [
    'selection', 'salesRecordNumber', 'platformOrderStatus', 'wishIsAdvancedLogistics', 'wishIsPremiumcarrierUpgrade', 'wishIsWishExpress',
    'productList', 'buyerAccountId', 'buyerCountryCodeList', 'totalPrice', 'isSuspended', 'suspendedReason',
    'salesTime', 'webstoreUpdatedDate', 'tags', 'remarkContent', 'operate'
  ],
  default: [
    'selection', 'salesRecordNumber', 'productList', 'buyerName', 'buyerCountryCodeList', 'totalPrice', 'isSuspended', 'suspendedReason',
    'payTime', 'tags', 'remarkContent', 'operate'
  ]
}
