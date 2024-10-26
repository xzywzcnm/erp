<template>
  <div class="sellStockOut">
    <!-- 列表页 -->
    <div v-show="workShow === 'list'" class="listPage">
      <!--搜索-->
      <div class="searchMain">
        <Form ref="searchParams" :model="searchParams" :label-width="100" :rules="ruleValidate">
          <dyt-filter ref="dyt-filter" @expand="expand">
            <Form-item label="出库单编号：">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.pickingNo"
                placeholder="多个出库单请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="出库单状态：">
              <dyt-select v-model="searchParams.pickingNewStatus" :multiple="true" :max-tag-count="1">
                <Option v-for="item in outListStatusList" :value="item.value" :key="item.value" :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="出库单类型：">
              <dyt-select v-model="searchParams.pickingType" :multiple="true" :max-tag-count="1">
                <Option v-for="item in outListTypeList" :value="item.value" :key="item.value" :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="物流商单号：">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.logisticsNoList"
                placeholder="多个物流商单号请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="物流商：">
              <dyt-select v-model="searchParams.logisticsProvidersCodeList" :multiple="true" :max-tag-count="1">
                <Option v-for="item in apiLogisterList" :value="item.code" :key="item.code" :label="item.name">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="运输方式：">
              <dyt-select v-model="searchParams.transportMethodList" :multiple="true" :max-tag-count="1">
                <Option v-for="item in shippingList" :value="item.value" :key="item.value" :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="仓储名称/代码：">
              <dyt-select v-model="searchParams.warehouseNameList" :multiple="true" :max-tag-count="1">
                <Option v-for="(item, index) in wareHouseList" :key="index + 'wareHouseList'" :value="item.warehouseId"
                  :label="item.warehouseName"></Option>
              </dyt-select>
            </Form-item>
            <Form-item label="创建时间：">
              <DatePicker type="daterange" transfer placeholder="选择日期" style="width: 100%"
                v-model="searchParams.createTime"></DatePicker>
            </Form-item>
            <Form-item label="创建人：">
              <dyt-select v-model="searchParams.createdBys" :multiple="true" :max-tag-count="1">
                <Option v-for="item in $store.getters.userInfoList" :key="item.userId" :label="item.userName"
                  :value="item.userId"></Option>
              </dyt-select>
            </Form-item>
            <Form-item label="拣货单号：">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.pickingGoodsNo"
                placeholder="多个编号请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="拣货完成：">
              <dyt-select v-model="searchParams.packageGoodsSign">
                <Option value="1">Y</Option>
                <Option value="0">N</Option>
              </dyt-select>
            </Form-item>
            <Form-item label="装箱状态：">
              <dyt-select v-model="searchParams.boxFinishStatus">
                <Option v-for="item in boxStatusList" :value="item.value" :key="item.value" :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="总运费：">
              <div class="total-freight">
                <Form-item label="" :label-width="0" prop="beginExpense">
                  <Input v-model.trim="searchParams.beginExpense" prefix="logo-yen" type="number"
                    class="spinButton"></Input>
                </Form-item>
                <Icon type="md-remove" />
                <Form-item label="" :label-width="0" prop="endExpense">
                  <Input v-model.trim="searchParams.endExpense" prefix="logo-yen" type="number"
                    class="spinButton"></Input>
                </Form-item>
              </div>
            </Form-item>
            <!-- <Form-item label="增值服务：" prop="valueAddedServiceList">
              <dyt-select v-model="searchParams.valueAddedServiceList">
                <Option v-for="(item, i) in valueAddServicesOption" :key="i + 'valueAddedServiceList'" :label="item.label"
                  :value="item.value">
                </Option>
              </dyt-select>
            </Form-item> -->
            <div slot="operation">
              <Button type="primary" @click="searchData" :disabled="SearchDisabled" icon="ios-search"
                class="mr10">查询</Button>
              <Button @click="reset" icon="md-refresh">重置</Button>
            </div>
          </dyt-filter>
        </Form>
      </div>
      <!--排序-->
      <div class="grayBg">

      </div>
      <!--工具栏-->
      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <Button type="primary" @click="newStockOutList" class="mr10"
              :disabled="!getPermission('wmsFbaPicking_createFbaPicking')">
              创建出库单
            </Button>
            <Button type="primary" @click="clickAssignBatch()" :disabled="!getPermission('wmsPicking_createOtherPickingGoods_batch')
              ">
              生成拣货单
            </Button>
            <Button type="primary" class="ml10" @click="batchPrintBagTag">
              打印袋标
            </Button>
            <Button type="primary" class="ml10" @click="openBaggingNotarize">
              确认装袋
            </Button>
            <Dropdown style="margin-left: 5px">
              <Button type="primary"><span class="icon iconfont" style="font-size: 12px">&#xe639;</span>导出
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem @click.native="exportSelect" v-if="getPermission('wmsFbaPicking_export_batch')">导出选中数据
                </DropdownItem>
                <DropdownItem @click.native="exportAllOrSlt" v-if="getPermission('wmsFbaPicking_export_all')">导出所有结果集
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button type="primary" @click="openInportModal" icon="md-archive"
              :disabled="!getPermission('wmsFbaPicking_import')" style="margin-left: 5px">导入出库单</Button>
            <Dropdown style="margin-left: 5px">
              <Button icon="ios-copy-outline">批量操作
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem v-if="getPermission('wmsFbaPicking_modifyFbaDistributionAll')"
                  @click.native="dropOption(tableSltData)">批量分配
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
          <Table border highlight-row ref="selection" :columns="columns" :loading="TableLoading" :data="data"
            @on-selection-change="tableChange" :height="tableHeight">
            <template slot-scope="{ row }" slot="pickingNo">
              <a href="javascript:;" @click="
                getPermission('wmsFbaPicking_queryFbaDetail')
                  ? pickingDetail(row, false)
                  : ''
                " :style="row.pickingNewStatus == 99 ? 'color:#999;' : ''">{{ row.pickingNo }}</a>
            </template>
            <template slot-scope="{ row }" slot="pickingType">
              <div v-for="item in outListTypeList" :key="item.value">
                <span v-if="row.pickingType === item.value">{{
                  item.label
                }}</span>
              </div>
            </template>
            <template slot-scope="{ row }" slot="pickingStatus">
              <div v-for="item in outListStatusList" :key="item.value" :style="item.style">
                <span v-if="row.pickingNewStatus === item.value" style="cursor: pointer" :hover="showFlowChart(item)">
                  <Poptip placement="top" transfer trigger="hover" transfer-class-name="flow-poptip">
                    <span v-if="boxStatusKey.includes(row.isUploadWytPackage) &&
                      [8, '8'].includes(row.pickingNewStatus) &&
                      ['O10'].includes(row.pickingType)
                      ">
                      {{
                        `${item.label || ""}(${boxStatus[row.isUploadWytPackage].txt
                        })`
                      }}
                    </span>
                    <span v-else>
                      {{ item.label }}
                    </span>
                    <div slot="content">
                      <flow-chart :row="row"></flow-chart>
                    </div>
                  </Poptip>
                </span>
              </div>
            </template>
            <template slot-scope="{ row }" slot="transportMethod">
              <div v-for="item in shippingList" :key="item.value + 'shippingList'">
                <span v-if="row.transportMethod === item.value">{{
                  item.label
                }}</span>
              </div>
            </template>
            <template slot-scope="{ row }" slot="totalNumCny">
              <div>{{ row.skuNumbers || 0 }} 件</div>
              <div>
                {{
                  $common.isNumber(row.productTotalPrice)
                  ? `￥${(row.productTotalPrice || 0).toFixed(2)}`
                  : row.productTotalPrice || ""
                }}
              </div>
            </template>
            <template slot-scope="{ row }" slot="totalTransportExpense">
              <div class="price-sty">
                <span class="price-font" v-html="priceComput(row.totalTransportExpense)"></span>
              </div>
            </template>
            <template slot-scope="{ row }" slot="createdName">
              <Tooltip max-width="400" placement="top" :content="(row.createdName || '') +
                (row.businessUnit ? '-' : '') +
                (row.businessUnit || '')
                " v-if="row.createdName || row.businessUnit" transfer transfer-class-name="self-tooltip">
                <div class="create-line">
                  <span class="created-name">{{ row.createdName || "" }}</span>
                  <span v-if="row.businessUnit"> - </span>
                  <span>{{ row.businessUnit || "" }}</span>
                </div>
              </Tooltip>
            </template>
            <template slot-scope="{ row }" slot="createdTime">
              <div v-if="row.createdTime">
                {{ $uDate.dealTime(row.createdTime) }}
              </div>
            </template>
            <template slot-scope="{ row, index }" slot="action">
              <Dropdown :transfer="true" trigger="click">
                <Button type="default" :style="{ width: '100px' }" icon="ios-hammer">
                  操作
                  <Icon type="md-arrow-dropdown"></Icon>
                </Button>
                <DropdownMenu slot="list">
                  <DropdownItem @click.native="pickingDetail(row, false)"
                    v-if="getPermission('wmsFbaPicking_queryFbaDetail')">查看</DropdownItem>

                  <div v-if="row.pickingStatus && row.pickingStatus != 99">
                    <!-- 未分配前 -->
                    <DropdownItem @click.native="dropOption([row])" v-if="['0', '1'].includes(row.pickingStatus) &&
                      getPermission('wmsFbaPicking_modifyFbaDistributionAll')
                      ">
                      分配按订单</DropdownItem>
                    <!-- 分配完成后 -->
                    <DropdownItem @click.native="deliverGood(row)" v-if="(!['O10'].includes(row.pickingType) &&
                      row.pickingStatus == 8 &&
                      getPermission('wmsFbaPicking_deliverGoods')) ||
                      (['O10'].includes(row.pickingType) &&
                        [1, 2, '1', '2'].includes(row.isUploadWytPackage))
                      ">发货</DropdownItem>
                    <!-- 作废订单不可编辑 -->
                    <DropdownItem @click.native="
                      pickingDetail(row, true) &&
                      getPermission('wmsFbaPicking_editFbaPicking')
                      ">编辑
                    </DropdownItem>
                    <!-- 订单创建，部分分配，分配完成都可作废row.pickingGoodsStatus === '0' -->
                    <DropdownItem @click.native="tovoid(row)" v-if="['0', '1', '2', '9'].includes(row.pickingNewStatus) &&
                      getPermission('wmsFbaPicking_invalid')
                      ">
                      作废</DropdownItem>
                    <!-- 生成拣货单之前可冻结 -->
                    <DropdownItem @click.native="freezeAllocation(row)" v-if="['0', '1'].includes(row.pickingStatus) &&
                      getPermission('wmsFbaPicking_distributionFrozen')
                      ">
                      冻结分配</DropdownItem>
                    <!-- 填写货箱信息后 -->
                    <DropdownItem @click.native="exportBoxinfo(row)" v-if="row.boxFinishStatus > 1 &&
                      getPermission('wmsFbaPicking_exportCargoBox')
                      ">导出货箱信息
                    </DropdownItem>
                    <!-- 装箱 -->
                    <template v-if="row.pickingNewStatus == 10 &&
                      row.boxFinishStatus < 2 &&
                      getPermission('wmsFbaPicking_checkBoxPage') &&
                      temuPack(row)
                      ">
                      <DropdownItem @click.native="packing(row)">装箱</DropdownItem>
                    </template>
                    <!-- 打印商品标签 拣货完成后可打印 -->
                    <DropdownItem @click.native="printGoodLabel(row, index)" v-if="['10', '11', '12', '8', '4'].includes(
                      row.pickingNewStatus
                    )
                      ">打印商品标签</DropdownItem>
                    <template v-if="[0, '0'].includes(row.isUploadWytPackage) &&
                      [8, '8'].includes(row.pickingNewStatus) &&
                      getPermission('wmsFbaPicking_checkBoxPage') &&
                      ['O10'].includes(row.pickingType)
                      ">
                      <DropdownItem @click.native="uploadLogistics(row)">上传</DropdownItem>
                    </template>
                    <!--  -->
                  </div>
                </DropdownMenu>
              </Dropdown>
            </template>
          </Table>
        </div>
      </div>

      <!--分页-->
      <div class="pagesMain">
        <Page :total="tableItemTotal" :current="searchParams.pageNum" :page-size="searchParams.pageSize" show-total
          show-sizer show-elevator @on-change="pageNumChange" @on-page-size-change="pageSizeChange"
          :page-size-opts="pageArray"></Page>
      </div>
    </div>

    <div class="detail-contain">
      <!-- 新建出库单 -->
      <add-stock-order v-if="workShow === 'create'" :workShow.sync="workShow" @searchData="searchData">
      </add-stock-order>
      <!-- 详情 -->
      <detail-stock-order v-if="workShow === 'detail'" :workShow.sync="workShow" :isEdit="isEdit" :rowData="rowData"
        @searchData="searchData"></detail-stock-order>
      <!-- 装箱 -->
      <packing-box v-if="workShow === 'packing'" :workShow.sync="workShow" :rowData="rowData" @searchData="searchData">
      </packing-box>
    </div>

    <!-- 生成拣货单 -->
    <div v-if="createPickListModel">
      <Modal width="700" v-model="createPickListModel" title="生成拣货单" :footer-hide="true" :mask-closable="false">
        <createPickList :apiParams="tableSltData" :apiCondition="searchParams"
          :type="tableSltData[0] && tableSltData[0].pickingType" :createType="'select'" @closeSuccess="closeSuccess"
          :sortedType="true" :isSplitCombination="true" :maxsku="true">
        </createPickList>
      </Modal>
    </div>

    <!-- 导入前的模态框 -->
    <import-stockout :switchInportModal.sync="switchInportModal" @searchData="searchData"></import-stockout>
    <!--冻结分配弹窗-->
    <freezeAssignmentModal ref="frozenModal" frozenModalTalg="list" :deliveryOrder="deliveryOrder"
      @updateData="updateData" :mulSearchInput="true"></freezeAssignmentModal>
    <!-- 打印袋标 -->
    <printBagTag :module-visible.sync="printBagTagVisible" />
    <!-- 装袋确认 -->
    <baggingNotarize :module-visible.sync="baggingNotarizeVisible" @refreshList="searchFn" />
  </div>
