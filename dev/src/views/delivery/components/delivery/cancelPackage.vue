<template>
  <div>
    <div v-if="storeStatus && allStorelist !== [] && allStorelist !== null" class="selectStore">
      请选择仓库： <dyt-select v-model="selectStore" style="width:200px">
        <Option v-for="(item,index) in allStorelist" :value="item.warehouseId" :key="index">{{ item.warehouseName }}</Option>
      </dyt-select>
    </div>
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <Form ref="pageParams" :model="pageParams" :label-width="70">
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
            <div class="platformParamsMoreSection" :class="{none : !moreFilter}">
              <Row>
                <Col :lg="threeItemLg" :md="threeItemMd">
                <FormItem label="平台" prop="platformId">
                  <dyt-select v-model="pageParams.platformId" @on-change="changeValue">
                    <Option v-for="item in platformArr" :key="item.platformId" :label="item.title" :value="item.platformId"></Option>
                  </dyt-select>
                </FormItem>
                </Col>
                <Col :lg="threeItemLg" :md="threeItemMd" :class="{none : !moreFilter}" :offset="1">
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
                <Col :lg="threeItemLg" :md="threeItemMd" :class="{none : !moreFilter}" :offset="1">
                <Form-item label="国家/地区" prop="buyerCountryCodeList">
                  <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" filterable multiple placeholder="请选择或输入所在地">
                    <Option v-for="(item,index) in formValidate.country" :key="index" :value="item.twoCode">{{ item.enName }}</Option>
                  </dyt-select>
                </Form-item>
                </Col>
              </Row>
              <Row class="normalTop">
                <Col :lg="threeItemLg" :md="threeItemMd">
                <Form-item label="包裹号" prop="packageCode">
                  <Input placeholder="请输入包裹号" v-model.trim="pageParams.packageCode"></Input>
                </Form-item>
                </Col>
                <Col :lg="threeItemLg" :md="threeItemMd" :offset="1">
                <Form-item label="订单号" prop="orderNo">
                  <Input placeholder="请输入订单号,多个订单号用逗号或回车分隔" type="textarea" v-model.trim="pageParams.orderNo"></Input>
                </Form-item>
                </Col>
                <Col :lg="threeItemLg" :md="threeItemMd" :offset="1">
                <Form-item label="买家姓名" prop="buyerName">
                  <Input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></Input>
                </Form-item>
                </Col>
              </Row>
              <Row class="normalTop">
                <Col :lg="threeItemLg" :md="threeItemMd">
                <Form-item label="买家ID" prop="buyerAccountId">
                  <Input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></Input>
                </Form-item>
                </Col>
                <Col :lg="threeItemLg" :md="threeItemMd" :offset="1">
                <Form-item label="平台产品编码" prop="webstoreItemId">
                  <Input placeholder="请输入平台产品编码" v-model.trim="pageParams.webstoreItemId"></Input>
                </Form-item>
                </Col>
                <Col :lg="threeItemLg" :md="threeItemMd" :offset="1">
                <Form-item label="SKU" prop="sku">
                  <Input placeholder="请输入SKU" v-model.trim="pageParams.sku"></Input>
                </Form-item>
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
          <Button v-if="item.selected" type="primary" @click="modifyTheSort(index, item.status)" :key="index">
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
      <Buttons type="primary" style="margin-left: 20px" trigger="click" @on-click="cancelPackageHasCondition">
        <Button type="primary" class="iconbuttons" @click="cancelPackage">
          <Icon type="document-text"></Icon>
          回收
        </Button>
        <Buttons-menu slot="list">
          <Buttons-item name="1">回收（所有结果集）</Buttons-item>
        </Buttons-menu>
      </Buttons>
    </div>
    <div class="orderTable normalTop">
      <keep-alive>
        <Table highlight-row border :loading="loading" :height="tableHeight" :columns="orderColumn" :data="cancelData" @on-selection-change="getSelectValue"></Table>
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
        <packageDetails :allStorelist="allStorelist" :packageId="packageId" @spinLoading="spinLoading" @updateList="getList" @resetSpinShow="resetSpinShow" :timestamp="timestamp"></packageDetails>
      </sliderModal>
    </keep-alive>
    <!-- 回收 -->
    <Modal v-if="cancelPackageModelStatus" v-model="cancelPackageModel.status" width="400" @on-ok="beginCancelPackage">
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-head">
          <div class="ivu-modal-confirm-head-title">{{ cancelPackageModel.title }}</div>
        </div>
        <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
          <div class="normalTop">
            <Row>
              <Col :span="1">
              <Icon type="md-information-circle" color="#2b85e4" size="44"></Icon>
              </Col>
              <Col :span="21" :offset="2">
              <p>
                {{ cancelPackageModel.content }} </p>
              </Col>
            </Row>
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
import publicService from '@/components/mixin/publicService_mixin';

