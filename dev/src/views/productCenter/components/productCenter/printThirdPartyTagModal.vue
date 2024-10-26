<template>
  <div>
    <Modal
      v-model="isVisible"
      :title="`${!(!isPrinting && !isPrintPreview) ? '打印预览' : isDownload ? '下载第三方标签' : '打印第三方标签'}`"
      :mask-closable="false"
      class-name="edit-modal-box"
    >
      <div class="edit-modal-contain">
        <template v-if="!isPrinting && !isPrintPreview">
          <Form
            ref="editModalContain"
            :model="formData"
            :rules="ruleValidate"
            :label-width="180"
          >
            <!-- <FormItem label="平台订单号：" prop="platformOrderNo" v-if="['tiktok'].includes(moduleData.platformId)">
              <dyt-input placeholder="请输入" v-model="formData.platformOrderNo" />
            </FormItem> -->
            <FormItem label="打印数量：" prop="printQuantity">
              <dyt-input placeholder="请输入大于 0 的整数" v-model="formData.printQuantity" />
            </FormItem>
            <FormItem label="纸张大小：">
              {{ platformSize.txt }}
            </FormItem>
          </Form>
        </template>
        <template v-else-if="previewData.length > 0">
          <div
            class="tag-view"
            v-for="(item, index) in previewData"
            :key="`tag-${index}`"
            :style="`${item.pagePxSze ? `height:${item.pagePxSze.height * item.scale}px;` : ''}`"
          >
            <div v-html="item.previewHtml" class="tag-item-view" />
            <!-- <img :src="item.file" :width="item.pagePxSze.width" /> -->
          </div>
        </template>
        <template v-else>
          <div style="padding: 50px 50px 0 50px; color: #999;"></div>
        </template>
      </div>
      <div slot="footer">
        <Button
          v-if="isDownload"
          type="primary"
          @click="dowTagFile"
          :disabled="modalLoading"
        >确 定</Button>
        <template v-if="!isDownload">
          <Button
            v-if="!isPrinting && !isPrintPreview"
            type="primary"
            @click="tagPreview"
            :disabled="modalLoading"
          >确 定</Button>
          <Button
            v-else
            type="primary"
            @click="printTag"
            :disabled="modalLoading || isPrinting"
          >打 印</Button>
        </template>
        <Button @click="isVisible = false">取 消</Button>
      </div>
      <Spin fix v-if="modalLoading || isPrinting">正在处理数据中，请不要关闭....</Spin>
    </Modal>
  </div>
</template>
<script>
import { getPrintHtml } from '@/utils/printTagCommon';
import printCommon from '@/utils/printCommon';
import api from '@/api/api';

