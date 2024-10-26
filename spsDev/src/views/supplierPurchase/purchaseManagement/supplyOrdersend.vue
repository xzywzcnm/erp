<template>
  <div class="mainBody">
    <Form ref="searchCriteria" class="formSearch fmb16" :model="searchCriteria" inline :label-width="90">
      <Tabs :value="tab" @on-click="tabEvent">
        <TabPane :label="item.label" :name="item.value" v-for="item in tablist" :key="item.value"></TabPane>
      </Tabs>
      <dyt-filter class="platformParamsSelect">
        <FormItem label="发货单号:">
          <dyt-input v-model="searchCriteria.supplierDespatchId" placeholder="请输入"></dyt-input>
        </FormItem>
        <FormItem label="运单号:">
          <dyt-input v-model="searchCriteria.trackingNumber" placeholder="请输入"></dyt-input>
        </FormItem>
        <FormItem label="创建时间:">
          <DatePicker transfer type="datetimerange" format="yyyy-MM-dd HH:mm" placeholder="请选择" @on-change="pickDataChange" :value="[searchCriteria.createdStartTime,searchCriteria.createdEndTime]"></DatePicker>
        </FormItem>
        <FormItem label="订单号:">
          <dyt-input v-model="searchCriteria.supplierOrderId" placeholder="请输入"></dyt-input>
        </FormItem>
        <FormItem label="物流商:">
          <dyt-select v-model="searchCriteria.logisticsId" clearable>
            <Option v-for="item in logisterList" :value="item.logisticsId" :key="item.logisticsId">{{ item.logisticsName }}</Option>
          </dyt-select>
        </FormItem>
        <FormItem label="发货单类型:">
          <dyt-select v-model="searchCriteria.despatchSource" clearable>
            <Option v-for="item in sendTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </dyt-select>
        </FormItem>
        <FormItem label="供应商:" v-if="isdevelop">
          <dyt-select v-model="searchCriteria.supplierId" clearable filterable>
            <Option v-for="item in supplerList" :value="item.supplierId" :key="item.supplierId">{{ item.supplierName }}</Option>
          </dyt-select>
        </FormItem>
        <FormItem label="备货类型:">
          <dyt-select v-model="searchCriteria.readyType" clearable>
            <Option v-for="(item, index) in purchaseList" :value="item.value" :key="index">{{ item.label }}</Option>
          </dyt-select>
        </FormItem>
        <div slot="operation">
          <Button type="primary" @click="searchForm" :disabled="SearchDisabled" icon="ios-search">查询</Button>
          <Button @click="resetForm" style="margin-left: 10px;" v-once icon="md-refresh">重置</Button>
        </div>
      </dyt-filter>

    </Form>
    <div class="operatBtn mt10 mb10">
      <Button class="mr10" type="primary" @click="markLogistic()" :disabled="this.tab !== '0' || isCansend" v-if="getPermission('supplyOrdersend_signIssuedLogistics')">标记已发物流</Button>
      <Button class="mr10" type="primary" :loading="exportLoading" @click="exportOut()" v-if="getPermission('supplyOrdersend_export')">导出</Button>
      <Button class="mr10" type="primary" @click="voidInvoice()" :disabled="this.tab !== '0' || isCansend" v-if="getPermission('supplyOrdersend_cancelDespatch')">作废发货单</Button>
      <span style="color: #1E90FF;background-color:#F0FFFF;border:1px solid;margin:10px;padding:6px">每天凌晨03:00，发货单列表自动标记已发物流，请及时交货到物流商</span>
    </div>

    <div class="table-box">
      <Table highlight-row :height="tableHeight" :columns="columns" :data="tableList" :border="true" :loading="Tableloading" @on-selection-change="selectChange" ref="iviewTable">
        <template slot-scope="{ row }" slot="sendNo">
          <div class="order-block">
            <a class="alink" href="javascript:;" @click="seeOrder(row)">{{row.supplierDespatchId || ''}}</a>
            <div>{{sendWaylist[row.despatchType]&&sendWaylist[row.despatchType].label}}</div>
            <!-- <a href="javascript:;">{{sendTypeList[row.despatchSource]&&sendTypeList[row.despatchSource].name}}</a> -->
            <Tooltip content="备货类型" :transfer="true">
              <span style="padding:2px" :style="row.readyType == 0 ? statuStyle['error'] : statuStyle['primary']" v-if="row.readyType != null">{{purchaseList[row.readyType].label}}</span>
            </Tooltip>
            <Tooltip content="发货单类型" :transfer="true">
              <span style="margin-left:5px;padding:2px" :style="statuStyle['warnning']">{{sendTypeList[row.despatchSource]&&sendTypeList[row.despatchSource].name}}</span>
            </Tooltip>
          </div>
        </template>
        <template slot-scope="{ row }" slot="logistic">
          <div class="flexCenter" v-if="row.trackingNumber">
            <a class="alink" href="javascript:;">{{row.trackingNumber}}</a>
            <Icon class="copy" type="ios-copy-outline" @click="copy(row.trackingNumber)" />
          </div>
          <div>{{row.logisticsName || ''}}</div>
        </template>
        <template slot-scope="{ row }" slot="createdTime">
          <span>{{intercepTime(row.createdTime)}}</span>
        </template>
        <template slot-scope="{ row }" slot="status">
          <a href="javascript:;">{{statusText(row.despatchStatus)}}</a>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <div class="drop-main" v-if="row.despatchSource === 1">
            <Button class="dorp-button" @click="printBox(row)" :disabled="!getPermission('supplyOrdersend_printBox')">打印箱唛</Button>
            <Dropdown @on-click="eventClick" trigger="click" class="dropdown" placement="bottom-end" :transfer="true">
              <Icon type="ios-arrow-down"></Icon>
              <DropdownMenu slot="list">
                <DropdownItem :name="'3-'+index" v-if="getPermission('supplyOrdersend_printsendOrder')">打印发货单</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div class="drop-main" v-else>
            <Button class="dorp-button" @click="maintBox(row)" :disabled="!getPermission('supplyOrdersend_fixBox')">维护箱唛</Button>
            <Dropdown @on-click="eventClick" trigger="click" class="dropdown" placement="bottom-end" :transfer="true">
              <Icon type="ios-arrow-down"></Icon>
              <DropdownMenu slot="list">
                <DropdownItem :name="'1-'+index" v-if="getPermission('supplyOrdersend_printBox')">打印箱唛</DropdownItem>
                <DropdownItem :name="'2-'+index" v-if="getPermission('supplyOrdersend_fixsendOrder')">维护发货单</DropdownItem>
                <DropdownItem :name="'3-'+index" v-if="getPermission('supplyOrdersend_printsendOrder')">打印发货单</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </template>
      </Table>

      <div class="table-page clear">
        <div class="table-page-right">
          <Page :total="proPage.total" @on-change="proChangePage" show-total :page-size="proPage.pageSize" show-elevator :current="proPage.pageNum" show-sizer @on-page-size-change="proChangePageSize" placement="top" :page-size-opts="pageArray"></Page>
        </div>
      </div>
    </div>

    <!-- 维护箱唛 -->
    <maint-boxmark :dialogObj="dialogObj" @fetch="search"></maint-boxmark>
    <!-- 打印箱唛 -->
    <print-maintbox :dialogObj="dialogBox" ref="printMaintbox"></print-maintbox>
    <!-- 维护发货单 -->
    <maintain-shipping :dialogObj="dialogShipping" :logisterList="logisterList" @fetch="search"></maintain-shipping>
    <!-- 打印发货单 -->
    <print-shippingorder :dialogObj="dialogShippingorder" ref="printShippingorder"></print-shippingorder>
    <!-- 查看发货单详情 -->
    <send-orderdetail :dialogObj="dialogOrderdetail" @printSend="printSend" :isVisible.sync="isVisible"></send-orderdetail>
  </div>
