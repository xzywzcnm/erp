<template>
  <div>
    <!--头部菜单分组-->
    <div v-if="MenuGroup">
      <Submenu
        v-for="(item, index) in subMenuDate"
        :name="item.id"
        :key="index"
        :class="{ headerBg: item.platformType.toLowerCase() === menuBgCur || menuListTitle[item.platformType] == menuBgCur }"
      >
        <template slot="title">
          <span style="text-transform: capitalize;">
            {{ menuListTitle[item.platformType] ? menuListTitle[item.platformType] : item.platformName }}
          </span>
        </template>
        <template v-for="(ele, eIndex) in item.data">
          <MenuGroup v-if="ele.children !== null" :title="ele.name" :key="`group-${eIndex}`">
            <MenuItem v-for="(talg, ids) in ele.children" :name="talg.id" :key="ids">
            <a :href="talg.path">{{ talg.name }}</a>
            </MenuItem>
          </MenuGroup>
          <MenuItem v-else :name="ele.id" :key="`item-${eIndex}`">
          <a :href="ele.path" :key="`a-${eIndex}`">{{ ele.name }}</a>
          </MenuItem>
        </template>
      </Submenu>
      <!--更多平台-->
      <Submenu name="more" v-if="moreData.length > 0">
        <template v-for="item in moreData">
          <template slot="title">
            {{ item.name }}
          </template>
          <MenuAround v-for="(ele, index) in item.children" :name="ele.id" :key="index" placement="right">
            <template slot="subTitle">
              <Menu-item :name="ele.id + '-' + ele.id" :v="ele.id + '-' + ele.id" :key="index">
                {{ menuListTitle[ele.platformType] ? menuListTitle[ele.platformType] : ele.platformName }}
              </Menu-item>
            </template>
            <template slot="around-menu">
              <template v-for="(tips, tIndex) in ele.data">
                <Menu-group :title="tips.name" v-if="tips.children !== null" :key="`tips-${tIndex}`">
                  <Menu-item v-for="talg in tips.children" :name="tips.id + '-' + talg.id" :v="tips.id + '-' + talg.id"
                    :key="talg.id">
                    <a :href="talg.path">{{ talg.name }}</a>
                  </Menu-item>
                </Menu-group>
                <MenuItem v-else :name="tips.id" :key="`tips-item-${tIndex}`">
                <a :href="tips.path" :key="`tips-a-${tIndex}`">{{ tips.name }}</a>
                </MenuItem>
              </template>
            </template>
          </MenuAround>
        </template>
      </Submenu>
    </div>
    <!--侧边栏菜单-->
    <div v-else>
      <template v-for="(item, sIndex) in subMenuDate">
        <Submenu v-if="item.children" :name="item.id" :key="`submenu-${sIndex}`">
          <template>
            <div slot="title" class="white-space-nowrap">
              <i class="icon iconfont" v-if="item.icon" :class="item.icon"></i>
              <i class="icon mr10" v-if="item.lapaIcon" :class="item.lapaIcon"></i>
              <span class="nav-text nav-title-text" style="padding-right: 7px;">{{ item.name }}</span>
            </div>
            <template v-for="(subMenu, chidIndex) in item.children">
              <div v-if="subMenu.children" :key="`child-${chidIndex}`">
                <sub-menu :subMenuDate="[subMenu]"></sub-menu>
              </div>
              <div v-else :key="`child-else-${chidIndex}`">
                <MenuItem :name="subMenu.id" class="white-space-nowrap lis_wrap">
                <a :href="subMenu.path" class="menu_link nav-title-text">
                  <i class="icon iconfont" v-if="subMenu.icon" :class="item.icon"></i>
                  <i class="icon mr10" v-if="subMenu.lapaIcon" :class="subMenu.lapaIcon"></i>
                  <span class="nav-text">{{ subMenu.name }}</span>
                  <span v-if="subMenu.dataItemNum" class="numMarks">{{ subMenu.dataItemNum }}</span>
                </a>
                </MenuItem>
              </div>
            </template>
          </template>
        </Submenu>
        <MenuItem v-else :name="item.id" class="white-space-nowrap" :key="`MenuItem-${sIndex}`">
        <a :href="item.path" class="menu_link nav-text nav-title-text" :key="`MenuItem-a-${sIndex}`">
          <i class="icon iconfont" :class="item.icon" v-if="item.icon"></i>
          <i class="icon mr10" v-if="item.lapaIcon" :class="item.lapaIcon"></i>
          <span>{{ item.name }}</span>
          <span v-if="item.dataItemNum" class="numMarks">{{ item.dataItemNum }}</span>
        </a>
        </MenuItem>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'subMenu',
  props: {
    subMenuDate: { // 数据源
      type: Array
    },
    showIcon: { // 是否展示图标
      type: Boolean,
      default: true
    },
    MenuGroup: { // 开启分组模式
      type: Boolean,
      default: false
    },
    moreData: { // 更多平台--数据源
      type: Array,
      defalut: []
    }
  },
  data () {
    return {
      menuListTitle: {
        definePlatform: '自定义渠道',
        allplatform: '全平台'
      },
    }
  },
  computed: {
    // 默认选中平台的颜色变量
    menuBgCur () {
      const platform = (this.$store.state.inGroup || '');
      return this.menuListTitle[platform] ? this.menuListTitle[platform] : platform;
    }
  },
  watch: {
    /* 当前在更多平台中通过a标签跳转切换平台时，页面不会重新刷新加载页面，
    * 可能与之前封装菜单导航插件有相关影响导致的，当前的处理方案是在更多
    * 平台中切换平台时，监听平台的参数是否同一个平台，如果不是就进行页面
    * 加载成功后进行强制刷新。
    * */
    $route (to, from) {
      if (to.query && from.query) {
        let newPlatform = to.query.platform;
        let oldPlatform = from.query.platform;
        if (newPlatform !== oldPlatform) {
          window.location.reload();
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
.white-space-nowrap {
  // white-space: pre-wrap;
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  .menu_link {
    color: #495060;
    display: flex;
    align-items: center;
    position: relative;

    &:hover {
      color: #2d8cf0;
    }
  }
}

// .menu_items {
//   padding: 6px 24px 6px 24px;
// }

.iconfont {
  margin-right: 10px;
}

a:hover {
  span {
    text-decoration: underline;
  }
}

.nav-title-text {
  flex: 1;
  overflow: hidden;
}

.nav-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
}

.ivu-menu .lis_wrap {
  padding-left: 60px !important;
}
</style>
