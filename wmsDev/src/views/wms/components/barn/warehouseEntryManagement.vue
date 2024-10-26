<template>
  <div class="warehouseEntryManagementPage">
    <div class="listPage">
      <div class="searchMain">
        <Form ref="searchParams" :model="searchParams" :label-width="100">
          <Form-item label="状态:" class="ignore-width" prop="status">
            <RadioGroup v-model="searchParams.status" type="button" button-style="solid" @on-change="search">
              <Radio :label="item.value" v-for="(item, index) in wareStatusList" :key="index + 'status'">
                {{ item.label }}
              </Radio>
            </RadioGroup>
          </Form-item>
          <dyt-filter ref="records-filter" @expand="expand">
            <Form-item label="海外入库单:" prop="receiptNo">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.receiptNo" />
            </Form-item>
            <Form-item label="LAPA出库单号:" prop="lapaPickingNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.lapaPickingNoList" />
            </Form-item>
            <Form-item label="创建时间:" prop="createdTime">
              <DatePicker type="daterange" transfer placeholder="选择日期" style="width: 100%"
                v-model.trim="paramsOthers.createdTime" format="yyyy-MM-dd" @on-change="createdChange"></DatePicker>
            </Form-item>
            <Form-item label="跟踪号:" prop="trackingNumber">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.trackingNumber" />
            </Form-item>
            <Form-item label="入库时间:" prop="inStorageTime">
              <DatePicker type="daterange" transfer placeholder="选择日期" style="width: 100%"
                v-model.trim="paramsOthers.inStorageTime" format="yyyy-MM-dd" @on-change="inStorageChange"></DatePicker>
            </Form-item>
            <Form-item label="运输方式:" prop="shippingType">
              <dyt-select v-model="searchParams.shippingType">
                <Option v-for="(item, index) in expressList" :value="item.value" :key="index + 'shippingType'"
                  :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="有外箱标签:" prop="isLabelPath">
              <dyt-select v-model="searchParams.isLabelPath">
                <Option v-for="(item, index) in boxLabelList" :value="item.value" :key="index + 'isLabelPath'"
                  :label="item.label">
                </Option>
              </dyt-select>
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
            <!-- <Button type="primary" class="mr10">导入费用</Button> -->
            <Button type="primary" @click="syncMoadl = true" v-if="!getPermission('wmsWareEntryManage_sync')"
              style="margin-right:10px">同步海外入库单</Button>
            <Modal title="操作提示" v-model="syncMoadl" width="600px">
              <div class="confirm">i</div>
              <span>确认是否要同步海外入库单？</span>
              <div slot="footer">
                <Button type="primary" @click="syncWareHouseOrder" :loading="syncLoading">
                  确 定
                </Button>
                <Button @click="syncMoadl = false">取 消</Button>
              </div>
            </Modal>
            <Button type="primary" @click="exportAll" v-if="getPermission('wmsWareEntryManage_export')">导出</Button>
          </div>
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>
      <!--表格-->
      <div class="tableMain">
        <div class="tableBox warehouseEntryManagementTable" :class="tableBoxClass">
          <Table highlight-row border :loading="tableLoading" :columns="columns" :data="tableList" ref="selection"
            :height="tableHeight">
            <template slot-scope="{ row }" slot="receiptNo">
              <span class="linkText cursorClick" @click="seefeeDetail(row, 'detail')">{{ row.receiptNo || '' }}</span>
              <div style="margin: 0 -2px;">
                <span class="dyt-tags dyt-tags-green mr10" title="海外入库单状态"
                  v-if="receiptStatusList[row.receiptSyncStatus]">
                  {{ receiptStatusList[row.receiptSyncStatus].label }}
                </span>
                <span class="dyt-tags dyt-tags-blue mr10" v-if="expressList[row.shippingType]">
                  {{ expressList[row.shippingType].label }}
                </span>
              </div>
            </template>
            <template slot-scope="{ row }" slot="lapaPickingNo">
              <span v-if="row.lapaPickingNo">
                <div v-for="(item, index) in row.lapaPickingNo.split(',')" :key="index">
                  {{ item || '' }}
                </div>
              </span>
            </template>
            <template slot-scope="{ row }" slot="deliverGoods">
              <div>{{ row.deliverBoxNumber || 0 }}</div>
              <div>{{ row.deliverPieceNumber || 0 }}</div>
            </template>
            <template slot-scope="{ row }" slot="prediction">
              <div>{{ row.forecastBoxQuantity || 0 }}</div>
              <div>{{ row.forecastSkuQuantity || 0 }}</div>
            </template>
            <template slot-scope="{ row }" slot="receipt">
              <div>{{ row.receiveBoxNumber || 0 }}</div>
              <div>{{ row.receivePieceNumber || 0 }}</div>
            </template>
            <template slot-scope="{ row }" slot="onshelf">
              <div>{{ row.shelvesBoxQuantity || 0 }}</div>
              <div>{{ row.shelvesPieceQuantity || 0 }}</div>
            </template>
            <template slot-scope="{ row }" slot="labelPath">
              <div class="linkText cursorClick" @click="seeLabel(row)">{{ row.labelName || '未获取' }}</div>
              <div class="line-tooltip mt4" v-if="row.remark">
                <Tooltip max-width="400" placement="top" :content="row.remark" transfer
                  transfer-class-name="self-tooltip">
                  <div class="overEllipsis">{{ row.remark || '' }}</div>
                </Tooltip>
              </div>
            </template>
            <template slot-scope="{ row }" slot="gcCreatedTime">
              <div class="timeWidth">{{ row.gcCreatedTime || '' }}</div>
            </template>
            <template slot-scope="{ row }" slot="receiptTime">
              <div class="timeWidth">{{ row.receiptTime || '' }}</div>
            </template>
            <template slot-scope="{ row }" slot="action">
              <!-- 草稿可以进行修改跟踪号操作 -->
              <div class="unlinkText cursorClick operatBtn" @click="modifyTrackNo(row)"
                v-if="['0'].includes(row.receiptSyncStatus) && getPermission('wmsWareEntryManage_trackNumEdit')">
                修改追踪号
              </div>
              <!-- 可以进行操作的状态：待入库，入库中，完成入库； -->
              <div class="unlinkText cursorClick operatBtn" @click="seefeeDetail(row, 'edit')"
                v-if="row.receiptSyncStatus && !['100'].includes(row.receiptSyncStatus) && getPermission('wmsWareEntryManage_feeEdit')">
                修改费用
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
    <!-- 费用详情 -->
    <feeDetail :dialogVisible.sync="feeDetail.visible" :modalData="feeDetail.data" :modalType="feeDetail.type"
      @search="search" />
    <!-- 外箱标签 -->
    <outBoxLabel :dialogVisible.sync="outboxLabel.visible" :modalData="outboxLabel.data" @search="search" />
    <!-- 修改追踪号 -->
    <modifyTrackNumber :dialogVisible.sync="trackInfo.visible" :modalData="trackInfo.data" @search="search" />
    <!-- 导入费用 -->
    <!-- <upload-common v-model="uploadInfo.fileList" :uploadApi="uploadInfo.uploadApi"
      @successUpload="successUpload"></upload-common> -->
  </div>
