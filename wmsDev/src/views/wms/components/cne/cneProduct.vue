<template >
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="searchMain">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth" inline>
              <dyt-filter ref="dyt-filter">
                <Form-item label="CNE SKU：">
                  <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.goodsSkuList"
                    placeholder="多个请用逗号或回车分隔" />
                </Form-item>
                <Form-item label="ERP SKU：">
                  <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.erpSkuList"
                    placeholder="多个请用逗号或回车分隔" />
                </Form-item>
                <Form-item label="商品状态：" prop="serviceStatus">
                  <dyt-select v-model="pageParams.serviceStatus">
                    <!-- <Option :value="999">全部</Option> -->
                    <Option v-for="d in serviceStatusList" :value="d.value" :key="d.value + 'p'">{{ d.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="关联SKU：">
                  <dyt-select v-model="pageParams.correlationSku">
                    <Option v-for="item in cognateSku" :value="item.value" :key="item.value" :label="item.label">
                    </Option>
                  </dyt-select>
                </Form-item>
                <div slot="operation">
                  <Button type="primary" @click="search" :disabled="SearchDisabled" icon="ios-search" size="default">查询
                  </Button>
                  <Button @click="reset" v-once icon="md-refresh" size="default" style="margin-left: 8px;">重置 </Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>
    <div class="funMain" style="margin:10px;padding:0">
      <div class="funMain__flex">
        <div class="tableControl">
          <Button style="marginLeft:20px;" v-if="getPermission('wmsGoods_synchronization')" type="primary"
            @click="syncOnlineProduct">同步商品 </Button>
          <Button type="primary" class="ml10" @click="openInportModal" icon="md-archive"
            :disabled="!getPermission('wmsGoods_import')">导入关联 </Button>
          <Dropdown @on-click="disassociate" class="ml10" v-if="getPermission('wmsGoods_cancel')">
            <Button type="primary" :loading="cancelLoading">
              <span>取消关联</span>
              <Icon type="md-arrow-dropdown"></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem :name="1" :disabled="!tableSltData.length">取消选中数据</DropdownItem>
              <DropdownItem :name="2">取消所有结果集</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Dropdown @on-click="exportAllOrSlt" class="ml10" v-if="getPermission('wmsGoods_export')">
            <Button type="primary"><span class="icon iconfont" style="font-size: 12px">&#xe639;</span> 导出
              <Icon type="md-arrow-dropdown"></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem name="0" :disabled="!tableSltData.length">导出选中数据</DropdownItem>
              <DropdownItem name="1">导出所有结果集</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div class="dataSort">
          <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch"
            :sorType="{ DESC: 'down', ASC: 'up' }">
          </dyt-sortBySelect>
        </div>
      </div>
    </div>
    <div class="tableMain">
      <div class="tableBox">
        <Table highlight-row border :height="tableHeight" :loading="TableLoading" :columns="amazomColumn"
          :data="amazonData" @on-selection-change="tableSelectionChange"></Table>
      </div>
    </div>
    <div class="pagesMain">
      <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
        :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray">
      </Page>
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
      importUrl: `${api.import_wmsCneProductInfo}?warehouseId=${v.getWarehouseId()}`,
      loadTemplateApi: '/wms-service/template/importAssociation.xlsx',
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      pageParams: {
        goodsSkuList: [], // CNE SKU
        erpSkuList: [], // ERP Sku
        correlationSku: null, // 是否关联SKU
        pageNum: 1,
        pageSize: 10,
        orderBy: 'CT',
        upDown: 'up',
        warehouseId: v.getWarehouseId(),
        serviceStatus: '' // 商品状态
      },
      cognateSku: [// 关联sku  这里value 后端定义和其他已关联未关联不一样
        // {
        //   label: '全部',
        //   value: 'null',
        //   checked: true
        // },
        {
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
          sortField: "UT",
          sortType: "up",
        },
      ],
      totalPage: 0,
      total: 0,
      curPage: 1,
      amazonData: [],
      activeWmsCneProductId: '',
      amazomColumn: [
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
          title: 'ERP SKU',
          key: 'erpSku',
          align: 'center',
          render(h, params) {
            let isDel = params.row.isDelete === 1;
            return h('div', {
              style: {
                padding: '10px'
              }
            }, [
              h('p', {
                style: {
                  textDecoration: (() => {
                    return isDel
                      ? 'line-through'
                      : '';
                  })()
                }
              }, params.row.erpSku), !isDel || h('p', { style: { color: 'red' } }, '(已删除)')
            ]);
          }
        }, {
          title: '产品分类',
          key: 'categoryName',
          align: 'center'
        }, {
          title: '商品状态',
          key: 'serviceStatus',
          align: 'center',
          render: (h, params) => {
            let type = params.row.serviceStatus;
            let typeObj = {
              'UNAVAILABLE': '停售',
              "AVAILABLE": '在售',
            };
            return h('div', typeObj[type]);
          }
        }, {
          title: 'CNE 中文名称',
          key: 'goodsName',
          align: 'center'
        }, {
          title: 'ERP 中文名称',
          key: 'erpName',
          align: 'center'
        }, {
          title: '中文报关名',
          key: 'declaredName',
          align: 'center',
        }, {
          title: '英文报关名',
          key: 'declaredNameEn',
          align: 'center'
        }, {
          title: '海关编码',
          key: 'hscode',
          align: 'center'
        }, {
          title: '商品重量（kg）',
          key: 'weight',
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
          title: '关联LAPA SKU',
          align: 'center',
          render: (h, params) => {
            if (!v.getPermission('wmsGoods_reassociation')) {
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
                  this.activeWmsCneProductId = params.row.wmsCneProductId;
                  this.wmsAmazonListingId = params.row.wmsCneProductId;
                }
              }
            }, !params.row.productGoodsId ? '未关联' : '重新关联');
          }
        }, {
          title: '更新时间',
          key: 'updatedTime',
          align: 'center'
        }
      ],
      wmsAmazonListingId: null,
      addProductModal: false,
      sltOneOrMore: 'one', // 单选or多选
      bool: true, // from 为真则查所有产品
      selectRow: [], // 关联选择的数据
      wareId: v.getWarehouseId(), // 仓库ID
      tableSltData: [],
      serviceStatusList: [
        { value: 0, label: '停售' },
        { value: 1, label: '在售' },
      ],
      cancelLoading: false, // 取消loading
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
        v.pageParams.correlationSku = null;
      } else {
        v.pageParams.correlationSku = val;
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
      this.pageParams.goodsSkuList = [];
      this.pageParams.erpSkuList = [];
      this.pageParams.correlationSku = null;
      this.pageParams.serviceStatus = null
    }, // 获取列表数据
    getList() {
      let v = this;
      if (!v.getPermission('wmsGoods_inquire')) {
        // v.gotoError();
        return this.$Message.error('没有权限')
      }
      v.TableLoading = true;
      v.SearchDisabled = true;
      let pageParams = JSON.parse(JSON.stringify(v.pageParams));
      v.axios.post(api.get_cneProductList, pageParams).then(response => {
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
      v.tableSltData = []
    },
    selectOver(selectRow) {
      // 选择sku后执行的操作
      let v = this;
      let obj = {
        wmsCneProductId: v.activeWmsCneProductId,
        productGoodsId: selectRow.productGoodsId,
        warehouseId: v.getWarehouseId()
      };
      v.axios.put(api.put_cneProductRelated, obj).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        } else {
          this.$Message.error('操作失败，请重新尝试');
        }
      });
    }, // 同步在线商品
    syncOnlineProduct() {
      this.axios.post(`${api.syncCneProduct}?warehouseId=${this.wareId}`).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.pageParamsStatus = true;
        } else {
          this.$Message.error('操作失败，请重新尝试');
        }
      });
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
      if (name === '0') {
        // 选中
        if (this.tableSltData.length === 0) {
          this.$Message.warning('请选择导出数据');
          return;
        }
        obj.wmsCneProductIdList = this.tableSltData.map(val => val.wmsCneProductId);
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
      this.axios.post(api.exportInventoryProduct, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
          this.pageParamsStatus = true;
        } else {
          this.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    openInportModal() {
      this.$refs.importTemp.model1 = true;
    },
    // 取消关联
    disassociate(name) {
      let obj = JSON.parse(JSON.stringify(this.pageParams));
      if (name === 1) {
        obj.wmsCneProductIdList = this.tableSltData.map(val => val.wmsCneProductId);
      } else {
        if (this.amazonData.length === 0) {
          this.$Message.warning({
            content: '无数据取消关联',
            duration: 5
          });
          return;
        }
      }
      this.axios.delete(api.cnecancelRelate, { data: obj }).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.pageParamsStatus = true;
        } else {
          this.$Message.error('操作失败，请重新尝试');
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
      return this.getTableHeight(300);
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
</style >
