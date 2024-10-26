<template>
  <div class="warehouseConfirm">
    <div class="listPage">
      <div class="searchMain">
        <Form ref="searchParams" :model="searchParams" inline :label-width="80">
          <dyt-filter
            :filter-row="1"
            @operation="operation"
            ref="dyt-filter"
            @expand="expand"
          >
            <FormItem label="SKU:">
              <dyt-inputTag
                v-model="searchParams.sku"
                :limit="1"
                type="textarea"
              />
            </FormItem>
            <FormItem label="SPU:">
              <dyt-inputTag
                v-model="searchParams.spu"
                :limit="1"
                type="textarea"
              />
            </FormItem>
            <FormItem label="出库单编号:">
              <dyt-inputTag
                v-model="searchParams.pickingNo"
                :limit="1"
                type="textarea"
              />
            </FormItem>
            <FormItem label="发货时间:">
              <DatePicker
                type="daterange"
                :options="options"
                placement="bottom-start"
                placeholder="请选择"
                @on-change="sendTimeChange"
                :value="[
                  searchParams.beginDeliveryTime,
                  searchParams.endDeliveryTime,
                ]"
                transfer
              ></DatePicker>
            </FormItem>
            <FormItem label="入仓时间:">
              <DatePicker
                type="daterange"
                :options="options"
                placement="bottom-start"
                placeholder="请选择"
                @on-change="createTimeChange"
                :value="[
                  searchParams.beginWarehousingTime,
                  searchParams.endWarehousingTime,
                ]"
                transfer
              ></DatePicker>
            </FormItem>
            <FormItem label="商品品类:">
              <Select
                v-model="searchParams.productTypes"
                placeholder="请选择"
                transfer
              >
                <Option
                  v-for="item in commodityCategoryList"
                  :value="item.value"
                  :key="item.value"
                  >{{ item.label }}
                </Option>
              </Select>
            </FormItem>
            <FormItem label="店铺:">
              <dyt-input v-model="searchParams.account" />
              <!-- <dyt-select v-model="searchParams.account" multiple :max-tag-count="1">
                <Option v-for="(talg) in accountList" :value="talg.saleAccountId" :label="talg.accountCode"
                  :key="talg.saleAccountId"></Option>
              </dyt-select> -->
            </FormItem>
          </dyt-filter>
        </Form>
      </div>
      <!-- 功能 -->
      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <Dropdown
              @on-click="exportExcel"
              v-if="
                getPermission('exportOverseasWarehouseProduct_export') ||
                getPermission('exportOverseasWarehouseProduct_exportDetail')
              "
            >
              <Button type="primary" class="mr10">
                <div style="display: flex; align-items: center">
                  <Icon type="md-cloud-download" />
                  <span style="margin: 0 4px; display: inline-block">导出</span>
                  <Icon type="ios-arrow-down"></Icon>
                </div>
              </Button>
              <template
                v-if="getPermission('exportOverseasWarehouseProduct_export')"
              >
                <DropdownMenu slot="list">
                  <DropdownItem name="1">导出选中列表</DropdownItem>
                </DropdownMenu>
                <DropdownMenu slot="list">
                  <DropdownItem name="2">导出所有列表</DropdownItem>
                </DropdownMenu>
              </template>
              <template
                v-if="
                  getPermission('exportOverseasWarehouseProduct_exportDetail')
                "
              >
                <DropdownMenu slot="list">
                  <DropdownItem name="3">导出选中明细</DropdownItem>
                </DropdownMenu>
                <DropdownMenu slot="list">
                  <DropdownItem name="4">导出所有明细</DropdownItem>
                </DropdownMenu>
              </template>
            </Dropdown>
            <Button
              type="primary"
              v-if="getPermission('warehousing_modifyProductType')"
              @click="editProductCategory"
              >修改商品类别</Button
            >
          </div>
          <div>
            <dyt-sortBySelect
              :sortButtonList="sortButtonList"
              @sortInfo="getSortInfoAndFetch(arguments)"
            >
            </dyt-sortBySelect>
          </div>
        </div>
      </div>
      <!-- 表格 -->
      <div class="tableMain">
        <div class="tableBox">
          <Table
            border
            highlight-row
            ref="selection"
            class="table-style"
            :columns="columns"
            :loading="tableLoading"
            :data="tableList"
            :height="tableHeight"
            @on-selection-change="tableSelectChange"
          >
            <template slot-scope="{ row }" slot="goodsUrl">
              <dyt-previewImg :url="row.goodsUrl"></dyt-previewImg>
            </template>
            <template slot-scope="{ row }" slot="goodsSku">
              <a href="javascript:;" @click="confirmDetail(row, 2)">{{
                row.goodsSku
              }}</a>
            </template>
            <!-- <template slot-scope="{ row }" slot="account">
              <div v-for="item in accountList" :key="item.value">
                {{ row.pickingType === item.value ? item.label : '' }}
              </div>
            </template> -->
            <template slot-scope="{ row }" slot="name">
              <Tooltip
                v-if="row.goodsCnDesc"
                :content="row.goodsCnDesc"
                placement="right"
                transfer
                max-width="300"
              >
                <div class="name-style">{{ row.goodsCnDesc }}</div>
              </Tooltip>
              <Tooltip
                v-if="row.goodsAttributes"
                :content="row.goodsAttributes"
                placement="right"
                transfer
                max-width="300"
              >
                <div class="specifications-style name-style">
                  {{ row.goodsAttributes }}
                </div>
              </Tooltip>
            </template>
            <template slot-scope="{ row }" slot="deliveryTime">
              <div v-if="row.deliveryTime">
                {{ $uDate.dealTime(row.deliveryTime).slice(0, 10) }}
              </div>
            </template>
            <template slot-scope="{ row }" slot="productTypes">
              <div
                v-for="(item, index) in commodityCategoryList"
                :key="index + 'commodityCategoryList'"
              >
                {{ row.productTypes === item.value ? item.label : "" }}
              </div>
            </template>
            <template slot-scope="{ row }" slot="productCategory">
              <div
                v-for="(item, index) in productCategoryList"
                :key="index + 'productCategoryList'"
              >
                {{ row.productCategory === item.value ? item.label : "" }}
              </div>
            </template>
            <template slot-scope="{ row }" slot="goodsSkuNumber">
              <span>{{ row.goodsSkuNumber || 0 }}</span>
            </template>
            <template slot-scope="{ row }" slot="importNumber">
              <span>{{ row.importNumber || 0 }}</span>
            </template>
            <template slot-scope="{ row }" slot="calculatedQuantity">
              <span>{{ row.calculatedQuantity || 0 }}</span>
            </template>
            <template slot-scope="{ row }" slot="destroyedQuantity">
              <span>{{ row.destroyedQuantity || 0 }}</span>
            </template>
            <template slot-scope="{ row }" slot="remainingAmount">
              <span>{{ row.remainingAmount || 0 }}</span>
            </template>
            <template slot-scope="{ row }" slot="action">
              <a
                href="javascript:;"
                style="text-decoration: none"
                @click="confirmDetail(row, 1)"
                v-if="getPermission('warehousing_modifySkuDetail')"
                >资料管理</a
              >
            </template>
          </Table>
        </div>
      </div>
      <!--分页-->
      <div class="pagesMain">
        <Page
          :total="pageTotal"
          :current="searchParams.pageNum"
          :page-size="searchParams.pageSize"
          show-total
          show-sizer
          show-elevator
          @on-change="pageNumChange"
          @on-page-size-change="pageSizeChange"
          :page-size-opts="pageArray"
        ></Page>
      </div>
    </div>
    <!-- 入仓详情 -->
    <product-detail
      :dialogVisible.sync="productDialog.dialogVisible"
      :titleType="productDialog.titleType"
      :confirmData="productDialog.data"
      @search="search"
    ></product-detail>
    <!-- 修改商品类别 -->
    <product-category
      :dialogVisible.sync="categoryVisible"
      :list="selectionList"
      @search="search"
    ></product-category>
  </div>
