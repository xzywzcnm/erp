<template>
  <div>
    <div>
      <div class="commonFilter">
        <div class="card-container">
          <div class="card-content">
            <div class="platformParamsSelect purchaseRequirement">
              <Form
                ref="pageParams"
                :model="pageParams"
                :label-width="labelWidth"
                class="formSearch fmb16"
              >
                <Tabs v-model="pageParams.readyType" @on-click="search(true, 'self')">
                  <TabPane
                    :label="labelFun(item)"
                    :name="item.name"
                    v-for="item in readyTypeList"
                    :key="item.name"
                    :disabled="Tableloading"
                  >
                  </TabPane>
                  <!-- <TabPane :label="'集采('+numList.urgentNum+')'" name="0"></TabPane>
                  <TabPane :label="'普通备货('+numList.generalNum+')'" name="1"></TabPane>
                  <TabPane :label="'海外仓备货('+numList.overseasWarehouseNum+')'" name="2"></TabPane>
                  <TabPane :label="'FBA备货('+numList.fbaNum+')'" name="3"></TabPane> -->
                </Tabs>
                <div style="display: flex">
                  <FormItem label="需求状态" class="requireStatus">
                    <RadioGroup
                      v-model="tabsValue"
                      type="button"
                      @on-click="clickTab"
                    >
                      <Radio :label="0">待下单</Radio>
                      <Radio :label="1">已作废</Radio>
                    </RadioGroup>
                  </FormItem>
                  <FormItem label="所属事业部" class="belongBusinese">
                    <RadioGroup
                      v-model="pageParams.businessDeptId"
                      type="button"
                      @on-change="getList(false)"
                      :disabled="Tableloading"
                    >
                      <Radio
                        v-for="item in businessDeptInfoList"
                        :key="item.id"
                        :label="item.id"
                        :disabled="Tableloading"
                      >
                        <span>{{ item.name }}</span>
                        <span
                          v-if="businessDeptNumberData[pageParams.readyType] && businessDeptNumberData[pageParams.readyType][item.id]"
                          class="business-dept-number"
                        >
                          ({{ businessDeptNumberData[pageParams.readyType][item.id].num }})
                        </span>
                      </Radio>
                    </RadioGroup>
                  </FormItem>
                </div>

                <dyt-filter>
                  <FormItem label="备货仓库" prop="purchaseWarehouseId">
                    <dyt-select
                      v-model="pageParams.purchaseWarehouseId"
                      filterable
                      clearable
                      placeholder="请选择"
                    >
                      <Option
                        v-for="(item, index) in purchaseWarehouseArr"
                        :value="item.warehouseId"
                        :key="index"
                        >{{ item.warehouseName }}</Option
                      >
                    </dyt-select>
                  </FormItem>
                  <FormItem label="采购人员" prop="purchaserId">
                    <dyt-select
                      v-model="pageParams.purchaserId"
                      label-in-value
                      filterable
                      clearable
                      placeholder="请选择"
                    >
                      <Option
                        v-for="(item, index) in purchaserArr"
                        :value="item.id"
                        :key="index"
                        >{{ item.name }}
                      </Option>
                    </dyt-select>
                  </FormItem>

                  <!-- <FormItem label="1688商品" prop="goodsType">
                       <dyt-select v-model="pageParams.goodsType" clearable placeholder="请选择">
                         <Option v-for="(item,index) in goodsTypeArr" :value="item.key" :key="index">{{item.value}}</Option>
                       </dyt-select>
                     </FormItem>
                   </Col>-->
                  <!--<Col :md="6" :lg="4">
                    <FormItem label="状态" prop="status">
                      <dyt-select v-model="pageParams.status" clearable placeholder="请选择">
                        <Option v-for="(item,index) in statusArr" :value="item.key" :key="index">{{item.value}}</Option>
                      </dyt-select>
                    </FormItem>-->
                  <FormItem
                    :label="tabsValue === 0 ? '提交时间' : '作废时间'"
                    prop="supplierType"
                  >
                    <DatePicker
                      transfer
                      type="daterange"
                      placement="bottom-end"
                      placeholder="选择日期"
                      style="width: 100%"
                      split-panels
                      v-model="submitTime"
                      @on-clear="resetDate"
                      :options="dateOptions"
                      @on-change="getDateValue"
                    />
                  </FormItem>
                  <!-- <FormItem class="form-item-label">
                    <dyt-select
                      slot="label"
                      v-model="searchType"
                      style="width: 90px"
                      @on-change="searchTypeChangeFn"
                    >
                      <Option
                        v-for="(item, index) in searchTypeArr"
                        :value="item.key"
                        :key="index"
                        >{{ item.value }}
                      </Option>
                    </dyt-select>
                    <dyt-input
                      v-if="searchType === 0"
                      placeholder="请输入供应商名称"
                      v-model.trim="supOrSku"
                    />
                    <dyt-input-tag
                      :limit="1"
                      :string="true"
                      v-if="searchType === 1"
                      v-model.trim="supOrSku"
                      placeholder="多个用逗号或换行分隔"
                      type="textarea"
                    />
                  </FormItem> -->
                  <FormItem label="供应商">
                    <dyt-input
                      placeholder="请输入供应商名称"
                      v-model.trim="pageParams.supplierName"
                    />
                  </FormItem>
                  <FormItem label="SKU">
                    <dyt-input-tag
                      :limit="1"
                      v-model.trim="pageParams.skuList"
                      placeholder="多个用逗号或换行分隔"
                      type="textarea"
                    />
                  </FormItem>
                  <FormItem label="SPU">
                    <dyt-input-tag
                      :limit="1"
                      v-model.trim="pageParams.spuList"
                      placeholder="多个用逗号或换行分隔"
                      type="textarea"
                    />
                  </FormItem>
                  <FormItem label="供应商类别" prop="supplierAbutmentType">
                    <dyt-select v-model="pageParams.supplierAbutmentType">
                      <Option value="0">未对接系统</Option>
                      <Option value="1">已对接系统</Option>
                      <Option value="2">1688供应商</Option>
                    </dyt-select>
                  </FormItem>
                  <div slot="operation">
                    <Button
                      type="primary"
                      @click="search(false)"
                      :disabled="SearchDisabled"
                      icon="ios-search"
                      >搜索</Button
                    >
                    <Button
                      @click="reset"
                      style="margin-left: 10px"
                      v-once
                      icon="md-refresh"
                      >重置</Button
                    >
                  </div>
                </dyt-filter>

                <!-- <FormItem label="备货类型:" class="readyType">
                  <RadioGroup v-model="pageParams.readyType" type="button" @on-change="search()">
                    <Radio :label="item.value" v-for="item in statusList" :key="item.value">{{item.label}}</Radio>
                  </RadioGroup>
                </FormItem> -->
              </Form>
            </div>
          </div>
        </div>
      </div>
      <div class="flexBox spaceBetween">
        <div class="tableControl">
          <!-- <Button
              type="primary"
              class="iconbuttons"
              v-if="pagePermission.apply && tabsValue === 0"
              @click="applyOrderFn"
              style="margin-left: 12px" >
            申请下单 </Button > -->
          <Dropdown
            @on-click="applyOrderFn"
            v-if="pagePermission.apply && tabsValue === 0"
          >
            <Button type="primary" style="margin-left: 12px"
              >申请下单
              <Icon type="md-arrow-dropdown"></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem name="0">批量申请下单</DropdownItem>
              <DropdownItem name="1">所有需求申请下单</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Dropdown
            @on-click="exportMt"
            v-if="pagePermission.exportByIds"
          >
            <Button type="primary" style="margin-left: 12px"
              ><span class="icon iconfont" style="font-size: 12px"
                >&#xe639;</span
              >
              Excel导出
              <Icon type="md-arrow-dropdown"></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem name="0">导出选中数据</DropdownItem>
              <DropdownItem name="1">导出所有结果集</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <!--<Button type="primary" class="iconbuttons" v-if="pagePermission.export" @click="exportEcxel" style="margin-left: 12px">
            导出采购需求
          </Button>-->
          <Button
            type="primary"
            class="iconbuttons"
            v-if="pagePermission.batchModify"
            @click="modifyPurchaserFn"
            style="margin-left: 12px"
          >
            批量修改采购员
          </Button>
          <Button
            type="primary"
            class="iconbuttons"
            v-if="tabsValue === 0"
            @click="modifyToVoid"
            style="margin-left: 12px"
          >
            批量作废
          </Button>
        </div>
      </div>

      <div class="commonFilter normalTop purchaseRequire">
        <div class="pos-rel">
          <!-- <Tabs type="card" v-model="tabsValue" @on-click="clickTab">
            <TabPane label="待下单" value="0"></TabPane>
            <TabPane label="已作废" value="1"></TabPane>
          </Tabs> -->
          <filterColumns
            v-if="tabsValue === 0"
            ref="filterColumns"
            title="110"
            :columns="requirementColumn"
            filterName="purchaseRequire"
            @setTableColumns="setTableColumns"
          >
          </filterColumns>
          <filterColumns
            v-else
            ref="filterColumns"
            title="1212"
            :columns="requirementColumn01"
            filterName="purchaseRequire1"
            @setTableColumns="setTableColumns"
          >
          </filterColumns>
        </div>
        <div class="orderTable">
          <keep-alive>
            <dTable
              ref="orderTable"
              highlight-row
              :border="true"
              :loading="Tableloading"
              :columns="orderColumn"
              :height="tableHeight"
              @on-selection-change="getSelectValue"
              :data="requirementData"
            >
            </dTable>
          </keep-alive>
          <div class="table-page clear">
            <div class="table-page-right">
              <keep-alive>
                <Page
                  :total="total"
                  @on-change="changePage"
                  show-total
                  :page-size="pageParams.pageSize"
                  show-elevator
                  :current="pageParams.pageNum"
                  show-sizer
                  @on-page-size-change="changePageSize"
                  placement="top"
                  :page-size-opts="pageArray"
                ></Page>
              </keep-alive>
            </div>
          </div>
        </div>
      </div>
    </div>
    <transition name="bounce" class="de">
      <template v-if="purchaseShow === 'addPurchaseOrder'">
        <div class="subLayer infoDetails">
          <div class="mainContent">
            <BatchPurchaseOrder
              v-if="operationBatch"
              @goBackFromAdd="goBackFromAdd"
              @addOrderGoBack="addOrderGoBack"
              :orderData="orderData"
              :orderSource="orderSource"
              :orderType="orderType"
              :editType="editType"
              :purchaseWarehouseArr="purchaseWarehouseArr"
              :purchaserArray="purchaserArr"
            >
              <div class="topper" slot="topper">
                <span class="arrowLeft" @click="goBackFromAdd">
                  <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
                </span>
              </div>
            </BatchPurchaseOrder>
            <addPurchaseOrder
              v-else
              @goBackFromAdd="goBackFromAdd"
              @addOrderGoBack="addOrderGoBack"
              :orderData="orderData"
              :orderSource="orderSource"
              :orderType="orderType"
              :editType="editType"
              :purchaseWarehouseArr="purchaseWarehouseArr"
              :purchaserArray="purchaserArr"
              :tabsValue="tabsValue"
            >
              <div class="topper" slot="topper">
                <span class="arrowLeft" @click="goBackFromAdd">
                  <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
                </span>
              </div>
            </addPurchaseOrder>
          </div>
        </div>
      </template>
    </transition>
    <!--批量修改采购员-->
    <Modal v-model="isShowSettingPurchaser" title="批量修改采购员" width="420">
      <div class="normalTop20">
        <Form
          ref="setting"
          :model="setting"
          :label-width="100"
          :rules="ruleValidate"
        >
          <FormItem label="修改采购员为: " prop="purchaserId">
            <dyt-select
              v-model="setting.purchaserId"
              placeholder="请选择"
              filterable
            >
              <Option
                v-for="(item, index) in purchaserArr"
                :value="item.id"
                :key="index"
                >{{ item.name }}</Option
              >
            </dyt-select>
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: center">
        <Button
          type="primary"
          @click="confirmFn('setting')"
          :loading="modifyLoading"
          style="width: 80px"
          >确定</Button
        >
        <Button
          type="primary"
          @click="isShowSettingPurchaser = false"
          style="width: 80px; margin-left: 20px"
          >关闭</Button
        >
      </div>
    </Modal>
    <!--下单成功-->
    <Modal v-model="isShowOrderSuccess" title="applyOrderScc" width="420">
      <div class="normalTop20"></div>
      <div slot="footer" style="text-align: center">
        <Button
          type="primary"
          @click="isShowOrderSuccess = false"
          style="width: 80px; margin-left: 20px"
          >关闭</Button
        >
      </div>
    </Modal>
    <Modal v-model="model1" title="填写作废信息" @on-visible-change="visible">
      <Form ref="formInline" :model="formInline" :rules="rules">
        <FormItem label="作废原因" prop="obsoleteDesc">
          <Input
            :maxlength="200"
            type="textarea"
            :rows="4"
            v-model="formInline.obsoleteDesc"
          ></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="model1 = false">关闭</Button>
        <Button type="primary" @click="toVoid">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import tableMixin from "@/components/mixin/table_mixin";
