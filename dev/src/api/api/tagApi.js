export default { // 标签相关
  set_tag: '/order-service/orderTag', // 打标签
  get_orderListTag: '/order-service/tag/queryByType', // 订单标签列表 get 标签类型
  del_orderTag: '/order-service/orderTag/', // 删除标签 delete
  drop_orderTag: './orderTag/clearOrderTag' // 清空订单标签 delete
};
