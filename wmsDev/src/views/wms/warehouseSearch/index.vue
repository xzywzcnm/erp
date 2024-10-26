<template>
  <div class="warehouseSearch">
    <div class="listPage">
      <div class="searchMain">
        <Form ref="searchParams" :model="searchParams" inline :label-width="80">
          <FormItem label="仓库单状态:" class="ignore-width">
            <RadioGroup v-model="arraySearch.orderStatus" type="button" button-style="solid">
              <Radio :label="''">全部</Radio>
              <Radio :label="item.value" v-for="(item, index) in orderStatusList" :key="index">
                {{ item.label }}
              </Radio>
            </RadioGroup>
          </FormItem>
          <dyt-filter :filter-row="1" @operation="operation" ref="dyt-filter" @expand="expand">
            <FormItem label="仓库单类型:">
              <dyt-select v-model="searchParams.autoFulfillmentEf">
                <Option v-for="item in autoFulfillmentEfList" :value="item.value" :key="item.value" :label="item.label">
                </Option>
              </dyt-select>
            </FormItem>
            <FormItem label="仓库单号:">
              <dyt-inputTag v-model="searchParams.orderNumberList" :limit="1" type="textarea" />
            </FormItem>
            <FormItem label="生成日期:">
              <DatePicker type="daterange" :options="options" placement="bottom-start" placeholder="请选择"
                @on-change="sendTimeChange"
                :value="[searchParams.startOrderCreationTime, searchParams.endOrderCreationTime]" transfer></DatePicker>
            </FormItem>
            <FormItem label="出库单号:">
              <dyt-inputTag v-model="searchParams.packageCodeList" :limit="1" type="textarea" />
            </FormItem>
            <FormItem label="创建时间:">
              <DatePicker type="daterange" :options="options" placement="bottom-start" placeholder="请选择"
                @on-change="createTimeChange" :value="[searchParams.startCreateTime, searchParams.endCreateTime]"
                transfer></DatePicker>
            </FormItem>
            <FormItem label="订单号:">
              <dyt-inputTag v-model="searchParams.orderIdList" :limit="1" type="textarea" />
            </FormItem>
            <FormItem label="物流方式:">
              <dyt-select v-model="searchParams.merchantShippingMethodId">
                <Option v-for="item in merchantShippingMethodIdList" :value="item.shippingMethodId"
                  :key="item.shippingMethodId" :label="item.carrierShippingMethodName">
                </Option>
              </dyt-select>
            </FormItem>
            <FormItem label="搜索字符:">
              <dyt-input v-model="searchParams.queryKey" placeholder="买家ID,买家姓名,LAPA SKU,ItemID" />
            </FormItem>
            <FormItem label="LAPA SKU:">
              <dyt-inputTag v-model="searchParams.lapaSkuList" :limit="1" type="textarea" />
            </FormItem>
          </dyt-filter>
        </Form>
      </div>
      <!-- 功能 -->
      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <Button type="primary" @click="exportExcel" class="mr10"
              v-if="getPermission('wmsWarehouseSearch_export')">导出</Button>
            <Dropdown trigger="click" @on-click="dropChange" v-if="asyncPower" class="mr10">
              <Button type="primary">同步仓库单 <Icon type="ios-arrow-down"></Icon></Button>
              <DropdownMenu slot="list">
                <!-- <DropdownItem :name="1">同步选中仓库单</DropdownItem> -->
                <DropdownItem :name="1">同步最近7天仓库单</DropdownItem>
                <DropdownItem :name="2">同步最近15天仓库单</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <!-- <div class="alert-primary">每天凌晨03:00，自动同步最近7天仓库单数据；</div> -->
          </div>
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch(arguments)">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>
      <!-- 表格 -->
      <div class="tableMain">
        <div class="tableBox">
          <!--  @on-selection-change="selectionChange" -->
          <Table border highlight-row ref="selection" :columns="columns" :loading="tableLoading" :data="tableList"
            :height="tableHeight">
            <template slot-scope="{ row, index }" slot="orderNumber">
              <a href="javascript:;" @click="confirmDetail(row)">{{ row.orderNumber }}</a>
            </template>
            <template slot-scope="{ row, index }" slot="country">
              <!-- <span v-for="(item, index) in countryList" :key="index + 'countryList'">
                <span v-if="item.twoCode === row.country">{{ item.cnName }}</span>
              </span> -->
              <span>{{ getCountryName(row.country) }}</span>
            </template>
            <template slot-scope="{ row, index }" slot="orderStatus">
              <!-- <span v-for="(item, index) in orderStatusList" :key="index + 'orderStatusList'">
                <span v-if="item.list.includes(row.orderStatus)">{{ item.label }}</span>
              </span> -->
              <span>{{ row.orderStatus || '' }}</span>
            </template>
            <template slot-scope="{ row, index }" slot="chargeacleWeight">
              <span>{{ Number(row.chargeacleWeight || 0).toFixed(2) }}</span>
            </template>
            <template slot-scope="{ row, index }" slot="feeAmount">
              <span>{{ Number(row.feeAmount || 0).toFixed(2) }} {{ row.feeAmountCurrency || '' }}</span>
            </template>
            <template slot-scope="{ row, index }" slot="merchantShippingMethodId">
              <template v-for="(item, index) in merchantShippingMethodIdList">
                <span v-if="item.shippingMethodId === row.merchantShippingMethodId"
                  :key="index + 'merchantShippingMethodIdList2'">
                  {{ item.carrierShippingMethodName }}
                </span>
              </template>
            </template>
          </Table>
        </div>
      </div>
      <!--分页-->
      <div class="pagesMain">
        <Page :total="pageTotal" :current="searchParams.pageNum" :page-size="searchParams.pageSize" show-total
          show-sizer show-elevator @on-change="pageNumChange" @on-page-size-change="pageSizeChange"
          :page-size-opts="pageArray"></Page>
      </div>
    </div>
    <!-- 入仓详情 -->
    <search-detail :dialogVisible.sync="detailDialog.dialogVisible" :data="detailDialog.data" :countryList="countryList"
      :orderStatusList="orderStatusList" :asyncPower="asyncPower" :warehouseId="warehouseId"></search-detail>
  </div>
