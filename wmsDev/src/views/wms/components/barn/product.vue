<template>
  <div class="product">
    <div class="listPage">
      <div class="searchMain">
        <Form ref="pageParams" :model="pageParams" :label-width="110">
          <dyt-filter ref="dyt-filter" @expand="expand">
            <Form-item label="产品编码：" prop="skuCodeList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.skuCodeList" placeholder="多个请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="关联LAPA SKU：" prop="lapaSkuList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.lapaSkuList" placeholder="多个请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="创建时间:" prop="createdTime">
              <DatePicker type="daterange" transfer placeholder="选择日期" style="width: 100%"
                v-model.trim="paramsOthers.createdTime" format="yyyy-MM-dd" @on-change="timeChange"></DatePicker>
            </Form-item>
            <Form-item label="状态：" prop="status">
              <dyt-select v-model="pageParams.status">
                <Option v-for="item in statusList" :value="item.value" :key="item.value" :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="关联SKU：" prop="relateFlag">
              <dyt-select v-model="pageParams.relateFlag">
                <Option v-for="item in cognateSku" :value="item.value" :key="item.value" :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <div slot="operation" v-if="getPermission('wmsGcProductInfo_query')">
              <Button type="primary" @click="search" :disabled="SearchDisabled" icon="ios-search" class="mr10">
                查询
              </Button>
              <Button @click="reset" icon="md-refresh">重置</Button>
            </div>
          </dyt-filter>
        </Form>
      </div>

      <!-- 排序 -->
      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <Button v-if="getPermission('wmsGcProductInfo_sync')" type="primary" @click="syncOnlineProduct">
              同步商品
            </Button>
            <Button type="primary" class="ml10" @click="openInportModal" icon="md-archive"
              :disabled="!getPermission('wmsGcProductInfo_skuRelatedImport')">导入
            </Button>
            <Dropdown @on-click="exportAllOrSlt" class="ml10" v-if="getPermission('wmsGcProductInfo_export')">
              <Button type="primary">
                <span class="icon iconfont" style="font-size: 12px">&#xe639;</span>
                导出
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name="0">导出选中数据</DropdownItem>
                <DropdownItem name="1">导出所有结果集</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" :sorType="{ DESC: 'desc', ASC: 'asc' }"
              @sortInfo="getSortInfoAndFetch">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>

      <div class="tableMain">
        <div class="tableBox">
          <Table highlight-row border :height="tableHeight" :loading="TableLoading" :columns="amazomColumn"
            :data="amazonData" @on-selection-change="tableSelectionChange"></Table>
        </div>
      </div>

      <div class="pagesMain">
        <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
          :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray">
        </Page>
      </div>
    </div>

    <!-- 关联sku -->
    <div v-if="addProductModal">
      <Modal class="addProductModal" v-model="addProductModal" title="关联SKU">
        <!--singleExclude单个排除-->
        <pdtProcessDtlAddPdt :from="bool" :sltOneOrMore="sltOneOrMore" @selectOver="selectOver"
          showDataStatus="onlineProduct"></pdtProcessDtlAddPdt>
      </Modal>
    </div>
    <importTemp @getList="search" ref="importTemp" :actionUrl="importUrl" :loadTemplateLocalApi="loadTemplateApi"
      :files="'files'"></importTemp>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import pdtProcessDtlAddPdt from "../wms-inStock/pdtProcessDtlAddPdt";
