<template>
  <div>
    <div class="type_style" v-if="dimension">
      <span>调整维度：</span>
      <RadioGroup v-model="importType">
        <Radio label="1">按批次</Radio>
        <Radio label="2">按SKU</Radio>
      </RadioGroup>
    </div>
    <div>
      <span>选择导入文件：</span>
      <dytUpload
        :action="importUrl"
        style="display: inline-block"
        :show-upload-list="false"
        :headers="headObj"
        :before-upload="beforeUp"
        name="excleFile"
        :data="importObj"
        :on-success="uploadSuccess"
        :on-error="uploadError"
      >
        <Button>选择文件</Button>
      </dytUpload>
      <a href="javascript:;" style="margin-left: 20px" @click="download">下载模板</a>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";

export default {
  props: ["importUrl", "headObj", "wareId", "templateTypes", "dimension", "pickingType"],
  data() {
    return {
      importType: "2", // 1 按批次  2按SKU
      importObj: { warehouseId: this.wareId }, // importType: importType
    };
  },
  watch: {
    headObj(val) {},
  },
  methods: {
    beforeUp() {
      if (this.dimension) {
        this.importObj["importType"] = this.importType;
      }
      if (this.pickingType) {
        this.importObj.pickingType = this.pickingType;
      }
    },
    uploadSuccess(res, file, fileList) {
      let errorList = {
        553509: "导入库位类型格式不正确",
        553812: "冻结数量不能大于库存可用数量",
        554140: "导入类型错误!",
        551003: "存在重复SKU!",
        551006: "导入失败:不是excel文件!",
        551001: "查无此平台下的店铺号",
        554157: "请检查平台店铺是否填写正确",
        554127: "未填写sku",
        554158: "未填写订单数量",
        554159: "查无此平台下的店铺号",
        554155: "全托管出库单导入平台不一致",
        554156: "无此平台店铺",
      };
      if (res.code === 0) {
        this.$Message.success("导入成功");
        this.$emit("insertSuccess");
      } else {
        let str = "";
        if (res.code === 999993) {
          str = res.message;
        } else {
          str = errorList[res.code];
        }
        this.$Message.error({
          content: str || "系统错误",
          duration: 3,
        });
      }
    },
    uploadError() {},
    download() {
      let v = this;
      // 前端拼接的形式
      let erpCommon = v.$store.state.erpConfig;
      // 类型为3 下载按批次的模板   类型为adjust 下载按SKU的模板
      let templateTypes = null;
      if (this.dimension) {
        templateTypes = v.importType === "1" ? "3" : "adjust";
      } else {
        templateTypes = v.templateTypes;
      }
      if (v.$common.isEmpty(templateTypes)) {
        v.$Message.error("缺少文件路径!");
        return;
      }
      let url =
        erpCommon.filenodeViewTargetUrl +
        api.wmsService +
        `template/${templateTypes}.xlsx`;
      window.open(url, "_self");
      // 调后台接口的形式
      // this.axios.post(api.downloadModalFile, [this.templateTypes]).then(res => {
      //   if (res.data.code === 0) {
      //     let data = res.data.datas[0].templateUrl;   // /wms-service/template/3.xlsx
      //     let erpCommon = v.$store.state.erpConfig;
      //     // if (erpCommon.filenodeViewTargetUrl === './filenode/s') {
      //     //   erpCommon.filenodeViewTargetUrl = window.location.href.split('wms.html')[0] + '/filenode/s';
      //     // }
      //     // window.open(res.data.datas[0].templateUrl, '_self');
      //     window.open(erpCommon.filenodeViewTargetUrl + data, '_self');
      //   }
      // });
    },
  },
};
</script>

<style scoped>
.type_style {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
</style>
