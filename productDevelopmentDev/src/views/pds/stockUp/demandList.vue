<template>
  <div class="mainBox">
    <Card>
      <p slot="title">基本信息</p>
      <demand-content :isShowBtn="true" :sortChoseDate="sortChoseDate" :stepsDate="stepsDate" @closeGetList="closeGetList">
      </demand-content>
    </Card>
  </div>
</template>
<script>
import demandContent from "./demandContent";
import api from "@/api/api";
import commonMixin from "@/components/mixin/commonMixin";

export default {
  name: "myList", // 新品开发需求
  data () {
    // let v = this;
    return {
      stepsDate: [
        {
          title: "提交需求",
          finish: "do",
        },
        {
          title: "询价",
        },
        {
          title: "生成SKU",
        },
        {
          title: [
            {
              tit: "<p>" + "处理图片" + "</p>",
            },
            {
              tit: "<p>" + "取样" + "</p>",
            },
            {
              tit: "<p>" + "编辑描述" + "</p>",
            },
          ],
          style: { "margin-top": "-30px" },
        },
        {
          title: "确认销售",
        },
      ],
      sortChoseDate: [
        {
          tit: "基本信息",
          id: 0,
          isSave: true,
          selected: true,
        },
        {
          tit: "多属性",
          id: 1,
          isSave: true,
          selected: false,
        },
        {
          tit: "图片信息",
          id: 2,
          isSave: true,
          selected: false,
        },
        {
          tit: "详细描述",
          id: 3,
          isSave: true,
          selected: false,
        },
      ],
    };
  },
  mixins: [commonMixin],
  created () {
    let v = this;
    // window.document.title = "新品开发";
    v.$store.commit("curNodeControl", 999);
    v.$store.commit("createId", "");
    v.$store.commit("curNodeId", 0);
    v.$axios
      .get(api.createId)
      .then((res) => {
        if (res.code === 0) {
          v.$store.commit("createId", res.datas);
        } else {
          v.$message.info('未获取到createId，请刷新或重置');
        }
      })
      .catch(() => {
        v.$message.info('未获取到createId，请刷新或重置');
      });
  },
  destroyed () {
    this.$store.commit("curNodeControl", null);
  },
  methods: {
    closeGetList () {
      let v = this;
      v.$Modal.confirm({
        render: (h) => {
          return h("div", "已完成提交!是否跳转到已办查看");
        },
        onOk: () => {
          v.$router.push('/haveDone');
        },
        onCancel: () => {
          window.location.reload();
        },
      });
      /*  setTimeout(() => {
       window.location.reload();
       }, 1000); */
    },
  },
  components: {
    demandContent,
  },
};
</script>
