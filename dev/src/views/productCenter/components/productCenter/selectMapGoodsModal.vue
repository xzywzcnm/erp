<template >
  <Modal
    v-model="showSelectMapGoodsModal"
    :styles="{ top: '20px', width: '90%' }"
    @on-ok="ok()"
    @on-cancel="cancel()"
    :loading="waitingOk"
    class="selectMapGoodsPage"
  >
    <div class="ivu-modal-confirm">
      <div class="ivu-modal-confirm-head">
        <div class="ivu-modal-confirm-head-title">
          {{ selectMapGoodsTitle }}
        </div>
      </div>
      <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
        <div style="margin-top: 10px">
          <div class="brandSelect">
            <Form
              ref="skuMapModal"
              :model="skuMapModal"
              :label-width="90"
              label-position="left"
            >
              <Row>
                <Col span="8">
                  <Form-item
                    label="映射sku编码"
                    :rules="{
                      required: true,
                      message: '请输入映射sku编码',
                      trigger: 'blur',
                    }"
                    prop="sku"
                  >
                    <Input
                      style="width: 360px"
                      :maxlength="100"
                      placeholder="请输入映射sku编码"
                      v-model.trim="skuMapModal.sku"
                    ></Input>
                  </Form-item>
                </Col>

                <Col span="3" class="mr40">
                  <Form-item
                    label="长(cm)："
                    :label-width="60"
                    prop="productLength"
                  >
                    <Input
                      :maxlength="100"
                      placeholder="请输入长度"
                      v-model.trim.number="skuMapModal.productLength"
                    ></Input>
                  </Form-item>
                </Col>
                <Col span="3" class="mr40">
                  <Form-item
                    label="宽(cm)："
                    :label-width="60"
                    prop="productWidth"
                  >
                    <Input
                      :maxlength="100"
                      placeholder="请输入宽度"
                      v-model.trim.number="skuMapModal.productWidth"
                    ></Input>
                  </Form-item>
                </Col>
                <Col span="3" class="mr40">
                  <Form-item
                    label="高(cm)："
                    :label-width="60"
                    prop="productHeight"
                  >
                    <Input
                      :maxlength="100"
                      placeholder="请输入高度"
                      v-model.trim.number="skuMapModal.productHeight"
                    ></Input>
                  </Form-item>
                </Col>
                <Col span="3">
                  <Form-item
                    label="重量(g)："
                    :label-width="63"
                    prop="productWeight"
                  >
                    <Input
                      :maxlength="100"
                      placeholder="请输入重量"
                      v-model.trim.number="skuMapModal.productWeight"
                    ></Input>
                  </Form-item>
                </Col>
              </Row>

              <Row>
                <Col span="8">
                  <Form-item
                    label="映射sku名称"
                    :rules="{
                      required: true,
                      message: '请输入映射sku名称',
                      trigger: 'blur',
                    }"
                    prop="name"
                  >
                    <Input
                      style="width: 360px"
                      :maxlength="1000"
                      placeholder="请输入映射sku名称"
                      v-model.trim="skuMapModal.name"
                    ></Input>
                  </Form-item>
                  <Form-item
                    label="映射类型"
                    :rules="{
                      required: true,
                      message: '请输入映射类型',
                      trigger: 'change',
                      type: 'number',
                    }"
                    prop="productSkuType"
                  >
                    <RadioGroup v-model="skuMapModal.productSkuType">
                      <Radio :label="0" class="mr40">组合产品</Radio>
                      <Radio :label="1" class="mr40">随机发一个SKU</Radio>
                      <Radio :label="2">印花映射</Radio>
                    </RadioGroup>
                  </Form-item>
                </Col>
                <Col span="8">
                  <Form-item label="备注：" :label-width="63" prop="remark">
                    <Input
                      :maxlength="200"
                      type="textarea"
                      placeholder="请输入,限制200字符长度"
                      v-model="skuMapModal.remark"
                    ></Input>
                  </Form-item>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </div>
      <div class="modalContent">
        <div class="percent30" v-if="showSelectSkuDiv">
          <div style="height: 30px; padding-top: 10px">
            <h3>维护映射关系</h3>
          </div>
          <Table
            class="normalTop"
            highlight-row
            border
            :height="tableHeight"
            :columns="selectedSkuColumn"
            :data="selectedSkuData"
          ></Table>
        </div>
        <div class="percent70" :class="{ percent100: !showSelectSkuDiv }">
          <div class="orderTable">
            <div style="height: 30px; display: flex">
              <!-- <Input
                style="width: 280px"
                icon="md-search"
                placeholder="请输入sku或商品名称111"
                v-model.trim="pageParams.searchValue"
              ></Input> -->
              <dyt-input-tag
                type="textarea"
                :limit="1"
                :string="true"
                style="width: 280px"
                placeholder="请输入sku或商品名称(支持查询多个，用逗号分隔)"
                v-model.trim="pageParams.searchValue"
              ></dyt-input-tag>
              <Button style="margin-left: 10px" type="primary" @click="search"
                >查询
              </Button>
            </div>
            <Table
              class="normalTop"
              highlight-row
              :loading="waitingLoadSkuData"
              border
              :height="tableHeight"
              :columns="skuColumn"
              :data="skuData"
              @on-selection-change="onSelectionChange"
              @on-select="onSelect"
              @on-select-all="onSelectAll"
              @on-select-cancel="onSelectCancel"
            ></Table>
            <div class="table-page">
              <div class="table-page-right">
                <Page
                  :total="pageAttr.total"
                  @on-change="changePage"
                  show-total
                  :page-size="pageParams.pageSize"
                  show-elevator
                  :current="pageParams.pageNum"
                  show-sizer
                  @on-page-size-change="changePageSize"
                  placement="top"
                  :page-size-opts="pageArray"
                ></Page>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import productMixin from "@/components/mixin/product_mixin";
