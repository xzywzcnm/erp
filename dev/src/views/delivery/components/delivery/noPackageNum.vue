<template>
  <div>
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <Form ref="pageParams" :model="pageParams" label-position="left" :label-width="80">
            <div class="platformParamsSelect">
              <Row>
                <Col :lg="twoItemLg" :md="twoItemMd">
                <FormItem label="状态：" prop="name">
                  <Button-group>
                    <template v-for="(item, index) in statusList">
                      <Button v-if="item.selected" type="primary" @click="selectStatus(index,item.status)" :key="index">{{ item.title }} </Button>
                      <Button v-if="!item.selected" @click="selectStatus(index,item.status)" :key="index">{{ item.title }} </Button>
                    </template>
                  </Button-group>
                </FormItem>
                </Col>
                <Col :lg="twoItemLg" :md="twoItemMd">
                <FormItem label="物流方式：">
                  <Cascader transfer v-model="shippingMethodModel" :load-data="loadData" @on-visible-change="showShippingData" @on-change="changeShippingMethod" :data="shippingMethodData" filterable></Cascader>
                </FormItem>
                </Col>
              </Row>
            </div>
            <div class="platformParamsMoreSection" :class="{none : !moreFilter}">
              <Row>
                <Col :span="5">
                <Form-item label="国家/地区">
                  <dyt-select v-model="countryModal" @on-change="countryChange" filterable multiple placeholder="请选择或输入所在地">
                    <Option v-for="(item,index) in formValidate.country" :key="index" :value="item.twoCode">{{ item.enName }}</Option>
                  </dyt-select>
                </Form-item>
                </Col>
                <Col :span="5" :offset="1">
                <Form-item label="付款时间">
                  <Date-picker transfer type="daterange" @on-clear="resetDate" @on-change="getDateValue" :clearable="clearAble" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end" placeholder="选择日期" :value="payTimeArr"></Date-picker>
                </Form-item>
                </Col>
                <Col :span="5" :offset="1">
                <Form-item label="订单号" prop="orderNo">
                  <Input placeholder="请输入订单号,多个订单号用逗号或回车分隔" type="textarea" v-model.trim="pageParams.orderNo"></Input>
                </Form-item>
                </Col>
              </Row>
              <Row class="normalTop">
                <Col :span="5">
                <Form-item label="买家姓名" prop="buyerName">
                  <Input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></Input>
                </Form-item>
                </Col>
                <Col :span="5" :offset="1">
                <Form-item label="买家ID" prop="buyerAccountId">
                  <Input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></Input>
                </Form-item>
                </Col>
                <Col :span="5" :offset="1">
                <Form-item label="平台产品编码" prop="webstoreItemId">
                  <Input placeholder="请输入平台产品编码" v-model.trim="pageParams.webstoreItemId"></Input>
                </Form-item>
                </Col>
                <Col :span="5" :offset="1">
                <Form-item label="SKU" prop="sku">
                  <Input placeholder="请输入SKU" v-model.trim="pageParams.sku"></Input>
                </Form-item>
                </Col>
              </Row>
            </div>
            <div class="platformSearch clear" v-if="!moreFilter">
              <Row>
                <Col :span="7">
                <div class="filterItem">
                  <Form-item label="搜索字符" prop="searchValue">
                    <Input type="textarea" placeholder="可输入订单号、包裹号、买家ID、买家姓名、SKU、平台产品编码" v-model.trim="pageParams.searchValue">
                    </Input>
                  </Form-item>
                </div>
                </Col>
              </Row>
            </div>
            <div class="filterItem filterConfirm" :class="{normalTop : moreFilter}">
              <Button type="primary" @click="search" size="small" :disabled="SearchDisabled" icon="md-search">查询 </Button>
              <Button @click="reset" size="small" v-once icon="md-refresh">重置 </Button>
            </div>
          </Form>
        </div>
      </div>
      <div class="moreFilter">
        <Button size="small" @click="toggleMoreFilter">
          {{ moreFilterMes }}
          <Icon :type="moreFilterIcon" size="small"></Icon>
        </Button>
      </div>
    </div>
    <div class="dataSort">
      <span>排序：</span>
      <Button-group>
        <template v-for="(item, index) in buttonGroupModel">
          <Button v-if="item.selected" :disabled="SearchDisabled" type="primary" @click="modifyTheSort(index, item.status)" :key="index">
            {{ item.title }}
            <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
            <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
          </Button>
          <Button v-if="!item.selected" :disabled="SearchDisabled" @click="modifyTheSort(index, item.status)" :key="index">
            {{ item.title }}
            <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
            <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
          </Button>
        </template>
      </Button-group>
    </div>
    <div class="tableControl" v-if="tableControlStatus">
      <Buttons type="primary" style="margin-left: 20px" trigger="click" @on-click="getWayBillHasCondition">
        <Button type="primary" class="iconbuttons" @click="getWayBill">
          <Icon type="cloud"></Icon>
          获取运单号
        </Button>
        <Buttons-menu slot="list">
          <Buttons-item name="1">获取运单号（所有结果集）</Buttons-item>
        </Buttons-menu>
      </Buttons>
    </div>
    <div class="orderTable normalTop">
      <keep-alive>
        <Table highlight-row border :columns="orderColumn" :height="tableHeight" :loading="tableLoading" :data="pendingData" @on-selection-change="getSelectValue"></Table>
      </keep-alive>
      <div class="table-page">
        <div class="table-page-right">
          <keep-alive>
            <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
          </keep-alive>
        </div>
      </div>
    </div>
    <!-- 包裹详情 -->
    <keep-alive>
      <sliderModal v-model="packageModel" :spinShow="spinShow" :styles="{}" class="slider-model" v-if="packageDetailsStatus">
        <packageDetails :packageId="packageId" :storeList="storeListDal" @spinLoading="spinLoading" @resetSpinShow="resetSpinShow" :timestamp="timestamp"></packageDetails>
      </sliderModal>
    </keep-alive>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import packageDetails from './packageDetails';
