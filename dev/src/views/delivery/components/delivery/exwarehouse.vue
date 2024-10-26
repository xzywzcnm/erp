<style scoped>
.printTimeBefore {
  position: absolute;
  top: 0;
  right: -35px;
}

.goToScanEx {
  position: absolute;
  right: 12px;
  top: -36px;
}
</style>
<template>
  <div>
    <div v-if="storeStatus && !$common.isEmpty(allStorelist)" class="selectStore">
      请选择仓库： <dyt-select v-model="selectStore" style="width:200px">
        <Option v-for="(item,index) in allStorelist" :value="item.warehouseId" :key="index">{{ item.warehouseName }}</Option>
      </dyt-select>
    </div>
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="goToScanEx">
            <Button type="primary" @click="gotoScanEx" icon="arrow-swap">切换为扫描出库 </Button>
          </div>
          <Form ref="pageParams" :model="pageParams" :label-width="70">
            <Row class="platformParamsSelect normalTop">
              <Col :span="5">
              <FormItem label="物流方式">
                <Cascader v-model="shippingMethodModel" :load-data="loadData" @on-visible-change="showShippingData" @on-change="changeShippingMethod" :data="shippingMethodData" filterable transfer></Cascader>
              </FormItem>
              </Col>
              <Col :span="5" :offset="1">
              <Form-item label="打印时间">
                <Date-picker transfer style="width:100%" type="date" @on-clear="resetDate" @on-change="getDateValue" :clearable="clearAble" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end" placeholder="选择日期" :value="printTimeArr"></Date-picker>
                <span class="printTimeBefore">之前</span>
              </Form-item>
              </Col>
              <Col :span="5" :class="{none: !moreFilter}" :offset="1">
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
              <Col :span="5" :class="{none : !moreFilter}" :offset="1">
              <Form-item label="国家/地区" prop="buyerCountryCodeList">
                <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" filterable multiple placeholder="请选择或输入所在地">
                  <Option v-for="(item,index) in formValidate.country" :key="index" :value="item.twoCode">{{ item.enName }}</Option>
                </dyt-select>
              </Form-item>
              </Col>
            </Row>
            <div class="platformParamsMoreSection" :class="{none : !moreFilter}">
              <Row>
                <Col :span="5">
                <FormItem label="平台">
                  <dyt-select v-model="pageParams.platformId" @on-change="changeValue">
                    <Option v-for="item in platformArr" :key="item.platformId" :label="item.title" :value="item.platformId"></Option>
                  </dyt-select>
                </FormItem>
                </Col>
                <Col :span="5" :offset="1">
                <Form-item label="运单号" prop="waybillNo">
                  <Input placeholder="请输入运单号，多个运单号可以英文逗号隔开" v-model.trim="pageParams.waybillNo"></Input>
                </Form-item>
                </Col>
                <Col :span="5" :offset="1">
                <Form-item label="包裹号" prop="packageCode">
                  <Input placeholder="请输入包裹号" v-model.trim="pageParams.packageCode"></Input>
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
          <Button v-if="item.selected" type="primary" @click="modifyTheSort(index,item.status)" :key="index">
            {{ item.title }}
            <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
            <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
          </Button>
          <Button v-if="!item.selected" @click="modifyTheSort(index,item.status)" :key="index">
            {{ item.title }}
            <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
            <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
          </Button>
        </template>
      </Button-group>
    </div>
    <div class="tableControl">
      <Buttons type="primary" style="margin-left: 10px" trigger="click" @on-click="markOutboundHasCondition">
        <Button type="primary" class="iconbuttons" @click="MarkOutbound('moreSelect')">
          <Icon type="android-exit"></Icon>
          标出库
        </Button>
        <Buttons-menu slot="list">
          <Buttons-item name="1">标出库（所有结果集）</Buttons-item>
        </Buttons-menu>
      </Buttons>
      <Button type="primary" class="iconbuttons" @click="markOutOfStock" style="margin-left:10px">
        <Icon type="document-text"></Icon>
        标记缺货
      </Button>
    </div>
    <div class="orderTable normalTop">
      <keep-alive>
        <Table highlight-row border :loading="loading" :height="tableHeight" :columns="orderColumn" :data="printData" @on-selection-change="getSelectValue"></Table>
      </keep-alive>
      <div class="table-page">
        <div class="table-page-right">
          <keep-alive>
            <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
          </keep-alive>
        </div>
      </div>
    </div>
    <keep-alive>
      <Modal v-model="scanModel.status" @on-ok="setOut">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">{{ scanModel.title }}</div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              <Row>
                <Col :span="1">
                <Icon type="md-information-circle" color="#2b85e4" size="44"></Icon>
                </Col>
                <Col :span="21" :offset="2">
                <p>
                  {{ scanModel.content }} </p>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Modal>
    </keep-alive>
    <keep-alive>
      <Modal v-model="stockModel.status" :loading="setStockoutLoading" @on-ok="setStockoutIt" width="600">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">标记缺货</div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              <Row>
                <Col :span="1">
                <Icon type="md-information-circle" color="#2b85e4" size="44"></Icon>
                </Col>
                <Col :span="21" :offset="2">
                <p>
                  以下SKU列表是所选包裹中所包含的SKU的汇总，请选择缺货的SKU，标记缺货后，系统将自动将包裹还原到缺货状态，并还原所选SKU的库存，同时建立所选SKU的盘点单，请进行盘点修正库存。 </p>
                </Col>
              </Row>
            </div>
            <div class="normalTop">
              <Table highlight-row border :columns="selectProductColumn" :data="selectProductData" size="small" @on-selection-change="getSelectValue1"></Table>
            </div>
          </div>
        </div>
      </Modal>
    </keep-alive>
    <!-- 包裹详情 -->
    <keep-alive>
      <sliderModal v-model="packageModel" :spinShow="spinShow" :styles="{}" class="slider-model" v-if="packageDetailsStatus">
        <packageDetails :packageId="packageId" :allStorelist="allStorelist" @spinLoading="spinLoading" @updateList="getList" @resetSpinShow="resetSpinShow" :timestamp="timestamp"></packageDetails>
      </sliderModal>
    </keep-alive>
    <keep-alive>
      <Modal v-model="isRecycl" v-if="isRecyclStatus" ok-text="继续发货" cancel-text="去回收" @on-ok="keepOut" @on-cancel="goCancel">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">作废包裹回收提醒</div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              <Row>
                <Col :span="1">
                <Icon type="md-information-circle" color="#2b85e4" size="44"></Icon>
                </Col>
                <Col :span="21" :offset="2">
                <p>
                  【作废包裹】中存在未回收包裹，是否先回收包裹? </p>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Modal>
    </keep-alive>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import packageDetails from './packageDetails';
