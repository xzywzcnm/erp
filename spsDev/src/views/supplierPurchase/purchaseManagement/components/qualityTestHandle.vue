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
    <template>
      <div class="commonFilter">
        <div class="card-container">
          <div class="card-content">
            <div class="platformParamsSelect">
              <Form ref="pageParams" :model="pageParams" :label-width="120">
                <dyt-filter>
                  <FormItem label="处理类型：" prop="questionType">
                    <dyt-select
                      v-model="pageParams.questionType"
                      clearable
                      placeholder="请选择"
                    >
                      <Option label="退货" :value="0"></Option>
                      <Option label="销毁" :value="1"></Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="处理状态：">
                    <dyt-select
                      v-model="pageParams.questionStatus"
                      clearable
                      placeholder="请选择"
                    >
                      <Option label="待退货" :value="0"></Option>
                      <Option label="待销毁" :value="1"></Option>
                      <Option label="已退货" :value="2"></Option>
                      <Option label="已销毁" :value="3"></Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="创建时间：" prop="submitTimeArr">
                    <Date-picker
                      transfer
                      type="datetimerange"
                      split-panels
                      @on-clear="resetDate"
                      @on-change="getDateValue"
                      :clearable="true"
                      format="yyyy-MM-dd HH:mm:ss"
                      style="width: 100%"
                      placeholder="选择日期"
                      :options="dateOptions"
                      placement="bottom-end"
                      v-model="submitTimeArr"
                    />
                  </FormItem>
                  <FormItem label="处理单号：">
                    <dyt-input-tag
                      :limit="1"
                      v-model="pageParams.receiptCheckQuestionNoList"
                      placeholder="多个用逗号或回车分开"
                      type="textarea"
                    >
                    </dyt-input-tag>
                  </FormItem>
                  <FormItem label="采购单号：">
                    <dyt-input-tag
                      :limit="1"
                      v-model="pageParams.referenceNoList"
                      placeholder="多个用逗号或回车分开"
                      type="textarea"
                    >
                    </dyt-input-tag>
                  </FormItem>
                  <FormItem label="入库单号：" prop="receiptNoList">
                    <dyt-input-tag
                      :limit="1"
                      v-model="pageParams.receiptNoList"
                      placeholder="多个用逗号或回车分开"
                      type="textarea"
                    >
                    </dyt-input-tag>
                  </FormItem>
                  <FormItem label="质检单号：" prop="receiptCheckNoList">
                    <dyt-input-tag
                      :limit="1"
                      v-model="pageParams.receiptCheckNoList"
                      placeholder="多个用逗号或回车分开"
                      type="textarea"
                    >
                    </dyt-input-tag>
                  </FormItem>
                  <FormItem label="供应商：" prop="supplierName">
                    <dyt-input
                      v-model="pageParams.supplierName"
                      placeholder="请输入"
                    ></dyt-input>
                  </FormItem>
                  <FormItem label="快递公司：" prop="logisticsId">
                    <dyt-select
                      v-model="pageParams.logisticsId"
                      clearable
                      placeholder="请选择"
                    >
                      <Option
                        v-for="item in logisterList"
                        :value="item.logisticsId"
                        :key="item.logisticsId"
                        >{{ item.logisticsName }}</Option
                      >
                    </dyt-select>
                  </FormItem>
                  <FormItem label="快递单号：" prop="deliveryNo">
                    <dyt-input
                      v-model="pageParams.deliveryNo"
                      placeholder="请输入"
                    ></dyt-input>
                  </FormItem>

                  <FormItem label="采购员" prop="purchaserId">
                    <dyt-select
                      v-model="pageParams.purchaserId"
                      filterable
                      clearable
                    >
                      <Option
                        v-for="item in purchaserIdList"
                        :key="item.userId"
                        :label="item.userName"
                        :value="item.userId"
                      >
                      </Option>
                    </dyt-select>
                  </FormItem>

                  <div slot="operation">
                    <Button
                      type="primary"
                      @click="getList"
                      :disabled="SearchDisabled"
                      icon="ios-search"
                      >搜索</Button
                    >
                    <Button
                      @click="reset"
                      style="margin-left: 10px"
                      v-once
                      icon="md-refresh"
                      >重置</Button
                    >
                  </div>
                </dyt-filter>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <div class="flexBox spaceBetween">
        <div class="tableControl">
          <Button
            type="primary"
            class="iconbuttons"
            style="margin-left: 12px"
            @click="exportData"
            v-if="getPermission('qualityTestHandle_Manage_export')"
          >
            <span class="icon iconfont" style="font-size: 12px">&#xe639;</span>
            导出
          </Button>
        </div>
        <div style="margin-right: 20px">
          <span>排序方式：</span>
          <Button-group>
            <Button
              :type="item.checked ? 'primary' : 'default'"
              v-for="item in sortData"
              :key="item.value"
              @click="clickSortButton(item)"
              >{{ item.label }}
              <Icon
                type="md-arrow-up"
                v-if="item.checked && !item.toogle"
              ></Icon>
              <Icon
                type="md-arrow-down"
                v-if="item.checked && item.toogle"
              ></Icon>
            </Button>
          </Button-group>
        </div>
      </div>

      <div class="commonFilter mt10">
        <div class="orderTable">
          <!-- <keep-alive> -->
          <Table
            ref="managementTable"
            highlight-row
            :border="true"
            :height="tableHeight"
            :loading="Tableloading"
            :columns="column1"
            :data="tableList"
          ></Table>
          <!-- </keep-alive> -->
          <div class="table-page clear">
            <div class="table-page-right">
              <!-- <keep-alive> -->
              <Page
                :total="total"
                show-total
                show-elevator
                show-sizer
                placement="top"
                :page-size="pageParams.pageSize"
                :current="pageParams.pageNum"
                :page-size-opts="pageArray"
                @on-change="changePage"
                @on-page-size-change="changePageSize"
              ></Page>
              <!-- </keep-alive> -->
            </div>
          </div>
        </div>
      </div>
    </template>

    <Modal
      v-model="modal1"
      title="问题商品处理"
      :width="1280"
      :closable="modalEsc"
    >
      <qualityTestHandleProblem
        v-if="modal1"
        :isEdit="isEdit"
        :receiptCheckQuestionNo="receiptCheckQuestionNo"
        ref="child"
        @closeModalView="closeModalView"
      ></qualityTestHandleProblem>
      <div slot="footer">
        <Button type="text" @click="modal1 = false">取消</Button>
        <Button type="primary" @click="confirm" v-if="isEdit">确定</Button>
      </div>
    </Modal>
    <Modal v-model="deleteModal" title="操作提示">
      <div class="mt10 ml10">
        <Icon type="ios-alert-outline" size="24" style="color: #ff992d" />
        <span class="ml10">确认是否要删除处理单：</span>
        <span style="color: #ff992d">{{ rowData.receiptCheckQuestionNo }}</span>
      </div>
      <div
        class="mt20"
        style="
          background: #e4f7ff;
          width: 350px;
          border: 1px solid #76d6fc;
          margin-left: 40px;
        "
      >
        提示：删除处理单后，退货或销毁的数量回退到剩余数
      </div>
      <div slot="footer">
        <Button type="text" @click="deleteModal = false">取消</Button>
        <Button type="primary" @click="deleteOrderConfirm">确定</Button>
      </div>
    </Modal>
  </div>
