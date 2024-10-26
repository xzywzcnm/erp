<template>
  <div>
    <Modal v-model="isVisible" title="添加全托管商品" width="1300px" :mask-closable="false" class="fullManageProduct">
      <div>
        <div class="text-tags">
          <span>已选择：</span>
          <Tag closable color="blue" v-for="(v, i) in saveSelectMore" :key="i" @on-close="closeTag(v)">
            {{ v.platformSku }}
          </Tag>
        </div>
        <Form ref="productData" :model="mainInfo" inline class="productData-form mt10" :label-width="100"
          @submit.native.prevent>
          <div>
            <Form-item label="平台主体：">
              <div v-if="platformList[platformData.platformType]">{{ platformList[platformData.platformType].label }}
              </div>
            </Form-item>
            <FormItem label="店铺：">
              <div v-if="shopList[platformData.saleAccount]">{{ shopList[platformData.saleAccount].accountCode }}
              </div>
            </FormItem>
          </div>
          <Form-item label="平台SKC：" prop="platformSkcList">
            <dyt-input-tag :limit="1" type="textarea" v-model.trim="mainInfo.platformSkcList" placeholder="多个请用逗号或回车分隔" />
          </Form-item>
          <Form-item label="平台SKU：" prop="platformSkuList">
            <dyt-input-tag :limit="1" type="textarea" v-model.trim="mainInfo.platformSkuList" placeholder="多个请用逗号或回车分隔" />
          </Form-item>
          <Form-item label="LAPA SKU：" prop="productSkuList">
            <dyt-input-tag :limit="1" type="textarea" v-model.trim="mainInfo.productSkuList" placeholder="多个请用逗号或回车分隔" />
          </Form-item>
          <FormItem :label-width="0">
            <Button type="primary" @click="search" style="margin-right: 10px" :disabled="searchLoading">搜索</Button>
          </FormItem>
        </Form>

        <div class="table-main">
          <Table highlight-row border :columns="columns" :data="tableList" height="480" :loading="tableLoading"
            :span-method="handleSpan"></Table>
          <div class="textAlignRight">
            <dyt-pagination :total="tableItemTotal" :current="mainInfo.pageNum" :page-size="mainInfo.pageSize"
              @on-change="pageNumChange" @on-page-size-change="pageSizeChange" class="mt10"></dyt-pagination>
          </div>
        </div>

      </div>
      <div slot="footer" class="textAlignRight">
        <Button type="primary" @click="confirmData">确定</Button>
        <Button @click="isVisible = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
