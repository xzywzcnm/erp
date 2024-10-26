<template>
  <div class="mainBox perfectPage">
    <Card shadow class="card-self-style">
      <div class="list-page">
        <div class="resetIvu">
          <div class="mb10">
            <Dropdown>
              <Button type="primary" @click="btnsHandel(2)">
                批量指派图片处理
                <Icon type="ios-arrow-down"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem @click.native="btnsHandel(3)">批量指派文案编辑</DropdownItem>
                <DropdownItem @click.native="btnsHandel(1)">批量指派取样</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown class="ml20">
              <Button type="primary" @click="btnsHandel(6)">
                批量领取图片处理
                <Icon type="ios-arrow-down"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem @click.native="btnsHandel(7)">批量领取文案编辑</DropdownItem>
                <DropdownItem @click.native="btnsHandel(8)">批量领取取样</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown class="ml20"><Button type="primary" @click="btnsHandel(4)">
                试卖
                <Icon type="ios-arrow-down"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem @click.native="btnsHandel(5)">确认销售</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <Form ref="allListFormValidate" class="formSearch" :model="allListFormValidate" inline :label-width="90">
            <dyt-filter :filter-row="1">
              <FormItem label="图片状态">
                <dyt-select v-model="allListFormValidate.pictureStatus">
                  <Option v-for="item in imgStateList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </dyt-select>
              </FormItem>
              <FormItem label="时间状态" class="self-width">
                <div style="display:flex;align-items:flex-start;">
                  <dyt-select v-model="allListFormValidate.timeStatus" style="width: 120px;" @on-change="searchProduct">
                    <Option v-for="item in timeStateList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                  </dyt-select>
                  <Date-picker type="datetimerange" style="width: 280px" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end" placeholder="请选择日期" v-model="payTimeArr">
                  </Date-picker>
                </div>
              </FormItem>
              <FormItem label="取样状态">
                <dyt-select v-model="allListFormValidate.productStatus" @on-change="searchProduct">
                  <Option v-for="item in productStatusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </dyt-select>
              </FormItem>
              <FormItem label="描述状态">
                <dyt-select v-model="allListFormValidate.descriptionStatus" @on-change="searchProduct">
                  <Option v-for="item in describeStateList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </dyt-select>
              </FormItem>
              <FormItem>
                <label slot="label" class="label-select">
                  <dyt-select v-model="productIdIdOrCode" @on-change="productIdChange">
                    <Option v-for="item in productIdList" :key="item.value" :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </label>
                <dyt-input v-show="productIdIdOrCode === 0" v-model.trim="allListFormValidate.productIds"></dyt-input>
                <dyt-inputTag v-if="productIdIdOrCode === 1" v-model="allListFormValidate.productCode" :string="true" :limit="1" type="textarea" />
                <dyt-input v-show="productIdIdOrCode === 2" v-model.trim="allListFormValidate.productName"></dyt-input>
              </FormItem>
              <FormItem label="产品分类" class="self-width">
                <span style="
                    position: relative;
                    display: inline-block;
                    line-height: 20px;
                  ">
                  {{ productTypeName}}
                  <Icon class="ml5 del" v-if="allListFormValidate.productType && allListFormValidate.productType.length > 0" type="close-circled" @click.native="resetProductType"></Icon>
                  <Button :class="{typeTop:allListFormValidate.productType && allListFormValidate.productType.length > 0 }" class="productTypeBtn" type="primary" size="small" @click="showProcuct">
                    <span v-if="allListFormValidate.productType">
                      <span v-if="allListFormValidate.productType && allListFormValidate.productType.length == 0">选择产品类型</span>
                      <span v-else>重新选择</span>
                    </span>
                    <span v-else>选择产品类型</span>
                  </Button>
                </span>
              </FormItem>
              <FormItem label="创建人">
                <dyt-select v-model="allListFormValidate.createdBy">
                  <Option v-for="(item, index) in purchaserArr" :value="item.userId" :key="index" :label="item.userName">{{ item.userName }}</Option>
                </dyt-select>
              </FormItem>
              <div slot="operation">
                <Button type="primary" @click="searchProduct" icon="search" class="mr10">搜索</Button>
                <Button @click="resetSearch" icon="refresh">重置</Button>
              </div>
            </dyt-filter>
          </Form>
          <div>
            <filterColumns :columns="haveDoneTableColumns" :filterName="filterName" @setTableColumns="setTableColumns" style="position:relative;width:auto;text-align:right;bottom:0;height:24px;right:0;"></filterColumns>
          </div>
        </div>
        <div class="table-main mt10">
          <div :class="['table-list',tableClass]">
            <keep-alive>
              <Table :columns=" filterHaveDoneTableColumns" :data="haveDoneDate" :height="tableHeight" :loading="tableLoading" highlight-row @on-selection-change="tableSelection">
              </Table>
            </keep-alive>
          </div>
          <div class="table-page">
            <div class="table-page-right">
              <Page :total="total" @on-change="changePage" show-total :page-size="allListFormValidate.pageSize" show-elevator :current="allListFormValidate.pageNum" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray" :transfer="true">
              </Page>
            </div>
          </div>
        </div>
      </div>
    </Card>
    <Modal v-model="imgModal" class="clearMarginAuto" ref="imgModal" title="图片">
      <p slot="header" @mousedown="moveMt" class="moveHead" @dblclick="fullscreenImgModal">
        <span>图片</span>
        <Icon type="qr-scanner" style="
              position: absolute;
              right: 40px;
              top: 16px;
              color: #999;
              z-index: 99;
              cursor: pointer;
            " size="18" @click="fullscreenImgModal"></Icon>
      </p>
      <div>
        <img width="100%" :src="imgUrl" />
      </div>
    </Modal>
    <commonMessage ref="commonMessage" :params="commonMessageParams" @getList="getList" @closeGetList="closeGetList"></commonMessage>
    <commonAssigned ref="commonAssigned" @closeGetList="getList" :productSubmitParams="productSubmitParams"></commonAssigned>
    <commonRepulse ref="commonRepulse" @closeGetList="getList" :productSubmitParams="productSubmitParams"></commonRepulse>
    <commonTransfer ref="commonTransfer" @closeGetList="getList" :productSubmitParams="productSubmitParams"></commonTransfer>
    <pruductType ref="pruductType" @addProductType="addProductType"></pruductType>
    <!--试卖、确认销售的确认弹窗-->
    <Modal v-model="confirmTalg" :mask-closable="false" :title="confirmTxt" class="confirm" @on-ok="saveConfirm" @on-visible-change="visibleChange">
      <div class="content">
        <Icon class="icon_tips" type="md-alert" />
        <span class="confirmModal_style">{{ confirmText }}</span>
      </div>
    </Modal>
  </div>
