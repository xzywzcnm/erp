/*
  *** 订单系统公共代码,请不要在这里写其他系统特例或者业务代码
*/
import api from '@/api/api';

export default {
  data () {
    return {
      isPms: false,
      ignoreList: [
        {
          label: '忽略',
          value: 1
        }, {
          label: '未忽略',
          value: 0
        }
      ],
      rowCellSetting: 1, // 1 分行 2 分列
      rowCellSettingList: [
        {
          label: '分行', // 分行
          value: 1
        }, {
          label: '分列', // 分列
          value: 2
        }
      ]
    };
  },
  activated () {
    if (this.reset) {
      this.reset();
    }
    if (this.tableLoading) {
      this.tableLoading = true;
    }
    if (this.startLoading) {
      this.startLoading();
    }
  },
  methods: {
    isSearch (obj) {
      let copyParams = this.$common.copy(obj);
      delete copyParams.pageNum;
      delete copyParams.pageSize;
      delete copyParams.platformId;
      delete copyParams.currency;
      delete copyParams.upDown;
      delete copyParams.orderBy;
      const availed = Object.keys(copyParams).find(key => {
        if (this.typeOf(copyParams[key]) === 'array') {
          if (copyParams[key].length > 0) {
            return true;
          }
        } else if (!this.$common.isEmpty(copyParams[key])) {
          return true;
        }
      })
      return !this.$common.isEmpty(availed);
    },
    startCancelDelivery () {
      this.$refs['cancelDelivery'].cancelDelivery();
    },
    markIgnoredBatch () {
      // 批量忽略标记发货
      this.axios.post(api.batchSyncIgnore,
        {
          orderIdList: this.orderIdList
        })
        .then(response => {
          if (response.data.code === 0) {
            this.$Message.success('操作成功');
            this.searchOrder();
          }
        });
    },
    markIgnoredBatchWay () {
      // 批量忽略标记发货
      if (this.orderIdList.length === 0) {
        this.$Message.error('未选择数据');
        return;
      }
      this.axios.post(api.batchSyncIgnoreWay, {
        orderIdList: this.orderIdList
      })
        .then(response => {
          if (response.data.code === 0) {
            this.$Message.success('操作成功');
            this.searchOrder();
          }
        });
    },
    markIgnored (id) {
      // 单个忽略
      this.axios.put(api.syncIgnore + id)
        .then(response => {
          if (response.data.code === 0) {
            this.$Message.success('操作成功');
            this.searchOrder();
          }
        });
    },
    reductionMt (id) {
      this.axios.put(api.cancelSyncIgnore + id)
        .then(response => {
          if (response.data.code === 0) {
            this.$Message.success('操作成功');
            this.searchOrder();
          }
        });
    },
    batchModifyWarehouse () {
      /**
       * 批量修改仓库
       * */
      if (this.$refs.batchModifyModal) {
        if (this.orderIdList && this.orderIdList.length === 0) {
          this.$Message.info('未选择数据');
          return;
        }
        this.$refs.batchModifyModal.modal1 = true;
      }
    },
    batchModifyShippingMethod () {
      /**
       * 批量修改邮寄方式
       * */
      if (this.$refs.batchModifyModal) {
        if (this.orderIdList && this.orderIdList.length === 0) {
          this.$Message.info('未选择数据');
          return;
        }
        this.$refs.batchModifyModal.isPms = false;
        this.$nextTick(() => {
          this.$refs.batchModifyModal.modal2 = true;
        })
      }
    },
    getAccountCode (pos, saleAccountIdPos) { // get accountcode common method
      return new Promise(resolve => {
        this.axios.post(api.get_saleAccountById + '?saleAccountIds=' + saleAccountIdPos).then(response => {
          if (response && response.data && response.data.code === 0) {
            let list = response.data.datas;
            // 订单检索 批量联系买家
            this.contactAccountList = list;
            if (list.length > 0) {
              for (let i = 0; i < list.length; i++) {
                for (let t = 0; t < pos.length; t++) {
                  if (pos[t].saleAccountId === list[i].saleAccountId) {
                    pos[t].accountCode = list[i].accountCode;
                  }
                  if (i === list.length - 1 && t === pos.length - 1) {
                    resolve(pos);
                  }
                }
              }
            } else {
              resolve(pos);
            }
          } else {
            resolve(pos);
          }
        }).catch((err) => {
          console.error(err);
          resolve(pos);
        });
      });
    },
    getOrderCommonParameter () {
      return new Promise(resolve => {
        if (this.$store.state.commonParameter.length > 0 &&
          this.$store.state.commonParameter[0].parameterCode === this.inGroup) {
          resolve();
          return;
        }
        this.axios.post(api.get_orderCommonParameter, {
          'parameterName': 'shipmentType',
          parameterCode: this.inGroup
        })
          .then(response => {
            if (response.data.code === 0) {
              this.$store.commit('commonParameter', response.data.datas);
              resolve();
            }
          });
      });
    },
    getProductList (pos, orderIdPos) {
      return new Promise(resolve => {
        this.axios.post(api.get_orderProductList + '?orderIds=' + orderIdPos).then(response => {
          if (response && response.data && response.data.code === 0) {
            let list = response.data.datas;
            if (list.length > 0) {
              for (let i = 0; i < list.length; i++) {
                for (let t = 0; t < pos.length; t++) {
                  if (pos[t].orderId === list[i].orderId) {
                    if (list[i].pictureUrl === '' || list[i].pictureUrl === null) {
                      list[i].pictureUrl = this.placeholderSrc;
                    }
                    pos[t].productList.push(list[i]);
                    if (i === list.length - 1) {
                      resolve(pos);
                    }
                  }
                }
              }
            } else {
              resolve(pos);
            }
          } else {
            resolve(pos);
          }
        }).catch((err) => {
          console.error(err);
          resolve(pos);
        });
      });
    },
    getOrderRemark (pos, orderIdPos) {
      return new Promise(resolve => {
        this.axios.post(api.get_orderRemark, orderIdPos).then(response => {
          if (response && response.data && response.data.code === 0) {
            let list = response.data.datas;
            if (list && list.length > 0) {
              list.forEach(i => {
                pos.forEach(j => {
                  if (i.orderId === j.orderId) {
                    j.remarkContent = i.remarkContent;
                  }
                });
              });
            }
            resolve(pos);
          } else {
            resolve(pos);
          }
        }).catch((err) => {
          console.error(err);
          resolve(pos);
        });
      });
    },
    getPlatformOrderStatus (platformOrderStatus) {
      if (platformOrderStatus !== null) {
        return this.platformOrderStatusObj[platformOrderStatus];
      } else {
        return '';
      }
    },
    getPlatformName (platformArr) { // 获取对应平台名字
      return new Promise(resolve => {
        this.axios.post(api.get_platformIdToName, JSON.stringify(platformArr))
          .then(response => {
            if (response.data.code === 0) {
              resolve(response.data.datas);
            }
          });
      });
    },
    getSitesName (sitesArr) { // 获取对应站点名字
      return new Promise(resolve => {
        this.axios.post(api.get_sitesIdToName, JSON.stringify(sitesArr))
          .then(response => {
            if (response.data.code === 0) {
              resolve(response.data.datas);
            }
          });
      });
    },
    getSalesAccountName (accountArr) { // 获取帐号名字
      return new Promise(resolve => {
        this.axios.post(api.get_accountIdToName, JSON.stringify(accountArr))
          .then(response => {
            if (response.data.code === 0) {
              resolve(response.data.datas);
            }
          });
      });
    },
    showShippingDataApiMatchNoWarehouse (val) {
      // api.get_enableCarriersApi 太分散 未集中处理
      // 提取公共方法  此方法用于 /matchTheLogistics 物流方式 所有平台
      if (val) {
        this.axios.get(api.erpServiceCommon + api.get_enableCarriersApi + '?isFilter=true')
          .then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas;
              let pos = [];
              for (let i = 0; i < data.length; i++) {
                pos.push({
                  ...data[i],
                  value: data[i].carrierId,
                  label: data[i].carrierName,
                  children: val === 'erpTreeSelect' ? null : [],
                  loading: false
                });
                if (val === 'erpTreeSelect' && this.treeJson) {
                  this.$set(this.treeJson, data[i].carrierId, pos[i]);
                }

                if (i === data.length - 1) {
                  this.shippingMethodData = pos;
                }
              }
            }
          });
      }
    },
    loadDataApiMatchNoWarehouse (item, callback, type) {
      // api.get_enableCarriersApi 太分散 未集中处理
      // 提取公共方法  此方法用于 /matchTheLogistics 物流方式 所有平台
      item.loading = true;
      return new Promise(resolve => {
        this.axios.get(api.erpServiceCommon + api.get_enableShippingMethodsApi + '?carrierId=' + item.value).then(response => {
          resolve(response.data && response.data.datas ? response.data.datas || [] : []);
          if (type) return;
          if (response.data.code === 0) {
            let data = response.data.datas;
            let pos = [];
            for (let i = 0; i < data.length; i++) {
              pos.push({
                value: [
                  data[i].shippingMethodId,
                  item.carrierAccounts
                ],
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
              this.$Message.warning('没有相关记录');
              callback();
            }
          } else {
            item.loading = false;
            item.children = [];
          }
        }).catch(() => {
          item.loading = false;
          item.children = [];
          resolve([])
          // this.$Message.error('系统繁忙，请重新尝试');
        });
      })
    },
    commaSeparation (data) {
      let obj = null;
      if (data) {
        obj = [];
        if (data.includes(',')) {
          obj = data.split(',');
        } else if (data.includes('\n')) {
          obj = data.split('\n');
        } else if (data.includes('，')) {
          obj = data.split('，');
        } else {
          obj = [data];
        }
      }
      return obj;
    },
    orderToRetrieveParams (obj) {
      if (!this.isCancelOrder) {
        // 不是取消订单页面
        obj.trackingNumberList = this.commaSeparation(this.trackingNumbers);
        obj.webstoreOrderIds = this.commaSeparation(obj.webstoreOrderIds);
        /* if (this.trackingNumbers) {
          if (this.trackingNumbers.includes(',')) {
            obj.trackingNumberList = this.trackingNumbers.split(',');
          } else if (this.trackingNumbers.includes('\n')) {
            obj.trackingNumberList = this.trackingNumbers.split('\n');
          } else {
            obj.trackingNumberList = [this.trackingNumbers];
          }
        } else {
          obj.trackingNumberList = null;
        } */

        /* if (obj.webstoreOrderIds) {
          if (obj.webstoreOrderIds.includes(',')) {
            obj.webstoreOrderIds = obj.webstoreOrderIds.split(',');
          } else if (obj.webstoreOrderIds.includes('\n')) {
            obj.webstoreOrderIds = obj.webstoreOrderIds.split('\n');
          } else {
            obj.webstoreOrderIds = [obj.webstoreOrderIds];
          }
        } else {
          obj.webstoreOrderIds = null;
        } */

        if (this.value2.length > 1) {
          obj.merchantCarrierId = this.value2[0];
          obj.merchantShippingMethodId = this.value2[1][0];
        } else {
          obj.merchantShippingMethodId = null;
        }
      }

      return obj;
    },
    showShippingDataApiMatch (val) {
      // api.get_enableCarriersApi 太分散 未集中处理
      // 提取公共方法  此方法用于 /matchTheLogistics 物流方式 所有平台
      if (val) {
        if (this.selectStoreId) {
          let wareList = this.allStorelist.filter(i => {
            return i.warehouseId === this.selectStoreId;
          });
          let warehouseType = wareList[0] && wareList[0].warehouseType;
          this.axios.get(api.erpServiceCommon + api.get_enableCarriersApi + '?warehouseId=' + this.selectStoreId + '&isFilter=true' + '&warehouseType=' + warehouseType)
            .then(response => {
              if (response.data.code === 0) {
                let data = response.data.datas;
                let pos = [];
                for (let i = 0; i < data.length; i++) {
                  pos.push({
                    ...data[i],
                    value: data[i].carrierId,
                    label: data[i].carrierName,
                    children: [],
                    loading: false
                  });
                  if (i === data.length - 1) {
                    this.shippingMethodData = pos;
                  }
                }
              }
            });
        }
      }
    },
    loadDataApiMatch (item, callback) {
      // api.get_enableCarriersApi 太分散 未集中处理
      // 提取公共方法  此方法用于 /matchTheLogistics 物流方式 所有平台
      item.loading = true;
      this.axios.get(api.erpServiceCommon + api.get_enableShippingMethodsApi + '?carrierId=' + item.value + '&warehouseId=' + this.selectStoreId)
        .then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            let pos = [];
            for (let i = 0; i < data.length; i++) {
              pos.push({
                value: [
                  data[i].shippingMethodId,
                  item.carrierAccounts
                ],
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
              this.$Message.warning('没有相关记录');
              callback();
            }
          } else {
            item.loading = false;
            item.children = [];
          }
        })
        .catch(() => {
          item.loading = false;
          item.children = [];
          // this.$Message.error('系统繁忙，请重新尝试');
        });
    },
    getAccountApiMatch (value, selectedData) {
      // api.get_enableCarriersApi 太分散 未集中处理
      // 提取公共方法  此方法用于 /matchTheLogistics 物流方式 所有平台
      this.carrierAccount = [];
      if (value.length === 0) return false;
      this.shippingMethodModel = [];
      this.shippingAccountModel = null;
      this.apiInterfaceStatus = selectedData[0].apiInterface; // 存一下这个字段，当它为速卖通线上发货(API_AE_LG),eDIS物流(API_EDIS)的时候，不显示账号
      this.isOnlineShip = selectedData[0].isOnline; // 1 为线上发货 0不是线上发货
      const parentCheck = selectedData.find(f => !this.$common.isEmpty(f.isPms));
      if (!this.$common.isEmpty(parentCheck)) {
        this.isPms = [0, '0'].includes(parentCheck.isPms);
      } else {
        this.isPms = false;
      }
      this.getCarrierBaseSettingApiMatch(value[1][0]);
      if (value[1][1] !== null) {
        this.carrierAccount = value[1][1];
      }
    },
    getCarrierBaseSettingApiMatch (shippingMethodId, model) {
      // api.get_enableCarriersApi 太分散 未集中处理
      // 提取公共方法  此方法用于 /matchTheLogistics 物流方式 所有平台
      let getRes = [];
      const shippingMethodIds = shippingMethodId.split(',');
      this.carrierBaseSetting = [];
      this.shippingMethodModel = [];

      shippingMethodIds.forEach(item => {
        if (!this.$common.isEmpty(item)) {
          getRes.push(this.axios.get(`${api.get_shippingMethodParamsApi}?shippingMethodId=${item}&time=${new Date().getTime() + Math.random() * 100}`));
        }
      })

      Promise.all(getRes).then(res => {
        res.forEach(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            data.forEach((n, i) => {
              if (model) {
                this[model].push({
                  paramKey: n.paramKey,
                  paramValue: n.paramValue,
                  title: n.paramName
                });
              } else {
                this.shippingMethodModel.push(
                  {
                    paramKey: n.paramKey,
                    paramValue: n.paramValue,
                    title: n.paramName
                  }
                );
              }
            });
            this.carrierBaseSetting = [...this.carrierBaseSetting, ...data];
          }
        })
      })
    }
  }
};
