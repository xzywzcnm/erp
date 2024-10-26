<template>
  <div>
    <Table
      :columns="operationColumns"
      :data="operationDate"
      highlight-row
    ></Table>
    <div class="table-page">
      <div class="table-page-right">
        <Page
          :total="total"
          @on-change="changePage"
          show-total
          :page-size="allListFormValidate.pageSize"
          show-elevator
          :current="allListFormValidate.pageNum"
          show-sizer
          @on-page-size-change="changePageSize"
          placement="top"
          :page-size-opts="pageArray"
        ></Page>
      </div>
    </div>
  </div>
</template>

<script>
import CommonMixin from "../../../components/mixin/commonMixin";
import api from "@/api/api";

export default {
  name: "commonOperationLog", // 操作日志
  mixins: [CommonMixin],
  components: {},
  data () {
    let v = this;
    return {
      total: 0,
      operationColumns: [
        {
          key: "logContent",
          title: "日志内容",
          align: "left"
        },
        {
          key: "operatingTime",
          title: "操作时间",
          align: "left",
          render (h, params) {
            return h(
              "div",
              {
                attrs: {
                  title: v.getDataToLocalTime(
                    params.row.operatingTime,
                    "fulltime"
                  )
                }
              },
              v.getDataToLocalTime(params.row.operatingTime, "fulltime")
            );
          }
        },
        {
          key: "operatorName",
          title: "操作人",
          align: "left"
        }
      ],
      allListFormValidate: {
        pageNum: 1,
        pageSize: 10,
        productId: "", // 产品id
        category: "CZRZ" // 新品开发需求类别(JBXX基本信息,DSX多属性,TPXX图片信息,XXMS详细描述,CZRZ操作日志,XJ询价,QY取样)
      },
      operationDate: []
    };
  },
  created () {
    // this.getList();
  },
  methods: {
    changePage (page) {
      let v = this;
      v.allListFormValidate.pageNum = page;
      v.getList();
    },
    changePageSize (val) {
      this.allListFormValidate.pageSize = +val;
      if (val !== undefined) {
        localStorage.setItem("pageSize", val);
      }
      this.getList();
    },
    getList () {
      let v = this;
      v.allListFormValidate.productId = v.$store.state.createId;
      if (localStorage.getItem("pageSize")) {
        v.allListFormValidate.pageSize = +localStorage.getItem("pageSize");
      }
      v.$axios
        .post(api.taskSelect, v.allListFormValidate)
        .then((res) => {
          if (res.code === 0) {
            if (res.datas.flowLogInfoPage.list) {
              v.operationDate = res.datas.flowLogInfoPage.list;
            } else {
              v.operationDate = [];
            }
            if (res.datas.flowLogInfoPage) {
              v.total = res.datas.flowLogInfoPage.total;
            } else {
              v.total = 0;
            }
          }
        })
        .catch(() => {
          /*  v.$msg.error('请求失败'); */
        });
    }
  }
};
</script>

<style scoped></style>
