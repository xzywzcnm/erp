// 需要授权的平台
export const AUTH_PLATFORM = [
  'taobao',
  'alibaba',
  'amazon',
  'alibabagj',
  'aliexpress',
  'allegro',
  'dhgate',
  'ebay',
  'jdyn',
  'factorymarket',
  'gsp',
  'joom',
  'lazada',
  'mercadolibre',
  'shopify',
  'shopee',
  'shoplazza',
  'wish',
  'xshoppy',
  'sheinx',
  'yandex',
  'otto',
  'tiktok',
  'sheinx',
  'miravia',
  'wb'
];

export const SHOW_BIND_TIME = [
  'ept',
  'amazon',
  'real'
];

// 授权平台过期时间
export const AUTH_PLATFORM_TIME_MAP = {
  alibaba: 'refreshTokenTimeout',
  alibabagj: 'refreshTokenTimeout',
  btw: 'tokenInvalidDate',
  gsp: 'tokenInvalidDate',
  linio: 'tokenInvalidDate',
  shoplazza: 'tokenInvalidDate',
  yandex: 'expireTime',
  ebay: 'tokenInvalidDate',
  aliexpress: 'expireTime',
  allegro: 'expiryTime',
  amazon: 'expiryTime',
  joom: 'expiryTime',
  lazada: 'refreshTokenInvalidTime',
  shopify: 'tokenInvalidDate',
  wish: 'expiryTime'
};
export const EvidenceTypeEnum = [
  'PROOF_OF_DELIVERY',
  'PROOF_OF_AUTHENTICITY',
  'PROOF_OF_ITEM_AS_DESCRIBED',
  'PROOF_OF_CREDIT_NOT_DUE',
  'PROOF_OF_RETURN_NOT_RECEIVED',
  'PROOF_OF_DELIVERY_AS_FILE',
  'PROOF_OF_DELIVERY_SIGNATURE',
  'PROOF_OF_PICKUP'
];
// 订单对应平台跳转前台链接
export const platformReceptionUrl = {
  ebay: (itemId) => {
    return `http://www.ebay.com/itm/${itemId}`;
  },
  customer: (itemId) => {
    // 这个是客服系统 打开详情
    return `http://www.ebay.com/itm/${itemId}`;
  },
  wish: (itemId) => {
    return `https://www.wish.com/product/${itemId}`;
  },
  joom: (itemId) => {
    return `https://www.joom.com/en/products/${itemId}`;
  },
  aliexpress: (itemId) => {
    return `https://www.aliexpress.com/item/${itemId}.html`;
  },
  walmart: (itemId) => {
    return `https://www.walmart.com/ip/${itemId}`;
  },
  amazon: (itemId, ASIN) => {
    return `https://www.amazon.co.uk/gp/product/${ASIN}`;
  },
  shopee: (itemId, ASIN, shopid) => {
    return `https://shopee.com.my/product/${shopid}${itemId}`;
  },
  real: (itemId) => {
    return `https://www.kaufland.de/product/${itemId}`;
  },
};

// 规则是否类型
export const RULE_TYPE_IS = ['order-service-A044', 'order-service-A045', 'order-service-A042', 'order-service-A040', 'order-service-A035', 'order-service-A036', 'order-service-A037', 'order-service-A038', 'order-service-A047', 'order-service-A048', 'order-service-A046'];

// 规则单个input 类型
export const RULE_TYPE_INPUT = ['order-service-A005', 'order-service-A006'];

// 赋值checkbox 判定
export const RULE_HAS_CHECKBOX = {
  'order-service-A018': {
    checkbox1: ['startValue', 'startType'],
    checkbox2: ['endValue', 'endType']
  },
  'order-service-A019': {
    checkbox1: ['mobileLength'],
    checkbox2: ['phoneLength'],
    checkbox3: ['mobilePres']
  }
}

