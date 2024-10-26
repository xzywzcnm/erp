<template>
  <div class="allocation-list">
    <!--货箱信息-->
    <div class="list-tit">
      <span>货箱信息</span>
      <span @click="changeShow">
        <Icon :type="assignListShow ? 'ios-arrow-up' : 'ios-arrow-down'" class="list-ico"></Icon>
      </span>
    </div>

    <!--分配表格-->
    <div style="margin-bottom:20px;" v-if="assignListShow">
      <Table highlight-row border :columns="columns" :data="data" :loading="tableLoading"></Table>
    </div>

    <!-- 货箱信息 -->
    <packing-information-detail ref="packingInformationDetail" :modelVisible.sync="packingInfoModel"
      :detailData="detailData" :pickingData="pickingData"></packing-information-detail>

    <!-- 打印标签 -->
    <print-common ref="printCommon" :printModal.sync="printModal" :printData="printData" :pintField="pintField">
    </print-common>

    <!-- 填写发货单号 -->
    <shipment-no :modelVisible.sync="sendVisible" :detailData="detailData" :sendData="sendData"
      @refreshDetail="refreshDetail"></shipment-no>
  </div>
</template>

<script>
import Big from 'big.js';
import api from '@/api/api';
import shipmentNo from './shipmentNo';
import packingInformationDetail from './packingInformationDetail';
import printCommon from '@/views/wms/components/pirntCommon/index';
import { boxLabel, temuLabel } from '@/views/wms/stockOUt/otherStouck/components/fileData.js';

// temu 时的列
const temuColKey = ['rowIndex', 'boxCode', 'platSku', 'boxFinishTime', 'status', 'operation'];
// 默认列
const defaultColKey = [
  'rowIndex', 'boxCode', 'lengthWidthHeight', 'weight', 'throwingWeight', 'throwingWeightRatio', 'boxFinishTime',
  'status', 'operation'
];

