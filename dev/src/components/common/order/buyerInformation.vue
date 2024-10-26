<template >
  <div class="modalItem" >
    <div class="modalItemHeader" >
      <h6 >买家信息</h6 >
    </div >
    <div class="modalItemContent" >
      <div class="buyerMessageCotainer" >
        <Row >
          <Col span="6" >
            买家ID:{{ orderInfo.buyerAccountId }}
          </Col >
          <Col
              span="6" offset="1" >
            买家姓名:{{ orderInfo.buyerName }}
          </Col >
        </Row >
      </div >
    </div >
  </div >
</template>

<script>
// import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'buyerInformation',
  mixins: [Mixin],
  data () {
    return {};
  },
  created () {

  },
  props: {
    orderInfo: [Object, String]
  },
  watch: {},
  methods: {}
};
</script >

<style scoped >

</style >