export const platform_column = (v) => {
  let self = v;
  // eslint-disable-next-line no-unused-vars
  const basic = [
    {
      title: '代号',
      key: 'accountCode',
      width: 160,
      align: 'center',
      render: (h, params) => {
        return h('span', params.row.saleAccount.accountCode);
      }
    }, {
      title: '平台',
      key: 'platform',
      width: 160,
      align: 'center',
      render: (h, params) => {
        return h('span', {
          class: (() => {
            return 'platformLogo ' + self.shopPlatformType;
          })()
        });
      }
    }, {
      title: '账户名',
      key: 'account',
      minWidth: 160,
      align: 'center',
      render: (h, params) => {
        return h('span', params.row.saleAccount.account);
      }
    }, {
      title: '京东状态',
      key: 'tongStatus',
      width: 200,
      align: 'center',
      render: (h, params) => {
        if (params.row.saleAccount.status) {
          return h('span', {
            style: {
              color: '#008000'
            }
          }, '启用');
        } else {
          return h('span', {
            style: {
              color: '#FF0000'
            }
          }, '停用');
        }
      }
    },
    {
      title: '绑定时间',
      key: 'tokenEffectiveDate',
      minWidth: 200,
      align: 'center',
      render: (h, params) => {
        return h('span', self.getDataToLocalTime(params.row.tokenEffectiveDate, 'fulltime'));
      }
    }, {
      title: '操作',
      key: 'operate',
      minWidth: 140,
      maxWidth: 240,
      align: 'center',
      render: (h, params) => {
        let id = params.row.saleAccountId ? params.row.saleAccountId : params.row[self.shopPlatformType + 'AccountId'];
        return h('div', [
          h('Button', {
            props: {
              size: 'small'
            },
            style: {
              marginRight: '5px', ...self.lookStyle()
            },
            on: {
              click: () => {
                self.show(id, 'check', params.row.saleAccount.account);
              }
            }
          }, '查看'), h('Button', {
            props: {
              size: 'small'
            },
            style: {
              marginRight: '5px', ...self.editStyle()
            },
            on: {
              click: () => {
                self.show(id, 'edit', params.row.saleAccount.account);
              }
            }
          }, '编辑'), params.row[self.shopPlatformType + 'Status'] !== 0 && params.row.saleAccount.status === 0 ? h('Button', {
            props: {
              size: 'small'
            },
            style: {
              marginRight: '5px', ...self.enableStyle()
            },
            on: {
              click: () => {
                var stopParams = {
                  saleAccountId: id,
                  status: '1'
                };
                stopParams[self.shopPlatformType + 'Account'] = id;
                self.enbaleStatus(stopParams);
              }
            }
          }, '启用') : params.row[self.shopPlatformType + 'Status'] !== 0 && params.row.saleAccount.status !== 0 ? h('Button', {
            props: {
              size: 'small'
            },
            style: {
              marginRight: '5px', ...self.disableStyle()
            },
            on: {
              click: () => {
                var stopParams = {
                  saleAccountId: params.row.saleAccount.saleAccountId,
                  status: '0'
                };
                stopParams[self.shopPlatformType + 'Account'] = id;
                self.disableStatus(stopParams);
              }
            }
          }, '停用') : '',
          AUTH_PLATFORM.includes(self.shopPlatformType) && h('Button', {
            props: {
              size: 'small'
            },
            style: {
              marginRight: '5px', ...self.accreditStyle()
            },
            on: {
              click: () => {
                self.show(id, 'give', params.row.saleAccount.account);
              }
            }
          }, '授权')
        ]);
      }
    }
  ];
  // self.shopPlatformType
  // eslint-disable-next-line no-unused-vars
  const adjustment_platform = {
    auth: [
      'ebay',
      'aliexpress'
    ],
    loginId: [
      'aliexpress'
    ],
    shopName: [
      'shopify'
    ],
    platformStatusEnabled: [
      'shopify',
      'wish',
      'joom'
    ],
    platformStatus: [
      'lazada',
      'dhgate',
      'alibaba',
      'yandex',
      'mycom',
      'shopee',
      'factorymarket',
      'mercadolibre',
      'alibabagj',
      'vova',
      'real',
      'allegro'
    ],
    siteAreaList: [
      'lazada',
      'cdiscount'
    ],
    siteId: [
      'newegg'
    ],
    clientId: [
      'joom'
    ],
    memberId: [
      'alibaba'
    ],
    accountType: [
      'alibaba'
    ],
    // 展示 ***
    clientSecret: [
      'joom'
    ],
    // 展示 ***
    accessToken: [
      'tophatter'
    ],
    emailAddress: [
      'amazon'
    ],
    taobaoUserId: [
      'alibabagj'
    ]
  };
  // eslint-disable-next-line no-unused-vars
  const taobaoUserId = [
    {
      title: 'taobao_user_id',
      key: 'taobaoUserId',
      minWidth: 160,
      align: 'center',
      render: (h, params) => {
        return h('span', params.row.taobaoUserId);
      }
    }
  ];
  // eslint-disable-next-line no-unused-vars
  const siteAreaList = [
    {
      title: '站点',
      key: 'lazadaSite',
      minWidth: 160,
      align: 'center',
      render: (h, params) => {
        return h('span', self.siteName(params.row[self.shopPlatformType + 'AccountSaleAreaList']));
      }
    }
  ];
  // eslint-disable-next-line no-unused-vars
  const emailAddress = [
    {
      title: '邮箱',
      key: 'emailAddress',
      minWidth: 120,
      align: 'center',
      render: (h, params) => {
        return h('span', params.row.emailRelation.emailAddress);
      }
    }
  ];
  // eslint-disable-next-line no-unused-vars
  const memberId = [
    {
      title: 'memberID',
      key: 'memberId',
      width: 160,
      align: 'center'
    }
  ];
  // eslint-disable-next-line no-unused-vars
  const accountType = [
    {
      title: '账户类型',
      key: 'accountType',
      minWidth: 160,
      align: 'center',
      render: (h, params) => {
        if (params.row.accountType === 'buyer') {
          return h('span', '买家');
        } else {
          return h('span', '卖家');
        }
      }
    }
  ];
  // eslint-disable-next-line no-unused-vars
  const siteId = [
    {
      title: '站点',
      key: 'site',
      minWidth: 160,
      align: 'center',
      render: (h, params) => {
        let siteName = null;
        self.siteList.forEach((n, i) => {
          if (params.row.site === n.siteId) {
            siteName = n.cnName;
          }
        });
        return h('span', siteName);
      }
    }
  ];
  // eslint-disable-next-line no-unused-vars
  const loginId = [
    {
      title: 'Login Id',
      key: 'loginId',
      minWidth: 120,
      maxWidth: 160
    }
  ];
  // eslint-disable-next-line no-unused-vars
  const shopName = [
    {
      title: '店铺地址',
      key: 'shopName',
      minWidth: 160,
      align: 'center',
      render: (h, params) => {
        return h('span', 'https://' + params.row.shopName + '.myshopify.com');
      }
    }
  ];
  // eslint-disable-next-line no-unused-vars
  const platformStatusEnabled = [
    {
      title: self.shopPlatformType + '状态',
      width: 160,
      align: 'center',
      render: (h, params) => {
        if (params.row[self.shopPlatformType + 'Enabled']) {
          return h('span', {
            style: {
              color: '#008000'
            }
          }, '有效');
        } else {
          return h('span', {
            style: {
              color: '#FF0000'
            }
          }, '失效');
        }
      }
    }
  ];
  // eslint-disable-next-line no-unused-vars
  const clientId = [
    {
      title: 'CLIENT ID',
      key: 'clientId',
      minWidth: 160,
      align: 'center'
    }
  ];
  // eslint-disable-next-line no-unused-vars
  const clientSecret = [
    {
      title: 'CLIENT SECRET',
      key: 'clientSecret',
      minWidth: 160,
      align: 'center',
      render: (h, params) => {
        return h('span', '**********');
      }
    }
  ];
  // eslint-disable-next-line no-unused-vars
  const accessToken = [
    {
      title: 'accessToken',
      key: 'accessToken',
      minWidth: 160,
      align: 'center',
      render: (h, params) => {
        return h('span', '**********');
      }
    }
  ];

  let statusName = () => {
    if (self.shopPlatformType === 'alibaba') {
      return '1688';
    } else if (self.shopPlatformType === 'alibabagj') {
      return '阿里巴巴国际';
    } else if (self.shopPlatformType === 'vova') {
      return 'VOVO';
    } else if (self.shopPlatformType === 'real') {
      return 'REAL';
    }
    let str = self.shopPlatformType;
    return str.toString()[0].toUpperCase() + str.toString().slice(1);
  };
  // eslint-disable-next-line no-unused-vars
  const platformStatus = [
    {
      title: statusName() + '状态',
      width: 160,
      align: 'center',
      render: (h, params) => {
        if (params.row[self.shopPlatformType + 'Status']) {
          return h('span', {
            style: {
              color: '#008000'
            }
          }, '有效');
        } else {
          return h('span', {
            style: {
              color: '#FF0000'
            }
          }, '失效');
        }
      }
    }
  ];
  // eslint-disable-next-line no-unused-vars
  const auth = [{
    title: '授权状态',
    key: 'ebayStatus',
    minWidth: 100,
    maxWidth: 160,
    render: (h, params) => {
      /**
       *  2 授权失效
       *  3 挂起
       *  授权过期 比当前时间小过期
       */
      let status = params.row[self.shopPlatformType + 'Status'];
      let text = null;
      let now = new Date().getTime();
      let tokenDate = new Date(self.getDataToLocalTime(params.row.tokenInvalidDate, 'fulltime')).getTime();
      if (params.row.tokenInvalidDate && now > tokenDate) {
        text = h('span', { style: { color: '#e91e63' } }, '授权过期');
      } else {
        switch (status) {
          case 0:
            text = h('span', {
              class: 'stopStatus'
            }, '未授权');
            break;
          case 1:
            text = h('span', {
              class: 'openStatus'
            }, '已授权');
            break;
          case 2:
            text = h('span', {
              style: { color: '#f73131' }
            }, '授权失效');
            break;
          case 3:
            text = h('span', {
              style: { color: '##ff9800' }
            }, '挂起');
            break;
        }
      }
      return text;
    }
  }, {
    title: '授权过期时间',
    minWidth: 100,
    key: 'deathdate',
    render: (h, params) => {
      return h('span', self.getDataToLocalTime(params.row.tokenInvalidDate, 'fulltime'));
    }
  }];

  /* const basic =  [
    {
      title: '代号',
      key: 'saleAccount',
      width: 160,
      render: (h, params) => {
        return h('span', params.row.saleAccount.accountCode);
      }
    }, {
      title: '平台',
      key: 'platform',
      width: 150,
      render: (h, params) => {
        return h('span', {
          class: 'platformLogo ebay'
        });
      }
    }, {
      title: '账户名',
      key: 'saleAccount',
      minWidth: 120,
      maxWidth: 160,
      render: (h, params) => {
        return h('span', params.row.saleAccount.account);
      }
    }, {
      title: '授权状态',
      key: 'ebayStatus',
      minWidth: 100,
      maxWidth: 160,
      render: (h, params) => {
        /!**
         * 2 授权失效
         *3 挂起
         * 授权过期 比当前时间小过期
         * *!/

        let status = params.row.ebayStatus;
        let text = null;
        let now = new Date().getTime();
        let tokenDate = new Date(self.getDataToLocalTime(params.row.tokenInvalidDate, 'fulltime')).getTime();
        if (params.row.tokenInvalidDate && now > tokenDate) {
          text = h('span', { style: { color: '#e91e63' } }, '授权过期');
        } else {
          switch (status) {
            case 0:
              text = h('span', {
                class: 'stopStatus'
              }, '未授权');
              break;
            case 1:
              text = h('span', {
                class: 'openStatus'
              }, '已授权');
              break;
            case 2:
              text = h('span', {
                style: { color: '#f73131' }
              }, '授权失效');
              break;
            case 3:
              text = h('span', {
                style: { color: '##ff9800' }
              }, '挂起');
              break;
          }
        }
        return text;
      }
    }, {
      title: '授权过期时间',
      minWidth: 100,
      key: 'deathdate',
      render: (h, params) => {
        return h('span', self.getDataToLocalTime(params.row.tokenInvalidDate, 'fulltime'));
      }
    }, {
      title: '状态',
      key: 'status',
      align: 'center',
      width: 80,
      render: (h, params) => {
        return params.row.saleAccount.status === 0 ? h('span', {
          class: 'stopStatus'
        }, '停用') : h('span', {
          class: 'openStatus'
        }, '启用');
      }
    }, {
      title: '绑定时间',
      key: 'bindTime',
      width: 200,
      render: (h, params) => {
        return h('span', self.getDataToLocalTime(params.row.tokenEffectiveDate, 'fulltime'));
      }
    }, {
      title: '操作',
      key: 'operate',
      minWidth: 140,
      maxWidth: 240,
      render: (h, params) => {
        return h('div', [
          h('Button', {
            props: {
              size: 'small'
            },
            style: {
              marginRight: '5px', ...self.lookStyle()
            },
            on: {
              click: () => {
                self.show(params.row.ebayAccountId, 'check', params.row.saleAccount.account);
              }
            }
          }, '查看'),
          h('Button', {
            props: {
              size: 'small'
            },
            style: {
              marginRight: '5px', ...self.editStyle()
            },
            on: {
              click: () => {
                self.show(params.row.ebayAccountId, 'edit', params.row.saleAccount.account);
              }
            }
          }, '编辑'),
          params.row.ebayStatus !== 0 && params.row.saleAccount.status === 0 ? h('Button', {
            props: {
              size: 'small'
            },
            style: {
              marginRight: '5px', ...self.enableStyle()
            },
            on: {
              click: () => {
                var stopParams = {
                  saleAccountId: params.row.saleAccount.saleAccountId,
                  status: '1'
                };
                self.enbaleStatus(stopParams);
              }
            }
          }, '启用') : params.row.ebayStatus !== 0 && params.row.saleAccount.status !== 0 ? h('Button', {
            props: {
              size: 'small'
            },
            style: {
              marginRight: '5px', ...self.disableStyle()
            },
            on: {
              click: () => {
                var stopParams = {
                  saleAccountId: params.row.saleAccount.saleAccountId,
                  status: '0'
                };
                self.disableStatus(stopParams);
              }
            }
          }, '停用') : '',
          // 所有平台允许已授权店铺重新授权
          h('Button', {
            props: {
              size: 'small'
            },
            style: {
              marginRight: '5px', ...self.accreditStyle()
            },
            on: {
              click: () => {
                self.show(params.row.ebayAccountId, 'give', params.row.saleAccount.account);
              }
            }
          }, '授权')
        ]);
      }
    }
  ]; */
};
