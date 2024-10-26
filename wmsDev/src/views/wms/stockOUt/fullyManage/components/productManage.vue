<template>
  <div class="productManagePage">
    <h3>商品列表</h3>
    <div class="operators">
      <div class="productOperator">
        <div>
          <template v-if="saveEdit && ['0', '1'].includes(data.pickingNewStatus)">
            <Button type="primary" icon="md-add" @click="showAddProductModal" class="mr10">添加货品</Button>
            <Button type="error" icon="md-trash" @click="deleteProductBtn" class="mr10">移除货品</Button>
          </template>
        </div>
        <div class="flexCenter">
          <div v-if="['0', '1'].includes(data.pickingNewStatus)">
            <Form :rules="qualityRule" :model="qualityConfig" inline ref="formQuality" class="fmb0" :show-message="false">
              <Form-item label="设置质检数量：" :label-width="100" prop="qualityCheckType">
                <dyt-select v-model="qualityConfig.qualityCheckType" @on-change="qualityCheckTypeChange"
                  style="width:150px;">
                  <Option v-for="(item, index) in checkTypeList" :value="item.value" :key="index + 'qualityCheckType'"
                    :label="item.label">
                  </Option>
                </dyt-select>
              </Form-item>
              <Form-item label="比例：" :label-width="60" prop="qualityCheckScale"
                v-if="['1'].includes(qualityConfig.qualityCheckType)">
                <Input v-model.trim.number="qualityConfig.qualityCheckScale" type="number" style="width:100px;">
                <span slot="suffix" style="line-height: 32px">%</span>
                </Input>
              </Form-item>
              <Form-item label="最小数量：" :label-width="80" prop="qualityCheckNum"
                v-if="['3'].includes(qualityConfig.qualityCheckType)">
                <Input v-model.trim.number="qualityConfig.qualityCheckNum" type="number" style="width:100px;" />
              </Form-item>
              <Form-item label="" :label-width="0" v-if="['1', '3'].includes(qualityConfig.qualityCheckType)">
                <Button type="primary" @click="qualitySet">设置</Button>
              </Form-item>
            </Form>
          </div>
          <template v-if="buttonEdit && ['0', '1'].includes(data.pickingNewStatus)">
            <Button type="primary" @click="assignInventory" class="ml10"
              :disabled="!getPermission('fullTrusteeshipPicking_distribution')">分配库存</Button>
            <Button type="primary" @click="FreezeAssignmentBtn" class="ml10" :disabled="!getPermission('fullTrusteeshipPicking_dJDistribution')
              ">冻结分配</Button>
          </template>
          <Button type="primary" @click="cancelAssign" class="ml10"
            :disabled="!getPermission('fullTrusteeshipPicking_unDistribution')" v-if="(editButton && ['16'].includes(data.pickingNewStatus)) ||
              (buttonEdit && ['1', '2'].includes(data.pickingNewStatus))
              ">取消分配</Button>
        </div>
      </div>
      <div class="productOperator" v-if="buttonEdit && ['14'].includes(data.pickingNewStatus)">
        <div class="flexCenter">
          <div class="flexCenter">
            <span style="width: 110px; overflow: hidden">商品条码：</span>
            <Input v-model.trim="scanInfo.form.scanText" placeholder="扫描商品SKU条码" @on-keyup.enter="scanSku" ref="scanInput"
              :disabled="scanLoading"></Input>
          </div>
          <RadioGroup v-model="scanInfo.form.type" vertical class="ml20">
            <Radio :label="1">逐件扫描</Radio>
            <Radio :label="2">批量扫描</Radio>
          </RadioGroup>
          <Checkbox v-model="scanInfo.form.checked" class="ml20">扫描后自动打印商品第三方标签</Checkbox>
          <Button type="primary" @click="joinBox" class="ml10" :disabled="!hasBoxList.length">装箱</Button>
        </div>
        <div>
          <Button @click="setBoxNum('min')">本次装箱数为0</Button>
          <Button @click="setBoxNum('max')" class="ml10">本次装箱数为最大值</Button>
          <Button type="primary" @click="printThirdLabel" class="ml10">批量打印第三方标签</Button>
        </div>
      </div>
    </div>

    <!--出库单表格-->
    <Table ref="selection" :columns="columns" highlight-row border :data="deliveryListData"
      @on-selection-change="sltTableItemFn" max-height="500" class="negativeDistance" :span-method="handleSpan"></Table>

    <!-- 库位选择 -->
    <Modal v-model="wareLocateSltInfo.showLocationModal" title="库位选择" :styles="{ top: '80px', width: '1100px' }">
      <wareLocateSlt @sendData="getData" :wareId="warehouseId" :sku="wareLocateSltInfo.goodsSku"
        :open="wareLocateSltInfo.showLocationModal" :productId="wareLocateSltInfo.productId"
        :pickingType="data.pickingType" :warehouseBlockGroupId="data.warehouseBlockGroupId"
        v-if="wareLocateSltInfo.showLocationModal">
      </wareLocateSlt>
    </Modal>

    <!-- 添加普通商品 -->
    <Modal v-model="addProduct.visible" title="添加产品" :styles="{ top: '80px', width: '1200px' }" :footer-hide="true">
      <addProduct from="inware" :disabledSlt="false" @addProductSuccess="addProductSuccess"
        @addProductCancel="addProductCancel" :wareId="warehouseId" :eliminateData="deliveryListData" :queryTagInfo="true"
        v-if="addProduct.visible" :multiple="false">
      </addProduct>
    </Modal>
    <!-- 添加全托管商品模态框 -->
    <fullManageProduct :modelVisible.sync="fullManageProductInfo.visible" :platformData="data"
      @fullProductData="fullProductData" :existGoodList="deliveryListData" />

    <!--冻结分配弹窗-->
    <freezeAssignmentModal ref="frozenModal" :frozenModalTalg="freezeInfo.frozenModalTalg" @updateData="updateData"
      :deliveryOrder="data.pickingNo" :frozenRequestApi="freezeInfo.frozenRequestApi"
      :otherSearch="{ warehouseBlockGroupId: data.warehouseBlockGroupId }" :mulSearchInput="true"></freezeAssignmentModal>
    <!-- 批量打印标签 -->
    <thirdLabels :dialogVisible.sync="thirdInfo.visible" :list="thirdInfo.detailData"
      @thirdLabelPrint="thirdLabelPrint" />
    <!-- 加入已装货箱 -->
    <joinBoxList :dialogVisible.sync="joinBoxInfo.visible" :detailData="data" :list="hasBoxList"
      @emitDetail="emitDetail" />
    <!-- 问题件 -->
    <qualityProblemProducts :modelVisible.sync="problemInfo.visible" :modalData="data" />
    <!-- 批量装箱提示 -->
    <packingRemind :modelVisible.sync="packingInfo.visible" :modalData="packingInfo.data" @mulScan="mulScan" />

    <Spin size="large" fix v-if="beingCreatePrint">
      处理打印数据中，数据量越多需要时间越久，请耐心等待...
    </Spin>
  </div>
