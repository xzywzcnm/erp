<template >
  <Modal v-model="pageVisible" title="复制物流规则" :mask-closable="false" width="800">
    <Spin v-if="pageLoading" fix></Spin>
    <div class="modal-body-main copy-rule-modal">
      <Form
        ref="formRefDemo"
        label-position="right"
        :model="formData"
        :rules="ruleValidate"
        :label-width="100"
        class="modal-form-main"
      >
        <div class="flex-main form-row-item">
          <Form-item label="原有仓库：" style="padding-right: 15px; flex: 70;">
            {{ chooseWarehouse.title }}
          </Form-item>
          <Form-item label="复制规则至新仓库：" prop="warehouseId" :label-width="150">
            <dyt-select v-model="formData.warehouseId">
              <template v-for="(item, index) in warehouseListData">
                <Option
                  v-if="chooseWarehouse.warehouseId != item.warehouseId"
                  :value="item.warehouseId"
                  :key="`${item.warehouseId}-${index}`"
                  :label="item.title"
                />
              </template>
            </dyt-select>
          </Form-item>
        </div>
        <Table
          ref="tableModalRef"
          highlight-row
          border
          :columns="tableColumn"
          :data="formData.tableData"
          :max-height="500"
          class="table"
        >
          <template slot-scope="{ row, index }" slot="newRuleName">
            <Form-item
              label=""
              :prop="`tableData.${index}.newRuleName`"
              :label-width="0"
              :rules="validateRuleName"
            >
              <dytInput v-model="formData.tableData[index].newRuleName" placeholder="请输入规则名称" />
            </Form-item>
          </template>
        </Table>
      </Form>
    </div>
    <div slot="footer" class="copy-rule-modal-footer">
      <div style="font-size: 18px;font-weight: bold;">
        此处复制的规则条数<span style="margin: 0 5px; color: #f20;">{{ formData.tableData.length }}</span>条
      </div>
      <div>
        <Button type="primary" @click="modalConfirm" :disabled="pageLoading">确定</Button>
        <Button @click="closeModal">取消</Button>
      </div>
    </div>
  </Modal>
</template>
<script>
import api from '@/api/api';

