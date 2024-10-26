<template>
  <div class="importTask listPage">
    <div class="searchMain">
      <Form ref="searchParams" :model="searchParams" :label-width="80">
        <dyt-filter ref="dyt-filter" @expand="expand">
          <Form-item label="导入类型:" prop="importType">
            <dyt-select v-model="searchParams.importType">
              <!-- <Option value="*">全部</Option> -->
              <Option v-for="v in importTypeList" :key="v.value" :value="v.value" :label="v.label"></Option>
            </dyt-select>
          </Form-item>
          <Form-item label="导入状态:" prop="importStatus">
            <dyt-select v-model="searchParams.importStatus">
              <!-- <Option value="*">全部</Option> -->
              <Option v-for="v in importStatusData" :key="v.value" :value="v.value" :label="v.label"></Option>
            </dyt-select>
          </Form-item>
          <Form-item label="任务号:" prop="taskNo">
            <Input v-model.trim="searchParams.taskNo" placeholder="请输入任务号"></Input>
          </Form-item>
          <Form-item label="导入时间:" prop="date">
            <DatePicker type="date" transfer placeholder="选择日期" style="width: 80%" v-model="searchParams.date">
            </DatePicker>
            <span class="ml10">之前</span>
          </Form-item>
          <div slot="operation">
            <Button type="primary" @click="searchData" :disabled="SearchDisabled" icon="ios-search" class="mr10">查询
            </Button>
            <Button @click="reset" v-once icon="md-refresh">重置</Button>
          </div>
        </dyt-filter>
      </Form>
    </div>

    <!--table表格-->
    <div class="tableMain mt10">
      <div class="tableBox">
        <Table highlight-row border ref="selection" :columns="columns" :loading="TableLoading" :data="data"
          :height="tableHeight"></Table>
      </div>
    </div>
    <div class="pagesMain">
      <Page :total="tableItemTotal" :current="searchParams.pageNum" :page-size="searchParams.pageSize" show-total
        show-sizer show-elevator @on-change="pageNumChange" @on-page-size-change="pageSizeChange"
        :page-size-opts="pageArray"></Page>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import common from "@/components/mixin/common_mixin";
import tableHeight_mixin from "@/components/mixin/tableHeight_mixin";

