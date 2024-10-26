// | 注释 | 代码变量名 | 代码的值 |
// |---|---|---|
// | 导入类型 - 出库单 | EXCEL_TYPE_PICKING | "1" |
// | 导入类型 - 移动单 | EXCEL_TYPE_MOVE | "2" |
// | 导入类型 - 调整单 | EXCEL_TYPE_ADJUST | "3" |
// | 导入类型 - 库存冻结 | EXCEL_TYPE_FROZON | "4" |
// | 导入类型 - 库位 | EXCEL_TYPE_WAREHOUSE_LOCATION | "5" |
// | 导入类型 - 库区 | EXCEL_TYPE_WAREHOUSE_BLOCK | "6" |
// | 导入类型 - 加工单 | EXCEL_TYPE_WORKING | "7" |
// | 导入类型 - 调拨 | EXCEL_TYPE_ALLOT | "8" |
// | 导入类型 - 盘点 | EXCEL_TYPE_ALLWH | "9" |
// | 导入类型 - 装箱单 | EXCEL_TYPE_PICKING_BOX | "11" |
// | 导入类型 - 分区 | EXCEL_TYPE_WAREHOUSE_AREA | "12" |
// | 导入类型 - 分区详情 | EXCEL_TYPE_WAREHOUSE_AREA_DETAIL | "13" |
// | 导入类型 - 补录运单号 | EXCEL_TYPE_SUPPLEMENT_TRACKING_NUMBER | "14" |
// | 导入类型 - 库存 | EXCEL_TYPE_INVENTORY_LOG | "15" |
// | 导入类型-销售出库单 | EXCEL_TYPE_SALE_PACKAGE_IMPORT | "16" |
// | 导入类型 - 获取运单号补录运单号 | EXCEL_TYPE_GET_TRACKING_NUMBER_SUPPLEMENT_TRACKING_NUMBER | "18" |

// 第三方公共部分
const third = [
  { label: "入仓管理", value: "36" },
  { label: "入仓管理-入仓商品管理", value: "37" },
  { label: "入仓管理-入仓商品管理明细", value: "48" },
];

