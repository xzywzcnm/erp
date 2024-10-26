import { outListTypeList } from '@/views/wms/stockOUt/otherStouck/components/fileData.js';
export const statusList = [
  { label: '等待入库下单', value: 0 },
  { label: '下单失败', value: 3 },
  { label: '下单中', value: 1 },
  { label: '已下单', value: 2 },
  { label: '已作废', value: 4 },
]

export const expressList = {
  0: { label: '空运', value: 0 },
  1: { label: '海运散货', value: 1 },
  2: { label: '快递', value: 2 },
  3: { label: '铁运整柜', value: 3 },
  4: { label: '海运整柜', value: 4 },
  5: { label: '铁运散货', value: 5 },
}

export const warehousingType = {
  0: { label: '自发入库单', value: 0 },
}

// 海外仓同步入库单状态
export const wareStatusList = [
  { label: '全部', value: '' },
  { label: '待入库', value: 0 },
  { label: '入库中', value: 1 },
  { label: '完成入库', value: 2 },
  { label: '作废', value: 3 },
]

// 海外仓同步入库单状态对应的入库单状态
export const receiptStatusList = {
  0: { label: '草稿', value: 0 },
  1: { label: '待审核', value: 1 },
  2: { label: '审核不通过', value: 2 },
  7: { label: '海外仓在途', value: 7 },
  8: { label: '海外仓收货中', value: 8 },
  9: { label: '海外仓收货完成', value: 9 },
  10: { label: '海外仓上架完成', value: 10 },
  100: { label: '废弃', value: 100 },
}

// 所有出库单类型
export const deliveryOrderType = [
  {
    label: "销售出库",
    value: "S1",
  },
  {
    label: "调拨出库",
    value: "O1",
  },
  {
    label: "组装加工",
    value: "O2",
  },
  {
    label: "其他出库",
    value: "O3",
  },
  {
    label: "退货出库单",
    value: "O4",
  },
  ...outListTypeList,
]

// 入库单类型
export const receiptTypeList = {
  0: { label: '自发入库单', value: 0 },
  3: { label: '中转入库单', value: 3 },
  5: { label: 'FBA入库单', value: 5 },
}

// 提单类型
export const pickupFormList = {
  0: { label: '电放', value: 0 },
  1: { label: '正本', value: 1 },
}

// 货物属性
export const goodsAttributesList = {
  0: { label: '普货', value: 0 },
  1: { label: '含电池', value: 1 },
  2: { label: '纯电池', value: 2 },
  3: { label: '纺织品', value: 3 },
  4: { label: '易碎品', value: 4 },
}

// 谷仓产品状态
export const productStatusList = {
  'D': { label: '草稿', value: 'D' },
  'S': { label: '可用', value: 'S' },
  'W': { label: '审核中', value: 'W' },
  'R': { label: '审核不通过', value: 'R' },
  'X': { label: '废弃', value: 'X' },
}