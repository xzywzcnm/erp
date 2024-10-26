let api = {};
for (let key in api) {
  api[key] = '/wms-service' + api[key];
}
export default api;