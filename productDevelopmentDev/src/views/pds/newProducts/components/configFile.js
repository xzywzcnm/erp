// 表格头
export const columns = [
  {
    type: 'selection',
    width: 54,
  },
  {
    title: '基本信息',
    slot: 'basic',
    minWidth: 200,
  },
  {
    title: 'spu',
    slot: 'referenceSpu',
    minWidth: 90,
  },
  {
    title: '商品末级分类',
    slot: 'supplierName',
    width: 100,
  },
  {
    title: '款号',
    key: 'modelNo',
    width: 100,
  },
  {
    title: '开发类型',
    slot: 'productSource',
    width: 100,
  },
  {
    title: '供应商',
    slot: 'supplierId',
    width: 120,
  },
  // {
  //   title: '是否现货',
  //   slot: 'isStock',
  //   width: 90,
  // },
  {
    title: '货期(天)',
    key: 'goodDate',
    width: 80,
  },
  {
    title: '起订量',
    key: 'minimumOrderQuantity',
    width: 90,
  },
  // {
  //   title: '价格（人民币）',
  //   key: '',
  //   width: 130,
  // },
  {
    title: '状态',
    slot: 'status',
    width: 100,
  },
  {
    title: '待办人',
    slot: 'requireVerifyBy',
    width: 140,
  },
  {
    title: '创建人/创建时间',
    slot: 'create',
    width: 160,
  },
  {
    title: '最后操作人/最后更新时间',
    slot: 'finally',
    width: 160,
  },
  {
    title: '操作',
    width: 100,
    slot: 'action',
    fixed: 'right'
  },
];

// 开发类型
export const sourceTypelist = {
  0: { name: "新建-备货开发", value: 0 },
  1: { name: "推款-备货开发", value: 1 },
  2: { name: "推款-云仓开发", value: 2 },
  3: { name: "新建-云仓开发", value: 3 },
  4: { name: "采集-云仓开发", value: 4 },
  5: { name: "打版开发", value: 5 },
}

// 打版表格列设置
export const plateColumns = [
  {
    type: 'selection',
    width: 54,
  },
  {
    title: '图片',
    slot: 'basic',
    minWidth: 100,
  },
  {
    title: '款式名称',
    key: 'styleName',
    minWidth: 100,
  },
  {
    title: '款号',
    key: 'modelNo',
    width: 110,
  },
  {
    title: 'SPU',
    key: 'referenceSpu',
    width: 120,
  },
  {
    title: '商品末级分类',
    slot: 'supplierName',
    minWidth: 110,
  },
  {
    title: '状态',
    slot: 'status',
    width: 140,
  },
  {
    title: '待办人',
    slot: 'requireVerifyBy',
    width: 140,
  },
  {
    title: '创建人/创建时间',
    slot: 'create',
    width: 180,
  },
  {
    title: '最后操作人/最后更新时间',
    slot: 'finally',
    width: 180,
  },
  {
    title: '操作',
    width: 100,
    slot: 'action',
    fixed: 'right'
  },
];
// 打版状态
export const plateStatusList = [
  { label: '全部', value: 21, num: 'totalCnt' },
  { label: '全部处理中', value: 0, num: 'processCnt' },
  { label: '创建', value: 1, num: 'createCnt' },
  { label: '待审需求', value: 19, num: 'reqValidateCnt' },
  { label: '待打版', value: 15, num: 'patternCnt' },
  { label: '待审版', value: 16, num: 'patternVerifyCnt' },
  { label: '待完善样衣资料', value: 20, num: 'perfectSampleCnt' },
  { label: '待估价', value: 17, num: 'evaluateCnt' },
  { label: '待核价', value: 18, num: 'evaluateVerifyCnt' },
  { label: '待完善商品资料', value: 13, num: 'perfect' },
  { label: '待完善图片', value: 6, num: 'pictureCompleteCnt' },
  { label: '待完善文本', value: 7, num: 'infoCompleteCnt' },
  { label: '待审核图片', value: 8, num: 'pictureVerifyCnt' },
  { label: '待审核文本', value: 9, num: 'infoVerifyCnt' },
  { label: '侵权审款', value: 3, num: 'infringementVerifyCnt' },
  { label: '待同步到商品', value: 10, num: 'createSKUCnt' },
  { label: '已取消', value: 11, num: 'giveUpCnt' },
  { label: '已完成', value: 12, num: 'completeCnt' }
];

