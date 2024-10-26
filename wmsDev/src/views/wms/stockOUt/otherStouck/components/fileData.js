// 出库单状态(0订单创建1部分分配2分配完成3部分发货4完全发货5出库完成6出库取消,7分配失败,8待发货,99作废)
export let outListStatusList = [
  {
    label: "订单创建",
    value: "0",
    sort: 0
  },
  {
    label: "部分分配",
    value: "1",
    sort: 1
  },
  {
    label: "分配完成",
    value: "2",
    sort: 2
  },
  {
    label: "生成拣货单",
    value: "9",
    sort: 3
  },
  {
    label: "部分拣货",
    value: "13",
    sort: 4
  },
  {
    label: "拣货",
    value: "10",
    sort: 5
  },
  {
    label: "装箱",
    value: "11",
    sort: 6
  },
  {
    label: "上传外箱标签",
    value: "12",
    sort: 7
  },
  {
    label: "待发货",
    value: "8",
    sort: 8
  },
  {
    label: "完全发货",
    value: "4",
    sort: 9
  },
  {
    label: "订单作废",
    value: "99",
    style: {
      color: "red"
    },
    sort: 10
  }
];

// 出库单类型
export let outListTypeList = [
  {
    label: "FBA出库",
    value: "O5",
    oname: "FBA"
  },
  {
    label: "WFS出库",
    value: "O6",
    oname: "WFS"
  },
  {
    label: "EF出库",
    value: "O7",
    oname: "EF"
  },
  {
    label: "谷仓出库",
    value: "O8",
    oname: "谷仓"
  },
  {
    label: "SHL出库",
    value: "O9",
    oname: "SHL",
  },
  {
    label: "万邑通出库",
    value: "O10",
    oname: "万邑通"
  },
  {
    label: "TEMU出库",
    value: "O11",
    oname: "TEMU"
  },
  {
    label: "FBK出库",
    value: "O13",
    oname: "FBK"
  },
  {
    label: "睿邑达出库",
    value: "O17",
    oname: "睿邑达"
  },
  {
    label: "FBP出库",
    value: "O18",
    oname: "FBP"
  },
  {
    label: "艾姆勒出库",
    value: "O19",
    oname: "艾姆勒"
  },
  // {
  //   label: "借样出库",
  //   value: "J1",
  //   oname: "借样",
  // },
  {
    label: "YMS出库",
    value: "O20",
    oname: "YMS",
  },
  {
    label: "FBP-URAL出库",
    value: "O21",
    oname: "FBP-URAL",
  },
];

// 出库单列表
export let columns = [
  {
    type: "selection",
    width: 60,
    align: "center",
    fixed: "left"
  },
  {
    title: "出库单编号",
    slot: "pickingNo",
    align: "center",
    minWidth: 120
  },
  {
    title: "出库单类型",
    width: 120,
    align: "center",
    slot: "pickingType"
  },
  {
    title: "出库单状态",
    width: 120,
    align: "center",
    slot: "pickingStatus"
  },
  {
    title: "运输方式",
    align: "center",
    width: 120,
    slot: "transportMethod"
  },
  {
    title: "总件数/总价值CNY",
    align: "center",
    width: 140,
    slot: "totalNumCny"
  },
  {
    title: "发货数量",
    align: "center",
    width: 120,
    key: "actualSkuNumber"
  },
  {
    title: "总运费",
    align: "center",
    width: 120,
    slot: "totalTransportExpense"
  },
  {
    title: "产品预估总重量(g)",
    align: "center",
    width: 140,
    key: "estimateTotalWeight"
  },
  {
    title: "创建人",
    align: "center",
    minWidth: 120,
    slot: "createdName"
  },
  {
    title: "创建时间",
    align: "center",
    width: 160,
    slot: "createdTime"
  },
  {
    title: "操作",
    align: "center",
    width: 160,
    fixed: "right",
    slot: "action"
  }
];

