<template>
  <div class="qualityInspectionRecords-page">
    <div class="listPage">
      <div class="searchMain">
        <Form ref="pageParams" :model="pageParams" :label-width="100">
          <dyt-filter ref="records-filter" @expand="expand">
            <Form-item label="质检状态:" prop="checkStatusList">
              <dyt-select v-model="pageParams.checkStatusList" multiple>
                <Option v-for="(item, index) in checkStatusListArr" :value="item.value" :key="index + 'checkStatusList'"
                  :label="item.olabel">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="入库单号:" prop="receiptNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.receiptNoList"
                placeholder="多个请用逗号或回车分隔" />
              <!-- <Input v-model="pageParams.receiptNo"></Input> -->
            </Form-item>
            <Form-item label="质检时间：" v-if="pageParams.checkStatusList[0] === '2'">
              <DatePicker type="daterange" transfer placeholder="选择日期" style="width: 100%"
                :value="[pageParams.startTime, pageParams.endTime]" @on-change="createTimeChange">
              </DatePicker>
            </Form-item>
            <Form-item label="批次号:" prop="receiptBatchNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.receiptBatchNoList"
                placeholder="多个请用逗号或回车分隔" />
              <!-- <Input v-model="pageParams.receiptBatchNo"></Input> -->
            </Form-item>
            <Form-item label="SKU/条码编码:" prop="skuOrBarCodeList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.skuOrBarCodeList"
                placeholder="多个请用逗号或回车分隔" />
              <!-- <Input v-model="pageParams.scanSkuOrBarCode"></Input> -->
            </Form-item>
            <Form-item label="质检员:" prop="checkCreatedByList">
              <dyt-select v-model="pageParams.checkCreatedByList" placeholder="选择质检人" :multiple="true" :max-tag-count="1">
                <Option v-for="(item, index) in qualityPersonList" :value="item.checkCreatedBy"
                  :label="item.checkCreatedByName" :key="index + 'checkCreatedBy'">
                </Option>
              </dyt-select>
            </Form-item>
            <FormItem label="供应商:" prop="supplierNameList">
              <dyt-select v-model="pageParams.supplierNameList" :multiple="true" :max-tag-count="1">
                <Option v-for="(item, index) in supplierList" :value="item.supplierName" :key="index + 'supplierName'"
                  :label="item.supplierName"></Option>
              </dyt-select>
            </FormItem>
            <FormItem label="采购员:" prop="purchaserIdList">
              <dyt-select v-model="pageParams.purchaserIdList" :multiple="true" :max-tag-count="1">
                <Option v-for="(item, index) in purchaserList" :value="item.userId" :label="item.userName"
                  :key="index + 'purchaserId'">
                </Option>
              </dyt-select>
            </FormItem>
            <Form-item label="创建时间：" prop="createdTime">
              <DatePicker type="datetimerange" transfer placeholder="请选择创建时间" style="width: 100%"
                format="yyyy-MM-dd HH:mm:ss" v-model="pageParams.createdTime">
              </DatePicker>
            </Form-item>
            <FormItem label="所属事业部:" prop="businessDeptIdList">
              <dyt-select v-model="pageParams.businessDeptIdList" :multiple="true" :max-tag-count="1">
                <Option v-for="(item, index) in businessDeptList" :value="item.id" :label="item.name"
                  :key="`busines-${index}`" />
              </dyt-select>
            </FormItem>
            <FormItem label="类型:" prop="qualityInspectionTypeList">
              <dyt-select :max-tag-count="1" :multiple="true"  v-model="pageParams.qualityInspectionTypeList">
                <Option :value="0" label="质检"></Option>
                <Option :value="1" label="维修"></Option>
              </dyt-select>
            </FormItem>
            <div slot="operation">
              <Button type="primary" @click="checkSearch" icon="ios-search" class="mr10">查询</Button>
              <Button @click="reset" v-once icon="md-refresh">重置</Button>
            </div>
          </dyt-filter>
        </Form>
      </div>
      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <dyt-dropdown trigger="click" :dropdown-list="submitQualityList" @commandChange="qualityResult"
              :loading="qualityLoading" />
            <dyt-dropdown class="ml10" trigger="click" :dropdown-list="exportList" @commandChange="exportResult"
              :loading="exportLoading" />
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
            <template slot-scope="{ row}" slot="receiptBatchNo">
              <span class="linkText cursorClick" @click="seeInspectionDetail(row)">{{ row.receiptBatchNo || '' }}</span>
            </template>
            <template slot-scope="{ row}" slot="checkStatus">
              <span>
                {{ checkStatusListArr[row.checkStatus] && checkStatusListArr[row.checkStatus].olabel }}
              </span>
            </template>
            <template slot-scope="{ row}" slot="receiptNo">
              <span class="linkText cursorClick" @click="seePickingNoDetail(row)">{{ row.receiptNo || '' }}</span>
            </template>
            <template slot-scope="{ row}" slot="picture">
              <dyt-previewImg :url="row.goodsUrl"></dyt-previewImg>
            </template>
            <template slot-scope="{ row}" slot="goodsSku">
              <Icon type="ios-shuffle" class="shuffle-icon" v-if="row.transitStatus === 1" />
              <div>{{ row.goodsSku || '' }}</div>
              <div>{{ row.barCode || '' }}</div>
            </template>
            <template slot-scope="{ row }" slot="checkRate">
              <span>{{ row.checkRate || 0 }}%</span>
            </template>
            <template slot-scope="{ row }" slot="createdTime">
              <span>{{ $uDate.dealTime(row.createdTime) }}</span>
            </template>
            <template slot-scope="{ row}" slot="action">
              <!--  && getPermission('qualityManage_record_qualityTest') -->
              <span class="unlinkText cursorClick" @click="goodQualityFun(row)"
                v-if="['0', '1'].includes(row.checkStatus) && !row.qualityInspectionType">质检</span>
            </template>
          </Table>
        </div>
      </div>
      <!--分页按钮-->
      <div class="pagesMain">
        <dyt-pagination :total="totalRecords" :current="pageParams.pageNum" :page-size="pageParams.pageSize"
          @on-change="changePage" @on-page-size-change="changePageSize"></dyt-pagination>
      </div>
    </div>
    <!-- 质检详情 -->
    <quality-inspection-details :modelVisible.sync="inspectVisible" :modalData="inspectData" :warehouseId="warehouseId">
    </quality-inspection-details>
    <!-- 入库单详情 -->
    <warehouse-order-details :dialogVisible.sync="warehouseOrderVisible" :modalData="warehouseOrderData">
    </warehouse-order-details>
    <!-- 批量提交质检单 -->
    <batch-quality-inspection :modelVisible.sync="batchQualityVisible" :modalData="batchQualityList"
      @checkSearch="checkSearch">
    </batch-quality-inspection>
  </div>
