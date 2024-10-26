<template>
  <div class="managePage">
    <div class="listPage">
      <div class="searchMain">
        <Form ref="pageParams" :model="pageParams" :label-width="90">
          <dyt-filter ref="dyt-filter" @expand="expand">
            <Form-item label="产品编码：" prop="skuCodeList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.skuCodeList"
                placeholder="多个产品编码请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="LAPA SKU：" prop="lapaSkuList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.lapaSkuList" placeholder="多个请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="有可售：" prop="isSaleable">
              <dyt-select v-model="pageParams.isSaleable">
                <Option v-for="(item, index) in selectList" :value="item.value" :key="index + 'isSaleable'"
                  :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="有在途：" prop="isOnWay">
              <dyt-select v-model="pageParams.isOnWay">
                <Option v-for="(item, index) in selectList" :value="item.value" :key="index + 'isOnWay'"
                  :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="有剩余：" prop="isSurplus">
              <dyt-select v-model="pageParams.isSurplus">
                <Option v-for="(item, index) in selectList" :value="item.value" :key="index + 'isSurplus'"
                  :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <div slot="operation">
              <Button type="primary" icon="ios-search" :disabled="SearchDisabled"
                v-if="getPermission('wmsGcInventory_query')" @click="search" class="mr10">查询</Button>
              <Button @click="reset" icon="md-refresh">重置</Button>
            </div>
          </dyt-filter>
        </Form>
      </div>

      <!-- 排序 -->
      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <Button type="primary" v-if="getPermission('wmsGcInventory_sync')" @click="synchro">同步库存
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
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" :sorType="{ DESC: 'desc', ASC: 'asc' }"
              @sortInfo="getSortInfoAndFetch">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>

      <div class="tableMain">
        <div class="tableBox">
          <Table highlight-row border :height="tableHeight" :loading="TableLoading" :columns="stockColumn"
            :data="stockData" @on-selection-change="tableSelectionChange">
            <template slot-scope="{ row }" slot="pictureUrl">
              <div class="picture-width">
                <dyt-previewImg :url="row.pictureUrl"></dyt-previewImg>
              </div>
            </template>
            <template slot-scope="{ row }" slot="desc">
              <div>{{ row.cnName || '-' }}</div>
              <div class="mt4">{{ row.enName || '-' }}</div>
            </template>
            <template slot-scope="{ row }" slot="actions">
              <div class="unlinkText cursorClick" @click="instockDetail(row)">入库详情</div>
            </template>
          </Table>
        </div>
      </div>

      <div class="pagesMain">
        <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
          :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray">
        </Page>
      </div>

      <!-- 入库详情 -->
      <inventoryDetail :dialogVisible.sync="inventoryInfo.visible" :modalData="inventoryInfo.data" @search="search" />
    </div>
  </div>
</template>

<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';
import inventoryDetail from './warehouse/inventoryDetail';

