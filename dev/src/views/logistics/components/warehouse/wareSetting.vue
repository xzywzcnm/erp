<template >
  <div >
    <div class="usersFilter" >
      <div class="card-container" >
        <div class="card-content" >
          <div class="platformParamsSelect" >
            <Form :model="pageParams" :label-width="80" >
              <dyt-filter :filter-row="1">
                <Form-item label="仓库状态：" >
                  <dyt-select v-model="pageParams.issueFlag">
                    <Option
                      v-for="(item,index) in issueFlagList"
                      :key="index"
                      :value="item.value"
                    >{{ item.label }}</Option>
                  </dyt-select>
                </Form-item >
                <Form-item label="仓库类型：" >
                  <dyt-select v-model="pageParams.selectWareHouseType">
                    <Option value="*" >全部</Option > <Option
                      v-for="item in wareHouseTypeList"
                      :value="item.selectWareHouseType"
                      :key="item.merchantId"
                    >{{ item.account }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="仓库名称：" >
                    <dyt-select
                      v-model="pageParams.searchWareName"
                      style="min-width:150px;width: 240px"
                      filterable
                      clearable
                    >
                      <Option
                        v-for="item in wareHouseList"
                        :value="item.warehouseName"
                        :key="item.warehouseId"
                        style="width:220px;"
                      >{{ item.warehouseName }}</Option>
                    </dyt-select>
                  </Form-item>
                  <Form-item label="仓库代码：" >
                    <dyt-input v-model.trim="pageParams.searchWareCode" style="width: 240px" ></dyt-input >
                  </Form-item >
              </dyt-filter>
            </Form >
          </div >
          <div class="platformSearch clear" >
            <Row >
              <Col span='5' >
                <div class="filterItem filterConfirm" >
                  <Button type="primary" @click="wareHouseSearch" v-once icon="search" >查询 </Button >
                </div >
              </Col >
            </Row >
          </div >
        </div >
      </div >
    </div >
    <!--按创建时间 或 按仓库状态排序-->
    <div class="dataSort grayBg" >
      <span >排序方式：</span >
      <Button-group >
        <Button
            :type="item.checked?'primary':'default'"
            v-for='item in sortData'
            @click='clickSortButton(item)'
            :key='item.value' >{{ item.label }}
          <Icon type="md-arrow-round-up" v-if="item.checked && !item.toogle" ></Icon >
          <Icon type="md-arrow-round-down" v-if="item.checked && item.toogle" ></Icon >
        </Button >
      </Button-group >
    </div >
    <!--新建仓库按钮-->
    <div class="addBinding" >
      <Button type="primary" icon="plus-round" @click="createWareHouseBtn" >新建仓库 </Button >
    </div >
    <div class="shopTable" >
      <!--表格-->
      <Table highlight-row border :columns="columns6" :data="data6" ref="selection" class="adfgg-87884"></Table >
      <!--分页按钮-->
      <div class="table-page" >
        <div class="table-page-right" >
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
              :page-size-opts="pageArray" ></Page >
        </div >
      </div >
    </div >
    <!-- 新建仓库模态框-->
    <Modal
        v-model="showAddWareModal" :styles="{top: '80px',width:'520px'}" class="headerBar" @on-cancel="cancelAddBtn" >
      <p slot="header" >
        <span >{{ addNewWareHouseTitle }}</span >
      </p >
      <div >
        <warehouseModal
          ref='addNewWareFlag'
          @createSuccess="createSuccess"
          @createFail="createFail"
          :warehouseModalStatus='addStatus'
        />
      </div >
      <div slot="footer" >
        <Button type="primary" @click="addNewWareHouseBtn" >确定新增 </Button >
        <Button @click="cancelAddBtn" >取消</Button >
      </div >
    </Modal >
    <!-- 查看和编辑仓库模态框 -->
    <Modal
        v-model="showEditWareModal" :styles="{top: '80px',width:'520px'}" class="headerBar" @on-cancel="cancelEditBtn" >
      <p slot="header" >
        <span >{{ editWareHouseTitle }}</span >
      </p >
      <div >
        <warehouseModal
            ref='editWareFlag'
            :wareId='wareId'
            @editSuccess="editSuccess"
            @editFail="editFail"
            :openFlag='$store.state.wareSetWatchFlag'
            :curSingleDtl='curSingleDtl'
            :warehouseModalStatus='editStatus' ></warehouseModal >
      </div >
      <div slot="footer" >
        <Button type="primary" @click="editWareHouseBtn" >确定编辑 </Button >
        <Button @click="cancelEditBtn" >取消</Button >
      </div >
    </Modal >
  </div >
</template>
<script>
import warehouseModal from './warehouseModal';
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  components: {
    warehouseModal
  },
  data () {
    var self = this;
    return {
      wareId: '', // 编辑当前行的仓库ID
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
        pageSize: 10 // 规定每页显示 10 条数据
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
          width: 80,
          align: 'center'
        }, {
          title: '仓库代码',
          key: 'warehouseCode',
          align: 'center'
        }, {
          title: '仓库名称',
          key: 'warehouseName',
          align: 'center'
        }, {
          title: '状态',
          key: 'warehouseStatus',
          align: 'center',
          render (h, params) {
            return params.row.warehouseStatus === '0' ? h('span', {
              class: 'openStatus'
            }, '可用') : h('span', {
              class: 'stopStatus'
            }, '停用');
          }
        }, {
          title: '仓库类型',
          key: 'warehouseType',
          align: 'center',
          render (h, params) {
            return params.row.warehouseType === '0' ? h('span', '自营') : h('span', '第三方');
          }
        }, {
          title: '国家',
          key: 'countryCnName',
          align: 'center'
        }, {
          title: '创建时间',
          key: 'createdTime',
          align: 'center'
        }, {
          title: '操作',
          key: 'action',
          align: 'center',
          render: (h, params) => {
            if (params.row !== undefined) {
              return h('div', [
                h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      self.wareId = params.row.warehouseId; // 编辑当前行的仓库ID
                      self.curSingleDtl = params.row;
                      self.$refs.editWareFlag.disabledStatus = true;
                      self.$nextTick(() => {
                        self.$store.commit('wareSetWatchFlag', true);
                        self.showEditWareModal = true;
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
  created () {
    this.searchData();
    this.getWareHouseName(); // 调用仓库下拉列表
  },
  methods: {
    // 查询功能
    searchData () {
      var v = this;
      var paramsObj = {
        pageNum: v.pageParams.pageNum,
        pageSize: v.pageParams.pageSize,
        orderSeq: v.pageParams.DESC,
        orderBy: v.pageParams.CT,
        warehouseCode: v.pageParams.searchWareCode ? v.pageParams.searchWareCode : '', // 仓库代码
        warehouseName: v.pageParams.searchWareName ? v.pageParams.searchWareName : '' // 仓库名称
      };
      if (v.pageParams.issueFlag !== '*') paramsObj.warehouseStatus = v.pageParams.issueFlag; // 仓库状态
      if (v.pageParams.selectWareHouseType !== '*') paramsObj.warehouseType = v.pageParams.selectWareHouseType; // 仓库类型
      v.axios.post(api.wmsService + api.wareSetSearchData, paramsObj).then(res => {
        if (res.data.code === 0) {
          let resList = res.data.datas.list;
          resList.forEach(val => {
            val.createdTime = v.getDataToLocalTime(val.createdTime, 'fulltime');
          });
          v.data6 = resList;
          v.totalRecords = res.data.datas.total;
        } else {
          this.$Message.warning('操作失败' + '！');
        }
      });
    }, // 页面查询
    wareHouseSearch () {
      this.pageParams.pageNum = 1; // 页码重置为1
      this.searchData();
    }, // 确认新增仓库按钮
    addNewWareHouseBtn () {
      this.$refs.addNewWareFlag.addNewWareHouse();
    }, // 取消新增仓库按钮
    cancelAddBtn () {
      var v = this;
      v.showAddWareModal = false;
      v.$Message.info('取消新增仓库' + '！');
      v.$refs.addNewWareFlag.resetNewWareHouse(); // 取消之后，重置表单
    }, // 新增仓库成功
    createSuccess () {
      var v = this;
      v.showAddWareModal = false;
      v.$refs.addNewWareFlag.resetNewWareHouse(); // 新增成功之后，重置表单
      v.searchData();
    }, // 新增仓库失败
    createFail () {
      this.showAddWareModal = true;
    }, // 确认编辑仓库按钮
    editWareHouseBtn () {
      this.$refs.editWareFlag.editOrWatchWareHouse();
    }, // 取消编辑仓库按钮
    cancelEditBtn () {
      var v = this;
      v.showEditWareModal = false;
      v.$store.commit('wareSetWatchFlag', false);
    }, // 编辑仓库成功
    editSuccess () {
      var v = this;
      v.searchData();
      v.showEditWareModal = false;
      v.$store.commit('wareSetWatchFlag', false);
    }, // 编辑仓库失败
    editFail () {
      this.showEditWareModal = true;
    }, // 点击切换可用和停用
    checkIssueStatus: function (value) {
      this.issueFlagList.forEach(function (n) {
        n.checked = (n.value === value);
      });
      this.pageParams.issueFlag = value;
    }, // 点击排序的按钮
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
    }, // 表格分页
    changePage (page) {
      this.pageParams.pageNum = page;
      this.searchData();
    }, // 切换每页条数
    changePageSize (size) {
      this.pageParams.pageSize = size;
      this.searchData();
    }, // 新建仓库按钮
    createWareHouseBtn () {
      var v = this;
      v.$nextTick(function () {
        v.showAddWareModal = true;
      });
    }, // 获取仓库下拉列表
    getWareHouseName () {
      var v = this;
      v.axios.get(api.wmsService + api.query_warehouse).then(res => {
        if (res.data.code === 0) {
          // v.wareHouseTypeList = res.data.datas;
          let data = res.data.datas;
          data.forEach((n, i) => {
            v.wareHouseList.push(n);
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
