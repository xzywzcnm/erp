<template >
  <div class="outboundOrder">
    <div v-if="workShow !== 'detail'" class="listPage">
      <div class="card-content searchMain" style="display:flex">
        <Form ref="pageParams" :model="pageParams" :label-width="100" class="formFlex">
          <dyt-filter ref="dyt-filter">
            <!-- <FormItem label="订单号" prop="orderNumberList">
                <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.orderNumberList" placeholder="多个请用逗号或回车分隔" />
            </FormItem> -->
            <FormItem label="物流方式" prop="merchantShippingMethodIdList">
              <dyt-select multiple :max-tag-count="1" v-model="pageParams.merchantShippingMethodIdList">
                <Option v-for="(item, index) in shipList" :value="item.shippingMethodId" :key="index"
                  :label="item.carrierShippingMethodName"></Option>
              </dyt-select>
            </FormItem>
            <Form-item label="包裹状态" prop="statusList">
              <dyt-select multiple :max-tag-count="1" v-model="pageParams.statusList">
                <Option v-for="(item, index) in Object.values(cognateSku)" :value="item.value" :key="index + 'statusList'"
                  :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <FormItem label="创建时间 " prop="createdTime">
              <Date-picker type="datetimerange" v-model="pageParams.createdTime" :options="dateOptions"
                format="yyyy-MM-dd HH:mm:ss" placement="bottom-end" transfer placeholder="请选择创建时间" />
            </FormItem>
            <FormItem label="下单成功时间" prop="trackingNumberTime">
              <Date-picker type="datetimerange" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end"
                placeholder="请选择下单成功时间" v-model="pageParams.trackingNumberTime" transfer />
            </FormItem>
            <FormItem label="发货时间" prop="carrierSendDate">
              <Date-picker type="datetimerange" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end"
                placeholder="请选择发货时间" v-model="pageParams.carrierSendDate" transfer />
            </FormItem>
            <!-- <Form-item label="出库单号" prop="packageCodeList">
                <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.packageCodeList" placeholder="多个请用逗号或回车分隔" />
              </Form-item> -->
            <Form-item label="返回运单号" prop="hasTrackingNumber">
              <dyt-select v-model="pageParams.hasTrackingNumber">
                <Option v-for="(item, index) in returnTrackingNoList" :value="item.value"
                  :key="index + 'returnTrackingNo'" :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <FormItem label="">
              <div class="select-main" style="display:flex">
                <dyt-select v-model="selectType" class="selectStyle" @on-change="selectValue" :clearable="false">
                  <Option v-for="item in selectTypeList" :value="item.value" :key="item.value">{{ item.name }}
                  </Option>
                </dyt-select>
                <dyt-input-tag :limit="1" :string="true" type="textarea" v-model="textareaList"
                  placeholder="支持批量查询，多个单号用逗号或换行分隔" />
              </div>
            </FormItem>
            <FormItem label="运单号" :label-width="100">
              <dyt-input-tag :limit="1" v-model="pageParams.trackingNumberList" type="textarea"></dyt-input-tag>
            </FormItem>
            <div slot="operation" style="margin-left:20px">
              <Button type="primary" @click="search" icon="ios-search">查询</Button>
              <Button @click="reset" v-once icon="md-refresh" size="small" style="margin-left: 8px;">重置 </Button>
            </div>
          </dyt-filter>
        </Form>
      </div>

      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <!-- 下单 -->
            <Dropdown @on-click="placeAnOrder" class="ml10" v-if="permission.order">
              <Button type="primary"> 下单
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name="0" :disabled="!checkedDate.length">下单选中数据</DropdownItem>
                <DropdownItem name="1">下单所有结果集</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <!--导出-->
            <Dropdown @on-click="exportAllOrSlt" class="ml10" v-if="permission.export">
              <Button type="primary"><span class="icon iconfont" style="font-size: 12px">&#xe639;</span> 导出
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name="0" :disabled="!checkedDate.length">导出选中数据</DropdownItem>
                <DropdownItem name="1">导出所有结果集</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <!-- 同步状态 -->
            <Dropdown @on-click="syncAllOrSlt" class="ml10" v-if="permission.synchronization">
              <Button type="primary"> 同步状态
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name="0" :disabled="!checkedDate.length">同步选中数据</DropdownItem>
                <DropdownItem name="1">同步所有结果集</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch"
              :sorType="{ DESC: 'down', ASC: 'up' }">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>
      <div class="tableMain">
        <div class="tableBox">
          <Table highlight-row border :columns="outColumns" :data="outBoundData" :loading="TableLoading"
            @on-selection-change="checkedDateMt" :height="gettableHeight"></Table>
        </div>
      </div>

      <div class="pagesMain">
        <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
          :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray">
        </Page>
      </div>
    </div>
    <!-- 详情 -->
    <!-- <Modal v-model="detailModal" v-if="detailModalStatus" title="入库单详情" width="800">
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
          <Table highlight-row border :columns="detailColumn" :loading="TableLoading" :data="detailData"></Table>
        </div>
      </div>
      <div slot="footer" style="text-align:center;">
        <Button type="primary" @click="detailModal = false">取消</Button>
      </div>
    </Modal> -->
    <div v-if="workShow === 'detail'">
      <orderDetail :ttStatus="ttStatus" :pickingNo="pickingNo" :workShow="workShow" :packageId="activePackageId"
        :workType="workType"></orderDetail>
    </div>
  </div>