// 商品标签
export let commodityLabel = {
  O5: {
    label: "FBA出库",
    value: "O5",
    columns: [
      { label: "fnCode", key: "fnCode", barcode: true },
      { label: "平台SKU", key: "platSku" },
      { label: "库位", key: "warehouseLocationName" },
      { label: "标签名称", key: "labelName" },
      { label: "数量", key: "printNum", noprint: true }
    ], // 打印表头
    pintContent: [
      "fnCode",
      "platSku",
      "warehouseLocationName",
      "labelName"
    ], // 打印内容
    printParams: {
      width: 60,
      height: 30
    }, // 打印纸张大小
    positionKey: {
      // 打印标签位置
      fnCode: {
        position: 'absolute',
        left: "4px",
        top: "1px",
        width: "calc(100% - 8px)",
        height: "52px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "break-all",
        border: "1px solid #666",
        paddingTop: '2px',
        backgroundColor: '#fff',
        zIndex: 100,
      },
      platSku: {
        position: 'absolute',
        left: "4px",
        top: "53px",
        width: "calc(50% - 4px)",
        height: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "break-all",
        borderLeft: "1px solid #666",
        borderBottom: "1px solid #666",
        fontSize: "10px",
      },
      warehouseLocationName: {
        position: 'absolute',
        left: "50%",
        top: "53px",
        width: "calc(50% - 4px)",
        height: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "break-all",
        border: "1px solid #666",
        borderTop: "none",
        fontSize: "10px",
      },
      labelName: {
        position: 'absolute',
        left: "4px",
        top: "81px",
        width: "calc(100% - 8px)",
        height: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "break-all",
        border: "1px solid #666",
        borderTop: "none",
        lineHeight: "12px",
        fontSize: "10px",
      }
    },
    codeOption: {
      fnCode: {
        codeConfig: {
          height: 36,
          width: 1.1, // 条形码的线条宽度
        }, // 二维码配置
        svgConfig: {
          displayValue: true, // 显示下标文字信息
        },
        svgStyle: {
          fontSize: '5pt',
        }
      }
    }
  },
  O6: {
    label: "WFS出库",
    value: "O6",
    columns: [
      { label: "系统sku", key: "goodsSku" }, // 子sku：通途sku；
      { label: "标签名称", key: "labelName" }, // Wfs商品标签
      { label: "fnCode", key: "fnCode", barcode: true }, // UPC/EAN：WFS的UPC/EAN
      { label: "库位", key: "warehouseLocationName" }, // 库位：固定为Made in China
      { label: "数量", key: "printNum", noprint: true }
    ], // 打印表头
    pintContent: [
      "goodsSku",
      "labelName",
      "fnCode",
      "warehouseLocationName"
    ], // 打印内容
    printParams: {
      // 打印纸张大小
      width: 70,
      height: 40
    },
    positionKey: {
      goodsSku: {
        textAlign: "center",
        wordBreak: "break-all",
        fontSize: "12px",
        paddingTop: '5px',
        margin: "0 5px 5px 5px",
      },
      labelName: {
        textAlign: "center",
        wordBreak: "break-all",
        fontSize: "12px",
        margin: "5px",
      },
      fnCode: {
        height: "50px",
        wordBreak: "break-all",
        fontSize: "12px",
        margin: "5px",
      },
      warehouseLocationName: {
        textAlign: "center",
        wordBreak: "break-all",
        fontSize: "12px",
        margin: "5px",
      }
    },
    codeOption: {
      fnCode: {
        codeConfig: {
          height: 38,
          width: 1.4,
        },
        svgConfig: {
          displayValue: true, // 显示下标文字信息
        },
        svgStyle: {
          fontSize: '8pt', // svg字体大小
        }
      }
    }
  },
  O7: {
    label: "EF出库",
    value: "O7",
    columns: [
      { label: "系统sku", key: "goodsSku" }, // Seller skuid：通途sku；
      { label: "fnCode", key: "fnCode", barcode: true }, // OC SKUID：OC橙联sku；
      { label: "平台SKU", key: "platSku" }, // 条形码：“OC橙联sku”生成的条形码；
      { label: "库位", key: "warehouseLocationName" }, // OC SKUID：OC橙联sku；
      { label: "数量", key: "printNum", noprint: true }
    ], // 打印表头
    pintContent: ["goodsSku", "fnCode", "platSku", "warehouseLocationName"], // 打印内容
    printParams: {
      // 打印纸张大小
      width: 70,
      height: 30
    },
    positionKey: {
      // EF打印标签位置
      goodsSku: {
        textAlign: "center",
        wordBreak: "break-all",
        fontSize: '10px',
        paddingTop: '4px',
        margin: '0 4px 4px 4px',
      },
      fnCode: {
        height: "32px",
        wordBreak: "break-all",
        fontSize: '10px',
        margin: '4px',
      },
      platSku: {
        textAlign: "center",
        wordBreak: "break-all",
        fontSize: '10px',
        margin: '4px',
      },
      warehouseLocationName: {
        textAlign: "center",
        wordBreak: "break-all",
        fontSize: '10px',
        margin: '4px',
      }
    },
    codeOption: {
      fnCode: {
        codeConfig: {
          height: 32,
          width: 1.4,
        },
        svgConfig: {
          displayValue: false, // 显示下标文字信息
        },
      }
    }
  },
  O8: {
    label: '谷仓出库',
    value: 'O8',
    columns: [
      { label: "系统sku", key: 'goodsSku' }, // 商品编码
      { label: "平台sku", key: 'platSku' },
      { label: "库位", key: 'warehouseLocationName' }, // 库位：固定为Made in China
      { label: "数量", key: 'printNum', noprint: true }
    ], // 打印表头
    pintContent: ['goodsSku', 'platSku', 'warehouseLocationName'],
    printParams: {// 打印纸张大小
      width: 100,
      height: 30
    },
    positionKey: { // 打印标签位置(不能删，写好的文本标签，防止后面要前端生成)
      productNumber: {
        position: 'absolute',
        top: "0px",
        left: "4px",
        width: 'calc(100% - 8px)',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        wordBreak: 'break-all'
      },
      barnCode: {
        position: 'absolute',
        top: "20px",
        left: "4px",
        width: 'calc(100% - 8px)',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        wordBreak: 'break-all'
      },
      barnChainse: {
        position: 'absolute',
        top: "50px",
        left: "4px",
        width: 'calc(100% - 74px)',
        height: '20px',
        wordBreak: 'break-all',
        textAlign: 'left'
      },
      barnEnglise: {
        position: 'absolute',
        top: "70px",
        left: "4px",
        width: 'calc(100% - 74px)',
        height: '20px',
        wordBreak: 'break-all',
        textAlign: 'left'
      },
      warehouseLocationName: {
        position: 'absolute',
        top: "90px",
        left: "4px",
        width: 'calc(100% - 74px)',
        height: '20px',
        wordBreak: 'break-all',
        textAlign: 'left'
      },
      barnQrcode: {
        position: 'absolute',
        top: "50px",
        right: "4px",
        width: '60px',
        height: '60px'
      }
    },
    codeOption: {
      barnCode: {
        codeConfig: {// 二维码大小
          height: 34,
          width: 2,
        },
        svgConfig: {
          displayValue: false, // 显示下标文字信息
        },
      }
    }
  },
  O9: {
    label: "SHL出库",
    value: "O9",
    columns: [
      { label: "账号", key: "pickingAccount" },
      { label: "系统sku", key: "goodsSku" },
      { label: "fnCode", key: "fnCode", barcode: true },
      { label: "配货sku", key: "platSku" },
      { label: "库位", key: "warehouseLocationName" },
      { label: "数量", key: "printNum", noprint: true }
    ], // 打印表头
    pintContent: [
      "pickingAccount",
      "goodsSku",
      "fnCode",
      "platSku",
      "warehouseLocationName"
    ], // 打印内容
    printParams: {
      // 打印纸张大小
      width: 100,
      height: 60
    },
    positionKey: {
      // 打印标签位置
      pickingAccount: {
        position: 'absolute',
        left: "4px",
        top: "2px",
        width: "calc(50% - 4px)",
        height: "28px",
        textAlign: "left",
        wordBreak: "break-all"
      },
      goodsSku: {
        position: 'absolute',
        right: "4px",
        top: "2px",
        width: "calc(50% - 4px)",
        height: "28px",
        textAlign: "right",
        wordBreak: "break-all"
      },
      fnCode: {
        position: 'absolute',
        left: "4px",
        top: "30px",
        width: "calc(100% - 8px)",
        height: "64px"
      },
      platSku: {
        position: 'absolute',
        left: "4px",
        top: "94px",
        width: "calc(50% - 4px)",
        height: "28px",
        textAlign: "left",
        wordBreak: "break-all"
      },
      warehouseLocationName: {
        position: 'absolute',
        right: "4px",
        top: "94px",
        width: "calc(50% - 4px)",
        height: "28px",
        textAlign: "right",
        wordBreak: "break-all"
      }
    },
    codeOption: {
      fnCode: {
        codeConfig: {
          height: 60,
          width: 1.4,
        },
        svgConfig: {
          displayValue: false, // 显示下标文字信息
        },
      }
    }
  },
  O10: {
    label: '万邑通出库',
    value: 'O10',
    columns: [
      { label: "系统sku", key: 'goodsSku' }, // 商品编码
      { label: "平台sku", key: 'platSku' },
      { label: "库位", key: 'warehouseLocationName' }, // 库位：固定为Made in China
      { label: "数量", key: 'printNum', noprint: true }
    ], // 打印表头
    pintContent: ['goodsSku', 'platSku', 'warehouseLocationName'],
    printParams: {// 打印纸张大小
      width: 60,
      height: 40
    },
  },
  O13: {
    label: "FBK出库",
    value: "O13",
    columns: [
      { label: "fnCode", key: "fnCode", barcode: true },
      { label: "EAN", key: "platSku", noprint: true },
      { label: "数量", key: "printNum", noprint: true },
    ], // 打印表头
    pintContent: ["fnCode"], // 打印内容
    printParams: {
      width: 100,
      height: 60
    }, // 打印纸张大小
    positionKey: {
      // 打印标签位置
      fnCode: {
        position: 'absolute',
        left: "4px",
        top: "50px",
        width: "calc(100% - 8px)",
      },
    },
    codeOption: {
      fnCode: {
        codeConfig: {
          format: "ean13",
          displayValue: true, // 是否显示文字信息
          height: 80,
          width: 2.4, // 条形码的线条宽度
        }, // 二维码配置
        svgConfig: {
          displayValue: false, // 显示下标文字信息
        },
        svgStyle: {
          fontSize: '5pt',
        }
      }
    }
  },
  O17: {
    label: "睿邑达出库",
    value: "O17",
    columns: [
      { label: "fnCode", key: "fnCode", barcode: true },
      { label: "平台SKU", key: "platSku" },
      { label: "sku中文名称", key: "goodsCnDesc" },
      { label: "数量", key: "printNum", noprint: true }
    ], // 打印表头
    pintContent: [
      "fnCode",
      "goodsCnDesc",
    ], // 打印内容
    printParams: {
      width: 60,
      height: 40
    }, // 打印纸张大小
    positionKey: {
      // 打印标签位置
      fnCode: {
        height: "52px",
        padding: '8px 4px 0',
        display: 'flex',
        justifyContent: 'center',
        boxSizing: 'border-box',
      },
      platSku: {
        fontSize: '14px',
        padding: '8px 4px 0',
        wordBreak: 'break-all',
        fontWeight: 'bold',
        textAlign: 'center',
      },
      goodsCnDesc: {
        fontSize: '14px',
        padding: '8px 4px 0',
        wordBreak: 'break-all',
        fontWeight: 'bold',
        textAlign: 'center',
      }
    },
    codeOption: {
      fnCode: {
        codeConfig: {
          height: 42,
          width: 1.4,
        },
        svgConfig: {
          displayValue: false, // 显示下标文字信息
        },
      }
    }
  },
  O18: {
    label: "FBP出库",
    value: "O18",
    columns: [
      { label: "fnCode", key: "fnCode", barcode: true },
      { label: "平台SKU", key: "platSku" },
      { label: "标签名称", key: "labelName" },
      { label: "数量", key: "printNum", noprint: true }
    ], // 打印表头
    pintContent: [
      "fnCode",
      "platSku",
      "labelName",
    ], // 打印内容
    printParams: {
      width: 70,
      height: 40
    }, // 打印纸张大小
    positionKey: {
      // 打印标签位置
      fnCode: {
        height: "70px",
        padding: '4px 4px 0',
        display: 'flex',
        justifyContent: 'center',
        boxSizing: 'border-box',
      },
      platSku: {
        fontSize: '16px',
        lineHeight: '18px',
        padding: '4px',
        wordBreak: 'break-all',
        fontWeight: 'bold',
        textAlign: 'center',
      },
      labelName: {
        fontSize: '14px',
        lineHeight: '16px',
        padding: '0 4px',
        wordBreak: 'break-all',
        fontWeight: 'bold',
        textAlign: 'center',
      }
    },
    codeOption: {
      fnCode: {
        codeConfig: {
          height: 66,
          width: 1.4,
        },
        svgConfig: {
          displayValue: false, // 显示下标文字信息
        },
      }
    }
  },
  O19: {
    label: "艾姆勒出库",
    value: "O19",
    columns: [
      { label: "fnCode", key: "fnCode", barcode: true },
      { label: "艾姆勒sku", key: "platSku", noprint: true },
      { label: "商品编码", key: "productCode" },
      { label: "日期", key: "printDate" },
      { label: "数量", key: "printNum", noprint: true }
    ], // 打印表头
    pintContent: [
      "fnCode",
      "productCode",
      "printDate",
    ], // 打印内容
    printParams: {
      width: 70,
      height: 30
    }, // 打印纸张大小
    positionKey: {
      // 打印标签位置
      fnCode: {
        height: "58px",
        padding: '8px 4px 0',
        display: 'flex',
        justifyContent: 'center',
        boxSizing: 'border-box',
      },
      productCode: {
        fontSize: '16px',
        lineHeight: '18px',
        padding: '4px',
        wordBreak: 'break-all',
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: '0.05em'
      },
      printDate: {
        fontSize: '16px',
        lineHeight: '18px',
        fontWeight: 'bold',
        textAlign: 'center',
        position: 'absolute',
        left: "4px",
        right: "4px",
        bottom: "4px",
      }
    },
    codeOption: {
      fnCode: {
        codeConfig: {
          height: 50,
          width: 1.3,
        },
        svgConfig: {
          displayValue: false, // 显示下标文字信息
        },
      }
    }
  },
  O20: {
    label: "FMS出库",
    value: "O20",
    columns: [
      { label: "fnCode", key: "fnCode", barcode: true },
      { label: "YMS SKU", key: "platSku" },
      { label: "YMS商户编号", key: "ymsMerchantId" },
      { label: "YMS供应商SKU", key: "ymsSupplierSku" },
      { label: "YMS商品规格", key: "ymsProductSpec" },
      { label: "数量", key: "printNum", noprint: true }
    ], // 打印表头
    pintContent: [
      "fnCode",
      "platSku",
      "ymsMerchantId",
      "ymsSupplierSku",
      "ymsProductSpec",
    ], // 打印内容
    printParams: {
      width: 70,
      height: 40,
    }, // 打印纸张大小
    positionKey: {
      // 打印标签位置
      fnCode: {
        position: 'absolute',
        left: "4px",
        top: "1px",
        width: "calc(100% - 8px)",
        height: "52px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "break-all",
        border: "1px solid #666",
        paddingTop: '2px',
        backgroundColor: '#fff',
        zIndex: 100,
      },
      platSku: {
        position: 'absolute',
        left: "4px",
        top: "53px",
        width: "calc(65% - 4px)",
        height: "31px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "break-all",
        borderLeft: "1px solid #666",
        borderBottom: "1px solid #666",
        fontSize: "12px",
      },
      ymsMerchantId: {
        position: 'absolute',
        left: "65%",
        top: "53px",
        width: "calc(35% - 4.5px)",
        height: "31px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "break-all",
        border: "1px solid #666",
        borderTop: "none",
        fontSize: "12px",
      },
      ymsSupplierSku: {
        position: 'absolute',
        left: "4px",
        top: "84px",
        width: "calc(100% - 8px)",
        height: "31px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "break-all",
        border: "1px solid #666",
        borderTop: "none",
        lineHeight: "12px",
        fontSize: "12px",
      },
      ymsProductSpec: {
        position: 'absolute',
        left: "4px",
        top: "115px",
        width: "calc(100% - 8px)",
        height: "31px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "break-all",
        border: "1px solid #666",
        borderTop: "none",
        lineHeight: "12px",
        fontSize: "12px",
      }
    },
    codeOption: {
      fnCode: {
        codeConfig: {
          height: 46,
          width: 1.1, // 条形码的线条宽度
        }, // 二维码配置
        svgConfig: {
          displayValue: false, // 显示下标文字信息
        },
      }
    }
  },
  O21: {
    label: "FBP-URAL出库",
    value: "O21",
    columns: [
      { label: "fnCode", key: "fnCode", barcode: true },
      { label: "商户信息", key: "merchantInfo" },
      { label: "固定字段", key: 'ural', isImage: true },
      { label: "数量", key: "printNum", noprint: true }
    ], // 打印表头
    pintContent: [
      "fnCode",
      "merchantInfo",
      "ural",
    ], // 打印内容
    printParams: {
      // 打印纸张大小 378px
      width: 100,
      height: 100
    },
    positionKey: {
      fnCode: {
        height: "100px",
        padding: "10px 8px 10px",
      },
      merchantInfo: {
        textAlign: "center",
        wordBreak: "break-all",
        fontSize: "20px",
        padding: "0px 8px 10px",
      },
      ural: {
        width: "70%",
        padding: "8px",
        margin: "0 auto",
      }
    },
    codeOption: {
      fnCode: {
        codeConfig: {
          height: 80,
          width: 1.3,
        },
        svgConfig: {
          displayValue: false, // 显示下标文字信息
        }
      }
    }
  },
};

