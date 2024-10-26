<template>
  <div class="searchPackage">
    <div v-if="workShow === 'list'" class="listPage">
      <!--搜索-->
      <div class="searchMain">
        <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
          <dyt-filter>
            <FormItem label="物流方式" prop="shippingList">
              <!-- <Cascader transfer v-model="shippingMethodModel" :load-data="loadData" @on-change="changeShippingMethod"
                @on-visible-change="showShippingData" :data="shippingMethodData" filterable change-on-select></Cascader> -->
              <dyt-shippingSelect v-model="pageParams.shippingList" @on-change="shippingChange" :loadingChildren="true"
                placeholder="请选择物流方式" />
            </FormItem>
            <!-- 出库时间 -->
            <Form-item label="出库时间">
              <Date-picker style="width:100%" type="datetimerange" @on-clear="resetDate" transfer
                @on-change="getDateValue" :clearable="clearAble" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss"
                placement="bottom-end" placeholder="选择日期" :value="payTimeArr"></Date-picker>
            </Form-item>
            <Form-item label="SKU" prop="sku">
              <dyt-input-tag :limit="1" :string="true" type="textarea" v-model.trim="pageParams.sku"
                placeholder="请输入SKU" />
            </Form-item>
            <!-- <Form-item label="搜索字符" prop="searchValue">
              <Input placeholder="可输入订单号、出库单号、买家ID、买家姓名、SKU" v-model.trim="pageParams.searchValue"></Input>
            </Form-item> -->
            <Form-item label="运单号" prop="trackingNumber" class="ivu-form-item-label-no-padding">
              <div slot="label">
                <Select v-model="trackingModel" @on-change="changeTrack" style="width: 100px; margin-right: 5px;">
                  <Option v-for="item in trackingList" :key="item.value" :value="item.value">{{ item.label }}
                  </Option>
                </Select>
              </div>
              <dyt-input-tag :limit="1" :string="true" type="textarea" v-if="trackingModel === 1"
                placeholder="请输入运单号，多个运单号可用逗号或回车分隔" v-model.trim="pageParams.trackingNumber" />
              <dyt-input-tag :limit="1" :string="true" type="textarea" v-if="trackingModel === 2"
                placeholder="请输入运单号，多个运单号可用逗号或回车分隔" v-model.trim="pageParams.thirdPartyNo" />
            </Form-item>
            <Form-item label="付款时间">
              <Date-picker style="width:100%" type="datetimerange" @on-clear="resetDate1" @on-change="getDateValue1"
                transfer :clearable="clearAble" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end"
                placeholder="选择日期" :value="payTimeArr"></Date-picker>
            </Form-item>
            <Form-item label="国家/地区" prop="buyerCountryCodeList">
              <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" multiple
                placeholder="请选择或输入所在地" :max-tag-count="1">
                <Option v-for="(item, index) in formValidate.country" :key="index" :label="item.enName"
                  :value="item.twoCode"></Option>
              </dyt-select>
            </Form-item>
            <Form-item label="出库单状态" prop="packageProcessStatus">
              <dyt-select v-model="pageParams.packageProcessStatus" multiple @on-change="outListStatusChange"
                :max-tag-count="1">
                <Option v-for="item in outListStatusList" :value="item.value" :key="item.value" :label="item.label" />
              </dyt-select>
            </Form-item>
            <Form-item label="出库单号" prop="packageCode">
              <dyt-input-tag :limit="1" :string="true" type="textarea" placeholder="请输入出库单号，多个用逗号或回车分隔"
                v-model="pageParams.packageCode" />
            </Form-item>
            <FormItem label="平台" prop="platformId">
              <dyt-select v-model="pageParams.platformId" @on-change="platFormChange">
                <Option v-for="(item, index) in platformGroupList" :key="index" :value="item.platformId"
                  :label="item.name" />
              </dyt-select>
            </FormItem>
            <FormItem label="店铺" prop="saleAccountIds">
              <dytStoreSelect v-model="pageParams.saleAccountIds" :option-data="storeList"
                :replace-option-key="{ value: 'saleAccountId', label: 'accountCode' }" placeholder="请选择店铺，可输入搜索"
                input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开" />
            </FormItem>
            <Form-item label="订单号" prop="orderNo">
              <dyt-input-tag :limit="1" :string="true" type="textarea" placeholder="请输入订单号，多个用逗号或回车分隔"
                v-model="pageParams.orderNo" />
            </Form-item>
            <Form-item label="买家姓名" prop="buyerName">
              <Input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></Input>
            </Form-item>
            <Form-item label="买家ID" prop="buyerAccountId">
              <Input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></Input>
            </Form-item>
            <Form-item label="来源渠道" prop="source">
              <dyt-select v-model="pageParams.source">
                <Option v-for="(item, index) in sourceList" :key="index" :value="item.enName" :label="item.enName">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="来源商户" prop="customerNumber">
              <Input v-model="pageParams.customerNumber" />
            </Form-item>
            <Form-item label="身份码" prop="mobileImieCode">
              <Input v-model="pageParams.mobileImieCode" clearable />
            </Form-item>
            <Form-item label="运单号">
              <dyt-select v-model="pageParams.hasTrackingNumber">
                <Option v-for="(item, i) in tabsData" :key="i + 'hasTrackingNumber'" :label="item.label"
                  :value="item.value">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="物流商单号">
              <dyt-select v-model="pageParams.hasThirdPartyNo">
                <Option v-for="(item, i) in tabsData" :key="i + 'hasThirdPartyNo'" :label="item.label"
                  :value="item.value">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="是否有物流商重量">
              <dyt-select v-model="pageParams.hasCarrierWeight">
                <Option v-for="(item, i) in tabsData3" :key="i + 'hasCarrierWeight'" :label="item.label"
                  :value="item.value">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="是否有物流商运费">
              <dyt-select v-model="pageParams.hasPostage">
                <Option v-for="(item, i) in tabsData3" :key="i + 'hasPostage'" :label="item.label" :value="item.value">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="是否手工单">
              <dyt-select v-model="pageParams.pacakgeIsImport">
                <Option v-for="(item, i) in tabsData2" :key="i + 'pacakgeIsImport'" :label="item.label"
                  :value="item.value">
                </Option>
              </dyt-select>
            </Form-item>
            <!-- <Form-item label="增值服务" prop="valueAddedServiceList">
              <dyt-select v-model="pageParams.valueAddedServiceList" :max-tag-count="1" multiple>
                <Option v-for="(item, i) in valueAddServicesOption" :key="i + 'valueAddedServiceList'" :label="item.label"
                  :value="item.value">
                </Option>
              </dyt-select>
            </Form-item> -->
            <div slot="operation">
              <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询</Button>
              <Button style="margin-left: 10px;" @click="reset" v-once icon="md-refresh">重置 </Button>
            </div>
          </dyt-filter>
        </Form>
      </div>
      <!--工具栏-->
      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <Buttons type="primary" trigger="click" @on-click="exportDataHasCondition">
              <Button type="primary" @click="exportData" class="iconbuttons"
                :disabled="!getPermission('packageInfo_export_batch')">
                <span class="icon iconfont">&#xe639;</span> 导出选中 </Button>
              <Buttons-menu slot="list">
                <Buttons-item name="1" v-if="getPermission('packageInfo_export_all')">导出（所有结果集）
                </Buttons-item>
              </Buttons-menu>
            </Buttons>
            <Button type="primary" @click="openInportModal" icon="md-archive" class="ml10"
              v-if="getPermission('packageInfo_excelImport')">导入 </Button>
            <Buttons type="primary" class="ml10" trigger="click"
              v-if="getPermission('packageInfo_cancelPackageDistribution')" @on-click="cancelAllocationAll">
              <Button type="primary" @click="cancelAllocationBtn" class="iconbuttons">取消分配选中 </Button>
            </Buttons>
          </div>
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch"
              :sorType="{ DESC: 'down', ASC: 'up' }">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>
      <!--表格-->
      <div class="tableMain">
        <div class="tableBox">
          <Table highlight-row border :loading="TableLoading" :columns="columns" :data="printData" :height="tableHeight"
            @on-selection-change="getSelectValue"></Table>
        </div>
      </div>
      <!--分页-->
      <div class="pagesMain">
        <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
          :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray">
        </Page>
      </div>
    </div>
    <!-- 导出 -->
    <Modal v-model="exportModel.status" :mask-closable="false" width="400" v-if="exportModelStatus" @on-ok="exportExcel">
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-head">
          <div class="ivu-modal-confirm-head-title">
            {{ exportModel.title }}
          </div>
        </div>
        <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
          <div class="normalTop">
            <Row>
              <Col :span="1">
              <Icon type="md-information-circle" color="#2b85e4" style="font-size:36px"></Icon>
              </Col>
              <Col :span="21" :offset="2">
              <p>
                {{ exportModel.content }} </p>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </Modal>
    <!--取消分配结果弹窗-->
    <Modal v-model="cancelTalg" :mask-closable="false" width="400">
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-head">
          <div class="ivu-modal-confirm-head-title" style="margin-left: 0;">取消分配结果</div>
        </div>
        <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
          <div class="normalTop">
            <p style="display: flex; flex-wrap: wrap; font-size: 14px;">
              <span>本次取消分配库存的出库单数量总共</span> <span class="blueColor">{{ cancelConter.totalCount }}</span>
              <span>个，其中</span> <span class="blueColor">{{ cancelConter.successCount }}</span>
              <span>个取消成功,</span> <span class="blueColor">{{ cancelConter.failCount }}</span> <span>个取消失败</span>
            </p>
          </div>
        </div>
      </div>
      <div slot="footer" style="text-align: center;">
        <Button type="primary" @click="cancelTalg = false">关闭</Button>
      </div>
    </Modal>
    <div v-if="workShow === 'detail'">
      <sellStockOutDtl :pickingNo="packageCode" :workShow="workShow" workType="sellStock" :wareExpenses="true">
      </sellStockOutDtl>
    </div>
    <importTemp @getList="search" ref="importTemp" :actionUrl="importUrl" :loadTemplateApi="loadTemplateApi"
      :files="'files'"></importTemp>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import packageDetails from './packageDetails';
