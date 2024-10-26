<template >
  <div>
    <!--筛选条件-->
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content platformParamsSelect">
          <Form
            ref="pageParams"
            class="normalTop"
            :model="pageParams"
            :label-width="90"
            label-position="right"
          >
            <dyt-filter>
              <Form-item label="映射商品编码" prop="skus">
                <dyt-input-tag
                  type="textarea"
                  :limit="1"
                  :string="false"
                  placeholder="请输入主映射商品的映射编码(支持查询多个，用逗号分隔)"
                  v-model.trim="pageParams.skus"
                ></dyt-input-tag>
              </Form-item>
              <Form-item label="映射商品名称" prop="SKUbrandName">
                <dyt-input
                  placeholder="请输入名称"
                  v-model.trim="pageParams.name"
                ></dyt-input>
              </Form-item>
              <Form-item label="映射商品" prop="originalSkus">
                <dyt-input-tag
                  type="textarea"
                  :limit="1"
                  :string="false"
                  placeholder="请输入被映射商品的sku号(支持查询多个，用逗号分隔)"
                  v-model.trim="pageParams.originalSkus"
                ></dyt-input-tag>
              </Form-item>
              <Form-item label="映射类型">
                <dyt-select
                  v-model="pageParams.productSkuType"
                  :clearable="false"
                >
                  <Option
                    v-for="(item, index) in skuMapType"
                    :key="index + 'skuMapType'"
                    :value="item.value"
                    >{{ item.label }}</Option
                  >
                </dyt-select>
              </Form-item>
              <Form-item label="创建人" prop="createdByList">
                <dyt-select
                  v-model="pageParams.createdByList"
                  :max-tag-count="1"
                  multiple
                  placeholder="请选择创建人"
                >
                  <Option
                    v-for="(item, index) in allUserInfoList"
                    :key="index + 'user'"
                    :value="item.userId"
                    >{{ item.userName }}</Option
                  >
                </dyt-select>
              </Form-item>

              <div slot="operation">
                <Button
                  type="primary"
                  icon="md-search"
                  :disabled="SearchDisabled"
                  @click="search"
                  >查询
                </Button>
                <Button
                  style="margin-left: 10px"
                  @click="reset"
                  v-once
                  icon="md-refresh"
                  >重置
                </Button>
              </div>
            </dyt-filter>
          </Form>
        </div>
      </div>
    </div>

    <!--操作区-->
    <div class="addBrand" style="display: flex">
      <div style="flex: 100">
        <Button
          type="primary"
          icon="md-add"
          @click="add"
          :disabled="!getPermission('productSkuMapping_insert')"
          >新建映射
        </Button>

        <Button
          type="primary"
          @click="bulkDelete"
          :disabled="!getPermission('productSkuMapping_batchDelete')"
          style="margin-left: 10px"
          >批量删除
        </Button>

        <Buttons
          type="primary"
          style="margin-left: 10px"
          trigger="click"
          @on-click="leadSkuExcel"
          :disabled="!getPermission('productSkuMapping_excelImport')"
        >
          <Button
            :disabled="!getPermission('productSkuMapping_excelImport')"
            type="primary"
            @click="leadSkuExcel(0)"
          >
            EXCEL导入
          </Button>
          <Buttons-menu slot="list">
            <Buttons-item
              :name="1"
              :disabled="!getPermission('productImportTaskInfo_query')"
              >查看导入任务
            </Buttons-item>
          </Buttons-menu>
        </Buttons>

        <Buttons
          type="primary"
          style="margin-left: 25px"
          trigger="click"
          @on-click="exportExcel"
          :disabled="!getPermission('productSkuMapping_exportByIds')"
        >
          <Button
            type="primary"
            @click="exportExcel(0)"
            :disabled="!getPermission('productSkuMapping_exportByIds')"
          >
            EXCEL导出
          </Button>
          <Buttons-menu slot="list">
            <Buttons-item
              :name="1"
              :disabled="!getPermission('productSkuMapping_export')"
              >导出（所有结果集）
            </Buttons-item>
          </Buttons-menu>
        </Buttons>
      </div>
      <!--排序-->
      <div
        class="dataSort grayBg"
        style="
          display: inline-block;
          background: none;
          border: none;
          padding: 0;
          margin: 0;
        "
      >
        <span>排序方式：</span>
        <Button-group>
          <template v-for="(item, index) in buttonGroupModel">
            <Button
              v-if="item.selected"
              :key="index"
              type="primary"
              @click="modifyTheSort(index, item.status)"
            >
              {{ item.title }}
              <Icon
                type="md-arrow-round-up"
                v-if="item.status && item.selected"
              ></Icon>
              <Icon
                type="md-arrow-round-down"
                v-if="!item.status && item.selected"
              ></Icon>
            </Button>
            <Button
              v-if="!item.selected"
              :key="index"
              @click="modifyTheSort(index, item.status)"
            >
              {{ item.title }}
              <Icon
                type="md-arrow-round-up"
                v-if="item.status && item.selected"
              ></Icon>
              <Icon
                type="md-arrow-round-down"
                v-if="!item.status && item.selected"
              ></Icon>
            </Button>
          </template>
        </Button-group>
      </div>
    </div>
    <!--列表-->
    <div class="orderTable normalTop">
      <Table
        highlight-row
        :loading="tableLoading"
        border
        :height="tableHeight"
        :columns="skuMapColumn"
        :data="skuMapData"
        @on-selection-change="getSelectValue"
      />
      <div class="table-page">
        <div class="table-page-right">
          <Page
            :total="total"
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
    <!--新增编辑组件-->
    <selectMapGoodsModal
      v-model="showSelectMapGoodsModal"
      :selectMapGoodsTitle="selectMapGoodsTitle"
      :editRow="editRow"
    ></selectMapGoodsModal>
    <!--删除确认框组件-->
    <delConfirmModal ref="delConfirmModal" @ok="del"></delConfirmModal>
    <!-- 导入 -->
    <Modal
      v-model="addSku"
      title="导入SKU"
      :loading="addSkuModalLoading"
      @on-ok="upload"
      @on-cancel="addSkuCancel"
    >
      <p class="urlText">选择导入文件：</p>
      <div>
        <dytUpload
          ref="upload"
          name="files"
          handleSuccess
          :headers="headObj"
          :data="uploadData"
          :show-upload-list="false"
          :on-success="handleSuccess"
          :on-format-error="handleFormatError"
          :action="uploadFiles"
          :format="['xlsx', 'xls']"
          :before-upload="handleUpload"
        >
          <Button style="marginleft: 10px; margintop: 10px">选择文件</Button>
        </dytUpload>
        <div v-if="file !== null" style="margintop: 10px">
          上传文件：{{ file.name }}
        </div>
      </div>
      <div class="skuModalBtn">
        <Button type="text" @click="loadTemplate">下载模板 </Button>
      </div>
      <p class="skuText">
        注：一次最多支持导入5000条数据，商品导入模板，【特性标签】改为允许导入多个数据，每个标签用逗号分隔：
        添加标签时，包含逗号特殊字符不能创建成功
      </p>
      <div class="skuUpdate">
        导入模板发现相同映射编码时：
        <RadioGroup v-model="uploadData.updateIgnore">
          <Radio label="0">覆盖</Radio>
          <Radio label="1">忽略</Radio>
        </RadioGroup>
      </div>
    </Modal>
    <!-- 查看导入任务 -->
    <exportTaskModal
      :taskModal="taskModal"
      :type="2"
      v-if="renderTaskModal"
    ></exportTaskModal>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import productMixin from "@/components/mixin/product_mixin";
