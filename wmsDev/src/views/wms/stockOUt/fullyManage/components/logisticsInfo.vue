<template>
  <div class="logisticsInfoPage">
    <Form
      ref="formValidate"
      :model="logisticInfo"
      :rules="ruleValidate"
      :label-width="110"
      class="formDetail"
      inline
      :class="{ fmb20: textEdit, fmb0: !textEdit }"
    >
      <div class="formWidth180">
        <FormItem label="快递公司：" prop="expressCompany">
          <dyt-select
            v-model="logisticInfo.expressCompany"
            @on-change="expressCompanyChange"
            v-if="textEdit"
          >
            <Option
              v-for="(item, index) in expressCompanyList"
              :value="item.logisticsCode"
              :label="item.logisticsName"
              :key="index"
            ></Option>
          </dyt-select>
          <div v-else>
            {{ expressCompanyName }}
          </div>
        </FormItem>
        <FormItem label="快递业务：" prop="expressBusiness">
          <Input
            v-model.trim="logisticInfo.expressBusiness"
            maxlength="20"
            show-word-limit
            v-if="textEdit"
          ></Input>
          <div v-else>
            {{ logisticInfo.expressBusiness }}
          </div>
        </FormItem>
        <FormItem label="快递单号：" prop="expressDeliveryNumber">
          <Input
            v-model.trim="logisticInfo.expressDeliveryNumber"
            maxlength="50"
            show-word-limit
            v-if="textEdit"
          ></Input>
          <div v-else>
            {{ logisticInfo.expressDeliveryNumber }}
          </div>
        </FormItem>
        <FormItem label="预约时间：" prop="reserveTime">
          <div class="dispalyFlex alignCenter">
            <DatePicker
              type="datetime"
              format="yyyy-MM-dd HH:mm:ss"
              placeholder="请选择"
              :options="options3"
              @on-change="timeChange"
              :value="logisticInfo.reserveTime"
              v-if="textEdit"
              style="flex: 1; overflow: hidden"
              transfer
            ></DatePicker>
            <!-- @on-open-change="timeOpen"
              :disabled-hours="disabledHours"
              :disabled-minutes="disabledMinutes" -->
            <div v-else>{{ logisticInfo.reserveTime }}</div>
            <span
              v-if="appointmentTxt"
              style="color: red; margin-left: 6px"
              >{{ appointmentTxt }}</span
            >
          </div>
        </FormItem>
        <FormItem label="" :label-width="10" v-if="textEdit">
          <span class="linkText cursorClick" @click="pasteFun"
            >粘贴快递复制字串解析</span
          >
        </FormItem>
      </div>
    </Form>
  </div>
</template>