export default {
  mixins: [common, tableHeight_mixin],
  data() {
    let v = this;
    return {
      searchParams: {
        importType: "",
        taskNo: "",
        date: "",
        importStatus: "",
        pageNum: 1,
        pageSize: 50,
      },
      importTypeList: [
        {
          label: "入库单",
          value: "0",
        },
        {
          label: "出库单",
          value: "1",
        },
        {
          label: "移动单",
          value: "2",
        },
        {
          label: "调整单",
          value: "3",
        },
        {
          label: "冻结单",
          value: "4",
        }, // { label: '库位', value: '5' },
        // { label: '库区', value: '6' },
        {
          label: "加工单",
          value: "7",
        },
        {
          label: "调拨单",
          value: "8",
        },
        {
          label: "补录运单号",
          value: "14",
        },
        {
          label: "销售出库单",
          value: "16",
        },
        {
          label: "补录跟踪号（获取运单号）",
          value: "18",
        },
        {
          label: "全托管直发出库单导入",
          value: "50",
        },
        {
          label: "借样出库单导入",
          value: "70",
        },
        {
          label: "全托管导入",
          value: "67",
        },
        {
          label: "运费导入",
          value: "888",
        },
        {
          label: "出库增值服务",
          value: "71",
        },
        // { label: '销售出库', value: '10' }
      ],
      importStatusData: [
        {
          label: "导入完成",
          value: "2",
          checked: false,
        },
        {
          label: "导入失败",
          value: "3",
          checked: false,
        },
        {
          label: "导入中",
          value: "1",
          checked: false,
        },
      ],
      columns: [
        {
          title: "导入任务号",
          align: "center",
          width: 220,
          key: "taskNo",
        },
        {
          title: "导入类型",
          align: "center",
          key: "taskFileType",
        },
        {
          title: "导入文件",
          align: "center",
          key: "taskFileName",
          minWidth: 150,
          render: (h, params) => {
            let filenodeViewTargetUrl = this.$store.state.imgUrlPrefix;
            return h(
              "a",
              {
                attrs: {
                  href: filenodeViewTargetUrl + params.row.taskFileUrl,
                },
              },
              params.row.taskFileName
            );
          },
        },
        {
          title: "导入时间",
          align: "center",
          key: "createdTime",
        },
        {
          title: "状态",
          align: "center",
          key: "status",
        },
        {
          title: "操作人",
          align: "center",
          key: "createdBy",
        },
        {
          title: "备注",
          align: "center",
          width: 180,
          resizable: true,
          key: "remark",
        },
        {
          title: "操作",
          key: "h",
          fixed: "right",
          align: "center",
          width: 180,
          render: (h, params) => {
            const emptyResult = this.$common.isEmpty(params.row.taskResult);
            const failStatus = params.row.taskStatus === "3";
            // 出库增值服务 类型为71并且taskResult有值就显示
            const valAddStatus = [71, '71'].includes(params.row.copyTaskFileType);
            if (emptyResult) return h('div', '');
            if (failStatus && !valAddStatus) return h('div', '');
            return h("a", {
              attrs: {
                target: '_blank',
                href: v.$store.state.erpConfig.filenodeViewTargetUrl + params.row.taskResult,
              }
            }, "下载失败文件");
          },
        },
      ],
      data: [],
      tableItemTotal: 0,
    };
  },
  methods: {
    // clickImportStatusData (item) {
    //   this.importStatusData.forEach(function (n) {
    //     n.checked = item.value === n.value;
    //   });
    //   this.searchParams.importStatus = item.value;
    // },
    searchData() {
      this.searchParams.pageNum = 1;
      this.initData();
    },
    initData() {
      this.searchParams.pageSize = this.getPageSizeCache();
      if (this.getPermission("wmsPicking_queryTaskList_import")) {
        let obj = {
          taskType: "0",
          fileType: this.searchParams.importType, // 内容类型
          taskNo: this.searchParams.taskNo, // 任务编号
          taskCreatedTime: this.searchParams.date
            ? this.$uDate.getDateTime(this.searchParams.date)
            : null, // 任务时间
          taskStatus: this.searchParams.importStatus, // 导入状态
          pageNum: this.searchParams.pageNum,
          pageSize: this.searchParams.pageSize,
          warehouseId: this.getWarehouseId(),
        };
        this.TableLoading = true;
        this.SearchDisabled = true;
        this.axios.post(api.getImportExportList, obj).then((res) => {
          this.TableLoading = false;
          this.SearchDisabled = false;
          if (res.data.code === 0) {
            this.data = this.processData(res.data.datas.list);
            this.tableItemTotal = res.data.datas.total;
          }
        });
      } else {
        this.gotoError(); // 无权限
      }
    },
    processData(list) {
      list.forEach((val) => {
        val.copyTaskFileType = val.taskFileType;
        val.taskFileType =
          val.taskFileType === "0"
            ? "入库单"
            : val.taskFileType === "1"
              ? "出库单"
              : val.taskFileType === "2"
                ? "移动单"
                : val.taskFileType === "3"
                  ? "调整单"
                  : val.taskFileType === "4"
                    ? "冻结单"
                    : val.taskFileType === "5"
                      ? "库位"
                      : val.taskFileType === "6"
                        ? "库区"
                        : val.taskFileType === "7"
                          ? "加工单"
                          : val.taskFileType === "8"
                            ? "调拨单"
                            : val.taskFileType === "14"
                              ? "补录运单号"
                              : val.taskFileType === "16"
                                ? "销售出库单"
                                : val.taskFileType === "18"
                                  ? "补录跟踪号（获取运单号）"
                                  : val.taskFileType === "66"
                                    ? "全托管导入"
                                    : val.taskFileType === "69"
                                      ? "全托管导入"
                                      : val.taskFileType === "888"
                                        ? "运费导入"
                                        : val.taskFileType === "70"
                                          ? "借样出库单"
                                          : val.taskFileType === "71"
                                            ? "出库增值服务"
                                            : "";

        val.status =
          val.taskStatus === "1"
            ? "导入中"
            : val.taskStatus === "2"
              ? "导入成功"
              : val.taskStatus === "3"
                ? "导入失败"
                : "";
        val.createdTime = this.$uDate.dealTime(val.createdTime);
      });
      return list;
    },
    pageNumChange(page) {
      this.searchParams.pageNum = page;
      this.initData();
    },
    pageSizeChange(size) {
      this.setPageSizeCache(size);
      this.searchParams.pageSize = size;
      this.initData();
    }, // 重置按钮
    reset() {
      //   let item = {
      //     value: null
      //   };
      //   this.clickImportStatusData(item);
      this.$refs["searchParams"].resetFields();
    },
  },
  created() {
    this.initData();
  },
};
</script>

<style>
.importTaskBox {
  background-color: #fff;
  padding: 20px 0;
}
</style>
