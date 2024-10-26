<template>
  <div v-if="mtbStatus">
    <div class="messageToBeProcessedFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth" class="fixwidthForm">
              <dyt-filter>
                <Form-item label="搜索字符" prop="saleAccountIds">
                  <dyt-input-tag type="textarea" :limit="1" :string="true" v-model="pageParams.searchValue" placeholder="可输入订单号、买家ID、买家姓名、SKU、item ID,多个逗号隔开" />
                </Form-item>
                <Form-item label="标签" prop="tagIdList">
                  <dyt-select v-model="pageParams.tagIdList" @on-change="tagChange" :max-tag-count="1" multiple placeholder="请选择或搜索标签">
                    <Option v-for="item in tagsList" :key="item.tagId" :value="item.tagId" :v="item.tagId">{{ item.tagName }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="作废状态">
                  <dyt-select v-model="pageParams.invalid">
                    <Option v-for="(item,index) in invalidStatus" :key="index" :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="创建时间">
                  <Date-picker transfer style="width:100%" type="datetimerange" @on-clear="resetDate" @on-change="getDateValue" :clearable="clearAble" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end" placeholder="选择日期" :value="payTimeArr"></Date-picker>
                </Form-item>
                <Form-item label="付款状态" prop="tagIdList">
                  <dyt-select v-model="pageParams.pay" @on-change="tagChange" filterable placeholder="请选择或搜索标签">
                    <Option v-for="(item,index) in payStatus" :key="index" :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="发货状态" prop="deliveryStatus">
                  <dyt-select v-model="pageParams.deliveryStatus" placeholder="请选择发货状态">
                    <Option v-for="item in deliveryStatusList" :key="item.id" :value="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="商品事业部" prop="businessDeptIdList" v-if="isGetBusiness">
                  <dyt-select
                    v-model="pageParams.businessDeptIdList"
                    :max-tag-count="1"
                    multiple
                    placeholder="请选择商品事业部"
                  >
                    <Option v-for="(item, index) in businessDeptDataList" :value='item.id' :key="`business-${index}`">{{item.name}}</Option>
                  </dyt-select>
                </Form-item>
                <div slot="operation" v-if="isAdmin || getPermission('orderInfo_queryHandOrder')">
                  <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询 </Button>
                  <Button @click="reset" style="margin-left: 10px;" v-once icon="md-refresh">重置 </Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>

    <div class="tableControl" style="display: flex;">
      <div style="flex: 100;">
        <Button type="primary" v-if="getPermission('orderInfo_createHandOrder')" @click="addManualOrder" class="iconbuttons">添加订单</Button>
        <Dropdown class="tcDropDown" v-if="getPermission('orderTag_insert_batch') || getPermission('orderTag_clear')">
          <Poptip v-model="setTagListStatus" placement="bottom" :transfer="true">
            <Button icon="md-pricetag" type="primary">
              打标签
              <Icon type="md-arrow-dropdown" />
            </Button>
            <div slot="content">
              <order-label-tag v-model="tagIdList" :tags-list="tagsList"/>
              <div class="tagsSelectFooter">
                <Button size="small" @click="setTag" :disabled="!getPermission('orderTag_insert_batch')">打标签 </Button>
                <Button size="small" @click="dropOrderTag" :disabled="!getPermission('orderTag_clear')">清空标签 </Button>
              </div>
            </div>
          </Poptip>
        </Dropdown>
        <Button class="ml10" type="primary" v-if="getPermission('orderInfo_excelImportHandOrder')" @click="$refs.importModal.modal = true">导入</Button>
      </div>
      <div class="dataSort grayBg" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;" v-if="getPermission('orderInfo_queryHandOrder')">
        <span>排序：</span>
        <Button-group>
          <template v-for="(item, index) in buttonGroupModel">
            <Button v-if="item.selected" type="primary" @click="modifyTheSort(index,item.status)" :key="index">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
            <Button v-if="!item.selected" @click="modifyTheSort(index,item.status)" :key="index">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
          </template>
        </Button-group>
      </div>
    </div>
    <div class="orderTable normalTop">
      <keep-alive>
        <Table highlight-row border :loading="tableLoading" :height="tableHeight" :columns="orderColumn" :data="orderData" @on-selection-change="getSelectValue"></Table>
      </keep-alive>
      <div class="table-page flexBox">
        <keep-alive>
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
        </keep-alive>
      </div>
    </div>
    <keep-alive>
      <sliderModal v-model="orderDetails" :spinShow="spinShow" :styles="{}" class="slider-model" v-if="orderDetailsBegin">
        <orderDetails
          :orderDetailsId="orderDetailsId"
          :orderNo="orderNo"
          @reloadTag="reloadTag"
          @spinLoading="spinLoading"
          @resetSpinShow="resetSpinShow"
          @updateList="getList"
          :orderType="orderType"
          :orderTagList="orderTagList"
          :timestamp="timestamp"
          :webstoreItemSite="webstoreItemSite"
          :moal-visible.sync="orderDetails"
        />
      </sliderModal>
    </keep-alive>
    <keep-alive>
      <Modal v-model="productModal" :mask-closable="false" v-if="productStatus" :width="600">
        <div class="orderDetailsProductItem">
          <Row v-for="(item, index) in productDetails" :key="index" class="normalTop">
            <Col :span="2">
            <div class="orderDetailsProductItemPic">
              <img :src="item.pictureUrl" :alt="item.title">
            </div>
            </Col>
            <Col :span="17" :offset="1">
            <div class="odpidProductID">
              <span class="productID">{{ item.webstoreItemId }}</span>
              <span class="productHaveATitle">SKU: <em>{{ item.webstoreSku }}</em></span> <span class="productHaveATitle" v-if="inGroup ==='ebay'">物品所在地: <em>{{ item.location }}</em></span>
              <span class="productLogsticService">物流服务：<em>{{ item.buyerShippingMethod }}</em></span>
            </div>
            <div class="odpidProductDetails">
              {{ item.title }}
            </div>
            <div class="odpidProductParams" v-if="item.variations !== null">
              <span class="productHaveATitle" v-if="item.variations.indexOf('color') >=0 && item.variations.indexOf(';') >0 ">Color:<em>{{ item.variations.split(': ')[1].split(';')[0] }} </em></span>
              <span class="productHaveATitle" v-if="item.variations.indexOf('color') >=0 && item.variations.indexOf(';') < 0 ">Color:<em>{{ item.variations.split(': ')[1] }} </em></span>
              <span class="productHaveATitle" v-if="item.variations.toLowerCase().indexOf('pack of') >=0">Pack of:<em>{{ item.variations.split(';')[1].split(': ')[1] }}</em></span>
            </div>
            </Col>
            <Col :span="2" :offset="2">
            X {{ item.quantity }}
            </Col>
          </Row>
        </div>
        <div slot="footer">
          <Button @click="closeModal">关闭</Button>
        </div>
      </Modal>
    </keep-alive>
    <!-- 导出 -->
    <keep-alive>
      <Modal v-model="exportModel.status" :mask-closable="false" width="400" v-if="exportModelStatus" @on-ok="exportExcel">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">{{ exportModel.title }}</div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              <Row>
                <Col :span="1">
                <Icon type="md-information-circle" color="#2b85e4" size="44"></Icon>
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
    </keep-alive>
    <operation-manual ref="manualOrder" @getList="search"></operation-manual>
    <cancelDelivery ref="cancelDelivery" :orderIdList.sync="orderIdList"></cancelDelivery>
    <Modal v-model="model8" :mask-closable="false" @on-ok="setMarkPayment">
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-head">
          <div class="ivu-modal-confirm-head-title">标记为已付款</div>
        </div>
        <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
          <div class="normalTop">
            <Row>
              <Col :span="1">
              <Icon type="md-information-circle" color="#2b85e4" size="44"></Icon>
              </Col>
              <Col :span="21" :offset="2">
              <p>标记为已付款，订单将会继续正常订单的流程，最终到发货。</p>
              </Col>
            </Row>
            <Form ref="setMarkModel" :model="setMarkModel" :label-width="100" class="noramlTop setAllMarkRead">
              <Form-item label="付款方式" prop="paymentMethodName">
                <Input v-model.trim="setMarkModel.paymentMethodName" value=""></Input>
              </Form-item>
              <Row>
                <Col :span="12">
                <Form-item label="付款方交易号" prop="webstoreTransactionId">
                  <Input v-model.trim="setMarkModel.webstoreTransactionId" value=""></Input>
                </Form-item>
                </Col>
                <Col :span="12">
                <Form-item label="成交费比例：" prop="transactionPriceRatio">
                  <InputNumber :min="0" v-model="setMarkModel.transactionPriceRatio" :formatter="value => `${value}%`" :parser="value => value.replace('%', '')"></InputNumber>
                </Form-item>
                </Col>
              </Row>
              <Form-item label="备注" prop="paymentNote">
                <Input v-model.trim="setMarkModel.paymentNote" type="textarea" :rows="4"></Input>
              </Form-item>
            </Form>
          </div>
        </div>
      </div>
    </Modal>
    <!--导入-->
    <importModal
      ref="importModal"
      :importModal="importModal"
      :uploadData="uploadData"
      :action="import_privateBlackList"
      :hiddenStore="true"
      title="导入"
      name="files"
      :loadTemplateLocalApi="downBlackTemp"
      :service="'/order-service'"
      :other-data="importModalOtherData"
      @refreshTable="getList"
    />
  </div>
</template>
<script>
import api from '@/api/api';
import orderDetails from '@/views/commonOrder/components/commonOrder/orderDetails';
import cancelDelivery from '@/components/common/order/cancelOrder';
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import OperationManual from '@/components/common/operationManual';
import importModal from '@/components/common/importModal';

export default {
  mixins: [Mixin, orderSys],
  components: {
    OperationManual,
    orderDetails,
    cancelDelivery,
    importModal
  },
  data () {
    var self = this;
    return {
      uploadData: {
        platformId: self.inGroup
      },
      importModal: false,
      import_privateBlackList: api.export_excelImportHandOrder,
      downBlackTemp: '/order-service/template/handOrder.xlsx',
      model8: false,
      orderIdList: [],
      businessDeptDataList: [],
      payStatus: [
        {
          label: '全部',
          value: -1
        }, {
          label: '未付款',
          value: 0
        }, {
          label: '已付款',
          value: 1
        }
      ],
      invalidStatus: [
        {
          label: '全部',
          value: -1
        }, {
          label: '未作废',
          value: 0
        }, {
          label: '已作废',
          value: 1
        }
      ],
      buttonGroupModel: [
        {
          type: 'createTime',
          selected: true,
          status: true, // true up false down
          title: '按创建时间'
        }, {
          type: 'payStatus',
          selected: false,
          status: true, // true up false down
          title: '按付款状态'
        }

      ],
      tagsListStatus: false,
      mtbStatus: true,
      orderDetails: false,
      orderDetailsBegin: false,
      orderDetailsId: null,
      orderNo: null,
      timestamp: null,
      orderTagList: null,
      webstoreItemSite: null,
      orderType: 'cancel',
      pageParams: {
        pageNum: 1,
        pageSize: 50,
        platformId: [this.inGroup],
        businessDeptIdList: [],
        createEndTime: null,
        createStartTime: null,
        deliveryStatus: 88,
        orderBy: 'createTime',
        pay: -1, // 是否已付款 0未付款 1已付款 -1全部 ,
        invalid: -1, // 是否已作废 0未作废 1已作废  ,
        searchValue: null,
        upDown: 'up'

      },
      exportModel: {
        title: '',
        content: '',
        status: false
      },
      exportModelStatus: false,
      formValidate: {
        country: []
      },
      payTimeArr2: [],
      payTimeArr: [],
      markCountryModal: [],
      shopListModal: [],
      markTagsModal: [],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      plateformGroup: [
        {
          selected: true,
          platformId: null,
          title: '全部'
        }, {
          selected: false,
          platformId: 'ebay',
          title: 'ebay'
        }, {
          selected: false,
          platformId: 'alixpress',
          title: 'Aliexpress'
        }, {
          selected: false,
          platformId: 'wish_api',
          title: 'wish'
        }, {
          selected: false,
          platformId: 'amazon',
          title: 'Amazon'
        }
      ],
      tagsList: [],
      orderColumn: [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          fixed: 'left'
        }, {
          title: '订单号',
          key: 'salesRecordNumber',
          width: 140,
          align: 'center',
          fixed: 'left',
          render: (h, params) => {
            return h('div', {
              style: {
                color: self.getPermission('orderInfo_detail') ? '#0054A6' : '#515a6e',
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  if (self.getPermission('orderInfo_detail')) {
                    self.show(params.row.orderId);
                    self.orderNo = params.row.accountCode + '-' + params.row.salesRecordNumber;
                    self.orderTagList = params.row.orderTagList;
                    self.webstoreItemSite = params.row.webstoreItemSite;
                  }
                }
              }
            }, params.row.accountCode + '-' + params.row.salesRecordNumber);
          }
        }, {
          title: '买家ID',
          key: 'buyerName',
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('div', {
                style: {
                  color: '#0054A6'
                }
              }, params.row.buyerAccountId)/*,
               h('div', {
               style: {
               color: '#ff3300'
               }
               }, params.row.buyerName) */
            ]);
          }
        }, {
          title: '目的地',
          key: 'buyerCountryCode',
          align: 'center',
          minWidth: 120
        }, {
          title: '订单金额', // 订单金额
          key: 'totalPrice',
          minWidth: 120,
          align: 'center',
          render (h, params) {
            let price = Number(params.row.totalPrice);
            if (price !== 0) {
              price = price.toFixed(3);
            }
            return h('div', {}, [
              h('p', price), params.row.totalPriceCurrency && h('p', {}, '(' + params.row.totalPriceCurrency + ')')
            ]);
          }
        }, {
          title: '付款状态',
          key: 'invalidReason',
          minWidth: 150,
          align: 'center',
          render: (h, params) => {
            let payStatus = params.row.payTime !== null ? '已付款' : '未付款';
            return h('p', payStatus);
          }
        }, {
          title: '发货状态',
          key: 'deliveryStatus',
          align: 'center',
          minWidth: 200,
          render (h, params) {
            let text = '';
            let deliveryStatus = params.row.deliveryStatus + '';
            if (deliveryStatus === '1') {
              text = '已出库';
            } else if (deliveryStatus === '2') {
              text = '已打印';
            } else if (deliveryStatus === '3') {
              text = '已下发物流(待打印)';
            } else if (deliveryStatus === '4') {
              text = '已指定物流方式(未下发物流)';
            } else if (deliveryStatus === '5') {
              text = '未指定物流方式';
            }
            return h('span', text);
          }
        }, {
          title: '创建人/创建时间',
          key: 'createdBy',
          align: 'center',
          width: 160,
          render (h, params) {
            return h('div', {}, [
              [
                h('p', self.getUserName(params.row.createdBy) || params.row.createdBy),
                h('p', self.getDataToLocalTime(params.row.createdTime, 'fulltime'))
              ]
            ]);
          }
        }, {
          title: '标签',
          key: 'orderTags',
          align: 'center',
          minWidth: 140,
          render: (h, params) => {
            let orderTagList = params.row.orderTags;
            let pos = [];
            if (orderTagList) {
              orderTagList.forEach((n, i) => {
                let item = h('div', [
                  h('Icon', {
                    props: {
                      type: 'pricetag',
                      color: '#f00'
                    },
                    style: {
                      marginRight: '5px'
                    }
                  }), h('span', n.tagName)
                ]);
                pos.push(item);
              });
              return h('div', pos);
            }
          }
        }, {
          title: '操作',
          key: 'operate',
          fixed: 'right',
          width: 260,
          align: 'center',
          render: (h, params) => {
            if (params.row !== undefined) {
              return h('div', [
                params.row.payTime !== null || !(params.row.isInvalid === '0') || !self.getPermission('orderInfo_markOrderPayment') || h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      self.setMarkModel = {
                        orderIdList: [params.row.orderId],
                        webstoreTransactionId: '',
                        paymentMethodName: '',
                        paymentNote: '',
                        transactionPriceRatio: 0
                      };
                      self.model8 = true;
                    }
                  }
                }, '标记已付款'), !self.getPermission('orderInfo_detail') || !(params.row.isInvalid === '0') || h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      self.$refs['cancelDelivery'].cancelDelivery('single', params.row);
                    }
                  }
                }, '取消订单'), !self.getPermission('orderInfo_detail') || h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      self.show(params.row.orderId);
                      self.orderNo = params.row.accountCode + '-' + params.row.salesRecordNumber;
                      self.orderTagList = params.row.orderTagList;
                      self.webstoreItemSite = params.row.webstoreItemSite;
                    }
                  }
                }, '订单详情')
              ]);
            }
          }
        }
      ],
      singleOrder: '',
      orderData: [],
      setTagListStatus: false,
      clearAble: true,
      resetStatus: true,
      productStatus: false, // 点击产品列表详情状态控制
      productModal: false,
      setMarkModel: {
        orderIdList: [],
        webstoreTransactionId: '',
        paymentMethodName: '',
        paymentNote: '',
        transactionPriceRatio: 0
      },
      productDetails: '' // modal产品数据
    };
  },
  watch: {
    pageParamsStatus (n) {
      var v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    }
  },
  computed: {
    tableHeight () {
      return this.getTableHeight(290);
    },
    // 其他数据
    importModalOtherData () {
      return {
        platformId: this.inGroup,
        shopList: this.shopList || []
      }
    },
    // 是否展示商品事业部
    isGetBusiness () {
      return ['otto'].includes(this.inGroup);
    }
  },
  created () {
    this.getBusinessDeptData(); // 获取事业部
  },
  methods: {
    setMarkPayment () {
      let v = this;
      v.axios.put(api.mark_paid, JSON.stringify(v.setMarkModel)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data.length > 0) {
            data.forEach((n, i) => {
              v.$Message.error({
                content: '销售编号' + ': ' + n.salesRecordNumber + n.error,
                duration: 5
              });
            });
          } else {
            v.$Message.success('标记为已付款成功');
            v.$parent.updateStatus = true;
          }
          v.getList();
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    search () {
      this.curPage = 1;
      this.pageParams.pageNum = 1;
      this.pageParams.pageSize = 50;
      this.getList();
    },
    addManualOrder () {
      this.$refs.manualOrder.$refs.formInline.resetFields();
      this.$refs.manualOrder.reset();
      this.$refs.manualOrder.model = true;
    },
    startLoading () {
      let v = this;
      v.$Loading.start();
      // Promise.resolve(v.getPermission('orderInfo_queryHandOrder') ? v.getList() : v.gotoError()).then(() => {
      // 默认一进来不查询
      Promise.resolve(v.getPermission('orderInfo_queryHandOrder') ? '' : v.gotoError()).then(() => {
        v.$Loading.finish();
        v.getShopList();
        v.getOrderListTag();// 获取标签列表
      });
    },
    // 获取事业部
    getBusinessDeptData () {
      if (!this.isGetBusiness) return;
      this.axios.get(api.get_businessDeptList).then(res => {
        if (res && res.data) {
          this.businessDeptDataList = res.data.data || [];
        }
      })
    },
    getParams (type) {
      let params = this.$common.copy(this.pageParams);
      if (!this.isGetBusiness) {
        delete params.businessDeptIdList;
      }
      if (!type) {
        if (params.deliveryStatus === 88) {
          params.deliveryStatus = null;
        }
        if (params.pay === -1) {
          params.pay = null;
        }
        if (params.invalid === -1) {
          params.invalid = null;
        }
      }
      return params
    },
    getList () {
      let v = this;
      v.orderData = [];
      if (!v.getPermission('orderInfo_queryHandOrder')) return;
      let params = this.getParams();
      v.loadingTrue();
      v.axios.post(api.get_queryHandOrder, params).then(response => {
        v.loadingFalse();
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data.list) {
            let pos = [];
            let saleAccountIdPos = [];
            let orderIdPos = [];
            let data = response.data.datas;
            if (data.list !== null) {
              data.list.forEach((n, i) => {
                pos.push({
                  ...n
                });
                saleAccountIdPos.push(n.saleAccountId);
                orderIdPos.push(n.orderId);
              });
              if (saleAccountIdPos.length > 0) { // 匹配订单号
                async function getData () {
                  const Arr = await v.getAccountCode(pos, saleAccountIdPos);
                  v.orderData = Arr;
                }

                getData();
              }
              v.$nextTick(function () {
                v.total = Number(data.total);
                v.totalPage = Number(data.pages);
              });
            }
          }
        }
      }).catch(() => {
        v.loadingFalse();
      });
    },
    reset () {
      let v = this;
      v.resetDate();
      v.payTimeArr2 = [];
      v.payTimeArr = [];
      v.$refs['pageParams'].resetFields();
    },
    show (params) {
      let v = this;
      v.orderDetailsBegin = true;
      v.orderDetailsId = params;
      let date = new Date().getTime();
      v.$nextTick(function () {
        v.orderDetails = true;
        v.timestamp = date;
      });
    },
    getPlatformData (index, id) {
      var v = this;
      v.pageParams.platformId = id;
      v.pageParamsStatus = true;// 更新数据
      v.curPage = 1;
      v.pageParams.pageNum = 1;
      v.plateformGroup.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    tagChange (value) {
      let v = this;
      if (value.indexOf('null') >= 0) {
        v.pageParams.tagIdList = null;
      } else {
        v.pageParams.tagIdList = value;
      }
    },
    setAllMarkReadConfirm () {
      var v = this;
      v.$Modal.confirm({
        title: '全局标记为已读',
        render: h => {
          return h('div', {
            style: {
              marginTop: '10px'
            }
          }, [
            h('Row', [
              h('Col', {
                props: {
                  span: 1
                }
              }, [
                h('Icon', {
                  props: {
                    type: 'information-circled',
                    color: '#2b85e4'
                  },
                  style: {
                    fontSize: '36px'
                  }
                })
              ]), h('Col', {
                props: {
                  span: 21,
                  offset: 2
                }
              }, [
                h('p', '全局标记为已读，系统将会把所有符合您以下选择的条件的订单的留言标记为已读。')
              ])
            ]), h('Form', {
              props: {
                labelWidth: 60
              },
              style: {
                marginTop: '10px'
              },
              class: 'setAllMarkRead'

            }, [
              h('Form-item', {
                props: {
                  label: '店铺'
                }
              }, [
                h('Select', {
                  props: {
                    placeholder: '请选择店铺',
                    vModel: v.shopListModal,
                    multiple: 'multiple',
                    filterable: 'filterable',
                    transfer: true,
                    value: []
                  }
                }, v.getShopListOption(h))
              ]), h('Form-item', {
                props: {
                  label: '国家/地区'
                }
              }, [
                h('Select', {
                  props: {
                    placeholder: '请选择国家/地区',
                    vModel: v.markCountryModal,
                    transfer: true,
                    multiple: 'multiple',
                    filterable: 'filterable',
                    value: []
                  }
                }, v.getMarkCountryList(h))
              ]), h('Form-item', {
                props: {
                  label: '标签'
                }
              }, [
                h('Select', {
                  props: {
                    placeholder: '请选择标签',
                    vModel: v.markTagsModal,
                    transfer: true,
                    multiple: 'multiple',
                    filterable: 'filterable',
                    value: []
                  }
                }, v.getMarkTagsList(h))
              ])
            ])
          ]);
        }
      });
    },
    getMarkTagsList (h) {
      let pos = [];
      this.tagsList.forEach((n, i) => {
        pos.push(h('Option', {
          props: {
            value: n.tagId
          }
        }, n.tagName));
      });
      return pos;
    },
    getMarkCountryList (h) {
      let pos = [];
      this.formValidate.country.forEach((n, i) => {
        pos.push(h('Option', {
          props: {
            value: n.twoCode,
            key: n
          }
        }, n.cnName));
      });
      return pos;
    },
    getShopListOption (h) {
      let pos = [];
      this.shopList.forEach((n, i) => {
        pos.push(h('Option', {
          props: {
            value: n
          }
        }, n));
      });
      return pos;
    },
    setAllMarkRead () {
      var v = this;
      v.axios.put(api.set_allMarkRead).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    exportOrderHasCondition () { // 导出选中
      this.exportOrder('all');
    },
    exportOrder (type) {
      let v = this;
      if ((v.orderIdList.length === 0 || v.orderIdList === null) && type !== 'all') {
        v.$Message.error('请选择订单');
        return false;
      }
      v.exportModelStatus = true;
      if (type === 'all') {
        v.exportModel.title = '导出（所有结果集）';
        v.exportModel.content = '导出所有结果集，系统将符合您当前查询选择的所有订单导出到excel，系统限制一次性只能导出不超过10000单。';
      } else {
        v.exportModel.title = '导出';
        v.exportModel.content = '已取消订单导出';
      }
      v.$nextTick(function () {
        v.exportModel.status = true;
      });
    },
    exportExcel (type) {
      let v = this;
      let obj = {
        orderIdList: v.orderIdList,
        timeZone: this.$common.getDefaultTimezoom(),
        orderBy: v.pageParams.orderBy,
        upDown: v.pageParams.upDown
      };
      if (v.exportModel.title === '导出（所有结果集）') {
        obj = Object.assign(obj, this.getParams(true));
      }
      // let newTab = window.open('about:blank');
      v.axios.post(api.export_cancelOrder, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.orderIdList = [];
          v.pageParamsStatus = true;
          let data = response.data.datas;
          v.$Message.success({
            content: '已生成导入/导出任务，任务编号' + '：' + data,
            duration: 10,
            closable: true
          });
          // let erpCommon = v.$store.state.erpConfig;
          // newTab.location.href = erpCommon.filenodeViewTargetUrl + response.data.datas;
          // setTimeout(function () {
          //   newTab.close();
          // }, 1000);
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    setMarkRead () {
      let v = this;
      let obj = {
        orderIdList: v.orderIdList
      };
      v.axios.put(api.set_markRead, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    getSelectValue (value) { // table获取所选值
      let v = this;
      let pos = [];
      Promise.resolve(value.forEach((n, i) => {
        pos.push(n.orderId);
      })).then(() => {
        v.orderIdList = pos;
      });
    },
    getDateValue (value) { // 获取日期返回值
      let v = this;
      if (value.length === 0) {
        v.$Message.error('日期格式有误');
        v.resetDate();
      } else {
        if (value[0] !== '') {
          v.pageParams.createStartTime = v.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
          v.pageParams.createEndTime = v.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
        }
      }
    },
    getCancelDateValue (value) { // 取消时间
      let v = this;
      v.pageParams.invalidStartTime = v.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
      v.pageParams.invalidEndTime = v.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
    },
    resetDate () {
      let v = this;
      v.pageParams.createStartTime = null;
      v.pageParams.createEndTime = null;
    },
    showPicModal (data) {
      let v = this;
      v.productStatus = true;
      v.$nextTick(function () {
        v.productModal = true;
        v.productDetails = data;
      });
    },
    closeModal () {
      this.productModal = false;
    }
  },
  mounted () {
    let v = this;
    setTimeout(v.getCountrys(), 2000);// 获取国家区域列表
  }
};
</script>
