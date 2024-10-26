/*
 * @Author: w
 * @Date: 2021-04-09 10:02:06
 * @LastEditors: w
 * @LastEditTime: 2021-05-06 09:48:52
 */
// ====页面动态加载C-Lodop云打印必须的文件 CLodopfuncs.js ====
/* //让其它电脑的浏览器通过本机打印（仅适用 C-Lodop 自带的例子）：
var oscript = document.createElement("script");
oscript.src ="/CLodopfuncs.js";
head.insertBefore( oscript,head.firstChild ); */

// C-Lodop 下载地址 https://www.lodop.net/download.html
import '@/utils/LodopFuncs';
import common from '@/utils/common';
// getLodop();
const printKey = {
  width: 'width',
  height: 'height',
  printNum: 'printNum',
  pdfUrl: 'pdfUrl'
}
// 单位转换
const mmPx = {
  mmToPx: (val) => {
    return common.mmToPx(val);
  },
  pxToMm: (val) => {
    return common.pxToMm(val);
  }
}

export const createScript = function () {
  // 让本机的浏览器打印(更优先一点)：
  var head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
  if (document.querySelector('#by_first')) return;
  var oscript = document.createElement('script');
  oscript.src = 'http://localhost:8000/CLodopfuncs.js?priority=2';
  oscript.id = 'by_first';
  head.insertBefore(oscript, head.firstChild);

  // 加载双端口(8000和18000）避免其中某个端口被占用：
  oscript = document.createElement('script');
  oscript.id = 'by_second';
  oscript.src = 'http://localhost:18000/CLodopfuncs.js?priority=1';
  head.insertBefore(oscript, head.firstChild);
};

// ====获取LODOP对象的主过程：====
export const getLodopInstance = (oOBJECT, oEMBED) => {
  let LODOP = {};
  try {
    try {
      LODOP = window.getCLodop();
    } catch (err) { alert('请打开C-lodop:' + err); }

    if (!LODOP && document.readyState !== 'complete') {
      alert('C-Lodop没准备好，请稍后再试！');
      return false;
    }
    // LODOP.SET_LICENSES('', '8358D0811E39D1DFDC410BFA8F9D627B', 'C94CEE276DB2187AE6B65D56B3FC2848', '');
    // LODOP.SET_LICENSES('', '40D3921F7E6276C46954847C0228092F', 'C94CEE276DB2187AE6B65D56B3FC2848', '');
    // LODOP.SET_LICENSES("深圳市力得得力技术有限公司", "EFBAA11B32E17DEF2AA21C83F683CA27", "深圳市力得得力技術有限公司", "26850A61F7A069ECABBDBA1CECCADC3B");
    // LODOP.SET_LICENSES("THIRD LICENSE", "", "Shenzhen Leaddeal Technology Co., Ltd.", "76FD901FAAAD2BD8354051606F79922D");
    // 清理原例子内的object或embed元素，避免乱提示：
    if (oEMBED && oEMBED.parentNode) oEMBED.parentNode.removeChild(oEMBED);
    if (oOBJECT && oOBJECT.parentNode) oOBJECT.parentNode.removeChild(oOBJECT);
    // 默认设置纸张大小
    set_print_pagesize(LODOP, { w: '50.8mm', h: '25.4mm' });
    return LODOP;
  } catch (err) {
    alert('getLodop出错:' + err);
    return false;
  }
};

export const needCLodop = function () {
  return true;
};

// 设置打印的size
export const set_print_pagesize = (LODOP, size) => {
  try {
    LODOP.PRINT_INITA(0, 0, size.w, size.h, '登宇通条码打印'); // 初始化打印机
    LODOP.SET_PRINT_PAGESIZE(0, size.w, size.h, ''); // 设定纸张打印大小
    return {
      type: 'success',
      message: `打印尺寸已设置为${size.w}*${size.h},请更换字条`
    };
  } catch (e) {
    return {
      type: 'error',
      message: '更换失败，请检查打印机是否连接好，再刷新页面'
    };
  }
};

