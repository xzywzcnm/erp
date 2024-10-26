<template >
  <outboundOrderCommon
      :exportApi="exportApi"
      :batchUploadPackageApi="batchUploadPackageApi"
      :uploadPackageApi="uploadPackageApi"
      :syncSendPackageApi="syncSendPackageApi"
      :getListApi="getListApi"
      :getDetailApi="getDetailApi" >

  </outboundOrderCommon >
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
      batchUploadPackageApi: api.packageInfoBatchUploadOutstorePackage, // 批量申请运单号
      uploadPackageApi: api.packageInfoUploadOutstorePackage, // 申请运单号
      syncSendPackageApi: api.packageInfoBatchOutstorePackageStatus, // 批量同步发货状态
      getListApi: api.packageInfoOutstoreQuery,
      getDetailApi: api.queryOutstoreSalesPackageDetail
    };
  }
};
</script >
