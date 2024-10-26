<template>
  <div class="attribute-detail-list">
    <!-- 筛选条件区 -->
    <div class="platformParamsSelect">
      <Form class="attribute-filter" ref="filterRefsDome" :model="filterData" :rules="filterRule" :label-width="100" inline>
        <dyt-filter :filter-row="1">
          <FormItem label="质检模板名称" prop="qualityClassification">
            <Input v-model="filterData.qualityClassification" placeholder="请输入质检模板名称" clearable maxlength="150" />
          </FormItem>
          <FormItem label="质检项目" prop="qualityProject">
            <Input v-model="filterData.qualityProject" placeholder="请输入质检项目" clearable maxlength="150" />
          </FormItem>
          <FormItem label="模板类型" prop="templateTypeList">
            <dyt-select v-model="filterData.templateTypeList" filterable multiple   placeholder="选择模板类型">
                <Option v-for="(item,index) in templateTypeArr" :value="item.value" :key="index">{{ item.label }}</Option>
              </dyt-select>
          </FormItem>
          <div class="filter-btn" slot="operation">
            <Button type="primary" class="filter-btn-item" @click="refreshList({pageNumber: 1})" icon="md-search">查询</Button>
            <Button class="filter-btn-item" @click="resetFilter" icon="md-refresh">重置</Button>
          </div>
        </dyt-filter>
      </Form>
    </div>
    <!--操作区-->
    <div class="addBrand">
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
    <!--列表-->
    <div class="orderTable normalTop">
      <Table highlight-row :loading="tableLoading" border :height="tableHeight" :columns="qualityColumn" :data="qualityData" />
      <div class="table-page">
        <div class="table-page-right">
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="pageParams.pageNum" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray" />
        </div>
      </div>
    </div>
    <!-- 新增(编辑)属性 -->
    <!-- <div v-if="showAttribute">
      <attributeEdit
        :module-data.sync="rowDetailes"
        :modal-visual.sync="showAttribute"
        :modal-type.sync="modalType"
        :refresh.sync="isRefresh"
      />
    </div> -->

    <!--新增(编辑、查看)质检项目-->
    <Modal v-model="editForm.isShowEditDialog" :title="modelTitle" :width="800" :closable='false' transfer :mask-closable="['detail'].includes(modalType)">
      <div style="padding:0px 0px 0px 20px" v-if="modalType == 'add'">
        <p style="font-size: 12px">提示：1、质检模板用于关联商品分类，指商品分类包含的检测项目，例如测量衣长、肩宽。</p>
        <p style="font-size: 12px; padding:0px 0px 0px 36px ">2、质检项目在【质检项目管理】页面设置。</p>
      </div>
      <div class="normalTop">
        <Form :label-width="100" ref="editForm" :rules="editForm.ruleValidate" :model="editForm.formValidate" :disabled='searchDetail'>
          <div>
            <FormItem label="质检模板" prop="qualityClassification">
              <Input placeholder="请输入质检模板名称" v-model="editForm.formValidate.qualityClassification"></Input>
            </FormItem>
          </div>
          <div class="normalTop">
            <FormItem label="模板类型" prop="templateType">
              <dyt-select v-model="editForm.formValidate.templateType" filterable   placeholder="选择模板类型">
                <Option v-for="(item,index) in templateTypeArr" :value="item.value" :key="index">{{ item.label }}</Option>
              </dyt-select>
            </FormItem>
          </div>
          <div class="normalTop">
            <FormItem label="选择质检项目" prop="qualityProjectId">
              <dyt-select v-model="editForm.formValidate.qualityProjectId" filterable multiple @on-change='selectProject' placeholder="选择选择质检项目">
                <Option v-for="item in qualityDataList" :value="item.qualityProjectId" :key="item.qualityProjectId">{{ item.qualityProject }}</Option>
              </dyt-select>
            </FormItem>
          </div>
        </Form>
        <!-- 质检项目的说明 -->
        <Table class="modal-table" border :columns="editColumns" :data="projectTableList" height='300'></Table>
        <div style="padding-right: 20px; text-align: right;">质检价格合计：{{ editModalTotal.toFixed(2) }}</div>
      </div>
      <div slot="footer" style="text-align: right;">
        <Button type="primary" @click="addOrEditList(modalType)" v-if="!searchDetail">保存 </Button>
        <Button @click="closeDialog">关闭</Button>
      </div>
    </Modal>
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
    // var self = this;
    return {
      filterData: {
        qualityProject: null,
        qualityClassification: null,
        templateTypeList: []
      }, // 搜索栏表单数据
      filterRule: {}, // 搜索栏表单规则
      isRefresh: false,
      rowDetailes: {},
      modalType: 'detail',
      showAttribute: false,
      pageArray: [10, 20, 50, 100, 500],
      total: 0, // 总记录数
      pageParamsStatus: false, // 是否重新加载列表数据
      pageParams: { // 映射列表筛选参数
        pageNum: 1,

        pageSize: 20
      },
      qualityData: [], // 列表数据
      qualityDataList: [], // 质检项目
      templateTypeArr: [
        { label: '常规', value: 0 },
        { label: 'Temu', value: 1 },
        { label: 'Shein', value: 2 },
        { label: 'Tiktok', value: 3 },
        { label: 'Otto', value: 4 },
      ],
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
          title: '质检模板',
          key: 'qualityClassification',
          width: 150,
          align: 'center',
          render: (h, params) => {
            return h('div', `${params.row.qualityClassification}`);
          }
        },
        {
          title: '模板类型',
          key: 'templateType',
          width: 120,
          align: 'center',
          render: (h, params) => {
            let typeMap = {
              0: { text: '常规', color: 'green' },
              1: { text: 'Temu', color: 'red' },
              2: { text: 'Shein', color: 'purple' },
              3: { text: 'Tiktok', color: 'orange' },
              4: { text: 'Otto', color: 'blue' },
            }
            return h('Tag', {
              props: {
                color: typeMap[params.row.templateType].color
              }
            }, typeMap[params.row.templateType].text);
          }
        },
        {
          title: '关联质检项目',
          key: 'qualityProject',
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            return h('span', `${params.row.qualityProject}`);
          }
        },
        {
          title: '创建人',
          key: 'createdBy',
          align: 'center',
          width: 150,
          render: (h, params) => {
            return h('span', `${params.row.createdBy || ''}`);
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
          title: '合计价格',
          key: 'priceTotal',
          align: 'center',
          width: 150,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.priceTotal) || row.priceTotal <= 0) return h('span', '');
            return h('span', row.priceTotal.toFixed(2));
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
                  marginRight: '10px',
                  display: `${this.permission.delete ? 'inline-block' : 'none'}`
                },
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.addEditAttribute(params.row, 'detail');
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
      ],
      editForm: {
        isShowEditDialog: false,
        formValidate: {
          qualityClassification: '',
          qualityProjectId: [],
          qualityClassificationId: '',
          templateType: null
        },
        ruleValidate: {
          qualityClassification: [
            { required: true, message: '质检模板不能为空', trigger: 'blur' }
          ],
          qualityProjectId: [
            { type: 'array', required: true, message: '质检项目不能为空', trigger: 'blur' }
          ],
          templateType: [
            { required: true, type: 'number', message: '模板类型不能为空', trigger: 'blur' }
          ]
        }
      },
      searchDetail: false,
      editColumns: [
        {
          title: '质检项目',
          key: 'qualityProject',
          width: 200,
          render: (h, { row }) => {
            if (this.priceDisabled(row.price)) {
              return h('span', {
                style: {
                  color: '#f20'
                }
              }, row.qualityProject || '')
            }
            return h('span', {}, row.qualityProject || '');
          }
        },
        {
          title: '质检内容描述',
          key: 'qualityDescription',
          minWidth: 200,
          render: (h, { row }) => {
            if (this.priceDisabled(row.price)) {
              return h('span', {
                style: {
                  color: '#f20'
                }
              }, row.qualityDescription || '')
            }
            return h('span', {}, row.qualityDescription || '');
          }
        },
        {
          title: '价格',
          key: 'price',
          width: 120,
          render: (h, { row }) => {
            if (this.priceDisabled(row.price)) {
              return h('Poptip', {
                props: {
                  placement: 'right',
                  trigger: 'hover',
                  transfer: true
                }
              }, [
                h('div', {
                  style: {
                    color: '#f20'
                  }
                }, '不可用'),
                h('div', {
                  slot: 'content',
                  props: {},
                  attrs: {},
                }, '质检价格为空，不可用，请先完善价格信息')
              ]);
            }
            return h('span', row.price);
          }
        }
      ],
      projectTableList: [],
      editModalTotal: 0,
      userList: {}
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
    'editForm.isShowAddDialog' (newValue, oldValue) {
      !newValue && this.resetForm()
    }
  },
  created () {
    this.tableHeight = this.getTableHeight(265);
    this.$nextTick(() => {
      this.pageParamsStatus = true
    })
  },
  computed: {
    modelTitle () {
      const typeJson = {
        add: '添加质检模块',
        edit: '编辑质检模块',
        detail: '查看质检模块'
      };
      return typeJson[this.modalType];
    },
    // 权限
    permission () {
      return {
        query: this.getPermission('productCenter_QualityClassification_query'),
        delete: this.getPermission('productCenter_QualityClassification_delete'),
        edit: this.getPermission('productCenter_QualityClassification_update'),
        insert: this.getPermission('productCenter_QualityClassification_save')
      }
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
      this.getAllUser().then(res => {
        this.axios.post(api.queryClassifyList, { ...item, ...this.filterData }).then(res => {
          this.pageParamsStatus = false;
          this.loadingFalse();
          if (res.data.code === 0 && res.data.datas && res.data.datas.list) {
            // 对分类id相同的数据作处理
            this.qualityData = JSON.parse(JSON.stringify(res.data.datas.list));
            let qualityProject = [];
            let priceTotal = 0;
            this.qualityData.forEach(item => {
              item.createdBy = this.$common.isEmpty(item.createdBy) ? '系统操作' : this.findCreator(item.createdBy);
              qualityProject = [];
              priceTotal = 0;
              if (!this.$common.isEmpty(item.productQualityProjectList)) {
                item.productQualityProjectList.forEach(item => {
                  if (!this.$common.isEmpty(item.qualityProject)) {
                    qualityProject.push(item.qualityProject);
                  }
                  if (!this.$common.isEmpty(item.price) && !this.$common.isEmpty(Number(item.price))) {
                    priceTotal += Number(item.price);
                  }
                })
              }
              item.qualityProject = qualityProject.join(',');
              item.priceTotal = priceTotal;
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
        content: '操作存在风险，是否确认操作?',
        onOk: () => {
          this.del(delRow)
        }
      })
    },
    del (row) { // 删除
      const v = {
        hand: () => {
          this.axios.post(api.deleteClassifyList, { qualityClassificationId: row.qualityClassificationId }
          ).then(res => {
            if (res.data.code == 0) {
              this.$Message.success('操作成功');
              this.pageParams.pageNum = 1;
              this.pageParamsStatus = true;
            } else if ([1, '1'].includes(res.data.code)) {
              this.$Message.error('已绑定商品分类不允许删除')
            } else if (res.data.code == 800000) {
              // this.$Message.error(res.data.message);
            } else {
              this.$Message.error('操作失败')
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
    addEditAttribute (row = {}, type = 'detail') {
      this.$refs.editForm && this.$refs.editForm.resetFields();
      this.searchDetail = ['detail'].includes(type);
      this.modalType = type;
      this.rowDetailes = row;
      this.projectTableList = [];
      const temp = {
        productQualityProjectIdList: [],
        status: 1
      }
      this.axios.post(api.queryProductQualityProjectListById, temp).then(res => {
        if (res.data && res.data.code === 0) {
          this.qualityDataList = res.data.datas;
        }
        this.formDataHand(row);
      }).catch(() => {
        this.formDataHand(row);
      })
    },
    formDataHand (row) {
      this.editForm.formValidate.qualityClassification = row.qualityClassification || '' // 质检模板名称
      this.editForm.formValidate.qualityClassificationId = row.qualityClassificationId || '' // 质检模板id
      this.editForm.formValidate.templateType = row.templateType // 模板类型
      if (row.productQualityProjectList == null) {
        this.editForm.formValidate.qualityProjectId = null
      } else {
        this.editForm.formValidate.qualityProjectId = row.productQualityProjectList.map(item => {
          return item.qualityProjectId
        })
      }
      this.$nextTick(() => {
        this.editForm.isShowEditDialog = true;
      })
    },
    // 新增(编辑)质检模块
    addOrEditList (param) {
      this.$refs.editForm.validate((valid) => {
        if (!valid) return;
        const temp = this.editForm.formValidate.qualityProjectId.map(item => {
          let backVal = {
            qualityClassification: this.editForm.formValidate.qualityClassification.trim(),
            qualityProjectId: item,
            templateType: this.editForm.formValidate.templateType
          }
          if (param === 'edit') {
            backVal['qualityClassificationId'] = this.editForm.formValidate.qualityClassificationId;
          }
          return backVal;
        })
        this.axios.post(api[param === 'edit' ? 'editClassifyList' : 'addClassifyList'], temp).then(res => {
          if ([500002, 1].includes(res.data.code)) {
            this.$Message.error('该质检模板名称已存在，请修改质检模板名称')
            return
          }
          if (res.data.code === 0) {
            this.editForm.isShowEditDialog = false
            this.$Message.success('操作成功');
            this.resetForm()
            this.getList()
          } else {
            this.$Message.error('操作失败')
          }
        })
      })
    },
    closeDialog () {
      this.editForm.isShowEditDialog = false
      this.searchDetail = false;
      this.$nextTick(() => {
        this.resetForm()
      })
    },
    // 重置表单
    resetForm () {
      this.editForm.formValidate.qualityClassification = '';
      this.editForm.formValidate.qualityClassificationId = '';
      this.editForm.formValidate.qualityProjectId = [];
      this.editForm.formValidate.templateType = null;
    },
    // 值改变
    selectProject (value) {
      let priceTotal = 0;
      this.projectTableList = this.qualityDataList.filter((item) => {
        return value.includes(item.qualityProjectId)
      })
      this.projectTableList.forEach(row => {
        if (!this.priceDisabled(row.price)) {
          priceTotal += row.price;
        }
      })
      this.editModalTotal = priceTotal;
    },
    priceDisabled (price) {
      return (this.$common.isEmpty(price) || price < 0);
    },
    findCreator (params) {
      const isIncludes = Object.keys(this.userList).includes(params);
      if (!isIncludes) return '';
      return this.userList[params].userName;
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
}
.modal-table{
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
}
</style>
