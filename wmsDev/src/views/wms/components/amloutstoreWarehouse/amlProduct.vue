<template >
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="searchMain">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth" inline>
              <dyt-filter ref="dyt-filter">
                <Form-item label="艾姆勒 SKU：" prop="skuCodeList">
                  <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.skuCodeList"
                    placeholder="多个请用逗号或回车分隔" />
                </Form-item>
                <Form-item label="ERP SKU：" prop="laPaSkuList">
                  <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.laPaSkuList"
                    placeholder="多个请用逗号或回车分隔" />
                </Form-item>
                <Form-item label="商品状态：" prop="platformSkuStatusList">
                  <dyt-select v-model="pageParams.platformSkuStatusList" :multiple="true" :max-tag-count="1">
                    <Option v-for="d in Object.values(platformSkuStatusData)" :value="d.value" :key="d.value">{{ d.label
                    }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="关联SKU：" prop="relateFlag">
                  <dyt-select v-model="pageParams.relateFlag">
                    <Option v-for="item in cognateSku" :value="item.value" :key="item.value" :label="item.label" />
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
          <Button style="margin-left:20px;" v-if="permission.sync" type="primary" @click="syncOnlineProduct">同步商品</Button>
          <Button type="primary" class="ml10" @click="openInportModal" icon="md-archive" :disabled="!permission.import">导入关联</Button>
          <Dropdown @on-click="disassociate" class="ml10" v-if="permission.cancel">
            <Button type="primary" :loading="cancelLoading">
              <span>取消关联</span>
              <Icon type="md-arrow-dropdown"></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem :name="1" :disabled="!tableSltData.length">取消选中数据</DropdownItem>
              <DropdownItem :name="2">取消所有结果集</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Dropdown @on-click="exportAllOrSlt" class="ml10" v-if="permission.export">
            <Button type="primary">
              <span class="icon iconfont" style="font-size: 12px">&#xe639;</span> 导出
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
          :data="tableData" @on-selection-change="tableSelectionChange" />
      </div>
    </div>
    <div class="pagesMain">
      <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
        :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray" />
    </div>
    <!-- 关联sku -->
    <div v-if="addProductModal">
      <Modal class="addProductModal" v-model="addProductModal" title="关联SKU">
        <!--singleExclude单个排除-->
        <pdtProcessDtlAddPdt :from="bool" :sltOneOrMore="sltOneOrMore" showDataStatus="onlineProduct"
          @selectOver="selectOver" />
      </Modal>
    </div>
    <importTemp
      @getList="search"
      ref="importTemp"
      :actionUrl="importUrl"
      :loadTemplateLocalApi="loadTemplateApi"
      :files="'files'"
      @affirmImport="affirmImport"
    />
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
    return {
      importUrl: `${api.amlSkuRelatedImport}?warehouseId=${this.getWarehouseId()}`,
      loadTemplateApi: '/wms-service/template/thirdstoreProductInfo.xlsx',
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      pageParams: {
        skuCodeList: [], // SKU
        laPaSkuList: [], // ERP Sku
        relateFlag: null, // 是否关联SKU
        pageNum: 1,
        pageSize: 10,
        orderBy: 'CT',
        upDown: 'up',
        warehouseId: this.getWarehouseId(),
        platformSkuStatusList: [] // 商品状态
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
      tableData: [],
      activeWmsProductId: '',
      amazomColumn: [
        {
          type: 'selection',
          width: 50,
          align: 'center'
        },
        {
          title: '图片',
          key: 'imageUrl',
          align: 'center',
          width: 70,
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
          title: '艾姆勒 SKU',
          key: 'skuCode',
          align: 'center'
        },
        {
          title: 'ERP SKU',
          key: 'erpSku',
          align: 'center'
        },
        {
          title: '商品状态',
          key: 'status',
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.status)) return h('div', '');
            const statusInfo = this.platformSkuStatusData[row.status];
            if (this.$common.isEmpty(statusInfo)) return h('div', row.status);
            return h('div', statusInfo.label);
          }
        },
        {
          title: '艾姆勒中文名称',
          key: 'cnName',
          align: 'center',
          render: (h, { row }) => {
            return h('div', {
              style: {
                margin: '0 auto',
                'text-align': 'left'
              }
            }, row.cnName);
          }
        },
        {
          title: 'ERP 中文名称',
          key: 'erpName',
          align: 'center'
        }, {
          title: '中文报关名',
          key: 'declaredCnName',
          align: 'center',
        },
        {
          title: '英文报关名',
          key: 'declaredEnName',
          align: 'center'
        },
        {
          title: '海关编码',
          key: 'hsCode',
          align: 'center'
        },
        {
          title: '商品重量（kg）',
          key: 'weight',
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
          title: '关联LAPA SKU',
          align: 'center',
          render: (h, params) => {
            if (!this.permission.reassociation) {
              return h('span', '');
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
                  this.activeWmsProductId = params.row.wmsAosProductId;
                }
              }
            }, !params.row.productGoodsId ? '未关联' : '重新关联');
          }
        },
        {
          title: '更新时间',
          key: 'updatedTime',
          align: 'center',
          width: 130,
        }
      ],
      addProductModal: false,
      sltOneOrMore: 'one', // 单选or多选
      bool: true, // from 为真则查所有产品
      selectRow: [], // 关联选择的数据
      wareId: this.getWarehouseId(), // 仓库ID
      tableSltData: [],
      platformSkuStatusData: {
        X: { value: 'X', label: '废弃' },
        D: { value: 'D', label: '草稿' },
        S: { value: 'S', label: '可用' },
        P: { value: 'P', label: '审核中' },
        R: { value: 'R', label: '审核不通过' },
      },
      cancelLoading: false, // 取消loading
    };
  },
  methods: {
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
      this.$refs.pageParams && this.$refs.pageParams.resetFields();
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
      this.TableLoading = true;
      this.SearchDisabled = true;
      let pageParams = this.getPageParams();
      this.axios.post(api.amlQuery, pageParams).then(response => {
        this.TableLoading = false;
        this.SearchDisabled = false;
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            this.tableData = data.list ? data.list : [];
            this.$nextTick(() => {
              this.total = Number(data.total);
              this.totalPage = Number(data.pages);
            });
          }
        }
      }).catch(() => {
        this.TableLoading = false;
        this.SearchDisabled = false;
      })
      this.tableSltData = []
    },
    // 确认导入
    affirmImport() {
      this.axios.post(api.amlSkuRelatedImport, {}).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.pageParamsStatus = true;
        } else {
          this.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    // 关联
    selectOver(selectRow) {
      // 选择sku后执行的操作
      const obj = {
        wmsAosProductId: this.activeWmsProductId,
        productGoodsId: selectRow.productGoodsId,
        // warehouseId: this.getWarehouseId()
      };
      this.axios.post(api.amlRelatedSku, obj).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.pageParamsStatus = true;
        } else {
          this.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    // 同步在线商品
    syncOnlineProduct() {
      this.axios.get(`${api.amlSync}?warehouseId=${this.wareId}`).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.pageParamsStatus = true;
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
    },
    // 导出
    exportAllOrSlt(name) {
      let obj = this.getPageParams();
      delete obj.pageNum;
      delete obj.pageSize;
      if (name === '0') {
        // 选中
        if (this.tableSltData.length === 0) {
          this.$Message.warning('请选择导出数据');
          return;
        }
        obj.wmsOutstoreProductIdList = this.tableSltData.map(val => val.wmsAosProductId);
      } else {
        // 所有
        if (this.tableData.length === 0) {
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
      this.axios.post(api.amlExport, obj).then(res => {
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
      let obj = {};
      if (name === 1) {
        obj.wmsOutstoreProductIdList = this.tableSltData.map(val => val.wmsAosProductId);
      } else {
        if (this.tableData.length === 0) {
          this.$Message.warning({
            content: '无数据取消关联',
            duration: 5
          });
          return;
        }
        obj = this.getPageParams();
        delete obj.orderSeq;
        delete obj.pageNum;
        delete obj.pageSize;
        delete obj.orderBy;
      }
      this.axios.post(api.amlCancelRelate, obj).then(response => {
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
      if (n) {
        this.getList();
        this.pageParamsStatus = false;
      }
    }
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(300);
    },
    permission() {
      return {
        // 同步商品
        sync: this.getPermission('wmsOutstoreProductInfo_sync'),
        // 导入SKU关联
        import: this.getPermission('wmsOutstoreProductInfo_skuRelatedImport'),
        // 取消关联sku
        cancel: this.getPermission('wmsOutstoreProductInfo_cancel_related'),
        // 导出
        export: this.getPermission('wmsOutstoreProductInfo_export'),
        // 关联sku
        reassociation: this.getPermission('wmsOutstoreProductInfo_related'),
        // 商品列表
        inquire: this.getPermission('wmsOutstoreProductInfo_query'),
      }
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
