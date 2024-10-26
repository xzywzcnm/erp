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
// getLodop();

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
    } catch (err) { alert('请打开C-lodop:' + err); };

    if (!LODOP && document.readyState !== 'complete') {
      alert('C-Lodop没准备好，请稍后再试！');
      return false;
    };
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

// 打印条码
export const print_sendLabel = function (LODOP, data, size = { w: '70mm', h: '20mm' }) {
  LODOP.PRINT_INITA(0, 0, "70mm", "20mm", '标签打印'); // 初始化打印机
  LODOP.SET_PRINT_STYLE('FontName', 'SimSun');
  LODOP.SET_PRINT_STYLE('FontSize', 8);
  LODOP.SET_PRINT_PAGESIZE(0, "70mm", "20mm", '');
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
                <span style="font-size: 8pt;font-weight:bold;font-family:SimSun;word-break: break-all;">${item.supplierNo}</span><br>
                <span style="font-size: 11pt;font-weight:bold;font-family:SimSun;word-break: break-all;">${item.specificationList[0]}</span><br>
                <span style="font-size: 11pt;font-weight:bold;font-family:SimSun;word-break: break-all;">${item.specificationList[1]}</span>
            `);
    }
  });
  LODOP.PREVIEW();
  // LODOP.PRINT();
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
