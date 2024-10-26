<template>
  <div>
    <div class="cointar">
      <!-- <dytUpload action="//jsonplaceholder.typicode.com/posts/" ref="upload">
        <span class="fontStyle">选择导入文件</span>
      </dytUpload> -->
      <dytUpload
        ref="upload"
        :before-upload="handleUpload"
        action="//jsonplaceholder.typicode.com/posts/"
      >
        <span class="fontStyle">选择导入文件</span>
      </dytUpload>
      <span class="fontStyle" @click="downloadTemplate">下载模版</span>
    </div>
    <div>{{ file ? file.name : "" }}</div>
    <div class="mt10">
      导入条件一致时
      <RadioGroup v-model="sameSkuStrategy" class="没来0">
        <Radio label="1">覆盖</Radio>
        <Radio label="0">忽略</Radio>
      </RadioGroup>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";

export default {
  data() {
    return {
      modal1: false,
      uploadList: null,
      file: null,
      sameSkuStrategy: "1",
    };
  },
  props: {
    segmentType: {
      type: String,
      default: () => {
        return "0";
      },
    },
  },
  mounted() {},
  methods: {
    handleUpload(file) {
      this.file = file;
      return false;
    },
    confirm() {
      if (this.file) {
        let fd = new FormData();
        fd.append("excel", this.file); // 传文件
        fd.append("type", this.segmentType); // 传文件
        this.axios({
          url: api.importFreightTemplate,
          method: "post",
          headers: { "Content-Type": "multipart/form-data; charset=utf-8" },
          data: fd,
        })
          .then(({ status, msg, data }) => {
            if (status !== 200) {
              return;
            }
            let temp = data.datas || {};
            temp.sameSkuStrategy = this.sameSkuStrategy;
            this.$emit("importData", temp);
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
    // 下载模板
    downloadTemplate() {
      window.open(
        "/setting-service/./filenode/s/setting-service/template/priceImportTemplate.xlsx"
      );
      // "/setting-service/./filenode/s/setting-service/template/monthAverageExchangeRate_importTemplate.xlsx"
    },
  },
};
</script>

<style lang="less" scoped >
.cointar {
  display: flex;
  justify-content: space-between;
}
.fontStyle {
  color: #229bee;
  cursor: pointer;
}
</style>