// 打版-对应状态按钮信息(tag:对应详情button页面；btnoperat:对应按钮,productSource:区分备货和云仓；参考开发类型)
export const statusButton = [
  {
    label: '创建', value: 0, productSource: [5], btn: [
      { name: '修改基础资料', tag: 'basicData', btnoperat: 'subverify' },
      { name: '修改打版资料', tag: 'editBasicData', btnoperat: 'edit', productSource: [5] },
    ]
  },
  {
    label: '待审需求', value: 17, productSource: [5], btn: [
      { name: '需求审核', tag: 'materialData', btnoperat: 'materialConfirm' },
    ]
  },
  {
    label: '待制作样衣', value: 13, productSource: [5], btn: [
      { name: '样衣制作', tag: 'sampleManufacturing', btnoperat: 'sampleConfirm' },
    ]
  },
  {
    label: '待样衣审核', value: 14, productSource: [5], btn: [
      { name: '样衣审核', tag: 'editBasicData', btnoperat: 'sDressConfirm' }
    ]
  },
  {
    label: '待完善样衣资料', value: 18, productSource: [5], btn: [
      { name: '完善样衣资料', tag: 'sampleManufacturing', btnoperat: 'perfectSample' }
    ]
  },
  {
    label: '待价格估算', value: 15, productSource: [5], btn: [
      { name: '价格估算', tag: 'sampleDressAudit', btnoperat: 'pEvaluationConfirm' },
    ]
  },
  {
    label: '待价格确认', value: 16, productSource: [5], btn: [
      { name: '价格确认', tag: 'priceConfirmation', btnoperat: 'pConfirmation' },
    ]
  },
  {
    label: '待完善商品资料', value: 2, productSource: [5], btn: [
      { name: '填写商品资料', tag: 'commodityInformation', btnoperat: 'filInfo' },
    ]
  },
  {
    label: '待完善图片', value: 5, productSource: [5], sonValue: 'pic' + 0, btn: [
      { name: '指派完善图片', value: 'pic' + 0, tag: 'pictureMaterial', btnoperat: 'assignPic' },
    ]
  },
  {
    label: '待完善文本', value: 5, productSource: [5], sonValue: 'text' + 0, btn: [
      { name: '指派完善文本', value: 'text' + 0, tag: 'textMaterial', btnoperat: 'assignData' },
    ]
  },
  {
    label: '待完善图片', value: 5, productSource: [5], sonValue: 'pic' + 1, btn: [
      { name: '完善图片', value: 'pic' + 1, tag: 'pictureMaterial', btnoperat: 'finishPic' },
    ]
  },
  {
    label: '待完善文本', value: 5, productSource: [5], sonValue: 'text' + 1, btn: [
      { name: '完善文本', value: 'text' + 1, tag: 'textMaterial', btnoperat: 'finishData' },
    ]
  },
  {
    label: '待审核图片', value: 5, productSource: [5], sonValue: 'pic' + 2, btn: [
      { name: '审核图片', value: 'pic' + 2, tag: 'pictureMaterial', btnoperat: 'verifyPic' },
    ]
  },
  {
    label: '待审核文本', value: 5, productSource: [5], sonValue: 'text' + 2, btn: [
      { name: '审核文本', value: 'text' + 2, tag: 'textMaterial', btnoperat: 'verifyData' },
    ]
  },
  {
    label: '侵权审核', value: 6, productSource: [5], btn: [
      { name: '侵权审核', tag: 'basicData', btnoperat: 'verifyPower' },
    ]
  },

  {
    label: '待同步到商品', value: 11, productSource: [5], btn: [
      { name: '同步到商品', tag: 'generateSku', btnoperat: 'becomeSku' },
    ]
  },
  // {
  //   label: '待同步Listing', value: 12, productSource: [5], btn: [
  //     { name: '同步Listing', tag: 'generateSku', btnoperat: 'becomeSku' },
  //   ]
  // },
  { label: '不通过', value: 8, productSource: [5] },
  { label: '已完成', value: 10, productSource: [5] },
  { label: '已取消', value: 9, productSource: [5] },
];

