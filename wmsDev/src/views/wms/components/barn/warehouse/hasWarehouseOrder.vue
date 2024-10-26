<template>
  <div class="hasWarehouseOrderPage">
    <div class="listPage">
      <div class="searchMain">
        <Form ref="searchParams" :model="searchParams" :label-width="100">
          <dyt-filter ref="records-filter" @expand="expand">
            <Form-item label="下单任务号:" prop="receiptTaskNo">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.receiptTaskNo" />
            </Form-item>
            <Form-item label="LAPA出库单号:" prop="pickingNo">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.pickingNo" />
            </Form-item>
            <Form-item label="下单时间:" prop="orderTime">
              <DatePicker type="daterange" transfer placeholder="选择日期" style="width: 100%"
                v-model.trim="paramsOthers.orderTime" format="yyyy-MM-dd" @on-change="timeChange"></DatePicker>
            </Form-item>
            <Form-item label="运输方式:" prop="transportType">
              <dyt-select v-model="searchParams.transportType">
                <Option v-for="(item, index) in expressList" :value="item.value" :key="index + 'transportType'"
                  :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="海外入库单:" prop="overseasReceipt">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.overseasReceipt" />
            </Form-item>
            <div slot="operation">
              <Button type="primary" @click="search" icon="ios-search" class="mr10">查询</Button>
              <Button @click="reset" v-once icon="md-refresh">重置</Button>
            </div>
          </dyt-filter>
        </Form>
      </div>
      <div class="funMain">
        <div class="funMain__flex">
          <div class="main__flex">
            <Button type="primary" @click="exportAll" v-if="getPermission('wmsWareOrder_orderExport')">导出</Button>
            <Button type="primary" @click="mulPlaceOrder" v-if="tab === 3 && getPermission('wmsWareOrder_orderToOrder')"
              :disabled="!tableCheckedList.length">批量下单</Button>
          </div>
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>
      <!--表格-->
      <div class="tableMain">
        <div class="tableBox" :class="tableBoxClass">
          <Table highlight-row border :loading="tableLoading" @on-selection-change="checkedDataHandel" :columns="columns"
            :data="tableList" ref="selection" :height="tableHeight">
            <template slot-scope="{ row }" slot="status">
              <span v-for="(item, index) in statusList" :key="index + 'status'">
                {{ item.value === row.status ? item.label : '' }}
              </span>
            </template>
            <template slot-scope="{ row }" slot="pickingNo">
              <span v-if="row.pickingNos">
                <div class="linkText cursorClick" @click="seeDetail(row, item)"
                  v-for="(item, index) in row.pickingNos.split(',')" :key="index">
                  {{ item || '' }}
                </div>
              </span>
            </template>
            <template slot-scope="{ row }" slot="placeOrderTime">
              <div class="timeWidth" v-if="row.placeOrderTime">{{ $uDate.dealTime(row.placeOrderTime) }}</div>
            </template>
            <template slot-scope="{ row }" slot="targetWarehouse">
              <div>{{ row.targetWarehouseCode + '[' + row.targetWarehouse + ']' }}</div>
            </template>
            <template slot-scope="{ row }" slot="transportType">
              <span>{{ expressList[row.transportType] && expressList[row.transportType].label }}</span>
            </template>
            <template slot-scope="{ row }" slot="reason">
              <Tooltip max-width="200" :content="row.reason" :disabled="!(row.reason && row.reason.length)"
                placement="top" transfer>
                <div class="textOverTwo">{{ row.reason }}</div>
              </Tooltip>
            </template>
            <template slot-scope="{ row }" slot="action">
              <div v-if="tab === 3">
                <span class="unlinkText cursorClick mr10" @click="placeAnOrder(row)"
                  v-if="getPermission('wmsWareOrder_orderToOrder')">
                  下单
                </span>
                <span class="unlinkText cursorClick errorText" @click="toVoid(row)"
                  v-if="getPermission('wmsWareOrder_orderCancel')">
                  作废
                </span>
              </div>
            </template>
          </Table>
        </div>
      </div>
      <!--分页按钮-->
      <div class="pagesMain">
        <dyt-pagination @on-change="changePage" @on-page-size-change="changePageSize" :total="totalRecords"
          :current="searchParams.pageNum" :page-size="searchParams.pageSize"></dyt-pagination>
      </div>
    </div>
    <!-- 出库单详情 -->
    <warehouseDetail :dialogVisible.sync="detail.visible" :modalData="detail.data"></warehouseDetail>
    <!-- 海外仓入库下单 -->
    <fillOrderData :dialogVisible.sync="fillOrderData.visible" :modalData="fillOrderData.data"
      :importCompany="importCompanyList" :type="fillOrderData.type" @search="search">
    </fillOrderData>
  </div>
