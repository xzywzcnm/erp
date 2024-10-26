import common from '@/utils/common';
// 条码生成，， 需要安装依赖：yarn add jsbarcode
import JsBarcode from 'jsbarcode';
// 将 html 转为 图片，需要安装依赖：yarn add html2canvas
import html2Canvas from 'html2canvas';
// pdf 文件生成，需要安装依赖：yarn add jspdf
import JsPdf from 'jspdf';

// 单位转换
const mmPx = {
  mmToPx: (val) => {
    return common.mmToPx(val, 'tongTu');
  },
  pxToMm: (val) => {
    return common.pxToMm(val, 'tongTu');
  }
}
// 键匹配
const constant = {
  // 默认key
  defaultKey: {
    // 数据， Number
    data: 'data',
    // pdf 宽度， Number
    width: 'width',
    // pdf 高度，Number
    height: 'height',
    // 是否使用文件本身尺寸， 设置false时使用设置的尺寸
    isFileSize: 'isFileSize',
    // 打印页数， Number
    page: 'page',
    // 单位， String
    unit: 'unit',
    // 供应商编码, Number、String
    supplierNo: 'supplierNo',
    // 规格， Array 默认标签特有
    specification: 'specificationList',
    // 标签类型 platformId
    tagType: 'tagType',
    // 条码，Number、String
    barcode: 'barcode', // labelCode
    // ----- 分割线 以上以原来的 lapa 标签配置，下面为第三方标签配置 ------
    leftTop: 'leftTop', // 条码左上角 extCode
    middleTop: 'middleTop', // 条码正上(即条码中间上方) skcSpecName
    rightTop: 'rightTop', // 条码右上角 skuSpecName
    leftBottom: 'leftBottom', // 条码左下角 platformSku
    middleBottom: 'middleBottom', // 条码正下(即条码中间下方) middleBottom
    rightBottom: 'rightBottom', // 条码右下下角 countryName
  },
  minWidth: 300, // 单位 px
  maxWidth: 2000 // 单位 px
}
// 宽高
const getPageSize = (data, useKey, isDispose = true) => {
  const unit = data.unit || useKey.unitVal;
  let width = data[useKey.width] || useKey.pageWidth;
  let height = data[useKey.height] || useKey.pageHeight;
  if (!isDispose) return { width: width, height: height };
  if (unit === 'mm') {
    width = mmPx.mmToPx(width);
    height = mmPx.mmToPx(height);
  }
  if (width < constant.minWidth) {
    height = (constant.minWidth / width) * height;
    width = constant.minWidth;
  } else if (width > constant.maxWidth) {
    height = (constant.maxWidth / width) * height;
    width = constant.maxWidth;
  }
  return { width: mmPx.pxToMm(width), height: mmPx.pxToMm(height) };
}

