<template>
  <div class="reason-management">
    <Card shadow class="platformParamsSelect">
      <Form ref="pageParamsFrom" :model="pageParams" inline :label-width="80" class="formItem">
        <dyt-filter>
          <FormItem label="搜索字符" prop="paramKey">
            <dyt-input v-model="pageParams.paramKey" :maxlength="25" placeholder="请輸入搜索字符" />
          </FormItem>
          <FormItem label="创建人" prop="createdByList">
            <dyt-select v-model="pageParams.createdByList" :max-tag-count="1" multiple placeholder="请选择创建人">
              <!-- <Option v-for="(item, index) in personnelList" :key="`user-${index}`" :value="item.userId" >{{ item.userName }}</Option> -->
              <Option v-for="(item, index) in personnelList" :key="`user-${index}`" :value="item.userName" >{{ item.userName }}</Option>
            </dyt-select>
          </FormItem>
          <Form-item label="创建时间" prop="createTime">
            <!-- type="datetimerange" -->
            <!-- :options="dateOptions" -->
            <!-- type="datetime" -->
            <Date-picker
              transfer
              type="datetimerange"
              style="width: 100%"
              :clearable="true"
              :options="dateOptions"
              format="yyyy-MM-dd HH:mm:ss"
              placement="bottom-start"
              placeholder="选择日期"
              v-model="pageParams.createTime"
            >
            </Date-picker>
          </Form-item>
          <div slot="operation">
            <Button type="primary" @click="searchData(true)" :disabled="tableLoading" v-if="permission.query">查询</Button>
            <Button @click="reset" style="margin-left: 10px"  icon="md-refresh" v-if="permission.query">重置</Button>
          </div>
        </dyt-filter>
      </Form>
    </Card>
    <div class="table-top">
      <Button icon="md-add" @click="openEdit({})" v-if="permission.insert">新建</Button>
      <!-- <Icon type="md-add" /> -->
      <Button type="primary" style="margin-left: 10px;" @click="openImportModel" v-if="permission.import">Excel 导入</Button>
    </div>
    <div class="table-content">
      <Table
        highlight-row
        border
        :height="tableHeight"
        :loading="tableLoading"
        :columns="tableColumns"
        :data="tableData"
      />
    </div>
    <div class="table-page">
      <Page
        :total="total"
        @on-change="tableChangePage"
        show-total
        :page-size="pageParams.pageSize"
        show-elevator
        :current="pageParams.pageNum"
        show-sizer
        @on-page-size-change="tableChangePageSize"
        placement="top"
        :page-size-opts="pageArray"
        :disabled="!permission.query"
      />
    </div>
    <!-- 新增或编辑 -->
    <addOrEditSaleReasons :module-data="moduleData" :visible.sync="editVisible" @searchData="searchData" v-if="permission.insert" />
    <!-- 数据导入 -->
    <importData :visible.sync="importVisible" @searchData="searchData" v-if="permission.import" />
    <!-- 加载 -->
    <Spin v-if="pageLoad" fix style="z-index: 1000;"></Spin>
  </div>
</template>

<script>
import Mixin from '@/components/mixin/common_mixin';
import api from "@/api/api";
import addOrEditSaleReasons from './addOrEditSaleReasons.vue';
import importData from './importData.vue';

