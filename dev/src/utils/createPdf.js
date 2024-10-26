// 将 html 转为 图片，需要安装依赖：yarn add html2canvas
import html2Canvas from 'html2canvas';
// pdf 文件生成，需要安装依赖：yarn add jspdf
import JsPdf from 'jspdf';
// 用于读取 pdf 文件 需要安装依赖：yarn add vue-pdf
import pdf from 'vue-pdf';
// 条码生成，， 需要安装依赖：yarn add jsbarcode
import JsBarcode from 'jsbarcode';
import common from '@/utils/common';

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
    // 条码，Number、String
    barcode: 'skuNo',
    // 供应商编码, Number、String
    supplierNo: 'supplierNo',
    // 规格， Array
    specification: 'specificationList'
  },
  minWidth: 300, // 单位 px
  maxWidth: 2000 // 单位 px
}

const getPageSize = (data, useKey, isDispose = true) => {
  const unit = data.unit || useKey.unitVal;
  let width = data[useKey.width] || useKey.pageWidth;
  let height = data[useKey.height] || useKey.pageHeight;
  if (!isDispose) return { width: width, height: height };
  if (unit === 'mm') {
    width = common.mmToPx(width);
    height = common.mmToPx(height);
  }
  if (width < constant.minWidth) {
    height = (constant.minWidth / width) * height;
    width = constant.minWidth;
  } else if (width > constant.maxWidth) {
    height = (constant.maxWidth / width) * height;
    width = constant.maxWidth;
  }
  return { width: common.pxToMm(width), height: common.pxToMm(height) };
}

