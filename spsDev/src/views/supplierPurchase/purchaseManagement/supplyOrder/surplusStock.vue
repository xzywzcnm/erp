<template>
  <div>
    <!-- eslint-disable-next-line vue/no-mutating-props -->
    <Modal
      class="modal-main"
      v-model="dialogObj.modelVisible"
      :mask-closable="false"
      title="剩余取消"
      :width="1200"
    >
      <div class="flexBox cancelReason">
        <span class="cancleReason-front">取消原因: </span><Input v-model="reason" style="width: 400px" maxlength="200" clearable/>
        <div class="cancleReason-behind">提示：填写取消原因，可以反渍到备货计划的采购取消记录”中：</div>
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
  stockList,
  tablist,
  supplyStatusList,
  progressList,
} from "./configFile";
import { math } from "@/utils/comfun.js";
import Mixin from "@/components/mixin/common_mixin";
export default {
  mixins: [Mixin],
  components: { largePicture },
  data() {
    return {
      columns: stockList,
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
  created() {},
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
          despatchNumber: k.despatchNumber,
          id: k.orderInfoGoodsId,
          lessGoodsQuantity: k.lessGoodsQuantity,
          notDespatchNumber: k.notDespatchNumber,
          notReceivedNumber: k.notReceivedNumber,
          orderType: k.orderType,
          qualityNumber: k.qualityNumber,
          salesNumber: k.salesNumber,
          skuNo: k.skuNo,
          status: k.status,
          substandardNumber: k.substandardNumber,
          supplierOrderId: k.purchaseNumber,
          surplusQuantity: k.cancalNum,
          goodsId: k.goodsId,
          purchaseId: k.purchaseId,
          reason: this.reason
        };
      });
      let status = true;
      this.tableList.forEach((item) => {
        if (item.cancalNum > item.notReceivedQuantity) {
          status = false;
        }
      });

      if (!status) {
        return this.$Message.warning("操作失败，取消数量大于仓库未收货数量；");
      }
      this.loading = true;
      this.axios
        .post(api.cancelSurplus, idList)
        .then(({ data }) => {
          if (data.code == 0) {
            this.$Message.success("取消剩余成功");
          }
        })
        .finally((err) => {
          this.loading = false;
          this.dialogObj.modelVisible = false;
          this.$emit("fetch");
        });
    },
    // 重置
    handleReset() {
      let [list, okList, failList] = [this.dialogObj.list, [], []];
      this.reason = null
      // 已发货，已取消的剩余数量订单SKU不允许剩余取消；
      list.forEach((k) => {
        if (k.status < 4) {
          okList.push(k);
        } else {
          failList.push(k);
        }
      });
      if (failList.length) {
        this.$Message.warning(
          "已发货，已取消的订单SKU不允许剩余取消，已帮你筛选~"
        );
      }
      this.tableList = okList;
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
      // let obj = { 1: "已取消", 2: "收货完成", 3: "已发货", 4: "收货中" };
      let [num, type] = [0, ""];
      let noreceiveNum = math.sub(row.salesNumber, row.notReceivedNumber); //下单数-未收数
      let receiveNum = math.add(row.qualityNumber, row.substandardNumber); //收货数

      // 全部未发
      if (row.despatchNumber <= 0) {
        // 全部未收，剩余取消数为全部，状态变更为：已取消；
        if (noreceiveNum <= 0) {
          num = row.notDespatchNumber;
          type = 1;
        }
        // 有收货，但有未收，剩余取消数为未收数，状态变更为：收货完成
        if (receiveNum > 0 && row.notReceivedNumber > 0) {
          num = row.notReceivedNumber;
          type = 2;
        }
      }

      // 部分发货有未发
      if (
        row.despatchNumber > 0 &&
        math.sub(row.salesNumber, row.despatchNumber) > 0 &&
        row.notDespatchNumber > 0
      ) {
        // 全部未收，剩余取消数为未发数，状态变更为：已发物流；
        if (noreceiveNum <= 0) {
          num = row.notDespatchNumber;
          type = 3;
        }
        // 部分收货且有未收
        if (receiveNum > 0 && row.notReceivedNumber > 0) {
          let compareNum = math.sub(
            row.notDespatchNumber,
            row.notReceivedNumber
          );
          // 未发数大于等于未收数，剩余取消数为未收数，状态变更为：收货完成；
          if (compareNum >= 0) {
            num = row.notReceivedNumber;
            type = 2;
          } else {
            // 未发数小于未收数，剩余取消数为未发数，状态变更为：收货中；
            num = row.notDespatchNumber;
            type = 4;
          }
        }
      }
      if (type) {
        this.tableList[index].cancalNum = num;
        return `<div>${num}</div>`;
        // <div>->${obj[type]}</div>
      }
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