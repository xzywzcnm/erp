// 搜索栏字段
export const pageParamKey = {
  ebay: [
    'saleAccountIds', 'tagIdList', 'buyerCountryCodeList', 'searchValue', 'payDateTime', 'asin',
    'buyerAccountId', 'buyerName', 'webstoreItemId', 'webstoreSku', 'orderNo', 'amazonIsBusinessOrder', 'amazonIsPrime'
  ],
  ozon: [
    'saleAccountIds', 'buyerCountryCodeList', 'payDateTime', 'buyerNameList', 'webstoreSkuList', 'orderNo'
  ],
  walmart: [
    'saleAccountIds', 'tagIdList', 'buyerCountryCodeList', 'payDateTime', 'orderNo', 'buyerName', 'buyerAccountId', 'lapaSpuList', 'lapaSkuList'
  ],
  aliexpress: [
    'saleAccountIds', 'tagIdList', 'buyerCountryCodeList', 'payDateTime', 'orderNo', 'buyerName', 'buyerAccountId'
  ],
  amazon: [
    'saleAccountIds', 'tagIdList', 'buyerCountryCodeList', 'payDateTime', 'orderNo', 'buyerName', 'buyerAccountId', 'webstoreItemId',
    'webstoreSku', 'amazonIsBusinessOrder', 'amazonIsPrime', 'asin', 'searchValue',
  ],
  default: [
    'saleAccountIds', 'tagIdList', 'buyerCountryCodeList', 'searchValue', 'payDateTime', 'asin', 'buyerNameList',
    'buyerAccountId', 'buyerName', 'webstoreItemId', 'webstoreSku', 'orderNo', 'amazonIsBusinessOrder', 'amazonIsPrime'
  ]
};
// 对应平台表格列
export const platformColumnKey = {
  ebay: [
    'selection', 'orderId', 'trackingNumber', 'packageCode', 'orderTransactions', 'platformOrderStatus', 'skuMap', 'amazonIsPrime', 'buyerName',
    'buyerCountryCode', 'transactionPrice', 'salesTime', 'tags', 'remark'
  ],
  ozon: [
    'selection', 'orderId', 'orderTransactions', 'platformOrderStatus', 'skuMap', 'amazonIsPrime', 'buyerName', 'buyerCountryCode',
    'transactionPrice', 'payTime', 'tags', 'remark'
  ],
  walmart: [
    'selection', 'orderId', 'orderTransactions', 'skuMap', 'amazonIsPrime', 'buyerName', 'buyerCountryCode', 'transactionPrice', 'salesTime',
    'tags', 'remark'
  ],
  aliexpress: [
    'selection', 'orderId', 'platformOrderStatus', 'skuMap', 'buyerName', 'buyerCountryCode', 'transactionPrice', 'salesTime', 'tags',
    'remark', 'operate'
  ],
  amazon: [
    'selection', 'orderId', 'packageCode', 'amazonIsBusinessOrder', 'platformOrderStatus', 'skuMap', 'amazonIsPrime', 'buyerName',
    'buyerCountryCode', 'transactionPrice', 'salesTime', 'tags', 'remark'
  ],
  default: [
    'selection', 'orderId', 'trackingNumber', 'packageCode', 'orderTransactions', 'platformOrderStatus', 'skuMap', 'amazonIsPrime', 'buyerName',
    'buyerCountryCode', 'transactionPrice', 'salesTime', 'payTime', 'tags', 'remark'
  ]
};
// 对应平台接口的 API
export const platformApiKey = {
  ebay: {
    export: 'export_platformShippedOrderFBA'
  },
  ozon: {
    export: 'export_platformShippedOrderFBA'
  },
  walmart: {
    export: 'export_platformShippedOrder'
  },
  aliexpress: {
    export: 'export_platformShippedOrder'
  },
  amazon: {
    export: 'export_platformShippedOrderFBA'
  },
  default: {
    export: 'export_platformShippedOrderFBA'
  }
}
