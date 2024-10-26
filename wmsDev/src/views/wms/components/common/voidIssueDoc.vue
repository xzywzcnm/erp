<template >
  <div >
    <Modal v-model="modal" title="作废出库单" :mask-closable="false" @on-visible-change="visibleFn1" >
      <p >
        <Checkbox
            v-model="generateNewPackage" :true-value="1" :false-value="0" >重置出库单
        </Checkbox >
        <Tooltip content="勾选重置出库单，会重新生成一个出库单" >
          <Icon type="md-help-circle" />
        </Tooltip >
      </p >
      <div >
        有{{packageIdList.length}}条出库单被重置状态，成功执行后的记录，将回到【等待分配】状态,同时出库单会执行以下操作：
        <p >1.出库单如果已经下发物流成功，会尝试调用物流商接口取消下单</p >
        <p >2.出库单如果已经分配库存成功，会归还已分配库存</p >
      </div >
      <div slot="footer" >
        <Button @click="vildFn" type="primary" >确认修改</Button >
        <Button @click="modal = false" >取消</Button >
      </div >
    </Modal >
    <!--失败数据-->
    <Modal v-model="modal1" width="1000" title="修改失败数据" >
      <Table :columns="columns2" :loading="TableLoading" :data="data2" ></Table >
      <div slot="footer" >
        <Button type='primary' @click="modal1=false" >关闭</Button >
      </div >
    </Modal >
  </div >
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'voidIssueDoc',
  mixins: [Mixin],
  data () {
    return {
      modal1: false,
      columns2: [
        {
          title: '出库单号',
          key: 'packageCode',
          width: 140
        }, {
          title: '原因',
          key: 'error'
        }
      ],
      data2: [],
      modal: false,
      generateNewPackage: 0,
      number: 0
    };
  },
  created () {},
  props: {
    packageIdList: {
      default: Array
    }
  },
  watch: {},
  methods: {
    vildFn () {
      let v = this;
      v.TableLoading = true;
      v.axios.put(api.batchInvalidPackage, {
        generateNewPackage: v.generateNewPackage,
        packageIdList: v.packageIdList
      }).then(response => {
        v.TableLoading = false;
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.modal = false;
          if (response.data.datas && response.data.datas.length > 0) {
            v.modal1 = true;
            v.data2 = response.data.datas;
          }
          v.$emit('getList');
        }
      });
    },
    visibleFn1 () {}
  }
};
</script >

<style scoped ></style >
