<template>
  <div class="container">
    <div v-if="workShow !== 'detail'">
      <Card dis-hover>
        <Form ref="pageParams" :model="pageParams" :label-width="labelWidth" class="searchMain">
          <dyt-filter ref="dyt-filter" tableClassName=".table-main-box">
            <FormItem label="搜索字符" prop="searchValue">
              <Input placeholder="可输入订单号、买家ID、买家姓名、SKU、Item ID" v-model="pageParams.searchValue" />
            </FormItem>
            <FormItem label="物流方式" prop="shippingList">
              <!-- <Select v-model="pageParams.merchantShippingMethodId">
                <Option value="">全部</Option>
                <Option v-for="(item, index) in shipList" multiple :value="item.shippingMethodId" :key="index">{{
                  item.carrierShippingMethodName }}
                </Option>
              </Select> :shippingList="shipList" -->
              <dyt-shippingSelect v-model="pageParams.shippingList" @on-change="shippingChange" :loadingChildren="true" placeholder="请选择物流方式" />
            </FormItem>
            <FormItem label="创建时间" prop="createdTime">
              <Date-picker v-model="pageParams.createdTime" type="datetimerange" style="width: 100%" @on-clear="resetDate"
                :clearable="clearAble" :options="dateOptions" :transfer="true" format="yyyy-MM-dd HH:mm:ss"
                placement="bottom-end" placeholder="选择日期" />
            </FormItem>
            <Form-item label="LAPA状态" prop="ttStatus">
              <!-- <Button-group>
                <Button v-for="d in cognateSku" :key="d.value" :type="d.checked ? 'primary' : 'default'"
                  @click="changeCognateStatus(d.value)">{{ d.label }}
                </Button>
              </Button-group> -->
              <dyt-select v-model="pageParams.ttStatus">
                <Option v-for="item in cognateSku" :value="item.value" :key="item.value" :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <FormItem label="物流下单成功时间">
              <Date-picker type="datetimerange" style="width: 100%" @on-clear="orderResetDate" :transfer="true"
                @on-change="getOrderDateValue" :clearable="clearAble" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss"
                placement="bottom-end" placeholder="选择日期" :value="payTimeArr" />
            </FormItem>
            <FormItem label="供应商发货时间">
              <Date-picker type="datetimerange" style="width: 100%" @on-clear="despatchResetDate" :transfer="true"
                @on-change="getDespatchDateValue" :clearable="clearAble" :options="dateOptions"
                format="yyyy-MM-dd HH:mm:ss" placement="bottom-end" placeholder="选择日期" :value="payTimeArr">
              </Date-picker>
            </FormItem>
            <FormItem label="" :label-width="0" class="width-auto">
              <div style="display: flex" :style="`width:calc(280px + ${labelWidth}px);`">
                <Select v-model="selectType" class="selectStyle" @on-change="selectValue" :transfer="true">
                  <Option v-for="item in selectTypeList" :value="item.value" :key="item.value">{{ item.name }}</Option>
                </Select>
                <dyt-input-tag :limit="1" :string="true" type="textarea" v-model="textareaList"
                  style="margin-left: 5px; font-size: 12px" placeholder="支持批量查询，多个单号用逗号或换行分隔" />
              </div>
            </FormItem>
            <Form-item label="运单号" prop="trackingNumberList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.trackingNumberList"
                placeholder="多个请用逗号或回车分隔" />
            </Form-item>
            <FormItem label="缺货" prop="stockStatus">
              <Select v-model="pageParams.stockStatus" :transfer="true">
                <Option :value="1">是</Option>
                <Option :value="0">否</Option>
              </Select>
            </FormItem>
            <div slot="operation">
              <Button v-if="getPermission('packageInfo_outstoreQuery')" type="primary" @click="search"
                :disabled="SearchDisabled" icon="ios-search">查询</Button>
              <Button @click="resetFilter" v-once icon="md-refresh" style="margin-left: 8px;">重置 </Button>
            </div>
          </dyt-filter>
        </Form>
      </Card>
      <Card dis-hover class="table-header-btn mt10">
        <div>
          <Dropdown @on-click="exportAllOrSlt" class="ml10" v-if="getPermission('packageInfo_export')">
            <Button type="primary"><span class="icon iconfont" style="font-size: 12px">&#xe639;</span> 导出
              <Icon type="md-arrow-dropdown"></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem name="0">导出选中数据</DropdownItem>
              <DropdownItem name="1">导出所有结果集</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <!--同步发货状态-->
          <Dropdown style="margin-left: 20px" v-if="getPermission('packageInfo_getOutstorePackageStatus')">
            <a href="javascript:void(0)">
              <Button type="primary" @click="ShipmentStatusBtn(checkedDate)">同步发货状态
                <Icon type="ios-arrow-down" style="margin-left: 10px"></Icon>
              </Button>
            </a>
            <DropdownMenu slot="list" v-if="getPermission('packageInfo_batchOutstorePackageStatus')">
              <DropdownItem @click.native="ShipmentStatusAllBtn">同步发货状态（所有结果集）</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div>
          <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch"
            :sorType="{ DESC: 'down', ASC: 'up' }">
          </dyt-sortBySelect>
        </div>
      </Card>
      <div class="table-main-box">
        <Table :columns="columns1" :data="data1" :height="tableHeight" :loading="TableLoading"
          @on-selection-change="checkedDateMt" border />
      </div>
      <div class="table-page flexBox">
        <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
          :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray">
        </Page>
      </div>
    </div>
    <!-- 详情 -->
    <Modal v-model="detailModal" v-if="detailModalStatus" width="800" title="入库单详情">
      <div>
        <h3>退货地址信息</h3>
        <div>
          <Row class="mt10">
            <Col span="6">Name：{{ rowData.sendName }}</Col>
            <Col span="6">CountryCode：{{ rowData.sendCountryCode }}</Col>
            <Col span="6">StateOrProvinceCode：{{ rowData.sendDistrictOrCounty }}</Col>
            <Col span="6">PostalCode：{{ rowData.sendPostalCode }}</Col>
          </Row>
          <div class="mt10">Address.Line1：{{ rowData.sendAddressLine1 }}</div>
          <div class="mt10">Address.Line2：{{ rowData.sendAddressLine2 }}</div>
        </div>
        <div class="mt20">
          <Table highlight-row border :loading="TableLoading" :columns="detailColumn" :data="detailData"></Table>
        </div>
      </div>
      <div slot="footer" style="text-align: center">
        <Button type="primary" @click="detailModal = false">取消</Button>
      </div>
    </Modal>
    <div v-if="workShow === 'detail'">
      <sellStockOutDtl :pickingNo="pickingNo" :workShow="workShow" :packageId="activePackageId" :workType="workType">
      </sellStockOutDtl>
    </div>
  </div>
