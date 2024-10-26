<template>
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content platformParamsSelect">
          <Form ref="pageParams" :model="pageParams" :label-width="80">
            <dyt-filter>
              <Form-item label="产品编码：" v-if="!['shl'].includes(warehouseType)" prop="skuCodeList">
                <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.skuCodeList"
                  placeholder="多个产品编码请用逗号或回车分隔" />
              </Form-item>
              <Form-item label="SHL SKU：" v-if="['shl'].includes(warehouseType)" prop="shlSku">
                <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.shlSku"
                  placeholder="多个 SHL SKU 请用逗号或回车分隔" />
              </Form-item>
              <Form-item label="ERP SKU：" v-if="['shl'].includes(warehouseType)" prop="erpSku">
                <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.erpSku"
                  placeholder="多个 ERP SKU 请用逗号或回车分隔" />
              </Form-item>
              <Form-item v-if="['shl'].includes(warehouseType)" label="关联SKU：" prop="relevance">
                <dyt-select v-model="pageParams.relevance" placeholder="请选择关联SKU">
                  <Option label="未关联" :value="0" />
                  <Option label="已关联" :value="1" />
                </dyt-select>
              </Form-item>
              <Form-item v-else label="关联SKU：" prop="relateFlag">
                <dyt-select v-model="pageParams.relateFlag" placeholder="请选择关联SKU">
                  <Option label="未关联" value="0" />
                  <Option label="已关联" value="1" />
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
        <Button style="marginLeft:20px;" v-if="pagePermission.syncGoods && synchronousGoods" type="primary"
          :loading="productSyncLoading" @click="syncOnlineProduct">同步商品</Button>
        <Button type="primary" class="ml10" @click="openInportModal" :disabled="!pagePermission.relevancyPermission"><span
            class="icon iconfont" style="font-size: 14px">&#xe639;</span> 导入关联</Button>
        <Dropdown @on-click="batchOperate" class="ml10"
          v-if="pagePermission.cancelPermission && ['shl'].includes(warehouseType)">
          <Button type="primary">
            取消关联
            <Icon type="md-arrow-dropdown"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem name="cancelRelevancy">取消关联选中数据</DropdownItem>
            <DropdownItem name="cancelAllRelevancy">取消关联所有结果集</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown @on-click="batchOperate" class="ml10" v-if="pagePermission.export">
          <Button type="primary">
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
        <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
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
    <importTemp @getList="search" ref="importTemp" :actionUrl="importApi" :loadTemplateLocalApi="loadTemplateApi"
      :files="'files'" />
  </div>
</template>

<script>
// import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import importTemp from '@/components/common/importTemp';

