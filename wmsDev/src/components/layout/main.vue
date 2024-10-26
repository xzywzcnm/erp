<template >
  <div class="layout">
    <div class="layout_main">
      <vHeader @setWarehouseOverseaType="setWarehouseOverseaType"></vHeader>
      <div class="layout_main_content">
        <div class="content">
          <div class="content_nav" v-show="!$store.state.fullScreen">
            <vLeft ref="leftComponent"></vLeft>
          </div>
          <div class="content_page">
            <div class="layout-breadcrumb" v-if="menu.length > 0">
              <!-- 面包屑 -->
              <breadcrumb :menu="menu"></breadcrumb>
            </div>
            <div class="content_page_view">
              <div class="page_view">
                <keep-alive>
                  <router-view></router-view>
                </keep-alive>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <systemNoticeModal />
    <BackTop></BackTop>
    <authAbnormalWarnModal ref="authAbnormalWarnRef" />
  </div>
</template>
<script>
import vHeader from './header';
import vLeft from './left';
import breadcrumb from './breadcrumb';
import layoutMixin from '@/components/mixin/layout_mixin';
import menuWarehouse from '@/api/menu/menuWarehouse';
import menuAmazonFba from '@/api/menu/menuAmazonFba';
import menuWinit from '@/api/menu/menuWinit';
import menuBarn from '@/api/menu/menuBarn';
import menu4px from '@/api/menu/menu4px';
import menuShl from '@/api/menu/menuShl';
import menuYuncang from '@/api/menu/menuYuncang';
import menuPyl from '@/api/menu/menuPyl';
import third from '@/api/menu/thirdOutboundOrder';
import menuCne from '@/api/menu/menuCne';
import menuDirectly from "@/api/menu/menuDirectly"; // 直发仓
import menuRinid from '@/api/menu/menuRinid';
import menuNovFire from '@/api/menu/menuNovFire';
import menuAmloutstore from '@/api/menu/menuAmloutstore';
import menuEf from '@/api/menu/menuEf';
import Mixin from '@/components/mixin/common_mixin';
import systemNoticeModal from '@/components/common/systemNoticeModal';
import warehouseOversea from '@/api/menu/warehouseOversea';
import { getWareHouseItem } from '@/utils/getService';
import authAbnormalWarnModal from '@/components/layout/authAbnormalWarnModal'; // 异常提醒弹窗
// import { getToken } from '@/utils/cookie';

const wareHouseItem = getWareHouseItem();
export default {
  mixins: [Mixin, layoutMixin],
  components: {
    vHeader,
    vLeft,
    breadcrumb,
    systemNoticeModal,
    authAbnormalWarnModal
  },
  data() {
    return {
      menu: [],
      warehouseOverseaType: wareHouseItem.warehouseOverseaType || '',
      warehouseType: wareHouseItem ? wareHouseItem.warehouseType : "", // 仓库类型
    };
  },
  methods: {
    setWarehouseOverseaType(warehouseOverseaType) {
      this.$refs['leftComponent'].warehouseOverseaType = warehouseOverseaType;
    },
    // 所在仓库是否第三方仓
    warehouseManage() {
      return new Promise((resolve, reject) => {
        let { warehouseList = [], warehouseId } = this.$store.state || {};
        if (!(warehouseId && warehouseList.length)) {
          this.$store.commit('set_thirdWarehouse', false);
          resolve(null);
          return;
        }
        let temp = null;
        warehouseList.forEach(k => {
          (!temp && k.warehouseId === warehouseId) && (temp = k);
        })
        // 第三方仓
        if (temp) {
          this.$store.commit('set_thirdWarehouse', ['1', '5'].includes(temp.warehouseType));
          if (temp.warehouseType === '1') {
            resolve(temp);
          } else {
            resolve(null);
          }
        } else {
          this.$store.commit('set_thirdWarehouse', false);
          resolve(null);
        }
      })
    },
    // 存入入仓管理模块
    warehouseArrivalPush() {
      let list = this.menu.filter((k, i) => {
        return k.name === '入仓管理';
      })
      if (list.length) return;
      this.menu.push(...warehouseOversea.warehouseArrival);
    }
  },
  mounted() {
    setTimeout(() => {
      if (this.$refs.authAbnormalWarnRef && this.$refs.authAbnormalWarnRef.getWarnDetails) {
        this.$refs.authAbnormalWarnRef && this.$refs.authAbnormalWarnRef.initData();
      }
    }, 200);
  },
  created() {
    let v = this;
    v.$root.isShowWarehouse();
    v.getUserMesCommon();
    setTimeout(() => {
      document.getElementsByTagName('body')[0].style.setProperty(`--baseColor`, 'green');
    }, 2000)
    let warehouseOverseaTypeList = [
      { warehouseOverseaType: 'AMAZON_FBA', menu: menuAmazonFba.menu }, // 亚马逊海外仓
      { warehouseOverseaType: 'winitoutstore', menu: menuWinit.menu }, // 万邑通海外仓
      { warehouseOverseaType: 'gcoutstore', menu: menuBarn.menu }, // 谷仓海外仓
      { warehouseOverseaType: 'fourpxoutstore', menu: menu4px.menu }, // 递四方海外仓
      { warehouseOverseaType: 'pylOware', menu: menuPyl.menu }, // PYL 海外仓
      { warehouseOverseaType: 'thirdCarrier', menu: third.menu }, // 自定义海外仓
      { warehouseOverseaType: 'cne', menu: menuCne.menu }, // cne海外仓
      { warehouseOverseaType: 'rinid', menu: menuRinid.menu }, // rinid 仓
      { warehouseOverseaType: 'nf', menu: menuNovFire.menu }, // 新火海外仓
      { warehouseOverseaType: 'amloutstore', menu: menuAmloutstore.menu }, // 艾姆勒海外仓

      { warehouseOverseaType: 'shloutstore', menu: menuShl.menu }, // SHL 海外仓
      { warehouseOverseaType: 'ocoutstore', menu: menuEf.menu } // EF海外仓
    ];
    // console.log(this.warehouseOverseaType);
    if (v.warehouseOverseaType && v.warehouseOverseaType !== 'null') {
      warehouseOverseaTypeList.map((item) => {
        if (item.warehouseOverseaType === v.warehouseOverseaType) {
          v.menu = item.menu
        }
      });
    } else if (v.isYms === 1) {
      // 云仓
      v.menu = menuYuncang.menu;
    } if (this.warehouseType == 5) {
      // 直发仓
      v.menu = menuDirectly.menu;
    } else {
      v.menu = menuWarehouse.menu;
    }
    v.warehouseManage().then(res => {
      res && this.warehouseArrivalPush();
    })
  }
};
</script>
