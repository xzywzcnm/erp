<template>
  <div class="qualityInspectionDocument-page">
    <div class="listPage">
      <div class="searchMain">
        <Form ref="pageParams" :model="pageParams" :label-width="100">
          <dyt-filter :ref="formRef" @expand="expand" :tableClassName="tableBoxClass">
            <Form-item label="处理类型:" prop="questionType">
              <dyt-select v-model="pageParams.questionType">
                <Option v-for="(item, index) in processTypeList" :value="item.value" :key="index" :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="处理单号:" prop="receiptCheckQuestionNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.receiptCheckQuestionNoList"
                placeholder="多个请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="创建时间：">
              <DatePicker type="daterange" transfer placeholder="选择日期" style="width: 100%"
                :value="[pageParams.startCreatedTime, pageParams.endCreatedTime]" @on-change="createTimeChange">
              </DatePicker>
            </Form-item>
            <Form-item label="处理完成时间:" v-if="tab == '3'">
              <DatePicker type="datetimerange" transfer placeholder="选择日期"
              format="yyyy-MM-dd HH:mm:ss"
                :value="[pageParams.startCompletionTime, pageParams.endCompletionTime]" @on-change="completionChange">
              </DatePicker>
            </Form-item>
            <Form-item label="采购单号:" prop="referenceNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.referenceNoList"
                placeholder="多个请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="入库单号:" prop="receiptNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.receiptNoList"
                placeholder="多个请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="质检单号:" prop="receiptCheckNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.receiptCheckNoList"
                placeholder="多个请用逗号或回车分隔" />
            </Form-item>
            <FormItem label="所属事业部:" prop="businessDeptId">
              <dyt-select v-model="pageParams.businessDeptId">
                <Option v-for="(item, index) in businessDeptList" :value="item.id" :label="item.name"
                  :key="`busines-${index}`" />
              </dyt-select>
            </FormItem>
            <FormItem label="供应商:" prop="supplierName">
              <dytInput v-model.trim="pageParams.supplierName" placeholder="请输入供应商名称" />
            </FormItem>
            <Form-item label="快递公司:" prop="logisticsId">
              <dyt-select v-model="pageParams.logisticsId">
                <Option v-for="(item, index) in expressCompanyList" :value="item.logisticsId" :label="item.logisticsName"
                  :key="index"></Option>
              </dyt-select>
            </Form-item>
            <Form-item label="快递单号:" prop="deliveryNo">
              <dytInput v-model="pageParams.deliveryNo" placeholder="请输入快递单号" />
            </Form-item>
            <FormItem label="采购员:" prop="purchaserId">
              <dyt-select v-model="pageParams.purchaserId">
                <Option v-for="(item, index) in purchaserList" :value="item.userId" :label="item.userName"
                  :key="index + 'purchaserId'">
                </Option>
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
            <Button type="primary" @click="exportHand" :loading="exportLoad">导出</Button>
            <Button type="primary" @click="exportSelected" :loading="exportLoad" class="ml10" v-if="power.exportDetails">导出选中明细</Button>
          </div>
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch" />
          </div>
        </div>
      </div>
      <!--表格-->
      <div class="tableMain">
        <div class="tableBox" :class="tableBoxClass">
          <Table @on-selection-change="checkedDataHandel" :data="tableList" highlight-row border ref="selection"
            :loading="TableLoading" :columns="columns" :height="tableHeight">
            <template slot-scope="{ row }" slot="receiptCheckQuestionNo">
              <div>
                处理单：
                <span class="linkText cursorClick" @click="seeHandSheet(row, false)">
                  {{ row.receiptCheckQuestionNo || '' }}
                </span>
              </div>
              <div>{{ row.supplierName || '' }}</div>
            </template>
            <template slot-scope="{ row }" slot="questionType">
              <div v-if="processTypeList[row.questionType]">
                <Tag :color="processTypeList[row.questionType].color" size="medium">
                  {{ processTypeList[row.questionType].label }}
                </Tag>
              </div>
            </template>
            <template slot-scope="{ row }" slot="questionStatus">
              <span v-if="processStatusList[row.questionStatus]">
                {{ processStatusList[row.questionStatus].statusLable }}
              </span>
            </template>
            <template slot-scope="{ row }" slot="purchaserId">
              <span v-for="(item, index) in purchaserList" :key="index + 'purchaserIds'">
                <span v-if="item.userId === row.purchaserId">{{ item.userName }}</span>
              </span>
            </template>
            <template slot-scope="{ row }" slot="logisticsInfo">
              <div>{{ row.logisticsName || '' }}</div>
              <div>{{ row.deliveryNo || '' }}</div>
            </template>
            <template slot-scope="{ row }" slot="purchaseNo">
              <div v-if="row.purchaseNo && (typeof row.purchaseNo === 'string')">
                <span v-for="(item, index) in row.purchaseNo.split(',')" :key="index + 'purchaseNo'">
                  {{ item }}
                </span>
              </div>
            </template>
            <template slot-scope="{ row }" slot="slotCode">
              <span v-for="(item, index) in (row.slotCodeList || [])" :key="index + 'slotCode'">{{ item }}</span>
            </template>
            <template slot-scope="{ row }" slot="action">
              <div>
                <span class="unlinkText cursorClick mr10" @click="seeHandSheet(row, true)" v-if="power.edit">修改</span>
                <span class="unlinkText cursorClick unlineErrorText" @click="delSheet(row)" v-if="power.delete">删除</span>
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
    <!-- 问题商品处理单 -->
    <qualityTestHandleProblem :modelVisible.sync="handSheetInfo.visible" :isEdit="handSheetInfo.isEdit"
      :modelData="handSheetInfo.data" @checkSearch="searchData" :businessDeptInfoList="businessDeptInfoList" />
  </div>
