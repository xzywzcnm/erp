<template>
  <div class="inventoryLevels">
    <div class="listPage">
      <div class="searchMain">
        <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
          <dyt-filter ref="dyt-filter" @expand="expand">
            <Form-item label="SKU：" prop="searchSkuCode">
              <dyt-input-tag :limit="1" :string="true" placeholder="多个SKU，用逗号或换行分隔" type="textarea"
                v-model="pageParams.searchSkuCode" />
            </Form-item>
            <Form-item label="SPU：" prop="spuList">
              <dyt-input-tag :limit="1" :string="true" placeholder="多个SPU，用逗号或换行分隔" v-model="pageParams.spuList"
                type="textarea" />
            </Form-item>
            <Form-item label="查询维度：" size="large">
              <dyt-select v-model="pageParams.queryType" @on-change="queryDataStatus" :clearable="false">
                <Option v-for="d in queryDataFlagList" :value="d.value" :key="d.value" :label="d.label"></Option>
              </dyt-select>
            </Form-item>
            <!--只有按产品查询才展示-->
            <Form-item label="显示库存为0的数据" prop="isInventNumber" v-if="pageParams.queryStatusFlag === '1'">
              <i-switch v-model="pageParams.isInventNumber" :true-value="1" :false-value="0"></i-switch>
            </Form-item>
            <Form-item label="商品描述：" prop="searchGoodsDesc">
              <dyt-input placeholder="中文/英文描述" v-model.trim="pageParams.searchGoodsDesc" />
            </Form-item>
            <Form-item label="库区：" prop="searchWareBlock">
              <dyt-input-tag :limit="1" :string="true" type="textarea" placeholder="多个库区，用逗号或换行分隔"
                v-model="pageParams.searchWareBlock" :disabled="pageParams.queryStatusFlag === '1'" />
            </Form-item>
            <Form-item label="库位：" prop="searchWareLocation">
              <dyt-input-tag :limit="1" :string="true" type="textarea" placeholder="多个库位，用逗号或换行分隔"
                v-model="pageParams.searchWareLocation" :disabled="pageParams.queryStatusFlag === '1'" />
            </Form-item>
            <Form-item label="批次号：" prop="searchBatchNum">
              <dyt-input placeholder="输入批次号" v-model.trim="pageParams.searchBatchNum"
                v-if="pageParams.queryStatusFlag === '3'"> </dyt-input>
              <dyt-input placeholder="输入批次号" v-model.trim="pageParams.searchBatchNum" v-else disabled> </dyt-input>
            </Form-item>
            <!-- <Form-item label="货主">
                <dyt-select v-model="pageParams.cargoOwnerId">
                  <Option value="_NO_CARGO_OWNER">无货主</Option>
                  <template v-for="item in $store.state.userInfoList">
                    <template v-if="isCargoOwner(item.businessRoleTypeList)">
                      <Option :value="item.userId">{{item.userName}}</Option>
                    </template>
                  </template>
                </dyt-select>
              </Form-item> -->
            <Form-item label="sku商品状态：" prop="goodsStatus" v-if="pageParams.queryStatusFlag === '1'">
              <dyt-select v-model="pageParams.goodsStatus">
                <!-- <Option :value="999">全部</Option> -->
                <Option v-for="d in tabsData" :value="d.value" :key="d.value + 'p'">{{ d.label }}</Option>
              </dyt-select>
            </Form-item>
            <Form-item label="spu商品状态：" prop="spuStatus" v-if="pageParams.queryStatusFlag === '1'">
              <dyt-select v-model="pageParams.spuStatus">
                <Option v-for="d in productStatusSpu" :value="d.value" :key="d.value + 'p'">{{ d.label }}</Option>
              </dyt-select>
            </Form-item>
            <Form-item label="产品开发人员">
              <dyt-select v-model="pageParams.productDeveloperUserId" placeholder="请选择开发人员">
                <Option v-for="(item, oIndex) in personnelRoleTypeList" :value="item.userId" :key="`o-${oIndex}`">{{
                  item.userName }}</Option>
              </dyt-select>
            </Form-item>
            <Form-item label="商品分类">
              <erpTreeSelect v-model="treeSelectCategoryValue" :limit="1" :multiple="true" :normalizer="treeNormalizer"
                :options="selectTreeProductCategory" :default-expand-level="1" :appendToBody="true"
                placeholder="请选择" noResultsText="无匹配数据" @input="treeSelectCategoryChange" valueFormat="object" />
            </Form-item>
            <Form-item label="查询替代SKU库存" prop="isReplaceSKU" v-if="isFSwarehouse">
              <i-switch v-model="pageParams.isReplaceSKU" :true-value="1" :false-value="0"></i-switch>
            </Form-item>
            <div slot="operation">
              <Button type="primary" @click="inventorySearch" :disabled="SearchDisabled" icon="md-search">查询</Button>
              <Button style="margin-left: 10px;" @click="reset" v-once icon="md-refresh">重置 </Button>
            </div>
          </dyt-filter>
        </Form>
      </div>

      <!--按 SKU 或 按 仓库 排序-->
      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <Button @click="exportExcel('balance', '库存余量导出')" class="mr10"
              v-if="getPermission('wmsInventory_balanceExport')" type="primary">库存余量导出</Button>
            <Button @click="exportExcel" type="primary" class="mr10">导出Excel</Button>
            <Button @click="exportReplaceSku" type="primary"
              v-if="getPermission('wmsInventory_exportReplace') && isFSwarehouse">导出替代SKU库存余量</Button>
          </div>
          <div style="position:relative;">
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
            </dyt-sortBySelect>
            <filterColumns ref="filterColumns" :columns="filterColumns" :filterName="filterName"
              @setTableColumns="setTableColumns"></filterColumns>
          </div>
        </div>
      </div>

      <div class="tableMain" style="margin-top:4px;">
        <!-- 仅按产品查询 -->
        <div class="tableBox" v-if="pageParams.queryStatusFlag == '1'">
          <Table highlight-row border :height="tableHeight" :loading="TableLoading" :columns="orderColumn" :data="data8">
          </Table>
        </div>

        <!-- 按产品/库位查询 -->
        <div class="tableBox" v-if="pageParams.queryStatusFlag == '2'">
          <Table highlight-row border :height="tableHeight" :loading="TableLoading" :columns="orderColumn" :data="data7">
          </Table>
        </div>

        <!-- 按产品/库位/批次查询 -->
        <div class="tableBox" v-if="pageParams.queryStatusFlag == '3'">
          <Table highlight-row border :height="tableHeight" :loading="TableLoading" :columns="orderColumn" :data="data6">
          </Table>
        </div>
      </div>

      <div class="pagesMain">
        <Page :total="totalRecords" :current="pageParams.pageNum" @on-change="changePage" show-total
          :page-size="pageParams.pageSize" show-elevator show-sizer @on-page-size-change="changePageSize" placement="top"
          :page-size-opts="pageArray"></Page>
      </div>
    </div>

    <!-- 调整出库顺序 -->
    <div v-if="showAdjustModal">
      <Modal v-model="showAdjustModal" :styles="{ top: '100px', width: '1300px' }" class="headerBar" title="调整出货顺序">
        <div class="content">
          <adjustShipping :open="showAdjustModal" :productSku="productSku" ref="adjustShipData" :wareId="wareRowId">
          </adjustShipping>
        </div>
        <div slot="footer">
          <Button type="primary" @click="saveAdjustButton">保存出货顺序</Button>
          <Button type="default" @click="cancelAdjustButton">取消</Button>
        </div>
      </Modal>
    </div>
    <!-- 库存事务明细 -->
    <div v-if="showDetailsModal">
      <Modal v-model="showDetailsModal" :styles="{ top: '60px', width: '1500px' }" class="headerBar" title="库存事务明细">
        <div class="content">
          <inventoryDetails :open="showDetailsModal" :productGoodsId="productGoodsId" ref="exportTableData"
            :wareId="wareRowId"></inventoryDetails>
        </div>
        <div slot="footer">
          <!-- <Button type="primary" @click="exportExcelBtn" icon="ios-download-outline">导出Excel</Button> -->
          <Button type="primary" @click="closeExcelBtn">关闭</Button>
        </div>
      </Modal>
    </div>

    <printSkuCode :printSkuObj="printDate" :printType="printType" :qualityCheckProcurementId="qualityCheckProcurementId"
      @printsuccess="printsuccess" :tipsDataLength="data2" :barCodeShow="barCodeShow" :printSource="'inventory'">
    </printSkuCode>

    <Modal v-model="modal3" :title="modal3Title" @on-ok="excelBtn" :mask-closable="false">
      <div v-if="exportType === 'balance'" style="padding-left:20px;">
        <div v-for="(item, index) in balanceList" :key="`d-${index}`">{{ index + 1 }}、{{ item.label }}</div>
      </div>
      <RadioGroup v-model="excelModel" v-else>
        <Radio label="1">
          <span>按产品导出</span>
        </Radio>
        <Radio label="2">
          <span>按产品/库位导出</span>
        </Radio>
        <Radio label="3">
          <span>按产品/库位/批次导出</span>
        </Radio>
      </RadioGroup>
    </Modal>

    <!--在途明细弹窗-->
    <Modal v-model="TransitDetailsModal" :mask-closable="false" width="700" title="在途明细">
      <Table highlight-row border max-height="550" :loading="TableLoading" :columns="TransitDetailsColumn"
        :data="TransitDetailsData"></Table>
      <div slot="footer" style="text-align: center;">
        <Button type="primary" @click="TransitDetailsModal = false">关闭</Button>
      </div>
    </Modal>
    <!-- 未发在途弹窗 -->
    <Modal v-model="onWayNoModel" :title="onWayNoModelTitle" width="900">
      <Table :columns="onWayColumn" :data='onWayData' max-height='400'></Table>
    </Modal>

  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import adjustShipping from '../wms-inStock/adjustShipping';
