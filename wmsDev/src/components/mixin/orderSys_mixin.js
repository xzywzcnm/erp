import api from '@/api/api';
import { getWarehouseId } from '@/utils/getService';

export default {
  data () {
    return {
      selectStore: getWarehouseId()
    };
  },
  methods: {
    showShippingDataApiMatch (val) {
      // api.get_enableCarriersApi 太分散 未集中处理
      // 提取公共方法  此方法用于 /matchTheLogistics 物流方式 所有平台
      let v = this;
      if (val) {
        if (v.selectStore) {
          let warehouseType = v.$store.state.warehouseList.filter(i => {
            if (i.warehouseId === v.selectStore) {
              return i;
            }
          })[0].warehouseType;
          v.axios.get(api.get_enableCarriers + '?warehouseId=' + v.selectStore + '&isFilter=true' + '&warehouseType=' + warehouseType).then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas;
              let pos = [];
              for (let i = 0; i < data.length; i++) {
                pos.push({
                  value: data[i].carrierId,
                  label: data[i].carrierName,
                  children: [],
                  loading: false,
                  carrierAccounts: data[i].carrierAccounts,
                  apiInterface: data[i].apiInterface
                });
                if (i === data.length - 1) {
                  v.shippingMethodData = pos;
                }
              }
            } else {
              v.$Message.error('系统繁忙，请重新尝试');
            }
          });
        }
      }
    },
    loadDataApiMatch (item, callback) {
      // api.get_enableCarriersApi 太分散 未集中处理
      // 提取公共方法  此方法用于 /matchTheLogistics 物流方式 所有平台
      item.loading = true;
      let v = this;
      v.axios.get(api.get_enableShippingMethods + '?carrierId=' + item.value + '&warehouseId=' + v.selectStore).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let pos = [];
          for (let i = 0; i < data.length; i++) {
            pos.push({
              value: [data[i].shippingMethodId, item.carrierAccounts],
              label: data[i].carrierShippingMethodName
            });
            if (i === data.length - 1) {
              item.children = pos;
              item.loading = false;
              callback();
            }
          }
          if (data.length === 0) {
            item.children = pos;
            item.loading = false;
            v.$Message.warning('没有相关记录');
            callback();
          }
        } else {
          item.loading = false;
          item.children = [];
          v.$Message.error('系统繁忙，请重新尝试');
        }
      }).catch(() => {
        item.loading = false;
        item.children = [];
        v.$Message.error('系统繁忙，请重新尝试');
      });
    },
    getAccountApiMatch (value, selectedData) {
      // api.get_enableCarriersApi 太分散 未集中处理
      // 提取公共方法  此方法用于 /matchTheLogistics 物流方式 所有平台
      let v = this;
      v.carrierAccount = [];
      if (value.length === 0) return false;
      v.shippingMethodModel = [];
      v.shippingAccountModel = null;
      v.apiInterfaceStatus = selectedData[0].apiInterface; // 存一下这个字段，当它为速卖通线上发货(API_AE_LG),eDIS物流(API_EDIS)的时候，不显示账号
      v.getCarrierBaseSettingApiMatch(value[1][0]);
      if (value[1][1] !== null) {
        v.carrierAccount = value[1][1];
      }
    },
    getCarrierBaseSettingApiMatch (shippingMethodId, model) {
      // api.get_enableCarriersApi 太分散 未集中处理
      // 提取公共方法  此方法用于 /matchTheLogistics 物流方式 所有平台
      let v = this;
      v.carrierBaseSetting = [];
      v.shippingMethodModel = [];
      v.axios.get(api.get_shippingMethodParamsApi + '?shippingMethodId=' + shippingMethodId + '&time=' + new Date().getTime() + Math.random() * 100).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          data.forEach((n, i) => {
            if (model) {
              v[model].push({
                paramKey: n.paramKey,
                paramValue: n.paramValue,
                title: n.paramName
              });
            } else {
              v.shippingMethodModel.push({
                paramKey: n.paramKey,
                paramValue: n.paramValue,
                title: n.paramName
              });
            }
          });
          v.carrierBaseSetting = data;
        } else {
          v.$Message.error('系统繁忙，请重新尝试');
        }
      });
    }
  }
};