// 打印单一LAPA条码
export const print_sendLabel = function (LODOP, data, size = { w: '70mm', h: '20mm' }) {
  LODOP.PRINT_INITA(0, 0, size.w, size.h, '标签打印'); // 初始化打印机
  LODOP.SET_PRINT_STYLE('FontName', 'SimSun');
  LODOP.SET_PRINT_STYLE('FontSize', 8);
  LODOP.SET_PRINT_PAGESIZE(0, size.w, size.h, '');
  data.forEach((item) => {
    for (let i = 0; i < item.printNum; i++) {
      LODOP.NewPageA();
      LODOP.ADD_PRINT_BARCODE('2mm', '2mm', '35mm', '9mm', '128Auto', item.skuNo);
      LODOP.SET_PRINT_STYLEA(0, "ShowBarText", 0);
      LODOP.SET_PRINT_STYLE('FontSize', 9.2);
      LODOP.SET_PRINT_STYLE('Bold', 1);
      LODOP.ADD_PRINT_TEXT('12mm', '2mm', '35mm', '', item.skuNo);
      LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
      LODOP.ADD_PRINT_HTM('2mm', '40mm', '30mm', '18mm', `
      ${item.supplierNo?`<span style="font-size: 8pt;font-weight:bold;font-family:SimSun;word-break: break-all;">${item.supplierNo}</span><br>`:''}
      ${item.specificationslist[0]?`<span style="font-size: 11pt;font-weight:bold;font-family:SimSun;word-break: break-all;">${item.specificationslist[0]}</span><br>`:''}
      ${item.specificationslist[1]?`<span style="font-size: 11pt;font-weight:bold;font-family:SimSun;word-break: break-all;">${item.specificationslist[1]}</span>`:''}
    `);
    }
  });
  LODOP.PREVIEW();
  // LODOP.PRINT();
}
// 打印Temu条码
export const print_temuLabel = function (LODOP, data, size = { w: '70mm', h: '20mm' }) {
  LODOP.NewPageA();
  LODOP.ADD_PRINT_BARCODE('6mm', '5mm', '60mm', '8mm', '128Auto', data.barCode);
  LODOP.SET_PRINT_STYLEA(0, "ShowBarText", 0);
  LODOP.SET_PRINT_STYLE('FontSize', 9.2);
  LODOP.SET_PRINT_STYLE('Bold', 1);
  LODOP.ADD_PRINT_TEXT('2.5mm', '4mm', '', '', data.extCode);
  LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8);
  LODOP.ADD_PRINT_TEXT('2.5mm', '28mm', '40mm', '', data.skcSpecName);
  LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8);
  LODOP.ADD_PRINT_TEXT('2.5mm', '53mm', '40mm', '', data.skuSpecName);
  LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8);
  LODOP.ADD_PRINT_TEXT('15mm', '4mm', '', '', data.platformSku);
  LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8);
  LODOP.ADD_PRINT_TEXT('15mm', '30mm', '', '', data.skcSpecName11);
  LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8);
  LODOP.ADD_PRINT_TEXT('15mm', '39mm', '40mm', '', `Made In ${data.countryName || ''}`);
  LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8);
  LODOP.ADD_PRINT_HTM('2mm','1mm','','',`
  <div style="width: 244px;height: 62px;border: 1px solid black"></div>
  `)
}
// 打印lapa条码
export const print_lapaLabel = function (LODOP, data, size = { w: '60mm', h: '40mm' }) {
  LODOP.NewPageA();
  LODOP.ADD_PRINT_BARCODE('2mm', '2mm', '35mm', '9mm', '128Auto', data.skuNo);
  LODOP.SET_PRINT_STYLEA(0, "ShowBarText", 0);
  LODOP.SET_PRINT_STYLE('FontSize', 9.2);
  LODOP.SET_PRINT_STYLE('Bold', 1);
  LODOP.ADD_PRINT_TEXT('12mm', '2mm', '35mm', '', data.skuNo);
  LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
  LODOP.ADD_PRINT_HTM('2mm', '40mm', '30mm', '18mm', `
  ${data.supplierNo?`<span style="font-size: 8pt;font-weight:bold;font-family:SimSun;word-break: break-all;">${data.supplierNo}</span><br>`:''}
  ${data.specificationslist[0]?`<span style="font-size: 11pt;font-weight:bold;font-family:SimSun;word-break: break-all;">${data.specificationslist[0]}</span><br>`:''}
  ${data.specificationslist[1]?`<span style="font-size: 11pt;font-weight:bold;font-family:SimSun;word-break: break-all;">${data.specificationslist[1]}</span>`:''}
`);
}
// 打印Tiktok条码
export const print_tiktokLabel = function (LODOP, data, size = { w: '70mm', h: '20mm' }) {
  LODOP.NewPageA();
  LODOP.ADD_PRINT_BARCODE('4.5mm', '5.9mm', '65mm', '9.2mm', '128Auto', data.barCode);
  LODOP.SET_PRINT_STYLEA(0, "ShowBarText", 0);
  LODOP.SET_PRINT_STYLE('FontSize', 6.4);
  LODOP.SET_PRINT_STYLE('Bold', 1);
  LODOP.ADD_PRINT_TEXT('1.4mm', '1.9mm', '40mm', '', data.barCode);
  LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
  LODOP.ADD_PRINT_TEXT('1.4mm', '41mm', '40mm', '', data.platformSku);
  LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
  LODOP.ADD_PRINT_TEXT('13.9mm', '1.9mm', '40mm', '', 
  `${data.skcSpecName ? data.skcSpecName : ''}-${data.skuSpecName ? data.skuSpecName : ''}`); // 左下第一行
  LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
  LODOP.ADD_PRINT_TEXT('16.6mm', '1.9mm', '40mm', '', `货号:${data.extCode}`); // 左下第二行
  LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
  // LODOP.ADD_PRINT_TEXT('13.9mm', '58.4mm', '', '', data.skuSpecName);
  LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
  LODOP.ADD_PRINT_TEXT('13.9mm', '50.4mm', '', '', `MADE IN CHINA`);
  LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
  // LODOP.ADD_PRINT_HTM('1.2mm','1.4mm','','',`
  // <div style="width: ${common.mmToPx(67)}px;height: ${common.mmToPx(17.6)}px;border: 1px solid black"></div>
  // `)
}
// 打印shein条码
export const print_sheinLabel = function (LODOP, data, size = { w: '70mm', h: '20mm' }) {
  LODOP.NewPageA();
  LODOP.ADD_PRINT_BARCODE('5.5mm', '10mm', '60mm', '9.5mm', '128Auto', data.barCode);
  LODOP.SET_PRINT_STYLEA(0, "ShowBarText", 0);
  LODOP.SET_PRINT_STYLE('FontSize', 9.2);
  LODOP.SET_PRINT_STYLE('Bold', 1);
  LODOP.ADD_PRINT_TEXT('2.5mm', '7mm', '40mm', '', data.supplierItem);
  LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8);
  LODOP.ADD_PRINT_TEXT('2.5mm', '45mm', '', '', 'Made In China');
  LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8);
  LODOP.ADD_PRINT_TEXT('15mm', '7mm', '40mm', '', data.productSkcId);
  LODOP.SET_PRINT_STYLEA(0, "whiteSpace", "nowrap");
  LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8);
  LODOP.ADD_PRINT_TEXT('15mm', '60mm', '40mm', '', `${data.skuSpecName ? data.skuSpecName : data.skcSpecName}`);
  LODOP.SET_PRINT_STYLEA(0, "Alignment", 1);
  LODOP.SET_PRINT_STYLEA(0, 'FontSize', 8);
  LODOP.ADD_PRINT_HTM('2mm','4mm','','',`
  <div style="width: ${mmPx.mmToPx(63)}px;height: ${mmPx.mmToPx(16)}px;border: 1px solid black"></div>
  `)
}

