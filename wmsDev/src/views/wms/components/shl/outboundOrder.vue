<template>
  <outboundOrderCommon
    :exportApi="exportApi"
    :batchUploadPackageApi="batchUploadPackageApi"
    :uploadPackageApi="uploadPackageApi"
    :syncSendPackageApi="syncSendPackageApi"
    :getListApi="getListApi"
    :getDetailApi="getDetailApi"
    warehouseName="shl"
  />
</template>

<script>
import common from '@/components/mixin/common_mixin';
import api from '@/api/api';
import outboundOrderCommon from '@/views/wms/components/overseasWarehouseCompont/outboundOrderCommon';

export default {
  name: 'outboundOrder',
  mixins: [common],
  components: {
    outboundOrderCommon
  },
  data () {
    // let v = this;
    return {
      exportApi: api.export_package,
      batchUploadPackageApi: api.put_packageInfo_batchUploadShlStorePackage, // 批量申请运单号
      uploadPackageApi: api.put_packageInfo_uploadShlStorePackage, // 申请运单号
      syncSendPackageApi: api.put_packageInfo_batchShlStorePackageStatus, // 批量同步发货状态
      getListApi: api.post_packageInfo_shlStoreQuery, // 出库单检索
      getDetailApi: api.post_wmsPicking_queryShlSalesPackageDetail // 出库单详情
    };
  }
};
</script>
