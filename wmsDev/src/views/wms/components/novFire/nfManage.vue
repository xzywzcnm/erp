<template >
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content searchMain">
          <Form :model="pageParams" :inline="true" :label-width="80" ref="pageParams">
            <dyt-filter ref="dyt-filter">
              <Form-item label="新火 SKU：" prop="goodsSkuList">
                <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.goodsSkuList"
                  placeholder="多个请用逗号或回车分隔" />
              </Form-item>
              <Form-item label="有可用库存" prop="hasAvailQty">
                <dyt-select v-model="pageParams.hasAvailQty" clearable>
                  <Option v-for="item in hasAvailQtyList" :value="item.value" :key="item.value" :label="item.label" />
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
          <Button style="marginLeft:20px;" type="primary" v-if="permission.sync" @click="syncInventory">同步库存
          </Button>
          <Dropdown @on-click="exportAllOrSlt" class="ml10" v-if="permission.export">
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
    return {
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        upDown: 'up',
        orderBy: 'CT',
        hasAvailQty: null,
        warehouseId: this.getWarehouseId(),
        goodsSkuList: []
      },
      hasAvailQtyList: [
        { label: '有', value: 1 },
        { label: '无', value: 0 }
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
          sortField: "GX",
          sortType: "up",
        },
      ],
      stockColumn: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '图片',
          key: 'image',
          align: 'center',
          width: 100,
          render: (h, { row }) => {
            const imgUrlPrefix = this.$store.state.imgUrlPrefix;
            let imageUrl = row.imageUrl;
            if (this.$common.isUrl(row.imageUrl)) {
              imageUrl = imageUrl.replace('http:', '').replace('https:', '');
            } else {
              imageUrl = this.$common.isEmpty(imageUrl) ? this.placeholderSrc : `${imgUrlPrefix}${imageUrl}`;
            }
            return this.tableImg(h, '', '', imageUrl);
          }
        },
        {
          title: '新火 SKU',
          key: 'productCode',
          align: 'center'
        },
        {
          title: '新火中文名称',
          key: 'cnName',
          align: 'center'
        },
        {
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
        },
        {
          title: '重量（kg）',
          key: 'weight',
          align: 'center'
        },
        {
          title: '可用库存',
          key: 'availQty',
          align: 'center'
        },
        {
          title: '采购在途',
          key: 'intransitQty',
          align: 'center'
        },
        // {
        //   title: '调拨在途',
        //   key: 'inTransitTransferQty',
        //   align: 'center'
        // },
        {
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
      if (n) {
        this.getList();
        this.pageParamsStatus = false;
      }
    }
  },
  created() {
    this.getList();
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(280);
    },
    permission() {
      return {
        // 同步库存
        sync: this.getPermission('wmsOutstoreInventory_sync'),
        // 导出
        export: this.getPermission('wmsOutstoreInventory_export'),
        // 库存列表
        inquire: this.getPermission('wmsOutstoreInventory_query')
      }
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
    // 重置
    reset() {
      this.$refs.pageParams && this.$refs.pageParams.resetFields();
    },
    // 同步库存
    syncInventory() {
      this.axios.get(`${api.nfInventorySync}?warehouseId=${this.wareId}`).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.pageParamsStatus = true;
        } else {
          this.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    getPageParams() {
      let params = this.$common.copy(this.pageParams);
      params.orderSeq = 'ASC';
      if (!this.$common.isEmpty(params.upDown)) {
        params.orderSeq = params.upDown === 'up' ? 'ASC' : 'DESC';
      }
      delete params.upDown;
      return params;
    },
    // 获取列表数据
    getList() {
      if (!this.permission.inquire) {
        // this.gotoError();
        return this.$Message.error('没有权限')
      }
      let params = this.getPageParams();
      this.TableLoading = true;
      this.SearchDisabled = true;
      this.axios.post(api.nfInventoryQuery, params).then(response => {
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
      this.tableSltData = []
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.upDown = type;
      this.pageParams.orderBy = feild;
      this.getList();
    },
    // 表格选中
    tableSelectionChange(selection) {
      this.tableSltData = selection;
    },
    // 导出
    exportAllOrSlt(name) {
      let obj = this.getPageParams();
      delete obj.pageSize;
      delete obj.pageNum;

      if (name === '0') {
        obj.nfInventoryIdList = this.tableSltData.map(val => val.nfInventoryId);
      } else {
        // 所有
        if (this.stockData.length === 0) {
          this.$Message.warning({
            content: '无数据导出',
            duration: 5
          });
          return;
        }
      }
      this.exportFn(obj);
    },
    exportFn(obj) {
      this.axios.post(api.nfInventoryExport, obj).then(res => {
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