<template>
  <div>
    <!--批量修改仓库-->
    <Modal v-model="modal1" width="1000" :mask-closable="false" @on-visible-change="visibleFn">
      <div slot="header">
        <div class="color-fff">
          <h2 class="header-tit">修改仓库</h2><span>该操作会将所选记录按照更改后，将会重新执行智能物流规则。</span>
        </div>
      </div>
      <Form>
        <Form-item label="选择修改后仓库">
          <dyt-select style="width:210px" v-model="warehouseId" transfer>
            <Option v-for="(item,index) in allStorelist" :key="index" :value="item.warehouseId">{{ item.warehouseName }}</Option>
          </dyt-select>
        </Form-item>
      </Form>
      <Table highlight-row border :loading="loading1" :columns="columns1" :data="data1" @on-selection-change="checkDataFn">
      </Table>
      <div slot="footer">
        <Button @click="modifyWarehouse" type="primary" :loading="warehouseLoading">确认修改 </Button>
        <Button @click="modal1 = false">取消</Button>
      </div>
    </Modal>
    <!--批量物流方式-->
    <Modal v-model="modal2" width="1000" title="修改物流方式" :mask-closable="false" @on-visible-change="visibleFn1">

      <Tabs type="card" @on-click="tabResetShip">
        <TabPane v-for="(item,index) in data3" v-model="shipIndex" :key="index" :name="index+''" :label="item.warehouseName">
          <Form class="setAllMarkRead" style="margin-top:10px">
            <Row>
              <Col :span="14">
              <Form-item label="实际发货物流方式：" :label-width="120">
                <Cascader :data="shippingMethodData" @on-visible-change="showShippingDataApiMatch" v-model="value2" :load-data="loadDataApiMatch" @on-change="getAccountApiMatch" transfer></Cascader>
              </Form-item>
              </Col>
              <Col :span="9" :offset="1" v-if="isOnlineShip === 0 && carrierAccount.length > 0 && !isPms">
              <Form-item label="帐号：" :label-width="60">
                <dyt-select v-model="shippingAccountModel">
                  <Option v-for="(item,index) in carrierAccount" v-if="item.carrierAccountId !== null" :key="index" :value="item.carrierAccountId">{{ item.account }}</Option>
                </dyt-select>
              </Form-item>
              </Col>
            </Row>
          </Form>
          <div class="matchLogisticSetting">
            <h6>物流相关设置</h6>
          </div>
          <Form class="setAllMarkRead white-space-nowrap-form" style="margin-top:10px">
            <Row>
              <Col :span="12" v-for="(item,index) in carrierBaseSetting" :key="index">
              <Form-item v-if="item.paramType === 'hide'" v-show="false" :label="item.paramName" :label-width="100">
                <span>{{ item.paramValue }}</span>
              </Form-item>
              <Form-item v-else :label="item.paramName" :label-width="100">
                <Radio-group v-model="shippingMethodModel[index].paramValue" v-if="item.paramType === 'radio'">
                  <Radio :label="sItem.itemValue" v-for="(sItem,n) in item.dictionarys" :key="n">
                    <span>{{ sItem.itemName }}</span>
                  </Radio>
                </Radio-group>
                <!-- <Input v-if="item.paramType == 'input'" v-for="(sItem,n) in item.dictionarys" :key="n" v-model="shippingMethodModel[index].value"></Input> -->
                <Input v-if="item.paramType == 'input'" v-model="shippingMethodModel[index].paramValue"></Input>
                <Checkbox-group v-model="shippingMethodModel[index].paramValue" v-if="item.paramType == 'checkbox'">
                  <Checkbox v-for="(sItem,n) in item.dictionarys" :key="n" :label="sItem.itemValue">
                    <span>{{ sItem.itemName }}</span>
                  </Checkbox>
                </Checkbox-group>
                <dyt-select v-if="item.paramType === 'select'" v-model="shippingMethodModel[index].paramValue">
                  <Option v-for="(sItem,n) in item.dictionarys" :key="n" :value="sItem.itemValue"> {{ sItem.itemName }}</Option>
                </dyt-select>
                <span v-if="item.paramType === 'readOnly'">{{ item.paramValue }}</span>
              </Form-item>
              </Col>
            </Row>
          </Form>
          <Table highlight-row border :loading="loading1" :columns="columns1" :data="item.list" @on-selection-change="checkDataFn">
          </Table>
        </TabPane>
      </Tabs>
      <div slot="footer">
        <Button @click="modifyShipping" type="primary" :loading="mailLoading">确认修改 </Button>
        <Button @click="cancelModal2">取消</Button>
      </div>
    </Modal>
    <!--操作失败提醒-->
    <Modal v-model="modal3" width="1000" title="操作失败提醒" :mask-closable="false">
      <p>以下数据操作失败</p>
      <Table highlight-row border :columns="columns2" :data="data2"></Table>
      <div slot="footer">
        <Button @click="modal3 = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import orderSysMixin from '@/components/mixin/orderSys_mixin';