export const exportTypeData = {
  // CNE仓库
  cneExport: [
    { label: 'CNE商品', value: '77' },
    { label: 'CNE库存管理', value: '55' },
    { label: 'CNE出库单', value: '45' },
    ...third
  ],
  // 万邑通
  winitExport: [
    { label: '万邑通商品', value: '22' },
    { label: '万邑通库存管理', value: '21' },
    { label: '万邑通出库单', value: '92' },
    ...third
  ],
  // 谷仓
  gcExport: [
    { label: "谷仓商品管理", value: "25" },
    { label: "谷仓库存管理", value: "26" },
    { label: "谷仓海外入库下单", value: "49" },
    { label: "谷仓海外入库单管理", value: "88" },
    { label: "谷仓海外出库单管理", value: "92" },
    ...third
  ],
  // 睿邑达仓库
  rinidExport: [
    { label: '睿邑达商品', value: '77' },
    { label: '睿邑达库存管理', value: '55' },
    { label: '睿邑达出库单', value: '188' },
    ...third
  ],
  // SHL 仓库
  shlExport: [
    { label: "SHL商品", value: "43" },
    { label: "SHL库存管理", value: "44" },
    { label: 'SHL出库单', value: '1' },
    ...third
  ],
  // 新火
  nfExport: [
    { label: "新火商品", value: "45" },
    { label: "新火库存管理", value: "46" },
    { label: '新火出库单', value: '1' },
    ...third
  ],
  // 艾姆勒
  amlExport: [
    { label: "艾姆勒商品", value: "889" },
    { label: "艾姆勒库存管理", value: "890" },
    { label: '艾姆勒出库单', value: '1' },
    ...third
  ],
  // EF
  efExport: [
    { label: "EF商品", value: "23" },
    { label: "EF库存管理", value: "24" },
    { label: 'EF出库单', value: '1' },
    { label: 'EF仓库单检索', value: '40' },
    ...third
  ],
  // 递四方
  fourPxExport: [
    { label: "递四方商品", value: "23" },
    { label: "递四方库存管理", value: "24" },
    { label: '递四方出库单', value: '1' },
    ...third
  ],
  inventoryExport: [
    { label: '全托管直发出库单导出', value: '161' },
    { label: '全托管直发出库单导出明细', value: '162' },
    { label: '供应商库存余量导出', value: '56' }
  ],
  cloudExport: [
    { label: "出库单", value: "10" },
    { label: "商品", value: "23" },
    { label: "库存管理", value: "24" },
    { label: "等待交运单", value: "27" },
    { label: "未获取运单号", value: "28" },
    { label: "未获取面单号", value: "29" },
    { label: "待申请导出", value: "34" },
    { label: "待申请云卖", value: "53" },
    { label: "已下发物流异常导出", value: "57" },
  ],
  // 默认第三方仓库
  defaultThird: [
    { label: "商品", value: "23" },
    { label: "库存管理", value: "24" },
    { label: '出库单', value: '1' },
    ...third
  ],
  // 默认仓库(自营仓库)
  default: [
    { label: "入库单", value: "0" },
    { label: "出库单", value: "1" },
    { label: "移动单", value: "2" },
    { label: "调整单", value: "3" },
    { label: "冻结单", value: "4" },
    { label: "加工单", value: "7" },
    { label: "调拨单", value: "8" },
    { label: "销售出库", value: "10" },
    { label: "补录运单号", value: "14" },
    { label: "库存余量日志", value: "15" },
    { label: "库存余量", value: "17" },
    { label: "excel对接导出", value: "19" },
    { label: "作废出库单", value: "20" },
    { label: "库位", value: "6", hidden: true },
    { label: "库区", value: "7", hidden: true },
    { label: "等待交运单", value: "27", hidden: true },
    { label: "未获取运单号", value: "28", hidden: true },
    { label: "未获取面单号", value: "29", hidden: true },
    { label: "销售出库单-等待分配", value: "30", hidden: true },
    { label: "出库单-货箱信息", value: "32", hidden: true },
    { label: "库存余量-库存余量导出", value: "33", hidden: true },
    { label: "仓库单检索", value: "40" },
    { label: "库存盘点", value: "41" },
    { label: "质检-质检单导出", value: "98" },
    { label: "质检-质检记录", value: "38" },
    { label: "入库管理-上架导出", value: "115" },
    // { label: '质检-处理单', value: '99' },
    { label: "物流追踪查询导出", value: "42" },
    { label: "产品到货异常处理", value: "113" },
    { label: "等待入库下单导出", value: "39" },
    { label: "入库下单导出", value: "49" },
    { label: "入库单管理导出", value: "90" },
    { label: "问题件处理-待处理", value: "101" },
    { label: "问题件处理-处理中", value: "99" },
    { label: "问题件处理-处理中-导出明细", value: "111" },
    { label: "问题件处理-处理完结", value: "100" },
    { label: "问题件处理-处理完结-导出明细", value: "112" },
    { label: "装箱/集包-导出明细", value: "47" },
    { label: "全托管退货管理-待退供处理单导出", value: "87" },
    { label: "全托管退货管理-退货单导出", value: "89" },
    { label: "直发出库单", value: "66" },
    { label: "全托管交货单", value: "68" },
    { label: "借样出库单", value: "51" },
    { label: "全托管出库单", value: "69" },
    { label: "全托管质检统计", value: "67" },
    { label: "入库出库申请导出", value: "151" },
    { label: "海外仓导出", value: "31" },
    { label: "寄出运费核对导出", value: "886" },
    { label: "已导入运费数据导出", value: "887" },
    { label: "替代SKU库存余量导出", value: "114" },
    { label: "待申请导出", value: "34" },
    { label: "已下发物流异常导出", value: "57" },
    { label: "出库增值服务", value: "71" },
  ]
};
