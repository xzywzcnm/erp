<template>
  <Modal
    v-model="operating"
    class="co clearMarginAuto resetModalAss"
    :title="productSubmit.fromNodeName"
    @on-visible-change="operVisibleChange"
  >
    <p
      slot="header"
      @mousedown="moveMt"
      class="moveHead"
    >
      <span>{{ productSubmit.fromNodeName }}</span>
    </p>
    <Form
      ref="operatingFrom"
      :model="operatingFrom"
      :rules="operatingRlues"
    >
      <FormItem>
        <label
          slot="label"
          v-if="isShow"
        >下一阶段</label>
        <span>{{ productSubmit.currentNodeName }}</span>
      </FormItem>
      <FormItem
        label="指派"
        prop="receiverId"
        v-if="isShow"
      >
        <dyt-select
          style="width: 300px"
          filterable
          v-model="receiverVal"
        >
          <Option
            v-for="(item, index) in receiverLists"
            :key="index"
            :value="item.userId"
          >{{ item.userName }}</Option>
        </dyt-select>
      </FormItem>
      <FormItem
        v-if="isInquiry"
        label="供货商"
        prop="addSupplierSupplier"
      >
        <dyt-select
          style="width: 300px"
          v-model="addSupplierSupplier"
          class="wid"
        >
          <Option
            v-for="(item, index) in supplierList"
            :key="index"
            :value="item.quotationId"
          >{{ item.supplierName }}</Option>
        </dyt-select>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button
        type="text"
        @click="operating = false"
      >取消</Button>
      <Button
        type="primary"
        :loading="btnLoadding"
        @click="operatingBtn"
      >确定</Button>
    </div>
  </Modal>
</template>

<script>
import CommonMixin from "@/components/mixin/commonMixin";
import api from "@/api/api";

