<template>
  <div class="returnOrderPage">
    <template v-if="curPage === 'returnsManagement'">
      <div class="listPage">
        <div class="searchMain">
          <Form ref="pageParams" :model="pageParams" :label-width="80">
            <FormItem label="平台主体:" prop="platform">
              <RadioGroup v-model="pageParams.platform" type="button" button-style="solid" @on-change="changeHandleType"
                size="small">
                <div v-for="(item, index) in platformList" :key="index">
                  <Radio :label="item.label" :value="item.label"></Radio>
                </div>
              </RadioGroup>
            </FormItem>
            <dyt-filter ref="dyt-filter" @expand="expand">
              <FormItem label="店铺:" prop="shop">
                <dyt-select v-model="pageParams.accountIdList" :max-tag-count="1" multiple clearable placeholder="请选择">
                  <Option v-for="(item, index) in storeArr" :value="item.saleAccountId" :key="index">{{
                    item.accountCode }} </Option>
                </dyt-select>
              </FormItem>
              <FormItem label="退货单号:" prop="returnCodeList">
                <dyt-input-tag :limit="1" v-model="pageParams.returnCodeList" placeholder="多个用逗号或回车分开"
                  type="textarea"></dyt-input-tag>
              </FormItem>
              <FormItem label="创建时间:" prop="createTime">
                <DatePicker transfer type="datetimerange" placement="bottom-end" placeholder="选择日期" split-panels
                  v-model="createTime" @on-clear="resetDate('created')" format="yyyy-MM-dd HH:mm:ss"
                  :options="dateOptions" @on-change="(e) => { getDateValue(e, 'created') }" />
              </FormItem>
              <FormItem label="退货单状态:" prop="returnStatusList">
                <dyt-select v-model="pageParams.returnStatusList" :max-tag-count="1" multiple clearable placeholder="请选择">
                  <Option v-for="(item, index) in stateArr" :value="item.value" :key="index">{{ item.label }}
                  </Option>
                </dyt-select>
              </FormItem>
              <FormItem label="参考编号:" prop="supplierPackageNoList">
                <dyt-input-tag :limit="1" v-model="pageParams.supplierPackageNoList" placeholder="多个用逗号或回车分开"
                  type="textarea"></dyt-input-tag>
              </FormItem>
              <FormItem label="退货物流商:" prop="logisticsTypeDescList">
                <dyt-select v-model="pageParams.logisticsTypeDescList" :max-tag-count="1" multiple clearable
                  placeholder="请选择">
                  <Option v-for="(item, index) in logisticsProviderArr" :value="item.value" :key="index">{{
                    item.label }} </Option>
                </dyt-select>
              </FormItem>
              <FormItem label="退货运单号:" prop="expressDeLiverySnList">
                <dyt-input-tag :limit="1" v-model="pageParams.expressDeLiverySnList" placeholder="多个用逗号或回车分开"
                  type="textarea"></dyt-input-tag>
              </FormItem>
              <FormItem label="采购子单号:" prop="purchaseSubOrderSnList">
                <dyt-input-tag :limit="1" v-model="pageParams.purchaseSubOrderSnList" placeholder="多个用逗号或回车分开"
                  type="textarea"></dyt-input-tag>
              </FormItem>
              <FormItem label="平台SKC:" prop="productSpuIdList">
                <dyt-input-tag :limit="1" v-model="pageParams.productSpuIdList" placeholder="多个用逗号或回车分开"
                  type="textarea"></dyt-input-tag>
              </FormItem>
              <FormItem label="平台SKU:" prop="productSkuIdList">
                <dyt-input-tag :limit="1" v-model="pageParams.productSkuIdList" placeholder="多个用逗号或回车分开"
                  type="textarea"></dyt-input-tag>
              </FormItem>
              <FormItem label="LAPA SKU:" prop="skuExtCodeList">
                <dyt-input-tag :limit="1" v-model="pageParams.skuExtCodeList" placeholder="多个用逗号或回车分开"
                  type="textarea"></dyt-input-tag>
              </FormItem>
              <FormItem label="退货原因:" prop="supplierReasonDescList">
                <dyt-select v-model="pageParams.supplierReasonDescList" :max-tag-count="1" multiple clearable
                  placeholder="请选择">
                  <Option v-for="(item, index) in returnsReasonArr" :value="item.value" :key="index">{{ item.label
                  }}
                  </Option>
                </dyt-select>
              </FormItem>
              <FormItem label="签收状态:" prop="signedStatusList">
                <dyt-select v-model="pageParams.signedStatusList" :max-tag-count="1" multiple clearable placeholder="请选择">
                  <Option v-for="(item, index) in signingStatusArr" :value="item.value" :key="index">{{ item.label
                  }}
                  </Option>
                </dyt-select>
              </FormItem>
              <FormItem label="处理分配:" prop="processTypeList">
                <dyt-select v-model="pageParams.processTypeList" :max-tag-count="1" multiple clearable placeholder="请选择">
                  <Option v-for="(item, index) in processAllocationArr" :value="item.value" :key="index">{{
                    item.label }} </Option>
                </dyt-select>
              </FormItem>
              <FormItem label="处理单号:" prop="processCodeList">
                <dyt-input-tag :limit="1" v-model="pageParams.processCodeList" placeholder="多个用逗号或回车分开"
                  type="textarea"></dyt-input-tag>
              </FormItem>
              <div slot="operation" style="margin-bottom: 30px;">
                <Button type="primary" @click="search" icon="ios-search" class="mr10">查询</Button>
                <Button @click="reset" v-once icon="md-refresh">重置</Button>
              </div>
            </dyt-filter>
          </Form>
        </div>
        <div class="funMain">
          <div class="funMain__flex">
            <div>
              <Dropdown @on-click="exportBtn">
                <Button type="primary"><span class="icon iconfont" style="font-size: 12px">&#xe639;</span>
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
              <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
              </dyt-sortBySelect>
            </div>
          </div>
        </div>
        <div class="tableMain">
          <div class="tableBox">
            <Table ref="returnsTable" highlight-row :border="true" :loading="tableLoading" :height="tableHeight"
              :columns="returnsColumn" :data="tableData" @on-selection-change="getSelectValue">
              <template slot-scope="{ row }" slot="fullCustodyReturnNote">
                <div class="linkText mt10" @click="openDialog(row, 'details')">{{ row.returnCode }}</div>
                <div class="tag-hideBorder">
                  <Tag color="purple" title="店铺">{{ row.accountCode }}</Tag>
                  <Tag :color="row.returnStatus == 5 ? 'red' : 'green'" title="退货单状态">{{ stateMap[row.returnStatus] }}
                  </Tag>
                </div>
              </template>
              <template slot-scope="{ row }" slot="processingOrder">
                <div v-for="(item, index) in row.spsFullManagedReturnHandleVOList" :key="index">
                  <div class="linkText" @click="viewHandleOrder(item)">{{ item.processCode }}</div>
                  <div class="tag-hideBorder">
                    <Tag :color="processAllocationMap[item.processType].color"
                      v-if="processAllocationMap[item.processType]">{{ processAllocationMap[item.processType].value }}
                    </Tag>
                  </div>
                </div>
              </template>
              <template slot-scope="{ row }" slot="createdTime">
                <div>
                  <div>{{ row.createdTime }}</div>
                </div>
              </template>
            </Table>
          </div>
        </div>
        <div class="pagesMain">
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
            :current="pageParams.pageNum" show-sizer @on-page-size-change="changePageSize" placement="top"
            :page-size-opts="pageArray"></Page>
        </div>
      </div>
    </template>

    <transition name="bounce">
      <template v-if="curPage === 'details'">
        <div class="subLayer infoDetails">
          <div class="topper">
            <span class="arrowLeft" @click="goBack">
              <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
            </span>
          </div>
          <div class="mainContent">
            <returns-details :returnsData="returnsDetailData" @goBack="goBack"></returns-details>
          </div>
        </div>
      </template>
    </transition>
    <handleOrderModal :dialog-obj="handleOrderData"></handleOrderModal>
  </div>
