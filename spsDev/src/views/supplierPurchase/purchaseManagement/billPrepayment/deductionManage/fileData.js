// 账单状态: 0无账单,1待提交,2待审核,3待复核,4待付款,5已完成，99：账单作废，999：手动完成
export const billOptionList = {
  0: { label: '无账单', value: 0 },
  1: { label: '待提交', value: 1 },
  2: { label: '待审核', value: 2 },
  3: { label: '待复核', value: 3 },
  4: { label: '待付款', value: 4 },
  5: { label: '已完成', value: 5 },
  999: { label: '无账单', value: 999, hideSelect: true },
  99: { label: '无账单', value: 99, hideSelect: true },
}

// 汇总状态，1：未完成，2：已完成
export const deductionList = {
  1: { label: '未完成', value: 1 },
  2: { label: '已完成', value: 2 },
}