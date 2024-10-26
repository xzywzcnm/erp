<template >
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content">
          <Form :model="pageParams" label-position="left">
            <div class="platformParamsSelect">
              <div class="filterItem">
                <Form-item label="产品编码：">
                  <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.skuCodeList"
                    placeholder="多个产品编码请用逗号或回车分隔" />
                  <Button style="marginLeft:90px;" type="primary" icon="ios-search" :disabled="SearchDisabled"
                    v-if="getPermission('wmsGcInventory_query')" @click="search" size="small">查询 </Button>
                </Form-item>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
    <!-- 排序 -->
    <div class="dataSort grayBg">
      <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch"
        :sorType="{ DESC: 'desc', ASC: 'asc' }">
      </dyt-sortBySelect>
    </div>
    <div class="tableControl">
      <Button style="marginLeft:20px;" type="primary" v-if="getPermission('wmsGcInventory_sync')" @click="synchro">同步库存
      </Button>
      <Dropdown @on-click="exportAllOrSlt" class="ml10" v-if="getPermission('wmsGcInventory_export')">
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
    let v = this;
    return {
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      pageParams: {
        skuCodeList: [],
        pageNum: 1,
        pageSize: 10,
        orderSeq: 'asc',
        orderBy: 'CT',
        warehouseId: v.getWarehouseId()
      },
      sortButtonList: [
        {
          sortHeader: "按创建时间",
          sortField: "CT",
          sortType: "asc",
          default: true,
        },
        {
          sortHeader: "按售价",
          sortField: "SJ",
          sortType: "asc",
        },
      ],
      stockColumn: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '产品编码',
          key: 'productSku',
          align: 'center'
        }, {
          title: '在途数量',
          key: 'onwayQty',
          align: 'center'
        }, {
          title: '待上架数量',
          key: 'pendingQty',
          align: 'center'
        }, {
          title: '可售数量',
          key: 'sellableQty',
          align: 'center'
        }, {
          title: '不合格数量',
          key: 'unsellableQty',
          align: 'center'
        }, {
          title: '待出库数量',
          key: 'reservedQty',
          align: 'center'
        }, {
          title: '历史出库数量',
          key: 'shippedQty',
          align: 'center'
        }, {
          title: '已销售的共享数量',
          key: 'soldSharedQty ',
          align: 'center',
          minWidth: 80
        }, {
          title: '备货数量',
          key: 'stockingQty',
          align: 'center'
        }, {
          title: '缺货数量',
          key: 'piNoStockQty',
          align: 'center'
        }, {
          title: '待调出数量',
          key: 'tuneOutQty',
          align: 'center'
        }, {
          title: '待调入数量',
          key: 'tuneInQty',
          align: 'center'
        }, {
          title: '商品销售价值',
          key: 'productSalesValueQty',
          align: 'center'
        }
      ],
      stockData: [],
      totalPage: 0,
      total: 0,
      curPage: 1,
      wareId: this.getWarehouseId(), // 仓库ID
      tableSltData: []
    };
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
    console.log(1111)
    this.getList();
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(420);
    }
  },
  methods: {
    search() {
      // 查询
      this.curPage = 1;
      this.pageParams.pageNum = 1;
      this.$nextTick(() => {
        this.pageParamsStatus = true;
      })
    }, // 同步库存
    synchro() {
      let v = this;
      v.axios.put(api.put_barnInventorySync + '?warehouesId=' + v.wareId).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        }
      });
    }, // 获取列表数据
    getList() {
      let v = this;
      if (!v.getPermission('wmsGcInventory_query')) {
        v.gotoError();
      }
      let params = JSON.parse(JSON.stringify(v.pageParams));
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(api.query_barnInventoryList, params).then(response => {
        v.TableLoading = false;
        v.SearchDisabled = false;
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.stockData = data.list ? data.list : [];
          v.$nextTick(function () {
            v.total = Number(data.total);
            v.totalPage = Number(data.pages);
          });
        }
      }).catch(() => {
        v.TableLoading = false;
        v.SearchDisabled = false;
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
    }, // 导出
    exportAllOrSlt(name) {
      let obj = JSON.parse(JSON.stringify(this.pageParams));
      if (name === '0') {
        // 选中
        if (this.tableSltData.length === 0) {
          this.$Message.warning('请选择导出数据');
          return;
        }
        obj.wmsGcInventoryIds = this.tableSltData.map(val => val.wmsGcInventoryId);
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
      this.axios.post(api.export_wmsBarnInventory, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
          this.pageParamsStatus = true;
        }
      });
    }
  }
};
</script>
