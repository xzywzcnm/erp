<style scoped >
.singleSearchBtn {
  margin-left: 20px;
  margin-top: 5px;
}

.address {
  width: 100px;
  text-align: right;
  vertical-align: middle;
  float: left;
  font-size: 12px;
  color: #495060;
  line-height: 1;
  padding: 10px 12px 10px 0;
  box-sizing: border-box;
}

.chooseAdd {
  float: left;
  width: 350px;
}

.price {
  width: 100px;
  text-align: right;
  vertical-align: middle;
  float: left;
  font-size: 12px;
  color: #495060;
  line-height: 1;
  padding: 10px 12px 10px 0;
  box-sizing: border-box;
}

.priceRange {
  float: left;
  width: 410px;
}

.price:before {
  content: '*';
  display: inline-block;
  margin-right: 4px;
  line-height: 1;
  font-family: SimSun;
  font-size: 12px;
  color: #ed3f14;
}

.btnAction:hover {
  cursor: pointer;
  color: #2d8cf0;
}

.mb24 {
  margin-bottom: 24px;
}
</style >
<style >
.supplierTabsBar .ivu-tabs-nav-prev,
.supplierTabsBar .ivu-tabs-nav-next {
  display: none;
}

.chooseSku .vertical-center-modal {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chooseSku .vertical-center-modal .ivu-modal {
  top: 0;
}

.multiCols .ivu-table-cell {
  padding: 0
}
</style>
<template>
  <div>
    <template>
      <div class="commonFilter">
        <div class="card-container">
          <div class="card-content">
            <div class="platformParamsSelect">
              <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
                <dyt-filter>
                  <FormItem label="分类" prop="goodsCategoryId">
                    <dyt-select v-model="pageParams.goodsCategoryId" filterable clearable>
                      <Option v-for="(item, index) in sortArr" :value="item.code" :key="index">{{ item.name }}</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="供应商" prop="supplierId">
                    <dyt-select v-model="pageParams.supplierId" filterable clearable>
                      <Option v-for="(item, index) in suplierArr" :disabled="item.purchaseWarehouseStatus === '1'"
                        :value="item.supplierId" :key="index">{{ item.supplierName }}</Option>
                    </dyt-select>
                  </FormItem>
                  <dyt-input v-model.trim="pageParams.skuOrName" style="width: 390px;">
                    <dyt-select v-model="pageParams.skuOrNameType" slot="prepend" style="width: 100px;">
                      <Option v-for="(item, index) in searchTypeArr" :value="item.type" :key="index">{{ item.title }}
                      </Option>
                    </dyt-select>
                  </dyt-input>
                  <div slot="operation">
                    <Button type="primary" @click="searchOrder" :disabled="SearchDisabled" icon="ios-search">搜索</Button>
                    <Button @click="reset" style="margin-left: 10px;" v-once icon="md-refresh">重置</Button>
                  </div>
                </dyt-filter>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <div class="commonFilter">
        <div class="orderTable">
          <keep-alive>
            <proTable :loading="Tableloading" :productsData="productsData" @tableRowOperation="rowOperation"
              @tableViewHistory="viewHistoryFn"></proTable>
          </keep-alive>
          <div class="table-page clear">
            <div class="table-page-right">
              <keep-alive>
                <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
                  :current="pageParams.pageNum" show-sizer @on-page-size-change="changePageSize" placement="top"
                  :page-size-opts="pageArray"></Page>
              </keep-alive>
            </div>
          </div>
        </div>
      </div>
    </template>
    <!--历史价格-->
    <Modal v-model="isShowHisPrice" :width="820">
      <div class="supplierTabsBar">
        <template>
          <Tabs v-model="hisPriceCurrentTabItem" @on-click="hisPriceTabFn">
            <TabPane v-for="(item, index) in hisPriceTabItems" :label="item.value" :key="item.key" :name="String(index)">
            </TabPane>
          </Tabs>
        </template>
        <div class="normalTop20" v-if="hisPriceCurrentTabItem === '0'">
          <Table ref="skuTable" highlight-row border :loading="Tableloading" :columns="hisPriceColumn1"
            :data="hisPriceData1"></Table>
        </div>
        <div class="normalTop20" v-if="hisPriceCurrentTabItem === '1'">
          <Table ref="skuTable" highlight-row border :columns="hisPriceColumn2" :data="hisPriceData2"></Table>
        </div>
        <div class="table-page clear">
          <div class="table-page-right">
            <keep-alive>
              <Page :total="hisPriceParams.total" @on-change="hisPriceChangePage" show-total
                :page-size="hisPriceParams.pageSize" show-elevator :current="hisPriceParams.pageNum" show-sizer
                @on-page-size-change="hisPriceChangePageSize" placement="top" :page-size-opts="pageArray"></Page>
            </keep-alive>
          </div>
        </div>
      </div>
      <div slot="footer">
        <Button type="primary" @click="isShowHisPrice = false" size="large" style="width: 120px;">关闭 </Button>
      </div>
    </Modal>
    <!--查看/编辑报价-->
    <Modal v-model="isShowEditPro" :title="quoteTitle" :width="720" :mask-closable="!isEditPro">
      <div class="normalTop">
        <Form ref="editProduct" :model="editProduct" :label-width="100" :rules="ruleValidate">
          <Row>
            <Col :span="16">
            <FormItem label="SKU编号:" prop="skuNo">
              <Input v-model.trim="editProduct.skuNo" :disabled="!isEditPro"></Input>
            </FormItem>
            </Col>
            <Col :span="8">
            <div class="tableControl">
              <Button type="primary" class="iconbuttons" @click="chooseSkuFn" style="margin-left: 12px"
                v-if="isEditPro">
                选择SKU </Button>
            </div>
            </Col>
          </Row>
          <Row>
            <Col :span="16">
            <FormItem label="商品名称:">
              <Input v-model="editProduct.goodsName" disabled></Input>
            </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="16">
            <FormItem label="供应商:" prop="supplierName">
              <dyt-select ref="supplierSelect" v-model="editProduct.supplierName" clearable :disabled="!isEditPro">
                <Option v-for="(item, index) in supplierArr" :disabled="item.purchaseWarehouseStatus === '1'"
                  :value="item.supplierName" :key="`${index}-${item.supplierId}`">{{ item.supplierName }} </Option>
              </dyt-select>
            </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="16">
            <div class="clear ivu-form-item">
              <div class="address">
                地址:
              </div>
              <div class="chooseAdd">
                <Row>
                  <Col span="7">
                  <dyt-select v-model="editProduct.countryId" ref="countrySelect" clearable filterable
                    @on-change="countryChangeFn" :disabled="!isEditPro">
                    <Option v-for="(item, index) in countryArr" :value="item.countryId"
                      :key="`${index}-${item.countryId}`">{{ item.cnName }} </Option>
                  </dyt-select>
                  </Col>
                  <Col span="7" :offset="1">
                  <dyt-select ref="provinceSelect" clearable filterable v-model="editProduct.provinceId"
                    @on-open-change="getProvinceFn" @on-change="provinceChangeFn" :disabled="!isEditPro">
                    <Option v-for="(item, index) in provinceArr" :value="item.stateId"
                      :key="`${index}-${item.stateId}`">{{ item.cnName }} </Option>
                  </dyt-select>
                  </Col>
                  <Col span="7" :offset="1">
                  <dyt-select ref="citySelect" clearable filterable v-model="editProduct.cityId"
                    @on-open-change="getCityFn" :disabled="!isEditPro">
                    <Option v-for="(item, index) in cityArr" :value="item.cityId" :key="index">{{ item.cnName }}
                    </Option>
                  </dyt-select>
                  </Col>
                </Row>
              </div>
            </div>
            </Col>
          </Row>
          <Row>
            <Col :span="16">
            <FormItem label="供应商内部货号:">
              <Input v-model="editProduct.supplierGoodsCode" :disabled="!isEditPro"></Input>
            </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="16">
            <FormItem label="采购链接:">
              <Input v-model="editProduct.supplierPurchaseLink" :disabled="!isEditPro"></Input>
            </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="16">
            <FormItem label="币种:" prop="currency">
              <dyt-select v-model="editProduct.currency" clearable :disabled="!isEditPro">
                <Option v-for="(item, index) in currencyList" :value="`${index}${item.value}`" :key="item.value">{{
                    item.label
                }} </Option>
              </dyt-select>
            </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="18">
            <div class="clear ivu-form-item">
              <div class="price">
                价格:
              </div>
              <div class="priceRange">
                <template v-for="(parentItem, parentIndex) in editProduct.priceDetailsList">
                  <Row :class="{ mb24: parentIndex != editProduct.priceDetailsList.length - 1 }">
                    <Col span="3"
                      style="text-align: right;padding: 10px 12px 10px 0;font-size: 12px;line-height: 12px;">
                    数量≥
                    </Col>
                    <Col span="7">
                    <FormItem :prop="'priceDetailsList.' + parentIndex + '.quantity'"
                      :rules="{ required: true, message: '数量不能为空', trigger: 'blur' }">
                      <Input v-model="parentItem.quantity" :disabled="!isEditPro"></Input>
                    </FormItem>
                    </Col>
                    <Col span="3"
                      style="text-align: right;padding: 10px 12px 10px 0;font-size: 12px;line-height: 12px;">
                    ，价格
                    </Col>
                    <Col span="7">
                    <FormItem :prop="'priceDetailsList.' + parentIndex + '.price'"
                      :rules="{ required: true, message: '价格不能为空', trigger: 'blur' }">
                      <Input v-model="parentItem.price" :disabled="!isEditPro"></Input>
                    </FormItem>
                    </Col>
                    <Col span="4" style="padding-top: 3px;" v-if="isEditPro">
                    <span class="btnAction" @click="addPriceAction"
                      v-if="parentIndex === editProduct.priceDetailsList.length - 1">
                      <Icon type="md-add-circle" size="26" style="margin-left: 6px;" />
                    </span> <span class="btnAction" @click="removePriceAction(parentIndex)"
                      v-if="editProduct.priceDetailsList.length > 1">
                      <Icon type="md-remove-circle" size="26" style="margin-left: 6px;" />
                    </span>
                    </Col>
                  </Row>
                </template>
                <template v-if="(!editProduct.priceDetailsList || editProduct.priceDetailsList.length == 0) && isEditPro">
                  <span class="btnAction" @click="addPriceAction">
                    <Icon type="md-add-circle" size="26" style="margin-left: 6px;" />
                  </span>
                </template>
              </div>
            </div>
            </Col>
          </Row>
          <Row>
            <Col :span="16">
            <FormItem label="预计货期(天):" prop="estimateDeliveryDays">
              <Input v-model.trim="editProduct.estimateDeliveryDays" :disabled="!isEditPro"></Input>
            </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="16">
            <FormItem label="是否首选供应商:">
              <Checkbox :disabled="!isEditPro" v-model="isFirstCheck"></Checkbox>
            </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
      <div slot="footer" style="text-align: center;">
        <Button type="primary" @click="saveProFn('editProduct')" style="width: 100px;margin-right: 30px;"
          v-if="isEditPro">保存 </Button>
        <Button type="primary" @click="submitProFn('editProduct')" style="width: 100px;margin-right: 30px;"
          v-if="isEditPro">提交 </Button>
        <Button type="primary" @click="isShowEditPro = false" style="width: 100px;">关闭 </Button>
      </div>
    </Modal>
    <!--选择SKU-->
    <div class="chooseSku">
      <Modal v-model="isShowChooseSku" :width="620" class-name="vertical-center-modal" title="选择SKU">
        <div>
          <div>
            <Input v-model="searchSku" style="width: 350px;margin: 0 auto;" placeholder="SKU编号" @on-enter="searchSkuFn">
            <Button slot="append" icon="ios-search" type="primary" @click="searchSkuFn"></Button>
            </Input>
          </div>
          <div class="normalTop20">
            <dTable ref="skuTable" highlight-row :loading="Tableloading" border :columns="skuColumn" :data="skuData"
              @on-selection-change="getSelectSku"></dTable>
            <div class="table-page clear">
              <div class="table-page-right">
                <keep-alive>
                  <Page :total="skuParams.total" @on-change="skuChangePage" show-total :page-size="skuParams.pageSize"
                    show-elevator :current="skuParams.pageNum" show-sizer @on-page-size-change="skuChangePageSize"
                    placement="top" :page-size-opts="pageArray"></Page>
                </keep-alive>
              </div>
            </div>
          </div>
        </div>
        <div slot="footer">
          <Button type="primary" @click="confirmSku" style="width: 80px;margin-right: 30px;">确定 </Button>
          <Button type="primary" @click="isShowChooseSku = false" style="width: 80px;margin-right: 30px;">取消 </Button>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import tableMixin from '@/components/mixin/table_mixin';
import proTable from './common/proTable';

export default {
  mixins: [Mixin, tableMixin],
  components: { proTable },
  data () {
    var self = this;
    return {
      pageParamsStatus: false,
      isShowHisPrice: false,
      isShowChooseSku: false,
      isShowEditPro: false, // 查看，编辑
      quoteTitle: '',
      isEditPro: false, // 是否可编辑
      isFirstCheck: false, // 是否为首选供应商
      tableHeight: self.getTableHeight(290),
      editProduct: {},
      totalPage: 0,
      total: 0,
      curPage: 1,
      searchSku: '',
      chosenSku: {},
      isShowSubLayer: false,
      hisPriceCurrentTabItem: '0', // 历史价格标签页
      hisPriceTabItems: [
        {
          key: 0,
          value: '历史报价'
        } /* {
         key: 1,
         value: '历史采购价'
         } */
      ],
      supplierArr: [],
      countryArr: [],
      provinceArr: [],
      cityArr: [],
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        goodsCategoryId: null,
        skuOrName: null, // 商品sku编号或商品名称
        skuOrNameType: '1', // 商品sku编号或商品名称类型(null全部1按sku2按商品名称)
        supplierId: null
      },
      hisPriceParams: {
        hisTotal: 0,
        pageNum: 1,
        pageSize: 10,
        skuNo: ''
      },
      selectionArr: [], // 已选中表格行数据
      sortArr: [], // 分类
      suplierArr: [], // 供应商
      searchTypeArr: [
        {
          title: '按货品SKU',
          type: '1'
        }, {
          title: '按商品名称',
          type: '2'
        }
      ],
      productsData: [], // 主table
      hisPriceData1: [],
      hisPriceData2: [],
      hisPriceColumn1: [
        {
          key: 'createdTime',
          title: '报价日期',
          align: 'center',
          render: (h, params) => {
            return h('span', self.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        }, {
          key: 'supplierName',
          align: 'center',
          title: '供应商'
        }, {
          key: 'priceDetailsList',
          align: 'center',
          title: '采购报价',
          render: (h, params) => {
            let content = [];
            params.row.priceDetailsList.forEach((n, i) => {
              content.push(h('div', {
                style: {
                  textAlign: 'center',
                  padding: '3px',
                  borderTop: (params.row.priceDetailsList.length > 1 && i > 0) ? '1px solid rgb(233, 234, 236)' : 'none'
                }
              }, n + ' ' + params.row.currency));
            });
            return content;
          }
        }, {
          key: 'supplierPurchaseLink',
          align: 'center',
          title: '采购链接',
          render: (h, params) => {
            return h('div', {
              attrs: {
                title: params.row.supplierPurchaseLink
              },
              style: {
                'display': '-webkit-box',
                '-webkit-box-orient': 'vertical',
                '-webkit-line-clamp': 3,
                'overflow': 'hidden'
              }
            }, params.row.supplierPurchaseLink);
          }
        }, {
          key: 'estimateDeliveryDays',
          align: 'center',
          title: '预期采购时间',
          render: (h, params) => {
            return h('span', params.row.estimateDeliveryDays + ' 天');
          }
        }
      ],
      hisPriceColumn2: [
        {
          key: 'purchaseDate',
          title: '采购日期',
          align: 'center'
        }, {
          key: 'supplier',
          align: 'center',
          title: '供应商'
        }, {
          key: 'purchasePrice',
          align: 'center',
          title: '采购单价'
        }, {
          key: 'purchaseTime',
          align: 'center',
          title: '采购耗时'
        }
      ],
      skuData: [], // SKU表格数据
      selectionSkuArr: [], // SKU表格选择数据
      skuParams: {
        total: 0,
        pageSize: 10,
        pageNum: 1
      },
      skuColumn: [
        {
          key: 'radio',
          title: ' ',
          align: 'center',
          width: 80,
          render: (h, params) => {
            return h('Radio', {
              props: {
                value: self.skuData[params.index].isCheck
              },
              on: {
                'on-change': (value) => {
                  self.chosenSku = Object.assign({}, params.row);
                  self.skuData[params.index].isCheck = value;
                  self.skuData.forEach((n, i) => {
                    if (n.isCheck && i !== params.index) {
                      self.skuData[i].isCheck = false;
                    }
                  });
                }
              }
            });
          }
        }, {
          key: 'pic',
          title: '图片',
          align: 'center',
          render: (h, params) => {
            return self.tableImg(h, params, 'goodsUrl');
          }
        }, {
          key: 'cnName',
          align: 'center',
          title: '商品名称',
          render: (h, params) => {
            return h('div', {
              style: {
                'display': '-webkit-box',
                '-webkit-box-orient': 'vertical',
                '-webkit-line-clamp': 3,
                'overflow': 'hidden'
              }
            }, params.row.cnName);
          }
        }, {
          key: 'sku',
          align: 'center',
          title: 'SKU编号'
        }, {
          key: 'productGoodsSpecifications ',
          align: 'center',
          title: '属性'
        }
      ],
      ruleValidate: {
        skuNo: [
          {
            required: true,
            message: 'SKU编号不能为空',
            trigger: 'blur'
          }
        ],
        estimateDeliveryDays: [
          {
            required: true,
            message: '预计交期不能为空',
            trigger: 'blur'
          }
        ]
      }
    };
  },
  watch: {
    pageParamsStatus (n, o) {
      let v = this;
      if (n) {
        v.$nextTick(() => {
          v.getList();
          v.pageParamsStatus = false;
        });
      }
    }
  },
  created () {
    this.pageParams.pageSize = this.getPageSizeCache();
  },
  activated () {
    this.reset();
    if (sessionStorage.getItem('supplierId')) {
      this.pageParams.supplierId = sessionStorage.getItem('supplierId');
      sessionStorage.removeItem('supplierId');
    }
    this.initBaseData();
    this.startLoading();
  },
  methods: {
    startLoading () {
      this.$Loading.start();
      this.getList();
    },
    getList () { // 獲取分頁
      let v = this;
      // supplierProduct_list
      if (!v.getPermission('supplierProduct_list')) {
        return;
      }
      v.pageParams.skuOrName = v.pageParams.skuOrName ? v.pageParams.skuOrName : null;
      v.Tableloading = true;
      v.SearchDisabled = true;
      v.productsData = [];
      v.axios.post(api.productList, v.pageParams).then(response => {
        v.productsData.length > 0 && (v.productsData = []);
        if (response.data.code == 0) {
          let arr = response.data.datas.list;
          v.getProductListInfo(arr.map(i => i.goodsId)).then((data) => {
            arr.forEach(i => {
              data.forEach(j => {
                if (i.goodsId === j.productGoodsId) {
                  Object.keys(j).forEach(key => {
                    if (['productGoodsSpecifications'].includes(key)) {
                      i[key] = j[key];
                    }
                  });
                  if (j.productGoodsSpecifications) {
                    i.productGoodsSpecifications = j.productGoodsSpecifications.map(i => i.name + ':' + i.value).join(',');
                  } else {
                    i.productGoodsSpecifications = null;
                  }
                }
              });
            });
            // let sku = '';
            arr.forEach((n, i) => {
              if (!v.productsData || v.productsData.length == 0) {
                v.productsData.push({
                  supplierName: n.supplierName,
                  supplierId: n.supplierId,
                  supplierGoodsList: [n]
                });
              } else {
                let isExist = false;
                v.productsData.forEach((m, j) => { // 如果为同一sku,归到同一数组
                  if (n.supplierId == m.supplierId) {
                    m.supplierGoodsList.push(n);
                    isExist = true;
                  }
                });
                if (!isExist) { // 如果不存在相同sku,数组新增一个对象
                  v.productsData.push({
                    supplierName: n.supplierName,
                    supplierId: n.supplierId,
                    supplierGoodsList: [n]
                  });
                }
              }
            });
            v.total = response.data.datas.total;
            v.$Loading.finish(); // 隐藏加载条
          });
        }
        v.Tableloading = false;
        v.SearchDisabled = false;
      });
    },
    reset () {
      this.$refs['pageParams'].resetFields();
      this.pageParams.skuOrName = null;
      this.pageParams.skuOrNameType = '1';
    },
    changePage (page) {
      this.$Loading.start();
      this.pageParams.pageNum = page;
      this.getList();
    },
    searchOrder () {
      let v = this;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
      v.$Loading.start();
      v.pageParamsStatus = true;
    },
    seeHisPrice () {
      let v = this;
      v.isShowHisPrice = true;
    },
    hisPriceTabFn (name) {
      // let v = this;
    },
    getSelectValue (selection) { // 主table获取所选值
      this.selectionArr = selection;
    },
    rowOperation (name, rowdata, index) { // name: '1'： 查看，'2': 编辑，'3':作废
      if (name == '1') {
        this.$nextTick(() => {
          this.editProFn(false, rowdata);
        });
      } else if (name == '2') {
        this.editProFn(true, rowdata);
      } else if (name == '3') {
        this.disableFn(rowdata);
      }
    },
    editProFn (name, data) { // 查看、编辑产品报价
      let v = this;
      v.isEditPro = name;
      v.quoteTitle = name ? '编辑报价' : '查看报价';
      v.axios.get(api.productQuerySupplierGoods + '?supplierGoodsIds=' + data.supplierGoodsId).then(res => {
        if (res.data.code == 0) {
          v.editProduct = Object.assign({}, res.data.datas[0]);
          v.editProduct.estimateDeliveryDays = String(v.editProduct.estimateDeliveryDays);
          v.isFirstCheck = v.editProduct.supplierDefaultSort === 0;
          v.getSupplierFn();
          v.getPriceList();
          v.getCurrencyInfo();
          v.getCountryFn();
          if (v.editProduct.provinceId) {
            v.getProvinceFn(true);
            if (v.editProduct.cityId) {
              v.getCityFn(true);
            }
          }
          v.isShowEditPro = true;
        }
      });
    },
    getPriceList () { // 获取价格列表
      let arr1 = this.editProduct.priceDetails.split(',');
      let arr2 = [];
      arr1.forEach((n, i) => {
        let obj = {
          quantity: n.split(':')[0],
          price: n.split(':')[1]
        };
        arr2.push(obj);
      });
      this.editProduct.priceDetailsList = arr2;
    },
    getSupplierFn () { // 供应商下拉列表
      let v = this;
      v.axios.get(api.queryIdAndName).then(res => {
        if (res.data.code == 0) {
          v.supplierArr = res.data.datas;
          if (v.editProduct.supplierId) {
            let isExist = false;
            v.supplierArr.forEach((n, i) => {
              if (n.supplierId.indexOf(v.editProduct.supplierId) != -1) {
                isExist = true;
              }
            });
            if (!isExist) {
              v.supplierArr.push({
                supplierId: v.editProduct.supplierId,
                supplierName: v.editProduct.supplierName ? v.editProduct.supplierName : ''
              });
            }
          }
        }
      });
    },
    getCountryFn () { // 获取国家列表
      let v = this;
      v.axios.get(api.country).then(res => {
        if (res.data.code == 0) {
          v.countryArr = res.data.datas;
        }
      });
    },
    countryChangeFn () { // 国家改变时，清空省、州和省、州列表
      this.$refs.provinceSelect.clearSingleSelect();
      this.provinceArr = [];
      this.cityArr = [];
    },
    getProvinceFn (name) { // 获取省、州列表
      let v = this;
      if (name) {
        if (v.editProduct.countryId) {
          v.axios.get(api.province + '?countryId=' + v.editProduct.countryId).then(res => {
            if (res.data.code == 0) {
              v.provinceArr = res.data.datas;
            }
          });
        } else {
          v.$Message.warning('请先选择国家');
        }
      }
    },
    provinceChangeFn () { // 省、州改变时，清空城市和城市列表
      this.$refs.citySelect.clearSingleSelect();
      this.cityArr = [];
    },
    getCityFn (name) {
      let v = this;
      if (name) {
        if (v.editProduct.provinceId) {
          v.axios.get(api.allCity + '?stateId=' + v.editProduct.provinceId).then(res => {
            if (res.data.code == 0) {
              v.cityArr = res.data.datas;
            }
          });
        } else {
          v.$Message.warning('请先选择省州');
        }
      }
    },
    removePriceAction (index) {
      this.editProduct.priceDetailsList.splice(index, 1);
    },
    chooseSkuFn () {
      let v = this;
      let obj = {
        pageNum: 1,
        pageSize: 10
      };
      v.axios.post(api.goodsList, obj).then(res => {
        if (res.data.code == 0) {
          v.skuData = res.data.datas.list;
          v.skuParams.total = res.data.datas.total;
          v.skuData.forEach((n, i) => {
            v.$set(v.skuData[i], 'isCheck', false);
          });
        }
        v.chosenSku = {};
        v.isShowChooseSku = true;
      });
    },
    skuChangePageSize (pageSize) {
      this.skuParams.pageSize = pageSize;
    },
    skuChangePage (page) {
      this.skuParams.pageNum = page;
    },
    confirmSku () {
      let v = this;
      if (!v.chosenSku) {
        v.$Message.error({
          content: '请选择需要的SKU！',
          duration: 1
        });
      } else {
        v.editProduct.skuNo = v.chosenSku.sku;
        v.editProduct.goodsName = v.chosenSku.cnName;
        v.editProduct.goodsThumbUrl = v.chosenSku.goodsUrl;
        v.editProduct.goodsBrandId = v.chosenSku.productBrandId;
        v.editProduct.goodsCategoryId = v.chosenSku.productCategoryId;
        v.isShowChooseSku = false;
      }
    },
    addPriceAction () {
      this.editProduct.priceDetailsList = this.editProduct.priceDetailsList ? this.editProduct.priceDetailsList : [];
      this.editProduct.priceDetailsList.push({
        quantity: null,
        price: null
      });
    },
    searchSkuFn () { // 搜索sku
      let v = this;
      let obj = {
        pageNum: 1,
        pageSize: 10,
        sku: v.searchSku
      };
      v.axios.post(api.goodsList, obj).then(res => {
        if (res.data.code == 0) {
          v.skuData = res.data.datas;
          v.isShowChooseSku = true;
        }
      });
    },
    disableFn (data) {
      let v = this;
      let params = {
        operationType: '7',
        supplierGoodsIds: [data.supplierGoodsId]
      };
      v.axios.post(api.productDelete, params).then(res => {
        if (res.data.code == 0) {
          v.$Message.success('作废成功');
          v.getList();
        }
      });
    },
    viewHistoryFn (data, index) {
      this.hisPriceParams.skuNo = data.skuNo;
      this.getHisPrice();
      this.isShowHisPrice = true;
    },
    getHisPrice () {
      let v = this;
      v.Tableloading = true;
      v.axios.post(api.queryPriceHistory, v.hisPriceParams).then(res => {
        v.Tableloading = false;
        if (res.data.code == 0) {
          v.hisPriceParams.total = res.data.datas.total;
          v.hisPriceData1 = res.data.datas.list;
        }
      });
    },
    hisPriceChangePageSize (pageSize) {
      this.hisPriceParams.pageSize = pageSize;
      this.getHisPrice();
    },
    hisPriceChangePage (page) {
      this.hisPriceParams.pageNum = page;
      this.getHisPrice();
    },
    getPriceDetails () {
      let arr = [];
      if (this.editProduct.priceDetailsList && this.editProduct.priceDetailsList.length > 0) {
        this.editProduct.priceDetailsList.forEach((n, i) => {
          arr.push(n.quantity + ':' + n.price);
        });
        this.editProduct.priceDetails = arr.join(',');
      }
    },
    saveProFn (name) {
      let v = this;
      v.$refs[name].validate((valid) => {
        if (valid) {
          v.getPriceDetails();
          v.editProduct.supplierDefaultSort = v.isFirstCheck ? 0 : null;
          v.editProduct.estimateDeliveryDays = Number(v.editProduct.estimateDeliveryDays);
          v.editProduct.priceDetailsList = null;
          v.editProduct.supplierPurchaseLink = v.editProduct.supplierPurchaseLink
            ? v.editProduct.supplierPurchaseLink
            : null; // 空字符转为null
          v.axios.post(api.saveSupplierGoods, [v.editProduct]).then(res => {
            if (res.data.code == 0) {
              v.$Message.success('保存成功');
              v.isShowEditPro = false;
              v.getList();
            } else {
              v.editProduct.estimateDeliveryDays = String(v.editProduct.estimateDeliveryDays);
            }
          });
        }
      });
    },
    submitProFn (name) {
      let v = this;
      v.$refs[name].validate((valid) => {
        if (valid) {
          v.getPriceDetails();
          v.editProduct.supplierDefaultSort = v.isFirstCheck ? 0 : null;
          v.editProduct.estimateDeliveryDays = Number(v.editProduct.estimateDeliveryDays);
          v.editProduct.priceDetailsList = null;
          v.editProduct.supplierPurchaseLink = v.editProduct.supplierPurchaseLink
            ? v.editProduct.supplierPurchaseLink
            : null; // 空字符转为null
          v.axios.post(api.submitProductQuotation, [v.editProduct]).then(res => {
            if (res.data.code == 0) {
              v.$Message.success('保存成功');
              v.isShowEditPro = false;
              v.getList();
            } else {
              v.editProduct.estimateDeliveryDays = String(v.editProduct.estimateDeliveryDays);
            }
          });
        }
      });
    },
    getSelectSku (selection) { // 选择SKU table获取所选值
      let v = this;
      if (!selection || selection.length > 1) {
        v.$Message.error({
          content: '只能选择一项SKU！',
          duration: 1
        });
      }
      this.selectionSkuArr = selection;
    },
    initBaseData () {
      let v = this;
      v.axios.get(api.queryIdAndName).then(res => {
        if (res.data.code == 0) {
          v.suplierArr = res.data.datas;
        }
      });
      let obj = {
        allFlag: null
      };
      v.axios.post(api.categoryList, obj).then(res => {
        if (res.data.code == 0) {
          v.sortArr = res.data.datas;
        }
      });
    }
  }
};
</script >
