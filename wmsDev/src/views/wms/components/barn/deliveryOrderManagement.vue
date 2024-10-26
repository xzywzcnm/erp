<template>
  <div class="deliveryOrderManagementPage">
    <div class="listPage">
      <div class="searchMain">
        <Form ref="searchParams" :model="searchParams" :label-width="100">
          <Form-item label="状态:" class="ignore-width" prop="pickingStatus">
            <RadioGroup v-model="searchParams.pickingStatus" type="button" button-style="solid" @on-change="search">
              <Radio :label="item.value" v-for="(item, index) in statusList" :key="index + 'pickingStatus'">
                {{ item.label }}
              </Radio>
            </RadioGroup>
          </Form-item>
          <dyt-filter ref="records-filter" @expand="expand">
            <Form-item label="海外出库单:" prop="pickingNo">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.pickingNo" />
            </Form-item>
            <Form-item label="订单号:" prop="orderNo">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.orderNo" />
            </Form-item>
            <Form-item label="创建日期:" prop="createdTime">
              <DatePicker type="daterange" transfer placeholder="选择日期" style="width: 100%"
                v-model.trim="paramsOthers.createdTime" format="yyyy-MM-dd" @on-change="timeChange"></DatePicker>
            </Form-item>
            <Form-item label="LAPA出库单:" prop="packageCode">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.packageCode" />
            </Form-item>
            <Form-item label="平台:" prop="platform">
              <dyt-select v-model="searchParams.platform">
                <Option v-for="(item, index) in platformList" :value="item.platformId" :key="index + 'platform'"
                  :label="item.name">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="出库日期:" prop="deliveryTime">
              <DatePicker type="daterange" transfer placeholder="选择日期" style="width: 100%"
                v-model.trim="paramsOthers.deliveryTime" format="yyyy-MM-dd" @on-change="deliveryChange"></DatePicker>
            </Form-item>
            <Form-item label="商品编码:" prop="goodSku">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.goodSku" />
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
          <div>
            <Button type="primary" @click="exportAll" class="mr10"
              v-if="getPermission('wmsDeliOrderManage_export')">导出</Button>
            <dyt-dropdown trigger="click" :dropdown-list="synDeliveryList" :loading="synDeliveryLoading"
              @commandChange="synDeliveryChange" class="mr10" v-if="getPermission('wmsDeliOrderManage_syncOseaOrder')" />
            <!-- <Button type="primary" @click="autoMatchOrder" :disabled="autoPickOrder"
              v-if="getPermission('wmsDeliOrderManage_matchOrder')">自动匹配入库单</Button> -->
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
            :data="tableList" ref="selection" :height="tableHeight" class="deliveryTable">
            <template slot-scope="{ row }" slot="pickingNo">
              <span class="linkText cursorClick" @click="seeDetail(row)">{{ row.pickingNo || '' }}</span>
              <div>
                <span class="dyt-tags dyt-tags-blue mr10" v-if="row.consigneeCountryCode" title="地区">
                  {{ row.consigneeCountryCode }}
                </span>
                <span v-for="(item, index) in statusList" :key="index">
                  <span class="dyt-tags dyt-tags-green" v-if="row.pickingStatus === item.value" title="状态">
                    {{ item.label }}
                  </span>
                </span>
              </div>
            </template>
            <template slot-scope="{ row }" slot="goodsUrl">
              <div class="picture-width" v-if="row.goodsUrl">
                <dyt-previewImg :fileList="returnList(row)"
                  :imgOption="{ listWidth: 40, listHeight: 40, mode: 'multiple' }">
                </dyt-previewImg>
              </div>
            </template>
            <template slot-scope="{ row }" slot="goodsAndQuantity">
              <div v-if="row.goodsAndQuantity">
                <div v-for="(item, index) in row.goodsAndQuantity.split(',')" :key="index + 'goodsAndQuantity'">
                  {{ item }}
                </div>
              </div>
            </template>
            <template slot-scope="{ row }" slot="createdTime">
              <div class="timeWidth">{{ row.createdTime || '' }}</div>
            </template>
            <template slot-scope="{ row }" slot="dateShipping">
              <div class="timeWidth">{{ row.dateShipping || '' }}</div>
            </template>
            <template slot-scope="{ row }" slot="receiptNo">
              <div v-if="[0, 1, '0', '1'].includes(row.isMatch)">{{ isMatchList[row.isMatch].label }}</div>
              <div v-if="[2, '2'].includes(row.isMatch) && row.receiptNo">
                <div v-for="(item, index) in row.receiptNo.split(',')" :key="index">{{ item }}</div>
              </div>
            </template>
            <template slot-scope="{ row }" slot="purchaseCost">
              <div>{{ row.purchaseCost || 0 }}</div>
            </template>
            <template slot-scope="{ row }" slot="addedValueCost">
              <div>{{ row.addedValueCost || 0 }}</div>
            </template>
            <template slot-scope="{ row }" slot="headTripCost">
              <div>{{ row.headTripCost || 0 }}</div>
            </template>
            <template slot-scope="{ row }" slot="tariffCost">
              <div>{{ row.tariffCost || 0 }}</div>
            </template>
            <template slot-scope="{ row }" slot="totalFee">
              <div>{{ row.totalFeeCny || 0 }}</div>
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
    <inventoryDetail :dialogVisible.sync="detail.visible" :modalData="detail.data"></inventoryDetail>
  </div>
