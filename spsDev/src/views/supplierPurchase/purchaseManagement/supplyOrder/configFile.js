//表头提示
function renderHeader1(h, params) {
  return h('tooltip',
    {
      props: {
        transfer: true,
        maxWidth: '400'
      }
    },
    [
      h('span', { style: { color: '#19be6b' } }, params.column.title),
      h('div',
        {
          'class': {
            'custom-tooltip-content': true
          },
          slot: 'content'
        },
        [
          h('div', '当业务角色不为“产品开发员”或“产品开发主管”时，供应商名称用"*****"代替')
        ]
      )
    ]
  );
}

export const titleList = [
  {
    type: 'selection',
    align: "center",
    width: 50,
  },
  {
    title: '基本信息（订单数：0）',
    slot: 'basic',
    width: 300
  },
  // {
  //   title: '规格',
  //   key: 'specifications',
  //   width: 110,
  // },

  {
    title: '库存',
    slot: 'stock',
    width: 80,
  },
  {
    title: '下单',
    slot: 'threeNum',
    width: 100,
  },
  {
    title: '下单时间',
    slot: 'salesTime',
    width: 90,
  },
  {
    title: '要求收货时间',
    width: 100,
    slot: 'sendTime',
  },
  {
    title: '发货物流',
    slot: 'logistic',
    width: 200,
    key: 'age'
  },
  {
    title: '发货',
    slot: 'deliver',
    width: 95,
  },
  {
    title: '收货',
    slot: 'receive',
    width: 95,
  },
  {
    title: '价格',
    slot: 'price',
    width: 85,
  },
  {
    title: '仓库/采购员',
    slot: 'warehouse',
    width: 100,
  },
  {
    title: '发货要求/备注',
    slot: 'requireDespatch',
    minWidth: 100,
  },
  {
    title: '供应商',
    key: 'supplierName',
    slot: 'supplierName',
    width: 180,
    renderHeader: renderHeader1,
  },
  /* {
    title: '采购员',
    key: 'purchaserName',
    width: 100,
  }, */
];

export const tablist = [
  { label: "全部", value: 'all' },
  { label: "待确认", value: '0', num: null },
  { label: "待发货", value: '1', num: null },
  { label: "加入发货台", value: '2', num: null },
  { label: "待发物流", value: '3' },
  { label: "已发物流", value: '4' },
  { label: "收货中", value: '5', num: null },
  { label: "收货完成", value: '6' },
  { label: "已取消", value: '7' },
];

/* export const stockTypelist = {
  0: { label: "急采", value: 0 },
  1: { label: "普通备货", value: 1 },
  2: { label: "海外仓备货", value: 2 },
  3: { label: "FBA备货", value: 3 },
}; */
export const purchaseTypeList = [
  { value: 1, label: '急采' },
  { value: 2, label: '普通备货' },
  { value: 3, label: '海外仓备货' },
  { value: 4, label: 'FBA备货' },
];

export const supplyStatusList = {
  0: { label: "正常供货", value: 0 },
  1: { label: "暂时缺货", value: 1 },
  2: { label: "停产", value: 2 },
};

