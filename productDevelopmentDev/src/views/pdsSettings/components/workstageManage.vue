<template >
  <div class="mainBox workstage-manage-main-box">
    <!--筛选条件-->
    <Card shadow class="card-self-style">
      <div class="list-page">
        <Form ref="searchCriteria" :model="searchCriteria" :label-width="80" class="page-filter-content">
          <dyt-filter>
            <Form-item label="工序描述">
              <dyt-input placeholder="请输入，支持模糊查询" v-model.trim="searchCriteria.description"></dyt-input>
            </Form-item>
            <Form-item label="创建人" prop="createdByList">
              <dytSelect v-model="searchCriteria.createdByList" :multiple="true" :max-tag-count="1">
                <Option
                  v-for="item in Object.values(userDataList)"
                  :key="`supp-${item.userId}`"
                  :value="item.userId"
                >{{ item.userName }}</Option>
              </dytSelect>
            </Form-item>
            <FormItem label="创建时间" prop="createdTime" style="min-width: 360px">
              <DatePicker
                style="width: 100%;"
                type="datetimerange"
                placement="bottom-end"
                placeholder="选择日期"
                split-panels
                v-model="searchCriteria.createdTime"
                :options="dateOptions"
                transfer
              >
              </DatePicker>
            </FormItem>
            <div slot="operation">
              <Button type="primary" @click="getTablData" icon="md-search" :disabled="tableLoading">查询</Button>
              <Button @click="reset" class="ml10" icon="md-refresh">重置</Button>
            </div>
          </dyt-filter>
        </Form>
        <div class="operaBtn">
          <Button type="primary" icon="md-add" @click="openModal" v-if="permission.add">新增</Button>
          <Button type="primary" class="ml10" @click="openImportModal" v-if="permission.import">导入</Button>
          <Dropdown class="ml10" v-if="permission.export">
            <Button type="primary">导出<Icon type="ios-arrow-down"></Icon></Button>
            <DropdownMenu slot="list">
              <DropdownItem @click.native="exportExcel('check')">导出选中</DropdownItem>
              <DropdownItem @click.native="exportExcel('all')">导出所有结果集</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <!-- 列表-->
        <div class="table-main mt10">
          <div :class="['table-list', tableClass]">
            <Table ref="selection" highlight-row :loading="tableLoading" border :columns="column" :data="tableList" :height="tableHeight" @on-selection-change="selectChange">
            </Table>
          </div>
          <page-common :pageConfig="proPage" @ChangePage="ChangePage" @ChangePageSize="ChangePageSize"></page-common>
        </div>
      </div>

      <Modal v-model="productInfo.dialogVisible" width="500" title="新增工序" :mask-closable="false" :closable="false">
        <Form ref="productInfo" :model="productInfo.formValidate" :rules="productInfo.ruleValidate" :label-width="60">
          <FormItem label="描述:" prop="description">
            <Input v-model="productInfo.formValidate.description" placeholder="请输入" maxlength="100" show-word-limit
              type="textarea" />
          </FormItem>
          <FormItem label="价格:" prop="price">
            <Input v-model="productInfo.formValidate.price" placeholder="请输入" />
          </FormItem>
        </Form>
        <div slot="footer">
          <Button @click="productInfo.dialogVisible = false">取消</Button>
          <Button type="primary" @click="handleNext" :loading="productInfo.loading">保存</Button>
        </div>
      </Modal>
    </Card>
    <Modal v-model="importModalVisible" :mask-closable="false" title="导入工序" width="800">
      <div class="import-modal-body">
        <Form ref="formRefsDome" :model="formData" :rules="ruleValidate" :label-width="120">
          <FormItem label="选中导入文件:">
            <dytUpload
              ref="washedUploadRef"
              name="files"
              :show-upload-list="false"
              :multiple="true"
              :accept="fileAccept.join(',')"
              :before-upload="fileUploadBefore"
              :action="uploadFilesUrl"
              class="upload-item"
            >
              <Button>选择文件</Button>
            </dytUpload>
          </FormItem>
          <FormItem :label="`${$common.isEmpty(formData.file) ? '' : '上传文件:'}`">
            <div class="file-view-body">
              <span class="file-name-view">{{ formData.file.name || '' }}</span>
              <span class="template-download">
                <span class="template-text" @click="downloadTemplate">下载模板</span>
              </span>
            </div>
          </FormItem>
          <FormItem label="导入模板发现相同工序描述时:" :label-width="180">
            <RadioGroup v-model="formData.importStrategy">
              <Radio label="0">覆盖</Radio>
              <Radio label="1">忽略</Radio>
            </RadioGroup>
          </FormItem>
        </Form>
        <Spin v-if="importLoading" fix></Spin>
      </div>
      <div slot="footer">
        <Button @click="importModalVisible = false">取 消</Button>
        <Button type="primary" @click="importExcel" :disabled="importLoading">确 定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import regular from "@/utils/regular";
