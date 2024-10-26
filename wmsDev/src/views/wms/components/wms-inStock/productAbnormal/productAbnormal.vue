<template>
  <div class="productAbnormal">
    <template v-if="curShow == 'managementPage'">
      <div class="listPage">
        <div class="searchMain">
          <Form ref="pageSearchForm" :model="searchFormData" :label-width="90">
            <Tabs v-model="tabIndex" @on-click="showCurrentPage">
              <TabPane label="全部" name="-1"></TabPane>
              <TabPane v-for="item in statusList" :label="item.label" :key="item.value" :name="item.value"></TabPane>
            </Tabs>
            <dyt-filter ref="dyt-filter" @expand="expand">
              <FormItem label="到货异常编号" prop="abnormalArrivalNoList">
                <dyt-input-tag :limit="1" type="textarea" v-model="searchFormData.abnormalArrivalNoList"
                  placeholder="请输入sku，多个请用逗号或回车分隔" />
              </FormItem>
              <FormItem label="包裹/物流单号" prop="referenceNoList">
                <dyt-input-tag :limit="1" type="textarea" v-model="searchFormData.referenceNoList"
                  placeholder="请输入sku，多个请用逗号或回车分隔" />
              </FormItem>
              <FormItem label="异常采购单号" prop="abnormalPurchaseNumberList">
                <dyt-input-tag :limit="1" type="textarea" v-model="searchFormData.abnormalPurchaseNumberList"
                  placeholder="请输入sku，多个请用逗号或回车分隔" />
              </FormItem>
              <FormItem label="创建时间" prop="createTime">
                <DatePicker type="datetimerange" transfer placeholder="选择创建时间" v-model="searchFormData.createTime"
                  format="yyyy-MM-dd HH:mm:ss" :options="datePickerOptions" />
              </FormItem>
              <FormItem label="更新时间" prop="updatedTime">
                <DatePicker type="datetimerange" transfer placeholder="选择创建时间" v-model="searchFormData.updatedTime"
                  format="yyyy-MM-dd HH:mm:ss" :options="datePickerOptions" />
              </FormItem>
              <FormItem label="供应商名称" prop="supplierName">
                <dyt-input v-model.trim="searchFormData.supplierName" placeholder="请输入供应商名称" />
              </FormItem>
              <FormItem label="异常类型" prop="abnormalType">
                <dyt-select v-model="searchFormData.abnormalType">
                  <Option v-for="(item, index) in Object.values(abnormalData)" :value="item.value" :key="`a-${index}`"
                    :label="item.label" />
                </dyt-select>
              </FormItem>
              <FormItem label="采购处理措施" prop="processMeasureList">
                <dyt-select v-model="searchFormData.processMeasureList" multiple :max-tag-count="1">
                  <Option v-for="(item, index) in handlingMeasuresList" :value="item.value" :key="`a-${index}`"
                    :label="item.label" />
                </dyt-select>
              </FormItem>
              <FormItem label="采购员" prop="purchaserIdList">
                <dyt-select v-model="searchFormData.purchaserIdList" multiple :max-tag-count="1">
                  <Option v-for="(item, index) in Object.values(userInfoList)" :value="item.userId" :key="`u-${index}`"
                    :label="item.userName" />
                </dyt-select>
              </FormItem>
              <FormItem label="创建人" prop="createdByList">
                <dyt-select v-model="searchFormData.createdByList" multiple :max-tag-count="1">
                  <Option v-for="(item, index) in Object.values(userInfoList)" :value="item.userId" :key="`u-${index}`"
                    :label="item.userName" />
                </dyt-select>
              </FormItem>
              <FormItem label="异常sku" prop="abnormalSkuList">
                <dyt-input-tag :limit="1" type="textarea" v-model="searchFormData.abnormalSkuList"
                  placeholder="请输入sku，多个请用逗号或回车分隔" />
              </FormItem>
              <FormItem label="寄出物流单号" prop="shipmentTrackingNumberList">
                <dyt-input-tag :limit="1" type="textarea" v-model="searchFormData.shipmentTrackingNumberList"
                  placeholder="请输入寄出物流单号，多个请用逗号或回车分隔" />
              </FormItem>
              <FormItem label="入库出库处理编号" prop="handleNoList" :label-width="120">
                <dyt-input-tag :limit="1" type="textarea" v-model="searchFormData.handleNoList"
                  placeholder="请输入入库出库处理编号，多个请用逗号或回车分隔" />
              </FormItem>
              <div slot="operation">
                <Button type="primary" @click="searchData(true)" :disabled="searchLoading" icon="md-search">查询</Button>
                <Button style="margin-left: 10px" @click="resetSearch" v-once icon="md-refresh">重置
                </Button>
              </div>
            </dyt-filter>
          </Form>
        </div>

        <div class="funMain funMain__flex">
          <!--工具-->
          <div>
            <Button type="primary" icon="md-add" @click="addEditViewData({}, 'add')" v-if="permission.add">新增</Button>
            <Dropdown @on-click="exportData" class="ml10" v-if="permission.export">
              <Button type="primary">
                Execl导出
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name="check">导出选中数据</DropdownItem>
                <DropdownItem name="all">导出所有结果集</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button
              class="ml10"
              type="primary"
              @click="submitDataBatch"
              :loading="submitLoading"
              v-if="permission.batchSubmit && [1,2,3].includes(Number(tabIndex))"
            >提交</Button>
          </div>
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch"
              :currentSort="currentSort">
            </dyt-sortBySelect>
          </div>
        </div>

        <div class="tableMain">
          <div class="tableBox">
            <!--表格-->
            <Table border highlight-row :height="tableHeight" ref="tableRef" :columns="tableColumns"
              :loading="searchLoading" :data="tableDaata" @on-selection-change="tableSelectionChange"
              :span-method="handleSpan" class="tableCellPadding">
              <template slot-scope="{ row }" slot="abnormalImage">
                <dyt-previewImg :url="row.abnormalImage"></dyt-previewImg>
              </template>
            </Table>
          </div>
        </div>
        <!--分页-->
        <div class="pagesMain">
          <Page :total="tableTotal" :current="searchFormData.pageNum" :page-size="searchFormData.pageSize" show-total
            show-sizer show-elevator @on-change="pageNumChange" @on-page-size-change="pageSizeChange"
            :page-size-opts="pageArray">
          </Page>
        </div>
      </div>
    </template>
    <!-- 添加、详情、编辑 -->
    <detailsPage :visibled.sync="detailsVisible" :moduleData="detailsData" :otherOption="{
      reasonJson: reasonJson,
      measureJson: measureJson,
      resultJson: resultJson,
    }" @resetTable="resetTable" @createAddApply="createAddApply" />
    <!-- 此处为跳转到创建入库出库申请单 -->
    <Transition name="bounce">
      <template v-if="curShow == 'addReceive'">
        <div class="subLayer infoDetails">
          <div class="topper">
            <span class="arrowLeft" @click="goBack">
              <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
            </span>
            <div style="margin-left: 130px; position: absolute">
              <Button type="primary" class="mr10" @click="submitOrSave('submit')">提交</Button>
              <Button type="primary" class="mr10" @click="submitOrSave('save')">暂存</Button>
            </div>
          </div>
          <div class="mainContent">
            <addReceivedProApply ref="addReceivedProApply" @goBack="goBack" :abnormalData="receiveData">
            </addReceivedProApply>
          </div>
        </div>
      </template>
    </Transition>
  </div>
