<template>
  <div class="addProductModal">
    <div class="clear" style="
                background-color: rgba(242, 242, 242, 1);
                height: 100px;
                overflow-y: scroll;
            " v-if="sltOneOrMore === 'more'">
      <Row>
        <Col span="18">
        <div class="text">
          <span>已选择：</span>
          <Tag closable color="blue" v-for="(v, i) in saveSelectMore" :key="i" @on-close="closeTag(v, i)">{{ v.goodsSku
          }}
          </Tag>
        </div>
        </Col>
        <Col span="6">
        <div style="position: relative; width: 88%; height: 100px">
          <div class="tags"></div>
          <div class="btnGroup">
            <Button type="primary" @click="ok">确定</Button>
            <Button @click="cancel">取消</Button>
          </div>
        </div>
        </Col>
      </Row>
    </div>
    <div style="padding-top: 20px">
      <span style="font-size: 14px">搜索字符：</span>
      <Input placeholder="SKU、商品名称" style="width: 200px" v-model.trim="goodsSkuName"></Input>
      <Button type="primary" @click="search" style="margin: 0 10px;">搜索</Button>
      <Checkbox v-model="single">模糊搜索</Checkbox>
    </div>
    <div style="padding-top: 20px; height: 520px">
      <Row>
        <Col span="5">
        <Card dis-hover style="overflow-x: scroll; height: 450px">
          <div style="cursor: pointer;margin: 5px 0 0 18px;color: #2d8cf0;" v-if="treeData.length > 0"
            @click="exchangeTree">
            {{ showTree ? "全部收起" : "全部展开" }}
          </div>
          <Tree :data="treeData" @on-toggle-expand="changeExpand" @on-select-change="clickNode"></Tree>
        </Card>
        </Col>
        <Col span="18" style="margin-left: 10px; margin-top: -9px">
        <Table highlight-row border :columns="columns" :data="data" style="margin-top: 10px" height="450">
        </Table>
        <!--分页-->
        <div class="fr pages">
          <Page :total="tableItemTotal" :current="pageNum" show-total show-sizer show-elevator :page-size-opts="pageArray"
            style="margin-top: 10px" @on-change="pageNumChange" @on-page-size-change="pageSizeChange"></Page>
        </div>
        <Spin size="large" fix v-if="tableLoading"></Spin>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import productData from "@/assets/productData/productData.js";

