<template>
  <div>
    <commonProduct ref="commonProduct" :tableColumn="column" :productSyncApi="productSyncApi" :getListApi="getListApi"
      loadTemplateApi="/wms-service/template/outstoreProductInfo.xlsx" :importApi="importApi" :exportApi="exportApi"
      exportParams="wmsOutstoreProductId">
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
      importApi: api.post_wmsEfProductInfo_skuRelatedImport, // 导入接口地址
      exportApi: api.post_wmsEfProductInfo_export, // 导出接口地址
      getListApi: api.get_wmsEfProductInfo_query, // 列表接口地址
      productSyncApi: api.put_wmsEfProductInfo_sync, // 同步接口地址
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
          width: 100,
          render: (h, params) => {
            let imgUrlPrefix = this.$store.state.imgUrlPrefix;
            return h("img", {
              attrs: {
                src:
                  params.row.goodsUrl === "" ||
                    params.row.goodsUrl === null ||
                    params.row.goodsUrl === undefined
                    ? this.placeholderSrc
                    : imgUrlPrefix + params.row.goodsUrl
              },
              style: {
                width: "48px",
                height: "48px",
                border: "1px solid #d7dde4",
                padding: "4px",
                marginRight: "8px",
                marginTop: "6px",
                cursor: "pointer"
              }
            });
          }
        },
        {
          title: "SKU名称", // SKU名称
          key: "goodsSku",
          align: "center",
          minWidth: 200
        },
        {
          title: "是否含电池", // 是否含电池
          key: "includeBattery",
          align: "center",
          minWidth: 200,
          render(h, params) {
            let text = "";
            let includeBattery = params.row.includeBattery;
            text = includeBattery === "Y" ? "带电" : "不带电";
            return h("span", text);
          }
        },
        {
          title: "SKU状态", // SKU状态
          key: "productStatus",
          align: "center",
          minWidth: 200,
          render(h, params) {
            let data = params.row.productStatus;
            const textName = {
              X: "废弃",
              D: "草稿",
              S: "可用",
              W: "审核中",
              R: "审核不通过"
            };
            let text = data ? textName[data] : "";
            return h("span", text);
          }
        },
        {
          title: "商品编码",
          key: "skuCode",
          align: "center",
          minWidth: 200
        },
        {
          title: "卖方商品编码",
          key: "sellerSkuCode",
          align: "center",
          minWidth: 200
        },
        {
          title: "商品规格",
          key: "specification",
          align: "center",
          minWidth: 200
        },
        {
          title: "商品条码",
          key: "code",
          align: "center",
          minWidth: 150,
          render(h, params) {
            return h(
              "span",
              {
                style: {
                  fontFamily: "IDAutomationC128S"
                }
              },
              params.row.code
            );
          }
        },
        /* {
         title: '商品中文名称',
         key: 'cnName',
         align: 'center',
         minWidth: 150
         }, {
         title: '商品英文名称',
         key: 'enName',
         align: 'center',
         minWidth: 150
         }, */ {
          title: "头程成本",
          key: "firstShippingFee",
          align: "center",
          minWidth: 150,
          render(h, params) {
            if (params.row.firstShippingFee) {
              return h(
                "span",
                params.row.firstShippingFee +
                params.row.firstShippingFeeCurrency
              );
            }
          }
        },
        {
          title: "长宽高(cm)",
          key: "price",
          align: "center",
          minWidth: 120,
          render(h, params) {
            if (params.row.length) {
              return h(
                "span",
                params.row.length +
                "*" +
                params.row.width +
                "*" +
                params.row.height
              );
            }
          }
        },
        /* {
         title: '体积(立方米)',
         key: 'registerVolume',
         align: 'center',
         minWidth: 120
         }, */ {
          title: "重量(kg)",
          key: "weight",
          align: "center",
          minWidth: 150
        },
        {
          title: "商品描述",
          align: "center",
          minWidth: 150,
          key: "goodsCnDesc",
          render: (h, params) => {
            if (params.row.goodsCnDesc) {
              let text = "";
              if (params.row.isDelete === 1) {
                text = h("div", {}, [
                  h(
                    "span",
                    {
                      style: {
                        textDecoration: "line-through"
                      }
                    },
                    params.row.goodsSku
                  ),
                  h(
                    "span",
                    {
                      style: {
                        color: "red"
                      }
                    },
                    "(已删除)"
                  )
                ]);
              } else {
                text = h("p", {}, params.row.goodsSku);
              }
              return h("div", {}, [
                text,
                h("p", {}, params.row.goodsCnDesc)
              ]);
            }
          }
        },
        {
          title: "关联 LAPA SKU",
          align: "center",
          minWidth: 150,
          render: (h, params) => {
            if (
              !v.getPermission("wmsOutstoreProductInfo_related")
            ) {
              return h("span");
            }
            return h(
              "div",
              {
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
                    this.relatedObj.firstShippingFee =
                      params.row.firstShippingFee;
                    this.relatedObj.firstShippingFeeCurrency =
                      params.row.firstShippingFeeCurrency;
                    this.relatedObj.wmsOutstoreProductId =
                      params.row.wmsOutstoreProductId;
                  }
                }
              },
              !params.row.productGoodsId ? "未关联" : "重新关联"
            );
          }
        },
        {
          title: "更新时间",
          key: "updatedTime",
          align: "center",
          minWidth: 150,
          render: (h, params) => {
            if (params.row.updatedTime) {
              return h(
                "div",
                this.$uDate.dealTime(params.row.updatedTime)
              );
            }
          }
        }
      ]
    };
  },
  methods: {
    selectOver(selectRow) {
      // 选择sku后执行的操作
      let v = this;
      let obj = {
        ...v.relatedObj,
        productGoodsId: selectRow.productGoodsId
      };
      v.axios
        .put(api.efRelated, obj)
        .then((response) => {
          if (response.data.code === 0) {
            v.$Message.success("操作成功");
            v.$refs.commonProduct.pageParamsStatus = true;
          }
        });
    }
  }
};
</script>

<style>
.addProductModal .ivu-modal {
  width: 1000px !important;
}
</style>
