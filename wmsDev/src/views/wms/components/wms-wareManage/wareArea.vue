<template >
  <div >
    <div class="usersFilter" >
      <div class="card-container" >
        <div class="card-content" >
          <!--库区状态按钮组-->
          <div class="platformParamsSelect" >
            <Form :model="pageParams" :label-width="80" >
              <div class="filterItem" >
                <Form-item label="库区状态：" >
                  <Button-group >
                    <Button
                        v-for="item in wareStatusFlagList"
                        :key="item.value"
                        :type="item.checked ? 'primary' : 'default'"
                        @click="checkWareStatus(item.value)" >
                      {{ item.label }}</Button >
                  </Button-group >
                </Form-item >
              </div >
            </Form >
          </div >
          <!--库区类型按钮组-->
          <div class="platformParamsSelect" >
            <Form :model="pageParams" :label-width="80" >
              <div class="filterItem" >
                <Form-item label="库区类型：" >
                  <Button-group >
                    <Button
                        v-for="item in wareAreaFlagList"
                        :key="item.value"
                        :type="item.checked ? 'primary' : 'default'"
                        @click="checkWareArea(item.value)" >{{ item.label }}</Button >
                  </Button-group >
                </Form-item >
              </div >
            </Form >
          </div >
          <div class="platformSearch clear" >
            <Row >
              <!--<Col span="7" style="margin-left: 7px;">-->
              <!--<Form :model="pageParams" label-position="left">-->
              <!--<div class="filterItem">-->
              <!--<Form-item >-->
              <!--<Select v-model="pageParams.warehouseId" style="min-width:150px;width: 240px" filterable  placeholder="选择仓库" clearable>-->
              <!--<Option v-for="item in wareHouseTypeList" :value="item.warehouseId" :key="item.warehouseId" >{{item.warehouseName}}</Option>-->
              <!--</Select>-->
              <!--</Form-item>-->
              <!--</div>-->
              <!--</Form>-->
              <!--</Col>-->
            </Row >
            <Row >
              <Col span="4" style="margin-left: 7px;" >
                <Form :model="pageParams" label-position="left" >
                  <div class="filterItem" >
                    <Form-item >
                      <Input
                          placeholder="输入库区代码/名称"
                          v-model.trim="pageParams.searchWareArea"
                          style="width: 240px" ></Input >
                    </Form-item >
                  </div >
                </Form >
              </Col >
              <Col span="5" >
                <div class="filterItem filterConfirm" >
                  <Button
                      type="primary"
                      @click="wareBlockSearch"
                      :disabled="SearchDisabled"
                      icon="ios-search" >查询</Button >
                </div >
              </Col >
            </Row >
          </div >
        </div >
      </div >
    </div >
    <!--按SortID 或 按库区状态排序-->
    <div class="dataSort grayBg" >
      <span >排序方式：</span >
      <Button-group >
        <Button
            :type="item.checked ? 'primary' : 'default'"
            v-for="item in sortData"
            :disabled="SearchDisabled"
            @click="clickSortButton(item)"
            :key="item.value" >{{ item.label }}
          <Icon type="md-arrow-up" v-if="item.checked && !item.toogle" ></Icon >
          <Icon type="md-arrow-down" v-if="item.checked && item.toogle" ></Icon >
        </Button >
      </Button-group >
    </div >
    <div class="fr" style="margin-right: 10px" >
      <Dropdown @on-click="exportAllOrSlt" >
        <Button icon="md-log-in" style="margin-right: 4px" >导出</Button >
        <DropdownMenu slot="list" >
          <DropdownItem name="0" >导出选中数据</DropdownItem >
          <DropdownItem name="1" >导出所有结果集</DropdownItem >
        </DropdownMenu >
      </Dropdown >
      <dytUpload
          :action="importUrl"
          class="fr"
          :show-upload-list="false"
          :headers="headObj"
          :before-upload="beforeUp"
          name="excleFile"
          :data="{ warehouseId: wareId }"
          :on-success="uploadSuccess"
          :on-error="uploadError" >
        <Button :loading="loading" >导入</Button >
      </dytUpload >
    </div >
    <!--新建库区按钮-->
    <div class="addBinding" >
      <Button type="primary" icon="md-add" @click="createWareBlockBtn" >
        新建库区 </Button >
    </div >
    <div class="shopTable" >
      <!--表格-->
      <Table
          highlight-row
          border
          :columns="columns6"
          :data="data6"
          :loading="TableLoading"
          ref="selection"
          @on-selection-change="tableSelectionChange" ></Table >
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
    <!-- 新建库区模态框 -->
    <div v-if="addWareBlockModal" >
      <Modal
          v-model="addWareBlockModal"
          :styles="{ top: '80px', width: '520px' }"
          class="headerBar"
          :title="addNewWareAreaTitle" >
        <div >
          <addWareArea ref="addNewBlockFlag" @createSuccess="createSuccess" @createFail="createFail" ></addWareArea >
        </div >
        <div slot="footer" >
          <Button type="primary" @click="addNewWareAreaBtn" >确定新增</Button >
          <Button @click="cancelAddBtn" >取消</Button >
        </div >
      </Modal >
    </div >
    <!-- 查看和编辑库区模态框 -->
    <!-- <div v-if="editWareBlockModal"> -->
    <Modal
        v-model="editWareBlockModal"
        :styles="{ top: '80px', width: '520px' }"
        class="headerBar"
        :title="editWareAreaTitle"
        @on-cancel="cancelEditBtn" >
      <div >
        <editWareArea
            ref="editBlockFlag"
            @editSuccess="editSuccess"
            @editFail="editFail"
            :wareId="rowWareId"
            :wareBlockId="wareBlockId"
            :openFlag="$store.state.wareAreaWatchFlag"
            :curSingleDtl="curSingleDtl" ></editWareArea >
      </div >
      <div slot="footer" >
        <Button type="primary" @click="editWareAreaBtn" >确定编辑</Button >
        <Button @click="cancelEditBtn" >取消</Button >
      </div >
    </Modal >
    <!-- </div> -->
  </div>
