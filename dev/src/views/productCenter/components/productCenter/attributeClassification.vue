<template>
  <div class="attribute-management">
    <!--操作区-->
    <div class="addBrand">
      <Button
        type="primary"
        icon="md-add"
        v-if="permission.insert"
        @click="addEditAttribute({}, 'add')"
      >
        新增属性分类
      </Button>
      <Button
        type="primary"
        style="margin-left: 10px;"
        icon="md-sync"
        @click="refreshList"
      >
        刷新列表
      </Button>
    </div>
    <!--列表-->
    <div class="orderTable normalTop">
      <Table
        highlight-row
        :loading="tableLoading"
        border
        :height="tableHeight"
        :columns="skuMapColumn"
        :data="skuMapData"
      />
      <div class="table-page">
        <div class="table-page-right">
          <Page
            :total="total"
            @on-change="changePage"
            show-total
            :page-size="pageParams.pageSize"
            show-elevator
            :current="pageParams.pageNum"
            show-sizer
            @on-page-size-change="changePageSize"
            placement="top"
            :page-size-opts="pageArray"
          />
        </div>
      </div>
    </div>
    <!-- 新增(编辑)属性分类 -->
    <div v-if="showAttribute">
      <classificationEdit
        :module-data.sync="rowDetailes"
        :modal-visual.sync="showAttribute"
        :modal-type.sync="modalType"
        :refresh.sync="isRefresh"
      />
    </div>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import productMixin from '@/components/mixin/product_mixin';
import tableMixin from '@/components/mixin/table_mixin';
import classificationEdit from './classificationEdit';

export default {
  mixins: [Mixin, tableMixin, productMixin],
  components: {
    classificationEdit: classificationEdit
  },
  data () {
    return {
      modalType: 'view',
      isRefresh: false,
      rowDetailes: {},
      showAttribute: false,
      loadingAttribute: true,
      pageArray: [10, 20, 50, 100, 500],
      total: 0, // 总记录数
      pageParamsStatus: false, // 是否重新加载列表数据
      pageParams: { // 映射列表筛选参数
        pageNum: 1,
        pageSize: 20
      },
      skuMapData: [], // 列表数据
      skuMapColumn: [ // 列表列定义
        {
          title: '属性分类名称',
          key: 'classificationName',
          minWidth: 120,
          align: 'center'
        },
        {
          title: '创建人',
          key: 'createdBy',
          align: 'center',
          width: 150
        },
        {
          title: '创建时间',
          key: 'createdTime',
          align: 'center',
          width: 150
          // render: (h, params) => {
          //   return h('span', this.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          // }
        },
        {
          title: '操作',
          width: 180,
          fixed: 'right',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                style: {
                  marginRight: '10px',
                  display: `${this.permission.edit ? 'inline-block' : 'none'}`
                },
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.addEditAttribute(params.row, 'edit');
                  }
                }
              }, '编辑'),
              h('Button', {
                style: {
                  marginRight: '10px'
                },
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.addEditAttribute(params.row, 'view');
                  }
                }
              }, '详情'),
              h('Button', {
                style: {
                  display: `${this.permission.delete ? 'inline-block' : 'none'}`
                },
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    if (this.permission.delete) {
                      this.delConfirm(params.row);
                    }
                  }
                }
              }, '删除')
            ]);
          }
        }
      ]
    };
  },
  watch: {
    pageParamsStatus (val) { // 监听重置列表数据
      val && this.getList();
    },
    isRefresh: {
      deep: true,
      handler (val) {
        if (val) {
          this.getList();
          this.isRefresh = false;
        }
      }
    }
  },
  created () {
    this.tableHeight = this.getTableHeight(210);
  },
  activated () {
    this.pageParamsStatus = true;
  },
  computed: {
    // 权限
    permission () {
      return {
        // query: this.getPermission('productSkuMapping_query'),
        query: this.getPermission('queryClassificationList'),
        delete: this.getPermission('deleteClassificationDel'),
        edit: this.getPermission('updateClassificationEdit'),
        insert: this.getPermission('insertClassificationAdd')
      };
    }
  },
  methods: {
    getList () { // 查询列表数据
      if (!this.permission.query) return;
      let item = {
        pageNum: this.pageParams.pageNum,
        pageSize: this.pageParams.pageSize
      };
      this.loadingTrue();
      this.axios.get(api.classificationList, { params: item }).then(res => {
        this.pageParamsStatus = false;
        this.loadingFalse();
        if (res.data.code === 0 && res.data.datas && res.data.datas.list) {
          this.skuMapData = res.data.datas.list;
          this.total = res.data.datas.total;
        }
      }).catch(() => {
        this.loadingFalse();
        this.pageParamsStatus = false;
      });
    },
    delConfirm (delRow) { // 删除确认
      // this.$refs.delConfirmModal.show(delRow);
      this.$Modal.confirm({
        title: '提示',
        content: '是否确认删除?',
        onOk: () => {
          this.del(delRow)
        }
      })
    },
    del (row) { // 删除
      const v = {
        isBinding: () => {
          this.axios.get(api.classificationIsBinding, { params: { attributeId: row.classificationId } }).then(res => {
            if (res.data.code == 0) {
              if (res.data.datas) {
                this.$Message.error('有分类已绑定该属性分类，不允许删除');
              } else {
                v.hand();
              }
            }
          });
        },
        hand: () => {
          this.axios.get(api.classificationDel, { params: { attributeClassifyId: row.classificationId } }).then(res => {
            if (res.data.code == 0) {
              this.$Message.success('操作成功');
              this.pageParams.pageNum = 1;
              this.pageParamsStatus = true;
            }
          });
        }
      };
      v.isBinding();
    },
    // 刷新列表
    refreshList () {
      this.pageParamsStatus = true;
    },
    // 显示属性分类窗口
    addEditAttribute (row = {}, type = 'view') {
      this.rowDetailes = row
      this.modalType = type
      this.$nextTick(() => {
        this.showAttribute = true;
      });
    }
  }
};
</script>