</template>
<script>
import Big from "big.js";
import api from "@/api/api";
import regular from "@/utils/regular";
import common from "@/components/mixin/common_mixin";
import Draggabilly from "draggabilly";
import addStockOrder from "./components/addStockOrder";
import detailStockOrder from "./components/detailStockOrder";
import createPickList from "@/views/wms/components/exWarehouse/createPickList";
import freezeAssignmentModal from "@/views/wms/components/exWarehouse/freezeAssignmentModal";
import importStockout from "./components/importStockout";
import printBagTag from "./components/printBagTag";
import baggingNotarize from "./components/baggingNotarize";
import packingBox from "./components/packingBox";
import {
  outListStatusList,
  outListTypeList,
  columns,
  boxStatusList,
  shippingList,
} from "./components/fileData";
import flowChart from "./components/flowChart";
import tableHeight_mixin from "@/components/mixin/tableHeight_mixin";
let searchParams = {
  createdBys: [],
  createTime: [],
  pickingNewStatus: [],
  // 出库单类型, O5:FBA出库, O6:WFS出库, O7:EF出库, O8:谷仓, O9:SHL出库, O10:万邑通
  pickingType: [],
  outListStatus: [], // 出库单状态
  pickingNo: [], // 出库单编号
  boxFinishStatus: "", // 装箱类型
  packageGoodsSign: "", // 拣货完成
  pickingGoodsNo: [], // 拣货单号
  beginExpense: "", // 最低运费
  endExpense: "", // 最高运费
  pageNum: 1,
  pageSize: 50,
  transportMethodList: [], // 运输方式
  logisticsNoList: [], // 物流商单号
  logisticsProvidersCodeList: [], // 物流商
  warehouseNameList: [], // 仓储代码
  orderBy: "CT", // 排序缓存值
  orderSeq: "DESC", // 排序
  // valueAddedServiceList: null,
};
export default {
  mixins: [common, tableHeight_mixin],
  components: {
    addStockOrder,
    detailStockOrder,
    createPickList,
    importStockout,
    freezeAssignmentModal,
    Draggabilly,
    packingBox,
    flowChart,
    printBagTag,
    baggingNotarize,
  },
  data() {
    let self = this;
    return {
      labelWidth: 90,
      searchParams: {},
      boxStatus: {
        0: { txt: "未上传" },
        1: { txt: "已上传" },
        2: { txt: "已确认" },
      },
      printBagTagVisible: false,
      baggingNotarizeVisible: false,
      sortButtonList: [
        {
          sortHeader: "按添加时间",
          sortField: "CT",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "按出库单状态",
          sortField: "WS",
          sortType: "DESC",
        },
      ],
      rowData: {}, // 表格某列数据
      switchInportModal: false, // 导入模态框
      workShow: "list", // 页面显示列表还是详情
      tableSltData: [], // 表格勾中
      importUrl: api.importFBAPicking, // 导入接口
      wareId: this.getWarehouseId(), // 仓库id
      createPickListModel: false, // 拣货单弹框
      printModal: false, // 打印条码
      tableItemTotal: 0, // 分页总条数
      frozenModalTalg: "list", // 冻结分配
      deliveryOrder: null, // 出库单号
      outListStatusList: outListStatusList,
      outListTypeList: outListTypeList,
      columns: columns,
      data: [],
      isEdit: false, // 详情是否可编辑
      boxStatusList: boxStatusList,
      shippingList: shippingList,
      ruleValidate: {
        beginExpense: [{ validator: self.validateMinFreight, trigger: "blur" }],
        endExpense: [{ validator: self.validateMaxFreight, trigger: "blur" }],
      },
      apiLogisterList: [], // 物流商列表
      wareHouseList: [], // 仓库列表
      // valueAddServicesOption: [
      //   {
      //     label: '抽真空',
      //     value: 0
      //   },
      //   {
      //     label: '质检',
      //     value: 1
      //   },
      //   {
      //     label: '海外仓装车',
      //     value: 2
      //   },
      // ],//增值服务
    };
  },
  created() {
    this.reset();
    this.getlosgisList();
  },
  computed: {
    headObj() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders,
      };
    },
    boxStatusKey() {
      const keys = Object.keys(this.boxStatus);
      const numberKeys = keys.map((k) => Number(k));
      return [...keys, ...numberKeys];
    },
    securityUser() {
      if (
        this.$store.getters["authUserInfo"] &&
        this.$store.getters["authUserInfo"].securityUser
      ) {
        return this.$store.getters["authUserInfo"].securityUser;
      }
      return {};
    },
  },
  watch: {
    workShow: function (val) {
      if (val === "list") {
        this.$nextTick(() => {
          this.computedTableHeight();
        });
      }
    },
  },
  methods: {
    // 查询按钮
    searchData() {
      this.searchParams.pageNum = 1;
      if (this.$refs["searchParams"]) {
        this.$refs["searchParams"].validate((valid) => {
          if (valid) this.searchFn();
        });
      } else {
        this.searchFn();
      }
    },
    // 重置按钮
    reset() {
      this.searchParams = JSON.parse(JSON.stringify(searchParams));
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.searchParams.orderSeq = type;
      this.searchParams.orderBy = feild;
      this.searchFn();
    },
    // 出库单列表
    searchFn() {
      this.TableLoading = true;
      this.SearchDisabled = true;
      if (this.getPermission("wmsFbaPicking_queryFbaPicking")) {
        let obj = this.paramsFn();
        this.axios
          .post(api.queryFbaPicking, obj)
          .then(({ data }) => {
            if (!(data && data.code === 0)) return;
            this.data = data.datas.list || [];
            this.tableItemTotal = data.datas.total;
          })
          .finally(() => {
            this.TableLoading = false;
            this.SearchDisabled = false;
          });
      } else {
        this.gotoError(); // 无权限
      }
    },
    // 出库单勾选
    tableChange(data) {
      this.tableSltData = data;
    },
    // 创建出库单
    newStockOutList() {
      this.workShow = "create";
    },
    // 生成拣货单后关闭
    closeSuccess() {
      this.createPickListModel = false;
      this.searchFn();
    },
    // 导入
    openInportModal() {
      this.switchInportModal = true;
    },
    // 生成拣货单
    clickAssignBatch() {
      let list = this.tableSltData;
      if (!list.length) {
        this.$Message.warning("请勾选数据");
        return;
      }
      // 只有分配完成且没有拣货单编号的单才能生成拣货单
      let [pickFlag, goodnoFlag, pickingType] = [false, false, new Set()];
      list.forEach((k) => {
        !(k.pickingStatus === "2") && (pickFlag = true);
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
      this.createPickListModel = true;
    },
    // 打印袋标
    batchPrintBagTag() {
      this.printBagTagVisible = true;
    },
    // 打开装袋确认弹窗
    openBaggingNotarize() {
      this.baggingNotarizeVisible = true;
    },
    // 出库单 查看/编辑
    pickingDetail(row, isEdit) {
      this.workShow = "detail";
      this.isEdit = isEdit;
      this.rowData = JSON.parse(JSON.stringify(row));
    },
    // 解冻并分配后，更新列表数据
    updateData(value) {
      if (value === this.frozenModalTalg) {
        this.searchFn();
      }
    },
    // 冻结分配
    freezeAllocation(row) {
      this.$refs.frozenModal.frozenModal = true;
      this.deliveryOrder = row.pickingNo;
    },
    // 发货
    deliverGood(row) {
      if (!(row.pickingStatus === "8")) {
        this.$Message.error("该状态下不能发货!");
        return;
      }
      this.isDelModal(
        () => {
          let obj = [row.pickingNo];
          this.axios.post(api.deliver_goods, obj).then(({ data }) => {
            if (data && data.code === 0) {
              this.$Message.success("操作成功");
              this.searchFn();
            }
          });
        },
        (err) => {
          console.error(err);
        },
        "确认是否发货"
      );
    },
    // 分配
    dropOption(rowObj) {
      let list = rowObj.map((val) => val.pickingNo);
      if (!list.length) {
        this.$Message.info("未选择数据");
        return;
      }
      let flag = false;
      rowObj.forEach((k) => {
        !["0", "1"].includes(k.pickingStatus) && (flag = true);
      });
      if (flag) {
        this.$Message.warning({
          content: "只有处于订单创建和部分分配状态的单才能进行分配!",
          duration: 3,
        });
        return;
      }
      let obj = {
        pickingNoList: list,
        warehouseId: this.wareId,
      };
      this.axios.post(api.assign_all, obj).then(({ data }) => {
        if (!(data && data.code === 0)) return;
        let resultInfo = data.datas || [];
        if (!resultInfo.length) {
          this.$Message.success("操作成功");
          this.searchFn();
          return;
        }
        this.$Message.error(resultInfo[0].errorMsg);
      });
    },
    // 导出选中
    exportSelect() {
      let list = this.tableSltData;
      if (!list.length) {
        this.$Message.warning("请选择导出数据");
        return;
      }
      let temp = {
        warehouseId: [this.wareId],
        pickingIdList: list.map((k) => {
          return k.pickingId;
        }),
        businessDeptId: this.securityUser.businessDeptId, // 所属事业部
        businessDeptIds: this.securityUser.businessDeptIds, // 可查看的事业部
      };
      this.$Spin.show();
      this.axios
        .post(api.fbaPickingExportBatch, temp)
        .then(({ data }) => {
          if (!(data && data.code === 0)) return;
          this.$Message.success("导出成功");
          this.$refs.selection.selectAll(false);
        })
        .finally(() => {
          this.$Spin.hide();
        });
    },
    // 导出全部
    exportAllOrSlt() {
      let obj = this.paramsFn();
      obj.warehouseId = [this.wareId];

      this.$Spin.show();
      this.axios
        .post(api.exportAll, obj)
        .then(({ data }) => {
          if (!(data && data.code === 0)) return;
          this.$Message.success("导出成功");
        })
        .finally(() => {
          this.$Spin.hide();
        });
    },
    // 搜索参数数据处理
    paramsFn() {
      this.searchParams.pageSize = this.getPageSizeCache(); // 获取缓存的页数
      let searchParams = this.searchParams;
      let temp = {
        orderBy: searchParams.orderBy, // 排序字段
        orderSeq: searchParams.orderSeq, // 排序顺序
        createdStartTime:
          searchParams.createTime[0] &&
          this.$uDate.getDateTime(searchParams.createTime[0], "fulltime"), // 创建开始时间
        createdEndTime:
          searchParams.createTime[1] &&
          this.$uDate.getDateTime(searchParams.createTime[1], "fulltime"), // 创建结束时间
        warehouseId: [this.wareId], // 仓库 ID
        businessDeptId: this.securityUser.businessDeptId, // 所属事业部
        businessDeptIds: this.securityUser.businessDeptIds, // 可查看的事业部
      };
      Object.keys(searchParams).forEach((k) => {
        temp[k] = searchParams[k];
      });
      // temp.valueAddedServiceList = !this.$common.isEmpty(searchParams.valueAddedServiceList) ? [searchParams.valueAddedServiceList] : [];
      temp = this.$common.removeEmpty(temp);
      return temp;
    },
    pageNumChange(page) {
      this.searchParams.pageNum = page;
      this.searchFn();
    },
    pageSizeChange(size) {
      this.setPageSizeCache(size);
      this.searchParams.pageSize = size;
      this.searchFn();
    },
    // 作废
    tovoid(row) {
      this.isDelModal(
        () => {
          this.axios
            .post(`${api.invalid}?pickingId=${row.pickingId}`)
            .then(({ data }) => {
              if (!(data && data.code === 0)) return;
              if (data.datas && data.datas.errorCode === 999993) {
                this.$Message.error(data.datas.error);
                return;
              }
              this.$Message.success("操作成功!");
              this.searchFn();
            });
        },
        (err) => {
          console.error(err);
        },
        "确认是否作废该出库单"
      );
    },
    // 导出货箱信息
    exportBoxinfo(row) {
      this.$Spin.show();
      let exportParams = { pickingId: row.pickingId };
      let { pickingType, pickingSubType } = row;
      let [value, exportTypeList] = [null, { O10: 1, O13: 4 }];
      // exportType: 0普通 1万邑通 2备货 3寄样 4FBK
      if (pickingType === "O11") {
        value = pickingSubType == 1 ? 2 : 3;
      } else if (exportTypeList[pickingType]) {
        value = exportTypeList[pickingType];
      }
      value && (exportParams.exportType = value);

      this.axios({
        method: "get",
        url: api.wmsPickingBoxesExcel,
        params: exportParams,
        responseType: "blob",
        timeout: 600000,
      })
        .then((resData) => {
          if (!resData.resData) return;
          this.$Message.success("导出成功");
          this.$common.downFile(resData.resData, resData.filename);
        })
        .finally(() => {
          this.$Spin.hide();
        });
    },
    // 装箱
    packing(row) {
      this.rowData = JSON.parse(JSON.stringify(row));
      this.workShow = "packing";
    },
    // 上传物流信息
    uploadLogistics(row) {
      this.isDelModal(
        () => {
          this.axios
            .post(`${api.uploadWytPackage}${row.pickingId}`)
            .then((res) => {
              if (res.data.code === 0) {
                this.$Message.success("物流信息上传成功！");
                this.$nextTick(() => {
                  this.searchFn();
                });
              }
            });
        },
        (err) => {
          this.$Message.error("物流信息上传失败！");
          console.error(err);
        },
        "物流信息上传后不能再次上传，是否确认上传物流信息？"
      );
    },
    // 显示流程图
    showFlowChart(item) { },
    // 处理总运费
    priceComput(totalTransportExpense) {
      let total = new Big(totalTransportExpense || 0).toFixed(2);
      return `￥<span style="font-size: 16px;font-weight:bold;">${total.split(".")[0]
        }</span><span>.${total.split(".")[1]}</span>`;
    },
    validateMinFreight(rule, value, callback) {
      this.validateFreight(rule, value, callback, "beginExpense");
    },
    validateMaxFreight(rule, value, callback) {
      this.validateFreight(rule, value, callback, "endExpense");
    },
    validateFreight(rule, value, callback, typeName) {
      if (!value) return callback();
      let arr = value.split(".") || [];
      if (arr[0] && arr[0].length > 6) {
        return callback(new Error("长度必须小于6位数"));
      }
      if (!regular.hasPriceNum.test(value)) {
        return callback(new Error("必须大于或等于0的数字,且最多允许两位小数"));
      }
      let { endExpense, beginExpense } = this.searchParams;
      if (
        typeName === "beginExpense" &&
        endExpense.length &&
        new Big(beginExpense).minus(endExpense) > 0
      ) {
        return callback(new Error("开始区间必须小于或等于结束区间"));
      }
      if (
        typeName === "endExpense" &&
        beginExpense.length &&
        new Big(beginExpense).minus(endExpense) > 0
      ) {
        return callback(new Error("结束区间必须大于或等于开始区间"));
      }
      callback();
    },
    // 处理拣货单号显示
    getPickingGoods(row) {
      let pickingGoodsNo = row.pickingGoodsNo
        ? row.pickingGoodsNo.split(",")
        : [];
      return pickingGoodsNo;
    },
    // 打印所有商品标签
    printGoodLabel(row, index) {
      let fun = (labelUrl) => {
        let prefix = "filenode/s/";
        let path = labelUrl.indexOf(prefix) >= 0 ? labelUrl : prefix + labelUrl;
        let url = window.location.origin + "/wms-service/" + path;
        window.open("/wms-service/static/pdf/web/viewer.html?file=" + url);
      };
      // this.$Message.error('打印标签数量过大，请点击出库单详情按照产品打印标签!');
      if (row.printPath) return fun(row.printPath);
      // 无路径调用接口拿取路径
      this.TableLoading = true;
      this.axios
        .get(`${api.createLabel}/${row.pickingNo}`)
        .then(({ data }) => {
          if (data && data.code === 0) {
            this.data[index].printPath = data.datas;
            fun(data.datas);
          }
        })
        .finally(() => {
          this.TableLoading = false;
        });
    },
    // 获取物流商列表
    getlosgisList() {
      return this.axios
        .get(api.get_logisterList + `?carrierId=${null}`)
        .then(({ data }) => {
          if (data && data.code === 0) {
            this.apiLogisterList = data.datas || []; // 列表值如果是PMS 0,其他为 1
          }
        });
    },
    // 取可用的仓库类型“第三方”: warehouseType: 1 第三方 0 自营
    getWareHouseList() {
      let list = this.$store.state.warehouseList || [];
      this.wareHouseList = list.filter((k) => {
        return k.warehouseType == 1;
      });
    },
    // temu类型且已质检
    temuPack(row) {
      if (row.pickingType === "O11") return row.qualityCheckStatus == 1;
      return true;
    },
  },
  mounted() {
    this.searchData();
    this.getWareHouseList();
  },
};
</script>
<style lang="less" scoped>
.sellStockOut {
  height: 100%;

  .grayBg {
    margin: 0;
  }

  .detail-contain {
    background: #fff;
  }

  .ivu-icon-ios-close {
    color: #666 !important;
  }

  .price-sty {
    display: flex;
    align-items: center;
    justify-content: center;

    .price-font {
      color: red;

      >span:first-child {
        font-size: 18px;
        font-weight: bold;
      }
    }

    .logoyen {
      color: red;
      margin-right: 4px;
      font-size: 12px;
    }
  }

  :deep(.total-freight) {
    display: flex;
    align-items: center;

    .ivu-form-item-content {
      width: 113px;
    }

    .ivu-form-item {
      margin-bottom: 0;
    }
  }

  :deep(.ivu-table-cell-slot),
  .ivu-tooltip {
    width: 100%;
  }

  .create-line {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    .created-name {
      font-weight: bold;
      // font-size: 14px;
    }
  }
}
</style>
<style lang="less" >
.flow-poptip {
  .ivu-poptip-body {
    padding: 0;
  }

  .ivu-poptip-arrow:after {
    border-top-color: #fffbea !important;
  }

  .ivu-poptip-arrow:before {
    content: " ";
    position: absolute;
    bottom: 0px;
    border-width: 8px;
    margin-left: -8px;
    border-bottom-width: 0;
    border-top-width: 8px;
    border-top-color: rgba(248, 172, 89, 0.6) !important;
    width: 0;
    height: 0;
    border-color: transparent;
    border-style: solid;
    box-sizing: border-box;
  }

  .ivu-poptip-inner {
    box-shadow: 0 3px 14px rgba(0, 0, 0, 0.36);
  }
}
</style>
