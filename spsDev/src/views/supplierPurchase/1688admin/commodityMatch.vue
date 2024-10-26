<template >
  <div class="commodityMatch">
    <!--筛选条件-->
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form
              ref="pageParams"
              :model="pageParams"
              :label-width="labelWidth"
            >
              <dyt-filter>
                <FormItem label="SKU">
                  <dyt-input-tag
                    :limit="1"
                    v-model.trim="pageParams.skuList"
                    placeholder="多个用逗号或换行分隔"
                    type="textarea"
                  />
                </FormItem>
                <Form-item label="商品名称">
                  <dyt-input
                    placeholder="请输入"
                    v-model.trim="pageParams.cnName"
                  ></dyt-input>
                </Form-item>
                <Form-item label="1688商品名称">
                  <dyt-input
                    placeholder="请输入"
                    v-model.trim="pageParams.platformName"
                  ></dyt-input>
                </Form-item>
                <Form-item label="供货商">
                  <dyt-input
                    placeholder="请输入"
                    v-model.trim="pageParams.platformSupplierName"
                  ></dyt-input>
                </Form-item>
                <Form-item label="配对状态">
                  <RadioGroup
                    v-model="pageParams.matchingStatus"
                    type="button"
                    button-style="solid"
                  >
                    <Radio label="">全部</Radio>
                    <Radio label="0">未识别</Radio>
                    <Radio label="1">已配对</Radio>
                  </RadioGroup>
                </Form-item>

                <div slot="operation">
                  <Button
                    type="primary"
                    @click="search"
                    :disabled="SearchDisabled"
                    icon="ios-search"
                    >查询</Button
                  >
                  <Button
                    @click="reset"
                    style="margin-left: 10px"
                    v-once
                    icon="md-refresh"
                    >重置</Button
                  >
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>
    <div class="flexBox spaceBetween">
      <div class="tableControl">
        <Dropdown @on-click="addProduct" v-if="getPermission('aliProduct_add')">
          <Button type="primary" style="margin-left: 12px"
            >添加1688商品
            <Icon type="md-arrow-dropdown"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem name="0">单个添加</DropdownItem>
            <DropdownItem name="1">批量添加</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Button
          type="primary"
          class="ml20"
          @click="batchRelieveMatch"
          v-if="getPermission('aliProduct_unPair')"
          >批量解除配对</Button
        >
      </div>
    </div>
    <!-- 列表 -->
    <div class="orderTable normalTop commonFilter">
      <Table
        highlight-row
        :loading="Tableloading"
        border
        :height="tableHeight"
        :columns="importColumn"
        :data="importData"
        @on-selection-change="selectEvents"
      >
        <template slot-scope="{ row }" slot="picture">
          <large-picture
            :url="row.aliSkuImageInfoDTO.platformImage || ''"
            v-if="row.aliSkuImageInfoDTO"
          >
            <slot name="picslot"></slot>
          </large-picture>
        </template>
        <template slot-scope="{ row }" slot="platformName">
          <div v-if="row.spuInfoDTO">
            {{ row.spuInfoDTO.platformName }}
          </div>
        </template>
        <template slot-scope="{ row }" slot="platformSupplierName">
          <div v-if="row.spuInfoDTO">
            {{ row.spuInfoDTO.platformSupplierName }}
          </div>
        </template>
        <template slot-scope="{ row }" slot="matchingStatus">
          <span>
            {{ row.matchingStatus == 0 ? "未识别" : "已匹配" }}
          </span>
          <span style="color: #fc9c3e" class="ml20">
            {{ row.defaultStatus == 0 ? "" : "默认" }}
          </span>
        </template>
        <template slot-scope="{ row }" slot="updatedTime">
          <div>
            {{ getDataToLocalTime(row.updatedTime, "fulltime", true) }}
          </div>
        </template>
      </Table>
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
    <Modal v-model="modal1" title="添加1688商品" width="50%">
      <div style="display: flex; align-items: center">
        <span class="mr20" style="margin-left: 100px">1688宝贝链接</span>
        <Input
          v-model="modalInput"
          placeholder="输入链接"
          style="width: 300px"
        />
        <!-- <span style="border: 1px solid #fc9a39">获取1688商品</span> -->
        <div class="seachText">
          <span style="line-height: 32px" @click="getProduct"
            >获取1688商品</span
          >
        </div>
      </div>
      <Table border :columns="columns1" :data="data1" class="mt20">
        <template slot-scope="{ row }" slot="picture">
          <large-picture :url="row.imageUrl || row.thumbUrl">
            <slot name="picslot"></slot>
          </large-picture>
        </template>

        <template slot-scope="{ row }" slot="chooseProduct">
          <CheckboxGroup v-model="singelFormData.platformSkuIdList">
            <Checkbox
              v-for="item in row.addAliProductDetailVOList"
              :key="item.platformSkuId"
              :label="item.platformSkuId"
              >{{ item.attribute }}</Checkbox
            >
          </CheckboxGroup>
        </template>
      </Table>
      <div slot="footer" style="text-align: center">
        <Button type="primary" @click="addProductConfirm">确定</Button>
        <Button @click="modal1 = false">关闭</Button>
      </div>
    </Modal>
    <Modal v-model="modal2" title="添加1688商品" width="35%">
      <div style="padding: 10px">
        <Form :model="formData" :label-width="80">
          <FormItem label="1688宝贝链接" :label-width="100">
            <Input
              v-model="formData.modalInputList"
              type="textarea"
              :rows="8"
              placeholder="可输入多个宝贝链接，用回车换行"
              width="300px"
            />
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: center">
        <Button type="primary" @click="saveBatchData">确定</Button>
        <Button @click="modal2 = false">关闭</Button>
      </div>
    </Modal>
    <Modal v-model="modal3" title="更换配对" width="1000">
      <Table border :columns="topColumn" :data="topData">
        <template slot-scope="{ row }" slot="picture">
          <large-picture
            :url="row.aliSkuImageInfoDTO.platformImage || ''"
            v-if="row.aliSkuImageInfoDTO"
          >
            <slot name="picslot"></slot>
          </large-picture>
        </template>
        <template slot-scope="{ row }" slot="platformName">
          <div v-if="row.spuInfoDTO">
            {{ row.spuInfoDTO.platformName }}
          </div>
        </template>
      </Table>
      <div style="display: flex; align-items: center" class="mt20">
        <span class="mr20 ml20">商品搜索</span>
        <Input
          v-model="searchParams.searchValue"
          placeholder="请输入"
          style="width: 300px"
        />
        <Button type="primary" class="ml20" @click="productSeach">搜索</Button>
      </div>
      <div style="display: flex">
        <Table
          border
          :columns="columns3"
          :data="productInfoTable"
          class="mt20"
          width="500"
        >
          <template slot-scope="{ row }" slot="picture">
            <div style="display: flex">
              <large-picture :url="row.path || row.thumbUrl" imageHigh="40px">
                <slot name="picslot"></slot>
              </large-picture>
              <div style="display: flex; align-items: center" class="ml20">
                <div>
                  <div>{{ row.cnHsName }}</div>
                  <div>
                    <span>sku：</span>
                    <span>{{ row.sku }}</span>
                  </div>
                </div>
                <div style="margin-left: 40px">
                  <span>{{ row.productGoodsSpecifications[0].value }}</span>
                  <span class="ml10">{{
                    row.productGoodsSpecifications[1].value
                  }}</span>
                </div>
              </div>
            </div>
          </template>
          <template slot-scope="scope" slot="operator">
            <div
              :style="{
                color:
                  chooseProductStatus &&
                  productObject.type == 0 &&
                  productObject.index == scope.index
                    ? '#858d9e'
                    : '#2d8cf0',
                cursor: 'pointer',
              }"
              @click="chooseProduct(0, scope)"
            >
              选择
            </div>
          </template>
        </Table>

        <Table
          border
          :columns="columns3"
          :data="productInfoTable2"
          class="mt20"
          width="500"
        >
          <template slot-scope="{ row }" slot="picture">
            <div style="display: flex">
              <large-picture :url="row.path || row.thumbUrl" imageHigh="40px">
                <slot name="picslot"></slot>
              </large-picture>
              <div style="display: flex; align-items: center" class="ml20">
                <div>
                  <div>{{ row.cnHsName }}</div>
                  <div>
                    <span>sku：</span>
                    <span>{{ row.sku }}</span>
                  </div>
                </div>
                <div style="margin-left: 40px">
                  <span>{{ row.productGoodsSpecifications[0].value }}</span>
                  <span class="ml10">{{
                    row.productGoodsSpecifications[1].value
                  }}</span>
                </div>
              </div>
            </div>
          </template>
          <template slot-scope="scope" slot="operator">
            <div
              :style="{
                color:
                  chooseProductStatus &&
                  productObject.type == 1 &&
                  productObject.index == scope.index
                    ? '#858d9e'
                    : '#2d8cf0',
                cursor: 'pointer',
              }"
              @click="chooseProduct(1, scope)"
            >
              选择
            </div>
          </template>
        </Table>
      </div>
      <div style="display: flex; justify-content: flex-end" class="mt20">
        <Page
          :total="matchTotal"
          @on-change="changeMatchPage"
          show-total
          :page-size="searchParams.pageSize"
          show-elevator
          :current="searchParams.pageNum"
          show-sizer
          @on-page-size-change="changeMatchPageSize"
          placement="top"
          :page-size-opts="matchArray"
        ></Page>
      </div>
      <div slot="footer" style="text-align: center">
        <Button type="primary" @click="matchProductConfirm">确定</Button>
        <Button @click="modal3 = false">关闭</Button>
      </div>
    </Modal>
    <Modal v-model="modal4" title="提示">
      <div style="padding: 10px">
        <div style="padding: 10px" v-if="openType == 1 || openType == 4">
          解除关系会影响1688采购的配对关系，确定要解除关系吗？
        </div>
        <div style="padding: 10px" v-if="openType == 2">
          <div>
            是否设置当前sku的默认商品为{{
              listData.platformName
            }}（1688商品信息）？
          </div>
          <div style="color: #e20026" class="mt10">
            ps：设置后选择该sku时，默认商品为向该1688商品下单
          </div>
        </div>
        <div v-if="openType == 3">
          删除产品会影响1688采购的配对关系，确定要删除吗？
        </div>
        <div v-if="openType == 5">
          当前该sku默认商品为{{
            listData.platformName
          }}（1688商品名称），取消默认？
        </div>
      </div>
      <div slot="footer" style="text-align: center">
        <Button type="primary" @click="difTypeClose">确定</Button>
        <Button @click="modal4 = false">关闭</Button>
      </div>
    </Modal>
    <Modal v-model="modal5" title="更换默认" width="1000">
      <Table border :columns="topColumn" :data="topData">
        <template slot-scope="{ row }" slot="picture">
          <large-picture
            :url="row.aliSkuImageInfoDTO.platformImage || ''"
            v-if="row.aliSkuImageInfoDTO"
          >
            <slot name="picslot"></slot>
          </large-picture>
        </template>
        <template slot-scope="{ row }" slot="platformName">
          <div v-if="row.spuInfoDTO">
            {{ row.spuInfoDTO.platformName }}
          </div>
        </template>
      </Table>
      <div style="display: flex; align-items: center" class="mt20">
        <span class="mr20 ml20">商品搜索</span>
        <Input
          v-model="searchParams.searchValue"
          placeholder="请输入"
          style="width: 300px"
        />
        <Button type="primary" class="ml20" @click="productSeach">搜索</Button>
      </div>
      <div style="display: flex">
        <Table
          border
          :columns="columns4"
          :data="defaultInfoTable"
          class="mt20"
          width="500"
        >
          <template slot-scope="{ row }" slot="picture">
            <div style="display: flex; align-items: center">
              <large-picture
                :url="row.platformImage || row.thumbUrl"
                imageHigh="40px"
              >
                <slot name="picslot"></slot>
              </large-picture>
              <div style="display: flex; align-items: center" class="ml20">
                <div>
                  <div style="width: 200px">{{ row.platformName }}</div>
                  <!-- <div>
                    <span>sku：</span>
                    <span>{{ row.platformSkuId }}</span>
                  </div> -->
                </div>
                <div style="margin-left: 15px">
                  <!-- <div>{{ row.platformValue.split(" ")[0] }}</div>
                  <div>{{ row.platformValue.split(" ")[1] }}</div> -->
                  <span style="font-size: 3px">{{ row.platformValue }}</span>
                </div>
              </div>
            </div>
          </template>
          <template slot-scope="scope" slot="operator">
            <div
              :style="{
                color:
                  defaultObject.chooseDefaultStatus &&
                  defaultObject.type == 0 &&
                  defaultObject.index == scope.index
                    ? '#858d9e'
                    : '#2d8cf0',
                cursor: 'pointer',
              }"
              @click="chooseDefault(0, scope)"
            >
              选择
            </div>
          </template>
        </Table>

        <Table
          border
          :columns="columns4"
          :data="defaultInfoTable2"
          class="mt20"
          width="500"
        >
          <template slot-scope="{ row }" slot="picture">
            <div style="display: flex; align-items: center">
              <large-picture
                :url="row.platformImage || row.thumbUrl"
                imageHigh="40px"
              >
                <slot name="picslot"></slot>
              </large-picture>
              <div style="display: flex; align-items: center" class="ml20">
                <div>
                  <div style="width: 200px">{{ row.platformName }}</div>
                  <!-- <div>
                    <span>sku：</span>
                    <span>{{ row.platformSkuId }}</span>
                  </div> -->
                </div>
                <div style="margin-left: 15px">
                  <!-- <div>{{ row.platformValue.split(" ")[0] }}</div>
                  <div>{{ row.platformValue.split(" ")[1] }}</div> -->
                  <span style="font-size: 3px">{{ row.platformValue }}</span>
                </div>
              </div>
            </div>
          </template>
          <template slot-scope="scope" slot="operator">
            <div
              :style="{
                color:
                  defaultObject.chooseDefaultStatus &&
                  defaultObject.type == 1 &&
                  defaultObject.index == scope.index
                    ? '#858d9e'
                    : '#2d8cf0',
                cursor: 'pointer',
              }"
              @click="chooseDefault(1, scope)"
            >
              选择
            </div>
          </template>
        </Table>
      </div>
      <div style="display: flex; justify-content: flex-end" class="mt20">
        <Page
          :total="defaultTotal"
          @on-change="changeDefaultPage"
          show-total
          :page-size="defaultSeachParams.pageSize"
          show-elevator
          :current="defaultSeachParams.pageNum"
          show-sizer
          @on-page-size-change="changeDefaultPageSize"
          placement="top"
          :page-size-opts="matchArray"
        ></Page>
      </div>
      <div slot="footer" style="text-align: center">
        <Button type="primary" @click="matchDefaultConfirm">确定</Button>
        <Button @click="modal5 = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import largePicture from "@/components/largePicture";