export const progressList = {
  0: { label: "未生产", value: 0 },
  1: { label: "生产中", value: 1 },
  2: { label: "生产完成", value: 2 },
};
export const checkFlagList = [
  { label: "需检", value: 0 },
  { label: "免检", value: 1 },
];
export const receiptDetailStatusList = [
  { label: "创建状态", value: 0 },
  { label: "部分收货", value: 1 },
  { label: "完全收货", value: 2 },
  { label: "超量收货", value: 3 },
];
export const receiptTypeList = [
  { label: "备货入库", value: 0 },
  { label: "生产入库", value: 1 },
  { label: "调拨入库", value: 2 },
  { label: "退货入库", value: 3 },
  { label: "其他入库", value: 4 },
  { label: "急采入库", value: 5 },
];
export const receiptStatusList = {
  0: { label: "入库单创建", value: 0 },
  1: { label: "入库单取消", value: 1 },
  2: { label: "入库单关闭", value: 2 },
  3: { label: "收货中", value: 3 },
};
export const purchaseList = {
  0: { label: "急采", value: 0 },
  1: { label: "普通备货", value: 1 },
  2: { label: "海外仓备货", value: 2 },
  3: { label: "FBA备货", value: 3 },
  4: { label: "全托管备货", value: 4 },
  5: { label: "直发备货", value: 5 },
};
export const examineStatusList = [
  { value: 1, label: '待提交' },
  { value: 2, label: '待审核' },
  { value: 3, label: '待下单' },
  { value: 4, label: '已下单' },
  { value: 5, label: '已作废' },
  { value: 6, label: '采购作废' },
  { value: 7, label: '已关闭' },
];
export const alibabaList = [
  { value: 1, label: '登宇通888' },
  { value: 2, label: '东东派888' },
  { value: 3, label: '佛山万跃达' },
  { value: 4, label: '卓尚666' },
  { value: 5, label: '德路通DLT' },
];

export const stockList = [
  {
    title: '图片',
    slot: 'pic',
    width: 82,
  },
  {
    title: '基本信息',
    slot: 'basic',
    width: 200
  },
  {
    title: '规格',
    key: 'specifications',
    width: 120,
  },
  {
    title: '下单时间',
    slot: 'salesTime',
    width: 100,
  },
  {
    title: '下单数量',
    key: 'salesNumber',
    width: 90,
  },
  {
    title: '发货',
    align: 'center',
    minWidth: 100,
    children: [
      {
        title: '发货数量',
        key: 'despatchNumber',
      },
      {
        title: '未发货数量',
        key: 'notDespatchNumber',
      }
    ]
  },
  {
    title: '收货',
    align: 'center',
    minWidth: 100,
    children: [
      {
        title: '收货正品数',
        key: 'qualityNumber',
      },
      {
        title: '收货次品数',
        key: 'substandardNumber',
      },
      {
        title: '未收货数量',
        key: 'notReceivedNumber',
      }
    ]
  },
  {
    title: '取消数量',
    slot: 'cancelNum',//surplusQuantity
    width: 90,
  },
];

export const invoinceList = [
  {
    title: '图片',
    slot: 'pic',
  },
  {
    title: '基本信息',
    slot: 'basic',
    width: 200
  },
  {
    title: '规格',
    key: 'specifications',
    width: 120,
  },
  {
    title: '下单时间',
    slot: 'salesTime',
    width: 100,
  },
  {
    title: '待发数量',
    key: 'notDespatchNumber'
  },
  {
    title: '发货数量',
    slot: 'despatchNumber',
    width: 180
  },
  {
    title: '欠发数量',
    key: 'notDespatchNumber'
  },
];

export const detailList = [
  {
    title: '基本信息',
    slot: 'basic',
    width: 340
  },
  {
    title: '生产要求',
    slot: 'outPackRequire',
    minWidth: 200,
  },
  {
    title: '下单',
    slot: 'threeNum',
    width: 100,
  },
  {
    title: '下单时间',
    slot: 'salesTime',
    width: 110,
  },
  {
    title: '要求收货时间',
    slot: 'requireDespatchTime',
    width: 110,
  },
  {
    title: '发货',
    slot: 'deliver',
    width: 100,
  },

  {
    title: '收货',
    slot: 'receive',
    width: 100,
  },
  {
    title: '价格',
    slot: 'price',
    width: 120,
  },
  /* {
    title: '备货类型',
    slot: 'stockType',
    width: 120,
  }, */
  {
    title: '水洗唛描述信息',
    slot: 'washedLabel',
    minWidth: 200,
  },
  {
    title: '水洗唛(PDF/JPG/PNG)',
    slot: 'washedLabelPDF',
    minWidth: 200,
  },
  {
    title: '备注',
    slot: 'remark',
    minWidth: 120,
  },
];

