<template>
  <div class="productPage">
    <div class="listPage">
      <!--搜索-->
      <div class="searchMain">
        <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
          <dyt-filter ref="dyt-filter" @expand="expand">
            <Form-item label="云仓SPU：" prop="spuList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.spuList" placeholder="多个查询请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="云仓SKU：" prop="skuCodeList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.skuCodeList"
                placeholder="多个查询请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="LAPA SKU：" prop="laPaSkuList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.laPaSkuList"
                placeholder="多个查询请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="产品状态：" prop="skuStatusList">
              <dyt-select v-model="pageParams.skuStatusList" :multiple="true" :max-tag-count="1">
                <Option v-for="item in productStatus" :value="item.value" :key="item.value" :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="关联SKU：" prop="relateFlag">
              <dyt-select v-model="pageParams.relateFlag">
                <Option v-for="item in cognateSku" :value="item.value" :key="item.value" :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="更新时间：">
              <Date-picker type="datetimerange" style="width: 100%" @on-change="getPayDateValue" transfer
                format="yyyy-MM-dd HH:mm:ss" placement="bottom-end" placeholder="请选择"
                :value="[pageParams.startUpdatedTime, pageParams.endUpdatedTime]"></Date-picker>
            </Form-item>
            <Form-item label="云仓商户编号：" prop="ymsMerchantIdList" v-if="isYmsStockout">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.ymsMerchantIdList"
                placeholder="多个查询请用逗号或回车分隔" />
            </Form-item>
            <div slot="operation">
              <div v-if="getPermission('wmsOutstoreProductInfo_query')">
                <Button type="primary" @click="search" :disabled="SearchDisabled" icon="ios-search">查询
                </Button>
                <Button @click="reset" v-once icon="md-refresh" style="margin-left: 8px;">重置 </Button>
              </div>
            </div>
          </dyt-filter>
        </Form>
      </div>
      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <Button v-if="getPermission('wmsOutstoreProductInfo_sync')" type="primary" @click="syncOnlineProduct">
              同步商品
            </Button>
            <Button type="primary" class="ml10" @click="openInportModal" icon="md-archive"
              :disabled="!getPermission('wmsOutstoreProductInfo_skuRelatedImport')">导入 </Button>

            <Dropdown @on-click="disassociate" class="ml10" v-if="getPermission('wmsOutstoreProductInfo_cancelRelate')">
              <Button type="primary" :loading="cancelLoading">
                <span>取消关联</span>
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem :name="1" :disabled="!tableSltData.length">取消选中数据</DropdownItem>
                <DropdownItem :name="2">取消所有结果集</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Dropdown @on-click="exportAllOrSlt" class="ml10" v-if="getPermission('wmsOutstoreProductInfo_export')">
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
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch"
              :sorType="{ DESC: 'down', ASC: 'up' }">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>
      <!--表格-->
      <div class="tableMain">
        <div class="tableBox">
          <Table highlight-row border :height="tableHeight" :loading="TableLoading" :columns="amazomColumn"
            :data="amazonData" @on-selection-change="tableSelectionChange"></Table>
        </div>
      </div>
      <!--分页-->
      <div class="pagesMain">
        <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
          :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray">
        </Page>
      </div>
    </div>

    <!-- 关联sku -->
    <div v-if="addProductModal">
      <Modal class="addProductModal" v-model="addProductModal" title="关联LAPA SKU">
        <!--singleExclude单个排除-->
        <pdtProcessDtlAddPdt showDataStatus="onlineProduct" :from="bool" :sltOneOrMore="sltOneOrMore"
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
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';
export default {
  mixins: [Mixin, tableHeight_mixin],
  components: {
    pdtProcessDtlAddPdt,
    importTemp
  },
  data() {
    let v = this;
    return {
      relatedObj: {
        'firstShippingFee': 0,
        'firstShippingFeeCurrency': null,
        'wmsOutstoreProductId': null
      },
      importUrl: api.import_wmsCloudProductInfo,
      loadTemplateApi: '/wms-service/template/gcProductInfo.xlsx',
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      pageParams: {
        spuList: [],
        skuCodeList: [],
        laPaSkuList: [],
        skuStatusList: [],
        ymsMerchantIdList: [],
        relateFlag: null,
        pageNum: 1,
        pageSize: 10,
        orderSeq: 'DESC',
        orderBy: 'CT',
        warehouseId: v.getWarehouseId(),
        startUpdatedTime: '',
        endUpdatedTime: '',
      },
      cognateSku: [// 关联sku  这里value 后端定义和其他已关联未关联不一样
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
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "按更新时间",
          sortField: "GX",
          sortType: "DESC",
        },
      ],
      totalPage: 0,
      total: 0,
      curPage: 1,
      amazonData: [],
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
          title: '云仓商户编号',
          key: 'ymsMerchantId',
          align: 'center'
        }, {
          title: '云仓SPU',
          key: 'ymsSpu',
          align: 'center'
        }, {
          title: '云仓SKU',
          key: 'skuCode',
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
          title: '产品状态',
          key: 'status',
          align: 'center',
          width: 90,
          render: (h, params) => {
            // let type = params.row.productStatus;
            // let typeObj = {
            //   'X': '废弃', // 废弃
            //   'D': '草稿',
            //   'S': '可用',
            //   'W': '审核中', // 审核中
            //   'R': '审核不通过' // 审核不通过
            // };
            // return h('div', typeObj[type]);
            let skuStatus = params.row.skuStatus;
            let item = v.productStatus[skuStatus] || {};
            return h('div', item.label || '');
          }
        }, {
          title: '云仓中文品名',
          key: 'yuncang_cnName',
          align: 'center',
          render(h, params) {
            let cnName = params.row.cnName;
            let specification = params.row.specification;
            return h('div', [
              cnName ? h('div', cnName) : '', specification ? h('div', {
                style: {
                  color: '#2D8CF0'
                }
              }, specification) : ''
            ]);
          }
        }, {
          title: '云仓英文品名',
          key: 'enName',
          align: 'center'
        }, {
          title: 'LAPA中文品名',
          key: 'tongtu_name',
          align: 'center',
          render(h, params) {
            let goodsCnDesc = params.row.goodsCnDesc;
            let goodsAttributes = params.row.goodsAttributes;
            return h('div', [
              goodsCnDesc ? h('div', goodsCnDesc) : '', goodsAttributes ? h('div', {
                style: {
                  color: '#2D8CF0'
                }
              }, goodsAttributes) : ''
            ]);
          }
        }, {
          title: 'LAPA英文品名',
          key: 'goodsEnDesc',
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
          align: 'center',
        }, {
          title: '是否含电池', // 是否含电池
          key: 'includeBattery',
          align: 'center',
          render(h, params) {
            let text = '';
            let includeBattery = params.row.includeBattery;
            text = includeBattery === 'Y' ? '带电' : '不带电';
            return h('span', text);
          }
        }, {
          title: '关联LAPA SKU',
          align: 'center',
          render: (h, params) => {
            if (!v.getPermission('wmsOutstoreProductInfo_related')) {
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
                  this.relatedObj.firstShippingFee = params.row.firstShippingFee;
                  this.relatedObj.firstShippingFeeCurrency = params.row.firstShippingFeeCurrency;
                  this.relatedObj.wmsOutstoreProductId = params.row.wmsOutstoreProductId;
                }
              }
            }, !params.row.productGoodsId ? '未关联' : '重新关联');
          }
        }, {
          title: '更新时间',
          key: 'updatedTime',
          align: 'center',
          width: 100,
          render: (h, params) => {
            if (params.row.updatedTime) {
              return h('div', this.$uDate.dealTime(params.row.updatedTime));
            }
          }
        }
      ],
      addProductModal: false,
      sltOneOrMore: 'one', // 单选or多选
      bool: true, // from 为真则查所有产品
      selectRow: [], // 关联选择的数据
      wareId: this.getWarehouseId(), // 仓库ID
      tableSltData: [],
      productStatus: {
        0: { label: '暂存', value: 0 },
        1: { label: '在售', value: 1 },
        2: { label: '停售', value: 2 },
      },
      cancelLoading: false, // 取消loading
      warehouseList: {},
      transWarehouse: ['YMS云仓'],
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
  computed: {
    warehouseId() {
      return this.$store.state.warehouseId || v.getWarehouseId();
    },
    isYmsStockout() {
      let wareInfo = this.warehouseList[this.warehouseId] || {};
      return this.transWarehouse.includes(wareInfo.warehouseName);
    },
  },
  created() {
    this.getList();
    this.getWarehouseList();
  },
  methods: {
    // 获取仓库列表
    getWarehouseList() {
      this.$store.dispatch('getWarehouseList').then(list => {
        this.warehouseList = this.$common.arrayToObj(list || [], 'warehouseId');
      })
    },
    // 查询
    search() {
      this.curPage = 1;
      this.pageParams.pageNum = 1;
      this.$nextTick(() => {
        this.pageParamsStatus = true;
      })
    },
    // 重置
    reset() {
      this.$refs['pageParams'].resetFields();
      this.getPayDateValue(['', '']);// 重置时间
    },
    // 获取列表数据
    getList() {
      let v = this;
      if (!v.getPermission('wmsOutstoreProductInfo_query')) {
        v.gotoError();
      }
      v.TableLoading = true;
      v.SearchDisabled = true;
      let pageParams = JSON.parse(JSON.stringify(v.pageParams));
      v.axios.post(api.get_cloudProductList, pageParams).then(response => {
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
      let obj = {
        ...v.relatedObj,
        productGoodsId: selectRow.productGoodsId
      };
      v.axios.put(api.put_cloudProductRelated, obj).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        }
      });
    },
    // 同步在线商品
    syncOnlineProduct() {
      let v = this;
      v.axios.put(api.put_cloudProductSync + '?warehouesId=' + v.wareId).then(response => {
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
        obj.wmsOutstoreProductIds = this.tableSltData.map(val => val.wmsOutstoreProductId);
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
      this.axios.post(api.export_wmsOutstoreProductInfoExport, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
          this.pageParamsStatus = true;
        }
      });
    },
    openInportModal() {
      this.$refs.importTemp.model1 = true;
    },
    // 取消关联
    async disassociate(e) {
      if (this.cancelLoading) return this.$Message.warning('正在操作，请稍等~');

      let [temp, total] = [{}, 0];
      if (e == 1) {
        let list = (this.tableSltData || []).filter(k => k.productGoodsId);// 过滤出有关联的商品
        temp.wmsOutstoreProductIdList = list.map(k => k.wmsOutstoreProductId);
        total = list.length;
      } else {
        temp = this.$common.copy(this.pageParams);
        let arr = ['pageNum', 'pageSize', 'orderSeq', 'orderBy'];
        arr.forEach(k => {
          delete temp[k];
        })
        total = await this.getDisassociateNum(temp);
      }
      if (!total) return this.$Message.error('不存在已关联的商品~');
      this.$Modal.confirm({
        title: '确认是否批量取消关联？',
        content: `<div>此次修改涉及SKU个数： <span style="color:red;">${total}</span></div>`,
        loading: true,
        onOk: () => {
          // console.log(temp);
          this.axios.put(api.ymscancelRelate, temp).then(response => {
            if (response.data.code !== 0) return;
            this.$Message.success('操作成功~');
            this.getList();
          }).finally(() => {
            this.$Modal.remove();
          })
        },
        onCancel: () => { }
      });
    },
    // 请求已关联的sku数量
    getDisassociateNum(temp) {
      return new Promise((resolve, reject) => {
        let data = this.$common.copy(temp);
        data.relateFlag = 1;// 请求已关联的sku
        this.cancelLoading = true;
        return this.axios.post(api.ymsCancelRelateShowCount, data).then(response => {
          if (response.data.code !== 0) resolve(0);
          resolve(response.data.datas);
        }).catch(() => {
          resolve(0);
        }).finally(() => {
          this.cancelLoading = false;
        })
      })
    },
    getPayDateValue(value) {
      this.pageParams.startUpdatedTime = value[0];
      this.pageParams.endUpdatedTime = value[1];
    },
  },
}
</script>

<style>
.productPage {
  height: 100%;
}

.addProductModal .ivu-modal {
  width: 1000px !important;
}
</style >
