import api from '@/api/api';
import axios from 'axios';
/**
 * 获取承运商
 * @param {*} warehouseId 仓库 ID
 * @returns
 */
export const getShippingList = (warehouseId) => {
  return new Promise((resolve) => {
    axios.get(`${api.get_enableCarriers}?warehouseId=${warehouseId}&isFilter=true&time=${new Date().getTime()}`).then(response => {
      if (response.data.code !== 0) return resolve({ success: false, data: [] });
      const newData = (response.data.datas || []).map(m => {
        return {
          ...m,
          isRetry: true,
          value: m.carrierId,
          label: m.carrierName,
          children: null,
          loading: false
        }
      });
      resolve({ success: true, data: newData });
    }).catch(() => {
      resolve({ success: false, data: [] });
    })
  });
}
/**
 * 获取承运商下的物流方式
 * carrierId 承运商 ID
 * warehouseId 仓库 ID
 */
export const getEnableShippingMethods = (carrierId, warehouseId) => {
  return new Promise((resolve) => {
    axios.get(`${api.get_enableShippingMethods}?warehouseId=${warehouseId}&carrierId=${carrierId}`).then(response => {
      if (response.data.code !== 0) return resolve({ success: false, data: [] });
      resolve({ success: true, data: response.data.datas || [] });
    }).catch(() => {
      resolve({ success: false, data: [] });
    })
  });
}
