
import common from '@/utils/common';
export function inWareTypeObj(options) {
  let ObjKey = { label: 'label', value: 'value' };
  if (!common.isEmpty(options) && 'label' in options && 'value' in options) {
    ObjKey = options;
  }
  let temp = {
    "0": '备货入库',
    "1": '生产入库',
    "2": '调拨入库',
    "3": '退货入库',
    "4": '其他入库',
    "5": '急采入库',
    "6": '海外仓备货入库',
    "7": 'FBA备货入库',
    "8": '全托管备货入库',
    "9": '借样归还入库',
  }
  let obj = {};
  Object.keys(temp).forEach(key => {
    obj[key] = {};
    obj[key][ObjKey.label] = temp[key];
    obj[key][ObjKey.value] = key;
  })
  return obj;
}