// 通用标签
const universalHtml = (data, useKey, novId, { img = 'img', width = 529.14, height = 151.18, border = '2px solid #333', barcodeObj = {} } = {}) => {
  const font = `font-size: 16px;font-weight:bold; overflow: hidden; white-space: nowrap;`;
  const rightTopTxt = data[useKey.rightTop] || useKey.rightTopDefaultTxt;
  const barcodeTop = `
  <div style="height: ${mmPx.mmToPx(0.5)}px;"></div>
  <div style="display: flex; justify-content: space-between; height: 22px;">
    <strong style="display:inline-block; margin:0 ${mmPx.mmToPx(2)}px; ${font}">
      ${data[useKey.leftTop] ? `${useKey.leftTopSubjoinTxt || ''} ${data[useKey.leftTop]}` : ''}
    </strong>
    ${common.isEmpty(data[useKey.middleTop]) ? '' : `<strong style="${font}text-align: center;">${data[useKey.middleTop] || ''}</strong>`}
    <strong style="display:inline-block; margin:0 ${mmPx.mmToPx(2)}px; ${font}background:#fff;">
      ${rightTopTxt ? `${useKey.rightTopSubjoinTxt || ''} ${rightTopTxt}` : ''}
    </strong>
  </div>`;
  let barcode = `<img  id="barcode-${novId}" style="width: 100%; height: calc(100% - ${(mmPx.mmToPx(1) + 44)}px);" />`;
  const barcodeBottom = `<div style="display: flex; justify-content: space-between; height: 22px;">
    <strong style="display:inline-block; margin:0 ${mmPx.mmToPx(2)}px;${font}">${data[useKey.leftBottom] || ''}</strong>
    ${common.isEmpty(data[useKey.middleBottom]) ? '' : `<strong style="${font}text-align: center;">${data[useKey.middleBottom] || ''}</strong>`}
    <strong style="display:inline-block; margin:0 ${mmPx.mmToPx(2)}px; ${font}background:#fff;">
      ${data[useKey.rightBottom] ? `${useKey.rightBottomSubjoinTxt || ''} ${data[useKey.rightBottom]}` : ''}
    </strong>
  </div>`;
  const barcodeFourLine = `<div style="display: flex; justify-content: space-between; height: 22px;">
    <strong style="display:inline-block; margin:0 ${mmPx.mmToPx(2)}px;${font}">${data[useKey.leftFourLine] || ''}</strong>
    ${common.isEmpty(data[useKey.middleFourLine]) ? '' : `<strong style="${font}text-align: center;">${data[useKey.middleFourLine] || ''}</strong>`}
    <strong style="display:inline-block; margin:0 ${mmPx.mmToPx(2)}px; ${font}background:#fff;">
      ${data[useKey.rightFourLine] ? `${useKey.rightFourLineSubjoinTxt || ''} ${data[useKey.rightFourLine]}` : ''}
    </strong>
  </div>`;
  if (img != 'svg') {
    return `<div
      style="
        display: inline-block;
        padding: ${mmPx.mmToPx(2)}px;
        margin: 0;
        font-family:Microsoft YaHei;
        width: 100%;
        height: 100%;
        font-size: 0;
        overflow: hidden;
      "
    >
      <div
        style="
          display: inline-block;
          padding: 0;
          margin: 0;
          width: 100%;
          height: 100%;
          font-size: 0;
          border: ${border};
        "
      >
        ${barcodeTop}${barcode}${barcodeBottom}${barcodeFourLine}
      </div>
    </div>`;
  }
  barcode = `<div class="barcode-content" style="margin: auto;width: ${width * 2 - mmPx.mmToPx(10)}px;text-align: center;">
    <svg id="barcode-${novId}" height="${barcodeObj.height || 0}" />
  </div>`;
  // <div style="height: ${mmPx.mmToPx(1)}px;"></div>
  return `<div 
    style="
      display: inline-block;
      font-family:Microsoft YaHei;
      margin: auto ${mmPx.mmToPx(4)}px;
      width: ${width * 2 - mmPx.mmToPx(4)}px;
      height: ${height * 2 - mmPx.mmToPx(4)}px;
      background: #fff;
      font-size: 0;
      border: ${border};
      overflow: hidden;
      box-sizing: border-box;
    "
  >
    ${barcodeTop}${barcode}${barcodeBottom}${barcodeFourLine}
  </div>`;
}

// lapa 默认标签
const lapaHtml = (data, useKey, novId) => {
  return `<div style="display: flex; font-family:Microsoft YaHei; width: 100%">
  <div class="barcode-content">
    <svg id="barcode-${novId}" height="100%"/>
  </div>
    <div style="height: 100%; padding: 8px 8px 0 0;">
      ${data[useKey.supplierNo] ? `
        <div style="width:400px;font-size: 14pt;font-weight:bold;word-wrap: break-word;">
          ${data[useKey.supplierNo]}
        </div>
      ` : ''}
      ${data[useKey.specification] && data[useKey.specification][0] ? `
        <div style="width:400px;font-size: 14pt;font-weight:bold;word-wrap: break-word;">
          ${data[useKey.specification][0]}
        </div>
      ` : ''}
      ${data[useKey.specification] && data[useKey.specification][1] ? `
        <div style="width:400px;font-size: 14pt;font-weight:bold;word-wrap: break-word;">
          ${data[useKey.specification][1]}
        </div>
      ` : ''}
    </div>
  </div>`
}

