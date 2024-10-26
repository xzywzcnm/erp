<template>
  <div class="refundProcessPage">
    <div class="listPage">
      <div class="searchMain">
        <Form ref="searchParams" :model="searchParams" inline :label-width="100">
          <dyt-filter :filter-row="1" @operation="operation" ref="dyt-filter" @expand="expand">
            <FormItem label="店铺" prop="saleAccountIds">
              <dytStoreSelect
                v-model="searchParams.saleAccountIds"
                :option-data="shopList"
                :replace-option-key="{value: 'saleAccountId', label: 'accountCode'}"
                placeholder="请选择店铺，可输入搜索"
                input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
              />
            </FormItem>
            <FormItem label="状态" prop="refundStatusList">
              <dyt-select v-model="searchParams.refundStatusList" :max-tag-count="1" multiple>
                <Option v-for="(item, index) in refundStatusData" :key="`rs-${index}`" :value='item.value'>
                  {{ item.label }}
                </Option>
              </dyt-select>
            </FormItem>
            <Form-item label="退款包裹状态" prop="returnStatusList">
              <dyt-select v-model="searchParams.returnStatusList" :max-tag-count="1" multiple>
                <Option v-for="(item, index) in refundPackageStatusList" :value='item.value' :key="'fps-' + index">
                  {{ item.label }}
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="包裹到仓时间" prop="packageArrivalTime">
              <Date-picker
                transfer
                type="datetimerange"
                :clearable="true"
                format="yyyy-MM-dd HH:mm:ss"
                :options="options"
                placeholder="请选择"
                v-model="searchParams.packageArrivalTime"
              />
            </Form-item>
            <FormItem label="付款时间" prop="payTime">
              <DatePicker
                type="datetimerange"
                format="yyyy-MM-dd HH:mm:ss"
                transfer
                :options="options"
                placeholder="请选择"
                :clearable="true"
                v-model="searchParams.payTime"
              >
              </DatePicker>
            </FormItem>
            <Form-item label="退款申请时间" prop="occurredTime">
              <Date-picker
                transfer
                type="datetimerange"
                :clearable="true"
                format="yyyy-MM-dd HH:mm:ss"
                :options="options"
                placeholder="请选择"
                v-model="searchParams.occurredTime"
              />
            </Form-item>
            <FormItem label="订单号" prop="orderNo">
              <dyt-inputTag v-model="searchParams.orderNo" :limit="1" type="textarea" />
            </FormItem>
            <FormItem label="itemID" prop="positionItemIds">
              <dyt-inputTag v-model="searchParams.positionItemIds" :limit="1" type="textarea" />
            </FormItem>
            <FormItem label="平台SKU" prop="webstoreSkus">
              <dyt-mulSearch :preciseValue.sync="searchParams.webstoreSkus" :vagueValue.sync="searchParams.webstoreSku" />
            </FormItem>
            <FormItem label="退货跟踪号" prop="trackingNumberList">
              <dyt-inputTag v-model="searchParams.trackingNumberList" :limit="1" type="textarea" />
            </FormItem>
            <Form-item label="商品所属事业部" prop="businessDeptIdList">
              <dyt-select v-model="searchParams.businessDeptIdList" :max-tag-count="1" multiple>
                <Option v-for="(item, index) in businessDeptDataList" :value='item.id' :key="`business-${index}`">
                  {{ item.name }}</Option>
              </dyt-select>
            </Form-item>
            <div slot="operation">
              <Button type="primary" @click="search" icon="md-search">查询</Button>
              <Button @click="reset" class="ml10" icon="md-refresh">重置</Button>
            </div>
          </dyt-filter>
        </Form>
      </div>
      <!-- 功能 -->
      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <Button
              type="primary"
              class="mr10"
              @click="refundApply(tableSltData, 3)"
              :disabled="mulReceipt"
              v-if="getPermission('refundProcess_recepit')"
            >批量接受</Button>
            <Button
              type="primary"
              @click="refundApply(tableSltData, 4)"
              :disabled="mulRefuse"
              v-if="getPermission('refundProcess_refuse')"
            >批量拒绝</Button>

            <Dropdown class="ml10" v-if="permission.export">
              <Button type="primary">
                导出
                <Icon type="ios-arrow-down"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem @click.native="batchOperation('exportCheck')">
                  导出选中
                </DropdownItem>
                <DropdownItem @click.native="batchOperation('exportAll')">
                  导出所有结果集
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch(arguments)"
              :sorType="{ DESC: 'Down', ASC: 'up' }"></dyt-sortBySelect>
          </div>
        </div>
      </div>
      <!-- 表格 -->
      <div class="tableMain">
        <div class="tableBox">
          <Table border highlight-row ref="selection" :columns="columns" :loading="tableLoading" :data="tableList"
            :height="tableHeight" @on-selection-change='tableSelectionChange'>
            <template slot-scope="{ row }" slot="orderNo">
              <div class="flexCenter" style="align-items: flex-start;">
                <a href="javascript:;" class="dyt-linkText mr10" @click="seeDrderDetail(row)">
                  {{ row.orderNo }}
                </a>
                <span class="icon lapa lapa-copy iconClick" @click="copy(row.orderNo)" v-if="row.orderNo" />
              </div>
            </template>
            <template slot-scope="{ row }" slot="returnStatus">
              <div v-if="refundPackageStatusList[row.returnStatus]">
                {{ refundPackageStatusList[row.returnStatus].label }}
              </div>
            </template>
            <template slot-scope="{ row }" slot="refundStatus">
              <div v-if="refundStatusData[row.refundStatus]">
                {{ refundStatusData[row.refundStatus].label }}
              </div>
            </template>
            <template slot-scope="{ row, index }" slot="timeInfo">
              <div class="timeBlock">
                <div>
                  <span class="times">付款时间：</span>
                  {{ $common.getDataToLocalTime(row.payTime, 'fulltime') }}
                </div>
                <div>
                  <span class="times">退款申请时间：</span>
                  {{ row.occurredTime || '-' }}
                </div>
                <div>
                  <span class="times">包裹到仓时间：</span>
                  {{ $common.getDataToLocalTime(row.packageArrivalTime, 'fulltime') }}
                </div>
                <div>
                  <span class="times">处理时间：</span>
                  {{ $common.getDataToLocalTime(row.handleTime, 'fulltime') }}
                </div>
              </div>
            </template>
            <template slot-scope="{ row, index }" slot="refundPrice">
              <div v-if="row.orderTransaction">
                {{ row.orderTransaction.productsPrice || 0 }} {{ row.orderTransaction.productsCurrency || '' }}
              </div>
            </template>
            <template slot-scope="{ row, index }" slot="actions">
              <a href="javascript:void();" class="dyt-linkText mr10" @click="refundApply([row], 1)"
                v-if="getPermission('refundProcess_recepit') && ['ANNOUNCED', 'REJECTED'].includes(row.refundStatus)">接受</a>
              <a href="javascript:void();" class="dyt-linkText" @click="refundApply([row], 2)"
                v-if="getPermission('refundProcess_refuse') && ['ANNOUNCED'].includes(row.refundStatus)">拒绝</a>
            </template>
          </Table>
        </div>
      </div>
      <!--分页-->
      <div class="pagesMain">
        <Page :total="total" :current="searchParams.pageNum" :page-size="searchParams.pageSize" show-total show-sizer
          show-elevator @on-change="pageNumChange" @on-page-size-change="pageSizeChange" :page-size-opts="pageArray">
        </Page>
      </div>
    </div>
    <!-- 退款申请 -->
    <refundOperation :dialogVisible.sync="refundOperation.visible" :list="refundOperation.list"
      :type="refundOperation.type" @search="search" />
    <!-- 订单详情 -->
    <orderDetail :dialogVisible.sync="orderInfo.visible" :data="orderInfo.data" />
  </div>
