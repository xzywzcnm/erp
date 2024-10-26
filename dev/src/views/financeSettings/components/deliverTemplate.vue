<template >
  <div class="mainBody">
    <div v-if="!detailView" style="background-color: #f5f7f9" class="mainBody">
      <div class="usersFilter">
        <div class="card-container">
          <div class="card-content">
            <div class="platformParamsSelect">
              <Form :model="pageParams" :label-width="80">
                <dyt-filter :filter-row="1">
                  <Form-item label="状态：">
                    <dyt-select v-model="pageParams.templateStatus">
                      <Option
                        v-for="(item, index) in statusList"
                        :key="index"
                        :value="item.value"
                        >{{ item.label }}</Option
                      >
                    </dyt-select>
                  </Form-item>
                  <Form-item label="模版名称：">
                    <dyt-input
                      v-model.trim="pageParams.templateIdOrName"
                      style="width: 240px"
                    ></dyt-input>
                  </Form-item>
                  <div slot="operation">
                    <Button type="primary" @click="searchData" icon="md-search"
                      >查询
                    </Button>
                    <Button style="margin-left: 10px" v-once icon="md-refresh"
                      >重置
                    </Button>
                  </div>
                </dyt-filter>
              </Form>
            </div>
          </div>
        </div>
      </div>

      <div style="background: #f5f7f9">
        <Button
          type="primary"
          @click="edit()"
          v-if="getPermission('templateInfo_addDeliverTemplate')"
          >新建费用模版
        </Button>
      </div>
      <div class="shopTable">
        <!--表格-->
        <Table
          highlight-row
          border
          :columns="columns6"
          :data="data6"
          ref="selection"
          class="adfgg-87884"
        >
          <template slot="status" slot-scope="scope">
            <div>{{ scope.row.status == "0" ? "启用" : "停用" }}</div>
          </template>
          <template slot="operate" slot-scope="scope">
            <div>
              <Button
                size="small"
                @click="edit(scope.row.templateId)"
                v-if="getPermission('templateInfo_updateDeliverTemplate')"
                >修改</Button
              >
              <Button
                size="small"
                class="ml10"
                @click="changeStatus(scope.row, '1')"
                v-if="
                  scope.row.status == '0' &&
                  getPermission('updateStatus_deliverTemplate')
                "
                >停用</Button
              >
              <Button
                size="small"
                class="ml10"
                v-if="
                  scope.row.status == '1' &&
                  getPermission('updateStatus_deliverTemplate')
                "
                @click="changeStatus(scope.row, '0')"
                >启用</Button
              >
            </div>
          </template>
        </Table>
        <!--分页按钮-->
        <div class="table-page">
          <div class="table-page-right">
            <Page
              :total="totalRecords"
              :current="pageParams.pageNum"
              @on-change="changePage"
              show-total
              :page-size="pageParams.pageSize"
              show-elevator
              show-sizer
              @on-page-size-change="changePageSize"
              placement="top"
              :page-size-opts="pageArray"
            ></Page>
          </div>
        </div>
      </div>
    </div>
    <deliverTemplateDetail
      v-if="detailView"
      :editStatus="editStatus"
      @back="back"
      :templateId="templateId"
    ></deliverTemplateDetail>
  </div>
</template>
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import deliverTemplateDetail from "./deliverTemplateDetail.vue";

export default {
  mixins: [Mixin],
  components: { deliverTemplateDetail },
  data() {
    return {
      // 仓库状态
      statusList: [
        {
          label: "已启用",
          value: 0,
          checked: false,
        },
        {
          label: "已停用",
          value: 1,
          checked: false,
        },
      ],

      pageParams: {
        templateStatus: null,
        templateIdOrName: "",
        templateType: "2",
        pageNum: 1, // 默认第一页
        pageSize: 10, // 规定每页显示 10 条数据
      },
      totalRecords: 0, // 总条数
      columns6: [
        {
          title: "模版编号",
          key: "templateId",
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              {
                style: { color: "#1f55a0", cursor: "pointer" },
                on: {
                  click: () => {
                    this.seeDetail(params.row.templateId);
                  },
                },
              },
              params.row.templateId
            );
          },
        },
        {
          title: "模版名称",
          key: "templateName",
          align: "center",
        },

        {
          title: "创建人",
          key: "createdBy",
          align: "center",
          render: (h, { row }) => {
            const userName = this.getUserName(row.createdBy);
            if (this.$common.isEmpty(userName)) return h('div', {}, row.createdBy);
            return h('div', {}, this.getUserName(row.createdBy));
          }
        },
        {
          title: "更新人",
          key: "updatedBy",
          align: "center",
          render: (h, { row }) => {
            const userName = this.getUserName(row.updatedBy);
            if (this.$common.isEmpty(userName)) return h('div', {}, row.updatedBy);
            return h('div', {}, this.getUserName(row.updatedBy));
          }
        },
        {
          title: "更新时间",
          key: "updatedTime",
          align: "center",
        },
        {
          title: "状态",
          key: "status",
          align: "center",
          slot: "status",
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          slot: "operate",
        },
      ],
      data6: [],
      detailView: false,
      editStatus: false,
      templateId: "",
    };
  },
  created() {
    this.searchData();
  },
  methods: {
    // 页面查询
    searchData() {
      if (!this.getPermission("search_deliverTemplateList")) {
        return this.$Message.warning("没权限");
      }
      this.axios.post(api.queryDeliverTemplate, this.pageParams).then((res) => {
        this.data6 = res.data.datas.list;
        this.totalRecords = res.data.datas.total;
      });
    },
    // 切换每页条数
    changePage(page) {
      this.pageParams.pageNum = page;
      this.searchData();
    },
    changePageSize(size) {
      this.pageParams.pageSize = size;
      this.searchData();
    },
    // 详情页
    seeDetail(templateId) {
      if (!this.getPermission("templateInfo_queryTemplateDetail")) {
        return;
      }
      this.templateId = templateId;
      this.editStatus = false;
      this.detailView = true;
    },
    edit(templateId) {
      this.templateId = templateId;
      this.editStatus = true;
      this.detailView = true;
    },
    // 返回
    back() {
      this.detailView = false;
      this.searchData();
    },
    // 改变模版状态
    changeStatus(row, type) {
      let temp = {
        templateId: row.templateId,
        status: type,
        templateType: this.pageParams.templateType,
      };
      this.axios.post(api.updateDeliverTemplateStatus, temp).then((res) => {
        this.$Message.success("操作成功");
        this.searchData();
      });
    },
  },
};
</script>
<style >
.headerBar .ivu-modal-header p,
.headerBar .ivu-modal-header-inner {
  color: #fff;
}
.mainBody {
  flex: 1;
  overflow: auto;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: #ffff;
}
</style>
