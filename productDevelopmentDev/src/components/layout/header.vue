<template>
  <div class="top-container ivu-menu-horizontal headSty">
    <div class="header_box">
      <!--左边区域-->
      <div class="left_box">
        <!--logo图片-->
        <div class="logo_box" v-if="logoTalg">
          <img :src="logoUrl" height="26" alt="LAPA"> <em>新品开发</em>
        </div>
        <!--展开与收起侧边栏按钮-->
        <Icon type="md-menu" size="26" @click="toggleClick" class="toggleMenu"></Icon>
      </div>
      <!--右边区域-->
      <div class="right_box">
        <!--右边用户信息-->
        <div class="user_info_box">
          <div class="backAuth-content">
            <span class="backAuth" @click="backAuth">
              <Icon type="ios-undo" />
              返回认证中心
            </span>
          </div>
          <!--语种-->
          <Dropdown @on-click="changeLanguage" class="style_right" v-if="infoTalg">
            <a href="javascript:;" class="layout-flag-button">
              <div class="flag" :class="flagName"></div>
            </a>
            <Dropdown-menu slot="list">
              <Dropdown-item v-for="(item, index) in languageList" :name="item.name" :key="index">
                <div class="flag lang" :class="item.name"></div>
                {{ item.lang }}
              </Dropdown-item>
            </Dropdown-menu>
          </Dropdown>
          <!--时区-->
          <Poptip v-model="timeZone" placement="bottom">
            <div class="mapSelect" style="white-space: nowrap">UTC{{ UTCtimezoom }}</div>
            <div slot="content">
              <div style="display: flex;align-items: center;">
                <span style="width: 60px;">时区：</span>
                <dyt-select v-model="timeModal" style="width:250px;" @on-change="changeTimezoom">
                  <Option v-for="(item, index) in timezoomList" :value="item.offset" :key="index">{{ item.text }}
                  </Option>
                </dyt-select>
              </div>
              <div class="timevalue">您当前的时间：{{ nowTime }}</div>
              <div class="timevalue">世界标准时间：{{ UTCtime }}</div>
            </div>
          </Poptip>
          <!--登出-->
          <Dropdown @on-click="changeDown" class="style_right">
            <div class="icon_box">
              <span class="text_name">您好，</span><span class="icon iconfont icon-yonghu"></span> <span
                class="text_name">{{ userName }}</span>
            </div>
            <Dropdown-menu slot="list">
              <!--用户信息-->
              <Dropdown-item name="info" v-if="!infoTalg">
                <Poptip placement="left" class="poptip_style" trigger="hover">
                  <div class="text">用户信息</div>
                  <div slot="content">
                    <span class="user_info style_right" style="color: #666;">{{ '客户编号：' + merchantIdName }}</span>
                  </div>
                </Poptip>
              </Dropdown-item>
              <!--语种-->
              <Dropdown-item name="languages" v-if="!infoTalg">
                <Dropdown @on-click="changeLanguage" placement="left" transfer-class-name="languages_dropdown">
                  <div class="text">语种</div>
                  <Dropdown-menu slot="list">
                    <Dropdown-item v-for="(item, index) in languageList" :name="item.name" :key="index">
                      <div class="flag lang" :class="item.name"></div>
                      {{ item.lang }}
                    </Dropdown-item>
                  </Dropdown-menu>
                </Dropdown>
              </Dropdown-item>
              <Dropdown-item name="theme">
                <div class="logout_item">
                  <Icon type="ios-shirt"></Icon>
                  <span class="user_item_text">修改主题</span>
                </div>
              </Dropdown-item>
              <!--登出-->
              <Dropdown-item name="signOut">
                <div class="logout_item">
                  <Icon type="md-log-out" class="icon_logout"></Icon>
                  <span class="text">登出</span>
                </div>
              </Dropdown-item>
            </Dropdown-menu>
          </Dropdown>
          <!--客户编号-->
          <span class="user_info style_right" v-if="infoTalg">{{ '客户编号：' + merchantIdName }}</span>
          <!--帮助-->
          <!-- <a class="style_right" style="color: #fff" target="_blank" href="http://help.tongtool.com/service.html?artId=259&&categoryId=328&&groupId=2">
            <Icon type="ios-navigate" size="18" style="margin-top: -2px"></Icon>
            <span style="margin-left: 4px;">帮助</span>
          </a> -->
        </div>
      </div>
    </div>
    <tb-edit-theme ref="editTheme"></tb-edit-theme>
  </div>
