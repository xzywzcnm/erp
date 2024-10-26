<template >
  <div class="exportTask">
    <!--筛选条件-->
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth" class="fixwidthForm">
              <dyt-filter>
                <Form-item label="导出类型">
                  <dyt-select v-model="pageParams.types" multiple :max-tag-count="1">
                    <Option v-for="(item, index) in exportTypes" :key="index" :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <FormItem label="导出状态" class="notplatformParamsSelect">
                  <Button-group>
                    <template v-for="(item, index) in typeList">
                      <Button v-if="item.selected" type="primary" @click="enbaleType(index, item.status)"
                        :key="index">{{ item.title }}</Button>
                      <Button v-if="!item.selected" @click="enbaleType(index, item.status)" :key="index">{{ item.title
                      }}</Button>
                    </template>
                  </Button-group>
                </FormItem>
                <Form-item label="任务号">
                  <dyt-input placeholder="请输入任务号" v-model.trim="pageParams.operateCode"></dyt-input>
                </Form-item>
                <Form-item label="导出时间">
                  <DatePicker transfer @on-change="selectDate" @on-clear="resetDate" placeholder="选择日期"
                    format="yyyy-MM-dd" style="width: calc(100% - 40px);" />
                  <span class="ml10">之前</span>
                </Form-item>
                <div slot="operation">
                  <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询</Button>
                  <Button @click="reset" class="ml10" icon="md-refresh">重置</Button>
                  <Button
                    type="primary"
                    @click="openAssistantModal"
                    class="ml10"
                    v-if="productCenter && permission.export"
                  >定时导出助手</Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>
    <!-- 列表 -->
    <div class="orderTable normalTop">
      <Table highlight-row :loading="tableLoading" border :height="tableHeight" :columns="exportColumn"
        :data="exportData"></Table>
      <div class="table-page">
        <div class="table-page-right">
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
            :current="pageParams.pageNum" show-sizer @on-page-size-change="changePageSize" placement="top"
            :page-size-opts="pageArray"></Page>
        </div>
      </div>
    </div>
    <exportAssistantModal :modal-visible.sync="visibleAssistantModal" :modal-data="assistantModalData" />
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import exportAssistantModal from './exportAssistantModal.vue';

const typeDefinition = {
  customer: [
    {
      value: 'afterSalesExport',
      label: '售后处理'
    },
    {
      value: 'reportDayCsReplyMsgStatisExport',
      label: '客服统计'
    },
    {
      value: 'ebayAfterSalesExport',
      label: '退货退款'
    },
    {
      value: 'ebayPaymentDisputeExport',
      label: '付款纠纷'
    },
    {
      value: 'notReceiveGoods',
      label: '未收到货品'
    },
    {
      value: 'acclaim',
      label: '好评'
    },
    {
      value: 'neutral',
      label: '中评'
    },
    {
      value: 'badReviews',
      label: '差评'
    }
  ],
  productCenter: [
    {
      value: 'productExport',
      label: '商品导出'
    },
    {
      value: 'productSkuMappingExport',
      label: '映射导出'
    },
    {
      value: 'productTagExport',
      label: '标签导出'
    },
    {
      value: 'productCategoryExport',
      label: '分类导出'
    },
    {
      value: 'temuThirdPartyTagExport',
      label: 'Temu第三方标签导出'
    },
    {
      value: 'SheinThirdPartyTagExport',
      label: 'Shein第三方标签导出'
    },
    {
      value: 'tiktokThirdPartyTagExport',
      label: 'Tiktok第三方标签导出'
    },
    {
      value: 'productBacklogExport',
      label: 'SKU待办项导出'
    },
    // {
    //   value: 'ozonThirdPartyTagExport',
    //   label: 'OZON第三方标签导出'
    // },
    {
      value: 'afterSalesExport',
      label: '售后导出'
    },
    {
      value: 'autoHaleTheSalesExport',
      label: 'YMS停售调整记录导出'
    },
  ],
  orderTypes: [
    {
      value: 'orderExport',
      label: '全文检索订单导出'
    },
    {
      value: 'invalidOrderExport',
      label: '取消订单导出'
    },
    {
      value: 'suspendOrderExport',
      label: '截留订单导出'
    }
  ],
  orderSelfTypes: {
    aliexpress: [
      {
        value: 'aliexpressPurchaseOrderExport',
        label: '全托管订单导出'
      },
    ],
    otto: [
      {
        value: 'ottoRefundExport',
        label: '退款信息导出'
      },
      {
        value: 'returnPackageExport',
        label: '退货包裹导出'
      }
    ]
  }
}

