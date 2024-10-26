<template >
  <div>
    <!--返回列表按钮-->
    <div class="addBinding" style="margin-bottom: 10px">
      <Icon type="ios-arrow-back"></Icon>
      <a @click="backPage">返回列表</a>
    </div>
    <div class="dataSort grayBg">
      <h3>基本信息</h3>
    </div>
    <div
      style="
        background-color: #fff;
        margin: 0 10px 0 10px;
        padding: 10px 0 0 10px;
      "
    >
      <Form
        ref="pageParams"
        :model="pageParams"
        label-position="right"
        :label-width="90"
        :rules="ruleValidate"
      >
        <Row v-show="isShowNoAndStatus">
          <Col span="5">
            <Form-item label="冻结单号：">
              <span>{{ frozenOrderData.inventoryFrozenNo }}</span>
            </Form-item>
          </Col>
          <Col span="5">
            <Form-item label="状态：">
              <!-- frozenStatus 冻结状态(0已解冻1待执行2以执行) -->
              <span style="color: green" v-if="showStatus.frozenStatus === '0'"
                >已解冻</span
              >
              <span style="color: green" v-if="showStatus.frozenStatus === '1'"
                >待执行</span
              >
              <span style="color: green" v-if="showStatus.frozenStatus === '2'"
                >已执行</span
              >
            </Form-item>
          </Col>
        </Row>
        <Row>
          <Col span="6">
            <FormItem label="备注：">
              <Input
                type="textarea"
                :autosize="{ minRows: 5, maxRows: 6 }"
                placeholder="填写备注"
                v-model.trim="pageParams.remark"
                :disabled="$store.state.adjustDetailTableShow === 'isChecked'"
              ></Input>
            </FormItem>
          </Col>
        </Row>
      </Form>
    </div>
    <div class="dataSort grayBg">
      <h3>明细信息</h3>
    </div>
    <!-- 添加货品和删除货品按钮 -->
    <div class="addBinding" v-show="isShowBtn">
      <Button type="primary" icon="md-add" @click="showAddProductModal"
        >添加货品</Button
      >
      <Button
        style="marginleft: 10px"
        type="error"
        icon="md-trash"
        @click="
          deleteProductBtn(selectFrozenTableList, allSelectFrozenTableList)
        "
        >移除货品</Button
      >
    </div>
    <!-- 待审核表格 -->
    <div
      class="shopTable"
      v-if="$store.state.adjustDetailTableShow === 'noCheck'"
    >
      <!--表格-->
      <Table
        highlight-row
        border
        :columns="columns6"
        :data="data6"
        ref="selection"
        @on-selection-change="selectFrozenDataBtn"
        @on-select-all="allSelectFrozenBtn"
      ></Table>
      <!--分页按钮-->
      <div class="table-page">
        <div class="table-page-right">
          <Page
            :total="totalRecords"
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
    <!-- 已审核表格 -->
    <div
      class="shopTable"
      v-if="$store.state.adjustDetailTableShow === 'isChecked'"
    >
      <!--表格-->
      <Table highlight-row border :columns="columns7" :data="data7"></Table>
      <!--分页按钮-->
      <div class="table-page">
        <div class="table-page-right">
          <Page
            :total="totalRecords"
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
    <!-- 创建冻结单和取消按钮 -->
    <div class="addBinding" style="margin-top: 80px; text-align: center">
      <!-- 创建冻结单 -->
      <Button
        type="primary"
        style="margin-right: 50px"
        @click="createFrozenOrderBtn"
        v-if="isCreateShow"
        >创建库存冻结单</Button
      >
      <!-- 审核通过 -->
      <Button
        type="primary"
        style="margin-right: 50px"
        v-if="isCheckShow"
        @click="checkPassBtn"
        :disabled="!getPermission('wmsInventoryFrozen_approve')"
        >审核通过</Button
      >
      <!-- 执行冻结单 -->
      <Button
        type="primary"
        style="margin-right: 50px"
        v-show="isAdjustShow"
        @click="frozenPassBtn"
        :disabled="!getPermission('wmsInventoryFrozen_modifyImplement')"
        >执行冻结单</Button
      >
      <!-- 解除冻结  按钮还没加权限-->
      <Button
        type="primary"
        style="margin-right: 50px"
        v-show="isUnfreezeShow"
        @click="unfreezeBtn"
        >解除冻结</Button
      >
      <!-- 保存 -->
      <Button
        type="primary"
        style="margin-right: 50px"
        @click="saveFrozenOrderBtn"
        icon="md-checkmark"
        v-if="isShow"
        :disabled="!getPermission('wmsInventoryFrozen_modify')"
        >保存</Button
      >
      <!-- 返回列表 -->
      <Button type="default" icon="md-close" @click="cancelcreateFrozenOrderBtn"
        >返回列表</Button
      >
    </div>
    <div class="addBinding" style="display: inline-block">
      <Affix :offset-bottom="10">
        <Alert show-icon style="width: 355px">
          <p>温馨提示：</p>
          <p>1、创建库存冻结单之前，请先添加货品！</p>
          <p>2、在添加货品之前，请先选择仓库！</p>
          <p>3、修改表格数据之后，请记得点保存！</p>
          <p>4、审核通过后，不能再进行添加、删除、修改！</p>
        </Alert>
      </Affix>
    </div>
    <!-- 新建货品模态框 -->
    <div v-if="addNewProductModal">
      <Modal
        v-model="addNewProductModal"
        :title="frozenProductModalTitle"
        :styles="{ top: '80px', width: '1500px' }"
        class="headerBar addProductBar"
      >
        <div class="content">
          <addProduct
            :categoryOption="false"
            @addProductSuccess="addProductSuccess"
            @addProductCancel="addProductCancel"
            :wareId="wareId"
            :eliminateData="data6"
          ></addProduct>
        </div>
        <div slot="footer">
          <Button type="primary" @click="addNewProduct">确认添加货品</Button>
          <Button @click="cancelButton">取消</Button>
        </div>
      </Modal>
    </div>
  </div>
