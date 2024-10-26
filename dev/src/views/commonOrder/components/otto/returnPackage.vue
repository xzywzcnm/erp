<template>
  <div class="returnPackage">
    <div class="listPage">
      <div class="searchMain">
        <Form ref="searchParams" :model="searchParams" inline :label-width="80">
          <FormItem label="状态:" class="ignore-width">
            <RadioGroup v-model="searchParams.status" type="button" button-style="solid" @on-change="statusChange">
              <Radio :label="item.value" v-for="(item, index) in statusList" :key="index">
                {{ item.label }}
              </Radio>
            </RadioGroup>
          </FormItem>
          <dyt-filter :filter-row="1" @operation="operation" ref="dyt-filter" @expand="expand">
            <FormItem label="退货SKU:">
              <dyt-inputTag v-model="searchParams.skuAll" :limit="1" type="textarea" />
            </FormItem>
            <Form-item label="商品事业部" prop="businessDeptIdList" v-if="isGetBusiness">
              <dyt-select
                v-model="searchParams.businessDeptIdList"
                :max-tag-count="1"
                multiple
                placeholder="请选择商品事业部"
              >
                <Option v-for="(item, index) in businessDeptDataList" :value='item.id' :key="`business-${index}`">{{item.name}}</Option>
              </dyt-select>
            </Form-item>
            <FormItem label="退货订单号:">
              <dyt-inputTag v-model="searchParams.webstoreOrderIdAll" :limit="1" type="textarea" />
            </FormItem>
            <FormItem label="退货时间:">
              <DatePicker type="daterange" format="yyyy-MM-dd" :options="options" placement="bottom-start" placeholder="请选择"
                @on-change="sendTimeChange" :value="[searchParams.returnTimeStart, searchParams.returnTimeEnd]"
                transfer></DatePicker>
            </FormItem>
            <FormItem label="重派订单号:">
              <dyt-inputTag v-model="searchParams.heavyFactionNo" :limit="1" type="textarea" />
            </FormItem>
            <FormItem label="退货跟踪号:">
              <dyt-inputTag v-model="searchParams.trackingNumberList" :limit="1" type="textarea" />
            </FormItem>
            <Form-item label="付款时间">
              <Date-picker
                transfer
                type="daterange"
                style="width: 100%"
                @on-clear="resetDate"
                @on-change="getDateValue"
                :clearable="true"
                format="yyyy-MM-dd"
                :options="options"
                placement="bottom-end"
                placeholder="选择日期"
                :value="[searchParams.payStartTime, searchParams.payEndTime]"
              />
            </Form-item>
            <FormItem label="重退次数:">
              <InputNumber v-model="searchParams.repeatReturnCount" :min="0" :precision="0" placeholder="请输入重退次数，大于或等于 0 的整数" />
            </FormItem>
            <FormItem label="退货天数:" prop="returnDay">
              <InputNumber v-model="searchParams.returnDay" :min="1" :precision="0" placeholder="请输入退货天数，大于或等于 1 的整数" />
            </FormItem>
            <div slot="operation">
              <Button type="primary" @click="searchOrder" icon="md-search">查询 </Button>
              <Button @click="reset" class="ml10" icon="md-refresh">重置 </Button>
            </div>
          </dyt-filter>
        </Form>
      </div>
      <!-- 功能 -->
      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <Button type="primary" @click="importOrder" class="mr10" v-if="getPermission('returnPackageImport')">导入退货订单</Button>
            <Dropdown @on-click="batchOperate" v-if="getPermission('returnPackageExport')">
              <Button type="primary">
                <span class="icon iconfont" style="font-size: 12px">&#xe639;</span> 导出
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name='exportPackage'>导出选中数据</DropdownItem>
                <DropdownItem name='exportAll'>导出所有结果集</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button
              type="primary"
              @click="batchOperate('invalidPackage')"
              class="ml10"
              v-if="getPermission('batchReturnPackageDestroyed')"
            >批量作废</Button>
            <!-- <Dropdown @on-click="batchOperate" class="ml10" v-if="getPermission('batchReturnPackageDestroyed')">
              <Button type="primary">
                <span class="icon iconfont" style="font-size: 12px">&#xe639;</span> 批量作废
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name='invalidPackage'>作废选中数据</DropdownItem>
                <DropdownItem name='invalidAll'>导出所有结果集</DropdownItem>
              </DropdownMenu>
            </Dropdown> -->
          </div>
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch(arguments)"
              :sorType="{ DESC: 'Down', ASC: 'up' }"></dyt-sortBySelect>
          </div>
        </div>
      </div>
      <!-- 表格 -->
      <div class="tableMain">
        <div class="tableBox">
          <Table
            border highlight-row
            ref="selection"
            :columns="columns"
            :loading="tableLoading"
            :data="tableList"
            :height="tableHeight"
            @on-selection-change='tableSelectionChange'
          >
            <template slot-scope="{ row, index }" slot="trackingNumber">
              <a href="javascript:;" style="text-decoration:underline;" @click="packageDetail(row)">
                {{ row.trackingNumber }}
              </a>
            </template>
            <template slot-scope="{ row, index }" slot="picture">
              <dyt-previewImg :fileList="returnList(row)" :imgOption="{ listWidth: 50, listHeight: 50, }"
                abbreviationClass="abbreviation_style">
              </dyt-previewImg>
            </template>
            <template slot-scope="{ row, index }" slot="returnOrderNum">
              <div v-for="(item, i) in (row.returnPackageDetailVos || [])" :key="i">
                <span>{{ item.sku }}</span>
                <span v-if="item.sku"> *{{ item.quantity || 0 }}</span>
              </div>
            </template>
            <template slot-scope="{ row, index }" slot="returnTime">
              <span v-if="row.returnTime">{{ $common.getDataToLocalTime(row.returnTime, 'fulltime') }}</span>
            </template>
            <template slot-scope="{ row, index }" slot="status">
              <span v-for="(item, index) in statusList" :key="index + 'statusList'">
                {{ row.status === item.value ? item.label : '' }}
              </span>
            </template>
            <template slot-scope="{ row, index }" slot="webstoreOrderId">
              <span v-if="row.accountCode">{{ row.accountCode }}-</span>
              <span>{{ row.webstoreOrderId || '' }}</span>
            </template>
            <template slot-scope="{ row, index }" slot="orderId">
              <span v-if="row.orderAccountCode">{{ row.orderAccountCode }}-</span>
              <span>{{ row.salesRecordNumber || '' }}</span>
            </template>
            <template slot-scope="{ row, index }" slot="userInfo">
              <div>{{ row.buyerAccountId || '' }}</div>
              <div style="color:red;">{{ row.buyerName || '' }}</div>
            </template>
            <!-- <template slot-scope="{ row, index }" slot="buyerCountryCode">
              <span>{{ getCountryName(row.buyerCountryCode) }}</span>
            </template> -->
            <template slot-scope="{ row, index }" slot="totalPrice">
              <span>{{ row.totalPrice || 0 }}{{ row.totalPriceCurrency || '' }}</span>
            </template>
            <template slot-scope="{ row, index }" slot="payTime">
              <span v-if="row.payTime">{{ $common.getDataToLocalTime(row.payTime, 'fulltime') }}</span>
            </template>
            <template slot-scope="{ row, index }" slot="actions">
              <a href="javascript:;" @click="toVoid(row)"
                v-if="['0', '1', '2', '3'].includes(row.status) && getPermission('returnPackageDestroyed')">作废</a>
            </template>
          </Table>
        </div>
      </div>
      <!--分页-->
      <div class="pagesMain">
        <Page :total="pageTotal" :current="searchParams.pageNum" :page-size="searchParams.pageSize" show-total
          show-sizer show-elevator @on-change="pageNumChange" @on-page-size-change="pageSizeChange"
          :page-size-opts="pageArray"></Page>
      </div>
    </div>
    <!-- 入仓详情 :countryList="countryList" -->
    <package-detail :dialogVisible.sync="detailDialog.dialogVisible" :data="detailDialog.data" :statusList="statusList">
    </package-detail>
    <!-- 导入前的模态框 -->
    <import-stockout :switchInportModal.sync="switchInportModal" @search="search"></import-stockout>
    <Modal v-model="editReamrk.visible" title="编辑备注" :mask-closable="false" width="500">
      <div style="display: flex;">
        <span style="width: 60px; text-align: right;">备注：</span>
        <Input
          type="textarea"
          v-model="editReamrk.row.remark"
          :autosize="{minRows: 4, maxRows: 6}"
          placeholder="请输入备注"
        />
        <Spin v-if="editReamrk.loading" fix></Spin>
      </div>
      <div slot="footer">
        <Button @click="editReamrk.visible = false">取消</Button>
        <Button type="primary" @click="submitEditReamrk" :loading="editReamrk.loading">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import fetch from '@/components/mixin/fetch';
