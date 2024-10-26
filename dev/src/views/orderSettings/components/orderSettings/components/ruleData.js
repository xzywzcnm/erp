export const mapObjs = {
  'O002': 'O002', // 发货仓库
  'O003': 'O003', // 订单目的地
  'O005': 'O005', // 指定洲/省
  'O006': 'O006', // 订单收货地址城市
  'O007': 'O007', // 订单总金额
  'O008': 'O008', // 订单利润
  'O010': 'O010', // eBay订单是否
  'O014': 'O014', // 是否是专有黑名单
  'O015': 'O015', // 是否是Wish Express
  'O016': 'O016', // 是否是EPC订单
  'O023': 'O023', // 是否是prime订单
  'O022': 'O022', // 订单类型：ToB订单/ToC订单
  'O017': 'O017', // 优质服务商订单
  'O018': 'O018', // A+物流计划订单
  'O035': 'O035', // 可选A+物流计划订单
  'O020': 'O020', // vova 是否集运订单：是/否
  'O019': 'O019', // 选择指定异常
  'O021': 'O021', // joom 订单总金额
  'O024': 'O024', // 订单货品总数量
  'O025': 'O025', // 订单重量
  'O027': 'O027', // 预估金额
  'O028': 'O028', // 订单的邮寄方式
  'O030': 'O030', // 订单收件人电话要求
  'O031': 'O031', // 买家支付的运费
  'O032': 'O032', // 订单交易货品总数量
  'O033': 'O033', // 是否合单订单
  'O034': 'O034', // 是否十日达订单
  'O036': 'O036', // 是否要求支付消费者VAT
  'O037': 'O037', // 是否合并计划订单
  'O038': 'O038', // otto匹配退件包裹订单
  'O039': 'O039', // 订单收件人电话要求
  'O040': 'O040', // 订单收件人手机要求
}

export const checkList = [
  {
    status: 0,
    value: null,
    name: 'buyerNameBlankSpaceCount',
    text1: '姓名字符中空格数小于', // 姓名字符中空格数小于
    text2: '俄罗斯邮政要求收件人地址为全名，此处可输入2' // 俄罗斯邮政要求收件人地址为全名，此处可输入2
  }, {
    status: 0,
    value: null,
    name: 'buyerNameCount',
    text1: '姓名字符数小于', // 姓名字符数小于
    text2: '输入1时，相当于收件人姓名为空' // 输入1时，相当于收件人姓名为空
  }, {
    status: 0,
    value: null,
    name: 'addressCount',
    text1: '地址字符数小于', // '地址字符数小于'
    text2: '地址1+地址2的总字符长度'
  }, {
    status: 0,
    value: null,
    name: 'cityCount',
    text1: '城市名字字符数小',
    text2: '输入1时，相当于城市名称为空'
  }, {
    status: 0,
    value: null,
    name: 'stateCount',
    text1: '省/州名字字符数小于',
    text2: '输入1时，相当于省州名称为空'
  }, {
    status: 0,
    value: null,
    name: 'postalCodeCount',
    text1: '邮编字符数小于',
    text2: '输入1时，相当于邮编为空'
  }, {
    status: 0,
    value: null,
    name: 'phoneCount',
    text1: '电话号码数字字符个数小',
    text2: '电话、手机两个号码必须都小于该值才认为该条件成立'
  }
]

