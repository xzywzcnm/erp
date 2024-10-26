<template>
  <div class="auth-abnormal-warn-modal">
    <Modal v-model="warnModalVisible" width="650px" title="授权异常提醒">
      <div class="auth-abnormal-modal-body">
        <Spin fix v-if="modalLoading"></Spin>
        <Table
          highlight-row
          border
          :height="550"
          :loading="tableLoading"
          :columns="tableColumn"
          :data="warnDataList"
        />
      </div>
      <div slot="footer">
        <Button @click="warnModalVisible = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api';

export default {
  name: 'authAbnormalWarnModal',
  props: {},
  data () {
    return {
      modalLoading: false,
      tableLoading: false,
      warnModalVisible: false,
      allplatformJson: {},
      warnDataList: [],
      tableColumn: [
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          width: 100,
          render: (h, { row }) => {
            return h('div', {
              style: {
                color: '#00aaff',
                'font-size': '14px',
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  this.goToAuth(row);
                }
              }
            }, '前去授权');
          },
        },
        {
          title: '平台',
          key: 'platformId',
          align: 'center',
          width: 120,
          render: (h, { row }) => {
            return h('div', {
              attrs: {
                title: row.platformId
              },
              class: `platform-item ${row.platformId}`
            }, '');
          },
        },
        {
          title: '店铺',
          key: 'accountCode',
          align: 'center',
          minWidth: 120,
          render: (h, { row }) => {
            return h('div', {}, [
              h('div', {
                style: {
                  color: '#57a3f3',
                  'font-size': '14px'
                }
              }, row.account),
              h('div', {
                style: {
                  'font-size': '12px'
                }
              }, row.accountCode),
            ]);
          },
        },
        {
          title: '所属事业部',
          key: 'accountCode',
          align: 'center',
          minWidth: 120,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.businessDeptId)) return h('div', {}, '');
            if (this.$common.isEmpty(this.allBusinessJson[row.businessDeptId])) return h('div', {}, row.businessDeptId);
            return h('div', {}, this.allBusinessJson[row.businessDeptId].name || '');
          },
        },
        {
          title: '授权状态',
          key: 'accountCode',
          align: 'center',
          width: 120,
          render: (h, { row }) => {
            return h('div', {}, '授权过期');
          },
        },
      ]
    };
  },
  computed: {
    // 获取所有事业部
    allBusinessDept () {
      if (this.$common.isEmpty(this.$store.getters.getBusinessDeptList)) return [];
      return this.$store.getters.getBusinessDeptList;
    },
    // 所有事业部对象
    allBusinessJson () {
      let obj = {};
      this.allBusinessDept.forEach(item => {
        obj[item.id] = item;
      });
      return obj;
    }
  },
  watch: {
    warnModalVisible: {
      deep: true,
      immediate: true,
      handler (val) {
        if (val) return;
        this.closeWarnModal();
      }
    }
  },
  created () {},
  mounted () {},
  methods: {
    // 打开弹窗
    openWarnModal () {
      this.warnModalVisible = true;
      this.modalLoading = true;
      this.$common.promiseAll([
        this.getAllplatformInfo
      ]).finally(() => {
        this.modalLoading = false;
      });
    },
    // 初始化数据
    initData () {
      const isModal = localStorage.getItem('not-auth-abnormal-warn');
      // 防止跳转页面失败没有删除，再次做下删除
      if (!this.$common.isEmpty(isModal)) {
        setTimeout(() => {
          localStorage.removeItem('not-auth-abnormal-warn');
          localStorage.removeItem('goto-channel');
        }, 5000);
        return;
      }
      this.getWarnDetails().then(() => {
        if (!this.$common.isEmpty(this.warnDataList)) {
          this.openWarnModal();
        }
      });
    },
    // 获取异常提醒详情
    getWarnDetails () {
      this.tableLoading = true;
      return new Promise((resolve) => {
        this.axios.post(api.queryAuthWarn, {}, { hiddenError: true }).then(res => {
          if (!res || res.code != 0) return resolve({ state: 'finally' });
          this.warnDataList = res.datas || [];
          resolve({ state: 'finally' });
        }).catch((err) => {
          console.error(err);
          resolve({ state: 'finally' });
        }).finally(() => {
          this.tableLoading = false;
        })
      });
    },
    // 获取所有平台信息 type = 1 是通用渠道, type = 2 是自定义渠道
    getAllplatformInfo () {
      return new Promise((resolve) => {
        this.allplatformJson = {};
        this.axios.get(`${api.get_queryByStatus}?status=1`, { hiddenError: true }).then(res => {
          if (!res || res.code != 0) return resolve({ state: 'finally' });
          (res.datas || []).forEach(item => {
            this.$set(this.allplatformJson, item.platformId, item);
          });
          resolve({ state: 'finally' });
        }).catch(() => {
          resolve({ state: 'finally' });
        })
      });
    },
    // 关闭弹窗
    closeWarnModal () {
      this.warnDataList = [];
      this.modalLoading = false;
      this.warnModalVisible = false;
    },
    // 去授权
    goToAuth (row) {
      let loca = window.location;
      const platformInfo = this.$common.isEmpty(this.allplatformJson) ? {} : this.allplatformJson[row.platformId];
      localStorage.setItem('not-auth-abnormal-warn', row.account);
      // type = 1 是通用渠道, type = 2 是自定义渠道
      if (this.$common.isEmpty(platformInfo) || platformInfo.type == 2) {
        if (platformInfo.type == 2) {
          localStorage.setItem('goto-channel', row.platformId);
        }
        this.$bus.emit('common-shop-view', platformInfo);
        loca.href = `${loca.protocol}//${loca.host}/setting-service/generalSettings.html#/shop/ebay`;
        this.closeWarnModal();
        return;
      }
      if (platformInfo.type == 1) {
        this.$bus.emit('common-shop-view', platformInfo);
        loca.href = `${loca.protocol}//${loca.host}/setting-service/generalSettings.html#/shop/${row.platformId}`;
      }
      this.closeWarnModal();
    }
  }
};
</script>
<style lang="less" scoped>
@parter-icon: url('../../assets/images/partner.png') no-repeat;
@nationalFlag-icon: url('../../assets/images/flag.png') no-repeat;
@bigNationalFlag-icon: url('../../assets/images/flag54.png') no-repeat;
@flags-icon: url('../../assets/images/flags.png') no-repeat;
@map-icon: url('../../assets/images/map.png') no-repeat center center;
@global-icon: url('../../assets/images/global.png') no-repeat;
@emoji-icon: url('../../assets/images/tbIcon.png') no-repeat;
@vova-icon: url('../../assets/images/vova.png') no-repeat;
@real-icon: url('../../assets/images/real.png') no-repeat;
@allegro-icon: url('../../assets/images/allegro.png') no-repeat;
@temux-icon: url('../../assets/images/temux-logo.png') no-repeat;
@sheinx-icon: url('../../assets/images/sheinx.png') no-repeat;
@ept-icon: url('../../assets/images/ept.png') no-repeat;
@jdyn-icon: url('../../assets/images/jdyn.png') no-repeat;
@tiktok-icon: url('../../assets/images/tiktok.png') no-repeat;
@ozon-icon: url('../../assets/images/ozon.png') no-repeat;
@miravia-icon: url('../../assets/images/miravia.png') no-repeat;
@iconWidth: 107px;

