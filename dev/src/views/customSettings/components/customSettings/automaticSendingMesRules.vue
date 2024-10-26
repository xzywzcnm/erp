<template >
  <div :class="wrap">
    <Collapse v-model="topModal" accordion class="normalTop">
      <Panel name="1">
        触发时间
        <div slot="content">
          <dyt-select v-model="triggerAction" :disabled="viewStatus === 'view' || false" style="width: 300px">
            <Option :value="item.code" v-for="item in triggerList" :key="item.code">{{ item.desc }}</Option>
          </dyt-select>
        </div>
      </Panel>
    </Collapse>
    <Row :gutter="10" class="normalTop">
      <Col :span="15">
      <Collapse v-model="leftModal" accordion>
        <Panel name="1">
          已选条件
          <div slot="content">
            <!-- 订单来源 -->
            <div class="d-flex justify-content-start align-items-center flex-wrap" v-if="rulesModel.includes(getRuleCode('A001'))">
              <div class="itemTitle">订单来源为</div>
              <div class="blueColor activeTitle cursor" v-if="!componentsStatus['A001'].platformIds" @click="addItem('platformIds', 'A001')">
                {{ source.platformIds.length > 0 ? source.platformIds.toString() : '指定销售渠道' }}
              </div>
              <dyt-select v-if="componentsStatus['A001'].platformIds && platform.length > 0" v-model="componentsModel['A001'].platformIds" multiple style="width: 100px" @on-change="changeValue('A001', 'platformIds')">
                <Option v-for="item in shipmentPlatformList" :value="item.platformId" :key="item.platformId"> {{ item.name }}</Option>
              </dyt-select>
              <div class="itemTitle">并且为</div>
              <div class="blueColor activeTitle cursor" @click="addItem('siteIds', 'A001', 'platformIds')" v-if="!componentsStatus['A001'].siteIds">
                {{ source.siteIds.length > 0 ? source.siteIds.toString() : '指定站点' }}
              </div>
              <dyt-select v-if="componentsStatus['A001'].siteIds" style="width: 160px" v-model="componentsModel['A001'].siteIds" filterable multiple placeholder="请选择或输入所在地">
                <Option v-for="(item, index) in sitesList" :key="index" :value="item.siteId" :v="item.cnName">{{ item.cnName }}</Option>
              </dyt-select>
              <div class="itemTitle">并且为</div>
              <div class="blueColor activeTitle cursor" v-if="!componentsStatus['A001'].saleAccountIds" @click="addItem('saleAccountIds', 'A001', 'saleAccountIds')">
                {{ source.saleAccountIds.length > 0 ? source.saleAccountIds.toString() : '指定站点' }}
              </div>
              <!-- <dyt-select v-if="componentsStatus['A001'].saleAccountIds" v-model="componentsModel['A001'].saleAccountIds" filterable multiple placeholder="请选择店铺，可输入搜索" style="width: 100px">
                <Option v-for="(item, index) in platformAccountList" :key="index" :value="item.saleAccountId">{{ item.accountCode }}</Option>
              </dyt-select> -->
              <dytStoreSelect
                style="width: 220px"
                v-model="componentsModel['A001'].saleAccountIds"
                :option-data="platformAccountList"
                :replace-option-key="{ value: 'saleAccountId', label: 'accountCode' }"
                placeholder="请选择店铺，可输入搜索"
                input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                v-if="componentsStatus['A001'].saleAccountIds"
              />
            </div>
            <!-- 买家选择的运输类型 -->
            <div class="d-flex justify-content-start align-items-center flex-wrap" v-if="rulesModel.includes(getRuleCode('A002'))">
              <div class="itemTitle">买家选择的运输类型为</div>
              <div class="blueColor activeTitle">
                <Poptip @on-popper-show="addItem('shipmentTypes', 'A002')" transfer width="700" placement="right">
                  <span class="blueColor activeTitle cursor">
                    {{ shipmentTagModel.length > 0 ? shipmentTagModel[0] + '...' : '指定类型' }}
                  </span>
                  <div slot="content" class="keywordString">
                    <div>
                      已选择
                    </div>
                    <div class="breakWord max-height-300">
                      <Tag closable :color="tagColor(item)" v-for="(item, index) in shipmentTagModel" :key="index" @on-close="delTag(index)">{{ item }}
                      </Tag>
                    </div>
                    <div class="divider normalTop"></div>
                    <div class="platformSelect normalTop">
                      <dyt-select v-model="shipmentPlatformModel" style="width:150px" @on-change="getSite" placeholder="请选择平台">
                        <Option v-for="item in shipmentPlatformList" :key="item.platformId" :value="item.platformId">{{ item.name }}</Option>
                      </dyt-select> <dyt-select v-model="shipmentPlatformSite" v-if="hasSite" style="width:150px; margin-left:10px" @on-change="setSite">
                        <Option v-for="item in shipmentPlatformSiteList" :key="item.siteId" :value="item.siteId">{{ item.cnName }}</Option>
                      </dyt-select>
                    </div>
                    <div class="normalTop">
                      <Input v-model.trim="shipmentSearchValue" style="width:310px" @on-enter="shipmentSearch" placeholder="请输入运输类型名称搜索"></Input>
                    </div>
                    <div class="normalTop" v-if="shipmentPlatformModel !== '' && smShippingMethodList.length > 0">
                      <CheckboxGroup v-model="shipmentCheckBoxModel" @on-change="setTagValue">
                        <div class="checkboxContainer">
                          <div class="normalTop" v-for="(item, index) in smShippingMethodList" :key="index">
                            <Checkbox :label="shipmentPlatformModel + ':' + item.shippingMethodName + ':' + item.shippingMethodDescription">
                              <span>{{ item.shippingMethodDescription }}</span>
                            </Checkbox>
                          </div>
                        </div>
                      </CheckboxGroup>
                    </div>
                  </div>
                </Poptip>
              </div>
            </div>
            <!-- 是否是子订单 -->
            <div class="d-flex justify-content-start align-items-center flex-wrap" v-if="rulesModel.includes(getRuleCode('A003'))">
              <span class="itemTitle" :class="{textMarginTop: componentsStatus['A003'].childorders}">订单</span> <span v-if="!componentsStatus['A003'].childorders" class="blueColor activeTitle cursor" @click="addItem('childorders', 'A003')">
                {{ componentsModel['A003'].childorders === 'true' ? '是' : '否' }}
              </span> <dyt-select v-if="componentsStatus['A003'].childorders" v-model="componentsModel['A003'].childorders" class="itemPaddingRight" style="width:70px">
                <Option value="true">是</Option>
                <Option value="false">否</Option>
              </dyt-select>
              <span class="activeTitle">
                子订单
              </span>
            </div>
            <!-- 订单目的地 -->
            <div class="d-flex justify-content-start align-items-center flex-wrap" v-if="rulesModel.includes(getRuleCode('A004'))">
              <div class="itemTitle" :class="{textMarginTop: componentsStatus['A004'].countryCodes}">订单目的地为
              </div>
              <div v-if="!componentsStatus['A004'].countryCodes" class="blueColor activeTitle cursor countryCodesName" @click="addItem('countryCodes', 'A004')">
                {{ countryCodesName === '' ? '指定国家' : countryCodesName }}
              </div>
              <treeSelect v-if="componentsStatus['A004'].countryCodes" :treeData="countryData" ref="treeDataRef" v-model="countryCodes" filterable @on-change="getTreeData" style="width:200px" show-checkbox></treeSelect>
            </div>
            <!-- 发货仓库 -->
            <div class="d-flex justify-content-start align-items-center flex-wrap" v-if="rulesModel.includes(getRuleCode('A005'))">
              <span class="itemTitle">发货仓库为</span> <span class="blueColor activeTitle cursor" v-if="!componentsStatus['A005'].warehouseIds" @click="addItem('warehouseIds', 'A005')">
                {{ componentsModel['A005'].warehouseIds.length > 0 ? warehouseIdsName.toString() : '指定仓库' }}
              </span> <dyt-select v-if="componentsStatus['A005'].warehouseIds" v-model="componentsModel['A005'].warehouseIds" multiple style="width: 100px">
                <Option v-for="item in allStorelist" :value="item.warehouseId" :key="item.warehouseId"> {{ item.warehouseName }}</Option>
              </dyt-select>
            </div>
            <!-- 指定商品分类 -->
            <div class="d-flex justify-content-start align-items-center flex-wrap" v-if="rulesModel.indexOf(getRuleCode('A008')) >= 0">
              <div class="itemTitle">并且订单至少存在一件货品属于</div>
              <div v-if="!componentsStatus['A008'].productCategories" class="blueColor activeTitle cursor" @click="addItem('productCategories', 'A008')">
                {{ componentsModel['A008'].productCategories.length > 0 ? productCategoryListName : '指定分类' }}
              </div>
              <dyt-select v-if="componentsStatus['A008'].productCategories" v-model="componentsModel['A008'].productCategories" style="width:100px" multiple>
                <Option v-for="item in productCategoryList" :key="item.productCategoryId" :value="item.productCategoryId">{{ item.cnName }}</Option>
              </dyt-select>
            </div>
            <!-- 指定商品标签 -->
            <div class="d-flex justify-content-start align-items-center flex-wrap" v-if="rulesModel.includes(getRuleCode('A007'))">
              <div class="itemTitle">订单货品包含</div>
              <div v-if="!componentsStatus['A007'].productTags" class="blueColor activeTitle cursor" @click="addItem('productTags', 'A007')">
                {{
                    componentsModel['A007'].productTags.length > 0
                    ? componentsModel['A007'].productTags.toString()
                    : '指定商品标签'
                  }}
              </div>
              <dyt-select v-if="componentsStatus['A007'].productTags" v-model="componentsModel['A007'].productTags" style="width:100px" multiple>
                <Option v-for="(item, index) in productTagList" :key="index" :value="item.name">{{ item.name }}</Option>
              </dyt-select>
              <div class="activeTitle">
                等标签
              </div>
            </div>
            <!-- 指定邮寄方式 -->
            <div class="d-flex justify-content-start align-items-center flex-wrap" v-if="rulesModel.includes(getRuleCode('A006'))">
              <div class="itemTitle">实际发货邮寄方式为</div>
              <div class="blueColor activeTitle">
                <Poptip @on-popper-show="addItem('shippingMethodIds', 'A006')" transfer width="700" placement="bottom">
                  <span class="blueColor activeTitle cursor">
                    {{ shippingMethodIds.length > 0 ? shippingMethodIds[0] + '...' : '指定邮寄方式' }}
                  </span>
                  <div slot="content" class="keywordString">
                    <Transfer :data="shippingMethodIdsData" :target-keys="shippingMethodKeys" :list-style="listStyle" filterable :filter-method="filterMethod" @on-change="shippingMethodChange"></Transfer>
                  </div>
                </Poptip>
              </div>
            </div>
            <!-- 指定商品-->
            <div class="d-flex justify-content-start align-items-center flex-wrap" v-if="rulesModel.includes(getRuleCode('A009'))">
              <div class="itemTitle">并且订单包含</div>
              <div class="blueColor activeTitle cursor" @click="addItem('skus', 'A009')">
                {{ componentsModel['A009'].skus.length > 0 ? componentsModel['A009'].skus.toString() : '指定货品' }}
              </div>
            </div>
          </div>
        </Panel>
      </Collapse>
      </Col>
      <Col :span="9">
      <Collapse v-model="rightModal" accordion>
        <Panel name="1">
          已选条件
          <div slot="content">
            <Table highlight-row border :show-header="false" size="small" :columns="optionalColumns" :data="optionalData" @on-selection-change="getOptionalSelected"></Table>
          </div>
        </Panel>
      </Collapse>
      </Col>
    </Row>
    <div class="normalTop">
      <Collapse v-model="contentOfStationModal" accordion>
        <Panel name="1">
          站内信内容
          <div slot="content">
            <div class="d-flex justify-content-between">
              <Button type="primary" @click="addNewDelayedDelivery" :disabled="viewStatus === 'view' || false">添加一条延迟发送 </Button>
              <dyt-select v-model="contentSelectModel" style="width: 300px" @on-change="getContentSelectModal" :disabled="viewStatus === 'view' || false">
                <Option :value="item.value" v-for="item in contentSelectOfStationList" :key="item.value">{{ item.title }}</Option>
              </dyt-select>
            </div>
            <div class="normalTop">
              <Table highlight-row border :show-header="false" :columns="columns" :data="mesListData"></Table>
            </div>
          </div>
        </Panel>
      </Collapse>
    </div>
    <div class="normalTop">
      <Collapse v-model="contentOfStationModal" accordion>
        <Panel name="1">
          规则名称
          <div slot="content">
            <Input type="text" v-model="ruleName" placeholder="请输入规则名称" style="width: 300px" :disabled="viewStatus === 'view' || false" />
          </div>
        </Panel>
      </Collapse>
    </div>
    <div class="ruleButtons d-flex justify-content-end normalTop">
      <Button class="normalRMargin" size="large" @click="closeRuleModal">取消 </Button>
      <Button type="primary" class="saveButton" size="large" @click="saveButton" v-if="viewStatus !== 'view'">保存 </Button>
    </div>
    <!-- 人工匹配商品 -->
    <matchingGoodsModal ref="matchingGoodsModal" :typeStatus="typeStatus" @concatSku="concatSku" :skus="componentsModel['A009'].skus"></matchingGoodsModal>
    <Spin size="large" fix v-if="spinShow"></Spin>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import publicService from '@/components/mixin/publicService_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import { getLocalStorage } from '@/utils/index';
