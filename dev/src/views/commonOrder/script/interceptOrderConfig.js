export default {
  otto: [
    'saleAccountIds', 'tagIdList', 'buyerCountryCodeList', 'payTime', 'orderNo', 'buyerName', 'buyerAccountId', 'webstoreItemId', 'webstoreSku',
    'businessDeptIdList', 'isRefunded', 'isMatchingReturn', 'isPartRefunded', 'searchValue'
  ],
  shopify: [
    'saleAccountIds', 'tagIdList', 'buyerCountryCodeList', 'payTime', 'orderNo', 'buyerName', 'buyerAccountId', 'webstoreItemId', 'webstoreSku',
    'businessDeptIdList', 'isRefunded', 'isCashOnDelivery', 'isPartRefunded', 'searchValue'
  ],
  amazon: [
    'saleAccountIds', 'tagIdList', 'buyerCountryCodeList', 'payTime', 'orderNo', 'buyerName', 'buyerAccountId', 'webstoreItemId', 'webstoreSku',
    'businessDeptIdList', 'isRefunded', 'isPartRefunded', 'amazonIsBusinessOrder', 'amazonIsPrime', 'asin', 'searchValue'
  ],
  wish: [
    'saleAccountIds', 'tagIdList', 'buyerCountryCodeList', 'payTime', 'orderNo', 'buyerName', 'buyerAccountId', 'webstoreItemId', 'webstoreSku',
    'businessDeptIdList', 'isRefunded', 'isPartRefunded', 'searchValue', 'wishIsAdvancedLogistics',
    'wishIsPremiumcarrierUpgrade', 'wishIsWishExpress', 'wishIsReReleased', 'wishIsCombinedOrder'
  ],
  default: [
    'saleAccountIds', 'tagIdList', 'buyerCountryCodeList', 'payTime', 'orderNo', 'buyerName', 'buyerAccountId', 'webstoreItemId', 'webstoreSku',
    'businessDeptIdList', 'isRefunded', 'isPartRefunded', 'searchValue'
  ],
  ebayColumn: [
    'selection', 'salesRecordNumber', 'packageCode', 'orderNotes', 'productList', 'buyerName', 'buyerCountryCode', 'totalPrice',
    'payTime', 'tags', 'remarkContent', 'isRefunded', 'operate'
  ],
  aliexpressColumn: [
    'selection', 'salesRecordNumber', 'orderStatus', 'orderNotes', 'productList', 'remainTime', 'aliexpressBuyerName', 'buyerCountryCode',
    'totalPrice', 'payTime', 'tags', 'remarkContent',
    'isRefunded', 'operate'
  ],
  amazonColumn: [
    'selection', 'salesRecordNumber', 'packageCode', 'amazonIsBusinessOrder', 'orderNotes', 'productList', 'buyerName', 'buyerCountryCode',
    'totalPrice', 'payTime', 'tags', 'remarkContent', 'isRefunded', 'operate'
  ],
  wishColumn: [
    'selection', 'salesRecordNumber', 'orderNotes', 'platformOrderStatus', 'wishIsAdvancedLogistics', 'wishIsReReleased', 'wishIsPremiumcarrierUpgrade',
    'wishIsWishExpress', 'productList', 'buyerName', 'buyerCountryCode', 'totalPrice', 'salesTime', 'webstoreUpdatedDate', 'tags', 'remarkContent',
    'isRefunded', 'operate'
  ],
  ozonColumn: [
    'selection', 'salesRecordNumber', 'packageCode', 'orderNotes', 'productList', 'buyerName', 'buyerCountryCode', 'totalPrice', 'payTime', 'tags', 'remarkContent',
    'isRefunded', 'operate'
  ],
  tiktokColumn: [
    'selection', 'salesRecordNumber', 'packageCode', 'orderNotes', 'productList', 'buyerName', 'buyerCountryCode', 'totalPrice', 'payTime', 'tags', 'remarkContent',
    'isRefunded', 'operate'
  ],
  defaultColumn: [
    'selection', 'salesRecordNumber', 'orderNotes', 'productList', 'buyerName', 'buyerCountryCode', 'totalPrice', 'payTime', 'tags', 'remarkContent',
    'isRefunded', 'operate'
  ]
}
