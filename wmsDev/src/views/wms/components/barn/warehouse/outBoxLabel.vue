<template>
  <div>
    <Modal v-model="isVisible" title="外箱标签" width="600" :mask-closable="false" class="outBoxLabelPage">
      <div>
        <Form ref="formCustom" :label-width="80">
          <FormItem label="外箱标签:">
            <template v-if="modalData.labelPath && modalData.labelName">
              <a :href="modalData.labelPath" target="_blank">
                <Icon type="md-pricetags" style="transform: rotate(-90deg)" />
                {{ modalData.labelName }}
              </a>
              <span class="ml10">（点击下载）</span>
            </template>
            <span class="unlinkText cursorClick" @click="getLabel" v-else>获取外箱标签</span>
          </FormItem>
        </Form>
        <Spin fix v-if="pageLoading"></Spin>
      </div>
      <div slot="footer">
        <Button @click="isVisible = false">关 闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
export default {
  name: 'outBoxLabel',
  props: {
    dialogVisible: {
      type: Boolean,
      default() {
        return false
      }
    },
    modalData: {
      type: Object,
      default() {
        return {}
      }
    },
  },
  data() {
    return {
      isVisible: false,
      pageLoading: false,
    }
  },
  watch: {
    dialogVisible: {
      handler(val) {
        val && this.openModal();
      },
      deep: true,
    },
    isVisible: {
      handler(val) {
        if (val) return;
        this.$emit('update:dialogVisible', val);
      },
      deep: true,
    }
  },
  methods: {
    // 窗口打开
    openModal() {
      this.isVisible = true;
    },
    // 获取标签
    getLabel() {
      let { receiptNo, referenceNo, account } = this.modalData;
      this.pageLoading = true;
      this.axios.get(api.getBoxLabel, { params: { receiptNo, referenceNo, account } }).then(({ data }) => {
        if (data.code !== 0) return;
        this.isVisible = false;
        this.$Message.success('操作成功~');
        this.$emit('search');
      }).finally(() => {
        this.pageLoading = false;
      });
    },
  }
}
</script>
