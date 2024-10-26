<template>
  <div>
    <template v-if="curShow === 'managentPage'">
      <div class="commonFilter">
        <div class="card-container">
          <div class="card-content">
            <Tabs class="mt10" v-model="curTab" @on-click="showCurrentPage">
              <TabPane
                v-for="item in tabItems"
                :label="item.label"
                :key="item.value"
                :name="item.value"
              ></TabPane>
            </Tabs>
            <div class="platformParamsSelect">
              <Form ref="pageParams" :model="pageParams" :label-width="90">
                <dyt-filter>
                  <!-- <FormItem :label-width="150" class="preLabelStyle">
                    <div slot="label">
                      <dyt-select
                        v-model="searchOptionDefault"
                        :style="`width: 105px;`"
                      >
                        <Option
                          v-for="item in searchArr"
                          :value="item.type"
                          :key="item.type"
                          >{{ item.title }}
                        </Option>
                      </dyt-select>
                    </div>
                    <dyt-input-tag
                      :limit="1"
                      v-model="pageParams.searchContent"
                      placeholder="多个用逗号或回车分开"
                      type="textarea"
                    >
                    </dyt-input-tag>
                  </FormItem> -->
                  <FormItem label="运费核对编号" prop="freightCheckNoList">
                    <dyt-input-tag
                      :limit="1"
                      type="textarea"
                      v-model="pageParams.freightCheckNoList"
                      placeholder="多个请用逗号或回车分隔"
                    />
                  </FormItem>
                  <FormItem label="物流单号" prop="logisticsNoList">
                    <dyt-input-tag
                      :limit="1"
                      type="textarea"
                      v-model="pageParams.logisticsNoList"
                      placeholder="多个请用逗号或回车分隔"
                    />
                  </FormItem>
                  <FormItem label="采购单号" prop="purchaseNumberList">
                    <dyt-input-tag
                      :limit="1"
                      type="textarea"
                      v-model="pageParams.purchaseNumberList"
                      placeholder="多个请用逗号或回车分隔"
                    />
                  </FormItem>
                  <FormItem label="创建时间:" prop="createTime">
                    <DatePicker
                      transfer
                      type="datetimerange"
                      placement="bottom-end"
                      placeholder="选择日期"
                      style="width: 100%"
                      split-panels
                      v-model="createTime"
                      @on-clear="resetDate('create')"
                      format="yyyy-MM-dd HH:mm:ss"
                      :options="dateOptions"
                      @on-change="
                        (e) => {
                          getDateValue(e, 'create');
                        }
                      "
                    />
                  </FormItem>
                  <FormItem label="记账月份:" prop="startFreightMonth">
                    <DatePicker
                      transfer
                      type="month"
                      placeholder="选择月份"
                      style="width: 100%"
                      v-model="pageParams.startFreightMonth"
                      @on-clear="resetDate('startFreightMonth')"
                      format="yyyy-MM"
                      @on-change="
                        (e) => {
                          getDateValue(e, 'startFreightMonth');
                        }
                      "
                    />
                  </FormItem>
                  <FormItem
                    label="供应商名称:"
                    prop="supplierName"
                  >
                    <Input v-model="pageParams.supplierName" clearable />
                  </FormItem>
                  <FormItem label="采购人:" prop="purchaserIdList">
                    <dyt-select
                      v-model="pageParams.purchaserIdList"
                      :limit="1"
                      multiple
                      clearable
                      filterable
                    >
                      <Option
                        v-for="(item, index) in purchaserArr"
                        :value="item.userId"
                        :key="index"
                        >{{ item.name }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="所属事业部:" prop="businessDeptIdsList">
                    <dyt-select
                      v-model="pageParams.businessDeptIdsList"
                      clearable
                      filterable
                    >
                      <Option
                        v-for="(item, index) in businessDeptArr"
                        :value="item.id"
                        :key="index"
                        >{{ item.name }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="结算方式:" prop="settlementTypeList">
                    <dyt-select v-model="pageParams.settlementTypeList" 
                      clearable 
                      filterable
                      multiple>
                        <Option 
                        v-for="(item, index) in settlementMethodArr" 
                        :value="item.dataDesc" 
                        :key="index"
                        >{{ item.dataDesc
                        }}
                        </Option>
                      </dyt-select>
                  </FormItem>
                  <FormItem label="处理备注:" prop="freightRemark">
                    <Input v-model="pageParams.freightRemark" clearable />
                  </FormItem>
                  <FormItem
                    label="运费承担方退/抵形式:"
                    prop="freightBearInfo"
                    :label-width="150"
                  >
                    <dyt-select
                      v-model="pageParams.freightBearInfo"
                      clearable
                      placeholder="请选择"
                    >
                      <Option
                        v-for="(item, index) in freightCarrierMethodList"
                        :value="item.value"
                        :key="index"
                        >{{ item.label }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                  <div slot="operation">
                    <Button
                      type="primary"
                      @click="search"
                      icon="ios-search"
                      class="mr10 ml20"
                      >查询</Button
                    >
                    <Button @click="reset" v-once icon="md-refresh"
                      >重置</Button
                    >
                  </div>
                </dyt-filter>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <div class="flexBox spaceBetween">
        <div class="tableControl mb10" style="margin-left: 12px">
          <Button
            type="primary"
            class="mr10"
            @click="addCheck"
            v-if="getPermission('supplierFreightCheck_created')"
            >新增</Button
          >
          <!-- <Button
            type="primary"
            class="mr10"
            @click="batchReview()"
            v-if="
              getPermission('supplierFreightCheck_batchSummit') &&
              (curTab === '1' || curTab === '2')
            "
            >审核</Button
          > -->
          <Dropdown
            @on-click="exportBtn"
            v-if="getPermission('supplierFreightCheck_exportList')"
          >
            <Button type="primary">
              <span class="icon iconfont" style="font-size: 12px"
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
          <Button
            type="primary"
            class="ml10"
            v-if="getPermission('supplierFreightCheck_import') && isShowImport"
            @click="importExcel = true"
            >运费导入</Button
          >
        </div>
        <div class="mr10">
          <span
          class="mr20 importStyle"
          v-if="getPermission('supplierFreightCheck_importList')"
          @click="openImportDataModal"
          >已导入运费</span>
          <dyt-sortBySelect
            :sortButtonList="sortButtonList"
            @sortInfo="getSortInfoAndFetch"
          >
          </dyt-sortBySelect>
        </div>
      </div>
      <div class="commonFilter">
        <div class="orderTable">
          <Table
            ref="returnsTable"
            highlight-row
            :border="true"
            :loading="loading"
            :height="tableHeight"
            :columns="tableColumn"
            :data="tableData"
            @on-selection-change="getSelectValue"
          >
          </Table>
          <div class="table-page clear">
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
              ></Page>
            </div>
          </div>
        </div>
      </div>
      <!-- Excel导入 -->
      <Modal
        v-model="importExcel"
        title="导入模板"
        @on-ok="importExcel = false"
        class-name="verticalCenterModal"
        @on-cancel="importExcel = false"
        :styles="{ top: '280px' }"
        width="400"
      >
        <template
          v-if="
            uploadList.length == 0 ||
            (uploadList.length > 0 &&
              uploadList[uploadList.length - 1].status === 'finished')
          "
        >
          <div style="text-align: center; margin: 20px 0">
            <dyt-upload
              ref="import"
              type="drag"
              :format="['XLS', 'XLSX']"
              :action="action"
              name="file"
              :headers="headObj"
              :on-success="okUpload"
              :on-error="uploadError"
              :show-upload-list="false"
              :onFormatError="formatError"
            >
              <div style="padding: 20px 0">
                <Icon type="ios-cloud-upload" size="60"></Icon>
                <p>导入</p>
              </div>
            </dyt-upload>
          </div>
          <div style="text-align: center">
            <a href="javascript:void(0)" @click="downloadEcxel()"
              >下载Excel文件模板</a
            >
          </div>
        </template>
        <template v-else>
          <div style="margin: 20px 0">
            <Progress
              v-if="uploadList[uploadList.length - 1].showProgress"
              :percent="uploadList[uploadList.length - 1].percentage"
              hide-info
            ></Progress>
          </div>
        </template>
        <div slot="footer"></div>
      </Modal>
    </template>
    <transition name="bounce">
      <template v-if="curShow === 'addCheck'">
        <div class="subLayer infoDetails">
          <div class="topper">
            <span class="arrowLeft" @click="goBack">
              <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
            </span>
            <div style="margin-left: 130px; position: absolute">
              <Button
                type="primary"
                class="mr10"
                v-if="getPermission('supplierFreightCheck_summit')"
                @click="saveOrSubmit('submit')"
                >提交</Button
              >
              <!-- <Button
                type="default"
                class="mr10"
                v-if="getPermission('supplierFreightCheck_save')"
                @click="saveOrSubmit('save')"
                >暂存</Button
              > -->
            </div>
          </div>
          <div class="mainContent">
            <addCheckShippingCosts
              ref="addCheckShippingCosts"
              :purchaserArr="purchaserArr"
              :supplierArr="supplierArr"
              :businessDeptUser="businessDeptUser"
              @goBack="goBack"
            ></addCheckShippingCosts>
          </div>
        </div>
      </template>
      <template v-if="curShow === 'editCheck'">
        <div class="subLayer infoDetails">
          <div class="topper">
            <span class="arrowLeft" @click="goBack">
              <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
            </span>
            <div
              style="margin-left: 130px; position: absolute"
              v-if="this.detaildsData.type === 'edit'"
            >
              <Button
                type="primary"
                class="mr10"
                v-if="getPermission('supplierFreightCheck_summit')"
                @click="editPageBtn('submit')"
                >{{ detaildSubmitNameMap[this.detaildsData.checkShippingCostForm.status] }}</Button
              >
              <Button
                type="primary"
                v-if="
                  getPermission('supplierFreightCheck_back') &&
                  this.detaildsData.checkShippingCostForm.status !== 0
                "
                class="mr10"
                @click="editPageBtn('return')"
                >退回</Button
              >
              <Button
                type="default"
                class="mr10"
                v-if="getPermission('supplierFreightCheck_save') && detaildsData.checkShippingCostForm.status == 0"
                @click="editPageBtn('save')"
                >保存</Button
              >
            </div>
          </div>
          <div class="mainContent">
            <checkShippingCostsDetails
              ref="checkShippingCostsDetails"
              :purchaserList="purchaserArr"
              :supplierArr="supplierArr"
              :detaildsData="detaildsData"
              :businessDeptUser="businessDeptUser"
              @goBack="goBack"
            ></checkShippingCostsDetails>
          </div>
        </div>
      </template>
    </transition>
    <Modal v-model="cancelData.isVisible" title="确认作废" width="400">
      <Input
        v-model="cancelReason"
        placeholder="请输入作废原因"
        :maxlength="150"
        type="textarea"
        :rows="3"
        show-word-limit
      />
      <div style="color: red">作废后更为“已作废”状态，流程终止</div>
      <div slot="footer">
        <Button @click="resetCancelData">取消</Button>
        <Button type="primary" @click="cancelApply" :loading="loading"
          >确定</Button
        >
      </div>
    </Modal>
    <importCostModal :moduleVisible.sync="importCostModal.visible" :purchaserList="purchaserArr"></importCostModal>
  </div>
</template>
<script>
import Mixin from "@/components/mixin/common_mixin";
import api from "@/api/api";
import addCheckShippingCosts from "./addCheckShippingCosts.vue";
import checkShippingCostsDetails from "./checkShippingCostsDetails.vue";
import importCostModal from "./importCostModal.vue"
export default {
  components: { addCheckShippingCosts, checkShippingCostsDetails, importCostModal },
  mixins: [Mixin],
  data() {
    let dayjs = this.$common.dayjs();
    return {
      curShow: "managentPage", //当前页面
      tabItems: [
        {
          label: "全部",
          value: "-1",
        },
        {
          label: "待处理",
          value: "0",
        },
        {
          label: "待审核",
          value: "1",
        },
        {
          label: "待复审",
          value: "2",
        },
        {
          label: "已完成",
          value: "3",
        },
        {
          label: "已作废",
          value: "4",
        },
      ],
      curTab: "-1",
      sortButtonList: [
        {
          sortHeader: "按创建时间",
          sortField: "createdTime",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "包裹/物流单号",
          sortField: "logisticsNo",
          sortType: "DESC",
        },
        {
          sortHeader: "采购单号",
          sortField: "purchaseNumber",
          sortType: "DESC",
        },
      ],
      searchArr: [
        {
          type: "1",
          title: "运费核对编号",
        },
        {
          type: "2",
          title: "物流单号",
        },
        {
          type: "3",
          title: "采购单号",
        },
      ],
      // searchOptionDefault: "1",
      searchContent: [],
      pageParams: {
        freightCheckNoList: [],
        logisticsNoList: [],
        purchaseNumberList: [],
        startFreightMonth: null,
        createStartTime:
          dayjs.subtract(6, "day").format("YYYY-MM-DD") + " 00:00:00",
        createEndTime: dayjs.format("YYYY-MM-DD") + " 23:59:59",
        freightRemark: null,
        purchaserIdList: null,
        supplierName: null,
        businessDeptIdsList: null,
        freightBearInfo: null,
        statusList: [],
        pageSize: 20,
        pageNum: 1,
        orderSeq: "DESC",
        orderBy: "createdTime",
        settlementTypeList: [],
        searchContent: [],
      },
      createTime: [
        dayjs.subtract(6, "day").format("YYYY-MM-DD") + " 00:00:00",
        dayjs.format("YYYY-MM-DD") + " 23:59:59",
      ],
      purchaserArr: [],
      freightCarrierMethodList: [
        {
          label: "累计月结抵扣",
          value: "累计月结抵扣",
        },
        { label: "逐单现金退还", value: "逐单现金退还" },
        { label: "由公司承担", value: "由公司承担" },
        { label: "到付寄出", value: "到付寄出" },
        { label: "其他", value: "其他" },
      ],
      loading: false,
      tableHeight: this.getTableHeight(350),
      tableColumn: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          key: "freightVerificationNumber",
          title: "运费核对编号",
          render: (h, params) => {
            let statusMap = {
              0: "待处理",
              1: "待审核",
              2: "待复审",
              3: "已完成",
              4: "已作废",
            };

            let businessDeptName = "";
            this.businessDeptArr.forEach((item) => {
              if (params.row.businessDeptId == item.id) {
                businessDeptName = item.name;
              }
            });
            let supplierName = "";
            this.supplierArr.forEach((item) => {
              if (params.row.supplierId == item.supplierId) {
                supplierName = item.supplierName;
              }
            });
            return [
              h(
                "div",
                {
                  style: {
                    cursor: "pointer",
                    color: "#31A1FF",
                  },
                  on: {
                    click: () => {
                      this.getDetails("view", params.row);
                    },
                  },
                },
                params.row.freightCheckNo
              ),
              h("div", {}, supplierName),
              h(
                "div",
                {
                  class: "flexBox",
                  style: {
                    marginTop: "3px",
                    marginBottom: "5px",
                  },
                },
                [
                  !this.$common.isEmpty(statusMap[params.row.status])
                    ? h(
                        "div",
                        {
                          style: {
                            width:
                              statusMap[params.row.status].length * 14 + "px" ||
                              "0",
                            textAlign: "center",
                            background:
                              params.row.status === 3
                                ? "#EFFDDA"
                                : params.row.status === 4
                                ? "#F9D9DD"
                                : "#FEF0DE",
                            color:
                              params.row.status === 3
                                ? "#2DB933"
                                : params.row.status === 4
                                ? "#DB122B"
                                : "#F59C2B",
                          },
                        },
                        statusMap[params.row.status]
                      )
                    : "",
                  h(
                    "div",
                    {
                      style: {
                        width: businessDeptName.length * 13 + "px",
                        textAlign: "center",
                        background: "#B4E5FB",
                        color: "#077EB4",
                        marginLeft: "5px",
                      },
                    },
                    businessDeptName
                  ),
                this.$common.isEmpty(params.row.settlementType) ? null : 
                h('Tooltip', {
                    props: {
                      content: '结算方式',
                      transfer: true
                    }
                  }, 
                  [
                    h('div',{
                      style: {
                            width: params.row.settlementType.length * 13 + 'px',
                            textAlign: "center",
                            backgroundColor: "rgba(235, 47, 150,.1)",
                            color: "#EB2F96",
                            marginLeft: "5px",
                          },
                    }, params.row.settlementType)
                  ]),,
                 params.row.isBack === 1 ? h('div',
                   {
                     style: {
                       width: '36px',
                       background: '#ECD0D9',
                       color: 'red',
                       marginLeft: '8px',
                       textAlign: "center"
                     }
                   }, '退回') : null
                ]
              ),
            ];
          },
        },
        {
          key: "logisticsNo",
          title: "物流单号",
          align: "center",
          width: 150,
        },
        {
          key: "purchaserId",
          title: "采购人",
          align: "center",
          width: 100,
          render: (h, params) => {
            let purchaserName = "";
            this.purchaserArr.forEach((item) => {
              if (params.row.purchaserId === item.userId) {
                purchaserName = item.name;
              }
            });
            return h("div", {}, purchaserName);
          },
        },
        {
          key: "consignmentType",
          title: "寄出类型",
          align: "center",
          width: 150,
          render: (h, params) => {
            let consignmentTypeMap = {
              0: "来货异常处理",
              1: "质检问题件处理",
              2: "出库退货处理",
              3: "其他寄出处理"
            };
            return h("div", {}, consignmentTypeMap[params.row.consignmentType]);
          },
        },
        {
          key: "freightAmount",
          title: "运费金额",
          align: "center",
          width: 90,
        },
        {
          key: "freightRemark",
          title: "处理备注",
          align: "center",
          width: 90,
          render: (h, params) => {
            return h(
              "Tooltip",
              {
                props: {
                  content: params.row.freightRemark,
                  maxWidth: "300px",
                },
                style: {},
              },
              [
                h(
                  "div",
                  {
                    style: {
                      width: "50px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    },
                  },
                  params.row.freightRemark
                ),
              ]
            );
          },
        },
        {
          key: "freightBearInfo",
          title: "运费承担方  退/抵形式",
          align: "center",
          width: 110,
        },
        {
          key: "refundTime",
          title: "退抵日期",
          align: "center",
          width: 100,
        },
        {
          key: "refundAmount",
          title: "退抵金额",
          align: "center",
          width: 90,
        },
        {
          key: "consignmentTime",
          title: "寄出日期",
          align: "center",
          width: 100,
        },
        {
          key: "freightMonth",
          title: "记账月份",
          align: "center",
          width: 100,
        },
        {
          key: "createInfo",
          title: "创建信息",
          align: "center",
          width: 150,
          render: (h, params) => {
            let createByName = "";
            this.purchaserArr.forEach((item) => {
              if (params.row.createdBy === item.userId) {
                createByName = item.name;
              }
            });
            return [
              h("div", {}, createByName),
              h("div", {}, params.row.createdTime),
            ];
          },
        },
        {
          key: "operation",
          align: "center",
          title: "操作",
          width: 110,
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
            let powerList = {
              0: "supplierFreightCheck_waitHandlerSubmit",
              1: "supplierFreightCheck_waitExamineSubmit",
              2: "supplierFreightCheck_waitReexamineSubmit",
            };
            let power = this.getPermission(powerList[status]);
            let submitNameMap = {
              0: '提交',
              1: '审核',
              2: '复审',
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
                            this.getDetails("view", row);
                          },
                        },
                      },
                      "详情"
                    ),
                    power && [0, 1, 2].includes(status) && flag
                      ? h(
                          "DropdownItem",
                          {
                            nativeOn: {
                              click: (e) => {
                                this.getDetails("edit", row);
                              },
                            },
                          },
                          submitNameMap[status]
                        )
                      : null,
                    // this.getPermission("supplierFreightCheck_cancel") &&
                    // status === 1
                    //   ? h(
                    //       "DropdownItem",
                    //       {
                    //         nativeOn: {
                    //           click: (e) => {
                    //             this.cancelData.freightCheckNo =
                    //               row.freightCheckNo;
                    //             this.cancelData.isVisible = true;
                    //           },
                    //         },
                    //       },
                    //       "作废"
                    //     )
                    //   : "",
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
      supplierArr: [],
      detaildsData: {},
      action: api.import_freightCheckFile,
      uploadList: [],
      importExcel: false,
      cancelData: {
        isVisible: false,
        freightCheckNo: null,
      },
      cancelReason: null,
      importCostModal: {
        visible: false,
        modalData: null
      },
      businessDeptUser: {},
      detaildSubmitNameMap: {
        0: '提交',
        1: '审核通过',
        2: '复审通过',
      },
      isShowImport: false,
      settlementMethodArr: []
    };
  },
  created() {
    this.initData();
  },
  computed: {
    businessDeptArr() {
      return this.$store.getters["allowBusinessDept"];
    },
    userInfo () {
      return this.$store.state.userInfo;
    }
  },
  watch: {
    // searchOptionDefault: {
    //   handler(newVal, oldVal) {
    //     this.pageParams.searchContent = [];
    //     this.pageParams.freightCheckNoList = null;
    //     this.pageParams.logisticsNoList = null;
    //     this.pageParams.purchaseNumberList = null;
    //   },
    //   immediate: true,
    // },
  },
  methods: {
    // 获取各事业部下所有erp用户id
    getBusinessDeptUser() {
      let businessDeptArr = this.$store.getters["businessDeptList"]
      businessDeptArr = businessDeptArr.map(item => item.id)
      this.axios.post(api.query_businessDeptUser,businessDeptArr).then(res => {
        if (res.data.code == 0) {
          this.businessDeptUser = res.data.datas;
        }
      })
    },
    showCurrentPage(val) {
      let dayjs = this.$common.dayjs();
      if (val === "-1") {
        this.createTime = [
          dayjs.subtract(6, "day").format("YYYY-MM-DD") + " 00:00:00",
          dayjs.format("YYYY-MM-DD") + " 23:59:59",
        ];
        this.pageParams.createStartTime =
          dayjs.subtract(6, "day").format("YYYY-MM-DD") + " 00:00:00";
        this.pageParams.createEndTime =
          dayjs.format("YYYY-MM-DD") + " 23:59:59";
      } else {
        this.createTime = [];
        this.pageParams.createStartTime = null;
        this.pageParams.createEndTime = null;
      }
      this.pageParams.statusList = val === "-1" ? null : [Number(val)];
      this.pageParams.pageNum = 1;
      this.getList();
    },
    initData() {
      this.getBusinessDeptUser()
      // 校验是否具备导入运费按钮权限
      this.axios.get(api.query_importRule).then((res) => {
        if(res.data.code == 0) {
          this.isShowImport = res.data.datas
        }
      })
      this.axios
        .get(api.baseDataList + "?dataType=" + "settlementType")
        .then((res) => {
          if (res.data.code == 0) {
            this.settlementMethodArr = res.data.datas;
          }
        });
      this.axios.get(api.userList).then((res) => {
        if (res.data.code == 0) {
          let arr = [];
          let datas = res.data.datas;
          for (let i in datas) {
            if (i != "service") {
              arr.push({
                userId: datas[i].userId,
                name: datas[i].userName,
              });
            }
          }
          this.purchaserArr = arr;
        }
      });
      this.axios
        .post(
          `${api.get_SupplierInfo}?businessDeptIds=${this.allowBusinessDeptIds}`
        )
        .then((res) => {
          if (res.data.code === 0) {
            this.supplierArr = res.data.datas.map((item) => {
              let supplierReceivingInfo = "";
              supplierReceivingInfo = `${
                item.contactMan ? item.contactMan : "--"
              }  ${item.telephone ? item.telephone : "--"}  ${
                item.rAddress ? item.rAddress : "--"
              }  ${item.rAddressDetail ? item.rAddressDetail : "--"} `;
              return {
                ...item,
                supplierReceivingInfo: supplierReceivingInfo,
              };
            });
          }
        });
    },
    // 创建时间
    getDateValue(value, name) {
      if (name === "create") {
        if (value && value.length > 0 && value[0] != "") {
          this.pageParams[`${name}StartTime`] = value[0];
          this.pageParams[`${name}EndTime`] = value[1];
        }
      } else {
        this.pageParams.startFreightMonth = value;
      }
    },
    // 重置时间
    resetDate(type) {
      if (type === "create") {
        this.pageParams[`${type}StartTime`] = null;
        this.pageParams[`${type}EndTime`] = null;
      } else {
        this.pageParams.startFreightMonth = null;
      }
    },
    exportBtn(val) {
      let obj = {};
      if (val == "0") {
        obj = {
          freightCheckNoList: this.selectionArr.map(
            (item) => item.freightCheckNo
          ),
        };
      } else {
        obj = this.$common.copy(this.pageParams);
        obj.businessDeptIdsList = this.$common.isEmpty(obj.businessDeptIdsList)
          ? this.businessDeptArr.map((item) => item.id)
          : [obj.businessDeptIdsList];
      }
      this.loading = true;
      this.axios
        .post(api.export_freightCheck, obj)
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
    formatTime(time, type) {
      let pattern = /-/
      let resultTime = ''
      if (!pattern.test(time) && !this.$common.isEmpty(time)) {
        const date = new Date(time);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0')
        if (type === 'month') {
          resultTime = `${year}-${month}`;
        } else {
          resultTime = `${year}-${month}-${day}`;
        }
        return resultTime
      } else {
        return time
      }
    },
    reset() {
      this.$refs["pageParams"].resetFields();
      this.createTime = [];
      this.pageParams.createStartTime = null;
      this.pageParams.createEndTime = null;
      this.pageParams.freightCheckNoList = [];
      this.pageParams.logisticsNoList = [];
      this.pageParams.purchaseNumberList = [];
    },
    getList() {
      if (!this.getPermission("supplierFreightCheck_list"))
        return this.$Message.error("暂无权限");
      this.selectionArr = [];
      this.loading = true;
      // let searchOptionMap = {
      //   1: "freightCheckNoList",
      //   2: "logisticsNoList",
      //   3: "purchaseNumberList",
      // };
      let obj = this.$common.copy(this.pageParams);
      obj.startFreightMonth = this.formatTime(obj.startFreightMonth, 'month')
      obj.businessDeptIdsList = this.$common.isEmpty(obj.businessDeptIdsList)
        ? this.businessDeptArr.map((item) => item.id)
        : [obj.businessDeptIdsList];
      // obj[searchOptionMap[this.searchOptionDefault]] = obj.searchContent;
      this.axios
        .post(api.query_freightCheckList, obj)
        .then((res) => {
          if (res.data.code === 0) {
            this.tableData = this.$common.isEmpty(res.data.datas.list)
              ? []
              : res.data.datas.list;
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
      this.pageParams.pageNum = 1;
      this.pageParams.pageSize = val;
      this.getList();
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.orderSeq = type;
      this.pageParams.orderBy = feild;
      this.getList();
    },
    goBack() {
      this.curShow = "managentPage";
      this.getList();
    },
    addCheck() {
      this.curShow = "addCheck";
    },
    // 新增页面按钮功能
    saveOrSubmit(type) {
      this.$refs.addCheckShippingCosts.saveOrSubmit(type);
    },
    // 编辑页面按钮功能
    editPageBtn(type) {
      this.$refs.checkShippingCostsDetails.editPageBtn(type);
    },
    getDetails(type, row) {
      if (!this.getPermission("supplierFreightCheck_detail"))
        return this.$Message.error("暂无权限");
      this.loading = true;
      this.axios
        .get(
          `${api.get_freightCheckDetail}?freightCheckId=${row.freightCheckId}`
        )
        .then((res) => {
          if (res.data.code === 0) {
            this.detaildsData.checkShippingCostForm = res.data.datas;
            this.detaildsData.type = type;
            this.curShow = "editCheck";
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 批量审核
    batchReview() {
      if (!this.selectionArr.length) return this.$Message.error("无审核数据");
      this.loading = true;
      let obj = {
        freightCheckNoList: this.selectionArr.map(
          (item) => item.freightCheckNo
        ),
      };
      this.axios
        .post(api.batchSummit_freightCheck, obj)
        .then((res) => {
          if (res.data.code === 0) {
            this.$Message.success("操作成功");
            this.getList();
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 下载导入的模板
    downloadEcxel() {
      const path =
        this.$store.state.imgUrl +
        "/sps-service/template/FreightCheckTemplate.xlsx";
      window.location.href = path;
    },
    // 文件上传成功的回调
    okUpload(data, file, fileList) {
      if (data.code == 0) {
        if (data.datas) {
          this.$Message.success("导入成功");
          this.importExcel = false;
          this.getList();
        } else {
          this.$Message.error({
            content: file.name + "导入失败",
            duration: 2,
            closable: true,
          });
          this.importExcel = false;
        }
      } else if (data.code === 222008) {
        this.$Notice.error({
          title: "批量导入失败,详情请下载",
          desc:
            '<a target="_blank" href="' +
            this.$store.state.imgUrl +
            data.datas +
            '">' +
            data.datas +
            "</a>",
          duration: 0,
        });
      } else {
        this.$Message.error(data.message);
        this.importExcel = false;
      }
    }, // 上传失败回调
    uploadError() {
      this.$Message.error("导入失败");
      this.importExcel = false;
    },
    // 上传格式错误
    formatError(file) {
      this.$Notice.warning({
        title: "上传文件格式有误",
        desc: "文件 " + file.name + " 格式错误, 请选择[XLS或XLSX]",
      });
    },
    // 作废订单
    cancelApply() {
      if (this.$common.isEmpty(this.cancelReason))
        return this.$Message.error("请输入作废原因");
      this.loading = true;
      let freightCheckNo = this.cancelData.freightCheckNo;
      this.axios
        .get(
          `${api.cancel_freightCheck}?freightCheckNo=${freightCheckNo}&cancelReason=${this.cancelReason}`
        )
        .then((res) => {
          if (res.data.code === 0) {
            this.$Message.success("操作成功");
            this.getList();
          }
        })
        .finally(() => {
          this.loading = false;
          this.cancelData.isVisible = false;
          this.cancelData.freightCheckNo = null;
          this.cancelReason = null;
        });
    },
    resetCancelData() {
      this.cancelData = {
        isVisible: false,
        freightCheckNo: null,
      };
      this.cancelReason = null;
    },
    openImportDataModal() {
      this.importCostModal.visible = true
    }
  },
};
</script>
<style lang="less">
.preLabelStyle {
  .ivu-form-item-label {
    padding-top: 0;
  }
}
.importStyle {
  color: #2D8CF0;
  cursor: pointer;
  text-decoration: underline;
}
</style>