// import Vue from 'vue';

export default /* [{ 'title': 'Listing标题${itemTitle}', 'value': '${itemTitle}' }, {
 'title': '买家eBayID${buyerId}',
 'value': '${buyerId}'
 }, { 'title': 'Listing链接${itemLink}', 'value': '${itemLink}' }, {
 'title': 'ItemNumber${itemNumber}',
 'value': '${itemNumber}'
 }, { 'title': '承运人${carrier}', 'value': '${carrier}' }, {
 'title': '承运人查询网址${carrierUrl}',
 'value': '${carrierUrl}'
 }, { 'title': '发货日期${deliveryDate}', 'value': '${deliveryDate}' }, {
 'title': '付款日期${paymentDate}',
 'value': '${paymentDate}'
 }, {
 'title': 'PayPal交易号${paypalTransactionId}',
 'value': '${paypalTransactionId}'
 }, {
 'title': '卖家Paypal账号${receiverPaypalAccount}',
 'value': '${receiverPaypalAccount}'
 }, { 'title': '买家Paypal账号${paypalTransactionId}', 'value': '${payerPaypalAccount}' }, {
 'title': '购买数量${quantity}',
 'value': '${quantity}'
 }, { 'title': '付款金额${amount}', 'value': '${amount}' }, {
 'title': '收货人地址${recipientAddress}',
 'value': '${recipientAddress}'
 }, { 'title': '卖家ID${sellerEbayId}', 'value': '${sellerEbayId}' }, {
 'title': '卖家Email${sellerEmail}',
 'value': '${sellerEmail}'
 }, { 'title': '今日日期${today}', 'value': '${today}' }, {
 'title': '物流跟踪号${trackNumber}',
 'value': '${trackNumber}'
 }, { 'title': '付款人全称${buyerFullname}', 'value': '${buyerFullname}' }, {
 'title': '付款人firstName${buyerFirstname}',
 'value': '${buyerFirstname}'
 }, {
 'title': '付款人middleName${buyerMiddlename}',
 'value': '${buyerMiddlename}'
 }, { 'title': '付款人lastName${buyerLastname}', 'value': '{buyerLastname}' }]; */
[
  {
    'title': '卖家' + 'ID${sellerEbayId}',
    'value': '${sellerEbayId}'
  }, {
    'title': '买家' + 'eBayID${buyerId}',
    'value': '${buyerId}'
  }, {
    'title': 'Listing' + '标题' + '${itemTitle}',
    'value': '${itemTitle}'
  }, {
    'title': '购买数量' + '${quantity}',
    'value': '${quantity}'
  }, {
    'title': '付款金额' + '${amount}',
    'value': '${amount}'
  }, {
    'title': '收货人地址' + '${recipientAddress}',
    'value': '${recipientAddress}'
  }, {
    'title': '发货日期' + '${deliveryDate}',
    'value': '${deliveryDate}'
  }, {
    'title': '物流跟踪号' + '${trackNumber}',
    'value': '${trackNumber}'
  }
];