</template>

<script>
import compoundBtn from "@/views/wms/components/common/compoundBtn";
import api from "@/api/api";
import common from "@/components/mixin/common_mixin";
import tableHeight_mixin from "@/components/mixin/tableHeight_mixin";
import detailsPage from "./details.vue";
import addReceivedProApply from "../addReceivedProApply.vue";
// 异常原因
const reasonJson = {
  1: { label: "多发数量", value: 1 },
  2: { label: "少发数量", value: 2 },
  3: { label: "错发数量", value: 3 },
  4: { label: "质量问题", value: 4 },
  5: { label: "其他问题", value: 5 },
};
// 采购处理措施
const measureJson = {
  1: { label: "原采购单入库", value: 1 },
  2: { label: "安排进行退回", value: 2 },
  3: { label: "建采购单入库", value: 3 },
  4: { label: "其他处理措施", value: 4 },
};
// 仓库处理结果
const resultJson = {
  1: { label: "已经完成入库", value: 1 },
  2: { label: "移交售后退回", value: 2 },
  3: { label: "其他处理措施", value: 3 },
};
// 不合并行的列
const notMergeColKey = [
  "abnormalPurchaseNumber",
  "abnormalSku",
  "abnormalNumber",
  "abnormalReason",
  "abnormalWarehouseReason",
  "warehouseReason",
  "abnormalImage",
];
const powerList = {
  1: "waitsubmit",
  2: "waitHandlerSubmit",
  3: "waitAfterSaleSubmit",
};

