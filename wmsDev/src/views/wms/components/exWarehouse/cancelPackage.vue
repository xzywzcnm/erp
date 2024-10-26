<template>
  <div class="cancelPackage">
    <div v-if="workShow === 'list'" class="listPage">
      <div class="searchMain">
        <Form ref="pageParams" :model="pageParams" :label-width="80">
          <dyt-filter ref="dyt-filter" @expand="expand">
            <Form-item label="搜索字符" prop="searchValue">
              <Input placeholder="可输入订单号、出库单号、买家ID、买家姓名、SKU" v-model.trim="pageParams.searchValue"></Input>
            </Form-item>
            <Form-item label="国家/地区" prop="buyerCountryCodeList">
              <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" multiple
                placeholder="请选择或输入所在地" :max-tag-count="1">
                <Option v-for="(item, index) in formValidate.country" :key="index" :value="item.twoCode">{{
                    item.enName
                }} </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="SKU" prop="sku">
              <dyt-input-tag :limit="1" :string="true" type="textarea" v-model.trim="pageParams.sku"
                placeholder="请输入SKU" />
            </Form-item>
            <Form-item label="出库单号" prop="packageCode">
              <Input placeholder="请输入出库单号" v-model.trim="pageParams.packageCode"></Input>
            </Form-item>
            <Form-item label="订单号" prop="orderNo">
              <Input placeholder="请输入订单号" v-model.trim="pageParams.orderNo"></Input>
            </Form-item>
            <Form-item label="买家姓名" prop="buyerName">
              <Input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></Input>
            </Form-item>
            <Form-item label="买家ID" prop="buyerAccountId">
              <Input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></Input>
            </Form-item>
            <Form-item label="作废时间">
              <Date-picker type="datetimerange" @on-clear="resetDate" @on-change="getDateValue" transfer
                style="width: 100%" :clearable="clearAble" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end"
                :value="payTimeArr"></Date-picker>
            </Form-item>
            <Form-item label="运单号" prop="trackingNumber">
              <dyt-input-tag :limit="1" :string="true" type="textarea" v-model.trim="pageParams.trackingNumber"
                placeholder="请输入运单号" />
            </Form-item>
            <FormItem label="回收状态" prop="rehandleStatus">
              <dyt-select v-model="pageParams.rehandleStatus">
                <Option v-for="(item, i) in statusList" :value="item.status" :key="i + 'statusList'"
                  :label="item.title">
                </Option>
              </dyt-select>
            </FormItem>
            <div slot="operation">
              <Button type="primary" @click="search" :disabled="SearchDisabled" icon="ios-search"
                class="mr10">查询</Button>
              <Button @click="reset" v-once icon="md-refresh">重置</Button>
            </div>
          </dyt-filter>
        </Form>
      </div>
      <div class="funMain">
        <div class="funMain__flex">
          <!--<div>
              <span>排序：</span>
              <Button-group>
                  <template v-for="(item, index) in buttonGroupModel">
                      <Button
                          v-if="item.selected"
                          type="primary"
                          @click="modifyTheSort(index, item.status)"
                          :key="index"
                      >
                          {{ item.title }}
                          <Icon
                              type="arrow-up-c"
                              v-if="item.status && item.selected"
                          ></Icon>
                          <Icon
                              type="arrow-down-c"
                              v-if="!item.status && item.selected"
                          ></Icon>
                      </Button>
                      <Button
                          v-if="!item.selected"
                          @click="modifyTheSort(index, item.status)"
                          :key="index"
                      >
                          {{ item.title }}
                          <Icon
                              type="arrow-up-c"
                              v-if="item.status && item.selected"
                          ></Icon>
                          <Icon
                              type="arrow-down-c"
                              v-if="!item.status && item.selected"
                          ></Icon>
                      </Button>
                  </template>
              </Button-group>
          </div>-->
          <div>
            <Buttons type="primary" trigger="click" @on-click="cancelPackageHasCondition" class="mr10">
              <Button type="primary" class="iconbuttons" @click="cancelPackage"
                :disabled="!getPermission('packageInfo_updateRecycle_batch')">
                <Icon type="document-text"></Icon>
                回收
              </Button>
              <Buttons-menu slot="list">
                <Buttons-item name="1" v-if="getPermission('packageInfo_updateRecycle_all')">回收（所有结果集）
                </Buttons-item>
              </Buttons-menu>
            </Buttons>
            <Buttons class="button-left" type="primary" trigger="click" @on-click="exportSelectedAll">
              <Button type="primary" class="iconbuttons" @click="exportSelectedSingle">
                <Icon type="document-text"></Icon>
                导出选中
              </Button>
              <Buttons-menu slot="list">
                <Buttons-item name="1">导出（所有结果集）</Buttons-item>
              </Buttons-menu>
            </Buttons>
          </div>
        </div>
      </div>
      <div class="tableMain">
        <div class="tableBox">
          <Table highlight-row border :loading="TableLoading" :height="tableHeight" :columns="orderColumn"
            :data="cancelData" @on-selection-change="getSelectValue"></Table>
        </div>
      </div>
      <div class="pagesMain">
        <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
          :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top"
          :page-size-opts="pageArray"></Page>
      </div>
    </div>

    <!-- 回收 -->
    <Modal v-if="cancelPackageModelStatus" v-model="cancelPackageModel.status" width="400" @on-ok="beginCancelPackage">
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-head">
          <div class="ivu-modal-confirm-head-title">
            {{ cancelPackageModel.title }}
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
                {{ cancelPackageModel.content }} </p>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </Modal>

    <div v-if="workShow === 'detail'">
      <sellStockOutDtl :workShow="workShow" :pickingNo="packageCode" workType="sellStock"></sellStockOutDtl>
    </div>
  </div>
