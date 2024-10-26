<template>
  <div class="inventoryAdjust">
    <div class="listPage" v-show="$store.state.adjustOrderShow === 'adjust'">
      <div class="searchMain">
        <Form ref="pageParams" :model="pageParams" :label-width="80">
          <!-- 单据状态切换 -->
          <dyt-filter ref="dyt-filter" @expand="expand">
            <Form-item label="单据状态：" class="notplatformParamsSelect" prop="singleStatusFlag">
              <dyt-select v-model="pageParams.singleStatusFlag">
                <Option v-for="d in singleStatusFlagList" :value="d.value" :key="d.value" :label="d.label"></Option>
              </dyt-select>
            </Form-item>
            <Form-item label="调整单号：" prop="searchAdjustCode">
              <dyt-input placeholder="输入调整单号" v-model.trim="pageParams.searchAdjustCode" />
            </Form-item>
            <Form-item label="创建时间：" prop="createTime">
              <DatePicker type="daterange" transfer placeholder="选择日期" style="width:100%"
                v-model="pageParams.createTime" />
            </Form-item>
            <Form-item label="创建人：" prop="createrIdList">
              <dyt-select v-model="pageParams.createrIdList" multiple :max-tag-count="1">
                <Option v-for="item in createrList" :value="item.value" :key="item.value" :label="item.label"></Option>
              </dyt-select>
            </Form-item>
            <div slot="operation">
              <Button type="primary" @click="adjustSearch" :disabled="SearchDisabled" icon="md-search">查询</Button>
              <Button style="margin-left: 10px;" @click="reset" v-once icon="md-refresh">重置 </Button>
            </div>
          </dyt-filter>
        </Form>
      </div>

      <div class="funMain">
        <div class="funMain__flex">
          <!--新建调整单按钮-->
          <div>
            <Button type="primary" class="fl mr10" icon="md-add" @click="showCreateAdjustModal"
              :disabled="!getPermission('wmsInventoryAdjust_create')">新建调整单 </Button>
            <div class="fl">
              <Button type="primary" class="fl mr10" @click="openInportModal" icon="md-archive"
                :disabled="!getPermission('wmsInventoryAdjust_import')">导入 </Button>
              <Dropdown @on-click="exportAllOrSlt" class="fl">
                <Button type="primary"><span class="icon iconfont" style="font-size: 12px">&#xe639;</span> 导出
                  <Icon type="md-arrow-dropdown"></Icon>
                </Button>
                <DropdownMenu slot="list">
                  <DropdownItem name="0" v-if="getPermission('wmsInventoryAdjust_export_batch')">导出选中数据
                  </DropdownItem>
                  <DropdownItem name="1" v-if="getPermission('wmsInventoryAdjust_export_all')">导出所有结果集
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
          <!--按 添加时间 或 按仓库 排序-->
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>

      <div class="tableMain">
        <div class="tableBox">
          <!--表格-->
          <Table highlight-row border :height="tableHeight" :loading="TableLoading" :columns="columns7" :data="data6"
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

    <!-- 创建调整单模态框弹框 -->
    <createAdjustOrder v-if="$store.state.adjustOrderShow === 'add'"></createAdjustOrder>
    <!-- 调整单详情 -->
    <watchAdjustOrder v-if="$store.state.adjustOrderShow === 'watch'" :curObj="curObj"
      :openFlag="$store.state.adjustDetailWatchFlag"></watchAdjustOrder>
    <!--导入前的模态框  -->
    <Modal v-model="switchInportModal" :styles="{ top: '80px', width: '520px' }" class="headerBar" title="导入">
      <inportBeforeDownload @insertSuccess="switchInportModal = false" :importUrl="importUrl" :headObj="headObj"
        :wareId="wareId" :dimension="true"></inportBeforeDownload>
      <div slot="footer">
        <Button @click="cancelInport">取消</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import createAdjustOrder from './createAdjustOrder';
import inportBeforeDownload from '../wms-inWareManage/inportBeforeDownload';
import watchAdjustOrder from './watchAdjustOrder';
// import { getToken } from '@/utils/cookie';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';

