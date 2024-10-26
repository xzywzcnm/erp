let api = {
  // 第三方服务仓库
  thirdStoreQuery: '/packageInfo/thirdStoreQuery' // 列表查询
};
for (let key in api) {
  api[key] = `/wms-service${api[key]}`;
}
export default api;
