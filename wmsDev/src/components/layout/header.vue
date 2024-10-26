<template>
  <div class="top-container ivu-menu-horizontal headSty">
    <div class="header_box">
      <!--左边区域-->
      <div class="left_box">
        <!--logo图片-->
        <div class="logo_box" v-if="logoTalg">
          <img :src="logoUrl" height="26" alt="LAPA"> <em>WMS</em>
        </div>
        <!--展开与收起侧边栏按钮-->
        <Icon type="md-menu" size="26" @click="toggleClick" class="toggleMenu"></Icon>
        <!--头部菜单栏-->
        <div class="header_nav">
          <span v-for="(v, i) in warehouseList" v-if="i < 4" class="warehouseStyle warehouse_navStyle" :key="i"
            :title="v.warehouseName" :style="v.check ? wareTitleRedBgc : ''" @click="wareClick(v)">{{ v.warehouseName
            }}</span>
          <!--  trigger="click" -->
          <Dropdown v-if="dropWarehouseList.length" @on-click="v => wareClick(v, 'more')"
            @on-visible-change="openCloseMore" transfer-class-name="warehouse_dropdown">
            <span class="warehouseStyle" style="width: 50px;">更多</span>
            <Icon type="ios-arrow-down" style="color:#fff;margin-left: -13px" v-if="!openFlag"></Icon>
            <Icon type="ios-arrow-up" style="color:#fff;margin-left: -13px" v-if="openFlag"></Icon>
            <DropdownMenu slot="list">
              <div class="warehouse-dropdown-input">
                <Input id="filteWarehouse" v-model="filteWarehouse" placeholder="请输入" />
              </div>
              <DropdownItem v-for="(item, index) in filteWarehouseList" :key="index"
                :style="wareId === item.warehouseId ? moreDropBoxStyle : ''" :name="item.warehouseId">
                {{ item.warehouseName }}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
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
                <span style="width: 60px;">时区：</span> <Select v-model="timeModal" style="width:250px;"
                  @on-change="changeTimezoom">
                  <Option v-for="(item, index) in timezoomList" :value="item.utcId" :key="index">{{ item.text }}
                  </Option>
                </Select>
              </div>
              <div class="timevalue">您当前的时间：{{ nowTime }}</div>
              <div class="timevalue">世界标准时间：{{ UTCtime }}</div>
            </div>
          </Poptip>
          <!--登出-->
          <Dropdown @on-click="changeDown" class="style_right">
            <div class="icon_box">
              <span class="icon iconfont icon-yonghu"></span> <span class="text_name">{{ userInfo.userName }}</span>
            </div>
            <Dropdown-menu slot="list">
              <!--用户信息-->
              <Dropdown-item name="info" v-if="!infoTalg">
                <Poptip placement="left" class="poptip_style" trigger="hover">
                  <div class="user_item_text">用户信息</div>
                  <div slot="content">
                    <span class="user_info style_right" style="color: #666;">{{ '客户编号：' + userInfo.merchantId }}</span>
                  </div>
                </Poptip>
              </Dropdown-item>
              <!--语种-->
              <Dropdown-item name="languages" v-if="!infoTalg">
                <Dropdown @on-click="changeLanguage" placement="left" transfer-class-name="languages_dropdown">
                  <div class="user_item_text">语种</div>
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
                  <span class="user_item_text">登出</span>
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
import Mixin from '@/components/mixin/common_mixin';
import layoutMixin from '@/components/mixin/layout_mixin';
import menuWarehouse from '@/api/menu/menuWarehouse';
import * as timezoom from '@/utils/timezooms';
import { getWarehouseId } from '@/utils/getService';
import api from '@/api/api';
import { getQueryString } from '@/utils/index';

