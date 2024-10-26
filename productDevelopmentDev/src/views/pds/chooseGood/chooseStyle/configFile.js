// 表格头
export const columns = [
  // {
  //   type: 'selection',
  //   width: 51,
  // },
  {
    title: '供款信息',
    slot: 'contri',
    width: 200,
  },
  {
    title: '供应商',
    key: 'supplierName',
    minWidth: 120
  },
  {
    title: '设计款号',
    key: 'modelNo',
    minWidth: 120
  },
  {
    title: '是否有库存',
    slot: 'isStock',
    width: 100,
  },
  {
    title: '货期（天）',
    key: 'goodDate',
    width: 100,
  },
  {
    title: '起订量',
    key: 'minimumOrderQuantity',
    width: 100,
  },
  // {
  //   title: '价格(人民币)',
  //   key: 'suggestPrice',
  //   width: 115,
  // },
  {
    title: '开发员',
    key: 'purchaserName',
    width: 115,
  },
  {
    title: '质检员',
    key: 'inspectorsName',
    width: 110,
  },
  {
    title: '创建时间',
    slot: 'createdTime',
    minWidth: 150
  },
  {
    title: '最近更新时间',
    slot: 'updatedTime',
    minWidth: 150
  },
  {
    title: '操作',
    width: 100,
    fixed: 'right',
    slot: 'action'
  },
];

// 状态
export const statusList = {
  0: { label: "待选款", value: 0 },
  // 1: { label: "待审样核价", value: 1 },
  // 2: { label: "待上架", value: 2 },
  // 3: { label: "已上架", value: 3 },
  4: { label: "审核不通过", value: 5 },
};
//是否审款
export const reviewList = {
  0: { label: "待选款", value: 0 },
  1: { label: "审款", value: 1 },
};
// 详情的表单
export const formData = {
  0: {
    electionOpinion: '',
    electionResult: [],
    isExamine: 1,
    opinion: '' // 选款意见
  },
  1: {
    examineOpinion: '',
    examineResult: [],
    opinion: '' // 审样核价意见
  },
  2: {
    spu: ''
  }
};