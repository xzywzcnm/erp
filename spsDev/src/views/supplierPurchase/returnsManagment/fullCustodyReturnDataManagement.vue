<template>
    <div>
    <template v-if="curPage === 'returnsManagement'">
       <div class="tabContent">
        <div class="supplierTabsBar commonFilter normalTop">
        <template>
          <Tabs v-model="curTab" @on-click="showCurrentPage">
            <TabPane v-for="(item) in tabItems" :label="item.value" :key="item.key" :name="item.key"></TabPane>
          </Tabs>
        </template>
        </div>
        <div class="commonFilter">
            <div class="card-container">
                <div class="card-content" style="padding-top: 8px">
                    <div class="platformParamsSelect">
                    <Form  ref="pageParams" :model="pageParams" :label-width="100">
                        <dyt-filter>
                            <FormItem label="店铺:" prop="shop" >
                                <dyt-select v-model="pageParams.accountIdList" 
                                :max-tag-count="1"
                                multiple
                                clearable placeholder="请选择" > <Option
                                    v-for="(item,index) in storeArr"
                                    :value="item.saleAccountId"
                                    :key="index" >{{ item.accountCode }} </Option > </dyt-select >
                            </FormItem >
                            <FormItem label="退货单号:" prop="returnCodeList">
                                <dyt-input-tag
                                    :limit="1"
                                    v-model="pageParams.returnCodeList"
                                    placeholder="多个用逗号或回车分开"
                                    type="textarea"
                                ></dyt-input-tag>
                            </FormItem>
                            <FormItem label="创建时间:" prop="createTime" :label-width="100">
                              <DatePicker
                                transfer
                                type="datetimerange"
                                placement="bottom-end"
                                placeholder="选择日期"
                                style="width: 100%"
                                split-panels
                                v-model="createTime"
                                @on-clear="resetDate('created')"
                                format="yyyy-MM-dd HH:mm:ss"
                                :options="dateOptions"
                                @on-change="(e) => {getDateValue(e,'created')}"
                              />
                            </FormItem>
                            <FormItem label="退货单状态:" prop="returnStatusList" >
                                <dyt-select v-model="pageParams.returnStatusList" 
                                :max-tag-count="1"
                                multiple
                                clearable placeholder="请选择" > <Option
                                    v-for="(item,index) in stateArr"
                                    :value="item.value"
                                    :key="index" >{{ item.label }} </Option > </dyt-select >
                            </FormItem >
                            <FormItem label="参考编号:" prop="supplierPackageNoList">
                                <dyt-input-tag
                                    :limit="1"
                                    v-model="pageParams.supplierPackageNoList"
                                    placeholder="多个用逗号或回车分开"
                                    type="textarea"
                                ></dyt-input-tag>
                            </FormItem>    
                            <FormItem label="退货物流商:" prop="logisticsTypeDescList" >
                                <dyt-select v-model="pageParams.logisticsTypeDescList" 
                                :max-tag-count="1"
                                multiple
                                clearable placeholder="请选择" > <Option
                                    v-for="(item,index) in logisticsProviderArr"
                                    :value="item.value"
                                    :key="index" >{{ item.label }} </Option > </dyt-select >
                            </FormItem >   
                            <FormItem label="物流运单号:" prop="expressDeLiverySnList">
                                <dyt-input-tag
                                    :limit="1"
                                    v-model="pageParams.expressDeLiverySnList"
                                    placeholder="多个用逗号或回车分开"
                                    type="textarea"
                                ></dyt-input-tag>
                            </FormItem>       
                            <FormItem label="采购子单号:" prop="purchaseSubOrderSnList">
                                <dyt-input-tag
                                    :limit="1"
                                    v-model="pageParams.purchaseSubOrderSnList"
                                    placeholder="多个用逗号或回车分开"
                                    type="textarea"
                                ></dyt-input-tag>
                            </FormItem>
                            <FormItem label="平台SKC:" prop="productSpuIdList">
                                <dyt-input-tag
                                    :limit="1"
                                    v-model="pageParams.productSpuIdList"
                                    placeholder="多个用逗号或回车分开"
                                    type="textarea"
                                ></dyt-input-tag>
                            </FormItem>
                            <FormItem label="平台SKU:" prop="productSkuIdList">
                                <dyt-input-tag
                                    :limit="1"
                                    v-model="pageParams.productSkuIdList"
                                    placeholder="多个用逗号或回车分开"
                                    type="textarea"
                                ></dyt-input-tag>
                            </FormItem>
                            <FormItem label="LAPA SKU:" prop="skuExtCodeList">
                                <dyt-input-tag
                                    :limit="1"
                                    v-model="pageParams.skuExtCodeList"
                                    placeholder="多个用逗号或回车分开"
                                    type="textarea"
                                ></dyt-input-tag>
                            </FormItem>
                            <FormItem label="退货原因:" prop="supplierReasonDescList" >
                                <dyt-select v-model="pageParams.supplierReasonDescList" 
                                :max-tag-count="1"
                                multiple
                                clearable placeholder="请选择" > <Option
                                    v-for="(item,index) in returnsReasonArr"
                                    :value="item.value"
                                    :key="index" >{{ item.label }} </Option > </dyt-select >
                            </FormItem >  
                            <FormItem label="签收状态:" prop="signedStatusList" >
                                <dyt-select v-model="pageParams.signedStatusList" 
                                :max-tag-count="1"
                                multiple
                                clearable placeholder="请选择" > <Option
                                    v-for="(item,index) in signingStatusArr"
                                    :value="item.value"
                                    :key="index" >{{ item.label }} </Option > </dyt-select >
                            </FormItem >  
                            <FormItem label="处理分配:" prop="processTypeList" >
                                <dyt-select v-model="pageParams.processTypeList" 
                                :max-tag-count="1"
                                multiple
                                clearable placeholder="请选择" > <Option
                                    v-for="(item,index) in processAllocationArr"
                                    :value="item.value"
                                    :key="index" >{{ item.label }} </Option > </dyt-select >
                            </FormItem >  
                            <FormItem label="处理单号:" prop="processCodeList">
                                <dyt-input-tag
                                    :limit="1"
                                    v-model="pageParams.processCodeList"
                                    placeholder="多个用逗号或回车分开"
                                    type="textarea"
                                ></dyt-input-tag>
                            </FormItem>
                            <FormItem label="退货处理仓库:" prop="warehouseId" >
                                <dyt-select v-model="pageParams.warehouseId" 
                                clearable placeholder="请选择" > <Option
                                    v-for="(item,index) in warehouseArr"
                                    :value="item.warehouseId"
                                    :key="index" >{{ item.warehouseName }} </Option > </dyt-select >
                            </FormItem >  
                            <div slot="operation" style="margin-bottom: 30px;">
                                <Button type="primary" @click="search"  icon="ios-search" class="mr10">查询</Button>
                                <Button @click="reset" v-once icon="md-refresh">重置</Button>
                            </div>            
                        </dyt-filter>
                    </Form>
                    </div>
                </div>
            </div>
        </div>
        <div class="flexBox spaceBetween">
            <div class="tableControl" style="margin-left:12px">
            <Dropdown
            @on-click="exportBtn"
            v-if="pagePermission.export"
            >
                <Button type="primary"
                ><span class="icon iconfont" style="font-size: 12px"
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
            class="ml20" 
            v-if="pagePermission.batchUpdateCheckInfo"
            type="primary" 
            @click="batchUpdateCheckInfo"
            :disabled="isBatchUpdateCheckInfo"
            >批量获取质检资料</Button>
            </div>
            <div class="mr20">
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
            </dyt-sortBySelect>
          </div>
        </div>
        <div class="commonFilter">
        <div class="orderTable">
            <Table ref="returnsTable"
             highlight-row
             :border="true"
             :loading="tableLoading"
             :height="tableHeight"
             :columns="returnsColumn"
             :data="tableData"
             @on-selection-change="getSelectValue">
             <template slot-scope="{ row }" slot="fullCustodyReturnNote">
                <div style="text-align: center;" class="mt20">
                  <span
                    style="
                      color: #2d8cf0;
                      cursor: pointer;
                      text-decoration: underline;
                    "
                    @click="openDialog(row,'details')"
                    >{{ row.returnCode }}</span
                  >
                </div>
                <div style="display: flex; flex-wrap: wrap;justify-content: center;align-items: center" class="mb10">
                  <div
                    :style="{
                      width: row.accountCode.length * 8 + 'px'
                    }"
                    style="
                      background: #f9f0ff;
                      color: #722ed1;
                      margin-top: 15px;
                      margin-right: 5px;
                      height:16px;
                      text-align: center;
                    "
                    v-if="row.accountCode"
                  >
                  <Tooltip content="店铺" placement="top-start">
                    {{ row.accountCode }}
                </Tooltip>
                  </div> 
                  <div
                   :style="{
                    color: row.returnStatus == 5 ? '#FF0000' : '#52c41a',
                    width: stateMap[row.returnStatus].length  * 12 + 'px'
                   }"
                    style="
                      background: #f6ffed;
                      margin-top: 15px;
                      height:16px;
                    "
                  >
                  <Tooltip content="退货单状态" placement="top-start">
                    {{ stateMap[row.returnStatus] }}
                  </Tooltip>
                  </div>
                </div>
              </template>
              <template slot-scope="{ row }" slot="processingOrder">
                <div v-for="(item,index) in row.spsFullManagedReturnHandleVOList" :key="index">
                <div style="
                      color: #2d8cf0;
                      cursor: pointer;
                      text-decoration: underline;"
                      @click="viewHandleOrder(item)">{{ item.processCode}}
                </div>
                <div style="display: flex; flex-wrap: wrap" class="mb10">
                  <div 
                  :style="{
                    background: processAllocationMap[item.processType]
                    ? processAllocationMap[item.processType].color : '#ffffff'
                    }"
                  style="
                      width: 70px;
                      color: white;
                      margin-top: 5px;
                      margin-right: 10px;
                      text-align: center;
                    ">
                   <span> {{ processAllocationMap[item.processType]? processAllocationMap[item.processType].value : '' }}</span>
                  </div>
                </div>
                </div>
              </template>
              <template slot-scope="{ row }" slot="createdTime">
                <div>
                <div>{{ row.createdTime}}</div>
                </div>
              </template>
            </Table>
            <handleOrderModal :dialog-obj="handleOrderData"></handleOrderModal>
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
       </div>
    </template>
    <transition name="bounce">
        <template v-if="curPage === 'details'">
            <div class="subLayer infoDetails">
                <div class="topper">
                    <span class="arrowLeft" @click="goBack">
                    <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
                    </span>
                    <div class="fr">
                      <Button type="error" 
                      class="mr20" 
                      style="width: 80px;" 
                      v-if="returnsDetailData.returnStatus === 0 ||  returnsDetailData.returnStatus === 1 
                      || returnsDetailData.returnStatus === 2"
                      @goBack="goBack" 
                      @click="saveMethod('cancel')">作废</Button>
                    </div>
                </div>
                <div class="mainContent">
                    <returns-details ref="returnsDetails" :returnsData="returnsDetailData" @goBack="goBack"></returns-details>
                </div>
            </div>
        </template>
        <template v-if="curPage === 'check' || curPage === 'handle'">
            <div class="subLayer infoDetails">
                <div class="topper">
                    <span class="arrowLeft" @click="goBack">
                    <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
                    </span>
                    <div style="margin-left: 130px; position: absolute">
                      <Button type="primary" class="mr10" v-if="curPage == 'check' && pagePermission.save" @click="saveMethod('save')">保存</Button>
                      <Button type="primary" class="mr10" v-if="curPage == 'check' && pagePermission.saveAndFinish" @click="saveMethod('finish')">保存并完成</Button>
                      <Button @click="goBack">取消</Button>
                    </div>
                </div>
                <div class="mainContent">
                    <returns-handle ref="returnsHandle" :returnsData="returnsDetailData" @goBack="goBack"></returns-handle>
                </div>
            </div>
        </template>
    </transition>
    </div>
