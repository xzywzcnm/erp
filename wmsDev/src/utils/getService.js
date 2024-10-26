// import {getService, getWarehouseId} from '@/utils/getService';
import store from '@/store/store';
import common from '@/utils/common';

export const serviceList = {
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
export function getUrlParams() {
  return common.getUrlParams();
}

export function getService() {
  const index = location.pathname.lastIndexOf('/');
  let system = location.pathname.substring(0, index + 1);
  if (system === '/') {
    system = location.pathname.substring(index);
  }
  return serviceList[system] || '';
}
// 获取连接上传仓库ID
export function getWarehouseId() {
  const storeWarehouseId = store.state.warehouseId;
  if (!common.isEmpty(storeWarehouseId)) return storeWarehouseId;
  const paramsJson = getUrlParams();
  const getItemId = localStorage.getItem('warehouseId');
  const idEmpty = (common.isEmpty(getItemId, true) || ['null', 'undefined'].includes(getItemId));
  if (common.isEmpty(paramsJson)) return idEmpty ? '' : getItemId;
  if (common.isEmpty(paramsJson['warehouseId'], true) || ['undefined', 'null'].includes(paramsJson['warehouseId'])) return idEmpty ? '' : getItemId;
  return paramsJson['warehouseId'];
}
// 通过链接上的仓库ID 获取仓库信息
export function getWareHouseItem(id) {
  let wareItemId = id;
  if (!wareItemId || typeof wareItemId !== 'string') {
    const paramsJson = getUrlParams();
    wareItemId = paramsJson['warehouseId'] || '';
  }
  if (!wareItemId) return {};
  const wareItem = (store.state.warehouseList || []).find(val => {
    return val.warehouseId === wareItemId;
  });
  // return JSON.stringify(wareItem);
  return wareItem || {};
}
