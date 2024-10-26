<template>
  <div class="container">
    <div v-if="workShow !== 'detail'">
      <Card dis-hover>
        <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
          <Row type="flex" :gutter="gutterItem">
            <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol">
            <FormItem label="搜索字符">
              <Input placeholder="可输入订单号、买家ID、买家姓名、SKU、Item ID" v-model="pageParams.searchValue" />
            </FormItem>
            </Col>
            <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol">
            <FormItem label="物流方式">
              <Select v-model="pageParams.merchantShippingMethodId">
                <Option value="">全部</Option>
                <Option v-for="(item, index) in shipList" multiple :value="item.shippingMethodId" :key="index">{{
                  item.carrierShippingMethodName }}
                </Option>
              </Select>
            </FormItem>
            </Col>
            <Col :xxl="twoItemCol" :xl="twoItemCol" :lg="twoItemCol" :md="oneItemCol">
            <Form-item label="LAPA状态">
              <Button-group>
                <Button v-for="d in cognateSku" :key="d.value" :type="d.checked ? 'primary' : 'default'"
                  @click="changeCognateStatus(d.value)">{{ d.label }}
                </Button>
              </Button-group>
            </Form-item>
            </Col>
            <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter">
            <FormItem label="创建时间">
              <Date-picker type="datetimerange" style="width:100%" @on-clear="resetDate" @on-change="getDateValue"
                :clearable="clearAble" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end"
                placeholder="选择日期" :value="payTimeArr"></Date-picker>
            </FormItem>
            </Col>
            <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter">
            <FormItem label="下单成功时间">
              <Date-picker type="datetimerange" style="width:100%" @on-clear="orderResetDate"
                @on-change="getOrderDateValue" :clearable="clearAble" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss"
                placement="bottom-end" placeholder="选择日期" :value="payTimeArr"></Date-picker>
            </FormItem>
            </Col>
            <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter">
            <FormItem label="物流商发货时间">
              <Date-picker type="datetimerange" style="width:100%" @on-clear="despatchResetDate"
                @on-change="getDespatchDateValue" :clearable="clearAble" :options="dateOptions"
                format="yyyy-MM-dd HH:mm:ss" placement="bottom-end" placeholder="选择日期" :value="payTimeArr"></Date-picker>
            </FormItem>
            </Col>
            <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter">
            <div style="display: flex;">
              <Select v-model="selectType" class="selectStyle" @on-change="selectValue">
                <Option v-for="item in selectTypeList" :value="item.value" :key="item.value">{{ item.name }}</Option>
              </Select> <dyt-input-tag :limit="1" :string="true" v-model="textareaList" type="textarea"
                style="margin-left: 5px; font-size: 12px;" placeholder="支持批量查询，多个单号用逗号或换行分隔" />
            </div>
            </Col>
            <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter">
            <Form-item label="同步状态">
              <Button-group>
                <Button v-for="d in SynchronizationStatus" :key="d.value" :type="d.checked ? 'primary' : 'default'"
                  @click="changeSynchronizationStatus(d.value)">{{ d.label }}
                </Button>
              </Button-group>
            </Form-item>
            </Col>
          </Row>
          <Row type="flex" justify="space-between" :gutter="gutterItem">
            <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" :offset="offsetCol"
              v-if="getPermission('packageInfo_pylStoreQuery')">
            <Button type="primary" @click="search" :disabled="SearchDisabled" icon="ios-search" size="small">查询
            </Button>
            </Col>
            <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol"
              style="text-align: right; margin-right: 0px;">
            <Button size="small" @click="toggleMoreFilter">{{ moreFilterMes }}
              <Icon :type="moreFilterIcon" size="small"></Icon>
            </Button>
            </Col>
          </Row>
        </Form>
      </Card>
      <Card dis-hover class="sort">
        <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch"
          :sorType="{ DESC: 'down', ASC: 'up' }">
        </dyt-sortBySelect>
      </Card>
      <Card dis-hover>
        <Dropdown>
          <a href="javascript:void(0)">
            <Button type="primary" v-if="getPermission('packageInfo_uploadPylStorePackage')"
              @click="uploadWinitPackage(checkedDate)">下单
              <Icon type="ios-arrow-down" style="margin-left: 10px"></Icon>
            </Button>
          </a>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="uploadWinitAllPackage"
              v-if="getPermission('packageInfo_batchUploadPylStorePackage')">下单（所有结果集）
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown @on-click="exportAllOrSlt" class="ml10" v-if="getPermission('packageInfo_export')">
          <Button type="primary"><span class="icon iconfont" style="font-size: 12px">&#xe639;</span> 导出
            <Icon type="md-arrow-dropdown"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem name="0">导出选中数据</DropdownItem>
            <DropdownItem name="1">导出所有结果集</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <!--同步发货状态-->
        <!--        <Dropdown style="margin-left: 20px;" v-if="getPermission('packageInfo_getPylStorePackageStatus')" >-->
        <!--          <a href="javascript:void(0)" >-->
        <!--            <Button type="primary" @click="ShipmentStatusBtn(checkedDate)" >同步发货状态-->
        <!--              <Icon type="ios-arrow-down" style="margin-left: 10px" ></Icon >-->
        <!--            </Button >-->
        <!--          </a >-->
        <!--          <DropdownMenu slot="list" v-if="getPermission('packageInfo_batchPylStorePackageStatus')" >-->
        <!--            <DropdownItem @click.native="ShipmentStatusAllBtn" >同步发货状态（所有结果集）</DropdownItem >-->
        <!--          </DropdownMenu >-->
        <!--        </Dropdown >-->
      </Card>
      <Table :columns="columns1" :data="data1" :loading="TableLoading" @on-selection-change="checkedDateMt"></Table>
      <div class="table-page flexBox">
        <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
          :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray">
        </Page>
      </div>
    </div>
    <!-- 详情 -->
    <Modal v-model="detailModal" v-if="detailModalStatus" width="800" title="入库单详情">
      <div>
        <h3>退货地址信息</h3>
        <div>
          <Row style="marginTop:10px;">
            <Col span="6">Name：{{ rowData.sendName }}</Col>
            <Col span="6">CountryCode：{{ rowData.sendCountryCode }}</Col>
            <Col span="6">StateOrProvinceCode：{{ rowData.sendDistrictOrCounty }}</Col>
            <Col span="6">PostalCode：{{ rowData.sendPostalCode }}</Col>
          </Row>
          <div style="marginTop:10px;">
            Address.Line1：{{ rowData.sendAddressLine1 }}
          </div>
          <div style="marginTop:10px;">
            Address.Line2：{{ rowData.sendAddressLine2 }}
          </div>
        </div>
        <div style="marginTop:20px;">
          <Table highlight-row border :columns="detailColumn" :data="detailData"></Table>
        </div>
      </div>
      <div slot="footer" style="text-align:center;">
        <Button type="primary" @click="detailModal = false">取消</Button>
      </div>
    </Modal>
    <div v-if="workShow === 'detail'">
      <sellStockOutDtl :ttStatus="ttStatus" :pickingNo="pickingNo" :workShow="workShow" :packageId="activePackageId"
        :workType="workType"></sellStockOutDtl>
    </div>
  </div>
