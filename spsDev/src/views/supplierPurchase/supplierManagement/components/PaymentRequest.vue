<template>
  <div>
    <div class="tabContent">
      <div class="flexBox payment commonFilter">
        <Tabs v-model="tabsValue" @on-click="changeTab">
          <TabPane label="全部" name="-1"></TabPane>
          <TabPane
            :label="item.label"
            :name="item.value"
            v-for="item in tabStatusArr"
            :key="item.value"
          ></TabPane>
        </Tabs>
      </div>
      <div class="card-container">
        <div class="card-content" style="padding-top: 8px">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="100">
              <dyt-filter>
                <FormItem label="下单日期">
                  <DatePicker
                    transfer
                    style="width: 100%"
                    type="datetimerange"
                    @on-clear="resetDate"
                    @on-change="getDateValue"
                    :clearable="clearAble"
                    :value="[
                      pageParams.orderStartTime,
                      pageParams.orderEndTime,
                    ]"
                    format="yyyy-MM-dd HH:mm"
                    placement="bottom-end"
                    placeholder="选择日期"
                    v-model="payTimeArr"
                  />
                </FormItem>
                <FormItem label="采购单号">
                  <dyt-input-tag
                    :limit="1"
                    v-model="pageParams.purchaseNumberList"
                    type="textarea"
                    placeholder="请输入（多个用逗号或者回车分开）"
                  />
                </FormItem>
                <FormItem label="供应商" prop="supplierId">
                  <dyt-select
                    v-model="pageParams.supplierId"
                    clearable
                    filterable
                  >
                    <Option :value="-1">全部</Option>
                    <Option
                      v-for="(item, index) in supplierArr"
                      :disabled="item.purchaseWarehouseStatus === '1'"
                      :value="item.supplierId"
                      :key="index"
                      >{{ item.supplierName }}</Option
                    >
                  </dyt-select>
                </FormItem>
                <FormItem label="申请人" prop="applyId">
                  <dyt-select
                    ref="developerSelect"
                    v-model="pageParams.applyId"
                    filterable
                    clearable
                  >
                    <Option :value="-1">全部</Option>
                    <Option
                      v-for="(item, index) in developerArr"
                      :value="item.id"
                      :key="index"
                      >{{ item.name }}</Option
                    >
                  </dyt-select>
                </FormItem>
                <FormItem label="外部流水号">
                  <dyt-input-tag
                    :limit="1"
                    v-model="pageParams.externalSerialNoList"
                    type="textarea"
                    placeholder="请输入（多个用逗号或者回车分开）"
                  />
                </FormItem>
                <FormItem label="付款单类型" prop="paymentType">
                  <dyt-select v-model="pageParams.paymentType" clearable>
                    <Option
                      :value="item.value"
                      v-for="item in paymentTypeArr"
                      :key="item.value"
                      >{{ item.label }}
                    </Option>
                  </dyt-select>
                </FormItem>
                <FormItem label="申请单号">
                  <dyt-input-tag
                    :limit="1"
                    v-model="pageParams.paymentNumberList"
                    type="textarea"
                    placeholder="请输入（多个用逗号或者回车分开）"
                  />
                </FormItem>
                <FormItem label="结算方式" prop="settlementType">
                  <dyt-select
                    ref="developerSelect"
                    v-model="pageParams.settlementType"
                    filterable
                    clearable
                  >
                    <Option :value="-1">全部</Option>
                    <Option
                      v-for="(item, index) in settlementTypeArr"
                      :value="item.value"
                      :key="`settlementTypeArr` + index"
                      >{{ item.label }}</Option
                    >
                  </dyt-select>
                </FormItem>
                <FormItem label="供应商支付方式" prop="payType">
                  <dyt-select
                    ref="developerSelect"
                    v-model="pageParams.payType"
                    filterable
                    clearable
                  >
                    <Option :value="-1">全部</Option>
                    <Option
                      v-for="(item, index) in payTypeArr"
                      :value="item.value"
                      :key="`payTypeArr` + index"
                      >{{ item.label }}</Option
                    >
                  </dyt-select>
                </FormItem>
                <FormItem label="申请金额范围" class="startEndPayAmount">
                  <InputNumber v-model="pageParams.startPayAmount" />
                  <span style="padding: 0 5px">至</span>
                  <InputNumber
                    v-model="pageParams.endPayAmount"
                    :min="pageParams.startPayAmount"
                  />
                </FormItem>
                <FormItem
                  label="状态"
                  prop="paymentStatusList"
                  v-if="tabsValue == -1"
                >
                  <dyt-select
                    v-model="pageParams.paymentStatusList"
                    :max-tag-count="1"
                    clearable
                    multiple
                  >
                    <Option
                      v-for="(item, index) in tabStatusArr"
                      :value="item.value"
                      :label="item.label"
                      :key="index"
                    >
                      {{ item.label }}</Option
                    >
                  </dyt-select>
                </FormItem>
                <FormItem label="所属事业部" prop="businessDeptId">
                  <dyt-select
                    v-model="pageParams.businessDeptId"
                    :max-tag-count="1"
                    clearable
                  >
                    <Option
                      v-for="item in businessDeptInfoList"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                    ></Option>
                  </dyt-select>
                </FormItem>
                <FormItem label="1688账号" prop="aliAccountIdList">
                  <dyt-select
                    v-model="pageParams.aliAccountIdList"
                    :max-tag-count="1"
                    clearable
                    multiple
                  >
                    <Option
                      v-for="item in accountAllList"
                      :key="item.accountId"
                      :label="item.accountCode"
                      :value="item.accountId"
                    ></Option>
                  </dyt-select>
                </FormItem>
                <div slot="operation">
                  <Button
                    type="primary"
                    @click="search"
                    :disabled="SearchDisabled"
                    icon="ios-search"
                    >查询</Button
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
            </Form>
          </div>
        </div>
      </div>
    </div>
    <div class="flexBox spaceBetween" style="margin-bottom: 10px">
      <div class="tableControl">
        <Button
          type="primary"
          v-if="tabsValue === '0' && getPermission('purchasePaymentInfo_check')"
          class="iconbuttons"
          style="margin-left: 12px"
          @click="toCheck"
        >
          审核通过
        </Button>
        <Button
          type="primary"
          v-if="
            tabsValue === '1' &&
            getPermission('purchasePaymentInfo_batchConfirm')
          "
          class="iconbuttons"
          style="margin-left: 12px"
          @click="batchConfirmThePayment"
        >
          确认付款
        </Button>
        <Button
          type="primary"
          v-if="tabsValue === '1' && getPermission('purchase_paymentUrl')"
          class="iconbuttons"
          style="margin-left: 12px"
          @click="batch1688Payment('1688')"
        >
          1688付款
        </Button>
        <Button
          type="primary"
          v-if="tabsValue === '1' && getPermission('purchase_paymentUrl')"
          class="iconbuttons"
          style="margin-left: 12px"
          @click="batch1688Payment('cross')"
        >
          跨境宝付款
        </Button>
        <!-- <Button type="primary" v-if="(tabsValue === '1' || tabsValue === '2') && getPermission('purchasePaymentInfo_export')"  class="iconbuttons" style="margin-left: 12px" @click="exportMt">
            Excel导出
        </Button> -->
        <Button
          type="primary"
          v-if="tabsValue === '0' || tabsValue === '1'"
          class="iconbuttons"
          style="margin-left: 12px"
          @click="cancelPay(2)"
        >
          取消付款
        </Button>
        <Dropdown
          @on-click="exportMt"
          v-if="
            tabsValue !== '3' && getPermission('purchasePaymentInfo_export')
          "
        >
          <Button type="primary" style="margin-left: 12px"
            ><span class="icon iconfont" style="font-size: 12px">&#xe639;</span>
            Excel导出
            <Icon type="md-arrow-dropdown"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem name="0">导出选中数据</DropdownItem>
            <DropdownItem name="1">导出所有结果集</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Modal
            v-model="exportVisible"
            title="导出"
            @on-ok="exportFn"
           >
            <div class="ml10">
            <span class="mr20">请选择导出类型格式：</span>
              <RadioGroup v-model="pageParams.exportFormatId">
                <Radio :label="0">按付款单申请单</Radio>
                <Radio :label="1">按采购单</Radio>
              </RadioGroup></div>
        </Modal>
      </div>
      <div style="margin-right: 20px">
        <span>排序方式：</span>
        <Button-group>
          <Button
            :type="item.checked ? 'primary' : 'default'"
            v-for="item in sortData"
            @click="clickSortButton(item)"
            :key="item.value"
            >{{ item.label }}
            <Icon type="md-arrow-up" v-if="item.checked && !item.toogle"></Icon>
            <Icon
              type="md-arrow-down"
              v-if="item.checked && item.toogle"
            ></Icon>
          </Button>
        </Button-group>
      </div>
    </div>
    <div class="flexBox commonFilter payment paymentRequest">
      <keep-alive>
        <Table
          highlight-row
          border
          :height="tableHeight"
          :loading="Tableloading"
          :columns="column1"
          :data="data1"
          @on-selection-change="checkData"
        >
        </Table>
      </keep-alive>
    </div>
    <div class="table-page">
      <div class="table-page-right">
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
        >
        </Page>
      </div>
    </div>

    <!-- 采购单详情 -->
    <transition name="bounce">
      <!-- 查看 -->
      <template v-if="isToPurDetail">
        <div class="subLayer infoDetails">
          <div>
            <!-- <purchase-detail :dialogObj="dialogDetail" :purchaserArrT="purchaserArr" @getList="getList" @goBackFromAdd="goBackFromAdd" @addOrderGoBack="addOrderGoBack" :orderData="orderData" :editType="editType" :purchaseOrderIds="purchaseOrderIds" :showType="showType"></purchase-detail> -->
            <purchase-detail
              :dialogObj="dialogDetail"
              :isToPurDetail.sync="isToPurDetail"
            ></purchase-detail>
          </div>
        </div>
      </template>
    </transition>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
