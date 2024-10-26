<style>
.wayBillStatusError .ivu-tooltip-inner {
  white-space: normal;
  word-wrap: break-word;
}
</style>
<template>
  <div>
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <Form ref="pageParams" :model="pageParams" :label-width="70">
            <div class="platformParamsSelectTwo">
              <div class="filterItem">
                <FormItem label="状态">
                  <Button-group>
                    <template v-for="(item, index) in statusList">
                      <Button v-if="item.selected" type="primary" @click="selectStatus(index,item.status)" :key="item.status">{{ item.title }} </Button>
                      <Button v-if="!item.selected" @click="selectStatus(index,item.status)" :key="item.status">{{ item.title }} </Button>
                    </template>
                  </Button-group>
                </FormItem>
              </div>
              <div class="filterItem">
                <FormItem label="申报">
                  <Button-group>
                    <template v-for="(item, index) in declareList">
                      <Button v-if="item.selected" type="primary" @click="selectDeclare(index,item.status)" :key="index">{{ item.title }} </Button>
                      <Button v-if="!item.selected" @click="selectDeclare(index,item.status)" :key="index">{{ item.title }} </Button>
                    </template>
                  </Button-group>
                </FormItem>
              </div>
              <div class="filterItem">
                <FormItem label="物流方式">
                  <Cascader transfer v-model="shippingMethodModel" :load-data="loadData" @on-visible-change="showShippingData" @on-change="changeShippingMethod" :data="shippingMethodData" filterable></Cascader>
                </FormItem>
              </div>
              <div class="filterItem" :class="{none : !moreFilter}">
                <FormItem label="平台">
                  <dyt-select v-model="platformId" @on-change="changeValue">
                    <Option v-for="item in platformArr" :key="item.platformId" :label="item.title" :value="item.platformId"></Option>
                  </dyt-select>
                </FormItem>
              </div>
            </div>
            <div class="platformParamsMoreSection" :class="{none : !moreFilter}">
              <Row>
                <Col :span="5">
                <Form-item label="国家/地区" prop="buyerCountryCodeList">
                  <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" filterable multiple placeholder="请选择或输入所在地">
                    <Option v-for="(item,index) in formValidate.country" :key="index" :value="item.twoCode">{{ item.enName }}</Option>
                  </dyt-select>
                </Form-item>
                </Col>
                <Col :span="5" :offset="1">
                <Form-item label="付款时间">
                  <Date-picker transfer style="width:100%" type="datetimerange" @on-clear="resetDate" @on-change="getDateValue" :clearable="clearAble" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end" placeholder="选择日期" :value="payTimeArr"></Date-picker>
                </Form-item>
                </Col>
                <Col :span="5" :offset="1">
                <Form-item label="订单号" prop="orderNo">
                  <Input placeholder="请输入订单号,多个订单号用逗号或回车分隔" type="textarea" v-model.trim="pageParams.orderNo"></Input>
                </Form-item>
                </Col>
                <Col :span="5" :offset="1">
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
                <Form-item label="SKU" prop="sku">
                  <Input placeholder="请输入SKU" v-model.trim="pageParams.sku"></Input>
                </Form-item>
                </Col>
              </Row>
            </div>
            <div class="platformSearch clear" v-if="!moreFilter">
              <Row>
                <Col :lg="oneItemLg" :md="oneItemMd">
                <div class="filterItem">
                  <Form-item label="搜索字符" prop="searchValue">
                    <Input type="textarea" placeholder="可输入订单号、包裹号、买家ID、买家姓名、SKU、平台产品编码" v-model.trim="pageParams.searchValue">
                    </Input>
                  </Form-item>
                </div>
                </Col>
              </Row>
            </div>
            <div class="filterItem filterConfirm" :class="{normalTop : moreFilter}">
              <Button type="primary" @click="search" size="small" :disabled="SearchDisabled" icon="md-search">查询 </Button>
              <Button @click="reset" size="small" v-once icon="md-refresh">重置 </Button>
            </div>
          </Form>
          <div class="moreFilter">
            <Button size="small" @click="toggleMoreFilter">
              {{ moreFilterMes }}
              <Icon :type="moreFilterIcon" size="small"></Icon>
            </Button>
          </div>
        </div>
      </div>
    </div>
    <div class="dataSort">
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
    <div class="tableControl" v-if="tableControlStatus">
      <Buttons type="primary" style="margin-left: 20px" trigger="click" @on-click="applyForWayBillHasCondition">
        <Button type="primary" class="iconbuttons" @click="applyForWayBill">
          <Icon type="document-text"></Icon>
          申请运单
        </Button>
        <Buttons-menu slot="list">
          <Buttons-item name="1">申请运单（所有结果集）</Buttons-item>
        </Buttons-menu>
      </Buttons>
      <Buttons type="primary" style="margin-left: 20px" trigger="click" @on-click="fillInTheDeclarationHasCondition">
        <Button type="primary" class="iconbuttons" @click="fillInTheDeclaration">
          <span class="icon iconfont icon-tianxie"></span> 填写申报 </Button>
        <Buttons-menu slot="list">
          <Buttons-item name="1">填写申报（所有结果集）</Buttons-item>
        </Buttons-menu>
      </Buttons>
      <!-- <Buttons type="primary" style="margin-left: 20px" trigger="click" @on-click="changeShippingMethodButtonCondition">
        <Button type="primary" class="iconbuttons" @click="changeShippingMethodButton">
          <span class="icon iconfont icon-genghuan"></span>
          更换物流方式
        </Button>
        <Buttons-menu slot="list">
          <Buttons-item name="1">更换物流方式（所有结果集）</Buttons-item>
        </Buttons-menu>
      </Buttons> -->
    </div>
    <div class="orderTable normalTop">
      <keep-alive>
        <Table highlight-row border :loading="tableLoading" ref="selection" :height="tableHeight" :columns="orderColumn" :data="pendingData" @on-selection-change="getSelectValue"></Table>
      </keep-alive>
      <div class="table-page">
        <div class="table-page-right">
          <keep-alive>
            <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
          </keep-alive>
        </div>
      </div>
    </div>
    <!-- 包裹详情 -->
    <keep-alive>
      <sliderModal v-model="packageModel" :spinShow="spinShow" :styles="{}" class="slider-model" v-if="packageDetailsStatus">
        <packageDetails :packageId="packageId" :storeList="storeListDal" @spinLoading="spinLoading" @updateList="getList" @resetSpinShow="resetSpinShow" :timestamp="timestamp"></packageDetails>
      </sliderModal>
    </keep-alive>
    <!-- 填写申报 -->
    <Modal v-model="fillInDeclare" width="600" :mask-closable="maskClosable" :loading="declareModalLoading" v-if="fillInDeclareStatus" @on-ok="saveDeclare" @on-cancel="closeDeclare">
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-head">
          <div class="ivu-modal-confirm-head-title">{{ fillInDeclareModel.title }}</div>
        </div>
        <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
          <div style="margin-top:10px" v-if="fillInDeclareModel.type == 'all'">
            <Row>
              <Col :span="1">
              <Icon type="md-information-circle" color="#2b85e4" size="44"></Icon>
              </Col>
              <Col :span="21" :offset="2">
              <p style="line-height:36px"></p>所有结果集填写申报，系统将符合您当前查询条件的所有订单填写下方的申报信息，如果之前已经存在申报信息，则会被覆盖。
              </Col>
            </Row>
          </div>
          <div class="clear">
            <Poptip placement="bottom-end" width="400" class="fr">
              <Button>
                常用申报信息
                <Icon type="md-arrow-round-down"></Icon>
              </Button>
              <div slot="content" style="max-height:300px; overflow:auto">
                <Row>
                  <Col :span="12">
                  <Input v-model="declareModel.searchValue" placeholder="输入进行筛选" @on-enter="searchDecalre">
                  <Button slot="append" icon="ios-search" @click="searchDecalre"></Button>
                  </Input>
                  </Col>
                </Row>
                <div class="normalTop">
                  <Table :data="commonDecalreData" @on-row-click="addCommonDeclare" :show-header="declareHeader" highlight-row border :loading="tableLoading" :columns="commonDeclareColumns"></Table>
                </div>
              </div>
            </Poptip>
          </div>
          <div class="normalTop">
            <Form ref="declarePageParams" :model="declarePageParams" :rules="ruleValidate" :label-width="80">
              <Row>
                <Col :span="12">
                <FormItem label="中文申报名" prop="goodsNameCn">
                  <Input v-model="declarePageParams.goodsNameCn" :maxlength="200"></Input>
                </FormItem>
                </Col>
                <Col :span="11" :offset="1">
                <FormItem label="英文申报名" prop="goodsNameEn">
                  <Input v-model="declarePageParams.goodsNameEn" :maxlength="200"></Input>
                </FormItem>
                </Col>
              </Row>
              <Row>
                <Col :span="12">
                <FormItem label="重量（单个）" prop="unitWeight">
                  <Input v-model="declarePageParams.unitWeight"></Input>
                </FormItem>
                </Col>
                <Col :span="11" :offset="1">
                <FormItem label="价值（单个）" prop="unitPrice">
                  <Input v-model="declarePageParams.unitPrice"> <dyt-select v-model="declarePageParams.declareCurrency" slot="append" style="width: 70px">
                    <Option value="USD">USD</Option>
                  </dyt-select> </Input>
                </FormItem>
                </Col>
              </Row>
              <Row>
                <Col :span="12">
                <FormItem label="海关编码" prop="hsCode">
                  <Input v-model="declarePageParams.hsCode" :maxlength="30"></Input>
                </FormItem>
                </Col>
                <Col :span="6" :offset="1">
                <FormItem label="申报数量" prop="quantity">
                  <Input v-model="declarePageParams.quantity"></Input>
                </FormItem>
                </Col>
                <Col :span="4" :offset="1">
                <Button @click="handleSubmit('declarePageParams')">添加</Button>
                </Col>
              </Row>
              <Table :data="decalreData" highlight-row border :columns="declareColumns"></Table>
            </Form>
          </div>
        </div>
      </div>
    </Modal>
    <!-- 更换物流方式 -->
    <Modal v-model="setMatchStatusModel" width="600" :mask-closable="false" v-if="setMatchStatus" @on-ok="setShippingMethod" @on-cancel="resetShippingMethod">
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-head">
          <div class="ivu-modal-confirm-head-title">{{ changeShippingMehotdModel.title }}</div>
        </div>
        <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
          <div style="margin-top:10px">
            <Row>
              <Col :span="1">
              <Icon type="md-information-circle" color="#2b85e4" size="44"></Icon>
              </Col>
              <Col :span="21" :offset="2">
              <p style="line-height:36px"></p>{{ changeShippingMehotdModel.content }}
              </Col>
            </Row>
            <Form class="setAllMarkRead" style="margin-top:10px">
              <Row>
                <Col :span="14">
                <Form-item label="实际发货物流方式：" :label-width="120">
                  <Cascader :data="shippingMethodData" @on-visible-change="showShippingData" v-model="value2" :load-data="loadData" @on-change="getAccount1" transfer></Cascader>
                </Form-item>
                </Col>
                <Col :span="9" :offset="1">
                <Form-item label="帐号：" :label-width="60">
                  <dyt-select v-model="shippingAccountModel">
                    <Option v-for="(item, index) in carrierAccount" v-if="item.carrierAccountId !== null" :key="index" :value="item.carrierAccountId">{{ item.account }}</Option>
                  </dyt-select>
                </Form-item>
                </Col>
              </Row>
            </Form>
            <div class="matchLogisticSetting">
              <h6>物流相关设置</h6>
            </div>
            <Form class="setAllMarkRead white-space-nowrap-form" style="margin-top:10px" v-if="shippingMethodModel1.length > 0">
              <Row>
                <Col :span="12" v-for="(item,index) in carrierBaseSetting" :key="index">
                <Form-item :label="item.paramName" :label-width="100">
                  <Radio-group v-model="shippingMethodModel1[index].paramValue" :value="item.paramValue " v-if="item.paramType == 'radio'">
                    <Radio :label="sItem.itemValue" v-for="(sItem,n) in item.dictionarys" :key="n">
                      <span>{{ sItem.itemName }}</span>
                    </Radio>
                  </Radio-group>
                  <Input v-if="item.paramType == 'input'" v-for="(sItem,n) in item.dictionarys" :key="n" v-model="shippingMethodModel1[index].value" :value="sItem.itemValue "></Input>
                  <Checkbox-group v-model="shippingMethodModel1[index].paramValue" v-if="item.paramType == 'checkbox'">
                    <Checkbox v-for="(sItem,n) in item.dictionarys" :key="n" :label="sItem.itemValue">
                      <span>{{ sItem.itemName }}</span>
                    </Checkbox>
                  </Checkbox-group>
                  <dyt-select v-if="item.paramType == 'select'" v-model="shippingMethodModel1[index].paramValue">
                    <Option v-for="(sItem,n) in item.dictionarys" :key="n" :value="sItem.itemValue"> {{ sItem.itemName }}</Option>
                  </dyt-select>
                </Form-item>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import packageDetails from './packageDetails';