// 全托管货箱标签
const fullyBoxHtml = (data, useKey, { width, height }) => {
  return `<div style="margin: ${mmPx.mmToPx(2)}px; width: ${width * 2 - mmPx.mmToPx(4)}px; height: ${height * 2 - mmPx.mmToPx(6)}px;display: inline-block; font-family:Microsoft YaHei;background: #fff;overflow: hidden;box-sizing: border-box;font-size:20px;">
    <div style="display:flex;">
      <div style="word-break: break-all;line-height:20px;margin-right:6px;">${data[useKey.platformBoxNo]}</div>
      <div style="flex:1;overflow:hidden;word-break: break-all;line-height:20px;text-align:right;">${data[useKey.boxRemark]}</div>
    </div>
    <div style="font-size:35px;">${data[useKey.pickingBoxNo]}</div>
    <div style="line-height:20px;">件数：${data[useKey.printNumber]}</div>
  </div>`
}

// 返回条码设置
const getHtmlConfig = (novId, pageSze, img) => {
  return {
    tiktok: {
      displayValue: false,
      imgReduce: 12, // img 时，高度需要减少的数值, 单位为 px
      svgReduce: mmPx.mmToPx(11.4), // svg 时，高度需要减少的数值
      barcodeWidth: 2,
      marginTop: 2,
      marginBottom: 2,
      marginLeft: 2,
      marginRight: 2,
      hand: (data, useKey, barcodeObj) => {
        return universalHtml(data, useKey, novId, {
          width: mmPx.mmToPx(pageSze.width),
          height: mmPx.mmToPx(pageSze.height),
          img: img,
          border: 'none',
          barcodeObj: barcodeObj
        });
      }
    },
    temu: {
      displayValue: false,
      imgReduce: 12, // img 时，高度需要减少的数值, 单位为 px
      svgReduce: mmPx.mmToPx(8.2), // svg 时，高度需要减少的数值
      barcodeWidth: 2,
      marginTop: 2,
      marginBottom: 2,
      marginLeft: 2,
      marginRight: 2,
      hand: (data, useKey, barcodeObj) => {
        return universalHtml(data, useKey, novId, {
          width: mmPx.mmToPx(pageSze.width),
          height: mmPx.mmToPx(pageSze.height),
          img: img,
          barcodeObj: barcodeObj
        });
      }
    },
    shein: {
      displayValue: false,
      imgReduce: 12, // img 时，高度需要减少的数值, 单位为 px
      svgReduce: mmPx.mmToPx(8.2), // svg 时，高度需要减少的数值
      barcodeWidth: 2,
      marginTop: 2,
      marginBottom: 2,
      marginLeft: 2,
      marginRight: 2,
      hand: (data, useKey, barcodeObj) => {
        return universalHtml(data, useKey, novId, {
          width: mmPx.mmToPx(pageSze.width),
          height: mmPx.mmToPx(pageSze.height),
          img: img,
          barcodeObj: barcodeObj
        });
      }
    },
    fullybox: {
      unBarcode: true,
      hand: (data, useKey) => {
        return fullyBoxHtml(data, useKey, {
          width: mmPx.mmToPx(pageSze.width),
          height: mmPx.mmToPx(pageSze.height),
        });
      }
    },
    // 处理标签
    process: {
      displayValue: false,
      imgReduce: 12, // img 时，高度需要减少的数值, 单位为 px
      svgReduce: mmPx.mmToPx(6), // svg 时，高度需要减少的数值
      barcodeWidth: 3,
      marginTop: 3,
      marginBottom: 3,
      marginLeft: 3,
      marginRight: 3,
      hand: (data, useKey, barcodeObj) => {
        return universalHtml(data, useKey, novId, {
          width: mmPx.mmToPx(pageSze.width),
          height: mmPx.mmToPx(pageSze.height),
          img: img,
          barcodeObj: barcodeObj
        });
      }
    }
  }
}