export const componentsModel = {
  'O001': {
    platformIds: [],
    siteIds: [],
    saleAccountIds: []
  },
  'O002': {
    warehouseIds: []
  },
  'O003': {
    shipmentTypes: []
  },
  'O006': {
    cities: ''
  },
  'O004': {
    countryCodes: [],
    postalCodeType: 0,
    buyerPostalCodes: ''
  },
  'W004': {
    shopSku: null
  },
  'O005': {
    states: ''
  },
  'O007': {
    amountRange: []
  },
  'O008': {
    priceRange: {
      less: 0,
      more: 0,
      upperProfit: 0,
      lowerProfit: 0
    }
  },
  'O009': {
    productCategories: [],
    skus: '',
    productTags: []
  },
  'O026': {
    skus: ''
  },
  'O010': {
    isEbayPlus: '1'
  },
  'O011': {
    productKeyword: [
      {
        value: ''
      }
    ],
    type: 0
  },
  'O012': {
    include: '1'
  },
  'O013': {
    goodsCountry: '',
    goodsCity: '',
    goodsPostalCode: ''
  },
  'O014': {
    isBuyerInBlackList: '1'
  },
  'O015': {
    isWishExpress: '1'
  },
  'O016': {
    isWishEPC: '1'
  },
  'O022': {
    amazonOrderType: '1'
  },
  'O023': {
    amazonPrime: '1'
  },
  'O017': {
    isWishQualityServiceOrder: '1'
  },
  'O018': {
    isWishALogisticsPlanOrder: '1'
  },
  'O035': {
    isWishOptionalAdvancedLogistics: '1'
  },
  'O020': {
    isVovaIsCombineOrder: '1'
  },
  'O021': {
    listingParams: {
      checkbox1: false,
      checkbox2: false,
      beginType: 0,
      beginValue: 0,
      endType: 0,
      endValue: 0,
      currency: null
    }
  },
  'O024': {
    listingParams: {
      checkbox1: false,
      checkbox2: false,
      beginType: 0,
      beginValue: 0,
      endType: 0,
      endValue: 0
    }
  },
  'O025': {
    listingParams: {
      checkbox1: false,
      checkbox2: false,
      checkbox3: false,
      beginType: 0,
      beginValue: 0,
      endType: 0,
      endValue: 0,
      volumnValue: 0
    }
  },
  'O027': {
    listingParams: {
      checkbox1: false,
      checkbox2: false,
      beginType: 0,
      beginValue: 0,
      endType: 0,
      endValue: 0,
      currency: 'CNY',
      typeSelect: '1'
    }
  },
  'O028': {
    listingParams: {
      shippingMethodIds: []
    }
  },
  'O029': {
    productKeyword: [
      { value: '' }
    ]
  },
  'O030': {
    listingParams: {
      checkbox1: false,
      checkbox2: false,
      checkbox3: false,
      mobileLength: 0,
      condition1: 1,
      phoneLength: 0,
      condition2: 1,
      condition3: 1,
      mobilePrefixes: ''
    }
  },
  'O031': {
    listingParams: {
      checkbox1: false,
      checkbox2: false,
      beginType: 0,
      beginValue: 0,
      endType: 0,
      endValue: 0,
      currency: 'CNY'
    }
  },
  'O032': {
    listingParams: {
      checkbox1: false,
      checkbox2: false,
      beginType: 0,
      beginValue: 0,
      endType: 0,
      endValue: 0
    }
  },
  'O033': {
    isCombinedOrder: '1'
  },
  'O034': {
    isTenDaysOrder: '1'
  },
  'O036': {
    wishPayCustomerVatRequired: '1'
  },
  'O037': {
    wishEligibleForShippingReimbursement: '1'
  },
  'O038': {
    isReturnPackage: '1'
  },
  'O039': {
    listingParams: {
      checkbox1: false,
      checkbox2: false,
      phoneLength: 0,
      operator: '<',
      relevance: '&',
      matchRule: '1',
      isContains: '1',
      phoneContext: '0',
    }
  },
  'O040': {
    listingParams: {
      checkbox1: false,
      checkbox2: false,
      mobileLength: 0,
      operator: '<',
      relevance: '&',
      matchRule: '1',
      isContains: '1',
      mobileContext: '0',
    }
  },
}

export const componentsStatus = {
  'O001': {
    platformIds: false,
    siteIds: false,
    saleAccountIds: false
  },
  'O002': {
    warehouseIds: false
  },
  'O003': {
    shipmentTypes: false
  },
  'O004': {
    countryCodes: false,
    buyerPostalCodes: false
  },
  'W004': {
    shopSku: false
  },
  'O005': {
    states: false
  },
  'O006': {
    cities: false
  },
  'O007': {
    amountRange: false
  },
  'O008': {
    priceRange: false
  },
  'O009': {
    skus: false,
    productTags: false,
    productCategories: false
  },
  'O026': {
    skus: false
  },
  'O010': {
    isEbayPlus: false
  },
  'O011': {
    productKeyword: false
  },
  'O012': {
    include: false
  },
  'O013': {
    goodsCountry: false,
    goodsCity: false,
    goodsPostalCode: false
  },
  'O014': {
    isBuyerInBlackList: '1'
  },
  'O015': {
    isWishExpress: '1'
  },
  'O016': {
    isWishEPC: '1'
  },
  'O023': {
    amazonPrime: '1'
  },
  'O022': {
    amazonOrderType: '1'
  },
  'O017': {
    isWishQualityServiceOrder: '1'
  },
  'O018': {
    isWishALogisticsPlanOrder: '1'
  },
  'O035': {
    isWishOptionalAdvancedLogistics: '1'
  },
  'O020': {
    isVovaIsCombineOrder: '1'
  },
  'O021': {
    listingParams: false
  },
  'O024': {
    listingParams: false
  },
  'O025': {
    listingParams: false
  },
  'O027': {
    listingParams: false
  },
  'O028': {
    listingParams: false
  },
  'O029': {
    productKeyword: false
  },
  'O030': {
    listingParams: false
  },
  'O031': {
    listingParams: false
  },
  'O032': {
    listingParams: false
  },
  'O019': false,
  'O033': {
    isCombinedOrder: '1'
  },
  'O034': {
    isTenDaysOrder: '1'
  },
  'O036': {
    wishPayCustomerVatRequired: '1'
  },
  'O037': {
    wishEligibleForShippingReimbursement: '1'
  },
  'O038': {
    isReturnPackage: '1'
  },
  'O039': {
    listingParams: false,
  },
  'O040': {
    listingParams: false,
  }
}

export const operatorType = {
  '>': '>',
  '=': '=',
  '<': '<',
}

export const matchRuleType = {
  '1': '前缀',
  '2': '后缀',
  '3': '内容',
}