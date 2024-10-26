<template>
  <div>
    <template v-for="(item, index) in subMenuDate">
      <Submenu v-if="item.children" :name="item.id" :key="index" class="nav-title">
        <template>
          <div slot="title" class="white-space-nowrap">
            <i class="icon iconfont" v-if="item.icon" :class="item.icon"></i>
            <span class="nav-text nav-title-text">{{ item.name }}</span>
          </div>
          <template v-for="(subMenu, sIndex) in item.children">
            <div v-if="subMenu.children" :key="`d-${sIndex}`">
              <sub-menu :subMenuDate="[subMenu]"></sub-menu>
            </div>
            <div v-else :key="`d1-${sIndex}`" class="lav-uls">
              <MenuItem :name="subMenu.id" :to="subMenu.path" class="uls-space-nowrap">
              <i class="icon iconfont" v-if="subMenu.icon" :class="item.icon"></i>
              <span class="nav-text">{{ subMenu.name }}</span>
              <span v-if="subMenu.dataItemNum" class="numMark">{{subMenu.dataItemNum }}</span>
              </MenuItem>
            </div>
          </template>
        </template>
      </Submenu>
      <MenuItem v-else :name="item.id" :to="item.path" class="white-space-nowrap" sIndex :key="`d-${index}`">
      <i class="icon iconfont" :class="item.icon" v-if="item.icon"></i>{{ item.name }}
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
