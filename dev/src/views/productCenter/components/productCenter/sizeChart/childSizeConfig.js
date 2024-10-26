// 自定义属性
export let selfAttrList = {
  'en': {
    name: '英语',
    describe: [
      'About This Item(We aim to show you accurate product information):',
      '1.Please compare the detail sizes with yours before you buy!!! If your kid is big and tall child,we recomend choosing a larger size.',
      '2.Colors may be slightly different depending on computer and monitor settings',
      '3.Please allow 1-3cm differs due to manual measurement,thanks (All measurement in cm and please note 1cm=0.39inch)',
      'Thanks for your understanding.',
    ],
    column: {
      tagSize: 'Tag Size',
      recommend: 'Recommend Age',
      euSize: 'EU Size',
      // tops: 'Tops Length',
      // bust: 'Bust',
      // sleeve: 'Sleeve Length',
      // bottoms: 'Bottoms Length',
      // waistline: 'Waistline',
      // hips: 'Hips',
    },
    partHand: { cm: 'cm', inch: 'inch' },
    // 表格数据，2：婴幼童；3：儿童
    tableData: {
      2: [
        {
          cmrecommend: '0-3',
          inchrecommend: 'Months',
          euSize: '56-62CM',
        },
        {
          cmrecommend: '3-6',
          inchrecommend: 'Months',
          euSize: '62-68CM',
        },
        {
          cmrecommend: '6-9',
          inchrecommend: 'Months',
          euSize: '68-74CM',
        },
        {
          cmrecommend: '9-12',
          inchrecommend: 'Months',
          euSize: '74-80CM',
        },
        {
          cmrecommend: '12-18',
          inchrecommend: 'Months',
          euSize: '80-86CM',
        },
        {
          cmrecommend: '18-24',
          inchrecommend: 'Months',
          euSize: '86-92CM',
        },
        {
          cmrecommend: '2-3',
          inchrecommend: 'Years',
          euSize: '92–98CM',
        },
        {
          cmrecommend: '3-4',
          inchrecommend: 'Years',
          euSize: '98–104CM',
        },
      ],
      3: [
        {
          cmrecommend: '12-18',
          inchrecommend: 'Months',
          euSize: '80-86CM',
        },
        {
          cmrecommend: '18-24',
          inchrecommend: 'Months',
          euSize: '86-92CM',
        },
        {
          cmrecommend: '2-3',
          inchrecommend: 'Years',
          euSize: '92–98CM',
        },
        {
          cmrecommend: '3-4',
          inchrecommend: 'Years',
          euSize: '98–104CM',
        },
        {
          cmrecommend: '4-5',
          inchrecommend: 'Years',
          euSize: '104-110CM',
        },
        {
          cmrecommend: '5-6',
          inchrecommend: 'Years',
          euSize: '110-116CM',
        },
        {
          cmrecommend: '6-7',
          inchrecommend: 'Years',
          euSize: '116-122CM',
        },
        {
          cmrecommend: '7-8',
          inchrecommend: 'Years',
          euSize: '122-128CM',
        },
        {
          cmrecommend: '8-9',
          inchrecommend: 'Years',
          euSize: '128-134CM',
        },
        {
          cmrecommend: '9-10',
          inchrecommend: 'Years',
          euSize: '134-140CM',
        },
      ]
    },
    tableHead: 'Size Chart', // 表头
  },
  'ger': {
    name: '德语',
    describe: [
      'Über diesen Artikel (Wir möchten Ihnen genaue Produktinformationen zeigen):',
      '1.Bitte vergleichen Sie die Detailgrößen mit Ihren, bevor Sie kaufen !!! Wenn Ihr Kind groß und groß ist, empfehlen wir, eine größere Größe zu wählen.',
      '2.Farben können je nach Computer- und Monitoreinstellungen leicht abweichen',
      '3.Bitte erlauben Sie, dass 1-3 cm aufgrund des manuellen Maßes abweichen, danke (Alle Maße in cm und bitte beachten Sie 1 cm = 0,39 Zoll)',
      'Danke für dein Verständnis.',
    ],
    column: {
      tagSize: 'Etikettengröße',
      recommend: 'Alter empfehlen Size',
      euSize: 'EU Größe',
      tops: 'Tops Länge',
      bust: 'Brustumfang',
      sleeve: 'Ärmellänge',
      bottoms: 'HosenLänge',
      waistline: 'Taillenumfang',
      hips: 'Hüften',
    },
    partHand: { cm: 'cm', inch: 'inch' },
    // 表格数据，2：婴幼童；3：儿童
    tableData: {
      2: [
        {
          cmrecommend: '0-3',
          inchrecommend: 'Monate',
          euSize: '56-62CM',
        },
        {
          cmrecommend: '3-6',
          inchrecommend: 'Monate',
          euSize: '62-68CM',
        },
        {
          cmrecommend: '6-9',
          inchrecommend: 'Monate',
          euSize: '68-74CM',
        },
        {
          cmrecommend: '9-12',
          inchrecommend: 'Monate',
          euSize: '74-80CM',
        },
        {
          cmrecommend: '12-18',
          inchrecommend: 'Monate',
          euSize: '80-86CM',
        },
        {
          cmrecommend: '18-24',
          inchrecommend: 'Monate',
          euSize: '86-92CM',
        },
        {
          cmrecommend: '2-3',
          inchrecommend: 'Jahre',
          euSize: '92–98CM',
        },
        {
          cmrecommend: '3-4',
          inchrecommend: 'Jahre',
          euSize: '98–104CM',
        },
      ],
      3: [
        {
          cmrecommend: '12-18',
          inchrecommend: 'Monate',
          euSize: '80-86CM',
        },
        {
          cmrecommend: '18-24',
          inchrecommend: 'Monate',
          euSize: '86-92CM',
        },
        {
          cmrecommend: '2-3',
          inchrecommend: 'Jahre',
          euSize: '92–98CM',
        },
        {
          cmrecommend: '3-4',
          inchrecommend: 'Jahre',
          euSize: '98–104CM',
        },
        {
          cmrecommend: '4-5',
          inchrecommend: 'Jahre',
          euSize: '104-110CM',
        },
        {
          cmrecommend: '5-6',
          inchrecommend: 'Jahre',
          euSize: '110-116CM',
        },
        {
          cmrecommend: '6-7',
          inchrecommend: 'Jahre',
          euSize: '116-122CM',
        },
        {
          cmrecommend: '7-8',
          inchrecommend: 'Jahre',
          euSize: '122-128CM',
        },
        {
          cmrecommend: '8-9',
          inchrecommend: 'Jahre',
          euSize: '128-134CM',
        },
        {
          cmrecommend: '9-10',
          inchrecommend: 'Jahre',
          euSize: '134-140CM',
        },
      ]
    },
    tableHead: 'Größe-Einzelheiten', // 表头
  },
  fra: {
    name: '法语',
    partHand: { cm: 'cm', inch: 'inch' },
  },
  spn: {
    name: '西班牙语',
    partHand: { cm: 'cm', inch: 'inch' },
  },
  it: {
    name: '意大利语',
    partHand: { cm: 'cm', inch: 'inch' },
  },
  por: {
    name: '葡萄牙语',
    partHand: { cm: 'cm', inch: 'inch' },
  },
  pol: {
    name: '波兰语',
    partHand: { cm: 'cm', inch: 'inch' },
  },
  cn: {
    name: '中文',
    describe: [
      '关于本产品(我们旨在向您展示准确的产品信息):',
      '1、请在购买前将细节尺寸与你的进行比较!!如果您的孩子是又大又高的孩子，我们建议您选择大号的。',
      '2、根据电脑和显示器的设置，颜色可能略有不同',
      '3、请允许手工测量造成1-3cm的差异，谢谢(所有测量单位为cm，请注意1cm=0.39英寸)',
      '非常感谢您的理解',
    ],
    column: {
      tagSize: '部位',
      recommend: '建议年龄',
      euSize: '欧洲尺码',
      tops: '上衣长度',
      bust: '胸围',
      sleeve: '袖长',
      bottoms: '下衣长度',
      waistline: '腰围',
      // 三围
      hips: '臀围',
    },
    partHand: { cm: 'cm', inch: 'inch' },
    // 表格数据，2：婴幼童；3：儿童
    tableData: {
      2: [
        {
          cmrecommend: '0-3',
          inchrecommend: '月',
          euSize: '56-62CM',
        },
        {
          cmrecommend: '3-6',
          inchrecommend: '月',
          euSize: '62-68CM',
        },
        {
          cmrecommend: '6-9',
          inchrecommend: '月',
          euSize: '68-74CM',
        },
        {
          cmrecommend: '9-12',
          inchrecommend: '月',
          euSize: '74-80CM',
        },
        {
          cmrecommend: '12-18',
          inchrecommend: '月',
          euSize: '80-86CM',
        },
        {
          cmrecommend: '18-24',
          inchrecommend: '月',
          euSize: '86-92CM',
        },
        {
          cmrecommend: '2-3',
          inchrecommend: '年',
          euSize: '92–98CM',
        },
        {
          cmrecommend: '3-4',
          inchrecommend: '年',
          euSize: '98–104CM',
        },
      ],
      3: [
        {
          cmrecommend: '12-18',
          inchrecommend: '月',
          euSize: '80-86CM',
        },
        {
          cmrecommend: '18-24',
          inchrecommend: '月',
          euSize: '86-92CM',
        },
        {
          cmrecommend: '2-3',
          inchrecommend: '年',
          euSize: '92–98CM',
        },
        {
          cmrecommend: '3-4',
          inchrecommend: '年',
          euSize: '98–104CM',
        },
        {
          cmrecommend: '4-5',
          inchrecommend: '年',
          euSize: '104-110CM',
        },
        {
          cmrecommend: '5-6',
          inchrecommend: '年',
          euSize: '110-116CM',
        },
        {
          cmrecommend: '6-7',
          inchrecommend: '年',
          euSize: '116-122CM',
        },
        {
          cmrecommend: '7-8',
          inchrecommend: '年',
          euSize: '122-128CM',
        },
        {
          cmrecommend: '8-9',
          inchrecommend: '年',
          euSize: '128-134CM',
        },
        {
          cmrecommend: '9-10',
          inchrecommend: '年',
          euSize: '134-140CM',
        },
      ]
    },
    tableHead: '尺码图', // 表头
  },
}

