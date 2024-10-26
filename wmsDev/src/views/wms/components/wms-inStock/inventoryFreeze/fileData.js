// 冻结状态
export const statusList = [
  {
    label: "全部",
    value: "",
  },
  {
    label: "待冻结",
    value: 1,
  },
  {
    label: "已冻结",
    value: 2,
  },
  {
    label: "部分解冻",
    value: 3,
  },
  {
    label: "已解冻",
    value: 0,
  },
]

// 冻结方式
export const frozenTypeList = {
  0: {
    label: "自动",
    value: 0,
  },
  1: {
    label: "人工",
    value: 1,
  },
}