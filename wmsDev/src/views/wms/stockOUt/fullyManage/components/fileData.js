import common from "@/utils/common";
// 出库单类型
export const outListTypeList = [
  {
    label: "Temu",
    value: "0",
    platformId: "temu",
    excelFiles: "DirectTemplate",
  },
  {
    label: "Tiktok",
    value: "1",
    platformId: "tiktok888",
    excelFiles: "",
  },
  {
    label: "SHEIN",
    value: "2",
    platformId: "shein",
    excelFiles: "DirectTemplate",
  },
  // {
  //   label: "AliExpress",
  //   value: 3,
  //   platformId: "aliExpress",
  //   excelFiles: "DirectTemplate",
  // },
];

// 出库单状态
// 0订单创建 1部分分配 2分配完成（待文件上传） 16生成拣货单 13部分拣货 10拣货完成 14质检完成  8待发货 4完全发货 15问题件处理 99订单作废
export const outListStatusList = [
  {
    label: "订单创建",
    value: "0",
    operator: "分配库存",
    statusList: ["0", "1"],
    operatorPermiss: ["fullTrusteeshipPicking_distribution"],
    sort: 0,
    key: "createdTime",
    tabName: 'createdCount',
    total: 0,
  },
  {
    label: "待上传文件",
    value: "1",
    operator: "上传文件",
    detailOperator: "完成文件上传",
    statusList: ["2"],
    operatorPermiss: ["fullTrusteeshipPicking_uploadFile"],
    sort: 1,
    key: "uploadLabelFinishTime",
    obsoletepick: 'uploadSave',
    tabName: 'waitUploadFileCount',
    total: 0,
  },
  {
    label: "待拣货",
    value: "2",
    operator: "生成拣货单",
    statusList: ['9', '16'],
    operatorPermiss: ["fullTrusteeshipPicking_genPickingGoods"],
    sort: 2,
    key: "pickingGoodsFinishTime",
    tabName: 'waitPickingGoodsCount',
    total: 0,
  },
  {
    label: "待质检",
    value: "3",
    operator: "出库质检",
    statusList: ["10"],
    operatorPermiss: ["fullTrusteeshipPicking_qualityCheck"],
    sort: 3,
    key: "qualityFinishTime",
    tabName: 'waitQualityCount',
    total: 0,
  },
  {
    label: "待处理问题件",
    value: "4",
    operator: "问题件处理",
    statusList: ["15"],
    operatorPermiss: [
      "fullTrusteeshipPicking_finishHandlerQuestion",
      "fullTrusteeshipPicking_updateCheckQuestion",
    ],
    sort: 4,
    key: "questionHandFinishTime",
    tabName: 'waitHandProblemGoodsCount',
    total: 0,
  },
  {
    label: "待打包",
    value: "5",
    operator: "打包装箱",
    detailOperator: "完成打包",
    statusList: ["14"],
    operatorPermiss: ["fullTrusteeshipPicking_pickingBox"],
    sort: 5,
    key: "boxFinishTime",
    obsoletepick: 'boxSave',
    tabName: 'waitBoxingCount',
    total: 0,
  },
  {
    label: "待发货",
    value: "6",
    operator: "标记发货",
    detailOperator: "标记发货",
    statusList: ["8"],
    operatorPermiss: ["fullTrusteeshipPicking_markedDelivery"],
    sort: 6,
    key: "deliverFinishTime",
    obsoletepick: 'markShipment',
    tabName: 'waitDeliverCount',
    total: 0,
  },
  {
    label: "已发货",
    value: "7",
    statusList: ["4"],
    sort: 7,
    key: "deliverFinishTime",
    tabName: 'deliverFinish',
    total: 0,
  },
];

export const statusReturn = function (status) {
  let list = common.copy(arrayToObj(outListStatusList));
  list["99"] = { label: "订单作废", value: "99" };
  // 0订单创建 1部分分配 2分配完成 9生成拣货单 13部分拣货 10拣货完成 14质检完成 11装箱 8待发货 4完全发货 15问题件处理 99订单作废
  // 0订单创建 1部分分配 2分配完成（待文件上传） 9生成拣货单 16待生成拣货单 13部分拣货 10拣货完成 14质检完成 11装箱 8待发货 4完全发货 15问题件处理 99订单作废
  let statusParams = {};
  Object.keys(list).forEach((k) => {
    statusParams[k] = list[k].statusList || [];
  });
  let [value, item] = [null, {}];
  Object.keys(statusParams).forEach((k) => {
    statusParams[k].includes(status) && (value = k);
  });
  item = list[value] || {};
  if (["9"].includes(status)) {
    delete item.operator;
  }
  return item;
};

// 商品分配状态
export const assignStatus = [
  { label: "订单创建", value: "0" },
  { label: "部分分配", value: "1" },
  { label: "分配完成", value: "2" },
];

// 质检类型
export const checkTypeList = [
  { label: "免检", value: "0" },
  { label: "抽检", value: "1" },
  { label: "全检", value: "2" },
  { label: "最小数量", value: "3" },
];

// 处理意见
export const handleOpinions = [
  { label: "转合格出库", value: 0, tips: "问题件按合格品出库" },
  { label: "归库", value: 1, tips: "问题件生成归库单，按归库单归库" },
  { label: "销毁", value: 2, tips: "仓库自行销毁" },
  { label: "其它", value: 3, tips: "综合处理，具体处理详情请备注" },
];

// 拣货单状态
export const packageStatusList = [
  { label: "未生成", value: "0" },
  { label: "未拣货", value: "1" },
  { label: "已拣货", value: "2" },
];

export const packagePickStatus = [
  { label: "未拣货", value: "0" },
  { label: "已拣货", value: "1" },
  { label: "包裹从拣货单移出", value: "2" },
];

// 将数组转化为对象
export const arrayToObj = function (arr, key) {
  if (!Array.isArray(arr)) return arr;
  let [temp, objKey] = [{}, key || "value"];
  arr.forEach((item) => {
    temp[item[objKey]] = item;
  });
  return temp;
};

// 分配异常原因
export const failTypeList = [
  {
    value: 1,
    color: "#169BD5",
    label: "盘点",
  },
  {
    value: 2,
    color: "#FF33FF",
    label: "未上架",
  },
  {
    value: 4,
    color: "#FF9900",
    label: "缺货",
  },
  // {
  //   value: 8,
  //   color: "red",
  //   label: "未知异常",
  // },
];

// 问题件处理状态
export const problemStatusList = [
  { label: "待分配", value: 0 },
  { label: "待处理", value: 1 },
  { label: "已处理", value: 2 },
];

// 订单类型状态
export const orderTypeList = [
  { label: "备货", value: 0 },
  { label: "急采", value: 1 },
];

// 自动匹配库存状态
export const autoInventoryList = [
  { label: "人工匹配", value: 0 },
  { label: "自动匹配", value: 1 },
];

// 出库单类型
export const pickingTypeList = (function () {
  let arr = ['O12', 'O14', 'O15', 'O16'];
  let temp = {};
  arr.forEach(k => {
    temp[k] = { label: '全托管出库', value: k };
  })
  return temp;
}());
