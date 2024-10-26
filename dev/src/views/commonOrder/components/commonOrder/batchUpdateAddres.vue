<template>
  <Modal
    title="批量修改地址"
    class="batch-update-addres"
    v-model="modalVisible"
    width="800px"
  >
    <Form ref="batchRemarkForm" :model="fromData" :rules="fromRule" :label-width="80">
      <FormItem label="收件人" prop="buyerName">
        <dytInput
          v-model="fromData.buyerName"
          :disabled="loading"
          placeholder="请输入收件人名称, 最多 200 字符"
        />
      </FormItem>
      <FormItem label="手机号" prop="buyerMobile">
        <dytInput
          v-model="fromData.buyerMobile"
          :disabled="loading"
          placeholder="请输入手机号"
        />
      </FormItem>
      <FormItem label="电话号码" prop="buyerPhone">
        <dytInput
          v-model="fromData.buyerPhone"
          :disabled="loading"
          placeholder="请输入电话号码"
        />
      </FormItem>
      <FormItem label="邮箱" prop="buyerEmail">
        <dytInput
          v-model="fromData.buyerEmail"
          :disabled="loading"
          placeholder="请输入邮箱"
        />
      </FormItem>
      <FormItem label="详细地址1" prop="buyerAddress1">
        <dytInput
          v-model="fromData.buyerAddress1"
          :disabled="loading"
          placeholder="请输入详细地址1"
        />
      </FormItem>
      <FormItem label="详细地址2" prop="buyerAddress2">
        <dytInput
          v-model="fromData.buyerAddress2"
          :disabled="loading"
          placeholder="请输入详细地址2"
        />
      </FormItem>
      <div class="form-item-row">
        <FormItem label="城市" prop="buyerCity">
          <dytInput
            v-model="fromData.buyerCity"
            :disabled="loading"
            placeholder="城市"
          />
        </FormItem>
        <FormItem label="省份" prop="buyerState">
          <dytInput
            v-model="fromData.buyerState"
            :disabled="loading"
            placeholder="省份"
          />
        </FormItem>
        <FormItem label="邮编" prop="buyerPostalCode">
          <dytInput
            v-model="fromData.buyerPostalCode"
            :disabled="loading"
            placeholder="邮编"
          />
        </FormItem>
      </div>
      <FormItem label="所在地" prop="buyerCountryCode">
        <dyt-select
          ref="countryRegion"
          v-model="fromData.buyerCountryCode"
          filterable
          placeholder="请选择所在地"
        >
          <Option
            v-for="item in country"
            :key="item.countryId"
            :value="item.twoCode"
          >{{ item.enName }}</Option>
        </dyt-select>
      </FormItem>
      <FormItem label="买家识别码" prop="buyerPassportCode">
        <dytInput
          v-model="fromData.buyerPassportCode"
          :disabled="loading"
          placeholder="请输入买家识别码"
        />
      </FormItem>
      <Spin v-if="loading" fix></Spin>
    </Form>
    <div slot="footer">
      <Button @click="modalVisible = false">取 消</Button>
      <Button @click="confirm" type="primary" :loading="loading">确 认</Button>
    </div>
  </Modal>
</template>
<script>
// import api from '@/api/api';

