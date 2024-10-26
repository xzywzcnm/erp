<template>
  <div class="inventoryTransfer">

    <div class="listPage" v-show="$store.state.transferOrderShow === 'transfer'">
      <div class="searchMain">
        <Form ref="pageParams" :model="pageParams" :label-width="80">
          <dyt-filter ref="dyt-filter" @expand="expand">
            <!-- :单据状态切换 -->
            <Form-item label="状态：" prop="singleStatusFlag" class="notplatformParamsSelect">
              <dyt-select v-model="pageParams.singleStatusFlag">
                <Option v-for="d in singleStatusFlagList" :value="d.value" :key="d.value" :label="d.label"></Option>
              </dyt-select>
            </Form-item>
            <Form-item label="调入仓库：" prop="warehouseIntoId">
              <dyt-select v-model="pageParams.warehouseIntoId">
                <Option v-for="item in intoWareHouseTypeList" :value="item.warehouseId" :label="item.warehouseName"
                  :key="item.warehouseIntoId"></Option>
              </dyt-select>
            </Form-item>
            <Form-item label="调拨类型：" prop="warehouseOverseaType">
              <dyt-select v-model="pageParams.warehouseOverseaType">
                <Option v-for="item in warehouseOverseaTypeList" :value="item.value" :label="item.label"
                  :key="item.value"></Option>
              </dyt-select>
            </Form-item>
            <Form-item label="创建时间：" prop="createTime">
              <DatePicker type="daterange" transfer placeholder="选择日期" style="width: 100%"
                v-model="pageParams.createTime" />
            </Form-item>
            <Form-item label="调拨单号：" prop="searchAdjustCode">
              <dyt-input placeholder="输入调拨单号" v-model.trim="pageParams.searchAdjustCode"> </dyt-input>
            </Form-item>
            <div slot="operation">
              <Button type="primary" @click="allotSearch" :disabled="SearchDisabled" icon="md-search">查询</Button>
              <Button class="ml10" @click="reset" v-once icon="md-refresh">重置 </Button>
            </div>
          </dyt-filter>
        </Form>
      </div>

      <div class="funMain">
        <div class="funMain__flex">
          <!--新建调拨单按钮-->
          <div>
            <Button type="primary" icon="md-add" class="fl mr10" @click="showCreateAdjustModal"
              :disabled="!getPermission('wmsInventoryAllot_create')">新建调拨单 </Button>
            <Button type="primary" class="fl mr10" @click="openInportModal" icon="md-archive"
              :disabled="!getPermission('wmsInventoryAllot_import')">导入 </Button>
            <Dropdown @on-click="exportAllOrSlt" class="fl">
              <Button type="primary" style="margin-right: 4px"><span class="icon iconfont"
                  style="font-size: 12px">&#xe639;</span>导出
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name="0" v-if="getPermission('wmsInventoryAllot_export_batch')">导出选中数据
                </DropdownItem>
                <DropdownItem name="1" v-if="getPermission('wmsInventoryAllot_export_all')">导出所有结果集
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <!--按 :添加时间 :或 :按单据状态 :排序-->
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>

      <div class="tableMain">
        <div class="tableBox">
          <!--表格-->
          <Table highlight-row border :height="tableHeight" :columns="columns7" :loading="TableLoading" :data="data6"
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

    <!-- :新建调拨单模态框弹框 -->
    <createTransferOrder v-if="$store.state.transferOrderShow === 'add'"></createTransferOrder>
    <!-- :调拨单详情 -->
    <watchTransferOrder v-if="$store.state.transferOrderShow === 'watch'" :curObj="curObj"
      :openFlag="$store.state.adjustDetailWatchFlag"></watchTransferOrder>
    <!--导入前的模态框  -->
    <Modal v-model="switchInportModal" :styles="{ top: '80px', width: '520px' }" class="headerBar" title="导入">
      <inportBeforeDownload @insertSuccess="switchInportModal = false" :importUrl="importUrl" :headObj="headObj"
        :wareId="warehouseOutId" templateTypes="8"></inportBeforeDownload>
      <div slot="footer">
        <Button @click="cancelInport">取消 </Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import createTransferOrder from './createTransferOrder';
import inportBeforeDownload from '../wms-inWareManage/inportBeforeDownload';
import watchTransferOrder from './watchTransferOrder';
// import { getToken } from '@/utils/cookie';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';

