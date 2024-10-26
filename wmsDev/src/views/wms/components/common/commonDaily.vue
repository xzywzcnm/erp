<template>
  <div class="commonDailyPage formDetail">
    <div style="padding: 10px 0">
      <h3 class="flexCenter">
        <span class="mr20">操作日志</span>
        <Checkbox
          v-model="showNotes"
          :true-value="1"
          :false-value="0"
          @on-change="showNoteFn"
        >显示备注</Checkbox>
      </h3>
    </div>
    <Row v-show="!(ymsMerchant || isHide)">
      <Col span="8">
        <Form
          onsubmit="return false;"
          ref="form"
          :model="form"
          :rules="ruleValidate"
          :disabled="!createLog"
          class="fmb10"
        >
          <Form-item prop="addNotes">
            <dyt-input placeholder="添加备注" v-model.trim="form.addNotes" />
          </Form-item>
        </Form>
      </Col>
      <Col span="4" class="ml20">
        <Button type="primary" v-once icon="md-create" v-if="createLog" @click="addMsg">备注</Button>
      </Col>
    </Row>
    <detailLog
      ref="detailLog"
      :from="from"
      :pickingId="params.pickingId"
      :showNotes="showNotes"
      :warehouseName="warehouseName"
    />
  </div>
</template>
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import detailLog from "@/views/wms/components/common/detailLog";

export default {
  props: [
    "operationLog",
    "identification",
    "from",
    "params",
    "falgType",
    "warehouseName",
    "isHide",
  ],
  mixins: [Mixin],
  components: {
    detailLog,
  },
  computed: {
    createLog() {
      let item = this.typeObj[this.from] || {};
      return this.getPermission(item.power || "");
    },
    ymsMerchant() {
      // 如果当前用户是云仓供应商隐藏相关的操作功能
      let erpConfig = this.$store.state.erpConfig;
      if (erpConfig) {
        if (erpConfig.allYmsMerchantIds && erpConfig.allYmsMerchantIds.length > 0) {
          if (erpConfig.allYmsMerchantIds.indexOf(erpConfig.merchant.merchantId) > -1) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
    },
  },
  data() {
    return {
      form: { addNotes: "" },
      showNotes: 1,
      ruleValidate: {
        addNotes: [
          { type: "string", max: 100, message: "超出输入限制长度", trigger: "blur" },
          { type: "string", max: 100, message: "超出输入限制长度", trigger: "change" },
        ],
      },
      userInfoMap: [],
      typeObj: {
        outStock: {
          api: "add_Note",
          // 其他出库新增备注权限
          power: "wmsPicking_createLog",
        },
        directStock: {
          api: "directAddNote",
          // 全托管出库新增备注权限
          power: "wmsDirectPicking_createLog",
        },
        lendStockOut: {
          api: "add_Note",
          // 借样出库新增备注权限
          power: "borrowSamplePicking_createLog",
        }
      },
    };
  },
  methods: {
    showNoteFn(bool) {
      this.$nextTick(() => {
        this.$refs.detailLog.On_searchOrderLogInit();
      });
    },
    // 入库单详情新增日志
    inStock() {
      var v = this;
      var obj = {
        relatedBusinessNo: v.params.inWareOrderId, // 相关业务编号
        receiptNo: v.params.receiptNo, // 入库单ID
        logContentDesc: v.form.addNotes, // 输入的备注信息
        logTypeDesc: "1",
      };
      this.$Spin.show();
      v.axios.post(api.add_Notes, obj).then((res) => {
        this.$Spin.hide();
        if (res.data.code === 0) {
          v.form.addNotes = ""; // 输入框置空
          v.$Message.success("添加备注成功！");
          v.$refs.detailLog.On_searchOrderLogInit();
          this.$emit("addSuccessBack");
        } else {
          v.$Message.warning("添加备注失败！");
        }
      }).catch(() => {
        this.$Spin.hide();
      });
    },
    // 出库详情新增日志
    directStock() {
      let v = this;
      let obj = {
        pickingId: this.params.pickingId,
        relatedBusinessNo: this.params.relatedBusinessNo,
        logContentDesc: this.form.addNotes, // 输入的备注信息
      };
      let item = this.typeObj[this.from] || {};
      this.$Spin.show();
      this.axios.post(api[item.api], obj).then((res) => {
        this.$Spin.hide();
        if (res.data.code === 0) {
          this.$Message.success("新增成功");
          this.form.addNotes = "";
          v.$refs.detailLog.On_searchOrderLogInit();
          this.$emit("addSuccessBack");
        } else {
          this.$Message.warning({
            content: "新增失败",
            duration: 3,
          });
        }
      }).catch(() => {
        this.$Spin.hide();
      });
    },
    outStock () {
      this.directStock();
    },
    // 商品加工新增备注
    productProcess() {
      let v = this;
      let obj = {
        logContentDesc: this.form.addNotes,
        workingNo: this.params.workingNo, // this.detailObj.workingNo,
        relatedBusinessNo: this.params.workingNo, // this.detailObj.workingNo
      };
      this.$Spin.show();
      this.axios.post(api.createWorkingLog, obj).then((res) => {
        this.$Spin.hide();
        if (res.data.code === 0) {
          this.$Message.success("新增成功");
          v.$refs.detailLog.On_searchOrderLogInit();
          this.$emit("addSuccessBack");
        } else {
          this.$Message.warning({
            content: "新增失败",
            duration: 3,
          });
        }
      })
        .catch(() => {
          this.$Spin.hide();
        });
    },
    // 借样出库单新增备注日志
    lendStockOut () {
      this.directStock();
    },
    // 手动添加备注
    addMsg() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (!this.form.addNotes) {
            this.$Message.warning({
              content: "备注不能为空",
              duration: 4,
            });
            return;
          }
          if (this.$common.isEmpty(this.from) || this.$common.isEmpty(this[this.from])) return;
          this[this.from]();
        }
      });
    },
  },
};
</script>
<style lang="less">
// .commonDailyPage {
// }
</style>
