<template >
  <Modal
    v-model="modalVisible"
    title="添加全托管商品"
    :mask-closable="false"
    width="90%"
    class-name="modal-class-name"
  >
    <div class="modal-main-content">
      <div class="tags-content">
        <Tag
          v-for="(item, index) in tableSelectRows"
          :closable="true"
          size="medium"
          color="primary"
          type="border"
          :key="`tag-${index}`"
          @on-close="tagClose(index)"
        >
          {{ item.platformSku || '' }}
        </Tag>
      </div>
      <div class="row-content">
        <div class="row-item">
          <span class="item-label">平台主体：</span>
          <span class="item-content">{{ selectPlatform.platformName || '' }}</span>
        </div>
        <div class="row-item">
          <span class="item-label">店铺：</span>
          <span class="item-content">{{ saleAccount.account || '' }}</span>
        </div>
      </div>
      <div class="row-content">
        <div class="filter-content mb10">
          <div class="row-item">
            <span class="item-label">平台SKC：</span>
            <div class="item-content">
              <dyt-input-tag
                :limit="1"
                type="textarea"
                v-model="searchFormData.platformSkcList"
                placeholder="多个请用逗号或回车分隔"
              />
            </div>
          </div>
          <div class="row-item">
            <span class="item-label">平台SKU：</span>
            <div class="item-content">
              <dyt-input-tag
                :limit="1"
                type="textarea"
                v-model="searchFormData.platformSkuList"
                placeholder="多个请用逗号或回车分隔"
              />
            </div>
          </div>
          <div class="row-item">
            <span class="item-label">商品 SKU：</span>
            <div class="item-content">
              <dyt-input-tag
                :limit="1"
                type="textarea"
                v-model="searchFormData.productSkuList"
                placeholder="多个请用逗号或回车分隔"
              />
            </div>
          </div>
          <div class="row-item">
            <span class="item-label">状态：</span>
            <div class="item-content">
              <dyt-select v-model="searchFormData.status" placeholder="请选择状态">
                  <Option
                    v-for="(item, index) in Object.keys(statusList)"
                    :value="Number(item)"
                    :key="`s-${index}`"
                    :label="statusList[item]"
                  />
                </dyt-select>
            </div>
          </div>
        </div>
        <Button type="primary" @click="searchData(true)" :disabled="tableLoading">搜索</Button>
      </div>
      <Table
        class="modal-table"
        border
        highlight-row
        ref="tableRef"
        :max-height="400"
        :columns="tableColumns"
        :data="tableDaata"
        :loading="tableLoading"
      ></Table>
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
    </div>
    <div slot="footer">
      <Button type="primary" @click="modalConfirm">确定</Button>
      <Button @click="modalCancel">取消</Button>
    </div>
  </Modal>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'insetOrderModal',
  mixins: [Mixin],
  props: {
    moduleData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 店铺
    saleAccount: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 平台主体
    selectPlatform: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 供应商
    selectSupplier: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 已选的商品
    choseList: {
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
      tableLoading: false,
      searchFormData: {
        pageNum: 1,
        pageSize: 20,
        status: null,
        saleAccountId: '',
        platformId: '',
        platformSkuList: [],
        productSkuList: [],
        platformSkcList: []
      },
      // 状态
      statusList: { 0: '未匹配', 1: '已匹配' },
      oldFormData: {},
      tableTotal: 0,
      // 当前操作选中的数据
      choseTableRows: [],
      tableDaata: [],
      tableColumns: [
        {
          title: "图片",
          key: "imageUrl",
          align: "center",
          width: 75,
          render: (h, { row }) => {
            return h('div', {
              style: {
                margin: '5px 0'
              }
            }, [this.tableImg(h, row, "imageUrl")]);
          }
        },
        {
          title: "平台SKU",
          key: "platformSku",
          align: "center",
          width: 100,
        },
        {
          title: "条码编码",
          key: "labelCode",
          align: "center",
          width: 100,
        },
        {
          title: "名称",
          key: "productName",
          align: "center",
          minWidth: 120,
        },
        {
          title: "平台SKC",
          key: "skc",
          align: "center",
          width: 100,
        },
        {
          title: "主属性",
          key: "skcSpecName",
          align: "center",
          width: 110,
        },
        {
          title: "次属性",
          key: "skuSpecName",
          align: "center",
          width: 110,
        },
        {
          title: "商品SKU",
          key: "lapaSku",
          align: "center",
          width: 110,
        },
        {
          title: "匹配状态",
          key: "matchStatus",
          align: "center",
          width: 110,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.matchStatus)) return h('span', {}, '');
            if (this.$common.isEmpty(this.statusList[row.matchStatus])) return h('span', {}, row.matchStatus);
            return h('span', {
              style: {
                color: row.matchStatus === 0 ? '#f20' : ''
              }
            }, this.statusList[row.matchStatus]);
          }
        },
        {
          title: "LAPA商品属性",
          key: "spec",
          align: "center",
          width: 110,
        },
        {
          title: "操作",
          key: "operation",
          align: "center",
          width: 80,
          fixed: "right",
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.productGoodsId) || [0].includes(row.matchStatus) || this.choseGoodsId.includes(row.productGoodsId)) return h('span', '');
            let item = [];
            item.push(h('Button', {
              props: {
                type: this.plusProductGoodsId.includes(row.productGoodsId) ? 'warning' : 'primary',
                size: 'small',
              },
              on: {
                click: () => {
                  this.addOrRemoveChose(row);
                }
              }
            }, this.plusProductGoodsId.includes(row.productGoodsId) ? '取消' : '选择'));
            return item;
          }
        }
      ],
      // 选中的商品
      tableSelectRows: [],
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
      deep: true,
      handler (val) {
        this.$emit('update:visible', val);
        if (val) return;
        this.tableSelectRows = [];
        this.searchFormData = this.$common.copy(this.oldFormData);
        this.tableLoading = false;
      }
    }
  },
  created () {},
  computed: {
    // 新加的商品ID
    plusProductGoodsId () {
      return this.tableSelectRows.map(item => item.productGoodsId);
    },
    // 父级选择的商品
    choseGoodsId () {
      if (this.$common.isEmpty(this.choseList)) return [];
      return this.choseList.map(item => item.productGoodsId);
    },
  },
  activated () {},
  mounted () {},
  methods: {
    // 初始数据
    initData () {
      this.oldFormData = this.$common.copy(this.searchFormData);
      this.$nextTick(() => {
        this.searchData();
      })
    },
    getFormData () {
      let param = this.$common.copy(this.searchFormData);
      param.saleAccountId = this.saleAccount.saleAccountId || '';
      param.platformId = this.selectPlatform.platformId || '';
      return param;
    },
    // 查询数据
    searchData (type) {
      if (this.tableLoading) return;
      this.tableLoading = true;
      // 是否重置页码
      if (type) {
        this.searchFormData.pageNum = 1;
      }
      this.$nextTick(() => {
        this.tableDaata = [];
        // 列表查询
        this.axios.post(`${api.queryproductOverseaTag}?supplierCode=${this.selectSupplier.supplierCode}`, this.getFormData()).then((res) => {
          if (!res || !res.data || res.data.code != 0) return;
          this.tableDaata = res.data.datas.list || [];
          this.tableTotal = res.data.datas.total;
        }).finally(() => {
          this.tableLoading = false;
        })
      })
    },
    // 确认
    modalConfirm () {
      this.$emit('confirmChose', this.$common.copy(this.tableSelectRows));
      this.$nextTick(() => {
        this.modalCancel();
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
    // 选择(取消)
    tagClose (index) {
      this.tableSelectRows.splice(index, 1);
    },
    // 选择(取消)
    addOrRemoveChose (row) {
      if (this.plusProductGoodsId.includes(row.productGoodsId)) {
        this.tableSelectRows = this.tableSelectRows.filter(item => {
          return item.productGoodsId != row.productGoodsId;
        });
      } else {
        this.tableSelectRows.push(this.$common.copy(row));
      }
    }
  }
};
</script>
<style lang="less" scoped>
.modal-main-content{
  position: relative;
  .tags-content{
    margin-bottom: 20px;
    height: 100px;
    padding: 8px;
    overflow: auto;
    background: #f1f1f1;
    border: 1px solid #ddd;
    border-radius: 5px;
    :deep(.ivu-icon-ios-close){
      left: 7px;
      top: 0px;
      font-size: 16px;
      font-weight: bold;
      color: #f20 !important;
    }
  }
  .row-content{
    display: flex;
    flex-wrap: wrap;
    padding: 0;
    .filter-content{
      display: flex;
      width: calc(100% - 65px);
    }
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
      align-items: center;
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
  :deep(.ivu-table-cell) {
    .operation-btn{
      display: inline-block;
      margin-left: 10px;
      color: #2d8cf0;
      text-decoration: underline;
      text-underline-position: under;
      cursor: pointer;
      &:nth-of-type(1){
        margin-left: 0;
      }
    }
  }
}

:deep(.modal-class-name){
  .ivu-modal{
    max-width: 1600px;
    min-width: 800px;
  }
}
</style>