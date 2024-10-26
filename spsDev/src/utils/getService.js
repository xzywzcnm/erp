// import {getService, getWarehouseId} from '@/utils/getService';
import store from '@/store/store';
import common from '@/utils/common';

const serviceList = {
  '/setting-service/': 'menuSetting',
  '/order-service/': 'menuOrder',
  '/cs-service/': 'menuCustomer',
  '/product-service/': 'menuProduct',
  '/sps-service/': 'menuSps',
  '/pds-service/': 'menuPds',
  '/wms-service/': 'menuWms',
  '/generalSettings.html': 'menuSetting',
  '/commonOrder.html': 'menuOrder',
  '/ebay.html': 'menuOrder', // 订单有多个平台，还需要平台的判断
  '/aliexpress.html': 'menuOrder',
  '/amazon.html': 'menuOrder',
  '/wish.html': 'menuOrder',
  '/definePlatform.html': 'menuOrder',
  '/customer.html': 'menuCustomer',
  '/productCenter.html': 'menuProduct',
  '/supplierPurchase.html': 'menuSps',
  '/pds.html': 'menuPds',
  '/wms.html': 'menuWms'
}
export function getUrlParams () {
  const newUrl = decodeURIComponent(window.location.href);
  if (newUrl.indexOf('?') === -1) return {};
  const urlOption = newUrl.substring(newUrl.indexOf('?') + 1);
  const urlList = urlOption.split('&');
  let urlJson = {};
  urlList.forEach(item => {
    const pos = item.indexOf('=');
    urlJson[item.substring(0, pos)] = item.substring(pos + 1);
  })
  return urlJson;
}

export function getService () {
  const index = location.pathname.lastIndexOf('/');
  let system = location.pathname.substring(0, index + 1);
  if (system === '/') {
    system = location.pathname.substring(index);
  }
  return serviceList[system] || '';
}
// 获取连接上传仓库ID
export function getWarehouseId () {
  const paramsJson = getUrlParams();
  if (common.isEmpty(paramsJson)) return '';
  return (common.isEmpty(paramsJson['warehouseId']) || paramsJson['warehouseId'] === 'undefined') ? '' : paramsJson['warehouseId'];
}
// 通过链接上的仓库ID 获取仓库信息
export function getWareHouseItem (id) {
  let wareItemId = id;
  if (!wareItemId || typeof wareItemId !== 'string') {
    const paramsJson = getUrlParams();
    wareItemId = paramsJson['warehouseId'] || '';
  }
  if (!wareItemId) return {};
  const wareItem = (store.state.warehouseList || []).find(val => {
    return val.warehouseId === wareItemId;
  });
  return JSON.stringify(wareItem);
}
