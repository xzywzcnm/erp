<style scoped>
.deleteTip {
  padding: 20px 30px;
  font-size: 16px;
}
</style>
<style>
.verticalCheck .ivu-checkbox {
  margin-right: 20px;
}

.supplierTabsBar .ivu-tabs-nav-prev,
.supplierTabsBar .ivu-tabs-nav-next {
  display: none;
}

.trimming .buttonsArrows .arrowDown {
  margin: 10px 0 0 2px;
}
</style>
<template>
  <div>
    <template v-if="!pageShow">
      <div class="commonFilter">
        <div class="card-container">
          <div class="card-content">
            <div class="platformParamsSelect">
              <Form ref="pageParams" :model="pageParams" :label-width="120">
                <dyt-filter>
                  <FormItem label="质检状态" prop="backupWarehouseType">
                    <dyt-select v-model="pageParams.checkStatus" clearable placeholder="请选择">
                      <Option label="待质检" value="0"></Option>
                      <Option label="质检中" value="1"></Option>
                      <Option label="质检完成" value="2"></Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="质检单号">
                    <dyt-input-tag :limit="1" v-model="pageParams.receiptCheckNoList" placeholder="多个质检单号用逗号或回车分开"
                      type="textarea">
                    </dyt-input-tag>
                  </FormItem>
                  <FormItem label="创建时间">
                    <Date-picker transfer type="datetimerange" split-panels @on-clear="resetDate"
                      @on-change="getDateValue" :clearable="true" format="yyyy-MM-dd HH:mm:ss" style="width: 100%"
                      placeholder="选择日期" :options="dateOptions" placement="bottom-end" v-model="submitTimeArr" />
                  </FormItem>
                  <FormItem label="采购单号">
                    <dyt-input-tag :limit="1" v-model="pageParams.purchaseNoList" placeholder="多个采购单号用逗号或回车分开"
                      type="textarea">
                    </dyt-input-tag>
                  </FormItem>
                  <FormItem label="入库单号">
                    <dyt-input-tag :limit="1" v-model="pageParams.receiptNoList" placeholder="多个入库单号用逗号或回车分开"
                      type="textarea">
                    </dyt-input-tag>
                  </FormItem>
                  <FormItem label="供应商" prop="supplierName">
                    <dyt-select v-model="pageParams.supplierName" clearable placeholder="请选择">
                      <Option v-for="item in supplierList" :key="item.supplierId" :value="item.supplierName"
                        :label="item.supplierName"></Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="备货类型">
                    <dyt-select v-model="pageParams.readyType" clearable placeholder="请选择">
                      <Option label="急采" value="0"></Option>
                      <Option label="普通备货" value="1"></Option>
                      <Option label="海外仓备货" value="2"></Option>
                      <Option label="FBA备货" value="3"></Option>
                      <Option label="全托管备货" value="4"></Option>
                      <Option label="直发备货" value="5"></Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="问题数量">
                    <dyt-select v-model="pageParams.haveProblem" clearable placeholder="请选择">
                      <Option label="无" value="0"></Option>
                      <Option label="有" value="1"></Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="剩余数量">
                    <dyt-select v-model="pageParams.haveSurplus" clearable placeholder="请选择">
                      <Option label="无" value="0"></Option>
                      <Option label="有" value="1"></Option>
                    </dyt-select>
                  </FormItem>
                  <Form-item label="SPU:" prop="spuList">
                    <dyt-input-tag :limit="1" type="textarea" v-model="pageParams.spuList" placeholder="多个SPU请用逗号或回车分隔" />
                  </Form-item>
                  <FormItem label="SKU" prop="skuList">
                    <dyt-input-tag :limit="1" v-model="pageParams.skuList" placeholder="多个 sku 用逗号或回车分开"
                      type="textarea" />
                  </FormItem>
                  <FormItem label="采购员" prop="purchaserIdList">
                    <dyt-select v-model="pageParams.purchaserIdList" filterable multiple :max-tag-count="1" clearable>
                      <Option v-for="(item, index) in purchaserArr" :value="item.userId" :label="item.userName"
                        :key="index">{{ item.userName }}</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="类型:" prop="qualityInspectionTypeList">
                    <dyt-select :max-tag-count="1" :multiple="true" v-model="pageParams.qualityInspectionTypeList">
                      <Option :value="0" label="质检"></Option>
                      <Option :value="1" label="维修"></Option>
                    </dyt-select>
                  </FormItem>
                  <div slot="operation">
                    <Button type="primary" @click="search" :disabled="SearchDisabled" icon="ios-search">搜索</Button>
                    <Button @click="reset" style="margin-left: 10px" v-once icon="md-refresh">重置</Button>
                  </div>
                </dyt-filter>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <div class="flexBox spaceBetween">
        <div class="tableControl">
          <!-- <Button type="primary" class="iconbuttons" @click="openModal" style="margin-left: 12px" v-if="getPermission('qualityTest_Manage_createOrder')">
            创建处理单
          </Button> -->
          <!-- <Button type="primary" v-if="getPermission('stockUpPlan_save')" class="iconbuttons" @click="addFBAPlanFn" style="margin-left: 12px">
                                                  新建FBA备货计划 </Button> -->
          <Dropdown @on-click="clickDrop" style="margin-left: 12px">
            <Button type="primary" style="margin-left: 12px" v-if="getPermission('qualityTest_Manage_export')"><span
                class="icon iconfont" style="font-size: 12px">&#xe639;</span>
              导出
              <Icon type="md-arrow-dropdown"></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem name="0">导出选中数据</DropdownItem>
              <DropdownItem name="1">导出所有结果集</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div style="margin-right: 20px">
          <span>排序方式：</span>
          <Button-group>
            <Button :type="item.checked ? 'primary' : 'default'" v-for="item in sortData" :key="item.value"
              @click="clickSortButton(item)">{{ item.label }}
              <Icon type="md-arrow-up" v-if="item.checked && !item.toogle"></Icon>
              <Icon type="md-arrow-down" v-if="item.checked && item.toogle"></Icon>
            </Button>
          </Button-group>
        </div>
      </div>

      <div class="commonFilter mt10">
        <div class="orderTable">
          <!-- <keep-alive> -->
          <Table ref="managementTable" highlight-row :border="true" :height="tableHeight" :loading="Tableloading"
            :columns="column1" :data="data1" @on-selection-change="selectEvents">
            <!-- 送检批次号 -->
            <template slot-scope="{ row }" slot="operator">
              <div style="color: #2d8cf0; cursor: pointer" @click="showPage('edit', row)" v-if="!['1', '2'].includes(row.checkStatus) &&
                getPermission('qualityTest_Manage_editCheck') && !row.qualityInspectionType
                ">
                修改应检
              </div>
            </template>
          </Table>
          <!-- </keep-alive> -->
          <div class="table-page clear">
            <div class="table-page-right">
              <!-- <keep-alive> -->
              <Page :total="total" show-total show-elevator show-sizer :page-size="pageParams.pageSize"
                :current="pageParams.pageNum" :page-size-opts="pageArray" @on-change="changePage"
                @on-page-size-change="changePageSize" placement="top"></Page>
              <!-- </keep-alive> -->
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- <Modal v-model="modal1" title="问题商品处理单" :width="1280" :closable="modalEsc">
      <handleProblemOrder v-if="modal1" ref="child" :problemProductTableList="problemProductTableList"
        :receiptCheckNoList="receiptCheckNoList" @closeModal="closeModal"></handleProblemOrder>
      <div slot="footer">
        <Button type="text" @click="modal1 = false">取消</Button>
        <Button type="primary" @click="confirm">确定</Button>
      </div>
    </Modal> -->
    <Modal v-model="probelmModal" title="质检问题详情" :width="1280">
      <problemDetail :problemDetailList="problemDetailList"></problemDetail>
    </Modal>
    <transition name="bounce">
      <!-- 查看 -->
      <template v-if="pageShow">
        <div class="subLayer infoDetails">
          <div>
            <qualityTestDetail @closePage="closePage" :isEdit="isEdit" :pageData="pageData"></qualityTestDetail>
          </div>
        </div>
      </template>
    </transition>
  </div>
