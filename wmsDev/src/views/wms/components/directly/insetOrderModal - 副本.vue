<template >
  <Modal
    v-model="modalVisible"
    :title="modaltitle"
    :mask-closable="false"
  >
    <div class="modal-main-content">
      <p>Content of dialog</p>
      <p>Content of dialog</p>
      <p>Content of dialog</p>
    </div>
    <div slot="footer">
      <Button type="primary" @click="modalConfirm">确定</Button>
      <Button >取消</Button>
    </div>
  </Modal>
</template>

<script>
// import api from '@/api/api';

export default {
  name: 'insetOrderModal',
  props: {
    moduleData: {
      type: Object,
      default: () => {
        return {
          type: 'add',
          data: {}
        }
      }
    },
    visible: { type: Boolean, default: false }
  },
  data () {
    return {
      modalVisible: false
    };
  },
  watch: {
    visible: {
      immediate: true,
      deep: true,
      handler (val) {
        this.modalVisible = val;
        this.$nextTick(() => {
          val && this.initData();
        })
      }
    },
    modalVisible: {
      immediate: true,
      deep: true,
      handler (val) {
        this.$emit('update:visible', val);
      }
    }
  },
  created () {},
  computed: {
    modaltitle () {
      return this.moduleData.type == 'add' ? '操作提示' : '导入数据';
    }
  },
  activated () {},
  mounted () {},
  methods: {
    // 初始数据
    initData () {},
    // 确认
    modalConfirm () {
      this.$emit('insetConfirm', {});
    },
    // 取消
    modalCancel () {
      this.modalVisible = false;
    }
  }
};
</script>
<style lang="less" scoped>
.modal-main-content{
  position: relative;
}
</style>