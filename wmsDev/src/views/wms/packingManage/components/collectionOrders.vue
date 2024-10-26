<template>
  <div>
    <Modal v-model="isVisible" title="预约揽收单" :width="600" :mask-closable="false" class="collectionOrdersPage">
      <div>
        <Form ref="collectionForm" :model="formData" :rules="formValidate" :label-width="120">
          <div class="detail-form mb20">
            <div class="ignore-width">
              <FormItem label="联系人">{{ formData.contacts }} {{ formData.telephone }}</FormItem>
              <FormItem label="联系人地址">{{ formData.contactAddress }}</FormItem>
            </div>
          </div>
          <FormItem label="预估总重量" prop="estimatedWeight">
            <dyt-input v-model.number="formData.estimatedWeight" class="suffixTips spinButton" type="number">
              <span slot="suffix">KG</span>
            </dyt-input>
          </FormItem>
          <FormItem label="预估总体积" prop="estimatedVolume">
            <dyt-input v-model.number="formData.estimatedVolume" class="suffixTips spinButton" type="number">
              <span slot="suffix">m³</span>
            </dyt-input>
          </FormItem>
          <FormItem label="预估总箱数" prop="estimatedBoxNumber">
            <dyt-input v-model.number="formData.estimatedBoxNumber" class="suffixTips spinButton" type="number">
              <span slot="suffix">箱</span>
            </dyt-input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <span>{{ boxInfo.title }}</span>
        <Button @click="isVisible = false" class="ml20">取消</Button>
        <Button type="primary" @click="handleFom" :loading="loading" v-if="boxInfo.packageQuantitySum">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import regular from '@/utils/regular'
import { getWarehouseId } from '@/utils/getService';
export default {
  name: 'boxLabel',
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false
      }
    },
    data: {
      type: Object,
      default() {
        return {}
      }
    },
  },
  data() {
    return {
      isVisible: false,
      formData: {
        contacts: '陆啟宗',
        telephone: '18925953972',
        contactAddress: '广东省佛山市南海区丹灶镇西城社区丽山村工业区4号车间二1楼',
        estimatedWeight: null,
        estimatedVolume: null,
        estimatedBoxNumber: null,
      },
      formValidate: {
        estimatedWeight: [
          { required: true, pattern: regular.twoFloat, message: '请输入数字,限两位小数', trigger: 'blur' }
        ],
        estimatedVolume: [
          { required: true, pattern: regular.twoFloat, message: '请输入数字,限两位小数', trigger: 'blur' }
        ],
        estimatedBoxNumber: [
          { required: true, pattern: regular.integerZero, message: '请输入不小于0的整数', trigger: 'blur' }
        ],
      },
      loading: false,
    }
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true
    },
    isVisible: {
      handler(val) {
        if (val) return;
        this.$emit('update:modelVisible', val);
      },
      deep: true
    }
  },
  computed: {
    // 脚部提示
    boxInfo() {
      let data = this.data;
      let [boxQuantitySum, packageQuantitySum] = [0, 0];
      if (data.type == 2) {
        if (Object.prototype.toString.call(data.data) === '[object Object]') {
          boxQuantitySum = data.boxNumInfo.boxQuantitySum || 0;
          packageQuantitySum = data.boxNumInfo.packageQuantitySum || 0;
        }
      } else {
        if (Object.prototype.toString.call(data.data) === '[object Array]') {
          data.data.forEach(k => {
            packageQuantitySum += (k.packageQuantity || 0);
            boxQuantitySum += 1;
          })
        }
      }
      let title = null;
      if (data.type == 3) {
        title = `此次提交将预约 ${packageQuantitySum} 个包裹`;
      } else {
        title = `此次提交将提交 ${boxQuantitySum} 个货箱，包含 ${packageQuantitySum} 个包裹`;
      }
      return {
        title,
        boxQuantitySum,
        packageQuantitySum,
      };
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.isVisible = true;
      this.$nextTick(() => {
        this.$refs['collectionForm'].resetFields();
      })
    },
    handleFom() {
      this.$refs['collectionForm'].validate((valid) => {
        if (!valid) return;
        let introduceData = this.data;
        let rqApi = null;
        let paramsData = this.$common.copy(this.formData);
        if (introduceData.type == 3) {
          rqApi = 'packing_appointmentPickupOrder';
          let rowData = introduceData.data[0] || {};
          paramsData.saleAccountId = rowData.saleAccountId;
          paramsData.containerNumber = rowData.containerNumber;
          paramsData.trusteeshipType = rowData.trusteeshipType;
        } else {
          rqApi = 'packing_batchAppointmentPickupOrder';
          let temp = {};
          if (introduceData.type == 1) {
            temp.containerIds = introduceData.data.map((k) => k.containerId);
          } else {
            temp = introduceData.data;
          }
          paramsData = Object.assign(paramsData, temp);
        }
        paramsData.warehouseId = getWarehouseId();
        // console.log(paramsData, rqApi);
        this.loading = true;
        this.axios.post(api[rqApi], paramsData).then(({ data }) => {
          if (data.code !== 0) return;
          this.$Message.success('操作成功!');
          this.isVisible = false;
          this.$emit('refreshList');
        }).finally(() => {
          this.loading = false;
        })
      })
    },
  },
}
</script>
<style lang="less">
.collectionOrdersPage {
  .suffixTips {
    .ivu-input-suffix {
      display: flex;
      align-items: center;
    }
  }
}
</style>