</template>
  
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import tableMixin from "@/components/mixin/table_mixin";
// import handleProblemOrder from "./common/handleProblemOrder.vue";
import qualityTestDetail from "./common/qualityTestDetail.vue";
import problemDetail from "./common/problemDetail.vue";
export default {
  mixins: [Mixin, tableMixin],
  components: { qualityTestDetail, problemDetail },
  data() {
    let self = this;
    let end = new Date();
    let start = new Date();
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
    return {
      column1: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          key: "receiptCheckNo",
          title: "质检单",
          minWidth: 218,
          render: (h, params) => {
            const checkStatusList = {
              '0': {
                label: '待质检',
                olabel: '待质检',
                value: '0'
              },
              '1': {
                label: '质检中',
                olabel: '部分质检',
                value: '1'
              },
              '2': {
                label: '质检完成',
                olabel: '质检完成',
                value: '2'
              }
            }
            return h("div", [
              h(
                "div",
                {
                  style: { display: "flex", margin: "8px 0 1px 0" },
                },
                [
                  h(
                    "div",
                    {
                      style: {},
                    },
                    "申请单号："
                  ),
                  h(
                    "span",
                    {
                      style: {
                        cursor: "pointer",
                        color: "#2d8cf0",
                        textDecoration: "underline",
                      },
                      on: {
                        click: () => {
                          this.showPage("", params.row);
                        },
                      },
                    },
                    params.row.receiptCheckNo
                  ),
                ]
              ),
              h(
                "div",
                {
                  style: {},
                  class: "",
                  attrs: { title: params.row.supplierName },
                },
                params.row.supplierName
              ),
              h("div", {
                style: {
                  display: 'flex'
                }
              }, [
                h('Tooltip', {
                  props: {
                    content: '类型',
                    placement: 'top-start'
                  },
                  style: {
                    width: '60px',
                    background: '#F2F2F2',
                    color: '#B000FF',
                    marginLeft: '10px',
                    height: '16px',
                    textAlign: 'center'
                  }
                }, params.row.qualityInspectionType ? '维修' : '质检'),
                h('Tooltip', {
                  props: {
                    content: '质检状态',
                    placement: 'top-start'
                  },
                  style: {
                    width: '60px',
                    background: '#F2F2F2',
                    color: '#45bb98',
                    marginLeft: '10px',
                    height: '16px',
                    textAlign: 'center'
                  }
                }, checkStatusList[params.row.checkStatus] && checkStatusList[params.row.checkStatus].label)
              ])
            ]);
          },
        },
        {
          key: "purchaseNumber",
          align: "center",
          title: "下单数",
          width: "75px",
        },
        {
          key: "checkType",
          align: "center",
          title: "质检类型",
          width: "90px",
          render: (h, params) => {
            if (params.row.checkType == 0) {
              return h("span", "免检");
            }
            if (params.row.checkType == 1) {
              return h("span", "抽检");
            }
            if (params.row.checkType == 2) {
              return h("span", "全检");
            }
          },
        },
        {
          key: "planCheckNumber",
          align: "center",
          title: "应检数",
          width: "75px",
        },
        {
          key: "checkRate",
          align: "center",
          title: "质检比例",
          width: "90px",
          render: (h, params) => {
            return h("span", `${params.row.checkRate}%`);
          },
        },
        {
          key: "expectedCheckNumber",
          align: "center",
          title: "送检数",
          width: "75px",
        },
        {
          key: "qualifiedCheckedNumber",
          align: "center",
          title: "已检合格数",
          width: "100px",
        },
        {
          key: "failedCheckedNumber",
          align: "center",
          title: "已检问题数",
          width: "100px",
          render: (h, params) => {
            if (params.row.failedCheckedNumber > 0) {
              return h(
                "span",
                {
                  style: {
                    color: "#2d8cf0",
                    cursor: "pointer",
                    textDecoration: "underline",
                  },
                  on: {
                    click: () => {
                      this.showProbelmModal(params.row);
                    },
                  },
                },
                params.row.failedCheckedNumber
              );
            } else {
              return h("span", params.row.failedCheckedNumber);
            }
          },
        },
        {
          key: "awaitCheckedNumber",
          align: "center",
          title: "待检数",
          width: "75px",
        },
        {
          key: "awaitPlanCheckedNumber",
          align: "center",
          title: "待应检数",
          width: "100px",
        },
        {
          align: "center",
          title: "已检问题商品处理",
          children: [
            {
              key: "refundNumber",
              align: "center",
              title: "退货数",
              width: "75px",
            },
            {
              key: "destroyNumber",
              align: "center",
              title: "销毁数",
              width: "75px",
            },
            {
              key: "surplusNumber",
              align: "center",
              title: "剩余数",
              width: "75px",
            },
          ],
        },
        {
          key: "remarks",
          align: "center",
          title: "备注",
          width: "200px",
          tooltip: true,
        },
        {
          key: "createdTime",
          align: "center",
          title: "创建时间",
          width: "100px",
        },
        {
          key: "checkFinishTime",
          align: "center",
          title: "质检时间",
          width: "100px",
        },
        {
          key: "operation",
          align: "center",
          width: 90,
          // fixed: "right",
          title: "操作",
          fixed: "right",
          slot: "operator",
          // render: (h, params) => {
          //   return h(
          //     "span",
          //     {
          //       style: {
          //         color: "#2d8cf0",
          //         cursor: "pointer",
          //       },
          //       on: {
          //         click: () => {
          //           this.showPage("edit", params.row.receiptCheckNo);
          //         },
          //       },
          //     },
          //     "修改应检"
          //   );
          // },
        },
      ],
      data1: [],
      // modal1: false,
      tableHeight: self.getTableHeight(335),
      totalPage: 0,
      total: 0,
      curPage: 1,
      submitTimeArr: [start, end],
      startTime: start,
      endTime: end,
      oldPageParams: {},
      pageParams: {
        merchantId: null,
        checkStatus: null,
        receiptCheckNoList: [],
        purchaseNoList: [],
        receiptNoList: [],
        startCreatedTime: start,
        endCreatedTime: end,
        supplierName: null,
        readyType: null,
        haveProblem: null,
        haveSurplus: null,
        sortField: "CT",
        sortOrder: "DESC",
        spuList: [],
        skuList: [],
        purchaserIdList: [],
        qualityInspectionTypeList: [],
        pageNum: 1,
        pageSize: 10,
      },
      purchaserArr: [], // 采购人员
      sortData: [
        {
          label: "创建时间",
          value: "CT",
          checked: true,
          toogle: true,
        },
        {
          label: "按供应商",
          value: "SN",
          checked: false,
          toogle: true,
        },
        {
          label: "质检时间",
          value: "FT",
          checked: false,
          toogle: true,
        },
      ],
      pageShow: false,
      probelmModal: false,
      isEdit: false,
      cacheClickVal: "SN",
      pageData: {},
      receiptCheckNoList: [],
      //供应商列表
      supplierList: [],
      //质检问题详情
      problemDetailList: [],
      //创建处理单table
      // problemProductTableList: [],
      tableSelectList: [], //表格选中数据
    };
  },
  watch: {},
  created() {
    this.getDateValue(this.submitTimeArr);
    this.getPurchaserList();
    this.oldPageParams = this.$common.copy(this.pageParams);
  },
  computed: {
    modalEsc() {
      return this.$store.state.isEsc;
    },
  },
  activated() {
    this.search();
  },
  mounted() {
    this.getSupplierList();
  },
  methods: {
    reset() {
      this.pageParams = this.$common.copy(this.oldPageParams);
      this.submitTimeArr = [this.startTime, this.endTime];
      this.getDateValue(this.submitTimeArr);
    },
    search() {
      if (!this.getPermission("qualityTest_Manage_search")) {
        this.$Message.error("无权限");
        return;
      }
      this.Tableloading = true;
      this.axios.post(api.getReceiptCheck, this.pageParams).then((res) => {
        this.Tableloading = false;
        this.data1 = res.data.datas.list || [];
        this.total = res.data.datas.total;
      });
    },
    resetDate() {
      this.pageParams.startCreatedTime = "";
      this.pageParams.endCreatedTime = "";
    },
    // 获取采购人员
    getPurchaserList() {
      this.axios.get(api.userList).then((res) => {
        if (res.data.code == 0) {
          this.purchaserArr = Object.values(res.data.datas || {});
        }
      });
    },
    getDateValue(value) {
      // 获取日期返回值
      if (value[0] != "") {
        this.pageParams.startCreatedTime = this.getDateTime(
          value[0],
          "fulltime"
        );
        this.pageParams.endCreatedTime = this.getDateTime(value[1], "fulltime");
      }
    },
    // openModal() {
    //   if (this.receiptCheckNoList.length == 0) {
    //     return this.$Message.warning("请先选择质检单");
    //   }

    //   this.axios
    //     .post(api.createProcessingQuery, this.receiptCheckNoList)
    //     .then((res) => {
    //       let temp = {};
    //       this.tableSelectList.forEach((k) => {
    //         temp[k.receiptCheckNo] = k;
    //       });

    //       let newData = [];
    //       // 列表数据合并设置
    //       Object.keys(res.data.datas).forEach((key) => {
    //         const list = res.data.datas[key].filter(
    //           (f) => f.problemCheckNumber && f.problemCheckNumber > 0
    //         );
    //         list.forEach((row, index) => {
    //           newData.push({
    //             ...row,
    //             pictureUrl: row.allImageUrl ? row.allImageUrl.split(",") : [],
    //             remainNumber:
    //               typeof row.problemCheckNumber !== "number"
    //                 ? null
    //                 : row.problemCheckNumber,
    //             rowspan: index === 0 ? list.length : 0,
    //             colspan: index === 0 ? 1 : 0,
    //             receiptCheckId: temp[key] ? temp[key].receiptCheckId : null,
    //           });
    //         });
    //       });
    //       this.problemProductTableList = newData;
    //     });
    //   this.modal1 = true;
    // },
    // closeModal() {
    //   this.search();
    //   this.modal1 = false;
    // },
    showProbelmModal(row) {
      let temp = {
        receiptCheckNo: row.receiptCheckNo,
        productGoodsId: row.productGoodsId,
      };
      this.axios.post(api.getReceiptProblem, temp).then((res) => {
        this.problemDetailList = res.data.datas;
      });
      this.probelmModal = true;
    },
    showPage(type, row) {
      this.pageData.receiptCheckNo = row.receiptCheckNo;
      this.pageData.checkFinishTime = row.checkFinishTime;
      if (type == "edit") {
        this.isEdit = true;
      } else {
        this.isEdit = false;
      }
      this.pageShow = true;
    },
    closePage() {
      this.pageShow = false;
      this.search();
    },
    clickSortButton: function (data) {
      // 点击排序的按钮
      if (data.value === this.cacheClickVal) {
        data.toogle = !data.toogle;
      }
      this.cacheClickVal = data.value;
      if (data.toogle) {
        this.pageParams.sortOrder = "Desc";
      } else {
        this.pageParams.sortOrder = "ASC";
      }
      this.sortData.forEach(function (n) {
        n.checked = data.value === n.value;
      });
      this.pageParams.sortField = data.value;
      this.search();
    },
    clickDrop(value) {
      if (value == "0") {
        if (this.receiptCheckNoList.length == 0) {
          return this.$Message.warning("请先选择要导出的质检单");
        }
        let temp = { receiptCheckNoList: this.receiptCheckNoList };

        this.axios.post(api.wmsReceiptBatchCheck_export, temp).then((res) => {
          this.$Message.success("导出成功");
        });
      }
      //全部
      if (value == "1") {
        this.axios
          .post(api.wmsReceiptBatchCheck_export, this.pageParams)
          .then((res) => {
            this.$Message.success("导出成功");
          });
      }
    },
    selectEvents(val) {
      this.receiptCheckNoList = val.map((item) => {
        return item.receiptCheckNo;
      });
      this.tableSelectList = val || [];
    },
    getSupplierList() {
      this.axios.get(api.supplierAll).then((res) => {
        this.supplierList = res.data.datas;
      });
    },
    // confirm() {
    //   this.$refs.child.confirm();
    // },
    changePage(val) {
      this.pageParams.pageNum = val;
      this.search();
    },
    changePageSize(val) {
      this.pageParams.pageSize = val;
      this.search();
    },
  },
};
</script>
  