<template>
  <div class="page-content-body">
    <Tabs v-model="pageState">
      <TabPane v-for="(tab, tIndex) in tabList" :label="tabPaneLabel(tab)" :name="tab.name" :key="`tab-${tIndex}`" />
    </Tabs>
    <div class="page-content-content">
      <Form ref="searchForm" class="search-form searchMain" :model="pageParams" :label-width="90">
        <dyt-filter ref="dytFilter" :filter-row="1">
          <Form-item label="出库单编号" prop="pickingNoList">
            <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.pickingNoList"
              placeholder="请输入出库单号，多个请用逗号或回车分隔" />
          </Form-item>
          <Form-item label="拣货单号" prop="pickingGoodsNoList">
            <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.pickingGoodsNoList"
              placeholder="请输入拣货单号，多个请用逗号或回车分隔" />
          </Form-item>
          <Form-item label="创建时间" prop="createTime">
            <DatePicker type="datetimerange" transfer placeholder="请选择创建" v-model="pageParams.createTime"
              :options="datePickerOptions" format="yyyy-MM-dd HH:mm:ss"
              @on-change="datePickerValChange($event, 'create')" />
          </Form-item>
          <Form-item label="借用人" prop="borrowUserList">
            <dyt-select v-model="pageParams.borrowUserList" :multiple="true" :max-tag-count="1" placeholder="请选择借用人">
              <Option v-for="(item, index) in userListData" :value='item.userId' :label="item.userName"
                :key="`user-${index}`" />
            </dyt-select>
          </Form-item>
          <Form-item label="借用事业部" prop="borrowDeptIdList">
            <dyt-select v-model="pageParams.borrowDeptIdList" :multiple="true" :max-tag-count="1" placeholder="请选择事业部">
              <Option v-for="(item, index) in allBusinessDept" :value='item.id' :label="item.name"
                :key="`dept-${index}`" />
            </dyt-select>
          </Form-item>
          <Form-item label="收货方式" prop="shippingMethod">
            <dyt-select v-model="pageParams.shippingMethod" placeholder="请选择收货方式">
              <Option :value='0' label="发快递" />
              <Option :value='1' label="自提" />
            </dyt-select>
          </Form-item>
          <Form-item label="是否归还" prop="returnGoods">
            <dyt-select v-model="pageParams.returnGoods" placeholder="请选择">
              <Option :value='0' label="不归还" />
              <Option :value='1' label="归还" />
            </dyt-select>
          </Form-item>
          <Form-item label="商品SKU" prop="skuList">
            <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.skuList"
              placeholder="请输入商品SKU，多个请用逗号或回车分隔" />
          </Form-item>
          <Form-item label="拣货状态" prop="pickingGoodsStatus">
            <dyt-select v-model="pageParams.pickingGoodsStatus" placeholder="请选择状态">
              <Option v-for="(item, index) in pickingGoodsList" :value='item.value' :label="item.label"
                :key="`pick-${index}`" />
            </dyt-select>
          </Form-item>
          <Form-item label="归还入库单号" prop="returnReceiptNoList">
            <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.returnReceiptNoList"
              placeholder="请输入归还入库单号，多个请用逗号或回车分隔" />
          </Form-item>
          <Form-item label="入库单状态" prop="receiptStatus">
            <dyt-select v-model="pageParams.receiptStatus" placeholder="请选择状态">
              <Option v-for="(item, index) in receiptDataList" :value='item.value' :label="item.label"
                :key="`receipt-${index}`" />
            </dyt-select>
          </Form-item>
          <Form-item label="应还时间" prop="giveBackTime">
            <DatePicker type="datetimerange" transfer placeholder="选择日期" v-model="pageParams.giveBackTime"
              :options="datePickerOptions" format="yyyy-MM-dd HH:mm:ss" />
          </Form-item>
          <Form-item label="归还状态" prop="returnStatusList">
            <dyt-select v-model="pageParams.returnStatusList" :multiple="true" :max-tag-count="1" placeholder="请选择状态">
              <Option v-for="(item, index) in returnDataList" :value='item.value' :label="item.label"
                :key="`return-${index}`" />你
            </dyt-select>
          </Form-item>
          <Form-item label="创建人" prop="createdByList">
            <dyt-select v-model="pageParams.createdByList" :multiple="true" :max-tag-count="1" placeholder="请选择状态">
              <Option v-for="(item, index) in userListData" :value='item.userId' :label="item.userName"
                :key="`create-${index}`" />
            </dyt-select>
          </Form-item>
          <Form-item label="借出时间" prop="lendTime">
            <DatePicker type="datetimerange" transfer placeholder="选择日期" v-model="pageParams.lendTime"
              :options="datePickerOptions" format="yyyy-MM-dd HH:mm:ss" />
          </Form-item>
          <Form-item label="快递信息" prop="deliveryInfo">
            <dyt-input v-model.trim="pageParams.deliveryInfo" placeholder="模糊匹配" />
          </Form-item>
          <div slot="operation">
            <Button type="primary" @click="searchTable(true)" icon="md-search">查询</Button>
            <Button class="ml10" @click="resetSearch" icon="md-refresh">重置</Button>
          </div>
        </dyt-filter>
      </Form>
      <div class="operate-button">
        <div class="operate-left">
          <Button type="primary" @click="openEditVisible({}, 'add')" v-if="permission.add">创建出库单</Button>
          <Button class="ml10" type="primary" v-if="permission.import" @click="openInportModal">导入出库单</Button>
          <Dropdown @on-click="batchOperate" class="ml10" v-if="['all', 'create'].includes(pageState)">
            <Button type="primary">
              批量操作
              <Icon type="md-arrow-dropdown"></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem name="batchApportion"
                v-if="['all', 'create'].includes(pageState) && permission.batchAllocated">批量分配</DropdownItem>
              <!-- <DropdownItem name="batchFreeze" v-if="['all', 'create'].includes(pageState)">冻结分配</DropdownItem>
              <DropdownItem name="batchDelete" v-if="['all', 'create'].includes(pageState)">删除</DropdownItem> -->
            </DropdownMenu>
          </Dropdown>
          <Button class="ml10" type="primary" @click="createPickNo([], 'batch')"
            v-if="['all', 'picking'].includes(pageState) && permission.createPickin">生成拣货单</Button>
          <Dropdown @on-click="batchOperate" class="ml10" v-if="permission.export">
            <Button type="primary">
              导出
              <Icon type="md-arrow-dropdown"></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem name="exportCheck">导出选中</DropdownItem>
              <DropdownItem name="exportAll">导出所有</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div class="operate-right">
          <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch(arguments)" />
        </div>
      </div>
      <div class="mt15 page-content-table" v-for="(tab, tIndex) in tabList" :key="`list-${tIndex}`"
        :class="{ 'active-table': pageState == tab.name }">
        <Table v-if="tableJson[tab.name]" highlight-row :loading="tableLoading" border :height="tableHeight"
          :columns="tableColumn" :data="(tableJson[tab.name] || [])" @on-selection-change="tableCheckChange" />
        <div class="mt5 page-content-page">
          <Page v-if="pageJson[tab.name]" :total="pageJson[tab.name].total" show-total
            :page-size="pageJson[tab.name].pageSize" show-elevator :current="pageJson[tab.name].pageNum || 1" show-sizer
            @on-page-size-change="pageSizeChange" @on-change="changePageNum" placement="top"
            :page-size-opts="pageArray" />
        </div>
      </div>
    </div>
    <!-- 详情页面 -->
    <lendSampleDetails v-if="detailsPageVisible" :modal-visible.sync="detailsPageVisible" :module-data="detailsPageInfo"
      @updateList="searchTable" />
    <!--生成拣货单-->
    <div v-if="createPickListModel">
      <Modal class="create-pick-modal" style="width: 600px" v-model="createPickListModel" title="生成拣货单">
        <createPickList :apiParams="createPickingData" :apiCondition="searchParams" type="lendSample" createType="select"
          @closeSuccess="closeSuccess" />
      </Modal>
    </div>
    <!-- 导入前的模态框 -->
    <importFile :model-visible.sync="switchInportModal" :module-data="switchInportData" @uploadSuccess="searchTable" />
    <Spin fix v-if="pageLoading"></Spin>
  </div>