// 标签宽高设置
const tagSzie = {
  tiktok: {
    size: {
      width: 70,
      height: 20,
      unit: 'mm',
    },
    replaceKey: {
      tagType: 'platformId', // 标签类型 platformId
      barcode: 'labelCode', // 条码，Number、String
      leftTop: 'labelCode', // 条码左上角
      leftBottom: 'skuSpecName', // 条码左下角
      rightTop: 'platformSku', // 条码右上角
      rightBottom: 'producing', // 条码右下下角
      // leftFourLine: 'platformOrderNo', // 条码第四行左下角
      leftFourLine: 'extCode', // 条码第四行左下角
      // rightFourLine: 'countryName', // 条码第四行右下角
      // rightFourLineSubjoinTxt: 'MADE IN', // 条码第四行右下角附加值
    }
  },
  temu: {
    size: {
      width: 70,
      height: 20,
      unit: 'mm',
    },
    replaceKey: {
      tagType: 'platformId', // 标签类型 platformId
      barcode: 'labelCode', // 条码，Number、String
      leftTop: 'extCode', // 条码左上角
      middleTop: 'skcSpecName', // 条码正上(即条码中间上方)
      rightTop: 'skuSpecName', // 条码右上角
      leftBottom: 'platformSku', // 条码左下角
      middleBottom: 'middleBottom', // 条码正下(即条码中间下方)
      rightBottom: 'countryName', // 条码右下下角
      rightBottomSubjoinTxt: 'Made In' // 右下角附加值
    }
  },
  shein: {
    size: {
      width: 70,
      height: 20,
      unit: 'mm',
    },
    replaceKey: {
      tagType: 'platformId', // 标签类型 platformId
      barcode: 'labelCode', // 条码，Number、String
      leftTop: 'supplierItem', // 条码左上角
      middleTop: 'middleTop', // 条码正上(即条码中间上方)
      rightTop: 'countryName', // 条码右上角
      rightTopSubjoinTxt: 'Made In', // 右上角附加值
      rightTopDefaultTxt: 'China', // 当右上角数据为空时，使用该值替补
      leftBottom: 'productSkcId', // 条码左下角
      middleBottom: 'middleBottom', // 条码正下(即条码中间下方)
      rightBottom: 'skuSpecName', // 条码右下下角
      replaceRightBottom: 'skcSpecName', // 当右下下角数据为空时，使用该 key 的值替补
    }
  },
  // 默认
  defaultSize: {
    size: {
      width: 70,
      height: 20,
      unit: 'mm',
    },
    replaceKey: {
      tagType: 'platformId', // 标签类型 platformId
      barcode: 'labelCode', // 条码，Number、String
      leftTop: 'extCode', // 条码左上角
      middleTop: 'skcSpecName', // 条码正上(即条码中间上方)
      rightTop: 'skuSpecName', // 条码右上角
      leftBottom: 'platformSku', // 条码左下角
      middleBottom: 'middleBottom', // 条码正下(即条码中间下方)
      rightBottom: 'countryName', // 条码右下下角
      rightBottomSubjoinTxt: 'Made In' // 右下角附加值
    }
  }
}

