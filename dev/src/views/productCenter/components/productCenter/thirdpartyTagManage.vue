<template>
  <div class="thirdpartyTagManage">
    <!-- 标签 -->
    <Tabs v-model="platformId" @on-click="changeTabType">
      <TabPane v-for="(tabItem, index) in tabsData" :key="`tab-${index}`" :label="tabItem.label" :name="tabItem.value">
      </TabPane>
    </Tabs>
    <!-- 搜索条件 -->
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content platformParamsSelect">
          <Form v-if="!$common.isEmpty(filterParams[platformId])" ref="searchFormRef" class="normalTop"
            :model="filterParams[platformId]" :label-width="90" label-position="right">
            <dyt-filter>
              <Form-item label="店铺" prop="saleAccountId" v-if="paramItemVisible['saleAccountId']">
                <dyt-select v-model="filterParams[platformId].saleAccountId" placeholder="请选择店铺" :clearable="false"
                  @on-change="saleAccountChange">
                  <Option v-for="(item, index) in (accountDataList[platformId] || [])" :value='item.saleAccountId'
                    :key="`account-${index}`">{{ item.account }}</Option>
                </dyt-select>
              </Form-item>
              <!-- `${['shein'].includes(lowerCasePlatformId) ? '平台SKC' : '款式编码'}` -->
              <Form-item :label="productSkcLabel()" prop="productSkcIdList" v-if="paramItemVisible['productSkcIdList']">
                <dyt-input-tag type="textarea" :limit="1" :string="false" placeholder="请输入，多个用逗号或回车分隔"
                  v-model="filterParams[platformId].productSkcIdList" />
              </Form-item>
              <Form-item label="供方货号" prop="supplierItemList" v-if="paramItemVisible['supplierItemList']">
                <dyt-input-tag type="textarea" :limit="1" :string="false" placeholder="请输入，多个用逗号或回车分隔"
                  v-model="filterParams[platformId].supplierItemList" />
              </Form-item>
              <Form-item label="平台SKU" prop="platformSkuList" v-if="paramItemVisible['platformSkuList']">
                <dyt-input-tag type="textarea" :limit="1" :string="false" placeholder="请输入，多个用逗号或回车分隔"
                  v-model="filterParams[platformId].platformSkuList" />
              </Form-item>
              <Form-item label="条码编码" prop="labelCodeList" v-if="paramItemVisible['labelCodeList']">
                <dyt-input-tag type="textarea" :limit="1" :string="false" placeholder="请输入，多个用逗号或回车分隔"
                  v-model="filterParams[platformId].labelCodeList" />
              </Form-item>
              <Form-item :label="`${['shein', 'tiktok'].includes(lowerCasePlatformId) ? 'LAPA SKU' : '客户SKU'}`"
                prop="extCodeList" v-if="paramItemVisible['extCodeList']">
                <dyt-input-tag type="textarea" :limit="1" :string="false" placeholder="请输入，多个用逗号或回车分隔"
                  v-model="filterParams[platformId].extCodeList" />
              </Form-item>
              <Form-item label="匹配状态" prop="matchStatus" v-if="paramItemVisible['matchStatus']">
                <dyt-select v-model="filterParams[platformId].matchStatus" placeholder="请选择匹配状态">
                  <Option :value="0" label="未匹配" />
                  <Option :value="1" label="已匹配" />
                </dyt-select>
              </Form-item>
              <div slot="operation">
                <Button type="primary" icon="md-search" @click="searchTable(true)">查询</Button>
                <Button class="ml10" @click="searchReset" v-once icon="md-refresh">重置</Button>
              </div>
            </dyt-filter>
          </Form>
        </div>
      </div>
    </div>
    <!-- 按钮 -->
    <div class="addBrand">
      <div class="table-top-btn">
        <Button type="primary" @click="updateOperate({})" v-if="permit.syncUpdate">同步更新</Button>
        <Button type="primary" @click="openImportModal" v-if="permit.leadIn">导入资料</Button>
        <Dropdown v-if="permit.export">
          <Button type="primary">
            导出
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="exportExcel('check')">
              导出选中
            </DropdownItem>
            <DropdownItem @click.native="exportExcel('all')">
              导出所有结果集
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <div class="addBrand-txt-tips" v-if="permit.syncUpdate">每天凌晨03:00，自动同步更新一次商品资料</div>
      </div>
      <div class="dataSort grayBg">
        <span>排序：</span>
        <Button-group>
          <template v-for="(item, index) in buttonGroupModel">
            <Button v-if="item.selected" :disabled="SearchDisabled" type="primary"
              @click="modifyTheSort(index, item.status)" :key="index">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
            <Button v-if="!item.selected" :disabled="SearchDisabled" @click="modifyTheSort(index, item.status)"
              :key="index">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
          </template>
        </Button-group>
      </div>
    </div>
    <!-- 表格 -->
    <div class="orderTable normalTop">
      <template v-for="(tabItem, index) in tabsData">
        <!-- 当表格数据比较多时，直接改变列表的数据会比较卡，使用隐藏节点提升速度 -->
        <Table :key="`table-${index}`" class="order-table-contet" :class="{ 'unviewable': platformId !== tabItem.value }"
          v-if="(typeof tableData[tabItem.value] != 'undefined')" highlight-row :loading="tableLoading" border
          :height="tableHeight" :columns="tableColumn[tabItem.value]" :data="tableData[tabItem.value]"
          @on-selection-change="getSelectValue" :span-method="tableSpanHandle" />
      </template>
      <div class="table-page">
        <div class="table-page-right">
          <Page v-if="!$common.isEmpty(filterParams[platformId]) && !$common.isEmpty(pageTool[platformId])"
            :total="pageTool[platformId].total" @on-change="pageNumChange" show-total
            :page-size="filterParams[platformId].pageSize" show-elevator :current="filterParams[platformId].pageNum"
            show-sizer @on-page-size-change="pageSizeChange" placement="top"
            :page-size-opts="pageTool[platformId].pageArray" />
        </div>
      </div>
    </div>
    <Spin v-if="initDataLoading" fix>正在加载页面所需数据...</Spin>
    <!-- 编辑第三方标签 -->
    <editThirdpartyTag :model-visible.sync="editModelVisible" :module-data="editModuleData"
      @refreshParentPage="searchTable" />
    <!-- 导入第三方标签 -->
    <importThirdPartyTag :model-visible.sync="importModelVisible" :module-data="importModuleData"
      @refreshParentPage="searchTable" />
    <!-- 打印第三方标签 -->
    <printThirdPartyTagModal :model-visible.sync="printModelVisible" :module-data="printModuleData"
      @refreshParentPage="searchTable" />
  </div>
