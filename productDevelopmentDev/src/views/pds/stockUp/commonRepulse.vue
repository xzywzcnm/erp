<template>
  <div class="co">
    <Modal
      v-model="operating"
      class="clearMarginAuto"
      @on-visible-change="operaVisibleChange"
      title="打回"
    >
      <p slot="header" @mousedown="moveMt" class="moveHead">
        <span>打回</span>
      </p>
      <Form
        ref="operatingFrom"
        :model="operatingFrom"
        :rules="operatingRuleValidate"
      >
        <FormItem label="打回至" prop="sendType">
          <dyt-select
            v-model="operatingFrom.sendType"
            style="width: 300px"
            @on-change="getNext(operatingFrom.sendType)"
          >
            <Option value="1">打回上级</Option>
            <Option
              value="2"
              v-show="
                $store.state.flowInstance &&
                $store.state.flowInstance.length === 1
              "
              >打回发起人</Option
            >
          </dyt-select>
        </FormItem>
        <FormItem label="备注">
          <Input
            style="width: 300px"
            v-model="operatingFrom.sendRemark"
            type="textarea"
          />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="operating = false">取消</Button>
        <Button type="primary" @click="operatingBtn" :loading="loading"
          >确定</Button
        >
      </div>
    </Modal>
  </div>
</template>

<script>
import CommonMixin from "../../../components/mixin/commonMixin";
import api from "@/api/api";

export default {
  name: "commonRepulse", // 打回
  mixins: [CommonMixin],
  props: ["productSubmitParams"],
  data () {
    // let v = this;
    return {
      operating: false,
      loading: false,
      operatingFrom: {
        sendType: "",
        sendRemark: ""
      },
      operatingRuleValidate: {
        sendType: [
          {
            required: true,
            message: "请选择打回哪里",
            trigger: "change"
          }
        ]
      }
    };
  },
  methods: {
    getNext (val) {
      let v = this;
      let data = {
        fromNodeId: v.productSubmitParams.fromNodeId,
        flowInstanceId: v.productSubmitParams.flowInstanceId, // 流程实例ID，必需
        sendType: val // 流程发送类别：0提交，1打回上级，2打回发起人，3转交，4作废
      };
      v.$axios
        .post(api.getNextTodoInfo, data)
        .then((res) => {
          if (res.code === 0) {
            v.productSubmitParams = res.datas;
          } else {
            v.$msg.error({
              content: "找不到流程接收人，请联系管理员进行流程配置",
              duration: 5
            });
          }
        })
        .catch(() => {
          v.$msg.error("请求失败");
        });
    },
    operaVisibleChange (n) {
      if (n) {
        this.operatingFrom.sendType = "1";
        this.operatingFrom.sendRemark = "";
      }
    },
    operatingBtn () {
      let v = this;
      v.$refs.operatingFrom.validate((vaild) => {
        if (vaild) {
          var params = v.productSubmitParams;
          params.productId = v.$store.state.createId;
          params.sendType = v.operatingFrom.sendType; // 0提交，1打回上级，2打回发起人，3转交，4作废
          params.sendRemark = v.operatingFrom.sendRemark;
          v.loading = true;
          v.$axios
            .post(api.productSubmit, params)
            .then((res) => {
              v.operating = false;
              v.loading = false;
              v.$emit("closeGetList");
              if (res.code === 0 && res.datas) {
                v.$msg.success("打回成功");
              } else {
                v.$msg.error("打回失败");
              }
            })
            .catch(() => {
              v.loading = false;
            });
        }
      });
    }
  },
  components: {}
};
</script>

<style>
.co .ivu-form-item-error-tip {
  left: 90px;
}

.co .ivu-modal-body {
  overflow-y: visible;
}
</style>
<style scoped></style>