import { Button } from "view-design";

export default {
  mixins: [Mixin],
  components: { largePicture, Button },
  data() {
    return {
      total: 0, // 总记录数
      pageParams: {
        skuList: [],
        cnName: "",
        platformName: "",
        platformSupplierName: "",
        matchingStatus: "",
        pageSize: 10,
        pageNum: 1,
      },

      importData: [],
      importColumn: [
        {
          type: "selection",
          width: 55,
          align: "center",
        },
        {
          title: "图片",
          key: "operateCode",
          align: "center",
          slot: "picture",
          width: 100,
        },
        {
          title: "1688商品信息",
          key: "platformName",
          align: "center",
          slot: "platformName",
          minWidth: 120,
        },
        {
          title: "1688属性",
          key: "aliSkuAttr",
          align: "center",
          minWidth: 120,
        },
        {
          title: "供应商名称",
          key: "platformSupplierName",
          align: "center",
          slot: "platformSupplierName",
          minWidth: 120,
        },

        {
          title: "商品名称",
          key: "cnName",
          align: "center",
          minWidth: 120,
        },
        {
          title: "sku",
          key: "sku",
          align: "center",
          minWidth: 120,
        },
        {
          title: "状态",
          key: "matchingStatus",
          align: "center",
          slot: "matchingStatus",
          minWidth: 120,
        },
        {
          title: "更新时间",
          key: "updatedTime",
          align: "center",
          minWidth: 120,
          slot: "updatedTime",
        },

        {
          title: "操作",
          key: "operateCode",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            let self = this;
            // if (true) {
            return h("div", [
              h(
                "Buttons",
                {
                  props: {
                    trigger: "click",
                    transfer: true,
                  },
                  class: "defaultStyle trimming",
                  on: {
                    "on-click": (val) => {
                      //更换默认
                      if (val == 6) {
                        return this.changeDefault(params.row);
                      }
                      this.listData.platformSkuId = params.row.platformSkuId;
                      this.listData.platformName =
                        params.row.spuInfoDTO.platformName;
                      this.openType = val;
                      this.modal4 = true;
                    },
                  },
                },
                [
                  self.getPermission("aliProduct_pair")
                    ? h(
                      "Button",
                      {
                        type: "default",
                        class: "iconbuttons",
                        on: {
                          click() {
                            self.manualAssign(params.row);
                          },
                        },
                        props: {},
                      },
                        params.row.matchingStatus == 0 ? "手动指定" : "更换配对"
                    )
                    : "",
                  h(
                    "Buttons-menu",
                    {
                      slot: "list",
                    },
                    [
                      params.row.matchingStatus == 1 &&
                      self.getPermission("aliProduct_unPair")
                        ? h(
                          "Buttons-item",
                          {
                            props: {
                              name: 1,
                            },
                            style: {},
                            on: {
                              click() {},
                            },
                          },
                          "解除配对"
                        )
                        : "",
                      params.row.defaultStatus == 0 &&
                      params.row.skuHaveDefault == 0 &&
                      params.row.matchingStatus == 1 &&
                      self.getPermission("aliProduct_default")
                        ? h(
                          "Buttons-item",
                          {
                            props: {
                              name: 2,
                            },
                          },
                          "设置默认"
                        )
                        : "",

                      self.getPermission("aliProduct_delete")
                        ? h(
                          "Buttons-item",
                          {
                            props: {
                              name: 3,
                            },
                          },
                          "删除产品"
                        )
                        : "",
                      params.row.defaultStatus == 1 &&
                      self.getPermission("aliProduct_cancelDefault")
                        ? h(
                          "Buttons-item",
                          {
                            props: {
                              name: 5,
                            },
                          },
                          "取消默认"
                        )
                        : "",
                      params.row.defaultStatus == 1 &&
                      self.getPermission("aliProduct_updateDefault")
                        ? h(
                          "Buttons-item",
                          {
                            props: {
                              name: 6,
                            },
                          },
                          "更换默认"
                        )
                        : "",
                    ]
                  ),
                ]
              ),
            ]);
            // }
          },
        },
      ],
      modal1: false,
      modal2: false,
      modal3: false,
      modal4: false,
      modal5: false,
      modalInput: "",
      columns1: [
        {
          title: "图片",
          key: "name",
          slot: "picture",
          width: "100px",
        },
        {
          title: "名称",
          key: "name",
        },
        {
          title: "选择商品",
          key: "address",
          slot: "chooseProduct",
          renderHeader: (h, params) => {
            return h("div", [
              h("span", "选择商品"),
              h(
                "span",
                {
                  style: {
                    marginLeft: "20px",
                  },
                },
                "全选"
              ),
              h("Checkbox", {
                props: {
                  value: this.productList1,
                },
                style: {
                  marginLeft: "10px",
                },
                on: {
                  "on-change": (val) => {
                    if (val) {
                      this.singelFormData.platformSkuIdList =
                        this.data1[0].addAliProductDetailVOList.map((item) => {
                          return item.platformSkuId;
                        });
                    } else {
                      this.singelFormData.platformSkuIdList = [];
                    }
                  },
                },
              }),
            ]);
          },
        },
      ],
      data1: [],
      productList: [],
      productList1: "",
      formData: {
        modalInputList: "",
      },
      columns2: [
        {
          title: "图片",
          key: "name",
          slot: "picture",
        },
        {
          title: "名称",
          key: "age",
        },
        {
          title: "商品属性",
          key: "address",
        },
      ],

      columns3: [
        {
          title: "商品信息",
          key: "name",
          slot: "picture",
        },
        {
          title: "操作",
          key: "address",
          slot: "operator",
          width: "75",
        },
      ],
      productInfoTable: [],
      productInfoTable2: [],
      openType: 1,
      selectList: [],
      //增加单个商品提交
      singelFormData: {
        platformId: "",
        platformSkuIdList: [],
      },
      searchParams: {
        searchValue: "",
        businessDeptIds: "",
        codeType: 1,
        flag: 0,
        pageSize: 8,
        pageNum: 1,
      },
      matchTotal: 0,
      //更换配对
      topColumn: [
        {
          title: "图片",
          key: "name",
          slot: "picture",
        },
        {
          title: "名称",
          key: "platformName",
          slot: "platformName",
        },
        {
          title: "商品属性",
          key: "aliSkuAttr",
        },
      ],
      topData: [],
      matchArray: [8, 10, 12, 16],
      chooseProductStatus: false,
      productObject: {
        type: 0,
        index: 0,
      },
      matchSaveData: {},
      listData: {
        platformSkuId: "",
        platformName: "",
      },
      //更换默认搜索条件
      defaultSeachParams: {
        erpSku: "",
        platformName: "",
        pageNum: 1,
        pageSize: 8,
      },
      defaultTotal: 0,
      defaultInfoTable: [],
      defaultInfoTable2: [],
      defaultSaveData: {},
      defaultObject: {
        chooseDefaultStatus: false,
        index: "",
        type: "",
      },
      columns4: [
        {
          title: "商品信息",
          key: "name",
          slot: "picture",
        },
        {
          title: "操作",
          key: "address",
          slot: "operator",
          width: "75",
        },
      ],
    };
  },
  created() {
    this.tableHeight = this.getTableHeight(335);
    this.getList();
    // this.getPermission('erpCommon_queryCommonTaskInfoData') ? this.getList() : this.gotoError();
  },
  computed: {
    authUserInfo() {
      return this.$store.getters["authUserInfo"];
    },
  },
  methods: {
    search() {
      // 查询
      let v = this;
      v.pageParams.pageNum = 1;
      v.getList();
    },
    reset() {},
    getList() {
      if (!this.getPermission("aliProduct_query")) {
        this.$Message.error("无权限");
        return;
      }
      this.axios.post(api.ali_getList, this.pageParams).then((res) => {
        this.$nextTick(() => {
          this.total = res.data.datas.total;
          this.importData = res.data.datas.list;
        });
      });
    },
    addProduct(val) {
      //0单个添加
      if (val == 0) {
        this.modalInput = "";
        this.data1 = [];
        this.modal1 = true;
      } else {
        this.modal2 = true;
      }
    },
    addProductConfirm() {
      this.axios.post(api.ali_addProduct, this.singelFormData).then((res) => {
        this.$Message.success("配对成功");
        this.modal1 = false;
        this.getList();
      });
    },
    saveBatchData() {
      // let temp = this.modalInput.substring(this.modalInput.lastIndexOf("/") + 1, this.modalInput.indexOf(".html"));
      let list = [];
      list = this.formData.modalInputList.trim() === "" ? [] : this.formData.modalInputList.trim()
        .replace(/\n/g, ",")
        .replace(/，/g, ",")
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");
      // console.log(list, "list");
      let paramsList = list.map((item) => {
        return item.substring(item.lastIndexOf("/") + 1, item.indexOf(".html"));
      });
      // console.log(paramsList, "paramsList");
      this.axios.post(api.ali_batchAddProduct, paramsList).then((res) => {
        console.log(res);
        this.$Message.success("添加商品成功");
        this.modal2 = false;
        this.getList();
      });
    },
    //手动指定
    manualAssign(row) {
      this.matchSaveData.sku = "";
      this.searchParams.searchValue = "";
      this.chooseProductStatus = false;
      this.searchParams.pageNum = 1;
      // this.productSeach().then((res) => {
      this.topData = [row];
      this.modal3 = true;
      // });
    },

    changePage(val) {
      this.pageParams.pageNum = val;
      this.getList();
    },
    changePageSize(val) {
      this.pageParams.pageSize = val;
      this.getList();
    },
    selectEvents(val) {
      this.selectList = val;
    },
    batchRelieveMatch() {
      if (this.selectList.length < 1) {
        return this.$Message.warning("请选择要解除的商品");
      }
      this.openType = 4;
      this.modal4 = true;
    },
    //获取1688商品列表
    getProduct() {
      let temp = this.modalInput.substring(
        this.modalInput.lastIndexOf("/") + 1,
        this.modalInput.indexOf(".html")
      );
      this.axios
        .get(`/sps-service/sps/aliProduct/queryProduct?platformId=${temp}`)
        .then((res) => {
          this.data1 = [];
          this.data1.push(res.data.datas);
          this.singelFormData.platformId = res.data.datas.platformSpuId;
        });
    },
    productSeach() {
      this.searchParams.businessDeptIds =
        this.authUserInfo.securityUser.businessDeptIds;
      return this.axios
        .post(api.ali_querySku, this.searchParams)
        .then((res) => {
          this.matchTotal = res.data.datas.total;
          let list = res.data.datas.list;
          if (process.env.NODE_ENV == "production") {
            list.forEach((item) => {
              item.path =
                "https://erp.lapa.com.cn/product-service/filenode/s/thumb" +
                item.path;
            });
          }
          let top = Math.ceil(list.length / 2);
          let topList = list.slice(0, top);
          let buttomList = list.slice(top, list.length);
          this.productInfoTable = topList;
          this.productInfoTable2 = buttomList;
        });
    },
    changeMatchPageSize(val) {
      this.searchParams.pageSize = val;
      this.productSeach();
    },
    changeMatchPage(val) {
      this.searchParams.pageNum = val;
      this.productSeach();
    },
    chooseProduct(type, scope) {
      this.matchSaveData.platformSkuId = this.topData[0].platformSkuId;
      this.matchSaveData.sku = scope.row.sku;
      this.matchSaveData.productGoodsId = scope.row.productGoodsId;
      this.matchSaveData.cnName = scope.row.cnName;
      this.productObject.type = type;
      this.productObject.index = scope.index;
      this.chooseProductStatus = true;
    },
    matchProductConfirm() {
      if (!this.matchSaveData.sku) {
        return this.$Message.warning("请选择要更换的商品");
      }
      this.axios.post(api.ali_pairProduct, this.matchSaveData).then((res) => {
        this.$Message.success("更换配对成功");
        this.modal3 = false;
        this.getList();
      });
    },
    cancelMatch() {
      this.axios
        .post(
          `/sps-service/sps/aliProduct/unPairProduct/${this.listData.platformSkuId}`
        )
        .then((res) => {
          this.$Message.success("解除成功");
          this.getList();
          this.modal4 = false;
        });
    },
    batchCancelMatch() {
      let temp = this.selectList.map((item) => {
        return item.platformSkuId;
      });
      this.axios.post(api.ali_batchUnPairProduct, temp).then((res) => {
        this.$Message.success("解除配对成功");
        this.getList();
        this.modal4 = false;
      });
    },
    difTypeClose() {
      switch (this.openType) {
        //解除绑定关系
        case 1:
          this.cancelMatch();
          break;
        //设置默认
        case 2:
          this.settingDefault();
          break;
        //删除商品
        case 3:
          this.deleteProduct();
          break;
        //批量解除
        case 4:
          this.batchCancelMatch();
          break;
        //取消默认
        case 5:
          this.cancelDefault();
          break;
      }
    },
    //设置默认
    settingDefault() {
      console.log(1);
      this.axios
        .get(
          `/sps-service/sps/aliProduct/updateSetUpSkuDefault?platformSkuId=${this.listData.platformSkuId}`
        )
        .then((res) => {
          console.log(res, "res");
          this.$Message.success("设置默认成功");
          this.modal4 = false;
          this.getList();
        });
    },
    //取消默认
    cancelDefault() {
      this.axios
        .get(
          `/sps-service/sps/aliProduct/updateCancelSkuDefault?platformSkuId=${this.listData.platformSkuId}`
        )
        .then((res) => {
          console.log(res, "res");
          this.$Message.success("取消默认成功");
          this.modal4 = false;
          this.getList();
        });
    },
    deleteProduct() {
      this.axios
        .get(
          `/sps-service/sps/aliProduct/daleteProduct?platformSkuId=${this.listData.platformSkuId}`
        )
        .then((res) => {
          console.log(res, "res");
          this.$Message.success("删除成功");
          this.modal4 = false;
          this.getList();
        });
    },
    //更换默认
    changeDefault(row) {
      this.defaultSeachParams.erpSku = row.sku;
      this.topData = [row];
      this.defaultObject.chooseDefaultStatus = false;
      this.defaultSaveData.setUpSkuDefaultId = "";
      this.defaultSeach().then((res) => {
        this.modal5 = true;
      });
    },
    defaultSeach() {
      return this.axios
        .post(api.ali_skuNoDefaultList, this.defaultSeachParams)
        .then((res) => {
          this.defaultTotal = res.data.datas.total;
          let list = res.data.datas.list;
          let top = Math.ceil(list.length / 2);
          let topList = list.slice(0, top);
          let buttomList = list.slice(top, list.length);
          this.defaultInfoTable = topList;
          this.defaultInfoTable2 = buttomList;
        });
    },
    changeDefaultPage(val) {
      this.defaultSeachParams.pageNum = val;
      this.defaultSeach();
    },
    changeDefaultPageSize(val) {
      this.defaultSeachParams.pageSize = val;
      this.defaultSeach();
    },
    chooseDefault(type, scope) {
      this.defaultSaveData.cancelSkuDefaultId = this.topData[0].platformSkuId;
      this.defaultSaveData.setUpSkuDefaultId = scope.row.platformSkuId;
      this.defaultObject.type = type;
      this.defaultObject.index = scope.index;
      this.defaultObject.chooseDefaultStatus = true;
      console.log(this.defaultObject, " this.defaultObject");
    },
    matchDefaultConfirm() {
      if (!this.defaultSaveData.setUpSkuDefaultId) {
        return this.$Message.warning("请选择需要更换的默认商品");
      }
      this.axios
        .get(
          `/sps-service/sps/aliProduct/renewalSkuDefault?cancelSkuDefaultId=${this.defaultSaveData.cancelSkuDefaultId}&setUpSkuDefaultId=${this.defaultSaveData.setUpSkuDefaultId}`
        )
        .then((res) => {
          this.modal5 = false;
          this.$Message.success("更换默认成功");
          this.getList();
        });
    },
  },
};
</script>
<style lang="less" scoped>
.seachText {
  width: 100px;
  height: 32px;
  background: #fc9a39;
  display: flex;
  justify-content: center;
  position: relative;
  right: 2px;
  cursor: pointer;
}
</style>