import publicServiceMixin from '@/components/mixin/publicService_mixin';

export default {
  name: 'batchModifyModal',
  mixins: [Mixin, publicServiceMixin, orderSysMixin],
  props: {
    orderIdLists: {
      type: Array,
      // 已选择的orderIds
      default: () => {
        return []
      }
    },
    orderDataProp: {
      type: Array,
      // 订单检索数据
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      carrierAccount: [],
      warehouseLoading: false,
      mailLoading: false,
      modal1: false,
      modal2: false,
      modal3: false,
      warehouseId: '',
      shipIndex: 0,
      checkData: [],
      columns1: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: 'No.',
          type: 'index',
          width: 60,
          align: 'center'
        }, {
          title: '订单号',
          align: 'center',
          key: 'salesRecordNumber',
          width: 140,
          render (h, params) {
            return h('div', {}, params.row.salesRecordNumber.map(i => {
              return h('p', i);
            }));
          }
        }, {
          title: '出库单号',
          align: 'center',
          key: 'packageCode',
          width: 140
        }, {
          title: '买家ID/姓名',
          align: 'center',
          key: 'index',
          width: 150,
          render (h, params) {
            return h('div', params.row.buyerAccountId + '/' + params.row.buyerName);
          }
        }, {
          title: '原仓库',
          align: 'center',
          key: 'warehouseName'
        }, {
          title: '原物流商',
          align: 'center',
          key: 'merchantCarrierName'
        }, {
          title: '原物流方式',
          align: 'center',
          key: 'merchantShippingMethodName'
        }, {
          title: '目的地',
          align: 'center',
          key: 'buyerCountryCode'
        }
      ],
      data1: [],
      columns2: [
        {
          title: '出库单号',
          key: 'packageCode',
          width: 140
        }, {
          title: '订单号',
          key: 'salesRecordNumber',
          width: 140,
          render (h, params) {
            return h('div', {}, params.row.salesRecordNumber.map(i => {
              return h('p', i);
            }));
          }
        }, {
          title: '失败原因',
          key: 'message'
        }
      ],
      data2: [],
      data3: [],
      shippingMethodData: [],
      value2: [],
      apiInterfaceStatus: null,
      isOnlineShip: 0,
      shippingAccountModel: null,
      carrierBaseSetting: [],
      shippingMethodModel: [],
      loading1: false,
      selectStoreId: null
    };
  },
  created () {

  },
  watch: {},
  methods: {
    tabResetShip (name) {
      // 切换tab 方法
      this.selectStoreId = this.data3[Number(name)].warehouseId;
      this.shipIndex = Number(name);
      this.resetShip();
    },
    resetShip () {
      // 清空物流数据
      this.shippingMethodData = [];
      this.carrierAccount = [];
      this.carrierBaseSetting = [];
      this.shippingMethodModel = [];
      this.value2 = [];
      this.checkData = [];
      this.shippingAccountModel = null;
    },
    matchSalesRecordNumber (data) {
      // 匹配订单号
      this.orderDataProp.forEach(i => {
        data.forEach(j => {
          j.orderShippingOrderBoList.forEach(k => {
            if (i.orderId === k.orderId) {
              if (!j.salesRecordNumber) {
                j.salesRecordNumber = [];
              }
              j.salesRecordNumber.push(i.accountCode + '-' + i.salesRecordNumber);
            }
          });
        });
      });
      return data;
    },
    visibleFn (open) {
      // modal打开 （仓库）
      if (open) {
        this.getAllstore(0); // 获取仓库
        this.warehouseId = '';
        this.getOrder().then((data) => {
          this.data1 = [];
          if (data.length === 0) {
            this.modal1 = false;
            return;
          }
          this.data1 = this.matchSalesRecordNumber(data); // 匹配订单号
        });
        this.checkData = [];
      }
    },
    visibleFn1 (open) {
      // modal打开 （物流方式）
      if (open) {
        this.resetShip();
        this.getAllstore(0).then(() => {
          this.getOrder().then((data) => {
            this.data3 = [];
            if (data.length === 0) {
              this.cancelModal2();
              return;
            }
            data = this.matchSalesRecordNumber(data); // 匹配订单号
            // 根据仓库进行分tab
            data.forEach(i => {
              if (this.data3.map(j => j.warehouseId).includes(i.warehouseId)) {
                this.data3.forEach(k => {
                  if (i.warehouseId === k.warehouseId) {
                    k.list.push(i);
                  }
                });
              } else {
                this.data3.push({
                  warehouseId: i.warehouseId,
                  warehouseName: i.warehouseName,
                  list: [i]
                });
              }
            });
            this.selectStoreId = this.data3[0].warehouseId;
          });
          this.checkData = [];
        });
      }
    },
    getOrder () {
      // 根据订单获取包裹数据
      return new Promise(resolve => {
        this.loading1 = true;
        this.axios.post(api.get_orderShippingInfoByOrder, {
          filterBlankWarehouse: 1,
          orderIdList: this.orderIdLists
        }).then(response => {
          this.loading1 = false;
          if (response.data.code === 0) {
            if (response.data.datas.length === 0) {
              this.$Message.info('无相关发货信息');
            }
            resolve(response.data.datas);
          }
        }).catch(() => {
          this.loading1 = false;
        });
      });
    },
    failData (failData, data) {
      /**
       * 展示失败的数据
       * @param failData Array 失败
       * @param Data Array
       * */
      if (failData && failData.length > 0) {
        failData.forEach(i => {
          data.forEach(j => {
            if (i.orderShippingId === j.orderShippingId) {
              i.salesRecordNumber = j.salesRecordNumber;
              i.packageCode = j.packageCode;
            }
          });
        });
        this.data2 = failData;
        this.modal3 = true;
      }
    },
    cancelModal2 () {
      this.modal2 = false;
      this.isPms = false;
    },
    modifyShipping () {
      // 修改物流商
      if (this.checkData.length === 0) {
        this.$Message.info('未选择数据');
        return;
      }

      if (this.value2.length < 1) {
        this.$Message.error('请选择物流渠道');
        return;
      }
      if (this.$common.isEmpty(this.shippingAccountModel) && this.isOnlineShip === 0 && !this.isPms) {
        this.$Message.error('账号不能为空');
        return false;
      }
      this.mailLoading = true;
      this.showLoading();
      this.axios.put(api.put_batchReplaceShippingMethod, {
        'carrierAccountId': this.shippingAccountModel,
        'merchantCarrierId': this.value2[0],
        'merchantShippingMethodId': this.value2[1][0],
        'orderShippingIdList': this.checkData.map(i => i.orderShippingId),
        'packageCarrierParam': this.shippingMethodModel
      }).then(response => {
        this.$Spin.hide();
        this.mailLoading = false;
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.failData(response.data.datas, this.data3[this.shipIndex].list);
          // 多个tab
          if (this.data3.length > 1) {
            this.resetShip();
            this.checkData = [];
            this.data3.splice(this.shipIndex, 1);
            this.shipIndex = 0;
            this.selectStoreId = this.data3[0].warehouseId;
          } else {
            this.cancelModal2();
          }
          this.$emit('getList');
        }
      });
    },
    modifyWarehouse () {
      // 修改仓库
      if (this.checkData.length === 0) {
        this.$Message.info('未选择数据');
        return;
      }
      if (!this.warehouseId) {
        this.$Message.error('未选择仓库');
        return;
      }
      this.warehouseLoading = true;
      this.showLoading();
      this.axios.put(api.put_batchUpdateWarehouse, {
        'orderShippingIdList': this.checkData.map(i => i.orderShippingId),
        'warehouseId': this.warehouseId
      }).then(response => {
        this.$Spin.hide();
        this.warehouseLoading = false;
        if (response.data.code === 0) {
          this.$emit('getList');
          this.$Message.success('操作成功');
          this.modal1 = false;
          this.failData(response.data.datas, this.data1);
        }
      });
    },
    checkDataFn (data) {
      this.checkData = data;
    }
  }
};
</script>

<style scoped>
.color-fff {
  color: #ffffff;
}

.header-tit {
  display: inline-block;
  margin-right: 15px;
  font-size: 14px;
}
</style>
