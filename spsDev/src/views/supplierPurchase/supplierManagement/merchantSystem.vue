<template>
  <div class="mainBody platformParamsSelect">
    <Form
      ref="searchCriteria"
      class="formSearch fmb16"
      :model="searchCriteria"
      inline
      :label-width="80"
    >
      <dyt-filter>
        <FormItem label="开通状态:">
          <RadioGroup
            v-model="searchCriteria.openStatus"
            type="button"
            @on-change="search()"
          >
            <Radio
              :label="item.value"
              v-for="item in statusList"
              :key="item.value"
              >{{ item.label }}</Radio
            >
          </RadioGroup>
        </FormItem>
        <FormItem label="搜索字符:">
          <dyt-input
            v-model="searchCriteria.key"
            placeholder="供应商代码、名称"
          ></dyt-input>
        </FormItem>
        <FormItem label="供应商类型:">
          <dyt-select v-model="searchCriteria.type" clearable>
            <Option
              v-for="item in supplierTypeList"
              :value="item.dataValue"
              :key="item.dataValue"
              >{{ item.dataDesc }}
            </Option>
          </dyt-select>
        </FormItem>
        <div slot="operation">
          <Button
            type="primary"
            @click="search()"
            icon="ios-search"
            class="mr10"
            >查询
          </Button>
          <Button @click="reset()" icon="md-refresh">重置</Button>
        </div>
      </dyt-filter>
    </Form>

    <div class="operatBtn mt10 mb10">
      <Button
        type="primary"
        :loading="exportLoading"
        @click="exportOut()"
        v-if="getPermission('supplierPurchase_businessExport')"
        >导出</Button
      >
    </div>

    <div class="table-box">
      <Table
        highlight-row
        :height="tableHeight"
        :columns="columns"
        :data="tableList"
        :border="true"
        :loading="Tableloading"
      >
        <template slot-scope="{ row }" slot="info">
          <div>{{ row.supplierCode || "-" }}</div>
          <div>{{ row.supplierName || "-" }}</div>
        </template>
        <template slot-scope="{ row }" slot="supplierLevel">
          <span v-for="item in supplierLevelList" :key="item.dataValue">{{
            row.supplierLevel === item.dataValue ? item.dataDesc : ""
          }}</span>
        </template>
        <template slot-scope="{ row }" slot="supplierType">
          <span v-for="item in supplierTypeList" :key="item.dataValue">{{
            row.supplierType === item.dataValue ? item.dataDesc : ""
          }}</span>
        </template>
        <template slot-scope="{ row }" slot="user">
          <div>{{ row.contactMan || "-" }}</div>
          <div>{{ row.telephone || "-" }}</div>
        </template>
        <template slot-scope="{ row }" slot="permission">
          <span>{{ powerList[row.permission] || "" }}</span>
        </template>
        <template slot-scope="{ row }" slot="updatedTime">
          <span>{{ getDataToLocalTime(row.updatedTime, "fulltime") }}</span>
        </template>
        <template slot-scope="{ row }" slot="openStatus">
          <span
            v-for="item in statusList"
            :key="item.value"
            :style="{ color: row.openStatus === item.value ? item.color : '' }"
            >{{ row.openStatus === item.value ? item.label : "" }}</span
          >
        </template>
        <template slot-scope="{ row }" slot="action">
          <Button size="small" style="margin-right: 5px" @click="setting(row)"
            >设置</Button
          >
          <Button
            size="small"
            @click="initPassword(row)"
            :disabled="row.supplierName == '*'"
            >初始化密码</Button
          >
        </template>
      </Table>
      <div class="table-page clear">
        <div class="table-page-right">
          <Page
            :total="proPage.total"
            @on-change="proChangePage"
            show-total
            :page-size="proPage.pageSize"
            show-elevator
            :current="proPage.pageNum"
            show-sizer
            @on-page-size-change="proChangePageSize"
            placement="top"
            :page-size-opts="pageArray"
          ></Page>
        </div>
      </div>
    </div>

    <edit :dialogObj="dialogObj" @search="search"></edit>
  </div>
