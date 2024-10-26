<template>
  <div class="valueAddedServicesPage">
    <div class="listPage" v-show="workShow === 'list'">
      <div class="searchMain">
        <Form ref="searchParams" :model="searchParams" :label-width="110">
          <dyt-filter ref="dyt-filter" @expand="expand">
            <Form-item label="增值服务单号：" prop="serviceNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.serviceNoList"
                placeholder="多个请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="增值服务：" prop="serviceTypeList">
              <dyt-select v-model="searchParams.serviceTypeList" :multiple="true" :max-tag-count="1">
                <Option v-for="item in valAddList" :value="item.value" :key="item.value" :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="添加时间：">
              <DatePicker type="daterange" transfer placeholder="选择日期" :value="[
                searchParams.createdTimeStart,
                searchParams.createdTimeEnd,
              ]" @on-change="createTimeChange" format="yyyy-MM-dd">
              </DatePicker>
            </Form-item>
            <Form-item label="单据类型：" prop="invoicesTypeList">
              <dyt-select v-model="searchParams.invoicesTypeList" :multiple="true" :max-tag-count="1">
                <Option v-for="item in documTypeList" :value="item.value" :key="item.value" :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <FormItem label="事业部:" prop="businessDeptIdList">
              <dyt-select v-model="searchParams.businessDeptIdList" :multiple="true" :max-tag-count="1">
                <Option v-for="(item, index) in businessDeptList" :value="item.id" :label="item.name"
                  :key="`busines-${index}`" />
              </dyt-select>
            </FormItem>
            <Form-item label="操作人：" prop="operateUserList">
              <dyt-select v-model="searchParams.operateUserList" :multiple="true" :max-tag-count="1">
                <Option v-for="item in userInfoList" :key="item.erpUserId" :label="item.name" :value="item.erpUserId">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="操作日期：">
              <DatePicker type="daterange" transfer placeholder="选择日期" :value="[
                searchParams.operateTimeStart,
                searchParams.operateTimeEnd,
              ]" @on-change="operateTimeChange" format="yyyy-MM-dd">
              </DatePicker>
            </Form-item>
            <Form-item label="出库单号：" prop="pickingNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.pickingNoList"
                placeholder="多个请用逗号回车分隔" />
            </Form-item>
            <div slot="operation">
              <Button type="primary" @click="searchData" icon="ios-search" class="mr10">查询</Button>
              <Button @click="reset" icon="md-refresh">重置</Button>
            </div>
          </dyt-filter>
        </Form>
      </div>
      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <Button type="primary" @click="addStock"
              v-if="getPermission('valueAddedService_savePicking')">添加（其他出库）</Button>
            <Button type="primary" class="ml10" @click="openInportModal"
              v-if="getPermission('valueAddedService_importPicking')">导入其他出库</Button>
            <Button type="primary" class="ml10" @click="scanSaleStock"
              v-if="getPermission('valueAddedService_savePackage')">扫描录入（销售出库）</Button>
            <Dropdown @on-click="exportList" class="ml10" v-if="getPermission('valueAddedService_exportPicking')">
              <Button type="primary">导出 <Icon type="md-arrow-dropdown"></Icon></Button>
              <DropdownMenu slot="list">
                <DropdownItem name="0">导出选中数据</DropdownItem>
                <DropdownItem name="1">导出所有结果集</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>
      <div class="tableMain">
        <div class="tableBox">
          <Table border highlight-row ref="selection" :columns="columns" :loading="tableLoading" :data="data"
            @on-selection-change="tableChange" :height="tableHeight" class="negativeDistance">
          </Table>
        </div>
      </div>
      <div class="pagesMain">
        <dyt-pagination :total="totalRecords" :current="searchParams.pageNum" :page-size="searchParams.pageSize"
          @on-change="changePage" @on-page-size-change="changePageSize"></dyt-pagination>
      </div>
    </div>
    <!-- 添加其他出库 -->
    <addOtherStockout :model-visible.sync="otherStockInfo.visible" :userInfoList="userInfoList"
      @refreshAll="searchData" />
    <!-- 导入 @uploadSuccess="searchTable" -->
    <importFile :model-visible.sync="importInfo.visible" @refreshAll="searchData" />
    <!-- 扫描录入销售出库 -->
    <addSaleStockout :model-visible.sync="saleStockInfo.visible" @refreshAll="searchData" />
    <!-- 增值服务详情 -->
    <stockoutDetail :model-visible.sync="stockDetailInfo.visible" :rowData="stockDetailInfo.data" />
    <!-- 销售出库单详情 -->
    <template v-if="stockDetailPageInfo.invoicesType === 0 && workShow === 'detail'">
      <saleStockOutDetail :pickingNo="stockDetailPageInfo.pickingNo" :workShow="workShow" workType="sellStock"
        :wareExpenses="true" />
    </template>
    <!-- 其他出库单详情 -->
    <template v-if="stockDetailPageInfo.invoicesType === 1 && workShow === 'detail'">
      <otherStockOutDetail ref="sellStockOutDtl" :pickingNo="stockDetailPageInfo.pickingNo" workType="otherStock"
        :workShow="workShow" :warehouseOverseaType="stockDetailPageInfo.warehouseOverseaType" />
    </template>
    <!-- 借样出库单详情 -->
    <lendSampleDetails v-if="lendSampleInfo.visible" :modal-visible.sync="lendSampleInfo.visible"
      :module-data="lendSampleInfo.data" />
    <!-- 全托管出库单详情 -->
    <directOtherStockDetail :dialogVisible.sync="directStockInfo.visible" :detailData="directStockInfo.data"
      :isEdit="directStockInfo.isEdit" />
    <!-- 海外仓出库单详情 -->
    <div style="background:#fff;" v-if="stockDetailPageInfo.invoicesType === 4 && workShow === 'detail'">
      <overseaStockDetail :workShow.sync="workShow" :isEdit="false" :rowData="stockDetailPageInfo" />
    </div>
  </div>
