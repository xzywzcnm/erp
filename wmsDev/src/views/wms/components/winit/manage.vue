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
                  <Button style="marginLeft:90px;" type="primary" :disabled="SearchDisabled" icon="ios-search"
                    v-if="getPermission('wmsWinitInventory_query')" @click="search" size="small">查询</Button>
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
        :sorType="{ DESC: 'down', ASC: 'up' }">
      </dyt-sortBySelect>
    </div>
    <div class="tableControl">
      <Button style="marginLeft:20px;" type="primary" v-if="getPermission('wmsWinitInventory_sync')"
        @click="synchro">同步库存</Button>
      <Dropdown @on-click="exportAllOrSlt" class="ml10" v-if="getPermission('wmsWinitInventory_export')">
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

<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data() {
    let v = this;
    return {
      tableSltData: [],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      pageParams: {
        skuCodeList: [],
        pageNum: 1,
        pageSize: 10,
        orderBy: 'CT',
        upDown: 'up'
      },
      groupList: [
        {
          label: 'SKU',
          value: '1'
        }, {
          label: 'MSKU',
          value: '2'
        }, {
          label: 'FNSKU',
          value: '3'
        }, {
          label: 'ASIN',
          value: '4'
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
          sortHeader: "按售价",
          sortField: "SJ",
          sortType: "up",
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
          title: '产品编码',
          key: 'productCode',
          align: 'center',
          minWidth: 200
        }, {
          title: '产品名称',
          key: 'productCnName',
          align: 'center',
          minWidth: 200
        }, {
          title: '规格',
          key: 'specification',
          align: 'center',
          minWidth: 150
        }, {
          title: '有效库存',
          key: 'availQty',
          align: 'center',
          minWidth: 150
        }, {
          title: '在途库存',
          key: 'intransitQty',
          align: 'center',
          minWidth: 150
        }, {
          title: '共享库存',
          key: 'shareQty',
          align: 'center',
          minWidth: 150
        }, {
          title: '待发库存',
          key: 'waitingShipQuantity',
          align: 'center',
          minWidth: 150
        }, {
          title: '历史入库库存',
          key: 'historyInQty',
          align: 'center',
          minWidth: 150
        }, {
          title: '历史出库库存',
          key: 'historyOutQty',
          align: 'center',
          minWidth: 150
        }, {
          title: '历史代销量',
          key: 'historySalesQty',
          align: 'center',
          minWidth: 150
        }
      ],
      stockData: [],
      totalPage: 0,
      total: 0,
      curPage: 1,
      wareId: v.getWarehouseId() // 仓库ID
    };
  },
  methods: {
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.upDown = type;
      this.pageParams.orderBy = feild;
      this.getList();
    },
    tableSelectionChange(selection) {
      this.tableSltData = selection;
    },
    paramsFn() {
      let v = this;
      if (v.pageParams.upDown === 'up') {
        v.pageParams.orderSeq = 'ASC';
      } else {
        v.pageParams.orderSeq = 'DESC';
      }
      v.pageParams.warehouseId = v.wareId;
      return JSON.parse(JSON.stringify(v.pageParams));
    },
    exportAllOrSlt(name) {
      // 导出
      let obj = this.paramsFn();
      if (name === '0') {
        // 选中
        if (this.tableSltData.length === 0) {
          this.$Message.warning('请选择导出数据');
          return;
        }
        obj.winitInventoryIds = this.tableSltData.map(val => val.wmsWinitInventoryId);
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
      this.axios.post(api.export_wmsWinitInventory, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
        }
      });
    },
    search() {
      // 查询
      this.curPage = 1;
      this.pageParams.pageNum = 1;
      this.$nextTick(() => {
        this.pageParamsStatus = true;
      })
    },
    synchro() {
      // 同步
      let v = this;
      v.axios.put(api.put_winitInventorySync + '?warehouesId=' + v.wareId).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        }
      });
    },
    getList() {
      let v = this;
      if (!v.getPermission('wmsWinitInventory_query')) {
        v.gotoError();
      }
      let params = v.paramsFn();
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(api.query_winitInventoryList, params).then(response => {
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
  computed: {
    tableHeight() {
      return this.getTableHeight(420);
    }
  },
  created() {
    this.getList();
  }
};
</script >