</template>
<script>
import api from "@/api/api";
import returnsDetails from "./common/returnsDetails.vue"
import returnsHandle from "./common/returnsHandle.vue";
import handleOrderModal from "./common/handleOrderModal.vue";
import tableMixin from "@/components/mixin/table_mixin";
import Mixin from "@/components/mixin/common_mixin";
export default {
  components: { returnsDetails, returnsHandle, handleOrderModal },
  mixins: [Mixin, tableMixin],
  data () {
    let dayjs = this.$common.dayjs();
    return {
      pageParams: {
        pageNum: 1,
        pageSize: 20,
        startPos: 1, // 分页查询记录开始位置
        upDown: 'DESC',
        sortField: 'CT',
        accountIdList: [], // 店铺
        returnCodeList:[], // 退货单号
        returnStatusList:[], // 退货单状态
        supplierReasonDescList:[], // 退货理由
        processTypeList: [], // 处理分配
        signedStatusList: [], //签收状态
        processCodeList: [], // 处理单号
        logisticsTypeDescList:[], // 退货物流商
        expressDeLiverySnList: [], // 退货运单号
        purchaseSubOrderSnList: [], // 采购子单号
        skuExtCodeList: [], // LAPA SKU
        productSpuIdList: [], // 平台SKC
        productSkuIdList: [], // 平台SKU
        supplierPackageNoList: [], // 参考单号
        createdStartTime: dayjs.subtract(6, 'day').format('YYYY-MM-DD') + ' 00:00:00',
        createdEndTime: dayjs.format('YYYY-MM-DD') + ' 23:59:59',
        platform:'temu',
        warehouseId: null
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
      storeArr:[],
      stateArr:[
        { label:'待商品核因', value: 0 },
        { label:'待处理分配', value: 1 },
        { label:'待收货', value: 2 },
        { label:'处理中', value: 3 },
        { label:'处理完结', value: 4 },
        { label:'已作废', value: 5 },
      ],
      returnsReasonArr: [
        { label:'其他', value: '其他' },
        { label:'商品体积/重量过大', value: '商品体积/重量过大' },
        { label:'货品与实物不符', value: '货品与实物不符' },
        { label:'货品破损', value: '货品破损' },
        { label:'质检不合格', value: '质检不合格' },
        { label:'滞销品清退', value: '滞销品清退' },
        { label:'滞销品拒绝降价清退', value: '滞销品拒绝降价清退' },
        { label:'体积重量超配送渠道范围', value: '体积重量超配送渠道范围' },
        { label:'包裹内混装无法区分', value: '包裹内混装无法区分' },
        { label:'商品包装破损', value: '商品包装破损' },
        { label:'货品退供-自动关单', value: '货品退供-自动关单' },
        { label: '滞销退供', value: '滞销退供'}
      ],
      logisticsProviderArr: [
        { label:'顺丰', value: '顺丰' },
        { label:'极兔', value: '极兔' },
        { label:'中通快递', value: '中通快递' },
        { label:'壹米滴答', value: '壹米滴答' },
        { label:'中通快运', value: '中通快运' },
        { label:'中国邮政', value: '中国邮政' },
        { label:'跨越速运', value: '跨越速运' },
      ],
      signingStatusArr: [
        { label:'未签收', value: 0 },
        { label:'已签收', value: 1 },
      ],
      processAllocationArr: [
        { label:'退供', value: 1 },
        { label:'销毁', value: 5 },
        { label:'质检入库', value: 2 },
        { label:'维修入库', value: 3 },
        { label:'上架入库', value: 4 },
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
        0:'待商品核因',
        1:'待处理分配',
        2:'待收货',
        3:'处理中',
        4:'处理完结',
        5:'已作废'
      },
      processAllocationMap: {
        1: { value: '退供', color:'#996600' },
        2: { value: '质检入库', color:'#CC66CC' },
        3: { value: '维修入库', color:'#9900FF' },
        4: { value: '上架入库', color:'#009966' },
        5: { value: '销毁', color:'#FF6600' },
      },
      typeStatusMap:{
        0 : { label:'商品核因', type:'check'},
        1 : { label:'处理分配', type:'handle'}
      },
      tableLoading:false,
      selectionArr:[],
      tableHeight: this.getTableHeight(350),
      total: 0,
      tableData: [],
      returnsDetailData: {},
      handleOrderData: {
        modelVisible: false,
        data: [],
        type: 'view',
        detailsData:{}
      },
      warehouseArr: []
    }
  },
  created() {
    this.getTemustore()
    this.getList()
    this.getTime()
    this.getWarehouseInfo()
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
          slot: "fullCustodyReturnNote",
        },
        {
          key: "operation",
          align: "center",
          title: "操作",
          width: 120,
          render: (h, params) => {
            let btnNameArr = [
              { value: 'check', name: '商品核因' },
              { value: 'handle', name: '处理分配' }
            ] 
            let html = h('Button', {
              props:{
                type: 'primary',
              },
              style: {},
              on: {
                click: () => {
                  this.openDialog(params.row,btnNameArr[params.row.returnStatus].value)
                }
              }
            },  btnNameArr[params.row.returnStatus] ? btnNameArr[params.row.returnStatus].name : '');
            if (params.row.returnStatus === 0 && !this.pagePermission.check) {
              html = '';
            } else if (params.row.returnStatus === 1 && !this.pagePermission.processAllocation) {
              html = '';
            } else if (params.row.returnStatus > 1) {
              html = '';
            }
            return html
          }
        },
        {
          key: "supplierPackageNo",
          align: "center",
          title: "参考编号", 
          width: 180,
        },        
        {
          key: "returnLogisticsInformation",
          align: "center",
          title: "退货物流信息",
          width: 160,
          render: (h, params) => {
            return [
              h('div',{}, params.row.logisticsTypeDesc),
              h('div',{}, params.row.expressDeLiverySn)
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
          width: 160
        },
        {
          key: "processingOrder",
          title: "处理单",
          align: "left",
          width: 160,
          slot: "processingOrder",
        },
        {
          key: 'warehouseId',
          title: '退货处理仓库',
          align: 'center',
          width: 110,
          render: (h, params) => {
            let warehouseName = ''
            this.warehouseArr.forEach(item => {
              if(item.warehouseId == params.row.warehouseId) {
                warehouseName = item.warehouseName
              }
            })
            return h('div', {}, warehouseName )
          }
        },
        {
          key: "signedStatus",
          align: "center",
          title: "签收状态",
          width: 100,
          render: (h, params) => {
            return [
              h('div',{}, params.row.signedStatus ? '已签收' : '未签收'),
            ]
          },
        },
        {
          key: "receiveQuantity",
          align: "center",
          title: "收货数量",
          width: 70,
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
    pagePermission () {
      return {
        list: this.getPermission("fullManagedReturn_Temulist"),
        export: this.getPermission("fullManagedReturn_export"),
        save: this.getPermission("fullManagedReturn_commodityFactorSave"),
        saveAndFinish: this.getPermission("fullManagedReturn_commodityFactorSaveAndComplete"),
        check: this.getPermission("fullManagedReturn_commodityFactor"),
        processAllocation: this.getPermission("fullManagedReturn_processingAllocation"),
        batchUpdateCheckInfo: this.getPermission("fullManagedReturn_batchUpdateCheckInfo")
      }
    },
    isBatchUpdateCheckInfo() {
      let flag = false
      this.selectionArr.forEach(item => {
        if(item.returnStatus !== 0) {
          flag = true
        }
      })
      return this.selectionArr.length == 0 ? true : flag
    }
  },
  methods: {
    // 切换tab
    showCurrentPage(){},
    getWarehouseInfo() {
      let { merchantId } = this.$store.state.userInfo;
      this.axios
        .get(api.getWarehouseInfo, { params: { merchantId } })
        .then(({ data }) => {
          if (data.code == 0) {
            this.warehouseArr = data.datas.filter(item => item.warehouseName === '佛山丽山仓' || item.warehouseName === '六楼全托管仓')
          }
        });
    },
    getTime() {
      let dayjs = this.$common.dayjs();
      this.pageParams.createdStartTime = dayjs.subtract(6, 'day').format('YYYY-MM-DD') + ' 00:00:00';
      this.pageParams.createdEndTime = dayjs.format('YYYY-MM-DD') + ' 23:59:59';
      this.createTime = [this.pageParams.createdStartTime, this.pageParams.createdEndTime]
    },
    // 创建时间
    getDateValue(value,name) {
      if (value && value.length > 0 && value[0] != "") {
        this.pageParams[`${name}StartTime`] = value[0];
        this.pageParams[`${name}EndTime`] = value[1];
      }
    },
    // 重置时间
    resetDate(type){
      this.pageParams[`${type}StartTime`] = null;
      this.pageParams[`${type}EndTime`] = null;
    },
    // 重置表单查询
    reset() {
      this.$refs['pageParams'].resetFields();
      this.pageParams.accountIdList = []
      this.createTime = [],
      this.packageFinishTime = []
      this.pageParams.createdStartTime= null,
      this.pageParams.createdEndTime= null
    },
    search(){
      this.pageParams.pageNum = 1
      this.getList()
    },
    getList() {
      this.selectionArr = []
      if (!this.pagePermission.list) {
        this.$Message.error("您暂无权限查看，请找管理员设置");
        return;
      }
      let obj = this.$common.copy(this.pageParams)
      this.tableLoading = true
      this.axios.post(api.query_list,obj).then(res => {
        if(res.data.code == 0) {
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
      this.curPage = 'returnsManagement'
      this.getList()
    },
    // 获取temu店铺数据
    getTemustore() {
      this.axios.get(api.get_temuStore).then(res => {
        if(res.data.code == 0) {
          this.storeArr = res.data.datas
        }
      })
    },
    changePage(val) {
      this.pageParams.pageNum = val
      this.getList()
    },
    changePageSize(val){
      this.pageParams.pageSize = val
      this.getList()
    },
    openDialog(val,type){
      this.returnsDetailData = val
      this.returnsDetailData.type = type
      this.returnsDetailData.warehouseArr = this.warehouseArr
      this.curPage = type
    },
    // 导出
    exportBtn(val) {
      let obj = {}
      if(val == '0') {
        if(this.selectionArr.length === 0) {
          this.$Message.error('未选中数据')
          return;
        }
        const returnIdList = this.selectionArr.map(item => item.returnId)
        obj = { returnIdList: returnIdList }
      } else {
        const spsFullManagedReturnTemuQO = this.$common.copy(this.pageParams)
        obj = {
          spsFullManagedReturnTemuQO: spsFullManagedReturnTemuQO
        }
      }
      this.axios.post(api.export_temuList,obj).then(res => {
        if(res.data.code == 0 && res.data.success){
          this.$Message.success('导出成功')
          this.getList()
        } else {
          this.$Message.error('导出失败，请稍后重试')
        }
      })
    },
    // 保存或保存并完成
    saveMethod(type){
      if(type === 'cancel') {
        this.$refs.returnsDetails.cancelReturn()
        
      } else {
        this.$refs.returnsHandle.saveAndSubmit(type)
      }
    },
    // 查看处理单
    viewHandleOrder(row) {
      this.tableLoading = true
      this.axios.get(`${api.view_refundHandle}?returnHandleId=${row.returnHandleId}`).then( res => {
        if(res.data.code == 0){
          this.handleOrderData.type = 'view'
          this.handleOrderData.detailsData = res.data.datas
          this.handleOrderData.data = res.data.datas.spsRefundHandleDetailInfoList
          this.handleOrderData.modelVisible = true
        }
      } ).finally( () => {
        this.tableLoading = false
      })
    },
    // 批量获取质检材料
    batchUpdateCheckInfo() {
      this.tableLoading = true
      let obj = this.selectionArr.map(item => item.returnId)
      this.axios.post(api.batchUpdateCheckInfo, obj).then( res => {
        if(res.data.code == 0){
          this.$Message.success('操作成功')
          this.getList()
        }
      } ).finally( () => {
        this.tableLoading = false
      })
    }
  }
}
</script>
<style>
.card-content {
  border-color: #ffff;
}
</style>