<template >
  <div class="inventoryMovePage">
    <div class="listPage">
      <div class="searchMain">
        <Form ref="pageParams" :model="pageParams" :label-width="80">
          <dyt-filter ref="dyt-filter" @expand="expand">
            <Form-item label="单据状态：" class="notplatformParamsSelect" prop="singleStatusFlag">
              <dyt-select v-model="pageParams.singleStatusFlag">
                <Option v-for="d in singleStatusFlagList" :value="d.value" :key="d.value">{{ d.label }}</Option>
              </dyt-select>
            </Form-item>
            <Form-item label="移动单号：" prop="searchMoveCode">
              <dyt-input placeholder="输入移动单号" v-model.trim="pageParams.searchMoveCode"> </dyt-input>
            </Form-item>
            <Form-item label="创建时间：" prop="createTime">
              <DatePicker type="daterange" transfer placeholder="选择日期" style="width: 100%"
                v-model="pageParams.createTime" />
            </Form-item>
            <div slot="operation">
              <Button type="primary" @click="moveSearch" :disabled="SearchDisabled" icon="md-search">查询</Button>
              <Button style="margin-left: 10px;" @click="reset" v-once icon="md-refresh">重置 </Button>
            </div>
          </dyt-filter>
        </Form>
      </div>
      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <Button type="primary" icon="md-add" class="fl mr10" @click="showCreateMoveModal"
              :disabled="!getPermission('wmsInventoryMove_create')">新建移动单 </Button>
            <Button type="primary" class="fl mr10" @click="openInportModal" icon="md-archive"
              :disabled="!getPermission('wmsInventoryMove_import')">导入 </Button>
            <Dropdown @on-click="exportAllOrSlt" class="fl mr10">
              <Button type="primary"><span class="icon iconfont" style="font-size: 12px">&#xe639;</span> 导出
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name="0" v-if="getPermission('wmsInventoryMove_export_batch')">导出选中数据
                </DropdownItem>
                <DropdownItem name="1" v-if="getPermission('wmsInventoryMove_export_all')">导出所有结果集
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>
      <!--表格-->
      <div class="tableMain">
        <div class="tableBox">
          <Table highlight-row border :height="tableHeight" :columns="columns" :loading="TableLoading" :data="data6"
            ref="selection" @on-selection-change="tableSelectionChange"></Table>
        </div>
      </div>
      <!--分页按钮-->
      <div class="pagesMain">
        <Page :total="totalRecords" :current="pageParams.pageNum" @on-change="changePage" show-total
          :page-size="pageParams.pageSize" show-elevator show-sizer @on-page-size-change="changePageSize" placement="top"
          :page-size-opts="pageArray"></Page>
      </div>
    </div>

    <!-- 创建移动单模态框弹框 -->
    <createMoveOrder :dialogVisible.sync="createMoveOrderInfo.visible" @searchData="searchData" />

    <!-- 移动单详情 -->
    <watchMoveOrder :dialogVisible.sync="watchMoveOrderInfo.visible" :curObj="curObj" @searchData="searchData" />

    <!-- 导入前的模态框 -->
    <Modal v-model="switchInportModal" :styles="{ top: '80px', width: '520px' }" class="headerBar" title="导入">
      <inportBeforeDownload @insertSuccess="switchInportModal = false" :importUrl="importUrl" :headObj="headObj"
        :wareId="wareId" templateTypes="2"></inportBeforeDownload>
      <div slot="footer">
        <Button @click="cancelInport">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import createMoveOrder from './createMoveOrder';
import inportBeforeDownload from '../wms-inWareManage/inportBeforeDownload';
import watchMoveOrder from './watchMoveOrder';
// import { getToken } from '@/utils/cookie';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';

