<template>
  <div class="page-main-content">
    <!-- 筛选条件区 -->
    <div class="platformParamsSelect">
      <Form
        class="page-filter-content"
        label-position="right"
        ref="filterRefsDome"
        :model="filterData"
        :rules="filterRule"
        :label-width="80"
      >
        <dyt-filter>
          <Form-item label="工艺名称" prop="technologyName">
            <dyt-input placeholder="请输入工艺名称" v-model.trim="filterData.technologyName" />
          </Form-item>
          <Form-item label="工艺描述" prop="description">
            <dyt-input placeholder="请输入工艺描述" v-model.trim="filterData.description" />
          </Form-item>
          <Form-item label="工艺类型" prop="technologyType">
            <dytSelect v-model="filterData.technologyType" :multiple="true" :max-tag-count="1">
              <Option v-for="(item, index) in Object.values(craftType)" :value="item.value" :key="`c-${index}`">{{ item.label }}</Option>
            </dytSelect>
          </Form-item>
          <Form-item label="创建人" prop="createdByList">
            <dytSelect v-model="filterData.createdByList" :multiple="true" :max-tag-count="1">
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
              v-model="filterData.createdTime"
              :options="dateOptions"
              transfer
            >
            </DatePicker>
          </FormItem>
          <div slot="operation">
            <Button
              type="primary"
              @click="refreshList({pageNumber: 1})"
              icon="md-search"
              :disabled="tableLoading"
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
      <Button type="primary" icon="md-add" @click="pushAndEditRow({}, 'edit')" v-if="permission.add">新增</Button>
      <Button type="primary" class="ml10" @click="openImportModal" v-if="permission.import">导入</Button>
      <Dropdown class="ml10" v-if="permission.export">
        <Button type="primary">导出<Icon type="ios-arrow-down"></Icon></Button>
        <DropdownMenu slot="list">
          <DropdownItem @click.native="exportExcel('check')">导出选中</DropdownItem>
          <DropdownItem @click.native="exportExcel('all')">导出所有结果集</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
    <!--列表-->
    <div class="table-main-content normalTop">
      <Table
        highlight-row
        :loading="tableLoading"
        border
        :height="tableHeight"
        :columns="tableColumn"
        :data="tableData"
        @on-selection-change="selectionDataChange"
        ref="selection"
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
      <Spin fix v-if="tableLoading"></Spin>
    </div>
    <!-- 新增(编辑) -->
    <craftEditModal
      :modelVisible.sync="pushAndEditVisible"
      :modalData="modalData"
      :modalType="modalType"
      @saveAfter="getList"
    />
    <Modal v-model="importModalVisible" :mask-closable="false" title="导入工艺" width="800">
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
          <FormItem label="导入模板发现相同工艺名称时:" :label-width="180">
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
import Mixin from '@/components/mixin/commonMixin';
import craftEditModal from './craftEditModal';
import tableMixin from '@/components/mixin/table_mixin';
import { craftType } from '@/utils/pdsSettingConstant';

