<template>
  <div class="operate-button">
    <div class="operate-name" @click="openModal">首选供应商</div>
    <Modal
      v-model="modalVisible"
      width="80%"
      title="首选供应商"
      :mask-closable="false"
      class-name="operate-modal-content"
    >
      <div class="operate-modal-body">
        <Spin fix v-if="modalLoading"></Spin>
        <!-- <Form ref="modalFormRef" :model="modalFormData" :rules="modalFormRule" label-position="right" :label-width="0"></Form> -->
        <Table
          highlight-row
          border
          :height="550"
          :loading="tableLoading"
          :columns="tableColumn"
          :data="tableData"
          :span-method="handleSpan"
        />
      </div>
      <div slot="footer">
        <Button @click="modalVisible = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from "@/components/mixin/common_mixin";

export default {
  name: 'supplierChoose',
  mixins: [Mixin],
  props: {
    moduleData: {
      type: Object,
      default: () => {
        return {index: null, data: []};
      }
    }
  },
  data () {
    return {
      modalLoading: false,
      tableLoading: false,
      modalVisible: false,
      skuObj: {},
      tableData: [],
      tableColumn: [
        {
          key: "skuNo",
          align: "center",
          minWidth: 240,
          title: "产品SKU/产品名称",
          render: (h, params) => {
            return h("div", {
              style: {
                display: 'flex',
                'align-items': 'center',
              }
            }, [
              this.tableImg(h, params, "thumbUrl"),
              h('div', {
                style: {
                  'margin-left': '10px',
                  'text-align': 'left'
                }
              }, [
                h('div', {}, params.row.skuNo),
                h('div', {}, params.row.goodsName),
                h('div', {
                  style: {
                    color: "green",
                  },
                }, `${params.row.goodsColor}；${params.row.goodsSize}`),
              ])
            ])
          }
        },
        {
          key: "supplierDefaultSort",
          align: "center",
          width: 150,
          title: "首选供应商",
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.supplierDefaultSort)) return h('div', {}, '');
            if (row.supplierDefaultSort == 1) return h('div', {}, '首选供应商');
            return h('div', {}, `备选供应商${row.supplierDefaultSort}`);
          }
        },
        {
          key: "supplierName",
          align: "center",
          minWidth: 150,
          title: "供应商名称",
          render: (h, { row }) => {
            return h('div', {}, row.supplierName)
          }
        },
        {
          key: "operation",
          align: "center",
          width: 100,
          title: "操作",
          render: (h, { row }) => {
            return h('div', {
              style: {
                'color': '#00aaff',
                'cursor': 'pointer',
                'text-decoration': 'underline',
                'text-underline-position': 'under',
              },
              on: {
                click: () => {
                  this.confirmInfo(row);
                }
              }
            }, '选择此供应商')
          }
        }
      ],
    };
  },
  computed: {},
  watch: {
    modalVisible: {
      deep: true,
      immediate: true,
      handler (val) {
        if (val) return;
        this.closeModal();
      }
    }
  },
  created () {},
  mounted () {},
  methods: {
    // 打开弹窗
    openModal () {
      this.modalVisible = true;
      this.modalLoading = true;
      this.skuObj = {};
      this.moduleData.data.forEach(item => {
        if (this.$common.isEmpty(item.skuNo)) {
          if (!this.$common.isEmpty(item.sku)) {
            this.$set(this.skuObj, item.sku, item);
          }
        } else {
          this.$set(this.skuObj, item.skuNo, item);
        }
      });
      this.getSetDetails().finally(() => {
        this.modalLoading = false;
      });
    },
    // 关闭弹窗
    closeModal () {
      this.tableData = [];
      this.modalLoading = false;
      this.modalVisible = false;
    },
    // 获取信息
    getSetDetails () {
      return new Promise((resolve) => {
        this.tableData = [];
        this.axios.post(api.querySupplierGoodsAll, {
          skuList: Object.keys(this.skuObj),
          auditStatus: 3,
        }).then(res => {
          if (!res || !res.data || res.data.code != 0 || !res.data.datas) return resolve({ state: 'finally' });
          let listObj = {};
          let newList = [];
          // 以 sku 分组
          (res.data.datas || []).forEach(item => {
            if (this.$common.isEmpty(listObj[item.skuNo])) {
              listObj[item.skuNo] = [item];
            } else {
              listObj[item.skuNo].push(item);
            }
          });
          // 合并行处理
          Object.keys(listObj).forEach(key => {
            (listObj[key] || []).forEach((row, index) => {
              newList.push({
                ...row,
                sku: row.skuNo,
                rowSpan: index == 0 ? listObj[key].length : 0,
                colSpan: index == 0 ? 1 : 0
              })
            });
          });
          this.tableData = newList;
          resolve({ state: 'finally' });
        }).catch(() => {
          resolve({ state: 'finally' });
        })
      });
    },
    // 表格合并展示处理
    handleSpan({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        return { rowspan: row.rowSpan, colspan: row.colSpan };
      }
      return { rowspan: 1, colspan: 1 };
    },
    // 确定信息
    confirmInfo (row) {
      this.$emit('confirmHand', {index: this.moduleData.index, oldData: this.moduleData.data, data: this.$common.copy(row)});
      this.$nextTick(() => {
        this.modalVisible = false;
      });
    }
  }
};
</script>
<style lang="less" scoped>
.operate-button{
  display: inline-block;
  .operate-name{
    line-height: 1.4em;
    font-size: 12px;
    color: #00aaff;
    cursor: pointer;
    text-decoration: underline;
    text-underline-position: under;
  }
}
.operate-modal-body{
  .txt-error {
    color: #f20;
  }
  .mt60{
    margin-top: 60px;
  }
}
:deep(.operate-modal-content) {
  .ivu-modal{
    max-width: 1100px;
  }
}
</style>