export default {
  name: "commonAssigned", // 指派
  mixins: [CommonMixin],
  props: ["productSubmitParams"],
  data() {
    let v = this;
    return {
      btnLoadding: false,
      operating: false,
      operatingFrom: {},
      receiverLists: [],
      supplierList: [],
      addSupplierSupplier: "",
      receiverVal: "",
      operatingRlues: {
        receiverId: {
          validator: v.validateReceive,
          trigger: "change",
        },
        addSupplierSupplier: {
          validator: v.validateAddSupplierSupplier,
          trigger: "change",
        },
      },
    };
  },
  mounted() {},
  methods: {
    getSupplierList() {
      let v = this;
      v.addSupplierSupplier = "";
      v.$axios
        .get(api.queryProductSupplier + "?productId=" + v.$store.state.createId)
        .then((res) => {
          if (res.code === 0) {
            v.supplierList = res.datas;
            if (v.supplierList.length > 0) {
              v.addSupplierSupplier =
                v.addSupplierSupplier === ""
                  ? v.supplierList[0].quotationId
                  : v.addSupplierSupplier;
              v.supplierList.forEach((item) => {
                if (item.isDefault) {
                  v.addSupplierSupplier = item.quotationId;
                }
              });
            }
          }
        });
    },
    validateReceive(rule, value, callback) {
      let v = this;
      if (v.receiverVal === "") {
        callback(new Error("指派人不能为空"));
      } else {
        callback();
      }
    },
    validateAddSupplierSupplier(rule, value, callback) {
      let v = this;
      if (v.addSupplierSupplier === "") {
        callback(new Error("供货商不能为空"));
      } else {
        callback();
      }
    },
    operVisibleChange(n) {
      if (n) {
        this.$refs.operatingFrom.resetFields();
        this.receiverListsMt();
      } /* else {
       this.receiverVal=0;
       this.receiverLists=[];
       } */
    },
    setInquiry(callback) {
      let v = this;
      v.$refs.operatingFrom.validate((vaild) => {
        if (vaild) {
          v.$axios
            .post(api.setDefaultSupplier, {
              productId: v.$store.state.createId, // 新品需求ID
              quotationId: v.addSupplierSupplier, // 供应商报价ID，必需
            })
            .then((res) => {
              if (res.code === 0 && res.datas !== 0) {
                callback && callback();
              } else {
                v.btnLoadding = false;
                v.$msg.error("审核失败");
              }
            })
            .catch(() => {
              v.btnLoadding = false;
            });
        } else {
          v.btnLoadding = false;
        }
      });
    },
    operatingBtn() {
      let v = this;
      v.btnLoadding = true;
      if (v.isInquiry) {
        v.setInquiry(v.nextAssign);
      } else {
        v.nextAssign();
      }
    },
    nextAssign() {
      let v = this;
      if (!v.isShow) {
        v.submitParams();
        return;
      }
      v.$refs.operatingFrom.validate((vaild) => {
        if (vaild) {
          v.submitParams();
        } else {
          v.btnLoadding = false;
        }
      });
    },
    submitParams() {
      let v = this;
      var params = v.productSubmit;
      if (v.productSubmitParams instanceof Array) {
        let data = JSON.parse(JSON.stringify(v.productSubmitParams));
        data.forEach((item, index) => {
          item.receiverId = v.receiverVal;
          item.sendType = 0; // 0提交，1打回上级，2打回发起人，3转交，4作废
        });
        v.$axios
          .post(api.sendFlowByList, data)
          .then((res) => {
            v.btnLoadding = false;
            if (res.code === 0) {
              let flowInstance = v.productSubmitParams;
              if (
                (flowInstance.flowId === "LC0002" &&
                  flowInstance.currentNodeId === 3) ||
                (flowInstance.flowId === "LC0003" &&
                  flowInstance.currentNodeId === 3) ||
                (flowInstance.flowId === "LC0004" &&
                  flowInstance.currentNodeId === 3)
              ) {
                let sendType =
                  flowInstance.flowId === "LC0002"
                    ? "picture"
                    : flowInstance.flowId === "LC0003"
                    ? "check"
                    : "description";
                if (v.$store.state.saleStatus !== 0) {
                  v.$axios.post(api.sendProductInfoToErp, {
                    productId: v.$store.state.createId,
                    sendType: sendType,
                  });
                  v.$axios.post(api.sendProductInfoToListing, {
                    productId: v.$store.state.createId,
                    sendType: sendType,
                  });
                }
              }
              v.$msg.success("提交成功");
              v.$emit("closeGetList");
              v.operating = false;
            } else {
              v.operating = false;
              v.$msg.error("提交失败");
            }
          })
          .catch(() => {
            v.btnLoadding = false;
            v.$msg.error("服务错误");
          });
      } else {
        params.productId = v.$store.state.createId;
        params.receiverId = v.receiverVal;
        params.sendType = 0; // 0提交，1打回上级，2打回发起人，3转交，4作废
        v.$axios
          .post(api.productSubmit, params)
          .then((res) => {
            v.btnLoadding = false;
            if (res.code === 0) {
              v.$msg.success("提交成功");
              let flowInstance = v.productSubmitParams;
              let sendType =
                flowInstance.flowId === "LC0002"
                  ? "picture"
                  : flowInstance.flowId === "LC0003"
                  ? "check"
                  : "description";
              if (
                (flowInstance.flowId === "LC0002" &&
                  flowInstance.currentNodeId === 3) ||
                (flowInstance.flowId === "LC0003" &&
                  flowInstance.currentNodeId === 3) ||
                (flowInstance.flowId === "LC0004" &&
                  flowInstance.currentNodeId === 3)
              ) {
                let erpStatus =
                  v.$store.state.isCheckedSendErp === null
                    ? 0
                    : v.$store.state.isCheckedSendErp;
                if (sendType === "picture") {
                  if (erpStatus === 1) {
                    v.$axios.post(api.sendProductInfoToErp, {
                      productId: v.$store.state.createId,
                      sendType: sendType,
                    });
                  }
                }
                if (sendType !== "picture") {
                  v.$axios.post(api.sendProductInfoToErp, {
                    productId: v.$store.state.createId,
                    sendType: sendType,
                  });
                }
                // 数据推送 listing
                v.$axios.post(api.sendProductInfoToListing, {
                  productId: v.$store.state.createId,
                  sendType: sendType,
                });
              }
              /* if (flowInstance.flowId === 'LC0001' && flowInstance.currentNodeId === 6) {
             if (v.$store.state.sendSaleStatus) {
             // 选择了试卖或销售，则推送数据
             v.$axios.post(api.sendProductInfoToErp, {
             productId: v.$store.state.createId,
             sendType: 'baseInfo,variation,sku,quotation'
             });
             }

             if (v.$store.state.sendToListing === 1) {
             // 推送到listing
             v.$axios.post(api.sendProductInfoToListing, {
             productId: v.$store.state.createId,
             sendType: 'baseInfo'
             });
             }
             } */
              v.$emit("closeGetList");
              v.operating = false;
            } else {
              v.operating = false;
              v.$msg.error("提交失败");
            }
          })
          .catch(() => {
            v.btnLoadding = false;
          });
      }
    },
    receiverListsMt() {
      let v = this;
      if (v.productSubmitParams instanceof Array) {
        v.receiverLists = v.productSubmitParams[0].receiverList;
      } else {
        v.receiverLists = v.productSubmitParams.receiverList;
      }
    },
  },
  computed: {
    isShow() {
      let v = this;
      let flowInstance = v.productSubmitParams;
      if (
        (flowInstance.flowId === "LC0001" &&
          flowInstance.currentNodeId === 6) ||
        (flowInstance.flowId === "LC0002" &&
          flowInstance.currentNodeId === 3) ||
        (flowInstance.flowId === "LC0003" &&
          flowInstance.currentNodeId === 3) ||
        (flowInstance.flowId === "LC0004" && flowInstance.currentNodeId === 3)
      ) {
        return false;
      } else {
        return true;
      }
    },
    isInquiry() {
      let v = this;
      let flowInstance = v.productSubmitParams;
      if (flowInstance.flowId === "LC0001" && flowInstance.fromNodeId === 4) {
        v.getSupplierList();
        return true;
      } else {
        return false;
      }
    },
    productSubmit() {
      let v = this;
      if (v.productSubmitParams instanceof Array) {
        return v.productSubmitParams[0];
      } else {
        if (
          v.productSubmitParams.flowId === "LC0001" &&
          v.productSubmitParams.currentNodeId === 6
        ) {
          v.productSubmitParams.fromNodeName = "提示";
          v.productSubmitParams.currentNodeName =
            "是否提交流程并推送数据至ERP/listing";
        }
        return v.productSubmitParams;
      }
    },
  },
  components: {},
};
</script>

<style>
.clearMarginAuto .ivu-modal-wrap {
  overflow-y: hidden;
}

.co .ivu-select-item-selected,
.co .ivu-select-item-selected:hover {
  color: #495060;
  background-color: #ffffff;
}

.resetModalAss .ivu-modal-body {
  overflow-y: visible !important;
}
</style>
<style scoped></style>
