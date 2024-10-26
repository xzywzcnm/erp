<template >
  <div class="exportTask">
    <!--筛选条件-->
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <dyt-filter>
                <Form-item label="导出类型">
                  <dyt-select :max-tag-count="1" v-model="pageParams.types" multiple>
                    <Option v-for="(item, index) in exportTypes" :key="index" :value="item.value">{{ item.label }}
                    </Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="任务号">
                  <dyt-input placeholder="请输入任务号" v-model.trim="pageParams.operateCode"></dyt-input>
                </Form-item>
                <Form-item label="导出时间" class="pageParams-createdTime">
                  <DatePicker type="date" transfer v-model="pageParams.createdTime" @on-change="selectDate"
                    @on-clear="resetDate" format="yyyy-MM-dd" placeholder="选择日期" />
                  <span style="marginleft: 10px">之前</span>
                </Form-item>
                <FormItem label="导出状态" class="notplatformParamsSelect">
                  <Button-group>
                    <template v-for="(item, index) in typeList">
                      <Button v-if="item.selected" type="primary" @click="enbaleType(index, item.status)" :key="index">
                        {{ item.title }}
                      </Button>
                      <Button v-if="!item.selected" @click="enbaleType(index, item.status)" :key="index">
                        {{ item.title }}
                      </Button>
                    </template>
                  </Button-group>
                </FormItem>
                <div slot="operation">
                  <Button type="primary" @click="search" :disabled="SearchDisabled" icon="ios-search">查询</Button>
                  <Button @click="reset" style="margin-left: 10px" v-once icon="md-refresh">重置</Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>
    <!-- 列表 -->
    <div class="orderTable normalTop commonFilter">
      <Table highlight-row :loading="Tableloading" border :height="tableHeight" :columns="exportColumn"
        :data="exportData"></Table>
      <div class="table-page">
        <div class="table-page-right">
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
            :current="pageParams.pageNum" show-sizer @on-page-size-change="changePageSize" placement="top"
            :page-size-opts="pageArray"></Page>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";

