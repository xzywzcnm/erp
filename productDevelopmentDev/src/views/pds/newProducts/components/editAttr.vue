<template>
  <Modal v-model="isVisible" title="增加多属性商品" :mask-closable="false">
    <div class="form-contain">
      <Table :columns="columns" :data="tableList" border highlight-row maxHeight="200" @on-selection-change="selectChange" ref="iviewTable"></Table>
    </div>
    <div slot="footer">
      <Button @click="isVisible = false">取消</Button>
      <Button type="primary" @click="handleSubmit()" :loading="loading">确定</Button>
    </div>
  </Modal>
</template>
<script>

// import api from '@/api/api.js';
export default {
  name: "editAttr",
  components: {},
  data () {
    return {
      isVisible: false,
      tableList: [],
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '尺寸/型号',
          key: 'sizeOrModelName',
          minWidth: 90,
        },
        {
          title: '颜色/属性',
          key: 'color',
          minWidth: 90,
        },
      ],
      loading: false,
      columnList: "",
    };
  },
  props: {
    modelVisible: {
      type: Boolean,
      default () { return false }
    },
    attrList: {
      type: Array,
      default () {
        return [];
      }
    },
    selectedList: {
      type: Array,
      default () {
        return [];
      }
    }
  },
  watch: {
    modelVisible (newVal) {
      if (newVal) this.open();
    },
    isVisible (newVal) {
      if (!newVal) this.$emit('update:modelVisible', false);
    },
  },
  methods: {
    // 打开窗口
    open () {
      this.isVisible = this.modelVisible;
      let tableArr = JSON.parse(JSON.stringify(this.attrList));
      let list = this.selectedList.map(k => {
        return k.quotationId;
      })
      tableArr.forEach((k, i) => {
        list.includes(k.quotationId) ? tableArr[i]._checked = true : '';
      })
      this.tableList = tableArr;
    },
    handleSubmit () {
      this.isVisible = false
      if (!this.columnList) this.columnList = this.tableList
      this.$emit("changeAttr", this.columnList)
    },
    // 表格多项选择
    selectChange (list) {
      // console.log(list)
      this.columnList = list;

    },
  }
};
</script>
<style lang="less" scoped></style>