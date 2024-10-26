<style scoped>
.demo-tabs-style1 > .ivu-tabs-card > .ivu-tabs-content {
  height: 120px;
}

.demo-tabs-style1 > .ivu-tabs-card > .ivu-tabs-content > .ivu-tabs-tabpane {
  background: #fff;
}

.demo-tabs-style1 > .ivu-tabs.ivu-tabs-card > .ivu-tabs-bar {
  margin-bottom: 0;
}

.demo-tabs-style1 > .ivu-tabs.ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab {
  border-color: transparent;
}

.demo-tabs-style1 > .ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab-active {
  border-color: #fff;
}

.demo-tabs-style1 .ivu-tabs-tabpane {
  border-left: 1px solid #e1e1e1;
  border-right: 1px solid #e1e1e1;
  border-bottom: 1px solid #e1e1e1;
}

.confirmSearch {
  margin: 10px;
}
</style>
<template>
  <div class="commonFilter">
    <Row>
      <Col :span="6" class="demo-tabs-style1">
        <Tabs type="card">
          <TabPane label="精确">
            <Row>
              <Col :span="22" offset="1" class="normalTop">
                <Input
                  v-model.trim="value6" type="textarea" :rows="4" placeholder="输入包裹号或者运单号，多个换行"></Input>
              </Col>
            </Row>
            <Button
              type="primary"
              size="small"
              class="fr confirmSearch"
              @click="searchSheet"
              :disabled="!getPermission('packageInfo_queryForAfreshPrint')">查询</Button>
          </TabPane>
          <TabPane label="打印批次" style="min-height:600px">
            <Form :lable-width="70" class="confirmSearch">
              <FormItem label="打印日期" v-if="getPermission('packagePrintBatchInfo_query')">
                <Date-picker
                  type="date"
                  transfer
                  @on-clear="resetDate"
                  @on-change="getDateValue"
                  :clearable="clearAble"
                  format="yyyy-MM-dd"
                  placeholder="选择日期"
                  :value="payTimeArr"></Date-picker>
              </FormItem>
            </Form>
            <Table
              highlight-row
              border
              :loading="TableLoading"
              class="confirmSearch"
              @on-row-click="getSelectValue1"
              :columns="printColumn"
              :data="printData"></Table>
          </TabPane>
        </Tabs>
      </Col>
      <Col :span="17" offset="1">
        <div>
          <Button
            :disabled="!getPermission('packageInfo_rePrintExpressBill')"
            type="primary"
            icon="md-print"
            size="small"
            @click="print">打印面单</Button>
          <Button
            type="primary"
            size="small"
            v-if="getPermission('packageInfo_loadPickingOrderPdf')"
            style="margin-left: 5px;"
            @click="downloadPDFMt">下载PDF</Button>
          <Button
            type="primary"
            size="small"
            v-if="getPermission('packageInfo_queryDistribution')"
            style="margin-left: 5px;"
            @click="printDistribution">打印配货清单</Button>
        </div>
        <Table
          highlight-row
          class="normalTop"
          border
          :loading="TableLoading"
          :columns="printExColumn"
          :data="printExData"
          @on-selection-change="getSelectValue"></Table>
        <!-- <div class="table-page">
           <div class="table-page-right">
             <Page
               :total="total"
               @on-change="changePage"
               show-total
               :page-size="pageParams.pageSize"
               show-elevator
               :current="curPage"
               show-sizer
               @on-page-size-change="changePageSize"
               placement="top"
               :page-size-opts="pageArray"
             >
             </Page>
           </div>
         </div>-->
      </Col>
    </Row>
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
  data () {
    var self = this;
    return {
      packagePrintBatchId: null,
      postId: null,
      pdf: null,
      value6: '',
      clearAble: true,
      resetStatus: true,
      payTimeArr: '',
      total: 0,
      curPage: 1,
      pageParams: {
        getLabelStatus: 0,
        maxPayTime: null,
        merchantCarrierId: null,
        merchantShippingMethodId: null,
        minPayTime: null,
        packageCode: null,
        packageIds: [],
        packageStatus: 0,
        packageType: 0,
        printOrderBy: 0,
        pageNum: 1,
        pageSize: 50
      },
      packageIds: [],
      checkDate: [],
      printColumn: [
        {
          title: '打印时间',
          key: 'printedTime',
          width: 150,
          align: 'center',
          render: (h, params) => {
            return h('span', self.$uDate.getDataToLocalTime(params.row.printedTime, 'fulltime'));
          }
        }, {
          title: '包裹数量',
          align: 'center',
          key: 'packageQuantity'
        }, {
          title: '首出库单号/物流方式',
          align: 'center',
          key: 'packageNumAndShippingMethod',
          render: (h, params) => {
            return h('div', [
              h('div', {
                style: {
                  color: '#0054A6'
                }
              }, params.row.firstPackageCode), h('div', {
                style: {
                  color: '#ff3300'
                }
              }, params.row.firstShippingMethodId)
            ]);
          }
        }
      ],
      printData: [],
      printExColumn: [
        {
          type: 'selection',
          width: 60,
          fixed: 'left',
          align: 'center'
        }, {
          title: 'NO',
          minWidth: 60,
          align: 'center',
          key: 'index'
        }, {
          title: '出库单号',
          minWidth: 120,
          align: 'center',
          key: 'packageCode'
        }, {
          title: '买家ID/姓名',
          key: 'buyer',
          minWidth: 120,
          align: 'center',
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
          minWidth: 120,
          key: 'buyerCountryCode'
        }, {
          title: '物流方式',
          align: 'center',
          minWidth: 120,
          key: 'merchantShippingMethodId',
          render: (h, params) => {
            if (params.row.carrierName === null || params.row.carrierName === '') {
              return '';
            } else {
              return h('div', params.row.carrierName + ' > ' + params.row.carrierShippingMethodName);
            }
          }
        }, {
          title: '运单号',
          align: 'center',
          minWidth: 120,
          key: 'trackingNumber'
        }, {
          title: '打印时间',
          align: 'center',
          minWidth: 150,
          key: 'printTime',
          render: (h, params) => {
            return h('span', self.$uDate.getDataToLocalTime(params.row.printTime, 'fulltime'));
          }
        }, {
          title: '操作',
          key: 'operation',
          align: 'center',
          fixed: 'right',
          width: 200,
          render: (h, params) => {
            return h('div', {}, [
              h('Button', {
                props: {
                  disabled: !self.getPermission('packageInfo_rePrintExpressBill'),
                  size: 'small'
                },
                on: {
                  click: () => {
                    self.expressSheet(params.row.packageId);
                  }
                }
              }, '打印面单'), h('Button', {
                style: {
                  marginLeft: '5px'
                },
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    self.downloadPDFApi({
                      packageIds: [params.row.packageId],
                      packagePrintBatchId: null
                    });
                  }
                }
              }, '下载PDF')
            ]);
          }
        }
      ],
      num: 5,
      minWidth: 140,
      objName: 'printExColumn',
      printExData: [],
      ppbParams: {
        printTime: null,
        warehouseId: self.getWarehouseId()
      }
    };
  },
  mounted () {
    this.pw(this.num, 'printExColumn');
  },
  created () {
    this.ifPermission();
  },
  methods: {
    downloadPDFMt () {
      // 打印pfd
      let v = this;
      if (v.packageIds.length > 0) {
        let params = {
          packageIds: v.packageIds,
          packagePrintBatchId: null
        };
        v.downloadPDFApi(params);
      } else {
        v.$Message.error('未选择');
      }
    },
    printDistribution () {
      let v = this;
      if (v.checkDate.length === 0) {
        v.$Message.error('无数据');
        return;
      }
      let codes = v.checkDate.map(i => i.packageCode).join(',');
      this.$router.push({
        path: '/printDistributionList',
        query: {
          packageCode: codes,
          warehouseId: this.getWarehouseId()
        }
      });
    },
    downloadPDFApi (params) {
      let v = this;
      v.axios.post(api.down_loadPickingOrderPdf, params).then(response => {
        if (response.data.code === 0) {
          let newTab = window.open('about:blank');
          newTab.location.href = v.$store.state.erpConfig.filenodeViewTargetUrl + response.data.datas;
        }
      }).catch(() => {
      });
    },
    ifPermission () {
      let v = this;
      if (!v.getPermission('packageInfo_queryForAfreshPrint')) {
        v.gotoError();
      }
    },
    getList () {
      let v = this;
      v.TableLoading = true;
      v.axios.post(api.get_packagePrintBatchInfo, JSON.stringify(v.ppbParams)).then(response => {
        v.TableLoading = false;
        if (response.data.code === 0) {
          if (response.data.datas !== null && response.data.datas.length > 0) {
            v.printData = response.data.datas;
          } else {
            v.printData = [];
          }
        }
      });
    },
    getDateValue (value) {
      // 获取日期返回值
      let v = this;
      if (value.length === 0 || !value) {
        v.resetDate();
      } else {
        v.ppbParams.printTime = v.$uDate.getUniversalTime(value + ' 00:00:00', 'fulltime');
        v.getList();
      }
    },
    getSelectValue (value) {
      // table获取所选值
      let v = this;
      let pos = [];
      if (value) {
        this.checkDate = value;
        value.forEach((n, i) => {
          pos.push(n.packageId);
        });
        v.packageIds = pos;
      }
    },
    getSelectValue1 (value) {
      let v = this;
      v.packagePrintBatchId = value.packagePrintBatchId;
      let obj = {
        warehouseId: v.getWarehouseId(),
        codes: [value.packagePrintBatchId]
      };
      v.getAfreshPrintList(obj);
    },
    resetDate () {
      let v = this;
      v.pageParams.printTime = null;
    },
    getAfreshPrintList (arr) {
      let v = this;
      v.TableLoading = true;
      v.axios.post(api.get_queryForAfreshPrint, arr).then(response => {
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
              v.printExData = data;
              v.$nextTick(function () {
                v.total = Number(response.data.datas.total);
                v.totalPage = Number(response.data.datas.pages);
                v.loadingFalse();
              });
            });
          } else {
            v.printExData = [];
            v.$nextTick(function () {
              v.total = 0;
              v.totalPage = 0;
              v.loadingFalse();
            });
          }
        }
      });
    },
    print () {
      let v = this;
      if (v.packageIds.length < 1) {
        v.$Message.error('请选择订单');
        return false;
      }
      let obj = {
        packageIds: v.packageIds,
        packagePrintBatchId: v.packagePrintBatchId
      };
      v.axios.post(api.set_rePrintExpressBill, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          data.every((n, i) => {
            let jsonObj = {
              pdf: n.labelPath,
              postId: n.packageId
            };
            v.startPrint(jsonObj, n.packageCode);
            return true;
          });
        }
      });
    },
    searchSheet () {
      let v = this;
      // let searchValue = v.value6.toString().replace(/(\r)*\n/g, ',').replace(/\s/g, ' ').split(',');
      let obj = {
        warehouseId: v.getWarehouseId(),
        codes: v.value6.toString().replace(/(\r)*\n/g, ',').replace(/\s/g, ' ').split(',')
      };
      v.getAfreshPrintList(obj);
    },
    expressSheet (packageId) {
      let v = this;
      let obj = {
        packageIds: [packageId],
        packagePrintBatchId: v.packagePrintBatchId
      };
      v.axios.post(api.set_rePrintExpressBill, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          data.every((n, i) => {
            let jsonObj = {
              pdf: n.labelPath,
              postId: n.packageId
            };
            v.startPrint(jsonObj, n.packageCode);
            return true;
          });
        }
      });
    }
  }
};
</script>
