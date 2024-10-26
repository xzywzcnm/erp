<template>
  <Modal
    v-model="attrPrice"
    :title="attrPriceTitle"
    class="clearMarginAuto"
    @on-visible-change="attrPriceChange"
    width="960"
  >
    <p
      slot="header"
      @mousedown="moveMt"
      class="moveHead"
    >
      <span>{{ attrPriceTitle
        }}<span
          style="font-weight: normal; margin-left: 15px"
          v-show="
            $store.state.curNodeId === 3 && $store.state.curNodeControl === 999
          "
        >(报价的子产品的价格和重量为必填，如果子产品的重量和价格都不填，则代表不对这个子产品进行报价)</span></span>
    </p>
    <Table
      :columns="attrPriceColumns"
      :data="attrPriceDate"
      highlight-row
      :loading="loading"
    >
    </Table>
    <div slot="footer">
      <Button
        type="text"
        @click="attrPrice = false"
      >取消</Button>
      <Button
        type="primary"
        @click="addAttrPrice"
        v-show="$store.state.curNodeId === 3"
      >确定</Button>
    </div>
  </Modal>
</template>

<script>
import CommonMixin from "../../../components/mixin/commonMixin";
import api from "@/api/api";

export default {
  name: "commonAttrPrice",
  mixins: [CommonMixin],
  props: ["productAttrs", "attrPriceDateInit"],
  components: {},
  data() {
    // let v = this;
    return {
      attrPrice: false,
      attrPriceTitle: "多属性价格",
      attrPriceColumns: [],
      attrPriceDate: [],
      initDate: "",
      attrPriceDateArr: [],
      loading: false,
    };
  },
  created() {},
  methods: {
    changePage(page) {
      let v = this;
      v.attrPriceDate.splice(page * 10, page * 10 + 10);
    },
    attrPriceChange(val) {
      let v = this;
      if (val) {
        this.getVariList(function () {
          if (v.attrPriceDateInit) {
            v.attrPriceDateInit.forEach((item) => {
              v.attrPriceDate.forEach((priceItem) => {
                if (item.productGoodsId === priceItem.productGoodsId) {
                  priceItem.goodPrice = item.goodPrice;
                  priceItem.goodWeight = item.goodWeight;
                  priceItem.productGoodsId = item.productGoodsId;
                  priceItem.variQuotationId = item.variQuotationId;
                }
              });
            });
          }
        });
      }
    },
    getVariList(callback) {
      let v = this;
      v.loading = true;
      v.$axios
        .get(api.getQueryVari + "?productId=" + v.$store.state.createId)
        .then((res) => {
          v.loading = false;
          if (res.code === 0) {
            var data = res.datas;
            v.fixDate(data);
            callback && callback();
          }
        })
        .catch((err) => {
          v.loading = false;
          console.log(err);
        });
    },
    fixDate(data) {
      let v = this;

      if (data.length === 0) {
        v.attrPriceColumns = [];
        v.attrPriceDate = [];
        return;
      }

      let columns = [
        {
          title: "序号",
          width: 60,
          key: "index",
        },
      ];
      data[0].variTypeNameList.forEach((item, index) => {
        columns.splice(1, 0, {
          align: "center",
          title: item,
          minWidth: 100,
          index: index + 1,
          render: (h, params) => {
            return h("div", params.row.variationNameList[index]);
          },
        });
      });
      columns.push({
        align: "center",
        key: "goodWeight",
        width: 140,
        fixed: "right",
        renderHeader(h) {
          return h("div", {}, [
            h("span", "重量（g）"),
            (() => {
              if (
                v.$store.state.curNodeId === 3 &&
                v.$store.state.curNodeControl === 999
              ) {
                return h("Checkbox", {
                  on: {
                    "on-change"(val) {
                      if (val) {
                        if (v.attrPriceDate[0].goodWeight === "") {
                          v.$msg.error({
                            content: "请填写第一个重量",
                            duration: 5,
                          });
                          return;
                        }
                        v.attrPriceDate.forEach((item) => {
                          item.goodWeight = v.attrPriceDate[0].goodWeight;
                        });
                      }
                    },
                  },
                });
              }
            })(),
            (() => {
              if (
                v.$store.state.curNodeId === 3 &&
                v.$store.state.curNodeControl === 999
              ) {
                return h("span", "相同");
              }
            })(),
          ]);
        },
        render(h, params) {
          return h("local-input-number", {
            attrs: {
              disabled: (() => {
                if (
                  v.$store.state.curNodeId === 3 &&
                  v.$store.state.curNodeControl === 999
                ) {
                  return false;
                } else {
                  return true;
                }
              })(),
            },
            props: {
              min: 0,
              value: params.row.goodWeight,
            },
            on: {
              input: (val) => {
                let obj = JSON.parse(
                  JSON.stringify(v.attrPriceDate[params.index])
                );
                obj.goodWeight = val;
                v.attrPriceDate[params.index] = obj;
                // v.$set(v.attrPriceDate[params.index], 'goodWeight', val);
              },
            },
          });
        },
      });
      columns.push({
        align: "center",
        key: "goodPrice",
        width: 140,
        fixed: "right",
        renderHeader(h) {
          return h("div", {}, [
            h("span", "产品单价"),
            (() => {
              if (
                v.$store.state.curNodeId === 3 &&
                v.$store.state.curNodeControl === 999
              ) {
                return h("Checkbox", {
                  on: {
                    "on-change"(val) {
                      if (val) {
                        if (v.attrPriceDate[0].goodPrice === "") {
                          v.$msg.error({
                            content: "请填写第一个产品单价",
                            duration: 5,
                          });
                          return;
                        }
                        v.attrPriceDate.forEach((item) => {
                          item.goodPrice = v.attrPriceDate[0].goodPrice;
                        });
                      }
                    },
                  },
                });
              }
            })(),
            (() => {
              if (
                v.$store.state.curNodeId === 3 &&
                v.$store.state.curNodeControl === 999
              ) {
                return h("span", "相同");
              }
            })(),
          ]);
        },
        render(h, params) {
          return h("local-input-number", {
            attrs: {
              disabled: (() => {
                if (
                  v.$store.state.curNodeId === 3 &&
                  v.$store.state.curNodeControl === 999
                ) {
                  return false;
                } else {
                  return true;
                }
              })(),
            },
            props: {
              min: 0,
              value: params.row.goodPrice,
            },
            on: {
              input: (val) => {
                let obj = JSON.parse(
                  JSON.stringify(v.attrPriceDate[params.index])
                );
                obj.goodPrice = val;
                v.attrPriceDate[params.index] = obj;
                // v.$set(, 'goodPrice', val);
              },
            },
          });
        },
      });

      // 商品尺寸不要删
      // columns.push({
      //   align: "center",
      //   width: 350,
      //   fixed: "right",
      //   renderHeader(h) {
      //     return h("div", {}, [
      //       h("span", "商品尺寸(cm)"),
      //       (() => {
      //         return h("Checkbox", {
      //           style: {
      //             marginLeft: "6px",
      //           },
      //           on: {
      //             "on-change"(val) {
      //               if (!val) return;
      //               if (
      //                 !(
      //                   v.attrPriceDate[0].goodsLength &&
      //                   v.attrPriceDate[0].goodsWidth &&
      //                   v.attrPriceDate[0].goodsHeight
      //                 )
      //               ) {
      //                 v.$msg.error({
      //                   content: "请填写第一个商品尺寸",
      //                   duration: 5,
      //                 });
      //                 return;
      //               }
      //               v.attrPriceDate.forEach((item) => {
      //                 item.goodsLength = v.attrPriceDate[0].goodsLength;
      //                 item.goodsWidth = v.attrPriceDate[0].goodsWidth;
      //                 item.goodsHeight = v.attrPriceDate[0].goodsHeight;
      //               });
      //             },
      //           },
      //         });
      //       })(),
      //       h("span", "相同"),
      //     ]);
      //   },
      //   render: (h, params) => {
      //     return h(
      //       "div",
      //       {
      //         class: "mulInput",
      //       },
      //       [
      //         h("div", {}, [
      //           h("span", {}, "长"),
      //           h("Input", {
      //             props: {
      //               value: params.row.goodsLength,
      //             },
      //             attrs: {
      //               disabled: (() => {
      //                 if (
      //                   v.$store.state.curNodeId === 3 &&
      //                   v.$store.state.curNodeControl === 999
      //                 ) {
      //                   return false;
      //                 } else {
      //                   return true;
      //                 }
      //               })(),
      //             },
      //             class: "shotInput",
      //             on: {
      //               input: (value) => {
      //                 this.attrPriceDate[params.index].goodsLength = value;
      //               },
      //             },
      //           }),
      //         ]),
      //         h("div", {}, [
      //           h("span", {}, "宽"),
      //           h("Input", {
      //             props: {
      //               value: params.row.goodsWidth,
      //             },
      //             attrs: {
      //               disabled: (() => {
      //                 if (
      //                   v.$store.state.curNodeId === 3 &&
      //                   v.$store.state.curNodeControl === 999
      //                 ) {
      //                   return false;
      //                 } else {
      //                   return true;
      //                 }
      //               })(),
      //             },
      //             class: "shotInput",
      //             on: {
      //               input: (value) => {
      //                 this.attrPriceDate[params.index].goodsWidth = value;
      //               },
      //             },
      //           }),
      //         ]),
      //         h("div", {}, [
      //           h("span", {}, "高"),
      //           h("Input", {
      //             props: {
      //               value: params.row.goodsHeight,
      //             },
      //             attrs: {
      //               disabled: (() => {
      //                 if (
      //                   v.$store.state.curNodeId === 3 &&
      //                   v.$store.state.curNodeControl === 999
      //                 ) {
      //                   return false;
      //                 } else {
      //                   return true;
      //                 }
      //               })(),
      //             },
      //             class: "shotInput",
      //             on: {
      //               input: (value) => {
      //                 this.attrPriceDate[params.index].goodsHeight = value;
      //               },
      //             },
      //           }),
      //         ]),
      //       ]
      //     );
      //   },
      // });

      v.attrPriceColumns = columns;
      data.forEach((item, index) => {
        item.index = index + 1;
        if (item.goodPrice === undefined) {
          item.goodPrice = "";
        }
        if (item.goodWeight === undefined) {
          item.goodWeight = "";
        }

        // item.goodsHeight = item.goodsHeight || 0;
        // item.goodsLength = item.goodsLength || 0;
        // item.goodsWidth = item.goodsWidth || 0;
      });
      v.attrPriceDate = data;
    },
    addAttrPrice() {
      let obj = [];
      let v = this;
      let arr = [];
      // let productAttr = []; //商品尺寸

      v.attrPriceDate.forEach((item, index) => {
        let goodPrice = item.goodPrice;
        let goodWeight = item.goodWeight;
        if (goodPrice === undefined || goodPrice === null) {
          goodPrice = "";
        }
        if (goodWeight === undefined || goodWeight === null) {
          goodWeight = "";
        }
        if (goodPrice !== "" || goodWeight !== "") {
          if (goodPrice !== "" && goodWeight !== "") {
            obj.push({
              goodPrice: item.goodPrice, // 产品价格，必填
              goodWeight: item.goodWeight, // 产品重量，必填
              productGoodsId: item.productGoodsId, // 货品ID,关联货品信息表，不能为空
              variQuotationId: item.variQuotationId, // 多属性报价记录ID，修改时必需，新增时不需
              isDeleted: false, // 是否删除该条数据，true是，false或空为否
            });
          } else {
            if (goodPrice === "") {
              arr.push({
                index: index + 1,
                type: "价格",
              });
            } else if (goodWeight === "") {
              arr.push({
                index: index + 1,
                type: "重量",
              });
            }
          }
        }

        // productAttr.push({
        //   goodsLength: item.goodsLength,
        //   goodsWidth: item.goodsWidth,
        //   goodsHeight: item.goodsHeight,
        //   productGoodsId: item.productGoodsId,
        // });
      });

      if (arr.length > 0) {
        v.$msg.error({
          content: "单个序号的价格和重量不能只填一个！",
          duration: 5,
        });
        v.$msg.error({
          content: "序号" + arr[0].index + ":" + "请填写" + arr[0].type,
          duration: 5,
        });
      } else {
        v.attrPriceDateInit.forEach((item) => {
          if (JSON.stringify(obj).indexOf(item.productGoodsId) < 0) {
            obj.push({
              goodPrice: "",
              goodWeight: "",
              productGoodsId: item.productGoodsId,
              variQuotationId: item.variQuotationId,
              isDeleted: true,
            });
          }
        });
        v.$emit("getAttrPrice", { obj: obj });
        // v.$emit("getAttrPrice", { obj: obj, productAttr: productAttr });
        v.attrPrice = false;
      }
    },
  },
};
</script>

<style scoped></style>
