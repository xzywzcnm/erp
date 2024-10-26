export const checkWashedData = {
  '1': { value: '1', label: '手洗', image: require("@/assets/images/handWash.png") },
  '2': { value: '2', label: '缓和干洗', image: require("@/assets/images/mildDryClean.png") },
  '3': { value: '3', label: '最高30摄氏度缓和程序机洗', image: require("@/assets/images/machineWash.png") },
  '4': { value: '4', label: '不可干洗', image: require("@/assets/images/notDryClean.png") },
  '5': { value: '5', label: '不可漂白', image: require("@/assets/images/notBleach.png") }
};

// 物料类型
export const materialTypeData = {
  '1': { label: '面料', value: 1 },
  '2': { label: '辅料', value: 2 },
  '3': { label: '衬布', value: 3 },
  '4': { label: '包装材料', value: 4 }
}
// 计量单位
export const meteringUnit = {
  '1': { label: '米', value: 1 },
  '2': { label: '码', value: 2 },
  '3': { label: '条', value: 3 },
  '4': { label: '件', value: 4 },
  '5': { label: '套', value: 5 },
  '6': { label: '个', value: 6 },
  '7': { label: '公斤', value: 7 }
}
// 工艺类型
export const craftType = {
  '0': { label: '裁剪', value: 0 },
  '1': { label: '车缝', value: 1 },
  '2': { label: '尾整', value: 2 }
}

// 二次工艺类型
export const twiceCraftType = {
  '1': { label: '物料二次工艺', value: 1 },
  '2': { label: '成衣二次工艺', value: 2 },
  '3': { label: '裁片二次工艺', value: 3 }
}
