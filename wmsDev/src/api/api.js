import inventoryApi from './api/inventoryApi';
import outStockApi from './api/outStockApi';
import receiptApi from './api/receiptApi';
import wareManageApi from './api/wareManageApi';
import baseApi from './api/baseApi';
import carrierServiceApi from './api/carrierServiceApi';
import amazonFbaApi from './api/amazonFbaApi';
import winitApi from './api/winitApi';
import barnApi from './api/barnApi';
import fourPxApi from './api/fourPxApi';
import yuncangApi from './api/yuncangApi';
import pylApi from './api/pylApi';
import fbaApi from './api/fbaApi';
import shlApi from './api/shlApi';
import efApi from './api/efApi';
// eslint-disable-next-line no-unused-vars
import thirdApi from './api/thirdApi';
import warehouseApi from './api/warehouseApi';
import cneApi from './api/cneApi';
import directlyApi from './api/directlyApi';
import rinidApi from './api/rinidApi';
import novFireApi from './api/novFireApi';
import nfApi from './api/nfApi';
import amlApi from './api/amlApi';

const allApi = {
  inventoryApi: inventoryApi,
  outStockApi: outStockApi,
  receiptApi: receiptApi,
  wareManageApi: wareManageApi,
  baseApi: baseApi,
  carrierServiceApi: carrierServiceApi,
  amazonFbaApi: amazonFbaApi,
  winitApi: winitApi,
  barnApi: barnApi,
  fourPxApi: fourPxApi,
  yuncangApi: yuncangApi,
  pylApi: pylApi,
  fbaApi: fbaApi,
  shlApi: shlApi,
  warehouseApi: warehouseApi,
  thirdApi: thirdApi,
  efApi: efApi,
  cneApi: cneApi,
  rinidApi: rinidApi,
  nfApi: nfApi,
  amlApi: amlApi,
  directlyApi: directlyApi,
  novFireApi: novFireApi
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
