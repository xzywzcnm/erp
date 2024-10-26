const productData = {
  productStatus: [
    { value: 2, label: '试卖' },
    { value: 1, label: '在售' },
    { value: 4, label: '促销' },
    { value: 3, label: '清仓' },
    { value: 5, label: '转季' },
    { value: 0, label: '停售' }
  ],
  statusTips: [
    '试卖：采集产品，大量试款。不备货',
    '在售：常规新品和热销品。备货',
    '促销：临时性的打折销售。备货',
    '清仓：滞销品清仓，原价或打折销售。不备货',
    '转季：售完不再采购，下个销售周期会重新上架。不备货',
    '停售：立即下架不再销售。'
  ]
}
export default productData;
