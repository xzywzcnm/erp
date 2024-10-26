<template>
  <div class="order-block">
    <large-picture :url="row.imgUrl || row.thumbUrl">
      <slot name="picslot"></slot>
    </large-picture>
    <div class="order-item">
      <div class="order-li" v-if="!orderChange">
        订单：
        <slot name="link"></slot>
        <slot name="order"></slot>
      </div>
      <div class="order-li">
        SKU：{{ row.skuNo || "-" }}
        <slot name="sku"></slot>
        <Tooltip
          :content="ruleTips"
          v-if="ruleTips"
          placement="right"
          transfer
          maxWidth="200"
        >
          <Icon type="md-warning" class="iconContent" />
        </Tooltip>
      </div>
      <div class="order-li">供方货号：{{ row.supplierNo || "-" }}</div>
      <div class="order-li--text">
        <Tooltip
          :content="row.goodsName"
          max-width="200"
          :disabled="!(row.goodsName && row.goodsName.length > 18)"
          :transfer="true"
        >
          <div class="order-li--text">名称：{{ row.goodsName || "-" }}</div>
        </Tooltip>
      </div>
      <div class="order-li--text">
        <Tooltip
          :content="row.specifications"
          max-width="200"
          :disabled="!(row.specifications && row.specifications.length > 18)"
          :transfer="true"
        >
          <div class="order-li--text" style="color: #135f0e">
            {{ row.specifications || "-" }}
          </div>
        </Tooltip>
      </div>
      <div class="btn-list">
        <Tooltip
          content="备货类型"
          :transfer="true"
          v-if="row.readyType != null"
        >
          <div
            class="tags-span"
            :style="
              row.readyType == 0 ? statuStyle['error'] : statuStyle['primary']
            "
          >
            {{ purchaseList[row.readyType].label }}
          </div>
        </Tooltip>
        <Tooltip content="状态" :transfer="true" v-if="row.status != null">
          <div
            class="tags-span"
            :style="row.status < 7 ? statuStyle['success'] : statuStyle['info']"
          >
            {{ statusText(row.status) }}
          </div>
        </Tooltip>

        <Tooltip
          :content="`可发货时间：${row.deliveryTime || '-'}`"
          v-if="row.supplyStatus > 0"
          :transfer="true"
        >
          <div class="tags-span" :style="statuStyle['warnning']">
            {{
              supplyStatusList[row.supplyStatus] &&
              supplyStatusList[row.supplyStatus].label
            }}
          </div>
        </Tooltip>
        <Tooltip
          :content="`生产完成时间：${row.productionFinishTime || '-'}`"
          v-if="row.feedbackType === 0 || row.feedbackType === 1"
          :transfer="true"
        >
          <div class="tags-span" :style="statuStyle['primary']">
            {{
              progressList[row.feedbackType] &&
              progressList[row.feedbackType].label
            }}
          </div>
        </Tooltip>
        <Tooltip content="订单类型" :transfer="true" v-if="row.orderType || row.orderType === 0">
          <div class="tags-span" :style="statuStyle['primary']">
            {{
              row.orderType == 1 ? "线上" : row.orderType == 2 ? "1688" : "线下"
            }}
          </div>
        </Tooltip>
        <Tooltip content="是否急单" :transfer="true">
          <div
            class="tags-span"
            :style="statuStyle['error']"
            v-if="row.iscrash == 1"
          >
            紧急
          </div>
        </Tooltip>
      </div>
    </div>
  </div>
</template>
<script>
import {
  tablist,
  supplyStatusList,
  progressList,
  purchaseTypeList,
  purchaseList,
} from "./configFile";
import largePicture from "@/components/largePicture";
export default {
  name: "BasicDataCom",
  components: { largePicture },
  data() {
    return {
      progressList,
      supplyStatusList,
      purchaseList,
      purchaseTypeList,
      row: {},
      statuStyle: {
        primary: {
          color: "#2D8CF0",
          backgroundColor: "rgba(45, 140, 240, .1)",
        },
        error: { color: "#EB2F96", backgroundColor: "rgba(235, 47, 150, .1)" },
        success: { color: "#3CB034", backgroundColor: "rgba(60, 176, 52, .1)" },
        warnning: {
          color: "#FF9E20",
          backgroundColor: "rgba(255, 158, 32, .1)",
        },
        info: { color: "#5D7092", backgroundColor: "rgba(93, 112, 146, 0.1)" },
        blue: { color: "blue", backgroundColor: "rgba(0, 0, 255, 0.1)" },
      },
      orderChange: false, // 采购单--下单后修改
      ruleTips: "",
    };
  },
  props: {
    dataRow: {
      type: Object,
      default() {
        return {};
      },
    },
    isOrderChange: {
      type: Boolean,
      default() {
        return false;
      },
    },
    enterType: {
      type: String,
      default() {
        return "";
      },
    },
  },
  watch: {
    dataRow: {
      handler(data) {
        this.row = JSON.parse(JSON.stringify(data));
        this.orderChange = this.isOrderChange;
        this.showRuleTips();
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    // 状态
    statusText(status) {
      let name = "";
      tablist.forEach((k) => {
        if (k.value !== "all" && k.value - 0 === status) {
          name = k.label;
        }
      });
      return name;
    },
    purchaseText(type) {
      let name = "";
      purchaseTypeList.forEach((k) => {
        if (k.value == type) {
          name = k.label;
        }
      });
      return name;
    },
    showRuleTips() {
      if (
        this.enterType == "detail" &&
        this.row.ruleNameList &&
        this.row.ruleNameList.length > 0
      ) {
        let showTips = "";
        showTips = this.row.ruleNameList.join("\n");
        this.ruleTips = "审核规则：" + showTips;
      }
    },
  },
};
</script>
<style scoped>
.order-block,
.order-li {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}
.order-block {
  padding: 4px 0;
}
.order-item {
  margin-left: 10px;
  flex: 1;
  overflow: hidden;
  margin-bottom: -4px;
}
.order-item .order-li .alink {
  text-decoration: underline;
}
.btn-list > span,
.btn-list > div {
  white-space: nowrap;
}
.btn-list > span:not(:last-child),
.btn-list > div:not(:last-child) {
  margin-right: 6px;
}
.iconSty {
  font-size: 16px;
  cursor: pointer;
}
.order-li--text,
.order-li--text .ivu-tooltip,
.order-li--text .ivu-tooltip-rel {
  width: 100%;
  height: 18px;
  margin-bottom: 4px;
}
.order-li--text {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tags-span {
  font-size: 12px;
  font-weight: 400;
  padding: 2px 4px;
  line-height: 16px;
  border-radius: 2px;
  /* margin-bottom: 4px; */
}
.iconContent {
  margin-left: 15px;
  font-size: 18px;
  color: orange;
}
.test {
  justify-content: reverse;
}
</style>