export const PurDetailList = [
  {
    title: '基本信息',
    slot: 'basic',
    width: 340
  },
  {
    title: '生产要求',
    slot: 'outPackRequire',
    minWidth: 200,
  },
  {
    title: '1688商品信息',
    key: 'platformName',
    width: 160
  },
  {
    title: '重量',
    slot: 'weight',
    width: 80,
  },
  {
    title: '库存',
    slot: 'stock',
    width: 120,
  },
  {
    title: '价格',
    slot: 'price',
    width: 120,
  },
  {
    title: '要求收货时间',
    slot: 'requireDespatchTime',
    width: 110,
  },
  {
    title: '发货物流',
    slot: 'logistic',
    width: 220,
  },
  {
    title: '下单',
    slot: 'threeNum',
    width: 100,
  },
  {
    title: '发货',
    slot: 'deliver',
    width: 100,
  },
  {
    title: '收货',
    slot: 'receive',
    width: 120,
  },
  {
    title: '水洗唛描述信息',
    slot: 'washedLabel',
    minWidth: 200,
  },
  {
    title: '水洗唛(PDF/JPG/PNG)',
    slot: 'washedLabelPDF',
    minWidth: 200,
  },
  {
    title: '备注',
    slot: 'remark',
    minWidth: 120,
  },
];

export const recevieList = {
  0: { label: '全部', value: 0 },
  1: { label: '有次品', value: 1 },
  2: { label: '有未收', value: 2 },
  3: { label: '有次品或有未收', value: 3 },
}

export const confirmList = [
  {
    title: '图片',
    slot: 'pic',
    width: 82,
  },
  {
    title: '基本信息',
    slot: 'basic',
    width: 200
  },
  {
    title: '规格',
    key: 'specifications',
    width: 120,
  },
  {
    title: '下单时间',
    slot: 'salesTime',
    width: 100,
  },
  {
    title: '下单数量',
    key: 'salesNumber',
    width: 90,
  },
  {
    title: '已取消数量',
    key: 'surplusQuantity',
    width: 100,
  },
  {
    title: '发货数量',
    key: 'despatchNumber',
    width: 90,
  },
  {
    title: '收货',
    align: 'center',
    Width: 270,
    children: [
      {
        title: '收货正品数',
        key: 'qualityNumber',
      },
      {
        title: '收货次品数',
        key: 'substandardNumber',
      },
      {
        title: '未收货数量',
        key: 'notReceivedNumber',
      }
    ]
  },
  {
    title: '少货数量',
    slot: 'cancelNum',
    width: 90,
  },
]

export const wareTitle = [
  {
    type: 'index',
    title: '行号',
    width: 60,
  },
  {
    title: '行状态',
    slot: 'status',
    width: 82,
  },
  {
    title: '图片',
    slot: 'pic',
    width: 80,
  },
  {
    title: 'SKU',
    slot: 'skuNo',
    width: 100,
  },
  {
    title: 'SKU属性',
    slot: 'sku',
    width: 140,
  },
  {
    title: '中文描述',
    slot: 'cnName',
    width: 140,
  },
  {
    title: '英文描述',
    slot: 'enName',
    width: 140,
  },
  {
    title: '预期数量',
    slot: 'previewNum',
    width: 90,
  },
  {
    title: '已收货数量',
    slot: 'getNum',
    width: 90,
  },
  {
    title: '取消数量',
    slot: 'cancelNum',
    width: 90,
    renderHeader: (h, params) => {
      return h('div', [
        h('span', {
          style: { color: '#7CCD7C' },
          attrs: { title: '采购系统同步的取消数量' }
        }, '取消数量')
      ]);
    },
  },
  {
    title: '少货数量',
    slot: 'lessNum',
    width: 90,
    renderHeader: (h, params) => {
      return h('div', [
        h('span', {
          style: { color: '#7CCD7C' },
          attrs: { title: '采购系统同步的少货数量' }
        }, '少货数量')
      ]);
    },
  },
  {
    title: '未收货数量',
    slot: 'notReceivedNum',
    width: 90,
    renderHeader: (h, params) => {
      return h('div', [
        h('span', {
          style: { color: '#7CCD7C' },
          attrs: { title: '未收货数量=预期数量-已收货数量-取消数-少货数' }
        }, '未收货数量')
      ]);
    },
  }, {
    title: '体积（cm*3）',
    slot: 'volume',
    width: 110,
  },
  {
    title: '重量（g）',
    slot: 'weight',
    width: 90,
  },
  {
    title: '是否免检',
    slot: 'isInspection',
    minWidth: 110,
  },
]


