<template>
  <div class="addstock-main">
    <div class="return-back">
      <slot name="lefts">
        <a href="javascript:;" @click="backList">
          <Icon type="ios-arrow-back" class="icon"></Icon>返回列表
        </a>
      </slot>
      <slot name="rights"></slot>
    </div>
    <div class="addstock-container">
      <slot></slot>
    </div>
    <div class="demo-spin-container" v-if="pageLoading">
      <Spin fix></Spin>
    </div>
  </div>
</template>

<script>
export default {
  name: 'detailModel',
  props: {
    pageLoading: {
      type: Boolean,
      default () { return false }
    }
  },
  data () {
    return {}
  },
  methods: {
    // 返回列表
    backList () {
      let { backList } = this.$listeners;
      backList && this.$emit('backList');
    }
  }
}
</script>

<style lang="less" scoped>
.addstock-main {
  position: relative;
  border: 1px solid #e8eaec;
  .demo-spin-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
.return-back {
  position: sticky;
  top: 0;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  background: #f9fafb;
  border-bottom: 1px solid #e8eaec;
  z-index: 10;
  > a {
    color: #657180;
    font-weight: bold;
    display: inline-flex;
    align-items: center;
  }
  .icon {
    font-size: 18px;
  }
}
.addstock-container {
  padding: 0px 16px 10px;
}
</style>