</template>

<script>
import api from "@/api/api";
import pagemixin from "@/components/mixin/page_mixin";
import Mixin from "@/components/mixin/common_mixin";
import { titleList } from "./merchantSystem/configFile";
import edit from "./merchantSystem/edit.vue";
import Qs from "qs";
export default {
  mixins: [pagemixin, Mixin],
  components: { edit },
  data() {
    return {
      searchCriteria: {
        openStatus: "",
        key: "",
        type: "",
        pageFlag: "1",
        businessDeptIds: null,
      },
      statusList: [
        { label: "全部", value: "" },
        { label: "未开通", value: 0, color: "#ed4014" },
        { label: "已开通", value: 1, color: "#19be6b" },
      ],
      supplierTypeList: [],
      supplierLevelList: [],
      columns: titleList,

      dialogObj: {
        modelVisible: false,
        data: {},
        supplierTypeList: [],
        supplierLevelList: [],
      },
      exportLoading: false,
      powerList: {
        1: "全部权限",
        2: "部分权限",
      },
      tableHeight: this.getTableHeight(335),
    };
  },
  created() {
    this.getSupplylist();
    this.fetch(api.businessList, "post", "supplierPurchase_businessQuery");
  },
  computed: {
    authUserInfo() {
      return this.$store.getters["authUserInfo"];
    },
  },
  methods: {
    // post请求
    axiosPost(reqParams) {
      let api = this.api;
      reqParams.businessDeptIds =
        this.authUserInfo.securityUser.businessDeptIds;
      if (Object.keys(this.searchFix).length)
        api += `?${Qs.stringify(this.searchFix)}`; //有后端要求将某参数放到url后面的要求
      return this.axios
        .post(api, reqParams)
        .then(({ data }) => {
          if (data.code == 0) {
            this.tableList = data.datas.list;
            this.proPage.total = data.datas.total;
          }
        })
        .finally(() => {
          this.Tableloading = false;
        });
    },
    // 获取供应商类型列表/供应商等级列表
    getSupplylist() {
      this.axios
        .get(api.baseDataList + "?dataType=" + "supplierType")
        .then((res) => {
          if (res.data.code == 0) {
            this.supplierTypeList = res.data.datas;
          }
        });
      this.axios
        .get(api.baseDataList + "?dataType=" + "supplierLevel")
        .then((res) => {
          if (res.data.code == 0) {
            this.supplierLevelList = res.data.datas;
          }
        });
    },
    // 重置表单条件
    reset() {
      Object.keys(this.searchCriteria).forEach((k) => {
        this.searchCriteria[k] = "";
      });
    },
    // 重置密码
    initPassword(row) {
      if (!row.supplierCode) return this.$Message.error("供应商代码丢失");
      this.$Modal.confirm({
        title: "操作提示",
        content: `确认是否要初始化账号密码：${"a123456"}`,
        loading: true,
        onOk: () => {
          this.axios
            .get(api.initializationPassword, {
              params: { userName: row.accountNumber },
            })
            .then((data) => {
              if (data.code == 0) {
                this.$Message.info("操作成功");
                this.search();
              }
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
      });
    },
    // 设置
    setting(row) {
      this.dialogObj.modelVisible = true;
      this.dialogObj.data = row;
      this.dialogObj.supplierTypeList = this.supplierTypeList;
      this.dialogObj.supplierLevelList = this.supplierLevelList;
    },
    // 导出
    exportOut() {
      this.exportLoading = true;
      this.searchCriteria.businessDeptIds =
        this.authUserInfo.securityUser.businessDeptIds;
      this.axios
        .post(api.exportBusiness, this.searchCriteria)
        .then((res) => {
          if (res.data.code === 0) {
            this.$Message.info("导出成功");
          }
        })
        .finally(() => {
          this.exportLoading = false;
        });
    },
  },
};
</script>