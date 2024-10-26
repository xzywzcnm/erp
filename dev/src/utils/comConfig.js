/**
 * 时间插件的配置
 */
import common from '@/utils/common';
export const timeOption = common.dateOptions();

// platformOrderStatus 状态
export const pOrderStatus = {
  temux: {
    1: 'PENDING',
    2: 'UN_SHIPPING',
    3: 'CANCELLED',
    4: 'SHIPPED',
    5: 'RECEIPTED'
  },
  default: {
    100: 'UNPAID',
    105: 'ON_HOLD',
    111: 'AWAITING_SHIPMENT',
    112: 'AWAITING_COLLECTION',
    114: 'PARTIALLY_SHIPPING',
    121: 'IN_TRANSIT',
    122: 'DELIVERED',
    130: 'COMPLETED',
    140: 'CANCELLED'
  }
}

/**
 *下载文件资源
 */
export function downFile(blob, filename) {
  if (!blob) return;
  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    document.body.appendChild(link);
    const URL = window.URL || window.webkitURL;
    link.href = URL.createObjectURL(blob);
    link.download = filename || 'filename';
    link.click();
    window.URL.revokeObjectURL(link.href);
    setTimeout(function () {
      document.body.removeChild(link);
    }, 50);
  }
}

export function getNowMonth() {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  month = month > 9 ? month : '0' + month;
  let nowMonth = year + '-' + month;
  return nowMonth;
}

/**
 * 当前时间 年月日时分秒
 **/
export const time_now = () => {
  function a(val) {
    return val < 10 ? '0' + val : val;
  }
  const date = new Date();
  return date.getFullYear() + '-' + a(date.getMonth() + 1) + '-' + a(date.getDate()) + ' ' + a(date.getHours()) + ':' + a(date.getMinutes()) + ':' + a(date.getSeconds());
}

export const warehouseTypeData = [
  { value: '0', label: '自营' },
  { value: '1', label: '第三方' },
  { value: '2', label: '订单未匹配仓库' }
]

export const clienteleEstimate = [
  { value: 'Positive', label: '好评' },
  { value: 'Neutral', label: '中评' },
  { value: 'Negative', label: '差评' },
  { value: 'None', label: '未评价' }
]

export const disputeData = [
  { value: 'CANCEL', label: '取消交易' },
  { value: 'None', label: '无纠纷' },
  { value: 'INQUIRY', label: '未收到货品' },
  { value: 'RETURN', label: '退款退货' },
  { value: 'payMent', label: '付款纠纷' }
]

// 订单检索--出库单状态
export function tableRowStatusTxt(list, rowWarehouse, isSteps) {
  const warehouse = list.filter(f => f.warehouseId === rowWarehouse.warehouseId)[0];
  if (!!warehouse && [1, '1'].includes(warehouse.warehouseType)) {
    let pos = [
      rowWarehouse.packageCreatedTime, // 创建
      rowWarehouse.trackingNumberTime, // 下发物流
      rowWarehouse.despatchTime // 结束
    ];
    const index = pos.reduce((i, j) => {
      return j ? ++i : i;
    }, -1);
    if (isSteps) return index;
    const obj = {
      0: { txt: '已创建', color: '#2d8cf0' },
      1: { txt: '已下发物流', color: '#147602' },
      2: { txt: '已发货', color: '#4400c9' }
    }
    return obj[index];
  }

  const pos = [
    rowWarehouse.packageCreatedTime, // 创建
    rowWarehouse.pickingTime, // 分配
    rowWarehouse.getLabelTime, // 下发物流
    rowWarehouse.packageGoodsStatus, // 拣货1， 2未拣货
    rowWarehouse.printTime, // 打印
    rowWarehouse.despatchTime // 结束
  ];
  let index = 6;
  for (let i = 0; i < pos.length; i++) {
    if (i === 3) { // 如果没有拣货
      if (pos[i] !== 1) index--;
    } else {
      if (!pos[i]) index--;// 其他如果没有
    }
  }
  if (isSteps) return index;
  let pickingTxt = '已分配完成';
  if ([1, 7, '1', '7'].includes(rowWarehouse.pickingStatus) || ([0, '0'].includes(rowWarehouse.pickingStatus) && rowWarehouse.pickingTime)) {
    pickingTxt = '已执行分配';
  }
  let obj = {
    0: { txt: '已创建', color: '#2d8cf0' },
    1: { txt: '已下发物流', color: '#147602' },
    2: { txt: pickingTxt, color: '#2bb92b' },
    3: { txt: '已拣货', color: '#bb35ff' },
    4: { txt: '已打印', color: '#ffa500' },
    5: { txt: '已发货', color: '#4400c9' }
  }
  let isExchange = rowWarehouse.getLabelTime === null;
  if (rowWarehouse.getLabelTime !== null && rowWarehouse.pickingTime !== null) {
    isExchange = new Date(rowWarehouse.getLabelTime).getTime() < new Date(rowWarehouse.pickingTime).getTime();
  }
  if (isExchange) {
    obj[1] = { txt: pickingTxt, color: '#2bb92b' };
    obj[2] = { txt: '已下发物流', color: '#147602' };
  }
  return obj[index - 1];
}
// 订单详情页面-费用类型(使用 amountType 的值做费用 key)
export const costTypeData = {
  // 收款
  proceeds: {
    '1': { label: '货品金额' },
    '2': { label: '买家支付运费' },
    '4': { label: '税费' },
    '5': { label: '退货产品收入' },
    '17': { label: '订单总收入' }
  },
  // 退款
  refund: {
    '13': { label: '退款' }
  },
  // 物流费用
  logisticsFee: {
    '10': { label: '物流成本' },
    '18': { label: '头程成本' },
    '25': { label: 'wish邮运费' },
    '32': { label: '偏远地区费用' }
  },
  // 商品成本
  costFfGoods: {
    '9': { label: '采购成本' },
    '28': { label: '成本折扣' }
  },
  // 补发费用
  supplyAgainFee: {
    '14': { label: '补发产品成本' },
    '20': { label: '补发采购成本' },
    '21': { label: '补发物流成本' },
    '22': { label: '补发包装成本' }
  },
  // 交易费
  tradingFee: {
    '7': { label: 'papal手续费' },
    '15': { label: '平台退款手续费' },
    '23': { label: '托管支付费用' },
    '24': { label: '跨国交易费' },
    '33': { label: '监管运营费' },
  },
  // 平台佣金
  platformCommission: {
    '6': { label: '平台佣金退回' },
    '8': { label: '平台佣金' },
    '19': { label: '调整费用' },
    '26': { label: '额外成交费' }
  },
  // 广告费
  advertisingFee: {
    '27': { label: '广告费' }
  },
  // 仓库费用
  warehouseFee: {
    '11': { label: '包装成本' },
    '29': { label: '仓库操作费' },
    '30': { label: '仓储费用' },
    '31': { label: '出仓费用' },
  },
  // 店铺费用
  shopFee: {},
  // 小计
  subtotal: {
    '999': { label: '小计' }
  },
  // 其他费用
  otherFee: {
    '3': { label: '保险' },
    '12': { label: 'VAT' },
    '16': { label: '退货物流成本' }
  }
}

