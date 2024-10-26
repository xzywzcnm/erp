<template >
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content">
          <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
            <Row type="flex" :gutter="gutterItem">
              <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol">
              <Form-item label="产品编码：">
                <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.skuCodeList"
                  placeholder="多个产品编码请用逗号或回车分隔" />
              </Form-item>
              </Col>
              <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol">
              <Form-item label="关联SKU：">
                <Button-group>
                  <Button v-for="d in cognateSku" :key="d.value" :type="d.checked ? 'primary' : 'default'"
                    @click="changeCognateStatus(d.value)">{{ d.label }} </Button>
                </Button-group>
              </Form-item>
              </Col>
            </Row>
            <Row type="flex" justify="space-between" :gutter="gutterItem">
              <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" :offset="offsetCol"
                v-if="getPermission('wmsWinitProductInfo_query')">
              <Button type="primary" @click="search" :disabled="SearchDisabled" icon="ios-search" size="small">查询
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
      <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch"
        :sorType="{ DESC: 'down', ASC: 'up' }">
      </dyt-sortBySelect>
    </div>
    <div class="tableControl">
      <Button style="marginLeft:20px;" v-if="getPermission('wmsWinitProductInfo_sync')" type="primary"
        @click="syncOnlineProduct">同步商品 </Button>
      <Button type="primary" class="ml10" @click="openInportModal" icon="md-archive"
        :disabled="!getPermission('wmsWinitProductInfo_skuRelatedImport')">导入 </Button>
      <Dropdown @on-click="exportAllOrSlt" class="ml10" v-if="getPermission('wmsWinitProductInfo_export')">
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
      <Table highlight-row border :height="tableHeight" :loading="TableLoading" :columns="amazomColumn" :data="amazonData"
        @on-selection-change="tableSelectionChange"></Table>
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

<script >
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
    let v = this;
    return {
      importUrl: api.import_wmsWinitProductInfo,
      loadTemplateApi: '/wms-service/template/winitProductInfo.xlsx',
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      tableSltData: [],
      pageParams: {
        skuCodeList: [],
        relateFlag: null,
        pageNum: 1,
        pageSize: 10,
        upDown: 'up',
        orderBy: 'CT',
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
      cognateSku: [// 关联sku  这里value 后端定义和其他已关联未关联不一样
        {
          label: '全部',
          value: 'null',
          checked: true
        }, {
          label: '未关联',
          value: '0',
          checked: false
        }, {
          label: '已关联',
          value: '1',
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
          sortHeader: "按更新时间",
          sortField: "GX",
          sortType: "up",
        },
      ],
      totalPage: 0,
      total: 0,
      curPage: 1,
      amazonData: [],
      activeWmsWinitProductId: '', // 关联wmsWinitProductId
      amazomColumn: [
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
          title: '商品编码',
          key: 'skuCode',
          align: 'center',
          minWidth: 200
        }, {
          title: '商品规格',
          key: 'specification',
          align: 'center',
          minWidth: 200
        }, {
          title: '商品条码',
          key: 'code',
          align: 'center',
          minWidth: 150
        }, {
          title: '商品中文名称',
          key: 'cnName',
          align: 'center',
          minWidth: 150
        }, {
          title: '商品英文名称',
          key: 'enName',
          align: 'center',
          minWidth: 150
        }, {
          title: '头程成本（CNY）',
          key: 'firstShippingFee',
          align: 'center',
          minWidth: 150
        }, {
          title: '长宽高(cm)',
          key: 'price',
          align: 'center',
          minWidth: 120,
          render(h, params) {
            return h('span', params.row.registerLength + '*' + params.row.registerWidth + '*' + params.row.registerHeight);
          }
        }, {
          title: '体积(立方米)',
          key: 'registerVolume',
          align: 'center',
          minWidth: 120
        }, {
          title: '重量(kg)',
          key: 'registerWeight',
          align: 'center',
          minWidth: 150
        }, {
          title: '商品描述',
          align: 'center',
          minWidth: 150,
          key: 'goodsCnDesc',
          render: (h, params) => {
            if (params.row.goodsCnDesc) {
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
              return h('div', {}, [text, h('p', {}, params.row.goodsCnDesc)]);
            }
          }
        }, {
          title: '关联LAPA SKU',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            if (!v.getPermission('wmsWinitProductInfo_related')) {
              return h('span');
            }
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
                  this.activeWmsWinitProductId = params.row.wmsWinitProductId;
                  this.wmsAmazonListingId = params.row.wmsAmazonListingId;
                }
              }
            }, !params.row.productGoodsId ? '未关联' : '重新关联');
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
        obj.wmsWinitProductIds = this.tableSltData.map(val => val.wmsWinitProductId);
        this.exportFn(obj);
      } else {
        // 所有
        if (this.amazonData.length === 0) {
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
      this.axios.post(api.export_wmsWinitProduct, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
        }
      });
    },
    openInportModal() {
      this.$refs.importTemp.model1 = true;
    },
    changeCognateStatus(val) {
      // 关联sku按钮切换
      let v = this;
      v.cognateSku.forEach((n, i) => {
        n.checked = n.value === val;
      });
      if (val === 'null') {
        v.pageParams.relateFlag = null;
      } else {
        v.pageParams.relateFlag = val;
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
    // 重置
    reset() {
      this.pageParams.skuCodeList = [];
    },
    getList() {
      // 获取列表数据
      let v = this;
      if (!v.getPermission('wmsWinitProductInfo_query')) {
        v.gotoError();
      }
      let pageParams = this.paramsFn();
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(api.get_winitProductList, pageParams).then(response => {
        v.TableLoading = false;
        v.SearchDisabled = false;
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            v.amazonData = data.list ? data.list : [];
            v.$nextTick(function () {
              v.total = Number(data.total);
              v.totalPage = Number(data.pages);
            });
          }
        }
      }).catch(() => {
        v.TableLoading = false;
        v.SearchDisabled = false;
      })
    },
    selectOver(selectRow) {
      // 选择sku后执行的操作
      let v = this;
      /* let obj = {
       merchantId: selectRow.merchantId,
       productGoodsId: selectRow.productGoodsId,
       wmsAmazonListingId: v.wmsAmazonListingId,
       warehouseId: v.wareId
       }; */
      let obj = {
        wmsWinitProductId: v.activeWmsWinitProductId,
        productGoodsId: selectRow.productGoodsId
      };
      v.axios.put(api.put_winitProductRelated, obj).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        }
      });
    },
    syncOnlineProduct() {
      // 同步在线商品
      let v = this;
      v.axios.put(api.put_winitProductSync + '?warehouesId=' + v.wareId).then(response => {
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
      // getPermission
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

<style >
.addProductModal .ivu-modal {
  width: 1000px !important;
}
</style >
