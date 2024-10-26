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
            <Row type="flex" justify="space-between" :gutter="gutterItem" v-if="getPermission('wmsGcProductInfo_query')">
              <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" :offset="offsetCol">
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
        :sorType="{ DESC: 'desc', ASC: 'asc' }">
      </dyt-sortBySelect>
    </div>
    <div class="tableControl">
      <Button style="marginLeft:20px;" v-if="getPermission('wmsGcProductInfo_sync')" type="primary"
        @click="syncOnlineProduct">同步商品 </Button>
      <Button type="primary" class="ml10" @click="openInportModal" icon="md-archive"
        :disabled="!getPermission('wmsGcProductInfo_skuRelatedImport')">导入 </Button>
      <Dropdown @on-click="exportAllOrSlt" class="ml10" v-if="getPermission('wmsGcProductInfo_export')">
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
      <Modal class="addProductModal" v-model="addProductModal" title="关联SKU">
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
import pdtProcessDtlAddPdt from '../wms-inStock/pdtProcessDtlAddPdt.vue';
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
      importUrl: api.import_wmsBarnProductInfo,
      loadTemplateApi: '/wms-service/template/gcProductInfo.xlsx',
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      pageParams: {
        skuCodeList: [],
        relateFlag: null,
        pageNum: 1,
        pageSize: 10,
        orderSeq: 'asc',
        orderBy: 'CT',
        warehouseId: v.getWarehouseId()
      },
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
          sortType: "asc",
          default: true,
        },
        {
          sortHeader: "按更新时间",
          sortField: "GX",
          sortType: "asc",
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
          title: '产品编码',
          key: 'productSku',
          align: 'center'
        }, {
          title: '客户参考代码',
          key: 'referenceNo',
          align: 'center'
        }, {
          title: '产品状态',
          key: 'status',
          align: 'center',
          render: (h, params) => {
            let type = params.row.productStatus;
            let typeObj = {
              'X': '废弃', // 废弃
              'D': '草稿',
              'S': '可用',
              'W': '审核中', // 审核中
              'R': '审核不通过' // 审核不通过
            };
            return h('div', typeObj[type]);
          }
        }, {
          title: '商品中文名称',
          key: 'cnName',
          align: 'center'
        }, {
          title: 'LAPA SKU',
          key: 'goodsSku',
          align: 'center',
          render(h, params) {
            let text = '';
            if (params.row.isDelete === 1) {
              text = h('div', {}, [
                h('p', {
                  style: {
                    textDecoration: 'line-through'
                  }
                }, params.row.goodsSku), h('p', {
                  style: {
                    color: 'red'
                  }
                }, '(已删除)')
              ]);
            } else {
              text = h('p', {}, params.row.goodsSku);
            }
            return text;
          }
        }, {
          title: '商品英文名称',
          key: 'enName',
          align: 'center'
        }, {
          title: '头程成本（CNY）',
          key: 'firstShippingFee',
          align: 'center'
        }, {
          title: '长宽高(cm)',
          key: 'price',
          align: 'center',
          render(h, params) {
            return h('span', params.row.length + '*' + params.row.width + '*' + params.row.height);
          }
        }, {
          title: '重量(kg)',
          key: 'weight',
          align: 'center'
        }, {
          title: '是否含电池',
          key: 'contain',
          align: 'center',
          render: (h, params) => {
            let type = params.row.containBattery;
            let typeObj = {
              '0': '普货',
              '1': '含电池',
              '2': '纯电池',
              '3': '纺织品',
              '4': '易碎品'
            };
            return h('div', typeObj[type]);
          }
        }, {
          title: '关联LAPA SKU',
          align: 'center',
          render: (h, params) => {
            if (!v.getPermission('wmsGcProductInfo_related')) {
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
                  this.activeWmsWinitProductId = params.row.wmsGcProductId;
                  this.wmsAmazonListingId = params.row.wmsAmazonListingId;
                }
              }
            }, !params.row.productGoodsId ? '未关联' : '重新关联');
          }
        }
      ],
      wmsAmazonListingId: null,
      addProductModal: false,
      sltOneOrMore: 'one', // 单选or多选
      bool: true, // from 为真则查所有产品
      selectRow: [], // 关联选择的数据
      wareId: v.getWarehouseId(), // 仓库ID
      tableSltData: []
    };
  },
  methods: {
    // 关联sku按钮切换
    changeCognateStatus(val) {
      let v = this;
      v.cognateSku.forEach((n, i) => {
        n.checked = n.value === val;
      });
      if (val === 'null') {
        v.pageParams.relateFlag = null;
      } else {
        v.pageParams.relateFlag = val;
      }
    }, // 查询
    search() {
      this.curPage = 1;
      this.pageParams.pageNum = 1;
      this.$nextTick(() => {
        this.pageParamsStatus = true;
      })
    }, // 重置
    reset() {
      this.pageParams.skuCodeList = [];
    }, // 获取列表数据
    getList() {
      let v = this;
      if (!v.getPermission('wmsGcProductInfo_query')) {
        v.gotoError();
      }
      v.TableLoading = true;
      v.SearchDisabled = true;
      let pageParams = JSON.parse(JSON.stringify(v.pageParams));
      v.axios.post(api.get_barnProductList, pageParams).then(response => {
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
        wmsGcProductId: v.activeWmsWinitProductId,
        productGoodsId: selectRow.productGoodsId
      };
      v.axios.put(api.put_barnProductRelated, obj).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        }
      });
    }, // 同步在线商品
    syncOnlineProduct() {
      let v = this;
      v.axios.put(api.put_barnProductSync + '?warehouseId=' + v.wareId).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        }
      });
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
        obj.wmsGcProductIds = this.tableSltData.map(val => val.wmsGcProductId);
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
      this.axios.post(api.export_wmsBarnProduct, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
          this.pageParamsStatus = true;
        }
      });
    },
    openInportModal() {
      this.$refs.importTemp.model1 = true;
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

<style >
.addProductModal .ivu-modal {
  width: 1000px !important;
}
</style >