// 将 html 渲染到页面上 print_sendLabel 格式的条码
const prerenderHtml = (data, useKey, pageSze, img) => {
  return new Promise((resolve) => {
    const novId = `${new Date().getTime()}-${(Math.random() * Math.pow(10, 10)).toFixed(0)}`;
    let content = document.createElement('div');
    content.id = `content-${novId}`;
    content.style.position = 'absolute';
    content.style.top = '0';
    content.style.width = `${mmPx.mmToPx(pageSze.width) * 2}px`;
    content.style.height = `${mmPx.mmToPx(pageSze.height) * 2}px`;
    content.style.background = '#fff';
    content.style.zIndex = '-1';

    let tagType = '';
    let barcodeSvgObj = {};
    const getHtml = getHtmlConfig(novId, pageSze, img);
    if (common.isEmpty(data[useKey.tagType])) {
      content.innerHTML = lapaHtml(data, useKey, novId);
    } else {
      tagType = data[useKey.tagType].toLocaleLowerCase();
      if (!common.isEmpty(getHtml[tagType])) {
        if (!getHtml[tagType].unBarcode) {
          barcodeSvgObj = {
            width: getHtml[tagType].barcodeWidth * 2, // 线宽
            height: (mmPx.mmToPx(pageSze.height) - mmPx.mmToPx(2) - (getHtml[tagType].svgReduce || 0)) * 2, // 条码高度
            displayValue: common.isEmpty(getHtml[tagType]) ? true : getHtml[tagType].displayValue, // 是否显示文字
            marginTop: getHtml[tagType].marginTop,
            marginBottom: getHtml[tagType].marginBottom,
            marginLeft: getHtml[tagType].marginLeft,
            marginRight: getHtml[tagType].marginRight
          }
          content.innerHTML = getHtml[tagType].hand(data, useKey, barcodeSvgObj);
        } else {
          content.innerHTML = getHtml[tagType].hand(data, useKey);
        }
      } else {
        content.innerHTML = lapaHtml(data, useKey, novId);
      }
    }
    document.body.appendChild(content);
    if (!common.isEmpty(data[useKey.barcode])) {
      // 此处为lapa标签样式
      let barcodeObj = {
        // format: "CODE128", // 条形码的格式
        width: common.isEmpty(getHtml[tagType]) ? 2 : getHtml[tagType].barcodeWidth || 2, // 线宽
        // height: mmPx.mmToPx(pageSze.height) / 2, // 条码高度
        // height: mmPx.mmToPx(pageSze.height) - (common.isEmpty(getHtml[tagType]) ? 0 : getHtml[tagType].imgReduce), // 条码高度
        height: 100, // 条码高度
        // lineColor: "#000", // 线条颜色
        displayValue: common.isEmpty(getHtml[tagType]) ? true : getHtml[tagType].displayValue, // 是否显示文字
        fontOptions: common.isEmpty(getHtml[tagType]) ? "bold" : '',
        // margin: 10 // 设置条形码周围的空白区域
        marginTop: 5,
        marginBottom: 5
      };
      if (img == 'svg' && !common.isEmpty(data[useKey.tagType])) {
        barcodeObj = barcodeSvgObj;
      }
      // JsBarcode(`#barcode-${novId}`, 'BC123456789sdfhsthrthuryj', barcodeObj);
      JsBarcode(`#barcode-${novId}`, data[useKey.barcode], barcodeObj);
    }
    setTimeout(() => {
      resolve({
        nodes: document.querySelector(`#content-${novId}`),
        height: mmPx.mmToPx(pageSze.height),
        width: mmPx.mmToPx(pageSze.width)
      })
    }, 500)
  })
}

// 将 html 转为 canvas
const getHtmlView = (data, useKey, config = {}) => {
  const scale = config.scale || 2;
  const pageSze = getPageSize(data, useKey, false);
  return new Promise((resolve) => {
    prerenderHtml(data, useKey, pageSze, 'img').then((res) => {
      html2Canvas(res.nodes, {
        useCORS: true, // 开启跨域配置
        scale: scale, // 倍数 window.devicePixelRatio
        allowTaint: true, // 允许跨域图片
        // width: `${mmPx.mmToPx(pageSze.width)}`,
        // height: `${mmPx.mmToPx(pageSze.height)}`
      }).then(canvas => {
        resolve({
          scale: scale,
          file: canvas.toDataURL('image/jpeg'),
          pagePxSze: { width: canvas.width / (scale * 2), height: canvas.height / (scale * 2) },
          pageSze: [mmPx.pxToMm(canvas.width / (scale * 2)), mmPx.pxToMm(canvas.height / (scale * 2))]
        });
        res.nodes && res.nodes.remove();
      });
    }).catch((err) => {
      console.error(err)
    })
  })
}