</template>
<script>
import api from '@/api/api';
import editThirdpartyTag from './editThirdpartyTag.vue';
import importThirdPartyTag from './importThirdPartyTag.vue';
import printThirdPartyTagModal from './printThirdPartyTagModal.vue';
import Mixin from '@/components/mixin/common_mixin';

// 常量
const sonstant = {
  // 表格列匹配
  tableColKey: {
    // 默认
    default: ['selection', 'sku', 'platformSku', 'labelCode', 'skcSpecName', 'skuSpecName', 'countryName', 'extCode', 'matchStatus', 'spec', 'operate'],
    temu: ['selection', 'sku', 'platformSku', 'labelCode', 'skcSpecName', 'skuSpecName', 'countryName', 'extCode', 'matchStatus', 'spec', 'operate'],
    shein: ['selection', 'supplierItem', 'platformSku', 'labelCode', 'skcSpecName', 'skuSpecName', 'labelUrl', 'lapaSku', 'matchStatus', 'spec', 'operate'],
    tiktok: ['selection', 'sku', 'platformSku', 'labelCode', 'skcSpecName', 'skuSpecName', 'lapaSku', 'matchStatus', 'spec', 'operate'],
  },
  // 搜索栏公共的 key
  publicParamKeys: ['descOrAsc', 'orderBy', 'pageSize', 'pageNum', 'platformId'],
  // 配置对应平台是显示的搜索输入框
  paramItemKey: {
    // 默认
    default: ['saleAccountId', 'productSkcIdList', 'platformSkuList', 'labelCodeList', 'extCodeList', 'matchStatus'],
    temu: ['saleAccountId', 'productSkcIdList', 'platformSkuList', 'labelCodeList', 'extCodeList', 'matchStatus'],
    shein: ['saleAccountId', 'productSkcIdList', 'supplierItemList', 'platformSkuList', 'extCodeList', 'matchStatus'],
    tiktok: ['saleAccountId', 'productSkcIdList', 'platformSkuList', 'labelCodeList', 'extCodeList', 'matchStatus'],
  },
  // 搜索栏输入项
  pageParams: {
    descOrAsc: '', // 升降序
    orderBy: '', // 排序字段 tgl.created_time
    pageSize: 20,
    pageNum: 1,
    platformId: '', // 平台
    saleAccountId: '', // 店铺
    productSkcIdList: [], // 款式编码
    platformSkuList: [], // 平台sku
    labelCodeList: [], // 条码编码
    extCodeList: [], // 客户sku
    matchStatus: null, // 匹配状态：0：未匹配 1：已匹配
    supplierItemList: [], // 供方货号
  }
}