export default {
  name: "printThirdPartyTagModal",
  components: {},
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    moduleData: {
      type: Object,
      default () {
        return {};
      }
    }
  },
  data () {
    return {
      modalLoading: false,
      isVisible: false,
      isPrinting: false,
      isPrintPreview: false,
      previewData: [],
      formData: {
        platformOrderNo: '',
        printQuantity: '1',
      },
      ruleValidate: {
        platformOrderNo: [
          { required: true, message: '请输入', trigger: 'change' },
          { required: true, message: '请输入', trigger: 'blur' }
        ],
        printQuantity: [
          { required: true, msg: '请输入打印数量', min: 0, max: 1000, validator: this.quantityValidator, trigger: 'change' },
          { required: true, msg: '请输入打印数量', min: 0, max: 1000, validator: this.quantityValidator, trigger: 'blur' }
        ]
      }
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
  computed: {
    // 平台
    platformSize () {
      let platformConfig = tagSzie.defaultSize;
      if (!(this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.platformId))) {
        let tagType = this.moduleData.platformId.toLocaleLowerCase();
        if (!this.$common.isEmpty(tagType)) {
          platformConfig = tagSzie[tagType];
        }
      }
      return {
        txt: `${platformConfig.size.width}${platformConfig.size.unit} * ${platformConfig.size.height}${platformConfig.size.unit}`,
        ...platformConfig
      }
    },
    // 是否下载
    isDownload () {
      if (this.$common.isEmpty(this.moduleData) || !this.$common.isBoolean(this.moduleData.isDownload)) return false;
      return this.moduleData.isDownload;
    }
  },
  methods: {
    // 打开窗口
    open () {
      this.$refs.editModalContain && this.$refs.editModalContain.resetFields();
      this.$nextTick(() => {
        this.initData();
        this.$nextTick(() => {
          this.isVisible = this.modelVisible;
        })
      })
    },
    // 关闭弹窗
    closeModal () {
      this.modalLoading = false;
      this.isVisible = false;
      this.isPrinting = false;
      this.isPrintPreview = false;
      this.previewData = [];
      this.formData.platformOrderNo = '';
      this.formData.printQuantity = '1';
    },
    // 数据初始化
    initData () {
      this.modalLoading = true;
      this.$common.promiseAll([]).then((resArr) => {
        // console.log(resArr);
      }).finally(() => {
        this.modalLoading = false;
      })
    },
    // 验证
    quantityValidator (rule, value, callback) {
      if (rule.required && this.$common.isEmpty(value, true)) {
        return callback(new Error(`${rule.msg || '必填项不能为空'}`));
      }
      const nVal = Number(value);
      if (this.$common.isEmpty(nVal) || nVal <= rule.min || nVal > rule.max || (nVal.toString()).includes('.')) {
        return callback(new Error(`请输入大于 ${rule.min} 且不大于 ${rule.max} 的整数`));
      }
      callback();
    },
    // 预览标签
    tagPreview() {
      this.$refs['editModalContain'].validate((valid) => {
        if (!valid) return;
        // 增加平台订单号
        this.moduleData.platformOrderNo = this.formData.platformOrderNo;

        this.previewData = [];
        if (this.isPrintPreview) return;
        this.isPrintPreview = true;
        this.modalLoading = true;
        setTimeout(() => {
          getPrintHtml(this.moduleData, {
            ...this.platformSize.size,
            replaceKey: {
              ...this.platformSize.replaceKey
            }
          }).then(res => {
            if (!res.success || this.$common.isEmpty(res.data)) return;
            const printQuantity = Number(this.formData.printQuantity);
            let tagViewHtml = [];
            (res.data).forEach(item => {
              for (let index = 0; index < printQuantity; index++) {
                tagViewHtml.push(item);
              }
            });
            this.previewData = tagViewHtml;
          }).finally(() => {
            this.modalLoading = false;
          })
        }, 200);
      });
    },
    // 打印标签
    printTag () {
      this.isPrinting = true;
      this.modalLoading = true;
      let allTagHtml = '';
      this.previewData.forEach((item, index) => {
        allTagHtml = `${allTagHtml}${item.printHtml}`;
      })
      // 将 html 放到 html 文档中
      allTagHtml = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>标签打印</title>
        </head>
        <style>
          * {
            margin: 0;
            padding: 0;
          }
          body{
            font-size: 0;
          }
          img {
            vertical-align: top;
          }
        </style>
        <body>${allTagHtml}</body>
      </html>`;
      printCommon.htmlPrint(allTagHtml).then((res) => {
        // console.log(res);
      }).finally(() => {
        this.isPrinting = false;
        this.modalLoading = false;
      })
    },
    // 下载标签
    dowTagFile () {
      this.isPrinting = true;
      let params = {
        erpSku: this.moduleData.extCode,
        platformSku: this.moduleData.platformSku,
        skcSpecName: this.moduleData.skcSpecName,
        skuSpecName: this.moduleData.skuSpecName,
        labelCode: this.moduleData.labelCode,
        platformSkc: this.moduleData.productSkcId,
        supplierItem: this.moduleData.supplierItem,
        platformId: this.moduleData.platformId,
        quantity: Number(this.formData.printQuantity)
      }
      // let newTab = window.open('about:blank');
      this.axios.post(api.downloadLabel, params).then(res => {
        // if (!res || !res.data || res.data.code != 0) return newTab.close();
        // newTab.location.href = `./filenode/s${res.data.datas}`;
        if (!res || !res.data || res.data.code != 0) return;
        window.open(`./filenode/s${res.data.datas}`);
        this.isVisible = false;
      }).catch(() => {
        // newTab.close();
      }).finally(() => {
        this.isPrinting = false;
      });
    }
  }
};
</script>
<style lang="less" scoped>
:deep(.edit-modal-box){
  .ivu-modal{
    top: 60px;
    width: 80% !important;
    max-width: 700px;
    min-width: 400px;
    .ivu-modal-body{
      max-height: calc(100vh - 200px);
    }
  }
  .ivu-modal-body{
    padding: 0
  }
  .ivu-input[disabled] {
    color: #878787;
  }
  .tag-view{
    margin-bottom: 10px;
    font-size: 0;
    >img {
      border: 2px solid #333;
    }
    .tag-item-view{
      display: inline-block;
    }
  }
}
.edit-modal-contain{
  position: relative;
  max-height: calc(100vh - 200px);
  min-height: 200px;
  padding: 16px 16px 0px 16px;
  overflow: auto;
}

.ivu-modal-body {
  position: relative;
  .ivu-modal-confirm-footer{
    position: sticky;
    bottom: -16px;
    padding: 20px 0;
    text-align: right;
    background: #fff;
  }
}
</style>
