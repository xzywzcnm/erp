<template >
  <div class="inWareManagePage">
    <div v-show="workShow === 'list'" class="listPage">
      <div class="searchMain">
        <Form ref="pageParams" :model="pageParams" :label-width="100">
          <dyt-filter ref="dyt-filter" @expand="expand">
            <Form-item label="sku：" prop="sku">
              <dyt-input-tag :limit="1" :string="true" placeholder="输入多个请用逗号或者换行分隔" v-model="pageParams.sku"
                type="textarea" />
            </Form-item>
            <Form-item label="参考编号：" prop="searchWatchCode">
              <dyt-input-tag :limit="1" :string="true" placeholder="输入多个请用逗号或者换行分隔" v-model="pageParams.searchWatchCode"
                type="textarea" />
            </Form-item>
            <Form-item label="入库单编号：" prop="searchInWareCode">
              <dyt-input-tag :limit="1" :string="true" placeholder="输入入库单编号" v-model.trim="pageParams.searchInWareCode"
                type="textarea" />
            </Form-item>
            <Form-item label="创建时间：" prop="createTime">
              <DatePicker type="daterange" transfer style="width: 100%" placeholder="选择日期"
                v-model="pageParams.createTime" />
            </Form-item>
            <Form-item label="最后收货时间：" prop="lastReceivedTime">
              <DatePicker type="daterange" transfer style="width: 100%" placeholder="选择日期"
                v-model="pageParams.lastReceivedTime" />
            </Form-item>
            <Form-item label="入库单类型：" prop="receiptType">
              <dyt-select v-model="pageParams.receiptType">
                <Option v-for="v in inWareTypeList" :value="v.receiptType" :label="v.account" :key="v.receiptType">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="入库单状态：" prop="selectInWareStatus">
              <dyt-select v-model="pageParams.selectInWareStatus">
                <template v-for="item in inWareStatusList">
                  <Option :value="item.selectInWareStatus" :label="item.account" :key="item.selectInWareStatus"
                    v-if="!item.hidden"></Option>
                </template>
              </dyt-select>
            </Form-item>
            <Form-item label="收货异常：" prop="selectReceiveErrorType">
              <dyt-select v-model="pageParams.selectReceiveErrorType">
                <Option v-for="item in receiveErrorList" :value="item.selectReceiveErrorType" :label="item.account"
                  :key="item.selectReceiveErrorType"></Option>
              </dyt-select>
            </Form-item>
            <Form-item label="自动冻结状态：" prop="transitStatus">
              <dyt-select v-model="pageParams.transitStatus">
                <Option :value="1" label="上架后自动冻结"></Option>
                <Option :value="0" label="上架后不自动冻结"></Option>
              </dyt-select>
            </Form-item>
            <Form-item label="创建人：" prop="createdByList">
              <dyt-select v-model="pageParams.createdByList" :multiple="true" :max-tag-count="1">
                <Option v-for="item in ($store.getters.userInfoList || [])" :key="item.userId" :label="item.userName"
                  :value="item.userId"></Option>
              </dyt-select>
            </Form-item>
            <div slot="operation">
              <Button type="primary" @click="receiptSearch" :disabled="SearchDisabled" icon="md-search">查询</Button>
              <Button style="margin-left: 10px" @click="reset" v-once icon="md-refresh">重置
              </Button>
            </div>
          </dyt-filter>
        </Form>
      </div>

      <div class="funMain">
        <div class="funMain__flex">
          <!--手工创建入库单按钮-->
          <div>
            <Button :disabled="!getPermission('wmsReceipt_create')" type="primary" class="fl mr10" icon="md-add"
              @click="showCreateInWareModal">手工创建入库单 </Button>
            <div class="fl">
              <Dropdown @on-click="exportAllOrSlt" class="mr10">
                <Button type="primary"><span class="icon iconfont" style="font-size: 12px">&#xe639;</span> 导出
                  <Icon type="md-arrow-dropdown"></Icon>
                </Button>
                <DropdownMenu slot="list">
                  <DropdownItem name="0" v-if="getPermission('wmsReceipt_export_batch')">导出选中数据
                  </DropdownItem>
                  <DropdownItem name="1" v-if="getPermission('wmsReceipt_export_all')">导出所有结果集
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Button type="primary" class="mr10" @click="openInportModal" icon="md-archive"
                :disabled="!getPermission('wmsReceipt_import')">导入 </Button>
              <Dropdown @on-click="batchOption" class="mr10">
                <Button icon="ios-copy-outline">批量操作
                  <Icon type="md-arrow-dropdown"></Icon>
                </Button>
                <DropdownMenu slot="list">
                  <DropdownItem name="2" v-if="getPermission('wmsReceiptBatch_createList')">批量收货
                  </DropdownItem>
                  <DropdownItem name="4" v-if="getPermission('wmsReceipt_close_batch')">批量关闭入库单
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
          <!--按 入库单状态 或 按创建时间 排序-->
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>

      <div class="tableMain">
        <div class="tableBox">
          <!--表格-->
          <Table highlight-row border :height="tableHeight" :columns="columns7" :data="data6" :loading="TableLoading"
            ref="selection" @on-selection-change="tableSelectionChange">
            <template slot-scope="{ row}" slot="receiptNo">
              <div class="receiptNo">
                <div>
                  <span>入库单：</span>
                  <span class="linkText cursorClick" @click="seeReceiptDetail(row)">{{ row.receiptNo || '' }}</span>
                  <Icon type="ios-copy-outline" style="font-size:18px;margin-left:4px;cursor: pointer;"
                    @click="copyFun(row.receiptNo)" v-if="row.receiptNo" />
                </div>
                <div style="margin-top:4px;">
                  <!-- 入库单类型 -->
                  <Tag color="geekblue" v-if="inWareTypeList[row.receiptType]" title="入库单类型">
                    <Icon v-if="row.transitStatus == 1" type="ios-shuffle" class="stockType" />
                    {{ inWareTypeList[row.receiptType].name || inWareTypeList[row.receiptType].account }}
                  </Tag>
                  <!-- 入库单状态 -->
                  <Tag color="green" v-if="inWareStatusList[row.receiptStatus]" title="入库单状态">
                    {{ inWareStatusList[row.receiptStatus].account }}
                  </Tag>
                  <!-- 收货异常 -->
                  <span v-if="row.abnormalStatus">
                    <template v-for="(item, index) in row.abnormalStatus.split('+')">
                      <Tag :color="receiveErrorList[index].color" title="收货异常" :key="index + 'abnormalStatus'"
                        v-if="item == 1">
                        {{ receiveErrorList[index].account }}
                      </Tag>
                    </template>
                  </span>
                </div>
              </div>
            </template>
            <template slot-scope="{ row}" slot="receiptInfo">
              <div v-if="row.purchaserId && userInfoList[row.purchaserId]">
                采购员：{{ userInfoList[row.purchaserId].userName }}
              </div>
              <div v-if="row.supplierName">供应商：{{ row.supplierName }}</div>
            </template>
          </Table>
        </div>
      </div>

      <!--分页按钮-->
      <div class="pagesMain">
        <Page :total="totalRecords" :current="pageParams.pageNum" @on-change="changePage" show-total
          :page-size="pageParams.pageSize" show-elevator show-sizer @on-page-size-change="changePageSize" placement="top"
          :page-size-opts="pageArray"></Page>
      </div>
    </div>
    <!-- 手工创建入库单模态框弹框 -->
    <div v-if="workShow === 'add'">
      <createInWareList @backPage="backPage" @stockOrder="stockOrder"></createInWareList>
    </div>
    <!-- 入库单详情组件 -->
    <inWareDetails v-if="workShow === 'watch'" :inWareOrderId="inWareOrderId" :inWareOrderNo="inWareOrderNo"
      @backPage="backPage" @print="print">
    </inWareDetails>
    <div v-if="confirmModal">
      <Modal v-model="confirmModal" class="batch_receipt" title="批量收货">
        <div>
          <Form :label-width="120">
            <FormItem label="选择收货库位：">
              <Select v-model="receiptGoodPosition" filterable>
                <Option v-for="item in positionList" :value="item.warehouseLocationId" :key="item.warehouseLocationId" :label="item.warehouseLocationName" />
              </Select>
            </FormItem>
            <FormItem prop="c" label="收货后需要质检">
              <i-switch v-model="ReceiptCheckSw" :disabled="['check', 'nocheck'].includes(qulityName)" />
            </FormItem>
            <!-- <FormItem prop="d" label="收货后关闭入库单">
              <i-switch v-model="singleCheck" />
            </FormItem> -->
          </Form>
        </div>
        <Alert type="warning" show-icon>批量收货共<span class="ivu-tag-color-blue">{{
          tableSltData.length
        }}</span>张入库单，默认全部收货，操作不可退回，是否确定
        </Alert>
        <div slot="footer">
          <Button type="primary" @click="okModal">确定</Button>
          <Button @click="cancelModal">取消</Button>
        </div>
      </Modal>
    </div>
    <!--导入前的模态框  -->
    <Modal v-model="switchInportModal" :styles="{ top: '80px', width: '520px' }" title="导入" class="headerBar">
      <inportBeforeDownload @insertSuccess="switchInportModal = false" :importUrl="importUrl" :headObj="headObj"
        :wareId="wareId" templateTypes="0"></inportBeforeDownload>
      <div slot="footer">
        <Button @click="cancelInport">取消</Button>
      </div>
    </Modal>
    <printSkuCode :printSkuObj="printDate" :printType="printType" :qualityCheckProcurementId="qualityCheckProcurementId"
      @printsuccess="printsuccess" :tipsDataLength="data2" :barCodeShow="barCodeShow" :printSource="'inWareManageSource'">
    </printSkuCode>
    <!--取消收货-->
    <cancelReceipt ref="cancelReceipt" :cancelData="cancelData" @getList="searchData"></cancelReceipt>
  </div>