export default {
  name: "thirdpartyTagManageList",
  components: {
    editThirdpartyTag,
    importThirdPartyTag,
    printThirdPartyTagModal
  },
  mixins: [Mixin],
  props: {},
  data() {
    return {
      tableLoading: false,
      initDataLoading: false,
      editModelVisible: false,
      importModelVisible: false,
      printModelVisible: false,
      queryParam: {},
      editModuleData: {},
      importModuleData: {},
      printModuleData: {},
      tabsData: [],
      accountDataList: {},
      platformId: '',
      filterParams: {},
      selectedRows: {},
      tableData: {},
      pageTool: {},
      buttonGroupModel: [
        {
          type: 'tgl.created_time',
          selected: true,
          status: false, // true up false down
          title: '创建时间'
        },
      ],
      tableColObj: {
        // 选项框
        selection: {
          type: 'selection',
          width: 60,
          // fixed: 'left',
          align: 'center'
        },
        // 平台款式信息
        sku: {
          title: '平台款式信息',
          key: 'sku',
          align: 'center',
          minWidth: 280,
          className: 'col-platform-info',
          render: (h, params) => {
            let imageUrl = params.row.imageUrl;
            if (!this.$common.isEmpty(imageUrl) && !(imageUrl.substring(0, 7) == 'http://' || imageUrl.substring(0, 8) == 'https://')) {
              imageUrl = `${window.location.origin}/product-service/filenode/s${imageUrl}`;
            }
            let firstLabel = '款式：';
            if (['tiktok'].includes(this.lowerCasePlatformId)) firstLabel = '平台款号：';
            return h('div', {
              style: {
                'display': 'flex'
              }
            }, [
              this.tableImg(h, params, 'null', imageUrl),
              h('div', {
                style: {
                  'flex': 100,
                  'text-align': 'left',
                  'line-height': '1.4em'
                }
              }, [
                h('div', `${firstLabel}${params.row.productSkcId || ''}`),
                h('div', {
                  style: {
                    'margin-top': '5px'
                  }
                }, `名称：${params.row.productName || ''}`)
              ])
            ])
          }
        },
        // 平台款式信息
        supplierItem: {
          title: '平台款式信息',
          key: 'sku',
          align: 'center',
          minWidth: 280,
          className: 'col-platform-info',
          render: (h, params) => {
            let imageUrl = params.row.imageUrl;
            if (!this.$common.isEmpty(imageUrl) && !(imageUrl.substring(0, 7) == 'http://' || imageUrl.substring(0, 8) == 'https://')) {
              imageUrl = `${window.location.origin}/product-service/filenode/s${imageUrl}`;
            }
            return h('div', {
              style: {
                'display': 'flex'
              }
            }, [
              this.tableImg(h, params, 'null', imageUrl),
              h('div', {
                style: {
                  'flex': 100,
                  'text-align': 'left',
                  'line-height': '1.4em'
                }
              }, [
                h('div', `平台SKC：${params.row.productSkcId || ''}`),
                h('div', {
                  style: {
                    'margin-top': '5px'
                  }
                }, `供方货号：${params.row.supplierItem || ''}`),
                h('div', {
                  style: {
                    'margin-top': '5px'
                  }
                }, `名称：${params.row.productName || ''}`)
              ])
            ])
          }
        },
        // 平台SKU
        platformSku: {
          title: '平台SKU',
          key: 'platformSku',
          align: 'center',
          width: 130,
        },
        // 条码编码
        labelCode: {
          title: '条码编码',
          key: 'labelCode',
          align: 'center',
          width: 120
        },
        // 主属性
        skcSpecName: {
          title: '主属性',
          key: 'skcSpecName',
          align: 'center',
          width: 120
        },
        // 次属性
        skuSpecName: {
          title: '次属性',
          key: 'skuSpecName',
          align: 'center',
          width: 90
        },
        // 产地
        countryName: {
          title: '产地',
          key: 'countryName',
          align: 'center',
          width: 90
        },
        // 客户SKU
        extCode: {
          title: '客户SKU',
          key: 'extCode',
          align: 'center',
          width: 120
        },
        // LAPA SKU
        lapaSku: {
          title: 'LAPA SKU',
          key: 'extCode',
          align: 'center',
          width: 120
        },
        // 匹配状态
        matchStatus: {
          title: '匹配状态',
          key: 'matchStatus',
          align: 'center',
          width: 90,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.matchStatus) || ![0, '0', 1, '1'].includes(row.matchStatus)) return h('div', '');
            if ([0, '0'].includes(row.matchStatus)) {
              return h('div', {
                style: {
                  'color': '#f20',
                  'text-decoration': this.permit.match ? 'underline' : 'initial',
                  'cursor': this.permit.match ? 'pointer' : 'initial'
                },
                on: {
                  click: () => {
                    this.matchingSku(row);
                  }
                }
              }, '未匹配');
            }
            return h('div', {}, '已匹配');
          }
        },
        // LAPA商品属性
        spec: {
          title: 'LAPA商品属性',
          key: 'spec',
          align: 'center',
          minWidth: 120
        },
        // 标签链接
        labelUrl: {
          title: '标签链接',
          key: 'labelUrl',
          align: 'center',
          minWidth: 120,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.labelUrl)) return h('div', '');
            const pdfName = row.labelUrl.substring(row.labelUrl.lastIndexOf('/') + 1, row.labelUrl.length);
            return h('div', {
              style: {
                'color': '#2d8cf0',
                'text-decoration': 'underline',
                'cursor': 'pointer'
              },
              on: {
                click: () => {
                  this.$common.previewFile({ url: `/product-service${this.$common.fileBase}${row.labelUrl}`, type: 'pdf' }).then(res => {
                    if (!this.$common.isEmpty(res)) return;
                    this.$Message.error('获取文件失败，无法预览');
                  });
                }
              }
            }, pdfName);
          }
        },
        // 操作
        operate: {
          title: '操作',
          key: 'operate',
          align: 'center',
          // fixed: 'right',
          width: 200,
          render: (h, { row }) => {
            let item = [];
            if (!['shein'].includes(this.lowerCasePlatformId) && this.permit.syncUpdate && [0, '0'].includes(row.source)) {
              item.push(h('span', {
                style: {
                  display: 'inline-block',
                  padding: '5px 0',
                  color: '#2d8cf0',
                  'cursor': 'pointer'
                },
                on: {
                  click: () => {
                    this.updateOperate(row);
                  }
                }
              }, '同步更新'));
            }
            if ([1, '1'].includes(row.source)) {
              if (this.permit.edit) {
                item.push(h('span', {
                  style: {
                    display: 'inline-block',
                    padding: '5px 0',
                    'margin-left': '5px',
                    color: '#2d8cf0',
                    'cursor': 'pointer'
                  },
                  on: {
                    click: () => {
                      this.eidtRow(row);
                    }
                  }
                }, '编辑'));
              }
              if (this.permit.delte) {
                item.push(h('span', {
                  style: {
                    display: 'inline-block',
                    padding: '5px 0',
                    'margin-left': '5px',
                    color: '#f20',
                    'cursor': 'pointer'
                  },
                  on: {
                    click: () => {
                      this.deleteRow(row);
                    }
                  }
                }, '删除'));
              }
            }
            if (this.permit.print) {
              item.push(h('span', {
                style: {
                  display: 'inline-block',
                  padding: '5px 0',
                  'margin-left': '5px',
                  color: '#2d8cf0',
                  'cursor': 'pointer'
                },
                on: {
                  click: () => {
                    this.printTag(row, 'download');
                  }
                }
              }, '下载标签'));
            }
            // if (this.permit.download) {
            //   item.push(h('span', {
            //     style: {
            //       display: 'inline-block',
            //       padding: '5px 0',
            //       'margin-left': '5px',
            //       color: '#2d8cf0',
            //       'cursor': 'pointer'
            //     },
            //     on: {
            //       click: () => {
            //         this.printTag(row, 'download');
            //       }
            //     }
            //   }, '下载标签'));
            // }
            return h('div', item);
          }
        }
      },
      tableColumn: {},
      acturalPlatformIdList: {},
    };
  },
  watch: {},
  computed: {
    // 权限
    permit () {
      let isAccountId = (!this.$common.isEmpty(this.filterParams[this.platformId]) && !this.$common.isEmpty(this.filterParams[this.platformId].saleAccountId));
      let selectAccount = {};
      let isSyncAccount = 'init';
      if (isAccountId) {
        selectAccount = (this.accountDataList[this.platformId] || []).find(item => {
          return item.saleAccountId == this.filterParams[this.platformId].saleAccountId;
        })
      }
      if (!this.$common.isEmpty(selectAccount) && !this.$common.isEmpty(selectAccount.source)) {
        // 0 为同步 1为导入
        isSyncAccount = [0, '0'].includes(selectAccount.source) ? 'sync' : 'leadIn';
      }
      return {
        // 列表数据查询权限
        query: this.getPermission('thirdPartyTag_pageList'),
        // 导出权限
        export: this.getPermission('thirdPartyTag_export'),
        // 同步更新权限
        syncUpdate: ['sync'].includes(isSyncAccount) && this.getPermission('thirdPartyTag_syncUpdate'),
        // 导入权限
        leadIn: (['leadIn'].includes(isSyncAccount) && this.getPermission('thirdPartyTag_import')),
        // 编辑权限
        edit: this.getPermission('thirdPartyTag_edit'),
        // 删除权限
        delte: this.getPermission('thirdPartyTag_delete'),
        // 打印标签权限
        print: this.getPermission('thirdPartyTag_printLabel'),
        // 匹配
        match: this.getPermission('thirdPartyTag_match'),
        // 下载标签
        download: this.getPermission('thirdPartyTag_downloadLabel'),
      }
    },
    // 列表高度
    tableHeight() {
      return this.getTableHeight(310);
    },
    // 平台 ID 小写
    lowerCasePlatformId() {
      if (this.$common.isEmpty(this.platformId)) return '';
      if (this.$common.isNumber(this.platformId)) return this.platformId;
      if (this.$common.isObject(this.platformId)) return (JSON.stringify(this.platformId)).toLocaleLowerCase();
      return this.platformId.toLocaleLowerCase();
    },
    // 搜索条件是否可视
    paramItemVisible() {
      let isVisible = {}
      let matchingKey = sonstant.paramItemKey[this.lowerCasePlatformId];
      if (this.$common.isEmpty(matchingKey)) {
        matchingKey = sonstant.paramItemKey.default;
      }
      Object.keys(sonstant.pageParams).forEach(key => {
        isVisible[key] = matchingKey.includes(key);
      })
      return isVisible;
    },
    // 平台id
    acturalPlatformId() {
      let item = this.acturalPlatformIdList[this.platformId] || {};
      return item.platformId;
    },
  },
  created() {
    this.initPage();
  },
  methods: {
    productSkcLabel() {
      let label = '款式编码';
      const lowerCasePlatformId = this.lowerCasePlatformId;
      if (['shein'].includes(lowerCasePlatformId)) label = '平台SKC';
      if (['tiktok'].includes(lowerCasePlatformId)) label = '平台款号';
      return label;
    },
    // 初始页面数据
    initPage() {
      this.initDataLoading = true;
      this.getPlatformList('init').then((res) => {
        this.$common.promiseAll([
          () => {
            return this.getAccountList();
          }
        ]).then((resArr) => {
          // console.log(resArr);
        }).finally(() => {
          this.initDataLoading = false;
        })
      })
    },
    // 获取平台
    getPlatformList(type) {
      return new Promise((resolve) => {
        this.axios.get(api.queryPlatformId).then(res => {
          if (!res.data || res.data.code != 0 || this.$common.isEmpty(res.data.datas)) return resolve([]);
          let arr = res.data.datas || [];// 他哥的，又整个名字不一样的出来，结构变，要改
          let obj = {};
          arr.forEach(k => {
            obj[k.platformName] = k;
          })
          this.acturalPlatformIdList = obj;
          let list = Object.keys(this.acturalPlatformIdList);

          this.platformId = list[0];
          this.tabsData = list.map((item) => {
            if (type == 'init') {
              // 设置对应平台的初始值
              this.$set(this.filterParams, item, this.$common.copy(sonstant.pageParams));
              this.$set(this.tableColumn, item, this.getTableCol(item));
              this.$set(this.tableData, item, []);
              this.$set(this.pageTool, item, {
                pageArray: [10, 20, 50, 100, 500],
                total: 0, // 总记录数
              });
            }
            return { label: item, value: item }
          })
          resolve(res.data.datas);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 获取对应平台下有权限的店铺
    getAccountList(type) {
      return new Promise((resolve) => {
        // if (!this.$common.isUndefined(this.accountDataList[this.platformId])) return;
        if (!this.$common.isEmpty(this.accountDataList[this.platformId])) return;
        this.axios.get(`${api.queryAccountByPlatformId}?platformId=${this.acturalPlatformId}`).then(res => {
          if (!res.data || res.data.code != 0 || this.$common.isEmpty(res.data.datas)) {
            this.$set(this.accountDataList, this.platformId, []);
            this.filterParams[this.platformId].saleAccountId = '';
            return resolve([]);
          }
          if (this.$common.isEmpty(this.filterParams[this.platformId].saleAccountId)) {
            this.filterParams[this.platformId].saleAccountId = res.data.datas[0].saleAccountId;
          }
          this.$set(this.accountDataList, this.platformId, res.data.datas);
          resolve(res.data.datas);
        }).catch(() => {
          this.$set(this.accountDataList, this.platformId, []);
          this.filterParams[this.platformId].saleAccountId = '';
          resolve([]);
        })
      })
    },
    // 处理对应平台表格列
    getTableCol(key = 'default') {
      const nKey = key.toLocaleLowerCase();
      let col = [];
      (sonstant.tableColKey[nKey] || []).forEach(colKey => {
        if (!this.$common.isEmpty(this.tableColObj[colKey])) {
          col.push(this.tableColObj[colKey]);
        }
      })
      return col;
    },
    // 返回搜索条件
    getSearchParams() {
      let param = this.$common.copy(this.filterParams[this.platformId]);
      param.platformId = this.platformId;
      const selectModel = this.buttonGroupModel.find(fin => {
        return fin.selected
      })
      param.orderBy = selectModel.type;
      param.descOrAsc = selectModel.status ? 'asc' : 'desc';

      Object.keys(param).forEach(key => {
        if (!sonstant.publicParamKeys.includes(key) && !this.paramItemVisible[key]) {
          delete param[key];
        }
      })
      return param;
    },
    // 列表搜索
    searchTable(type = false) {
      if (!this.permit.query) return this.$Message.error('您暂无权限查看');
      const param = this.getSearchParams();
      this.$set(this.queryParam, param.platformId, param);
      if (this.tableLoading) return;
      this.tableLoading = true;
      if (type) {
        this.filterParams[this.platformId].pageNum = 1;
      }
      this.tableData[this.platformId] = [];
      this.$set(this.selectedRows, this.platformId, []);
      if (this.$common.isEmpty(param.saleAccountId)) {
        this.$nextTick(() => {
          setTimeout(() => {
            this.tableLoading = false;
          }, 200)
        });
        this.getAccountList().then(res => {
          if (this.$common.isEmpty(res)) return this.$Message.error('暂无店铺数据');
        })
        return;
      }
      this.axios.post(api.thirdQueryPage, this.getSearchParams()).then(res => {
        if (!res.data || res.data.code != 0) {
          this.pageTool[this.platformId].total = 0;
          return;
        }
        let newList = [];
        let itemInfo = {};
        let spanRows = null;
        (res.data.datas.list || []).forEach(item => {
          itemInfo = this.$common.copy(item);
          delete itemInfo.queryThirdPartyTagDetailVOList;
          if (!this.$common.isEmpty(item.queryThirdPartyTagDetailVOList)) {
            spanRows = item.queryThirdPartyTagDetailVOList.length;
            item.queryThirdPartyTagDetailVOList.forEach((row, index) => {
              row.imageUrl = this.$common.isEmpty(row.imageUrl) ? itemInfo.imageUrl : row.imageUrl;
              itemInfo = {
                ...itemInfo,
                ...row,
                platformId: param.platformId,
                saleAccountId: param.saleAccountId,
              };
              if (index === 0) {
                itemInfo.spanRows = spanRows;
              } else {
                itemInfo.spanRows = null;
              }
              newList.push(itemInfo);
            })
          } else {
            newList.push({ ...itemInfo, spanRows: 1 });
          }
        })
        this.tableData[param.platformId] = newList;
        this.pageTool[param.platformId].total = res.data.datas.total;
      }).catch(() => {
        this.pageTool[param.platformId].total = 0;
      }).finally(() => {
        this.tableLoading = false;
      })
    },
    // 表格行列合并处理
    tableSpanHandle({ row, column, rowIndex, columnIndex }) {
      if (columnIndex == 0 || columnIndex == 1) {
        return { rowspan: this.$common.isEmpty(row.spanRows) ? 0 : row.spanRows, colspan: 1 };
      }
      return { rowspan: 1, colspan: 1 };
    },
    // 搜索条件重置
    searchReset() {
      this.$refs.searchFormRef && this.$refs.searchFormRef.resetFields();
      this.$nextTick(() => {
        if (this.$common.isEmpty(this.accountDataList[this.platformId])) return;
        if (this.filterParams[this.platformId].saleAccountId != this.accountDataList[this.platformId][0].saleAccountId) {
          this.filterParams[this.platformId].saleAccountId = this.accountDataList[this.platformId][0].saleAccountId;
        }
      })
    },
    // 店铺改变
    saleAccountChange(val) {
      setTimeout(() => {
        if (this.queryParam[this.platformId] && (this.queryParam[this.platformId].saleAccountId == this.filterParams[this.platformId].saleAccountId)) return;
        this.searchTable(true);
      }, 300)
    },
    // 标签切换
    changeTabType(value) {
      this.platformId = value;
      this.$nextTick(() => {
        this.getAccountList();
      })
    },
    // table获取所选值
    getSelectValue(value) {
      const allKey = this.$common.arrRemoveRepeat(value.map(m => m.productSkcId));
      const rows = this.tableData[this.platformId].filter(row => {
        return allKey.includes(row.productSkcId);
      })
      this.$set(this.selectedRows, this.platformId, rows);
    },
    // 排序处理
    modifyTheSort(index) {
      this.filterParams[this.platformId].orderBy = this.buttonGroupModel[index].type;
      this.buttonGroupModel.forEach((n, i) => {
        if (i === index && n.selected) {
          this.buttonGroupModel[index].status = !this.buttonGroupModel[index].status;
        } else if (i === index && !n.selected) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
      this.$nextTick(() => {
        this.searchTable();
      })
    },
    // 导出
    exportExcel(str) {
      if (!['check', 'all'].includes(str)) return;
      let exportParam = {};
      if (str == 'check') {
        if (this.$common.isEmpty(this.selectedRows[this.platformId])) return this.$Message.error('请选择需要导出的数据');
        exportParam.saleAccountId = this.queryParam[this.platformId].saleAccountId;
        exportParam.platformId = this.platformId;
        exportParam.productSkcIdList = this.$common.arrRemoveRepeat(this.selectedRows[this.platformId].map(m => {
          return m.productSkcId
        }))
      } else {
        exportParam = this.getSearchParams();
      }
      this.exportLoading = true;
      this.axios.post(api.thirdExport, exportParam).then(res => {
        if (!res.data || res.data.code != 0) return;
        this.$Message.success(`已生成导出任务，任务编号：${res.data.datas}`);
      })
    },
    // 同步更新操作
    updateOperate(row = {}) {
      if (!this.permit.syncUpdate) return;
      let text = '';
      if (this.$common.isEmpty(row)) {
        if (this.$common.isEmpty(this.filterParams[this.platformId]) || this.$common.isEmpty(this.filterParams[this.platformId].saleAccountId)) {
          this.$Message.error('请选择店铺后再做此操作');
          return;
        }
        const selectAccount = this.accountDataList[this.platformId].find(fin => {
          return fin.saleAccountId === this.filterParams[this.platformId].saleAccountId
        })
        if (this.$common.isEmpty(selectAccount)) return this.$Message.error('未匹配到对应的店铺');
        text = selectAccount.account;
      } else {
        text = row.platformSku
      }
      this.$Modal.confirm({
        title: '操作提示',
        content: `<div>请确认是否更新商品标签数据，${this.$common.isEmpty(row) ? '店铺' : '平台SKU'}：<span style="color:#f60;">${text}</span></div>`,
        okText: '确认',
        cancelText: '取消',
        width: 600,
        loading: true,
        onOk: () => {
          let param = { platformId: this.platformId };
          if (this.$common.isEmpty(row)) {
            param.saleAccountId = this.filterParams[this.platformId].saleAccountId;
          } else {
            if (this.$common.isEmpty(row.platformSku)) return this.$Message.error('获取不到平台SKU');
            param.saleAccountId = row.saleAccountId;
            param.platformSkuList = [row.platformSku];
          }
          this.axios.post(api.thirdSync, param).then(res => {
            if (!res.data || res.data.code != 0) return;
            this.$Message.success('操作成功');
            this.searchTable();
          }).finally(() => {
            this.$Modal.remove();
          })
        }
      })
    },
    // 编辑
    eidtRow(row = {}) {
      if (!this.permit.edit) return;
      this.editModuleData = this.$common.copy(Object.assign({ platformId: this.platformId }, row));
      this.$nextTick(() => {
        this.editModelVisible = true;
      })
    },
    // 删除行
    deleteRow(row = {}) {
      if (!this.permit.delte) return;
      this.$Modal.confirm({
        title: '操作提示',
        content: `<div>请确认是否删除，平台SKU'：<span style="color:#f60;">${row.platformSku}</span></div>`,
        okText: '确认',
        cancelText: '取消',
        width: 600,
        onOk: () => {
          this.axios.post(api.thirdDelete, {
            saleAccountId: row.saleAccountId,
            platformSkuList: [row.platformSku]
          }).then(res => {
            if (!res.data || res.data.code != 0) return;
            this.$Message.success('操作成功');
            this.searchTable();
          })
        }
      });
    },
    // 打开导入弹窗
    openImportModal() {
      if (!this.permit.leadIn) return;
      this.importModuleData = {
        platformId: this.platformId,
        saleAccountId: this.filterParams[this.platformId].saleAccountId
      };
      this.$nextTick(() => {
        this.importModelVisible = true;
      })
    },
    // 打印标签弹窗
    printTag(row = {}, type = 'print') {
      if (!this.permit.print) return;
      this.printModuleData = this.$common.copy(Object.assign({}, row, { countryName: 'CHINA' }));
      if (['tiktok'].includes(this.lowerCasePlatformId) && type != 'download') {
        this.printModuleData.skuSpecName = `${this.printModuleData.skcSpecName}-${this.printModuleData.skuSpecName}`;
        this.printModuleData.producing = 'MADE IN CHINA';
        this.printModuleData.extCode = `货号：${this.printModuleData.extCode || ''}`;
      }
      this.printModuleData.isDownload = type == 'download';
      this.$nextTick(() => {
        this.printModelVisible = true;
      })
    },
    // 匹配 LAPA SKU
    matchingSku(row = {}) {
      if (!this.permit.match) return;
      let extCode = row.extCode;
      // let isDisabled = false;
      this.$Modal.confirm({
        title: '操作提示',
        // content: `<div>请确认是否匹配LAPA SKU，客户SKU：<span style="color:#f60;">${row.extCode}</span></div>`,
        okText: '确认',
        cancelText: '取消',
        loading: true,
        width: 600,
        render: (h) => {
          // if (['shein'].includes(this.lowerCasePlatformId)) {
          //   return h('div', {}, [
          //     h('span', {}, '请确认是否匹配LAPA SKU：'),
          //     h('Input', {
          //       style: {
          //         width: '200px'
          //       },
          //       props: {
          //         disabled: isDisabled,
          //         value: extCode,
          //         autofocus: true,
          //         placeholder: '请输入LAPA SKU'
          //       },
          //       on: {
          //         input: (val) => {
          //           extCode = val;
          //         }
          //       }
          //     })
          //   ])
          // }
          return h('div', {}, [
            h('span', {}, ['shein', 'tiktok'].includes(this.lowerCasePlatformId) ? '请确认是否匹配LAPA SKU：' : '请确认是否匹配LAPA SKU，客户SKU：'),
            h('span', { style: { color: '#f60' } }, row.extCode)
          ])
        },
        onOk: () => {
          // isDisabled = true;
          this.axios.get(api.thirdMatch, {
            params: {
              saleAccountId: row.saleAccountId,
              platformSku: row.platformSku,
              platformId: this.platformId,
              extCode: extCode
            }
          }).then(res => {
            if (!res.data || res.data.code != 0) return;
            this.$Message.success('操作成功');
            this.searchTable();
          }).finally(() => {
            // isDisabled = false;
            this.$Modal.remove();
          })
        }
      });
    },
    // 分页切换
    pageNumChange(page) {
      this.filterParams[this.platformId].pageNum = page;
      this.$nextTick(() => {
        this.searchTable();
      })
    },
    // 页码改变
    pageSizeChange(pageSize, plat) {
      this.filterParams[this.platformId].pageSize = pageSize;
      this.$nextTick(() => {
        this.searchTable();
      })
    },
  }
};
</script>
<style lang="less" scoped>
.thirdpartyTagManage {
  position: relative;

  :deep(.ivu-tabs) {
    .ivu-tabs-bar {
      margin-bottom: 0;
    }
  }

  :deep(.ivu-spin-fix) {
    z-index: 9999999;
  }

  .orderTable {
    position: relative;

    .order-table-contet {
      position: absolute;
      top: 0;
      width: 100%;
      z-index: 1;

      &.unviewable {
        z-index: -10;
      }
    }
  }

  .table-page {
    position: fixed;
    bottom: 0;
    right: 0;
    margin: 0;
    padding: 10px;
    z-index: 2;

    .table-page-right {
      float: none;
      display: inline-block;
      padding: 0;
    }
  }

  .addBrand-txt-tips {
    display: inline-block;
    padding: 5px 10px;
    border: 1px solid #7bd3ff;
    background: #e6f7ff;
    border-radius: 5px;
  }

  .addBrand {
    display: flex;

    .table-top-btn {
      flex: 100;

      >* {
        margin-left: 10px;

        &:first-child {
          margin: 0;
        }
      }
    }

    .dataSort {
      display: inline-block;
      padding: 0;
      margin: 0;
      background: none;
      border: none;
    }
  }
}
</style>
