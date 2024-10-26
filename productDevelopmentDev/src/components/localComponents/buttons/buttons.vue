<template>
  <div>
    <ButtonGroup :class="groupClass">
      <Button
        v-for="(item, index) in data"
        :key="index"
        :class="{ 'ivu-btn-primary': item.value === value }"
        @click="tagStepBtn(item, data)"
        >{{ item.label }}</Button
      >
    </ButtonGroup>
  </div>
</template>

<script>
export default {
  name: "buttons",
  props: {
    data: {
      type: Array
    },
    value: {
      type: [Number, String]
    },
    groupClass: {
      type: String,
      default: ""
    }
  },
  components: {},
  data () {
    return {};
  },
  methods: {
    tagStepBtn (item, data) {
      // 按钮切换
      this.$emit("update:value", item.value);
      this.$emit("btnClick", item, data);
    }
  },
  computed: {}
};
</script>

<style scoped></style>
