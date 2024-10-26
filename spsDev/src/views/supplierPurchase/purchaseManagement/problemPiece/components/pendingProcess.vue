<template>
  <div class="qualityInspectionDocument-page">
    <div class="listPage" v-if="!documentInfo.visible">
      <div class="searchMain">
        <Form ref="pageParams" :model="pageParams" :label-width="80">
          <dyt-filter ref="document-filter" @expand="expand">
            <Form-item label="质检单号:" prop="receiptCheckNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.receiptCheckNoList"
                placeholder="多个请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="采购单号:" prop="purchaseNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.purchaseNoList"
                placeholder="多个请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="质检时间:">
              <DatePicker type="daterange" transfer placeholder="选择日期" style="width: 100%"
                :value="[pageParams.startCheckFinishTime, pageParams.endCheckFinishTime]" @on-change="createTimeChange">
              </DatePicker>
            </Form-item>
            <Form-item label="入库单号:" prop="receiptNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.receiptNoList"
                placeholder="多个请用逗号或回车分隔" />
            </Form-item>
            <FormItem label="供应商:" prop="supplierName">
              <dytInput v-model.trim="pageParams.supplierName" placeholder="请输入供应商名称" />
            </FormItem>
            <Form-item label="SPU:" prop="spuList">
              <dyt-input-tag :limit="1" type="textarea" v-model="pageParams.spuList" placeholder="多个SPU请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="SKU:" prop="skuList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.skuList" placeholder="多个SKU请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="备货类型:" prop="readyType">
              <dyt-select v-model="pageParams.readyType">
                <Option v-for="(item, index) in readyTypeList" :value="item.value" :label="item.label"
                  :key="index + 'readyType'">
                </Option>
              </dyt-select>
            </Form-item>
            <FormItem label="采购员:" prop="purchaserIdList">
              <dyt-select v-model="pageParams.purchaserIdList" :max-tag-count="1" :multiple="true">
                <Option v-for="(item, index) in purchaserList" :value="item.userId" :label="item.userName"
                  :key="`user-${index}`" />
              </dyt-select>
            </FormItem>
            <FormItem label="所属事业部:" prop="businessDeptId">
              <dyt-select v-model="pageParams.businessDeptId">
                <Option v-for="(item, index) in businessDeptList" :value="item.id" :label="item.name"
                  :key="`busines-${index}`" />
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
            <Button type="primary" class="mr10" @click="createHandSheet" :disabled="!tableCheckedList.length"
              v-if="getPermission('sps_problemPiece_pending_createProcessOrder')">创建处理单</Button>
            <dyt-dropdown class="mr10" trigger="click" :dropdown-list="exportList" @commandChange="exportResult"
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
            <template slot-scope="{ row }" slot="receiptCheckNo">
              <div style="text-align:left;">
                <div>
                  质检单：
                  <span class="linkText cursorClick" @click="seeInspectionDetail(row, 'detail')">
                    {{ row.receiptCheckNo || '' }}
                  </span>
                </div>
                <div>{{ row.supplierName || '' }}</div>
              </div>
            </template>
            <template slot-scope="{ row }" slot="checkStatus">
              <span>
                {{ checkStatusList[row.checkStatus] && checkStatusList[row.checkStatus].label }}
              </span>
            </template>
            <template slot-scope="{ row }" slot="oddNumber">
              <div>{{ row.purchaseNo || '' }}</div>
              <div>{{ row.receiptNo || '' }}</div>
            </template>
            <template slot-scope="{ row }" slot="businessDeptId">
              <div v-if="businessDeptList[row.businessDeptId]">
                {{ businessDeptList[row.businessDeptId].name }}
              </div>
            </template>
            <template slot-scope="{ row }" slot="checkType">
              <span>{{ checkTypeList[row.checkType] && checkTypeList[row.checkType].label }}</span>
            </template>
            <template slot-scope="{ row }" slot="checkRate">
              <span>{{ row.checkRate || 0 }}%</span>
            </template>
            <template slot-scope="{ row }" slot="failedCheckedNumber">
              <span :class="row.failedCheckedNumber > 0 ? 'linkText cursorClick' : ''" @click="transferQualify(row, 1)">
                {{ row.failedCheckedNumber || 0 }}
              </span>
            </template>
            <template slot-scope="{ row }" slot="createdTime">
              <!-- <span>{{ $uDate.dealTime(row.createdTime) }}</span> -->
              <span>{{ row.createdTime }}</span>
            </template>
            <template slot-scope="{ row }" slot="slotCode">
              <span>{{ storageCodeShow(row) }}</span>
            </template>
            <template slot-scope="{ row }" slot="purchaserId">
              <span v-for="(item, index) in purchaserList" :key="index + 'purchaserId'">
                <span v-if="row.purchaserId === item.userId">{{ item.userName }}</span>
              </span>
            </template>
            <template slot-scope="{ row }" slot="remarks">
              <div class="order-item">
                <div class="order-li--text">
                  <Tooltip placement="top" :max-width="500" transfer>
                    <span>{{ row.remarks }}</span>
                    <div slot="content" v-if="row.remarks && row.remarks.split(';').length">
                      <p v-for="item in row.remarks.split(';')" :key="item">{{ item }}</p>
                    </div>
                  </Tooltip>
                </div>
              </div>
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

    <!-- 查看 -->
    <transition name="bounce">
      <template v-if="documentInfo.visible">
        <div class="subLayer infoDetails pendingProcessPage">
          <div>
            <qualityTestDetail @closePage="documentInfo.visible = false" :isEdit="false" :pageData="documentInfo.data">
            </qualityTestDetail>
          </div>
        </div>
      </template>
    </transition>
    <Modal v-model="problemInfo.visible" title="质检问题详情" :width="1280">
      <problemDetail :problemDetailList="problemInfo.data"></problemDetail>
    </Modal>
    <!-- 问题商品处理单 -->
    <handleProblemOrder :modelVisible.sync="handSheetInfo.visible" :module-list="handSheetInfo.list"
      :businessDeptInfoList="businessDeptInfoList" @checkSearch="checkSearch"  />
  </div>