// import filterColumns from '@/components/common/filterColumns';
import pagemixin from "@/components/mixin/page_mixin";
import { fun_date } from "@/utils/comfun.js";
import PurchaseDetail from "../../purchaseManagement/supplyOrder/purchaseDetail.vue";

export default {
  name: "PaymentRequest",
  mixins: [Mixin, pagemixin],
  components: { PurchaseDetail },
  data() {
    // let v = this;
    // let end = new Date();
    // let start = new Date();
    // start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
    return {
      tableHeight: this.getTableHeight(335),
      filterName: "payment_1",
      orderColumn: [],
      searchValue: [],
      total: 0,
      data: [],
      tabsValue: "-1",
      checkedData: [],
      payMethodArr: [],
      bankArr: [],
      data1: [],
      clearAble: true,
      developerArr: [],
      payTimeArr: [],
      pageParams: {
        applyId: -1, //  申请人ID
        endPayAmount: null, // 付款金额区间结束，初始值为null
        orderEndTime: fun_date(-7)[1].slice(0, -8) + "23:59:59", // 下单结束时间 ,
        orderStartTime: fun_date(-7)[0].slice(0, -8) + "00:00:00", // 下单开始时间 ,
        paymentStatus: 1, // 付款状态(1:待付款2:已付款3:已取消)
        paymentType: -1, //  付款单类型(1:网络采购自动生成2:转账申请付款) ,
        purchasePaymentInfoIdList: [], // 采购单付款信息ID ,
        pageNum: 1,
        pageSize: 10,
        startPayAmount: 0, // 付款金额区间开始，初始值为0
        supplierId: -1, //  供应商ID
        searchValueList: [],
        externalSerialNoList: [],
        settlementType: -1, //结算方式
        payType: -1, //供应商支付方式
        paymentNumberList: [], //申请单号
        // 'externalSerialNo': [], //外部流水号
        purchaseNumberList: [], //采购单号
        upDown: "",
        orderBy: "",
        paymentStatusList: [], //付款状态
        businessDeptIds: null,
        applyType: 0,
        businessDeptId: "",
        aliAccountIdList:[],
        exportFormatId: 0
      },
      supplierArr: [],
      purchasePaymentInfoId: "",
      purchaseNumber: "",
      cancelRemark: "",
      searchValueList: [],
      accountAllList: [],
      // externalSerialNoList: [],
      selfOperateArr: [],
      exportVisible: false,
      settlementTypeArr: [
        { value: "02", label: "款到发货" },
        { value: "04", label: "到期结算" },
        { value: "01", label: "货到付款" },
      ],
      payTypeArr: [
        { value: "01", label: "现金" },
        { value: "02", label: "银行转账" },
        { value: "03", label: "PayPal" },
        { value: "04", label: "支付宝" },
      ],
      tabStatusArr: [
        { value: "0", label: "待审核" },
        { value: "1", label: "待付款" },
        { value: "2", label: "已付款" },
        { value: "3", label: "已取消" },
      ],
      paymentTypeArr: [
        { value: -1, label: "全部" },
        { value: 1, label: "网络采购" },
        { value: 2, label: "转账申请" },
      ],
      sortData: [
        {
          label: "下单时间",
          value: "orderTime",
          checked: true,
          toogle: true,
        },
        {
          label: "申请时间",
          value: "createTime",
          checked: false,
          toogle: true,
        },
      ],
      cacheClickVal: "order",
      isToPurDetail: false, //跳转至 采购单详情 标识
      dialogDetail: {
        modelVisible: false,
        data: {},
        supplyList: {},
      },
      //标签样式
      statuStyle: {
        primary: {
          color: "#2D8CF0",
          backgroundColor: "rgba(45, 140, 240, .1)",
        },
        error: { color: "#EB2F96", backgroundColor: "rgba(235, 47, 150, .1)" },
        success: { color: "#3CB034", backgroundColor: "rgba(60, 176, 52, .1)" },
        warnning: {
          color: "#FF9E20",
          backgroundColor: "rgba(255, 158, 32, .1)",
        },
        info: { color: "#5D7092", backgroundColor: "rgba(93, 112, 146, 0.1)" },
        textRed: { color: "red", backgroundColor: "rgba(235, 47, 150, .1)" },
        textBlack: {
          color: "black",
          backgroundColor: "rgba(255, 215, 0, 0.8)",
        },
      },
      column1: [],
      businessDeptInfoList: [],
    };
  },
  created() {
    this.payType();
    this.getAccount();
    this.pageParams.pageSize = this.getPageSizeCache();
    this.getTableColumn();
    this.getBankList().then(() => {
      this.getSupplier(); // 获取供应商
      this.getDeveloperArr(); // 获取申请人
      this.search();
    });
    this.resetTime();
    this.getBusinessDeptInfo();
  },
  watch: {
    tabsValue(value) {
      this.checkedData = [];
      this.filterName = "payment_" + value;
    },
  },
  computed: {
    authUserInfo() {
      return this.$store.getters["authUserInfo"];
    },
    // 登录人可查看事业部ID
    businessDeptIds() {
      if (this.$common.isEmpty(this.$store.getters["allowBusinessDeptIds"])) return '';
      return this.$store.getters["allowBusinessDeptIds"].join(',');
    },
  },
  methods: {
    changePage(page) {
      let v = this;
      v.pageParams.pageNum = page;
      v.getList();
    },
    changePageSize(val) {
      this.setPageSizeCache(val);
      this.pageParams.pageSize = +val;
      this.getList();
    },
    checkData(data) {
      this.checkedData = data;
    },
    payType() {
      let v = this;
      v.axios
        .get(api.baseDataList + "?dataType=" + "paymentType")
        .then((res) => {
          if (res.data.code == 0) {
            v.payMethodArr = res.data.datas;
          }
        });
    },
    getBankList() {
      let v = this;
      return new Promise((resolve) => {
        v.axios
          .get(api.baseDataList + "?dataType=" + "bank")
          .then((res) => {
            if (res.data.code == 0) {
              v.bankArr = res.data.datas;
            }
            resolve();
          })
          .catch(() => {
            resolve();
          });
      });
    },
    batchConfirmThePayment() {
      let v = this;
      // 批量确定付款
      if (v.checkedData.length < 1) {
        v.$Message.error("未选择数据");
        return;
      }
      v.axios
        .put(
          api.put_batchConfirm +
            "?purchasePaymentInfoIdList=" +
            v.checkedData.map((i) => i.purchasePaymentInfoId).join(",") +
            "&&applyType=0"
        )
        .then((res) => {
          if (res.data.code === 0) {
            v.$Message.success("操作成功");
            v.getList();
          }
        });
    },
    // 批量1688\跨境宝付款
    batch1688Payment(type) {
      // 选中
      if (this.checkedData.length < 1) {
        this.$Message.error("未选择数据");
        return;
      }
      // 判断是否存在账号id
      let noAccountIdData = this.checkedData.filter(item => item.aliAccountId == null || item.aliAccountId == '')
      if(noAccountIdData.length > 0) {
        noAccountIdData = noAccountIdData.map(item => item.paymentNumber)
        return this.$Message.error({
          content: `${noAccountIdData.join(" , ")} 订单没有1688账号信息，无法发起支付申请`,
          duration: 3,
        });
      }
      // 存在账号id，判断账号id是否一致
      let sameId = this.checkedData.every((item,index,array) => item.aliAccountId === array[0].aliAccountId)
      if(!sameId) return this.$Message.error({
        content: '选中的订单为不同的1688账号订单，无法发起付款请求',
        duration: 3,
      });
      // 如果存在账号id、并且账号id一致，则进入外部流水号是否存在判断
      let externalSerialNoData = this.checkedData.map(item => {
        const externalSerialNoList = item.rueryPurchasePaymentRelatedResultList.map(el => {
          return {
            aliPlatformOrderNo: el.aliPlatformOrderNo,
            externalSerialNo: el.externalSerialNo
          }
        })
        return {
          paymentNumber: item.paymentNumber,
          externalSerialNo:externalSerialNoList
        }
      }) 
      let noExternalSerialNoData = externalSerialNoData.filter(item => {
        if (item.externalSerialNo.length === 0 ) return true
        let hasNull = false
        item.externalSerialNo.forEach(el => {
          if (el.aliPlatformOrderNo === null) return hasNull = true
        })
        return hasNull
      })
      if(noExternalSerialNoData.length > 0) {
        noExternalSerialNoData = noExternalSerialNoData.map(item => item.paymentNumber)
        return this.$Message.error({
          content: `${noExternalSerialNoData.join(" , ")} 该订单外部流水号缺失，无法发起支付申请`,
          duration: 3,
        });
      }
      let platformOrderIdList = externalSerialNoData.map(item => item.externalSerialNo).flat()
      platformOrderIdList = platformOrderIdList.map(item => item.externalSerialNo)
      const finPlatformOrderIdList = []
      platformOrderIdList.forEach(item => {
        if(item.includes(',')) {
          let splitArr = item.split(',')
          finPlatformOrderIdList.push(splitArr[0])
          finPlatformOrderIdList.push(splitArr[1])
        }else {
          finPlatformOrderIdList.push(item)
        }
      })
      let obj = {
        accountId: this.checkedData[0].aliAccountId,
        platformOrderIdList: finPlatformOrderIdList
      }
      const reqApi = type === '1688' ?  api.post_aliPayLink : api.post_crossBorderPayLink
      this.getPaymentLink(reqApi, obj)
    },
    // 单个1688\跨境宝付款
    batch1688SinglePayment(type, val) {
      if (this.$common.isEmpty(val.aliAccountId)) return this.$Message.error('该订单没有1688账号信息，无法在该系统发起付款')
      let externalSerialNo = val.rueryPurchasePaymentRelatedResultList.map(item => item.externalSerialNo)
      let aliPlatformOrderNo = val.rueryPurchasePaymentRelatedResultList.map(item => item.aliPlatformOrderNo)
      // 判断一下流水号是否存在
      let hasNull = false 
      aliPlatformOrderNo.forEach(item => {
        if(item === null) return hasNull = true
      })
      if (externalSerialNo.length === 0 || hasNull ) return this.$Message.error('该订单外部流水号缺失，无法发起支付申请')
      const reqApi = type === '1688' ?  api.post_aliPayLink : api.post_crossBorderPayLink
      const resultArr = []
      externalSerialNo.forEach(item => {
        if(item.includes(',')) {
          let splitArr = item.split(',')
          resultArr.push(splitArr[0])
          resultArr.push(splitArr[1])
        }else {
          resultArr.push(item)
        }
      })
      let obj = {
        accountId: val.aliAccountId,
        platformOrderIdList: resultArr
      }
      this.getPaymentLink(reqApi, obj, val)
    },
    // 获取1688、跨境宝支付链接请求
    getPaymentLink(reqApi,obj,val = {}){
      this.axios.post(reqApi, obj).then(res => 
      {
        if(res.data.code === 0) {
          if('link' in res.data.datas) {
            const link = res.data.datas.link[0];
            window.open(link);
            let paymentNumberList =  this.checkedData.map(item => `${item.paymentNumber}<br>`).join("");
            if (!this.$common.isEmpty(val)){
              paymentNumberList = val.paymentNumber
            }
            this.$Modal.confirm({
              title: "操作提示",
              content: `<span style="font-size:16px;margin:20px 0">确认是否要付款申请单：</span>
              <div style="font-size:16px;color:red">${paymentNumberList}</div>`,
              width: 500,
              onOk: () => {
                // 这里调用确认付款接口
                this.$common.isEmpty(val) ? this.batchConfirmThePayment() : this.confirmThePayment()

              },
              onCancel: () => {},
            });
          } else {
            const nonEmptyKeys = Object.keys(res.data.datas).filter(key => res.data.datas[key].length > 0);
            let message = ''
            const statusMap = {
              '1': '未付款',
              '2': '已付款',
              '4': '全额退款',
              '6': '卖家有收到钱，回款完成',
              '7': '未创建外部支付单',
              '8': '付款前取消',
              '9': '正在支付中',
              'cancel': '平台已关闭该订单交易',
              '12': '账期支付,待到账'
            };  
            message = statusMap[nonEmptyKeys[0]] || '未知状态';
            let applicationFormIdList = res.data.datas[nonEmptyKeys[0]]
            this.$Message.warning({
              content: `外部流水号(1688订单号): ${applicationFormIdList.join(',')}  1688支付状态为：${message}`
            })
          }
        }
      }
      )
    },
    // payMt(value, typeVal) {
    //   let v = this;
    //   let currentData = typeVal === "self" ? v.selfOperateArr : v.checkedData;
    //   if (currentData.length < 1) {
    //     // 没选择数据
    //     v.$Message.error("未选择数据");
    //     return;
    //   }
    //   // 必须有支付方式，必须有支付账号，支付账号必须相同，支付方式必须相同，才能提交
    //   let hasPayInfo = true;
    //   currentData.forEach((item) => {
    //     // item.payType=null 没有支付方式；item.paymentAccount=null 没有支付账号
    //     if (item.payType === null || item.paymentAccount === null) {
    //       hasPayInfo = false;
    //     }
    //   });
    //   if (!hasPayInfo) {
    //     v.$Message.error("请选择相同1688买家账号的采购单");
    //     return;
    //   }
    //   let diffPayInfo = currentData.some((item) => {
    //     // 只要有一个不相同返回true，没有就返回false
    //     return (
    //       item.payType !== currentData[0].payType &&
    //       item.paymentAccount !== currentData[0].paymentAccount
    //     );
    //   });
    //   if (diffPayInfo) {
    //     v.$Message.error("请选择相同1688买家账号的采购单");
    //     return;
    //   }
    //   let arr = [];
    //   currentData.forEach((item) => {
    //     item.rueryPurchasePaymentRelatedResultList.forEach((i) => {
    //       let obj = {};
    //       obj.purchaseId = i.purchaseId;
    //       arr.push(obj);
    //     });
    //   });
    //   v.axios
    //     .post(api.post_paymentUrl, {
    //       paymentLinkType: value,
    //       purchaseIdList: arr.map((i) => i.purchaseId),
    //     })
    //     .then((res) => {
    //       if (res.data.code === 0) {
    //         window.open(res.data.datas);
    //         v.$Modal.confirm({
    //           title: "付款结果",
    //           content: "您是否已经完成了付款？",
    //           okText: "付款成功",
    //           cancelText: "付款失败",
    //           onOk() {
    //             v.batchConfirmThePayment();
    //           },
    //         });
    //       }
    //     });
    // },
    exportFn(obj) {
      let v = this;
      let reqParams = this.$common.copy(v.pageParams);
      for (let k in reqParams) {
        if (reqParams[k] == -1) {
          reqParams[k] = null;
        }
      }
      // reqParams.paymentStatus = v.tabsValue;
      this.$set(reqParams, "exportId", v.tabsValue == -1 ? 0 : v.tabsValue);
      v.axios.post(api.export_purchasePaymentInfo, reqParams).then((res) => {
        if (res.data.code === 0) {
          v.$Message.success("操作成功");
          this.exportVisible = false
        }
      });
    },
    exportMt(name) {
      let v = this;
      v.pageParams.purchasePaymentInfoIdList = [];
      if (name === "0") {
        // 选中
        if (v.checkedData.length < 1) {
          v.$Message.error("未选择数据");
          return;
        }
        v.checkedData.forEach((item) => {
          v.pageParams.purchasePaymentInfoIdList.push(
            item.purchasePaymentInfoId
          );
        });
        if(v.tabsValue == '1' || v.tabsValue == '2') {
          v.exportFn()
        } else {
          v.exportVisible = true
        }
      } else {
        // 全部
        if (v.data1.length === 0) {
          v.$Message.warning({
            content: "无数据导出",
            duration: 5,
          });
          return;
        }
        if(v.tabsValue == '1' || v.tabsValue == '2') {
          v.exportFn()
        } else {
          v.exportVisible = true
        }
      }
    },
    confirmThePayment() {
      let v = this;
      v.axios
        .put(
          api.put_purchasePaymentInfo +
            "/" +
            v.selfOperateArr[0].purchasePaymentInfoId +
            "?applyType=0"
        )
        .then((res) => {
          if (res.data.code === 0) {
            v.$Message.success("操作成功");
            v.getList();
          }
        });
    },
    cancellationOfPayment() {
      let v = this;
      v.axios
        .put(api.purchasePaymentInfo_cancel, {
          purchasePaymentInfoId: v.purchasePaymentInfoId,
          cancelRemark: v.cancelRemark,
          applyType: 0,
        })
        .then((res) => {
          if (res.data.code === 0) {
            v.$Message.success("操作成功");
            v.getList();
          }
        });
    },
    fixData(data, index) {
      let data1 = [];
      data.forEach((i, ind) => {
        if (i.rueryPurchasePaymentRelatedResultList.length > 1) {
          if (index === ind) {
            i.show = !i.show;
          }
          i.externalSerialNo = "";
          i.receiptStatus = "";
          i.abnormalStatus = "";
          i.purchaseNumber = "";
          // i.paidAmountAll = i.rueryPurchasePaymentRelatedResultList.reduce((a,b)=>{
          //     let nub = 0;
          //     if(b.paidAmount !== null) {
          //         nub = b.paidAmount // 付款金额
          //     }
          //     return a + nub
          // },0);
          i.receiveAmountAll = i.rueryPurchasePaymentRelatedResultList.reduce(
            (a, b) => {
              let nub = 0;
              if (b.receiveAmount !== null) {
                nub = b.receiveAmount; // 收货金额
              }
              return a + nub;
            },
            0
          );
          i.totalApplyAmount = i.rueryPurchasePaymentRelatedResultList.reduce(
            (a, b) => {
              let nub = 0;
              if (b.applyAmount !== null) {
                nub = b.applyAmount; // 本次申请金额
              }
              return a + nub;
            },
            0
          );
          i.totalTotalAmount = i.rueryPurchasePaymentRelatedResultList.reduce(
            (a, b) => {
              let nub = 0;
              if (b.totalAmount !== null) {
                nub = b.totalAmount; // 应付总额
              }
              return a + nub;
            },
            0
          );
          data1.push(i);
          if (i.show) {
            i.rueryPurchasePaymentRelatedResultList.forEach((j) => {
              j._display = true;
              j.currency = i.currency;
              j.receiveAmount = j.receiveAmount === null ? 0 : j.receiveAmount; // 收货金额
              data1.push(j);
            });
          }
        } else {
          // 付款金额
          // i.paidAmountAll = i.rueryPurchasePaymentRelatedResultList[0].paidAmount === null ? 0 : i.rueryPurchasePaymentRelatedResultList[0].paidAmount;
          // 收货金额
          i.receiveAmountAll =
            i.rueryPurchasePaymentRelatedResultList[0].receiveAmount === null
              ? 0
              : i.rueryPurchasePaymentRelatedResultList[0].receiveAmount;
          // 本次申请金额
          i.totalApplyAmount =
            i.rueryPurchasePaymentRelatedResultList[0].applyAmount === null
              ? 0
              : i.rueryPurchasePaymentRelatedResultList[0].applyAmount;
          // 应付总额
          i.totalTotalAmount =
            i.rueryPurchasePaymentRelatedResultList[0].totalAmount === null
              ? 0
              : i.rueryPurchasePaymentRelatedResultList[0].totalAmount;
          data1.push(i);
        }
      });
      return data1;
    },
    getDeveloperArr() {
      let v = this;
      v.axios.get(api.userList).then((res) => {
        if (res.data.code == 0 && res.data.datas) {
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
          v.developerArr = arr;
        }
      });
    },
    getSupplier() {
      let v = this;
      v.axios.get(api.queryIdAndName).then((res) => {
        if (res.data.code == 0) {
          v.supplierArr = res.data.datas;
        }
      });
    },
    getDateValue(e) {
      // 获取日期返回值
      if (e[1] && e[1].slice(-6) === " 00:00") {
        e[1] = e[1].slice(0, -6) + " 23:59";
      }
      this.payTimeArr = e;
      this.pageParams.orderStartTime = e[0] ? e[0] + ":00" : "";
      this.pageParams.orderEndTime = e[1] ? e[1] + ":59" : "";
    },
    resetDate() {
      /* let v = this;
      v.pageParams.orderStartTime = '';
      v.pageParams.orderEndTime = '';
      v.payTimeArr = []; */
    },
    getList() {
      let v = this;
      v.Tableloading = true;
      v.SearchDisabled = true;
      v.pageParams.purchasePaymentInfoIdList = [];
      let reqParams = this.$common.copy(v.pageParams);
      for (let k in reqParams) {
        if (reqParams[k] == -1) {
          reqParams[k] = null;
        }
      }
      reqParams.businessDeptIds =
        this.authUserInfo.securityUser.businessDeptIds;

      //新接口现在要加上applyType
      reqParams.applyType = 0;

      v.axios.post(api.get_purchasePaymentInfo, reqParams).then((res) => {
        v.Tableloading = false;
        v.SearchDisabled = false;
        if (res.data.code === 0 && res.data.datas.list) {
          v.data = res.data.datas.list.map((i, ind) => {
            i.index = ind;
            i.show = true;
            return i;
          });
          v.total = res.data.datas.total;
          v.data1 = res.data.datas.list;
          // v.data1 = this.fixData(v.data);
        }
      });
    },
    search() {
      // this.pageParams.externalSerialNoList = this.searchValue;
      this.pageParams.pageNum = 1;
      this.getList();
    },
    reset() {
      this.$refs["pageParams"].resetFields();
      this.pageParams.startPayAmount = 0;
      this.pageParams.endPayAmount = null;
      this.searchValue = [];
      this.searchValueList = [];
      // this.externalSerialNoList = [];
      this.pageParams.searchValueList = [];
      this.pageParams.externalSerialNoList = [];
      this.pageParams.paymentNumberList = [];
      // this.pageParams.externalSerialNo = [];
      this.pageParams.purchaseNumberList = [];
      if (this.tabsValue == -1) {
        this.pageParams.paymentStatusList = [];
      }
      this.resetTime();
    },
    toCheck() {
      if (this.checkedData.length == 0) {
        this.$Message.error("未选择数据");
      } else {
        this.$Modal.confirm({
          title: "操作提示",
          content: `<p style="font-size:16px;margin:20px 0">确认是否要审核通过付款申请单，数量：<span style="color:red">${this.checkedData.length}</span></p>`,
          width: 500,
          onOk: () => {
            this.submitCheck();
          },
          onCancel: () => {},
        });
      }
    },
    cancelPay(type) {
      if (this.checkedData.length == 0 && type == 2) {
        this.$Message.error("未选择数据");
      } else {
        let text =
          type == 1
            ? "确认是否取消付款申请单："
            : "确认是否取消付款申请单，数量：";
        this.$Modal.confirm({
          title: "操作提示",
          width: 500,
          render: (h) => {
            return h(
              "div",
              {
                style: { fontSize: "16px", margin: "10px" },
              },
              [
                h("span", {}, text),
                h(
                  "span",
                  {
                    style: { color: "red" },
                  },
                  type == 1 ? this.purchaseNumber : this.checkedData.length
                ),
                h("Input", {
                  props: {
                    value: this.cancelRemark,
                    autofocus: true,
                    type: "textarea",
                    maxlength: 300,
                    placeholder: "请输入备注...",
                  },
                  style: {
                    marginTop: "10px",
                  },
                  on: {
                    input: (val) => {
                      this.cancelRemark = val;
                    },
                  },
                }),
              ]
            );
          },
          okText: "确定",
          onOk: () => {
            this.cancellationOfPayment();
          },
        });
      }
    },
    confirmOperate(type) {
      let text = "";
      let funName = "";
      if (type == 1) {
        text = "审核通过";
        funName = "submitCheck";
      } else if (type == 2) {
        text = "确认";
        funName = "confirmThePayment";
      }
      this.$Modal.confirm({
        title: "操作提示",
        content: `<span style="font-size:16px;margin:20px 0">确认是否要${text}付款申请单：</span>
        <span style="font-size:16px;color:red">${this.selfOperateArr[0].paymentNumber}</span>`,
        width: 500,
        onOk: () => {
          this[funName]("self");
        },
        onCancel: () => {},
      });
    },
    //确认审核通过
    submitCheck(typeVal) {
      let v = this;
      let currentData = typeVal === "self" ? v.selfOperateArr : v.checkedData;
      let reqParams = currentData.map((k) => {
        return k.purchasePaymentInfoId;
      });
      v.axios.put(api.put_checkPass, reqParams).then((res) => {
        if (res.data.code === 0) {
          v.$Message.success("操作成功");
          v.getList();
        }
      });
    },
    resetTime() {
      this.payTimeArr = [
        fun_date(-7)[0].slice(0, -8) + "00:00:00",
        fun_date(-7)[1].slice(0, -8) + "23:59:59",
      ];
      this.pageParams.orderStartTime = this.payTimeArr[0];
      this.pageParams.orderEndTime = this.payTimeArr[1];
    },
    clickSortButton: function (data) {
      // 点击排序的按钮
      if (data.value === this.cacheClickVal) {
        data.toogle = !data.toogle;
      }
      this.cacheClickVal = data.value;
      if (data.toogle) {
        this.pageParams.upDown = "down";
      } else {
        this.pageParams.upDown = "up";
      }
      this.sortData.forEach(function (n) {
        n.checked = data.value === n.value;
      });
      this.pageParams.orderBy = data.value;
      this.search();
    },
    //跳转至 采购单详情
    toPurchaseDetail(row, id, index) {
      this.$set(row, "purchaseId", id);
      this.dialogDetail.data = row;
      this.dialogDetail.type = 1; //查看
      this.dialogDetail.from = "paymentRequest";
      this.isToPurDetail = true;
    },
    changeTab() {
      let v = this;
      v.pageParams.paymentStatusList = [];
      v.pageParams.paymentStatusList.push(v.tabsValue);
      v.pageParams.pageNum = 1;
      this.getTableColumn();

      v.getList();
    },
    getTableColumn() {
      let data = [
        {
          type: "selection",
          minWidth: 30,
          align: "center",
          fixed: "left",
        },
        {
          title: "付款申请单",
          key: "paymentNumber",
          align: "left",
          minWidth: 200,
          render: (h, params) => {
            let paymentStatus =
              params.row.paymentStatus || params.row.paymentStatus == "0"
                ? this.tabStatusArr[params.row.paymentStatus].label
                : "";
            let settlementType = params.row.settlementType || "";
            let paymentType = params.row.paymentType
              ? this.paymentTypeArr[params.row.paymentType].label
              : "";
            let b = paymentStatus
              ? [
                h(
                  "div",
                  {
                    style: this.statuStyle["success"],
                    class: "paymentRquestTag",
                  },
                  [
                    h(
                      "Tooltip",
                      {
                        props: { transfer: true },
                      },
                      [
                        paymentStatus,
                        h(
                          "div",
                          {
                            slot: "content",
                          },
                          "状态"
                        ),
                      ]
                    ),
                  ]
                ),
              ]
              : [];
            let c = paymentType
              ? [
                h(
                  "div",
                  {
                    style: this.statuStyle["warnning"],
                    class: "paymentRquestTag",
                  },
                  [
                    h(
                      "Tooltip",
                      {
                        props: { transfer: true },
                      },
                      [
                        paymentType,
                        h(
                          "div",
                          {
                            slot: "content",
                          },
                          "付款单类型"
                        ),
                      ]
                    ),
                  ]
                ),
              ]
              : [];
            let d = settlementType
              ? [
                h(
                  "div",
                  {
                    style: this.statuStyle["error"],
                    class: "paymentRquestTag",
                  },
                  [
                    h(
                      "Tooltip",
                      {
                        props: { transfer: true },
                      },
                      [
                        settlementType,
                        h(
                          "div",
                          {
                            slot: "content",
                          },
                          "结算方式"
                        ),
                      ]
                    ),
                  ]
                ),
              ]
              : [];
            let k = params.row.businessDeptName
              ? [
                h(
                  "div",
                  {
                    style: this.statuStyle["primary"],
                    class: "paymentRquestTag",
                  },
                  [
                    h(
                      "Tooltip",
                      {
                        props: { transfer: true },
                      },
                      [
                        params.row.businessDeptName,
                        h(
                          "div",
                          {
                            slot: "content",
                          },
                          "所属事业部"
                        ),
                      ]
                    ),
                  ]
                ),
              ]
              : [];
            return h("div", [
              h(
                "div",
                {
                  style: { display: "flex", margin: "8px 0 1px 0" },
                },
                [
                  h(
                    "div",
                    {
                      style: {},
                    },
                    "申请单号："
                  ),
                  h("span", {}, params.row.paymentNumber),
                ]
              ),
              h(
                "div",
                {
                  style: { margin: "5px 0" },
                  class: "textOver",
                  attrs: { title: params.row.supplierName },
                },
                params.row.supplierName
              ),
              h(
                "div",
                {
                  style: { display: "flex", flexWrap: "wrap" },
                },
                [...b, ...c, ...d, ...k]
              ),
            ]);
          },
        },
        {
          title: "申请时间", // 申请时间
          minWidth: 60,
          align: "left",
          key: "createdTime",
          render: (h, params) => {
            return h(
              "span",
              this.getDataToLocalTime(params.row.createdTime, "fulltime")
            );
          },
        },
        {
          title: "本次付款金额",
          key: "payAmount",
          align: "left",
          minWidth: 80,
          render(h, params) {
            return h(
              "span",
              params.row.payAmount || params.row.payAmount == 0
                ? params.row.payAmount + "  " + params.row.currency
                : ""
            );
          },
        },
        {
          title: "供应商支付方式", // 供应商支付方式
          key: "payType",
          align: "left",
          minWidth: 170,
          render: (h, params) => {
            if (!params.row._display) {
              let data = this.payMethodArr.filter(
                (i) => i.dataValue === params.row.payType
              );
              if (data.length > 0) {
                if (data[0].dataCode === "13") {
                  // 现金
                  return h("span", "现金");
                } else if (data[0].dataCode === "14") {
                  // 银行转账
                  let bankName = this.bankArr.filter(
                    (i) => i.dataValue === params.row.paymentBank
                  )[0].dataDesc;
                  return h("div", {}, [
                    h("p", "开户行" + "：" + bankName),
                    h("p", "账号" + "：" + params.row.paymentAccount),
                    h("p", "开户名" + "：" + params.row.paymentAccountName),
                  ]);
                } else if (data[0].dataCode === "15") {
                  // PayPal
                  return h("span", data[0].dataDesc);
                } else if (data[0].dataCode === "16") {
                  // 支付宝
                  return h("div", {}, [
                    h("p", "支付宝" + "：" + params.row.paymentAccount),
                  ]);
                } else {
                  return h("span", data[0].dataDesc);
                }
              } else {
                return h("span", "");
              }
            }
          },
        },
        {
          title: "外部流水号",
          key: "externalSerialNo",
          align: "left",
          minWidth: 100,
          render: (h, params) => {
            let list = params.row.rueryPurchasePaymentRelatedResultList;
            let showList = list.map((k) => {
              return h("div", {}, [
                h("p", {}, k.alibabaAccountType),
                h(
                  "Tooltip",
                  {
                    props: {
                      placement: "right",
                      transfer: true,
                    },
                  },
                  [
                    h(
                      "div",
                      {
                        style: {
                          display: "inline-block",
                          width: params.column._width * 0.85 + "px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        },
                      },
                      k.externalSerialNo || ""
                    ),
                    h(
                      "span",
                      {
                        slot: "content",
                        style: { whiteSpace: "pre-wrap" },
                      },
                      k.externalSerialNo
                    ),
                  ]
                ),
              ]);
            });
            return h("div", {}, showList);
          },
        },
        {
          title: "付款备注",
          minWidth: 140,
          align: "left",
          key: "paymentRemark",
          render(h, params) {
            return h("div", {}, [
              h(
                "Tooltip",
                {
                  props: {
                    placement: "right",
                    transfer: true,
                  },
                },
                [
                  h(
                    "div",
                    {
                      style: {
                        display: "inline-block",
                        width: params.column._width * 0.85 + "px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    },
                    params.row.paymentRemark || ""
                  ),
                  h(
                    "span",
                    {
                      slot: "content",
                      style: { whiteSpace: "pre-wrap" },
                    },
                    params.row.paymentRemark
                  ),
                ]
              ),
            ]);
          },
        },
        {
          title: "应付金额", // 应付总金额
          key: "totalAmountTotal", //totalAmount
          align: "left",
          minWidth: 80,
          render(h, params) {
            if (params.row.supplierName == "*") {
              return h("span", "*");
            }
            return h(
              "span",
              params.row.totalAmountTotal || params.row.totalAmountTotal == 0
                ? params.row.totalAmountTotal + "  " + params.row.currency
                : ""
            );
          },
        },
        {
          title: "已付金额", // 应付总金额
          key: "paidAmountTotal",
          align: "left",
          minWidth: 70,
          render(h, params) {
            if (params.row.supplierName == "*") {
              return h("span", "*");
            }
            return h(
              "span",
              params.row.paidAmountTotal || params.row.paidAmountTotal == 0
                ? params.row.paidAmountTotal + "  " + params.row.currency
                : ""
            );
          },
        },
        {
          title: "1688账号/采购单", // 采购单号
          minWidth: 110,
          align: "left",
          key: "purchaseNumber",
          render: (h, params) => {
            let list = params.row.rueryPurchasePaymentRelatedResultList;
            let showList = list.map((k) => {
              return h(
                "div",
                {
                  class: "clickGesture",
                  on: {
                    click: () => {
                      this.toPurchaseDetail(
                        params.row,
                        k.purchaseId,
                        params.index
                      );
                    },
                  },
                },
                k.purchaseNumber
              );
            });
            return h("div", {},  [
              h("div", {}, params.row.aliAccount),
              h("div", {}, showList)
            ]);
          },
        },
        {
          title: "下单金额", // 收货金额
          key: "orderAmountTotal",
          align: "left",
          minWidth: 70,
          render(h, params) {
            return h(
              "span",
              params.row.orderAmountTotal || params.row.orderAmountTotal == 0
                ? params.row.orderAmountTotal + "  " + params.row.currency
                : ""
            );
          },
        },
        {
          title: "收库金额", // 收货金额
          key: "receiveAmountTotal",
          align: "left",
          minWidth: 70,
          render(h, params) {
            return h(
              "span",
              params.row.receiveAmountTotal ||
                params.row.receiveAmountTotal == 0
                ? params.row.receiveAmountTotal + "  " + params.row.currency
                : ""
            );
          },
        },
      ];
      if (
        this.tabsValue === "-1" ||
        this.tabsValue === "0" ||
        this.tabsValue === "1"
      ) {
        data.push({
          title: "操作",
          minWidth: 80,
          align: "left",
          fixed: "right",
          key: "operation",
          render: (h, params) => {
            let v = this;
            let a =
              params.row.paymentStatus == 0 &&
              this.getPermission("purchasePaymentInfo_check")
                ? [
                  h(
                    "DropdownItem",
                    {
                      nativeOn: {
                        click() {
                          v.selfOperateArr = [];
                          v.selfOperateArr.push(params.row);
                          v.confirmOperate(1);
                        },
                      },
                    },
                    "审核通过"
                  ),
                ]
                : [];
            let b =
              params.row.paymentStatus == 1 &&
              this.getPermission("purchasePaymentInfo_batchConfirm")
                ? [
                  h(
                    "DropdownItem",
                    {
                      nativeOn: {
                        click() {
                          v.selfOperateArr = [];
                          v.selfOperateArr.push(params.row);
                          v.confirmOperate(2);
                        },
                      },
                    },
                    "确认付款"
                  ),
                ]
                : [];
            let c =
              params.row.paymentStatus == 1 &&
              this.getPermission("purchase_paymentUrl")
                ? [
                  h(
                    "DropdownItem",
                    {
                      nativeOn: {
                        click() {
                          v.selfOperateArr = [];
                          v.selfOperateArr.push(params.row);
                          v.batch1688SinglePayment('1688', params.row);
                        },
                      },
                    },
                    "1688付款"
                  ),
                ]
                : [];
            let d =
              params.row.paymentStatus == 1 &&
              this.getPermission("purchase_paymentUrl")
                ? [
                  h(
                    "DropdownItem",
                    {
                      nativeOn: {
                        click() {
                          v.selfOperateArr = [];
                          v.selfOperateArr.push(params.row);
                          v.batch1688SinglePayment('cross', params.row);
                        },
                      },
                    },
                    "跨境宝付款"
                  ),
                ]
                : [];
            let e =
              params.row.paymentStatus == 1 || params.row.paymentStatus == 0
                ? [
                  h(
                    "DropdownItem",
                    {
                      nativeOn: {
                        click() {
                          v.cancelRemark = "";
                          v.purchasePaymentInfoId =
                              params.row.purchasePaymentInfoId;
                          v.purchaseNumber = params.row.purchaseNumber;
                          v.cancelPay(1);
                        },
                      },
                    },
                    "取消付款"
                  ),
                ]
                : [];
            return h(
              "div",
              {
                style: {
                  display:
                    params.row.paymentStatus == 2 ||
                    params.row.paymentStatus == 3
                      ? "none"
                      : "",
                },
              },
              [
                h(
                  "Dropdown",
                  {
                    props: {
                      transfer: true,
                    },
                    style: {},
                  },
                  [
                    h("a", {}, [
                      h("Button", {}, [
                        h("Span", { style: { marginRight: "5px" } }, "操作"),
                        h("Icon", {
                          props: {
                            type: "ios-arrow-down",
                          },
                        }),
                      ]),
                    ]),
                    h(
                      "DropdownMenu",
                      {
                        slot: "list",
                      },
                      [...a, ...b, ...c, ...d, ...e]
                    ),
                  ]
                ),
              ]
            );
          },
        });
      }
      if (this.tabsValue === "3") {
        data.push({
          title: "取消信息", // 收货金额
          key: "cancelInfo",
          align: "left",
          minWidth: 110,
          render: (h, params) => {
            return h("div", [
              h(
                "span",
                this.getDataToLocalTime(params.row.cancelTime, "fulltime")
              ),
              h("div", { style: { marginTop: "10px" } }, [
                h(
                  "Tooltip",
                  {
                    props: {
                      placement: "left",
                      transfer: true,
                    },
                  },
                  [
                    h(
                      "div",
                      {
                        style: {
                          display: "inline-block",
                          width: params.column._width * 0.85 + "px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        },
                      },
                      params.row.cancelRemark || ""
                    ),
                    h(
                      "span",
                      {
                        slot: "content",
                        style: { whiteSpace: "pre-wrap" },
                      },
                      params.row.cancelRemark
                    ),
                  ]
                ),
              ]),
            ]);
          },
        });
      }
      this.column1 = data;
    },
    getBusinessDeptInfo() {
      this.axios
        .post("/sps-service/sps/common/businessDeptInfo")
        .then((res) => {
          this.businessDeptInfoList = res.data.datas;
        });
    },
    // 获取1688账号
    getAccount() {
      return new Promise((resolve) => {
        this.axios.post(`${api.postQueryAccount}?businessDeptIds=${this.businessDeptIds}`).then((res) => {
          if (res.data && res.data.code == 0) {
            this.accountAllList = res.data.datas||[];
          }
          resolve(res);
        }).catch((error) => {
          console.error(error);
          resolve({});
        });
      })
    },
  },
};
</script>

<style lang="less">
.payment .ivu-table-wrapper {
  width: 100%;
}

.trans90 {
  transform: rotate(90deg);
  transition: 0.2s ease-in;
}

.startEndPayAmount {
  .ivu-form-item-content {
    display: flex;

    .ivu-input-number {
      flex: 50;
    }
  }
}

.paymentRquestTag {
  font-size: 12px;
  font-weight: 400;
  padding: 2px 1px;
  line-height: 16px;
  border-radius: 2px;
  margin: 3px 4px;
  width: fit-content;
}
</style>
<style scoped>
.textareaContent {
  width: 71%;
}

.textareaContent >>> .ivu-input {
  height: 33px;
}

.tabContent {
  background: #fff;
  margin-left: 12px;
  padding-top: 15px;
}

.tabContent >>> .ivu-tabs-bar {
  margin-bottom: 0;
}

</style>
