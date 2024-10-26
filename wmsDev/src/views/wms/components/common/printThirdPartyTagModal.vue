<template>
  <div>
    <Modal v-model="isVisible" :title="`${!(!isPrinting && !isPrintPreview) ? '打印预览' : '打印第三方标签'}`" :mask-closable="false"
      class-name="edit-modal-box">
      <div class="edit-modal-contain">
        <template v-if="!isPrinting && !isPrintPreview">
          <Form ref="editModalContain" :model="formData" :rules="ruleValidate" :label-width="180">
            <FormItem label="打印数量：" prop="printQuantity">
              <dyt-input placeholder="请输入大于 0 的整数" v-model="formData.printQuantity" />
            </FormItem>
            <FormItem label="纸张大小：">
              {{ platformSize }}
            </FormItem>
          </Form>
        </template>
        <template v-else-if="previewData.length > 0">
          <div class="tag-view" v-for="(item, index) in previewData" :key="`tag-${index}`"
            :style="`${item.pagePxSze ? `height:${item.pagePxSze.height * item.scale}px;` : ''}`">
            <div v-html="item.previewHtml" class="tag-item-view" />
            <!-- <img :src="item.file" :width="item.pagePxSze.width" /> -->
          </div>
        </template>
        <template v-else>
          <div style="padding: 50px 50px 0 50px; color: #999;"></div>
        </template>
      </div>
      <div slot="footer">
        <Button @click="isVisible = false">取 消</Button>
        <Button v-if="!isPrinting && !isPrintPreview" type="primary" @click="tagPreview" :disabled="modalLoading">确
          定</Button>
        <Button v-else type="primary" @click="printTag" :disabled="modalLoading || isPrinting">打 印</Button>
      </div>
      <Spin fix v-if="modalLoading || isPrinting">正在处理数据中，请不要关闭....</Spin>
    </Modal>
  </div>
</template>
<script>
import { getPrintHtml } from '@/utils/printTagCommon';
import printCommon from '@/utils/printCommon';
// import api from '@/api/api';

const tagSzie = {
  tiktok: '70mm * 20mm',
  temu: '70mm * 20mm'
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
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      modalLoading: false,
      isVisible: false,
      isPrinting: false,
      isPrintPreview: false,
      previewData: [],
      formData: {
        printQuantity: '1'
      },
      ruleValidate: {
        printQuantity: [
          { required: true, msg: '请输入打印数量', min: 0, max: 1000, validator: this.quantityValidator, trigger: 'change' },
          { required: true, msg: '请输入打印数量', min: 0, max: 1000, validator: this.quantityValidator, trigger: 'blur' }
        ]
      }
    };
  },
  watch: {
    modelVisible(newVal) {
      if (newVal) this.open();
    },
    isVisible(newVal) {
      this.$emit('update:modelVisible', newVal);
      !newVal && this.closeModal();
    }
  },
  computed: {
    // 平台
    platformSize() {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.platformId)) return '70mm * 20mm';
      const tagType = this.moduleData.platformId.toLocaleLowerCase();
      if (this.$common.isEmpty(tagType)) return '70mm * 20mm';
      return tagSzie[tagType];
    }
  },
  methods: {
    // 打开窗口
    open() {
      this.$refs.editModalContain && this.$refs.editModalContain.resetFields();
      this.$nextTick(() => {
        this.initData();
        this.$nextTick(() => {
          this.isVisible = this.modelVisible;
        })
      })
    },
    // 关闭弹窗
    closeModal() {
      this.modalLoading = false;
      this.isVisible = false;
      this.isPrinting = false;
      this.isPrintPreview = false;
      this.previewData = [];
      this.formData.printQuantity = '1';
    },
    // 数据初始化
    initData() {
      this.modalLoading = true;
      this.$common.promiseAll([]).then((resArr) => {
        // console.log(resArr);
      }).finally(() => {
        this.modalLoading = false;
      })
    },
    // 验证
    quantityValidator(rule, value, callback) {
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
      this.previewData = [];
      if (this.isPrintPreview) return;
      this.isPrintPreview = true;
      this.modalLoading = true;
      setTimeout(() => {
        getPrintHtml(this.moduleData, {
          replaceKey: {
            barcode: 'labelCode',
            tagType: 'platformId'
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
    },
    // 打印标签
    printTag() {
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
    }
  }
};
</script>
<style lang="less" scoped>
:deep(.edit-modal-box) {
  .ivu-modal {
    top: 60px;
    width: 80% !important;
    max-width: 700px;
    min-width: 400px;

    .ivu-modal-body {
      max-height: calc(100vh - 200px);
    }
  }

  .ivu-modal-body {
    padding: 0
  }

  .ivu-input[disabled] {
    color: #878787;
  }

  .tag-view {
    margin-bottom: 10px;
    font-size: 0;

    >img {
      border: 2px solid #333;
    }

    .tag-item-view {
      display: inline-block;
    }
  }
}

.edit-modal-contain {
  position: relative;
  max-height: calc(100vh - 200px);
  min-height: 200px;
  padding: 16px 16px 0px 16px;
  overflow: auto;
}

.ivu-modal-body {
  position: relative;

  .ivu-modal-confirm-footer {
    position: sticky;
    bottom: -16px;
    padding: 20px 0;
    text-align: right;
    background: #fff;
  }
}
</style>
