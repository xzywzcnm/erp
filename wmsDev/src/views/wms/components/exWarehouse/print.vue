<style scoped>
.spaceBetween {
  justify-content: space-between;
}

.dp-check {
  margin: 6px 0 0 20px;
}
</style>
<template>
  <div>
    <div v-if="workShow === 'list'">
      <div class="commonFilter">
        <div class="card-container">
          <div class="card-content platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="80">
              <dyt-filter>
                <FormItem label="包裹类型" prop="name">
                  <Button-group>
                    <template v-for="(item, index) in packageList">
                      <Button v-if="item.selected" type="primary" @click="selectPackageType(index, item.status)"
                        :key="index">{{ item.title }}
                      </Button>
                      <Button v-if="!item.selected" @click="selectPackageType(index, item.status)" :key="index">{{
                        item.title }}
                      </Button>
                    </template>
                  </Button-group>
                </FormItem>
                <FormItem label="物流方式">
                  <Cascader v-model="shippingMethodModel" :load-data="loadData" transfer @on-change="changeShippingMethod"
                    :data="shippingMethodData" filterable change-on-select></Cascader>
                </FormItem>
                <Form-item label="SKU" prop="sku">
                  <dyt-input placeholder="请输入SKU" v-model.trim="pageParams.sku"></dyt-input>
                </Form-item>
                <Form-item label="搜索字符" prop="searchValue">
                  <dyt-input placeholder="可输入订单号、出库单号、买家ID、买家姓名、SKU" v-model.trim="pageParams.searchValue"></dyt-input>
                </Form-item>
                <Form-item label="付款时间">
                  <Date-picker style="width: 100%" transfer type="datetimerange" @on-clear="resetDate"
                    @on-change="getDateValue" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end"
                    placeholder="选择日期" :value="payTimeArr"></Date-picker>
                </Form-item>
                <Form-item label="国家/地区" prop="buyerCountryCodeList">
                  <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" :max-tag-count="1"
                    multiple placeholder="请选择或输入所在地">
                    <Option v-for="(item, index) in formValidate.country" :key="index" :value="item.twoCode"
                      :label="item.enName"></Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="付款时间">
                  <Date-picker style="width: 100%" transfer type="datetimerange" @on-clear="resetDate"
                    @on-change="getDateValue" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end"
                    placeholder="选择日期" :value="payTimeArr"></Date-picker>
                </Form-item>
                <Form-item label="出库单号" prop="packageCode">
                  <dyt-input placeholder="请输入出库单号" v-model.trim="pageParams.packageCode"></dyt-input>
                </Form-item>
                <Form-item label="订单号" prop="orderNo">
                  <dyt-input placeholder="请输入订单号" v-model.trim="pageParams.orderNo"></dyt-input>
                </Form-item>
                <Form-item label="买家姓名" prop="buyerName">
                  <dyt-input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></dyt-input>
                </Form-item>
                <Form-item label="买家ID" prop="buyerAccountId">
                  <dyt-input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></dyt-input>
                </Form-item>
                <FormItem label="拣货单号">
                  <dyt-input placeholder="请输入拣货单号" v-model="pageParams.pickingGoodsNo" :maxlength="100" />
                </FormItem>
                <div slot="operation">
                  <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询</Button>
                  <Button style="margin-left: 10px" @click="reset" v-once icon="md-refresh">重置
                  </Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
      <div class="plr10">
        <div class="clear sort-box">
          <div class="tableControl fl">
            <div class="tableControlButton fl">
              <Button type="primary" class="iconbuttons" @click="markPrintMtBatch($event, 1)"
                :disabled="!getPermission('packageInfo_singlePrintExpressBill')">
                标记打印且包装
              </Button>
            </div>
            <div class="moreProductUp fl dp-check" v-if="pageParams.packageType === 4 || !pageParams.packageType">
              <Checkbox v-model="pageParams.skuQuantities" :true-value="1" :false-value="0"
                @on-change="changeSkuQuantities">多品置顶
              </Checkbox>
            </div>
          </div>
          <div class="fr">
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch"
              :sorType="{ DESC: 'down', ASC: 'up' }">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>
      <div class="orderTable normalTop">
        <Table highlight-row border :loading="TableLoading" :height="tableHeight" :columns="orderColumn" :data="printData"
          @on-selection-change="getSelectValue"></Table>
        <div class="table-page">
          <div class="table-page-right">
            <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
              :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top"
              :page-size-opts="pageArray"></Page>
          </div>
        </div>
      </div>
      <!-- 更换物流方式 -->
      <Modal v-model="setMatchStatusModel" width="600" :mask-closable="false" v-if="setMatchStatus"
        @on-ok="setShippingMethod" @on-cancel="resetShippingMethod">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">
              {{ changeShippingMehotdModel.title }}
            </div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div style="margin-top: 10px">
              <Row v-if="changeShippingMehotdModel.content !== ''">
                <Col :span="1">
                <Icon type="md-information-circle" color="#2b85e4" size="36"></Icon>
                </Col>
                <Col :span="21" :offset="2">
                <p style="line-height: 36px"></p>
                {{ changeShippingMehotdModel.content }}
                </Col>
              </Row>
              <Form class="setAllMarkRead" style="margin-top: 10px">
                <Row>
                  <Col :span="14">
                  <Form-item label="实际发货物流方式：" :label-width="120">
                    <Cascader :data="shippingMethodData" @on-visible-change="showShippingData" v-model="value2" transfer
                      :load-data="loadData" @on-change="getAccount"></Cascader>
                  </Form-item>
                  </Col>
                  <Col :span="9" :offset="1">
                  <Form-item label="帐号：" :label-width="60">
                    <Select v-model="shippingAccountModel">
                      <Option v-for="(item, index) in carrierAccount" v-if="item.carrierAccountId !== null" :key="index"
                        :value="item.carrierAccountId">{{ item.account }}
                      </Option>
                    </Select>
                  </Form-item>
                  </Col>
                </Row>
              </Form>
              <div class="matchLogisticSetting">
                <h6>物流相关设置</h6>
              </div>
              <Form class="setAllMarkRead" style="margin-top: 10px">
                <Row>
                  <Col :span="12" v-for="(item, index) in carrierBaseSetting" :key="index">
                  <Form-item :label="item.paramName" :label-width="100">
                    <Radio-group v-model="shippingMethodModel[index].paramValue" :value="item.paramValue"
                      v-if="item.paramType === 'radio'">
                      <Radio :label="sItem.itemValue" v-for="(sItem, n) in item.dictionarys" :key="n">
                        <span>{{ sItem.itemName }}</span>
                      </Radio>
                    </Radio-group>
                    <Input v-if="item.paramType === 'input'" v-for="(sItem, n) in item.dictionarys" :key="n"
                      v-model="shippingMethodModel[index].paramValue" :value="sItem.itemValue"></Input>
                    <Checkbox-group v-model="shippingMethodModel[index].paramValue" v-if="item.paramType === 'checkbox'">
                      <Checkbox v-for="(sItem, n) in item.dictionarys" :key="n" :label="sItem.itemValue">
                        <span>{{ sItem.itemName }}</span>
                      </Checkbox>
                    </Checkbox-group>
                    <Select v-if="item.paramType === 'select'" v-model="shippingMethodModel[index].paramValue">
                      <Option v-for="(sItem, n) in item.dictionarys" :key="n" :value="sItem.itemValue">
                        {{ sItem.itemName }}
                      </Option>
                    </Select>
                  </Form-item>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
        </div>
      </Modal>
      <!-- 打印拣货单 -->
      <Modal v-if="pickingListStatus" v-model="pickingListModelStatus" width="500" @on-ok="beginPicking">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">
              {{
                pickintType === "all"
                ? "打印拣货单（所有结果集）"
                : "打印拣货单"
              }}
            </div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              <Form refs="pickingForm" :model="pickingListModel" :label-width="90">
                <FormItem label="拣货单形式：" prop="pickingType">
                  <RadioGroup v-model="pickingListModel.pickingType">
                    <Radio label="1">
                      <span>SKU汇总</span>
                    </Radio>
                    <Radio label="2">
                      <span>逐包裹</span>
                    </Radio>
                    <Radio label="3">
                      <span>SKU汇总（有发货说明的例外）</span>
                    </Radio>
                  </RadioGroup>
                </FormItem>
                <FormItem label="排序方式" prop="pickingSort">
                  <Select v-model="pickingListModel.pickingSort">
                    <Option value="1">货位升序（多品置顶，且取数量最多的SKU作为排序依据）</Option>
                    <Option value="2">货位降序（多品置顶，且取数量最多的SKU作为排序依据）</Option>
                    <Option value="3">SKU升序（多品置顶，且取数量最多的SKU作为排序依据）</Option>
                    <Option value="4">SKU降序（多品置顶，且取数量最多的SKU作为排序依据）</Option>
                  </Select>
                </FormItem>
                <FormItem label="" prop="pickingSort">
                  <Checkbox v-model="pickingListModel.printProductPic">打印产品图片</Checkbox>
                </FormItem>
              </Form>
            </div>
          </div>
        </div>
      </Modal>
      <!-- 打印面单 -->
      <Modal v-if="expressSheetStatus" v-model="expressSheetModelStatus" width="550" @on-ok="expressSheet">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">
              {{ expressSheetModel.title }}
            </div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              <Row v-if="expressSheetModel.content !== ''">
                <Col :span="1">
                <Icon type="md-information-circle" color="#2b85e4" size="36"></Icon>
                </Col>
                <Col :span="21" :offset="2">
                <p style="line-height: 36px"></p>
                {{ expressSheetModel.content }}
                </Col>
              </Row>
              <Form refs="expressSheetModel" :model="expressSheetModel" :label-width="90">
                <FormItem label="排序方式" prop="pickingSort">
                  <Select v-model="expressSheetModel.pickingSort">
                    <!-- 暂时去掉 -->
                    <!-- <Option value="1">货位升序（多品置顶，且取数量最多的SKU作为排序依据）</Option>
                    <Option value="2">货位降序（多品置顶，且取数量最多的SKU作为排序依据）</Option> -->
                    <Option value="3">SKU升序（多品置顶，且取数量最多的SKU作为排序依据）</Option>
                    <Option value="4">SKU降序（多品置顶，且取数量最多的SKU作为排序依据）</Option>
                  </Select>
                </FormItem>
              </Form>
            </div>
          </div>
        </div>
      </Modal>
    </div>
    <div v-if="workShow === 'detail'">
      <sellStockOutDtl :workShow="workShow" :pickingNo="packageCode" workType="sellStock"></sellStockOutDtl>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import packageDetails from "./packageDetails";
