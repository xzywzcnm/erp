<template >
  <div >
    <Modal v-model="modal1" title="取消收货" width="1000" @on-visible-change="visible" >
      <div class="mb10" >
        <span >取消收货</span > <Input v-model="cancelRemark" type="textarea" />
      </div >
      <Table :columns="columns1" :data="data1" ></Table >
      <div slot="footer" >
        <Button type="primary" @click="cancelFn" >取消收货</Button >
        <Button @click="modal1=false" >取消</Button >
      </div >
    </Modal >
    <!--失败数据-->
    <Modal v-model="modal2" width="1000" title="修改失败数据" >
      <Table :columns="columns2" :data="data3" ></Table >
      <div slot="footer" >
        <Button type='primary' @click="modal2=false" >关闭</Button >
      </div >
    </Modal >
  </div >
</template >

<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'cancelReceipt',
  mixins: [Mixin],
  props: {
    cancelData: {
      default: () => {
        return [];
      }
    }
  },
  data () {
    let v = this;
    return {
      modal1: false,
      modal2: false,
      cancelRemark: '',
      data1: [],
      data2: [],
      data3: [],
      columns2: [
        {
          title: 'sku',
          key: 'sku',
          width: 140
        }, {
          title: '原因',
          key: 'reason'
        }
      ],
      columns1: [
        {
          title: '行号',
          type: 'index',
          width: 60,
          align: 'center'
        }, {
          title: 'SKU',
          key: 'sku'
        }, {
          title: '中文描述',
          key: 'cnName'
        }, {
          title: '英文描述',
          key: 'enName'
        }, {
          title: '批次号',
          key: 'receiptBatchNo'
        }, {
          title: '当前所采环节',
          key: 'type',
          render (h, params) {
            return h('span', params.row.type === 1 ? '待质检' : '待上架');
          }
        }, {
          title: '可取消数量',
          key: 'quantity'
        }, {
          title: '本次取消收货数量',
          key: 'cancelQuantity',
          width: 150,
          render (h, params) {
            return h('InputNumber', {
              props: {
                value: 0,
                max: params.row.quantity,
                min: 0,
                precision: 0
              },
              style: {
                width: '100px',
                margin: '0 auto'
              },
              on: {
                'on-change' (value) {
                  v.data2[params.index].cancelQuantity = value;
                }
              }
            });
          }
        }
      ]
    };
  },
  created () {},
  watch: {},
  methods: {
    visible (open) {
      if (open) {
        this.cancelRemark = '';
        this.data1 = JSON.parse(JSON.stringify(this.cancelData)).map(i => Object.assign(i, { cancelQuantity: 0 }));
        this.data2 = JSON.parse(JSON.stringify(this.cancelData)).map(i => Object.assign(i, { cancelQuantity: 0 }));
      }
    },
    cancelFn () {
      let v = this;
      // 提交取消数据
      let arr = this.data2.filter(i => i.cancelQuantity > 0).map(i => {
        return {
          cancelQuantity: i.cancelQuantity,
          id: i.id,
          receiptNo: i.receiptNo,
          type: i.type,
          remark: v.cancelRemark
        };
      });
      if (arr.length === 0) {
        v.$Message.error('本次取消收货数量为0');
        return;
      }
      v.axios.post(api.cancelReceipt, arr).then(response => {
        if (response.data.code === 0) {
          if (response.data.datas.success) {
            v.$Message.success('操作成功');
          } else {
            v.data3 = [];
            for (let key in response.data.datas.error) {
              v.data3.push({
                sku: key,
                reason: response.data.datas.error[key]
              });
            }
            v.modal2 = true;
          }
          v.modal1 = false;
          v.$emit('getList');
        }
      });
    }
  }
};
</script >

<style scoped ></style >
