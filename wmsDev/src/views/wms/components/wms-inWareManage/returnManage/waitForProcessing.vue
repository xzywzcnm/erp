<template>
  <div class="waitForProcessingPage">
    <div class="listPage">
      <div class="searchMain">
        <Form ref="pageParams" :model="pageParams" :label-width="80">
          <dyt-filter ref="dyt-filter" @expand="expand">
            <FormItem label="处理类型:" prop="processType">
              <dyt-select v-model="pageParams.processType" clearable placeholder="请选择">
                <Option v-for="(item, index) in processTypeArr" :value="item.value" :key="index">{{ item.label }}
                </Option>
              </dyt-select>
            </FormItem>
            <FormItem label="处理单号:" prop="processCodeList">
              <dyt-input-tag :limit="1" v-model="pageParams.processCodeList" placeholder="多个用逗号或回车分开"
                type="textarea"></dyt-input-tag>
            </FormItem>
            <FormItem label="创建时间:" prop="createTime" :label-width="100">
              <DatePicker transfer type="datetimerange" placement="bottom-end" placeholder="选择日期" style="width: 100%"
                split-panels v-model="createTime" @on-clear="resetDate('create')" format="yyyy-MM-dd HH:mm:ss"
                :options="dateOptions" @on-change="(e) => { getDateValue(e, 'create') }" />
            </FormItem>
            <FormItem label="参考编号:" prop="referenceNoList">
              <dyt-input-tag :limit="1" v-model="pageParams.referenceNoList" placeholder="多个用逗号或回车分开"
                type="textarea"></dyt-input-tag>
            </FormItem>
            <FormItem label="供应商:" prop="supplierName">
              <Input v-model="pageParams.supplierName" clearable></Input>
            </FormItem>
            <FormItem label="快递公司:" prop="logisticsId">
              <dyt-select v-model="pageParams.logisticsId" :max-tag-count="1" clearable placeholder="请选择">
                <Option v-for="(item, index) in expressCompanyList" :value="item.logisticsId" :key="index">{{
                  item.logisticsName }} </Option>
              </dyt-select>
            </FormItem>
            <FormItem label="快递单号:" prop="trackingNumber">
              <Input v-model="pageParams.trackingNumber" clearable></Input>
            </FormItem>
            <FormItem label="收货人名称:" prop="contactMan">
              <Input v-model="pageParams.contactMan" clearable></Input>
            </FormItem>
            <div slot="operation" style="margin-bottom: 30px;">
              <Button type="primary" @click="search" icon="ios-search" class="mr10">查询</Button>
              <Button @click="reset" v-once icon="md-refresh">重置</Button>
            </div>
          </dyt-filter>
        </Form>
      </div>
      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <Button @click="signProcessed" type="primary" class="mr20">标记处理完结</Button>
            <Button type="primary" v-if="pagePermission.export" @click="exportBtn">导出</Button>
          </div>
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>
      <div class="tableMain">
        <div class="tableBox">
          <Table ref="selection" highlight-row :border="true" :loading="tableLoading" :height="tableHeight"
            :columns="columns" :data="tableData" @on-selection-change="getSelectValue">
            <template slot-scope="{ row }" slot="remark">
              <Tooltip max-width="300">
                <div class="remarkStyle" v-if="row.remark">处理单备注：{{ row.remark }}</div>
                <div class="remarkStyle" v-if="row.refundRemark">退货备注：{{ row.refundRemark }}</div>
                <div slot="content">
                  <div v-if="row.remark">处理单备注：{{ row.remark }}</div>
                  <div v-if="row.refundRemark">退货备注：{{ row.refundRemark }}</div>
                </div>
              </Tooltip>
            </template>
          </Table>
        </div>
      </div>
      <div class="pagesMain">
        <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
          :current="pageParams.pageNum" show-sizer @on-page-size-change="changePageSize" placement="top"
          :page-size-opts="pageArray"></Page>
      </div>
    </div>
    <handleOrderModal :dialog-obj="handleOrderData" @refresh="getList"></handleOrderModal>
  </div>
