<template >
  <div>
    <!-- 人工匹配商品 -->
    <Modal
      :styles="{ top: '48px' }"
      v-model="matchingGoodsModal"
      v-if="matchingGoodsStatus"
      @on-cancel="closeMatchModal"
      title="人工匹配商品"
      :width="1200"
      class="matchingGoods"
      @on-visible-change="visibleFn"
      :mask-closable="false"
    >
      <!-- 已选择 -->
      <div class="chioseGoods">
        已选择:
        <div class="fr">
          <Button type="primary" @click="chioseSave" size="small">保存</Button>
          <Button class="ml10" @click="backDetail" size="small">返回 </Button>
        </div>
        <div class="mt10" v-if="matchingGoodsList.length <= 50">
          <div
            class="chioseGoodsList"
            v-for="(item, index) in matchingGoodsList"
            :key="index"
          >
            {{ item.sku }}
            <span v-if="showNumber">
              *
              <InputNumber
                :min="1"
                v-model.trim="item.quantity"
                style="width: 50px"
              ></InputNumber
            ></span>
            <span
              class="ml10"
              @click="delSku(index)"
              style="cursor: pointer;"
              >X</span
            >
          </div>
        </div>
        <div v-else class="mt10">
          {{ `已全选 ${matchingGoodsList.length} 个商品` }}
          <span class="ml10" @click="delAllSku" style="cursor: pointer;"
            >X</span
          >
        </div>
      </div>
      <!-- 搜索字符 -->
      <div class="tabChanger">
        <div v-if="cur === '1'">
          搜索字符:
          <Input
            placeholder="SPU、SKU、商品名称"
            v-model.trim="matchingGoodsParams1.searchValue"
            style="width: 200px"
          ></Input>
          <Button
            class="ml10"
            type="primary"
            size="small"
            @click="searchChar1"
            >查询
          </Button>
          <Checkbox class="ml10" v-model="fuzzySearch1"
            >模糊搜索
          </Checkbox>
        </div>
        <div v-if="cur === '2'">
          搜索字符:
          <Input
            placeholder="SPU、SKU、商品名称"
            v-model.trim="matchingGoodsParams2.searchValue"
            style="width: 200px"
          ></Input>
          <Button
            class="ml10"
            type="primary"
            size="small"
            @click="searchChar2"
            >查询
          </Button>
          <Checkbox class="ml10" v-model="fuzzySearch2"
            >模糊搜索
          </Checkbox>
        </div>
        <Tabs @on-click="resetSearchVal" :value="cur">
          <TabPane label="普通商品" name="1">
            <Row>
              <Col span="6">
                <div
                  style="
                    width: 260px;
                    height: 550px;
                    border: 1px solid #eee;
                    overflow: auto;
                  "
                >
                  <!-- <Input placeholder="请输入" v-model.trim="matchingGoodsParams1.productCategoryIds" icon="md-search" style="width:200px;marginLeft:25px;marginTop:10px;"></Input> -->
                  <div
                    style="
                      cursor: pointer;
                      margin: 5px 0 0 18px;
                      color: #2d8cf0;
                    "
                    v-if="categoryTree.length > 0"
                    @click="exchangeTree"
                  >
                    {{ showTree ? "全部收起" : "全部展开" }}
                  </div>
                  <Tree
                    ref="categoryTree"
                    :load-data="loadData"
                    :data="categoryTree"
                    @on-toggle-expand="changeExpand"
                    @on-select-change="view"
                  ></Tree>
                </div>
              </Col>
              <Col span="18">
                <div class="">
                  <Checkbox
                    v-if="openTalg === 'set_focus'"
                    v-model="norGoodsAll"
                    @on-change="SelectNorGoods"
                    >全选(所有结果集)
                  </Checkbox>
                  <Table
                    style="margin-top: 12px"
                    highlight-row
                    border
                    :loading="tableLoading"
                    :height="norGoodstableHeight"
                    :columns="norGoodsColumn"
                    :data="norGoodsData"
                  ></Table>
                  <div class="table-page flexBox">
                    <Page
                      :total="norGoodsTotal"
                      @on-change="norGoodsChangePage"
                      show-total
                      :page-size="matchingGoodsParams1.pageSize"
                      show-elevator
                      :current="norGoodsCurPage"
                      show-sizer
                      @on-page-size-change="norGoodsChangePageSize"
                      placement="top"
                      :page-size-opts="pageArray"
                    ></Page>
                  </div>
                </div>
              </Col>
            </Row>
          </TabPane>
          <TabPane label="映射商品" name="2">
            <Checkbox
              v-if="openTalg === 'set_focus'"
              v-model="mapGoodsAll"
              @on-change="SelectmapGoods"
              >全选(所有结果集)
            </Checkbox>
            <Table
              style="margin-top: 12px"
              @on-selection-change="getSelectValue2"
              highlight-row
              border
              :height="mapGoodstableHeight"
              :columns="mapGoodsColumn"
              :data="mapGoodsData"
            ></Table>
            <div class="table-page flexBox">
              <Page
                :total="mapGoodsTotal"
                @on-change="mapGoodsChangePage"
                show-total
                :page-size="matchingGoodsParams2.pageSize"
                show-elevator
                :current="mapGoodsCurPage"
                show-sizer
                @on-page-size-change="mapGoodsChangePageSize"
                placement="top"
                :page-size-opts="pageArray"
              ></Page>
            </div>
          </TabPane>
        </Tabs>
      </div>
      <div slot="footer"></div>
    </Modal>
  </div>
