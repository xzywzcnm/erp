<template>
  <div class="add-products">
    <div class="list-tit" v-if="!isEdit || detailData.pickingGoodsStatus === '1'">
      <span>产品列表</span>
      <span @click="changeShow">
        <Icon :type="assignListShow ? 'ios-arrow-up' : 'ios-arrow-down'" class="list-ico"></Icon>
      </span>
    </div>
    <div class="clear" style="padding: 10px 0" v-if="isEdit &&
      (!detailData.pickingId || detailData.pickingGoodsStatus === '0')
      ">
      <div class="fl">
        <Button type="primary" @click="addProductFn" class="mr10">添加产品</Button>
        <Button type="error" @click="deleteProductBtn" class="mr10" v-if="getPermission('wmsFbaPicking_removeGoods') &&
          detailData.pickingStatus < 2
          ">移除产品</Button>
      </div>
      <div class="fr" v-if="detailData.pickingGoodsStatus === '0'">
        <template v-if="detailData.pickingStatus < 2">
          <Button type="primary" @click="assignInventory(sltTableItem)" class="mr10">分配库存</Button>
          <Button type="primary" @click="FreezeAssignmentBtn()" class="mr10">冻结分配</Button>
        </template>
        <Button type="primary" @click="cancelAssign(sltTableItem)" v-if="cancelType">取消分配</Button>
      </div>
    </div>
    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" v-if="assignListShow"
      class="disable-color product-form">
      <FormItem label="" prop="data">
        <Table ref="tables" :columns="columns" :data="formValidate.data" @on-selection-change="sltTableItemFn"
          class="expendTable table-split-line" :loading="productLoading">
          <template slot-scope="{ row, index }" slot="pickingDetailStatus">
            <span v-if="row.isAssemble != 1 && pickingStatus[row.pickingDetailStatus]
              ">
              {{ pickingStatus[row.pickingDetailStatus].name }}
            </span>
          </template>
          <template slot-scope="{ row, index }" slot="expectedNumber">
            <FormItem :prop="`data.${index}.expectedNumber`" :rules="{ validator: validateNums, trigger: 'blur' }">
              <Input v-model="formValidate.data[index].expectedNumber" placeholder="请输入"
                :disabled="isDisabled(row, 'expectedNumber')" @input="expectedNumberInputs(index)" type="number"></Input>
            </FormItem>
          </template>
          <template slot-scope="{ row, index }" slot="productLength">
            <FormItem :prop="`data.${index}.productLength`" :label-width="0" :rules="{
              validator: twoPlaceDecimal,
              trigger: 'blur',
              isDisabled: isDisabled(row, 'productLength'),
            }">
              <Input v-model="formValidate.data[index].productLength" placeholder="请输入"
                :disabled="isDisabled(row, 'productLength')" />
            </FormItem>
          </template>
          <template slot-scope="{ row, index }" slot="productWidth">
            <FormItem :prop="`data.${index}.productWidth`" :label-width="0" :rules="{
              validator: twoPlaceDecimal,
              trigger: 'blur',
              isDisabled: isDisabled(row, 'productWidth'),
            }">
              <Input v-model="formValidate.data[index].productWidth" placeholder="请输入"
                :disabled="isDisabled(row, 'productWidth')" />
            </FormItem>
          </template>
          <template slot-scope="{ row, index }" slot="productHeight">
            <FormItem :prop="`data.${index}.productHeight`" :label-width="0" :rules="{
              validator: twoPlaceDecimal,
              trigger: 'blur',
              isDisabled: isDisabled(row, 'productHeight'),
            }">
              <Input v-model="formValidate.data[index].productHeight" placeholder="请输入"
                :disabled="isDisabled(row, 'productHeight')" />
            </FormItem>
          </template>
          <template slot-scope="{ row, index }" slot="productWeight">
            <FormItem :prop="`data.${index}.productWeight`" :label-width="0" :rules="{
              validator: threePlaceDecimal,
              trigger: 'blur',
              isDisabled: isDisabled(row, 'productWeight'),
            }">
              <Input v-model="formValidate.data[index].productWeight" placeholder="请输入"
                :disabled="isDisabled(row, 'productWeight')" />
            </FormItem>
          </template>
          <template slot-scope="{ row, index }" slot="platSku">
            <FormItem :prop="`data.${index}.platSku`" :rules="{ validator: validateplatSku, trigger: 'blur' }">
              <Input v-model="formValidate.data[index].platSku" placeholder="请输入" clearable :disabled="isDisabled(row)"
                :maxlength="isShowWordLimit ? 20 : null" :show-word-limit="isShowWordLimit"></Input>
            </FormItem>
          </template>
          <template slot-scope="{ row, index }" slot="platSpu">
            <FormItem :prop="`data.${index}.platSpu`" :rules="{ required: true, message: '请输入', trigger: 'blur' }">
              <Input v-model="formValidate.data[index].platSpu" placeholder="请输入" clearable
                :disabled="isDisabled(row)"></Input>
            </FormItem>
          </template>
          <template slot-scope="{ row, index }" slot="platSamplesNo">
            <FormItem :prop="`data.${index}.platSamplesNo`" :rules="{ required: true, message: '请输入', trigger: 'blur' }">
              <Input v-model="formValidate.data[index].platSamplesNo" placeholder="请输入" clearable
                :disabled="isDisabled(row)"></Input>
            </FormItem>
          </template>
          <template slot-scope="{ row, index }" slot="platSkc">
            <FormItem :prop="`data.${index}.platSkc`" :rules="{ required: true, message: '请输入', trigger: 'blur' }">
              <Input v-model="formValidate.data[index].platSkc" placeholder="请输入" clearable
                :disabled="isDisabled(row)"></Input>
            </FormItem>
          </template>
          <template slot-scope="{ row, index }" slot="labelName">
            <FormItem :prop="`data.${index}.labelName`" :rules="{ required: !isBarn, message: '请输入', trigger: 'blur' }">
              <Input v-model="formValidate.data[index].labelName" placeholder="请输入" clearable
                :disabled="isDisabled(row)"></Input>
            </FormItem>
          </template>
          <template slot-scope="{ row, index }" slot="skuDesc">
            <FormItem>
              <Input v-model="formValidate.data[index].skuDesc" placeholder="请输入" clearable
                v-if="!isDisabled(row)"></Input>
              <Tooltip :content="row.skuDesc" placement="top" :transfer="true" v-else-if="row.skuDesc" max-width="200">
                <div class="desc-div">{{ row.skuDesc }}</div>
              </Tooltip>
            </FormItem>
          </template>
          <template slot-scope="{ row, index }" slot="warehouseLocationName">
            <FormItem v-if="row.isAssemble != 1">
              <Input v-model="formValidate.data[index].warehouseLocationName" placeholder="请输入" clearable
                @on-focus="allocateInventory(row, index, $event)" :disabled="isDisabled(row)"
                @on-clear="locationNameClear(index)"></Input>
            </FormItem>
          </template>
          <template slot-scope="{ row, index }" slot="option">
            <Button type="error" @click="delPorduct(row, index)" size="small" v-if="!detailData.pickingId">删除</Button>
            <Dropdown :transfer="true" trigger="click" v-if="detailData.pickingGoodsStatus === '0'">
              <Button type="default" :style="{ width: '100px' }" icon="ios-hammer">
                操作
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem @click.native="assignInventory([row], index)" v-if="singleJudge(row, 'assign')">分配库存
                </DropdownItem>
                <DropdownItem @click.native="cancelAssign([row])" v-if="singleJudge(row, 'cancel')">取消分配</DropdownItem>
                <DropdownItem @click.native="delPorduct(row, index)" v-if="!row.pickingDetailStatus">删除产品</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <!-- 捡完货 -->
            <Button type="primary" @click="printLabel(row)" size="small" v-if="detailData.pickingGoodsStatus === '1'">
              打印标签
            </Button>
          </template>
          <template slot-scope="{ row, index }" slot="platformSku">
            <FormItem :prop="`data.${index}.platformSku`" :rules="{ validator: validateplatSku, trigger: 'blur' }">
              <Input v-model="formValidate.data[index].platformSku" placeholder="请输入" clearable
                :disabled="isDisabled(row)"></Input>
            </FormItem>
          </template>
          <template slot-scope="{ row, index }" slot="mrp">
            <FormItem :prop="`data.${index}.mrp`" :rules="{ validator: validateplatSku, trigger: 'blur' }">
              <Input v-model="formValidate.data[index].mrp" placeholder="请输入" clearable
                :disabled="isDisabled(row)"></Input>
            </FormItem>
          </template>
          <template slot-scope="{ row, index }" slot="importerInfo">
            <FormItem :prop="`data.${index}.importerInfo`" :rules="{ validator: validateplatSku, trigger: 'blur' }">
              <Input v-model="formValidate.data[index].importerInfo" placeholder="请输入" clearable
                :disabled="isDisabled(row)"></Input>
            </FormItem>
          </template>
          <template slot-scope="{ row, index }" slot="ymsSupplierSku">
            <FormItem :prop="`data.${index}.ymsSupplierSku`" :rules="{ validator: validateplatSku, trigger: 'blur' }">
              <Input v-model="formValidate.data[index].ymsSupplierSku" placeholder="请输入" clearable
                :disabled="isDisabled(row)" :maxlength="isShowWordLimit ? 50 : null"
                :show-word-limit="isShowWordLimit"></Input>
            </FormItem>
          </template>
          <template slot-scope="{ row, index }" slot="ymsProductSpec">
            <FormItem :prop="`data.${index}.ymsProductSpec`" :rules="{ validator: validateplatSku, trigger: 'blur' }">
              <Input v-model="formValidate.data[index].ymsProductSpec" placeholder="请输入" clearable
                :disabled="isDisabled(row)" :maxlength="isShowWordLimit ? 20 : null"
                :show-word-limit="isShowWordLimit"></Input>
            </FormItem>
          </template>
          <!-- <template slot-scope="{ row, index }" slot="goodId">
            <FormItem :prop="`data.${index}.goodId`" :rules="{ required: true, trigger: 'blur' }">
              <Input v-model="formValidate.data[index].goodId" placeholder="请输入" clearable :disabled="isDisabled(row)"
                maxlength="20" show-word-limit></Input>
            </FormItem>
          </template> -->
        </Table>
      </FormItem>
    </Form>
    <!-- 添加产品 -->
    <div v-if="addProductModal">
      <Modal v-model="addProductModal" title="添加产品" width="1200" footer-hide :mask-closable="false">
        <addProduct ref="addProduct" :from="'allGoods'" @addProductSuccess="addProductSuccess"
          @addProductCancel="addProductCancel" :wareId="wareId" :eliminateData="formValidate.data">
        </addProduct>
      </Modal>
    </div>
    <!-- 库位选择 -->
    <div v-if="inventoryInfo.showLocationModal">
      <Modal v-model="inventoryInfo.showLocationModal" title="库位选择" :styles="{ top: '80px', width: '1100px' }"
        class="headerBar" :mask-closable="false" :footer-hide="true">
        <div class="content">
          <wareLocateSlt :open="inventoryInfo.showLocationModal" :wareId="wareId" :sku="inventoryInfo.data.goodsSku"
            :productId="inventoryInfo.data.productGoodsId" @sendData="getData"></wareLocateSlt>
        </div>
      </Modal>
    </div>
    <!--冻结分配弹窗-->
    <freezeAssignmentModal ref="frozenModal" :frozenModalTalg="frozenModalTalg" @updateData="updateData"
      :deliveryOrder="detailData.pickingNo" :mulSearchInput="true"></freezeAssignmentModal>
    <!-- 打印商品标签 -->
    <print-common :printModal.sync="printModal" :printData="printData" :pintField="pintField" :linkPrint="linkPrint"
      @linkPirntFun="linkPirntFun">
    </print-common>
    <!-- temu寄样打印数量 -->
    <send-print-num :modelVisible.sync="sendVisible" :sendTemp="sendTemp"
      @temuSendReturn="temuSendReturn"></send-print-num>
  </div>