export default {
  name: 'packingInformation',
  components: { packingInformationDetail, printCommon, shipmentNo },
  props: {
    detailData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      data: [],
      assignListShow: true,
      packingInfoModel: false,
      pickingData: {},
      printModal: false, // 打印弹框
      printData: [], // 打印的数据
      tableLoading: false, // 表格加载
      sendVisible: false, // 发货弹框
      sendData: {}, // 发货箱号信息
    }
  },
  watch: {
    detailData: {
      handler(val) {
        if (!val.pickingId) return;
        this.setData(JSON.parse(JSON.stringify(val)));
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    // 根据不同出库类型不同打印内容
    pintField() {
      let { pickingType, pickingSubType } = this.detailData || {};
      !pickingType && (pickingType = 'O5');// 不存在出库单类型，则默认为FBA出库单
      if (pickingType === 'O11') {
        let str = 'box' + pickingSubType;
        return temuLabel[str] || {};
      } else {
        return boxLabel[pickingType] || {};
      }
    },
    // 表头
    columns() {
      let { pickingType, pickingNewStatus, pickingSubType } = this.detailData || {};
      let [isTemuSend, isTemu] = [this.isTemuSend, (pickingType === 'O11')];
      let isTemuStockup = pickingType === 'O11' && pickingSubType === 1;// temu备货
      // 动态添加
      const dynamicList = [
        {
          title: '行号',
          width: 90,
          rowKey: 'rowIndex',
          align: 'center',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        },
        {
          title: '货箱编号',
          align: 'center',
          rowKey: 'boxCode',
          render: (h, params) => {
            return h('a', {
              on: {
                click: () => {
                  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                  this.pickingData = params.row || {};
                  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                  this.packingInfoModel = true;
                }
              }
            }, params.row.boxCode);
          }
        },
        {
          title: '平台SKC',
          align: 'center',
          rowKey: 'platSku',
          // 后端确认， temu 的 平台SKC 就是 platSku
          key: 'platSku'
        },
        {
          title: '货箱尺寸',
          align: 'center',
          rowKey: 'lengthWidthHeight',
          render: (h, params) => {
            return h('div', {}, [
              h('span', {}, (params.row.length || 0) + 'cm'),
              h('span', {}, '*' + (params.row.width || 0) + 'cm'),
              h('span', {}, '*' + (params.row.height || 0) + 'cm')
            ]);
          }
        },
        {
          title: '货箱整箱称重',
          align: 'center',
          key: 'weight',
          rowKey: 'weight',
          render: (h, params) => {
            return h('span', {}, (params.row.weight || 0) + 'kg');
          }
        },
        {
          title: '计抛重量',
          align: 'center',
          rowKey: 'throwingWeight',
          width: 100,
          render: (h, params) => {
            return h('span', {}, (params.row.throwingWeight || 0) + 'kg');
          }
        },
        {
          title: '抛重比',
          align: 'center',
          rowKey: 'throwingWeightRatio',
          width: 100,
          render: (h, params) => {
            return h('span', {}, (params.row.throwingWeightRatio || 0) + '%');
          }
        },
        {
          title: '完成装箱时间',
          align: 'center',
          rowKey: 'boxFinishTime',
          key: 'boxFinishTime',
          render: (h, params) => {
            return h('div', {}, this.$uDate.dealTime(params.row.boxFinishTime));
          }
        },
        {
          title: '货箱状态',
          rowKey: 'status',
          align: 'center',
          render: (h, params) => {
            let type = { 0: '正在装箱', 1: '已装箱' };
            return h('span', {}, type[params.row.status] || '');
          }
        },
        {
          title: '操作',
          align: 'center',
          rowKey: 'operation',
          width: isTemu ? 370 : 230,
          render: (h, params) => {
            let arr = [];
            // temu备货 且 装箱完成
            if (isTemuStockup && ['11', '12', '8', '4'].includes(pickingNewStatus)) {
              arr.push(h('Button', {
                style: {
                  display: params.row.status === 0 ? 'none' : 'inline-block'
                },
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                    this.sendData = params.row || {};
                    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                    this.sendVisible = true;
                  }
                }
              }, params.row.deliveryOrderSn ? params.row.deliveryOrderSn : '填写发货单号'))
            }
            return h('div', {
              style: {
                // textAlign: 'left',
                padding: '6px 0',
              }
            }, [
              h('Button', {
                style: {
                  marginRight: '6px',
                  display: params.row.status === 0 ? 'none' : 'inline-block'
                },
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.exportExcel(params.row);
                  }
                }
              }, '导出明细'),
              h('Button', {
                props: {
                  size: 'small',
                },
                style: {
                  marginRight: '6px',
                },
                on: {
                  click: () => {
                    this.printBoxLabel(params.row);
                  }
                }
              }, isTemuSend ? '打印打包标签' : '打印货箱标签'),
              ...arr,
            ]);
          }
        }
      ];
      // temu 时
      if (isTemu) {
        return dynamicList.filter(col => {
          return temuColKey.includes(col.rowKey)
        })
      }
      // 默认
      return dynamicList.filter(col => {
        return defaultColKey.includes(col.rowKey)
      })
    },
    // 是否temu寄样
    isTemuSend() {
      let { pickingType, pickingSubType } = this.detailData || {};
      return pickingType === 'O11' && pickingSubType === 0;
    }
  },
  methods: {
    // 计抛重量=体积（长cm*宽cm*高cm）/ 6000 两位小数，四舍五入
    throwingWeight(row) {
      let { length, width, height } = row;
      let num = Number(new Big(length || 0).times(width || 0).times(height || 0));
      if (num > 0) {
        num = parseFloat(new Big(num).div(6000)).toFixed(2);
        num = Number(new Big(num).times(100).div(100));
      }
      return num;
    },
    // 抛重比=计抛重量/重量 百分比，两位小数，四舍五入
    throwingWeightRatio(throwingWeight, { weight }) {
      let num = 0;
      if (throwingWeight > 0 && weight > 0) {
        num = parseFloat(new Big(throwingWeight).div(weight).times(100)).toFixed(2);
        num = Number(new Big(num).times(100).div(100));
      }
      return num;
    },
    setData(val) {
      let pickingBoxes = val.pickingBoxes || {};
      let list = pickingBoxes.pickingBoxesVOS || [];
      this.data = list.map(k => {
        k.throwingWeight = this.throwingWeight(k);
        k.throwingWeightRatio = this.throwingWeightRatio(k.throwingWeight, k);
        return k;
      })
    },
    changeShow() {
      this.assignListShow = !this.assignListShow;
    },
    // 导出明细
    exportExcel(row) {
      let { pickingId, pickingType, pickingSubType } = this.detailData;
      let params = {};
      params.pickingId = pickingId;
      params.pickingBoxNo = row.boxCode;
      let [value, exportTypeList] = [null, { 'O10': 1, 'O13': 4 }];
      // exportType: 0普通 1万邑通 2备货 3寄样 4FBK
      if (pickingType === 'O11') {
        value = pickingSubType == 1 ? 2 : 3;
      } else if (exportTypeList[pickingType]) {
        value = exportTypeList[pickingType];
      }
      value && (params.exportType = value);

      this.tableLoading = true;
      this.axios({
        method: 'get',
        url: api.wmsPickingBoxesExcel,
        params: params,
        responseType: 'blob',
        timeout: 600000
      }).then(resData => {
        if (!resData.resData) return;
        this.$Message.success('导出成功');
        this.$common.downFile(resData.resData, resData.filename);
      }).finally(() => {
        this.tableLoading = false;
      })
    },
    // 打印货箱标签
    printBoxLabel(row) {
      this.printData = [];
      let [printData, str] = [{}, ''];
      printData.printNum = 1;
      // temu寄样需要打印另外格式的包标签
      if (this.isTemuSend) {
        str = row.platSku;
      } else {
        str = row.boxCode;
      }
      printData.barCode = printData.boxCode = str;
      this.printData.push(printData);
      this.printModal = true;
    },
    // 更新出库单详情
    refreshDetail() {
      this.$emit('searchData');
    }
  }
}
</script>

<style lang="less" scoped>
.allocation-list {
  .list-tit {
    font-size: 16px;
    padding: 15px 0;
  }

  .list-ico {
    font-size: 18px;
    cursor: pointer;
  }
}
</style>
