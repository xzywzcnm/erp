<template>
  <div class="qualityInspectionDocument-page">
    <div class="listPage">
      <div class="searchMain">
        <Form ref="pageParams" :model="pageParams" :label-width="80">
          <dyt-filter ref="document-filter" @expand="expand">
            <Form-item label="质检状态:" prop="checkStatus">
              <dyt-select v-model="pageParams.checkStatus">
                <Option v-for="(item, index) in checkStatusList" :value="item.value" :key="index + 'checkStatus'"
                  :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="质检单号:" prop="receiptCheckNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.receiptCheckNoList"
                placeholder="多个请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="创建时间：">
              <DatePicker type="daterange" transfer placeholder="选择日期" style="width: 100%"
                :value="[pageParams.startCreatedTime, pageParams.endCreatedTime]" @on-change="createTimeChange">
              </DatePicker>
            </Form-item>
            <Form-item label="采购单号:" prop="purchaseNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.purchaseNoList"
                placeholder="多个请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="入库单号:" prop="receiptNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.receiptNoList"
                placeholder="多个请用逗号或回车分隔" />
            </Form-item>
            <FormItem label="供应商:" prop="supplierName">
              <dytInput v-model.trim="pageParams.supplierName" placeholder="请输入供应商名称" />
              <!-- <dyt-select v-model="pageParams.supplierName">
                <Option v-for="(item,index) in supplierList" :value="item.supplierName" :key="index+'supplierName'"
                  :label="item.supplierName"></Option>
              </dyt-select> -->
            </FormItem>
            <Form-item label="备货类型:" prop="readyType">
              <dyt-select v-model="pageParams.readyType">
                <Option v-for="(item, index) in readyTypeList" :value="item.value" :label="item.label"
                  :key="index + 'readyType'">
                </Option>
              </dyt-select>
            </Form-item>
            <FormItem label="问题数量:" prop="haveProblem">
              <dyt-select v-model="pageParams.haveProblem">
                <Option :value="1" label="有"></Option>
                <Option :value="0" label="无"></Option>
              </dyt-select>
            </FormItem>
            <FormItem label="剩余数量:" prop="haveSurplus">
              <dyt-select v-model="pageParams.haveSurplus">
                <Option :value="1" label="有"></Option>
                <Option :value="0" label="无"></Option>
              </dyt-select>
            </FormItem>
            <Form-item label="SKU:" prop="skuList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.skuList" placeholder="多个SKU请用逗号或回车分隔" />
            </Form-item>
            <FormItem label="采购员:" prop="purchaserIdList">
              <dyt-select v-model="pageParams.purchaserIdList" :max-tag-count="1" :multiple="true">
                <Option v-for="(item, index) in purchaserList" :value="item.userId" :label="item.userName"
                  :key="`user-${index}`" />
              </dyt-select>
            </FormItem>
            <FormItem label="类型:" prop="qualityInspectionTypeList">
              <dyt-select :max-tag-count="1" :multiple="true" v-model="pageParams.qualityInspectionTypeList">
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
            <!-- <Button type="primary" class="mr10" @click="createHandSheet"
              v-if="getPermission('qualityManage_order_createOrder')">创建处理单</Button> -->
            <dyt-dropdown class="mr10" trigger="click" :dropdown-list="exportList" @commandChange="exportResult"
              :loading="exportLoading" />
            <Button type="primary" class="mr10" @click="printInventory">打印问题件存放清单</Button>
          </div>
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>
      <!--表格-->
      <div class="tableMain tag-hideBorder">
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
                <div class="flexBox">
                  <Tag color="magenta" title="类型">{{ row.qualityInspectionType ? '维修' : '质检' }}</Tag>
                  <Tag color="green" title="质检状态">{{ checkStatusList[row.checkStatus] &&
                    checkStatusList[row.checkStatus].label }}</Tag>
                </div>
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
              <span class="linkText cursorClick" @click="storageCodeEdit(row)">
                {{ storageCodeShow(row) }}
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
            <template slot-scope="{ row }" slot="action">
              <span class="unlinkText cursorClick" @click="seeInspectionDetail(row, 'edit')"
                v-if="getPermission('qualityManage_order_editInspectable') && row.checkStatus === '0'">修改应检</span>
              <!-- <span class="unlinkText cursorClick" @click="transferQualify(row, 2)"
                v-if="getPermission('qualityManage_order_onShelves') && row.checkStatus > 0 && row.surplusNumber > 0">转合格上架</span> -->
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
    <!-- 查看质检单 -->
    <inspection-document-detail :dialogVisible.sync="documnetVisible" :modalData="documnettData" :type="documentType"
      @checkSearch="getList" />
    <!-- 质检问题产品转合格产品 -->
    <quality-problem-products :modelVisible.sync="problemVisible" :modalData="problemData" :type="problemType" />
    <!-- 修改存放编码 -->
    <modify-storage-code :modelVisible.sync="codeInfo.modelVisible" :data="codeInfo.data" @checkSearch="getList" />
    <!-- 打印问题存放清单 -->
    <storage-list :modelVisible.sync="questionInfo.modelVisible" :data="questionInfo.data" />
  </div>
