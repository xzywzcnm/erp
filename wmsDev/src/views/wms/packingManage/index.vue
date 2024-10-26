<template>
  <div class="packingManagePage">
    <Spin v-if="printLoading" fix>预览单打印中，请勿中断操作...</Spin>
    <div class="listPage">
      <!-- 扫描/录入物流单号 -->
      <div class="scan-block mb10" v-if="getPermission('aliexpressPickupOrder_scan')">
        <Form ref="scanForm" :model="scanForm" :label-width="200" @submit.native.prevent>
          <Form-item label="扫描/录入物流单号：" class="scan-inputs">
            <div class="flexCenter">
              <dyt-input v-model.trim="scanForm.trackingNumber" class="inputs mr20" size="large" @on-enter="scanning"
                placeholder="回车/扫描物流单号" :disabled="scanLoading" ref="trackingNumber"></dyt-input>
              <Checkbox v-model="scanForm.unboxing" class="checkboxs" :disabled="scanLoading">取消装箱</Checkbox>
            </div>
          </Form-item>
        </Form>
      </div>

      <!--头部筛选区域-->
      <div class="searchMain">
        <Form ref="pageParams" :model="pageParams" :label-width="90">
          <!-- <div class="boxTitle">货箱列表</div> -->
          <dyt-filter>
            <Form-item label="货箱编号" prop="containerNumberList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.containerNumberList"
                placeholder="多个出库单请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="状态" prop="status">
              <dyt-select v-model="pageParams.status">
                <Option v-for="(item, key) in statusList" :key="key" :label="item.label" :value="item.value">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="创建时间">
              <Date-picker style="width: 100%" type="datetimerange" transfer @on-change="createdTimeChange" clearable
                :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end" placeholder="选择日期"
                :value="createdTime"></Date-picker>
            </Form-item>
            <Form-item label="完成装箱时间">
              <Date-picker style="width: 100%" type="datetimerange" transfer @on-change="finishBoxTimeChange" clearable
                :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end" placeholder="选择日期"
                :value="finishBoxTime"></Date-picker>
            </Form-item>
            <Form-item label="店铺" prop="saleAccountIdList">
              <dyt-select v-model="pageParams.saleAccountIdList" :multiple="true" :max-tag-count="1">
                <Option v-for="(item, key) in aliexpressShopList" :key="key" :label="item.accountCode"
                  :value="item.saleAccountId">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="预约类型" prop="pickupStatus">
              <dyt-select v-model="pageParams.pickupStatus">
                <Option v-for="(item, key) in pickupStatusList" :key="key" :label="item.label" :value="item.value">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="托管类型" prop="trusteeshipType">
              <dyt-select v-model="pageParams.trusteeshipType" placeholder="请选择托管类型">
                <Option :value="0">全托管</Option>
                <Option :value="1">半托管</Option>
              </dyt-select>
            </Form-item>
            <div slot="operation">
              <Button type="primary" @click="search" :disabled="tableLoading" icon="md-search" class="mr10">查询</Button>
              <Button @click="reset" v-once icon="md-refresh">重置 </Button>
            </div>
          </dyt-filter>
        </Form>
      </div>
      <!--排序、操作功能区域-->
      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <span v-for="(item, index) in dropdownList" :key="index">
              <Dropdown v-if="getPermission(item.power)" style="margin-right: 5px" transfer>
                <Button type="primary">
                  {{ item.label }}
                  <Icon type="md-arrow-dropdown"></Icon>
                </Button>
                <DropdownMenu slot="list" v-for="(litem, lindex) in item.list" :key="lindex">
                  <DropdownItem @click.native="litem.fun(litem.params)">{{
                    litem.label
                  }}</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </span>
          </div>
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" :sorType="{ DESC: 'desc', ASC: 'asc' }"
              @sortInfo="getSortInfoAndFetch(arguments)">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>
      <!--列表区域-->
      <div class="tableMain">
        <div class="tableBox">
          <Table ref="selection" highlight-row border :loading="tableLoading" :height="tableHeight"
            :columns="tableColumns" :data="tableList" @on-selection-change="tableChange"></Table>
        </div>
      </div>
      <!-- 分页 -->
      <div class="pagesMain">
        <Page :total="totalRecords" :current="pageParams.pageNum" :page-size="pageParams.pageSize"
          show-elevator:page-size-opts="pageArray" show-total show-sizer @on-change="changePage"
          @on-page-size-change="changePageSize">
        </Page>
      </div>
    </div>
    <!-- 详情 -->
    <searchDetail :dialogVisible.sync="detailDialog.dialogVisible" :data="detailDialog.data" />
    <!-- 箱唛 -->
    <boxLabel :modelVisible.sync="boxInfo.visible" :data="boxInfo.data" />
    <!-- 打印商品标签 :linkPrint="linkPrint" @linkPirntFun="linkPirntFun" -->
    <print-common ref="printCommon" :printModal.sync="printModal" :printData="printData" :pintField="pintField">
    </print-common>
    <!-- 预约揽收单 -->
    <collectionOrders :modelVisible.sync="collectInfo.visible" :data="collectInfo.data" @refreshList="getList" />
    <!-- 上传pdf -->
    <dytUpload v-show="false" :action="uploadApi" :format="['pdf']" :name="'files'" :headers="headObj" :maxSize="5120"
      :on-success="handleSuccess" :on-error="handleError" :on-format-error="formatError" :on-exceeded-size="exceededSize">
      <Button class="uploadFile">上传文件</Button>
    </dytUpload>
  </div>
