<template>
  <dyt-model :modalVisible.sync="modalVisible" @backList="backLists" :pageLoading="pageLoading">
    <div slot="lefts">
      <Button type="primary" @click="createStockOutList">创建出库单</Button>
      <Button class="ml10" @click="modalVisible = false">取消</Button>
    </div>
    <div class="newStockOutList mt10 formDetail">
      <Tabs value="main" class="formWidth240">
        <TabPane label="主信息" name="main">
          <Form :label-width="120" :rules="ruleValidate" :model="mainInfo" inline ref="main">
            <Form-item label="出库单号：">
              <div>保存后自动创建</div>
            </Form-item>
            <Form-item label="平台主体：" prop="platformType">
              <div v-if="platformList[mainInfo.platformType]">{{ platformList[mainInfo.platformType].label }}</div>
            </Form-item>
            <FormItem label="店铺：" prop="saleAccount">
              <div v-if="shopList[mainInfo.saleAccount]">{{ shopList[mainInfo.saleAccount].accountCode }}</div>
            </FormItem>
            <FormItem label="平台订单号：" prop="platformOrderNo">
              <Input v-model.trim="mainInfo.platformOrderNo" placeholder="" maxlength="20" show-word-limit></Input>
            </FormItem>
            <FormItem label="参考编号：" prop="referenceNo">
              <Input v-model.trim="mainInfo.referenceNo" placeholder=""></Input>
            </FormItem>
            <Form-item label="订单类型：" prop="orderType">
              <dyt-select v-model="mainInfo.orderType">
                <Option v-for="(item, index) in orderTypeList" :value="item.value" :key="index + 'orderType'"
                  :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="自动匹配库存：" prop="distributionType">
              <dyt-select v-model="mainInfo.distributionType">
                <Option v-for="(item, index) in autoInventoryList" :value="item.value" :key="index + 'distributionType'"
                  :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <!-- <Form-item label="质检类型：" prop="qualityCheckType">
              <dyt-select v-model="mainInfo.qualityCheckType" @on-change="checkTypeChange" :disabled="!!data.length">
                <Option v-for="(item, index) in checkTypeList" :value="item.value" :key="index + 'qualityCheckType'"
                  :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <FormItem label="质检比例：" prop="qualityCheckScale">
              <Input v-model.trim="mainInfo.qualityCheckScale"
                :disabled="!(mainInfo.qualityCheckType == 1) || !!data.length">
              <span slot="suffix" style="line-height: 32px">%</span>
              </Input>
            </FormItem> -->
            <FormItem label="备注：" prop="fbaRemark">
              <Input v-model.trim="mainInfo.fbaRemark" type="textarea" :autosize="{ minRows: 2, maxRows: 7 }"
                placeholder="备注信息"></Input>
            </FormItem>
          </Form>
        </TabPane>
      </Tabs>
      <div class="dtlMsg">
        <h3>商品信息</h3>
        <Alert style="
            height: 32px;
            line-height: 32px;
            margin: 0 0 0 20px;
            padding: 0 10px;
          ">
          提示：产品sku必须有第三方标签资料才允许添加，如更改换了SKU，使用新的SKU出库
        </Alert>
      </div>
      <div>
        <div class="mt10 mb10 flexCenter alignCenter justifyBetween">
          <Button type="primary" @click="addProductFn">添加产品</Button>
          <div>
            <Form :rules="qualityRule" :model="qualityConfig" inline ref="formQualitys" class="fmb0"
              :show-message="false">
              <Form-item label="设置质检数量：" :label-width="100" prop="qualityCheckType">
                <dyt-select v-model="qualityConfig.qualityCheckType" @on-change="qualityCheckTypeChange">
                  <Option v-for="(item, index) in checkTypeList" :value="item.value" :key="index + 'qualityCheckType'"
                    :label="item.label">
                  </Option>
                </dyt-select>
              </Form-item>
              <Form-item label="比例：" :label-width="60" prop="qualityCheckScale"
                v-if="['1'].includes(qualityConfig.qualityCheckType)">
                <Input v-model.trim.number="qualityConfig.qualityCheckScale" type="number">
                <span slot="suffix" style="line-height: 32px">%</span>
                </Input>
              </Form-item>
              <Form-item label="最小数量：" :label-width="80" prop="qualityCheckNum"
                v-if="['3'].includes(qualityConfig.qualityCheckType)">
                <Input v-model.trim.number="qualityConfig.qualityCheckNum" type="number" />
              </Form-item>
              <Form-item label="" :label-width="0" v-if="['1', '3'].includes(qualityConfig.qualityCheckType)">
                <Button type="primary" @click="qualitySet">设置</Button>
              </Form-item>
            </Form>
          </div>
        </div>
        <Table :columns="columns" :data="data" border :span-method="handleSpan" :loading="tableLoading"></Table>
        <div class="clear">
          <div class="fr pages">
            <Page :total="data.length" show-total :page-size-opts="pageArray" show-sizer show-elevator class="mt10">
            </Page>
          </div>
        </div>
      </div>

      <!--添加产品模态框-->
      <Modal class="addProductModal1 headerBar addProductBar" v-model="addProduct.visible" title="添加产品"
        :footer-hide="true">
        <addProduct :from="'allGoods'" @addProductSuccess="addProductSuccess" @addProductCancel="addProductCancel"
          :wareId="wareId" :eliminateData="data" v-if="addProduct.visible" :multiple="false"></addProduct>
      </Modal>

      <!-- 添加全托管商品模态框  @addStock="addStock"-->
      <fullManageProduct :modelVisible.sync="fullManageProductInfo.visible" :platformData="platformData"
        @fullProductData="fullProductData" :existGoodList="data" />
    </div>
  </dyt-model>