export default {
  mixins: [Mixin, tableMixin],
  components: {
    craftEditModal
  },
  props: {},
  data () {
    return {
      // 搜索栏表单数据
      filterData: {
        technologyName: null,
        description: null,
        technologyType: [],
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
      uploadFilesUrl: api.importTechnology,
      fileAccept: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ],
      importModalVisible: false,
      importLoading: false,
      craftType: craftType,
      checkTableData: [],
      filterRule: {}, // 搜索栏表单规则
      tableLoading: false,
      modalType: 'view',
      pushAndEditVisible: false,
      modalData: {},
      pageArray: [10, 20, 50, 100, 500],
      total: 0, // 总记录数
      pageParams: { // 映射列表筛选参数
        pageNum: 1,
        pageSize: 20
      },
      tableData: [], // 列表数据
      tableColumn: [ // 列表列定义
        {
          type: 'selection',
          width: 50,
          key: 'selection',
          align: 'center',
          // fixed: 'left'
        },
        {
          title: '工艺名称',
          key: 'technologyName',
          minWidth: 120,
          align: 'center'
        },
        {
          title: '工艺类型',
          key: 'technologyType',
          align: 'center',
          width: 100,
          render: (h, {row }) => {
            if (this.$common.isEmpty(row.technologyType) || this.$common.isEmpty(this.craftType[row.technologyType])) return h('span', '');
            return h('span', {}, this.craftType[row.technologyType].label);
          }
        },
        {
          title: '工艺描述',
          key: 'description',
          align: 'center',
          minWidth: 300
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
          width: 150,
          fixed: 'right',
          align: 'center',
          render: (h, { row }) => {
            let rowItem = [];
            this.permission.edit && rowItem.push(h('Button', {
              style: {},
              props: {
                size: 'small'
              },
              on: {
                click: () => {
                  this.pushAndEditRow(row, 'edit');
                }
              }
            }, '编辑'));
            this.permission.delete && rowItem.push(h('Button', {
              style: {
                'margin-left': '10px'
              },
              props: {
                size: 'small'
              },
              on: {
                click: () => {
                  this.delTableRow(row);
                }
              }
            }, '删除'));
            return h('div', {}, rowItem);
          }
        }
      ]
    };
  },
  watch: {},
  created () {
    this.tableHeight = this.getTableHeight(245);
    // 获取创建人列表
    this.getUserMesCommon().then((result) => {
      this.userDataList = this.$common.copy(result.data || {});
      this.$nextTick(() => {
        this.getList();
      })
    });
  },
  computed: {
    // 权限
    permission () {
      return {
        query: this.getPermission('pdsBase_craftManage_query'),
        add: this.getPermission('pdsBase_craftManage_add'),
        edit: this.getPermission('pdsBase_craftManage_edit'),
        delete: this.getPermission('pdsBase_craftManage_delete'),
        export: this.getPermission('pdsBase_craftManage_export'),
        import: this.getPermission('pdsBase_craftManage_import'),
        
      }
    },
    // 登录人事业部信息
    securityUser () {
      if (this.$store.getters["authUserInfo"] && this.$store.getters["authUserInfo"].securityUser) {
        return this.$store.getters["authUserInfo"].securityUser;
      }
      return {}
    }
  },
  methods: {
    getParamsData () {
      let paramsData = this.$common.copy(this.filterData);
      paramsData.pageNum = this.pageParams.pageNum;
      paramsData.pageSize = this.pageParams.pageSize;
      paramsData.createdStartTime = null;
      paramsData.createdEndTime = null;
      if (!this.$common.isEmpty(paramsData.createdTime) && !this.$common.isEmpty(paramsData.createdTime[0])) {
        paramsData.createdStartTime = this.$common.toISODate(paramsData.createdTime[0], 'fulltime');
        paramsData.createdEndTime = this.$common.toISODate(paramsData.createdTime[1], 'fulltime');
      }
      delete paramsData.createdTime;
      return paramsData;
    },
    // 查询列表数据
    getList () {
      if (!this.permission.query) {
        return this.$Message.error('暂无查询权限!');
      }
      if (this.tableLoading) return;
      this.checkTableData = [];
      this.tableLoading = true;
      this.axios.post(api.queryProductTechnologyList, this.getParamsData()).then(res => {
        this.tableLoading = false;
        if (res.code === 0 && res.datas && res.datas.list) {
          this.tableData = res.datas.list;
          this.total = res.datas.total;
        }
      }).catch(() => {
        this.tableLoading = false;
      });
    },
    // 新增(编辑)
    pushAndEditRow (row, type) {
      this.modalData = this.$common.copy(row);
      this.modalType = type;
      this.$nextTick(() => {
        this.pushAndEditVisible = true;
      })
    },
    // 删除确认
    delTableRow (row) {
      this.$Modal.confirm({
        title: '操作提示',
        content: `是否确认删除工艺：${row.technologyName}?`,
        onOk: () => {
          this.axios.post(api.deleteProductTechnology, { technologyId: row.technologyId }).then(res => {
            if (res.code == 0) {
              this.$Message.success('操作成功');
              this.getList();
            }
          })
        }
      })
    },
    // 刷新列表
    refreshList (config) {
      if (config && config.pageNumber) {
        this.pageParams.pageNum = config.pageNumber;
      }
      this.getList();
    },
    // 重置搜索条件
    resetFilter () {
      this.$refs.filterRefsDome.resetFields()
    },
    // 选中数据改变
    selectionDataChange (val) {
      this.checkTableData = val;
    },
    exportExcel(str) {
      if (this.$common.isEmpty(str)) return;
      let temp = {};
      if (str == 'check') {
        if (this.$common.isEmpty(this.checkTableData)) return this.$Message.error('请选择需要导出的数据!');
        temp.technologyIds = this.checkTableData.map(k => k.technologyId);
      } else if (str == 'all') {
        temp = this.getParamsData();
        delete temp.pageNum;
        delete temp.pageSize;
      }
      this.axios.post(api.exportTechnology, temp).then((data) => {
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
      window.open('./filenode/s/pds-service/template/technologyImportTemplate.xlsx');
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
  }
};
</script>
<style scoped lang="less">
.page-main-content{
  padding: 0 10px;
  .addBrand{
    padding-bottom: 10px;
  }
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
  .table-main-content{
    position: relative;
  }
  .table-page{
    margin: 0;
    padding: 10px;
    text-align: right;
    .table-page-right{
      display: inline-block;
      float: none;
      padding: 0;
    }
  }
}
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
</style>
