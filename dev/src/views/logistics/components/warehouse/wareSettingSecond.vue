<template>
  <div class="page-container">
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <dyt-filter :filter-row="1">
                <Form-item label="仓库状态：" prop="issueFlag">
                  <dyt-select v-model="pageParams.issueFlag" placeholder="请选择仓库状态">
                    <Option
                      v-for="(item,index) in issueFlagList"
                      :key="index"
                      :value="item.value"
                    >{{ item.label }}</Option>
                  </dyt-select>
                </Form-item >
                <Form-item label="仓库类型：" prop="selectWareHouseType">
                  <dyt-select v-model="pageParams.selectWareHouseType" placeholder="请选择仓库类型">
                    <Option value="*">全部</Option>
                    <Option v-for="item in wareHouseTypeList"
                      :value="item.selectWareHouseType"
                      :key="item.merchantId"
                    >{{ item.account }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="仓库名称：" prop="searchWareName">
                  <dyt-input v-model.trim="pageParams.searchWareName" placeholder="请输入仓库名称" />
                  <!-- <dyt-select v-model="pageParams.searchWareName" filterable clearable placeholder="请选择仓库名称">
                    <Option v-for="item in wareHouseList"
                      :value="item.warehouseName"
                      :label="item.warehouseName"
                      :key="item.warehouseId"
                    >{{ item.warehouseName }}</Option>
                  </dyt-select> -->
                </Form-item>
                <Form-item label="仓库代码：" prop="searchWareCode">
                  <dyt-input v-model.trim="pageParams.searchWareCode" placeholder="请输入仓库代码" />
                </Form-item>
                <div slot="operation">
                  <Button
                    type="primary"
                    v-if="getPermission('wmsWarehouse_list')"
                    @click="wareHouseSearch"
                    v-once
                    icon="md-search"
                    :disabled="tableLoading"
                  >查询</Button>
                  <Button class="ml10" @click="resetSearch" v-once icon="md-refresh">重置</Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>

    <!--新建仓库按钮-->
    <div class="addBinding" style="display: flex;">
      <div style="flex: 100;">
        <Button
          type="primary"
          icon="plus-round"
          v-if="getPermission('wmsWarehouse_create')"
          @click="createWareHouseBtn"
        >
          新建仓库
      </Button>
      </div>
      <!--按创建时间 或 按仓库状态排序-->
      <div class="dataSort grayBg" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;">
        <span>排序方式：</span>
        <Button-group>
          <Button
            :type="item.checked?'primary':'default'"
            v-for='item in sortData'
            @click='clickSortButton(item)'
            :key='item.value'
          >
            {{ item.label }}
            <Icon type="md-arrow-round-up" v-if="item.checked && !item.toogle"></Icon>
            <Icon type="md-arrow-round-down" v-if="item.checked && item.toogle"></Icon>
          </Button>
        </Button-group>
      </div>
    </div>
    <div class="shopTable">
      <!--表格-->
      <Table highlight-row border :columns="columns6" :height="tableHeight" :data="data6" ref="selection"></Table>
      <!--分页按钮-->
      <div class="table-page">
        <div class="table-page-right">
          <Page
            :total="totalRecords"
            :current="pageParams.pageNum"
            @on-change="changePage"
            show-total
            :page-size="pageParams.pageSize"
            show-elevator
            show-sizer
            @on-page-size-change="changePageSize"
            placement="top"
            :page-size-opts="pageArray"
          />
        </div>
      </div>
      <Spin fix v-if="tableLoading"></Spin>
    </div>
    <!-- 新建仓库模态框-->
    <Modal v-model="showAddWareModal" :styles="{top: '80px',width:'703px'}" class="headerBar" @on-cancel="cancelAddBtn">
      <p slot="header">
        <span>{{ addNewWareHouseTitle }}</span>
      </p>
      <warehouseModal
        ref='addNewWareFlag'
        @createSuccess="createSuccess"
        @createFail="createFail"
        :warehouseModalStatus='addStatus'
        :thirdCarrierList="thirdCarrierList"
      />
      <div slot="footer">
        <Button v-show="editStatus !== 'look'" type="primary" @click="addNewWareHouseBtn">确定新增</Button>
        <Button v-show="editStatus !== 'look'" @click="cancelAddBtn">取消</Button>
      </div>
    </Modal>
    <!-- 查看和编辑仓库模态框 -->
    <Modal
      v-model="showEditWareModal"
      :styles="{top: '80px',width:'703px'}"
      class="headerBar"
      @on-cancel="cancelEditBtn"
    >
      <p slot="header">
        <span>{{ editWareHouseTitle }}</span>
      </p>
      <warehouseModal
        ref='editWareFlag'
        :wareId='wareId'
        @editSuccess="editSuccess"
        @editFail="editFail"
        :openFlag='$store.state.wareSetWatchFlag'
        :curSingleDtl='curSingleDtl'
        :thirdCarrierList="thirdCarrierList"
        :warehouseModalStatus='editStatus'
      />
      <div slot="footer">
        <Button v-show="editStatus !== 'look'" type="primary" @click="editWareHouseBtn">确定编辑</Button>
        <Button v-show="editStatus !== 'look'" @click="cancelEditBtn">取消</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import warehouseModal from './warehouseModalSecond';
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
// import wareSetting from '@/views/logistics/components/warehouse/wareSetting';
export default {
  mixins: [Mixin],
  components: {
    warehouseModal
  },
  data () {
    return {
      thirdCarrierList: [], // 第三方服务商
      wareId: '', // 编辑当前行的仓库ID
      tableLoading: false,
      curSingleDtl: {}, // 查看当前行的仓库信息
      cacheClickVal: 'CT', // 排序缓存值
      // 仓库状态
      issueFlagList: [
        {
          label: '全部',
          value: '*',
          checked: true
        }, {
          label: '可用',
          value: '0',
          checked: false
        }, {
          label: '停用',
          value: '1',
          checked: false
        }
      ], // 仓库类型下拉选框
      wareHouseTypeList: [
        {
          selectWareHouseType: '0',
          account: '自营'
        }, {
          selectWareHouseType: '1',
          account: '第三方'
        }, {
          selectWareHouseType: '5',
          account: '直发'
        }
      ], // 排序的数据
      sortData: [
        {
          label: '按创建时间',
          value: 'CT',
          checked: true,
          toogle: true
        }, {
          label: '按仓库状态',
          value: 'WS',
          checked: false,
          toogle: true
        }
      ],
      pageParams: {
        issueFlag: '*', // 仓库状态
        selectWareHouseType: '*', // 仓库类型
        DESC: 'DESC', // 降序
        CT: 'CT', // 排序的标记
        searchWareName: '', // 仓库名称
        searchWareCode: '', // 仓库代码
        pageNum: 1, // 默认第一页
        pageSize: 20 // 规定每页显示数据
      },
      addNewWareHouseTitle: '新增仓库',
      editWareHouseTitle: '查看编辑仓库',
      showAddWareModal: false, // 新建仓库模态框
      showEditWareModal: false, // 编辑仓库模态框
      totalRecords: 0, // 总条数
      columns6: [
        {
          type: 'index',
          title: '序号',
          width: 120,
          align: 'center'
        },
        {
          title: '仓库代码',
          key: 'warehouseCode',
          align: 'center'
        },
        {
          title: '仓库名称',
          key: 'warehouseName',
          align: 'center'
        },
        {
          title: '状态',
          key: 'warehouseStatus',
          align: 'center',
          render: (h, params) => {
            return params.row.warehouseStatus === '0' ? h('span', { class: 'openStatus' }, '可用') : h('span', { class: 'stopStatus' }, '停用');
          }
        },
        {
          title: '仓库类型',
          key: 'warehouseType',
          align: 'center',
          render: (h, params) => {
            let text = '';
            let warehouseType = params.row.warehouseType;
            if (warehouseType === '0') {
              text = '自营';
              if (params.row.isYms === 1) {
                text = '云仓';
              }
            } else if (warehouseType == '5') {
              text = '直发';
            } else {
              text = '第三方';
            }
            return h('span', text);
          }
        },
        {
          title: '国家',
          key: 'countryCnName',
          align: 'center'
        },
        {
          title: '创建时间',
          key: 'createdTime',
          align: 'center'
        },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          width: 130,
          render: (h, params) => {
            if (params.row !== undefined) {
              return h('div', [
                h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px',
                    display: (() => {
                      return this.getPermission('wmsWarehouse_modify') ? 'inline-block' : 'none';
                    })()
                  },
                  on: {
                    click: () => {
                      this.wareId = params.row.warehouseId; // 编辑当前行的仓库ID
                      this.curSingleDtl = params.row;
                      this.editStatus = 'edit';
                      this.$refs.editWareFlag.disabledStatus = true;
                      this.$refs.editWareFlag.showStatus = true;
                      this.$refs.editWareFlag.getThridServiceList();
                      this.$refs.editWareFlag.getAmazonStore(params.row.merchantId);
                      this.$nextTick(() => {
                        this.editWareHouseTitle = '编辑';
                        this.$store.commit('wareSetWatchFlag', true);
                        this.showEditWareModal = true;
                        if (params.row.syncInventoryStatus === '1') {
                          this.$refs.editWareFlag.getReferenceWarehouse();
                        }
                      });
                    }
                  }
                }, '编辑'), h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.wareId = params.row.warehouseId; // 编辑当前行的仓库ID
                      this.curSingleDtl = params.row;
                      this.editStatus = 'look';
                      this.$refs.editWareFlag.disabledStatus = true;
                      this.$refs.editWareFlag.showStatus = true;
                      this.$refs.editWareFlag.getThridServiceList();
                      this.$refs.editWareFlag.getAmazonStore(params.row.merchantId);
                      this.$nextTick(() => {
                        this.editWareHouseTitle = '查看';
                        this.$store.commit('wareSetWatchFlag', true);
                        this.showEditWareModal = true;
                        if (params.row.syncInventoryStatus === '1') {
                          this.$refs.editWareFlag.getReferenceWarehouse();
                        }
                      });
                    }
                  }
                }, '查看')
              ]);
            }
          }
        }
      ],
      data6: [],
      addStatus: 'add',
      editStatus: 'edit',
      wareHouseList: [] // 仓库列表
    };
  },
  watch: {
    // 隐藏之后重置表单
    showEditWareModal (val) {
      if (!val) {
        this.$store.commit('wareSetWatchFlag', val);
        this.$refs.addNewWareFlag && this.$refs.addNewWareFlag.resetNewWareHouse();
      }
    },
    // 隐藏之后重置表单
    showAddWareModal (val) {
      if (!val) {
        this.$store.commit('wareSetWatchFlag', val);
        this.$refs.addNewWareFlag && this.$refs.addNewWareFlag.resetNewWareHouse();
      }
    }
  },
  computed: {
    tableHeight () {
      return this.getTableHeight(275)
    }
  },
  created () {
    this.getPermissionCallback('logistics_wareSetting').then(() => {
      this.searchData();
      this.getWareHouseName(); // 调用仓库下拉列表
    });
  },
  methods: {
    resetSearch () {
      this.$refs.pageParams && this.$refs.pageParams.resetFields();
    },
    // 查询功能
    searchData () {
      if (this.tableLoading) return;
      if (!this.getPermission('wmsWarehouse_list')) {
        this.$Message.warning('您暂无查看当前页面的权限，请联系管理员设置');
        return;
      }
      var paramsObj = {
        pageNum: this.pageParams.pageNum,
        pageSize: this.pageParams.pageSize,
        orderSeq: this.pageParams.DESC,
        orderBy: this.pageParams.CT,
        warehouseCode: this.pageParams.searchWareCode ? this.pageParams.searchWareCode : '', // 仓库代码
        warehouseName: this.pageParams.searchWareName ? this.pageParams.searchWareName : '' // 仓库名称
      };
      if (this.pageParams.issueFlag !== '*') paramsObj.warehouseStatus = this.pageParams.issueFlag; // 仓库状态
      if (this.pageParams.selectWareHouseType !== '*') paramsObj.warehouseType = this.pageParams.selectWareHouseType; // 仓库类型
      this.tableLoading = true;
      this.axios.post(api.wmsService + api.wareSetSearchData, paramsObj).then(res => {
        if (res.data.code === 0) {
          let resList = res.data.datas.list;
          resList.forEach(val => {
            val.createdTime = this.getDataToLocalTime(val.createdTime, 'fulltime');
          });
          this.data6 = resList;
          this.totalRecords = res.data.datas.total;
        } else {
          this.$Message.warning('操作失败' + '！');
        }
        this.tableLoading = false;
      }).catch(() => {
        this.tableLoading = false;
      })
    },
    // 页面查询
    wareHouseSearch () {
      if (this.tableLoading) return;
      this.pageParams.pageNum = 1; // 页码重置为1
      this.searchData();
    }, // 确认新增仓库按钮
    addNewWareHouseBtn () {
      this.$refs.addNewWareFlag.addNewWareHouse();
    },
    // 取消新增仓库按钮
    cancelAddBtn () {
      this.showAddWareModal = false;
    },
    // 新增仓库成功
    createSuccess () {
      this.showAddWareModal = false;
      this.searchData();
    },
    // 新增仓库失败
    createFail () {
      this.showAddWareModal = true;
    },
    // 确认编辑仓库按钮
    editWareHouseBtn () {
      this.$refs.editWareFlag.editOrWatchWareHouse();
    },
    // 取消编辑仓库按钮
    cancelEditBtn () {
      this.showEditWareModal = false;
    },
    // 编辑仓库成功
    editSuccess () {
      this.searchData();
      this.showEditWareModal = false;
    },
    // 编辑仓库失败
    editFail () {
      this.showEditWareModal = true;
    },
    // 点击切换可用和停用
    checkIssueStatus: function (value) {
      this.issueFlagList.forEach(function (n) {
        n.checked = (n.value === value);
      });
      this.pageParams.issueFlag = value;
    },
    // 点击排序的按钮
    clickSortButton: function (data) {
      if (data.value === this.cacheClickVal) {
        data.toogle = !data.toogle;
      }
      this.cacheClickVal = data.value;
      if (data.toogle) {
        this.pageParams.DESC = 'DESC';
      } else {
        this.pageParams.DESC = 'ASC';
      }
      this.sortData.forEach(function (n) {
        n.checked = (data.value === n.value);
      });
      this.pageParams.CT = data.value;
      this.searchData();
    },
    // 表格分页
    changePage (page) {
      this.pageParams.pageNum = page;
      this.searchData();
    }, // 切换每页条数
    changePageSize (size) {
      this.pageParams.pageSize = size;
      this.searchData();
    },
    // 新建仓库按钮
    createWareHouseBtn () {
      this.editStatus = 'add';
      this.$nextTick(() => {
        this.showAddWareModal = true;
        this.$store.commit('wareSetWatchFlag', new Date().getTime());
      });
    },
    // 获取仓库下拉列表
    getWareHouseName () {
      this.axios.get(api.wmsService + api.query_warehouse).then(res => {
        if (res.data.code === 0) {
          // this.wareHouseTypeList = res.data.datas;
          let data = res.data.datas;
          data.forEach((n, i) => {
            this.wareHouseList.push(n);
          });
        }
      });
    }
  }
};
</script>
<style>
.headerBar .ivu-modal-header p,
.headerBar .ivu-modal-header-inner {
  color: #fff;
}
</style>
<style lang="less" scoped>
.color-blue {
  color: #008000
}
.page-container {
  .shopTable {
    position: relative;
  }
  .table-page{
    display: flex;
    .table-page-right{
      float: none;
      padding: 0;
    }
  }
}
</style>
