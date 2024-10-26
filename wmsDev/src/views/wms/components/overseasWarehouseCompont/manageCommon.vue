<template>
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content">
          <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
            <Row type="flex" :gutter="gutterItem">
              <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol">
              <Form-item label="产品编码：" prop="skuCodeList">
                <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.skuCodeList"
                  placeholder="多个产品编码请用逗号或回车分隔" />
              </Form-item>
              </Col>
            </Row>
            <Row type="flex" justify="space-between" :gutter="gutterItem">
              <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" :offset="offsetCol"
                v-if="getPermission('wmsOutstoreInventory_query')">
              <Button type="primary" :disabled="tableLoading" @click="search" icon="ios-search" size="small">查询
              </Button>
              <Button @click="reset" v-once icon="md-refresh" size="small" style="margin-left: 8px;">重置 </Button>
              </Col>
            </Row>
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
        @click="synchro">同步库存</Button>
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
      <Table highlight-row border :height="tableHeight" :loading="tableLoading" :columns="tableColumn" :data="stockData"
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
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  props: {
    // 表格展示数据
    tableColumn: {
      required: true,
      type: Array,
      default: () => []
    }, // 导出接口地址
    exportApi: {
      required: true,
      type: String
    }, // 导出参数key
    exportParams: {
      required: true,
      type: String
    }, // 商品同步接口地址
    productSyncApi: {
      required: true,
      type: String
    }, // 列表接口地址
    getListApi: {
      required: true,
      type: String
    }
  },
  data() {
    return {
      tableSltData: [],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      pageParams: {
        skuCodeList: [],
        pageNum: 1,
        pageSize: 10,
        orderBy: 'CT',
        upDown: 'ASC'
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
          sortType: "ASC",
          default: true,
        },
        {
          sortHeader: "按更新时间",
          sortField: "GX",
          sortType: "ASC",
        },
      ],
      stockData: [],
      tableLoading: true,
      totalPage: 0,
      total: 0,
      curPage: 1,
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
    // 重置
    reset() {
      this.$refs['pageParams'].resetFields();
    },
    tableSelectionChange(selection) {
      this.tableSltData = selection;
    },
    paramsFn() {
      let v = this;
      // if (v.pageParams.upDown === 'up') {
      //   v.pageParams.orderSeq = 'ASC';
      // } else {
      //   v.pageParams.orderSeq = 'DESC';
      // }
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
        obj[this.exportParams + 's'] = this.tableSltData.map(val => val[this.exportParams]);
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
      this.axios.post(this.exportApi, obj).then(res => {
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
      v.axios.put(v.productSyncApi + '?warehouesId=' + v.wareId).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        }
      });
    },
    getList() {
      let v = this;
      if (!v.getPermission('wmsOutstoreInventory_query')) {
        v.gotoError();
      }
      let params = v.paramsFn();
      v.tableLoading = true;
      v.axios.post(v.getListApi, params).then(response => {
        v.tableLoading = false;
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.stockData = data.list ? data.list : [];
          v.$nextTick(function () {
            v.total = Number(data.total);
            v.totalPage = Number(data.pages);
            v.tableLoading = false;
          });
        }
      }).catch(() => {
        v.tableLoading = false;
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
</script>
