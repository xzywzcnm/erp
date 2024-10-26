<template>
  <Modal title="退货包裹重派详情" v-model="modalVisible" :mask-closable="false" width="1300px">
    <Form ref="formCustom" :model="packageDetail" :label-width="80" :inline="true" class="detail-form">
      <div class="stock-block">
        <FormItem label="退货跟踪号:">
          <span class="span-block">{{ packageDetail.trackingNumber || '' }}</span>
        </FormItem>
        <FormItem label="退货时间:">
          <span class="span-block">
            <span v-if="packageDetail.returnTime">
              {{ $common.getDataToLocalTime(packageDetail.returnTime, 'fulltime') }}
            </span>
          </span>
        </FormItem>
        <FormItem label="退货订单号:">
          <span class="span-block">
            <span v-if="data.accountCode">{{ data.accountCode }}-</span>
            <span>{{ data.webstoreOrderId || '' }}</span>
          </span>
        </FormItem>
        <FormItem label="状态:">
          <span class="span-block">
            <span v-for="(item, index) in statusList" :key="index + 'statusList'">
              <span v-if="packageDetail.status === item.value">{{ item.label }}</span>
            </span>
          </span>
        </FormItem>
        <FormItem label="重退次数:">
          <span class="span-block">{{ packageDetail.repeatReturnCount }}</span>
        </FormItem>
        <FormItem label="备注:" class="ignore-width" style="max-width: calc(100% - 325px);">
          <span class="span-block">{{ packageDetail.remark }}</span>
        </FormItem>
      </div>
      <div class="stock-block">
        <div class="title">退货包裹商品信息</div>
        <div>
          <Table border highlight-row :columns="columns" :data="(packageDetail.returnPackageDetailVos || [])"
            :max-height="400">
            <template slot-scope="{ row, index }" slot="pictureUrl">
              <dyt-previewImg :url="row.pictureUrl"></dyt-previewImg>
            </template>
            <template slot-scope="{ row, index }" slot="productSpecificationVoList">
              <span v-for="(item, index) in (row.productSpecificationVoList || [])"
                :key="index + 'productSpecificationVoList'">
                <span v-if="item.name">{{ item.name }}:</span>
                <span v-if="item.value">{{ item.value }}；</span>
              </span>
            </template>
          </Table>
        </div>
      </div>
      <div class="stock-block">
        <div class="title">退货包裹重派信息</div>
        <div>
          <FormItem label="重派订单:">
            <span class="span-block">
              <span v-if="data.orderAccountCode">{{ data.orderAccountCode }}-</span>
              <span>{{ data.salesRecordNumber || '' }}</span>
            </span>
          </FormItem>
          <FormItem label="买家ID:">
            <span class="span-block">{{ packageDetail.buyerAccountId || '' }}</span>
          </FormItem>
          <FormItem label="买家姓名:">
            <span class="span-block">{{ packageDetail.buyerName || '' }}</span>
          </FormItem>
          <FormItem label="国家/地区:">
            <!-- <span class="span-block">{{ getCountryName(packageDetail.buyerCountryCode) }}</span> -->
            <span class="span-block">{{ packageDetail.buyerCountryCode }}</span>
          </FormItem>
          <FormItem label="金额:">
            <span class="span-block">{{ packageDetail.totalPrice || 0 }} {{ packageDetail.totalPriceCurrency || ''
            }}</span>
          </FormItem>
          <FormItem label="付款时间:">
            <span class="span-block">
              <span v-if="packageDetail.payTime">
                {{ $common.getDataToLocalTime(packageDetail.payTime, 'fulltime') }}
              </span>
            </span>
          </FormItem>
        </div>
      </div>
      <div class="stock-block">
        <div class="title">操作日志</div>
        <div>
          <Table border highlight-row :columns="logColumns" :data="(packageDetail.returnPackageLogList || [])"
            :max-height="400">
            <template slot-scope="{ row, index }" slot="createdBy">
              <span v-if="userInfoList[row.createdBy]">{{ userInfoList[row.createdBy].userName || '' }}</span>
              <span v-else>{{ row.createdBy }}</span>
            </template>
            <template slot-scope="{ row, index }" slot="createdTime">
              <span v-if="row.createdTime">
                {{ $common.getDataToLocalTime(row.createdTime, 'fulltime') }}
              </span>
            </template>
          </Table>
        </div>
      </div>
      <Spin size="large" fix v-if="spinShow"></Spin>
    </Form>
    <div slot="footer">
      <Button :loading="modal_loading" @click="modalVisible = false">取消</Button>
    </div>
  </Modal>
</template>
<script>
import api from '@/api/api';
export default {
  name: 'packageDetail',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => { return {} }
    },
    statusList: {
      type: Array,
      default: () => { return [] }
    }
    // countryList: {
    //   type: Array,
    //   default: () => { return [] }
    // },
  },
  data() {
    return {
      modalVisible: false,
      pageLoading: false,
      columns: [{
        title: '图片',
        slot: 'pictureUrl',
        align: 'center',
        width: 100
      },
      {
        title: 'SKU',
        align: 'center',
        key: 'sku',
        width: 120
      },
      {
        title: 'SPU',
        align: 'center',
        key: 'spu',
        width: 120
      },
      {
        title: '名称',
        align: 'center',
        key: 'cnName',
        minWidth: 120
      },
      {
        title: '规格',
        slot: 'productSpecificationVoList',
        align: 'center',
        minWidth: 120
      },
      {
        title: '数量',
        key: 'quantity',
        align: 'center',
        width: 120
      }],
      logColumns: [{
        title: '操作人',
        slot: 'createdBy',
        align: 'center',
        width: 140
      },
      {
        title: '操作时间',
        align: 'center',
        slot: 'createdTime',
        width: 150
      },
      {
        title: '操作内容描述',
        align: 'center',
        key: 'desc',
        minWidth: 120
      }],
      modal_loading: false,
      spinShow: false,
      packageDetail: {}, // 包裹信息
      userInfoList: []// 全部用户列表
    }
  },
  watch: {
    dialogVisible: {
      handler(nval, oval) {
        nval && this.open();
      },
      deep: true
    },
    modalVisible: {
      handler(nval, oval) {
        !nval && this.$emit('update:dialogVisible', nval);
      },
      deep: true
    }
  },
  methods: {
    // 窗口打开
    open() {
      this.modalVisible = true;
      this.userInfoList = this.$store.state.userInfoList || [];
      this.init();
    },
    backList() {
      this.modalVisible = false;
    },
    init() {
      this.spinShow = true;
      this.axios.post(api.otto_queryPackageDetail, { returnPackageId: this.data.returnPackageId }).then(({ data }) => {
        if (!(data && data.code === 0)) return;
        this.packageDetail = data.datas || {};
      }).finally(() => {
        this.spinShow = false;
      })
    }
    // // 处理国家名称
    // getCountryName(country) {
    //   let list = this.countryList.filter(k => {
    //     return k.twoCode === country;
    //   })
    //   if (list.length) return list[0].cnName;
    //   return country;
    // }
  }
}
</script>
<style lang="less">
.detail-form {
  .ivu-form-item {
    margin-bottom: 0;
  }

  .ivu-form-item-content {
    width: 220px;
  }

  .ignore-width .ivu-form-item-content {
    width: auto;
  }

  .stock-block {
    margin-top: 20px;

    .title {
      border-left: 3px solid #2d8cf0;
      padding-left: 10px;
      margin-bottom: 10px;
    }

    .span-block {
      display: inline-block;
      word-break: break-all;
      // line-height: 20px;
      // padding-top: 10px;
    }
  }
}
</style>