</template>
 
<script>
import api from '@/api/api';
import pagemixin from '@/components/mixin/page_mixin';
import Mixin from '@/components/mixin/common_mixin';
import maintBoxmark from './supplyOrdersend/maintBoxmark';
import printMaintbox from './supplyOrdersend/printMaintbox';
import maintainShipping from './supplyOrdersend/maintainShipping';
import printShippingorder from './supplyOrdersend/printShippingorder';
import sendOrderdetail from './supplyOrdersend/sendOrderdetail';
import { fun_date, copy_clip } from '@/utils/comfun.js';
import { titleList, tablist } from './supplyOrdersend/configFile';
import { intercepTime } from '@/utils/comfun.js';
import { purchaseList } from './supplyOrder/configFile';

export default {
  mixins: [pagemixin, Mixin],
  components: { maintBoxmark, printMaintbox, maintainShipping, printShippingorder, sendOrderdetail },
  data () {
    return {
      tableHeight: this.getTableHeight(335),
      tab: 'all',
      tablist: tablist,
      searchCriteria: {
        despatchStatus: '',
        supplierDespatchId: '',
        trackingNumber: '',
        purchaseType: '',
        readyType: '',
        createdStartTime: '',
        createdEndTime: '',
        supplierOrderId: '',
        logisticsId: '',
        despatchSource: '',
        supplierId: '',
      },
      /* purchaseTypeList: [
        { label: "全部", value: ''},
        { label: "备货", value: 0},
        { label: "急采", value: 1},
      ], */
      logisterList: [],
      sendTypeList: {
        1: { label: "商家发货单", value: 1, name: "商家" },
        0: { label: "自建发货单", value: 0, name: "自建" },
      },
      sendWaylist: {
        0: { label: "快递/物流送货", value: 0 },
        1: { label: "自送", value: 1 }
      },
      supplerList: [],
      searchFilter: false,
      columns: titleList,
      dialogObj: {
        modelVisible: false,
        data: {}
      },
      dialogBox: {
        modelVisible: false,
        data: {}
      },
      dialogShipping: {
        modelVisible: false,
        data: {}
      },
      dialogShippingorder: {
        data: {}
      },
      dialogOrderdetail: {
        source: null, // 代表由哪个页面调用此组件 0代表供应商订单管理，1代表供应商发货单列表
        modelVisible: false,
        data: {}
      },
      exportLoading: false,
      orderDetail: false,
      isdevelop: false,
      purchaseList,
      statuStyle: {
        primary: { color: '#2D8CF0', backgroundColor: 'rgba(45, 140, 240, .1)' },
        error: { color: '#EB2F96', backgroundColor: 'rgba(235, 47, 150, .1)' },
        success: { color: '#3CB034', backgroundColor: 'rgba(60, 176, 52, .1)' },
        warnning: { color: '#FF9E20', backgroundColor: 'rgba(255, 158, 32, .1)' },
        info: { color: '#5D7092', backgroundColor: 'rgba(93, 112, 146, 0.1)' },
      },
      isVisible: false
    };
  },
  created () {
    this.initAssign();
    this.isDeveloper();
    this.getLogistlist();
    this.fetch(api.despatchList, "post", "supplyOrdersend_check");
  },
  computed: {
    // 是否自建的发货单
    isCansend () {
      let columns = this.columnList;
      let online = false;
      columns.forEach(k => {
        if (k.despatchSource === 1) {
          online = true;
        }
      });
      return online;
    }
  },
  methods: {
    intercepTime,
    // 初始化赋值
    initAssign () {
      this.searchCriteria.createdStartTime = fun_date(-7)[0];
      this.searchCriteria.createdEndTime = fun_date(-7)[1];
      this.searchCriteria.despatchStatus = this.tab ? this.tab - 0 : '';
    },
    // tab选项
    tabEvent (val) {
      this.tab = val || 'all';
      this.searchCriteria.despatchStatus = val === 'all' ? '' : val - 0;
      this.searchForm();
    },
    // 查询表单
    searchForm () {
      this.search().then(() => {
        this.$refs.iviewTable.selectAll(false);
      });
    },
    // 重置表单条件
    resetForm () {
      this.reset();
      this.initAssign();
    },
    // 高级选项
    toggleClick () {
      this.searchFilter = !this.searchFilter;
    },
    // 创建时间
    pickDataChange (e) {
      this.searchCriteria.createdStartTime = e[0] ? e[0] + ':00' : '';
      this.searchCriteria.createdEndTime = e[1] ? e[1] + ':00' : '';
    },
    // 标记已发物流
    markLogistic () {
      let columnList = this.columnList;
      if (!columnList.length) {
        this.$Message.error('请勾选订单~');
        return;
      }
      this.$Modal.confirm({
        title: '操作提示',
        loading: true,
        content: `确认是否要标记发物流，数量：${columnList.length}`,
        onOk: () => {
          let temp = [];
          columnList.forEach(k => {
            temp.push({ despatchInfoID: k.id, supplierDespatchId: k.supplierDespatchId, trackingNumber: k.trackingNumber });
          });
          this.axios.post(api.signIssuedLogistics, temp).then(({ data }) => {
            if (data.code == 0) {
              this.$Message.info('操作成功');
              this.search();
            }
          }).finally(() => {
            this.$Modal.remove();
          });
        }
      });
    },
    // 作废发货单
    voidInvoice () {
      let columnList = this.columnList;
      if (!columnList.length) {
        this.$Message.error('请勾选订单~');
        return;
      }
      this.$Modal.confirm({
        title: '操作提示',
        loading: true,
        content: `确认是否要作废发货单，数量：${columnList.length}`,
        onOk: () => {
          let temp = [];
          columnList.forEach(k => {
            temp.push({ supplierDespatchId: k.supplierDespatchId });
          });
          this.axios.post(api.cancelDespatch, temp).then(({ data }) => {
            if (data.code == 0) {
              this.$Message.info('操作成功');
              this.search();
            }
          }).finally(() => {
            this.$Modal.remove();
          });
        }
      });
    },
    // 导出
    exportOut () {
      this.exportLoading = true;
      this.axios.post(api.despatchExport, this.searchCriteria).then(({ data }) => {
        if (data.code == 0) {
          this.$Message.info('导出成功');
        }
      }).finally(err => {
        this.exportLoading = false;
      });
    },
    // 查看发货单详情
    seeOrder (row) {
      if (!(this.getPermission('supplyOrdersend_queryInvoice') && row.supplierDespatchId)) return;
      this.dialogOrderdetail.source = 1;
      this.dialogOrderdetail.modelVisible = true;
      this.dialogOrderdetail.data = row;
      this.isVisible = true
    },
    // 事件切换
    eventClick (val) {
      const arr = val.split('-');
      const row = this.tableList[arr[1]] || {};
      const eventlist = { 1: 'printBox', 2: 'maintSend', 3: 'printSend' };
      this[eventlist[arr[0]]](row);
    },
    // 维护箱唛
    maintBox (row) {
      this.dialogObj.modelVisible = true;
      this.dialogObj.data = row;
    },
    // 打印箱唛
    printBox (row) {
      this.dialogBox.modelVisible = true;
      this.dialogBox.data = row;
    },
    // 维护发货单
    maintSend (row) {
      this.dialogShipping.modelVisible = true;
      this.dialogShipping.data = JSON.parse(JSON.stringify(row));
    },
    // 打印发货单
    printSend (row) {
      this.dialogShippingorder.data = row;
      this.$refs.printShippingorder.open();
    },
    // 判断登录账号是否为商品开发员
    isDeveloper () {
      this.axios.post(api.isDeveloper).then(({ data }) => {
        this.isdevelop = data.datas;
        if (!data.datas) return;
        this.getSupplierFn();
      });
    },
    // 供应商下拉列表(筛选状态为3的供应商：审批状态（1待提交，2待审核，3已审核，4已停用）)
    getSupplierFn () {
      this.axios.get(api.queryIdAndName).then(({ data }) => {
        if (data.code == 0) {
          let list = data.datas || [];
          let obj = {};
          list.forEach(k => {
            if (k.auditStatus === 3) {
              obj[k.supplierId] = k;
            }
          });
          this.supplerList = obj;
        }
      });
    },
    // 复制
    copy (str) {
      copy_clip(str, this);
    },
    // 状态
    statusText (status) {
      let name = '';
      this.tablist.forEach(k => {
        if (k.value !== 'all' && k.value == status) {
          name = k.label;
        }
      });
      return name;
    },
    // 获取快递物流商
    getLogistlist () {
      this.axios.post(api.logistics).then(({ data }) => {
        if (data.code == 0) {
          this.logisterList = data.datas || [];
        }
      });
    },
  }
};
</script>
<style scoped>
.order-block {
  padding: 4px 0;
}
.alink {
  text-decoration: underline;
}
.copy {
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}
.color-red {
  color: #a52a2a;
}
.color-blue {
  color: #0000ff;
}
</style>