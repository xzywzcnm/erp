<template>
  <div class="fmb0 packingInformationDetailPage">
    <Form :ref="formName" :model="totalData" :label-width="90" class="formDetail">
      <div class="inline-form formWidth240">
        <FormItem label="货箱编号">
          <span>{{ totalData.boxCode }}</span>
        </FormItem>
        <FormItem label="拣货单号">
          <span>{{ totalData.pickingGoodsNo }}</span>
        </FormItem>
        <FormItem label="货箱整箱重量" v-if="detailData.pickingType !== 'O11'">
          <span>{{ totalData.weight || 0 }} kg</span>
        </FormItem>
        <FormItem label="创建装箱时间">
          <span>{{ $uDate.dealTime(totalData.createdTime) }}</span>
        </FormItem>
        <FormItem label="sku数量">
          <span>{{ totalData.skuNum || 0 }}</span>
        </FormItem>
        <FormItem label="装箱操作人" class="overheight">
          <Tooltip :content="totalData.operatorList.toString()"
            v-if="totalData.operatorList && totalData.operatorList.length" transfer max-width="300" placement="top"
            transfer-class-name="self-tooltip">
            <span class="overEllipies">{{ totalData.operatorList.toString() }}</span>
          </Tooltip>
        </FormItem>
        <template v-if="isTemuStockup">
          <FormItem label="平台SKC">
            <span>{{ totalData.platSkc }}</span>
          </FormItem>
          <FormItem label="发货单号">
            <span>{{ totalData.deliveryOrderSn }}</span>
          </FormItem>
        </template>
        <template v-if="isTemuSend">
          <FormItem label="平台spu">
            <span>{{ totalData.platSkc }}</span>
          </FormItem>
        </template>
      </div>
      <div class="mt20">
        <div class="form-item-flex">
          <FormItem label="sku搜索" class="form-width-item" :label-width="60">
            <dyt-input v-model.trim="searchParams.sku" placeholder="输入sku/平台sku"></dyt-input>
          </FormItem>
          <FormItem :label-width="0">
            <Button type="primary" icon="ios-search" class="ml10" @click="search">查询</Button>
          </FormItem>
        </div>
        <div class="mt10 clear">
          <Table highlight-row :columns="columns" :data="data" class="expendTable table-split-line" :loading="loading">
            <template slot-scope="{ row, index }" slot="acceptableType">
              <span>{{ row.acceptableType || '' }}</span>
            </template>
          </Table>
          <!--分页-->
          <div class="fr pages mt10">
            <Page :total="tableItemTotal" :current="searchParams.pageNum" :page-size="searchParams.pageSize" show-total
              show-sizer show-elevator @on-change="pageNumChange" @on-page-size-change="pageSizeChange"
              :page-size-opts="pageArray" size="small"></Page>
          </div>
        </div>
      </div>
    </Form>
  </div>
</template>