</template>
<script>
import api from "@/api/api";
import dropDown from "@/views/wms/components/common/dropDownOpt";
import { documTypeList, valAddList } from "./components/fileData";
import permission_mixin from "@/components/mixin/permission_mixin";
import tableHeight_mixin from "@/components/mixin/tableHeight_mixin";
import importFile from "./components/importFile";
import addOtherStockout from "./components/addOtherStockout";
import addSaleStockout from "./components/addSaleStockout";
import stockoutDetail from "./components/stockoutDetail";
import saleStockOutDetail from "@/views/wms/components/exWarehouse/sellStockOutDtl";
import otherStockOutDetail from '@/views/wms/components/exWarehouse/otherStockOut/sellStockOutDtl';
import lendSampleDetails from '@/views/wms/stockOUt/otherStouck/components/lendSampleDetails';
import directOtherStockDetail from '@/views/wms/stockOUt/fullyManage/components/sellStockOutDtl';
import overseaStockDetail from '@/views/wms/stockOUt/otherStouck/components/detailStockOrder';
import { pageTabData, statusOperate } from '@/views/wms/stockOUt/otherStouck/components/lendSampleData.js';
import { getWarehouseId } from '@/utils/getService';

export default {
  mixins: [permission_mixin, tableHeight_mixin],
  components: {
    dropDown,
    importFile,
    addOtherStockout,
    addSaleStockout,
    stockoutDetail,
    saleStockOutDetail,
    otherStockOutDetail,
    lendSampleDetails,
    directOtherStockDetail,
    overseaStockDetail,
  },
  data() {
    let v = this;
    return {
      searchParams: {
        orderBy: "CR",
        orderSeq: "DESC",
        pageNum: 1,
        pageSize: 50,
        serviceNoList: [],
        serviceTypeList: [],
        createdTimeStart: null,
        createdTimeEnd: null,
        invoicesTypeList: [],
        businessDeptIdList: [],
        operateUserList: [],
        operateTimeStart: null,
        operateTimeEnd: null,
        pickingNoList: [],
      },
      valAddList: valAddList,
      documTypeList: documTypeList,
      sortButtonList: [
        {
          sortHeader: "按添加时间",
          sortField: "CR",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "按操作时间",
          sortField: "OR",
          sortType: "DESC",
        },
      ],
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "增值服务单号",
          align: "left",
          minWidth: 160,
          render: (h, { row }) => {
            const power = v.getPermission("valueAddedService_queryDetail");
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
                "span",
                {
                  style: styles,
                  on: {
                    click: () => {
                      if (!power) return;
                      v.stockDetailInfo.data = row;
                      v.stockDetailInfo.visible = true;
                    },
                  },
                },
                row.serviceNo
              )
            ];
            return h(
              "div",
              {
                style: {
                  padding: "4px 0",
                },
              },
              list
            );
          },
        },
        {
          title: "单据类型",
          align: "left",
          minWidth: 110,
          render(h, { row }) {
            let itemInfo = v.documTypeList[row.invoicesType] || {};
            return h("div", itemInfo.label);
          },
        },
        {
          title: "事业部",
          align: "left",
          minWidth: 120,
          render(h, { row }) {
            let businessDeptList = v.$common.arrayToObj(v.businessDeptList, 'id');
            let itemInfo = businessDeptList[row.businessDeptId] || {};
            return h("div", itemInfo.name);
          },
        },
        {
          title: "出库单号",
          align: "left",
          minWidth: 160,
          render: (h, { row }) => {
            return h(
              "span",
              {
                style: {
                  textDecoration: "underline",
                  color: "#2d8cf0",
                  cursor: "pointer",
                },
                on: {
                  click: () => {
                    v.seeStockDetail(row);
                  },
                },
              },
              row.pickingNo
            )
          },
        },
        {
          title: "SKU数量",
          align: "left",
          minWidth: 90,
          key: "skuSum",
        },
        {
          title: "商品数量",
          minWidth: 90,
          align: "left",
          key: "productSum",
        },
        {
          title: "增值服务",
          minWidth: 100,
          align: "left",
          render: (h, { row }) => {
            let itemInfo = v.valAddList[row.serviceType] || {};
            return h("div", itemInfo.label);
          },
        },
        {
          title: "操作数量",
          minWidth: 100,
          align: "left",
          key: 'operateQuantitySum',
          // render: (h, { row }) => {
          //   let list = row.serviceDetailList || [];
          //   const total = list.reduce((total, currentItem) => { total + (currentItem.operateQuantity || 0) }, 0)
          //   return h("div", total);
          // },
        },
        {
          title: "操作人",
          align: "left",
          minWidth: 120,
          render(h, { row }) {
            let renderList = [];
            (row.operateUserList || []).forEach(k => {
              renderList.push(h('div', v.userInfoListAll[k] && v.userInfoListAll[k].userName))
            })
            return h("div", renderList);
          },
        },
        {
          title: "操作日期",
          align: "left",
          width: 90,
          key: "operateTime",
        },
        {
          title: "备注",
          align: "left",
          minWidth: 120,
          key: "remark",
          tooltip: true,
        },
        {
          title: "添加时间",
          align: "left",
          width: 80,
          render: (h, { row }) => {
            return h(
              "div",
              row.createdTime ? v.$uDate.dealTime(row.createdTime) : ""
            );
          },
        },
        {
          title: "添加人",
          align: "left",
          minWidth: 120,
          render: (h, { row }) => {
            let itemInfo = v.userInfoListAll[row.createdBy] || {};
            return h("div", itemInfo.userName);
          },
        },
        {
          title: "操作",
          align: "left",
          width: 90,
          fixed: 'right',
          render: (h, { row }) => {
            let list = [];
            if (v.getPermission('valueAddedService_delete')) {
              list.push(h(
                "Button",
                {
                  props: {
                    size: "small",
                    type: 'error'
                  },
                  on: {
                    click: () => {
                      v.deleRow(row);
                    },
                  },
                },
                "删除"
              ))
            }
            return h("div", list);
          },
        },
      ],
      otherStockInfo: {
        visible: false,
      },
      saleStockInfo: {
        visible: false,
      },
      importInfo: {
        visible: false,
      },
      stockDetailInfo: {
        data: {},
        visible: false,
      },
      totalRecords: 0,
      tableLoading: false,
      data: [],
      tableSltData: [], // 表格勾中
      workShow: 'list',
      stockDetailPageInfo: {},
      lendSampleInfo: {
        visible: false,
        data: {
          warehouseId: '',
          tableRow: {},
          statusOperate: statusOperate,
          stateData: pageTabData.filter(item => item.name != 'all'),
        },
      },
      directStockInfo: {
        isEdit: 'detail',
        visible: false,
        data: {},
      },
      userInfoList: [],
    };
  },
  created() {
    this.getTime();
    this.searchData();
    this.getUserInfoList();
  },
  computed: {
    businessDeptList() {
      return this.$store.getters.getBusinessDeptList || [];
    },
    warehouseId() {
      return this.$store.state.warehouseId || getWarehouseId();
    },
    // 用户列表
    userInfoListAll() {
      return this.$store.state.userInfoList;
    },
  },
  methods: {
    // 生成日期，默认值为前7天
    getTime() {
      let dayjs = this.$common.dayjs();
      this.searchParams.createdTimeStart = dayjs.subtract(6, "day").format("YYYY-MM-DD");
      this.searchParams.createdTimeEnd = dayjs.format("YYYY-MM-DD");
    },
    getUserInfoList() {
      this.axios.post(api.valAddService_queryAffiliatedBusinessDeptPersonByIds, [16]).then((res) => {
        if (res.data.status === 200) {
          this.userInfoList = res.data.data || [];
        }
      })
    },
    // 导入模板弹框
    openInportModal() {
      this.importInfo.visible = true;
    },
    // 导出数据
    exportList(name) {
      let [temp, tableSltData] = [{}, this.tableSltData, null];
      if (["0"].includes(name)) {
        // 选中
        if (!tableSltData.length) {
          this.$Message.warning("请选择导出数据");
          return;
        }
        temp.serviceIdList = tableSltData.map((val) => val.serviceId);
        temp.warehouseId = this.warehouseId;
      }
      if (["1"].includes(name)) {
        temp = this.paramsFn(["orderBy", "orderSeq", "pageNum", "pageSize"]);
      }
      this.axios.post(api.valAddService_exportPicking + this.warehouseId, temp).then((res) => {
        if (res.data.code === 0) {
          this.$Message.success("导出成功");
          if (["0"].includes(name)) {
            this.$refs.selection.selectAll(false);
            this.tableSltData = [];
          }
        }
      });
    },
    // 返回搜索条件；delParmas：要删除的key集合
    paramsFn(delParmas = []) {
      let temp = this.$common.copy(this.searchParams);
      temp.warehouseId = this.warehouseId;
      if (temp.createdTimeStart && temp.createdTimeEnd) {
        temp.createdTimeStart = this.$uDate.reduceTime(temp.createdTimeStart + ' 00:00:00', "fulltime");
        temp.createdTimeEnd = this.$uDate.reduceTime(temp.createdTimeEnd + ' 23:59:59', "fulltime");
      }
      if (temp.operateTimeStart && temp.operateTimeEnd) {
        temp.operateTimeStart += ' 00:00:00';
        temp.operateTimeEnd += ' 23:59:59';
      }
      delParmas.forEach((key) => {
        delete temp[key];
      });
      return this.$common.removeEmpty(temp);
    },
    createTimeChange(e) {
      this.searchParams.createdTimeStart = e[0] || "";
      this.searchParams.createdTimeEnd = e[1] || "";
    },
    operateTimeChange(e) {
      this.searchParams.operateTimeStart = e[0] || "";
      this.searchParams.operateTimeEnd = e[1] || "";
    },
    searchFn() {
      this.tableLoading = true;
      if (this.getPermission("valueAddedService_queryList")) {
        let obj = this.paramsFn();
        this.axios.post(api.valAddService_queryList, obj).then((res) => {
          if (res.data.code === 0) {
            this.data = (res.data.datas.list || [])
            this.totalRecords = res.data.datas.total;
          }
        }).finally(() => {
          this.tableLoading = false;
          this.$refs.selection.selectAll(false);
        });
      } else {
        this.gotoError(); // 无权限
        this.tableLoading = false;
      }
    },
    gotoError() {
      if (process.env.NODE_ENV == "development") {
        console.warn("本地运行，无权限时不跳转");
        return;
      }
      this.$router.push({
        path: "/noPersermission",
        query: { warehouseId: this.warehouseId },
      });
    },
    // 表格分页
    changePage(page) {
      this.searchParams.pageNum = page;
      this.searchFn();
    },
    // 切换每页条数
    changePageSize(size) {
      this.searchParams.pageSize = size;
      this.searchFn();
    },
    // 查询按钮
    searchData() {
      this.searchParams.pageNum = 1;
      this.searchFn();
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.searchParams.orderSeq = type;
      this.searchParams.orderBy = feild;
      this.searchFn();
    },
    // 表格选择项变化
    tableChange(data) {
      this.tableSltData = data;
    },
    // 重置按钮
    reset() {
      this.$refs["searchParams"].resetFields();
      this.searchParams.operateTimeStart = null;
      this.searchParams.operateTimeEnd = null;
      this.getTime();
    },
    // 添加其它出库
    addStock() {
      this.otherStockInfo.visible = true;
    },
    // 扫描录入销售出库
    scanSaleStock() {
      this.saleStockInfo.visible = true;
    },
    deleRow(row) {
      this.$Modal.confirm({
        title: '操作提示',
        width: '560px',
        content: `<div style="font-size: 16px;">
          <div>确认是否要删除？服务单号：<span style="color:#f60;">${row.serviceNo}</span></div>
        </div>`,
        loading: true,
        onOk: () => {
          this.axios.delete(api.valAddService_delete + row.serviceId).then(res => {
            if (!res || !res.data || res.data.code !== 0) return;
            this.$Message.success('操作成功');
            this.$nextTick(() => {
              this.searchData();
            });
          }).finally(() => {
            this.$Modal.remove();
          })
        }
      });
    },
    // 查看出库单详情
    seeStockDetail(row) {
      if (row.invoicesType == 2) {
        this.lendSampleInfo.visible = true;
        this.lendSampleInfo.data.tableRow = row;
        return;
      }
      if (row.invoicesType == 3) {
        this.directStockInfo.visible = true;
        this.directStockInfo.data = row;
        return;
      }
      this.workShow = 'detail';
      this.stockDetailPageInfo = row;
    }
  },
};
</script>
<style lang="less">
.valueAddedServicesPage {
  height: 100%;
  position: relative;
}
</style>
