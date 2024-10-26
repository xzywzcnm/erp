<template>
  <div class="flowChart">
    <div class="flowChart_flow">
      <div class="flowChart_main">
        <div v-for="(item, index) in topList" :key="index + 'topList'" class="flowChart_flow_list">
          <div class="circle-block-main" :class="{ activeColor: item.circleActive }">
            <!-- 圆圈 -->
            <div class="circle">{{ item.circleText }}</div>
            <!-- 文字 -->
            <div class="tips-text">{{ item.label }}</div>
            <!-- 切割线 -->
            <div class="split-line" :class="{ lineActiveColor: item.lineActiveColor }"></div>
          </div>
        </div>
      </div>
      <!-- 下边模块 -->
      <div class="next-block">
        <template v-for="(item, index) in bottomList">
          <!-- 部分分配 -->
          <div v-if="item.value == 1" :key="index + 'bottomList'" class="next-items part-items">
            <div class="circle-bottom-main" :class="{ activeColor: item.circleActive }">
              <!-- 圆圈 -->
              <div class="real-circle">
                <div class="part-line-left"></div>
              </div>
              <!-- 文字 -->
              <div class="tips-text">{{ item.label }}</div>
            </div>
          </div>
          <!-- 订单作废 -->
          <div v-if="item.value == 99" :key="index + 'bottomList'" class="next-items fail-items">
            <div class="circle-bottom-main" :class="{ activeColor: item.circleActive }">
              <!-- 圆圈 -->
              <div class="real-circle">
                <div class="fail-line-left" :class="{ leftActive: item.leftActiveColor }"></div>
                <div class="fail-line-column" :class="{ columnActive: item.columnActiveColor }"></div>
                <div class="fail-line-leftdiv" :class="{ leftdivActive: item.leftdivActiveColor }"></div>
                <div class="fail-line-rightdiv" :class="{ rightdivActive: item.rightdivActiveColor }"></div>
              </div>
              <!-- 文字 -->
              <div class="tips-text">{{ item.label }}</div>
            </div>
          </div>
        </template>
      </div>

    </div>
  </div>
</template>

<script>
import { outListStatusList } from './fileData';
export default {
  name: 'flowChart',
  data() {
    return {
      topList: [],
      bottomList: {}
    }
  },
  props: {
    row: {
      type: Object,
      default: () => { return {} }
    }
  },
  created() {
    this.initChart();
  },
  methods: {
    initChart() {
      //   let activeIndex = -1;
      // statusChange:订单失败记录状态；96创建到作废 97部分分配到作废 98分配完成到作废 99生成拣货单到作废
      let { pickingNewStatus, statusChange, pickingType } = this.row || {};
      let [topList, bottomList] = [[], []];
      let failStatusList = {
        '96': { process: ['0', '99'] },
        '97': { process: ['0', '1', '99'], leftActiveColor: true },
        '98': { process: ['0', '2', '99'], leftdivActiveColor: true, columnActiveColor: true },
        '99': { process: ['0', '2', '9', '99'], rightdivActiveColor: true, columnActiveColor: true }
      };// 订单失效的高亮流程
      //   console.log(pickingNewStatus, statusChange);
      let statusList = this.$common.copy(outListStatusList).filter(k => {
        return !(pickingType === 'O11' && k.value === '12');// temu无上传外箱标签状态
      })
      let list = statusList.sort((a, b) => { return a - b }); // 流程排好序
      let activeItem = list.find(k => k.value === pickingNewStatus) || {};
      list.forEach((item, index) => {
        if (pickingNewStatus == 99) {
          let failArr = failStatusList[statusChange] || {};
          if ((failArr.process || []).includes(item.value)) item.circleActive = true;
          item.leftdivActiveColor = !!failArr.leftdivActiveColor; // 左上线
          item.rightdivActiveColor = !!failArr.rightdivActiveColor; // 右上线
          item.columnActiveColor = !!failArr.columnActiveColor; // 竖线
          item.leftActiveColor = !!failArr.leftActiveColor; // 左横线
          if ((statusChange === '98' && item.value === '0') || (statusChange === '99' && item.value < 3)) {
            item.lineActiveColor = true; // 右横线
          }
        } else {
          item.circleActive = item.sort <= activeItem.sort;
          if (pickingNewStatus > 1 && item.value == 1) item.circleActive = false; // 状态超过部分分配，部分分配不需要高亮
          item.lineActiveColor = activeItem.value > 1 && item.sort < activeItem.sort; // 右横线
        }
        // 上下
        if (item.value == 1) {
          bottomList['0'] = item;
        } else if (item.value == 99) {
          bottomList['1'] = item;
        } else {
          topList.push(item);
        }
      })
      // 顶部列表显示序号
      topList = topList.map((topItem, index) => {
        topItem.circleText = index + 1;
        return topItem;
      })
      // console.log(topList, bottomList);
      this.topList = topList;
      this.bottomList = bottomList;
    }
  }
}
</script>