const getPdfPage = (pdfFile, pageNumber, useKey, initData) => {
  return new Promise((resolve) => {
    const scale = 10;
    pdfFile.getPage(pageNumber).then(page => {
      const viewport = page.getViewport({ scale: scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = common.isEmpty(viewport.width) ? common.mmToPx(useKey.pageWidth) : viewport.width;
      canvas.height = common.isEmpty(viewport.height) ? common.mmToPx(useKey.pageHeight) : viewport.height;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      page.render({ canvasContext: context, viewport: viewport }).promise.then((pdf) => {
        resolve({
          file: canvas.toDataURL('image/JPEG'),
          pageSze: [
            useKey.fileSize ? common.pxToMm(canvas.width) : initData[useKey.width] || common.pxToMm(canvas.width),
            useKey.fileSize ? common.pxToMm(canvas.height) : initData[useKey.height] || common.pxToMm(canvas.height)
          ]
        });
        setTimeout(() => {
          canvas.remove();
        }, 500)
      })
    })
  })
}

// 获取 PDF 文件数据
const getPdfRes = (pdfUrl, useKey, initData) => {
  return new Promise((resolve) => {
    pdf.createLoadingTask({
      url: pdfUrl,
      cMapUrl: '/sps-service/static/pdf/web/cmaps/',
      cMapPacked: true
    }).promise.then(pdfFile => {
      const numPages = pdfFile.numPages;
      const allPageList = Array.from({ length: numPages }, (v, k) => k);
      common.promiseAll(allPageList.map((index) => {
        return () => getPdfPage(pdfFile, index + 1, useKey, initData)
      })).then(pdfArr => {
        resolve(pdfArr);
      })
    }).catch((err) => {
      console.error(err);
      resolve(null);
    })
  })
}

// 获取图片数据
const getImageRes = (imageUrl, useKey, initData) => {
  return new Promise((resolve) => {
    fetch(imageUrl).then((res) => {
      return res.blob();
    }).then((imageRes) => {
      if (useKey.fileSize) {
        const img = new Image();
        img.src = window.URL.createObjectURL(imageRes);
        img.onload = () => {
          common.blobToBase64(imageRes).then(res => {
            const pageSize = getPageSize(initData, useKey, false);
            resolve({
              type: 'image',
              file: res,
              pageSze: [
                img.width ? common.pxToMm(img.width) : pageSize.width,
                img.height ? common.pxToMm(img.height) : pageSize.height
              ]
            });
            setTimeout(() => {
              window.URL.revokeObjectURL(img.src);
              img.remove();
            }, 200)
          })
        }
        return;
      }
      common.blobToBase64(imageRes).then(res => {
        const pageSize = getPageSize(initData, useKey, false);
        resolve({
          type: 'image',
          file: res,
          pageSze: [pageSize.width, pageSize.height]
        })
      })
    }).catch((err) => {
      console.error(err);
      resolve(null);
    })
  })
}

// 通过 UEL 获取数据
const getUrlCanvas = (url, useKey, initData) => {
  return new Promise((resolve) => {
    const fileSuffix = (url.substring(url.lastIndexOf('.') + 1, url.length)).toLocaleLowerCase();
    if (fileSuffix === 'pdf') {
      getPdfRes(url, useKey, initData).then(res => {
        resolve(res);
      })
    } else {
      getImageRes(url, useKey, initData).then((imageRes) => {
        resolve(imageRes);
      })
    }
  })
}

// print_html 格式, 打印整页，目前 erp 未看到，后面再完善
// 创建 html 页面
const createHtmlPage = (data, useKey, initData, pageSze) => {
  return new Promise((resolve) => {
    resolve();
  })
}
// 获取新页面中的html 内容, 并且转换为 canvas
const getHtmlContent = (data, useKey) => {
  const pageSze = getPageSize(data, useKey, false);
  return new Promise((resolve) => {
    createHtmlPage(data, useKey, pageSze).then(() => {
      resolve();
    })
  })
}

// 将 html 渲染到页面上 print_sendLabel 格式的条码
const prerenderHtml = (data, useKey, pageSze) => {
  return new Promise((resolve) => {
    const novId = `${new Date().getTime()}-${(Math.random() * Math.pow(10, 10)).toFixed(0)}`;
    let content = document.createElement('div');
    content.id = `content-${novId}`;
    content.style.position = 'absolute';
    content.style.top = '0';
    content.style.width = `${common.mmToPx(pageSze.width)}px`;
    content.style.height = `${common.mmToPx(pageSze.height)}px`;
    content.style.background = '#fff';
    content.style.zIndex = '-1';
    content.innerHTML = `<div style="display: inline-block; width: 100%; height: 100%;">
      <img  id="barcode-${novId}" style="width: 68%; height: 100%;" />
      <div style="position: absolute; top: 0; left: 68%; width: calc(100% - 68%); height: 100%; padding: 5px 8px 5px 0; line-height: 1.2em;">
        ${data[useKey.supplierNo] ? `
          <p style="font-size: 8pt;font-weight:bold;font-family:SimSun;word-break: break-all;">
            ${data[useKey.supplierNo]}
          </p>
        ` : ''}
        ${data[useKey.specification] && data[useKey.specification][0] ? `
          <p style="font-size: 8pt;font-weight:bold;font-family:SimSun;word-break: break-all;">
            ${data[useKey.specification][0]}
          </p>
        ` : ''}
        ${data[useKey.specification] && data[useKey.specification][1] ? `
          <p style="font-size: 8pt;font-weight:bold;font-family:SimSun;word-break: break-all;">
            ${data[useKey.specification][1]}
          </p>
        ` : ''}
      </div>
    </div>`;
    document.body.appendChild(content);
    JsBarcode(`#barcode-${novId}`, data[useKey.barcode], {
      // format: "CODE128", // 条形码的格式
      width: 2, // 线宽
      height: common.mmToPx(pageSze.height) / 2, // 条码高度
      // lineColor: "#000", // 线条颜色
      // displayValue: false, // 是否显示文字
      // margin: 2 // 设置条形码周围的空白区域
    });
    setTimeout(() => {
      resolve(document.querySelector(`#content-${novId}`));
    }, 500)
  })
}

// 将 html 转为 canvas
const getHtmlView = (data, useKey) => {
  const scale = 2;
  const pageSze = getPageSize(data, useKey, false);
  return new Promise((resolve) => {
    prerenderHtml(data, useKey, pageSze).then((dome) => {
      html2Canvas(dome, {
        useCORS: true, // 开启跨域配置
        scale: scale, // 倍数 window.devicePixelRatio
        allowTaint: true, // 允许跨域图片
        // width: `${pageSze.width}${data.unit || useKey.unitVal}`,
        // height: `${pageSze.height}${data.unit || useKey.unitVal}`
      }).then(canvas => {
        resolve({
          file: canvas.toDataURL('image/jpeg'),
          pageSze: [common.pxToMm(canvas.width / scale), common.pxToMm(canvas.height / scale)]
        });
        dome.remove();
      });
    }).catch((err) => {
      console.error(err)
    })
  })
}

// 将数据转为 canvas
const createCanvas = (resource, useKey, initData) => {
  return new Promise((resolve) => {
    // 当资源为空时
    if (common.isEmpty(resource)) return resolve(null);
    if (common.isString(resource)) {
      // 当资源为链接时
      if (common.isUrl(resource)) {
        getUrlCanvas(resource, useKey, initData).then(canvas => {
          if (common.isEmpty(canvas)) return resolve(null);
          if (common.isArray(canvas)) {
            resolve(canvas);
          } else if (canvas.type === 'image') {
            resolve([{
              file: canvas.file,
              pageSze: canvas.pageSze
            }])
          } else {
            resolve([{
              file: canvas.toDataURL('image/JPEG'),
              pageSze: [common.pxToMm(canvas.width), common.pxToMm(canvas.height)]
            }]);
          }
        })
        return;
      }
      return resolve(null);
    }
    // 当资源为对象时
    if (common.isJson(resource)) {
      if (common.isEmpty(resource[useKey.data])) {
        // 当资源为 html 时 sendLabel 打印时
        if (resource.sendLabel || !resource.printHtml) {
          getHtmlView(resource, useKey).then(canvas => {
            common.isArray(canvas) ? resolve(canvas) : resolve([canvas]);
          })
          return;
        }
        // 新页面打开的 html
        if (resource.printHtml) {
          getHtmlContent(resource, useKey).then(canvas => {
            common.isArray(canvas) ? resolve(canvas) : resolve([canvas]);
          })
          return;
        }
        return resolve(null);
      }
      // 其他情况使用指定值
      createCanvas(resource[useKey.data], useKey, resource).then((canvas) => {
        resolve(canvas);
      })
      return;
    }
    // 当资源为数组时
    if (common.isArray(resource)) {
      common.promiseAll(resource.map(m => {
        return () => {
          return new Promise((resolve) => {
            createCanvas(m, useKey, m).then((canvas) => {
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

export const createPdf = (data = [], {
  width = 70, // 单位 mm
  height = 20, // 单位 mm
  unit = 'mm',
  page = 1,
  isFileSize = false,
  replaceKey = {},
  progress = (percent) => {}
} = {}) => {
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
        return resolve({ success: true });
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
      // 新窗口打开预览
      common.previewFile(doc.output('blob'));
      resolve({ success: true });
    }).catch((err) => {
      console.error(err);
      resolve({ success: false });
    })
  })
}