</template>

<script>
import commonMixix from "../../../components/mixin/commonMixin";
import commonMessage from "../common/demand";
import commonAssigned from "../../pds/stockUp/commonAssigned"; // 指派弹窗
import commonRepulse from "./commonRepulse"; // 打回弹窗
import commonTransfer from "./commonTransfer"; // 转交弹窗
import filterColumns from "../common/filterColumns"; // 列筛选
import pruductType from "./productType";
import api from "@/api/api";
import table_highly_adaptive from '@/components/mixin/table_highly_adaptive';

export default {
  name: "perfect", // 完善产品资料
  mixins: [commonMixix, table_highly_adaptive],
  components: {
    pruductType,
    commonMessage,
    commonAssigned,
    commonRepulse,
    commonTransfer,
    filterColumns
  },
  data () {
    let v = this;
    var end = new Date();
    var start = new Date();
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
    return {
      confirmTalg: false,
      confirmText: "",
      confirmNum: null,
      confirmTxt: "",
      productName: [],
      productTypeName: "",
      productIdIdOrCode: 0,
      productIdList: [
        {
          label: "需求ID",
          value: 0
        },
        {
          label: "sku",
          value: 1
        },
        {
          label: "商品名称",
          value: 2
        }
      ],
      imgUrl: "",
      filterName: "perfectColumns",
      filterHaveDoneTableColumns: [],
      tableLoading: false,
      payTimeArr: [start, end],
      totalPage: 0,
      total: 0,
      curPage: 1,
      commonMessageParams: {},
      productSubmitParams: {},
      inquiryStateList: [
        {
          value: 0,
          label: "待提交需求"
        },
        {
          value: 1,
          label: "待审核需求"
        },
        {
          value: 2,
          label: "待分配询价"
        },
        {
          value: 3,
          label: "待完成询价"
        },
        {
          value: 4,
          label: "待审核询价"
        },
        {
          value: 5,
          label: "待生成sku"
        },
        {
          value: 6,
          label: "已生成sku"
        }
      ],
      saleStateList: [
        {
          value: 0,
          label: "待试卖"
        },
        {
          value: 1,
          label: "试卖"
        }, /* {         value: 2,
         label: '待确认销售'
         }, */
        {
          value: 3,
          label: "确认销售"
        }
      ],
      imgStateList: [
        {
          value: 0,
          label: "待分配"
        },
        {
          value: 1,
          label: "待处理"
        },
        {
          value: 2,
          label: "待审核"
        },
        {
          value: 3,
          label: "已完成"
        }
      ],
      checkedItem: [],
      samplingStateList: [
        {
          value: 0,
          label: "待分配取样"
        },
        {
          value: 1,
          label: "已取样"
        }
      ],
      describeStateList: [
        {
          value: 0,
          label: "待分配"
        },
        {
          value: 1,
          label: "待处理"
        },
        {
          value: 2,
          label: "待审核"
        },
        {
          value: 3,
          label: "已完成"
        }
      ],
      productStatusList: [
        {
          value: 0,
          label: "待分配"
        },
        {
          value: 1,
          label: "待处理"
        },
        {
          value: 2,
          label: "待审核"
        },
        {
          value: 3,
          label: "已完成"
        }
      ],
      imgModal: false,
      haveDoneTableColumns: [
        {
          type: "selection",
          width: 40,
          align: "center"
        },
        {
          key: "enableFlag",
          align: "center",
          title: "操作",
          width: 100,
          render: (h, params) => {
            let productStatus = params.row.productStatus; // 取样状态 0 待分配 1 待处理  2 待审核 3 已完成
            let pictureStatus = params.row.pictureStatus; // 处理图片状态 0 待分配 1 待处理  2 待审核 3 已完成
            let descriptionStatus = params.row.descriptionStatus; // 处理描述状态 0 待分配 1 待处理  2 待审核 3 已完成
            return h("local-down-button", {
              props: {
                data: {
                  btn: {
                    text: "查看",
                    clickFn: () => {
                      v.lookMethod(params);
                    }
                  },
                  list: [
                    {
                      text: "编辑",
                      value: 5,
                      hide: (() =>
                        !(
                          productStatus === 0 ||
                          pictureStatus === 0 ||
                          descriptionStatus === 0
                        ))(),
                      clickFn: () => {
                        v.editPerfect(params);
                      }
                    },
                    {
                      text: "指派取样",
                      value: 2,
                      disabled: (() =>
                        productStatus !== 0 && productStatus !== 3)(),
                      clickFn: () => {
                        if (productStatus === 0 || productStatus === 3) {
                          v.checkAssignPermissionMt(
                            "LC0003",
                            v.sampling,
                            params
                          );
                        }
                      }
                    },
                    {
                      text: "指派图片处理",
                      value: 1,
                      disabled: (() =>
                        pictureStatus !== 0 && pictureStatus !== 3)(),
                      clickFn: () => {
                        if (pictureStatus === 0 || pictureStatus === 3) {
                          v.checkAssignPermissionMt(
                            "LC0002",
                            v.imgProcess,
                            params
                          );
                        }
                      }
                    },
                    {
                      text: "指派描述处理",
                      value: 3,
                      disabled: (() =>
                        descriptionStatus !== 0 && descriptionStatus !== 3)(),
                      clickFn: () => {
                        if (
                          descriptionStatus === 0 ||
                          descriptionStatus === 3
                        ) {
                          v.checkAssignPermissionMt(
                            "LC0004",
                            v.descProcess,
                            params
                          );
                        }
                      }
                    },
                    {
                      text: "删除",
                      value: 4,
                      clickFn: () => {
                        v.getUserIsDelAuth().then(() => {
                          // 判断有权限之后再调用
                          v.$Modal.confirm({
                            title: "温馨提示",
                            content:
                              "<p>删除之后将会此spu的待办任务，确定是否需要删除?</p>",
                            onOk: () => {
                              let fromNodeId = "";
                              let flowInstanceId = "";
                              params.row.flowTodoInfoList.forEach((item) => {
                                if (item.flowId === "LC0001") {
                                  fromNodeId = item.fromNodeId;
                                  flowInstanceId = item.flowInstanceId;
                                }
                              });
                              v.$axios
                                .post(api.setInvalid, {
                                  productId: params.row.productId, // 新品需求ID，必需
                                  fromNodeId: fromNodeId,
                                  flowInstanceId: flowInstanceId // 流程实例ID，必需
                                })
                                .then((res) => {
                                  if (res.code === 0) {
                                    v.$msg.success("操作成功");
                                    v.getList();
                                  }
                                })
                                .catch(() => { });
                            },
                            onCancel: () => { }
                          });
                        });
                      }
                    }
                  ]
                }
              }
            });
          }
        },
        {
          key: "productId",
          align: "center",
          minWidth: 160,
          filterHide: true,
          title: "ID"
        },
        {
          key: "pictureUrl",
          align: "center",
          title: "图片",
          minWidth: 80,
          render (h, params) {
            return v.tableImg(h, params);
          }
        },
        {
          key: "productName",
          align: "left",
          minWidth: 120,
          title: "商品名称",
          render (h, params) {
            if (
              params.row.productName === undefined ||
              params.row.productName === null ||
              params.row.productName === ""
            ) {
              return h("div", "无数据");
            } else {
              return h(
                "div",
                {
                  class: "line2",
                  attrs: {
                    title: params.row.productName
                  }
                },
                params.row.productName
              );
            }
          }
        },
        {
          key: "referenceUrl",
          align: "center",
          title: "参考链接",
          filterHide: true,
          minWidth: 120,
          render (h, params) {
            if (
              params.row.referenceUrl === undefined ||
              params.row.referenceUrl === null ||
              params.row.referenceUrl === ""
            ) {
              return h("div", "无数据");
            } else {
              return h(
                "a",
                {
                  class: "line2",
                  attrs: {
                    href: params.row.referenceUrl,
                    title: params.row.referenceUrl,
                    target: "_blank"
                  }
                },
                params.row.referenceUrl
              );
            }
          }
        },
        {
          key: "productType",
          align: "left",
          minWidth: 120,
          title: "产品分类",
          render (h, params) {
            if (
              params.row.productTypeName === undefined ||
              params.row.productTypeName === null ||
              params.row.productTypeName === ""
            ) {
              return h("div", "无数据");
            } else {
              return h(
                "div",
                {
                  class: "line2",
                  attrs: {
                    title: params.row.productTypeName
                  }
                },
                params.row.productTypeName
              );
            }
          }
        },
        {
          key: "saleChannel",
          align: "left",
          minWidth: 120,
          title: "渠道/站点",
          filterHide: true,
          render (h, params) {
            let saleChannel = "";
            let stationName = "";
            if (
              params.row.saleChannel === undefined ||
              params.row.saleChannel === null ||
              params.row.saleChannel === ""
            ) {
              saleChannel = "无数据";
            } else {
              saleChannel = params.row.saleChannel;
            }
            if (
              params.row.stationName === undefined ||
              params.row.stationName === null ||
              params.row.stationName === ""
            ) {
              stationName = "无数据";
            } else {
              stationName = params.row.stationName;
            }
            return h("div", {}, saleChannel + "/" + stationName);
          }
        },
        {
          key: "assignStatus",
          align: "left",
          minWidth: 120,
          title: "状态",
          filterHide: true,
          render (h, params) {
            return v.setAssignStatus(h, params);
          }
        },
        {
          key: "productStatus",
          align: "center",
          minWidth: 160,
          title: "产品资料状态",
          render (h, params) {
            return h(
              "div",
              {
                style: "padding:5px 0;"
              },
              [
                h("p", {
                  domProps: {
                    innerHTML: (function () {
                      let str =
                        "取样" +
                        ":" +
                        v.setRequireSubBy(params.row.productStatus);
                      return str;
                    })()
                  }
                }),
                h("p", {
                  domProps: {
                    innerHTML: (function () {
                      let str =
                        "图片" +
                        ":" +
                        v.setRequireSubBy(params.row.pictureStatus);
                      return str;
                    })()
                  }
                }),
                h("p", {
                  domProps: {
                    innerHTML: (function () {
                      let str =
                        "描述" +
                        ":" +
                        v.setRequireSubBy(params.row.descriptionStatus);
                      return str;
                    })()
                  }
                })
              ]
            );
          }
        },
        {
          key: "productCode",
          align: "center",
          minWidth: 160,
          title: "sku",
          filterHide: true,
          render (h, params) {
            if (params.row.productCode == null) {
              return h("div", "未生成");
            } else {
              return h(
                "div",
                {
                  class: "line2",
                  attrs: {
                    title: params.row.productCode
                  }
                },
                params.row.productCode
              );
            }
          }
        },
        {
          key: "requireSubName",
          align: "center",
          minWidth: 150,
          title: "需求创建人",
          render (h, params) {
            let name =
              params.row.requireSubName === null ||
                params.row.requireSubName === ""
                ? "-"
                : params.row.requireSubName;
            return h("div", {}, [
              h("p", "需求创建人" + "：" + name),
              h(
                "p",
                v.getDataToLocalTime(params.row.requireSubTime, "fulltime")
              )
            ]);
          }
        },
        {
          key: "quotationFinishName",
          align: "center",
          minWidth: 120,
          filterHide: true,
          title: "询价人"
        },
        {
          key: "saleStatus",
          align: "center",
          minWidth: 120,
          title: "试卖状态",
          render (h, params) {
            let saleStatus = params.row.saleStatus;
            if (saleStatus == 0) {
              return h("div", "未销售");
            } else if (saleStatus == 1) {
              return h("div", "试卖");
            } else if (saleStatus == 2) {
              return h("div", "确认销售");
            }
          }
        }
      ],
      sortChoseDate: [
        {
          tit: "批量指派取样",
          name: 1
        },
        {
          tit: "批量指派图片处理",
          name: 2
        },
        {
          tit: "批量指派描述处理",
          name: 3
        },
        {
          tit: "试卖",
          name: 4
        },
        {
          tit: "确认销售",
          name: 5
        }
      ],
      allListFormValidate: {
        pageNum: 1,
        pageSize: 10,
        createdBy: null, // 创建人id
        productName: "", // 商品名称
        productCode: "", // sku
        assignStatus: "6", // 询价状态(默认null,0待审核需求，1待分配询价，2待完成询价，3待审核询价，4待生成sku，5已生成sku)
        saleStatus: null, // 销售状态(默认null,0待试卖，1试卖，2待确认销售，3确认销售)
        productStatus: null, // 取样状态(默认null,0待分配取样，1已取样)
        pictureStatus: null, // 图片状态(默认null,0待分配，待处理，2待审核，3已审核)
        descriptionStatus: null, // 描述状态(默认null,0待分配，待处理，2待审核，3已审核)
        timeStatus: "0", // 时间状态(默认null,0待提交需求，1待审核需求，2待分配询价，3待完成询价，4待审核询价，5待生成sku，6已生成sku)
        beginTime: null, // 开始时间
        endTime: null, // 结束时间
        productIds: null, // 需求ID  ["123","456"]
        queryStatus: "2" // 查询状态(0 待办任务,1 已办任务,2 完善产品资料,3 需求管理)
      },
      haveDoneDate: [],
      purchaserArr: []
    };
  },
  created () {
    // window.document.title = "已询价商品管理";
    this.getList();
  },
  beforeMount () { },
  mounted () {
    this.getUserMesCommon().then((result) => {
      if (result) {
        this.purchaserArr = Object.values(this.$store.state.userInfoList);
      }
    });
  },
  methods: {
    getUserIsDelAuth () {
      let v = this;
      return new Promise((resolve) => {
        v.$axios
          .get(api.getSetInvalidPermission)
          .then((res) => {
            if (res.code === 0 && res.datas) {
              resolve();
            } else {
              v.$msg.error("无删除权限");
            }
          })
          .catch(() => { });
      });
    },
    resetProductType () {
      let v = this;
      v.productName = [];
      v.productTypeName = "";
      v.allListFormValidate.productType = "";
    },
    showProcuct () {
      let v = this;
      v.$refs.pruductType.productTypeModel = true;
      v.$refs.pruductType.productName = [];
      this.$refs.pruductType.getProductTypeListMt();
    },
    addProductType (data) {
      let v = this;
      let names = [];
      v.productName = data;
      v.productName.forEach((item) => {
        names.push(item.name);
      });
      v.allListFormValidate.productType =
        v.productName[v.productName.length - 1].categoryId;
      v.productTypeName = names.join("/");
    },
    checkAssignPermissionMt (data, callback, params) {
      // 判断是否有权限指派
      let v = this;
      v.$axios
        .get(api.checkAssignPermission + "?flowId=" + data)
        .then((res) => {
          if (res.code === 0 && res.datas) {
            callback && callback(params);
          } else {
            v.$msg.error({
              content: "无权限指派"
            });
          }
        });
    },
    productIdChange () {
      this.allListFormValidate.productIds = "";
      this.allListFormValidate.productCode = "";
    },
    setTableColumns (data) {
      this.$nextTick(() => {
        this.filterHaveDoneTableColumns = data;
      });
    },
    closeGetList () {
      this.getList();
    },
    getNextTodoInfoByListMt (name, myself) {
      let arr = [];
      let v = this;
      v.checkedItem.forEach((item) => {
        item.flowTodoInfoList.forEach((child) => {
          if (child.flowId === name) {
            if (child.currentNodeId == 0 || child.currentNodeId == 3) {
              arr.push({
                fromNodeId: 0, // 当前节点ID，必需
                flowInstanceId: child.flowInstanceId, // 流程实例ID，必需
                sendType: 0, // 流程发送类别：0提交，1打回上级，2打回发起人，3转交
                productId: child.productId
              });
            }
          }
        });
      });
      if (arr.length === 0) {
        if (name === "LC0002") {
          v.$msg.error({
            content: "请选择图片待分配产品",
            duration: 5
          });
        } else if (name === "LC0003") {
          v.$msg.error({
            content: "请选择取样待分配产品",
            duration: 5
          });
        } else if (name === "LC0004") {
          v.$msg.error({
            content: "请选择描述待分配产品",
            duration: 5
          });
        }
      } else {
        let postApi = myself ? api.batchRecipient : api.getNextTodoInfoByList;
        v.$axios
          .post(postApi, arr)
          .then((res) => {
            if (res.code === 0) {
              if (myself) {
                v.$msg.success("领取成功");
                v.getList();
                return;
              }
              if (arr.length < v.checkedItem.length) {
                v.$msg.info("已指派产品将不会重复指派");
              }
              v.productSubmitParams = res.datas;
              v.productSubmitParams.forEach((item, index) => {
                item.productId = arr[index].productId;
              });
              if (res.datas[0].receiverList.length === 1) {
                v.$refs.commonAssigned.productSubmitParams = v.productSubmitParams;
                v.$refs.commonAssigned.receiverVal = res.datas.receiverList[0].userId;
                v.$refs.commonAssigned.submitParams();
              } else {
                v.$refs.commonAssigned.operating = true;
              }


            } else {
              v.$msg.error({
                content: "找不到流程接收人，请联系管理员进行流程配置",
                duration: 5
              });
            }
          })
          .catch(() => { });
      }
    },
    btnsHandel (name) {
      let v = this;
      if (v.checkedItem.length === 0) {
        v.$msg.error({
          content: "选择为空",
          duration: 5
        });
        return;
      }
      if (name === 1) {
        // 批量取样
        v.checkAssignPermissionMt(
          "LC0003",
          v.getNextTodoInfoByListMt,
          "LC0003"
        );
      } else if (name === 2) {
        // 批量图片
        v.checkAssignPermissionMt(
          "LC0002",
          v.getNextTodoInfoByListMt,
          "LC0002"
        );
      } else if (name === 3) {
        // 批量描述处理
        v.checkAssignPermissionMt(
          "LC0004",
          v.getNextTodoInfoByListMt,
          "LC0004"
        );
      } else if (name === 4) {
        // 试买
        v.confirmTalg = true;
        v.confirmText = "是否确认试卖？";
        v.confirmNum = name;
        v.confirmTxt = "试卖";
      } else if (name === 5) {
        // 确认销售
        v.confirmTalg = true;
        v.confirmText = "是否确认销售？";
        v.confirmNum = name;
        v.confirmTxt = "确认销售";
      } else if (name === 6) {
        // 批量领取 图片
        v.getNextTodoInfoByListMt("LC0002", true);
      } else if (name === 7) {
        // 批量领取 编辑
        v.getNextTodoInfoByListMt("LC0004", true);
      } else if (name === 8) {
        // 批量领取 取样
        v.getNextTodoInfoByListMt("LC0003", true);
      }
    },
    BatchReceive () { },
    tableSelection (a) {
      this.checkedItem = a;
    },
    getNextTodoInfoMt (params, flowId, callback) {
      let data = {
        sendType: 0, // 流程发送类别：0提交，1打回上级，2打回发起人，3转交，4作废
        fromNodeId: 0
      };
      let v = this;
      params.row.flowTodoInfoList.forEach((item) => {
        if (item.flowId === flowId) {
          data.flowInstanceId = item.flowInstanceId;
        }
      });
      v.$store.commit("createId", params.row.productId);
      v.$Spin.show();
      v.$axios
        .post(api.getNextTodoInfo, data)
        .then((res) => {
          v.btnLoading = false;
          v.$Spin.hide();
          if (res.code === 0) {
            v.productSubmitParams = res.datas;
            if (!(res.datas.flowId === 'LC0001' && res.fromNodeId === 4) &&
              res.datas.receiverList.length === 1) {
              v.$refs.commonAssigned.productSubmitParams = res.datas;
              v.$refs.commonAssigned.receiverVal = res.datas.receiverList[0].userId;
              v.$refs.commonAssigned.submitParams();
            } else {
              v.$refs.commonAssigned.operating = true;
            }
            v.createDemand = false;
            callback && callback();
          } else {
            v.$msg.error({
              content: "找不到流程接收人，请联系管理员进行流程配置",
              duration: 5
            });
          }
        })
        .catch(() => {
          v.$Spin.hide();
          v.btnLoading = false;
          v.$msg.error("请求失败");
        });
    },
    imgProcess (params) {
      let v = this;
      v.getNextTodoInfoMt(params, "LC0002");
    },
    sampling (params) {
      let v = this;
      v.getNextTodoInfoMt(params, "LC0003");
    },
    descProcess (params) {
      let v = this;
      v.getNextTodoInfoMt(params, "LC0004");
    },
    lookMethod (params) {
      let v = this;
      v.commonMessageParams = params;
      v.$refs.commonMessage.createDemand = true;
      v.$store.commit("createId", params.row.productId);
      v.$store.commit("flowInstance", params.row.flowTodoInfoList); // 流程信息
    },
    editPerfect (params) {
      let v = this;
      v.setDataStutas(params).then((res) => {
        v.$store.commit("curNodeControl", 999);
        v.lookMethod(res);
      });
    },
    setDataStutas (data) {
      // 设置为可编辑状态;
      return new Promise((resolve) => {
        let params = JSON.parse(JSON.stringify(data));
        // 设置流程
        params.row.flowTodoInfoList.forEach((i) => {
          if (i.flowId !== "LC0001" && i.currentNodeId === 0) {
            i.currentNodeId = 1;
          }
        });
        // 设置row里面图片、取样、描述流程
        params.row.productStatus =
          params.row.productStatus === 0 ? 1 : params.row.productStatus;
        params.row.pictureStatus =
          params.row.pictureStatus === 0 ? 1 : params.row.pictureStatus;
        params.row.descriptionStatus =
          params.row.descriptionStatus === 0 ? 1 : params.row.descriptionStatus;
        resolve(params);
      });
    },
    backMt (params) {
      let v = this;
      let data = {
        fromNodeId: params.row.flowTodoInfoList[0].currentNodeId, // 当前节点ID，必需
        flowInstanceId: params.row.flowTodoInfoList[0].flowInstanceId, // 流程实例ID，必需
        sendType: 1 // 流程发送类别：0提交，1打回上级，2打回发起人，3转交，4作废
      };
      v.$Spin.show();
      v.$axios
        .post(api.getNextTodoInfo, data)
        .then((res) => {
          v.$Spin.hide();
          if (res.code === 0) {
            v.productSubmitParams = res.datas;
            v.$refs.commonRepulse.operating = true;
            v.$refs.commonRepulse.$refs.operatingFrom.resetFields();
            v.getList();
          } else {
            v.$msg.error({
              content: "找不到流程接收人，请联系管理员进行流程配置",
              duration: 5
            });
          }
        })
        .catch(() => {
          v.$Spin.hide();
          v.$msg.error("请求失败");
        });
    },
    searchProduct () {
      let v = this;
      v.allListFormValidate.pageNum = 1;
      v.allListFormValidate.pageSize = 10;
      v.getList();
    },
    changePage (page) {
      let v = this;
      v.allListFormValidate.pageNum = page;
      v.getList();
    },
    changePageSize (val) {
      this.allListFormValidate.pageSize = +val;
      if (val !== undefined) {
        localStorage.setItem("pageSize", val);
      }
      this.getList();
    },
    getList () {
      let v = this;
      if (localStorage.getItem("pageSize")) {
        v.allListFormValidate.pageSize = +localStorage.getItem("pageSize");
      }
      let params = v.setNull(v.allListFormValidate);
      if (params.productIds !== null) {
        params.productIds = [params.productIds];
      }
      params.assignStatus = "6"; // 待完善产品资料必须
      if (v.payTimeArr !== "" && v.payTimeArr[0] !== "") {
        params.beginTime = v.getUniversalTime(
          new Date(v.payTimeArr[0]).getTime(),
          "fulltime"
        );
        params.endTime = v.getUniversalTime(
          new Date(v.payTimeArr[1]).getTime(),
          "fulltime"
        );
      }
      v.tableLoading = true;
      v.$axios
        .post(api.taskList, params)
        .then((res) => {
          v.tableLoading = false;
          if (res.code === 0) {
            if (res.datas === null) {
              v.haveDoneDate = [];
              v.total = 0;
            } else {
              v.haveDoneDate = res.datas.list;
              v.total = res.datas.total;
              v.checkedItem = [];
            }
          }
        })
        .catch(() => {
          v.tableLoading = false;
        });
    },
    resetSearch () {
      let v = this;
      for (let key in v.allListFormValidate) {
        v.allListFormValidate[key] = null;
      }
      v.payTimeArr = "";
      v.productTypeName = "";
      v.allListFormValidate.pageNum = 1;
      v.allListFormValidate.pageSize = 10;
      v.allListFormValidate.queryStatus = 2;
      v.getList();
    },
    // 确认弹窗的确认按钮
    saveConfirm () {
      // 试卖
      let v = this;
      let params = [];
      if (this.confirmNum === 4) {
        v.checkedItem.forEach((item) => {
          params.push(item.productId);
        });
        v.$axios
          .post(api.saleAudit, params)
          .then((res) => {
            if (res.code === 0) {
              v.$axios.post(api.sendProductInfoToErpByBatch, {
                productIds: params,
                sendType: "sale"
              });
              v.$axios.post(api.sendProductInfoToListingByBatch, {
                productIds: params,
                sendType: "sale"
              });
              v.$msg.success("完成试卖");
              v.getList();
            } else {
              v.$msg.error("试卖失败");
            }
          })
          .catch(() => { });
      }
      // 确认销售
      else if (this.confirmNum === 5) {
        v.checkedItem.forEach((item) => {
          params.push(item.productId);
        });
        v.$axios
          .post(api.confirmationSales, params)
          .then((res) => {
            if (res.code === 0) {
              v.$axios.post(api.sendProductInfoToErpByBatch, {
                productIds: params,
                sendType: "sale"
              });
              v.$axios.post(api.sendProductInfoToListingByBatch, {
                productIds: params,
                sendType: "sale"
              });
              v.$msg.success("已确认销售");
              v.getList();
            } else {
              v.$msg.error("确认销售失败");
            }
          })
          .catch(() => { });
      }
    },
    // 监听确认弹窗的变化
    visibleChange (val) {
      if (!val) {
        this.confirmTalg = false;
        this.confirmText = "";
        this.confirmNum = null;
        this.confirmTxt = "";
      }
    }
  }
};
</script>

<style scoped>
.del {
  cursor: pointer;
}

.del:hover {
  color: red;
}

.label-select {
  padding: 0px 10px;
  width: 90px;
  position: relative;
  z-index: 10;
  display: inline-block;
  margin-top: -10px;
}
/* .confirm /deep/ .ivu-modal-body {
  height: auto !important;
} */

.confirm :deep(.ivu-modal-body) {
  height: auto !important;
}

.confirm .ivu-modal-body .content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px auto;
}

.confirm .ivu-modal-body .content .icon_tips {
  font-size: 30px;
  color: #2d8cf0;
  margin-right: 6px;
}

.confirm .ivu-modal-body .content .confirmModal_style {
  display: inline-block;
  color: #333;
  font-size: 14px;
}
</style>
<style lang="less">
.perfectPage {
  .label-select .ivu-select {
    width: 100%;
  }
}
</style>