// temu标签
export let temuLabel = {
  'label0': {
    label: 'TEMU寄样',
    value: 0,
    columns: [
      { label: "样品编号条码", key: "platSamplesNo", barcode: true },
      { label: "样品数量", key: "sampleNum" },
      { label: "收货地址", key: "consigneeAddress1" },
      { label: "收货人", key: "consigneeName1", okey: 'consigneeName' },
      { label: "寄件人", key: "sender1", okey: 'sender' },
      { label: "SKU", key: "goodsSku1", okey: 'goodsSku' },
      { label: "数量", key: "printNum", noprint: true },
    ], // 打印表头
    pintContent: [
      "consigneeAddress1",
      "consigneeName1",
      "sender1",
      "goodsSku1",
    ], // 打印内容
    printParams: {
      width: 100,
      height: 100,
    }, // 打印纸张大小
    positionKey: {// 打印标签位置
      platSamplesNo: {
        height: "82px",
        padding: '6px 6px 0 6px',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      sampleNum: {
        padding: '0px 6px 0 6px',
        position: 'relative',
        top: '-8px',
        textAlign: 'left',
        fontSize: '24px',
      },
      consigneeAddress1: {
        margin: '0 6px',
        wordBreak: "break-all",
        border: "1px solid #666",
        textAlign: "left",
        padding: "2px 6px",
        fontSize: '16px',
      },
      consigneeName1: {
        margin: '0 6px',
        wordBreak: "break-all",
        border: "1px solid #666",
        borderTop: "none",
        borderBottom: "none",
        textAlign: "left",
        padding: "2px 6px",
        fontSize: '16px',
      },
      sender1: {
        margin: '0 6px',
        wordBreak: "break-all",
        border: "1px solid #666",
        borderTop: "none",
        borderBottom: "none",
        textAlign: "left",
        padding: "2px 6px",
        fontSize: '16px',
      },
      goodsSku1: {
        margin: '0 6px',
        wordBreak: "break-all",
        border: "1px solid #666",
        textAlign: "left",
        padding: "2px 6px",
        fontSize: '16px',
      }
    },
    codeOption: {
      platSamplesNo: {
        codeConfig: {
          height: 60,
          width: 2,
          displayValue: true, // 显示文字信息
          textAlign: "right", // 设置文本的水平对齐方式
          fontSize: 16, // 设置文本的大小
        }, // 二维码配置
        svgConfig: {
          displayValue: false, // 不显示下标文字信息
        },
      }
    }
  },
  'label1': {
    label: 'TEMU备货',
    value: 1,
    columns: [
      { label: "产品sku", key: "goodsSku" },
      { label: "平台skc", key: "platSkc" },
      { label: "数量", key: 'printNum', noprint: true },
    ], // 打印表头
    pintContent: [
      "goodsSku",
      "platSkc",
      "printNum",
    ],
    printParams: {
      width: 70,
      height: 20,
    }, // 打印纸张大小
  },
  'box0': {
    label: "寄样打包标签",
    value: 0,
    columns: [
      { label: "barCode", key: "barCode", barcode: true },
      { label: "spu", key: "boxCode" },
      { label: "数量", key: "printNum", noprint: true }
    ], // 打印表头
    pintContent: ["barCode", "boxCode"], // 打印内容
    printParams: {
      width: 70,
      height: 20
    },
    positionKey: {
      barCode: {
        height: "42px",
        padding: "8px 4px 4px",
        boxSizing: "border-box",
      },
      boxCode: {
        textAlign: "center",
        wordBreak: "break-all",
        padding: "0 4px 4px",
        fontSize: '14px',
      }
    },
    codeOption: {
      barCode: {
        codeConfig: {
          height: 30,
          width: 1.1,
        }
      }
    }
  },
  'box1': {
    label: "备货货箱标签",
    value: "O11",
    columns: [
      { label: "barCode", key: "barCode", barcode: true },
      { label: "货箱编号", key: "boxCode" },
      { label: "数量", key: "printNum", noprint: true }
    ], // 打印表头
    pintContent: ["barCode", "boxCode"], // 打印内容
    printParams: {
      width: 70,
      height: 20
    },
    positionKey: {
      barCode: {
        height: "42px",
        padding: "8px 4px 4px",
        boxSizing: "border-box",
      },
      boxCode: {
        textAlign: "center",
        wordBreak: "break-all",
        padding: "0 4px 4px",
        fontSize: '14px',
      }
    },
    codeOption: {
      barCode: {
        codeConfig: {
          height: 30,
          width: 1.1,
        }
      }
    }
  },
  'address': {
    label: '地址标签',
    value: 'address',
    columns: [
      { label: "收货人名称", key: "consigneeName1", okey: 'consigneeName' },
      { label: "联系电话", key: "consigneeLinkTel1", okey: 'consigneeLinkTel' },
      { label: "详细地址", key: "consigneeAddress1", okey: 'consigneeAddress2' },
      { label: "数量", key: "printNum", noprint: true }
    ], // 打印表头
    pintContent: [
      "consigneeName1",
      "consigneeLinkTel1",
      "consigneeAddress1",
    ], // 打印内容
    printParams: {
      width: 100,
      height: 100,
    }, // 打印纸张大小
    positionKey: {// 打印标签位置
      consigneeName1: {
        padding: '20px 10px 20px 10px',
        textAlign: "left",
        wordBreak: "break-all",
        fontSize: '16px',
      },
      consigneeLinkTel1: {
        margin: '0px 10px 20px 10px',
        textAlign: "left",
        wordBreak: "break-all",
        fontSize: '16px',
      },
      consigneeAddress1: {
        margin: '0 10px',
        textAlign: "left",
        wordBreak: "break-all",
        fontSize: '16px',
      },
    },
  },
  'sendLabel': {
    label: 'TEMU发货标签',
    value: 0,
    columns: [
      { label: "time1", key: "time1" },
      { label: "packageSn", key: "packageSn", barcode: true },
      { label: "总包数", key: "packageText" },
      { label: "vim", key: "vim" },
      { label: "仓库名称", key: "subWarehouseName" },
      { label: "供应商", key: "supplierName" },
      { label: "商品名称", key: "productName" },
      { label: "productSkcIdText", key: "productSkcIdText" },
      { label: "skcExtCodeText", key: "skcExtCodeText" },
      { label: "packageSkcNumText", key: "packageSkcNumText" },
      { label: "expressCompany", key: "expressCompany" },
      { label: "packageSn1", key: "packageSn1", barcode: true },
      { label: "expressDeliverySn", key: "expressDeliverySn" },
      { label: "数量", key: "printNum", noprint: true },
    ], // 打印表头
    pintContent: [], // 拖拽的内容
    printParams: {
      width: 100,
      height: 100,
    }, // 打印纸张大小
    positionKey: {// 打印标签位置
      time1: {
        wordBreak: "break-all",
        textAlign: "left",
        padding: "6px",
        fontSize: '14px',
      },
      packageSn: {
        height: "58px",
        padding: '0px 6px',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      packageText: {
        padding: '0px 6px 0 6px',
        position: 'relative',
        top: '-14px',
        textAlign: 'left',
        height: '16px',
        fontSize: '16px',
        fontWeight: 'bold',
      },
      vim: {
        border: "1px solid #666",
        width: '19%',
        marginLeft: '3.78px',
        height: '40px',
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: '2px',
        boxSizing: 'border-box',
        fontSize: '16px',
        fontWeight: 'bold',
        overflow: 'hidden',
        float: 'left',
      },
      subWarehouseName: {
        border: "1px solid #666",
        borderLeft: 'none',
        width: '79%',
        marginRight: '3.78px',
        height: '40px',
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: '2px',
        boxSizing: 'border-box',
        fontSize: '16px',
        fontWeight: 'bold',
        lineHeight: '18px',
        overflow: 'hidden',
        float: 'right',
      },
      supplierName: {
        border: "1px solid #666",
        borderTop: 'none',
        margin: '0 3.78px',
        textAlign: "left",
        fontSize: '14px',
        clear: 'both',
        padding: '6px',
        boxSizing: 'border-box',
        lineHeight: '16px',
      },
      productName: {
        borderLeft: "1px solid #666",
        borderRight: "1px solid #666",
        margin: '0 3.78px',
        textAlign: "left",
        fontSize: '16px',
        fontWeight: 'bold',
        minHeight: '60px',
        padding: '6px',
        boxSizing: 'border-box',
        lineHeight: '18px',
      },
      productSkcIdText: {
        borderLeft: "1px solid #666",
        borderRight: "1px solid #666",
        margin: '0 3.78px',
        textAlign: "left",
        fontSize: '14px',
        fontWeight: 'bold',
        padding: '0 35% 0 6px',
        boxSizing: 'border-box',
        lineHeight: '14px',
        wordBreak: 'break-all',
      },
      skcExtCodeText: {
        border: "1px solid #666",
        borderTop: 'none',
        margin: '0 3.78px',
        textAlign: "left",
        fontSize: '14px',
        fontWeight: 'bold',
        padding: '0 35% 6px 6px',
        boxSizing: 'border-box',
        lineHeight: '14px',
        wordBreak: 'break-all',
      },
      packageSkcNumText: {
        position: 'relative',
        fontSize: '20px',
        fontWeight: 'bold',
        right: '16px',
        top: '-36px',
        textAlign: 'right',
        height: '6px',
      },
      expressCompany: {
        marginLeft: '3.78px',
        textAlign: "left",
        fontSize: '14px',
        lineHeight: '14px',
        float: 'left',
        width: '49%',
        paddingBottom: '8px',
        wordBreak: 'break-all',
      },
      packageSn1: {
        marginRight: '3.78px',
        height: "52px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        float: 'right',
        width: '49%',
      },
      expressDeliverySn: {
        margin: '0 3.78px',
        textAlign: "left",
        fontSize: '14px',
        lineHeight: '14px',
        paddingRight: '50%',
        boxSizing: 'border-box',
        wordBreak: 'break-all',
      },
    },
    codeOption: {
      packageSn: {
        codeConfig: {
          height: 40,
          width: 2,
          displayValue: true, // 显示文字信息
          textAlign: "right", // 设置文本的水平对齐方式
          fontSize: 16, // 设置文本的大小
        },
        // 二维码配置
        svgConfig: {
          displayValue: false, // 不显示下标文字信息
        },
      },
      packageSn1: {
        codeConfig: {
          height: 40,
          width: 1,
          displayValue: true, // 显示文字信息
          textAlign: "center", // 设置文本的水平对齐方式
          fontSize: 12, // 设置文本的大小
        },
        // 二维码配置
        svgConfig: {
          displayValue: false, // 不显示下标文字信息
        },
      }
    }
  },
}

// 货箱标签大同小异，根据标签大小条码高度文字大小不一样
function boxLabelCommon(option) {
  let barCodeStyle = option.positionKey.barCode;
  let boxCodeStyle = option.positionKey.boxCode;
  return {
    label: option.label,
    value: option.value,
    columns: [
      { label: "barCode", key: "barCode", barcode: true },
      { label: "货箱编号", key: "boxCode" },
      { label: "数量", key: "printNum", noprint: true }
    ], // 打印表头
    pintContent: ["barCode", "boxCode"],
    printParams: option.printParams, // 打印纸张大小
    positionKey: {
      barCode: {
        padding: "16px 6px 6px",
        boxSizing: "border-box",
        ...barCodeStyle,
      },
      boxCode: {
        textAlign: "center",
        wordBreak: "break-all",
        padding: "0 6px 6px",
        fontSize: "16px",
        ...boxCodeStyle,
      }
    }, // 打印标签位置
    codeOption: option.codeOption,
  }
}
// 货箱标签
export let boxLabel = {
  O5: boxLabelCommon({
    label: "FBA出库",
    value: "O5",
    printParams: {
      width: 60,
      height: 30
    },
    positionKey: {
      barCode: {
        height: "64px",
      },
      boxCode: {
        fontSize: '14px',
      }
    },
    codeOption: {
      barCode: {
        codeConfig: {
          height: 42,
          width: 1,
        },
      }
    }
  }),
  O6: boxLabelCommon({
    label: "WFS出库",
    value: "O6",
    printParams: {
      width: 70,
      height: 40
    },
    positionKey: {
      barCode: {
        height: "72px",
      },
    },
    codeOption: {
      barCode: {
        codeConfig: {
          height: 50,
          width: 1.1,
        }
      }
    }
  }),
  O7: boxLabelCommon({
    label: "EF出库",
    value: "O7",
    printParams: {
      width: 70,
      height: 30
    },
    positionKey: {
      barCode: {
        height: "64px",
      },
    },
    codeOption: {
      barCode: {
        codeConfig: {
          height: 42,
          width: 1.1,
        }
      }
    }
  }),
  O8: boxLabelCommon({
    label: "谷仓出库",
    value: "O8",
    printParams: {
      width: 100,
      height: 30
    },
    positionKey: {
      barCode: {
        height: "64px",
      },
    },
    codeOption: {
      barCode: {
        codeConfig: {
          height: 42,
          width: 1.6,
        }
      }
    }
  }),
  O9: boxLabelCommon({
    label: "SHL出库",
    value: "O9",
    printParams: {
      width: 100,
      height: 60
    },
    positionKey: {
      barCode: {
        height: "64px",
      },
    },
    codeOption: {
      barCode: {
        codeConfig: {
          height: 42,
          width: 1.6,
        }
      }
    }
  }),
  O10: boxLabelCommon({
    label: "万邑通出库",
    value: "O10",
    printParams: {
      width: 70,
      height: 40
    },
    positionKey: {
      barCode: {
        height: "72px",
      },
    },
    codeOption: {
      barCode: {
        codeConfig: {
          height: 50,
          width: 1.1,
        }
      }
    }
  }),
  O13: boxLabelCommon({
    label: "FBK出库",
    value: "O13",
    printParams: {
      width: 100,
      height: 60
    },
    positionKey: {
      barCode: {
        height: "64px",
        padding: "20px 6px 6px",
      },
      boxCode: {
        padding: "6px",
        fontSize: "14px",
      }
    },
    codeOption: {
      barCode: {
        codeConfig: {
          height: 50,
          width: 1.6,
        },
      }
    }
  }),
  O17: boxLabelCommon({
    label: "睿邑达出库",
    value: "O17",
    printParams: {
      width: 60,
      height: 40
    },
    positionKey: {
      barCode: {
        height: "74px",
      },
      boxCode: {
        fontSize: "14px",
      }
    },
    codeOption: {
      barCode: {
        codeConfig: {
          height: 52,
          width: 1,
        },
      }
    }
  }),
  O18: boxLabelCommon({
    label: "FBP出库",
    value: "O18",
    printParams: {
      width: 70,
      height: 40
    },
    positionKey: {
      barCode: {
        height: "90px",
      },
    },
    codeOption: {
      barCode: {
        codeConfig: {
          height: 68,
          width: 1.1,
        },
      }
    }
  }),
  O19: boxLabelCommon({
    label: "艾姆勒出库",
    value: "O19",
    printParams: {
      width: 70,
      height: 30
    },
    positionKey: {
      barCode: {
        height: "64px",
      },
      boxCode: {
        fontSize: '14px',
      }
    },
    codeOption: {
      barCode: {
        codeConfig: {
          height: 42,
          width: 1.1,
        },
      }
    }
  }),
  O20: boxLabelCommon({
    label: "FMS出库",
    value: "O20",
    printParams: {
      width: 70,
      height: 40
    },
    positionKey: {
      barCode: {
        height: "74px",
      },
      boxCode: {
        fontSize: '16px',
      }
    },
    codeOption: {
      barCode: {
        codeConfig: {
          height: 52,
          width: 1.1,
        },
      }
    }
  }),
  O21: boxLabelCommon({
    label: "FBP-URAL出库",
    value: "O21",
    printParams: {
      width: 100,
      height: 100
    },
    positionKey: {
      barCode: {
        height: "106px",
        padding: "20px 6px 6px",
      },
      boxCode: {
        padding: "6px",
        fontSize: "18px",
      }
    },
    codeOption: {
      barCode: {
        codeConfig: {
          height: 80,
          width: 1.4,
        },
      }
    }
  }),
};

// 标签类型
export let labelTypeOption = {
  // 简易标签
  O51: {
    label: "FBA出库简易标签",
    value: "O51",
    columns: [
      { label: "平台SKU", key: "platSku" },
      { label: "库位", key: "warehouseLocationName" }, // 库位：固定为Made in China
      { label: "数量", key: "printNum", noprint: true }
    ], // 打印表头
    pintContent: [
      "platSku",
      "warehouseLocationName"
    ], // 打印内容
    printParams: {
      width: 60,
      height: 30
    }, // 打印纸张大小
    positionKey: {
      platSku: {
        position: 'absolute',
        left: "4px",
        right: "4px",
        top: "10px",
        textAlign: "center",
        wordBreak: "break-all",
        fontSize: "40px",
        lineHeight: "40px"
      },
      warehouseLocationName: {
        position: 'absolute',
        left: "4px",
        right: "4px",
        top: "70px",
        textAlign: "center",
        wordBreak: "break-all",
        fontSize: "16px",
      },
    },
  },
  // 印度标签
  O52: {
    label: "FBA出库印度标签",
    value: "O52",
    columns: [
      { label: "平台SKU标题", key: "platformSkuTitle", hide: true },
      { label: "平台SKU", key: "platformSku" },
      { label: "打标签时的年月标题", key: "timesTitle", hide: true },
      { label: "打标签时的年月", key: "times" },
      { label: "INR后的数值取MRP标题", key: "mrpTitle", hide: true },
      { label: "INR后的数值取MRP", key: "mrp" },
      { label: "发源地标题", key: "originTitle", hide: true },
      { label: "发源地", key: "origin", hide: true },
      { label: "出口商信息标题", key: "importerInfoTitle", hide: true },
      { label: "出口商信息", key: "importerInfo" },
      { label: "FNSKU", key: "fnCode", barcode: true },
      { label: "标签名称", key: "labelName" },
      { label: "数量", key: "printNum", noprint: true }
    ], // 打印表头
    pintContent: [],
    printParams: {
      width: 100,
      height: 60
    }, // 打印纸张大小
    positionKey: {
      platformSkuTitle: {
        position: 'absolute',
        left: "2px",
        top: "2px",
        width: "calc(40% - 2px)",
        fontSize: "12px",
        lineHeight: '12px',
        height: "26px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "break-all",
        border: "1px solid #666",
        overflow: 'hidden',
      },
      platformSku: {
        position: 'absolute',
        left: "40%",
        top: "2px",
        width: "calc(60% - 2px)",
        fontSize: "12px",
        lineHeight: '12px',
        height: "26px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "break-all",
        border: "1px solid #666",
        borderLeft: "none",
        overflow: 'hidden',
      },
      timesTitle: {
        position: 'absolute',
        left: "2px",
        top: "28px",
        width: "calc(40% - 2px)",
        fontSize: "12px",
        lineHeight: '12px',
        height: "26px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "break-all",
        border: "1px solid #666",
        borderTop: "none",
        overflow: 'hidden',
      },
      times: {
        position: 'absolute',
        left: "40%",
        top: "28px",
        width: "calc(60% - 2px)",
        fontSize: "12px",
        lineHeight: '12px',
        height: "26px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "break-all",
        border: "1px solid #666",
        borderLeft: "none",
        borderTop: "none",
        overflow: 'hidden',
      },
      mrpTitle: {
        position: 'absolute',
        left: "2px",
        top: "56px",
        width: "calc(40% - 2px)",
        fontSize: "12px",
        lineHeight: '12px',
        height: "26px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "break-all",
        border: "1px solid #666",
        borderTop: "none",
        overflow: 'hidden',
      },
      mrp: {
        position: 'absolute',
        left: "40%",
        top: "56px",
        width: "calc(60% - 2px)",
        fontSize: "12px",
        lineHeight: '12px',
        height: "26px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "break-all",
        border: "1px solid #666",
        borderLeft: "none",
        borderTop: "none",
        overflow: 'hidden',
      },
      originTitle: {
        position: 'absolute',
        left: "2px",
        top: "82px",
        width: "calc(40% - 2px)",
        fontSize: "12px",
        lineHeight: '12px',
        height: "26px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "break-all",
        border: "1px solid #666",
        borderTop: "none",
        overflow: 'hidden',
      },
      origin: {
        position: 'absolute',
        left: "40%",
        top: "82px",
        width: "calc(60% - 2px)",
        fontSize: "12px",
        lineHeight: '12px',
        height: "26px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "break-all",
        border: "1px solid #666",
        borderLeft: "none",
        borderTop: "none",
        overflow: 'hidden',
      },
      importerInfoTitle: {
        position: 'absolute',
        left: "2px",
        top: "110px",
        width: "calc(40% - 2px)",
        fontSize: "12px",
        lineHeight: '12px',
        height: "50px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "break-all",
        border: "1px solid #666",
        borderTop: "none",
        overflow: 'hidden',
      },
      importerInfo: {
        position: 'absolute',
        left: "40%",
        top: "110px",
        width: "calc(60% - 2px)",
        fontSize: "12px",
        lineHeight: '12px',
        height: "50px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "break-all",
        border: "1px solid #666",
        borderLeft: "none",
        borderTop: "none",
        overflow: 'hidden',
      },
      fnCode: {
        position: 'absolute',
        left: "2px",
        top: "162px",
        width: "calc(60% - 2px)",
        fontSize: "16px",
        lineHeight: '18px',
        height: "62px",
        display: "flex",
        alignItems: "center",
        wordBreak: "break-all",
        padding: '4px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      },
      labelName: {
        position: 'absolute',
        left: "60%",
        top: "162px",
        width: "calc(40% - 2px)",
        fontSize: "16px",
        lineHeight: '18px',
        height: "62px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        wordBreak: "break-all",
        overflow: 'hidden',
      },
    },
    codeOption: {
      fnCode: {
        codeConfig: {
          displayValue: true, // 是否显示文字信息
          height: 40,
          width: 1.2, // 条形码的线条宽度
          fontSize: '14',
        }, // 二维码配置
      }
    }
  },
}

// 装箱状态
export let boxStatusList = {
  0: { label: "未装箱", value: 0 },
  1: { label: "正在装箱", value: 1 },
  2: { label: "已装箱", value: 2 },
  3: { label: "装箱异常", value: 3 }
};

// sku扫描展示信息
export let skuForm = {
  single: {
    1: [
      {
        label: "SKU:",
        labelWidth: 70,
        feild: "goodSku",
        color: "#3CB034"
      }
    ],
    2: [
      {
        label: "平台SKU:",
        labelWidth: 70,
        feild: "platSku",
        color: "#3CB034"
      }
    ]
  },
  combination: {
    1: [
      {
        label: "组合产品:",
        labelWidth: 70,
        feild: "zhsku",
        color: "#3CB034"
      },
      {
        label: "组合SKU产品数量:",
        labelWidth: 120,
        feild: "allSkuCount",
        color: "#3CB034"
      }
    ],
    2: [
      {
        label: "货箱编号:",
        labelWidth: 70,
        feild: "boxNum"
      },
      {
        label: "已装箱SKU数量:",
        labelWidth: 120,
        feild: "inBoxNum",
        color: "#3CB034"
      }
    ]
  }
};

// 运输方式
export let shippingList = {
  0: { label: "陆运", value: "0" },
  1: { label: "海运", value: "1" },
  2: { label: "空运", value: "2" },
  3: { label: "铁运", value: "3" }
};

// 商品类型
export let acceptableTypeList = {
  "01": { label: "普货", value: "01" },
  "02": { label: "纯电池", value: "02" },
  "03": { label: "配套电", value: "03" },
  "04": { label: "液体", value: "04" },
  "05": { label: "药品", value: "05" },
  "06": { label: "粉末", value: "06" },
  "07": { label: "危险品", value: "07" },
  "08": { label: "内置电池", value: "08" },
  "09": { label: "纽扣电池", value: "09" },
  "10": { label: "带磁", value: "10" }
};

// 拣货方式
export let pickingGoodsList = {
  0: { label: "未拣货", value: "0" },
  1: { label: "已拣货", value: "1", style: "color: #2d8cf0" },
  2: { label: "部分拣货", value: "2" }
};

// 出库类型
export let issueTypeList = {
  0: { label: '寄样', value: 0 },
  1: { label: '备货', value: 1 },
};

// 标签类型
export let labelTypeList = {
  0: { label: '常规标签', value: 0 },
  1: { label: '简易标签', value: 1 },
  2: { label: '印度标签', value: 2 },
};