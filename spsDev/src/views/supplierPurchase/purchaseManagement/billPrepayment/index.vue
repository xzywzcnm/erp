<template>
  <div>
    <template v-if="curShow === 'billManagement'">
      <div class="commonFilter">
        <div class="card-container">
          <div class="card-content">
            <div class="platformParamsSelect">
              <Tabs v-model="curTab" @on-click="showCurrentPage">
                <TabPane v-for="item in statusListArr" :label="item.label" :key="item.value" :name="item.value"></TabPane>
              </Tabs>
              <Form ref="pageParams" :model="pageParams" :label-width="100">
                <dyt-filter>
                  <FormItem label="创建时间:" prop="createTime">
                    <DatePicker transfer type="datetimerange" placement="bottom-end" placeholder="选择日期"
                      style="width: 100%" split-panels v-model="createTime" @on-clear="resetDate('create')"
                      format="yyyy-MM-dd HH:mm:ss" :options="dateOptions" @on-change="(e) => {
                        getDateValue(e, 'create');
                      }
                        " />
                  </FormItem>
                  <FormItem label="账单月份:" prop="billMonthArr">
                    <DatePicker transfer type="month" style="width: 100%" v-model="pageParams.billMonth" @on-change="(e) => {
                      getDateValue(e, 'month');
                    }
                      "></DatePicker>
                  </FormItem>
                  <!-- <FormItem label="账单状态:" prop="statusList">
                        <dyt-select v-model="pageParams.statusList" 
                          :max-tag-count="1"
                          multiple
                          clearable placeholder="请选择">
                            <Option
                            v-for="(item,index) in statusListArr"
                            :value="item.value"
                            :key="index">{{ item.label }} 
                            </Option> 
                          </dyt-select>
                      </FormItem> -->
                  <FormItem label="申请编号:" prop="billApplyNoList">
                    <dyt-input-tag :limit="1" v-model="pageParams.billApplyNoList" placeholder="多个用逗号或回车分开"
                      type="textarea">
                    </dyt-input-tag>
                  </FormItem>
                  <FormItem label="结算方式:" prop="settlementTypeList">
                    <dyt-select v-model="pageParams.settlementTypeList" :max-tag-count="1" multiple clearable
                      placeholder="请选择">
                      <Option v-for="(item, index) in settlementTypeArr" :value="item.dataValue" :key="index">{{
                        item.dataDesc }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="创建人:" prop="userIdList">
                    <dyt-select v-model="pageParams.userIdList" :max-tag-count="1" multiple clearable placeholder="请选择">
                      <Option v-for="(item, index) in createUserArr" :value="item.userId" :key="index">{{ item.userName }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="" :label-width="1" class="form-item-notlabel">
                    <dyt-input v-model.trim="searchSupplier" style="width: 380px">
                      <dyt-select v-model="supplierOptionDefault" slot="prepend" :style="`width: 110px`">
                        <Option v-for="item in supplierArr" :value="item.type" :key="item.type">{{ item.title }}
                        </Option>
                      </dyt-select>
                    </dyt-input>
                  </FormItem>
                  <FormItem label="月总剩未付:" class="startEndPayAmount">
                    <InputNumber v-model="pageParams.monthUnpaidPriceStart" placeholder="最小值" :min="0" />
                    <span style="padding: 0 5px">-</span>
                    <InputNumber v-model="pageParams.monthUnpaidPriceEnd" :min="pageParams.monthUnpaidPriceStart"
                      placeholder="最大值" />
                  </FormItem>
                  <div slot="operation" style="margin-bottom: 30px">
                    <Button type="primary" @click="search" icon="ios-search" class="mr10">查询</Button>
                    <Button @click="reset" v-once icon="md-refresh">重置</Button>
                  </div>
                </dyt-filter>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <div class="flexBox spaceBetween alignItemCenter mb10">
        <div class="tableControl" style="margin-left: 12px">
          <Button type="primary" class="mr20" v-if="getPermission('supplierBillApply_addApply')"
            @click="getBill('add')">新增</Button>
          <Dropdown @on-click="exportBtn">
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
        <div>
          <div class="mr10" style="color:#6290FF;cursor: pointer;" @click="deductionDetail"
            v-if="getPermission('supplierBillApply_deduction_list')">
            <Icon type="ios-albums-outline" /> 汇总抵扣管理
          </div>
        </div>
      </div>
      <div class="commonFilter">
        <div class="orderTable">
          <Table ref="billApplyTable" highlight-row :border="true" :loading="tableLoading" :height="tableHeight"
            :columns="billColumns" :data="tableData" @on-selection-change="getSelectValue">
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
    <Transition name="bounce">
      <template v-if="curShow === 'addBill'">
        <div class="subLayer infoDetails">
          <div class="topper" style="display: flex">
            <span class="arrowLeft" @click="goBackForm">
              <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
            </span>
            <div style="margin-left: 150px">
              <Button type="primary" @click="saveOrSubmit('submit')">提交</Button>
              <Button class="ml20" @click="saveOrSubmit('save')">暂存</Button>
            </div>
          </div>
          <div class="mainContent">
            <addBillApply ref="addBillApply" :settlementTypeArr="settlementTypeArr" @goBackForm="goBackForm">
            </addBillApply>
          </div>
        </div>
      </template>
      <template v-if="curShow === 'billDetails'">
        <div class="subLayer infoDetails">
          <div class="topper" style="display: flex">
            <span class="arrowLeft" @click="goBackForm">
              <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
            </span>
            <div style="margin-left: 150px">
              <Button type="primary" class="ml20" v-if="[2, 3, 4].includes(billFormData.status) &&
                this.billFormData.editType == 'edit'
                " @click="agreeOrReject('agree')">{{ detaildSubmitNameMap[billFormData.status] }}</Button>
              <Button class="ml20" v-if="[2, 3].includes(billFormData.status) &&
                this.billFormData.editType == 'edit'
                " type="error" @click="agreeOrReject('reject')">拒绝</Button>
              <Button type="primary" v-if="billFormData.status === 1 &&
                this.billFormData.editType == 'edit'
                " @click="saveOrSubmit('submit', 'edit')">提交</Button>
              <Button class="ml20" v-if="[1].includes(billFormData.status) &&
                this.billFormData.editType == 'edit'
                " @click="saveOrSubmit('save', 'edit')">暂存</Button>
              <Button class="ml20" v-if="[4].includes(billFormData.status) &&
                this.billFormData.editType == 'edit'
                " @click="savePayment()">保存</Button>
            </div>
          </div>
          <div class="mainContent">
            <billApplyDetailsVue ref="billApplyDetails" :billFormData="billFormData"
              :settlementTypeArr="settlementTypeArr" @goBackForm="goBackForm"></billApplyDetailsVue>
          </div>
        </div>
      </template>
    </Transition>
    <!-- 汇总抵扣管理 -->
    <deductionManage :modelVisible.sync="deductionInfo.visible" />
  </div>
</template>
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import addBillApply from "./addBillApply.vue";
import billApplyDetailsVue from "./billApplyDetails.vue";
import deductionManage from "./deductionManage/list.vue";
export default {
  mixins: [Mixin],
  components: { addBillApply, billApplyDetailsVue, deductionManage },
  data() {
    let dayjs = this.$common.dayjs();
    return {
      curShow: "billManagement",
      pageParams: {
        pageNum: 1,
        pageSize: 20,
        createStartTime:
          dayjs.subtract(6, "day").format("YYYY-MM-DD") + " 00:00:00",
        createEndTime: dayjs.format("YYYY-MM-DD") + " 23:59:59",
        billMonth: null,
        statusList: [],
        billApplyNoList: [],
        settlementTypeList: [],
        userIdList: [],
        supplierCode: null,
        supplierName: null,
        monthUnpaidPriceStart: null,
        monthUnpaidPriceEnd: null,
      },
      createTime: [
        dayjs.subtract(6, "day").format("YYYY-MM-DD") + " 00:00:00",
        dayjs.format("YYYY-MM-DD") + " 23:59:59",
      ],
      statusListArr: [
        { label: "全部", value: "-1" },
        { label: "待提交", value: "1" },
        { label: "待审核", value: "2" },
        { label: "待复审", value: "3" },
        { label: "待付款", value: "4" },
        { label: "已完成", value: "5" },
        { label: "已作废", value: "6" },
      ],
      settlementTypeArr: [], // 供应商结算方式列表
      createUserArr: [],
      supplierArr: [
        {
          type: "1",
          title: "供应商名称",
        },
        {
          type: "2",
          title: "供应商代码",
        },
      ],
      supplierOptionDefault: "1",
      searchSupplier: null,
      tableData: [],
      tableHeight: this.getTableHeight(340),
      total: 0,
      tableLoading: false,
      billColumns: [
        {
          type: "selection",
          align: "center",
          width: 60,
        },
        {
          key: "billApplyNo",
          title: "申请信息",
          render: (h, params) => {
            let colorMap = {
              1: { bg: "#FEF0DE", color: "#F59F2E", label: "待提交" },
              2: { bg: "#FEF0DE", color: "#F59F2E", label: "待审核" },
              3: { bg: "#FEF0DE", color: "#F59F2E", label: "待复审" },
              4: { bg: "#FEF0DE", color: "#F59F2E", label: "待付款" },
              5: { bg: "#EFFDDA", color: "#26B72D", label: "已完成" },
              6: { bg: "#F9D9DD", color: "#E24054", label: "已作废" },
            };
            return [
              h(
                "div",
                {
                  style: {
                    color: "#6290FF",
                    cursor: "pointer",
                    marginBottom: "5px",
                  },
                  on: {
                    click: () => {
                      this.getBill("details", params.row);
                    },
                  },
                },
                `申请编号: ${params.row.billApplyNo}`
              ),
              h(
                "div",
                {
                  style: {
                    marginBottom: "5px",
                  },
                },
                params.row.supplierName
              ),
              h(
                "div",
                {
                  style: {
                    width: colorMap[params.row.status].label.length * 15 + "px",
                    background: colorMap[params.row.status].bg,
                    color: colorMap[params.row.status].color,
                    textAlign: "center",
                    marginBottom: "5px",
                  },
                },
                colorMap[params.row.status].label
              ),
            ];
          },
        },
        // {
        //   key: 'createBy',
        //   title:"创建人",
        //   align: 'center',
        //   width: 160,
        //   render: (h, params) => {
        //     let createName = ''
        //     this.createUserArr.forEach(item => {
        //       if(item.userId === params.row.createdBy) {
        //         createName = item.userName
        //       }
        //     })
        //     return h('div', {}, createName)
        //   }
        // },
        {
          key: "billMonth",
          title: "账单月份",
          align: "center",
          width: 220,
        },
        {
          key: "receiptTotalPrice",
          title: "入库总金额确认",
          align: "center",
          width: 180,
        },
        {
          key: "totalPayAmount",
          title: "当月应付总额",
          align: "center",
          width: 180,
        },
        {
          key: "monthUnpaidPrice",
          title: "月总剩未付",
          align: "center",
          width: 180,
        },
        {
          key: "createdTime",
          title: "创建时间",
          align: "center",
          width: 300,
          render: (h, params) => {
            let createName = "";
            this.createUserArr.forEach((item) => {
              if (item.userId === params.row.createdBy) {
                createName = item.userName;
              }
            });
            return [
              h("div", {}, createName),
              h("div", {}, params.row.createdTime),
            ];
          },
        },
        {
          key: "operation",
          title: "操作",
          align: "center",
          width: 200,
          render: (h, { row }) => {
            // 此处为审核规则校验权限
            let flag = false
            let checkByList = row.checkByList
            if(this.$common.isEmpty(checkByList)) {
              // 如果为空或者为Null则免审
              flag = true
            } else {
              checkByList.forEach(item => {
              if(item == this.userInfo.userId) {
                flag = true
              }
            })
            }
            const status =
              !this.$common.isEmpty(row.status) && Number(row.status);
            let btnNameMap = {
              1: { operator: "提交", power: "supplierBillApply_waitSubmit" },
              2: {
                operator: "审核",
                power: "supplierBillApply_waitExamineSubmit",
              },
              3: {
                operator: "复审",
                power: "supplierBillApply_waitReexamineSubmit",
              },
              4: { operator: "提交", power: "supplierBillApply_waitPaySubmit" },
            };
            let data = btnNameMap[status] || {};

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
                            this.getBill("details", row);
                          },
                        },
                      },
                      "详情"
                    ),
                    !(
                      this.getPermission(data.power) &&
                      [1, 2, 3, 4].includes(status) && flag
                    )
                      ? null
                      : h(
                        "DropdownItem",
                        {
                          nativeOn: {
                            click: (e) => {
                              this.getBill("edit", row);
                            },
                          },
                        },
                        data.operator
                      ),
                  ]
                ),
              ]
            );
          },
        },
      ],
      selectedValue: [],
      billFormData: {},
      curTab: "-1",
      deductionInfo: {
        visible: false,
      },
      detaildSubmitNameMap: {
        2: '审核通过',
        3: '复审通过',
        4: '提交',
      } 
    };
  },
  created() {
    this.initData();
    this.getList();
  },
  computed: {
    // 获取当前登录账号可查看的事业部ID列表
    allowBusinessDeptIds() {
      return this.$store.getters["allowBusinessDeptIds"].join(",");
    },
    userInfo () {
      return this.$store.state.userInfo;
    }
  },
  watch: {
    supplierOptionDefault: {
      handler(newVal, oldVal) {
        this.searchSupplier = null;
        this.pageParams.supplierName = null;
        this.pageParams.supplierCode = null;
      },
      immediate: true,
    },
  },
  methods: {
    showCurrentPage(val) {
      this.pageParams.statusList = val === "-1" ? null : [Number(val)];
      this.getList();
    },
    // 创建时间
    getDateValue(value, name) {
      if (value && value.length > 0 && value[0] != "" && name === "create") {
        this.pageParams[`${name}StartTime`] = value[0];
        this.pageParams[`${name}EndTime`] = value[1];
      } else if (name === "month") {
        this.pageParams.billMonth = value;
      }
    },
    // 重置时间
    resetDate(type) {
      this.pageParams[`${type}StartTime`] = null;
      this.pageParams[`${type}EndTime`] = null;
      if (type !== "create") {
        this.pageParams.billMonth = null;
      }
    },
    initData() {
      // 获取供应商结算方式
      this.axios
        .get(api.baseDataList + "?dataType=" + "settlementType")
        .then((res) => {
          if (res.data.code == 0) {
            this.settlementTypeArr = res.data.datas;
          }
        });
      // 获取创建人数组
      this.axios.get(api.userInfo_getAllUser).then((res) => {
        let list = [];
        Object.keys(res.data.datas).forEach((item) => {
          let temp = {};
          temp.userId = res.data.datas[item].userId;
          temp.userName = res.data.datas[item].userName;
          list.push(temp);
        });
        this.createUserArr = list;
      });
    },
    search() {
      this.getList();
    },
    getList() {
      if (this.supplierOptionDefault === "1") {
        this.pageParams.supplierName = this.searchSupplier;
      } else {
        this.pageParams.supplierCode = this.searchSupplier;
      }
      let obj = this.$common.copy(this.pageParams);
      obj.businessDeptIds = this.allowBusinessDeptIds;
      this.tableLoading = true;
      this.axios
        .post(api.query_supplierBillApplyList, obj)
        .then((res) => {
          if (res.data.code == 0) {
            this.total = res.data.datas.total;
            this.tableData = this.$common.isEmpty(res.data.datas.list)
              ? []
              : res.data.datas.list;
          } else if (res.data.code === 403) {
            return this.$Message.error("暂无权限");
          }
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
    reset() {
      this.$refs["pageParams"].resetFields();
      this.pageParams.billMonth = null;
      this.pageParams.monthUnpaidPriceEnd = null;
      this.pageParams.monthUnpaidPriceStart = null;
      this.pageParams.createEndTime = null;
      this.pageParams.createStartTime = null;
      this.createTime = [];
      this.searchSupplier = null;
    },
    // 页数改变
    changePage(val) {
      this.pageParams.pageNum = val;
      this.getList();
    },
    // 页尺寸改变
    changePageSize(val) {
      this.pageParams.pageNum = 1;
      this.pageParams.pageSize = val;
      this.getList();
    },
    getBill(type, row) {
      if (type == "add") {
        this.curShow = "addBill";
      } else {
        this.tableLoading = true;
        this.axios
          .get(`${api.get_billDetails}?billApplyId=${row.billApplyId}`)
          .then((res) => {
            if (res.data.code === 0) {
              this.billFormData = res.data.datas;
              this.billFormData.editType = type;
              this.billFormData.spsSupplierBillApplyPaymentList.forEach(
                (item) => {
                  this.$set(
                    item,
                    "remainingUnpaidAmount",
                    this.billFormData.monthUnpaidPrice
                  );
                }
              );
              this.curShow = "billDetails";
            } else if (res.data.code === 403) {
              return this.$Message.error("暂无权限");
            }
          })
          .finally(() => {
            this.tableLoading = false;
          });
      }
    },
    getSelectValue(val) {
      this.selectedValue = val;
    },
    goBackForm() {
      this.curShow = "billManagement";
      this.getList();
    },
    saveOrSubmit(type, editType) {
      if (editType !== "edit") {
        this.$refs.addBillApply.saveOrSubmit(type);
      } else {
        this.$refs.billApplyDetails.saveOrSubmit(type);
      }
    },
    // 同意或拒绝
    agreeOrReject(type) {
      this.$refs.billApplyDetails.agreeOrReject(type);
    },
    // 保存付款情况
    savePayment() {
      this.$refs.billApplyDetails.savePayment();
    },
    exportBtn(val) {
      if (!this.getPermission("supplierBillApply_export"))
        return this.$Message.error("暂无权限");
      let obj = {};
      if (val == "0") {
        if (this.selectedValue.length === 0) {
          this.$Message.error("未选中数据");
          return;
        }
        const billApplyIdList = this.selectedValue.map(
          (item) => item.billApplyId
        );
        obj = { billApplyIdList: billApplyIdList };
      } else {
        obj = this.$common.copy(this.pageParams);
        obj.businessDeptIds = this.allowBusinessDeptIds;
      }
      this.tableLoading = true;
      this.axios
        .post(api.export_billList, obj)
        .then((res) => {
          if (res.data.code == 0 && res.data.success) {
            this.$Message.success("导出成功");
            this.getList();
          } else {
            this.$Message.error("导出失败，请稍后重试");
          }
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
    // 汇总抵扣管理查看
    deductionDetail() {
      this.deductionInfo.visible = true;
    }
  },
};
</script>
<style lang="less">
.startEndPayAmount {
  .ivu-input-number-handler-wrap {
    display: none;
  }

  .ivu-form-item-content {
    display: flex;

    .ivu-input-number {
      flex: 50;
    }
  }
}
</style>    