</template>
<script>
import api from '@/api/api';
import permission_mixin from '@/components/mixin/permission_mixin';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';
import qualityTestHandleProblem from "../../components/common/qualityTestHandleProblem.vue";
import { processTypeList, processStatusList } from './fileData.js';
export default {
  name: "processingSheet" + (new Date().getTime() + parseInt(Math.random() * 10000)),
  components: { qualityTestHandleProblem },
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
        questionType: null, // 处理类型
        receiptCheckQuestionNoList: [], // 处理单号
        referenceNoList: [], // 采购单号
        receiptNoList: [], // 入库单号
        receiptCheckNoList: [], // 质检单号
        supplierName: '', // 供应商
        logisticsId: '', // 快递公司id
        deliveryNo: '', // 快递单号
        startCreatedTime: '', // 创建开始时间
        endCreatedTime: '', // 创建结束时间
        startCompletionTime: '', // 处理完成开始时间
        endCompletionTime: '', // 处理完成结束时间
        purchaserId: '', // 采购员id
        businessDeptId: '',//事业部
        pageNum: 1,
        pageSize: 10,
        sortOrder: 'DESC', // 默认是降序
        sortField: 'CT', // 排序的标记
      },
      tableSelectionData: [],
      exportLoad: false,
      destroyLoad: false,
      totalRecords: 0,
      TableLoading: false,
      // 处理类型
      processTypeList: processTypeList,
      expressCompanyList: [], // 快递公司列表
      sortButtonList: [
        {
          sortHeader: '按创建时间',
          sortField: 'CT',
          sortType: 'DESC',
          default: true
        },
        {
          sortHeader: '按供应商名称',
          sortField: 'SN',
          sortType: 'DESC'
        },
        {
          sortHeader: '按完成时间',
          sortField: 'CPT',
          sortType: 'DESC'
        }
      ],
      tableList: [],
      handSheetInfo: {// 处理单
        visible: false,
        data: {},
        isEdit: '',
      },
      processStatusList: processStatusList,
      formRef: 'sheet-filter' + this.tab,
    }
  },
  watch: {
    tab: {
      handler(val) {
        if (!['2', '3'].includes(val)) return;
        this.computedTableHeight();
        this.$refs[this.formRef] && this.$refs[this.formRef].resizeHand();
      },
      deep: true,
    },
  },
  created() {
    this.getLogistics();
    this.getTime();
    this.searchData();
  },
  computed: {
    businessDeptList() {
      let obj = {};
      let list = this.businessDeptInfoList || [];
      list.forEach(k => { obj[k.id] = k })
      return obj;
    },
    columns() {
      let list = [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '处理单',
          slot: 'receiptCheckQuestionNo',
          width: 220,
        },
        {
          title: '处理类型',
          slot: 'questionType',
          // align: 'center',
          width: 124,
        },
        {
          title: '处理状态',
          slot: 'questionStatus',
          width: 90,
          // align: 'center',
        },
        {
          title: '采购员',
          slot: 'purchaserId',
          // align: 'center',
          minWidth: 110,
        },
        {
          title: '收货人名称',
          key: 'receipterName',
          // align: 'center',
          minWidth: 110,
        },
        {
          title: '快递公司单号',
          slot: 'logisticsInfo',
          // align: 'center',
          minWidth: 120
        },
        {
          title: '采购单号',
          slot: 'purchaseNo',
          // align: 'center',
          minWidth: 130
        },
        {
          title: '存放编码',
          slot: 'slotCode',
          // align: 'center',
          width: 100
        },
        {
          title: 'SKU数量',
          key: 'skuCount',
          // align: 'center',
          width: 100
        },
        {
          title: '商品数量',
          key: 'productNumber',
          // align: 'center',
          width: 100
        },
        {
          title: '备注',
          key: 'remark',
          // align: 'center',
          minWidth: 100
        },
        {
          title: '创建时间',
          key: 'createdTime',
          // align: 'center',
          width: 100
        },
      ];
      if (this.tab == 2) {
        list.push({
          title: '操作',
          slot: 'action',
          align: 'left',
          fixed: 'right',
          minWidth: 100,
        })
      } else if(this.tab == 3) {
        list.push(
          {
            title: '处理完成时间',
            key: 'completionTime',
            width: 110,
            render(h, params) {
              return h('div', {
                style: {
                  marginLeft: '5px'
                }
              }, params.row.completionTime)
            },
          },
        )
      }
      return list;
    },
    power() {
      if (!['2', '3'].includes(this.tab)) return {};
      let _self = this;
      let temp = {
        2() {
          let powerList = {};
          let data = {
            // list: 'wms_receiptCheckQuestion',//查看列表
            edit: 'sps_problemPiece_processing_edit',//修改
            delete: 'sps_problemPiece_processing_delete',//删除
            exprotAl: 'sps_problemPiece_processing_exprotAll',//导出
            exportDetails: 'sps_problemPiece_processing_exprotSelected' // 导出明细
          }
          Object.keys(data).forEach(k => {
            powerList[k] = _self.getPermission(data[k]);
          })
          return powerList;
        },
        3() {
          let powerList = {};
          let data = {
            // list: 'wms_receiptCheckQuestionFinal',//查看列表
            exprotAl: 'sps_problemPiece_complete_exprotAll',//导出
            exportDetails: 'sps_problemPiece_complete_exprotSelected' // 导出明细
          }
          Object.keys(data).forEach(k => {
            powerList[k] = _self.getPermission(data[k]);
          })
          return powerList;
        }
      }
      return temp[this.tab]();
    },
  },
  methods: {
    // 生成日期，默认值为前7天
    getTime() {
      let dayjs = this.$common.dayjs();
      this.pageParams.startCreatedTime = dayjs.subtract(6, 'day').format('YYYY-MM-DD') + ' 00:00:00';
      this.pageParams.endCreatedTime = dayjs.format('YYYY-MM-DD') + ' 23:59:59';
    },
    // 表格勾选
    checkedDataHandel(data) {
      this.tableSelectionData = data;
    },
    // 获取快递公司
    getLogistics() {
      return new Promise((resolve) => {
        this.axios.post(api.logistics, {}, { hiddenError: true }).then(({ data }) => {
          if (data) {
            this.expressCompanyList = data.datas || [];
          }
          resolve(data);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 页面查询
    checkSearch() {
      this.pageParams.pageNum = 1; // 点击查询按钮将页码重置为1
      this.searchData();
    },
    reset() {
      this.$refs['pageParams'].resetFields();
      this.getTime();
    },
    // 获取筛选条件
    getParams() {
      let params = this.$common.removeEmpty(this.pageParams);
      // 处理中0,1 处理完成2,3
      params.questionStatusList = this.tab == 2 ? [0, 1, 4, 5] : this.tab == 3 ? [2, 3, 6, 7] : [];
      return params;
    },
    // 点击查询数据
    searchData() {
      this.TableLoading = true;
      this.axios.post(api.getReceiptCheckQuestion, this.getParams()).then(res => {
        this.tableSelectionData = [];
        if (res && res.data && res.data.datas) {
          this.tableList = res.data.datas.list;
          this.totalRecords = res.data.datas.total;
        } else {
          this.tableList = [];
          this.totalRecords = 0;
        }
      }).finally(() => {
        this.TableLoading = false;
      });
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.sortOrder = type;
      this.pageParams.sortField = feild;
      this.checkSearch();
    },
    // 表格分页
    changePage(page) {
      this.pageParams.pageNum = page;
      this.searchData();
    },
    // 切换每页条数
    changePageSize(size) {
      this.pageParams.pageSize = size;
      this.searchData();
    },
    // 创建时间
    createTimeChange(e) {
      this.pageParams.startCreatedTime = e[0] ? e[0] + ' 00:00:00' : null;
      this.pageParams.endCreatedTime = e[1] ? e[1] + ' 23:59:59' : null;
    },
    completionChange(e) {
      this.pageParams.startCompletionTime = e[0] ? e[0] : null;
      this.pageParams.endCompletionTime = e[1] ? e[1] : null;
    },
    // 查看处理单
    seeHandSheet(row, isEdit) {
      this.handSheetInfo.data = row;
      this.handSheetInfo.isEdit = isEdit;
      this.handSheetInfo.visible = true;
    },
    // 导出
    exportHand() {
      let rqApi = this.tab == 2 ? 'exporting' : 'exportHandleSync';
      this.exportLoad = true;
      this.axios.post(api[rqApi], this.getParams()).then(res => {
        if (res && res.data && res.data.code === 0) {
          this.$Message.success('导出成功, 请到 "导出查看" 页面进行查看');
        }
      }).finally(() => {
        this.exportLoad = false;
      })
    },
    // 删除处理单
    delSheet(row) {
      let typeList = this.processTypeList;
      let { receiptCheckQuestionId, questionType } = row;
      let label = typeList[questionType] && typeList[questionType].label;
      this.$Modal.confirm({
        width: 500,
        title: `确认是否要删除处理单：<span style="color:#f90;">${row.receiptCheckQuestionNo || ''}</span>`,
        content: `<p style="border: 1px solid #abdcff;background-color: #f0faff;padding: 8px;border-radius: 4px;color: #515a6e;font-size: 14px;line-height: 16px;">提示：删除处理单后，${label}的数量回退到剩余数</p>`,
        loading: true,
        onOk: () => {
          this.axios.delete(`/sps-service/wmsReceiptCheckQuestion/${receiptCheckQuestionId}`).then(({ data }) => {
            if (data && data.code === 0) {
              this.$Message.success('操作成功');
              this.checkSearch();
            }
          }).finally(() => {
            this.$Modal.remove();
          })
        }
      });
    },
    exportSelected() {
      if(this.tableSelectionData.length === 0) return this.$Message.error('请选择导出明细的处理单')
      let rqApi = this.tab == 2 ? 'exportSelected' : 'exportSelectedHandleSync';
      const params = this.getParams()
      this.exportLoad = true;
      params.receiptCheckQuestionNoList = this.tableSelectionData.map(item => item.receiptCheckQuestionNo)
      this.axios.post(api[rqApi], params).then(res => {
        if (res && res.data && res.data.code === 0) {
          this.$Message.success('导出成功, 请到 "导出查看" 页面进行查看');
          this.searchData();
        }
      }).finally(() => {
        this.exportLoad = false;
      })
    }
  },
}
</script>
<style lang="less">
.qualityInspectionDocument-page {
  height: 100%;
}
</style>