export default {
  mixins: [Mixin, tableHeight_mixin],
  components: {
    createTransferOrder: createTransferOrder, // 新建调拨单组件
    watchTransferOrder: watchTransferOrder, // 调拨单详情组件
    inportBeforeDownload
  },
  data() {
    var self = this;
    var v = this;
    return {
      loading: false,
      switchInportModal: false,
      importUrl: api.importAllot,
      curObj: {},
      cacheClickVal: 'CT', // 排序缓存值
      outWareHouseTypeList: [], // 调出仓库下拉列表
      intoWareHouseTypeList: [], // 调入仓库下拉列表
      // 单据状态选择
      singleStatusFlagList: [
        // {
        //   label: '全部',
        //   value: '*',
        //   checked: true
        // },
        {
          label: '创建状态',
          value: '0',
          checked: false
        }, {
          label: '部分调拨',
          value: '1',
          checked: false
        }, {
          label: '完全调拨',
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
          sortHeader: "按调拨单状态",
          sortField: "AS",
          sortType: "DESC",
        },
      ],
      warehouseOverseaTypeList: [// 调拨类型下拉
        {
          label: '自营仓调拨',
          value: 'OWNER'
        }, {
          label: 'FBA中转',
          value: 'AMAZON_FBA'
        }
      ],
      warehouseOutId: v.getWarehouseId(),
      pageParams: {
        // 参数
        warehouseIntoId: '', // 调入仓库
        singleStatusFlag: '', // 单据状态
        searchAdjustCode: '', // 输入调整单号
        warehouseOverseaType: null, // 调拨类型
        createTime: [], // 创建时间
        DESC: 'DESC', // 降序
        CT: 'CT', // 排序的标记
        pageNum: 1, // 默认第一页
        pageSize: 10 // 规定每页显示 10 条数据
      },
      totalRecords: 0, // 共有多少条
      columns7: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '调拨单编号',
          key: 'inventoryAllotNo',
          width: 165,
          align: 'center',
          render: function (h, params) {
            if (self.getPermission('wmsInventoryAllot_detail')) {
              return h('a', {
                style: {
                  display: 'inline-block',
                  width: '100%',
                  height: '100%'
                },
                on: {
                  click: function () {
                    self.curObj = params.row; // 获取当前表格行的数据
                    self.$store.commit('transferOrderShow', 'watch');
                    self.$nextTick(() => {
                      self.$store.commit('adjustDetailWatchFlag', true);
                    });
                  }
                }
              }, params.row.inventoryAllotNo);
            } else {
              return h('div', params.row.inventoryAllotNo);
            }
          }
        }, {
          title: '调拨单类型',
          key: 'type',
          align: 'center',
          render: (h, params) => {
            if (!params.row.warehouseOverseaType) {
              return h('div', '本地仓调拨');
            } else {
              return h('div', [
                h('div', '第三方仓调拨'), h('div', {
                  style: {
                    color: '#169bd5'
                  }
                }, params.row.warehouseOverseaType)
              ]);
            }
          }
        }, {
          title: '调入仓库',
          key: 'toWarehouseName',
          align: 'center'
        }, {
          title: '调拨单状态',
          key: 'allotStatus',
          align: 'center',
          render: (h, params) => {
            if (params.row.allotStatus === '0') {
              return h('div', {}, '创建状态');
            } else if (params.row.allotStatus === '1') {
              return h('div', {}, '部分调拨');
            } else if (params.row.allotStatus === '2') {
              return h('div', {}, '完全调拨');
            } else if (params.row.allotStatus === '3') {
              return h('div', {}, '出库取消');
            } else if (params.row.allotStatus === '4') {
              return h('div', {}, '入库完成');
            } else if (params.row.allotStatus === '5') {
              return h('div', {}, '入库取消');
            }
          }
        }, {
          title: '参考编号',
          key: 'referenceNo',
          width: 160,
          align: 'center',
          render(h, params) {
            if (params.row.referenceNo2) {
              return h('div', {}, [
                h('span', params.row.referenceNo + '/'),
                h('span', v.sepCommasFn(params.row.referenceNo2).join('/'))
              ]);
            } else {
              return h('div', {}, [h('span', params.row.referenceNo)]);
            }
          }
        }, {
          title: '创建人',
          key: 'createdBy',
          align: 'center'
        }, {
          title: '创建时间',
          key: 'createdTime',
          align: 'center'
        }, {
          title: '操作',
          key: 'action',
          fixed: 'right',
          width: 280,
          align: 'center',
          render: (h, params) => {
            return h('div', [// h('Button', {
              //   props: {
              //     type: 'primary',
              //     size: 'small'
              //   },
              //   style: {
              //     marginRight: '10px',
              //     display: params.row.allotStatus === '1' || params.row.allotStatus === '2' || params.row.allotStatus === '3' ||
              //     params.row.allotStatus === '4' || params.row.allotStatus === '5' || params.row.allotDetailNumber === 0 ? 'none' : 'inline'
              //   },
              //   on: {
              //     click: () => {
              //       this.curObj = params.row;
              //       this.checkPassBtn();
              //     }
              //   }
              // }, '审核通过'),
              h('Button', {
                props: {
                  size: 'small',
                  icon: 'ios-eye',
                  disabled: !this.getPermission('wmsInventoryAllot_detail')
                },
                on: {
                  click: () => {
                    self.curObj = params.row; // 获取当前表格行的数据
                    self.$store.commit('transferOrderShow', 'watch');
                    self.$nextTick(() => {
                      self.$store.commit('adjustDetailWatchFlag', true);
                    });
                  }
                }
              }, '查看详情'),
              params.row.allotStatus !== '0' || !this.getPermission('wmsInventoryAllot_delete') || h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginLeft: '5px'
                },
                on: {
                  click: () => {
                    self.curObj = params.row; // 获取当前表格行的数据
                    self.isDelModal(() => {
                      self.axios.delete(api.deleteAllot + '?inventoryAllotNo=' + params.row.inventoryAllotNo).then((response) => {
                        if (response.data.code === 0) {
                          v.$Message.success('删除成功');
                          v.searchData();
                        }
                      });
                    });
                  }
                }
              }, '删除调拨单')
            ]);
          }
        }
      ],
      data6: [],
      transferDataList: [], // 接受调整详情里面的数据
      tableSltData: []
    };
  },
  computed: {
    headObj() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    }
  },
  //   computed: {
  //     tableHeight () {
  //       return this.getTableHeight(295);
  //     }
  //   },
  watch: {
    '$store.state.transferOrderShow': function (add) {
      // 创建库存调拨单成功
      if (add !== 'watch') {
        this.searchData();
      }
      if (add === 'transfer') {
        this.$nextTick(() => {
          this.computedTableHeight();
        })
      }
    }
  },
  created() {
    this.searchData();
    this.getOutWareHouseName(); // 调出仓库的下拉列表
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
      // let v = this;
      if (res.code === 0) {
        this.$Message.success('导入成功');
      }
    },
    uploadError() { },
    exportFn(obj) {
      // let v = this;
      this.axios.post(api.exportAllot, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
        }
      });
    },
    exportAllOrSlt(name) {
      // 导出
      // let v = this;
      let obj = this.paramsFn();
      if (name === '0') {
        // 选中
        if (this.tableSltData.length === 0) {
          this.$Message.warning('请选择导出数据');
          return;
        }
        obj.inventoryAllotNos = this.tableSltData.map(val => val.inventoryAllotNo);
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
          warehouseId: this.warehouseOutId,
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
      this.pageParams.pageSize = this.getPageSizeCache();
      var paramsObj = {
        pageNum: this.pageParams.pageNum,
        pageSize: this.pageParams.pageSize,
        orderSeq: this.pageParams.DESC,
        orderBy: this.pageParams.CT,
        warehouseId: this.warehouseOutId,
        toWarehouseId: null,
        warehouseOverseaTypes: this.pageParams.warehouseOverseaType === null || this.pageParams.warehouseOverseaType === undefined
          ? null
          : [this.pageParams.warehouseOverseaType],
        startCreatedTime: this.pageParams.createTime[0] ? this.$uDate.getDateTime(this.pageParams.createTime[0]) : null,
        endCreatedTime: this.pageParams.createTime[1] ? this.$uDate.getDateTime(this.pageParams.createTime[1]) : null
      };
      if (v.pageParams.warehouseIntoId) { paramsObj.toWarehouseId = v.pageParams.warehouseIntoId; } // 调入仓库
      if (v.pageParams.singleStatusFlag) { paramsObj.allotStatus = v.pageParams.singleStatusFlag; } // 单据状态
      if (v.pageParams.searchAdjustCode) { paramsObj.inventoryAllotNo = v.pageParams.searchAdjustCode; } // 输入调拨单号
      return paramsObj;
    },
    searchData() {
      // 查询功能
      let v = this;
      if (v.getPermission('wmsInventoryAllot_list')) {
        let paramsObj = this.paramsFn();
        v.TableLoading = true;
        v.SearchDisabled = true;
        v.axios.post(api.transferSearchData, paramsObj).then(res => {
          v.TableLoading = false;
          v.SearchDisabled = false;
          if (res.data.code === 0) {
            this.data6 = v.processTimeData(res.data.datas.list, 'createdTime');
            this.totalRecords = res.data.datas.total;
          }
        });
        // this.getOutWareHouseName(); // 调出仓库的下拉列表
        // this.getIntoWareHouseName(); // 调入仓库的下拉列表
      } else {
        v.gotoError(); // 无权限
      }
    },
    allotSearch() {
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
    getOutWareHouseName() {
      // 获取调出仓库下拉列表
      var v = this;
      v.axios.get(api.selectAllotWareHouseName).then(res => {
        if (res.data.code === 0) {
          v.outWareHouseTypeList = res.data.datas;
          v.intoWareHouseTypeList = res.data.datas;
        }
      });
    }, // getIntoWareHouseName () { // 获取调入仓库下拉列表
    //   var v = this;
    //   var obj = {};
    //   v.axios.post(api.selectAllotWareHouseName, obj)
    //     .then(res => {
    //       if (res.data.code === 0) {
    //         v.intoWareHouseTypeList = res.data.datas;
    //       }
    //     });
    // },
    showCreateAdjustModal() {
      this.$store.commit('transferOrderShow', 'add');
    },
    checkPassBtn() {
      // 审核通过
      var v = this;
      var obj = {
        inventoryAllotNo: v.curObj.inventoryAllotNo,
        inventoryAllotId: v.curObj.inventoryAllotId
      };
      v.axios.post(api.checkTransferOrder, obj).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('审核成功！');
          v.searchData();
        }
      });
    }, // 重置按钮
    reset() {
      // this.checkSingleStatus('*');
      // this.pageParams.singleStatusFlag = '*';
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
<style lang="less" scoped>
.inventoryTransfer {
  height: 100%;
}
</style>
