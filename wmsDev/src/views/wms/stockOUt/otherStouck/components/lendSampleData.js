// lend 借出 createPicking 生成拣货单 audit 审核 distribute 分配库存 view 查看 add 添加 edit 编辑
export const pageTabData = [
  { label: '全部', name: 'all', key: 'all', total: null, val: null, index: -1 },
  { label: '订单创建', name: 'create', key: 'orderCreate', total: null, val: ['0', '1'], index: 0 },
  { label: '待审核', name: 'audit', key: 'orderReviewed', total: null, val: ['2'], index: 1 },
  { label: '待拣货', name: 'picking', key: 'orderPicking', total: null, val: ['9', '13', '20'], index: 2 },
  { label: '待借出', name: 'lend', key: 'orderBorrow', total: null, val: ['10'], index: 3 },
  { label: '待归还', name: 'giveBack', key: 'orderReturn', total: null, val: ['21'], index: 4 },
  { label: '已完成', name: 'finish', key: 'orderFinish', total: null, val: ['22'], index: 5 },
];
// 对应状态的操作
export const statusOperate = [
  { label: '分配库存', status: ['0', '1'], operate: 'distribute', key: 'allocated', power: (permission, key) => { return permission[key] } },
  { label: '审核', status: ['2'], operate: 'audit', key: 'audit', power: (permission, key) => { return permission[key] } },
  { label: '生成拣货单', status: ['20'], operate: 'createPicking', key: 'createPickin', power: (permission, key) => { return permission[key] } },
  { label: '借出', status: ['10'], operate: 'lend', key: 'product', power: (permission, key) => { return permission[key] } },
  { label: '查看', status: ['21'], operate: 'view', key: 'view', power: (permission, key) => { return permission[key] } },
  { label: '查看', status: ['22'], operate: 'view', key: 'view', power: (permission, key) => { return permission[key] } }
]