import matchingGoodsModal from '@/components/common/order/matchingGoodsModal';// 商品弹出框
const prefixCls = 'tongtool-customer-automaticSendingMesRules';
export default {
  mixins: [Mixin, publicService, orderSys],
  components: {
    matchingGoodsModal
  },
  props: {
    viewStatus: { // view 查看 edit 编辑 newItem 新增
      type: String,
      default: 'newItem'
    },
    ruleParmas: {
      type: Object,
      default: null
    },
    timestamp: {
      type: [String, Number],
      default: 0
    }
  },
  watch: {
    timestamp: {
      handler (n, o) {
        let v = this;
        if (n !== o) {
          v.spinLoading();
          v.resetRuleData();
          v.$nextTick(function () {
            v.getRulesDetails();
          });
        }
      }
    },
    triggerAction (n, o) {
      if (n !== o) {
        this.getRulesDetails();
      }
    }
  },
  data () {
    // const noEmpty = (rule, value, callback) => {
    //   if (value === '') {
    //     callback(new Error('请输入规则名'));
    //   } else {
    //     callback();
    //   }
    // };
    return {
      typeStatus: 3, // 指定商品分类 start
      productCategoryListName: '',
      cursor: [],
      productCategoryList: [], // 指定商品分类 END
      // 邮寄方式 start
      shippingMethodKeys: [],
      shippingMethodIdsData: [],
      shippingMethodIds: [],
      listStyle: {
        width: '250px',
        height: '300px'
      }, // 邮寄方式 END
      productTagList: [], // 商品标签
      // 指定国家 start
      countryCodesName: '',
      treeArr: [],
      countryCodes: [],
      countryData: [], // 指定国家 END
      // 运输类型 start
      smShippingMethodList: [],
      shipmentTagModel: [],
      shipmentPlatformModel: '',
      shipmentPlatformSite: '',
      shipmentPlatformSiteList: [],
      shipmentCheckBoxModel: [],
      hasSite: false,
      shipmentSearchValue: null, // 运输类型 end
      autoRuleItems: [], // 缓存加载内容
      loading: false,
      platformAccountList: [], // 帐号列表
      sitesList: [], // 站点列表
      platform: [
        {
          platformId: 'all',
          value: '',
          name: '全部'
        }
      ],
      shipmentPlatformList: [], // 平台集合
      source: { // A001内容
        platformIds: [],
        siteIds: [],
        saleAccountIds: []
      },
      componentsStatus: {
        'A001': {
          platformIds: false,
          siteIds: false,
          saleAccountIds: false
        },
        'A002': {
          shipmentTypes: false
        },
        'A003': {
          childorders: false
        },
        'A004': {
          countryCodes: false
        },
        'A005': {
          warehouseIds: false
        },
        'A006': {
          shippingMethodIds: false
        },
        'A007': {
          productTags: false
        },
        'A008': {
          productCategories: false
        },
        'A009': {
          skus: false
        }
      },
      componentsModel: {
        'A001': {
          platformIds: [],
          siteIds: [],
          saleAccountIds: []
        },
        'A002': {
          shipmentTypes: []
        },
        'A003': {
          childorders: 'true'
        },
        'A004': {
          countryCodes: []
        },
        'A005': {
          warehouseIds: []
        },
        'A006': {
          shippingMethodIds: []
        },
        'A007': {
          productTags: []
        },
        'A008': {
          productCategories: []
        },
        'A009': {
          skus: []
        }
      },
      rulesModel: [], // 右侧勾选状态
      optionalColumns: [ // 可选条件
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: 'name',
          minWidth: 100,
          key: 'display'
        }
      ],
      optionalData: [],
      focusItem: null,
      columns: [
        {
          title: '',
          width: 100,
          render: (h, params) => {
            if (this.viewStatus === 'view') {
              return '';
            }
            return h('div', {
              class: 'd-flex justify-content-center align-items-center'
            }, [
              h('i', {
                class: 'icon iconfont redColor icon-closecircled',
                style: {
                  fontSize: '30px',
                  cursor: 'pointer',
                  padding: '0 0 5px 0'
                },
                on: {
                  click: () => {
                    if (this.mesListData.length === 1) {
                      this.$Message.error('至少需要一条站内信内容');
                      return false;
                    } else {
                      this.mesListData.splice(params.index, 1);
                    }
                  }
                }
              })
            ]);
          }
        }, {
          title: '',
          width: 230,
          render: (h, params) => {
            return h('div', [
              h('div', {
                class: 'd-flex justify-content-start align-items-start'
              }, '在触发后'), h('div', {
                class: 'd-flex justify-content-left align-items-start'
              }, [
                h('InputNumber', {
                  props: {
                    size: 'small',
                    value: params.row.day,
                    min: 0,
                    step: 1,
                    disabled: this.viewStatus === 'view' || false
                  },
                  style: {
                    width: '50px'
                  },
                  on: {
                    'on-change': (value) => {
                      this.mesListData[params.index].day = value;
                    }
                  }
                }), h('div', {
                  style: {
                    'line-height': 2.1,
                    margin: '0 5px'
                  }
                }, '天'), h('InputNumber', {
                  props: {
                    size: 'small',
                    value: params.row.hour,
                    min: 0,
                    step: 1,
                    disabled: this.viewStatus === 'view' || false
                  },
                  style: {
                    width: '50px'
                  },
                  on: {
                    'on-change': (value) => {
                      this.mesListData[params.index].hour = value;
                    }
                  }
                }), h('div', {
                  style: {
                    'line-height': 2.1,
                    margin: '0 5px'
                  }
                }, '小时发送')
              ])
            ]);
          }
        }, {
          title: '',
          render: (h, params) => {
            return h('Input', {
              props: {
                type: 'textarea',
                row: 4,
                value: params.row.content,
                disabled: this.viewStatus === 'view' || false
              },
              style: {
                margin: '10px'
              },
              on: {
                'on-focus': () => {
                  this.focusItem = params.index;
                },
                'on-keyup': (event) => {
                  this.mesListData[params.index].content = event.target.value;
                }
              }
            });
          }
        }
      ],
      mesListData: [
        {
          day: 0,
          hour: 0,
          content: null,
          orderNo: 0
        }
      ],
      ruleName: null,
      contentSelectModel: '$' + '{salesSite}',
      triggerAction: '',
      leftModal: '1',
      topModal: '1',
      rightModal: '1',
      contentOfStationModal: '1',
      contentSelectOfStationList: [
        {
          title: '销售站点' + '$' + '{salesSite}',
          value: '$' + '{salesSite}'
        }, {
          title: '卖家帐号' + '$' + '{sellerID}',
          value: '$' + '{sellerID}'
        }, {
          title: '卖家邮箱' + '$' + '{sellerEmail}',
          value: '$' + '{sellerEmail}'
        }, {
          title: '商品标题' + '$' + '{itemTitle}',
          value: '$' + '{itemTitle}'
        }, {
          title: '商品链接' + '$' + '{itemLink}',
          value: '$' + '{itemLink}'
        }, {
          title: '商品编号' + '$' + '{itemNumber}',
          value: '$' + '{itemNumber}'
        }, {
          title: '买家帐号' + '$' + '{buyerId}',
          value: '$' + '{buyerId}'
        }, {
          title: '买家邮箱' + '$' + '{buyerEmail}',
          value: '$' + '{buyerEmail}'
        }, {
          title: '买家支付的运费' + '$' + '{freightBuyerPaid}',
          value: '$' + '{freightBuyerPaid}'
        }, {
          title: '订单总金额' + '$' + '{totalAmount}',
          value: '$' + '{totalAmount}'
        }, {
          title: '拆分后的子订单数' + '$' + '{qtySplited}',
          value: '$' + '{qtySplited}'
        }, {
          title: '当前订单在子订单中的顺序号' + '$' + '{seqInSplited}',
          value: '$' + '{seqInSplited}'
        }, {
          title: '收件人姓名' + '$' + '{recipientName}',
          value: '$' + '{recipientName}'
        }, {
          title: '收件人地址' + '$' + '{recipientAddress}',
          value: '$' + '{recipientAddress}'
        }, {
          title: '物流商同步名称' + '$' + '{carrierUploadName}  ',
          value: '$' + '{carrierUploadName}'
        }, {
          title: '物流运单号' + '$' + '{trackingNumber}',
          value: '$' + '{trackingNumber}'
        }, {
          title: '物流商单号' + '$' + '{shippingConfirmNumber}',
          value: '$' + '{shippingConfirmNumber}'
        }, {
          title: '虚拟运单号' + '$' + '{virtualTrackingNumber}',
          value: '$' + '{virtualTrackingNumber}'
        }, {
          title: '物流商查询网址' + '$' + '{carrierUrl}',
          value: '$' + '{carrierUrl}'
        }, {
          title: 'GMT付款日期' + '$' + '{paidOnDate}',
          value: '$' + '{paidOnDate}'
        }, {
          title: 'GMT发货日期' + '$' + '{shippedOnDate}',
          value: '$' + '{shippedOnDate}'
        }, {
          title: 'GMT当前日期' + '$' + '{gmtToday}',
          value: '$' + '{gmtToday}'
        }
      ]
    };
  },
  computed: {
    wrap () {
      return `${prefixCls}`;
    },
    triggerList () {
      return getLocalStorage('triggerList');
    }
  },
  methods: {
    delTag (index) { // 删除标签
      let v = this;
      v.shipmentCheckBoxModel.splice(index, 1);
      v.shipmentTagModel.splice(index, 1);
    },
    tagColor (item) { // 标签颜色
      item = item.split(':')[0];
      switch (item) {
        case 'ebay':
          return 'blue';
        case 'aliexpress':
          return 'red';
        default:
          return 'yellow';
      }
    },
    resetRuleData () {
      let v = this;
      v.optionalData = [];
      v.rulesModel = [];
      v.source = {
        platformIds: [],
        siteIds: [],
        saleAccountIds: []
      };
      v.ruleName = null;
      v.mesListData = [];
      v.triggerAction = '';
      v.smShippingMethodList = [];
      v.hasSite = false;
      v.warehouseIdsName = [];
      v.platformAccountList = [];
      v.sitesList = [];
      v.shipmentSearchValue = null;
      v.shipmentPlatformModel = '';
      v.shipmentPlatformSite = '';
      v.shipmentPlatformList = [];
      v.shipmentPlatformSiteList = [];
      v.shipmentCheckBoxModel = [];
      v.shipmentTagModel = [];
      v.productCategoryListName = '';
      v.productCategoryList = [];
      for (let i in v.componentsStatus) {
        for (let b in v.componentsStatus[i]) {
          v.componentsStatus[i][b] = false;
        }
      }
    },
    closeRuleModal () {
      let v = this;
      v.$emit('closeModal', 0);
    },
    handleSubmit () {
      let v = this;
      let arr = [];
      let status = false;
      return new Promise(resolve => {
        if (v.ruleName === '') {
          v.$Message.error('规则名称不能为空');
          v.loading = false;
          return false;
        }
        if (!v.triggerAction) {
          v.$Message.error('触发时间不能为空');
          v.loading = false;
          return false;
        }
        for (let item in v.componentsStatus) { // 扫componentsStatus 的key
          let subArr = [];// autoRuleParams
          let changeItem = v.getRuleCode(item);
          let sub = v.componentsStatus[changeItem];
          for (let subItem in sub) { // 扫componentsStatus 的key 里面对象的key,获取当前业务类型
            let child = sub[subItem];
            for (let u = 0; u < v.rulesModel.length; u++) { // 检查选定的已选条件
              let ruleItem = v.rulesModel[u];
              if (ruleItem === item) { // 勾选有效， 做值校验
                if (changeItem === 'A001' && v.componentsModel[changeItem]['platformIds'].length === 0) {
                  v.$Message.error('已选条件下订单来源指定销售渠道不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'A002' && v.shipmentTagModel.length === 0) {
                  v.$Message.error('已选条件下运输类型不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'A004' && v.componentsModel[changeItem]['countryCodes'].length === 0) {
                  v.$Message.error('已选条件下订单目的地指定国家不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'A005' && v.componentsModel[changeItem]['warehouseIds'].length === 0) {
                  v.$Message.error('已选条件下指定仓库不能为空');
                  v.loading = false;
                  return false;
                }
                status = true;
                if (child || (v.componentsModel[changeItem][subItem] && v.componentsModel[changeItem][subItem].length > 0) || changeItem === 'A002' || changeItem === 'A007') { // A002已有数据在加载时候并不会存在componentsModel上
                  if (changeItem === 'A001' || changeItem === 'A004' || changeItem === 'A005' || changeItem === 'A007' || changeItem === 'A008' || changeItem === 'A009' || changeItem === 'A006') { // 根据业务类型和接口规则进行拼接处理
                    let childArr = [];
                    let subItemList = v.componentsModel[changeItem][subItem];
                    if (subItem !== 'buyerPostalCodes' && subItemList && subItemList.length > 0) {
                      for (let t = 0; t < subItemList.length; t++) {
                        childArr.push({
                          value: subItemList[t]
                        });
                      }
                      let obj = {
                        name: subItem,
                        type: 1,
                        autoRuleParamValues: childArr
                      };
                      subArr.push(obj);
                    }
                  } else if (changeItem === 'A002') {
                    let shippingArr = [];
                    for (let i = 0; i < v.shipmentCheckBoxModel.length; i++) {
                      let shipItem = v.shipmentCheckBoxModel[i];
                      shippingArr.push({
                        value: shipItem
                      });
                      if (i === v.shipmentCheckBoxModel.length - 1) {
                        subArr.push({
                          name: 'shipmentTypes',
                          type: 1,
                          autoRuleParamValues: shippingArr
                        });
                      }
                    }
                  } else {
                    let value = v.componentsModel[changeItem][subItem];
                    let obj = {
                      name: subItem,
                      type: 0,
                      value: value
                    };
                    if (v.componentsModel[changeItem][subItem] !== '') {
                      subArr.push(obj);
                    }
                  }
                }
              }
            }
          }
          if (subArr.length > 0) { // 如果有值， 组成数据
            let itemObj = {
              ruleCode: item,
              autoRuleParams: subArr
            };
            arr.push(itemObj);
          }
          if ((changeItem === 'A009' && status) || (changeItem === 'A009' && v.rulesModel.length === 0)) {
            resolve([true, arr]);
          }
        }
      });
    },
    saveButton () { // 保存
      let v = this;
      v.loading = true;
      v.handleSubmit().then(result => {
        if (result[0]) {
          let url = api.set_newAutoSendMessageAutoRule;
          let actionObj = {
            actions: v.mesListData, // 站内信内容
            triggerValue: v.triggerAction // 触发时间
          };
          let obj = {
            autoRuleAction: actionObj,
            name: v.ruleName,
            autoRuleItems: result[1],
            status: 1
          };
          let axiosType = 'post';
          if (v.viewStatus === 'edit') {
            obj.autoRuleId = v.ruleParmas.autoRuleId;
            url = api.update_autoSendMessageAutoRule;
            axiosType = 'put';
          }
          if (obj.name === '' || obj.name === null) {
            v.$Message.error('规则名称不能为空');
            return;
          }
          let axiosObj = {
            url: url,
            data: obj,
            type: axiosType
          };
          v.ajaxData(axiosObj).then(response => {
            if (response.data.code === 0) {
              v.$Message.success('保存成功');
              v.$emit('closeModal', 1);
            } else {
              (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.success('操作失败，请重新尝试');
            }
          });
        }
      });
    },
    addItem (name, code) { // getAPIData
      let v = this;
      if (v.viewStatus === 'view') {
        return false;
      }
      if (name === 'warehouseIds') {
        v.componentsStatus[code][name] = true;
        v.getAllstore(0, 1);// 获取仓库列表
      } else if (name === 'platformIds') {
        v.componentsStatus[code][name] = true;
        if (v.shipmentPlatformList.length === 0) {
          v.getShipment();
        }
      } else if (name === 'siteIds') {
        if (v.componentsModel[code]['platformIds'].length === 0 && !v.componentsStatus[code]['platformIds']) {
          v.$Message.error('请先选择平台');
          return false;
        }
        v.componentsStatus[code][name] = true;
        if (v.shipmentPlatformList.length === 0) {
          v.getShipment('sites');
        }
      } else if (name === 'saleAccountIds') {
        if (v.componentsModel[code]['platformIds'].length === 0 && !v.componentsStatus[code]['platformIds']) {
          v.$Message.error('请先选择平台');
          return false;
        }
        if (v.shipmentPlatformList.length === 0) {
          v.getShipment('account');
        }
        v.componentsStatus[code][name] = true;
      } else if (name === 'shipmentTypes') {
        v.componentsStatus[code][name] = true;
        v.getShipment();
      } else if (name === 'childorders') { // 是否是子订单
        v.componentsStatus[code][name] = true;
      } else if (name === 'countryCodes') { // 指定国家
        v.componentsStatus[code][name] = true;
        v.getCommonCountry(v.treeArr);
      } else if (name === 'shippingMethodIds') {
        v.componentsStatus[code][name] = true;
        v.getEnableCarrierShipping();
      } else if (name === 'productTags') {
        v.getProductTags().then(result => {
          if (result) {
            v.componentsStatus[code][name] = true;
          }
        });
      } else if (name === 'productCategories') {
        v.getProductCategory().then(result => {
          if (result) {
            v.componentsStatus[code][name] = true;
          }
        });
      } else if (name === 'skus') {
        // v.componentsStatus[code][name] = true;
        v.$refs.matchingGoodsModal.matchingGoodsStatus = true;
        v.$nextTick(function () {
          v.$refs.matchingGoodsModal.matchingGoodsModal = true;
          v.componentsStatus[code][name] = true;
        });
      }
    },
    changeValue (val, item) { // 下拉多选，如果选择全部，则干掉其他选项
      let v = this;
      let value = v.componentsModel[val][item];
      if (value.indexOf('all') >= 0) {
        v.componentsModel[val][item] = ['all'];
      }
    },
    getShipment (type) { // 获取运输类型平台
      let v = this;
      v.getEnablePlatform().then(data => {
        v.shipmentPlatformList = data;
        if (type) {
          v.getShimentSites(v.componentsModel['A001'].platformIds);
        }
      });
    },
    getShimentSites (platformArr) { // 站点获取
      let v = this;
      let sitesArr = [];
      let accountSite = [];
      v.shipmentPlatformList.forEach((n, i) => {
        platformArr.forEach((m, t) => {
          if (n.platformId === m) {
            sitesArr = sitesArr.concat(n.sites);
            accountSite = accountSite.concat(n.saleAccounts);
          }
        });
      });
      v.platformAccountList = accountSite;
      if (sitesArr.length > 0) {
        let hasSiteIds = [];
        sitesArr.forEach((n, i) => {
          if (n.cnName.indexOf(n.platformId) < 0) {
            n.cnName = n.platformId + '-' + n.cnName;
          }
          if (v.componentsModel['A001'].siteIds && v.componentsModel['A001'].siteIds.length > 0 && v.componentsModel['A001'].siteIds.includes(n.siteId)) {
            hasSiteIds.push(n.siteId);
          }
        });
        v.sitesList = sitesArr;
        if (hasSiteIds.length > 0) {
          v.$nextTick(() => {
            v.componentsModel['A001'].siteIds = hasSiteIds;
          });
        } else {
          v.componentsModel['A001'].siteIds = [];
        }
      } else {
        v.componentsModel['A001'].siteIds = [];
      }
      if (v.platformAccountList.length > 0) {
        let hasSaleAccountIds = []; // 还存在的账号
        v.platformAccountList.forEach(i => {
          if (v.componentsModel['A001'].saleAccountIds && v.componentsModel['A001'].saleAccountIds.length > 0 && v.componentsModel['A001'].saleAccountIds.includes(i.saleAccountId)) {
            hasSaleAccountIds.push(i.saleAccountId);
          }
        });
        if (hasSaleAccountIds.length > 0) {
          v.$nextTick(() => {
            v.componentsModel['A001'].saleAccountIds = hasSaleAccountIds;
          });
        } else {
          v.componentsModel['A001'].saleAccountIds = [];
        }
      } else {
        v.componentsModel['A001'].saleAccountIds = [];
      }
      v.componentsStatus['A001'].siteIds = true;
      v.componentsStatus['A001'].saleAccountIds = true;
    },
    getRuleCode (ruleCode, type) {
      let mapObj = {
        'A001': 'A001', // 订单来源
        'A002': 'A002',
        'A003': 'A003',
        'A004': 'A004',
        'A005': 'A005',
        'A006': 'A006',
        'A007': 'A007',
        'A008': 'A008',
        'A009': 'A009'
      };
      if (!type) {
        return mapObj[ruleCode];
      }
    },
    getContentSelectModal (val) { // 拼接内容
      let v = this;
      if (v.focusItem === null) { // 当前输入框
        return false;
      }
      let value = v.mesListData[v.focusItem].content || '';
      v.mesListData[v.focusItem].content = value + val;
    },
    addNewDelayedDelivery () { // 新增延迟发送
      let v = this;
      v.mesListData.push({
        day: 0,
        hour: 0,
        content: null,
        orderNo: v.mesListData.length
      });
    },
    getOptionalSelected (valueArr) { // 已选条件选择触发, valueArr包括所有已选条件
      let v = this;
      let arr = [];
      valueArr.forEach((n, i) => {
        arr.push(n.id);
      });
      v.rulesModel = arr;
    },
    processingRulesItemData (data) {
      let v = this;
      let platArr = [];
      let sitesArr = [];
      let accountArr = [];
      for (let i = 0; i < data.length; i++) { // 已选条件遍历
        let item = data[i];
        let rc = v.getRuleCode(item.ruleCode);// code
        for (let m = 0; m < v.optionalData.length; m++) { // 遍历该规则能设置的条件有哪些
          let rItem = v.optionalData[m];//
          if (rc === v.getRuleCode(rItem.id)) { // 匹配
            let obj = {
              ruleCode: rc,
              autoRuleParams: [],
              type: 1 // 不确定的值
            };
            for (let k = 0; k < rItem.items.length; k++) { // oItem 循环规则有的选项
              let oItem = rItem.items[k];
              let subObj = { // oItem规则分类名
                name: oItem.name
              };
              for (let b = 0; b < item.ruleItemParams.length; b++) {
                let bItem = item.ruleItemParams[b];
                if (bItem.name === oItem.name) { // 循环已保存规则并插入 ????
                  if (rc === 'A001') {
                    if (subObj.hasOwnProperty('autoRuleParamValues')) {
                      subObj.autoRuleParamValues.push(bItem.ruleItemParamValues);
                    } else {
                      subObj.autoRuleParamValues = bItem.ruleItemParamValues;
                    }
                  }
                }
                if (rc === 'A001' || rc === 'A007' || rc === 'A008' || rc === 'A009' || rc === 'A006') { // 订单来源处理
                  for (let c = 0; c < bItem.ruleItemParamValues.length; c++) { // 读取选项数据
                    let childItem = bItem.ruleItemParamValues[c];
                    v.componentsModel[rc][bItem.name] = [];
                    if (v.componentsModel[rc][bItem.name]) {
                      v.$nextTick(function () {
                        if (v.componentsModel[rc][bItem.name].indexOf(childItem.value) < 0) {
                          v.componentsModel[rc][bItem.name].push(childItem.value);
                        }
                      });
                    }
                    if (oItem.name === 'shippingMethodIds') {
                      v.shippingMethodKeys = v.componentsModel[rc][bItem.name];
                      v.getShippingMethodsName(v.shippingMethodKeys);
                    }
                    if (oItem.name === 'productCategories' && bItem.name === 'productCategories' && c === bItem.ruleItemParamValues.length - 1) {
                      let arr = [];
                      bItem.ruleItemParamValues.forEach((n, i) => {
                        arr.push(n.value);
                      });
                      v.getProductCategoryName(arr);
                    }
                    if (oItem.name === 'platformIds' && bItem.name === 'platformIds') {
                      v.componentsModel[rc][bItem.name] = [];
                      if (v.componentsModel[rc][bItem.name]) {
                        v.$nextTick(function () {
                          if (platArr.indexOf(childItem.value) < 0) {
                            platArr.push(childItem.value);
                            if (platArr.length === bItem.ruleItemParamValues.length) {
                              v.getPlatformName(platArr).then(res => {
                                let arr = [];
                                // let arrIds = [];
                                res.forEach((n, i) => {
                                  arr.push(n.name);
                                });
                                v.source[bItem.name] = arr;
                                v.componentsModel[rc][bItem.name] = platArr;
                              });
                            }
                          }
                        });
                      }
                    } else if (oItem.name === 'siteIds' && bItem.name === 'siteIds') {
                      v.componentsModel[rc][bItem.name] = [];
                      if (v.componentsModel[rc][bItem.name]) {
                        v.$nextTick(function () {
                          if (sitesArr.indexOf(childItem.value) < 0) {
                            sitesArr.push(childItem.value);
                            if (sitesArr.length === bItem.ruleItemParamValues.length) {
                              let obj = {
                                platformIds: platArr,
                                siteIds: sitesArr
                              };
                              v.getSitesName(obj).then(res => {
                                let arr = [];
                                // let arrIds = [];
                                res.forEach((n, i) => {
                                  if (n.cnName.indexOf(n.platformId < 0)) {
                                    arr.push(n.platformId + '-' + n.cnName);
                                  } else {
                                    arr.push(n.cnName);
                                  }
                                });
                                v.source[bItem.name] = arr;
                                v.componentsModel[rc][bItem.name] = sitesArr;
                              });
                            }
                          }
                        });
                      }
                    } else if (oItem.name === 'saleAccountIds' && bItem.name === 'saleAccountIds') {
                      v.componentsModel[rc][bItem.name] = [];
                      if (v.componentsModel[rc][bItem.name]) {
                        v.$nextTick(function () {
                          if (accountArr.indexOf(childItem.value) < 0) {
                            accountArr.push(childItem.value);
                            if (accountArr.length === bItem.ruleItemParamValues.length) {
                              let obj = {
                                platformIds: platArr,
                                saleAccountIds: accountArr
                              };
                              v.getSalesAccountName(obj).then(res => {
                                let arr = [];
                                let arrIds = [];
                                res.forEach((n, i) => {
                                  arr.push(n.accountCode);
                                  arrIds.push(n.saleAccountId);
                                });
                                v.source[bItem.name] = arr;
                                v.componentsModel[rc][bItem.name] = accountArr;
                              });
                            }
                          }
                        });
                      }
                    }
                  }
                } else if (rc === 'A002') {
                  if (bItem.name === 'shipmentTypes' && oItem.name === 'shipmentTypes') {
                    let val = bItem.ruleItemParamValues;
                    let arr = [];
                    let tagArr = [];
                    val.forEach((n, i) => {
                      arr.push(n.value);
                      let pre = n.value.split(':')[0];
                      let des = n.value.split(':')[2];
                      tagArr.push(pre + ':' + des);
                    });
                    v.shipmentCheckBoxModel = arr;
                    v.shipmentTagModel = tagArr;
                  }
                } else if (rc === 'A004') {
                  let val = bItem.ruleItemParamValues;
                  let arr = [];
                  let originArr = [];
                  val.forEach((n, i) => {
                    originArr.push(n.value);
                    if (n.value.indexOf('.') > 0 && n.value.split('.')[0] !== n.value.split('.')[1]) {
                      arr.push(n.value.split('.')[1]);
                    } else {
                      arr.push(n.value);
                    }
                  });
                  v.treeArr = val;
                  v.componentsModel[rc]['countryCodes'] = originArr;
                  v.getCommonCountryName(val);
                } else if (rc === 'A005') {
                  if (bItem.name === 'warehouseIds' && oItem.name === 'warehouseIds') {
                    let arr = [];
                    let arrIds = [];
                    if (v.allStorelist.length > 0) {
                      v.allStorelist.forEach((n, i) => {
                        bItem.ruleItemParamValues.forEach((m, t) => {
                          if (n.warehouseId === m.value) {
                            arr.push(n.warehouseName);
                            arrIds.push(m.value);
                          }
                        });
                      });
                      v.warehouseIdsName = arr;
                      v.componentsModel[rc][bItem.name] = arrIds;
                    } else {
                      v.getAllstore(0, 1).then(res => {
                        if (res) {
                          v.allStorelist.forEach((n, i) => {
                            bItem.ruleItemParamValues.forEach((m, t) => {
                              if (n.warehouseId === m.value) {
                                arr.push(n.warehouseName);
                                arrIds.push(m.value);
                              }
                            });
                          });
                          v.warehouseIdsName = arr;
                          v.componentsModel[rc][bItem.name] = arrIds;
                        }
                      });
                    }
                  }
                } else {
                  v.componentsModel[rc][bItem.name] = bItem.value;
                }
              }
              obj.autoRuleParams.push(subObj);
            }
            v.autoRuleItems.push(obj);// 插入已勾选的的内容，保存时用
            v.rulesModel.push(rc);// 插入右侧的状态
          }
        }
      }
    },
    getRulesDetails () { // 已选条件加载
      let v = this;
      v.axios.get(api.get_autoSendMessageAutoRuleDetails + v.ruleParmas.autoRuleId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let rules = data.rules;
          let ruleAction = data.ruleAction;// 站内信内容
          let ruleItems = data.ruleItems;// 已选条件
          let triggerAction = v.triggerAction;
          if (v.ruleParmas && v.ruleParmas.autoRuleId) {
            triggerAction = ruleAction.triggerValue;
            v.triggerAction = ruleAction.triggerValue;
            let actions = ruleAction.actions;
            if (actions && actions.length > 0) { // 站内信内容加载
              v.mesListData = actions;
            }
            v.ruleName = data.selectedRule.name;
          }
          if (v.viewStatus === 'view') {
            rules.forEach((n, i) => {
              n._disabled = true;
              ruleItems.forEach((m, t) => {
                if (n.id === m.ruleCode) {
                  n._checked = true;
                }
              });
            });
          } else if (triggerAction === '0A' || triggerAction === '0B' || triggerAction === '0R') {
            rules.forEach((n, i) => {
              if (i > 3) {
                n._disabled = true;
              } else {
                if (ruleItems) {
                  ruleItems.forEach((m, t) => {
                    if (n.id === m.ruleCode) {
                      n._checked = true;
                    }
                  });
                }
              }
            });
          } else {
            rules.forEach((n, i) => {
              n._disabled = false;
              if (ruleItems) {
                ruleItems.forEach((m, t) => {
                  if (n.id === m.ruleCode) {
                    n._checked = true;
                  }
                });
              }
            });
          }
          v.optionalData = rules;
          v.$nextTick(function () {
            if (v.ruleParmas && v.ruleParmas.autoRuleId) {
              v.processingRulesItemData(ruleItems);
              v.resetSpinShow();
            } else {
              v.resetSpinShow();
            }
          });
        } else {
          v.resetSpinShow();
        }
      }).catch(() => {
        v.resetSpinShow();
      });
    },
    getSite (val) { // 获取站点
      let v = this;
      v.shipmentPlatformSiteList = [];
      v.shipmentPlatformSite = '';
      v.shipmentSearchValue = '';
      for (let i = 0; i < v.shipmentPlatformList.length; i++) {
        let item = v.shipmentPlatformList[i];
        if (item.platformId === val && item.sites.length > 0) {
          v.hasSite = true;
          v.getSmShippingMethod(val, item.sites[0].siteId);
          v.$nextTick(function () {
            v.shipmentPlatformSiteList = item.sites;
            v.shipmentPlatformSite = item.sites[0].siteId;
          });
        } else if (item.platformId === val && item.sites.length === 0) {
          v.hasSite = false;
          v.shipmentPlatformSiteList = [];
          v.getSmShippingMethod(val);
        }
      }
    },
    shipmentSearch () {
      let v = this;
      v.getSmShippingMethod(v.shipmentPlatformModel, v.shipmentPlatformSite, v.shipmentSearchValue);
    },
    setSite (val) {
      this.getSmShippingMethod(this.shipmentPlatformModel, val);
    },
    getSmShippingMethod (platformId, siteId) {
      let v = this;
      let params = '?platformId=' + platformId;
      if (siteId) {
        params = params + '&siteId=' + siteId;
      }
      params = params + '&search=' + v.shipmentSearchValue;
      v.axios.get(api.get_queryShippingMethod + params).then(response => {
        if (response.data.code === 0) {
          v.smShippingMethodList = response.data.datas;
        }
      });
    },
    setTagValue (checkboxArr) { // 运输类型产生tag
      let v = this;
      let arr = [];
      for (let i = 0; i < checkboxArr.length; i++) {
        let prefix = checkboxArr[i].split(':')[0];
        let item = checkboxArr[i].split(':')[1].split(':')[0];
        for (let t = 0; t < v.smShippingMethodList.length; t++) {
          let subItem = v.smShippingMethodList[t];
          if (item === subItem.shippingMethodName) {
            arr.push(prefix + ':' + subItem.shippingMethodDescription);
          }
          if (i === checkboxArr.length - 1 && t === v.smShippingMethodList.length - 1) {
            v.shipmentTagModel = arr;
          }
        }
      }
    },
    getTreeData (val) {
      let v = this;
      let nodesArr = v.$refs['treeDataRef'].getCheckedNodes();
      let arr = [];
      nodesArr.forEach((n, i) => {
        if (n.hasOwnProperty('zoneCode')) {
          arr.push(n.zoneCode);
        }
      });
      v.componentsModel['A004'].countryCodes = arr;
    },
    getCommonCountryName (selectArr) { // 获取对应国家名字
      let v = this;
      if (!selectArr || selectArr.length === 0) return false;
      return new Promise(resolve => {
        if (sessionStorage.getItem('countryData') && JSON.parse(sessionStorage.getItem('countryData')).length > 0) {
          makeTreeName(JSON.parse(sessionStorage.getItem('countryData')));
        } else {
          v.axios.get(api.erpServiceCommon + api.commonService + api.get_commonCountry).then(response => {
            if (response.data.code === 0) {
              const data = response.data.datas;
              sessionStorage.setItem('countryData', JSON.stringify(data));
              makeTreeName(data);
            }
          });
        }

        function makeTreeName (data) {
          let arr = [];
          data.forEach((n, i) => {
            selectArr.forEach((k, g) => {
              k = k.value;
              if (k.indexOf('.') > 0) {
                if (n.zoneCode === k.split('.')[0]) {
                  if (n.countries && n.countries.length > 0) {
                    n.countries.forEach((g, l) => {
                      if (k.split('.')[1] === g.twoCode) {
                        arr.push(g.cnName);
                      }
                    });
                  }
                }
              } else {
                if (k === n.zoneCode) {
                  arr.push(n.zoneCnName);
                }
              }
            });
          });
          v.countryCodesName = arr.toString();
        }
      });
    },
    getCommonCountry (selectArr) { // 国家 树
      let v = this;
      return new Promise(resolve => {
        if (sessionStorage.getItem('countryData') && JSON.parse(sessionStorage.getItem('countryData')).length > 0) {
          makeTree(JSON.parse(sessionStorage.getItem('countryData')));
        } else {
          v.axios.get(api.erpServiceCommon + api.commonService + api.get_commonCountry).then(response => {
            if (response.data.code === 0) {
              const data = response.data.datas;
              localStorage.setItem('countryData', JSON.stringify(data));
              makeTree(data);
            }
          });
        }

        function makeTree (data) {
          if (!selectArr) selectArr = [];
          let arr = [
            {
              title: '全部',
              check: false,
              expand: true,
              children: []
            }
          ];
          data.forEach((n, i) => {
            let checked = false;
            selectArr.forEach((k, g) => {
              k = k.value;
              if (k === n.zoneCode) {
                checked = true;
              }
            });
            let obj = {
              title: n.zoneCnName,
              expand: false,
              checked: checked,
              zoneCode: n.zoneCode,
              children: []
            };
            if (n.countries.length > 1) {
              n.countries.forEach((m, t) => {
                let checked = false;
                selectArr.forEach((k, g) => {
                  k = k.value;
                  if (k.indexOf('.') > 0) {
                    if (m.hasOwnProperty('twoCode') && k.split('.')[1] === m.twoCode) {
                      checked = true;
                    }
                  }
                });
                let subObj = {
                  title: m.cnName,
                  expand: false,
                  checked: checked,
                  zoneCode: n.zoneCode + '.' + m.twoCode,
                  children: []
                };
                obj.children.push(subObj);
              });
            } else if (n.countries.length === 1) {
              n.countries.forEach(i => {
                selectArr.forEach(j => {
                  if (i.zoneCode + '.' + i.zoneCode === j.value) {
                    obj.checked = true;
                  }
                });
              });
              obj.zoneCode = n.zoneCode + '.' + n.countries[0].twoCode;
            }
            arr[0].children.push(obj);
          });
          v.$nextTick(function () {
            v.countryData = arr;
            resolve(true);
          });
        }
      });
    },
    getProductTags () { // 获取商品标签
      let v = this;
      return new Promise(resolve => {
        v.axios.get(api.erpServiceCommon + api.get_label).then(response => {
          if (response.data.code === 0) {
            v.productTagList = response.data.datas;
            resolve(true);
          }
        });
      });
    },
    filterMethod (data, query) {
      return data.label.indexOf(query) > -1;
    },
    getShippingMethodsName (newTargetKeys) {
      let v = this;
      v.getEnableCarrierShipping().then(result => {
        if (result) {
          let arr = [];
          newTargetKeys.forEach((n, i) => {
            v.shippingMethodIdsData.forEach((m, t) => {
              if (n === m.shippingMethodId) {
                arr.push(m.label);
              }
            });
          });
          v.shippingMethodIds = arr;
        }
      });
    },
    shippingMethodChange (newTargetKeys, direction, moveKeys) {
      let v = this;
      v.shippingMethodKeys = newTargetKeys;
      v.componentsModel['A006'].shippingMethodIds = newTargetKeys;
      let arr = [];
      newTargetKeys.forEach((n, i) => {
        v.shippingMethodIdsData.forEach((m, t) => {
          if (n === m.shippingMethodId) {
            arr.push(m.label);
          }
        });
      });
      v.shippingMethodIds = arr;
    },
    getEnableCarrierShipping () { // 获取邮寄方式列表
      let v = this;
      return new Promise(resolve => {
        const obj = {
          url: api.get_queryAllEnableCarrierShipping,
          type: 'GET'
        };
        v.ajaxData(obj).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            // let arr = [];
            data.forEach((n, i) => {
              n.label = n.carrierName + ' > ' + n.carrierShippingMethodName;
              n.key = n.shippingMethodId;
            });
            v.shippingMethodIdsData = data;
            resolve(true);
          }
        });
      });
    },
    getProductCategory () { // 获取商品分类
      let v = this;
      return new Promise(resolve => {
        v.axios.get(api.erpServiceCommon + api.get_productCategory, { hiddenError: true }).then(response => {
          if (response.data.code === 0) {
            v.productCategoryList = response.data.datas;
            resolve(true);
          }
        });
      });
    },
    getProductCategoryName (idArr) {
      let v = this;
      let arr = [];
      if (!idArr || idArr.length === 0) {
        return false;
      }
      v.getProductCategory().then(result => {
        if (result) {
          v.productCategoryList.forEach((n, i) => {
            idArr.forEach((m, t) => {
              if (m === n.productCategoryId) {
                arr.push(n.cnName);
              }
            });
          });
          v.productCategoryListName = arr.toString();
        }
      });
    },
    concatSku (arr) {
      let v = this;
      v.componentsModel['A009'].skus = arr;
    }
  },
  mounted () {
    let v = this;
    v.$watch(function () {
      return v.componentsModel['A001'].platformIds;
    }, function (n, o) {
      if (JSON.stringify(n) !== JSON.stringify(o)) {
        // v.componentsModel['A001'].siteIds = [];
        // v.componentsModel['A001'].saleAccountIds = [];
        v.sitesList = [];
        v.$nextTick(function () {
          if (v.shipmentPlatformList.length > 0) {
            v.getShimentSites(n);
          }
        });
      }
    }, {
      immediate: true,
      deep: true
    });
  }
};
</script >