export default {
  mixins: [common, tableHeight_mixin],
  components: {
    compoundBtn,
    detailsPage,
    addReceivedProApply
  },
  data() {
    return {
      searchLoading: false,
      detailsVisible: false,
      submitLoading: false,
      tabIndex: "-1",
      detailsData: {
        viewType: "view",
        details: {},
      },
      tableSelectionData: [],
      reasonJson: reasonJson,
      measureJson: measureJson,
      resultJson: resultJson,
      searchFormData: {
        // selectType: "abnormalArrivalNoList",
        // selectMatchingValue: [],
        updatedTime: [],
        createTime: [],
        supplierName: null,
        status: null,
        abnormalType: null,
        purchaserIdList: [],
        createdByList: [],
        abnormalSkuList: [],
        abnormalArrivalNoList: [],
        referenceNoList: [],
        abnormalPurchaseNumberList: [],
        processMeasureList: [],
        shipmentTrackingNumberList: [],
        handleNoList: [],
        orderBy: "CT", // 排序缓存值
        orderSeq: "DESC", // 排序
        pageNum: 1,
        pageSize: 20,
      },
      tableTotal: 0,
      statusList: {
        1: { label: "待提交", value: '1' },
        2: { label: "待处理", value: '2' },
        3: { label: "待售后", value: '3' },
        4: { label: "已完成", value: '4' },
      },
      abnormalData: {
        1: { label: "产品异常", value: 1 },
        2: { label: "包裹异常", value: 2 },
      },
      handlingMeasuresList: [
        { label: '原采购单入库', value: 1 },
        { label: '安排进行退回', value: 2 },
        { label: '建采购单入库', value: 3 },
        { label: '其他处理措施', value: 4 },
      ],
      tableDaata: [],
      tableColumns: [
        {
          type: "selection",
          width: 40,
          align: "center",
        },
        {
          title: "到货异常信息",
          key: "abnormalArrivalNo",
          align: "center",
          minWidth: 150,
          render: (h, { row }) => {
            let colorMap = {
              1: { color: 'cyan' },
              2: { color: 'orange' },
              3: { color: 'cyan' },
              4: { color: 'green' },
            }
            return h('div', {
              class: "tag-hideBorder",
              style: {
                textAlign: 'left'
              }
            }, [
              h("div", {
                style: {
                  cursor: "pointer",
                  color: "#2d8cf0",
                },
                on: {
                  click: () => {
                    this.addEditViewData(row, "view");
                  },
                },
              },
              row.abnormalArrivalNo
              ),
              h("div", row.supplierName),
              h(
                "div",
                {
                  class: "tag-hideBorder",
                },
                [
                  h("Tag", {
                    props: { color: colorMap[row.status] ? colorMap[row.status].color : 'orange' },
                    style: {
                      display: this.statusList[row.status] ? 'inline-block' : 'none',
                    }
                  }, this.statusList[row.status] ? this.statusList[row.status].label : ''),
                  h("Tag", {
                    props: { color: 'primary' },
                    style: {
                      display: row.businessDeptName ? 'inline-block' : 'none',
                    }
                  }, row.businessDeptName)
                ]
              )
            ])
          },
        },
        {
          title: "采购员",
          key: "purchaserName",
          align: "center",
          width: 100,
        },
        {
          title: "异常类型",
          key: "abnormalType",
          align: "center",
          width: 70,
          render: (h, { row }) => {
            if (
              this.$common.isEmpty(row.abnormalType) ||
              this.$common.isEmpty(this.abnormalData[row.abnormalType])
            ) { return h("div", {}, ""); }
            return h("div", {}, this.abnormalData[row.abnormalType].label);
          },
        },
        {
          title: "包裹/物流单号",
          key: "referenceNo",
          align: "center",
          width: 120,
        },
        {
          title: "异常采购单号",
          key: "abnormalPurchaseNumber",
          align: "center",
          width: 120,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.abnormalPurchaseNumber)) { return h("div", {}, "-"); }
            return h("div", {}, row.abnormalPurchaseNumber);
          },
        },
        {
          title: "异常SKU",
          key: "abnormalSku",
          align: "center",
          width: 100,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.abnormalSku)) return h("div", {}, "-");
            return h("div", {}, row.abnormalSku);
          },
        },
        {
          title: "异常数量",
          key: "abnormalNumber",
          align: "center",
          width: 60,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.abnormalNumber)) { return h("div", {}, "-"); }
            return h("div", {}, row.abnormalNumber);
          },
        },
        {
          title: "异常原因",
          key: "abnormalReason",
          align: "center",
          minWidth: 90,
          render: (h, { row }) => {
            if (
              this.$common.isEmpty(row.abnormalReason) ||
              this.$common.isEmpty(this.reasonJson[row.abnormalReason])
            ) { return h("div", {}, "-"); }
            return h("div", {}, this.reasonJson[row.abnormalReason].label);
          },
        },
        {
          title: "仓库异常说明",
          key: "abnormalWarehouseReason",
          align: "center",
          ellipsis: true,
          tooltip: true,
          minWidth: 100,
        },
        {
          title: "采购/仓库处理说明",
          key: "warehouseReason",
          align: "center",
          ellipsis: true,
          tooltip: true,
          minWidth: 120,
        },
        {
          title: "图片说明",
          key: "abnormalImage",
          align: "center",
          width: 70,
          slot: 'abnormalImage'
        },
        {
          title: "寄出数量",
          key: "shipmentNumber",
          width: 60,
          align: 'center',
        },
        {
          title: "采购处理措施",
          key: "processMeasure",
          align: "center",
          ellipsis: true,
          tooltip: true,
          minWidth: 90,
          render: (h, { row }) => {
            if (
              this.$common.isEmpty(row.processMeasure) ||
              this.$common.isEmpty(this.measureJson[row.processMeasure])
            ) { return h("div", {}, "-"); }
            return h("div", {}, this.measureJson[row.processMeasure].label);
          },
        },
        {
          title: "采购处理说明",
          key: "parentProcessReason",
          align: "center",
          ellipsis: true,
          tooltip: true,
          minWidth: 120,
        },
        {
          title: "创建人/创建/更新时间",
          key: "workingStatus",
          align: "center",
          width: 130,
          render: (h, { row }) => {
            return h("div", {}, [
              h("div", {}, row.createdBy || "-"),
              h("div", {}, row.createdTime || "-"),
              h("div", {}, row.updatedTime || "-"),
            ]);
          },
        },
        {
          title: "操作",
          key: "operation",
          align: "center",
          width: 80,
          fixed: "right",
          render: (h, { row }) => {
            let status = row.status;
            if (!this.$common.isEmpty(row.status) && !this.$common.isEmpty(Number(row.status))) {
              status = Number(row.status);
            }
            const power = this.permission[powerList[status]];
            return h(
              compoundBtn,
              {
                props: {
                  dropList: [
                    {
                      label: "详情",
                      value: "view",
                      flagCode: [1, 2, 3, 4],
                      status: this.permission.view ? status : -1,
                    },
                    {
                      label: "提交",
                      value: "submit",
                      flagCode: [1, 2, 3],
                      status: power ? status : -1,
                    },
                    {
                      label: "删除",
                      value: "del",
                      flagCode: [1],
                      status: this.permission.delete ? status : -1,
                    },
                  ],
                  title: "详情",
                  value: "view",
                  status: status,
                  flagCode: [1, 2, 3, 4],
                  disabled: !this.permission.view,
                },
                on: {
                  click: (val) => {
                    if (["view", "submit"].includes(val)) {
                      this.addEditViewData(row, val);
                      return;
                    }
                    this.deleteRow(row);
                  },
                },
              },
              []
            );
          },
        },
      ],
      curShow: 'managementPage',
      receiveData: {},
      // warehouseId: this.$store.state.warehouseId,
      sortButtonList: [
        {
          sortHeader: "按创建时间",
          sortField: "CT",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "按更新时间",
          sortField: "UT",
          sortType: "DESC",
        },
      ],
    };
  },
  watch: {},
  computed: {
    // 权限
    permission() {
      return {
        // 查询
        query: this.getPermission("processAbnormalArrival_list"),
        // 查看
        view: this.getPermission("processAbnormalArrival_detail"),
        // 新增
        add: this.getPermission("processAbnormalArrival_addOrUpdateProcess"),
        // 导出
        export: this.getPermission("processAbnormalArrival_export"),
        // 删除
        delete: this.getPermission("processAbnormalArrival_delete"),
        // 待提交
        waitsubmit: this.getPermission("processAbnormalArrival_waitubmit"),
        // 待处理提交
        waitHandlerSubmit: this.getPermission("processAbnormalArrival_waitHandlerSubmit"),
        // 待售后提交
        waitAfterSaleSubmit: this.getPermission("processAbnormalArrival_waitAfterSaleSubmit"),
        // 批量提交
        batchSubmit: this.getPermission("processAbnormalArrival_submitBatch"),
      };
    },
    // 用户列表
    userInfoList() {
      return this.$store.state.userInfoList;
    },
    currentSort() {
      let { orderBy, orderSeq } = this.searchFormData;
      return { sortField: orderBy, sortType: orderSeq };
    },
  },
  created() { },
  mounted() {
    this.searchData();
  },
  methods: {
    resetTable(obj) {
      this.searchData(obj.type, obj.resetTime);
    },
    // 列表数据查询
    searchData(type, resetTime) {
      if (!this.permission.query) {
        this.$Message.error("你暂无权限");
        return;
      }
      // 是否重置页码
      if (type) {
        this.searchFormData.pageNum = 1;
      }
      // 是否重置时间范围
      if (resetTime) {
        this.searchFormData.createTime = [];
        this.searchFormData.updatedTime = []
      }
      this.searchFormData.status = this.tabIndex < 0 ? null : this.tabIndex - 0;

      this.searchLoading = true;
      this.$nextTick(() => {
        this.tableSelectionData = [];
        let newList = [];
        let oldRow = {};
        const setValKeys = [
          "abnormalWarehouseReason",
          "warehouseReason",
          "parentProcessReason",
        ];
        this.axios
          .post(api.abnormalList, this.getSearchParams())
          .then((res) => {
            if (!res || !res.data || res.data.code != 0) {
              this.tableTotal = 0;
              this.tableDaata = newList;
              this.searchLoading = false;
              return;
            }
            this.tableTotal = res.data.datas.total;
            (res.data.datas.list || []).forEach((row, index) => {
              oldRow = this.$common.copy(row);
              oldRow.parentProcessReason = row.processReason;
              delete oldRow.processAbnormalArrivalDetailVOS;
              if (!this.$common.isEmpty(row.processAbnormalArrivalDetailVOS)) {
                row.processAbnormalArrivalDetailVOS.forEach((item, sIndex) => {
                  newList.push({
                    ...oldRow,
                    ...item,
                    warehouseReason: item.processReason,
                    rowspan:
                      sIndex == 0
                        ? row.processAbnormalArrivalDetailVOS.length
                        : 0,
                    colspan: sIndex == 0 ? 1 : 0,
                  });
                });
              } else {
                newList.push({
                  ...oldRow,
                  rowspan: 1,
                  colspan: 1,
                });
              }
            });
            this.tableDaata = newList.map((row) => {
              setValKeys.forEach((key) => {
                if (this.$common.isEmpty(row[key])) {
                  row[key] = "-";
                }
              });
              return row;
            });
            this.searchLoading = false;
          })
          .catch(() => {
            this.tableTotal = 0;
            this.tableDaata = newList;
            this.searchLoading = false;
          });
      });
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.searchFormData.orderSeq = type;
      this.searchFormData.orderBy = feild;
      this.showCurrentPage();
    },
    // 处理合并行列
    handleSpan({ row, column, rowIndex, columnIndex }) {
      if (notMergeColKey.includes(column.key)) {
        return { rowspan: 1, colspan: 1 };
      }
      return { rowspan: row.rowspan, colspan: row.colspan };
    },
    // 获取搜索条件
    getSearchParams() {
      let paramsData = this.$common.copy(this.searchFormData);
      if (
        !this.$common.isEmpty(paramsData.createTime) &&
        !this.$common.isEmpty(paramsData.createTime[0])
      ) {
        paramsData.createdStartTime = this.$common.toLocaleDate(
          paramsData.createTime[0],
          "fulltime",
          0
        );
        paramsData.createdEndTime = this.$common.toLocaleDate(
          paramsData.createTime[1],
          "fulltime",
          0
        );
      }
      if (
        !this.$common.isEmpty(paramsData.updatedTime) &&
        !this.$common.isEmpty(paramsData.updatedTime[0])
      ) {
        paramsData.updatedStartTime = this.$common.toLocaleDate(
          paramsData.updatedTime[0],
          "fulltime",
          0
        );
        paramsData.updatedEndTime = this.$common.toLocaleDate(
          paramsData.updatedTime[1],
          "fulltime",
          0
        );
      }
      paramsData.warehouseId = this.warehouseId;
      delete paramsData.createTime;
      return paramsData;
    },
    showCurrentPage(e) {
      if (!this.$common.isEmpty(e)) {
        let condition = [-1, 1, 2, 4].includes(Number(e));
        let orderBy = condition ? 'CT' : 'UT';
        let orderSeq = condition ? 'DESC' : 'ASC';
        this.searchFormData.orderBy = orderBy;
        this.searchFormData.orderSeq = orderSeq;
      }
      this.searchFormData.pageNum = 1;
      this.searchData();
    },
    // 重置搜索条件
    resetSearch() {
      this.$refs["pageSearchForm"].resetFields();
      this.$nextTick(() => {
        this.searchFormData.createTime = [];
        this.searchFormData.updatedTime = [];
      });
    },
    // 类型改变时
    abnormalChange(val) {
      this.searchFormData.selectMatchingValue = "";
    },
    // 列表选中数据
    tableSelectionChange(val) {
      this.tableSelectionData = val;
      if (this.$common.isEmpty(val)) {
        this.tableDaata.forEach((row, index) => {
          this.$set(this.tableDaata[index], "_checked", false);
        });
      } else {
        const ids = this.$common.arrRemoveRepeat(
          val.map((row) => row.abnormalArrivalId)
        );
        this.tableDaata.forEach((row, index) => {
          this.$set(
            this.tableDaata[index],
            "_checked",
            ids.includes(row.abnormalArrivalId)
          );
        });
      }
    },
    // 页码改变
    pageNumChange(page) {
      this.searchFormData.pageNum = page;
      this.$nextTick(() => {
        this.searchData();
      });
    },
    // 条数改变
    pageSizeChange(size) {
      this.searchFormData.pageSize = size;
      this.$nextTick(() => {
        this.searchData();
      });
    },
    // 新增、提交、查看
    addEditViewData(row, viewType) {
      this.detailsData = {
        viewType: viewType,
        warehouseId: this.warehouseId,
        details: row,
      };
      this.$nextTick(() => {
        this.detailsVisible = true;
      });
    },
    // 删除
    deleteRow(row) {
      if (
        !this.permission.delete ||
        row.deleteLoading ||
        this.$common.isEmpty(row.abnormalArrivalId)
      ) { return; }
      this.$Modal.confirm({
        title: "操作提示",
        content: `确认删除：${row.abnormalArrivalNo}？`,
        onOk: () => {
          this.$set(row, "deleteLoading", true);
          this.axios
            .post(
              `${api.abnormalDelete}?abnormalArrivalId=${row.abnormalArrivalId}`
            )
            .then((res) => {
              if (!res || !res.data || res.data.code != 0) return;
              this.$Message.success("操作成功！");
              this.searchData();
            })
            .finally(() => {
              this.$set(row, "deleteLoading", false);
            });
        },
      });
    },
    // 批量提交
    submitDataBatch () {
      if (this.$common.isEmpty(this.tableSelectionData)) {
        return this.$Message.error("请选择需要导出的数据");
      }
      if (this.submitLoading) {
        return this.$Message.error("正在处提交出任务，请稍后再做此操作");
      }
      let idList = [];
      let allIds = [];
      this.tableSelectionData.forEach(row => {
        if (!allIds.includes(row.abnormalArrivalId)) {
          allIds.push(row.abnormalArrivalId);
        }
        if ([1, 2, 3].includes(Number(row.status)) && !idList.includes(row.abnormalArrivalId)) {
          idList.push(row.abnormalArrivalId);
        }
      });
      if (idList.length == 0) {
        return this.$Message.error("您选中的数据中不存在符合提交的数据");
      }
      let content = `您确认选中的<span style="font-weight: 800;color:#f20"> ${idList.length} </span>条数据都提交？`;
      if (idList.length != allIds.length) {
        content = `<div>
          您选中的数据中，其中有<span style="font-weight: 800;color:#f20"> ${idList.length} </span>
          条符合提交要求，有 <span style='font-weight: 800;color:#f20'> ${allIds.length - idList.length} </span>条不符合提交，是否提交？
        </div>`;
      }
      this.$Modal.confirm({
        title: '提交确认',
        content: content,
        onOk: () => {
          this.submitLoading = true;
          this.axios.post(api.processSubmitBatch, idList).then((res) => {
            if (!res || !res.data || res.data.code != 0) return;
            this.$Message.success(`提交成功！`);
            this.$nextTick(() => {
              this.searchData();
            })
          }).finally(() => {
            this.submitLoading = false;
          });
        }
      })
    },
    // 导出
    exportData(str) {
      if (!["check", "all"].includes(str)) return;
      if (this.exportLoading) {
        this.$Message.error("正在处理导出任务，请稍后再做此操作");
        return;
      }
      let paramsObj = this.getSearchParams();
      if (str == "check") {
        if (this.$common.isEmpty(this.tableSelectionData)) {
          this.$Message.error("请选择需要导出的数据");
          return;
        }
        const exportId = this.tableSelectionData
          .map((row) => row.abnormalArrivalId)
          .filter((id) => !this.$common.isEmpty(id));
        paramsObj = {
          warehouseId: this.warehouseId,
          abnormalArrivalIdList: this.$common.arrRemoveRepeat(exportId),
        };
      }
      this.exportLoading = true;
      this.axios.post(api.abnormalExport, paramsObj).then((res) => {
        if (!res || !res.data || res.data.code != 0) return;
        this.$Message.success(`导出成功，可在导出任务中查看${res.data.datas ? '：' + res.data.datas : ''}！`);
      }).finally(() => {
        this.exportLoading = false;
      });
    },
    // 创建出库入库申请 方法
    // 返回管理页面
    goBack() {
      this.curShow = "managementPage";
      this.searchData()
    },
    // 提交或保存入库出库申请
    submitOrSave(type) {
      this.$refs.addReceivedProApply.submitOrSave(type);
    },
    // 打开创建出入库单申请
    createAddApply(data) {
      this.receiveData = data
      this.$nextTick(() => {
        this.curShow = "addReceive";
      })
    }
  },
};
</script>

