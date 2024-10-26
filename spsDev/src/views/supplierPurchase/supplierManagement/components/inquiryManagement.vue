<template>
    <div>
    <template v-if="inquiryShow === 'inquiryManagement'">
      <div class="tabContent">
        <div class="supplierTabsBar commonFilter normalTop">
        <template>
          <Tabs v-model="pageParams.status" @on-click="showCurrentPage">
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
                            <FormItem label="询价单编号:" prop="inquiryCode">
                                <dyt-input-tag
                                    :limit="1"
                                    v-model="pageParams.inquiryCode"
                                    placeholder="多个用逗号或回车分开"
                                    type="textarea"
                                ></dyt-input-tag>
                            </FormItem>
                            <FormItem label="供应商：" prop="supplierId" >
                                <dyt-select v-model="pageParams.supplierId" 
                                :max-tag-count="1"
                                multiple
                                clearable placeholder="请选择" > <Option
                                    v-for="(item,index) in supplierList"
                                    :value="item.supplierId"
                                    :key="index" >{{ item.supplierName }} </Option > </dyt-select >
                            </FormItem >
                            <FormItem label="spu：" prop="spu" >
                              <dyt-input-tag
                                    :limit="1"
                                    v-model="pageParams.spu"
                                    placeholder="多个用逗号或回车分开"
                                    type="textarea"
                                ></dyt-input-tag>
                            </FormItem >    
                            <FormItem label="skc：" prop="skc">
                                <dyt-input-tag
                                    :limit="1"
                                    v-model="pageParams.skc"
                                    placeholder="多个用逗号或回车分开"
                                    type="textarea"
                                ></dyt-input-tag>
                            </FormItem>
                            <div slot="operation" style="margin-bottom: 50px;">
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
            <div class="tableControl mb10" style="margin-left:12px">
           <!-- 按钮 -->
              <Button type="primary" v-if="getPermission('inquiryManagement_add')" @click="getInquiryForm('add')">新建询价单</Button>
            </div>
        </div>
        <div class="commonFilter">
        <div class="orderTable">
            <Table ref="inquiryTable"
             highlight-row
             :border="true"
             :loading="tableLoading"
             :height="tableHeight"
             :columns="returnsColumn"
             :data="tableData"
             @on-selection-change="getSelectValue">
             <template slot-scope="{ row }" slot="quotation">
              <div class="ml10 mt20">
                <div>
                <span>询价单：</span>
                  <span
                    style="
                      color: #2d8cf0;
                      cursor: pointer;
                      text-decoration: underline;
                    "
                    @click="editAndViewInquiryForm('view',row)"
                    >{{ row.inquiryCode }}</span
                  >
                </div>
                <div style="margin-top:5px">
                <span>供应商：{{ supplierMap[row.supplierId] }}</span
                  >
                </div>
                <div style="display: flex; flex-wrap: wrap" class="mb10 noBorder">
                  <Tag
                    :color="statusMap[row.status].color"
                    v-if="!$common.isEmpty(row.status)"
                  >
                  {{ statusMap[row.status].label  || ''}}
                  </Tag>
                </div>
              </div>
              </template>
              <template slot-scope="{ row }" slot="quotationCompletionTime">
                <div>
                <div v-if="row.status == 3">{{ row.quotationCompletionTime}}</div>
                </div>
              </template>
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
       </div>
    </template>
       <transition name="bounce">
      <template v-if="inquiryShow === 'addInquiryForm'">
        <div class="subLayer infoDetails">
          <div class="topper" style="display:flex">
            <span class="arrowLeft" @click="goBackForm">
              <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
            </span>
                <div style="margin-left:150px" v-if="dialogObj.type !== 'view'">
                    <Button type="error" v-if="dialogObj.type == 'againEdit'" class="mr10" @click="cancel(dialogObj.data.spsSupplierInquiry)">作废</Button>
                    <Button class="mr10" @click="goBackForm">取消</Button>
                    <Button type="primary"  v-if="dialogObj.type !== 'againEdit'" class="mr10" @click="handleSubmit('save')">暂存</Button>
                    <Button type="primary"  v-if="dialogObj.type !== 'againEdit'" class="mr10" @click="handleSubmit('submit')">提交</Button>
                    <Button type="primary"  v-if="dialogObj.type == 'againEdit'"  @click="handleSubmit('submit')">再次提交</Button>
                </div>
            <div>
            </div>
          </div>
          <div class="mainContent">
            <addInquiryForm ref="addInquiryForm" :dialogObj="dialogObj" @completeTask="completeTask" @goBackForm="goBackForm"></addInquiryForm>
          </div>
        </div>
      </template>
      </transition>
    </div>
