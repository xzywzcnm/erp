<template>
  <div>
    <!-- 搜索条件 -->
    <div class="interceptOrderFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="formFilterRefs" :model="pageParams" :label-width="100">
              <dyt-filter :handleTable="true">
                <Form-item label="店铺" prop="saleAccountIdList">
                  <dytStoreSelect
                    v-model="pageParams.saleAccountIdList"
                    :option-data="aliexpressShopList"
                    :replace-option-key="{value: 'saleAccountId', label: 'accountCode'}"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  />
                </Form-item>
                <Form-item label="入库单状态" prop="statusList">
                  <dyt-select
                    v-model="pageParams.statusList"
                    placeholder="请选择入库单状态"
                    :max-tag-count="1"
                    :multiple="true"
                  >
                    <Option v-for="(item, index) in Object.values(statusOrderList)" :key="`status-${index}`" :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="入库单编号" prop="purchaseOrderNoList">
                  <dyt-input-tag
                    type="textarea"
                    :limit="1"
                    :string="false"
                    placeholder="请输入入库单编号,多个回车或逗号分隔"
                    v-model="pageParams.purchaseOrderNoList"
                  />
                </Form-item>
                <Form-item label="托管类型" prop="trusteeshipType">
                  <dyt-select v-model="pageParams.trusteeshipType" placeholder="请选择托管类型">
                    <Option :value="0">全托管</Option>
                    <Option :value="1">半托管</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="仓库" prop="warehouseName">
                  <dyt-select v-model="pageParams.warehouseName" placeholder="请选择仓库">
                    <Option value="菜鸟AE东莞011号优选仓">菜鸟AE东莞011号优选仓</Option>
                    <Option value="菜鸟AE东莞002号优选仓">菜鸟AE东莞002号优选仓</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="SKU" prop="platformSkuList">
                  <dyt-input-tag
                    type="textarea"
                    :limit="1"
                    :string="false"
                    placeholder="请输入SKU，多个回车或逗号分隔"
                    v-model="pageParams.platformSkuList"
                  />
                </Form-item>
                <Form-item label="预约揽收状态" prop="pickupStatus">
                  <dyt-select v-model="pageParams.pickupStatus" placeholder="请选择预约揽收状态">
                    <Option value="2">已预约</Option>
                    <Option value="1">未预约</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="揽收单号" prop="pickUpOrderNoList">
                  <dyt-input-tag
                    type="textarea"
                    :limit="1"
                    :string="false"
                    placeholder="请输入揽收单号，多个回车或逗号分隔"
                    v-model="pageParams.pickUpOrderNoList"
                  />
                </Form-item>
                <Form-item label="创建时间" prop="gmtCreate">
                  <Date-picker
                    transfer
                    type="datetimerange"
                    style="width:100%"
                    :clearable="true"
                    format="yyyy-MM-dd HH:mm"
                    :options="dateOptions"
                    placement="bottom-end"
                    placeholder="选择日期"
                    v-model="pageParams.gmtCreate"
                  />
                </Form-item>
                <Form-item label="期望到仓时间" prop="preArriveTime">
                  <Date-picker
                    transfer
                    type="datetimerange"
                    style="width:100%"
                    :clearable="true"
                    format="yyyy-MM-dd HH:mm"
                    :options="dateOptions"
                    placement="bottom-end"
                    placeholder="选择日期"
                    v-model="pageParams.preArriveTime"
                  />
                </Form-item>
                <div slot="operation">
                  <Button type="primary" @click="searchData(true)" icon="md-search">查询</Button>
                  <Button @click="resetFilter" style="margin-left: 10px;" icon="md-refresh">重置</Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>
    <!-- 表格上面按钮 -->
    <div class="tableControl" style="display: flex;">
      <!-- 左侧按钮 -->
      <div style="flex: 100;">
        <Dropdown v-if="permission.confirm">
          <Button type="primary">
            批量接单
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="batchOrderreceiving('check')">
              选中的数据
            </DropdownItem>
            <DropdownItem @click.native="batchOrderreceiving('all')" :disabled="pageTool.total == 0">
              所有结果集
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Button type="primary" style="margin-left: 15px;" @click="openAppCollect" v-if="permission.appointment">预约揽收单</Button>
        <Dropdown style="margin-left: 15px;" v-if="permission.expost">
          <Button type="primary">
            导出
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="batchExport('check')">
              选中的数据
            </DropdownItem>
            <DropdownItem @click.native="batchExport('all')">
              所有结果集
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <!-- 右侧按钮 -->
      <!-- <div class="dataSort grayBg" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;">
        <span>排序：</span>
        <Button-group>
          <Button
            v-for="(item, index) in buttonGroupModel"
            :disabled="SearchDisabled"
            :type="item.selected ? 'primary' : 'default'"
            @click="modifyParamsSort(index, item.status)"
            :key="`sort-${index}`"
          >
            {{ item.title }}
            <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
            <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
          </Button>
        </Button-group>
      </div> -->
    </div>
    <!-- 列表 -->
    <div class="orderTable normalTop">
      <Table
        highlight-row border
        :height="tableHeight"
        :loading="dataLoading"
        :columns="tableColumn"
        :data="tableData"
        @on-selection-change="selectTableValueChange"
      />
        <div class="table-page flexBox">
          <Page
            :total="pageTool.total"
            @on-change="pageChange"
            show-total
            :page-size="pageTool.pageSize"
            show-elevator
            :current="pageTool.pageNum"
            show-sizer
            @on-page-size-change="pageSizeChange"
            placement="top"
            :page-size-opts="pageSizeOpts"
          />
      </div>
    </div>
    <Modal
      v-model="visibleAppCollect"
      width="650"
      :mask-closable="false"
      title="预约揽收单"
    >
      <Form
        class="page-filter-content"
        label-position="right"
        ref="filterRefsDome"
        :model="appCollectData"
        :rules="collectRule"
        :label-width="100"
      >
        <FormItem label="联系人：" class="mb0">
          <span style="display: inline-block;">{{ appCollectData.contacts }}</span>
          <span style="display: inline-block; padding-left: 15px;">{{ appCollectData.telephone }}</span>
        </FormItem>
        <FormItem label="联系人地址：" class="mb0">
          {{ appCollectData.contactAddress }}
        </FormItem>
        <FormItem label="预估总重量：" prop="estimatedWeight">
          <Input v-model="appCollectData.estimatedWeight" placeholder="请输入预估总重量">
            <span slot="append">KG</span>
          </Input>
        </FormItem>
        <FormItem label="预估总体积：" prop="estimatedVolume">
          <Input v-model="appCollectData.estimatedVolume" placeholder="请输入预估总体积">
            <span slot="append">m³</span>
          </Input>
        </FormItem>
        <FormItem label="预估总箱数：" prop="estimatedBoxNumber">
          <Input v-model="appCollectData.estimatedBoxNumber" placeholder="请输入预估总箱数">
            <span slot="append">箱</span>
          </Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <span style="display: inline-block; padding: 0 15px;">此次提交将预约个 {{ appCollectData.purchaseOrderNoList.length }} 订单</span>
        <Button @click="coloseCollect">取 消</Button>
        <Button type="primary" @click="confirmCollect">确 认</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import { appCollectContacts } from '@/utils/constantData.js';

