<template>
  <div class="exportTask listPage">
    <div class="searchMain">
      <Form ref="searchParams" :model="searchParams" :label-width="labelWidth">
        <dyt-filter ref="dyt-filter" @expand="expand">
          <Form-item label="导出类型:" prop="importType">
            <dyt-select v-model="searchParams.importType">
              <Option v-for="v in importTypeList" :key="v.value" :value="v.value" v-if="!v.hidden" :label="v.label">
              </Option>
            </dyt-select>
          </Form-item>
          <Form-item label="导出状态:" prop="importStatus">
            <dyt-select v-model="searchParams.importStatus">
              <Option v-for="v in importStatusData" :key="v.value" :value="v.value" :label="v.label"></Option>
            </dyt-select>
          </Form-item>
          <Form-item label="任务号:" prop="taskNo">
            <Input v-model.trim="searchParams.taskNo" placeholder="请输入任务号"></Input>
          </Form-item>
          <Form-item label="导出时间:" prop="date">
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
        <Table border ref="selection" :loading="TableLoading" :columns="columns" :data="data" :height="tableHeight">
        </Table>
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
import { getWareHouseItem } from "@/utils/getService";
import _ from "lodash";
import { exportTypeData } from './exportTaskConfig.js';

export default {
  mixins: [common, tableHeight_mixin],
  data() {
    return {
      labelWidth: 90,
      searchParams: {
        importType: "",
        taskNo: "",
        date: "",
        importStatus: "",
        pageNum: 1,
        pageSize: 10,
      },
      // importTypeList: (() => {
      //   let exportTypeList = exportTypeData.default;
      //   if (this.$store.getters['getIsThird']) {
      //     const path = this.$route.path.substring(1, this.$route.path.length);
      //     exportTypeList = this.$common.isEmpty(exportTypeData[path]) ? exportTypeData.defaultThird : exportTypeData[path];
      //   }
      //   return exportTypeList;
      // })(),
      importStatusData: [
        {
          label: "导出完成",
          value: "2",
          checked: false,
        },
        {
          label: "导出失败",
          value: "3",
          checked: false,
        },
        {
          label: "导出中",
          value: "1",
          checked: false,
        },
      ],
      columns: [
        {
          title: "导出任务号",
          align: "center",
          key: "taskNo",
        },
        {
          title: "导出类型",
          align: "center",
          key: "taskFileType",
        },
        {
          title: "导出时间",
          align: "center",
          key: "createdTime",
        },
        {
          title: "状态",
          align: "center",
          key: "status",
        },
        {
          title: "备注",
          align: "center",
          key: "remark",
        },
        {
          title: "操作",
          key: "h",
          fixed: "right",
          align: "center",
          render: (h, params) => {
            return h(
              "a",
              {
                attrs: {
                  href: `${this.$store.state.erpConfig.filenodeViewTargetUrl}${params.row.taskResult}`,
                  target: "_blank",
                },
                style: {
                  display: params.row.taskStatus === "2" ? "block" : "none",
                },
              },
              "下载"
            );
          },
        },
      ],
      data: [],
      tableItemTotal: 0,
      warehouseOverseaType: "index",
    };
  },
  computed: {
    permission() {
      return {
        // 导出查询
        exportQuery: (() => {
          return (
            this.getPermission("wmsPicking_queryTaskList") ||
            this.getPermission("wmsPicking_queryTaskList_export") ||
            this.getPermission("packageInfo_export")
          );
        })(),
      };
    },
    isFSwarehouse() {
      const wareId = this.getWarehouseId();
      let warehouseItems = this.$store.state.warehouseList.filter(i => {
        if (i.warehouseId === wareId) return i;
      });
      let warehouseItem = warehouseItems[0] || {};
      return warehouseItem.warehouseName === '佛山丽山仓';
    },
    importTypeList() {
      let importTypeList = [];
      let path = this.$route.path;
      let type = path.replace('/', '');
      if (this.$store.getters['getIsThird']) {
        importTypeList = this.$common.isEmpty(exportTypeData[type]) ? exportTypeData.defaultThird : exportTypeData[type];
      } else {
        importTypeList = this.$common.isEmpty(exportTypeData[type]) ? exportTypeData.default : exportTypeData[type];
      }
      return importTypeList;
    },
  },
  watch: {
    isFSwarehouse: {
      handler(n) {
        if (n) return;
        this.importTypeList.forEach((k, i) => {
          if (k.value === '114') {
            this.importTypeList.splice(i, 1);
          }
        })
      },
      deep: true,
      immediate: true,
    }
  },
  methods: {
    // throttle
    searchData: _.debounce(function (val) {
      this.searchParams.pageNum = 1;
      this.initData();
    }, 500),
    initData() {
      this.searchParams.pageSize = this.getPageSizeCache();
      if (this.permission.exportQuery) {
        let searchParams = this.searchParams;
        let obj = {
          taskType: "1",
          fileType: searchParams.importType, // 内容类型
          taskNo: searchParams.taskNo, // 任务编号
          taskCreatedTime: searchParams.date
            ? this.$uDate.getDateTime(searchParams.date)
            : null, // 任务时间
          taskStatus: searchParams.importStatus, // 导入状态
          pageNum: searchParams.pageNum,
          pageSize: searchParams.pageSize,
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
        }).catch(() => {
          this.TableLoading = false;
          this.SearchDisabled = false;
        });
      } else {
        // this.gotoError(); // 无权限
        this.$Message.error("无权限");
      }
    },
    processData(list) {
      list.forEach((val) => {
        const typeItem = this.importTypeList.find((k) => {
          return val.taskFileType == k.value;
        });
        !this.$common.isEmpty(typeItem) && (val.taskFileType = typeItem.label);
        const statusItem = this.importStatusData.find((k) => {
          return val.taskStatus == k.value;
        });
        !this.$common.isEmpty(statusItem) && (val.status = statusItem.label);
        val.createdTime = this.$uDate.dealTime(val.createdTime);
      });
      console.log(list, "list");
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
    },
    // 重置按钮
    reset() {
      this.$refs["searchParams"].resetFields();
    },
  },
  created() {
    const wareHouseItem = getWareHouseItem();
    if (
      wareHouseItem.warehouseOverseaType &&
      wareHouseItem.warehouseOverseaType === "winitoutstore"
    ) {
      // let wareInfo = JSON.parse(wareHouseItem);
      // if (wareInfo.warehouseOverseaType === 'winitoutstore') {
      this.warehouseOverseaType = "winitoutstore";
      // }
    }
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
