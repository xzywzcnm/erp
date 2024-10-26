<!-- 上传和预览一体 -->
<template>
  <div class="dyt-upload-component">
    <draggable
      v-if="showUploadList"
      v-model="dragList"
      chosen-class="chosen"
      force-fallback="true"
      group="people"
      animation="500"
      touch-start-threshold="100px"
      fallback-tolerance="100px"
      @start="dragSortStart"
      @end="dragSortEnd"
      :disabled="!isDragSort"
      class="draggable-container"
      :class="{ 'draggable-sort': isDragSort }"
    >
      <div
        class="demo-upload-list"
        v-for="(item, index) in uploadList"
        :key="`upload-${index}-${nowTime}`"
        :style="`width:${viewWidth};height: ${viewHeight}`"
      >
        <template v-if="item.status === 'finished' || viewType">
          <img :src="item.url" />
          <div
            v-if="isCheckFile"
            class="file-checkbox"
            :class="{ 'check-item': item.checked }"
            @click.stop="checkHand(item)"
          />
          <div class="demo-upload-list-cover">
            <div class="sort-layer" />
            <div class="operation-icon" :class="{ 'show-check-box': isCheckFile }">
              <Icon type="ios-eye-outline" @click.native="handleView(item)" />
              <Icon
                v-if="(!selectConfig.disabled && !viewType) || (viewType && isDelete)"
                type="ios-trash-outline"
                @click.native="handleRemove(item)"
              />
            </div>
            <div v-if="isFileTitle" class="file-name" :title="`${item.name || ''}`">
              {{ item.name || "" }}
            </div>
            <div
              v-if="isCheckFile"
              class="file-checkbox"
              :class="{ 'check-item': item.checked }"
              @click.stop="checkHand(item)"
            />
          </div>
        </template>
        <template v-else>
          <Progress
            v-if="item.showProgress"
            status="active"
            :stroke-width="15"
            text-inside
            :percent="item.percentage"
          />
        </template>
      </div>
    </draggable>
    <!-- iviewui 的上传组件 -->
    <dytUpload
      v-if="!viewType"
      :ref="`upload-${nowTime}`"
      v-bind="selectConfig"
      :headers="uploadHeader"
      v-on="$listeners"
      :default-file-list="uploadFileList"
    >
      <slot>
        <div
          class="upload-default-solt"
          :class="{ 'disabled-upload': selectConfig.disabled }"
          v-if="!viewType"
          :style="`width:${viewWidth};height: ${viewHeight}`"
        >
          <Icon type="ios-camera" size="35"></Icon>
        </div>
      </slot>
      <template v-for="slot in slots.keys" :slot="slot">
        <slot :name="slot" v-if="slot !== 'default'" />
      </template>
      <template
        v-for="scopedSlots in scopedSlots.keys"
        :slot="scopedSlots"
        slot-scope="scope"
      >
        <slot :name="scopedSlots" v-bind="scope" v-if="scopedSlots !== 'default'" />
      </template>
    </dytUpload>
    <!-- 预览图片 -->
    <transition name="fade">
      <div class="img-dialog" v-if="imgViewVisible">
        <div class="img-view">
          <img :src="imgUrl" data-type="img" />
          <Icon type="md-close-circle" class="close-icon" @click="closeBigImg" />
          <div @click="closeBigImg" class="img-dialog-layer" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import draggable from "vuedraggable"; // https://juejin.cn/post/6844904150350692366 使用文档总结