// 将数据转为 canvas
const createCanvas = (resource, useKey, initData, config = {}) => {
  return new Promise((resolve) => {
    // 当资源为空时
    if (common.isEmpty(resource)) return resolve(null);
    // 当资源为对象时
    if (common.isJson(resource)) {
      if (common.isEmpty(resource[useKey.data])) {
        // 当资源为 html 时 sendLabel 打印时
        if (resource.sendLabel || !resource.printHtml) {
          getHtmlView(resource, useKey, config).then(canvas => {
            common.isArray(canvas) ? resolve(canvas) : resolve([canvas]);
          })
          return;
        }
        return resolve(null);
      }
      // 其他情况使用指定值
      createCanvas(resource[useKey.data], useKey, resource, config).then((canvas) => {
        resolve(canvas);
      })
      return;
    }
    // 当资源为数组时
    if (common.isArray(resource)) {
      common.promiseAll(resource.map(m => {
        return () => {
          return new Promise((resolve) => {
            createCanvas(m, useKey, m, config).then((canvas) => {
              resolve(canvas);
            })
          })
        }
      })).then((canvasList) => {
        resolve(common.flat(canvasList));
      })
    }
  })
}

// 將数据转为 html
const createHtml = (resource, useKey, initData) => {
  return new Promise((resolve) => {
    // 当资源为空时
    if (common.isEmpty(resource)) return resolve(null);
    // 当资源为对象时
    if (common.isJson(resource)) {
      if (common.isEmpty(resource[useKey.data])) {
        // 当资源为 html 时 sendLabel 打印时
        if (resource.sendLabel || !resource.printHtml) {
          prerenderHtml(resource, useKey, getPageSize(resource, useKey, false), 'svg').then((res) => {
            // 当 SVG 尺寸过大需要处理 SVG 尺寸， 否则会超出设置的尺寸
            const barDome = res.nodes.querySelector('.barcode-content');
            if (barDome) {
              const dWidth = barDome.offsetWidth;
              const svg = barDome.querySelector('svg');
              const rect = barDome.querySelector('svg > rect');
              const svgRect = barDome.querySelectorAll('svg g rect');
              const svgg = barDome.querySelector('svg > g');
              if (svg && rect && svgRect && svgg) {
                const svgInfo = {
                  width: Number(svg.getAttribute('width').split('px')[0]),
                  height: Number(svg.getAttribute('height').split('px')[0]),
                  rectHeight: Number(svgRect[0].getAttribute('height').split('px')[0]),
                  rectch: Number(rect.getAttribute('height').split('px')[0])
                }
                const ratio = svgInfo.width / dWidth;
                if (ratio > 1) {
                  // 设置 svg 容器宽高以及偏移量
                  svg.setAttribute('width', `${dWidth}px`);
                  rect.setAttribute('height', `${svgInfo.height * ratio}px`);
                  const rectScale = svgInfo.rectch / (svgInfo.height * ratio);
                  rect.setAttribute('y', -(1 - rectScale) / (2 * rectScale) * svgInfo.rectch);
                  const svgt = svgg.getAttribute('transform').split(',');
                  const svgtX = svgt[0].replace(/[^0-9]/g, '');
                  const svgtY = svgt[1].replace(/[^0-9]/g, '');
                  // 设置条码偏移量
                  svgg.setAttribute('transform', `translate(${svgtX}, ${-((((1 - (1 / ratio)) / (2 * (1 / ratio))) * svgInfo.rectHeight) - Number(svgtY || 0))})`);
                  // 设置条码中每一项的高
                  svgRect.forEach(rec => {
                    rec.setAttribute('height', `${svgInfo.rectHeight * ratio}px`);
                  })
                }
              }
            }
            const scale = 2;
            const transVal = ((1 - 1 / scale) / (2 * (1 / scale))) * 100;
            if (common.isEmpty(res.nodes)) {
              return resolve({
                pagePxSze: { width: res.width, height: res.height },
                scale: scale,
                previewHtml: '',
                printHtml: `<div style="height: ${res.height}px;font-size: 0;overflow: hidden;">
                <div
                  style="display:inline-block;margin:0;padding:0;transform:scale(${1 / scale}) translate(-${transVal}%, -${transVal}%);overflow: hidden;"
                ></div>
              </div>
              <div style="page-break-before: always;"></div>`
              })
            }
            resolve({
              pagePxSze: { width: res.width, height: res.height },
              scale: scale,
              previewHtml: res.nodes.innerHTML,
              printHtml: `<div style="height: ${res.height}px;font-size: 0;overflow: hidden;">
                <div
                  style="display:inline-block;margin:0;padding:0;transform:scale(${1 / scale}) translate(-${transVal}%, -${transVal}%);overflow: hidden;"
                >${res.nodes.innerHTML}</div>
              </div>
              <div style="page-break-before: always;"></div>`
            });
            setTimeout(() => {
              res.nodes.remove();
            }, 100)
          });
          return;
        }
        return resolve(null);
      }
      // 其他情况使用指定值
      createHtml(resource[useKey.data], useKey, resource).then((canvas) => {
        resolve(canvas);
      })
      return;
    }
    // 当资源为数组时
    if (common.isArray(resource)) {
      common.promiseAll(resource.map(m => {
        return () => {
          return new Promise((resolve) => {
            createHtml(m, useKey, m).then((canvas) => {
              resolve(canvas);
            })
          })
        }
      })).then((canvasList) => {
        resolve(common.flat(canvasList));
      })
    }
  })
}