export default {
  mixins: [Mixin, tableHeight_mixin],
  components: {
    createAdjustOrder, // 新建移动单组件
    watchAdjustOrder,
    inportBeforeDownload
  },
  data() {
    var self = this;
    return {
      curObj: {},
      switchInportModal: false,
      // cacheClickVal: 'CT', // 排序缓存值
      wareHouseTypeList: [], // 仓库类型下拉选框
      // 单据状态选择
      singleStatusFlagList: [
        // {
        //   label: '全部',
        //   value: '*',
        //   checked: true
        // },
        {
          label: '已创建',
          value: '1',
          checked: false
        },
        {
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
      wareId: this.getWarehouseId(),
      pageParams: {
        singleStatusFlag: '', // 单据状态
        searchAdjustCode: '', // 输入调整单号
        DESC: 'DESC', // 降序
        CT: 'CT', // 排序的标记
        pageNum: 1, // 默认第一页
        pageSize: 10, // 规定每页显示 10 条数据
        createTime: '',
        createrIdList: [] // 创建人
      },
      totalRecords: 0, // 共有多少条
      columns7: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '调整单编号',
          key: 'inventoryAdjustNo',
          width: 220,
          align: 'center',
          render: function (h, params) {
            if (this.getPermission('wmsInventoryAdjust_detail')) {
              return h(
                'a',
                {
                  style: {
                    display: 'inline-block',
                    width: '100%',
                    height: '100%'
                  },
                  on: {
                    click: function () {
                      this.curObj = params.row; // 获取当前表格行的数据
                      this.$store.commit('adjustOrderShow', 'watch');
                      self.$nextTick(() => {
                        self.$store.commit('adjustDetailWatchFlag', true);
                      });
                    }.bind(this)
                  }
                },
                params.row.inventoryAdjustNo
              );
            } else {
              return h('div', params.row.inventoryAdjustNo);
            }
          }.bind(this)
        }, //        {
        //          title: '仓库',
        //          key: 'warehouseName',
        //          width: 160,
        //          align: 'center'
        //        },
        {
          title: '状态',
          key: 'adjustStatus',
          align: 'center',
          render: (h, params) => {
            if (params.row.adjustStatus === '0') {
              return h('div', {}, '待审核');
            } else if (params.row.adjustStatus === '1') {
              return h('div', {}, '待执行');
            } else if (params.row.adjustStatus === '2') {
              return h('div', {}, '已完成');
            }
          }
        },
        {
          title: '参考编号',
          key: 'referenceNo',
          align: 'center'
        },
        {
          title: '调整SKU数量',
          key: 'adjustSkuNum',
          align: 'center'
        },
        {
          title: '创建人',
          key: 'createdBy',
          align: 'center'
        },
        {
          title: '审核人',
          key: 'auditUserId',
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
          fixed: 'right',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small',
                    icon: 'md-checkmark',
                    disabled: !this.getPermission(
                      'wmsInventoryAdjust_modifyExamine'
                    )
                  },
                  style: {
                    marginRight: '10px',
                    display:
                      params.row.adjustStatus === '1'
                        ? 'none'
                        : params.row.adjustStatus === '2'
                          ? 'none'
                          : params.row.adjustSkuNum === 0
                            ? 'none'
                            : 'inline'
                  },
                  on: {
                    click: () => {
                      this.curObj = params.row;
                      this.checkPassBtn();
                    }
                  }
                },
                '审核通过'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'success',
                    size: 'small',
                    icon: 'md-hammer',
                    disabled: !this.getPermission(
                      'wmsInventoryAdjust_modifyImplement'
                    )
                  },
                  style: {
                    marginRight: '10px',
                    display:
                      params.row.adjustStatus === '0'
                        ? 'none'
                        : params.row.adjustStatus === '2'
                          ? 'none'
                          : params.row.adjustSkuNum === 0
                            ? 'none'
                            : 'inline'
                  },
                  on: {
                    click: () => {
                      this.curObj = params.row;
                      this.carryAdjustBtn();
                    }
                  }
                },
                '执行调整'
              ),
              h(
                'Button',
                {
                  props: {
                    size: 'small',
                    icon: 'ios-eye',
                    disabled: !this.getPermission('wmsInventoryAdjust_detail')
                  },
                  on: {
                    click: () => {
                      this.curObj = params.row; // 获取当前表格行的数据
                      this.$store.commit('adjustOrderShow', 'watch');
                      self.$nextTick(() => {
                        self.$store.commit('adjustDetailWatchFlag', true);
                      });
                    }
                  }
                },
                '查看'
              )
            ]);
          }
        }
      ],
      data6: [],
      importUrl: api.importAdjust,
      tableSltData: [],

      createrList: [],
      isrequest: false
    };
  },
  watch: {
    '$store.state.adjustOrderShow': function (add) {
      if (add) {
        this.searchData();
      }
    }
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
  created() {
    this.searchData();
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
    }, // 导入
    beforeUp() { },
    uploadSuccess(res, file, fileList) {
      if (res.code === 0) {
        this.$Message.success('导入成功');
      }
    },
    uploadError() { },
    exportFn(obj) {
      this.axios.post(api.exportAdjust, obj).then((res) => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
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
        obj.inventoryAdjustNos = this.tableSltData.map(
          (val) => val.inventoryAdjustNo
        );
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
          ...this.paramsFn(),
          exportType: '1',
          warehouseId: this.wareId
        };
        this.exportFn(obj2);
      }
    },
    paramsFn() {
      var v = this;
      this.pageParams.pageSize = this.getPageSizeCache();
      var paramsObj = {
        pageNum: this.pageParams.pageNum,
        pageSize: this.pageParams.pageSize,
        orderSeq: this.pageParams.DESC,
        orderBy: this.pageParams.CT,
        warehouseId: this.wareId,
        startCreatedTime: this.pageParams.createTime[0]
          ? this.$uDate.getUniversalTime(
            this.pageParams.createTime[0],
            'fulltime'
          )
          : null,
        endCreatedTime: this.pageParams.createTime[1]
          ? this.$uDate.getUniversalTime(
            this.pageParams.createTime[1],
            'fulltime'
          )
          : null,
        createrIdList: this.pageParams.createrIdList
      };
      if (v.pageParams.singleStatusFlag) { paramsObj.adjustStatus = v.pageParams.singleStatusFlag; } // 单据状态
      if (v.pageParams.searchAdjustCode) {
        paramsObj.inventoryAdjustNo = v.pageParams.searchAdjustCode;
      } // 输入调整单号
      return paramsObj;
    },
    // checkSingleStatus: function (value) {
    //   // 选择单据状态按钮切换
    //   this.singleStatusFlagList.forEach(function (n) {
    //     n.checked = n.value === value;
    //   });
    //   this.pageParams.singleStatusFlag = value;
    // },
    searchData() {
      // 查询功能
      let v = this;
      v.TableLoading = true;
      v.SearchDisabled = true;
      if (v.getPermission('wmsInventoryAdjust_query')) {
        v.getCreateList();

        let paramsObj = this.paramsFn();
        v.axios.post(api.adjustListSearchData, paramsObj).then((res) => {
          v.TableLoading = false;
          v.SearchDisabled = false;
          if (res.data.code === 0) {
            this.data6 = v.processTimeData(res.data.datas.list, 'createdTime');
            this.totalRecords = res.data.datas.total;
          }
        });
        // this.getWareHouseName(); // 调用仓库下拉列表
      } else {
        v.gotoError(); // 无权限
      }
    },
    adjustSearch() {
      // 页面查询
      this.pageParams.pageNum = 1;
      this.searchData();
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.DESC = type;
      this.pageParams.CT = feild;
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
      var obj = {};
      v.axios.get(api.selectAdjustWareHouseName, obj).then((res) => {
        if (res.data.code === 0) {
          v.wareHouseTypeList = res.data.datas;
        }
      });
    },
    showCreateAdjustModal() {
      this.$store.commit('adjustOrderShow', 'add');
    },
    carryAdjustBtn() {
      // 执行调整成功
      var v = this;
      v.axios
        .get(
          api.carryAdjustOrder +
          '?inventoryAdjustNo=' +
          v.curObj.inventoryAdjustNo
        )
        .then((res) => {
          if (res.data.code === 0) {
            this.$Message.success('库存调整成功');
            this.searchData();
          } else if (res.data.code === -999) {
            v.$Message.info({
              content: '该调整单正处于盘点状态，无法执行该操作',
              duration: 4
            });
          }
        });
    },
    checkPassBtn() {
      // 审核通过
      var v = this;
      var obj = {
        inventoryAdjustNo: v.curObj.inventoryAdjustNo,
        inventoryAdjustId: v.curObj.inventoryAdjustId
      };
      v.axios.post(api.checkAdjustOrder, obj).then((res) => {
        if (res.data.code === 0) {
          v.$Message.success('审核通过');
          v.searchData();
        } else if (res.data.code === -1) {
          v.$Message.info({
            content:
              '调整数量不能小于分配数量和冻结数量两者相加之和(请检查输入数据或sku实际库存)',
            duration: 8
          });
        }
      });
    }, // 重置按钮
    reset() {
      //   this.checkSingleStatus('*');
      // this.pageParams.singleStatusFlag = '*';
      this.$refs['pageParams'].resetFields();
    },
    // 获取创建人数据列表
    getCreateList() {
      if (this.isrequest) return;
      this.isrequest = true;
      this.axios.post(api.post_queryCreaterId, {}).then((res) => {
        let obj = res.data.datas || {};
        Object.keys(obj).forEach((k) => {
          this.createrList.push({ label: obj[k], value: k });
        });
      });
    }
  }
};
</script >
<style scoped >
.headerBar .ivu-modal-header p,
.headerBar .ivu-modal-header-inner {
  color: #fff;
}
</style >
<style lang="less" scoped>
.inventoryAdjust {
  height: 100%;
}
</style>
