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