</template>
<script>
import api from '@/api/api';
import dayjs from 'dayjs';
import { statusList } from './inventoryManage/fileData.js';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';
import inventoryDetail from './inventoryManage/inventoryDetail.vue';
import permission_mixin from '@/components/mixin/permission_mixin';
export default {
  name: 'deliveryOrderManagement',
  mixins: [tableHeight_mixin, permission_mixin],
  components: { inventoryDetail },
  data() {
    return {
      searchParams: {
        pickingStatus: '',
        pickingNo: [],
        orderNo: [],
        startCreatedTime: '',
        endCreatedTime: '',
        startDateShipping: '',
        endDateShipping: '',
        packageCode: [],
        platform: '',
        goodSku: [],
        warehouseId: this.$store.state.warehouseId,
        orderBy: 'DESC',
        orderField: '0',
        pageNum: 1,
        pageSize: 10,
      },
      paramsOthers: {
        createdTime: [],
        deliveryTime: [],
      },
      statusList: statusList,
      platformList: [],
      sortButtonList: [
        {
          sortHeader: '按创建时间',
          sortField: '0',
          sortType: 'DESC',
          default: true,
        },
      ],
      tableLoading: false,
      columns: [
        {
          type: 'selection',
          width: 50,
          align: 'center',
        },
        {
          title: '海外出库单号',
          slot: 'pickingNo',
          minWidth: 180,
          align: 'left',
        },
        {
          title: '产品图片',
          slot: 'goodsUrl',
          width: 100,
          align: 'center',
        },
        {
          title: '商品*数量',
          slot: 'goodsAndQuantity',
          width: 160,
          align: 'center',
        },
        {
          title: '平台',
          key: 'platform',
          width: 100,
          align: 'center',
        },
        {
          title: '创建时间',
          slot: 'createdTime',
          width: 100,
          align: 'center',
        },
        {
          title: '出库时间',
          slot: 'dateShipping',
          width: 100,
          align: 'center',
        },
        {
          title: '订单号',
          key: 'orderNo',
          width: 100,
          align: 'center',
        },
        {
          title: 'LAPA出库单号',
          key: 'packageCode',
          minWidth: 110,
          align: 'center',
        },
        {
          title: '重量(g)',
          key: 'orderWeight',
          width: 80,
          align: 'center',
        },
        {
          title: '匹配入库单',
          slot: 'receiptNo',
          width: 100,
          align: 'center',
        },
        {
          title: '采购价',
          slot: 'purchaseCost',
          width: 90,
          align: 'center',
        },
        {
          title: '增值费',
          slot: 'addedValueCost',
          width: 90,
          align: 'center',
        },
        {
          title: '头程费',
          slot: 'headTripCost',
          width: 90,
          align: 'center',
        },
        {
          title: '关税费',
          slot: 'tariffCost',
          width: 90,
          align: 'center',
        },
        {
          title: '海外仓费用',
          slot: 'totalFee',
          width: 100,
          align: 'center',
        },
      ],
      tableList: [],
      tableCheckedList: [],
      totalRecords: 0,
      detail: {
        visible: false,
        data: {},
      },
      synDeliveryLoading: false,
      isMatchList: {
        0: { label: '未匹配', value: 0 },
        1: { label: '部分匹配', value: 1 },
        2: { label: '匹配', value: 2 },
      },
    }
  },
  created() {
    this.init();
    this.getPlatformList();
    this.search();
  },
  computed: {
    synDeliveryList() {
      // let power = this.getPermission('qualityManage_order_exprotAll');
      let power = true;
      return [
        {
          label: "更新海外出库单",
          power: power,
        },
        {
          label: "更新选中出库单",
          power: power,
          command: 0,
          disabled: !this.tableCheckedList.length,
        },
        {
          label: "更新最近7天出库单",
          power: power,
          command: 1,
        },
        {
          label: "更新最近15天出库单",
          power: power,
          command: 2,
        }
      ]
    },
    // autoPickOrder() {
    //   let list = (this.tableCheckedList || []).filter(k => [2, '2'].includes(k.isMatch));
    //   return !!(!this.tableCheckedList.length || list.length);
    // },
  },
  methods: {
    // 默认前七天(也等于重置时间)
    init() {
      let secondDay = dayjs().subtract(6, 'day').format('YYYY-MM-DD') + ' 00:00:00';
      let today = dayjs().format('YYYY-MM-DD') + ' 23:59:59';
      this.paramsOthers.createdTime = [secondDay, today];// 完成装箱时间，默认值为前7天
      this.searchParams.startCreatedTime = secondDay;
      this.searchParams.endCreatedTime = today;

      this.paramsOthers.deliveryTime = [];
      this.searchParams.startDateShipping = this.searchParams.endDateShipping = '';
    },
    expand() { },
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
      let params = this.$common.removeEmpty(this.searchParams);
      this.tableLoading = true;
      this.axios.post(api.queryOverseasManageList, params).then(({ data }) => {
        if (data.code !== 0) return;
        let datas = data.datas || {};
        this.tableList = datas.list || [];
        this.totalRecords = datas.total || 0;
      }).finally(() => {
        this.tableLoading = false;
        this.tableCheckedList = [];// 重置
      });
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.searchParams.orderField = feild;
      this.searchParams.orderBy = type;
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
    // 查看出库单详情
    seeDetail(row) {
      this.detail.data = this.$common.copy(row);
      this.detail.visible = true;
    },
    // 导出所有
    exportAll() {
      if (!this.totalRecords) {
        this.$Message.warning('无数据~');
        return false;
      }
      this.$Modal.confirm({
        title: '导出所有',
        content: '<p>异步导出所有行的列表数据，导出任务完成后，请使用“导出查看”的功能，下载导出文件；</p>',
        loading: true,
        onOk: () => {
          let params = this.$common.removeEmpty(this.searchParams);
          // params.warehouseId = this.warehouseId;
          delete params.pageNum;
          delete params.pageSize;
          // console.log(this.warehouseId)
          this.axios.post(api.exportOverseasManageList, params).then(({ data }) => {
            if (data.code !== 0) return;
            this.$Message.success('导出成功');
          }).finally(() => {
            this.$Modal.remove();
          });
        }
      });
    },
    // 创建时间
    timeChange(e) {
      this.searchParams.startCreatedTime = e[0] ? e[0] + ' 00:00:00' : '';
      this.searchParams.endCreatedTime = e[1] ? e[1] + ' 23:59:59' : '';
    },
    // 出库时间
    deliveryChange(e) {
      this.searchParams.startDateShipping = e[0] ? e[0] + ' 00:00:00' : '';
      this.searchParams.endDateShipping = e[1] ? e[1] + ' 23:59:59' : '';
    },
    // 更新海外出库单
    synDeliveryChange(e) {
      if (![0, 1, 2].includes(e)) return;
      let [tips, temp] = ['', {}];
      let strObj = { 1: '7', 2: '15' };
      if (e === 0) {
        let tableCheckedList = this.tableCheckedList;
        tips = `确认是否更新选中出库单：<span style="color:#FF9900;">${tableCheckedList.length}</span>`;
        temp.pickingNoList = tableCheckedList.map(k => k.pickingNo);
      } else {
        tips = `确认是否要更新出库单：<span style="color:#FF9900;">最近${strObj[e]}天</span>`;
      }
      temp.type = e;
      temp.warehouseId = this.searchParams.warehouseId;
      // console.log(temp)
      this.$Modal.confirm({
        title: '操作提示',
        content: tips,
        loading: true,
        onOk: () => {
          this.axios.post(api.autoGetReceipt, temp).then(({ data }) => {
            if (data.code !== 0) return;
            this.$Message.success('操作成功~');
            this.search();
          }).finally(() => {
            this.$Modal.remove();
          });
        }
      });
    },
    // // 自动匹配入库单
    // autoMatchOrder() {
    //   this.$Modal.confirm({
    //     title: '操作提示',
    //     content: `确认是否要自动匹配入库单`,
    //     loading: true,
    //     onOk: () => {
    //       let pickingNoList = this.tableCheckedList.map(k => k.pickingNo);
    //       this.axios.post(`${api.autoMatchReceipt}?warehouseId=${this.searchParams.warehouseId}`, pickingNoList)
    //         .then(({ data }) => {
    //           if (data.code !== 0) return;
    //           this.$Message.success('操作成功~');
    //           this.search();
    //         }).finally(() => {
    //           this.$Modal.remove();
    //         });
    //     }
    //   });
    // },
    // 获取开启的平台
    getPlatformList() {
      this.axios.get(api.get_queryByStatus + '?status=1').then(({ data }) => {
        if (data.code !== 0) return;
        this.platformList = (data.datas || []).filter(k => k.type == 1);
      })
    },
    // 处理图片列表
    returnList(row) {
      let picArr = row.goodsUrl.split(',');
      let list = picArr.filter(k => k).map((k) => { return { url: k } });
      return list;
    },
  },
}
</script>
<style lang="less">
.deliveryOrderManagementPage {
  position: relative;
  overflow: hidden;
  height: 100%;

  .errorText {
    color: #ed4014;
  }
}
</style>