import deliveryMixin from '@/components/mixin/delivery_mixin';
import publicService from '@/components/mixin/publicService_mixin';
import sellStockOutDtl from './sellStockOutDtl';
import importTemp from '@/components/common/importTemp';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';

export default {
  mixins: [Mixin, deliveryMixin, publicService, tableHeight_mixin],
  components: {
    packageDetails,
    sellStockOutDtl,
    importTemp
  },
  data() {
    var self = this;
    var v = this;
    return {
      importUrl: api.import_packageInfoExcelImport,
      loadTemplateApi: api.down_SalePackageTemplet,
      sourceList: [], // 组织列表
      trackingList: [
        {
          label: '运单号',
          value: 1
        }, {
          label: '物流商单号',
          value: 2
        }
      ],
      trackingModel: 1,
      packageIds: [], // 详情参数 Start
      packageModel: false,
      packageDetailsStatus: true,
      packageId: null,
      timestamp: null, // End
      totalPage: 0,
      total: 0,
      curPage: 1,
      payTimeArr: [],
      // shopList: [],
      pageParamsStatus: false,
      pageParamsPrototype: null, // 重置查询条件
      tabsData2: [
        {
          label: '全部',
          value: -1
        }, {
          label: '是',
          value: 1
        }, {
          label: '否',
          value: 0
        }
      ],
      tabsData3: [
        {
          label: '全部',
          value: -1
        }, {
          label: '是',
          value: 1
        }, {
          label: '否',
          value: 0
        }
      ],
      tabsData: [
        {
          label: '全部',
          value: -1
        }, {
          label: '有',
          value: 1
        }, {
          label: '无',
          value: 0
        }
      ],
      tabsData1: [
        {
          label: '全部',
          value: -1
        }, {
          label: '有',
          value: 1
        }, {
          label: '无',
          value: 0
        }
      ],
      pageParams: {
        cargoOwnerType: null,
        cargoOwnerId: null,
        pageNum: 1,
        pageSize: 10,
        source: null,
        customerNumber: null,
        mobileImieCode: null,
        status: 0,
        hasCarrierWeight: -1, // 1有 0无 -1全部
        hasPostage: -1, // 1有 0无 -1全部
        pacakgeIsImport: -1, // 1有 0无 -1全部
        hasTrackingNumber: -1,
        hasThirdPartyNo: -1,
        getLabelStatus: null,
        packageCode: null,
        waybillNo: null,
        startDespatchTime: null,
        endDespatchTime: null,
        payStartTime: null,
        payEndTime: null,
        buyerAccountId: null,
        buyerCountryCodeList: [],
        buyerName: null,
        orderBy: 'despatchTime',
        orderNo: null,
        upDown: 'up',
        webstoreItemId: null,
        sku: null,
        packageProcessStatus: null, // 出库单状态
        trackingNumber: null,
        trackingNumberList: [],
        thirdPartyNo: null,
        thirdPartyNoList: [],
        warehouseId: v.getWarehouseId(), // 仓库
        packageCodeList: [],
        orderNoList: [],
        // valueAddedServiceList: [],
        merchantCarrierIdList: [],
        merchantShippingMethodIdList: [],
        shippingList: [],
        platformId: null, // 平台 ,
        saleAccountIds: [], //  店铺ids ,
      },
      exportModel: {
        title: '',
        content: '',
        status: false
      },
      exportModelStatus: false,
      sortButtonList: [
        {
          sortHeader: "按出库时间",
          sortField: "despatchTime",
          sortType: "up",
          default: true,
        },
        {
          sortHeader: "按付款时间",
          sortField: "payTime",
          sortType: "up",
        },
        {
          sortHeader: "按出库单号",
          sortField: "packageCode",
          sortType: "up",
        },
      ],
      platformArr: [],
      clearAble: true,
      resetStatus: true,
      printData: [],
      columns: [
        {
          type: 'selection',
          width: 60,
          fixed: 'left',
          align: 'center'
        }, {
          title: '出库单号',
          key: 'packageCode',
          fixed: 'left',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            if (this.getPermission('wmsPicking_querySalesPickingDetail')) {
              return h('span', {}, [
                h('span', {
                  class: 'blueColor cursor underline',
                  on: {
                    click: () => {
                      // self.showPackageDetails(params.row.packageId);
                      self.showPackageDetails(params.row.packageCode, 'detail');
                    }
                  }
                }, params.row.packageCode), params.row.isImport !== 1 || h('Icon', {
                  props: {
                    type: 'md-hand',
                    size: 16
                  },
                  class: 'blueColor',
                  style: {
                    marginLeft: '3px',
                    title: '手工单'
                  }
                })
              ]);
            } else {
              return h('div', {}, [
                h('span', params.row.packageCode), params.row.isImport !== 1 || h('Icon', {
                  props: {
                    type: 'md-hand',
                    size: 16
                  },
                  class: 'blueColor',
                  style: {
                    marginLeft: '3px',
                    title: '手工单'
                  }
                })
              ]);
            }
          }
        },
        {
          title: '订单号',
          key: 'orderNum',
          align: 'center',
          width: 200
        }, {
          title: '出库单状态',
          key: 'packageProcessStatus',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            const statusInfo = this.outListStatusList.find(item => item.value == params.row.packageProcessStatus);
            if (this.$common.isEmpty(statusInfo)) return h('div', '');
            return h('div', statusInfo.label);
          }
        }, {
          title: '来源渠道' + '/' + '来源商户',
          key: 'source',
          minWidth: 140,
          align: 'center',
          render(h, params) {
            let customerNumber = params.row.customerNumber;
            let source = params.row.source;
            return h('div', {}, [h('p', source), h('p', customerNumber)]);
          }
        }, {
          title: '买家ID/姓名',
          key: 'buyerName',
          minWidth: 110,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('div', {
                style: {
                  color: '#0054A6'
                }
              }, params.row.buyerAccountId), h('div', {
                style: {
                  color: '#ff3300'
                }
              }, params.row.buyerName)
            ]);
          }
        }, {
          title: '国家/地区',
          key: 'buyerCountryCode',
          align: 'center',
          width: 100
        }, {
          title: '物流方式',
          key: 'merchantShippingMethodId',
          width: 200,
          align: 'center',
          render: (h, params) => {
            if (params.row.carrierName === null || params.row.carrierName === '') {
              return '';
            } else {
              return h('div', params.row.carrierName + ' > ' + params.row.carrierShippingMethodName);
            }
          }
        }, {
          title: '运单号/物流商单号',
          key: 'trackingNumber',
          width: 180,
          align: 'center',
          render(h, params) {
            return h('div', {}, [
              h('p', params.row.trackingNumber),
              h('p', params.row.virtualTrackingNumber),
              h('p', params.row.thirdPartyNo)
            ]);
          }
        }, {
          title: '物流商重量/物流商运费',
          key: 'carrierWeight',
          width: 180,
          align: 'center',
          render(h, params) {
            let weight = params.row.carrierWeight ? params.row.carrierWeight + ' ' + 'g' : '';
            let postage = params.row.postage ? params.row.postage + ' ' + params.row.postageCurrency : '';
            return h('div', {}, [h('p', weight), h('p', postage)]);
          }
        }, {
          title: '运费',
          key: 'postage',
          width: 140,
          align: 'center',
          render: (h, params) => {
            let estimateFreight = params.row.estimateFreight || 0;
            return h('div', [
              h('p', '预估运费' + '：' + estimateFreight + 'RMB'), h('div', {
                style: {
                  textAlign: 'center'
                }
              }, params.row.postageCurrency), h('div', {
                style: {
                  textAlign: 'center'
                }
              }, params.row.postage)
            ]);
          }
        }, {
          title: '付款时间',
          width: 160,
          align: 'center',
          key: 'payTime',
          render: (h, params) => {
            return h('span', self.$uDate.getDataToLocalTime(params.row.payTime, 'fulltime'));
          }
        }, {
          title: '出库时间',
          width: 160,
          align: 'center',
          key: 'exTime',
          render: (h, params) => {
            return h('span', self.$uDate.getDataToLocalTime(params.row.despatchTime, 'fulltime'));
          }
        }
      ], // 以下为修改包裹详情页后新增变量
      workShow: 'list',
      packageCode: '',
      outListStatusList: [
        {
          label: '创建状态',
          value: 0
        }, {
          label: '已分配未下发',
          value: 1
        }, {
          label: '已下发未分配',
          value: 2
        }, {
          label: '拣货完成',
          value: 3
        }, {
          label: ' 已打印',
          value: 4
        }, {
          label: '出库完成',
          value: 5
        }, {
          label: '等待拣货(已分配已下发)',
          value: 6
        }, {
          label: '包装完成',
          value: 7
        },
        {
          label: '已作废',
          value: 99
        }
      ],
      cancelTalg: false,
      packageIdsList: [],
      cancelConter: {},
      valueAddServicesOption: [
        {
          label: '抽真空',
          value: 0
        },
        {
          label: '换包装',
          value: 1
        },
      ], // 增值服务
      platformGroupList: [],
      storeList: [],
    };
  },
  watch: {
    pageParamsStatus(n) {
      let v = this;
      if (n) {
        v.getSearchResult();
        v.pageParamsStatus = false;
      }
    },
    workShow: function (val) {
      if (val === 'list') {
        this.$nextTick(() => {
          this.computedTableHeight();
        })
      }
    }
  },
  activated() {
    // this.startLoading();
  },
  methods: {
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.upDown = type;
      this.pageParams.orderBy = feild;
      // this.search();
    },
    openInportModal() {
      this.$refs.importTemp.model1 = true;
    },
    getSourceList() {
      let v = this;
      v.axios.get('/wms-service/erpCommon' + api.get_organizationSource).then(response => {
        if (response.data.code === 0) {
          v.sourceList = response.data.datas;
        }
      });
    },
    changeTrack() {
      if (this.trackingModel === 1) {
        this.pageParams.thirdPartyNo = null;
      } else if (this.trackingModel === 2) {
        this.pageParams.trackingNumber = null;
      }
    },
    // startLoading() {
    //   let v = this;
    //   v.$Loading.start();
    //   Promise.resolve(v.getPermission('packageInfo_query') ? v.getShopList() : v.gotoError()).then(() => {
    //     v.$Loading.finish();
    //   });
    // },
    getSearchResult() {
      let v = this;
      const defaultVal = {
        buyerAccountId: null,
        buyerCountryCodeList: [],
        buyerName: null,
        cargoOwnerId: null,
        cargoOwnerType: null,
        customerNumber: null,
        endDespatchTime: null,
        getLabelStatus: null,
        hasCarrierWeight: -1,
        hasPostage: -1,
        hasThirdPartyNo: -1,
        hasTrackingNumber: -1,
        mobileImieCode: null,
        orderBy: 'despatchTime',
        orderNo: null,
        pacakgeIsImport: -1,
        packageCode: null,
        packageProcessStatus: null,
        payEndTime: null,
        payStartTime: null,
        sku: null,
        source: null,
        startDespatchTime: null,
        status: 0,
        thirdPartyNo: null,
        thirdPartyNoList: [],
        trackingNumber: null,
        trackingNumberList: [],
        waybillNo: null,
        webstoreItemId: null,
        packageCodeList: [],
        orderNoList: [],
        // valueAddedServiceList: [],
        merchantCarrierIdList: [],
        merchantShippingMethodIdList: [],
        shippingList: [],
        platformId: null, // 平台 ,
        saleAccountIds: []
      };
      if (v.pageParams.trackingNumber) {
        let list = v.pageParams.trackingNumber.split(',');
        v.pageParams.trackingNumberList = list;
      } else {
        v.pageParams.trackingNumberList = [];
      }
      if (v.pageParams.thirdPartyNo) {
        let list = v.pageParams.thirdPartyNo.split(',');
        v.pageParams.thirdPartyNoList = list;
      } else {
        v.pageParams.thirdPartyNoList = [];
      }
      if (v.pageParams.packageCode) {
        v.pageParams.packageCodeList = v.sepCommasFn(v.pageParams.packageCode)
      } else {
        v.pageParams.packageCode = null;
        v.pageParams.packageCodeList = [];
      }
      if (v.pageParams.orderNo) {
        v.pageParams.orderNoList = v.sepCommasFn(v.pageParams.orderNo)
      } else {
        v.pageParams.orderNo = null;
        v.pageParams.orderNoList = [];
      }
      let params = JSON.parse(JSON.stringify(v.pageParams));

      if (v.pageParams.cargoOwnerId) {
        if (v.pageParams.cargoOwnerId === '_NO_CARGO_OWNER') {
          // 无货主
          params.cargoOwnerType = 0;
          params.cargoOwnerId = null;
        } else {
          params.cargoOwnerType = 1;
          params.cargoOwnerId = v.pageParams.cargoOwnerId;
        }
      } else {
        params.cargoOwnerType = null;
        params.cargoOwnerId = null;
      }
      const isDefault = Object.keys(defaultVal).filter(key => {
        if (this.$common.isArray(v.pageParams[key]) && this.$common.isEmpty(v.pageParams[key])) {
          return true;
        }
        return defaultVal[key] === v.pageParams[key];
      })

      if (isDefault.length === Object.keys(defaultVal).length) {
        this.$Message.error('查询条件至少选择一项！');
        v.printData = [];
        v.loadingFalse();
        return;
      }
      // 处理下拉框的全部
      let paramsNull = ['hasTrackingNumber', 'hasThirdPartyNo', 'pacakgeIsImport'];
      paramsNull.forEach(k => {
        if (k in params) {
          params[k] = params[k] === -1 ? null : params[k];
        }
      })
      delete params.shippingList;

      // params.businessDeptId = this.securityUser.businessDeptId;
      // params.businessDeptIds = this.securityUser.businessDeptIds;
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(api.get_packageToRetrieve, JSON.stringify(params)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas.list;
          let merchantShippingMethodIdPos = [];
          if (data !== null && data.length > 0) {
            data.forEach((n, i) => {
              n.carrierName = null;
              n.carrierShippingMethodName = null;
              n.index = i + 1;
              merchantShippingMethodIdPos.push(n.merchantShippingMethodId);
            });
            Promise.resolve(v.axios.post(api.queryCarrierShippingName, JSON.stringify(merchantShippingMethodIdPos)).then(response => {
              if (response.data.code === 0) {
                if (response.data.datas.length > 0) {
                  response.data.datas.forEach((n, i) => {
                    data.forEach((m, t) => {
                      if (m.merchantShippingMethodId === n.shippingMethodId) {
                        m.carrierName = n.carrierName;
                        m.carrierShippingMethodName = n.carrierShippingMethodName;
                      }
                    });
                  });
                }
              }
            })).then(() => {
              // 拼接订单号字端
              data.forEach(itema => {
                itema.orderNum = itema.packageOrderBoList[0].accountCode + '-' + itema.packageOrderBoList[0].salesRecordNumber
              })
              v.printData = data;
              v.$nextTick(function () {
                v.total = Number(response.data.datas.total);
                v.totalPage = Number(response.data.datas.pages);
              });
            }).finally(() => {
              v.TableLoading = false;
              v.SearchDisabled = false;
            })
          } else {
            v.printData = [];
            v.pageParamsStatus = false;
            v.$nextTick(function () {
              v.total = 0;
              v.totalPage = 0;
            });
            v.TableLoading = false;
            v.SearchDisabled = false;
          }
        } else {
          v.printData = [];
          v.pageParamsStatus = false;
          v.$nextTick(function () {
            v.total = 0;
            v.totalPage = 0;
          });
          v.TableLoading = false;
          v.SearchDisabled = false;
        }
        v.loadingFalse();
      }).catch(() => {
        v.TableLoading = false;
        v.SearchDisabled = false;
      })
    },
    reset() {
      let v = this;
      v.$refs['pageParams'].resetFields();
      // v.shippingMethodModel = [];
      v.payTimeArr = [];
      v.resetDate();
      v.resetDate1();
      v.trackingModel = 1;
      v.pageParams.trackingNumber = null;
      v.pageParams.thirdPartyNo = null;
      v.pageParams.hasTrackingNumber = -1;
      v.pageParams.hasThirdPartyNo = -1;
      // v.pageParams.merchantCarrierId = null;
      // v.pageParams.merchantShippingMethodId = null;
      v.pageParams.hasCarrierWeight = -1;
      v.pageParams.hasPostage = -1;
      v.pageParams.pacakgeIsImport = -1;
      v.pageParams.packageCode = null;
    },
    search() {
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    // changeShippingMethod(value, data) {
    //   let v = this;
    //   if (value.length === 0) {
    //     v.pageParams.merchantCarrierId = null;
    //     v.pageParams.merchantShippingMethodId = null;
    //   } else if (value.length === 1) {
    //     v.pageParams.merchantCarrierId = value[0];
    //     v.pageParams.merchantShippingMethodId = null;
    //   } else if (value.length === 2) {
    //     v.pageParams.merchantCarrierId = value[0];
    //     v.pageParams.merchantShippingMethodId = value[1][0];
    //   }
    // },
    resetDate() {
      let v = this;
      v.pageParams.startDespatchTime = null;
      v.pageParams.endDespatchTime = null;
    },
    resetDate1() {
      let v = this;
      v.pageParams.payStartTime = null;
      v.pageParams.payEndTime = null;
    },
    getDateValue(value) {
      // 获取日期返回值
      var v = this;
      if (value.length === 0 || !value[0]) {
        v.resetDate();
      } else {
        if (value[0] !== '') {
          v.pageParams.startDespatchTime = v.$uDate.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
          v.pageParams.endDespatchTime = v.$uDate.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
        }
      }
    },
    getDateValue1(value) {
      // 获取日期返回值
      var v = this;
      if (value[0] !== '') {
        v.pageParams.payStartTime = v.$uDate.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
        v.pageParams.payEndTime = v.$uDate.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
      }
    },
    exportDataHasCondition() {
      // 导出选中
      this.exportData('all');
    },
    exportData(type) {
      if (this.printData && this.printData.length === 0) {
        this.$Message.error('无数据');
        return;
      }
      if ((this.packageIds.length === 0 || this.packageIds === null) && type !== 'all') {
        this.$Message.error('请选择包裹');
        return false;
      }
      this.exportModelStatus = true;
      if (type === 'all') {
        this.exportModel.title = '导出（所有结果集）';
        this.exportModel.content = '系统将导出所有数据，请稍后在“导出查看”中查询导出结果';
      } else {
        this.exportModel.title = '导出选中';
        this.exportModel.content = '系统将您勾选的包裹导出到excel';
      }
      this.$nextTick(function () {
        this.exportModel.status = true;
      });
    }, // 取消分配选中
    cancelAllocationBtn(type) {
      if (type === 'all') {
      } else {
        let ids = [];
        if (this.packageIdsList.length > 0) {
          // 只有出库单状态为“已分配未下发”、“等待拣货(已分配已下发)”的出库单能取消分配（不包括已经生成拣货单的）
          this.packageIdsList.map((item) => {
            if (item.packageProcessStatus === 1 || item.packageProcessStatus === 6) {
              ids.push(item.packageCode);
            }
          });
          let obj = {
            packageCodeList: ids,
            warehouseId: this.getWarehouseId()
          };
          this.axios.post(api.post_cancelPackageDistribution, JSON.stringify(obj)).then(response => {
            if (response.data.code === 0) {
              this.cancelConter = response.data.datas;
              this.pageParamsStatus = true;
              this.packageIdsList = [];
              this.cancelTalg = true;
            }
          });
        } else {
          this.$Message.error('请选择包裹');
          return false;
        }
      }
    }, // 批量取消分配选中
    cancelAllocationAll() {
      this.cancelAllocationBtn('all');
    },
    exportExcel(type) {
      // let v = this;
      let obj = {
        packageIds: this.packageIds,
        timeZone: this.$common.getDefaultTimezoom(),
        warehouseId: this.getWarehouseId() // $store.state.warehouseId
      };
      if (this.exportModel.title === '导出（所有结果集）') {
        obj = this.$common.copy(Object.assign(obj, this.pageParams));
        delete obj.shippingList;
        obj.packageIds = [];
        if (this.pageParams.cargoOwnerId) {
          if (this.pageParams.cargoOwnerId === '_NO_CARGO_OWNER') {
            // 无货主
            obj.cargoOwnerType = 0;
            obj.cargoOwnerId = null;
          } else {
            obj.cargoOwnerType = 1;
            obj.cargoOwnerId = this.pageParams.cargoOwnerId;
          }
        } else {
          obj.cargoOwnerType = null;
          obj.cargoOwnerId = null;
        }
      }
      obj.pacakgeIsImport = obj.pacakgeIsImport === -1 ? null : obj.pacakgeIsImport;// 全部需要传null

      // let newTab = window.open('about:blank');
      this.axios.post(api.export_package, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          // let erpCommon = v.$store.state.erpConfig;
          // newTab.location.href = erpCommon.filenodeViewTargetUrl + response.data.datas;
          // setTimeout(function () {
          //   newTab.close();
          // }, 1000);
        }
      });
    },
    getSelectValue(value) {
      // table获取所选值
      let v = this;
      v.packageIdsList = value;
      let pos = [];
      Promise.resolve(value.forEach((n, i) => {
        pos.push(n.packageId);
      })).then(() => {
        v.packageIds = pos;
      });
    }, // showPackageDetails (pid) {
    //   let v = this;
    //   v.packageId = pid;
    //   v.packageDetailsStatus = true;
    //   let date = new Date().getTime();
    //   v.$nextTick(function () {
    //     v.packageModel = true;
    //     v.timestamp = date;
    //   });
    // }
    showPackageDetails(packageCode, detail) {
      this.packageCode = packageCode;
      this.workShow = detail;
    },
    outListStatusChange(val) {
      // 出库单状态选择
      this.sltChangeProcess(val, 'packageProcessStatus');
    },
    sltChangeProcess(val, string) {
      // 多选模式下全部和选项的切换
      if (val.length > 1) {
        if (val[val.length - 1] === '*') {
          this.searchParams[string] = ['*'];
        } else {
          if (val.indexOf('*') > -1) {
            val.splice(val.indexOf('*'), 1);
            this.searchParams[string] = val;
          }
        }
      }
    },
    shippingChange(data) {
      this.pageParams.merchantCarrierIdList = data.carrierId;
      this.pageParams.merchantShippingMethodIdList = data.shippingMethodId;
    },
    getPlatformGroup() { // 查看已开启平台
      this.axios.get(api.get_queryByStatus + '?status=' + 1).then(response => {
        if (response && response.data.code === 0) {
          this.platformGroupList = (response.data.datas || []);
        }
      })
    },
    platFormChange(value) {
      this.storeList = [];
      if (!value) return;
      this.getStoreList(value);
    },
    getStoreList(platformId) {
      this.axios.post(api.queryUserSaleAccounts, [platformId]).then(({ data }) => {
        if (data.code !== 0) return;
        this.storeList = data.datas || [];
      })
    },
  },
  // computed: {
  //   securityUser() {
  //     let authUserInfo = this.$store.getters["authUserInfo"] || {};
  //     return authUserInfo.securityUser || {};
  //   },
  // },
  created() {
    let v = this;
    // v.startLoading();
    // v.getPlatform(); // 查询所有可用平台
    // v.getSearchResult(); // 默认不查询
    // v.showShippingData(true); // 查询物流方式下拉数据
    v.getSourceList();
    v.getPlatformGroup();
    v.pageParamsPrototype = v.deepCopy(v.pageParams);
  },
  mounted() {
    let v = this;
    setTimeout(v.getCountrys(), 2000); // 获取国家区域列表
  }
};
</script>
<style lang="less" scoped>
/deep/.ivu-form-item-label-no-padding .ivu-form-item-label {
  padding: 0;
}

.searchPackage {
  height: 100%;
}
</style>