</template>
<script>
import api from '@/api/api';
import permission_mixin from '@/components/mixin/permission_mixin';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';
import qualityInspectionDetails from './qualityInspectionDetails';
import warehouseOrderDetails from './warehouseOrderDetails';
import { checkStatusList } from './commonData.js';
import batchQualityInspection from './batchQualityInspection';
export default {
  name: "qualityInspectionRecords",
  components: { qualityInspectionDetails, warehouseOrderDetails, batchQualityInspection },
  mixins: [permission_mixin, tableHeight_mixin],
  props: {
    warehouseId: {// 仓库id
      type: String,
      default() { return '' }
    },
    sku: {// 质检页面的sku
      type: String,
      default() { return '' }
    },
    tab: {
      type: String,
      default() { return '' }
    },
  },
  data() {
    return {
      pageParams: {
        checkStatusList: [], // 质检状态
        receiptNoList: [], // 入库单号
        receiptBatchNoList: [], // 批次号
        skuOrBarCodeList: [], // sku
        checkCreatedByList: [], // 选择质检人
        supplierNameList: [], // 供应商
        purchaserIdList: [], // 采购员id
        startTime: '', // 质检开始时间
        endTime: '', // 质检结束时间
        createdTime: [],
        businessDeptIdList: [],
        qualityInspectionTypeList: [],
        pageNum: 1,
        pageSize: 10,
        orderSeq: 'DESC', // 默认是降序
        orderBy: 'WS', // 排序的标记，质检状态
      },
      totalRecords: 0,
      tableLoading: false,
      exportLoading: false,
      // 选择仓库下拉列表
      checkStatusListArr: checkStatusList,
      qualityPersonList: [], // 选择入库单号和批次号
      supplierList: [], // 供应商列表
      purchaserList: [], // 采购员列表
      sortButtonList: [
        {
          sortHeader: '按质检状态',
          sortField: 'CT',
          sortType: 'DESC',
        },
        {
          sortHeader: '按创建时间',
          sortField: 'WS',
          sortType: 'DESC',
          default: true,
        }
      ],
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '送检批次号',
          slot: 'receiptBatchNo',
          minWidth: 165,
          align: 'center',
        },
        {
          key: 'qualityInspectionType',
          title: '类型',
          minWidth: 70,
          align: 'center',
          render: (h, params) => {
            let typeMap = {
              1: '维修',
              0: '质检'
            }
            return h('div', {}, typeMap[params.row.qualityInspectionType])
          }
        },
        {
          title: '质检状态',
          slot: 'checkStatus',
          align: 'center',
          minWidth: 120,
        },
        {
          title: '入库单编号',
          slot: 'receiptNo',
          minWidth: 165,
          align: 'center',
        },
        {
          title: '图片',
          slot: 'picture',
          width: 90,
          align: 'center',
        },
        {
          title: 'SKU/条码编码',
          slot: 'goodsSku',
          align: 'center',
          minWidth: 120,
        },
        {
          title: '送检数量',
          key: 'expectedCheckNumber',
          align: 'center',
          minWidth: 90
        },
        {
          title: '应检数量',
          key: 'planCheckNumber',
          align: 'center',
          minWidth: 90
        },
        {
          title: '质检比例',
          slot: 'checkRate',
          align: 'center',
          minWidth: 90
        },
        {
          title: '已检合格数',
          key: 'passCheckNumber',
          align: 'center',
          minWidth: 100
        },
        {
          title: '已检问题数',
          key: 'problemCheckNumber',
          align: 'center',
          minWidth: 100
        },
        {
          title: '待质检数量',
          key: 'waitCheckNumber',
          align: 'center',
          minWidth: 100
        },
        {
          title: '待应检数量',
          key: 'awaitPlanCheckedNumber',
          align: 'center',
          minWidth: 100
        },
        {
          title: '质检人',
          key: 'checkCreatedByName',
          align: 'center',
          minWidth: 100
        },
        {
          title: '创建时间',
          slot: 'createdTime',
          align: 'center',
          width: 100
        },
        {
          title: '操作',
          slot: 'action',
          align: 'center',
          fixed: 'right',
          minWidth: 120,
        }
      ],
      tableList: [],
      // 提交质检结果列表
      submitQualityList: [],
      // 提交质检结果列表
      exportList: [],
      tableCheckedList: [], // 表格选中数据

      inspectVisible: false, // 质检详情弹框
      inspectData: {}, // 质检详情数据
      warehouseOrderVisible: false, // 入库单详情弹框
      warehouseOrderData: {}, // 入库单详情数据
      qualityLoading: false, // 质检结果选中
      batchQualityVisible: false, // 批量提交质检结果弹框
      batchQualityList: [], // 批量提交质检结果数据
    }
  },
  watch: {
    // 进入质检工作页面
    'sku': {
      handler(val) {
        if (!val) return;
        this.pageParams.skuOrBarCodeList = [val];
        this.pageParams.checkStatusList = ['0', '1'];
        this.$emit('update:sku', '');// 清空sku的值
        this.getList();
      },
      deep: true,
      immediate: true,
    },
    tab: {
      handler(val) {
        if (val != 2) return;
        this.computedTableHeight();
        this.$refs['records-filter'] && this.$refs['records-filter'].resizeHand();
      },
      deep: true,
    },
  },
  computed: {
    businessDeptList() {
      let obj = {};
      let list = this.$store.getters.getBusinessDeptList || [];
      list.forEach(k => { obj[k.id] = k })
      return obj;
    },
  },
  created() {
    this.dropSetting();
    this.getQualityName();
    this.getSupplierList();
    this.getPurchaserList();
    this.getList();
  },
  methods: {
    // 赋值
    dropSetting() {
      this.submitQualityList = [
        // {
        //   label: "提交质检结果",
        //   power: true,
        // },
        {
          label: "提交质检结果选中",
          power: this.getPermission('qualityManage_record_submitResult'),
          command: 'apart'
        },
        // {
        //   label: "提交质检结果所有",
        //   power: this.getPermission('wmsReceiptBatchCheck_batchSubmit'),
        //   command: 'all'
        // }
      ]
      this.exportList = [
        {
          label: "导出",
          power: this.getPermission('qualityManage_record_exportAll'),
        },
        {
          label: "导出选中",
          power: this.getPermission('qualityManage_record_exportAll'),
          command: 'apart'
        },
        {
          label: "导出所有",
          power: this.getPermission('qualityManage_record_exportAll'),
          command: 'all'
        }
      ]
    },
    getPageParams() {
      let params = this.$common.copy(this.pageParams);
      // 额外传参
      params.warehouseId = this.warehouseId;
      if (params.createdTime.length > 0 && !this.$common.isEmpty(params.createdTime[0]) && !this.$common.isEmpty(params.createdTime[1])) {
        params.startcreatedTime = this.$common.dayjs(params.createdTime[0]).format('YYYY-MM-DD HH:mm:ss');
        params.endcreatedTime = this.$common.dayjs(params.createdTime[1]).format('YYYY-MM-DD HH:mm:ss');
      }
      delete params.createdTime;
      return this.$common.removeEmpty(params);
    },
    // 点击查询数据
    getList() {
      this.tableLoading = true;
      const params = this.getPageParams();
      this.axios.post(api.qualitySearchData, params).then(({ data }) => {
        if (data.code !== 0) return;
        let datas = data.datas || {};
        this.tableList = datas.list || [];
        this.totalRecords = datas.total || 0;
        this.tableCheckedList = [];// 重置勾选中的数据
      }).finally(() => {
        this.tableLoading = false;
      });
    },
    // 获取质检人下拉列表
    getQualityName() {
      this.$store.dispatch('getQualityPersonList').then(res => {
        this.qualityPersonList = res || [];
      })
    },
    // 获取供应商列表
    getSupplierList() {
      this.$store.dispatch('getSupplierList').then(res => {
        this.supplierList = res || [];
      })
    },
    // 获取采购员列表
    getPurchaserList() {
      this.$store.dispatch('getPurchaserList').then(res => {
        let datas = res || {};
        this.purchaserList = Object.values(datas).filter(k => {
          return k.userId != 'service';
        })
      })
    },
    // 页面查询
    checkSearch() {
      this.pageParams.pageNum = 1; // 点击查询按钮将页码重置为1
      this.getList();
    },
    // 重置查询条件
    reset() {
      this.$refs['pageParams'].resetFields();
      this.pageParams.startTime = '';
      this.pageParams.endTime = '';
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.orderSeq = type;
      this.pageParams.orderBy = feild;
      this.getList();
    },
    // 表格勾选
    checkedDataHandel(data) {
      this.tableCheckedList = data;
    },
    // 入库单号和批次号的输入切换
    changeGroupName(value) {
      this.pageParams.groupName = value;
    },
    // 表格分页
    changePage(page) {
      this.pageParams.pageNum = page;
      this.getList();
    },
    // 切换每页条数
    changePageSize(size) {
      this.pageParams.pageSize = size;
      this.getList();
    },
    // 提交质检结果
    qualityResult(name) {
      let tableCheckedList = this.tableCheckedList || [];
      if (!tableCheckedList.length) {
        return this.$Message.error('请勾选质检批次~');
      }
      let checkStatusList = tableCheckedList.filter(k => {
        return ['0', '1'].includes(k.checkStatus);
      })
      if (!checkStatusList.length) {
        return this.$Message.error('未选择可质检数据~');
      }
      this.batchQualityList = this.$common.copy(checkStatusList);
      this.batchQualityVisible = true;
    },
    // 导出
    exportResult(name) {
      let _self = this;
      let tableCheckedList = this.tableCheckedList || [];
      let fun = {
        url: `${api.exportProductQualityInfo}?warehouseId=${this.warehouseId}`,
        // 部分导出
        apart() {
          if (!tableCheckedList.length) {
            return this.$Message.error('请勾选质检批次~');
          }
          let params = {};
          params.orderIdList = tableCheckedList.map(k => k.receiptBatchCheckNo);
          this.exportLoading = true;
          this.axios.post(fun.url, params).then(({ data }) => {
            if (data.code !== 0) return;
            this.$refs.selection.selectAll(false);
            this.$Message.success('导出成功, 请到 "导出查看" 页面进行查看');
          }).finally(() => {
            this.exportLoading = false;
          });
        },
        // 导出全部
        all() {
          let params = _self.getPageParams();
          params.warehouseId = _self.warehouseId;
          let arr = ['pageNum', 'pageSize', 'orderSeq', 'orderBy'];
          arr.forEach(k => {
            delete params[k];
          })
          this.exportLoading = true;
          this.axios.post(fun.url, params).then(({ data }) => {
            if (data.code !== 0) return;
            this.$Message.success('导出成功, 请到 "导出查看" 页面进行查看');
          }).finally(() => {
            this.exportLoading = false;
          });
        }
      }
      if (!fun[name]) return;
      fun[name].apply(this);
    },
    // 质检时间
    createTimeChange(e) {
      this.pageParams.startTime = e[0] ? e[0] + ' 00:00:00' : null;
      this.pageParams.endTime = e[1] ? e[1] + ' 23:59:59' : null;
    },
    // 查看质检详情
    seeInspectionDetail(row) {
      this.inspectData = row;
      this.inspectVisible = true;
    },
    // 查看入库单详情
    seePickingNoDetail(row) {
      this.warehouseOrderData = row;
      this.warehouseOrderVisible = true;
    },
    // 质检
    goodQualityFun(row) {
      this.$emit('recordQuality', row);
    }
  },
}
</script>
<style lang="less">
.qualityInspectionRecords-page {
  height: 100%;

  .shuffle-icon {
    margin-left: 4px;
    font-size: 18px;
    font-weight: bold;
    color: #2D8CF0;
  }
}
</style>