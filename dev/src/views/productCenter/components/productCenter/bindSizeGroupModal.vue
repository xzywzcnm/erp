<template>
  <div>
    <Modal
      v-model="isVisible"
      title="绑定尺码组"
      :mask-closable="false"
      :closable="false"
      width="80%"
      class-name="bindSizeGroupModal"
    >
      <div class="modal-body-main">
        <div class="product-size">
          商品使用尺码组：{{ productSize.join('、') }}
        </div>
        <Table :columns="columns" :data="tableData" :border="true"></Table>
        <div class="size-tips">
          <span class="notice-tips">注意：</span>
          尺码组一旦绑定无法更换。商品使用尺码组与选择绑定的尺码组未匹配的尺码，将不可用。后续新增多属性时，不可用的尺码不会再生成该尺码的多属性信。
        </div>
      </div>
      <div slot="footer">
        <Button @click="cancelChange">取 消</Button>
        <Button type="primary" @click="confirmWashedSgin" :disabled="$common.isEmpty(checkedRow)">确 定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>

export default {
  name: "bindSizeGroupModal",
  components: {},
  mixins: [],
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    moduleData: {
      type: Object,
      default () {
        return { sizeList: [], skuData: [], productInfo: {} };
      }
    }
  },
  data () {
    return {
      isVisible: false,
      productSize: [],
      checkedRow: {},
      columns: [
        {
          title: '可用尺码组',
          key: 'groupName',
          width: 100,
          align: 'left'
        },
        {
          title: '尺码',
          key: 'sizeTxt',
          minWidth: 120,
          align: 'left'
        },
        {
          title: '可匹配尺码项',
          key: 'matchSize',
          minWidth: 120,
          align: 'left'
        },
        {
          title: '操作',
          width: 90,
          key: 'operate',
          // fixed: 'right',
          align: 'center',
          render: (h, { row }) => {
            let itemStyle = {
              'cursor': 'pointer',
              'text-decoration': 'underline',
              'color': '#2d8cf0'
            };
            if (row.isSelect) {
              delete itemStyle.cursor;
              delete itemStyle['text-decoration'];
              itemStyle.color = '#19be6b';
            }
            return h('div', [
              h('span', {
                style: itemStyle,
                on: {
                  click: () => {
                    this.checkSizeGroup(row);
                  }
                }
              }, row.isSelect ? '已绑定' : '绑定')
            ]);
          }
        }
      ],
      tableData: []
    };
  },
  watch: {
    modelVisible (newVal) {
      if (newVal) this.open();
    },
    isVisible (newVal) {
      this.$emit('update:modelVisible', newVal);
      !newVal && this.closeModal();
    }
  },
  computed: {},
  methods: {
    // 打开窗口
    open () {
      this.isVisible = this.modelVisible;
      this.$nextTick(() => {
        this.initData();
      })
    },
    // 关闭弹窗
    closeModal () {
      this.tableData = [];
      this.productSize = [];
      this.checkedRow = {};
    },
    // 数据初始化
    initData () {
      if (!this.$common.isEmpty(this.moduleData.skuData)) {
        let productSize = [];
        this.moduleData.skuData.forEach(row => {
          if (!this.$common.isEmpty(row.productGoodsSpecifications)) {
            row.productGoodsSpecifications.forEach(item => {
              if (!this.$common.isEmpty(item.name) && item.name == 'Size') {
                productSize.push(item.value);
              }
            })
          }
        })
        this.productSize = productSize;
      }
      if (!this.$common.isEmpty(this.moduleData.sizeList)) {
        let tableList = [];
        let sizeVals = [];
        this.moduleData.sizeList.forEach((row, index) => {
          if (!this.$common.isEmpty(row.children)) {
            sizeVals = row.children.map(s => s.value)
          } else {
            sizeVals = [];
          }
          tableList.push({
            id: row.id,
            merchantId: row.merchantId,
            sizeTypeId: row.sizeTypeId,
            sizeGroupNo: row.sizeGroupNo,
            groupName: row.label || `尺码组${index + 1}`,
            isSelect: false,
            sizeTxt: sizeVals.join('、'),
            matchSize: (() => {
              if (this.$common.isEmpty(this.productSize) || this.$common.isEmpty(sizeVals)) return '';
              const sizes = sizeVals.filter(f => {
                return this.productSize.includes(f);
              })
              return sizes.join('、');
            })()
          })
        })
        this.tableData = tableList;
      }
    },
    // 选中
    checkSizeGroup (row) {
      this.tableData = this.tableData.map(item => {
        return { ...item, isSelect: row.sizeGroupNo === item.sizeGroupNo }
      })
      this.checkedRow = this.$common.copy(row);
    },
    // 取消
    cancelChange () {
      this.$emit('confirmModal', {});
      this.$nextTick(() => {
        this.isVisible = false;
      })
    },
    // 确定
    confirmWashedSgin () {
      if (this.$common.isEmpty(this.checkedRow)) {
        this.$Message.error('请选择需要绑定商品的尺码组');
        return;
      }
      this.$emit('confirmModal', this.checkedRow);
      this.$nextTick(() => {
        this.isVisible = false;
      })
    }
  }
};
</script>
<style lang="less" scoped>
.modal-body-main{
  position: relative;
  .product-size{
    padding: 0  0 10px 0;
    font-size: 12px;
    font-weight: bold;
  }
  .size-tips{
    padding-top: 10px;
    font-size: 12px;
    color: #999;
    font-weight: bold;
    .notice-tips{
      color: #f30;
    }
  }
}
</style>
<style lang="less">
.bindSizeGroupModal{
  .ivu-modal{
    position: relative;
    max-width: 1000px;
  }
}
</style>
