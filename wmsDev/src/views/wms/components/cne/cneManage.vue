<template >
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content searchMain">
          <Form :model="pageParams" :inline="true" :label-width="80" ref="pageParams">
            <dyt-filter ref="dyt-filter">
              <Form-item label="CNE SKU：">
                <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.goodsSkuList"
                  placeholder="多个请用逗号或回车分隔" />
              </Form-item>
              <Form-item label="有可用库存" prop="isInventoryFlag">
                <dyt-select v-model="pageParams.isInventoryFlag" clearable>
                  <Option v-for="item in isInventoryflagList" :value="item.value" :key="item.value" :label="item.label" />
                </dyt-select>
              </Form-item>
              <div slot="operation">
                <Button style="marginLeft:90px;" type="primary" icon="ios-search" :disabled="SearchDisabled"
                  @click="search" size="default">查询 </Button>
                <Button @click="reset" v-once icon="md-refresh" size="default" style="margin-left: 8px;">重置 </Button>
              </div>
            </dyt-filter>
          </Form>
        </div>
      </div>
    </div>
    <div class="funMain" style="margin:10px;padding:0">
      <div class="funMain__flex">
        <div class="tableControl">
          <Button style="marginLeft:20px;" type="primary" v-if="getPermission('wmsInventory_synchronization')"
            @click="syncInventory">同步库存
          </Button>
          <Dropdown @on-click="exportAllOrSlt" class="ml10" v-if="getPermission('wmsInventory_export')">
            <Button type="primary"><span class="icon iconfont" style="font-size: 12px">&#xe639;</span> 导出
              <Icon type="md-arrow-dropdown"></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem name="0" :disabled="!tableSltData.length">导出选中数据</DropdownItem>
              <DropdownItem name="1">导出所有结果集</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <!-- 排序 -->
        <div class="dataSort">
          <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch"
            :sorType="{ DESC: 'down', ASC: 'up' }">
          </dyt-sortBySelect>
        </div>
      </div>
    </div>
    <div class="tableMain">
      <div class="tableBox">
        <Table highlight-row border :height="tableHeight" :loading="TableLoading" :columns="stockColumn" :data="stockData"
          @on-selection-change="tableSelectionChange"></Table>
      </div>
    </div>
    <div class="pagesMain">
      <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
        :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray">
      </Page>
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
        pageNum: 1,
        pageSize: 10,
        upDown: 'up',
        orderBy: 'CT',
        isInventoryFlag: null,
        warehouseId: v.getWarehouseId(),
        goodsSkuList: []
      },
      isInventoryflagList: [
        { label: '有', value: '1' },
        { label: '无', value: '0' }
      ],
      sortButtonList: [
        {
          sortHeader: "按创建时间",
          sortField: "CT",
          sortType: "up",
          default: true,
        },
        {
          sortHeader: "按更新时间",
          sortField: "UT",
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
          key: 'image',
          align: 'center',
          width: 100,
          render: (h, params) => {
            let imgUrlPrefix = this.$store.state.imgUrlPrefix;
            return h('img', {
              attrs: {
                src: params.row.image === '' || params.row.image === null || params.row.image === undefined
                  ? this.placeholderSrc
                  : imgUrlPrefix + params.row.image
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
          title: 'CNE SKU',
          key: 'goodsSku',
          align: 'center'
        }, {
          title: 'CNE 中文名称',
          key: 'goodsName',
          align: 'center'
        }, {
          title: '长宽高(cm)',
          key: 'price',
          align: 'center',
          render(h, params) {
            if (params.row.length && params.row.width && params.row.height) {
              return h('span', params.row.length + '*' + params.row.width + '*' + params.row.height);
            } else {
              return ''
            }
          }
        }, {
          title: '重量（kg）',
          key: 'weight',
          align: 'center'
        }, {
          title: '可用库存',
          key: 'totalStockQty',
          align: 'center'
        }, {
          title: '采购在途',
          key: 'inTransitPurchaseQty',
          align: 'center'
        }, {
          title: '调拨在途',
          key: 'inTransitTransferQty',
          align: 'center'
        }, {
          title: '更新时间',
          key: 'updatedTime',
          align: 'center',
          minWidth: 80
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
    this.getList();
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(280);
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
    },
    reset() {
      this.pageParams.goodsSkuList = [];
      this.pageParams.isInventoryFlag = null;
    },
    // 返回查询条件
    getPageParams() {
      const assignmentNull = ['isInventoryFlag'];
      let pageParams = this.$common.copy(this.pageParams);
      assignmentNull.forEach(key => {
        if (this.$common.isEmpty(pageParams[key]) && pageParams[key] !== null) {
          pageParams[key] = null;
        }
      });
      return pageParams;
    },
    // 同步库存
    syncInventory() {
      this.axios.post(`${api.syncCneInventory}?warehouseId=${this.wareId}`).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.pageParamsStatus = true;
        } else {
          this.$Message.error('操作失败，请重新尝试');
        }
      });
    }, // 获取列表数据
    getList() {
      let v = this;
      if (!v.getPermission('wmsInventory_inquire')) {
        // v.gotoError();
        return this.$Message.error('没有权限')
      }
      let params = JSON.parse(JSON.stringify(v.pageParams));
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(api.query_cneInventoryList, params).then(response => {
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
      v.tableSltData = []
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.upDown = type;
      this.pageParams.orderBy = feild;
      this.getList();
    },
    tableSelectionChange(selection) {
      this.tableSltData = selection;
    }, // 导出
    exportAllOrSlt(name) {
      let obj = JSON.parse(JSON.stringify(this.pageParams));
      delete obj.pageSize
      delete obj.pageNum
      if (name === '0') {
        obj.wmsCneProductIdList = this.tableSltData.map(val => val.cneInventoryId);
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
      this.axios.post(api.exportInventoryManage, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
          this.pageParamsStatus = true;
        } else {
          this.$Message.error('操作失败，请重新尝试');
        }
      });
    }
  }
};
</script>
<style></style>