</template>

<script>
import api from '@/api/api';
import fetch from '@/components/mixin/fetch';
import searchDetail from './components/searchDetail';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';
import { getWarehouseId } from '@/utils/getService';

export default {
  name: 'warehouseSearch',
  mixins: [fetch, tableHeight_mixin],
  components: { searchDetail },
  data() {
    let _self = this;
    return {
      searchParams: {
        warehouseId: '',
        countryCode: '',
        orderStatus: [],
        autoFulfillmentEf: '',
        orderNumberList: [],
        startOrderCreationTime: '',
        endOrderCreationTime: '',
        packageCodeList: [],
        startCreateTime: '',
        endCreateTime: '',
        orderIdList: [],
        merchantShippingMethodId: '',
        queryKey: '',
        lapaSkuList: [],
        orderBy: 'orderCreationTime',
        upDown: 'DESC',
        pageNum: 1,
        pageSize: 50
      },
      resetOption: {
        countryCode: '',
        warehouseId: '',
        startOrderCreationTime: '',
        endOrderCreationTime: ''
      },
      arraySearch: {
        orderStatus: ''
      },
      // orderStatusList: [//仓库单状态列表
      //   { label: '全部', value: '' },
      //   { label: '待出库', value: 'Draft' },
      //   { label: '已出库', value: 'Outbound' },
      //   { label: '已签收', value: 'Delivered' },
      //   { label: '异常', value: 'Exception' },
      //   { label: '取消', value: 'Cancelled' },
      // ],
      orderStatusList: {// 仓库单状态列表
        1: {
          label: '待出库', value: 1, list: ['Draft', 'Submitted', 'Accepted', 'Create picking task', 'Picked', 'Packed']
        },
        2: {
          label: '已出库', value: 2, list: ['Outbound', 'In-delivery']
        },
        3: {
          label: '已签收', value: 3, list: ['Delivered']
        },
        4: {
          label: '异常', value: 4, list: ['Exception', 'Undeliverable return', 'failed']
        },
        5: {
          label: '取消', value: 5, list: ['Cancelled']
        }
      },
      autoFulfillmentEfList: {// 仓库单类型列表
        0: { label: '人工创建', value: 0 },
        1: { label: '自动', value: 1 }
      },
      merchantShippingMethodIdList: [], // 物流方式列表
      sortButtonList: [// 排序
        {
          sortHeader: '按生成时间',
          sortField: 'orderCreationTime',
          sortType: 'DESC',
          default: true
        }
      ],
      columns: [
        // {
        //   type: 'selection',
        //   width: 50,
        //   align: 'center'
        // },
        {
          title: '仓库单号',
          slot: 'orderNumber',
          align: 'center',
          minWidth: 140
        },
        {
          title: '生成时间',
          key: 'orderCreationTime',
          align: 'center',
          width: 120
        },
        {
          title: '类型',
          align: 'center',
          key: 'autoFulfillmentEf',
          width: 100
        },
        {
          title: '国家/地区',
          align: 'center',
          slot: 'country',
          width: 100
        },
        {
          title: '状态',
          align: 'center',
          slot: 'orderStatus',
          width: 100
        },
        {
          title: '重量(g)',
          align: 'center',
          slot: 'chargeacleWeight',
          width: 100
        },
        {
          title: '运费',
          slot: 'feeAmount',
          align: 'center',
          width: 100
        },
        {
          title: '订单号',
          key: 'orderId',
          align: 'center',
          minWidth: 120
        },
        {
          title: '出库单号',
          key: 'packageCode',
          align: 'center',
          minWidth: 120
        },
        {
          title: '创建时间',
          key: 'createTime',
          align: 'center',
          width: 120
        },
        {
          title: '买家ID/姓名',
          key: 'buyerName',
          align: 'center',
          width: 120
        }, {
          title: '物流方式',
          slot: 'merchantShippingMethodId',
          align: 'center',
          width: 120
        }, {
          title: 'SKU数量',
          key: 'skuQuantity',
          align: 'center',
          width: 120
        }, {
          title: '物品数量',
          key: 'productQuantity',
          align: 'center',
          width: 120
        }],
      detailDialog: {// 详情
        data: {},
        dialogVisible: false
      },
      // selectedList: [],//选中数据
      countryList: [],
      warehouseId: '',
      asyncPower: _self.getPermission('wmsWarehouseSearch_sync')// 同步权限
    }
  },
  created() {
    this.setParams();
    this.getTime();
    this.getCountrys();
    this.getShippingList();
    this.fetch(api.ef_wmsEfOutboundOrder_query, 'post', '');
  },
  watch: {
    'arraySearch.orderStatus': {
      handler(nval, oval) {
        let list = this.orderStatusList[nval] ? this.orderStatusList[nval].list : [];
        this.searchParams.orderStatus = list;
      },
      deep: true
    }
  },
  methods: {
    setParams() {
      let warehouseList = this.$store.state.warehouseList || [];
      let warehouseId = getWarehouseId();
      let list = warehouseList.filter(k => {
        return k.warehouseId === warehouseId;
      })
      this.resetOption.warehouseId = this.searchParams.warehouseId = this.warehouseId = warehouseId;
      this.resetOption.countryCode = this.searchParams.countryCode = list[0] && list[0].countryCode;
    },
    // 生成日期，默认值为前7天
    getTime() {
      let dayjs = this.$common.dayjs();
      this.resetOption.startOrderCreationTime = this.searchParams.startOrderCreationTime = dayjs.subtract(7, 'day').format('YYYY-MM-DD') + ' 00:00:00';
      this.resetOption.endOrderCreationTime = this.searchParams.endOrderCreationTime = dayjs.format('YYYY-MM-DD') + ' 23:59:59';
    },
    // 生成日期
    sendTimeChange(e) {
      this.searchParams.startOrderCreationTime = e[0] ? e[0] + ' 00:00:00' : '';
      this.searchParams.endOrderCreationTime = e[1] ? e[1] + ' 23:59:59' : '';
    },
    // 入仓时间
    createTimeChange(e) {
      this.searchParams.startCreateTime = e[0] ? e[0] + ' 00:00:00' : '';
      this.searchParams.endCreateTime = e[1] ? e[1] + ' 23:59:59' : '';
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(Info) {
      this.searchParams.upDown = Info[0] || 'DESC';
      this.searchParams.orderBy = Info[1] || 'orderCreationTime';
      this.fetch();
    },
    // 导出
    exportExcel() {
      this.$Modal.warning({
        title: '导出所有',
        content: '异步导出所有行的列表数据，导出任务完成后，请使用“导出查看”的功能，下载导出文件',
        loading: true,
        onOk: () => {
          let temp = this.$common.removeEmpty(this.searchParams);
          let deleteArr = ['pageNum', 'pageSize', 'orderBy', 'upDown'];
          Object.keys(temp).forEach(k => {
            if (deleteArr.includes(k)) delete temp[k];
          })
          this.axios.post(api.ef_export, temp).then(({ data }) => {
            if (!(data && data.code === 0)) return;
            this.$Message.success('导出成功~');
          }).finally(() => {
            this.$Modal.remove();
          })
        },
        onCancel: () => { }
      });
    },
    // 入仓详情
    confirmDetail(row) {
      this.detailDialog.data = row;
      this.detailDialog.dialogVisible = true;
    },
    // 表格选中
    // selectionChange(e) {
    //   this.selectedList = e;
    // },
    // 同步
    dropChange(e) {
      // if (e === 1 && !this.selectedList.length) {
      //   this.$Message.error('请勾选要同步的数据!');
      //   return;
      // }
      let temp = { 1: '最近7天', 2: '最近15天' };
      this.$Modal.confirm({
        title: '操作提示',
        content: `确认是否要同步出库单：<span style="color:#f90;">${temp[e]}</span>`,
        loading: true,
        onOk: () => {
          this.axios.post(api.ef_sync, { syncType: e, warehouseId: this.warehouseId }).then(response => {
            if (response.data.code === 0) {
              this.$Message.success('操作成功~');
              this.search();
            }
          }).finally(() => {
            this.$Modal.remove();
          })
        },
        onCancel: () => { }
      });
    },
    // 获取物流方式
    getShippingList() {
      this.axios.get(api.carrierServiceCommon + api.get_queryBindingShippingMethods, { params: { warehouseId: this.warehouseId } })
        .then(res => {
          if (res.data.code === 0) {
            this.merchantShippingMethodIdList = res.data.datas;
          }
        })
    },
    // 获取国家列表
    getCountrys() {
      if (localStorage.getItem('area') === undefined || localStorage.getItem('area') === []) localStorage.removeItem('area');
      if (localStorage.getItem('area') !== 'null' && localStorage.getItem('area')) {
        this.countryList = JSON.parse(localStorage.getItem('area'));
      } else {
        this.axios.get(api.get_countrys).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            this.countryList = data;
            localStorage.setItem('area', JSON.stringify(data));
          }
        });
      }
    },
    // 处理国家名称
    getCountryName(country) {
      let list = this.countryList.filter(k => {
        return k.twoCode === country;
      })
      if (list.length) return list[0].cnName;
      return country;
    }
  }
}
</script>

<style lang="less">
.warehouseSearch {
  height: 100%;
  position: relative;
}
</style>
