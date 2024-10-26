<template>
  <div class="tabContainer commonFilter">
    <Tabs :animated="false" @on-click="changeTab" :value="tabCur" class="tabs-content">
      <Tab-pane :label="noMarkLabel" name="noMark">
        <noMark :tabTimestamp="tampJson.noMark" @getTabNumber="getTabNumber" tabpane-view="noMark" />
      </Tab-pane>
      <Tab-pane :label="updateLabel" name="update" v-if="getPermission('orderInfo_queryForTrackUpdated') || isNewType">
        <waybillUpdate
          :tabTimestamp="tampJson.update"
          @getTabNumber="getTabNumber"
          v-if="getPermission('orderInfo_queryForTrackUpdated') && !isNewType && !$common.isEmpty(tampJson.update)"
        />
        <!-- 待录入退货跟踪号 -->
        <noMark v-else-if="!$common.isEmpty(tampJson.update)" :tabTimestamp="tampJson.update" @getTabNumber="getTabNumber" tabpane-view="update" />
      </Tab-pane>
      <Tab-pane :label="waybillLabel" name="waybill" v-if="isNewType">
        <noMark v-if="!$common.isEmpty(tampJson.waybill)" :tabTimestamp="tampJson.waybill" @getTabNumber="getTabNumber" tabpane-view="waybill" />
      </Tab-pane>
      <Tab-pane :label="fWaitAllLabel" name="fWaitAll" v-if="isNewType">
        <noMark v-if="!$common.isEmpty(tampJson.fWaitAll)" :tabTimestamp="tampJson.fWaitAll" @getTabNumber="getTabNumber" tabpane-view="fWaitAll" />
      </Tab-pane>
      <Tab-pane :label="shippingMarkLabel" name="shippingMark" v-if="isNewType">
        <noMark v-if="!$common.isEmpty(tampJson.shippingMark)" :tabTimestamp="tampJson.shippingMark" @getTabNumber="getTabNumber" tabpane-view="shippingMark" />
      </Tab-pane>
    </Tabs>
  </div>
</template>
<script>
import api from '@/api/api';
import noMark from '@/views/commonOrder/components/commonOrder/noMark';
import waybillUpdate from '@/views/commonOrder/components/commonOrder/waybillUpdate';
// import awaitTrackingNoEntry from '@/views/commonOrder/components/commonOrder/awaitTrackingNoEntry';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  components: {
    noMark,
    waybillUpdate,
    // awaitTrackingNoEntry
  },
  data () {
    return {
      tabCur: 'noMark',
      tampJson: {},
      platform: this.inGroup,
      newPattern: ['otto'],
      badgeData: {},
    };
  },
  computed: {
    // 是否新方式
    isNewType () {
      return this.newPattern.includes(this.platform);
    },
  },
  created () {
    // this.getTabNumber();
  },
  methods: {
    changeTab (name) {
      this.tabCur = name;
      this.$set(this.tampJson, name, new Date().getTime());
    },
    // 获取标列表数量
    getTabNumber () {
      if (this.isNewType) {
        this.axios.post(api.ottoForMarkShipmentsCount, {}).then(response => {
          if (response && response.data && response.data.code === 0) {
            this.badgeData = response.data.datas || {};
          }
        });
      } else {
        this.axios.get(`${api.get_queryNotShippingAndtrackingUpdatedBadges}?platformId=${this.platform}`).then(response => {
          if (response && response.data && response.data.code === 0) {
            this.badgeData = response.data.datas || {};
          }
        });
      }
    },
    // 全部未标(未标)
    noMarkLabel (h) {
      if (this.isNewType) {
        return h('div', [
          h('span', '全部未标')
        ]);
      }
      return h('div', [
        h('span', '未标'),
        h('Badge', {
          props: {
            dot: true,
            count: this.badgeData.totalNotShipping
          }
        })
      ]);
    },
    // 待录入退货跟踪号(运单号有更新)
    updateLabel (h) {
      if (this.isNewType) {
        let item = [h('span', '待录入退货跟踪号')];
        if (!this.$common.isEmpty(this.badgeData.stayImportRNCount) && this.badgeData.stayImportRNCount > 0) {
          item.push(h('span', {
            style: {
              color: '#f20'
            },
          }, `(${this.badgeData.stayImportRNCount})`));
        }
        return h('div', item);
      }
      return h('div', [
        h('span', '运单号有更新'),
        h('Badge', {
          props: {
            dot: true,
            count: this.badgeData.trackingUpdated
          }
        })
      ]);
    },
    // 待获取运单号
    waybillLabel (h) {
      let item = [h('span', '待获取运单号')];
      if (!this.$common.isEmpty(this.badgeData.stayGetTNCount) && this.badgeData.stayGetTNCount > 0) {
        item.push(h('span', {
          style: {
            color: '#f20'
          },
        }, `(${this.badgeData.stayGetTNCount})`));
      }
      return h('div', item);
    },
    // 待标(标失败)
    fWaitAllLabel (h) {
      let item = [h('span', '待标&标失败')];
      if (!this.$common.isEmpty(this.badgeData.stayDeliverCount) && this.badgeData.stayDeliverCount > 0) {
        item.push(h('span', {
          style: {
            color: '#f20'
          },
        }, `(${this.badgeData.stayDeliverCount})`));
      }
      return h('div', item);
    },
    // 标发货中
    shippingMarkLabel (h) {
      let item = [h('span', '标发货中')];
      if (!this.$common.isEmpty(this.badgeData.inDeliverCount) && this.badgeData.inDeliverCount > 0) {
        item.push(h('span', {
          style: {
            color: '#f20'
          },
        }, `(${this.badgeData.inDeliverCount})`));
      }
      return h('div', item);
    }
  }
};
</script>
<style lang="less" scoped>
.tabContainer{
  position: relative;
  // :deep(.tabs-content){
  //   .ivu-tabs-tab{
  //     margin: 0;
  //   }
  // }
}
</style>
