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
    <div v-if="workShow === 'list'">
      <div class="commonFilter">
        <div class="card-container">
          <div class="card-content">
            <div class="goToScanEx">
              <Button type="primary" @click="gotoScanEx" icon="md-swap"
                v-if="getPermission('packageInfo_markPackageDelivery')">切换为扫描出库 </Button>
            </div>
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <dyt-filter class="platformParamsSelect">
                <FormItem label="物流方式">
                  <Cascader transfer v-model="shippingMethodModel" :load-data="loadData" @on-change="changeShippingMethod"
                    :data="shippingMethodData" filterable change-on-select></Cascader>
                </FormItem>
                <Form-item label="打印时间">
                  <div style="display:flex;">
                    <Date-picker style="flex: 100;" type="date" @on-clear="resetDate" @on-change="getDateValue"
                      :clearable="clearAble" transfer format="yyyy-MM-dd HH:mm:ss" placement="bottom-end"
                      placeholder="选择日期" :value="printTimeArr" />
                    <span style="width: 30px;text-align: right;">之前</span>
                  </div>
                </Form-item>
                <Form-item label="国家/地区" prop="buyerCountryCodeList">
                  <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" multiple
                    placeholder="请选择或输入所在地" :max-tag-count="1">
                    <Option v-for="(item, index) in formValidate.country" :key="index" :value="item.twoCode"
                      :label="item.enName"></Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="拣货单号" prop="pickingGoodsNo">
                  <dyt-input placeholder="请输入拣货单号" v-model.trim="pageParams.pickingGoodsNo"></dyt-input>
                </Form-item>
                <Form-item label="运单号" prop="trackingNumber">
                  <dyt-input-tag type="textarea" :limit="1" :string="true" placeholder="请输入运单号，多个运单号用逗号或回车隔开"
                    v-model="pageParams.trackingNumber"></dyt-input-tag>
                </Form-item>
                <Form-item label="出库单号" prop="packageCode">
                  <dyt-input placeholder="请输入出库单号" v-model.trim="pageParams.packageCode"></dyt-input>
                </Form-item>
                <Form-item label="订单号" prop="orderNo">
                  <dyt-input placeholder="请输入订单号" v-model.trim="pageParams.orderNo"></dyt-input>
                </Form-item>
                <Form-item label="买家姓名" prop="buyerName">
                  <dyt-input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></dyt-input>
                </Form-item>
                <Form-item label="买家ID" prop="buyerAccountId">
                  <dyt-input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></dyt-input>
                </Form-item>
                <Form-item label="搜索字符" prop="searchValue">
                  <dyt-input placeholder="可输入订单号、出库单号、买家ID、买家姓名、SKU" v-model.trim="pageParams.searchValue"></dyt-input>
                </Form-item>
                <Form-item label="SKU" prop="webstoreSku">
                  <dyt-input-tag :limit="1" :string="true" placeholder="多个SKU，用逗号或换行分隔" type="textarea"
                    v-model.trim="pageParams.webstoreSku"></dyt-input-tag>
                </Form-item>
                <Form-item label="是否有运单号" prop="buyerName">
                  <local-buttons :data="tabsData" :value.sync="pageParams.hasTrackingNumber"></local-buttons>
                </Form-item>
                <Form-item label="是否有物流商号" prop="buyerName">
                  <local-buttons :data="tabsData" :value.sync="pageParams.hasThirdPartyNo"></local-buttons>
                </Form-item>
                <Form-item label="是否有物流商重量" prop="buyerName">
                  <local-buttons :data="tabsData" :value.sync="pageParams.hasCarrierWeight"></local-buttons>
                </Form-item>
                <Form-item label="是否有物流商运费">
                  <local-buttons :data="tabsData" :value.sync="pageParams.hasPostage"></local-buttons>
                </Form-item>
                <div slot="operation">
                  <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询</Button>
                  <Button style="margin-left: 10px;" @click="reset" v-once icon="md-refresh">重置 </Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
      <div class="plr10">
        <div class="clear sort-box">
          <div class="fr">
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch"
              :sorType="{ DESC: 'down', ASC: 'up' }">
            </dyt-sortBySelect>
          </div>
          <div class="tableControl fl">
            <Buttons type="primary" transfer style="margin-left: 10px" trigger="click"
              @on-click="markOutboundHasCondition">
              <Button type="primary" class="iconbuttons" @click="MarkOutbound('moreSelect')" :disabled="!getPermission('packageInfo_batchMarkPackageDelivery_batch')
                ">
                <Icon type="md-exit"></Icon>
                标出库
              </Button>
              <Buttons-menu slot="list">
                <Buttons-item name="1" v-if="getPermission('packageInfo_batchMarkPackageDelivery_all')">标出库（所有结果集）
                </Buttons-item>
              </Buttons-menu>
            </Buttons>
          </div>
        </div>
      </div>
      <div class="orderTable normalTop">
        <Table highlight-row border :loading="TableLoading" :height="tableHeight" :columns="orderColumn" :data="printData"
          @on-selection-change="getSelectValue"></Table>
        <div class="table-page">
          <div class="table-page-right">
            <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
              :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top"
              :page-size-opts="pageArray"></Page>
          </div>
        </div>
      </div>
      <Modal v-model="scanModel.status" @on-ok="setOut">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">
              {{ scanModel.title }}
            </div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              <Row>
                <Col :span="1">
                <Icon type="md-information-circle" color="#2b85e4" style="font-size:36px"></Icon>
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
      <Modal v-model="stockModel.status" :loading="setStockoutLoading" @on-ok="setStockoutIt" width="600">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">
              标记缺货
            </div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              <Row>
                <Col :span="1">
                <Icon type="md-information-circle" color="#2b85e4" style="font-size:36px"></Icon>
                </Col>
                <Col :span="21" :offset="2">
                <p>
                  以下SKU列表是所选包裹中所包含的SKU的汇总，请选择缺货的SKU，标记缺货后，系统将自动将包裹还原到缺货状态，并还原所选SKU的库存，同时建立所选SKU的盘点单，请进行盘点修正库存。 </p>
                </Col>
              </Row>
            </div>
            <div class="normalTop">
              <Table highlight-row border :columns="selectProductColumn" :loading="TableLoading" :data="selectProductData"
                size="small" @on-selection-change="getSelectValue1"></Table>
            </div>
          </div>
        </div>
      </Modal>
    </div>
    <div v-if="workShow === 'detail'">
      <sellStockOutDtl :workShow="workShow" :pickingNo="packageCode" workType="sellStock"></sellStockOutDtl>
    </div>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import packageDetails from './packageDetails';
