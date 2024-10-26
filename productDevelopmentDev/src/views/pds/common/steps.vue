<template>
  <div class="steps clearfix">
    <div
      class="steps-item"
      :style="styles"
      v-for="(item, index) in data"
      :key="index"
    >
      <span
        class="steps-line"
        v-show="index < data.length - 1"
      ></span>
      <span
        class="steps-title"
        :class="{
          active: item.finish === 'finish',
          doNow: item.finish === 'do',
        }"
      >
        <span
          class="steps-index fl"
          v-if="item.finish === 'finish'"
        >
          <Icon type="md-checkmark" />
        </span>
        <span
          v-else
          class="steps-index fl"
        >{{ index + 1 }}</span>
        <span
          v-if="item.title instanceof Array"
          class="steps-box fl"
          :style="item.style"
        >
          <span
            class="steps-box-item"
            v-for="(child, childIndex) in item.title"
            :key="childIndex"
            :class="{ itemActive: child.finish }"
            v-html="child.tit"
          ></span>
        </span>
        <span
          class="steps-text"
          v-else
          v-html="item.title"
        ></span>
      </span>
    </div>
  </div>
</template>

<script>
/**
 * finish:  'finish' ,'do'
 *
 * */
export default {
  name: "vSteps",
  props: {
    data: {
      type: Array,
      default: () => {
        return []
      }
    },
  },
  methods: {},
  computed: {
    styles() {
      return {
        width: 100 / this.data.length + "%",
      };
    },
  },
};
</script>

<style scoped>
.steps {
  position: relative;
  display: flex;
  font-weight: bold;
  color: #999;
}

.steps-item {
  position: relative;
  height: 30px;
}

.doNow .steps-index {
  background-color: #2d8cf0;
  border: 1px solid #2d8cf0;
  color: #ffffff;
}

.doNow .steps-text {
  color: #2d8cf0;
}

.steps-title {
  position: absolute;
  left: 0;
  top: 0;
  height: 30px;
  line-height: 30px;
  background-color: #fff;
  padding: 0 10px;
}

.steps-line {
  position: absolute;
  width: 100%;
  height: 1px;
  background-color: #878787;
  top: 15px;
}

.steps-index {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid #ddd;
  display: inline-block;
  text-align: center;
  margin-right: 5px;
}

.steps-box {
  position: relative;
}

.steps-box-item {
  position: relative;
  display: block;
}

.active .steps-index {
  border-color: #70b1f5;
}

.active .ivu-icon {
  color: #2d8cf0;
  font-weight: bold;
  font-size: 16px;
}

.active .steps-text {
  color: #000;
}

.itemActive {
  color: #000;
}

.steps-box-item:before {
  content: "";
  height: 1px;
  width: 50px;
  background-color: #878787;
  top: 15px;
  position: absolute;
  left: -56px;
}

.steps-box-item:nth-child(2):before {
  height: 0;
}

.steps-box-item:nth-child(2):after {
  height: 61px;
  width: 1px;
  background-color: #878787;
  left: -56px;
  position: absolute;
  content: "";
  top: -15px;
}

.steps-item:nth-child(4) .steps-index {
  position: absolute;
  left: 10px;
}

.steps-item:nth-child(4) .steps-box {
  margin-left: 35px;
}
</style>