</template>
<script>
import addWareArea from './addWareArea';
import editWareArea from './editWareArea';
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
// import { getToken } from '@/utils/cookie';

export default {
  mixins: [Mixin],
  components: {
    addWareArea, // 新增库区组件
    editWareArea // 编辑库区组件
  },
  data () {
    let self = this;
    return {
      loading: false,
      wareId: this.getWarehouseId(),
      rowWareId: '', // 编辑当前行的仓库ID
      wareBlockId: '', // 编辑当前行的库区ID
      curSingleDtl: {}, // 查看当前行的库区信息
      cacheClickVal: 'sortId', // 排序缓存值
      // 库区状态选择
      wareStatusFlagList: [
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
      ], // 库区类型选择
      wareAreaFlagList: [
        {
          label: '全部',
          value: '*',
          checked: true
        }, {
          label: '收货区',
          value: '00',
          checked: false
        }, {
          label: '标准区',
          value: '10',
          checked: false
        }, {
          label: '良品区',
          value: '11',
          checked: false
        }, {
          label: '不良品区',
          value: '12',
          checked: false
        }, {
          label: '退货区',
          value: '20',
          checked: false
        }
      ], // 选择仓库
      wareHouseTypeList: [], // 排序的数据
      sortData: [
        {
          label: '按SortID',
          value: 'sortId',
          checked: true,
          toogle: true
        }, {
          label: '按库区状态',
          value: 'WS',
          checked: false,
          toogle: true
        }
      ],
      pageParams: {
        wareStatusFlag: '*', // 库区状态
        wareAreaFlag: '*', // 库区类型
        DESC: 'DESC', // 降序
        CT: 'sortId', // 排序的标记
        searchWareArea: '', // 搜索库区名称
        pageNum: 1,
        pageSize: 10
      },
      addNewWareAreaTitle: '新建库区',
      editWareAreaTitle: '查看和编辑库区',
      addWareBlockModal: false, // 新增库区的模态框
      editWareBlockModal: false, // 编辑库区的模态框
      totalRecords: 0, // 总条数
      columns6: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          type: 'index',
          title: '序号',
          width: 120,
          align: 'center'
        }, {
          title: 'SortID',
          key: 'sortId',
          align: 'center'
        }, {
          title: '库区代码',
          key: 'warehouseBlockCode',
          align: 'center'
        }, {
          title: '库区名称',
          key: 'warehouseBlockName',
          align: 'center'
        }, {
          title: '状态',
          key: 'warehouseBlockStatus',
          align: 'center',
          render (h, params) {
            return params.row.warehouseBlockStatus === '0' ? h('span', {
              class: 'openStatus'
            }, '可用') // 可用
                                                           : h('span', {
                                                             class: 'stopStatus'
                                                           }, '停用'); // 停用
          }
        }, {
          title: '仓库',
          key: 'warehouseName',
          align: 'center'
        }, {
          title: '库区类型',
          key: 'warehouseBlockType',
          align: 'center',
          render: (h, params) => {
            if (params.row.warehouseBlockType === '00') {
              return '收货区';
            } else if (params.row.warehouseBlockType === '10') {
              return '标准区';
            } else if (params.row.warehouseBlockType === '11') {
              return '良品区';
            } else if (params.row.warehouseBlockType === '12') {
              return '不良品区';
            } else if (params.row.warehouseBlockType === '20') {
              return '退货区';
            }
          }
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
                      self.rowWareId = params.row.warehouseId; // 编辑当前行的仓库ID
                      self.wareBlockId = params.row.warehouseBlockId; // 编辑当前行的库区ID
                      self.curSingleDtl = params.row;
                      self.$nextTick(() => {
                        self.$store.commit('wareAreaWatchFlag', true);
                        self.editWareBlockModal = true;
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
      tableSltData: [],
      importUrl: api.importWarehouseBlock
    };
  },
  created () {
    this.searchData();
  },
  computed: {
    headObj () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    }
  },
  methods: {
    tableSelectionChange (selection) {
      this.tableSltData = selection;
    },
    beforeUp () {},
    uploadSuccess (res, file, fileList) {
      if (res.code === 0) {
        this.$Message.success('导入成功');
      }
    },
    uploadError () {},
    exportFn (obj) {
      this.axios.post(api.exportWarehouseBlock, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
        }
      });
    },
    exportAllOrSlt (name) {
      // 导出
      let obj = this.getParamsObj();
      if (name === '0') {
        // 选中
        if (this.tableSltData.length === 0) {
          this.$Message.warning('请选择导出数据');
          return;
        }
        obj.warehouseBlockCodes = this.tableSltData.map(val => val.warehouseBlockCode);
        obj.exportType = '0';
        this.exportFn(obj);
      } else {
        // 所有
        let obj2 = {
          ...this.getParamsObj(),
          exportType: '1'
        };
        this.exportFn(obj2);
      }
    },
    getParamsObj () {
      var v = this;
      var paramsObj = {
        pageNum: this.pageParams.pageNum,
        pageSize: this.pageParams.pageSize,
        orderSeq: this.pageParams.DESC,
        orderBy: this.pageParams.CT,
        warehouseId: this.wareId
      };
      if (v.pageParams.wareStatusFlag !== '*') {
        paramsObj.warehouseBlockStatus = v.pageParams.wareStatusFlag;
      } // 库区状态
      if (v.pageParams.wareAreaFlag !== '*') {
        paramsObj.warehouseBlockTypeList = [v.pageParams.wareAreaFlag];
      } // 库区类型
      if (v.pageParams.searchWareArea) {
        paramsObj.warehouseBlockIdOrName = v.pageParams.searchWareArea;
      } // 输入库区ID/名称
      return paramsObj;
    },
    searchData () {
      // 查询数据
      let v = this;
      let paramsObj = this.getParamsObj();
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(api.wareAreaSearchData, paramsObj).then(res => {
        v.TableLoading = false;
        v.SearchDisabled = false;
        if (res.data.code === 0) {
          v.data6 = res.data.datas.list;
          v.totalRecords = res.data.datas.total;
        }
      });
      this.getWareHouseName(); // 调用仓库下拉列表
    },
    wareBlockSearch () {
      // 页面查询
      this.pageParams.pageNum = 1; // 页码重置为1
      this.searchData();
    },
    clickSortButton: function (data) {
      // 点击排序的按钮
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
        n.checked = data.value === n.value;
      });
      this.pageParams.CT = data.value;
      this.searchData();
    },
    addNewWareAreaBtn () {
      // 新建库区按钮
      this.$refs.addNewBlockFlag.addNewWareArea();
    },
    cancelAddBtn () {
      // 取消新增库区按钮
      var v = this;
      v.addWareBlockModal = false;
      v.$Message.info('取消新增库区！');
      v.$refs.addNewBlockFlag.resetNewWareArea(); // 取消之后，重置表单
    },
    createSuccess () {
      // 新增库区成功
      var v = this;
      v.addWareBlockModal = false;
      v.$refs.addNewBlockFlag.resetNewWareArea(); // 新增成功之后，重置表单
      v.searchData();
    },
    createFail () {
      // 新增库区失败
      this.addWareBlockModal = true;
    },
    editWareAreaBtn () {
      // 编辑库区按钮
      this.$refs.editBlockFlag.editOrWatchWareBlock();
    },
    cancelEditBtn () {
      // 取消编辑库区按钮
      var v = this;
      v.editWareBlockModal = false;
      v.$store.commit('wareAreaWatchFlag', false);
      v.$Message.info('取消编辑库区！');
    },
    editSuccess () {
      // 编辑库区成功
      var v = this;
      v.editWareBlockModal = false;
      v.$store.commit('wareAreaWatchFlag', false);
      v.searchData();
    },
    editFail () {
      // 编辑库区失败
      this.editWareBlockModal = true;
    },
    checkWareStatus: function (value) {
      // 库区状态按钮状态切换
      this.wareStatusFlagList.forEach(function (n) {
        n.checked = n.value === value;
      });
      this.pageParams.wareStatusFlag = value;
    },
    checkWareArea: function (value) {
      // 库区类型按钮状态切换
      this.wareAreaFlagList.forEach(function (n) {
        n.checked = n.value === value;
      });
      this.pageParams.wareAreaFlag = value;
    },
    getWareHouseName () {
      // 获取仓库下拉列表
      var v = this;
      v.axios.post(api.selectWareBlockName).then(res => {
        if (res.data.code === 0) {
          v.wareHouseTypeList = res.data.datas;
        }
      });
    },
    changePage (page) {
      // 表格分页
      var v = this;
      v.pageParams.pageNum = page;
      v.searchData();
    },
    changePageSize (size) {
      // 切换每页条数
      var v = this;
      v.pageParams.pageSize = size;
      v.searchData();
    },
    createWareBlockBtn () {
      // 新建库区按钮
      var v = this;
      v.$nextTick(function () {
        v.addWareBlockModal = true;
      });
    }
  }
};
</script >
<style >
.headerBar .ivu-modal-header p,
.headerBar .ivu-modal-header-inner {
  color: #fff;
}
</style >
