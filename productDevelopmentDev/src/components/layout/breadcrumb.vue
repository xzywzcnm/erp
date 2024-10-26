<template>
  <!-- 面包屑 -->
  <Breadcrumb>
    <BreadcrumbItem v-for="(item, index) in BreadMenuData" :to="item.path ? item.path.includes('/details') ? null: item.path : null" :key="index">
      {{ item.name }}
    </BreadcrumbItem>
  </Breadcrumb>
</template>

<script>
import Mixin from "../mixin/commonMixin";
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
      BreadMenuAllData: []
    };
  },
  created () {
    this.setBreadMenuData();
    this.getBreadMenuData();
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
      let breadMenuList = this.BreadMenuAllData.filter(i => i.path === this.$route.path);
      this.BreadMenuData = breadMenuList.length && breadMenuList[0].breadMenu;
    }
  },
  watch: {
    '$route': {
      handler: 'getBreadMenuData',
      deep: true
    }
  }
};
</script>

<style scoped>
.layout-breadcrumb {
  font-size: 15px;
}
</style>