</template>

<script>
import Big from "big.js";
import api from "@/api/api";
import wareLocateSlt from "@/views/wms/components/exWarehouse/wareLocateSlt";
import dropDown from "@/views/wms/components/common/dropDownOpt";
import { getWarehouseId } from "@/utils/getService";
import freezeAssignmentModal from "@/views/wms/components/exWarehouse/freezeAssignmentModal";
import addProduct from "@/views/wms/components/wms-inStock/newAddProduct";
import {
  failTypeList,
  assignStatus,
  outListTypeList,
  arrayToObj,
  checkTypeList,
} from "./fileData";
import tableImg_mixin from "@/components/mixin/tableImg_mixin";
import permission_mixin from "@/components/mixin/permission_mixin";
import thirdLabels from "./thirdLabels";
import joinBoxList from "./joinBoxList";
import printCommon from "@/utils/printCommon";
import { getPrintHtml } from "@/utils/printTagCommon";
import qualityProblemProducts from "./qualityProblemProducts";
import packingRemind from "./packingRemind";
import fullManageProduct from "./fullManageProduct";
export default {
  name: "productManage",
  mixins: [permission_mixin, tableImg_mixin],
  components: {
    wareLocateSlt,
    freezeAssignmentModal,
    addProduct,
    thirdLabels,
    joinBoxList,
    qualityProblemProducts,
    packingRemind,
    fullManageProduct,
  },
  data() {
    return {
      beingCreatePrint: false,
      cellClassNameTemp: {}, // cellClassName 表格每格
      sltTableItem: [], // 表格选择的数据
      // 库位
      wareLocateSltInfo: {
        showLocationModal: false,
        goodsSku: "",
        productId: "",
      },
      // 商品选择
      addProduct: {
        visible: false,
        replaceSkuIndex: null,
      },
      // 冻结分配
      freezeInfo: {
        frozenModalTalg: "details",
        frozenRequestApi: api.directOtherPickingDistributionFrozen,
      },
      shopList: [],
      scanInfo: {
        form: {
          scanText: "",
          type: 1,
          checked: true,
        },
      },
      thirdInfo: {
        visible: false,
        detailData: [],
      },
      joinBoxInfo: {
        visible: false,
        detailData: [],
      },
      deProductList: [],
      deliveryListData: [],
      platformList: arrayToObj(outListTypeList),
      labelNum: 0,
      columns: [],
      problemInfo: {
        visible: false,
      },
      packingInfo: {
        index: null,
        data: {},
        visible: false,
      },
      scanLoading: false,
      fullManageProductInfo: {
        visible: false,
      },
      qualityConfig: {
        qualityCheckType: null,
        qualityCheckScale: null,
        qualityCheckNum: 1,
      },
      qualityRule: {
        qualityCheckScale: [{ validator: this.validateRate, trigger: "blur" }],
        qualityCheckNum: [{ validator: this.validateNumber, trigger: "blur" }],
      },
      checkTypeList: checkTypeList,
    };
  },
  props: {
    data: {
      type: Object,
      default: () => {
        return {};
      },
    },
    isEdit: {
      type: String,
      default: "",
    },
  },
  watch: {
    data: {
      handler(nval, oval) {
        if (!nval.pickingId) return;
        this.handleProductList();
        this.platformChange();
        this.columns = this.getColumnsList();
        this.$nextTick(() => {
          this.cellClassNameFun();
          // 装箱状态下自动聚焦
          if (this.buttonEdit && ["14"].includes(this.data.pickingNewStatus)) {
            this.$refs["scanInput"] && this.$refs["scanInput"].focus();
          }
        });
      },
      deep: true,
    },
    isChange: {
      handler(val) {
        this.$emit("productChange", val);
      },
      deep: true,
    },
  },
  computed: {
    warehouseId() {
      return this.$store.state.warehouseId || getWarehouseId();
    },
    // 存在本次装箱数
    hasBoxList() {
      let list = this.deliveryListData.filter((k) => k.quantity > 0);
      return list;
    },
    isChange() {
      return !(
        JSON.stringify(this.deliveryListData) ===
        JSON.stringify(this.deProductList)
      );
    },
    // 按钮进来的
    buttonEdit() {
      return ["button"].includes(this.isEdit);
    },
    // 按钮且保存
    saveEdit() {
      return (
        this.buttonEdit && this.getPermission("fullTrusteeshipPicking_update")
      );
    },
    // 编辑进来的
    editButton() {
      return ["edit"].includes(this.isEdit);
    },
  },
  methods: {
    // 校验比例
    validateRate(rule, value, callback) {
      if (!/^([0-9]|[1-9][0-9]|100)$/.test(value)) {
        return callback(new Error("限0-100的整数"));
      }
      callback();
    },
    // 校验比例
    validateNumber(rule, value, callback) {
      if (!/^(0|[1-9][0-9]*)$/.test(value)) {
        return callback(new Error("限大于等于0的整数"));
      }
      callback();
    },
    qualityCheckTypeChange() {
      const qualityCheckScale = 60;
      let type = this.qualityConfig.qualityCheckType;
      if (type === '1') {
        this.qualityConfig.qualityCheckScale = qualityCheckScale;
      }
      this.deliveryListData.forEach(k => {
        if (type === '0') {
          k.qualityCheckNumber = 0;
        } else if (type === '1') {
          let num = Math.round(
            new Big(k.expectedNumber || 0).times(new Big(qualityCheckScale).div(100))
          );
          k.qualityCheckNumber = num;
        } else if (type === '2') {
          k.qualityCheckNumber = k.expectedNumber || 0;
        }
      })
    },
    qualitySet() {
      this.$refs['formQuality'].validate((valid) => {
        if (!valid) return;
        const qualityConfig = this.qualityConfig;
        let qualityCheckType = qualityConfig.qualityCheckType;
        let qualityCheckScale = qualityConfig.qualityCheckScale || 0;
        let qualityCheckNum = qualityConfig.qualityCheckNum || 0;
        this.deliveryListData.forEach(k => {
          let num = null;
          let expectedNumber = k.expectedNumber || 0;
          if (qualityCheckType === '1') {
            num = Math.round(
              new Big(expectedNumber).times(new Big(qualityCheckScale).div(100))
            );
          } else if (qualityCheckType === '3') {
            num = qualityCheckNum > expectedNumber ? expectedNumber : qualityCheckNum;
          }
          k.qualityCheckNumber = num;
        })
      })
    },
    getColumnsList() {
      const v = this;
      let { pickingNewStatus, pickingNo } = this.data;
      let temp = {
        platGoodStyleInfo: {
          title: "平台商品款式信息",
          key: "skcImageUrl",
          minWidth: 160,
          render: (h, params) => {
            return h('div', {
              class: 'flexCenter'
            }, [
              this.tableImg(h, params.row.skcImageUrl),
              h('div', {
                class: 'ml10'
              }, [
                h('div', '平台SKC：' + params.row.productSkcId),
                h('div', '名称：' + params.row.productName),
              ])
            ])
          },
        },
        platGoodInfo: {
          title: "平台商品信息",
          key: "platformSku",
          minWidth: 140,
          render: (h, params) => {
            return h('div', {}, [
              h('div', '平台SKU：' + params.row.platformSku),
              h('div', '条码编码：' + params.row.barCode),
              h('div', '属性集：' + params.row.attributes),
            ])
          },
        },
        lapaSku: {
          title: "LAPA SKU",
          key: "goodsSku",
          minWidth: 90,
          render: (h, params) => {
            let { pickingDetailStatus, goodsSku, productGoodsId } = params.row || {};
            const unAssing = this.buttonEdit && !["1", "2"].includes(pickingDetailStatus);
            return h('div', {
              class: unAssing ? 'linkText cursorClick' : '',
              on: {
                'click': () => {
                  if (!unAssing) return;
                  this.addProduct.replaceSkuIndex = params.index;
                  this.addProduct.visible = true; // 打开添加产品模态层
                }
              }
            }, (goodsSku && productGoodsId) ? goodsSku : '匹配商品')
          },
        },
        lapaProductInfo: {
          title: "LAPA 商品信息",
          key: "goodsUrl",
          minWidth: 190,
          render: (h, params) => {
            let { goodsSku, productGoodsId } = params.row || {};
            let goodsVolume = parseInt(params.row.goodsVolume || 0);
            return h('div', {
              class: 'flexCenter',
              style: {
                display: (goodsSku && productGoodsId) ? 'flex' : 'none'
              }
            }, [
              this.tableImg(h, params.row.goodsUrl),
              h('div', {
                class: 'ml10'
              }, [
                h('div', params.row.goodsCnDesc),
                h('div', {
                  class: 'flexCenter'
                }, [
                  h('div', {
                    style: {
                      color: '#19be6b',
                    },
                    class: params.row.goodsAttributes ? 'mr10' : ''
                  }, params.row.goodsAttributes),
                  h('div', '采购单价:' + params.row.productCost),
                ]),
                h('div', `重量：${params.row.goodsWeight || 0} 体积：${goodsVolume}`),
              ])
            ])
          },
        },
        selection: {
          type: "selection",
          key: "selection",
          width: 50,
          align: "center",
        },
        perRowStatus: {
          title: "行状态",
          align: "center",
          width: 80,
          key: "perRowStatus",
        },
        outOfStockStatus: {
          title: "分配异常原因",
          align: "center",
          width: 100,
          resizable: true,
          key: "outOfStockStatus",
          render(h, params) {
            if (params.row.outOfStockStatus) {
              let obj = failTypeList.filter((j) => {
                if (j.value === params.row.outOfStockStatus) {
                  return j;
                }
              })[0];
              return h(
                "Tag",
                {
                  props: {
                    color: obj.color,
                  },
                },
                obj.label
              );
            }
          },
        },
        orderNum: {
          title: "订单数量",
          align: "center",
          width: 100,
          key: "orderNum",
          render(h, { row, index }) {
            if (["0"].includes(row.pickingDetailStatus)) {
              return h('div', {
                attrs: {
                  class: 'hideStepStyles',
                },
              }, [
                h("InputNumber", {
                  props: {
                    size: "small",
                    placeholder: "",
                    min: 1,
                    value: row.expectedNumber,
                    disabled: !v.saveEdit,
                  },
                  style: {
                    width: "100%",
                    margin: "0 auto",
                  },
                  on: {
                    "on-change"(val) {
                      let num = val || 1;
                      v.$set(v.deliveryListData[index], "expectedNumber", num);
                    },
                    "on-blur"() {
                      if ((new Big(row.expectedNumber || 0).minus(row.qualityCheckNumber || 0) - 0) < 0) {
                        v.$set(v.deliveryListData[index], "qualityCheckNumber", row.expectedNumber);
                      }
                    },
                  },
                })
              ]);
            } else {
              return h("span", row.expectedNumber);
            }
          },
        },
        qualityNumber: {
          title: "质检数量",
          align: "center",
          width: 100,
          key: "qualityCheckNumber",
          render: (h, { row, index }) => {
            //   // 商品的质检数量=订单数量*质检比例，四舍五入
            //   const data = v.data;
            //   let result = Math.round(
            //     new Big(params.row.expectedNumber || 0).times(
            //       new Big(data.qualityCheckScale || 0)
            //     )
            //   );
            //   // 抽检的时候，小于1要取值1
            //   if ([1, "1"].includes(data.qualityCheckType) && result < 1) { result = 1; }
            //   return h("div", result);
            if (["0", "1"].includes(row.pickingDetailStatus)) {
              return h('div', {
                attrs: {
                  class: 'hideStepStyles',
                },
              },
                [h("InputNumber", {
                  props: {
                    size: "small",
                    min: 0,
                    max: row.expectedNumber || 0,
                    value: row.qualityCheckNumber,
                  },
                  style: {
                    width: '100%'
                  },
                  on: {
                    "on-change": (val) => {
                      v.$set(v.deliveryListData[index], "qualityCheckNumber", val);
                    },
                  },
                })])
            } else {
              return h("span", row.qualityCheckNumber);
            }
          },
        },
        doneAssignedNumber: {
          title: "已分配数量",
          align: "center",
          width: 86,
          key: "doneAssignedNumber",
        },
        notAssignedNumber: {
          title: "未分配数量",
          align: "center",
          width: 86,
          key: "notAssignedNumber",
        },
        warehouseLocationName: {
          title: "分配库位",
          width: 110,
          align: "center",
          key: "warehouseLocationName",
          render: (h, params) => {
            let warehouseLocationName = params.row.warehouseLocationName;
            return h("div", [
              h("Input", {
                props: {
                  size: "small",
                  placeholder: "",
                  value: warehouseLocationName,
                  disabled: !(
                    ["0", "1"].includes(
                      v.deliveryListData[params.index].pickingDetailStatus
                    ) && v.saveEdit
                  ),
                },
                style: {
                  marginRight: "5px",
                },
                on: {
                  "on-focus": () => {
                    v.clickIndex = params.index;
                    v.wareLocateSltInfo.goodsSku = params.row.goodsSku;
                    v.wareLocateSltInfo.productId = params.row.productGoodsId;
                    v.wareLocateSltInfo.showLocationModal = true;
                  },
                },
              }),
            ]);
          },
        },
        actualPickingNumber: {
          title: "已拣货数",
          align: "center",
          width: 80,
          key: "actualPickingNumber",
        },
        acceptanceNumber: {
          title: "已检合格数",
          align: "center",
          width: 90,
          key: "acceptanceNumber",
        },
        problemNumber: {
          title: "已检问题数",
          align: "center",
          width: 90,
          key: "problemNumber",
          render: (h, { row }) => {
            let permit = v.getPermission(
              "fullTrusteeshipPicking_updateCheckQuestion"
            );
            return h(
              "div",
              {
                attrs: {
                  class:
                    row.problemNumber > 0 && permit
                      ? "linkText cursorClick"
                      : "",
                },
                on: {
                  click() {
                    if (!(row.problemNumber > 0 && permit)) return;
                    v.processProblem(row);
                  },
                },
              },
              row.problemNumber || 0
            );
          },
        },
        waitQuantitySum: {
          title: "待装箱数",
          align: "center",
          width: 80,
          key: "waitQuantitySum",
        },
        quantitySum: {
          title: "已装箱数",
          align: "center",
          width: 80,
          key: "quantitySum",
        },
        quantity: {
          title: "本次装箱数",
          align: "center",
          key: "quantity",
          width: 100,
          render(h, { row, index }) {
            let Domclass = "quantity" + index;
            return h("Input", {
              props: {
                value: row.quantity,
                disabled: !v.buttonEdit,
              },
              attrs: {
                class: Domclass,
              },
              on: {
                "on-blur": (event) => {
                  let val = event.target.value;
                  // 不能超过未检数量
                  let flag = new Big(row.waitBoxNum).minus(val || 0) - 0;
                  let num = flag < 0 ? row.waitBoxNum : val;
                  v.$nextTick(() => {
                    v.$set(v.deliveryListData[index], "quantity", num);
                  });
                  let dom = document
                    .querySelector("." + Domclass)
                    .querySelector(".ivu-input");
                  dom.value = num;
                },
              },
            });
          },
        },
        notQuantitySum: {
          title: "未装箱数",
          align: "center",
          width: 70,
          key: "notQuantitySum",
        },
        doneDeliveredNumber: {
          title: "发货数",
          align: "center",
          width: 60,
          key: "doneDeliveredNumber",
        },
        // productCost: {
        //   title: "采购单价",
        //   align: "center",
        //   width: 70,
        //   key: "productCost",
        // },
        operator: {
          title: "操作",
          align: "center",
          key: "operator",
          width: 100,
          render: (h, params) => {
            let { pickingDetailStatus, goodsSku, productGoodsId } = params.row || {};
            return h(
              dropDown,
              {
                props: {
                  dropList: [
                    {
                      code: "分配库存",
                      value: "1",
                      flagCode: ["0", "1"],
                      status:
                        v.buttonEdit &&
                          v.getPermission("fullTrusteeshipPicking_distribution") && (goodsSku && productGoodsId)
                          ? pickingDetailStatus
                          : -1,
                    },
                    {
                      code: "取消分配",
                      value: "2",
                      flagCode: ["1", "2"],
                      status:
                        (v.buttonEdit ||
                          (v.editButton &&
                            ["2"].includes(pickingDetailStatus))) &&
                          v.getPermission("fullTrusteeshipPicking_unDistribution")
                          ? pickingDetailStatus
                          : -1,
                    },
                    {
                      code: "删除",
                      value: "3",
                      flagCode: ["0"],
                      status: v.buttonEdit ? pickingDetailStatus : -1,
                    },
                  ],
                  styleData: { width: "80px" },
                  txt: "操作",
                  type: "small",
                  listenNormal: false,
                },
                style: {
                  display: ["0", "1", "2"].includes(pickingDetailStatus)
                    ? "block"
                    : "none",
                },
                on: {
                  nameValBack: (val) => {
                    if (val === "3") { // 删除
                      v.deliveryListData.splice(params.index, 1);
                      v.handleRowsData([]);
                      return;
                    }
                    let fun = (data) => {
                      return {
                        doneAssignedNumber: data.doneAssignedNumber, // 已分配数量
                        expectedNumber: data.expectedNumber, // 预期出库数量
                        productGoodsId: data.productGoodsId, // 产品sku
                        receiptBatchNo: data.receiptBatchNo,
                        inventoryId: data.inventoryId, // 库存id
                        pickingDetailId: data.pickingDetailId, // 出库单货品详情id
                        pickingNo: pickingNo, // 出库单编号
                        warehouseId: v.warehouseId, // 仓库id
                        warehouseLocationId: data.warehouseLocationId, // 库位id
                        availableNumber: data.availableNumber,
                        goodsSku: data.goodsSku,
                      };
                    }
                    if (val === "1") {
                      // 分配库存
                      if (!params.row.warehouseLocationId) {
                        v.$Message.warning({
                          content: "库位为空或者输入的库位不存在，请选择库位",
                          duration: 3,
                        });
                        return;
                      }
                      v.saveDo().then(() => {
                        v.assignFn([fun(params.row)], params.index);
                      });
                      return;
                    }
                    if (val === "2") {
                      // 取消分配
                      v.cancelAssignFn([fun(params.row)], params.index);
                    }
                  },
                },
              },
              []
            );
          },
        },
      };
      let fun = (list) => {
        let columns = [];
        list.forEach((k) => {
          columns.push(temp[k]);
        });
        return columns;
      };
      let common = [
        "platGoodStyleInfo",
        "platGoodInfo",
        "lapaSku",
        "lapaProductInfo",
        "orderNum",
        "qualityNumber",
        "doneAssignedNumber",
        "notAssignedNumber",
      ];
      if (["0", "1", "2", "16"].includes(pickingNewStatus)) {
        let assignList = [...common];
        assignList.push(...['warehouseLocationName', 'perRowStatus', 'outOfStockStatus']);
        // 生成拣货单可以从编辑进来操作/操作按钮进来
        if ((this.editButton && ["16"].includes(pickingNewStatus)) || this.buttonEdit) {
          assignList.splice(1, 0, 'selection');
          assignList.push("operator");
        }
        return fun(assignList);
      }

      let boxingList = [
        ...common,
        "actualPickingNumber",
        "acceptanceNumber",
        "problemNumber",
        "waitQuantitySum",
        "quantitySum",
        "quantity",
      ];
      let boxedList = [
        ...common,
        "actualPickingNumber",
        "acceptanceNumber",
        "problemNumber",
        "quantitySum",
        "notQuantitySum",
        // "productCost",
      ];
      // 装箱中
      if (this.buttonEdit && ["14"].includes(pickingNewStatus)) {
        return fun(boxingList);
      }
      if (["4"].includes(pickingNewStatus)) {
        boxedList.push(...["doneDeliveredNumber"]);
      }
      return fun(boxedList);
    },
    handleProductList() {
      this.tableLoading = true;
      this.deliveryListData = [];
      let goodsArr = this.$common.copy(this.data.queryPickingGoodsResult || []);
      goodsArr.forEach((val) => {
        // 默认本次装箱数为 0
        val.quantity = 0;
        // 未装箱数=待装箱数-已装箱数
        val.waitBoxNum = new Big(val.waitQuantitySum || 0).minus(val.quantitySum || 0) - 0;
        // 第三方平台信息转
        let thirdInfo = val.thirdLabelInfoDTO || {};
        Object.keys(thirdInfo).forEach(key => {
          if (['productGoodsId', 'lapaSku'].includes(key)) return;
          val[key] = thirdInfo[key];
        })
      });
      // this.deliveryListData = goodsArr;
      this.handleRowsData(goodsArr).then(() => {
        this.deProductList = this.$common.copy(this.deliveryListData);
      })
    },
    // 处理合并的数据
    handleRowsData(data = []) {
      return new Promise(resolve => {
        this.tableLoading = true;
        try {
          let list = this.$common.copy([...this.deliveryListData, ...data]);
          this.deliveryListData = [];
          this.$nextTick(() => {
            let obj = {};
            list.forEach(k => {
              k.pickingNo = this.data.pickingNo;
              k.productSkcId = k.productSkcId || k.skc;
              k.attributes = (k.skcSpecName ? k.skcSpecName + '-' : '') + k.skuSpecName;
              k.expectedNumber = k.expectedNumber || 1;// 订单数量
              k.qualityCheckNumber = k.qualityCheckNumber || 0;// 质检数量
              k.pickingDetailStatus = k.pickingDetailStatus || "0";
              let typeList = assignStatus.filter((j) => j.value === k.pickingDetailStatus);
              k.perRowStatus = typeList[0] ? typeList[0].label : "";
              k.doneAssignedNumber = k.doneAssignedNumber || 0;
              k.notAssignedNumber = this.$common.isEmpty(k.notAssignedNumber) ? 1 : k.notAssignedNumber;
              // 转
              k.barCode = k.barCode || k.labelCode;
              k.goodsSku = k.goodsSku || k.lapaSku;
              k.goodsUrl = k.goodsUrl || k.lapaSkuImageUrl;
              k.goodsWeight = k.goodsWeight || k.weight;
              k.goodsVolume = k.goodsVolume || k.volume;
              k.goodsCnDesc = k.goodsCnDesc || k.lapaSkuName;
              k.goodsAttributes = k.goodsAttributes || k.spec;

              if (!obj[k.productSkcId]) obj[k.productSkcId] = [];
              obj[k.productSkcId].push(k);
            })
            let arr = [];
            Object.keys(obj).forEach(k => {
              obj[k].forEach((j, i) => {
                obj[k][i].rowspan = i > 0 ? 0 : obj[k].length;
                obj[k][i].colspan = 1;
              })
              arr.push(...obj[k]);
            })
            this.deliveryListData = arr;
            this.$emit("returnProductData", arr);
            this.tableLoading = false;
            resolve();
          })
        } catch (err) {
          console.log(err, '出错')
          this.tableLoading = false;
          resolve();
        }
      })
    },
    // 选择商品返回
    async addProductSuccess(data) {
      let goodItem = data[0] || {};
      // 新添加产品的"LAPA SKU"已存在，则不允许重复添加，限制一个出库单只允许有一个“LAPA SKU”
      let exsitList = this.deliveryListData.filter(k => k.goodsSku === goodItem.goodsSku);
      if (exsitList.length) {
        this.$Message.error(`"LAPA SKU ${goodItem.goodsSku}"已存在，不允许重复添加！`);
        return;
      }
      this.addProduct.visible = false;
      const index = this.addProduct.replaceSkuIndex;
      goodItem.goodsVolume = (goodItem.goodsLength || 0) * (goodItem.goodsWidth || 0) * (goodItem.goodsHeight || 0);
      let replaceName = {
        'goodsUrl': 'goodsUrl',
        'goodsCnDesc': 'goodsCnDesc',
        'goodsAttributes': 'goodsAttributes',
        'goodsWeight': 'goodsWeight',
        'goodsVolume': 'goodsVolume',
        'goodsSku': 'goodsSku',
        'productGoodsId': 'productGoodsId',
      }
      Object.keys(replaceName).forEach(key => {
        this.$set(this.deliveryListData[index], key, goodItem[replaceName[key]])
      })
      // 清空库位的选择
      this.$set(this.deliveryListData[index], 'warehouseLocationName', '');
    },
    sltTableItemFn(data) {
      this.sltTableItem = data;
    },
    // 添加货品模态框
    showAddProductModal() {
      this.fullManageProductInfo.visible = true;
    },
    // 选择第三方商品返回
    fullProductData(list) {
      this.handleRowsData(list);
    },
    // 批量删除
    deleteProductBtn() {
      let v = this;
      if (v.sltTableItem.length === 0) {
        v.$Message.warning("未选择数据");
        return;
      }
      let length = v.deliveryListData.length;
      let valid = false;
      while (length--) {
        if (
          v.sltTableItem.map((i) => i.goodsSku).includes(v.deliveryListData[length].goodsSku)
        ) {
          if (v.deliveryListData[length].pickingDetailStatus === "0") {
            v.deliveryListData.splice(length, 1);
          } else {
            valid = true;
          }
        }
      }
      v.handleRowsData([]);
      if (valid) {
        v.$Message.success("操作成功，部分分配和全部分配的不能移出");
      } else {
        v.$Message.success("成功删除选中的货品！");
      }
    },
    // 批量分配
    assignInventory() {
      this.saveDo().then(() => {
        if (this.assignInventoryValid()) {
          this.sltTableItem.forEach((val) => {
            val.warehouseId = this.warehouseId;
          });
          let skus = this.sltTableItem.filter(
            (i) => i.pickingDetailStatus === "2"
          );
          let params = this.sltTableItem.filter(
            (i) => i.pickingDetailStatus !== "2"
          );
          if (skus && skus.length > 0) {
            setTimeout(() => {
              this.$Modal.confirm({
                title: "温馨提示",
                content:
                  "有已分配的sku，点击确定时忽略已分配库存的SKU，对未分配的SKU进行分配库存",
                onOk: () => {
                  this.assignFn(params);
                },
                onCancel: () => { },
              });
            }, 500);
          } else {
            this.assignFn(params);
          }
        }
      });
    },
    // 批量分配前的校验
    assignInventoryValid() {
      let sltTableItem = this.sltTableItem;
      // 勾选数据校验
      if (sltTableItem.length === 0) {
        this.$Message.warning({
          content: "请选择要操作的数据",
          duration: 3,
        });
        return false;
      }

      let isAssign = this.isAssignValid(sltTableItem);
      if (!isAssign) return false;

      // 分配完成的订单不能再分配
      let hasAssign = true;
      for (let i = 0; i < sltTableItem.length; i++) {
        if (sltTableItem[i].pickingDetailStatus !== "2") {
          hasAssign = false;
          break;
        }
      }
      if (hasAssign) {
        this.$Message.warning({
          content: "存在分配完成的订单",
          duration: 3,
        });
        return false;
      }

      // 判断是否填了库位信息
      let flag = true;
      sltTableItem.forEach((val) => {
        if (!val.warehouseLocationName && val.pickingDetailStatus !== "2") {
          flag = false;
        }
      });
      if (!flag) {
        this.$Message.warning({
          content: "请填写库位",
          duration: 3,
        });
        return false;
      }
      return true;
    },
    // 如果“LAPA SKU”为空或不匹配，则不能分配库存
    isAssignValid(list) {
      let assign = true;
      list.forEach((val) => {
        if (!(val.goodsSku && val.productGoodsId)) assign = false;
      });
      if (!assign) {
        this.$Message.warning({
          content: "“LAPA SKU”为空或不匹配，则不能分配库存",
          duration: 3,
        });
        return false;
      }
      return true;
    },
    // 冻结分配
    FreezeAssignmentBtn() {
      let valid = this.isAssignValid(this.deliveryListData);
      if (!valid) return;

      // 冻结分配之前判断是否有改动，如果有改动，弹框提示保存再冻结分配
      if (this.isChange) {
        this.$Modal.confirm({
          title: "温馨提示",
          content: "是否保存并冻结分配",
          onOk: () => {
            this.$emit("infoSave", () => {
              this.$refs.frozenModal.frozenModal = true;
            });
          },
          onCancel: () => { },
        });
      } else {
        this.$refs.frozenModal.frozenModal = true;
      }
    },
    // 批量取消
    cancelAssign() {
      if (this.cancelAssignValid()) {
        this.sltTableItem.forEach((val) => {
          val.warehouseId = this.warehouseId;
        });
        let obj = this.sltTableItem.filter((val) => {
          return (
            val.pickingDetailStatus === "2" || val.pickingDetailStatus === "1"
          );
        });
        this.cancelAssignFn(obj);
      }
    },
    // 批量取消的校验
    cancelAssignValid() {
      let valid = true;
      if (this.sltTableItem.length === 0) {
        this.$Message.warning({
          content: "请选择要操作的数据",
          duration: 3,
        });
        valid = false;
        return valid;
      }
      // 只有部分分配和分配完成才能取消
      let hasAssign = false;
      for (let i = 0; i < this.sltTableItem.length; i++) {
        if (
          this.sltTableItem[i].pickingDetailStatus === "2" ||
          this.sltTableItem[i].pickingDetailStatus === "1"
        ) {
          hasAssign = true;
          break;
        }
      }
      if (!hasAssign) {
        this.$Message.warning({
          content: "只有部分分配和分配完成才能取消",
          duration: 3,
        });
        valid = false;
        return valid;
      }
      return valid;
    },
    // 取消函数
    cancelAssignFn(params, index) {
      this.$Spin.show();
      this.axios
        .post(api.directDistributionCancelSingle, params)
        .then((res) => {
          if (res.data.code === 0) {
            this.$Message.success("取消成功");
            this.sltTableItem = [];
            let { pickingNewStatus } = this.data;
            if (["16"].includes(pickingNewStatus)) {
              this.$emit("backLists");
            } else {
              this.emitDetail();
            }
          }
        })
        .finally(() => {
          this.$Spin.hide();
        });
    },
    // 分配库存
    assignFn(params, index) {
      this.$Spin.show();
      let apiUrl = api.directModifyDistributionSingle;
      this.axios
        .post(apiUrl, params)
        .then((res) => {
          this.$Spin.hide();
          if (res.data.code === 0) {
            this.$Message.success("分配成功");
            this.sltTableItem = [];
            this.emitDetail();
          }
        })
        .catch(() => {
          this.$Spin.hide();
        }).finally(() => {
          this.$emit("searchData");
        })
    },
    // 选择库位框返回数据
    getData(data) {
      let arr = [
        "warehouseLocationName",
        "warehouseLocationId",
        "receiptBatchNo",
        "inventoryId",
        "availableNumber",
      ];
      arr.forEach((k) => {
        this.$set(this.deliveryListData[this.clickIndex], k, data[k]);
      });
      this.sltTableItem = [];
      this.wareLocateSltInfo.showLocationModal = false;
    },
    // 根据所选择“平台主体”与“店铺”，匹配第三方标签资料的“客户SKU”
    mateStoreLabel(productList) {
      return new Promise((resolve) => {
        let fun = () => {
          this.$Message.error(
            "添加商品失败，直发出库单的商品必须有第三方标签资料"
          );
        };
        const productGoodsIdList = productList.map((k) => k.productGoodsId);
        const saleAccountIdList = this.shopList
          .filter((k) => {
            return k.accountCode === this.data.saleAccount;
          })
          .map((k) => k.saleAccountId);
        let params = { saleAccountIdList, productGoodsIdList };
        this.axios
          .post(api.directQueryThirdPartyLabelsInfo, params)
          .then(({ data }) => {
            if (data.code === 0) {
              let list = data.datas || [];
              let filterList = [];
              productList.forEach((k) => {
                list.forEach((lk) => {
                  if (
                    k.productGoodsId === lk.productGoodsId &&
                    saleAccountIdList.includes(lk.saleAccountId)
                  ) {
                    filterList.push({ ...k, barCode: lk.labelCode });
                  }
                });
              });
              if (!filterList.length) fun();
              resolve(filterList);
            } else {
              fun();
              resolve([]);
            }
          })
          .catch(() => {
            fun();
            resolve([]);
          });
      });
    },
    addProductCancel() {
      this.addProduct.visible = false;
    },
    // 解冻并分配后，更新列表数据
    updateData(value) {
      if (value === this.freezeInfo.frozenModalTalg) this.emitDetail();
    },
    saveDo() {
      return new Promise((resolve) => {
        if (this.isChange) {
          this.$Modal.confirm({
            title: "温馨提示",
            content: "是否保存并分配库存",
            onOk: () => {
              this.$emit("infoSave", () => {
                resolve();
              });
            },
            onCancel: () => { },
          });
        } else {
          resolve();
        }
      });
    },
    // 扫描sku
    scanSku() {
      this.scanLoading = true;
      setTimeout(() => {
        let sku = this.scanInfo.form.scanText;
        this.scanInfo.form.scanText = "";
        sku = sku ? sku.trim() : sku;
        if (!sku) {
          this.scanFinish();
          return this.$Message.error("sku条码不能为空!");
        }
        let list = this.deliveryListData;
        let form = this.scanInfo.form;
        let [flag, isBarcode, index, item, _self] = [
          false,
          false,
          null,
          {},
          this,
        ];
        list.forEach((k, i) => {
          if (sku === k.goodsSku || sku === k.barCode) {
            index = i;
            item = this.$common.copy(k);
            flag = true;
            isBarcode = sku === k.barCode;
          }
        });
        if (!flag) {
          this.scanFinish();
          return this.$Message.error("当前出库单没有搜索到SKU商品信息~");
        }
        let func = {
          // 选中行高亮
          checked() {
            _self.deliveryListData.forEach((k, i) => {
              delete _self.deliveryListData[i].cellClassName;
            });
            _self.$set(
              _self.deliveryListData[index],
              "cellClassName",
              _self.cellClassNameTemp
            );
          },
          // 设置本次装箱数量
          settingBox() {
            const quantity = item.quantity || 0; // 本次装箱数
            const waitBoxNum = item.waitBoxNum || 0; // 未装箱数
            let subNum = new Big(waitBoxNum).minus(quantity) - 0;
            if (subNum <= 0) {
              _self.$Message.error("本次装箱数已为最大值~");
              return;
            }
            // 当选择“批量”扫描时，需要弹窗确定与编辑批量数量
            if (form.type == 2) {
              item.isPrint = form.checked;
              item.maxNum = subNum;

              _self.packingInfo.index = index;
              _self.packingInfo.data = item;
              _self.packingInfo.visible = true;
              return;
            }
            let num = 0;
            // 逐件扫描，小于未装箱数则装箱数+1
            num = subNum <= 0 ? waitBoxNum : new Big(quantity).plus(1) - 0;
            _self.$set(_self.deliveryListData[index], "quantity", num);
            this.printLabel();
          },
          // 打印标签
          printLabel() {
            //  扫描的商品条码识别为条码编码或不勾选，则不打印第三方标签；
            if (isBarcode || !form.checked) return;
            _self.thirdLabelPrint([Object.assign({ printNumber: 1 }, item)]);
          },
        };
        this.scanFinish();
        func.checked();
        func.settingBox();
      }, 500);
    },
    mulScan(rData) {
      let { index, data } = this.packingInfo;
      let totalNum = new Big(data.quantity || 0).plus(rData.labelNum) - 0;
      this.$set(this.deliveryListData[index], "quantity", totalNum);
      if (!rData.isPrint) return;
      this.thirdLabelPrint([
        Object.assign({ printNumber: rData.labelNum }, data),
      ]);
    },
    scanFinish() {
      this.scanLoading = false;
      this.$nextTick(() => {
        this.$refs["scanInput"] && this.$refs["scanInput"].focus();
      });
    },
    // 批量打印第三方标签
    printThirdLabel() {
      this.thirdInfo.detailData = this.$common.copy(this.deliveryListData);
      this.thirdInfo.visible = true;
    },
    // 加入货箱
    joinBox() {
      this.joinBoxInfo.visible = true;
    },
    // 根据平台获取对应的店铺信息
    platformChange() {
      let item = this.platformList[this.data.platformType] || {};
      this.$store
        .dispatch("getAllStoreList", { platformId: item.platformId })
        .then((list) => {
          this.shopList = list;
        });
    },
    // 设置列表装箱数
    setBoxNum(type) {
      this.deliveryListData.forEach((k, key) => {
        let num = type == "min" ? 0 : k.waitBoxNum;
        this.$set(this.deliveryListData[key], "quantity", num);
      });
    },
    // 取表格字段生成表格高亮需要的数据
    cellClassNameFun() {
      let columnsArr = this.columns.map((k) => {
        return k.key || k.slot;
      });
      let obj = {};
      columnsArr.forEach((k) => {
        if (k in obj || !k) return;
        obj[k] = "table-info-column-hightLine";
      });
      this.cellClassNameTemp = obj;
    },
    // 打印标签弹窗
    thirdLabelPrint(list) {
      const { platformType } = this.data;// , platformOrderNo
      let item = this.platformList[platformType] || {};
      let printList = list
        .filter((k) => k.printNumber)
        .map((k) => {
          let obj = k.thirdLabelInfoDTO || {};
          obj.printNumber = k.printNumber;
          obj.platformSubject = item.label
            ? item.label.toLowerCase()
            : platformType;
          // shein 次属性为空，则打印主属性
          if (obj.platformSubject === "shein") {
            obj.skuSpecName = obj.skuSpecName || obj.skcSpecName;
          }
          if (obj.platformSubject === "tiktok") {
            // tiktok的属地定死
            obj.countryName = "CHINA";
            // 关键属性，“主属性”-“次属性”；
            obj.keyAttributes = obj.skcSpecName + '-' + obj.skuSpecName;
            obj.itemNumber = '货号：' + obj.lapaSku;
          }
          return obj;
        });
      if (!printList.length) {
        this.$Message.error("打印数量为0!");
        return;
      }
      let platformSubject = printList[0].platformSubject;
      if (!platformSubject) {
        this.$Message.error("标签平台不存在~");
        return;
      }
      let tagSzie = {
        tiktok: {
          size: {
            width: 70,
            height: 20,
            unit: "mm",
          },
          replaceKey: {
            tagType: "platformSubject", // 标签类型 platformId
            barcode: "barCode", // 条码，Number、String
            leftTop: "barCode", // 条码左上角
            rightTop: "platformSku", // 条码右上角
            leftBottom: "keyAttributes", // 条码左下角
            rightBottom: "countryName", // 条码右下角
            rightBottomSubjoinTxt: "MADE IN", // 条码右下角附加值
            leftFourLine: "itemNumber", // 条码第四行左下角
          },
        },
        temu: {
          size: {
            width: 70,
            height: 20,
            unit: "mm",
          },
          replaceKey: {
            tagType: "platformSubject", // 标签类型 platformId
            barcode: "barCode", // 条码，Number、String
            leftTop: "lapaSku", // 条码左上角
            middleTop: "skcSpecName", // 条码正上(即条码中间上方)
            rightTop: "skuSpecName", // 条码右上角
            leftBottom: "platformSku", // 条码左下角
            middleBottom: "", // 条码正下(即条码中间下方)
            rightBottom: "countryName", // 条码右下下角
            rightBottomSubjoinTxt: "Made In", // 右下角附加值
          },
        },
        shein: {
          size: {
            width: 70,
            height: 20,
            unit: "mm",
          },
          replaceKey: {
            tagType: "platformSubject", // 标签类型 platformId
            barcode: "barCode", // 条码，Number、String
            leftTop: "supplierItem", // 条码左上角
            middleTop: "", // 条码正上(即条码中间上方)
            rightTop: "", // 条码右上角
            rightTopSubjoinTxt: "Made In", // 右上角附加值
            rightTopDefaultTxt: "China", // 当右上角数据为空时，使用该值替补
            leftBottom: "productSkcId", // 条码左下角
            middleBottom: "", // 条码正下(即条码中间下方)
            rightBottom: "skuSpecName", // 条码右下下角
          },
        },
      };
      let tagOption = tagSzie[platformSubject];
      if (!tagOption) {
        this.$Message.error(`未新增${platformSubject}平台标签配置!`);
        return;
      }
      this.beingCreatePrint = true;
      this.$common
        .promiseAll(
          printList.map((k) => {
            return () => {
              return new Promise((resolve) => {
                getPrintHtml(k, tagOption).then((res) => {
                  resolve({ ...res, printNumber: k.printNumber });
                });
              });
            };
          })
        )
        .then((list) => {
          let tagViewHtml = [];
          list.forEach((res) => {
            if (!res.success || this.$common.isEmpty(res.data)) return;
            const printQuantity = Number(res.printNumber);
            res.data.forEach((item) => {
              for (let index = 0; index < printQuantity; index++) {
                tagViewHtml.push(item);
              }
            });
          });
          if (!tagViewHtml.length) {
            this.$Message.error("标签生成异常~");
            this.beingCreatePrint = false;
            return;
          }
          let fun = (index) => {
            let printList = tagViewHtml.slice(index * 40, (index + 1) * 40);
            if (!printList.length) {
              this.beingCreatePrint = false;
              return;
            }
            this.printTag(printList).finally(() => {
              index++;
              fun(index);
            });
          };
          fun(0);
        })
        .catch((err) => {
          this.beingCreatePrint = false;
          throw new Error(err);
        });
    },
    // 打印标签
    printTag(list) {
      return new Promise((resolve) => {
        let allTagHtml = "";
        list.forEach((item, index) => {
          allTagHtml = `${allTagHtml}${item.printHtml}`;
        });
        // 将 html 放到 html 文档中
        allTagHtml = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>标签打印</title>
        </head>
        <style>
          * {
            margin: 0;
            padding: 0;
          }
          body{
            font-size: 0;
          }
          img {
            vertical-align: top;
          }
        </style>
        <body>${allTagHtml}</body>
      </html>`;
        printCommon
          .htmlPrint(allTagHtml)
          .then((res) => {
            // console.log(res);
          })
          .finally(() => {
            resolve("finish");
          });
      });
    },
    emitDetail() {
      this.$emit("searchData");
      this.$emit("backEdit");
    },
    // 问题件处理
    processProblem(row) {
      // this.problemInfo.data = row;
      this.problemInfo.visible = true;
    },
    handleSpan({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        const { rowspan, colspan } = row;
        return {
          rowspan,
          colspan
        }
      }
    }
  },
};
</script>

<style lang="less">
.productManagePage {
  .table-info-column-hightLine {
    background-color: #2db7f5ab;
  }

  .operators {
    padding: 0 0 10px 0;
  }

  .productOperator {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .scan-main {
    display: flex;
    align-items: center;
  }
}
</style>
