<template>
  <sliderModal v-model="isShow" :styles="wrapClass" class="attribute-details slider-model">
    <!-- 头部 -->
    <div class="detail-title">
      <span class="title-item" @click="cancel">
        <Icon type="ios-arrow-back" />
        返回列表
      </span>
    </div>
    <!-- 列表 -->
    <attributeDetailList :is-visible.sync="isVisible" :module-data.sync="moduleData"/>
  </sliderModal>
</template>

<script>
// import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import attributeDetailList from './attributeDetailList';

export default {
  mixins: [Mixin],
  components: {
    attributeDetailList: attributeDetailList
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    moduleData: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data () {
    return {
      isShow: false
    };
  },
  watch: {
    isVisible: {
      deep: true,
      handler (val) {
        this.isShow = val;
      }
    },
    isShow: {
      deep: true,
      handler (val) {
        this.$emit('update:isVisible', val);
      }
    }
  },
  created () {},
  computed: {
    wrapClass () {
      return {
        width:
          ((this.domWidth / 24) * (24 - this.$store.state.spanLeft) * 100) /
            this.domWidth +
          '%'
      };
    }
  },
  methods: {
    cancel () {
      this.isShow = false;
    }
  }
};
</script>
<style scoped lang="less">
.attribute-details{
  .detail-title{
    padding: 0 10px 10px 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid #ccc;
    .title-item{
      display:inline-block;
      cursor: pointer;
      font-weight: bold;
    }
  }
}
</style>
