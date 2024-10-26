<template>
  <Modal title="匹配的退件包裹" v-model="modalVisible" :mask-closable="false" width="1200px">
    <div class="match-return-packages">
      <div class="tips" v-if="data.isDeliveryLogistics != 1">
        <span>提示：订单按匹配的退件包裹，由退件海外仓发货，请选择正确的仓库与物流渠道；如果订单不需要使用匹配的退件包裹发货，请取消退件匹配：</span>
        <a href="javascript:;" style="text-decoration: underline;" @click="cancalReturnMatch"
          v-if="getPermission('orderCancelBindingReturnPackage')">取消退件匹配</a>
      </div>
      <Table border highlight-row :columns="columns" :data="(packageDetail.returnPackageDetailVos || [])"
        :loading="modal_loading">
        <template slot-scope="{ row, index }" slot="pictureUrl">
          <dyt-previewImg :url="row.pictureUrl"></dyt-previewImg>
        </template>
        <template slot-scope="{ row, index }" slot="webstoreOrderId">
          <span v-if="row.accountCode">{{ row.accountCode }}-</span>
          <span>{{ row.webstoreOrderId || '' }}</span>
        </template>
        <template slot-scope="{ row, index }" slot="returnTime">
          <span v-if="row.returnTime">{{ $common.getDataToLocalTime(row.returnTime, 'fulltime') }}</span>
        </template>
        <template slot-scope="{ row, index }" slot="sku">
          <span>{{ row.sku || '' }}</span>
          <span v-if="row.sku"> *{{ row.quantity || 0 }}</span>
        </template>
      </Table>
    </div>
    <div slot="footer">
      <Button @click="modalVisible = false">取消</Button>
    </div>
  </Modal>
</template>
<script>
import fetch from '@/components/mixin/fetch';
import api from '@/api/api';
export default {
  name: 'matchReturnPackages',
  mixins: [fetch],
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => { return {} }
    }
  },
  data () {
    return {
      modalVisible: false,
      columns: [
        {
          title: '退货跟踪号',
          key: 'trackingNumber',
          align: 'center',
          minWidth: 120
        },
        {
          title: '产品',
          align: 'center',
          slot: 'pictureUrl',
          width: 110
        },
        {
          title: 'SKU',
          align: 'center',
          slot: 'sku',
          minWidth: 120
        },
        {
          title: '退货时间',
          align: 'center',
          slot: 'returnTime',
          width: 160
        },
        {
          title: '退货订单号',
          slot: 'webstoreOrderId',
          align: 'center',
          minWidth: 120
        }
      ],
      packageDetail: {},
      modal_loading: false
    }
  },
  watch: {
    dialogVisible: {
      handler (nval, oval) {
        nval && this.open();
      },
      deep: true
    },
    modalVisible: {
      handler (nval, oval) {
        !nval && this.$emit('update:dialogVisible', nval);
      },
      deep: true
    }
  },
  methods: {
    // 窗口打开
    open () {
      this.modalVisible = true;
      this.init();
    },
    backList () {
      this.modalVisible = false;
    },
    init () {
      this.spinShow = true;
      let { returnPackageId } = this.data;
      this.axios.post(api.otto_queryMatchingReturnPackage, { returnPackageId }).then(({ data }) => {
        if (!(data && data.code === 0)) return;
        let datas = data.datas || {};
        // 将外部主信息插入sku列表中
        let returnPackageDetailVos = (datas.returnPackageDetailVos || []).map(k => {
          let temp = this.$common.copy(datas);
          delete temp.returnPackageDetailVos;
          return Object.assign({}, temp, k);
        })
        datas.returnPackageDetailVos = returnPackageDetailVos;
        this.packageDetail = datas;
      }).finally(() => {
        this.spinShow = false;
      })
    },
    // 取消退件匹配
    cancalReturnMatch () {
      this.$Modal.confirm({
        title: '确认是否要取消退件匹配',
        content: '<span style="display:inline-block;padding: 4px 8px;border-radius: 4px;background-color: #f0faff;border: 1px solid #abdcff;margin: 10px 0;">提示：退件匹配取消后，退件包裹可以重新匹配，订单不能再重新匹配退件包裹</span>',
        width: 650,
        loading: true,
        onOk: () => {
          let { orderId } = this.data;
          this.axios.get(api.otto_cancelBindingReturnPackage + orderId + '?platformId=otto').then(({ data }) => {
            if (!(data && data.code === 0)) return;
            this.$Message.success('操作成功~');
            this.modalVisible = false;
            this.$emit('search');
          }).finally(() => {
            this.$Modal.remove();
          })
        },
        onCancel: () => { }
      });
    }
  }
}
</script>
<style lang="less">
.match-return-packages {
  .tips {
    padding: 6px 8px;
    border-radius: 4px;
    margin-bottom: 10px;
    background-color: #f7f7f7;
    border: 1px solid #dcdee2;
  }
}
</style>
