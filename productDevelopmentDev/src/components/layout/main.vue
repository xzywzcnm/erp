<template>
  <div class="layout">
    <vHeader></vHeader>
    <Layout>
      <Sider v-show="!$store.state.fullScreen" hide-trigger :width="240" :style="{
        background: '#fff',
        position: 'relative',
        zIndex: '100',
        paddingTop: '50px',
      }">
        <vLeft ref="vLeft"></vLeft>
      </Sider>

      <Layout :style="{ paddingTop: '50px' }">
        <div class="layout--main">
          <div class="layout-breadcrumb" v-if="menu.length > 0">
            <!-- 面包屑 -->
            <breadcrumb :menu="menu"></breadcrumb>
          </div>
          <div class="container--box">
            <div class="page-main">
              <transition name="fade">
                <router-view></router-view>
              </transition>
            </div>
          </div>
        </div>
      </Layout>
    </Layout>
    <systemNoticeModal />
    <authAbnormalWarnModal ref="authAbnormalWarnRef" />
  </div>
</template>
<script>
/* 引入模块,类似于script src 但这是模块化，只抽取模块功能 */
//    import menuapi from '../../api/menuapi'
import vHeader from "./header";
import vLeft from "./left";
import breadcrumb from './breadcrumb';
import layoutMixin from "../mixin/layout_mixin";
import menuWishCustomer from "./data/menuDate";
import Mixin from "../mixin/commonMixin";
// import { getToken } from '@/utils/cookie';
import systemNoticeModal from "@v/pds/common/systemNoticeModal";
import authAbnormalWarnModal from '@/components/layout/authAbnormalWarnModal'; // 异常提醒弹窗

export default {
  mixins: [Mixin, layoutMixin],
  components: {
    vHeader: vHeader,
    vLeft: vLeft,
    breadcrumb,
    systemNoticeModal,
    authAbnormalWarnModal
  },
  data: function () {
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
  created: function () {
    var v = this,
      inGroup = this.$store.state.inGroup; // 读取所在业务
    var url = ""; // 获取所在系统菜单
    if (inGroup === "productDev") {
      url = "productDev";
    }
    switch (url) {
      case "productDev":
        v.menu = menuWishCustomer.menu;
        break;
    }
    if (window.location.href.indexOf("data") > -1) {
      this.$store.commit("hiddenTable", false);
    } else {
      this.$store.commit("hiddenTable", true);
    }
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
