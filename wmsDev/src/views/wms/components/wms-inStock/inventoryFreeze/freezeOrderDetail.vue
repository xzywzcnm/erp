<template>
  <dyt-model
    :modalVisible.sync="modalVisible"
    @backList="backLists"
    :pageLoading="pageLoading"
    class="freezeOrderDetailPage"
  >
    <div slot="lefts">
      <Button type="primary" @click="createFrozenOrderBtn" v-if="isAdd"
        >创建库存冻结单</Button
      >
      <template v-if="!isAdd">
        <Button
          type="primary"
          @click="unfreezeBtn"
          v-if="[2, '2', 3, '3'].includes(frozenOrderData.frozenStatus)"
          :disabled="freezeDisabled"
          class="mr10"
          >解除冻结</Button
        >
        <Button
          type="primary"
          @click="frozenPassBtn"
          :disabled="!getPermission('wmsInventoryFrozen_modifyImplement')"
          v-if="[1, '1'].includes(frozenOrderData.frozenStatus)"
          class="mr10"
          >执行冻结单</Button
        >
        <Tooltip
          placement="top"
          content="若表格无数据，则保存后会删除该冻结单！"
          max-width="400"
          transfer
        >
          <Button
            type="primary"
            @click="saveFrozenOrderBtn"
            :disabled="!getPermission('wmsInventoryFrozen_modify')"
            v-if="[1, '1'].includes(frozenOrderData.frozenStatus)"
            :loading="saveLoading"
            >保存</Button
          >
        </Tooltip>
      </template>

      <Button class="ml10" @click="backLists">取消</Button>
    </div>
    <div class="mt10 formDetail">
      <Form
        ref="formData"
        :model="formData"
        :rules="ruleValidate"
        :label-width="100"
        inline
      >
        <div v-if="isAdd" class="fmb18">
          <div class="formWidth240">
            <Form-item label="冻结单号：">
              <span>创建后自动生成</span>
            </Form-item>
            <Form-item label="冻结方式：">
              <span>人工冻结</span>
            </Form-item>
            <Form-item label="创建人：">
              <span>{{
                $store.getters.authUserInfo &&
                $store.getters.authUserInfo.securityUser &&
                $store.getters.authUserInfo.securityUser.name
              }}</span>
            </Form-item>
          </div>
          <div class="autoLong">
            <FormItem label="冻结天数：" prop="frozenDay">
              <Input
                v-model.trim="formData.frozenDay"
                style="width: 100px"
              ></Input>
              <span class="ml10"
                >提示：执行冻结的天数到达冻结天数后，冻结单将自动解冻，释放库存；最大冻结天数为：30天；</span
              >
            </FormItem>
          </div>
          <div class="autoLong">
            <FormItem label="备注：" prop="remark">
              <Input
                type="textarea"
                placeholder="填写备注"
                v-model.trim="formData.remark"
                style="width: 400px"
              ></Input>
            </FormItem>
          </div>
        </div>
        <div class="formWidth240 fmb0 mb20" v-else>
          <div>
            <Form-item label="冻结单号：">
              <span>{{ frozenOrderData.inventoryFrozenNo }}</span>
            </Form-item>
            <Form-item label="状态：">
              <span
                style="color: green"
                v-if="statusList[frozenOrderData.frozenStatus]"
                >{{ statusList[frozenOrderData.frozenStatus].label }}</span
              >
            </Form-item>
            <Form-item label="选择仓库：">
              <span>{{ frozenOrderData.warehouseName }}</span>
            </Form-item>
            <Form-item label="冻结方式：">
              <span v-if="frozenTypeList[frozenOrderData.frozenType]">{{
                frozenTypeList[frozenOrderData.frozenType].label
              }}</span>
            </Form-item>
            <FormItem label="冻结天数：">
              <span>{{ frozenOrderData.frozenDay || 0 }}</span>
            </FormItem>
            <Form-item label="已冻天数：">
              <span>{{ frozenOrderData.alreadyFrozenDay || 0 }}</span>
            </Form-item>
            <Form-item label="剩余天数：">
              <span>{{ frozenOrderData.surplusFrozenDay || 0 }}</span>
            </Form-item>
          </div>
          <Form-item label="创建人：">
            <span v-if="frozenOrderData.createdBy">{{
              returnUserName(frozenOrderData.createdBy)
            }}</span>
          </Form-item>
          <Form-item label="创建时间：">
            <span v-if="frozenOrderData.createdTime">{{
              $uDate.dealTime(frozenOrderData.createdTime)
            }}</span>
          </Form-item>
          <Form-item label="冻结人：">
            <span v-if="frozenOrderData.frozenBy">{{
              returnUserName(frozenOrderData.frozenBy)
            }}</span>
          </Form-item>
          <Form-item label="冻结时间：">
            <span v-if="frozenOrderData.frozenTime">{{
              $uDate.dealTime(frozenOrderData.frozenTime)
            }}</span>
          </Form-item>
          <Form-item label="解冻人：">
            <span v-if="frozenOrderData.thawBy">{{
              returnUserName(frozenOrderData.thawBy)
            }}</span>
          </Form-item>
          <Form-item label="解冻时间：">
            <span v-if="frozenOrderData.thawTime">{{
              $uDate.dealTime(frozenOrderData.thawTime)
            }}</span>
          </Form-item>
          <Form-item label="入库单号：">
            <span>{{ frozenOrderData.receiptNo }}</span>
          </Form-item>
          <Form-item label="事业部：">
            <span v-if="frozenOrderData.businessDeptId">{{
              returnBussniss(frozenOrderData.businessDeptId)
            }}</span>
          </Form-item>
          <Form-item label="采购单号：">
            <span>{{ frozenOrderData.purchaseNo }}</span>
          </Form-item>
          <Form-item label="采购人：">
            <span v-if="frozenOrderData.purchaseBy">{{
              returnUserName(frozenOrderData.purchaseBy)
            }}</span>
          </Form-item>
          <Form-item label="备货计划：">
            <span>{{ frozenOrderData.planNo }}</span>
          </Form-item>
          <Form-item label="计划人：">
            <span v-if="frozenOrderData.planBy">{{
              returnUserName(frozenOrderData.planBy)
            }}</span>
          </Form-item>
          <div class="autoLong">
            <FormItem label="备注：" prop="remark">
              <Input
                type="textarea"
                placeholder="填写备注"
                v-model.trim="formData.remark"
                style="width: 400px"
                v-if="[1, '1'].includes(frozenOrderData.frozenStatus)"
              ></Input>
              <span v-else>{{ frozenOrderData.remark }}</span>
            </FormItem>
          </div>
        </div>
      </Form>

      <h3 class="mb10">明细信息</h3>
      <div v-if="isAdd || [1, '1'].includes(frozenOrderData.frozenStatus)">
        <Button type="primary" @click="showAddProductModal" class="mr10"
          >添加货品</Button
        >
        <Button type="error" @click="deleteProductBtn">移除货品</Button>
        <Alert style="display: inline-block; padding: 8px; margin: 0 0 0 10px">
          提示：1、创建库存冻结单之前，请先添加货品！2、在添加货品前，请先选择仓库！3、修改表格数据之后，请记得点保存！4、执行冻结后，不能再进行添加、删除、修改！
        </Alert>
      </div>
      <div
        style="text-align: right"
        v-if="!isAdd && [2, '2', 3, '3'].includes(frozenOrderData.frozenStatus)"
      >
        <Button @click="thawAmount('max')" class="mr10"
          >解冻量值设为最大</Button
        >
        <Button @click="thawAmount('min')">解冻量值设为0</Button>
      </div>
      <div class="mt10">
        <Table
          highlight-row
          border
          :columns="columns"
          :data="
            tableList.slice(
              (pageParams.pageNum - 1) * pageParams.pageSize,
              pageParams.pageNum * pageParams.pageSize
            )
          "
          ref="selection"
          @on-selection-change="selectFrozenDataBtn"
        ></Table>
        <div class="pagesMain">
          <Page
            :total="pageParams.totalRecords"
            :current="pageParams.pageNum"
            @on-change="changePage"
            show-total
            :page-size="pageParams.pageSize"
            show-elevator
            show-sizer
            @on-page-size-change="changePageSize"
            placement="top"
            :page-size-opts="pageArray"
          ></Page>
        </div>
      </div>
    </div>

    <!-- 新建货品模态框 -->
    <div v-if="addNewProductModal">
      <Modal
        v-model="addNewProductModal"
        title="选择冻结的产品"
        class="headerBar addProductBar"
        :styles="{ top: '80px', width: '1500px' }"
      >
        <div class="content">
          <addProduct
            :categoryOption="false"
            @addProductSuccess="addProductSuccess"
            @addProductCancel="addProductCancel"
            :wareId="wareId"
            :eliminateData="tableList"
          ></addProduct>
        </div>
        <!-- <div slot="footer">
          <Button type="primary" @click="addNewProduct">确认添加货品</Button>
          <Button @click="cancelButton">取消</Button>
        </div> -->
      </Modal>
    </div>
  </dyt-model>
