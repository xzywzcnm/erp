<template >
  <div class="inventoryFreezePage">
    <div class="listPage">
      <div class="searchMain">
        <Form ref="pageParams" :model="pageParams" :label-width="100">
          <Form-item label="状态：" class="ignore-width" prop="frozenStatus">
            <RadioGroup v-model="pageParams.frozenStatus" type="button" button-style="solid" @on-change="frozenSearch">
              <Radio :label="item.value" v-for="(item, index) in statusList" :key="index + 'frozenStatus'">
                {{ item.label }}
              </Radio>
            </RadioGroup>
          </Form-item>
          <dyt-filter ref="dyt-filter" @expand="expand">
            <Form-item label="冻结单号：" prop="inventoryFrozenNos">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.inventoryFrozenNos" />
            </Form-item>
            <Form-item label="SKU：" prop="skuList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.skuList" />
            </Form-item>
            <Form-item label="创建时间：">
              <DatePicker type="datetimerange" transfer placeholder="选择日期" format="yyyy-MM-dd HH:mm:ss"
                @on-change="setTime" v-model="createTime" />
            </Form-item>
            <Form-item label="入库单号：" prop="receiptNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.receiptNoList" />
            </Form-item>
            <Form-item label="采购单号：" prop="purchaseNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.purchaseNoList" />
            </Form-item>
            <Form-item label="备货计划：" prop="planNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.planNoList" />
            </Form-item>
            <Form-item label="创建人：" prop="createdByList">
              <dyt-select v-model="pageParams.createdByList" :multiple="true" :max-tag-count="1">
                <Option v-for="item in $store.getters.userInfoList || []" :key="item.userId" :label="item.userName"
                  :value="item.userId"></Option>
              </dyt-select>
            </Form-item>
            <Form-item label="所属事业部：" prop="businessDeptIdList">
              <dyt-select :multiple="true" :max-tag-count="1" v-model="pageParams.businessDeptIdList">
                <Option v-for="(item, index) in businessDeptList" :value="item.id" :key="`${index}-${item.id}`"
                  :label="item.name"></Option>
              </dyt-select>
            </Form-item>
            <Form-item label="冻结方式：" prop="frozenType">
              <dyt-select v-model="pageParams.frozenType">
                <Option v-for="(item, index) in frozenTypeList" :value="item.value" :key="index + 'frozenType'"
                  :label="item.label"></Option>
              </dyt-select>
            </Form-item>
            <Form-item label="已冻结天数：" prop="alreadyFrozenDay">
              <dyt-input placeholder="大于或等于" v-model.trim="pageParams.alreadyFrozenDay" />
            </Form-item>
            <Form-item label="冻结剩余天数：" prop="surplusFrozenDay">
              <dyt-input placeholder="小于或等于" v-model.trim="pageParams.surplusFrozenDay" />
            </Form-item>
            <div slot="operation">
              <Button type="primary" @click="frozenSearch" icon="md-search">查询</Button>
              <Button class="ml10" @click="reset" v-once icon="md-refresh">重置
              </Button>
            </div>
          </dyt-filter>
        </Form>
      </div>

      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <Button type="primary" class="mr10" @click="showCreateAdjustModal()"
              :disabled="!getPermission('wmsInventoryFrozen_create')">新建冻结单</Button>
            <Button type="primary" class="mr10" @click="openInportModal"
              :disabled="!getPermission('wmsInventoryFrozen_import')">导入</Button>
            <Button type="primary" class="mr10" @click="mulUnfreeze" :disabled="freezeStatus"
              v-if="getPermission('wmsInventoryFrozen_batchCancelFrozen')" title="已冻结/部分解冻 状态可操作">
              批量解除冻结
            </Button>
            <Dropdown @on-click="exportAllOrSlt">
              <Button type="primary" style="margin-right: 4px">
                导出
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name="0" v-if="getPermission('wmsInventoryFrozen_export_batch')">导出选中数据</DropdownItem>
                <DropdownItem name="1" v-if="getPermission('wmsInventoryFrozen_export_all')">导出所有结果集</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Alert style="display: inline-block; padding: 8px; margin: 0 0 0 10px">
              提示：自动冻结的冻结天数为：30天，执行冻结的天数到达冻结天数后，冻结单将自动解冻，释放库存
            </Alert>
          </div>
          <div>
            <dyt-sortBySelect :sortButtonList="sortData" @sortInfo="getSortInfoAndFetch">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>

      <!--表格-->
      <div class="tableMain">
        <div class="tableBox">
          <Table highlight-row border :height="tableHeight" :columns="columns" :loading="TableLoading" :data="data6"
            ref="selection" @on-selection-change="tableSelectionChange" class="tableCellPadding6"></Table>
        </div>
      </div>

      <!--分页按钮-->
      <div class="pagesMain">
        <Page :total="totalRecords" :current="pageParams.pageNum" @on-change="changePage" show-total
          :page-size="pageParams.pageSize" show-elevator show-sizer @on-page-size-change="changePageSize" placement="top"
          :page-size-opts="pageArray"></Page>
      </div>
    </div>
    <!-- 冻结单 -->
    <freezeOrderDetail :dialogVisible.sync="freezeInfo.visible" :dialogData="freezeInfo.data" @search="frozenSearch" />
    <!--导入前的模态框  -->
    <Modal v-model="switchInportModal" :styles="{ top: '80px', width: '520px' }" class="headerBar" title="导入">
      <inportBeforeDownload @insertSuccess="switchInportModal = false" :importUrl="importUrl" :headObj="headObj"
        :wareId="wareId" templateTypes="4"></inportBeforeDownload>
      <div slot="footer">
        <Button @click="cancelInport">取消</Button>
      </div>
    </Modal>
    <!-- 解除冻结 -->
    <unfreezeModel :modelVisible.sync="unfreezeInfo.visible" :list="tableSltData" @search="searchData">
    </unfreezeModel>
  </div>
