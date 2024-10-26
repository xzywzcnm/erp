<template>
  <div class="attribute-detail-list">
    <!-- 筛选条件区 -->
    <div class="platformParamsSelect">
      <Form class="attribute-filter" ref="filterRefsDome" :model="filterData" :rules="filterRule" :label-width="100" inline>
        <dyt-filter :filter-row="1">
          <FormItem label="质检项目名称" prop="qualityProjectList">
            <dyt-input-tag
              v-model="filterData.qualityProjectList"
              type="textarea"
              :limit="1"
              :string="false"
              placeholder="请输入质检项目名称，多个用逗号或回车分隔"
            />
          </FormItem>
          <FormItem label="质检内容描述" prop="qualityDescription">
            <Input v-model="filterData.qualityDescription" placeholder="请输入质检内容描述" clearable maxlength="150" />
          </FormItem>
          <div class="filter-btn" slot="operation">
            <Button type="primary" class="filter-btn-item" @click="refreshList({pageNumber: 1})" icon="md-search">查询</Button>
            <Button class="filter-btn-item" @click="resetFilter" icon="md-refresh">重置</Button>
          </div>
        </dyt-filter>
      </Form>
    </div>
    <!--操作区-->
    <div class="addBrand operate-content">
      <div class="operate-left">
        <Button type="primary" icon="md-add" v-if="permission.insert" @click="addEditAttribute({}, 'add')">
          添加
        </Button>
        <!-- <Button
          type="primary"
          style="margin-left: 10px;"
          icon="md-sync"
          @click="refreshList"
        >
          刷新列表
        </Button> -->
      </div>
      <div class="operate-right">
        <dyt-sortBySelect
          :sortButtonList="sortButtonList"
          @sortInfo="getSortInfoAndFetch(arguments)"
          :sorType="{ DESC: 'down', ASC: 'up' }"
        />
      </div>
    </div>
    <!--列表-->
    <div class="orderTable normalTop">
      <Table highlight-row :loading="tableLoading" border :height="tableHeight" :columns="qualityColumn" :data="qualityData" />
      <div class="table-page">
        <div class="table-page-right">
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="pageParams.pageNum" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray" />
        </div>
      </div>
    </div>
    <!--新增(编辑)质检项目-->
    <Modal v-model="editForm.isShowEditDialog" :title="`${modalEdit ? '查看质检项目' : '编辑质检项目'}`" :width="700" :mask-closable="modalEdit">
      <div class="normalTop">
        <Form :label-width="100" ref="editForm" :rules="editForm.ruleValidate" :model="editForm.formValidate">
          <div style="padding:0px 0px 10px 60px " v-if="modalType === 'add'">
            <p>提示：1、质检项目指需要检测的项目，例如测量衣长、肩宽。</p>
            <p style="padding:0px 0px 10px 42px ">2、质检内容描述指质检方式，例如测量要求、合格标准等。</p>
          </div>
          <div>
            <FormItem label="质检项目" prop="projectName">
              <dytInput placeholder="请输入质检项目名称" v-model="editForm.formValidate.projectName" :disabled="modalEdit" ref="input" />
            </FormItem>
          </div>
          <div class="normalTop">
            <FormItem label="质检内容描述" prop="projectDescription">
              <dytInput
                type="textarea"
                :autosize="{ minRows: 5, maxRows: 20 }"
                placeholder="请输入质检内容描述"
                :maxlength='500'
                v-model="editForm.formValidate.projectDescription"
                :disabled="modalEdit"
              />
            </FormItem>
          </div>
          <FormItem label="价格：" prop="price">
            <dytInput
              v-model="editForm.formValidate.price"
              :disabled="modalEdit"
              placeholder="请输入0至10000(不包含0和10000)之间的数字或2位小数"
            />
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: center;">
        <Button type="primary" @click="addList(modalType)" v-if="!modalEdit">保存</Button>
        <Button @click="closeDialog">关闭</Button>
      </div>
      <Spin size="large" fix v-if="detailsLoading"></Spin>
    </Modal>
    <qualityProjectLog
      :log-visible.sync="logVisible"
      :module-data="moduleLogRow"
      :all-user-info="userList"
    />
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import productMixin from '@/components/mixin/product_mixin';
import tableMixin from '@/components/mixin/table_mixin';
import attributeEdit from './attributeEdit';
import qualityProjectLog from './qualityProjectLog';