</template>
<script>
import api from '@/api/api';
import common from '@/components/mixin/common_mixin';
import handleOrderModal from "./component/handleOrderModal.vue";
import tableHeight_mixin from "@/components/mixin/tableHeight_mixin";
export default {
  mixins: [common, tableHeight_mixin],
  components: { handleOrderModal },
  data() {
    return {
      pageParams: {
        processType: null, // 处理类型
        processCodeList: [], // 处理单号
        createTimeStart: null, // 创建时间
        createTimeEnd: null,
        referenceNoList: [], // 参考编号
        supplierName: null, // 供应商
        logisticsId: null, // 快递公司
        trackingNumber: null, // 快递单号
        contactMan: null, // 收货人
        pageNum: 1,
        pageSize: 30,
        upDown: 'DESC',
        orderBy: 'CT',
        warehouseId: this.getWarehouseId()
      },
      processAllocationMap: {
        1: { value: '退供', color: '#996600' },
        2: { value: '质检入库', color: '#CC66CC' },
        3: { value: '维修入库', color: '#9900FF' },
        4: { value: '上架入库', color: '#009966' },
        5: { value: '销毁', color: '#FF6600' },
      },
      columns: [
        {
          type: "selection",
          width: 55,
          align: "center",
        },
        {
          key: "processCode",
          title: "处理单号",
          align: "center",
          minWidth: 140,
          render: (h, params) => {
            return h('span', {
              style: {
                color: '#0000FF',
                cursor: 'pointer',
                textDecoration: 'underline'
              },
              on: {
                click: () => {
                  this.openHandleOrder(params.row, 'view');
                }
              }
            }, params.row.processCode)
          }
        },
        {
          key: "referenceNo",
          align: "center",
          title: "参考编号",
          minWidth: 130,
        },
        {
          key: 'processType',
          align: 'center',
          title: '处理类型',
          width: 100,
          render: (h, params) => {
            let item = this.processAllocationMap[params.row.processType] || {};
            return h('Tag', {
              props: { color: item.color },
              style: {
                display: item.value ? 'inline-block' : 'none',
              }
            }, item.value)
          }
        },
        {
          key: "supplierName",
          align: "center",
          title: "供应商",
          minWidth: 120,
        },
        {
          key: "contactMan",
          align: "center",
          title: "收货人名称",
          width: 100,
        },
        {
          key: "trackingNumber",
          align: "center",
          title: "快递公司单号",
          minWidth: 120,
          render: (h, params) => {
            return [
              h('div', {}, params.row.logisticsName),
              h('div', {}, params.row.trackingNumber)
            ]
          }
        },
        {
          key: "skuQuantity",
          align: "center",
          title: "SKU数量",
          width: 100,
        },
        {
          key: "productQuantity",
          align: "center",
          title: "商品数量",
          width: 100,
        },
        {
          key: "receiptQuantity",
          align: "center",
          title: "收货数量",
          width: 100,
        },
        {
          key: "remark",
          align: "center",
          title: "备注",
          minWidth: 120,
          slot: 'remark',
        },
        {
          key: "createTime",
          align: "center",
          title: "创建时间",
          width: 100
        },
        {
          key: 'operation',
          align: 'center',
          title: '操作',
          width: 80,
          render: (h, params) => {
            let button = h('span', {
              style: {
                color: '#0000FF',
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  this.openHandleOrder(params.row, 'edit')
                }
              }
            }, '修改')
            button = params.row.processType == 1 && this.pagePermission.edit ? button : ''
            return button
          }
        }
      ],
      sortButtonList: [
        {
          sortHeader: '按创建时间',
          sortField: 'CT',
          sortType: 'DESC',
          default: true
        }
      ],
      processTypeArr: [
        { label: '退供', value: 1 },
        { label: '销毁', value: 5 }
      ],
      expressCompanyList: [],
      createTime: [],
      tableLoading: false,
      tableData: [],
      total: 0,
      selectionArr: [],
      handleOrderData: {
        modelVisible: false,
        data: [],
        type: 'view',
        detailsData: {}
      }
    }
  },
  created() {
    this.getLogistics()
    this.getList()
  },
  computed: {
    pagePermission() {
      return {
        // 修改按钮
        edit: this.getPermission('fullManagedReturn_waitRefundedUpdate'),
        // 导出
        export: this.getPermission('fullManagedReturn_waitRefundedExport')
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.computedTableHeight();
    })
  },
  methods: {
    // 获取快递公司
    getLogistics() {
      return new Promise((resolve) => {
        this.axios.post(api.get_logistics, {}, { hiddenError: true }).then(({ data }) => {
          if (data) {
            this.expressCompanyList = data.datas || [];
          }
          resolve(data);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    resetDate(type) {
      this.pageParams[`${type}TimeStart`] = null;
      this.pageParams[`${type}TimeEnd`] = null;
    },
    getDateValue(value, name) {
      if (value && value.length > 0 && value[0] != "") {
        this.pageParams[`${name}TimeStart`] = value[0];
        this.pageParams[`${name}TimeEnd`] = value[1];
      }
    },
    getList() {
      this.selectionArr = []
      let obj = this.$common.copy(this.pageParams)
      this.tableLoading = true
      this.axios.post(api.query_waitRefundedList, obj).then(res => {
        if (res.data.code == 0) {
          this.tableData = res.data.datas.list
          this.total = res.data.datas.total
        }
      }).finally(() => {
        this.tableLoading = false
      })
    },
    reset() {
      this.$refs['pageParams'].resetFields();
      this.resetDate('create')
      this.createTime = []
    },
    search() {
      this.pageParams.pageNum = 1
      this.getList()
    },
    // 导出
    exportBtn() {
      this.tableLoading = true
      let obj = this.$common.copy(this.pageParams)
      this.axios.post(api.waitRefunded_export, obj).then(res => {
        if (res.data.code == 0) {
          this.$Message.success('导出完成')
        }
      }).finally(() => {
        this.tableLoading = false
      })
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.orderBy = feild;
      this.pageParams.upDown = type;
      this.getList();
    },
    getSelectValue(val) {
      this.selectionArr = val;
    },
    // 标记处理完结
    signProcessed() {
      if (!this.selectionArr.length) return this.$Message.error('请选择数据')
      this.$Modal.confirm({
        title: '操作提示',
        content: `认是否要标记已处理完结，数量：<span style="color:red">${this.selectionArr.length}</span>`,
        loading: true,
        onOk: () => {
          // 请求
          let temp = this.selectionArr.map(item => {
            return {
              returnId: item.returnId,
              returnHandleId: item.returnHandleId
            }
          })
          this.axios.post(api.processingCompletion, temp).then(res => {
            if (res.data.code == 0) {
              this.$Message.success('操作成功')
              this.getList()
            }
          }).finally(() => {
            this.$Modal.remove();
          })
        }
      })
    },
    changePageSize(val) {
      this.pageParams.pageNum = 1
      this.pageParams.pageSize = val
      this.getList()
    },
    changePage(val) {
      this.pageParams.pageNum = val
      this.getList()
    },
    // 查看修改处理单
    openHandleOrder(row, type) {
      this.tableLoading = true
      this.axios.get(`${api.view_refundHandle}?returnHandleId=${row.returnHandleId}`).then(res => {
        if (res.data.code == 0) {
          if (this.$common.isEmpty(res.data.datas)) return this.$Message.error('该处理单无数据')
          this.handleOrderData.type = type
          this.handleOrderData.detailsData = res.data.datas
          this.handleOrderData.detailsData.returnHandleId = row.returnHandleId
          this.handleOrderData.data = res.data.datas.spsRefundHandleDetailInfoList
          this.handleOrderData.modelVisible = true
        }
      }).finally(() => {
        this.tableLoading = false
      })
    }
  },
}
</script>
<style lang="less">
.remarkStyle {
  width: 110px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.waitForProcessingPage {
  flex: 1;
  overflow: hidden;
}
</style>