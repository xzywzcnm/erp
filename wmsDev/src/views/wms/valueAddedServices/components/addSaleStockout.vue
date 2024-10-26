<template>
  <Modal v-model="isVisible" title="扫描录入（销售出库）" :mask-closable="false" width="1200px" footer-hide
    class="addSaleStockout_page">
    <div class="formDetail dispalyFlex" style="padding: 0 4px;">
      <!-- <Alert type="warning" show-icon style="display:inline-block;padding: 8px 8px 8px 36px;line-height: 16px;">
        温馨提示：只允许添加“销售出库”的增值服务，扫描“包裹号”后即添加；操作数量锁定为：1；如要变更操作数量，请解除“锁定操作数量”
      </Alert> -->
      <Form ref="formData" :model="formData" :rules="formRule" :label-width="90" class="mr20"
        style="flex:1;overflow:hidden;">
        <div style="border:1px solid #dcdee2;padding: 10px 10px 0 10px;" class="fmb18">
          <Form-item label="增值服务：" prop="serviceType">
            <RadioGroup v-model="formData.serviceType" type="button" button-style="solid" @on-change="serviceTypeChange">
              <Radio :label="item.value" v-for="(item, index) in valAddList" :key="index">{{ item.label }}</Radio>
            </RadioGroup>
          </Form-item>
          <Form-item label="操作人：" prop="operateUser">
            <div class="flexCenter">
              <dyt-select v-model="formData.operateUser" style="width: 300px;">
                <Option v-for="item in userInfoList" :key="item.erpUserId" :label="item.name" :value="item.erpUserId">
                </Option>
              </dyt-select>
              <span class="ml10 ashTips">请选择增值服务的实际操作人</span>
            </div>
          </Form-item>
          <Form-item label="操作日期：" prop="operateTime">
            <div class="flexCenter">
              <DatePicker type="date" format="yyyy-MM-dd" style="width: 300px;" transfer placeholder="请选择"
                @on-change="timeChange" :value="formData.operateTime"></DatePicker>
              <span class="ml10 ashTips">请选择增值服务的实际发生日期</span>
            </div>
          </Form-item>
        </div>
        <div>
          <div class="mt10 fmb18">
            <div style="margin-bottom: 4px;">包裹号：</div>
            <Form-item label="" prop="packageCode" size="large" :label-width="0" class="package_style">
              <div class="flexCenter">
                <div class="input_width500">
                  <dyt-input ref="packageCode" v-model.trim="formData.packageCode" size="large" @on-enter="scanCode"
                    placeholder="扫描包裹面单的条码，出库单号" :disabled="saveLoading" @on-clear="clearPackage" />
                </div>
                <div class="ml20" v-if="packageMessage" style="width:270px;">
                  <div v-if="packageMessage === '扫描录入成功'" style="color:#19be6b;">{{ packageMessage }}</div>
                  <div style="color:#ed4014;line-height: 18px;" v-else>
                    <div>扫描录入失败</div>
                    <div class="textOverTwo">{{ packageMessage }}</div>
                  </div>
                </div>
              </div>
            </Form-item>
          </div>
          <div class="fmb8" style="position:relative;padding: 0 10px;">
            <Form-item label="运单号：">{{ stockDetail.trackingNumber }}</Form-item>
            <Form-item label="物流商单号：">{{ stockDetail.thirdPartyNo }}</Form-item>
            <Form-item label="出库单号：">{{ stockDetail.packageCode }}</Form-item>
            <Form-item label="单据类型：">
              <div v-if="documTypeList[stockDetail.invoicesType]">{{ documTypeList[stockDetail.invoicesType].label }}
              </div>
            </Form-item>
            <Form-item label="事业部：">
              <div v-if="businessDeptList[stockDetail.businessDeptId]">
                {{ businessDeptList[stockDetail.businessDeptId].name }}
              </div>
            </Form-item>
            <Form-item label="SKU数量：">{{ stockDetail.skuSum }}</Form-item>
            <Form-item label="商品数量：">{{ stockDetail.productSum }}</Form-item>
            <Spin fix v-if="pageLoading"></Spin>
          </div>
        </div>
      </Form>
      <div>
        <Table border highlight-row :columns="columns" :data="tableList" width="384" height="650"></Table>
      </div>
    </div>
    <Spin fix v-if="saveLoading" style="opacity: .8;">正在保存中...</Spin>
    <batchScan :modelVisible.sync="batchScanInfo.visible" :stockDetail="stockDetail" @returnInfo="batchReturn" />
  </Modal>
