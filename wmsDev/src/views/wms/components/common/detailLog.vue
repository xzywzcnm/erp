<template>
  <div>
    <Table border :columns="orderLogColumns" :data="orderLogData" :loading="loading" max-height="450" />
    <Button v-if="orderLogParams.nextToken !== null" @click="getOrderLog()" icon="ios-arrow-down" long>展示更多</Button>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";

const ignoreWarehouse = ["shl"];

export default {
  name: "orderLog",
  mixins: [Mixin],
  data() {
    return {
      loading: false,
      orderLogColumns: [
        {
          key: "updatedBy",
          title: "操作人", // 操作人
          width: 100,
          render: (h, params) => {
            return h("span", this.getUserName(params.row.updatedBy));
          },
        },
        {
          key: "logContentDesc",
          title: "操作内容描述", // 操作内容描述
          minWidth: 230,
          render(h, params) {
            if (params.row.logTypeDesc === "10") {
              return h("span", "备注" + "：" + params.row.logContentDesc);
            } else {
              return h("span", params.row.logContentDesc);
            }
          },
        },
        {
          key: "updatedTime",
          title: "操作时间", // 操作时间
          width: 160,
          align: "center",
          render: (h, params) => {
            if (
              this.$common.isEmpty(this.warehouseName) ||
              !ignoreWarehouse.includes(this.warehouseName)
            ) {
              return h(
                "div",
                {},
                this.$uDate.getDataToLocalTime(params.row.updatedTime, "fulltime")
              );
            }
            return h("div", {}, params.row.updatedTime);
          },
        },
      ],
      orderLogData: [],
      orderLogParams: {
        pickingId: null,
        nextToken: "1",
        pageSize: 10,
        showNotes: 1,
      },
    };
  },
  props: {
    pickingId: {
      // 包裹id
      default: "",
      required: true,
      type: String,
    },
    showNotes: {
      // 是否展示备注 默认展示
      default: 1,
      type: Number,
    },
    from: {
      // 标识是出库单还是入库单
      default: "",
      type: String,
    },
    // 仓库模板名称
    warehouseName: {
      type: String,
      default: "",
    },
  },
  watch: {
    pickingId: {
      deep: true,
      immediate: true,
      handler(n, o) {
        this.On_searchOrderLogInit();
      }
    },
    from: {
      handler(data) {
        if (data === "inStock") {
          this.getOrderLog();
        }
      },
      deep: true,
    },
  },
  methods: {
    getParams() {
      this.orderLogParams.pickingId = this.pickingId;
      this.orderLogParams.showNotes = this.showNotes;
      this.orderLogParams.nextToken = null;
    },
    On_searchOrderLogInit() {
      // this.getOrderLog();
      /**
       * 搜索方法 首次加载 （日志增量加载）
       * */
      this.getParams();
      this.orderLogData = [];
      this.$nextTick(() => {
        if (this.$common.isEmpty(this.orderLogParams.pickingId)) return;
        this.loading = true;
        this.axios.post(api.get_wmsPickingLog, this.orderLogParams).then((response) => {
          this.loading = false;
          if (response.data.code === 0) {
            this.orderLogParams.nextToken = response.data.datas.nextToken;
            this.orderLogData = [...this.orderLogData, ...response.data.datas.result];
          }
        });
      });
    },
    getOrderLog() {
      this.orderLogData = this.$store.state.operationLog || [];
    },
  },
};
</script>
