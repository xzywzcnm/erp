<template>
  <Modal v-model="isVisible" title="查看" :mask-closable="false" width="1000px">
    <div class="formDetail" style="padding: 10px 16px 0;">
      <Form inline :label-width="100" class="fmb0 formWidth200">
        <Form-item label="增值服务单号：">{{ stockDetail.serviceNo }}</Form-item>
        <Form-item label="增值服务：">
          <div v-if="valAddList[stockDetail.serviceType]">{{ valAddList[stockDetail.serviceType].label }}</div>
        </Form-item>
        <Form-item label="出库单号：">{{ stockDetail.pickingNo }}</Form-item>
        <Form-item label="单据类型：">
          <div v-if="documTypeList[stockDetail.invoicesType]">{{ documTypeList[stockDetail.invoicesType].label }}</div>
        </Form-item>
        <Form-item label="事业部：">
          <div v-if="businessDeptList[stockDetail.businessDeptId]">
            {{ businessDeptList[stockDetail.businessDeptId].name }}
          </div>
        </Form-item>
        <Form-item label="SKU数量：">{{ stockDetail.skuSum || 0 }}</Form-item>
        <Form-item label="商品数量：">{{ stockDetail.productSum || 0 }}</Form-item>
        <Form-item label="箱数量：">{{ stockDetail.boxSum || 0 }}</Form-item>
        <Form-item label="添加人：">
          <div v-if="userInfoListAll[stockDetail.createdBy]">{{ userInfoListAll[stockDetail.createdBy].userName }}</div>
        </Form-item>
        <Form-item label="添加时间：">{{ stockDetail.createdTime ? $uDate.dealTime(stockDetail.createdTime) : null
        }}</Form-item>
        <Form-item label="操作日期：">{{ stockDetail.operateTime }}</Form-item>
        <Form-item label="备注：">
          <div class="line-tooltip">
            <Tooltip max-width="400" placement="top" :content="stockDetail.remark" transfer
              transfer-class-name="self-tooltip">
              <div class="overEllipsis">{{ stockDetail.remark }}</div>
            </Tooltip>
          </div>
        </Form-item>
      </Form>
      <Table border highlight-row :columns="columns" :data="data" class="mt20"></Table>
      <Spin fix v-if="pageLoading"></Spin>
    </div>
    <div slot="footer">
      <Button @click="closeModal">关闭</Button>
    </div>
  </Modal>
</template>
<script>
import api from '@/api/api';
import { valAddList, documTypeList } from "./fileData";
export default {
  name: "valueAddedStockoutDetail",
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    rowData: {
      type: Object,
      default: () => {
        return {};
      }
    },
  },
  data() {
    return {
      pageLoading: false,
      isVisible: false,
      formData: {
        no: null,
        services: null,
        operaTime: null,
      },
      columns: [
        {
          title: "操作人",
          align: "left",
          render: (h, { row }) => {
            // let userInfoList = this.$common.arrayToObj(this.userInfoList, 'erpUserId');
            return h('span', this.userInfoListAll[row.operateUser] && this.userInfoListAll[row.operateUser].userName);
          },
        },
        {
          title: "操作数量",
          align: "left",
          key: 'operateQuantity',
        },
      ],
      data: [],
      stockDetail: {},
      valAddList: valAddList,
      documTypeList: documTypeList,
    };
  },
  watch: {
    modelVisible(newVal) {
      newVal && this.init();
    },
    isVisible(newVal) {
      this.$emit('update:modelVisible', newVal);
      !newVal && this.closeModal();
    }
  },
  computed: {
    // 用户列表
    userInfoListAll() {
      return this.$store.state.userInfoList;
    },
    businessDeptList() {
      let list = this.$store.getters.getBusinessDeptList || [];
      return this.$common.arrayToObj(list, 'id');
    },
  },
  methods: {
    init() {
      this.isVisible = true;
      this.data = [];
      this.stockDetail = {};
      this.getDetail();
    },
    getDetail() {
      let { serviceId } = this.rowData;
      this.pageLoading = true;
      this.axios.post(api.valAddService_queryDetail + serviceId).then((res) => {
        if (res.data.code === 0) {
          let data = res.data.datas || {};
          this.stockDetail = data;
          this.data = data.serviceDetailList || [];
        }
      }).finally(() => {
        this.pageLoading = false;
      })
    },
    // 关闭弹窗
    closeModal() {
      this.isVisible = false;
    },
  }
};
</script>
<!-- <style lang="less" scoped>
</style> -->
