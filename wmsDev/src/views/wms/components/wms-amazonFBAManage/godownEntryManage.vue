<template >
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content">
          <Form :model="pageParams" label-position="left" :label-width="120">
            <div class="platformParamsSelect">
              <div class="filterItem">
                <Form-item label="ShipmentId：">
                  <dyt-input-tag :limit="1" :string="true" type="textarea" placeholder="多个库区，用逗号或换行分隔"
                    v-model.trim="pageParams.shipmentId" style="width: 200px" />
                </Form-item>
              </div>
              <div class="filterItem">
                <Form-item label="贴标类型：">
                  <Select v-model="pageParams.labelPrepType" style="width: 200px;" multiple
                    @on-change="labelPrepTypeChange">
                    <Option value="*">全部</Option>
                    <Option v-for="d in labelPrepTypeList" :value="d.value" :key="d.value">{{ d.label }}</Option>
                  </Select>
                </Form-item>
              </div>
              <div class="filterItem">
                <Form-item label="ShipmentStatus：">
                  <Select v-model="pageParams.shipmentStatus" style="width: 200px;marginLeft:20px;" multiple
                    @on-change="shipmentStatusChange">
                    <Option value="*">全部</Option>
                    <Option v-for="d in shipmentStatusList" :value="d.value" :key="d.value">{{ d.label }}</Option>
                  </Select>
                </Form-item>
              </div>
            </div>
            <div class="platformParamsSelect" style="margin-top:20px;">
              <div class="filterItem">
                <Form-item label="ShipmentName：">
                  <dyt-input-tag :limit="1" :string="true" type="textarea" placeholder="多个库区，用逗号或换行分隔"
                    v-model.trim="pageParams.shipmentName" style="width: 200px" />
                </Form-item>
              </div>
              <div class="filterItem">
                <Form-item label="是否原厂包装发货：">
                  <Select v-model="pageParams.areCasesRequired" style="width: 200px;marginLeft:20px;">
                    <Option v-for="d in areCasesRequiredList" :value="d.value" :key="d.value">{{ d.label }}</Option>
                  </Select>
                </Form-item>
              </div>
              <div class="filterItem" v-if="getPermission('wmsFbaReceipt_query')">
                <Button type="primary" :disabled="SearchDisabled" icon="ios-search" @click="search"
                  size="small">查询</Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
    <!-- 排序 -->
    <div class="dataSort grayBg">
      <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch"
        :sorType="{ DESC: 'down', ASC: 'up' }">
      </dyt-sortBySelect>
    </div>
    <!-- <div class="tableControl">
      <Buttons type="primary" style="margin-left: 20px" trigger="click" @on-click="exportDataHasCondition">
        <Button type="primary" @click="exportData" class="iconbuttons">
          <span class="icon iconfont">&#xe639;</span>
          导出选中
        </Button>
        <Buttons-menu slot="list">
          <Buttons-item name="1">导出（所有结果集）</Buttons-item>
        </Buttons-menu>
      </Buttons>
    </div> -->
    <div class="orderTable normalTop">
      <Table highlight-row border :height="tableHeight" :loading="TableLoading" :columns="inboundColumn"
        :data="inboundData"></Table>
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
          <Table highlight-row border :loading="TableLoading" :columns="detailColumn" :data="detailData"></Table>
        </div>
      </div>
      <div slot="footer" style="text-align:center;">
        <Button type="primary" @click="cancel">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data() {
    return {
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      pageParams: {
        shipmentId: null, // 货件ID
        labelPrepType: ['*'],
        shipmentStatus: ['*'],
        shipmentName: null,
        areCasesRequired: 'null',
        pageNum: 1,
        pageSize: 10,
        orderBy: 'CT',
        upDown: 'up'
      },
      labelPrepTypeList: [// 贴标类型
        {
          label: 'NO_LABEL',
          value: 'NO_LABEL'
        }, {
          label: 'AMAZON_LABEL',
          value: 'AMAZON_LABEL'
        }, {
          label: 'SELLER_LABEL',
          value: 'SELLER_LABEL'
        }
      ],
      shipmentStatusList: [// ShipmentStatus货件状态
        {
          label: 'WORKING',
          value: 'WORKING'
        }, {
          label: 'SHIPPED',
          value: 'SHIPPED'
        }, {
          label: 'IN_TRANSIT',
          value: 'IN_TRANSIT'
        }, {
          label: 'DELIVERED',
          value: 'DELIVERED'
        }, {
          label: 'CHECKED_IN',
          value: 'CHECKED_IN'
        }, {
          label: 'RECEIVING',
          value: 'RECEIVING'
        }
      ],
      areCasesRequiredList: [
        {
          label: '全部',
          value: 'null'
        }, {
          label: '是',
          value: '1'
        }, {
          label: '否',
          value: '0'
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
          sortHeader: "按入库单状态",
          sortField: "ZT",
          sortType: "up",
        },
      ],
      inboundColumn: [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          fixed: 'left'
        }, {
          title: 'NO.',
          key: '',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('div', params.index + 1);
          }
        }, {
          title: '入库单号',
          key: 'wmsFbaReceiptId',
          align: 'center',
          minWidth: 150
        }, {
          title: 'ShipmentId',
          key: 'shipmentId',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            return h('div', {
              style: {
                color: '#0000FF',
                cursor: 'pointer',
                textDecoration: 'underline'
              },
              on: {
                click: () => {
                  this.detailModal = true;
                  this.detailModalStatus = true;
                  this.rowData = params.row;
                  this.getDetailData(params.row.wmsFbaReceiptId);
                }
              }
            }, params.row.shipmentId);
          }
        }, {
          title: 'ShipmentName',
          key: 'shipmentName',
          align: 'center',
          minWidth: 150
        }, {
          title: 'FBA仓储中心编号',
          key: 'destinationFulfillmentCenterId',
          align: 'center',
          minWidth: 150
        }, {
          title: '贴标类型',
          key: 'labelPrepType',
          align: 'center',
          minWidth: 150
        }, {
          title: 'ShipmentStatus',
          key: 'shipmentStatus',
          align: 'center',
          minWidth: 150
        }, {
          title: '是否原厂包装发货',
          key: 'areCasesRequired',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            if (params.row.areCasesRequired) {
              return h('div', 'Y');
            } else {
              return h('div', 'N');
            }
          }
        }, {
          title: '操作',
          key: 'operation',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            return !this.getPermission('wmsFbaReceiptDetail_detail') || h('Button', {
              props: {
                size: 'small'
              },
              on: {
                click: () => {
                  this.detailModal = true;
                  this.detailModalStatus = true;
                  this.rowData = params.row;
                  this.getDetailData(params.row.wmsFbaReceiptId);
                }
              }
            }, '查看详情');
          }
        }
      ],
      inboundData: [],
      totalPage: 0,
      total: 0,
      curPage: 1,
      detailModal: false,
      detailModalStatus: false,
      rowData: [], // 当前行数据
      detailData: [], // 详情数据
      detailColumn: [
        {
          title: 'NO.',
          key: '',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('div', params.index + 1);
          }
        }, {
          title: 'SellerSKU',
          key: 'sellerSku',
          align: 'center',
          minWidth: 150
        }, {
          title: 'MSKU',
          key: 'fnsku',
          align: 'center',
          minWidth: 150
        }, {
          title: '已发货数量',
          key: 'quantityShipped',
          align: 'center',
          minWidth: 100
        }, {
          title: '已收货数量',
          key: 'quantityReceived',
          align: 'center',
          minWidth: 100
        }
      ],
      wareId: this.getWarehouseId() // 仓库ID
    };
  },
  methods: {
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.upDown = type;
      this.pageParams.orderBy = feild;
      this.getList();
    },
    labelPrepTypeChange(val) {
      this.sltChangeProcess(val, 'labelPrepType');
    },
    shipmentStatusChange(val) {
      this.sltChangeProcess(val, 'shipmentStatus');
    },
    sltChangeProcess(val, string) {
      // 多选模式下全部和选项的切换
      if (val.length > 1) {
        if (val[val.length - 1] === '*') {
          this.pageParams[string] = ['*'];
        } else {
          if (val.indexOf('*') > -1) {
            val.splice(val.indexOf('*'), 1);
            this.pageParams[string] = val;
          }
        }
      }
    },
    search() {
      // 查询
      this.curPage = 1;
      this.pageParams.pageNum = 1;
      this.$nextTick(() => {
        this.pageParamsStatus = true;
      })
    },
    exportDataHasCondition() {
      // 导出
      // this.exportData('all');
    },
    exportData(type) { },
    getList() {
      // 获取列表数据
      if (!this.getPermission('wmsFbaReceipt_query')) return;
      let v = this;
      let obj = {
        shipmentId: v.pageParams.shipmentId,
        labelPrepType: v.pageParams.labelPrepType,
        shipmentStatus: v.pageParams.shipmentStatus,
        shipmentName: v.pageParams.shipmentName,
        areCasesRequired: v.pageParams.areCasesRequired,
        pageNum: v.pageParams.pageNum,
        pageSize: v.pageParams.pageSize,
        orderBy: v.pageParams.orderBy, // upDown: v.pageParams.upDown,
        orderSeq: v.pageParams.upDown === 'up' ? 'ASC' : 'DESC',
        warehouseId: v.wareId
      };
      if (v.pageParams.labelPrepType[0] === '*') {
        obj.labelPrepType = null;
      }
      if (v.pageParams.shipmentStatus[0] === '*') {
        obj.shipmentStatus = null;
      }
      if (v.pageParams.areCasesRequired === 'null') {
        obj.areCasesRequired = null;
      }
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(api.query_fbaReceipt, obj).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            v.inboundData = data.list;
            v.$nextTick(function () {
              v.total = Number(data.total);
              v.totalPage = Number(data.pages);
              v.TableLoading = false;
              v.SearchDisabled = false;
            });
          }
        }
      });
    },
    cancel() {
      // 取消详情模态
      let v = this;
      v.detailModal = false;
      v.detailData = [];
      v.rowData = [];
    },
    getDetailData(id) {
      // 获取详情数据
      let v = this;
      let obj = {
        wmsFbaReceiptId: id,
        warehouseId: v.wareId
      };
      v.TableLoading = true;
      v.axios.post(api.get_fbaReceiptDetail, obj).then(response => {
        v.TableLoading = false;
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.detailData = data.wmsFbaReceiptDetails;
        }
      });
    }
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(420);
    }
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
  created() {
    this.getList();
  }
};
</script >