export const tableLangInfo = {
  an: {
    headTitle: 'Size-Details',
    otherLabel: {
      an: 'US',
      en: 'UK-AU',
      ger: 'EU-DE',
      fra: 'FR',
      spn: 'ESP',
      it: 'IT',
      por: 'POR',
      pol: 'PL',
      cn: 'CHN',
      name: 'Tag Size',
    }
  },
  en: {
    headTitle: 'Size-Details',
    otherLabel: {
      an: 'US',
      en: 'UK-AU',
      ger: 'EU-DE',
      fra: 'FR',
      spn: 'ESP',
      it: 'IT',
      por: 'POR',
      pol: 'PL',
      cn: 'CHN',
      name: 'Tag Size',
    }
  },
  ger: {
    headTitle: 'Größe-Einzelheiten',
    otherLabel: {
      an: 'US Größe',
      en: 'UK Größe',
      ger: 'EU Größe',
      fra: '',
      spn: '',
      it: '',
      por: '',
      pol: '',
      cn: '',
      name: 'Etikettengröße',
    }
  },
  fra: {},
  spn: {},
  it: {},
  por: {},
  pol: {},
  cn: {
    headTitle: '尺码信息',
    otherLabel: {
      an: '',
      en: '',
      ger: '',
      fra: '',
      spn: '',
      it: '',
      por: '',
      pol: '',
      cn: '',
      name: 'Tag Size',
    }
  },
  default: {
    headTitle: 'Size-Details',
    otherLabel: {
      an: 'Tag Size',
      en: 'Tag Size',
      ger: '',
      fra: '',
      spn: '',
      it: '',
      por: '',
      pol: '',
      cn: '',
      name: 'Tag Size'
    }
  }
}