</template>
<script>
import api from '@/api/api';
import { getWarehouseId } from "@/utils/getService";
import Mixin from '@/components/mixin/common_mixin';
import createPickList from '@/views/wms/components/exWarehouse/createPickList';
import lendSampleDetails from '@/views/wms/stockOUt/otherStouck/components/lendSampleDetails.vue';
import importFile from '@/views/wms/stockOUt/otherStouck/components/importFile';
import { pageTabData, statusOperate } from '@/views/wms/stockOUt/otherStouck/components/lendSampleData.js';
// // lend 借出 createPicking 生成拣货单 audit 审核 distribute 分配库存 view 查看 add 添加 edit 编辑
// const pageTabData = [
//   { label: '全部', name: 'all', key: 'all', total: null, val: null, index: -1 },
//   { label: '订单创建', name: 'create', key: 'orderCreate', total: null, val: ['0', '1'], index: 0 },
//   { label: '待审核', name: 'audit', key: 'orderReviewed', total: null, val: ['2'], index: 1 },
//   { label: '待拣货', name: 'picking', key: 'orderPicking', total: null, val: ['9', '13', '20'], index: 2 },
//   { label: '待借出', name: 'lend', key: 'orderBorrow', total: null, val: ['10'], index: 3 },
//   { label: '待归还', name: 'giveBack', key: 'orderReturn', total: null, val: ['21'], index: 4 },
//   { label: '已完成', name: 'finish', key: 'orderFinish', total: null, val: ['22'], index: 5 },
// ];
// // 对应状态的操作
// const statusOperate = [
//   { label: '分配库存', status: ['0', '1'], operate: 'distribute', key: 'allocated', power: (permission, key) => { return permission[key] } },
//   { label: '审核', status: ['2'], operate: 'audit', key: 'audit', power: (permission, key) => { return permission[key] } },
//   { label: '生成拣货单', status: ['20'], operate: 'createPicking', key: 'createPickin', power: (permission, key) => { return permission[key] } },
//   { label: '借出', status: ['10'], operate: 'lend', key: 'product', power: (permission, key) => { return permission[key] } },
//   { label: '查看', status: ['21'], operate: 'view', key: 'view', power: (permission, key) => { return permission[key] } },
//   { label: '查看', status: ['22'], operate: 'view', key: 'view', power: (permission, key) => { return permission[key] } }
// ]

