<style scoped>
.normalPaddingRight {
  padding-right: 10px
}
</style>
<style>
.newInputError .ivu-input, .newInputError .ivu-select-selection {
  border: 1px solid #eb6a4b !important;
}
</style>
<template>
  <div>
    <div class="packageDetailsTitle clear">
      <div class="fl">
        {{ packageInfo.packageCode }}
      </div>
      <div class="fr normalPaddingRight">
        <span class="icon iconfont orderBox normalPaddingRight">&#xe6b2;</span>
        <span class="normalPaddingRight">{{ packageInfo.buyerCountryCode }}</span> <span
        class="nationalFlag nationalFlagDetails"
        v-if="webstoreItemSite !== null"
        :class="['nationalFlag' + webstoreItemSite]"></span>
      </div>
    </div>
    <div class="packageDetailsProccessed">
      <Steps :current="getCurrent()">
        <Step
          :title="getDataToLocalTime(packageInfo.trackingNumberTime,'fulltime')" icon="upload"></Step>
        <Step
          :title="getDataToLocalTime(packageInfo.printTime,'fulltime')" icon="printer"></Step>
        <Step
          :title="getDataToLocalTime(packageInfo.despatchTime,'fulltime')" icon="paper-airplane"></Step>
      </Steps>
    </div>
    <div class="modalItem">
      <div class="modalItemHeader">
        <h6>地址 / 物流</h6>
      </div>
      <div class="modalItemContent">
        <div class="buyerMessageCotainer">
          <Row>
            <Col :span="12">
              <Row>
                <Col
                  :span="1" class="buyerIdName">ID:
                </Col>
                <Col
                  :span="23" class="buyerAddress">
                  <div>{{ packageInfo.buyerAccountId }}</div>
                </Col>
              </Row>
              <Row>
                <Col
                  :span="1" class="buyerAddressTo">
                  TO:
                </Col>
                <Col
                  :span="23" class="buyerAddress">
                  <div>{{ packageInfo.buyerName }}</div>
                  <div>{{ packageInfo.buyerAddress1 }}</div>
                  <div>{{ packageInfo.buyerAddress2 }}</div>
                  <div v-if="packageInfo.buyerMobile !== null">{{ packageInfo.buyerMobile }}</div>
                  <div v-if="packageInfo.buyerPhone !== null">{{ packageInfo.buyerPhone }}</div>
                  <div>{{ packageInfo.buyerCity }} {{ packageInfo.buyerState }} {{ packageInfo.buyerPostalCode }}</div>
                  <div>{{ packageInfo.buyerCountryCode }}</div>
                </Col>
              </Row>
            </Col>
            <Col
              :span="10" :offset="2">
              <div class="logisticsItem">
                <div class="actuallyLogisticsItemHeader">实际发货物流方式：<span class="blueColor fontWeight">{{ packageInfo.merchantCarrierName }} > {{ packageInfo.merchantShippingMethodIdName }} </span>
                </div>
                <div class="actuallyLogisticsItemHeader normalTop">运单号：
                  <span class="redColor fontWeight ">{{ packageInfo.trackingNumber }}</span></div>
                <div class="actuallyLogisticsItemHeader normalTop">实际重量：
                  <span class="blueColor fontWeight">{{ packageInfo.totalWeight }}</span></div>
                <div class="actuallyLogisticsItemHeader normalTop">仓库：
                  <span class="blueColor fontWeight">{{ storeName }}</span></div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
    <div class="modalItem">
      <div class="modalItemHeader">
        <h6>产品</h6>
      </div>
      <div
        class="modalItemContent" v-if="packageDetails !== ''">
        <div class="orderDetailsProductList">
          <div
            class="orderDetailsProductItem" v-for="(item, index) in packageDetails" :key="index">
            <Row>
              <Col :span="2">
                <div class="orderDetailsProductItemPic">
                  <img
                    :src="item.pictureUrl === null ? placeholderSrc : item.pictureUrl" :alt="item.title">
                </div>
              </Col>
              <Col
                :span="16" :offset="1">
                <Row>
                  <Col :span="17">
                    <div class="odpidProductID">
                      <span class="productID">{{ item.webstoreItemId }}</span>
                      <span class="productHaveATitle">SKU: <em>{{ item.sku }}</em></span>
                    </div>
                    <div class="odpidProductDetails">
                      {{ item.title }}
                    </div>
                    <div
                      class="odpidProductParams" v-if="item.variations !== null">
                      <span
                        class="productHaveATitle"
                        v-if="item.variations.indexOf('color') >= 0 && item.variations.indexOf(';') > 0">Color:<em>{{ item.variations.split(': ')[1].split(';')[0] }} </em></span>
                      <span
                        class="productHaveATitle"
                        v-if="item.variations.indexOf('color') >= 0 && item.variations.indexOf(';') < 0">Color:<em>{{ item.variations.split(': ')[1] }} </em></span>
                      <span
                        class="productHaveATitle" v-if="item.variations.toLowerCase().indexOf('pack of') >= 0">Pack of:<em>{{ item.variations.split(';')[1].split(': ')[1] }}</em></span>
                    </div>
                  </Col>
                  <Col
                    :span="5" :offset="2" class="orderDetailsQuantity">
                    <span>X {{ item.quantity }}</span>
                    <div
                      class="flexBox red" v-if="item.remark !== null">
                      <span class="icon iconfont">&#xe685;</span> {{ item.remark }}
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </div>
    <!-- 仓储物流 -->
    <!-- <div class="modalItem"> -->
    <!-- <div class="modalItemHeader">
      <h6>仓储物流</h6>
    </div> -->
    <!-- <div class="modalItemContent"> -->
    <!-- 发货仓库 -->
    <!-- <div style="margin:10px 20px;">
      仓库：
      <dyt-select v-if="editStoreStatus" v-model="selectStore" style="width:200px;marginRight:10px;">
        <Option v-for="(item,index) in storeList" :value="item.warehouseId" :key="index">{{ item.warehouseName }}</Option>
      </dyt-select>
      <span style="marginRight:10px;" v-if="!editStoreStatus">{{storeName}}</span>
      <span class="icon iconfont" @click="editStore()" v-if="!editStoreStatus">&#xe611;</span>
      <span class="icon iconfont orderSave" @click="editStoreSave()" v-if="editStoreStatus">&#xe615;</span>
      <span class="icon iconfont orderCancelSave" @click="cancelStoreEdit()" v-if="editStoreStatus">&#xe61a;</span>
    </div> -->
    <!-- 邮寄方式 -->
    <!-- <div style="margin:10px 20px;">
      邮寄方式：
      <Cascader v-if="editShippingStatus" style="width:200px;marginRight:10px;display:inline-block;" :data="shippingMethodData" @on-visible-change="showShippingData" v-model="value2" :load-data="loadData" @on-change="getAccount"></Cascader>
      <span style="marginRight:10px;" v-if="!editShippingStatus">{{packageInfo.merchantCarrierName}} > {{packageInfo.merchantShippingMethodIdName}}</span>
      <span class="icon iconfont" @click="editShipping()" v-if="!editShippingStatus">&#xe611;</span>
      <span class="icon iconfont orderSave" @click="editShippingSave()" v-if="editShippingStatus">&#xe615;</span>
      <span class="icon iconfont orderCancelSave" @click="cancelShippingEdit()" v-if="editShippingStatus">&#xe61a;</span>
      <div style="marginLeft:60px;marginTop:10px;">
        <dyt-select v-if="editShippingStatus" style="width:200px;marginRight:10px;" v-model="shippingAccountModel">
          <Option v-for="(item,index) in carrierAccount" v-if="item.carrierAccountId !== null" :key="index" :value="item.carrierAccountId">{{item.account}}</Option>
        </dyt-select>
        <span style="marginRight:10px;" v-for="(item,index) in carrierAccount" :key="index" v-if="!editShippingStatus && item.carrierAccountId == packageInfo.carrierAccountId">{{item.account}}</span>
      </div>
    </div> -->
    <!-- </div> -->
    <!-- </div> -->
    <div class="modalItemTwo">
      <div class="modalItemHeader">
        <h6>申报</h6>
        <Button
          size="small"
          type="primary"
          icon="android-add"
          class="declareAdd"
          @click="addDeclare"
          v-if="packageInfo.packageStatus !== 7 && packageInfo.trackingNumberStatus !== 2 && packageInfo.carrierSendStatus !== 2">添加 </Button>
        <div
          class="modalItemHeaderRight"
          v-if="packageInfo.packageStatus !== 7 && packageInfo.trackingNumberStatus !== 2 && packageInfo.carrierSendStatus !== 2">
          <p class="setEdit">
            <span
              class="icon iconfont" @click="edit()" v-if="!editStatus">&#xe611;</span> <span
            class="icon iconfont iconqueren orderSave" @click="editSave()" v-if="editStatus"></span> <span
            class="icon iconfont orderCancelSave" @click="cancelEdit()" v-if="editStatus">&#xe61a;</span>
          </p>
        </div>
      </div>
      <div class="declareTable normalTop">
        <Table
          :data="declareData"
          :columns="declareColumns"
          highlight-row
          border
        ></Table>
      </div>
    </div>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data () {
    var self = this;
    return {
      // 仓储物流
      selectStore: '', // 选中仓库
      storeName: '', // 仓库名称
      webstoreItemSite: null,
      packageDeclares: [],
      packageDetails: '',
      packageInfo: '',
      updateStatus: false, // 更新后触发数据刷新
      pid: null,
      editStatus: false,
      editStoreStatus: false,
      editShippingStatus: false,
      declareData: [],
      abc: '',
      addDeclareNum: 0,
      declareColumns: [
        {
          title: '中文申报名',
          key: 'goodsNameCn',
          align: 'center',
          render: (h, params) => {
            if (self.editStatus || params.row.editStatus) {
              let n = params.row;
              let m = self.packageDeclares[params.index];
              return h('div', [
                h('Input', {
                  props: {
                    value: n.goodsNameCn,
                    maxLength: 200
                  },
                  class: m.goodsNameCnStatus ? 'newInputError' : '',
                  on: {
                    input (val) {
                      if (val === '') {
                        m.goodsNameCnStatus = true;
                      } else {
                        m.goodsNameCnStatus = false;
                      }
                      self.packageDeclares[params.index].goodsNameCn = val;
                    },
                    'on-blur' (val) {
                      if (self.packageDeclares[params.index].goodsNameCn === '') {
                        m.goodsNameCnStatus = true;
                      } else {
                        m.goodsNameCnStatus = false;
                      }
                    }
                  }
                }), m.goodsNameCnStatus ? h('div', {
                  class: 'redColor',
                  style: {
                    margin: '5px 0',
                    textAlign: 'center'
                  }
                }, '不能为空') : ''
              ]);
            } else {
              return h('span', params.row.goodsNameCn);
            }
          }
        }, {
          title: '英文申报名',
          key: 'goodsNameEn',
          align: 'center',
          render: (h, params) => {
            let n = params.row;
            let m = self.packageDeclares[params.index];
            if (self.editStatus || params.row.editStatus) {
              return h('div', [
                h('Input', {
                  props: {
                    value: n.goodsNameEn,
                    maxLength: 200
                  },
                  class: m.goodsNameEnStatus ? 'newInputError' : '',
                  on: {
                    input (val) {
                      if (val === '') {
                        m.goodsNameEnStatus = true;
                      } else {
                        m.goodsNameEnStatus = false;
                      }
                      self.packageDeclares[params.index].goodsNameEn = val;
                    },
                    'on-blur' (val) {
                      if (self.packageDeclares[params.index].goodsNameEn === '') {
                        m.goodsNameEnStatus = true;
                      } else {
                        m.goodsNameEnStatus = false;
                      }
                    }
                  }
                }), m.goodsNameEnStatus ? h('div', {
                  class: 'redColor',
                  style: {
                    margin: '5px 0',
                    textAlign: 'center'
                  }
                }, '不能为空') : ''
              ]);
            } else {
              return h('span', params.row.goodsNameEn);
            }
          }
        }, {
          title: '申报价值（单个）',
          align: 'center',
          key: 'unitPrice',
          render: (h, params) => {
            if (self.editStatus || params.row.editStatus) {
              return h('InputNumber', {
                props: {
                  value: params.row.unitPrice,
                  min: 0
                },
                on: {
                  'input': val => {
                    self.packageDeclares[params.index].unitPrice = Number(Number(val).toFixed(2));
                  },
                  'on-change': val => {
                    self.packageDeclares[params.index].unitPrice = Number(Number(val).toFixed(2));
                  }
                }
              });
            } else {
              return h('span', params.row.unitPrice);
            }
          }
        }, {
          title: '申报重量（单个）g',
          key: 'unitWeight',
          render: (h, params) => {
            if (self.editStatus || params.row.editStatus) {
              return h('InputNumber', {
                props: {
                  value: params.row.unitWeight,
                  min: 0
                },
                on: {
                  'input': val => {
                    self.packageDeclares[params.index].unitWeight = parseInt(Number(val));
                  }
                }
              });
            } else {
              return h('span', params.row.unitWeight);
            }
          }
        }, {
          title: '海关编码',
          key: 'hsCode',
          align: 'center',
          render: (h, params) => {
            if (self.editStatus || params.row.editStatus) {
              return h('Input', {
                props: {
                  value: params.row.hsCode,
                  maxLength: 30
                },
                on: {
                  input (val) {
                    self.packageDeclares[params.index].hsCode = val;
                  }
                }
              });
            } else {
              return h('span', params.row.hsCode);
            }
          }
        }, {
          title: '申报数量',
          align: 'center',
          key: 'quantity',
          render: (h, params) => {
            if (self.editStatus || params.row.editStatus) {
              return h('InputNumber', {
                props: {
                  value: params.row.quantity,
                  min: 1
                },
                on: {
                  input: val => {
                    self.packageDeclares[params.index].quantity = parseInt(Number(val));
                  }
                }
              });
            } else {
              return h('span', params.row.quantity);
            }
          }
        }
      ]
    };
  },
  props: {
    packageId: {
      type: String,
      default: null
    },
    timestamp: {
      type: Number,
      default: null
    },
    storeList: {
      type: Array,
      default: null
    }
  },
  watch: {
    updateStatus (n) {
      let v = this;
      if (n) {
        v.getPackageDetails();
        v.updateStatus = false;
      }
    },
    timestamp (n, o) {
      let v = this;
      v.initDeclare();
      if (n !== o && v.packageId !== null) {
        v.$emit('spinLoading');
        v.getPackageDetails();
      }
    }
  },
  methods: {
    getPackageDetails (pid) {
      let v = this;
      v.axios.get(api.get_packageDetails + v.packageId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.webstoreItemSite = data.webstoreItemSite;
          data.merchantCarrierName = '';
          data.merchantShippingMethodIdName = '';
          Promise.resolve(v.axios.post(api.queryCarrierShippingName, JSON.stringify([data.packageInfo.merchantShippingMethodId])).then(response1 => {
            if (response1.data.code === 0) {
              let shippingData = response1.data.datas;
              if (shippingData.length > 0) {
                data.packageInfo.merchantCarrierName = shippingData[0].carrierName;
                data.packageInfo.merchantShippingMethodIdName = shippingData[0].carrierShippingMethodName;
              } else {
                data.packageInfo.merchantCarrierName = '';
                data.packageInfo.merchantShippingMethodIdName = '';
              }
            }
          })).then(() => {
            v.packageInfo = data.packageInfo;
            v.selectStore = data.packageInfo.warehouseId;
            v.storeList.forEach((m, t) => {
              if (m.warehouseId === v.selectStore) {
                v.storeName = m.warehouseName;
              }
            });
            v.packageDetails = data.packageDetails;
            let pos = [];
            data.packageDeclares.forEach((n, i) => {
              pos.push({
                goodsNameCn: n.goodsNameCn,
                goodsNameEn: n.goodsNameEn,
                hsCode: n.hsCode,
                quantity: n.quantity,
                unitPrice: n.unitPrice,
                unitWeight: n.unitWeight,
                declareCurrency: 'USD',
                goodsNameCnStatus: false,
                goodsNameEnStatus: false,
                hsCodeStatus: false,
                errText: false
              });
            });
            v.declareData = data.packageDeclares;
            v.$emit('resetSpinShow');
            v.packageDeclares = pos;
          });
        }
      });
    },
    getCurrent () {
      let v = this;
      let pos = [
        v.getDataToLocalTime(v.packageInfo.trackingNumberTime, 'fulltime'),
        v.getDataToLocalTime(v.packageInfo.printTime, 'fulltime'),
        v.getDataToLocalTime(v.packageInfo.despatchTime, 'fulltime')
      ];
      let l = 2;
      for (let i = 0; i < pos.length; i++) {
        if (pos[i] === null) l--;
      }
      return l;
    },
    edit () {
      let v = this;
      if (v.declareData.length > 0 && v.declareData[0].hasOwnProperty('editStatus') && v.declareData[0].editStatus) {
        v.$Message.error('请先保存添加的数据');
        return false;
      } else if (v.declareData.length === 0) {
        v.$Message.error('没有可编辑数据');
        return false;
      }
      v.editStatus = true;
      v.declareColumns.push({
        title: '操作',
        key: 'operation',
        render: (h, params) => {
          if (v.editStatus) {
            return h('span', {
              class: 'icon iconfont icon-closecircled',
              style: {
                color: '#f00',
                cursor: 'pointer',
                fontSize: '24px'
              },
              on: {
                click: () => {
                  v.delDeclare(params.row.packageDeclareId);
                }
              }
            });
          }
        }
      });
    },
    editSave () {
      let v = this;
      v.validDeclareData().then(response => {
        if (response) {
          return false;
        }
        var obj = {
          packageId: v.packageId,
          packageDeclareList: v.packageDeclares
        };
        v.axios.put(api.update_packageDeclare, JSON.stringify(obj)).then(response => {
          if (response.data.code === 0) {
            v.$Message.success('修改成功');
            v.declareData = v.deepCopy(v.packageDeclares);
            v.cancelEdit();
          }
        });
      });
    },
    cancelEdit () {
      let v = this;
      v.editStatus = false;
      v.declareColumns.pop();
    },
    delDeclare (packageDeclareId) {
      let v = this;
      v.axios.delete(api.del_packageDeclare + packageDeclareId).then(response => {
        if (response.data.code === 0) {
          v.cancelEdit();
          v.getPackageDetails();
          v.$Message.success('删除成功');
        } else {
          v.$Message.error('删除失败');
        }
      });
    },
    addDeclare () {
      let v = this;
      if (v.addDeclareNum === 1) {
        return false;
      } else if (v.editStatus) {
        v.$Message.error('请先保存修改的数据');
        return false;
      }
      v.packageDeclares.unshift({
        goodsNameCn: '',
        goodsNameEn: '',
        hsCode: '',
        quantity: 1,
        unitPrice: '1.00',
        unitWeight: 1,
        declareCurrency: 'USD',
        goodsNameCnStatus: false,
        goodsNameEnStatus: false,
        hsCodeStatus: false

      });
      v.declareData.unshift({
        editStatus: true
      });
      v.addDeclareNum++;
      if (v.addDeclareNum === 1) {
        v.declareColumns.push({
          title: '操作',
          key: 'operation',
          render: (h, params) => {
            if (params.row.editStatus) {
              return h('div', [
                h('span', {
                  class: 'icon iconfont icon-save-s',
                  style: {
                    color: '#3cb034',
                    cursor: 'pointer',
                    fontSize: '20px'
                  },
                  on: {
                    click: () => {
                      v.saveDeclare();
                    }
                  }
                }), h('span', {
                  class: 'icon iconfont icon-closecircled',
                  style: {
                    color: '#f00',
                    cursor: 'pointer',
                    fontSize: '24px',
                    marginLeft: '10px'
                  },
                  on: {
                    click: () => {
                      v.closeDeclare();
                    }
                  }
                })
              ]);
            }
          }
        });
      }
    },
    validDeclareData () {
      let v = this;
      return new Promise((resolve, reject) => {
        let result = false;
        v.packageDeclares.forEach((n, i) => {
          if (n.goodsNameEn === '') {
            result = true;
            v.$nextTick(function () {
              v.packageDeclares[i].goodsNameEnStatus = true;
            });
          } else {
            v.$nextTick(function () {
              v.packageDeclares[i].goodsNameEnStatus = false;
            });
          }
          if (n.goodsNameCn === '') {
            result = true;
            v.$nextTick(function () {
              v.packageDeclares[i].goodsNameCnStatus = true;
            });
          } else {
            v.$nextTick(function () {
              v.packageDeclares[i].goodsNameCnStatus = false;
            });
          }
          if (i === v.packageDeclares.length - 1) {
            resolve(result);
          }
        });
      });
    },
    saveDeclare () {
      let v = this;
      v.validDeclareData().then(response => {
        if (response) {
          return false;
        }
        var obj = {
          packageIdList: [v.packageId],
          packageDeclareList: v.packageDeclares
        };
        v.axios.post(api.add_packageDeclare, JSON.stringify(obj)).then(response => {
          if (response.data.code === 0) {
            v.$Message.success('保存成功');
            v.declareData.splice(0, 1);
            v.declareData = v.deepCopy(v.packageDeclares);
            v.editStatus = false;
            v.addDeclareNum--;
            if (v.addDeclareNum === 0) {
              v.declareColumns.pop();
            }
          }
        });
      });
    },
    initDeclare () {
      let v = this;
      if (!v.editStatus && v.addDeclareNum === 1) {
        v.closeDeclare();
      } else if (v.editStatus && v.addDeclareNum === 0) {
        v.editStatus = false;
        v.declareColumns.pop();
      }
    },
    closeDeclare (n) {
      let v = this;
      v.editStatus = false;
      v.addDeclareNum--;
      v.packageDeclares.splice(0, 1);
      v.declareData.splice(0, 1);
      if (v.addDeclareNum === 0) {
        v.declareColumns.pop();
      }
    }
  }
};
</script>
