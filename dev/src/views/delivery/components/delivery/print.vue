<style scoped>
.spaceBetween {
  justify-content: space-between;
}
</style>
<template>
  <div>
    <div class="selectStore" v-if="storeStatus && allStorelist !== [] && allStorelist !== null">
      请选择仓库： <dyt-select v-model="selectStore" style="width:200px">
        <Option v-for="(item,index) in allStorelist" :value="item.warehouseId" :key="index">{{ item.warehouseName }}</Option>
      </dyt-select>
    </div>
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <Form ref="pageParams" :model="pageParams" :label-width="70">
            <div class="platformParamsSelect">
              <div class="filterItem">
                <FormItem label="包裹类型" prop="name">
                  <Button-group>
                    <template v-for="(item,index) in packageList">
                      <Button v-if="item.selected" type="primary" @click="selectPackageType(index,item.status)" :key="index">{{ item.title }} </Button>
                      <Button v-if="!item.selected" @click="selectPackageType(index,item.status)" :key="index">{{ item.title }} </Button>
                    </template>
                  </Button-group>
                </FormItem>
              </div>
              <div class="filterItem">
                <FormItem label="面单" prop="name">
                  <Button-group>
                    <template v-for="(item,index) in packagePaperList">
                      <Button v-if="item.selected" type="primary" @click="selectPackagePaper(index,item.status)" :key="index">{{ item.title }} </Button>
                      <Button v-if="!item.selected" @click="selectPackagePaper(index,item.status)" :key="index">{{ item.title }} </Button>
                    </template>
                  </Button-group>
                </FormItem>
              </div>
            </div>
            <Row class=" platformParamsSelect normalTop">
              <Col :span="5">
              <FormItem label="物流方式">
                <Cascader v-model="shippingMethodModel" :load-data="loadData" @on-visible-change="showShippingData" @on-change="changeShippingMethod" :data="shippingMethodData" filterable transfer></Cascader>
              </FormItem>
              </Col>
              <Col :span="5" :class="{none : !moreFilter}" :offset="1">
              <FormItem label="平台">
                <dyt-select v-model="platformId" @on-change="changeValue">
                  <Option v-for="item in platformArr" :key="item.platformId" :label="item.title" :value="item.platformId"></Option>
                </dyt-select>
              </FormItem>
              </Col>
              <Col :span="5" :class="{none : !moreFilter}" :offset="1">
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
              <Col :span="5" :class="{none : !moreFilter}" :offset="1">
              <Form-item label="国家/地区" prop="buyerCountryCodeList">
                <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" filterable multiple placeholder="请选择或输入所在地">
                  <Option v-for="(item,index) in formValidate.country" :key="index" :value="item.twoCode">{{ item.enName }}</Option>
                </dyt-select>
              </Form-item>
              </Col>
            </Row>
            <div class="platformParamsMoreSection" :class="{none : !moreFilter}">
              <Row>
                <Col :lg="threeItemLg" :md="threeItemMd">
                <Form-item label="付款时间">
                  <Date-picker transfer style="width:100%" type="datetimerange" @on-clear="resetDate" @on-change="getDateValue" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end" placeholder="选择日期" :value="payTimeArr"></Date-picker>
                </Form-item>
                </Col>
                <Col :lg="threeItemLg" :md="threeItemMd" :offset="1">
                <Form-item label="包裹号" prop="packageCode">
                  <Input placeholder="请输入包裹号" v-model.trim="pageParams.packageCode"></Input>
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
              <Button type="primary" @click="search" size="small">查询 </Button>
              <Button @click="reset" size="small" v-once icon="md-refresh">重置 </Button>
            </div>
            <div class="moreFilter">
              <Button size="small" @click="toggleMoreFilter">
                {{ moreFilterMes }}
                <Icon :type="moreFilterIcon" size="small"></Icon>
              </Button>
            </div>
          </Form>
        </div>
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
    <div class="tableControl flexBox spaceBetween">
      <div class="tableControlButton">
        <Buttons type="primary" style="margin-left: 20px" trigger="click" @on-click="printPickingHasCondition">
          <Button type="primary" class="iconbuttons" @click="printPicking">
            <Icon type="document-text"></Icon>
            打印拣货单
          </Button>
          <Buttons-menu slot="list">
            <Buttons-item name="1">打印拣货单（所有结果集）</Buttons-item>
          </Buttons-menu>
        </Buttons>
        <Buttons type="primary" style="margin-left: 20px" trigger="click" @on-click="printDeclarationSheetHasCondition" v-if="pageParams.getLabelStatus === 1">
          <Button type="primary" class="iconbuttons" @click="printDeclarationSheet">
            <Icon type="document-text"></Icon>
            打印面单
          </Button>
          <Buttons-menu slot="list">
            <Buttons-item name="1">打印面单（所有结果集）</Buttons-item>
          </Buttons-menu>
        </Buttons>
        <Buttons type="primary" style="margin-left: 20px" trigger="click" @on-click="getDeclarationSheetHasCondition">
          <Button type="primary" class="iconbuttons" @click="getDeclarationSheet">
            <Icon type="document-text"></Icon>
            获取面单
          </Button>
          <Buttons-menu slot="list">
            <Buttons-item name="1">获取面单（所有结果集）</Buttons-item>
          </Buttons-menu>
        </Buttons>
        <!-- <Buttons type="primary" style="margin-left: 20px" trigger="click" @on-click="matchTheLogisticsOrderHasCondition">
          <Button type="primary" @click="matchTheLogisticsOrder">
            <Icon type="arrow-shrink"></Icon>
            更换物流方式
          </Button>
          <Buttons-menu slot="list">
            <Buttons-item name="1">更换物流方式（所有结果集）</Buttons-item>
          </Buttons-menu>
        </Buttons> -->
      </div>
      <div class="moreProductUp normalTop" v-if="pageParams.packageType == 4 || pageParams.packageType == null">
        <Checkbox v-model="pageParams.skuQuantities" :true-value="1" :false-value="0" @on-change="changeSkuQuantities">多品置顶
        </Checkbox>
      </div>
    </div>
    <div class="orderTable normalTop">
      <keep-alive>
        <Table highlight-row border :loading="loading" :height="tableHeight" :columns="orderColumn" :data="printData" @on-selection-change="getSelectValue"></Table>
      </keep-alive>
      <div class="table-page">
        <div class="table-page-right">
          <keep-alive>
            <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
          </keep-alive>
        </div>
      </div>
    </div>
    <!-- 更换物流方式 -->
    <Modal v-model="setMatchStatusModel" width="600" :mask-closable="false" v-if="setMatchStatus" @on-ok="setShippingMethod" @on-cancel="resetShippingMethod">
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-head">
          <div class="ivu-modal-confirm-head-title">{{ changeShippingMehotdModel.title }}</div>
        </div>
        <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
          <div style="margin-top:10px">
            <Row v-if="changeShippingMehotdModel.content !== ''">
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
                  <Cascader :data="shippingMethodData" @on-visible-change="showShippingData" v-model="value2" :load-data="loadData" @on-change="getAccount" transfer></Cascader>
                </Form-item>
                </Col>
                <Col :span="9" :offset="1">
                <Form-item label="帐号：" :label-width="60">
                  <dyt-select v-model="shippingAccountModel">
                    <Option v-for="(item,index) in carrierAccount" v-if="item.carrierAccountId !== null" :key="index" :value="item.carrierAccountId">{{ item.account }}</Option>
                  </dyt-select>
                </Form-item>
                </Col>
              </Row>
            </Form>
            <div class="matchLogisticSetting">
              <h6>物流相关设置</h6>
            </div>
            <Form class="setAllMarkRead white-space-nowrap-form" style="margin-top:10px">
              <Row>
                <Col :span="12" v-for="(item,index) in carrierBaseSetting" :key="index">
                <Form-item :label="item.paramName" :label-width="100">
                  <Radio-group v-model="shippingMethodModel[index].paramValue" :value="item.paramValue " v-if="item.paramType == 'radio'">
                    <Radio :label="sItem.itemValue" v-for="(sItem,n) in item.dictionarys" :key="n">
                      <span>{{ sItem.itemName }}</span>
                    </Radio>
                  </Radio-group>
                  <Input v-if="item.paramType == 'input'" v-for="(sItem,n) in item.dictionarys" :key="n" v-model="shippingMethodModel[index].paramValue" :value="sItem.itemValue "></Input>
                  <Checkbox-group v-model="shippingMethodModel[index].paramValue" v-if="item.paramType == 'checkbox'">
                    <Checkbox v-for="(sItem,n) in item.dictionarys" :key="n" :label="sItem.itemValue">
                      <span>{{ sItem.itemName }}</span>
                    </Checkbox>
                  </Checkbox-group>
                  <dyt-select v-if="item.paramType == 'select'" v-model="shippingMethodModel[index].paramValue">
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
    <!-- 包裹详情 -->
    <keep-alive>
      <sliderModal v-model="packageModel" :spinShow="spinShow" :styles="{}" class="slider-model" v-if="packageDetailsStatus">
        <packageDetails :packageId="packageId" :allStorelist="allStorelist" @spinLoading="spinLoading" @updateList="getList" @resetSpinShow="resetSpinShow" :timestamp="timestamp"></packageDetails>
      </sliderModal>
    </keep-alive>
    <!-- 打印拣货单 -->
    <Modal v-if="pickingListStatus" v-model="pickingListModelStatus" width="500" @on-ok="beginPicking">
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-head">
          <div class="ivu-modal-confirm-head-title">{{ pickintType == 'all' ? '打印拣货单（所有结果集）' : '打印拣货单' }}</div>
        </div>
        <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
          <div class="normalTop">
            <Form refs="pickingForm" :model="pickingListModel" :label-width="90">
              <FormItem label="拣货单形式：" prop="pickingType">
                <RadioGroup v-model="pickingListModel.pickingType">
                  <Radio label="1">
                    <span>SKU汇总</span>
                  </Radio>
                  <Radio label="2">
                    <span>逐包裹</span>
                  </Radio>
                  <Radio label="3">
                    <span>SKU汇总（有发货说明的例外）</span>
                  </Radio>
                </RadioGroup>
              </FormItem>
              <FormItem label="排序方式" prop="pickingSort">
                <dyt-select v-model="pickingListModel.pickingSort">
                  <Option value="1">货位升序（多品置顶，且取数量最多的SKU作为排序依据）</Option>
                  <Option value="2">货位降序（多品置顶，且取数量最多的SKU作为排序依据）</Option>
                  <Option value="3">SKU升序（多品置顶，且取数量最多的SKU作为排序依据）</Option>
                  <Option value="4">SKU降序（多品置顶，且取数量最多的SKU作为排序依据）</Option>
                </dyt-select>
              </FormItem>
              <FormItem label="" prop="pickingSort">
                <Checkbox v-model="pickingListModel.printProductPic">打印产品图片</Checkbox>
              </FormItem>
            </Form>
          </div>
        </div>
      </div>
    </Modal>
    <!-- 打印面单 -->
    <Modal v-if="expressSheetStatus" v-model="expressSheetModelStatus" width="500" @on-ok="expressSheet">
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-head">
          <div class="ivu-modal-confirm-head-title">{{ expressSheetModel.title }}</div>
        </div>
        <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
          <div class="normalTop">
            <Row v-if="expressSheetModel.content !== ''">
              <Col :span="1">
              <Icon type="md-information-circle" color="#2b85e4" size="44"></Icon>
              </Col>
              <Col :span="21" :offset="2">
              <p style="line-height:36px"></p>{{ expressSheetModel.content }}
              </Col>
            </Row>
            <Form refs="expressSheetModel" :model="expressSheetModel" :label-width="90">
              <FormItem label="排序方式" prop="pickingSort">
                <dyt-select v-model="expressSheetModel.pickingSort">
                  <Option value="1">货位升序（多品置顶，且取数量最多的SKU作为排序依据）</Option>
                  <Option value="2">货位降序（多品置顶，且取数量最多的SKU作为排序依据）</Option>
                  <Option value="3">SKU升序（多品置顶，且取数量最多的SKU作为排序依据）</Option>
                  <Option value="4">SKU降序（多品置顶，且取数量最多的SKU作为排序依据）</Option>
                </dyt-select>
              </FormItem>
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
import tableMixin from '@/components/mixin/table_mixin';
import deliveryMixin from '@/components/mixin/delivery_mixin';
import publicService from '@/components/mixin/publicService_mixin';
import Qs from 'qs';

