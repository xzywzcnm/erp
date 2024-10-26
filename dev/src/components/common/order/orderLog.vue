<template>
  <div class="orderLogPage">
    <div class="afterSalePage-title">
      <span class="title">日志</span>
      <div class="orderDetailSaleAdd">
        <Icon class="icon" :class="{ rotateIcon: flodVisible }" type="ios-arrow-up" @click="foldIn" />
      </div>
    </div>
    <div class="afterSalePage-content" v-if="flodVisible">
      <Table highlight-row border max-height="500" :columns="orderLogColumns" :data="orderLogData">
      </Table>
      <Button v-if="orderLogData.length && orderLogParams.nextToken !== null" @click="getOrderLog()"
        icon="ios-arrow-down" long class="btn">
        展示更多
      </Button>
    </div>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import { getService } from '@/utils/getService';

export default {
  name: 'orderLog',
  mixins: [Mixin],
  data() {
    let v = this;
    return {
      isLogLoading: false,
      pageInfo: {},
      orderLogColumns: [
        {
          key: 'updatedBy',
          title: '操作人',
          align: 'left',
          width: 160,
          render(h, params) {
            return h('span', v.getUserName(params.row.updatedBy));
          }
        },
        {
          key: 'updatedTime',
          title: '操作时间',
          align: 'left',
          width: 160,
          render: (h, params) => {
            return h('div', {}, v.getDataToLocalTime(params.row.updatedTime, 'fulltime'));
          }
        },
        {
          key: 'operateContent',
          title: '操作内容描述',
          align: 'left',
          minWidth: 260
        },
      ],
      orderLogData: [],
      orderLogParams: {
        'orderId': null,
        'nextToken': '1',
        'pageSize': 10
      },
      flodVisible: false, // 是否折叠
    };
  },
  props: {
    moalVisible: { type: Boolean, default: false },
    orderInfo: {
      type: [Object, String],
      default: () => { return null },
    }
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
            this.moalVisible && this.On_searchOrderLogInit();
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
    },
    // 搜索方法 首次加载 （日志增量加载）
    On_searchOrderLogInit() {
      this.flodVisible = false;
      this.orderLogParams.orderId = this.pageInfo.orderId;
      this.orderLogParams.nextToken = null;
      this.orderLogData = [];
      this.getOrderLog();
    },
    // 获取订单日志
    getOrderLog() {
      let type = getService();
      if (type) {
        if (this.isLogLoading) return;
        const url = (location.pathname.includes('order-service') && type === 'menuOrder') ? api.get_orderOperationLog : api.get_CsOrderOperationLog;
        this.isLogLoading = true;
        this.axios.post(url, this.orderLogParams).then(response => {
          if (response.data.code === 0) {
            this.orderLogParams.nextToken = response.data.datas.nextToken;
            this.orderLogData = [...this.orderLogData, ...response.data.datas.result];
          }
          this.$nextTick(() => {
            this.isLogLoading = false;
          })
        }).catch(() => {
          this.$nextTick(() => {
            this.isLogLoading = false;
          })
        })
      }
    },
    // 折叠
    foldIn() {
      this.flodVisible = !this.flodVisible;
    }
  }
};
</script>
<style lang="less" scoped>
@orderLeftWidth: 95px; // 订单详情左侧宽度
.orderLogPage {
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
      font-size: 20px;
      color: #2D8CF0;
      line-height: 22px;

      .icon {
        transform: rotate(0deg);
        transition: transform .5s;
        cursor: pointer;
      }

      .rotateIcon {
        transform: rotate(180deg);
        transition: transform .5s;
      }
    }
  }

  .afterSalePage-content {
    padding-left: @orderLeftWidth;

    .btn {
      position: relative;
      top: -1px;
      z-index: 10;
      border-radius: 0 0 4px 4px;
    }
  }
}
</style >