</template>
<script>
import Big from "big.js";
import api from "@/api/api";
import common from "@/components/mixin/common_mixin";
import addProduct from "@/views/wms/components/wms-inStock/newAddProduct";
import {
  outListTypeList,
  checkTypeList,
  arrayToObj,
  orderTypeList,
  autoInventoryList,
} from "./fileData";
import { getWarehouseId } from "@/utils/getService";
import fullManageProduct from "./fullManageProduct";

const mainInfo = {
  platformType: "",
  saleAccount: "",
  referenceNo: "",
  platformOrderNo: "",
  // qualityCheckType: "",
  // qualityCheckScale: "",
  orderType: "",
  distributionType: "",
  fbaRemark: null,
  pickingType: "O12",
  warehouseId: getWarehouseId(),
};
const qualityConfig = {
  qualityCheckType: null,
  qualityCheckScale: null,
  qualityCheckNum: 1,
}
export default {
  components: { addProduct, fullManageProduct },
  mixins: [common],
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    platformData: {
      type: Object,
      default() { return {} },
    },
  },
  data() {
    let v = this;
    return {
      modalVisible: false,
      pageLoading: false,
      checkTypeList: arrayToObj(checkTypeList),
      // expressCompanyList: [],
      wareId: getWarehouseId(),
      mainInfo: {},
      columns: [
        {
          title: "平台商品款式信息",
          key: "goodsUrl",
          minWidth: 180,
          render: (h, params) => {
            return h('div', {
              class: 'flexCenter'
            }, [
              this.tableImg(h, params, "goodsUrl"),
              h('div', {
                class: 'ml10'
              }, [
                h('div', '平台SKC：' + params.row.skc),
                h('div', '名称：' + params.row.productName),
              ])
            ])
          },
        },
        {
          title: "平台商品信息",
          key: "platformSku",
          minWidth: 150,
          render: (h, params) => {
            return h('div', [
              h('div', '平台SKU：' + params.row.platformSku),
              h('div', '条码编码：' + params.row.labelCode),
              h('div', '属性集：' + params.row.attributes),
            ])
          },
        },
        {
          title: "LAPA SKU",
          key: "lapaSku",
          minWidth: 90,
          render: (h, params) => {
            return h('div', {
              class: 'linkText cursorClick',
              on: {
                'click': () => {
                  this.addProduct.replaceSkuIndex = params.index;
                  this.addProduct.visible = true; // 打开添加产品模态层
                }
              }
            }, params.row.lapaSku || '匹配商品')
          },
        },
        {
          title: "LAPA 商品信息",
          key: "goodsUrl",
          minWidth: 180,
          render: (h, params) => {
            return h('div', {
              class: 'flexCenter',
              style: {
                display: params.row.lapaSku ? 'flex' : 'none'
              }
            }, [
              this.tableImg(h, params, "goodsUrl"),
              h('div', {
                class: 'ml10'
              }, [
                h('div', params.row.lapaSkuName),
                h('div', {
                  style: {
                    color: '#19be6b'
                  }
                }, params.row.spec),
                h('div', `重量：${params.row.weight || 0} 体积：${params.row.volume || 0}`),
              ])
            ])
          },
        },
        {
          title: "订单数量",
          key: "expectedNumber",
          minWidth: 100,
          render: (h, { row, index }) => {
            return h("div", {
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
                },
                style: {
                  width: '100%'
                },
                on: {
                  "on-change"(val) {
                    let num = val || 1;
                    v.$set(v.data[index], "expectedNumber", num);
                  },
                  "on-blur"() {
                    if ((new Big(row.expectedNumber || 0).minus(row.qualityCheckNumber || 0) - 0) < 0) {
                      v.$set(v.data[index], "qualityCheckNumber", row.expectedNumber);
                    }
                  },
                },
              }),
            ]);
          },
        },
        {
          title: "质检数量",
          key: "qualityCheckNumber",
          minWidth: 80,
          render: (h, { row, index }) => {
            // // 商品的质检数量=订单数量*质检比例，四舍五入
            // const mainInfo = v.mainInfo;
            // let result = Math.round(
            //   new Big(params.row.expectedNumber || 0).times(
            //     new Big(mainInfo.qualityCheckScale || 0).div(100)
            //   )
            // );
            // // 抽检的时候，小于1要取值1
            // if ([1, "1"].includes(mainInfo.qualityCheckType) && result < 1)
            //   result = 1;
            // return h("div", result);
            return h("div", {
              attrs: {
                class: 'hideStepStyles',
              },
            }, [
              h("InputNumber", {
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
                  "on-change": (num) => {
                    v.$set(v.data[index], "qualityCheckNumber", num);
                  },
                },
              }),
            ]);
          },
        },
        {
          title: "操作",
          key: "operator",
          minWidth: 70,
          render: (h, params) => {
            return h(
              "Button",
              {
                props: {
                  size: "small",
                  type: "error",
                },
                on: {
                  click: () => {
                    this.data.splice(params.index, 1);
                    this.handleRowsData([]);
                  },
                },
              },
              "删除"
            );
          },
        },
      ],
      data: [],
      ruleValidate: {
        referenceNo: [
          {
            type: "string",
            max: 32,
            message: "最多输入32个字符",
            trigger: "blur",
          },
        ],
        fbaRemark: [
          {
            type: "string",
            max: 100,
            message: "最多输入100个字符",
            trigger: "blur",
          },
        ],
        // qualityCheckType: [
        //   { required: true, message: "请选择", trigger: "change" },
        // ],
        orderType: [
          {
            required: true,
            message: "请选择",
            trigger: "change",
            type: "number",
          },
        ],
        distributionType: [
          {
            required: true,
            message: "请选择",
            trigger: "change",
            type: "number",
          },
        ],
        // qualityCheckScale: [{ validator: v.validateRate, trigger: "blur" }],
      },
      apiLogisterList: [], // 物流商下拉
      apiSendTypeList: [], // 邮寄方式下拉
      carrierId: "", // 选择物流商查邮寄方式的参数
      platformList: arrayToObj(outListTypeList),
      shopList: {},
      // countryList: [],
      orderTypeList: orderTypeList,
      autoInventoryList: autoInventoryList,
      fullManageProductInfo: {
        visible: false,
      },
      tableLoading: false,
      addProduct: {
        visible: false,
        replaceSkuIndex: null,
      },
      qualityConfig: {},
      qualityRule: {
        qualityCheckScale: [{ validator: v.validateRate, trigger: "blur" }],
        qualityCheckNum: [{ validator: v.validateNumber, trigger: "blur" }],
      },
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
    // 窗口打开
    open() {
      this.resetData();
      // this.getCountrys();
      // this.getLogistics();
      this.modalVisible = true;
    },
    resetData() {
      this.data = [];
      this.mainInfo = this.$common.copy(mainInfo);
      this.qualityConfig = this.$common.copy(qualityConfig);
      let { platformType, saleAccount } = this.platformData;
      this.mainInfo.platformType = platformType;
      this.mainInfo.saleAccount = saleAccount;
      this.platformChange(platformType);
      this.data = [];
    },
    // 关闭窗口
    backLists() {
      this.modalVisible = false;
    },
    // 根据平台获取对应的店铺信息
    platformChange(e) {
      let item = this.platformList[e] || {};
      this.$store
        .dispatch("getAllStoreList", { platformId: item.platformId })
        .then((list) => {
          this.shopList = arrayToObj(list, 'accountCode');
        });
    },
    // // 获取快递公司
    // getLogistics() {
    //   this.$store.dispatch("getLogisticsList").then((list) => {
    //     this.expressCompanyList = list;
    //   });
    // },
    // // 获取国家列表
    // getCountrys() {
    //   if (
    //     localStorage.getItem("area") === undefined ||
    //     localStorage.getItem("area") === []
    //   ) {
    //     localStorage.removeItem("area");
    //   }
    //   if (
    //     localStorage.getItem("area") !== "null" &&
    //     localStorage.getItem("area")
    //   ) {
    //     this.countryList = JSON.parse(localStorage.getItem("area"));
    //   } else {
    //     this.axios.get(api.get_countrys).then((response) => {
    //       if (response.data.code === 0) {
    //         let data = response.data.datas;
    //         this.countryList = data;
    //         localStorage.setItem("area", JSON.stringify(data));
    //       }
    //     });
    //   }
    // },
    // 选择普通商品返回(替换lapa sku)
    async addProductSuccess(data) {
      let goodItem = data[0] || {};
      // 新添加产品的"LAPA SKU"已存在，则不允许重复添加，限制一个出库单只允许有一个“LAPA SKU”
      let exsitList = this.data.filter(k => k.lapaSku === goodItem.goodsSku);
      if (exsitList.length) {
        this.$Message.error(`"LAPA SKU ${goodItem.goodsSku}"已存在，不允许重复添加！`);
        return;
      }
      this.addProduct.visible = false;
      const index = this.addProduct.replaceSkuIndex;
      goodItem.goodsVolume = (goodItem.goodsLength || 0) * (goodItem.goodsWidth || 0) * (goodItem.goodsHeight || 0);
      let replaceName = {
        'lapaSkuImageUrl': 'goodsUrl',
        'lapaSkuName': 'goodsCnDesc',
        'spec': 'goodsAttributes',
        'weight': 'goodsWeight',
        'volume': 'goodsVolume',
        'lapaSku': 'goodsSku',
        'productGoodsId': 'productGoodsId',
      }
      Object.keys(replaceName).forEach(key => {
        this.$set(this.data[index], key, goodItem[replaceName[key]])
      })
    },
    // 选择第三方商品返回
    fullProductData(list) {
      this.handleRowsData(list);
    },
    // 处理合并的数据
    handleRowsData(data = []) {
      this.tableLoading = true;
      try {
        let list = this.$common.copy([...this.data, ...data]);
        this.data = [];
        this.$nextTick(() => {
          let obj = {};
          list.forEach(k => {
            k.attributes = (k.skcSpecName ? k.skcSpecName + '-' : '') + k.skuSpecName;
            k.expectedNumber = k.expectedNumber || 1;// 订单数量
            k.qualityCheckNumber = k.qualityCheckNumber || 0;// 质检数量
            if (!obj[k.skc]) obj[k.skc] = [];
            obj[k.skc].push(k);
          })
          let arr = [];
          Object.keys(obj).forEach(k => {
            obj[k].forEach((j, i) => {
              obj[k][i].rowspan = i > 0 ? 0 : obj[k].length;
              obj[k][i].colspan = 1;
            })
            arr.push(...obj[k]);
          })
          this.data = arr;
          this.tableLoading = false;
        })
      } catch (err) {
        console.log(err, '出错')
        this.tableLoading = false;
      }
    },
    // // 根据所选择“平台主体”与“店铺”，匹配第三方标签资料的“客户SKU” （需求变动，暂时不删吧）
    // mateStoreLabel(productList) {
    //   return new Promise((resolve) => {
    //     let fun = () => {
    //       this.$Message.error(
    //         "添加商品失败，全托管出库单的商品必须有第三方标签资料"
    //       );
    //     };
    //     const productGoodsIdList = productList.map((k) => k.productGoodsId);
    //     const saleAccountIdList = Object.values(this.shopList)
    //       .filter((k) => {
    //         return k.accountCode === this.mainInfo.saleAccount;
    //       })
    //       .map((k) => k.saleAccountId);
    //     let params = { saleAccountIdList, productGoodsIdList };
    //     this.axios
    //       .post(api.directQueryThirdPartyLabelsInfo, params)
    //       .then(({ data }) => {
    //         if (data.code === 0) {
    //           let list = data.datas || [];
    //           let filterList = [];
    //           productList.forEach((k) => {
    //             list.forEach((lk) => {
    //               if (
    //                 k.productGoodsId === lk.productGoodsId &&
    //                 saleAccountIdList.includes(lk.saleAccountId)
    //               ) {
    //                 filterList.push({ ...k, barCode: lk.labelCode });
    //               }
    //             });
    //           });
    //           if (!filterList.length) fun();
    //           resolve(filterList);
    //         } else {
    //           fun();
    //           resolve([]);
    //         }
    //       })
    //       .catch(() => {
    //         fun();
    //         resolve([]);
    //       });
    //   });
    // },
    // // 质检类型对应质检比例
    // checkTypeChange(e) {
    //   const limit = this.checkTypeList[e] ? this.checkTypeList[e].limit : null;
    //   this.mainInfo.qualityCheckScale = limit;
    // },
    addProductCancel() {
      this.addProduct.visible = false;
    },
    backList() {
      this.$parent.workShow = "list";
    },
    // 添加商品前，必须要先选择“平台主体”与“店铺”
    addProductFn() {
      this.$refs["main"].validate((valid) => {
        if (valid) {
          this.fullManageProductInfo.visible = true;
        }
      });
      // this.fullManageProductInfo.visible = true;
    },
    createStockOutList() {
      let flag = true;
      ["main"].forEach((k) => {
        this.$refs[k].validate((valid) => flag && (flag = valid));
      });
      if (!flag) {
        this.$Message.warning("校验未通过");
        return;
      }
      let data = this.data;
      if (!data.length) {
        this.$Message.warning("请选择商品");
        return;
      }
      let temp = this.$common.copy(this.mainInfo);
      // 质检比例 = 总质检数量 / 总订单数量 * 100 %，百分比保留二位小数；
      // 质检类型，免检：当质检比例为0 %；全检：当质检比例为100 %；抽检：当质检比例为大于0 %，小于100 %；
      let qualityTotal = data.reduce((total, current) => {
        return total + (current.qualityCheckNumber || 0);
      }, 0);
      let expectedTotal = data.reduce((total, current) => {
        return total + (current.expectedNumber || 0);
      }, 0);
      let scaletotal = Number((new Big(qualityTotal).div(expectedTotal).times(100)).toFixed(2));
      scaletotal = new Big(scaletotal).div(100) - 0;

      let qualityCheckType = null;
      if (scaletotal === 0) qualityCheckType = '0';
      if (scaletotal === 1) qualityCheckType = '2';
      if (scaletotal > 0 && scaletotal < 1) qualityCheckType = '1';
      temp.qualityCheckType = qualityCheckType;
      temp.qualityCheckScale = scaletotal;
      // temp.qualityCheckScale = new Big(temp.qualityCheckScale).div(100) - 0;
      temp.wmsPickingExtend = {}; //旧代码遗留，要传，后端不改（摊手）
      temp.wmsPickingDetail = data.map(k => {
        return {
          productGoodsId: k.productGoodsId,
          barCode: k.labelCode,
          expectedNumber: k.expectedNumber,
          platSku: k.platformSku,
          platSkc: k.skc,
          qualityCheckNumber: k.qualityCheckNumber,
        }
      });
      // console.log(temp);
      // return;
      this.axios.post(api.fullManage_create, temp).then((res) => {
        if (res.data.code === 0) {
          this.$Message.success("创建成功");
          this.modalVisible = false;
          this.$emit("searchData");
        }
      });
    },
    handleSpan({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        const { rowspan, colspan } = row;
        return {
          rowspan,
          colspan
        }
      }
    },
    qualityCheckTypeChange() {
      const qualityCheckScale = 60;
      let type = this.qualityConfig.qualityCheckType;
      if (type === '1') {
        this.qualityConfig.qualityCheckScale = qualityCheckScale;
      }
      this.data.forEach(k => {
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
      this.$refs['formQualitys'].validate((valid) => {
        if (!valid) return;
        const qualityConfig = this.qualityConfig;
        let qualityCheckType = qualityConfig.qualityCheckType;
        let qualityCheckScale = qualityConfig.qualityCheckScale || 0;
        let qualityCheckNum = qualityConfig.qualityCheckNum || 0;
        this.data.forEach(k => {
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
  },
};
</script>
<style lang="less">
.newStockOutList {
  .dtlMsg {
    display: flex;
    align-items: center;
  }

  .back {
    padding: 10px 0;
  }

  .optBtn {
    width: 200px;
    margin: 0 auto;
    padding-top: 20px;
  }
}

.addProductModal1 .ivu-modal {
  width: 1110px !important;
}
</style>
