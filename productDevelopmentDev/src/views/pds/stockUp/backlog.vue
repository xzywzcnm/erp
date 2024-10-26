<template>
  <div class="mainBox">
    <Card shadow class="card-self-style">
      <div class="list-page">
        <div class="resetIvu">
          <Form ref="allListFormValidate" class="formSearch" inline :model="allListFormValidate" :label-width="70">
            <dyt-filter :filter-row="1">
              <FormItem label="询价状态">
                <dyt-select v-model="allListFormValidate.assignStatus" @on-change="searchProduct">
                  <Option v-for="item in inquiryStateList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </dyt-select>
              </FormItem>
              <FormItem label="时间状态" class="self-width">
                <div style="display:flex;align-items:flex-start;">
                  <dyt-select v-model="allListFormValidate.timeStatus" @on-change="searchProduct" style="width: 120px">
                    <Option v-for="item in timeStateList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                  </dyt-select>
                  <Date-picker type="datetimerange" style="width: 280px" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end" placeholder="请选择日期" v-model="payTimeArr" @on-change="changeDateTime" transfer>
                  </Date-picker>
                </div>
              </FormItem>
              <FormItem label="需求ID">
                <dyt-input v-model.trim="allListFormValidate.productIds"></dyt-input>
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
              <Table highlight-row :columns=" filterHaveDoneTableColumns" :height="tableHeight" :data="haveDoneDate" :loading="tableLoading">
              </Table>
            </keep-alive>
          </div>
          <div class="table-page">
            <div class="table-page-right">
              <Page :total="total" @on-change="changePage" show-total :page-size="allListFormValidate.pageSize" show-elevator :current="allListFormValidate.pageNum" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray" :transfer="true"></Page>
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
    <Modal v-model="modal2" :mask-closable="false" class="flowModal" :title="modalTitle">
      <p>
        {{ modalBody }}（<span class="red">如果没有配置好流程，可能无法使用新品开发系统</span>,如有疑问，可咨询LAPA客服）
      </p>
      <div slot="footer">
        <Button type="primary" @click="goFlow">确定</Button>
        <Button type="text" @click="modal2 = false">取消</Button>
      </div>
    </Modal>
    <commonMessage ref="commonMessage" :params="params" @getList="getList"></commonMessage>
    <commonAssigned ref="commonAssigned" @closeGetList="getList" :productSubmitParams="productSubmitParams"></commonAssigned>
    <commonRepulse ref="commonRepulse" @closeGetList="getList" :productSubmitParams="productSubmitParams"></commonRepulse>
    <commonTransfer ref="commonTransfer" @closeGetList="getList" :productSubmitParams="productSubmitParams"></commonTransfer>
  </div>
</template>

<script>
import CommonMixin from "@/components/mixin/commonMixin";
import commonMessage from "../common/demand";
import commonAssigned from "../../pds/stockUp/commonAssigned"; // 指派弹窗
import commonRepulse from "./commonRepulse"; // 打回弹窗
import commonTransfer from "./commonTransfer"; // 转交弹窗
import filterColumns from "../common/filterColumns"; // 列筛选
import api from "@/api/api";
import { mapActions } from "vuex";
import newAddSupplier from "@v/pds/common/newAddSupplier";
import table_highly_adaptive from '@/components/mixin/table_highly_adaptive';