// 订单详情页面-预估毛利润分类合计时不包含的类型
export const ignoreCostType = {
  // 收款
  proceeds: {
    // 默认忽略
    default: ['2', '4'],
    // 对应平台忽略的类型
    wish: ['4'],
    ebay: ['4'],
  },
  // 退款
  refund: {},
  // 物流费用
  logisticsFee: {},
  // 商品成本
  costFfGoods: {},
  // 补发费用
  supplyAgainFee: {},
  // 交易费
  tradingFee: {},
  // 平台佣金
  platformCommission: {},
  // 广告费
  advertisingFee: {},
  // 仓库费用
  warehouseFee: {},
  // 店铺费用
  shopFee: {},
  // 小计
  subtotal: {},
  // 其他费用
  otherFee: {}
}

// 订单详情页面-预估毛毛利率包含的类型(非手工单)
export const costTypeContain = {
  // 收款
  proceeds: {
    // 默认
    default: ['1'],
    // 对应平台的类型
    wish: ['1', '2'],
    ebay: ['1', '2'],
  },
  // 退款
  refund: {},
  // 物流费用
  logisticsFee: {},
  // 商品成本
  costFfGoods: {},
  // 补发费用
  supplyAgainFee: {},
  // 交易费
  tradingFee: {},
  // 平台佣金
  platformCommission: {},
  // 广告费
  advertisingFee: {},
  // 仓库费用
  warehouseFee: {},
  // 店铺费用
  shopFee: {},
  // 小计
  subtotal: {},
  // 其他费用
  otherFee: {}
}
// 订单详情页面-合计需减的项
export const costTypeSubtract = {
  // 收款
  proceeds: {
    // 默认
    default: [],
    // 对应平台的类型
    miravia: ['4']
  },
  // 退款
  refund: {},
  // 物流费用
  logisticsFee: {},
  // 商品成本
  costFfGoods: {},
  // 补发费用
  supplyAgainFee: {},
  // 交易费
  tradingFee: {},
  // 平台佣金
  platformCommission: {},
  // 广告费
  advertisingFee: {},
  // 仓库费用
  warehouseFee: {},
  // 店铺费用
  shopFee: {},
  // 小计
  subtotal: {},
  // 其他费用
  otherFee: {}
}

// 订单详情页面-预估毛毛利率不显示的类型(非手工单)
export const unviewableCostType = {
  // 收款
  proceeds: {
    // 默认
    default: [],
    // 对应平台的类型
    miravia: ['2'],
  },
  // 退款
  refund: {},
  // 物流费用
  logisticsFee: {},
  // 商品成本
  costFfGoods: {},
  // 补发费用
  supplyAgainFee: {},
  // 交易费
  tradingFee: {},
  // 平台佣金
  platformCommission: {},
  // 广告费
  advertisingFee: {},
  // 仓库费用
  warehouseFee: {},
  // 店铺费用
  shopFee: {},
  // 小计
  subtotal: {},
  // 其他费用
  otherFee: {}
}