import packageDetail from './components/packageDetail';
import importStockout from './components/importStockout';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';
export default {
  name: 'returnPackage',
  mixins: [fetch, tableHeight_mixin],
  components: { packageDetail, importStockout },
  data() {
    return {
      businessDeptDataList: [],
      tableSltData: [],
      editReamrk: {
        row: {},
        visible: false,
        loading: false
      },
      searchParams: {
        status: '',
        skuAll: [],
        webstoreOrderIdAll: [],
        businessDeptIdList: [],
        returnTimeStart: '',
        returnTimeEnd: '',
        heavyFactionNo: [],
        trackingNumberList: [],
        payStartTime: '',
        payEndTime: '',
        orderBy: 'return_time',
        upDown: 'Down',
        pageNum: 1,
        pageSize: 50,
        returnDay: null,
        repeatReturnCount: null
      },
      resetOption: {
        payStartTime: '',
        payEndTime: '',
        returnTimeStart: '',
        returnTimeEnd: ''
      },
      statusList: [// 状态列表
        { label: '全部', value: '' },
        { label: '未到仓', value: '0' },
        { label: '已到仓', value: '1' },
        { label: '已匹配', value: '2' },
        { label: '已重派', value: '3' },
        { label: '已作废', value: '4' }
      ],
      sortButtonList: [// 排序
        {
          sortHeader: '退货时间',
          sortField: 'returnTime',
          sortType: 'Down',
          default: true
        }
      ],
      columns: [{
        type: 'selection',
        width: 40,
        align: 'center'
      },
      {
        title: '退货跟踪号',
        slot: 'trackingNumber',
        align: 'center',
        minWidth: 120
      },
      {
        title: '退货产品',
        slot: 'picture',
        align: 'center',
        width: 130
      },
      {
        title: '退货SKU*数量',
        align: 'center',
        slot: 'returnOrderNum',
        width: 100
      },
      {
        title: '退货时间',
        align: 'center',
        slot: 'returnTime',
        width: 140
      },
      {
        title: '退货订单号',
        align: 'center',
        slot: 'webstoreOrderId',
        minWidth: 100
      },
      {
        title: '退货天数',
        align: 'center',
        key: 'returnDay',
        minWidth: 65,
        render: (h, { row }) => {
          if (![0, 1].includes(Number(row.status)) || this.$common.isEmpty(row.returnDay)) return h('span', '');
          if (row.returnDay <= 25) return h('span', row.returnDay);
          return h('span', {
            style: {
              color: '#f20'
            }
          }, row.returnDay);
        }
      },
      {
        title: '重退次数',
        align: 'center',
        key: 'repeatReturnCount',
        minWidth: 65
      },
      {
        title: '状态',
        align: 'center',
        slot: 'status',
        width: 70
      },
      {
        title: '重派订单号',
        slot: 'orderId',
        align: 'center',
        minWidth: 100
      },
      {
        title: '买家ID/姓名',
        slot: 'userInfo',
        align: 'center',
        minWidth: 90
      },
      {
        title: '国家/地区',
        key: 'buyerCountryCode',
        align: 'center',
        minWidth: 90
      },
      {
        title: '金额',
        slot: 'totalPrice',
        align: 'center',
        width: 60
      },
      {
        title: '付款时间',
        slot: 'payTime',
        align: 'center',
        width: 100
      },
      {
        title: '跟踪号',
        key: 'heavyTrackingNumber',
        align: 'center',
        width: 100,
      },
      {
        title: '备注',
        key: 'remark',
        align: 'center',
        width: 120,
        render: (h, { row }) => {
          const remark = row.remark || '';
          let renderReamrk = h('div', {
            class: 'remark-txt',
          }, remark);
          if (!this.$common.isEmpty(remark)) {
            renderReamrk = h('Poptip', {
              props: {
                placement: 'left',
                trigger: 'hover',
                transfer: true
              },
              style: {
                width: `calc(100% - ${this.getPermission('updateRemark') ? '16px' : '0px'})`
              }
            }, [
              h('div', {
                class: 'remark-txt',
              }, remark),
              h('div', {
                slot: 'content',
                style: {
                  'width': '300px',
                  'white-space': 'initial',
                  'max-height': '50vh',
                  'overflow': 'auto',
                },
              }, remark),
            ])
          }
          let rowItem = [renderReamrk];
          if (this.getPermission('updateRemark')) {
            rowItem.push(h('Icon', {
              class: 'remark-icon',
              attrs: {
                title: '编辑备注'
              },
              props: {
                type: 'md-create'
              },
              on: {
                click: () => {
                  this.openReamrkModal(row);
                }
              }
            }));
          }
          return h('div', {
            class: 'remark-content',
          }, rowItem)
        }
      },
      {
        title: '操作',
        slot: 'actions',
        fixed: 'right',
        width: 120
      }],
      detailDialog: {// 详情
        data: {},
        dialogVisible: false
      },
      tableList: [],
      switchInportModal: false // 导入模态框
      // countryList: [],//国家列表
    }
  },
  computed: {
    platformId () {
      const urlParams = this.$common.getUrlParams();
      return urlParams.platform || 'otto'
    },
    // 是否展示商品事业部
    isGetBusiness () {
      return ['otto'].includes(this.platformId);
    }
  },
  created() {
    this.getBusinessDeptData(); // 获取事业部

    this.getTime();
    this.fetch(api.otto_query + '?platformId=' + this.platformId, 'post', 'returnPackageQueryList');
  },
  activated() {},
  methods: {
    resetDate () {
      this.searchParams.payTime = [];
    },
    // 默认值为前7天
    getTime() {
      let dayjs = this.$common.dayjs();
      const timeRange = [`${dayjs.subtract(7, 'day').format('YYYY-MM-DD')} 00:00:00`, `${dayjs.format('YYYY-MM-DD')} 23:59:59`];
      this.resetOption.returnTimeStart = this.searchParams.returnTimeStart = timeRange[0];
      this.resetOption.returnTimeEnd = this.searchParams.returnTimeEnd = timeRange[1];
    },
    // 退货时间
    sendTimeChange(e) {
      this.searchParams.returnTimeStart = e[0] ? `${e[0]} 00:00:00` : '';
      this.searchParams.returnTimeEnd = e[1] ? `${e[1]} 23:59:59` : '';
    },
    getDateValue (e) {
      this.searchParams.payStartTime = e[0] ? `${e[0]} 00:00:00` : '';
      this.searchParams.payEndTime = e[1] ? `${e[1]} 23:59:59` : '';
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(Info) {
      this.searchParams.upDown = Info[0] || 'Down';
      this.searchParams.orderBy = Info[1] || 'return_time';
      this.fetch();
    },
    tableSelectionChange (selection) {
      this.tableSltData = selection;
    },
    // 批量操作
    batchOperate (str) {
      if (this.$common.isEmpty(this[str]) || !this.$common.isFunction(this[str])) return;
      this[str]();
    },
    exportPackage (param) {
      let newparam = {};
      if (!this.$common.isEmpty(param)) {
        newparam = param;
      } else {
        if (this.tableSltData.length <= 0) {
          this.$Message.warning('请选择导出数据');
          return;
        }
        newparam = {
          returnPackageIds: this.tableSltData.map(row => row.returnPackageId)
        };
      }
      return new Promise((resolve, reject) => {
        this.axios.post(api.otto_exportReturnPackage + '?platformId=' + this.platformId, newparam).then((res) => {
          if (!res.data || res.data.code !== 0) return reject(res);
          this.$Message.success('导出成功~');
          resolve(true);
        }).catch((err) => {
          reject(err);
        })
      })
    },
    // 导出
    exportAll() {
      this.$Modal.confirm({
        title: '导出所有',
        content: '异步导出所有行的列表数据，导出任务完成后，请使用“导出查看”的功能，下载导出文件',
        loading: true,
        onOk: () => {
          let temp = this.getFilterParams();
          let deleteArr = ['pageNum', 'pageSize', 'orderBy', 'upDown'];
          Object.keys(temp).forEach(k => {
            if (deleteArr.includes(k)) delete temp[k];
          })
          this.exportPackage(temp).finally(() => {
            this.$Modal.remove();
          })
        },
        onCancel: () => { }
      });
    },
    // 批量作废包裹
    invalidPackage () {
      if (this.tableSltData.length <= 0) {
        this.$Message.warning('请选择作废的数据');
        return;
      }
      // const trackingNumberList = this.tableSltData.map(row => row.trackingNumber)
      this.$Modal.confirm({
        title: '作废选中的数据',
        content: `确认作废选中的 ${this.tableSltData.length} 条数据？`,
        loading: true,
        onOk: () => {
          const newparam = {
            returnPackageIds: this.tableSltData.map(row => row.returnPackageId)
          };
          this.toVoidPackage(newparam).finally(() => {
            this.$Modal.remove();
          })
        },
        onCancel: () => {}
      });
    },
    // 批量作废当前查询条件的
    invalidAll () {
      this.$Modal.confirm({
        title: '作废所有结果集',
        content: '确认作废当前条件下的所有退货包裹？',
        loading: true,
        onOk: () => {
          let temp = this.getFilterParams();
          let deleteArr = ['pageNum', 'pageSize', 'orderBy', 'upDown'];
          Object.keys(temp).forEach(k => {
            if (deleteArr.includes(k)) delete temp[k];
          })
          this.toVoidPackage(temp).finally(() => {
            this.$Modal.remove();
          })
        },
        onCancel: () => { }
      });
    },
    // 执行作废
    toVoidPackage (param) {
      return new Promise((resolve, reject) => {
        this.axios.post(api.otto_batchInvalidReturn, { ...param, platformId: this.platformId }).then((res) => {
          if (!res.data || res.data.code !== 0) return reject(res);
          this.$Message.success('操作成功~');
          this.$nextTick(() => {
            this.searchOrder();
          })
          resolve(true);
        }).catch((err) => {
          reject(err);
        })
      })
    },
    // 作废
    toVoid(row) {
      this.$Modal.confirm({
        title: '操作提示',
        content: `确认是否要退货包裹：<span style="color:#f90;">${row.trackingNumber || ''}</span>`,
        loading: true,
        onOk: () => {
          let params = `?returnPackageId=${row.returnPackageId}&platformId=${this.platformId}`;
          this.axios.post(api.otto_invalidReturnPackage + params).then(({ data }) => {
            if (!(data && data.code === 0)) return;
            this.$Message.success('操作成功~');
            this.search();
          }).finally(() => {
            this.$Modal.remove();
          })
        },
        onCancel: () => { }
      });
    },
    // 入仓详情
    packageDetail(row) {
      if (!this.getPermission('returnPackageQueryDetail')) {
        this.$Message.error('暂无查看详情权限');
        return;
      }
      this.detailDialog.data = row;
      this.detailDialog.dialogVisible = true;
    },
    // 获取事业部
    getBusinessDeptData () {
      if (!this.isGetBusiness) return;
      this.axios.get(api.get_businessDeptList).then(res => {
        if (res && res.data) {
          this.businessDeptDataList = res.data.data || [];
        }
      })
    },
    // 导入退货订单
    importOrder() {
      this.switchInportModal = true;
    },
    // // 获取国家列表
    // getCountrys() {
    //   if (localStorage.getItem('area') === undefined || localStorage.getItem('area') === '[]') {
    //     localStorage.removeItem('area');
    //   }
    //   if (localStorage.getItem('area') !== 'null' && localStorage.getItem('area')) {
    //     this.countryList = (JSON.parse(localStorage.getItem('area'))).filter(f => !!f.twoCode);
    //   } else {
    //     let prefix = this.isSettingSpecial();
    //     this.axios.get(prefix + api.get_countrys).then(response => {
    //       if (response.data.code === 0) {
    //         let data = response.data.datas;
    //         this.countryList = data.filter(f => !!f.twoCode);
    //         localStorage.setItem('area', JSON.stringify(data));
    //       }
    //     });
    //   }
    // },
    isSettingSpecial() {
      let url = window.location.href;
      if (url.indexOf('orderSettings.html') > -1) {
        return '/order-service/erpCommon/';
      } else if (url.indexOf('logistics.html') > -1) {
        return '/wms-service/erpCommon/';
      } else if (url.indexOf('customSettings.html') > -1) {
        return '/order-service/erpCommon/';
      } else if (url.indexOf('pdsSettings.html') > -1) {
        return '/pds-service/erpCommon/';
      } else {
        return './erpCommon/';
      }
    },
    // // 处理国家名称
    // getCountryName(country) {
    //   let list = this.countryList.filter(k => {
    //     return k.twoCode === country;
    //   })
    //   if (list.length) return list[0].cnName;
    //   return country;
    // },
    // 处理图片列表
    returnList(row) {
      let list = (row.returnPackageDetailVos || []).map((k, i) => {
        return { url: k.pictureUrl };
      })
      return list;
    },
    searchOrder() {
      let webstoreList = (this.searchParams.webstoreOrderIdAll || []).filter(k => {
        return !(/^\w+-\w+$/g.test(k));
      })
      if (webstoreList.length) {
        this.$Message.error('退货订单号需要使用 "店铺号-退货订单号" 格式~');
        return;
      }
      let heavyList = (this.searchParams.heavyFactionNo || []).filter(k => {
        return !/^\w+-\w+$/g.test(k);
      })
      if (heavyList.length) {
        this.$Message.error('重派订单号需要使用 "店铺号-重派订单号" 格式~');
        return;
      }
      this.search();
    },
    statusChange(e) {
      this.search();
    },
    // 打开编辑弹窗
    openReamrkModal(row) {
      this.editReamrk.row = this.$common.copy(row);
      this.$nextTick(() => {
        this.editReamrk.visible = true;
      })
    },
    // 更新备注
    submitEditReamrk () {
      this.editReamrk.loading = true;
      this.axios.post(api.otto_updateRemark, {
        remark: this.editReamrk.row.remark,
        returnPackageId: this.editReamrk.row.returnPackageId
      }).then((res) => {
        if (!res || !res.data || res.data.code != 0) return;
        this.$Message.success('备注更新成功！');
        this.editReamrk.visible = false;
        this.$nextTick(() => {
          this.search();
        })
      }).finally(() => {
        this.editReamrk.loading = false;
      })
    }
  }
}
</script>

<style lang="less" scoped>
.returnPackage {
  flex: 1;
  overflow: hidden;
}
:deep(.ivu-input-number) {
  width: 100%;
  .ivu-input-number-handler-wrap{
    display: none;
  }
}
:deep(.remark-content){
  display: flex;
  justify-content: space-between;
  align-items: center;
  .ivu-poptip{
    .ivu-poptip-rel{
      width: 100%;
    }
  }
  .remark-txt{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .remark-icon{
    padding: 0 3px;
    color: #2d8cf0;
    font-size: 16px;
    cursor: pointer;
  }
}
</style>