// 状态
export const totalStatusList = [
  { label: '全部处理中', value: 0, num: 'processCnt' },
  { label: '创建', value: 1, num: 'createCnt' },
  { label: '待审款', value: 2, num: 'productVerifyCnt' },
  { label: '完善商品资料', value: 13, num: 'perfect' },
  { label: '审核基础资料', value: 14, num: 'examine' },
  { label: '待审样核价', value: 4, num: 'samplePriceCnt' },
  // { label: '待取样', value: 5, num: 'samplingCnt' },
  { label: '待完善图片', value: 6, num: 'pictureCompleteCnt' },
  { label: '待完善文本', value: 7, num: 'infoCompleteCnt' },
  { label: '待审核图片', value: 8, num: 'pictureVerifyCnt' },
  { label: '待审核文本', value: 9, num: 'infoVerifyCnt' },
  { label: '侵权审款', value: 3, num: 'infringementVerifyCnt' },
  { label: '待同步SKU', value: 10, num: 'createSKUCnt' },
  { label: '不通过/已取消', value: 11, num: 'giveUpCnt' },
  { label: '已完成', value: 12, num: 'completeCnt' },
];


//任务状态
export const taskStatusList = {
  0: { label: "全部", value: 0 },
  1: { label: "待办", value: 1 },
  2: { label: "已办", value: 2 },
  3: { label: "我创建的", value: 3 },
};

//开发类型
export const developTypeList = {
  0: { label: "全部", value: 0 },
  1: { label: "云仓", value: 1 },
  2: { label: "备货", value: 2 },
  3: { label: "打版", value: 3 },
};