import tableMixin from '@/components/mixin/table_mixin';
import deliveryMixin from '@/components/mixin/delivery_mixin';
import publicService from '@/components/mixin/publicService_mixin';
import sellStockOutDtl from './sellStockOutDtl';
import compoundBtn from '@/views/wms/components/common/compoundBtn';

export default {
  mixins: [Mixin, tableMixin, deliveryMixin, publicService],
  components: {
    compoundBtn,
    packageDetails,
    sellStockOutDtl
  },
  data() {
    var self = this;
    return {
      // 标发货提示参数
      tabsData: [
        {
          label: '全部',
          value: '-1'
        }, {
          label: '有',
          value: '1'
        }, {
          label: '无',
          value: '0'
        }
      ],
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
          render: (h, params) => {
            return this.tableImg(h, params, 'pictureUrl');
          }
        }, {
          key: 'sku',
          width: 120,
          title: 'sku'
        }, {
          key: 'title',
          title: '中文描述'
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
      sortButtonList: [
        {
          sortHeader: "按打印时间",
          sortField: "printTime",
          sortType: "up",
          default: true,
        },
        {
          sortHeader: "按付款时间",
          sortField: "payTime",
          sortType: "up",
        },
        {
          sortHeader: "按出库单号",
          sortField: "packageCode",
          sortType: "up",
        },
      ],
      pageParamsPrototype: null, // 重置查询条件
      pageParams: {
        pageNum: 1,
        pageSize: 50,
        status: 0,
        hasTrackingNumber: '-1',
        hasThirdPartyNo: '-1',
        hasCarrierWeight: '-1',
        hasPostage: '-1',
        webstoreSku: null,
        getLabelStatus: null,
        platFormId: null,
        saleAccountIds: [],
        buyerCountryCodeList: [],
        packageCode: null,
        trackingNumber: null,
        searchValue: null, // 搜索内容
        pickingGoodsNo: null, // 拣货单号
        warehouseId: self.getWarehouseId(),
        orderBy: 'printTime',
        upDown: 'up',
      },
      options2: {
        shortcuts: [
          {
            text: '近一周',
            value: function () {
              let end = new Date();
              let start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              return [start, end];
            }
          }, {
            text: '近一个月',
            value: function () {
              let end = new Date();
              let start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              return [start, end];
            }
          }, {
            text: '近三个月',
            value: function () {
              let end = new Date();
              let start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              return [start, end];
            }
          }
        ]
      },
      platformArr: [],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
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
          width: 60
        }, {
          title: '出库单号',
          key: 'packageCode',
          fixed: 'left',
          align: 'center',
          width: 140,
          render: (h, params) => {
            if (this.getPermission('wmsPicking_querySalesPickingDetail')) {
              return h('span', {
                class: 'blueColor cursor underline',
                on: {
                  click: () => {
                    // self.showPackageDetails(params.row.packageId);
                    self.showPackageDetails(params.row.packageCode, 'detail');
                  }
                }
              }, params.row.packageCode);
            } else {
              return h('div', params.row.packageCode);
            }
          }
        }, {
          title: '拣货单号',
          key: 'pickingGoodsNo',
          width: 160,
          align: 'center'
        }, {
          title: '订单号',
          key: 'salesRecordNumber',
          align: 'center',
          width: 140,
          render: (h, params) => {
            let pos = [];
            if (params.row.packageOrderBoList !== null) {
              for (let i = 0; i < params.row.packageOrderBoList.length; i++) {
                var n = params.row.packageOrderBoList[i];
                // pos.push(
                //   h('div', params.row.accountCode + '-' + n.salesRecordNumber)
                // );
                if (n.accountCode) {
                  pos.push(h('div', n.accountCode + '-' + n.salesRecordNumber));
                } else {
                  pos.push(h('div', n.salesRecordNumber));
                }
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
          align: 'center',
          key: 'buyerCountryCode',
          width: 100
        }, {
          title: '物流方式',
          align: 'center',
          key: 'carrierShippingMethodName',
          width: 200
        }, {
          title: '运单号',
          align: 'center',
          key: 'trackingNumber',
          width: 180,
          render(h, params) {
            return h('div', [h('p', params.row.trackingNumber), h('p', params.row.virtualTrackingNumber)]);
          }
        }, {
          title: 'SKU数量',
          align: 'center',
          key: 'skuQuantity',
          width: 100
        }, {
          title: '物品数量',
          align: 'center',
          key: 'productQuantity',
          width: 120
        }, {
          title: '付款时间',
          align: 'center',
          width: 160,
          key: 'payTime',
          render: (h, params) => {
            return self.$uDate.getDataToLocalTime(params.row.payTime, 'fulltime');
          }
        }, {
          title: '操作',
          key: 'operate',
          align: 'center',
          width: 120,
          fixed: 'right',
          render: (h, params) => {
            if (params.row !== undefined) {
              return h(compoundBtn, {
                props: {
                  dropList: [
                    {
                      label: '查看出库单详情',
                      value: '1',
                      flagCode: ['1'],
                      status: self.getPermission('wmsPicking_querySalesPickingDetail') ? '1' : -1
                    }
                  ],
                  title: '标出库',
                  listenNormal: false,
                  btnType: '',
                  icon: '',
                  disabled: !self.getPermission('packageInfo_markPackageDelivery')
                },
                on: {
                  click: val => {
                    if (!val) {
                      // 标出库
                      self.MarkOutbound('single', params.row.packageId, params.row.deliveryBatchNo);
                    } else {
                      if (val === '1') {
                        self.showPackageDetails(params.row.packageCode, 'detail');
                      }
                    }
                  }
                }
              }, []);
            }
          }
        }
      ],
      workShow: 'list',
      packageCode: '',
      localeUrl: window.location.origin
        ? window.location.origin
        : window.location.protocol + '//' + window.location.hostname + (window.location.port
          ? ':' + window.location.port
          : '') // 兼容性写法
    };
  },
  activated() {
    this.startLoading();
  },
  watch: {
    pageParamsStatus(n) {
      var v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    }
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(305);
    }
  },
  methods: {
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.upDown = type;
      this.pageParams.orderBy = feild;
      this.search();
    },
    startLoading() {
      var v = this;
      v.$Loading.start();
      Promise.resolve(v.getPermission('packageInfo_queryForOutWarehouse')
        ? v.getList()
        : v.gotoError()).then(function () {
          v.$Loading.finish();
          v.getShopList();
        });
    },
    getList() {
      let v = this;
      v.pageParams.pageSize = this.getPageSizeCache();
      v.TableLoading = true;
      v.SearchDisabled = true;
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
            // const getSalesAccountData = new Promise((resolve, reject) => {
            //   v.axios.post(api.get_saleAccountById + '?saleAccountIds=' + saleAccountIdPos)
            //     .then(response => {
            //       if (response.data.code === 0) {
            //         var list = response.data.datas;
            //         for (var i = 0; i < list.length; i++) {
            //           for (var t = 0; t < data.length; t++) {
            //             if (data[t].saleAccountId === list[i].saleAccountId) {
            //               data[t].accountCode = list[i].accountCode;
            //             }
            //           }
            //         }
            //         resolve(true);
            //       } else {
            //         resolve(false);
            //       }
            //     });
            // });
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
              });
            });
            Promise.all([getAllShippingMethods]).then(result => {
              if (result[0]) {
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
            }).catch(error => {
              console.log(error);
            });
          } else {
            v.printData = [];
            v.$nextTick(function () {
              v.total = 0;
              v.totalPage = 0;
            });
          }
          v.SearchDisabled = false;
          v.TableLoading = false;
        }
      });
    },
    selectPackagePaper(index, status) {
      let v = this;
      if (index === 0) {
        delete v.pageParams.status;
      } else if (index === 1) {
        v.pageParams.status = '1';
      } else {
        v.pageParams.status = '0';
      }
      v.pageParamsStatus = true; // 更新数据
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
    selectPackageSize(index, status) {
      let v = this;
      if (index === 0) {
        delete v.pageParams.status;
      } else if (index === 1) {
        v.pageParams.status = '1';
      } else {
        v.pageParams.status = '0';
      }
      v.pageParamsStatus = true; // 更新数据
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
    reset() {
      let v = this;
      v.printTimeArr = null;
      v.resetDate();
      v.shippingMethodModel = [];
      v.$refs['pageParams'].resetFields();
      v.pageParams.hasTrackingNumber = '-1';
      v.pageParams.hasThirdPartyNo = '-1';
      v.pageParams.hasCarrierWeight = '-1';
      v.pageParams.webstoreSku = null;
      v.pageParams.hasPostage = '-1';
      v.pageParams.merchantCarrierId = null;
      v.pageParams.merchantShippingMethodId = null;
    },
    search() {
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    changeShippingMethod(value, data) {
      let v = this;
      if (value.length === 0) {
        v.pageParams.merchantCarrierId = null;
        v.pageParams.merchantShippingMethodId = null;
      } else if (value.length === 1) {
        v.pageParams.merchantCarrierId = value[0];
        v.pageParams.merchantShippingMethodId = null;
      } else if (value.length === 2) {
        v.pageParams.merchantCarrierId = value[0];
        v.pageParams.merchantShippingMethodId = value[1][0];
      }
    },
    resetDate() {
      let v = this;
      v.pageParams.printEndTime = '';
    },
    getDateValue(value) {
      // 获取日期返回值
      let v = this;
      if (!value) {
        v.resetDate();
      } else {
        v.pageParams.printEndTime = v.$uDate.getUniversalTime(new Date(value).getTime(), 'fulltime');
      }
    },
    MarkOutbound(type, pid, batchNo) {
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
    setOut(flag) {
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
          deliveryBatchNo: v.scanModel.batchNo,
          warehouseId: v.getWarehouseId()
        };
        url = api.set_markPackageDelivery;
      }
      /* if (flag) {
       obj.flag = 1;
       } else {
       obj.flag = null;
       } */
      v.axios.put(url, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        }
      });
    },
    keepOut() {
      this.setOut(1);
    },
    goCancel() {
      this.$router.push({ path: 'cancelPackage', query: { warehouseId: this.getWarehouseId() } });
    },
    markOutboundHasCondition() {
      let v = this;
      v.scanModel.title = '标出库（所有结果集）';
      v.scanModel.content = '所有结果集标出库，系统将符合您当前查询条件的所有包裹标记为已出库。';
      v.MarkOutbound('all');
    },
    markOutOfStock() {
      let v = this;
      if (v.packageIds.length < 1) {
        v.$Message.error('请选择包裹');
        return false;
      }
      v.stockModel.status = true;
      v.TableLoading = true;
      v.axios.post(api.get_packageProductList, JSON.stringify(v.packageIds)).then(response => {
        v.TableLoading = false;
        if (response.data.code === 0) {
          v.selectProductData = response.data.datas;
        }
      });
    },
    getSelectValue(value) {
      // table获取所选值
      let v = this;
      let pos = [];
      Promise.resolve(value.forEach((n, i) => {
        pos.push(n.packageId);
      })).then(() => {
        v.packageIds = pos;
      });
    },
    getSelectValue1(value) {
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
    gotoScanEx() {
      this.$router.push({ path: '/scanEx', query: { warehouseId: this.getWarehouseId() } });
    },
    setStockoutIt() {
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
        }
      });
    },
    resetStockOutStatus() {
      let v = this;
      v.setStockoutLoading = false;
      v.$nextTick(function () {
        v.setStockoutLoading = true;
      });
    }, // showPackageDetails (pid) {
    //   let v = this;
    //   v.packageId = pid;
    //   v.packageDetailsStatus = true;
    //   let date = new Date().getTime();
    //   v.$nextTick(function () {
    //     v.packageModel = true;
    //     v.timestamp = date;
    //   });
    // },
    showPackageDetails(packageCode, detail) {
      this.packageCode = packageCode;
      this.workShow = detail;
    }
  },
  created() {
    let v = this;
    v.startLoading();
    v.showShippingData(true); // 查询物流方式下拉数据
    // this.getPlatform(); // 查询所有可用平台
    v.pageParamsPrototype = v.deepCopy(v.pageParams);
  },
  mounted() {
    let v = this;
    setTimeout(v.getCountrys(), 2000); // 获取国家区域列表
  }
};
</script>
