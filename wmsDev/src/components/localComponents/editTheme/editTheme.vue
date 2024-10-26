<template>
  <Drawer width="300" :closable="false" v-model="model">
    <div slot="header" class="flex-box item-align-center">
      <span class="font-16">{{ t('key001') }}</span>
      <Tooltip content="修改主题只保存在当前机器">
        <Icon class="ml10" type="ios-information-circle-outline" size="14" />
      </Tooltip>
    </div>
    <div class="flex-box mb10 flex-between"><span>主色调</span>
      <themePicker :colorValue="themeColor"></themePicker>
    </div>
    <div class="flex-box mb10 flex-between"><span>头部背景</span>
      <ColorPicker class="theme-picker" :recommend="true" @on-change="topBackgroundColorChange"
        v-model="topBackgroundColor">
      </ColorPicker>
    </div>
    <Button @click="resetTheme">重置主题</Button>
  </Drawer>
</template>

<script>
import themePicker from "./themePicker";
const TOPBACKGROUNDCOLOR = '#113f6d'; // 头部背景色
const THEMECOLOR = '#2d8cf0'; // 主题色
export default {
  name: "editTheme",
  props: {
    componentsText: {
      type: Object
    }
  },
  components: {
    themePicker
  },
  data() {
    return {
      model: false,
      themeColor: THEMECOLOR,
      topBackgroundColor: TOPBACKGROUNDCOLOR
    };
  },
  created() {
    if (localStorage.getItem('theme')) {
      let data = JSON.parse(localStorage.getItem('theme'))
      this.themeColor = data.themeColor || THEMECOLOR;
      this.topBackgroundColor = data.topBackgroundColor || TOPBACKGROUNDCOLOR;
    }
  },
  watch: {
    topBackgroundColor: {
      handler(n, o) {
        if (n && n !== o) {
          this.$nextTick(() => {
            this.topBackgroundColorChange(n, 'noSave');
          })
        }
      },
      immediate: true
    },
  },
  methods: {
    /**
     * @Description: 重置
     * @author gan
     * @date: 2021/1/15 9:28
     */
    resetTheme() {
      localStorage.removeItem('theme');
      this.themeColor = THEMECOLOR;
      this.topBackgroundColorChange(TOPBACKGROUNDCOLOR, 'noSave');
    },
    /**
     * @Description: 设置缓存
     * @author gan
     * @date: 2021/1/15 9:28
     */
    setThemeStorage(key, value) {
      let data = {};
      if (localStorage.getItem('theme')) {
        data = JSON.parse(localStorage.getItem('theme'));
        data[key] = value;
        localStorage.setItem('theme', JSON.stringify(data));
      } else {
        data[key] = value;
        localStorage.setItem('theme', JSON.stringify(data));
      }
    },
    /**
     * @Description: 设置背景
     * @author gan
     * @param value 设置的值
     * @param type 操作类型
     * @date: 2021/1/15 9:24
     */
    topBackgroundColorChange(value, type) {
      if (!value) return;

      if (type !== 'noSave') {
        this.setThemeStorage('topBackgroundColor', value)
      }
      let node = document.getElementsByClassName('top-container')[0];
      let node1 = document.querySelector('.header_nav .ivu-menu');
      node && (node.style.backgroundColor = value);
      if (node1) {
        node1.style.backgroundColor = value;
      }
    },
    open() {
      this.model = true;
    }
  }
}
</script>

<style scoped>
.flex-box {
  display: flex;
}

.flex-between {
  justify-content: space-between;
}

.item-align-center {
  justify-items: center;
}

.mb10 {
  margin-bottom: 10px;
}</style>
