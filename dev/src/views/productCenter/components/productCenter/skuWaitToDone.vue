<template>
  <div class="attribute-detail-list">
    <!--列表-->
    <div class="orderTable">
      <div class="mb5">
        <Button type="primary" @click="importHand" v-if="permission.import">导入</Button>
        <Dropdown class="ml10" @on-click='exportHand' v-if="permission.export">
          <Button type="primary">导出 <Icon type="ios-arrow-down"></Icon></Button>
          <DropdownMenu slot="list">
            <DropdownItem name='exportCheck'>导出选中</DropdownItem>
            <DropdownItem name='exportAll'>导出所有结果</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown class="ml10" @on-click='batchHand' v-if="permission.sign || permission.edit">
          <Button type="primary">批量操作 <Icon type="ios-arrow-down"></Icon></Button>
          <DropdownMenu slot="list">
            <DropdownItem name='batchSign' v-if="permission.sign">批量标记已处理</DropdownItem>
            <DropdownItem name='batchEdit' v-if="permission.edit">批量编辑</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <Table
        highlight-row
        :loading="tableDataLoading"
        border
        :height="tableHeight"
        :columns="tableColumn"
        :data="tableData"
        @on-selection-change="choseTableDataChange"
        @on-sort-change="tableSortHand"
      />
      <!-- <div class="mt5" slot="page-top">
        <Checkbox v-model="allPageStatus">所有页全选</Checkbox>
      </div> -->
      <!-- 分页 -->
      <div class="table-page">
        <div class="table-page-right">
          <Page
            :total="tableTotal"
            @on-change="pageChangeHand"
            show-total
            :page-size="pageParams.pageSize"
            show-elevator
            :current="pageParams.pageNum"
            show-sizer
            @on-page-size-change="pageSizeChangeHand"
            placement="top"
            :page-size-opts="pageArray"
          />
        </div>
      </div>
    </div>
    <!-- 编辑 -->
    <editSkuaAwait :model-visible.sync="visibleEditModal" :module-data="editModalData" @refreshTable="searchTable" />
    <!-- 标记已处理 -->
    <signSkuaAwait :model-visible.sync="visibleSignModal" :module-data="editModalData" @refreshTable="searchTable" />
    <!-- 导入 -->
    <skuaAwaitImport :model-visible.sync="visibleImportModal" :module-data="inportModalData" @refreshTable="searchTable" />
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
// import productMixin from '@/components/mixin/product_mixin';
// import tableMixin from '@/components/mixin/table_mixin';
import editSkuaAwait from '../productCenter/modules/editSkuaAwait.vue';
import signSkuaAwait from '../productCenter/modules/signSkuaAwait.vue';
import skuaAwaitImport from '../productCenter/modules/skuaAwaitImport.vue';