export default {
  mixins: [Mixin],
  data() {
    return {
      filenodeViewTargetUrl: this.$store.state.imgUrl, // filenode根路径
      pageParamsStatus: false, // 是否重新加载列表数据
      total: 0, // 总记录数
      userInfoMap: [], // 操作人
      pageParams: {
        types: [],
        status: null,
        operateCode: null,
        createdTime: null,
        pageSize: 50,
        pageNum: 1,
      },
      typeList: [
        // 2:操作中 3:操作完成 4：操作失败(格式校验不通过或其他运行时异常)
        {
          selected: true,
          status: "",
          title: "全部",
        },
        {
          selected: false,
          status: 3,
          title: "导出完成",
        },
        {
          selected: false,
          status: 4,
          title: "导出失败",
        },
        {
          selected: false,
          status: 2,
          title: "导出中",
        },
      ],
      exportData: [],
      exportColumn: [
        {
          title: "序号",
          width: 70,
          fixed: "left",
          align: "center",
          render: (h, params) => {
            return h("span", params.index + 1);
          },
        },
        {
          title: "导出任务号",
          key: "operateCode",
          align: "center",
          minWidth: 120,
        },
        {
          title: "导出类型",
          key: "types",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            if (params.row.type === "purchaseExport") {
              return h("span", "采购单导出");
            } else if (params.row.type === "supplierGoodsPriceExport") {
              return h("span", "产品报价导出");
            } else if (params.row.type === "supplierExport") {
              return h("span", "供应商导出");
            } else if (params.row.type === "planExport") {
              return h("span", "备货计划导出");
            } else if (params.row.type === "purchasePaymentExport") {
              return h("span", "付款单导出");
            } else if (params.row.type === "requirementExport") {
              return h("span", "采购需求导出");
            } else if (params.row.type === "supplierBusinessExport") {
              return h("span", "商家系统管理");
            } else if (params.row.type === "supplierOrderInfoExport") {
              return h("span", "供应商订单导出");
            } else if (params.row.type === "supplierDespatchExport") {
              return h("span", "供应商发货单导出");
            } else if (params.row.type === "despatchOrderExport") {
              return h("span", "供应商发货单订单导出");
            } else if (params.row.type === "purchaseOrderExport") {
              return h("span", "采购单列表导出");
            } else if (params.row.type === "receiptCheckExport") {
              return h("span", "质检单导出");
            } else if (params.row.type === "receiptCheckQuestionExport") {
              return h("span", "处理单导出");
            } else if (params.row.type === "purchaseRefundExport") {
              return h("span", "退款单导出");
            } else if (params.row.type === "processingProblemAwaitExport") {
              return h("span", "问题件处理-待处理导出");
            } else if (params.row.type === "processingProblemStartExport") {
              return h("span", "问题件处理-处理中导出");
            } else if (params.row.type === "processingProblemEenExport") {
              return h("span", "问题件处理-处理完成导出");
            } else if (
              params.row.type === "SelectedProcessingProblemStartExport"
            ) {
              return h("span", "问题件处理-处理中-明细导出");
            } else if (
              params.row.type === "SelectedProcessingProblemEenExport"
            ) {
              return h("span", "问题件处理-处理完成-明细导出");
            } else if (params.row.type === "SpsFullManagedReturnExport") {
              return h("span", "全托管退货数据导出");
            } else if (params.row.type === "stockRequirementExport") {
              return h("span", "备货需求数据导出");
            } else if (params.row.type === "stockApplyExport") {
              return h("span", "入库出库申请导出");
            } else if (params.row.type === "supplierFreightCheckExport") {
              return h("span", "寄出运费核对导出");
            } else if (params.row.type === "billApplyExport") {
              return h("span", "供应商账单申请列表导出");
            } else if (params.row.type === "billApplyExportPayment") {
              return h("span", "供应商账单申请财务付款列表导出");
            } else if (params.row.type === "spsProcessAbnormalArrivalExport") {
              return h("span", "到货异常处理导出");
            } else if (params.row.type === "supplierOrderInfoManufactureMeansExport") {
              return h("span", "生产资料导出")
            } else if (params.row.type === "supplierFreightCheckImportExport") {
              return h("span", "已导入运费数据导出");
            } else if (params.row.type === "billApplyDeductionExport") {
              return h("span", "汇总抵扣管理导出");
            } else if (params.row.type === "purchaseCancelExport") {
              return h("span", "采购取消记录导出");
            }
          },
        },
        {
          title: "导出时间",
          key: "createdTime",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            return h(
              "div",
              this.getDataToLocalTime(params.row.createdTime, "fulltime")
            );
          },
        },
        {
          title: "状态",
          key: "status",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            if (params.row.status === 2) {
              return h("span", "导出中");
            } else if (params.row.status === 3) {
              return h("span", "导出完成");
            } else if (params.row.status === 4) {
              return h(
                "span",
                {
                  style: {
                    color: "#FF0000",
                  },
                },
                "导出失败"
              );
            }
          },
        },
        {
          title: "操作人",
          key: "createdBy",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            if (this.userInfoMap) {
              if (this.userInfoMap[params.row.createdBy]) {
                return h(
                  "span",
                  this.userInfoMap[params.row.createdBy].userName
                );
              }
            }
          },
        },
        {
          title: "备注",
          minWidth: 200,
          align: "center",
          key: "reason",
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  color: "#FF0000",
                },
              },
              params.row.reason
            );
          },
        },
        {
          title: "操作",
          width: 200,
          fixed: "right",
          align: "center",
          render: (h, params) => {
            if (params.row.status !== 2 && params.row.status !== 4) {
              return h(
                "div",
                {
                  style: {
                    color: "#0000FF",
                    cursor: "pointer",
                  },
                  on: {
                    click: () => {
                      window.open(
                        this.filenodeViewTargetUrl + params.row.targetPath
                      );
                    },
                  },
                },
                "下载"
              );
            }
          },
        },
      ],
    };
  },
  methods: {
    enbaleType(index, status) {
      // 选择状态
      let v = this;
      if (index === 0) {
        v.pageParams.status = null;
      } else if (index === 1) {
        v.pageParams.status = "3";
      } else if (index === 2) {
        v.pageParams.status = "4";
      } else {
        v.pageParams.status = "2";
      }
      v.typeList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    selectDate(val) {
      // 选择日期
      let v = this;
      if (!val) {
        return false;
      }
      v.pageParams.createdTime = v.getUniversalTime(
        new Date(val).getTime(),
        "fulltime"
      );
    },
    resetDate() {
      // 重置日期
      let v = this;
      v.pageParams.createdTime = null;
    },
    search() {
      // 查询
      let v = this;
      v.pageParams.pageNum = 1;
      v.pageParamsStatus = true;
    },
    reset() {
      // 重置
      let v = this;
      v.pageParams.types = [];
      // v.pageParams.status = null;
      v.enbaleType(0, "");
      v.pageParams.operateCode = null;
      v.pageParams.createdTime = null;
    },
    getList() {
      // 获取列表数据
      let v = this;
      let userIds = [];
      let types = [];
      if (v.pageParams.types.length === 0) {
        types = v.exportTypes.map((i) => i.value);
      } else {
        types = v.pageParams.types;
      }
      let obj = {
        types: types,
        status: v.pageParams.status,
        operateCode: v.pageParams.operateCode,
        createdTime: v.pageParams.createdTime,
        pageSize: v.pageParams.pageSize,
        pageNum: v.pageParams.pageNum,
        self: 1,
      };
      obj.platformIds = null;
      let url = api.query_taskData;
      v.Tableloading = true;
      v.SearchDisabled = true;
      v.axios.post(url, obj).then((response) => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data.list !== null && data.list.length > 0) {
            data.list.forEach((n, i) => {
              userIds.push(n.updatedBy);
            });
          }
          Promise.resolve(v.getUserInfoMap(userIds)).then((result) => {
            v.Tableloading = false;
            v.SearchDisabled = false;
            v.exportData = data.list;
            v.total = data.total;
          });
        }
      });
    },
    getUserInfoMap(userIds) {
      let v = this;
      return new Promise((resolve) => {
        if (userIds.length > 0) {
          v.axios.post(api.get_userInfoMap, userIds).then(function (response) {
            if (response.data.code === 0) {
              v.userInfoMap = response.data.datas;
              resolve(true);
            }
          });
        } else {
          resolve(true);
        }
      });
    },
  },
  created() {
    this.tableHeight = this.getTableHeight(240);
    this.getList();
    // this.getPermission('erpCommon_queryCommonTaskInfoData') ? this.getList() : this.gotoError();
  },
  watch: {
    pageParamsStatus: function (n, o) {
      // 监听重置列表数据
      let v = this;
      if (n) {
        v.$Loading.start();
        Promise.resolve(v.getList()).then(() => {
          v.$Loading.finish();
        });
        v.pageParamsStatus = false;
      }
    },
  },
};
</script>
<style lang="less">
.pageParams-createdTime {
  .ivu-form-item-content {
    display: flex;

    .ivu-date-picker {
      flex: 100;
    }
  }
}
</style>