</template>
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import inportBeforeDownload from "../wms-inWareManage/inportBeforeDownload";
import tableHeight_mixin from "@/components/mixin/tableHeight_mixin";
import unfreezeModel from "./inventoryFreeze/unfreezeModel";
import freezeOrderDetail from "./inventoryFreeze/freezeOrderDetail";
import { statusList, frozenTypeList } from "./inventoryFreeze/fileData.js";

export default {
  mixins: [Mixin, tableHeight_mixin],
  components: {
    inportBeforeDownload,
    unfreezeModel,
    freezeOrderDetail,
  },
  data() {
    var self = this;
    return {
      curObj: {},
      switchInportModal: false,
      cacheClickVal: "CT", // 排序缓存值
      statusList: statusList,
      frozenTypeList: frozenTypeList,
      // 排序的数据
      sortData: [
        {
          sortHeader: "按状态",
          sortField: "AS",
          sortType: "DESC",
        },
        {
          sortHeader: "按冻结单号",
          sortField: "IFN",
          sortType: "DESC",
        },
        {
          sortHeader: "按创建时间",
          sortField: "CT",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "按创建人",
          sortField: "CB",
          sortType: "DESC",
        },
        {
          sortHeader: "按SKU",
          sortField: "GS",
          sortType: "DESC",
        },
        {
          sortHeader: "按入库单号",
          sortField: "RN",
          sortType: "DESC",
        },
        {
          sortHeader: "按所属事业部",
          sortField: "BDI",
          sortType: "DESC",
        },
      ],
      wareId: this.getWarehouseId(),
      createTime: [],
      pageParams: {
        frozenStatus: "",
        inventoryFrozenNos: [],
        skuList: [],
        receiptNoList: [],
        purchaseNoList: [],
        planNoList: [],
        createdByList: [],
        businessDeptIdList: [],
        frozenType: "",
        alreadyFrozenDay: "",
        surplusFrozenDay: "",
        startCreatedTime: "",
        endCreatedTime: "",
        orderSeq: "DESC", // 降序
        orderBy: "CT", // 排序的标记
        pageNum: 1, // 默认第一页
        pageSize: 10, // 规定每页显示 10 条数据
      },
      totalRecords: 0, // 共有多少条
      columns: [
        {
          type: "selection",
          width: 50,
          align: "center",
        },
        {
          title: "冻结单编号",
          key: "inventoryFrozenNo",
          width: 154,
          render: function (h, { row }) {
            const power = self.getPermission("wmsInventoryFrozen_detail");
            let styles = {};
            if (power) {
              styles = {
                textDecoration: "underline",
                color: "#2d8cf0",
                cursor: "pointer",
              };
            }
            let list = [
              h(
                "div",
                {
                  style: {
                    padding: "4px 0",
                    ...styles,
                  },
                  on: {
                    click: () => {
                      if (!power) return;
                      self.showCreateAdjustModal(row);
                    },
                  },
                },
                row.inventoryFrozenNo
              ),
            ];
            let statusList = self.$common.arrayToObj(
              self.statusList.filter((k) => !self.$common.isEmpty(k))
            );
            if (statusList[row.frozenStatus]) {
              list.push(
                h(
                  "Tag",
                  {
                    style: { display: "inline-block" },
                    props: { color: "green" },
                    attrs: { title: "冻结单状态" },
                  },
                  statusList[row.frozenStatus].label
                )
              );
            }
            if (self.frozenTypeList[row.frozenType]) {
              list.push(
                h(
                  "Tag",
                  {
                    style: { display: "inline-block" },
                    props: { color: "magenta" },
                    attrs: { title: "冻结方式" },
                  },
                  self.frozenTypeList[row.frozenType].label
                )
              );
            }
            return h(
              "div",
              {
                class: "tag-hideBorder",
                style: {
                  padding: "4px 0",
                },
              },
              list
            );
          },
        },
        {
          title: "商品图片",
          width: 120,
          render: (h, { row }) => {
            if (self.$common.isEmpty(row.imageUrlList)) return "";
            return row.imageUrlList.slice(0, 2).map((m, i) => {
              return h(
                "div",
                {
                  style: {
                    display: "inline-block",
                    marginLeft: i > 0 ? "5px" : "0px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                  },
                },
                [self.tableImg(h, { row: { imageUrl: m } }, "imageUrl")]
              );
            });
          },
        },
        {
          title: "冻结SKU数",
          key: "frozenSkuNum",
          width: 80,
        },
        {
          title: "冻结商品数",
          key: "allFrozenInventoryNumber",
          width: 80,
        },
        {
          title: "冻结备注",
          key: "remark",
          minWidth: 130,
          tooltip: true,
        },
        {
          title: "已解冻数",
          key: "alreadyThawNumber",
          width: 80,
        },
        {
          title: "未解冻数",
          key: "surplusThawNumber",
          width: 80,
        },
        {
          title: "关联入库单信息",
          minWidth: 130,
          render: (h, { row }) => {
            let txtItem = [];
            if (row.receiptNo) {
              txtItem.push(h("div", row.receiptNo));
            }
            if (row.businessDeptId) {
              txtItem.push(
                h("div", "事业部：" + self.returnBussniss(row.businessDeptId))
              );
            }
            return h("div", {}, txtItem);
          },
        },
        {
          title: "关联采购单信息",
          minWidth: 130,
          render: (h, { row }) => {
            let txtItem = [];
            if (row.purchaseNo) {
              txtItem.push(h("div", row.purchaseNo));
            }
            if (row.purchaseBy) {
              txtItem.push(
                h("div", "采购人：" + self.returnUserName(row.purchaseBy))
              );
            }
            return h("div", {}, txtItem);
          },
        },
        {
          title: "关联备货计划信息",
          minWidth: 130,
          render: (h, { row }) => {
            let txtItem = [];
            if (row.planNo) {
              txtItem.push(h("div", row.planNo));
            }
            if (row.planBy) {
              txtItem.push(
                h("div", "计划人：" + self.returnUserName(row.planBy))
              );
            }
            return h("div", {}, txtItem);
          },
        },
        {
          title: "冻结天数",
          key: "alreadyFrozenDay",
          width: 100,
          render: (h, { row }) => {
            return h("div", [
              h("div", "冻结：" + row.frozenDay || 0),
              h("div", "已冻：" + row.alreadyFrozenDay || 0),
              h("div", [
                h("span", "剩余："),
                h(
                  "span",
                  {
                    style: {
                      color: "#ed4014",
                    },
                  },
                  row.surplusFrozenDay || 0
                ),
              ]),
            ]);
          },
        },
        {
          title: "创建人",
          key: "createdBy",
          width: 110,
        },
        {
          title: "创建时间",
          key: "createdTime",
          width: 80,
        },
        {
          title: "操作",
          fixed: "right",
          width: 100,
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "success",
                    size: "small",
                    disabled: !self.getPermission(
                      "wmsInventoryFrozen_modifyImplement"
                    ),
                  },
                  style: {
                    display: [1, "1"].includes(params.row.frozenStatus)
                      ? "inline"
                      : "none",
                  },
                  on: {
                    click: () => {
                      self.carryFrozenBtn(params.row);
                    },
                  },
                },
                "执行冻结" // 执行冻结
              ),
              h(
                "Button",
                {
                  props: {
                    type: "success",
                    size: "small",
                  },
                  style: {
                    display: [2, "2", 3, "3"].includes(params.row.frozenStatus)
                      ? "inline"
                      : "none",
                  },
                  on: {
                    click: () => {
                      // self.unfreezeBtn(params.row);
                      self.showCreateAdjustModal(params.row);
                    },
                  },
                },
                "解除冻结" // 解除冻结
              ),
            ]);
          },
        },
      ],
      data6: [],
      importUrl: api.importFrozen,
      tableSltData: [],
      unfreezeInfo: {
        visible: false,
      },
      freezeInfo: {
        visible: false,
        data: {},
      },
    };
  },
  computed: {
    headObj() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders,
      };
    },
    businessDeptList() {
      let list = this.$store.getters.getBusinessDeptList || [];
      return this.$common.arrayToObj(list, "id");
    },
    freezeStatus() {
      let list = (this.tableSltData || []).filter((k) => {
        return ![2, "2", 3, "3"].includes(k.frozenStatus);
      });
      return !!(!this.tableSltData.length || list.length);
    },
  },
  created() {
    this.initTime();
    this.searchData();
  },
  methods: {
    initTime() {
      const dayTime = this.$common.dayjs();
      // const startT = dayTime.add(-7, "day").format("YYYY-MM-DD HH:mm:ss");
      // const endT = dayTime.add(-1, "day").format("YYYY-MM-DD HH:mm:ss");
      const startT = dayTime.add(-6, "day").format("YYYY-MM-DD") + " 00:00:00";
      const endT = dayTime.add(0, "day").format("YYYY-MM-DD") + " 23:59:59";
      this.createTime = [startT, endT];
      this.setTime([startT, endT]);
    },
    setTime(e) {
      this.pageParams.startCreatedTime = e[0]
        ? this.$uDate.getUniversalTime(e[0], "fulltime")
        : e[0];
      this.pageParams.endCreatedTime = e[1]
        ? this.$uDate.getUniversalTime(e[1], "fulltime")
        : e[1];
    },
    openInportModal() {
      this.switchInportModal = true;
    },
    cancelInport() {
      this.switchInportModal = false;
    },
    tableSelectionChange(selection) {
      this.tableSltData = selection;
    },
    exportFn(obj) {
      this.axios.post(api.exportFrozen, obj).then((res) => {
        if (res.data.code === 0) {
          this.$Message.success("导出成功");
        }
      });
    },
    // 导出
    exportAllOrSlt(name) {
      let obj = this.paramsFn();
      if (name === "0") {
        // 选中
        if (this.tableSltData.length === 0) {
          this.$Message.warning("请选择导出数据");
          return;
        }
        obj.inventoryFrozenNos = this.tableSltData.map(
          (val) => val.inventoryFrozenNo
        );
        obj.exportType = "0";
        delete obj.skuList;
        this.exportFn(obj);
      } else {
        // 所有
        if (this.data6.length === 0) {
          this.$Message.warning({
            content: "无数据导出",
            duration: 5,
          });
          return;
        }
        let obj2 = {
          ...this.paramsFn(),
          exportType: "1",
          warehouseId: this.wareId,
        };
        this.exportFn(obj2);
      }
    },
    // 返回搜索条件；delParmas：要删除的key集合
    paramsFn(delParmas = []) {
      let temp = this.$common.copy(this.pageParams);
      temp.warehouseId = this.wareId;
      delParmas.forEach((key) => {
        delete temp[key];
      });
      return this.$common.removeEmpty(temp);
    },
    // 查询
    searchData() {
      if (!this.getPermission("wmsInventoryFrozen_list")) {
        this.gotoError(); // 无权限
        return;
      }

      let paramsObj = this.paramsFn();
      this.TableLoading = true;
      this.axios
        .post(api.frozenListSearchData, paramsObj)
        .then((res) => {
          if (res.data.code === 0) {
            this.data6 = this.processTimeData(
              res.data.datas.list,
              "createdTime"
            );
            this.totalRecords = res.data.datas.total;
            this.tableSltData = [];
          }
        })
        .finally(() => {
          this.TableLoading = false;
        });
    },
    // 页面查询
    frozenSearch() {
      this.pageParams.pageNum = 1;
      this.searchData();
    },
    // 点击排序的按钮
    clickSortButton: function (data) {
      if (data.value === this.cacheClickVal) {
        data.toogle = !data.toogle;
      }
      this.cacheClickVal = data.value;
      if (data.toogle) {
        this.pageParams.DESC = "DESC";
      } else {
        this.pageParams.DESC = "ASC";
      }
      this.sortData.forEach(function (n) {
        n.checked = data.value === n.value;
      });
      this.pageParams.CT = data.value;
      this.searchData();
    },
    getSortInfoAndFetch(type, feild) {
      this.pageParams.orderSeq = type;
      this.pageParams.orderBy = feild;
      this.searchData();
    },
    // 表格分页
    changePage(page) {
      this.pageParams.pageNum = page;
      this.searchData();
    },
    // 切换每页条数
    changePageSize(size) {
      this.pageParams.pageSize = size;
      this.searchData();
    },
    showCreateAdjustModal(row) {
      this.freezeInfo.data = row || {};
      this.freezeInfo.visible = true;
    },
    // 执行冻结
    carryFrozenBtn({ inventoryFrozenNo }) {
      this.$Modal.confirm({
        width: 550,
        title: `确认是否要执行冻结冻结单：<span style="color:#FF9900;">${inventoryFrozenNo}</span>`,
        loading: true,
        onOk: () => {
          this.axios
            .get(api.carryFrozenOrder, { params: { inventoryFrozenNo } })
            .then((res) => {
              if (res.data.code === 0) {
                this.$Message.success("执行冻结成功");
                this.searchData();
              }
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
      });
    },
    // // 解除冻结
    // unfreezeBtn({ inventoryFrozenNo }) {
    //   this.$Modal.confirm({
    //     width: 550,
    //     title: `确认是否要解除冻结单：<span style="color:#FF9900;">${inventoryFrozenNo}</span>`,
    //     loading: true,
    //     onOk: () => {
    //       this.axios
    //         .get(api.cancelFrozenOrder, { params: { inventoryFrozenNo } })
    //         .then((res) => {
    //           if (res.data.code === 0) {
    //             this.$Message.success("操作成功");
    //             this.searchData();
    //           }
    //         })
    //         .finally(() => {
    //           this.$Modal.remove();
    //         });
    //     },
    //   });
    // },
    // 重置按钮
    reset() {
      this.$refs["pageParams"].resetFields();
      this.initTime();
    },
    // 批量解除冻结
    mulUnfreeze() {
      this.unfreezeInfo.visible = true;
    },
    returnBussniss(businessDeptId) {
      let item = this.businessDeptList[businessDeptId] || {};
      return item.name || businessDeptId;
    },
    returnUserName(userId) {
      let userList = this.$store.getters.userInfoList || {};
      let list = this.$common.arrayToObj(userList, "userId");
      let item = list[userId] || {};
      return item.userName || userId;
    },
  },
};
</script>
<style lang="less">
.inventoryFreezePage {
  height: 100%;
  position: relative;
}

.headerBar .ivu-modal-header p,
.headerBar .ivu-modal-header-inner {
  color: #fff;
}
</style>
