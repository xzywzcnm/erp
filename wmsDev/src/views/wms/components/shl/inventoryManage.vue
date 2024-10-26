<template>
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content platformParamsSelect">
          <Form ref="pageParams" :model="pageParams" :label-width="100">
            <dyt-filter>
              <Form-item label="SHL SKU：" prop="shlSku">
                <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.shlSku"
                  placeholder="多个 SHL SKU 请用逗号或回车分隔" />
              </Form-item>
              <Form-item label="有可用库存：" prop="isAvailQty">
                <dyt-select v-model="pageParams.isAvailQty" placeholder="请选择关联SKU">
                  <Option label="有" :value="1" />
                  <Option label="无" :value="0" />
                </dyt-select>
              </Form-item>
              <div slot="operation">
                <Button type="primary" :disabled="tableLoading" @click="search" icon="ios-search">查询</Button>
                <Button @click="reset" v-once icon="md-refresh" style="margin-left: 8px;">重置</Button>
              </div>
            </dyt-filter>
          </Form>
        </div>
      </div>
    </div>
    <div class="tableControl table-control-head">
      <div class="table-control-left">
        <Button style="marginLeft:20px;" v-if="pagePermission.syncInventory" type="primary"
          @click="syncOnlineProduct">同步库存</Button>
        <Dropdown @on-click="batchOperate" class="ml10" v-if="pagePermission.export">
          <Button type="primary">
            <!-- <span class="icon iconfont" style="font-size: 12px">&#xe639;</span> 导出 -->
            <Icon type="md-download" style="font-size: 14px" /> 导出
            <Icon type="md-arrow-dropdown"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem name="exportCheck">导出选中数据</DropdownItem>
            <DropdownItem name="exportAll">导出所有结果集</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <!-- 排序 -->
      <div class="table-control-right">
        <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch"
          :sorType="{ DESC: 'down', ASC: 'up' }">
        </dyt-sortBySelect>
      </div>
    </div>
    <div class="orderTable normalTop">
      <Table highlight-row border :height="tableHeight" :loading="tableLoading" :columns="tableColumn" :data="amazonData"
        @on-selection-change="tableSelectionChange"></Table>
      <div class="table-page flexBox">
        <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
          :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray">
        </Page>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  components: {},
  props: {},
  data() {
    return {
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      tableSltData: [],
      pageParams: {
        orderBy: 'CT',
        shlSku: [],
        isAvailQty: null,
        pageNum: 1,
        pageSize: 10,
        upDown: 'up'
      },
      sortButtonList: [
        {
          sortHeader: "按创建时间",
          sortField: "CT",
          sortType: "up",
          default: true,
        },
        {
          sortHeader: "按更新时间",
          sortField: "GX",
          sortType: "up",
        },
      ],
      tableColumn: [
        {
          type: "selection",
          width: 60,
          align: "center"
        },
        {
          title: "图片",
          key: "goodsUrl",
          align: "center",
          width: 100,
          render: (h, params) => {
            if (this.$common.isEmpty(params.row.productGoodsId)) return h('div', '');
            return h('div', {
              style: {
                margin: '5px 0'
              }
            }, [this.tableImg(h, params, "erpProductImgUrl")]);
          }
        },
        {
          title: "SHL SKU",
          key: "productSku",
          align: "center",
          minWidth: 200
        },
        {
          title: "SHL 中文名称",
          key: "productName",
          align: "center",
          minWidth: 200
        },
        {
          title: "长宽高(cm)",
          key: "price",
          align: "center",
          minWidth: 120,
          render: (h, { row }) => {
            return h("div", [
              h('span', !this.$common.isEmpty(row.productLength) ? `${Number(row.productLength).toFixed(2)}*` : '0.00*'),
              h('span', !this.$common.isEmpty(row.productWidth) ? `${Number(row.productWidth).toFixed(2)}*` : '0.00*'),
              h('span', !this.$common.isEmpty(row.productHeight) ? `${Number(row.productHeight).toFixed(2)}` : '0.00')
            ]);
          }
        },
        {
          title: "重量(kg)",
          key: "productWeight",
          align: "center",
          minWidth: 100
        },
        {
          title: "可用库存",
          key: "availQty",
          align: "center",
          minWidth: 100
        },
        // {
        //   title: "在途库存",
        //   key: "intransitQty",
        //   align: "center",
        //   minWidth: 100
        // },
        {
          title: "更新时间",
          key: "updatedTime",
          align: "center",
          minWidth: 150,
          render: (h, params) => {
            if (params.row.updatedTime) {
              return h("div", this.$uDate.dealTime(params.row.updatedTime));
            }
          }
        }
      ],
      totalPage: 0,
      total: 0,
      curPage: 1,
      tableLoading: true,
      amazonData: [],
      activeWmsWinitProductId: '', // 关联wmsWinitProductId
      wmsAmazonListingId: null,
      wareId: this.getWarehouseId() // 仓库ID
    };
  },
  watch: {
    pageParamsStatus(n) {
      if (!n) return;
      this.getList();
      this.pageParamsStatus = false;
    }
  },
  computed: {
    // 权限
    pagePermission() {
      return {
        // 同步库存
        syncInventory: this.getPermission('syncShlInventory'),
        // 导出
        export: this.getPermission('exportShlInventory'),
        // 查询
        query: this.getPermission('queryShlInventory'),
      }
    },
    tableHeight() {
      return this.getTableHeight(270);
    }
  },
  activated() {
    this.getList();
  },
  methods: {
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.upDown = type;
      this.pageParams.orderBy = feild;
      this.getList();
    },
    tableSelectionChange(selection) {
      this.tableSltData = selection;
    },
    getPageParams() {
      let pageParams = this.$common.copy(this.pageParams);
      pageParams.orderSeq = this.pageParams.upDown === 'up' ? 'ASC' : 'DESC';
      pageParams.warehouseId = this.wareId;
      return pageParams;
    },
    // 批量操作
    batchOperate(name) {
      if (this.$common.isEmpty(this[name])) return;
      const isAll = (name.toLocaleLowerCase()).includes('all');
      if (isAll && this.amazonData.length === 0) {
        return this.$Message.warning({
          content: '无可操作的数据',
          duration: 5
        });
      }
      if (!isAll && this.tableSltData.length === 0) return this.$Message.warning('请选择需要操作的数据');
      this[name]();
    },
    // 导出选中
    exportCheck() {
      let obj = {};
      obj.warehouseId = this.wareId;
      obj.wmsOutstoreInventoryIds = this.tableSltData.map(val => val.wmsOutstoreInventoryId);
      this.exportFn(obj);
    },
    // 导出所有
    exportAll() {
      this.exportFn(this.getPageParams());
    },
    // 导出数据
    exportFn(obj) {
      this.axios.post(api.post_export, obj).then(res => {
        if (res.data.code !== 0) return;
        this.$Message.success('导出操作成功，请稍后到“导出查看”查看下载');
      });
    },
    // 查询
    search() {
      this.curPage = 1;
      this.pageParams.pageNum = 1;
      this.$nextTick(() => {
        this.pageParamsStatus = true;
      })
    },
    // 重置
    reset() {
      // this.pageParams.shlSku = [];
      this.$refs.pageParams && this.$refs.pageParams.resetFields();
    },
    getList() {
      // 获取列表数据
      if (!this.pagePermission.query) {
        // this.gotoError();
        this.tableLoading = false;
        this.$Message.error('您暂无权限查询数据，请联系管理员开通');
        return;
      }
      this.tableLoading = true;
      this.tableSltData = [];
      let paramsObj = this.getPageParams();
      this.axios.post(api.psot_query, paramsObj).then(response => {
        this.tableLoading = false;
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            this.amazonData = data.list ? data.list : [];
            this.$nextTick(() => {
              this.total = Number(data.total);
              this.totalPage = Number(data.pages);
              this.tableLoading = false;
            });
          }
        }
      }).catch(() => {
        this.tableLoading = false;
      })
    },
    // 同步在线商品
    syncOnlineProduct() {
      this.axios.post(`${api.post_syncShlInventory}?warehouseId=${this.wareId}`).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.pageParamsStatus = true;
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.table-control-head {
  display: flex;

  .table-control-left {
    flex: 100;
  }

  .table-control-right {
    padding: 0 15px;
  }
}
</style>
<style>
.addProductModal .ivu-modal {
  width: 1000px !important;
}
</style>