export default {
  name: 'ruleSortModal',
  props: {
    modelVisible: { type: Boolean, default: false },
    modelData: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      pageLoading: true,
      pageVisible: false,
      // 表单数据
      formData: {
        warehouseId: '',
        tableData: [],
      },
      // 表单验证规则
      ruleValidate: {
        warehouseId: [
          { required: true, validator: this.validatorWarehouse, msg: '请选择新仓库', trigger: 'change' }
        ]
      },
      validateRuleName: [
        { required: true, validator: this.validatorRuleName, msg: '请输入规则名称', trigger: 'change' },
        { required: true, validator: this.validatorRuleName, msg: '请输入规则名称', trigger: 'blur' }
      ],
      // 表格列设置
      tableColumn: [
        {
          title: '原仓库规则名称',
          minWidth: 100,
          align: 'center',
          key: 'oldRuleName',
          render: (h, { row }) => {
            return h('span', {
              class: 'table-col-text',
              style: {
                'white-space': 'pre-wrap'
              }
            }, row.oldRuleName || '')
          }
        },
        {
          title: '新仓库规则名称',
          minWidth: 100,
          align: 'center',
          slot: 'newRuleName'
        },
      ]
    }
  },
  watch: {
    modelVisible: {
      deep: true,
      immediate: true,
      handler (newVal) {
        this.pageVisible = newVal;
        if (!newVal) return;
        this.pageLoading = true;
        this.$nextTick(() => {
          setTimeout(() => {
            this.initData();
          }, 300)
        })
      }
    },
    pageVisible: {
      deep: true,
      handler (newVal) {
        this.$emit('update:modelVisible', newVal);
        if (newVal) return;
        this.resetData();
      }
    },
  },
  computed: {
    // 仓库数据
    warehouseListData () {
      if (this.$common.isEmpty(this.modelData) || this.$common.isEmpty(this.modelData.warehouseData)) return [];
      return this.modelData.warehouseData;
    },
    // 选中的仓库
    chooseWarehouse () {
      if (this.$common.isEmpty(this.modelData) || this.$common.isEmpty(this.modelData.chooseWareId)) return {};
      if (this.$common.isEmpty(this.warehouseListData)) return {};
      const warehouseInfo = this.warehouseListData.find(f => f.warehouseId == this.modelData.chooseWareId);
      return warehouseInfo;
    },
    // 选中的规则
    ruleData () {
      if (this.$common.isEmpty(this.modelData) || this.$common.isEmpty(this.modelData.rule)) return [];
      return this.modelData.rule.map(m => {
        return { ...m, oldRuleName: m.name, newRuleName: `${m.name}(0)` }
      });
    }
  },
  methods: {
    // 初始化页面数据
    initData () {
      this.$refs.formRefDemo && this.$refs.formRefDemo.resetFields();
      this.formData.tableData = [];
      this.$nextTick(() => {
        this.pageLoading = false;
        this.formData.tableData = this.$common.copy(this.ruleData);
      })
    },
    // 重置数据
    resetData () {
      this.$refs.formRefDemo && this.$refs.formRefDemo.resetFields();
      this.pageLoading = true;
    },
    // 关闭弹窗
    closeModal () {
      this.pageVisible = false;
    },
    // 验证规则名称
    validatorRuleName (rule, value, callback) {
      this.$nextTick(() => {
        let field = rule.field.split('.');
        if (field.length != 3) return callback();
        const rowIndex = Number(field[1]);
        if (this.$common.isEmpty(rowIndex)) return callback();
        const row = this.formData.tableData[rowIndex];
        this.$common.strMaxVerify(rule, (row[field[2]] || '').trim(), callback);
      });
    },
    // 验证仓库
    validatorWarehouse (rule, value, callback) {
      this.$nextTick(() => {
        this.$common.formItemVerify(rule, this.formData[rule.field], callback);
      })
    },
    // 确定
    modalConfirm () {
      if (this.pageLoading) return;
      this.$refs.formRefDemo.validate((valid) => {
        if (!valid) return this.$common.inputFocus('.copy-rule-modal');
        this.pageLoading = true;
        const temporaryData = this.$common.copy(this.formData);
        const newVal = (temporaryData.tableData || []).map(item => {
          return {
            autoRuleId: item.autoRuleId,
            name: (item.newRuleName || '').trim(),
            businessId: temporaryData.warehouseId
          }
        });
        this.axios.post(api.batchOrderAutoRuleCopy, {
          copyAutoRuleActionBoList: newVal
        }).then(res => {
          if (res && res.data && res.data.code == 0) {
            this.$Message.success('复制操作成功！');
            this.$emit('copyRule', { state: 'success' });
            this.$nextTick(() => {
              this.pageVisible = false;
            })
          } else {
            this.$emit('copyRule', { state: 'fail' });
          }
          this.pageLoading = false;
        }).catch(() => {
          this.pageLoading = false;
          this.$emit('copyRule', { state: 'fail' });
        })
      })
    },
  }
};
</script>
<style lang="less" scoped>
.modal-body-main{
  position: relative;
  .modal-form-main{
    .form-row-item{
      :deep(.ivu-form-item) {
        flex: 100;
      }
    }
    :deep(.ivu-form-item) {
      &.not-margin-bottom{
        margin: 0;
      }
      .ivu-form-item-label{
        font-size: 14px;
        padding-right: 5px;
      }
    }
  }
  .flex-main{
    display: flex;
  }
  :deep(.ivu-table) {
    .ivu-form-item{
      margin-bottom: 0;
    }
    .ivu-form-item-error-tip{
      display: none;
    }
    .table-col-text{
      display: inline-block;
      margin: 0 auto;
      text-align: left;
    }
  }
}
.copy-rule-modal-footer{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
