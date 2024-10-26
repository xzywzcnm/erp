<template>
  <div class="logisticsTrackingInquiry listPage">
    <!--头部筛选区域-->
    <div class="searchMain">
      <Form ref="pageParams" :model="pageParams" :label-width="110" label-position="right">
        <dyt-filter ref="dyt-filter">
          <Form-item label="付款时间">
            <Date-picker style="width: 100%;" type="daterange" @on-clear="resetAddDate" transfer
              @on-change="getAddDateValue" :clearable="true" :options="dateOptions" format="yyyy-MM-dd"
              placement="bottom-end" placeholder="请选择日期" :value="pageParams.paymentTime" />
          </Form-item>
          <Form-item label="承运商 / 物流方式">
            <erpTreeSelect :load-options="loadTreeOptions" style="width:100%" v-model="shippingTreeSelectVal"
              :multiple="false" :disable-branch-nodes="true" :normalizer="treeNormalizer" :options="shippingTreeData"
              :append-to-body="true" :default-expand-level="0" placeholder="承运商 / 物流方式" noResultsText="无匹配数据"
              retryText="重试？" retryTitle="重试" zIndex="99999999999">
              <div slot="value-label" slot-scope="{node}"
                :title="`${shippingTreeJson[shippingTreeSelectVal].parentCarrierName} / ${node.label || ''}`">
                {{ `${shippingTreeJson[shippingTreeSelectVal].parentCarrierName} / ${node.label || ''}` }}
              </div>
            </erpTreeSelect>
          </Form-item>
          <Form-item label="状态">
            <dyt-select v-model="pageParams.trackingStatusList" :multiple="true">
              <Option v-for="(item, index) in statusList" :value="item.value" :key="`${index}_${item.value}`">{{
                  item.label
              }}</Option>
            </dyt-select>
          </Form-item>
          <Form-item label="订单号">
            <dyt-input-tag :limit="1" v-model="pageParams.orderNumberList" type="textarea"
              placeholder="输入订单号, 多个用逗号或回车隔开" />
          </Form-item>
          <Form-item label="出库单号">
            <dyt-input-tag :limit="1" v-model="pageParams.packageCodeList" type="textarea"
              placeholder="输入出库单号, 多个用逗号或回车隔开" />
          </Form-item>
          <Form-item label="运单号">
            <dyt-input-tag :limit="1" v-model="pageParams.trackingNumberList" type="textarea"
              placeholder="输入运单号, 多个用逗号或回车隔开" />
          </Form-item>
          <Form-item label="店铺" prop="accountCodeList">
            <div class="merge-switch">
              <dyt-select
                v-if="saleAccountType === 'select'"
                v-model="pageParams.accountCodeList"
                :max-tag-count="1"
                multiple
                placeholder="请选择店铺，可输入搜索"
              >
                <Option
                  v-for="item in saleAccountList"
                  :key="item.saleAccountId"
                  :value="item.saleAccountId"
                  >{{ item.accountCode }}</Option
                >
              </dyt-select>
              <dyt-input-tag
                v-if="saleAccountType === 'input'"
                type="textarea"
                :limit="1"
                placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                v-model="textareaSaleAccountIds"
              />
              <Button @click="switchSaleAccountType">{{ saleAccountType === 'select' ? '选择' : '输入'}}</Button>
            </div>
          </Form-item>
          <div slot="operation">
            <Button type="primary" @click="search" :disabled="SearchDisabled || !this.pagePerm.view"
              icon="ios-search">查询</Button>
            <Button @click="reset" v-once icon="md-refresh" style="margin-left: 10px;">重置</Button>
          </div>
        </dyt-filter>
      </Form>
    </div>
    <!--工具栏-->
    <div class="funMain" v-if="showExport && getPermission('logisticsTracking_export')">
      <div class="funMain__flex">
        <div>
          <Dropdown>
            <Button type="primary">
              <span class="icon iconfont" style="font-size: 12px">&#xe639;</span>
              导出
              <Icon type="md-arrow-dropdown"></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem @click.native="exportSelect(1)">导出选中数据</DropdownItem>
              <DropdownItem @click.native="exportSelect(2)">导出所有结果集</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div></div>
      </div>
    </div>
    <!--表格-->
    <div class="tableMain">
      <div class="tableBox">
        <Table ref="selection" highlight-row border :height="tableHeight" :loading="tableLoading"
          :columns="tableColumns" :data="tableData" @on-selection-change="getSelectValue" />
      </div>
    </div>
    <!--分页-->
    <div class="pagesMain">
      <Page :total="tableTotal" @on-change="tablePage" show-total :page-size="pageParams.pageSize" show-elevator
        :current="pageParams.pageNum" show-sizer @on-page-size-change="tablePageSize" placement="top"
        :page-size-opts="pageArray" />
    </div>
    <Modal v-model="trackingModalVisible" title="跟踪信息">
      <div style="min-height: 200px;">
        <Card style="margin-bottom: 15px;">运单号: {{ viewRow.trackingNumber }}</Card>
        <Steps :current="0" direction="vertical" class="tracking-modal-step">
          <Step v-for="(item, index) in detailInfo" :key="index">
            <div slot="title">{{ $uDate.dealTime(item.checkpointDate) }}</div>
            <div slot="content" style="line-height:1.8em;">{{ item.trackingDetail }}</div>
          </Step>
        </Steps>
        <div v-if="detailInfo.length === 0" style="padding: 0 0 0 20px;color:#999;">
          暂无物流信息
        </div>
      </div>
      <div slot="footer">
        <!-- type="primary" -->
        <Button @click="closeTrackingModal">关 闭</Button>
      </div>
      <Spin v-if="loadDetail" fix />
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import { getShippingList, getEnableShippingMethods } from '@/utils/toolFun';
import { LOAD_CHILDREN_OPTIONS } from '@riophae/vue-treeselect';
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'logisticsTracking',
  mixins: [Mixin],
  data() {
    return {
      pageWarehouseId: (() => {
        return this.getWarehouseId();
      })(),
      shippingTreeData: [],
      shippingTreeSelectVal: null,
      shippingTreeJson: {},
      trackingModalVisible: false,
      tableLoading: false,
      loadDetail: false,
      logisticsTracking: {},
      detailInfo: [],
      viewRow: {},
      saleAccountType: 'select',
      saleAccountList: [],
      textareaSaleAccountIds: [],
      pageParams: {
        paymentTime: [this.$common.dayjs().add(-7, 'day').format('YYYY-MM-DD'), this.$common.dayjs().format('YYYY-MM-DD')],
        trackingStatusList: [],
        trackingNumberList: [],
        orderNumberList: [],
        packageCodeList: [],
        accountCodeList: [],
        pageNum: 1,
        pageSize: 20
      },
      statusList: [
        { label: '运输中', value: 'transit' },
        { label: '到达待取', value: 'pickup' },
        { label: '签收成功', value: 'delivered' },
        { label: '查询不到', value: 'notfound' },
        { label: '运输过久', value: 'expired' },
        { label: '投递失败', value: 'undelivered' },
        { label: '可能异常', value: 'exception' }
      ],
      tableColumns: [
        {
          type: 'selection',
          width: 50,
          fixed: 'left',
          align: 'center'
        },
        {
          title: '出库单号',
          key: 'packageCode',
          minWidth: 180,
          align: 'center'
        },
        {
          title: '订单号',
          key: 'orderNumber',
          minWidth: 180,
          align: 'center'
        },
        {
          title: '运单号',
          key: 'trackingNumber',
          minWidth: 180,
          align: 'center',
          render: (h, { row }) => {
            // if (!this.pagePerm.view) {
            //   return h('div', row.trackingNumber);
            // }
            return h('div', {
              style: {
                color: '#2d8cf0',
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  if (this.$common.isEmpty(row.trackingId)) return;
                  this.viewRow = row;
                  this.getDetail(row.trackingId);
                  this.$nextTick(() => {
                    this.trackingModalVisible = true;
                  })
                }
              }
            }, row.trackingNumber);
          }
        },
        {
          title: '状态',
          key: 'trackingStatus',
          minWidth: 120,
          align: 'center',
          render: (h, { row }) => {
            const statusItem = this.statusList.filter(f => f.value === row.trackingStatus);
            return h('div', statusItem.length > 0 ? statusItem[0].label || '' : row.trackingStatus);
          }
        },
        {
          title: '目的地',
          key: 'buyerCountryCode',
          minWidth: 120,
          align: 'center'
        },
        {
          title: '承运商/物流方式',
          key: 'merchantShippingMethodName',
          minWidth: 300,
          align: 'center',
          render: (h, { row }) => {
            return h('div', row.merchantShippingMethodName);
          }
        },
        {
          title: '付款时间',
          key: 'payTime',
          minWidth: 160,
          align: 'center',
          render: (h, { row }) => {
            // return h('div', this.$uDate.getDataToLocalTime(row.payTime, 'fulltime'));
            return h('div', this.$uDate.dealTime(row.payTime));
          }
        },
        {
          title: '最后更新时间',
          key: 'lastUpdatedTime',
          minWidth: 160,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.lastUpdatedTime)) {
              return h('div', '');
            }
            const trackingDetail = this.logisticsTracking[row.trackingId] ? this.logisticsTracking[row.trackingId][0] : {};
            return h('Tooltip', {
              props: {
                transfer: true,
                placement: 'right-start'
              }
            }, [
              h('div', this.$uDate.dealTime(row.lastUpdatedTime)),
              h('div', { slot: 'content' }, [
                h('div', this.$uDate.dealTime(row.lastUpdatedTime)),
                h('div', { style: { 'margin-top': '7px', 'line-height': '1.8em', 'font-size': '12px', 'white-space': 'pre-wrap' } }, trackingDetail.trackingDetail)
              ])
            ]);
          }
        },
        {
          title: '出库时间', // 发货时间
          key: 'despatchTime',
          minWidth: 160,
          align: 'center',
          render: (h, { row }) => {
            return h('div', this.$uDate.dealTime(row.despatchTime));
          }
        }
      ],
      tableData: [],
      selectTalbeValues: [],
      tableTotal: 0
    };
  },
  watch: {
    textareaSaleAccountIds: {
      deep: true,
      handler (val) {
        const newVal = this.$common.arrRemoveRepeat(this.saleAccountList.filter(f => val.includes(f.accountCode)).map(m => m.saleAccountId));
        this.$set(this.pageParams, 'accountCodeList', newVal);
      }
    },
    'pageParams.accountCodeList': {
      deep: true,
      handler (val) {
        const allAccount = this.saleAccountList.map(m => m.accountCode);
        const invalid = this.textareaSaleAccountIds.filter(f => !allAccount.includes(f));
        const newVal = this.saleAccountList.filter(f => val.includes(f.saleAccountId)).map(m => m.accountCode);

        if (JSON.stringify(this.textareaSaleAccountIds) === JSON.stringify([...invalid, ...newVal])) return;
        this.textareaSaleAccountIds = [...invalid, ...newVal];
      }
    }
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(240);
    },
    pagePerm() {
      return {
        view: this.getPermission('logisticsTracking_query')
      }
    },
    showExport() {
      let warehouseList = this.$store.state.warehouseList || [];
      let list = warehouseList.filter(k => { return k.warehouseId == this.pageWarehouseId });
      let result = list.length && list[0].warehouseType === '0';// 自营仓库才显示
      return result;
    }
  },
  created() {
    // 获取店铺
    this.getEnabledSaleAccounts();
    // 加载承运商
    getShippingList(this.pageWarehouseId).then(treeData => {
      this.shippingTreeData = treeData.data;
    });
    this.getList();
  },
  methods: {
    // 处理树节点
    treeNormalizer(node) {
      return {
        id: node.value,
        label: node.label,
        children: node.children
      }
    },
    // 展开加载树子级
    loadTreeOptions({ action, parentNode, callback, checked }) {
      if (action === LOAD_CHILDREN_OPTIONS || action === 'LOAD_CHILDREN_OPTIONS') {
        getEnableShippingMethods(parentNode.carrierId, this.pageWarehouseId).then(res => {
          if (!res.success) {
            callback(new Error('加载失败，'));
            return;
          }
          const newChild = res.data.map(item => {
            const newItem = {
              ...item,
              value: item.shippingMethodId,
              label: item.carrierShippingMethodName,
              parentMerchantId: parentNode.value,
              parentCarrierName: parentNode.carrierName,
              carrierAccounts: parentNode.carrierAccounts
            }
            this.$set(this.shippingTreeJson, item.shippingMethodId, newItem);
            return newItem;
          });
          parentNode.children = newChild;
          checked && checked(parentNode, newChild);
          callback();
        });
      }
    },
    // 获取列表数据
    getList() {
      if (!this.pagePerm.view) {
        this.$Message.error('你暂无权限查看！');
        return;
      }
      this.tableLoading = true;
      this.tableData = [];
      this.tableTotal = 0;
      const formParams = this.getPageParams();
      formParams.warehouseId = this.getWarehouseId();
      this.axios.post(api.queryLogisticsTrackingInfo, formParams).then(res => {
        this.tableLoading = false;
        if (res && res.data && res.data.datas) {
          this.tableData = res.data.datas.list || [];
          this.tableTotal = res.data.datas.total || 0;
          this.tableData.forEach(row => {
            if (!this.$common.isEmpty(row.lastUpdatedTime)) {
              this.getLogisticsTracking(row.trackingId);
            }
          })
        }
      }).catch((e) => {
        this.tableLoading = false;
      })
    },
    // 查询按钮
    search() {
      this.pageParams.pageNum = 1;
      this.getList();
    },
    getPageParams() {
      const removeKeys = ['paymentTime'];
      let newParams = this.$common.copy(this.pageParams);
      if (newParams.paymentTime[0]) {
        newParams.startPayTime = `${newParams.paymentTime[0]} 00:00:00`;
      }
      if (newParams.paymentTime[1]) {
        newParams.endPayTime = `${newParams.paymentTime[1]} 23:59:59`;
      }
      removeKeys.forEach(key => {
        delete newParams[key];
      });
      if (!this.$common.isEmpty(this.shippingTreeSelectVal)) {
        // 承运商
        newParams.merchantCarrierId = this.shippingTreeJson[this.shippingTreeSelectVal].parentMerchantId;
        // 物流方式
        newParams.merchantShippingMethodId = this.shippingTreeSelectVal;
      }
      if (newParams.accountCodeList && newParams.accountCodeList.length > 0) {
        newParams.accountCodeList = this.saleAccountList.filter(f => newParams.accountCodeList.includes(f.saleAccountId)).map(m => m.accountCode);
      }
      return newParams;
    },
    // 付款日期
    getAddDateValue(value) {
      this.pageParams.paymentTime = value;
    },
    // 重置添加日期
    resetAddDate() {
      this.pageParams.paymentTime = ['', ''];
    },
    // 重置数据
    reset() {
      this.$refs['pageParams'].resetFields();
      this.pageParams.paymentTime = [this.$common.dayjs().add(-7, 'day').format('YYYY-MM-DD'), this.$common.dayjs().format('YYYY-MM-DD')];
      this.pageParams.orderNumberList = [];
      this.pageParams.packageCodeList = [];
      this.pageParams.trackingNumberList = [];
      this.shippingTreeSelectVal = null;
      this.pageParams.trackingStatusList = [];
      this.textareaSaleAccountIds = [];
    },
    // 选择的数据
    getSelectValue(value) {
      this.selectTalbeValues = value;
    },
    tablePage(page) {
      // 分页切换
      this.pageParams.pageNum = page;
      this.curPage = page;
      this.getList();
    },
    tablePageSize(pageSize, plat) {
      this.pageParams.pageSize = pageSize;
      this.getList();
    },
    getCarrier(value) {
      if (value.length === 0 || !value) {
        return [null, null]
      }
      if (value.length === 1) {
        return [value[0], null]
      }
      if (value.length === 2) {
        return [value[0], value[1][0]]
      }
    },
    closeTrackingModal() {
      this.trackingModalVisible = false;
    },
    // 获取跟踪明细
    getDetail(id) {
      if (this.$common.isEmpty(id)) return;
      this.detailInfo = [];
      this.loadDetail = true;
      this.getLogisticsTracking(id).then(res => {
        this.loadDetail = false;
        this.detailInfo = res;
      })
    },
    getLogisticsTracking(id) {
      return new Promise((resolve, reject) => {
        if (this.$common.isEmpty(id)) return resolve([]);
        this.axios.get(`${api.queryDetailLogisticsTracking}/${id}`).then(res => {
          if (res && res.data && res.data.code === 0) {
            this.$set(this.logisticsTracking, id, (res.data.datas || []).reverse());
            resolve(this.logisticsTracking[id]);
          } else {
            resolve([]);
          }
        }).catch(() => {
          resolve([]);
        })
      })
    },
    switchSaleAccountType () {
      this.saleAccountType = this.saleAccountType === 'select' ? 'input' : 'select';
    },
    // 获取店铺
    getEnabledSaleAccounts () {
      this.axios.get(api.get_EnabledSaleAccounts + '?merchantId=' + this.$store.state.erpConfig.userInfo.merchantId).then((res) => {
        if (res && res.data && res.data.code === 0) {
          this.saleAccountList = res.data.datas || []
        }
      })
    },
    // 导出选中
    exportSelect(type) {
      let _self = this;
      let fun = {
        1() {
          let list = _self.selectTalbeValues;
          if (!list.length) {
            _self.$Message.warning('请选择导出数据');
            return false;
          }
          return { trackingIds: list.map(k => { return k.trackingId }) };
        },
        2() {
          let temp = _self.getPageParams();
          delete temp.pageNum;
          delete temp.pageSize;
          return temp;
        }
      }
      let temp = fun[type]();
      if (!temp) return;
      temp.warehouseId = this.pageWarehouseId;
      this.$Spin.show();
      this.axios.post(api.exportBatch, temp).then(({ data }) => {
        if (!(data && data.code === 0)) return;
        this.$Message.success('导出成功, 请到 "导出查看" 页面进行查看');
        type == 1 && this.$refs.selection.selectAll(false);
      }).finally(() => {
        this.$Spin.hide();
      })
    },
  }
};
</script>

