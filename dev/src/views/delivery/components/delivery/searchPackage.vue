<template>
  <div>
    <div v-if="storeStatus && allStorelist !== [] && allStorelist !== null" class="selectStore">
      请选择仓库： <dyt-select v-model="selectStore" style="width:200px">
        <Option v-for="(item,index) in allStorelist" :value="item.warehouseId" :key="index">{{ item.warehouseName }}</Option>
      </dyt-select>
    </div>
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <Form ref="pageParams" :model="pageParams" :label-width="70">
            <Row class=" platformParamsSelect normalTop">
              <Col :lg="threeItemLg" :md="threeItemMd">
              <FormItem label="物流方式">
                <Cascader v-model="shippingMethodModel" :load-data="loadData" @on-visible-change="showShippingData" @on-change="changeShippingMethod" :data="shippingMethodData" filterable transfer></Cascader>
              </FormItem>
              </Col>
              <Col :lg="threeItemLg" :md="threeItemMd" :offset="1">
              <Form-item label="出库时间">
                <Date-picker transfer style="width:100%" type="datetimerange" @on-clear="resetDate" @on-change="getDateValue" :clearable="clearAble" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end" placeholder="选择日期" :value="payTimeArr"></Date-picker>
              </Form-item>
              </Col>
              <Col :lg="threeItemLg" :md="threeItemMd" :class="{none : !moreFilter}" :offset="1">
              <Form-item label="店铺" prop="saleAccountIds">
                <dytStoreSelect
                  v-model="pageParams.saleAccountIds"
                  :option-data="shopList"
                  :replace-option-key="{ value: 'saleAccountId', label: 'accountCode' }"
                  placeholder="请选择店铺，可输入搜索"
                  input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                />
              </Form-item>
              </Col>
            </Row>
            <div class="platformSearch clear" v-if="!moreFilter">
              <Row>
                <Col :lg="oneItemLg" :md="oneItemMd">
                <div class="filterItem">
                  <Form-item label="搜索字符" prop="searchValue">
                    <Input type="textarea" placeholder="可输入订单号、包裹号、买家ID、买家姓名、SKU、平台产品编码" v-model.trim="pageParams.searchValue">
                    </Input>
                  </Form-item>
                </div>
                </Col>
              </Row>
            </div>
            <div class="platformParamsMoreSection" :class="{none : !moreFilter}">
              <Row>
                <Col :lg="threeItemLg" :md="threeItemMd">
                <FormItem label="平台">
                  <dyt-select v-model="platformId" @on-change="changeValue">
                    <Option v-for="item in platformArr" :key="item.platformId" :label="item.title" :value="item.platformId"></Option>
                  </dyt-select>
                </FormItem>
                </Col>
                <Col :lg="threeItemLg" :md="threeItemMd" :offset="1">
                <Form-item label="付款时间">
                  <Date-picker transfer style="width:100%" type="datetimerange" @on-clear="resetDate" @on-change="getDateValue1" :clearable="clearAble" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end" placeholder="选择日期" :value="payTimeArr"></Date-picker>
                </Form-item>
                </Col>
                <Col :lg="threeItemLg" :md="threeItemMd" :offset="1">
                <Form-item label="国家/地区" prop="buyerCountryCodeList">
                  <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" filterable multiple placeholder="请选择或输入所在地">
                    <Option v-for="(item,index) in formValidate.country" :key="index" :value="item.twoCode">{{ item.enName }}</Option>
                  </dyt-select>
                </Form-item>
                </Col>
              </Row>
              <Row class="normalTop">
                <Col :lg="threeItemLg" :md="threeItemMd">
                <Form-item label="包裹号" prop="packageCode">
                  <Input placeholder="请输入包裹号" v-model.trim="pageParams.packageCode"></Input>
                </Form-item>
                </Col>
                <Col :lg="threeItemLg" :md="threeItemMd" :offset="1">
                <Form-item label="订单号" prop="orderNo">
                  <Input placeholder="请输入订单号,多个订单号用逗号或回车分隔" type="textarea" v-model.trim="pageParams.orderNo"></Input>
                </Form-item>
                </Col>
                <Col :lg="threeItemLg" :md="threeItemMd" :offset="1">
                <Form-item label="买家姓名" prop="buyerName">
                  <Input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></Input>
                </Form-item>
                </Col>
              </Row>
              <Row class="normalTop">
                <Col :lg="threeItemLg" :md="threeItemMd">
                <Form-item label="买家ID" prop="buyerAccountId">
                  <Input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></Input>
                </Form-item>
                </Col>
                <Col :lg="threeItemLg" :md="threeItemMd" :offset="1">
                <Form-item label="平台产品编码" prop="webstoreItemId">
                  <Input placeholder="请输入平台产品编码" v-model.trim="pageParams.webstoreItemId"></Input>
                </Form-item>
                </Col>
                <Col :lg="threeItemLg" :md="threeItemMd" :offset="1">
                <Form-item label="SKU" prop="sku">
                  <Input placeholder="请输入SKU" v-model.trim="pageParams.sku"></Input>
                </Form-item>
                </Col>
              </Row>
            </div>
            <div class="filterItem filterConfirm" :class="{normalTop : moreFilter}">
              <Button type="primary" @click="search" size="small">查询 </Button>
              <Button @click="reset" size="small" v-once icon="md-refresh">重置 </Button>
            </div>
            <div class="moreFilter">
              <Button size="small" @click="toggleMoreFilter">
                {{ moreFilterMes }}
                <Icon :type="moreFilterIcon" size="small"></Icon>
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
    <div class="dataSort grayBg">
      <span>排序：</span>
      <Button-group>
        <template v-for="(item, index) in buttonGroupModel">
          <Button v-if="item.selected" type="primary" @click="modifyTheSort(index, item.status)" :key="index">
            {{ item.title }}
            <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
            <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
          </Button>
          <Button v-if="!item.selected" @click="modifyTheSort(index, item.status)" :key="index">
            {{ item.title }}
            <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
            <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
          </Button>
        </template>
      </Button-group>
    </div>
    <div class="tableControl">
      <Buttons type="primary" style="margin-left: 20px" trigger="click" @on-click="exportDataHasCondition">
        <Button type="primary" @click="exportData" class="iconbuttons">
          <span class="icon iconfont">&#xe639;</span> 导出选中 </Button>
        <Buttons-menu slot="list">
          <Buttons-item name="1">导出（所有结果集）</Buttons-item>
        </Buttons-menu>
      </Buttons>
    </div>
    <div class="orderTable normalTop">
      <keep-alive>
        <Table highlight-row border :loading="loading" :columns="columns" :data="printData" @on-selection-change="getSelectValue"></Table>
      </keep-alive>
      <div class="table-page">
        <div class="table-page-right">
          <keep-alive>
            <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
          </keep-alive>
        </div>
      </div>
    </div>
    <!-- 导出 -->
    <keep-alive>
      <Modal v-model="exportModel.status" :mask-closable="false" width="400" v-if="exportModelStatus" @on-ok="exportExcel">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">{{ exportModel.title }}</div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              <Row>
                <Col :span="1">
                <Icon type="md-information-circle" color="#2b85e4" size="44"></Icon>
                </Col>
                <Col :span="21" :offset="2">
                <p>
                  {{ exportModel.content }} </p>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Modal>
    </keep-alive>
    <!-- 包裹详情 -->
    <keep-alive>
      <sliderModal v-model="packageModel" :spinShow="spinShow" :styles="{}" class="slider-model" v-if="packageDetailsStatus">
        <packageDetails :packageId="packageId" :allStorelist="allStorelist" @spinLoading="spinLoading" @resetSpinShow="resetSpinShow" :timestamp="timestamp"></packageDetails>
      </sliderModal>
    </keep-alive>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import packageDetails from './packageDetails';
