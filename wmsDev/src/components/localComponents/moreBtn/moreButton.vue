<template>
  <div>
    <div class="moreBtn">
      <Button
        class="firBtn"
        ref="mButton"
        :type="data.btn.type || 'default'"
        @click="data.btn.clickFn()"
        :disabled="data.btn.disabled"
        >{{ data.btn.text }}</Button
      >
      <Select
        v-model="model"
        :style="style"
        transfer
        ref="moreButton"
        v-show="isShowList"
      >
        <Option
          v-for="(item, index) in data.list"
          v-show="!item.hide"
          :value="item.value"
          :disabled="item.disabled ? item.disabled : false"
          @click.native="item.clickFn"
          :key="index"
          ><span>{{ item.text }}</span>
        </Option>
      </Select>
    </div>
  </div>
</template>

<script>
export default {
  name: "moreButton",
  props: {
    data: {
      type: Object,
    },
    dropWidth: {
      default: 120,
    },
  },
  mounted() {
    this.wid = this.$refs.mButton.$el.offsetWidth;
    // this.$refs.moreButton.$refs.dropdown.$el.target.style.width = '100px'
  },
  data() {
    return {
      wid: "",
      model: "",
    };
  },
  computed: {
    isShowList() {
      return (
        this.data.list && this.data.list.length > 0 && this.data.list.some((i) => !i.hide)
      );
    },
    style() {
      return {
        width: this.wid + 16 + "px",
      };
    },
  },
  methods: {},
};
</script>

<style>
.moreBtnSelectDorp {
  width: 120px;
}

.moreBtn .ivu-select-arrow {
  right: 0px !important;
}

.moreBtn .ivu-select-selection:hover,
.moreBtn .ivu-select-selection-focused {
  border-color: #dcdee2;
  background-color: #eee;
}

.moreBtn .ivu-select-visible .ivu-select-selection {
  border-color: #dcdee2;
  box-shadow: 0 0 0 0;
}
</style>
<style scoped>
.moreBtn {
  display: inline-block;
  position: relative;
  height: 32px;
}

.moreBtn .firBtn {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 5;
  cursor: pointer;
}
</style>
