<template >
  <div>
    <sliderModal v-model="orderDetails" :spinShow="spinShow" v-if="orderDetailsBegin" :styles="{}" class="slider-model">
      <component
        :is="orderDetailsName"
        :moal-visible.sync="orderDetails"
        :orderDetailsId="orderDetailsId"
        :platformBunkerOrder="platformBunkerOrder"
        :orderNo="orderNo"
        :timestamp="timestamp"
        :platformId="platformId"
        :orderOpenData="orderOpenData"
        @resetSpinShow="resetSpinShow"
      >
      <template slot="tabs">
        <div class="demo-tabs-style2" v-if="orderList.length > 1" style="margin-bottom: 30px;">
        <Tabs type="card">
          <TabPane v-for="(item,index) in orderList" @click="getPlatform(index)" :key="index" :label="item.accountCode + '-' + item.salesRecordNumber"></TabPane>
        </Tabs>
      </div>
      <div v-if="orderList.length > 1" class="fix-height"></div>
      </template>
        </component>
    </sliderModal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import orderSysMixin from '@/components/mixin/orderSys_mixin';
import commonOderDetails from '@/views/commonOrder/components/commonOrder/orderDetails';
import {
  getSinglePageRoleCommon
} from '@/utils/user';

export default {
  name: 'commonDetails',
  mixins: [Mixin, orderSysMixin],
  components: {
    commonOderDetails
  },
  data () {
    return {
      platformId: [],
      orderDetailsName: '',
      platformBunkerOrder: {},
      orderDetails: false,
      orderDetailsBegin: false,
      spinShow: false,
      orderDetailsId: '',
      orderNo: '',
      timestamp: null,
      cacheRole: null,
      orderList: [],
      orderOpenData: {}
    };
  },
  created () {

  },
  props: {},
  watch: {
    'orderDetails': {
      handler (n, o) {
        if (n) {
          this.cacheRole = JSON.parse(JSON.stringify(this.$store.state.roleList));
        } else {
          this.$store.commit('fullInGroup', null);
          this.$store.commit('roleList', this.cacheRole);
        }
      }
    }
  },
  methods: {
    onOpen (searchValue, orderData) {
      /**
       * 父
       * @params
       * searchValue 搜索参数
       * */
      this.orderOpenData = {
        otherParams: this.$common.copy(orderData || {}),
        searchParams: this.$common.copy(searchValue || {})
      };
      this.getOrderId(searchValue).then(() => {
        this.getPlatform(0);
      });
    },
    getOrderId (searchValue) {
      /**
       * 获取orderId 去查询详情
       * */
      return new Promise(resolve => {
        let v = this;
        v.axios.post(api.get_fullTextSearch, searchValue, {
          headers: { 'PlatformId': '' }
        }).then(response => {
          if (response.data && response.data.code === 0) {
            if (!response.data.datas || response.data.datas.length === 0) {
              this.$Message.error('无此单号，请检查单号重新搜索');
              return;
            }
            if (response.data.datas.length > 0) { // 匹配订单号
              this.platformBunkerOrder = [1].includes(Number(response.data.datas[0].isPlatformOrder));
              let saleAccountIds = response.data.datas.map(i => i.saleAccountId);
              v.axios.post(api.get_saleAccountById + '?saleAccountIds=' + saleAccountIds).then(response1 => {
                if (response1.data.code === 0) {
                  let list = response1.data.datas;
                  for (var i = 0; i < list.length; i++) {
                    for (var t = 0; t < response.data.datas.length; t++) {
                      if (response.data.datas[t].saleAccountId === list[i].saleAccountId) {
                        response.data.datas[t].accountCode = list[i].accountCode;
                      }
                    }
                  }
                  v.getOrderRemark(response.data.datas, response.data.datas.map(i => i.orderId)).then(data => {
                    v.orderList = data;
                    resolve();
                  }); // 匹配订单备注
                }
              });
            }
          }
        });
      });
    },
    getPlatform (index) {
      /**
       * 获取订单信息
       * */
      let obj = this.orderList[index];
      return new Promise(resolve => {
        let v = this;
        v.orderNo = v.orderList[index].accountCode + '-' + v.orderList[index].salesRecordNumber;
        let platform = obj.platformId;
        let getRolePage = platform;
        this.$store.commit('fullInGroup', platform); // 关闭时清空
        this.platformId = [platform];
        (v.$store.state.platformGroup || []).forEach(i => {
          if (i.platformId === platform && i.type === 2) {
            // 自定义平台
            getRolePage = 'definePlatform';
          }
        });
        this.setOrderComponent(platform); // 使用哪个详情组件
        getSinglePageRoleCommon(getRolePage + '_orderToRetrieve').then(() => {
          v.orderDetailsId = obj.orderId;
          // v.orderNo = '';
          let date = new Date().getTime();
          v.orderDetailsBegin = true;

          v.$nextTick(() => {
            v.timestamp = date;
            this.$nextTick(() => {
              this.orderDetails = true;
            })
          });
        });
      });
    },
    setOrderComponent (platform) {
      this.orderDetailsName = 'commonOderDetails';
      // if (platform === 'ebay') {
      //   this.orderDetailsName = 'ebayOrderDetails';
      // } else if (platform === 'aliexpress') {
      //   this.orderDetailsName = 'aliexpressOrderDetails';
      // } else if (platform === 'amazon') {
      //   this.orderDetailsName = 'amazonOrderDetails';
      // } else if (platform === 'wish') {
      //   this.orderDetailsName = 'wishOrderDetails';
      // } else {
      //   this.orderDetailsName = 'commonOderDetails';
      // }
    }
  }
};
</script >

<style scoped >
.demo-tabs-style2 {
  position: fixed;
  top: 10px;
  right: 10px;
  width: 780px;
  background-color: #fff;
  z-index: 2;
}
.fix-height {
  height: 40px;
  width: 100%;
}
</style >
<style >
.demo-tabs-style2 > .ivu-tabs.ivu-tabs-card > .ivu-tabs-bar {
  margin-bottom: 0;
}

.demo-tabs-style2 > .ivu-tabs.ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab {
  border-radius: 0;
  background: #fff;
}

.demo-tabs-style2
  > .ivu-tabs.ivu-tabs-card
  > .ivu-tabs-bar
  .ivu-tabs-tab-active {
  border-top: 2px solid #3399ff;
  border-radius: 15px;
}

/*.demo-tabs-style2 > .ivu-tabs.ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab-active:before{
  content: '';
  display: block;
  width: 100%;
  height: 1px;
  background: #3399ff;
  position: absolute;
  top: 0;
  left: 0;
}*/
</style >