</template>
<script>
import api from "@/api/api";
import tableMixin from "@/components/mixin/table_mixin";
import Mixin from "@/components/mixin/common_mixin";
import addInquiryForm from "./common/addInquiryForm.vue";
export default {
  mixins: [Mixin, tableMixin],
  components: { addInquiryForm },
  data() {
    return {
      tabItems:[
        {
          key: '-1',
          value: '全部'
        },
        {
          key: '0',
          value: '待提交'
        },
        {
          key: '1',
          value: '待供应商确认'
        },
        {
          key: '2',
          value: '待二次确认'
        },
        {
          key: '3',
          value: '已完成'
        },
        {
          key: '4'  ,
          value: '已作废'
        },
      ],
      pageParams:{
        inquiryCode:[],
        supplierId:[],
        spu:[],
        skc:[],
        pageNum:1,
        pageSize:10,
        status: '-1'
      },
      total:0,
      tableLoading: false,
      tableHeight: this.getTableHeight(360),
      tableData:[],
      supplierList:[],
      supplierMap: {},
      dialogObj: {
        modelVisible: false,
        data: {},
        type: ''
      },
      statusMap: {
        0: {color: 'green', label: '待提交'},
        1: {color: 'green', label: '待供应商确认'},
        2: {color: 'green', label: '待二次确认'},
        3: {color: 'green', label: '已完成'},
        4: {color: 'red', label: '已作废'},
      },
      inquiryShow: 'inquiryManagement'
    }
  },
  computed:{
    returnsColumn() {
      return [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          key: "quotation",
          title: "报价单",
          width: 350,
          slot: "quotation",
          align:'left'
        },
        {
          key: "spu",
          align: "center",
          title: "SPU",
          maxWidth: 150,
          render: (h, params) => {
            return [
              h('div',{}, params.row.spu)
            ]
          },
        },
        {
          key: "quotationAmount",
          align: "center",
          title: "报价金额", 
          maxWidth: 180,
          render: (h, params) => {
            const { minQuotationAmount, maxQuotationAmount} = params.row
            let result = minQuotationAmount === maxQuotationAmount ? maxQuotationAmount : `${minQuotationAmount}-${maxQuotationAmount}`
            return [
              h('div',{}, result)
            ]
          },
        },
        {
          key: "supplierConfirmedAmount",
          align: "center",
          title: "供应商确认金额",
          maxWidth: 180,
          render: (h, params) => {
            const { minQuotationAmount, maxQuotationAmount , status} = params.row
            let result = minQuotationAmount === maxQuotationAmount ? maxQuotationAmount : `${minQuotationAmount}-${maxQuotationAmount}`
            return [
              h('div',{}, status == 3 ?  result : '')
            ]
          },
        },
        {
          key: "createInformation",
          align: "center",
          title: "创建信息",
          render: (h, params) => {
            return [
              h('div',{}, params.row.createdBy),
              h('div',{}, params.row.createdTime)
            ]
          },
        },
        {
          key: "quotationCompletionTime",
          align: "center",
          title: "完成报价时间",
          slot: 'quotationCompletionTime'
        },
        {
          key: "operation",
          align: "center",
          title: "操作",
          maxWidth: 150,
          render: (h, params) => {
            if(params.row.status === 0 || params.row.status === 2) {
              return h('Dropdown', {
                props:{
                  style:{
                    marginLeft: '10px',
                  }
                }
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
                  this.getPermission('inquiryManagement_submit') ? 
                  h('DropdownItem', {
                    nativeOn:{
                      click:(e) => {
                        this.$Modal.confirm({
                          title: '提交询价单',
                          loading: true,
                          content: `你将提交该询价单`,
                          okText:'提交',
                          onOk: () => {
                            this.axios.post(api.update_supplierInquiryStatus, {
                              inquiryId: params.row.inquiryId,
                              inquiryCode: params.row.inquiryCode,
                              status: 1,
                              oldStatus: params.row.status //用于区分状态
                            }).then( res => {
                              if(res.data.code === 0){
                                this.$Message.success('操作成功')
                                this.getList()
                              }
                            }).finally(() => {
                              this.$Modal.remove();
                            })
                          }
                        });
                      }
                    }
                  },'提交'): null,
                  this.getPermission('inquiryManagement_edit') ? 
                  h('DropdownItem', {
                    nativeOn:{
                      click:(e) => {
                        const { status } = params.row
                        let type = status === 2 ? 'againEdit' : 'edit'
                        this.editAndViewInquiryForm(type,params.row)
                      }
                    }
                  },'编辑'): null,
                  this.getPermission('inquiryManagement_Invalidate') ? 
                  h('DropdownItem', {
                    nativeOn:{
                      click:(e) => {
                        this.$Modal.confirm({
                          title: '作废询价单',
                          content: `你将作废该询价单`,
                          loading: true, 
                          okText:'作废',
                          onOk: () => {
                            this.cancel(params.row)
                          }
                        });
                      }
                    }
                  },'作废'): null,
                ]),
              ])
            } else {
              return ''
            }
          }
        },
      ]
    },
  },
  created(){
    this.getSupplierList()
    this.getList()
  },
  activated(){
    this.inquiryShow = 'inquiryManagement'
    this.getList()
  },
  methods:{
    // 获取供应商数据
    getSupplierList() {
      this.axios.get(api.supplierAll).then((res) => {
        this.supplierList = res.data.datas;
        this.supplierList.forEach(item => {
          this.$set(this.supplierMap, item.supplierId, item.supplierName)
        })
      });
    },
    // 改变tab栏
    showCurrentPage(status){
      this.pageParams.status = status;
      this.getList()
    },
    // 页数改变
    changePage(val){
      this.pageParams.pageNum = val
      this.getList()
    },
    // 页尺寸改变
    changePageSize(val){
      this.pageParams.pageSize = val
      this.getList()
    },
    // 选中选项
    getSelectValue(){},
    // 获取列表
    getList(){
      let obj = this.$common.copy(this.pageParams)
      obj.status = Number(obj.status) === -1 ? null : Number(obj.status)
      this.goBackForm()
      if(!this.getPermission('inquiryManagement_query')){
        return this.$Message.error('暂无权限查看')
      }
      this.tableLoading = true
      this.axios.post(api.query_supplierInquiryList, obj).then(res => {
        if(res.data.code === 0) {
          this.tableData = res.data.datas ? res.data.datas.list : []
          this.total = res.data.datas ?  res.data.datas.total : 0
        }
      }).finally(() => {
        this.tableLoading = false
      })
    },
    // 搜索
    search(){
      this.getList()
    },
    // 重置
    reset(){
      this.$refs['pageParams'].resetFields();
    },
    getInquiryForm(type){
      this.dialogObj.type = type
      this.dialogObj.modelVisible = true
      this.inquiryShow = 'addInquiryForm'
    },
    // 编辑
    editAndViewInquiryForm(type,data){
      this.dialogObj.type = type
      this.axios.post(api.get_supplierInquiryDetail, {
        inquiryId: data.inquiryId,
        inquiryCode: data.inquiryCode
      }).then(res => {
        if(res.data.code === 0){
          this.dialogObj.data = res.data.datas
          this.dialogObj.data.spsSupplierInquiry.firstChoice = 
          this.dialogObj.data.spsSupplierInquiry.firstChoice === 0 ? false : true
          this.dialogObj.data.patternFile = data.patternFile
          this.dialogObj.modelVisible = true
          this.inquiryShow = 'addInquiryForm'
        }
      })
    },
    completeTask(){
      this.getList()
    },
    goBackForm(){
      this.dialogObj.modelVisible = false
      this.inquiryShow = 'inquiryManagement'
    },
    cancel(data){
      this.axios.post(api.update_supplierInquiryStatus, {
        inquiryId: data.inquiryId,
        inquiryCode: data.inquiryCode,
        status: 4,
        oldStatus: data.status // 用于区分状态
      }).then( res => {
        if(res.data.code === 0){
          this.$Message.success('操作成功')
          this.getList()
        }
      }).finally(() => {
        this.$Modal.remove();
        this.goBackForm()
      })
    },
    handleSubmit(type){
      this.$refs.addInquiryForm.handleSubmit(type)
    }
  }
}
</script>
<style lang="less">
  .noBorder {
    .ivu-tag {
      border: 0px;
    }
  }
</style>