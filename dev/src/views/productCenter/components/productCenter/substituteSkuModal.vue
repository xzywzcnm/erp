<template>
  <Modal
    :title="modalTitle"
    v-model="modalVisible"
    width="600px"
    :mask-closable="false"
  >
    <div class="modal-main-clas">
      <Form ref="modalForm" :model="fromData" :rules="fromRule" :label-width="95">
        <Form-item label="替代SKU" prop="replaceSku">
          <Input
            :clearable="true"
            :autofocus="true"
            v-model.trim="fromData.replaceSku"
            placeholder="请输入替代SKU"
            :disabled="!isEdit"
          />
        </Form-item>
        <Form-item label="被替代SKU" prop="beReplaceSkus">
          <Input
            type="textarea"
            :clearable="true"
            v-model.trim="fromData.beReplaceSkus"
            :autosize="{ minRows: 4, maxRows: 6 }"
            placeholder="请输入被替代SKU，多个用逗号或回车进行分隔"
            :disabled="!isEdit"
          />
        </Form-item>
        <div>
          <span style="color:#f20;">注意：</span>
          被替代SKU会在订单匹配商品SKU发货时，自动使用替代SKU进行匹配并发货。若替代SKU库存不足，则会在订单管理系统中进入异常订单页面，并标记失败类型为：缺货。
          此时可在商品管理系统中搜索替代/被替代SKU，并在SKU视图中删除该设置，即可恢复正常。
        </div>
        <Spin v-if="loading" fix></Spin>
      </Form>
    </div>
    <div slot="footer">
      <Button @click="modalVisible = false">取 消</Button>
      <Button @click="removeInfo" type="error" :loading="loading" v-if="!isAdd">删除该设置</Button>
      <Button
        @click="confirmInfo"
        type="primary"
        :loading="loading"
        v-if="isEdit"
        :disabled="isDisabledSave"
      >{{ isDisabledSave ? '和已有数据一致，无需再次确认' : '确 认'}}</Button>
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
        return {}
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
        replaceSku: '',
        beReplaceSkus: '',
        productGoodsId: '',
        replaceGoodsId: ''
      },
      fromRule: {
        replaceSku: [
          { required: true, validator: this.validateCheckStr, maxLength: 25, msg: '请输入替代SKU', trigger: 'change' },
          { required: true, validator: this.validateCheckStr, maxLength: 25, msg: '请输入替代SKU', trigger: 'blur' }
        ],
        beReplaceSkus: [
          { required: true, validator: this.validateCheckStr, maxLength: 250, split: true, msg: '请输入被替代SKU', trigger: 'change' },
          { required: true, validator: this.validateCheckStr, maxLength: 250, split: true, msg: '请输入被替代SKU', trigger: 'blur' }
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
    isAdd () {
      return this.$common.isEmpty(this.moduleData);
    },
    // 弹窗标题
    modalTitle () {
      if (this.isAdd) return '新增替代SKU';
      return '设置替代SKU';
    },
    isEdit () {
      if (!this.isAdd) return !this.$common.isEmpty(this.moduleData.productGoodsId);
      return this.isAdd;
    },
    // 是否禁用保存按钮
    isDisabledSave () {
      return false;
      // if (!this.isEdit) return true;
      // let beReplaceSkus = [];
      // let replaceSku = '';
      // let skUalike = true;
      // if (!this.$common.isEmpty(this.moduleData.replaceRelVO)) {
      //   beReplaceSkus = (this.moduleData.replaceRelVO.productSku || []).map(item => {
      //     return item.trim();
      //   });
      //   replaceSku = this.moduleData.replaceRelVO.replaceSku;
      // }
      // if (this.$common.isEmpty(this.fromData.replaceSku) && this.$common.isEmpty(replaceSku)) {
      //   skUalike = true;
      // } else if (!this.$common.isEmpty(this.fromData.replaceSku) && !this.$common.isEmpty(replaceSku)) {
      //   skUalike = this.fromData.replaceSku.trim() == replaceSku.trim();
      // }
      // const formReplace = this.$common.split(this.fromData.beReplaceSkus, [',', '，', '\n'], true);
      // const alikeSku = (formReplace || []).filter(item => {
      //   return beReplaceSkus.includes(item.trim())
      // });
      // return skUalike && formReplace.length > 0 && alikeSku.length == formReplace.length && alikeSku.length == beReplaceSkus.length;
    }
  },
  created () {},
  mounted () {},
  methods: {
    // 初始化数据
    initData () {
      this.oldFromData = this.$common.copy(this.fromData);
      if (this.isAdd || !this.isEdit) return;
      this.fromData.productGoodsId = this.moduleData.productGoodsId;
      if (this.$common.isEmpty(this.moduleData.replaceGoodsId)) return;
      this.fromData.replaceGoodsId = this.moduleData.replaceGoodsId;
      if (this.$common.isEmpty(this.moduleData.replaceRelVO)) return;
      this.fromData.replaceSku = this.moduleData.replaceRelVO.replaceSku;
      this.fromData.beReplaceSkus = (this.moduleData.replaceRelVO.productSku || []).join(',');
    },
    // 确认保存
    confirmInfo () {
      if (!this.isEdit || this.loading || this.isDisabledSave) return;
      this.$refs.modalForm.validate((valid) => {
        if (!valid) return;
        this.loading = false;
        let params = this.$common.copy(this.fromData);
        if (this.$common.isEmpty(this.moduleData)) {
          delete params.productGoodsId;
          delete params.replaceGoodsId;
        } else {
          params.originalReplaceSku = this.moduleData.replaceRelVO.replaceSku;
          params.originalBeReplaceSkus = this.moduleData.replaceRelVO.productSku;
        }
        params.replaceSku = params.replaceSku.trim();
        // 处理下被替代sku字符串
        params.beReplaceSkus = this.$common.split(params.beReplaceSkus, [',', '，', '\n'], true).map(item => item.trim()).join(',');
        this.axios.post(api.setReplaceSku, params).then((res) => {
          if (!res || !res.data || res.data.code != 0) return;
          this.$Message.success('操作成功！');
          this.$emit('updateList');
          this.modalVisible = false;
        }).finally(() => {
          this.loading = false;
        })
      })
    },
    // 删除设置
    removeInfo () {
      if (!this.isEdit || this.loading) return;
      this.loading = true;
      this.axios.delete(`${api.removeReplaceSku}${this.fromData.replaceGoodsId}`, {
        data: {
          originalReplaceSku: this.moduleData.replaceRelVO.replaceSku,
          originalBeReplaceSkus: this.moduleData.replaceRelVO.productSku
        }
      }).then((res) => {
        if (!res || !res.data || res.data.code != 0) return;
        this.$Message.success('操作成功！');
        this.$emit('updateList');
        this.modalVisible = false;
      }).finally(() => {
        this.loading = false;
      })
    },
    // 关闭弹窗时，重置数据
    closeModal () {
      this.loading = false;
      this.fromData = this.$common.copy(this.oldFromData);
      this.$nextTick(() => {
        this.$refs.modalForm && this.$refs.modalForm.resetFields();
        setTimeout(() => {
          this.$refs.modalForm && this.$refs.modalForm.resetFields();
        }, 300)
      })
    },
    // 验证
    validateCheckStr (rule, value, callback) {
      this.$nextTick(() => {
        let newVal = value;
        if (this.$common.isEmpty(newVal)) {
          newVal = this.fromData[rule.field];
        }
        if (rule.split) {
          newVal = this.$common.isEmpty(newVal) ? '' : this.$common.split(newVal, [',', '，', '\n'], true).join('');
        }
        this.$common.strMaxVerify(rule, newVal, callback);
      })
    }
  }
};
</script>
<style lang="less" scoped>
.modal-main-clas{
  position: relative;
}
</style>