</template>
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import addProduct from "./newAddProduct";

export default {
  mixins: [Mixin],
  components: {
    addProduct: addProduct,
  },
  data: function () {
    var self = this;
    return {
      isShowNoAndStatus: false, // 单号和状态隐藏
      isShowSelect: true, // 选择收货仓库默认显示
      isShowBtn: true, // 添加货品和删除货品按钮默认显示
      isCreateShow: true, // 创建库存冻结单按钮默认显示
      isShow: false, // 保存按钮默认隐藏
      isCheckShow: false, // 审核按钮默认隐藏，现在没有审核通过操作了
      isAdjustShow: false, // 执行冻结单按钮隐藏
      isUnfreezeShow: false, // 解除冻结按钮
      pageParams: {
        remark: "", // 填写备注
        pageNum: 1,
        pageSize: 10,
      },
      ruleValidate: {
        // warehouseId: [
        //  { required: true, message: '仓库不能为空，请选择仓库', trigger: 'change' }
        // ]
      },
      totalRecords: 0, // 总条数
      wareId: this.getWarehouseId(), // 选择的仓库id
      userSelectTable: [], // 用户选择的表格数组集合
      wareHouseTypeList: [], // 仓库选择列表
      addNewProductModal: false, // 新增货品模态框
      frozenProductModalTitle: "选择冻结的产品",
      columns6: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "图片",
          key: "goodsUrl",
          width: 100,
          align: "center",
          render: (h, params) => {
            return this.tableImg(h, params, "goodsUrl");
          },
        },
        {
          title: "SKU",
          key: "goodsSku",
          align: "center",
        },
        {
          title: "批次号",
          key: "receiptBatchNo",
          align: "center",
        },
        {
          title: "库位",
          key: "warehouseLocationName",
          align: "center",
        },
        {
          title: "中文描述",
          key: "goodsCnDesc",
          align: "center",
        },
        {
          title: "英文描述",
          key: "goodsEnDesc",
          align: "center",
        },
        {
          title: "原库存数量",
          key: "oriInventoryNumber",
          align: "center",
        },
        {
          title: "原分配数量",
          key: "oriAllottedNumber",
          align: "center",
        },
        {
          title: "原冻结数量",
          key: "oriFrozenNumber",
          align: "center",
        },
        {
          title: "原可用数量",
          key: "oriUsableNumber",
          align: "center",
        },
        {
          title: "本次冻结数量",
          key: "frozenInventoryNumber",
          align: "center",
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
                    self.data6[params.index] = params.row;
                    params.row.frozenInventoryNumber = value;
                    if (self.showStatus.frozenStatus === "1") {
                      self.changeFrozenNumList.push(self.data6[params.index]);
                    }
                  },
                },
              }),
            ]);
          },
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 150,
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
                on: {
                  "on-ok": () => {
                    this.removeProduct(
                      params.index,
                      this.data6[params.index].inventoryFrozenDetailId
                    );
                  },
                },
              },
              [
                h(
                  "Button",
                  {
                    style: {
                      margin: "0 5px",
                    },
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
      ],
      data6: [], // 审核通过表格
      columns7: [
        {
          title: "图片",
          key: "goodsUrl",
          width: 100,
          align: "center",
          render: (h, params) => {
            return this.tableImg(h, params, "goodsUrl");
          },
        },
        {
          title: "SKU",
          key: "goodsSku",
          align: "center",
        },
        {
          title: "批次号",
          key: "receiptBatchNo",
          align: "center",
        },
        {
          title: "库位",
          key: "warehouseLocationName",
          align: "center",
        },
        {
          title: "中文描述",
          key: "goodsCnDesc",
          align: "center",
        },
        {
          title: "英文描述",
          key: "goodsEnDesc",
          align: "center",
        },
        {
          title: "原库存数量",
          key: "oriInventoryNumber",
          align: "center",
        },
        {
          title: "原分配数量",
          key: "oriAllottedNumber",
          align: "center",
        },
        {
          title: "原冻结数量",
          key: "oriFrozenNumber",
          align: "center",
        },
        {
          title: "原可用数量",
          key: "oriUsableNumber",
          align: "center",
        },
        {
          title: "原可用数量",
          key: "frozenInventoryNumber",
          align: "center",
        },
      ],
      data7: [],
      frozenOrderData: {}, // 创建冻结单成功之后返回的数据
      selectFrozenTableList: [], // 勾选的表格数据
      allSelectFrozenTableList: [], // 全选的表格数据
      showStatus: {}, // 冻结单状态
      changeFrozenNumList: [],
      deleteFrozenList: [], // 删除的表格数据
    };
  },
  created() {
    var v = this;
    // v.getWareHouseName(); // 调用仓库下拉列表
    v.fromStartPage();
  },
  methods: {
    addProductSuccess(data) {
      let v = this;
      v.addNewProductModal = false;
      data.forEach((item, i) => {
        item.oriAllottedNumber =
          item.allottedNumber === null ? 0 : item.allottedNumber; // 分配数量
        item.oriFrozenNumber =
          item.frozenNumber === null ? 0 : item.frozenNumber; // 冻结数量
        item.oriInventoryNumber = item.inventoryNumber; // 库存数量
        item.oriUsableNumber = item.availableNumber; // 可用数量
        item.frozenInventoryNumber = null; // 冻结数量
      });
      v.data6 = v.data6.concat(data); // 待审核
      if (v.data6[0].inventoryId) {
        v.data6 = v.repeatArrayObject(v.data6, "inventoryId");
      } else {
        v.data6 = v.repeatArrayObject(v.data6, "goodsId");
      }
      v.totalRecords = v.data6.length;
      if (v.showStatus.frozenStatus === "1" && v.data6.length !== 0) {
        v.isShow = true; // 保存按钮显示
        // v.isCheckShow = true; // 审核按钮显示
      }
    },
    addProductCancel() {
      this.addNewProductModal = false;
    },
    fromStartPage() {
      this.$store.commit("adjustDetailTableShow", "noCheck");
    },
    backPage() {
      // 返回列表按钮
      this.$store.commit("freezeOrderShow", "freeze");
    },
    selectFrozenDataBtn(data) {
      // 勾选的表格数据
      this.selectFrozenTableList = data;
    },
    allSelectFrozenBtn(data) {
      // 全选删除
      this.allSelectFrozenTableList = data;
    },
    frozenValidFn() {
      // 库存冻结校验
      let v = this;
      let valid = true;
      for (let i = 0; i < this.data6.length; i++) {
        if (v.data6[i].frozenInventoryNumber === null) {
          v.$Message.info({
            content: "本次冻结数量不能为空",
            duration: 5,
          });
          valid = false;
          return;
        }
        if (v.data6[i].frozenInventoryNumber <= 0) {
          v.$Message.info({
            content: "冻结数量不能小于等于0",
            duration: 5,
          });
          valid = false;
          return;
        }
        var re = v.$regular.AllNumber;
        if (!re.test(v.data6[i].frozenInventoryNumber)) {
          v.$Message.info({
            content: "冻结数量不能为小数",
            duration: 5,
          });
          valid = false;
          return;
        }
        if (v.data6[i].frozenInventoryNumber > v.data6[i].oriUsableNumber) {
          v.$Message.info({
            content: "冻结数量不能大于当前产品的原可用数量",
            duration: 5,
          });
          valid = false;
          return;
        }
      }
      return valid;
    },
    createFrozenOrderBtn() {
      // 创建库存冻结单
      var v = this;
      if (this.data6.length === 0) {
        this.$Message.info({
          content: "创建之前，请添加货品",
          duration: 4,
        });
        return;
      }
      var obj = {
        wmsInventoryFrozen: v.pageParams, // 仓库和备注信息
        wmsInventoryFrozenDetail: v.data6,
      };
      obj.wmsInventoryFrozen.warehouseId = v.wareId;
      if (this.frozenValidFn()) {
        v.axios.post(api.createFrozenOrder, obj).then((res) => {
          if (res.data.code === 0) {
            v.$Message.success("创建库存冻结单成功");
            v.isShowNoAndStatus = true;
            v.isCreateShow = false;
            v.isShow = true;
            // v.isCheckShow = true;
            v.isAdjustShow = true; // 创建成功显示执行冻结按钮
            v.isShowSelect = false;
            v.frozenOrderData = res.data.datas; // 创建冻结单成功之后返回的数据
            this.searchData();
          } else {
            v.$Message.warning("创建库存冻结单失败");
          }
        });
      }
    },
    searchData() {
      // 页面查询
      var v = this;
      var obj = {
        inventoryFrozenNo: v.frozenOrderData.inventoryFrozenNo,
        pageNum: v.pageParams.pageNum,
        pageSize: v.pageParams.pageSize,
      };
      v.axios.post(api.get_frozenDetailData, obj).then((res) => {
        if (res.data.code === 0) {
          v.data6 = res.data.datas.wmsInventoryFrozenSku.list;
          v.data7 = res.data.datas.wmsInventoryFrozenSku.list;
          v.showStatus = res.data.datas.wmsInventoryFrozen;
          v.totalRecords = res.data.datas.wmsInventoryFrozenSku.total;
        }
      });
    },
    changePage(page) {
      // 表格分页
      var v = this;
      v.pageParams.pageNum = page;
      v.searchData();
    },
    filterArrFn(arr) {
      // 数组去重
      return Array.from(new Set(arr));
    },
    filterDeleteArrFn(array) {
      // 去除重复的删除id
      var n = [];
      for (var i = 0; i < array.length; i++) {
        if (n.indexOf(array[i]) === -1) {
          n.push(array[i]);
        }
      }
      return n;
    },
    removeProduct(index, frozenDetailId) {
      // 删除当前表格行
      var v = this;
      v.data6.splice(index, 1);
      if (frozenDetailId) {
        v.deleteFrozenList.push(frozenDetailId);
      }
      if (v.data6.length === 0) {
        // this.isCheckShow = false; // 审核按钮隐藏
      }
      v.$Message.success("成功删除当前行的货品");
      v.totalRecords = v.totalRecords - 1;
    },
    deleteProductBtn(selectFrozenTableList, allSelectFrozenTableList) {
      // 批量删除表格行
      let v = this;
      if (v.selectFrozenTableList.length === 0) {
        v.$Message.info("请勾选你要删除的货品");
        return;
      }
      let arr = [];
      v.data6.forEach((obj, index) => {
        arr.push(obj);
      });
      arr.forEach((obj, index) => {
        selectFrozenTableList.forEach((item, j) => {
          if (obj.inventoryId === item.inventoryId) {
            v.data6.splice(index, 1);
            v.selectFrozenTableList = [];
            v.allSelectFrozenTableList = [];
            if (selectFrozenTableList[j].inventoryFrozenDetailId) {
              v.deleteFrozenList.push(
                selectFrozenTableList[j].inventoryFrozenDetailId
              );
            }
            if (v.data6.length === 0) {
              // this.isCheckShow = false; // 审核按钮隐藏
            }
            v.totalRecords = v.totalRecords - v.selectFrozenTableList.length;
          }
        });
      });
      arr.forEach((obj, index) => {
        allSelectFrozenTableList.forEach((item, j) => {
          if (
            obj.warehouseId === item.warehouseId ||
            obj.receiptBatchNo === item.receiptBatchNo
          ) {
            v.data6.splice(index, 1);
            v.selectFrozenTableList = [];
            v.allSelectFrozenTableList = [];
            if (allSelectFrozenTableList[j].inventoryFrozenDetailId) {
              v.deleteFrozenList.push(
                allSelectFrozenTableList[j].inventoryFrozenDetailId
              );
            }
            if (v.data6.length === 0) {
              // this.isCheckShow = false; // 审核按钮隐藏
            }
            v.totalRecords = 0;
          }
        });
      });
      v.$Message.success("成功删除选中的货品");
    },
    checkPassBtn() {
      // 审核通过按钮
      var v = this;
      var obj = {
        frozenSkuNum: v.data6.length,
        frozenStatus: v.showStatus.frozenStatus,
        frozenStatusType: "2",
        inventoryFrozenNo: v.frozenOrderData.inventoryFrozenNo,
        remark: v.pageParams.remark ? v.pageParams.remark : null,
        warehouseId: v.wareId,
        removeList: v.filterDeleteArrFn(v.deleteFrozenList), // 删除
        wmsInventoryFrozenDetail: v.filterArrFn(v.changeFrozenNumList),
      };
      if (this.frozenValidFn()) {
        v.axios.post(api.checkedFrozenOrder, obj).then((res) => {
          if (res.data.code === 0) {
            v.$Message.success("审核通过");
            v.$store.commit("adjustDetailTableShow", "isChecked");
            v.isShow = false;
            // v.isCheckShow = false;
            v.isAdjustShow = true;
            v.isShowBtn = false;
            v.deleteFrozenList = [];
            this.searchData();
          } else if (res.data.code === -3) {
            v.$Message.info({
              content: "实际库存有变化，本次冻结数量不能大于原库存可用数量",
              duration: 5,
            });
          } else {
            v.$Message.warning("审核失败");
          }
        });
      }
    },
    saveFrozenOrderBtn() {
      // 修改保存按钮
      var v = this;
      var obj = {
        frozenStatus: v.showStatus.frozenStatus,
        inventoryFrozenNo: v.frozenOrderData.inventoryFrozenNo,
        inventoryFrozenId: v.frozenOrderData.inventoryFrozenId,
        frozenSkuNum: v.data6.length,
        remark: v.pageParams.remark ? v.pageParams.remark : null,
        warehouseId: v.wareId,
        removeList: v.filterDeleteArrFn(v.deleteFrozenList), // 删除
        wmsInventoryFrozenDetail: v.filterArrFn(v.changeFrozenNumList),
      };
      if (this.frozenValidFn()) {
        v.axios.post(api.modifyFrozenOrder, obj).then((res) => {
          if (res.data.code === 0) {
            v.deleteFrozenList = [];
            v.changeFrozenNumList = []; // 保存成功之后，清空上一次的数据
            if (v.data6.length === 0) {
              this.isShow = false;
              // this.isCheckShow = false;
              this.$store.commit("freezeOrderShow", "freeze");
            } else {
              this.searchData();
            }
            v.$Message.success("保存成功");
          } else {
            v.$Message.warning("保存失败");
          }
        });
      }
    },
    frozenPassBtn() {
      // 执行冻结单按钮
      var v = this;
      v.axios
        .get(
          api.carryFrozenOrder +
            "?inventoryFrozenNo=" +
            v.frozenOrderData.inventoryFrozenNo
        )
        .then((res) => {
          if (res.data.code === 0) {
            v.$Message.success("库存冻结成功！");
            v.$store.commit("adjustDetailTableShow", "isChecked");
            v.isShow = false;
            v.isAdjustShow = false;
            v.isShowBtn = false;
            v.isUnfreezeShow = true;
            this.searchData();
          } else if (res.data.code === -1) {
            v.$Message.info({
              content: "执行冻结失败，当前有产品正处于盘点状态不能执行冻结单！",
              duration: 5,
            });
          } else if (res.data.code === 1) {
            v.$Message.info({
              content: "冻结失败，可用库存不能小于0",
              duration: 5,
            });
          }
        });
    }, // 解除冻结
    unfreezeBtn() {
      let v = this;
      v.axios
        .get(
          api.cancelFrozenOrder +
            "?inventoryFrozenNo=" +
            v.frozenOrderData.inventoryFrozenNo
        )
        .then((res) => {
          if (res.data.code === 0) {
            v.isUnfreezeShow = false;
            v.searchData();
          }
        });
    },
    userSelectOk(data) {
      // 用户选择添加的货品表格数据
      var v = this;
      v.userSelectTable = data;
      v.userSelectTable.forEach((item, i) => {
        item.oriAllottedNumber =
          item.allottedNumber === null ? 0 : item.allottedNumber; // 分配数量
        item.oriFrozenNumber =
          item.frozenNumber === null ? 0 : item.frozenNumber; // 冻结数量
        item.oriInventoryNumber = item.inventoryNumber; // 库存数量
        item.oriUsableNumber = item.availableNumber; // 可用数量
      });
    },
    cancelcreateFrozenOrderBtn() {
      // 取消创建库存移动单
      this.$store.commit("freezeOrderShow", "freeze");
    }, // getWareHouseName () { // 获取仓库下拉列表
    //   var v = this;
    //   v.axios.post(api.selectFrozenWareHouseName)
    //     .then(res => {
    //       if (res.data.code === 0) {
    //         v.wareHouseTypeList = res.data.datas;
    //       }
    //     });
    // },
    changeWarehouseName(val) {
      // 改变仓库，清空当前所属仓库的表格数据
      var v = this;
      v.pageParams.warehouseId = val;
      for (var i = 0; i < v.data6.length; i++) {
        if (v.pageParams.warehouseId !== v.data6[i].warehouseId) {
          v.data6 = [];
          v.totalRecords = 0;
        }
      }
    },
    showAddProductModal() {
      // 添加货品模态框
      var v = this;
      // if (this.pageParams.warehouseId) {
      v.addNewProductModal = true;
      // } else {
      //  v.$Message.warning('请先选择仓库！')
      // }
    },
    addNewProduct() {
      // 确定添加产品按钮
      var v = this;
      v.userSelectTable.forEach((n, i) => {
        n.frozenInventoryNumber = null; // 冻结数量
      });
      var obj = {};
      for (var i = 0; i < v.userSelectTable.length; i++) {
        obj[v.userSelectTable[i].inventoryId] = 1;
        for (var j = 0; j < v.data6.length; j++) {
          if (obj[v.data6[j].inventoryId]) {
            v.$Message.info({
              content: "添加货品失败，你已经添加了该货品，不能重复添加",
              duration: 3,
            });
            v.addNewProductModal = true;
            return;
          }
        }
      }
      if (v.userSelectTable.length === 0) {
        v.addNewProductModal = true;
        this.$Message.info({
          content: "请勾选你要添加的货品",
          duration: 4,
        });
        return;
      }
      v.addNewProductModal = false;
      v.$Message.success("成功添加冻结的产品");
      v.data6 = v.data6.concat(v.userSelectTable);
      v.totalRecords += v.userSelectTable.length;
      if (v.showStatus.frozenStatus === "1" && v.data6.length !== 0) {
        v.isShow = true; // 保存按钮显示
        // v.isCheckShow = true; // 审核按钮显示
      }
    },
    cancelButton() {
      // 模态框取消按钮
      var v = this;
      v.$Message.info("取消添加冻结的产品");
      v.addNewProductModal = false;
    },
  },
};
</script >
<style >
.headerBar .ivu-modal-header p,
.headerBar .ivu-modal-header-inner {
  color: #fff;
}
</style >
