<template>
  <div>
    <Modal v-model="isVisible" title="导入出库单" width="520px" :mask-closable="false" footer-hide>
      <Form ref="tableForm" :model="mainInfo" :rules="ruleValidate" :label-width="100">
        <Form-item label="平台主体：" prop="platFormId">
          <dyt-select v-model="mainInfo.platFormId" @on-change="platformChange">
            <Option v-for="(item, index) in platformList" :value="item.value" :key="index + 'platFormId'"
              :label="item.label">
            </Option>
          </dyt-select>
        </Form-item>
        <FormItem label="店铺：" prop="saleAccount">
          <dyt-select v-model="mainInfo.saleAccount">
            <Option v-for="(item, index) in shopList" :value="item.accountCode" :key="index + 'saleAccount'"
              :label="item.accountCode" />
          </dyt-select>
        </FormItem>
      </Form>

      <div>
        <span>选择导入文件：</span>
        <Button @click="fileClick">选择文件</Button>
        <a href="javascript:;" style="margin-left: 20px" @click="download">下载模板</a>
      </div>

      <dytUpload :action="importUrl" style="display: inline-block" :show-upload-list="false" :headers="headObj"
        :before-upload="beforeUp" name="excleFile" :data="importObj" :on-success="uploadSuccess" :on-error="uploadError"
        v-show="false">
        <Button class="uploadBtn">上传文件</Button>
      </dytUpload>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
import { outListTypeList, arrayToObj } from "./fileData";
import { getWarehouseId } from "@/utils/getService";
export default {
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      importUrl: api.fullManage_importPicking,
      isVisible: false,
      importType: "2", // 1 按批次  2按SKU
      importObj: {}, // importType: importType
      mainInfo: {
        platFormId: '',
        saleAccount: '',
      },
      ruleValidate: {
        platFormId: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        saleAccount: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
      },
      platformList: arrayToObj(outListTypeList),
      shopList: [],
    };
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true,
    },
    isVisible: {
      handler(val) {
        if (val) return;
        this.$emit("update:modelVisible", false);
      },
      deep: true,
    },
  },
  computed: {
    warehouseId() {
      return this.$store.state.warehouseId || getWarehouseId();
    },
    headObj() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders,
      };
    },
  },
  methods: {
    open() {
      this.isVisible = true;
      this.resetData();
      this.$nextTick(() => {
        this.resetData();
      })
    },
    resetData() {
      this.$refs['tableForm'].resetFields();
    },
    beforeUp() {
      let { platFormId, saleAccount } = this.mainInfo;
      this.importObj.platFormId = platFormId || null;
      this.importObj.saleAccount = saleAccount || null;
      this.importObj.warehouseId = this.warehouseId;
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
        this.modelVisible = false;
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
    uploadError() { },
    download() {
      // 前端拼接的形式
      let erpCommon = this.$store.state.erpConfig;
      let url = erpCommon.filenodeViewTargetUrl + api.wmsService + `template/FullTrusteeshipTemplate.xlsx`;
      window.open(url, "_self");
    },
    // 根据平台获取对应的店铺信息
    platformChange(e) {
      let item = this.platformList[e] || {};
      this.$store.dispatch("getAllStoreList", { platformId: item.platformId }).then((list) => {
        this.mainInfo.saleAccount = "";
        this.shopList = list;
      });
    },
    fileClick() {
      this.$refs['tableForm'].validate((valid) => {
        if (!valid) return;
        document.querySelector('.uploadBtn').click();
      })
    }
  },
};
</script>

<style scoped></style>
