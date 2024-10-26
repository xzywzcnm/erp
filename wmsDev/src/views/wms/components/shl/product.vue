<template>
  <div>
    <commonProduct ref="commonProduct" :tableColumn="column" :getListApi="getListApi" :productSyncApi="productSyncApi"
      loadTemplateApi="/wms-service/template/shlProductInfo.xlsx" :importApi="importApi" :exportApi="exportApi"
      :synchronousGoods="true" :permissionKey="permissionKey" rowKey="wmsOutstoreProductId" warehouseType="shl"
      exportParams="wmsOutstoreProductId" @cancelRelated="cancelRelated">
      <!--slot-->
    </commonProduct>
    <!-- 关联sku -->
    <div v-if="addProductModal">
      <Modal class="addProductModal" v-model="addProductModal" title="关联 LAPA SKU">
        <!--singleExclude单个排除-->
        <pdtProcessDtlAddPdt :from="bool" :sltOneOrMore="sltOneOrMore" @selectOver="selectOver"
          showDataStatus="onlineProduct"></pdtProcessDtlAddPdt>
      </Modal>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import commonProduct from "@/views/wms/components/overseasWarehouseCompont/productCommon";
import pdtProcessDtlAddPdt from "@/views/wms/components/wms-inStock/pdtProcessDtlAddPdt";

export default {
  mixins: [Mixin],
  components: {
    commonProduct,
    pdtProcessDtlAddPdt
  },
  data() {
    let v = this;
    return {
      importApi: api.post_newImport, // 导入接口地址
      exportApi: api.post_newExport, // 导出接口地址
      getListApi: api.post_newQuery, // 列表接口地址
      productSyncApi: api.post_syncShlProduct, // 同步SHL商品信息
      wareId: this.getWarehouseId(), // 仓库ID
      permissionKey: {
        // 同步商品
        goodsKey: 'wmsOutstoreProductInfo_syncShlProduct',
        // 取消关联
        cancel: 'wmsOutstoreProductInfo_skuRelatedImport',
        // 导入关联
        relevancy: 'wmsOutstoreProductInfo_skuRelatedImport',
        // 导出
        export: 'wmsOutstoreProductInfo_export',
        // 查询
        query: 'wmsOutstoreProductInfo_query'
      },
      relatedObj: {
        firstShippingFee: 0,
        firstShippingFeeCurrency: null,
        wmsOutstoreProductId: null
      },
      addProductModal: false,
      sltOneOrMore: "one", // 单选or多选
      bool: true, // from 为真则查所有产品
      selectRow: [], // 关联选择的数据
      column: [
        {
          type: "selection",
          width: 60,
          align: "center"
        },
        {
          title: "图片",
          key: "goodsUrl",
          align: "center",
          width: 90,
          render: (h, params) => {
            if (this.$common.isEmpty(params.row.productGoodsId)) return h('div', '');
            return h('div', {
              style: {
                margin: '5px 0'
              }
            }, [this.tableImg(h, params, "erpProductImgUrl")]);
          }
        },
        {
          title: "SHL SKU",
          key: "productSku",
          align: "center",
          minWidth: 120
        },
        {
          title: "ERP SKU",
          key: "erpSku",
          align: "center",
          minWidth: 120,
          render: (h, { row }) => {
            let item = [
              h('p', {
                style: {
                  'text-decoration-line': [1, '1'].includes(row.del) ? 'line-through' : 'none'
                }
              }, row.erpSku)
            ];
            if ([1, '1'].includes(row.del)) {
              item.push(h('p', {
                style: {
                  'color': '#f20'
                }
              }, this.$common.isEmpty(row.erpSku) ? '' : '(已删除)'))
            }
            return h('div', item);
          }
        },
        {
          title: "SHL 中文名称",
          key: "productName",
          align: "center",
          minWidth: 170
        },
        {
          title: "ERP 中文名称",
          key: "erpCnName",
          align: "center",
          minWidth: 170
        },
        {
          title: "中文报关名",
          key: "declareCnName",
          align: "center",
          minWidth: 120
        },
        {
          title: "英文报关名",
          key: "declareEnName",
          align: "center",
          minWidth: 120
        },
        {
          title: "海关编码",
          key: "customsCode",
          align: "center",
          minWidth: 100
        },
        {
          title: "商品重量(kg)",
          key: "productWeight",
          align: "center",
          minWidth: 120
        },
        {
          title: "长宽高(cm)",
          key: "price",
          align: "center",
          minWidth: 120,
          render: (h, { row }) => {
            return h("div", [
              h('span', !this.$common.isEmpty(row.productLength) ? `${Number(row.productLength).toFixed(2)}*` : '0.00*'),
              h('span', !this.$common.isEmpty(row.productWidth) ? `${Number(row.productWidth).toFixed(2)}*` : '0.00*'),
              h('span', !this.$common.isEmpty(row.productHeight) ? `${Number(row.productHeight).toFixed(2)}` : '0.00')
            ]);
          }
        },
        {
          title: "关联ERP SKU",
          align: "center",
          minWidth: 120,
          render: (h, { row }) => {
            if (!v.getPermission("wmsOutstoreProductInfo_related")) {
              return h("span");
            }
            return h("div", {
              style: {
                color: "#008000",
                cursor: "pointer",
                textDecoration: "underline"
              },
              on: {
                click: () => {
                  this.bool = true;
                  this.sltOneOrMore = "one";
                  this.addProductModal = true;
                  this.relatedObj.firstShippingFee = row.firstShippingFee;
                  this.relatedObj.firstShippingFeeCurrency = row.firstShippingFeeCurrency;
                  this.relatedObj.wmsOutstoreProductId = row.wmsOutstoreProductId;
                }
              }
            }, !row.productGoodsId ? "未关联" : "重新关联");
          }
        },
        {
          title: "更新时间",
          key: "updatedTime",
          align: "center",
          minWidth: 150,
          render: (h, { row }) => {
            if (row.updatedTime) {
              return h("div", this.$uDate.dealTime(row.updatedTime));
            }
          }
        }
      ]
    };
  },
  methods: {
    searchList() {
      this.$refs.commonProduct.pageParamsStatus = true;
    },
    selectOver(selectRow) {
      // 选择sku后执行的操作
      let obj = {
        ...this.relatedObj,
        productGoodsId: selectRow.productGoodsId,
        warehouseId: this.wareId
      };
      this.axios.put(api.put_newRelated, obj).then((response) => {
        if (response.data.code === 0) {
          this.$Message.success("操作成功");
          this.searchList();
        }
      });
    },
    // 取消关联
    cancelRelated(pageQuery) {
      this.axios.delete(api.delete_newCancelRelated, { data: pageQuery }).then((res) => {
        if (res.data && res.data.code === 0) {
          this.$Message.success("操作成功");
          this.searchList();
        }
      })
    }
  }
};
</script>

<style>
.addProductModal .ivu-modal {
  width: 1000px !important;
}
</style>
