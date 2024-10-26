<template >
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content">
          <Form :model="pageParams" label-position="left">
            <div class="platformParamsSelect">
              <div class="filterItem">
                <Form-item>
                  <Select v-model="pageParams.skuType" style="width: 100px;">
                    <Option v-for="d in groupList" :value="d.value" :key="d.value">{{ d.label }}</Option>
                  </Select> <Input v-model.trim="pageParams.sku" style="width: 200px;marginLeft:15px;"></Input>
                  <Button v-if="getPermission('wmsFbaInventory_query')" style="marginLeft:20px;" type="primary"
                    icon="ios-search" @click="search" :disabled="TableLoading" size="small">查询</Button>
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
    <div class="tableControl" v-if="getPermission('wmsFbaInventory_sync')">
      <Button style="marginLeft:20px;" type="primary" @click="synchro">同步库存</Button>
    </div>
    <div class="orderTable normalTop">
      <Table highlight-row border :height="tableHeight" :loading="TableLoading" :columns="stockColumn" :data="stockData">
      </Table>
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
        sku: null,
        skuType: '1',
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
          title: '商品信息',
          key: 'asin',
          align: 'center',
          minWidth: 200,
          render: (h, params) => {
            return h('div', [
              h('div', 'ASIN：' + params.row.asin),
              h('div', '父' + 'ASIN：' + params.row.parentAsin),
              h('div', params.row.variations)
            ]);
          }
        }, {
          title: 'MSKU/FNSKU',
          key: 'sellerSku',
          align: 'center',
          minWidth: 200,
          render: (h, params) => {
            return h('div', [h('div', 'MSKU:' + params.row.sellerSku), h('div', 'FNSKU:' + params.row.fnsku)]);
          }
        }, {
          title: 'Title',
          key: 'title',
          align: 'center',
          minWidth: 150
        }, {
          title: 'LAPA SKU/产品名称',
          key: 'goodsSku',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            return h('div', [h('div', params.row.goodsSku), h('div', params.row.goodsCnDesc)]);
          }
        }, {
          title: '库存数量',
          key: 'afnWarehouseQuantity',
          align: 'center',
          minWidth: 150
        }, {
          title: '可售数量',
          key: 'afnFulfillableQuantity',
          align: 'center',
          minWidth: 150
        }, {
          title: '不可售数量',
          key: 'afnUnsellableQuantity',
          align: 'center',
          minWidth: 150
        }, {
          title: '保留数量',
          key: 'afnReservedQuantity',
          align: 'center',
          minWidth: 150
        }, {
          title: '总数',
          key: 'afnTotalQuantity',
          align: 'center',
          minWidth: 150
        }, {
          title: '单位体积',
          key: 'perUnitVolume',
          align: 'center',
          minWidth: 150
        }, {
          title: '在途数量-WORKING',
          key: 'afnInboundWorkingQuantity',
          align: 'center',
          minWidth: 150
        }, {
          title: '在途数量-SHIPPING',
          key: 'afnInboundShippedQuantity',
          align: 'center',
          minWidth: 150
        }, {
          title: '在途数量-RECEIVING',
          key: 'afnInboundReceivingQuantity',
          align: 'center',
          minWidth: 160
        }, {
          title: '创建时间',
          key: 'createdTime',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            if (params.row.createdTime) {
              return h('div', this.$uDate.dealTime(params.row.createdTime));
            }
          }
        }, {
          title: '更新时间',
          key: 'updatedTime',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            if (params.row.updatedTime) {
              return h('div', this.$uDate.dealTime(params.row.updatedTime));
            }
          }
        }
      ],
      stockData: [],
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
      v.axios.put(api.put_sync + '?warehouesId=' + v.wareId).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        }
      });
    },
    getList() {
      let v = this;
      if (!v.getPermission('wmsFbaInventory_query')) return;
      if (v.pageParams.upDown === 'up') {
        v.pageParams.orderSeq = 'ASC';
      } else {
        v.pageParams.orderSeq = 'DESC';
      }
      v.pageParams.warehouseId = v.wareId;
      v.TableLoading = true;
      v.axios.post(api.query_fbaInventory, v.pageParams).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.stockData = data.list;
          v.$nextTick(function () {
            v.total = Number(data.total);
            v.totalPage = Number(data.pages);
            v.TableLoading = false;
          });
        }
      });
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