<style lang="less">
.productAbnormal {
  height: 100%;
  position: relative;

  .searchMain {
    .input-merge-form-item {
      :deep(.ivu-form-item-content) {
        width: 360px;
      }
    }

    .form-item-before {
      width: 110px;
      margin-right: 0;

      :deep(.ivu-form-item-content) {
        width: 100%;

        .ivu-select-selection {
          border-radius: 4px 0px 0px 4px;
        }
      }
    }

    .form-item-after {
      width: 250px;

      :deep(.ivu-form-item-content) {
        width: 100%;
        margin-top: 1px;

        .dyt-input-tag-content {
          border-radius: 0px 4px 4px 0px;
        }
      }
    }
  }
}

.subLayer .mainContent {
  padding: 20px;
  box-sizing: border-box;
}

.subLayer .arrowLeft {
  font-size: 16px;
  color: #333;
  display: inline-block;
  cursor: pointer;
  height: 60px;
  line-height: 60px;
  position: absolute;
  top: 0;
  left: 30px;
}

.subLayer .arrowLeft .IconBack {
  font-size: 22px;
  vertical-align: middle;
  margin-right: 10px;
  margin-top: -2px;
}

.bounce-enter-active {
  animation: bounce-in 0.4s ease;
}

.bounce-leave-active {
  animation: bounce-in 0.4s reverse ease;
}

@keyframes bounce-in {
  0% {
    transform: translateX(100%);
    opacity: 1;
  }

  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
<style lang="less" scoped>
.funMain__flex{
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