// 新品状态(tag:对应详情button页面；btnoperat:对应按钮,productSource:区分备货和云仓；参考开发类型)
export const statusList = [
  {
    label: '创建', value: 0, productSource: [0, 1], btn: [
      { name: '提交审款', tag: 'basicData', btnoperat: 'subverify' },
      { name: '修改', tag: 'basicData', btnoperat: 'edit', productSource: [0, 1] },
    ]
  },
  {
    label: '创建', value: 0, productSource: [2, 3, 4], btn: [
      // {name: '提交商品审核人', tag: '', btnoperat: ''},
      //{name: '编辑', tag: '', btnoperat: ''},
      { name: '完善基础资料', tag: '', btnoperat: '' },
    ]
  },
  {
    label: '待审款', value: 1, productSource: [0, 1], btn: [
      { name: '审款', tag: 'basicData', btnoperat: 'verifyStyle' },
    ]
  },
  {
    label: '侵权审核', value: 6, productSource: [0, 1, 2, 3, 4], btn: [
      { name: '侵权审核', tag: 'basicData', btnoperat: 'verifyPower' },
    ]
  },
  {
    label: '完善商品资料', value: 2, productSource: [0, 1, 2, 3, 4], btn: [
      { name: '填写商品资料', tag: 'commodityInformation', btnoperat: 'filInfo' },
    ]
  },
  {
    label: '审核商品资料', value: 3, productSource: [0, 1], btn: [
      { name: '审核商品资料', tag: 'commodityInformation', btnoperat: 'verifyInfo' },
    ]
  },
  {
    label: '待审样核价', value: 4, productSource: [0, 1], btn: [
      { name: '审样核价', tag: 'sampleReview', btnoperat: 'verifyPrice' },
    ]
  },
  // { label: '待取样', productSource:[0,1], value: 5 },
  {
    label: '待完善图片', value: 5, productSource: [0, 1, 2, 3, 4], sonValue: 'pic' + 0, btn: [
      { name: '指派完善图片', value: 'pic' + 0, tag: 'pictureMaterial', btnoperat: 'assignPic' },
    ]
  },
  {
    label: '待完善文本', value: 5, productSource: [0, 1, 2, 3, 4], sonValue: 'text' + 0, btn: [
      { name: '指派完善文本', value: 'text' + 0, tag: 'textMaterial', btnoperat: 'assignData' },
    ]
  },
  {
    label: '待完善图片', value: 5, productSource: [0, 1, 2, 3, 4], sonValue: 'pic' + 1, btn: [
      { name: '完善图片', value: 'pic' + 1, tag: 'pictureMaterial', btnoperat: 'finishPic' },
    ]
  },
  {
    label: '待完善文本', value: 5, productSource: [0, 1, 2, 3, 4], sonValue: 'text' + 1, btn: [
      { name: '完善文本', value: 'text' + 1, tag: 'textMaterial', btnoperat: 'finishData' },
    ]
  },
  {
    label: '待审核图片', value: 5, productSource: [0, 1, 2, 3, 4], sonValue: 'pic' + 2, btn: [
      { name: '审核图片', value: 'pic' + 2, tag: 'pictureMaterial', btnoperat: 'verifyPic' },
    ]
  },
  {
    label: '待审核文本', value: 5, productSource: [0, 1, 2, 3, 4], sonValue: 'text' + 2, btn: [
      { name: '审核文本', value: 'text' + 2, tag: 'textMaterial', btnoperat: 'verifyData' },
    ]
  },

  // {
  //   label: '待同步SKU', value: 7, productSource: [0, 1, 2, 3, 4], btn: [
  //     { name: '同步SKU', tag: 'generateSku', btnoperat: 'becomeSku' },
  //   ]
  // },
  {
    label: '待同步ERP', value: 11, productSource: [0, 1, 2, 3, 4], btn: [
      { name: '同步ERP', tag: 'generateSku', btnoperat: 'becomeSku' },
    ]
  },
  {
    label: '待同步Listing', value: 12, productSource: [0, 1, 2, 3, 4], btn: [
      { name: '同步Listing', tag: 'generateSku', btnoperat: 'becomeSku' },
    ]
  },


  { label: '不通过', value: 8, productSource: [0, 1, 2, 3, 4] },
  { label: '已完成', value: 10, productSource: [0, 1, 2, 3, 4] },
  { label: '已取消', value: 9, productSource: [0, 1, 2, 3, 4] },
];

// 待办任务表头
export const toDocolumns = [
  {
    title: '基本信息',
    slot: 'basic',
    minWidth: 180,
  },
  {
    title: '商品末级分类',
    slot: 'supplierName',
    minWidth: 110,
  },
  {
    title: '款号',
    key: 'modelNo',
    minWidth: 110,
  },
  {
    title: 'SPU',
    key: 'referenceSpu',
    width: 100,
  },
  {
    title: '开发类型',
    slot: 'productSource',
    width: 120,
  },
  {
    title: '供应商',
    slot: 'supplierId',
    minWidth: 140,
  },
  /* {
    title: '是否现货',
    slot: 'isStock',
    width: 90,
  }, */
  {
    title: '状态',
    slot: 'status',
    width: 140,
  },
  {
    title: '创建人/创建时间',
    slot: 'create',
    minWidth: 130,
  },
  {
    title: '最后操作人/最后更新时间',
    slot: 'finally',
    minWidth: 160,
  },
  {
    title: '操作',
    width: 100,
    slot: 'action',
    fixed: 'right'
  },
];
