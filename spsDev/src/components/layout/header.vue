<template>
  <div class="top-container ivu-menu-horizontal headSty">
    <div class="header_box">
      <!--左边区域-->
      <div class="left_box">
        <!--logo图片-->
        <div class="logo_box" v-if="logoTalg">
          <img :src="logoUrl" height="26" alt="LAPA"> <em>SPS</em>
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
              <Dropdown-item v-for='(item, index) in languageList' :name="item.name" :key="index">
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
              <div class="timevalue">{{ '您当前的时间：' + nowTime }}</div>
              <div class="timevalue">{{ '世界标准时间：' + UTCtime }}</div>
            </div>
          </Poptip>
          <!--登出-->
          <Dropdown @on-click="changeDown" class="style_right">
            <div class="icon_box">
              <span class="icon iconfont icon-yonghu"></span> <span class="text_name">{{ userName }}</span>
            </div>
            <Dropdown-menu slot="list">
              <!--用户信息-->
              <Dropdown-item name="info" v-if="!infoTalg">
                <Poptip placement="left" class="poptip_style" trigger="hover">
                  <div class="text">用户信息</div>
                  <div slot="content">
                    <span class="user_info style_right" style="color: #666;">{{ '客户编号：' + userInfo.merchantId }}</span>
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
              <!--登出-->
              <Dropdown-item name="theme">
                <div class="logout_item">
                  <Icon type="ios-shirt"></Icon>
                  <span class="user_item_text">修改主题</span>
                </div>
              </Dropdown-item>
              <Dropdown-item name="signOut">
                <div class="logout_item">
                  <Icon type="md-log-out" class="icon_logout"></Icon>
                  <span class="text_logout">登出</span>
                </div>
              </Dropdown-item>
            </Dropdown-menu>
          </Dropdown>
          <!--客户编号-->
          <span class="user_info style_right" v-if="infoTalg">{{ '客户编号：' + userInfo.merchantId }}</span>
        </div>
      </div>
    </div>
    <tb-edit-theme ref="editTheme"></tb-edit-theme>
  </div>
</template>
<script>
import layoutMixin from '@/components/mixin/layout_mixin';
import commonMixin from '@/components/mixin/common_mixin';
import * as timezoom from '@/assets/timezooms';
// import api from '@/api/api';
// import { deleteTicket } from '@/utils/index';

