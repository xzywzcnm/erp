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
        :label-width="90"
      >
        <dyt-filter>
          <Form-item label="二次工艺名称" prop="secondaryProcessName">
            <dyt-input placeholder="请输入二次工艺名称" v-model.trim="filterData.secondaryProcessName" />
          </Form-item>
          <Form-item label="二次工艺类型" prop="secondaryProcessTypeList">
            <dytSelect v-model="filterData.secondaryProcessTypeList" :multiple="true" :max-tag-count="1">
              <Option v-for="(item, index) in Object.values(craftType)" :value="item.value" :key="`c-${index}`">{{ item.label }}</Option>
            </dytSelect>
          </Form-item>
          <Form-item label="首选供应商" prop="supplierIdList">
            <dytSelect v-model="filterData.supplierIdList" :multiple="true" :max-tag-count="1">
              <Option
                v-for="(item, index) in supplyList"
                :key="`supply-${index}`"
                :value="item.supplierId"
              >{{ item.supplierName }}</Option>
            </dytSelect>
          </Form-item>
          <Form-item label="创建人" prop="userIdList">
            <dytSelect v-model="filterData.userIdList" :multiple="true" :max-tag-count="1">
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
        :span-method="handleSpan"
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
    <twiceCraftEditModal
      :modelVisible.sync="pushAndEditVisible"
      :modalData="modalData"
      :modalType="modalType"
      :supply-list="supplyList"
      @saveAfter="getList"
    />
    <Modal v-model="importModalVisible" :mask-closable="false" title="导入二次工艺" width="800">
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
          <!-- <FormItem label="导入模板发现相同二次工艺名称时:" :label-width="200">
            <RadioGroup v-model="formData.importStrategy">
              <Radio label="0">覆盖</Radio>
              <Radio label="1">忽略</Radio>
            </RadioGroup>
          </FormItem> -->
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
import twiceCraftEditModal from './twiceCraftEditModal';
import tableMixin from '@/components/mixin/table_mixin';
import { twiceCraftType } from '@/utils/pdsSettingConstant';