export default {
  mixins: [Mixin, deliveryMixin, publicService],
  components: {
    packageDetails
  },
  data () {
    var self = this;
    return {
      // 详情参数 Start
      packageModel: false,
      packageDetailsStatus: true,
      packageId: null,
      timestamp: null, // End
      packageIds: [],
      selectId: null,
      cancelPackageModelStatus: false,
      cancelPackageModel: {
        status: false,
        type: '',
        title: '',
        content: '请确保您已经将拣出的物品还回仓库，并将已打印的面单销毁。'
      },
      loading: false,
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
          width: 140,
          align: 'center',
          render: (h, params) => {
            let pos = [];
            if (params.row.packageOrderBoList !== null) {
              for (let i = 0; i < params.row.packageOrderBoList.length; i++) {
                var n = params.row.packageOrderBoList[i];
                pos.push(h('div', params.row.accountCode + '-' + n.salesRecordNumber));
              }
              return h('div', pos);
            }
          }
        }, {
          title: '买家ID/姓名',
          key: 'buyerName',
          align: 'center',
          width: 150,
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
          width: 110
        }, {
          title: '物流方式',
          key: 'merchantShippingMethodId',
          minWidth: 200,
          render: (h, params) => {
            if (params.row.carrierName === null || params.row.carrierName === '') {
              return '';
            } else {
              return h('div', params.row.carrierName + ' > ' + params.row.carrierShippingMethodName);
            }
          }
        }, {
          title: '运单号',
          key: 'trackingNumber',
          width: 180,
          align: 'center'
        }, {
          title: '付款时间',
          width: 160,
          align: 'center',
          key: 'payTime',
          render: (h, params) => {
            return self.getDataToLocalTime(params.row.payTime, 'fulltime');
          }
        }, {
          title: '作废原因',
          width: 180,
          align: 'center',
          resizable: true,
          key: 'rehandleReason',
          render: (h, params) => {
            return h('div', {
              class: 'redColor'
            }, params.row.rehandleReason);
          }
        }, {
          title: '操作',
          key: 'operate',
          width: 80,
          fixed: 'right',
          align: 'center',
          render: (h, params) => {
            if (params.row !== undefined) {
              return h('Button', {
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    self.selectId = params.row.packageId;
                    self.cancelPackage('single');
                  }
                }
              }, '回收');
            }
          }
        }
      ],
      cancelData: [],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      buttonGroupModel: [
        {
          type: 'printTime',
          selected: true,
          status: true, // true up false down
          title: '按打印时间'
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
      totalPage: 0,
      total: 0,
      curPage: 1,
      moreFilter: false, // 高级筛选
      moreFilterIcon: 'md-arrow-dropdown',
      moreFilterMes: '更多选项（平台、店铺、国家/地区等）',
      platformArr: [
        {
          platformId: '全部',
          title: '全部'
        }, {
          platformId: 'ebay',
          title: 'ebay'
        }
      ],
      shopList: [],
      pageParamsPrototype: null, // 重置查询条件
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        status: 0,
        getLabelStatus: null,
        platFormId: null,
        saleAccountIds: [],
        buyerCountryCodeList: [],
        packageCode: null,
        orderNo: null,
        buyerName: null,
        buyerAccountId: null,
        webstoreItemId: null,
        sku: null,
        searchValue: null, // 搜索内容
        warehouseId: self.selectStore // 仓库
      }
    };
  },
  activated () {
    this.reset();
    this.startLoading();
  },
  computed: {
    tableHeight () {
      return this.getTableHeight(400);
    }
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
      v.loading = true;
      Promise.resolve(v.getList()).then(() => {
        v.$Loading.finish();
        v.getShopList();
      });
    },
    getList () {
      let v = this;
      if (v.pageParams.warehouseId) {
        v.axios.post(api.get_cancelPackageList, JSON.stringify(v.pageParams)).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas.list;
            let saleAccountIdPos = [];
            let pos = [];
            let merchantShippingMethodIdPos = [];
            if (data !== null && data.length > 0) {
              data.forEach((n, i) => {
                n.carrierName = null;
                n.carrierShippingMethodName = null;
                n.index = i;
                pos.push(n);
                saleAccountIdPos.push(n.saleAccountId);
                merchantShippingMethodIdPos.push(n.merchantShippingMethodId);
              });
            } else {
              v.cancelData = [];
              v.loading = false;
              v.$nextTick(function () {
                v.total = 0;
                v.totalPage = 0;
              });
            }
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
              }), v.axios.post(api.queryCarrierShippingName, JSON.stringify(merchantShippingMethodIdPos)).then(response1 => {
                if (response1.data.code === 0) {
                  if (response1.data.datas.length > 0) {
                    response1.data.datas.forEach((n, i) => {
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
                v.loading = false;
                v.$nextTick(function () {
                  v.total = Number(response.data.datas.total);
                  v.totalPage = Number(response.data.datas.pages);
                  v.loading = false;
                });
                v.cancelData = pos;
              });
            }
          } else {
            v.$nextTick(function () {
              v.total = 0;
              v.totalPage = 0;
            });
          }
        });
      }
    },
    reset () {
      let v = this;
      v.$refs['pageParams'].resetFields();
    },
    search () {
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
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
    cancelPackageHasCondition () {
      this.cancelPackage('all');
    },
    cancelPackage (type) {
      let v = this;
      if (v.packageIds.length === 0 && type !== 'all' && type !== 'single') {
        v.$Message.error('请选择包裹');
        return false;
      }
      if (type === 'all') {
        v.cancelPackageModel.title = '批量回收（所有结果集）';
        v.cancelPackageModel.type = 'all';
      } else if (type === 'single') {
        v.cancelPackageModel.type = 'single';
        v.cancelPackageModel.title = '批量回收';
      } else {
        v.cancelPackageModel.type = '';
        v.cancelPackageModel.title = '批量回收';
      }
      v.cancelPackageModelStatus = true;
      v.$nextTick(function () {
        v.cancelPackageModel.status = true;
      });
    },
    beginCancelPackage () {
      let v = this;
      let obj;
      if (v.cancelPackageModel.type === 'single') {
        obj = {
          packageIds: [v.selectId]
        };
      } else if (v.cancelPackageModel.type === 'all') {
        obj = v.deepCopy(v.pageParams);
      } else {
        obj = {
          packageIds: v.packageIds
        };
      }
      v.axios.put(api.del_package, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.success('操作失败，请重新尝试');
        }
      });
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
  }
};
</script>