</template>
<script>
import dayjs from 'dayjs';
import api from '@/api/api';
import { statusList, expressList } from './fileData.js';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';
import warehouseDetail from './detail.vue';
import fillOrderData from './fillOrderData.vue';
import permission_mixin from '@/components/mixin/permission_mixin';
export default {
  name: 'hasWarehouseOrder',
  mixins: [tableHeight_mixin, permission_mixin],
  components: { warehouseDetail, fillOrderData },
  props: {
    tab: {// 父组件tab切换
      type: [String, Number],
      default() { return null }
    },
  },
  data() {
    return {
      searchParams: {
        receiptTaskNo: [],
        pickingNo: [],
        transportType: '',
        startTime: '',
        endTime: '',
        overseasReceipt: [],
        status: '',
        warehouseId: this.$store.state.warehouseId,
        orderBy: 'DESC',
        orderByField: '0',
        pageNum: 1,
        pageSize: 10,
      },
      paramsOthers: {
        orderTime: [],
      },
      sortButtonList: [
        {
          sortHeader: '按下单时间',
          sortField: '0',
          sortType: 'DESC',
          default: true,
        },
      ],
      tableLoading: false,
      tableList: [],
      tableCheckedList: [],
      statusList: statusList,
      totalRecords: 0,
      detail: {
        visible: false,
        data: {},
      },
      fillOrderData: {
        visible: false,
        data: [],
      },
      expressList: expressList,
      importCompanyList: [] // 进口商信息
    }
  },
  watch: {
    // 重置高度
    tab: {
      handler(val) {
        if (![1, 2, 3].includes(val)) return;
        this.$refs['records-filter'] && this.$refs['records-filter'].resizeHand();
        this.getList();
        setTimeout(() => {
          this.computedTableHeight();
        }, 500)
      },
      deep: true,
    },
  },
  computed: {
    // 表格表头
    columns() {
      let arr = [];
      if (this.tab == 3) {
        arr = [{
          type: 'selection',
          width: 50,
          align: 'left',
          fixed: 'left',
        }, {
          title: '操作',
          slot: 'action',
          width: 100,
          align: 'left',
          fixed: 'right',
        }, {
          title: '失败原因',
          slot: 'reason',
          minWidth: 120,
          align: 'left',
        }]
      } else {
        arr = [{
          title: '海外入库单',
          key: 'overseasReceipt',
          minWidth: 110,
          align: 'left',
        }]
      }
      return [
        {
          title: '下单任务号',
          key: 'receiptTaskNo',
          minWidth: 140,
          align: 'left',
        },
        {
          title: '下单状态',
          slot: 'status',
          width: 100,
          align: 'left',
        },
        {
          title: 'LAPA出库单号',
          slot: 'pickingNo',
          minWidth: 170,
          align: 'left',
        },
        {
          title: '下单时间',
          slot: 'placeOrderTime',
          width: 100,
          align: 'left',
        },
        {
          title: '总箱数',
          key: 'boxQuantity',
          width: 80,
          align: 'left',
        },
        {
          title: '总实重kg',
          key: 'totalWeight',
          width: 90,
          align: 'left',
        },
        {
          title: '总抛重kg',
          key: 'totalThrowWeight',
          width: 100,
          align: 'left',
        },
        {
          title: '总SKU数',
          key: 'skuQuantity',
          width: 90,
          align: 'left',
        },
        {
          title: '总件数',
          key: 'productQuantity',
          width: 80,
          align: 'left',
        },
        {
          title: '目的仓',
          slot: 'targetWarehouse',
          minWidth: 110,
          align: 'left',
        },
        {
          title: '目的仓地址',
          key: 'targetWarehouseAddress',
          width: 120,
          align: 'left',
        },
        {
          title: '运输方式',
          slot: 'transportType',
          width: 90,
          align: 'left',
        },
        {
          title: '备注',
          key: 'remark',
          minWidth: 110,
          align: 'left',
          tooltip: true,
        },
        ...arr,
      ]
    },
  },
  created() {
    this.init();
    [1, 2, 3].includes(this.tab) && this.search();
  },
  methods: {
    init() {
      let secondDay = dayjs().subtract(6, 'day').format('YYYY-MM-DD') + ' 00:00:00';
      let today = dayjs().format('YYYY-MM-DD') + ' 23:59:59';
      this.paramsOthers.orderTime = [secondDay, today];// 完成装箱时间，默认值为前7天
      this.searchParams.startTime = secondDay;
      this.searchParams.endTime = today;
      this.getImportInfo()
    },
    expand() {
      this.computedTableHeight();
    },
    // 查询
    search() {
      this.searchParams.pageNum = 1;
      this.getList();
    },
    // 重置
    reset() {
      this.$refs['searchParams'].resetFields();
      this.init();
    },
    // 获取列表
    getList() {
      this.searchParams.status = this.tab;
      let params = this.$common.removeEmpty(this.searchParams);
      this.tableLoading = true;
      this.axios.post(api.queryOrderInProgress, params).then(({ data }) => {
        if (data.code !== 0) return;
        let datas = data.datas || {};
        this.tableList = (datas.list || []).map(k => {
          k.paramJsonParse = JSON.parse(k.paramJson);
          k = Object.assign(k, k.paramJsonParse);
          return k;
        });
        this.totalRecords = datas.total || 0;
      }).finally(() => {
        this.tableLoading = false;
        this.tableCheckedList = [];
      });
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.searchParams.orderBy = type;
      this.searchParams.orderByField = feild;
      this.search();
    },
    // 表格勾选
    checkedDataHandel(data) {
      this.tableCheckedList = data;
    },
    // 表格分页
    changePage(page) {
      this.searchParams.pageNum = page;
      this.getList();
    },
    // 切换每页条数
    changePageSize(size) {
      this.searchParams.pageSize = size;
      this.search();
    },
    // 作废
    toVoid(row) {
      let { pickingNos, receiptTaskNo } = row;
      this.$Modal.confirm({
        width: 660,
        title: '操作提示',
        content: `<div style="font-size: 14px;line-height: 16px;">
          <p>确认是否要作废LAPA出库单的入库下单任务：<span style="color:#FF9900;word-break:break-all;">${pickingNos || ''}</span></p>
          <p style="border: 1px solid #ffd77a;background-color: #fff9e6;padding: 4px 6px;color: #515a6e;border-radius: 4px;margin-top:10px;">提示：作废LAPA出库单下单任务，不影响海外仓出库单的数据</p>
          </div>`,
        loading: true,
        onOk: () => {
          let temp = {
            receiptTaskNo,
            pickingNo: pickingNos ? pickingNos.split(',') : [],
          }
          this.axios.post(api.updateProgressInvalidateOrder, temp).then(({ data }) => {
            if (data.code !== 0) return;
            this.$Message.success('操作成功~');
            this.search();
          }).finally(() => {
            this.$Modal.remove();
          });
        }
      });
    },
    // 查看出库单详情
    seeDetail(row, pickingNo) {
      this.detail.data = this.$common.copy(Object.assign({ pickingNo }, row));
      this.detail.visible = true;
    },
    // 下单
    placeAnOrder(row) {
      this.fillOrderData.data = [this.$common.copy(row)];
      this.fillOrderData.type = 'reOrder';
      this.fillOrderData.visible = true;
    },
    // 导出所有
    exportAll() {
      this.$Modal.confirm({
        title: '导出所有',
        content: '<p>异步导出所有行的列表数据，导出任务完成后，请使用“导出查看”的功能，下载导出文件；</p>',
        loading: true,
        onOk: () => {
          let params = this.$common.removeEmpty(this.searchParams);
          params.warehouseId = this.$store.state.warehouseId;
          delete params.pageNum;
          delete params.pageSize;
          this.axios.post(api.exportInProgressOrderList, params).then(({ data }) => {
            if (data.code !== 0) return;
            this.$Message.success('导出成功~');
            this.search();
          }).finally(() => {
            this.$Modal.remove();
          });
        }
      });
    },
    // 创建时间
    timeChange(e) {
      this.searchParams.startTime = e[0] ? e[0] + ' 00:00:00' : '';
      this.searchParams.endTime = e[1] ? e[1] + ' 23:59:59' : '';
    },
    // 批量下单
    mulPlaceOrder() {
      let list = this.tableCheckedList.map(k => { return k.receiptTaskNo });
      this.$Modal.confirm({
        title: '批量入库下单',
        content: '<p>确认是否要批量入库下单?</p>',
        loading: true,
        onOk: () => {
          this.axios.post(`${api.batchPlaceOrder}?receiptTaskNos=${list.toString()}`).then(({ data }) => {
            if (data.code !== 0) return;
            this.$Message.success('操作成功~');
            this.search();
          }).finally(() => {
            this.$Modal.remove();
          });
        }
      });
    },
    // 获取进口商信息
    getImportInfo() {
      this.axios.get(`${api.getValInfo}?warehouseId=${this.$store.state.warehouseId}`).then(({ data }) => {
        if (data.code !== 0) return;
        this.importCompanyList = data.datas
      })
    },
  },
}
</script>
<style lang="less">
.hasWarehouseOrderPage {
  height: 100%;

  .main__flex {
    display: flex;
    align-items: center;

    * {
      margin-right: 10px;
    }
  }

  .errorText {
    color: #ed4014;
  }
}
</style>