<style lang="less" scoped>
.merge-switch{
  display:flex;
  align-items: center;
  border: 1px solid #DCDFE6;
  line-height: 1.6em;
  border-radius: 5px;
  :deep(.dyt-input-tag-content){
    min-width: 100px;
    border: none;
  }
  :deep(.ivu-select-selection) {
    border: none;
  }
  :deep(.ivu-btn) {
    border-top: none;
    border-right: none;
    border-bottom: none;
    border-radius: 0 5px 5px 0;
    &:active, &.active, &:hover {
      color: #515a6e;
      background-color: #fff;
      border-color: #dcdee2;
    }
    &:focus {
      box-shadow: none;
    }
  }
}
.logisticsTrackingInquiry {
  .ivu-form-item {
    width: 25%;
    min-width: 340px;
    max-width: 450px;
  }

  .table-page {
    text-align: right;
  }
}

.tracking-modal-step.ivu-steps {
  max-height: 550px;
  overflow: auto;

  :deep(.ivu-steps-item) {
    &.ivu-steps-status-process .ivu-steps-head-inner {
      border-color: #2d8cf0;
      background-color: #fff;

      span {
        display: none;
        color: #ccc;
      }
    }

    &.ivu-steps-status-wait {
      .ivu-steps-head-inner {
        span {
          display: none;
        }
      }

      .ivu-steps-content {
        color: #666;
      }
    }
  }

  :deep(.ivu-steps-head-inner) {
    border-color: #2d8cf0;
    margin-top: 1px;
    width: 15px;
    height: 15px;
  }

  :deep(.ivu-steps-tail) {
    position: absolute;
    left: 7px;
    width: 1px;
    padding: 18px 0 1px 0;
  }

  :deep(.ivu-steps-main .ivu-steps-title) {
    margin-bottom: 15px;
    color: #666;
    line-height: initial;
    font-weight: normal;
  }
}
</style>