</template>
<script>
import api from "@/api/api";
import returnsDetails from "./component/returnsDetails.vue"
import handleOrderModal from "./component/handleOrderModal.vue";
import tableMixin from "@/components/mixin/table_mixin";
import common from '@/components/mixin/common_mixin';
import tableHeight_mixin from "@/components/mixin/tableHeight_mixin";

export default {
  components: { returnsDetails, handleOrderModal },
  mixins: [common, tableMixin, tableHeight_mixin],
  data() {
    let dayjs = this.$common.dayjs();
    return {
      pageParams: {
        pageNum: 1,
        pageSize: 20,
        startPos: 1, // 分页查询记录开始位置
        upDown: 'DESC',
        sortField: 'CT',
        accountIdList: [], // 店铺
        returnCodeList: [], // 退货单号
        returnStatusList: [], // 退货单状态
        supplierReasonDescList: [], // 退货理由
        processTypeList: [], // 处理分配
        signedStatusList: [], // 签收状态
        processCodeList: [], // 处理单号
        logisticsTypeDescList: [], // 退货物流商
        expressDeLiverySnList: [], // 退货运单号
        purchaseSubOrderSnList: [], // 采购子单号
        skuExtCodeList: [], // LAPA SKU
        productSpuIdList: [], // 平台SKC
        productSkuIdList: [], // 平台SKU
        supplierPackageNoList: [], // 参考单号
        createdStartTime: dayjs.subtract(6, 'day').format('YYYY-MM-DD') + ' 00:00:00',
        createdEndTime: dayjs.format('YYYY-MM-DD') + ' 23:59:59',
        platform: 'temu',
        ignoreAccount: true,
        warehouseId: this.getWarehouseId()
      },
      curTab: '1',
      curPage: 'returnsManagement',
      packageFinishTime: [],
      createTime: [],
      tabItems: [
        {
          key: '1',
          value: 'Temu'
        }
      ],
      storeArr: [],
      stateArr: [
        { label: '待商品核因', value: 0 },
        { label: '待处理分配', value: 1 },
        { label: '待收货', value: 2 },
        { label: '处理中', value: 3 },
        { label: '处理完结', value: 4 },
        { label: '已作废', value: 5 },
      ],
      returnsReasonArr: [
        { label: '其他', value: '其他' },
        { label: '商品体积/重量过大', value: '商品体积/重量过大' },
        { label: '货品与实物不符', value: '货品与实物不符' },
        { label: '货品破损', value: '货品破损' },
        { label: '质检不合格', value: '质检不合格' },
        { label: '滞销品清退', value: '滞销品清退' },
        { label: '滞销品拒绝降价清退', value: '滞销品拒绝降价清退' },
        { label: '体积重量超配送渠道范围', value: '体积重量超配送渠道范围' },
        { label: '包裹内混装无法区分', value: '包裹内混装无法区分' },
        { label: '商品包装破损', value: '商品包装破损' },
        { label: '货品退供-自动关单', value: '货品退供-自动关单' },
        { label: '滞销退供', value: '滞销退供' }
      ],
      logisticsProviderArr: [
        { label: '顺丰', value: '顺丰' },
        { label: '极兔', value: '极兔' },
        { label: '中通快递', value: '中通快递' },
        { label: '壹米滴答', value: '壹米滴答' },
        { label: '中通快运', value: '中通快运' },
        { label: '中国邮政', value: '中国邮政' },
        { label: '跨越速运', value: '跨越速运' },
      ],
      signingStatusArr: [
        { label: '未签收', value: 0 },
        { label: '已签收', value: 1 },
      ],
      processAllocationArr: [
        { label: '退供', value: 1 },
        { label: '销毁', value: 5 },
        { label: '质检入库', value: 2 },
        { label: '维修入库', value: 3 },
        { label: '上架入库', value: 3 },
      ],
      sortButtonList: [
        {
          sortHeader: '按创建时间',
          sortField: 'CT',
          sortType: 'DESC',
          default: true
        }
      ],
      stateMap: {
        0: '待商品核因',
        1: '待处理分配',
        2: '待收货',
        3: '处理中',
        4: '处理完结',
        5: '已作废'
      },
      processAllocationMap: {
        1: { value: '退供', color: '#996600' },
        2: { value: '质检入库', color: '#CC66CC' },
        3: { value: '维修入库', color: '#9900FF' },
        4: { value: '上架入库', color: '#009966' },
        5: { value: '销毁', color: '#FF6600' },
      },
      typeStatusMap: {
        0: { label: '商品核因', type: 'check' },
        1: { label: '处理分配', type: 'handle' }
      },
      platformList: [
        { label: 'temu', value: 'temu' }
      ],
      tableLoading: false,
      selectionArr: [],
      total: 0,
      tableData: [],
      returnsDetailData: {},
      handleOrderData: {
        modelVisible: false,
        data: [],
        type: 'view',
        detailsData: {}
      },
      wareHouseList: []
    }
  },
  created() {
    this.getTemustore()
    this.getList()
    this.getTime()
  },
  computed: {
    returnsColumn() {
      return [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          key: "fullCustodyReturnNote",
          title: "全托管退货单",
          align: "center",
          slot: "fullCustodyReturnNote",
          minWidth: 160,
        },
        {
          key: "supplierPackageNo",
          align: "center",
          title: "参考编号",
          minWidth: 160,
        },
        {
          key: "returnLogisticsInformation",
          align: "center",
          title: "退货物流信息",
          minWidth: 160,
          render: (h, params) => {
            return [
              h('div', {}, params.row.logisticsTypeDesc),
              h('div', {}, params.row.expressDeLiverySn)
            ]
          },
        },
        {
          key: "skuQuantity",
          align: "center",
          title: "退货SKU数量",
          width: 120,
        },
        {
          key: "returnSupplierQuantity",
          align: "center",
          title: "退货数量",
          width: 90,
        },
        {
          key: "supplierReasonDesc",
          align: "center",
          title: "退货原因",
          minWidth: 160,
        },
        {
          key: "processingOrder",
          title: "处理单",
          align: "left",
          minWidth: 130,
          slot: "processingOrder",
        },
        {
          key: 'warehouseId',
          title: '退货处理仓库',
          align: 'center',
          width: 120,
          render: (h, params) => {
            let warehouseName = ''
            let wareHouseList = this.$store.state.warehouseList
            wareHouseList.forEach(item => {
              if (item.warehouseId === params.row.warehouseId) {
                warehouseName = item.warehouseName
              }
            });
            return h('div', {}, warehouseName)
          }
        },
        {
          key: "signedStatus",
          align: "center",
          title: "签收状态",
          width: 90,
          render: (h, params) => {
            return [
              h('div', {}, params.row.signedStatus ? '已签收' : '未签收'),
            ]
          },
        },
        {
          key: "receiveQuantity",
          align: "center",
          title: "收货数量",
          width: 90,
          render: (h, params) => {
            let totolReceivedNum = params.row.spsFullManagedReturnHandleVOList ? params.row.spsFullManagedReturnHandleVOList.reduce((pre, next) => {
              return pre + next.receiveQuantity
            }, 0) : 0
            return h('span', {}, totolReceivedNum)
          }
        },
        {
          key: "createdTime",
          align: "center",
          title: "创建时间",
          slot: 'createdTime',
          width: 100
        },
      ]
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.computedTableHeight();
    })
  },
  watch: {
    curPage() {
      this.$nextTick(() => {
        this.computedTableHeight();
      })
    },
  },
  methods: {
    getTime() {
      let dayjs = this.$common.dayjs();
      this.pageParams.createdStartTime = dayjs.subtract(6, 'day').format('YYYY-MM-DD') + ' 00:00:00';
      this.pageParams.createdEndTime = dayjs.format('YYYY-MM-DD') + ' 23:59:59';
      this.createTime = [this.pageParams.createdStartTime, this.pageParams.createdEndTime]
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
    // 重置表单查询
    reset() {
      this.$refs['pageParams'].resetFields();
      this.pageParams.accountIdList = []
      this.createTime = []
      this.packageFinishTime = []
      this.pageParams.createdStartTime = null
      this.pageParams.createdEndTime = null
    },
    search() {
      this.getList()
    },
    getList() {
      this.selectionArr = []
      let obj = this.$common.copy(this.pageParams)
      this.tableLoading = true
      this.axios.post(api.query_list, obj).then(res => {
        if (res.data.code == 0) {
          this.tableData = res.data.datas.list
          this.total = res.data.datas.total
        }
      }).finally(() => {
        this.tableLoading = false
      })
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.upDown = type;
      this.pageParams.sortField = feild;
      this.getList();
    },
    getSelectValue(selection) {
      // table获取所选值
      this.selectionArr = selection;
    },
    goBack() {
      this.$emit('openDetails', false)
      this.curPage = 'returnsManagement'
      this.getList()
    },
    // 获取temu店铺数据
    getTemustore() {
      this.axios.post(api.get_temuStore).then(res => {
        if (res.data.code == 0) {
          this.storeArr = res.data.datas
        }
      })
    },
    changePage(val) {
      this.pageParams.pageNum = val
      this.getList()
    },
    changePageSize(val) {
      this.pageParams.pageSize = val
      this.getList()
    },
    changeHandleType() { },
    openDialog(val, type) {
      this.returnsDetailData = val
      this.returnsDetailData.type = type
      this.$emit('openDetails', true)
      this.curPage = type
    },
    // 导出
    exportBtn(val) {
      let obj = {}
      if (val == '0') {
        if (this.selectionArr.length === 0) {
          this.$Message.error('未选中数据')
          return;
        }
        const returnCodeList = this.selectionArr.map(item => item.returnCode)
        obj = {
          returnCodeList: returnCodeList,
          platform: this.pageParams.platform,
          warehouseId: this.getWarehouseId()
        }
      } else {
        obj = this.$common.copy(this.pageParams)
      }
      this.axios.post(api.refunded_export, obj).then(res => {
        if (res.data.code == 0 && res.data.success) {
          this.$Message.success('导出成功')
          this.getList()
        } else {
          this.$Message.error('导出失败，请稍后重试')
        }
      })
    },
    // 查看处理单
    viewHandleOrder(row) {
      this.tableLoading = true
      this.axios.get(`${api.view_refundHandle}?returnHandleId=${row.returnHandleId}`).then(res => {
        if (res.data.code == 0) {
          if (this.$common.isEmpty(res.data.datas)) return this.$Message.error('该处理单无数据')
          this.handleOrderData.type = 'view'
          this.handleOrderData.detailsData = res.data.datas
          this.handleOrderData.data = res.data.datas.spsRefundHandleDetailInfoList
          this.handleOrderData.modelVisible = true
        }
      }).finally(() => {
        this.tableLoading = false
      })
    }
  }
}
</script>
<style lang="less">
.returnOrderPage {
  flex: 1;
  overflow: hidden;
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