import addPurchaseOrder from "./common/addPurchaseOrder";
import BatchPurchaseOrder from "@/views/supplierPurchase/purchaseManagement/components/common/batchPurchaseOrder";
import filterColumns from "@/components/common/filterColumns";
import { copy_clip } from "@/utils/comfun.js";
export default {
  mixins: [Mixin, tableMixin],
  components: {
    BatchPurchaseOrder,
    addPurchaseOrder,
    filterColumns,
  },
  data() {
    let self = this;
    let end = new Date();
    let start = new Date();
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
    return {
      // 暂存获取到的表格数据
      tableData: [],
      orderColumn: [],
      requirementColumn: [],
      requirementColumn01: [],
      businessDeptNumberData: {},
      editType: "",
      rules: {
        obsoleteDesc: {
          required: true,
          message: "作废原因不能为空",
          trigger: "blur",
        },
      },
      operationBatch: false,
      model1: false,
      formInline: {
        obsoleteDesc: "",
        obsoleteTime: "",
      },
      activeData: null,
      tabsValue: 0,
      purchaseShow: "purchaseRequirement",
      pageParamsStatus: false,
      tableHeight: self.getTableHeight(400),
      orderSource: "1", // '1':从采购需求管理申请下单
      orderType: "2", // 1: 新增；2：提交；3：审核；4：向供应商下单
      totalPage: 0,
      total: 0,
      curPage: 1,
      isShowApplyOrder: false,
      isShowSettingPurchaser: false,
      modifyLoading: false, // 批量修改采购人防止重复调用接口
      isShowOrderSuccess: false,
      warehouseArr: [], // 仓库
      purchaseWarehouseArr: [], // 采购仓库
      purchaserArr: [], // 采购人员
      submitTime: [start, end],
      pageParams: {
        readyType: 0,
        goodsType: "", // 商品类型('1'1688商品,'2'非1688商品)
        pageNum: 1,
        pageSize: 50,
        supplierAbutmentType: null, // 供应商类别
        purchaseWarehouseId: "",
        purchaserId: "",
        serialNumber: "",
        skuList: [],
        status: "", // 状态(1已作废,2待下单)
        submissionAtFirstTime: "",
        submissionDeadline: "",
        endObsoleteTime: "", // 作废结束时间
        startObsoleteTime: "", // 作废开始时间
        submitterId: "",
        supplierId: "",
        supplierName: "",
        businessDeptIds: null,
        spuList: [],
        businessDeptId: "",
      },
      statusList: [
        { label: "急采", value: 0 },
        { label: "普通备货", value: 1, color: "#19be6b" },
        { label: "海外仓备货", value: 2, color: "#19be6b" },
        { label: "FBA备货", value: 3, color: "#19be6b" },
        { label: "全托管备货", value: 4, color: "#19be6b" },
        { label: "直发备货", value: 5, color: "#19be6b" },
      ],
      supOrSku: "",
      // searchType: 0,
      goodsTypeArr: [
        /* {
         value: '全部',
         key: '0'
         }, */
        {
          value: "1688商品",
          key: "1",
        },
        {
          value: "非1688商品",
          key: "2",
        },
      ],
      statusArr: [
        {
          value: "已作废",
          key: "1",
        },
        {
          value: "待下单",
          key: "2",
        },
      ],
      searchTypeArr: [
        {
          value: "供应商",
          key: 0,
        },
        {
          value: "SKU编号",
          key: 1,
        },
      ],
      voidType: "single",
      selectionArr: [], // 已选中表格行数据
      requirementData: [], // 主table
      ApplyAllOrderInfo: [], // 存放申请所有需求下单时的商品数据
      orderData: [],
      setting: {
        purchaserName: "",
        purchaserId: "",
      },
      ruleValidate: {
        transWarehouse: [
          {
            required: true,
            message: "不能为空",
            trigger: "change",
          },
        ],
        purchaserId: [
          {
            required: true,
            message: "不能为空",
            trigger: "change",
          },
        ],
      },
      numList: {
        urgentNum: 0,
        generalNum: 0,
        overseasWarehouseNum: 0,
        fbaNum: 0,
      },
      readyTypeList: [
        { label: "急采", name: "0", num: null },
        { label: "普通备货", name: "1", num: null },
        { label: "海外仓备货", name: "2", num: null },
        { label: "FBA备货", name: "3", num: null },
        { label: "全托管备货", name: "4", num: null },
        { label: "直发备货", name: "5", num: null },
      ],
      labelFun: (data) => {
        return (h) => {
          return h("div", [
            h("span", data.label),
            h(
              "span",
              data.name == this.pageParams.readyType
                ? { style: { color: "#2d8cf0" } }
                : { style: { color: "red" } },
              data.num || data.num == 0 ? `(${data.num})` : ""
            ),
          ]);
        };
      },
      businessDeptInfoList: [],
    };
  },
  created() {
    this.getColumn();
    // this.pageParams.pageSize = this.getPageSizeCache();
    this.pageParams.pageSize = 50;
    // this.getBusinessDeptInfo();
  },
  mounted() {
    this.getPurchaseNum(true);
    this.getNumberByBusinessDept(this.pageParams.readyType, true);
  },
  watch: {
    pageParamsStatus(n, o) {
      if (n) {
        this.$nextTick(() => {
          this.getList();
          this.pageParamsStatus = false;
        });
      }
    },
    tabsValue(n) {
      this.getColumn();
      this.submitTime = [];
      this.pageParams.submissionAtFirstTime = null;
      this.pageParams.submissionDeadline = null;
      this.pageParams.startObsoleteTime = null;
      this.pageParams.endObsoleteTime = null;
      this.pageParams.pageNum = 1;
      // this.pageParams.pageSize = 10;
      this.getList();
    },
    // 关闭弹窗
    purchaseShow (val) {
      val === 'purchaseRequirement' && this.getList(true);
    }
  },
  computed: {
    authUserInfo() {
      return this.$store.getters["authUserInfo"] || {};
    },
    securityUser () {
      return this.authUserInfo.securityUser || {};
    },
    pagePermission () {
      return {
        list: this.getPermission("purchaseRequirement_list"),
        applyOrder: this.getPermission("purchaseRequirement_applyOrder"),
        cancelOrder: this.getPermission("purchaseRequirement_cancelOrder"),
        apply: this.getPermission("purchaseRequirement_applyOrder_apply"),
        exportByIds: this.getPermission("purchaseRequirement_exportByIds"),
        export: this.getPermission("purchaseRequirement_export"),
        batchModify: this.getPermission("purchaseRequirement_batchModify")
      }
    }
  },
  activated() {
    this.purchaseShow = "purchaseRequirement";
    this.intiBaseDataList();
    //getList放在这里
    this.getBusinessDeptInfo();
    this.$nextTick(() => {
      this.reset();
    });
  },
  methods: {
    clickTab() {
      this.getColumn();
    },
    getColumn() {
      let self = this;
      let n = self.tabsValue;
      self.requirementColumn = [];
      let arr = [
        {
          title: "",
          width: 50,
          requiredCheck: true,
          align: "center",
          combine: true,
          render: (h, params) => {
            const len = params.row._length;
            if (len) {
              const obj = {
                childrens: [
                  [
                    "Checkbox",
                    {
                      class: (() => {
                        return params.row._length > 1 ? "block" : "none";
                      })(),
                      props: {
                        value: params.row._allCheck,
                        disabled: params.row.supplierName == "*" ? true : false,
                      },
                      style: {
                        color: "red",
                        display: "none",
                      },
                      on: {
                        "on-change"(value) {
                          self.requirementData.forEach((i, index) => {
                            if (i.supplierId === params.row.supplierId) {
                              self.$set(
                                self.requirementData[index],
                                "_checked",
                                value
                              );
                            }
                          });
                          self.$nextTick(() => {
                            self.selectionArr =
                              self.$refs.orderTable.getSelection();
                          });
                        },
                      },
                    },
                  ],
                ],
                props: {
                  rowSpan: len,
                },
              };
              if (params.row.supplierName == "*") {
                obj.childrens[1] = obj.childrens[2] = ["", {}, ""];
              }
              if (params.row._rowSpanIndex) {
                return obj;
              }
            } else {
              return "";
            }
          },
        },
        {
          title: "供应商",
          key: "supplierName",
          width: 180,
          requiredCheck: true,
          align: "center",
          combine: true,
          render: (h, params) => {
            const len = params.row._length;
            if (!len || !params.row._rowSpanIndex) return '';
            let typeTxt = '';
            if (this.$common.isEmpty(params.row.setupStatus) || ![1, '1'].includes(params.row.setupStatus)) {
              if (!this.$common.isEmpty(params.row.openStatus)) {
                typeTxt = [1, '1'].includes(params.row.openStatus) ? '已对接系统' : '未对接系统';
              }
            } else {
              typeTxt = '1688供应商';
            }
            let obj = {
              childrens: [
                [
                  "div",
                  {
                    class: "combiePackageCode",
                  },
                  params.row.supplierName,
                ],
                // [
                //   "Checkbox",
                //   {
                //     class: (() => {
                //       return params.row._length > 1 ? "block" : "none";
                //     })(),
                //     props: {
                //       value: params.row._allCheck,
                //       disabled: params.row.supplierName == "*" ? true : false,
                //     },
                //     style: {
                //       color: "red",
                //       display: "none",
                //     },
                //     on: {
                //       "on-change"(value) {
                //         self.requirementData.forEach((i, index) => {
                //           if (i.supplierId === params.row.supplierId) {
                //             self.$set(
                //               self.requirementData[index],
                //               "_checked",
                //               value
                //             );
                //           }
                //         });
                //         self.$nextTick(() => {
                //           self.selectionArr =
                //             self.$refs.orderTable.getSelection();
                //         });
                //       },
                //     },
                //   },
                //   "切换全选当前供应商",
                // ],
                [
                  "a",
                  {
                    class: (() => {
                      return params.row.wwAccount !== ""
                          ? "ADDWANGWANGIMG block"
                          : "none";
                    })(),
                    on: {
                      click() {
                        let newTab = window.open("about:blank");
                        newTab.location.href =
                            "https://awp.taobao.com/bs/wwlight.html?ver=3&touid=" +
                            params.row.wwAccount +
                            "&siteid=cntaobao&status=1&charset=utf-8";
                      },
                    },
                  },
                  "",
                ],
                [
                  "a",
                  {
                    class: (() => {
                      return params.row.wwAccount !== ""
                          ? "ADDQQIMG block"
                          : "none";
                    })(),
                    on: {
                      click() {
                        let newTab = window.open("about:blank");
                        newTab.location.href =
                            "http://wpa.qq.com/msgrd?v=3&uin=" +
                            params.row.wwAccount +
                            "&site=qq&menu=yes";
                      },
                    },
                  },
                  "",
                ],
              ],
              props: {
                rowSpan: len,
              }
            };
            if (!this.$common.isEmpty(typeTxt)) {
              obj.childrens.push(['div', {} , '']);
              obj.childrens.push([
                'span',
                {
                  class: 'supplier-abutment-type'
                },
                typeTxt
              ]);
            }
            if (params.row.supplierName == "*") {
              obj.childrens[1] = obj.childrens[2] = ["", {}, ""];
            }
            return obj;
          },
        },
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        // {
        //   title: "图片",
        //   key: "thumbUrl",
        //   align: "center",
        //   requiredCheck: true,
        //   render(h, params) {
        //     return self.tableImg(h, params, "thumbUrl", true);
        //   },
        // },
        {
          title: "商品信息",
          key: "thumbUrl",
          align: "center",
          requiredCheck: true,
          width: 305,
          render(h, params) {
            let spec = "";
            if (params.row.productGoodsSpecifications) {
              spec = params.row.productGoodsSpecifications
                .map((i) => i.name + ":" + i.value)
                .join(",");
            }
            let link = params.row.goodsUrl;
            return h("div", { style: { display: "flex" } }, [
              self.tableImg(h, params, "thumbUrl", true),
              h(
                "div",
                {
                  style: { textAlign: "left", marginLeft: "10px" },
                },
                [
                  h(
                    "div",
                    {
                      style: { display: "flex" },
                    },
                    [
                      h(
                        "div",
                        {
                          style: {},
                        },
                        `SKU：${params.row.skuNo}`
                      ),
                      h("Icon", {
                        style: {
                          fontSize: "18px",
                          marginLeft: "10px",
                          cursor: "pointer",
                        },
                        props: {
                          type: "ios-copy-outline",
                        },
                        on: {
                          click: () => {
                            self.copy(params.row.skuNo);
                          },
                        },
                      }),
                      link != null && link != ""
                        ? h("Icon", {
                          props: {
                            type: "ios-link",
                          },
                          style: {
                            color: "#157CE9",
                            fontSize: "18px",
                            cursor: "pointer",
                            marginLeft: "10px",
                          },
                          on: {
                            click() {
                              window.open(link);
                            },
                          },
                        })
                        : "",
                    ]
                  ),
                  h(
                    "div",
                    {
                      style: {},
                    },
                    `${params.row.goodsName || ""}`
                  ),
                  h(
                    "p",
                    {
                      style: {
                        color: "green",
                      },
                    },
                    spec
                  ),
                ]
              ),
            ]);
          },
        },
        // {
        //   title: "产品SKU/产品名称",
        //   key: "sukName",
        //   requiredCheck: true,
        //   align: "center",
        //   minWidth: 155,
        //   render(h, params) {
        //     let spec = "";
        //     if (params.row.productGoodsSpecifications) {
        //       spec = params.row.productGoodsSpecifications
        //         .map((i) => i.name + ":" + i.value)
        //         .join(",");
        //     }
        //     let link = params.row.goodsUrl;
        //     return h("div", {}, [
        //       h("p", params.row.skuNo),
        //       h("p", params.row.goodsName),
        //       h(
        //         "p",
        //         {
        //           style: {
        //             color: "green",
        //           },
        //         },
        //         spec
        //       ),
        //       link != null && link != ""
        //         ? h("Icon", {
        //             props: {
        //               type: "ios-link",
        //             },
        //             style: {
        //               color: "#157CE9",
        //               fontSize: "20px",
        //               cursor: "pointer",
        //             },
        //             on: {
        //               click() {
        //                 window.open(link);
        //               },
        //             },
        //           })
        //         : "",
        //     ]);
        //   },
        // },
        {
          title: "采购仓库",
          align: "center",
          key: "purchaseWarehouseName",
          filterHide: true,
          render(h, params) {
            return h(
              "div",
              {
                style: {
                  color:
                    params.row.purchaseWarehouseStatus === "1" ? "red" : "#666",
                },
              },
              params.row.purchaseWarehouseName
            );
          },
        },

        {
          title: "作废时间",
          align: "center",
          filterHide: true,
          key: "obsoleteTime",
          render(h, params) {
            return h(
              "span",
              self.getDataToLocalTime(params.row.obsoleteTime, "fulltime")
            );
          },
        },

        {
          title: "需求数量",
          align: "center",
          requiredCheck: true,
          key: "requiredQuantity",
        },

        {
          title: "供应商报价",
          align: "center",
          filterHide: true,
          key: "supplierPrice",
        },
        {
          title: "仓库与采购员",
          align: "center",
          requiredCheck: true,
          key: "purchaserName",
          render(h, params) {
            return h("div", {}, [
              h(
                "div",
                {
                  style: {},
                },
                params.row.purchaseWarehouseName
              ),
              h(
                "div",
                {
                  style: {},
                },
                params.row.purchaserName
              ),
            ]);
          },
        },
        {
          title: "在途数量",
          align: "center",
          // filterHide: true,
          key: "onPassageQuantity",
        },
        {
          title: "可用库存",
          align: "center",
          // filterHide: true,
          key: "availableStock",
        },
        {
          title: "缺货数量",
          align: "center",
          // filterHide: true,
          key: "outNumberOfStock",
        },
        {
          title: "最新采购价",
          align: "center",
          // filterHide: true,
          key: "currentCost",
        },
        {
          title: "作废原因",
          align: "center",
          filterHide: true,
          key: "obsoleteDesc",
        },
        {
          title: "提交时间",
          // filterHide: true,
          width: 100,
          key: "submissionTime",
          align: "center",
          render(h, params) {
            return h(
              "span",
              self.getDataToLocalTime(params.row.submissionTime, "fulltime")
            );
          },
        },
        {
          title: "重量(g)",
          align: "center",
          filterHide: true,
          key: "goodsWeight",
        },
      ];
      if (n === 0) {
        let arr1 = [];
        arr.forEach((i) => {
          if (!(i.key === "obsoleteDesc" || i.key === "obsoleteTime")) {
            arr1.push(i);
          }
        });
        this.requirementColumn = [
          ...arr1,
          {
            title: "操作",
            key: "action",
            requiredCheck: true,
            align: "center",
            fixed: "right",
            width: 120,
            render: (h, params) => {
              return self.tabsValue === 0
                ? h("local-down-button", {
                  props: {
                    data: {
                      btn: {
                        text: "下单", // 查看详情
                        disabled: !this.pagePermission.applyOrder,
                        clickFn: () => {
                          // self.operation("1", params.row, params.index);
                          self.selectionArr = [params.row];
                          self.applyOrderFn("0");
                        },
                      },
                      list: [
                        {
                          text: "作废",
                          value: 1,
                          hide: this.tabsValue === 1,
                          disabled: !this.pagePermission.cancelOrder,
                          clickFn: () => {
                            self.operation("2", params.row, params.index);
                          },
                        },
                      ],
                    },
                  },
                })
                : "";
            },
          },
        ];
      } else {
        this.requirementColumn01 = arr;
      }
    },
    setTableColumns(data) {
      if (this.tabsValue === 0) {
        this.$nextTick(() => {
          this.orderColumn = data;
        });
      } else {
        let arr = data.map((item) => {
          if (item.key !== "action") {
            return item;
          }
        });
        this.orderColumn = arr;
      }
    },
    addTableImg() {
      let wanwan = document.getElementsByClassName("ADDWANGWANGIMG");
      for (let i = 0; i < wanwan.length; i++) {
        let img = document.createElement("img");
        img.setAttribute("src", "./static/images/wangwang.png");
        wanwan[i].appendChild(img);
      }
      let qq = document.getElementsByClassName("ADDQQIMG");
      for (let i = 0; i < qq.length; i++) {
        let img = document.createElement("img");
        img.setAttribute("src", "./static/images/qq.png");
        wanwan[i].appendChild(img);
      }
    },
    exportMt(value) {
      if (value === "0") {
        // 选中导出
        if (this.selectionArr.length === 0) {
          this.$Message.error("未选择数据");
          return;
        }
        let requirementIds = this.selectionArr.map((i) => i.requirementId);
        this.batchExport(requirementIds);
      } else {
        // 所有导出
        this.exportEcxel();
      }
    },
    batchExport(requirementIds) {
      const param = this.getPageParams();
      /**
       * params
       * requirementIds 采购需求id
       * */
      const temp = {
        requirementIds: requirementIds,
        businessDeptId: param.businessDeptId,
        businessDeptIds: param.businessDeptIds
      };
      // 选中导出
      this.axios.post(api.requirementExport, temp).then((response) => {
        if (response.data.code === 0) {
          this.$Message.success("导出成功");
          this.selectionArr = [];
          this.pageParamsStatus = true; // 刷新list
          // window.location.href = this.$store.state.imgUrl + response.data.datas;
        }
      }).catch(() => {});
    },
    visible(open) {
      if (open) {
        let v = this;
        v.formInline.obsoleteDesc = "";
        v.formInline.obsoleteTime = "";
      }
    },
    toVoid() {
      let v = this;
      if (v.voidType === "single") {
        let params = v.deepCopy(v.activeData);
        v.$refs.formInline.validate((valid) => {
          if (valid) {
            params.obsoleteDesc = v.formInline.obsoleteDesc;
            params.obsoleteTime = v.getDateTime(new Date(), "fulltime");
            v.axios.post(api.requirementCancelOrder, params).then((res) => {
              if (res.data.code == 0) {
                v.formInline.obsoleteDesc = "";
                v.formInline.obsoleteTime = "";
                v.model1 = false;
                v.$Message.success("操作成功");
                v.getList(true);
              }
            });
          }
        });
      } else if (v.voidType === "batch") {
        v.$refs.formInline.validate((valid) => {
          if (valid) {
            let params = {};
            params.obsoleteDesc = v.formInline.obsoleteDesc;
            params.requirementIds = v.selectionArr.map((i) => i.requirementId);
            v.axios.post(api.batchCancelOrder, params).then((res) => {
              if (res.data.code == 0) {
                v.formInline.obsoleteDesc = "";
                v.model1 = false;
                v.$Message.success("操作成功");
                v.getList(true);
              }
            });
          }
        });
      }
    },
    startLoading() {
      this.$Loading.start();
      this.getList();
    },
    getPageParams () {
      let params = this.$common.copy(this.pageParams);
      for (let item in params) {
        params[item] = params[item] === "" ? null : params[item];
      }
      params.status = this.tabsValue === 0 ? "2" : "1";
      // params.businessDeptId = this.securityUser.businessDeptId;
      params.businessDeptIds = this.securityUser.businessDeptIds;
      return params;
    },
    getList (type) {
      if (this.Tableloading) return;
      // 获取权限
      if (!this.pagePermission.list) {
        this.$Message.error("您暂无权限查看，请找管理员设置");
        return;
      }
      this.getDateValue(this.submitTime);
      // if (this.searchType == 0) {
      //   // this.pageParams.supplierId = this.supOrSku
      //   this.pageParams.supplierName = this.supOrSku;
      //   this.pageParams.skuList = [];
      // } else if (this.searchType == 1) {
      //   this.pageParams.skuList = this.sepCommasFn(this.supOrSku);
      //   this.pageParams.supplierName = null;
      // }
      let params = this.getPageParams();
      this.Tableloading = true;
      this.SearchDisabled = true;
      this.getNumberByBusinessDept(this.pageParams.readyType, type); // 获取备货类型下每个事业部采购需求总数
      this.getPurchaseNum(type);
      this.requirementData = [];
      this.tableData = [];
      this.axios.post(api.requirementList, params).then((res) => {
        // let data = [];
        this.selectionArr = [];
        if (res.data.code === 0) {
          let noSupplierArr = {
            supplierName: "无供应商",
            supplierId: "",
            qqNumber: "",
            wwAccount: "",
            requirementDataList: [],
          };
          let supplierArr = [];
          let arr = res.data.datas.list;
          // 暂存获取到的表格数据，为了拿到所有商品的id集合（在list的第一个对象里的goodIdsList）
          this.tableData = res.data.datas.list;
          this.getProductListInfo(arr.map((i) => i.goodsId)).then((data) => {
            arr.forEach((i) => {
              data.forEach((j) => {
                if (i.goodsId === j.productGoodsId) {
                  if (j.productGoodsSpecifications) {
                    Object.keys(j).forEach(key => {
                      i[key] = j[key];
                    });
                  } else {
                    i.productGoodsSpecifications = null;
                  }
                }
              });
            });
            arr.forEach((n, i) => {
              if (n.supplierId) {
                // 有供应商时
                if (!supplierArr || supplierArr.length == 0) {
                  // requirementData为空时，直接新增
                  supplierArr.push({
                    supplierName: n.supplierName,
                    supplierId: n.supplierId,
                    qqNumber: n.qqNumber,
                    wwAccount: n.wwAccount,
                    requirementDataList: [n],
                  });
                } else {
                  let isExist = supplierArr.some(
                    (item) => item.supplierId === n.supplierId
                  );
                  if (!isExist) {
                    // 如果不存在相同sku,数组新增一个对象
                    supplierArr.push({
                      supplierName: n.supplierName,
                      supplierId: n.supplierId,
                      qqNumber: n.qqNumber,
                      wwAccount: n.wwAccount,
                      requirementDataList: [n],
                    });
                  } else {
                    supplierArr.forEach((m, j) => {
                      // 如果为同一sku,归到同一数组
                      if (n.supplierId == m.supplierId) {
                        m.requirementDataList.push(n);
                        isExist = true;
                      }
                    });
                  }
                }
              } else {
                // 无供应商时
                noSupplierArr.requirementDataList.push(n);
              }
            });
            if (noSupplierArr.requirementDataList.length > 0) {
              data.push(noSupplierArr);
            }
            data.push(...supplierArr);
            let data1 = [];
            data.forEach((i) => {
              /* i._display = false;
           data1.push(i); */
              if (i.requirementDataList && i.requirementDataList.length > 0) {
                i.requirementDataList.forEach((j, index) => {
                  // i._display = true;
                  if (index === 0) {
                    j._rowSpanIndex = true;
                    j._allCheck = false;
                    j._length = i.requirementDataList.length;
                  }
                  j.supplierName = i.supplierName;
                  j.supplierId = i.supplierId;
                  j.qqNumber = i.qqNumber;
                  j.wwAccount = i.wwAccount;
                  data1.push(j);
                });
              }
            });
            this.requirementData = data1;
            this.total = res.data.datas.total;
            this.$nextTick(() => {
              this.Tableloading = false;
              this.SearchDisabled = false;
              setTimeout(() => {
                this.addTableImg();
              }, 1000);
            });
            this.$Loading.finish(); // 隐藏加载条
          }).catch(() => {
            this.Tableloading = false;
            this.SearchDisabled = false;
          });
        } else {
          this.Tableloading = false;
          this.SearchDisabled = false;
        }
      }).catch(() => {
        this.Tableloading = false;
        this.SearchDisabled = false;
      });
    },
    changePage(page) {
      let v = this;
      v.$Loading.start();
      v.pageParams.pageNum = page;
      v.getList();
    },
    reset() {
      this.$refs["pageParams"].resetFields();
      this.selectionArr = [];
      this.searchType = 0;
      this.supOrSku = "";
      let end = new Date();
      let start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      this.submitTime = [start, end];
    },
    search (type, self) {
      this.pageParams.pageNum = 1;
      this.pageParamsStatus = true;
      this.getPurchaseNum(self !== 'self' && type);
      this.getNumberByBusinessDept(this.pageParams.readyType, type);
    },
    // searchTypeChangeFn(val) {
    //   if (this.searchType == 1) {
    //     this.pageParams.skuList = [];
    //   } else if (this.searchType == 2) {
    //     // this.pageParams.supplierId = ''
    //     this.pageParams.supplierName = "";
    //   }
    //   this.supOrSku = "";
    // },
    resetDate() {
      // 清空日期
      let v = this;
      v.pageParams.submissionAtFirstTime = "";
      v.pageParams.submissionDeadline = "";
      v.pageParams.startObsoleteTime = "";
      v.pageParams.endObsoleteTime = "";
    },
    getDateValue(value) {
      // 获取日期返回值
      let v = this;
      if (value && value.length > 0 && value[0] != "") {
        if (v.tabsValue === 0) {
          v.pageParams.submissionAtFirstTime = v.getDateTime(
            value[0],
            "fulltime"
          );
          v.pageParams.submissionDeadline = v.getDateTime(value[1], "fulltime");
        } else {
          v.pageParams.startObsoleteTime = v.getDateTime(value[0], "fulltime");
          v.pageParams.endObsoleteTime = v.getDateTime(value[1], "fulltime");
        }
      }
    },
    applyOrderFn(value) {
      let v = this;
      if (value === "0") {
        if (v.selectionArr.length == 0) {
          v.$Message.error("请选择需要下单的商品！");
        } else {
          // let isSetupStatusSame = this.checkOrderListStatus(this.selectionArr);
          // if (!isSetupStatusSame) {
          //   return this.$Message.warning("请检查下单的类型");
          // }
          v.editType = "placeOrder"; // 下单状态
          v.operationBatch = true;
          let detailsList = [];
          // 合并相同供应商和仓库
          v.getProductListInfo(v.selectionArr.map((i) => i.goodsId)).then(
            (data) => {
              v.selectionArr = v.selectionArr.map(i => {
                const pipei = data.find(j => {
                  return i.goodsId === j.productGoodsId;
                })
                if (pipei) {
                  return { ...i, ...pipei, goodsName: pipei.cnName }
                }
                return i
              })
              v.selectionArr.forEach((i) => {
                let ids = i.purchaseWarehouseId + i.supplierId;
                let detailsId = detailsList.map(
                  (i) => i.purchaseWarehouseId + i.supplierId
                );
                let obj = JSON.parse(JSON.stringify(i));
                obj.replenishQuantity = obj.requiredQuantity
                  ? obj.requiredQuantity
                  : 1;
                obj.unitPrice = 0;
                if (detailsId.includes(ids)) {
                  detailsList.forEach((j) => {
                    if (
                      i.purchaseWarehouseId + i.supplierId ===
                      j.purchaseWarehouseId + j.supplierId
                    ) {
                      j.detailsResultList.push(obj);
                    }
                  });
                } else {
                  i.detailsResultList = [obj];
                  detailsList.push(i);
                }
              });
              v.orderData = detailsList.map((item) => {
                return {
                  businessDeptName: item.businessDeptName,
                  businessDeptId: item.businessDeptId,
                  replenishQuantity: 0,
                  unitPrice: 0,
                  arrivalTime: "",
                  createdBy: "",
                  createdTime: "",
                  deleteDetailsIdList: [],
                  deliveryAddress: "",
                  detailsResultList: item.detailsResultList,
                  productGoodsSpecifications: item.productGoodsSpecifications,
                  discountAmount: 0,
                  externalSerialNo: "",
                  freightCharge: 0,
                  orderTime: "",
                  paymentStatus: null,
                  purchaseAccountId: "", // 1688账号
                  buyerMessage: "", // 买家留言
                  purchaseId: "",
                  readyType: item.readyType,
                  purchaseNumber: item.purchaseNumber,
                  purchaseStatus: null,
                  purchaseWarehouseId: item.purchaseWarehouseId,
                  purchaseWarehouseName: item.purchaseWarehouseName,
                  purchaserId: item.purchaserId,
                  qualityStatus: null,
                  receivedStatus: null,
                  remark: "",
                  settleTypeName: "",
                  settlementType: "",
                  shippingType: "",
                  source: null,
                  status: null,
                  submitDetailsIdList: [],
                  supplierId: item.supplierId,
                  supplierName: item.supplierName,
                  totalAmount: null,
                  totalPrice: null,
                  trackingNumber: "",
                  transStatus: null,
                  type: 1, // 采购单类型(1:普通下单2:1688下单3:混合下单) ,
                  updateQuoteFlag: false, // 更新报价标志(0不更新,1更新)
                  updateSupplierFlag: false, // 更新供应商标志(0不更新,1更新)
                  checkRate: item.checkRate,
                  planCheckNumber: item.planCheckNumber,
                  aliSku: item.aliSku, //对应的商品集合
                  setupStatus: item.setupStatus, //判断是否1688
                  accountParamQO: {
                    accountId: "",
                    orderType: "",
                    aliMessage: "",
                    pruchaseMessage: "",
                  },
                  applyType: 0,
                  platformAndAccountCodeArr: item.platformAndAccountCode
                };
              });
              v.selectionArr = [];
              v.initOrderData();
            }
          );
        }
      } else {
        // 申请所有需求下单时，获取所有需求的商品信息，并将商品信息做处理
        // 获取商品信息 begin
        if (!v.pagePermission.list) {
          v.$Message.error("无权限");
          return;
        }
        v.getDateValue(v.submitTime);
        // if (this.searchType == 0) {
        //   // this.pageParams.supplierId = this.supOrSku
        //   this.pageParams.supplierName = this.supOrSku;
        //   this.pageParams.skuList = [];
        // } else if (this.searchType == 1) {
        //   this.pageParams.skuList = v.sepCommasFn(this.supOrSku);
        //   this.pageParams.supplierName = null;
        // }
        let params = this.getPageParams();
        params.pageSize = v.total;
        v.SearchDisabled = true;
        v.axios.post(api.requirementList, params).then((res) => {
          v.SearchDisabled = false;
          v.ApplyAllOrderInfo = [];
          v.selectionArr = [];
          if (res.data.code === 0) {
            let noSupplierArr = {
              supplierName: "无供应商",
              supplierId: "",
              qqNumber: "",
              wwAccount: "",
              requirementDataList: [],
            };
            let supplierArr = [];
            let arr = res.data.datas.list;
            // 暂存获取到的表格数据，为了拿到所有商品的id集合（在list的第一个对象里的goodIdsList）

            v.tableData = res.data.datas.list;
            v.getProductListInfo(arr.map((i) => i.goodsId)).then((data) => {
              arr = arr.map(i => {
                const pipei = data.find(j => {
                  return i.goodsId === j.productGoodsId;
                })
                if (pipei) {
                  return { ...i, ...pipei, goodsName: pipei.cnName }
                }
                return i
              })
              arr.forEach((n, i) => {
                if (n.supplierId) {
                  // 有供应商时
                  if (!supplierArr || supplierArr.length == 0) {
                    // requirementData为空时，直接新增
                    supplierArr.push({
                      supplierName: n.supplierName,
                      supplierId: n.supplierId,
                      qqNumber: n.qqNumber,
                      wwAccount: n.wwAccount,
                      requirementDataList: [n],
                    });
                  } else {
                    let isExist = supplierArr.some(
                      (item) => item.supplierId === n.supplierId
                    );
                    if (!isExist) {
                      // 如果不存在相同sku,数组新增一个对象
                      supplierArr.push({
                        supplierName: n.supplierName,
                        supplierId: n.supplierId,
                        qqNumber: n.qqNumber,
                        wwAccount: n.wwAccount,
                        requirementDataList: [n],
                      });
                    } else {
                      supplierArr.forEach((m, j) => {
                        // 如果为同一sku,归到同一数组
                        if (n.supplierId == m.supplierId) {
                          m.requirementDataList.push(n);
                          isExist = true;
                        }
                      });
                    }
                  }
                } else {
                  // 无供应商时
                  noSupplierArr.requirementDataList.push(n);
                }
              });
              if (noSupplierArr.requirementDataList.length > 0) {
                data.push(noSupplierArr);
              }
              data.push(...supplierArr);
              let data1 = [];
              data.forEach((i) => {
                /* i._display = false;
            data1.push(i); */
                if (i.requirementDataList && i.requirementDataList.length > 0) {
                  i.requirementDataList.forEach((j, index) => {
                    // i._display = true;
                    if (index === 0) {
                      j._rowSpanIndex = true;
                      j._allCheck = false;
                      j._length = i.requirementDataList.length;
                    }
                    j.supplierName = i.supplierName;
                    j.supplierId = i.supplierId;
                    j.qqNumber = i.qqNumber;
                    j.wwAccount = i.wwAccount;
                    data1.push(j);
                  });
                }
              });
              v.ApplyAllOrderInfo = data1;
              v.total = res.data.datas.total;
              v.$Loading.finish(); // 隐藏加载条
              // 获取商品信息 end
              // 处理商品信息数据 begin
              if (v.ApplyAllOrderInfo.length === 0) {
                v.$Message.error("无商品可申请下单");
              } else {
                //判断是否有1688类型
                // let isSetupStatusSame = this.checkOrderListStatus(
                //   v.ApplyAllOrderInfo
                // );
                // if (!isSetupStatusSame) {
                //   return this.$Message.warning("请检查下单的类型");
                // }
                v.editType = "placeOrder"; // 下单状态
                v.operationBatch = true;
                let detailsList = [];
                // 合并相同供应商和仓库
                v.getProductListInfo(
                  v.ApplyAllOrderInfo.map((i) => i.goodsId)
                ).then((data) => {
                  v.ApplyAllOrderInfo.forEach((i) => {
                    data.forEach((j) => {
                      if (i.goodsId === j.productGoodsId) {
                        i.goodsName = j.cnName;
                        Object.keys(j).forEach(key => {
                          i[key] = j[key];
                        });
                      }
                    });
                  });
                  v.ApplyAllOrderInfo.forEach((i) => {
                    let ids = i.purchaseWarehouseId + i.supplierId;
                    let detailsId = detailsList.map(
                      (i) => i.purchaseWarehouseId + i.supplierId
                    );
                    let obj = JSON.parse(JSON.stringify(i));
                    obj.replenishQuantity = obj.requiredQuantity
                      ? obj.requiredQuantity
                      : 1;
                    obj.unitPrice = 0;
                    if (detailsId.includes(ids)) {
                      detailsList.forEach((j) => {
                        if (
                          i.purchaseWarehouseId + i.supplierId ===
                          j.purchaseWarehouseId + j.supplierId
                        ) {
                          j.detailsResultList.push(obj);
                        }
                      });
                    } else {
                      i.detailsResultList = [obj];
                      detailsList.push(i);
                    }
                  });
                  v.orderData = detailsList.map((item) => {
                    return {
                      businessDeptName: item.businessDeptName,
                      businessDeptId: item.businessDeptId,
                      replenishQuantity: 0,
                      unitPrice: 0,
                      arrivalTime: "",
                      createdBy: "",
                      createdTime: "",
                      deleteDetailsIdList: [],
                      deliveryAddress: "",
                      detailsResultList: item.detailsResultList,
                      productGoodsSpecifications:
                        item.productGoodsSpecifications,
                      discountAmount: 0,
                      externalSerialNo: "",
                      freightCharge: 0,
                      orderTime: "",
                      paymentStatus: null,
                      purchaseAccountId: "", // 1688账号
                      buyerMessage: "", // 买家留言
                      purchaseId: "",
                      purchaseNumber: item.purchaseNumber,
                      purchaseStatus: null,
                      purchaseWarehouseId: item.purchaseWarehouseId,
                      purchaseWarehouseName: item.purchaseWarehouseName,
                      readyType: item.readyType,
                      purchaserId: item.purchaserId,
                      qualityStatus: null,
                      receivedStatus: null,
                      remark: "",
                      settleTypeName: "",
                      settlementType: "",
                      shippingType: "",
                      source: null,
                      status: null,
                      submitDetailsIdList: [],
                      supplierId: item.supplierId,
                      supplierName: item.supplierName,
                      totalAmount: null,
                      totalPrice: null,
                      trackingNumber: "",
                      transStatus: null,
                      type: 1, // 采购单类型(1:普通下单2:1688下单3:混合下单) ,
                      updateQuoteFlag: false, // 更新报价标志(0不更新,1更新)
                      updateSupplierFlag: false, // 更新供应商标志(0不更新,1更新)
                      aliSku: item.aliSku, //对应的商品集合
                      setupStatus: item.setupStatus, //判断是否1688
                      accountParamQO: {
                        accountId: "",
                        orderType: "",
                        aliMessage: "",
                        pruchaseMessage: "",
                      },
                      applyType: 0,
                      platformAndAccountCodeArr: item.platformAndAccountCode
                    };
                  });
                  v.ApplyAllOrderInfo = [];
                  v.initOrderData();
                });
              }
            });
          }
        });
      }
    },
    initOrderData(data) {
      let v = this;
      /* detailsList.forEach((n, i)=> {
   n = Object.assign(n, {replenishQuantity: 0})
   //v.$set(n, 'replenishQuantity', 0)
   }) */
      v.purchaseShow = "addPurchaseOrder";
    },
    goBackFromAdd() {
      this.purchaseShow = "purchaseRequirement";
    },
    addOrderGoBack(val) {
      this.purchaseShow = val;
      this.getList(true);
    },
    applyOrderGoBack(val) {
      this.purchaseShow = val;
    },
    modifyPurchaserFn() {
      let v = this;
      if (v.selectionArr.length == 0) {
        v.$Message.warning("请选择需要批量修改的商品！");
      } else {
        v.isShowSettingPurchaser = true;
      }
    },
    modifyToVoid() {
      let v = this;
      if (v.selectionArr.length == 0) {
        v.$Message.warning("请选择商品！");
        return;
      }
      v.voidType = "batch";
      this.model1 = true;
    },
    getSelectValue(selection) {
      // table获取所选值
      this.selectionArr = selection;
    },
    operation(type, data, index) {
      let v = this;
      v.editType = null;
      if (type == 1) {
        v.operationBatch = false;
        let detailsList = v.deepCopy([data]);
        v.getProductListInfo(detailsList.map((i) => i.goodsId)).then((data) => {
          detailsList.forEach((i) => {
            data.forEach((j) => {
              if (i.goodsId === j.productGoodsId) {
                i.goodsName = j.cnName;
                Object.keys(j).forEach(key => {
                  i[key] = j[key];
                });
              }
            });
          });
          detailsList = detailsList.map((item) =>
            Object.assign(item, {
              replenishQuantity: 0,
              unitPrice: 0,
            })
          );
          /* detailsList.forEach((n, i)=> {
       n = Object.assign(n, {replenishQuantity: 0})
       //v.$set(n, 'replenishQuantity', 0)
       }) */
          v.orderData = {
            arrivalTime: "",
            createdBy: "",
            createdTime: "",
            deleteDetailsIdList: [],
            deliveryAddress: "",
            detailsResultList: detailsList,
            discountAmount: 0,
            externalSerialNo: "",
            freightCharge: 0,
            orderTime: "",
            paymentStatus: null,
            purchaseAccountId: "", // 1688账号
            buyerMessage: "", // 买家留言
            purchaseId: "",
            purchaseNumber: detailsList[0].purchaseNumber,
            purchaseStatus: null,
            readyType: detailsList[0].readyType,
            purchaseWarehouseId: detailsList[0].purchaseWarehouseId,
            purchaseWarehouseName: detailsList[0].purchaseWarehouseName,
            purchaserId: detailsList[0].purchaserId,
            qualityStatus: null,
            receivedStatus: null,
            remark: "",
            settleTypeName: "",
            settlementType: "",
            shippingType: "",
            source: null,
            status: null,
            submitDetailsIdList: [],
            supplierId: detailsList[0].supplierId,
            supplierName: detailsList[0].supplierName,
            totalAmount: null,
            totalPrice: null,
            trackingNumber: "",
            transStatus: null,
            type: type, // 采购单类型(1:普通下单2:1688下单3:混合下单) ,
            updateQuoteFlag: false, // 更新报价标志(0不更新,1更新)
            updateSupplierFlag: false, // 更新供应商标志(0不更新,1更新)
          };
          v.editType = "placeOrder"; // 下单状态
          v.initOrderData();
        });
      } else if (type == "2") {
        // 作废
        this.activeData = data;
        this.activeData.status = 1;
        this.voidType = "single";
        this.model1 = true;
      }
    },
    confirmFn(name) {
      let v = this;
      v.$refs[name].validate((valid) => {
        if (valid) {
          v.modifyLoading = true;
          let arr = v.deepCopy(v.selectionArr);
          arr.forEach((n, i) => {
            // n.purchaserName = v.setting.purchaserName
            n.purchaserId = v.setting.purchaserId;
          });
          v.axios.post(api.requirementBatchModify, arr).then((res) => {
            if (res.data.code == 0) {
              v.$Message.success("修改成功");
              v.getList(true);
              v.modifyLoading = false;
              v.isShowSettingPurchaser = false;
            }
          });
        }
      });
    },
    exportEcxel() {
      // 批量导出
      let v = this;
      if (v.requirementData.length === 0) {
        v.$Message.error("无数据导出");
      } else {
        v.getDateValue(v.submitTime);
        // if (this.searchType == 0) {
        //   // this.pageParams.supplierId = this.supOrSku
        //   this.pageParams.supplierName = this.supOrSku;
        //   this.pageParams.skuList = [];
        // } else if (this.searchType == 1) {
        //   this.pageParams.skuList = v.sepCommasFn(this.supOrSku);
        //   this.pageParams.supplierName = null;
        // }
        let params = this.getPageParams();
        v.axios.post(api.requirementExport, params).then((response) => {
          if (response.data.code == 0) {
            v.$Message.success("导出成功");
            // window.location = v.$store.state.imgUrl + response.data.datas;
          }
        });
      }
    },
    intiBaseDataList() {
      let v = this;
      v.axios.post(api.warehouse, { pageParams: 1 }).then((res) => {
        if (res.data.code == 0) {
          v.warehouseArr = res.data.datas;
          v.purchaseWarehouseArr = [];
          v.warehouseArr.forEach((n, i) => {
            if (n.warehouseType == "0" || n.warehouseType == "5") {
              v.purchaseWarehouseArr.push(n);
            }
          });
        }
      });
      v.axios.get(api.userList).then((res) => {
        if (res.data.code == 0) {
          let arr = [];
          let datas = res.data.datas;
          for (let i in datas) {
            if (i != "service") {
              arr.push({
                id: i,
                name: datas[i].userName,
              });
            }
          }
          v.purchaserArr = arr;
        }
      });
    },
    getPurchaseNum(type) {
      if (!this.pagePermission.list || !type) return;
      this.axios.get("/sps-service/sps/requirement/number").then((res) => {
        this.readyTypeList[0].num = res.data.datas.urgentNum;
        this.readyTypeList[1].num = res.data.datas.generalNum;
        this.readyTypeList[2].num = res.data.datas.overseasWarehouseNum;
        this.readyTypeList[3].num = res.data.datas.fbaNum;
        this.readyTypeList[4].num = res.data.datas.directlyNum;
        this.readyTypeList[5].num = res.data.datas.directDeliveryNum || 0;
      });
    },
    // 获取备货类型下每个事业部采购需求总数
    getNumberByBusinessDept (readyType, type) {
      if (!type) return;
      if (this.$common.isEmpty(this.businessDeptNumberData) || this.$common.isEmpty(this.businessDeptNumberData[readyType])) {
        this.$set(this.businessDeptNumberData, readyType, {});
      }
      this.axios.get(api.get_numberByBusinessDept, {params: {
        readyType: readyType
      }}).then((res) => {
        if (res.data && res.data.code === 0) {
          (res.data.datas || []).forEach(item => {
            this.$set(this.businessDeptNumberData[readyType], item.businessDeptId, item);
          })
        }
      }).catch(() => {
        this.$set(this.businessDeptNumberData, readyType, {});
      })
    },
    // 复制
    copy(str) {
      copy_clip(str, this);
    },
    getBusinessDeptInfo() {
      this.axios
        .post("/sps-service/sps/common/businessDeptInfo")
        .then((res) => {
          this.businessDeptInfoList = res.data.datas;
          let businessDeptIds =
            this.securityUser.businessDeptIds.split(",");
          this.businessDeptInfoList = this.businessDeptInfoList.filter(
            (item) => {
              return businessDeptIds.includes(item.id.toString());
            }
          );
          this.pageParams.businessDeptId = this.businessDeptInfoList[0].id;
          this.startLoading();
        });
    },
    checkOrderListStatus(arr) {
      let statusList = arr.map((item) => {
        return item.setupStatus;
      });
      let status = [...new Set(statusList)].length == 1 ? true : false;
      return status;
    },
  },
};
</script>
<style lang='less'>
.ADDWANGWANGIMG img {
  width: 20px;
}