</template>

<script>
import common from "@/components/mixin/common_mixin";
import api from "@/api/api";
import sellStockOutDtl from "./orderDetail";

export default {
  name: "outboundOrder",
  mixins: [common],
  components: {
    sellStockOutDtl,
  },
  data() {
    let self = this;
    let v = this;
    return {
      ttStatus: "",
      checkedData: [],
      tableHeight: 605,
      workShow: "list",
      pickingNo: "",
      workType: "",
      // shipList: [], // 物流方式
      totalPage: 0,
      total: 0,
      curPage: 1,
      selectType: "order",
      textareaList: "",
      pageParams: {
        // ttStatus: [], // LAPA状态
        ttStatus: null, // LAPA状态
        // carrierSendStatus: null, // 同步状态
        searchValue: "", //
        pageNum: 1,
        pageSize: 10,
        stockStatus: null,
        orderBy: "CT",
        upDown: "up",
        startCreatedTime: null,
        endCreatedTime: null,
        startTrackingNumberTime: null,
        endTrackingNumberTime: null,
        startDespatchTime: null,
        endDespatchTime: null,
        specifiedOrderNoList: [],
        specifiedPackageCodeList: [],
        // 创建时间
        createdTime: [
          this.$common.dayjs().add(-7, 'day').format('YYYY-MM-DD HH:mm:ss'),
          this.$common.dayjs().format('YYYY-MM-DD HH:mm:ss')
        ],
        specifiedSkuList: [],
        warehouseId: v.getWarehouseId(),
        trackingNumberList: [],
        merchantCarrierIdList: [],
        merchantShippingMethodIdList: [],
        shippingList: [],
      },
      cognateSku: [
        {
          label: "等待下发物流",
          value: "1",
        },
        {
          label: "等待申请云卖",
          value: "2",
        },
        {
          label: "待拣货",
          value: "3",
        },
        {
          label: "待打印",
          value: "4",
        },
        {
          label: "待发货",
          value: "5",
        },
        {
          label: "已发货",
          value: "6",
        },
        {
          label: "已作废",
          value: "99",
        },
      ],
      // SynchronizationStatus: [
      //   // 同步物流商发货状态(1:未就绪 2:处理中 3:处理成功 4:处理失败)
      //   {
      //     label: "全部",
      //     value: "null",
      //     checked: true,
      //   },
      //   {
      //     label: "同步失败",
      //     value: "4",
      //     checked: false,
      //   },
      //   {
      //     label: "后台同步中",
      //     value: "2",
      //     checked: false,
      //   },
      // ],
      sortButtonList: [
        {
          sortHeader: "按创建时间",
          sortField: "CT",
          sortType: "up",
          default: true,
        },
        {
          sortHeader: "按出库单号",
          sortField: "SJ",
          sortType: "up",
        },
      ],
      columns1: [
        {
          type: "selection",
          width: 50,
          align: "center",
        },
        {
          title: "NO",
          align: "center",
          width: 60,
          render: (h, params) => {
            return h("div", params.index + 1);
          },
        },
        {
          title: "出库单号",
          key: "packageCode",
          align: "center",
          minWidth: 100,
          render(h, params) {
            return h(
              "a",
              {
                on: {
                  click() {
                    v.pickingNo = params.row.packageCode;
                    v.workType = "sellStock";
                    v.workShow = "detail";
                    v.ttStatus = params.row.ttStatus;
                    v.activePackageId = params.row.packageId;
                  },
                },
              },
              params.row.packageCode
            );
          },
        },
        {
          title: "订单号",
          key: "salesRecordNumber",
          minWidth: 100,
          align: "center",
          render(h, params) {
            if (params.row.packageOrderBoList) {
              return h(
                "div",
                {},
                params.row.packageOrderBoList.map((i) => {
                  return h("p", i.accountCode + "-" + i.salesRecordNumber);
                })
              );
            }
          },
        },
        {
          title: "买家ID/姓名",
          align: "center",
          minWidth: 100,
          render(h, params) {
            return h("span", {}, params.row.buyerAccountId + "/" + params.row.buyerName);
          },
        },
        {
          title: "国家/地区",
          align: "center",
          minWidth: 100,
          render(h, params) {
            let text = v.formValidate.country.filter((i) => {
              if (i.twoCode === params.row.buyerCountryCode) {
                return i;
              }
            })[0].cnName;
            return h("span", {}, text);
          },
        },
        {
          title: "物流方式",
          key: "merchantShippingMethodId",
          minWidth: 100,
          align: "center",
          render: (h, params) => {
            if (params.row.carrierName === null || params.row.carrierName === "") {
              return "";
            } else {
              return h(
                "div",
                params.row.carrierName + " > " + params.row.carrierShippingMethodName
              );
            }
          },
        },
        {
          title: "SKU数量",
          align: "center",
          key: "skuQuantity",
          width: 90,
        },
        {
          title: "物品数量",
          align: "center",
          key: "productQuantity",
          width: 90,
        },
        {
          title: "付款时间",
          align: "center",
          key: "payTime",
          width: 100,
          render: (h, params) => {
            return h(
              "span",
              self.$uDate.getDataToLocalTime(params.row.payTime, "fulltime")
            );
          },
        },
        {
          title: "LAPA状态",
          align: "center",
          key: "ttStatus",
          width: 100,
          render(h, params) {
            /* let text = params.row.trackingNumberStatus === '1' ? '等待下单' : params.row.ttStatus === '2' ? '下单中' : params.row.ttStatus === '3' ? '下单成功' : '下单失败'; */
            // let list = v.$common.arrayToObj(v.cognateSku);
            // let data = list[params.row.ttStatus] || {};
            let text = params.row.ttStatus;
            // let trackingNumberFailReason = params.row.trackingNumberFailReason || "";
            // let status = params.row.ttStatus === "下单失败";
            return h("div", {}, [
              h(
                "span",
                // {
                //   style: {
                //     color: (() => {
                //       // return status ? "red" : "";
                //     })(),
                //   },
                // },
                text,
              ),
              // h(
              //   "Tooltip",
              //   {
              //     props: {
              //       content: trackingNumberFailReason,
              //       transfer: true,
              //       maxWidth: 250,
              //     },
              //   },
              //   [
              //     // !status ||
              //     h("Icon", {
              //       props: {
              //         type: "md-help-circle",
              //       },
              //     }),
              //   ]
              // ),
            ]);
          },
        },
        {
          title: "运单号",
          key: "trackingNumber",
          align: "center",
          width: 120,
        },
        {
          title: "物流下单成功时间",
          key: "trackingNumberTime",
          align: "center",
          width: 140,
          render: (h, params) => {
            return h(
              "span",
              self.$uDate.getDataToLocalTime(params.row.trackingNumberTime, "fulltime")
            );
          },
        },
        {
          title: "供应商发货时间",
          // key: 'despatchTime',
          width: 140,
          align: "center",
          render: (h, params) => {
            // return h('span', self.$uDate.getDataToLocalTime(params.row.despatchTime, 'fulltime'));
            return h(
              "span",
              self.$uDate.getDataToLocalTime(params.row.ymsShipedTime, "fulltime")
            );
          },
        },
        {
          title: "操作",
          align: "center",
          width: 110,
          render: (h, params) => {
            // let text = params.row.ttStatus;
            return h("div", [
              !v.getPermission("wmsPicking_queryOutstoreSalesPackageDetail") ||
              h(
                "Button",
                {
                  props: {
                    size: "small",
                  },
                  on: {
                    click: () => {
                      v.pickingNo = params.row.packageCode;
                      v.workType = "sellStock";
                      v.workShow = "detail";
                      v.ttStatus = params.row.ttStatus;
                      v.activePackageId = params.row.packageId;
                      /* this.detailModal = true;
                   this.detailModalStatus = true;
                   this.rowData = params.row;
                   this.getDetailData(params.row.packageCode); */
                    },
                  },
                },
                "查看详情"
              ),
            ]);
          },
        },
      ],
      inboundData: [],
      data1: [],
      detailModal: false,
      detailModalStatus: false,
      rowData: [], // 当前行数据
      wareId: "",
      checkedDate: [],
      payTimeArr: [],
      clearAble: true,
      exportParams: {},
      selectTypeList: [
        {
          value: "order",
          name: "订单号",
        },
        {
          value: "outbound",
          name: "出库单号",
        },
        {
          value: "sku",
          name: "LAPA SKU",
        },
      ],
    };
  },
  created() {
    this.getCountrys();
    // this.getShippingList().then(() => {
    this.getList();
    // });
  },
  methods: {
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.upDown = type;
      this.pageParams.orderBy = feild;
      this.search();
    },
    resetDate() {
      // 重置创建时间
      this.pageParams.createdTime = [];
    },
    orderResetDate() {
      // 重置物流下单成功时间
      let v = this;
      v.pageParams.startTrackingNumberTime = "";
      v.pageParams.endTrackingNumberTime = "";
    },
    despatchResetDate() {
      // 重置供应商发货时间
      this.pageParams.startDespatchTime = "";
      this.pageParams.endDespatchTime = "";
    },
    getOrderDateValue(value) {
      // 获取下单成功的时间
      var v = this;
      if (value[0] !== "") {
        v.pageParams.startTrackingNumberTime = v.$uDate.getUniversalTime(
          new Date(value[0]).getTime(),
          "fulltime"
        );
        v.pageParams.endTrackingNumberTime = v.$uDate.getUniversalTime(
          new Date(value[1]).getTime(),
          "fulltime"
        );
      }
    },
    getDespatchDateValue(value) {
      // 获取供应商发货时间
      var v = this;
      if (value[0] !== "") {
        v.pageParams.startDespatchTime = v.$uDate.getUniversalTime(
          new Date(value[0]).getTime(),
          "fulltime"
        );
        v.pageParams.endDespatchTime = v.$uDate.getUniversalTime(
          new Date(value[1]).getTime(),
          "fulltime"
        );
      }
    },
    paramsFn() {
      let param = this.$common.copy(this.pageParams);
      param.orderSeq = this.pageParams.upDown === "up" ? "ASC" : "DESC";
      // 获取批量查询订单号、出库单号、sku的数据
      if (this.selectType === "order") {
        param.specifiedPackageCodeList = [];
        param.specifiedSkuList = [];
        param.specifiedOrderNoList = this.textareaList === "" ? [] : this.sepCommasFn(this.textareaList);
      } else if (this.selectType === "outbound") {
        param.specifiedSkuList = [];
        param.specifiedOrderNoList = [];
        param.specifiedPackageCodeList = this.textareaList === "" ? [] : this.sepCommasFn(this.textareaList);
      } else if (this.selectType === "sku") {
        param.specifiedOrderNoList = [];
        param.specifiedPackageCodeList = [];
        param.specifiedSkuList = this.textareaList === "" ? [] : this.sepCommasFn(this.textareaList);
      }
      if (!this.$common.isEmpty(param.createdTime) && !this.$common.isEmpty(param.createdTime[0])) {
        param.startCreatedTime = this.$uDate.getUniversalTime(new Date(param.createdTime[0]).getTime(), "fulltime");
        param.endCreatedTime = this.$uDate.getUniversalTime(new Date(param.createdTime[1]).getTime(), "fulltime");
      }
      delete param.shippingList;
      return param;
    },
    exportAllOrSlt(name) {
      // 导出
      let obj = this.$common.isEmpty(this.exportParams) ? this.paramsFn() : this.exportParams;
      if (name === "0") {
        // 选中
        if (this.checkedDate.length === 0) {
          this.$Message.warning("请选择导出数据");
          return;
        }
        obj.packageIds = this.checkedDate.map((val) => val.packageId);
      } else {
        // 所有
        if (this.data1.length === 0) {
          this.$Message.warning({
            content: "无数据导出",
            duration: 5,
          });
          return;
        }
        // if (this.pageParams.ttStatus !== "6") {
        //   obj.trackingNumberStatus = this.pageParams.ttStatus;
        // } else {
        //   obj.packageProcessStatus = ["5"];
        // }
      }
      obj.packageExportWarehouseType = "packageExportWarehouseYms"; // yms云仓导出多加这个上来，做一下区分
      this.exportFn(obj);
    },
    exportFn(obj) {
      this.axios.post(api.export_package, obj).then((res) => {
        if (res.data.code === 0) {
          this.$Message.success("导出成功");
        }
      });
    },
    changePage(page) {
      // 分页切换
      let v = this;
      v.pageParams.pageNum = page;
      v.curPage = page;
      v.getList();
    },
    changePageSize(pageSize, plat) {
      this.pageParams.pageSize = pageSize;
      this.getList();
    },
    checkedDateMt(data) {
      this.checkedDate = data;
    },
    // getShippingList() {
    //   let v = this;
    //   let id = v.getWarehouseId();
    //   return new Promise((resolve) => {
    //     v.axios
    //       .get(
    //         api.carrierServiceCommon +
    //         api.get_queryBindingShippingMethods +
    //         "?warehouseId=" +
    //         id
    //       )
    //       .then((res) => {
    //         if (res.data.code === 0) {
    //           v.shipList = (res.data.datas || []).map(k => {
    //             return {
    //               ...k,
    //               id: k.shippingMethodId,
    //               label: k.carrierShippingMethodName,
    //             }
    //           })
    //         }
    //         resolve();
    //       })
    //       .catch(() => {
    //         resolve();
    //       });
    //   });
    // },
    // changeCognateStatus(val) {
    //   let v = this;
    //   v.cognateSku.forEach((n, i) => {
    //     n.checked = n.value === val;
    //   });
    //   if (val === "null") {
    //     v.pageParams.ttStatus = null;
    //   } else {
    //     v.pageParams.ttStatus = val;
    //   }
    // },
    // changeSynchronizationStatus(val) {
    //   // 同步状态
    //   let v = this;
    //   v.SynchronizationStatus.forEach((n, i) => {
    //     n.checked = n.value === val;
    //   });
    //   if (val === "null") {
    //     v.pageParams.carrierSendStatus = null;
    //   } else {
    //     v.pageParams.carrierSendStatus = val;
    //   }
    // },
    search() {
      // 查询
      let v = this;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
      v.getList();
    },
    getList() {
      let v = this;
      if (!v.getPermission("packageInfo_outstoreQuery")) {
        v.gotoError();
      }
      const searchParams = this.paramsFn();
      this.exportParams = searchParams;
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(api.cloudInfoOutstoreQuery, searchParams).then((response) => {
        v.SearchDisabled = false;
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            let pos = data.list;
            let merchantShippingMethodIdPos = [];
            if (pos.length > 0) {
              merchantShippingMethodIdPos = pos.map((i) => i.merchantShippingMethodId);
              v.axios.post(api.queryCarrierShippingName, JSON.stringify(merchantShippingMethodIdPos)).then((response) => {
                if (response.data.code === 0) {
                  if (response.data.datas.length > 0) {
                    response.data.datas.forEach((n, i) => {
                      pos.forEach((m, t) => {
                        if (m.merchantShippingMethodId === n.shippingMethodId) {
                          m.carrierName = n.carrierName;
                          m.carrierShippingMethodName = n.carrierShippingMethodName;
                        }
                      });
                    });
                    v.data1 = pos;
                  }
                }
                v.TableLoading = false;
              }).catch(() => {
                v.TableLoading = false;
              });
            } else {
              v.data1 = [];
              v.TableLoading = false;
            }
            v.$nextTick(function () {
              v.total = Number(data.total);
              v.totalPage = Number(data.pages);
            });
          } else {
            v.TableLoading = false;
          }
        } else {
          v.TableLoading = false;
        }
      }).catch(() => {
        v.TableLoading = false;
      });
    },
    getDetailData(id) {
      // 获取详情数据
      let v = this;
      let obj = {
        pickingNo: id,
        warehouseId: v.getWarehouseId(),
      };
      v.TableLoading = true;
      v.axios.post(api.queryOutstoreSalesPackageDetail, obj).then((response) => {
        v.TableLoading = false;
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.detailData = data.wmsFbaReceiptDetails;
        }
      });
    },
    selectValue(value) {
      this.textareaList = "";
    },
    // 重置搜索条件
    resetFilter() {
      this.payTimeArr = [];
      this.$refs['pageParams'].resetFields();
      this.orderResetDate();
      this.despatchResetDate();
      this.textareaList = "";
      this.selectType = "order";
      this.pageParams.createdTime = [
        this.$common.dayjs().add(-7, 'day').format('YYYY-MM-DD HH:mm:ss'),
        this.$common.dayjs().format('YYYY-MM-DD HH:mm:ss')
      ];
    },
    ShipmentStatusBtn(data) {
      // 操作同步发货状态
      let v = this;
      v.pageParams.orderSeq = v.pageParams.upDown === "up" ? "ASC" : "DESC";
      v.pageParams.packageIds = data.map((i) => {
        return i.packageId;
      });
      if (v.pageParams.packageIds.length === 0) {
        v.$Message.error("未选择数据");
        return;
      }
      v.axios
        .put(api.put_CloudPackageStatusAll, v.pageParams)
        .then((res) => {
          if (res.data.code === 0) {
            v.$Message.success("操作成功");
            v.pageParams.packageIds = [];
            v.getList();
          }
        })
        .catch(() => { });
    },
    ShipmentStatusAllBtn() {
      // 批量同步发货状态
      let v = this;
      v.pageParams.orderSeq = v.pageParams.upDown === "up" ? "ASC" : "DESC";
      v.pageParams.packageIds = [];
      v.axios.put(api.put_CloudPackageStatusAll, v.pageParams).then((res) => {
        if (res.data.code === 0) {
          v.$Message.success("操作成功");
          v.getList();
        }
      });
    },
    shippingChange(data) {
      this.pageParams.merchantCarrierIdList = data.carrierId;
      this.pageParams.merchantShippingMethodIdList = data.shippingMethodId;
    },
  },
};
</script>

<style lang="less" scoped>
.container {
  padding-left: 12px;
}

.sort {
  margin: 12px 0;
}

.max_lable {
  :deep(.ivu-form-item) {
    .ivu-form-item-label {
      width: 100px !important;
    }

    .ivu-form-item-content {
      margin-left: 100px !important;
    }
  }
}

.selectStyle {
  width: 90px;

  :deep(.ivu-select-selected-value) {
    font-size: 12px;
  }
}

.table-header-btn {
  :deep(.ivu-card-body) {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
<!-- <style>
.ivu-tooltip-inner {
  white-space: normal !important;
}
</style> -->
