<template>
  <div>
    <Modal
      v-model="isVisible"
      title="查看货箱信息"
      width="1300"
      :mask-closable="false"
      class="packingInformationDetailPage formDetail"
    >
      <div class="fmb0">
        <Form :label-width="90" class="formDetail">
          <div class="inline-form formWidth200">
            <FormItem label="货箱编号:">
              <span>{{ formData.pickingBoxNo }}</span>
            </FormItem>
            <FormItem label="货箱信息:">
              <span>{{ formData.platformBoxNo }}</span>
            </FormItem>
            <FormItem label="货箱备注:">
              <span>{{ formData.boxRemark }}</span>
            </FormItem>
            <FormItem label="货箱状态:">
              <span v-if="typeList[formData.boxStatus]">{{
                typeList[formData.boxStatus].label
              }}</span>
            </FormItem>
            <FormItem label="sku数量:">
              <span>{{ formData.skuSum }}</span>
            </FormItem>
            <FormItem label="商品数量:">
              <span>{{ formData.quantitySum }}</span>
            </FormItem>
            <FormItem label="预估重量(kg):">
              <span>{{ formData.goodsWeight }}</span>
            </FormItem>
            <FormItem label="完成装箱时间:">
              <span>{{ $uDate.dealTime(formData.boxFinishTime) }}</span>
            </FormItem>
            <FormItem label="装箱人:" class="overheight">
              <Tooltip
                :content="formData.createdNames.toString()"
                transfer
                max-width="300"
                placement="top"
                transfer-class-name="self-tooltip"
                v-if="formData.createdNames"
              >
                <span class="overEllipies">{{
                  formData.createdNames.toString()
                }}</span>
              </Tooltip>
            </FormItem>
          </div>
          <div class="mt20">
            <div class="form-item-flex">
              <FormItem
                label="SKU搜索:"
                class="form-width-item"
                :label-width="76"
              >
                <dyt-input-tag
                  :limit="1"
                  type="textarea"
                  v-model.trim="searchParams.skuList"
                  placeholder="输入sku/平台sku，多个请用逗号或回车分隔"
                />
              </FormItem>
              <FormItem :label-width="0">
                <Button
                  type="primary"
                  icon="ios-search"
                  class="ml10"
                  @click="search"
                  >查询</Button
                >
              </FormItem>
            </div>
            <div class="mt10 clear">
              <Table
                highlight-row
                :columns="columns"
                :data="tableList"
                :loading="loading"
                border
              >
                <template slot-scope="{ row }" slot="goodsUrl">
                  <div class="picture-width">
                    <dyt-previewImg :url="row.goodsUrl"> </dyt-previewImg>
                  </div>
                </template>
              </Table>
              <!--分页-->
              <div class="fr pages mt10">
                <Page
                  :total="tableItemTotal"
                  :current="searchParams.pageNum"
                  :page-size="searchParams.pageSize"
                  show-total
                  show-sizer
                  show-elevator
                  @on-change="pageNumChange"
                  @on-page-size-change="pageSizeChange"
                  :page-size-opts="pageArray"
                  size="small"
                ></Page>
              </div>
            </div>
          </div>
        </Form>
      </div>
      <div slot="footer">
        <Button @click="isVisible = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import api from "@/api/api";
import { arrayToObj } from "./fileData";
const searchParams = {
  skuList: [],
  pickingNo: "", //货箱编号
  pickingBoxId: "", //货箱id
  pickingId: "", //出库单id
  pageNum: 1,
  pageSize: 10,
};
export default {
  name: "packingInformationDetail",
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return {};
      },
    },
    data: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      isVisible: false,
      tableList: [],
      columns: [
        {
          title: "图片",
          slot: "goodsUrl",
          width: 80,
          align: "center",
        },
        {
          title: "LAPA SKU",
          key: "goodsSku",
          width: 140,
        },
        {
          title: "平台SKU",
          key: "platformSku",
          width: 140,
        },
        {
          title: "中英文描述",
          minWidth: 120,
          render: (h, params) => {
            return h("div", [
              h("div", params.row.cnDesc),
              h("div", params.row.enDesc),
            ]);
          },
        },
        {
          title: "订单数量",
          key: "expectedNumber",
          width: 90,
        },
        {
          title: "装箱数量",
          key: "quantitySum",
          width: 90,
        },
        {
          title: "未装箱数量",
          key: "notQuantitySum",
          width: 100,
          renderHeader: (h, params) => {
            return h(
              "div",
              {
                style: {
                  color: "#ed4014",
                },
              },
              "未装箱数量"
            );
          },
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  color: "#ed4014",
                },
              },
              params.row.notQuantitySum || 0
            );
          },
        },
        {
          title: "重量(g)",
          key: "goodsWeight",
          width: 90,
        },
        {
          title: "体积(cm)",
          key: "goodsVolume",
          width: 90,
        },
        {
          title: "产品类型",
          width: 120,
          key: "acceptableType",
        },
        {
          title: "采购单价",
          width: 90,
          key: "productCost",
        },
      ],
      tableItemTotal: 0, // 分页总条数
      searchParams: {},
      pageArray: [10, 20, 50, 100],
      totalData: {}, // 详情信息
      loading: false,
      typeList: {
        0: { label: "正在装箱" },
        1: { label: "已装箱" },
      },
      formData: {},
    };
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true,
    },
    isVisible: {
      handler(val) {
        !val && this.$emit("update:modelVisible", val);
      },
      deep: true,
    },
  },
  computed: {
    userInfoList() {
      let list = this.$store.getters.userInfoList || [];
      return arrayToObj(list, "userId");
    },
  },
  methods: {
    reset() {
      this.tableList = [];
      this.totalData = {};
      this.tableItemTotal = 0;
      this.searchParams = this.$common.copy(searchParams);
    },
    // 窗口打开
    open() {
      this.reset();
      this.isVisible = true;
      let data = this.$common.copy(this.data);
      let arr = ["pickingBoxId", "pickingId", "pickingNo"];
      arr.forEach((k) => {
        this.searchParams[k] = data[k];
      });
      data.createdNames = [];
      (data.createdBys || []).forEach((k) => {
        let user = this.userInfoList[k] || {};
        data.createdNames.push(user.userName || k);
      });
      this.formData = data;
      this.getList();
    },
    // 数据请求
    getList() {
      let temp = this.$common.removeEmpty(this.searchParams);
      this.loading = true;
      return this.axios
        .post(api.fullManage_queryBoxDetail, temp)
        .then(({ data }) => {
          if (!(data && data.code === 0)) return;
          let totalData = data.datas || {};
          this.tableItemTotal = totalData.total || 0;
          this.tableList = totalData.list || [];
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 查询
    search() {
      this.searchParams.pageNum = 1;
      this.getList();
    },
    pageNumChange(page) {
      this.searchParams.pageNum = page;
      this.getList();
    },
    pageSizeChange(size) {
      this.searchParams.pageSize = size;
      this.search();
    },
  },
};
</script>
<style lang="less">
.packingInformationDetailPage {
  .overheight .ivu-form-item-content {
    height: 32px;
  }

  .ivu-tooltip,
  .ivu-tooltip-rel,
  .overEllipies {
    max-width: 100%;
    height: 32px;
  }

  .overEllipies {
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .inline-form {
    .ivu-form-item {
      display: inline-block;
    }
  }
}

.form-item-flex {
  display: flex;
  align-items: center;

  .form-width-item {
    .ivu-form-item-content {
      width: 300px;
    }
  }
}
</style>