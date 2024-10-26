<template>
    <div>
      <template v-if="purchaseShow === 'stockingDemand'">
        <div class="supplierTabsBar commonFilter normalTop">
          <template>
            <Tabs
              v-model="status"
              @on-click="showCurrentPage"
              style="background: #ffff; padding: 0px 10px"
            >
              <TabPane
                v-for="(item, index) in tabItems"
                :label="item.value"
                :name="String(item.key)"
                :key="index"
              ></TabPane>
            </Tabs>
          </template>
        </div>
        <div class="commonFilter">
          <div class="card-container">
            <div class="card-content">
              <div class="platformParamsSelect">
                <Form ref="pageParams" :model="pageParams" :label-width="90">
                  <dyt-filter>
                    <FormItem label="仓库类型" prop="backupWarehouseType">
                      <dyt-select
                        v-model="pageParams.backupWarehouseType"
                        clearable
                        placeholder="请选择"
                      >
                        <Option
                          v-for="(item, index) in warehouseTypeArr"
                          :value="item.value"
                          :key="index"
                          >{{ item.typeDesc }}</Option
                        >
                      </dyt-select>
                    </FormItem>
                    <FormItem label="备货仓库" prop="backupWarehouseIdList">
                      <dyt-select
                        ref="backupWarehouseIdList"
                        v-model="pageParams.backupWarehouseIdList"
                        filterable
                        clearable
                        multiple 
                        :max-tag-count="1"
                      >
                        <Option
                          v-for="(item, index) in warehouseArr"
                          :value="item.id"
                          :key="index"
                          >{{ item.name }}</Option
                        >
                      </dyt-select>
                    </FormItem>
                    <FormItem label="提交人" prop="submitByList">
                      <dyt-select
                        v-model="pageParams.submitByList"
                        clearable
                        filterable
                        placeholder="请选择"
                        multiple 
                        :max-tag-count="1"
                      >
                        <Option
                          v-for="(item, index) in submitterArr"
                          :value="item.id"
                          :key="index"
                          >{{ item.name }}</Option
                        >
                      </dyt-select>
                    </FormItem>
                    <FormItem label="审核人" prop="checkByList">
                      <dyt-select
                        v-model="pageParams.checkByList"
                        clearable
                        filterable
                        placeholder="请选择"
                        multiple 
                        :max-tag-count="1"
                      >
                        <Option
                          v-for="(item, index) in submitterArr"
                          :value="item.id"
                          :key="index"
                          >{{ item.name }}</Option
                        >
                      </dyt-select>
                    </FormItem>
                    <FormItem label="备货需求编号" prop="stockRequirementNoList">
                      <dyt-input-tag
                        v-model="pageParams.stockRequirementNoList"
                        :limit="1"
                        placeholder="多个用逗号或换行分隔"
                        type="textarea"
                      />
                    </FormItem>
                    <FormItem label="备货计划编号" prop="planSerialNumberList">
                      <dyt-input-tag
                        v-model="pageParams.planSerialNumberList"
                        :limit="1"
                        placeholder="多个用逗号或换行分隔"
                        type="textarea"
                      />
                    </FormItem>
                    <FormItem label="SPU" prop="spuList">
                      <dyt-input-tag
                        v-model="pageParams.spuList"
                        :limit="1"
                        placeholder="多个用逗号或换行分隔"
                        type="textarea"
                      />
                    </FormItem>
                    <FormItem label="SKU" prop="skuList">
                      <dyt-input-tag
                        v-model="pageParams.skuList"
                        :limit="1"
                        placeholder="多个用逗号或换行分隔"
                        type="textarea"
                      />
                    </FormItem>
                    <FormItem label="所属事业部" prop="businessDeptIdList">
                      <dyt-select
                        v-model="pageParams.businessDeptIdList"
                        :limit="1"
                        filterable
                        clearable
                        multiple 
                      >
                        <Option
                          v-for="item in allowBusinessDept"
                          :key="item.id"
                          :label="item.name"
                          :value="item.id"
                        ></Option>
                      </dyt-select>
                    </FormItem>
                    <FormItem label="提交时间" prop="submitTimeArr" v-if="status !== '0'">
                      <Date-picker
                        transfer
                        type="datetimerange"
                        split-panels
                        @on-change="(e) => {getDateValue(e, 'Submit')}"
                        :clearable="true"
                        format="yyyy-MM-dd HH:mm:ss"
                        style="width: 100%"
                        placeholder="选择日期"
                        :options="dateOptions"
                        placement="bottom-end"
                        v-model="submitTimeArr"
                      />
                    </FormItem>
                    <FormItem label="审核时间" prop="auditTime" v-if="!['0', '1'].includes(status)">
                      <Date-picker
                        transfer
                        type="datetimerange"
                        split-panels
                        @on-change="(e) => {getDateValue(e, 'Check')}"
                        :clearable="true"
                        format="yyyy-MM-dd HH:mm:ss"
                        style="width: 100%"
                        placeholder="选择日期"
                        :options="dateOptions"
                        placement="bottom-end"
                        v-model="auditTimeArr"
                      />
                    </FormItem>
                    <FormItem label="部分同意" prop="partialConsent" v-if="status == '2' || status == '-1'">
                      <dyt-select
                        v-model="pageParams.partialConsent"
                        filterable
                        clearable
                      >
                        <Option label="是" :value="1"></Option>
                        <Option label="否" :value="0"></Option>
                      </dyt-select>
                    </FormItem>
                    <FormItem label="是否绑定计划" prop="bindPlan">
                      <dyt-select v-model="pageParams.bindPlan">
                        <Option label="是" :value="1"></Option>
                        <Option label="否" :value="0"></Option>
                      </dyt-select>
                    </FormItem>
                    <div slot="operation">
                      <Button
                        type="primary"
                        @click="search"
                        icon="ios-search"
                        >搜索</Button
                      >
                      <Button
                        @click="reset"
                        class="ml10"
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
        <div class="flexBox spaceBetween mb10">
          <div class="tableControl">
            <Button
              type="primary"
              class="iconbuttons ml15"
              @click="newAddDemand"
              v-if="permission.add"
            >新建备货需求</Button>
            <Dropdown
              class="ml10"
              @on-click="exportData"
              v-if="permission.export"
            >
              <Button type="primary">
                <span class="icon iconfont" style="font-size: 12px">&#xe639;</span>
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
              @click="openWritePlanModal({}, 'batch')"
              :disabled="batchWritePlan.disabled"
              v-if="permission.plan && ([-1, 1].includes(Number(status)) || $common.isEmpty(status))"
              :title="batchWritePlan.disabled ? '请选择状态都为“待审核”的数据进行操作' : ''"
            >批量填写计划编号</Button>
          </div>
        </div>
        <div class="commonFilter">
          <div class="orderTable">
            <keep-alive>
              <Table
                ref="demandTable"
                highlight-row
                :border="true"
                :height="tableHeight"
                :loading="Tableloading"
                :columns="demandColumn"
                :data="tableData"
                @on-selection-change="getSelectValue"
              >
              <template slot-scope="{ row }" slot="stockDemand">
                <div class="mt10">需求编号：
                  <span class="linkStyle" @click="getStockingDetails(row, 'view')">{{ row.stockRequirementNo  }}</span>
                </div>
                <div class="flexBox mt10 mb10" style="flex-wrap: wrap;">
                  <div
                    class="mb5 mr5"
                    :style="{
                      background: row.status == 4 ? '#FDEAF4' : '#F2F2F2',
                      color: row.status == 4 ? '#EB3799': '#3FB13A'
                    }"
                    style="text-align: center; padding: 1px 5px;"
                  >
                    {{ statusTypeMap[row.status] }}
                  </div>
                  <div
                    class="mb5 mr5"
                    v-if="row.businessDeptName"
                    style="text-align: center; padding: 1px 5px; background: #E5F3FD; color: #3DA7F1;"
                  >
                  {{ row.businessDeptName }}
                  </div>
                  <div
                    class="mb5"
                    v-if="row.planSerialNumber"
                    style="text-align: center; background: rgba(92, 0, 255, 0.1); color: #7121ff;padding: 1px 5px;"
                  >
                    绑定计划
                  </div>
                </div>
              </template>
              </Table>
            </keep-alive>
            <div class="table-page clear">
              <div class="table-page-right">
                <keep-alive>
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
                </keep-alive>
              </div>
            </div>
          </div>
        </div>
      </template>
      <transition name="bounce">
        <template v-if="purchaseShow === 'addStockingDemand'">
          <div class="subLayer infoDetails">
            <div class="topper">
              <span class="arrowLeft" @click="goBackFrom">
                <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
              </span>
              <div style="margin-left: 130px; position: absolute" v-if="demandData.type !== 'view'">
                      <Button type="primary" class="mr10" @click="finishedDemand('submit')">提交</Button>
                      <Button type="primary" class="mr10" @click="finishedDemand('save')">保存</Button>
              </div>
            </div>
            <div class="mainContent">
              <addStockDemand
              ref="addStockDemand"
              :warehouse-arr="warehouseArr"
              :demand-data="demandData"
              :createByArr="submitterArr"
              @goBackFrom="goBackFrom"
              ></addStockDemand>
            </div>
          </div>
        </template>
        <template v-if="purchaseShow === 'stockDemandDetails'">
          <div class="subLayer infoDetails">
            <div class="topper">
              <span class="arrowLeft" @click="goBackFrom">
                <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
              </span>
              <div style="margin-left: 130px; position: absolute" v-if="demandData.type == 'audit'" >
                      <Button type="primary" class="mr10" @click="auditingDemand('agree')">同意</Button>
                      <Button type="primary" class="mr10" @click="auditingDemand('reject')">拒绝</Button>
              </div>
            </div>
            <div class="mainContent">
              <stockDemandDetails
              ref="stockDemandDetails"
              :demand-data="demandData"
              :createByArr="submitterArr"
              @goBackFrom="goBackFrom"
              ></stockDemandDetails>
            </div>
          </div>
        </template>
      </transition>
      <Modal
        v-model="stockingPlanModal.isVisible"
        title="填写备货计划编号"
        >
        <Row>
          <Col :span="5">
          <div>备货计划编号:</div>
           </Col>
           <Col :span="18">
          <dyt-input-tag
            v-model="stockingPlanModal.data.planSerialNumber"
            placeholder="多个用逗号或换行分隔"
            type="textarea"
          />
        </Col>
        </Row>
        <div slot="footer">
          <Button  @click="stockingPlanModal.isVisible = false">取消</Button>
          <Button type="primary" @click="confirmStockingPlan" :loading="stockingPlanModal.loading">确定</Button>
        </div>
    </Modal>
    </div>