export default {
  mixins: [Mixin],
  name: 'lendSampleStock',
  components: {
    lendSampleDetails,
    createPickList,
    importFile
  },
  data() {
    return {
      pageState: pageTabData[0].name,
      tableLoading: false,
      detailsPageVisible: false,
      switchInportModal: false,
      pageLoading: false,
      createPickListModel: false,
      storeAccountList: [],
      searchParams: {},
      switchInportData: {
        templateUrl: '/wms-service/template/JYPicking.xlsx',
        uploadUrl: `${api.lendSampleImportPicking || ''}/${this.$store.state.warehouseId || getWarehouseId()}`,
        title: '导入数据',
        fileName: 'excelFile',
        otherData: {},
        accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel',
        method: 'post',
      },
      detailsPageInfo: {
        warehouseId: '',
        tableRow: {},
        statusOperate: statusOperate,
        stateData: pageTabData.filter(item => item.name != 'all'),
      },
      tabList: pageTabData,
      tableJson: {},
      selectTableData: {},
      pageJson: {},
      returnDataList: [
        { value: '0', label: '未归还', color: '#f20' },
        { value: '1', label: '部分归还', color: '#f60' },
        { value: '2', label: '全部归还', color: '#da00ff' }
      ],
      pickingGoodsList: [
        { value: '0', label: '未拣货', color: '#f20' },
        { value: '1', label: '已拣货', color: '#f60' },
        { value: '2', label: '未生成', color: '#da00ff' }
      ],
      receiptDataList: [
        { value: '0', label: '入库单创建' },
        { value: '2', label: '入库单关闭' },
        { value: '3', label: '收货中' }
      ],
      pageConfig: {
        // DESC 降序 ASC 升序
        orderSeq: 'DESC',
        // CT 按创建时间
        orderBy: 'CT',
        pageNum: 1,
        pageSize: 20,
        total: 0
      },
      sortButtonList: [
        {
          sortHeader: "按创建时间",
          sortField: "CT",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "按借出时间",
          sortField: "LT",
          sortType: "DESC",
        },
      ],
      pageParams: {
        pickingTypeList: ['J1'],
        pickingStatusList: null,
        pickingNoList: [],
        pickingGoodsNoList: [],
        borrowUserList: [],
        shippingMethod: null,
        returnGoods: null,
        skuList: [],
        pickingGoodsStatus: null,
        returnReceiptNoList: [],
        receiptStatus: null,
        returnStatusList: [],
        createdByList: [],
        createTime: [],
        giveBackTime: [],
        borrowDeptIdList: [],
        lendTime: [],
        deliveryInfo: null,
      },
      timeJson: {
        create: {}
      },
      tableColumn: [
        {
          type: "selection",
          width: 50,
          fixed: 'left',
          align: "center",
        },
        {
          title: '借样出库单',
          key: 'name',
          align: 'center',
          minWidth: 200,
          render: (h, { row }) => {
            let item = [
              h('div', {}, [
                h('span', {}, '单号：'),
                h('span', {
                  class: 'demo-underline',
                  on: {
                    click: () => {
                      if (!this.permission.view) return;
                      this.openEditVisible(row, 'view');
                    }
                  }
                }, row.pickingNo),
              ])
            ];
            if (!this.$common.isEmpty(row.pickingStatus)) {
              const tabInfo = this.tabList.find(tab => tab.val && tab.val.includes(row.pickingStatus));
              if (!this.$common.isEmpty(tabInfo)) {
                item.push(h('span', {
                  attrs: {
                    title: '出库单状态'
                  },
                  style: {
                    'display': 'inline-block',
                    'padding': '2px 5px',
                    'margin-top': '5px',
                    'background': '#e6fff5',
                    'color': '#46b503',
                    'border-radius': '4px'
                  }
                }, tabInfo.label));
              }
            }
            if (!this.$common.isEmpty(row.shippingMethod)) {
              item.push(h('span', {
                attrs: {
                  title: '收货方式'
                },
                style: {
                  'display': 'inline-block',
                  'padding': '2px 5px',
                  'margin-top': '5px',
                  'margin-left': '5px',
                  'background': '#e6f6ff',
                  'color': '#00547d',
                  'border-radius': '4px'
                }
              }, row.shippingMethod == 0 ? '发快递' : '自提'));
            }

            if (!this.$common.isEmpty(row.returnStatus)) {
              const returnInfo = this.returnDataList.find(item => item.value == row.returnStatus);
              if (this.$common.isEmpty(returnInfo)) return h('span', '');
              item.push(h('span', {
                attrs: {
                  title: '归还状态'
                },
                style: {
                  'display': 'inline-block',
                  'padding': '2px 5px',
                  'margin-top': '5px',
                  'margin-left': '5px',
                  'background': '#e9e9e9',
                  'color': returnInfo.color,
                  'border-radius': '4px'
                }
              }, returnInfo.label));
            }
            return h('div', {
              class: 'text-center-left',
            }, item);
          }
        },
        {
          title: '操作',
          width: 95,
          key: 'operate',
          align: 'center',
          render: (h, { row }) => {
            if (!this.$common.isEmpty(row.pickingStatus)) {
              const pickingStatus = Number(row.pickingStatus);
              const operateInfo = statusOperate.find(item => item.status.includes(row.pickingStatus));
              if (this.$common.isEmpty(operateInfo)) return h('span', '');
              const power = operateInfo.power(this.permission, operateInfo.key);
              if (!power) return h('span', '');
              if ([20].includes(pickingStatus)) {
                if (this.$common.isEmpty(row.pickingGoodsInfoMap)) {
                  return h('Button', {
                    props: {
                      type: 'info',
                      size: 'small'
                    },
                    on: {
                      click: () => {
                        this.createPickNo([row], 'single');
                      }
                    }
                  }, operateInfo.label);
                }
                return h('span', '');
              } else if (operateInfo.operate != 'view') {
                return h('Button', {
                  props: {
                    type: 'info',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.openEditVisible(row, operateInfo.operate);
                    }
                  }
                }, operateInfo.label);
              }
            }
            return h('span', '');
          }
        },
        {
          title: '借用人/事业部',
          key: 'borrowUser',
          align: 'center',
          minWidth: 100,
          render: (h, { row }) => {
            let item = [];
            if (!this.$common.isEmpty(row.borrowUser) && !this.$common.isEmpty(this.userListData[row.borrowUser])) {
              item.push(h('div', {
                attrs: {
                  title: '借用人'
                }
              }, this.userListData[row.borrowUser].userName));
            }
            if (!this.$common.isEmpty(row.borrowDeptId)) {
              const borrowDeptInfo = this.allBusinessDept.find(dept => dept.id == row.borrowDeptId);
              if (!this.$common.isEmpty(borrowDeptInfo)) {
                item.push(h('div', {
                  attrs: {
                    title: '借用人事业部'
                  }
                }, borrowDeptInfo.name));
              }
            }
            return h('div', {
              class: 'text-center-left',
            }, item);
          }
        },
        {
          title: '借用原因/备注',
          key: 'name',
          align: 'center',
          minWidth: 150,
          render: (h, { row }) => {
            return h('div', {
              class: 'text-center-left',
            }, [
              h('div', {
                attrs: {
                  title: '借用原因'
                }
              }, row.borrowReason || ''),
              h('div', {
                attrs: {
                  title: '备注'
                }
              }, row.remark || '')
            ])
          }
        },
        {
          title: '是否归还',
          key: 'returnGoods',
          align: 'center',
          width: 80,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.returnGoods)) return h('span', '');
            return h('span', {
              style: {
                color: row.returnGoods == 0 ? '#f20' : '#46b503'
              }
            }, row.returnGoods == 0 ? '不归还' : '归还');
          }
        },
        {
          title: '图片',
          key: 'productUrl',
          align: 'center',
          width: 66,
          render: (h, params) => {
            return this.tableImg(h, params, 'productUrl');
          },
        },
        {
          title: 'SKU数量',
          key: 'skuCount',
          align: 'center',
          width: 80,
        },
        {
          title: '商品数量',
          key: 'productCount',
          align: 'center',
          width: 80,
        },
        {
          title: '未归还数量',
          key: 'unReturnCount',
          align: 'center',
          width: 80,
        },
        {
          title: '未归还金额',
          key: 'unReturnAmount',
          align: 'center',
          width: 80,
        },
        {
          title: '拣货单',
          key: 'pickingGoodsInfoMap',
          align: 'center',
          width: 150,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.pickingGoodsInfoMap)) return h('div', '');
            let rowItem = [];
            let sTxtInfon = {};
            row.pickingGoodsInfoMap.forEach(item => {
              Object.keys(item).forEach(key => {
                sTxtInfon = this.pickingGoodsList.find(option => option.value == item[key]);
                rowItem.push(h('div', {}, [
                  h('div', {}, key),
                  h('div', {
                    style: {
                      'display': (this.$common.isEmpty(sTxtInfon) || this.$common.isEmpty(sTxtInfon.label)) ? 'none' : 'inline-block',
                      'padding': '2px 5px',
                      'margin-top': '5px',
                      'background': '#e6fff5',
                      'color': '#46b503',
                      'border-radius': '4px'
                    }
                  }, sTxtInfon ? sTxtInfon.label || '' : ''),
                ]));
              })
            });
            return h('div', {
              class: 'text-center-left',
            }, rowItem);
          }
        },
        {
          title: '快递信息',
          key: 'deliveryInfo',
          align: 'center',
          width: 100,
          tooltip: true,
        },
        {
          title: '归还入库',
          key: 'returnReceiptNo',
          align: 'center',
          width: 150,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.returnReceiptNo)) return h('div', '');
            const receiptInfo = this.receiptDataList.find(m => m.value == row.receiptStatus);
            let tag = [];
            if (!this.$common.isEmpty(receiptInfo)) {
              tag.push(h('span', {
                attrs: {
                  title: '收货方式'
                },
                style: {
                  'display': 'inline-block',
                  'padding': '2px 5px',
                  'margin-top': '5px',
                  'background': '#e6fff5',
                  'color': '#46b503',
                  'border-radius': '4px'
                }
              }, receiptInfo.label));
            }
            return h('div', {
              class: 'text-center-left',
            }, [
              h('div', {}, row.returnReceiptNo),
              h('div', {}, tag),
            ]);
          }
        },
        {
          title: '创建人',
          key: 'createdBy',
          align: 'center',
          width: 100,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.createdBy)) return h('span', '');
            const userInfo = this.userListData[row.createdBy];
            if (this.$common.isEmpty(userInfo)) return h('span', row.createdBy);
            return h('span', userInfo.userName);
          }
        },
        {
          align: 'center',
          width: 140,
          renderHeader: (h) => {
            return h('div', [
              h('div', '创建时间'),
              h('div', '借出时间'),
            ]);
          },
          render: (h, { row }) => {
            let createdTime = this.$common.isEmpty(row.createdTime) ? '' : this.$common.toLocaleDate(row.createdTime, 'fulltime');
            let lendTime = this.$common.isEmpty(row.lendTime) ? '' : this.$common.toLocaleDate(row.lendTime, 'fulltime');
            return h('div', [
              h('div', createdTime || '-'),
              h('div', lendTime || '-'),
            ]);
          }
        },
      ]
    };
  },
  watch: {
    pageState: {
      deep: true,
      handler(val) {
        this.$nextTick(() => {
          this.initPageStateData(val);
        })
      }
    }
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(290);
    },
    // 仓库ID
    warehouseId() {
      return this.$store.state.warehouseId || getWarehouseId();
    },
    // 所有的事业部
    allBusinessDept() {
      return this.$store.getters.getBusinessDeptList || [];
    },
    // 用户列表
    userListData() {
      return this.$store.state.userInfoList;
    },
    headObj() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    },
    // 权限
    permission() {
      return {
        // 创建
        add: this.getPermission('borrowSamplePicking_create'),
        // 编辑
        edit: this.getPermission('borrowSamplePicking_editPicking'),
        // 列表查询
        query: this.getPermission('borrowSamplePicking_queryList'),
        // 查看详情
        view: this.getPermission('borrowSamplePicking_queryDetail'),
        // 导入
        import: this.getPermission('borrowSamplePicking_importPicking'),
        // 导出
        export: this.getPermission('borrowSamplePicking_exportPicking'),
        // 借出
        product: this.getPermission('borrowSamplePicking_borrowProduct'),
        // 审核
        audit: this.getPermission('borrowSamplePicking_auditPass'),
        // 单个-分配库存
        allocated: this.getPermission('borrowSamplePicking_allocatedInventory'),
        // 批量-分配库存
        batchAllocated: this.getPermission('borrowSamplePicking_batchAllocatedInventory'),
        // 取消分配
        unallocated: this.getPermission('borrowSamplePicking_unallocatedStock'),
        // 冻结分配
        frozen: this.getPermission('borrowSamplePicking_frozenAllocated'),
        // 生成拣货单
        createPickin: this.getPermission('borrowSamplePicking_createPickingGoods'),
      }
    },
  },
  created() {
    this.tabList.forEach((tab) => {
      if (this.$common.isUndefined(this.tableJson[tab.name])) {
        this.$set(this.tableJson, tab.name, []);
        this.$set(this.selectTableData, tab.name, []);
        this.$set(this.pageJson, tab.name, this.$common.copy(this.pageConfig));
      }
    });
    this.$nextTick(() => {
      this.initPageStateData(this.pageState);
    })
  },
  mounted() { },
  methods: {
    // 初始化对应平台数据
    initPageStateData(pageState) {
      this.pageLoading = true;
      let awaitRes = [];
      this.setCreateTime(pageState);
      this.$common.promiseAll(awaitRes).finally(() => {
        this.pageLoading = false;
        this.$nextTick(() => {
          this.searchTable();
        });
      })
    },
    // 设置创建时间
    setCreateTime(pageState) {
      // if (this.$common.isEmpty(this.timeJson.create[pageState])) {
      if (['all', 'finish'].includes(pageState)) {
        this.pageParams.createTime = this.$common.getRangeDate(-7, 'fulltime');
        return;
      }
      this.pageParams.createTime = [];
      //   return;
      // }
      // this.pageParams.createTime = this.timeJson.create[pageState];
    },
    // 创建时间改变
    datePickerValChange(val, key) {
      this.$set(this.timeJson[key], this.pageState, val);
    },
    // 获取搜索条件
    getSearchParams() {
      let param = this.$common.copy(this.pageParams);
      param = { ...param, ...this.pageJson[this.pageState] };
      param.createTimeStart = null;
      param.createTimeEnd = null;
      param.shouldReturnTimeStart = null;
      param.shouldReturnTimeEnd = null;
      const tabInfo = this.tabList.find(f => f.name == this.pageState);
      param.pickingStatusList = this.$common.isEmpty(tabInfo) ? null : tabInfo.val;
      if (!this.$common.isEmpty(param.createTime)) {
        if (!this.$common.isEmpty(param.createTime[0])) {
          param.createTimeStart = this.$common.getUniversalTime(this.$common.toLocaleDate(param.createTime[0], 'fulltime', 0));
        }
        if (!this.$common.isEmpty(param.createTime[1])) {
          param.createTimeEnd = this.$common.getUniversalTime(this.$common.toLocaleDate(param.createTime[1], 'fulltime', 0));
        }
      }
      if (!this.$common.isEmpty(param.giveBackTime)) {
        if (!this.$common.isEmpty(param.giveBackTime[0])) {
          param.shouldReturnTimeStart = this.$common.getUniversalTime(this.$common.toLocaleDate(param.giveBackTime[0], 'fulltime', 0));;
        }
        if (!this.$common.isEmpty(param.giveBackTime[1])) {
          param.shouldReturnTimeEnd = this.$common.getUniversalTime(this.$common.toLocaleDate(param.giveBackTime[1], 'fulltime', 0));
        }
      }
      if (!this.$common.isEmpty(param.lendTime)) {
        if (!this.$common.isEmpty(param.lendTime[0])) {
          param.lendTimeStart = this.$common.getUniversalTime(this.$common.toLocaleDate(param.lendTime[0], 'fulltime', 0));;
        }
        if (!this.$common.isEmpty(param.lendTime[1])) {
          param.lendTimeEnd = this.$common.getUniversalTime(this.$common.toLocaleDate(param.lendTime[1], 'fulltime', 0));
        }
      }
      param.warehouseId = this.warehouseId;
      delete param.createTime;
      delete param.giveBackTime;
      delete param.total;
      delete param.lendTime;
      return param;
    },
    // 获取排序方式改变
    getSortInfoAndFetch(Info) {
      // 将所有 tab 的排序方式改变
      this.tabList.forEach((item) => {
        this.pageJson[item.name].orderSeq = Info[0] || "DESC";
        this.pageJson[item.name].orderBy = Info[1] || "CT";
      })
      this.$nextTick(() => {
        this.searchTable(true);
      })
    },
    // 查询数据
    searchTable(type) {
      if (!this.permission.query) {
        this.$Message.error('你暂无权限查看！');
        return;
      }
      if (this.tableLoading) return;
      if (type) {
        this.pageParams.pageNum = 1;
      }
      this.tableLoading = true;
      this.$common.promiseAll([
        this.getCountNumber,
      ]).finally(() => {
        let getParams = this.getSearchParams();
        this.tableJson[this.pageState] = [];
        this.selectTableData[this.pageState] = [];
        this.axios.post(api.lendSampleQueryList, getParams).then(res => {
          if (!res || !res.data || !res.data.datas || res.data.code != 0) return;
          this.tableJson[this.pageState] = (res.data.datas.list || []).map(row => {
            return { ...row, deleteLoading: false, enableLoading: false }
          });
          this.pageJson[this.pageState].total = res.data.datas.total;
        }).finally(() => {
          this.tableLoading = false;
        });
      })
    },
    // 查询数量
    getCountNumber() {
      return new Promise((resolve) => {
        this.axios.post(`${api.lendSampleQueryCount}/${this.warehouseId}`).then(res => {
          if (!res || !res.data || !res.data.datas || res.data.code != 0) return;
          this.tabList.forEach(item => {
            if (!this.$common.isUndefined(res.data.datas[item.key])) {
              item.total = res.data.datas[item.key];
            }
          });
        }).finally(() => {
          resolve({});
        })
      })
    },
    // 重置查询条件
    resetSearch() {
      this.$refs.searchForm && this.$refs.searchForm.resetFields();
      this.timeJson.create = {};
      this.$nextTick(() => {
        this.setCreateTime(this.pageState);
      });
    },
    // 标签显示修改
    tabPaneLabel(data) {
      return (h) => {
        let item = [h('span', data.label)];
        if (['all', 'orderFinish'].includes(data.key)) return h("div", item);
        if (!this.$common.isEmpty(data.total)) {
          item.push(h('span', {
            style: {
              color: '#f20',
              'margin-left': '5px',
            }
          }, `(${data.total})`));
        }
        return h("div", item);
      }
    },
    // 选择表格数据改变时
    tableCheckChange(rows) {
      this.selectTableData[this.pageState] = rows;
    },
    // 列表条数改变
    pageSizeChange(pageSize) {
      this.pageJson[this.pageState].pageSize = pageSize;
      this.$nextTick(() => {
        this.searchTable();
      })
    },
    // 页码改变
    changePageNum(page) {
      this.pageJson[this.pageState].pageNum = page;
      this.$nextTick(() => {
        this.searchTable();
      })
    },
    // 打开弹窗 lend 借出 createPicking 生成拣货单 audit 审核 distribute 分配库存 view 查看 add 添加 edit 编辑
    openEditVisible(row, type) {
      this.detailsPageInfo.tableRow = this.$common.copy(row);
      this.detailsPageInfo.warehouseId = this.warehouseId;
      this.$nextTick(() => {
        this.detailsPageVisible = true;
      })
    },
    // 批量操作
    batchOperate(name) {
      if (this.$common.isEmpty(name)) return;
      if (this[name]) {
        this[name]();
      }
    },
    // 批量分配
    batchApportion() {
      if (this.$common.isEmpty(this.selectTableData[this.pageState])) return this.$Message.error('请选择需要操作的数据');
      this.$Modal.confirm({
        title: "操作提示",
        content: "<p>确认对选中的出库单进行库存分配？</p>",
        onOk: () => {
          let temp = {
            pickingNoList: this.selectTableData[this.pageState].map((val) => val.pickingNo),
            warehouseId: this.warehouseId,
          };
          this.axios.post(api.assign_all, temp).then((res) => {
            if (!res || !res.data || res.data.code != 0) return;
            if (!this.$common.isEmpty(res.data.datas)) {
              if (res.data.datas[0].errorCode === 551001) {
                this.$Message.error('无对应库存数据,无法分配');
                return;
              }
              if (res.data.datas[0].errorCode === 553209) {
                this.$Message.error('未找到可以分配的库存，无法分配');
                return;
              }
              res.data.datas.forEach(item => {
                if (!this.$common.isEmpty(item) && !this.$common.isEmpty(item.errorMsg)) {
                  this.$Message.error(item.errorMsg);
                }
              });
              return;
            }
            this.$Message.success('操作成功');
            this.searchTable(true);
          }).finally(() => {
            this.$Modal.remove();
          });
        },
      });
    },
    // 冻结分配(不使用)
    batchFreeze() { },
    // 删除(不使用)
    batchDelete() { },
    // 打开导入弹窗
    openInportModal() {
      this.switchInportModal = true;
    },
    // 导出所有
    exportAll() {
      this.exportCheck(this.getSearchParams());
    },
    // 导出选中(导出数据)
    exportCheck(exportParams = {}) {
      let eParams = this.$common.isEmpty(exportParams) ? this.getSearchParams() : exportParams;
      delete exportParams.pageSize;
      delete exportParams.pageNum;
      if (this.$common.isEmpty(exportParams)) {
        if (this.$common.isEmpty(this.selectTableData[this.pageState])) return this.$Message.error('请选择需要操作的数据');
        eParams.pickingNoList = this.selectTableData[this.pageState].map((val) => val.pickingNo);
      }
      this.axios.post(api.lendSamplExportPicking, eParams).then((res) => {
        if (!res || !res.data || res.data.code != 0) return;
        this.$Message.success('导出成功');
      });
    },
    // 生成拣货单操作
    createPickNo(rows = [], type) {
      if (!this.permission.createPickin) return;
      let selectList = rows;
      if (type != 'single') {
        selectList = this.selectTableData[this.pageState];
        if (this.$common.isEmpty(selectList)) return this.$Message.error('请选择需要操作的数据');
      }
      let notComplete = [];
      let pickingEnd = [];
      selectList.find(item => {
        // 只有分配完成的单才能生成拣货单
        if (!this.$common.isEmpty(item.pickingStatus) && [0, 1].includes(Number(item.pickingStatus))) {
          notComplete.push(item);
        }
        // 没有拣货单编号才可以生成拣货单
        if (!this.$common.isEmpty(item.pickingGoodsInfoMap)) {
          pickingEnd.push(item);
        }
      });
      if (!this.$common.isEmpty(notComplete)) {
        this.$Message.warning({
          content: '存在分配未完成的出库单',
          duration: 5
        });
        return;
      }
      if (!this.$common.isEmpty(pickingEnd)) {
        this.$Message.warning({
          content: '存在已经生成的拣货单',
          duration: 5
        });
        return;
      }
      this.searchParams = this.getSearchParams();
      this.createPickingData = this.$common.copy(selectList);
      this.$nextTick(() => {
        this.createPickListModel = true;
      })
    },
    // 生成拣货单弹窗关闭
    closeSuccess() {
      this.createPickListModel = false;
      this.searchTable();
    },
  }
};
</script>
<style lang="less" scoped>
.page-content-body {
  position: relative;
  height: 100%;
  background: #fff;

  :deep(.ivu-tabs) {
    .ivu-tabs-bar {
      margin-bottom: 0px;
    }
  }

  .page-content-content {
    position: relative;
    padding: 14px 14px 0px 14px;
    height: calc(100% - 36px);

    .search-form {
      position: relative;
      padding: 0;

      // .ivu-form-item {
      //   width: 25%;
      //   min-width: 300px;
      //   max-width: 500px;
      // }
    }

    .page-content-table {
      position: absolute;
      width: calc(100% - 2px);
      padding: 0 14px;
      visibility: hidden;
      z-index: -1;

      &.active-table {
        visibility: visible;
        z-index: 2;
      }

      :deep(.ivu-table) {
        .text-center-left {
          display: inline-block;
          margin: 0 auto;
          text-align: left;
        }

        .demo-underline {
          text-decoration: underline;
          color: #0054a6;
          cursor: pointer;
        }
      }
    }
  }

  .operate-button {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;

    .operate-left {
      text-align: left;
    }

    .operate-right {
      text-align: right;
    }
  }

  .page-content-page {
    text-align: right;
  }

  .ivu-date-picker {
    width: 100%;
  }
}

.create-pick-modal {
  :deep(.ivu-modal-wrap) {
    .ivu-modal-body {
      max-height: calc(100vh - 200px);
      overflow: auto;
    }

    .ivu-modal-footer {
      display: none;
    }
  }
}

.sort-operate {
  display: none;

  &.active-sort {
    display: inline-block;
  }
}
</style>