</template>

<script>
import Big from "big.js";
import api from "@/api/api";
import common from "@/components/mixin/common_mixin";
import columnsFeild_mixin from "./columnsFeild_mixin";
import dropDown from "@/views/wms/components/common/dropDownOpt";
import printCommon from "@/views/wms/components/pirntCommon/index";
import addProduct from "@/views/wms/components/wms-inStock/newAddProduct";
import wareLocateSlt from "@/views/wms/components/exWarehouse/wareLocateSlt";
import { commodityLabel, temuLabel, labelTypeOption } from "@/views/wms/stockOUt/otherStouck/components/fileData.js";
import freezeAssignmentModal from "@/views/wms/components/exWarehouse/freezeAssignmentModal";
import sendPrintNum from "./sendPrintNum";
const validateNum = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("必填"));
  } else if (value < 1) {
    callback(new Error("值必须大于0"));
  } else {
    callback();
  }
};
export default {
  name: "addProducts",
  mixins: [common, columnsFeild_mixin],
  components: {
    addProduct,
    wareLocateSlt,
    freezeAssignmentModal,
    dropDown,
    printCommon,
    sendPrintNum,
  },
  props: {
    detailData: {
      // 详情数据
      type: Object,
      default() {
        return {};
      },
    },
    isEdit: {
      // 是否可编辑
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      formValidate: {
        data: [],
      },
      ruleValidate: {
        data: [
          {
            required: true,
            message: "请添加产品",
            trigger: "change",
            type: "array",
          },
        ],
      },
      addProductModal: false, // 添加产品框
      wareId: "", // 仓库id
      inventoryInfo: {
        // 库位信息
        showLocationModal: false, // 库位模态框
        data: {},
        clickIndex: "", // 库位位置
        target: "", // 库位选择目标
      },
      sltTableItem: [], // 表格选择的数据
      frozenModalTalg: "details",
      pickingStatus: {
        0: { name: "订单创建", value: "0" },
        1: { name: "部分分配", value: "1" },
        2: { name: "分配完成", value: "2" },
        3: { name: "部分发货", value: "3" },
        4: { name: "完成发货", value: "4" },
        5: { name: "出库完成", value: "5" },
        6: { name: "取消分配", value: "6" },
      },
      assignListShow: true,
      validateNums: validateNum,
      deProductList: [], // 用来比较产品列表是否更改
      printModal: false, // 打印弹框
      printData: [], // 打印的数据
      productLoading: false,
      sendSampleInfo: {}, // 存放寄养标签信息
      sendVisible: false,
      sendTemp: {}, // 某一列寄养数据
    };
  },
  watch: {
    detailData: {
      handler(val) {
        if (!val.pickingId) return;
        this.setData(JSON.parse(JSON.stringify(val)));
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    // 取消分配
    cancelType() {
      let list = this.formValidate.data || [];
      let cancelAssign = false;
      // 存在分配完成的情况，就要显示取消分配按钮
      list.forEach((k) => {
        if (k.isAssemble == 1) {
          (k.assembleGoodsList || []).forEach((ak) => {
            ak.pickingDetailStatus == 2 && (cancelAssign = true);
          });
        } else {
          k.pickingDetailStatus == 2 && (cancelAssign = true);
        }
      });
      return cancelAssign;
    },
    // 出库单类型是否为谷仓/SHL/万邑通 标签名非必填
    isBarn() {
      let { pickingType } = this.detailData;
      if (["O8", "O9", "O10", "O11", "O13"].includes(pickingType)) return true;
      return false;
    },
    // 根据不同出库类型不同打印内容
    pintField() {
      let { pickingType, pickingSubType, labelType } = this.detailData || {};
      !pickingType && (pickingType = "O5"); // 不存在出库单类型，则默认为FBA出库单
      if (pickingType === "O11") {
        return temuLabel["label" + pickingSubType] || {};
      }
      if (['O5'].includes(pickingType)) {
        let option = labelTypeOption[pickingType + labelType];
        if (option) return option;
      }
      return commodityLabel[pickingType] || {};
    },
    // 需要链接打印的出库单类型
    linkPrint() {
      let { pickingType, pickingSubType } = this.detailData || {};
      return (
        ["O8", "O10"].includes(pickingType) ||
        (pickingType === "O11" && pickingSubType == 1)
      );
    },
    // temu寄样
    isTemuSend() {
      return (
        this.detailData.pickingType === "O11" &&
        this.detailData.pickingSubType === 0
      );
    },
    isShowWordLimit() {
      let { pickingType } = this.detailData;
      if (["O20", "O21"].includes(pickingType)) return true;
      return false;
    },
  },
  created() {
    this.wareId = this.getWarehouseId();
  },
  methods: {
    setData(val) {
      let fbaPickingDetailList = val.fbaPickingDetailList || []; // 产品列表
      fbaPickingDetailList.forEach((k) => {
        k.expectedNumber = k.expectedNumber + ""; // 订单数量
        k.assembleGoodsList = k.fbaPickingDetailVOList || []; // 详情后端又用另外一个字段返回产品列表
        // 组合产品子产品保留原数量
        if (k.isAssemble == 1 && k.assembleGoodsList.length) {
          k._expanded = true; // 默认展开组合产品下的sku
          k.assembleGoodsList.forEach((sonitem) => {
            sonitem.expectedNumber =
              new Big(sonitem.quantity || 0).times(k.expectedNumber || 0) - 0;
          });
          k.cellClassName = {
            expand: "expand-table-info-cell-age",
          };
        } else {
          k._expanded = false;
        }
      });
      // console.log(fbaPickingDetailList, 'fbaPickingDetailList');
      this.formValidate.data = fbaPickingDetailList;
      this.deProductList = this.$common.copy(fbaPickingDetailList);
    },
    // 必填 2 位小数
    twoPlaceDecimal(rule, value, callback) {
      if (!this.isEdit || rule.isDisabled) return callback();
      if (this.$common.isEmpty(value)) {
        return callback(new Error("必填"));
      }
      const numberVal = Number(value);
      if (this.$common.isEmpty(numberVal)) {
        return callback(new Error("格式不对，请输入数字"));
      }
      if (numberVal <= 0) {
        return callback(new Error("值必须大于 0"));
      }
      const division = value.toString().split(".");
      if (!this.$common.isEmpty(division[1]) && division[1].length > 2) {
        return callback(new Error("格式不对，不能超过2位小数"));
      }
      callback();
    },
    // 必填 3 位小数
    threePlaceDecimal(rule, value, callback) {
      if (!this.isEdit || rule.isDisabled) return callback();
      if (this.$common.isEmpty(value)) {
        return callback(new Error("必填"));
      }
      const numberVal = Number(value);
      if (this.$common.isEmpty(numberVal)) {
        return callback(new Error("格式不对，请输入数字"));
      }
      if (numberVal <= 0) {
        return callback(new Error("值必须大于 0"));
      }
      const division = value.toString().split(".");
      if (!this.$common.isEmpty(division[1]) && division[1].length > 3) {
        return callback(new Error("格式不对，不能超过 3 位小数"));
      }
      callback();
    },
    // 表格选中
    sltTableItemFn(data) {
      this.sltTableItem = data;
    },
    // 打开添加产品模态层
    addProductFn() {
      this.addProductModal = true;
    },
    // 选择产品完成回调
    addProductSuccess(data) {
      this.addProductModal = false;
      let list = JSON.parse(JSON.stringify(data));
      let { pickingType, pickingSubType } = this.detailData;

      list.forEach((k, y) => {
        list[y].expectedNumber = "1"; // 默认值1 订单数量
        list[y].labelName = ""; // 标签名称
        list[y].skuDesc = ""; // 备注

        if (pickingType === "O11") {
          // 寄样
          if (pickingSubType === 0) {
            list[y].platSpu = ""; // platSpu
            list[y].platSamplesNo = ""; // platSamplesNo
          } else {
            list[y].platSkc = ""; // platSkc
          }
        } else {
          list[y].platSku = ""; // platSku
        }

        // 组合产品子产品保留原数量
        if (
          k.isAssemble == 1 &&
          Array.isArray(k.assembleGoodsList) &&
          k.assembleGoodsList.length
        ) {
          list[y]._expanded = true; // 默认展开组合产品下的sku
          k.assembleGoodsList.forEach((sonitem) => {
            sonitem.expectedNumber =
              new Big(sonitem.quantity || 0).times(k.expectedNumber || 0) - 0;
          });
          list[y].cellClassName = {
            expand: "expand-table-info-cell-age",
          };
        } else {
          list[y]._expanded = false;
        }
      });
      // 过滤掉重复的出库单
      let goodsIdList = this.formValidate.data.map((k) => {
        return k.productGoodsId;
      });
      list.forEach((k) => {
        !goodsIdList.includes(k.productGoodsId) &&
          this.formValidate.data.push(k);
      });
    },
    // 选择产品失败回调
    addProductCancel() {
      this.addProductModal = false;
    },
    // 提交产品信息
    handleSubmit() {
      return new Promise((resolve, reject) => {
        this.$refs["formValidate"].validate((valid) => {
          if (valid) {
            let list = JSON.parse(JSON.stringify(this.formValidate.data));
            // 添加组合产品使用assembleGoodsList字段，详情保存组合产品使用fbaPickingDetailVOList
            if (this.detailData.pickingId) {
              list.forEach((k) => {
                if (k.isAssemble == 1) {
                  k.fbaPickingDetailVOList = k.assembleGoodsList;
                  delete k.assembleGoodsList;
                }
              });
            }
            // console.log(list);
            // return;
            resolve(list);
          } else {
            resolve(false);
          }
        });
      });
    },
    // 分配库存
    assignInventory(list) {
      let checklist = JSON.parse(JSON.stringify(list));
      if (!checklist.length) {
        this.$Message.error("请选择要分配的产品");
        return;
      }
      let [distriFlag, wareFlab] = [false, false];
      checklist.forEach((k) => {
        // 区分普通产品和组合产品
        if (k.isAssemble == 1) {
          (k.assembleGoodsList || []).forEach((vok, voi) => {
            vok.pickingDetailStatus > 0 && (distriFlag = true);
            !vok.warehouseLocationId && (wareFlab = true);
          });
        } else {
          k.pickingDetailStatus > 0 && (distriFlag = true);
          !k.warehouseLocationId && (wareFlab = true);
        }
      });
      // 库位要先选中
      if (wareFlab) {
        this.$Message.error("选中的产品库位不能为空!");
        return;
      }

      // 订单创建，部分分配和新增产品
      let arr = checklist.filter((k) => {
        // 区分普通产品和组合产品
        if (k.isAssemble == 1) {
          let pickingFlag = false;
          (k.assembleGoodsList || []).forEach((vok, voi) => {
            (!vok.pickingDetailStatus || vok.pickingDetailStatus < 2) &&
              (pickingFlag = true);
          });
          return pickingFlag;
        } else {
          return !k.pickingDetailStatus || k.pickingDetailStatus < 2;
        }
      });
      if (!arr.length) {
        this.$Message.error("不存在符合分配条件的产品");
        return;
      }
      // 存在已分配的情况要跳过
      if (distriFlag) {
        this.$Modal.confirm({
          title: "温馨提示",
          content:
            "存在已分配的产品，点击确定时忽略已分配库存的产品，对未分配的产品进行分配库存",
          onOk: () => {
            setTimeout(() => {
              this.attributeStock(arr);
            }, 500);
          },
          onCancel: () => { },
        });
      } else {
        this.attributeStock(checklist);
      }
    },
    // 先保存后分配
    attributeStock(temp) {
      this.$Modal.confirm({
        title: "温馨提示",
        content: "是否保存并分配库存",
        onOk: () => {
          this.$emit("saveStockout", () => {
            let productGoodsIds = temp.map((k) => {
              return k.productGoodsId;
            });
            // 这里是新增产品必须要保存后取新的值才能进行分配
            let list = this.formValidate.data.filter((k) => {
              return productGoodsIds.includes(k.productGoodsId);
            });
            let data = this.assembleList(list);
            // console.log(list, data);
            // return;
            this.$Spin.show();
            this.axios
              .post(api.assign_stockSingle, data)
              .then((res) => {
                if (res.data.code === 0) {
                  this.$Message.success("分配成功");
                  this.$emit("searchData"); // 调用详情
                  this.$refs.tables.selectAll(false);
                }
              })
              .finally(() => {
                this.$Spin.hide();
              });
          });
        },
        onCancel: () => { },
      });
    },
    // 存在组合产品时，需要特殊处理
    assembleList(list) {
      let [arr, wareId] = [[], this.wareId];
      list.forEach((k, i) => {
        k.warehouseId = wareId;
        if (k.isAssemble == 1) {
          // 组合
          (k.assembleGoodsList || []).forEach((ak, ai) => {
            ak.assembleProductGoodsId = k.productGoodsId; // 将组合产品id放入子sku中
            ak.skuDesc = k.skuDesc;
            ak.warehouseId = wareId;
            arr.push(ak);
          });
          return;
        }
        arr.push(k);
      });
      return arr;
    },
    // 冻结分配
    FreezeAssignmentBtn() {
      // 冻结分配之前判断是否有改动，如果有改动，弹框提示保存再冻结分配
      const flag =
        JSON.stringify(this.formValidate.data) ===
        JSON.stringify(this.deProductList);
      if (!flag) {
        this.$Modal.confirm({
          title: "温馨提示",
          content: "是否保存并冻结分配",
          onOk: () => {
            this.$emit("saveStockout", () => {
              this.$refs.frozenModal.frozenModal = true;
            });
          },
          onCancel: () => {},
        });
      } else {
        this.$refs.frozenModal.frozenModal = true;
      }
    },
    // 取消分配验证
    cancelAssign(list) {
      let checklist = JSON.parse(JSON.stringify(list));
      if (!checklist.length) {
        this.$Message.warning({
          content: "请选择要分配的数据",
          duration: 3,
        });
        return;
      }
      let flag = false;
      checklist.forEach((k) => {
        if (k.isAssemble == 1) {
          // 组合
          let assemFlag = true;
          (k.assembleGoodsList || []).forEach((ak, ai) => {
            ["1", "2"].includes(ak.pickingDetailStatus) && (assemFlag = false);
          });
          flag = assemFlag;
        } else {
          !["1", "2"].includes(k.pickingDetailStatus) && (flag = true);
        }
      });
      if (flag) {
        this.$Message.warning({
          content: "只有部分分配和分配完成的产品才能取消分配",
          duration: 3,
        });
        return;
      }

      // 组合产品需要将子sku拆分出来
      let [temp, wareId] = [[], this.wareId];
      checklist.forEach((val) => {
        if (val.isAssemble == 1) {
          // 组合
          (val.assembleGoodsList || []).forEach((ak, ai) => {
            if (["1", "2"].includes(ak.pickingDetailStatus)) {
              ak.warehouseId = wareId;
              temp.push(ak);
            }
          });
        } else {
          val.warehouseId = wareId;
          temp.push(val);
        }
      });

      this.cancelAssignFn(temp);
    },
    // 取消分配
    cancelAssignFn(temp) {
      this.$Spin.show();
      this.axios
        .post(api.cancel_stock, temp)
        .then(({ data }) => {
          if (!(data && data.code === 0)) return;
          this.$Message.success("取消成功");
          this.$refs.tables.selectAll(false);
          this.$emit("searchData", 1);
        })
        .finally(() => {
          this.$Spin.hide();
        });
    },
    // 移除产品
    deleteProductBtn() {
      let list = this.sltTableItem;
      if (!list.length) {
        this.$Message.error("请选择要移除的产品!");
        return;
      }
      let flag = false;
      list.forEach((k) => {
        if (k.isAssemble == 1) {
          // 组合
          (k.assembleGoodsList || []).forEach((ak, ai) => {
            ak.pickingDetailStatus > 0 && (flag = true);
          });
        } else {
          k.pickingDetailStatus > 0 && (flag = true);
        }
      });
      if (flag) {
        this.$Message.error("部分分配和全部分配的产品不能移除!");
        return;
      }
      let pickingDetailIds = [];
      list.map((k) => {
        if (k.isAssemble == 1) {
          // 组合
          let arr = (k.assembleGoodsList || []).map((ak, ai) => {
            return ak.pickingDetailId;
          });
          pickingDetailIds.push(...arr);
        }
        pickingDetailIds.push(k.pickingDetailId);
      });
      //   console.log(pickingDetailIds);
      //   return;
      this.isDelModal(
        () => {
          this.$Spin.show();
          this.axios
            .post(api.removeGoods, pickingDetailIds)
            .then(({ data }) => {
              if (!(data && data.code === 0)) return;
              this.$Message.success("操作成功");

              let goodsIdlist = list.map((k) => {
                return k.productGoodsId;
              });
              let formList = JSON.parse(JSON.stringify(this.formValidate.data));
              this.formValidate.data = formList.filter((k) => {
                return !goodsIdlist.includes(k.productGoodsId);
              });
            })
            .finally(() => {
              this.$Spin.hide();
            });
        },
        (err) => {
          console.error(err);
        },
        "确认删除选中的产品?"
      );
    },
    // 选择库位
    allocateInventory(row, index, e) {
      this.inventoryInfo.showLocationModal = true;
      this.inventoryInfo.data = row;
      this.inventoryInfo.clickIndex = index;
      this.inventoryInfo.target = e && e.target;
      if (e && e.target) e.target.blur();
    },
    // 选择库位框返回数据
    getData(data) {
      this.inventoryInfo.showLocationModal = false;
      let index = this.inventoryInfo.clickIndex;
      this.wareColumn.forEach((k) => {
        this.$set(this.formValidate.data[index], k, data[k]);
      });
    },
    // 解冻并分配后，更新列表数据
    updateData(value) {
      this.$Message.success("分配成功");
      this.$emit("searchData", 1);
    },
    // 删除产品
    delPorduct(row, index) {
      this.formValidate.data.splice(index, 1);
    },
    changeShow() {
      this.assignListShow = !this.assignListShow;
    },
    // 是否可编辑 true 不可
    isDisabled(row, type) {
      if (!this.isEdit) return true;
      if (!row.pickingDetailId) return false; // 添加产品时可编辑
      // 子sku存在未分配的情况，则可编辑
      if (row.isAssemble == 1) {
        let [flag, flagT] = [false, true];
        if (type === "expectedNumber") {
          (row.assembleGoodsList || []).forEach((ak) => {
            ak.pickingDetailStatus > 0 && (flag = true);
          });
          return flag;
        } else {
          (row.assembleGoodsList || []).forEach((ak) => {
            ["0", "1"].includes(ak.pickingDetailStatus) && (flagT = false);
          });
          return flagT;
        }
      } else {
        if (type === "expectedNumber") {
          return !["0"].includes(row.pickingDetailStatus);
        } else {
          return !["0", "1"].includes(row.pickingDetailStatus);
        }
      }
    },
    // 订单数量更改，组合产品下的子sku数量也要更改
    expectedNumberInputs(index) {
      // expectedNumber订单数量 assembleGoodsList组合列表 isAssemble是否组合产品
      let { expectedNumber, assembleGoodsList, isAssemble } =
        this.formValidate.data[index] || {};
      if (
        !(
          isAssemble == 1 &&
          Array.isArray(assembleGoodsList) &&
          assembleGoodsList.length
        )
      ) { return; }
      assembleGoodsList.forEach((litem, lindex) => {
        let resultNum =
          new Big(litem.quantity || 0).times(expectedNumber || 0) - 0;
        this.$set(
          this.formValidate.data[index].assembleGoodsList[lindex],
          "expectedNumber",
          resultNum
        );
      });
    },
    // 库位值清除
    locationNameClear(index) {
      this.wareColumn.forEach((k) => {
        this.$set(this.formValidate.data[index], k, "");
      });
    },
    // 单个判断
    singleJudge(row, type) {
      let [flag, cancalData, assignData] = [false, ["1", "2"], ["0", "1"]];
      if (row.isAssemble == 1) {
        (row.assembleGoodsList || []).forEach((ak) => {
          if (type == "cancel") { cancalData.includes(ak.pickingDetailStatus) && (flag = true); } // 取消分配
          if (type == "assign") { assignData.includes(ak.pickingDetailStatus) && (flag = true); } // 分配库存
        });
      } else {
        if (type == "cancel") { cancalData.includes(row.pickingDetailStatus) && (flag = true); } // 取消分配
        if (type == "assign") { assignData.includes(row.pickingDetailStatus) && (flag = true); } // 分配库存
      }
      return flag;
    },
    printLabel(row) {
      if (this.isTemuSend) {
        this.sendTemp = row;
        this.sendVisible = true;
      } else {
        this.singleprintGood(row);
      }
    },
    temuSendReturn(form) {
      this.singleprintGood(this.sendTemp, form);
    },
    // 单个打印商品标签
    singleprintGood(data, temuForm) {
      let { pickingType, pickingAccount, pickingSubType, labelType, ymsMerchantId } = this.detailData || {};
      if (!pickingType) return this.$Message.error("出库单类型为空，请检查~");
      this.printData = [];

      let [_self, way, printData] = [this, null, this.$common.copy(data)];
      let fun = {
        // ef
        ef(printData) {
          let temp = Object.assign({}, printData);
          temp.platSku = "OC SKUID：" + temp.platSku;
          temp.goodsSku = "Seller SKUID：" + temp.goodsSku;
          temp.warehouseLocationName = "MADE IN China"; // 库位统一
          return Promise.resolve([temp]);
        },
        fba(printData) {
          if ([2, '2'].includes(labelType)) {
            let temp = Object.assign({}, printData);
            temp.platformSkuTitle = "SKU";//平台SKU标题
            temp.timesTitle = "Month & Year of importing:";//打标签时的年月标题
            temp.mrpTitle = "MRP(Inclusive of all Taxes)";//INR后的数值取MRP标题
            temp.originTitle = "Country of Origin:";//发源地标题
            temp.importerInfoTitle = "Importing By/Marketed By";//出口商信息标题
            temp.times = _self.$common.dayjs().format("MM/YYYY");//打标签时的年月
            temp.mrp = "INR " + (printData.mrp || '');//INR后的数值取MRP
            temp.origin = "China";//发源地
            // temp.fnCode = temp.platSku;
            // temp.platformSku = "LJ-2Z1H-NNDS";//平台SKU
            // temp.importerInfo = "Valuecart Private Limited 2nd Floor，1/1 Vinayaka Tower，1 st cross Gandhinagar，Bangalore,Karnataka 56 0009";//出口商信息
            // console.log(temp, 'temp');
            return Promise.resolve([temp]);
          } else {
            return fun.common(printData);
          }
        },
        // FBA，WFS，谷仓，SHL，万邑通
        common(printData) {
          let temp = Object.assign({}, printData);
          // // 调试
          // temp.ymsMerchantId = '09020412';
          // temp.ymsSupplierSku = 'KU-GB04-BLACK-LKU-GB04-BLACK-LKU-GB04-BLACK-LKISOJ';
          // temp.ymsProductSpec = '黑色.L';
          temp.warehouseLocationName = "Made in China";
          if (pickingType === "O9") {
            // shl账号
            temp.pickingAccount = pickingAccount;
          }
          return Promise.resolve([temp]);
        },
        // pickingSubType:0寄样;1备货;
        async temu() {
          if (pickingSubType == 1) {
            let temp = {};
            temp.platSkc = data.platSkc;
            // temp.goodSku = data.goodsSku;
            temp.goodsSku = data.goodsSku;
            temp.printNum = 1; // 默认一张
            return [temp];
          }
          let printList = [];
          let item = await _self.temuGetDetail(data.goodsSku); // 获取寄养标签信息
          item.printNum = 1; // 默认一张
          if (temuForm) {
            let { min, max } = temuForm;
            for (let i = min; i <= max; i++) {
              let temp = Object.assign({}, item);
              temp.sampleNum = "样品" + i;
              printList.push(temp);
            }
          }
          return printList;
        },
        // 艾姆勒
        aimule(printData) {
          let temp = Object.assign({}, printData);
          temp.productCode = pickingAccount + '-' + temp.platSku;
          temp.fnCode = temp.productCode;
          temp.printDate = _self.$common.dayjs().format('YYYY-MM-DD');
          return Promise.resolve([temp]);
        },
        // yms
        yms(printData) {
          let temp = Object.assign({}, printData);
          temp.ymsMerchantId = ymsMerchantId;
          return Promise.resolve([temp]);
        },
        'FBP-URAL'(printData) {
          let temp = Object.assign({}, printData);
          temp.merchantInfo = ymsMerchantId + '-' + data.platSku;
          temp.fnCode = temp.merchantInfo;
          temp.ural = window.location.origin + '/wms-service/static/images/ural.jpg';
          return Promise.resolve([temp]);
        },
      };
      // 标签格式略微不同
      if (pickingType === "O11") {
        way = fun["temu"];
      } else {
        printData.printNum = data.expectedNumber || 1;
        printData.fnCode = data.platSku;
        // if (
        //   ["O6", "O8", "O9", "O10", "O13", "O17", "O18", "O20"].includes(
        //     pickingType
        //   )
        // ) {
        //   way = fun["common"];
        // } else 
        if (pickingType === "O7") {
          way = fun["ef"];
        } else if (pickingType === "O19") {
          way = fun["aimule"];
        } else if (pickingType === "O5") {
          way = fun["fba"];
        } else if (pickingType === "O20") {
          way = fun["yms"];
        } else if (pickingType === "O21") {
          way = fun["FBP-URAL"];
        } else {
          way = fun["common"];
        }
      }
      // console.log(printData, 'printData');
      // return;
      this.productLoading = true;
      way(printData).then((list) => {
        this.printData = list;
        this.printModal = true;
      }).finally(() => {
        this.productLoading = false;
      });
    },
    // 谷仓/万邑通 打印
    barnPrint(temp) {
      let { pickingType, pickingAccount, pickingId } = this.detailData || {};
      let stockType = {
        O8: {
          requestType: "get",
          requestApi: `${api.printLabel}?count=${temp.printNum}&sku=${temp.platSku}&pickingAccount=${pickingAccount}`,
          requestData: "",
        },
        O10: {
          requestType: "post",
          requestApi: api.printWytLabel,
          requestData: [
            {
              printQty: temp.printNum,
              productCode: temp.goodsSku,
            },
          ],
        },
        O11: {
          requestType: "get",
          requestApi: `${api.printStockLabel}/${pickingId}?sku=${temp.goodsSku}&number=${temp.printNum}`,
          requestData: "",
        },
      };
      let sendData = stockType[pickingType];
      return new Promise((resolve, reject) => {
        this.productLoading = true;
        this.axios[sendData.requestType](
          sendData.requestApi,
          sendData.requestData
        )
          .then((res) => {
            let data = res.data || {};
            if (data.code === 0) {
              resolve(data.datas);
            } else {
              reject(new Error(false));
            }
          })
          .catch((err) => {
            reject(err);
          })
          .finally(() => {
            this.productLoading = false;
          });
      });
    },
    // 打印商品标签
    printGoodLabel(urlPath) {
      if (!urlPath) {
        this.$Message.error("无法打印，pdf路径为空!");
        return;
      }
      let prefix = "filenode/s/";
      let path = urlPath.indexOf(prefix) >= 0 ? urlPath : prefix + urlPath;
      let url = window.location.origin + "/wms-service/" + path;
      window.open("/wms-service/static/pdf/web/viewer.html?file=" + url);
    },
    // 链接打印
    linkPirntFun(val) {
      let temp = val[0] || {};
      this.barnPrint(temp).then((url) => {
        this.printGoodLabel(url);
      });
    },
    // temu获取寄样标签明细信息(goodsSku 扫描sku，如果不存在就是获取整单的寄样地址信息)
    temuGetDetail(goodsSku) {
      return new Promise((resolve) => {
        let { pickingId } = this.detailData;
        let [temp, sendSampleInfo] = [{}, this.sendSampleInfo];
        if (goodsSku) {
          let item = sendSampleInfo[goodsSku];
          // 已存在该sku的寄样标签信息
          if (item) return resolve(item);
          temp.goodsSku = goodsSku;
        } else {
          let item = sendSampleInfo[pickingId];
          if (item) return resolve(item); // 返回任一一条寄样地址信息
        }
        temp.pickingId = pickingId;
        this.axios
          .get(api.querySendLabelDetailInfo, { params: temp })
          .then(({ data }) => {
            if (!(data && data.code === 0)) return resolve({});
            let item = data.datas || {};
            if (goodsSku) {
              item.consigneeName1 = "收 " + item.consigneeName;
              item.sender1 = "寄 " + item.sender;
              item.goodsSku1 = "SKU货号 " + item.goodsSku;
              item.consigneeAddress1 =
                item.consigneeCity + item.consigneeAddress;
            }
            this.sendSampleInfo[goodsSku || temp.pickingId] = item;
            resolve(item);
          })
          .catch(() => {
            resolve({});
          });
      });
    },
    // 检验sku
    validateplatSku(rule, value, callback) {
      if ([null, "", undefined].includes(value)) { return callback(new Error("请输入")); }
      if (this.detailData.pickingType == "O13" && !this.docheck(value)) { return callback(new Error("格式不对!")); }
      callback();
    },
    docheck(code) {
      let i = code.length; // 得到字符长度
      if (i != 13) return false;
      let n = new Array(); // 初始化数组
      for (i == 0; i--;) {
        n[i] = parseInt(code.charAt(i)); // 数组赋值
      }
      let c1 = (n[1] + n[3] + n[5] + n[7] + n[9] + n[11]) * 3; // 双数之和*3 注意数组的第一位是【0】
      let c2 = (n[0] + n[2] + n[4] + n[6] + n[8] + n[10]) * 1; // 单数之和
      let c3 = (c1 + c2).toString(); // 相加后转换为字符串
      let c4 = c3.charAt(c3.length - 1); // 取得最后一位
      let n1 = 10 - c4; // 拿到校验码
      if (n1 == 10) {
        n1 = 0;
      } // 如果c4为0，效验码为0
      return n1 == n[12];
    },
  },
};
</script>
<style lang="less" scoped>
.add-products {
  .list-tit {
    font-size: 16px;
    padding: 15px 0;
  }

  .list-ico {
    font-size: 18px;
    cursor: pointer;
  }

  .desc-div {
    line-height: 18px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  :deep(.product-form) {
    .ivu-form-item-content {
      line-height: 20px;
    }

    .ivu-form-item {
      margin-bottom: 0;
    }
  }
}
</style>