.ADDQQIMG img {
  width: 20px;
}
.purchaseRequire .ivu-tabs-bar {
  margin-bottom: 0;
}
.verticalCheck .ivu-checkbox {
  margin-right: 20px;
}

.supplierTabsBar .ivu-tabs-nav-prev,
.supplierTabsBar .ivu-tabs-nav-next {
  display: none;
}

.trimming .buttonsArrows .arrowDown {
  margin: 10px 0 0 2px;
}

.sameStyleSearch .sameStyle {
  vertical-align: middle;
  display: inline-block;
  margin-left: 10px;
  color: #2d8cf0;
}

.sameStyleSearch .sameStyle:hover {
  cursor: pointer;
  text-decoration: underline;
  color: #ff6600;
}
.pos-rel {
  position: relative;
}

.orderTable .purchasing_links {
  display: inline-block;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.platformParamsSelect {
  &.purchaseRequirement{
    .ivu-form-item{
      margin-bottom: 16px;
    }
    .readyType {
      .ivu-form-item-content {
        width: auto;
      }
    }
    .requireStatus {
      .ivu-form-item-content {
        width: 150px;
      }
    }
    .belongBusinese {
      .ivu-form-item-content {
        width: 1100px;
      }
    }
  }
}
</style>
<style lang="less" scoped>
.business-dept-number{
  color: #f20;
}
.ivu-radio-wrapper-checked {
  .business-dept-number {
    color: inherit;
  }
}
.page-main{
  height: calc(100vh - 95px);
  overflow: auto;
}
.mainContent{
  padding: 0;
  height: calc(100vh - 94px);
  overflow-y: auto;
}
:deep(.supplier-abutment-type){
  display: inline-block;
  border: 1px solid #2d8cf0;
  padding: 2px 7px;
  border-radius: 5px;
  margin-top: 5px;
  margin-bottom: 5px;
  background: #fff;
  box-shadow: 0px 0px 5px #2d8cf0;
}
</style>