</template>
    
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import tableMixin from "@/components/mixin/table_mixin";
import qualityTestHandleProblem from "./common/qualityTestHandleProblem.vue";
export default {
  mixins: [Mixin, tableMixin],
  components: { qualityTestHandleProblem },
  data() {
    let self = this;
    let end = new Date();
    let start = new Date();
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
    return {
      tableHeight: self.getTableHeight(335),
      totalPage: 0,
      total: 0,
      column1: [
        {
          key: "receiptCheckQuestionNo",
          title: "处理单",
          minWidth: 155,
          render: (h, params) => {
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
                          this.showModal("", params.row);
                        },
                      },
                    },
                    params.row.receiptCheckQuestionNo
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
                params.row.receiptCheckQuestionNo
              ),
            ]);
          },
        },
        {
          key: "questionType",
          align: "center",
          title: "处理类型",
          width: "90px",
          render: (h, params) => {
            if (params.row.questionType == 0) {
              return h("span", "退货");
            }
            if (params.row.questionType == 1) {
              return h("span", { style: { color: "red" } }, "销毁");
            }
          },
        },

        {
          key: "questionStatus",
          align: "center",
          title: "处理状态",
          width: "90px",
          render: (h, params) => {
            if (params.row.questionStatus == 0) {
              return h("span", "待退货");
            }
            if (params.row.questionStatus == 1) {
              return h("span", "待销毁");
            }
            if (params.row.questionStatus == 2) {
              return h("span", "已退货");
            }
            if (params.row.questionStatus == 3) {
              return h("span", "已销毁");
            }
          },
        },
        {
          key: "purchaserId",
          align: "center",
          title: "采购员",
          width: "90px",
        },
        {
          key: "receipterName",
          align: "center",
          title: "收货人名称",
        },
        {
          key: "logisticsName",
          align: "center",
          title: "快递公司",
        },
        {
          key: "deliveryNo",
          align: "center",
          title: "快递单号",
        },
        {
          key: "purchaseNo",
          align: "center",
          title: "采购单号",
          tooltip: true,
        },
        {
          key: "skuCount",
          align: "center",
          title: "SKU数量",
          width: "90px",
        },
        {
          key: "productNumber",
          align: "center",
          title: "商品数量",
          width: "90px",
        },
        {
          key: "remark",
          align: "center",
          title: "备注",
        },
        {
          key: "createdTime",
          align: "center",
          title: "创建时间",
          width: "100px",
        },
        {
          key: "submitterName",
          align: "center",
          title: "操作",
          width: "110px",
          fixed: "right",
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                {
                  style: { color: "#2d8cf0", cursor: "pointer" },
                  on: {
                    click: () => {
                      this.showModal("edit", params.row);
                    },
                  },
                },
                ["2", "3"].includes(params.row.questionStatus) &&
                  this.getPermission("qualityTestHandle_Manage_edit")
                  ? ""
                  : "修改"
              ),
              h(
                "span",
                {
                  style: {
                    color: "#ff1440",
                    cursor: "pointer",
                    marginLeft: "10px",
                  },
                  on: {
                    click: () => {
                      this.deleteOrder(params.row);
                    },
                  },
                },
                ["0", "1"].includes(params.row.questionStatus) &&
                  this.getPermission("qualityTestHandle_Manage_delete")
                  ? "删除"
                  : ""
              ),
            ]);
          },
        },
      ],
      tableList: [],
      submitTimeArr: [start, end],
      pageParams: {
        merchantId: "",
        questionType: null,
        questionStatus: null,
        startCreatedTime: start,
        endCreatedTime: end,
        receiptCheckQuestionNoList: [],
        referenceNoList: [],
        receiptNoList: [],
        receiptCheckNoList: [],
        supplierName: "",
        logisticsId: "",
        deliveryNo: "",
        sortField: "SN",
        sortOrder: "DESC",
        pageNum: 1,
        pageSize: 10,
        purchaserId: "",
      },
      developerArr: [], // 采购员
      modal1: false,
      sortData: [
        {
          label: "按供应商",
          value: "SN",
          checked: true,
          toogle: true,
        },
        {
          label: "创建时间",
          value: "CT",
          checked: false,
          toogle: true,
        },
      ],
      pageShow: false,
      isEdit: false,
      receiptCheckQuestionNo: "",
      //快递公司列表
      logisterList: [],
      purchaserIdList: [], //采购员列表
      deleteModal: false,
      rowData: {
        receiptCheckQuestionNo: "",
        receiptCheckQuestionId: "",
      },
    };
  },
  watch: {},
  mounted() {
    this.getLogistlist();
    this.getAllUser();
    this.getDateValue(this.submitTimeArr);
  },
  activated() {
    this.getList();
  },
  computed: {
    modalEsc() {
      return this.$store.state.isEsc;
    },
  },
  methods: {
    getList() {
      if (!this.getPermission("qualityTestHandle_Manage_search")) {
        this.$Message.error("无权限");
        return;
      }
      this.Tableloading = true;

      this.axios
        .post(api.getReceiptCheckQuestion, this.pageParams)
        .then((res) => {
          this.Tableloading = false;
          this.tableList = res.data.datas.list;
          this.tableList.forEach((itema) => {
            this.purchaserIdList.forEach((itemb) => {
              if (itema.purchaserId == itemb.userId) {
                itema.purchaserId = itemb.userName;
              }
            });
          });
          this.total = res.data.datas.total;
        });
    },
    reset() {},
    search() {},
    resetDate() {
      this.pageParams.startCreatedTime = "";
      this.pageParams.endCreatedTime = "";
    },
    showModal(type, row) {
      this.receiptCheckQuestionNo = row.receiptCheckQuestionNo;
      if (type == "edit") {
        this.isEdit = true;
      } else {
        this.isEdit = false;
      }
      this.modal1 = true;
    },
    closeModalView() {
      this.modal1 = false;
      this.getList();
    },
    confirm() {
      this.$refs.child.confirm();
    },
    // 获取快递物流商
    getLogistlist() {
      this.axios.post(api.logistics).then(({ data }) => {
        if (data.code == 0) {
          this.logisterList = data.datas || [];
        }
      });
    },
    clickSortButton: function (data) {
      // 点击排序的按钮
      if (data.value === this.cacheClickVal) {
        data.toogle = !data.toogle;
      }
      this.cacheClickVal = data.value;
      if (data.toogle) {
        this.pageParams.sortOrder = "DESC";
      } else {
        this.pageParams.sortOrder = "ASC";
      }
      this.sortData.forEach(function (n) {
        n.checked = data.value === n.value;
      });
      this.pageParams.sortField = data.value;
      this.search();
    },
    exportData() {
      this.axios
        .post(api.wmsReceiptCheckQuestion_export, this.pageParams)
        .then((res) => {
          this.$Message.success("导出成功");
        });
    },
    changePage(val) {
      this.pageParams.pageNum = val;
      this.getList();
    },
    changePageSize(val) {
      this.pageParams.pageSize = val;
      this.getList();
    },
    getAllUser() {
      this.axios.get(api.userInfo_getAllUser).then((res) => {
        let list = [];
        Object.keys(res.data.datas).forEach((item) => {
          let temp = {};
          temp.userId = res.data.datas[item].userId;
          temp.userName = res.data.datas[item].userName;
          list.push(temp);
        });
        this.purchaserIdList = list;
      });
    },
    getDateValue(value) {
      // 获取日期返回值
      var v = this;
      if (value[0] != "") {
        v.pageParams.startCreatedTime = v.getDateTime(value[0], "fulltime");
        v.pageParams.endCreatedTime = v.getDateTime(value[1], "fulltime");
      }
    },
    deleteOrder(row) {
      this.deleteModal = true;
      this.rowData.receiptCheckQuestionNo = row.receiptCheckQuestionNo;
      this.rowData.receiptCheckQuestionId = row.receiptCheckQuestionId;
    },
    deleteOrderConfirm() {
      this.axios
        .delete(
          `/sps-service/wmsReceiptCheckQuestion/${this.rowData.receiptCheckQuestionId}`
        )
        .then((res) => {
          if (res.data.code == 0) {
            this.deleteModal = false;
            this.$Message.success("删除成功");
            this.getList();
          }
        })
        .catch((res) => {
          this.$Message.error(res.data.message);
        });
    },
  },
};
</script >
    