</template>
<script>
import menuapi from "./data/menuDate";
import layoutMixin from "@/components/mixin/layout_mixin";
import Mixin from "@/components/mixin/commonMixin";
import * as timezoom from "@/assets/timezooms";
import api from "@/api/api";
// import { deleteTicket } from "@/utils/asist";
// import { getToken } from "@/utils/cookie";
export default {
  mixins: [layoutMixin, Mixin],
  data () {
    return {
      // logoUrl: process.env.BASE_URL + 'static/images/logo.png',
      // eslint-disable-next-line no-undef
      logoUrl: require('@/assets/images/logo.png'),
      windowWidth: document.body.clientWidth,
      infoTalg: true,
      logoTalg: true,
      theme1: "dark",
      menuMap: "",
      merchantId: "",
      flagName: "zh-CN",
      timeZone: false,
      cacheSpanLeft: this.$store.state.spanLeft,
      timeModal: "",
      timezoomList: timezoom.timeList,
      nowTime: "",
      universalTime: this.getUniversalTime(new Date().getTime(), "fulltime"),
      thisTime: new Date().getTime(),
      UTCtime: "",
      thisUTCTime: new Date(
        this.getUniversalTime(new Date(), "fulltime")
      ).getTime(),
      UTCtimezoom: this.$common.getDefaultTimezoom(),
      languageList: [
        {
          lang: '简体中文',
          name: 'zh-CN'
        }/*,
        {
          lang: 'English',
          name: 'en-US'
        }*/
      ]
    };
  },
  updated () {
    if (sessionStorage.getItem("userName")) {
      this.merchantId = sessionStorage.getItem("userName").split(",")[0];
    }
    if (sessionStorage.getItem("userInfoName")) {
      this.usName = sessionStorage.getItem("userInfoName");
    }
  },
  computed: {
    spanLeft () {
      let fullScreen = this.$store.state.fullScreen;
      if (!fullScreen) {
        return this.$store.state.spanLeft !== 0
          ? this.$store.state.spanLeft
          : 1;
      } else {
        return this.cacheSpanLeft;
      }
    },
    spanRight () {
      let fullScreen = this.$store.state.fullScreen;
      if (!fullScreen) {
        return 17 - this.$store.state.spanLeft;
      } else {
        return 17 - this.cacheSpanLeft;
      }
    },
    fullScreen () {
      return this.$store.state.fullScreen;
    },
    oldErp () {
      return sessionStorage.getItem("fromOldErp") === "1";
    },
    erpHomePage () {
      return sessionStorage.getItem("erpUrl");
    },
    token () {
      return sessionStorage.getItem("token");
    },
    logoutTitle () {
      // let v = this;
      return sessionStorage.getItem("erpUrl") ? "返回首页" : "登出";
    },
    merchantIdName () {
      if (this.$store.state.erpConfig.userInfo) {
        return this.$store.state.erpConfig.userInfo.merchantId;
      } else {
        return this.merchantId || "";
      }
    },
    userName () {
      if (this.$store.state.erpConfig.userInfo) {
        return this.$store.state.erpConfig.userInfo.userName;
      } else {
        return this.usName || "";
      }
    }
  },
  watch: {
    fullScreen (n) {
      if (!n) {
        this.cacheSpanLeft = this.$store.state.spanLeft;
      }
    },
    windowWidth: {
      handler (val) {
        let v = this;
        if (!v.timers) {
          v.windowWidth = val;
          v.timers = true;
          setTimeout(function () {
            /* 小于1400时把右边的信息放入下拉框中, 隐藏LAPAlogo图片 */
            if (v.windowWidth <= 1200) {
              v.infoTalg = false;
              v.logoTalg = false;
            } else {
              v.infoTalg = true;
              v.logoTalg = true;
            }
            v.timers = false;
          }, 400);
        }
      },
      deep: true,
      immediate: true
    }
  },
  created () {
    let v = this;
    let lang = localStorage.getItem("lang");
    let inGroup = this.$store.state.inGroup;
    if (sessionStorage.getItem("userInfoName")) {
      this.usName = sessionStorage.getItem("userInfoName");
    }
    if (window.location.href.indexOf("fromOldErp") > -1) {
      sessionStorage.setItem("fromOldErp", "1");
    }
    if (window.location.href.indexOf("erpUrl") > -1) {
      sessionStorage.setItem("erpUrl", this.getQueryString("erpUrl"));
    }
    sessionStorage.setItem("logoutTitle", this.logoutTitle);
    if (lang != undefined) {
      v.flagName = lang;
    } else {
      v.flagName = "zh-CN";
    }
    let url = ""; // 获取所在系统菜单
    if (inGroup === "wishCustomer") {
      url = "wishCustomer";
    }
    switch (url) {
      case "wishCustomer":
        v.menuMap = menuapi.menu;
        break;
    }
    if (
      !sessionStorage.getItem("userInfoName") &&
      sessionStorage.getItem("userName")
    ) {
      v.$store.dispatch(
        "getUserName",
        sessionStorage.getItem("userName").split(",")[1]
      );
    }
    v.getLocalTime();
    v.getUTC();
    v.getDefaultTimezoom();
  },
  methods: {
    // 方法集
    changeDown (value) {
      let v = this;
      if (value === 'signOut') {
        // var token = getToken();
        // var erpHomePage = this.erpHomePage;
        // if (erpHomePage) {
        //   // 清理掉ticket和token，以免用户信息丢失
        //   sessionStorage.removeItem("token");
        //   window.location.href = erpHomePage;
        // } else {
        //   var url = window.location.href;
        //   var index = url.indexOf("?ticket");
        //   index = index > 0 ? index : url.indexOf("&ticket");
        //   if (index > 0) url = url.substring(0, index);
        //   this.$axios.get(api.logOut + token).then((res) => {
        //     sessionStorage.clear();
        //     window.location.href =
        //       res.others.logOutUrl +
        //       encodeURIComponent(deleteTicket(window.location.href));
        //   });
        //   sessionStorage.clear();
        //   localStorage.clear();
        // }
        this.$connectAuth.outLogin();
      } else if (value === 'theme') {
        v.$refs.editTheme.open();
      }
    },
    getQueryString (name) {
      // 获取url里面的参数
      var reg = new RegExp("(^|&?)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.href.substr(1).match(reg);
      if (r != null) {
        return unescape(r[2]);
      } else {
        return null;
      }
    },
    getMenuRole () {
      return this.$axios.get(api.get_menuRole);
    },
    getLocalTime () {
      let v = this;
      setInterval(function () {
        v.nowTime = v.getDataToLocalTime(
          new Date(v.getUniversalTime(new Date(), "fulltime")).getTime(),
          "fulltime"
        );
      }, 1000);
    },
    getUTC () {
      let v = this;
      setInterval(function () {
        v.UTCtime = v.getUniversalTime(new Date().getTime(), "fulltime");
      }, 1000);
    },
    changeTimezoom () {
      let v = this;
      let timeData;
      if (v.timeModal >= 0) {
        timeData = "+" + v.timeModal;
      } else {
        timeData = v.timeModal;
      }
      localStorage.setItem("timezoom", timeData);
      v.$store.commit("timezoomChange", timeData);
      v.UTCtimezoom = timeData;
      v.getNowTime();
    },
    getNowTime () {
      // 获取用户设置的时间
      let timezoom = this.$common.getDefaultTimezoom();
      if (timezoom !== undefined) {
        let diffTime = Number(timezoom) * 60 * 60 * 1000;
        return new Date().getTime() - diffTime;
      } else {
        return new Date().getTime();
      }
    },
    toggleClick () {
      let v = this;
      v.$store.commit('fullScreen', !v.$store.state.fullScreen);
      v.logoTalg = !v.logoTalg;
    },
    changeLanguage (lang) {
      let v = this;
      localStorage.setItem("lang", lang);
      v.flagName = lang;
      window.location.reload();
    },
    close () {
      this.timeZone = false;
    },
    backAuth () {
      this.$connectAuth.backOauth();
    }
  },
  mounted () {
    // 监听浏览器窗口的大小
    let v = this;
    window.onresize = () => {
      return (() => {
        window.screenWidth = document.body.clientWidth;
        v.windowWidth = window.screenWidth;
      })();
    };
  },
};
</script>
<style lang="less" scoped>
.headSty {
  min-width: 450px;
}

.backAuth-content {
  color: #fff;
  margin-right: 10px;

  .backAuth {
    display: inline-block;
    padding: 5px 10px;
    line-height: initial;
    border-radius: 14px;
    cursor: pointer;

    &:hover {
      background: rgba(216, 216, 216, .22);
    }
  }
}
</style>