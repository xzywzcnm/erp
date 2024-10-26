<template>
  <div>
    <ButtonGroup>
      <template v-for="(item,index) in list">
        <Button
          v-if="result===item.value"
          type="primary"
          @click="buttonChange(index)"
          :key="item.value"
        >{{item.label}}</Button>
        <Button
          v-else
          @click="buttonChange(index)"
          :key="item.value"
        >{{item.label}}</Button>
      </template>
    </ButtonGroup>
  </div>
</template>
<script>
export default {
  name: 'ButtonGroups',
  props: {
    list: {
      type: Array,
      default () {
        return [];
      }
    },
    val: null
  },
  data () {
    return {
      result: this.val
    };
  },
  watch: {
    val () {
      this.result = this.val;
    }
  },
  methods: {
    buttonChange (index) {
      this.result = this.list[index] ? this.list[index].value : null;
      this.$emit('update:val', this.result);
    }
  }
};
</script>