</template>

<script>
import common from '@/components/mixin/common_mixin';
import api from '@/api/api';
import sellStockOutDtl from './orderDetail';

export default {
  mixins: [common],
  components: {
    sellStockOutDtl
  },
  data() {
    let self = this;
    let v = this;
    return {
      ttStatus: '',
      checkedData: [],
      workShow: 'list',
      pickingNo: '',
      workType: '',
      shipList: [], // 物流方式
      totalPage: 0,
      total: 0,
      curPage: 1,
      selectType: 'order',
      textareaList: '',
      pageParams: {
        ttStatus: '1', // LAPA状态
        carrierSendStatus: null, // 同步状态
        searchValue: '', //
        merchantShippingMethodId: '', // 物流方式
        pageNum: 1,
        pageSize: 10,
        orderBy: 'CT',
        upDown: 'up',
        startCreatedTime: null,
        endCreatedTime: null,
        startTrackingNumberTime: null,
        endTrackingNumberTime: null,
        startDespatchTime: null,
        endDespatchTime: null,
        specifiedOrderNoList: [],
        specifiedPackageCodeList: [],
        specifiedSkuList: [],
        warehouseId: v.getWarehouseId()
      },
      cognateSku: [// 关联sku
        {
          label: '全部',
          value: 'null',
          checked: false
        }, {
          label: '等待下单',
          value: '1',
          checked: true
        }, {
          label: '下单中',
          value: '2',
          checked: false
        }, {
          label: '下单成功',
          value: '3',
          checked: false
        }, {
          label: '下单失败',
          value: '4',
          checked: false
        }, {
          label: '已发货',
          value: '6',
          checked: false
        },
        {
          label: "已作废",
          value: "99",
          checked: false
        },
      ],
      SynchronizationStatus: [ // 同步物流商发货状态(1:未就绪 2:处理中 3:处理成功 4:处理失败)
        {
          label: '全部',
          value: 'null',
          checked: true
        }, {
          label: '同步失败',
          value: '4',
          checked: false
        }, {
          label: '后台同步中',
          value: '2',
          checked: false
        }
      ],
      sortButtonList: [
        {
          sortHeader: "按创建时间",
          sortField: "CT",
          sortType: "up",
          default: true,
        },
        {
          sortHeader: "按出库单号",
          sortField: "SJ",
          sortType: "up",
        },
      ],
      columns1: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: 'NO',
          key: '',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('div', params.index + 1);
          }
        }, {
          title: '出库单号',
          key: 'packageCode',
          align: 'center',
          render(h, params) {
            return h('a', {
              on: {
                click() {
                  v.pickingNo = params.row.packageCode;
                  v.workType = 'sellStock';
                  v.workShow = 'detail';
                  v.ttStatus = params.row.ttStatus;
                  v.activePackageId = params.row.packageId;
                }
              }
            }, params.row.packageCode);
          }
        }, {
          title: '订单号',
          key: 'salesRecordNumber',
          align: 'center',
          render(h, params) {
            if (params.row.packageOrderBoList) {
              return h('div', {}, params.row.packageOrderBoList.map(i => {
                return h('p', i.accountCode + '-' + i.salesRecordNumber);
              }));
            }
          }
        }, {
          title: '买家ID/姓名',
          align: 'center',
          render(h, params) {
            return h('span', {}, params.row.buyerAccountId + '/' + params.row.buyerName);
          }
        }, {
          title: '国家/地区',
          align: 'center',
          render(h, params) {
            let text = v.formValidate.country.filter(i => {
              if (i.twoCode === params.row.buyerCountryCode) {
                return i;
              }
            })[0].cnName;
            return h('span', {}, text);
          }
        }, {
          title: '物流方式',
          key: 'merchantShippingMethodId',
          align: 'center',
          render: (h, params) => {
            if (params.row.carrierName === null || params.row.carrierName === '') {
              return '';
            } else {
              return h('div', params.row.carrierName + ' > ' + params.row.carrierShippingMethodName);
            }
          }
        }, {
          title: 'SKU数量',
          align: 'center',
          key: 'skuQuantity'
        }, {
          title: '物品数量',
          align: 'center',
          key: 'productQuantity'
        }, {
          title: '付款时间',
          align: 'center',
          key: 'payTime',
          render: (h, params) => {
            return h('span', self.$uDate.getDataToLocalTime(params.row.payTime, 'fulltime'));
          }
        }, {
          title: 'LAPA状态',
          align: 'center',
          key: 'ttStatus',
          render(h, params) {
            /* let text = params.row.trackingNumberStatus === '1' ? '等待下单' : params.row.ttStatus === '2' ? '下单中' : params.row.ttStatus === '3' ? '下单成功' : '下单失败'; */
            let text = params.row.ttStatus;
            let status = params.row.ttStatus === '下单失败';
            let trackingNumberFailReason = params.row.trackingNumberFailReason || '';
            return h('div', {}, [
              h('span', {
                style: {
                  color: (() => {
                    return status
                      ? 'red'
                      : '';
                  })()
                }
              }, text), h('Tooltip', {
                props: {
                  content: trackingNumberFailReason,
                  transfer: true,
                  maxWidth: 250
                }
              }, [
                !status || h('Icon', {
                  props: {
                    type: 'md-help-circle'
                  }
                })
              ])
            ]);
          }
        }, {
          title: '下单成功时间',
          key: 'trackingNumberTime',
          align: 'center',
          render: (h, params) => {
            return h('span', self.$uDate.getDataToLocalTime(params.row.trackingNumberTime, 'fulltime'));
          }
        }, {
          title: '物流商发货时间',
          key: 'despatchTime',
          align: 'center',
          render: (h, params) => {
            return h('span', self.$uDate.getDataToLocalTime(params.row.despatchTime, 'fulltime'));
          }
        }, {
          title: '操作',
          align: 'center',
          render: (h, params) => {
            let text = params.row.ttStatus;
            return h('div', [
              !v.getPermission('wmsPicking_queryPylSalesPackageDetail') || h('Button', {
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    v.pickingNo = params.row.packageCode;
                    v.workType = 'sellStock';
                    v.workShow = 'detail';
                    v.ttStatus = params.row.ttStatus;
                    v.activePackageId = params.row.packageId;
                    /* this.detailModal = true;
                     this.detailModalStatus = true;
                     this.rowData = params.row;
                     this.getDetailData(params.row.packageCode); */
                  }
                }
              }, '查看详情'), !v.getPermission('packageInfo_uploadOutstorePackage') || h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  display: (() => {
                    return text === '下单成功' || text === '已发货'
                      ? 'none'
                      : 'line-block';
                  })()
                },
                on: {
                  click: () => {
                    v.uploadWinitOnePackage(params.row.packageId);
                  }
                }
              }, '下单')
            ]);
          }
        }
      ],
      inboundData: [],
      data1: [],
      detailModal: false,
      detailModalStatus: false,
      rowData: [], // 当前行数据
      wareId: '',
      checkedDate: [],
      payTimeArr: [],
      clearAble: true,
      selectTypeList: [
        {
          value: 'order',
          name: '订单号'
        }, {
          value: 'outbound',
          name: '出库单号'
        }, {
          value: 'sku',
          name: 'LAPA SKU'
        }
      ]
    };
  },
  created() {
    this.getCountrys();
    this.getShippingList().then(() => {
      this.getList();
    });
  },
  methods: {
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.upDown = type;
      this.pageParams.orderBy = feild;
      this.search();
    },
    getDateValue(value) {
      // 获取日期返回值
      var v = this;
      if (value[0] !== '') {
        v.pageParams.startCreatedTime = v.$uDate.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
        v.pageParams.endCreatedTime = v.$uDate.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
      }
    },
    resetDate() { // 重置创建时间
      let v = this;
      v.pageParams.startCreatedTime = '';
      v.pageParams.endCreatedTime = '';
    },
    orderResetDate() { // 重置下单成功时间
      let v = this;
      v.pageParams.startTrackingNumberTime = '';
      v.pageParams.endTrackingNumberTime = '';
    },
    despatchResetDate() { // 重置物流商发货时间
      this.pageParams.startDespatchTime = '';
      this.pageParams.endDespatchTime = '';
    },
    getOrderDateValue(value) { // 获取下单成功的时间
      var v = this;
      if (value[0] !== '') {
        v.pageParams.startTrackingNumberTime = v.$uDate.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
        v.pageParams.endTrackingNumberTime = v.$uDate.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
      }
    },
    getDespatchDateValue(value) { // 获取物流商发货时间
      var v = this;
      if (value[0] !== '') {
        v.pageParams.startDespatchTime = v.$uDate.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
        v.pageParams.endDespatchTime = v.$uDate.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
      }
    },
    paramsFn() {
      let v = this;
      v.pageParams.orderSeq = v.pageParams.upDown === 'up'
        ? 'ASC'
        : 'DESC';
      return JSON.parse(JSON.stringify(v.pageParams));
    },
    exportAllOrSlt(name) {
      // 导出
      let obj = this.paramsFn();
      if (name === '0') {
        // 选中
        if (this.checkedDate.length === 0) {
          this.$Message.warning('请选择导出数据');
          return;
        }
        obj.packageIds = this.checkedDate.map(val => val.packageId);
        this.exportFn(obj);
      } else {
        // 所有
        if (this.data1.length === 0) {
          this.$Message.warning({
            content: '无数据导出',
            duration: 5
          });
          return;
        }
        if (this.pageParams.ttStatus !== '6') {
          if ([99].includes(Number(this.pageParams.ttStatus))) {
            obj.packageProcessStatus = [this.pageParams.ttStatus];
          } else {
            obj.trackingNumberStatus = this.pageParams.ttStatus;
          }
        } else {
          obj.packageProcessStatus = ['5'];
        }
        this.exportFn(obj);
      }
    },
    exportFn(obj) {
      this.axios.post(api.export_package, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
        }
      });
    },
    changePage(page) {
      // 分页切换
      let v = this;
      v.pageParams.pageNum = page;
      v.curPage = page;
      v.getList();
    },
    changePageSize(pageSize, plat) {
      this.pageParams.pageSize = pageSize;
      this.getList();
    },
    checkedDateMt(data) {
      this.checkedDate = data;
    },
    uploadWinitAllPackage() {
      let v = this;
      v.pageParams.orderSeq = v.pageParams.upDown === 'up'
        ? 'ASC'
        : 'DESC';
      v.pageParams.packageIds = [];
      // 包裹-所有结果集申请运单号
      v.axios.put(api.batchUploadPylStorePackage, v.pageParams).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('下单成功');
          v.getList();
        }
      });
    },
    uploadWinitPackage(data) {
      let v = this;
      v.pageParams.orderSeq = v.pageParams.upDown === 'up'
        ? 'ASC'
        : 'DESC';
      let valid = data.some(i => {
        return i.ttStatus === '下单成功';
      });
      if (valid) {
        v.$Message.error('不能选择下单成功的数据');
        return;
      }
      //  批量和所有结果集 一个接口  批量传packageId
      v.pageParams.packageIds = data.map(i => {
        return i.packageId;
      });
      if (v.pageParams.packageIds.length === 0) {
        v.$Message.error('未选择数据');
        return;
      }
      v.axios.put(api.batchUploadPylStorePackage, v.pageParams).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('下单成功');
          v.pageParams.packageIds = [];
          v.getList();
        }
      }).catch(() => {
      });
    },
    uploadWinitOnePackage(packageId) {
      let v = this;
      v.axios.put(api.uploadPylStorePackage + packageId).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('下单成功');
          v.getList();
        }
      }).catch(() => {
      });
    },
    getShippingList() {
      let v = this;
      let id = v.getWarehouseId();
      return new Promise(resolve => {
        v.axios.get(api.carrierServiceCommon + api.get_queryBindingShippingMethods + '?warehouseId=' + id).then(res => {
          if (res.data.code === 0) {
            v.shipList = res.data.datas;
          }
          resolve();
        }).catch(() => {
          resolve();
        });
      });
    },
    changeCognateStatus(val) {
      let v = this;
      v.cognateSku.forEach((n, i) => {
        n.checked = n.value === val;
      });
      if (val === 'null') {
        v.pageParams.ttStatus = null;
      } else {
        v.pageParams.ttStatus = val;
      }
    },
    changeSynchronizationStatus(val) { // 同步状态
      let v = this;
      v.SynchronizationStatus.forEach((n, i) => {
        n.checked = n.value === val;
      });
      if (val === 'null') {
        v.pageParams.carrierSendStatus = null;
      } else {
        v.pageParams.carrierSendStatus = val;
      }
    },
    search() {
      // 查询
      let v = this;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
      v.getList();
    },
    getList() {
      let v = this;
      if (!v.getPermission('packageInfo_pylStoreQuery')) {
        v.gotoError();
      }
      v.checkedDate = [];
      // 获取批量查询订单号、出库单号、sku的数据
      if (v.selectType === 'order') {
        v.pageParams.specifiedPackageCodeList = [];
        v.pageParams.specifiedSkuList = [];
        v.pageParams.specifiedOrderNoList = v.textareaList === ''
          ? []
          : v.sepCommasFn(v.textareaList);
      } else if (v.selectType === 'outbound') {
        v.pageParams.specifiedSkuList = [];
        v.pageParams.specifiedOrderNoList = [];
        v.pageParams.specifiedPackageCodeList = v.textareaList === ''
          ? []
          : v.sepCommasFn(v.textareaList);
      } else if (v.selectType === 'sku') {
        v.pageParams.specifiedOrderNoList = [];
        v.pageParams.specifiedPackageCodeList = [];
        v.pageParams.specifiedSkuList = v.textareaList === ''
          ? []
          : v.sepCommasFn(v.textareaList);
      }
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(api.pylStoreQuery, v.pageParams).then(response => {
        v.TableLoading = false;
        v.SearchDisabled = false;
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            let pos = data.list;
            let merchantShippingMethodIdPos = [];
            if (pos.length > 0) {
              merchantShippingMethodIdPos = pos.map(i => i.merchantShippingMethodId);
              v.axios.post(api.queryCarrierShippingName, JSON.stringify(merchantShippingMethodIdPos)).then(response => {
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
                    v.data1 = pos;
                  }
                }
              });
            } else {
              v.data1 = [];
            }
            v.$nextTick(function () {
              v.total = Number(data.total);
              v.totalPage = Number(data.pages);
              v.tableLoading = false;
            });
          }
        }
      }).catch(() => {
      });
    },
    getDetailData(id) {
      // 获取详情数据
      let v = this;
      let obj = {
        pickingNo: id,
        warehouseId: v.getWarehouseId()
      };
      v.axios.post(api.queryPylSalesPackageDetail, obj).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.detailData = data.wmsFbaReceiptDetails;
        }
      });
    },
    selectValue(value) {
      this.textareaList = '';
    },
    ShipmentStatusBtn(data) { // 操作同步发货状态
      let v = this;
      v.pageParams.orderSeq = v.pageParams.upDown === 'up'
        ? 'ASC'
        : 'DESC';
      v.pageParams.packageIds = data.map(i => {
        return i.packageId;
      });
      if (v.pageParams.packageIds.length === 0) {
        v.$Message.error('未选择数据');
        return;
      }
      v.axios.put(api.batchPylStorePackageStatus, v.pageParams).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParams.packageIds = [];
          v.getList();
        }
      }).catch(() => {
      });
    },
    ShipmentStatusAllBtn() { // 批量同步发货状态
      let v = this;
      v.pageParams.orderSeq = v.pageParams.upDown === 'up'
        ? 'ASC'
        : 'DESC';
      v.pageParams.packageIds = [];
      v.axios.put(api.batchPylStorePackageStatus, v.pageParams).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('操作成功');
          v.getList();
        }
      });
    }
  }
};
</script>

<style lang='less' scoped>
.container {
  padding-left: 12px;
}

.sort {
  margin: 12px 0;
}

.max_lable {
  /deep/ .ivu-form-item {
    .ivu-form-item-label {
      width: 100px !important;
    }

    .ivu-form-item-content {
      margin-left: 100px !important;
    }
  }
}

.selectStyle {
  width: 90px;

  /deep/ .ivu-select-selected-value {
    font-size: 12px;
  }
}
</style>
<!-- <style>
.ivu-tooltip-inner {
  white-space: normal !important;
}
</style> -->