export default {
  mixins: [layoutMixin, commonMixin],
  data () {
    return {
      // logoUrl: process.env.BASE_URL + 'static/images/logo.png',
      // eslint-disable-next-line no-undef
      logoUrl: require('@/assets/images/logo.png'),
      windowWidth: document.body.clientWidth,
      infoTalg: true,
      logoTalg: true,
      theme1: 'dark',
      menuMap: '',
      fullName: '',
      flagName: 'zh-CN',
      timeZone: false,
      cacheSpanLeft: '',
      timeModal: '',
      timezoomList: timezoom.timeList,
      nowTime: '',
      UTCtime: '',
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
  computed: {
    UTCtimezoom () {
      return this.getDefaultTimezoom()
    },
    spanLeft () {
      let fullScreen = this.$store.state.fullScreen;
      if (!fullScreen) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.cacheSpanLeft = this.$store.state.spanLeft;
        return this.$store.state.spanLeft != 0
          ? this.$store.state.spanLeft
          : 1;
      } else {
        return this.cacheSpanLeft;
      }
    },
    spanRight () {
      let fullScreen = this.$store.state.fullScreen;
      if (!fullScreen) {
        return 16 - this.$store.state.spanLeft;
      } else {
        return 16 - this.cacheSpanLeft;
      }
    },
    token () {
      return sessionStorage.getItem('token');
    },
    userName () {
      return this.$store.state.userName || sessionStorage.getItem('userName') || '';
    },
    userInfo () {
      return this.$store.state.userInfo;
    }
  },
  created () {
    let v = this;
    let lang = localStorage.getItem('lang');
    if (lang != undefined) {
      v.flagName = lang;
    } else {
      v.flagName = 'zh-TW';
    }
    v.getLocalTime();
    v.getUTC();
    v.getDefaultTimezoom();
  },
  methods: { // 方法集
    toggleClick () {
      let v = this;
      v.$store.commit('fullScreen', !v.$store.state.fullScreen);
      v.logoTalg = !v.logoTalg;
    },
    changeLanguage (lang) {
      let v = this;
      localStorage.setItem('lang', lang);
      v.flagName = lang;
      window.location.reload();
    },
    close () {
      this.timeZone = false;
    },
    getLocalTime () {
      let v = this;
      setInterval(function () {
        v.nowTime = v.getDataToLocalTime(new Date(v.getUniversalTime(new Date(), 'fulltime')).getTime(), 'fulltime');
      }, 1000);
    },
    getUTC () {
      let v = this;
      setInterval(function () {
        v.UTCtime = v.getUniversalTime(new Date().getTime(), 'fulltime');
      }, 1000);
    },
    changeTimezoom () {
      let v = this;
      let timeData;
      if (v.timeModal >= 0) {
        timeData = '+' + v.timeModal;
      } else {
        timeData = v.timeModal;
      }
      localStorage.setItem('timezoom', timeData);
      v.$store.commit('timezoomChange', timeData);
      v.UTCtimezoom = timeData;
      v.getNowTime();
      window.location.reload();
    },
    changeDown (value) {
      let v = this;
      if (value === 'signOut') {
        // let token = this.token;
        // let url = window.location.href;
        // var index = url.indexOf('?ticket');
        // index = index > 0
        //   ? index
        //   : url.indexOf('&ticket');
        // if (index > 0) url = url.substring(0, index);
        // v.axios.get(api.logOut + token).then(response => {
        //   sessionStorage.clear();
        //   localStorage.clear();
        //   window.location.href = response.data.others.logOutUrl + encodeURIComponent(deleteTicket(window.location.href));
        // }).catch(response => {
        //   window.location.href = response.data.others.logOutUrl + encodeURIComponent(deleteTicket(window.location.href));
        // });
        this.$connectAuth.outLogin();
      } else if (value === 'theme') {
        v.$refs.editTheme.open();
      }
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
  }
};
</script>
<style lang="less" scoped>
.headSty {
  min-width: 730px;
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
<style scoped>
.header_box {
  min-height: 50px;
  height: auto;
  line-height: 50px;
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.left_box {
  display: flex;
  align-items: center;
}

.left_box .logo_box {
  width: 198px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.left_box .logo_box em {
  font-style: normal;
  font-weight: 400;
  margin-left: 12px;
  position: relative;
  bottom: -1px;
  font-size: 14px;
  color: #fff;
}

.left_box .toggleMenu {
  margin-left: 16px;
  vertical-align: middle;
  color: #fff;
  cursor: pointer;
}

.right_box {
  display: flex;
  align-items: center;
  padding-right: 15px;
}

.user_info_box {
  display: flex;
  align-items: center;
}

.user_info_box .timevalue {
  width: 100%;
  text-align: center;
  margin: 10px 0;
}

.user_info_box .icon_box {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  top: -2px;
}

.user_info_box .icon-yonghu {
  font-size: 23px;
  color: #fff;
}

.user_info_box .text_name {
  font-size: 13px;
  margin-left: 5px;
  color: #fff;
  position: relative;
  top: 3px;
}

.user_info_box .logout_item {
  display: flex;
  align-items: center;
}

.logout_item .icon_logout {
  font-size: 17px;
}

.logout_item .text_logout {
  font-size: 13px;
  margin-left: 5px;
}

.user_info_box /deep/ .ivu-poptip {
  margin-right: 15px;
}

.user_info_box .user_info {
  display: inline-block;
  color: #fff;
  font-size: 13px;
  white-space: nowrap;
}

.user_info_box .style_right {
  margin-right: 15px;
}

.style_right /deep/ .ivu-dropdown-item {
  display: flex;
  align-items: center;
}

.style_right .lang {
  margin: 0 10px 0 0 !important;
  top: 0 !important;
}

.user_info_box .poptip_style {
  margin: 0;
  width: 100%;
  font-size: 13px;
}

.user_info_box .time_zone /deep/ .ivu-select-dropdown {
  max-height: 300px !important;
  overflow-y: auto;
}

.top-container /deep/ .warehouse_dropdown {
  max-height: 600px !important;
  overflow-y: auto !important;
}

.top-container /deep/ .ivu-select-dropdown {
  min-width: 140px !important;
}

.top-container /deep/ .languages_dropdown {
  top: 25px !important;
  left: -140px !important;
}
</style>