</template>
<style lang='less' scoped>
.card-content {
  .filterTop {
    margin-top: 20px;
  }
}

.tableControl {
  .button-left {
    margin-left: 30px;
  }
}
</style>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import packageDetails from './packageDetails';
import deliveryMixin from '@/components/mixin/delivery_mixin';
import publicService from '@/components/mixin/publicService_mixin';
import sellStockOutDtl from './sellStockOutDtl';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';

export default {
  mixins: [Mixin, deliveryMixin, publicService, tableHeight_mixin],
  components: {
    packageDetails,
    sellStockOutDtl
  },
  data () {
    var self = this;
    return {
      // 详情参数 Start
      clearAble: true,
      payTimeArr: [],
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
      orderColumn: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '出库单号',
          key: 'packageCode',
          align: 'center',
          width: 140,
          render: (h, params) => {
            if (this.getPermission('wmsPicking_querySalesPickingDetail')) {
              return h('span', {
                class: 'blueColor cursor underline',
                on: {
                  click: () => {
                    // self.showPackageDetails(params.row.packageId);
                    self.showPackageDetails(params.row.packageCode, 'detail');
                  }
                }
              }, params.row.packageCode);
            } else {
              return h('div', params.row.packageCode);
            }
          }
        }, {
          title: '订单号',
          align: 'center',
          key: 'salesRecordNumber',
          width: 140,
          render: (h, params) => {
            let pos = [];
            if (params.row.packageOrderBoList !== null) {
              for (let i = 0; i < params.row.packageOrderBoList.length; i++) {
                var n = params.row.packageOrderBoList[i];
                // pos.push(
                //   h('div', params.row.accountCode + '-' + n.salesRecordNumber)
                // );
                if (n.accountCode) {
                  pos.push(h('div', n.accountCode + '-' + n.salesRecordNumber));
                } else {
                  pos.push(h('div', n.salesRecordNumber));
                }
              }
              return h('div', pos);
            }
          }
        }, {
          title: '回收状态',
          align: 'center',
          key: 'rehandleStatus',
          width: 110,
          render: (h, params) => {
            let status = params.row.isRehandle;
            let time = params.row.requestRehandleTime;
            let text = '';
            if (status === 1) {
              text = '等待回收';
            }
            if (status === 2 && time != null) {
              text = '回收完成';
            }
            if (status === 2 && time == null) {
              text = '不需要回收';
            }
            return h('div', text);
          }
        }, {
          title: '买家ID/姓名',
          key: 'buyerName',
          align: 'center',
          width: 120,
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
          align: 'center',
          key: 'buyerCountryCode',
          width: 100
        }, {
          title: '物流方式',
          align: 'center',
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
          align: 'center',
          key: 'trackingNumber',
          width: 180
        }, {
          title: '付款时间',
          align: 'center',
          width: 160,
          key: 'payTime',
          render: (h, params) => {
            return self.$uDate.getDataToLocalTime(params.row.payTime, 'fulltime');
          }
        }, {
          title: '作废原因',
          align: 'center',
          width: 180,
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
          width: 90,
          align: 'center',
          fixed: 'right',
          render: (h, params) => {
            if (params.row !== undefined && params.row.isRehandle === 1) {
              return h('Button', {
                props: {
                  size: 'small',
                  disabled: !this.getPermission('packageInfo_updateRecycle_single')
                },
                on: {
                  click: () => {
                    self.selectId = params.row;
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
          title: '按出库单号'
        }
      ],
      totalPage: 0,
      total: 0,
      curPage: 1,
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
        cancelStartTime: null,
        cancelEndTime: null,
        getLabelStatus: null,
        platFormId: null,
        saleAccountIds: [],
        buyerCountryCodeList: [],
        packageCode: null,
        orderNo: null,
        buyerName: null,
        buyerAccountId: null,
        webstoreItemId: null,
        trackingNumber: null,
        sku: null,
        searchValue: null, // 搜索内容
        rehandleStatus: 0,
        warehouseId: self.getWarehouseId()
      }, // 以下为修改包裹详情页后新增变量
      workShow: 'list',
      packageCode: '',
      statusList: [
        // {
        //   selected: false,
        //   status: '*',
        //   title: '全部'
        // },
        {
          selected: true,
          status: 0,
          title: '等待回收'
        }, {
          selected: false,
          status: 1,
          title: '回收完成'
        }, {
          selected: false,
          status: 2,
          title: '不需要回收'
        }
      ],
      selectValue: []
    };
  }, // activated () {
  //   this.startLoading();
  // },
  // computed: {
  //   tableHeight() {
  //     return this.getTableHeight(310);
  //   }
  // },
  watch: {
    pageParamsStatus (n) {
      let v = this;
      if (n) {
        v.getList();
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
  methods: {
    resetDate () {
      let v = this;
      v.pageParams.cancelStartTime = '';
      v.pageParams.cancelEndTime = '';
    },
    getDateValue (value) {
      // 获取日期返回值
      let v = this;
      if (value.length === 0 || !value[0]) {
        v.resetDate();
      } else {
        if (value[0] !== '') {
          v.pageParams.cancelStartTime = v.$uDate.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
          v.pageParams.cancelEndTime = v.$uDate.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
        }
      }
    },
    startLoading () {
      let v = this;
      v.$Loading.start();
      Promise.resolve(v.getPermission('packageInfo_queryForRecycle') ? v.getList() : v.gotoError()).then(() => {
        v.$Loading.finish();
        v.getShopList();
      });
    },
    getList () {
      let v = this;
      v.pageParams.pageSize = this.getPageSizeCache();
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(api.get_cancelPackageList, JSON.stringify(v.pageParams)).then(response => {
        v.TableLoading = false;
        v.SearchDisabled = false;
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
            v.TableLoading = false;
            v.SearchDisabled = false;
            v.$nextTick(function () {
              v.total = 0;
              v.totalPage = 0;
            });
          }
          if (saleAccountIdPos.length > 0) {
            Promise.resolve(v.axios.post(api.queryCarrierShippingName, JSON.stringify(merchantShippingMethodIdPos)).then(response1 => {
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
              v.TableLoading = false;
              v.SearchDisabled = false;
              v.$nextTick(function () {
                v.total = Number(response.data.datas.total);
                v.totalPage = Number(response.data.datas.pages);
                v.TableLoading = false;
                v.SearchDisabled = false;
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
    },
    reset () {
      let v = this;
      v.payTimeArr = [];
      v.$refs['pageParams'].resetFields();
      // v.selectStatus(0, true);
    },
    search () {
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    getSelectValue (value) {
      // table获取所选值
      let v = this;
      let pos = [];
      v.selectValue = value;
      Promise.resolve(value.forEach((n, i) => {
        if (n.isRehandle === 1) {
          pos.push(n.packageId);
        }
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
    // },
    showPackageDetails (packageCode, detail) {
      this.packageCode = packageCode;
      this.workShow = detail;
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
        v.cancelPackageModel.title = '回收';
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
          packageIds: v.selectId.isRehandle === 1 ? [v.selectId.packageId] : [],
          warehouseId: v.getWarehouseId()
        };
      } else if (v.cancelPackageModel.type === 'all') {
        obj = v.deepCopy(v.pageParams);
      } else {
        obj = {
          packageIds: v.packageIds,
          warehouseId: v.getWarehouseId()
        };
      }
      v.axios.put(api.del_package, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        } else {
          v.$Message.success('操作失败，请重新尝试');
        }
      });
    },
    // 导出所有的出库单
    exportSelectedAll () {
      let v = this;
      v.axios.post(api.export_cancelPackageList, JSON.stringify(v.deepCopy(v.pageParams))).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        } else {
          v.$Message.success('操作失败，请重新尝试');
        }
      });
    }, // 导出选中
    exportSelectedSingle () {
      let v = this;
      if (v.selectValue.length > 0) {
        let arr = [];
        v.selectValue.map((item) => {
          arr.push(item.packageId);
        });
        let query = {
          packageIds: arr,
          warehouseId: v.getWarehouseId()
        };
        v.axios.post(api.export_cancelPackageList, JSON.stringify(query)).then(response => {
          if (response.data.code === 0) {
            v.$Message.success('操作成功');
            v.pageParamsStatus = true;
          } else {
            v.$Message.success('操作失败，请重新尝试');
          }
        });
      } else {
        v.$Message.error('请选择包裹');
        return false;
      }
    }
  },
  created () {
    let v = this;
    // v.startLoading();
    v.pageParamsPrototype = v.deepCopy(v.pageParams);
  },
  mounted () {
    let v = this;
    setTimeout(v.getCountrys(), 2000); // 获取国家区域列表
  }
};
</script>
<style lang="less" scoped>
.cancelPackage {
  height: 100%;
}
</style>
