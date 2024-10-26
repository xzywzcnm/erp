<template>
  <div class="allocation-list" v-if="data.length">
    <!--分配列表-->
    <div class="list-tit">
      <span>分配列表</span>
      <span @click="changeShow">
        <Icon :type="assignListShow ? 'ios-arrow-up' : 'ios-arrow-down'" class="list-ico"></Icon>
      </span>
    </div>
    <!--分配表格-->
    <div style="margin-bottom:20px;" v-if="assignListShow">
      <Table highlight-row border :columns="columns" :data="data"></Table>
    </div>
  </div>
</template>

<script>
import common from '@/components/mixin/common_mixin';
export default {
  mixins: [common],
  name: 'allocationList',
  props: {
    detailData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      columns: [
        {
          title: '行号',
          width: 90,
          align: 'center',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        },
        {
          title: '产品sku',
          align: 'center',
          key: 'goodsSku'
        },
        {
          title: '中文描述',
          align: 'center',
          key: 'goodsCnDesc',
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsCnDesc,
                trigger: 'hover',
                transfer: true,
              }
            }, [h('span', {}, params.row.goodsCnDesc)]);
          }
        },
        {
          title: '英文描述',
          align: 'center',
          key: 'goodsEnDesc',
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsEnDesc,
                trigger: 'hover',
                transfer: true,
              }
            }, [h('span', {}, params.row.goodsEnDesc)]);
          }
        },
        {
          title: '分配批次',
          align: 'center',
          key: 'receiptBatchNo'
        },
        {
          title: '分配库位',
          align: 'center',
          key: 'warehouseLocationName'
        },
        {
          title: '分配数量',
          align: 'center',
          key: 'batchNumber'
        },
        {
          title: '分配完成时间',
          align: 'center',
          key: 'createdTime',
          render: (h, params) => {
            return h('div', {}, this.$uDate.dealTime(params.row.createdTime));
          }
        },
        {
          title: '操作人',
          align: 'center',
          key: 'createdBy'
        }
      ],
      data: [],
      assignListShow: true
    }
  },
  watch: {
    detailData: {
      handler(val) {
        if (!val.pickingId) return;
        this.setData(JSON.parse(JSON.stringify(val)));
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    setData(val) {
      this.data = val.batchList || [];
    },
    changeShow() {
      this.assignListShow = !this.assignListShow;
    }
  }
}
</script>

<style lang="less" scoped>
.allocation-list {
  .list-tit {
    font-size: 16px;
    padding: 15px 0;
  }

  .list-ico {
    font-size: 18px;
    cursor: pointer;
  }
}
</style>