const warehouseOverseaTypeList = [
  { warehouseOverseaType: 'AMAZON_FBA', href: '#/amazonOnlineProduct' },
  { warehouseOverseaType: 'winitoutstore', href: '#/winitProduct' },
  { warehouseOverseaType: 'gcoutstore', href: '#/gcWarehousingOrder' },
  { warehouseOverseaType: 'fourpxoutstore', href: '#/fourPxProduct' },
  { warehouseOverseaType: 'pylOware', href: '#/pylOutboundOrder' },
  { warehouseOverseaType: 'thirdCarrier', href: '#/thirdOutboundOrder' },
  { warehouseOverseaType: 'cne', href: '#/cneProduct' },
  { warehouseOverseaType: 'rinid', href: '#/rinidProduct' },
  { warehouseOverseaType: 'nf', href: '#/nfProduct' },
  { warehouseOverseaType: 'amloutstore', href: '#/amlProduct' },
  { warehouseOverseaType: 'shloutstore', href: '#/shlProduct' },
  { warehouseOverseaType: 'ocoutstore', href: '#/efProduct' }
];

export default {
  mixins: [layoutMixin, Mixin],
  components: {},
  data() {
    return {
      windowWidth: document.body.clientWidth,
      infoTalg: true,
      logoTalg: true,
      // logoUrl: process.env.BASE_URL + 'static/images/logo.png',
      logoUrl: require('@/assets/images/logo.png'),
      theme1: 'dark',
      menuMap: '',
      flagName: 'zh-CN',
      timeZone: false,
      cacheSpanLeft: this.$store.state.spanLeft,
      timeModal: '',
      timezoomList: timezoom.timeList,
      nowTime: '',
      universalTime: this.$uDate.getUniversalTime(new Date().getTime(), 'fulltime'),
      thisTime: new Date().getTime(),
      UTCtime: '',
      thisUTCTime: new Date(this.$uDate.getUniversalTime(new Date(), 'fulltime')).getTime(),
      wareTitleRedBgc: { background: '#f00' },
      moreDropBoxStyle: {
        background: '#f00',
        color: '#fff'
      },
      showMoreBtnColor: false,
      openFlag: false,
      languageList: [
        {
          lang: '简体中文',
          name: 'zh-CN'
        }/*,
        {
          lang: 'English',
          name: 'en-US'
        } */
      ],
      filteWarehouse: null,
    };
  },
  updated() {
    this.usName = sessionStorage.getItem('userName');
  },
  computed: {
    vuexWareHouseList() {
      return this.$store.state.warehouseList;
    },
    warehouseList() {
      return this.vuexWareHouseList.map(i => {
        if (i.warehouseId === this.getWarehouseId()) {
          i.check = true;
        } else {
          i.check = false;
        }
        return i;
      }).sort(function (a, b) {
        if (a.check > b.check) {
          return -1;
        } else {
          return 1;
        }
      });
    },
    UTCtimezoom() {
      return this.$uDate.getDefaultTimezoom();
    },
    spanLeft() {
      let fullScreen = this.$store.state.fullScreen;
      if (!fullScreen) {
        return this.$store.state.spanLeft !== 0
          ? this.$store.state.spanLeft
          : 1;
      } else {
        return this.cacheSpanLeft;
      }
    },
    spanRight() {
      let fullScreen = this.$store.state.fullScreen;
      if (!fullScreen) {
        return 17 - this.$store.state.spanLeft;
      } else {
        return 17 - this.cacheSpanLeft;
      }
    },
    fullScreen() {
      return this.$store.state.fullScreen;
    },
    oldErp() {
      return sessionStorage.getItem('fromOldErp') === '1';
    },
    erpHomePage() {
      return sessionStorage.getItem('erpUrl');
    },
    logoutTitle() {
      return sessionStorage.getItem('erpUrl')
        ? '返回首页'
        : '登出';
    },
    userInfo() {
      if (this.$store.state.erpConfig) {
        return this.$store.state.erpConfig.userInfo;
      } else {
        return '';
      }
    },
    wareId() {
      return (this.$store.state.warehouseId || getWarehouseId());
    },
    dropWarehouseList() {
      return this.warehouseList.slice(4);
    },
    filteWarehouseList() {
      const filteWarehouse = this.filteWarehouse;
      let list = this.dropWarehouseList;
      let filteList = this.$common.copy(list);
      if (filteWarehouse) {
        filteList = list.filter(k => {
          let name = k.warehouseName;
          return name && (name.indexOf(filteWarehouse) >= 0);
        })
      }
      return filteList;
    },
  },
  watch: {
    fullScreen(n, o) {
      if (!n) {
        this.cacheSpanLeft = this.$store.state.spanLeft;
      }
    },
    windowWidth: {
      handler(val) {
        let v = this;
        if (!v.timers) {
          v.windowWidth = val;
          v.timers = true;
          setTimeout(function () {
            /* 小于1400时把右边的信息放入下拉框中, 隐藏LAPA logo图片 */
            if (v.windowWidth <= 1520) {
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
  created() {
    let v = this;
    let lang = localStorage.getItem('lang');
    if (window.location.href.indexOf('fromOldErp') > -1) {
      sessionStorage.setItem('fromOldErp', '1');
    }
    if (window.location.href.indexOf('erpUrl') > -1) {
      sessionStorage.setItem('erpUrl', getQueryString('erpUrl'));
    }
    sessionStorage.setItem('logoutTitle', v.logoutTitle);
    if (lang !== undefined) {
      v.flagName = lang;
    } else {
      v.flagName = 'zh-CN';
    }
    v.menuMap = menuWarehouse.menu;
    v.getLocalTime();
    v.getUTC();
    v.$uDate.getDefaultTimezoom();
  },
  mounted() {
    this.$nextTick(() => {
      this.getWareList();
    });
    // 监听浏览器窗口的大小
    let v = this;
    window.onresize = () => {
      return (() => {
        window.screenWidth = document.body.clientWidth;
        v.windowWidth = window.screenWidth;
      })();
    };
  },
  methods: {
    changeDown(value) {
      let v = this;
      if (value === 'signOut') {
        // v.axios.get(api.logout + getToken()).then(response => {
        //   if (response.data.code === 0) {
        //     removeToken();
        //     let url = deleteTicket(window.location.href);
        //     window.location.href = response.data.others.logOutUrl + encodeURIComponent(url);
        //   }
        // });
        this.$connectAuth.outLogin();
      } else if (value === 'theme') {
        v.$refs.editTheme.open();
      }
    },
    getLocalTime() {
      let v = this;
      v.timer = setInterval(function () {
        v.nowTime = v.$uDate.getDataToLocalTime(new Date(v.$uDate.getUniversalTime(new Date(), 'fulltime')).getTime(), 'fulltime');
      }, 1000);
    },
    getUTC() {
      let v = this;
      v.timer = setInterval(function () {
        v.UTCtime = v.$uDate.getUniversalTime(new Date().getTime(), 'fulltime');
      }, 1000);
    },
    changeTimezoom() {
      let v = this;
      let timeData;
      if (v.timeModal >= 0) {
        timeData = '+' + v.timeModal;
      } else {
        timeData = v.timeModal;
      }
      localStorage.setItem('timezoom', timeData);
      v.$store.commit('timezoomChange', timeData);
      v.$uDate.getNowTime();
      v.setTime().then(() => {
        window.location.reload();
      });
    },
    setTime() {
      let v = this;
      return new Promise(resolve => {
        v.axios.put(api.set_updateTimeZone, {
          timeZoneId: v.timeModal
        }).then(res => {
          if (res.data.code === 0) {
            resolve();
          }
        });
      });
    },
    toggleClick() {
      let v = this;
      v.$store.commit('fullScreen', !v.$store.state.fullScreen);
      v.logoTalg = !v.logoTalg;
    },
    changeLanguage(lang) {
      let v = this;
      localStorage.setItem('lang', lang);
      v.flagName = lang;
      window.location.reload();
    },
    close() {
      this.timeZone = false;
    },
    wareClick(wareItem, flag) {
      if (typeof wareItem === 'string') {
        wareItem = this.vuexWareHouseList.find(val => {
          return val.warehouseId === wareItem;
        });
      }
      const urlParams = this.$common.getUrlParams();
      if (!this.$common.isEmpty(urlParams) && urlParams.warehouseId == wareItem.warehouseId) return;
      const targetWarehouse = warehouseOverseaTypeList.find((item) => {
        return item.warehouseOverseaType === wareItem.warehouseOverseaType;
      });
      // if (wareItem.warehouseOverseaType) {
      //   if (this.$common.isEmpty(targetWarehouse)) {
      //     this.$Modal.confirm({
      //       title: '仓库切换确认',
      //       content: `<div
      //         style="font-size: 20px; color: #f60;"
      //       >
      //         此仓库为未对接的第三方仓库，是否确认切换到 “${wareItem.warehouseName}”？
      //       </div>`,
      //       onOk: () => {
      //         this.switchWarehouseconfirm(wareItem, flag, targetWarehouse);
      //       }
      //     })
      //     return;
      //   }
      // }
      this.$Modal.confirm({
        title: '仓库切换确认',
        content: `<p style='font-weight: 800'>正切换到 “${wareItem.warehouseName}”，是否确认？</p>`,
        onOk: () => {
          this.switchWarehouseconfirm(wareItem, flag, targetWarehouse);
        }
      })
    },
    // 切换仓库确认
    switchWarehouseconfirm (wareItem, flag, targetWarehouse) {
      let arr = [...this.vuexWareHouseList];
      arr.forEach(val => {
        if (val.warehouseId === wareItem.warehouseId) {
          val.check = true;
        } else {
          val.check = false;
        }
      });
      this.$emit('setWarehouseOverseaType', wareItem.warehouseOverseaType);
      // v.$parent.$refs['leftComponent'].warehouseOverseaType = wareItem.warehouseOverseaType;
      sessionStorage.setItem('refreshLeft', true);
      if (flag === 'more') {
        let idsIndex = arr.map(val => val.warehouseId).indexOf(wareItem.warehouseId);
        arr.splice(idsIndex, 1);
        arr.unshift(wareItem);
      }
      this.$store.commit('warehouseList', arr);
      this.$store.commit('warehouseId', wareItem.warehouseId);
      localStorage.setItem('warehouseId', wareItem.warehouseId);
      // 仓库切换时跳转的地址
      if (this.$common.isEmpty(targetWarehouse)) {
        // 云仓
        if (wareItem.isYms === 1) {
          window.location.href = `#/cloudProduct?warehouseId=${wareItem.warehouseId}`;
        } else if (!this.$common.isEmpty(wareItem.warehouseOverseaType)) {
          // 未对接的仓库--跳转到入仓库管理
          window.location.href = `#/warehouseConfirm?warehouseId=${wareItem.warehouseId}`;
        } else if ([5, '5'].includes(wareItem.warehouseType)) {
          // 直发仓
          window.location.href = `#/trusteeshipOutOrder?warehouseId=${wareItem.warehouseId}`;
        } else {
          // 自营仓库(本地仓)
          window.location.href = `#/index?warehouseId=${wareItem.warehouseId}`;
        }
      } else {
        // 第三方仓库
        window.location.href = `${targetWarehouse.href}?warehouseId=${wareItem.warehouseId}`;
      }
      // window.location.href = '#/index';
      this.$store.commit('active', '8000-8001');
      // 处理切换仓库刷新角标的问题
      this.$store.commit('badgeStatus', true);
      window.location.reload();
    },
    getWareList() {
      let data = this.vuexWareHouseList;
      let warehouseId = this.getWarehouseId();
      if (data) {
        let valid = false;
        data.forEach(i => {
          if (i.warehouseId === warehouseId) {
            valid = true;
          }
        });
        if (!valid) {
          localStorage.removeItem('warehouseId');
          sessionStorage.removeItem('warehouseId');
          this.$store.commit('warehouseId', null);
          warehouseId = '';
        }
      }
      if (warehouseId) {
        data.forEach((val, idx) => {
          if (val.warehouseId === warehouseId) {
            this.$set(val, 'check', true);
            let idsIndex = data.map(val => val.warehouseId).indexOf(warehouseId);
            data.splice(idsIndex, 1);
            data.unshift(val);
          } else {
            this.$set(val, 'check', false);
          }
        });
      } else {
        data.forEach((val, idx) => {
          this.$set(val, 'check', false);
        });
      }
    },
    openCloseMore(val) {
      this.openFlag = val;
      if (val) {
        this.$nextTick(() => {
          let dom = document.querySelector('#filteWarehouse');
          dom && dom.querySelector('input').focus();
        })
      }
    },
    backAuth() {
      this.$connectAuth.backOauth();
    }
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

.header_box {
  min-height: 50px;
  height: auto;
  line-height: 50px;
  width: 100%;
  display: flex;
  justify-content: space-between;

  .left_box {
    display: flex;
    align-items: center;

    .header_nav {
      display: flex;
      align-items: center;
    }

    .logo_box {
      width: 198px;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;

      em {
        font-style: normal;
        font-weight: 400;
        margin-left: 12px;
        position: relative;
        bottom: -1px;
        font-size: 14px;
        color: #fff;
      }
    }

    .toggleMenu {
      margin: 0 16px;
      vertical-align: middle;
      color: #fff;
      cursor: pointer;
    }

    .header_nav {
      :deep(.ivu-menu-item) {
        a {
          color: #666666;

          &:hover {
            text-decoration: underline !important;
            color: #2d8cf0 !important;
          }
        }
      }

      .ivu-menu-horizontal {
        min-width: 200px;
      }
    }
  }

  .right_box {
    display: flex;
    align-items: center;
    padding-right: 15px;

    .user_info_box {
      display: flex;
      align-items: center;

      .timevalue {
        width: 100%;
        text-align: center;
        margin: 10px 0;
      }

      .icon_box {
        display: flex;
        align-items: center;
        cursor: pointer;
        position: relative;
        top: -2px;

        .icon-yonghu {
          font-size: 23px;
          color: #fff;
        }

        .text_name {
          font-size: 13px;
          margin-left: 5px;
          color: #fff;
          position: relative;
          top: 3px;
        }
      }

      .logout_item {
        display: flex;
        align-items: center;

        .user_item_text {
          font-size: 13px;
          margin-left: 5px;
        }
      }

      :deep(.ivu-poptip) {
        margin-right: 15px;
      }

      .user_info {
        display: inline-block;
        color: #fff;
        font-size: 13px;
        white-space: nowrap;
      }

      .style_right {
        margin-right: 15px;

        :deep(.ivu-dropdown-item) {
          display: flex;
          align-items: center;
        }

        .lang {
          margin: 0 10px 0 0 !important;
          top: 0 !important;
        }
      }

      .poptip_style {
        margin: 0;
        width: 100%;
        font-size: 13px;
      }

      .time_zone {
        :deep(.ivu-select-dropdown) {
          max-height: 300px !important;
          overflow-y: auto;
        }
      }
    }
  }
}

.top-container :deep(.warehouse_dropdown) {
  position: relative;
  margin: 0;
  padding-top: 0;
  max-height: 600px !important;
  overflow-y: auto !important;
  .warehouse-dropdown-input{
    position: sticky;
    top: 0;
    padding:0 12px;
    background: #fff;
  }
}

.top-container :deep(.ivu-select-dropdown) {
  min-width: 140px !important;
}

.top-container :deep(.languages_dropdown) {
  top: 25px !important;
  left: -140px !important;
}
</style>