export default {
  mixins: [Mixin, tableMixin],
  components: {
    twiceCraftEditModal
  },
  props: {},
  data () {
    return {
      // 搜索栏表单数据
      filterData: {
        secondaryProcessName: '',
        secondaryProcessTypeList: [],
        supplierIdList: [],
        userIdList: [],
        createTimeStart: null,
        createTimeEnd: null,
      },
      supplyList: [],
      ruleValidate: {},
      userDataList: {},
      formData: {
        file: {},
        // importStrategy: '0'
      },
      uploadFilesUrl: api.importTwiceCraftList,
      fileAccept: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ],
      importModalVisible: false,
      importLoading: false,
      craftType: twiceCraftType,
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
          title: '二次工艺名称',
          key: 'secondaryProcessName',
          minWidth: 120,
          align: 'center'
        },
        {
          title: '二次工艺类型',
          key: 'secondaryProcessType',
          align: 'center',
          width: 120,
          render: (h, {row }) => {
            if (this.$common.isEmpty(row.secondaryProcessType) || this.$common.isEmpty(this.craftType[row.secondaryProcessType])) return h('span', '');
            return h('span', {}, this.craftType[row.secondaryProcessType].label);
          }
        },
        {
          title: '供应商优先级',
          key: 'supplierSort',
          width: 140,
          align: 'center',
          render: (h, {row, index }) => {
            if (this.$common.isEmpty(row.rowspan) || this.$common.isEmpty(row.supplierSort)) return h('div', {}, '首选供应商');
            let item = [];
            if (row.supplierSort == 0 || row.firstChoice) {
              item.push(h('span', {}, '首选供应商'));
              if (row.childNumber > 1) {
                item.push(h('Icon', {
                  props: {
                    type: 'md-arrow-down',
                    size: 18
                  },
                  style: {
                    'margin-left': '5px',
                    'cursor': 'pointer'
                  },
                  on: {
                    click: () => {
                      this.craftSort(row, index, 'down');
                    }
                  }
                }, ''));
              }
              return h('div', {}, item);
            }
            item.push(h('span', {}, '次选供应商'));
            item.push(h('Icon', {
              props: {
                type: 'md-arrow-up',
                size: 18
              },
              style: {
                'margin-left': '5px',
                'cursor': 'pointer'
              },
              on: {
                click: () => {
                  this.craftSort(row, index, 'up');
                }
              }
            }, ''));
            if (!row.isLastChild) {
              item.push(h('Icon', {
                props: {
                  type: 'md-arrow-down',
                  size: 18
                },
                style: {
                  'margin-left': '5px',
                  'cursor': 'pointer'
                },
                on: {
                  click: () => {
                    this.craftSort(row, index, 'down');
                  }
                }
              }, ''));
            }
            return h('div', {}, item);
          }
        },
        {
          title: '供应商名称',
          key: 'supplierName',
          minWidth: 120,
          align: 'center'
        },
        {
          title: '二次工艺价格',
          key: 'price',
          width: 120,
          align: 'center',
          render: (h, { row }) => {
            const price = Number(row.price);
            if (this.$common.isEmpty(price)) return h('span', row.price);
            return h('span', price.toFixed(2));
          }
        },
        {
          title: '创建信息',
          key: 'createdTime',
          width: 190,
          align: 'left',
          render: (h, { row }) => {
            const userInfo = this.userDataList[row.createdBy] || {};
            const rowTime = this.$common.toLocaleDate(row.createdTime || '', 'fulltime', 0);
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
            const rowTime = this.$common.toLocaleDate(row.updatedTime, 'fulltime', 0);
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
    this.$common.promiseAll([
      this.getUserMesCommon,
      this.getSupplierList
    ]).then((resArr) => {
      const result = resArr[0] || {};
      this.userDataList = this.$common.copy(result.data || {});
    }).finally(() => {
      this.$nextTick(() => {
        this.getList();
      })
    })
  },
  computed: {
    // 权限
    permission () {
      return {
        query: this.getPermission('secondaryProcessManage_query'),
        add: this.getPermission('secondaryProcessManage_insert'),
        edit: this.getPermission('secondaryProcessManage_edit'),
        delete: this.getPermission('secondaryProcessManage_delete'),
        export: this.getPermission('secondaryProcessManage_export'),
        import: this.getPermission('secondaryProcessManage_import'),
        sort: this.getPermission('secondaryProcessManage_sort'),
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
      paramsData.createTimeStart = null;
      paramsData.createTimeEnd = null;
      if (!this.$common.isEmpty(paramsData.createdTime) && !this.$common.isEmpty(paramsData.createdTime[0])) {
        // paramsData.createTimeStart = this.$common.toISODate(paramsData.createdTime[0], 'fulltime');
        paramsData.createTimeStart = this.$common.getDateTime(paramsData.createdTime[0], 'fulltime', 0);
        paramsData.createTimeEnd = this.$common.getDateTime(paramsData.createdTime[1], 'fulltime', 0);
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
      this.tableData = [];
      this.checkTableData = [];
      this.tableLoading = true;
      this.axios.post(api.queryTwiceCraftList, this.getParamsData()).then(res => {
        this.tableLoading = false;
        if (res.code === 0 && res.datas && res.datas.list) {
          this.total = res.datas.total;
          let datasList = [];
          let itemInfo = {};
          res.datas.list.forEach(item => {
            if (this.$common.isEmpty(item.secondaryProcessListDetailVOList)) return;
            itemInfo = this.$common.copy(item);
            delete itemInfo.secondaryProcessListDetailVOList;
            item.secondaryProcessListDetailVOList.sort((maxVal, minAal) => {
              return maxVal.supplierSort - minAal.supplierSort
            });
            datasList = [...datasList, ...item.secondaryProcessListDetailVOList.map((row, index) => {
              return {
                ...itemInfo,
                ...row,
                rowspan: index == 0 ? item.secondaryProcessListDetailVOList.length : 0,
                colspan: index == 0 ? 1 : 0,
                childNumber: item.secondaryProcessListDetailVOList.length,
                firstChoice: row.supplierSort == 0 || index == 0,
                isLastChild: item.secondaryProcessListDetailVOList.length == (index + 1)
              }
            })];
          });
          // console.log(datasList);
          this.tableData = datasList;
        }
      }).catch(() => {
        this.tableLoading = false;
      });
    },
    // 合并行列处理
    handleSpan ({ row, column, rowIndex, columnIndex }) {
      if (column.key == 'selection' || column.key == 'secondaryProcessName') {
        return {
          rowspan: row.rowspan,
          colspan: row.colspan
        }
      }
    },
    // 获取供应商列表
    getSupplierList() {
      return new Promise((resolve) => {
        this.supplyList = [];
        this.$axios.get(api.queryAllSupplierInfo).then((res) => {
          if (res.code === 0) {
            this.supplyList = res.datas || [];
          }
          resolve(this.supplyList);
        }).catch(() => {
          resolve([]);
        });
      })
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
        content: `是否确认删除二次工艺：${row.secondaryProcessName}?`,
        onOk: () => {
          this.axios.get(api.deleteTwiceCraftList, {
            params: {
              secondaryProcessId: row.secondaryProcessId
            }
          }).then(res => {
            if (res.code != 0) return;
            this.$Message.success('操作成功');
            this.$nextTick(() => {
              this.getList();
            })
          })
        }
      })
    },
    // 排序
    craftSort (row, index, type) {
      let param = [];
      let targetIndex = index - 1;
      if (type == 'down') {
        targetIndex = index + 1;
      }
      const targetRow = this.tableData[targetIndex];
      param.push({
        secondaryProcessId: targetRow.secondaryProcessId,
        supplierSort: row.supplierSort
      });
      param.push({
        secondaryProcessId: row.secondaryProcessId,
        supplierSort: targetRow.supplierSort
      });
      this.axios.post(api.sortTwiceCraftList, param).then((data) => {
        if (data.code !== 0) return;
        this.$Message.success('操作成功!');
        this.$nextTick(() => {
          this.getList();
        })
      })
    },
    // 刷新列表
    refreshList (config) {
      if (config && config.pageNumber) {
        this.pageParams.pageNum = config.pageNumber;
      }
      this.$nextTick(() => {
        this.getList();
      })
    },
    // 重置搜索条件
    resetFilter () {
      this.$refs.filterRefsDome.resetFields()
    },
    // 选中数据改变
    selectionDataChange (val) {
      this.checkTableData = val;
    },
    // 导出
    exportExcel(str) {
      if (this.$common.isEmpty(str)) return;
      let temp = {};
      if (str == 'check') {
        if (this.$common.isEmpty(this.checkTableData)) return this.$Message.error('请选择需要导出的数据!');
        temp.secondaryProcessIdList = this.checkTableData.map(k => k.secondaryProcessId);
      } else if (str == 'all') {
        temp = this.getParamsData();
        delete temp.pageNum;
        delete temp.pageSize;
      }
      this.axios.post(api.exportTwiceCraftList, temp).then((data) => {
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
      window.open('./filenode/s/pds-service/template/secondaryProcessImportTemplate.xlsx');
    },
    // 打开导入弹窗
    openImportModal () {
      this.formData = {
        file: {},
        // importStrategy: '0'
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
      // newForm.append('importStrategy', this.formData.importStrategy);
      this.axios.post(this.uploadFilesUrl, newForm).then(res => {
        if (res.code != 0) return;
        this.$Message.success('导入成功！');
        this.importModalVisible = false;
        this.$nextTick(() => {
          this.getList();
        })
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