import inventoryDetails from '../wms-inStock/inventoryDetails';
import printSkuCode from '../common/printSkuCode';
import filterColumns from '@/components/localComponents/filterColumns/filterColumns';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';
import { inWareTypeObj } from '@/views/wms/components/common/receiptType.js';

export default {
  mixins: [Mixin, tableHeight_mixin],
  components: {
    printSkuCode: printSkuCode,
    adjustShipping: adjustShipping, // 调整出货顺序组件
    inventoryDetails: inventoryDetails, // 库存事务明细组件
    filterColumns
  },
  data() {
    var self = this;
    return {
      // 0:停售 1:在售 2:试卖 3:清仓
      orderColumn: [],
      tabsData: [
        // {
        //   label: '全部',
        //   value: null
        // },
        {
          label: '停售',
          value: 0
        }, {
          label: '在售',
          value: 1
        }, {
          label: '试卖',
          value: 2
        }, {
          label: '清仓',
          value: 3
        }, {
          label: '促销',
          value: 4
        }, {
          label: '转季',
          value: 5
        }
      ],
      filterColumns: [],
      filterName: 'inventoryLevels_01',
      excelModel: '1',
      modal3: false,
      showAdjustModal: false, // 调整出货顺序模态框
      showDetailsModal: false, // 库存事务明细
      cacheClickVal: 'SKU', // 排序缓存值
      productSku: '', // 当前行的SKU
      productGoodsId: '',
      wareRowId: '', // 当前行的仓库ID
      wareHouseTypeList: [], // 仓库下拉列表
      sortButtonList: [
        {
          sortHeader: "按SKU",
          sortField: "SKU",
          sortType: "DESC",
          default: true,
        },
      ],
      queryDataFlagList: [
        {
          label: '按产品查询',
          value: '1',
          checked: true
        }, {
          label: '按产品/库位查询',
          value: '2',
          checked: false
        }, {
          label: '按产品/库位/批次查询',
          value: '3',
          checked: false
        }
      ],
      wareId: this.getWarehouseId(),
      pageParams: {
        cargoOwnerType: null,
        cargoOwnerId: null,
        goodsStatus: '', //  // 0:停售 1:在售 2:试卖 3:清仓
        isInventNumber: 1, // 是否显示库存为0的数据 1显示
        searchSkuCode: '', // 输入SKU
        spuList: '', // 输入SPU
        searchGoodsDesc: '', // 商品描述
        searchBatchNum: '', // 批次号
        searchWareBlock: '', // 库区
        searchWareLocation: '', // 库位
        DESC: 'DESC', // 降序
        CT: 'SKU', // 排序的标记
        pageNum: 1, // 默认第一页
        pageSize: 10, // 规定每页显示 10 条数据
        queryStatusFlag: '1', // 查询维度的状态
        queryType: '1',
        spuStatus: '',
        productDeveloperUserId: '', // 开发人员
        productCategoryIdList: [], // 分类列表
        isReplaceSKU: 0, // 默认不查询
      },
      totalRecords: 0, // 共有多少条
      // 按产品/库位/批次查询
      columns6: [
        {
          title: '序号',
          type: 'index',
          width: 70,
          requiredCheck: true,
          align: 'center'
        }, {
          title: '图片',
          key: 'goodsUrl',
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            return self.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU',
          key: 'goodsSku',
          minWidth: 100,
          requiredCheck: true,
          align: 'center',
          render(h, params) {
            let isDel = params.row.goodsIsDelete === 1;
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
              }, params.row.goodsSku), !isDel || h('p', { style: { color: 'red' } }, '(已删除)')
            ]);
          }
        }, {
          title: 'SPU',
          key: 'spu',
          minWidth: 100,
          align: 'center'
        }, {
          title: 'SKU属性',
          key: 'goodsAttributes',
          minWidth: 100,
          align: 'center'
        }, {
          title: '中英文描述',
          key: 'goodsCnDesc',
          requiredCheck: true,
          width: 180,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('div', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : '',
                  marginTop: '5px'
                },
                attrs: { title: params.row.goodsCnDesc }
              }, params.row.goodsCnDesc),
              h('div', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : '',
                  marginTop: '5px'
                },
                attrs: { title: params.row.goodsEnDesc }
              }, params.row.goodsEnDesc)
            ]);
          }
        },
        {
          title: '开发员',
          key: 'productDeveloperUserId',
          align: 'center',
          width: 100,
          render: (h, params) => {
            let list = self.personnelRoleTypeList.filter(k => k.userId === params.row.productDeveloperUserId);
            return h('div', list[0] && list[0].userName);
          }
        },
        {
          title: '库存成本（rmb）',
          key: 'productCost',
          minWidth: 150,
          align: 'center'
        }, {
          title: '批次号',
          key: 'receiptBatchNo',
          align: 'center',
          minWidth: 160
        }, {
          title: '有效期',
          key: 'goodsEndDate',
          align: 'center',
          minWidth: 150
        }, {
          title: '库区',
          key: 'warehouseBlockName',
          minWidth: 100,
          align: 'center'
        }, {
          title: '库位',
          key: 'warehouseLocationName',
          minWidth: 100,
          align: 'center'
        }, {
          title: '库存数量',
          key: 'inventoryNumber',
          requiredCheck: true,
          minWidth: 100,
          align: 'center'
        }, {
          title: '分配数量',
          key: 'allottedNumber',
          requiredCheck: true,
          minWidth: 100,
          align: 'center'
        }, {
          title: '冻结数量',
          key: 'frozenNumber',
          requiredCheck: true,
          minWidth: 100,
          align: 'center'
        }, {
          title: '可用数量',
          key: 'availableNumber',
          requiredCheck: true,
          minWidth: 100,
          align: 'center'
        }, {
          title: '收货数量',
          key: 'deliveryNumber',
          minWidth: 100,
          requiredCheck: true,
          align: 'center'
        }, {
          title: '不良品数量',
          key: 'defectiveNumber',
          minWidth: 100,
          requiredCheck: true,
          align: 'center'
        },
        {
          title: '待归库数量',
          key: 'waitComeBackNumber',
          minWidth: 100,
          requiredCheck: true,
          align: 'center'
        }, {
          title: '操作',
          key: 'action',
          requiredCheck: true,
          align: 'center',
          width: 120,
          fixed: 'right',
          render: function (h, params) {
            return !self.getPermission('wmsInventory_print') || h('a', {
              on: {
                click: function () {
                  self.print([params.row.productGoodsId], params.row);
                }
              }
            }, '打印');
          }
        }
      ],
      data6: [], // 按产品/库位查询
      columns7: [
        {
          title: '序号',
          type: 'index',
          width: 70,
          requiredCheck: true,
          align: 'center'
        }, {
          title: '图片',
          key: 'goodsUrl',
          width: 85,
          align: 'center',
          render: (h, params) => {
            return self.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU',
          key: 'goodsSku',
          minWidth: 70,
          requiredCheck: true,
          align: 'center',
          render(h, params) {
            let isDel = params.row.goodsIsDelete === 1;
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
              }, params.row.goodsSku), !isDel || h('p', { style: { color: 'red' } }, '(已删除)')
            ]);
          }
        }, {
          title: 'SPU',
          key: 'spu',
          requiredCheck: true,
          align: 'center'
        }, {
          title: 'SKU属性',
          key: 'goodsAttributes',
          minWidth: 70,
          align: 'center'
        },
        {
          title: '中英文描述',
          key: 'goodsCnDesc',
          requiredCheck: true,
          width: 180,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('div', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : '',
                  marginTop: '5px'
                },
                attrs: { title: params.row.goodsCnDesc }
              }, params.row.goodsCnDesc),
              h('div', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : '',
                  marginTop: '5px'
                },
                attrs: { title: params.row.goodsEnDesc }
              }, params.row.goodsEnDesc)
            ]);
          }
        },
        {
          title: '开发员',
          key: 'productDeveloperUserId',
          align: 'center',
          width: 100,
          render: (h, params) => {
            let list = self.personnelRoleTypeList.filter(k => k.userId === params.row.productDeveloperUserId);
            return h('div', list[0] && list[0].userName);
          }
        },
        {
          title: '库区',
          key: 'warehouseBlockName',
          align: 'center'
        }, {
          title: '库位',
          key: 'warehouseLocationName',
          align: 'center'
        }, {
          title: '库存数量',
          key: 'inventoryNumber',
          requiredCheck: true,
          align: 'center'
        }, {
          title: '分配数量',
          key: 'allottedNumber',
          requiredCheck: true,
          align: 'center'
        }, {
          title: '冻结数量',
          key: 'frozenNumber',
          requiredCheck: true,
          align: 'center'
        }, {
          title: '可用数量',
          key: 'availableNumber',
          requiredCheck: true,
          align: 'center'
        },
        {
          title: '收货数量',
          key: 'deliveryNumber',
          requiredCheck: true,
          align: 'center'
        }, {
          title: '不良品数量',
          key: 'defectiveNumber',
          requiredCheck: true,
          align: 'center'
        },
        {
          title: '待归库数量',
          key: 'waitComeBackNumber',
          requiredCheck: true,
          align: 'center'
        }
      ],
      data7: [], // 仅按产品查询
      columns8: [
        {
          title: '序号',
          type: 'index',
          width: 60,
          requiredCheck: true,
          align: 'center'
        }, {
          title: '图片',
          key: 'goodsUrl',
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            return self.tableImg(h, params, 'goodsUrl');
          }
        },
        {
          title: 'SKU',
          key: 'goodsSku',
          minWidth: 120,
          requiredCheck: true,
          align: 'center',
          render(h, params) {
            let isDel = params.row.goodsIsDelete === 1;
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
              }, params.row.goodsSku), !isDel || h('p', { style: { color: 'red' } }, '(已删除)')
            ]);
          }
        },
        {
          title: 'SPU',
          key: 'spu',
          minWidth: 100,
          requiredCheck: true,
          align: 'center'
        },
        {
          title: 'sku商品状态', // 商品状态
          key: 'goodsStatus',
          align: 'center',
          minWidth: 110,
          render(h, params) {
            let [text, status] = ['', params.row.goodsStatus];
            (self.tabsData || []).forEach(k => {
              status === k.value && (text = k.label);
            })
            return h('span', text);
          }
        },
        {
          title: 'spu商品状态', // 商品状态
          key: 'spuStatus',
          align: 'center',
          minWidth: 110,
          render(h, params) {
            return h('span', params.row.spuStatus);
          }
        },
        {
          title: 'SKU属性',
          key: 'goodsAttributes',
          minWidth: 100,
          align: 'center'
        },
        {
          title: '中英文描述',
          key: 'goodsCnDesc',
          requiredCheck: true,
          width: 180,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('div', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : '',
                  marginTop: '5px'
                },
                attrs: { title: params.row.goodsCnDesc }
              }, params.row.goodsCnDesc),
              h('div', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : '',
                  marginTop: '5px'
                },
                attrs: { title: params.row.goodsEnDesc }
              }, params.row.goodsEnDesc)
            ]);
          }
        },
        {
          title: '开发员',
          key: 'productDeveloperUserId',
          align: 'center',
          width: 100,
          render: (h, params) => {
            let list = self.personnelRoleTypeList.filter(k => k.userId === params.row.productDeveloperUserId);
            return h('div', list[0] && list[0].userName);
          }
        },
        {
          title: '未发在途',
          key: 'onWayNoDespatchNumber ',
          align: 'center',
          width: 100,
          renderHeader: (h, params) => {
            return h('span', {
              style: { color: '#7CCD7C' },
              attrs: { title: '未发货的在途库存，未发在途=未收货数-发货在途' }
            }, '未发在途(全部/本地)')
          },
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.onWayNoDespatchNumber === 0 ? '' : '#6647f7',
                textDecoration: params.row.onWayNoDespatchNumber === 0 ? '' : 'underline',
                cursor: params.row.onWayNoDespatchNumber === 0 ? '' : 'pointer'
              },
              on: {
                'click': () => {
                  if (params.row.onWayNoDespatchNumber !== 0 && this.getPermission('wmsInventory_onWayNumberInfo')) this.onWayNoDespatchEvent(params.row.productGoodsId, '未发在途')
                }
              }
            }, params.row.onWayNoDespatchNumber + '/' + params.row.onWayNoDespatchNumberLocal);
          }
        }, {
          title: '发货在途',
          key: 'onWayDespatchNumber ',
          align: 'center',
          width: 100,
          renderHeader: (h, params) => {
            return h('span', {
              style: { color: '#7CCD7C' },
              attrs: { title: '已经发货的在途库存，发货在途=发货数-收货数-少货数' }
            }, '发货在途(全部/本地)')
          },
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.onWayDespatchNumber === 0 ? '' : '#6647f7',
                textDecoration: params.row.onWayDespatchNumber === 0 ? '' : 'underline',
                cursor: params.row.onWayDespatchNumber === 0 ? '' : 'pointer'
              },
              on: {
                'click': () => {
                  if (params.row.onWayDespatchNumber !== 0 && this.getPermission('wmsInventory_onWayNumberInfo')) this.onWayNoDespatchEvent(params.row.productGoodsId, '发货在途')
                }
              }
            }, params.row.onWayDespatchNumber + '/' + params.row.onWayDespatchNumberLocal);
          }
        }, {
          title: '库存数量',
          key: 'inventoryNumber',
          requiredCheck: true,
          minWidth: 85,
          align: 'center'
        }, {
          title: '分配数量',
          key: 'allottedNumber',
          requiredCheck: true,
          minWidth: 85,
          align: 'center'
        }, {
          title: '冻结数量',
          key: 'frozenNumber',
          requiredCheck: true,
          minWidth: 85,
          align: 'center'
        }, {
          title: '可用数量',
          key: 'availableNumber',
          requiredCheck: true,
          minWidth: 85,
          align: 'center'
        }, {
          title: '收货数量',
          key: 'deliveryNumber',
          minWidth: 85,
          requiredCheck: true,
          align: 'center'
        },
        {
          title: '待归库数量',
          key: 'waitComeBackNumber',
          minWidth: 100,
          requiredCheck: true,
          align: 'center'
        },
        {
          title: '不良品数量',
          key: 'defectiveNumber',
          minWidth: 100,
          requiredCheck: true,
          align: 'center'
        },
        {
          title: '异常拣货数量',
          key: 'pickingExceptionNumber',
          minWidth: 120,
          requiredCheck: true,
          align: 'center'
        },
        {
          title: '安全库存',
          key: 'safetyInventoryNumber',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('div', [
              h('InputNumber', {
                props: {
                  size: 'small',
                  value: params.row.safetyInventoryNumber, // 将单元格的值给Input
                  min: 0
                },
                style: {
                  width: '70%'
                },
                on: {
                  input(value) {
                    self.data8[params.index] = params.row;
                    params.row.safetyInventoryNumber = value;
                  }
                }
              }), h('Button', {
                props: {
                  type: 'text',
                  icon: 'md-checkmark',
                  disabled: !this.getPermission('wmsInventory_modifysafetyNumber')
                },
                class: {
                  'show-save-btn': true
                },
                on: {
                  click: () => {
                    self.submitSafetyNumBtn(self.data8[params.index].safetyInventoryNumber, self.data8[params.index].inventoryId);
                  }
                }
              })
            ]);
          }
        }, {
          title: '操作',
          key: 'action',
          align: 'center',
          fixed: 'right',
          requiredCheck: true,
          minWidth: 160,
          render: function (h, params) {
            return h('div', [
              this.getPermission('wmsInventoryLog_list')
                ? h('a', {
                  style: {
                    marginRight: '10px',
                    color: 'blue'
                  },
                  on: {
                    click: function () {
                      this.$nextTick(() => {
                        this.showDetailsModal = true;
                        this.productSku = params.row.goodsSku; // 当前行的SKU
                        this.productGoodsId = params.row.productGoodsId;
                        this.wareRowId = params.row.warehouseId; // 当前行的仓库id
                      });
                    }.bind(this)
                  }
                }, '明细')
                : '',
              this.getPermission('wmsInventory_modifySort')
                ? h('a', {
                  style: {
                    marginRight: '10px',
                    color: 'blue'
                  },
                  on: {
                    click: function () {
                      this.$nextTick(() => {
                        this.showAdjustModal = true;
                        this.productSku = params.row.goodsSku; // 当前行的SKU
                        this.productGoodsId = params.row.productGoodsId;
                        this.wareRowId = params.row.warehouseId; // 当前行的仓库id
                      });
                    }.bind(this)
                  }
                }, '调整出货顺序')
                : ''
              /* h('a', {
               on: {
               click: function () {
               this.print([params.row.productGoodsId]);
               }.bind(this)
               }
               }, '打印') */
            ]);
          }.bind(this)
        }
      ],
      data8: [],
      printDate: [],
      printType: 'single', // 打印参数
      qualityCheckProcurementId: '', // 打印参数
      data2: [], // 打印参数
      barCodeShow: '', // 打印参数
      safetyNum: '', // 安全库存
      TransitDetailsModal: false,
      TransitDetailsData: [],
      TransitDetailsColumn: [
        {
          title: '入库单号',
          key: 'receiptNo',
          align: 'center'
        }, {
          title: '入库单类型',
          key: 'receiptType',
          align: 'center',
          render: (h, params) => {
            // let receipt = '';
            // let type = ['备货入库', '生产入库', '调拨入库', '退货入库', '其他入库', '急采入库'];
            // receipt = type[params.row.receiptType];
            let typeList = inWareTypeObj();
            let item = typeList[params.row.receiptType] || {};
            return h('span', item.label || '');
          }
        }, {
          title: '在途数量',
          key: 'onWayQuantity',
          align: 'center'
        }, {
          title: '创建时间',
          key: 'createdTime',
          align: 'center',
          render: (h, params) => {
            return h('span', self.$uDate.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        }
      ],
      exportType: '', // 导出类型
      modal3Title: '导出', // 导出标题
      balanceList: [
        { label: '按产品导出；' },
        { label: '默认导出，不需要使用查询条件；' },
        { label: '导出的数据：库存数量不为0，或者在途库存数量不为0；' },
        { label: '不导出的数据：库存数量与在途库存数量同时为0；' }
      ],
      onWayNoModel: false, // 未发在途弹窗
      onWayNoModelTitle: '未发在途详情',
      onWayColumn: [],
      onWayColumn1: [
        {
          title: '入库单编号',
          key: 'receiptNo',
          align: 'center'
        },
        {
          title: '参考编号',
          key: 'referenceNo',
          align: 'center'
        },
        {
          title: '入库单类型',
          key: 'receiptType',
          align: 'center'
        },
        {
          title: '下单时间',
          key: 'createdTime',
          align: 'center'
        }
        // {
        //   title: '未发在途',
        //   key: 'onWayNoDespatchNumber',
        //   align: 'center'
        // },
        // {
        //   title: '发货在途',
        //   key: 'onWayDespatchNumber',
        //   align: 'center'
        // },
      ],
      onWayData: [], // 未发，发货在途数据
      productStatusSpu: [
        { value: 0, label: '停售' },
        { value: 1, label: '在售' },
        { value: 2, label: '试卖' },
        { value: 3, label: '清仓' },
        { value: 4, label: '促销' },
        { value: 5, label: '转季' },
        { value: 6, label: '部分停售' },
        { value: 7, label: '部分在售' },
        { value: 8, label: '部分试卖' },
        { value: 9, label: '部分清仓 ' },
        { value: 10, label: '部分促销' },
        { value: 11, label: '部分转季' }
      ],
      personnelRoleTypeList: [], // 开发人员列表
      treeSelectCategoryValue: [], // 上架分类
      selectTreeProductCategory: [],
      selectTreeProductData: [],
    };
  },
  computed: {
    securityUser() {
      if (this.$store.getters["authUserInfo"] && this.$store.getters["authUserInfo"].securityUser) {
        return this.$store.getters["authUserInfo"].securityUser;
      }
      return {}
    },
    isFSwarehouse() {
      let warehouseItems = this.$store.state.warehouseList.filter(i => {
        if (i.warehouseId === this.wareId) return i;
      });
      let warehouseItem = warehouseItems[0] || {};
      return warehouseItem.warehouseName === '佛山丽山仓';
    },
  },
  created() {
    // this.searchData();
    this.getColumns();
    this.getUserInfo();
    this.getProductCategoryList();
  },
  //   computed: {
  //     tableHeight () {
  //       return this.getTableHeight(295);
  //     }
  //   },
  watch: {
    'pageParams.queryStatusFlag'(n, o) {
      if (n && n !== o) {
        this.getColumns();
        this.$nextTick(() => {
          this.computedTableHeight();
        })
      }
    }
  },
  methods: {
    setTableColumns(data) {
      /**
       * 设置table columns
       * */
      let datas = [];
      let dataKey = '';
      switch (this.pageParams.queryStatusFlag) {
        case '1':
          datas = JSON.parse(JSON.stringify(this.data8));
          dataKey = 'data8';
          this.data8 = [];
          break;
        case '2':
          datas = JSON.parse(JSON.stringify(this.data7));
          dataKey = 'data7';
          this.data7 = [];
          break;
        case '3':
          datas = JSON.parse(JSON.stringify(this.data6));
          dataKey = 'data6';
          this.data6 = [];
          break;
      }
      this.$nextTick(() => {
        this.orderColumn = data;
        setTimeout(() => {
          this[dataKey] = datas;
        }, 10);
      });
    },
    getColumns() {
      this.filterColumns = [];
      switch (this.pageParams.queryStatusFlag) {
        case '1':
          this.filterColumns = this.columns8;
          break;
        case '2':
          this.filterColumns = this.columns7;
          break;
        case '3':
          this.filterColumns = this.columns6;
          break;
      }
    },
    exportExcel(type, title) {
      this.modal3 = true;
      this.modal3Title = title || '导出';
      this.exportType = type;
    },
    excelBtn() {
      if (this.exportType === 'balance') {
        this.balanceExport();
        return;
      }
      let temp = this.getParams();
      temp.queryParamType = this.excelModel;
      this.axios.post(api.wmsInventoryExport, temp).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('导出成功');
        }
      });
    },
    // 库存余量导出
    balanceExport() {
      let temp = {
        queryParamType: 1, // 固定值
        warehouseId: this.wareId,
        businessDeptId: this.securityUser.businessDeptId,
        businessDeptIds: this.securityUser.businessDeptIds
      };
      this.axios.post(api.exportRegular, temp).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('导出成功');
        }
      });
    },
    printsuccess() { },
    print(productGoodsIds, params) {
      this.getPrintDate(productGoodsIds, params).then(() => {
        this.$store.commit('printSkuModal', true);
      });
    },
    getPrintDate(productGoodsIds, params) {
      let v = this;
      return new Promise(resolve => {
        v.axios.post(api.queryByProductGoodsIds, {
          'productGoodsIds': productGoodsIds,
          'warehouseId': v.getWarehouseId()
        }).then(res => {
          if (res.data.code === 0) {
            let data = [];
            for (let key in res.data.datas) {
              res.data.datas[key]._printNumber = 1;
              res.data.datas[key].barcode = res.data.datas[key].skuBarcode;
              res.data.datas[key].warehouseLocationName = params.warehouseLocationName;
              res.data.datas[key].receiptBatchNo = params.receiptBatchNo;
              data.push(res.data.datas[key]);
            }
            v.barCodeShow = data[0].barcode;
            v.printDate = data;
            resolve(res.data);
          }
        }).catch(() => {
        });
      });
    },
    // 获取筛选条件
    getParams() {
      let paramsObj = {
        queryState: '1', // 标识
        pageNum: this.pageParams.pageNum,
        goodsStatus: this.pageParams.goodsStatus,
        spuStatus: this.pageParams.spuStatus,
        isInventNumber: this.pageParams.queryStatusFlag === '1' ? this.pageParams.isInventNumber + '' : '0', // 只有按照产品查询才展示
        pageSize: this.pageParams.pageSize,
        orderSeq: this.pageParams.DESC,
        orderBy: this.pageParams.CT,
        queryParamType: this.pageParams.queryType,
        goodsSku: this.pageParams.searchSkuCode === '' ? null : this.sepCommasFn(this.pageParams.searchSkuCode), // 输入多个SKU
        spuList: this.pageParams.spuList === '' ? null : this.sepCommasFn(this.pageParams.spuList), // 输入多个SPU
        warehouseBlockNames: this.pageParams.searchWareBlock === '' ? null : this.sepCommasFn(this.pageParams.searchWareBlock), // 输入多个库区
        warehouseLocationNames: this.pageParams.searchWareLocation === '' ? null : this.sepCommasFn(this.pageParams.searchWareLocation), // 输入多个库位
        warehouseId: this.wareId,
        productDeveloperUserId: this.pageParams.productDeveloperUserId,
        productCategoryIdList: this.pageParams.productCategoryIdList,
        businessDeptId: this.securityUser.businessDeptId,
        businessDeptIds: this.securityUser.businessDeptIds,
      }
      // 商品描述，中文/英文
      if (this.pageParams.searchGoodsDesc) {
        paramsObj.goodsDesc = this.pageParams.searchGoodsDesc;
      }
      // 批次号
      if (this.pageParams.searchBatchNum) {
        paramsObj.receiptBatchNo = this.pageParams.searchBatchNum;
      }
      if (this.pageParams.cargoOwnerId) {
        if (this.pageParams.cargoOwnerId === '_NO_CARGO_OWNER') {
          // 无货主
          paramsObj.cargoOwnerType = 0;
          paramsObj.cargoOwnerId = null;
        } else {
          paramsObj.cargoOwnerType = 1;
          paramsObj.cargoOwnerId = this.pageParams.cargoOwnerId;
        }
      } else {
        paramsObj.cargoOwnerType = null;
        paramsObj.cargoOwnerId = null;
      }
      if (this.isFSwarehouse) {
        paramsObj.isReplace = this.pageParams.isReplaceSKU;
      }
      return paramsObj
    },
    searchData() {
      // 查询功能
      this.pageParams.pageSize = this.getPageSizeCache();
      if (this.getPermission('wmsInventory_list')) {
        this.filterName = 'inventoryLevels_0' + this.pageParams.queryStatusFlag;
        this.TableLoading = true;
        this.SearchDisabled = true;
        this.axios.post(api.inventoryListSearchData, this.getParams()).then(res => {
          this.TableLoading = false;
          this.SearchDisabled = false;
          if (res.data.code === 0) {
            this.data6 = res.data.datas.list !== null ? res.data.datas.list : [];
            this.data7 = res.data.datas.list !== null ? res.data.datas.list : [];
            this.data8 = res.data.datas.list !== null ? res.data.datas.list : [];
            this.totalRecords = res.data.datas.total;
          }
        });
        this.getWareHouseName(); // 调用仓库下拉列表
      } else {
        this.gotoError(); // 无权限
      }
    },
    inventorySearch() {
      // 页面查询
      this.pageParams.pageNum = 1;
      this.searchData();
    },
    submitSafetyNumBtn(safetyNum, inventId) {
      // 修改安全库存
      var v = this;
      var modifySafeArr = [];
      var obj = {
        safetyInventoryNumber: safetyNum,
        inventoryId: inventId
      };
      modifySafeArr.push(obj);
      v.axios.post(api.modifySafetyNumber, modifySafeArr).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('修改安全库存成功');
          v.searchData();
        }
      });
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.DESC = type;
      this.pageParams.CT = feild;
      this.searchData();
    },
    queryDataStatus: function (value) {
      // 查询维度的按钮
      // this.queryDataFlagList.forEach(function (n) {
      //   n.checked = n.value === value;
      // });
      this.pageParams.queryStatusFlag = value;
      // this.pageParams.queryType = value;
      // this.searchData();
    },
    changePage(page) {
      // 表格分页
      this.pageParams.pageNum = page;
      this.searchData();
    },
    changePageSize(size) {
      // 切换每页条数
      this.setPageSizeCache(size);
      this.pageParams.pageSize = size;
      this.searchData();
    },
    getWareHouseName() {
      // 获取仓库下拉列表
      // var v = this;
      // v.axios.post(api.selectReceiptWareHouseName)
      //   .then(res => {
      //     if (res.data.code === 0) {
      //       v.wareHouseTypeList = res.data.datas;
      //     }
      //   });
    },
    saveAdjustButton() {
      // 保存调整出货顺序按钮
      let v = this;
      let obj = this.$refs.adjustShipData.getSortParams();
      obj.wmsInventoryList = this.$refs.adjustShipData.tableData;
      v.axios.post(api.adjustInventorySort, obj).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('成功保存调整出货顺序');
          v.showAdjustModal = false;
        }
      });
    },
    cancelAdjustButton() {
      // 取消调整出货顺序按钮
      var v = this;
      v.showAdjustModal = false;
    },
    exportExcelBtn() {
      // 导出Excel表格
      // this.showDetailsModal = false;
      this.$refs.exportTableData.exportData();
    },
    closeExcelBtn() {
      // 关闭
      var v = this;
      v.showDetailsModal = false;
    },
    // 重置按钮
    reset() {
      this.$refs['pageParams'].resetFields();
      this.pageParams.queryStatusFlag = this.pageParams.queryType = '1';
      // this.searchData();
    },
    /**
     * @Description: 获取在途明细弹窗的数据
     * @author jing
     * @date: 2020/9/17 16:25
     * @params: warehouseId 仓库id  productGoodsId 商品id
     */
    GetTransitDetailsData(productGoodsId) {
      let v = this;
      v.axios.get(api.get_onWayDetail, {
        params: {
          productGoodsId: productGoodsId,
          warehouseId: v.wareId
        }
      }).then(res => {
        if (res.data.code === 0) {
          v.TransitDetailsModal = true;
          v.TransitDetailsData = res.data.datas;
        }
      });
    },
    onWayNoDespatchEvent(val, kind) {
      let temp = {}
      temp.productGoodsId = val
      temp.warehouseId = this.wareId

      this.axios.post('/wms-service/wmsInventory/onWayNumberInfo', temp).then(res => {
        this.onWayNoModel = true
        this.onWayData = []
        let data = res.data.datas
        data = this.processTimeData(data, 'createdTime');
        let inWareTypeList = inWareTypeObj({ label: 'name', value: 'num' });
        let receiptType = Object.values(inWareTypeList);
        // let receiptType = [
        //   {
        //     num: '0',
        //     name: '普通备货入库'
        //   },
        //   {
        //     num: '1',
        //     name: '生产入库'
        //   },
        //   {
        //     num: '2',
        //     name: '调拨入库'
        //   },
        //   {
        //     num: '3',
        //     name: '退货入库'
        //   },
        //   {
        //     num: '4',
        //     name: '其他入库'
        //   },
        //   {
        //     num: '5',
        //     name: '急采入库'
        //   },
        //   {
        //     num: '6',
        //     name: '海外仓备货入库'
        //   },
        //   {
        //     num: '7',
        //     name: 'FBA备货入库'
        //   },
        //   {
        //     num: '8',
        //     name: '直发备货入库'
        //   }
        // ]
        data.forEach(item => {
          let temp = {}
          temp.receiptNo = item.receiptNo
          temp.referenceNo = item.referenceNo
          temp.createdTime = item.createdTime
          temp.onWayNoDespatchNumber = item.onWayNoDespatchNumber
          temp.onWayDespatchNumber = item.onWayDespatchNumber
          temp.onWayNumberType = item.onWayNumberType
          receiptType.forEach(itemb => {
            if (itemb.num === item.receiptType) {
              temp.receiptType = itemb.name
            }
          })
          this.onWayData.push(temp)
        })
        if (kind === '未发在途') {
          this.onWayData = this.onWayData.filter(item => {
            return item.onWayNoDespatchNumber !== 0
          })
          this.onWayData.forEach(item => {
            if (item.onWayNumberType === 0) {
              item.NoDespatch = item.onWayNoDespatchNumber
            } else {
              item.NoDespatchOther = item.onWayNoDespatchNumber
            }
          })
          this.onWayColumn = JSON.parse(JSON.stringify(this.onWayColumn1))
          this.onWayColumn.push(
            {
              title: '本地未发在途',
              key: 'NoDespatch',
              align: 'center'
            },
            {
              title: '海外未发在途',
              key: 'NoDespatchOther',
              align: 'center'
            })
        } else {
          this.onWayData = this.onWayData.filter(item => {
            return item.onWayDespatchNumber !== 0
          })
          this.onWayData.forEach(item => {
            if (item.onWayNumberType === 0) {
              item.onWayDespatch = item.onWayDespatchNumber
            } else {
              item.onWayDespatchOther = item.onWayDespatchNumber
            }
          })
          this.onWayColumn = JSON.parse(JSON.stringify(this.onWayColumn1))
          this.onWayColumn.push(
            {
              title: '本地发货在途',
              key: 'onWayDespatch',
              align: 'center'
            },
            {
              title: '海外发货在途',
              key: 'onWayDespatchOther',
              align: 'center'
            })
        }
      })
    },
    // 获取开发人员列表
    getUserInfo() {
      this.axios.get(api.query_allDeveloper, { hiddenError: true }).then(res => {
        if (res.data.code == 0 && res.data.datas) {
          let newList = {}
          res.data.datas.forEach(item => {
            newList[item.userId] = item
          })
          this.personnelRoleTypeList = Object.values(newList)
        }
      })
    },
    // 处理树节点
    treeNormalizer(node) {
      return {
        id: node.productCategoryId,
        label: node.title,
        children: node.children
      }
    },
    // 树选中值改变
    treeSelectCategoryChange(list) {
      let fun = (list) => {
        let totalList = [];
        list.forEach(k => {
          if (k.children && k.children.length) totalList.push(...fun(k.children));
          totalList.push(k.productCategoryId);
        })
        return totalList;
      }
      let ids = fun(list);
      // 去除全部id
      let index = ids.indexOf('productCategoryId');
      if (index >= 0) ids.splice(index, 1);
      this.$set(this.pageParams, 'productCategoryIdList', ids);
    },
    // 获取商品分类(筛选下拉)
    getProductCategoryList() {
      let self = this;
      self.axios.get(api.get_productCategory, { hiddenError: true }).then((response) => {
        if (response.data.code === 0) {
          let productCategoryTree = self.getProductCategoryTree(response.data.datas, null);
          self.selectTreeProductData = (response.data.datas || []);
          self.$nextTick(function () {
            productCategoryTree.unshift({
              title: '未分类',
              productCategoryId: 'noCategory',
              expand: true
            });
            self.selectTreeProductCategory = [{
              title: '全部',
              productCategoryId: 'productCategoryId',
              expand: true,
              children: productCategoryTree
            }]
          });
        }
      });
    },
    // 组装商品分类树
    getProductCategoryTree(productCategoryList, parentId) {
      var tree = [];
      var children;
      productCategoryList.forEach((n, i) => {
        if (n.parentId === parentId) {
          n.title = n.cnName;
          n.expand = true;
          children = this.getProductCategoryTree(
            productCategoryList,
            n.productCategoryId
          );
          if (children.length > 0) {
            n.children = children;
          }
          tree.push(n);
        }
      });
      return tree;
    },
    exportReplaceSku() {
      this.$Modal.confirm({
        title: '提示',
        content: '<p>确定全部导出替代SKU库存余量？</p>',
        loading: true,
        onOk: () => {
          let temp = this.getParams();
          this.axios.post(api.inventory_exportReplace, temp).then(response => {
            if (response.data.code === 0) {
              this.$Message.success('导出成功！请前往导出任务中查看~');
            }
          }).finally(() => {
            this.$Modal.remove();
          })
        }
      });
    }
  }
};
</script>
<style>
.headerBar .ivu-modal-header p,
.headerBar .ivu-modal-header-inner {
  color: #fff;
}

.show-save-btn {
  display: none;
  margin-left: -6px;
}

.ivu-table-cell:hover .show-save-btn {
  display: inline-block;
}
</style>

<style lang="less" scoped>
.inventoryLevels {
  height: 100%;

  .filterColumns {
    position: absolute;
    right: 2px;
    bottom: -24px;
    width: auto;
    height: auto;
  }
}
</style>