export default {
  mixins: [Mixin],
  components: {
    editSkuaAwait,
    signSkuaAwait,
    skuaAwaitImport
  },
  props: {
    getSeatchFilter: { type: Function, default: () => {} }
  },
  data () {
    return {
      allPageStatus: false,
      visibleEditModal: false,
      tableDataLoading: false,
      visibleSignModal: false,
      visibleImportModal: false,
      inportModalData: {},
      allUserData: this.$store.state.userInfoList,
      editModalData: {
        rows: [],
        type: 'single'
      },
      pageArray: [10, 20, 50, 100, 500],
      // 总记录数
      tableTotal: 0,
      // 映射列表筛选参数
      pageParams: {
        orderBy: '',
        upDown: 'down',
        pageNum: 1,
        pageSize: 50
      },
      // 选中的数据
      chosedTableRowData: [],
      // 列表数据
      tableData: [],
      // 列表列定义
      tableColumn: [
        {
          type: 'selection',
          width: 60,
          key: 'selection',
          align: 'center',
          fixed: 'left'
        },
        {
          title: 'SPU',
          key: 'spu',
          width: 120,
          align: 'center',
          render: (h, { row }) => {
            return h('div', {
              style: {
                color: '#2d8cf0',
              }
            }, `${row.spu || ''}`);
          }
        },
        {
          title: 'SKU',
          key: 'sku',
          width: 120,
          align: 'center',
          render: (h, { row }) => {
            return h('div', {
              style: {
                color: '#2d8cf0',
              }
            }, `${row.sku || ''}`);
          }
        },
        {
          title: '商品图片',
          key: 'path',
          align: 'center',
          minWidth: 70,
          render: (h, params) => {
            return this.tableImg(h, params, 'path');
          }
        },
        {
          title: '商品名称',
          key: 'cnName',
          minWidth: 150,
          align: 'center',
          render: (h, { row }) => {
            let item = [h('div', {}, row.cnName || '')];
            if (!this.$common.isEmpty(row.productGoodsSpecifications)) {
              item.push(h('div', {
                style: {
                  color: '#2d8cf0',
                  'text-align': 'center'
                }
              }, row.productGoodsSpecifications.map(m => m.value).join('.')));
            }
            return h('div', {
              class: 'text-align-dom'
            }, item);
          }
        },
        {
          title: '待办',
          key: 'backlogName',
          align: 'center',
          width: 120,
          render: (h, { row }) => {
            return h('span', `${row.backlogName || ''}`);
          }
        },
        {
          title: '备注',
          key: 'remark',
          align: 'center',
          minWidth: 150,
          render: (h, { row }) => {
            return h('span', row.remark);
          }
        },
        {
          title: '剩余到期时间',
          key: 'dayNumber',
          align: 'center',
          width: 120,
          sortable: 'custom',
          sortKey: '',
          render: (h, { row }) => {
            let item = [];
            let itemStyle = {};
            let residueTime = 0;
            if (!this.$common.isEmpty(row.dayNumber)) {
              item.push(h('span', {
                style: {
                  'margin-right': '5px',
                }
              }, `${row.dayNumber}d`));
              residueTime = row.dayNumber * 24 * 60;
            }
            if (!this.$common.isEmpty(row.hours)) {
              item.push(h('span', {
                style: {
                  'margin-right': '5px',
                }
              }, `${(residueTime < 0) && row.hours < 0 ? (row.hours * -1) : row.hours}h`));
              if (residueTime >= 0) {
                residueTime = residueTime + row.hours * 60;
              }
            }
            if (!this.$common.isEmpty(row.minutes)) {
              item.push(h('span', `${(residueTime < 0) && row.minutes < 0 ? (row.minutes * -1) : row.minutes}m`));
              if (residueTime >= 0) {
                residueTime = residueTime + row.minutes;
              }
            }
            residueTime = residueTime / (24 * 60);
            if (residueTime > 0 && residueTime < 2) {
              itemStyle.color = '#ff9f11';
            } else if (residueTime < 0) {
              itemStyle.color = '#f20';
            }
            return h('div', {
              style: itemStyle
            }, item);
          }
        },
        {
          title: '创建人',
          key: 'createdBy',
          align: 'center',
          width: 120,
          render: (h, { row }) => {
            if (this.$common.isEmpty(this.allUserData) || this.$common.isEmpty(this.allUserData[row.createdBy])) return h('span', `${row.createdBy || ''}`);
            return h('span', `${this.allUserData[row.createdBy].userName || ''}`);
          }
        },
        {
          title: '到期时间',
          key: 'expireTime',
          align: 'center',
          sortable: 'custom',
          sortKey: 'expireTime',
          width: 140,
          render: (h, { row }) => {
            return h('span', row.expireTime);
          }
        },
        {
          title: '创建时间',
          key: 'createdTime',
          sortable: 'custom',
          sortKey: 'createdTime',
          align: 'center',
          width: 140,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.createdTime)) return h('span', '');
            return h('span', this.$common.toLocaleDate(row.createdTime, 'fulltime'));
          }
        },
        {
          title: '操作',
          width: 140,
          fixed: 'right',
          align: 'center',
          render: (h, { row }) => {
            let item = [];
            if (this.permission.edit) {
              item.push(h('Button', {
                style: {
                  'margin-right': '5px',
                },
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.openEdit([row], 'single');
                  }
                }
              }, '编辑'));
            }
            if (this.permission.sign) {
              item.push(h('Button', {
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.openSign([row], 'single');
                  }
                }
              }, '标记已处理'));
            }
            return h('div', item);
          }
        }
      ]
    };
  },
  watch: {},
  created () {},
  computed: {
    tableHeight () {
      return this.getTableHeight(286);
    },
    // 可查看的事业部
    businessDeptIds() {
      if (!this.$store.getters['authUserInfo'] || !this.$store.getters['authUserInfo'].securityUser) return '';
      return this.$store.getters['authUserInfo'].securityUser.businessDeptIds;
    },
    // 权限
    permission () {
      return {
        // 导入
        import: this.getPermission('productBacklog_import'),
        // 标记已处理
        sign: this.getPermission('productBacklog_handle'),
        // 编辑
        edit: this.getPermission('productBacklog_edit'),
        // 导出
        export: this.getPermission('productBacklog_export')
      }
    }
  },
  methods: {
    // 搜索参数
    skuSearchParams () {
      let param = this.getSeatchFilter();
      const pKey = [
        'backlogName', 'productCodeList', 'createdByList', 'businessDeptIdList', 'startExpireTime', 'endExpireTime', 'orderBy', 'upDown',
        'pageNum', 'pageSize'
      ];
      param.startExpireTime = '';
      param.endExpireTime = '';
      if (!this.$common.isEmpty(param.expireTime)) {
        if (!this.$common.isEmpty(param.expireTime[0])) {
          param.startExpireTime = this.$common.getUniversalTime(param.expireTime[0], 'fulltime');
        }
        if (!this.$common.isEmpty(param.expireTime[1])) {
          param.endExpireTime = this.$common.getUniversalTime(param.expireTime[1], 'fulltime');
        }
      }
      param.productCodeList = this.$common.isEmpty(param.code) ? [] : param.code.split(',');
      param.businessDeptIdList = this.businessDeptIds.split(',');
      Object.keys(param).forEach(key => {
        if (!pKey.includes(key)) {
          delete param[key];
        }
      });
      return { ...param, ...this.pageParams };
    },
    // 搜索列表数据
    searchTable (type) {
      if (this.tableDataLoading) return;
      if (type) {
        this.pageParams.pageNum = 1;
      }
      this.tableDataLoading = true;
      this.chosedTableRowData = [];
      this.$nextTick(() => {
        const searchFilter = this.skuSearchParams();
        this.getSkuAwaitNumber();
        this.axios.post(api.skuAwaitList, searchFilter).then((res) => {
          if (!res || !res.data || res.data.code != 0) {
            this.tableData = [];
            this.tableTotal = 0;
            return;
          }
          this.tableData = (res.data.datas.list || []);
          this.tableTotal = res.data.datas.total || this.tableData.length;
        }).catch((err) => {
          console.error(err);
          this.tableData = [];
          this.tableTotal = 0;
        }).finally(() => {
          this.tableDataLoading = false;
        })
      })
    },
    // 分页切换
    pageChangeHand (page) {
      this.pageParams.pageNum = page;
      this.$nextTick(() => {
        this.searchTable();
      })
    },
    // 页码改变
    pageSizeChangeHand (pageSize, plat) {
      this.pageParams.pageSize = pageSize;
      this.$nextTick(() => {
        this.searchTable();
      })
    },
    // 选择行改变时
    choseTableDataChange (value) {
      this.chosedTableRowData = value;
    },
    // 表格列排序
    tableSortHand (data) {
      this.pageParams.orderBy = data.column.sortKey;
      this.pageParams.upDown = data.order == 'asc' ? 'up' : 'down';
      this.$nextTick(() => {
        this.searchTable();
      })
    },
    // 导入操作
    importHand () {
      this.visibleImportModal = true;
    },
    // 导出操作
    exportHand (str) {
      if (this.$common.isEmpty(str)) return;
      let searchFilter = this.skuSearchParams();
      let content = '';
      if (str == 'exportCheck') {
        if (this.chosedTableRowData.length <= 0) return this.$Message.error('请选择需要操作的数据');
        searchFilter.productBacklogId = this.chosedTableRowData.map(item => item.productBacklogId);
        content = `<div>确认导出选中的 <span style="color:#f20;font-size: 16px;font-weight: bold;">${this.chosedTableRowData.length}</span> 条数据?</div>`;
      }
      if (str == 'exportAll') {
        content = `<div>确认导出当前搜索条件下的所有数据?</div>`;
      }
      this.$Modal.confirm({
        title: '操作提示',
        content: content,
        onOk: () => {
          this.axios.post(api.skuAwaitExport, searchFilter).then((res) => {
            if (!res || !res.data || res.data.code != 0) return;
            this.$Message.success('导出操作成功');
          })
        }
      })
    },
    // 点击批量操作对应的子级
    batchHand (str) {
      if (this.$common.isEmpty(str)) return;
      if (this.chosedTableRowData.length <= 0) return this.$Message.error('请选择需要操作的数据');
      const handObj = {
        batchEdit: (data) => {
          this.openEdit(data, 'batch')
        },
        batchSign: (data) => {
          this.openSign(data, 'batch');
        }
      }
      if (this.$common.isEmpty(handObj[str])) return;
      handObj[str](this.chosedTableRowData);
    },
    // 打开编辑弹窗
    openEdit (list, type) {
      this.editModalData = {
        rows: list || [],
        type: type
      };
      this.$nextTick(() => {
        this.visibleEditModal = true;
      })
    },
    // 打开标记已处理弹窗
    openSign (list, type) {
      this.editModalData = {
        rows: list || [],
        type: type
      };
      this.$nextTick(() => {
        this.visibleSignModal = true;
      })
    }
  }
};
</script>
<style scoped lang="less">
.attribute-detail-list {
  :deep(.ivu-table-cell) {
    .text-align-dom {
      display: inline-block;
      margin: 0 auto;
      text-align: left;
    }
    .table-td-class {
      .ivu-btn{
        margin-right: 5px;
        &:last-child{
          margin-right: 0;
        }
      }
    }
  }
}
.table-page{
  margin: 0;
  .table-page-right{
    float: initial;
    margin-bottom: 0;
    padding: 0;
    text-align: right;
    .ivu-page{
      display: inline-block;
    }
  }
}
</style>
