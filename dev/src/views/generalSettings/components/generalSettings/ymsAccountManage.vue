<template>
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformSearch clear">
            <Form
              ref="filterFormRef"
              :model="pageParams"
              label-position="right"
              :label-width="80"
            >
              <dyt-filter :filter-row="1" tableClassName=".table-view">
                <Form-item label="状态:" prop="status">
                  <dyt-select v-model="pageParams.status" placeholder="请选择状态">
                    <Option :value="0">停用</Option>
                    <Option :value="1">启用</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="授权状态:" prop="authStatus">
                  <dyt-select v-model="pageParams.authStatus" placeholder="请选择授权状态">
                    <Option :value="0">失效</Option>
                    <Option :value="1">有效</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="商户编号:" prop="merchantIdList">
                  <dyt-input-tag type="textarea" :limit="1" :string="false" placeholder="请输入商户编号,多个编号用回车或逗号分隔" v-model="pageParams.merchantIdList" />
                </Form-item>
                <Form-item label="商户名称:" prop="merchantName">
                  <dytInput placeholder="请输入商户名称" v-model="pageParams.merchantName" />
                </Form-item>
                <Form-item label="商户类型:" prop="merchantType">
                  <dyt-select v-model="pageParams.merchantType" placeholder="请选择商户类型">
                    <Option :value="0">分销商</Option>
                    <Option :value="1">供应商</Option>
                  </dyt-select>
                </Form-item>
                <div slot="operation">
                  <Button type="primary" @click="tableDataSearch(true)" :disabled="dataLoading" icon="md-search">查询</Button>
                  <Button class="ml10" v-once icon="md-refresh" @click="resetForm">重置</Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>
    <div class="normalPadding" style="display: flex">
      <div style="flex: 100">
        <Button v-if="permission.add" type="primary" @click="openEditModal({}, 'add')">添加新绑定</Button>
      </div>
    </div>
    <div class="normalPadding normalTop table-view">
      <Table
        highlight-row
        border
        :loading="dataLoading"
        :height="tableHeight"
        :columns="tableColumn"
        :data="tableData"
        ref="tableData"
      />
      <div class="table-page">
        <div class="table-page-right">
          <Page
            :total="total"
            @on-change="pageNumChange"
            :disabled="dataLoading"
            show-total
            :page-size="pageParams.pageSize"
            :current="pageParams.pageNum"
            show-elevator show-sizer
            @on-page-size-change="pageSizeChange"
            placement="top"
            :page-size-opts="pageArray"
          />
        </div>
      </div>
    </div>
    <!-- 查看(编辑、新增)账号 -->
    <addOrEditYmsAccount :modalData="modalData" :modalVisible.sync="editModalVisible" @refreshParent="tableDataSearch" />
  </div>
</template>

<script>
import Mixin from "@/components/mixin/common_mixin";
import api from '@/api/api';
import addOrEditYmsAccount from '@/views/generalSettings/components/generalSettings/components/addOrEditYmsAccount';