</template>
<script>
import api from '@/api/api';
import permission_mixin from '@/components/mixin/permission_mixin';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';
// import problemGoodHandSheet from './problemGoodHandSheet';
import { checkStatusList, checkTypeList, readyTypeList } from './fileData.js';
import qualityTestDetail from "../../components/common/qualityTestDetail.vue";
import problemDetail from "../../components/common/problemDetail.vue";
import handleProblemOrder from "../../components/common/handleProblemOrder.vue";

export default {
  name: "pendingProcess",
  components: {
    qualityTestDetail,
    // problemGoodHandSheet,
    problemDetail,
    handleProblemOrder,
  },
  mixins: [permission_mixin, tableHeight_mixin],
  props: {
    tab: {
      type: String,
      default() { return '' }
    },
    businessDeptInfoList: {
      type: Array,
      default() { return [] }
    },
    purchaserList: {
      type: Array,
      default() { return [] }
    },
  },
  data() {
    return {
      pageParams: {
        checkStatus: 2, // 质检状态 默认质检完成
        receiptCheckNoList: [], // 质检单号
        purchaseNoList: [], // 采购单号
        spuList: [], // SPU
        skuList: [], // sku
        receiptNoList: [], // 入库单编号
        supplierName: '', // 供应商
        readyType: '', // 备货类型
        purchaserIdList: [], // 采购员列表
        haveSurplus: 1, // 剩余数量 默认是
        startCheckFinishTime: '', // 创建开始时间
        createdEndTime: '', // 创建结束时间
        businessDeptId: '',//事业部
        pageNum: 1,
        pageSize: 10,
        sortField: 'FT', // 排序的标记，质检状态
        sortOrder: 'DESC', // 默认是降序
      },
      totalRecords: 0, // 表格总条数
      tableLoading: false, // 表格加载
      exportLoading: false, // 导出加载
      supplierList: [], // 供应商列表
      readyTypeList: readyTypeList, // 备货类型
      checkStatusList: checkStatusList, // 质检状态下拉列表
      checkTypeList: checkTypeList, // 质检类型
      sortButtonList: [
        {
          sortHeader: '按供应商',
          sortField: 'SN',
          sortType: 'DESC',
        },
        {
          sortHeader: '按质检时间',
          sortField: 'FT',
          sortType: 'DESC',
          default: true,
        },
      ], // 排序
      columns: [
        {
          type: 'selection',
          width: 54,
          fixed: 'left'
        },
        {
          title: '质检单',
          slot: 'receiptCheckNo',
          minWidth: 210,
        },
        {
          title: '质检状态',
          slot: 'checkStatus',
          width: 90,
        },
        {
          title: '采购单/入库单',
          slot: 'oddNumber',
          minWidth: 160,
        },
        {
          title: '所属事业部',
          slot: 'businessDeptId',
          minWidth: 100,
        },
        {
          title: '质检类型',
          slot: 'checkType',
          width: 90,
        },
        {
          title: '下单数',
          key: 'purchaseNumber',
          width: 90,
        },
        {
          title: '送检数',
          key: 'expectedCheckNumber',
          width: 90
        },
        {
          title: '已检合格数',
          key: 'qualifiedCheckedNumber',
          width: 100
        },
        {
          title: '已检问题数',
          slot: 'failedCheckedNumber',
          width: 100
        },
        {
          title: '剩余数',
          key: 'surplusNumber',
          width: 80,
        },
        {
          title: '存放编码',
          slot: 'slotCode',
          width: 100
        },
        {
          title: '备注',
          slot: 'remarks',
          minWidth: 100
        },
        {
          title: '采购员',
          slot: 'purchaserId',
          width: 100
        },
        {
          title: '质检时间',
          key: 'checkFinishTime',
          width: 100
        },
      ], // 表头
      tableList: [], // 表格数据
      exportList: [], // 提交质检结果列表
      documentInfo: { //质检详情
        visible: false,
        data: {},// 质检详情数据
        type: null,// 质检查看或编辑
      },
      problemInfo: { //质检问题产品详情
        visible: false,
        data: [],
        type: null,
      },
      tableCheckedList: [], // 表格选中列表
      codeInfo: {// 存放编码修改
        data: {},
        modelVisible: false,
      },
      selectSupplierJson: {},
      handSheetInfo: {
        visible: false,
        list: [],
      },
      // isOtherComing: false,
    }
  },
  watch: {
    tab: {
      handler(val) {
        if (val != 1) return;
        this.computedTableHeight();
        this.$refs['document-filter'] && this.$refs['document-filter'].resizeHand();
      },
      deep: true,
    },
    'documentInfo.visible': {
      handler(val) {
        if (val) return;
        this.$nextTick(() => {
          this.computedTableHeight();
          this.$refs['document-filter'].resizeHand();
        })
      },
      deep: true,
    },
  },
  computed: {
    businessDeptList() {
      let obj = {};
      let list = this.businessDeptInfoList;
      list.forEach(k => { obj[k.id] = k })
      return obj;
    }
  },
  created() {
    // this.getTime();
    this.getList();
    this.dropSetting();
    this.getSupplierList();
  },
  methods: {
    // 获取筛选条件
    getParams() {
      let params = this.$common.removeEmpty(this.pageParams);
      // params.warehouseId = this.warehouseId;
      return params;
    },
    // 获取质检单列表
    getList() {
      this.tableLoading = true;
      this.axios.post(api.getReceiptCheckToHandle, this.getParams()).then(({ data }) => {
        if (data.code !== 0) return;
        let datas = data.datas || {};
        this.tableList = datas.list || [];
        this.totalRecords = datas.total || 0;
        this.tableCheckedList = [];// 重置勾选中的数据
      }).finally(() => {
        this.tableLoading = false;
      })
    },
    // 生成日期，默认值为前7天
    getTime() {
      this.pageParams.startCheckFinishTime = this.pageParams.endCheckFinishTime = null;
    },
    // 赋值
    dropSetting() {
      let power = this.getPermission('sps_problemPiece_pending_exprotAll');
      this.exportList = [
        {
          label: "导出",
          power: power,
        },
        {
          label: "导出选中",
          power: power,
          command: 'apart'
        },
        {
          label: "导出所有",
          power: power,
          command: 'all'
        }
      ]
    },
    // 获取供应商列表
    getSupplierList() {
      // this.$store.dispatch('getSupplierList').then(res => {
      //   this.supplierList = res || [];
      // })
    },
    // 页面查询
    checkSearch() {
      this.pageParams.pageNum = 1; // 点击查询按钮将页码重置为1
      this.getList();
    },
    // 重置表单查询
    reset() {
      this.$refs['pageParams'].resetFields();
      this.getTime();
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.sortOrder = type;
      this.pageParams.sortField = feild;
      this.getList();
    },
    // 表格勾选
    checkedDataHandel(data) {
      this.tableCheckedList = data;
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
    // 导出
    exportResult(name) {
      if (!name) return;
      let params = {};
      let [str, tableCheckedList] = ['', this.tableCheckedList];
      if (name === 'apart') {
        if (!tableCheckedList.length) {
          return this.$Message.error('请勾选质检单~');
        }
        params.receiptCheckNoList = tableCheckedList.map(k => k.receiptCheckNo);
        // params.warehouseId = this.warehouseId;
        str = '选中';
      } else {
        params = this.getParams();
        str = '所有';
      }
      params.exportType = 1;//固定用来区分质检单和问题件
      this.$Modal.confirm({
        title: '导出',
        content: `<p>确定要导出${str}的质检单吗？</p>`,
        loading: true,
        onOk: () => {
          this.axios({
            method: 'post',
            url: api.exportAsyncOther,
            data: params,
          }).then(({ data }) => {
            if (data.code !== 0) return;
            this.$Message.success('导出成功, 请到 "导出查看" 页面进行查看');
            (name === 'apart') && this.$refs.selection.selectAll(false);
          }).finally(() => {
            this.$Modal.remove();
          })
        },
        onCancel: () => { }
      });
    },
    // 创建时间
    createTimeChange(e) {
      this.pageParams.startCheckFinishTime = e[0] ? e[0] + ' 00:00:00' : null;
      this.pageParams.endCheckFinishTime = e[1] ? e[1] + ' 23:59:59' : null;
    },
    // 查看质检详情
    seeInspectionDetail(row, documentType) {
      this.documentInfo.type = documentType;
      this.documentInfo.data = row;
      this.documentInfo.visible = true;
    },
    // 问题详情
    transferQualify(row) {
      if (row.failedCheckedNumber <= 0) return;
      let temp = {
        receiptCheckNo: row.receiptCheckNo,
        productGoodsId: row.productGoodsId,
      };
      this.axios.post(api.getReceiptProblem, temp).then((res) => {
        this.problemInfo.data = res.data.datas || [];
        this.problemInfo.visible = true;
      });
    },
    // 创建处理单(选择的质检单必须为同一供应商，必须有剩余数量；)
    createHandSheet() {
      let [selectSupplierJson, businessDeptIdJson] = [{}, {}];
      this.tableCheckedList.forEach(item => {
        if (item.surplusNumber > 0) {
          if (!selectSupplierJson[item.supplierName]) {
            selectSupplierJson[item.supplierName] = [item];
          } else {
            selectSupplierJson[item.supplierName].push(item);
          }
        }
      });
      const moreList = Object.keys(selectSupplierJson);
      if (moreList.length === 0) {
        return this.$Message.error('您勾选的质检单不满足创建处理单~');
      }
      if (moreList.length > 1) {
        this.$Message.error('您勾选的质检单包含多个供应商，请选择同一供应商后再创建处理单~');
        return;
      }
      let list = selectSupplierJson[moreList[0]];
      list.forEach(item => {
        if (!item.businessDeptId) return;
        if (!businessDeptIdJson[item.businessDeptId]) {
          businessDeptIdJson[item.businessDeptId] = [item];
        } else {
          businessDeptIdJson[item.businessDeptId].push(item);
        }
      })
      const businessList = Object.keys(businessDeptIdJson);
      if (businessList.length === 0) {
        return this.$Message.error('所属事业部不存在~');
      }
      if (businessList.length > 1) {
        this.$Message.error('问题件需要相同的所属事业部才能一起处理~');
        return;
      }
      // 入库类型存在“其他入库”时，只允许统一其它入库类型生成问题件
      let otherComingList = list.filter(k => [4, '4'].includes(k.receiptType));
      if (otherComingList.length && otherComingList.length < list.length) {
        this.$Message.error('存在其他入库类型，需相同的入库类型才能一起处理~');
        return;
      }
      // console.log(moreList, businessList, list);
      // this.isOtherComing = !!otherComingList.length;  // http://192.168.91.3/www/index.php?m=task&f=view&taskID=9650 需求
      this.handSheetInfo.list = list;
      this.$nextTick(() => {
        this.handSheetInfo.visible = true;
      })
    },
    // 处理要显示的编码
    storageCodeShow(row) {
      if (row.slotType == 1 && row.slotCode) {
        return (row.slotCode < 10 ? '0' + row.slotCode : row.slotCode) + '框';
      }
      return row.slotCode || '';
    }
  },
}
</script>
<style lang="less">
.qualityInspectionDocument-page {
  height: 100%;

  .pendingProcessPage {
    height: 100%;
    overflow-y: auto;
  }
}
</style>