import tableMixin from "@/components/mixin/table_mixin";
import selectMapGoodsModal from "./selectMapGoodsModal";
import delConfirmModal from "./delConfirmModal";
import exportTaskModal from "./exportTaskModal";
export default {
  mixins: [Mixin, tableMixin, productMixin],
  components: {
    selectMapGoodsModal: selectMapGoodsModal,
    exportTaskModal: exportTaskModal,
    delConfirmModal: delConfirmModal,
  },
  data() {
    var self = this;
    return {
      pageArray: [10, 20, 50, 100, 500],
      filenodeViewTargetUrl: self.$store.state.erpConfig.filenodeViewTargetUrl, // filenode根路径
      uploadFiles: api.leadin_productSkuMapping, // 上传文件
      selectedProductGoodsList: [], // 已选货品列表
      taskModal: false, // 导入任务模态框
      renderTaskModal: false, // 是否渲染任务模态框
      /** selectMapGoodsModal 子组件使用到的变量 start */
      editRow: null, // 编辑中间变量
      selectMapGoodsTitle: null, // 选择映射sku窗口标题
      showSelectMapGoodsModal: false, // 是否显示选择映射sku模态窗
      /** selectMapGoodsModal 子组件使用到的变量 end */
      total: 0, // 总记录数
      pageParamsStatus: false, // 是否重新加载sku列表数据
      addSku: false, // 导入sku 模态框显示隐藏
      confirmUpload: false,
      addSkuModalLoading: true,
      file: null,
      pageParamsPrototype: null, // 当前货品信息原型(重置用到)
      pageParams: {
        // 映射列表筛选参数
        skus: [],
        originalSkus: [],
        createdByList: [],
        name: null,
        orderBy: "createdBy",
        upDown: "down",
        pageNum: 1,
        pageSize: 20,
        productSkuType: "*",
      },
      uploadData: {
        updateIgnore: "0",
      },
      buttonGroupModel: [
        // 排序按钮组
        {
          type: "createdBy",
          selected: true,
          status: false,
          title: "按创建时间",
        },
        {
          type: "productSku",
          selected: false,
          status: true,
          title: "按映射编码",
        },
      ],
      skuMapData: [], // sku映射数据
      skuMapColumn: [
        // sku映射列定义
        {
          type: "selection",
          width: 60,
          fixed: "left",
          align: "center",
        },
        {
          title: "NO",
          width: 60,
          key: "index",
          align: "center",
        },
        {
          title: "映射商品编码",
          key: "sku",
          minWidth: 120,
          align: "center",
        },
        {
          title: "映射商品名称",
          key: "name",
          minWidth: 120,
          align: "center",
        },
        {
          title: "映射商品种类/映射商品数量",
          align: "center",
          minWidth: 190,
          render: (h, params) => {
            let productSkuMappingDetails =
              params.row.productSkuMappingDetails || [];
            let totalQuantity = 0;
            productSkuMappingDetails.forEach((productSkuMappingDetail, i) => {
              totalQuantity += productSkuMappingDetail.quantity;
            });
            return h(
              "div",
              {
                style: {
                  marginTop: "5px",
                },
              },
              productSkuMappingDetails.length + "/" + totalQuantity
            );
          },
        },
        {
          title: "映射商品",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            let productSkuMappingDetails =
              params.row.productSkuMappingDetails || [];
            let arr = [];
            productSkuMappingDetails.forEach((productSkuMappingDetail, i) => {
              arr.push(
                h(
                  "div",
                  {
                    style: {
                      marginTop: "5px",
                    },
                  },
                  productSkuMappingDetail.sku +
                    "*" +
                    productSkuMappingDetail.quantity
                )
              );
            });
            return h("div", arr);
          },
        },
        {
          title: "映射类型",
          minWidth: 120,
          align: "center",
          renderHeader: (h, { column, index }) => {
            return h("div", [
              h("span", column.title),
              h(
                "Poptip",
                {
                  props: {
                    transfer: true,
                    placement: "bottom",
                    trigger: "hover",
                  },
                },
                [
                  h("Icon", {
                    props: {
                      type: "ios-help-circle-outline",
                    },
                    style: {
                      marginLeft: "5px",
                      color: "#f60",
                      "font-size": "18px",
                      "font-weight": "bold",
                      cursor: "pointer",
                    },
                  }),
                  h(
                    "div",
                    {
                      slot: "content",
                    },
                    [
                      h(
                        "p",
                        "全量映射：所有映射商品共同组成为一个映射商品，匹配所有映射商品SKU;"
                      ),
                      h(
                        "p",
                        "随机映射：在映射商品SKU中，随机挑选一个SKU作为映射商品，每次匹配会重新随机获取新的SKU"
                      ),
                    ]
                  ),
                ]
              ),
            ]);
          },
          render: (h, params) => {
            let list = self.skuMapType.filter((k) => {
              return k.value === params.row.productSkuType;
            });
            return h("div", list[0] && list[0].label);
          },
        },
        {
          title: "创建时间",
          key: "createdTime",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            return h(
              "span",
              self.getDataToLocalTime(params.row.createdTime, "fulltime")
            );
          },
        },
        {
          title: "备注",
          key: "remark",
          align: "center",
          minWidth: 120,
          tooltip: true,
        },
        {
          title: "创建人",
          key: "createdBy",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            if (self.productCommonDictionary.userInfoMap) {
              if (
                self.productCommonDictionary.userInfoMap[params.row.createdBy]
              ) {
                return h(
                  "span",
                  self.productCommonDictionary.userInfoMap[params.row.createdBy]
                    .userName
                );
              }
            }
          },
        },
        {
          title: "操作",
          width: 200,
          fixed: "right",
          align: "center",
          render: function (h, params) {
            return h("div", [
              h(
                "Button",
                {
                  style: {
                    marginRight: "10px",
                  },
                  props: {
                    vIf: self.controlList.productSkuMapping_update,
                    size: "small",
                  },
                  on: {
                    click: () => {
                      if (self.getPermission("productSkuMapping_detail")) {
                        self.edit(params.row);
                      }
                    },
                  },
                },
                "编辑"
              ),
              h(
                "Button",
                {
                  style: {
                    marginLeft: "10px",
                  },
                  props: {
                    vIf: self.controlList.productSkuMapping_delete,
                    size: "small",
                  },
                  on: {
                    click: () => {
                      if (self.getPermission("productSkuMapping_delete")) {
                        self.delConfirm(params.row);
                      }
                    },
                  },
                },
                "删除"
              ),
            ]);
          },
        },
      ],
      skuMapType: [
        { label: "全部", value: "*" },
        { label: "全量映射", value: 0 },
        { label: "随机映射", value: 1 },
        { label: "印花映射", value: 2 },
      ],
    };
  },
  computed: {
    allUserInfoList() {
      if (
        this.$common.isEmpty(this.$store.state) ||
        this.$common.isEmpty(this.$store.state.userInfoList)
      )
        return [];
      return Object.values(this.$store.state.userInfoList);
    },
  },
  created() {
    this.tableHeight = this.getTableHeight(290);
    this.pageParamsPrototype = this.deepCopy(this.pageParams);
  },
  activated() {
    this.reset();
    this.startLoading();
  },
  methods: {
    startLoading: function () {
      // 页面数据初始化
      this.pageParamsStatus = true;
    },
    getPageParams() {
      let pageParams = this.$common.copy(this.pageParams);
      if (["*"].includes(pageParams.productSkuType)) {
        pageParams.productSkuType = null;
      }
      return pageParams;
    },
    getList() {
      // 查询列表数据
      let self = this;
      const item = this.getPageParams();
      self.loadingTrue();
      self.axios
        .post(api.get_productSkuMapping, item)
        .then((response) => {
          let pos = [];
          let userIds = [];
          if (response.data.code === 0) {
            var data = response.data.datas;
            self.loadingFalse();
            if (data.list !== null && data.list.length > 0) {
              data.list.forEach(function (n, i) {
                n.index = i + 1;
                pos.push(n);
                userIds.push(n.createdBy);
              });
            }

            Promise.all([self.getUserInfoMap(userIds)]).then((result) => {
              self.skuMapData = pos;
              self.$nextTick(function () {
                self.total = Number(data.total);
                self.loadingFalse();
              });
            });
          }
        })
        .catch(() => {
          self.loadingFalse();
        });
    },
    search() {
      // 查找
      this.pageParamsStatus = true;
      this.pageParams.pageNum = 1;
    },
    reset() {
      // 重置
      let v = this;
      v.pageParams = v.deepCopy(this.pageParamsPrototype);
      // v.search();
    },

    // 批量删除
    bulkDelete() {
      let v = this;
      let productSkuMappingId = [];
      v.selectedProductGoodsList.forEach((n, i) => {
        productSkuMappingId.push(n.productSkuMappingId);
      });
      if (productSkuMappingId.length === 0) {
        this.$Message.error("无删除数据,请选择后再试");
        return;
      }
      v.$Modal.confirm({
        title: "温馨提示",
        content: "确定要批量删除" + productSkuMappingId.length + "个SKU映射？",
        onOk: () => {
          v.axios
            .post(
              api.del_AllproductSkuMapping,
              JSON.stringify(productSkuMappingId)
            )
            .then((response) => {
              if (response.data.code === 0) {
                v.$Message.success("删除成功");
                v.selectedProductGoodsList = [];
                v.pageParams.pageNum = 1;
                v.pageParamsStatus = true;
              }
            });
        },
        onCancel: () => {},
      });
    },

    handleUpload(file) {
      // Excel 导入
      this.file = file;
      return this.confirmUpload;
    },
    leadSkuExcel(val) {
      // 0,导入；1,查看导入任务
      let v = this;
      if (val === 0) {
        v.addSku = true;
      } else if (val === 1) {
        // v.renderTaskModal = true;
        // v.$nextTick(function () {
        //   v.taskModal = true;
        // });
        v.$router.push("importTask");
      }
    },
    exportExcel(val) {
      // 0, 导出; 1, 导出所有结果集
      let v = this;
      if (val === 0) {
        let productSkuMappingId = [];
        v.selectedProductGoodsList.forEach((n, i) => {
          productSkuMappingId.push(n.productSkuMappingId);
        });
        if (productSkuMappingId.length === 0) {
          this.$Message.error("无导出数据,请选择后再试");
          return;
        }
        // let newTab = window.open('about:blank');
        v.axios
          .post(api.productSkuMapping_exportByIds, productSkuMappingId)
          .then((response) => {
            if (response.data.code === 0) {
              let data = response.data.datas;
              v.$Message.success({
                content: "已生成导入/导出任务，任务编号" + "：" + data,
                duration: 10,
                closable: true,
              });
              v.selectedProductGoodsList = [];
              v.pageParamsStatus = true;
              // newTab.location.href = v.filenodeViewTargetUrl + response.data.datas;
              // setTimeout(function () {
              //   newTab.close();
              // }, 1000);
            }
          });
      } else if (val === 1) {
        const item = this.getPageParams();
        v.axios.post(api.export_productSkuMapping, item).then((response) => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            v.$Message.success({
              content: "已生成导入/导出任务，任务编号" + "：" + data,
              duration: 10,
              closable: true,
            });
            // newTab.location.href = v.filenodeViewTargetUrl + response.data.datas;
            // setTimeout(function () {
            //   newTab.close();
            // }, 1000);
          }
        });
      }
    },
    getSelectValue(value) {
      // table获取所选值
      let v = this;
      v.selectedProductGoodsList = value;
    },
    upload() {
      // 导入sku模态框 确认
      if (this.file !== null) {
        this.confirmUpload = true;
        this.$refs.upload.upload(this.file);
      } else {
        this.addSkuModalLoading = false;
        this.$nextTick(function () {
          this.addSkuModalLoading = true;
        });
        this.$Message.error("请选择文件");
      }
    },
    addSkuCancel() {
      // 导入sku模态框 取消
      this.file = null;
    },
    handleSuccess(res, file, fileList) {
      // 上传成功
      if (res.code === 0) {
        this.file = null;
        this.$Message.success(
          "已生成导入任务，可在“查看导入任务”中查询导入结果"
        );
        this.confirmUpload = false;
        this.addSku = false;
      }
    },
    handleFormatError() {
      // 上传失败
      this.$Message.error("文件格式有误");
      this.addSkuModalLoading = false;
      this.$nextTick(function () {
        this.addSkuModalLoading = true;
        this.confirmUpload = false;
      });
    },
    loadTemplate() {
      // 下载模板
      let v = this;
      let newTab = window.open("about:blank");
      v.axios.get(api.loadSkuMappingTemplate).then((response) => {
        if (response.data.code === 0) {
          // let filenodeViewTargetUrl = v.$store.state.erpConfig.filenodeViewTargetUrl;
          newTab.location.href = v.filenodeViewTargetUrl + response.data.datas;
        }
      });
    },
    delConfirm(delRow) {
      // 删除确认
      this.$refs.delConfirmModal.show(delRow);
    },
    del(delRow) {
      // 删除
      let self = this;
      self.axios
        .delete(api.del_productSkuMapping + delRow.productSkuMappingId)
        .then((response) => {
          if (response.data.code === 0) {
            self.$Message.success("删除成功");
            self.pageParams.pageNum = 1;
            self.pageParamsStatus = true;
            self.$refs.delConfirmModal.hide();
          }
        });
    },
    add() {
      // 新建
      this.selectMapGoodsTitle = "商品捆绑维护";
      this.showSelectMapGoodsModal = true;
    },
    edit(row) {
      // 编辑
      this.editRow = row;
      this.selectMapGoodsTitle = "编辑商品";
      this.showSelectMapGoodsModal = true;
    },
  },
  watch: {
    pageParamsStatus: function (n, o) {
      // 监听重置列表数据
      let self = this;
      if (n) {
        Promise.resolve(
          self.getPermission("productSkuMapping_query")
            ? self.getList()
            : self.gotoError()
        ).then(() => {});
        self.pageParamsStatus = false;
      }
    },
  },
};
</script>
