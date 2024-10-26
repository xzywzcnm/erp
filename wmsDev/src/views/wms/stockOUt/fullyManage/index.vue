<template>
  <div class="fullyManageIndex tag-hideBorder">
    <div class="listPage">
      <Tabs v-model="tabActive" style="background:#fff;padding:0 10px;" @on-click="tabClick">
        <TabPane v-for="(tab, tIndex) in tabList" :label="tabPaneLabel(tab)" :name="tab.tabName" :key="`tab-${tIndex}`" />
      </Tabs>
      <div class="searchMain">
        <Form ref="searchParams" :model="searchParams" :label-width="110">
          <dyt-filter ref="dyt-filter" @expand="expand">
            <Form-item label="出库单编号：" prop="pickingNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.pickingNoList"
                placeholder="多个请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="拣货单号：" prop="pickingGoodsNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.pickingGoodsNoList"
                placeholder="多个请用逗号回车分隔" />
            </Form-item>
            <Form-item label="创建时间：">
              <DatePicker type="daterange" transfer placeholder="选择日期" :value="[
                searchParams.createStartTime,
                searchParams.createEndTime,
              ]" @on-change="createTimeChange" format="yyyy-MM-dd">
              </DatePicker>
            </Form-item>
            <Form-item label="参考编号：" prop="referenceNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.referenceNoList"
                placeholder="多个编号请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="质检类型：" prop="qualityCheckType">
              <dyt-select v-model="searchParams.qualityCheckType" :multiple="true" :max-tag-count="1">
                <Option v-for="item in checkTypeList" :value="item.value" :key="item.value" :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="物流方式：">
              <Cascader transfer :load-data="loadData" :data="shippingMethodData" filterable
                @on-change="changeShippingMethod" change-on-select v-model="shippingMethodModel"></Cascader>
            </Form-item>
            <Form-item label="平台主体：" prop="platformType">
              <dyt-select v-model="searchParams.platformType" @on-change="accountChange">
                <Option v-for="item in platformList" :value="item.value" :key="item.value" :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="店铺：" prop="saleAccountId">
              <dyt-select v-model="searchParams.saleAccountId">
                <Option v-for="item in shopList" :value="item.accountCode" :key="item.accountCode"
                  :label="item.accountCode">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="拣货状态：" prop="packageGoodsStatus">
              <dyt-select v-model="searchParams.packageGoodsStatus">
                <Option v-for="item in packageStatusList" :value="item.value" :key="item.value" :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="平台订单号：" prop="platformOrderNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.platformOrderNoList"
                placeholder="多个请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="快递单号：" prop="expressDeliveryNumberList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.expressDeliveryNumberList"
                placeholder="多个请用逗号或回车分隔,支持模糊查询" />
            </Form-item>
            <!-- <Form-item label="库区组：" prop="warehouseBlockGroupId">
              <dyt-select v-model="searchParams.warehouseBlockGroupId">
                <Option v-for="item in reservoirList" :value="item.warehouseBlockGroupId"
                  :key="item.warehouseBlockGroupId" :label="item.name"></Option>
              </dyt-select>
            </Form-item> -->
            <Form-item label="问题件处理状态：" prop="questionHandStatus">
              <dyt-select v-model="searchParams.questionHandStatus">
                <Option v-for="item in problemStatusList" :value="item.value" :key="item.value" :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="订单类型：" prop="orderType">
              <dyt-select v-model="searchParams.orderType">
                <Option v-for="(item, index) in orderTypeList" :value="item.value" :key="index + 'orderType'"
                  :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="创建人：" prop="createdBys">
              <dyt-select v-model="searchParams.createdBys" :multiple="true" :max-tag-count="1">
                <Option v-for="item in userInfoList" :key="item.userId" :label="item.userName" :value="item.userId">
                </Option>
              </dyt-select>
            </Form-item>
            <FormItem label="事业部:" prop="businessIds">
              <dyt-select v-model="searchParams.businessIds" :multiple="true" :max-tag-count="1">
                <Option v-for="(item, index) in businessDeptList" :value="item.id" :label="item.name"
                  :key="`busines-${index}`" />
              </dyt-select>
            </FormItem>
            <!-- <Form-item label="增值服务：" prop="valueAddedServiceList">
              <dyt-select v-model="searchParams.valueAddedServiceList">
                <Option v-for="(item, i) in valueAddServicesOption" :key="i + 'valueAddedServiceList'" :label="item.label"
                  :value="item.value">
                </Option>
              </dyt-select>
            </Form-item> -->
            <Form-item label="出库单状态：" prop="pickingStatus" v-if="['all'].includes(tabActive)">
              <dyt-select v-model="searchParams.pickingStatus" :multiple="true" :max-tag-count="1">
                <template v-for="(item, index) in outListStatusList">
                  <Option :value="item.value" :label="item.label" v-if="!item.listHiden" :key="`ps-${index}`"></Option>
                </template>
              </dyt-select>
            </Form-item>
            <div slot="operation">
              <Button type="primary" @click="searchData" icon="ios-search" class="mr10">查询</Button>
              <Button @click="reset" icon="md-refresh">重置</Button>
            </div>
          </dyt-filter>
        </Form>
      </div>
      <div class="funMain" style="margin:0;">
        <div class="funMain__flex">
          <div>
            <Button type="primary" @click="addStock()"
              :disabled="!getPermission('fullTrusteeshipPicking_create')">创建出库单</Button>
            <Button type="primary" class="ml10" @click="openInportModal"
              :disabled="!getPermission('fullTrusteeshipPicking_import')">导入出库单</Button>
            <Button type="primary" @click="clickAssignBatch(tableSltData)" class="ml10" :disabled="!getPermission('fullTrusteeshipPicking_batchGenPickingGoods') &&
              !tableSltData.length
              ">
              生成拣货单
            </Button>
            <Dropdown @on-click="batchAssign" class="ml10">
              <Button type="primary">批量操作
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name="3" v-if="getPermission('fullTrusteeshipPicking_batchDistribution')
                  ">
                  批量分配
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown @on-click="exportAllOrSlt" class="ml10">
              <Button type="primary">导出 <Icon type="md-arrow-dropdown"></Icon></Button>
              <DropdownMenu slot="list">
                <DropdownItem name="0" v-if="getPermission('fullTrusteeshipPicking_export')">导出选中数据
                </DropdownItem>
                <DropdownItem name="1" v-if="getPermission('fullTrusteeshipPicking_export')">导出所有结果集
                </DropdownItem>
                <DropdownItem name="2" v-if="getPermission('fullTrusteeshipPicking_exportDeliveryOrder')
                  ">导出交货单
                </DropdownItem>
                <DropdownItem name="3" v-if="getPermission('fullTrusteeshipPicking_exportQualityCheck')
                  ">导出质检统计
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button type="primary" @click="uploadMulList" class="ml10" :disabled="finishDisabled">批量上传文件</Button>
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
    <!--生成拣货单 -->
    <Modal class="createPick" style="width: 600px" v-model="createPickInfo.createPickListModel" title="生成拣货单">
      <createPickList :apiParams="createPickInfo.pickingList" :apiCondition="searchParams" type="other"
        createType="select" @closeSuccess="closeSuccess" v-if="createPickInfo.createPickListModel">
      </createPickList>
      <div slot="footer"></div>
    </Modal>
    <!--新建出库单-->
    <newStockOutList :dialogVisible.sync="addStockInfo.dialogVisible" :platformData="addStockInfo.data"
      @searchData="searchData" />
    <!-- 编辑/查看出库单 -->
    <sellStockOutDtl :dialogVisible.sync="detailStockInfo.dialogVisible" :detailData="detailStockInfo.detailData"
      :isEdit="detailStockInfo.isEdit" @backReturn="searchFn" />
    <!-- 质检 -->
    <qualityInspection :dialogVisible.sync="qualityInfo.dialogVisible" :detailData="qualityInfo.detailData"
      @backReturn="searchFn" />
    <!-- 导入 -->
    <importStockOrder :modelVisible.sync="importInfo.switchInportModal" />
    <!-- 问题件 -->
    <qualityProblemProducts :modelVisible.sync="problemInfo.visible" :modalData="problemInfo.data"
      :isEdit="problemInfo.isEdit" @backReturnList="searchFn" />
    <!-- 导出交货单 -->
    <commonForm :dialogVisible.sync="commonFormInfo.visible" :paramsList="commonFormInfo.paramsList"
      @commonReturn="commonReturn" />
    <!-- 批量上传文件 -->
    <mulUploadFiles :modelVisible.sync="mulUpload.visible" :modalData="mulUpload.data" @backReturnList="searchFn" />
    <!-- 快递详情 -->
    <exDeliveryDetails :modelVisible.sync="deleverInfo.visible" :modalData="deleverInfo.data" />
    <!-- 选择平台和店铺 -->
    <selectPlatform :modelVisible.sync="selectPlatformInfo.visible" @addStock="addStock" />
  </div>
