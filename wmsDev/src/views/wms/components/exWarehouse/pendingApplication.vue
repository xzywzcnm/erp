<template>
  <div>
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content platformParamsSelect">
          <Form ref="pageParams" :model="pageParams" :label-width="80">
            <dyt-filter>
              <FormItem label="状态：" prop="ymsTrackingNumberStatus">
                <RadioGroup v-model="pageParams.ymsTrackingNumberStatus" type="button" button-style="solid"
                  @on-change="search">
                  <Radio :label="item.status" v-for="(item, index) in statusList" :key="index">{{ item.title }}</Radio>
                </RadioGroup>
              </FormItem>
              <FormItem label="物流方式：" prop="shippingList">
                <!-- <Cascader transfer v-model="shippingMethodModel" :load-data="loadData" @on-change="changeShippingMethod"
                  :data="$store.state.shippingMethodData" filterable change-on-select></Cascader> -->
                <dyt-shippingSelect v-model="pageParams.shippingList" @on-change="shippingChange" :loadingChildren="true"
                  placeholder="请选择物流方式" />
              </FormItem>
              <Form-item label="国家/地区" prop="country">
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
      <div class="tableControl fl">
        <Buttons type="primary" class="ml10" trigger="click" @on-click="getWayBillHasCondition" v-if="tableControlStatus">
          <Button type="primary" class="iconbuttons" @click="getWayBill('multiple')" :disabled="!getPermission('packageInfo_uploadYmsPackage')
            ">
            <Icon type="cloud"></Icon>
            下单
          </Button>
          <Buttons-menu slot="list">
            <Buttons-item name="1" v-if="getPermission('packageInfo_uploadYmsPackage')">下单（所有结果集）
            </Buttons-item>
          </Buttons-menu>
        </Buttons>
        <Dropdown @on-click="exportExcel" class="ml10"
          v-if="getPermission('waitUploadYmsPackage_export') || getPermission('waitUploadYmsPackage_export_all')">
          <Button type="primary">导出<Icon type="md-arrow-dropdown"></Icon></Button>
          <DropdownMenu slot="list">
            <DropdownItem v-if="getPermission('waitUploadYmsPackage_export')" name="1">导出选中数据
            </DropdownItem>
            <DropdownItem v-if="getPermission('waitUploadYmsPackage_export_all')" name="2">导出所有结果集
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Button type="primary" class="ml10" @click="voidIssueDocFn"
          v-if="getPermission('packageInfo_batchInvalidPackage')">作废出库单 </Button>
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
    // ymsMerchant: {
    //   default: false
    // }
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
        ymsTrackingNumberStatus: 0,
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
          status: 0,
          title: '未下单'
        },
        {
          status: 4,
          title: '下单失败'
        },
        {
          status: 1,
          title: '待同步'
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
          key: 'ymsTrackingNumberStatus',
          align: 'center',
          width: 100,
          render: (h, params) => {
            let d = params.row.ymsTrackingNumberStatus;
            let text = '下单失败';
            let icon = 'icon iconfont icon-weijiuxu';
            let iconColor = '#ff3300';
            let reason = params.row.ymsPkgCreateFailReason;
            if (d === 0) {
              text = '未下单';
              icon = 'icon iconfont icon-weijiuxu';
              iconColor = '#444';
            } else if (d === 1) {
              text = '未同步';
              icon = 'icon iconfont icon-shenqingzhong';
              iconColor = '#f00';
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
          key: 'ymsPkgCreateFailReason',
          render(h, params) {
            return h('Tooltip', {
              class: 'wayBillStatusError',
              props: {
                transfer: true,
                maxWidth: 250,
                content: params.row.ymsPkgCreateFailReason
              }
            }, [
              h('span', {
                class: 'textOverTwo',
                style: { color: '#f00' }
              }, params.row.ymsPkgCreateFailReason)
            ]);
          }
        }, {
          title: '操作',
          key: 'operate',
          fixed: 'right',
          align: 'center',
          width: 190,
          render: (h, params) => {
            let row = params.row || {};
            return h(
              compoundBtn,
              {
                props: {
                  dropList: [
                    {
                      label: '下单',
                      value: '1',
                      flagCode: ['1'],
                      status: this.getPermission('packageInfo_uploadYmsPackage') && [0, 4].includes(row.ymsTrackingNumberStatus) ? '1' : -1
                    }
                  ],
                  title: '查看出库单详情',
                  listenNormal: false,
                  btnType: '',
                  icon: 'icon iconfont icon-chakan',
                  disabled: !this.getPermission('wmsPicking_querySalesPickingDetail')
                },
                on: {
                  click: (val) => {
                    if (!val) {
                      // 详情
                      this.$emit('showPackageDetails', row, 'detail');
                    } else {
                      if (val === '1') {
                        this.getWayBill('single', row.packageId);
                      }
                    }
                  }
                }
              },
              []
            )
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
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.upDown = type;
      this.pageParams.orderBy = feild;
      this.search();
    },
    voidIssueDocFn() {
      if (this.tableSltData.length === 0) {
        this.$Message.info('未选择数据');
        return;
      }
      this.packageIdList = this.tableSltData.map((i) => i.packageId);
      this.$refs.voidIssueDoc.modal = true;
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
      this.curPage = 1;
      this.pageParams.pageNum = 1;
      this.pageParamsStatus = true;
    },
    reset() {
      let v = this;
      v.$refs['pageParams'].resetFields();
      v.pageParams.ymsTrackingNumberStatus = 0;
      // v.shippingMethodModel = [];
      v.countryModal = [];
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
      if (!this.getPermission('packageInfo_queryWaitUploadYmsPackage')) {
        this.gotoError(); // 无权限
        return false;
      }
      let paramsObj = this.returnRequestParams();
      this.TableLoading = true;
      this.SearchDisabled = true;
      this.axios.post(api.queryWaitUploadYmsPackage, JSON.stringify(paramsObj)).then(response => {
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
                ymsTrackingNumberStatus: n.ymsTrackingNumberStatus,
                getLabelFailReason: n.getLabelFailReason,
                ymsPkgCreateFailReason: n.ymsPkgCreateFailReason,
              });
              saleAccountIdPos.push(n.saleAccountId);
              merchantShippingMethodIdPos.push(n.merchantShippingMethodId);
            })
            this.pageParamsStatus = false;
            if (saleAccountIdPos.length > 0) {
              // 匹配订单号
              Promise.resolve(
                this.axios
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
              ).then(() => {
                this.faceSheetData = pos;
              });
            }
          } else {
            this.faceSheetData = [];
          }
          this.$refs.selection.selectAll(false);
          this.$nextTick(() => {
            this.total = Number(data.total);
          });
        }
      }).finally(() => {
        this.TableLoading = false;
        this.SearchDisabled = false;
      })
    },
    returnRequestParams() {
      let paramsObj = this.$common.copy(this.pageParams);
      paramsObj.ymsTrackingNumberStatus = [paramsObj.ymsTrackingNumberStatus];
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
      obj = Object.assign({}, v.pageParams);
      obj.ymsTrackingNumberStatus = [obj.ymsTrackingNumberStatus];
      if (type === 'single') {
        obj.packageIdList = [id];
      } else if (type === 'multiple') {
        obj.packageIdList = v.packageIds;
      }
      v.axios.post(api.uploadYmsPackage, obj).then((response) => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.packageIds = [];
          v.pageParamsStatus = true;
        } else {
          v.$Message.success('操作失败');
        }
      });
    },
    exportExcel(name) {
      let temp = this.returnRequestParams();
      if (name == 1) {
        if (!this.packageIds.length) {
          this.$Message.warning("请选择导出数据");
          return;
        }
        temp.packageIdList = this.packageIds;
      }
      this.$Spin.show();
      this.axios
        .post(api.exportWaitUploadYmsPackage, temp)
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
      if (n) {
        this.getList();
        this.pageParamsStatus = false;
      }
    }
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(345);
    }
  },
  created() {
    this.getList();
    this.showShippingData(true); // 查询物流方式下拉数据
  },
  mounted() {
    setTimeout(this.getCountrys(), 2000); // 获取国家区域列表
  }
};
</script>