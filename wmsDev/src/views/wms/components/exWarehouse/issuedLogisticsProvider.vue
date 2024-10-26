<template>
  <div>
    <div class="tabContainer commonFilter" v-show="workShow === 'list'">
      <Tabs :animated="false" v-model="tabsValue">
        <Tab-pane :label="label1" name="tab1">
          <pending v-if="tabsValue === 'tab1'" @showPackageDetails="showPackageDetails" :ymsMerchant="ymsMerchant" />
        </Tab-pane>
        <Tab-pane :label="label4" name="tab2">
          <waitingForShipment v-if="tabsValue === 'tab2'" @showPackageDetails="showPackageDetails"
            :ymsMerchant="ymsMerchant" />
        </Tab-pane>
        <Tab-pane :label="label2" name="tab3">
          <noPackageNum v-if="tabsValue === 'tab3'" @showPackageDetails="showPackageDetails" :ymsMerchant="ymsMerchant" />
        </Tab-pane>
        <Tab-pane :label="label3" name="tab4">
          <noFaceSheet v-if="tabsValue === 'tab4'" @showPackageDetails="showPackageDetails" :ymsMerchant="ymsMerchant" />
        </Tab-pane>
        <Tab-pane :label="label5" name="tab5" v-if="isYms == 1">
          <pendingApplication v-if="tabsValue === 'tab5'" @showPackageDetails="showPackageDetails" />
        </Tab-pane>
        <Tab-pane :label="label6" name="tab6">
          <logisticsException v-if="tabsValue === 'tab6'" @showPackageDetails="showPackageDetails" />
        </Tab-pane>
      </Tabs>
    </div>
    <div v-if="workShow === 'detail'">
      <!-- 神人设计，我不想改了啊，这屎山俺就继续堆了 -->
      <orderDetail :pickingNo="orderDetailInfo.packageCode" :workShow="workShow" :packageId="orderDetailInfo.packageId"
        workType="sellStock" v-if="isYms == 1"></orderDetail>

      <sellStockOutDtl :workShow="workShow" :pickingNo="packageCode" workType="sellStock" :ymsMerchant="ymsMerchant"
        v-else />
    </div>
  </div>
</template>
<script>
import api from '@/api/api';
import pending from './pending';
import noPackageNum from './noPackageNum';
import noFaceSheet from './noFaceSheet';
import waitingForShipment from './waitingForShipment';
import sellStockOutDtl from './sellStockOutDtl';
import pendingApplication from './pendingApplication';
import logisticsException from './logisticsException';
import Mixin from '@/components/mixin/common_mixin';
import publicService from '@/components/mixin/publicService_mixin';
import orderDetail from "../yuncang/orderDetail";

export default {
  mixins: [Mixin, publicService],
  components: {
    pending,
    noPackageNum,
    noFaceSheet,
    sellStockOutDtl,
    waitingForShipment,
    pendingApplication,
    logisticsException,
    orderDetail,
  },
  data() {
    var self = this;
    return {
      tabsValue: 'tab1',
      pendingNum: 0,
      noPackageNum: 0,
      label1(h) {
        return h('div', {
          class: 'reset-badge-dot'
        }, [
          h('span', '待申请'), h('Badge', {
            props: {
              dot: !!self.pendingNum
            }
          })
        ]);
      },
      label2(h) {
        return h('div', {
          class: 'reset-badge-dot'
        }, [
          h('span', '运单号未获取'), h('Badge', {
            props: {
              dot: !!self.noPackageNum
            }
          })
        ]);
      },
      label3(h) {
        return h('div', [
          h('span', '面单未获取')
          // h('Badge', {
          //   props: {
          //     count: self.noPackageNum
          //   }
          // })
        ]);
      },
      label4(h) {
        return h('div', [
          h('span', '等待交运')
          // h('Badge', {
          //   props: {
          //     count: self.noPackageNum
          //   }
          // })
        ]);
      },
      label5(h) {
        return h('div', [
          h('span', '待申请云卖')
        ]);
      },
      label6(h) {
        return h('div', [
          h('span', '已下发物流异常')
        ]);
      },
      workShow: 'list',
      packageCode: '',
      orderDetailInfo: {},
    };
  },
  methods: {
    getBadge() {
      let v = this;
      v.axios.get(api.get_issuedBadge + '?warehouseId=' + v.getWarehouseId()).then(response => {
        if (response.data.code === 0) {
          v.pendingNum = response.data.datas.notAddPackage;
          v.noPackageNum = response.data.datas.noTrackingNumber;
        }
      });
    },
    showPackageDetails(row, detail) {
      this.orderDetailInfo = row;
      this.packageCode = row.packageCode;
      this.$nextTick(() => {
        this.workShow = detail;
      })
    }
  },
  computed: {
    ymsMerchant() { // 如果当前用户是云仓供应商隐藏相关的操作功能
      let erpConfig = this.$store.state.erpConfig;
      if (erpConfig) {
        if (erpConfig.allYmsMerchantIds && erpConfig.allYmsMerchantIds.length > 0) {
          if (erpConfig.allYmsMerchantIds.indexOf(erpConfig.merchant.merchantId) > -1) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
    },
  },
  mounted() {
    let v = this;
    v.showShippingData(true); // 查询物流方式下拉数据
    v.getBadge();
  }
};
</script >
<style >
.reset-badge-dot .ivu-badge-dot {
  top: -12px;
}
</style >
