<template>
  <div class="inventoryScanPage">
    <div class="listPage" v-show="$store.state.scanOrderShow === 'scan'">
      <div class="searchMain">
        <Form ref="pageParams" :model="pageParams" :label-width="80">
          <dyt-filter ref="dyt-filter" @expand="expand">
            <!-- 单据状态切换 -->
            <Form-item label="盘点状态:" prop="singleStatusFlag" class="notplatformParamsSelect">
              <dyt-select v-model="pageParams.singleStatusFlag">
                <Option v-for="d in singleStatusFlagList" :value="d.value" :key="d.value" :label="d.label"></Option>
              </dyt-select>
            </Form-item>
            <Form-item label="盘点结果:" prop="singleResultFlag" class="notplatformParamsSelect">
              <dyt-select v-model="pageParams.singleResultFlag">
                <Option v-for="d in singleResultFlagList" :value="d.value" :key="d.value + 'singleResultFlagList'"
                  :label="d.label"></Option>
              </dyt-select>
            </Form-item>
            <Form-item label="盘点单号:" prop="searchScanCode">
              <dyt-input placeholder="输入盘点单号" v-model.trim="pageParams.searchScanCode">
              </dyt-input>
            </Form-item>
            <Form-item label="创建时间:" prop="createTimeEedTime" class="date-picker-datetimerange">
              <DatePicker type="datetimerange" transfer placeholder="选择创建时间" style="width: 100%"
                v-model="pageParams.createTimeEedTime" format="yyyy-MM-dd HH:mm:ss" :options="datePickerOptions">
              </DatePicker>
            </Form-item>
            <Form-item label="盘点类型:" prop="isReplay">
              <dyt-select v-model="pageParams.isReplay">
                <Option v-for="d in isReplayList" :value="d.value" :key="d.value + 'isReplayList'" :label="d.label">
                </Option>
              </dyt-select>
            </Form-item>

            <div slot="operation">
              <Button type="primary" @click="scanSearch" :disabled="SearchDisabled" icon="md-search">查询</Button>
              <Button style="margin-left: 10px" @click="reset" v-once icon="md-refresh">重置
              </Button>
            </div>
          </dyt-filter>
        </Form>
      </div>

      <div class="funMain">
        <div class="funMain__flex">
          <!--新建盘点单按钮-->
          <div>
            <Button type="primary" icon="md-add" @click="addScanOrderBtn"
              :disabled="!getPermission('wmsInventoryCheck_create')">新建盘点单</Button>
            <Dropdown @on-click="exportHand" class="ml10">
              <Button type="primary" style="margin-right: 4px">
                <span class="icon iconfont" style="font-size: 12px"></span>导出
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name="check">导出选中数据</DropdownItem>
                <DropdownItem name="all">导出所有结果集</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <!--按添加时间或按仓库排序-->
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
            ref="selection" @on-selection-change="tableSelectionChange" />
        </div>
      </div>

      <!--分页按钮-->
      <div class="pagesMain">
        <Page :total="totalRecords" :current="pageParams.pageNum" @on-change="changePage" show-total
          :page-size="pageParams.pageSize" show-elevator show-sizer @on-page-size-change="changePageSize" placement="top"
          :page-size-opts="pageArray"></Page>
      </div>
    </div>

    <!-- 创建盘点单模态框弹框 -->
    <createScanOrder v-if="$store.state.scanOrderShow === 'add'" :curObj="curObj" :openScan="createScanDtl">
    </createScanOrder>
    <!-- 盘点单详情 -->
    <watchScanOrder v-if="$store.state.scanOrderShow === 'watch'" :curObj="curObj"></watchScanOrder>
    <!-- 新增盘点单模态框 -->
    <div v-if="showAddScanOrderModal">
      <Modal v-model="showAddScanOrderModal" :styles="{ top: '200px', width: '800px' }" class="headerBar" title="新增盘点单">
        <div class="content">
          <addScanOrder ref="createScanFlag" :openFlag="$store.state.addScanWatchFlag"></addScanOrder>
        </div>
        <div slot="footer">
          <Button type="primary" @click="createNewScanOrderBtn">生成盘点单</Button>
          <Button @click="cancelAddBtn">取消</Button>
        </div>
      </Modal>
    </div>
  </div>
