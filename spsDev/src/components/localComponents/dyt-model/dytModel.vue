<template>
  <transition name="modelSlide">
    <div class="search-detail" v-if="modalVisible">
      <div class="model-main">
        <div class="model-main-container">
          <div class="return-back">
            <div class="left-return-back">
              <a href="javascript:;" class="turn-back" @click="backList">
                <Icon type="ios-arrow-back" class="return-backicon"></Icon>
                <span class="return-backtext">返回</span>
              </a>
              <div class="slot-lefts">
                <slot name="lefts"></slot>
              </div>
            </div>
            <div class="right-return-back">
              <slot name="rights"></slot>
            </div>
          </div>
          <div class="content">
            <div class="content-overflow">
              <slot></slot>
            </div>
            <div class="demo-spin-container" v-if="pageLoading">
              <Spin fix></Spin>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "detailModel",
  props: {
    modalVisible: {
      type: Boolean,
      default() {
        return false;
      },
    },
    pageLoading: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {};
  },
  methods: {
    // 返回列表
    backList() {
      let { backList } = this.$listeners;
      backList && this.$emit("backList");
    },
  },
};
</script>

<style lang="less" scoped>
.search-detail {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  z-index: 990;
}

.modelSlide-enter-active,
.modelSlide-leave-active {
  transition: all 0.3s;
}

.modelSlide-enter,
.modelSlide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.model-main {
  height: 100%;

  .model-main-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    border: 1px solid #e8eaec;
  }

  .content {
    flex: 1;
    overflow: hidden;
    position: relative;

    .content-overflow {
      height: 100%;
      padding: 0px 16px 10px;
      overflow: auto;
      width: 100%;
      box-sizing: border-box;
    }
  }

  .return-back {
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    background: #f9fafb;
    border-bottom: 1px solid #e8eaec;

    .left-return-back,
    .right-return-back {
      display: flex;
      align-items: center;
    }

    > a {
      color: #657180;
      font-weight: bold;
      display: inline-flex;
      align-items: center;
    }

    .return-backtext {
      display: inline-block;
      font-size: 16px;
      line-height: 18px;
    }

    .return-backicon {
      font-size: 18px;
    }

    .slot-lefts {
      margin-left: 20px;
    }
  }

  .demo-spin-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
