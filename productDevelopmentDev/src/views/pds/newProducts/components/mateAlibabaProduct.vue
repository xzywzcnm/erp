<template>
  <div>
    <Modal v-model="isVisible" width="800" title="匹配1688商品" :mask-closable="false" footer-hide
      class="mateAlibabaProductPage">
      <div>
        <Table :columns="columns" :data="tableList" border highlight-row>
          <template slot-scope="{ row }" slot="picture">
            <upload-img v-model="row.fileList" :options="{ accept: 'image/*' }" :isDisabled="true" class="uploadSty"></upload-img>
          </template>
          <template slot-scope="{ row }" slot="isMate">
            <span :style="{ color: (row.isMate ? '#2d8cf0' : '#ed4014') }">
              {{ row.isMate ? '是' : '否' }}
            </span>
          </template>
          <template slot-scope="{ index }" slot="action">
            <Button type="primary" @click="mateProduct(index)" size="small">匹配</Button>
          </template>
        </Table>
      </div>
    </Modal>
  </div>
</template>
<script>
import UploadImg from '@/components/uploadImg';
export default {
  name: "mateAlibabaProduct",
  components: { UploadImg },
  data() {
    return {
      isVisible: false,
      tableList: [],
    }
  },
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default() { return [] }
    },
    columnsList: {
      type: Object,
      default() { return {} }
    },
  },
  watch: {
    modelVisible(val) {
      if (val) this.open();
    },
    isVisible(val) {
      if (!val) this.$emit('update:modelVisible', val);
    },
  },
  computed: {
    columns() {
      let list = Object.keys(this.columnsList).map(k => {
        return {
          title: k,
          align: 'center',
          key: this.columnsList[k],
          minWidth: 120,
        }
      });
      return [
        {
          title: '1688图片',
          align: 'center',
          slot: 'picture',
          minWidth: 120,
        },
        ...list,
        {
          title: '是否已匹配',
          align: 'center',
          slot: 'isMate',
          minWidth: 120,
        },
        {
          title: '操作',
          align: 'center',
          slot: 'action',
          minWidth: 120,
        },
      ];
    }
  },
  methods: {
    // 弹框打开
    open() {
      this.isVisible = this.modelVisible;
      this.tableList = this.$common.copy(this.list);
    },
    // 匹配商品
    mateProduct(index) {
      this.$emit('chooseData', index);
      this.isVisible = false;
    },
  }
};
</script>
<style lang="less">
.mateAlibabaProductPage {
  .uploadSty {
    .demo-upload-list {
      width: 70px !important;
      height: 70px;
    }
  }
}
</style>