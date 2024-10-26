export default {
  getAli1688ProductInfo: "/pds/dataCollection/getAli1688ProductInfo", // 获取1688商品信息
  getAlibabaAccountInfoByApi:
    "/pds/purchase/management/getAlibabaAccountInfoByApi", // 从老REP获取1688账号信息
  createAlibabaOrderByApi: "/pds/purchase/management/createAlibabaOrderByApi", // 1688下单
  getAlibabaOrderLogisticsInfoByApi:
    "/pds/purchase/management/getAlibabaOrderLogisticsInfoByApi", // 查看1688订单状态
  sendProductInfoToErp: "/pds/workbench/product/sendProductInfoToErp", // 订单推送
  sendProductInfoToErpByBatch:
    "/pds/workbench/product/sendProductInfoToErpByBatch" // 批量推送
};
