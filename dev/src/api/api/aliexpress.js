export default { // aliexpress api
  get_queryWaitingForReceipt: './aliexpress/orderInfo/queryWaitingForReceipt', // 订单-待收货订单列表  分页查询
  get_queryForRiskControl: './aliexpress/orderInfo/queryForRiskControl', // 风控中订单  分页查询
  set_delayWaitingForReceipt: './aliexpress/orderInfo/delayWaitingForReceipt', // 标记订单延长收货时间
  get_queryWaitingForReceiptBadges: './aliexpress/orderInfo/queryWaitingForReceiptBadges', // 待收货确认的收货剩余时间的角标数字
  get_msgDetailsList: './aliexpress/orderInfo/getMsgDetailList', // 速卖通订单详情查询站内信
  set_picsMerge: './aliexpress/orderInfo/mergePicture', // 速卖通订单详情合并图片
  set_replayMsg: './aliexpress/orderInfo/replyMsg', // 速卖通订单详情回复站内信
  set_singleDelay: './aliexpress/orderInfo/singleDelayWaitingForReceipt' // 单个收货延迟
};
