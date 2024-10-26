<template>
  <div>
    <Modal
      v-model="isVisible"
      title="包装提醒"
      width="1000px"
      :closable="false"
      :mask-closable="false"
      class="printingTipsPage"
    >
      <div>
        <div class="printingTips-content">
          <div class="pakageNo mb10">
            你已完成分拣的单号：{{
              modelData.packageCode
            }}，需要将以下SKU进行烫印印花加工
          </div>
          <div class="item-lists" :class="itemListID">
            <div class="items" v-for="(item, index) in list" :key="index">
              <div class="titles">
                <span class="tags">{{ index + 1 }}</span>
                <span>印花SKU：{{ item.mappingSku }}</span>
              </div>
              <div
                v-for="(itemk, itemI) in item.productGoodsInfoDTOList || []"
                :key="itemI"
              >
                对应LAPA SKU：{{ itemk.productSku }}，件数*{{ itemk.quantity }}
              </div>
              <div class="desc">印花备注：{{ item.remark }}</div>
              <div class="mt10">开发员：{{ item.mappingCreateBy }}</div>
            </div>
          </div>
        </div>
        <Input
          :id="inputID"
          @on-enter="modalConfirm"
          style="
            opacity: 0;
            position: absolute;
            top: 50px;
            left: 0px;
            z-index: -10;
          "
        ></Input>
      </div>
      <div slot="footer" style="text-align: center">
        <Button type="primary" @click="modalConfirm">我知道了（回车）</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import printCommon from "@/utils/printCommon";
export default {
  name: "printingTips",
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false;
      },
    },
    modelData: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      isVisible: false,
      inputID: "",
      itemListID: "",
      timer: null,
      timeNum: 0,
      list: [],
      tagViewHtml: [],
    };
  },
  watch: {
    modelVisible: {
      deep: true,
      handler(val) {
        val && this.initModelData(val);
      },
    },
    isVisible: {
      deep: true,
      handler(val) {
        if (val) return;
        this.$emit("update:modelVisible", val);
        this.clearTime();
      },
    },
  },
  methods: {
    // 窗口打开
    initModelData() {
      let randomId = parseInt(new Date().getTime() + Math.random() * 10000);
      this.inputID = "inputs" + randomId;
      this.itemListID = "item_lists" + randomId;
      this.list = this.modelData.productMapperInfoDTOList || [];

      this.isVisible = true;
      this.$nextTick(() => {
        this.keepInputFocus();
        this.paintHtml();
      });
    },
    // 确认
    modalConfirm() {
      this.isVisible = false;
      this.$nextTick(() => {
        this.$emit("closePrintingModal");
      });
    },
    // 保持input框光标聚焦（因作业扫描流程最终老是sku光标聚焦，所以这里要一直保持光标是聚焦的，直至一分钟后停止定时器）
    keepInputFocus() {
      let inputDom = null;
      let dom = null;
      const fun = () => {
        this.timeNum++;
        inputDom = document.getElementById(this.inputID);
        dom = inputDom ? inputDom.querySelector("input") : null;
        if (!dom) return;
        if (this.timeNum >= 300) this.clearTime();
        dom.focus();
      };
      fun();
      this.timer = setInterval(fun, 200);
    },
    clearTime() {
      clearInterval(this.timer);
      this.timeNum = 0;
    },
    // 绘制要打印的标签
    paintHtml() {
      let dom = document.querySelector("." + this.itemListID);
      let list = dom.children || [];
      let tagViewHtml = [];
      for (let i = 0; i < list.length; i++) {
        tagViewHtml.push(`<div class="items">
            <div style="font-weight:bold;">出库单号：${this.modelData.packageCode}</div>
            ${list[i].innerHTML}
          </div>`);
      }
      // console.log(tagViewHtml);
      this.tagViewHtml = tagViewHtml;
      this.printBoxConfirm().then(() => {
        this.$emit("printReturn");
      });
    },
    printBoxConfirm() {
      return new Promise((resolve) => {
        let fun = (index) => {
          let printList = this.tagViewHtml.slice(index * 20, (index + 1) * 20); //限制打印张数
          if (!printList.length) {
            resolve();
            this.tagViewHtml = [];
            return;
          }
          this.printTag(printList).finally(() => {
            index++;
            fun(index);
          });
        };
        fun(0);
      });
    },
    // 打印标签
    printTag(list) {
      return new Promise((resolve) => {
        let allTagHtml = "";
        list.forEach((item, index) => {
          allTagHtml = `${allTagHtml}${item}`;
        });
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
          .items {
            width: 378px;
            height: 378px;
            font-size: 18px;
            line-height: 20px;
            page-break-after: always;
            padding: 4px;
            word-break: break-all;
            text-align: center;
            margin:0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .titles {
            margin: 14px 0;
            font-size: 20px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .tags {
            border: 1px solid #000;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            margin-right: 2px;
          }
          .desc {
            margin-top: 14px;
          }
          .mt10 {
            margin-top: 10px;
          }
        </style>
        <body>${allTagHtml}</body>
      </html>`;
        printCommon
          .htmlPrint(allTagHtml)
          .then((res) => {
            // console.log(res);
          })
          .finally(() => {
            resolve("finish");
          });
      });
    },
  },
};
</script>
<style lang="less">
.printingTipsPage {
  .pakageNo {
    font-size: 18px;
    font-weight: bold;
  }
  .item-lists {
    display: flex;
    flex-wrap: wrap;
    .items {
      min-width: 50%;
      flex: 1;
      overflow: hidden;
    }
    .titles {
      font-size: 22px;
      font-weight: bold;
      display: flex;
      align-items: center;
      .tags {
        border: 1px solid #000;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        margin-right: 4px;
      }
    }
    .desc {
      margin-top: 10px;
    }
  }
  .mb10 {
    margin-bottom: 10px;
  }
}
</style>