</template>
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import addStockDemand from "./common/addStockDemand.vue";
import stockDemandDetails from "./common/stockDemandDetails.vue";
export default {
  mixins: [ Mixin ],
  components: { addStockDemand, stockDemandDetails },
  data() {
    return {
      purchaseShow: 'stockingDemand',
      status: null,
      pageParams: {
        statusList: [],
        backupWarehouseType: null,
        businessDeptIdList: [],
        submitByList: null,
        checkByList: null,
        backupWarehouseIdList: null,
        startSubmitTime: null,
        endSubmitTime: null,
        stockRequirementNoList: [],
        startCheckTime: null,
        endCheckTime: null,
        spuList: [],
        skuList: [],
        partialConsent: null,
        planSerialNumberList: [],
        bindPlan: null,
        pageNum: 1,
        pageSize: 20
      },
      tabItems: [
        { value: '全部', key: -1 },
        { value: '待提交', key: 0 },
        { value: '待审核', key: 1 },
        { value: '已同意', key: 2 },
        { value: '已拒绝', key: 4 },
      ],
      statusTypeMap: {
        0: '待提交',
        1: '待审核',
        2: '已同意',
        3: '部分同意',
        4: '已拒绝'
      },
      warehouseTypeArr: [],
      warehouseArr: [],
      submitterArr: [],
      submitTimeArr: [],
      auditTimeArr: [],
      total: 0,
      tableData: [],
      tableHeight: this.getTableHeight(360),
      tableloading: false,
      demandColumn: [
        {
          type: 'selection',
          align: 'center',
          width: 60
        },
        {
          key: 'stockDemand',
          title: '备货需求',
          slot: 'stockDemand',
          minWidth: 200
        },
        {
          key: 'backupWarehouseId',
          title: '备货仓库',
          align: 'center',
          width: 200,
          render: (h, params) => {
            let result = ''
            this.warehouseArr.forEach(item => {
              if(params.row.backupWarehouseId == item.id) {
                result = item.name
              }
            })
            return h('div', {}, result)
          }
        },
        {
          key: 'skuNumber',
          title: 'SKU数量',
          align: 'center',
          width: 90,
        },
        {
          key: 'totalStockRequirementNumber',
          title: '申请数量',
          align: 'center',
          width: 90,
        },
        {
          key: 'totalCheckStockRequirementNumber',
          title: '同意备货数量',
          align: 'center',
          width: 150,
          render: (h, params) => {
            return h('div', {}, 
            this.$common.isEmpty(params.row.totalCheckStockRequirementNumber) ? '-' : params.row.totalCheckStockRequirementNumber)
          }
        },
        {
          key: 'remark',
          title: '需求备注',
          align: 'center',
          minWidth: 180,
          tooltip: true,
          render: (h, params) => {
            return h('Tooltip',{
              props: {
                content: params.row.remark,
                maxWidth: 300,
                transfer: true
              }
            } , [
              h('div', {
                style: {
                  width: '100px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }
              },params.row.remark)
            ])
          }
        },
        {
          key: 'submitInfo',
          title: '提交信息',
          align: 'center',
          width: 200,
          render: (h, params) => {
            return [
              h('div',{} , params.row.submitBy),
              h('div',{} , params.row.submitTime)
            ]
          }
        },
        {
          key: 'auditInfo',
          title: '审核信息',
          align: 'center',
          width: 220,
          render: (h, params) => {
            return [
              h('div',{} , params.row.checkBy),
              h('div',{} , params.row.checkTime)
            ]
          }
        },
        {
          key: "operation",
          align: "center",
          title: "操作",
          width: 100,
          render: (h, params) => {
            return h('Dropdown', {
              props:{
                transfer: true
              },
            },[
              h('Button',{
                props: {
                  type:'default',
                },
              },[
                h('span','操作'),
                h('Icon',{
                  props:{
                    type:"md-arrow-dropdown"
                  }
                },'')
              ]),
              h('DropdownMenu', {
                slot:'list'
              }, [
              params.row.status !== 0 && params.row.status !== 1 ? 
                h('DropdownItem', {
                  nativeOn:{
                    click:(e) => {
                      this.openStockDemandDetails(params.row.stockRequirementNo, 'view')
                    }
                  }
                },'查看') : null,
                params.row.status == 0  && this.permission.submit? 
                h('DropdownItem', {
                  nativeOn:{
                    click:(e) => {
                      this.submitDemand(params.row.stockRequirementNo)
                    }
                  }
                },'提交') : null,
                params.row.status == 0 && this.permission.del? 
                h('DropdownItem', {
                  nativeOn:{
                    click:(e) => {
                      this.deleteDemand(params.row.stockRequirementNo)
                    }
                  }
                },'删除') : null,
                params.row.status == 1 && this.permission.check? 
                h('DropdownItem', {
                  nativeOn:{
                    click:(e) => {
                      this.openStockDemandDetails(params.row.stockRequirementNo, 'audit')
                    }
                  }
                },'审核') : null,
                params.row.status == 1 && this.permission.plan ? 
                h('DropdownItem', {
                  nativeOn:{
                    click:() => {
                      this.openWritePlanModal(params.row, 'single');
                    }
                  }
                },'填写计划编号') : null,
              ]),
            ])
          }
        },
      ],
      selectedArr: [],
      demandData: {
        type: ''
      },
      stockingPlanModal: {
        isVisible: false,
        loading: false,
        data: {}
      }
    }
  },
  created(){
    this.intiBaseDataList()
  },
  computed:{
    permission () {
      return {
        add: this.getPermission('stockRequirement_add'),
        query: this.getPermission('stockRequirement_query'),
        export: this.getPermission('stockRequirement_export'),
        submit: this.getPermission('stockRequirement_submit'),
        del: this.getPermission('stockRequirement_del'),
        check: this.getPermission('stockRequirement_check'),
        plan: this.getPermission('stockRequirement_inputPlan'),
      }
    },
    // 获取当前登录账号可查看的事业部数据信息
    allowBusinessDept () {
      return this.$store.getters['allowBusinessDept'];
    },
    // 批量填写计划的对应数据
    batchWritePlan () {
      let writeNo = [];
      writeNo = this.$common.arrRemoveRepeat((this.selectedArr || []).filter(f => {
        return f.status == 1;
      }).map(m => {
        return m.stockRequirementNo;
      }));
      const info = this.selectedArr.find(f => f.status != 1);
      return {
        writeNo: writeNo,
        disabled: writeNo.length == 0 || !this.$common.isEmpty(info)
      };
    }
  },
  methods:{
    // 切换页面
    showCurrentPage(val) {
      if(this.status == '-1') {
        this.pageParams.statusList = null
      } else if(this.status == '2') {
        this.pageParams.statusList = [2, 3]
      } else {
        this.pageParams.statusList = [Number(val)]
      }
      this.getList()
    },
    intiBaseDataList() {
      let  dayjs =  this.$common.dayjs()
      this.pageParams.startSubmitTime = dayjs.subtract(6, 'day').format('YYYY-MM-DD') + ' 00:00:00'
      this.pageParams.endSubmitTime = dayjs.format('YYYY-MM-DD') + ' 23:59:59'
      this.submitTimeArr = [this.pageParams.startSubmitTime, this.pageParams.endSubmitTime]
      this.axios.get(api.warehouseType).then((res) => {
        if (res.data.code == 0) {
          this.warehouseTypeArr = res.data.datas;
        }
      });
      let userInfo = this.$store.state.userInfo;
      let obj = {
        merchantId: userInfo.merchantId,
        userId: userInfo.userId,
        warehouseStatus: '0'
      };
      this.axios.post(api.warehouseUser, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data.length > 0) {
            data.map((item) => {
              this.warehouseArr.push({
                id: item.warehouseId,
                name: item.warehouseName,
                warehouseType: item.warehouseType
              });
            });
          }
          this.getList()
        }
      });
      this.axios.get(api.userList).then((res) => {
        if (res.data.code == 0) {
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
          this.submitterArr = arr;
        }
      });
    },
    // 赋值时间
    getDateValue(value, type) {
      this.pageParams[`start${type}Time`] = value[0]
      this.pageParams[`end${type}Time`] = value[1]
    },
    search() {
      this.pageParams.pageNum = 1
      this.getList()
    },
    reset(){
      this.$refs['pageParams'].resetFields();
      this.pageParams.startSubmitTime = null;
      this.pageParams.endSubmitTime = null
      this.pageParams.startCheckTime = null
      this.pageParams.endCheckTime = null
      this.submitTimeArr = []
      this.auditTimeArr = []
    },
    getPageParams (isSearch = false) {
      let obj = this.$common.copy(this.pageParams);
      if (isSearch) {
        obj.statusList = this.$common.isEmpty(obj.partialConsent) ? obj.statusList : obj.partialConsent ? [3] : [2];
      }
      if(obj.statusList && obj.statusList.includes(0)) {
        obj.startSubmitTime = null
        obj.endSubmitTime = null
      }
      obj.backupWarehouseIdList = this.$common.isEmpty(obj.backupWarehouseIdList) ? this.warehouseArr.map(item => item.id) : obj.backupWarehouseIdList;
      return obj;
    },
    getList() {
      if(!this.permission.query) return this.$Message.error('暂无权限')
      let obj = this.getPageParams(true);
      this.Tableloading = true
      this.selectedArr = [];
      this.axios.post(api.query_requirementList, obj).then(res => {
        if(res.data.code == 0) {
          this.tableData = !this.$common.isEmpty(res.data.datas) ? res.data.datas.list : []
          this.tableData.forEach(item => {
            let businessDeptInfo = {};
            if (this.$common.isEmpty(this.$store.getters["businessDeptList"])) return businessDeptInfo;
            this.$store.getters["businessDeptList"].forEach(el => {
              businessDeptInfo[el.id] = el
            })
            this.$common.isEmpty(item.businessDeptId) ? '' : this.$set(item, 'businessDeptName', businessDeptInfo[item.businessDeptId].name)
          })
          this.total = res.data.datas.total
        }
      }).finally(() => {
        this.Tableloading = false
      })
    },
    // 新增备货需求
    newAddDemand() {
      this.demandData = {
        type: 'create'
      }
      this.purchaseShow = 'addStockingDemand'
    },
    goBackFrom() {
      this.purchaseShow = 'stockingDemand'
      this.getList()
    },
    // 导出
    exportData(val) {
      let obj = {}
      if(val == '1') {
        obj = this.getPageParams();
      } else {
        if (this.$common.isEmpty(this.selectedArr)) return this.$Message.error('请选择需要导出的数据！');
        obj = {
          stockRequirementNoList: this.selectedArr.map(item => item.stockRequirementNo)
        }
      }
      this.tableLoading = true
      this.axios.post(api.export_requirementOrder, obj).then(res => {
        if(res.data.code === 0) {
          this.$Message.success('导出成功')
          this.getList()
        }
      }).finally(() => {
        this.tableloading = false
      })
    },
    // 选中
    getSelectValue(val) {
      this.selectedArr = val
    },
    // 改变页面
    changePage(val) {
      this.pageParams.pageNum = val
      this.getList()
    },
    changePageSize(val) {
      this.pageParams.pageNum = 1
      this.pageParams.pageSize = val
      this.getList()
    },
    // 提交或保存备货需求
    finishedDemand(type) {
      this.$refs.addStockDemand.finishedDemand(type)
    },
    // 打开待提交需求页面
    submitDemand(val) {
      this.tableLoading = true
      this.axios.get(`${api.query_requirementDetails}?stockRequirementNo=${val}`).then(res => {
        if(res.data.code == 0){
          this.demandData = res.data.datas
          this.demandData.type = 'edit'
          this.demandData.stockRequirementDetailList = this.demandData.stockRequirementDetailList.map(item => {
            return {
              ...item,
              spu: item.productSpu,
              skuNo: item.productSku
            }
          })
          this.purchaseShow = 'addStockingDemand'
        }
      }).finally(() => {
        this.tableLoading = false
      })
    },
    // 删除待提交状态备货需求
    deleteDemand(val){
      this.tableloading = true
      this.axios.get(`${api.delete_requirementOrder}?stockRequirementNo=${val}`).then(res => {
        if(res.data.code == 0){
          this.$Message.success('删除成功')
          this.getList()
        }
      }).finally(() => {
        this.tableLoading = false
      })
    },
    // 同意或拒绝待审核状态备货需求
    auditingDemand(type) {
      this.$refs.stockDemandDetails.auditingDemand(type)
    },
    // 查看\审核备货需求详情页面
    openStockDemandDetails(val, type){
      this.tableLoading = true
      this.axios.get(`${api.query_requirementDetails}?stockRequirementNo=${val}`).then(res => {
        if(res.data.code == 0){
          this.demandData = res.data.datas
          this.demandData.type = type
          this.demandData.stockRequirementDetailList.forEach(item => {
            if(this.$common.isEmpty(item.checkStockRequirementNumber)) {
              this.$set(item, 'checkStockRequirementNumber',item.stockRequirementNumber)
            }
          })
          this.warehouseArr.forEach(item => {
            if(this.demandData.backupWarehouseId === item.id) {
              this.demandData.backupWarehouseName = item.name
            }
          })
          this.purchaseShow = 'stockDemandDetails'
        }
      }).finally(() => {
        this.tableLoading = false
      })
    },
    // 点击需求编号查看详情
    getStockingDetails(row, type) {
      if(row.status == 0) {
        // 待提交-详情 页面
        this.tableLoading = true
        this.axios.get(`${api.query_requirementDetails}?stockRequirementNo=${row.stockRequirementNo}`).then(res => {
          if(res.data.code == 0){
            this.demandData = res.data.datas
            this.demandData.type = type
            this.demandData.stockRequirementDetailList = this.demandData.stockRequirementDetailList.map(item => {
              return {
                ...item,
                spu: item.productSpu,
                skuNo: item.productSku
              }
            })
            this.purchaseShow = 'addStockingDemand'
          }
        }).finally(() => {
          this.tableLoading = false
        })
      } else {
        this.openStockDemandDetails(row.stockRequirementNo, 'view')
      }
    },
    // 确认填写备货计划编号
    confirmStockingPlan() {
      let obj = this.$common.copy(this.stockingPlanModal.data);
      if(this.$common.isEmpty(obj.planSerialNumber)) return this.$Message.error('请填写备货计划编号');
      const planNumber = obj.planSerialNumber.join(',');
      delete obj.planSerialNumber;
      this.stockingPlanModal.loading = true;
      this.axios.post(`${api.add_plan}?planSerialNumber=${planNumber}`, obj.stockRequirementNo).then(res => {
        if(res.data.code === 0) {
          this.$Message.success('操作成功');
          this.stockingPlanModal.isVisible = false;
        }
      }).finally(() => {
        this.stockingPlanModal.loading = false;
      })
    },
    // 打开填写计划编号弹窗
    openWritePlanModal (row, type = 'single') {
      let writeNo = '';
      if (type == 'batch') {
        if (this.$common.isEmpty(this.selectedArr)) return this.$Message.error('请选择需要操作的数据！');
        writeNo = this.batchWritePlan.writeNo;
      } else {
        if (this.$common.isEmpty(row)) return;
        writeNo = [row.stockRequirementNo];
      }
      this.stockingPlanModal.data = {
        stockRequirementNo: writeNo,
        planSerialNumber: []
      };
      this.$nextTick(() => {
        this.stockingPlanModal.isVisible = true;
      })
    },
  }
}
</script>
<style scoped lang="less">
.card-content {
  border-color: #ffff;
}
.linkStyle{
  color: #2D8CF0;
  text-decoration: underline;
  cursor: pointer
}

</style>