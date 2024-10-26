<template >
  <Modal v-model="modalVisible" title="快递详情" :mask-closable="false" width="90%" class-name="modal-class-name">
    <div class="modal-main-content">
      <div class="row-content">
        <div class="row-item">
          <span>快递公司：</span>
          <span>{{ expressCompanyName }}</span>
        </div>
        <div class="row-item">
          <span>快递业务：</span>
          <span>{{ this.pageDetails.expressBusiness }}</span>
        </div>
        <div class="row-item">
          <span>快递单号：</span>
          <span>{{ trackingNumber }}</span>
        </div>
        <div class="row-item">
          <span>预约时间：</span>
          <span>{{ this.pageDetails.appointmentTime }}</span>
          <span v-if="!$common.isEmpty(appointmentTxt)" style="margin-left: 5px; color: #f20;">{{ appointmentTxt }}</span>
        </div>
      </div>
      <div class="block-head">
        <div class="head-title">出库单信息</div>
        <div class="head-tips">注意：以下出库单，使用同一个快递单号一起发货，请找齐所有包裹一起交货给快递；</div>
      </div>
      <Table class="modal-table" border highlight-row ref="tableRef" :max-height="500" :columns="tableColumns"
        :data="tableDaata"></Table>
      <Spin fix size="large" v-if="pageLoading"></Spin>
    </div>
    <div slot="footer">
      <Button @click="modalCancel">取消</Button>
    </div>
  </Modal>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'expressDeliveryModal',
  mixins: [Mixin],
  props: {
    moduleData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 快递信息
    logisticsData: {
      type: Array,
      default: () => {
        return []
      }
    },
    platformDataList: {
      type: Array,
      default: () => {
        return []
      }
    },
    platformSaleAccountObj: {
      type: Object,
      default: () => {
        return {}
      }
    },
    statusList: {
      type: Object,
      default: () => {
        return {}
      }
    },
    supplierDataList: {
      type: Array,
      default: () => {
        return []
      }
    },
    visible: { type: Boolean, default: false }
  },
  data() {
    return {
      modalVisible: false,
      pageLoading: false,
      pageDetails: {},
      tableDaata: [],
      tableColumns: [
        {
          title: "直发出库单",
          key: "supplierName",
          align: "center",
          minWidth: 150,
          render: (h, { row }) => {
            let item = [];
            let tagItem = [];
            item.push(h('div', {
              style: {
                'text-align': 'left'
              }
            }, [
              h('span', {}, '单号：'),
              h('span', {}, row.directDeliverPickingNo),
            ]));
            let supplierName = '';
            if (!this.$common.isEmpty(row.supplierId)) {
              const supplierInfo = this.supplierDataList.find(sup => row.supplierId == sup.supplierId);
              if (!this.$common.isEmpty(supplierInfo)) {
                supplierName = supplierInfo.supplierName;
              }
            }
            item.push(h('div', {
              attrs: {
                title: '供应商',
              },
              style: {
                'text-align': 'left',
                'margin': '5px 0'
              }
            }, supplierName || row.supplierName));
            let account = {};
            if (!this.$common.isEmpty(row.platformSubject)) {
              const platformInfo = this.platformDataList.find(item => item.platformId == row.platformSubject);
              let platformName = row.platformSubject;
              let platformId = row.platformSubject;
              if (!this.$common.isEmpty(platformInfo)) {
                platformName = platformInfo.platformName;
                platformId = platformInfo.platformId;
              }
              if (!this.$common.isEmpty(this.platformSaleAccountObj[platformId])) {
                account = this.platformSaleAccountObj[platformId].find(acc => acc.saleAccountId == row.saleAccountId);
              }
              tagItem.push(h(
                "Tag",
                {
                  props: { color: "volcano" },
                  attrs: { title: "平台主体" },
                },
                platformName
              ));
            }
            tagItem.push(h('Tag', {
              props: { color: "magenta" },
              attrs: { title: "店铺" },
            }, this.$common.isEmpty(account) ? row.accountCode : account.account));
            !this.$common.isEmpty(this.statusList[row.deliverPickingStatus]) && tagItem.push(h('Tag', {
              props: { color: "green" },
              attrs: { title: "状态" },
            }, this.statusList[row.deliverPickingStatus].label));
            item.push(h('div', {
              class: 'tag-hideBorder',
              style: {
                'text-align': 'left'
              }
            }, tagItem));
            return item;
          }
        },
        {
          title: "平台订单号",
          key: "platformOrderNo",
          align: "center",
          width: 150,
        },
        {
          title: "备注",
          key: "remark",
          align: "center",
          minWidth: 150,
        },
        {
          title: "图片",
          key: "goodsUrls",
          align: "center",
          width: 80,
          render: (h, params) => {
            return h('div', {
              style: {
                margin: '5px 0'
              }
            }, [this.tableImg(h, params, "goodsUrls")]);
          }
        },
        {
          title: "SKU数量",
          key: "skuNumber",
          align: "center",
          width: 150,
        },
        {
          title: "商品数量",
          key: "orderNumberSum",
          align: "center",
          width: 150,
        },
        {
          title: "发货数量",
          key: "deliverNumberSum",
          align: "center",
          width: 150,
        },
      ]
    };
  },
  watch: {
    visible: {
      immediate: true,
      deep: true,
      handler(val) {
        this.modalVisible = val;
        this.$nextTick(() => {
          val && this.initData();
        })
      }
    },
    modalVisible: {
      immediate: true,
      deep: true,
      handler(val) {
        this.$emit('update:visible', val);
      }
    }
  },
  created() { },
  computed: {
    // 当前快递单号
    trackingNumber() {
      if (this.$common.isEmpty(this.moduleData)) return '';
      return this.moduleData.trackingNumber;
    },
    // 供应商 code
    supplierCode() {
      if (this.$common.isEmpty(this.pageDetails)) return '';
      return this.moduleData.supplierCode;
    },
    //
    appointmentTxt() {
      if (this.$common.isEmpty(this.pageDetails)) return '';
      return this.getDayTypeTxt(this.pageDetails.appointmentTime);
    },
    // 快递公司名称
    expressCompanyName() {
      if (this.$common.isEmpty(this.pageDetails)) return '';
      if (this.$common.isEmpty(this.logisticsData) || this.$common.isEmpty(this.pageDetails.expressCompany)) return '';
      const logisticsInfo = this.logisticsData.find(item => {
        return item.logisticsId === Number(this.pageDetails.expressCompany);
      })
      if (this.$common.isEmpty(logisticsInfo)) return '';
      return logisticsInfo.logisticsName;
    }
  },
  activated() { },
  mounted() { },
  methods: {
    // 初始数据
    initData() {
      this.pageLoading = true;
      this.$nextTick(() => {
        this.$common.promiseAll([
          this.getDetails,
          this.getExpressDetails
        ]).finally(() => {
          this.pageLoading = false;
        })
      })
    },
    // 获取快递详情
    getExpressDetails() {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(this.trackingNumber)) return resolve([]);
        this.axios.get(api.queryAllDirectDeliverPicking, {
          params: {
            trackingNumber: this.trackingNumber,
            supplierCode: this.supplierCode
          }
        }).then((res) => {
          if (!res || !res.data || res.data.code != 0) return;
          this.tableDaata = res.data.datas || [];
        }).finally(() => {
          resolve({});
        })
      })
    },
    // 获取当前数据的详情信息
    getDetails() {
      return new Promise((resolve) => {
        this.axios.get(api.queryDirectDeliverPickingInfo, {
          params: {
            directDeliverPickingNo: this.moduleData.directDeliverPickingNo
          }
        }).then((res) => {
          if (!res || !res.data || res.data.code != 0) return;
          this.pageDetails = this.$common.copy(res.data.datas);
        }).finally(() => {
          resolve({});
        })
      })
    },
    // 返回  今天、明天、后天，其他日期返回空
    getDayTypeTxt(dateTxt) {
      if (this.$common.isEmpty(dateTxt)) return '';
      const dateDay = this.$common.dayjs(dateTxt).format('YYYY-MM-DD');
      const nowDay = this.$common.dayjs().format('YYYY-MM-DD');
      if (nowDay == dateDay) return '今天';
      if (this.$common.dayjs(nowDay).add(1, 'day').isSame(dateDay, 'day')) return '明天';
      if (this.$common.dayjs(nowDay).add(2, 'day').isSame(dateDay, 'day')) return '后天';
      return '';
    },
    // 取消
    modalCancel() {
      this.modalVisible = false;
    }
  }
};
</script>
<style lang="less" scoped>
.modal-main-content {
  position: relative;

  .row-content {
    display: flex;
    flex-wrap: wrap;
    padding: 0 20px;

    .row-item {
      flex: 100;
      padding-right: 15px;
      white-space: nowrap;
    }
  }

  .block-head {
    display: flex;
    position: relative;
    margin-top: 20px;
    align-items: center;

    .head-title {
      position: relative;
      padding-left: 20px;
      height: 20px;
      line-height: 20px;

      &:before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 3px;
        height: 100%;
        background: #2d8cf0;
      }
    }

    .head-tips {
      margin-left: 20px;
      padding: 5px 15px;
      color: #f20;
      background-color: rgba(230, 247, 255, 1);
      border: 1px solid rgba(102, 204, 255, 1);
      border-radius: 3px;
    }
  }

  .modal-table {
    margin-top: 20px;
  }
  :deep(.underline) {
    color: #2d8cf0;
    text-decoration: underline;
    text-underline-position: under;
    cursor: pointer;
  }

  :deep(.row-tag-item) {
    display: inline-block;
    margin: 4px 8px 0px 0px;
    padding: 1px 8px;
    background: #f3f3f4;
    border-radius: 3px;
  }
}

:deep(.modal-class-name) {
  .ivu-modal {
    max-width: 1600px;
    min-width: 800px;
  }
}
</style>