export const print_html = function (LODOP, node, toPrview = true, callback, initP = {
  w: '210',
  h: '297',
  css: 'printSend'
}) {
  var css = initP.css
  console.log(`<head>
        <link rel="stylesheet" href="/css/${css}.css" media="print" />
      </head>
      <body>${node}</body>`);
  LODOP.PRINT_INITA(10, 10, initP.w, initP.h, '派敏斯图片打印'); // 初始化打印机
  // 设置打印项风格
  // Stretch的值：数字型，0--截取图片 1--扩展（可变形）缩放 2--按原图长和宽比例（不变形）缩放。缺省值是0。
  LODOP.SET_PRINT_STYLE("Stretch", 2);// (不可变形)扩展缩放模式

  LODOP.ADD_PRINT_HTM(0, 0, "100%", "100%",
    `<head>
        <link rel="stylesheet" href="/css/${css}.css"/>
      </head>
      <body>${node}</body>`);
  // 调用打印开始
  // 预览
  if (toPrview) {
    LODOP.PREVIEW();
  } else {
    LODOP.PRINT();
  }
  callback && callback();
}

export const print_pdf = (data, { width = '70mm', height = '20mm', page = 1 } = {}) => {
  return new Promise((resolve) => {
    let LODOP = getLodopInstance();
    // PRINT_INITA(Top边距,Left边距,Width,Height,打印名称)
    LODOP.PRINT_INITA(0, 0, width, height, '标签打印'); // 初始化打印机
    // SET_PRINT_PAGESIZE(intOrient, PageWidth,PageHeight,strPageName)
    // intOrient
    // 0(或其它)----打印方向由操作者自行选择或按打印机缺省设置；
    // 1---纵(正)向打印，固定纸张；
    // 2---横向打印，固定纸张；
    // 3---纵(正)向打印，宽度固定，高度按打印内容的高度自适应；
    LODOP.SET_PRINT_PAGESIZE(0, width, height, '');
    // 增加超文本打印项(普通模式)
    // LODOP.ADD_PRINT_HTM(Top,Left,Width,Height,strHtmlContent);
    for (let i = 0; i < page; i++) {
      LODOP.NewPageA();
      LODOP.ADD_PRINT_PDF(0, 0, '100%', '100%', data);
    }
    LODOP.PREVIEW();
    resolve(true);
  })
}
// 混合打印
export const print_mixHand = (data, {
  width = '70mm',
  height = '20mm',
  page = 1,
  replaceKey = {}
} = {}) => {
  let LODOP = getLodopInstance();
  const currentKey = {...printKey, ...replaceKey};
  return new Promise((resolve) => {
    if (common.isEmpty(data)) {
      return resolve({succeeds: true });
    }
    if (common.isArray(data)) {
      common.promiseAll(data.map(m => {
        return () => {
          return new Promise((resolve) => {
            if (common.isEmpty(m[currentKey.pdfUrl])) {
              resolve({...m, [currentKey.page]: m[currentKey.page] || page});
            } else {
              fetch(m[currentKey.pdfUrl]).then(res => {
                return res.blob();
              }).then(blobRes => {
                common.blobToBase64(blobRes).then(base64Res => {
                  resolve({...m, pdfRes: base64Res, [currentKey.page]: m[currentKey.page] || page });
                })
              }).catch(() => {
                resolve({...m, pdfRes: null, [currentKey.page]: m[currentKey.page] || page });
              })
            }
          })
        }
      })).then(arr => {
        const printSize = { width: width, height: height };
        arr.forEach((item, index) => {
          if (index === 0) {
            printSize.width = item[currentKey.width] || width;
            printSize.height = item[currentKey.height] || height;
            LODOP.PRINT_INITA(0, 0, printSize.width, printSize.height, '标签打印'); // 初始化打印机
          }
          LODOP.SET_PRINT_PAGESIZE(0, printSize.width, printSize.height, '');
          if (!common.isEmpty(item.pdfRes)) {
            for (let i = 0; i < item[currentKey.page]; i++) {
              LODOP.NewPageA();
              LODOP.ADD_PRINT_PDF(0, 0, '100%', '100%', item.pdfRes);
            }
          } else {
            LODOP.SET_PRINT_STYLE('FontName', 'SimSun');
            LODOP.SET_PRINT_STYLE('FontSize', 8);
            for (let i = 0; i < item[currentKey.page]; i++) {
              LODOP.NewPageA();
              LODOP.ADD_PRINT_BARCODE('2mm', '2mm', '35mm', '9mm', '128Auto', item.skuNo);
              LODOP.SET_PRINT_STYLEA(0, "ShowBarText", 0);
              LODOP.SET_PRINT_STYLE('FontSize', 9.2);
              LODOP.SET_PRINT_STYLE('Bold', 1);
              LODOP.ADD_PRINT_TEXT('12mm', '2mm', '35mm', '', item.skuNo);
              LODOP.SET_PRINT_STYLEA(0, "Alignment", 2);
              LODOP.ADD_PRINT_HTM('2mm', '40mm', '30mm', '18mm', `
                ${item.supplierNo?`<span style="font-size: 8pt;font-weight:bold;font-family:SimSun;word-break: break-all;">${item.supplierNo}</span><br>`:''}
                ${item.specificationslist[0]?`<span style="font-size: 11pt;font-weight:bold;font-family:SimSun;word-break: break-all;">${item.specificationslist[0]}</span><br>`:''}
                ${item.specificationslist[1]?`<span style="font-size: 11pt;font-weight:bold;font-family:SimSun;word-break: break-all;">${item.specificationslist[1]}</span>`:''}
              `);
            }
          }
        })
        LODOP.PREVIEW();
        // 监听 LODOP 返回值
        LODOP.On_Return = (TaskID, Value) => {
          console.log('On_Return', TaskID, Value)
        }
        resolve({succeeds: true });
      }).catch((err) => {
        common.error(err);
        resolve({succeeds: false });
      })
    }
  })
}