</template>
<script>
import api from '@/api/api';
import permission_mixin from '@/components/mixin/permission_mixin';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';
import inspectionDocumentDetail from './inspectionDocumentDetail';
import qualityProblemProducts from './qualityProblemProducts';
import { checkStatusList, checkTypeList, readyTypeList } from './commonData.js';
import modifyStorageCode from './modifyStorageCode';
import storageList from './storageList';

export default {
  name: "qualityInspectionDocument",
  components: { inspectionDocumentDetail, modifyStorageCode, storageList, qualityProblemProducts },
  mixins: [permission_mixin, tableHeight_mixin],
  props: {
    warehouseId: {// 仓库id
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
        checkStatus: '', // 质检状态
        receiptCheckNoList: [], // 质检单号
        purchaseNoList: [], // 采购单号
        skuList: [], // sku
        receiptNoList: [], // 入库单编号
        supplierName: '', // 供应商
        readyType: '', // 备货类型
        purchaserIdList: [], // 采购员列表
        haveProblem: '', // 问题数量
        qualityInspectionTypeList: [],
        haveSurplus: '', // 剩余数量
        startCreatedTime: '', // 创建开始时间
        createdEndTime: '', // 创建结束时间
        pageNum: 1,
        pageSize: 10,
        sortField: 'CT', // 排序的标记，质检状态
        sortOrder: 'DESC', // 默认是降序
      },
      purchaserList: [], // 采购员列表
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
          sortHeader: '按创建时间',
          sortField: 'CT',
          sortType: 'DESC',
          default: true,
        },
        {
          sortHeader: '质检完成时间',
          sortField: 'FT',
          sortType: 'DESC',
          default: true,
        },
      ], // 排序
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '质检单',
          slot: 'receiptCheckNo',
          align: 'center',
          minWidth: 210,
        },
        {
          title: '下单数',
          key: 'purchaseNumber',
          align: 'center',
          minWidth: 90,
        },
        {
          title: '质检类型',
          slot: 'checkType',
          align: 'center',
          minWidth: 90,
        },
        {
          title: '应检数',
          key: 'planCheckNumber',
          align: 'center',
          minWidth: 90,
        },
        {
          title: '质检比例',
          slot: 'checkRate',
          align: 'center',
          minWidth: 90
        },
        {
          title: '送检数',
          key: 'expectedCheckNumber',
          align: 'center',
          minWidth: 90
        },
        {
          title: '已检合格数',
          key: 'qualifiedCheckedNumber',
          align: 'center',
          minWidth: 100
        },
        {
          title: '已检问题数',
          slot: 'failedCheckedNumber',
          align: 'center',
          minWidth: 100
        },
        {
          title: '待检数',
          key: 'awaitCheckedNumber',
          align: 'center',
          minWidth: 90
        },
        {
          title: '待应检数',
          key: 'awaitPlanCheckedNumber',
          align: 'center',
          minWidth: 90
        },
        {
          title: '已检问题商品处理',
          key: 'checkCreatedByName',
          align: 'center',
          children: [
            {
              title: '退货数',
              key: 'refundNumber',
              align: 'center',
              minWidth: 80,
            },
            {
              title: '销毁数',
              key: 'destroyNumber',
              align: 'center',
              minWidth: 80,
            },
            {
              title: '剩余数',
              key: 'surplusNumber',
              align: 'center',
              minWidth: 80,
            }
          ]
        },
        {
          title: '存放编码',
          slot: 'slotCode',
          align: 'center',
          width: 100
        },
        {
          title: '备注',
          slot: 'remarks',
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
          title: '质检时间',
          key: 'checkFinishTime',
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
      ], // 表头
      tableList: [], // 表格数据
      exportList: [], // 提交质检结果列表
      documnetVisible: false, // 质检详情
      documnettData: {}, // 质检详情数据
      documentType: '', // 质检查看或编辑
      problemVisible: false, // 质检问题产品详情
      problemData: {}, // 质检问题产品详情数据
      problemType: 1, // 默认查看质检问题产品详情
      tableCheckedList: [], // 表格选中列表
      codeInfo: {// 存放编码修改
        data: {},
        modelVisible: false,
      },
      questionInfo: {// 打印问题清单
        data: [],
        modelVisible: false,
      },
    }
  },
  watch: {
    tab: {
      handler(val) {
        if (val != 3) return;
        this.computedTableHeight();
        this.$refs['document-filter'] && this.$refs['document-filter'].resizeHand();
      },
      deep: true,
    },
  },
  created() {
    this.getTime();
    this.getList();
    this.dropSetting();
    this.getSupplierList();
    this.getPurchaserList()
  },
  methods: {
    // 获取质检单列表
    getList() {
      this.tableLoading = true;
      let params = this.$common.removeEmpty(this.pageParams);
      params.warehouseId = this.warehouseId;
      this.axios.post(api.quality_getReceiptCheck, params).then(({ data }) => {
        if (data.code !== 0) return;
        let datas = data.datas || {};
        this.tableList = datas.list || [];
        this.totalRecords = datas.total || 0;
        this.tableCheckedList = [];// 重置勾选中的数据
      }).finally(() => {
        this.tableLoading = false;
      })
    },
    getPurchaserList() {
      this.axios.get(api.get_userInfoCommon).then(res => {
        if (res.data.code == 0) {
          this.purchaserList = Object.values(res.data.datas || {});
        }
      })
    },
    // 生成日期，默认值为前7天
    getTime() {
      let dayjs = this.$common.dayjs();
      this.pageParams.startCreatedTime = dayjs.subtract(7, 'day').format('YYYY-MM-DD') + ' 00:00:00';
      this.pageParams.endCreatedTime = dayjs.format('YYYY-MM-DD') + ' 23:59:59';
    },
    // 赋值
    dropSetting() {
      this.exportList = [
        {
          label: "导出",
          power: this.getPermission('qualityManage_order_exprotAll'),
        },
        {
          label: "导出选中",
          power: this.getPermission('qualityManage_order_exprotAll'),
          command: 'apart'
        },
        {
          label: "导出所有",
          power: this.getPermission('qualityManage_order_exprotAll'),
          command: 'all'
        }
      ]
    },
    // 获取供应商列表
    getSupplierList() {
      this.$store.dispatch('getSupplierList').then(res => {
        this.supplierList = res || [];
      })
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
        str = '选中';
      } else {
        params = this.$common.removeEmpty(this.pageParams);
        let arr = ['pageNum', 'pageSize'];
        arr.forEach(k => {
          delete params[k];
        })
        str = '所有';
      }
      params.warehouseId = this.warehouseId;
      params.exportType = 0;// 固定用来区分质检单和问题件

      this.$Modal.confirm({
        title: '导出',
        content: `<p>确定要导出${str}的质检单吗？</p>`,
        loading: true,
        onOk: () => {
          this.axios({
            method: 'post',
            url: api.quality_exportSync,
            data: params,
            // responseType: 'blob',
            // timeout: 600000
          }).then(({ data }) => {
            // }).then(resData => {
            if (data.code !== 0) return;
            // if (!resData.resData) return;
            this.$Message.success('导出成功, 请到 "导出查看" 页面进行查看');
            // this.$common.downFile(resData.resData, resData.filename);
          }).finally(() => {
            this.$Modal.remove();
          })
        },
        onCancel: () => { }
      });
    },
    // 创建时间
    createTimeChange(e) {
      this.pageParams.startCreatedTime = e[0] ? e[0] + ' 00:00:00' : null;
      this.pageParams.endCreatedTime = e[1] ? e[1] + ' 23:59:59' : null;
    },
    // 查看质检详情
    seeInspectionDetail(row, documentType) {
      this.documentType = documentType;
      this.documnettData = row;
      this.documnetVisible = true;
    },
    // 转合格上架
    transferQualify(row, problemType) {
      if (row.failedCheckedNumber <= 0) return;
      this.problemType = problemType;
      this.problemData = Object.assign({}, row, { apiType: 'list' });
      this.problemVisible = true;
    },
    // 打印问题清单
    printInventory() {
      let list = this.tableCheckedList;
      let surplusList = list.filter(k => k.surplusNumber);
      if (!surplusList.length) {
        return this.$Message.error('不存在问题数的质检单~');
      }
      this.questionInfo.data = surplusList;
      this.questionInfo.modelVisible = true;
    },
    // 更改存放编码
    storageCodeEdit(row) {
      this.codeInfo.data = row;
      this.codeInfo.modelVisible = true;
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
}
</style>