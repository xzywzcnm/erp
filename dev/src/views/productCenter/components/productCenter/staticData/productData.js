/*
 * @Author: w
 * @Date: 2021-08-09 11:01:55
 * @LastEditors: w
 * @LastEditTime: 2021-12-27 11:57:38
 */
const productData = {
  productStatus: [
    { value: 2, label: '试卖' },
    { value: 1, label: '在售' },
    { value: 4, label: '促销' },
    { value: 3, label: '清仓' },
    { value: 5, label: '转季' },
    { value: 0, label: '停售' }
  ],
  productStatusSpu: [
    { value: 0, label: '停售' },
    { value: 1, label: '在售' },
    { value: 2, label: '试卖' },
    { value: 3, label: '清仓' },
    { value: 4, label: '促销' },
    { value: 5, label: '转季' },
    { value: 6, label: '部分停售' },
    { value: 7, label: '部分在售' },
    { value: 8, label: '部分试卖' },
    { value: 9, label: '部分清仓 ' },
    { value: 10, label: '部分促销' },
    { value: 11, label: '部分转季' }
  ],
  statusTipsSku: [
    '试卖：采集产品，大量试款。不备货，缺一补一。',
    '在售：常规新品和热销品。备货',
    '促销: 临时性的打折销售。备货（对应Listing部分清仓）',
    '清仓: 滞销品清仓，打折销售。不备货（对应Listing清仓）',
    '转季: 售完不再采购，下个销售周期会重新上架。不主动备货（对应Listing部分停售）',
    '停售：立即下架不再销售。'
  ],
  statusTipsSpu: [
    'SPU下SKU的状态个数=1，则与SKU状态一致',
    'SKU的状态个数>1且有清仓状态，“部分清仓”',
    'SKU的状态个数>1且有停售状态，“部分停售”',
    'SKU的状态个数>1且有促销状态，“部分促销”',
    'SKU的状态个数>1且有转季状态，“部分转季”',
    'SKU的状态个数>1且有试卖状态，“部分试卖”'
  ]
}
export default productData;