export default {
  name: 'ymsAccountManage',
  components: {
    addOrEditYmsAccount
  },
  mixins: [Mixin],
  data() {
    return {
      editModalVisible: false,
      modalData: {},
      total: 0,
      dataLoading: false,
      pageParams: {
        merchantIdList: [],
        merchantName: null,
        merchantType: null,
        status: null,
        authStatus: null,
        orderBy: null,
        upDown: null,
        pageNum: 1,
        pageSize: 20
      },
      tableColumn: [
        {
          title: "商户编号",
          minWidth: 120,
          align: 'center',
          key: "merchantId",
        },
        {
          title: "商户名称",
          minWidth: 120,
          align: 'center',
          key: "merchantName",
        },
        {
          title: "商户类型",
          width: 120,
          align: 'center',
          key: "merchantType",
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.merchantType) || ![0, 1].includes(Number(row.merchantType))) return h('span', {}, '');
            return h('span', {}, row.merchantType == 1 ? '供应商' : '分销商');
          }
        },
        {
          title: "授权状态",
          width: 120,
          align: 'center',
          key: "authStatus",
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.authStatus) || ![0, 1].includes(Number(row.authStatus))) return h('span', {}, '');
            return h('span', {}, row.authStatus == 1 ? '有效' : '无效');
          }
        },
        {
          title: "状态",
          width: 130,
          align: 'center',
          key: "status",
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.status) || ![0, 1].includes(Number(row.status))) return h('span', {}, '');
            return h('span', {
              style: {
                color: row.status == 1 ? '#00af00' : '#f20',
              }
            }, row.status == 1 ? '启用' : '停用');
          }
        },
        {
          title: "操作",
          width: 180,
          align: 'center',
          key: "operation",
          render: (h, { row }) => {
            let operItem = [];
            if (this.permission.detail) {
              operItem.push(h('Button', {
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.openEditModal(row, 'view');
                  }
                }
              }, '查看'));
            }
            if (this.permission.edit) {
              operItem.push(h('Button', {
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.openEditModal(row, 'edit');
                  }
                }
              }, '编辑'));
            }
            if (this.permission.enable && (this.$common.isEmpty(row.status) || [0, 1].includes(Number(row.status)))) {
              operItem.push(h('Button', {
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.enableOrDisabled(row, row.status == 1 ? 0 : 1);
                  }
                }
              }, row.status == 1 ? '停用' : '启用'));
            }
            return h('div', {
              class: 'table-operation',
            }, operItem);
          }
        },
      ],
      tableData: [],
    };
  },
  watch: {},
  computed: {
    tableHeight () {
      return this.getTableHeight(285);
    },
    // 权限
    permission () {
      return {
        add: this.getPermission('ymsMerchantAccount_insert'), // 新增商户账号
        edit: this.getPermission('ymsMerchantAccount_update'), // 修改商户账号
        detail: this.getPermission('ymsMerchantAccount_detail'), // 查询商户账号明细
        enable: this.getPermission('ymsMerchantAccount_changeStatus'), // 启用/禁用商户账号
        query: this.getPermission('ymsMerchantAccount_queryList'), // 查询商户账号列表
      }
    }
  },
  activated () {},
  created () {},
  mounted () {
    this.tableDataSearch(true);
  },
  methods: {
    // 搜索栏参数
    getFilter () {
      let pageParams = this.$common.copy(this.pageParams);
      pageParams.merchantName = (pageParams.merchantName || '').trim();
      return pageParams;
    },
    // 查询
    tableDataSearch (type) {
      if (!this.permission.query) return this.$Message.error('您暂无权限查询！');
      if (this.dataLoading) return;
      if (type) {
        this.pageParams.pageNum = 1;
      }
      this.dataLoading = true;
      this.axios.post(api.queryYmsList, this.getFilter()).then((res) => {
        this.total = res.data.datas.total;
        this.tableData = res.data.datas.list || [];
        this.dataLoading = false;
      }).catch(() => {
        this.dataLoading = false;
      });
    },
    // 重置表单
    resetForm () {
      this.$refs.filterFormRef && this.$refs.filterFormRef.resetFields();
    },
    // 换页数
    pageNumChange (page) {
      this.pageParams.pageNum = page;
      this.tableDataSearch();
    },
    // 换页码
    pageSizeChange (pageSize) {
      this.pageParams.pageSize = pageSize;
      const newVal = Math.ceil(this.total / pageSize);
      if (newVal < this.pageParams.pageNum) {
        this.pageParams.pageNum = newVal;
      }
      this.$nextTick(() => {
        this.tableDataSearch();
      })
    },
    // 启(禁)用
    enableOrDisabled (row, status) {
      this.axios.put(`${api.ymsMerchantAccount}/${row.merchantAccountId}?status=${status}`).then(res => {
        if (!res || !res.data || res.data.code != 0) return;
        this.$Message.success('操作成功！');
        this.tableDataSearch();
      })
    },
    // 打开添加新绑定(编辑)弹窗
    openEditModal (row, viewType = 'view') {
      this.modalData = {
        row: this.$common.copy(row),
        viewType: viewType
      }
      this.$nextTick(() => {
        this.editModalVisible = true;
      })
    },
  }
};
</script>

<style lang='less' scoped>
.card-content {
  padding: 10px 20px 10px 20px;
  :deep(.platformSearch) {
    .ivu-form-item-content{
      width: 230px;
    }
  }
}
.table-view{
  :deep(.ivu-table-wrapper){
    .table-operation{
      .ivu-btn+.ivu-btn{
        margin-left: 5px;
      }
    }
  }
}
</style>
