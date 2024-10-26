<template>
  <div class="inset-bag-table">
    <Form ref="formValidate" :model="formValidate" inline :label-width="100" @submit.native.prevent>
      <div class="page-content__right__detail">
        <div>
          <FormItem label="袋号:" class="mr30">
            <span>{{bagDetail.subPackageNo || ''}}</span>
          </FormItem>
          <FormItem label="装袋数量:" class="mr30">
            <span class="special-span">{{ insetBagCount }}</span>
          </FormItem>
        </div>
      </div>
    </Form>
    <Table
      border
      highlight-row
      ref="selection"
      :columns="columns"
      :data="tableList.slice((pageInfo.pageNum - 1) *pageInfo.pageSize,pageInfo.pageNum * pageInfo.pageSize)"
      maxHeight="600"
      :loading="tableLoading"
      class="expendTable"
    >
      <template slot-scope="{ row, index }" slot="acceptableType">
        <span
          v-for="(accpItem, accpIndex) in row.acceptableTypeList"
          :style="electrifiedList.includes(accpItem)? 'color: red;font-weight:bold;': ''"
          :key="accpIndex"
        >
          <span>{{ accpItem }}</span>
          <span v-if="accpIndex < row.acceptableTypeList.length -1">、</span>
        </span>
      </template>
      <template slot-scope="{ row, index }" slot="action">
        <a href="javascript:;" class="a-action" @click="singlePrint(row)">打印</a>
      </template>
    </Table>
    <div class="inset-bag-page">
      <Page
        :total="pageInfo.total"
        :current="pageInfo.pageNum"
        :page-size="pageInfo.pageSize"
        show-total
        show-sizer
        show-elevator
        @on-change="pageNumChange"
        @on-page-size-change="pageSizeChange"
        :page-size-opts="pageInfo.pageArray"
        size="small"
      />
    </div>
  </div>
</template>

<script>
import Big from 'big.js';
import combinationProducts from './combinationProducts.vue';
// import api from "@/api/api";

export default {
  name: "insetBagTable",
  components: { combinationProducts },
  props: {
    workShow: { type: String, default: '' },
    pickingDetail: {
      type: Object, default: () => { return {} }
    }
  },
  data() {
    return {
      columns: [
        {
          key: 'expand',
          type: 'expand',
          align: "center",
          width: 2,
          render: (h, params) => {
            let row = params.row || {};
            if (row.skuCountMap) {
              let skulist = Object.keys(row.skuCountMap).map(k => {
                let num = row.skuCountMap[k] || 0;
                return {
                  goodSku: k,
                  scanCount: Number(new Big(num).times(row.scanCount || 0)),
                  notScanCount: Number(new Big(num).times(row.notScanCount || 0))
                }
              })
              const columnFeild = ['goodSku', 'scanCount', 'notScanCount'];// 子sku显示字段
              return h(combinationProducts, {
                props: {
                  index: params.index,
                  lists: skulist,
                  columns: this.columns,
                  columnFeild: columnFeild
                }
              })
            }
          }
        },
        {
          title: "sku",
          key: "goodSku",
          align: "center",
          minWidth: 120
        },
        {
          title: "平台sku",
          key: "platSku",
          align: "center",
          minWidth: 100
        },
        {
          title: "产品类型",
          slot: "acceptableType",
          align: "center",
          minWidth: 100
        },
        {
          title: "已装袋数量",
          key: "scanCount",
          align: "center",
          minWidth: 100
        },
        // {
        //   title: "未装箱数量",
        //   key: "notScanCount",
        //   align: "center",
        //   minWidth: 100
        // },
        {
          title: "操作",
          slot: "action",
          align: "center",
          width: 100
        }
      ],
      tableList: [],
      pageInfo: {
        total: 0,
        pageNum: 1,
        pageSize: 10,
        pageArray: [10, 20, 50, 100]
      },
      tableLoading: false,
      formValidate: {},
      bagDetail: {
        subPackageNo: '',
        wmsPickingBoxesDetailsSubPackageList: []
      },
      electrifiedList: ["内置电池", "纽扣电池", "纯电池", "配套电池"],
    }
  },
  watch: {
    pickingDetail: {
      immediate: true,
      deep: true,
      handler (val) {
        this.$nextTick(() => {
          this.bagInit(val);
        })
      }
    },
    bagDetail: {
      deep: true,
      handler (val) {
        this.$emit('update:pickingDetail', val);
      }
    },
    workShow: {
      deep: true,
      handler (val) {
        ['list'].includes(val) && this.restData();
      }
    }
  },
  computed: {
    insetBagCount () {
      let count = 0;
      (this.bagDetail.wmsPickingBoxesDetailsSubPackageList || []).forEach(row => {
        count = count + row.scanCount;
      })
      return count;
    }
  },
  methods: {
    bagInit (data) {
      if (this.$common.isEmpty(data)) return;
      this.bagDetail = data;
      this.tableList = (this.bagDetail.wmsPickingBoxesDetailsSubPackageList || []).map((k) => {
        k._expanded = true; // 默认展开
        k.acceptableTypeList = k.acceptableType ? k.acceptableType.split(",") : [];
        if (k.skuCountMap) {
          k.cellClassName = {
            expand: 'expand-table-info-cell-age'
          }
        }
        return k;
      });
      this.pageInfo.total = this.tableList.length;
    },
    singlePrint (row) {
      this.$emit('singlePrint', row);
    },
    pageNumChange(e) {
      this.pageInfo.pageNum = e || 1;
    },
    pageSizeChange(e) {
      this.pageInfo.pageSize = e || 10;
    },
    // 重置页面数据
    restData () {
      this.tableList = [];
      this.pageInfo = {
        total: 0,
        pageNum: 1,
        pageSize: 10,
        pageArray: [10, 20, 50, 100]
      }
      this.tableLoading = false;
      this.formValidate = {};
      this.bagDetail = {
        subPackageNo: '',
        wmsPickingBoxesDetailsSubPackageList: []
      };
    }
  }
};
</script>
<style lang="less" scoped>
.inset-bag-table{
  position: relative;
  .inset-bag-page{
    padding: 10px;
    text-align: right;
  }
}
</style>