export default {
  mixins: [Mixin, orderSys],
  components: {},
  data () {
    return {
      aliexpressShopList: [],
      dataLoading: false,
      pageSizeOpts: [10, 20, 50, 100, 200],
      visibleAppCollect: false,
      appCollectData: {
        ...appCollectContacts,
        trusteeshipType: null, // 托管类型
        saleAccountId: '', // 店铺id
        estimatedWeight: null, // 预估总重量
        estimatedVolume: null, // 预估总体积
        estimatedBoxNumber: null, // 预估总箱数
        purchaseOrderNoList: [] // 采购单号
      },
      // 揽收弹窗表单验证规则
      collectRule: {
        estimatedWeight: [
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 2, msg: '请输入数字,限两位小数', trigger: 'change' },
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 2, msg: '请输入数字,限两位小数', trigger: 'blur' },
        ],
        estimatedVolume: [
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 2, msg: '请输入数字,限两位小数', trigger: 'change' },
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 2, msg: '请输入数字,限两位小数', trigger: 'blur' },
        ],
        estimatedBoxNumber: [
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 0, msg: '请输入大于0的整数', trigger: 'change' },
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 0, msg: '请输入大于0的整数', trigger: 'blur' }
        ],
      },
      statusOrderList: {
        '10': { label: '待确认', value: 10 },
        // '15': { label: '已确认', value: 15 },
        '17': { label: '待发货', value: 17 },
        '20': { label: '待仓库收货', value: 20 },
        '21': { label: '已到仓登记', value: 21 },
        '30': { label: '部分收货', value: 30 },
        '40': { label: '收货完成', value: 40 },
        // '50': { label: '超时关闭', value: 50 },
        '-99': { label: '已取消', value: -99 }
      },
      pageParams: {
        // orderBy: 'payTime',
        // upDown: 'up',
        saleAccountIdList: [],
        purchaseOrderNoList: [],
        statusList: [],
        warehouseName: '',
        trusteeshipType: null, // 托管类型
        platformSkuList: [],
        gmtCreate: [],
        preArriveTime: [],
        gmtCreateStart: null,
        gmtCreateEnd: null,
        preArriveTimeStart: null,
        preArriveTimeEnd: null,
        // 1:未创建揽收单，2:已创建揽收单
        pickupStatus: '',
        // 揽收单号
        pickUpOrderNoList: []
      },
      buttonGroupModel: [
        {
          type: 'salesTime',
          selected: false,
          status: true, // true up false down
          title: '退件申请时间'
        },
        {
          type: 'payTime',
          selected: true,
          status: true, // true up false down
          title: '付款时间'
        }
      ],
      // 表格数据
      tableData: [],
      // 选中的数据
      tableSelectData: [],
      // 表格列设置
      tableColumn: [
        { type: 'selection', width: 50, align: 'center' },
        {
          title: '店铺',
          key: 'accountCode',
          minWidth: 85,
          align: 'center'
        },
        {
          title: '入库单编号',
          key: 'purchaseOrderNo',
          minWidth: 130,
          align: 'center'
        },
        {
          title: '托管类型',
          key: 'trusteeshipType',
          width: 100,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.trusteeshipType) || ![0, 1].includes(Number(row.trusteeshipType))) return h('span', '');
            const txt = row.trusteeshipType == 1 ? '半托管' : '全托管';
            return h('span', txt);
          }
        },
        {
          title: '物流单号',
          key: 'whcOrderNoList',
          minWidth: 130,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.whcOrderNoList)) return h('div', {}, '-');
            if (!this.permission.logistics) return h('div', {}, `${row.whcOrderNoList}`);
            return h('div', {
              style: {
                'color': '#2d8cf0',
                'cursor': 'pointer',
                'text-decoration': 'underline',
                'text-underline-position': 'under',
              },
              on: {
                click: () => {
                  this.getPdfUrl(row, 'logistics');
                }
              }
            }, `${row.whcOrderNoList}`);
          }
        },
        {
          title: '揽收单号',
          key: 'pickUpOrderNo',
          minWidth: 130,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.pickUpOrderNo)) return h('div', {}, '-');
            if (!this.permission.collect) return h('div', {}, `${row.pickUpOrderNo}`);
            return h('div', {
              style: {
                'color': '#2d8cf0',
                'cursor': 'pointer',
                'text-decoration': 'underline',
                'text-underline-position': 'under',
              },
              on: {
                click: () => {
                  this.getPdfUrl(row, 'collect');
                }
              }
            }, `${row.pickUpOrderNo}`);
          }
        },
        {
          title: '仓库',
          key: 'storeName',
          minWidth: 130,
          align: 'center',
          render: (h, { row }) => {
            return h('div', {
              style: {
                'text-align': 'left'
              }
            }, [
              h('div', {}, `${row.storeCode}`),
              h('div', {}, `${row.storeName}`)
            ]);
          }
        },
        {
          title: '发货信息',
          key: 'platformSkuAndQuantityList',
          width: 170,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.platformSkuAndQuantityList)) return h('span', '-');
            return row.platformSkuAndQuantityList.map(item => {
              return h('div', item)
            })
          }
        },
        {
          title: '库存情况',
          key: 'platformSkuAndInventoryList',
          width: 170,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.platformSkuAndInventoryList)) return h('span', '-');
            return row.platformSkuAndInventoryList.map(item => {
              return h('div', item)
            })
          }
        },
        {
          title: '入库单金额',
          key: 'price',
          width: 100,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.price)) return h('div', '');
            if (this.$common.isEmpty(row.priceCurrency)) return h('div', row.price);
            return h('div', {}, [
              h('div', {}, row.price),
              h('div', {}, `(${row.priceCurrency})`)
            ]);
          }
        },
        {
          title: '时间信息',
          key: 'gmtCreate',
          width: 230,
          align: 'center',
          render: (h, { row }) => {
            const gmtCreate = this.$common.isEmpty(row.gmtCreate) ? '' : this.$common.toLocaleDate(row.gmtCreate, 'fulltime');
            const preArriveTime = this.$common.isEmpty(row.preArriveTime) ? '' : this.$common.toLocaleDate(row.preArriveTime, 'fulltime');
            return h('div', {}, [
              h('div', {}, [
                h('span', { style: { display: 'inline-block', width: '90px', 'text-align': 'right' } }, '创建时间：'),
                h('span', {}, gmtCreate)
              ]),
              h('div', {}, [
                h('span', { style: { display: 'inline-block', width: '90px', 'text-align': 'right' } }, '期望到仓时间：'),
                h('span', {}, preArriveTime)
              ])
            ]);
          }
        },
        {
          title: '入库单状态',
          key: 'statusDesc',
          width: 100,
          align: 'center',
          render: (h, { row }) => {
            return h('span', row.statusDesc);
          }
        },
        {
          title: '操作',
          key: 'operate',
          fixed: 'right',
          width: 100,
          className: 'stockout-operate-column',
          align: 'center',
          render: (h, { row }) => {
            let operate = [];
            if (this.permission.confirm && [10, '10'].includes(row.status)) {
              operate.push(h('Button', {
                props: { size: 'small' },
                style: { marginRight: '5px' },
                on: {
                  click: () => {
                    this.$Modal.confirm({
                      title: '接单确认',
                      content: `是否对 ${row.purchaseOrderNo} 进行接单？`,
                      onOk: () => {
                        this.receivingOrder({ purchaseOrderNoList: [row.purchaseOrderNo] });
                      },
                      onCancel: () => {}
                    });
                  }
                }
              }, '确认接单'));
            }
            return h('div', operate);
          }
        }
      ],
      pageTool: {
        total: 0,
        pageNum: 1,
        pageSize: 20
      },
    };
  },
  watch: {},
  computed: {
    tableHeight () {
      return this.getTableHeight(275);
    },
    // 权限
    permission () {
      return {
        query: this.getPermission('aliexpressPurchaseOrder_query'), // 查询列表
        expost: this.getPermission('aliexpressPurchaseOrder_expost'), // 列表导出
        confirm: this.getPermission('aliexpressPurchaseOrder_confirmPurchaseOrder'), // 确认接单
        logistics: this.getPermission('aliexpressPurchaseOrder_shippingMarkPdf'), // 查询物流面单
        collect: this.getPermission('aliexpressPurchaseOrder_pickupShippingMarkPdf'), // 查询揽收面单
        appointment: this.getPermission('aliexpressPurchaseOrder_appointmentPickupOrder'), // 预约揽收单
      }
    },
  },
  created () {
    this.getyAliexpressAccountList();
  },
  mounted () {},
  methods: {
    // 处理搜索参数
    getParams () {
      let pageParams = this.$common.copy(this.pageParams);
      pageParams.pageSize = this.pageTool.pageSize;
      pageParams.pageNum = this.pageTool.pageNum;
      if (!this.$common.isEmpty(this.pageParams.gmtCreate) && !this.$common.isEmpty(pageParams.gmtCreate[0])) {
        pageParams.gmtCreateStart = this.$common.toISODate(pageParams.gmtCreate[0], 'fulltime');
        pageParams.gmtCreateEnd = this.$common.toISODate(pageParams.gmtCreate[1], 'fulltime');
      }
      if (!this.$common.isEmpty(this.pageParams.preArriveTime) && !this.$common.isEmpty(pageParams.preArriveTime[0])) {
        pageParams.preArriveTimeStart = this.$common.toISODate(pageParams.preArriveTime[0], 'fulltime');
        pageParams.preArriveTimeEnd = this.$common.toISODate(pageParams.preArriveTime[1], 'fulltime');
      }
      delete pageParams.gmtCreate;
      delete pageParams.preArriveTime;
      return pageParams;
    },
    // 查询列表
    searchData (type) {
      if (!this.permission.query) return this.$Message.error('您暂无权限查询');
      if (type) {
        this.pageTool.pageNum = 1;
      }
      this.tableData = [];
      this.tableSelectData = [];
      this.dataLoading = true;
      this.axios.post(api.aliexpressList, this.getParams()).then((res) => {
        if (!res.data || !res.data.datas || res.data.code != 0) {
          this.pageTool.total = 0;
          return;
        }
        this.tableData = res.data.datas.list || [];
        this.pageTool.total = res.data.datas.total || this.tableData.length;
      }).catch(() => {
        this.pageTool.total = 0;
      }).finally(() => {
        this.dataLoading = false;
      })
    },
    // 获取速卖通平台授权为全托管的店铺
    getyAliexpressAccountList () {
      this.axios.post(api.queryAliexpressAccountList, {
        platformIds: [this.platformType],
        subsystemCode: 'order-service',
      }, { hiddenError: true }).then((res) => {
        if (!res.data || res.data.code != 0) return;
        this.aliexpressShopList = res.data.datas || [];
      })
    },
    // 重置搜索条件
    resetFilter () {
      // this.pageTool.pageNum = 1;
      this.$refs.formFilterRefs && this.$refs.formFilterRefs.resetFields();
    },
    // 批量接单
    batchOrderreceiving (str) {
      if (!['check', 'all'].includes(str)) return;
      let param = {};
      if (str === 'check') {
        if (this.$common.isEmpty(this.tableSelectData)) return this.$Message.error('请选择需要操作的数据');
        param.purchaseOrderNoList = this.tableSelectData.filter(f => {
          return [10, '10'].includes(f.status);
        }).map(item => {
          return item.purchaseOrderNo
        });
        const noHand = this.tableSelectData.length - param.purchaseOrderNoList.length;
        if (param.purchaseOrderNoList.length == 0) return this.$Message.error('请选中的数据中不存在“入库单状态”为“待确认”的数据');
        this.$Modal.confirm({
          title: '批量接单',
          content: `
            选中的订单中有${noHand}条“入库单状态”为“非待确认”的数据，
            将自动过滤“非待确认”的数据；确认对 ${param.purchaseOrderNoList.length} 个订单“入库单状态”为“待确认”的数据，进行接单？
          `,
          onOk: () => {
            this.receivingOrder(param);
          },
          onCancel: () => {}
        });
      } else {
        if (this.pageTool.total == 0) return;
        param = this.getParams();
        this.$Modal.confirm({
          title: '批量接单',
          content: `是否对 ${this.pageTool.total} 个订单中筛选出“入库单状态”为“待确认”的数据进行接单？`,
          onOk: () => {
            this.receivingOrder(param);
          },
          onCancel: () => {}
        });
      }
    },
    // 接单操作
    receivingOrder (param) {
      this.axios.post(api.confirmPurchaseOrder, param).then((res) => {
        if (!res.data || res.data.code != 0) return;
        this.$Message.success('操作成功');
      })
    },
    // 批量导出
    batchExport (str) {
      if (!['check', 'all'].includes(str)) return;
      let param = {};
      if (str === 'check') {
        if (this.$common.isEmpty(this.tableSelectData)) return this.$Message.error('请选择需要导出的数据');
        param.purchaseOrderNoList = this.tableSelectData.map(item => {
          return item.purchaseOrderNo
        })
      } else {
        param = this.getParams();
      }
      this.axios.post(api.aliexpressExport, param).then((res) => {
        if (!res.data || res.data.code != 0) return;
        this.$Message.success(`已生成导入/导出任务，任务编号：${res.data.datas}`);
      })
    },
    // 表格行选中改变时
    selectTableValueChange (value) {
      this.tableSelectData = value;
    },
    // 打开预约揽收弹窗
    openAppCollect () {
      if (this.$common.isEmpty(this.tableSelectData)) return this.$Message.error('请选择需要操作的数据');
      const rowList = this.tableSelectData.filter(row => {
        return this.$common.isEmpty(row.pickUpOrderNo);
      });
      if (this.$common.isEmpty(rowList)) return this.$Message.error('选中的数据全部为已经预约过，请选中未预约的数据');
      let saleAccountId = [];
      let allType = [];
      rowList.forEach(item => {
        saleAccountId.push(item.saleAccountId);
        allType.push(item.trusteeshipType);
      });
      saleAccountId = this.$common.arrRemoveRepeat(saleAccountId);
      allType = this.$common.arrRemoveRepeat(allType);
      if (saleAccountId.length > 1) return this.$Message.error('请选择相同店铺的数据');
      if (allType.length > 1) return this.$Message.error('请选择相同托管类型的数据');
      this.appCollectData.saleAccountId = saleAccountId[0];
      this.appCollectData.trusteeshipType = rowList[0].trusteeshipType;
      this.appCollectData.purchaseOrderNoList = rowList.map(item => {
        return item.purchaseOrderNo;
      });
      this.$nextTick(() => {
        this.visibleAppCollect = true;
      })
    },
    // 预约揽收
    confirmCollect () {
      const params = this.$common.copy(this.appCollectData);
      this.axios.post(api.appointmentPickupOrder, params).then((res) => {
        if (!res.data || res.data.code != 0) return;
        this.$Message.success('操作成功');
        this.coloseCollect();
        this.searchData();
      })
    },
    // 关闭预约揽收弹窗
    coloseCollect () {
      this.visibleAppCollect = false;
      this.appCollectData = {
        ...appCollectContacts,
        trusteeshipType: null, // 托管类型
        saleAccountId: '', // 店铺id
        estimatedWeight: null, // 预估总重量
        estimatedVolume: null, // 预估总体积
        estimatedBoxNumber: null, // 预估总箱数
        purchaseOrderNoList: [] // 采购单号
      }
    },
    // 获取文件路径
    getPdfUrl (row, type) {
      if (row.downLoading) return;
      const paramsRq = this.$common.getParams({
        saleAccountId: row.saleAccountId,
        purchaseOrderNo: row.purchaseOrderNo,
        trusteeshipType: row.trusteeshipType
      })
      const paramsSe = this.$common.getParams({
        saleAccountId: row.saleAccountId,
        pickupOrderNumber: row.pickUpOrderNo,
        trusteeshipType: row.trusteeshipType
      })
      const paramsConfig = {
        logistics: {
          api: `${api.shippingLogisticsMarkPdf}?${paramsRq}`,
          params: {}
        },
        collect: {
          api: `${api.pickupShippingMarkPdf}?${paramsSe}`,
          params: {}
        }
      }
      if (this.$common.isEmpty(type) || this.$common.isEmpty(paramsConfig[type])) return;
      row.downLoading = true;
      this.axios.post(paramsConfig[type].api, paramsConfig[type].params).then((res) => {
        if (!res.data || res.data.code != 0) {
          row.downLoading = false;
          return;
        }
        this.axios.get(res.data.datas, {
          responseType: 'blob',
          hiddenError: true
        }).then(fileBlob => {
          this.$common.downloadFile(fileBlob).catch(() => {
            window.open(res.data.datas);
          }).finally(() => {
            row.downLoading = false;
          });
        }).catch(() => {
          window.open(res.data.datas);
          row.downLoading = false;
        })
      }).catch(() => {
        row.downLoading = false;
      })
    },
    // 页码改变
    pageChange (page) {
      this.pageTool.pageNum = page;
      this.$nextTick(() => {
        this.searchData(false);
      })
    },
    // 单页数量改变
    pageSizeChange (pageSize) {
      this.pageTool.pageSize = pageSize;
      this.$nextTick(() => {
        this.searchData(false);
      })
    },
    // 排序改变
    modifyParamsSort (index, status) {
      this.buttonGroupModel.forEach((n, i) => {
        if (i === index && n.selected) {
          this.buttonGroupModel[index].status = !this.buttonGroupModel[index].status;
        } else {
          n.selected = (i === index && !n.selected);
        }
      });
      this.$set(this.pageParams, 'orderBy', this.buttonGroupModel[index].type);
      this.$set(this.pageParams, 'upDown', this.buttonGroupModel[index].status ? 'up' : 'down');
      this.$nextTick(() => {
        this.searchData(false);
      })
    },
  }
};
</script>
