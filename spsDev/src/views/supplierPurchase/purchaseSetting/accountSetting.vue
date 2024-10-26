<template >
  <div class="commodityMatch">
    <!--筛选条件-->
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <div style="display: flex; justify-content: space-between">
              <div class="tableControl">
                <span class="ml10" style="font-weight: 700; font-size: 23px"
                  >账号</span
                >
                <span class="ml20" style="color: #e20026"
                  >按照所绑定的账号信息显示</span
                >
              </div>
              <Button
                type="primary"
                @click="editAccount({})"
                v-if="getPermission('aliaccount_add')"
                >新增账号</Button
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="flexBox spaceBetween">
      <div class="tableControl">
        <span class="ml10" style="font-weight: 700; font-size: 23px">账号</span>
        <span class="ml20" style="color: #e20026"
          >按照所绑定的账号信息显示</span
        >
      </div>
    </div> -->
    <!-- 列表 -->
    <div class="orderTable normalTop commonFilter">
      <div class="table-hand-operate">
        <div></div>
        <div>
          <Button type="primary" @click="getList" >刷新列表</Button>
        </div>
      </div>
      <Table
        highlight-row
        :loading="Tableloading"
        border
        :height="tableHeight"
        :columns="importColumn"
        :data="importData"
      >
        <template slot-scope="{ row }" slot="orderType">
          <div>{{ orderTypeObj[row.orderType] }}</div>
        </template>
        <template slot-scope="{ row }" slot="expectedDelivery">
          <div>{{ expectedDeliveryObj[row.expectedDelivery] }}</div>
        </template>
        <template slot-scope="{ row }" slot="freightType">
          <div>{{ freightTypeObj[row.freightType] }}</div>
        </template>
      </Table>
      <div class="table-page">
        <div class="table-page-right">
          <Page
            :total="total"
            @on-change="changePage"
            show-total
            :page-size="pageParams.pageSize"
            show-elevator
            :current="pageParams.pageNum"
            show-sizer
            @on-page-size-change="changePageSize"
            placement="top"
            :page-size-opts="pageArray"
          ></Page>
        </div>
      </div>
    </div>
    <!-- 编辑(新增)账号 -->
    <accountEdit
      :title="editStatus ? '修改账号信息' : '新增账号信息'"
      :edit-type="editStatus ? 'edit' : 'add'"
      :modal-visible.sync="modal1"
      :modalData="formData"
      @saveCallback="getList"
    />
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import accountEdit from "./accountEdit";