// 返回标签 html
export const getPrintHtml = (data = [], {
  width = 70, // 单位 mm
  height = 20, // 单位 mm
  unit = 'mm',
  isFileSize = false,
  replaceKey = {},
  progress = (percent) => { }
} = {}) => {
  const useKey = {
    ...constant.defaultKey,
    ...replaceKey,
    pageWidth: width,
    pageHeight: height,
    unitVal: unit,
    fileSize: isFileSize
  };
  return new Promise((resolve) => {
    const resource = common.isArray(data) ? data : [data];
    common.promiseAll(resource.map((item) => {
      return () => {
        return createHtml(item, useKey, item)
      }
    }), {
      limit: 2,
      progress: (percent) => {
        progress(percent);
      }
    }).then(arr => {
      resolve({ success: true, data: common.flat(arr) });
    }).catch(() => {
      resolve({ success: false, data: [] });
    })
  })
}

// 将html以图片格式返回
export const getPrintImage = (data = [], {
  width = 70, // 单位 mm
  height = 20, // 单位 mm
  scale = 2, // 倍数
  unit = 'mm',
  isFileSize = false,
  replaceKey = {},
  progress = (percent) => { }
} = {}) => {
  const useKey = {
    ...constant.defaultKey,
    ...replaceKey,
    pageWidth: width,
    pageHeight: height,
    unitVal: unit,
    scale: scale,
    fileSize: isFileSize
  };
  return new Promise((resolve) => {
    const resource = common.isArray(data) ? data : [data];
    common.promiseAll(resource.map((item) => {
      return () => {
        return createCanvas(item, useKey, item, { scale: scale })
      }
    }), {
      limit: 2,
      progress: (percent) => {
        progress(percent);
      }
    }).then(arr => {
      resolve({ success: true, data: common.flat(arr) });
    }).catch((err) => {
      console.error(err);
      resolve({ success: false, data: [] });
    })
  })
}

// 多张图片合并成 PDF 文件
export const getImageMergePdf = (data = [], {
  unit = 'mm',
  page = 1,
  replaceKey = {},
  progress = (percent) => { }
} = {}, isPreview = false) => {
  const useKey = {
    file: 'file',
    pageSze: 'pageSze',
    ...constant.defaultKey,
    ...replaceKey
  };
  return new Promise((resolve) => {
    const resource = common.isArray(data) ? data : [data];
    let quantity = 1;
    let doc = null;
    let plan = 0;
    const total = resource.length;
    resource.forEach((pdfPag, pageIndex) => {
      quantity = (common.isNumber(pdfPag[useKey.page]) && pdfPag[useKey.page] > 0) ? pdfPag[useKey.page] : page;
      plan = ((pageIndex + 1) * 100) / total;
      for (let i = 0; i < quantity; i++) {
        progress(Number((plan * (((i + 1) * 100) / quantity)).toFixed(2)));
        if (!common.isEmpty(pdfPag)) {
          if (pageIndex === 0 && i === 0) {
            doc = new JsPdf(pdfPag[useKey.pageSze][0] > pdfPag[useKey.pageSze][1] ? 'landscape' : 'portrait', pdfPag[useKey.unit] || unit, pdfPag[useKey.pageSze]);
          } else {
            doc.addPage(pdfPag[useKey.pageSze], pdfPag[useKey.pageSze][0] > pdfPag[useKey.pageSze][1] ? 'landscape' : 'portrait');
          }
          doc.addImage(pdfPag[useKey.file], 'JPEG', 0, 0, pdfPag[useKey.pageSze][0], pdfPag[useKey.pageSze][1]);
        }
      }
    })
    progress(100);
    const pdfBolb = doc.output('blob');
    // 新窗口打开预览
    isPreview && common.previewFile(pdfBolb);
    resolve({ success: true, pdf: pdfBolb });
  })
}