export default {
  mixins: [Mixin, tableMixin, productMixin],
  components: {
    attributeEdit: attributeEdit,
    qualityProjectLog
  },
  props: {},
  data () {
    // var self = this;
    return {
      filterData: {
        qualityDescription: null,
        qualityProjectList: [],
        upDown: 'down',
        orderBy: 'createdTime'
      }, // 搜索栏表单数据
      logVisible: false,
      moduleLogRow: {},
      filterRule: {}, // 搜索栏表单规则
      detailsLoading: false,
      isRefresh: false,
      userList: {},
      modalType: 'view',
      showAttribute: false,
      pageArray: [10, 20, 50, 100, 500],
      total: 0, // 总记录数
      pageParamsStatus: false, // 是否重新加载列表数据
      pageParams: { // 映射列表筛选参数
        pageNum: 1,
        pageSize: 20
      },
      // 排序
      sortButtonList: [
        {
          sortHeader: '价格',
          sortField: 'price',
          sortType: 'down',
          default: false
        },
        {
          sortHeader: '创建时间',
          sortField: 'createdTime',
          sortType: 'down',
          default: true
        }
      ],
      qualityData: [], // 列表数据
      qualityColumn: [ // 列表列定义
        {
          title: '序号',
          key: 'id',
          width: 150,
          // type: 'index',
          align: 'center',
          type: 'index'
        },
        {
          title: '质检项目',
          key: 'qualityProject',
          width: 150,
          align: 'center',
          render: (h, params) => {
            return h('div', `${params.row.qualityProject}`);
          }
        },
        {
          title: '质检内容描述',
          key: 'qualityDescription',
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            return h('span', `${params.row.qualityDescription}`);
          }
        },
        {
          title: '创建人',
          key: 'createdBy',
          align: 'center',
          width: 150,
          render: (h, params) => {
            return h('span', `${params.row.createdBy}`);
          }
        },
        {
          title: '创建时间',
          key: 'createdTime',
          align: 'center',
          width: 150,
          render: (h, params) => {
            let timestamp = new Date(parseInt(params.row.createdTime));
            let time = timestamp.toLocaleDateString().replace(/\//g, '-') + ' ' + timestamp.toTimeString().substr(0, 8)
            return h('span', time);
          }
        },
        {
          title: '价格',
          key: 'price',
          align: 'center',
          width: 150,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.price)) return h('span', '');
            return h('span', `${row.price}`);
          }
        },
        {
          title: '操作',
          width: 190,
          fixed: 'right',
          align: 'center',
          render: (h, params) => {
            return h('div', {
              class: 'table-td-class'
            }, [
              h('Button', {
                style: {
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
                  display: `${this.permission.view ? 'inline-block' : 'none'}`
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
              }, '删除'),
              h('Button', {
                style: {
                  display: `${this.permission.log ? 'inline-block' : 'none'}`
                },
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.moduleLogRow = params.row;
                    this.$nextTick(() => {
                      this.logVisible = true;
                    })
                  }
                }
              }, '日志')
            ]);
          }
        }
      ],
      editForm: {
        isShowEditDialog: false,
        formValidate: {
          projectName: '',
          price: null,
          projectDescription: ''
        },
        ruleValidate: {
          projectName: [
            { required: true, message: '质检项目不能为空', trigger: 'blur' }
            // { required: true, message: '质检项目不能为空', trigger: 'change' }
          ],
          projectDescription: [
            { required: true, message: '质检内容描述不能为空', trigger: 'blur' }
            // { required: true, message: '质检内容描述不能为空', trigger: 'change' }
          ],
          price: [
            {
              required: true,
              validator: this.$common.validatorMaxNumber,
              min: 0,
              max: 10000,
              point: 2,
              notIncludes: ['max'],
              msg: '请输入0至10000(不包含10000)之间的数字或2位小数',
              trigger: 'blur'
            },
            {
              required: true,
              validator: this.$common.validatorMaxNumber,
              min: 0,
              max: 10000,
              point: 2,
              notIncludes: ['max'],
              msg: '请输入0至10000(不包含10000)之间的数字或2位小数',
              trigger: 'change'
            },
          ]
        }
      }
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
    },
    'editForm.isShowEditDialog' (newValue, oldValue) {
      if (!newValue) this.resetForm();
    }
  },
  created () {
    this.tableHeight = this.getTableHeight(265);
    this.$nextTick(() => {
      this.pageParamsStatus = true
    })
  },
  mounted () {
    // this.getUserInfo()
  },

  computed: {
    // 权限
    permission () {
      return {
        query: this.getPermission('productCenter_QualityProject_query'),
        view: this.getPermission('qualityProject_query'),
        delete: this.getPermission('productCenter_QualityProject_delete'),
        edit: this.getPermission('qualityProject_modify'),
        insert: this.getPermission('productCenter_QualityProject_save'),
        log: this.getPermission('qualityProject_operateLog')
      }
    },
    modalEdit () {
      return ['view'].includes(this.modalType);
    }
  },
  methods: {
    getList () { // 查询列表数据
      let v = this
      if (!this.permission.query) return;
      let item = {
        pageNum: this.pageParams.pageNum,
        pageSize: this.pageParams.pageSize
      };
      this.loadingTrue();
      this.getAllUser().then(res => {
        this.axios.post(api.queryProjectList, { ...item, ...this.filterData }).then(res => {
          this.pageParamsStatus = false;
          this.loadingFalse();
          if (res.data.code === 0 && res.data.datas && res.data.datas.list) {
            this.qualityData = res.data.datas.list;
            this.qualityData.forEach(item => {
              item.createdBy = v.findCreator(item.createdBy)
            })
            this.total = res.data.datas.total;
          }
        }).catch(() => {
          this.loadingFalse();
          this.pageParamsStatus = false;
        });
      })
    },
    // 获取所有用户
    getAllUser () {
      return new Promise((resolve) => {
        if (!this.$common.isEmpty(this.userList)) return resolve(this.userList);
        this.axios.get(api.getAllUser).then(res => {
          if (!res || !res.data || res.data.code != 0) return resolve({});
          this.userList = res.data.datas;
          resolve(this.userList);
        }).catch(() => {
          resolve({});
        })
      })
    },
    // 删除确认
    delConfirm (delRow) {
      this.$Modal.confirm({
        title: '提示',
        content: `操作存在风险，是否确认删除质检项目：${delRow.qualityProject}?`,
        onOk: () => {
          this.del(delRow)
        }
      })
    },
    del (row) { // 删除
      const v = {
        hand: () => {
          this.axios.post(`${api.deleteProductQualityProjectById}?qualityProjectId=${row.qualityProjectId}`
          ).then(res => {
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
    // 获取质检项目详情
    getQualityProjectDetails (id) {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(id)) return resolve({});
        this.axios.get(`${api.qualityProjectDetails}${id}`).then(res => {
          if (res.data && res.data.code === 0) {
            return resolve(res.data.datas);
          }
          resolve({});
        }).catch(() => {
          resolve({});
        })
      })
    },
    // 显示属性窗口
    addEditAttribute (row = {}, type = 'view') {
      this.modalType = type;
      this.editForm.isShowEditDialog = true;
      if (!this.$common.isEmpty(row)) {
        this.detailsLoading = true;
        this.getQualityProjectDetails(row.qualityProjectId).then(res => {
          const details = this.$common.isEmpty(res) ? row : res;
          this.editForm.formValidate.projectName = details.qualityProject || '';
          this.editForm.formValidate.projectDescription = details.qualityDescription || '';
          this.editForm.formValidate.qualityProjectId = details.qualityProjectId || '';
          this.editForm.formValidate.price = details.price || null;
          this.detailsLoading = false;
          this.$nextTick(() => {
            this.$refs.input.focus();
          });
        })
        return;
      }
      this.$nextTick(() => {
        this.$refs.input.focus();
      });
    },
    // 添加质检项目
    addList (param) {
      this.$refs.editForm.validate((valid) => {
        if (!valid) return;
        let parameter = {
          qualityProject: this.editForm.formValidate.projectName.trim(),
          qualityDescription: this.editForm.formValidate.projectDescription,
          price: Number(this.editForm.formValidate.price)
        }
        if (param === 'edit') {
          parameter.qualityProjectId = this.editForm.formValidate.qualityProjectId;
        }
        this.detailsLoading = true;
        this.axios[param === 'edit' ? 'put' : 'post'](api[param === 'edit' ? 'modifyQualityProject' : 'addProjectList'], parameter).then(res => {
          this.detailsLoading = false;
          if (res.data.code === 0) {
            this.editForm.isShowEditDialog = false
            this.$Message.success('操作成功');
            this.resetForm();
            this.getList();
            return
          }
          if ([500002, 1].includes(res.data.code)) {
            this.$Message.error('该质检项目名称已存在，请修改质检项目名称');
            return
          }
          this.$Message.error('操作失败');
        }).catch(() => {
          this.detailsLoading = false;
        })
      })
    },
    closeDialog () {
      this.editForm.isShowEditDialog = false;
      this.$nextTick(() => {
        this.resetForm();
      })
    },
    resetForm () {
      this.editForm.formValidate.projectName = '';
      this.editForm.formValidate.projectDescription = '';
      this.editForm.formValidate.qualityProjectId = '';
      this.editForm.formValidate.price = null;
      this.$nextTick(() => {
        this.$refs.editForm && this.$refs.editForm.resetFields();
      })
    },
    findCreator (params) {
      const isIncludes = Object.keys(this.userList).includes(params);
      if (!isIncludes) return '';
      return this.userList[params].userName;
    },
    // 排序处理
    getSortInfoAndFetch (Info) {
      this.filterData.upDown = Info[0];
      this.filterData.orderBy = Info[1];
      this.refreshList({ pageNumber: 1 });
    }
  }
};
</script>
<style scoped lang="less">
.attribute-detail-list {
  .attribute-filter {
    display: inline-block;
    width: 100%;
    vertical-align: top;
  }
  .filter-btn {
    display: inline-block;
    vertical-align: top;
    .filter-btn-item {
      margin-left: 10px;
    }
  }
  :deep(.ivu-table-cell) {
    .table-td-class {
      .ivu-btn{
        margin-right: 5px;
        &:last-child{
          margin-right: 0;
        }
      }
    }
  }
  .operate-content{
    display: flex;
    justify-content: space-between;
    .operate-left{
      flex: 100;
      padding-right: 10px;
    }
    .operate-right{
      flex: 100;
      padding-left: 10px;
      padding-right: 20px;
      text-align: right;
    }
  }
}
</style>