export default {
  mixins: [Mixin],
  components: { accountEdit },
  data() {
    return {
      total: 0, // 总记录数
      tableRowLoading: {},
      pageParams: {
        pageSize: 20,
        pageNum: 1,
      },
      importData: [],
      importColumn: [
        {
          title: "1688账号",
          key: "accountCode",
          align: "center",
          width: 160,
        },
        {
          title: "1688订单",
          key: "orderType",
          align: "center",
          width: 160,
          slot: "orderType",
        },
        {
          title: "所属事业部",
          key: "businessDeptIds",
          align: "center",
          minWidth: 150,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.businessDeptIds)) return h('span', '');
            const businessItem = row.businessDeptIds.split(',').map(m => {
              return this.$common.isEmpty(this.getAllBusinessDept[m]) ? '' :  this.getAllBusinessDept[m].name;
            });
            return h('div', {
              style: {
                padding: '5px 0',
                'text-align': 'left'
              }
            }, businessItem.join('，'));
          }
        },
        {
          title: "预计到货",
          key: "expectedDelivery",
          align: "center",
          width: 130,
          slot: "expectedDelivery",
        },
        {
          title: "运费均摊",
          key: "freightType",
          align: "center",
          width: 130,
          slot: "freightType",
        },
        {
          title: "1688留言",
          key: "aliMessage",
          align: "center",
          minWidth: 120,
        },
        {
          title: "采购备注",
          key: "purchaseMessage",
          align: "center",
          minWidth: 120,
        },

        {
          title: "操作",
          key: "operateCode",
          align: "center",
          width: 180,
          className: 'operate-col',
          render: (h, params) => {
            let operateItem = [];
            this.getPermission("aliaccount_authorized") && operateItem.push(h("Button", {
              props: {
                type: "default",
                size: 'small',
              },
              class: "iconbuttons",
              on: {
                click: () => {
                  this.auth(params.row);
                },
              },
            }, "去授权"));
            this.getPermission("aliaccount_update") && operateItem.push(h("Button", {
              props: {
                type: "default",
                size: 'small',
              },
              class: "iconbuttons ml5",
              on: {
                click: () => {
                  this.editAccount(params.row);
                },
              },
            }, "修改"));
            this.getPermission("aliaccount_delete") && operateItem.push(h("Button", {
              class: "iconbuttons ml5",
              on: {
                click: () => {
                  this.openDelete(params.row, params.index);
                },
              },
              props: {
                loading: params.row.deleteLoading,
                type: "primary",
                size: 'small'
              },
            }, "删除"));
            return operateItem;
          },
        },
      ],
      modal1: false,
      formData: {},
      orderTypeObj: {
        0: "大市场普通订单",
        1: "代销市场订单",
      },
      expectedDeliveryObj: {
        1: "1天预计到货时间",
        3: "3天预计到货时间",
        5: "5天预计到货时间",
        7: "7天预计到货时间",
        9: "9天预计到货时间",
        15: "15天预计到货时间",
      },
      freightTypeObj: {
        0: "按重量 ",
        1: "按数量 ",
        2: "按金额",
      },
      editStatus: false,
      accountList: [],
    };
  },
  computed: {
    getAllBusinessDept () {
      let businessDeptInfo = {};
      if (this.$common.isEmpty(this.$store.getters["businessDeptList"])) return businessDeptInfo;
      this.$store.getters["businessDeptList"].forEach(item => {
        businessDeptInfo[item.id] = item;
      })
      return businessDeptInfo;
    }
  },
  created() {
    this.tableHeight = this.getTableHeight(335);
  },
  activated() {
    this.getList();
  },
  methods: {
    // 获取列表数据
    getList () {
      if (!this.getPermission("aliaccount_query")) {
        this.$Message.error("无权限");
        return;
      }
      this.axios.post(api.getAccountList, this.pageParams).then((res) => {
        this.total = res.data.datas.total;
        this.importData = (res.data.datas.list || []).map((itema) => {
          itema.deleteLoading = false;
          return {
            ...itema,
            deleteLoading: false,
            ...((item) => {
              // 将 accountParam 的值解构出来
              return (item.accountParam || []).reduce((obj, account) => {
                obj[account.paramKey] = account.paramValue;
                return obj;
              }, {});
            })(itema)
          }
        });
      });
    },
    changePage(val) {},
    changePageSize(val) {
      this.pageParams.pageSize = val;
      this.getList();
    },
    // 编辑账号
    editAccount (row) {
      this.editStatus = !this.$common.isEmpty(row);
      this.formData = this.$common.isEmpty(row) ? {} : row;
      this.$nextTick(() => {
        this.modal1 = true;
      })
    },
    // 删除账号
    openDelete(row, index) {
      this.$Modal.confirm({
        title: '操作提示',
        width: '500px',
        content: `<div style="font-size: 20px;">确认是否要删除账号：<span style="color:#f20;">${row.accountCode}</span></div>`,
        cancelText: '关闭',
        onOk: () => {
          this.$set(row, 'deleteLoading', true);
          this.axios.delete(`${api.deleteAccount}${row.accountId}`).then((res) => {
            this.$Message.success("删除成功");
            this.$nextTick(() => {
              this.getList();
            })
          }).finally(() => {
            this.$set(row, 'deleteLoading', false);
          });
        }
      })
    },
    // 账号授权
    auth(row) {
      this.axios.get(api.getAuthorizedAddress + row.accountId).then((res) => {
        window.open(res.data.datas);
      });
    }
  },
};
</script>
<style lang="less" scoped>
.commodityMatch{
  .table-hand-operate{
    display: flex;
    padding: 0 0 15px 0;
    justify-content: space-between;
  }
}
</style>