import deliveryMixin from '@/components/mixin/delivery_mixin';

export default {
  mixins: [Mixin, deliveryMixin],
  components: {
    packageDetails
  },
  props: ['choiceStore', 'storeListDal'], // 选中仓库
  data () {
    let self = this;
    const vaildChinese = (rule, value, callback) => {
      var reg = self.$regular.MatchChinese;
      if (value === '' || value === null) {
        callback(new Error('内容不能为空'));
      } else if (!reg.test(value)) {
        callback(new Error('只允许输入中文'));
      } else {
        callback();
      }
    };
    const vaildEnglish = (rule, value, callback) => {
      var reg = self.$regular.MatchEnglish;
      if (value === '' || value === null) {
        callback(new Error('内容不能为空'));
      } else if (!reg.test(value)) {
        callback(new Error('只允许输入英文'));
      } else {
        callback();
      }
    };
    const validNum = (rule, value, callback) => {
      var reg = self.$regular.AllNumber;
      if (value === '' || value === null) {
        callback(new Error('内容不能为空'));
      } else if (!reg.test(value)) {
        callback(new Error('只允许数字'));
      } else {
        callback();
      }
    };
    const validatePrice = (rule, value, callback) => {
      let priceReg = self.$regular.hasPriceNum;
      if (!priceReg.test(value)) {
        callback(new Error('价格必须为数字,且最多允许两位小数'));
      } else {
        callback();
      }
    };
    return {
      tableControlStatus: true,
      shopList: [],
      platformArr: [
        {
          platformId: '全部',
          title: '全部'
        }, {
          platformId: 'ebay',
          title: 'ebay'
        }
      ], // 详情参数 Start
      packageModel: false,
      packageDetailsStatus: true,
      packageId: null,
      timestamp: null, // 更换物流方式 Start
      shippingMethodModel1: [],
      maskClosable: false,
      setMatchStatus: false,
      setMatchStatusModel: false,
      changeShippingMehotdModel: {
        type: '',
        title: '',
        content: ''
      },
      value2: [], // 物流[mcarrierID,merchantShippingMethodId]
      carrierAccount: [], // 对应物流账号
      carrierBaseSetting: [], // 物流参数配置
      // End
      declareModalLoading: true,
      commonDecalreData: [],
      decalreData: [],
      declareHeader: false,
      commonDeclareColumns: [
        {
          title: '中/英文申报名',
          key: 'name',
          width: 120,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('div', {
                class: 'blueColor'
              }, params.row.goodsNameCn), h('div', {
                class: 'redColor'
              }, params.row.goodsNameEn)
            ]);
          }
        }, {
          title: '申报价值（单个）',
          align: 'center',
          key: 'unitPrice'
        }, {
          title: '申报重量（单个）g',
          align: 'center',
          key: 'unitWeight'
        }, {
          title: '海关编码',
          align: 'center',
          key: 'hsCode'
        }
      ],
      ruleValidate: {
        goodsNameCn: [
          {
            validator: vaildChinese,
            trigger: 'blur'
          }
        ],
        goodsNameEn: [
          {
            validator: vaildEnglish,
            trigger: 'blur'
          }
        ],
        unitWeight: [
          {
            validator: validNum,
            trigger: 'blur'
          }
        ],
        unitPrice: [
          {
            validator: validatePrice,
            trigger: 'blur'
          }
        ],
        hsCode: [
          {
            validator: validNum,
            trigger: 'blur'
          }
        ],
        quantity: [
          {
            validator: validNum,
            trigger: 'blur'
          }
        ]
      },
      declareColumns: [
        {
          title: '中/英文申报名',
          key: 'name',
          width: 120,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('div', {
                class: 'blueColor'
              }, params.row.goodsNameCn), h('div', {
                class: 'redColor'
              }, params.row.goodsNameEn)
            ]);
          }
        }, {
          title: '申报价值（单个）',
          align: 'center',
          key: 'unitPrice'
        }, {
          title: '申报重量（单个）g',
          align: 'center',
          key: 'unitWeight'
        }, {
          title: '海关编码',
          align: 'center',
          key: 'hsCode'
        }, {
          title: '申报数量',
          align: 'center',
          key: 'declareCurrency',
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                value: self.decalreData[params.index].quantity,
                precision: 0
              },
              on: {
                input: val => {
                  self.decalreData[params.index].quantity = val;
                },
                blur: val => {
                  let reg = self.$regular.AllNumber;
                  if (reg.test(val)) {
                    self.$Message.error('输入格式有误');
                    self.decalreData[params.index].quantity = 0;
                  }
                }
              }
            });
          }
        }, {
          title: '操作',
          key: 'operation',
          align: 'center',
          render: (h, params) => {
            return h('span', {
              class: 'icon iconfont icon-closecircled',
              style: {
                color: '#f00',
                cursor: 'pointer',
                fontSize: '24px'
              },
              on: {
                click: () => {
                  self.delDeclare(params.index);
                }
              }
            });
          }
        }
      ],
      declarePageParams: {
        goodsNameCn: null,
        goodsNameEn: null,
        unitWeight: null,
        unitPrice: null,
        hsCode: null,
        quantity: null,
        declareCurrency: 'USD'
      },
      fillInDeclare: false,
      fillInDeclareStatus: false,
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      fillInDeclareModel: {
        type: null,
        title: '',
        pid: null
      },
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
      packageIds: [],
      orderColumn: [
        {
          type: 'selection',
          width: 60,
          fixed: 'left',
          align: 'center'
        }, {
          title: '包裹号',
          key: 'packageCode',
          fixed: 'left',
          align: 'center',
          width: 140,
          render: (h, params) => {
            return h('span', {
              class: 'blueColor cursor underline',
              on: {
                click: () => {
                  self.showPackageDetails(params.row.packageId);
                }
              }
            }, params.row.packageCode);
          }
        }, {
          title: '订单号',
          key: 'salesRecordNumber',
          align: 'center',
          width: 140,
          render: (h, params) => {
            let pos = [];
            if (params.row.packageOrderBoList !== null) {
              for (let i = 0; i < params.row.packageOrderBoList.length; i++) {
                let n = params.row.packageOrderBoList[i];
                pos.push(h('div', params.row.accountCode + '-' + n.salesRecordNumber));
              }
              return h('div', pos);
            }
          }
        }, {
          title: '买家ID/姓名',
          key: 'buyerName',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            return h('div', [
              h('div', { class: 'blueColor' }, params.row.buyerAccountId),
              h('div', { class: 'redColor' }, params.row.buyerName)
            ]);
          }
        }, {
          title: '国家/地区',
          key: 'buyerCountryCodeList',
          align: 'center',
          width: 100
        }, {
          title: '物流方式',
          key: 'merchantShippingMethodId',
          align: 'center',
          minWidth: 200,
          render: (h, params) => {
            if (params.row.carrierName === null || params.row.carrierName === '') {
              return '';
            } else {
              return h('div', params.row.carrierName + ' > ' + params.row.carrierShippingMethodName);
            }
          }
        }, {
          title: 'SKU数量',
          key: 'skuQuantity',
          align: 'center',
          width: 100
        }, {
          title: '物品数量',
          key: 'productQuantity',
          align: 'center',
          width: 100
        }, {
          title: '付款时间',
          minWidth: 160,
          align: 'center',
          key: 'payTime',
          render: (h, params) => {
            return h('span', self.getDataToLocalTime(params.row.payTime, 'fulltime'));
          }
        }, {
          title: '状态',
          key: 'trackingNumberStatus',
          width: 100,
          align: 'center',
          render: (h, params) => {
            let d = params.row.trackingNumberStatus;
            let text = '申请失败';
            let icon = 'icon iconfont icon-weijiuxu';
            let iconColor = '#ff3300';
            let reason = params.row.trackingNumberFailReason;
            if (d === 1) {
              text = '待申请';
              icon = 'icon iconfont icon-weijiuxu';
              iconColor = '#444';
            } else if (d === 2) {
              text = '申请中';
              icon = 'icon iconfont icon-shenqingzhong';
              iconColor = '#f00';
            } else if (d === 3) {
              text = '申请成功';
              icon = 'icon iconfont icon-shenqingchenggong';
              iconColor = '#f00';
            }
            if (d === 4) {
              return h('Tooltip', {
                style: {
                  textAlign: 'center',
                  color: iconColor
                },
                class: 'wayBillStatusError',
                props: {
                  content: reason
                }
              }, [
                h('div', [
                  h('span', {
                    class: icon
                  }), h('div', text)
                ])
              ]);
            } else {
              return h('div', {
                style: {
                  textAlign: 'center',
                  color: iconColor
                }
              }, [
                h('div', [
                  h('span', {
                    class: icon
                  }), h('div', text)
                ])
              ]);
            }
          }
        }, {
          title: '操作',
          key: 'operate',
          width: 160,
          align: 'center',
          fixed: 'right',
          render: (h, params) => {
            let placement = 'bottom';
            if (self.pendingData && self.pendingData.length > 4 && params.index === self.pendingData.length - 1) {
              placement = 'top';
            }
            if (params.row !== undefined && self.pageParams.trackingNumberStatus === 1) {
              return h('div', [
                h('Buttons', {
                  props: {
                    trigger: 'click',
                    transfer: true,
                    placement: placement
                  },
                  class: 'defaultStyle',
                  on: {
                    'on-click': value => {
                      if (value === '1') {
                        self.applyForWayBill('single', params.row.packageId);
                      } else {
                        self.fillInTheDeclaration('single', params.row.packageId);
                      }
                    }
                  }
                }, [
                  h('Button', {
                    type: 'default',
                    class: 'iconbuttons',
                    on: {
                      click: () => {
                        self.showPackageDetails(params.row.packageId);
                      }
                    }
                  }, [
                    h('span', {
                      class: 'icon iconfont icon-chakan'
                    }), h('span', '查看包裹详情')
                  ]), h('Buttons-menu', {
                    slot: 'list'
                  }, [
                    h('Buttons-item', {
                      props: {
                        name: '1'
                      }
                    }, '申请运单'), h('Buttons-item', {
                      props: {
                        name: '2'
                      }
                    }, '填写申报')
                  ])
                ])
              ]);
            } else if (self.pageParams.trackingNumberStatus !== 1) {
              return h('Button', {
                on: {
                  click: () => {
                    self.showPackageDetails(params.row.packageId);
                  }
                }
              }, '查看包裹详情');
            }
          }
        }
      ],
      pendingData: [],
      payTimeArr: [],
      clearAble: true,
      resetStatus: true,
      pageParamsPrototype: null, // 重置查询条件
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        platformId: null,
        saleAccountIds: [],
        trackingNumberStatus: 1,
        buyerCountryCodeList: [],
        merchantCarrierId: null,
        merchantShippingMethodId: null,
        buyerAccountId: null,
        buyerName: null,
        webstoreItemId: null,
        sku: null,
        payStartTime: null,
        payEndTime: null,
        orderNo: null,
        declarationStatus: null,
        orderBy: 'payTime',
        upDown: 'up',
        searchValue: null, // 搜索内容
        warehouseId: self.choiceStore // 仓库
      },
      statusList: [
        {
          selected: true,
          status: 1,
          title: '未申请及申请失败'
        }, {
          selected: false,
          status: 2,
          title: '后台申请中'
        }
      ],
      declareList: [
        {
          selected: true,
          status: null,
          title: '全部'
        }, {
          selected: false,
          status: 1,
          title: '申报信息未填写'
        }, {
          selected: false,
          status: -1,
          title: '申报信息已填写'
        }
      ],
      moreFilter: false, // 高级筛选
      moreFilterIcon: 'md-arrow-dropdown',
      moreFilterMes: '更多选项（平台、店铺、国家/地区等）',
      declareModel: {
        pageSize: 100,
        pageNum: 1,
        searchValue: null
      }
    };
  },
  watch: {
    pageParamsStatus (n) {
      let v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    },
    choiceStore (n, o) {
      let v = this;
      if (n !== o) {
        v.pageParams = v.deepCopy(v.pageParamsPrototype);
        v.pageParams.warehouseId = n;
        v.pageParamsStatus = true;
      }
    }
  },
  computed: {
    tableHeight () {
      return this.getTableHeight(480);
    }
  }, // activated () {
  //   this.startLoading();
  // },
  methods: {
    startLoading () {
      let v = this;
      v.$Loading.start();
      Promise.resolve(v.getList()).then(() => {
        v.getShopList();
        v.$Loading.finish();
      });
    },
    getList () { // 获取分页数据
      let v = this;
      if (v.pageParams.warehouseId) {
        v.loadingTrue();
        v.axios.post(api.get_pendingData, JSON.stringify(v.pageParams)).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            let pos = [];
            let saleAccountIdPos = [];
            let merchantShippingMethodIdPos = [];
            if (data.list !== null) {
              data.list.forEach((n, i) => {
                pos.push({
                  buyerName: n.buyerName,
                  buyerAccountId: n.buyerAccountId,
                  buyerCountryCodeList: n.buyerCountryCode,
                  packageOrderBoList: n.packageOrderBoList,
                  saleAccountId: n.saleAccountId,
                  trackingNumberStatus: n.trackingNumberStatus,
                  declarationStatus: n.declarationStatus,
                  packageCode: n.packageCode,
                  merchantShippingMethodId: n.merchantShippingMethodId,
                  carrierName: null,
                  carrierShippingMethodName: null,
                  payTime: n.payTime,
                  totalWeight: n.totalWeight,
                  skuQuantity: n.skuQuantity,
                  productQuantity: n.productQuantity,
                  accountCode: '',
                  packageId: n.packageId,
                  trackingNumberFailReason: n.trackingNumberFailReason
                });
                saleAccountIdPos.push(n.saleAccountId);
                merchantShippingMethodIdPos.push(n.merchantShippingMethodId);
              });
              if (saleAccountIdPos.length > 0) { // 匹配订单号
                Promise.resolve(v.axios.post(api.get_saleAccountById + '?saleAccountIds=' + saleAccountIdPos).then(response => {
                  if (response.data.code === 0) {
                    var list = response.data.datas;
                    for (var i = 0; i < list.length; i++) {
                      for (var t = 0; t < pos.length; t++) {
                        if (pos[t].saleAccountId === list[i].saleAccountId) {
                          pos[t].accountCode = list[i].accountCode;
                        }
                      }
                    }
                  }
                }), v.axios.post(api.queryCarrierShippingName, JSON.stringify(merchantShippingMethodIdPos)).then(response => {
                  if (response.data.code === 0) {
                    if (response.data.datas.length > 0) {
                      response.data.datas.forEach((n, i) => {
                        pos.forEach((m, t) => {
                          if (m.merchantShippingMethodId === n.shippingMethodId) {
                            m.carrierName = n.carrierName;
                            m.carrierShippingMethodName = n.carrierShippingMethodName;
                          }
                        });
                      });
                    }
                  }
                })).then(() => {
                  v.pendingData = pos;
                });
              }
              v.$nextTick(() => {
                v.total = Number(data.total);
                v.totalPage = Number(data.pages);
                v.loadingFalse();
              });
            } else {
              v.pendingData = [];
              v.$nextTick(() => {
                v.total = 0;
                v.totalPage = 0;
                v.loadingFalse();
              });
            }
          }
        }).catch(() => {
          v.loadingFalse();
        });
      }
    },
    selectStatus (index, status) {
      let v = this;
      if (index === 0) {
        v.pageParams.trackingNumberStatus = 1;
        v.tableControlStatus = true;
      } else {
        v.pageParams.trackingNumberStatus = 2;
        v.tableControlStatus = false;
      }
      v.statusList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    reset () {
      let v = this;
      v.$refs['pageParams'].resetFields();
      v.selectStatus(0, 1);
      v.selectDeclare(0, null);
      v.payTimeArr = [];
      v.shippingMethodModel = [];
      v.pageParams.merchantCarrierId = null;
      v.pageParams.merchantShippingMethodId = null;
      v.resetDate();
    },
    search () {
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    selectDeclare (index, status) {
      let v = this;
      if (index === 0) {
        delete v.pageParams.declarationStatus;
      } else if (index === 1) {
        v.pageParams.declarationStatus = -1;
      } else {
        v.pageParams.declarationStatus = 1;
      }
      v.declareList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    resetDate () {
      let v = this;
      v.pageParams.payStartTime = '';
      v.pageParams.payEndTime = '';
    },
    getDateValue (value) { // 获取日期返回值
      let v = this;
      if (value.length === 0) {
        v.$Message.error('日期格式有误');
        v.resetDate();
      } else {
        if (value[0] == null || value[1] == null) return false;
        v.pageParams.payStartTime = v.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
        v.pageParams.payEndTime = v.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
      }
    },
    applyForWayBillHasCondition () {
      this.applyForWayBill('all');
    },
    fillInTheDeclarationHasCondition () {
      this.fillInTheDeclaration('all');
    },
    changeShippingMethodButtonCondition () {
      this.changeShippingMethodButton('all');
    },
    applyForWayBill (type, id) {
      let v = this;
      if (v.packageIds.length === 0 && type !== 'all' && type !== 'single') {
        v.$Message.error('请选择订单');
        return false;
      }
      v.$Modal.confirm({
        title: type === 'all' ? '申请运单（所有结果集）' : '申请运单',
        loading: true,
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
                h('p', type === 'all' ? '所有结果集申请运单，系统将所有符合您当前查询条件的订单下发到物流商。' : type === 'single'
                  ? '确认后，订单将下发到物流商'
                  : '批量申请运单，你所选择的订单将下发到物流商')
              ])
            ])
          ]);
        },
        onOk: () => {
          let obj;
          if (type !== 'all' && type !== 'single') {
            obj = {
              packageIdList: v.packageIds
            };
          } else if (type === 'single') {
            obj = {
              packageIdList: [id]
            };
          } else {
            obj = v.pageParams;
          }
          v.axios.put(api.set_uploadPackage, JSON.stringify(obj)).then(response => {
            if (response.data.code === 0) {
              let dataList = response.data.datas;
              if (dataList.length === 0) {
                v.$Message.success('操作成功');
              } else {
                dataList.forEach((n, i) => {
                  v.$Message.error('邮寄方式相关设置有误，请检查邮寄方式');
                });
              }
              setTimeout(() => {
                v.$Modal.remove();
              }, 500);
              v.pageParamsStatus = true;
            }
          });
        }
      });
    },
    fillInTheDeclaration (type, id) {
      let v = this;
      if (v.packageIds.length === 0 && type !== 'all' && type !== 'single') {
        v.$Message.error('请选择订单');
        return false;
      }
      if (type === 'all') {
        v.fillInDeclareModel.title = '填写申报（所有结果集）';
        v.fillInDeclareModel.type = 'all';
      } else if (type === 'single') {
        v.fillInDeclareModel.title = '填写申报';
        v.fillInDeclareModel.type = 'single';
        v.fillInDeclareModel.pid = id;
      } else {
        v.fillInDeclareModel.title = '填写申报';
        v.fillInDeclareModel.type = null;
      }
      v.fillInDeclareStatus = true;
      v.$nextTick(function () {
        v.fillInDeclare = true;
        v.declareModel.searchValue = null;
        v.searchDecalre();
      });
    },
    changeShippingMethodButton (type) {
      let v = this;
      if (v.packageIds.length === 0 && type !== 'all') {
        v.$Message.error('请选择订单');
        return false;
      }
      if (type === 'all') {
        v.changeShippingMehotdModel.title = '更换物流方式（所有结果集）';
        v.changeShippingMehotdModel.content = '所有结果集更换物流方式，系统将符合当前查询条件的所有包裹更换到您选择的物流方式，包裹将回到下发物流商菜单重新申请运单。';
        v.changeShippingMehotdModel.type = 'all';
      } else {
        v.changeShippingMehotdModel.type = '';
        v.changeShippingMehotdModel.title = '更换物流方式';
        v.changeShippingMehotdModel.content = '批量指定物流方式系统将自动将所选中的列表中的订单指定为所选择的物流方式。';
      }
      v.setMatchStatus = true;
      v.$nextTick(function () {
        v.setMatchStatusModel = true;
      });
    },
    getSelectValue (value) { // table获取所选值
      let v = this;
      let pos = [];
      Promise.resolve(value.forEach((n, i) => {
        pos.push(n.packageId);
      })).then(function () {
        v.packageIds = pos;
      });
    },
    showPackageDetails (pid) {
      let v = this;
      let date = new Date().getTime();
      v.packageId = pid;
      v.packageDetailsStatus = true;
      v.$nextTick(function () {
        v.packageModel = true;
        v.timestamp = date;
      });
    },
    changeShippingMethod (value, data) {
      let v = this;
      v.pageParams.merchantCarrierId = value[0];
      v.pageParams.merchantShippingMethodId = value[1][0];
    },
    changeShippingMethodTwo (value, data) {
      let v = this;
      v.smModel.merchantCarrierId = value[0];
      v.smModel.merchantShippingMethodId = value[1];
    },
    saveDeclare () {
      let v = this;
      let obj;
      if (v.decalreData.length === 0) {
        v.$Message.error('请先添加申报信息');
        v.declareModalLoading = false;
        v.$nextTick(function () {
          v.declareModalLoading = true;
        });
        return false;
      }
      if (v.fillInDeclareModel.type === 'single') {
        obj = {
          packageIdList: [v.fillInDeclareModel.pid],
          packageDeclareList: v.decalreData
        };
      } else if (v.fillInDeclareModel.type === 'all') {
        obj = Object.assign({}, v.pageParams);
        obj.packageDeclareList = v.decalreData;
      } else {
        obj = {
          packageIdList: v.packageIds,
          packageDeclareList: v.decalreData
        };
      }
      v.axios.post(api.add_packageDeclare, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.declareModalLoading = false;
          v.$nextTick(function () {
            v.fillInDeclare = false;
            v.closeDeclare();
            v.packageIds = [];
            v.$refs.selection.selectAll(false);
          });
          v.$Message.success('保存成功');
        } else {
          v.declareModalLoading = false;
          v.$nextTick(function () {
            v.declareModalLoading = true;
          });
        }
      }).catch(() => {
        v.declareModalLoading = false;
        v.$nextTick(function () {
          v.declareModalLoading = true;
        });
      });
    },
    searchDecalre () {
      let v = this;
      v.tableLoading = true;
      v.axios.post(api.get_packageCommonDeclare, JSON.stringify(v.declareModel)).then(response => {
        v.tableLoading = false;
        if (response.data.code === 0) {
          v.commonDecalreData = response.data.datas.list;
        }
      });
    },
    addDeclare () {
      let v = this;
      let obj = v.deepCopy(v.declarePageParams);
      if (obj.quantity === null) {
        obj.quantity = 1;
      }
      v.$refs['declarePageParams'].resetFields();
      v.decalreData.push(obj);
    },
    closeDeclare () {
      let v = this;
      v.$refs['declarePageParams'].resetFields();
      v.decalreData = [];
    },
    handleSubmit (name) {
      let v = this;
      v.$refs[name].validate(function (valid) {
        if (valid) {
          v.addDeclare();
        }
      });
    },
    delDeclare (index) {
      let v = this;
      if (v.decalreData.length > 1) {
        v.decalreData.splice(index, 1);
      } else {
        v.decalreData = [];
      }
    },
    addCommonDeclare (value, index) { // 添加常用申报
      if (!value.quantity || value.quantity === null) {
        value.quantity = 1;
      }
      this.decalreData.push(value);
    },
    setShippingMethod (type) {
      let v = this;
      let obj;
      if (v.changeShippingMehotdModel.type === '') {
        obj = {
          packageIds: v.packageIds,
          updateMerchantCarrierId: v.value2[0],
          updateMerchantShippingMethodId: v.value2[1][0],
          packageCarrierParam: v.shippingMethodModel1,
          carrierAccountId: v.shippingAccountModel
        };
      } else if (v.changeShippingMehotdModel.type === 'all') {
        obj = v.deepCopy(v.pageParams);
        obj.packageIds = v.packageIds;
        obj.updateMerchantCarrierId = v.value2[0];
        obj.updateMerchantShippingMethodId = v.value2[1][0];
        obj.packageCarrierParam = v.shippingMethodModel1;
        obj.carrierAccountId = v.shippingAccountModel;
        delete obj.packageIds;
      } else if (v.changeShippingMehotdModel.type === 'single') {
        obj = {
          packageIds: [v.selectId],
          updateMerchantCarrierId: v.value2[0],
          updateMerchantShippingMethodId: v.value2[1][0],
          packageCarrierParam: v.shippingMethodModel1,
          carrierAccountId: v.shippingAccountModel
        };
      }
      v.axios.post(api.update_moreShippingMethod, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data !== null && data.length !== 0) {
            for (let i = 0; i < data.length; i++) {
              let item = data[i];
              if (item.code === 111128) {
                v.$Message.error('请选择物流商帐号');
              } else if (item.code === 111137) {
                v.$Message.error('未指定邮寄方式');
              }
            }
          } else {
            v.$Message.success('操作成功');
          }
          v.pageParamsStatus = true;
          v.resetShippingMethod();
        } else {
          v.resetShippingMethod();
        }
      }).catch(() => {
        v.resetShippingMethod();
      });
    },
    resetShippingMethod () { // reset changeShippingMethod model data
      let v = this;
      v.value2 = [];
      v.shippingAccountModel = [];
      v.carrierAccount = [];
      v.carrierBaseSetting = [];
      v.shippingMethodModel1 = [];
    },
    getAccount1 (value, selectedData) {
      let v = this;
      v.carrierAccount = [];
      if (value.length === 0) return false;
      v.shippingMethodModel1 = [];
      v.shippingAccountModel = [];
      v.getCarrierBaseSetting(value[1][0], 'shippingMethodModel1');
      if (value[1][1] !== null) {
        v.carrierAccount = value[1][1];
      }
    }
  },
  created () {
    let v = this;
    v.pageParamsPrototype = v.deepCopy(v.pageParams);
    this.startLoading();
  },
  mounted () {
    let v = this;
    setTimeout(v.getCountrys(), 2000);// 获取国家区域列表
  }
};
</script>
