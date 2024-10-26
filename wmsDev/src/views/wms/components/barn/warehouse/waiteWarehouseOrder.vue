<template>
  <div class="waiteWarehouseOrderPage">
    <div class="listPage">
      <div class="searchMain">
        <Form ref="searchParams" :model="searchParams" :label-width="100">
          <dyt-filter ref="records-filter" @expand="expand">
            <Form-item label="LAPA出库单:" prop="pickingNo">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.pickingNo" />
            </Form-item>
            <Form-item label="参考编号:" prop="referenceNo">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.referenceNo" />
            </Form-item>
            <Form-item label="完成装箱时间:" prop="finishBoxTime">
              <DatePicker type="daterange" transfer placeholder="选择日期" style="width: 100%"
                v-model.trim="paramsOthers.finishBoxTime" format="yyyy-MM-dd" @on-change="timeChange"></DatePicker>
            </Form-item>
            <Form-item label="谷仓账号:" prop="gcAccount">
              <dyt-input v-model.trim="searchParams.gcAccount"></dyt-input>
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
            <Button type="primary" @click="exportAll" v-if="getPermission('wmsWareOrder_waitExport')">导出</Button>
            <template v-if="tab === 0 && getPermission('wmsWareOrder_waitToOrder')">
              <Button type="primary" @click="warehouseOrder" :disabled="!tableCheckedList.length">入库下单</Button>
              <div class="dyt-alert">同个物流单号一起发货的LAPA出库单，须一起下单</div>
            </template>
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
            <template slot-scope="{ row }" slot="pickingNo">
              <span class="linkText cursorClick mt6" @click="seeDetail(row)">{{ row.pickingNo || '' }}</span>
            </template>
            <template slot-scope="{ row }" slot="status">
              <span v-for="(item, index) in statusList" :key="index + 'status'">
                {{ item.value === row.status ? item.label : '' }}
              </span>
            </template>
            <template slot-scope="{ row }" slot="packingTime">
              <div class="timeWidth" v-if="row.packingTime">
                {{ $uDate.dealTime(row.packingTime) }}
              </div>
            </template>
            <template slot-scope="{ row }" slot="pickingType">
              <span v-for="(item, index) in outListTypeList" :key="index + 'pickingType'">
                {{ item.value === row.pickingType ? item.label : '' }}
              </span>
            </template>
            <template slot-scope="{ row }" slot="createdTime">
              <div class="timeWidth" v-if="row.createdTime">
                {{ $uDate.dealTime(row.createdTime) }}
              </div>
            </template>
            <template slot-scope="{ row }" slot="createdBy">
              <div>{{ userInfoList[row.createdBy] && userInfoList[row.createdBy].userName }}</div>
            </template>
            <template slot-scope="{ row }" slot="action">
              <span class="unlinkText cursorClick errorText" @click="toVoid(row)"
                v-if="['0', 0].includes(row.status) && getPermission('wmsWareOrder_waitCancel')">
                作废
              </span>
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
      :importCompany="importCompanyList" @search="search">
    </fillOrderData>
  </div>
