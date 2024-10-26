<template>
  <div>
    <div class="messageToBeProcessedFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <dyt-filter :filter-row="1">
                <Form-item label="店铺" prop="saleAccountIds" v-if="formSearchKey.includes('saleAccountIds')">
                  <dytStoreSelect
                    v-model="pageParams.saleAccountIds"
                    :option-data="shopList"
                    :replace-option-key="{ value: 'saleAccountId', label: 'accountCode' }"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  />
                </Form-item>
                <Form-item label="标签" prop="tagIdList" v-if="formSearchKey.includes('tagIdList')">
                  <dyt-select
                    v-model="pageParams.tagIdList" :max-tag-count="1" multiple placeholder="请选择或搜索标签"><Option
                    v-for="(item, index) in tagsList"
                    :key="index"
                    :value="item.tagId"
                    :v="item.tagId">{{ item.tagName }}</Option></dyt-select>
                </Form-item>
                <Form-item label="国家/地区" prop="buyerCountryCodeList" v-if="formSearchKey.includes('buyerCountryCodeList')">
                  <dyt-select
                    v-model="pageParams.buyerCountryCodeList"
                    @on-change="countryChange"
                    :max-tag-count="1"
                    multiple
                    placeholder="请选择或输入所在地"><Option
                    v-for="(item,index) in formValidate.country"
                    :key="index"
                    :value="item.twoCode"
                    :v="item.cnName">{{ item.enName }}</Option></dyt-select>
                </Form-item>
                <Form-item label="付款时间" prop="payTime" v-if="formSearchKey.includes('payTime')">
                  <Date-picker
                    transfer
                    type="datetimerange"
                    style="width:100%"
                    :clearable="true"
                    :options="dateOptions"
                    format="yyyy-MM-dd HH:mm:ss"
                    placement="bottom-end"
                    placeholder="选择日期"
                    v-model="pageParams.payTime"
                  />
                </Form-item>
                <Form-item label="订单号" prop="orderNo" v-if="formSearchKey.includes('orderNo')">
                  <dyt-input-tag type="textarea" v-model="pageParams.orderNo" :limit="1" :string="true" placeholder="请输入订单号"></dyt-input-tag>
                </Form-item>
                <Form-item label="买家姓名" prop="buyerName" v-if="formSearchKey.includes('buyerName')">
                  <dyt-input
                    placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></dyt-input>
                </Form-item>
                <Form-item label="买家ID" prop="buyerAccountId" v-if="formSearchKey.includes('buyerAccountId')">
                  <dyt-input
                    placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></dyt-input>
                </Form-item>
                <Form-item label="平台产品编码" prop="webstoreItemId" v-if="formSearchKey.includes('webstoreItemId')">
                  <dyt-input
                    placeholder="请输入平台产品编码" v-model.trim="pageParams.webstoreItemId"></dyt-input>
                </Form-item>
                <Form-item label="SKU" prop="webstoreSku" v-if="formSearchKey.includes('webstoreSku')">
                  <dyt-input-tag type="textarea" v-model="pageParams.webstoreSku" :limit="1" :string="true" placeholder="请输入SKU"></dyt-input-tag>
                </Form-item>
                <Form-item label="商品事业部" prop="businessDeptIdList" v-if="formSearchKey.includes('businessDeptIdList')">
                  <dyt-select
                    v-model="pageParams.businessDeptIdList"
                    :max-tag-count="1"
                    multiple
                    placeholder="请选择商品事业部"
                  >
                    <Option v-for="(item, index) in businessDeptDataList" :value='item.id' :key="`business-${index}`">{{item.name}}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="搜索字符" prop="searchValue" v-if="formSearchKey.includes('searchValue')">
                  <dyt-input
                    class="filterSearch"
                    placeholder="可输入订单号、买家ID、买家姓名、SKU、平台产品编码"
                    v-model.trim="pageParams.searchValue"></dyt-input>
                </Form-item>
                <div slot="operation">
                  <Button
                    type="primary"
                    @click="search"
                    :disabled="SearchDisabled"
                    v-if="getPermission('orderInfo_queryForPendingNotes')"
                    icon="md-search"
                  >查询</Button>
                  <Button @click="reset" style="margin-left: 10px;" v-once icon="md-refresh">重置</Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>
    <div class="tableControl" style="display: flex;">
      <div style="flex: 100;">
        <Buttons
          type="primary"
          trigger="click"
          @on-click="markControl"
          :disabled="!getPermission('orderInfo_markAsRead_batch')"
          v-if="getPermission('orderInfo_markAsRead_batch') || getPermission('orderInfo_markAsRead_all')">
          <Button
            type="primary" @click="setMarkConfirm" :disabled="!getPermission('orderInfo_markAsRead_batch')">
            批量标记为已读 </Button>
          <Buttons-menu slot="list">
            <Buttons-item
              name="1" :disabled="!getPermission('orderInfo_markAsRead_all')">标记为已读（所有结果集）
            </Buttons-item>
          </Buttons-menu>
        </Buttons>
        <Dropdown
          class="tcDropDown" v-if="getPermission('orderTag_insert_batch') || getPermission('orderTag_clear')">
          <Poptip
            v-model="setTagListStatus" placement="bottom" :transfer="true">
            <Button icon="md-pricetag">
              打标签
              <Icon type="md-arrow-dropdown"/>
            </Button>
            <div slot="content">
              <order-label-tag v-model="tagIdList" :tags-list="tagsList"/>
              <div class="tagsSelectFooter">
                <Button
                  size="small" @click="setTag" :disabled="!getPermission('orderTag_insert_batch')">打标签 </Button>
                <Button
                  size="small" @click="dropOrderTag" :disabled="!getPermission('orderTag_clear')">清空标签 </Button>
              </div>
            </div>
          </Poptip>
        </Dropdown>
      </div>
      <div class="dataSort grayBg" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;">
        <span>排序：</span>
        <Button-group>
          <template v-for="(item, index) in buttonGroupModel">
            <Button
              v-if="item.selected" :disabled="SearchDisabled" type="primary" @click="modifyTheSort(index,item.status)" :key="index">
              {{ item.title }}
              <Icon
                type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon
                type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
            <Button
              v-if="!item.selected" :disabled="SearchDisabled" @click="modifyTheSort(index,item.status)" :key="index">
              {{ item.title }}
              <Icon
                type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon
                type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
          </template>
        </Button-group>
      </div>
    </div>
    <div class="orderTable normalTop" v-if="getPermission('orderInfo_queryForPendingNotes')">
      <keep-alive>
        <Table
          highlight-row
          border
          :height="tableHeight"
          :loading="tableLoading"
          :columns="orderColumn"
          :data="orderData"
          @on-selection-change="getSelectValue"></Table>
      </keep-alive>
      <div class="table-page flexBox">
        <keep-alive>
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
            :page-size-opts="pageArray"></Page>
        </keep-alive>
      </div>
    </div>
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
                <span
                  class="productID"
                  @click="goItemUrl(item)"
                  :class="{'cursor-pointer': platformIdUrlKey.includes(item.platformId)}"
                  v-if="item.webstoreItemId"
                >itemID：{{ item.webstoreItemId }}</span>
                <span class="productHaveATitle">SKU: <em>{{ item.webstoreSku }}</em></span>
                <span class="productHaveATitle" v-if="inGroup ==='ebay'">物品所在地: <em>{{ item.location }}</em></span>
                <span class="productLogsticService">物流服务：<em>{{ item.buyerShippingMethod }}</em></span>
              </div>
              <div class="odpidProductDetails">
                {{ item.title }}
              </div>
              <div class="odpidProductParams" v-if="item.variations !== null">
                <span
                  class="productHaveATitle"
                  v-if="item.variations.indexOf('color') >= 0 && item.variations.indexOf(';') > 0">Color:<em>{{ item.variations.split(': ')[1].split(';')[0] }} </em></span>
                <span
                  class="productHaveATitle"
                  v-if="item.variations.indexOf('color') >= 0 && item.variations.indexOf(';') < 0">Color:<em>{{ item.variations.split(': ')[1] }} </em></span>
                <span
                  class="productHaveATitle"
                  v-if="item.variations.toLowerCase().indexOf('pack of') >=0">Pack of:<em>{{ item.variations.split(';')[1].split(': ')[1] }}</em></span>
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
  </div>