import tableMixin from "@/components/mixin/table_mixin";
import deliveryMixin from "@/components/mixin/delivery_mixin";
import publicService from "@/components/mixin/publicService_mixin";
import sellStockOutDtl from "./sellStockOutDtl";
import compoundBtn from "@/views/wms/components/common/compoundBtn";
import { cainiaoPrint, initCainiao } from "@/utils/index";
import Qs from "qs";

export default {
  mixins: [Mixin, tableMixin, deliveryMixin, publicService],
  components: {
    compoundBtn,
    packageDetails,
    sellStockOutDtl,
  },
  data() {
    var self = this;
    return {
      postId: "",
      pdf: "", // 详情参数 Start
      packageModel: false,
      packageDetailsStatus: true,
      packageId: null,
      timestamp: null,
      logistics: 0, // End
      // 打印拣货单 Start
      pickingListStatus: false,
      pickingListModelStatus: false,
      pickintType: "",
      pickingListModel: {
        pickingType: "1",
        pickingSort: "1",
        pickingListModel: false,
      }, // End
      // 打印面单
      expressSheetStatus: false,
      expressSheetModelStatus: false,
      expressSheetModel: {
        title: "打印面单",
        pickingSort: "1",
        content: "",
      },
      moreProductUp: false,
      packageIds: [],
      shippingMethodModel1: [],
      changeShippingMethodBoxStatus: false,
      changeShippingMethodBoxModel: false,
      smModel: {
        type: "",
        title: "",
        content: "",
        merchantCarrierId: "",
        merchantShippingMethodId: "",
      },
      sortButtonList: [
        {
          sortHeader: "按SKU",
          sortField: "sortingSku",
          sortType: "up",
          default: true,
        },
        {
          sortHeader: "按付款时间",
          sortField: "payTime",
          sortType: "up",
        },
        {
          sortHeader: "按出库单号",
          sortField: "packageCode",
          sortType: "up",
        },
      ],
      pageParams: {
        pageNum: 1,
        pageSize: 50,
        pickingGoodsNo: "",
        orderBy: "SKU",
        upDown: "up",
        orderNo: null,
        buyerAccountId: null,
        buyerCountryCodeList: [],
        buyerName: null,
        merchantCarrierId: null,
        merchantShippingMethodId: null,
        packageStatus: null,
        packageType: null,
        skuQuantities: 0,
        platformId: null,
        saleAccountIds: [],
        packageCode: null,
        warehouseId: self.getWarehouseId(),
        searchValue: null, // 搜索内容
        payStartTime: null,
        payEndTime: null,
      },
      platformArr: [],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      packageList: [
        {
          selected: true,
          status: null,
          title: "全部",
        },
        {
          selected: false,
          status: 1,
          title: "单品",
        }, // {
        //   selected: false,
        //   status: 2,
        //   title: '单品多件'
        // },
        {
          selected: false,
          status: 2,
          title: "多品",
        },
        {
          selected: false,
          status: 3,
          title: "有发货提醒",
        },
      ],
      packagePaperList: [
        {
          selected: true,
          status: 1,
          title: "已有面单",
        },
        {
          selected: false,
          status: -1,
          title: "未获取面单",
        },
      ],
      packagePaperSizeList: [
        {
          selected: true,
          status: 0,
          title: "100 x 100",
        },
        {
          selected: false,
          status: 1,
          title: "100 x 150",
        },
        {
          selected: false,
          status: 2,
          title: "90 x 60",
        },
      ],
      resetStatus: true,
      payTimeArr: [],
      shopList: [],
      printData: [],
      orderColumn: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "NO",
          minWidth: 60,
          align: "center",
          key: "index",
        },
        {
          title: "出库单号",
          key: "packageCode",
          align: "center",
          minWidth: 140,
          render: (h, params) => {
            if (this.getPermission("wmsPicking_querySalesPickingDetail")) {
              return h(
                "span",
                {
                  class: "blueColor cursor underline",
                  on: {
                    click: () => {
                      // self.showPackageDetails(params.row.packageId);
                      self.showPackageDetails(params.row.packageCode, "detail");
                    },
                  },
                },
                params.row.packageCode
              );
            } else {
              return h("div", params.row.packageCode);
            }
          },
        },
        {
          title: "拣货单号",
          align: "center",
          key: "pickingGoodsNo",
          minWidth: 160,
          render: (h, params) => {
            return h("span", params.row.pickingGoodsNo);
          },
        },
        {
          title: "订单号",
          key: "salesRecordNumber",
          minWidth: 140,
          align: "center",
          render: (h, params) => {
            let pos = [];
            if (params.row.packageOrderBoList !== null) {
              for (let i = 0; i < params.row.packageOrderBoList.length; i++) {
                let n = params.row.packageOrderBoList[i];
                // pos.push(
                //   h('div', params.row.accountCode + '-' + n.salesRecordNumber)
                // );
                if (n.accountCode) {
                  pos.push(h("div", n.accountCode + "-" + n.salesRecordNumber));
                } else {
                  pos.push(h("div", n.salesRecordNumber));
                }
              }
              return h("div", pos);
            }
          },
        },
        {
          title: "买家ID/姓名",
          key: "buyerName",
          align: "center",
          minWidth: 160,
          render: (h, params) => {
            return h("div", [
              h(
                "div",
                {
                  style: {
                    color: "#0054A6",
                  },
                },
                params.row.buyerAccountId
              ),
              h(
                "div",
                {
                  style: {
                    color: "#ff3300",
                  },
                },
                params.row.buyerName
              ),
            ]);
          },
        },
        {
          title: "国家/地区",
          key: "buyerCountryCode",
          align: "center",
          minWidth: 100,
        },
        {
          title: "物流方式",
          align: "center",
          key: "carrierShippingMethodName",
          minWidth: 200,
        },
        {
          title: "SKU数量",
          align: "center",
          key: "skuQuantity",
          minWidth: 100,
        },
        {
          title: "物品数量",
          align: "center",
          key: "productQuantity",
          minWidth: 100,
        },
        {
          title: "付款时间",
          align: "center",
          minWidth: 160,
          key: "payTime",
          render: (h, params) => {
            return self.$uDate.getDataToLocalTime(
              params.row.payTime,
              "fulltime"
            );
          },
        },
        {
          title: "操作",
          key: "operate",
          align: "center",
          width: 150,
          fixed: "right",
          render: (h, params) => {
            return h(
              compoundBtn,
              {
                props: {
                  dropList: [
                    {
                      label: "查看出库单详情",
                      value: "1",
                      flagCode: ["1"],
                      status: this.getPermission(
                        "wmsPicking_querySalesPickingDetail"
                      )
                        ? "1"
                        : -1,
                    },
                    // {
                    //   label: '标记已打印',
                    //   value: '2',
                    //   flagCode: ['1'],
                    //   status: this.getPermission('packageInfo_singlePrintExpressBill') ? '1' : -1
                    // },
                    {
                      label: "标记打印且包装",
                      value: "3",
                      flagCode: ["1"],
                      status: this.getPermission(
                        "packageInfo_singlePrintExpressBill"
                      )
                        ? "1"
                        : -1,
                    },
                  ],
                  title: "打印",
                  listenNormal: false,
                  btnType: "",
                  icon: "md-print",
                  disabled: !self.getPermission(
                    "packageInfo_singlePrintExpressBill"
                  ),
                },
                on: {
                  click: (val) => {
                    if (!val) {
                      // 打印
                      self.getSinglePrint(params.row.packageId);
                    } else {
                      if (val === "1") {
                        self.showPackageDetails(
                          params.row.packageCode,
                          "detail"
                        );
                      } else if (val === "2") {
                        self.markPrintMt([params.row.packageId]);
                      } else if (val === "3") {
                        self.markPrintMt([params.row.packageId], 1);
                      }
                    }
                  },
                },
              },
              []
            );
          },
        },
      ],
      changeShippingMehotdModel: {
        type: "",
        title: "",
        content: "",
      },
      setMatchStatus: false,
      setMatchStatusModel: false,
      value2: [], // 物流[mcarrierID,merchantShippingMethodId]
      carrierAccount: [], // 对应物流账号
      carrierBaseSetting: [], // 物流参数配置
      shippingMethodModel: [],
      shippingAccountModel: "",
      workShow: "list",
      packageCode: "",
      pickNoList: [],
      placeholderUrl: require("../../../../../public/static/images/placeholder.jpg"),
      localeUrl: window.location.origin
        ? window.location.origin
        : window.location.protocol +
        "//" +
        window.location.hostname +
        (window.location.port ? ":" + window.location.port : ""), // 兼容性写法
    };
  },
  created() {
    this.startLoading();
    this.showShippingData(true); // 查询物流方式下拉数据
    // this.getPlatform(); // 查询所有可用平台
  },
  watch: {
    pageParamsStatus(n) {
      let v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    },
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(295);
    },
    prefixUrl() {
      return localStorage.getItem("imgUrlPrefix");
    },
  },
  methods: {
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.upDown = type;
      this.pageParams.orderBy = feild;
      this.search();
    },
    markPrintMtBatch(event, type) {
      let v = this;
      if (v.packageIds.length === 0 || v.packageIds === null) {
        v.$Message.error("请选择包裹");
        return false;
      }
      v.markPrintMt(v.packageIds, type);
    },
    markPrintMt(packageIds, type) {
      let v = this;
      v.axios
        .put(api.markPackagePrinted, {
          packageIds: packageIds,
          type: type,
        })
        .then((response) => {
          if (response.data.code === 0) {
            v.$Message.success("操作成功");
            v.search();
          }
        });
    },
    startLoading() {
      let v = this;
      v.$Loading.start();
      v.getList();
      v.getShopList();
    },
    getList() {
      let v = this;
      v.pageParams.pageSize = this.getPageSizeCache();
      v.SearchDisabled = true;
      v.TableLoading = true;
      if (v.getPermission("packageInfo_queryForAllowPrint")) {
        v.axios
          .post(api.get_printList, JSON.stringify(v.pageParams))
          .then((response) => {
            if (response.data.code === 0) {
              let data = response.data.datas.list;
              let saleAccountIdPos = [];
              let pos = [];
              let merchantShippingMethodIdPos = [];
              if (data !== null && data.length > 0) {
                function makeData() {
                  data.forEach((n, i) => {
                    n.index = i + 1;
                    pos.push(n);
                    saleAccountIdPos.push(n.saleAccountId);
                    merchantShippingMethodIdPos.push(
                      n.merchantShippingMethodId
                    );
                  });
                }

                async function getShippingMehotds() {
                  await makeData();
                  merchantShippingMethodIdPos = [
                    ...new Set(merchantShippingMethodIdPos),
                  ];
                  Promise.resolve(
                    v.axios
                      .get(
                        api.get_allEnabalShippingMethods +
                        "?carrierShippingMethodIdList=" +
                        merchantShippingMethodIdPos
                      )
                      .then((response1) => {
                        let shippingData = response1.data.datas;
                        shippingData.forEach((m, t) => {
                          pos.forEach((n, i) => {
                            if (
                              n.merchantShippingMethodId === m.shippingMethodId
                            ) {
                              pos[i].carrierShippingMethodName =
                                m.carrierShippingMethodName;
                            }
                          });
                        });
                      })
                  ).then((response5) => {
                    if (saleAccountIdPos.length > 0) {
                      v.$nextTick(function () {
                        v.total = Number(response.data.datas.total);
                        v.totalPage = Number(response.data.datas.pages);
                        v.loadingFalse();
                        v.$Loading.finish();
                      });
                      v.printData = pos;
                    }
                  });
                }

                getShippingMehotds();
              } else {
                v.printData = [];
                v.loadingFalse();
                v.$nextTick(function () {
                  v.total = 0;
                  v.totalPage = 0;
                });
              }
            } else {
              v.loadingFalse();
              v.$nextTick(function () {
                v.total = 0;
                v.totalPage = 0;
              });
            }
          });
      } else {
        v.gotoError(); // 无权限
      }
    },
    selectPackageType(index, status) {
      let v = this;
      if (index === 0) {
        delete v.pageParams.packageType;
      } else {
        v.pageParams.packageType = status;
      }
      v.curPage = 1;
      v.pageParams.pageNum = 1;
      v.packageList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    selectPackagePaper(index, status) {
      let v = this;
      if (index === 0) {
        v.pageParams.getLabelStatus = 1;
      } else {
        v.pageParams.getLabelStatus = -1;
      }
      v.curPage = 1;
      v.pageParams.pageNum = 1;
      v.packagePaperList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    selectPackageSize(index, status) {
      let v = this;
      if (index === 0) {
        delete v.pageParams.status;
      } else if (index === 1) {
        v.pageParams.status = "1";
      } else {
        v.pageParams.status = "0";
      }
      v.curPage = 1;
      v.pageParams.pageNum = 1;
      v.packagePaperList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    reset() {
      let v = this;
      v.$refs["pageParams"].resetFields();
      v.selectPackageType(0, null);
      v.selectPackagePaper(0, 1);
      v.shippingMethodModel = [];
      v.platformId = null;
      v.payTimeArr = [];
      v.resetDate();
      v.pageParams.pickingGoodsNo = null;
      v.pageParams.merchantCarrierId = null;
      v.pageParams.merchantShippingMethodId = null;
    },
    search() {
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    changeShippingMethod(value, data) {
      let v = this;
      if (value.length === 0) {
        v.pageParams.merchantCarrierId = null;
        v.pageParams.merchantShippingMethodId = null;
      } else if (value.length === 1) {
        v.pageParams.merchantCarrierId = value[0];
        v.pageParams.merchantShippingMethodId = null;
      } else if (value.length === 2) {
        v.pageParams.merchantCarrierId = value[0];
        v.pageParams.merchantShippingMethodId = value[1][0];
      }
    },
    resetDate() {
      let v = this;
      v.pageParams.payStartTime = null;
      v.pageParams.payEndTime = null;
    }, // 获取日期返回值
    getDateValue(value) {
      var v = this;
      if (value.length === 0 || !value[0]) {
        v.resetDate();
      } else {
        if (value[0] !== "") {
          v.pageParams.payStartTime = v.$uDate.getUniversalTime(
            new Date(value[0]).getTime(),
            "fulltime"
          );
          v.pageParams.payEndTime = v.$uDate.getUniversalTime(
            new Date(value[1]).getTime(),
            "fulltime"
          );
        }
      }
    },
    printDeclarationSheet(type) {
      let v = this;
      v.expressSheetModel.pickingSort = "1";
      if (
        (v.packageIds.length === 0 || v.packageIds === null) &&
        type !== "all"
      ) {
        v.$Message.error("请选择包裹");
        return false;
      }
      if (type === "all") {
        v.expressSheetModel.title = "打印面单（所有结果集）";
        v.expressSheetModel.content =
          "所有结果集打印面单，系统将打印出符合您当前查询条件的所有包裹的面单。";
      } else {
        v.expressSheetModel.title = "打印面单";
        v.expressSheetModel.content = "";
      }
      // v.expressSheetStatus = true;
      // v.$nextTick(function () {
      //   v.expressSheetModelStatus = true;
      // });
      v.$Modal.info({
        title: "打印",
        content: "打印，系统将符合您选择的出库单标记为已打印面单。",
        closable: true,
        onOk() {
          v.expressSheet(); // 需求改动，这里不需要再弹框选择排序（bug号：TWMS-1070）
        },
      });
    },
    expressSheet() {
      // 打印面单
      let v = this;
      var obj = {
        printOrderBy: v.expressSheetModel.pickingSort,
        packageIds: v.packageIds,
        skuQuantities: v.pageParams.skuQuantities,
        orderBy: v.pageParams.orderBy,
        upDown: v.pageParams.upDown,
        warehouseId: v.getWarehouseId(),
      };
      if (v.expressSheetModel.title === "打印面单（所有结果集）") {
        obj = Object.assign(obj, v.pageParams);
      }
      v.axios.post(api.express_sheet, JSON.stringify(obj)).then((response) => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let erpCommon = v.$store.state.erpConfig;
          if (erpCommon.filenodeViewTargetUrl === "./filenode/s") {
            erpCommon.filenodeViewTargetUrl =
              window.location.href.split("wms.html")[0] + "filenode/s";
          }
          v.printRecursion(data, 0);
          /* data.forEach((n, i) => {
           if (n.labelPath.indexOf('http') !== -1) {
           v.print(n.labelPath, n.packageId, n.printOrderBy);
           } else if (n.labelPath.indexOf('http') === -1) {
           v.print(
           erpCommon.filenodeViewTargetUrl + n.labelPath,
           n.packageId,
           n.printOrderBy
           );
           }
           });
           v.pageParamsStatus = true; */
        }
      });
    },
    printRecursion(data, index) {
      let v = this;
      // 递归打印
      let erpCommon = v.$store.state.erpConfig;
      if (data.length > index) {
        let n = data[index];
        if (n.labelPath.indexOf("http") !== -1) {
          v.print(n.labelPath, n.packageId, n.printOrderBy, () => {
            v.printRecursion(data, ++index);
          });
        } else if (n.labelPath.indexOf("http") === -1) {
          v.print(
            erpCommon.filenodeViewTargetUrl + n.labelPath,
            n.packageId,
            n.printOrderBy,
            () => {
              v.printRecursion(data, ++index);
            }
          );
        }
      } else {
        v.markPackagePrintedMt(data.map((i) => i.packageId));
        v.pageParamsStatus = true;
      }
    },
    printDeclarationSheetHasCondition() {
      this.printDeclarationSheet("all");
    },
    getDeclarationSheet(type) {
      let v = this;
      if (
        (v.packageIds.length === 0 || v.packageIds === null) &&
        type !== "all"
      ) {
        v.$Message.error("请选择包裹");
        return false;
      }
      let obj = {
        packageIds: v.packageIds,
      };
      if (type === "all") {
        obj = Object.assign(obj, v.pageParams);
        delete obj.packageIds;
      }
      v.axios.put(api.get_expressBill, JSON.stringify(obj)).then((response) => {
        if (response.data.code === 0) {
          v.$Message.success("获取面单成功");
        }
      });
    },
    getDeclarationSheetHasCondition() {
      this.getDeclarationSheet("all");
    },
    getSelectValue(value) {
      // table获取所选值
      let v = this;
      let pos = [];
      let box = [];
      let lgi = [];
      Promise.resolve(
        value.forEach((n, i) => {
          pos.push(n.packageId);
          box.push(n.pickingGoodsNo);
          lgi.push(n.merchantCarrierId);
        })
      ).then(() => {
        v.logistics = [...new Set(lgi)].length;
        v.packageIds = pos;
        v.pickNoList = box;
      });
    }, // showPackageDetails (pid) {
    //   let v = this;
    //   v.packageId = pid;
    //   v.packageDetailsStatus = true;
    //   let date = new Date().getTime();
    //   v.$nextTick(function () {
    //     v.packageModel = true;
    //     v.timestamp = date;
    //   });
    // },
    showPackageDetails(packageCode, detail) {
      this.packageCode = packageCode;
      this.workShow = detail;
    },
    beginPicking() {
      let v = this;
      var obj = {
        isPrintPic: v.pickingListModel.pickingListModel ? "1" : "0",
        sheetProductType: v.pickingListModel.pickingType,
        sheetOrderBy: v.pickingListModel.pickingSort,
        packageIds: v.packageIds,
        warehouseId: v.getWarehouseId(),
      };
      if (v.pickintType === "all") {
        obj = Object.assign(obj, v.pageParams);
        delete obj.packageIds;
      }
      let newTab = window.open("about:blank");
      v.axios
        .post(api.print_pickingOrder, JSON.stringify(obj))
        .then((response) => {
          if (response.data.code === 0) {
            localStorage.setItem(
              "prinSheetData",
              JSON.stringify(response.data.datas)
            );
            newTab.location.href =
              "//" +
              window.location.host +
              "/wms-service/printSheet.html?type=" +
              v.pickingListModel.pickingType;
          }
        });
    },
    getSinglePrint(packageId) {
      let v = this;
      v.axios
        .get(api.get_singleExpressBillPath + packageId)
        .then((response) => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            if (!data) {
              v.$Message.error("未获取面单，无法打印");
              return;
            }
            if (data.indexOf("http") !== -1) {
              v.print(response.data.datas, packageId, null, () => {
                v.markPackagePrintedMt([packageId]);
              });
            } else if (data.indexOf("http") === -1) {
              let erpCommon = v.$store.state.erpConfig;
              if (
                erpCommon !== null &&
                erpCommon.hasOwnProperty("filenodeViewTargetUrl")
              ) {
                if (erpCommon.filenodeViewTargetUrl === "./filenode/s") {
                  erpCommon.filenodeViewTargetUrl =
                    window.location.href.split("wms.html")[0] + "filenode/s";
                }
                v.print(
                  erpCommon.filenodeViewTargetUrl + response.data.datas,
                  packageId,
                  null,
                  () => {
                    v.markPackagePrintedMt([packageId]);
                  }
                );
              } else {
                v.getErpConfig().then((result) => {
                  if (result) {
                    let erpCommon = v.$store.state.erpConfig;
                    if (erpCommon.filenodeViewTargetUrl === "./filenode/s") {
                      erpCommon.filenodeViewTargetUrl =
                        window.location.href.split("wms.html")[0] +
                        "filenode/s";
                    }
                    v.print(
                      erpCommon.filenodeViewTargetUrl + response.data.datas,
                      packageId,
                      null,
                      () => {
                        v.markPackagePrintedMt([packageId]);
                      }
                    );
                  }
                });
              }
            }
          }
        });
    },
    print(path, postId, orderBy, callback) {
      // JSONP /printResult
      let v = this;
      let originPostId = postId;
      postId = postId + parseInt(Math.random() * 100000000);
      let str = path.split(".");
      let last = str[str.length - 1];
      let jsonObj = {};
      if (last === "html") {
        v.axios.get(api.get_loadUrlTxt + "?url=" + path).then((response) => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            jsonObj = {
              content: data,
              postId: postId,
            };
            let instance = v.axios.create({
              timeout: 3000,
              headers: {
                "Content-Type": "multipart/form-data; charset=UTF-8",
              },
            });
            console.log("postId:", postId);
            console.log("originPostId:", originPostId);
            delete v.axios.defaults.headers.post["X-Requested-With"];
            instance
              .post("http://localhost:10099/print", Qs.stringify(jsonObj))
              .then((response) => {
                if (response.status === 200) {
                  v.startPrintMonitor(jsonObj, originPostId, orderBy, callback);
                }
              })
              .catch(() => {
                v.axios.get(api.get_downloadPrint).then((response) => {
                  if (response.data.code === 0) {
                    v.$Modal.info({
                      title: "提示",
                      okText: "取消",
                      render: (h, params) => {
                        return h(
                          "div",
                          {
                            class: "normalTop20",
                          },
                          [
                            h(
                              "div",
                              {
                                class: "flexBox flexBoxJustContent",
                                style: {
                                  fontSize: "16px",
                                },
                              },
                              "该功能需使用打印控件，请下载安装"
                            ),
                            h(
                              "a",
                              {
                                attrs: {
                                  href:
                                    v.$store.state.erpConfig
                                      .filenodeViewTargetUrl +
                                    response.data.datas,
                                  target: "_blank",
                                },
                                class: "flexBox flexBoxJustContent normalTop",
                                style: {
                                  fontSize: "16px",
                                  fontWeigh: "bold",
                                },
                              },
                              "点击下载"
                            ),
                            h(
                              "div",
                              {
                                class: "flexBox flexBoxJustContent normalTop",
                                style: {
                                  fontSize: "16px",
                                },
                              },
                              "如果已安装，请开启打印控件"
                            ),
                          ]
                        );
                      },
                    });
                  }
                });
              });
          }
        });
      } else if (last === "cainiao") {
        // 获取文本内容
        initCainiao().then((data) => {
          let websocket = data;
          v.axios.get(api.get_loadUrlTxt + "?url=" + path).then((response) => {
            if (response.data.code === 0) {
              // 调用菜鸟打印
              cainiaoPrint(websocket, postId, response.data.datas).then(() => {
                // 标记打印
                v.markPrinted({
                  packageIds: [originPostId],
                }).then(() => {
                  v.pageParamsStatus = true;
                  // 标记回调
                });
              });
            }
          });
        });
      } else {
        // pdf
        jsonObj = {
          pdf: path,
          postId: postId,
        };
        let instance = v.axios.create({
          timeout: 3000,
          headers: {
            "Content-Type": "multipart/form-data; charset=UTF-8",
          },
        });
        console.log("postId:", postId);
        console.log("originPostId:", originPostId);
        delete v.axios.defaults.headers.post["X-Requested-With"];
        instance
          .post("http://localhost:10099/print", Qs.stringify(jsonObj))
          .then((response) => {
            if (response.status === 200) {
              v.startPrintMonitor(jsonObj, originPostId, orderBy, callback);
            }
          })
          .catch(() => {
            v.axios.get(api.get_downloadPrint).then((response) => {
              if (response.data.code === 0) {
                v.$Modal.info({
                  title: "提示",
                  okText: "取消",
                  render: (h, params) => {
                    return h(
                      "div",
                      {
                        class: "normalTop20",
                      },
                      [
                        h(
                          "div",
                          {
                            class: "flexBox flexBoxJustContent",
                            style: {
                              fontSize: "16px",
                            },
                          },
                          "该功能需使用打印控件，请下载安装"
                        ),
                        h(
                          "a",
                          {
                            attrs: {
                              href:
                                v.$store.state.erpConfig.filenodeViewTargetUrl +
                                response.data.datas,
                              target: "_blank",
                            },
                            class: "flexBox flexBoxJustContent normalTop",
                            style: {
                              fontSize: "16px",
                              fontWeigh: "bold",
                            },
                          },
                          "点击下载"
                        ),
                        h(
                          "div",
                          {
                            class: "flexBox flexBoxJustContent normalTop",
                            style: {
                              fontSize: "16px",
                            },
                          },
                          "如果已安装，请开启打印控件"
                        ),
                      ]
                    );
                  },
                });
              }
            });
          });
      }
    },
    startPrintMonitor(jsonObj, postId, orderBy, callback) {
      let v = this;
      let obj = {
        packageIds: [postId],
      };
      if (orderBy) {
        obj.printOrderBy = orderBy;
      }
      delete jsonObj.content;
      delete v.axios.defaults.headers.post["X-Requested-With"];
      v.axios
        .jsonp("http://localhost:10099/printResult?" + Qs.stringify(jsonObj))
        // instance.post('http://localhost:10099/printResult?' + Qs.stringify(jsonObj))
        .then((response) => {
          if (response.data === "0") {
            setTimeout(function () {
              v.startPrintMonitor(jsonObj, postId, orderBy, callback);
            }, 2500);
          } else if (response.data === "2") {
            v.$Message.error("打印失败");
          } else {
            if (callback) {
              callback();
            } else {
              v.pageParamsStatus = true;
            }
          }
        });
    },
    markPrinted(obj) {
      /**
       *  标记打印
       *  @param obj.packageIds Array
       *  @param  obj.printOrderBy String
       * */
      let v = this;
      return new Promise((resolve) => {
        v.axios.put(api.mark_printed, JSON.stringify(obj)).then((response) => {
          if (response.data.code === 0) {
            v.$Message.success("标记成功");
            resolve(response.data.datas);
          }
        });
      });
    },
    matchTheLogisticsOrder(type) {
      let v = this;
      if (
        (v.packageIds.length === 0 || v.packageIds === null) &&
        type !== "all" &&
        type !== "single"
      ) {
        v.$Message.error("请选择订单");
        return false;
      }
      if (type === "single") {
        v.changeShippingMehotdModel.type = "single";
      } else if (type === "all") {
        v.changeShippingMehotdModel.type = "all";
      }
      v.changeShippingMehotdModel.title = "更换物流方式";
      v.changeShippingMehotdModel.content = "";
      v.setMatchStatus = true;
      v.$nextTick(function () {
        v.setMatchStatusModel = true;
      });
    },
    setShippingMethod(type) {
      let v = this;
      let obj;
      if (v.changeShippingMehotdModel.type === "") {
        obj = {
          packageIds: v.packageIds,
          updateMerchantCarrierId: v.value2[0],
          updateMerchantShippingMethodId: v.value2[1][0],
          packageCarrierParam: v.shippingMethodModel,
          carrierAccountId: v.shippingAccountModel,
        };
      } else if (v.changeShippingMehotdModel.type === "all") {
        obj = v.deepCopy(v.pageParams);
        delete obj.packageIds;
        obj.updateMerchantCarrierId = v.value2[0];
        obj.updateMerchantShippingMethodId = v.value2[1][0];
        obj.packageCarrierParam = v.shippingMethodModel;
        obj.carrierAccountId = v.shippingAccountModel;
      } else if (v.changeShippingMehotdModel.type === "single") {
        obj = {
          packageIds: [v.selectId],
          updateMerchantCarrierId: v.value2[0],
          updateMerchantShippingMethodId: v.value2[1][0],
          packageCarrierParam: v.shippingMethodModel,
          carrierAccountId: v.shippingAccountModel,
        };
      }
      v.axios
        .put(api.update_printShippingMethod, JSON.stringify(obj))
        .then((response) => {
          if (response.data.code === 0) {
            v.$Message.success("操作成功");
            v.pageParamsStatus = true;
            v.resetShippingMethod();
          } else {
            v.resetShippingMethod();
          }
        })
        .catch((error) => {
          v.resetShippingMethod();
          v.$Message.error("系统繁忙，请重新尝试");
          console.log(error);
        });
    },
    resetShippingMethod() {
      // reset changeShippingMethod model data
      let v = this;
      v.value2 = [];
      v.shippingAccountModel = [];
      v.carrierAccount = [];
      v.carrierBaseSetting = [];
      v.shippingMethodModel = [];
    },
    changeSkuQuantities() {
      this.pageParamsStatus = true;
    },
    getBar() {
      return new Promise((resolve) => {
        let arr = this.batchPrintData.map((val) => val.pickingGoodsNo);
        this.axios.post(api.getBarCode, arr).then((res) => {
          if (res.data.code === 0) {
            this.batchPrintData.forEach((val1) => {
              res.data.datas.forEach((val2) => {
                let key = Object.getOwnPropertyNames(val2)[0];
                if (val1.pickingGoodsNo === key) {
                  let value = val2[key] ? val2[key] : "";
                  this.$set(val1, "barcode", value);
                }
              });
            });
            console.log(this.batchPrintData);
            resolve(this.batchPrintData);
          }
        });
      });
    },
  },
  mounted() {
    let v = this;
    setTimeout(v.getCountrys(), 2000); // 获取国家区域列表
  },
};
</script>