export default {
  mixins: [Mixin],
  components: {
    addOrEditSaleReasons, importData
  },
  data () {
    return {
      pageLoad: false,
      importVisible: false,
      userDataJson: {},
      pageParams: {
        paramKey: '',
        createdByList: [],
        createTime: '',
        pageNum: 1,
        pageSize: 20
      },
      moduleData: {},
      editVisible: false,
      total: 0,
      personnelList: [],
      tableData: [],
      tableColumns: [
        {
          title: "售后原因",
          align: 'center',
          key: "paramKey",
          minWidth: 300,
        },
        {
          title: "创建人",
          align: 'center',
          key: "createdBy",
          minWidth: 100,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.createdBy)) return '';
            const userInfo = this.userDataJson[row.createdBy];
            if (this.$common.isEmpty(userInfo)) return h('span', row.createdBy);
            return h('span', userInfo.userName);
          }
        },
        {
          title: "创建时间",
          align: 'center',
          key: "createdTime",
          minWidth: 160,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.createdTime)) return ''
            // this.getDataToLocalTime(row.createdTime, "fulltime");
            return h('span', this.getDataToLocalTime(row.createdTime, "fulltime"));
          }
        },
        {
          title: "操作",
          key: "operate",
          fixed: "right",
          align: 'center',
          width: 130,
          render: (h, { row }) => {
            const operate = [];
            this.permission.update && operate.push(h('Button', {
              props: {
                size: "small"
              },
              on: {
                click: () => {
                  this.openEdit(row);
                }
              }
            }, '编辑'));
            this.permission.delete && operate.push(h('Button', {
              props: {
                size: "small"
              },
              style: {
                marginLeft: "5px",
              },
              on: {
                click: () => {
                  this.deleteRow(row);
                }
              }
            }, '删除'));
            return h('div', operate);
          }
        }
      ]
    };
  },
  watch: {},
  computed: {
    // 列表高度
    tableHeight() {
      return this.getTableHeight(290);
    },
    // 权限
    permission () {
      return this.$common.getPermission({
        query: 'afterSalesReasons_query', // 查询
        insert: 'afterSalesReasons_insert', // 新增
        update: 'afterSalesReasons_update', // 更新
        delete: 'afterSalesReasons_delete', // 删除
        import: 'afterSalesReasons_import' // 导入
      });
    }
  },
  mounted () {},
  activated () {},
  created () {
    this.getInitData();
  },
  methods: {
    getInitData () {
      this.pageLoad = true;
      const getData = [this.getUserData()]
      Promise.all(getData).finally(() => {
        this.pageLoad = false;
      })
    },
    // 获取搜索栏参数
    getParams () {
      const deleteKey = ['createTime']
      let pageParams = this.$common.copy(this.pageParams);
      if (this.pageParams.createTime.length > 0) {
        if (this.pageParams.createTime[0]) {
          pageParams.createTimeStart = this.getUniversalTime(this.pageParams.createTime[0], 'fulltime');
        }
        if (this.pageParams.createTime[1]) {
          pageParams.createTimeEnd = this.getUniversalTime(this.pageParams.createTime[1], 'fulltime');
        }
      }
      deleteKey.forEach(key => {
        delete pageParams[key];
      });
      return pageParams;
    },
    // 搜索
    searchData (type) {
      if (!this.permission.query) return;
      if (type) {
        this.pageParams.pageNum = 1;
      }
      this.tableLoading = true;
      const params = this.getParams();
      this.axios.post(api.saleReasonsTreatment.query, params).then((res) => {
        if (res.data && res.data.code === 0 && res.data.datas) {
          this.tableData = res.data.datas.list || [];
          this.total = res.data.datas.total;
        }
      }).finally(() => {
        this.tableLoading = false;
      })
    },
    // 获取人员
    getUserData () {
      return new Promise((resolve) => {
        this.personnelList = [];
        const apiUrl = api.get_userInfoCommon.replace(/^\./, '/cs-service');
        this.axios.get(apiUrl).then((response) => {
          if (response.data.code === 0) {
            this.userDataJson = response.data.datas;
            const allUser = Object.values(this.userDataJson);
            let allName = [];
            let newUserList = [];
            for (let i = 0, len = allUser.length; i < len; i++) {
              if (!allName.includes(allUser[i].userName)) {
                allName.push(allUser[i].userName);
                newUserList.push(allUser[i]);
              }
            }
            this.personnelList = newUserList;
          }
        }).finally(() => {
          resolve(true);
        })
      })
    },
    // 打开编辑弹窗
    openEdit (row) {
      this.moduleData = row || {};
      this.$nextTick(() => {
        this.editVisible = true;
      })
    },
    // 删除
    deleteRow (row) {
      this.$Modal.confirm({
        title: '提示',
        okText: '确定',
        content: `是否确认删除 ？`,
        onOk: () => {
          this.axios.delete(api.saleReasonsTreatment.delete, {
            params: {
              erpCommonSettingParamId: row.erpCommonSettingParamId
            }
          }).then(res => {
            if (res.data && res.data.code === 0) {
              this.$Message.success('操作成功!');
              this.searchData();
            }
          })
        }
      });
    },
    // 打开导入弹窗
    openImportModel () {
      this.importVisible = true;
    },
    // 导入数据
    importData () {
      this.axios.delete(api.saleReasonsTreatment.delete, {})
    },
    // 重置
    reset () {
      this.$refs["pageParamsFrom"].resetFields();
    },
    // 分页切换
    tableChangePage (page) {
      this.pageParams.pageNum = page;
      this.searchData();
    },
    // 页码改变
    tableChangePageSize (pageSize) {
      this.pageParams.pageSize = pageSize;
      this.searchData();
    }
  }
};
</script>
<style lang="less" scoped>
  .reason-management{
    position: relative;
    .table-top{
      position: relative;
      padding: 10px;
    }
    .table-content{
      position: relative;
    }
    .table-page{
      position: relative;
      margin: 10px;
      .ivu-page{
        text-align: right;
      }
    }
  }
</style>