</template>
<script>
import api from "@/api/api";
import inWareDetails from "./inWareDetails";
import createInWareList from "./createInWareList";
import inportBeforeDownload from "./inportBeforeDownload";
import printSkuCode from "../common/printSkuCode";
import cancelReceipt from "@/views/wms/components/wms-inWareManage/componts/cancelReceipt";
import Mixin from "@/components/mixin/common_mixin";
import tableHeight_mixin from "@/components/mixin/tableHeight_mixin";
import { inWareTypeObj } from '@/views/wms/components/common/receiptType.js';

export default {
  mixins: [Mixin, tableHeight_mixin],
  components: {
    createInWareList: createInWareList, // 手工创建入库单组件
    inWareDetails: inWareDetails, // 入库单详情组件
    inportBeforeDownload,
    printSkuCode,
    cancelReceipt
  },
  data() {
    let v = this;
    return {
      workShow: 'list',
      cancelData: [], // 取消收货数据
      printSkuObj: '', // 打印参数
      printType: 'single', // 打印参数
      qualityCheckProcurementId: '', // 打印参数
      data2: [], // 打印参数
      barCodeShow: '', // 打印参数
      modal1: false, // 批量收货
      formInline: {
        a: '',
        b: '',
        c: '',
        d: ''
      },
      reservoirAreaList: [], // 收货库区
      receiptLocationList: [], // 收货库位
      ruleInline: {
        a: [
          {
            required: true,
            message: '请选择选择收货库区',
            trigger: 'change'
          }
        ],
        b: [
          {
            required: true,
            message: '请选择选择收货库位',
            trigger: 'change'
          }
        ]
      },
      switchInportModal: false,
      loading: false,
      receiptGoodPosition: '',
      ReceiptCheckSw: false,
      // singleCheck: false,
      positionList: [],
      confirmModal: false,
      cacheClickVal: "RK", // 排序缓存值
      inWareOrderId: "", // 入库单id标记
      inWareOrderNo: "", // 入库单编号
      wareHouseTypeList: [], // 仓库类型下拉选框
      // 入库单类型下拉选框 备货入库
      inWareTypeList: inWareTypeObj({ label: 'account', value: 'receiptType' }),
      // 入库单状态下拉选框
      inWareStatusList: {
        "0": {
          selectInWareStatus: "0",
          account: "入库单创建",
        },
        "1": {
          selectInWareStatus: "1",
          account: "入库单取消",
          hidden: true
        },
        "2": {
          selectInWareStatus: "2",
          account: "入库单关闭",
        },
        "3": {
          selectInWareStatus: "3",
          account: "收货中",
        },
      },
      // 收货异常下拉选框
      receiveErrorList: [
        {
          selectReceiveErrorType: "1",
          account: "无源入库", // 无源入库
          color: 'purple',
        },
        {
          selectReceiveErrorType: "2",
          account: "部分收货", // 部分收货
          color: 'orange',
        },
        {
          selectReceiveErrorType: "3",
          account: "超量收货", // 超量收货
          color: 'magenta',
        },
      ],
      sortButtonList: [
        {
          sortHeader: "按入库单状态",
          sortField: "RK",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "按创建时间",
          sortField: "CT",
          sortType: "DESC",
        },
      ],
      wareId: this.getWarehouseId(),
      pageParams: {
        sku: '',
        cargoOwnerType: null,
        cargoOwnerId: null,
        createTime: "", // 创建时间
        lastReceivedTime: "", // 最后收货时间
        searchInWareCode: "", // 输入入库单编号
        searchWatchCode: "", // 输入参考编号
        receiptType: "", // 选择入库单类型
        selectInWareStatus: "", // 选择入库单状态
        selectReceiveErrorType: "", // 选择收货异常
        transitStatus: "", // 自动冻结
        createdByList: [], // 创建人
        DESC: "DESC", // 降序
        CT: "RK", // 排序的标记
        pageNum: 1, // 默认第一页
        pageSize: 10 // 规定每页显示 10 条数据
      },
      totalRecords: 0, // 共有多少条
      columns7: [
        {
          type: 'selection',
          width: 60,
          align: "center",
          fixed: "left",
        },
        {
          title: "入库单编号",
          slot: "receiptNo",
          minWidth: 240,
          align: "center",
        },
        {
          title: "入库单信息",
          slot: "receiptInfo",
          minWidth: 150,
          align: "center",
        },
        {
          title: "参考编号",
          key: "referenceNo",
          minWidth: 140,
          align: "center",
          render(h, params) {
            let referenceNo3 = params.row.referenceNo3;
            if (params.row.referenceNo2) {
              return h('div', {}, [
                h('span', params.row.referenceNo + '/'), h('span', v.sepCommasFn(params.row.referenceNo2).join('/')),
                h('span', referenceNo3 ? '/' + referenceNo3 : '')
              ]);
            } else {
              return h('div', {}, [
                h('span', params.row.referenceNo),
                h('span', referenceNo3 ? '/' + referenceNo3 : '')
              ]);
            }
          },
        },
        {
          title: '预期数量',
          key: 'totalExpectedNumber',
          width: 100,
          align: 'center'
        },
        {
          title: '收货数量',
          key: 'totalDoneNumber',
          width: 100,
          align: 'center'
        },
        {
          title: '合格数量',
          key: 'totalQualifiedCheckedNumber',
          width: 100,
          align: 'center'
        },
        {
          title: '上架数量',
          key: 'totalShelveNumber',
          width: 100,
          align: 'center'
        },
        {
          title: "预期到货时间",
          width: 120,
          align: "center",
          render: (h, params) => {
            if (params.row.expectedStartTime !== null) {
              return h(
                "span",
                {},
                this.$uDate.getDateTime(params.row.expectedStartTime) +
                " 到 " +
                this.$uDate.getDateTime(params.row.expectedEndTime)
              );
            }
          },
        },
        {
          title: "最后收货时间",
          align: "center",
          width: 120,
          render: (h, params) => {
            return h("div", {
              style: {
                width: '62px',
                wordBreal: 'break-all',
                textAlign: 'center',
                margin: '0 auto'
              }
            }, params.row.lastReceivedTime);
          },
        },
        {
          title: "创建时间",
          key: "createdTime",
          align: "center",
          width: 100,
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          fixed: "right",
          width: 120,
          render: (h, params) => {
            if (!params.row) return;
            return h("local-down-button", {
              props: {
                data: {
                  btn: {
                    text: "查看详情", // 查看详情
                    disabled: !this.getPermission("wmsReceipt_detail"),
                    clickFn: () => {
                      if (this.getPermission("wmsReceipt_detail")) {
                        this.$nextTick(() => {
                          this.$store.commit("activeRow", params.row);
                          this.workShow = "watch";
                          this.inWareOrderId = params.row.receiptId; // 当前行的入库单id
                          this.inWareOrderNo = params.row.receiptNo; // 当前行的入库单编号
                        });
                      } else {
                        this.$Message.warning("没有权限");
                      }
                    },
                  },
                  list: [
                    {
                      text: "收货-按订单",
                      value: 1,
                      hide: params.row.receiptStatus !== "0",
                      clickFn: () => {
                        this.getPositionList({
                          pageNum: 1,
                          pageSize: 100000,
                        }).then((data) => {
                          if (data.length > 0) {
                            let value = data[0].warehouseLocationId;
                            data.forEach((i) => {
                              if (i.pickingCheckFlag === "1") {
                                value = i.warehouseLocationId;
                              }
                            });
                            this.receiptGoodPosition = value;
                          }
                        });
                        this.tableSltData = [params.row];
                        this.confirmModal = true;
                      },
                    },
                    {
                      text: "打印产品标签",
                      value: 2,
                      clickFn: () => {
                        v.print(params.row.receiptNo, params.row);
                      },
                    },
                    {
                      text: "关闭入库单",
                      value: 3,
                      hide:
                        params.row.receiptStatus === "2" ||
                        !this.getPermission("wmsReceipt_close_single"),
                      clickFn: () => {
                        this.inWareOrderId = params.row.receiptId;
                        this.closeInWareOrder();
                      },
                    },
                    {
                      text: "取消收货",
                      value: 4,
                      hide:
                        !this.getPermission("wmsReceipt_cancelReceipt") ||
                        [2, "2"].includes(params.row.receiptStatus),
                      clickFn: () => {
                        this.getWaitCheckShelve(params.row.receiptNo).then(
                          (data) => {
                            if (data && data.length > 0) {
                              this.cancelData = data.map((i) => {
                                i.receiptNo = params.row.receiptNo;
                                return i;
                              });
                              this.$refs.cancelReceipt.modal1 = true;
                            } else {
                              this.$Message.error("无可取消收货数据");
                            }
                          }
                        );
                      },
                    },
                    {
                      text: (params.row.transitStatus == 1 ? '取消' : '设置') + '自动冻结',
                      value: 5,
                      hide: !(this.getPermission("wmsReceipt_automaticStay") && params.row.receiptStatus === '0'),
                      clickFn: () => {
                        v.automaticStayFun(params.row)
                      },
                    },
                  ],
                },
              },
            });
          },
        },
      ],
      data6: [],
      tableSltData: [],
      importUrl: api.importReceipt,
      batchOptionType: '',
      printDate: [],
      qulityName: null, // 质检单类行：none(无质检单) check(质检单但要质检) nocheck(质检单但不需要质检)
      userInfoList: v.$store.state.userInfoList, // 用户列表
    };
  },
  watch: {
    confirmModal: function (bool) {
      if (bool) {
        this.$nextTick(() => {
          let node = document.querySelector('.batch_receipt .ivu-select-dropdown');
          let count = 1;
          node.addEventListener('scroll', () => {
            if (node.scrollTop + node.offsetHeight === node.scrollHeight) {
              count++;
              this.getPositionList({
                pageNum: 1,
                pageSize: count * 10
              });
            }
          });
        });
      }
    }
  },
  computed: {
    headObj() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    }
  },
  created() {
    this.$store.commit('pickingFlag', '0');
    this.searchData();
  },
  methods: {
    // 设置冻结/取消冻结
    automaticStayFun(row) {
      let title = (row.transitStatus == 1 ? '取消' : '') + '自动冻结';
      this.$Modal.confirm({
        title: '提示',
        content: `确定${title}该入库单？`,
        loading: true,
        onOk: () => {
          let params = {
            receiptId: row.receiptId,
            transitStatus: row.transitStatus == 1 ? 0 : 1,
          }
          this.axios.get(api.updateReceiptTransitStatus, { params }).then((res) => {
            this.$Message.success('操作成功!');
            this.searchData();
          }).finally(() => {
            this.$Modal.remove();
          })
        },
        onCancel: () => { }
      });
    },
    // 返回列表
    backPage(value) {
      this.workShow = value;
      this.$nextTick(() => {
        this.computedTableHeight();// 重新调整表格高度
      })
    },
    // 手工创建入库单成功,重新请求接口数据
    stockOrder(value) {
      if (value) {
        this.searchData();
      }
    },
    print(receiptNo, row) {
      this.getPrintDate(receiptNo, row).then(() => {
        this.$store.commit('printSkuModal', true);
      });
    },
    getPrintDate(id, row, referenceNo) {
      let v = this;
      return new Promise(resolve => {
        v.axios.post(api.queryAllByReceiptNo, { receiptNoList: [id] }).then(res => {
          if (res.data.code === 0) {
            // 添加参考编号
            res.data.datas.forEach(item => {
              if (row.referenceNo2) {
                item.referenceNo = row.referenceNo + '/' + v.sepCommasFn(row.referenceNo2).join('/');
              } else {
                item.referenceNo = row.referenceNo;
                if (referenceNo) {
                  item.referenceNo = referenceNo;
                }
              }
              // IDY-975 【入库单管理】打印产品标签默认打印数量等于入库单数量
              item.quantity = item.nobatchNumber;
            });
            // 默认第一个打印条码
            v.barCodeShow = res.data.datas[0].barcode;
            v.printDate = res.data.datas;
            resolve(res.data);
          }
        }).catch(() => {
        });
      });
    },
    printsuccess() {
    },
    openInportModal() {
      this.switchInportModal = true;
    },
    okInport() {
    },
    cancelInport() {
      this.switchInportModal = false;
    },
    tableSelectionChange(selection) {
      this.tableSltData = selection;
    },
    getPositionList(params = {}) {
      return new Promise(resolve => {
        let obj = {
          warehouseId: this.wareId, // warehouseBlockType: ['00', '10'],
          warehouseLocationStatus: 0,
          pickingFlag: this.$store.state.pickingFlag,
          ...params
        };
        this.axios.post(api.getLocationList, obj).then(res => {
          if (res.data.code === 0) {
            this.positionList = res.data.datas.list;
            resolve(res.data.datas.list);
          }
        });
      });
    },
    paramsObj() {
      let obj = {
        isOvercharge: "N",
        // closeReceipt: this.singleCheck ? "1" : "0",
        warehouseLocationId: this.receiptGoodPosition,
        resultFlag: 'S',
        receiptNos: this.tableSltData.map(val => val.receiptNo),
        warehouseId: this.wareId
      };
      return obj;
    }, // 保存批量收货上架信息
    saveBatchOptionInfo() {
      let obj = this.paramsObj();
      if (obj.warehouseLocationId === '' || obj.warehouseLocationId === null) {
        this.$Message.error('收货库位不能为空');
        return;
      }
      if (!this.ReceiptCheckSw) {
        obj.resultFlag = 'S';
      } else {
        obj.resultFlag = 'Q';
      }
      this.axios.post(api.createReceiptBatchList, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success(res.data.message);
          this.confirmModal = false;
          this.searchData();
        }
      });
    },
    okModal() {
      this.saveBatchOptionInfo();
    },
    cancelModal() {
      this.confirmModal = false;
    },
    batchOption(name) {
      let tableSltData = this.tableSltData || [];
      if (!tableSltData.length) return this.$Message.warning('请勾选数据');
      let [flag, _self, qulityType] = [true, this, {}];
      this.qulityName = null;// 重置值
      tableSltData.forEach(k => {
        flag && (k.receiptStatus !== '0') && (flag = false);// 非入库单创建
        // 存在质检单
        if (k.haveCheck == 1) {
          let isCheck = [1, 2, '1', '2'].includes(k.checkType);
          // 是否要质检
          if (isCheck) {
            !qulityType['check'] ? qulityType['check'] = [k] : qulityType['check'].push(k);
          } else {
            !qulityType['nocheck'] ? qulityType['nocheck'] = [k] : qulityType['nocheck'].push(k);
          }
        } else {
          !qulityType['none'] ? qulityType['none'] = [k] : qulityType['none'].push(k);
        }
      })
      let fun = {
        // 批量收货上架
        '2'() {
          _self.batchOptionType = 'shelf';
          if (!flag) return _self.$Message.warning('只有入库单创建状态才可以批量收货');
          let qulityKeys = Object.keys(qulityType);
          if (qulityKeys.length > 1) return _self.$Message.warning('批量选择的入库单需要有相同的是否要质检值才能批量收货');
          _self.qulityName = qulityKeys[0] || null;
          _self.ReceiptCheckSw = ['check'].includes(_self.qulityName);

          // 获取库位
          _self.getPositionList({ pageNum: 1, pageSize: 100000 }).then(data => {
            if (data.length > 0) {
              let value = data[0];
              data.forEach(i => {
                if (i.pickingCheckFlag === '1') {
                  value = i.warehouseLocationId;
                }
              });
              _self.receiptGoodPosition = value;
            }
          });
          _self.confirmModal = true;
        },
        // 批量收货需质检
        '3'() {
          _self.batchOptionType = 'qc';
          if (!flag) return _self.$Message.warning('只有入库单创建状态才可以批量收货');
          _self.getPositionList({
            pageNum: 1,
            pageSize: 100000
          }).then(data => {
            if (data.length > 0) {
              let value = data[0];
              data.forEach(i => {
                if (i.pickingCheckFlag === '1') {
                  value = i.warehouseLocationId;
                }
              });
              _self.receiptGoodPosition = value;
            }
          });
          _self.confirmModal = true;
        },
        // 批量关闭入库单
        '4'() {
          let arr = _self.tableSltData.filter(i => {
            return i.receiptStatus !== '2' ? i : '';
          });
          if (arr.length === 0) {
            _self.$Message.error({
              duration: 5,
              content: '没有选择可关闭入库单' // 没有选择可关闭入库单
            });
            return;
          }
          _self.$Modal.confirm({
            render: h => {
              return h('div', [
                h('Icon', {
                  props: {
                    type: 'md-help-circle'
                  },
                  style: {
                    fontSize: '40px',
                    color: 'orange',
                    marginRight: '20px'
                  }
                }, []), h('span', {
                  style: {
                    fontWeight: '600'
                  }
                }, ['批量关闭共', h('span', {}, arr.length), '张入库单，关闭后入库单不允许继续收货，操作不可退回'])
              ]);
            },
            onOk: () => {
              _self.axios.post(api.closeReceiptOrder + '?receiptIds=' + arr.map(val => val.receiptId).join(',')).then(res => {
                if (res.data.code === 0) {
                  _self.$Message.success(res.data.message);
                  _self.searchData();
                }
              });
            },
            onCancel: () => {
            }
          });
        }
      }
      name && fun[name] && fun[name]();
    },
    // 导入
    beforeUp() {
    },
    uploadSuccess(res, file, fileList) {
      if (res.code === 0) {
        this.$Message.success('导入成功');
      }
    },
    uploadError() {
    },
    exportFn(obj) {
      this.axios.post(api.exportReceipt, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
        }
      });
    }, // 导出
    exportAllOrSlt(name) {
      let obj = this.getParamsObj();
      if (name === '0') {
        // 选中
        if (this.tableSltData.length === 0) {
          this.$Message.warning('请选择导出数据');
          return;
        }
        obj.receiptNos = this.tableSltData.map(val => val.receiptNo);
        obj.exportType = '0';
        this.exportFn(obj);
      } else {
        // 所有
        if (this.data6.length === 0) {
          this.$Message.warning({
            content: '无数据导出',
            duration: 5
          });
          return;
        }
        let obj2 = {
          exportType: '1',
          warehouseId: this.wareId,
          ...obj
        };
        delete obj.pageSize;
        delete obj.pageNum;
        this.exportFn(obj2);
      }
    },
    getParamsObj() {
      let v = this;
      this.pageParams.pageSize = this.getPageSizeCache();
      let pageParams = this.pageParams;
      var paramsObj = {
        pageNum: pageParams.pageNum,
        pageSize: pageParams.pageSize,
        orderSeq: pageParams.DESC,
        orderBy: pageParams.CT,
        warehouseId: this.wareId,
        skus: v.sepCommasFn(pageParams.sku),
        referenceNoList: v.sepCommasFn(pageParams.searchWatchCode), // 参考编号
        createdStartTime: pageParams.createTime[0]
          ? this.$uDate.getUniversalTime(pageParams.createTime[0], 'fulltime')
          : null,
        createdEndTime: pageParams.createTime[1]
          ? this.$uDate.getUniversalTime(pageParams.createTime[1], 'fulltime')
          : null,
        lastReceivedStartTime: pageParams.lastReceivedTime[0]
          ? this.$uDate.getUniversalTime(pageParams.lastReceivedTime[0], 'fulltime')
          : null,
        lastReceivedEndTime: pageParams.lastReceivedTime[1]
          ? this.$uDate.getUniversalTime(
            pageParams.lastReceivedTime[1],
            "fulltime"
          )
          : null,
        createdByList: pageParams.createdByList,
      };
      if (pageParams.searchInWareCode) {
        paramsObj.receiptNos = v.sepCommasFn(pageParams.searchInWareCode);
      }
      // 输入入库单编号
      paramsObj.receiptType = pageParams.receiptType;
      // 选择入库单类型
      paramsObj.receiptStatus = pageParams.selectInWareStatus;
      // 选择入库单状态
      paramsObj.abnormalStatus = pageParams.selectReceiveErrorType;
      paramsObj.transitStatus = pageParams.transitStatus;

      // 选择收货异常
      if (pageParams.cargoOwnerId) {
        if (pageParams.cargoOwnerId === '_NO_CARGO_OWNER') {
          // 无货主
          paramsObj.cargoOwnerType = 0;
          paramsObj.cargoOwnerId = null;
        } else {
          paramsObj.cargoOwnerType = 1;
          paramsObj.cargoOwnerId = pageParams.cargoOwnerId;
        }
      } else {
        paramsObj.cargoOwnerType = null;
        paramsObj.cargoOwnerId = null;
      }
      let data = this.$common.removeEmpty(paramsObj);
      return data;
    }, // 查询功能
    searchData() {
      var v = this;
      if (v.getPermission("wmsReceipt_query")) {
        let paramsObj = this.getParamsObj();
        v.TableLoading = true;
        v.SearchDisabled = true;
        v.axios.post(api.inWareListSearchData, paramsObj).then((res) => {
          v.SearchDisabled = false;
          if (res.data.code === 0) {
            let list = res.data.datas.list || [];
            list = v.processTimeData(list, "expectedStartTime");
            list = v.processTimeData(list, "expectedEndTime");
            list = v.processTimeData(list, "lastReceivedTime");
            list = v.processTimeData(list, "createdTime");
            v.data6 = list;
            v.totalRecords = res.data.datas.total;
            v.tableSltData = [];
          }
        }).finally(() => {
          v.TableLoading = false;
        });
      } else {
        v.gotoError(); // 无权限
      }
    }, // 页面查询
    receiptSearch() {
      this.pageParams.pageNum = 1;
      this.searchData();
    }, // 关闭入库单
    closeInWareOrder() {
      var v = this;
      v.axios
        .post(api.closeReceiptOrder + "?receiptIds=" + [this.inWareOrderId])
        .then((res) => {
          if (res.data.code === 0) {
            v.$Message.success("成功关闭入库单");
            v.searchData();
          }
        });
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.DESC = type;
      this.pageParams.CT = feild;
      this.searchData();
    },
    // 表格分页
    changePage(page) {
      this.pageParams.pageNum = page;
      this.searchData();
    }, // 切换每页条数
    changePageSize(size) {
      this.setPageSizeCache(size);
      this.pageParams.pageSize = size;
      this.searchData();
    },
    showCreateInWareModal() {
      this.workShow = 'add';
    },
    // 重置按钮
    reset() {
      this.$refs['pageParams'].resetFields();
    },
    // 查看入库单详情
    seeReceiptDetail(row) {
      if (!this.getPermission("wmsReceipt_detail")) return;
      this.$store.commit("activeRow", row);
      this.workShow = "watch";
      this.inWareOrderId = row.receiptId; // 当前行的入库单id
      this.inWareOrderNo = row.receiptNo; // 当前行的入库单编号
    },
    // 复制
    copyFun(str) {
      this.$common.copyString(str);
      this.$Message.success("已复制");
    }
  }
};
</script>
<style lang="less" scoped>
.inWareManagePage {
  height: 100%;

  .receiptNo {
    text-align: left;
    padding: 10px 0;

    .ivu-tag {
      border: none;
    }
  }

  .stockType {
    margin-left: "4px";
    font-size: "22px";
    font-weight: "bold";
    color: "#2D8CF0";
  }
}
</style>
