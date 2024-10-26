<template >
  <div >
    <ButtonGroup :class="groupClass" >
      <Button
          v-for="(item, index) in data"
          :key="index"
          :class="{ 'ivu-btn-primary': withValue(item.value) }"
          @click="tagStepBtn(item, data)" >{{ item.label }} </Button >
    </ButtonGroup >
  </div >
</template >

<script >
export default {
  name: 'buttons',
  props: {
    data: {
      type: Array
    },
    value: {
      type: Number | String | Array
    },
    groupClass: {
      type: String,
      default: ''
    }
  },
  components: {},
  data () {
    return {};
  },
  methods: {
    withValue (value) {
      let value1 = this.value ? this.value.toString() : '';
      if (value) {
        return value.toString() === value1;
      } else {
        return value === this.value;
      }
    },
    tagStepBtn (item, data) {
      // 按钮切换
      let value = item.value;
      this.$emit('update:value', value);
      this.$emit('btnClick', item, data);
    }
  },
  computed: {}
};
</script >

<style scoped ></style >
