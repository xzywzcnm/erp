<template >
  <div v-if="mtbStatus">
    <div class="messageToBeProcessedFilter">
      <div class="card-container">
        <div class="card-content">
          <Form ref="pageParams" :model="pageParams" :label-width="70" label-position="left">
            <div class="platformParamsSelect">
              <Row>
                <Col :lg="threeItemLg" :md="threeItemMd">
                <Form-item label="店铺" prop="saleAccountIds">
                  <dytStoreSelect
                    v-model="pageParams.saleAccountIds"
                    :option-data="shopList"
                    :replace-option-key="{ value: 'saleAccountId', label: 'accountCode' }"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  />
                </Form-item>
                </Col>
                <Col :lg="threeItemLg" :md="threeItemMd" :offset="1">
                <Form-item label="标签" prop="tagIdList">
                  <dyt-select v-model="pageParams.tagIdList" @on-change="tagChange" filterable multiple placeholder="请选择或搜索标签">
                    <Option v-for="item in tagsList" :key="item.tagId" :value="item.tagId" :v="item.tagId">{{ item.tagName }}</Option>
                  </dyt-select>
                </Form-item>
                </Col>
                <Col :lg="threeItemLg" :md="threeItemMd" :offset="1">
                <Form-item label="付款时间">
                  <Date-picker transfer style="width:100%" type="datetimerange" @on-clear="resetDate" @on-change="getDateValue" :clearable="clearAble" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end" placeholder="选择日期" :value="payTimeArr"></Date-picker>
                </Form-item>
                </Col>
              </Row>
            </div>
            <div class="platformParamsMoreSection" :class="{none : !moreFilter}">
              <Row>
                <Col :lg="threeItemLg" :md="threeItemMd">
                <Form-item label="国家/地区" prop="buyerCountryCodeList">
                  <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" filterable multiple placeholder="请选择或输入所在地">
                    <Option v-for="(item,index) in formValidate.country" :key="index" :value="item.twoCode">{{ item.enName }}</Option>
                  </dyt-select>
                </Form-item>
                </Col>
                <Col :lg="threeItemLg" :md="threeItemMd" :offset="1">
                <Form-item label="取消时间">
                  <Date-picker transfer type="datetimerange" @on-clear="resetDate1" @on-change="getCancelDateValue" :clearable="clearAble" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end" placeholder="选择日期" :value="payTimeArr2"></Date-picker>
                </Form-item>
                </Col>
                <Col :lg="threeItemLg" :md="threeItemMd" :offset="1">
                <Form-item label="订单号" prop="orderNo">
                  <Input placeholder="请输入订单号,多个订单号用逗号或回车分隔" type="textarea" v-model.trim="pageParams.orderNo"></Input>
                </Form-item>
                </Col>
              </Row>
              <Row class="normalTop">
                <Col :span="5">
                <Form-item label="买家姓名" prop="buyerName">
                  <Input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></Input>
                </Form-item>
                </Col>
                <Col :span="5" :offset="1">
                <Form-item label="买家ID" prop="buyerAccountId">
                  <Input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></Input>
                </Form-item>
                </Col>
                <Col :span="5" :offset="1">
                <Form-item label="平台产品编码" prop="webstoreItemId">
                  <Input placeholder="请输入平台产品编码" v-model.trim="pageParams.webstoreItemId"></Input>
                </Form-item>
                </Col>
                <Col :span="5" :offset="1">
                <Form-item label="SKU" prop="webstoreSku">
                  <Input placeholder="请输入SKU" v-model.trim="pageParams.webstoreSku"></Input>
                </Form-item>
                </Col>
              </Row>
            </div>
            <div class="platformSearch clear" v-if="!moreFilter">
              <Row>
                <Col :lg="oneItemLg" :md="oneItemMd">
                <div class="filterItem">
                  <Form-item label="搜索字符" prop="searchValue">
                    <Input class="filterSearch" placeholder="可输入订单号、买家ID、买家姓名、SKU、平台产品编码" v-model.trim="pageParams.searchValue"></Input>
                  </Form-item>
                </div>
                </Col>
              </Row>
            </div>
            <div class="filterItem filterConfirm" :class="{normalTop : moreFilter}" v-if="isAdmin || controlList.orderInfo_queryForInvalid">
              <Button type="primary" @click="search" size="small" :disabled="SearchDisabled" icon="md-search">查询 </Button>
              <Button @click="reset" size="small" v-once icon="md-refresh">重置 </Button>
            </div>
          </Form>
        </div>
      </div>
      <div class="moreFilter">
        <Button size="small" @click="toggleMoreFilter">
          {{ moreFilterMes }}
          <Icon :type="moreFilterIcon" size="small"></Icon>
        </Button>
      </div>
    </div>
    <div class="dataSort grayBg">
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
    <div class="tableControl">
      <Buttons type="primary" trigger="click" @on-click="exportOrderHasCondition" :disabled="!getPermission('orderInfo_exportInvalidOrders_batch')">
        <Button type="primary" @click="exportOrder" class="iconbuttons" :disabled="!getPermission('orderInfo_exportInvalidOrders_batch')">
          <span class="icon iconfont">&#xe639;</span> 导出选中 </Button>
        <Buttons-menu slot="list">
          <Buttons-item name="1" :disabled="!getPermission('orderInfo_exportInvalidOrders_all')">导出（所有结果集）
          </Buttons-item>
        </Buttons-menu>
      </Buttons>
      <Dropdown class="tcDropDown" v-if="getPermission('orderTag_insert_batch') || getPermission('orderTag_clear')">
        <Poptip v-model="setTagListStatus" placement="bottom" :transfer="true">
          <Button icon="md-pricetag">
            打标签
            <Icon type="md-arrow-dropdown" />
          </Button >
          <div slot="content" >
            <div class="tagsList" >
              <Checkbox-group v-model="tagIdList" >
                <ul >
                  <li
                      v-for="(item, tagIndex) in tagsList" :key="tagIndex" >
                    <Checkbox :label="item.tagId" >{{ item.tagName }}</Checkbox >
                  </li >
                </ul >
              </Checkbox-group >
            </div >
            <div class="tagsSelectFooter" >
              <Button
                  size="small" @click="setTag" :disabled="!getPermission('orderTag_insert_batch')" >打标签 </Button >
              <Button
                  size="small" @click="dropOrderTag" :disabled="!getPermission('orderTag_clear')" >清空标签 </Button >
            </div >
          </div >
        </Poptip >
      </Dropdown >
    </div >
    <div
        class="orderTable normalTop" v-if="getPermission('orderInfo_queryForInvalid')" >
      <keep-alive >
        <Table
            highlight-row
            border
            :loading="tableLoading"
            :height="tableHeight"
            :columns="orderColumn"
            :data="orderData"
            @on-selection-change="getSelectValue" ></Table >
      </keep-alive >
      <div class="table-page flexBox" >
        <keep-alive >
          <Page
              :total="total"
              @on-change="changePage"
              show-total
              :page-size="pageParams.pageSize"
              show-elevator
              :current="curPage"
              show-sizer
              @on-page-size-change="changePageSize"
              placement="top"
              :page-size-opts="pageArray" ></Page >
        </keep-alive >
      </div >
    </div >
    <keep-alive >
      <sliderModal v-model="orderDetails" :spinShow="spinShow" :styles="{}" class="slider-model" v-if="orderDetailsBegin">
        <orderDetails
          :isShowIntercept=false
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
      </sliderModal >
    </keep-alive >
    <keep-alive >
      <Modal
          v-model="productModal" :mask-closable="false" v-if="productStatus" :width="600" >
        <div class="orderDetailsProductItem" >
          <Row
              v-for="(item, index) in productDetails" :key="index" class="normalTop" >
            <Col :span="2" >
              <div class="orderDetailsProductItemPic" >
                <img
                    :src="item.pictureUrl" :alt="item.title" >
              </div >
            </Col >
            <Col
                :span="17" :offset="1" >
              <div class="odpidProductID" >
                <span class="productID" >{{ item.webstoreItemId }}</span >
                <span class="productHaveATitle" >SKU: <em >{{ item.webstoreSku }}</em ></span > <span
                  class="productHaveATitle" v-if="inGroup ==='ebay'" >物品所在地: <em >{{ item.location }}</em ></span >
                <span class="productLogsticService" >物流服务：<em >{{ item.buyerShippingMethod }}</em ></span >
              </div >
              <div class="odpidProductDetails" >
                {{ item.title }}
              </div >
              <div
                  class="odpidProductParams" v-if="item.variations !== null" >
                <span
                    class="productHaveATitle"
                    v-if="item.variations.indexOf('color') >=0 && item.variations.indexOf(';') >0 " >Color:<em >{{ item.variations.split(': ')[1].split(';')[0] }} </em ></span >
                <span
                    class="productHaveATitle"
                    v-if="item.variations.indexOf('color') >=0 && item.variations.indexOf(';') < 0 " >Color:<em >{{ item.variations.split(': ')[1] }} </em ></span >
                <span
                    class="productHaveATitle"
                    v-if="item.variations.toLowerCase().indexOf('pack of') >=0" >Pack of:<em >{{ item.variations.split(';')[1].split(': ')[1] }}</em ></span >
              </div >
            </Col >
            <Col
                :span="2" :offset="2" >
              X {{ item.quantity }}
            </Col >
          </Row >
        </div >
        <div slot="footer" >
          <Button @click="closeModal" >关闭</Button >
        </div >
      </Modal >
    </keep-alive >
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
  </div>