export default {
  mixins: [Mixin, tableMixin, deliveryMixin, publicService],
  components: {
    packageDetails
  },
  data () {
    var self = this;
    return {
      postId: '',
      pdf: '', // 详情参数 Start
      packageModel: false,
      packageDetailsStatus: true,
      packageId: null,
      timestamp: null, // End
      // 打印拣货单 Start
      pickingListStatus: false,
      pickingListModelStatus: false,
      pickintType: '',
      pickingListModel: {
        pickingType: '1',
        pickingSort: '1',
        pickingListModel: false
      }, // End
      // 打印面单
      expressSheetStatus: false,
      expressSheetModelStatus: false,
      expressSheetModel: {
        title: '打印面单',
        pickingSort: '1',
        content: ''
      },
      moreProductUp: false,
      packageIds: [],
      shippingMethodModel1: [],
      changeShippingMethodBoxStatus: false,
      changeShippingMethodBoxModel: false,
      smModel: {
        type: '',
        title: '',
        content: '',
        merchantCarrierId: '',
        merchantShippingMethodId: ''
      },
      num: 9,
      minWidth: 300,
      buttonGroupModel: [
        {
          type: 'sortingSku',
          selected: true,
          status: true, // true up false down
          title: '按SKU'
        }, {
          type: 'payTime',
          selected: false,
          status: true, // true up false down
          title: '按付款时间'
        }, {
          type: 'packageCode',
          selected: false,
          status: true, // true up false down
          title: '按包裹号'
        }
      ],
      pageParamsPrototype: null, // 重置查询条件
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        orderBy: 'SKU',
        upDown: 'up',
        orderNo: null,
        buyerAccountId: null,
        buyerCountryCodeList: [],
        buyerName: null,
        merchantCarrierId: null,
        merchantShippingMethodId: null,
        packageStatus: null,
        packageType: null,
        skuQuantities: 0,
        webstoreItemId: null,
        webstoreSku: null,
        getLabelStatus: 1,
        platformId: null,
        saleAccountIds: [],
        packageCode: null,
        searchValue: null// 搜索内容
      },
      platformArr: [
        {
          platformId: '全部',
          title: '全部'
        }, {
          platformId: 'ebay',
          title: 'ebay'
        }
      ],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1, // printList: [
      //   {
      //     selected: true,
      //     status: 1,
      //     title: this.t('delivery.printable')
      //   },
      //   {
      //     selected: false,
      //     status: 0,
      //     title: this.t('delivery.noPrintable')
      //   },
      // ],
      packageList: [
        {
          selected: true,
          status: null,
          title: '全部'
        }, {
          selected: false,
          status: 1,
          title: '单品'
        }, {
          selected: false,
          status: 2,
          title: '单品多件'
        }, {
          selected: false,
          status: 3,
          title: '多品'
        }, {
          selected: false,
          status: 4,
          title: '有发货提醒'
        }

      ],
      packagePaperList: [
        {
          selected: true,
          status: 1,
          title: '已有面单'
        }, {
          selected: false,
          status: -1,
          title: '未获取面单'
        }
      ],
      packagePaperSizeList: [
        {
          selected: true,
          status: 0,
          title: '100 x 100'
        }, {
          selected: false,
          status: 1,
          title: '100 x 150'
        }, {
          selected: false,
          status: 2,
          title: '90 x 60'
        }
      ],
      moreFilter: false, // 高级筛选
      moreFilterIcon: 'md-arrow-dropdown',
      moreFilterMes: '更多选项（平台、店铺、国家/地区等）',
      resetStatus: true,
      payTimeArr: [],
      shopList: [],
      printData: [],
      orderColumn: [
        {
          type: 'selection',
          width: 60,
          fixed: 'left',
          align: 'center'
        }, {
          title: 'NO',
          width: 60,
          align: 'center',
          key: 'index',
          fixed: 'left'
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
          align: 'center',
          key: 'buyerName',
          width: 160,
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
          key: 'carrierShippingMethodName',
          align: 'center',
          width: 200
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
          align: 'center',
          width: null,
          key: 'payTime',
          render: (h, params) => {
            return self.getDataToLocalTime(params.row.payTime, 'fulltime');
          }
        }, {
          title: '操作',
          key: 'operate',
          width: 180,
          align: 'center',
          fixed: 'right',
          render: (h, params) => {
            if (params.row !== undefined && self.pageParams.getLabelStatus === 1) {
              return h('div', [
                h('Buttons', {
                  props: {
                    trigger: 'click',
                    transfer: true
                  },
                  class: 'defaultStyle',
                  on: {
                    'on-click': (value) => {
                      if (value === '1') {
                        self.showPackageDetails(params.row.packageId);
                      }
                    }
                  }
                }, [
                  h('Button', {
                    type: 'default',
                    class: 'iconbuttons',
                    on: {
                      click: () => {
                        self.getSinglePrint(params.row.packageId);
                        // self.print(params.row.labelPath, params.row.packageId);
                      }
                    }
                  }, [
                    h('Icon', {
                      props: {
                        type: 'printer'
                      },
                      style: {
                        marginRight: '5px'
                      }
                    }), h('span', '打印')
                  ]), h('Buttons-menu', {
                    slot: 'list'
                  }, [
                    h('Buttons-item', {
                      props: {
                        name: '1'
                      }
                    }, '查看包裹详情')
                  ])
                ])
              ]);
            } else if (params.row !== undefined && self.pageParams.getLabelStatus === -1) {
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
      loading: true,
      changeShippingMehotdModel: {
        type: '',
        title: '',
        content: ''
      },
      setMatchStatus: false,
      setMatchStatusModel: false,
      value2: [], // 物流[mcarrierID,merchantShippingMethodId]
      carrierAccount: [], // 对应物流账号
      carrierBaseSetting: [], // 物流参数配置
      shippingMethodModel: [],
      shippingAccountModel: '',
      tableHeight: this.getTableHeight(480)
    };
  },
  activated () {
    this.reset();
    this.startLoading();
  },
  watch: {
    pageParamsStatus (n) {
      let v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    },
    selectStore (n, o) {
      let v = this;
      if (n !== o) {
        v.pageParams = v.deepCopy(v.pageParamsPrototype);
        v.pageParams.warehouseId = n;
        v.pageParamsStatus = true;
        sessionStorage.setItem('warehouseId', n);
      }
    }
  },
  methods: {
    startLoading () {
      let v = this;
      v.$Loading.start();
      v.getList();
      v.getShopList();
    },
    getList () {
      let v = this;
      if (v.pageParams.warehouseId) {
        v.axios.post(api.get_printList, JSON.stringify(v.pageParams)).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas.list;
            let saleAccountIdPos = [];
            let pos = [];
            let merchantShippingMethodIdPos = [];
            if (data !== null && data.length > 0) {
              function makeData () {
                data.forEach((n, i) => {
                  n.index = i + 1;
                  pos.push(n);
                  saleAccountIdPos.push(n.saleAccountId);
                  merchantShippingMethodIdPos.push(n.merchantShippingMethodId);
                });
              }

              async function getShippingMehotds () {
                await makeData();
                Promise.resolve(v.axios.get(api.get_allEnabalShippingMethods + '?carrierShippingMethodIdList=' + merchantShippingMethodIdPos).then(response1 => {
                  let shippingData = response1.data.datas;
                  shippingData.forEach((m, t) => {
                    pos.forEach((n, i) => {
                      if (n.merchantShippingMethodId === m.shippingMethodId) {
                        pos[i].carrierShippingMethodName = m.carrierShippingMethodName;
                      }
                    });
                  });
                })).then(response5 => {
                  if (saleAccountIdPos.length > 0) {
                    Promise.resolve(v.axios.post(api.get_saleAccountById + '?saleAccountIds=' + saleAccountIdPos).then(response => {
                      if (response.data.code === 0) {
                        let list = response.data.datas;
                        for (let i = 0; i < list.length; i++) {
                          for (let t = 0; t < pos.length; t++) {
                            if (pos[t].saleAccountId === list[i].saleAccountId) {
                              pos[t].accountCode = list[i].accountCode;
                            }
                          }
                        }
                      }
                    })).then(() => {
                      v.$nextTick(function () {
                        v.total = Number(response.data.datas.total);
                        v.totalPage = Number(response.data.datas.pages);
                        v.loadingFalse();
                        v.$Loading.finish();
                      });
                      v.printData = pos;
                    });
                  }
                });
              }

              getShippingMehotds();
            } else {
              v.printData = [];
              v.loadingFalse();
              v.$nextTick(function () {
                v.total = 0;
                v.totalPage = 0;
              });
            }
          } else {
            v.loadingFalse();
            v.$nextTick(function () {
              v.total = 0;
              v.totalPage = 0;
            });
          }
        });
      }
    },
    selectPackageType (index, status) {
      let v = this;
      if (index === 0) {
        delete v.pageParams.packageType;
      } else {
        v.pageParams.packageType = status;
      }
      v.curPage = 1;
      v.pageParams.pageNum = 1;
      v.packageList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    selectPackagePaper (index, status) {
      let v = this;
      if (index === 0) {
        v.pageParams.getLabelStatus = 1;
      } else {
        v.pageParams.getLabelStatus = -1;
      }
      v.curPage = 1;
      v.pageParams.pageNum = 1;
      v.packagePaperList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    selectPackageSize (index, status) {
      let v = this;
      if (index === 0) {
        delete v.pageParams.status;
      } else if (index === 1) {
        v.pageParams.status = '1';
      } else {
        v.pageParams.status = '0';
      }
      v.curPage = 1;
      v.pageParams.pageNum = 1;
      v.packagePaperList.forEach((n, i) => {
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
      v.selectPackageType(0, null);
      v.selectPackagePaper(0, 1);
      v.shippingMethodModel = [];
      v.platformId = null;
      v.payTimeArr = [];
      v.resetDate();
    },
    search () {
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    changeShippingMethod (value, data) {
      let v = this;
      v.pageParams.merchantCarrierId = value[0];
      v.pageParams.merchantShippingMethodId = value[1][0];
    },
    resetDate () {
      let v = this;
      v.pageParams.payStartTime = null;
      v.pageParams.payEndTime = null;
    },
    getDateValue (value) { // 获取日期返回值
      var v = this;
      if (value[0] !== '') {
        v.pageParams.payStartTime = v.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
        v.pageParams.payEndTime = v.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
      }
    },
    printPicking (type) {
      let v = this;
      if (v.packageIds.length === 0 && type !== 'all') {
        v.$Message.error('请选择包裹');
        return false;
      }
      if (type === 'all') {
        v.pickintType = 'all';
      } else {
        v.pickintType = '';
      }
      v.pickingListStatus = true;
      v.$nextTick(function () {
        v.pickingListModelStatus = true;
      });
    },
    printPickingHasCondition () {
      this.printPicking('all');
    },
    printDeclarationSheet (type) {
      let v = this;
      v.expressSheetModel.pickingSort = '1';
      if ((v.packageIds.length === 0 || v.packageIds === null) && type !== 'all') {
        v.$Message.error('请选择包裹');
        return false;
      }
      if (type === 'all') {
        v.expressSheetModel.title = '打印面单（所有结果集）';
        v.expressSheetModel.content = '所有结果集打印面单，系统将打印出符合您当前查询条件的所有包裹的面单。';
      } else {
        v.expressSheetModel.title = '打印面单';
        v.expressSheetModel.content = '';
      }
      v.expressSheetStatus = true;
      v.$nextTick(function () {
        v.expressSheetModelStatus = true;
      });
    },
    expressSheet () { // 打印面单
      let v = this;
      var obj = {
        printOrderBy: v.expressSheetModel.pickingSort,
        packageIds: v.packageIds
      };
      if (v.expressSheetModel.title === '打印面单（所有结果集）') {
        obj = Object.assign(obj, v.pageParams);
      }
      v.axios.post(api.express_sheet, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let erpCommon = v.$store.state.erpConfig;
          data.forEach((n, i) => {
            if (n.labelPath.indexOf('http') !== -1) {
              v.print(n.labelPath, n.packageId, n.printOrderBy);
            } else if (n.labelPath.indexOf('http') === -1) {
              v.print(erpCommon.filenodeViewTargetUrl + n.labelPath, n.packageId, n.printOrderBy);
            }
          });
          v.pageParamsStatus = true;
        }
      });
    },
    printDeclarationSheetHasCondition () {
      this.printDeclarationSheet('all');
    },
    getDeclarationSheet (type) {
      let v = this;
      if ((v.packageIds.length === 0 || v.packageIds === null) && type !== 'all') {
        v.$Message.error('请选择包裹');
        return false;
      }
      let obj = {
        packageIds: v.packageIds
      };
      if (type === 'all') {
        obj = Object.assign(obj, v.pageParams);
        delete obj.packageIds;
      }
      v.axios.put(api.get_expressBill, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('获取面单成功');
        } else {
          v.$Message.success('获取面单失败');
        }
      });
    },
    getDeclarationSheetHasCondition () {
      this.getDeclarationSheet('all');
    },
    getSelectValue (value) { // table获取所选值
      let v = this;
      let pos = [];
      Promise.resolve(value.forEach((n, i) => {
        pos.push(n.packageId);
      })).then(() => {
        v.packageIds = pos;
      });
    },
    showPackageDetails (pid) {
      let v = this;
      v.packageId = pid;
      v.packageDetailsStatus = true;
      let date = new Date().getTime();
      v.$nextTick(function () {
        v.packageModel = true;
        v.timestamp = date;
      });
    },
    beginPicking () {
      let v = this;
      var obj = {
        isPrintPic: v.pickingListModel.pickingListModel ? '1' : '0',
        sheetProductType: v.pickingListModel.pickingType,
        sheetOrderBy: v.pickingListModel.pickingSort,
        packageIds: v.packageIds
      };
      if (v.pickintType === 'all') {
        obj = Object.assign(obj, v.pageParams);
        delete obj.packageIds;
      }
      let newTab = window.open('about:blank');
      v.axios.post(api.print_pickingOrder, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          localStorage.setItem('prinSheetData', JSON.stringify(response.data.datas));
          newTab.location.href = '//' + window.location.host + '/erp_service/printSheet.html?type=' + v.pickingListModel.pickingType;
        }
      });
    },
    getSinglePrint (packageId) {
      let v = this;
      v.axios.get(api.get_singleExpressBillPath + packageId).then(response => {
        if (response.data.code === 0) {
          let erpCommon = v.$store.state.erpConfig;
          if (erpCommon !== null && erpCommon.hasOwnProperty('filenodeViewTargetUrl')) {
            v.print(erpCommon.filenodeViewTargetUrl + response.data.datas, packageId);
          } else {
            v.getErpConfig().then(result => {
              if (result) {
                let erpCommon = v.$store.state.erpConfig;
                v.print(erpCommon.filenodeViewTargetUrl + response.data.datas, packageId);
              }
            });
          }
        }
      });
    },
    print (path, postId, orderBy) { // JSONP /printResult
      let v = this;
      let originPostId = postId;
      postId = postId + parseInt(Math.random() * 100000000);
      let jsonObj = {
        pdf: path,
        postId: postId
      };
      let instance = v.axios.create({
        timeout: 3000,
        headers: {
          'Content-Type': 'multipart/form-data; charset=UTF-8'
        }
      });
      delete v.axios.defaults.headers.post['X-Requested-With'];
      instance.post('http://localhost:10099/print', Qs.stringify(jsonObj)).then(response => {
        if (response.status === 200) {
          v.startPrintMonitor(jsonObj, originPostId, orderBy);
        }
      }).catch(() => {
        v.getPrintExeUrl().then(data => {
          if (data) {
            v.$Modal.info({
              width: 400,
              content: `请下载打印控件<a href=${data}>点击下载</a>`
            });
          } else {
            return new Error('未获取到打印控件');
          }
        });
      });
    },
    startPrintMonitor (jsonObj, postId, orderBy) {
      let v = this;
      let obj = {
        packageIds: [postId]
      };
      if (orderBy) {
        obj.printOrderBy = orderBy;
      }
      jsonObj.responseType = 1;
      let instance = v.axios.create({
        timeout: 3000,
        headers: {
          'Content-Type': 'multipart/form-data; charset=UTF-8'
        }
      });
      delete v.axios.defaults.headers.post['X-Requested-With'];
      instance.post('http://localhost:10099/printResult?' + Qs.stringify(jsonObj)).then(response => {
        if (response.data === 0) {
          setTimeout(function () {
            v.startPrintMonitor(jsonObj, postId, orderBy);
          }, 2500);
        } else if (response.data === 2) {
          v.$Message.error('打印失败');
        } else {
          v.axios.put(api.mark_printed, JSON.stringify(obj)).then(response => {
            if (response.data.code === 0) {
              v.$Message.success('标记成功');
              v.pageParamsStatus = true;
            } else {
              v.$Message.success('标记失败');
            }
          });
        }
      });
    },
    matchTheLogisticsOrderHasCondition (val) {
      let v = this;
      if (val === '1') {
        v.matchTheLogisticsOrder('all');
        v.changeShippingMehotdModel.type = 'all';
        v.changeShippingMehotdModel.title = '指定物流方式（所有结果集）';
        v.changeShippingMehotdModel.content = '指定物流方式（所有结果集），系统将自动将符合当前查询条件的所有包裹指定为所选择的物流方式。';
      }
    },
    matchTheLogisticsOrder (type) {
      let v = this;
      if ((v.packageIds.length === 0 || v.packageIds == null) && type !== 'all' && type !== 'single') {
        v.$Message.error('请选择订单');
        return false;
      }
      if (type === 'single') {
        v.changeShippingMehotdModel.type = 'single';
      } else if (type === 'all') {
        v.changeShippingMehotdModel.type = 'all';
      }
      v.changeShippingMehotdModel.title = '更换物流方式';
      v.changeShippingMehotdModel.content = '';
      v.setMatchStatus = true;
      v.$nextTick(function () {
        v.setMatchStatusModel = true;
      });
    },
    setShippingMethod (type) {
      let v = this;
      let obj;
      if (v.changeShippingMehotdModel.type === '') {
        obj = {
          packageIds: v.packageIds,
          updateMerchantCarrierId: v.value2[0],
          updateMerchantShippingMethodId: v.value2[1][0],
          packageCarrierParam: v.shippingMethodModel,
          carrierAccountId: v.shippingAccountModel
        };
      } else if (v.changeShippingMehotdModel.type === 'all') {
        obj = v.deepCopy(v.pageParams);
        delete obj.packageIds;
        obj.updateMerchantCarrierId = v.value2[0];
        obj.updateMerchantShippingMethodId = v.value2[1][0];
        obj.packageCarrierParam = v.shippingMethodModel;
        obj.carrierAccountId = v.shippingAccountModel;
      } else if (v.changeShippingMehotdModel.type === 'single') {
        obj = {
          packageIds: [v.selectId],
          updateMerchantCarrierId: v.value2[0],
          updateMerchantShippingMethodId: v.value2[1][0],
          packageCarrierParam: v.shippingMethodModel,
          carrierAccountId: v.shippingAccountModel
        };
      }
      v.axios.put(api.update_printShippingMethod, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
          v.resetShippingMethod();
        } else {
          v.resetShippingMethod();
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      }).catch(() => {
        v.resetShippingMethod();
        v.$Message.error('系统繁忙，请重新尝试');
      });
    },
    resetShippingMethod () { // reset changeShippingMethod model data
      let v = this;
      v.value2 = [];
      v.shippingAccountModel = [];
      v.carrierAccount = [];
      v.carrierBaseSetting = [];
      v.shippingMethodModel = [];
    },
    changeSkuQuantities () {
      this.pageParamsStatus = true;
    }
  },
  created () {
    let v = this;
    v.pageParamsPrototype = v.deepCopy(v.pageParams);
  },
  mounted () {
    let v = this;
    v.getAllstore(0, 1).then(response => {
      // v.$store.commit('warehouseId', v.selectStore);
      sessionStorage.setItem('warehouseId', v.selectStore);
    });
    setTimeout(v.getCountrys(), 2000);// 获取国家区域列表
    v.pw(v.num);
  }
};
</script>