</template>

<script>
import common from '@/components/mixin/common_mixin';
import api from '@/api/api';
import orderDetail from './orderDetail.vue';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';
import dayjs from 'dayjs';

export default {
  name: 'cneOutboundOrder',
  mixins: [common, tableHeight_mixin],
  components: {
    orderDetail
  },
  data() {
    return {
      ttStatus: '',
      workShow: 'list',
      pickingNo: '',
      workType: '',
      shipList: [], // 物流方式
      totalPage: 0,
      total: 0,
      curPage: 1,
      selectType: 'order',
      pageParams: {
        statusList: null, // 包裹状态
        hasTrackingNumber: null, // 返回运单号
        orderNumberList: [], //
        merchantShippingMethodIdList: null, // 物流方式
        pageNum: 1,
        pageSize: 10,
        upDown: 'up',
        orderBy: 'CT',
        startCreatedTime: null,
        endCreatedTime: null,
        trackingNumberTime: [],
        carrierSendDate: [],
        createdTime: [new Date(dayjs().subtract(7, 'day')), new Date(dayjs())],
        startTrackingNumberTime: null,
        endTrackingNumberTime: null,
        startCarrierSendDate: null,
        endCarrierSendDate: null,
        packageCodeList: [],
        warehouseId: this.getWarehouseId(),
        trackingNumberList: []
      },
      cognateSku: {
        '1': { label: '等待下单', value: 1 },
        '2': { label: '处理中', value: 2 },
        '3': { label: '下单成功', value: 3 },
        '4': { label: '下单失败', value: 4 },
        '7': { label: '已发货', value: 7 },
        '99': { label: '已作废', value: 99 }
      },
      returnTrackingNoList: [ // 同步物流商发货状态(1:未就绪 2:处理中 3:处理成功 4:处理失败)
        {
          label: '有返回',
          value: 1,
          checked: false
        }, {
          label: '未返回',
          value: 0,
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
          sortField: "CO",
          sortType: "up",
        },
      ],
      outColumns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: 'NO',
          key: '',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('div', params.index + 1);
          }
        },
        {
          title: '出库单号',
          key: 'packageCode',
          render: (h, params) => {
            return h('a', {
              on: {
                click: () => {
                  this.pickingNo = params.row.packageCode;
                  this.workType = 'sellStock';
                  this.workShow = 'detail';
                  this.ttStatus = params.row.status;
                  this.activePackageId = params.row.packageId;
                }
              }
            }, params.row.packageCode);
          }
        },
        {
          title: '订单号',
          key: 'orderNumberList',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.orderNumberList)) return h('p', '');
            return row.orderNumberList.map(m => {
              return h('p', {
                style: {
                  padding: '7px 0'
                }
              }, m)
            })
          }
        },
        {
          title: '买家ID/姓名',
          key: '',
          render: (h, params) => {
            return h('span', {}, params.row.buyerAccountId + '/' + params.row.buyerName);
          }
        },
        {
          title: '国家/地区',
          key: '',
          render: (h, params) => {
            let text = this.formValidate.country.filter(i => {
              if (i.twoCode === params.row.buyerCountryCode) {
                return i;
              }
            })[0].cnName;
            return h('span', {}, text);
          }
        },
        {
          title: '物流方式',
          key: 'merchantShippingMethodId',
          render: (h, params) => {
            if (params.row.carrierName === undefined || params.row.carrierName === '') {
              return '';
            } else {
              return h('div', params.row.carrierName + ' > ' + params.row.carrierShippingMethodName);
            }
          }
        },
        {
          title: 'SKU数量',
          key: 'skuQuantity'
        },
        {
          title: '物品数量',
          key: 'productQuantity'
        },
        {
          title: '付款时间',
          key: 'payTime',
        },
        {
          title: '状态',
          key: 'packageStatus',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.packageStatus)) return h('span', '');
            const status = this.cognateSku[(row.packageStatus).toString()];
            if (this.$common.isEmpty(status)) return h('span', row.packageStatus);
            return h('span', status.label);
          }
        },
        {
          title: '异常原因',
          key: 'trackingNumberFailReason',
          align: 'center',
          // ellipsis: true,
          // maxWidth: 150,
          minWidth: 90,
          className: 'tooltip-col',
          render: (h, { row }) => {
            const text = row.trackingNumberFailReason || '';
            if (this.$common.isEmpty(text)) return h('span', '');
            return h('Tooltip', {
              props: {
                transfer: true,
                'transfer-class-name': 'wms-table-row-td-tooltip',
                content: text
              }
            }, text)
          }
        },
        {
          title: '物流商单号',
          key: 'thirdPartyNo',
        },
        {
          title: '运单号',
          key: 'trackingNumber',
        },
        {
          title: '下单成功时间',
          key: 'trackingNumberTime',
        },
        {
          title: '发货时间',
          key: 'carrierSendDate',
        },
        {
          title: '操作',
          render: (h, params) => {
            if (!this.permission.queryDetail) return h('div', '');
            return h('div', [
              h('Button', {
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.pickingNo = params.row.packageCode;
                    this.workType = 'sellStock';
                    this.workShow = 'detail';
                    this.ttStatus = params.row.status;
                    this.activePackageId = params.row.packageId;
                  }
                }
              }, '查看详情')
            ]);
          }
        }
      ],
      outBoundData: [],
      detailModal: false,
      detailModalStatus: false,
      rowData: [], // 当前行数据
      checkedDate: [],
      selectTypeList: [
        {
          value: 'order',
          name: '订单号'
        }, {
          value: 'outbound',
          name: '出库单号'
        }
      ],
      textareaList: ''
    };
  },
  created() {
    this.getCountrys();
    this.getShippingList().then(() => {
      this.getList();
    });
  },
  computed: {
    gettableHeight() {
      return this.getTableHeight(270);
    },
    permission() {
      return {
        // 查看详情
        queryDetail: this.getPermission('wmsPicking_queryOutstoreSalesPackageDetail'),
        // 下单
        order: this.getPermission('packageInfo_batchUploadOutstorePackage'),
        // 同步状态
        synchronization: this.getPermission('packageInfo_batchOutstorePackageStatus'),
        // 导出
        export: this.getPermission('packageInfo_export'),
        // 出库单列表
        inquire: this.getPermission('packageInfo_outstoreQuery')
      }
    }
  },
  watch: {
    workShow: function (val) {
      if (val === 'list') {
        this.$nextTick(() => {
          this.computedTableHeight();
        })
      }
    }
  },
  methods: {
    changePage(page) {
      // 分页切换
      this.pageParams.pageNum = page;
      this.curPage = page;
      this.getList();
    },
    changePageSize(pageSize, plat) {
      this.pageParams.pageSize = pageSize;
      this.getList();
    },
    checkedDateMt(data) {
      this.checkedDate = data;
    },
    uploadBarnOnePackage(packageId) {
      this.axios.put(api.set_uploadBarnPackageOne + packageId).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('下单成功');
          this.getList();
        }
      }).catch(() => { });
    },
    getShippingList() {
      let id = this.getWarehouseId();
      return new Promise(resolve => {
        this.axios.get(api.carrierServiceCommon + api.get_queryBindingShippingMethods + '?warehouseId=' + id).then(res => {
          if (res.data.code === 0) {
            this.shipList = res.data.datas;
          }
          resolve();
        }).catch(() => {
          resolve();
        });
      });
    },
    search() {
      this.curPage = 1;
      this.pageParams.pageNum = 1;
      this.$nextTick(() => {
        this.getList();
      })
    },
    reset() {
      this.$refs.pageParams && this.$refs.pageParams.resetFields();
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.upDown = type;
      this.pageParams.orderBy = feild;
      this.getList();
    },
    // 获取筛选条件
    getPageParams() {
      const removeKey = ['createdTime', 'carrierSendDate', 'trackingNumberTime'];
      let pageParams = this.$common.copy(this.pageParams);
      if (!this.$common.isEmpty(pageParams.createdTime) && !this.$common.isEmpty(pageParams.createdTime[0])) {
        pageParams.startCreatedTime = this.$common.getUniversalTime(pageParams.createdTime[0]);
        pageParams.endCreatedTime = this.$common.getUniversalTime(pageParams.createdTime[1]);
      }
      if (!this.$common.isEmpty(pageParams.carrierSendDate) && !this.$common.isEmpty(pageParams.carrierSendDate[0])) {
        pageParams.startCarrierSendDate = this.$common.getUniversalTime(pageParams.carrierSendDate[0]);
        pageParams.endCarrierSendDate = this.$common.getUniversalTime(pageParams.carrierSendDate[1]);
      }
      if (!this.$common.isEmpty(pageParams.trackingNumberTime) && !this.$common.isEmpty(pageParams.trackingNumberTime[0])) {
        pageParams.startTrackingNumberTime = this.$common.getUniversalTime(pageParams.trackingNumberTime[0]);
        pageParams.endTrackingNumberTime = this.$common.getUniversalTime(pageParams.trackingNumberTime[1]);
      }
      removeKey.forEach(key => {
        delete pageParams[key];
      })
      return pageParams;
    },
    selectValue(value) {
      this.textareaList = '';
    },
    getList() {
      if (!this.permission.inquire) {
        // this.gotoError();
        return this.$Message.error('没有权限')
      }
      if (this.selectType === 'order') {
        this.pageParams.packageCodeList = [];
        this.pageParams.orderNumberList = this.textareaList === ''
          ? []
          : this.sepCommasFn(this.textareaList);
      } else if (this.selectType === 'outbound') {
        this.pageParams.orderNumberList = [];
        this.pageParams.packageCodeList = this.textareaList === ''
          ? []
          : this.sepCommasFn(this.textareaList);
      }
      this.TableLoading = true;
      this.SearchDisabled = true;
      this.checkedDate = []
      this.axios.post(api.nfOutboundQuery, this.getPageParams()).then(response => {
        this.TableLoading = false;
        this.SearchDisabled = false;
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            let pos = data.list;
            let merchantShippingMethodIdPos = [];
            if (pos.length > 0) {
              merchantShippingMethodIdPos = pos.map(i => i.merchantShippingMethodId);
              this.axios.post(api.queryCarrierShippingName, JSON.stringify(merchantShippingMethodIdPos)).then(response => {
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
                  this.outBoundData = pos;
                }
              });
            } else {
              this.outBoundData = [];
            }
            this.$nextTick(() => {
              this.total = Number(data.total);
              this.totalPage = Number(data.pages);
              this.tableLoading = false;
            });
          }
        }
      }).catch(() => {
        this.TableLoading = false;
        this.SearchDisabled = false;
      });
    },
    getDetailData(id) {
      // 获取详情数据
      let obj = {
        pickingNo: id,
        warehouseId: this.getWarehouseId()
      };
      this.TableLoading = true;
      this.axios.post(api.get_winitSalesPickingDetail, obj).then(response => {
        this.TableLoading = false;
        if (response.data.code === 0) {
          let data = response.data.datas;
          this.detailData = data.wmsFbaReceiptDetails;
        }
      });
    },
    // 导出
    exportAllOrSlt(name) {
      if (name === '0') {
        // if (this.$common.isEmpty(this.checkedDate)) return this.$Message.warning('请选择导出数据！');
        this.exportFn({
          packageIds: this.checkedDate.map(val => val.packageId),
          warehouseId: this.getWarehouseId()
        });
        return;
      }
      // 所有
      if (this.outBoundData.length === 0) {
        this.$Message.warning({
          content: '无数据导出',
          duration: 5
        });
        return;
      }
      let obj = this.getPageParams();
      delete obj.pageSize;
      delete obj.pageNum;
      this.exportFn(obj);
    },
    exportFn(obj) {
      this.axios.post(api.nfOutboundExport, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
        } else {
          this.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    // 同步状态
    syncAllOrSlt(name) {
      let obj = {};
      if (name === '0') {
        obj.packageIds = this.checkedDate.map(val => val.packageId);
        obj.warehouseId = this.getWarehouseId()
      } else {
        if (this.outBoundData.length === 0) {
          this.$Message.warning({
            content: '无同步数据',
            duration: 5
          });
          return;
        }
        obj = this.getPageParams();
        delete obj.pageSize;
        delete obj.pageNum;
        delete obj.orderBy;
        delete obj.upDown;
      }
      this.axios.post(api.nfOutboundPackageStatus, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('同步成功');
          this.getList()
        } else {
          this.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    // 下单
    placeAnOrder(name) {
      let obj = {};
      if (name === '0') {
        obj.packageIds = this.checkedDate.map(val => val.packageId);
        obj.warehouseId = this.getWarehouseId()
      } else {
        if (this.outBoundData.length === 0) {
          this.$Message.warning({
            content: '无下单数据',
            duration: 5
          });
          return;
        }
        obj = this.getPageParams();
        delete obj.pageSize;
        delete obj.pageNum;
        delete obj.orderBy;
        delete obj.upDown;
      }
      this.axios.post(api.nfOutboundPackage, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('下单成功');
          this.getList()
        } else {
          this.$Message.error('操作失败，请重新尝试');
        }
      });
    }
  }
}
</script>

<style lang='less' scoped>
.outboundOrder {
  height: 100%;
}

.container {
  padding-left: 12px;
}

.wid {
  width: 300px;
}

.sort {
  margin: 12px 0;
}

.max_lable {
  :deep(.ivu-form-item) {
    .ivu-form-item-label {
      width: 100px !important;
    }

    .ivu-form-item-content {
      margin-left: 100px !important;
    }
  }
}

.formFlex {
  display: flex;
  flex-wrap: wrap;
}

.select-main {
  position: relative;

  .selectStyle {
    width: 90px;
    position: absolute;
    left: -96px;
    top: -1px;
  }
}

.selectStyle {
  width: 110px;
  padding-right: 6px;

  :deep(.ivu-select-selected-value) {
    font-size: 12px;
  }
}
</style>
<style lang="less">
.wms-table-row-td-tooltip {
  .ivu-tooltip-inner {
    max-width: 500px;
    max-height: 40vh;
    overflow: auto;
    word-break: break-all;
  }
}
</style>