</template>
<script>
import api from '@/api/api';
import { getWarehouseId } from '@/utils/getService';
import { valAddList, documTypeList } from "./fileData";
import batchScan from "./batchScan";
import permission_mixin from "@/components/mixin/permission_mixin";
export default {
  name: "valueAddedOtherStockout",
  mixins: [permission_mixin],
  components: { batchScan },
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
  },
  data() {
    const v = this;
    return {
      loading: false,
      isVisible: false,
      pageLoading: false,
      formData: {
        serviceType: 0,
        operateUser: null,
        operateTime: null,
        packageCode: null,
        operateQuantity: null,
      },
      formRule: {
        serviceType: [
          { required: true, message: '请选择', trigger: 'change', type: 'number' }
        ],
        operateUser: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        operateTime: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
      },
      userInfoList: [],
      stockDetail: {},
      documTypeList: documTypeList,
      saveLoading: false,
      isChange: false,
      tableList: [],
      packageMessage: null,
      batchScanInfo: {
        visible: false,
      },
      columns: [
        {
          title: "已扫描的包裹号",
          align: "left",
          minWidth: 200,
          key: "pickingNo",
        },
        {
          title: "操作数量",
          align: "left",
          width: 90,
          key: "operateQuantitySum",
        },
        {
          title: "操作",
          align: "left",
          width: 80,
          render: (h, { row, index }) => {
            let list = [];
            if (v.getPermission('valueAddedService_delete')) {
              list.push(h(
                "Button",
                {
                  props: {
                    size: "small",
                    type: 'error'
                  },
                  on: {
                    click: () => {
                      v.deleRow(row, index);
                    },
                  },
                },
                "删除"
              ))
            }
            return h("div", list);
          },
        },
      ],
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
    valAddList() {
      return Object.keys(valAddList).map(k => valAddList[k]).filter(k => k.type && k.type.includes(1));
    },
    erpUserId() {
      const authUserInfo = this.$store.getters.authUserInfo || {};
      const securityUser = authUserInfo.securityUser || {};
      return securityUser.erpUserId;
    },
    warehouseId() {
      return this.$store.state.warehouseId || getWarehouseId();
    },
    businessDeptList() {
      let businessDeptList = this.$store.getters.getBusinessDeptList || [];
      return this.$common.arrayToObj(businessDeptList, 'id');
    },

  },
  methods: {
    init() {
      this.isVisible = true;
      this.isChange = false;
      this.reset();
      this.getUserInfoList();
    },
    // 关闭弹窗
    closeModal() {
      if (this.isChange) this.$emit('refreshAll');
      this.$refs['formData'].resetFields();
      this.isVisible = false;
    },
    reset() {
      this.tableList = [];
      this.stockDetail = {};
      this.packageMessage = null;
      this.$nextTick(() => {
        this.$refs['formData'].resetFields();
        this.formData.operateTime = this.$common.dayjs().format('YYYY-MM-DD');
      })
    },
    getUserInfoList() {
      this.axios.post(api.valAddService_queryAffiliatedBusinessDeptPersonByIds, [16]).then((res) => {
        if (res.data.status === 200) {
          this.userInfoList = res.data.data || [];
          // 操作人，默认值为：登录用户, 如果不在事业部为“永邦”的所有用户内默认空
          let existUser = this.userInfoList.filter(k => k.erpUserId === this.erpUserId);
          this.formData.operateUser = existUser.length ? this.erpUserId : null;
        }
      })
    },
    timeChange(e) {
      this.formData.operateTime = e;
    },
    serviceTypeChange() {
      this.clearPackage();
    },
    // 扫描
    scanCode() {
      this.packageMessage = null;
      this.$refs['formData'].validate(async (valid) => {
        if (!valid) return;
        let { packageCode } = this.formData;
        if (this.$common.isEmpty(packageCode)) {
          this.packageMessage = '包裹号不能为空，请扫描包裹的包裹号';
          return;
        }
        packageCode = packageCode.trim();
        let datas = await this.searchDetail(packageCode);
        if (datas.state === 'error') {
          this.packageMessage = datas.message;
          return;
        }
        this.stockDetail = datas;
        let productSum = datas.productSum || 0;
        // 1，判定为"单商品包裹"，直接添加“增值服务单”
        if (productSum <= 1) {
          this.formData.operateQuantity = 1;
          this.save();
        } else {
          // 判定为"多商品包裹"，弹窗确认“操作数量”后再添加
          this.batchScanInfo.visible = true;
        }
      })
    },
    // 查询包裹信息
    searchDetail(packageCode) {
      return new Promise((resolve, reject) => {
        this.stockDetail = {};
        this.pageLoading = true;
        let rqApi = `${api.valAddService_queryPackageInfo}${this.warehouseId}?scanCode=${packageCode}&serviceType=${this.formData.serviceType}`;
        this.axios.post(rqApi, {}, { hiddenError: true }).then(({ data }) => {
          if (data.code === 0) {
            const temp = data.datas || {};
            temp.state = 'success';
            resolve(temp);
          } else {
            let temp = { state: 'error' };
            if ([555144].includes(data.code)) {
              temp.message = data.message || '不可预见的错误';
            } else {
              temp.message = '不可预见的错误';
            }
            resolve(temp);
          }
        }).catch(() => {
          resolve({ state: 'error', message: '不可预见的错误' });
        }).finally(() => {
          this.pageLoading = false;
        })
      })
    },
    resetPackage() {
      this.formData.packageCode = null;
      this.formData.operateQuantity = null;
    },
    clearPackage() {
      this.stockDetail = {};
      this.formData.operateQuantity = null;
      this.packageMessage = null;
      this.packageFocus();
    },
    packageFocus() {
      setTimeout(() => {
        this.$refs.packageCode.focus();
      }, 500)
    },
    save() {
      let temp = this.$common.copy(this.formData);
      temp.warehouseId = this.warehouseId;
      temp.packageDetailBOList = [
        { operateUser: temp.operateUser, operateQuantity: temp.operateQuantity }
      ];
      temp.packageCode = this.stockDetail.packageCode;
      // console.log(temp);
      // return;
      this.saveLoading = true;
      this.axios.post(api.valAddService_savePackage, temp)
        .then(({ data }) => {
          if (data.code === 0) {
            this.packageMessage = '扫描录入成功';
            this.isChange = true;
            this.resetPackage();
            this.tableList.unshift({
              pickingNo: temp.packageCode || temp.trackingNumber || temp.thirdPartyNo,
              operateQuantitySum: temp.operateQuantity,
              serviceId: data.datas,
            })
          }
          this.packageFocus();
        }).finally(() => {
          this.saveLoading = false;
        })
    },
    deleRow(row, index) {
      this.$Modal.confirm({
        title: '操作提示',
        width: '560px',
        content: `<div style="font-size: 16px;">
          <div>确认是否要删除？包裹号：<span style="color:#f60;">${row.pickingNo}</span></div>
        </div>`,
        loading: true,
        onOk: () => {
          this.axios.delete(api.valAddService_delete + row.serviceId).then(res => {
            if (!res || !res.data || res.data.code !== 0) return;
            this.$Message.success('操作成功');
            this.tableList.splice(index, 1);
          }).finally(() => {
            this.$Modal.remove();
          })
        }
      });
    },
    batchReturn(data) {
      this.formData.operateQuantity = data.operateQuantity;
      this.save();
    },
  }
};
</script>
<style lang="less">
.addSaleStockout_page {
  .package_style {
    .input_width500 {
      width: 470px;
      line-height: 50px;
    }

    .dyt-custom-input-box .dyt-custom-input .ivu-input-icon {
      top: 10px;
    }

    .ivu-input {
      height: 50px;
      font-size: 18px;
    }
  }
}
</style>
