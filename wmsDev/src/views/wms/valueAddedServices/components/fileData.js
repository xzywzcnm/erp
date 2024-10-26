export const documTypeList = {
  0: {
    label: '销售出库',
    value: 0,
  },
  1: {
    label: '其他出库',
    value: 1,
  },
  2: {
    label: '借样出库',
    value: 2,
  },
  3: {
    label: '全托管出库',
    value: 3,
  },
  4: {
    label: '海外仓出库',
    value: 4,
  },
}

export const valAddList = {
  0: {
    label: '抽真空',
    value: 0,
    type: [1, 2],
  },
  1: {
    label: '换包装',
    value: 1,
    type: [1, 2],
  },
  2: {
    label: '质检',
    value: 2,
    type: [2],
  },
  3: {
    label: '海外仓装车',
    value: 3,
    type: [2],
  },
  4: {
    label: '贴环保标',
    value: 4,
  },
}