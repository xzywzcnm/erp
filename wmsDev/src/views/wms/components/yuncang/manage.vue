<template >
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content searchMain">
          <Form :model="pageParams" :inline="true" :label-width="100" ref="pageParams">
            <dyt-filter ref="dyt-filter">
              <Form-item label="云仓SKU：" prop="skuCodeList">
                <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.skuCodeList"
                  placeholder="多个查询请用逗号或回车分隔" />
              </Form-item>
              <!-- <Form-item label="库存类型：" prop="inventoryTypeList">
                <dyt-select v-model="pageParams.inventoryTypeList" clearable multiple :max-tag-count="1">
                  <Option v-for="item in inventoryTypeList" :value="item.value" :key="item.value" :label="item.label" />
                </dyt-select>
              </Form-item> -->
              <Form-item label="仓库名称：" prop="warehouseNameList">
                <dyt-select v-model="pageParams.warehouseNameList" clearable multiple :max-tag-count="1">
                  <Option v-for="item in warehouseFixList" :value="item.value" :key="item.value" :label="item.label" />
                </dyt-select>
              </Form-item>
              <Form-item label="有可用库存：" prop="hasAvailQty">
                <dyt-select v-model="pageParams.hasAvailQty" clearable>
                  <Option v-for="item in hasAvailQtyList" :value="item.value" :key="item.value" :label="item.label" />
                </dyt-select>
              </Form-item>
              <Form-item label="云仓商户编号：" prop="ymsMerchantIdList" v-if="isYmsStockout">
                <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.ymsMerchantIdList"
                  placeholder="多个查询请用逗号或回车分隔" />
              </Form-item>
              <div slot="operation">
                <Button type="primary" icon="ios-search" :disabled="SearchDisabled"
                  v-if="getPermission('wmsOutstoreInventory_query')" @click="search">查询</Button>
                <Button class="ml10" @click="reset">重置</Button>
              </div>
            </dyt-filter>
          </Form>
        </div>
      </div>
    </div>
    <!-- 排序 -->
    <div class="dataSort grayBg">
      <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
      </dyt-sortBySelect>
    </div>
    <div class="tableControl">
      <Button style="marginLeft:20px;" type="primary" v-if="getPermission('wmsOutstoreInventory_sync')"
        @click="synchro">同步库存 </Button>
      <Dropdown @on-click="exportAllOrSlt" class="ml10" v-if="getPermission('wmsOutstoreInventory_export')">
        <Button type="primary"><span class="icon iconfont" style="font-size: 12px">&#xe639;</span> 导出
          <Icon type="md-arrow-dropdown"></Icon>
        </Button>
        <DropdownMenu slot="list">
          <DropdownItem name="0">导出选中数据</DropdownItem>
          <DropdownItem name="1">导出所有结果集</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
    <div class="orderTable normalTop">
      <Table highlight-row border :height="tableHeight" :loading="TableLoading" :columns="stockColumn" :data="stockData"
        @on-selection-change="tableSelectionChange"></Table>
      <div class="table-page flexBox">
        <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
          :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray">
        </Page>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data() {
    return {
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      pageParams: {
        skuCodeList: [],
        // inventoryTypeList: [],
        warehouseNameList: [],
        ymsMerchantIdList: [],
        pageNum: 1,
        pageSize: 10,
        hasAvailQty: null,
        orderSeq: 'ASC',
        orderBy: 'CT',
        warehouseId: this.getWarehouseId()
      },
      hasAvailQtyList: [
        { label: '有', value: 1 },
        { label: '无', value: 0 }
      ],
      sortButtonList: [
        {
          sortHeader: "按创建时间",
          sortField: "CT",
          sortType: "ASC",
          default: true,
        },
        {
          sortHeader: "按售价",
          sortField: "SJ",
          sortType: "ASC",
        },
      ],
      stockColumn: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '图片',
          key: 'goodsUrl',
          align: 'center',
          width: 100,
          render: (h, params) => {
            let imgUrlPrefix = this.$store.state.imgUrlPrefix;
            return h('img', {
              attrs: {
                src: params.row.goodsUrl === '' || params.row.goodsUrl === null || params.row.goodsUrl === undefined
                  ? this.placeholderSrc
                  : imgUrlPrefix + params.row.goodsUrl
              },
              style: {
                width: '48px',
                height: '48px',
                border: '1px solid #d7dde4',
                padding: '4px',
                marginRight: '8px',
                marginTop: '6px',
                cursor: 'pointer'
              }
            });
          }
        }, {
          title: '云仓SKU', // 云仓SKU
          key: 'productCode',
          align: 'center'
        },
        // {
        //   title: '库存类型',
        //   // key: 'inventoryType',
        //   align: 'center',
        //   render: (h, params) => {
        //     let item = this.inventoryTypeList[params.row.inventoryType] || {};
        //     return h('div', {}, item.label || '');
        //   }
        // },
        {
          title: '仓库名称',
          key: 'warehouseName',
          align: 'center',
          render: (h, params) => {
            let item = this.warehouseFixList[params.row.warehouseName] || {};
            return h('div', {}, item.label || '');
          }
        },
        {
          title: '云仓商户编号',
          key: 'ymsMerchantId',
          align: 'center'
        }, {
          title: 'SKU库存批次号', // SKU库存批次号
          key: 'batchNo',
          align: 'center',
          render(h, params) {
            let text = JSON.parse(params.row.paramJson).batch_no || '';
            return h('span', text);
          }
        }, {
          title: '可用库存', // 可用库存
          key: 'availQty',
          align: 'center'
        }, {
          title: '待出库存', // 待出库存
          key: 'waitingShipQuantity',
          align: 'center'
        }, {
          title: '在途库存', // 在途库存
          key: 'intransitQty',
          align: 'center'
        }, {
          title: '库存质量', // 库存质量
          key: 'stockQuality',
          align: 'center',
          render(h, params) {
            let text = JSON.parse(params.row.paramJson).stockQuality || '';
            return h('span', text);
          }
        }
      ],
      stockData: [],
      totalPage: 0,
      total: 0,
      curPage: 1,
      wareId: this.getWarehouseId(), // 仓库ID
      tableSltData: [],
      inventoryTypeList: {
        'SUPPLIER': { label: '供应商库存', value: 'SUPPLIER' },
        'YMS': { label: '中心仓库存', value: 'YMS' },
      },
      warehouseFixList: {
        'SUPPLIER': { label: '供应商仓', value: 'SUPPLIER' },
        '佛山仓库': { label: '佛山仓库', value: '佛山仓库' },
        '美西1号仓': { label: '美西1号仓', value: '美西1号仓' },
      },
      warehouseList: {},
      transWarehouse: ['YMS云仓'],
    };
  },
  methods: {
    // 获取仓库列表
    getWarehouseList() {
      this.$store.dispatch('getWarehouseList').then(list => {
        this.warehouseList = this.$common.arrayToObj(list || [], 'warehouseId');
      })
    },
    search() {
      // 查询
      this.curPage = 1;
      this.pageParams.pageNum = 1;
      this.$nextTick(() => {
        this.pageParamsStatus = true;
      })
    },
    // 同步库存
    synchro() {
      this.axios.put(api.put_cloudInventorySync + '?warehouesId=' + this.wareId).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.pageParamsStatus = true;
        }
      });
    },
    // 返回查询条件
    getPageParams() {
      const assignmentNull = ['hasAvailQty'];
      let pageParams = this.$common.copy(this.pageParams);
      assignmentNull.forEach(key => {
        if (this.$common.isEmpty(pageParams[key]) && pageParams[key] !== null) {
          pageParams[key] = null;
        }
      });
      return pageParams;
    },
    // 获取列表数据
    getList() {
      if (!this.getPermission('wmsOutstoreInventory_query')) {
        this.gotoError();
      }
      let params = this.getPageParams();
      this.TableLoading = true;
      this.SearchDisabled = true;
      this.axios.post(api.query_cloudInventoryList, params).then(response => {
        this.TableLoading = false;
        this.SearchDisabled = false;
        if (response.data.code === 0) {
          let data = response.data.datas;
          this.stockData = data.list ? data.list : [];
          this.$nextTick(() => {
            this.total = Number(data.total);
            this.totalPage = Number(data.pages);
          });
        }
      }).catch(() => {
        this.TableLoading = false;
        this.SearchDisabled = false;
      })
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.orderSeq = type;
      this.pageParams.orderBy = feild;
      this.getList();
    },
    tableSelectionChange(selection) {
      this.tableSltData = selection;
    },
    // 导出
    exportAllOrSlt(name) {
      let obj = this.getPageParams();
      if (name === '0') {
        // 选中
        if (this.tableSltData.length === 0) {
          this.$Message.warning('请选择导出数据');
          return;
        }
        obj.wmsOutstoreInventoryIds = this.tableSltData.map(val => val.wmsOutstoreInventoryId);
        this.exportFn(obj);
      } else {
        // 所有
        if (this.stockData.length === 0) {
          this.$Message.warning({
            content: '无数据导出',
            duration: 5
          });
          return;
        }
        this.exportFn(obj);
      }
    },
    exportFn(obj) {
      this.axios.post(api.export_wmsOutstoreInventoryExport, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
          this.pageParamsStatus = true;
        }
      });
    },
    // 重置
    reset() {
      this.$refs['pageParams'].resetFields();
    }
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
      return this.getTableHeight(320);
    },
    warehouseId() {
      return this.$store.state.warehouseId || v.getWarehouseId();
    },
    isYmsStockout() {
      let wareInfo = this.warehouseList[this.warehouseId] || {};
      return this.transWarehouse.includes(wareInfo.warehouseName);
    },
  },
  created() {
    this.getList();
    this.getWarehouseList();
  }
};
</script>