export default {
  name: "dytViewUpload",
  components: { draggable },
  model: {
    prop: "defaultFileList",
    event: "defaultFileListChange",
  },
  props: {
    showUploadList: { type: Boolean, default: false },
    defaultFileList: {
      type: Array,
      default() {
        return [];
      },
    },
    viewType: { type: Boolean, default: false },
    isDragSort: { type: Boolean, default: false },
    isCheckFile: { type: Boolean, default: false },
    isFileTitle: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: true },
    onRemove: { type: Function, default() {} },
    viewWidth: { type: String, default: "60px" },
    viewHeight: { type: String, default: "60px" },
  },

  data() {
    return {
      imgUrl: "",
      imgViewVisible: false,
      nowTime: `${new Date().getTime()}`,
      uploadList: [],
      defaultConfig: {
        "with-credentials": true,
        "max-size": 1024 * 50,
        "show-upload-list": false,
      },
      dragList: [],
      uploadFileList: [],
    };
  },
  watch: {
    uploadList: {
      deep: true,
      handler(val) {
        this.dragList = this.$common.copy(val);
      },
    },
    defaultFileList: {
      deep: true,
      immediate: true,
      handler(val) {
        if (!this.viewType) {
          this.uploadFileList = this.$common.copy(val);
          this.$nextTick(() => {
            this.uploadList = this.$refs[`upload-${this.nowTime}`].fileList;
          });
        } else {
          this.uploadList = this.$common.copy(val);
        }
      },
    },
  },
  computed: {
    uploadHeader() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders,
      };
    },
    slots() {
      return {
        keys: Object.keys(this.$slots),
        value: Object.values(this.$slots),
      };
    },
    scopedSlots() {
      return {
        keys: Object.keys(this.$scopedSlots),
        value: Object.values(this.$scopedSlots),
      };
    },
    selectConfig() {
      return {
        ...{
          "with-credentials": true,
          "max-size": 1024 * 50,
          "show-upload-list": false,
          headers: {
            ...this.$store.getters.erpRequestHeaders,
            ...this.$store.getters.dytRequestHeaders,
          },
        },
        ...this.$attrs,
      };
    },
  },
  created() {},
  mounted() {
    window.addEventListener("keyup", this.keyupHand);
  },
  // 组件销毁前
  beforeDestroy() {
    // 通过有名函数 解除事件订阅
    window.removeEventListener("keyup", this.keyupHand);
  },
  methods: {
    // 查看图片
    handleView(item) {
      this.imgUrl = item.url;
      this.$nextTick(() => {
        this.imgViewVisible = true;
      });
    },
    // 移除图片（返回true移除数据）
    async handleRemove(file) {
      // 官网是返回已经移除后的数据
      let nowList = this.uploadFileList.filter((item) => {
        return item.uid !== file.uid;
      });
      nowList = this.$common.copy(nowList);
      let isDelete = true;
      if (this.$common.isFunction(this.onRemove)) {
        isDelete = await this.onRemove(file, nowList);
      }
      if (!isDelete) return;
      this.$emit("defaultFileListChange", nowList);
      this.$emit("update:defaultFileList", nowList);
    },
    // 关闭弹窗
    closeBigImg() {
      this.imgViewVisible = false;
    },
    // 键盘事件
    keyupHand(e) {
      const tool = {
        27: () => {
          this.imgViewVisible = false;
        },
      };
      tool[e.keyCode] && tool[e.keyCode]();
    },
    // 拖拽开始
    dragSortStart() {
      this.$emit("dragSortStart", this.$common.copy(this.dragList));
    },
    // 拖拽结束
    dragSortEnd() {
      const oldVal = this.$common.copy(this.uploadList);
      const parameter = { list: this.uploadList, oldList: oldVal };
      this.$emit("defaultFileListChange", this.$common.copy(this.dragList));
      this.$emit("update:defaultFileList", this.$common.copy(this.dragList));
      this.$emit("drag-sort-change", parameter);
      this.$emit("dragSortChange", parameter);
      this.$common.isFunction(this.dragSortChange) && this.dragSortChange(parameter);
    },
    // 勾选处理
    checkHand(item) {
      const oldVal = this.$common.copy(this.uploadList);
      this.$set(item, "checked", !item.checked);
      this.$nextTick(() => {
        this.$emit("defaultFileListChange", this.$common.copy(this.uploadList));
        this.$emit("update:defaultFileList", this.$common.copy(this.uploadList));
        const parameter = { list: this.uploadList, oldList: oldVal, item: item };
        this.$emit("file-check-change", parameter);
        this.$emit("fileCheckChange", parameter);
        this.$common.isFunction(this.fileCheckChange) && this.fileCheckChange(parameter);
      });
    },
  },
};
</script>
<style lang="less" src="./uploadStyle.less"></style>