</template>
<script>
import Big from "big.js";
import api from "@/api/api";
import { statusList, frozenTypeList } from "./fileData.js";
import addProduct from "../newAddProduct";
import { getWarehouseId } from "@/utils/getService";
import permission_mixin from "@/components/mixin/permission_mixin";
const pageParams = {
  pageNum: 1,
  pageSize: 10,
  totalRecords: 0, // 总条数
};
export default {
  components: { addProduct },
  mixins: [permission_mixin],
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    dialogData: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    let v = this;
    return {
      pageArray: [10, 20, 50, 100],
      wareId: getWarehouseId(), // 选择的仓库id
      modalVisible: false,
      pageLoading: false,
      frozenTypeList,
      frozenOrderData: {}, // 创建冻结单成功之后返回的数据
      formData: {
        frozenDay: "",
        remark: "",
        frozenType: 1, // 冻结方式：(0:自动，1:人工)
        warehouseId: getWarehouseId(),
      },
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        totalRecords: 0, // 总条数
      },
      ruleValidate: {
        frozenDay: [
          { required: true, validator: v.validFrozenDay, trigger: "blur" },
        ],
      },
      addNewProductModal: false, // 新增货品模态框
      selectFrozenTableList: [], // 勾选的表格数据
      tableList: [],
      deTableList: [],
      statusList: v.$common.arrayToObj(
        statusList.filter((k) => !v.$common.isEmpty(k))
      ),
      backEmitList: false, //返回列表是否刷新
      saveLoading: false,
    };
  },
  watch: {
    dialogVisible: {
      handler(nval, oval) {
        nval && this.open();
      },
      deep: true,
    },
    modalVisible: {
      handler(nval, oval) {
        !nval && this.$emit("update:dialogVisible", nval);
      },
      deep: true,
    },
  },
  computed: {
    isAdd() {
      return !!!this.dialogData.inventoryFrozenId;
    },
    columns() {
      let v = this;
      let list = {
        selection: {
          type: "selection",
          width: 60,
          align: "center",
        },
        goodsUrl: {
          title: "图片",
          width: 82,
          align: "center",
          render: (h, params) => {
            return v.tableImg(h, params, "goodsUrl");
          },
        },
        goodsSku: {
          title: "SKU",
          key: "goodsSku",
          align: "center",
          minWidth: 90,
        },
        receiptBatchNo: {
          title: "批次号",
          key: "receiptBatchNo",
          align: "center",
          minWidth: 100,
        },
        warehouseLocationName: {
          title: "库位",
          key: "warehouseLocationName",
          align: "center",
          minWidth: 90,
        },
        desc: {
          title: "中英文描述",
          align: "center",
          minWidth: 130,
          render: (h, { row }) => {
            return h("div", [
              h("div", row.goodsCnDesc || "-"),
              h("div", row.goodsEnDesc || "-"),
            ]);
          },
        },
        inventoryNumber: {
          title: "原库存数量",
          key: "oriInventoryNumber",
          align: "center",
          width: 100,
        },
        allottedNumber: {
          title: "原分配数量",
          key: "oriAllottedNumber",
          align: "center",
          width: 100,
        },
        frozenNumber: {
          title: "原冻结数量",
          key: "oriFrozenNumber",
          align: "center",
          width: 100,
        },
        availableNumber: {
          title: "原可用数量",
          key: "oriUsableNumber",
          align: "center",
          width: 100,
        },
        frozenInventoryNumber: {
          title: "本次冻结数量",
          key: "frozenInventoryNumber",
          align: "center",
          width: 110,
          render: (h, params) => {
            return h("div", [
              h("InputNumber", {
                props: {
                  size: "small",
                  min: 0,
                  max: params.row.oriUsableNumber,
                  value: params.row.frozenInventoryNumber,
                },
                style: {
                  marginRight: "5px",
                },
                on: {
                  "on-change": (value) => {
                    let { pageNum, pageSize } = v.pageParams;
                    let num = (pageNum - 1) * pageSize;
                    let index = num + params.index;
                    v.$set(v.tableList[index], "frozenInventoryNumber", value);
                  },
                },
              }),
            ]);
          },
        },
        action: {
          title: "操作",
          key: "action",
          align: "center",
          width: 100,
          render: (h, params) => {
            return h(
              "Poptip",
              {
                props: {
                  confirm: true,
                  title:
                    "您确定要删除这条数据吗？确认删除之后记得点击保存按钮！",
                  transfer: true,
                },
                style: {
                  margin: "0 -18px",
                },
                on: {
                  "on-ok": () => {
                    v.tableList.splice(params.index, 1);
                  },
                },
              },
              [
                h(
                  "Button",
                  {
                    props: {
                      type: "error",
                      placement: "top",
                    },
                  },
                  "删除"
                ),
              ]
            );
          },
        },
        frozenAllNumber: {
          title: "冻结数量",
          key: "frozenInventoryNumber",
          align: "center",
          width: 100,
        },
        thawNumber: {
          title: "已解冻数量",
          key: "thawNumber",
          align: "center",
          width: 100,
        },
        unThawNumber: {
          title: "本次解冻数量",
          key: "unThawNumber",
          align: "center",
          width: 110,
          render: (h, params) => {
            return h("div", [
              h("InputNumber", {
                props: {
                  size: "small",
                  min: 0,
                  max: params.row.CopyUnThawNumber,
                  value: params.row.unThawNumber,
                },
                style: {
                  marginRight: "5px",
                },
                on: {
                  "on-change": (value) => {
                    let { pageNum, pageSize } = v.pageParams;
                    let num = (pageNum - 1) * pageSize;
                    let index = num + params.index;
                    v.$set(v.tableList[index], "unThawNumber", value);
                  },
                },
              }),
            ]);
          },
        },
        surplusThawNumber: {
          title: "未解冻数量",
          key: "surplusThawNumber",
          align: "center",
          width: 100,
        },
      };
      let commonHead = [
        "goodsUrl",
        "goodsSku",
        "receiptBatchNo",
        "warehouseLocationName",
        "desc",
        "inventoryNumber",
        "allottedNumber",
        "frozenNumber",
        "availableNumber",
      ];
      let allHead = [];
      let frozenOrderData = this.frozenOrderData;
      if (this.isAdd || [1, "1"].includes(frozenOrderData.frozenStatus)) {
        allHead = [
          "selection",
          ...commonHead,
          "frozenInventoryNumber",
          "action",
        ];
      } else {
        if ([2, "2", 3, "3"].includes(frozenOrderData.frozenStatus)) {
          allHead = [
            ...commonHead,
            "frozenAllNumber",
            "thawNumber",
            "unThawNumber",
          ];
        } else {
          allHead = [
            ...commonHead,
            "frozenAllNumber",
            "thawNumber",
            "surplusThawNumber",
          ];
        }
      }
      let columns = allHead.map((key) => list[key]);
      return columns;
    },
    freezeDisabled() {
      return !!!this.tableList.filter((k) => k.unThawNumber > 0).length;
    },
  },
  methods: {
    reset() {
      const formData = {
        frozenDay: "",
        remark: "",
        frozenType: 1, // 冻结方式：(0:自动，1:人工)
        warehouseId: getWarehouseId(),
      };
      this.formData = this.$common.copy(formData);
      this.tableList = [];
      this.deTableList = [];
      this.selectFrozenTableList = [];
      this.frozenOrderData = {};
      this.pageParams = this.$common.copy(pageParams);
    },
    // 窗口打开
    open() {
      this.reset();
      this.modalVisible = true;
      if (!this.isAdd) {
        this.searchData();
      }
    },
    // 关闭窗口
    backLists() {
      this.modalVisible = false;
      if (!this.backEmitList) return;
      this.$emit("search");
    },
    validFrozenDay(rule, value, callback) {
      if (["", null, undefined].includes(value)) {
        callback(new Error("必填~"));
        return;
      }
      if (!/^([1-9]|[1-2]\d|30)$/.test(value)) {
        callback(new Error("限大于或等于1，小于或等于30的正整数"));
        return;
      }
      callback();
    },
    // 页面查询
    searchData() {
      let { inventoryFrozenNo } = this.dialogData;
      this.pageLoading = true;
      this.axios
        .post(api.get_frozenDetailData, { inventoryFrozenNo })
        .then(({ data }) => {
          if (data.code === 0) {
            let totalData = data.datas || {};

            let list = totalData.wmsInventoryFrozenSku
              ? totalData.wmsInventoryFrozenSku.list
              : [];
            this.tableList = list.map((k) => {
              // 本次解冻商品数量：最大解冻数量=冻结数量-已解冻数量；
              let unThawNumber =
                new Big(k.frozenInventoryNumber || 0).minus(k.thawNumber || 0) -
                0;
              k.CopyUnThawNumber = unThawNumber;
              k.unThawNumber = unThawNumber;
              return k;
            });
            this.frozenOrderData = data.datas || {};
            this.frozenOrderData = Object.assign(
              {},
              this.dialogData,
              { warehouseName: totalData.warehouseName },
              totalData.wmsInventoryFrozen || {}
            );
            this.formData.remark = this.frozenOrderData.remark;
            this.deTableList = this.$common.copy(this.tableList);
            this.pageParams.totalRecords = this.tableList.length;
          }
        })
        .finally(() => {
          this.pageLoading = false;
        });
    },
    changePageSize(pageSize) {
      this.pageParams.pageSize = pageSize;
    },
    // 表格分页
    changePage(page) {
      this.pageParams.pageNum = page;
    },
    // 添加货品模态框
    showAddProductModal() {
      this.addNewProductModal = true;
    },
    // 添加商品关闭
    addProductCancel() {
      this.addNewProductModal = false;
    },
    // 添加商品完成
    addProductSuccess(data) {
      this.addProductCancel();
      data.forEach((item) => {
        let num = item.availableNumber || 0;
        item.frozenInventoryNumber = num <= 0 ? 0 : num; // 本次冻结数量
        item.oriAllottedNumber = item.allottedNumber || 0; //原分配数量
        item.oriFrozenNumber = item.frozenNumber || 0; // 冻结数量
        item.oriInventoryNumber = item.inventoryNumber || 0; // 库存数量
        item.oriUsableNumber = item.availableNumber || 0; // 可用数量
      });
      this.tableList = this.tableList.concat(data);
      this.pageParams.totalRecords = this.tableList.length;
    },
    // 批量删除表格行
    deleteProductBtn() {
      let list = this.selectFrozenTableList.map((k) => k.productGoodsId);
      if (!list.length) {
        this.$Message.info("请勾选你要删除的货品");
        return;
      }
      this.tableList = this.tableList.filter(
        (k) => !list.includes(k.productGoodsId)
      );
      this.$Message.success("成功删除选中的货品");
      this.selectFrozenTableList = [];
    },
    // 勾选的表格数据
    selectFrozenDataBtn(data) {
      this.selectFrozenTableList = data;
    },
    // 创建库存冻结单
    createFrozenOrderBtn() {
      this.$refs["formData"].validate((valid) => {
        if (!valid) return;
        let tableList = this.tableList;
        if (!tableList.length) {
          this.$Message.warning("请添加要冻结的商品！");
          return;
        }
        if (!this.frozenValidFn()) return;
        var obj = {
          wmsInventoryFrozen: this.formData, // 仓库和备注信息
          wmsInventoryFrozenDetail: tableList,
        };
        this.axios.post(api.createFrozenOrder, obj).then((res) => {
          if (res.data.code === 0) {
            this.$Message.success("创建库存冻结单成功");
            this.modalVisible = false;
            this.$emit("search");
          } else {
            this.$Message.warning("创建库存冻结单失败");
          }
        });
      });
    },
    // 修改保存按钮
    saveFrozenOrderBtn() {
      let frozenOrderData = this.frozenOrderData;
      let tableList = this.tableList;
      let tableIds = tableList
        .map((k) => k.inventoryFrozenDetailId)
        .filter((k) => k);
      let removeList = this.deTableList
        .filter((k) => {
          return !tableIds.includes(k.inventoryFrozenDetailId);
        })
        .map((k) => k.inventoryFrozenDetailId);
      let obj = {
        frozenStatus: frozenOrderData.frozenStatus,
        inventoryFrozenNo: frozenOrderData.inventoryFrozenNo,
        inventoryFrozenId: frozenOrderData.inventoryFrozenId,
        frozenSkuNum: tableList.length,
        remark: this.formData.remark,
        warehouseId: this.formData.warehouseId,
        removeList: removeList, // 删除的表格
        wmsInventoryFrozenDetail: tableList,
      };
      // console.log(removeList, obj);
      if (!this.frozenValidFn()) return;
      this.saveLoading = true;
      this.axios
        .post(api.modifyFrozenOrder, obj)
        .then((res) => {
          if (res.data.code === 0) {
            this.searchData();
            this.$Message.success("保存成功");
            this.backEmitList = true;
          } else {
            this.$Message.warning("保存失败");
          }
        })
        .finally(() => {
          this.saveLoading = false;
        });
    },
    // 库存冻结校验
    frozenValidFn() {
      let v = this;
      let valid = true;
      for (let i = 0; i < this.tableList.length; i++) {
        if (v.tableList[i].frozenInventoryNumber === null) {
          v.$Message.warning({
            content: "本次冻结数量不能为空",
            duration: 5,
          });
          valid = false;
          return;
        }
        if (v.tableList[i].frozenInventoryNumber <= 0) {
          v.$Message.warning({
            content: "冻结数量不能小于等于0",
            duration: 5,
          });
          valid = false;
          return;
        }
        var re = v.$regular.AllNumber;
        if (!re.test(v.tableList[i].frozenInventoryNumber)) {
          v.$Message.warning({
            content: "冻结数量不能为小数",
            duration: 5,
          });
          valid = false;
          return;
        }
        if (
          v.tableList[i].frozenInventoryNumber > v.tableList[i].availableNumber
        ) {
          v.$Message.warning({
            content: "冻结数量不能大于当前产品的原可用数量",
            duration: 5,
          });
          valid = false;
          return;
        }
      }
      return valid;
    },
    // 执行冻结单按钮
    frozenPassBtn() {
      let { inventoryFrozenNo } = this.frozenOrderData;
      this.$Modal.confirm({
        width: 550,
        title: `确认是否要执行冻结冻结单：<span style="color:#FF9900;">${inventoryFrozenNo}</span>`,
        loading: true,
        onOk: () => {
          this.axios
            .get(api.carryFrozenOrder, { params: { inventoryFrozenNo } })
            .then((res) => {
              if (res.data.code === 0) {
                this.$Message.success("库存冻结成功！");
                this.searchData();
                this.backEmitList = true;
              } else if (res.data.code === -1) {
                this.$Message.error(
                  "执行冻结失败，当前有产品正处于盘点状态不能执行冻结单！"
                );
              } else if (res.data.code === 1) {
                this.$Message.error("冻结失败，可用库存不能小于0");
              }
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
      });
    },
    // 解除冻结
    unfreezeBtn() {
      let { inventoryFrozenNo } = this.frozenOrderData;
      let sum = this.tableList.reduce((prev, cur, index, arr) => {
        return Number(cur.unThawNumber || 0) + prev;
      }, 0);
      this.$Modal.confirm({
        width: 550,
        title: `<p style="margin-top:16px;">确认是否要解除冻结单：<span style="color:#FF9900;">${inventoryFrozenNo}</span></p>
        <p style="color:red;font-size: 12px;margin-top:6px;">本次解冻数量：${sum}</p>`,
        loading: true,
        onOk: () => {
          let list = [];
          this.tableList.forEach((k) => {
            if (k.unThawNumber > 0) {
              list.push({
                inventoryFrozenNo,
                inventoryFrozenDetailId: k.inventoryFrozenDetailId,
                unfreezeInventoryNumber: k.unThawNumber,
              });
            }
          });
          // console.log(list);
          this.axios
            .post(api.newBatchCancelFrozen, list)
            .then((res) => {
              if (res.data.code === 0) {
                this.$Message.success("操作成功");
                this.searchData();
                this.backEmitList = true;
              }
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
      });
    },
    // 图片处理
    tableImg(h, params, imgKey, imageUrl) {
      let v = this;
      let imgUrl = imageUrl || params.row[imgKey];
      return h(
        "Poptip",
        {
          props: {
            placement: "right",
            trigger: "hover",
            transfer: true,
          },
          style: {
            width: "46px",
            height: "46px",
            objectFit: "cover",
            verticalAlign: "middle",
          },
        },
        [
          h("div", {}, [
            h("img", {
              attrs: {
                src: imageUrl
                  ? imgUrl
                  : !imgUrl
                  ? "./static/images/placeholder.jpg"
                  : v.$store.state.imgUrlPrefix + imgUrl,
                onerror:
                  "javascript:this.src='./static/images/placeholder.jpg'",
              },
              style: {
                width: "46px",
                height: "46px",
                objectFit: "cover",
                verticalAlign: "middle",
                cursor: "pointer",
              },
            }),
          ]),
          !imgUrl ||
            h("img", {
              slot: "content",
              props: {},
              attrs: {
                src: imageUrl
                  ? imgUrl
                  : !imgUrl
                  ? "./static/images/placeholder.jpg"
                  : v.$store.state.imgUrlPrefix + imgUrl,
              },
              style: {
                width: "400px",
                height: "auto",
                verticalAlign: "middle",
              },
            }),
        ]
      );
    },
    returnBussniss(businessDeptId) {
      let businessDeptList = this.$store.getters.getBusinessDeptList || [];
      let list = this.$common.arrayToObj(businessDeptList, "id");
      let item = list[businessDeptId] || {};
      return item.name || businessDeptId;
    },
    returnUserName(userId) {
      let userList = this.$store.getters.userInfoList || {};
      let list = this.$common.arrayToObj(userList, "userId");
      let item = list[userId] || {};
      return item.userName || userId;
    },
    thawAmount(type) {
      // let { pageNum, pageSize } = this.pageParams;
      // let num = (pageNum - 1) * pageSize;
      // for (let i = 0; i < pageSize; i++) {
      //   let index = num + i;
      //   if (!this.tableList[index]) break;
      //   let val = type === "max" ? this.tableList[index].CopyUnThawNumber : 0;
      //   this.$set(this.tableList[index], "unThawNumber", val);
      // }
      this.tableList.forEach((k, i) => {
        let val = type === "max" ? k.CopyUnThawNumber : 0;
        this.$set(this.tableList[i], "unThawNumber", val);
      });
    },
  },
};
</script>
<style lang="less">
.freezeOrderDetailPage {
  .ivu-form .ivu-form-item-label {
    font-size: 14px;
  }
}
</style>
