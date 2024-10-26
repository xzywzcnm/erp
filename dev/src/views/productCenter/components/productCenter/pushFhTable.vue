<template>
  <Modal v-model="pageVisible" title="选择部位/量法" :mask-closable="false" width="800px">
    <div class="modal-contain">
      <div class="filter-contain">
        <Form ref="formValidate" :model="formData" :rules="ruleValidate" :label-width="100" class="form-contain-item">
          <FormItem label="款式名称:" prop="styleName">
            <Input v-model="formData.partName" placeholder="请输入部位名称" clearable />
          </FormItem>
        </Form>
        <div class="btn-group">
          <Button type="primary" @click="searchList" :loading="loading">查询</Button>
        </div>
      </div>
      <Table :columns="columns" :data="tableViewData" @on-selection-change="tableCheckChange" border highlight-row />
      <Spin v-if="loading" fix></Spin>
    </div>
    <div slot="footer">
      <Button @click="pageVisible = false">取消</Button>
      <Button type="primary" @click="handleSubmit" :loading="loading">确定</Button>
    </div>
  </Modal>
</template>

<script>
// import api from '@/api/api.js';
export default {
  name: 'addColor',
  data () {
    return {
      pageVisible: false,
      tableData: [],
      tableViewData: [],
      checkedTableData: [],
      loading: false,
      formData: {
        partName: '',
      },
      ruleValidate: {},
      columns: [
        {
          type: 'selection',
          width: 50,
          key: 'selection',
          align: 'center'
        },
        {
          title: '部位名称',
          key: 'cnName',
          minWidth: 90,
          align: 'center'
        },
        {
          title: '量法',
          key: 'measurementDescription',
          minWidth: 120,
          align: 'center',
          render: (h, { row }) => {
            return h('div', {
              style: {
                'text-align': 'left'
              }
            }, row.measurementDescription);
          }
        },
      ]
    };
  },
  props: {
    modelVisible: { type: Boolean, default: false },
    modelData: {
      type: Object,
      default () {
        return {
          fhTableData: [],
          tableData: []
        }
      }
    }
  },
  watch: {
    modelVisible: {
      handler (newVal) {
        this.pageVisible = newVal;
        if (!newVal) return;
        this.$nextTick(() => {
          this.initData();
        })
      },
      deep: true,
      immediate: true
    },
    pageVisible: {
      deep: true,
      handler (newVal) {
        this.$emit('update:modelVisible', newVal);
        if (newVal) return;
        this.resetData();
      },

    },
  },
  methods: {
    // 初始化数据
    initData () {
      // this.loading = true;
      const partIds = (this.modelData.fhTableData || []).map(m => m.positionId);
      this.tableData = (this.modelData.tableData || []).filter(item => !partIds.includes(item.partId));
      this.tableViewData = this.$common.copy(this.tableData);
    },
    // 过滤列表
    searchList () {
      const list = this.$common.copy(this.tableData);
      const partName = this.formData.partName.trim();
      if (this.$common.isEmpty(partName)) {
        this.tableViewData = list;
        return;
      }
      this.tableViewData = list.filter(row => {
        return row.cnName.includes(partName)
      })
    },
    // 重置数据
    resetData () {
      this.tableData = [];
      this.tableViewData = [];
      this.checkedTableData = [];
      this.loading = false;
    },
    // 确定
    handleSubmit () {
      if (this.$common.isEmpty(this.checkedTableData)) {
        return this.$Message.error('请选择数据!');
      }
      this.$emit('confirm', this.checkedTableData);
      this.$nextTick(() => {
        this.pageVisible = false;
      })
    },
    // 选中数据改变
    tableCheckChange (val) {
      this.checkedTableData = this.$common.copy(val);
    }
  }
};
</script>

<style lang="less" scoped>
.modal-contain{
  position: relative;
  .filter-contain{
    display: flex;
    .form-contain-item{
      :deep(.ivu-form-item){
        width: 400px;
      }
    }
    .btn-group{
      margin-left: 10px;
      width: 100px;
    }
  }
  :deep(.ivu-table-column-center) {
    .ivu-table-cell{
      &:first-child {
        padding: 8px;
        white-space: initial;
        word-break: break-word;
        text-overflow: initial;
        overflow: initial;
      }
    }
  }
}
</style>
