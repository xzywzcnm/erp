import aliexpressApi from './api/aliexpress';
import orderApi from './api/orderApi';
import amazoneApi from './api/amazonApi';
import baseApi from './api/baseApi';
import carrierServiceApi from './api/carrierServiceApi';
import erpCommonApi from './api/erpCommonApi';
import generalSettingsApi from './api/generalSettingsApi';
import packageApi from './api/packageApi';
import paypalApi from './api/paypalApi';
import productCenterApi from './api/productCenterApi';
import roleApi from './api/roleApi';
import shipmentApi from './api/shipmentApi';
import tagApi from './api/tagApi';
import customerApi from './api/customerApi';
import ymsApi from './api/yms';
import commonApi from './api/commonApi';
import settingApi from './api/settingApi';
import templateSetting from './api/templateSetting';

const allApi = {
  aliexpressApi,
  orderApi,
  amazoneApi,
  baseApi,
  carrierServiceApi,
  erpCommonApi,
  generalSettingsApi,
  packageApi,
  paypalApi,
  productCenterApi,
  roleApi,
  shipmentApi,
  tagApi,
  customerApi,
  ymsApi,
  commonApi,
  settingApi,
  templateSetting
};

let api = {};
let allKeys = [];
Object.keys(allApi).forEach(key => {
  allKeys = [...allKeys, ...Object.keys(allApi[key])];
  api = { ...api, ...allApi[key] }
})

let apiKeys = [];
let repetitionKey = {};
allKeys.forEach(key => {
  if (apiKeys.includes(key)) {
    repetitionKey[key] = typeof repetitionKey[key] == 'number' ? repetitionKey[key] + 1 : 1;
  } else {
    apiKeys.push(key);
  }
})

const errorKey = Object.keys(repetitionKey);
if (errorKey.length > 0) {
  errorKey.forEach(errKey => {
    console.error(`api ${errKey} 命名重复 ${repetitionKey[errKey]} 次`);
  })
}

export default api;
