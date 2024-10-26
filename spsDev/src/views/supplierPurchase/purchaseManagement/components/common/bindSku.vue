<template >
  <div >
    <div >
      <span >搜索字符：</span > <Input style='width: 200px' ></Input >
      <Button type='primary' >搜索</Button >
    </div >
    <div style='margin-top: 10px' >
      <Table :columns="columns" :loading="Tableloading" :data="data" ></Table >
    </div >
  </div >
</template>

<script>
import api from '@/api/api';

export default {
  props: ['warehouseId', 'asin'],
  data () {
    return {
      Tableloading: false,
      columns: [
        {
          title: '选择',
          render: (h, params) => {
            return h('Button', {
              on: {
                'click': () => {
                  let obj = {
                    wmsAmazonListingId: this.asin,
                    productGoodsId: params.row.productGoodsId
                  };
                  this.relation(obj);
                }
              }
            }, '选择');
          }
        }, {
          title: 'SKU图片',
          align: 'center',
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU',
          key: 'goodsSku'
        }, {
          title: 'asin',
          key: 'asin'
        }, {
          title: 'SKU属性',
          key: 'goodsAttributes'
        }, {
          title: '中文描述',
          key: 'goodsCnDesc'
        }, {
          title: '英文描述',
          key: 'goodsEnDesc'
        }, {
          title: '重量(g)',
          key: 'goodsWeight'
        }
      ],
      data: []
    };
  },
  created () {
    this.getListFn({
      pageNum: 1,
      pageSize: 10
    });
  },
  methods: {
    getListFn (params) {
      this.Tableloading = true;
      this.axios.post(api.planFbaAddGoods, {
        warehouseId: this.warehouseId,
        asin: [this.asin],
        ...params
      }).then(res => {
        this.Tableloading = false;
        if (res.data.code === 0) {
          this.data = res.data.datas.list;
        }
      });
    },
    relation (params) {
      this.axios.post(api.skuRelation, params).then(res => {
        // if (res.data.code === 0) {}
      });
    }
  }
};
</script>

<style scoped>

</style >
