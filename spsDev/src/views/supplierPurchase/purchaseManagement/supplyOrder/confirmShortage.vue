<template>
  <div>
    <!-- eslint-disable-next-line vue/no-mutating-props -->
    <Modal
      class="modal-main"
      v-model="dialogObj.modelVisible"
      :mask-closable="false"
      title="确认少货"
      :width="1200"
    >
    <div class="flexBox cancelReason">
        <span class="cancleReason-front">少货原因: </span><Input v-model="reason" style="width: 400px" maxlength="200" clearable/>
        <div class="cancleReason-behind">提示：填写少货原因，可以反渍到备货计划的采购取消记录”中：</div>
      </div>
      <div class="content table-box">
        <Table
          highlight-row
          max-height="590"
          :columns="columns"
          :data="tableList"
          :border="true"
        >
          <template slot-scope="{ row }" slot="pic">
            <large-picture :url="row.imgUrl"></large-picture>
          </template>
          <template slot-scope="{ row }" slot="basic">
            <div class="order-item">
              <div class="order-li">
                订单：
                <span>{{ row.purchaseNumber || "-" }}</span>
              </div>
              <div class="order-li">SKU：{{ row.skuNo || "-" }}</div>
              <div class="order-li">供方货号：{{ row.supplierNo || "-" }}</div>
              <div class="btn-list">
                <span style="color: #ed4014" v-if="row.iscrash == 1">紧急</span>
                <span style="color: #2db7f5">{{
                  row.orderType == 1 ? "线上" : "线下"
                }}</span>
                <span style="color: #19be6b">{{ statusText(row.status) }}</span>
                <span style="color: #ff9900" v-if="row.supplyStatus > 0">{{
                  supplyStatusList[row.supplyStatus] &&
                  supplyStatusList[row.supplyStatus].label
                }}</span>
                <span
                  style="color: #cc00ff"
                  v-if="row.feedbackType === 0 || row.feedbackType === 1"
                  >{{
                    progressList[row.feedbackType] &&
                    progressList[row.feedbackType].label
                  }}</span
                >
              </div>
            </div>
          </template>
          <template slot-scope="{ row }" slot="salesTime">
            <span>{{
              getDataToLocalTime(row.salesTime, "fulltime", true)
            }}</span>
          </template>
          <template slot-scope="{ row, index }" slot="cancelNum">
            <div v-html="computedCancel(row, index)"></div>
          </template>
        </Table>
      </div>
      <div slot="footer" style="text-align: center">
        <Button type="primary" @click="handleSubmit()" :loading="loading"
          >确定</Button
        >
        <!-- eslint-disable-next-line vue/no-mutating-props -->
        <Button @click="dialogObj.modelVisible = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
import largePicture from "@/components/largePicture";
import {
  confirmList,
  tablist,
  supplyStatusList,
  progressList,
} from "./configFile";
import Mixin from "@/components/mixin/common_mixin";
export default {
  mixins: [Mixin],
  components: { largePicture },
  data() {
    return {
      columns: confirmList,
      tableList: [],
      loading: false,
      tablist: tablist,
      supplyStatusList: supplyStatusList,
      progressList: progressList,
      reason: null
    };
  },
  props: {
    dialogObj: {
      type: Object,
      default() {
        return {
          modelVisible: false,
          list: [],
        };
      },
    },
  },
  watch: {
    "dialogObj.modelVisible": {
      handler(newVal, oldVal) {
        if (newVal) this.handleReset();
      },
      immediate: true,
    },
  },
  methods: {
    // 提交
    handleSubmit() {
      let idList = this.tableList.map((k) => {
        return {
          ...k,
          id: k.orderInfoGoodsId,
          lessGoodsQuantity: k.notReceivedNumber,
          supplierOrderId: k.purchaseNumber,
          reason: this.reason
        };
      });
      const isHas = this.tableList.find((item) => {
        return item.notReceivedNumber > item.notReceivedQuantity
      });
      if (!this.$common.isEmpty(isHas)) {
        return this.$Message.warning('操作失败，确认少货数量大于仓库未收数量；');
      }
      this.loading = true;
      this.axios.post(api.confirmShortage, idList).then(({ data }) => {
        if (data.code == 0) {
          this.$Message.success("确认少货成功");
        }
      }).finally((err) => {
        this.loading = false;
        this.dialogObj.modelVisible = false;
        this.$emit("fetch");
      });
    },
    // 重置
    handleReset() {
      this.tableList = this.dialogObj.list;
      this.reason = null
    },
    // 状态
    statusText(status) {
      let name = "";
      this.tablist.forEach((k) => {
        if (k.value !== "" && k.value == status) {
          name = k.label;
        }
      });
      return name;
    },
    // 取消数量的计算
    computedCancel(row, index) {
      if (!row) return;
      if (row.notReceivedNumber <= 0) return;
      //let status = this.statusText(row.status);
      return `<div>${row.notReceivedNumber || 0}</div>`;
      // <div>${status}->收货完成</div>
    },
  },
};
</script>
<style scoped>
.order-block,
.order-li {
  display: flex;
  align-items: center;
}
.order-block {
  padding: 4px 0;
}
.order-item {
  margin-left: 10px;
}
.order-item .order-li .alink {
  text-decoration: underline;
}
.btn-list > span {
  white-space: nowrap;
  margin-right: 10px;
}
.cancelReason {
  margin-bottom: 20px;
  margin-left: 20px;
}
.cancleReason-front {
      margin-right: 20px;
      line-height: 24px;
  }
  .cancleReason-behind {
    padding-right: 20px;
    background-color: #F2F2F2;
    line-height: 36px;
    margin-left: 20px;
    padding-left: 10px;
    cursor: default;
  }
</style>