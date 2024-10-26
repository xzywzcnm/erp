<template>
  <div class="fullyStepsPage">
    <Steps :current="step" class="status-steps">
      <Step
        :title="item.title"
        :icon="item.icon"
        :content="item.content"
        v-for="(item, index) in stepList"
        :key="index"
      >
      </Step>
    </Steps>
  </div>
</template>

<script>
import { statusReturn, outListStatusList, arrayToObj } from "./fileData";
export default {
  name: "statusStep",
  data() {
    return {
      step: 0,
    };
  },
  props: {
    stepsInfo: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  watch: {
    stepsInfo: {
      handler(val) {
        this.setStep();
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    stepList() {
      let stepList = arrayToObj(
        outListStatusList.map((k) => {
          return {
            content: "",
            icon: "md-cube",
            title: k.label,
            key: k.key,
            sort: k.sort,
          };
        }),
        "sort"
      );
      let stepsInfo = this.stepsInfo;
      // 如果出库单质检类型为免检/没有问题件，对应节点不需要显示
      if ([0, "0"].includes(stepsInfo.qualityCheckType)) {
        delete stepList[3];
        delete stepList[4];
      } else {
        if (
          ["15", "14", "11", "8", "4"].includes(stepsInfo.pickingNewStatus) &&
          stepsInfo.problemNumbers <= 0
        ) {
          delete stepList[4];
        }
      }
      return stepList;
    },
  },
  methods: {
    setStep() {
      if (!this.stepsInfo.pickingNewStatus) return;
      let stepList = this.stepList;
      let data = statusReturn(this.stepsInfo.pickingNewStatus) || {};
      const stepsInfo = this.$common.copy(this.stepsInfo);
      Object.keys(stepList).forEach((key) => {
        let time = stepsInfo[stepList[key].key];
        time = time ? this.$uDate.dealTime(time).slice(0, -3) : "";
        stepList[key].content = time;
      });
      this.step = this.$common.isEmpty(data.sort) ? null : data.sort - 0;
    },
  },
};
</script>

<style lang="less">
.fullyStepsPage {
  .status-steps {
    width: 76%;
    margin: 0 auto;
    padding: 20px 0;

    .ivu-steps-status-process,
    .ivu-steps-status-finish {
      .ivu-steps-head,
      .ivu-steps-title,
      .ivu-steps-head-inner > .ivu-steps-icon,
      .ivu-steps-tail > i,
      .ivu-steps-content {
        color: #2d8cf0 !important;
      }
    }
  }

  .ivu-steps-horizontal .ivu-steps-content {
    padding-left: 30px;
  }
}
</style>
