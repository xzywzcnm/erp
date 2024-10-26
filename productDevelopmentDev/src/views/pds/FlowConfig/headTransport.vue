<template>
  <div class="mainBox">
    <Card shadow class="card-self-style">
      <div class="list-page">
        <div>
          <Button @click="synchronize" :loading="loading">同步</Button>
        </div>
        <div class="table-main mt10">
          <div :class="['table-list',tableClass]">
            <Table :columns="columns1" :loading="loading" :data="data1" :height="tableHeight"></Table>
          </div>
          <div class="table-page">
            <div class="table-page-right">
              <Page :total="total" @on-change="changePage" show-total :page-size="pageSize" show-elevator :current="pageNum" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script>
import api from "@/api/api";
import CommonMixin from "@/components/mixin/commonMixin";
import table_highly_adaptive from '@/components/mixin/table_highly_adaptive';

export default {
  name: "headTransport",
  mixins: [CommonMixin, table_highly_adaptive],
  components: {},
  data () {
    return {
      loading1: false,
      totalPage: 0,
      total: 0,
      curPage: 1,
      pageNum: 1,
      pageSize: 10,
      columns1: [
        {
          title: "运输方式名称",
          key: "carriageModeName"
        },
        {
          title: "始发地",
          key: "fromCountryId"
        },
        {
          title: "目的仓库",
          key: "targetWarehouseId"
        },
        {
          title: "运费（CNY）",
          key: "freight"
        },
        {
          title: "计费类型",
          key: "chargeTypeCombination",
          render (h, params) {
            return h(
              "span",
              params.row.chargeType === "1" ? "kg" : params.row.chargeType === "2" ? "cmb" : ''
            );
          }
        }
      ],
      data1: [],
      loading: false
    };
  },
  created () {
    // document.title = "头程运输";
    this.getList();
  },
  methods: {
    changePage (page) {
      this.pageNum = page;
      this.getList();
    },
    changePageSize (val) {
      this.pageSize = +val;
      this.getList();
    },
    synchronize () {
      let v = this;
      v.loading1 = true;
      v.$axios
        .post(api.carriageModeSync)
        .then((res) => {
          v.loading1 = false;
          if (res.code === 0) {
            v.pageNum = 1;
            v.$msg.success("同步成功");
            v.getList();
          }
        })
        .catch(() => {
          v.loading1 = false;
        });
    },
    getList () {
      let v = this;
      v.loading = true;
      v.$axios
        .post(api.carriageModeList, {
          pageNum: this.pageNum,
          pageSize: this.pageSize
        })
        .then((res) => {
          v.loading = false;
          if (res.code === 0) {
            v.data1 = res.datas.list;
            v.total = res.datas.total;
          }
        })
        .catch(() => {
          v.loading = false;
        });
    }
  },
  computed: {}
};
</script>

<style scoped></style>