import pageMixin from "@/components/mixin/page_mixin";
import table_highly_adaptive from "@/components/mixin/table_highly_adaptive";
export default {
  name: 'exportTask',
  mixins: [pageMixin, table_highly_adaptive],
  data() {
    let v = this;
    return {
      searchCriteria: {
        description: null,
        pageSize: 50,
        pageNum: 1,
        supplierId: [],
        createdTime: [],
        createdByList: []
      },
      ruleValidate: {},
      userDataList: {},
      formData: {
        file: {},
        importStrategy: '0'
      },
      uploadFilesUrl: api.importProcess,
      fileAccept: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ],
      importModalVisible: false,
      importLoading: false,
      column: [
        {
          type: 'selection',
          width: 60,
          key: 'selection',
          align: 'center',
        },
        {
          title: '工序描述',
          minWidth: 190,
          key: 'description',
          align: 'center',
        },
        {
          title: '工序价格',
          key: 'price',
          align: 'center',
          width: 120,
        },
        {
          title: '创建信息',
          key: 'createdTime',
          width: 190,
          align: 'left',
          render: (h, { row }) => {
            const userInfo = this.userDataList[row.createdBy] || {};
            const rowTime = this.$common.toLocaleDate(row.createdTime, 'fulltime');
            return h('div', {}, [
              h('div', {}, `创建人：${userInfo.userName || ''}`),
              h('div', {}, `创建时间：${rowTime}`)
            ])
          }
        },
        {
          title: '最后更新信息',
          key: 'updatedTime',
          width: 210,
          align: 'left',
          render: (h, { row }) => {
            const userInfo = this.userDataList[row.updatedBy] || {};
            const rowTime = this.$common.toLocaleDate(row.updatedTime, 'fulltime');
            return h('div', {}, [
              h('div', {}, `最后更新人：${userInfo.userName || ''}`),
              h('div', {}, `最后更新时间：${rowTime}`)
            ])
          }
        },
        {
          title: '操作',
          width: 100,
          fixed: 'right',
          align: 'center',
          render: (h, params) => {
            let item = [];
            this.permission.edit && item.push(h('div', {
              style: {
                color: '#3E98A1',
                cursor: 'pointer',
                display: 'inline-block',
                marginRight: '10px'
              },
              on: {
                click: () => {
                  v.openModal(params.row);
                }
              }
            }, '编辑'));
            this.permission.delete && item.push(h('div', {
              style: {
                color: '#ed4014',
                cursor: 'pointer',
                display: 'inline-block',
              },
              on: {
                click: () => {
                  v.delOperater(params.row);
                }
              }
            }, '删除'));
            return h('div', item);
          }
        }
      ],
      productInfo: {
        dialogVisible: false,
        formValidate: { description: '', price: '', processId: '' },
        ruleValidate: {
          description: [{ required: true, message: '请输入', trigger: 'blur' }],
          price: [
            { required: true, message: '请输入', trigger: 'blur' },
            { pattern: regular.validateGreater, message: "请输入正数，最多2位小数", trigger: "blur" },
          ],
        },
        loading: false,
      },
    };
  },
  computed: {
    // 权限
    permission () {
      return {
        query: this.getPermission('pdsBase_workstageManage_query'),
        add: this.getPermission('pdsBase_workstageManage_add'),
        edit: this.getPermission('pdsBase_workstageManage_edit'),
        delete: this.getPermission('pdsBase_workstageManage_delete'),
        export: this.getPermission('pdsBase_workstageManage_export'),
        import: this.getPermission('pdsBase_workstageManage_import'),
        
      }
    }
  },
  created() {},
  mounted () {
    // 获取创建人列表
    this.getUserMesCommon().then((result) => {
      this.userDataList = this.$common.copy(result.data || {});
      this.$nextTick(() => {
        this.permission.query && this.fetch(api.queryProductProcessList, "post");
      })
    });
  },
  methods: {
    getTablData () {
      if (!this.permission.query) {
        return this.$Message.error('暂无查询权限!');
      }
      if (this.tableLoading) return;
      this.search();
    },
    openModal(row = {}) {
      this.productInfo.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs['productInfo'].resetFields();
        Object.keys(this.productInfo.formValidate).forEach(key => {
          this.productInfo.formValidate[key] = row[key] ? String(row[key]) : '';
        })
      })
    },
    delOperater(row) {
      this.$Modal.confirm({
        title: '操作',
        content: '<p>确认删除该工序？</p>',
        loading: true,
        onOk: () => {
          this.axios.post(api.deleteProductProcess, { processId: row.processId }).then((data) => {
            if (data.code == 0) {
              this.$Message.success('操作成功!');
              this.getTablData();
            }
          }).finally(() => {
            this.$Modal.remove();
          });
        }
      });
    },
    handleNext() {
      this.$refs['productInfo'].validate((valid) => {
        if (valid) {
          let formValidate = this.productInfo.formValidate;
          let temp = this.$common.removeEmpty(formValidate);
          const rqApi = formValidate.processId ? 'updateProductProcess' : 'saveProductProcess';
          this.productInfo.loading = true;
          this.axios.post(api[rqApi], temp).then((data) => {
            if (data.code == 0) {
              this.productInfo.dialogVisible = false;
              this.$Message.success('操作成功!');
              this.getTablData();
            }
          }).finally(() => {
            this.productInfo.loading = false;
          });
        }
      })
    },
    getParamsData () {
      let paramsData = this.$common.copy(this.searchCriteria);
      paramsData.pageNum = this.searchCriteria.pageNum;
      paramsData.pageSize = this.searchCriteria.pageSize;
      paramsData.createdStartTime = null;
      paramsData.createdEndTime = null;
      if (!this.$common.isEmpty(paramsData.createdTime) && !this.$common.isEmpty(paramsData.createdTime[0])) {
        paramsData.createdStartTime = this.$common.toISODate(paramsData.createdTime[0], 'fulltime');
        paramsData.createdEndTime = this.$common.toISODate(paramsData.createdTime[1], 'fulltime');
      }
      delete paramsData.createdTime;
      return paramsData;
    },
    exportExcel(str) {
      if (this.$common.isEmpty(str)) return;
      let temp = {};
      if (str == 'check') {
        if (this.$common.isEmpty(this.columnList)) return this.$Message.error('请选择需要导出的数据!');
        temp.processIds = this.columnList.map(k => k.processId);
      } else if (str == 'all') {
        temp = this.getParamsData();
        delete temp.pageNum;
        delete temp.pageSize;
      }
      this.axios.post(api.exportProcess, temp).then((data) => {
        if (data.code == 0) {
          this.$Message.success('操作成功!');
        }
      }).finally(() => {
        this.$Modal.remove();
      });
    },
    // 需要上传的文件
    fileUploadBefore (file) {
      let fileType = file.type;
      if (this.$common.isEmpty(fileType)) {
        fileType = file.name.substring(file.name.lastIndexOf('.'), file.name.length);
      }
      fileType = this.fileAccept.find(type => {
        return type.toLocaleLowerCase() == fileType
      })
      if (this.$common.isEmpty(fileType)) {
        this.$Message.error('文件格式不对，请上传格式为 pdf、excel、prj 的文件');
        return false;
      }
      // 最大为 30 M
      // if (file.size > 1024 * 1024 * 30) {
      //   this.$Message.error('文件过大，请上传30M以内的文件');
      //   return false;
      // }
      this.$set(this.formData, 'file', file);
      return false;
    },
    // 下载模板
    downloadTemplate () {
      window.open('./filenode/s/pds-service/template/processImportTemplate.xlsx');
    },
    // 打开导入弹窗
    openImportModal () {
      this.formData = {
        file: {},
        importStrategy: '0'
      }
      this.$nextTick(() => {
        this.importModalVisible = true;
      })
    },
    // 导入
    importExcel () {
      this.importLoading = true;
      let newForm = new FormData(); // 创建form对象
      newForm.append('file', this.formData.file);
      newForm.append('importStrategy', this.formData.importStrategy);
      this.axios.post(this.uploadFilesUrl, newForm).then(res => {
        if (res.code != 0) return;
        this.$Message.success('导入成功！');
        this.importModalVisible = false;
      }).finally(() => {
        this.importLoading = false;
      })
    }
  },
};
</script>
<style lang="less" scoped>
.import-modal-body{
  position: relative;
  .file-view-body{
    display: flex;
    .file-name-view{
      display: block;
      max-width: calc(100% - 150px);
      padding-right: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .template-download{
      flex: 100;
      .template-text{
        display: inline-block;
        color: #2d8cf0;
        cursor: pointer;
      }
    }
  }
}
.workstage-manage-main-box{
  .page-filter-content{
    display:inline-block;
    vertical-align: top;
    width: 100%;
    :deep(.ivu-form-item){
      width: 25%;
      min-width: 200px;
      max-width: 400px;
    }
  }
}
</style>