</template>
<script>
import api from "@/api/api";
import dropDown from "@/views/wms/components/common/dropDownOpt";
import createPickList from "@/views/wms/components/exWarehouse/createPickList";
import sellStockOutDtl from "./components/sellStockOutDtl";
import newStockOutList from "./components/newStockOutList";
import qualityInspection from "./components/qualityInspection";
import inportBeforeDownload from "@/views/wms/components/wms-inWareManage/inportBeforeDownload";
import qualityProblemProducts from "./components/qualityProblemProducts";
import exDeliveryDetails from "./components/exDeliveryDetails";
import {
  outListTypeList,
  outListStatusList,
  checkTypeList,
  packageStatusList,
  problemStatusList,
  statusReturn,
  arrayToObj,
  packagePickStatus,
  orderTypeList,
} from "./components/fileData";
import { getWarehouseId } from "@/utils/getService";
import permission_mixin from "@/components/mixin/permission_mixin";
import tableHeight_mixin from "@/components/mixin/tableHeight_mixin";
import tableImg_mixin from "@/components/mixin/tableImg_mixin";
import commonForm from "./components/commonForm";
import mulUploadFiles from "./components/mulUploadFiles";
import selectPlatform from "./components/selectPlatform";
import importStockOrder from "./components/importStockOrder";
export default {
  mixins: [permission_mixin, tableHeight_mixin, tableImg_mixin],
  components: {
    dropDown,
    createPickList,
    sellStockOutDtl,
    newStockOutList,
    inportBeforeDownload,
    qualityInspection,
    qualityProblemProducts,
    commonForm,
    mulUploadFiles,
    exDeliveryDetails,
    selectPlatform,
    importStockOrder,
  },
  data() {
    let v = this;
    return {
      searchParams: {
        orderBy: "CT",
        orderSeq: "DESC",
        pageNum: 1,
        pageSize: 50,
        pickingStatus: [], // 出库单状态
        platformOrderNoList: [],
        createStartTime: "",
        createEndTime: "",
        pickingNoList: [], // 出库单编号
        referenceNoList: [], // 参考编号
        qualityCheckType: [],
        pickingExtendList: [],
        platformType: "",
        saleAccountId: "",
        packageGoodsStatus: "", // 拣货完成
        pickingGoodsNoList: [], // 拣货单号
        expressDeliveryNumberList: [],
        // warehouseBlockGroupId: "",
        questionHandStatus: [],
        orderType: "",
        createdBys: [],
        businessIds: [],
        // valueAddedServiceList: null,
      },
      shippingMethodModel: [],
      checkTypeList: arrayToObj(checkTypeList),
      packageStatusList: arrayToObj(packageStatusList),
      problemStatusList: arrayToObj(problemStatusList),
      shippingMethodData: [],
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "全托管出库单",
          align: "left",
          minWidth: 240,
          render: (h, { row }) => {
            let pickingItem = statusReturn(row.pickingNewStatus);
            let platformItem = this.platformList[row.platformType] || {};
            const power = this.getPermission(
              "fullTrusteeshipPicking_queryDetail"
            );
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
                  },
                },
                [
                  h("span", "单号："),
                  h(
                    "span",
                    {
                      style: styles,
                      on: {
                        click: () => {
                          if (!power) return;
                          v.seeDetail(row, "detail");
                        },
                      },
                    },
                    row.pickingNo
                  ),
                ]
              ),
            ];
            if (pickingItem.label) {
              list.push(
                h(
                  "Tag",
                  {
                    props: { color: "green" },
                    attrs: { title: "出库单状态" },
                  },
                  pickingItem.label
                )
              );
            }
            if (platformItem.label) {
              list.push(
                h(
                  "Tag",
                  {
                    props: { color: "magenta" },
                    attrs: { title: "平台主体" },
                  },
                  platformItem.label
                )
              );
            }
            if (row.saleAccount) {
              list.push(
                h(
                  "Tag",
                  {
                    props: { color: "purple" },
                    attrs: { title: "店铺" },
                  },
                  row.saleAccount
                )
              );
            }
            if (v.orderTypeList[row.orderType]) {
              list.push(
                h(
                  "Tag",
                  {
                    props: { color: row.orderType == 1 ? "red" : "blue" },
                    attrs: { title: "订单类型" },
                  },
                  v.orderTypeList[row.orderType].label
                )
              );
            }
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
          title: "操作",
          align: "left",
          width: 170,
          render: (h, { row }) => {
            let status = row.pickingNewStatus + "";
            let item = statusReturn(status);
            let permit = false;
            if (item.operator && Array.isArray(item.operatorPermiss)) {
              item.operatorPermiss.forEach((k) => {
                v.getPermission(k) && (permit = true);
              });
            }
            let list = [];
            if (permit) {
              list.push(
                h(
                  "Button",
                  {
                    props: { type: "primary", size: "small" },
                    style: {
                      marginRight: "10px",
                    },
                    on: {
                      click: () => {
                        v.seeDetail(row, "button");
                      },
                    },
                  },
                  item.operator
                )
              );
            }
            // 编辑
            return h("div", [
              ...list,
              h(
                "Button",
                {
                  props: { size: "small" },
                  style: {
                    display:
                      ["16", "9", "13", "10", "14", "8", "15"].includes(
                        status
                      ) && v.getPermission("fullTrusteeshipPicking_edit")
                        ? "inline-block"
                        : "none",
                  },
                  on: {
                    click: () => {
                      v.seeDetail(row, "edit");
                    },
                  },
                },
                "编辑"
              ),
            ]);
          },
        },
        {
          title: "平台订单/参考编号",
          align: "left",
          minWidth: 140,
          render(h, { row }) {
            return h("div", {}, [
              h("div", row.platformOrderNo || "-"),
              h("div", row.referenceNo || "-"),
            ]);
          },
        },
        {
          title: "图片",
          align: "left",
          width: 80,
          render: (h, params) => {
            return v.tableImg(h, params.row.goodsUrl);
          },
        },
        {
          title: "SKU数量",
          align: "left",
          width: 90,
          key: "skuNumber",
        },
        {
          title: "商品数量",
          align: "left",
          width: 90,
          key: "allExpectedNumber",
        },
        {
          title: "备注",
          minWidth: 110,
          align: "left",
          render: (h, { row }) => {
            let list = row.fbaRemark ? row.fbaRemark.split("\n") : [];
            let [renderList] = [[]];
            list.forEach((k) => {
              k && renderList.push(h("div", k));
            });
            return h(
              "Tooltip",
              {
                props: {
                  transfer: true,
                  placement: "top",
                  maxWidth: "400",
                  "transfer-class-name": "self-tooltip",
                },
                attrs: {
                  class: "textOverTwo",
                },
                style: {
                  display: renderList.length ? "inline-block" : "none",
                },
              },
              [
                h("div", renderList),
                h(
                  "div",
                  {
                    slot: "content",
                  },
                  renderList
                ),
              ]
            );
          },
        },
        {
          title: "问题件",
          width: 100,
          align: "left",
          render: (h, { row }) => {
            let list = [];
            if (row.problemNumbers) {
              let permit = v.getPermission(
                "fullTrusteeshipPicking_updateCheckQuestion"
              );
              list.push(
                h(
                  "div",
                  {
                    attrs: {
                      class: permit ? "linkText cursorClick" : "",
                    },
                    style: {
                      display: "block",
                      marginBottom: "4px",
                    },
                    on: {
                      click() {
                        if (!permit) return;
                        v.processProblem(row, false);
                      },
                    },
                  },
                  row.problemNumbers
                )
              );
              if (problemStatusList[row.questionHandStatus]) {
                list.push(
                  h(
                    "Tag",
                    {
                      props: { color: "green" },
                      attrs: { title: "问题件处理状态" },
                    },
                    problemStatusList[row.questionHandStatus].label
                  )
                );
              }
            }
            return h("div", list);
          },
        },
        {
          title: "拣货单",
          width: 150,
          align: "left",
          render: (h, { row }) => {
            let statusList = arrayToObj(packagePickStatus);
            // let arr = row.wmsPickingGoodsRelation || [];
            let list = [];
            (row.wmsPickingGoodsRelation || []).forEach((k) => {
              if (k.pickingGoodsNo && k.packageGoodsRelationStatus) {
                list.push(h("div", k.pickingGoodsNo));
                let packageItem = statusList[k.packageGoodsRelationStatus];
                list.push(
                  h(
                    "Tag",
                    {
                      props: { color: "green" },
                      attrs: { title: "拣货状态" },
                    },
                    packageItem.label
                  )
                );
              }
            });
            return h("div", list);
          },
        },
        // {
        //   title: "物流商单号/运单号",
        //   align: "left",
        //   minWidth: 130,
        //   render: (h, { row }) => {
        //     return h("div", [
        //       h("div", row.logisticsNo),
        //       h("div", row.logisticsTrackingNo),
        //     ]);
        //   },
        // },
        {
          title: "快递公司单号",
          align: "left",
          minWidth: 120,
          render: (h, { row }) => {
            let item = v.expressCompanyList[row.expressCompany] || {};
            let day = v.returnDay(row.reserveTime);
            return h("div", [
              h("div", [
                h("span", item.logisticsName || row.expressCompany),
                h("span", day ? "，" : ""),
                h(
                  "span",
                  {
                    style: {
                      color: "red",
                    },
                  },
                  day
                ),
              ]),
              h(
                "div",
                {
                  class: "dispalyFlex alignCenter",
                },
                [
                  h("span", {
                    attrs: {
                      class: "linkText cursorClick",
                    },
                    on: {
                      click() {
                        v.deleverInfo.data = row;
                        v.deleverInfo.visible = true;
                      },
                    },
                  }, row.expressDeliveryNumber),
                  h("Icon", {
                    style: {
                      fontSize: "16px",
                      cursor: "pointer",
                      color: "#2d8cf0",
                      marginLeft: "2px",
                      display: row.expressDeliveryNumber ? "block" : "none",
                    },
                    props: {
                      type: "md-checkbox-outline",
                    },
                    on: {
                      click() {
                        v.data.forEach((k, i) => {
                          if (
                            k.expressDeliveryNumber ===
                            row.expressDeliveryNumber
                          ) {
                            v.$set(v.data[i], "_checked", !row._checked);
                          }
                        });
                      },
                    },
                  }),
                ]
              ),
            ]);
          },
        },
        {
          title: "发货数量",
          align: "left",
          width: 80,
          key: "allDoneDeliveredNumber",
        },
        {
          title: "创建人",
          align: "left",
          width: 120,
          render: (h, { row }) => {
            return h("div", [
              h("div", row.createdName),
              h("div", row.businessUnit),
            ]);
          },
        },
        {
          title: "创建时间",
          align: "left",
          width: 90,
          render: (h, { row }) => {
            return h(
              "div",
              row.createdTime ? v.$uDate.dealTime(row.createdTime) : ""
            );
          },
        },
      ],
      totalRecords: 0,
      tableLoading: false,
      sortButtonList: [
        {
          sortHeader: "按创建时间",
          sortField: "CT",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "出库单状态",
          sortField: "WS",
          sortType: "DESC",
        },
      ],
      shopList: [],
      addStockInfo: {
        data: {},
        dialogVisible: false,
      },
      detailStockInfo: {
        isEdit: null,
        dialogVisible: false,
        detailData: {},
      },
      importInfo: {
        switchInportModal: false,
      },
      createPickInfo: {
        createPickListModel: false,
        pickingList: [],
      },
      outListStatusList: outListStatusList,
      data: [],
      pickingType: "O12", // 默认
      platformList: arrayToObj(outListTypeList),
      qualityInfo: {
        dialogVisible: false,
        detailData: {},
      },
      problemInfo: {
        // 质检问题产品详情
        isEdit: false,
        visible: false,
        data: {},
      },
      // tableSltData: [],
      expressCompanyList: {}, // 快递公司
      orderTypeList: arrayToObj(orderTypeList),
      commonFormInfo: {
        name: null,
        visible: false,
        paramsList: [], // 需要返回的表单信息
      },
      mulUpload: {
        visible: false,
        data: [],
      },
      deleverInfo: {
        visible: false,
        data: {},
      },
      selectPlatformInfo: {
        visible: false,
      },
      tabActive: 'all',
      // valueAddServicesOption: [
      //   {
      //     label: '换包装',
      //     value: 0
      //   },
      // ],//增值服务
    };
  },
  created() {
    this.getTime();
    this.getShippingList();
    this.getLogistics();
    // this.getWareAreaGroup();
    this.searchData();
    this.getOrderStatusNumber();
  },
  computed: {
    headObj() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders,
      };
    },
    warehouseId() {
      return this.$store.state.warehouseId || getWarehouseId();
    },
    businessDeptList() {
      return this.$store.getters.getBusinessDeptList || [];
    },
    userInfoList() {
      return this.$store.getters.userInfoList || [];
    },
    finishDisabled() {
      let selectList = this.tableSltData || [];
      let list = selectList.filter((k) => !(k.pickingNewStatus == 2));
      return !!(
        !this.getPermission("fullTrusteeshipPicking_batchUpdate") ||
        !selectList.length ||
        list.length
      );
    },
    tableSltData() {
      let list = this.data.filter((k) => {
        return k._checked;
      });
      return list;
    },
    tabList() {
      let list = [
        {
          label: "全部",
          value: null,
          statusList: [],
          tabName: 'all',
          total: 0,
        },
        ...this.outListStatusList,
      ];
      return list;
    },
  },
  methods: {
    tabClick() {
      let tab = this.tabActive;
      if (['all', 'deliverFinish'].includes(tab)) {
        this.getTime();
      } else {
        this.searchParams.createStartTime = null;
        this.searchParams.createEndTime = null;
      }
      if (['all'].includes(tab)) {
        this.searchParams.pickingStatus = [];
      } else {
        let tabList = this.$common.arrayToObj(this.tabList, 'tabName');
        let tabRow = tabList[tab] || {};
        this.searchParams.pickingStatus = tabRow.value ? [tabRow.value] : [];
      }
      this.searchData();
    },
    // 标签显示修改
    tabPaneLabel(data) {
      return (h) => {
        let item = [h('span', data.label)];
        if (['all', 'deliverFinish'].includes(data.tabName)) return h("div", item);
        if (!this.$common.isEmpty(data.total)) {
          item.push(h('span', {
            style: {
              color: '#f20',
              'margin-left': '5px',
            }
          }, `(${data.total})`));
        }
        return h("div", item);
      }
    },
    returnDay(d) {
      let td = new Date();
      td = new Date(td.getFullYear(), td.getMonth(), td.getDate());
      let od = new Date(d);
      od = new Date(od.getFullYear(), od.getMonth(), od.getDate());
      var xc = (od - td) / 1000 / 60 / 60 / 24;
      if (xc < 0) {
        return null;
      } else if (xc == 0) {
        return "今天";
      } else if (xc < 2) {
        return "明天";
      } else if (xc < 3) {
        return "后天";
      } else {
        // return xc + "天后";
        return null;
      }
    },
    // 生成日期，默认值为前7天
    getTime() {
      let dayjs = this.$common.dayjs();
      this.searchParams.createStartTime = dayjs.subtract(6, "day").format("YYYY-MM-DD");
      this.searchParams.createEndTime = dayjs.format("YYYY-MM-DD");
    },
    loadData(item, callback) {
      item.loading = true;
      let rqApi =
        api.get_enableShippingMethods +
        "?carrierId=" +
        item.value +
        "&warehouseId=" +
        this.warehouseId;
      this.axios
        .get(rqApi)
        .then((response) => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            let pos = [];
            for (let i = 0; i < data.length; i++) {
              pos.push({
                value: [data[i].shippingMethodId, item.carrierAccounts],
                label: data[i].carrierShippingMethodName,
              });
              if (i === data.length - 1) {
                item.children = pos;
                item.loading = false;
                callback();
              }
            }
            if (data.length === 0) {
              item.children = pos;
              item.loading = false;
              this.$Message.warning("没有相关记录");
              callback();
            }
          } else {
            item.loading = false;
            item.children = [];
          }
        })
        .catch(() => {
          item.loading = false;
          item.children = [];
        });
    },
    // 获取物流方式
    getShippingList(h) {
      let rqApi =
        api.get_enableCarriers +
        "?warehouseId=" +
        this.warehouseId +
        "&isFilter=true" +
        "&time=" +
        new Date().getTime();
      this.axios.get(rqApi).then((response) => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let pos = [];
          for (let i = 0; i < data.length; i++) {
            pos.push({
              value: data[i].carrierId,
              label: data[i].carrierName,
              children: [],
              loading: false,
              carrierAccounts: data[i].carrierAccounts,
            });
            if (i === data.length - 1) this.shippingMethodData = pos;
          }
        }
      });
    },
    // 获取快递公司
    getLogistics() {
      this.$store.dispatch("getLogisticsList").then((list) => {
        this.expressCompanyList = arrayToObj(list, "logisticsCode");
      });
    },
    // 物流方式切换
    changeShippingMethod(list) {
      let fun = (arr) => {
        let result = [];
        arr.forEach((k) => {
          if (Array.isArray(k)) {
            result.push(...fun(k));
          } else if (typeof k === "string") {
            result.push(k);
          }
        });
        return result;
      };
      let shippingList = fun(list);
      if (shippingList.length) {
        let obj = {};
        shippingList[0] && (obj["logisticsDealerCode"] = shippingList[0]);
        shippingList[1] && (obj["logisticsMailCode"] = shippingList[1]);
        this.searchParams.pickingExtendList = [obj];
      } else {
        this.searchParams.pickingExtendList = [];
      }
    },
    // // 获取库区组下拉
    // getWareAreaGroup() {
    //   this.$store
    //     .dispatch("getReservoirList", { warehouseId: this.warehouseId })
    //     .then((list) => {
    //       this.reservoirList = list;
    //     });
    // },
    // 状态操作/查看出库单详情
    seeDetail(row, type) {
      let typeParams = "detailStockInfo";
      if (["button"].includes(type)) {
        if (row.pickingNewStatus == 16) {
          this.clickAssignBatch([row]);
          return;
        }
        // 处理问题件
        if (row.pickingNewStatus == 15) {
          this.processProblem(row, true);
          return;
        }
        if (row.pickingNewStatus == 10) typeParams = "qualityInfo"; // 质检
      }
      if ("isEdit" in this[typeParams]) {
        this[typeParams].isEdit = type;
      }
      this[typeParams].detailData = this.$common.copy(row);
      this[typeParams].dialogVisible = true;
    },
    closeSuccess() {
      this.createPickInfo.createPickListModel = false;
      this.searchFn();
    },
    // 导入模板弹框
    openInportModal() {
      this.importInfo.switchInportModal = true;
    },
    // 批量操作
    batchAssign(name) {
      if (name == 3) this.dropOption();
    },
    // 导出
    exportAllOrSlt(name) {
      let typeList = {
        0: "exportList",
        1: "exportList",
        2: "deliveryNote",
        3: "deliveryNote",
      };
      typeList[name] && this[typeList[name]](name);
    },
    // 导出数据
    exportList(name) {
      let [temp, tableSltData] = [{}, this.tableSltData, null];
      if (["0"].includes(name)) {
        temp.warehouseId = this.warehouseId;
        // 选中
        if (!tableSltData.length) {
          this.$Message.warning("请选择导出数据");
          return;
        }
        temp.pickingNoList = tableSltData.map((val) => val.pickingNo);
      }
      if (["1"].includes(name)) {
        temp = this.paramsFn(["orderBy", "orderSeq", "pageNum", "pageSize"]);
      }
      this.axios.post(api.fullManage_exportPicking, temp).then((res) => {
        if (res.data.code === 0) {
          this.$Message.success("导出成功");
          if (["0"].includes(name)) {
            this.$refs.selection.selectAll(false);
            this.tableSltData = [];
          }
        }
      });
    },
    // 导出交货单
    deliveryNote(name) {
      if (["2"].includes(name)) {
        this.commonFormInfo.paramsList = ["tips", "time", "expressCompanys"];
      }
      if (["3"].includes(name)) {
        this.commonFormInfo.paramsList = ["createStartTime", "createEndTime"];
      }
      this.commonFormInfo.name = name;
      this.commonFormInfo.visible = true;
    },
    commonReturn(datas) {
      let typeList = {
        2: "deliveryNoteReturn",
        3: "qualityTest",
      };
      const name = this.commonFormInfo.name;
      typeList[name] && this[typeList[name]](datas);
    },
    deliveryNoteReturn(datas) {
      let { data, fun } = datas;
      let temp = {};
      temp.deliverFinishStartTime = this.$uDate.reduceTime(
        data.time + " 00:00:00"
      );
      temp.deliverFinishEndTime = this.$uDate.reduceTime(
        data.time + " 23:59:59"
      );
      temp.expressCompanys = data.expressCompanys;
      temp.pickingNewStatus = ["4"];
      temp.warehouseId = this.warehouseId;
      this.axios
        .post(
          api.fullManage_exportDeliveryOrder,
          this.$common.removeEmpty(temp)
        )
        .then((res) => {
          if (res.data.code === 0) {
            this.$Message.success("导出成功");
            fun && fun();
          }
        });
    },
    qualityTest(datas) {
      let { data, fun } = datas;
      let temp = {};
      temp.createStartTime = this.$uDate.reduceTime(
        data.createStartTime + " 00:00:00"
      );
      temp.createEndTime = this.$uDate.reduceTime(
        data.createEndTime + " 23:59:59"
      );
      temp.warehouseId = this.warehouseId;
      this.axios
        .post(api.fullManage_exportQualityCheck, this.$common.removeEmpty(temp))
        .then((res) => {
          if (res.data.code === 0) {
            this.$Message.success("导出成功");
            fun && fun();
          }
        });
    },
    // 批量分配
    dropOption() {
      let list = this.tableSltData || [];
      if (!list.length) {
        this.$Message.warning("未选择数据");
        return;
      }
      this.$Modal.confirm({
        title: "操作提示",
        content: "<p>确认对选中的出库单进行库存分配？</p>",
        loading: true,
        onOk: () => {
          let temp = {
            pickingNoList: list.map((val) => val.pickingNo),
            warehouseId: this.warehouseId,
          };
          this.axios
            .post(api.directModifyDistributionAll, temp)
            .then((res) => {
              if (res.data.code === 0) {
                let data = res.data.datas;
                if (data.length) {
                  for (let i = 0; i <= data.length - 1; i++) {
                    this.$Message.error(data[i].errorMsg);
                    break;
                  }
                  return;
                }
                this.$Message.success("操作成功");
                this.searchFn();
              }
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
      });
    },
    // 返回搜索条件；delParmas：要删除的key集合
    paramsFn(delParmas = []) {
      let temp = this.$common.copy(this.searchParams);
      let olist = arrayToObj(outListStatusList);
      // 出库单状态实际传值
      if (temp.pickingStatus.length) {
        let pickingNewStatus = [];
        temp.pickingStatus.forEach((k) => {
          // let pickingItem = olist[k];
          if (olist[k] && olist[k].statusList) {
            pickingNewStatus.push(...olist[k].statusList);
          }
        });
        temp.pickingNewStatus = pickingNewStatus;
        delete temp.pickingStatus;
      }
      // 时间处理
      if (temp.createStartTime && temp.createEndTime) {
        temp.createStartTime = this.$uDate.reduceTime(
          temp.createStartTime + " 00:00:00"
        );
        temp.createEndTime = this.$uDate.reduceTime(
          temp.createEndTime + " 23:59:59"
        );
      }
      temp.warehouseId = this.warehouseId;
      // temp.valueAddedServiceList = !this.$common.isEmpty(temp.valueAddedServiceList) ? [temp.valueAddedServiceList] : [];
      delParmas.forEach((key) => {
        delete temp[key];
      });
      return this.$common.removeEmpty(temp);
    },
    createTimeChange(e) {
      this.searchParams.createStartTime = e[0] || "";
      this.searchParams.createEndTime = e[1] || "";
    },
    searchFn() {
      this.tableLoading = true;
      if (this.getPermission("fullTrusteeshipPicking_queryList")) {
        let obj = this.paramsFn();
        this.axios
          .post(api.fullManage_queryList, obj)
          .then((res) => {
            if (res.data.code === 0) {
              this.data = (res.data.datas.list || []).map((k) => {
                k._checked = false;
                return k;
              });
              this.totalRecords = res.data.datas.total;
            }
          })
          .finally(() => {
            this.tableLoading = false;
            this.$refs.selection.selectAll(false);
          });
      } else {
        this.gotoError(); // 无权限
        this.tableLoading = false;
      }
    },
    // 查询出库单各状态数量
    getOrderStatusNumber() {
      this.axios
        .post(api.fullManage_queryStatusCount + this.warehouseId)
        .then((res) => {
          if (res.data.code === 0) {
            let data = res.data.datas || {};
            this.outListStatusList.forEach(k => {
              if (['deliverFinish'].includes(k.tabName)) return;
              k.total = data[k.tabName] || 0;
            })
          }
        })
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
    // 生成拣货单
    clickAssignBatch(list) {
      if (!list.length) {
        this.$Message.warning("请勾选数据");
        return;
      }
      let [pickFlag, goodnoFlag, pickingType] = [false, false, new Set()];
      list.forEach((k) => {
        !["16"].includes(k.pickingNewStatus) && (pickFlag = true);
        k.pickingGoodsNo && (goodnoFlag = true);
        pickingType.add(k.pickingType);
      });
      if (pickingType.size > 1) {
        this.$Message.warning("只能选择同种出库单类型~");
        return;
      }
      if (pickFlag || goodnoFlag) {
        this.$Message.error({
          content: "只有分配完成且未生成拣货的单才能生成拣货单!",
          duration: 2,
        });
        return;
      }
      this.createPickInfo.pickingList = list;
      this.createPickInfo.createPickListModel = true;
    },
    // 表格选择项变化
    tableChange(data) {
      let list = data.map((k) => k.pickingId);
      this.data.forEach((k, i) => {
        this.$set(this.data[i], "_checked", list.includes(k.pickingId));
      });
    },
    // 创建出库单
    addStock(data) {
      if (!data) {
        this.selectPlatformInfo.visible = true;
        return;
      }
      this.addStockInfo.data = data;
      this.addStockInfo.dialogVisible = true;
    },
    // 重置按钮
    reset() {
      this.$refs["searchParams"].resetFields();
      this.shippingMethodModel = this.searchParams.pickingExtendList = [];
      this.getTime();
    },
    // 根据平台获取对应的店铺信息
    accountChange(e) {
      let item = this.platformList[e] || {};
      this.$store
        .dispatch("getAllStoreList", { platformId: item.platformId })
        .then((list) => {
          this.searchParams.saleAccountId = "";
          this.shopList = list;
        });
    },
    // 问题件处理
    processProblem(row, isEdit) {
      this.problemInfo.isEdit = isEdit;
      this.problemInfo.data = row;
      this.problemInfo.visible = true;
    },
    uploadMulList() {
      this.mulUpload.data = this.$common.copy(this.tableSltData || []);
      this.mulUpload.visible = true;
    },
  },
};
</script>
<style lang="less">
.fullyManageIndex {
  height: 100%;
  position: relative;
}

.textOverTwo .ivu-tooltip-rel {
  overflow: hidden;
  -webkit-line-clamp: 2;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}
</style>
