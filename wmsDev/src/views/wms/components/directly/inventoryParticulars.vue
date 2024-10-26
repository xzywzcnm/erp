<template >
  <Modal
    v-model="modalVisible"
    title="库存明细"
    :mask-closable="false"
    width="90%"
    class-name="modal-class-name"
  >
    <div class="modal-main-content">
      <div class="row-content">
        <div class="row-item">
          <span class="item-label">供应商：</span>
          <span class="item-content">{{ supplierInfo.supplierName }}</span>
        </div>
        <div class="row-item">
          <span class="item-label">SKU：</span>
          <span class="item-content">{{ rowInfo.sku }}</span>
        </div>
        <div class="row-item">
          <span class="item-label">SKU属性：</span>
          <span class="item-content">{{ rowInfo.specifications }}</span>
        </div>
        <div class="row-item">
          <span class="item-label">SKC：</span>
          <span class="item-content">{{ rowInfo.styleNumber }}</span>
        </div>
        <div class="row-item">
          <span class="item-label">供方货号：</span>
          <span class="item-content">{{ rowInfo.supplierNo }}</span>
        </div>
        <div class="row-item">
          <span class="item-label">名称：</span>
          <span class="item-content">{{ rowInfo.productName }}</span>
        </div>
        <div class="row-item">
          <span class="item-label">库位：</span>
          <span class="item-content">{{ rowInfo.warehouseLocationCode }}</span>
        </div>
        <div class="row-item">
          <span class="item-label">备注：</span>
          <span class="item-content">{{ rowInfo.remark }}</span>
        </div>
      </div>
      <!-- <div class="block-head">
        <div class="head-title">出库单信息</div>
        <div class="head-tips">222</div>
      </div> -->
      <Table
        class="modal-table"
        border
        highlight-row
        ref="tableRef"
        :max-height="500"
        :columns="tableColumns"
        :data="tableDaata"
        :loading="tableLoading"
      ></Table>
      <!--分页-->
      <div class="pagesMain">
        <Page
          :total="tableTotal"
          :current="searchFormData.pageNum"
          :page-size="searchFormData.pageSize"
          show-total
          show-sizer
          show-elevator
          @on-change="pageNumChange"
          @on-page-size-change="pageSizeChange"
          :page-size-opts="pageArray"
        >
        </Page>
      </div>
      <Spin fix size="large" v-if="pageLoading" ></Spin>
    </div>
    <div slot="footer">
      <Button @click="modalCancel">取消</Button>
    </div>
  </Modal>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'expressDeliveryModal',
  mixins: [Mixin],
  props: {
    moduleData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 供应商
    supplierData: {
      type: Array,
      default: () => {
        return []
      }
    },
    visible: { type: Boolean, default: false }
  },
  data () {
    return {
      modalVisible: false,
      pageLoading: false,
      tableLoading: false,
      tableTotal: 0,
      searchFormData: {
        pageSize: 20,
        pageNum: 1,
        sortField: 'gmtCreate',
        sortType: 'DESC',
      },
      tableDaata: [],
      tableColumns: [
        {
          title: "事务类型",
          key: "workType",
          align: "center",
          minWidth: 150,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.workType)) return h('span', {}, '');
            const workTypeVal = {
              1: '直发生产入库', 2: '库存调整(入库)', 3: '库存调整(出库)', 4: '库存调整(库存覆盖)', 5: '全托管直发出库'
            }
            return h('span', {}, workTypeVal[row.workType] || '');
          }
        },
        {
          title: "出入类型",
          key: "type",
          align: "center",
          width: 150,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.type)) return h('span', {}, '');
            const typeVal = { 1: '出库', 2: '入库' }
            return h('span', {}, typeVal[row.type] || '');
          }
        },
        {
          title: "单据号",
          key: "referenceNo",
          align: "center",
          minWidth: 150,
        },
        {
          title: "库存总量变化",
          key: "changedType",
          align: "center",
          width: 100,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.changedType) && this.$common.isEmpty(row.changedNum)) return h('span', {}, '');
            if (this.$common.isEmpty(row.changedType)) return h('span', {}, row.changedNum);
            return h('span', {
              style: {
                color: row.changedType == '+' ? '#008000' : '#FF0000',
                'font-weight': 'bold'
              }
            }, `${row.changedType}${row.changedNum}`);
          }
        },
        {
          title: "库存总量结存",
          key: "totalInventoryRemainderNum",
          align: "center",
          width: 150,
        },
        {
          title: "关联单号",
          key: "relatedNo",
          align: "center",
          minWidth: 150,
        },
        {
          title: "操作时间时间",
          key: "gmtCreate",
          align: "center",
          width: 150,
        },
        {
          title: "操作人",
          key: "createBy",
          align: "center",
          width: 150,
          render: (h, { row }) => {
            return h('span', {}, row.createByName || '');
            // return h('span', this.getUserName(row.createBy));
          }
        },
      ]
    };
  },
  watch: {
    visible: {
      immediate: true,
      deep: true,
      handler (val) {
        this.modalVisible = val;
        this.$nextTick(() => {
          val && this.initData();
        })
      }
    },
    modalVisible: {
      immediate: true,
      deep: true,
      handler (val) {
        this.$emit('update:visible', val);
      }
    }
  },
  created () {},
  computed: {
    rowInfo () {
      if (this.$common.isEmpty(this.moduleData)) return {};
      return this.moduleData;
    },
    inventoryId () {
      if (this.$common.isEmpty(this.rowInfo) || this.$common.isEmpty(this.rowInfo.inventoryDetailId)) return null;
      return this.rowInfo.inventoryDetailId;
    },
    // 当前供应商
    supplierInfo () {
      if (this.$common.isEmpty(this.rowInfo) || this.$common.isEmpty(this.rowInfo.supplierCode)) return {};
      const supplier = this.supplierData.find(item => item.supplierCode == this.rowInfo.supplierCode);
      if (this.$common.isEmpty(supplier)) return {};
      return supplier;
    }
  },
  activated () {},
  mounted () {},
  methods: {
    // 初始数据
    initData () {
      this.pageLoading = true;
      this.$nextTick(() => {
        this.searchData().finally(() => {
          this.pageLoading = false;
        });
      })
    },
    // 获取表格数据
    searchData () {
      return new Promise((resolve) => {
        let params = this.$common.copy(this.searchFormData);
        params.inventoryDetailId = this.inventoryId;
        this.tableDaata = [];
        this.tableLoading = true;
        this.axios.post(api.directly_queryDetailLogPage, params).then((res) => {
          if (!res || !res.data || res.data.code != 0 || !res.data.datas.data) {
            this.tableTotal = 0;
            return;
          }
          this.tableDaata = res.data.datas.data.list || [];
          this.tableTotal = res.data.datas.data.total || 0;
          resolve(res);
        }).catch(() => {
          this.tableTotal = 0;
          resolve({});
        }).finally(() => {
          this.tableLoading = false;
        })
      })
    },
    // 取消
    modalCancel () {
      this.modalVisible = false;
    },
    // 页码改变
    pageNumChange(page) {
      this.searchFormData.pageNum = page;
      this.$nextTick(() => {
        this.searchData();
      });
    },
    // 条数改变
    pageSizeChange(size) {
      this.searchFormData.pageSize = size;
      this.$nextTick(() => {
        this.searchData();
      });
    },
  }
};
</script>
<style lang="less" scoped>
.modal-main-content{
  position: relative;
  .row-content{
    display: flex;
    flex-wrap: wrap;
    padding: 0 20px;
    .row-item{
      // flex: 100;
      display: flex;
      width: 25%;
      padding-bottom: 10px;
      min-width: 200px;
      max-width: 400px;
      padding-right: 15px;
      white-space: nowrap;
      line-height: 1.4em;
      .item-label{
        width: 80px;
        text-align: right;
      }
      .item-content{
        flex: 100;
        text-align: left;
        word-break: break-all;
        white-space: initial;
      }
    }
  }
  .block-head{
    display: flex;
    position: relative;
    margin-top: 20px;
    align-items: center;
    .head-title{
      position: relative;
      padding-left: 20px;
      height: 20px;
      line-height: 20px;
      &:before{
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 3px;
        height: 100%;
        background: #2d8cf0;
      }
    }
    .head-tips{
      margin-left: 20px;
      padding: 5px 15px;
      color: #f20;
      background-color: rgba(230, 247, 255, 1);
      border: 1px solid rgba(102, 204, 255, 1);
      border-radius: 3px;
    }
  }
  .modal-table{
    margin-top: 20px;
  }
  :deep(.underline) {
    color: #2d8cf0;
    text-decoration: underline;
    text-underline-position: under;
    cursor: pointer;
  }
  :deep(.row-tag-item){
    display: inline-block;
    margin: 4px 8px 0px 0px;
    padding: 1px 8px;
    background: #f3f3f4;
    border-radius: 3px;
  }
}
:deep(.modal-class-name){
  .ivu-modal{
    max-width: 1600px;
    min-width: 800px;
  }
}
</style>