export default {
  mixins: [Mixin],
  components: {
    exportAssistantModal
  },
  data () {
    return {
      filenodeViewTargetUrl: this.$store.state.erpConfig.filenodeViewTargetUrl, // filenode根路径
      pageParamsStatus: false, // 是否重新加载列表数据
      total: 0, // 总记录数
      exportTypes: [], // 导出类型
      exportTypeObj: {},
      userInfoMap: [], // 操作人
      customChannel: false, // 判断是否是自定义渠道
      customerService: false, // 判断当前系统是否是客服管理系统
      productCenter: false, // 判断当前系统是否是商品管理系统
      exportTypesJson: {},
      visibleAssistantModal: false,
      assistantModalData: {},
      pageParams: {
        types: [],
        status: null,
        operateCode: null,
        createdTime: null,
        pageSize: 50,
        pageNum: 1
      },
      typeList: [ // 2:操作中 3:操作完成 4：操作失败(格式校验不通过或其他运行时异常)
        {
          selected: true,
          status: '',
          title: '全部'
        }, {
          selected: false,
          status: 3,
          title: '导出完成'
        }, {
          selected: false,
          status: 4,
          title: '导出失败'
        }, {
          selected: false,
          status: 2,
          title: '导出中'
        }
      ],
      exportData: [],
      exportColumn: [
        {
          title: '序号',
          width: 70,
          fixed: 'left',
          align: 'center',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        }, {
          title: '导出任务号',
          key: 'operateCode',
          align: 'center',
          minWidth: 120
        }, {
          title: '导出类型',
          key: 'types',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            if (this.$common.isEmpty(this.exportTypeObj[params.row.type])) return h('span', '')
            return h('span', this.exportTypeObj[params.row.type].label || '');
          }
        }, {
          title: '导出时间',
          key: 'createdTime',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', this.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        }, {
          title: '状态',
          key: 'status',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            if (params.row.status === 2) {
              return h('span', '导出中');
            } else if (params.row.status === 3) {
              return h('span', '导出完成');
            } else if (params.row.status === 4) {
              return h('span', {
                style: {
                  color: '#FF0000'
                }
              }, '导出失败');
            }
          }
        }, {
          title: '操作人',
          key: 'createdBy',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            if (this.userInfoMap) {
              if (this.userInfoMap[params.row.createdBy]) {
                return h('span', this.userInfoMap[params.row.createdBy].userName || params.row.createdBy);
              }
            }
          }
        }, {
          title: '备注',
          width: 200,
          align: 'center',
          resizable: true,
          key: 'reason',
          render: (h, params) => {
            return h('div', {
              style: {
                color: '#FF0000'
              }
            }, params.row.reason);
          }
        }, {
          title: '操作',
          width: 200,
          fixed: 'right',
          align: 'center',
          render: (h, params) => {
            if (params.row.status !== 2 && params.row.status !== 4) {
              return h('div', {
                style: {
                  color: '#0000FF',
                  cursor: 'pointer'
                },
                on: {
                  click: () => {
                    window.open(this.filenodeViewTargetUrl + params.row.targetPath);
                  }
                }
              }, '下载');
            }
          }
        }
      ]
    };
  },
  watch: {
    pageParamsStatus: function (n, o) { // 监听重置列表数据
      let v = this;
      if (n) {
        v.$Loading.start();
        // 判断当前进入的是那个系统，不同的系统下导入导出的权限不一样
        let location = window.location.href; // customer.html
        let permission_name = '';
        if (location.indexOf('order-service') > -1) {
          permission_name = 'orderCommonTaskInfo_queryCommonTaskInfoData';
        } else if (location.indexOf('productCenter.html') > -1) {
          permission_name = 'productCenter_exportTask';
        } else if (location.indexOf('customer.html') > -1) {
          permission_name = 'erpCommon_queryTask';
        }
        v.getPermission(permission_name) ? v.getList() : v.gotoError();
        v.$Loading.finish();
        v.pageParamsStatus = false;
      }
    }
  },
  computed: {
    permission() {
      return {
        export: this.getPermission('productCenter_exportAssistant'),
      }
    }
  },
  created () {
    let str = window.location.href;
    let route = this.$route;
    let platform = this.$common.isEmpty(route.query) ? '' : route.query.platform || '';
    // 判断当前的渠道是否是自定义渠道
    if (str.indexOf('definePlatform.html') !== -1) {
      this.customChannel = true;
      if (route.path == '/exportTask') {
        if (this.$common.isEmpty(platform) && str.includes('/') && str.includes('.')) {
          platform = str.substring(str.lastIndexOf('/') + 1, str.lastIndexOf('.'));
        }
        if (this.$common.isEmpty(typeDefinition[platform])) {
          this.exportTypes = [ ...typeDefinition.orderTypes, ...(typeDefinition.orderSelfTypes[platform] || []) ];
        } else {
          this.exportTypes = typeDefinition[platform];
        }
      }
    } else if (str.indexOf('customer.html') !== -1) {
      // 判断当前的系统是否是客服管理系统
      this.customerService = true;
      this.exportTypes = typeDefinition.customer || [];
      // 客服的默认值取消
      // this.pageParams.types = ['afterSalesExport'];
    } else if (str.indexOf('productCenter.html') !== -1) {
      // 判断当前系统是否是商品管理系统
      this.productCenter = true;
      this.exportTypes = typeDefinition.productCenter || [];
    } else {
      this.productCenter = false;
      this.customerService = false;
      this.customChannel = false;
      this.pageParams.types = [];
      if (route.path == '/exportTask') {
        const pathname = window.location.pathname;
        if (this.$common.isEmpty(platform) && pathname.includes('/') && pathname.includes('.')) {
          platform = pathname.substring(pathname.lastIndexOf('/') + 1, pathname.lastIndexOf('.'));
        }
        if (this.$common.isEmpty(typeDefinition[platform])) {
          this.exportTypes = [ ...typeDefinition.orderTypes, ...(typeDefinition.orderSelfTypes[platform] || []) ];
        } else {
          this.exportTypes = typeDefinition[platform];
        }
      }
    }
    this.tableHeight = this.getTableHeight(245);
    this.pageParamsStatus = true;
    this.exportTypeObj = {};
    (this.exportTypes || []).forEach((item) => {
      this.$set(this.exportTypeObj, item.value, item);
    })
  },
  methods: {
    enbaleType (index, status) { // 选择状态
      let v = this;
      if (index === 0) {
        v.pageParams.status = null;
      } else if (index === 1) {
        v.pageParams.status = '3';
      } else if (index === 2) {
        v.pageParams.status = '4';
      } else {
        v.pageParams.status = '2';
      }
      v.typeList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    selectDate (val) { // 选择日期
      let v = this;
      if (!val) {
        return false;
      }
      v.pageParams.createdTime = v.getUniversalTime(new Date(val).getTime(), 'fulltime');
    },
    resetDate () { // 重置日期
      let v = this;
      v.pageParams.createdTime = null;
    },
    search () { // 查询
      let v = this;
      v.pageParams.pageNum = 1;
      v.pageParamsStatus = true;
    },
    reset () { // 重置
      let v = this;
      v.pageParams.types = [];
      // v.pageParams.status = null;
      v.enbaleType(0, '');
      v.pageParams.operateCode = null;
      v.pageParams.createdTime = null;
    },
    getList () { // 获取列表数据
      let v = this;
      let userIds = [];
      let types = [];
      // if (v.pageParams.types.length === 0) {
      //   let productCenterTypes = [
      //     'productExport', 'productSkuMappingExport', 'productTagExport', 'productCategoryExport', 'afterSalesExport'
      //   ];
      //   types = v.customerService ? ['afterSalesExport'] : v.productCenter ? productCenterTypes : v.exportTypes.map(i => i.value);
      // } else {
      //   types = v.pageParams.types;
      // }
      types = v.pageParams.types.length === 0 && (v.customerService || v.productCenter) ? v.exportTypes.map(i => i.value) : v.pageParams.types;
      let obj = {
        types: types,
        status: v.pageParams.status,
        operateCode: v.pageParams.operateCode,
        createdTime: v.pageParams.createdTime,
        pageSize: v.pageParams.pageSize,
        pageNum: v.pageParams.pageNum
      };
      if (v.productCenter === false && v.customerService === false) {
        obj.platformIds = v.customChannel ? ['definePlatform'] : [v.inGroup];
      }
      let url = v.customerService ? api.export_queryTask : v.productCenter ? api.query_taskInfoData : api.query_taskData;
      v.loadingTrue();
      v.axios.post(url, obj).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data.list !== null && data.list.length > 0) {
            data.list.forEach((n, i) => {
              userIds.push(n.updatedBy);
            });
          }
          Promise.resolve(v.getUserInfoMap(userIds)).then(result => {
            v.loadingFalse();
            v.exportData = data.list;
            v.total = data.total;
          });
        }
      });
    },
    getUserInfoMap (userIds) {
      let v = this;
      return new Promise(resolve => {
        if (userIds.length > 0) {
          v.axios.post(api.get_userInfoMap, userIds).then(function (response) {
            if (response.data.code === 0) {
              v.userInfoMap = response.data.datas;
            }
          }).finally(() => {
            resolve(true);
          });
        } else {
          resolve(true);
        }
      });
    },
    // 打开定时助手弹窗
    openAssistantModal () {
      this.visibleAssistantModal = true;
    }
  }
};
</script>