</template>
<script>
import api from '@/api/api';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import { filterKey, columnKey } from '@/views/commonOrder/script/messageToBeProcessedConfig';
import { platformReceptionUrl } from '@/utils/enum';

export default {
  mixins: [Mixin, orderSys],
  components: {
    orderDetails
  },
  data () {
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
      platformItemUrl: platformReceptionUrl,
      businessDeptDataList: [],
      orderDetails: false,
      orderDetailsBegin: true,
      orderDetailsId: null,
      orderNo: null,
      timestamp: null,
      orderTagList: null,
      webstoreItemSite: null,
      pageParams: {
        pageNum: 1,
        pageSize: 50,
        isCashOnDelivery: null,
        tagIdList: [],
        platformId: [this.inGroup],
        buyerCountryCodeList: [],
        businessDeptIdList: [],
        searchValue: null,
        payStartTime: null,
        payEndTime: null,
        payTime: [],
        saleAccountIds: [],
        buyerAccountId: null,
        buyerName: null,
        webstoreItemId: null,
        webstoreSku: null,
        orderNo: null,
        orderBy: 'payTime',
        upDown: 'up'
      },
      countryModal: [],
      markCountryModal: [],
      shopListModal: [],
      markTagsModal: [],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      tableColumn: {
        selection: {
          type: 'selection',
          width: 50,
          fixed: 'left',
          align: 'center'
        },
        salesRecordNumber: {
          title: '订单号',
          key: 'salesRecordNumber',
          width: 200,
          align: 'center',
          fixed: 'left',
          render: (h, params) => {
            return h('div', {
              style: {
                color: this.getPermission('orderInfo_detail') ? '#0054A6' : '#515a6e',
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  if (this.getPermission('orderInfo_detail')) {
                    this.show(params.row.orderId);
                    this.orderNo = params.row.accountCode + '-' + params.row.salesRecordNumber;
                    this.orderTagList = params.row.orderTagList;
                    this.webstoreItemSite = params.row.webstoreItemSite;
                  }
                }
              }
            }, params.row.accountCode + '-' + params.row.salesRecordNumber);
          }
        },
        packageCode: {
          title: '站点',
          key: 'packageCode',
          width: 66,
          align: 'center',
          render: (h, params) => {
            if (params.row.webstoreItemSite !== null) {
              return h('div', {
                attrs: {
                  class: 'nationalFlag nationalFlag' + params.row.webstoreItemSite,
                  title: params.row.webstoreItemSite
                }
              });
            } else {
              return h('div', '');
            }
          }
        },
        aliexpressNotes: {
          title: '留言',
          key: 'orderNotes',
          align: 'center',
          resizable: true,
          width: 150,
          render: (h, params) => {
            if (params.row.csMes && params.row.csMes.length > 0) {
              return h('div', params.row.csMes[0].senderName + ': ' + params.row.csMes[0].content + '...');
            }
          }
        },
        orderNotes: {
          title: '留言',
          key: 'orderNotes',
          align: 'center',
          minWidth: 150,
          resizable: true,
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
              }, params.row.orderNotes)
            ]);
          }
        },
        productList: {
          title: '产品',
          key: 'productList',
          align: 'center',
          resizable: true,
          width: 180,
          render: (h, params) => {
            const data = params.row.productList || [];
            let pos = (data.slice(0, 3)).map(m => {
              return this.tableImg(h, params, '', m.pictureUrl, () => {
                this.showPicModal(data);
              })
            });
            if (data.length > 3) {
              pos.push(h('span', {
                style: {
                  marginLeft: '5px'
                }
              }, '...'));
            }
            return h('div', pos);
          }
        },
        buyerName: {
          title: '买家ID/姓名',
          key: 'buyerName',
          align: 'center',
          width: 140,
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
        },
        buyerCountryCodeList: {
          title: '国家/地区',
          key: 'buyerCountryCodeList',
          align: 'center',
          width: 100
        },
        totalPrice: {
          title: '金额',
          key: 'totalPrice',
          align: 'center',
          width: 90,
          render: (h, params) => {
            return h('div', {}, [
              h('div', params.row.totalPrice), params.row.totalPriceCurrency && h('div', '(' + params.row.totalPriceCurrency + ')')
            ]);
          }
        },
        payTime: {
          title: '付款时间',
          key: 'payTime',
          align: 'center',
          width: 140
        },
        tags: {
          title: '标签',
          key: 'tags',
          align: 'center',
          minWidth: 170,
          render: (h, params) => {
            let orderTagList = params.row.orderTagList;
            let pos = [];
            if (!this.$common.isEmpty(orderTagList)) {
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
        },
        remarkContent: {
          title: '备注',
          key: 'remarkContent',
          align: 'center',
          resizable: true,
          minWidth: 170
        },
        orderStatus: {
          title: '订单状态',
          key: 'orderStatus',
          align: 'center',
          width: 140,
          render: (h, params) => {
            return h('span', this.getPlatformOrderStatus(params.row.platformOrderStatus));
          }
        },
        orderRemark: {
          title: '订单备注',
          key: 'orderRemark',
          align: 'center',
          width: 150,
          resizable: true,
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
              }, params.row.orderNotes)
            ]);
          }
        },
        remainTime: {
          title: '发货剩余时间',
          key: 'remainTime',
          width: 160,
          align: 'center',
          render: (h, params) => {
            if (params.row.orderExtendInfo) {
              return h('div', {
                style: {
                  color: '#f00'
                }
              }, this.getRemainTime(params.row.orderExtendInfo.aliexpressTimeoutLeftTime));
            }
          }
        },
        buyerNameLevel: {
          title: '买家ID/姓名/买家等级',
          key: 'buyerName',
          width: 200,
          align: 'center',
          render: (h, params) => {
            if (params.row.orderExtendInfo) {
              let level = params.row.orderExtendInfo.aliexpressBuyerAccountLevel;
              let levelClass;
              switch (level) {
                case 'A0':
                  levelClass = 'grayBgColor';
                  break;
                case 'A1':
                  levelClass = 'greenBgColor';
                  break;
                case 'A2':
                  levelClass = 'blueBgColor';
                  break;
                case 'A3':
                  levelClass = 'yellowBgColor';
                  break;
                case 'A4':
                  levelClass = 'redBgColor';
                  break;
              }
              return h('div', {
                class: 'flexBox',
                style: {
                  'align-items': 'baseline'
                }
              }, [
                h('span', {
                  class: 'lableIcon ' + levelClass,
                  style: {
                    'margin-right': '5px'
                  }
                }, level), h('div', [
                  h('div', {
                    style: {
                      color: '#0054A6'
                    }
                  }, params.row.buyerAccountId), h('div', {
                    style: {
                      color: '#ff3300'
                    }
                  }, params.row.buyerName)
                ])
              ]);
            }
          }
        },
        operate: {
          title: '操作',
          key: 'operate',
          fixed: 'right',
          align: 'center',
          width: 180,
          render: (h, params) => {
            return h('div', [
              !this.getPermission('orderInfo_markAsRead_single') || h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    let arr = [];
                    arr.push(this.platformType);
                    let obj = {
                      orderIdList: [params.row.orderId],
                      platformId: arr
                    };
                    this.axios.put(api.set_markRead, JSON.stringify(obj)).then(response => {
                      if (response.data.code === 0) {
                        this.$Message.success('标记成功');
                        this.pageParamsStatus = true;
                      } else {
                        (!response.data || ![999993, '999993'].includes(response.data.code)) && self.$Message.error('操作失败，请重新尝试');
                      }
                    });
                  }
                }
              }, '标记为已读'), !this.getPermission('orderInfo_detail') || h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.show(params.row.orderId);
                    this.orderNo = params.row.accountCode + '-' + params.row.salesRecordNumber;
                    this.orderTagList = params.row.orderTagList;
                    this.webstoreItemSite = params.row.webstoreItemSite;
                  }
                }
              }, '订单详情')
            ]);
          }
        }
      },
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
      if (n) {
        this.getList();
        this.pageParamsStatus = false;
      }
    }
  },
  created () {
    this.getBusinessDeptData(); // 获取事业部
  },
  computed: {
    platformIdUrlKey () {
      return Object.keys(this.platformItemUrl || {});
    },
    tableHeight () {
      return this.getTableHeight(290);
    },
    formSearchKey () {
      return filterKey[this.inGroup] || filterKey.default;
    },
    orderColumn () {
      const tableColKey = columnKey[this.inGroup] || columnKey.default;
      let platformColumn = [];
      tableColKey.forEach(key => {
        if (!this.$common.isEmpty(this.tableColumn[key])) {
          platformColumn.push(this.tableColumn[key]);
        }
      });
      return platformColumn;
    }
  },
  methods: {
    startLoading () {
      if (!this.getPermission('orderInfo_queryForPendingNotes')) {
        return this.$Message.error('您暂无权限查看数据');
      }
      this.$Loading.start();
      this.getList();
      this.getShopList();
      this.getOrderListTag();// 获取标签列表
      this.$Loading.finish();
    },
    // 获取事业部
    getBusinessDeptData () {
      if (!this.formSearchKey.includes('businessDeptIdList')) return;
      this.axios.get(api.get_businessDeptList).then(res => {
        if (res && res.data) {
          this.businessDeptDataList = res.data.data || [];
        }
      })
    },
    getParams () {
      let newPar = this.$common.copy(this.pageParams);
      Object.keys(newPar).forEach(key => {
        if (!['pageNum', 'pageSize', 'orderBy', 'upDown', 'platformId'].includes(key) && !this.formSearchKey.includes(key)) {
          delete newPar[key];
        }
      });
      newPar.payStartTime = null;
      newPar.payEndTime = null;
      if (!this.$common.isEmpty(newPar.payTime) && !this.$common.isEmpty(newPar.payTime[0])) {
        newPar.payStartTime = this.getUniversalTime(new Date(newPar.payTime[0]).getTime(), 'fulltime');
      }
      if (!this.$common.isEmpty(newPar.payTime) && !this.$common.isEmpty(newPar.payTime[1])) {
        newPar.payEndTime = this.getUniversalTime(new Date(newPar.payTime[1]).getTime(), 'fulltime');
      }
      delete newPar.payTime;
      return newPar;
    },
    getList () {
      this.orderData = [];
      this.loadingTrue();
      this.axios.post(api.get_orderList, this.getParams()).then(response => {
        if (response.data.code === 0) {
          let pos = [];
          let saleAccountIdPos = [];
          let orderIdPos = [];
          let data = response.data.datas;
          if (data.list !== null) {
            data.list.forEach((n, i) => {
              pos.push({
                ...n,
                productList: [],
                payTime: this.getDataToLocalTime(n.payTime, 'fulltime'),
                accountCode: '',
                buyerCountryCodeList: n.buyerCountryCode,
                orderTagList: n.orderTags
              });
              saleAccountIdPos.push(n.saleAccountId);
              orderIdPos.push(n.orderId);
            });
            if (saleAccountIdPos.length > 0) { // 匹配订单号
              this.getAccountCode(pos, saleAccountIdPos).then(Arr => {
                this.getProductList(Arr, orderIdPos).then(newArr => {
                  this.getOrderRemark(newArr, orderIdPos).then(list => {
                    this.orderData = list;
                    this.loadingFalse();
                  })
                })
              })
            }
            this.$nextTick(() => {
              this.total = Number(data.total);
              this.totalPage = Number(data.pages);
            });
          } else {
            this.orderData = [];
            this.loadingFalse();
            this.$nextTick(() => {
              this.total = 0;
              this.totalPage = 0;
            });
          }
        }
      }).catch(() => {
        this.loadingFalse();
      });
    },
    reset () {
      this.$refs['pageParams'].resetFields();
    },
    show (params) {
      this.orderDetailsBegin = true;
      this.orderDetailsId = params;
      let date = new Date().getTime();
      this.$nextTick(() => {
        this.orderDetails = true;
        this.timestamp = date;
      });
    },
    tagChange (value) {
      if (value.indexOf('null') >= 0) {
        this.pageParams.tagIdList = null;
      } else {
        this.pageParams.tagIdList = value;
      }
    },
    setAllMarkRead () {
      this.axios.put(api.set_allMarkRead).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('标记成功');
          this.pageParamsStatus = true;
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && this.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    markControl (val) {
      if (val === '1') {
        this.setMarkConfirm('all');
      }
    },
    setMarkConfirm (type) {
      if (this.orderIdList.length === 0 && type !== 'all') {
        this.$Message.error('请选择订单');
        return false;
      }
      this.$Modal.confirm({
        title: type !== 'all' ? '批量标记为已读' : '标记为已读（所有结果集）',
        content: type !== 'all'
          ? '<p>' + '有留言的订单标记为已读后代表您也针对买家的留言做过了处理，标记为已读后订单将不再出现在有留言列表中。' + '</p>'
          : '<p>' + '所有结果集标记为已读，系统将会把符合您现在查询条件的所有订单的留言标记为已读。' + '</p>',
        onOk: () => {
          this.setMarkRead(type);
        }
      });
    },
    setMarkRead (type) {
      let arr = [];
      arr.push(this.platformType);
      let obj = {
        orderIdList: this.orderIdList,
        platformId: arr
      };
      if (type === 'all') {
        obj = Object.assign(this.getParams(), obj);
      }
      this.axios.put(api.set_markRead, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('标记成功');
          this.pageParamsStatus = true;
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && this.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    getSelectValue (value) { // table获取所选值
      let pos = [];
      Promise.resolve(value.forEach((n, i) => {
        pos.push(n.orderId);
      })).then(() => {
        this.orderIdList = pos;
      });
    },
    showPicModal (data) {
      this.productStatus = true;
      this.$nextTick(() => {
        this.productModal = true;
        this.productDetails = data;
      });
    },
    /**
     * 跳转到对应平台
     * @params item 当前操作对象
     * customer 是客服系统
    * */
    goItemUrl (item) {
      if (this.$common.isEmpty(this.platformItemUrl[item.platformId])) return;
      const itemId = item.webstoreItemId || '';
      let amazonAsin = '';
      if (!this.$common.isEmpty(item.orderTransactions) && !this.$common.isEmpty(itemId)) {
        let orderTranInfo = item.orderTransactions.find(op => op.webstoreItemId == itemId);
        orderTranInfo = this.$common.isEmpty(orderTranInfo) ? {} : orderTranInfo.orderTransactionExtend;
        amazonAsin = orderTranInfo.amazonAsin || '';
      }

      if (this.$common.isEmpty(amazonAsin) && !this.$common.isEmpty(itemId)) {
        let orderTranInfo = {};
        this.orderData.forEach(row => {
          row.orderTransactions.forEach(op => {
            if (op.webstoreItemId == itemId) {
              orderTranInfo = op;
            }
          })
        });
        if (!this.$common.isEmpty(orderTranInfo)) {
          amazonAsin = orderTranInfo.amazonAsin || '';
        }
      }
      const shopeeShopId = item.accountInfo ? item.accountInfo.shopeeShopId || '' : '';
      const openUrl = this.platformItemUrl[item.platformId](itemId, amazonAsin, shopeeShopId);
      window.open(openUrl);
    },
    closeModal () {
      this.productModal = false;
    }
  },
  mounted () {
    setTimeout(this.getCountrys(), 2000);// 获取国家区域列表
  }
};
</script>
