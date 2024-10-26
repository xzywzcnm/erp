export default {
  // 客服模块
  // ebay站内信
  get_undistributed: '/cs-service/messageGroup/queryUnassignedUntreatedCount', // 左侧菜单树-获取未分派数据
  get_inBox: '/cs-service/messageGroup/queryUntreatedCount', // 左侧菜单树-获取收件箱数据
  update_markLevel: '/cs-service/messageGroup/markLevel', // 优先级
  ebay_messageUpload: '/cs-service/messageMedia/uploadPicture', // 上传图片
  get_messageOrder: '/cs-service/messageGroup/queryOrdersById', // ebay站内信-消息组订单列表
  ebay_uploadPictureBySaleAccountId:
    '/cs-service/messageMedia/uploadPictureBySaleAccountId', // 上传图片
  get_firstLetter: '/cs-service/messageGroup/countPriorUntreated', // 左侧菜单树-获取优先的数据
  get_messageGroup: '/cs-service/messageGroup/query', // 查询优先的未分派未处理数据
  get_messageInfo: '/cs-service/messageInfo/query', // 根据分组ID查询子级
  get_queryMessageBodyByMessageIds: '/cs-service/messageBody/queryByMessageIds', // 根据消息ID列表查询消息内容
  update_messageRead: '/cs-service/messageInfo/markMessageRead', // 标记站内信已读
  get_batchAssign: '/cs-service/messageGroup/batchAssign', // 站内信组批量转发
  get_remarkList: '/cs-service/messageRemark/queryByMessageIds', // 查询站内信备注信息
  del_remarkCs: '/cs-service/messageRemark/', // 删除备注信息
  add_remarkCs: '/cs-service/messageRemark', // 添加站内信备注
  del_messageGroup: '/cs-service/messageGroup', // 删除站内信组
  set_reSend: '/cs-service/messageInfo/reSend', // 重新发送
  del_messageInfo: '/cs-service/messageInfo/', // 删除站内信
  batch_batchReSend: '/cs-service/messageInfo/batchReSend', // 批量重新发送邮件
  query_tempCode: '/cs-service/messageTemplate/queryByTemplateCode', // 根据模板编号查询模板
  query_ofenTemp: '/cs-service/messageTemplate/queryByCategory', // 查询常用模板
  query_allTemp: '/cs-service/messageTemplate/queryByPlatformId', // 查询所有模板
  reply_emailMessage: '/cs-service/messageInfo/replyMessage', // 回复站内信
  get_outBox: '/cs-service/messageInfo/countOutbox', // 查询发件箱 统计数量
  get_ebayMessage: '/cs-service/messageInfo/queryEbayMessage', // 查询ebay来信
  query_outBox: '/cs-service/messageInfo/queryOutbox', // 分页查询发件箱和已发信件
  get_allTemplate: '/cs-service/messageTemplate/api/queryByPlatformId', // 站内信回复模板- 查询所有模板
  // 站内信自动发送规则
  update_MessageAutoRulePriority:
    '/cs-service/autoSendMessageAutoRule/updatePriority', // 更新自动发送规则优先级
  get_autoSendMessageAutoRuleDetails: '/cs-service/autoSendMessageAutoRule/', // +autoRuleId 获取规则详情
  set_autoSendMessageAutoRuleEnable:
    '/cs-service/autoSendMessageAutoRule/enable/', // +autoRuleId 启动ebay站内信规则
  set_newAutoSendMessageAutoRule: '/cs-service/autoSendMessageAutoRule', // 添加ebay站内信自动规则
  update_autoSendMessageAutoRule: '/cs-service/autoSendMessageAutoRule', // '更新ebay站内信规则'
  delete_autoSendMessageAutoRule: '/cs-service/autoSendMessageAutoRule', // 删除站内信自动规则
  set_autoSendMessageAutoRuleDisable:
    '/cs-service/autoSendMessageAutoRule/disable/', // +autoRuleId 停用ebay站内信规则
  get_triggerTimeList: '/cs-service/autoSendMessageAutoRule/queryTriggers', // 触发时间列表查询
  get_queryAllEnableCarrierShipping:
    '/setting-service/erpCommon/order-service/carrierShippingMethod/queryAllEnableCarrierShipping', // 邮寄方式列表查询
  // 站内信自动发送规则
  get_cancelList: '/cs-service/ebayRequest/query',
  exportInfoByQuery: '/cs-service/ebayRequest/exportInfoByQuery', // 导出ebay纠纷管理的未收到货品列表
  set_batchSyncEbayOrder: '/cs-service/ebayCancellation/batchSync', // 批量同步取消交易纠纷
  set_ebayReturnBatchSync: '/cs-service/ebayReturn/batchSync', // 退款退货批量同步取消交易纠纷
  post_ebayRequest: ' /cs-service/ebayRequest/export', // 退款退货--导出
  ebay_prefix: '/cs-service/ebayCancellation/',
  set_ebayApprove: '/approve', // 同意取消交易
  set_ebayReject: '/reject', // 拒绝取消交易
  set_ebaySync: '/sync', // 同步取消交易纠纷
  set_returnPrefix: '/cs-service/ebayReturn/', // 退货退款前缀
  set_issueRefund: '/issueRefund', // 退货退款
  set_sendMessage: '/sendMessage', // 发送留言
  set_uploadFile: '/uploadFile', // 上传文件
  set_addShippingLabel: '/addShippingLabel', // 上传面单
  set_processReturnRequest: '/processReturnRequest', // 处理退款退货纠纷
  set_autoReturn: '/cs-service/ebayRequest/', // 自动退款前缀
  set_inquiryPrefix: '/cs-service/ebayInquiry/', // 退货退款前缀
  set_inquiryBatchSync: '/cs-service/ebayInquiry/batchSync', // 未收到物品批量同步取消交易纠纷
  set_updateDisput: '/escalate', // 升级纠纷
  set_provideShipmentInfo: '/provideShipmentInfo', // 提供发货信息
  // 评价
  get_evaluateList: '/cs-service/ebayFeedback/queryForPositive', // 好评列表
  get_queryForNeutral: '/cs-service/ebayFeedback/queryForNeutral', // 中评列表
  get_queryForNegative: '/cs-service/ebayFeedback/queryForNegative', // 差评列表
  set_response: '/cs-service/ebayFeedback/respond', // 跟进
  get_feedBack: '/cs-service/ebayFeedback/queryForNeedSellerFeedback', // 查询需要留评列表
  get_queryForNeedBuyerFeedback:
    '/cs-service/ebayFeedback/queryForNeedBuyerFeedback', // 查询等待买家评价列表
  set_feedBack: '/cs-service/ebayFeedback/feedback', // 回评
  get_templateModel: '/cs-service/feedbackTemplate/queryAll', // 评价模版-查询评价模版
  set_newTemplateModel: '/cs-service/feedbackTemplate', // 新增评价模板
  set_deleteTemplate: '/cs-service/feedbackTemplate/', // 评价模版-删除评价模版
  get_queryByBuyerAccountIdAndItemId:
    '/cs-service/messageInfo/queryByBuyerAccountIdAndItemId',
  post_saveReason: '/cs-service/ebayFeedback/saveReason', // 新增留评原因
  post_saveFeedbackReason: '/cs-service/ebayFeedback/saveFeedbackReason', // 保存留评原因
  get_ebayFeedbackQueryReason: '/cs-service/ebayFeedback/queryReason', // 获取所有留评原因
  get_queryReasonByFeedBackId:
    '/cs-service/ebayFeedback/queryReasonByFeedBackId', // 获取指定FeedBackId的留评原因
  // 议价
  get_bsetOfferList: '/cs-service/ebayBestOffer/list', // 议价列表查询
  set_ebayOfferResponse: '/cs-service/ebayBestOffer/respond', // 设置ebay议价详情
  get_ebayOfferDetails: '/cs-service/ebayBestOffer/detail', // 查看议价详情

  // 客服统计
  get_msgStatistics:
    '/cs-service/erpCommon/data-center-service/reportDayCsReplyMsgStatistics/api/list', // 客服统计
  export_msgStatistics: '/cs-service/reportDayCsReplyMsgStatistics/export', // 导出

  // 付款纠纷
  post_ebayPaymentDisputeQuery: '/cs-service/ebayPaymentDispute/query', // ebay平台付款纠纷
  post_ebayPaymentDisputeExport: '/cs-service/ebayPaymentDispute/export', // 导出excel
  get_ebayPaymentDispute: '/cs-service/ebayPaymentDispute/', //
  get_ebayPaymentDisputeUpdate: '/update', // 同步更新平台付款纠纷
  get_ebayPaymentDisputeDetail: '/detail', // 付款纠纷详情
  put_ebayPaymentDisputeBatchUpdate:
    '/cs-service/ebayPaymentDispute/batchUpdate', // 批量更新平台付款纠纷状态
  put_ebayPaymentDisputeAddShippingLabel: '/addShippingLabel', // 图片上传
  put_ebayPaymentDisputeReturnAddress: '/returnAddress', // 更新回寄地址
  put_ebayPaymentDispute_updateNumber:
    '/cs-service/ebayPaymentDispute/updateNumber', // 批量更新平台付款纠纷数量
  put_ebayPaymentDispute_contestOrAcceptPaymentDispute:
    '/cs-service/ebayPaymentDispute/contestOrAcceptPaymentDispute', // 挑战争议并提供证据or接受争议并发出退款

  // Walmart退款管理
  post_walmartReturns_list: '/cs-service/walmartReturns/list', // 获取Walmart退款管理 列表数据
  get_walmartReturns_agree: '/cs-service/walmartReturns/', // 同意退款
  get_walmartReturns_batchSync: '/cs-service/walmartReturns/batchSync', // 全部更新
  // 售后原因管理
  saleReasonsTreatment: {
    query: '/cs-service/afterSalesReasons/query', // 查询售后原因管理列表 afterSalesReasons_query
    insert: '/cs-service/afterSalesReasons/insert', // 新增售后原因 afterSalesReasons_insert
    update: '/cs-service/afterSalesReasons/update', // 修改售后原因 afterSalesReasons_update
    delete: '/cs-service/afterSalesReasons/delete', // 删除售后原因 afterSalesReasons_delete
    import: '/cs-service/afterSalesReasons/import', // 导入售后原因 afterSalesReasons_import
    file: '/cs-service/filenode/s/cs-service/template/afterSalesReasons.xlsx', // 下载售后原因模板路径
  },
  // 好评、中评、差评导出
  exportAcclaimInfo: '/cs-service/ebayFeedback/exportAcclaimInfo', // 好评导出
  exportNeutralInfo: '/cs-service/ebayFeedback/exportNeutralInfo', // 中评导出
  exportBadReviewsInfo: '/cs-service/ebayFeedback/exportBadReviewsInfo' // 差评导出
};