<style lang="less" scoped>
@lineColor: #d6d6d6; //线条颜色
@defaultColor: #999999; //无选中颜色
@activeColor: #2d8cf0; //选中颜色
@circlePadding: 16px; //圆圈所处高度

.flowChart {
  height: 160px;
  padding: 0 30px;
  font-weight: 400;
  display: flex;
  align-items: center;
  color: @defaultColor;
  font-family: PingFang SC;
  //   border-radius: 6px;
  background: #fffbea;
  border: 1px solid rgba(248, 172, 89, 0.6);

  .flowChart_flow {
    height: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    .flowChart_main {
      display: flex;
      align-items: center;
    }
  }

  .flowChart_flow_list {
    .circle-block-main {
      display: flex;
      align-items: center;

      .circle {
        font-size: 16px;
        line-height: 15px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid @defaultColor;
      }

      .tips-text {
        font-size: 14px;
        padding-left: 6px;
      }
    }

    &:not(:last-child) {
      .split-line {
        width: 40px;
        height: 1px;
        background: @lineColor;
        margin: 0 4px;
      }
    }
  }

  .next-block {
    width: 100%;
    display: flex;
    margin-top: 30px;

    .next-items {
      .real-circle {
        width: 12px;
        height: 12px;
        background: @lineColor;
        border-radius: 50%;
        margin: 0 auto;
        position: relative;
        padding-bottom: 6px;
      }
    }

    .part-items {
      margin-left: 32px;

      .part-line-left {
        position: absolute;
        right: 100%;
        bottom: 50%;
        width: 46px;
        height: 36px;
        border: 1px solid @lineColor;
        border-top-width: 0px;
        border-right-width: 0px;
        transform: translateY(1px);
      }
    }

    .fail-items {
      margin-left: 84px;

      .fail-line-left {
        position: absolute;
        right: 100%;
        bottom: 50%;
        width: 128px;
        height: 0px;
        border-bottom: 1px solid @lineColor;
        transform: translateY(50%);
      }

      .fail-line-column {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        bottom: 100%;
        width: 0px;
        border-left: 1px solid @lineColor;
        height: 16px;
        background: @lineColor;
      }

      .fail-line-leftdiv {
        position: absolute;
        right: 50%;
        bottom: 28px;
        width: 64px;
        height: 14px;
        border: 1px solid @lineColor;
        border-top-width: 0px;
        border-right-width: 0px;
      }

      .fail-line-rightdiv {
        position: absolute;
        left: 51%;
        bottom: 28px;
        width: 66px;
        height: 14px;
        border: 1px solid @lineColor;
        border-top-width: 0px;
        border-left-width: 0px;
      }
    }
  }

  // 高亮
  .flowChart_flow {
    .activeColor {
      .circle {
        color: #fff;
        background: @activeColor;
        border: 1px solid @activeColor;
      }

      .real-circle {
        background: @activeColor;

        .part-line-left {
          border-color: @activeColor;
        }
      }

      .tips-text {
        color: @activeColor;
        font-weight: 600;
      }

      .lineActiveColor.split-line {
        background: @activeColor;
      }
    }

    .leftdivActive.fail-line-leftdiv,
    .rightdivActive.fail-line-rightdiv,
    .columnActive.fail-line-column,
    .leftActive.fail-line-left {
      border-color: @activeColor;
    }
  }
}
</style>