import importTemp from "@/components/common/importTemp";
import tableHeight_mixin from "@/components/mixin/tableHeight_mixin";
import { goodsAttributesList, productStatusList } from './warehouse/fileData.js';
export default {
  mixins: [Mixin, tableHeight_mixin],
  components: {
    pdtProcessDtlAddPdt,
    importTemp
  },
  data() {
    let v = this;
    return {
      importUrl: api.import_wmsBarnProductInfo,
      loadTemplateApi: "/wms-service/template/gcProductInfo.xlsx",
      pageParams: {
        skuCodeList: [],
        lapaSkuList: [],
        relateFlag: null,
        status: null,
        createStartTime: '',
        createEndTime: '',
        pageNum: 1,
        pageSize: 10,
        orderSeq: "desc",
        orderBy: "CT",
        warehouseId: v.getWarehouseId()
      },
      paramsOthers: {
        createdTime: [],
      },
      cognateSku: [
        {
          label: "未关联",
          value: "0",
          checked: false
        },
        {
          label: "已关联",
          value: "1",
          checked: false
        }
      ],
      sortButtonList: [
        {
          sortHeader: '按创建时间',
          sortField: 'CT',
          sortType: 'desc',
          default: true,
        },
        {
          sortHeader: '按更新时间',
          sortField: 'GX',
          sortType: 'desc',
        },
      ],
      totalPage: 0,
      total: 0,
      curPage: 1,
      amazonData: [],
      activeWmsWinitProductId: "", // 关联wmsWinitProductId
      amazomColumn: [
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
          title: "产品编码",
          key: "productSku",
          align: "center",
          minWidth: 100,
        },
        {
          title: "客户参考代码",
          key: "referenceNo",
          align: "center",
          minWidth: 110,
        },
        {
          title: "商品中英文",
          key: "cnName",
          align: "center",
          minWidth: 110,
          render: (h, params) => {
            return h("div", {}, [
              h("div", {}, params.row.cnName),
              h("div", {}, params.row.enName),
            ]);
          }
        },
        {
          title: "产品状态",
          align: "center",
          width: 110,
          render: (h, params) => {
            let type = params.row.productStatus;
            return h("div", v.statusList[type].label);
          }
        },
        {
          title: "预报重量(kg)",
          key: "weight",
          align: "center",
          width: 100,
        },
        {
          title: "实称重量(kg)",
          key: "actualWeight",
          align: "center",
          width: 100,
        },
        {
          title: "预报长宽高(cm)",
          align: "center",
          width: 120,
          render: (h, { row }) => {
            const length = this.$common.isEmpty(row.length) ? '-' : row.length;
            const width = this.$common.isEmpty(row.width) ? '-' : row.width;
            const height = this.$common.isEmpty(row.height) ? '-' : row.height;
            return h("span", `${length}*${width}*${height}`);
          }
        },
        {
          title: "实测长宽高(cm)",
          align: "center",
          width: 120,
          render: (h, { row }) => {
            const length = this.$common.isEmpty(row.actualLength) ? '-' : row.actualLength;
            const width = this.$common.isEmpty(row.actualWidth) ? '-' : row.actualWidth;
            const height = this.$common.isEmpty(row.actualHeight) ? '-' : row.actualHeight;
            return h("span", `${length}*${width}*${height}`);
          }
        },
        {
          title: "货物属性",
          key: "weight",
          align: "center",
          width: 100,
          render(h, params) {
            // console.log(params.row.containBattery, goodsAttributesList)
            let str = goodsAttributesList[params.row.containBattery] && goodsAttributesList[params.row.containBattery].label;
            return h("span", str);
          }
        },
        {
          title: "备注",
          key: "remark",
          align: "center",
          minWidth: 100,
        },
        {
          title: "创建时间",
          align: "center",
          width: 100,
          render(h, params) {
            return h("div", {
              attrs: {
                class: 'timeWidth',
              }
            }, params.row.productAddTime);
          }
        },
        {
          title: "关联LAPA SKU",
          align: "center",
          width: 130,
          render(h, params) {
            let text = "";
            if (params.row.isDelete === 1) {
              text = h("div", {}, [
                h(
                  "p",
                  {
                    style: {
                      textDecoration: "line-through"
                    }
                  },
                  params.row.goodsSku
                ),
                h(
                  "p",
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
            return text;
            // return h('div', params.row.lapaSku);
          }
        },
        // {
        //   title: "头程成本（CNY）",
        //   key: "firstShippingFee",
        //   align: "center"
        // },
        // {
        //   title: "是否含电池",
        //   key: "contain",
        //   align: "center",
        //   render(h, params) {
        //     let text = "";
        //     let includeBattery = params.row.includeBattery;
        //     text = includeBattery === "Y" ? "带电" : "不带电";
        //     return h("span", text);
        //   }
        // },
        {
          title: "操作",
          align: "center",
          width: 100,
          render: (h, params) => {
            if (!v.getPermission("wmsGcProductInfo_related")) {
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
                    this.activeWmsWinitProductId = params.row.wmsGcProductId;
                    this.wmsAmazonListingId = params.row.wmsAmazonListingId;
                  }
                }
              },
              !params.row.productGoodsId ? "未关联" : "重新关联"
            );
          }
        }
      ],
      wmsAmazonListingId: null,
      addProductModal: false,
      sltOneOrMore: "one", // 单选or多选
      bool: true, // from 为真则查所有产品
      selectRow: [], // 关联选择的数据
      wareId: v.getWarehouseId(), // 仓库ID
      tableSltData: [],
      statusList: productStatusList,
    };
  },
  methods: {
    // 查询
    search() {
      this.pageParams.pageNum = 1;
      this.getList();
    },
    // 重置
    reset() {
      this.$refs.pageParams.resetFields();
      this.paramsOthers.createdTime = [];
      this.timeChange(['', '']);
    },
    // 获取列表数据
    getList() {
      let v = this;
      if (!v.getPermission("wmsGcProductInfo_query")) {
        v.gotoError();
      }
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(api.get_barnProductList, v.pageParams).then((response) => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            v.amazonData = data.list ? data.list : [];
            v.$nextTick(function () {
              v.total = Number(data.total);
              v.totalPage = Number(data.pages);
            });
          }
        }
      }).finally(() => {
        v.TableLoading = false;
        v.SearchDisabled = false;
        v.tableSltData = [];
      })
    },
    selectOver(selectRow) {
      let obj = {
        wmsGcProductId: this.activeWmsWinitProductId,
        productGoodsId: selectRow.productGoodsId
      };
      this.axios.put(api.put_barnProductRelated, obj).then((response) => {
        if (response.data.code === 0) {
          this.$Message.success("操作成功");
          this.search();
        }
      });
    },
    // 同步在线商品
    syncOnlineProduct() {
      this.axios.put(api.put_barnProductSync + "?warehouseId=" + this.wareId).then((response) => {
        if (response.data.code === 0) {
          this.$Message.success("操作成功");
          this.search();
        }
      });
    },
    tableSelectionChange(selection) {
      this.tableSltData = selection;
    },
    // 导出
    exportAllOrSlt(name) {
      let obj = JSON.parse(JSON.stringify(this.pageParams));
      if (name === "0") {
        // 选中
        if (this.tableSltData.length === 0) {
          this.$Message.warning("请选择导出数据");
          return;
        }
        obj.wmsGcProductIds = this.tableSltData.map(
          (val) => val.wmsGcProductId
        );
        this.exportFn(obj);
      } else {
        // 所有
        if (this.amazonData.length === 0) {
          this.$Message.warning({
            content: "无数据导出",
            duration: 5
          });
          return;
        }
        this.exportFn(obj);
      }
    },
    exportFn(obj) {
      this.axios.post(api.export_wmsBarnProduct, obj).then((res) => {
        if (res.data.code === 0) {
          this.$Message.success("导出成功");
          this.search();
        }
      });
    },
    openInportModal() {
      this.$refs.importTemp.model1 = true;
    },
    // 创建时间
    timeChange(e) {
      this.pageParams.createStartTime = e[0] ? e[0] + ' 00:00:00' : '';
      this.pageParams.createEndTime = e[1] ? e[1] + ' 23:59:59' : '';
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.orderSeq = type;
      this.pageParams.orderBy = feild;
      this.search();
    },
    changePage(page) {
      this.pageParams.pageNum = page;
      this.getList();
    },
    changePageSize(pageSize, plat) {
      this.pageParams.pageSize = pageSize;
      this.search();
    },
  },
  created() {
    this.getList();
  }
};
</script>

<style lang="less">
.product {
  height: 100%;
}

.addProductModal .ivu-modal {
  width: 1000px !important;
}
</style>
