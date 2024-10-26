<template >
  <div >
    <div class="tabContainer commonFilter" >
      <Tabs :animated="false" @on-click="triggerTabs" >
        <Tab-pane v-for="(item,index) in tabList" :key="index" :label="item.render" :name="item.key"></Tab-pane>
      </Tabs>
      <apiAccept :type="logisticsType" ref="commonAccept" />
    </div>
  </div>
</template>
<script>
import apiAccept from './apiAccept';
import Mixin from '@/components/mixin/common_mixin';
import {
  getSinglePageRole
} from '@/utils/user';

export default {
  mixins: [Mixin],
  components: {
    apiAccept
  },
  data () {
    let self = this;
    return {
      overdueOrder: 0,
      remainInOneDay: 0,
      logisticsType: '01', // 01 API对接  02 第三方物流
      tabList: [
        {
          render (h) {
            return h('div', [
              h('span', 'API对接'), h('Badge', {
                props: {
                  dot: true,
                  count: self.overdueOrder
                }
              })
            ]);
          },
          key: '01'
        }, {
          render (h) {
            return h('div', [
              h('span', '第三方物流')
            ]);
          },
          key: '02'
        }
      ],
      label1 (h) {
        return h('div', [
          h('span', 'API对接'), h('Badge', {
            props: {
              dot: true,
              count: self.overdueOrder
            }
          })
        ]);
      },
      label2 (h) {
        return h('div', [
          h('span', '未对接'), h('Badge', {
            props: {
              dot: true,
              count: self.remainInOneDay
            }
          })
        ]);
      },
      label3 (h) {
        return h('div', [
          h('span', '第三方物流')
        ]);
      }
    };
  },
  methods: {
    triggerTabs (item) {
      this.$refs.commonAccept.startLoading();
      this.$refs.commonAccept.getEnableHeight();
      this.logisticsType = item;
      if (this.logisticsType === '01') {
        this.axios.defaults.headers['PlatformId'] = 'wms_carrier_0';
        getSinglePageRole(this.$store.state.menuKey);
      } else {
        this.axios.defaults.headers['PlatformId'] = 'wms_carrier_1';
        getSinglePageRole(this.$store.state.menuKey);
      }
    }
  },
  created () {
    let v = this;
    v.getPermissionCallback('logistics_logisticsSettings').then(() => {

    });
  }
};
</script >
