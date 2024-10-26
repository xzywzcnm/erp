<style>
.text-overflow {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
<template>
  <div>
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content platformParamsSelect">
          <Form ref="pageParams" :model="pageParams" :label-width="80">
            <dyt-filter>
              <FormItem label="状态：" prop="name">
                <Button-group>
                  <template v-for="(item, index) in statusList">
                    <Button v-if="item.selected" type="primary" @click="selectStatus(index, item.status)" :key="index">{{
                      item.title }}</Button>
                    <Button v-if="!item.selected" @click="selectStatus(index, item.status)" :key="index">{{ item.title
                    }}</Button>
                  </template>
                </Button-group>
              </FormItem>
              <FormItem label="物流方式：" prop="shippingList">
                <!-- <Cascader transfer v-model="shippingMethodModel" :load-data="loadData" @on-change="changeShippingMethod"
                  :data="$store.state.shippingMethodData" filterable change-on-select></Cascader> -->
                <dyt-shippingSelect v-model="pageParams.shippingList" @on-change="shippingChange" :loadingChildren="true"
                  placeholder="请选择物流方式" />
              </FormItem>
              <Form-item label="国家/地区">
                <dyt-select v-model="countryModal" @on-change="countryChange" :max-tag-count="1" multiple
                  placeholder="请选择或输入所在地">
                  <Option v-for="(item, index) in formValidate.country" :key="index" :value="item.twoCode"
                    :label="item.enName"></Option>
                </dyt-select>
              </Form-item>
              <Form-item label="SKU" prop="sku">
                <dyt-input-tag :limit="1" :string="true" type="textarea" placeholder="多个库区，用逗号或换行分隔"
                  v-model="pageParams.sku"></dyt-input-tag>
              </Form-item>
              <Form-item label="订单号" prop="orderNoList">
                <dyt-input-tag :limit="1" type="textarea" placeholder="多个订单号，用逗号或换行分隔"
                  v-model="pageParams.orderNoList"></dyt-input-tag>
              </Form-item>
              <Form-item label="出库单号" prop="packageCodeList">
                <dyt-input-tag :limit="1" type="textarea" placeholder="多个出库单号，用逗号或换行分隔"
                  v-model="pageParams.packageCodeList"></dyt-input-tag>
              </Form-item>
              <Form-item label="买家姓名" prop="buyerName">
                <dyt-input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></dyt-input>
              </Form-item>
              <Form-item label="买家ID" prop="buyerAccountId">
                <dyt-input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></dyt-input>
              </Form-item>
              <Form-item label="创建时间">
                <Date-picker type="daterange" style="width: 100%" transfer @on-clear="resetDate" @on-change="getDateValue"
                  :clearable="clearAble" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end"
                  placeholder="选择日期" :value="payTimeArr"></Date-picker>
              </Form-item>
              <Form-item label="搜索字符：" prop="searchValue">
                <dyt-input placeholder="可输入订单号、出库单号、买家ID、买家姓名、SKU" v-model.trim="pageParams.searchValue"></dyt-input>
              </Form-item>
              <!-- <Form-item label="货主" v-show="!isCargoOwner()">
                <dyt-select v-model="pageParams.cargoOwnerId">
                  <Option value="_NO_CARGO_OWNER">无货主</Option>
                  <template v-for="(item, hIndex) in $store.state.userInfoList">
                    <template v-if="isCargoOwner(item.businessRoleTypeList)">
                      <Option :value="item.userId" :key="hIndex">{{item.userName}}</Option>
                    </template>
                  </template>
                </dyt-select>
              </Form-item> -->
              <div slot="operation">
                <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询</Button>
                <Button style="margin-left: 10px;" @click="reset" v-once icon="md-refresh">重置</Button>
              </div>
            </dyt-filter>
          </Form>
        </div>
      </div>
    </div>
    <div class="clear">
      <div class="tableControl fl" v-if="!ymsMerchant">
        <span v-if="tableControlStatus">
          <Buttons type="primary" class="ml10" trigger="click" @on-click="getWayBillHasCondition">
            <Button type="primary" class="iconbuttons" @click="getWayBill" :disabled="!getPermission('packageInfo_waitingUploadGetExpressBill_batch')
              ">
              <Icon type="cloud"></Icon>
              获取面单
            </Button>
            <Buttons-menu slot="list">
              <Buttons-item name="1" v-if="getPermission('packageInfo_waitingUploadGetExpressBill_all')">获取面单（所有结果集）
              </Buttons-item>
            </Buttons-menu>
          </Buttons>
        </span>
        <Button type="primary" class="ml10" v-if="getPermission('packageInfo_batchInvalidPackage')"
          @click="voidIssueDocFn">作废出库单</Button>
        <!--云仓时，隐藏跳过获取面单按钮-->
        <Button type="primary" class="ml10" v-if="getPermission('packageInfo_ignoreGetLabel') && isYms !== 1"
          @click="igGetLabelFn">跳过获取面单</Button>
        <Dropdown @on-click="exportExcel" class="ml10" v-if="multipleExportPower || allExportPower">
          <Button type="primary">导出<Icon type="md-arrow-dropdown"></Icon></Button>
          <DropdownMenu slot="list">
            <DropdownItem v-if="multipleExportPower" name="1">导出选中数据
            </DropdownItem>
            <DropdownItem v-if="allExportPower" name="2">导出所有结果集
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div class="dataSort fr">
        <dyt-sortBySelect :sortButtonList="sortButtonList" :sorType="{ DESC: 'down', ASC: 'up' }"
          @sortInfo="getSortInfoAndFetch">
        </dyt-sortBySelect>
      </div>
    </div>
    <div class="orderTable normalTop">
      <Table highlight-row border :columns="faceSheetColumn" :height="tableHeight" :data="faceSheetData"
        v-table-scroll="TableLoading" :loading="TableLoading" @on-selection-change="getSelectValue" ref="selection">
      </Table>
      <div class="table-page">
        <div class="table-page-right">
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
            :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top"
            :page-size-opts="pageArray"></Page>
        </div>
      </div>
    </div>
    <!--批量作废包裹-->
    <voidIssueDoc ref="voidIssueDoc" :packageIdList="packageIdList" @getList="search"></voidIssueDoc>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import compoundBtn from '@/views/wms/components/common/compoundBtn';
import voidIssueDoc from '@/views/wms/components/common/voidIssueDoc';

export default {
  mixins: [Mixin],
  components: {
    compoundBtn,
    voidIssueDoc
  },
  props: {
    ymsMerchant: {
      default: false
    }
  },
  data() {
    let v = this;
    return {
      tableSltData: [],
      packageIdList: [],
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        cargoOwnerType: null,
        cargoOwnerId: null,
        getLabelStatus: 1,
        createdStartTime: null,
        createdEndTime: null,
        orderNoList: [],
        buyerName: null,
        buyerAccountId: null,
        sku: null,
        orderBy: 'createdTime',
        upDown: 'up',
        buyerCountryCodeList: null,
        warehouseId: v.getWarehouseId(),
        searchValue: null, // 搜索内容
        merchantCarrierIdList: [],
        merchantShippingMethodIdList: [],
        shippingList: [],
        packageCodeList: [],
      },
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      total: 0,
      curPage: 1,
      clearAble: true,
      statusList: [
        {
          selected: true,
          status: 1,
          title: '未获取'
        },
        {
          selected: false,
          status: 4,
          title: '获取失败'
        },
        {
          selected: false,
          status: 2,
          title: '后台获取中'
        }
      ],
      sortButtonList: [
        {
          sortHeader: "按创建时间",
          sortField: "createdTime",
          sortType: "up",
          default: true,
        },
        {
          sortHeader: "按下单时间",
          sortField: "salesTime",
          sortType: "up",
        },
        {
          sortHeader: "按下发物流商时间",
          sortField: "carrierSendDate",
          sortType: "up",
        },
      ],
      tableControlStatus: true,
      faceSheetColumn: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '出库单号',
          key: 'packageCode',
          align: 'center',
          width: 160,
          render: (h, params) => {
            if (this.getPermission('wmsPicking_querySalesPickingDetail')) {
              return h(
                'span',
                {
                  class: 'blueColor cursor underline',
                  on: {
                    click: () => {
                      this.$emit(
                        'showPackageDetails',
                        params.row,
                        'detail'
                      );
                    }
                  }
                },
                params.row.packageCode
              );
            } else {
              return h('div', params.row.packageCode);
            }
          }
        }, {
          title: '订单号',
          align: 'center',
          key: 'salesRecordNumber',
          width: 160,
          render: (h, params) => {
            let pos = [];
            if (params.row.packageOrderBoList !== null) {
              for (let i = 0; i < params.row.packageOrderBoList.length; i++) {
                let n = params.row.packageOrderBoList[i];
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
          title: '国家/地区',
          align: 'center',
          key: 'buyerCountryCodeList',
          width: 90
        }, {
          title: '物流方式',
          align: 'center',
          key: 'merchantShippingMethodId',
          minWidth: 200,
          render: (h, params) => {
            if (
              params.row.carrierName === null ||
              params.row.carrierName === ''
            ) {
              return '';
            } else {
              return h(
                'div',
                params.row.carrierName +
                ' > ' +
                params.row.carrierShippingMethodName
              );
            }
          }
        }, {
          title: 'SKU数量',
          align: 'center',
          key: 'skuQuantity',
          width: 90
        }, {
          title: '物品数量',
          align: 'center',
          key: 'productQuantity',
          minWidth: 100,
          maxWidth: 120
        },
        {
          title: '创建时间',
          align: 'center',
          width: 160,
          key: 'createTime',
          render: (h, params) => {
            return h(
              'span',
              this.$uDate.getDataToLocalTime(params.row.createdTime, 'fulltime')
            );
          }
        },
        {
          title: '状态',
          key: 'getLabelStatus',
          align: 'center',
          width: 100,
          render: (h, params) => {
            let d = params.row.getLabelStatus;
            let text = '获取失败';
            let icon = 'icon iconfont icon-weijiuxu';
            let iconColor = '#ff3300';
            let reason = params.row.getLabelFailReason;
            if (d === 1) {
              text = '未获取';
              icon = 'icon iconfont icon-weijiuxu';
              iconColor = '#444';
            } else if (d === 2) {
              text = '获取中';
              icon = 'icon iconfont icon-shenqingzhong';
              iconColor = '#f00';
            } else if (d === 3) {
              text = '申请成功';
              icon = 'icon iconfont icon-shenqingchenggong';
              iconColor = '#008000';
            }
            if (d === 4) {
              return h(
                'Tooltip',
                {
                  style: {
                    textAlign: 'center',
                    color: iconColor
                  },
                  class: 'wayBillStatusError',
                  props: {
                    content: reason,
                    transfer: true,
                    maxWidth: 250
                  }
                },
                [
                  h('div', [
                    h('span', {
                      class: icon
                    }),
                    h('div', text)
                  ])
                ]
              );
            } else {
              return h(
                'div',
                {
                  style: {
                    textAlign: 'center',
                    color: iconColor
                  }
                },
                [
                  h('div', [
                    h('span', {
                      class: icon
                    }),
                    h('div', text)
                  ])
                ]
              );
            }
          }
        },
        {
          title: '失败原因',
          width: 140,
          resizable: true,
          align: 'center',
          key: 'getLabelFailReason',
          render(h, params) {
            return h('Tooltip', {
              class: 'wayBillStatusError',
              props: {
                transfer: true,
                maxWidth: 250,
                content: params.row.getLabelFailReason
              }
            }, [
              h('span', {
                class: 'text-overflow',
                style: { color: '#f00' }
              }, params.row.getLabelFailReason)
            ]);
          }
        }, {
          title: '操作',
          key: 'operate',
          fixed: 'right',
          align: 'center',
          width: 190,
          render: (h, params) => {
            if (params.row !== undefined) {
              return !v.ymsMerchant
                ? h(
                  compoundBtn,
                  {
                    props: {
                      dropList: [
                        {
                          label: '获取面单',
                          value: '1',
                          flagCode: ['1'],
                          status: this.getPermission(
                            'packageInfo_waitingUploadGetExpressBill_single'
                          )
                            ? '1'
                            : -1
                        }
                      ],
                      title: '查看出库单详情',
                      listenNormal: false,
                      btnType: '',
                      icon: 'icon iconfont icon-chakan',
                      disabled: !this.getPermission(
                        'wmsPicking_querySalesPickingDetail'
                      )
                    },
                    on: {
                      click: (val) => {
                        if (!val) {
                          // 详情
                          this.$emit(
                            'showPackageDetails',
                            params.row,
                            'detail'
                          );
                        } else {
                          if (val === '1') {
                            this.getWayBill('single', params.row.packageId);
                          }
                        }
                      }
                    }
                  },
                  []
                )
                : '';
            }
          }
        }
      ],
      faceSheetData: [],
      countryModal: [],
      payTimeArr: [],
      packageIds: []
    };
  },
  methods: {
    returnPower(list) {
      let power = false;
      list.forEach(key => {
        !power && (power = this.getPermission(key));
      })
      return power;
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.upDown = type;
      this.pageParams.orderBy = feild;
      this.search();
    },
    igGetLabelFn() {
      let v = this;
      if (v.tableSltData.length === 0) {
        v.$Message.info('未选择数据');
        return;
      }
      v.axios
        .post(
          api.ignoreGetLabel,
          v.tableSltData.map((i) => i.packageId)
        )
        .then((response) => {
          if (response.data.code === 0) {
            v.$Message.success('操作成功');
            v.search();
          } else {
            v.$Message.error('操作失败，请重新尝试');
          }
        });
    },
    voidIssueDocFn() {
      let v = this;
      if (v.tableSltData.length === 0) {
        v.$Message.info('未选择数据');
        return;
      }
      v.packageIdList = v.tableSltData.map((i) => i.packageId);
      v.$refs.voidIssueDoc.modal = true;
    },
    selectStatus(index, status) {
      let v = this;
      if (status === 1 || status === 4) {
        v.tableControlStatus = true;
      } else {
        v.tableControlStatus = false;
      }
      v.pageParams.getLabelStatus = status;
      v.statusList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    // changeShippingMethod(value, data) {
    //   let v = this;
    //   if (value.length === 0) {
    //     v.pageParams.merchantCarrierId = null;
    //     v.pageParams.merchantShippingMethodId = null;
    //   } else if (value.length === 1) {
    //     v.pageParams.merchantCarrierId = value[0];
    //     v.pageParams.merchantShippingMethodId = null;
    //   } else if (value.length === 2) {
    //     v.pageParams.merchantCarrierId = value[0];
    //     v.pageParams.merchantShippingMethodId = value[1][0];
    //   }
    // },
    search() {
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    reset() {
      let v = this;
      v.$refs['pageParams'].resetFields();
      // v.shippingMethodModel = [];
      v.countryModal = [];
      v.selectStatus(0, 1);
      v.resetDate();
      v.payTimeArr = [];
    },
    resetDate() {
      let v = this;
      v.pageParams.createdStartTime = null;
      v.pageParams.createdEndTime = null;
    },
    getDateValue(value) {
      // 获取日期返回值
      let v = this;
      if (value.length === 0 || !value[0]) {
        v.resetDate();
      } else {
        if (value[0] !== '') {
          v.pageParams.createdStartTime = v.$uDate.getUniversalTime(
            new Date(value[0]).getTime(),
            'fulltime'
          );
          v.pageParams.createdEndTime = v.$uDate.getUniversalTime(
            new Date(value[1]).getTime(),
            'fulltime'
          );
        }
      }
    },
    getSelectValue(value) {
      let v = this;
      let pos = [];
      v.tableSltData = value;
      Promise.resolve(
        value.forEach((n, i) => {
          pos.push(n.packageId);
        })
      ).then(function () {
        v.packageIds = pos;
      });
    },
    getList() {
      let v = this;
      let paramsObj = v.returnRequestParams();
      if (v.getPermission('packageInfo_queryForWaitingGetLabel') || v.getPermission('packageInfo_queryForTrackingNumberUncatch') || v.getPermission('packageInfo_queryForWaitingUpload')) {
        v.TableLoading = true;
        v.SearchDisabled = true;
        v.axios.post(api.get_faceSheetData, JSON.stringify(paramsObj)).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            let pos = [];
            let saleAccountIdPos = [];
            let merchantShippingMethodIdPos = [];
            if (data.list) {
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
                  packageId: n.packageId,
                  createdTime: n.createdTime,
                  carrierSendStatus: n.carrierSendStatus,
                  getLabelStatus: n.getLabelStatus,
                  getLabelFailReason: n.getLabelFailReason
                });
                saleAccountIdPos.push(n.saleAccountId);
                merchantShippingMethodIdPos.push(n.merchantShippingMethodId);
              })
              v.pageParamsStatus = false;
              if (saleAccountIdPos.length > 0) {
                // 匹配订单号
                Promise.resolve(
                  v.axios
                    .post(
                      api.queryCarrierShippingName,
                      JSON.stringify(merchantShippingMethodIdPos)
                    )
                    .then((response) => {
                      if (response.data.code === 0) {
                        if (response.data.datas.length > 0) {
                          response.data.datas.forEach((n, i) => {
                            pos.forEach((m, t) => {
                              if (
                                m.merchantShippingMethodId ===
                                n.shippingMethodId
                              ) {
                                m.carrierName = n.carrierName;
                                m.carrierShippingMethodName =
                                  n.carrierShippingMethodName;
                              }
                            });
                          });
                        }
                      }
                    })
                ).then(function () {
                  v.faceSheetData = pos;
                });
              }
            } else {
              v.faceSheetData = [];
            }
            v.$nextTick(function () {
              v.total = Number(data.total);
            });
          }
          v.TableLoading = false;
          v.SearchDisabled = false;
        });
      } else {
        v.gotoError(); // 无权限
      }
    },
    returnRequestParams() {
      let v = this;
      v.pageParams.pageSize = v.getPageSizeCache();
      let paramsObj = this.$common.copy(v.pageParams);
      if (v.pageParams.cargoOwnerId) {
        if (v.pageParams.cargoOwnerId === '_NO_CARGO_OWNER') {
          // 无货主
          paramsObj.cargoOwnerType = 0;
          paramsObj.cargoOwnerId = null;
        } else {
          paramsObj.cargoOwnerType = 1;
          paramsObj.cargoOwnerId = v.pageParams.cargoOwnerId;
        }
      } else {
        paramsObj.cargoOwnerType = null;
        paramsObj.cargoOwnerId = null;
      }
      delete paramsObj.shippingList;
      return paramsObj;
    },
    getWayBillHasCondition() {
      this.getWayBill('all');
    },
    getWayBill(type, id) {
      let v = this;
      let obj;
      if (
        (v.packageIds.length === 0 || v.packageIds === null) &&
        type !== 'all' &&
        type !== 'single'
      ) {
        v.$Message.error('请选择包裹');
        return false;
      }
      if (type === 'all' && !v.faceSheetData.length) {
        v.$Message.error('暂无数据');
        return false;
      }
      if (type === 'single') {
        obj = {
          packageIdList: [id],
          warehouseId: v.getWarehouseId()
        };
      } else if (type === 'all') {
        obj = Object.assign({}, v.pageParams);
        if (v.pageParams.cargoOwnerId) {
          if (v.pageParams.cargoOwnerId === '_NO_CARGO_OWNER') {
            // 无货主
            obj.cargoOwnerType = 0;
            obj.cargoOwnerId = null;
          } else {
            obj.cargoOwnerType = 1;
            obj.cargoOwnerId = v.pageParams.cargoOwnerId;
          }
        } else {
          obj.cargoOwnerType = null;
          obj.cargoOwnerId = null;
        }
      } else {
        obj = {
          packageIdList: v.packageIds,
          warehouseId: v.getWarehouseId()
        };
      }
      v.axios.put(api.get_faceSheet, JSON.stringify(obj)).then((response) => {
        if (response.data.code === 0) {
          v.$Message.success('获取面单成功');
          v.packageIds = [];
          v.pageParamsStatus = true;
        } else {
          v.$Message.success('获取面单失败');
        }
      });
    },
    // // 导出选中1/所有数据2
    // outputExcel(index) {
    //   if (!index) return;
    //   let temp = {};

    //   if (index === 1) {
    //     if (!this.packageIds.length) {
    //       this.$Message.error('请选择要操作的数据');
    //       return;
    //     }
    //     temp.packageIdList = this.packageIds;
    //     temp.exportType = 0;
    //   }

    //   if (index === 2) {
    //     if (!this.faceSheetData.length) {
    //       this.$Message.error('暂无数据');
    //       return;
    //     }
    //     temp.exportType = 1;
    //   }
    //   temp = Object.assign(temp, this.pageParams); // pageParams中某些参数必传

    //   // console.log(temp);
    //   // return;
    //   this.axios.post(api.post_exportWaitingGetLabel, temp).then((res) => {
    //     if (res.data.code === 0) {
    //       this.$Message.success('导出成功');
    //       this.packageIds = [];
    //       this.pageParamsStatus = true;
    //     }
    //   });
    // },
    exportExcel(name) {
      let temp = {};
      let paramsObj = this.returnRequestParams();
      if (name == 1) {
        if (!this.packageIds.length) {
          this.$Message.warning("请选择导出数据");
          return;
        }
        temp.packageIdList = this.packageIds;
        temp.warehouseId = paramsObj.warehouseId;
      } else {
        temp = paramsObj;
      }
      this.$Spin.show();
      this.axios
        .post(api.exportWaitingGetLabel, temp)
        .then(({ data }) => {
          if (!(data && data.code === 0)) return;
          this.$Message.success("导出成功");
          this.$refs.selection.selectAll(false);
        })
        .finally(() => {
          this.$Spin.hide();
        });
    },
    shippingChange(data) {
      this.pageParams.merchantCarrierIdList = data.carrierId;
      this.pageParams.merchantShippingMethodIdList = data.shippingMethodId;
    },
  },
  watch: {
    pageParamsStatus(n) {
      let v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    }
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(345);
    },
    multipleExportPower() {
      let powerList = ['waitingGetLabel_export', 'yms_waitingGetLabel_export'];
      return this.returnPower(powerList);
    },
    allExportPower() {
      let powerList = ['waitingGetLabel_export_all', 'yms_waitingGetLabel_export_all'];
      return this.returnPower(powerList);
    },
  },
  created() {
    let v = this;
    v.getList();
    v.showShippingData(true); // 查询物流方式下拉数据
  },
  mounted() {
    let v = this;
    setTimeout(v.getCountrys(), 2000); // 获取国家区域列表
  }
};
</script>
