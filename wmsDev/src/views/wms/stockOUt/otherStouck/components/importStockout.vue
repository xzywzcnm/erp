<template>
  <div>
    <Modal v-model="isVisible" :styles="{ top: '80px', width: '520px' }" title="导入出库单" :mask-closable="false"
      class="importStockoutPage">
      <div class="fmb10">
        <Form ref="formItem" :model="formItem" :label-width="110">
          <FormItem label="选择导入文件：">
            <div style="display: flex; justify-content: space-between">
              <Button icon="ios-cloud-upload-outline" class="upload-btn" @click="uploadLoading = true">
                选择文件
                <input type="file" name="file" class="upload-file" @change="handleFileChange" />
              </Button>
              <a href="javascript:;" style="margin-right: 40px; line-height: 32px" @click="download">下载模板</a>
            </div>
            <div v-for="(item, index) in formItem.fileList" :key="index + 'f'" class="mt10">
              <span>{{ item.name }}</span>
              <Icon type="md-checkmark-circle" style="color: #19be6b; margin-left: 20px" />
            </div>
          </FormItem>
          <FormItem label="导入出库单类型：">
            <Select v-model="formItem.pickingType" style="width: 260px">
              <Option v-for="item in outListTypeList" :key="item.value" :label="item.label" :value="item.value">
              </Option>
            </Select>
          </FormItem>
          <FormItem label="出库类型：" v-if="formItem.pickingType == 'O11'">
            <Select v-model="formItem.type" style="width: 260px">
              <Option v-for="item in issueTypeList" :key="item.value" :label="item.label" :value="item.value">
              </Option>
            </Select>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button @click="isVisible = false">取消</Button>
        <Button type="primary" @click="successUpload" :loading="loading">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
import common from "@/components/mixin/common_mixin";
import { outListTypeList, issueTypeList } from "./fileData";
export default {
  name: "importStockout",
  mixins: [common],
  data() {
    return {
      isVisible: false,
      formItem: {
        fileList: [],
        pickingType: "O5",
        type: 0,
      },
      outListTypeList: outListTypeList,
      uploadLoading: false,
      loading: false,
      wareId: this.getWarehouseId(), // 仓库id
      issueTypeList: issueTypeList,
    };
  },
  props: {
    switchInportModal: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    switchInportModal(val) {
      if (val) this.open();
    },
    isVisible(val) {
      if (!val) this.$emit("update:switchInportModal", val);
    },
  },
  created() { },
  methods: {
    open() {
      this.isVisible = this.switchInportModal;
      this.formItem.fileList = [];
      this.formItem.pickingType = "O5";
    },
    // 前端拼接的形式
    download() {
      // FBAImportS.xlsx
      const { pickingType, type } = this.formItem;
      const apiType = {
        O5: "FBAImport",
        O6: "FBAImport",
        O7: "FBAImport",
        O8: "GCImport",
        O9: "SHLImport",
        O10: "WYTImport",
        O11: {
          0: "SendImport",
          1: 'getTemuPickingFileTemplate',
        },
        O13: "FBKImport",
        O17: "RuiYiDaImport",
        O18: "FBPTemplate",
        O19: "amlImport",
        O20: "ymsImport",
        O21: "FBPURALImport",
      };
      let downApi = apiType[pickingType];
      if (Object.prototype.toString.call(downApi) === "[object Object]") {
        downApi = downApi[type];
      }
      const url = this.$common.splicingPath(api[downApi]);
      let list = this.$common.arrayToObj(this.outListTypeList);
      let name = ((list[pickingType] || {}).label || '出库') + '单';
      if (pickingType == 'O11') {
        name += (type == 1 ? '备货' : '寄样');
      }
      let filename = name + '导入模板.xlsx';
      this.axios({
        method: "get",
        url: url,
        params: {},
        responseType: "blob",
        timeout: 600000,
      }).then((resData) => {
        if (!resData.resData) return;
        this.$common.downFile(resData.resData, filename);
      });
    },
    // 导入成功
    successUpload() {
      let formItem = this.formItem;
      if (!formItem.fileList.length) {
        this.$Message.error("请选择导入文件~");
        return;
      }
      const requestApi = `${api.importFbaPicking
        }?warehouseId=${this.getWarehouseId()}`;
      let formData = new FormData();
      formData.append("excleFile", formItem.fileList[0]);
      formData.append("pickingType", formItem.pickingType);
      if (formItem.pickingType == "O11") formData.append("type", formItem.type);

      this.loading = true;
      this.axios
        .post(requestApi, formData)
        .then(({ data }) => {
          if (!(data && data.code === 0)) return;
          this.$Message.success("导入成功!");
          this.isVisible = false;
          this.$emit("searchData");
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleFileChange(e) {
      this.uploadLoading = true;
      const input = e.target;
      const files = e.target.files;
      if (!(files && files[0])) {
        this.uploadLoading = false;
        return;
      }
      const file = files[0];
      const format = ["xlsx", "xls", "xml"]; // 接受上传的文件类型
      const testFile = file.name
        .substring(file.name.lastIndexOf(".") + 1)
        .toLowerCase(); // 获取后缀
      // console.log(file, testFile, "文件");
      if (file.size > 5242880) {
        this.$Message.error(file.name + "文件大小不能超过5MB");
        return;
      }
      if (!format.includes(testFile)) {
        this.$Message.error({
          content:
            file.name + `文件格式不正确, 请选择${format.toString()}格式的文件~`,
          duration: 2,
        });
        return;
      }
      this.formItem.fileList = [file];
      input.value = "";
      this.$nextTick(() => {
        this.uploadLoading = false;
      });
    },
  },
};
</script>

<style lang="less">
.importStockoutPage {
  .fmb10 {
    .ivu-form-item {
      margin-bottom: 10px;
    }
  }

  .upload-btn {
    position: relative;
    overflow: hidden;
  }

  .upload-file {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    opacity: 0;
    cursor: pointer;
  }
}
</style>
