<template>
  <div>
    <Modal
      v-model="isVisible"
      title="装箱"
      :width="1160"
      :mask-closable="false"
      class="joinBoxList-fully"
    >
      <div class="mb10">
        <RadioGroup v-model="type">
          <Radio label="1">新增加货箱</Radio>
          <Radio label="2">加入已有货箱</Radio>
        </RadioGroup>
      </div>
      <Table
        highlight-row
        border
        :columns="columns"
        :data="tableList"
        max-height="500"
        v-show="type == 2"
        :loading="tableLoading"
      ></Table>
      <div slot="footer">
        <Button
          type="primary"
          @click="confirmJoin"
          v-if="type == 1"
          :disabled="loading"
          >确定</Button
        >
        <Button @click="isVisible = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
import common from "@/components/mixin/common_mixin";
export default {
  name: "qualityProblemProducts",
  mixins: [common],
  props: {
    dialogVisible: {
      type: Boolean,
      default() {
        return false;
      },
    },
    detailData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    list: {
      //要新加货箱列表
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data() {
    const v = this;
    return {
      isVisible: false,
      loading: false,
      tableLoading: false,
      columns: [
        {
          title: "货箱编号",
          key: "pickingBoxNo",
          align: "center",
        },
        {
          title: "货箱信息",
          key: "platformBoxNo",
          align: "center",
        },
        {
          title: "货箱备注",
          key: "boxRemark",
          align: "center",
        },
        {
          title: "SKU数量",
          key: "skuSum",
          align: "center",
          width: 100,
        },
        {
          title: "商品数量",
          key: "quantitySum",
          align: "center",
          width: 100,
        },
        {
          title: "货箱预估重量(kg)",
          align: "left",
          key: "goodsWeight",
          width: "134",
        },
        {
          title: "货箱状态",
          align: "center",
          width: "120",
          render: (h, { row }) => {
            let typeList = {
              0: { label: "正在装箱" },
              1: { label: "已装箱" },
            };
            return h(
              "span",
              typeList[row.boxStatus] ? typeList[row.boxStatus].label : ""
            );
          },
        },
        {
          title: "操作",
          align: "center",
          width: 100,
          render: (h, params) => {
            return h(
              "div",
              {
                attrs: {
                  class: "unlinkText cursorClick",
                },
                on: {
                  click() {
                    v.joinBox(params.row);
                  },
                },
              },
              "加入此货箱"
            );
          },
        },
      ],
      type: "1",
      tableList: [],
    };
  },
  watch: {
    dialogVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true,
    },
    isVisible: {
      handler(val) {
        if (val) return;
        this.$emit("update:dialogVisible", val);
      },
      deep: true,
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.type = "1";
      this.tableList = [];
      this.isVisible = true;
      this.getBoxList();
    },
    getBoxList() {
      this.tableLoading = true;
      this.axios
        .get(`${api.fullManage_queryPickingBox}${this.detailData.pickingId}`)
        .then((res) => {
          if (res.data.code === 0) {
            let list = res.data.datas || [];
            this.tableList = list.filter((k) => k.boxStatus === 0);
          }
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
    getBoxContent() {
      return this.list.map((k) => {
        let arr = ["pickingDetailId", "productGoodsId", "quantity"];
        let obj = {};
        arr.forEach((key) => {
          obj[key] = k[key];
        });
        return obj;
      });
    },
    // 新加货箱且导入内容
    confirmJoin() {
      let { pickingId } = this.detailData;
      let list = this.getBoxContent();
      // console.log(list);
      // return;
      this.loading = true;
      this.axios
        .post(api.fullManage_genPickingBox + pickingId, list)
        .then((res) => {
          if (res.data.code === 0) {
            this.$Message.success("操作成功");
            this.isVisible = false;
            this.$emit("emitDetail");
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 加入货箱
    joinBox(row) {
      let list = this.getBoxContent().map((k) => {
        k.pickingBoxId = row.pickingBoxId;
        return k;
      });
      // console.log(list);
      // return;
      this.tableLoading = true;
      this.axios
        .post(api.fullManage_importPickingBox + row.pickingBoxId, list)
        .then((res) => {
          if (res.data.code === 0) {
            this.$Message.success("操作成功");
            this.isVisible = false;
            this.$emit("emitDetail");
          }
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
  },
};
</script>

<style lang="less">
.joinBoxList-fully {
  .printSkuCode_printBtn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    background-color: #f2f2f2;

    .printSkuCode_printBtn_numset {
      display: flex;
      align-items: center;
    }
  }
}
</style>