import tableMixin from '@/components/mixin/table_mixin';
import deliveryMixin from '@/components/mixin/delivery_mixin';
import publicService from '@/components/mixin/publicService_mixin';

export default {
  mixins: [Mixin, tableMixin, deliveryMixin, publicService],
  components: {
    packageDetails
  },
  data () {
    var self = this;
    return {
      // 标发货提示参数
      isRecycl: false,
      isRecyclStatus: false, // 详情参数 Start
      packageModel: false,
      packageDetailsStatus: true,
      packageId: null,
      timestamp: null,
      setStockoutLoading: true,
      stockModel: {
        status: false
      },
      selectProductColumn: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          key: 'pictureUrl',
          width: 100,
          title: '图片',
          resizable: true,
          align: 'center',
          render: (h, params) => {
            return this.tableImg(h, params, 'pictureUrl');
          }
        }, {
          key: 'sku',
          width: 120,
          align: 'center',
          title: 'sku'
        }, {
          key: 'title',
          align: 'center',
          title: 'title'
        }
      ],
      selectProductData: [],
      scanModel: {
        status: false,
        title: '',
        content: '',
        type: '',
        pid: null,
        batchNo: null
      },
      packageIds: [],
      stockoutArr: [],
      buttonGroupModel: [
        {
          type: 'printTime',
          selected: true,
          status: true, // true up false down
          title: '按打印时间'
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
      pageParamsPrototype: null, // 重置查询条件
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        status: 0,
        getLabelStatus: null,
        platFormId: null,
        saleAccountIds: [],
        buyerCountryCodeList: [],
        packageCode: null,
        waybillNo: null,
        searchValue: null, // 搜索内容
        warehouseId: self.selectStore // 仓库
      },
      options2: this.$common.dateOptions(),
      platformArr: [
        {
          platformId: '全部',
          title: '全部'
        }, {
          platformId: 'ebay',
          title: 'ebay'
        }
      ],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      moreFilter: false, // 高级筛选
      moreFilterIcon: 'md-arrow-dropdown',
      moreFilterMes: '更多选项（平台、店铺、国家/地区等）',
      clearAble: true,
      resetStatus: true,
      printTimeArr: '',
      shopList: [],
      printData: [],
      orderColumn: [
        {
          type: 'selection',
          width: 60,
          fixed: 'left',
          align: 'center'
        }, {
          title: 'NO',
          key: 'index',
          fixed: 'left',
          align: 'center',
          width: 60
        }, {
          title: '包裹号',
          key: 'packageCode',
          fixed: 'left',
          align: 'center',
          width: 140,
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
          width: 140,
          align: 'center',
          render: (h, params) => {
            let pos = [];
            if (params.row.packageOrderBoList !== null) {
              for (let i = 0; i < params.row.packageOrderBoList.length; i++) {
                var n = params.row.packageOrderBoList[i];
                pos.push(h('div', params.row.accountCode + '-' + n.salesRecordNumber));
              }
              return h('div', pos);
            }
          }
        }, {
          title: '买家ID/姓名',
          key: 'buyerName',
          align: 'center',
          width: 150,
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
          width: 100
        }, {
          title: '物流方式',
          key: 'carrierShippingMethodName',
          align: 'center',
          width: 200
        }, {
          title: '运单号',
          key: 'trackingNumber',
          align: 'center',
          width: 180
        }, {
          title: 'SKU数量',
          key: 'skuQuantity',
          align: 'center',
          width: 100
        }, {
          title: '物品数量',
          key: 'productQuantity',
          align: 'center',
          width: 120
        }, {
          title: '付款时间',
          align: 'center',
          minWidth: 160,
          key: 'payTime',
          render: (h, params) => {
            return self.getDataToLocalTime(params.row.payTime, 'fulltime');
          }
        }, {
          title: '操作',
          key: 'operate',
          width: 160,
          align: 'center',
          fixed: 'right',
          render: (h, params) => {
            let placement = 'bottom';
            if (self.printData && self.printData.length > 4 && params.index === self.printData.length - 1) {
              placement = 'top';
            }
            if (params.row !== undefined) {
              return h('div', [
                h('Buttons', {
                  props: {
                    trigger: 'click',
                    placement: placement,
                    transfer: true
                  },
                  class: 'defaultStyle',
                  on: {
                    'on-click': value => {
                      if (value === '1') {
                        self.showPackageDetails(params.row.packageId);
                      }
                    }
                  }
                }, [
                  h('Button', {
                    type: 'default',
                    class: 'iconbuttons',
                    on: {
                      click: () => {
                        self.MarkOutbound('single', params.row.packageId, params.row.deliveryBatchNo);
                      }
                    }
                  }, [
                    h('span', '标出库')
                  ]), h('Buttons-menu', {
                    slot: 'list'
                  }, [
                    h('Buttons-item', {
                      props: {
                        name: '1'
                      }
                    }, '查看包裹详情')
                  ])
                ])
              ]);
            }
          }
        }
      ],
      loading: true,
      tableHeight: self.getTableHeight(420)
    };
  },
  activated () {
    this.reset();
    this.startLoading();
  },
  watch: {
    pageParamsStatus (n) {
      var v = this;
      if (n) {
        v.getList();
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
  methods: {
    startLoading () {
      var v = this;
      v.$Loading.start();
      Promise.resolve(v.getList()).then(function () {
        v.$Loading.finish();
        v.getShopList();
      });
    },
    getList () {
      let v = this;
      if (v.pageParams.warehouseId) {
        v.axios.post(api.get_exList, JSON.stringify(v.pageParams)).then(response => {
          let saleAccountIdPos = [];
          let merchantShippingMethodIdPos = [];
          if (response.data.code === 0) {
            let data = response.data.datas.list;
            if (data !== null && data.length > 0) {
              data.forEach((n, i) => {
                n.index = i + 1;
                saleAccountIdPos.push(n.saleAccountId);
                merchantShippingMethodIdPos.push(n.merchantShippingMethodId);
              });
              const getSalesAccountData = new Promise((resolve, reject) => {
                v.axios.post(api.get_saleAccountById + '?saleAccountIds=' + saleAccountIdPos).then(response => {
                  if (response.data.code === 0) {
                    var list = response.data.datas;
                    for (var i = 0; i < list.length; i++) {
                      for (var t = 0; t < data.length; t++) {
                        if (data[t].saleAccountId === list[i].saleAccountId) {
                          data[t].accountCode = list[i].accountCode;
                        }
                      }
                    }
                    resolve(true);
                  } else {
                    (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.success('系统繁忙，请重新尝试');
                    resolve(false);
                  }
                }).catch(() => {
                  resolve(false);
                });
              });
              const getAllShippingMethods = new Promise((resolve, reject) => {
                v.axios.get(api.get_allEnabalShippingMethods + '?carrierShippingMethodIdList=' + merchantShippingMethodIdPos).then(response1 => {
                  let shippingData = response1.data.datas;
                  shippingData.forEach((m, t) => {
                    data.forEach((n, i) => {
                      if (n.merchantShippingMethodId === m.shippingMethodId) {
                        data[i].carrierShippingMethodName = m.carrierShippingMethodName;
                      }
                    });
                  });
                  resolve(true);
                }).catch(() => {
                  resolve(false);
                });
              });
              Promise.all([getSalesAccountData, getAllShippingMethods]).then(result => {
                if (result[0] && result[1]) {
                  v.$nextTick(function () {
                    v.total = Number(response.data.datas.total);
                    v.totalPage = Number(response.data.datas.pages);
                    v.loadingFalse();
                    v.$Loading.finish();
                    v.printData = data;
                  });
                } else {
                  v.printData = [];
                  v.$nextTick(function () {
                    v.total = 0;
                    v.totalPage = 0;
                  });
                }
              });
            } else {
              v.printData = [];
              v.$nextTick(function () {
                v.total = 0;
                v.totalPage = 0;
              });
            }
            v.loading = false;
          }
        });
      }
    },
    selectPackagePaper (index, status) {
      let v = this;
      if (index === 0) {
        delete v.pageParams.status;
      } else if (index === 1) {
        v.pageParams.status = '1';
      } else {
        v.pageParams.status = '0';
      }
      v.pageParamsStatus = true;// 更新数据
      v.curPage = 1;
      v.pageParams.pageNum = 1;
      v.packagePaperList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    selectPackageSize (index, status) {
      let v = this;
      if (index === 0) {
        delete v.pageParams.status;
      } else if (index === 1) {
        v.pageParams.status = '1';
      } else {
        v.pageParams.status = '0';
      }
      v.pageParamsStatus = true;// 更新数据
      v.curPage = 1;
      v.pageParams.pageNum = 1;
      v.packagePaperList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    reset () {
      let v = this;
      v.printTimeArr = null;
      v.resetDate();
      v.shippingMethodModel = [];
      v.$refs['pageParams'].resetFields();
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
      v.pageParams.printEndTime = '';
    },
    getDateValue (value) { // 获取日期返回值
      let v = this;
      if (value) {
        v.pageParams.printEndTime = v.getUniversalTime(new Date(value).getTime(), 'fulltime');
      }
    },
    MarkOutbound (type, pid, batchNo) {
      let v = this;
      if (type !== 'all' && type !== 'single') {
        if (v.packageIds.length < 1) {
          v.$Message.error('请选择包裹');
          return false;
        }
        v.scanModel.title = '标出库';
        v.scanModel.content = '标出库，系统将符合您选择的包裹标记为已出库。';
        v.scanModel.type = 'moreSelect';
      } else if (type === 'all') {
        v.scanModel.type = 'all';
      } else if (type === 'single') {
        v.scanModel.title = '标出库';
        v.scanModel.content = '标出库，系统将符合您选择的包裹标记为已出库。';
        v.scanModel.type = 'single';
        v.scanModel.pid = pid;
        v.scanModel.batchNo = batchNo;
      }
      v.scanModel.status = true;
    },
    setOut (flag) {
      let v = this;
      let obj;
      let url = api.set_batchMarkPackageDelivery;
      if (v.scanModel.type === 'all') {
        obj = v.deepCopy(v.pageParams);
      } else if (v.scanModel.type === 'moreSelect') {
        obj = {
          packageIds: v.packageIds
        };
      } else {
        obj = {
          packageId: v.scanModel.pid,
          deliveryBatchNo: v.scanModel.batchNo
        };
        url = api.set_markPackageDelivery;
      }
      if (flag) {
        obj.flag = 1;
      } else {
        obj.flag = null;
      }
      v.axios.put(url, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        } else if (response.data.code === 111138) {
          v.isRecyclStatus = true;
          v.$nextTick(function () {
            v.isRecycl = true;
          });
        } else {
          v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    keepOut () {
      this.setOut(1);
    },
    goCancel () {
      this.$router.push('cancelPackage');
    },
    markOutboundHasCondition () {
      let v = this;
      v.scanModel.title = '标出库（所有结果集）';
      v.scanModel.content = '所有结果集标出库，系统将符合您当前查询条件的所有包裹标记为已出库。';
      v.MarkOutbound('all');
    },
    markOutOfStock () {
      let v = this;
      if (v.packageIds.length < 1) {
        v.$Message.error('请选择包裹');
        return false;
      }
      v.stockModel.status = true;
      v.axios.post(api.get_packageProductList, JSON.stringify(v.packageIds)).then(response => {
        if (response.data.code === 0) {
          v.selectProductData = response.data.datas;
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
    getSelectValue1 (value) {
      let v = this;
      let pos = [];
      Promise.resolve(value.forEach((n, i) => {
        pos.push({
          packageGoodsId: n.packageGoodsId
        });
      })).then(() => {
        v.stockoutArr = pos;
      });
    },
    gotoScanEx () {
      this.$router.push('/scanEx');
    },
    setStockoutIt () {
      let v = this;
      if (v.stockoutArr.length === 0) {
        v.$Message.error('请选择标记的订单');
        v.resetStockOutStatus();
        return false;
      }
      let obj = {
        packageIds: v.packageIds,
        markPackageGoodsMissingDetailBos: v.stockoutArr
      };
      v.axios.put(api.set_markPackageGoodsMissing, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.resetStockOutStatus();
          v.pageParamsStatus = true;
          v.stockModel.status = false;
        } else {
          v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    resetStockOutStatus () {
      let v = this;
      v.setStockoutLoading = false;
      v.$nextTick(function () {
        v.setStockoutLoading = true;
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