export default {
  mixins: [Mixin],
  components: {
    importTemp
  },
  props: {
    // 表格展示数据
    tableColumn: { required: true, type: Array, default: () => [] },
    // 导入模板地址
    loadTemplateApi: { required: true, type: String },
    // 导入接口
    importApi: { required: true, type: String },
    // 同步接口地址
    productSyncApi: { required: true, type: String },
    // 列表接口地址
    getListApi: { required: true, type: String },
    // 导出接口地址
    exportApi: { required: true, type: String },
    // 导出接口参数key
    exportParams: { required: true, type: String },
    // 是否展示同步商品功能
    synchronousGoods: { type: Boolean, default: true },
    // 权限key
    permissionKey: { type: Object, default: () => { return {} } },
    // 仓库类型
    warehouseType: { type: String, default: '' },
    // 获取ID时使用
    rowKey: { type: String, default: 'id' },
  },
  data() {
    return {
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      productSyncLoading: false,
      tableSltData: [],
      pageParams: {
        orderBy: 'CT',
        skuCodeList: [],
        shlSku: [],
        erpSku: [],
        relevance: null,
        relateFlag: null,
        pageNum: 1,
        pageSize: 10,
        upDown: 'ASC'
      },
      sortButtonList: [
        {
          sortHeader: "按创建时间",
          sortField: "CT",
          sortType: "ASC",
          default: true,
        },
        {
          sortHeader: "按更新时间",
          sortField: "GX",
          sortType: "ASC",
        },
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
      // getPermission
      if (!n) return;
      this.getList();
      this.pageParamsStatus = false;
    }
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(270);
    },
    // 权限
    pagePermission() {
      return {
        // 同步商品
        syncGoods: this.getPermission(this.permissionKey.goodsKey || 'wmsOutstoreProductInfo_sync'),
        // 取消关联
        cancelPermission: this.getPermission(this.permissionKey.cancel || 'wmsOutstoreProductInfo_skuRelatedImport'),
        // 导入关联
        relevancyPermission: this.getPermission(this.permissionKey.relevancy || 'wmsOutstoreProductInfo_skuRelatedImport'),
        // 导出
        export: this.getPermission(this.permissionKey.export || 'wmsOutstoreProductInfo_export'),
        // 查询
        query: this.getPermission(this.permissionKey.query || 'wmsOutstoreProductInfo_query'),
      }
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
      this.search();
    },
    // 列表选中
    tableSelectionChange(selection) {
      this.tableSltData = selection;
    },
    // 列表搜索条件
    getPageParams() {
      let pageParams = this.$common.copy(this.pageParams);
      pageParams.warehouseId = this.wareId;
      // pageParams.orderSeq = this.pageParams.upDown === 'up' ? 'ASC' : 'DESC';
      const removeKey = {
        shl: ['skuCodeList', 'relateFlag'],
        other: ['erpSku', 'shlSku', 'relevance']
      }
      const keyList = removeKey[this.warehouseType];
      if (!this.$common.isEmpty(keyList)) {
        keyList.forEach(key => {
          delete pageParams[key]
        })
        // pageParams.orderBy = pageParams.orderBy === 'GX' ? 'UP' : pageParams.orderBy;
      } else {
        removeKey.other.forEach(key => {
          delete pageParams[key]
        })
        if (pageParams.relateFlag === '') {
          pageParams.relateFlag = null;
        }
      }
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
    // 取消关联选中
    cancelRelevancy() {
      let pageQuery = {
        warehouseId: this.wareId,
        // 列表 SHL SKU ID集合
        wmsOutstoreProductIdList: this.tableSltData.map(item => item[this.rowKey])
      };
      this.$emit('cancelRelated', pageQuery);
    },
    // 取消关联所有
    cancelAllRelevancy() {
      const removeKey = ['orderSeq', 'upDown', 'pageNum', 'pageSize'];
      let pageQuery = this.getPageParams();
      removeKey.forEach(key => {
        delete pageQuery[key];
      });
      this.$emit('cancelRelated', pageQuery);
    },
    // 导出选中
    exportCheck() {
      let obj = {};
      obj.warehouesId = this.wareId;
      obj.warehouseId = this.wareId;
      if (['shl'].includes(this.warehouseType)) {
        obj.wmsOutstoreProductIdList = this.tableSltData.map(val => val[this.rowKey]);
      } else {
        obj[this.exportParams + 's'] = this.tableSltData.map(val => val[this.exportParams]);
      }
      this.exportFn(obj);
    },
    // 导出所有
    exportAll() {
      this.exportFn(this.getPageParams());
    },
    // 导出数据
    exportFn(obj) {
      this.axios.post(this.exportApi, obj).then(res => {
        if (res.data.code !== 0) return;
        this.$Message.success('导出操作成功，请稍后到“导出查看”查看下载');
      });
    },
    // 弹窗导入窗口
    openInportModal() {
      this.$refs.importTemp.model1 = true;
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
      // this.pageParams.skuCodeList = [];
      this.$refs.pageParams && this.$refs.pageParams.resetFields();
    },
    // 获取列表数据
    getList() {
      if (!this.pagePermission.query) {
        // this.gotoError();
        this.tableLoading = false;
        this.$Message.error('您暂无权限查询数据，请联系管理员开通');
        return;
      }
      this.tableLoading = true;
      this.tableSltData = [];
      this.axios.post(this.getListApi, this.getPageParams()).then(response => {
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
    // 同步商品
    syncOnlineProduct() {
      if (this.productSyncLoading) return;
      // 同步在线商品
      let queryUrl = `${this.productSyncApi}?warehouesId=${this.wareId}&warehouseId=${this.wareId}`;
      const isShl = ['shl'].includes(this.warehouseType);
      // if (isShl) {
      //   queryUrl = this.productSyncApi;
      // }
      this.productSyncLoading = true;
      this.axios[isShl ? 'post' : 'put'](queryUrl).then(response => {
        this.productSyncLoading = false;
        if (response.data.code === 0) {
          this.$Message.success('操作成功, 稍后再刷新列表查看');
          this.pageParamsStatus = true;
        }
      }).catch(() => {
        this.productSyncLoading = false;
      })
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
