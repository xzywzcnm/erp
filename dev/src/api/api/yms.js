const YmsApi = {
  post_ymsProductCategory_shopping_queryAll: '/yms-core-service/ymsProductCategory/api/queryAll' // 商城--获取所有分类
};

for (let key in YmsApi) {
  YmsApi[key] = './erpCommon' + YmsApi[key];
}

let api = Object.assign({}, YmsApi);
export default api;
