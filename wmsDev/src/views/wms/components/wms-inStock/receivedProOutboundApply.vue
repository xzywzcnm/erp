<template>
  <div>
    <template v-if="curShow === 'managentPage'">
      <div>
        <div class="card-container">
          <div class="card-content">
            <Tabs v-model="curTab" @on-click="showCurrentPage">
              <TabPane v-for="item in tabItems" :label="item.label" :key="item.value" :name="item.value"></TabPane>
            </Tabs>
            <div class="platformParamsSelect">
              <Form ref="pageParams" :model="pageParams" :label-width="100">
                <dyt-filter>
                  <FormItem label="处理编号:" prop="handleNoList">
                    <dyt-input-tag :limit="1" v-model="pageParams.handleNoList" placeholder="多个用逗号或回车分开"
                      type="textarea"></dyt-input-tag>
                  </FormItem>
                  <FormItem label="创建时间:" prop="createTime">
                    <DatePicker transfer type="datetimerange" placement="bottom-end" placeholder="选择日期"
                      style="width: 100%" split-panels v-model="createTime" @on-clear="resetDate('created')"
                      format="yyyy-MM-dd HH:mm:ss" :options="dateOptions" @on-change="(e) => {
                        getDateValue(e, 'created');
                      }
                        " />
                  </FormItem>
                  <FormItem label="供应商名称:" prop="supplierName">
                    <Input v-model="pageParams.supplierName" clearable />
                  </FormItem>
                  <FormItem label="出库原因:" prop="pickingReason">
                    <dyt-select v-model="pageParams.pickingReason" clearable placeholder="请选择">
                      <Option v-for="(item, index) in outboundReasonList" :value="item.value" :key="index">{{ item.label
                      }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="创建人:" prop="createdByList">
                    <dyt-select v-model="pageParams.createdByList" :max-tag-count="1" multiple clearable filterable>
                      <Option v-for="(item, index) in createByArr" :value="item.userId" :key="index">{{ item.userName }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="所属事业部:" prop="businessDeptIdList">
                    <dyt-select v-model="pageParams.businessDeptIdList" :max-tag-count="1" multiple clearable filterable>
                      <Option v-for="(item, index) in businessDeptArr" :value="item.id" :key="index">{{ item.name }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="更新时间:" prop="updatedTime">
                    <DatePicker transfer type="datetimerange" placement="bottom-end" placeholder="选择日期"
                      style="width: 100%" split-panels v-model="updatedTime" @on-clear="resetDate('updated')"
                      format="yyyy-MM-dd HH:mm:ss" :options="dateOptions" @on-change="(e) => {
                        getDateValue(e, 'updated');
                      }
                        " />
                  </FormItem>
                  <FormItem label="金额退/抵方式:" prop="amountModeList">
                    <dyt-select v-model="pageParams.amountModeList" :max-tag-count="1" multiple>
                      <Option v-for="(item, index) in refundOffsetList" :value="item.value" :key="index">{{ item.label }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="记账月份:" prop="tallyTime">
                    <DatePicker type="month" placeholder="请选择月份" format="yyyy-MM" :value="pageParams.tallyTime"
                      @on-change="billMothChange" transfer></DatePicker>
                  </FormItem>
                  <FormItem label="结算方式:" prop="settlementTypeList">
                    <dyt-select v-model="pageParams.settlementTypeList" clearable filterable multiple>
                      <Option v-for="(item, index) in settlementMethodArr" :value="item.dataValue" :key="index">{{
                        item.dataDesc
                      }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="到货异常编号" prop="abnormalArrivalNoList">
                    <dyt-input-tag :limit="1" type="textarea" v-model="pageParams.abnormalArrivalNoList"
                      placeholder="请输入入库出库处理编号，多个请用逗号或回车分隔" />
                  </FormItem>
                  <FormItem label="出库单号" prop="pickingNoList">
                    <dyt-input-tag :limit="1" type="textarea" v-model="pageParams.pickingNoList"
                      placeholder="请输入出库单号，多个请用逗号或回车分隔" />
                  </FormItem>
                  <FormItem label="寄出时间:" prop="shippingTime">
                    <DatePicker transfer type="datetimerange" placement="bottom-end" placeholder="选择日期"
                      style="width: 100%" split-panels v-model="shippingTime" @on-clear="shippingTimeChange"
                      format="yyyy-MM-dd HH:mm:ss" :options="dateOptions" @on-change="shippingTimeChange" />
                  </FormItem>
                  <FormItem label="寄出物流单号" prop="shipmentTrackingNumberList">
                    <dyt-input-tag :limit="1" type="textarea" v-model="pageParams.shipmentTrackingNumberList"
                      placeholder="请输入寄出物流单号，多个请用逗号或回车分隔" />
                  </FormItem>
                  <div slot="operation" style="margin-bottom: 50px">
                    <Button type="primary" @click="search" icon="ios-search" class="mr10">查询</Button>
                    <Button @click="reset" v-once icon="md-refresh">重置</Button>
                  </div>
                </dyt-filter>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <div class="flexBox spaceBetween">
        <div class="tableControl mb10">
          <Button type="primary" class="mr10" v-if="getPermission('wms_receivedProOutboundApply_add')"
            @click="addNewApply">新增</Button>
          <Dropdown @on-click="exportBtn" v-if="getPermission('wms_receivedProOutboundApply_export')">
            <Button type="primary">
              <span class="icon iconfont" style="font-size: 12px">&#xe639;</span>
              Excel导出
              <Icon type="md-arrow-dropdown"></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem name="0">导出选中数据</DropdownItem>
              <DropdownItem name="1">导出所有结果集</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      <div>
        <div>
          <Table ref="returnsTable" highlight-row :border="true" :loading="loading" :height="tableHeight"
            :columns="tableColumn" :data="tableData" @on-selection-change="getSelectValue">
          </Table>
          <div class="table-page clear">
            <div class="table-page-right">
              <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
                :current="pageParams.pageNum" show-sizer @on-page-size-change="changePageSize" placement="top"
                :page-size-opts="pageArray"></Page>
            </div>
          </div>
        </div>
      </div>
    </template>
    <transition name="bounce">
      <template v-if="curShow === 'addApply'">
        <div class="subLayer infoDetails">
          <div class="topper">
            <span class="arrowLeft" @click="goBack">
              <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
            </span>
            <div style="margin-left: 130px; position: absolute">
              <Button type="primary" class="mr10" @click="submitOrSave('submit')">提交</Button>
              <Button type="primary" class="mr10" @click="submitOrSave('save')">暂存</Button>
            </div>
          </div>
          <div class="mainContent">
            <addReceivedProApply ref="addReceivedProApply" @goBack="goBack"></addReceivedProApply>
          </div>
        </div>
      </template>
      <template v-if="curShow === 'editOrViewApply'">
        <div class="subLayer infoDetails">
          <div class="topper">
            <span class="arrowLeft" @click="goBack">
              <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
            </span>
            <div style="margin-left: 130px; position: absolute" v-if="this.detailsData.type === 'edit'">
              <Button type="primary" class="mr10" v-if="detailsData.receivedProApplyForm.status !== 6"
                @click="editDeatils('submit')">{{ detailSubmitBtnNameMap[detailsData.receivedProApplyForm.status]
                }}</Button>
              <Button type="primary" class="mr10" v-if="getPermission('wms_receivedProOutboundApply_return') &&
                detailsData.receivedProApplyForm.status !== 1 &&
                detailsData.receivedProApplyForm.status !== 6
                " @click="editDeatils('return')">退回</Button>
              <Button type="primary" class="mr10" @click="editDeatils('save')">保存</Button>
            </div>
          </div>
          <div class="mainContent">
            <receivedProApplyDetails ref="receivedProApplyDetails" :detailsData="detailsData" @goBack="goBack">
            </receivedProApplyDetails>
          </div>
        </div>
      </template>
    </transition>
  </div>
</template>
<script>
import Mixin from "@/components/mixin/common_mixin";
import api from "@/api/api";
import addReceivedProApply from "./addReceivedProApply.vue";
import receivedProApplyDetails from "./receivedProApplyDetails.vue";
import { getAllWarehouse } from "@/utils/user";
export default {
  mixins: [Mixin],
  components: { addReceivedProApply, receivedProApplyDetails },
  data() {
    let dayjs = this.$common.dayjs();
    return {
      curShow: "managentPage", // 当前页面
      tabItems: [
        {
          label: "全部",
          value: "-1",
        },
        {
          label: "待提交",
          value: "1",
        },
        {
          label: "待创建出库单",
          value: "2",
        },
        {
          label: "待寄出",
          value: "3",
        },
        {
          label: "待核对",
          value: "4",
        },
        {
          label: "待审核",
          value: "5",
        },
        {
          label: "已完成",
          value: "6",
        },
      ],
      curTab: "-1",
      pageParams: {
        status: null,
        handleNoList: [], // 处理编号
        createdStartTime: dayjs.subtract(6, "day").format("YYYY-MM-DD") + " 00:00:00",
        createdEndTime: dayjs.format("YYYY-MM-DD") + " 23:59:59",
        supplierName: null,
        pickingReason: null,
        createdByList: null,
        businessDeptIdList: null,
        amountModeList: [],
        tallyTime: null,
        abnormalArrivalNoList: [],
        pickingNoList: [],
        settlementTypeList: [],
        pageSize: 20,
        pageNum: 1,
        currentWarehouseId: this.getWarehouseId(),
        shipmentTrackingNumberList: [],
        startShipmentDate: null,
        endShipmentDate: null,
      },
      createTime: [
        dayjs.subtract(6, "day").format("YYYY-MM-DD") + " 00:00:00",
        dayjs.format("YYYY-MM-DD") + " 23:59:59",
      ],
      updatedTime: [],
      shippingTime: [],
      outboundReasonList: [
        {
          label: "质量问题",
          value: 1,
        },
        {
          label: "入库错误",
          value: 2,
        },
        {
          label: "采多出库",
          value: 3,
        },
        {
          label: "库存报废",
          value: 4,
        },
        {
          label: "滞销/清仓处理",
          value: 5,
        },
        {
          label: "问题商品退货",
          value: 6,
        },
      ],
      createByArr: [],
      // businessDeptArr: this.$store.getters.getBusinessDeptList,
      loading: false,
      refundOffsetList: {
        1: { label: '累计月结抵扣', value: 1 },
        2: { label: '逐单现金退还', value: 2 },
        3: { label: '由公司承担', value: 3 },
        4: { label: '其他', value: 4 },
      },
      tableColumn: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          key: "handleNo",
          title: "处理编号",
          width: 260,
          render: (h, params) => {
            let statusMap = {
              1: { label: "待提交", color: 'orange' },
              2: { label: "待创建出库单", color: 'orange' },
              3: { label: "待寄出", color: 'orange' },
              4: { label: "待核对", color: 'orange' },
              5: { label: "待审核", color: 'orange' },
              6: { label: "已完成", color: 'green' },
            };
            let businessDeptName = "";
            this.businessDeptArr.forEach((item) => {
              if (params.row.businessDeptId === item.id) {
                businessDeptName = item.name;
              }
            });
            let statusItem = statusMap[params.row.status];
            let settlementType = "";
            this.settlementMethodArr.forEach(item => {
              if (params.row.settlementTypeName == item.dataValue) {
                settlementType = item.dataDesc
              }
            })
            return [
              h(
                "div",
                {
                  style: {
                    cursor: "pointer",
                    color: "#31A1FF",
                    marginTop: '5px'
                  },
                  on: {
                    click: () => {
                      this.getApplyDetials("view", params.row);
                    },
                  },
                },
                params.row.handleNo
              ),
              h(
                "div",
                {
                  class: "tag-hideBorder",
                },
                [
                  !this.$common.isEmpty(statusItem)
                    ? h(
                      "Tag",
                      {
                        props: { color: statusItem.color },
                      },
                      statusItem.label,
                    )
                    : "",
                  h(
                    "Tag",
                    {
                      props: { color: 'primary' },
                    },
                    businessDeptName
                  ),
                  this.$common.isEmpty(settlementType) ? null
                    : h('Tooltip', {
                      props: {
                        content: '结算方式',
                        transfer: true
                      }
                    }, [
                      h('Tag', {
                        props: { color: 'magenta' },
                      }, settlementType)
                    ]),
                ]
              ),
            ];
          },
        },
        {
          key: "supplierName",
          title: "供应商名称",
          align: "center",
          minWidth: 160,
          render: (h, { row }) => {
            let supplierName = '';
            this.supplierArr.forEach((item) => {
              if (row.supplierId === item.supplierId) {
                supplierName = item.supplierName;
              }
            });
            return h('div', {}, supplierName)
          }
        },
        {
          key: "pickingReason",
          title: "出库原因",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            let reasonMap = this.$common.arrayToObj(this.outboundReasonList);
            let item = reasonMap[params.row.pickingReason] || {};
            return h("div", {}, item.label || '');
          },
        },
        {
          key: "returnNumber",
          title: "预计退货数量",
          align: "center",
          width: 110,
        },
        {
          key: "stockApplyTotalAmount",
          title: "申请出库总金额",
          align: "center",
          minWidth: 140,
        },
        {
          key: "amountMode",
          title: "金额退/抵方式(核对)",
          align: "center",
          minWidth: 150,
          render: (h, params) => {
            let item = this.refundOffsetList[params.row.amountMode] || {};
            return h("div", {}, item.label);
          },
        },
        {
          key: "returnTotalAmount",
          title: "需抵/退还金额",
          align: "center",
          minWidth: 120,
        },
        {
          key: "actualReturnAmount",
          title: "实际退/抵金额",
          align: "center",
          width: 120,
        },
        {
          key: "tallyTime",
          title: "记账月份",
          align: "center",
          width: 90,
        },
        {
          key: "createInfo",
          title: "创建信息",
          align: "center",
          minWidth: 100,
          render: (h, params) => {
            let createdByName = "";
            this.createByArr.forEach((item) => {
              if (params.row.createdBy == item.userId) {
                createdByName = item.userName;
              }
            });
            return [
              h("div", {}, createdByName),
              h("div", {
                style: {
                  width: '62px',
                  margin: '0 auto',
                }
              }, params.row.createdTime),
            ];
          },
        },
        {
          key: "updatedTime",
          title: "更新时间",
          align: "center",
          width: 80,
        },
        {
          key: "operation",
          align: "center",
          title: "操作",
          width: 100,
          render: (h, { row }) => {
            // 此处为审核规则校验权限
            let flag = false
            let checkByList = row.checkByList
            if (this.$common.isEmpty(checkByList)) {
              // 如果为空或者为Null则免审
              flag = true
            } else {
              checkByList.forEach(item => {
                if (item == this.userInfo.userId) {
                  flag = true
                }
              })
            }
            const status =
              !this.$common.isEmpty(row.status) && Number(row.status);
            let powerList = {
              1: "wms_receivedProOutboundApply_waitsubmit",
              2: "wms_receivedProOutboundApply_waitCreateReceiptSubmit",
              3: "wms_receivedProOutboundApply_waitMailSubmit",
              4: "wms_receivedProOutboundApply_waitCheckSubmit",
              5: "wms_receivedProOutboundApply_waitExamineSubmit",
            };
            let power = this.getPermission(powerList[status]);
            let submitNameMap = {
              1: '提交',
              2: '提交',
              3: '提交',
              4: '提交',
              5: '审核',
            }
            return h(
              "Dropdown",
              {
                props: {
                  transfer: true,
                },
              },
              [
                h(
                  "Button",
                  {
                    props: {
                      type: "default",
                    },
                  },
                  [
                    h("span", "操作"),
                    h(
                      "Icon",
                      {
                        props: {
                          type: "md-arrow-dropdown",
                        },
                      },
                      ""
                    ),
                  ]
                ),
                h(
                  "DropdownMenu",
                  {
                    slot: "list",
                  },
                  [
                    h(
                      "DropdownItem",
                      {
                        nativeOn: {
                          click: (e) => {
                            this.getApplyDetials("view", row);
                          },
                        },
                      },
                      "详情"
                    ),
                    // this.getPermission("wms_receivedProOutboundApply_submit")
                    power && [1, 2, 3, 4, 5].includes(row.status) && flag
                      ? h(
                        "DropdownItem",
                        {
                          nativeOn: {
                            click: (e) => {
                              this.getApplyDetials("edit", row);
                            },
                          },
                        },
                        submitNameMap[status]
                      )
                      : null,
                    this.getPermission("wms_receivedProOutboundApply_del") &&
                      row.status === 1
                      ? h(
                        "DropdownItem",
                        {
                          nativeOn: {
                            click: (e) => {
                              this.$Modal.confirm({
                                title: "删除申请",
                                content: `你将删除该申请`,
                                loading: true,
                                okText: "删除",
                                onOk: () => {
                                  this.loading = true;
                                  this.axios
                                    .get(
                                      `${api.delete_apply}?handleNo=${row.handleNo}`
                                    )
                                    .then((res) => {
                                      if (res.data.code === 0) {
                                        this.$Message.success("操作成功");
                                        this.getList();
                                      }
                                    })
                                    .finally(() => {
                                      this.$Modal.remove();
                                      this.loading = false;
                                    });
                                },
                              });
                            },
                          },
                        },
                        "删除"
                      )
                      : null,
                  ]
                ),
              ]
            );
          },
        },
      ],
      tableData: [],
      total: 0,
      selectionArr: [],
      detailsData: {},
      settlementMethodArr: [],
      supplierArr: [],
      warehouseList: [],
      detailSubmitBtnNameMap: {
        1: '提交',
        2: '提交',
        3: '提交',
        4: '提交',
        5: '审核通过',
      }
    };
  },
  created() {
    this.initData();
    this.getList();
    this.GetAllWarehouse();
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(360);
    },
    // 获取当前登录账号可查看的事业部ID列表
    allowBusinessDeptIds() {
      return this.$store.getters["allowBusinessDeptIds"].join(",");
    },
    businessDeptArr() {
      return this.$store.getters["getBusinessDeptList"];
    },
    userInfo() {
      return this.$store.state.userInfo;
    }
  },
  methods: {
    billMothChange(e) {
      this.pageParams.tallyTime = e;
    },
    // 获取仓库数据
    GetAllWarehouse() {
      let v = this;
      getAllWarehouse().then((res) => {
        v.warehouseList = res;
      });
    },
    showCurrentPage(val) {
      this.pageParams.status = val == "-1" ? null : Number(val);
      this.resetDate('created')
      this.createTime = []
      this.getList();
    },
    initData() {
      this.getAllUser().then((res) => { });
      this.axios
        .get(api.baseDataList + "?dataType=" + "settlementType")
        .then((res) => {
          if (res.data.code == 0) {
            this.settlementMethodArr = res.data.datas;
          }
        });
      this.axios
        .post(`${api.get_SupplierInfo}?businessDeptIds=`)
        .then((res) => {
          if (res.data.code === 0) {
            this.supplierArr = res.data.datas.map((item) => {
              let supplierReceivingInfo = "";
              supplierReceivingInfo = `${item.contactMan ? item.contactMan : "--"
              }  ${item.telephone ? item.telephone : "--"}  ${item.rAddress ? item.rAddress : "--"
              }  ${item.rAddressDetail ? item.rAddressDetail : "--"} `;
              return {
                ...item,
                supplierReceivingInfo: supplierReceivingInfo,
              };
            });
          }
        });
    },
    getAllUser() {
      return new Promise((resolve) => {
        this.$store
          .dispatch("getPurchaserList")
          .then((res) => {
            this.createByArr = Object.values(res || {});
            resolve(res || {});
          })
          .catch(() => {
            resolve({});
          });
      });
    },
    // 创建时间
    getDateValue(value, name) {
      if (value && value.length > 0 && value[0] != "") {
        this.pageParams[`${name}StartTime`] = value[0];
        this.pageParams[`${name}EndTime`] = value[1];
      }
    },
    // 重置时间
    resetDate(type) {
      this.pageParams[`${type}StartTime`] = null;
      this.pageParams[`${type}EndTime`] = null;
    },
    shippingTimeChange(e) {
      const timeList = e || [];
      this.pageParams.startShipmentDate = timeList[0] || null;
      this.pageParams.endShipmentDate = timeList[1] || null;
    },
    exportBtn(val) {
      let obj = {};
      if (val == "0") {
        obj = {
          handleNoList: this.selectionArr.map((item) => item.handleNo),
          currentWarehouseId: this.pageParams.currentWarehouseId,
        };
      } else {
        obj = this.$common.copy(this.pageParams);
      }
      this.loading = true;
      this.axios
        .post(api.export_syncApply, obj)
        .then((res) => {
          if (res.data.code === 0) {
            this.$Message.success("导出成功");
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    getSelectValue(selection) {
      this.selectionArr = selection;
    },
    search() {
      this.getList();
    },
    reset() {
      this.$refs["pageParams"].resetFields();
      this.createTime = [];
      this.shippingTime = [];
      // this.pageParams.createdStartTime = null;
      // this.pageParams.createdEndTime = null;
      this.resetDate('created')
      this.resetDate('shipping')
    },
    getList() {
      if (!this.getPermission("wms_receivedProOutboundApply_query")) { return this.$Message.error("暂无权限"); }
      let obj = this.$common.copy(this.pageParams);
      this.loading = true;
      this.axios
        .post(api.query_goodsStockApplyList, obj)
        .then((res) => {
          if (res.data.code === 0) {
            this.tableData = res.data.datas.list;
            this.total = res.data.datas.total;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 页数改变
    changePage(val) {
      this.pageParams.pageNum = val;
      this.getList();
    },
    // 页尺寸改变
    changePageSize(val) {
      this.pageNum = 1;
      this.pageParams.pageSize = val;
      this.getList();
    },
    addNewApply() {
      this.curShow = "addApply";
    },
    goBack() {
      this.curShow = "managentPage";
      this.getList();
    },
    // 添加申请保存或提交
    submitOrSave(type) {
      this.$refs.addReceivedProApply.submitOrSave(type);
    },
    // 编辑申请按钮方法
    editDeatils(type) {
      if (type === "return") {
        this.$refs.receivedProApplyDetails.returnApply();
      } else {
        this.$refs.receivedProApplyDetails.editDeatils(type);
      }
    },
    // 打开详情或者编辑页面
    getApplyDetials(type, val) {
      this.detailsData.type = type;
      this.loading = true;
      this.axios
        .get(`${api.get_goodsStockApplyDetail}?handleNo=${val.handleNo}`)
        .then((res) => {
          if (res.data.code === 0) {
            this.detailsData.receivedProApplyForm = res.data.datas;
            this.detailsData.createByArr = this.createByArr;
            this.detailsData.supplierArr = this.supplierArr;
            this.detailsData.warehouseList = this.warehouseList;
            this.detailsData.settlementMethodArr = this.settlementMethodArr;
            this.curShow = "editOrViewApply";
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
<style lang="less">
.card-content {
  border-color: #ffff;
}

.infoDetails .mainContent {
  background: #fff;
  border-left: 1px solid #eee;
  height: auto;
}

.subLayer .mainContent {
  padding: 20px;
  box-sizing: border-box;
}

.subLayer .arrowLeft {
  font-size: 16px;
  color: #333;
  display: inline-block;
  cursor: pointer;
  height: 60px;
  line-height: 60px;
  position: absolute;
  top: 0;
  left: 30px;
}

.subLayer .arrowLeft .IconBack {
  font-size: 22px;
  vertical-align: middle;
  margin-right: 10px;
  margin-top: -2px;
}
</style>