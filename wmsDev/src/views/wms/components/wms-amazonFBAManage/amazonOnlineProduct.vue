<template >
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformSearch clear" style="margin-left:5px;">
            <Form :model="pageParams" label-position="left">
              <Row>
                <Col span="2">
                <Form-item>
                  <Select v-model="pageParams.skuType" style="width: 100px;">
                    <Option v-for="d in groupList" :value="d.value" :key="d.value">{{ d.label }}</Option>
                  </Select>
                </Form-item>
                </Col>
                <Col span="5">
                <Form-item>
                  <Input v-model.trim="pageParams.sku" style="width: 200px;"></Input>
                </Form-item>
                </Col>
              </Row>
              <Row>
                <Col span="20">
                <Form-item label="关联SKU：">
                  <Button-group>
                    <Button v-for="d in cognateSku" :key="d.value" :type="d.checked ? 'primary' : 'default'"
                      @click="changeCognateStatus(d.value)">{{ d.label }}</Button>
                  </Button-group>
                </Form-item>
                </Col>
              </Row>
            </Form>
            <div style="marginTop:10px;marginLeft:72px;" v-if="getPermission('wmsAmazonListing_query')">
              <Button type="primary" :disabled="SearchDisabled" icon="ios-search" @click="search" size="small">查询</Button>
              <Button style="marginLeft:10px;" @click="reset" size="small" v-once icon="md-refresh">重置</Button>
            </div>
          </div>
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
      <Button style="marginLeft:20px;" v-if="getPermission('wmsAmazonListing_sync')" type="primary"
        @click="syncOnlineProduct">同步在线商品</Button>
      <Button type="primary" class="ml10" @click="openInportModal" icon="md-archive"
        :disabled="!getPermission('wmsAmazonListing_skuRelatedImport')">导入</Button>
    </div>
    <div class="orderTable normalTop">
      <Table highlight-row border :height="tableHeight" :loading="TableLoading" :columns="amazomColumn"
        :data="amazonData"></Table>
      <div class="table-page flexBox">
        <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
          :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray">
        </Page>
      </div>
    </div>
    <!-- 关联sku -->
    <div v-if="addProductModal">
      <Modal class="addProductModal" v-model="addProductModal" title="关联LAPA SKU">
        <!--singleExclude单个排除-->
        <pdtProcessDtlAddPdt :from="bool" :sltOneOrMore="sltOneOrMore" showDataStatus="onlineProduct"
          @selectOver="selectOver"></pdtProcessDtlAddPdt>
      </Modal>
    </div>
    <importTemp @getList="search" ref="importTemp" :actionUrl="importUrl" :loadTemplateLocalApi="loadTemplateApi"
      :files="'files'"></importTemp>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import pdtProcessDtlAddPdt from '../wms-inStock/pdtProcessDtlAddPdt';
import importTemp from '@/components/common/importTemp';

export default {
  mixins: [Mixin],
  components: {
    pdtProcessDtlAddPdt,
    importTemp
  },
  data() {
    // let v = this;
    return {
      importUrl: api.import_wmsAmazonListing,
      loadTemplateApi: '/wms-service/template/amazonListing.xlsx',
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      pageParams: {
        skuType: '1',
        sku: null,
        relevanceType: null,
        pageNum: 1,
        pageSize: 10,
        orderBy: 'CT',
        upDown: 'up'
      },
      groupList: [// 下拉选择查询条件
        {
          label: 'SKU',
          value: '1'
        }, {
          label: 'MSKU',
          value: '2'
        }, {
          label: 'ASIN',
          value: '3'
        }
      ],
      cognateSku: [// 关联sku
        {
          label: '全部',
          value: 'null',
          checked: true
        }, {
          label: '已关联',
          value: '1',
          checked: false
        }, {
          label: '未关联',
          value: '2',
          checked: false
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
      totalPage: 0,
      total: 0,
      curPage: 1,
      amazonData: [],
      amazomColumn: [
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
          title: 'MSKU',
          key: 'sellerSku',
          align: 'center',
          minWidth: 200
        }, {
          title: '头程成本（CNY）',
          key: 'firstShippingFee',
          align: 'center',
          minWidth: 150
        }, {
          title: 'Title',
          key: 'title',
          align: 'center',
          minWidth: 150
        }, {
          title: 'SKU/' + '产品名称',
          key: 'goodsSku',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            let text = '';
            if (params.row.isDelete === 1) {
              text = h('div', {}, [
                h('span', {
                  style: {
                    textDecoration: 'line-through'
                  }
                }, params.row.goodsSku), h('span', {
                  style: {
                    color: 'red'
                  }
                }, '(已删除)')
              ]);
            } else {
              text = h('p', {}, params.row.goodsSku);
            }
            return h('div', [text, h('div', params.row.productName)]);
          }
        }, {
          title: '关联LAPA SKU',
          key: 'productGoodsId',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            let text = !params.row.productGoodsId ? '未关联' : '已关联';
            if (this.getPermission('wmsAmazonListing_update')) {
              return h('div', {
                style: {
                  color: '#008000',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                },
                on: {
                  click: () => {
                    this.bool = true;
                    this.sltOneOrMore = 'one';
                    this.addProductModal = true;
                    this.wmsAmazonListingId = params.row.wmsAmazonListingId;
                  }
                }
              }, text);
            } else {
              return h('span', text);
            }
          }
        }, {
          title: '售价',
          key: 'price',
          align: 'center',
          minWidth: 90
        }, {
          title: '可售数量',
          key: 'quantity',
          align: 'center',
          minWidth: 90
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
      wmsAmazonListingId: null,
      addProductModal: false,
      sltOneOrMore: 'one', // 单选or多选
      bool: true, // from 为真则查所有产品
      selectRow: [], // 关联选择的数据
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
    changeCognateStatus(val) {
      // 关联sku按钮切换
      let v = this;
      v.cognateSku.forEach((n, i) => {
        n.checked = n.value === val;
      });
      if (val === 'null') {
        v.pageParams.relevanceType = null;
      } else {
        v.pageParams.relevanceType = val;
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
    reset() {
      // 重置
      let v = this;
      v.pageParams.sku = null;
    },
    getList() {
      // 获取列表数据
      let v = this;
      if (!v.getPermission('wmsAmazonListing_query')) return;
      if (v.pageParams.upDown === 'up') {
        v.pageParams.orderSeq = 'ASC';
      } else {
        v.pageParams.orderSeq = 'DESC';
      }
      v.pageParams.warehouseId = v.wareId;
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(api.query_amazonList, v.pageParams).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            v.amazonData = data.list;
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
    selectOver(selectRow) {
      // 选择sku后执行的操作
      let v = this;
      let obj = {
        merchantId: selectRow.merchantId,
        productGoodsId: selectRow.productGoodsId,
        wmsAmazonListingId: v.wmsAmazonListingId,
        warehouseId: v.wareId
      };
      v.axios.post(api.update_amazonList, obj).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        }
      });
    },
    openInportModal() {
      this.$refs.importTemp.model1 = true;
    },
    syncOnlineProduct() {
      // 同步在线商品
      let v = this;
      v.axios.put(api.put_syncOnlineProduct + '?warehouesId=' + v.wareId).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
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

<style>
.addProductModal .ivu-modal {
  width: 1000px !important;
}
</style>