.auth-abnormal-warn-modal{
  position: relative;
  width: 0;
  height: 0;
}
.auth-abnormal-modal-body{
  position: relative;
  :deep(.ivu-table) {
    .platform-item {
      display: inline-block;
      width: @iconWidth;
      height: 42px;
      line-height: 42px;
      background: @parter-icon;
      background-repeat: no-repeat;
      background-position: 0 200px;
      overflow: hidden;
      &.amazon {
        background-position: 0px -70px;
      }
      &.aliexpress {
        background-position: 0 -115px;
      }
      &.wish {
        background-position: 0 -160px;
      }
      &.alibabagj {
        background-position: 0 -980px;
      }
      &.shopify {
        background-position: 0 -239px;
      }
      &.lazada {
        background-position: 0 -196px;
      }
      &.ebay {
        background-position: 0 -32px;
      }
      &.joom {
        background-position: 0 -330px;
      }
      &.tophatter {
        background-position: 0 -302px;
      }
      &.cdiscount {
        background-position: 0 -854px;
      }
      &.newegg {
        background-position: 0 -906px;
      }
      &.priceminister {
        background-position: 0 -365px;
      }
      &.walmart {
        background-position: 0 -415px;
      }
      &.dhgate {
        background-position: 0 -455px;
      }
      &.alibaba {
        background-position: 0 -500px;
      }
      &.yandex {
        background-position: 0 -750px;
      }
      &.mycom {
        background-position: 0 -660px;
      }
      &.shopee {
        background-position: 0 -550px;
      }
      &.mercadolibre {
        background-position: 0 -600px;
      }
      &.factorymarket {
        background-position: 0 -705px;
      }
      &.otto {
        background-position: 0 -2065px;
      }
      &.allegro {
        width: @iconWidth;
        height: 42px;
        cursor: pointer;
        position: relative;
        background: @allegro-icon;
        background-size: contain;
        background-position: center;
      }
      &.vova {
        width: @iconWidth;
        height: 42px;
        line-height: 42px;
        margin: 0;
        cursor: pointer;
        position: relative;
        background: @vova-icon;
        background-size: 75%;
        background-position: center -10px;
      }
      &.Temu,
      &.temu,
      &.temux {
        height: 38px;
        cursor: pointer;
        position: relative;
        display: inline-block;
        background: @temux-icon;
        background-size: contain;
        background-position: center;
      }
      &.sheinx {
        width: @iconWidth;
        height: 38px;
        cursor: pointer;
        position: relative;
        display: inline-block;
        background: @sheinx-icon;
        background-size: contain;
        background-position: center;
      }
      &.ozon {
        width: @iconWidth;
        height: 38px;
        cursor: pointer;
        position: relative;
        display: inline-block;
        background: @ozon-icon;
        background-size: contain;
        background-position: center;
      }
    }
  }
}

</style>