export const deliverTitle = [
  {
    title: '序号',
    width: 60,
    align: 'center',
    slot: 'sortNo'
  },
  {
    title: '订单号',
    slot: 'status',
    width: 200,
    align: 'center'
  },
  {
    title: 'SKU',
    slot: 'skuNo',
    width: 180,
    align: 'center'
  },
  {
    title: '供方货号',
    slot: 'sku',
    width: 180,
    align: 'center'
  },
  {
    title: '规格',
    slot: 'cnName',
    width: 160,
    align: 'center'
  },
  {
    title: '数量',
    slot: 'enName',
    align: 'center'
  },
]
export const checkWashedData = {
  '1': { value: '1', label: '手洗', image: require("@/assets/images/handWash.png") },
  '2': { value: '2', label: '缓和干洗', image: require("@/assets/images/mildDryClean.png") },
  '3': { value: '3', label: '最高30摄氏度缓和程序机洗', image: require("@/assets/images/machineWash.png") },
  '4': { value: '4', label: '不可干洗', image: require("@/assets/images/notDryClean.png") },
  '5': { value: '5', label: '不可漂白', image: require("@/assets/images/notBleach.png") }
}

export const tagTypeMap = {
  tiktok: {
    size: {
      width: 70,
      height: 20,
      unit: 'mm',
    },
    replaceKey: {
      tagType: 'platformSubject', // 标签类型 platformId
      barcode: 'barCode', // 条码，Number、String
      leftTop: 'barCode', // 条码左上角
      leftBottom: 'platformSku', // 条码左下角
      rightBottom: 'skuSpecName', // 条码右下下角
      leftFourLine: 'platformOrderNo', // 条码第四行左下角
      rightFourLine: 'countryName', // 条码第四行右下角
      rightFourLineSubjoinTxt: 'MADE IN', // 条码第四行右下角附加值
    }
  },
  Temu: {
    size: {
      width: 70,
      height: 20,
      unit: 'mm',
    },
    replaceKey: {
      tagType: 'platformSubject', // 标签类型 platformId
      barcode: 'barCode', // 条码，Number、String
      leftTop: 'extCode', // 条码左上角
      middleTop: 'skcSpecName', // 条码正上(即条码中间上方)
      rightTop: 'skuSpecName', // 条码右上角
      leftBottom: 'platformSku', // 条码左下角
      middleBottom: '', // 条码正下(即条码中间下方)
      rightBottom: 'countryName', // 条码右下下角
      rightBottomSubjoinTxt: 'Made In' // 右下角附加值
    }
  },
  shein: {
    size: {
      width: 70,
      height: 20,
      unit: 'mm',
    },
    replaceKey: {
      tagType: 'platformSubject', // 标签类型 platformId
      barcode: 'barCode', // 条码，Number、String
      leftTop: 'supplierItem', // 条码左上角
      middleTop: '', // 条码正上(即条码中间上方)
      rightTop: '', // 条码右上角
      rightTopSubjoinTxt: 'Made In', // 右上角附加值
      rightTopDefaultTxt: 'China', // 当右上角数据为空时，使用该值替补
      // leftBottom: 'platformSku', // 条码左下角
      leftBottom: 'productSkcId', // 条码左下角
      middleBottom: '', // 条码正下(即条码中间下方)
      rightBottom: 'skuSpecName', // 条码右下下角
    }
  },
}