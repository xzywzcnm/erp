<template>
  <div>
    <div class="unmatchProduct">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="90" class="fixwidthForm">
              <dyt-filter :filter-row="1">
                <Form-item label="店铺" prop="saleAccountIds">
                  <dytStoreSelect
                    v-model="pageParams.saleAccountIds"
                    :option-data="shopList"
                    :replace-option-key="{ value: 'saleAccountId', label: 'accountCode' }"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  />
                </Form-item>
                <Form-item label="标签" prop="tagIdList">
                  <dyt-select v-model="pageParams.tagIdList" :max-tag-count="1" multiple placeholder="请选择或搜索标签">
                    <Option v-for="(item, index) in tagsList" :key="index" :value="item.tagId" :v="item.tagId">{{ item.tagName }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="国家/地区" prop="buyerCountryCodeList">
                  <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" :max-tag-count="1" multiple placeholder="请选择或输入所在地">
                    <Option v-for="(item,index) in formValidate.country" :key="index" :value="item.twoCode" :v="item.cnName">{{ item.enName }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="付款时间">
                  <Date-picker transfer type="datetimerange" style="width:100%" @on-clear="resetDate" @on-change="getDateValue" :clearable="clearAble" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end" placeholder="选择日期" :value="payTimeArr"></Date-picker>
                </Form-item>
                <Form-item label="订单号" prop="orderNo">
                  <dyt-input-tag type="textarea" v-model="pageParams.orderNo" :limit="1" :string="true" placeholder="请输入订单号"></dyt-input-tag>
                </Form-item>
                <Form-item label="买家姓名" prop="buyerName">
                  <dyt-input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></dyt-input>
                </Form-item>
                <Form-item label="买家ID" prop="buyerAccountId">
                  <dyt-input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></dyt-input>
                </Form-item>
                <Form-item label="平台产品编码" prop="webstoreItemId">
                  <dyt-input placeholder="请输入平台产品编码" v-model.trim="pageParams.webstoreItemId"></dyt-input>
                </Form-item>
                <Form-item label="SKU" prop="webstoreSku">
                  <dyt-input-tag type="textarea" v-model.trim="pageParams.webstoreSku" :limit="1" :string="true" placeholder="请输入SKU"></dyt-input-tag>
                </Form-item>
                <Form-item label="搜索字符" prop="searchValue">
                  <dyt-input class="filterSearch" placeholder="可输入订单号、买家ID、买家姓名、SKU、平台产品编码" v-model.trim="pageParams.searchValue"></dyt-input>
                </Form-item>
                <Form-item label="是否截留" prop="isSuspended">
                  <dyt-select v-model="pageParams.isSuspended" :max-tag-count="1">
                    <Option v-for="(item,index) in isSuspendedList" :key="index" :value="item.id">{{ item.name }}</Option>
                  </dyt-select>
                </Form-item>
                <div slot="operation">
                  <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search" class="mr10">查询 </Button>
                  <Button @click="reset" v-once icon="md-refresh">重置 </Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <div>
        <Dropdown style="margin-left: 15px" v-if="getPermission('orderInfo_batch_suspend')">
          <Button type="primary">
            批量截留
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="suspendedSelect">批量截留选中
            </DropdownItem>
            <DropdownItem @click.native="suspendedSelectAll">批量截留所有
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown style="margin-left: 15px" v-if="getPermission('orderTransaction_batchMatchProductGoods')">
          <Button type="primary">
            匹配商品
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="matchingProduction('check')">匹配选中商品
            </DropdownItem>
            <DropdownItem @click.native="matchingProduction('all')">批量匹配所有商品
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown style="margin-left: 15px">
          <Poptip v-model="setTagListStatus" placement="bottom" :transfer="true">
            <Button icon="md-pricetag">
              打标签
              <Icon type="md-arrow-dropdown" />
            </Button>
            <div slot="content">
              <order-label-tag v-model="tagIdList" :tags-list="tagsList" />
              <div class="tagsSelectFooter">
                <Button size="small" @click="setTag(checkOrderId)">打标签</Button>
                <Button size="small" @click="dropOrderTag(checkOrderId)">清空标签</Button>
              </div>
            </div>
          </Poptip>
        </Dropdown>
        <Dropdown style="margin-left: 15px" v-if="getPermission('orderRemark_insert')">
          <Button type="primary">
            批量备注
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="batchUpdateRemark('check')">
              批量备注选中
            </DropdownItem>
            <DropdownItem @click.native="batchUpdateRemark('all')">
              批量备注所有
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div>
        <span>排序：</span>
        <Button-group>
          <template v-for="(item, index) in buttonGroupModel">
            <Button v-if="item.selected" :disabled="SearchDisabled" type="primary" @click="modifyTheSort(index,item.status)" :key="index">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
            <Button v-if="!item.selected" :disabled="SearchDisabled" @click="modifyTheSort(index,item.status)" :key="index">
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
        <Table highlight-row border :height="tableHeight" :loading="tableLoading" :columns="orderColumn" :data="orderData" @on-selection-change='selectChange'></Table>
      </keep-alive>
      <div class="table-page flexBox">
        <keep-alive>
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
        </keep-alive>
      </div>
    </div>
    <!-- 详情 -->
    <keep-alive>
      <sliderModal v-model="orderDetails" :spinShow="spinShow" :styles="{}" class="slider-model" v-if="orderDetailsBegin">
        <orderDetails
          :orderDetailsId="orderDetailsId"
          @reloadTag="reloadTag"
          :timestamp="timestamp"
          :orderNo="orderNo"
          @spinLoading="spinLoading"
          @resetSpinShow="resetSpinShow"
          @updateList="getList"
          :orderTagList="orderTagList"
          :webstoreItemSite="webstoreItemSite"
          :moal-visible.sync="orderDetails"
        />
      </sliderModal>
    </keep-alive>
    <!-- 点击图片 -->
    <keep-alive>
      <Modal v-model="productModal" v-if="productStatus" :width="600">
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
    <Modal v-model="dialogVisible" title="操作提示" @on-ok="confirm" @on-cancel="cancel">
      <span> 确认是否要截留订单，数量：</span>
      <span style="color:#ff995c">{{suspendedWay==0?selectList.length:total}}</span>
      <div style="margin-top:20px">
        截留原因：<Input v-model="suspendedReason" maxlength="200" show-word-limit type="textarea" style="width: 400px" />
      </div>
      <p style="margin-top:30px"> 提示：无法截留的订单将会自动忽略</p>

    </Modal>
    <!-- 批量备注 -->
    <batchRemarkModal :module-visible.sync="moduleRemarkVisible" :module-data="moduleRemarkData" @updateList="getList" />
  </div>
</template>

<script>
import api from '@/api/api';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import { debounce } from 'lodash';
import batchRemarkModal from "@/views/commonOrder/components/commonOrder/batchUpdateRemark";

export default {
  mixins: [Mixin, orderSys],
  components: {
    orderDetails,
    batchRemarkModal
  },
  data () {
    let self = this;
    return {
      moduleRemarkVisible: false,
      moduleRemarkData: {},
      textareaList: [],
      filenodeViewTargetUrl: self.$store.state.erpConfig.filenodeViewTargetUrl, // filenode根路径
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      setTagListStatus: false,
      pageParams: {
        pageNum: 1,
        pageSize: 50,
        tagIdList: [],
        platformId: [this.inGroup],
        buyerCountryCodeList: [],
        searchValue: null,
        payStartTime: null,
        payEndTime: null,
        saleAccountIds: [],
        buyerAccountId: null,
        buyerName: null,
        webstoreItemId: null,
        webstoreSku: null,
        orderNo: null,
        orderBy: 'payTime',
        upDown: 'down',
        isSuspended: 2// 全部
      },
      totalPage: 0,
      total: 0,
      curPage: 1,
      clearAble: true,
      payTimeArr: [],
      buttonGroupModel: [
        {
          type: 'payTime',
          selected: true,
          status: false, // true up false down
          title: '按付款时间'
        }, {
          type: 'salesTime',
          selected: false,
          status: true, // true up false down
          title: '按下单时间'
        }
      ],
      orderData: [],
      orderColumn: [
        {
          type: 'selection',
          width: 60,
          fixed: 'left',
          align: 'center'
        }, {
          title: '订单号',
          key: 'salesRecordNumber',
          align: 'center',
          width: 140,
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
        }, // {
        //   title: '订单状态',
        //   key: 'platformOrderStatus',
        //   width: 120
        // },
        {
          title: '产品',
          key: 'productList',
          align: 'center',
          resizable: true,
          width: 150,
          render: (h, params) => {
            let data = params.row.productList;
            let pos = [];
            data.forEach((n, i) => {
              let item = self.tableImg(h, params, '', n.pictureUrl, () => {
                self.showPicModal(data);
              });
              if (i < 3) {
                pos.push(item);
                if (i === 2) {
                  pos.push(h('span', {
                    style: {
                      marginLeft: '5px'
                    }
                  }, '...'));
                }
              }
            });
            return h('div', pos);
          }
        }, // {
        //   title: '发货剩余时间',
        //   key: 'shippingLimiteTime',
        //   width: 150,
        //   render: (h, params) => {
        //     let date = self.getUniversalTime(params.row.shippingLimiteTime, 'fulltime');
        //     return h('div', {
        //       style: {
        //         color: '#f00'
        //       }
        //     }, self.getRemainTime(date));
        //   }
        // },
        {
          title: '买家ID/姓名',
          key: 'buyerName',
          width: 200,
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
          key: 'buyerCountryCodeList',
          align: 'center',
          width: 120
        }, {
          title: '金额',
          key: 'totalPrice',
          align: 'center',
          width: 120,
          render: (h, params) => {
            return h('div', [
              h('div', params.row.totalPrice), params.row.totalPriceCurrency && h('div', '(' + params.row.totalPriceCurrency + ')')
            ]);
          }
        },
        {
          title: '是否截留',
          key: 'isSuspended',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('div', [
              h('div', params.row.isSuspended == 1 ? '是' : '否')
            ]);
          }
        },
        {
          title: '截留原因',
          key: 'suspendedReason',
          align: 'center',
          width: 120
        },

        {
          title: '付款时间',
          key: 'payTime',
          align: 'center',
          width: 200
        }, {
          title: '标签',
          key: 'tags',
          align: 'center',
          minWidth: 200,
          render: (h, params) => {
            let orderTagList = params.row.orderTagList;
            let pos = [];
            if (orderTagList !== [] && orderTagList !== null) {
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
          title: '备注',
          key: 'remarkContent',
          align: 'center',
          resizable: true,
          width: 200
        }, {
          title: '操作',
          key: 'operate',
          fixed: 'right',
          align: 'center',
          width: 120,
          render: (h, params) => {
            if (self.getPermission('orderInfo_detail')) {
              return h('Button', {
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
              }, '订单详情');
            }
          }
        }
      ], // 详情
      orderDetails: false,
      orderDetailsBegin: false,
      orderDetailsId: null,
      timestamp: null,
      orderNo: null,
      orderTagList: null,
      webstoreItemSite: null,
      productStatus: false, // 点击产品列表详情状态控制
      productModal: false,
      productDetails: '', // modal产品数据
      isSuspendedList: [{ id: 2, name: '全部' }, { id: 0, name: '否' }, { id: 1, name: '是' }],
      // 对话框视图
      dialogVisible: false,
      // 截留原因
      suspendedReason: '',
      // 挑选的list
      selectList: [],
      suspendedWay: 0// 0是选择选中，1是选择所有

    };
  },
  watch: {
    pageParamsStatus (n) {
      let v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    }
  },
  computed: {
    checkOrderId () {
      return this.selectList.map(row => row.orderId)
    },
    tableHeight () {
      return this.getTableHeight(310);
    }
  },
  methods: {
    // 批量备注
    batchUpdateRemark (str) {
      let updateFilter = this.getParams();
      if (str !== "all") {
        if (this.selectList.length == 0) {
          return this.$Message.error("请选择订单");
        }
        updateFilter = {
          orderNo: this.selectList.map(m => `${m.accountCode}-${m.salesRecordNumber}`).join(',')
        }
      }
      this.moduleRemarkData = {
        filterParams: updateFilter,
        url: api.unMatchGoodsBatchnsertRemark
      };
      this.$nextTick(() => {
        this.moduleRemarkVisible = true;
      })
    },
    search: debounce(function () { // 搜索查询共用方法
      let v = this;
      v.tableLoading = true;
      v.SearchDisabled = true;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    }, 600),
    startLoading () {
      let v = this;
      v.$Loading.start();
      Promise.resolve(v.getPermission('orderInfo_queryForUnmatchedGoods') ? v.getList() : v.gotoError()).then(() => {
        v.$Loading.finish();
        v.getShopList();
        v.getOrderListTag();// 获取标签列表
      });
    },
    reset () {
      let v = this;
      v.payTimeArr = [];
      v.resetDate();
      v.$refs['pageParams'].resetFields();
    },
    // 处理搜索条件
    getParams () {
      let filter = this.$common.copy(this.pageParams);
      if (filter.isSuspended == 2) {
        filter.isSuspended = null;
      }
      return filter;
    },
    getList () {
      let v = this;
      const pageParams = this.getParams();
      v.orderData = [];
      v.loadingTrue();
      this.selectList = [];
      v.axios.post(api.get_unmatchGoods, JSON.stringify(pageParams)).then(response => {
        if (response.data.code === 0) {
          let pos = [];
          let saleAccountIdPos = [];
          let orderIdPos = [];
          let data = response.data.datas;
          if (data.list !== null) {
            data.list.forEach((n, i) => {
              pos.push({
                salesRecordNumber: n.salesRecordNumber,
                webstoreItemSite: n.webstoreItemSite,
                platformOrderStatus: n.platformOrderStatus,
                orderNotes: n.orderNotes,
                productList: [],
                buyerName: n.buyerName,
                buyerAccountId: n.buyerAccountId,
                buyerCountryCodeList: n.buyerCountryCode,
                totalPrice: n.totalPrice,
                payTime: v.getDataToLocalTime(n.payTime, 'fulltime'),
                platformId: n.platformId,
                totalPriceCurrency: n.totalPriceCurrency,
                orderId: n.orderId,
                accountCode: '',
                orderTagList: n.orderTags,
                saleAccountId: n.saleAccountId,
                shippingLimiteTime: n.shippingLimiteTime,
                isSuspended: n.isSuspended,
                suspendedReason: n.suspendedReason
              });
              saleAccountIdPos.push(n.saleAccountId);
              orderIdPos.push(n.orderId);
            });
            if (saleAccountIdPos.length > 0) { // 匹配订单号
              async function getData () {
                try {
                  const Arr = await v.getAccountCode(pos, saleAccountIdPos);
                  let newArr = await v.getProductList(Arr, orderIdPos);
                  newArr = await v.getOrderRemark(newArr, orderIdPos); // 匹配订单备注
                  v.orderData = newArr;
                  v.loadingFalse();
                } catch (e) {
                  console.error(e);
                  v.loadingFalse();
                }
              }
              getData();
            }
            v.$nextTick(function () {
              v.total = Number(data.total);
              v.totalPage = Number(data.pages);
            });
          } else {
            v.orderData = [];
            v.loadingFalse();
            v.$nextTick(function () {
              v.total = 0;
              v.totalPage = 0;
            });
          }
        }
      }).catch(() => {
        v.loadingFalse();
      });
    },
    getDateValue (value) { // 获取日期返回值
      let v = this;
      if (value.length === 0) {
        v.$Message.error('日期格式有误');
        v.resetDate();
      } else {
        if (value[0] !== '') {
          v.pageParams.payStartTime = v.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
          v.pageParams.payEndTime = v.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
        }
      }
    },
    resetDate () {
      let v = this;
      v.pageParams.payStartTime = '';
      v.pageParams.payEndTime = '';
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
    showPicModal (data) { // 点击图片
      let v = this;
      v.productStatus = true;
      v.$nextTick(function () {
        v.productModal = true;
        v.productDetails = data;
      });
    },
    closeModal () {
      this.productModal = false;
    },
    valEmit (e) {
    },
    suspendedSelect () {
      if (this.selectList.length == 0) return this.$Message.warning('请先选择要截留的订单')
      this.suspendedWay = 0
      this.suspendedReason = ''
      this.dialogVisible = true
    },
    suspendedSelectAll () {
      if (this.orderData.length == 0) return this.$Message.warning('请先查询要截留的订单')
      this.suspendedWay = 1
      this.suspendedReason = ''
      this.dialogVisible = true
    },
    // 匹配商品
    matchingProduction (str) {
      let option = this.getParams();
      if (str == 'check') {
        if (this.selectList.length == 0) return this.$Message.warning('请先选择要匹配的订单')
        option = {
          platformId: option.platformId,
          matchGoodsOrderIdList: this.selectList.map(item => { return item.orderId })
        }
      }
      console.log(option)
      this.axios.post(api.batchMatchProductGoods, option).then(res => {
        if (res.data && res.data.code != 0) {
          return this.$Message.error(res.data.message || '匹配失败！');
        }
        this.$Message.success('重新匹配完成');
        this.search();
      }).catch(() => {
        this.$Message.error('匹配失败！');
      })
    },
    confirm () {
      let pageParams = JSON.parse(JSON.stringify(this.pageParams))
      if (pageParams.isSuspended == 2) pageParams.isSuspended = null
      this.axios.put('/order-service/orderInfo/batchSuspendOrderInfo', {
        batchSuspendedReason: this.suspendedReason,
        orderIdList: this.suspendedWay == 0 ? this.selectList.map(item => { return item.orderId }) : [],
        queryForUnmatchedGoodsBo: this.suspendedWay == 1 ? pageParams : {},
        operateType: this.suspendedWay
      }).then(res => {
        this.$Message.success('截留成功')
        this.getList()
      })
    },
    cancel () {

    },
    selectChange (val) {
      this.selectList = val
    }
  },
  mounted () {
    let v = this;

    setTimeout(v.getCountrys(), 2000);// 获取国家区域列表
  }
};
</script>
