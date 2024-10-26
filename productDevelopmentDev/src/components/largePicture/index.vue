<template>
  <div class="large-pic">
    <Poptip :placement="config.position" :trigger="config.trigger" :transfer="true">
      <img :src="urlconnect(url)" alt="图片" :style="smallSty" crossOrigin="Anonymous">
      <div slot="content" class="pic">
        <img :src="urlconnect(url)" alt="图片" :style="bigSty" crossOrigin="Anonymous">
      </div>
    </Poptip>
  </div>
</template>

<script>
import {urlSetting} from "@/utils/urlSet.js";
export default {
  data () {
    return {
      smallSty: {
        width: "46px",
        height: "46px",
        objectFit: 'cover',
        verticalAlign: 'middle',
        cursor: 'pointer',
        display: 'block',
        border: '1px solid #ccc'
      },
      bigSty: {
        width: "400px",
        height: "auto",
        verticalAlign: "middle",
      },
      defaultImg: './static/images/placeholder.jpg'
    };
  },
  props: {
    config: {
      type: Object,
      default: () => {
        return {
          trigger: 'click',
          position: 'right',
        };
      }
    },
    url: {
      type: String,
      default: ''
    },
    smallStyle: {
      type: Object,
      default: () => {
        return {};
      }
    },
    bigStyle: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  watch: {
    smallStyle: {
      handler (newObj) {
        Object.keys(newObj).forEach(k => {
          this.smallSty[k] = newObj[k];
        });
      },
      immediate: true
    },
    bigStyle: {
      handler (newObj) {
        Object.keys(newObj).forEach(k => {
          this.bigSty[k] = newObj[k];
        });
      },
      immediate: true
    }
  },
  created () { },
  methods: {
    urlconnect (url) {
      if (!url) return this.defaultImg;
      // let reg = /http[s]{0,1}:\/\/([\w.]+\/?)\S*/;
      // //let preUrl = 'http://dyt-srm-test.oss-cn-guangzhou.aliyuncs.com/';
      // if (!reg.test(url)) {
      //   //return preUrl + url;
      //   return url
      // }
      // return url;
      return urlSetting(url);
    }
  }
};
</script>
<style scoped>
.large-pic {
  padding: 6px 0;
}
.large-pic .ivu-poptip {
  display: flex;
  align-items: center;
}
</style>