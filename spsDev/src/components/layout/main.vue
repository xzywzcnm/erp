<template >
  <div class="layout sps-main">
    <vHeader></vHeader>
    <Layout>
      <Sider hide-trigger :width="240" :style="{
            background: '#fff',
            position: 'relative',
            zIndex: '100',
            marginTop: '50px',
          }" v-show="!$store.state.fullScreen">
        <vLeft></vLeft>
      </Sider>
      <Layout :style="{ padding: '0 12px 12px', marginTop: '50px' }">
        <div class="layout-breadcrumb" v-if="menu.length > 0">
          <!-- 面包屑 -->
          <breadcrumb :menu="menu"></breadcrumb>
        </div>
        <div class="layout-content-sps" style="padding-top: 0;">
          <div class="layout-main">
            <keep-alive>
              <router-view></router-view>
            </keep-alive>
          </div>
        </div>
      </Layout>
    </Layout>
    <systemNoticeModal />
    <authAbnormalWarnModal ref="authAbnormalWarnRef" />
  </div>
</template>
<script>
import Vue from 'vue';
import dayjs from 'dayjs';
import vHeader from './header';
import vLeft from './left';
import breadcrumb from './breadcrumb';
import spsMenu from '@/api/spsMenu';
import layoutMixin from '@/components/mixin/layout_mixin';
import Mixin from '@/components/mixin/common_mixin';
import '@/style/index.less';
Vue.prototype.dayjs = dayjs
import systemNoticeModal from "@/components/common/systemNoticeModal";
import authAbnormalWarnModal from '@/components/layout/authAbnormalWarnModal'; // 异常提醒弹窗
// import { getToken } from '@/utils/cookie';

export default {
  mixins: [Mixin, layoutMixin],
  components: {
    vHeader: vHeader,
    vLeft: vLeft,
    breadcrumb,
    systemNoticeModal,
    authAbnormalWarnModal
  },
  data () {
    return {
      menu: []
    };
  },
  watch: {
    // '$route' (n, o) {
    //   // 路由改变时，把当前链接存储到认证中心
    //   if (!window.location.href.includes('noPersermission')) {
    //     this.$connectAuth.saveTarget()
    //   }
    // }
  },
  created () {
    this.menu = spsMenu.menu;
  },
  mounted () {
    setTimeout(() => {
      if (this.$refs.authAbnormalWarnRef && this.$refs.authAbnormalWarnRef.getWarnDetails) {
        this.$refs.authAbnormalWarnRef && this.$refs.authAbnormalWarnRef.initData();
      }
    }, 200);
  }
};
</script>
<style lang="less">
.sps-main .ivu-layout.ivu-layout-has-sider {
  height: 100%;
}
:focus {
  outline: none;
}
.ivu-btn,
.ivu-checkbox-wrapper,
.ivu-form .ivu-form-item-label,
.ivu-input,
.ivu-modal-confirm-body,
.ivu-select-input,
.ivu-table {
  font-size: 12px;
}
// 认证中心 样式
.again-login-body{
  .ivu-modal-mask{
    background: none;
  }
  .ivu-modal-wrap{
    background-color: rgba(55,55,55,.6);
    z-index: 2147483646 !important;
    overflow: hidden;
  }
  .ivu-modal-content{
    top: 100px;
    background: none;
    border-radius: 0;
    box-shadow: none;
    .ivu-modal-confirm-head,
    .ivu-modal-confirm-footer{
      display: none;
    }
    .ivu-modal-body{
      display: inline-block;
      padding: 0;
      margin-left: 50%;
      transform: translate(-50%, 0);
      .ivu-modal-confirm{
        padding: 0;

      }
      .ivu-modal-confirm-body{
        background: #fff;
        padding: 0;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0, 0.3);
        overflow: hidden;
      }
    }
  }
  .ivu-modal{
    display: inline-block;
    top: 0;
    width: 100% !important;
    height: 100%;
  }
  #app{
    filter: blur(5px);
  }
}
</style>