import tableMixin from '@/components/mixin/table_mixin';
import deliveryMixin from '@/components/mixin/delivery_mixin';

export default {
  mixins: [Mixin, tableMixin, deliveryMixin],
  components: {
    packageDetails
  },
  props: ['choiceStore', 'storeListDal'], // 选中仓库
  data () {
    let self = this;
    return {
      tableControlStatus: true,
      payTimeArr: [], // 详情参数 Start
      packageModel: false,
      packageDetailsStatus: true,
      packageId: null,
      timestamp: null, // End
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      buttonGroupModel: [
        {
          type: 'payTime',
          selected: true,
          status: true, // true up false down
          title: '按付款时间'
        }, {
          type: 'salesTime',
          selected: false,
          status: true, // true up false down
          title: '按下单时间'
        }, {
          type: 'carrierSendDate',
          selected: false,
          status: true, // true up false down
          title: '按下发物流商时间'
        }
      ],
      packageIds: [],
      orderColumn: [
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
          width: 160,
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
          title: '订单号',
          key: 'salesRecordNumber',
          width: 160,
          align: 'center',
          render: (h, params) => {
            let pos = [];
            if (params.row.packageOrderBoList !== null) {
              for (let i = 0; i < params.row.packageOrderBoList.length; i++) {
                let n = params.row.packageOrderBoList[i];
                pos.push(h('div', params.row.accountCode + '-' + n.salesRecordNumber));
              }
              return h('div', pos);
            }
          }
        }, {
          title: '买家ID/姓名',
          key: 'buyerName',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            return h('div', [
              h('div', { class: 'blueColor' }, params.row.buyerAccountId),
              h('div', { class: 'redColor' }, params.row.buyerName)
            ]);
          }
        }, {
          title: '国家/地区',
          key: 'buyerCountryCodeList',
          align: 'center',
          width: 110
        }, {
          title: '物流方式',
          key: 'merchantShippingMethodId',
          align: 'center',
          minWidth: 200,
          render: (h, params) => {
            if (params.row.carrierName === null || params.row.carrierName === '') {
              return '';
            } else {
              return h('div', params.row.carrierName + ' > ' + params.row.carrierShippingMethodName);
            }
          }
        }, {
          title: 'SKU数量',
          key: 'skuQuantity',
          align: 'center',
          width: 90
        }, {
          title: '物品数量',
          key: 'productQuantity',
          align: 'center',
          minWidth: 100,
          maxWidth: 120
        }, {
          title: '付款时间',
          minWidth: 160,
          align: 'center',
          key: 'payTime',
          render: (h, params) => {
            return self.getDataToLocalTime(params.row.payTime, 'fulltime');
          }
        }, {
          title: '状态',
          key: 'carrierSendStatus',
          align: 'center',
          width: 100,
          render: (h, params) => {
            let d = params.row.carrierSendStatus;
            let text = '获取失败';
            let icon = 'icon iconfont icon-weijiuxu';
            let iconColor = '#ff3300';
            if (d === 1) {
              text = '未获取';
              icon = 'icon iconfont icon-weijiuxu';
              iconColor = '#444';
            } else if (d === 2) {
              text = '获取中';
              icon = 'icon iconfont icon-shenqingzhong';
              iconColor = '#f00';
            } else if (d === 3) {
              text = '申请成功';
              icon = 'icon iconfont icon-shenqingchenggong';
              iconColor = '#f00';
            }
            return h('div', {
              style: {
                textAlign: 'center',
                color: iconColor
              }
            }, [
              h('div', [
                h('span', {
                  class: icon
                }), h('div', text)
              ])
            ]);
          }
        }, {
          title: '操作',
          key: 'operate',
          width: 160,
          align: 'center',
          render: (h, params) => {
            if (params.row !== undefined) {
              return h('div', [
                h('Buttons', {
                  props: {
                    trigger: 'click',
                    transfer: true
                  },
                  class: 'defaultStyle',
                  on: {
                    'on-click': value => {
                      if (value === '1') {
                        self.getWayBill('single', params.row.packageId);
                      }
                    }
                  }
                }, [
                  h('Button', {
                    type: 'default',
                    class: 'iconbuttons',
                    on: {
                      click: () => {
                        self.showPackageDetails(params.row.packageId);
                      }
                    }
                  }, [
                    h('span', {
                      class: 'icon iconfont icon-chakan'
                    }), h('span', '查看包裹详情')
                  ]), h('Buttons-menu', {
                    slot: 'list'
                  }, [
                    h('Buttons-item', {
                      props: {
                        name: '1'
                      }
                    }, '获取运单号')
                  ])
                ])
              ]);
            }
          }
        }
      ],
      pendingData: [],
      countryModal: [],
      clearAble: true,
      resetStatus: true,
      pageParamsPrototype: null, // 重置查询条件
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        carrierSendStatus: null,
        buyerCountryCodeList: null,
        merchantCarrierId: null,
        merchantShippingMethodId: null,
        buyerAccountId: null,
        buyerName: null,
        webstoreItemId: null,
        sku: null,
        payStartTime: null,
        payEndTime: null,
        orderNo: null,
        declarationStatus: null,
        orderBy: 'payTime',
        upDown: 'up',
        searchValue: null, // 搜索内容
        warehouseId: self.choiceStore // 仓库
      },
      statusList: [
        {
          selected: true,
          status: 1,
          title: '未获取或获取失败'
        }, {
          selected: false,
          status: 2,
          title: '后台获取中'
        }
      ],
      moreFilter: false, // 高级筛选
      moreFilterIcon: 'md-arrow-dropdown',
      moreFilterMes: '更多选项（平台、店铺、国家/地区等）'
    };
  },
  watch: {
    pageParamsStatus (n) {
      let v = this;
      if (n) {
        v.getPendingData();
        v.pageParamsStatus = false;
      }
    },
    choiceStore (n, o) {
      let v = this;
      if (n !== o) {
        v.pageParams = v.deepCopy(v.pageParamsPrototype);
        v.pageParams.warehouseId = n;
        v.pageParamsStatus = true;
      }
    }
  },
  computed: {
    tableHeight () {
      return this.getTableHeight(450);
    }
  }, // activated () {
  //   this.startLoading();
  // },
  methods: {
    startLoading () {
      let v = this;
      v.$Loading.start();
      Promise.resolve(v.getPendingData()).then(() => {
        v.$Loading.finish();
      });
    },
    getPendingData () {
      let v = this;
      if (v.pageParams.warehouseId) {
        v.loadingTrue();
        v.axios.post(api.get_unsuccessfulData, JSON.stringify(v.pageParams)).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            let pos = [];
            let saleAccountIdPos = [];
            let merchantShippingMethodIdPos = [];
            if (data.list !== null) {
              data.list.forEach((n, i) => {
                pos.push({
                  buyerName: n.buyerName,
                  buyerAccountId: n.buyerAccountId,
                  buyerCountryCodeList: n.buyerCountryCode,
                  packageOrderBoList: n.packageOrderBoList,
                  saleAccountId: n.saleAccountId,
                  trackingNumberStatus: n.trackingNumberStatus,
                  declarationStatus: n.declarationStatus,
                  packageCode: n.packageCode,
                  merchantShippingMethodId: n.merchantShippingMethodId,
                  carrierName: null,
                  carrierShippingMethodName: null,
                  payTime: n.payTime,
                  totalWeight: n.totalWeight,
                  skuQuantity: n.skuQuantity,
                  productQuantity: n.productQuantity,
                  accountCode: '',
                  packageId: n.packageId,
                  carrierSendStatus: n.carrierSendStatus
                });
                saleAccountIdPos.push(n.saleAccountId);
                merchantShippingMethodIdPos.push(n.merchantShippingMethodId);
              });
              v.pageParamsStatus = false;
              if (saleAccountIdPos.length > 0) { // 匹配订单号
                Promise.resolve(v.axios.post(api.get_saleAccountById + '?saleAccountIds=' + saleAccountIdPos).then(response => {
                  if (response.data.code === 0) {
                    let list = response.data.datas;
                    for (let i = 0; i < list.length; i++) {
                      for (let t = 0; t < pos.length; t++) {
                        if (pos[t].saleAccountId === list[i].saleAccountId) {
                          pos[t].accountCode = list[i].accountCode;
                        }
                      }
                    }
                  }
                }), v.axios.post(api.queryCarrierShippingName, JSON.stringify(merchantShippingMethodIdPos)).then(response => {
                  if (response.data.code === 0) {
                    if (response.data.datas.length > 0) {
                      response.data.datas.forEach((n, i) => {
                        pos.forEach((m, t) => {
                          if (m.merchantShippingMethodId === n.shippingMethodId) {
                            m.carrierName = n.carrierName;
                            m.carrierShippingMethodName = n.carrierShippingMethodName;
                          }
                        });
                      });
                    }
                  }
                })).then(function () {
                  v.pendingData = pos;
                });
              }
              v.$nextTick(function () {
                v.total = Number(data.total);
                v.totalPage = Number(data.pages);
                v.loadingFalse();
              });
            } else {
              v.pendingData = [];
              v.$nextTick(function () {
                v.total = 0;
                v.totalPage = 0;
              });
              v.Loading = false;
            }
          }
        }).catch(() => {
          v.loadingFalse();
        });
      }
    },
    selectStatus (index, status) {
      let v = this;
      if (index === 0) {
        v.pageParams.carrierSendStatus = 1;
        v.tableControlStatus = true;
      } else {
        v.pageParams.carrierSendStatus = 2;
        v.tableControlStatus = false;
      }
      v.statusList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    reset () {
      let v = this;
      v.$refs['pageParams'].resetFields();
      v.shippingMethodModel = [];
      v.countryModal = [];
      v.selectStatus(0, 1);
      v.resetDate();
      v.payTimeArr = [];
    },
    search () {
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    resetDate () {
      let v = this;
      v.pageParams.payStartTime = null;
      v.pageParams.payEndTime = null;
    },
    getDateValue (value) { // 获取日期返回值
      let v = this;
      if (value.length === 0) {
        v.$Message.error('日期格式有误');
        v.resetDate();
      } else {
        if (value[0] !== '') {
          v.pageParams.payStartTime = v.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
          v.pageParams.payEndTime = v.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
        }
      }
    },
    getWayBillHasCondition () {
      this.getWayBill('all');
    },
    getWayBill (type, id) {
      let v = this;
      let obj;
      if ((v.packageIds.length === 0 || v.packageIds == null) && type !== 'all' && type !== 'single') {
        v.$Message.error('请选择包裹');
        return false;
      }
      if (type === 'single') {
        obj = {
          packageIds: [id]
        };
      } else if (type === 'all') {
        obj = Object.assign({}, v.pageParams);
      } else {
        obj = {
          packageIds: v.packageIds
        };
      }
      v.axios.put(api.get_logistickPackageInfo, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('获取运单号成功');
          v.packageIds = [];
          v.pageParamsStatus = true;
        } else {
          v.$Message.success('获取运单号失败');
        }
      });
    },
    getSelectValue (value) { // table获取所选值
      let v = this;
      let pos = [];
      Promise.resolve(value.forEach((n, i) => {
        pos.push(n.packageId);
      })).then(function () {
        v.packageIds = pos;
      });
    },
    changeShippingMethod (value, data) {
      let v = this;
      v.pageParams.merchantCarrierId = value[0];
      v.pageParams.merchantShippingMethodId = value[1][0];
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
    this.startLoading();
  },
  mounted () {
    let v = this;
    setTimeout(v.getCountrys(), 2000);// 获取国家区域列表
  }
};
</script>