export default {
  name: 'batchUpdateAddresModal',
  components: {},
  props: {
    moduleVisible: { type: Boolean, default: false },
    country: {
      type: Array,
      default: () => {
        return []
      }
    },
    moduleData: {
      type: Object,
      default: () => {
        return {
          filterParams: {},
          url: ''
        }
      }
    }
  },
  data () {
    return {
      modalVisible: false,
      loading: false,
      fromData: {
        buyerCity: null, // 买家的城市
        buyerState: null, // 省份
        buyerCountryCode: null, // 地区(国家)
        buyerPostalCode: null, // 邮编
        buyerPhone: null, // 收件人电话
        buyerPassportCode: null, // 买家护照编码（买家识别码）
        buyerName: null, // 收件人姓名
        buyerMobile: null, // 收件人手机
        buyerEmail: null, // 买家email
        buyerAddress1: null, // 买家主要地址1
        buyerAddress2: null // 买家主要地址2
      },
      fromRule: {
        buyerEmail: [
          { validator: this.validateStr50, label: '邮箱', trigger: 'change' },
          { validator: this.validateStr50, label: '邮箱', trigger: 'blur' }
        ],
        buyerPostalCode: [
          { validator: this.validateStr20, label: '邮编', trigger: 'change' },
          { validator: this.validateStr20, label: '邮编', trigger: 'blur' }
        ],
        buyerState: [
          { validator: this.validateStr20, label: '省份', trigger: 'change' },
          { validator: this.validateStr20, label: '省份', trigger: 'blur' }
        ],
        buyerCity: [
          { validator: this.validateStr20, label: '城市', trigger: 'change' },
          { validator: this.validateStr20, label: '城市', trigger: 'blur' }
        ],
        buyerAddress1: [
          { validator: this.validateStr200, label: '详细地址1', trigger: 'change' },
          { validator: this.validateStr200, label: '详细地址1', trigger: 'blur' }
        ],
        buyerAddress2: [
          { validator: this.validateStr200, label: '详细地址2', trigger: 'change' },
          { validator: this.validateStr200, label: '详细地址2', trigger: 'blur' }
        ],
        buyerPassportCode: [
          { validator: this.validateStr50, label: '买家识别号', trigger: 'change' },
          { validator: this.validateStr50, label: '买家识别号', trigger: 'blur' }
        ],
        buyerPhone: [
          { validator: this.validateStr50, label: '电话号码', trigger: 'change' },
          { validator: this.validateStr50, label: '电话号码', trigger: 'blur' }
        ],
        buyerMobile: [
          { validator: this.validateStr200, label: '手机号', trigger: 'change' },
          { validator: this.validateStr200, label: '手机号', trigger: 'blur' }
        ],
        buyerName: [
          { validator: this.validateStr200, label: '收件人', trigger: 'change' },
          { validator: this.validateStr200, label: '收件人', trigger: 'blur' }
        ]
      },
      oldFromData: {}
    }
  },
  watch: {
    moduleVisible: {
      deep: true,
      immediate: true,
      handler (val) {
        this.modalVisible = val;
        this.$nextTick(() => {
          val && this.initData();
        })
      }
    },
    modalVisible: {
      deep: true,
      handler (val) {
        this.$emit('update:moduleVisible', val);
        this.$nextTick(() => {
          !val && this.closeModal();
        })
      }
    }
  },
  computed: {
    upateUrl () {
      return this.moduleData.url;
    },
    filterParams () {
      return this.moduleData.filterParams;
    }
  },
  created () {},
  mounted () {},
  methods: {
    // 初始化数据
    initData () {
      this.oldFromData = this.$common.copy(this.fromData);
    },
    // 确认保存
    confirm () {
      if (this.loading) return;
      this.$refs.batchRemarkForm.validate((valid) => {
        if (!valid) return;
        this.loading = true;
        this.axios.post(this.upateUrl, {
          ...this.filterParams,
          ...this.fromData
        }).then((res) => {
          this.loading = false;
          if (res && res.data) {
            if (res.data.code === 0) {
              this.$Message.success("操作成功");
              this.modalVisible = false;
              this.$emit('updateList');
            } else if (res.data.code === 999997) {
              this.$Message.error(res.data.message || '');
            }
          }
        }).catch(() => {
          this.loading = false;
        })
      })
    },
    // 关闭弹窗时，重置数据
    closeModal () {
      this.fromData = this.$common.copy(this.oldFromData);
      this.$nextTick(() => {
        this.$refs.batchRemarkForm.resetFields();
      })
    },
    // 验证
    validateStr20 (rule, value, callback) {
      if (!this.$common.isEmpty(value) && value.length > 20) {
        callback(new Error(`${rule.label || ''}最多可输入 20 字符`));
        return;
      }
      callback();
    },
    // 验证
    validateStr50 (rule, value, callback) {
      if (!this.$common.isEmpty(value) && value.length > 50) {
        callback(new Error(`${rule.label || ''}最多可输入 50 字符`));
        return;
      }
      callback();
    },
    // 验证
    validateStr200 (rule, value, callback) {
      if (!this.$common.isEmpty(value) && value.length > 200) {
        callback(new Error(`${rule.label || ''}最多可输入 200 字符`));
        return;
      }
      callback();
    }
  }
};
</script>
<style lang="less" scoped>
.batch-update-addres{
  position: relative;
}
.form-item-row{
  display: flex;
  align-items: center;
}
</style>