export default {
  name: 'manage',
  mixins: [Mixin, tableHeight_mixin],
  components: { inventoryDetail },
  data() {
    let v = this;
    return {
      pageParams: {
        skuCodeList: [],
        lapaSkuList: [],
        isSaleable: '',
        isOnWay: '',
        isSurplus: '',
        pageNum: 1,
        pageSize: 10,
        orderSeq: 'desc',
        orderBy: 'CT',
        warehouseId: v.getWarehouseId()
      },
      sortButtonList: [
        {
          sortHeader: '按创建时间',
          sortField: 'CT',
          sortType: 'desc',
          default: true,
        },
        {
          sortHeader: '按售价',
          sortField: 'SJ',
          sortType: 'desc',
        },
      ],
      stockColumn: [
        {
          type: 'selection',
          width: 60,
          align: 'left'
        }, {
          title: '产品编码',
          key: 'productSku',
          align: 'left',
          minWidth: 120,
        }, {
          title: '图片',
          slot: 'pictureUrl',
          width: 90,
          align: 'left',
        }, {
          title: 'LAPA SKU',
          key: 'lapaSku',
          align: 'left',
          width: 100,
        },
        {
          title: '中英文描述',
          slot: 'desc',
          minWidth: 130,
          align: 'left',
        },
        {
          title: '在途数量',
          key: 'onwayQty',
          align: 'left',
          width: 90,
        }, {
          title: '待上架数量',
          key: 'pendingQty',
          align: 'left',
          width: 100,
        }, {
          title: '可售数量',
          key: 'sellableQty',
          align: 'left',
          width: 90,
        }, {
          title: '不合格数量',
          key: 'unsellableQty',
          align: 'left',
          width: 100,
        },
        // {
        //   title: '待出库数量',
        //   key: 'reservedQty',
        //   align: 'left'
        // },
        {
          title: '历史出库数量',
          key: 'shippedQty',
          align: 'left',
          width: 110,
        },
        // {
        //   title: '已销售的共享数量',
        //   key: 'soldSharedQty ',
        //   align: 'left',
        //   minWidth: 80
        // },
        {
          title: '备货数量',
          key: 'stockingQty',
          align: 'left',
          width: 90,
        }, {
          title: '缺货数量',
          key: 'piNoStockQty',
          align: 'left',
          width: 90,
        }, {
          title: '冻结数量',
          key: 'piFreeze',
          align: 'left',
          width: 90,
        }, {
          title: '总上架',
          key: 'sumShelvesQuantity',
          align: 'left',
          width: 90,
        }, {
          title: '总调整',
          key: 'sumAdjustmentQuantity',
          align: 'left',
          width: 90,
        }, {
          title: '总使用',
          key: 'sumUseQuantity',
          align: 'left',
          width: 90,
        }, {
          title: '总剩余',
          key: 'sumRemainingQuantity',
          align: 'left',
          width: 90,
        }, {
          title: '操作',
          slot: 'actions',
          align: 'left',
          width: 90,
          fixed: 'right',
        },
        // {
        //   title: '待调出数量',
        //   key: 'tuneOutQty',
        //   align: 'left'
        // }, {
        //   title: '待调入数量',
        //   key: 'tuneInQty',
        //   align: 'left'
        // }, {
        //   title: '商品销售价值',
        //   key: 'productSalesValueQty',
        //   align: 'left'
        // }
      ],
      stockData: [],
      totalPage: 0,
      total: 0,
      curPage: 1,
      wareId: this.getWarehouseId(), // 仓库ID
      tableSltData: [],
      selectList: [
        { label: '无', value: 1 },
        { label: '有', value: 0 },
      ],
      inventoryInfo: {
        visible: false,
        data: {},
      },
    };
  },
  methods: {
    // 重置
    reset() {
      this.$refs.pageParams.resetFields();
    },
    // 查询
    search() {
      this.pageParams.pageNum = 1;
      this.getList();
    },
    // 同步库存
    synchro() {
      this.axios.put(api.put_barnInventorySync + '?warehouesId=' + this.wareId).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.search();
        }
      });
    },
    // 获取列表数据
    getList() {
      let v = this;
      if (!v.getPermission('wmsGcInventory_query')) {
        v.gotoError();
      }
      let params = JSON.parse(JSON.stringify(v.pageParams));
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(api.query_barnInventoryList, params).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.stockData = data.list ? data.list : [];
          v.$nextTick(function () {
            v.total = Number(data.total);
            v.totalPage = Number(data.pages);
          });
        }
      }).finally(() => {
        v.TableLoading = false;
        v.SearchDisabled = false;
        v.tableSltData = [];
      })
    },
    tableSelectionChange(selection) {
      this.tableSltData = selection;
    },
    // 导出
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
          this.search();
        }
      });
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.orderSeq = type;
      this.pageParams.orderBy = feild;
      this.search();
    },
    // 入库详情
    instockDetail(row) {
      this.inventoryInfo.data = this.$common.copy(row);
      this.inventoryInfo.visible = true;
    },
    changePage(page) {
      this.pageParams.pageNum = page;
      this.getList();
    },
    changePageSize(pageSize, plat) {
      this.pageParams.pageSize = pageSize;
      this.search();
    },
  },
  created() {
    this.getList();
  }
};
</script >
<style lang="less" scoped>
.managePage {
  height: 100%;
  position: relative;
}
</style>
