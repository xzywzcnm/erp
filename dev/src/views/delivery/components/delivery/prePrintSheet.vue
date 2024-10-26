<style scoped>
.demo-tabs-style1 > .ivu-tabs-card > .ivu-tabs-content {
  height: 120px;
}

.demo-tabs-style1 > .ivu-tabs-card > .ivu-tabs-content > .ivu-tabs-tabpane {
  background: #fff;
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
      <Col
        :span="6" class="demo-tabs-style1">
        <Tabs type="card">
          <TabPane label="精确">
            <Row>
              <Col
                :span="22" offset="1" class="normalTop">
                <Input
                  v-model.trim="value6" type="textarea" :rows="4" placeholder="输入包裹号或者运单号，多个换行"></Input>
              </Col>
            </Row>
            <Button
              type="primary" size="small" class="fr confirmSearch" @click="searchSheet">查询 </Button>
          </TabPane>
          <TabPane
            label="打印批次" style="min-height:600px">
            <Form
              :lable-width="70" class="confirmSearch">
              <FormItem label="打印日期">
                <Date-picker
                  transfer
                  type="date"
                  @on-clear="resetDate"
                  @on-change="getDateValue"
                  :clearable="clearAble"
                  format="yyyy-MM-dd"
                  placeholder="选择日期"
                  :value="payTimeArr"></Date-picker>
              </FormItem>
            </Form>
            <keep-alive>
              <Table
                highlight-row
                border
                :loading="loading"
                class="confirmSearch"
                @on-row-click="getSelectValue1"
                :columns="printColumn"
                :data="printData"></Table>
            </keep-alive>
          </TabPane>
        </Tabs>
      </Col>
      <Col
        :span="17" offset="1">
        <div>
          <Button
            type="primary" icon="printer" size="small" @click="print">打印面单 </Button>
        </div>
        <keep-alive>
          <Table
            highlight-row
            class="normalTop"
            border
            :loading="loading2"
            :columns="printExColumn"
            :data="printExData"
            @on-selection-change="getSelectValue"></Table>
        </keep-alive>
        <div class="table-page">
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
              :page-size-opts="pageArray"></Page>
          </div>
        </div>
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
import Qs from 'qs';

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
      loading: false,
      loading2: false,
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
        pageSize: 10
      },
      packageIds: [],
      printColumn: [
        {
          title: '打印时间',
          key: 'printedTime',
          align: 'center',
          render: (h, params) => {
            return h('span', self.getDataToLocalTime(params.row.printedTime, 'fulltime'));
          }
        }, {
          title: '包裹数量',
          align: 'center',
          key: 'packageQuantity'
        }, {
          title: '首包裹号/物流方式',
          key: 'packageNumAndShippingMethod',
          align: 'center',
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
          width: 60,
          align: 'center',
          key: 'index'
        }, {
          title: '包裹号',
          width: 120,
          align: 'center',
          key: 'packageCode'
        }, {
          title: '买家ID/姓名',
          key: 'buyer',
          align: 'center',
          width: 120,
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
          width: 120,
          align: 'center',
          key: 'buyerCountryCode'
        }, {
          title: '物流方式',
          width: null,
          align: 'center',
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
          width: 120,
          align: 'center',
          key: 'trackingNumber'
        }, {
          title: '打印时间',
          width: 140,
          align: 'center',
          key: 'printTime',
          render: (h, params) => {
            return h('span', self.getDataToLocalTime(params.row.printTime, 'fulltime'));
          }
        }, {
          title: '操作',
          key: 'operation',
          fixed: 'right',
          align: 'center',
          width: 140,
          render: (h, params) => {
            return h('Button', {
              on: {
                click: () => {
                  self.expressSheet(params.row.packageId);
                }
              }
            }, '打印面单');
          }
        }
      ],
      num: 5,
      minWidth: 140,
      objName: 'printExColumn',
      printExData: [],
      ppbParams: {
        printTime: null
      }
    };
  },
  mounted () {
    this.pw(this.num, 'printExColumn');
  },
  methods: {
    getList () {
      let v = this;
      v.axios.post(api.get_packagePrintBatchInfo, JSON.stringify(v.ppbParams)).then(response => {
        if (response.data.code === 0) {
          if (response.data.datas !== null && response.data.datas.length > 0) {
            v.printData = response.data.datas;
          } else {
            v.printData = [];
          }
        }
      });
    },
    getDateValue (value) { // 获取日期返回值
      let v = this;
      if (value.length === 0 || value === '') {
        v.resetDate();
      } else {
        v.ppbParams.printTime = v.getUniversalTime(value + '00:00:00', 'fulltime');
        v.getList();
      }
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
      v.packagePrintBatchId = value.packagePrintBatchId;
      v.getAfreshPrintList([value.packagePrintBatchId]);
    },
    resetDate () {
      let v = this;
      v.pageParams.printTime = null;
    },
    getAfreshPrintList (arr) {
      let v = this;
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
            v.startPrint(jsonObj, n.packageId);
            return true;
          });
        }
      });
    },
    startPrint (jsonObj, postId) {
      let v = this;
      let instance = v.axios.create({
        timeout: 3000,
        headers: {
          'Content-Type': 'multipart/form-data; charset=UTF-8'
        }
      });
      delete v.axios.defaults.headers.post['X-Requested-With'];
      instance.post('http://localhost:10099/print', Qs.stringify(jsonObj)).then(response => {
        if (response.status === 200) {
          v.$Message.success('包裹号：' + postId + '操作成功');
        }
      }).catch(() => {
        v.getPrintExeUrl().then(data => {
          if (data) {
            v.$Modal.info({
              width: 400,
              content: `请下载打印控件<a href=${data}>点击下载</a>`
            });
          } else {
            return new Error('未获取到打印控件');
          }
        });
      });
    },
    searchSheet () {
      let v = this;
      let searchValue = v.value6.toString().replace(/(\r)*\n/g, ',').replace(/\s/g, ' ').split(',');
      v.getAfreshPrintList(searchValue);
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
            v.startPrint(jsonObj, n.packageId);
            return true;
          });
        }
      });
    }
  }
};
</script>
