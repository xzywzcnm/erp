<template >
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="searchMain">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth" inline>
              <dyt-filter ref="dyt-filter">
                <Form-item label="睿邑达SKU：" prop="rinidCodeList">
                  <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.rinidCodeList"
                    placeholder="多个请用逗号或回车分隔" />
                </Form-item>
                <Form-item label="ERP SKU：" prop="erpSkuList">
                  <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.erpSkuList"
                    placeholder="多个请用逗号或回车分隔" />
                </Form-item>
                <Form-item label="商品状态：" prop="statusList">
                  <dyt-select v-model="pageParams.statusList" :multiple="true" :max-tag-count="1">
                    <Option v-for="d in serviceStatusList" :value="d.value" :key="d.value + 'p'">{{ d.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="关联SKU：" prop="relateStatus">
                  <dyt-select v-model="pageParams.relateStatus">
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
        :current="pageParams.pageNum" show-sizer @on-page-size-change="changePageSize" placement="top"
        :page-size-opts="pageArray"></Page>
    </div>
    <!-- 关联sku -->
    <div v-if="addProductModal">
      <Modal class="addProductModal" v-model="addProductModal" title="关联SKU">
        <!--singleExclude单个排除-->
        <pdtProcessDtlAddPdt :from="bool" :sltOneOrMore="sltOneOrMore" showDataStatus="onlineProduct"
          @selectOver="selectOver" />
      </Modal>
    </div>
    <importTemp @getList="search" ref="importTemp" :actionUrl="importUrl" :loadTemplateLocalApi="loadTemplateApi"
      :files="'files'" />
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
    const warehouseId = this.getWarehouseId();
    return {
      importUrl: `${api.rinid_skuRelatedImport}?warehouseId=${warehouseId}`,
      loadTemplateApi: '/wms-service/template/rinidImport.xlsx', // 导入模板下载
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      pageParams: {
        rinidCodeList: [], // SKU
        erpSkuList: [], // ERP Sku
        relateStatus: null, // 是否关联SKU
        pageNum: 1,
        pageSize: 10,
        orderBy: 'CT',
        upDown: 'up',
        warehouseId: warehouseId,
        statusList: [] // 商品状态
      },
      // 关联sku  这里value 后端定义和其他已关联未关联不一样
      cognateSku: [
        {
          label: '未关联',
          value: 0,
          checked: false
        }, {
          label: '已关联',
          value: 1,
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
      amazonData: [],
      activeRinidProductId: '',
      amazomColumn: [
        {
          type: 'selection',
          width: 45,
          align: 'center'
        },
        {
          title: '图片',
          key: 'imageUrl',
          align: 'center',
          width: 70,
          render: (h, params) => {
            if (this.$common.isEmpty(params.row.imageUrl)) return h('span', '');
            if (['http://'].includes(params.row.imageUrl.substring(0, 7)) || ['https://'].includes(params.row.imageUrl.substring(0, 8))) {
              return this.tableImg(h, params, 'imageUrl', params.row.imageUrl);
            }
            return this.tableImg(h, params, 'imageUrl');
          }
        },
        {
          title: '睿邑达SKU',
          key: 'rinidCode',
          minWidth: 110,
          align: 'center'
        },
        {
          title: 'ERP SKU',
          key: 'erpSku',
          align: 'center',
          minWidth: 110,
          render(h, { row }) {
            const isDel = row.isDelete == 1;
            let item = [h('div', {
              style: {
                textDecoration: isDel ? 'line-through' : ''
              }
            }, row.erpSku)];
            if (isDel) {
              item.push(h('div', { style: { color: 'red' } }, '(已删除)'));
            }
            return h('div', {}, item);
          }
        },
        {
          title: '商品状态',
          key: 'status',
          width: 90,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.status)) return h('div', '');
            const status = this.serviceStatusList.find(f => f.value == row.status);
            return h('div', status.label);
          }
        },
        {
          title: '中文名称',
          key: 'cnName',
          minWidth: 110,
          align: 'center'
        },
        {
          title: 'ERP 中文名称',
          key: 'erpCnName',
          minWidth: 110,
          align: 'center'
        },
        {
          title: '中文报关名',
          key: 'declaredCnName',
          minWidth: 110,
          align: 'center',
        }, {
          title: '英文报关名',
          key: 'declaredEnName',
          minWidth: 100,
          align: 'center'
        },
        {
          title: '海关编码',
          width: 90,
          key: 'hscode',
          align: 'center'
        },
        {
          title: '商品重量(g)',
          width: 90,
          key: 'weight',
          align: 'center'
        },
        {
          title: '长宽高(cm)',
          width: 90,
          key: 'width',
          align: 'center',
          render: (h, { row }) => {
            const rowItem = [row.length, row.width, row.height].filter(f => !this.$common.isEmpty(f)).join('*');
            return h('span', {}, rowItem);
          }
        },
        {
          title: '关联LAPA SKU',
          width: 95,
          align: 'center',
          render: (h, { row }) => {
            if (!this.getPermission('wmsGoods_reassociation')) {
              return h('span', this.$common.isEmpty(row.productGoodsId) ? '未关联' : '重新关联');
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
                  this.activeRinidProductId = row.rinidProductId;
                  this.wmsAmazonListingId = row.rinidProductId;
                }
              }
            }, this.$common.isEmpty(row.productGoodsId) ? '未关联' : '重新关联');
          }
        },
        {
          title: '更新时间',
          key: 'updatedTime',
          width: 135,
          align: 'center'
        }
      ],
      wmsAmazonListingId: null,
      addProductModal: false,
      sltOneOrMore: 'one', // 单选or多选
      bool: true, // from 为真则查所有产品
      selectRow: [], // 关联选择的数据
      wareId: warehouseId, // 仓库ID
      tableSltData: [],
      serviceStatusList: [
        { value: 1, label: '新建' },
        { value: 2, label: '待审核' },
        { value: 3, label: '可用' },
        { value: 4, label: '审核不通过' },
        { value: 5, label: '弃用' }
      ],
      cancelLoading: false, // 取消loading
    };
  },
  methods: {
    // 查询
    search() {
      this.pageParams.pageNum = 1;
      this.$nextTick(() => {
        this.pageParamsStatus = true;
      })
    },
    // 重置
    reset() {
      this.$refs.pageParams && this.$refs.pageParams.resetFields();
    },
    getParams() {
      let pParams = this.$common.copy(this.pageParams);
      if (!this.$common.isEmpty(pParams.relateStatus)) {
        pParams.relateStatus = pParams.relateStatus == 1;
      }
      return pParams;
    },
    // 获取列表数据
    getList() {
      if (!this.getPermission('wmsGoods_inquire')) {
        // this.gotoError();
        return this.$Message.error('没有权限')
      }
      this.TableLoading = true;
      this.SearchDisabled = true;
      this.axios.post(api.rinid_queryOrderList, this.getParams()).then(response => {
        this.TableLoading = false;
        this.SearchDisabled = false;
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            this.amazonData = data.list ? data.list : [];
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
    selectOver(selectRow) {
      // 选择sku后执行的操作
      let obj = {
        rinidProductId: this.activeRinidProductId,
        productGoodsId: selectRow.productGoodsId,
        warehouseId: this.wareId
      };
      this.axios.post(api.rinid_related, obj).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.pageParamsStatus = true;
        } else {
          this.$Message.error('操作失败，请重新尝试');
        }
      });
    }, // 同步在线商品
    syncOnlineProduct() {
      this.axios.get(`${api.rinid_synchronousGoods}?warehouseId=${this.wareId}`).then(response => {
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
      let obj = this.getParams();
      delete obj.pageNum;
      delete obj.pageSize;
      if (name === '0') {
        // 选中
        if (this.tableSltData.length === 0) {
          this.$Message.warning('请选择导出数据');
          return;
        }
        // obj.rinidProductIdList = this.tableSltData.map(val => val.rinidProductId);
        obj.wmsOutstoreProductIdList = this.tableSltData.map(val => val.rinidProductId);
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
      this.axios.post(api.rinid_export, obj).then(res => {
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
      let obj = this.getParams();
      delete obj.pageNum;
      delete obj.pageSize;
      if (name === 1) {
        obj.rinidProductIdList = this.tableSltData.map(val => val.rinidProductId);
      } else {
        if (this.amazonData.length === 0) {
          this.$Message.warning({
            content: '无数据取消关联',
            duration: 5
          });
          return;
        }
      }
      this.axios.post(api.rinid_disassociate, obj).then(response => {
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
