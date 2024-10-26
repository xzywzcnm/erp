<template>
  <div>
    <template v-for="item in subMenuDate">
      <Submenu v-if="item.children" :name="item.id">
        <template>
          <div slot="title" class="white-space-nowrap">
            <i class="icon iconfont" v-if="item.icon" :class="item.icon"></i>
            <span class="nav-text nav-title-text">{{ item.name }}</span>
          </div>
          <template v-for="(subMenu, index) in item.children">
            <div v-if="subMenu.children" :key="index">
              <sub-menu :subMenuDate="[subMenu]"></sub-menu>
            </div>
            <div v-else class="lav-uls" :key="`d_${index}`">
              <MenuItem :name="subMenu.id" :to="subMenu.path" class="white-space-nowrap uls-space-nowrap">
              <i class="icon iconfont" v-if="subMenu.icon" :class="item.icon"></i>
              <span class="nav-text">{{ subMenu.name }}</span>
              </MenuItem>
            </div>
          </template>
        </template>
      </Submenu>
      <MenuItem v-else :name="item.id" :to="item.path" class="white-space-nowrap">
      <i class="icon iconfont" :class="item.icon" v-if="item.icon"></i>
      <span>{{ item.name }}</span>
      </MenuItem>
    </template>
  </div>
</template>

<script>
export default {
  name: 'subMenu',
  props: {
    subMenuDate: {
      type: Array
    }
  }
};
</script>
<style scoped>
.white-space-nowrap {
  /* white-space: nowrap; */
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.white-space-nowrap .nav-title-text {
  flex: 1;
}
.white-space-nowrap .nav-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.iconfont {
  margin-right: 10px;
}

a:hover {
  text-decoration: underline;
}

.lav-uls {
  height: 36px;
}
.lav-uls .uls-space-nowrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 0 0 60px !important;
}
</style>
