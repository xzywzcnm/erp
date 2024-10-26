<template>
  <div>
    <template v-for="(item, tIndex) in subMenuDate">
      <Submenu v-if="item.children" :name="item.id" :key="`t-${tIndex}`">
        <template>
          <div slot="title" class="white-space-nowrap">
            <i class="icon iconfont" v-if="item.icon" :class="item.icon"></i>
            <span class="nav-text nav-title-text">{{ item.name }}</span>
          </div>
          <template v-for="(subMenu, dIndex) in item.children">
            <div v-if="subMenu.children" :key="`d-${dIndex}`">
              <sub-menu :subMenuDate="[subMenu]"></sub-menu>
            </div>
            <div v-else :key="`ds-${dIndex}`" class="lav-uls">
              <MenuItem :name="subMenu.id" :to="`${subMenu.path}?warehouseId=${warehouseId}`" class="white-space-nowrap uls-space-nowrap">
              <i class="icon iconfont" v-if="subMenu.icon" :class="item.icon"></i>
              <span class="nav-text nav-title-text">{{ subMenu.name }}</span>
              <span v-if="subMenu.dataItemNum" class="numMarks">{{ subMenu.dataItemNum }}</span>
              </MenuItem>
            </div>
          </template>
        </template>
      </Submenu>
      <MenuItem v-else :name="item.id" :to="`${item.path}?warehouseId=${warehouseId}`" class="white-space-nowrap" :key="`ts-${tIndex}`">
      <i class="icon iconfont" :class="item.icon" v-if="item.icon" :key="`t6-${tIndex}`"></i>
      <span class="nav-text nav-title-text" :key="`s-${tIndex}`">{{ item.name }}</span>
      </MenuItem>
    </template>
  </div>
</template>

<script>
import { getWarehouseId } from '@/utils/getService';

export default {
  name: 'subMenu',
  data: function() {
    return {
      warehouseId: getWarehouseId()
    };
  },
  props: {
    subMenuDate: {
      type: Array
    }
  }
};
</script>
<style scoped>
.white-space-nowrap {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.white-space-nowrap .nav-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.white-space-nowrap .nav-title-text {
  flex: 1;
}
.lav-uls {
  height: 36px;
}
.lav-uls .uls-space-nowrap[data-v-1e242a2c] {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 30px 0 60px !important;
  position: relative;
}
.iconfont {
  margin-right: 10px;
}
a:hover {
  text-decoration: underline;
}
</style>
