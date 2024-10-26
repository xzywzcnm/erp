<template>
  <div class="attribute-detail-list">
    <!-- 筛选条件区 -->
    <div class="platformParamsSelect">
      <Form
        class="attribute-filter"
        label-position="right"
        ref="filterRefsDome"
        :model="filterData"
        :rules="filterRule"
        :label-width="80"
      >
        <dyt-filter>
          <Form-item label="属性名(别名)" prop="attributeName">
            <Input
              v-model="filterData.attributeName"
              placeholder="请输入属性名或属性别名"
              clearable
              maxlength="150"
            />
          </Form-item>
          <Form-item label="属性值" prop="attributeValue">
            <Input
              v-model="filterData.attributeValue"
              placeholder="请输入属性值"
              clearable
              maxlength="150"
            />
          </Form-item>
          <div slot="operation">
            <Button
              type="primary"
              @click="refreshList({pageNumber: 1})"
              icon="md-search"
            >查询</Button>
            <Button
              style="margin-left: 10px;"
              @click="resetFilter"
              icon="md-refresh"
            >重置</Button>
          </div>
        </dyt-filter>
      </Form>
    </div>
    <!--操作区-->
    <div class="addBrand">
      <Button
        type="primary"
        icon="md-add"
        v-if="permission.insert"
        @click="addEditAttribute({}, 'add')"
      >
        添加新属性
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
    <!-- 新增(编辑)属性 -->
    <div v-if="showAttribute">
      <attributeEdit
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
import attributeEdit from './attributeEdit';

export default {
  mixins: [Mixin, tableMixin, productMixin],
  components: {
    attributeEdit: attributeEdit
  },
  props: {},
  data () {
    return {
      filterData: {
        attributeName: null,
        attributeValue: null
      }, // 搜索栏表单数据
      filterRule: {}, // 搜索栏表单规则
      isRefresh: false,
      rowDetailes: {},
      modalType: 'view',
      showAttribute: false,
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
          title: '序号',
          key: 'id',
          width: 100,
          // type: 'index',
          align: 'center'
        },
        // {
        //   title: '属性名(中:英)',
        //   key: 'enName',
        //   width: 200,
        //   align: 'center',
        //   render: (h, params) => {
        //     return h('div', `${params.row.attributeId ? params.row.attributeId : ''}${params.row.cnName}`);
        //   }
        // },
        {
          title: '属性别名',
          key: 'aliasName',
          width: 200,
          align: 'center'
        },
        {
          title: '属性值中文名',
          key: 'attributeClassifyId',
          minWidth: 200,
          align: 'center',
          render: (h, params) => {
            let text = '-';
            if (params.row.attributeValueList) {
            //   text = params.row.attributeValueList.map(item => {
            //     return `${item.cnValue}`;
            //   }).join(', ');
              text = params.row.attributeValueList.map(item => {
                return item.cnValue.trim();
              }).sort(this.compareFunction).join(', ');
            }
            return h('span', text);
          }
        },
        {
          title: '类型',
          key: 'type',
          align: 'center',
          width: 70,
          render: (h, params) => {
            return h('span', `${params.row.type == 0 ? '单选' : '多选'}`);
          }
        },
        {
          title: '是否必选',
          key: 'isMandatory',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('span', `${params.row.isMandatory == 0 ? '否' : '是'}`);
          }
        },
        {
          title: '是否生成标题及文本',
          key: 'isTitleAndText',
          align: 'center',
          fixed: 'right',
          width: 100,
          render: (h, params) => {
            return h('span', `${params.row.isTitleAndText == 0 ? '否' : '是'}`);
          }
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
    isRefresh (val) {
      if (val) {
        this.getList()
        this.isRefresh = false
      }
    }
  },
  created () {
    this.tableHeight = this.getTableHeight(265);
    this.$nextTick(() => {
      this.pageParamsStatus = true
    })
  },
  computed: {
    // 权限
    permission () {
      return {
        query: this.getPermission('queryAttributeClassificationList'),
        delete: this.getPermission('deleteAttributeClassification'),
        edit: this.getPermission('updateAttributeClassification'),
        insert: this.getPermission('insertAddAttributeClassification')
      }
    }
  },
  methods: {
    compareFunction (a, b) {
      return a.localeCompare(b);
    },
    getList () { // 查询列表数据
      if (!this.permission.query) return;
      let item = {
        pageNum: this.pageParams.pageNum,
        pageSize: this.pageParams.pageSize
      };
      this.loadingTrue();
      this.axios.post(api.attributeLists, { ...item, ...this.filterData }).then(res => {
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
    // 删除确认
    delConfirm (delRow) {
      this.$Modal.confirm({
        title: '提示',
        content: '操作存在风险，是否确认操作?',
        onOk: () => {
          this.del(delRow)
        }
      })
    },
    del (row) { // 删除
      const v = {
        hand: () => {
          this.axios.get(api.attributeDel, {
            params: { attributeId: row.attributeClassifyId }
          }).then(res => {
            if (res.data.code == 0) {
              this.$Message.success('操作成功');
              this.pageParams.pageNum = 1;
              this.pageParamsStatus = true;
            }
          });
        }
      };
      v.hand();
    },
    // 刷新列表
    refreshList (config) {
      if (config && config.pageNumber) {
        this.pageParams.pageNum = config.pageNumber;
      }
      this.pageParamsStatus = true;
    },
    // 重置搜索条件
    resetFilter () {
      this.$refs.filterRefsDome.resetFields()
    },
    // 显示属性窗口
    addEditAttribute (row = {}, type = 'view') {
      this.modalType = type
      this.rowDetailes = row
      this.$nextTick(() => {
        this.showAttribute = true;
      });
    }
  }
};
</script>
<style scoped lang="less">
.attribute-detail-list{
  .attribute-filter{
    display:inline-block;
    vertical-align: top;
    width: 100%;
  }
}
</style>
