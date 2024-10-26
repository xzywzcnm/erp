<template>
  <Modal
    v-model="operating"
    class="co clearMarginAuto"
    @on-visible-change="operatingFromTran"
    title="转交"
  >
    <p slot="header" @mousedown="moveMt" class="moveHead">
      <span>转交</span>
    </p>
    <Form ref="operatingFrom" :model="operatingFrom" :rules="operatingRlues">
      <FormItem label="转交" prop="receiverId">
        <dyt-select v-model="receiverIdVal" style="width: 300px" filterable>
          <Option
            v-for="(item, index) in productSubmitParams.receiverList"
            :key="index"
            :value="item.userId"
            >{{ item.userName }}</Option
          >
        </dyt-select>
        <!-- <Input style="width: 300px;" v-model="operatingFrom.receiverId"/>-->
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="text" @click="operating = false">取消</Button>
      <Button type="primary" @click="operatingBtn" :loading="loading"
        >确定</Button
      >
    </div>
  </Modal>
</template>

<script>
import CommonMixin from "../../../components/mixin/commonMixin";
import api from "@/api/api";

export default {
  name: "commonTransfer", // 转交
  mixins: [CommonMixin],
  props: ["productSubmitParams"],
  data () {
    let v = this;
    return {
      operating: false,
      loading: false,
      operatingFrom: {},
      receiverIdVal: "",
      operatingRlues: {
        receiverId: {
          validator: v.validateReceive,
          trigger: "change"
        }
      }
    };
  },
  methods: {
    operatingFromTran (n) {
      if (n) {
        this.receiverIdVal = this.productSubmitParams.receiverList[0].userId;
      }
    },
    validateReceive (rule, value, callback) {
      let v = this;
      if (v.receiverIdVal === "") {
        callback(new Error("转交人不能为空"));
      } else {
        callback();
      }
    },
    operatingBtn () {
      let v = this;
      v.$refs.operatingFrom.validate((valid) => {
        if (valid) {
          var params = v.productSubmitParams;
          params.productId = v.$store.state.createId;
          params.sendType = 3; // 0提交，1打回上级，2打回发起人，3转交，4作废
          params.receiverId = v.receiverIdVal;
          v.loading = true;
          v.$axios
            .post(api.productSubmit, params)
            .then((res) => {
              v.loading = false;
              if (res.code === 0) {
                v.operating = false;
                v.$msg.success("转交成功");
                v.$emit("closeGetList");
              }
            })
            .catch(() => {
              v.loading = false;
            });
        }
      });
    }
  }
};
</script>

<style scoped></style>
