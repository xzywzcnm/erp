<template >
  <Modal
      v-model="model1" title="恢复订单" @on-ok="resumeOrder" >
    <p >订单恢复作废后，系统将重新创建发货信息，并执行所有自动规则,是否确定恢复？</p >
  </Modal >
</template>

<script>
// import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'resumeOrder',
  mixins: [Mixin],
  data () {
    return {
      model1: false
    };
  },
  created () {

  },
  props: {},
  watch: {},
  methods: {
    resumeOrder () {

    }
  }
};
</script >

<style scoped >

</style >