import { outListTypeList, arrayToObj } from "./fileData";
import tableImg_mixin from "@/components/mixin/tableImg_mixin";
import { getWarehouseId } from "@/utils/getService";
export default {
  name: "fullManageProduct",
  mixins: [tableImg_mixin],
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false;
      },
    },
    platformData: {
      type: Object,
      default() { return {} },
    },
    existGoodList: {
      type: Array,
      default() { return [] },
    },
  },
  data() {
    return {
      isVisible: false,
      saveSelectMore: [],
      tableList: [],
      tableLoading: false,
      tableItemTotal: 0,
      platformList: arrayToObj(outListTypeList),
      mainInfo: {
        platformSkuList: [],
        productSkuList: [],
        platformSkcList: [],
        warehouseId: getWarehouseId(),
        pageNum: 1,
        pageSize: 20,
      },
      shopList: {},
      statusList: { 0: '未匹配', 1: '已匹配' },
      columns: [
        {
          title: "平台商品款式",
          minWidth: 160,
          render: (h, params) => {
            return h('div', {
              class: 'flexCenter'
            }, [
              this.tableImg(h, params.row.imageUrl),
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
          title: "平台SKU",
          key: "platformSku",
          minWidth: 110,
        },
        {
          title: "条码编码",
          key: "labelCode",
          minWidth: 120,
        },
        {
          title: "主属性",
          key: "skcSpecName",
          minWidth: 100,
        },
        {
          title: "次属性",
          key: "skuSpecName",
          minWidth: 100,
        },
        {
          title: "商品SKU",
          key: "lapaSku",
          minWidth: 110,
        },
        {
          title: "匹配状态",
          key: "goodsWeight",
          width: 90,
          render: (h, { row }) => {
            return h('span', {
              style: {
                color: row.matchStatus === 0 ? '#f20' : '',
                display: this.statusList[row.matchStatus] ? 'block' : 'none'
              }
            }, this.statusList[row.matchStatus]);
          },
        },
        {
          title: "LAPA商品属性",
          key: "spec",
          minWidth: 120,
        },
        {
          title: "操作",
          width: 80,
          render: (h, { row, index }) => {
            return h(
              "Button",
              {
                props: {
                  size: "small",
                  type: "primary",
                  disabled: row.selected
                },
                on: {
                  click: () => {
                    this.selectRow(row, index);
                  },
                },
              },
              "选择"
            );
          },
        },
      ],
      searchLoading: false,
      pageArray: [10, 20, 50, 100],
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
        if (val) return;
        this.$emit("update:modelVisible", false);
      },
      deep: true,
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.isVisible = true;
      this.$nextTick(() => {
        this.tableList = [];
        this.saveSelectMore = [];
        this.tableItemTotal = 0;
        this.$refs['productData'].resetFields();
        let { platformType } = this.platformData;
        this.platformChange(platformType).then(() => {
          this.search();
        })
      })
    },
    search() {
      this.mainInfo.pageNum = 1;
      this.getList();
    },
    // 根据平台获取对应的店铺信息
    platformChange(e) {
      let item = this.platformList[e] || {};
      return this.$store.dispatch("getAllStoreList", { platformId: item.platformId })
        .then((list) => {
          this.shopList = arrayToObj(list, 'accountCode');
        });
    },
    getList() {
      let temp = this.$common.copy(this.mainInfo);
      let { platformType, saleAccount } = this.platformData;
      let platform = this.platformList[platformType] || {};
      temp.platformId = platform.platformId;
      let account = this.shopList[saleAccount] || {};
      temp.saleAccountId = account.saleAccountId;
      this.tableLoading = true;
      this.axios.post(api.fullManage_goodsList, temp).then(({ data }) => {
        if (data.code === 0) {
          let datas = data.datas || {};
          let obj = {};
          (datas.list || []).forEach(k => {
            if (!obj[k.skc]) obj[k.skc] = [];
            obj[k.skc].push(k);
          })
          let arr = [];
          let existList = [...this.saveSelectMore, ...this.existGoodList];
          let platformSkus = existList.map(k => k.platformSku);
          Object.keys(obj).forEach(k => {
            obj[k].forEach((j, i) => {
              // 是否存在已选择的sku
              const hasSku = platformSkus.includes(j.platformSku);
              // 库存数是否大于0
              // const isAvailable = j.availableNumber <= 0;
              obj[k][i].selected = hasSku;
              obj[k][i].rowspan = i > 0 ? 0 : obj[k].length;
              obj[k][i].colspan = 1;
            })
            arr.push(...obj[k]);
          })
          this.tableList = arr;
          this.tableItemTotal = datas.total || 0;
        }
      }).finally(() => {
        this.tableLoading = false;
      })
    },
    pageNumChange(num) {
      this.mainInfo.pageNum = num;
      this.getList();
    },
    pageSizeChange(size) {
      this.mainInfo.pageSize = size;
      this.getList();
    },
    confirmData() {
      let list = this.$common.copy(this.saveSelectMore);
      this.$emit('fullProductData', list);
      this.isVisible = false;
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
    selectRow(row, index) {
      this.saveSelectMore.push(row);
      this.$set(this.tableList[index], 'selected', true)
    },
    closeTag(item) {
      let fun = (list, row, attr) => {
        let index = null;
        list.forEach((k, i) => {
          if (!this.$common.isEmpty(index)) return;
          if (row[attr] === k[attr]) index = i;
        })
        return index;
      }
      let saveIndex = fun(this.saveSelectMore, item, 'platformSku');
      this.saveSelectMore.splice(saveIndex, 1);
      let tableIndex = fun(this.tableList, item, 'platformSku');
      this.$set(this.tableList[tableIndex], 'selected', false)
    },
  },
};
</script>

<style lang="less">
.fullManageProduct {
  .text-tags {
    height: 100px;
    padding: 10px 10px;
    font-size: 16px;
    font-weight: 600;
    background-color: rgb(242, 242, 242);
    overflow-y: scroll;

    .ivu-icon-ios-close {
      color: #666 !important;
    }
  }

  .btnGroup {
    position: absolute;
    right: 2px;
    bottom: 10px;
  }

  .ivu-checkbox-wrapper {
    display: inline-block;
  }

  .productData-form {
    .ivu-form-item {
      margin-bottom: 10px;
    }

    .ivu-form-item-content {
      width: 200px;
    }
  }

  .textAlignRight {
    text-align: right;
  }

  .ivu-modal {
    top: 50px;
  }
}
</style>