export default {
  name: "backlog", // 待办任务
  mixins: [CommonMixin, table_highly_adaptive],
  components: {
    commonMessage,
    commonAssigned,
    commonRepulse,
    commonTransfer,
    filterColumns,
    // eslint-disable-next-line vue/no-unused-components
    newAddSupplier,
  },
  data () {
    let v = this;
    var end = new Date();
    var start = new Date();
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
    return {
      modal2: false,
      modalTitle: "温馨提示",
      modalBody: "",
      filterName: "backlogColumns",
      tableLoading: false,
      payTimeArr: [start, end],
      imgModal: false,
      imgUrl: "",
      totalPage: 0,
      total: 0,
      curPage: 1,
      productSubmitParams: {},
      allListFormValidate: {
        pageNum: 1,
        pageSize: 10,
        createdBy: null, // 创建人id
        productIds: null, // 需求ID  ["123","456"]
        saleStatus: null, // 销售状态(默认null,0待试卖，1试卖，2待确认销售，3确认销售)
        assignStatus: null, // 询价状态(默认null,0待审核需求，1待分配询价，2待完成询价，3待审核询价，4待生成sku，5已生成sku)
        timeStatus: null, // 时间状态(默认null,0待提交需求，1待审核需求，2待分配询价，3待完成询价，4待审核询价，5待生成sku，6已生成sku)
        beginTime: null, // 开始时间
        endTime: null, // 结束时间
        productStatus: null, // 取样状态(默认null,0待分配取样，1已取样)
        pictureStatus: null, // 图片状态(默认null,0待分配，待处理，2待审核，3已审核)
        descriptionStatus: null, // 描述状态(默认null,0待分配，待处理，2待审核，3已审核)
        queryStatus: "0", // 查询状态(0 待办任务,1 已办任务,2 完善产品资料,3 需求管理)
        receiverId: "201112010000000193", // 暂时固定用户
      },
      imgStateList: [
        {
          value: 0,
          label: "待分配",
        },
        {
          value: 1,
          label: "待处理",
        },
        {
          value: 2,
          label: "待审核",
        },
        {
          value: 3,
          label: "已完成",
        },
      ],
      params: {},
      inquiryStateList: [
        {
          value: 0,
          label: "待提交需求",
        },
        {
          value: 1,
          label: "待审核需求",
        },
        {
          value: 2,
          label: "待分配询价",
        },
        {
          value: 3,
          label: "待完成询价",
        },
        {
          value: 4,
          label: "待审核询价",
        },
        {
          value: 5,
          label: "待生成sku",
        },
        {
          value: 6,
          label: "已生成sku",
        },
      ],
      saleStateList: [
        {
          value: 0,
          label: "待试卖",
        },
        {
          value: 1,
          label: "试卖",
        } /* {         value: 2,
         label: '待确认销售'
         }, */,
        {
          value: 3,
          label: "确认销售",
        },
      ],
      samplingStateList: [
        {
          value: 0,
          label: "待分配取样",
        },
        {
          value: 1,
          label: "已取样",
        },
      ],
      describeStateList: [
        {
          value: 0,
          label: "待分配",
        },
        {
          value: 1,
          label: "待处理",
        },
        {
          value: 2,
          label: "待审核",
        },
        {
          value: 3,
          label: "已完成",
        },
      ],
      filterHaveDoneTableColumns: [],
      haveDoneTableColumns: [
        {
          key: "enableFlag",
          align: "center",
          title: "操作",
          width: 90,
          render: (h, params) => {
            let data = params.row.flowTodoInfoList[0];
            if (
              (data.flowId === "LC0001" && data.currentNodeId === 0) ||
              data.flowId !== "LC0001"
            ) {
              return h(
                "Button",
                {
                  type: "default",
                  class: "trimming",
                  on: {
                    click () {
                      v.lookMethod(params);
                    },
                  },
                },
                "处理"
              );
            } else {
              return h("local-down-button", {
                props: {
                  data: {
                    btn: {
                      text: "处理",
                      clickFn: () => {
                        v.lookMethod(params);
                      },
                    },
                    list: [
                      {
                        text: "打回",
                        value: 1,
                        disabled: (function () {
                          let data = params.row.flowTodoInfoList[0];
                          if (
                            (data.flowId === "LC0001" &&
                              data.currentNodeId === 0) ||
                            data.flowId !== "LC0001"
                          ) {
                            return true;
                          } else {
                            return false;
                          }
                        })(),
                        clickFn: () => {
                          let data = params.row.flowTodoInfoList[0];
                          if (
                            (data.flowId === "LC0001" &&
                              data.currentNodeId === 0) ||
                            data.flowId !== "LC0001"
                            // eslint-disable-next-line no-empty
                          ) {
                          } else {
                            v.backMt(params);
                          }
                        },
                      },
                      {
                        text: "转交",
                        value: 2,
                        disabled: (function () {
                          let data = params.row.flowTodoInfoList[0];
                          if (
                            (data.flowId === "LC0001" &&
                              data.currentNodeId === 0) ||
                            data.flowId !== "LC0001"
                          ) {
                            return true;
                          } else {
                            return false;
                          }
                        })(),
                        clickFn: () => {
                          let data1 = params.row.flowTodoInfoList[0];
                          if (
                            (data1.flowId === "LC0001" &&
                              data1.currentNodeId === 0) ||
                            data1.flowId !== "LC0001"
                            // eslint-disable-next-line no-empty
                          ) {
                          } else {
                            v.transferMt(params);
                          }
                        },
                      },
                    ],
                  },
                },
              });
              /*  return h('div', [
               h('Buttons', {
               props: {
               trigger: 'click'
               },
               class: 'defaultStyle trimming',
               on: {
               'on-click': (val) => {
               switch (val) {
               case '1':
               let data = params.row.flowTodoInfoList[0];
               if ((data.flowId === 'LC0001' && data.currentNodeId === 0) || data.flowId !== 'LC0001') {

               } else {
               v.backMt(params);
               }

               break;
               case '2':
               let data1 = params.row.flowTodoInfoList[0];
               if ((data1.flowId === 'LC0001' && data1.currentNodeId === 0) || data1.flowId !== 'LC0001') {

               } else {
               v.transferMt(params);
               }

               break;
               }
               }
               }
               }, [
               h('Button', {
               type: 'default',
               on: {
               click () {
               v.lookMethod(params);
               }
               }
               }, [
               h('span', {
               style: {
               top: '0'
               }
               }),
               h('span', '处理')
               ]),
               h('Buttons-menu', {
               slot: 'list'
               }, [
               h('Buttons-item', {
               attrs: {
               disabled: (function () {
               let data = params.row.flowTodoInfoList[0];
               if ((data.flowId === 'LC0001' && data.currentNodeId === 0) || data.flowId !== 'LC0001') {
               return true;
               } else {
               return false;
               }
               })()
               },
               props: {
               name: '1'
               }
               }, '打回'),
               h('Buttons-item', {
               attrs: {
               disabled: (function () {
               let data = params.row.flowTodoInfoList[0];
               if ((data.flowId === 'LC0001' && data.currentNodeId === 0) || data.flowId !== 'LC0001') {
               return true;
               } else {
               return false;
               }
               })()
               },
               props: {
               name: '2'
               }
               }, '转交')
               ])
               ]
               )
               ]); */
            }
          },
        },
        {
          key: "productCode",
          align: "center",
          title: "sku",
          minWidth: 160,
          render (h, params) {
            if (params.row.productCode == null) {
              return h("div", "未生成");
            } else {
              return h(
                "div",
                {
                  class: "line2",
                  attrs: {
                    title: params.row.productCode,
                  },
                },
                params.row.productCode
              );
            }
          },
        },
        {
          key: "productId",
          align: "center",
          title: "ID",
          minWidth: 160,
        },
        {
          key: "pictureUrl",
          align: "center",
          title: "图片",
          minWidth: 80,
          render (h, params) {
            return v.tableImg(h, params);
          },
        },
        {
          key: "productName",
          align: "left",
          title: "名称",
          minWidth: 120,
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
                    title: params.row.productName,
                  },
                },
                params.row.productName
              );
            }
          },
        },
        {
          key: "referenceUrl",
          align: "center",
          title: "参考链接",
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
                    target: "_blank",
                  },
                },
                params.row.referenceUrl
              );
            }
          },
        },
        {
          key: "productType",
          align: "left",
          title: "产品分类",
          minWidth: 120,
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
                    title: params.row.productTypeName,
                  },
                },
                params.row.productTypeName
              );
            }
          },
        },
        {
          key: "saleChannel",
          align: "left",
          title: "渠道/站点",
          minWidth: 120,
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
          },
        },
        {
          key: "assignStatus",
          align: "left",
          title: "状态",
          minWidth: 120,
          render (h, params) {
            return v.setAssignStatus(h, params);
          },
        },
        {
          key: "requireSubName",
          align: "center",
          title: "需求创建人",
          minWidth: 150,
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
              ),
            ]);
          },
        },
        {
          key: "productStatus",
          align: "center",
          title: "产品资料状态",
          minWidth: 160,
          render (h, params) {
            return h(
              "div",
              {
                style: "padding:5px 0;",
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
                    })(),
                  },
                }),
                h("p", {
                  domProps: {
                    innerHTML: (function () {
                      let str =
                        "图片" +
                        ":" +
                        v.setRequireSubBy(params.row.pictureStatus);
                      return str;
                    })(),
                  },
                }),
                h("p", {
                  domProps: {
                    innerHTML: (function () {
                      let str =
                        "描述" +
                        ":" +
                        v.setRequireSubBy(params.row.descriptionStatus);
                      return str;
                    })(),
                  },
                }),
              ]
            );
          },
        },
      ],
      haveDoneDate: [],
      purchaserArr: [],
    };
  },
  created () {
    let v = this;
    // window.document.title = "待办任务";
    v.getList();
    setTimeout(() => {
      v.isConfigOkMethod();
    }, 200);
  },
  mounted () {
    this.getUserMesCommon().then((result) => {
      if (result) {
        this.purchaserArr = Object.values(this.$store.state.userInfoList);
      }
    });
  },
  methods: {
    ...mapActions(["taskList"]),
    goFlow () {
      let isAdmin = false;
      let v = this;
      v.$store.state.menuList.forEach((item) => {
        if (item === "productDev_processConfigurationChild") {
          isAdmin = true;
        }
      });
      if (isAdmin) {
        window.location.href =
          window.location.origin + "/pds-service/pds.html#/procedure";
      } else {
        this.modal2 = false;
      }
    },
    isConfigOkMethod () {
      let v = this;
      v.$axios
        .get(api.isConfigOk)
        .then((res) => {
          if (res.code === 0 && !res.datas) {
            let isAdmin = false;
            v.$store.state.menuList.forEach((item) => {
              if (item === "productDev_processConfigurationChild") {
                isAdmin = true;
              }
            });
            isAdmin
              ? (v.modalBody =
                "您还未配置流程，请进入流程配置页面，选择启用自己需要的流程节点，编辑各流程的操作人员或角色")
              : (v.modalBody =
                "您还未配置流程，请联系你们管理员，进入流程配置页面，选择启用自己需要的流程节点，编辑各流程的操作人员或角色");
            v.modal2 = true;
          }
        })
        .catch(() => { });
    },
    setTableColumns (data) {
      this.$nextTick(() => {
        this.filterHaveDoneTableColumns = data;
      });
    },
    changeDateTime () { },
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
    backMt (params) {
      let v = this;
      v.$store.commit("createId", params.row.productId);
      let data = {
        fromNodeId: params.row.flowTodoInfoList[0].currentNodeId, // 当前节点ID，必需
        flowInstanceId: params.row.flowTodoInfoList[0].flowInstanceId, // 流程实例ID，必需
        sendType: 1, // 流程发送类别：0提交，1打回上级，2打回发起人，3转交，4作废
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
          } else {
            v.$msg.error({
              content: "找不到流程接收人，请联系管理员进行流程配置",
              duration: 5,
            });
          }
        })
        .catch(() => {
          v.$Spin.hide();
          v.$msg.error("请求失败");
        });
    },
    transferMt (params) {
      let v = this;
      v.$store.commit("createId", params.row.productId);
      let data = {
        fromNodeId: params.row.flowTodoInfoList[0].currentNodeId, // 当前节点ID，必需
        flowInstanceId: params.row.flowTodoInfoList[0].flowInstanceId, // 流程实例ID，必需
        sendType: 3, // 流程发送类别：0提交，1打回上级，2打回发起人，3转交，4作废
      };
      v.$axios
        .post(api.getNextTodoInfo, data)
        .then((res) => {
          if (res.code === 0) {
            v.productSubmitParams = res.datas;
            v.$refs.commonTransfer.operating = true;
            v.$refs.commonTransfer.$refs.operatingFrom.resetFields();
          } else {
            v.$msg.error({
              content: "找不到流程接收人，请联系管理员进行流程配置",
              duration: 5,
            });
          }
        })
        .catch(() => {
          v.$msg.error("请求失败");
        });
    },
    // 处理
    lookMethod (params) {
      let v = this;
      v.params = params;
      v.$store.commit("curNodeControl", 999);
      v.$refs.commonMessage.createDemand = true;
      v.$store.commit("createId", params.row.productId);
      v.$store.commit("flowInstance", params.row.flowTodoInfoList); // 流程信息
      v.$store.commit("saleStatus", params.row.saleStatus); // 流程信息
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
        .post(api.queryPersonalWorkData, params)
        .then((res) => {
          v.tableLoading = false;
          if (res.code === 0) {
            if (res.datas === null) {
              v.haveDoneDate = [];
              v.total = 0;
            } else {
              v.haveDoneDate = res.datas.list;
              v.haveDoneDate.forEach((item) => {
                item.pid = 1;
              });
              v.total = res.datas.total;
            }
          }
        })
        .catch(() => {
          v.tableLoading = false;
        });
    },
    searchProduct () {
      let v = this;
      v.allListFormValidate.pageNum = 1;
      v.allListFormValidate.pageSize = 10;
      v.getList();
    },
    resetSearch () {
      let v = this;
      for (let key in v.allListFormValidate) {
        v.allListFormValidate[key] = null;
      }
      v.payTimeArr = "";
      v.allListFormValidate.queryStatus = "0";
      v.allListFormValidate.pageNum = 1;
      v.allListFormValidate.pageSize = 10;
      v.getList();
    },
  },
  watch: {
    $route () { },
  },
};
</script>

<style>
.flowModal .ivu-modal-body {
  height: 100px !important;
}
</style>

<style scoped>
.cccc img {
  width: 100%;
}
</style>
