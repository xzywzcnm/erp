<template>
  <div class="basis-gallery">
    <!-- 指派人员 -->
    <Modal v-model="isVisible" width="1000" title="图片添加" :mask-closable="false" :closable="false">
      <div class="contain-preview">
        <preview-img :fileList="choosePiclist" :isDisabled="true" :isChecked="true"></preview-img>
      </div>
      <div slot="footer">
        <Button type="primary" @click="handleNext()">确定</Button>
        <Button @click="isVisible = false">取消</Button>
      </div>
    </Modal>

    <Card dis-hover>
      <div slot="title" class="title-div">
        <span>图库 共 {{filePiclist.length}} 张图片</span>
        <div class="btn-list">
          <Button type="primary" size="small" @click="checkAll()">{{check ? '取消全选' : '全选'}}</Button>
          <button-upload
            class="ml10"
            v-model="filePiclist"
            :options="{multiple:true,limit:100,sizes:'small', accept: 'image/*'}"
            :is-sort="true"
            v-if="!isDisabled"
            accept="image/*"
          />
          <Button class="ml10" type="error" size="small" @click="delAll()" v-if="!isDisabled">删除</Button>
          <Button class="ml10" type="primary" size="small" @click="download" :loading="downLoading">下载</Button>
        </div>
      </div>
      <div class="contain-preview">
        <preview-img :fileList="filePiclist" :isDisabled="isDisabled" :isChecked="true"></preview-img>
      </div>
    </Card>

  </div>
</template>
<script>
import api from '@/api/api.js';
import buttonUpload from '@/components/uploadImg/buttonUpload';
import previewImg from '@/components/uploadImg/previewImg';
export default {
  name: "basisGallery",
  components: { buttonUpload, previewImg },
  data () {
    return {
      check: false,
      filePiclist: [],
      isVisible: false,
      choosePiclist: [],
      downLoading: false,
    }
  },
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    picList: {
      type: Array,
      default () {
        return [];
      }
    },
    isDisabled: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    modelVisible (val) {
      if (val) this.open();
    },
    isVisible (val) {
      if (!val) this.$emit('update:modelVisible', val);
    },
    filePiclist: {
      immediate: true,
      deep: true,
      handler (val) {
        this.choosePicChange();
      }
    },
    picList: {
      immediate: true,
      deep: true,
      handler (val) {
        this.filePiclist = this.$common.copy(val || []);
      }
    }
  },
  methods: {
    // 弹框打开
    open () {
      this.isVisible = this.modelVisible;
      this.choosePicChange();
    },
    // 弹框图片
    choosePicChange () {
      let list = this.$common.copy(this.filePiclist);
      let seletedlist = list.map(k => {
        k.selected = false;
        return k;
      })
      this.choosePiclist = this.$common.copy(seletedlist);
    },
    // 全选/取消全选
    checkAll () {
      if (!this.filePiclist.length) return;
      this.check = !this.check;
      this.filePiclist.forEach((k, i) => {
        this.$set(this.filePiclist[i], "selected", this.check)
      })
    },
    // 确认选择图片
    handleNext () {
      let list = this.choosePiclist.filter(k => {
        return k.selected;
      })
      this.$emit("picReturn", list);
      this.isVisible = false;
    },
    // 删除 
    delAll () {
      let list = this.filePiclist.filter(k => {
        return k.selected;
      })
      if (!list.length) {
        this.$Message.error("请勾选要删除的图片~");
        return;
      }
      let surplus = this.filePiclist.filter(k => {
        return !k.selected;
      })
      this.filePiclist = surplus;
      this.check = false;
    },
    // 下载图片
    download () {
      let list = [];
      this.filePiclist.forEach(k => {
        k.selected ? list.push(k.url) : '';
      });
      // 没有新增图片
      if (!list.length) {
        this.$Message.info('请勾选要下载的图片~');
        return;
      }
      this.downLoading = true;
      this.$axios
        .post(api.download, list)
        .then((res) => {
          if (res.code === 0) {
            this.$Message.success('下载成功~');
            window.open(res.datas);
          }
        })
        .finally(() => {
          this.downLoading = false;
        });
    },
  }
};
</script>
<style lang="less" scoped>
.basis-gallery {
  .title-div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .btn-list {
      display: flex;
      align-items: center;
    }
  }
  .contain-preview {
    max-height: 600px;
    overflow: auto;
  }
}
</style>