export default {
  name: 'pdtProcessDtlAddPdt',
  props: [
    "sltOneOrMore",
    "singleExclude",
    "moreExclude",
    "selectGoodsList",
    "from",
    "showDataStatus"
  ], // from 为真则查所有产品
  mixins: [Mixin],
  data() {
    var v = this;
    return {
      showTree: true,
      goodsSkuName: "",
      productCategoryId: "",
      pageNum: 1,
      pageSize: 10,
      tableItemTotal: 0,
      tableLoading: false,
      single: false,
      treeData: [],
      saveSelectMore: [],
      columns: [
        {
          title: "序号",
          type: "index",
          width: 70,
          align: "center"
        },
        {
          title: "图片",
          key: "goodsUrl",
          width: 90,
          align: "center",
          render: (h, params) => {
            return this.tableImg(h, params, "goodsUrl");
          }
        },
        {
          title: "SKU",
          key: "goodsSku",
          align: "center",
          width: 90
        },
        {
          title: "SKU属性",
          key: "goodsAttributes",
          align: "center",
          width: 90
        },
        {
          title: "中文描述",
          key: "goodsCnDesc",
          align: "center",
          width: 90
        },
        {
          title: "英文描述",
          key: "goodsEnDesc",
          align: "center",
          width: 90
        },
        {
          title: "重量" + "(g)",
          key: "goodsWeight",
          align: "center",
          width: 90
        },
        {
          title: "长宽高" + "(cm)",
          key: "inventoryNumber",
          align: "center",
          width: 100,
          render: (h, params) => {
            return h("div", {}, [
              h(
                "span",
                {},
                params.row.goodsLength
                  ? params.row.goodsLength
                  : "0"
              ),
              h("span", {}, "*"),
              h(
                "span",
                {},
                params.row.goodsWidth
                  ? params.row.goodsWidth
                  : "0"
              ),
              h("span", {}, "*"),
              h(
                "span",
                {},
                params.row.goodsHeight
                  ? params.row.goodsHeight
                  : "0"
              )
            ]);
          }
        },
        {
          title: "不良品数量",
          key: "defectiveNumber",
          align: "center",
          width: 110,
          render: (h, params) => {
            return h("span", params.row.defectiveNumber || 0);
          }
        },
        {
          title: "库存数量",
          key: "inventoryNumber",
          align: "center",
          width: 90,
          render: (h, params) => {
            return h("span", params.row.inventoryNumber || 0);
          }
        },
        {
          title: "分配数量",
          key: "allottedNumber",
          align: "center",
          width: 90,
          render: (h, params) => {
            return h("span", params.row.allottedNumber || 0);
          }
        },
        {
          title: "冻结数量",
          key: "frozenNumber",
          align: "center",
          width: 90,
          render: (h, params) => {
            return h("span", params.row.frozenNumber || 0);
          }
        },
        {
          title: "可用数量",
          key: "availableNumber",
          align: "center",
          width: 90,
          render: (h, params) => {
            return h("span", params.row.availableNumber || 0);
          }
        },
        {
          title: "商品状态",
          key: "inventoryNumber",
          align: "center",
          width: 90,
          render: (h, params) => {
            let text = "";
            productData.productStatus.forEach((item) => {
              if (params.row.status === item.value) {
                text = item.label;
              }
            });
            return h("span", {}, text);
          }
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          fixed: "right",
          width: 100,
          render: function (h, params) {
            return h("div", {}, [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  style: {
                    display: !params.row.lightStatus
                      ? "block"
                      : "none"
                  },
                  on: {
                    click() {
                      v.data[params.index].lightStatus =
                        !params.row.lightStatus;
                      if (v.sltOneOrMore === "one") {
                        v.$parent.$parent.addProductModal = false;
                        v.$emit(
                          "selectOver",
                          params.row
                        );
                      } else {
                        // 选择多个
                        let goodsId =
                          v.saveSelectMore.map(
                            (val) =>
                              val.goodsId
                                ? val.goodsId
                                : val.inventoryId
                          );
                        if (
                          goodsId.indexOf(
                            params.row.goodsId
                              ? params.row.goodsId
                              : params.row
                                .inventoryId
                          ) === -1
                        ) {
                          v.saveSelectMore.push(
                            params.row
                          );
                        }
                      }
                    }
                  }
                },
                "选择"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "warning",
                    size: "small"
                  },
                  style: {
                    display: params.row.lightStatus
                      ? "block"
                      : "none"
                  },
                  on: {
                    click() {
                      v.data[params.index].lightStatus =
                        !params.row.lightStatus;
                      let goodsId = v.saveSelectMore.map(
                        (val) =>
                          val.goodsId
                            ? val.goodsId
                            : val.inventoryId
                      );
                      if (
                        goodsId.indexOf(
                          params.row.goodsId
                            ? params.row.goodsId
                            : params.row.inventoryId
                        ) > -1
                      ) {
                        v.saveSelectMore.splice(
                          goodsId.indexOf(
                            params.row.goodsId
                          ),
                          1
                        );
                      }
                    }
                  }
                },
                "取消"
              )
            ]);
          }
        }
      ],
      data: []
    };
  },
  created() {
    this.getList();
    this.getTreeData();
  },
  methods: {
    getList() {
      // 获取到产品的列表
      let flag = "";
      if (this.sltOneOrMore === "one") {
        flag = this.singleExclude
          ? this.singleExclude.map((val) => val.productGoodsId)
          : null;
      } else {
        let arr = this.selectGoodsList.map((val) => val.productGoodsId);
        flag = this.moreExclude.productGoodsId
          ? [this.moreExclude.productGoodsId, ...arr]
          : [...arr];
      }
      let obj = {
        productCategoryId: this.productCategoryId,
        likeFlag: this.single ? "1" : "0",
        warehouseId: this.getWarehouseId(),
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        selectedProductGoodsIds: flag,
        goodsSkuName: this.goodsSkuName,
        // isAssemble: 0查普通sku  1查组合sku   2查全部sku
        isAssemble: this.showDataStatus === "onlineProduct" ? 2 : 1
      };

      // // 不需要显示组合产品的页面 ef;shl;谷仓;递四方;云仓;万邑通 或 showDataStatus 的值为 onlineProduct
      // if ([
      //   "/cloudProduct",
      //   "/fourPxProduct",
      //   "/efProduct",
      //   "/shlProduct",
      //   "/gcProduct",
      //   "/winitProduct",
      // ].includes(this.$route.path) || this.showDataStatus === "onlineProduct") {
      //   obj.isAssemble = 0;
      // }
      // // 展示全部产品 barn ef shl 4px cne fba novEire winit wms-amazonFBAManage yuncang
      // if (["/efProduct"].includes(this.$route.path)) {
      //   obj.isAssemble = 2;
      // }

      this.tableLoading = true;
      this.axios.post(this.from ? api.get_goodsList : api.get_outStockProduct, obj).then((res) => {
        if (res.data.code === 0) {
          this.data = [...this.processData(res.data.datas.list)];
          this.tableItemTotal = res.data.datas.total;
        }
        this.tableLoading = false;
      }).catch(() => {
        this.tableLoading = false;
      })
    },
    getTreeData() {
      // 获取树形结构数据
      let obj = { allFlag: "1" };
      this.axios.post(api.categoryList, obj).then((res) => {
        if (res.data.code === 0) {
          let objList = res.data.datas;
          let arr = this.changeChildToChildren(objList);
          this.treeData = this.treeData = [
            {
              title: "全部",
              expand: true,
              code: "",
              children: arr
            }
          ];
        }
      });
    },
    clickNode(val) {
      this.productCategoryId = val[0].code;
      this.getList();
    },
    changeChildToChildren(childList) {
      childList.forEach((val) => {
        val.title = val.name;
        val.children = val.child;
        val.expand = true;
        if (val.hasOwnProperty("child")) {
          val.children = this.changeChildToChildren(val.child);
        }
      });
      return childList;
    },
    processData(list) {
      list.forEach((val) => {
        val.lightStatus = false;
      });
      return list;
    },
    pageNumChange(num) {
      this.pageNum = num;
      this.getList();
    },
    pageSizeChange(size) {
      this.pageSize = size;
      this.getList();
    },
    ok() {
      this.$emit("selectMoreOver", this.saveSelectMore);
      this.$parent.$parent.addProductModal = false;
    },
    cancel() {
      this.$parent.$parent.addProductModal = false;
    },
    search() {
      this.getList();
    },
    closeTag(item, index) {
      let id = item.goodsId ? item.goodsId : item.inventoryId;
      let datasId = this.data.map((val) =>
        val.goodsId ? val.goodsId : val.inventoryId
      );
      if (datasId.indexOf(id) > -1) {
        this.data[datasId.indexOf(id)].lightStatus = false;
      }
      this.saveSelectMore.splice(index, 1);
    },
    changeExpand(data) {
      if (data.nodeKey === 0) {
        this.showTree = data.expand;
      }
    },

    // 展开或合并树，当flag为true时全部展开，flag为false时全部合并
    exchangeTree() {
      this.showTree = !this.showTree;
      this.treeData = this.treeChangeExpand(this.treeData, this.showTree);
    },

    // 递归给树设置expand
    treeChangeExpand(treeData, flag) {
      let v = this;
      for (let i = 0; i < treeData.length; i++) {
        v.$set(treeData[i], "expand", flag);
        if (treeData[i].children) {
          treeData[i].children = v.treeChangeExpand(
            treeData[i].children,
            flag
          );
        }
      }
      return treeData;
    }
  }
};
</script>

<style>
.text {
  height: 100px;
  padding: 10px 10px;
  font-size: 16px;
  font-weight: 600;
}

.btnGroup {
  position: absolute;
  right: 2px;
  bottom: 10px;
}

.addProductModal .ivu-checkbox-wrapper {
  display: inline-block;
}

.addProductModal .ivu-modal-footer {
  display: none;
}
</style>