</template>

<script>
/**
 * 注：公共页面 所有接口用转接
 *
 * */
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import productData from "@/views/productCenter/components/productCenter/staticData/productData";

export default {
  mixins: [Mixin],
  props: {
    openTalg: String,
    orderInfo: [Object, String],
    typeStatus: [String, Number],
    productListData: Array,
    curIndex: [String, Number],
    inPage: [String, Number],
    skus: {
      type: Array,
      default: null,
    },
    showNumber: {
      type: Boolean,
      default: true,
    },
    choseData: Array, //
    prefix: {
      type: String,
      default: "/order-service", // 不是订单人工匹配（订单系统）调用此组件这个必填，还需保存用saveHandel方法接收
    },
    noPerson: {
      type: Boolean,
      default: false, // 不走人工匹配 直接返回数据
    },
  }, // orderInfo订单详情数据  typeStatus 1表示执行人工匹配功能,0表示执行添加产品的功能  productListData获取已有数据 curIndex记录点击包裹的下标  inPage如果所在页面为合并包括时，还需重置合并列表
  data() {
    let self = this;
    return {
      productStatus: productData.productStatus,
      showTree: true,
      filenodeViewTargetUrl: self.$store.state.erpConfig.filenodeViewTargetUrl, // filenode根路径
      chioseIndex: null, // 人工匹配商品的下标
      // 人工匹配商品模态框
      matchingGoodsStatus: false, // 点击人工匹配状态控制
      matchingGoodsModal: false,
      matchingGoodsParamsStatus1: false,
      matchingGoodsParams1: {
        // 普通商品
        searchValue: "",
        fuzzySearch: 0,
        productCategoryIds: [],
        pageNum: 1,
        pageSize: 10,
      },
      productCategoryId: "",
      matchingGoodsParamsStatus2: false,
      matchingGoodsParams2: {
        // 映射商品
        searchValue: "",
        fuzzySearch: 0,
        pageNum: 1,
        pageSize: 10,
      },
      matchingGoodsList: [], // 人工匹配 已选择商品
      chioseList1: [], // 普通商品选择数据
      chioseList2: [], // 映射商品选择数据
      fuzzySearch1: false,
      fuzzySearch2: false,
      goodsImageMap: null,
      norGoodsData: [],
      norGoodsColumn: [
        {
          title: "操作",
          width: 120,
          fixed: "left",
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  color: "#3399ff",
                  cursor: "pointer",
                },
                on: {
                  click: () => {
                    let productPic = null;
                    let goodsImageMap = self.goodsImageMap;
                    if (
                      goodsImageMap &&
                      goodsImageMap[params.row.productGoodsId]
                    ) {
                      productPic = goodsImageMap[params.row.productGoodsId][0];
                    }
                    if (productPic) {
                      params.row.productPic =
                        self.filenodeViewTargetUrl + "/thumb" + productPic;
                    } else {
                      params.row.productPic = null;
                    }
                    this.getSelectValue1(params.row, "single");
                  },
                },
              },
              "选择"
            );
          },
        },
        {
          title: "SPU",
          key: "spu",
          width: 80,
          align: "center",
        },
        {
          title: "商品图片",
          key: "productPic",
          minWidth: 100,
          align: "center",
          render: (h, params) => {
            let productPic = null;
            let goodsImageMap = self.goodsImageMap;
            if (goodsImageMap && goodsImageMap[params.row.productGoodsId]) {
              productPic = goodsImageMap[params.row.productGoodsId][0];
            }
            return self.tableImg(h, params, "", productPic);
          },
        },
        {
          title: "SKU",
          key: "sku",
          width: 80,
          align: "center",
        },
        {
          title: "SKU属性",
          key: "",
          minWidth: 100,
          render: (h, params) => {
            let specificationsList = params.row.productGoodsSpecifications;
            let pos = "";
            if (!this.$common.isEmpty(specificationsList)) {
              if (specificationsList.length) {
                specificationsList.forEach((n, i) => {
                  pos += n.value + ".";
                });
                pos = pos.substr(0, pos.length - 1);
              }
            }
            return h("div", pos);
          },
        },
        {
          title: "商品中文名称",
          key: "cnName",
          minWidth: 120,
          align: "center",
        },
        {
          title: "商品英文名称",
          key: "enName",
          minWidth: 120,
          align: "center",
        },
        {
          title: "重量(g)",
          key: "weight",
          minWidth: 100,
          align: "center",
        },
        {
          title: "长宽高(cm)",
          key: "",
          minWidth: 160,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              params.row.length +
                "*" +
                params.row.width +
                "*" +
                params.row.height
            );
          },
        },
        {
          title: "特性标签",
          key: "",
          minWidth: 150,
          render: (h, params) => {
            let orderTagList = params.row.productGoodsTags;
            let pos = [];
            if (!this.$common.isEmpty(orderTagList)) {
              orderTagList.forEach((n, i) => {
                let item = h("div", [
                  h("Icon", {
                    props: {
                      type: "pricetag",
                      color: "#f00",
                    },
                    style: {
                      marginRight: "5px",
                    },
                  }),
                  h("span", n),
                ]);
                pos.push(item);
              });
              return h("div", pos);
            }
          },
        },
        {
          title: "商品状态",
          key: "status",
          minWidth: 150,
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
      mapGoodsData: [],
      mapGoodsColumn: [
        {
          title: "操作",
          width: 120,
          fixed: "left",
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  color: "#3399ff",
                  cursor: "pointer",
                },
                on: {
                  click: () => {
                    this.getSelectValue2(params.row, "single");
                  },
                },
              },
              "选择"
            );
          },
        },
        {
          title: "映射商品编码",
          key: "sku",
          align: "center",
        },
        {
          title: "映射商品名称",
          key: "name",
          align: "center",
        },
        {
          title: "映射商品",
          align: "center",
          render: (h, params) => {
            let productSkuMappingDetails = params.row.productSkuMappingDetails;
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
      ],
      norGoodsTotal: 0,
      norGoodsCurPage: 1,
      norGoodsTotalPage: 0,
      mapGoodsTotal: 0,
      mapGoodsCurPage: 1,
      mapGoodsTotalPage: 0,
      cur: "1",
      categoryTree: [
        // 分类树
        {
          title: "全部分类",
          expand: true,
          productCategoryId: "",
          selected: true,
          children: [],
        },
      ],
      norGoodsAll: false,
      mapGoodsAll: false,
    };
  },
  computed: {
    mapGoodstableHeight() {
      return this.getTableHeight(420);
    },
    norGoodstableHeight() {
      return this.getTableHeight(420);
    },
  },
  watch: {
    matchingGoodsParamsStatus1(n) {
      let v = this;
      if (n) {
        v.getNormalGoodsData();
        v.matchingGoodsParamsStatus1 = false;
      }
    },
    matchingGoodsParamsStatus2(n) {
      // 触发更新
      let v = this;
      if (n) {
        v.getMapGoodsData();
        v.matchingGoodsParamsStatus2 = false;
      }
    },
    cur(n, o) {
      let v = this;
      if (n !== o && n === "1") {
        v.getNormalGoodsData();
      } else {
        v.getMapGoodsData();
      }
    },
  },
  created() {
    let v = this;
    v.selectedProductCategory = v.categoryTree[0];
    v.$Loading.start();
    Promise.resolve(v.getTreeData()).then(() => {
      v.$Loading.finish();
    });
  },
  methods: {
    visibleFn(open) {
      if (open) {
        this.matchingGoodsParams1.searchValue = "";
        if (this.choseData) {
          this.matchingGoodsList = this.choseData;
          this.chioseList1 = this.choseData;
        } else {
          this.chioseList1 = [];
          this.chioseList2 = [];
        }
      }
    },
    searchChar1() {
      // 人工匹配商品 搜索字符
      let v = this;
      v.matchingGoodsParams1.pageNum = 1;
      v.norGoodsCurPage = 1;
      v.matchingGoodsParamsStatus1 = true;
    },
    searchChar2() {
      // 人工匹配商品 搜索字符
      let v = this;
      v.matchingGoodsParams2.pageNum = 1;
      v.mapGoodsCurPage = 1;
      v.matchingGoodsParamsStatus2 = true;
    },
    resetSearchVal(name) {
      // 切换列表
      let v = this;
      if (name !== v.cur) {
        // v.matchingGoodsParams.matchingGoodsValue = '';
        // v.matchingGoodsParams.pageNum = 1;
        // v.matchingGoodsParams.pageSize = 10;
        // v.fuzzySearch = false;
        v.cur = name;
      }
    }, // 获取普通商品列表
    getNormalGoodsData() {
      let v = this;
      let pos = [];
      let productGoodsIds = [];
      // 是否模糊查询 0否 1是
      if (v.fuzzySearch1) {
        v.matchingGoodsParams1.fuzzySearch = 1;
      } else {
        v.matchingGoodsParams1.fuzzySearch = 0;
      }

      // 分类id
      if (v.productCategoryId !== "" && v.productCategoryId !== null) {
        let categoryList = [];
        categoryList.push(v.productCategoryId);
        v.matchingGoodsParams1.productCategoryIds = categoryList;
      } else {
        v.matchingGoodsParams1.productCategoryIds = [];
      }
      v.tableLoading = true;
      v.axios
        .post(v.prefix + api.query_productGoods, v.matchingGoodsParams1)
        .then((response) => {
          v.tableLoading = false;
          if (response.data.code === 0 && response.data.datas) {
            let data = response.data.datas;
            v.norGoodsAll = false;
            if (v.norGoodsData.length === 0 && v.skus && v.skus.length > 0) {
              v.getSeletedSkusData(data.list);
            }
            data.list.forEach((n, i) => {
              pos.push(n);
              productGoodsIds.push(n.productGoodsId);
            });
            Promise.resolve(v.getGoodsImageMap(productGoodsIds)).then(
              (result) => {
                v.norGoodsData = pos;
                v.$nextTick(function () {
                  v.norGoodsTotal = Number(data.total);
                });
              }
            );
          }
        });
    }, // 站内信自动规则拼接已选内容
    getSeletedSkusData(norGoodsData) {
      let v = this;
      v.getMapGoodsData().then((result) => {
        let arr = [];
        let cacheSku = [];
        let chioseList1Arr = []; // 普通已选拼接
        let chioseList2Arr = []; // 映射已选拼接
        result.forEach((n, i) => {
          n.productSkuMappingDetails.forEach((m, t) => {
            v.skus.forEach((g, k) => {
              if (m.sku === g && cacheSku.indexOf(g) < 0) {
                cacheSku.push(g);
                arr.push(m);
                chioseList2Arr.push(m);
              }
            });
          });
        });
        norGoodsData.forEach((n, i) => {
          v.skus.forEach((m, t) => {
            if (n.sku === m && cacheSku.indexOf(m) < 0) {
              arr.push(n);
              chioseList1Arr.push(n);
            }
          });
        });
        v.matchingGoodsList = arr;
        v.chioseList1 = chioseList1Arr;
        v.chioseList2 = chioseList2Arr;
      });
    }, // 获取映射商品列表
    getMapGoodsData() {
      let v = this;
      return new Promise((resolve) => {
        let pos = [];
        // 是否模糊查询 0否 1是
        if (v.fuzzySearch2) {
          v.matchingGoodsParams2.fuzzySearch = 1;
        } else {
          v.matchingGoodsParams2.fuzzySearch = 0;
        }
        v.axios
          .post(v.prefix + api.query_productSkuMapping, v.matchingGoodsParams2)
          .then((response) => {
            if (response.data.code === 0) {
              let data = response.data.datas;
              v.mapGoodsAll = false;
              if (data && data.list) {
                data.list.forEach((n, i) => {
                  pos.push(n);
                });
                v.mapGoodsData = pos;
              } else {
                v.mapGoodsData = [];
              }
              v.mapGoodsTotal = data.total;
              resolve(v.mapGoodsData);
            }
          });
      });
    },
    norGoodsChangePage(page) {
      // 分页切换
      let v = this;
      v.matchingGoodsParams1.pageNum = page;
      v.matchingGoodsParamsStatus1 = true;
      v.norGoodsCurPage = page;
    },
    norGoodsChangePageSize(pageSize, plat) {
      let v = this;
      v.matchingGoodsParams1.pageSize = pageSize;
      v.matchingGoodsParamsStatus1 = true;
    },
    mapGoodsChangePage(page) {
      // 分页切换
      let v = this;
      v.matchingGoodsParams2.pageNum = page;
      v.matchingGoodsParamsStatus2 = true;
      v.mapGoodsCurPage = page;
    },
    mapGoodsChangePageSize(pageSize, plat) {
      let v = this;
      v.matchingGoodsParams2.pageSize = pageSize;
      v.matchingGoodsParamsStatus2 = true;
    },
    getGoodsImageMap(productGoodsIds) {
      // 获取货品图片Map
      var v = this;
      return new Promise((resolve) => {
        if (productGoodsIds && productGoodsIds.length > 0) {
          v.axios
            .post(
              v.prefix +
                api.query_productImgs +
                "?time=" +
                new Date().getTime(),
              productGoodsIds
            )
            .then(function (response) {
              if (response.data.code === 0) {
                v.goodsImageMap = response.data.datas;
              }
              resolve(true);
            });
        } else {
          resolve(true);
        }
      });
    }, // 根据 productGoodsId 去重数组
    unique(arr, key) {
      const res = new Map();
      return arr.filter((a) => !res.has(a[key]) && res.set(a[key], 1));
    },

    // 普通商品选择商品
    getSelectValue1(val, type) {
      let v = this;
      let pos = [];
      // v.matchingGoodsList = [];
      // 选择单个时
      if (type === "single") {
        pos.push({
          ...val,
          businessId: val.productGoodsId,
          productName: val.cnName,
          quantity: 1,
          source: 1,
          productWeight: val.weight,
          productStatus: val.status,
        });
        // 判断已选择商品列表中是否已有当前选择项 有的话数量加1，无则新增
        let data = [];
        let talg = true;
        if (v.showNumber) {
          v.matchingGoodsList.forEach((n, i) => {
            if (!n.quantity) n.quantity = 1;
            if (n.productGoodsId === pos[0].productGoodsId) {
              talg = false;
              v.$set(v.matchingGoodsList[i], "quantity", (n.quantity += 1));
            }
          });
          let newArr = [];
          if (!talg) {
            newArr = v.matchingGoodsList;
          } else {
            newArr = [...v.matchingGoodsList, ...pos];
          }
          data = newArr;
        } else {
          let newArr = [...v.matchingGoodsList, ...pos];
          data = v.unique(newArr, "productGoodsId");
        }
        if (v.matchingGoodsList.length > 0) {
          v.chioseList1 = data;
        } else {
          // 已选商品列表为空，直接新增
          v.chioseList1 = pos;
        }
      } else if (type === "all") {
        // 全选时
        if (val.length > 0) {
          val.map((item) => {
            pos.push({
              ...item,
              businessId: item.productGoodsId,
              productName: item.cnName,
              quantity: 1,
              spu: item.spu,
              source: 1,
              productWeight: item.weight,
              productStatus: item.status,
            });
          });
          // 判断已选择商品列表中是否已有当前选择项 有的话数量加1，无则新增
          let newArr = [...v.matchingGoodsList, ...pos];
          let data = [];
          // showNumber === true 时，不需要去重，可以有多个商品，为false时，只能选择单个商品，全选时需要去重商品
          if (v.showNumber) {
            newArr.forEach((n, i) => {
              if (!n.quantity) n.quantity = 1;
              pos.forEach((item) => {
                if (n.productGoodsId === item.productGoodsId) {
                  v.$set(newArr[i], "quantity", (n.quantity += 1));
                }
              });
            });
            data = newArr;
          } else {
            data = v.unique(newArr, "productGoodsId");
          }

          if (v.matchingGoodsList.length > 0) {
            v.chioseList1 = data;
          } else {
            // 已选商品列表为空，直接新增
            v.chioseList1 = pos;
          }
        }
      }

      // 判断变参商品是否有已选择，有则比较是否有相同项（有相同的话数量相加，无相同则拼接两个表格已选项）， 无则已选择列表为chioseList1
      if (v.chioseList2.length) {
        let chioseStatus = false; // 判断是否有相同项
        // let chioseIndex = null; // 记录相同项的下标
        for (let j = 0; j < v.chioseList2.length; j++) {
          if (!v.chioseList2[j].quantity) v.chioseList2[j].quantity = 1;
          for (let k = 0; k < pos.length; k++) {
            if (v.chioseList2[j].productGoodsId === pos[k].productGoodsId) {
              chioseStatus = true;
              // chioseIndex = k;
            } else {
              chioseStatus = false;
            }
            if (chioseStatus) {
              // v.chioseList2[j].quantity += 1;
              // v.chioseList1.splice(chioseIndex, 1);
            }
          }
        }
        if (v.chioseList1.length) {
          // matchingGoodsList需要拼接已选选项
          // v.matchingGoodsList = v.chioseList2.concat(v.chioseList1);
          v.matchingGoodsList = v.unique(
            v.chioseList2.concat(v.chioseList1),
            "productGoodsId"
          );
        } else {
          // v.matchingGoodsList = v.chioseList2;
          v.matchingGoodsList = v.unique(v.chioseList2, "productGoodsId");
        }
      } else {
        v.$nextTick(function () {
          v.matchingGoodsList = v.chioseList1;
        });
      }
    },

    // 映射商品选择数据
    getSelectValue2(val, type) {
      let v = this;
      let pos = [];
      let newArr = [];
      if (type === "single") {
        let arr1 = val.productSkuMappingDetails;
        arr1.map((ele) => {
          ele["productSkuMappingId"] = val.productSkuMappingId;
          ele["name"] = val.name;
        });
        newArr = arr1;
      } else if (type === "all") {
        let arr1 = [];
        val.map((item) => {
          item.productSkuMappingDetails.map((ele) => {
            ele["productSkuMappingId"] = item.productSkuMappingId;
            ele["name"] = item.name;
          });
          arr1 = [...arr1, ...item.productSkuMappingDetails];
        });
        newArr = arr1;
      }
      if (newArr.length) {
        let skuList = newArr;
        for (let i = 0; i < skuList.length; i++) {
          pos.push({
            businessId: skuList[i].productSkuMappingId,
            productGoodsId: skuList[i].productGoodsId,
            sku: skuList[i].sku,
            quantity: skuList[i].quantity,
            source: 2,
            productName: skuList[i].name,
          });
        }
        // 判断已选择商品列表中是否已有当前选择项 有的话数量加1，无则新增
        if (v.chioseList2 && v.chioseList2.length) {
          let status = false; // 判断是否有相同项
          let index = null; // 记录相同项的下标
          for (let m = 0; m < pos.length; m++) {
            for (let n = 0; n < v.chioseList2.length; n++) {
              if (pos[m].productGoodsId === v.chioseList2[n].productGoodsId) {
                status = true;
                index = n;
              }
            }
            if (status) {
              v.chioseList2[index].quantity += pos[m].quantity;
            } else {
              v.chioseList2.push(pos[m]);
            }
            status = false;
          }
        } else {
          // 已选商品列表为空，直接新增
          v.chioseList2 = pos;
        }
      }
      // 判断普通商品是否有已选择，有则比较是否有相同项（有相同的话数量相加，无相同则拼接两个表格已选项）， 无则已选择列表为chioseList2
      if (v.chioseList1.length) {
        let chioseStatus = false; // 判断是否有相同项
        let chioseIndex = null; // 记录相同项的下标
        for (let j = 0; j < v.chioseList2.length; j++) {
          for (let k = 0; k < v.chioseList1.length; k++) {
            if (
              v.chioseList2[j].productGoodsId ===
              v.chioseList1[k].productGoodsId
            ) {
              chioseStatus = true;
              chioseIndex = k;
            } else {
              chioseStatus = false;
            }
            if (chioseStatus) {
              v.chioseList2[j].quantity =
                v.chioseList2[j].quantity + v.chioseList1[chioseIndex].quantity;
              v.chioseList1.splice(chioseIndex, 1);
            }
          }
        }
        if (v.chioseList1.length) {
          // v.matchingGoodsList = v.chioseList1.concat(v.chioseList2);
          v.matchingGoodsList = v.unique(
            v.chioseList1.concat(v.chioseList2),
            "productGoodsId"
          );
        } else {
          // v.matchingGoodsList = v.chioseList2;
          v.matchingGoodsList = v.unique(v.chioseList2, "productGoodsId");
        }
      } else {
        // v.matchingGoodsList = v.chioseList2;
        v.matchingGoodsList = v.unique(v.chioseList2, "productGoodsId");
      }
    },
    chioseSave() {
      // 人工匹配保存
      let v = this;
      if (v.matchingGoodsList.length === 0) {
        v.$Message.error("请选择商品");
        return false;
      }
      if (v.prefix !== "/order-service" || v.noPerson) {
        // 不是商品人工匹配 走此方法
        v.$emit("saveHandel", v.matchingGoodsList);
        return;
      }

      if (v.typeStatus === 1) {
        // 人工匹配
        let index = v.chioseIndex;
        v.matchingGoodsModal = false;
        if (v.matchingGoodsList.length) {
          let productTitle = this.orderInfo.orderTransactions[index].title;
          if (this.$common.isEmpty(productTitle)) {
            let productInfo = this.matchingGoodsList.find(f => !this.$common.isEmpty(f.cnName));
            if (this.$common.isEmpty(productInfo)) {
              productInfo = this.matchingGoodsList.find(f => !this.$common.isEmpty(f.productName)) || {};
            }
            productTitle = productInfo.cnName || productInfo.productName;
          }
          let obj = {
            insertProductSkuMappingDetailBos: v.matchingGoodsList,
            sku: v.orderInfo.orderTransactions[index].sku || v.orderInfo.orderTransactions[index].webstoreSku,
            businessId: v.orderInfo.orderTransactions[index].businessId,
            productName: v.orderInfo.orderTransactions[index].productName,
            title: productTitle,
            variations: v.orderInfo.orderTransactions[index].variations,
            webstoreItemId: v.orderInfo.orderTransactions[index].webstoreItemId,
            productWeight: v.orderInfo.orderTransactions[index].weight,
            productGoodsTags: v.orderInfo.orderTransactions[index].productGoodsTags,
            productStatus: v.orderInfo.orderTransactions[index].status,
          };
          v.axios.post(v.prefix + api.create_productSkuMap, obj).then((response) => {
            if (response.data.code === 0) {
              v.matchingGoodsList = []; // 清空已选择数据
              v.chioseList1 = [];
              v.chioseList2 = [];
              let data = response.data.datas;
              if (v.$common.isEmpty(data)) {
                let mathObj = {
                  businessId: data.businessId,
                  orderId: v.orderInfo.orderTransactions[index].orderId,
                  orderTransactionId:
                      v.orderInfo.orderTransactions[index].orderTransactionId,
                  productName: data.productName,
                  source: 2,
                };
                v.axios.post(api.erpService + api.match_productGoodMatch, mathObj).then((response) => {
                  if (response.data.code === 0) {
                    v.$parent.$parent.updateStatus = true;
                    v.$parent.$parent.$parent.$parent.getList(); // 刷新列表
                    v.$parent.marryStatus = false;
                    v.$emit("updateOrder", { index: index, item: 'again' });
                    if (v.inPage === "combineOrder") {
                      v.$store.commit("combineStatus", true);
                    }
                  } else {
                    v.$parent.marryStatus = false;
                  }
                }).finally(() => {
                  // v.deleteProductSkuMap(data.businessId);
                });
              } else {
                v.$parent.marryStatus = false;
              }
            } else {
              v.$parent.marryStatus = false;
            }
          });
        } else {
          v.$parent.marryStatus = false;
        }
      } else if (v.typeStatus === 0) {
        // 产品添加
        if (v.matchingGoodsList.length) {
          let status = false; // 判断SKU是否匹配，状态值
          let box = [];
          v.matchingGoodsList.forEach((v, y) => {
            box.push(v.productGoodsId);
          });
          Promise.resolve(v.getGoodsImageMap(box)).then((result) => {
            v.matchingGoodsList.forEach((s, p) => {
              if (v.goodsImageMap && v.goodsImageMap[s.productGoodsId]) {
                s.pictureUrl = v.goodsImageMap[s.productGoodsId][0];
              } else {
                s.pictureUrl = null;
              }
            });
            // v.curIndex是编辑的包裹的下标
            v.matchingGoodsList.forEach((n, i) => {
              n.orderId = v.orderInfo.orderId;
              n.remark = null;
              n.goodsQuantity = n.quantity;
              n.group = v.curIndex;
              v.productListData.forEach((m, t) => {
                m.goodsQuantity = m.quantity;
                if (n.sku === m.sku) {
                  v.productListData[t] = { ...m, ...n };
                  m.goodsQuantity += n.quantity;
                  m.quantity += n.quantity;
                  status = true;
                }
              });
              if (!status) {
                v.productListData.push(n);
              }
              status = false;
            });
            v.$emit("editData", v.productListData); // 触发editData方法，向父组件传递数据
          });
        }
      } else if (v.typeStatus === 3) {
        // 站内信自动发送规则
        let arr = [];
        v.matchingGoodsList.forEach((n, i) => {
          arr.push(n.sku);
        });
        v.$emit("concatSku", arr);
        v.$nextTick(function () {
          v.cur = "1";
          v.matchingGoodsModal = false;
        });
      }
    },
    backDetail() {
      // 人工匹配模态框 返回
      let v = this;
      v.matchingGoodsList = [];
      v.chioseList1 = [];
      v.chioseList2 = [];
      v.matchingGoodsModal = false;
      v.$parent.marryStatus = false;
    },
    closeMatchModal() {
      // 模态框关闭时 清空已选择列表
      let v = this;
      v.backDetail();
    },
    delSku(index) {
      // 删除已选择
      let v = this;
      let id = v.matchingGoodsList[index].productGoodsId;
      if (v.matchingGoodsList.length > 0) {
        v.matchingGoodsList.map((item, index) => {
          if (item.productGoodsId === id) {
            v.matchingGoodsList.splice(index, 1);
          }
        });
      }
      // if (v.chioseList1.length) {
      //   v.chioseList1.forEach((n, i) => {
      //     if (n.productGoodsId === id) {
      //       v.chioseList1.splice(i, 1);
      //     }
      //   });
      // }
      // if (v.chioseList2.length) {
      //   v.chioseList2.forEach((m, t) => {
      //     if (m.productGoodsId === id) {
      //       v.chioseList2.splice(t, 1);
      //     }
      //   });
      // }
    },
    delAllSku() {
      this.matchingGoodsList = [];
      this.chioseList1 = [];
      this.chioseList2 = [];
      this.norGoodsAll = false;
      this.mapGoodsAll = false;
    },
    getTreeData() {
      // 获取人工匹配分类树
      let v = this;
      let userId = v.$store.state.erpConfig.userInfo.userId;
      let merchantId;
      if (v.orderInfo) {
        merchantId = v.orderInfo.merchantId;
      }
      v.axios
        .get(v.prefix + api.get_allCategory + "?time=" + new Date().getTime(), {
          headers: {
            ...(v.orderInfo ? { UserId: merchantId + "," + userId } : {}),
          },
        })
        .then((response) => {
          if (response.data.code === 0) {
            v.categoryTree[0].children = v.toTree(response.data.datas, null);
          }
        });
    },
    toTree(data, parentId) {
      // 组装数据
      var tree = [];
      var temp;
      for (var i = 0; i < data.length; i++) {
        if (data[i].parentId === parentId) {
          var obj = data[i];
          obj.title = obj.cnName;
          obj.expand = true;
          temp = this.toTree(data, data[i].productCategoryId);
          if (temp.length > 0) {
            obj.children = temp;
          }
          tree.push(obj);
        }
      }
      return tree;
    },
    view(selectedProductCategorys) {
      // 查看
      if (selectedProductCategorys.length === 0) {
        this.selectedProductCategory.selected = true;
        this.productCategoryId = "";
        this.matchingGoodsParamsStatus1 = true;
      } else {
        this.productCategoryId = selectedProductCategorys[0].productCategoryId;
        this.matchingGoodsParamsStatus1 = true;
      }
    }, // 全选普通商品
    SelectNorGoods(value) {
      let v = this;
      if (value) {
        if (v.norGoodsTotal > 500) {
          setTimeout(() => {
            v.norGoodsAll = false;
          }, 1500);
          v.$Message.warning("最多只能全选500条数据");
          return false;
        }
        let query = {
          pageSize: v.norGoodsTotal,
        };
        query = Object.assign({}, v.matchingGoodsParams1, query);
        v.axios
          .post(v.prefix + api.query_productGoods, query)
          .then((response) => {
            if (response.data.code === 0) {
              let data = response.data.datas;
              v.getSelectValue1(data.list, "all");
            }
          });
      }
    },
    // 全选映射商品
    SelectmapGoods(value) {
      let v = this;
      if (value) {
        if (v.mapGoodsTotal > 500) {
          setTimeout(() => {
            v.mapGoodsAll = false;
          }, 1500);
          v.$Message.warning("最多只能全选500条数据");
          return false;
        }
        let query = {
          pageSize: v.mapGoodsTotal,
        };
        query = Object.assign({}, v.matchingGoodsParams2, query);
        v.axios
          .post(v.prefix + api.query_productSkuMapping, query)
          .then((response) => {
            if (response.data.code === 0) {
              let data = response.data.datas;
              v.getSelectValue2(data.list, "all");
            }
          });
      }
    },
    changeExpand(data) {
      if (data.nodeKey === 0) {
        this.showTree = data.expand;
      }
    },
    // 展开或合并树，当flag为true时全部展开，flag为false时全部合并
    exchangeTree() {
      this.showTree = !this.showTree;
      this.categoryTree = this.treeChangeExpand(
        this.categoryTree,
        this.showTree
      );
    },
    // 递归给树设置expand
    treeChangeExpand(treeData, flag) {
      let v = this;
      for (let i = 0; i < treeData.length; i++) {
        v.$set(treeData[i], "expand", flag);
        if (treeData[i].children) {
          treeData[i].children = v.treeChangeExpand(treeData[i].children, flag);
        }
      }
      return treeData;
    },
    // 删除商品映射关系
    deleteProductSkuMap (orderId) {
      this.axios.get(api.deleteMatchSkuMapping, { params: { orderId } }).then(response => {
        if (response.data.code === 0) { }
      })
    }
  }
};
</script>

<style>
.matchingGoods .ivu-tabs-nav {
  float: right;
}
</style>
<style scoped>
.chioseGoods {
  border: 1px solid #e8e8e8;
  margin-bottom: 10px;
  padding: 10px 10px;
}
.chioseGoodsList {
  display: inline-block;
  margin-left: 15px;
  margin-top: 10px;
}
</style>