</template>
<script>
import api from '@/api/api';
import dayjs from 'dayjs';
import { wareStatusList, expressList, receiptStatusList } from './warehouse/fileData.js';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';
import feeDetail from './warehouse/feeDetail.vue';
import outBoxLabel from './warehouse/outBoxLabel.vue';
import modifyTrackNumber from './warehouse/modifyTrackNumber.vue';
import permission_mixin from '@/components/mixin/permission_mixin';
// import uploadCommon from '@/views/wms/stockOUt/otherStouck/components/uploadCommon.vue';

export default {
  name: 'warehouseEntryManagement',
  mixins: [tableHeight_mixin, permission_mixin],
  components: { feeDetail, outBoxLabel, modifyTrackNumber },
  data() {
    return {
      searchParams: {
        status: '',
        receiptNo: [],
        lapaPickingNoList: [],
        trackingNumber: [],
        startCreatedTime: '',
        endCreatedTime: '',
        startReceiptTime: '',
        endReceiptTime: '',
        shippingType: '',
        isLabelPath: '',
        warehouseId: this.$store.state.warehouseId,
        orderBy: 'DESC',
        flag: '0',
        pageNum: 1,
        pageSize: 10,
      },
      paramsOthers: {
        createdTime: [],
        inStorageTime: [],
      },
      sortButtonList: [
        {
          sortHeader: '按创建时间',
          sortField: '0',
          sortType: 'DESC',
          default: true,
        },
        {
          sortHeader: '按入库时间',
          sortField: '1',
          sortType: 'DESC',
        },
      ],
      tableLoading: false,
      columns: [
        // {
        //   type: 'selection',
        //   width: 50,
        //   align: 'left'
        // },
        {
          title: '海外入库单号',
          slot: 'receiptNo',
          minWidth: 190,
          align: 'left',
        },
        {
          title: 'LAPA出库单号',
          slot: 'lapaPickingNo',
          minWidth: 150,
          align: 'left',
        },
        {
          title: '跟踪号',
          key: 'trackingNumber',
          minWidth: 120,
          align: 'left',
        },
        {
          width: 80,
          align: 'left',
          slot: 'deliverGoods',
          renderHeader(h, params) {
            return h('div', [
              h('div', '发货'),
              h('div', '箱数/件数'),
            ])
          },
        },
        {
          width: 80,
          align: 'left',
          slot: 'prediction',
          renderHeader(h, params) {
            return h('div', [
              h('div', '预报'),
              h('div', '箱数/件数'),
            ])
          },
        },
        {
          width: 80,
          align: 'left',
          slot: 'receipt',
          renderHeader(h, params) {
            return h('div', [
              h('div', '收货'),
              h('div', '箱数/件数'),
            ])
          },
        },
        {
          width: 80,
          align: 'left',
          slot: 'onshelf',
          renderHeader(h, params) {
            return h('div', [
              h('div', '上架'),
              h('div', '箱数/件数'),
            ])
          },
        },
        {
          title: '采购成本',
          key: 'purchaseCost',
          width: 80,
          align: 'left',
        },
        {
          title: '增值费用',
          key: 'addedValueCost',
          width: 80,
          align: 'left',
        },
        {
          title: '头程费用',
          key: 'headTripCost',
          width: 80,
          align: 'left',
        },
        {
          title: '关税费用',
          key: 'tariffCost',
          width: 80,
          align: 'left',
        },
        {
          title: '外箱标签/备注',
          slot: 'labelPath',
          minWidth: 140,
          align: 'left',
        },
        {
          title: '创建时间',
          slot: 'gcCreatedTime',
          width: 84,
          align: 'left',
        },
        {
          title: '入库日期',
          slot: 'receiptTime',
          width: 84,
          align: 'left',
        },
        {
          title: '操作',
          slot: 'action',
          width: 90,
          align: 'left',
          fixed: 'right',
        },
      ],
      tableList: [],
      // tableCheckedList: [], // 勾选表格
      wareStatusList: wareStatusList, // 下单状态
      totalRecords: 0, // 总页数
      feeDetail: {// 修改追踪号
        type: '',
        visible: false,
        data: {},
      },
      trackInfo: {// 修改追踪号
        visible: false,
        data: {},
      },
      expressList: expressList, // 运输方式
      boxLabelList: {// 是否有货箱标签
        0: { label: '无', value: 0 },
        1: { label: '有', value: 1 },
      },
      outboxLabel: {// 外箱标签
        visible: false,
        data: {},
      },
      // uploadInfo: {
      //   fileList: [],
      //   uploadApi: '',
      // },
      receiptStatusList: receiptStatusList,
      syncMoadl: false,
      syncLoading: false
    }
  },
  created() {
    this.init();
    this.search();
  },
  methods: {
    init() {
      let secondDay = dayjs().subtract(6, 'day').format('YYYY-MM-DD') + ' 00:00:00';
      let today = dayjs().format('YYYY-MM-DD') + ' 23:59:59';
      this.paramsOthers.createdTime = [secondDay, today];// 完成装箱时间，默认值为前7天
      this.searchParams.startCreatedTime = secondDay;
      this.searchParams.endCreatedTime = today;

      this.paramsOthers.inStorageTime = [];
      this.searchParams.startReceiptTime = this.searchParams.endReceiptTime = '';
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
      this.axios.post(api.queryWarehouseManageList, params).then(({ data }) => {
        if (data.code !== 0) return;
        let datas = data.datas || {};
        this.tableList = (datas.list || []).map(k => {
          if (k.labelPath) {
            let list = k.labelPath.split('/');
            k.labelName = list[list.length - 1];
            k.labelPath = this.$common.splicingPath(k.labelPath);
          }
          return k;
        });
        this.totalRecords = datas.total || 0;
      }).finally(() => {
        this.tableLoading = false;
      });
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.searchParams.orderBy = type;
      this.searchParams.flag = feild;
      this.search();
    },
    // // 表格勾选
    // checkedDataHandel(data) {
    //   this.tableCheckedList = data;
    // },
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
          params.warehouseId = this.$store.state.warehouseId;
          delete params.pageNum;
          delete params.pageSize;
          this.axios.post(api.exportWarehouseManageList, params).then(({ data }) => {
            if (data.code !== 0) return;
            this.$Message.success('导出成功~');
          }).finally(() => {
            this.$Modal.remove();
          });
        }
      });
    },
    // 同步海外仓入库单
    syncWareHouseOrder() {
      this.syncLoading = true
      this.axios.get(`${api.syncWarehouseOrder}?warehouseId=${this.$store.state.warehouseId}`).then(({ data }) => {
        if (data.code !== 0) return;
        this.$Message.success('同步成功');
      }).finally(() => {
        this.syncLoading = false
        this.syncMoadl = false
      });
    },
    // 修改追踪号
    modifyTrackNo(row) {
      this.trackInfo.data = this.$common.copy(row);
      this.trackInfo.visible = true;
    },
    // 查看出库单详情
    seefeeDetail(row, type) {
      this.feeDetail.type = type;
      this.feeDetail.data = this.$common.copy(row);
      this.feeDetail.visible = true;
    },
    seeLabel(row) {
      this.outboxLabel.data = this.$common.copy(row);
      this.outboxLabel.visible = true;
    },
    // // 上传完成
    // successUpload(e) {
    //   console.log(e);
    // },
    createdChange(e) {
      this.searchParams.startCreatedTime = e[0] ? e[0] + ' 00:00:00' : '';
      this.searchParams.endCreatedTime = e[1] ? e[1] + ' 23:59:59' : '';
    },
    inStorageChange(e) {
      this.searchParams.startReceiptTime = e[0] ? e[0] + ' 00:00:00' : '';
      this.searchParams.endReceiptTime = e[1] ? e[1] + ' 23:59:59' : '';
    },
  },
}
</script>
<style lang="less">
.warehouseEntryManagementPage {
  position: relative;
  overflow: hidden;
  height: 100%;

  .operatBtn {
    margin: 2px 0;
  }
}

.confirm {
  width: 25px;
  height: 25px;
  margin-right: 15px;
  background-color: #ff9900;
  display: inline-block;
  font-size: 20px;
  font-weight: 700;
  color: white;
  line-height: 25px;
  text-align: center;
  border-radius: 50%;
}
</style>