</template>
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import createScanOrder from "./createScanOrder";
import watchScanOrder from "./watchScanOrder";
import addScanOrder from "./addScanOrder";
import tableHeight_mixin from "@/components/mixin/tableHeight_mixin";
import scan_mixin from "./scan_mixin";
import Big from "big.js";

export default {
  mixins: [Mixin, tableHeight_mixin, scan_mixin],
  components: {
    createScanOrder: createScanOrder, // 新建盘点单组件
    watchScanOrder: watchScanOrder, // 盘点单详情组件
    addScanOrder: addScanOrder,
  },
  data() {
    return {
      tableSltData: [],
      curObj: {},
      cacheClickVal: "CT", // 排序缓存值
      showAddScanOrderModal: false, // 新增盘点单模态框
      wareHouseTypeList: [], // 仓库类型下拉选框
      wareId: this.getWarehouseId(), // 单据状态选择
      singleStatusFlagList: [
        {
          label: "待盘点",
          value: "0",
          checked: false,
        },
        {
          label: "盘点中",
          value: "1",
          checked: false,
        },
        {
          label: "提交盘点",
          value: "3",
          checked: false,
        },
        {
          label: "盘点完成",
          value: "2",
          checked: false,
        },
      ],
      singleResultFlagList: [
        {
          label: "盘平",
          value: "0",
          checked: false,
        },
        {
          label: "有差异",
          value: "1",
          checked: false,
        },
      ],
      sortButtonList: [
        {
          sortHeader: "按添加时间",
          sortField: "CT",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "按盘点状态",
          sortField: "AS",
          sortType: "DESC",
        },
      ],
      datePickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            value: () => {
              const end = new Date();
              return [new Date(this.$common.dayjs(end).add(-7, "day")), end];
            },
          },
          {
            text: "最近一个月",
            value: () => {
              const end = new Date();
              return [new Date(this.$common.dayjs(end).add(-1, "month")), end];
            },
          },
          {
            text: "最近三个月",
            value: () => {
              const end = new Date();
              return [new Date(this.$common.dayjs(end).add(-3, "month")), end];
            },
          },
        ],
      },

      pageParams: {
        singleStatusFlag: "", // 盘点状态
        singleResultFlag: "", // 盘点结果
        searchScanCode: "", // 输入调整单号
        // 盘点创建时间范围
        createTimeEedTime: this.defaultTime(),
        isReplay: null,
        DESC: "DESC", // 降序
        CT: "CT", // 排序的标记
        pageNum: 1, // 默认第一页
        pageSize: 10, // 规定每页显示 10 条数据
      },
      totalRecords: 0, // 共有多少条
      columns7: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "盘点单编号",
          key: "inventoryCheckNo",
          align: "center",
          minWidth: 100,
          render: function (h, params) {
            if (this.getPermission("wmsInventoryCheck_detail")) {
              return h(
                "a",
                {
                  style: {
                    display: "inline-block",
                    width: "100%",
                    height: "100%",
                  },
                  on: {
                    click: function () {
                      this.curObj = params.row; // 获取当前表格行的数据
                      this.$store.commit("scanOrderShow", "watch");
                    }.bind(this),
                  },
                },
                params.row.inventoryCheckNo
              );
            } else {
              return h("div", params.row.inventoryCheckNo);
            }
          }.bind(this),
        },
        {
          title: "盘点类型",
          key: "checkSkuNum",
          align: "center",
          width: 80,
          render: (h, params) => {
            let str = "盘点单";
            if (params.row.isReplay == 1) {
              str = "复盘单";
            }
            return h("div", str);
          },
        },
        {
          title: "盘点货品数量",
          key: "checkSkuNum",
          align: "center",
          minWidth: 80,
        },
        {
          title: "盘点开始时间",
          key: "checkStartTime",
          width: 140,
          align: "center",
        },
        {
          title: "盘点结束时间",
          key: "checkEndTime",
          width: 140,
          align: "center",
        },
        {
          title: "盘点人员",
          key: "checkUserName",
          align: "center",
          minWidth: 90,
        },
        {
          title: "盘点状态",
          key: "checkStatus",
          align: "center",
          minWidth: 70,
          render: (h, { row }) => {
            let statusList = this.$common.arrayToObj(this.singleStatusFlagList);
            return h(
              "div",
              statusList[row.checkStatus] && statusList[row.checkStatus].label
            );
          },
        },
        {
          title: "盘点进度",
          align: "center",
          minWidth: 160,
          render: (h, { row }) => {
            // 进度条颜色≤30 红色wrong，≤80蓝色normal，>80绿色success，=0空
            let checkRate = row.checkRate || 0;
            if (row.checkRate < 0) checkRate = 0;
            if (row.checkRate > 1) checkRate = 1;
            checkRate = Math.round(new Big(checkRate).times(100));
            let status = "normal";
            if (checkRate <= 30) status = "wrong";
            if (checkRate > 80) status = "success";
            return h(
              "Progress",
              {
                props: {
                  percent: checkRate,
                  status: status,
                },
              },
              [
                h(
                  "div",
                  {
                    slot: "default",
                  },
                  checkRate + "%"
                ),
              ]
            );
          },
        },
        {
          title: "盘点结果",
          key: "checkResult",
          align: "center",
          minWidth: 60,
          render: (h, params) => {
            if (params.row.checkResult === 0) {
              return h(
                "span",
                {
                  style: {
                    color: "green",
                  },
                },
                "盘平"
              );
            } else if (params.row.checkResult === 1) {
              return h(
                "span",
                {
                  style: {
                    color: "red",
                  },
                },
                "有差异"
              );
            }
          },
        },
        {
          title: "创建时间",
          key: "createdTime",
          width: 80,
          align: "center",
        },
        {
          title: "分配数量",
          key: "allottedNumber",
          align: "center",
          minWidth: 60,
        },
        {
          title: "冻结数量",
          key: "frozenNumber",
          align: "center",
          minWidth: 60,
        },
        {
          title: "可用数量",
          key: "availableNumber",
          align: "center",
          minWidth: 60,
        },
        {
          title: "操作",
          key: "action",
          fixed: "right",
          width: 100,
          align: "center", // width: 300,
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                },
              },
              [
                h(
                  "Button",
                  {
                    props: {
                      type: "primary",
                      size: "small",
                      disabled: !this.getPermission("wmsInventoryCheck_modify"),
                    },
                    style: {
                      display: !["0"].includes(params.row.checkStatus)
                        ? "none"
                        : "block",
                      margin: "4px 0",
                    },
                    on: {
                      click: () => {
                        this.curObj = params.row;
                        this.checkPassBtn();
                      },
                    },
                  },
                  "开始盘点"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "success",
                      size: "small",
                      disabled: !this.getPermission(
                        "wmsInventoryCheck_complete"
                      ),
                    },
                    style: {
                      display: !["1", "3"].includes(params.row.checkStatus)
                        ? "none"
                        : "block",
                      margin: "4px 0",
                    },
                    on: {
                      click: () => {
                        // this.curObj = params.row; // 获取当前表格行的数据
                        // this.$store.commit('scanOrderShow', 'watch');
                        let v = this;
                        let obj = {
                          blindFlag: params.row.blindFlag, // 盲盘
                          inventoryCheckNo: params.row.inventoryCheckNo, // 库存盘点单编号
                        };
                        v.inventDifferenceModal(params.row).then((data) => {
                          obj.createAdjustBol = data.isCheck;
                          obj.createReplayBol = data.isAgain;
                          v.axios.post(api.carryScan, obj).then((res) => {
                            if (res.data.code === 0) {
                              v.$Message.success("成功完成盘点");
                              v.searchData();
                            } else if (res.data.code === -1) {
                              v.$Message.info({
                                content: "盘点数量不能为空",
                                duration: 3,
                              });
                            } else if (res.data.code === -2) {
                              v.$Message.info({
                                content: "盘点数量不能小于0",
                                duration: 3,
                              });
                            }
                          });
                        });
                      },
                    },
                  },
                  "完成盘点"
                ),
                h(
                  "Button",
                  {
                    props: {
                      size: "small",
                      icon: "ios-eye",
                      disabled: !this.getPermission("wmsInventoryCheck_detail"),
                    },
                    style: {
                      display: "block",
                      margin: "4px 0",
                    },
                    on: {
                      click: () => {
                        this.curObj = params.row; // 获取当前表格行的数据
                        this.$store.commit("scanOrderShow", "watch");
                      },
                    },
                  },
                  "查看"
                ),
              ]
            );
          },
        },
      ],
      data6: [],
      scanDetailDataList: [], // 接收详情里面的数据
      createScanDtl: {},

      isReplayList: {
        0: { label: "盘点单", value: 0 },
        1: { label: "复盘单", value: 1 },
      },
    };
  },
  //   computed: {
  //     tableHeight () {
  //       return this.getTableHeight(295);
  //     }
  //   },
  watch: {
    "$store.state.scanOrderShow": function (add) {
      // 创建盘点单成功
      if (add) {
        this.searchData();
      }
      if (add === "scan") {
        this.$nextTick(() => {
          this.computedTableHeight();
        });
      }
    },
  },
  created() {
    // this.searchData();
  },
  methods: {
    defaultTime() {
      let dayjs = this.$common.dayjs();
      const startTime =
        dayjs.subtract(6, "day").format("YYYY-MM-DD") + " 00:00:00";
      const endTime = dayjs.format("YYYY-MM-DD") + " 23:59:59";
      return [startTime, endTime];
    },
    createNewScanOrderBtn() {
      // 生成盘点单按钮
      let v = this;
      let obj = this.$refs.createScanFlag.getScanParams();
      let newConditions = v.$refs.createScanFlag.newConditions;
      if (obj && !obj.warehouseId) {
        this.$Message.info({
          content: "盘点仓库不能为空",
          duration: 4,
        });
        return;
      }
      let validObj = JSON.parse(obj.scopeCondition);
      if (newConditions.indexOf(1) > -1) {
        if (validObj.goodsSkuList === null) {
          v.$Message.error("产品sku不能为空！");
          return;
        }
      }
      if (newConditions.indexOf(2) > -1) {
        if (!validObj.fromWarehouseBlockId || !validObj.toWarehouseBlockId) {
          v.$Message.error("库区请填写完整");
          return;
        }
        if (
          validObj.fromWarehouseLocationId ||
          validObj.toWarehouseLocationId
        ) {
          if (
            validObj.fromWarehouseLocationId &&
            validObj.toWarehouseLocationId
          ) {
          } else {
            v.$Message.error("库位请填写完整");
            return;
          }
        }
      }
      if (newConditions.indexOf(3) > -1) {
        if (validObj.beginDate === null) {
          v.$Message.error("请勾选动态盘点!");
          return;
        }
      }

      v.axios.post(api.createScanOrder, obj).then((res) => {
        if (res.data.code === 0) {
          v.$store.commit("scanOrderShow", "add");
          v.createScanDtl = res.data.datas;
          v.showAddScanOrderModal = false;
          v.$store.commit("addScanWatchFlag", true);
        } else if (res.data.code === -1) {
          v.$Message.info({
            content: "请选择To库区",
            duration: 3,
          });
        } else if (res.data.code === -2) {
          v.$Message.info({
            content: "请选择To库位",
            duration: 3,
          });
        } else if (res.data.code === -3) {
          v.$Message.info({
            content: "请选择结束日期",
            duration: 3,
          });
        } else if (res.data.code === -4) {
          v.$Message.info({
            content: "此规则下的产品没有对应的库存",
            duration: 3,
          });
        }
        // else {
        //   v.$Message.warning('生成盘点单失败');
        // }
      });
    },
    cancelAddBtn() {
      // 取消新增盘点单
      let v = this;
      v.showAddScanOrderModal = false;
      v.$store.commit("addScanWatchFlag", false);
      v.$Message.info("取消创建盘点单");
    },
    // checkSingleStatus: function (value) {
    //   // 选择盘点状态按钮切换
    //   this.singleStatusFlagList.forEach(function (n) {
    //     n.checked = n.value === value;
    //   });
    //   this.pageParams.singleStatusFlag = value;
    // },
    // checkSingleResult: function (value) {
    //   // 选择盘点结果按钮切换
    //   this.singleResultFlagList.forEach(function (n) {
    //     n.checked = n.value === value;
    //   });
    //   this.pageParams.singleResultFlag = value;
    // },
    getSearchParamsObj() {
      const deleteKey = [
        "createTimeEedTime",
        "searchScanCode",
        "singleStatusFlag",
        "singleResultFlag",
        "DESC",
        "CT",
      ];
      let paramsObj = this.$common.removeEmpty(this.pageParams);
      paramsObj.orderSeq = paramsObj.DESC;
      paramsObj.orderBy = paramsObj.CT;
      paramsObj.inventoryCheckNo = paramsObj.searchScanCode;
      paramsObj.warehouseId = this.wareId;
      paramsObj.checkStatus = paramsObj.singleStatusFlag;
      paramsObj.checkResult = paramsObj.singleResultFlag;
      if (!this.$common.isEmpty(this.pageParams.createTimeEedTime)) {
        if (!this.$common.isEmpty(this.pageParams.createTimeEedTime[0])) {
          paramsObj.startCreatedTime = this.$common
            .dayjs(this.pageParams.createTimeEedTime[0])
            .format("YYYY-MM-DD HH:mm:ss");
        }
        if (!this.$common.isEmpty(this.pageParams.createTimeEedTime[1])) {
          paramsObj.endCreatedTime = this.$common
            .dayjs(this.pageParams.createTimeEedTime[1])
            .format("YYYY-MM-DD HH:mm:ss");
        }
      }
      deleteKey.forEach((key) => {
        delete paramsObj[key];
      });
      return paramsObj;
    },
    searchData() {
      // 查询功能
      this.pageParams.pageSize = this.getPageSizeCache();
      if (this.getPermission("wmsInventoryCheck_list")) {
        const paramsObj = this.getSearchParamsObj();
        this.TableLoading = true;
        this.SearchDisabled = true;
        this.axios.post(api.scanListSearchData, paramsObj).then((res) => {
          this.TableLoading = false;
          this.SearchDisabled = false;
          if (res.data.code === 0) {
            this.data6 = this.processTimeData(res.data.datas.list, [
              "createdTime",
              "checkStartTime",
              "checkEndTime",
            ]);
            this.totalRecords = res.data.datas.total;
          }
        });
        // this.getWareHouseName(); // 调用仓库下拉列表
      } else {
        this.gotoError(); // 无权限
      }
    },
    scanSearch() {
      // 页面查询
      this.pageParams.pageNum = 1; // 点击查询按钮将页码重置为1
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
      this.axios.post(api.selectScanWareHouseName).then((res) => {
        if (res.data.code === 0) {
          v.wareHouseTypeList = res.data.datas;
        }
      });
    },
    addScanOrderBtn() {
      // 新增盘点单
      this.showAddScanOrderModal = true;
    },
    checkPassBtn() {
      // 开始盘点
      var v = this;
      v.axios
        .post(
          api.startScan +
          "?inventoryCheckNo=" +
          v.curObj.inventoryCheckNo +
          "&warehouseId=" +
          v.curObj.warehouseId
        )
        .then((res) => {
          if (res.data.code === 0) {
            this.$Message.success("开始盘点成功");
            v.searchData();
          }
        });
    }, // 重置按钮
    reset() {
      //   this.checkSingleResult('*');
      //   this.checkSingleStatus('*');
      // this.defaultTime()
      this.$refs["pageParams"].resetFields();
    },
    tableSelectionChange(selection) {
      this.tableSltData = selection;
    },
    exportHand(name) {
      let paramsObj = this.getSearchParamsObj();
      delete paramsObj.pageSize;
      delete paramsObj.pageNum;
      if (["check"].includes(name)) {
        if (this.tableSltData.length === 0) {
          this.$Message.warning("请选择导出数据");
          return;
        }
        paramsObj["inventoryCheckNoList"] = this.tableSltData.map(
          (m) => m.inventoryCheckNo
        );
        this.exportData(paramsObj, name);
        return;
      }
      this.exportData(paramsObj);
    },
    // 导出
    exportData(paramsObj, name) {
      this.axios.post(api.exportInventoryCheck, paramsObj).then((res) => {
        if (res.data && res.data.code === 0) {
          this.$Message.success("导出成功!");
          ["check"].includes(name) && this.searchData();
        }
      });
    },
  },
};
</script>
<style>
.headerBar .ivu-modal-header p,
.headerBar .ivu-modal-header-inner {
  color: #fff;
}
</style>
<style lang="less">
.inventoryScanPage {
  height: 100%;
  .ivu-progress {
    display: flex;
    align-items: center;

    .ivu-progress-outer {
      padding-right: 0;
      margin-right: 0;
      flex: 1;
      overflow: hidden;
    }

    .ivu-progress-text {
      width: 34px;
    }

    .ivu-progress-inner {
      background: #e8eaec;
    }
  }
}
</style>
