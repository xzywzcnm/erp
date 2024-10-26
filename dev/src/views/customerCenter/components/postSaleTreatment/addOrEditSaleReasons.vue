<template>
  <Modal
    v-model="modalVisible"
    :title="modalTitle"
    @on-visible-change="visibleChange"
  >
    <Form ref="pageParamsFrom" :model="fromData" :rules="ruleValidate" :label-width="80">
      <FormItem label="售后原因: " prop="paramKey">
        <dyt-input
          type="textarea"
          v-model="fromData.paramKey"
          placeholder="请輸入售后原因"
          :autosize="{minRows: 4, maxRows: 8}"
        />
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="primary" @click="saveData">确 定</Button>
      <Button style="margin-right: 10px;" @click="cancel">取 消</Button>
    </div>
  </Modal>
</template>

<script>
import api from "@/api/api";

export default {
  components: {},
  props: {
    visible: { type: Boolean, default: false },
    moduleData: {
      type: Object,
      default: () => { return {} }
    }
  },
  data () {
    return {
      fromData: {
        erpCommonSettingParamId: '',
        paramKey: ''
      },
      modalTitle: '新建',
      modalVisible: false,
      ruleValidate: {
        paramKey: [
          { validator: this.validateParamKey, trigger: 'blur' },
          { validator: this.validateParamKey, trigger: 'change' },
        ]
      }
    };
  },
  watch: {
    visible: {
      deep: true,
      immediate: true,
      handler (val) {
        this.modalVisible = val;
        this.$nextTick(() => {
          val && this.init();
        })
      }
    },
    modalVisible: {
      deep: true,
      handler (val) {
        this.$emit('update:visible', val);
      }
    }
  },
  computed: {},
  mounted () {},
  activated () {},
  methods: {
    // 初始数据
    init () {
      this.modalTitle = this.moduleData.erpCommonSettingParamId ? '编辑' : '新建';
      Object.keys(this.fromData).forEach(key => {
        if (typeof this.moduleData[key] !== 'undefined') {
          this.fromData[key] = this.moduleData[key];
        }
      })
    },
    // 保存数据
    saveData () {
      this.$refs.pageParamsFrom.validate((valid) => {
        if (!valid) return;
        const isInsert = this.$common.isEmpty(this.fromData.erpCommonSettingParamId);
        this.axios[isInsert ? 'post' : 'put'](api.saleReasonsTreatment[isInsert ? 'insert' : 'update'], this.fromData).then(res => {
          if (res.data && res.data.code === 0) {
            this.modalVisible = false;
            this.$Message.success('操作成功!');
            this.$emit('searchData', false);
          }
        })
      })
    },
    // 关闭弹窗
    cancel () {
      this.modalVisible = false;
    },
    // 弹窗状态改变
    visibleChange (val) {
      if (val) return;
      this.fromData = {
        erpCommonSettingParamId: '',
        paramKey: ''
      }
    },
    validateParamKey (rule, value, callback) {
      if (value.length > 25) {
        callback(new Error('最多只能输入 25 个字符！'));
        return;
      }
      callback();
    }
  }
};
</script>
