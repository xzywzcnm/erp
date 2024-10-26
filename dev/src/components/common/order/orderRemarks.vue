<template >
  <div class="orderRemarksPage">
    <div class="afterSalePage-title">
      <span class="title">备注</span>

      <Poptip placement="top" width="400" class="remark-poptip" @on-popper-show="showRemarkTextarea"
        v-model="poptipVisible" v-if="hasEdit && getPermission('orderRemark_insert') && inPage !== 'dispute'">
        <div class="orderDetailSaleAdd">
          <Icon type="md-add" class="icon" />
          <span class="pointer-font">增加备注</span>
        </div>
        <div slot="content">
          <Input v-model.trim="remarkContent" type="textarea" :maxlength="500" class="inputTextHeight"
            placeholder="请输入..."></Input>
          <div style="text-align:right;" class="mt10">
            <Button @click="(poptipVisible = false)" class="mr10">取消</Button>
            <Button @click="addRemark" type="primary" :loading="loading">保存</Button>
          </div>
        </div>
      </Poptip>
    </div>
    <div class="afterSalePage-content">
      <Table v-if="!$common.isEmpty(orderRemarks)" :columns="columns" :data="orderRemarks" border :show-header="false"></Table>
      <Spin fix v-if="loading"></Spin>
    </div>
  </div>
</template>
<script >
import api from '@/api/api';
import permission_mixin from '@/components/mixin/permission_mixin';
export default {
  mixins: [permission_mixin],
  data() {
    let v = this;
    return {
      remarkContent: '', // 备注
      columns1: [
        {
          align: 'left',
          width: '160px',
          render: (h, params) => {
            return h('span', v.$common.getDataToLocalTime(params.row.createdTime, 'fulltime'))
          }
        },
        {
          align: 'left',
          render: (h, params) => {
            return h('div', {
              style: {
                display: 'flex'
              }
            }, [
              h('span', v.getUserName(params.row.createdBy) + '：'),
              h('span', {
                style: {
                  flex: 1,
                }
              }, params.row.remarkContent)
            ]);
          }
        },
      ],
      columns2: [{
        align: 'left',
        width: '80px',
        render(h, params) {
          return h('span', {
            style: {
              textDecoration: 'underline',
              color: '#ed4014',
              cursor: 'pointer',
            },
            on: {
              'click'() {
                v.delRemark(params.row.orderRemarkId)
              }
            },
          }, '删除');
        }
      }],
      columns: [],
      poptipVisible: false, // 控制弹框展示
      loading: false,
      pageInfo: {}
    };
  },
  props: {
    moalVisible: { type: Boolean, default: false },
    hasEdit: {// 是否可以编辑
      default() {
        return true;
      },
      type: Boolean
    },
    orderInfo: {
      type: [Object, String],
      default: () => { return null }
    },
    isPlatformOrder: { type: Boolean, default: false },
    orderDetailsData: Object,
    inPage: String,
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
            this.moalVisible && this.startMakePackageInfo();
          })
        }
      }
    }
  },
  computed: {
    getInfo () {
      return this.orderInfo;
    },
    // 备注列表数据
    orderRemarks () {
      if (this.$common.isEmpty(this.orderDetailsData)) return [];
      return this.orderDetailsData.orderRemarks || [];
    }
  },
  created () {},
  methods: {
    rsetData () {
      this.pageInfo = {};
    },
    startMakePackageInfo() {
      let arr = this.$common.copy(this.columns1);
      if (this.hasEdit && this.getPermission('orderRemark_delete')) arr.push(...this.columns2);
      this.columns = arr;
    },
    getUserName(userId) { // 从用户列表中获取相关用户名
      if (userId === '系统操作') return userId;
      let userInfoList = this.$store.state.userInfoList;
      if (userInfoList !== null && userInfoList[userId] !== undefined) {
        return userInfoList[userId].userName;
      } else {
        return '';
      }
    },
    getUserInfo(userId) {
      // 通过用户id获取用户信息
      let allUser = this.$common.copy(this.$store.state.userInfoList || {});
      return allUser[userId] && allUser[userId].userName;
    },
    // 保存备注
    addRemark() {
      if (this.remarkContent === '') {
        this.$Message.error('内容不能为空');
        return false;
      }
      let temp = {
        orderId: this.pageInfo.orderId,
        remarkContent: this.remarkContent,
        orderType: this.isPlatformOrder ? 1 : 0
      };
      this.loading = true;
      this.axios.post(api.add_remark, JSON.stringify(temp)).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('保存成功');
          this.$parent.updateStatus = true;
          this.$parent.$parent.$parent.pageParamsStatus = true;
          this.remarkContent = '';
          this.poptipVisible = false;
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && this.$Message.error('操作失败，请重新尝试');
        }
      }).finally(() => {
        this.loading = false;
      })
    },
    // 删除备注
    delRemark(remarkId) {
      this.loading = true;
      this.axios.delete(api.del_remark + remarkId).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('删除成功');
          this.$parent.updateStatus = true;
          this.$parent.$parent.$parent.pageParamsStatus = true;
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && this.$Message.error('操作失败，请重新尝试');
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    showRemarkTextarea() {
      this.remarkContent = '';
    }
  },
};
</script>
<style lang="less" scoped>
.pointer-font{
  cursor: pointer;
  color: #2828ff;
  text-decoration: underline;
  text-underline-position: under;
}
</style>
<style lang="less">
@orderLeftWidth: 95px; // 订单详情左侧宽度
.orderRemarksPage {
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

    .remark-poptip {
      .inputTextHeight .ivu-input {
        height: 100px !important;
      }
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
    position: relative;
    padding-left: @orderLeftWidth;
  }
}
</style>
