<template >
  <div >
    <input
        v-model="ccc" v-bind="$attrs" v-on="$listeners" >
    <Button @click="emitMt" >点击</Button >
  </div >
</template>

<script>
// import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'test',
  mixins: [Mixin],
  props: ['cccc'],
  data () {
    return {
      ccc: ''
    };
  },
  created () {

  },
  watch: {},
  methods: {
    emitMt () {
      this.$emit('hahaha', '12');
    }
  }
};
</script >

<style scoped >

</style >
