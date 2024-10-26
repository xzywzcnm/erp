<template>
  <div v-if="modal1">
    <Modal

      v-model="modal1"
      title="快速处理SKU"
      width="900">
      <Form>
        <FormItem label="选择收货库位">
          <Select
            v-model="warehouseLocationId"
            filterable
            remote
            transfer
            ref="warehouseLocation"
            style="width: 200px;"
            :remote-method="getWarehouseLocation"
            @click.native="getWarehouseLocation('')"
            :loading="loading2" > <Option
            v-for="item in $store.state.positionList"
            :disabled="item.checkStatus === '1'"
            :title="
                        item.checkStatus === '1'
                          ? '盘点中'
                          : ''
                      "
            :value="item.warehouseLocationId"
            :key="item.warehouseLocationId"  @click="addTableLocationName(item.warehouseLocationName)"
            :label="item.warehouseLocationName"
          /> </Select >
        </FormItem>
      </Form>
      <Input style="width: 300px;" placeholder="扫描商品条码可确认需处理的SKU" v-model="sku" @on-enter="enterSku"></Input>
      <Table :row-class-name="rowClassName" class="mt10" :columns="columns" :data="data"></Table>
      <div slot="footer" style="text-align: center;">
        <Button @click="cancel">取消</Button>
        <Button type="primary" @click="ok">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'handleSku',
  mixins: [Mixin],
  data () {
    let v = this;
    return {
      modal1: false,
      sku: '',
      warehouseLocationId: '',
      loading2: false,
      activeRow: null,
      columns: [
        {
          type: 'index',
          title: '行号',
          width: 70,
          align: 'center'
        },
        {
          title: '入库单号',
          key: 'receiptNo',
          minWidth: 100
        },
        {
          title: 'SKU图片',
          key: 'goodsUrl',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            return h('img', {
              attrs: {
                src: params.row.goodsUrl
                  ? v.$store.state.imgUrlPrefix + params.row.goodsUrl
                  : require('../../../../../../public/static/images/placeholder.jpg')
              },
              style: {
                width: '60px',
                height: '60px',
                padding: '4px 0'
              }
            });
          }
        },
        {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.goodsSku);
          }
        },
        {
          title: 'SKU属性',
          key: 'goodsAttributes',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.goodsAttributes);
          }
        },
        {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsCnDesc,
                trigger: 'hover'
              }
            }, [
              h('span', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
                }
              }, params.row.goodsCnDesc)
            ]);
          }
        },
        {
          minWidth: 90,
          title: '本次收货数量',
          key: 'currentbatchNumber'
        },
        {
          title: '缺货数量',
          align: 'center',
          minWidth: 80,
          render: (h, params) => {
            let number = params.row.outOfStockNumber || 0;
            return h('span', {
              style: {
                color: number > 0 ? 'red' : ''
              }
            }, number)
          }
        }
      ]
    };
  },
  created () {

  },
  props: {
    data: {
      type: Array
    }
  },
  watch: {},
  methods: {
    addTableLocationName (locationName) {
      this.data.forEach(i => {
        i.warehouseLocationName = locationName
      })
    },
    getWarehouseLocation (query) {
      this.getPositionListNew(['00', '10'], '0', query);
    },
    rowClassName (row) {
      if (this.activeRow && this.activeRow.goodsSku === row.goodsSku) {
        return 'demo-table-info-row';
      }
      return '';
    },
    enterSku () {
      if (!this.sku) {
        this.$Message.info('请输入sku')
        return
      }
      this.data.forEach(i => {
        if (i.goodsSku === this.sku) {
          this.activeRow = i;
          this.sku = '';
        }
      })
    },
    open () {
      setTimeout(() => {
        this.getWarehouseLocation('')
      }, 0);
      this.modal1 = true;
      this.warehouseLocationId = ''
    },
    ok () {
      if (!this.warehouseLocationId) {
        this.$Message.info('请选择收货库位');
        return
      }
      this.$emit('changeHandleSku', {
        warehouseLocationId: this.warehouseLocationId,
        data: this.data
      })
      this.modal1 = false;
    },
    cancel () {
      this.modal1 = false;
    }
  }
};
</script>

<style>
.ivu-table .demo-table-info-row td {
  background-color: #2db7f5;
  color: #fff;
}
</style>
