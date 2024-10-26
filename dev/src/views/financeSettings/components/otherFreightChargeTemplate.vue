<template >
  <div class="mainBody">
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageForm" :model="pageParams" :label-width="80">
              <dyt-filter :filter-row="1">
                <Form-item label="状态：" prop="templateStatus">
                  <dyt-select v-model="pageParams.templateStatus" placeholder="请选择状态">
                    <Option
                      v-for="(item, index) in statusList"
                      :key="index"
                      :value="item.value"
                      >{{ item.label }}</Option
                    >
                  </dyt-select>
                </Form-item>
                <Form-item label="模版名称：" prop="templateIdOrName">
                  <dyt-input
                    placeholder="请输入模板名称"
                    v-model.trim="pageParams.templateIdOrName"
                    style="width: 240px"
                  />
                </Form-item>
                <div slot="operation">
                  <Button type="primary" @click="searchData(true)" icon="md-search">查询</Button>
                  <Button style="margin-left: 10px" icon="md-refresh" @click="resetSearch">重置</Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>

    <div class="addBinding">
      <Button type="primary" @click="openTemplateModal({}, 'add')" v-if="pagePer.add">新增费用模版</Button>
    </div>
    <div class="shopTable">
      <!--表格-->
      <Table
        highlight-row
        :height="tableHeight"
        border
        :columns="tableColumns"
        :data="tableData"
        ref="selection"
        class="adfgg-87884"
      >
        <template slot="status" slot-scope="scope">
          <div>{{ scope.row.status == "0" ? "启用" : "停用" }}</div>
        </template>
        <template slot="operate" slot-scope="scope">
          <div>
            <Button size="small" @click="openTemplateModal(scope.row, 'edit')">修改</Button>
            <template v-if="!scope.row.isDefaultTemplate && pagePer.enable">
              <Button size="small" class="ml10" @click="changeStatus(scope.row)" :loading="scope.row.loading">
                {{ scope.row.status == 0 ? '停用' : '启用' }}
              </Button>
            </template>
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
    <otherFreightChargeModal
      :model-visible.sync="otherFreightChargeVisible"
      :view-type="viewType"
      :module-data="otherFreightChargeData"
      @searchTable="searchData"
    />
  </div>
</template>
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import otherFreightChargeModal from "./otherFreightChargeModal.vue";

export default {
  mixins: [Mixin],
  components: { otherFreightChargeModal },
  data() {
    return {
      otherFreightChargeVisible: false,
      viewType: 'view',
      otherFreightChargeData: {},
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
        templateType: "4",
        pageNum: 1, // 默认第一页
        pageSize: 20, // 规定每页显示 10 条数据
      },
      totalRecords: 0, // 总条数
      tableColumns: [
        {
          title: "模版编号",
          key: "templateId",
          align: "center",
          minWidth: 120,
          render: (h, { row }) => {
            return h(
              "div",
              {
                style: { color: "#1f55a0", cursor: "pointer" },
                on: {
                  click: () => {
                    this.openTemplateModal(row, 'view');
                  },
                },
              },
              row.templateId
            );
          },
        },
        {
          title: "模版名称",
          key: "templateName",
          align: "center",
          minWidth: 120,
        },
        {
          title: "创建人",
          key: "createdBy",
          align: "center",
          width: 200,
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
          width: 200,
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
          width: 200,
        },
        {
          title: "状态",
          key: "status",
          align: "center",
          slot: "status",
          width: 90,
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          slot: "operate",
          fixed: 'right',
          width: 150
        },
      ],
      tableData: [],
    };
  },
  computed: {
    tableHeight () {
      return this.getTableHeight(290);
    },
    pagePer () {
      return {
        query: this.getPermission('queryRemoteAreaCostTemplateList'),
        view: this.getPermission('queryRemoteAreaCostTemplateDetail'),
        edit: this.getPermission('updateRemoteAreaCostTemplate'),
        add: this.getPermission('insertRemoteAreaCostTemplate'),
        enable: this.getPermission('updateRemoteAreaCostTemplateStatus')
      }
    }
  },
  created() {
    this.searchData();
  },
  methods: {
    // 获取搜索条件
    getSearchParams () {
      let param = this.$common.copy(this.pageParams);
      return param;
    },
    // 页面查询
    searchData(type = false) {
      if (!this.pagePer.query) return this.$Message.error("您暂无查询权限");
      if (this.$common.isBoolean(type) && type) {
        this.pageParams.pageNum = 1;
      }
      this.$nextTick(() => {
        this.tableData = [];
        this.axios.post(api.settingService.queryRemoteAreaCostTemplateList, this.getSearchParams()).then((res) => {
          if (!res.data || !res.data.datas || res.data.code != 0) return;
          this.tableData = [
            ...[{
              ...res.data.datas.defaultTemplate,
              isDefaultTemplate: true
            }],
            ...(res.data.datas.pageInfo.list.map(item => {
              return {
                ...item,
                loading: false
              }
            }))
          ];
          this.totalRecords = res.data.datas.pageInfo.total + 1;
        });
      })
    },
    // 切换每页条数
    changePage(page) {
      this.pageParams.pageNum = page;
      this.$nextTick(() => {
        this.searchData();
      })
    },
    // 页数改变
    changePageSize(size) {
      this.pageParams.pageSize = size;
      this.$nextTick(() => {
        this.searchData();
      })
    },
    // 重置搜索条件
    resetSearch () {
      this.$refs.pageForm && this.$refs.pageForm.resetFields();
    },
    // 新建（编辑、查看）
    openTemplateModal(row = {}, type = 'view') {
      this.viewType = type;
      this.otherFreightChargeData = this.$common.copy(row);
      this.$nextTick(() => {
        this.otherFreightChargeVisible = true;
      })
    },
    // 改变模版状态
    changeStatus(row) {
      if (this.$common.isEmpty(row) || row.loading) return;
      row.loading = true;
      this.axios.post(`${api.settingService.updateRemoteAreaCostTemplateStatus}/${row.id}?status=${row.status == 0 ? 1 : 0}`).then((res) => {
        if (!res.data || res.data.code != 0) return;
        this.$Message.success("操作成功");
        this.searchData();
      }).finally(() => {
        row.loading = false;
      })
    }
  }
};
</script>
<style lang="less" scoped>
.mainBody {
  flex: 1;
  overflow: auto;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: #f5f7f9;
}
</style>
