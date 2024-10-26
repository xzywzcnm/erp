import menuAliexpress from './menuAliexpress';
import menuAmazon from './menuAmazon';
import menuCommonOrder from './menuCommonOrder';
import menuEbay from './menuEbay';
import menuChannel from './menuChannel';
import menuWish from './menuWish';

export default {
  menu: [
    ...menuEbay.ebay, ...menuAliexpress.aliexpress, ...menuAmazon.amazon, {
      'mainTitle': '更多平台',
      'type': 'AroundGroup',
      'id': 'AroundGroup',
      'childrens': [
        ...menuWish.wish,
        ...menuCommonOrder.shopify,
        ...menuCommonOrder.lazada,
        ...menuCommonOrder.dhgate,
        ...menuCommonOrder.shopee,
        ...menuCommonOrder.joom,
        ...menuCommonOrder.yandex,
        ...menuCommonOrder.walmart,
        ...menuCommonOrder.jdyn,
        ...menuCommonOrder.ept,
        ...menuCommonOrder.alibaba,
        ...menuCommonOrder.cdiscount,
        ...menuCommonOrder.factorymarket,
        ...menuCommonOrder.mycom,
        ...menuCommonOrder.newegg,
        ...menuCommonOrder.priceminister,
        ...menuCommonOrder.tophatter,
        ...menuCommonOrder.vova,
        ...menuCommonOrder.mercadolibre,
        ...menuCommonOrder.orderCommon,
        ...menuCommonOrder.real,
        ...menuCommonOrder.wb,
        ...menuCommonOrder.allegro,
        ...menuCommonOrder.temux,
        ...menuCommonOrder.otto,
        ...menuCommonOrder.sheinx,
        ...menuCommonOrder.miravia,
        ...menuCommonOrder.allplatform,
        ...menuChannel.definePlatform
      ]
    }
  ],
  aliexpress: menuAliexpress.aliexpress,
  amazon: menuAmazon.amazon,
  definePlatform: menuChannel.definePlatform,
  ebay: menuEbay.ebay,
  wish: menuWish.wish,
  shopify: menuCommonOrder.shopify,
  lazada: menuCommonOrder.lazada,
  dhgate: menuCommonOrder.dhgate,
  shopee: menuCommonOrder.shopee,
  joom: menuCommonOrder.joom,
  yandex: menuCommonOrder.yandex,
  walmart: menuCommonOrder.walmart,
  jdyn: menuCommonOrder.jdyn,
  ept: menuCommonOrder.ept,
  alibaba: menuCommonOrder.alibaba,
  cdiscount: menuCommonOrder.cdiscount,
  factorymarket: menuCommonOrder.factorymarket,
  mycom: menuCommonOrder.mycom,
  newegg: menuCommonOrder.newegg,
  priceminister: menuCommonOrder.priceminister,
  tophatter: menuCommonOrder.tophatter,
  vova: menuCommonOrder.vova,
  mercadolibre: menuCommonOrder.mercadolibre,
  real: menuCommonOrder.real,
  allegro: menuCommonOrder.allegro,
  otto: menuCommonOrder.otto,
  wb: menuCommonOrder.wb,
  tiktok: menuCommonOrder.tiktok,
  temux: menuCommonOrder.temux,
  ozon: menuCommonOrder.ozon,
  sheinx: menuCommonOrder.sheinx,
  miravia: menuCommonOrder.miravia,
  allplatform: menuCommonOrder.allplatform,
  orderCommon: menuCommonOrder.orderCommon
};