<script>
import { arrayToObj } from "./fileData";
import permission_mixin from "@/components/mixin/permission_mixin";
export default {
  name: "logisticsInfo",
  mixins: [permission_mixin],
  data() {
    return {
      expressCompanyList: {},
      logisticInfo: {
        expressCompany: "",
        expressBusiness: "",
        expressDeliveryNumber: "",
        reserveTime: "",
      },
      ruleValidate: {
        expressCompany: [
          {
            required: true,
            message: "请选择",
            trigger: "change",
          },
        ],
        expressDeliveryNumber: [
          {
            required: true,
            message: "请输入",
            trigger: "blur",
          },
        ],
        reserveTime: [
          {
            required: true,
            message: "请选择",
            trigger: "change",
          },
        ],
      },
      options3: {
        disabledDate(date) {
          return date && date.valueOf() < Date.now() - 86400000;
        },
      },
      deLogisticInfo: {},
      // disabledHours: [],
      // disabledMinutes: [],
    };
  },
  props: {
    data: {
      type: Object,
      default() {
        return {};
      },
    },
    isEdit: {
      type: String,
      default: "",
    },
  },
  watch: {
    data: {
      handler(val) {
        if (!val.pickingId) return;
        this.setData();
      },
      deep: true,
      immediate: true,
    },
    isChange: {
      handler(val) {
        this.$emit("logisticInfoChange", val);
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    isChange() {
      return !(
        JSON.stringify(this.logisticInfo) ===
        JSON.stringify(this.deLogisticInfo)
      );
    },
    // 编辑进来的
    savePower() {
      return (
        ["edit"].includes(this.isEdit) &&
        this.getPermission("fullTrusteeshipPicking_update")
      );
    },
    // 按钮进来的
    buttonEdit() {
      return ["button"].includes(this.isEdit);
    },
    // 编辑或上传文件可以更改
    textEdit() {
      let status = ["2"].includes(this.data.pickingNewStatus);
      return this.savePower || (this.buttonEdit && status);
    },
    // 今天、明天、后天
    appointmentTxt () {
      if (this.$common.isEmpty(this.logisticInfo.reserveTime)) return '';
      const dateDay = this.$common.dayjs(new Date(this.logisticInfo.reserveTime)).format('YYYY-MM-DD');
      const nowDay = this.$common.dayjs().format('YYYY-MM-DD');
      if (nowDay == dateDay) return '今天';
      if (this.$common.dayjs(nowDay).add(1, 'day').isSame(dateDay, 'day')) return '明天';
      if (this.$common.dayjs(nowDay).add(2, 'day').isSame(dateDay, 'day')) return '后天';
      return '';
    },
    // 快递公司名称
    expressCompanyName () {
      if (this.$common.isEmpty(this.expressCompanyList) || this.$common.isEmpty(this.logisticInfo.expressCompany)) return '';
      if (this.$common.isEmpty(this.expressCompanyList[this.logisticInfo.expressCompany])) {
        const logisticsInfo = Object.values(this.expressCompanyList).find(item => {
          return item.logisticsId === Number(this.logisticInfo.expressCompany);
        })
        if (this.$common.isEmpty(logisticsInfo)) return '';
        return logisticsInfo.logisticsName;
      }
      return this.expressCompanyList[this.logisticInfo.expressCompany].logisticsName;
    }
  },
  created() {
    this.getLogistics();
  },
  methods: {
    setData() {
      Object.keys(this.logisticInfo).forEach((key) => {
        this.logisticInfo[key] = this.data[key] || "";
      });
      this.deLogisticInfo = this.$common.copy(this.logisticInfo);
    },
    // 获取快递公司
    getLogistics() {
      this.$store.dispatch("getLogisticsList").then((list) => {
        this.expressCompanyList = arrayToObj(list, "logisticsCode");
      });
    },
    expressCompanyChange(e) {
      !e && (this.logisticInfo.expressCompany = "");
    },
    timeChange(e) {
      this.logisticInfo.reserveTime = e;
    },
    handleForm() {
      return new Promise((resolve) => {
        this.$refs["formValidate"].validate((valid) => {
          if (!valid) {
            resolve({ valid: false });
            return;
          }
          resolve({ valid: true, data: this.logisticInfo });
        });
      });
    },
    // 粘贴内容
    async pasteFun() {
      const clipboardObj = navigator.clipboard;
      if (!clipboardObj) {
        this.$Message.error(
          "浏览器不支持异步 Clipboard API 或 只有 HTTPS 协议的页面才能使用这个 API!"
        );
        return;
      }
      try {
        const content = await clipboardObj.readText();
        this.handleLogisInfo(content);
      } catch (error) {
        this.$Message.error("无法读取剪贴板内容!");
        console.error("Failed to read clipboard content: ", error);
      }
    },
    handleLogisInfo(content) {
      if (!content) {
        this.$Message.error("剪贴板内容为空!");
        return;
      }
      content = content.replace(",", "，");
      let list = content.split("，");
      this.logisticInfo.expressBusiness = list[0];
      this.logisticInfo.expressDeliveryNumber = list[1];
      let logisItem = null;
      if (list[0]) {
        Object.values(this.expressCompanyList).forEach((k) => {
          let contain = list[0].indexOf(k.logisticsName) >= 0;
          let beContain = k.logisticsName.indexOf(list[0]) >= 0;
          if (contain || beContain) logisItem = k;
        });
      }
      this.logisticInfo.expressCompany = logisItem
        ? logisItem.logisticsCode
        : "QT";
    },
    // timeOpen(e) {
    //   if (!e) return;
    //   let now = new Date();
    //   let hour = now.getHours();
    //   let minute = now.getMinutes();
    //   let [hourList, minutesList] = [[], []];
    //   for (let i = 0; i < hour; i++) {
    //     hourList.push(i);
    //   }
    //   for (let i = 0; i < minute; i++) {
    //     minutesList.push(i);
    //   }
    //   this.disabledHours = hourList;
    //   this.disabledMinutes = minutesList;
    // },
  },
};
</script>

<style lang="less">
.logisticsInfoPage {
  .fmb20 .ivu-form-item {
    margin-bottom: 20px !important;
  }
  .formWidth180 .ivu-form-item-content {
    width: 180px;
  }
}
</style>
