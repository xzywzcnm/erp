/*
 * @Author: w
 * @Date: 2021-10-25 11:18:50
 * @LastEditors: w
 * @LastEditTime: 2021-12-28 18:24:48
 */
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
      h('span',{style: {color: '#19be6b'}},params.column.title),
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
    width: 60,
  },
  {
    title: '供应商',
    key: 'supplierName',
    width: 160,
    renderHeader: renderHeader1,
  },
  {
    title: '发货单号',
    slot: 'sendNo',
    width: 160,
  },
  {
    title: '物流信息',
    slot: 'logistic',
    width: 160,
  },
  {
    title: '订单总数',
    key: 'allOrderQuantity',
  },
  {
    title: '货号总数',
    key: 'allSupplierNoQuantity',
  },
  {
    title: 'SKU总数',
    key: 'allSKUQuantity'
  },
  {
    title: '发货总数',
    key: 'allSendQuantity'
  },
  {
    title: '创建时间',
    slot: 'createdTime',
    width: 120,
  },
  {
    title: '已发包裹数',
    key: 'packageNumber'
  },
  // {
  //   title: '收货时间',
  //   // key: 'receiveTime'
  // },
  // {
  //   title: '已收包裹数',
  //   // key: 'acceptPackageQuantity'
  // },
  {
    title: '发货状态',
    slot: 'status',
    width: 100
  },
  {
    title: '操作',
    slot: 'action',
    width: 140
  },
];

export const tablist = [
  { label: "全部", value: 'all' },
  { label: "待发物流", value: '0' },
  { label: "已发物流", value: '1' },
  // { label: "查验完成", value: '2' },
  // { label: "收货完成", value: '3' },
]; 