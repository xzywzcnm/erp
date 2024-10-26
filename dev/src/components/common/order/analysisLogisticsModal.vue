<template>
  <div>
    <!-- 物流方式解析 -->
    <Modal v-model="analysisLogistics" @on-cancel="closeMatchModal" :mask-closable="false" title="物流解析" width="85%" @on-visible-change="visibleFn">
      <div class="info_title">
        <div class="line_box">
          <div class="line_item">
            <span class="title">发货仓库：</span>
            <span>{{ infolist.deliveryWarehouse }}</span>
          </div>
        </div>
        <div class="line_box">
          <div class="line_item">
            <span class="title">收件国家/地区：</span>
            <span>{{ infolist.receivingCountry }}</span>
          </div>
          <div class="line_item">
            <span class="title">订单平台：</span>
            <span>{{ infolist.platformId }}</span>
          </div>
        </div>
        <div class="line_box">
          <div class="line_item">
            <span class="title">预估重量(g)：</span>
            <span>{{ infolist.totalWeight }}</span>
          </div>
          <div class="line_item">
            <span class="title">预估尺寸(cm)：</span>
            <span>{{ infolist.estimatedSize }}</span>
          </div>
          <div class="line_item">
            <span class="title">预估体积(cm³)：</span>
            <span>
              {{((infolist.length || 0)*(infolist.width || 0)*(infolist.height || 0)).toFixed(2)}} cm³
            </span>
          </div>
          <div class="line_item">
            <span class="title">预估周长(cm)：</span>
            <span>
              {{(Number(infolist.length || '0') + 2*(Number(infolist.width || '0') + Number(infolist.height || '0'))).toFixed(2)}} cm
            </span>
          </div>
        </div>
        <div class="line_box mt15">
          <div class="line_item">
            <Checkbox v-model="filterParams.appropriate" @on-change="changeAppropriate">只查看合适当前平台邮寄方式</Checkbox>
            <Tooltip placement="bottom" theme="light" max-width="250">
              <Icon class="ml10" size="20" type="md-help-circle" />
              <div slot="content">
                <span style="font-size: 12px;">物流设置中，该邮寄方式设置了当前平台的carrier信息，则视为匹配</span>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
      <div class="filter-content mt15">
        <Form ref="filterFormRef" :model="filterParams">
          <Form-item label="物流商" prop="merchantCarrierIdList" :label-width="60">
            <dyt-select v-model="filterParams.merchantCarrierIdList" :max-tag-count="1" multiple placeholder="请选择物流商">
              <Option v-for="(item, index) in shippingDataList" :key="index" :value="item.value" :label="item.label" />
            </dyt-select>
          </Form-item>
          <Form-item label="邮寄方式" prop="merchantShippingMethod" :label-width="80">
            <dyt-input placeholder="请输入邮寄方式" v-model.trim="filterParams.merchantShippingMethod" />
          </Form-item>
          <Form-item label="是否存在限制" prop="isLimit" :label-width="100">
            <dyt-select v-model="filterParams.isLimit" placeholder="请选择">
              <Option :value="1" label="是" />
              <Option :value="0" label="否" />
            </dyt-select>
          </Form-item>
          <Form-item class="btn-item" label="" :label-width="0">
            <Button class="ml10" type="primary" icon="md-search" @click="GetlogisticsData" :disabled="searchLoading">查询</Button>
          </Form-item>
        </Form>
      </div>
      <!--物流相关设置-->
      <h3 class="commodity_title">物流相关设置：</h3>
      <Form class="setAllMarkRead white-space-nowrap-form mb20">
        <Row>
          <Col :span="9" :offset="1" v-show="isOnlineShip === 0 && carrierAccounts.length > 0 && !isPms">
          <Form-item label="帐号：" :label-width="60">
            <dyt-select v-model="shippingAccountModel" :transfer="true">
              <Option
                v-for="(item, index) in carrierAccounts"
                v-if="item.carrierAccountId !== null"
                :key="index" :value="item.carrierAccountId"
                :label="item.account"
              />
            </dyt-select>
          </Form-item>
          </Col>
        </Row>
        <Row>
          <Col :span="12" v-for="(item,index) in carrierBaseSetting" :key="index" v-show="item.paramType !== 'hide'">
          <Form-item :label="item.paramName" :label-width="100">
            <Radio-group v-model="shippingMethodModel[index].paramValue" v-if="item.paramType === 'radio'">
              <Radio :label="sItem.itemValue" v-for="(sItem,n) in item.dictionarys" :key="n">
                <span>{{ sItem.itemName }}</span>
              </Radio>
            </Radio-group>
            <Input v-if="item.paramType == 'input'" v-model="shippingMethodModel[index].paramValue"></Input>
            <Checkbox-group v-model="shippingMethodModel[index].paramValue" v-if="item.paramType == 'checkbox'">
              <Checkbox v-for="(sItem,n) in item.dictionarys" :key="n" :label="sItem.itemValue">
                <span>{{ sItem.itemName }}</span>
              </Checkbox>
            </Checkbox-group>
            <dyt-select v-if="item.paramType === 'select'" v-model="shippingMethodModel[index].paramValue">
              <Option v-for="(sItem,n) in item.dictionarys" :key="n" :value="sItem.itemValue" :label="sItem.itemName" />
            </dyt-select>
            <span v-if="['readOnly'].includes(item.paramType)">{{ item.paramValue }}</span>
          </Form-item>
          </Col>
        </Row>
      </Form>
      <div class="orderTable normalTop" style="padding: 0;">
        <Table highlight-row border max-height="420" :columns="logisticsColumn" :data="logisticsData" :loading="searchLoading" />
      </div>
      <div slot="footer" style="padding: 20px 0 10px 0; text-align: center">
        <Button :loading="pageLoading || searchLoading" @click="selectBtn" type="primary">选择</Button>
        <Button @click="closeMatchModal">关闭</Button>
      </div>
      <Spin fix v-if="pageLoading"></Spin>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  props: {
    orderDetailsData: Object,
    currentIndex: Number,
    allStorelist: Array,
    orderId: { type: String, default: '' }
  },
  data () {
    return {
      infolist: {},
      analysisLogistics: false,
      radioData: null,
      isPms: false,
      pageLoading: false,
      searchLoading: false,
      shippingDataList: [],
      filterParams: {
        orderShippingId: null,
        onlyPlatform: '',
        merchantCarrierIdList: [],
        merchantShippingMethod: '',
        isLimit: null,
        appropriate: false,
      },
      logisticsColumn: [
        {
          title: '操作',
          width: 80,
          align: 'center',
          render: (h, params) => {
            let data = params.row;
            let talg = false;
            this.carrierBaseSetting = [];
            this.shippingMethodModel = [];
            this.carrierAccounts = [];
            this.radioData === data ? talg = true : talg = false;
            return h('Radio', {
              props: {
                size: 'small',
                value: talg
              },
              on: {
                'on-change': (value) => {
                  this.radioData = data;
                  this.isOnlineShip = data.isOnline;
                  this.isPms = this.$common.isEmpty(data.isPms) ? false : data.isPms;
                  if (data.carrierParamList != null && data.carrierParamList.length > 0) {
                    data.carrierParamList.map((n) => {
                      this.$nextTick(() => {
                        this.shippingMethodModel.push({
                          paramKey: n.paramKey,
                          paramValue: n.paramValue,
                          title: n.paramName
                        });
                      });
                    });
                  }
                  this.$nextTick(() => {
                    this.carrierAccounts = data.carrierAccounts;
                    this.carrierBaseSetting = data.carrierParamList;
                  });
                }
              }
            });
          }
        },
        {
          title: '物流商',
          key: 'carrierName',
          minWidth: 100,
          align: 'center'
        },
        {
          title: '邮寄方式',
          key: 'carrierShippingMethodName',
          minWidth: 100,
          align: 'center'
        },
        {
          title: '物流费用(CNY)',
          key: 'freight',
          minWidth: 100,
          align: 'center'
        },
        {
          title: '参考时效(天)',
          key: 'Efficiency',
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            let efficiency = params.row.minEfficiency + '-' + params.row.maxEfficiency;
            return h('div', efficiency);
          }
        },
        {
          title: '配送范围',
          key: 'arriveable',
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            let typeName = '';
            let type = params.row.arriveableType;
            switch (type) {
              case 1:
                typeName = '全球可达运费相同';
                break;
              case 2:
                typeName = '全球可达运费不同';
                break;
              case '3':
                typeName = '非全球可达';
                break;
              default:
                typeName = '';
            }
            return h('div', {
              style: {
                color: params.row.arriveableMatch ? '#078307' : '#FF0802'
              }
            }, typeName);
          }
        },
        {
          title: '最大尺寸限制(cm)',
          key: 'maxLength',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            const size = [params.row.maxLength, params.row.maxWidth, params.row.maxHeight];
            const notHasZero = size.find(f => ![0, '0'].includes(f));
            return h('div', {
              style: {
                color: params.row.maxLengthMatch && params.row.maxWidthMatch && params.row.maxHeightMatch ? '#078307' : '#FF0802'
              }
            }, this.$common.isEmpty(notHasZero) ? '-' : size.join('*'));
          }
        },
        {
          title: '最小尺寸限制(cm)',
          key: 'minLength',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            const size = [params.row.minLength, params.row.minWidth, params.row.minHeight];
            const notHasZero = size.find(f => ![0, '0'].includes(f));
            return h('div', {
              style: {
                color: params.row.minLengthMatch && params.row.minWidthMatch && params.row.minHeightMatch ? '#078307' : '#FF0802'
              }
            }, this.$common.isEmpty(notHasZero) ? '-' : size.join('*'));
          }
        },
        {
          title: '重量限制(g)',
          key: 'minLength',
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            const volume = [params.row.minWeight, params.row.maxWeight];
            const notHasZero = volume.find(f => ![0, '0'].includes(f));
            return h('div', {
              style: {
                color: params.row.weightMatch ? '#078307' : '#FF0802'
              }
            }, this.$common.isEmpty(notHasZero) ? '-' : volume.join('-'));
          }
        },
        {
          title: '体积限制(cm)',
          key: 'volume',
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            const volume = [params.row.minVolume, params.row.maxVolume];
            const notHasZero = volume.find(f => ![0, '0'].includes(f));
            return h('div', {
              style: {
                color: params.row.volumeMatch ? '#078307' : '#FF0802'
              }
            }, this.$common.isEmpty(notHasZero) ? '-' : volume.join('-'));
          }
        },
        {
          title: '周长限制(cm)',
          key: 'perimeter',
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            return h('div', {
              style: {
                color: params.row.perimeterMatch ? '#078307' : '#FF0802'
              }
            }, params.row.maxPerimeter == 0 ? '-' : params.row.maxPerimeter);
          }
        },
        {
          title: '最长边限制(cm)',
          key: 'dimensions',
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            return h('div', {
              style: {
                color: params.row.dimensionsLengthMatch ? '#078307' : '#FF0802'
              }
            }, params.row.maxDimensionsLength == 0 ? '-' : params.row.maxDimensionsLength);
          }
        },
        {
          title: '三边和限制(cm)',
          minWidth: 100,
          key: 'maxThreeSidesAnd',
          align: 'center',
          render: (h, params) => {
            return h('div', {
              style: {
                color: params.row.maxThreeSidesAndMatch ? '#078307' : '#FF0802'
              }
            }, params.row.maxThreeSidesAnd == 0 ? '-' : params.row.maxThreeSidesAnd);
          }
        },
        {
          title: '最长两边和限制(cm)',
          minWidth: 140,
          key: 'maxLongestTwoSidesAnd',
          align: 'center',
          render: (h, params) => {
            return h('div', {
              style: {
                color: params.row.maxLongestTwoSidesAndMatch ? '#078307' : '#FF0802'
              }
            }, params.row.maxLongestTwoSidesAnd == 0 ? '-' : params.row.maxLongestTwoSidesAnd);
          }
        },
        {
          title: '接受类型限制',
          minWidth: 100,
          key: '',
          align: 'center',
          render: (h, params) => {
            let typeName = [];
            let typeArr = {
              '01': '普货',
              '02': '纯电池',
              '03': '配套电',
              '04': '液体',
              '05': '药品',
              '06': '粉末',
              '07': '危险品',
              '08': '内置电池'
            };
            if (params.row.acceptTypes.length > 0) {
              params.row.acceptTypes.map((item) => {
                typeName.push(typeArr[item]);
              });
            }
            return h('div', {
              style: {
                color: params.row.acceptTypeMatch ? '#078307' : '#FF0802'
              }
            }, typeName.length > 0 ? typeName.join('、') : '');
          }
        }
      ],
      logisticsData: [],
      isOnlineShip: 0,
      carrierBaseSetting: [],
      shippingMethodModel: [],
      shippingAccountModel: null,
      carrierAccounts: [],
    };
  },
  computed: {
    warehouseInfo () {
      if (this.$common.isEmpty(this.currentIndex)) return {};
      if (this.$common.isEmpty(this.orderDetailsData) || this.$common.isEmpty(this.orderDetailsData.orderShippingInfoList)) return {};
      return this.orderDetailsData.orderShippingInfoList[this.currentIndex] || {};
    }
  },
  watch: {
    currentIndex: {
      handler (index) {
        let data = this.orderDetailsData.orderShippingInfoList[index];
        let platformId = this.orderDetailsData.orderInfo.platformId;
        this.handleInfo(data, platformId);
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // 关闭弹窗时，重置数据
    closeMatchModal () {
      this.filterParams.orderShippingId = null;
      this.filterParams.onlyPlatform = '0';
      this.filterParams.appropriate = false;
      this.$refs.filterFormRef && this.$refs.filterFormRef.resetFields();
      this.searchLoading = false;
      this.pageLoading = false;
      this.$nextTick(() => {
        this.$emit('changeLogistics', false);
      })
    },

    // 处理详情数据
    handleInfo (data, platformId) {
      if (data && Object.keys(data).length > 0) {
        let countryData = JSON.parse(localStorage.getItem('area'));
        let receivingCountry = '';
        let deliveryWarehouse = '';
        // 收件国家/地区
        if (countryData.length > 0) {
          countryData.map((item) => {
            if (item.twoCode === data.buyerCountryCode) {
              receivingCountry = item.cnName;
            }
          });
        }
        // 发货仓库
        if (this.allStorelist.length > 0) {
          this.allStorelist.map((item) => {
            if (item.warehouseId === data.warehouseId) {
              deliveryWarehouse = item.warehouseName;
            }
          });
        }
        let forecastSize = this.$common.isEmpty(data.length) ? '' : data.length;
        if (!this.$common.isEmpty(data.width)) {
          forecastSize = `${forecastSize}${this.$common.isEmpty(forecastSize) ? '' : '*'}${data.width}`;
        }
        if (!this.$common.isEmpty(data.height)) {
          forecastSize = `${forecastSize}${this.$common.isEmpty(forecastSize) ? '' : '*'}${data.height}`;
        }
        this.infolist = {
          ...data,
          deliveryWarehouse: deliveryWarehouse,
          receivingCountry: receivingCountry,
          platformId: platformId,
          totalWeight: data.totalWeight,
          estimatedSize: forecastSize
        };
        this.filterParams.orderShippingId = data.orderShippingId;
      }
    },
    getFilterParams () {
      let params = this.$common.copy(this.filterParams);
      params.onlyPlatform = this.filterParams.appropriate ? '1' : '0';
      delete params.appropriate;
      return params;
    },
    // 获取可用的物流方式
    GetlogisticsData () {
      if (this.searchLoading) return;
      this.searchLoading = true;
      this.logisticsData = [];
      let query = this.getFilterParams();
      this.axios.post(api.get_analysisLogistics, query).then((response) => {
        if (response.data.code === 0) {
          this.logisticsData = response.data.datas;
        }
      }).finally(() => {
        this.searchLoading = false;
      });
    },
    // 获取物流商下拉
    getShippingList () {
      return new Promise((resolve) => {
        let queryPar = {
          isFilter: true,
          time: (new Date().getTime()).toString(32)
        };
        if (!this.$common.isEmpty(this.warehouseInfo.warehouseId)) {
          queryPar.warehouseId = this.warehouseInfo.warehouseId;
        }
        if (!this.$common.isEmpty(this.warehouseInfo.warehouseType)) {
          queryPar.warehouseType = this.warehouseInfo.warehouseType;
        }
        this.shippingDataList = [];
        this.axios.get(`${api.erpServiceCommon}${api.get_enableCarriersApi}`, {
          params: queryPar,
          hiddenError: true
        }).then(res => {
          if (!res || !res.data || res.data.code != 0) return resolve([]);
          this.shippingDataList = (res.data.datas || []).map(item => {
            return { ...item, value: item.carrierId, label: item.carrierName }
          });
          resolve(this.shippingDataList);
        }).catch(() => {
          return resolve([]);
        })
      })
    },
    // 显示弹窗时
    visibleFn (value) {
      this.$nextTick(() => {
        if (!value) {
          this.filterParams.appropriate = false;
          this.radioData = null;
          return;
        }
        this.pageLoading = true;
        this.$common.promiseAll([
          this.getShippingList
        ]).finally(() => {
          this.GetlogisticsData();
          this.pageLoading = false;
        });
      });
    },

    // 选取适合平台的邮寄方式
    changeAppropriate () {
      this.GetlogisticsData();
    },

    // 重置数据
    popperHide () {
      this.carrierBaseSetting = [];
      this.shippingMethodModel = [];
      this.shippingAccountModel = null;
      this.carrierAccounts = [];
    },

    // 选择物流
    selectBtn () {
      let v = this;
      if (v.radioData === null) {
        v.$Message.error('请选择实际发货物流方式');
        return false;
      }
      if (this.$common.isEmpty(this.shippingAccountModel) && this.isOnlineShip === 0 && !this.isPms) {
        v.$Message.error('帐号不能为空');
        return false;
      }
      v.pageLoading = true;
      let obj = {
        orderShippingId: this.filterParams.orderShippingId,
        merchantCarrierId: v.radioData.carrierId,
        merchantShippingMethodId: v.radioData.shippingMethodId,
        packageCarrierParam: v.shippingMethodModel,
        carrierAccountId: v.shippingAccountModel,
        platformId: this.infolist.platformId,
        orderId: this.orderId
      };
      if (v.isOnlineShip === 1) {
        delete obj.carrierAccountId;
      }
      v.axios.put(api.update_singleShippingMethod, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.$emit('changeLogistics', false);
          v.popperHide();
          v.$emit('updateDetailsData', true);
        } else {
          v.popperHide();
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
        v.$nextTick(function () {
          v.pageLoading = false;
        });
      }).catch(() => {
        v.$Message.error('操作失败，请重新尝试');
        v.$nextTick(function () {
          v.pageLoading = false;
        });
        v.popperHide();
      });
    }
  }
};
</script>
<style lang="less" scoped>
.info_title {
  border-bottom: 1px dashed #797979;

  .line_box {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    .line_item{
      margin-right: 50px;
    }
    .title {
      font-weight: bold;
      color: #333;
    }

    label {
      font-size: 14px;
    }
  }
}

.commodity_title {
  color: #333;
  font-size: 14px;
  font-weight: bold;
  margin: 0 0 5px 0;
}
.filter-content{
  position: relative;
  :deep(.ivu-form) {
    .ivu-form-item {
      display: inline-block;
      .ivu-form-item-label{
        padding-right: 5px;
      }
      .ivu-form-item-content{
        width: 200px;
      }
      &.btn-item{
        .ivu-form-item-content{
          width: auto;
        }
      }
    }
  }
}
</style>
