<template>
  <Modal
    title="批量编辑质检类型比例"
    class="batch-update-checkType"
    v-model="modalVisible"
    width="600px"
  >
    <Form ref="batchCheckTypeForm" :model="fromData" :rules="fromRule" :label-width="80">
      <Form-item label="质检类型" prop="checkType" style="display: inline-block;">
        <RadioGroup v-model="fromData.checkType">
          <Radio label="0">免检</Radio>
          <Radio label="2">全检</Radio>
          <Radio label="1">抽检</Radio>
        </RadioGroup>
      </Form-item>
      <Form-item label="质检比例(%)" prop="checkRate" style="display: inline-block;">
        <Input
          :disabled="![1, '1'].includes(fromData.checkType)"
          v-model.trim="fromData.checkRate"
          placeholder="请输入质检比例"
        />
      </Form-item>
      <Spin v-if="loading" fix></Spin>
    </Form>
    <div slot="footer">
      <Button @click="modalVisible = false">取 消</Button>
      <Button @click="confirm" type="primary" :loading="loading">确 认</Button>
    </div>
  </Modal>
</template>
<script>
import api from '@/api/api';

export default {
  name: 'batchRemarkModal',
  components: {},
  props: {
    moduleVisible: { type: Boolean, default: false },
    spuTotal: { type: Number, default: null },
    moduleData: {
      type: Object,
      default: () => {
        return {
          row: []
        }
      }
    },
    selectAll: {
      type: Boolean,
      default: false
    },
    getListQuery: {
      type: Function,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      modalVisible: false,
      loading: false,
      fromData: {
        checkType: '0',
        checkRate: '0'
      },
      fromRule: {
        checkRate: [
          { validator: this.validateCheckRate, trigger: 'change' },
          { validator: this.validateCheckRate, trigger: 'blur' }
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
    },
    // 类型改变时
    'fromData.checkType': {
      deep: true,
      handler (val) {
        if ([0, '0'].includes(val)) {
          this.$set(this.fromData, 'checkRate', '0');
          return;
        }
        if ([1, '1'].includes(val)) {
          const rate = Number(this.fromData.checkRate);
          const lastRate = this.$common.isEmpty(rate) ? '1' : rate > 1 && rate < 100 ? Math.floor(rate).toString() : '1';
          this.$set(this.fromData, 'checkRate', lastRate);
          return;
        }
        if ([2, '2'].includes(val)) {
          this.$set(this.fromData, 'checkRate', '100');
        }
      }
    }
  },
  computed: {},
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
      this.$refs.batchCheckTypeForm.validate((valid) => {
        if (!valid) return;

        let params = {
          checkRate: this.fromData.checkRate,
          checkType: this.fromData.checkType,
        };
        if (this.selectAll === true) {
          params = {
            ...(this.getListQuery()),
            ...params,
            selectAll: 1
          }
        } else {
          params = {
            ...params,
            selectAll: 0,
            setCheckQOList: this.moduleData.row.map(m => {
              return {
                productId: m.productId,
                checkRate: this.fromData.checkRate,
                checkType: this.fromData.checkType
              }
            })
          }
        }
        this.$Modal.confirm({
          title: '确认是否批量修改数据？',
          content: `这次修改数据：${this.selectAll === true ? this.spuTotal : params.setCheckQOList.length} 条`,
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            this.loading = true;
            this.axios.post(api.uptate_checkType, params).then((res) => {
              this.loading = false;
              if (res && res.data && res.data.code === 0) {
                this.$Message.success("操作成功");
                this.modalVisible = false;
                this.$emit('updateList');
              }
            }).catch(() => {
              this.loading = false;
            })
            // this.$Modal.remove();
          }
        })
      })
    },
    // 关闭弹窗时，重置数据
    closeModal () {
      this.fromData = this.$common.copy(this.oldFromData);
      this.$nextTick(() => {
        this.$refs.batchCheckTypeForm.resetFields();
      })
    },
    // 验证质检比例
    validateCheckRate (rule, value, callback) {
      if (![1, '1'].includes(this.fromData.checkType)) {
        return callback();
      }
      if (this.$common.isEmpty(value, true)) {
        return callback(new Error('请输入质检比例'));
      }
      const re = /^[0-9]+$/;
      if (!re.test(value)) {
        return callback(new Error('请输入 1 - 99 之间的整数'));
      }
      const rate = Number(value);
      if (rate < 1 || rate > 99) {
        return callback(new Error('请输入 1 - 99 之间的整数'));
      }
      callback();
    }
  }
};
</script>
<style lang="less" scoped>
.batch-update-checkType{
  position: relative;
}
</style>
