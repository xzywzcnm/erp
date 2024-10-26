<template>
  <div>
    <Modal
      v-model="isVisible"
      :title="title"
      :width="500"
      :mask-closable="false"
      class="commonFormModal formDetail"
    >
      <div class="formWidth240">
        <Form
          ref="formValidate"
          :rules="ruleValidate"
          :model="formValidate"
          :label-width="110"
        >
          <Form-item label="" :label-width="36" v-if="paramsList.includes('tips')">
            <div style="color: #808695">提示：导出已发货的出库单数据</div>
          </Form-item>
          <!-- :rules="{ required: true, message: '请选择', trigger: 'change' }" -->
          <template v-if="paramsList.includes('time')">
            <Form-item label="发货日期：" prop="time" key="time">
              <DatePicker
                type="date"
                transfer
                placeholder="选择日期"
                :value="formValidate.time"
                format="yyyy-MM-dd"
                :options="options"
                @on-change="timeChange"
              >
              </DatePicker>
            </Form-item>
          </template>
          <template v-if="paramsList.includes('expressCompanys')">
            <FormItem label="快递公司：" prop="expressCompanys" key="expressCompanys">
              <dyt-select
                v-model="formValidate.expressCompanys"
                :multiple="true"
                :max-tag-count="1"
              >
                <Option
                  v-for="(item, index) in expressCompanyList"
                  :value="item.logisticsCode"
                  :label="item.logisticsName"
                  :key="index"
                ></Option>
              </dyt-select>
            </FormItem>
          </template>
          <template
            v-if="
              paramsList.includes('createEndTime') &&
              paramsList.includes('createStartTime')
            "
          >
            <Form-item label="质检时间：" prop="createTime" key="createTime">
              <DatePicker
                type="daterange"
                transfer
                placeholder="选择日期"
                :value="formValidate.createTime"
                @on-change="createTimeChange"
                :options="options"
                format="yyyy-MM-dd"
              >
              </DatePicker>
            </Form-item>
          </template>
        </Form>
      </div>
      <div slot="footer">
        <Button type="primary" @click="handleForm" :loading="loading">确定</Button>
        <Button @click="isVisible = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
export default {
  name: "commonForm",
  props: {
    dialogVisible: {
      type: Boolean,
      default() {
        return false;
      },
    },
    paramsList: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {
      title: "查看",
      isVisible: false,
      loading: false,
      formValidate: {
        time: "",
        expressCompanys: [],
        createStartTime: "",
        createEndTime: "",
        createTime: [],
      },
      ruleValidate: {
        time: [
          {
            required: true,
            message: "请选择",
            trigger: "change",
          },
        ],
        createTime: [
          {
            type: "array",
            required: true,
            len: 2,
            message: "请选择",
            fields: {
              0: { type: "string", required: true },
              1: { type: "string", required: true },
            },
          },
        ],
      },
      expressCompanyList: [],
      options: {
        disabledDate(date) {
          return date && date.valueOf() > Date.now();
        },
      },
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
      this.isVisible = true;
      this.$nextTick(() => {
        this.$refs.formValidate.resetFields();

        this.$nextTick(() => {
          let paramsList = this.paramsList;
          let dayJs = this.$common.dayjs();
          // 初始化为今天
          if (paramsList.includes("time")) {
            this.formValidate.time = dayJs.format("YYYY-MM-DD");
          }
          if (paramsList.includes("expressCompanys")) {
            this.getLogistics();
          }
          // 开始日期默认为：当月1日，结束日期默认为：当日;
          if (
            paramsList.includes("createEndTime") &&
            paramsList.includes("createStartTime")
          ) {
            const startT = dayJs.startOf("month").format("YYYY-MM-DD");
            const endT = dayJs.format("YYYY-MM-DD");
            this.formValidate.createStartTime = startT;
            this.formValidate.createEndTime = endT;
            this.formValidate.createTime = [startT, endT];
          }
        });
      });
    },
    // 获取快递公司
    getLogistics() {
      this.$store.dispatch("getLogisticsList").then((list) => {
        this.expressCompanyList = list;
      });
    },
    timeChange(e) {
      this.formValidate.time = e;
    },
    createTimeChange(e) {
      this.formValidate.createStartTime = e[0] || "";
      this.formValidate.createEndTime = e[1] || "";
      this.formValidate.createTime = e[0] ? e : [];
    },
    handleForm() {
      this.$refs["formValidate"].validate((valid) => {
        if (!valid) return;
        let temp = {};
        Object.keys(this.formValidate).forEach((key) => {
          this.paramsList.includes(key) && (temp[key] = this.formValidate[key]);
        });
        this.loading = true;
        this.$emit("commonReturn", {
          data: temp,
          fun: () => {
            this.loading = false;
            this.isVisible = false;
          },
        });
      });
    },
  },
};
</script>

<style lang="less">
.commonFormModal {
}
</style>