import tableMixin from "@/components/mixin/table_mixin";
import productData from "@/views/productCenter/components/productCenter/staticData/productData";

export default {
  mixins: [Mixin, tableMixin, productMixin],
  props: ["value", "selectMapGoodsTitle", "editRow"],
  data() {
    var self = this;
    return {
      productStatus: productData.productStatus,
      showSelectMapGoodsModal: self.value, // 是否显示模态当前模态窗口
      showSelectSkuDiv: false, // 是否显示左边已选货品div
      pageParamsStatus: false, // 是否重新加载sku列表数据
      waitingOk: true, // 点击确认按钮是否需要显示loading遮罩
      waitingLoadSkuData: true, // 加载sku列表数据时显示loading
      productGoodsIdToSku: {}, // 货品Id映射到一个sku对象
      productGoodsIdToSelectedSku: {}, // 货品Id映射到一个已选中sku对象
      pageAttr: {
        total: 0,
      },
      pageParams: {
        // sku列表筛选参数
        searchValue: null,
        pageSize: 10,
        pageNum: 1,
      },
      skuMapModal: {
        // sku映射表单模型
        name: null,
        sku: null,
        insertProductSkuMappingDetailBos: [],
        productSkuType: 0,
        productLength: null,
        productHeight: null,
        productWidth: null,
        productWeight: null,
        remark: null,
      },
      skuData: [], // sku数据
      skuColumn: [
        // sku列定义
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "商品图片",
          key: "imagePath",
          align: "center",
          render: (h, params) => {
            return self.tableImg(h, params, "imagePath");
          },
        },
        {
          title: "SKU",
          key: "sku",
          align: "center",
        },
        {
          title: "商品名称",
          key: "cnName",
          align: "center",
        },
        {
          title: "分类",
          key: "productCategoryId",
          align: "center",
          render: (h, params) => {
            let productCategoryMap =
              self.productCommonDictionary.productCategoryMap;
            if (
              productCategoryMap &&
              productCategoryMap[params.row.productCategoryId]
            ) {
              return h(
                "span",
                productCategoryMap[params.row.productCategoryId]
                  .productCategoryNavigation
              );
            }
            if (params.row.productCategoryId === null) {
              return h("span", "未分类");
            }
          },
        },
        {
          title: "商品状态",
          width: 160,
          key: "status",
          align: "center",
          render: (h, params) => {
            let text = "";
            this.productStatus.forEach((item) => {
              if (item.value == params.row.status) {
                text = h("span", item.label);
              }
            });
            return text;
          },
        },
      ],
      selectSkuDataTemp: [], // 缓存已选sku数据 数量
      selectedSkuData: [], // 已选sku数据
      selectedSkuColumn: [
        // 已选sku列表列定义
        {
          title: "SKU",
          key: "sku",
          align: "center",
        },
        {
          title: "数量",
          key: "quantity",
          align: "center",
          render: (h, params) => {
            let n = params.row;
            let sku = self.productGoodsIdToSelectedSku[n.productGoodsId];
            sku._index = params.index;
            return h("InputNumber", {
              props: {
                size: "small",
                min: 1,
                value: sku.quantity,
              },
              style: {
                width: "90%",
              },
              on: {
                input: (val) => {
                  sku.quantity = parseInt(Number(val));
                },
              },
            });
          },
        },
        {
          title: "操作",
          align: "center",
          render: (h, params) => {
            return h(
              "Button",
              {
                on: {
                  click: () => {
                    self.deleteSelectedSku(params.index);
                  },
                },
              },
              "删除"
            );
          },
        },
      ],
    };
  },
  created() {
    this.tableHeight = this.getTableHeight(420);
  },
  methods: {
    ok() {
      let self = this;
      self.$refs["skuMapModal"].validate((valid) => {
        if (valid && self.selectedSkuData.length > 0) {
          new Promise((resolve, reject) => {
            if (
              self.getPermission("productSkuMapping_update") ||
              self.getPermission("productSkuMapping_insert")
            ) {
              self.save(resolve);
            }
          }).finally(() => {
            self.waitingOk = false;
            self.$nextTick(function () {
              self.waitingOk = true;
            });
          });
        } else {
          if (self.selectedSkuData.length < 1) {
            self.$Message.error("至少选择一个sku");
          }
          self.waitingOk = false;
          self.$nextTick(function () {
            self.waitingOk = true;
          });
        }
      });
    },
    cancel() {
      this.$emit("input", false);
      this.$emit("cancel");
    },
    save(resolve) {
      // 保存sku映射
      let self = this;
      self.selectedSkuData = this.deepCopy(self.selectSkuDataTemp);
      self.skuMapModal.insertProductSkuMappingDetailBos = self.selectedSkuData;

      if (self.skuMapModal.productSkuMappingId) {
        resolve(
          self.axios
            .put(api.edit_productSkuMapping, self.skuMapModal)
            .then((response) => {
              if (response.data.code === 0) {
                self.$parent.pageParamsStatus = true;
                self.$emit("input", false);
                self.$Message.success("更新成功");
              }
            })
        );
      } else {
        resolve(
          self.axios
            .post(api.add_productSkuMapping, self.skuMapModal)
            .then((response) => {
              if (response.data.code === 0) {
                self.$parent.pageParamsStatus = true;
                self.$emit("input", false);
                self.$Message.success("新增成功");
              }
            })
        );
      }
    },
    deleteSelectedSku(index) {
      // 删除已选择的sku
      let productGoodsId = this.selectedSkuData[index].productGoodsId;
      let sku = this.productGoodsIdToSku[productGoodsId];
      if (sku) {
        sku._checked = false;
      }
      delete this.productGoodsIdToSelectedSku[productGoodsId];
      this.selectedSkuData.splice(index, 1);
      this.selectSkuDataTemp.splice(index, 1);
    },
    onSelectCancel(selections, row) {
      // 行取消选中时触发
      this.productGoodsIdToSku[row.productGoodsId]._checked = false;
      this.selectedSkuData.splice(
        this.productGoodsIdToSelectedSku[row.productGoodsId]._index,
        1
      );
      this.selectSkuDataTemp.splice(
        this.productGoodsIdToSelectedSku[row.productGoodsId]._index,
        1
      );
      delete this.productGoodsIdToSelectedSku[row.productGoodsId];
    },
    onSelectAll(selection) {
      // 所有行选中时触发
      let self = this;
      selection.forEach(function (row, i) {
        if (!self.productGoodsIdToSku[row.productGoodsId]._checked) {
          self.onSelect(selection, row);
        }
      });
    },
    onSelect(selection, row) {
      // 行选中时触发
      // let skuIndex = this.selectedSkuData.length;
      let selectedSku = {
        sku: row.sku,
        quantity: 1,
        productGoodsId: row.productGoodsId,
      };
      this.productGoodsIdToSelectedSku[row.productGoodsId] = selectedSku;
      this.productGoodsIdToSku[row.productGoodsId]._checked = true;
      this.selectSkuDataTemp.push(selectedSku);
      this.selectedSkuData.push({
        sku: row.sku,
        quantity: 1,
        productGoodsId: row.productGoodsId,
      });
    },
    onSelectionChange(selection) {
      // 行被选中状态改变时触发
      if (selection.length === 0) {
        let self = this;
        self.selectedSkuData = self.selectedSkuData.filter(function (row) {
          if (self.productGoodsIdToSku[row.productGoodsId]) {
            self.productGoodsIdToSku[row.productGoodsId]._checked = false;
            return false;
          }
          return true;
        });
        // self.selectSkuDataTemp = self.selectSkuDataTemp.filter(function (row) {
        //   if (self.productGoodsIdToSku[row.productGoodsId]) {
        //     self.productGoodsIdToSku[row.productGoodsId]._checked = false;
        //     return false;
        //   }
        //   return true;
        // });
      }
    },
    search() {
      // 点查询按钮需重置页码
      // (this.pageParams.searchValue = this.sepCommasFn(
      //   this.pageParams.searchValue
      // )),
      this.pageParams.pageNum = 1;
      this.pageParamsStatus = true;
    },
    getList() {
      // 查询列表数据
      let self = this;
      self.productGoodsIdToSku = {};
      self.axios
        .post(api.get_productGoods, self.pageParams)
        .then((response) => {
          if (response.data.code === 0) {
            var data = response.data.datas;
            let skuList = [];
            let productCategoryIds = [];
            if (data.list !== null && data.list.length > 0) {
              data.list.forEach(function (sku, i) {
                sku.index = i;
                if (self.productGoodsIdToSelectedSku[sku.productGoodsId]) {
                  sku._checked = true;
                } else {
                  sku._checked = false;
                }
                skuList.push(sku);
                productCategoryIds.push(sku.productCategoryId);
                self.productGoodsIdToSku[sku.productGoodsId] = sku;
              });
            }
            Promise.all([self.getProductCategoryMap(productCategoryIds)]).then(
              (result) => {
                self.skuData = skuList;
                self.$nextTick(function () {
                  self.pageAttr.total = Number(data.total);
                  self.waitingLoadSkuData = false;
                });
              }
            );
          }
        });
    },
  },
  watch: {
    pageParamsStatus: function (n, o) {
      // 监听重置列表数据
      var self = this;
      if (n) {
        self.$Loading.start();
        Promise.resolve(self.getList()).then(function () {
          self.$Loading.finish();
        });
        self.pageParamsStatus = false;
      }
    },
    showSelectMapGoodsModal: function (n, o) {
      // 重置
      if (!n) {
        this.pageParams.pageNum = 1;
        this.pageParams.searchValue = null;
        this.skuData = [];
        this.skuMapModal.productSkuMappingId = null;
        this.selectedSkuData = [];
        this.selectSkuDataTemp = [];
        this.productGoodsIdToSku = {};
        this.productGoodsIdToSelectedSku = {};
        this.$refs["skuMapModal"].resetFields();
      } else {
        this.pageParamsStatus = true;
      }
    },
    editRow: function (productSkuMapping, o) {
      // 编辑时需初始化数据
      var self = this;
      if (productSkuMapping) {
        let selectedSkuList = [];
        let selectedSkuListShow = [];
        (productSkuMapping.productSkuMappingDetails || []).forEach(function (
          productSkuMappingDetail,
          i
        ) {
          let selectedSku = {
            productGoodsId: productSkuMappingDetail.productGoodsId,
            quantity: productSkuMappingDetail.quantity,
            sku: productSkuMappingDetail.sku,
          };
          let selectedSkuShow = {
            productGoodsId: productSkuMappingDetail.productGoodsId,
            quantity: productSkuMappingDetail.quantity,
            sku: productSkuMappingDetail.sku,
          };
          selectedSkuList.push(selectedSku);
          selectedSkuListShow.push(selectedSkuShow);
          self.productGoodsIdToSelectedSku[
            productSkuMappingDetail.productGoodsId
          ] = selectedSku;
        });
        self.selectSkuDataTemp = selectedSkuList;
        self.selectedSkuData = selectedSkuListShow;
        self.skuMapModal.productSkuMappingId =
          productSkuMapping.productSkuMappingId;
        self.skuMapModal.name = productSkuMapping.name;
        self.skuMapModal.sku = productSkuMapping.sku;
        self.skuMapModal.productSkuType = productSkuMapping.productSkuType;
        self.skuMapModal.productHeight = productSkuMapping.productHeight;
        self.skuMapModal.productWeight = productSkuMapping.productWeight;
        self.skuMapModal.productWidth = productSkuMapping.productWidth;
        self.skuMapModal.productLength = productSkuMapping.productLength;
        self.skuMapModal.remark = productSkuMapping.remark;
        self.$parent.editRow = null;
      }
    },
    "selectedSkuData.length": function (n, o) {
      // 判断是否显示左边以选中div
      var self = this;
      if (n > 0) {
        self.showSelectSkuDiv = true;
      } else {
        self.showSelectSkuDiv = false;
      }
    },
    value: function (n, o) {
      this.showSelectMapGoodsModal = n;
    },
  },
};
</script>
<style lang="less" scoped>
.selectMapGoodsPage {
  .mr40 {
    margin-right: 40px;
  }
}
</style>