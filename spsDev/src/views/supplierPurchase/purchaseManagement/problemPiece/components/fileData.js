// 处理类型(markValue:标记完成对应值)
export const processTypeList = {
  '0': { label: '退货', value: '0', sort: 0, color: '#996600', markValue: '2' },
  '1': { label: '销毁', value: '1', sort: 1, color: '#ff6600', markValue: '3' },
  '2': { label: '转合格上架', value: '2', sort: 3, color: '#009966', markValue: '6' },
  '3': { label: '重新质检', value: '3', sort: 2, color: '#cc66cc', markValue: '7' },
}

// 处理状态
export const processStatusList = {
  0: { label: '待退货', statusLable: '处理中' },
  1: { label: '待销毁', statusLable: '处理中' },
  2: { label: '已退货', statusLable: '处理完成' },
  3: { label: '已销毁', statusLable: '处理完成' },
  4: { label: '待转合格上架', statusLable: '处理中' },
  5: { label: '待重新质检', statusLable: '处理中' },
  6: { label: '已转合格上架', statusLable: '处理完成' },
  7: { label: '已重新质检', statusLable: '处理完成' },
}

// 质检状态下拉列表
export const checkStatusList = {
  '0': {
    label: '待质检',
    olabel: '待质检',
    value: '0'
  },
  '1': {
    label: '质检中',
    olabel: '部分质检',
    value: '1'
  },
  '2': {
    label: '质检完成',
    olabel: '质检完成',
    value: '2'
  }
}

// 质检类型
export const checkTypeList = {
  '0': {
    label: '免检',
    value: '0'
  },
  '1': {
    label: '抽检',
    value: '1'
  },
  '2': {
    label: '全检',
    value: '2'
  },
}

// 备货类型
export const readyTypeList = {
  '0': {
    label: '急采',
    value: '0'
  },
  '1': {
    label: '普通备货',
    value: '1'
  },
  '2': {
    label: '海外仓备货',
    value: '2'
  },
  '3': {
    label: 'FBA备货',
    value: '3'
  },
  '4': {
    label: '全托管备货',
    value: '4'
  },
  '5': {
    label: '直发备货',
    value: '5'
  },
}