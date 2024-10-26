<template>
  <div v-if="powerList.length" style="display:inline-block;">
    <Dropdown v-if="dropdownMenuList.length" v-bind="$attrs" v-on="$listeners" transfer @on-click="commandChange">
      <div>
        <Button type="primary" :disabled="defaultBtn.disabled" @click="commandChange(defaultBtn.command)"
          :loading="loading">
          {{ defaultBtn.label }}
          <Icon style="margin-left: 2px" type="md-arrow-dropdown"></Icon>
        </Button>
      </div>
      <DropdownMenu slot="list">
        <DropdownItem v-for="(item, index) in dropdownMenuList" :key="index" :name="item.command"
          :disabled="loading || item.disabled">
          {{ item.label }}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
    <Button v-else type="primary" :disabled="defaultBtn.disabled" @click="commandChange(defaultBtn.command)"
      :loading="loading">
      {{ defaultBtn.label }}
    </Button>
  </div>
</template>
<script>
export default {
  name: "DytDropdown",
  props: {
    dropdownList: {
      type: Array,
      default() { return [] }
    },
    loading: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {}
  },
  computed: {
    powerList() {
      let list = this.dropdownList.filter(k => k.power);
      return list;
    },
    defaultBtn() {
      return this.powerList[0] || {};
    },
    dropdownMenuList() {
      return this.powerList.slice(1);
    }
  },
  methods: {
    commandChange(e) {
      this.$emit('commandChange', e);
    },
  },
}
</script>
<style lang="less" scoped>
.detailModel__main {

  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.5s;
  }

  .fade-enter,
  .fade-leave-to

  /* .fade-leave-active below version 2.1.8 */
    {
    opacity: 0;
    transform: translateX(100%);
  }

  .detailModel__main__page {
    background: #fff;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  }

  .detailModel__main__page__content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .page__content__acticle {
    flex: 1;
    overflow: hidden;
  }

  .page__content__footer {
    padding: 20px 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>