</template>
<script>
import api from '@/api/api';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';

export default {
  mixins: [Mixin, orderSys],
  components: {
    orderDetails
  },
  data () {
    var self = this;
    return {
      buttonGroupModel: [
        {
          type: 'payTime',
          selected: true,
          status: true, // true up false down
          title: '按付款时间'
        }, {
          type: 'salesTime',
          selected: false,
          status: true, // true up false down
          title: '按下单时间'
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
      moreFilter: false, // 高级筛选
      moreFilterIcon: 'md-arrow-dropdown',
      moreFilterMes: '更多选项（国家/地区、取消时间、SKU等）',
      pageParams: {
        pageNum: 1,
        pageSize: 50,
        tagIdList: [],
        platformId: [this.inGroup],
        buyerCountryCodeList: [],
        searchValue: null,
        payStartTime: null,
        payEndTime: null,
        invalidStartTime: null,
        invalidEndTime: null,
        saleAccountIds: [],
        buyerAccountId: null,
        buyerName: null,
        webstoreItemId: null,
        webstoreSku: null,
        orderNo: null,
        upDown: 'up',
        orderBy: 'payTime'
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
          title: '站点',
          key: 'site',
          width: 66,
          render: (h, params) => {
            if (params.row.webstoreItemSite !== null) {
              return h('div', {
                attrs: {
                  class: 'nationalFlag nationalFlag' + params.row.webstoreItemSite,
                  title: params.row.webstoreItemSite
                }
              });
            } else {
              return '';
            }
          }
        }, {
          title: '取消备注',
          key: 'invalidReason',
          minWidth: 150,
          render: (h, params) => {
            return h('div', [
              h('Icon', {
                props: {
                  type: 'chatbox-working',
                  color: '#ff3737'
                }
              }), h('span', {
                style: {
                  marginLeft: '5px'
                }
              }, params.row.invalidReason)
            ]);
          }
        }, {
          title: '产品',
          key: 'productList',
          width: 200,
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
        }, {
          title: '买家ID/姓名',
          key: 'buyerName',
          width: 200,
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
          width: 120
        }, {
          title: '金额',
          key: 'totalPrice',
          width: 100,
          render: (h, params) => {
            return h('div', [
              h('div', params.row.totalPrice), params.row.totalPriceCurrency && h('div', '(' + params.row.totalPriceCurrency + ')')
            ]);
          }
        }, {
          title: '付款时间',
          key: 'payTime',
          width: 100
        }, {
          title: '标签',
          key: 'tags',
          width: 140,
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
          title: '操作',
          key: 'operate',
          fixed: 'right',
          width: 100,
          render: (h, params) => {
            if (params.row !== undefined) {
              return h('div', [
                !self.getPermission('orderInfo_detail') || h('Button', {
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
      orderData: [],
      orderIdList: [],
      setTagListStatus: false,
      clearAble: true,
      resetStatus: true,
      productStatus: false, // 点击产品列表详情状态控制
      productModal: false,
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
      return this.getTableHeight(420);
    }
  },
  methods: {
    startLoading () {
      let v = this;
      v.$Loading.start();
      Promise.resolve(v.getPermission('orderInfo_queryForInvalid') ? v.getList() : v.gotoError()).then(() => {
        v.$Loading.finish();
        v.getShopList();
        v.getOrderListTag();// 获取标签列表
      });
    },
    getList () {
      let v = this;
      v.loadingTrue();
      v.axios.post(api.get_queryForInvalid, JSON.stringify(v.pageParams)).then(response => {
        if (response.data.code === 0) {
          let pos = [];
          let saleAccountIdPos = [];
          let orderIdPos = [];
          let data = response.data.datas;
          if (data.list !== null && data.list.length !== 0) {
            data.list.forEach((n, i) => {
              pos.push({
                salesRecordNumber: n.salesRecordNumber,
                webstoreItemSite: n.webstoreItemSite,
                invalidReason: n.invalidReason,
                productList: [],
                buyerName: n.buyerName,
                buyerCountryCodeList: n.buyerCountryCode,
                totalPrice: n.totalPrice,
                payTime: v.getDataToLocalTime(n.payTime, 'fulltime'),
                platformId: n.platformId,
                totalPriceCurrency: n.totalPriceCurrency,
                orderId: n.orderId,
                accountCode: '',
                orderTagList: n.orderTags,
                saleAccountId: n.saleAccountId,
                buyerAccountId: n.buyerAccountId
              });
              saleAccountIdPos.push(n.saleAccountId);
              orderIdPos.push(n.orderId);
            });
            if (saleAccountIdPos.length > 0) { // 匹配订单号
              async function getData () {
                const Arr = await v.getAccountCode(pos, saleAccountIdPos);
                const newArr = await v.getProductList(Arr, orderIdPos);
                v.orderData = newArr;
                v.loadingFalse();
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
    reset () {
      let v = this;
      v.resetDate();
      v.resetDate1();
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
                    multiple: 'multiple',
                    filterable: 'filterable',
                    transfer: true,
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
                    multiple: 'multiple',
                    filterable: 'filterable',
                    transfer: true,
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
          v.$Message.error('操作失败，请重新尝试');
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
        platformId: [this.inGroup],
        timeZone: localStorage.getItem('timezoom') === undefined ? 8 : localStorage.getItem('timezoom'),
        orderBy: v.pageParams.orderBy,
        upDown: v.pageParams.upDown
      };
      if (v.exportModel.title === '导出（所有结果集）') {
        obj = Object.assign(obj, v.pageParams);
        delete obj.orderIdList;
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
          v.$Message.error('操作失败，请重新尝试');
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
          v.$Message.error('操作失败，请重新尝试');
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
          v.pageParams.payStartTime = v.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
          v.pageParams.payEndTime = v.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
        } else {
          v.pageParams.payStartTime = null;
          v.pageParams.payEndTime = null;
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
      v.pageParams.payStartTime = null;
      v.pageParams.payEndTime = null;
    },
    resetDate1 () {
      let v = this;
      v.pageParams.invalidEndTime = null;
      v.pageParams.invalidStartTime = null;
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
