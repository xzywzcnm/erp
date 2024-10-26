<template >
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content searchMain">
          <Form :model="pageParams" :inline="true" :label-width="100" ref="pageParams">
            <dyt-filter ref="dyt-filter">
              <Form-item label="睿邑达SKU：" prop="rinidCodeList">
                <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.rinidCodeList"
                  placeholder="多个请用逗号或回车分隔" />
              </Form-item>
              <Form-item label="有可用库存" prop="hasAvailQty">
                <dyt-select v-model="pageParams.hasAvailQty" clearable>
                  <Option v-for="item in isInventoryflagList" :value="item.value" :key="item.value" :label="item.label" />
                </dyt-select>
              </Form-item>
              <div slot="operation">
                <Button type="primary" icon="ios-search" :disabled="SearchDisabled" @click="search" size="default">查询
                </Button>
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
          <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
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
        :current="pageParams.pageNum" show-sizer @on-page-size-change="changePageSize" placement="top"
        :page-size-opts="pageArray"></Page>
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
        orderSeq: 'DESC',
        orderBy: 'CT',
        hasAvailQty: null,
        warehouseId: v.getWarehouseId(),
        rinidCodeList: []
      },
      isInventoryflagList: [
        { label: '有', value: 1 },
        { label: '无', value: 0 }
      ],
      sortButtonList: [
        {
          sortHeader: "按创建时间",
          sortField: "CT",
          sortType: "DESC",
          default: true,
        },
      ],
      stockColumn: [
        {
          type: 'selection',
          width: 45,
          align: 'center'
        },
        {
          title: '图片',
          key: 'imgUrl',
          align: 'center',
          width: 100,
          render: (h, params) => {
            if (this.$common.isEmpty(params.row.imgUrl)) return h('span', '');
            if (['http://'].includes(params.row.imgUrl.substring(0, 7)) || ['https://'].includes(params.row.imgUrl.substring(0, 8))) {
              return this.tableImg(h, params, 'imgUrl', params.row.imgUrl);
            }
            return this.tableImg(h, params, 'imgUrl');
          }
        },
        {
          title: '睿邑达SKU',
          key: 'rinidCode',
          minWidth: 150,
          align: 'center'
        },
        {
          title: '睿邑达中文名称',
          key: 'cnName',
          minWidth: 200,
          align: 'center'
        },
        {
          title: '长宽高(cm)',
          key: 'price',
          align: 'center',
          minWidth: 100,
          render: (h, { row }) => {
            const rowItem = [row.length, row.width, row.height].filter(f => !this.$common.isEmpty(f)).join('*');
            return h('span', {}, rowItem);
          }
        },
        {
          title: '重量（g）',
          key: 'weight',
          minWidth: 90,
          align: 'center'
        },
        {
          title: '可用库存',
          key: 'quantity',
          minWidth: 90,
          align: 'center'
        },
        {
          title: '在途库存',
          key: 'purchasingQuantity',
          minWidth: 90,
          align: 'center'
        },
        {
          title: '待拣货库存',
          key: 'waitPickQuantity',
          minWidth: 90,
          align: 'center'
        },
        {
          title: '待发货库存',
          key: 'waitingShipedQuantity',
          minWidth: 90,
          align: 'center'
        },
        {
          title: '更新时间',
          key: 'updatedTime',
          align: 'center',
          minWidth: 140
        }
      ],
      stockData: [],
      totalPage: 0,
      total: 0,
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
      this.pageParams.pageNum = 1;
      this.$nextTick(() => {
        this.pageParamsStatus = true;
      })
    },
    // 重置搜索条件
    reset() {
      this.$refs.pageParams && this.$refs.pageParams.resetFields();
    },
    // 同步库存
    syncInventory() {
      this.axios.post(api.rinid_synchronousInventory, { warehouseId: this.wareId }).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.pageParamsStatus = true;
        } else {
          this.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    getParams() {
      let params = this.$common.copy(this.pageParams);
      return params;
    },
    // 获取列表数据
    getList() {
      if (!this.getPermission('wmsInventory_inquire')) {
        return this.$Message.error('没有权限');
      }
      this.tableSltData = [];
      let params = this.getParams();
      this.TableLoading = true;
      this.SearchDisabled = true;
      this.axios.post(api.rinid_inventoryQuery, params).then(response => {
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
    }, // 导出
    exportAllOrSlt(name) {
      let obj = this.getParams();
      delete obj.pageSize
      delete obj.pageNum
      if (name === '0') {
        obj.rinidInventoryIdList = this.tableSltData.map(val => val.rinidInventoryId);
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
      this.axios.post(api.rinid_exportInventoryManage, obj).then(res => {
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
<style lang="less" scoped>
:deep(.ivu-table-cell) {
  .ivu-tooltip {
    width: 100%;
  }

  .ivu-tooltip-rel {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>