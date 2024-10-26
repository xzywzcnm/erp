<template >
  <div class="product-tag-main">
    <div class="commonFilter platformParamsSelect">
      <Form ref="searchForm" :model="pageParams" :label-width="90" label-position="right">
        <dyt-filter tableClassName="table-main">
          <Form-item label="标签名称" prop="name">
            <dytInput placeholder="请输入标签名称" v-model="pageParams.name" />
          </Form-item>
          <Form-item label="创建人" prop="createdByList">
            <dyt-select
              v-model="pageParams.createdByList"
              :max-tag-count="1"
              :multiple="true"
              placeholder="请选择创建人"
            >
              <Option
                v-for="(item, oIndex) in allUserData"
                :value="item.userId"
                :label="item.userName"
                :key="`f-${oIndex}`"
              />
            </dyt-select>
          </Form-item>
          <Form-item label="最后更新人" prop="updatedByList">
            <dyt-select
              v-model="pageParams.updatedByList"
              :max-tag-count="1"
              :multiple="true"
              placeholder="请选择最后更新人"
            >
              <Option
                v-for="(item, oIndex) in allUserData"
                :value="item.userId"
                :label="item.userName"
                :key="`l-${oIndex}`"
              />
            </dyt-select>
          </Form-item>
          <div slot="operation">
            <Button type="primary" icon="md-search" @click="searchTable(true)">查询</Button>
            <Button class="ml10" @click="resetForm" icon="md-refresh">重置</Button>
          </div>
        </dyt-filter>
      </Form>
    </div>
    <div class="table-top-operate mt10 mb10">
      <div class="operate-left">
        <Button type="primary" icon="md-add" v-if="permission.add" @click="openAddOrEditTag({})" :disabled="saveLoading">新增标签</Button>
        <Button class="ml10" type="primary" v-if="permission.export" @click="exportTag" :disabled="exportLoading">导出标签</Button>
      </div>
    </div>
    <div class="table-main">
      <Table
        highlight-row
        :loading="tableDataLoading"
        border
        :height="tableHeight"
        :columns="tableColumn"
        :data="tableData"
      />
      <Page
        class="mt5"
        :total="tableTotal"
        @on-change="pageNumChange"
        show-total
        :page-size="pageConfig.pageSize"
        show-elevator
        :current="pageConfig.pageNum"
        show-sizer
        @on-page-size-change="changePageSize"
        placement="top"
        :page-size-opts="pageArray"
      />
    </div>
    <!--新增(编辑)弹窗-->
    <Modal
      v-model="tagAddOrEditModalVisible"
      width="600"
      :mask-closable="false"
      :transfer="true"
      :title="`${!!modalRow.productTagId ? '修改标签名称' : '新增标签'}`"
    >
      <div class="edit-modal-main">
        <Form ref="editModalForm" :model="modalRow" :rules="editModalrule" :label-width="90" label-position="right">
          <Form-item label="原标签名称：" class="form-item-txt" v-if="!!modalRow.productTagId">
            {{ modalRow.oldName }}
          </Form-item>
          <Form-item :label="`${!!modalRow.productTagId ? '修改为' : '标签名称'}：`" prop="name">
            <dytInput placeholder="请输入标签名称" v-model="modalRow.name" />
          </Form-item>
        </Form>
        <Spin fix v-if="saveLoading"></Spin>
      </div>
      <div slot="footer">
        <Button @click="tagAddOrEditModalVisible = false">取消</Button>
        <Button class="ml20" type="primary" @click="saveTag()" :disabled="saveLoading">确定</Button>
      </div>
    </Modal>
    <!-- 删除标签弹窗 -->
    <Modal
      v-model="deleteModalVisible"
      width="600"
      :mask-closable="false"
      :transfer="true"
      :closable="false"
      title="删除标签"
    >
      <div style="font-size: 20px;font-weight: bold;">
        是否确认删除标签？该标签已有个<span style="color: #f20;"> {{ modalRow.total }} </span>SKU使用中
        <Spin fix v-if="deleteLoading"></Spin>
      </div>
      <div slot="footer">
        <Button @click="closeDeleteModal">取消</Button>
        <Button class="ml20" type="primary" @click="deleteTag" :disabled="deleteLoading">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  components: {},
  data () {
    return {
      exportLoading: false,
      pageParams: {
        name: '',
        createdByList: [],
        updatedByList: [],
      },
      pageConfig: {
        pageNum: 1,
        pageSize: 20
      },
      tableTotal: 0,
      allUserData: this.$store.state.userInfoList || {},
      tableDataLoading: false,
      tagAddOrEditModalVisible: false,
      deleteModalVisible: false,
      saveLoading: false,
      deleteLoading: false,
      tableData: [],
      modalRow: {
        productTagId: '',
        oldName: '',
        name: '',
      },
      editModalrule: {
        name: [
          { required: true, validator: this.$common.formItemVerify, msg: '请输入标签名称', trigger: 'change' },
          { required: true, validator: this.$common.formItemVerify, msg: '请输入标签名称', trigger: 'blur' },
        ]
      },
      tableColumn: [
        {
          title: '标签名称',
          key: 'name',
          minWidth: 300,
          align: 'center'
        },
        {
          title: '创建人',
          key: 'createdBy',
          minWidth: 120,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.createdBy)) return h('div', '');
            if (this.$common.isEmpty(this.allUserData[row.createdBy])) {
              if (row.createdBy == 'system') return h('div', '系统');
              return h('div', row.createdBy);
            }
            return h('div', this.allUserData[row.createdBy].userName || row.createdBy);
          }
        },
        {
          title: '最后更新人',
          key: 'updatedBy',
          minWidth: 120,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.updatedBy)) return h('div', '');
            if (this.$common.isEmpty(this.allUserData[row.updatedBy])) {
              if (row.updatedBy == 'system') return h('div', '系统');
              return h('div', row.updatedBy);
            }
            return h('div', this.allUserData[row.updatedBy].userName || row.updatedBy);
          }
        },
        {
          title: '创建时间',
          key: 'createdTime',
          minWidth: 160,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.createdTime)) return h('span', {}, '');
            return h('span', {}, this.$common.toLocaleDate(row.createdTime, 'fulltime'));
          }
        },
        {
          title: '最后修改时间',
          key: 'updatedTime',
          minWidth: 160,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.updatedTime)) return h('span', {}, '');
            return h('span', {}, this.$common.toLocaleDate(row.updatedTime, 'fulltime'));
          }
        },
        {
          title: '操作',
          width: 200,
          fixed: 'right',
          align: 'center',
          render: (h, { row }) => {
            let item = [];
            if (this.permission.edit) {
              item.push(h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.openAddOrEditTag(row);
                  }
                }
              }, '修改标签名称'));
            }
            if (this.permission.delete) {
              item.push(h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.openDeteleModal(row);
                  }
                }
              }, '删除'));
            }
            return h('div', { class: 'operate-col-group' }, item);
          }
        }
      ],
    }
  },
  computed: {
    tableHeight () {
      return this.getTableHeight(250);
    },
    // 权限
    permission() {
      return {
        delete: this.getPermission('productTag_delete'), // 删除标签
        query: this.getPermission('productTag_queryAll'), // 列表查询
        export: this.getPermission('productTag_export'), // 导出
        add: this.getPermission('productTag_insert'), // 新增
        edit: this.getPermission('productTag_modifyTag'), // 编辑
      }
    },
  },
  activated () {
    this.searchTable();
  },
  created () {
    this.searchTable();
  },
  methods: {
    // 获取列表数据
    searchTable (type) {
      if (!this.permission.query) {
        return this.$Message.error('您暂无查询权限');
      }
      if (type) {
        this.pageConfig.pageNum = 1;
      }
      this.$nextTick(() => {
        if (this.tableDataLoading) return;
        this.tableData = [];
        this.tableDataLoading = true;
        this.axios.post(api.querProductTag, this.getSearchParams()).then(res => {
          if (!res || !res.data || res.data.code != 0 || !res.data.datas) return;
          this.tableData = res.data.datas.list || [];
          this.tableTotal = res.data.datas.total;
        }).finally(() => {
          this.tableDataLoading = false;
        });
      })
    },
    // 重置搜索条件
    resetForm () {
      this.$refs.searchForm && this.$refs.searchForm.resetFields();
    },
    // 获取搜索条件参数
    getSearchParams () {
      let obj = this.$common.copy(this.pageParams);
      let pageParams = this.$common.copy(this.pageConfig);
      obj.name = obj.name.trim();
      return { ...obj, ...pageParams }
    },
    // 页码改变
    pageNumChange (page) {
      this.pageConfig.pageNum = page;
      this.$nextTick(() => {
        this.searchTable();
      })
    },
    // 列表页面条数改变
    changePageSize (pageSize) {
      this.pageConfig.pageSize = pageSize;
      this.$nextTick(() => {
        this.searchTable();
      })
    },
    // 打开(编辑)新增弹窗
    openAddOrEditTag (row) {
      this.$refs.editModalForm && this.$refs.editModalForm.resetFields();
      this.$nextTick(() => {
        this.$set(this.modalRow, 'productTagId', row.productTagId || '');
        this.$set(this.modalRow, 'oldName', row.name || '');
        this.$set(this.modalRow, 'name', '');
        this.$nextTick(() => {
          this.tagAddOrEditModalVisible = true;
        })
      })
    },
    // 保存标签
    saveTag (flag) {
      if (this.saveLoading) return;
      this.$refs.editModalForm.validate((valid) => {
        if (!valid) return;
        let saveInfo = {
          apiUrl: `${api.add_label}?name=${encodeURI(this.modalRow.name)}`,
          method: 'post',
          params: {},
        };
        if (!this.$common.isEmpty(this.modalRow.productTagId)) {
          saveInfo = {
            apiUrl: `${api.edit_labelNames}${this.modalRow.productTagId}`,
            method: 'put',
            params: {
              newTagName: this.modalRow.name,
              oldTagName: this.modalRow.oldName,
              productTagId: this.modalRow.productTagId
            },
          };
          if (!this.$common.isEmpty(flag)) {
            this.$set(saveInfo.params, 'updateRefrenceFlag', flag);
          }
        }
        this.saveLoading = true;
        this.axios[saveInfo.method](saveInfo.apiUrl, saveInfo.params).then(res => {
          this.saveLoading = false;
          if (!res || !res.data) return;
          if (res.data.code === 0) {
            this.$Message.success('保存成功');
            this.tagAddOrEditModalVisible = false;
            this.searchTable();
          } else if (res.data.code === 121008) {
            this.tagAddOrEditModalVisible = false;
            this.$Modal.confirm({
              title: '修改标签',
              content: '是否同步修改关联商品的标签信息',
              onOk: () => {
                this.saveTag(1);
                this.tableDataLoading = true;
              },
              onCancel: () => {
                this.saveTag(0);
                this.tableDataLoading = true;
              }
            });
          }
        }).catch(() => {
          this.saveLoading = false;
          this.tableDataLoading = false;
        });
      })
    },
    // 打开删除标签弹窗
    openDeteleModal (row) {
      this.$set(this.modalRow, 'productTagId', row.productTagId || '');
      this.$set(this.modalRow, 'oldName', row.name || '');
      this.$set(this.modalRow, 'name', '');
      this.deleteModalVisible = true;
      this.deleteLoading = true;
      this.axios.post(api.get_tagNum, [row.productTagId]).then(res => {
        if (!res || !res.data || res.data.code != 0) {
          this.$set(this.modalRow, 'total', 0);
          this.$Modal.confirm({
            title: '删除提示',
            content: '查询绑定SKU失败，是否继续删除该标签？',
            onOk: () => {
              this.deleteLoading = false;
            },
            onCancel: () => {
              this.tableDataLoading = true;
              this.deleteModalVisible = false;
            }
          });
        } else {
          this.deleteLoading = false;
          const binSkuInfo = res.data.datas.find(f => row.productTagId == f.tagId);
          this.$set(this.modalRow, 'total', this.$common.isEmpty(binSkuInfo) ? 0 : binSkuInfo.productCount || 0);
        }
      }).catch(() => {
        this.deleteLoading = false;
        this.$set(this.modalRow, 'total', 0);
      });
    },
    // 关闭删除标签弹窗
    closeDeleteModal () {
      this.deleteLoading = false;
      this.deleteModalVisible = false;
    },
    // 删除标签
    deleteTag () {
      this.deleteLoading = true;
      this.axios.delete(`${api.del_label}${this.modalRow.productTagId}`).then(res => {
        if (!res || !res.data || res.data.code != 0) return;
        this.$Message.success('删除成功');
        this.searchTable();
        this.deleteModalVisible = false;
        this.deleteLoading = false;
      }).catch(() => {
        this.deleteLoading = false;
      });
    },
    // 导出标签
    exportTag () {
      if (this.exportLoading) return;
      this.exportLoading = true;
      this.axios.post(api.export_tag).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出完成');
        } else {
          this.$Message.error('导出失败');
        }
        this.exportLoading = false;
      }).catch(() => {
        this.exportLoading = false;
      });
    },
  }
};
</script>

<style lang="less" scoped>
.product-tag-main{
  position: relative;
  .commonFilter{
    padding-top: 10px;
    margin: 0;
    background: #fff;
  }
  .table-top-operate {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .table-main{
    position: relative;
    .ivu-page{
      text-align: right;
    }
  }
  :deep(.ivu-table-wrapper) {
    .operate-col-group{
      .ivu-btn{
        margin-right: 5px;
        &:last-child{
          margin-right: 0;
        }
      }
    }
  }
}
.edit-modal-main{
  .form-item-txt{
    margin-bottom: 0;
  }
  :deep(.ivu-form-item) {
    .ivu-form-item-label{
      padding: 10px 5px;
    }
  }
}
</style>
