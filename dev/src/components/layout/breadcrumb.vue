<template>
  <!-- 面包屑 -->
  <div class="layout-breadcrumb">
    <Breadcrumb>
      <BreadcrumbItem v-for="(item, index) in BreadMenuData" :key="`item-${index}`">
        {{
          menuListTitle[item.name] ? menuListTitle[item.name] : item.name
        }}
      </BreadcrumbItem>
    </Breadcrumb>
  </div>
</template>

<script>
import Mixin from '@/components/mixin/common_mixin';
import menuCommon from '@/api/menu/common/menuCommon';

export default {
  name: 'breadcrumb',
  mixins: [Mixin],
  props: {
    menu: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      BreadMenuData: [],
      BreadMenuAllData: [],
      menuListTitle: {
        definePlatform: '自定义渠道',
        allplatform: '全平台'
      },
    };
  },
  created () {
    // this.setBreadMenuData();
    // this.getBreadMenuData();
  },
  methods: {
    setBreadMenuData () {
      /**
       * @Description:设置面包屑
       * @author gan
       * @date: 2020/12/18 16:00
       */
      let v = this;
      if (!v.menu) return [];
      function setId (data, breadIndex) {
        data.forEach((i) => {
          if (!i.breadMenu) i.breadMenu = [];
          i.breadMenu[i.breadIndex] = {
            name: i.name,
            path: i.path
          };
          if (!i.path) i.path = null;
          if (i.children && i.children.filter(i => i.menuHide).length === i.children.length) {
            v.BreadMenuAllData.push(i);
          }
          if (i.children && i.children.length > 0) {
            i.children.forEach(j => {
              j.breadMenu = JSON.parse(JSON.stringify(i.breadMenu));
              j.breadIndex = i.breadIndex + 1;
            });
            setId(i.children, breadIndex);
          } else {
            v.BreadMenuAllData.push(i);
          }
        });
      }
      setId(v.menu.map(i => {
        return {
          ...i,
          breadIndex: 0
        };
      }), 0);
    },
    getBreadMenuData () {
      let path = '/' + (this.$route.path).split('/')[1];
      let inGroup = this.$store.state.inGroup;
      let item = {};
      const filterVal = this.BreadMenuAllData.filter(i => i.path && i.path.includes(path));
      if (filterVal[0] && filterVal[0].breadMenu) {
        this.BreadMenuData = this.$common.copy(filterVal[0].breadMenu);
      }
      // 当当前菜单为订单系统某个平台时，在面包屑加入平台名
      var platformList = Object.keys(menuCommon.menuOrder);
      if (platformList.indexOf(inGroup) > -1 && (this.BreadMenuData[0] && this.BreadMenuData[0].name !== inGroup)) {
        item.name = inGroup;
        this.BreadMenuData.unshift(item);
      }
    }
  },
  watch: {
    '$route': {
      handler: 'getBreadMenuData',
      deep: true
    },
    'menu': {
      handler () {
        this.setBreadMenuData();
        this.getBreadMenuData();
      },
      deep: true
    }
  }
};
</script>

<style lang="less">
.layout-breadcrumb {
  font-size: 15px;

  :deep(.ivu-breadcrumb-item-link) {
    text-transform: capitalize;
  }
}
</style>