</template>

<script>
import api from "@/api/api";
import { getWarehouseId } from "@/utils/getService";
import { statusList, pickupStatusList } from "./components/fileData";
import permission_mixin from "@/components/mixin/permission_mixin";
import tableHeight_mixin from "@/components/mixin/tableHeight_mixin";
import boxLabel from "./components/boxLabel";
import searchDetail from "./components/searchDetail";
import collectionOrders from "./components/collectionOrders";
import printCommon from "@/views/wms/components/pirntCommon/index";
// import PrintTongtu from "@/utils/printCommon.js";
const { PDFDocument } = require('pdf-lib');

export default {
  name: "packingManage",
  components: { boxLabel, searchDetail, printCommon, collectionOrders },
  mixins: [permission_mixin, tableHeight_mixin],
  data() {
    let v = this;
    return {
      uploadApi: api.upload_Img,
      printLoading: false,
      scanLoading: false,
      scanForm: {
        trackingNumber: "",
        unboxing: false,
      },
      pageParams: {
        status: "",
        containerNumberList: [],
        createdStartTime: "",
        createdEndTime: "",
        packingCompletionStartTime: "",
        packingCompletionEndTime: "",
        pickupStatus: "",
        trusteeshipType: null,
        saleAccountIdList: [],
        upDown: "desc",
        orderBy: "CT",
        pageNum: 1,
        pageSize: 10,
      },
      sortButtonList: [
        // 排序
        {
          sortHeader: "按创建时间",
          sortField: "CT",
          sortType: "desc",
          default: true,
        },
        {
          sortHeader: "完成装箱时间",
          sortField: "PCT",
          sortType: "desc",
        },
      ],
      tableColumns: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "货箱编号",
          align: "center",
          minWidth: 140,
          render: function (h, { row }) {
            let style = {};
            let detailPower = v.getPermission(
              "aliexpressPickupOrder_queryDetail"
            );
            if (detailPower) {
              style = {
                cursor: "pointer",
                textDecoration: "underline",
                color: "#409EFF",
              };
            }
            return h(
              "div",
              {
                style,
                on: {
                  click: function () {
                    if (!detailPower) return;
                    v.detailDialog.data = row;
                    v.detailDialog.dialogVisible = true;
                  },
                },
              },
              row.containerNumber
            );
          },
        },
        {
          title: "对应店铺",
          key: "accountCode",
          align: "center",
          minWidth: 140,
        },
        {
          title: "托管类型",
          key: "trusteeshipType",
          align: "center",
          minWidth: 140,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.trusteeshipType) || ![0, 1].includes(Number(row.trusteeshipType))) return h('span', '');
            const txt = row.trusteeshipType == 1 ? '半托管' : '全托管';
            return h('span', txt);
          }
        },
        {
          title: "箱内包裹数量",
          key: "packageQuantity",
          align: "center",
          width: 110,
        },
        {
          title: "状态",
          key: "status",
          align: "center",
          width: 120,
          render: (h, params) => {
            let item = v.statusList[params.row.status] || {};
            return h("span", item.label || "");
          },
        },
        {
          title: "收货仓库",
          key: "warehouseName",
          align: "center",
          minWidth: 160,
        },
        {
          title: "预约类型",
          align: "center",
          width: 110,
          render: (h, params) => {
            let item = v.pickupStatusList[params.row.pickupStatus] || {};
            return h("span", item.label || "");
          },
        },
        {
          title: "揽收单号",
          key: "pickupOrderNumber",
          align: "center",
          minWidth: 140,
        },
        {
          title: "创建人",
          key: "createdBy",
          align: "center",
          width: 140,
          render: (h, params) => {
            let userInfoList = v.$store.state.userInfoList || {};
            let userInfo = userInfoList[params.row.createdBy] || {};
            return h("div", userInfo.userName || "");
          },
        },
        {
          title: "创建时间",
          align: "center",
          width: 100,
          render: (h, params) => {
            return h(
              "div",
              v.$uDate.getDataToLocalTime(params.row.createdTime, "fulltime")
            );
          },
        },
        {
          title: "完成装箱时间",
          align: "center",
          width: 110,
          render: (h, params) => {
            return h(
              "div",
              {
                style: { width: "70px" },
              },
              v.$uDate.getDataToLocalTime(
                params.row.packingCompletionTime,
                "fulltime"
              )
            );
          },
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 120,
          fixed: "right",
          render: (h, params) => {
            let row = params.row || {};
            return h("local-down-button", {
              props: {
                data: {
                  btn: {
                    text: "操作",
                    disabled: false,
                    clickFn: () => { },
                  },
                  list: [
                    {
                      text: "打印箱唛",
                      value: 1,
                      clickFn: () => {
                        v.printBoxLabel("preve", row);
                      },
                    },
                    {
                      text: "完成装箱",
                      value: 2,
                      // 状态=正在装箱、箱内包裹数量＞0
                      hide: !(
                        [0, "0"].includes(row.status) &&
                        row.packageQuantity > 0 &&
                        v.getPermission("aliexpressPickupOrder_completePacking")
                      ),
                      clickFn: () => {
                        let returnData = v.commonParams({
                          api: "packing_completePacking",
                          row,
                        });
                        v.confirmModel({
                          tips: "完成装箱",
                          ...returnData,
                        });
                      },
                    },
                    {
                      text: "删除货箱",
                      value: 3,
                      // 状态=正在装箱、箱内包裹数量=0
                      hide: !(
                        [0, "0"].includes(row.status) &&
                        !row.packageQuantity &&
                        v.getPermission("aliexpressPickupOrder_deleteContainer")
                      ),
                      clickFn: () => {
                        let returnData = v.commonParams({
                          api: "packing_deleteContainer",
                          row,
                        });
                        v.confirmModel({
                          tips: "删除货箱",
                          ...returnData,
                        });
                      },
                    },
                    {
                      text: "预约揽收单",
                      value: 5,
                      hide: !(
                        [1, "1"].includes(row.status) &&
                        v.getPermission(
                          "aliexpressPickupOrder_appointmentPickupOrder"
                        )
                      ),
                      clickFn: () => {
                        v.appointmentPickupOrder(3, row);
                      },
                    },
                    {
                      text: "打印揽收单",
                      value: 6,
                      // 状态=待打印揽收单、待揽收、已揽收
                      hide: !(
                        [2, 3, 4, "2", "3", "4"].includes(row.status) &&
                        v.getPermission(
                          "aliexpressPickupOrder_printPickupOrder"
                        )
                      ),
                      clickFn: () => {
                        v.printPdfGetWmsPickupOrder(3, row);
                      },
                    },
                    {
                      text: "装箱复核",
                      value: 7,
                      // "待预约揽收单"状态货箱新增"装箱复核'功能
                      hide: !(
                        [1, "1", 5, "5"].includes(row.status) &&
                        v.getPermission("aliexpressPickupOrder_packingReview")
                      ),
                      clickFn: () => {
                        let returnData = v.commonParams({
                          api: "packing_packingReview",
                          row,
                        });
                        v.confirmModel({
                          tips: "装箱复核",
                          ...returnData,
                        });
                      },
                    },
                    {
                      text: "上传PDF",
                      value: 8,
                      hide: !(
                        [5, "5"].includes(row.status) &&
                        v.getPermission(
                          "aliexpressPickupOrder_uploadPickupOrder"
                        )
                      ),
                      clickFn: () => {
                        v.uploadRow = row;
                        let dom = document.querySelector(".uploadFile");
                        dom.click();
                      },
                    },
                    {
                      text: "标记已揽收",
                      value: 9,
                      hide: !(
                        row.status == 3 &&
                        [2, "2"].includes(row.pickupStatus) &&
                        v.getPermission("aliexpressPickupOrder_markAccepted")
                      ),
                      clickFn: () => {
                        let temp = {};
                        temp.containerIds = [row.containerId];
                        temp.warehouseId = v.warehouseId;
                        v.confirmModel({
                          tips: "标记已揽收",
                          rqApi: api.packing_markAccepted,
                          temp,
                        });
                      },
                    },
                  ],
                },
              },
            });
          },
        },
      ],
      totalRecords: 0,
      tableLoading: false,
      tableList: [],
      statusList: statusList,
      detailDialog: {
        // 详情
        data: {},
        dialogVisible: false,
      },
      boxInfo: {
        visible: false,
        data: { num: 0 },
      },
      printModal: false, // 打印弹框
      printData: [], // 打印的数据
      pintField: {
        label: "货箱编号",
        columns: [
          { label: "货箱编号", key: "totalBox", noprint: true },
          { label: "labelName", key: "labelName", hide: true },
          { label: "boxNum", key: "boxNum", hide: true },
          { label: "boxNo", key: "boxNo", hide: true },
          { label: "accountCode", key: "accountCode", hide: true },
          { label: "warehouseName", key: "warehouseName", hide: true },
          { label: "appointmentStatus", key: "appointmentStatus", hide: true },
          { label: "数量", key: "printNum", noprint: true },
        ],
        pintContent: [
          "labelName",
          "boxNum",
          "boxNo",
          "accountCode",
          "warehouseName",
          "appointmentStatus",
        ], // 打印内容
        printParams: {
          // 打印纸张大小
          width: 100,
          height: 100,
        },
        positionKey: {
          // 打印标签位置
          labelName: {
            textAlign: "center",
            padding: "36px 6px 20px",
            fontSize: "18px",
          },
          boxNum: {
            display: "contents",
            textAlign: "center",
            fontSize: "28px",
          },
          boxNo: {
            display: "contents",
            textAlign: "center",
            fontSize: "38px",
          },
          accountCode: {
            textAlign: "center",
            fontSize: "28px",
            paddingTop: "20px",
          },
          warehouseName: {
            textAlign: "center",
            fontSize: "16px",
            paddingTop: "20px",
          },
          appointmentStatus: {
            textAlign: "center",
            fontSize: "14px",
            paddingTop: "10px",
          },
        },
      },
      collectInfo: {
        visible: false,
        data: {},
      },
      warehouseId: getWarehouseId(), // 仓库id
      createdTime: [],
      finishBoxTime: [],
      dateOptions: {
        shortcuts: [
          {
            text: "近一周",
            value: function () {
              let end = new Date();
              let start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              return [start, end];
            },
          },
          {
            text: "近一个月",
            value: function () {
              let end = new Date();
              let start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              return [start, end];
            },
          },
          {
            text: "近三个月",
            value: function () {
              let end = new Date();
              let start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              return [start, end];
            },
          },
        ],
      },
      tableSltData: [],
      pickupStatusList,
      aliexpressShopList: [],
      dropdownList: [
        {
          label: "完成装箱",
          power: "aliexpressPickupOrder_batchCompletePacking",
          list: [
            { label: "选中数据", fun: v.batchFinishBoxPack, params: 1 },
            { label: "所有结果集", fun: v.batchFinishBoxPack, params: 2 },
          ],
        },
        {
          label: "预约揽收单",
          power: "aliexpressPickupOrder_batchAppointmentPickupOrder",
          list: [
            { label: "选中数据", fun: v.appointmentPickupOrder, params: 1 },
            { label: "所有结果集", fun: v.appointmentPickupOrder, params: 2 },
          ],
        },
        {
          label: "打印揽收单",
          power: "aliexpressPickupOrder_printPickupOrder",
          list: [
            {
              label: "打印选中数据",
              fun: v.printPdfGetWmsPickupOrder,
              params: 1,
            },
            {
              label: "打印所有结果集",
              fun: v.printPdfGetWmsPickupOrder,
              params: 2,
            },
          ],
        },
        {
          label: "标记已揽收",
          power: "aliexpressPickupOrder_markAccepted",
          list: [
            { label: "标记选中数据", fun: v.pickupOrder, params: 1 },
            { label: "标记所有结果集", fun: v.pickupOrder, params: 2 },
          ],
        },
        {
          label: "导出",
          power: "aliexpressPickupOrder_export",
          list: [
            { label: "导出选中数据", fun: v.exportData, params: 1 },
            { label: "导出所有结果集", fun: v.exportData, params: 2 },
          ],
        },
      ],
      uploadRow: {},
    };
  },
  created() {
    this.search();
    this.getyAliexpressAccountList();
  },
  computed: {
    headObj() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders,
      };
    },
  },
  methods: {
    getyAliexpressAccountList() {
      this.axios
        .get(
          api.get_EnabledSaleAccounts +
          "?merchantId=" +
          this.$store.state.erpConfig.userInfo.merchantId
        )
        .then((response) => {
          if (response.data.code === 0) {
            let saleAccountData = response.data.datas || [];
            let temp = {};
            saleAccountData.forEach((k) => {
              if (temp[k.platformId]) {
                temp[k.platformId].push(k);
              } else {
                temp[k.platformId] = [k];
              }
            });
            this.aliexpressShopList = temp["aliexpress"] || [];
          }
        });
    },
    // 表格勾选
    tableChange(data) {
      this.tableSltData = data;
    },
    // 获取筛选条件
    getParams() {
      let params = this.$common.removeEmpty(this.pageParams);
      params.warehouseId = this.warehouseId;
      return params;
    },
    // 获取质检单列表
    getList() {
      let power = this.getPermission("aliexpressPickupOrder_query");
      if (!power) {
        this.$Message.error("无权限!");
        return;
      }
      this.tableLoading = true;
      this.axios
        .post(api.packing_query, this.getParams())
        .then(({ data }) => {
          if (data.code !== 0) return;
          let datas = data.datas || {};
          this.tableList = datas.list || [];
          this.totalRecords = datas.total || 0;
          this.tableSltData = [];
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
    // 查询按钮
    search() {
      this.pageParams.pageNum = 1;
      this.getList();
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(Info) {
      this.pageParams.upDown = Info[0] || "desc";
      this.pageParams.orderBy = Info[1] || "CT";
      this.getList();
    },
    // 重置数据
    reset() {
      this.$refs["pageParams"].resetFields();
      this.createdTime = this.finishBoxTime = [];
      this.createdTimeChange(["", ""]);
      this.finishBoxTimeChange(["", ""]);
    },
    // 表格分页
    changePage(page) {
      this.pageParams.pageNum = page;
      this.getList();
    },
    // 切换每页条数
    changePageSize(size) {
      this.pageParams.pageSize = size;
      this.getList();
    },
    // PDF文件预览
    previewWashedPdf(url) {
      this.axios
        .get("/wms-service/filenode/s" + url, { responseType: "blob" })
        .then((res) => {
          this.$common.blobToBase64(res.data || res.resData).then((data) => {
            const fileBold = this.$common.base64ToBlob(data, "application/pdf");
            this.$common.previewFile(fileBold);
          });
        });
    },
    // 扫描
    scanning() {
      let { trackingNumber, unboxing } = this.scanForm;
      if (!trackingNumber) {
        this.$Message.warning("请输入/扫描物流单号!");
        return;
      }
      this.scanLoading = true;
      let rqApi = `?trackingNumber=${trackingNumber}&unboxing=${unboxing}&warehouseId=${this.warehouseId}`;
      this.axios
        .post(api.packing_scan + rqApi)
        .then(({ data }) => {
          if (data.code !== 0) return;
          this.search();
          let temp = data.datas || {};
          if (!unboxing) {
            this.boxInfo.data = temp;
            this.boxInfo.visible = true;
            // isNew 是否新生成货箱(0：否 1：是)
            if (
              this.getPermission("aliexpressPickupOrder_printPickupOrder") &&
              temp.isNew == 1
            ) {
              this.printBoxLabel("print", temp);
            }
          }
        })
        .finally(() => {
          this.scanLoading = false;
          this.scanForm.trackingNumber = "";
          this.$nextTick(() => {
            this.$refs["trackingNumber"].focus();
          });
        });
    },
    // 打印箱唛
    printBoxLabel(type, temp) {
      let totalBox = temp.containerNumber;
      const index = totalBox.indexOf("-");
      let pickupName = temp.pickupStatus
        ? temp.pickupStatus == 2
          ? "已预约"
          : "未预约"
        : "";
      this.printData = [
        {
          labelName: "货箱编号",
          totalBox: totalBox,
          boxNum: totalBox.slice(0, index),
          boxNo: totalBox.slice(index),
          accountCode: "店铺：" + temp.accountCode,
          warehouseName: `收货仓库：${temp.warehouseCode} ${temp.warehouseName}`,
          appointmentStatus: `预约揽收单状态：${pickupName}`,
          printNum: "1",
        },
      ];
      if (type === "preve") return (this.printModal = true);
      let printCommon = this.$refs.printCommon;
      printCommon.setData().then(() => {
        printCommon.pintAll();
      });
    },
    // 完成装箱/删除货箱/拣货复核 通用
    commonParams(option) {
      let defaultList = [
        "containerNumber",
        "saleAccountId",
        "accountCode",
        "warehouseCode",
        "pickupStatus",
      ];
      let list = option.paramsList || defaultList;
      let rqData = {};
      rqData["warehouseId"] = this.warehouseId;
      list.forEach((k) => {
        rqData[k] = option.row[k];
      });
      // let params = this.paramsMontage(rqData);
      return { rqApi: api[option.api], temp: rqData };
    },
    confirmModel(option) {
      this.$Modal.confirm({
        title: "操作提示",
        content: `<p>确定${option.tips}吗？</p>`,
        loading: true,
        onOk: () => {
          this.axios
            .post(option.rqApi, option.temp)
            .then(({ data }) => {
              if (data.code !== 0) return;
              this.$Message.success("操作成功!");
              this.getList();
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
      });
    },
    paramsMontage(params) {
      let str = "";
      Object.keys(params).forEach((k, i) => {
        str += (i > 0 ? "&" : "?") + k + "=" + params[k];
      });
      return str;
    },
    createdTimeChange(value) {
      this.pageParams.createdStartTime = value[0];
      this.pageParams.createdEndTime = value[1];
    },
    finishBoxTimeChange(value) {
      this.pageParams.packingCompletionStartTime = value[0];
      this.pageParams.packingCompletionEndTime = value[1];
    },
    commonHandle(type) {
      let temp = {};
      if (type == 1) {
        if (!this.tableSltData.length) {
          this.$Message.warning("请勾选数据!");
          return { error: true };
        }
        temp.containerIds = this.tableSltData.map((k) => {
          return k.containerId;
        });
        temp.warehouseId = this.warehouseId;
      } else {
        temp = this.$common.copy(this.getParams());
        delete temp.pageNum;
        delete temp.pageSize;
      }
      return temp;
    },
    // 标记选中1/全部2
    pickupOrder(type) {
      let temp = {};
      if (type == 1) {
        if (!this.tableSltData.length) {
          this.$Message.warning("请勾选数据!");
          return false;
        }
        let containerIds = this.tableSltData
          .filter((k) => {
            return k.status == 3 && [2, "2"].includes(k.pickupStatus);
          })
          .map((k) => {
            return k.containerId;
          });
        if (!containerIds.length) {
          this.$Message.warning("状态为待揽收且已预约的才能标记!");
          return false;
        }
        temp.containerIds = containerIds;
        temp.warehouseId = this.warehouseId;
      } else {
        temp = this.$common.copy(this.getParams());
        delete temp.pageNum;
        delete temp.pageSize;
      }

      this.$Modal.confirm({
        title: "操作提示",
        content: `<p>确定标记已揽收吗？</p>`,
        loading: true,
        onOk: () => {
          this.axios
            .post(api.packing_markAccepted, temp)
            .then(({ data }) => {
              if (!(data && data.code === 0)) return;
              this.$Message.success("操作成功");
              this.$refs.selection.selectAll(false);
              this.getList();
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
      });
    },
    // 导出选中1/全部2
    exportData(type) {
      this.commonExport(type, api.packing_export);
    },
    commonExport(type, rqApi, hideMessage) {
      return new Promise((resolve) => {
        let temp = this.commonHandle(type);
        if (temp.error) {
          resolve();
          return false;
        }
        !hideMessage && this.$Spin.show();
        this.axios
          .post(rqApi, temp)
          .then(({ data }) => {
            if (!(data && data.code === 0)) return;
            this.$Message.success("导出成功");
            this.$refs.selection.selectAll(false);
          })
          .finally(() => {
            !hideMessage && this.$Spin.hide();
            resolve();
          });
      });
    },
    // 打印预约面单
    printPdfGetWmsPickupOrder(type, row) {
      let temp = {};
      if (type == 3) {
        temp.containerIds = [row.containerId];
        temp.warehouseId = this.warehouseId;
      } else {
        temp = this.commonHandle(type);
        if (temp.error) return;
      }
      this.tableLoading = true;
      this.axios
        .post(api.packing_printPickupOrder, temp)
        .then(({ data }) => {
          if (data.code !== 0) return;
          let list = (data.datas || []).filter((k) => k.pickupOrderPdfPath);
          if (!list.length) {
            this.$Message.error("没有可打印的揽收单!");
            return;
          }
          // 单个打印预览
          if (type == 3) {
            this.previewWashedPdf(list[0].pickupOrderPdfPath);
            return;
          }
          if (list.length > 200) {
            this.$Message.warning({
              content: "建议揽收单打印张数不超过200,请进行批量操作!",
              duration: 4
            });
            return;
          }
          let mergePdfs = async (inputPdfPaths) => {
            const existingPdfs = [];
            // 读取所有输入的PDF文件
            for (const pdfPath of inputPdfPaths) {
              console.log(pdfPath, 'pdfPath')
              const pdfBytes1 = await this.axios.get('/wms-service/filenode/s' + pdfPath, { responseType: 'arraybuffer' });
              const pdf = await PDFDocument.load(pdfBytes1.data);
              existingPdfs.push(pdf);
            }
            // 创建一个新的PDF文档来容纳合并后的内容
            const mergedPdf = await PDFDocument.create();
            // 将所有PDF的页面添加到新文档中
            for (const [index, pdf] of existingPdfs.entries()) {
              const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
              pages.forEach((page) => {
                // 可选择在这里调整添加页面的顺序
                mergedPdf.addPage(page);
              });
            }
            // 合并后的PDF
            const mergedPdfBytes = await mergedPdf.save();
            var blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            var pdfurl = window.URL.createObjectURL(blob);
            window.open(pdfurl, 'windowName');
            setTimeout(() => {
              window.URL.revokeObjectURL(pdfurl);
            }, 500);
          }
          let pickupOrderPdfPathList = list.map(k => k.pickupOrderPdfPath);
          this.printLoading = true;
          mergePdfs(pickupOrderPdfPathList).finally(() => {
            this.printLoading = false;
          })
          // // 批量打印
          // this.printLoading = true;
          // let index = 0;
          // let fun = (path) => {
          //   PrintTongtu.pdfPrint({
          //     pdf: "filenode/s" + path,
          //     postId: "collectOrder",
          //   })
          //     .then(() => {
          //       index++;
          //       if (!list[index].pickupOrderPdfPath) {
          //         this.printLoading = false;
          //         return;
          //       }
          //       fun(list[index].pickupOrderPdfPath);
          //     })
          //     .catch(() => {
          //       this.printLoading = false;
          //     });
          // };
          // fun(list[index].pickupOrderPdfPath);
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
    // 预约揽收单
    async appointmentPickupOrder(type, row) {
      let temp = { type };
      const message = '所操作的数据不包含"待预约揽收单"状态数据!';
      if ([1, 3].includes(type)) {
        let tableSltData = type == 1 ? this.tableSltData : [row];
        if (!tableSltData.length) {
          this.$Message.warning("请勾选数据!");
          return false;
        }
        let list = tableSltData.filter((k) => {
          return [1, "1"].includes(k.status);
        })
        if (!list.length) {
          this.$Message.warning(message);
          return false;
        }
        temp.data = list;
      } else {
        let params = this.$common.copy(this.getParams());
        delete params.pageNum;
        delete params.pageSize;
        delete params.orderBy;
        delete params.upDown;
        let data = await this.checkappointmentPickupOrder(api.packing_queryPickupOrderBoxNumInfo, params);
        let flag = Object.prototype.toString.call(data) === '[object Object]';
        let boxQuantitySum = flag ? (data.boxQuantitySum || 0) : 0;
        if (boxQuantitySum <= 0) {
          this.$Message.warning(message);
          return false;
        }
        temp.data = params;
        temp.boxNumInfo = data;
      }
      this.collectInfo.data = temp;
      this.collectInfo.visible = true;
    },
    checkappointmentPickupOrder(rqApi, temp) {
      return new Promise(resolve => {
        this.axios.post(rqApi, temp)
          .then(({ data }) => {
            if (data && data.code === 0) {
              resolve(data.datas);
            } else {
              resolve();
            }
          })
          .catch(() => {
            resolve();
          });
      })
    },
    async batchFinishBoxPack(type) {
      let temp = {};
      temp.warehouseId = this.warehouseId;
      const message = '所操作的数据不包含"正在装箱"状态数据!';
      if ([1].includes(type)) {
        let tableSltData = this.tableSltData;
        if (!tableSltData.length) {
          this.$Message.warning("请勾选数据!");
          return false;
        }
        let list = tableSltData.filter((k) => {
          return [0, "0"].includes(k.status) && k.packageQuantity > 0;
        })
        if (!list.length) {
          this.$Message.warning(message);
          return false;
        }
        temp.containerIds = this.tableSltData.map((k) => {
          return k.containerId;
        });
      } else {
        let params = this.$common.copy(this.getParams());
        delete params.pageNum;
        delete params.pageSize;
        const data = await this.checkappointmentPickupOrder(api.packing_queryPackingCount, params);
        if (this.$common.isEmpty(data) || (data <= 0)) {
          this.$Message.warning(message);
          return false;
        }
        temp = Object.assign(temp, params);
      }
      // console.log(temp, 'temp')
      this.confirmModel({
        tips: "完成装箱",
        rqApi: api.packing_batchCompletePacking,
        temp: temp
      })
    },
    // 上传PDF
    handleSuccess(response, file, fileList) {
      let temp = {};
      temp.containerId = this.uploadRow.containerId;
      temp.pickupOrderPdfPath = response.datas;
      temp.status = 4; // 4:已揽收
      this.$Spin.show();
      this.axios
        .post(api.packing_uploadPickupOrder, temp)
        .then(({ data }) => {
          if (!(data && data.code === 0)) return;
          this.$Message.success("操作成功");
          this.getList();
        })
        .finally(() => {
          this.$Spin.hide();
        });
    },
    handleError(error, file, fileList) {
      console.error(error);
      this.$Message.error("上传失败");
    },
    // 格式错误回调
    formatError(file, fileList) {
      this.$Message.warning("请上传PDF文件!");
    },
    // 文件超出指定大小限制时的钩子
    exceededSize(file, fileList) {
      this.$Message.warning("上传的文件大小不能超过5M");
    },
  },
};
</script>

<style lang="less">
.packingManagePage {
  height: 100%;
  position: relative;

  .ivu-spin-fix {
    z-index: 1000;
  }

  .scan-block {
    background-color: #fff;
    padding-top: 24px;
    display: flex;
    justify-content: center;

    .scan-inputs {
      .ivu-form-item-label {
        font-size: 20px;
      }

      .inputs {
        width: 500px;
      }

      .checkboxs {
        font-size: 14px;
      }
    }
  }

  .searchMain {
    .boxTitle {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
    }
  }
}
</style>