</template>

<script>
import api from "@/api/api";
import fetch from "@/components/mixin/fetch";
import tableHeight_mixin from "@/components/mixin/tableHeight_mixin";
import productDetail from "./productComponents/detail.vue";
import productCategory from "./productComponents/productCategory.vue";
export default {
  name: "warehouseProduct",
  mixins: [fetch, tableHeight_mixin],
  components: { productDetail, productCategory },
  data() {
    return {
      searchParams: {
        warehousingOverseas: "",
        sku: [],
        spu: [],
        pickingNo: [],
        productTypes: "",
        endWarehousingTime: "",
        beginWarehousingTime: "",
        endDeliveryTime: "",
        beginDeliveryTime: "",
        account: "",
        orderBy: "Sku",
        orderSeq: "DESC",
        pageNum: 1,
        pageSize: 50,
      },
      resetOption: {
        // 重置不为空的条件
        warehousingOverseas: "",
      },
      commodityCategoryList: [
        { label: "常规", value: "0" },
        { label: "童装", value: "1" },
        { label: "宠物", value: "2" },
      ],
      productCategoryList: [
        { label: "服装类", value: "0" },
        { label: "家居类", value: "1" },
        { label: "配饰类", value: "2" },
        { label: "试卖类", value: "3" },
        { label: "常规类", value: "4" },
      ],
      sortButtonList: [
        {
          sortHeader: "按SKU",
          sortField: "Sku",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "按入仓时间",
          sortField: "RC",
          sortType: "DESC",
        },
      ],
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "图片",
          slot: "goodsUrl",
          align: "center",
          width: 100,
        },
        {
          title: "SKU",
          slot: "goodsSku",
          align: "center",
          minWidth: 120,
        },
        {
          title: "店铺",
          key: "account",
          align: "center",
          width: 120,
        },
        {
          title: "SPU",
          key: "spu",
          align: "center",
          minWidth: 120,
        },
        {
          title: "名称/规格",
          align: "center",
          minWidth: 160,
          slot: "name",
        },
        {
          title: "商品类别",
          align: "center",
          width: 100,
          slot: "productTypes",
        },
        {
          title: "商品类目",
          slot: "productCategory",
          align: "center",
          width: 100,
        },
        {
          title: "最新发货时间",
          slot: "deliveryTime",
          align: "center",
          width: 120,
        },
        {
          title: "总发货数量",
          slot: "goodsSkuNumber",
          align: "center",
          width: 100,
        },
        {
          title: "总入仓数量",
          slot: "importNumber",
          align: "center",
          width: 100,
        },
        {
          title: "总销售数量",
          slot: "calculatedQuantity",
          align: "center",
          width: 100,
        },
        {
          title: "总销毁数量",
          slot: "destroyedQuantity",
          align: "center",
          width: 100,
        },
        {
          title: "总剩余数量",
          slot: "remainingAmount",
          align: "center",
          width: 100,
        },
        {
          title: "操作",
          align: "center",
          width: 100,
          fixed: "right",
          slot: "action",
        },
      ],
      productDialog: {
        data: {},
        titleType: 1,
        dialogVisible: false,
      },
      categoryVisible: false,
      // accountList: [],
    };
  },
  created() {
    this.searchParams.warehousingOverseas =
      this.resetOption.warehousingOverseas = this.$store.state.warehouseId;
    this.fetch(api.querySkuInfo, "post", "warehousing_querySkuDetail");
  },
  methods: {
    // 发货时间
    sendTimeChange(e) {
      this.searchParams.beginDeliveryTime = e[0] ? e[0] + " 00:00:00" : "";
      this.searchParams.endDeliveryTime = e[1] ? e[1] + " 23:59:59" : "";
    },
    // 入仓时间
    createTimeChange(e) {
      this.searchParams.beginWarehousingTime = e[0] ? e[0] + " 00:00:00" : "";
      this.searchParams.endWarehousingTime = e[1] ? e[1] + " 23:59:59" : "";
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(Info) {
      this.searchParams.orderSeq = Info[0] || "DESC";
      this.searchParams.orderBy = Info[1] || "Sku";
      this.fetch();
    },
    // 导出
    exportExcel(e) {
      const _self = this;
      let fun = {
        api: "",
        title: "",
        1() {
          this.title = "导出选中列表";
          this.api = "exportOverseasWarehouseProduct";
          this.part();
        },
        2() {
          this.title = "导出所有列表";
          this.api = "exportOverseasWarehouseProduct";
          this.all();
        },
        3() {
          this.title = "导出选中明细";
          this.api = "exportOverseasWarehouseProductDetail";
          this.part();
        },
        4() {
          this.title = "导出所有明细";
          this.api = "exportOverseasWarehouseProductDetail";
          this.all();
        },
        // 部分导出
        part() {
          let list = _self.selectionList || [];
          if (!list.length) {
            _self.$Message.error("请勾选要导出的商品列表~");
            return;
          }
          let temp = {};
          temp.sku = list.map((k) => {
            return k.goodsSku;
          });
          temp.warehousingOverseas = _self.searchParams.warehousingOverseas;
          this.modal(temp);
        },
        // 导出所有
        all() {
          if (!_self.tableList.length) {
            _self.$Message.error("表格数据为空~");
            return;
          }
          let temp = _self.$common.removeEmpty(_self.searchParams);
          delete temp.pageNum;
          delete temp.pageSize;
          this.modal(temp);
        },
        modal(temp) {
          _self.$Modal.confirm({
            title: this.title,
            content: `异步${this.title}行的列表数据，导出任务完成后，请使用"导出查看"的功能，下载导出文件`,
            loading: true,
            onOk: () => {
              _self.axios
                .post(api[this.api], temp)
                .then(({ data }) => {
                  if (!(data && data.code === 0)) return;
                  _self.$Message.success("导出成功~");
                  _self.$refs.selection &&
                    _self.$refs.selection.selectAll(false);
                })
                .finally(() => {
                  _self.$Modal.remove();
                });
            },
            onCancel: () => {},
          });
        },
      };
      e && fun[e] && fun[e]();
    },
    // 入仓详情
    confirmDetail(row, type) {
      this.productDialog.data = row;
      this.productDialog.titleType = type;
      this.productDialog.dialogVisible = true;
    },
    // 批量修改商品类别
    editProductCategory() {
      let list = this.selectionList || [];
      if (!list.length) {
        this.$Message.error("请勾选要修改的商品列表~");
        return;
      }
      this.categoryVisible = true;
    },
  },
};
</script>

<style lang="less">
.warehouseConfirm {
  height: 100%;

  .name-style {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
  }

  .specifications-style {
    color: #08b15c;
  }

  .ivu-tooltip {
    width: 100%;
  }
}
</style>