<script>
import api from '@/api/api';
import combinationProducts from './combinationProducts.vue';
const searchParams = {
  sku: '',
  pickingId: '',
  pickingBoxNo: '',
  pageNum: 1,
  pageSize: 10
};
export default {
  name: 'packingInformationDetail',
  components: { combinationProducts },
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return {}
      }
    },
    detailData: {
      type: Object,
      default() {
        return {}
      }
    },
    pickingData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    let _self = this;
    return {
      formName: 'formValidate',
      data: [],
      columns: [
        {
          key: 'expand',
          type: 'expand',
          align: 'center',
          width: 2,
          render: (h, params) => {
            let columnFeild = ['goodSku', 'goodsCnDesc', 'goodsEnDesc', 'number', 'volume', 'weight', 'acceptableType', 'productCost'];
            return h(combinationProducts, {
              props: {
                lists: params.row.pickingBoxSkuVOList || [],
                columns: _self.columns,
                columnFeild: columnFeild
              }
            })
          }
        },
        {
          title: 'SKU',
          align: 'center',
          key: 'goodSku',
          minWidth: 120
        },
        {
          title: '中文描述',
          align: 'center',
          key: 'goodsCnDesc',
          minWidth: 120
        },
        {
          title: '英文描述',
          align: 'center',
          key: 'goodsEnDesc',
          minWidth: 120
        },
        {
          title: '平台sku',
          align: 'center',
          key: 'platSku',
          minWidth: 120
        },
        {
          title: '装箱数量',
          align: 'center',
          key: 'number',
          minWidth: 120
        },
        {
          title: '体积',
          align: 'center',
          key: 'volume',
          minWidth: 120
        },
        {
          title: '重量(g)',
          align: 'center',
          key: 'weight',
          minWidth: 120
        },
        {
          title: '产品类型',
          align: 'center',
          minWidth: 120,
          slot: 'acceptableType',
          key: 'acceptableType'
        },
        {
          title: '成本',
          align: 'center',
          minWidth: 120,
          key: 'productCost'
        }
      ],
      tableItemTotal: 0, // 分页总条数
      searchParams: {},
      pageArray: [10, 20, 50, 100],
      totalData: {}, // 详情信息
      loading: false
    }
  },
  watch: {
    modelVisible: {
      handler(val) {
        if (!val) return;
        this.reset();
        this.$nextTick(() => {
          this.open();
        })
      },
      deep: true
    },
  },
  computed: {
    isTemu() {
      let { pickingType, pickingNewStatus } = this.detailData || {};
      return pickingType === 'O11' && ['11', '12', '8', '4'].includes(pickingNewStatus);
    },
    // 是否temu备货
    isTemuStockup() {
      let { pickingSubType } = this.detailData || {};
      return this.isTemu && pickingSubType === 1;
    },
    // 是否temu寄养
    isTemuSend() {
      let { pickingSubType } = this.detailData || {};
      return this.isTemu && pickingSubType === 0;
    },
  },
  methods: {
    // 窗口打开
    open() {
      let { pickingId, pickingType } = this.detailData || {};
      this.searchParams.pickingId = pickingId || '';
      this.searchParams.pickingBoxNo = this.pickingData.boxCode || '';

      if (['O10'].includes(pickingType)) {
        this.columns.splice(1, 0, {
          title: '袋号',
          align: 'center',
          minWidth: 138,
          key: 'subPackageNo'
        });
      }
      // temu标签去除列表sku列
      if (['O11'].includes(pickingType)) {
        this.columns = this.columns.filter(f => !['platSku'].includes(f.key));
      }
      this.getDetail();
    },
    reset() {
      this.data = [];
      this.totalData = {};
      this.tableItemTotal = 0;
      this.columns = this.columns.filter(f => !['subPackageNo'].includes(f.key));
      this.searchParams = this.$common.copy(searchParams);
    },
    // 数据请求
    getDetail() {
      let searchParams = this.searchParams;
      if (!searchParams.pickingBoxNo) return;

      this.loading = true;
      this.axios.post(api.wmsPickingBoxesGet, searchParams).then(({ data }) => {
        if (!(data && data.code === 0)) return;
        let totalData = data.datas || {};
        this.totalData = totalData;
        let pageInfo = totalData.pageInfo || {};
        this.tableItemTotal = pageInfo.total;
        this.data = (pageInfo.list || []).map(k => {
          k._expanded = true;// 默认展开组合产品下的sku
          if (k.pickingBoxSkuVOList) {
            k.pickingBoxSkuVOList.map(ck => {
              ck.goodsCnDesc = ck.cnHsName;
              ck.goodsEnDesc = ck.enHsName;
            })
            k.cellClassName = {
              expand: 'expand-table-info-cell-age'
            }
          }
          return k;
        });
      }).finally(() => {
        this.loading = false;
      })
    },
    // 查询
    search() {
      this.searchParams.pageNum = 1;
      this.getDetail();
    },
    pageNumChange(page) {
      this.searchParams.pageNum = page;
      this.getDetail();
    },
    pageSizeChange(size) {
      this.searchParams.pageSize = size;
      this.search();
    }
  }
}
</script>
<style lang="less">
.packingInformationDetailPage {
  .overheight .ivu-form-item-content {
    height: 32px;
  }

  .ivu-tooltip,
  .ivu-tooltip-rel,
  .overEllipies {
    max-width: 100%;
    height: 32px;
  }

  .overEllipies {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .inline-form {
    .ivu-form-item {
      display: inline-block;
    }
  }
}

.form-item-flex {
  display: flex;
  align-items: center;

  .form-width-item {
    .ivu-form-item-content {
      width: 300px;
    }
  }
}
</style>