</template>
<script>
import dayjs from 'dayjs';
import api from '@/api/api';
import warehouseDetail from './detail.vue';
import fillOrderData from './fillOrderData.vue';
import { statusList, deliveryOrderType } from './fileData.js';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';
import permission_mixin from '@/components/mixin/permission_mixin';
export default {
  name: 'waiteWarehouseOrder',
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
        pickingNo: [],
        referenceNo: [],
        startTime: '',
        endTime: '',
        gcAccount: '',
        status: '',
        warehouseId: this.$store.state.warehouseId,
        orderBy: 'DESC',
        orderByField: '0',
        pageNum: 1,
        pageSize: 10,
      },
      paramsOthers: {
        finishBoxTime: [],
      },
      sortButtonList: [
        {
          sortHeader: '按完成装箱时间',
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
      outListTypeList: deliveryOrderType, // 出库单类型
      importCompanyList: [] // 出口商编码信息列表
    }
  },
  watch: {
    // 重置高度
    tab: {
      handler(val) {
        if (![0, 4].includes(val)) return;
        this.searchParams.status = val;
        this.$refs['records-filter'] && this.$refs['records-filter'].resizeHand();
        // 重置页面样式
        this.getList();
        setTimeout(() => {
          this.computedTableHeight();
        }, 500)
      },
      deep: true,
    },
  },
  computed: {
    columns() {
      let arr = [];
      if (this.tab === 0) {
        arr.push({
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
        })
      }
      return [
        ...arr,
        {
          title: 'LAPA出库单号',
          slot: 'pickingNo',
          minWidth: 170,
          align: 'left',
        },
        {
          title: '下单状态',
          slot: 'status',
          width: 110,
          align: 'left',
        },
        {
          title: '完成装箱时间',
          slot: 'packingTime',
          width: 110,
          align: 'left',
        },
        {
          title: '出库单类型',
          slot: 'pickingType',
          width: 100,
          align: 'left',
        },
        {
          title: '参考编号',
          key: 'referenceNo',
          minWidth: 120,
          align: 'left',
        },
        {
          title: '谷仓账号',
          key: 'gcAccount',
          minWidth: 120,
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
          width: 90,
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
          width: 90,
          align: 'left',
        },
        {
          title: '备注',
          key: 'remark',
          minWidth: 120,
          align: 'left',
          tooltip: true,
        },
        {
          title: '创建时间',
          slot: 'createdTime',
          minWidth: 90,
          align: 'left',
        },
        {
          title: '创建人',
          slot: 'createdBy',
          width: 120,
          align: 'left',
        },
      ]
    },
    // 用户列表
    userInfoList() {
      return this.$store.state.userInfoList;
    },
  },
  created() {
    this.init();
    this.searchParams.status = this.tab;
    [0, 4].includes(this.tab) && this.search();
  },
  methods: {
    // 初始化时间
    init() {
      let secondDay = dayjs().subtract(6, 'day').format('YYYY-MM-DD') + ' 00:00:00';
      let today = dayjs().format('YYYY-MM-DD') + ' 23:59:59';
      this.paramsOthers.finishBoxTime = [secondDay, today];// 完成装箱时间，默认值为前7天
      this.searchParams.startTime = secondDay;
      this.searchParams.endTime = today;
    },
    expand() {
      this.computedTableHeight();
    },
    // 查询
    search() {
      this.searchParams.pageNum = 1;
      this.getList();
      this.getImportInfo();
    },
    // 重置
    reset() {
      this.$refs['searchParams'].resetFields();
      this.init();
    },
    // 获取列表
    getList() {
      let params = this.$common.removeEmpty(this.searchParams);
      this.tableLoading = true;
      this.axios.post(api.queryIncomingOrderList, params).then(({ data }) => {
        if (data.code !== 0) return;
        let datas = data.datas || {};
        this.tableList = datas.list || [];
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
      let { pickingNo } = row;
      this.$Modal.confirm({
        width: 660,
        title: `操作提示`,
        content: `<div style="font-size: 14px;line-height: 16px;">
            <p>确认是否要作废LAPA出库单的入库下单任务：<span style="color:#FF9900;">${pickingNo}</span></p>
            <p style="border: 1px solid #ffd77a;background-color: #fff9e6;padding: 4px 6px;color: #515a6e;border-radius: 4px;margin-top:10px;">提示：作废LAPA出库单下单任务，不影响海外仓出库单的数据</p>
          </div>`,
        loading: true,
        onOk: () => {
          this.axios.post(`${api.updateInvalidateOrder}?pickingNo=${pickingNo}`).then(({ data }) => {
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
    seeDetail(row) {
      this.detail.data = this.$common.copy(row);
      this.detail.visible = true;
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
          this.axios.post(api.exportIncomingOrderList, params).then(({ data }) => {
            if (data.code !== 0) return;
            this.$Message.success('导出成功~');
            this.search();
          }).finally(() => {
            this.$Modal.remove();
          });
        }
      });
    },
    // 入库下单
    warehouseOrder() {
      let list = this.tableCheckedList;
      this.fillOrderData.data = this.$common.copy(list);
      this.fillOrderData.visible = true;
    },
    getImportInfo() {
      this.axios.get(`${api.getValInfo}?warehouseId=${this.$store.state.warehouseId}`).then(({ data }) => {
        if (data.code !== 0) return;
        this.importCompanyList = data.datas
      })
    },
    // 创建时间
    timeChange(e) {
      this.searchParams.startTime = e[0] ? e[0] + ' 00:00:00' : '';
      this.searchParams.endTime = e[1] ? e[1] + ' 23:59:59' : '';
    },
  },
}
</script>
<style lang="less">
.waiteWarehouseOrderPage {
  height: 100%;

  .main__flex {
    display: flex;
    align-items: center;

    * {
      margin-right: 10px;
    }
  }

  .dyt-alert {
    display: inline-block;
    border-radius: 4px;
    color: #515a6e;
    font-size: 14px;
    line-height: 30px;
    padding: 0 6px;
    border: 1px solid #abdcff;
    background-color: #f0faff;
  }

  .errorText {
    color: #ed4014;
  }

  .mt6 {
    margin-top: 6px;
  }
}
</style>