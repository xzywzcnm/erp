<template >
  <div >
    <h5 v-if="createAfterTableData.length != 0" >
      成功生成{{ createAfterTableData.length }}张拣货单 </h5 >
    <Table border :columns="columns" :data="createAfterTableData" ></Table >
  </div >
</template >
<script >
export default {
  props: ['data', 'createAfterTableData'],
  data () {
    return {
      columns: [
        {
          type: 'index',
          width: 60,
          align: 'center'
        }, {
          title: '拣货单单号',
          key: 'pickingGoodsNo'
        }, {
          title: '拣货单类型',
          key: 'type'
        }, {
          title: '所在仓库',
          key: 'warehouseName'
        }
      ]
    };
  },
  created () {},
  computed: {},
  destroyed () {
    this.$parent.$parent.createAfterTableData = [];
  }
};
</script >

<style ></style >