export default {
  mixins: [Mixin, tableHeight_mixin],
  components: {
    createMoveOrder: createMoveOrder, // 新建移动单组件
    watchMoveOrder: watchMoveOrder,
    inportBeforeDownload
  },
  data() {
    var self = this;
    return {
      createMoveOrderInfo: {
        visible: false,
      },
      watchMoveOrderInfo: {
        visible: false,
      },
      switchInportModal: false,
      curObj: {},
      cacheClickVal: 'CT', // 排序缓存值
      wareHouseTypeList: [], // 仓库下拉列表
      wareId: this.getWarehouseId(), // 单据状态选择
      singleStatusFlagList: [
        {
          label: '已创建',
          value: '1',
          checked: false
        }, {
          label: '已完成',
          value: '2',
          checked: false
        }
      ],
      sortButtonList: [
        {
          sortHeader: "按添加时间",
          sortField: "CT",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "按状态",
          sortField: "AS",
          sortType: "DESC",
        },
      ],
      pageParams: {
        // 参数
        singleStatusFlag: '', // 单据状态
        searchMoveCode: '', // 输入移动单号
        DESC: 'DESC', // 降序
        CT: 'CT', // 排序的标记
        pageNum: 1, // 默认第一页
        pageSize: 10, // 规定每页显示 10 条数据
        createTime: ''
      },
      totalRecords: 0, // 共有多少条
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '移动单编号',
          key: 'inventoryMoveNo',
          width: 220,
          align: 'center',
          render: function (h, params) {
            if (self.getPermission('wmsInventoryMove_detail')) {
              return h('a', {
                style: {
                  display: 'inline-block',
                  width: '100%',
                  height: '100%'
                },
                on: {
                  click: function () {
                    self.curObj = params.row; // 获取当前表格行的数据
                    self.watchMoveOrderInfo.visible = true;
                    self.$nextTick(() => {
                      self.$store.commit('adjustDetailWatchFlag', true);
                    });
                  }
                }
              }, params.row.inventoryMoveNo);
            } else {
              return h('div', params.row.inventoryMoveNo);
            }
          }
        }, {
          title: '状态',
          key: 'moveStatus',
          align: 'center',
          render: (h, params) => {
            if (params.row.moveStatus === '0') {
              return h('div', {}, '');
            } else if (params.row.moveStatus === '1') {
              return h('div', {}, '已创建');
            } else if (params.row.moveStatus === '2') {
              return h('div', {}, '已完成');
            }
          }
        }, {
          title: '移动SKU数量',
          key: 'moveSkuNum',
          align: 'center'
        }, {
          title: '创建人',
          key: 'createdBy',
          align: 'center'
        }, {
          title: '审核人',
          key: 'auditUserId',
          align: 'center'
        }, {
          title: '创建时间',
          key: 'createdTime',
          align: 'center'
        }, {
          title: '操作',
          key: 'action',
          align: 'center',
          fixed: 'right',
          width: 260,
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                  icon: 'md-checkmark'
                },
                style: {
                  marginRight: '10px',
                  display: params.row.moveStatus === '1' ? 'none' : params.row.moveStatus === '2'
                    ? 'none'
                    : params.row.moveSkuNum === 0 ? 'none' : 'inline'
                },
                on: {
                  click: () => {
                    this.curObj = params.row; // 获取当前表格行的数据
                    this.checkPassBtn();
                  }
                }
              }, '审核通过'), h('Button', {
                props: {
                  type: 'success',
                  size: 'small',
                  icon: 'md-checkmark',
                  disabled: !this.getPermission('wmsInventoryMove_perform')
                },
                style: {
                  marginRight: '10px',
                  display: params.row.moveStatus === '0' ? 'none' : params.row.moveStatus === '2'
                    ? 'none'
                    : params.row.moveSkuNum === 0 ? 'none' : 'inline'
                },
                on: {
                  click: () => {
                    this.curObj = params.row; // 获取当前表格行的数据
                    this.confirmMoveBtn();
                  }
                }
              }, '确认移库'), h('Button', {
                props: {
                  // type: 'info',
                  size: 'small',
                  icon: 'ios-eye',
                  disabled: !this.getPermission('wmsInventoryMove_detail')
                },
                on: {
                  click: () => {
                    self.curObj = params.row; // 获取当前表格行的数据
                    self.watchMoveOrderInfo.visible = true;

                    // 不知道这些用来干什么的。。。。
                    if (params.row.moveStatus === '1') {
                      self.$store.commit('adjustDetailTableShow', 'noCheck');
                    } else if (params.row.moveStatus === '2') {
                      self.$store.commit('adjustDetailTableShow', 'isChecked');
                    }
                    self.$nextTick(() => {
                      self.$store.commit('adjustDetailWatchFlag', true);
                    });
                  }
                }
              }, '查看')
            ]);
          }
        }
      ],
      data6: [],
      moveDetailList: [], // 接收详情里面的数据
      tableSltData: [],
      importUrl: api.importInventory
    };
  },
  created() {
    this.searchData();
  },
  computed: {
    headObj() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    }
  },
  methods: {
    openInportModal() {
      this.switchInportModal = true;
    },
    okInport() { },
    cancelInport() {
      this.switchInportModal = false;
    },
    tableSelectionChange(selection) {
      this.tableSltData = selection;
    },
    batchOption(name) {
      if (name === '2') {
      } else {
      }
    }, // 导入
    beforeUp() { },
    uploadSuccess(res, file, fileList) {
      if (res.code === 0) {
        this.$Message.success('导入成功');
      } else {
        this.$Message.warning({
          content: res.message,
          duration: 5
        });
      }
    },
    uploadError() { },
    exportFn(obj) {
      this.axios.post(api.exportInventory, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
        } else {
          // this.$Message.warning({
          //   content: res.data.message,
          //   duration: 5
          // });
        }
      });
    },
    exportAllOrSlt(name) {
      // 导出
      let obj = this.paramsFn();
      if (name === '0') {
        // 选中
        if (this.tableSltData.length === 0) {
          this.$Message.warning('请选择导出数据');
          return;
        }
        obj.inventoryMoveNos = this.tableSltData.map(val => val.inventoryMoveNo);
        obj.exportType = '0';
        this.exportFn(obj);
      } else {
        // 所有
        if (this.data6.length === 0) {
          this.$Message.warning({
            content: '无数据导出',
            duration: 5
          });
          return;
        }
        let obj2 = {
          exportType: '1',
          warehouseId: this.wareId,
          ...obj
        };
        this.exportFn(obj2);
      }
    },
    // checkSingleStatus: function (value) {
    //   // 选择单据状态按钮切换
    //   this.singleStatusFlagList.forEach(function (n) {
    //     n.checked = n.value === value;
    //   });
    //   this.pageParams.singleStatusFlag = value;
    // },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.DESC = type;
      this.pageParams.CT = feild;
      this.searchData();
    },
    paramsFn() {
      var v = this;
      v.pageParams.pageSize = v.getPageSizeCache();
      var paramsObj = {
        pageNum: this.pageParams.pageNum,
        pageSize: this.pageParams.pageSize,
        orderSeq: this.pageParams.DESC,
        orderBy: this.pageParams.CT,
        warehouseId: this.wareId,
        startCreatedTime: this.pageParams.createTime[0] ? this.$uDate.getDateTime(this.pageParams.createTime[0]) : null,
        endCreatedTime: this.pageParams.createTime[1] ? this.$uDate.getDateTime(this.pageParams.createTime[1]) : null
      };
      if (v.pageParams.singleStatusFlag) { paramsObj.moveStatus = v.pageParams.singleStatusFlag; } // 单据状态
      if (v.pageParams.searchMoveCode) { paramsObj.inventoryMoveNo = v.pageParams.searchMoveCode; } // 输入移动单号
      return paramsObj;
    },
    searchData() {
      // 查询功能
      var v = this;
      if (v.getPermission('wmsInventoryMove_list')) {
        let paramsObj = this.paramsFn();
        v.TableLoading = true;
        v.SearchDisabled = true;
        v.axios.post(api.moveListSearchData, paramsObj).then(res => {
          v.TableLoading = false;
          v.SearchDisabled = false;
          if (res.data.code === 0) {
            v.data6 = v.processTimeData(res.data.datas.list, 'createdTime');
            this.totalRecords = res.data.datas.total;
          } else {
            this.$Message.warning('操作失败');
          }
        });
        // this.getWareHouseName(); // 调用仓库下拉列表
      } else {
        v.gotoError(); // 无权限
      }
    },
    moveSearch() {
      // 页面查询
      this.pageParams.pageNum = 1; // 点击查询按钮将页码重置为1
      this.searchData();
    },
    changePage(page) {
      // 表格分页
      this.pageParams.pageNum = page;
      this.searchData();
    },
    changePageSize(size) {
      // 切换每页条数
      this.setPageSizeCache(size);
      this.pageParams.pageSize = size;
      this.searchData();
    },
    getWareHouseName() {
      // 获取仓库下拉列表
      var v = this;
      v.axios.post(api.selectMoveWareHouseName).then(res => {
        if (res.data.code === 0) {
          v.wareHouseTypeList = res.data.datas;
        }
      });
    },
    showCreateMoveModal() {
      this.createMoveOrderInfo.visible = true;
    },
    checkPassBtn() {
      // 审核通过
      var v = this;
      var obj = {
        inventoryMoveNo: this.curObj.inventoryMoveNo
      };
      v.axios.post(api.auditMoveOrder, obj).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('审核通过');
          v.searchData();
        } else if (res.data.code === -1) {
          v.$Message.info({
            content: '没有移动明细，不能审核',
            duration: 3
          });
        } else if (res.data.code === -2) {
          v.$Message.info({
            content: '移动数量不能为空',
            duration: 3
          });
        } else if (res.data.code === -6) {
          v.$Message.info({
            content: '实际库存有变化，移动数量不能大于From可用库存',
            duration: 3
          });
        } else {
          v.$Message.warning('审核失败');
        }
      });
    },
    confirmMoveBtn() {
      // 确认移库，执行库存移动
      var v = this;
      var obj = {
        inventoryMoveNo: this.curObj.inventoryMoveNo
      };
      v.axios.post(api.performMoveOrder, obj).then(res => {
        if (res.data.code === 0) {
          if (res.data.others.datas) {
            // code 554131
            let text = '操作失败:库位正在盘点中(盘点单：' + res.data.others.datas + ')';
            v.$Message.error(text);
          } else {
            v.$Message.success('库存移库成功');
            v.searchData();
          }
        } else if (res.data.code === -1) {
          v.$Message.info({
            content: '盘点中，暂时不能操作库存',
            duration: 4
          });
        } else if (res.data.code === -2) {
          v.$Message.info({
            content: '移动失败，实际库存有变化，移动数量不能大于From可用库存',
            duration: 4
          });
        } else if (res.data.code === -3) {
          v.$Message.info({
            content: '移动单已执行，不能重复执行',
            duration: 4
          });
        }
      });
    }, // 重置按钮
    reset() {
      // this.checkSingleStatus('*');
      this.$refs['pageParams'].resetFields();
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
<style lang="less">
.inventoryMovePage {
  height: 100%;
  position: relative;
}
</style>
