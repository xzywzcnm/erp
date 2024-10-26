<template >
  <div class="productAbnormal page-main-content">
    <div class="listPage">
      <div class="searchMain">
        <div class="page-head-btn-group">
          <RadioGroup v-model="tabIndex" type="button" @on-change="showCurrentPage">
            <Radio label="-1">全部</Radio>
            <Radio v-for="(item, tIndex) in Object.values(statusList)" :key="`r-${tIndex}`" :label="item.value">
              <span>{{ item.label }}</span>
              <span v-if="!$common.isEmpty(item.number)" style="color:#f20;">({{ item.number }})</span>
            </Radio>
          </RadioGroup>
        </div>
        <Form ref="pageSearchForm" :model="searchFormData" :label-width="90">
          <dyt-filter ref="dyt-filter">
            <FormItem label="平台主体" prop="platformId">
              <dyt-select v-model="searchFormData.platformId" placeholder="请选择平台主体" @on-change="platformChange">
                <Option v-for="(item, index) in platformDataList" :value="item.platformId" :key="`a-${index}`"
                  :label="item.platformName" />
              </dyt-select>
            </FormItem>
            <FormItem label="店铺" prop="saleAccountIdList">
              <dyt-select v-model="searchFormData.saleAccountIdList" multiple :max-tag-count="1"
                :placeholder="$common.isEmpty(searchFormData.platformId) ? '请先选择平台主体后再选择店铺' : '请选择店铺'">
                <Option v-for="(item, index) in (platformSaleAccountObj[searchFormData.platformId] || [])"
                  :value="item.saleAccountId" :key="`a-${index}`" :label="item.account" />
              </dyt-select>
            </FormItem>
            <FormItem label="创建时间" prop="createdTime">
              <DatePicker type="datetimerange" transfer placeholder="选择创建时间" v-model="searchFormData.createdTime"
                format="yyyy-MM-dd HH:mm:ss" :options="datePickerOptions" />
            </FormItem>
            <FormItem label="供应商" prop="supplierId">
              <dyt-select v-model="searchFormData.supplierId" placeholder="请选择供应商" @on-change="supplierChange">
                <Option v-for="(item, index) in supplierDataList" :value="item.supplierId" :key="`s-${index}`"
                  :label="item.supplierName" />
              </dyt-select>
            </FormItem>
            <FormItem label="出库单号" prop="directDeliverPickingNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model="searchFormData.directDeliverPickingNoList"
                placeholder="多个请用逗号或回车分隔" />
            </FormItem>
            <FormItem label="平台订单号" prop="platformOrderNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model="searchFormData.platformOrderNoList"
                placeholder="多个请用逗号或回车分隔" />
            </FormItem>
            <FormItem label="SKU" prop="skuList">
              <dyt-input-tag :limit="1" type="textarea" v-model="searchFormData.skuList" placeholder="多个请用逗号或回车分隔" />
            </FormItem>
            <FormItem label="供方货号" prop="supplierItemList">
              <dyt-input-tag :limit="1" type="textarea" v-model="searchFormData.supplierItemList"
                placeholder="多个请用逗号或回车分隔" />
            </FormItem>
            <FormItem label="SKC" prop="skcList">
              <dyt-input-tag :limit="1" type="textarea" v-model="searchFormData.skcList" placeholder="多个请用逗号或回车分隔" />
            </FormItem>
            <FormItem label="创建人" prop="createdBy">
              <dyt-select v-model="searchFormData.createdBy" placeholder="请选择创建人">
                <Option v-for="(item, index) in Object.values(userInfoList || {})" :value="item.userId"
                  :key="`u-${index}`" :label="item.userName" />
              </dyt-select>
            </FormItem>
            <FormItem label="事业部" prop="businessDeptId">
              <dyt-select v-model="searchFormData.businessDeptId" placeholder="请选择事业部">
                <Option v-for="(item, index) in getBusinessDept" :value="item.id" :key="`b-${index}`"
                  :label="item.name" />
              </dyt-select>
            </FormItem>
            <FormItem label="快递公司" prop="expressCompany">
              <dyt-select v-model="searchFormData.expressCompany" placeholder="请选择快递公司">
                <Option v-for="(item, index) in logisticsList" :value="item.logisticsId" :key="`e-${index}`"
                  :label="item.logisticsName" />
              </dyt-select>
            </FormItem>
            <FormItem label="快递单号" prop="trackingNumberList">
              <dyt-input-tag :limit="1" type="textarea" v-model="searchFormData.trackingNumberList"
                placeholder="多个请用逗号或回车分隔" />
            </FormItem>
            <FormItem label="收货时间" prop="receiveTime">
              <DatePicker type="datetimerange" transfer placeholder="选择收货时间" v-model="searchFormData.receiveTime"
                format="yyyy-MM-dd HH:mm:ss" :options="datePickerOptions" />
            </FormItem>
            <FormItem label="匹配采购单号" prop="matchPurchaseNumberList">
              <dyt-input-tag :limit="1" type="textarea" v-model="searchFormData.matchPurchaseNumberList"
                placeholder="多个请用逗号或回车分隔" />
            </FormItem>
            <div slot="operation">
              <Button type="primary" @click="searchData(true)" :disabled="searchLoading" icon="md-search">查询</Button>
              <Button style="margin-left: 10px" @click="resetSearch" icon="md-refresh">重置</Button>
            </div>
          </dyt-filter>
        </Form>
      </div>
      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <Button type="primary" icon="md-add" @click="openInsetModal('add')" v-if="permission.add">创建直发单</Button>
            <Button type="primary" class="ml10" @click="openInsetModal('import')" v-if="permission.import">导入直发单</Button>
            <Button type="primary" class="ml10" @click="batchSubmit"
              :disabled="dirDelPickingNo.length == 0 || tableSelectionData.length != dirDelPickingNo.length"
              v-if="permission.batchCommit" :title="`${dirDelPickingNo.length == 0 || tableSelectionData.length != dirDelPickingNo.length ? '请选择状态为“订单创建”的数据进行操作' : ''
                }`">批量提交</Button>
            <Dropdown class="ml10" v-if="permission.export" @on-click="exportData">
              <Button type="primary">导出 <Icon type="md-arrow-dropdown"></Icon></Button>
              <DropdownMenu slot="list">
                <DropdownItem name="1">导出选中</DropdownItem>
                <DropdownItem name="2">导出所有</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <!-- <Button type="primary" class="ml10" @click="exportData" v-if="permission.export">导出</Button> -->

            <Dropdown class="ml10" v-if="permission.exportDetail" @on-click="exportDetailData">
              <Button type="primary">导出明细 <Icon type="md-arrow-dropdown"></Icon></Button>
              <DropdownMenu slot="list">
                <DropdownItem name="1">导出选中明细</DropdownItem>
                <DropdownItem name="2">导出所有明细</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <!-- <Button type="primary" class="ml10" @click="exportDetailData" v-if="permission.exportDetail"
              :disabled="tableSelectionData.length <= 0" :loading="exportDetailLoading">导出明细</Button> -->
          </div>
          <!--排序-->
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>
      <div class="tableMain">
        <div class="tableBox">
          <Table border highlight-row :height="tableHeight" ref="tableRef" :columns="tableColumns"
            :loading="searchLoading" :data="tableDaata" @on-selection-change="tableSelectionChange"></Table>
        </div>
      </div>
      <!--分页-->
      <div class="pagesMain">
        <Page :total="tableTotal" :current="searchFormData.pageNum" :page-size="searchFormData.pageSize" show-total
          show-sizer show-elevator @on-change="pageNumChange" @on-page-size-change="pageSizeChange"
          :page-size-opts="pageArray">
        </Page>
      </div>
    </div>
    <!-- 创建咨询(导入)弹窗 -->
    <insetOrderModal :visible.sync="insetOrderVisible" :module-data="insetOrderObj" @insetConfirm="openOrderDetails"
      @refreshPage="searchData" />
    <!-- 快递详情 -->
    <expressDeliveryModal :visible.sync="expressVisible" :module-data="checkTableRowInfo" :logistics-data="logisticsList"
      :platformDataList="platformDataList" :platformSaleAccountObj="platformSaleAccountObj" :statusList="statusList"
      :supplierDataList="supplierDataList" />
    <!-- 详情页面 -->
    <directlyDetails :visible.sync="detailsVisible" :module-data="checkTableRowInfo" :other-data="insetOrderObj"
      :view-type="viewType" @refreshPage="searchData" />
    <!-- 加载遮罩层 -->
    <Spin v-if="pageLoading" fix></Spin>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import insetOrderModal from './insetOrderModal';
// import exDeliveryDetails from "@/views/wms/stockOUt/fullyManage/components/exDeliveryDetails";
import expressDeliveryModal from './expressDeliveryModal';
import directlyDetails from './directlyDetails';

export default {
  mixins: [Mixin],
  components: {
    insetOrderModal,
    expressDeliveryModal,
    directlyDetails
  },
  data() {
    return {
      insetOrderVisible: false,
      expressVisible: false,
      detailsVisible: false,
      // exportDetailLoading: false,
      checkTableRowInfo: {},
      supplierDataList: [],
      viewType: 'view',
      insetOrderObj: {
        type: 'add',
        platformSaleAccountObj: {},
        platformDataList: [],
        supplierDataList: [],
        logisticsList: [],
        data: {}
      },
      tabIndex: "-1",
      statusList: {
        0: { label: "订单创建", value: '0', key: 'createNumber', number: 0 },
        1: { label: "待发货", value: '1', key: 'awaitDeliverNumber', number: 0 },
        2: { label: "已发货", value: '2', key: 'alreadyDeliverNumber', number: 0 },
        3: { label: "收货完成", value: '3' },
      },
      // 平台主体
      platformDataList: [],
      // 对应平台主体下的店铺
      platformSaleAccountObj: {},
      // 用户
      userInfoList: [],
      // 快递公司
      logisticsList: [],
      whouseId: this.$store.state.warehouseId,
      // 搜索栏值
      searchFormData: {
        pageNum: 1,
        pageSize: 20,
        orderBy: 'CT',
        orderSeq: 'DESC',
        platformId: '',
        saleAccountIdList: [],
        deliverPickingStatus: null,
        createdTime: this.$common.getRangeDate(-7),
        receiveTime: [],
        matchPurchaseNumberList: [],
        supplierId: '',
        directDeliverPickingNoList: [],
        platformOrderNoList: [],
        skuList: [],
        supplierItemList: [],
        skcList: [],
        trackingNumberList: [],
        expressCompany: '',
        createdBy: '',
        businessDeptId: '',
        supplierCode: '',
      },
      searchLoading: false,
      pageLoading: false,
      sortButtonList: [
        {
          sortHeader: "按创建时间",
          sortField: "CT",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "按收货时间",
          sortField: "RT",
          sortType: "DESC",
          default: false,
        },
      ],
      // 表格列
      tableColumns: [
        {
          type: "selection",
          width: 50,
          align: "center",
        },
        {
          title: "直发出库单",
          key: "directDeliverPickingNo",
          align: "center",
          minWidth: 200,
          render: (h, { row }) => {
            let item = [];
            let tagItem = [];
            item.push(h('div', {
              style: {
                'text-align': 'left'
              }
            }, [
              h('span', {}, '单号：'),
              h('span', {
                class: this.permission.view ? 'underline' : '',
                on: {
                  click: () => {
                    if (!this.permission.view) return;
                    this.openOrderDetails({ data: row, type: 'view' });
                  }
                }
              }, row.directDeliverPickingNo),
            ]));
            let supplierName = '';
            if (!this.$common.isEmpty(row.supplierId)) {
              const supplierInfo = this.supplierDataList.find(sup => row.supplierId == sup.supplierId);
              if (!this.$common.isEmpty(supplierInfo)) {
                supplierName = supplierInfo.supplierName;
              }
            }
            item.push(h('div', {
              attrs: {
                title: '供应商',
              },
              style: {
                'text-align': 'left',
                'margin': '5px 0'
              }
            }, supplierName || row.supplierName));
            let account = {};
            if (!this.$common.isEmpty(row.platformSubject)) {
              const platformInfo = this.platformDataList.find(item => item.platformId == row.platformSubject);
              let platformName = row.platformSubject;
              let platformId = row.platformSubject;
              if (!this.$common.isEmpty(platformInfo)) {
                platformName = platformInfo.platformName;
                platformId = platformInfo.platformId;
              }
              if (!this.$common.isEmpty(this.platformSaleAccountObj[platformId])) {
                account = this.platformSaleAccountObj[platformId].find(acc => acc.saleAccountId == row.saleAccountId);
              }
              tagItem.push(h(
                "Tag",
                {
                  props: { color: "volcano" },
                  attrs: { title: "平台主体" },
                },
                platformName
              ));
            }
            tagItem.push(h('Tag', {
              props: { color: "magenta" },
              attrs: { title: "店铺" },
            }, this.$common.isEmpty(account) ? row.accountCode : account.account));
            !this.$common.isEmpty(this.statusList[row.deliverPickingStatus]) && tagItem.push(h('Tag', {
              props: { color: "green" },
              attrs: { title: "状态" },
            }, this.statusList[row.deliverPickingStatus].label));
            item.push(h('div', {
              class: 'tag-hideBorder',
              style: {
                'text-align': 'left'
              }
            }, tagItem));
            return item;
          }
        },
        {
          title: "平台订单号",
          key: "platformOrderNo",
          align: "center",
          width: 150,
        },
        {
          title: "备注",
          key: "remark",
          align: "center",
          minWidth: 150,
        },
        {
          title: "图片",
          key: "goodsUrls",
          align: "center",
          width: 60,
          render: (h, { row }) => {
            return h('div', {
              style: {
                margin: '5px 0'
              }
            }, [this.tableImg(h, row, "goodsUrls")]);
          }
        },
        {
          title: "SKU数量",
          key: "skuNumber",
          align: "center",
          width: 75,
        },
        {
          title: "商品数量",
          key: "orderNumberSum",
          align: "center",
          width: 75,
        },
        {
          title: "发货数量",
          key: "deliverNumberSum",
          align: "center",
          width: 75,
        },
        {
          title: "预约快递",
          key: "expressCompany",
          align: "center",
          width: 130,
          render: (h, { row }) => {
            const expressInfo = this.logisticsList.find(item => item.logisticsId === Number(row.expressCompany));
            const expressCompany = this.$common.isEmpty(expressInfo) ? row.expressCompany : expressInfo.logisticsName;
            let item = [];
            item.push(h('div', {}, expressCompany));
            item.push(h('div', {
              class: 'underline',
              style: {
                'margin-top': '5px'
              },
              on: {
                click: () => {
                  this.openExpressInfo(row);
                }
              }
            }, row.trackingNumber));
            return h('div', {
              style: {
                'display': 'inline-block',
                'text-align': 'left'
              }
            }, item);
          }
        },
        {
          title: "预约时间",
          key: "appointmentTime",
          align: "center",
          width: 155,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.appointmentTime)) return h('span', '');
            return h('span', {}, [
              h('span', {}, row.appointmentTime),
              h('span', {
                style: {
                  'margin-left': '5px',
                  color: '#f20'
                }
              }, this.getDayTypeTxt(row.appointmentTime))
            ]);
          }
        },
        {
          title: "平台入库",
          key: "platformReceiptNumberSum",
          align: "center",
          width: 75,
        },
        {
          title: "平台退货",
          key: "platformReturnNumberSum",
          align: "center",
          width: 75,
        },
        {
          title: "创建人",
          key: "createdBy",
          align: "center",
          width: 120,
          render: (h, { row }) => {
            const businessInfo = this.getBusinessDept.find(item => item.id == row.businessDeptId);
            return h('div', {
              style: {
                'display': 'inline-block',
                'text-align': 'left'
              }
            }, [
              h('div', {
                attrs: {
                  title: '创建人',
                }
              }, this.getUserName(row.createdBy)),
              h('div', {
                style: {
                  'margin-top': '5px'
                },
                attrs: {
                  title: '创建人事业部',
                }
              }, this.$common.isEmpty(businessInfo) ? '' : businessInfo.name || '')
            ]);
          }
        },
        {
          title: "创建时间",
          key: "createdTime",
          align: "center",
          width: 130,
          renderHeader: (h, { column }) => {
            return h('div', {}, [
              h('div', {}, '创建时间'),
              h('div', {}, '收货时间')
            ]);
          },
          render: (h, { row }) => {
            return h('div', {}, [
              h('div', {
                attrs: {
                  title: '创建时间',
                }
              }, this.$common.isEmpty(row.createdTime) ? '--' : row.createdTime),
              h('div', {
                attrs: {
                  title: '收货时间',
                }
              }, this.$common.isEmpty(row.receiveTime) ? '--' : row.receiveTime)
            ]);
          }
        },
        {
          title: "操作",
          key: "operation",
          align: "center",
          width: 110,
          fixed: "right",
          render: (h, { row }) => {
            let item = [];
            if (this.permission.edit && [0, 1].includes(Number(row.deliverPickingStatus))) {
              item.push(h('span', {
                class: 'operation-btn',
                on: {
                  click: () => {
                    this.openOrderDetails({ data: row, type: 'edit' });
                  }
                }
              }, '编辑'));
            }
            if (this.permission.verify && [1, 2].includes(Number(row.deliverPickingStatus))) {
              item.push(h('span', {
                class: 'operation-btn',
                on: {
                  click: () => {
                    this.openOrderDetails({ data: row, type: 'verify' });
                  }
                }
              }, '收货确认'));
            }
            return item;
          }
        }
      ],
      // 表格数据
      tableDaata: [],
      // 选中数据
      tableSelectionData: [],
      // 列表总条数
      tableTotal: 0,
      initPage: true,
    };
  },
  watch: {},
  created() { },
  computed: {
    tableHeight() {
      return this.getTableHeight(320);
    },
    // 权限
    permission() {
      return {
        // 查询
        query: this.getPermission("trusteeshipOutOrder_list"),
        // 创建
        add: this.getPermission('trusteeshipOutOrder_create'),
        // 编辑
        edit: this.getPermission('trusteeshipOutOrder_update'),
        // 查看
        view: this.getPermission("trusteeshipOutOrder_detail"),
        // 导出
        export: this.getPermission("trusteeshipOutOrder_export"),
        // 导出明细
        exportDetail: this.getPermission("trusteeshipOutOrder_exportDetail"),
        // 确认收货
        verify: this.getPermission('trusteeshipOutOrder_receiptConfirmation'),
        // 批量提交
        batchCommit: this.getPermission('trusteeshipOutOrder_batchCommit'),
        // 导入
        import: this.getPermission('trusteeshipOutOrder_import'),
      };
    },
    // 所有的事业部
    getBusinessDept() {
      return this.$store.getters.getBusinessDeptList || [];
    },
    // 可批量提交的数据
    dirDelPickingNo() {
      return this.tableSelectionData.filter(row => {
        return [0].includes(Number(row.deliverPickingStatus));
      }).map(item => {
        return item.directDeliverPickingNo;
      });
    }
  },
  activated() {
    if (this.initPage) return;
    this.searchData();
  },
  mounted() {
    this.initData();
  },
  methods: {
    initData() {
      this.pageLoading = true;
      this.$common.promiseAll([
        // 供应商
        this.getSupplierList,
        // 主体平台
        this.getPlatformData,
        // 所有用户
        this.getUserMesCommon,
        // 所有快递公司
        () => {
          return this.$store.dispatch("getLogisticsList")
        }
      ]).finally(() => {
        const newLogisticsData = this.$common.arrayToObj((this.$store.state.logisticsList || []), 'logisticsCode');
        this.logisticsList = Object.values(newLogisticsData);
        this.insetOrderObj.logisticsList = this.$common.copy(this.logisticsList);
        this.userInfoList = this.$common.copy(this.$store.state.userInfoList || {});
        this.searchData();
        this.pageLoading = false;
        this.initPage = false;
      })
    },
    // 查询列表数据
    searchData(type) {
      if (!this.permission.query) return this.$Message.error('您暂无权限查看当前页面数据');
      if (this.searchLoading) return;
      this.searchLoading = true;
      // 是否重置页码
      if (type) {
        this.searchFormData.pageNum = 1;
      }
      this.tableSelectionData = [];
      const param = this.getParamsData();
      this.$common.promiseAll([
        () => {
          return this.getTableData(param);
        },
        () => {
          return this.getTotalNumber();
        },
      ]).finally(() => {
        this.$nextTick(() => {
          this.searchLoading = false;
        })
      })
    },
    // 获取表格数据
    getTableData(param) {
      return new Promise((resolve) => {
        this.axios.post(api.trusteeship_list, param).then((res) => {
          if (!res || !res.data || res.data.code != 0) return;
          this.tableDaata = res.data.datas.list || [];
          this.tableTotal = res.data.datas.total;
        }).finally(() => {
          resolve([]);
        })
      })
    },
    // 查询数量
    getTotalNumber() {
      return new Promise((resolve) => {
        // let newParam = this.getParamsData();
        // delete newParam.deliverPickingStatus;
        this.axios.post(api.queryDirectDeliverPickingNumber, {
          warehouseId: this.$store.state.warehouseId
        }).then((res) => {
          if (!res || !res.data || res.data.code != 0) return;
          Object.values(this.statusList).forEach((item) => {
            if (!this.$common.isEmpty(item.key)) {
              if (!this.$common.isEmpty(res.data.datas[item.key])) {
                item.number = res.data.datas[item.key];
              } else {
                item.number = 0;
              }
            }
          })
        }).finally(() => {
          resolve({});
        })
      })
    },
    // 重置搜索栏
    resetSearch() {
      this.searchFormData.supplierCode = '';
      this.$refs["pageSearchForm"].resetFields();
      this.$nextTick(() => {
        if (['-1', '3'].includes(this.tabIndex)) {
          this.searchFormData.createdTime = this.$common.getRangeDate(-7);
        } else {
          this.searchFormData.createdTime = [];
        }
      })
    },
    // 返回搜索栏的值
    getParamsData() {
      let param = this.$common.copy(this.searchFormData);
      param.deliverPickingStatus = this.tabIndex == '-1' ? null : Number(this.tabIndex);
      param.createdStartTime = null;
      param.createdEndTime = null;
      if (!this.$common.isEmpty(param.createdTime) && !this.$common.isEmpty(param.createdTime[0])) {
        param.createdStartTime = this.$common.toISODate(param.createdTime[0], 'fulltime');
        param.createdEndTime = this.$common.toISODate(param.createdTime[1], 'fulltime');
      }
      param.receiveStartTime = null;
      param.receiveEndTime = null;
      if (!this.$common.isEmpty(param.receiveTime) && !this.$common.isEmpty(param.receiveTime[0])) {
        param.receiveStartTime = this.$common.toISODate(param.receiveTime[0], 'fulltime');
        param.receiveEndTime = this.$common.toISODate(param.receiveTime[1], 'fulltime');
      }
      const platformInfo = this.platformDataList.find(item => item.platformId == param.platformId);
      param.platformSubject = this.$common.isEmpty(platformInfo) ? '' : platformInfo.platformName;
      param.warehouseId = this.whouseId;
      delete param.createdTime;
      delete param.receiveTime;
      delete param.platformId;
      return param;
    },
    // 切换到对应状态的列表
    showCurrentPage() {
      this.$nextTick(() => {
        this.searchFormData.pageNum = 1;
        if (['-1', '3'].includes(this.tabIndex)) {
          this.searchFormData.createdTime = this.$common.getRangeDate(-7);
        } else {
          this.searchFormData.createdTime = [];
        }
        this.$nextTick(() => {
          this.searchData();
        })
      })
    },
    // 返回  今天、明天、后天，其他日期返回空
    getDayTypeTxt(dateTxt) {
      if (this.$common.isEmpty(dateTxt)) return '';
      const dateDay = this.$common.dayjs(dateTxt).format('YYYY-MM-DD');
      const nowDay = this.$common.dayjs().format('YYYY-MM-DD');
      if (nowDay == dateDay) return '今天';
      if (this.$common.dayjs(nowDay).add(1, 'day').isSame(dateDay, 'day')) return '明天';
      if (this.$common.dayjs(nowDay).add(2, 'day').isSame(dateDay, 'day')) return '后天';
      return '';
    },
    // 选中
    tableSelectionChange(val) {
      this.tableSelectionData = val;
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.searchFormData.orderSeq = type;
      this.searchFormData.orderBy = feild;
      this.$nextTick(() => {
        this.searchData();
      });
    },
    // 页码改变
    pageNumChange(page) {
      this.searchFormData.pageNum = page;
      this.$nextTick(() => {
        this.searchData();
      });
    },
    // 条数改变
    pageSizeChange(size) {
      this.searchFormData.pageSize = size;
      this.$nextTick(() => {
        this.searchData();
      });
    },
    // 打开创建(导入)提示弹窗
    openInsetModal(type) {
      this.insetOrderObj.type = type;
      this.insetOrderObj.platformSaleAccountObj = this.platformSaleAccountObj;
      this.insetOrderObj.platformDataList = this.platformDataList;
      this.insetOrderObj.supplierDataList = this.supplierDataList;
      this.$nextTick(() => {
        this.insetOrderVisible = true;
      })
    },
    // 获取已初始库存余量的供应商
    getSupplierList() {
      return new Promise((resolve) => {
        if (!this.$common.isEmpty(this.supplierDataList)) return resolve(this.supplierDataList);
        this.axios.post(`${api.get_SupplierInfo}?businessDeptIds=''`).then(res => {
          if (!res || !res.data || !res.data.datas) {
            this.supplierDataList = [];
            return resolve([]);
          }
          this.supplierDataList = (res.data.datas || []).filter(item => {
            return item.isInitInventory == 1;
          });
          resolve(this.supplierDataList);
        }).catch(() => {
          this.supplierDataList = [];
          return resolve([]);
        })
      })
    },
    // 批量提交
    batchSubmit() {
      if (this.dirDelPickingNo.length <= 0 || this.tableSelectionData.length != this.dirDelPickingNo.length) {
        this.$Message.error('请选择状态为"订单创建"的数据进行操作');
        return;
      }
      this.$Modal.confirm({
        title: '操作提示',
        width: '560px',
        content: `<div style="font-size: 16px;">
          <div>确认是否要提交出库单，数量：<span style="color:#f60;">${this.dirDelPickingNo.length}</span></div>
          <div style="margin-top: 20px;">提示：直发出库单提交给供应商后，商品信息不能再修改！</div>
        </div>`,
        closable: true,
        onOk: () => {
          this.axios.post(api.trusteeship_batchCommit, this.dirDelPickingNo).then(res => {
            if (!res || !res.data || res.data.code !== 0) return;
            this.$Message.success('操作成功');
            this.$nextTick(() => {
              this.searchData();
            });
          });
        }
      });
    },
    // 导出
    exportData(e) {
      let tips = null;
      let param = {};
      if (e == 1) {
        let list = this.tableSelectionData.map(k => k.directDeliverPickingNo);
        if (!list.length) {
          this.$Message.warning("请选择导出数据");
          return;
        }
        tips = '选中';
        param.directDeliverPickingNoList = list;
        param.warehouseId = this.whouseId;
      } else {
        param = this.getParamsData();
        delete param.pageNum;
        delete param.pageSize;
        tips = '所有';
      }
      this.$Modal.confirm({
        title: '操作提示',
        content: `导出${tips}行的列表数据`,
        closable: true,
        onOk: () => {
          this.axios.post(api.directDeliverPicking_export, param).then(res => {
            if (!res || !res.data || res.data.code !== 0) return;
            this.$Message.success('操作成功');
            this.$refs.tableRef.selectAll(false);
          });
        }
      });
    },
    // 导出明细
    exportDetailData(e) {
      let tips = null;
      let param = {};
      if (e == 1) {
        let list = this.tableSelectionData.map(k => k.directDeliverPickingNo);
        if (!list.length) {
          this.$Message.warning("请选择导出数据");
          return;
        }
        tips = '选中';
        param.directDeliverPickingNoList = list;
        param.warehouseId = this.whouseId;
      } else {
        param = this.getParamsData();
        delete param.pageNum;
        delete param.pageSize;
        tips = '所有';
      }
      this.$Modal.confirm({
        title: '导出明细',
        content: `导出${tips}行的明细数据`,
        closable: true,
        onOk: () => {
          this.axios.post(api.directDeliverPicking_exportDetail, param).then(res => {
            if (!res || !res.data || res.data.code !== 0) return;
            this.$Message.success('操作成功');
            this.$refs.tableRef.selectAll(false);
          })
        }
      });
    },
    // 获取平台主体
    getPlatformData() {
      return new Promise((resolve) => {
        if (!this.$common.isEmpty(this.platformDataList)) return resolve(this.platformDataList);
        this.axios.get(api.queryPlatformId).then(res => {
          if (!res || !res.data || !res.data.datas) {
            this.supplierDataList = [];
            return resolve([]);
          }
          this.platformDataList = (res.data.datas || []);
          this.$common.promiseAll(this.platformDataList.map((item) => {
            return () => {
              return this.getAccountByPlatformId(item.platformId)
            }
          })).finally(() => {
            resolve(this.supplierDataList);
          })
        }).catch(() => {
          this.supplierDataList = [];
          return resolve([]);
        })
      })
    },
    // 获取对应平台主体下的店铺
    getAccountByPlatformId(platformId) {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(platformId)) return resolve([]);
        if (!this.$common.isEmpty(this.platformSaleAccountObj[platformId])) return resolve(this.platformSaleAccountObj[platformId]);
        this.axios.get(api.queryThirdAccountByPlatformId, {
          params: {
            platformId: platformId
          }
        }).then(res => {
          if (!res || !res.data || !res.data.datas) {
            this.$set(this.platformSaleAccountObj, platformId, []);
            return resolve([]);
          }
          this.$set(this.platformSaleAccountObj, platformId, (res.data.datas || []));
          resolve(this.platformSaleAccountObj[platformId]);
        }).catch(() => {
          this.$set(this.platformSaleAccountObj, platformId, []);
          return resolve([]);
        })
      })
    },
    // 平台改变
    platformChange(val) {
      this.searchFormData.saleAccountIdList = [];
    },
    // 供应商改变
    supplierChange(val) {
      const supplierInfo = this.supplierDataList.find(item => val == item.supplierId);
      this.searchFormData.supplierCode = this.$common.isEmpty(supplierInfo) ? '' : supplierInfo.supplierCode;
    },
    // 创建、编辑、收货确认、查看弹窗
    openOrderDetails(obj) {
      this.checkTableRowInfo = this.$common.copy(obj.data || {});
      this.viewType = obj.type || 'view';
      if (this.$common.isEmpty(this.insetOrderObj.platformSaleAccountObj)) {
        this.insetOrderObj.platformSaleAccountObj = this.platformSaleAccountObj;
        this.insetOrderObj.platformDataList = this.platformDataList;
        this.insetOrderObj.supplierDataList = this.supplierDataList;
      }
      this.$nextTick(() => {
        this.detailsVisible = true;
      })
    },
    // 打开
    openExpressInfo(row) {
      this.checkTableRowInfo = this.$common.copy(row);
      this.$nextTick(() => {
        this.expressVisible = true;
      })
    },
  }
};
</script>
<style lang="less" scoped>
.page-main-content {
  .page-head-btn-group {
    position: relative;
    margin-bottom: 15px;
    border-bottom: 1px solid #dcdee2;

    .ivu-radio-group-item {
      border-radius: 0;
      border: none;
      box-shadow: none;

      &:focus-visible {
        outline: none;
      }
    }

    .ivu-radio-wrapper:after,
    .ivu-radio-wrapper:before {
      display: none;
    }

    .ivu-radio-wrapper-checked {
      // background: #2d8cf0;
      color: #2d8cf0;
      border-left: none;
      border-top: none;
      border-right: none;
      border-bottom: 2px solid #2d8cf0;
    }
  }

  :deep(.ivu-table-cell) {
    .operation-btn {
      display: inline-block;
      margin-left: 10px;
      color: #2d8cf0;
      text-decoration: underline;
      text-underline-position: under;
      cursor: pointer;

      &:nth-of-type(1) {
        margin-left: 0;
      }
    }
  }

  :deep(.underline) {
    color: #2d8cf0;
    text-decoration: underline;
    text-underline-position: under;
    cursor: pointer;
  }

  :deep(.row-tag-item) {
    display: inline-block;
    margin: 4px 8px 0px 0px;
    padding: 1px 8px;
    background: #f3f3f4;
    border-radius: 3px;
  }
}
</style>