// 订单检索-搜索栏设置
export const filterKey = {
  ebay: [
    'saleAccountIds', 'tagIdList', 'payTime', 'isDeliveryList', 'orderNo', 'webstoreOrderIds', 'refundTime', 'webstoreSku', 'webstoreItemId',
    'webstoreItemId', 'buyerCountryCodeList', 'buyerName', 'buyerAccountId', 'currency', 'minTotalPrice', 'maxTotalPrice', 'warehouseType',
    'deliveryStatusList', 'packageCode', 'packageType', 'hasTrackingNumber', 'isRedelivery', 'isAbnormal', 'isInvalid', 'isHand',
    'isRefunded', 'isPartRefunded', 'hasAfterSalesOrder', 'isLate', 'searchValue', 'merchantShippingMethodId', 'refundStartTime', 'refundEndTime',
    'feedbackList', 'requestTypeList', 'productStatus', 'mapperSkuList', 'warehouseCode', 'trackingNumberList', 'merchantCarrierId', 'isGoodMiss',
    'payStartTime', 'payEndTime'
  ],
  amazon: [
    'saleAccountIds', 'tagIdList', 'payTime', 'isDeliveryList', 'orderNo', 'webstoreOrderIds', 'amazonIsPrime', 'refundTime', 'webstoreSku', 'webstoreItemId',
    'webstoreItemId', 'buyerCountryCodeList', 'buyerName', 'buyerAccountId', 'amazonIsBusinessOrder', 'currency', 'minTotalPrice', 'maxTotalPrice',
    'warehouseType', 'deliveryStatusList', 'packageCode', 'packageType', 'hasTrackingNumber', 'isRedelivery', 'isAbnormal', 'isInvalid', 'isHand',
    'isRefunded', 'isPartRefunded', 'hasAfterSalesOrder', 'asin', 'searchValue', 'merchantShippingMethodId', 'refundStartTime', 'refundEndTime',
    'productStatus', 'mapperSkuList', 'warehouseCode', 'trackingNumberList', 'merchantCarrierId', 'isGoodMiss',
    'payStartTime', 'payEndTime'
  ],
  otto: [
    'saleAccountIds', 'tagIdList', 'payTime', 'isDeliveryList', 'orderNo', 'webstoreOrderIds', 'refundTime', 'webstoreSku', 'webstoreItemId',
    'webstoreItemId', 'buyerCountryCodeList', 'buyerName', 'buyerAccountId', 'currency', 'minTotalPrice', 'maxTotalPrice', 'warehouseType',
    'deliveryStatusList', 'packageCode', 'packageType', 'hasTrackingNumber', 'businessDeptIdList', 'isRedelivery', 'isAbnormal', 'isInvalid', 'isHand',
    'isRefunded', 'isPartRefunded', 'hasAfterSalesOrder', 'searchValue', 'merchantShippingMethodId', 'payStartTime', 'payEndTime',
    'productStatus', 'mapperSkuList', 'warehouseCode', 'trackingNumberList', 'merchantCarrierId', 'isGoodMiss', 'refundStartTime', 'refundEndTime',
  ],
  vova: [
    'saleAccountIds', 'tagIdList', 'payTime', 'isDeliveryList', 'orderNo', 'webstoreOrderIds', 'refundTime', 'webstoreSku', 'webstoreItemId',
    'webstoreItemId', 'buyerCountryCodeList', 'buyerName', 'buyerAccountId', 'currency', 'minTotalPrice', 'maxTotalPrice', 'warehouseType',
    'deliveryStatusList', 'packageCode', 'packageType', 'hasTrackingNumber', 'vovaIsCombinedOrder', 'isRedelivery', 'isAbnormal', 'isInvalid', 'isHand',
    'isRefunded', 'isPartRefunded', 'hasAfterSalesOrder', 'searchValue', 'merchantShippingMethodId', 'payStartTime', 'payEndTime',
    'productStatus', 'mapperSkuList', 'warehouseCode', 'trackingNumberList', 'merchantCarrierId', 'isGoodMiss', 'refundStartTime', 'refundEndTime',
  ],
  aliexpress: [
    'saleAccountIds', 'tagIdList', 'payTime', 'isDeliveryList', 'orderNo', 'webstoreOrderIds', 'refundTime', 'webstoreSku', 'webstoreItemId',
    'webstoreItemId', 'buyerCountryCodeList', 'buyerName', 'buyerAccountId', 'currency', 'minTotalPrice', 'maxTotalPrice', 'warehouseType',
    'deliveryStatusList', 'packageCode', 'packageType', 'hasTrackingNumber', 'isRedelivery', 'isAbnormal', 'isInvalid', 'isHand',
    'isRefunded', 'isPartRefunded', 'hasAfterSalesOrder', 'isCashOnDelivery', 'aliexpressIsCombinedOrder', 'aliexpressIsTenDaysOrder',
    'containsPlatformShippedTransaction', 'aliexpressAlreadyTaxedType', 'searchValue', 'trusteeshipType', 'merchantShippingMethodId',
    'productStatus', 'mapperSkuList', 'warehouseCode', 'trackingNumberList', 'merchantCarrierId', 'isGoodMiss',
    'payStartTime', 'payEndTime', 'refundStartTime', 'refundEndTime',
  ],
  shopify: [
    'saleAccountIds', 'tagIdList', 'payTime', 'isDeliveryList', 'orderNo', 'webstoreOrderIds', 'refundTime', 'webstoreSku', 'webstoreItemId',
    'webstoreItemId', 'buyerCountryCodeList', 'buyerName', 'buyerAccountId', 'currency', 'minTotalPrice', 'maxTotalPrice', 'warehouseType',
    'deliveryStatusList', 'packageCode', 'packageType', 'hasTrackingNumber', 'isRedelivery', 'isAbnormal', 'isInvalid', 'isHand',
    'isRefunded', 'isPartRefunded', 'hasAfterSalesOrder', 'isCashOnDelivery', 'searchValue', 'merchantShippingMethodId',
    'productStatus', 'mapperSkuList', 'warehouseCode', 'trackingNumberList', 'merchantCarrierId', 'isGoodMiss',
    'payStartTime', 'payEndTime', 'refundStartTime', 'refundEndTime',
  ],
  wish: [
    'saleAccountIds', 'tagIdList', 'payTime', 'isDeliveryList', 'orderNo', 'webstoreOrderIds', 'refundTime', 'webstoreSku', 'webstoreItemId',
    'webstoreItemId', 'buyerCountryCodeList', 'buyerName', 'buyerAccountId', 'currency', 'minTotalPrice', 'maxTotalPrice', 'warehouseType',
    'deliveryStatusList', 'packageCode', 'packageType', 'hasTrackingNumber', 'isRedelivery', 'isAbnormal', 'isInvalid', 'isHand',
    'isRefunded', 'isPartRefunded', 'hasAfterSalesOrder', 'wishPayCustomerVatRequired', 'wishIsCombinedOrder', 'wishIsAdvancedLogistics',
    'wishIsOptionalAdvancedLogistics', 'wishIsPremiumcarrierUpgrade', 'wishIsWishExpress', 'searchValue', 'merchantShippingMethodId',
    'productStatus', 'mapperSkuList', 'warehouseCode', 'trackingNumberList', 'merchantCarrierId', 'isGoodMiss',
    'payStartTime', 'payEndTime', 'refundStartTime', 'refundEndTime',
  ],
  allplatform: [
    'saleAccountIds', 'tagIdList', 'payTime', 'isDeliveryList', 'orderNo', 'webstoreOrderIds', 'refundTime', 'webstoreSku', 'webstoreItemId',
    'webstoreItemId', 'buyerCountryCodeList', 'buyerName', 'buyerAccountId', 'currency', 'minTotalPrice', 'maxTotalPrice', 'warehouseType',
    'deliveryStatusList', 'packageCode', 'packageType', 'hasTrackingNumber', 'isRedelivery', 'isAbnormal', 'isInvalid', 'isHand',
    'isRefunded', 'isPartRefunded', 'hasAfterSalesOrder', 'searchValue', 'merchantShippingMethodId', 'payStartTime', 'payEndTime',
    'productStatus', 'mapperSkuList', 'warehouseCode', 'trackingNumberList', 'merchantCarrierId', 'isGoodMiss', 'refundStartTime', 'refundEndTime',
  ],
  default: [
    'saleAccountIds', 'tagIdList', 'payTime', 'isDeliveryList', 'orderNo', 'webstoreOrderIds', 'refundTime', 'webstoreSku', 'webstoreItemId',
    'webstoreItemId', 'buyerCountryCodeList', 'buyerName', 'buyerAccountId', 'currency', 'minTotalPrice', 'maxTotalPrice', 'warehouseType',
    'deliveryStatusList', 'packageCode', 'packageType', 'hasTrackingNumber', 'isRedelivery', 'isAbnormal', 'isInvalid', 'isHand',
    'isRefunded', 'isPartRefunded', 'hasAfterSalesOrder', 'searchValue', 'merchantShippingMethodId', 'payStartTime', 'payEndTime',
    'productStatus', 'mapperSkuList', 'warehouseCode', 'trackingNumberList', 'merchantCarrierId', 'isGoodMiss', 'refundStartTime', 'refundEndTime',
  ]
}
// 已取消订单-搜索栏设置
export const cancelOrder = {
  ebay: [
    'saleAccountIds', 'tagIdList', 'payTime', 'isDeliveryList', 'orderNo', 'webstoreOrderIds', 'refundTime', 'webstoreSku', 'webstoreItemId',
    'webstoreItemId', 'buyerCountryCodeList', 'buyerName', 'buyerAccountId', 'currency', 'minTotalPrice', 'maxTotalPrice', 'warehouseType',
    'deliveryStatusList', 'packageCode', 'packageType', 'hasTrackingNumber', 'isRedelivery', 'isAbnormal', 'isInvalid', 'isHand',
    'isRefunded', 'isPartRefunded', 'hasAfterSalesOrder', 'isLate', 'searchValue', 'payStartTime', 'payEndTime', 'refundStartTime', 'refundEndTime',
  ],
  amazon: [
    'saleAccountIds', 'tagIdList', 'payTime', 'isDeliveryList', 'orderNo', 'webstoreOrderIds', 'amazonIsPrime', 'refundTime', 'webstoreSku', 'webstoreItemId',
    'webstoreItemId', 'buyerCountryCodeList', 'buyerName', 'buyerAccountId', 'amazonIsBusinessOrder', 'currency', 'minTotalPrice', 'maxTotalPrice',
    'warehouseType', 'deliveryStatusList', 'packageCode', 'packageType', 'hasTrackingNumber', 'isRedelivery', 'isAbnormal', 'isInvalid', 'isHand',
    'isRefunded', 'isPartRefunded', 'hasAfterSalesOrder', 'asin', 'searchValue', 'payStartTime', 'payEndTime', 'refundStartTime', 'refundEndTime',
  ],
  otto: [
    'saleAccountIds', 'tagIdList', 'payTime', 'isDeliveryList', 'orderNo', 'webstoreOrderIds', 'refundTime', 'webstoreSku', 'webstoreItemId',
    'webstoreItemId', 'buyerCountryCodeList', 'buyerName', 'buyerAccountId', 'currency', 'minTotalPrice', 'maxTotalPrice', 'warehouseType',
    'deliveryStatusList', 'packageCode', 'packageType', 'hasTrackingNumber', 'businessDeptIdList', 'isRedelivery', 'isAbnormal', 'isInvalid', 'isHand',
    'isRefunded', 'isPartRefunded', 'hasAfterSalesOrder', 'searchValue', 'payStartTime', 'payEndTime', 'refundStartTime', 'refundEndTime',
  ],
  vova: [
    'saleAccountIds', 'tagIdList', 'payTime', 'isDeliveryList', 'orderNo', 'webstoreOrderIds', 'refundTime', 'webstoreSku', 'webstoreItemId',
    'webstoreItemId', 'buyerCountryCodeList', 'buyerName', 'buyerAccountId', 'currency', 'minTotalPrice', 'maxTotalPrice', 'warehouseType',
    'deliveryStatusList', 'packageCode', 'packageType', 'hasTrackingNumber', 'vovaIsCombinedOrder', 'isRedelivery', 'isAbnormal', 'isInvalid', 'isHand',
    'isRefunded', 'isPartRefunded', 'hasAfterSalesOrder', 'searchValue', 'payStartTime', 'payEndTime', 'refundStartTime', 'refundEndTime',
  ],
  aliexpress: [
    'saleAccountIds', 'tagIdList', 'payTime', 'isDeliveryList', 'orderNo', 'webstoreOrderIds', 'refundTime', 'webstoreSku', 'webstoreItemId',
    'webstoreItemId', 'buyerCountryCodeList', 'buyerName', 'buyerAccountId', 'currency', 'minTotalPrice', 'maxTotalPrice', 'warehouseType',
    'deliveryStatusList', 'packageCode', 'packageType', 'hasTrackingNumber', 'isRedelivery', 'isAbnormal', 'isInvalid', 'isHand',
    'isRefunded', 'isPartRefunded', 'hasAfterSalesOrder', 'isCashOnDelivery', 'aliexpressIsCombinedOrder', 'aliexpressIsTenDaysOrder',
    'containsPlatformShippedTransaction', 'aliexpressAlreadyTaxedType', 'searchValue', 'trusteeshipType', 'payStartTime', 'payEndTime',
    'refundStartTime', 'refundEndTime',
  ],
  shopify: [
    'saleAccountIds', 'tagIdList', 'payTime', 'isDeliveryList', 'orderNo', 'webstoreOrderIds', 'refundTime', 'webstoreSku', 'webstoreItemId',
    'webstoreItemId', 'buyerCountryCodeList', 'buyerName', 'buyerAccountId', 'currency', 'minTotalPrice', 'maxTotalPrice', 'warehouseType',
    'deliveryStatusList', 'packageCode', 'packageType', 'hasTrackingNumber', 'isRedelivery', 'isAbnormal', 'isInvalid', 'isHand',
    'isRefunded', 'isPartRefunded', 'hasAfterSalesOrder', 'isCashOnDelivery', 'searchValue', 'payStartTime', 'payEndTime',
    'refundStartTime', 'refundEndTime',
  ],
  wish: [
    'saleAccountIds', 'tagIdList', 'payTime', 'isDeliveryList', 'orderNo', 'webstoreOrderIds', 'refundTime', 'webstoreSku', 'webstoreItemId',
    'webstoreItemId', 'buyerCountryCodeList', 'buyerName', 'buyerAccountId', 'currency', 'minTotalPrice', 'maxTotalPrice', 'warehouseType',
    'deliveryStatusList', 'packageCode', 'packageType', 'hasTrackingNumber', 'isRedelivery', 'isAbnormal', 'isInvalid', 'isHand',
    'isRefunded', 'isPartRefunded', 'hasAfterSalesOrder', 'wishPayCustomerVatRequired', 'wishIsCombinedOrder', 'wishIsAdvancedLogistics',
    'wishIsOptionalAdvancedLogistics', 'wishIsPremiumcarrierUpgrade', 'wishIsWishExpress', 'searchValue', 'payStartTime', 'payEndTime',
    'refundStartTime', 'refundEndTime',
  ],
  allplatform: [
    'saleAccountIds', 'tagIdList', 'payTime', 'isDeliveryList', 'orderNo', 'webstoreOrderIds', 'refundTime', 'webstoreSku', 'webstoreItemId',
    'webstoreItemId', 'buyerCountryCodeList', 'buyerName', 'buyerAccountId', 'currency', 'minTotalPrice', 'maxTotalPrice', 'warehouseType',
    'deliveryStatusList', 'packageCode', 'packageType', 'hasTrackingNumber', 'isRedelivery', 'isAbnormal', 'isInvalid', 'isHand',
    'isRefunded', 'isPartRefunded', 'hasAfterSalesOrder', 'searchValue', 'payStartTime', 'payEndTime', 'refundStartTime', 'refundEndTime',
  ],
  default: [
    'saleAccountIds', 'tagIdList', 'payTime', 'isDeliveryList', 'orderNo', 'webstoreOrderIds', 'refundTime', 'webstoreSku', 'webstoreItemId',
    'webstoreItemId', 'buyerCountryCodeList', 'buyerName', 'buyerAccountId', 'currency', 'minTotalPrice', 'maxTotalPrice', 'warehouseType',
    'deliveryStatusList', 'packageCode', 'packageType', 'hasTrackingNumber', 'isRedelivery', 'isAbnormal', 'isInvalid', 'isHand',
    'isRefunded', 'isPartRefunded', 'hasAfterSalesOrder', 'searchValue', 'payStartTime', 'payEndTime', 'refundStartTime', 'refundEndTime',
  ]
}
// 列表设置
export const columnKey = {
  ebay: [
    'selection', 'salesRecordNumber', 'packageCode', 'orderNotes', 'productList', 'buyerName', 'buyerCountryCodeList', 'totalPrice', 'payTime',
    'tags', 'remarkContent', 'operate'
  ],
  aliexpress: [
    'selection', 'salesRecordNumber', 'orderStatus', 'aliexpressNotes', 'orderRemark', 'productList', 'remainTime', 'buyerNameLevel',
    'buyerCountryCodeList', 'totalPrice', 'payTime', 'tags', 'remarkContent', 'operate'
  ],
  ozon: [
    'selection', 'salesRecordNumber', 'packageCode', 'orderNotes', 'productList', 'buyerName', 'buyerCountryCodeList', 'totalPrice', 'payTime',
    'tags', 'remarkContent', 'operate'
  ],
  tiktok: [
    'selection', 'salesRecordNumber', 'packageCode', 'orderNotes', 'productList', 'buyerName', 'buyerCountryCodeList', 'totalPrice', 'payTime',
    'tags', 'remarkContent', 'operate'
  ],
  default: [
    'selection', 'salesRecordNumber', 'orderNotes', 'productList', 'buyerName', 'buyerCountryCodeList', 'totalPrice', 'payTime', 'tags',
    'remarkContent', 'operate'
  ]
}