import deliveryMixin from '@/components/mixin/delivery_mixin';
import publicService from '@/components/mixin/publicService_mixin';

export default {
  mixins: [Mixin, deliveryMixin, publicService],
  components: {
    packageDetails
  },
  data () {
    var self = this;
    return {
      packageIds: [], // 详情参数 Start
      packageModel: false,
      packageDetailsStatus: true,
      packageId: null,
      timestamp: null, // End
      loading: false,
      totalPage: 0,
      total: 0,
      curPage: 1,
      moreFilter: false, // 高级筛选
      moreFilterIcon: 'md-arrow-dropdown',
      moreFilterMes: '更多选项（平台、店铺、国家/地区等）',
      payTimeArr: [],
      shopList: [],
      pageParamsStatus: false,
      pageParamsPrototype: null, // 重置查询条件
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        status: 0,
        getLabelStatus: null,
        platFormId: null,
        saleAccountIds: [],
        packageCode: null,
        waybillNo: null,
        startDespatchTime: null,
        endDespatchTime: null,
        payStartTime: null,
        payEndTime: null,
        buyerAccountId: null,
        buyerCountryCodeList: [],
        buyerName: null,
        merchantCarrierId: null,
        merchantShippingMethodId: null,
        orderBy: null,
        orderNo: null,
        upDown: 'up',
        webstoreItemId: null,
        platformId: null,
        sku: null,
        searchValue: null, // 搜索内容
        warehouseId: self.selectStore // 仓库
      },
      exportModel: {
        title: '',
        content: '',
        status: false
      },
      exportModelStatus: false,
      buttonGroupModel: [
        {
          type: 'despatchTime',
          selected: true,
          status: true, // true up false down
          title: '按出库时间'
        }, {
          type: 'payTime',
          selected: false,
          status: true, // true up false down
          title: '按付款时间'
        }, {
          type: 'packageCode',
          selected: false,
          status: true, // true up false down
          title: '按包裹号'
        }
      ],
      platformArr: [
        {
          platformId: '全部',
          title: '全部'
        }, {
          platformId: 'ebay',
          title: 'ebay'
        }
      ],
      clearAble: true,
      resetStatus: true,
      printData: [],
      columns: [
        {
          type: 'selection',
          width: 60,
          fixed: 'left',
          align: 'center'
        }, {
          title: '包裹号',
          key: 'packageCode',
          fixed: 'left',
          align: 'center',
          minWidth: 140,
          render: (h, params) => {
            return h('span', {
              class: 'blueColor cursor underline',
              on: {
                click: () => {
                  self.showPackageDetails(params.row.packageId);
                }
              }
            }, params.row.packageCode);
          }
        }, {
          title: '买家ID/姓名',
          key: 'buyerName',
          align: 'center',
          width: 200,
          render: (h, params) => {
            return h('div', [
              h('div', {
                style: {
                  color: '#0054A6'
                }
              }, params.row.buyerAccountId), h('div', {
                style: {
                  color: '#ff3300'
                }
              }, params.row.buyerName)
            ]);
          }
        }, {
          title: '国家/地区',
          key: 'buyerCountryCode',
          align: 'center',
          width: 110
        }, {
          title: '物流方式',
          key: 'merchantShippingMethodId',
          align: 'center',
          width: 200,
          render: (h, params) => {
            if (params.row.carrierName === null || params.row.carrierName === '') {
              return '';
            } else {
              return h('div', params.row.carrierName + ' > ' + params.row.carrierShippingMethodName);
            }
          }
        }, {
          title: '运单号',
          key: 'trackingNumber',
          align: 'center',
          width: 180
        }, {
          title: '运费',
          key: 'postage',
          align: 'center',
          width: 140,
          render: (h, params) => {
            return h('div', [
              h('div', {
                style: {
                  textAlign: 'center'
                }
              }, params.row.postageCurrency), h('div', {
                style: {
                  textAlign: 'center'
                }
              }, params.row.postage)
            ]);
          }
        }, {
          title: '付款时间',
          align: 'center',
          width: 160,
          key: 'payTime',
          render: (h, params) => {
            return h('span', self.getDataToLocalTime(params.row.payTime, 'fulltime'));
          }
        }, {
          title: '出库时间',
          width: 160,
          key: 'exTime',
          align: 'center',
          render: (h, params) => {
            return h('span', self.getDataToLocalTime(params.row.despatchTime, 'fulltime'));
          }
        }
      ]
    };
  },
  watch: {
    pageParamsStatus (n) {
      let v = this;
      if (n) {
        v.getSearchResult();
        v.pageParamsStatus = false;
      }
    },
    selectStore (n, o) {
      let v = this;
      if (n !== o) {
        v.pageParams = v.deepCopy(v.pageParamsPrototype);
        v.pageParams.warehouseId = n;
        v.pageParamsStatus = true;
        sessionStorage.setItem('warehouseId', n);
      }
    }
  },
  activated () {
    this.reset();
    this.startLoading();
  },
  methods: {
    startLoading () {
      let v = this;
      v.$Loading.start();
      Promise.resolve(v.getShopList()).then(() => {
        v.$Loading.finish();
      });
    },
    getSearchResult () {
      let v = this;
      v.loading = true;
      v.axios.post(api.get_packageToRetrieve, JSON.stringify(v.pageParams)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas.list;
          let merchantShippingMethodIdPos = [];
          if (data !== null && data.length > 0) {
            data.forEach((n, i) => {
              n.carrierName = null;
              n.carrierShippingMethodName = null;
              n.index = i + 1;
              merchantShippingMethodIdPos.push(n.merchantShippingMethodId);
            });
            Promise.resolve(v.axios.post(api.queryCarrierShippingName, JSON.stringify(merchantShippingMethodIdPos)).then(response => {
              if (response.data.code === 0) {
                if (response.data.datas.length > 0) {
                  response.data.datas.forEach((n, i) => {
                    data.forEach((m, t) => {
                      if (m.merchantShippingMethodId === n.shippingMethodId) {
                        m.carrierName = n.carrierName;
                        m.carrierShippingMethodName = n.carrierShippingMethodName;
                      }
                    });
                  });
                }
              }
            })).then(() => {
              v.printData = data;
              v.$nextTick(function () {
                v.total = Number(response.data.datas.total);
                v.totalPage = Number(response.data.datas.pages);
              });
            });
          } else {
            v.printData = [];
            v.pageParamsStatus = false;
            v.$nextTick(function () {
              v.total = 0;
              v.totalPage = 0;
            });
          }
        } else {
          v.printData = [];
          v.pageParamsStatus = false;
          v.$nextTick(function () {
            v.total = 0;
            v.totalPage = 0;
          });
        }
        v.loadingFalse();
      });
    },
    reset () {
      let v = this;
      v.$refs['pageParams'].resetFields();
      v.shippingMethodModel = [];
      v.payTimeArr = [];
      v.resetDate();
    },
    search () {
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    changeShippingMethod (value, data) {
      let v = this;
      v.pageParams.merchantCarrierId = value[0];
      v.pageParams.merchantShippingMethodId = value[1][0];
    },
    resetDate () {
      let v = this;
      v.pageParams.payStartTime = null;
      v.pageParams.payEndTime = null;
    },
    getDateValue (value) { // 获取日期返回值
      var v = this;
      if (value.length === 0) {
        v.$Message.error('日期格式有误');
        v.resetDate();
      } else {
        if (value[0] !== '') {
          v.pageParams.startDespatchTime = v.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
          v.pageParams.endDespatchTime = v.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
        }
      }
    },
    getDateValue1 (value) { // 获取日期返回值
      var v = this;
      if (value[0] !== '') {
        v.pageParams.payStartTime = v.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
        v.pageParams.payEndTime = v.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
      }
    },
    exportDataHasCondition () { // 导出选中
      this.exportData('all');
    },
    exportData (type) {
      let v = this;
      if ((v.packageIds.length === 0 || v.packageIds === null) && type !== 'all') {
        v.$Message.error('请选择包裹');
        return false;
      }
      v.exportModelStatus = true;
      if (type === 'all') {
        v.exportModel.title = '导出（所有结果集）';
        v.exportModel.content = '导出所有结果集，系统将符合您当前查询选择的所有包裹导出到excel，系统限制一次性只能导出不超过10000个包裹。';
      } else {
        v.exportModel.title = '导出选中';
        v.exportModel.content = '系统将您勾选的包裹导出到excel';
      }
      v.$nextTick(function () {
        v.exportModel.status = true;
      });
    },
    exportExcel (type) {
      let v = this;
      let obj = {
        packageIds: v.packageIds,
        timeZone: v.$common.getDefaultTimezoom()
      };
      if (v.exportModel.title === '导出（所有结果集）') {
        obj = Object.assign(obj, v.pageParams);
      }
      let newTab = window.open('about:blank');
      v.axios.post(api.export_package, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          let erpCommon = v.$store.state.erpConfig;
          newTab.location.href = erpCommon.filenodeViewTargetUrl + response.data.datas;
          setTimeout(function () {
            newTab.close();
          }, 1000);
        } else {
          newTab.close();
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('系统繁忙，请重新尝试');
        }
      });
    },
    getSelectValue (value) { // table获取所选值
      let v = this;
      let pos = [];
      Promise.resolve(value.forEach((n, i) => {
        pos.push(n.packageId);
      })).then(() => {
        v.packageIds = pos;
      });
    },
    showPackageDetails (pid) {
      let v = this;
      v.packageId = pid;
      v.packageDetailsStatus = true;
      let date = new Date().getTime();
      v.$nextTick(function () {
        v.packageModel = true;
        v.timestamp = date;
      });
    }
  },
  created () {
    let v = this;
    v.pageParamsPrototype = v.deepCopy(v.pageParams);
  },
  mounted () {
    let v = this;
    v.getAllstore(0, 1).then(response => {
      // v.$store.commit('warehouseId', v.selectStore);
      sessionStorage.setItem('warehouseId', v.selectStore);
    });
    setTimeout(v.getCountrys(), 2000);// 获取国家区域列表
  }
};
</script>
