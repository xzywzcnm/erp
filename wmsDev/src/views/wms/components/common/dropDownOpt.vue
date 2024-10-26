<template>
  <Dropdown @on-click="itemChange" transfer>
    <Button type="default" :style="styleData" icon="ios-hammer">
      {{ txt }}
      <Icon type="md-arrow-dropdown"></Icon>
    </Button>
    <DropdownMenu slot="list" v-if="!listenNormal">
      <DropdownItem
        v-for="(v, i) in dropList"
        :name="v.value"
        :key="i"
        v-if="v.flagCode ? v.flagCode.indexOf(v.status) > -1 : ''"
        >{{ v.code }}
      </DropdownItem>
    </DropdownMenu>
    <DropdownMenu slot="list" v-if="listenNormal">
      <DropdownItem v-for="(v, i) in dropList" :name="v.value" :key="i">{{
        v.code
      }}</DropdownItem>
    </DropdownMenu>
  </Dropdown>
</template>

<script>
export default {
  // listenNormal区分发送记录页面下拉框的特殊情况还是其他页面的正常情况
  props: ["dropList", "styleData", "txt", "listenNormal"],
  data() {
    return {};
  },
  methods: {
    itemChange(val) {
      this.$emit("nameValBack", val);
    },
  },
  computed: {},
};
</script>