/**
 * 
 * @param {*} LODOP  LODOP对象
 * @param {*} printDataList  打印数据列表
 * @param {*} {} 默认配置尺寸
 */

export const print_PDF_and_sendLabel = function(LODOP,printDataList, {
  width = '70mm',
  height = '20mm',
  printNum = 1,
  replaceKey = {}
} = {}) {
  // LODOP.PRINT_INITA(0, 0, "100%", "100%", "打印PDF和标签");
  const currentKey = {...printKey, ...replaceKey};
  let size = {  w: width, h: height  }
  const isHasThirdTag = printDataList.find(item => (item.overseaTagId && item.overseaTagId !== '' && item.overseaTagId !== null) || 
  (item.platformSubject && item.platformSubject !== '' && item.platformSubject !== null));
  if (!isHasThirdTag) {
    print_sendLabel(LODOP, printDataList, size);
  } else {
    common.promiseAll(printDataList.map(item => {
      return () => {
        return new Promise((resolve) => {
          if (item.overseaTagId && item.overseaTagId !== '' && item.overseaTagId !== null) {
            fetch(item.filePath).then( res => {
              return res.blob()
            }).then(res => {
              common.blobToBase64(res).then((base64) => {
                resolve({pdf: base64, [currentKey.printNum]: item[currentKey.printNum] || printNum})
              })
            }).catch(() => {
              resolve(false)
            })
          } else {
            resolve(item)
          }
        })
      }
    })).then((arr) => {
      const printSize = {width: width, height: height}
      arr.forEach((page, idnex) => {
        if (idnex === 0) {
          printSize.width = page[currentKey.width] || width;
          printSize.height = page[currentKey.height] || height;
          LODOP.PRINT_INITA(0, 0, printSize.width, printSize.height, '标签打印'); // 初始化打印机
          LODOP.SET_PRINT_PAGESIZE(0, printSize.width, printSize.height, '');
        }
        if (!page.pdf) {
          for (let i = 0;  i < page[currentKey.printNum];  i++) {
            if(page.platformSubject && page.tagType === 1) {
              const { pagePxSze, file } = page.canvasData[0]
              // LODOP.NewPageA();
              // LODOP.ADD_PRINT_IMAGE(0, 0, pagePxSze.width -5 , pagePxSze.height, file  )
              // LODOP.SET_PRINT_STYLEA(0,"Stretch",1);
              page.platformSubject === 'Temu' ?  print_temuLabel(LODOP,page,size) : page.platformSubject === 'shein' 
              ? print_sheinLabel(LODOP,page,size) : print_tiktokLabel(LODOP,page,size)
            } else {
              print_lapaLabel(LODOP,page,size)
            }
          }
        }  else {
          for( let i = 0; i < page[currentKey.printNum]; i++) {
            LODOP.NewPageA();
            LODOP.ADD_PRINT_PDF(0, 0, "100%", "100%", page.pdf);
          }
        } 
      })
      LODOP.PREVIEW();
    })
  }
  // LODOP.PREVIEW()
};

