<template >
  <div class="afterSalePage">
    <div class="afterSalePage-title">
      <span class="title">售后处理</span>
      <div class="orderDetailSaleAdd"
        v-if="getPermission('orderInfo_afterSales_creator') && pageInfo.isInvalid === '0'">
        <Icon type="md-add" class="icon" />
        <span @click="addPost" class="pointer-font">新建售后单</span>
      </div>
    </div>
    <div class="afterSalePage-content">
      <Table v-if="data1.length" :columns="columns1" :data="data1" border :show-header="false"></Table>
      <!-- 新建售后单 -->
      <Drawer width="800" :class-name="'zIndexTop'" transfer placement="left" v-model="postSaleStepValue">
        <post-sale-step ref="postSaleStep" :editType="editType" :open="timestamp1" :reasonList="reasonList"
          :postDetail="postDetail" :source="'order'" @searchOrderCallback="searchOrderCallback"
          @saveSuccess="saveSuccessFn"></post-sale-step>
      </Drawer>
    </div>
  </div>
</template>
<script >
import api from '@/api/api';
import permission_mixin from '@/components/mixin/permission_mixin';
import postSaleStep from '@/views/customerCenter/components/postSaleTreatment/postSaleStep';
export default {
  mixins: [permission_mixin],
  components: { postSaleStep },
  data() {
    let v = this;
    return {
      postSaleStepValue: false, // 新建售后单弹框
      editType: 'look',
      pageInfo: {},
      timestamp1: 0,
      reasonList: [],
      postDetail: {}, // 售后详情
      columns1: [
        {
          title: '售后单号', // 售后单号
          key: 'afterSalesCode',
          align: 'left',
          render: (h, params) => {
            return h('div', [
              h('span', '售后单号：'),
              h('span', {
                on: {
                  'click'() {
                    v.$refs.postSaleStep.getOrderDetail(params.row.orderId);
                    v.postSaleStepValue = true;
                    v.editType = 'look';
                    v.getPostDetail(params.row.afterSalesId);
                    // 获取售后原因列表
                    v.getReasonList();
                  }
                },
                style: {
                  color: '#0000FF',
                  cursor: 'pointer',
                  'text-decoration': 'underline',
                  'text-underline-position': 'under'
                }
              }, params.row.afterSalesCode),
            ])
          }
        },
        {
          title: '处理类型',
          key: 'afterSalesType',
          align: 'left',
          render: (h, params) => {
            let afterSalesType = params.row.afterSalesType; // 售后服务类型 1退款1退货1补发货 退款100,退货010,补发货001 或者组合类型111
            let type = {
              '100': {
                code: '100',
                data: ['退款']
              },
              '010': {
                code: '010',
                data: ['退货']
              },
              '001': {
                code: '001',
                data: ['补发货']
              },
              '111': {
                code: '111',
                data: ['退款', '退货', '补发货']
              },
              '110': {
                code: '110',
                data: ['退款', '退货']
              },
              '101': {
                code: '101',
                data: ['退款', '补发货']
              },
              '011': {
                code: '011',
                data: ['退货', '补发货']
              }
            };
            let text = type[afterSalesType] ? type[afterSalesType].data : [];
            return h('div', [
              h('span', '处理类型：'),
              h('span', {}, text.join('、'))
            ]);
          }
        },
        {
          title: '创建时间', // 创建时间
          key: 'createdTime',
          align: 'left',
          render: (h, params) => {
            return h('div', [
              h('span', '创建时间：'),
              h('span', v.$common.getDataToLocalTime(params.row.createdTime, 'fulltime'))
            ]);
          }
        },
        {
          title: '操作人',
          key: 'address',
          align: 'left',
          render(h, params) {
            return h('div', [
              h('span', '操作人：'),
              h('span', v.getUserInfo(params.row.updatedBy))
            ]);
          }
        }
      ],
      data1: [],
    };
  },
  props: {
    moalVisible: { type: Boolean, default: false },
    orderInfo: {
      type: [Object, String],
      default: () => { return null }
    },
  },
  watch: {
    moalVisible: {
      deep: true,
      immediate: true,
      handler(val) {
        this.$nextTick(() => {
          !val && this.rsetData();
        })
      }
    },
    getInfo: {
      deep: true,
      immediate: true,
      handler(val) {
        if (val.orderId) {
          this.pageInfo = val;
          this.$nextTick(() => {
            this.moalVisible && this.getAfterSales(this.pageInfo.orderId);
          })
        }
      }
    }
  },
  computed: {
    getInfo () {
      return this.orderInfo
    }
  },
  created () {},
  methods: {
    rsetData () {
      this.pageInfo = {};
      this.data1 = [];
    },
    getUserInfo(userId) {
      // 通过用户id获取用户信息
      let allUser = this.$common.copy(this.$store.state.userInfoList || {});
      return allUser[userId] && allUser[userId].userName;
    },
    addPost() {
      this.postSaleStepValue = true;
      this.editType = 'add';
      this.timestamp1 = new Date().getTime();
      this.getReasonList();
      this.$refs.postSaleStep.getOrderDetail(this.pageInfo.orderId || '');
    },
    // 获取售后详情
    getPostDetail(afterSalesId) {
      return new Promise(resolve => {
        this.axios.get(api.get_afterSalesApiDetail + afterSalesId).then(response => {
          if (response.data.code === 0) {
            this.postDetail = response.data.datas;
            resolve();
          }
        });
      });
    },
    // 获取售后原因列表
    getReasonList() {
      this.$refs.postSaleStep.getReasonList();
      // let v = this;
      // v.axios.get(api.get_afterSalesOrderReason).then(response => {
      //   if (response.data.code === 0) {
      //     this.$refs.postSaleStep.reasonListT = response.data.datas;
      //   }
      // });
    },
    searchOrderCallback() { },
    saveSuccessFn() {
      this.getAfterSales(this.pageInfo.orderId || '');
      this.postSaleStepValue = false;
    },
    getAfterSales(id) {
      this.axios.get(api.get_listByOrderId + id).then(response => {
        if (response.data.code === 0) {
          this.data1 = response.data.datas;
        }
      });
    },
  },
};
</script>
<style lang="less" scoped>
@orderLeftWidth: 95px; // 订单详情左侧宽度
.afterSalePage {
  .afterSalePage-title {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    .title {
      font-size: 14px;
      font-weight: bold;
      width: @orderLeftWidth;
      line-height: 22px;
    }

    .orderDetailSaleAdd {
      font-size: 12px;
      color: #2828ff;
      cursor: pointer;
      display: flex;
      align-items: center;
      line-height: 22px;

      .icon {
        margin-right: 4px;
      }
    }
  }

  .afterSalePage-content {
    padding-left: @orderLeftWidth;
  }

  .pointer-font{
    cursor: pointer;
    color: #2828ff;
    text-decoration: underline;
    text-underline-position: under;
  }
}
</style>
<style lang="less">
.zIndexTop {
  // z-index: 1071;
  position: relative;
  .ivu-drawer-body{
    padding-top: 0;
  }
}
</style>
