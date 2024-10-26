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
          <Form-item label="物料类型" prop="materialTypes">
            <dytSelect v-model="filterData.materialTypes" :multiple="true" :max-tag-count="1">
              <Option v-for="(item, index) in Object.values(materialTypeData)" :value="item.value" :key="`s-${index}`">{{ item.label }}</Option>
            </dytSelect>
          </Form-item>
          <Form-item label="物料名称" prop="materialNames">
            <dyt-input-tag type="textarea" :limit="1" :string="false" placeholder="请输入物料名称, 多个逗号或回车分隔" v-model="filterData.materialNames" />
          </Form-item>
          <Form-item label="物料编码" prop="materialCode">
            <dyt-input-tag type="textarea" :limit="1" :string="false" placeholder="请输入物料编码, 多个逗号或回车分隔" v-model="filterData.materialCode" />
          </Form-item>
          <Form-item label="启用状态" prop="enableStatus">
            <dytSelect v-model="filterData.enableStatus">
              <Option :value="0">停用</Option>
              <Option :value="1">启用</Option>
            </dytSelect>
          </Form-item>
          <Form-item label="首选供应商" prop="supplierId">
            <dytSelect v-model="filterData.supplierId" :multiple="true" :max-tag-count="1">
              <Option v-for="item in supplyList" :key="`supp-${item.supplierId}`" :value="item.supplierId" >{{ item.supplierName }}</Option>
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
      <Button type="primary" icon="md-add" @click="pushMaterial({}, 'edit')" v-if="permission.add">新增</Button>
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
    <!-- 编辑物料信息 -->
    <materialSide
      :modelVisible.sync="materialVisible"
      :modalData="materialData"
      :supplyList="supplyList"
      :openType="openType"
      @saveAfter="getList"
    />
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/commonMixin';
import tableMixin from '@/components/mixin/table_mixin';
import materialSide from './materialSide';
import { materialTypeData, meteringUnit } from '@/utils/pdsSettingConstant';

export default {
  mixins: [Mixin, tableMixin],
  components: {
    materialSide
  },
  props: {},
  data () {
    return {
      // 搜索栏表单数据
      filterData: {
        materialTypes: [],
        materialNames: [],
        materialCode: [],
        enableStatus: null,
        supplierId: [],
        createdTime: [],
        createdByList: []
      },
      userDataList: {},
      openType: 'view',
      materialVisible: false,
      materialData: {},
      supplyList: [],
      materialTypeData: materialTypeData,
      meteringUnit: meteringUnit,
      checkTableData: [],
      filterRule: {}, // 搜索栏表单规则
      tableLoading: false,
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
          title: '物料编码',
          key: 'materialCode',
          width: 160,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.materialCode)) return h('span', '');
            return h('span', {
              style: {
                'cursor': 'pointer',
                'color': '#2d8cf0',
                'text-decoration': 'underline',
                'text-underline-position': 'under'
              },
              on: {
                click: () => {
                  this.pushMaterial(row, 'view');
                }
              },
            }, row.materialCode);
          }
        },
        {
          title: '物料名称',
          key: 'materialName',
          align: 'center',
          minWidth: 150
        },
        {
          title: '图片',
          key: 'path',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return this.newTableImg(h, params, 'path');
          }
        },
        {
          title: '物料类型',
          key: 'materialType',
          align: 'center',
          width: 100,
          render: (h, { row }) => {
            if (this.$common.isEmpty(this.materialTypeData[row.materialType])) return h('span','');
            return h('span', `${this.materialTypeData[row.materialType].label}`);
          }
        },
        {
          title: '单价',
          key: 'price',
          width: 90,
          align: 'center'
        },
        {
          title: '计量单位',
          key: 'unitMeasurement',
          width: 100,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(this.meteringUnit[row.unitMeasurement])) return h('span','');
            return h('span', `${this.meteringUnit[row.unitMeasurement].label}`);
          }
        },
        {
          title: '首选供应商',
          key: 'supplierId',
          minWidth: 110,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.supplierId)) return h('span','');
            const supplyInfo = this.supplyList.find(item => {
              return item.supplierId == row.supplierId
            })
            if (this.$common.isEmpty(supplyInfo)) return h('span','');
            return h('span', supplyInfo.supplierName);
          }
        },
        {
          title: '备注',
          key: 'remark',
          minWidth: 200,
          align: 'center'
        },
        {
          title: '启用状态',
          key: 'enableStatus',
          width: 90,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.enableStatus)) return h('span','');
            if (row.enableStatus == 0) {
              return h('span','停用');
            }
            if (row.enableStatus == 1) {
              return h('span','启用');
            }
            return h('span','');
          }
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
          width: 90,
          fixed: 'right',
          align: 'center',
          render: (h, { row }) => {
            let rowItem = [];
            if (this.permission.edit) {
              rowItem.push(h('Button', {
                style: {},
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.pushMaterial(row, 'edit');
                  }
                }
              }, '编辑'));
            }
            return h('div', {}, rowItem);
          }
        }
      ]
    };
  },
  watch: {},
  created () {
    this.tableHeight = this.getTableHeight(245);
    this.getSupplierList();
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
        query: this.getPermission('pdsBase_materialManage_query'),
        add: this.getPermission('pdsBase_materialManage_add'),
        edit: this.getPermission('pdsBase_materialManage_edit'),
        export: this.getPermission('pdsBase_materialManage_export')
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
        return this.$Message.error('您暂时无权限查看!');
      }
      if (this.tableLoading) return;
      this.checkTableData = [];
      this.tableLoading = true;
      this.axios.post(api.queryProductMaterialList, this.getParamsData()).then(res => {
        this.tableLoading = false;
        if (res.code === 0 && res.datas && res.datas.list) {
          this.tableData = res.datas.list;
          this.total = res.datas.total;
        }
      }).catch(() => {
        this.tableLoading = false;
      });
    },
    // 获取供应商列表
    getSupplierList() {
      this.$axios.get(api.queryAllSupplierInfo).then((res) => {
        this.supplyList = res.code === 0 ? res.datas || [] : [];
      })
    },
    // 新增物料弹窗
    pushMaterial (row, type) {
      this.materialData = this.$common.copy(row);
      this.openType = type;
      this.$nextTick(() => {
        this.materialVisible = true;
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
    // 导出
    exportExcel(str) {
      if (this.$common.isEmpty(str)) return;
      let temp = {};
      if (str == 'check') {
        if (this.$common.isEmpty(this.checkTableData)) return this.$Message.error('请选择需要导出的数据!');
        temp.materialIds = this.checkTableData.map(k => k.materialId);
      } else if (str == 'all') {
        temp = this.getParamsData();
        delete temp.pageNum;
        delete temp.pageSize;
      }
      this.axios.post(api.exportMaterials, temp).then((data) => {
        if (data.code == 0) {
          this.$Message.success('操作成功!');
        }
      })
    }
  }
};
</script>
<style scoped lang="less">
.page-main-content{
  position: relative;
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
  :deep(.ivu-select-dropdown){
    min-width: 110px !important;
  }
}
</style>