// 生成 PDF, 返回 PDF 或打开浏览器新标签页面展示  isPreview 是否新标签页预览PDF
export const getPrintPdf = (data = [], {
  width = 70, // 单位 mm
  height = 20, // 单位 mm
  unit = 'mm',
  page = 1,
  isFileSize = false,
  replaceKey = {},
  progress = (percent) => { }
} = {}, isPreview = false) => {
  const useKey = {
    ...constant.defaultKey,
    ...replaceKey,
    pageWidth: width,
    pageHeight: height,
    unitVal: unit,
    pageVal: page,
    fileSize: isFileSize
  };
  return new Promise((resolve) => {
    const resource = common.isArray(data) ? data : [data];
    common.promiseAll(resource.map((item) => {
      return () => {
        return createCanvas(item, useKey, item)
      }
    }), {
      limit: 2,
      progress: (percent) => {
        progress(percent);
      }
    }).then(arr => {
      if (common.isEmpty(arr)) {
        return resolve({ success: true, pdf: null });
      }
      let doc = null;
      arr.forEach((item, index) => {
        const pagination = resource[index][useKey.page] || page;
        if (common.isArray(item)) {
          for (let i = 0; i < pagination; i++) {
            item.forEach((pdfPag, pageIndex) => {
              if (!common.isEmpty(pdfPag)) {
                if (index === 0 && pageIndex === 0 && i === 0) {
                  doc = new JsPdf(pdfPag.pageSze[0] > pdfPag.pageSze[1] ? 'landscape' : 'portrait', pdfPag[useKey.unit] || unit, pdfPag.pageSze);
                } else {
                  doc.addPage(pdfPag.pageSze, pdfPag.pageSze[0] > pdfPag.pageSze[1] ? 'landscape' : 'portrait');
                }
                doc.addImage(pdfPag.file, 'JPEG', 0, 0, pdfPag.pageSze[0], pdfPag.pageSze[1]);
              } else {
                if (index === 0 && pageIndex === 0 && i === 0) {
                  doc = new JsPdf('landscape', unit, [width, height]);
                } else {
                  doc.addPage([width, height]);
                }
              }
            })
          }
        } else if (!common.isEmpty(item)) {
          if (index === 0) {
            doc = new JsPdf(item.pageSze[0] > item.pageSze[1] ? 'landscape' : 'portrait', item[useKey.unit] || unit, item.pageSze);
          }
          for (let i = 0; i < pagination; i++) {
            (index > 0 || i > 0) && doc.addPage(item.pageSze, item.pageSze[0] > item.pageSze[1] ? 'landscape' : 'portrait');
            doc.addImage(item.file, 'JPEG', 0, 0, item.pageSze[0], item.pageSze[1]);
          }
        } else {
          if (index === 0) {
            doc = new JsPdf('landscape', unit, [width, height]);
          }
          for (let i = 0; i < pagination; i++) {
            (index > 0 || i > 0) && doc.addPage([width, height]);
          }
        }
      })
      const pdfBolb = doc.output('blob');
      // 新窗口打开预览
      isPreview && common.previewFile(pdfBolb);
      resolve({ success: true, pdf: pdfBolb });
    }).catch((err) => {
      console.error(err);
      resolve({ success: false, pdf: null });
    })
  })
}