</template>

<script>
import api from '@/api/api';
import refundOperation from './refundProcess/refundOperation';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';
import orderDetail from './refundProcess/orderDetail';
import Mixin from '@/components/mixin/common_mixin';
import { timeOption } from '@/utils/comConfig.js';
const searchParams = {
  saleAccountIds: [],
  refundStatusList: [],
  orderNo: [],
  positionItemIds: [],
  webstoreSku: '',
  webstoreSkus: [],
  trackingNumberList: [],
  businessDeptIdList: [],
  returnStatusList: [],
}
export default {
  name: 'refundProcess',
  mixins: [tableHeight_mixin, Mixin],
  components: { refundOperation, orderDetail },
  data() {
    const getRangeTime = (startDay, endDay) => {
      const dayjs = this.$common.dayjs();
      return [`${dayjs.add(startDay, 'day').format('YYYY-MM-DD')} 00:00:00`, `${dayjs.add(endDay, 'day').format('YYYY-MM-DD')} 23:59:59`];
    }
    return {
      total: 0,
      tableLoading: false,
      tableList: [],
      searchParams: {
        ...searchParams,
        packageArrivalTime: getRangeTime(-7, 0),
        payTime: [],
        occurredTime: [],
        orderBy: 'occurredTime',
        upDown: 'Down',
        pageNum: 1,
        pageSize: 50
      },
      selectionList: [],
      // 店铺列表
      shopList: [],
      // 退款状态
      refundStatusData: {
        'ANNOUNCED': { label: '待处理', value: 'ANNOUNCED' },
        'ACCEPTED': { label: '已接受', value: 'ACCEPTED' },
        'REJECTED': { label: '已拒绝', value: 'REJECTED' },
      },
      // 商品所属事业部
      businessDeptDataList: [],
      // 退款包裹状态
      refundPackageStatusList: {
        'ANNOUNCED': { label: '待投递', value: 'ANNOUNCED' },
        'ON_THE_WAY': { label: '投递中', value: 'ON_THE_WAY' },
        'DELIVERED': { label: '已到仓', value: 'DELIVERED' },
      },
      tableSltData: [],
      sortButtonList: [// 排序
        {
          sortHeader: '退货申请时间',
          sortField: 'occurredTime',
          sortType: 'Down',
          default: true
        },
        {
          sortHeader: '付款时间',
          sortField: 'payTime',
          sortType: 'Down',
        },
      ],
      columns: [{
        type: 'selection',
        width: 60,
        align: 'center'
      },
      {
        title: '订单号',
        slot: 'orderNo',
        align: 'center',
        minWidth: 140,
      },
      {
        title: 'Itemid',
        key: 'positionItemId',
        align: 'center',
        minWidth: 120,
      },
      {
        title: '平台SKU',
        align: 'center',
        key: 'selfWebstoreSku',
        minWidth: 120
      },
      {
        title: '退货跟踪号',
        align: 'center',
        key: 'trackingNumber',
        minWidth: 120
      },
      {
        title: '退款包裹状态',
        align: 'center',
        slot: 'returnStatus',
        width: 140
      },
      {
        title: '状态',
        align: 'center',
        slot: 'refundStatus',
        width: 140
      },
      {
        title: '时间信息',
        align: 'center',
        slot: 'timeInfo',
        width: 260
      },
      {
        title: '申请退款金额',
        slot: 'refundPrice',
        align: 'center',
        width: 140
      },
      {
        title: '操作',
        slot: 'actions',
        fixed: 'right',
        align: 'center',
        width: 120
      }],
      refundOperation: {// 退款
        visible: false,
        list: [],
        type: null,
      },
      orderInfo: {
        visible: false,
        data: {},
      },
      // 时间快捷面板
      options: timeOption,
    }
  },
  watch: {},
  created() {
    this.getShopList();
    this.getBusinessDeptData();
    this.getList();
  },
  computed: {
    mulReceipt() {
      let tableSltData = this.tableSltData;
      let unAcceptList = tableSltData.filter(k => { return !['ANNOUNCED', 'REJECTED'].includes(k.refundStatus) });
      return !!(!tableSltData.length || unAcceptList.length);
    },
    mulRefuse() {
      let tableSltData = this.tableSltData;
      let unAcceptList = tableSltData.filter(k => { return !['ANNOUNCED'].includes(k.refundStatus) });
      return !!(!tableSltData.length || unAcceptList.length);
    },
    // isGetBusiness() {
    //   return ['otto'].includes(this.inGroup);
    // },
    shopObj() {
      let obj = {};
      this.shopList.forEach(k => {
        obj[k.saleAccountId] = k;
      })
      return obj;
    },
    // 权限
    permission () {
      // 导出
      return {
        export: this.getPermission('refundProcessExcel')
      }
    }

  },
  methods: {
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(Info) {
      this.searchParams.upDown = Info[0] || 'Down';
      this.searchParams.orderBy = Info[1] || 'occurredTime';
      this.search();
    },
    // 订单详情
    seeDrderDetail(row) {
      this.orderInfo.data = row;
      this.orderInfo.visible = true;
    },
    // 批量操作
    batchOperation (str) {
      if (this.$common.isEmpty(str) || !this.$common.isFunction(this[str])) return;
      this[str]();
    },
    // 导出选中
    exportCheck () {
      if (this.$common.isEmpty(this.tableSltData)) {
        this.$Message.error('请选择数据后再操作');
        return;
      }
      let params = {
        ottoRefundInfoIds: this.tableSltData.map(m => m.ottoRefundInfoId)
      };
      this.exportHand(params);
    },
    // 导出所有
    exportAll () {
      let params = this.getParams();
      delete params.pageSize;
      delete params.pageNum;
      this.exportHand(params);
    },
    // 导出处理
    exportHand (params) {
      this.axios.post(api.exportOttoRefund, params).then(res => {
        if (res && res.data && res.data.code == 0) {
          this.$Message.success('操作成功，稍后请移步到 “导入/导出任务 -> 导出查看” 处查看');
        }
      })
    },
    // 退款申请
    refundApply(list, type) {
      this.refundOperation.list = list;
      this.refundOperation.type = type;
      this.refundOperation.visible = true;
    },
    copy(str) {
      this.$common.copyToClip(str).then(() => {
        this.$Message.success('复制成功');
      }).catch(() => {
        this.$Message.error('当前浏览器不支持复制功能');
      })
    },
    // 获取事业部
    getBusinessDeptData() {
      this.axios.get(api.get_businessDeptList).then(res => {
        if (res && res.data) {
          this.businessDeptDataList = res.data.data || [];
        }
      })
    },
    tableSelectionChange(selection) {
      this.tableSltData = selection;
    },
    // 页码切换事件
    pageNumChange(val) {
      this.searchParams.pageNum = val;
      this.getList();
    },
    // 页数切换事件
    pageSizeChange(val) {
      this.searchParams.pageSize = val;
      this.getList();
    },
    // 搜索
    search() {
      this.tableSltData = [];
      this.searchParams.pageNum = 1;
      this.getList();
    },
    // 搜索栏按钮处理
    operation(type) {
      type == 'submit' && this.search(); // 搜索
      type == 'refresh' && this.reset(); // 重置
    },
    reset() {
      this.$refs.searchParams && this.$refs.searchParams.resetFields();
    },
    getParams () {
      let params = this.$common.copy(this.searchParams);
      if (!this.$common.isEmpty(params.packageArrivalTime) && !this.$common.isEmpty(params.packageArrivalTime[0])) {
        // 包裹到仓时间根据时区减对应小时
        params.packageArrivalStartTime = this.$common.getUniversalTime(params.packageArrivalTime[0], 'fulltime');
        params.packageArrivalEndTime = this.$common.getUniversalTime(params.packageArrivalTime[1], 'fulltime');
      }
      if (!this.$common.isEmpty(params.occurredTime) && !this.$common.isEmpty(params.occurredTime[0])) {
        params.occurredStartTime = this.$common.dateTransform(params.occurredTime[0], 'fulltime');
        params.occurredEndTime = this.$common.dateTransform(params.occurredTime[1], 'fulltime');
      }
      if (!this.$common.isEmpty(params.payTime) && !this.$common.isEmpty(params.payTime[0])) {
        // 付款时间根据时区减对应小时
        params.payStartTime = this.$common.getUniversalTime(params.payTime[0], 'fulltime');
        params.payEndTime = this.$common.getUniversalTime(params.payTime[1], 'fulltime');
      }
      delete params.occurredTime
      delete params.packageArrivalTime;
      delete params.payTime;
      return this.$common.removeEmpty(params);
    },
    getList() {
      const temp = this.getParams();
      // 校验
      let orderNoList = (this.searchParams.orderNo || []).filter(k => {
        return !(/^\w+-\w+$/g.test(k));
      })
      if (orderNoList.length) {
        this.$Message.error('订单号需要使用 "店铺-订单号" 格式~');
        return;
      }
      this.tableLoading = true;
      this.axios.post(api.ott_queryOttoRefundInfo, temp).then(({ data }) => {
        if (!(data.code === 0)) return;
        const shopObj = this.shopObj;
        let list = data.datas.list || [];
        // 处理数据，懒得用render，懒得用slot，无语就一个字段，就这里处理吧！啊！累了！
        this.tableList = list.map(row => {
          const accountCode = shopObj[row.saleAccountId] ? shopObj[row.saleAccountId].accountCode : '';
          const salesRecordNumber = row.orderInfo ? row.orderInfo.salesRecordNumber : '';
          row.orderNo = accountCode + '-' + salesRecordNumber;// 店铺+订单id=订单号
          row.selfWebstoreSku = row.orderTransaction ? row.orderTransaction.webstoreSku : '';
          return row;
        })
        this.total = data.datas.total;
      }).finally(() => {
        this.tableLoading = false;
      })
    },
  }
}
</script>

<style lang="less">
.refundProcessPage {
  height: 100%;

  .flexCenter {
    display: flex;
    align-items: center;
    justify-content: center;

    .iconClick {
      cursor: pointer;
      line-height: 18px;
    }
  }

  .dyt-linkText {
    color: #2d8cf0;
  }

  .timeBlock {
    text-align: left;
    line-height: 20px;
    padding: 2px 0;

    .times {
      display: inline-block;
      width: 84px;
      text-align: right;
    }
  }
}
</style>
