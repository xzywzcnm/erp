<template>
  <outboundOrderCommon
    :exportApi="exportApi"
    :batchUploadPackageApi="batchUploadPackageApi"
    :uploadPackageApi="uploadPackageApi"
    :syncSendPackageApi="syncSendPackageApi"
    :getListApi="getListApi"
    :getDetailApi="getDetailApi">
  </outboundOrderCommon>
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
    return {
      exportApi: api.export_package,
      batchUploadPackageApi: api.put_packageInfo_batchUploadEfStorePackage, // 批量申请运单号
      uploadPackageApi: api.put_packageInfo_uploadEfStorePackage, // 申请运单号
      syncSendPackageApi: api.put_packageInfo_batchEfStorePackageStatus, // 批量同步发货状态
      getListApi: api.post_packageInfo_efStoreQuery,
      getDetailApi: api.post_wmsPicking_queryEfSalesPackageDetail
    };
  }
};
</script>
