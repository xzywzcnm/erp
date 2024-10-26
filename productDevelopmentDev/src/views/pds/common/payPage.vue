<template>
  <div class="payPage">
    <div v-if="value === '1' || value === '2'">
      <h3 class="tip1">此功能为收费功能</h3>
      <p class="tip2">新品开发系统 收费标准</p>
      <Table :columns="columns" :data="data"></Table>
      <div
        style="
          width: 80px;
          margin: 0 auto;
          margin-top: 30px;
          margin-bottom: 30px;
        "
      >
        <Button type="primary" @click="submit">{{ applicationType }}</Button>
      </div>
      <Alert type="success">
        <h4>功能简介：</h4>
        <template slot="desc">
          <h6>
            1、以工作流形式完成新品开发，员工能清晰的看到自己将要处理的任务和已完成的任务，实时掌握新品开发速度
          </h6>
          <h6>2、商户自由配置新品开发流程及相应流程的操作角色</h6>
          <h6>3、支持多平台一键采集竞品信息，参考竞品描述和图片，可快速试卖</h6>
          <h6>4、根据图片一键进入1688搜索相应商品，快速开发</h6>
          <h6>5、可快速对样品进行1688下单，全流程管理样品采购单</h6>
        </template>
      </Alert>
    </div>
    <div
      v-if="value === '3'"
      style="
        height: 300px;
        display: flex;
        justify-content: center;
        align-items: center;
      "
    >
      <div>
        <div style="text-align: center; font-weight: 800; font-size: 16px">
          您存在未支付账单，请先支付账单后再使用
        </div>
        <div style="width: 220px; margin: 0 auto; padding-top: 40px">
          <Button
            type="primary"
            style="margin-right: 50px; vertical-align: middle"
            @click="gotoPay"
            >去支付</Button
          >
          <Button type="success" @click="paid" :loading="loading"
            >我已支付</Button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import api from "@/api/api";
import { Message } from "view-design";

export default {
  props: ["moduleName", "value", "suiteId", "gotoUrl"],
  computed: {
    applicationType () {
      return this.value === "1" ? "购买" : this.value === "2" ? "申请试用" : "";
    }
  },
  mounted () {
    this.$nextTick(() => {
      let node1 = document.querySelector(".payPage");
      node1.parentNode.nextSibling.style.display = "none";
    });
  },
  data () {
    return {
      modal: true,
      columns: [
        {
          title: "项目",
          width: 130,
          key: "project",
          render: (h) => {
            return h("div", "新品开发");
          }
        },
        {
          title: "试用期",
          width: 130,
          key: "probation",
          render: (h) => {
            return h("div", "60天");
          }
        },
        {
          title: "收费模式",
          key: "chargingMode",
          render: (h) => {
            return h("div", [
              h("p", {}, [
                h("span", "月基础使用费( "),
                h("span", { style: { color: "#19be6b" } }, "150个SPU"),
                h("span", " )")
              ]),
              h("p", "+"),
              h("p", [
                h("span", "超出部分收费( "),
                h("span", { style: { color: "#19be6b" } }, "每个SPU收费1元"),
                h("span", " )")
              ])
            ]);
          }
        },
        {
          title: "试用结束后收费标准",
          key: "charges",
          render: (h) => {
            return h("div", [
              h("p", [
                h(
                  "span",
                  {
                    style: {
                      color: "#ed4014",
                      fontSize: "14px",
                      fontWeight: "800"
                    }
                  },
                  "199"
                ),
                h("span", "(元)/月"),
                h(
                  "span",
                  {
                    style: {
                      color: "#ed4014",
                      fontSize: "14px",
                      fontWeight: "800"
                    }
                  },
                  "150个SPU"
                )
              ]),
              h("p", "+"),
              h("p", [
                h(
                  "span",
                  {
                    style: {
                      color: "#ed4014",
                      fontSize: "14px",
                      fontWeight: "800"
                    }
                  },
                  "1"
                ),
                h("span", "(元)/SPU"),
                h("span", "超出部分")
              ])
            ]);
          }
        }
      ],
      data: [{}]
    };
  },
  created () {},
  methods: {
    submit () {
      if (this.value === "2") {
        axios
          .get(
            api.buyer +
              "?flag=2" +
              "&moduleName=" +
              this.moduleName +
              "&suiteId=" +
              this.suiteId
          )
          .then((response) => {
            if (response.code === 0) {
              Message.success("操作成功,现在可以开始试用该产品了");
              this.$Modal.remove();
            }
          });
      } else if (this.value === "1") {
        axios
          .get(
            api.buyer +
              "?flag=1" +
              "&moduleName=" +
              this.moduleName +
              "&suiteId=" +
              this.suiteId
          )
          .then((response) => {
            if (response.code === 0) {
              Message.success("购买成功");
              this.$Modal.remove();
            }
          });
      }
    },
    gotoPay () {
      this.gotoUrl ? window.open(this.gotoUrl, "_blank") : "";
    },
    paid () {
      this.loading = true;
      axios
        .get(api.refreshModule + "?moduleName=" + this.moduleName)
        .then((res) => {
          this.loading = false;
          if (res.code === 0) {
            this.$Modal.remove();
          }
        });
    }
  }
};
</script>

<style scoped>
.tip1 {
  margin: 0 auto;
  width: 150px;
  font-size: 14px;
  font-weight: 600;
  padding-bottom: 20px;
}

.tip2 {
  margin: 0 auto;
  width: 200px;
  font-size: 14px;
  font-weight: 600;
}
</style>
