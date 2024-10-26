<template>
  <div class="mainBox paneMain">
    <Card shadow class="card-self-style">
      <div class="list-page">
        <Form
          ref="searchCriteria"
          class="formSearch resetIvu"
          :model="searchCriteria"
          inline
          :label-width="80"
        >
          <dyt-filter :filter-row="1">
            <FormItem label="选款状态" prop="isReview">
              <dyt-select
                v-model="searchCriteria.isReview"
                @on-change="search()"
                :clearable="false"
              >
                <Option
                  v-for="item in reviewList"
                  :key="'reviewList' + item.value"
                  :value="item.value"
                  >{{ item.label }}</Option
                >
              </dyt-select>
            </FormItem>
            <FormItem label="供方货号" prop="suppliernNo">
              <dyt-input v-model.trim="searchCriteria.suppliernNo"></dyt-input>
            </FormItem>
            <FormItem label="供应商" prop="supplierId">
              <dyt-select v-model="searchCriteria.supplierId">
                <Option
                  v-for="item in supplyList"
                  :key="'supplyList' + item.supplierId"
                  :value="item.supplierId"
                  >{{ item.supplierName }}</Option
                >
              </dyt-select>
            </FormItem>
            <FormItem label="设计款号" prop="modelNo">
              <dyt-input v-model.trim="searchCriteria.modelNo"></dyt-input>
            </FormItem>
            <div slot="operation">
              <Button
                type="primary"
                @click="search()"
                icon="ios-search"
                class="mr10"
                >查询
              </Button>
              <Button @click="resetForm()" icon="md-refresh">重置</Button>
            </div>
          </dyt-filter>
        </Form>
        <div class="table-main mt10">
          <div :class="['table-list', tableClass]">
            <Table
              :columns="columns"
              :data="tableList"
              border
              :loading="tableLoading"
              highlight-row
              @on-selection-change="selectChange"
              :height="tableHeight"
            >
              <template slot-scope="{ row }" slot="contri">
                <div class="flexCenter" style="padding: 4px 0">
                  <large-picture
                    :url="handlePic(row.imgUrl)"
                    class="mr10"
                  ></large-picture>
                  <span>供方货号：{{ row.suppliernNo || "-" }}</span>
                </div>
              </template>
              <template slot-scope="{ row }" slot="isStock">
                <span>{{ row.isStock === 1 ? "否" : "有" }}</span>
              </template>
              <template slot-scope="{ row }" slot="createdTime">
                <span>{{
                  getDataToLocalTime(row.createdTime, "fulltime")
                }}</span>
              </template>
              <template slot-scope="{ row }" slot="updatedTime">
                <span>{{
                  getDataToLocalTime(row.updatedTime, "fulltime")
                }}</span>
              </template>
              <template slot-scope="{ row }" slot="action">
                <Button @click="detail(row)">操作</Button>
              </template>
            </Table>
          </div>
          <page-common
            :pageConfig="proPage"
            @ChangePage="ChangePage"
            @ChangePageSize="ChangePageSize"
          ></page-common>
        </div>
      </div>
    </Card>
    <style-detail
      :dialogObj="dialogObj"
      :isReview="searchCriteria.isReview"
      @fetch="search"
    ></style-detail>
  </div>
</template>
<script>
import api from "@/api/api.js";
import pageMixin from "@/components/mixin/page_mixin";
import largePicture from "@/components/largePicture";
import styleDetail from "./chooseStyle/styleDetail";
import { columns, reviewList } from "./chooseStyle/configFile.js";
import table_highly_adaptive from "@/components/mixin/table_highly_adaptive";
export default {
  name: "chooseStyle",
  mixins: [pageMixin, table_highly_adaptive],
  components: { largePicture, styleDetail },
  data() {
    return {
      searchCriteria: {
        status: "",
        suppliernNo: "",
        // supplierName: '',
        modelNo: "",
        supplierId: "",
        isReview: 0,
      },
      supplyList: [],
      reviewList: reviewList,
      columns: columns,
      dialogObj: {
        modelVisible: false,
        data: {},
      },
      // 待推款的意见
      opinion: "",
      // 待审样核价的意见
      reviewOpinion: "",
    };
  },
  created() {
    this.fetch(api.electionQuery, "post");
    this.getSupplierList(); //获取供应商
  },
  deactivated() {
    this.dialogObj.modelVisible = false;
  },
  computed: {
    securityUser() {
      if (this.$store.getters["authUserInfo"] && this.$store.getters["authUserInfo"].securityUser) {
        return this.$store.getters["authUserInfo"].securityUser;
      }
      return {}
    },
  },
  watch: {},
  methods: {
    // 重置查询条件
    resetForm() {
      this.$refs["searchCriteria"].resetFields();
    },
    getSupplierList() {
      let apiUrl =
        this.$store.state.ierpStatus === "1"
          ? api.getNewSupplierInfo
          : api.getSupplierInfo;
      this.$axios
        .post(apiUrl, {
          pageNum: 1,
          pageSize: 10000,
          auditStatus: 3, // 已审核
          businessDeptId: this.securityUser.businessDeptId,
          businessDeptIds: this.securityUser.businessDeptIds,
        })
        .then((res) => {
          if (res.code === 0) {
            this.supplyList = res.datas.list;
          } else {
            this.supplyList = [];
          }
        });
    },
    // 查看详情
    detail(row) {
      this.dialogObj.modelVisible = true;
      this.dialogObj.data = row;
    },
    // 批量通过/不通过
    mulPass(electionResult) {
      let list = this.columnList || [];
      if (!list.length) {
        this.$Message.error("请勾选款式");
        return;
      }
      let [temp, arr] = [{}, []];
      list.forEach((k) => {
        arr.push(k.electionId);
      });
      temp.electionIdList = arr;
      if (this.searchCriteria.status === 0) {
        this.mulStyle(electionResult, temp, list);
      }
      if (this.searchCriteria.status === 1) {
        this.mulPrice(electionResult, temp, list);
      }
    },
    // 批量选款
    mulStyle(electionResult, temp, list) {
      temp.electionResult = electionResult; //选款结果 0:选款通过，1:选款不通过
      this.$Modal.confirm({
        title: "操作提示",
        render: (h) => {
          return h("div", {}, [
            h(
              "div",
              `确定选款${electionResult === 1 ? "不" : ""}通过吗？数量：${
                list.length
              }`
            ),
            h(
              "div",
              {
                class: {
                  mt10: true,
                },
                style: {
                  display: "flex",
                },
              },
              [
                h(
                  "div",
                  {
                    style: {
                      width: "50px",
                    },
                  },
                  "意见："
                ),
                h("Input", {
                  props: {
                    value: this.opinion,
                    type: "textarea",
                  },
                  on: {
                    input: (val) => {
                      this.opinion = val;
                    },
                  },
                }),
              ]
            ),
            h(
              "div",
              {
                style: {
                  color: "#ff0f0f",
                  fontSize: "12px",
                  marginLeft: "50px",
                },
              },
              `该意见显示在供应商系统，供应商可随时查看更新的意见`
            ),
          ]);
        },
        loading: true,
        onOk: () => {
          // 意见
          temp.opinion = this.opinion;
          this.$axios
            .post(api.batchlEction, temp)
            .then((res) => {
              if (res.code === 0) {
                this.$Message.info("操作成功");
                this.search();
              }
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
      });
    },
    // 批量审样核价
    mulPrice(examineResult, temp, list) {
      temp.examineResult = examineResult; //审样核价结果 0:审样核价通过，1:审样核价不通过
      this.$Modal.confirm({
        title: "操作提示",
        render: (h) => {
          return h("div", {}, [
            h(
              "div",
              `确定审样核价${examineResult === 1 ? "不" : ""}通过吗？数量：${
                list.length
              }`
            ),
            h(
              "div",
              {
                class: {
                  mt10: true,
                },
                style: {
                  display: "flex",
                },
              },
              [
                h(
                  "div",
                  {
                    style: {
                      width: "50px",
                    },
                  },
                  "意见："
                ),
                h("Input", {
                  props: {
                    value: this.reviewOpinion,
                    type: "textarea",
                  },
                  on: {
                    input: (val) => {
                      this.reviewOpinion = val;
                    },
                  },
                }),
              ]
            ),
            h(
              "div",
              {
                style: {
                  color: "#ff0f0f",
                  fontSize: "12px",
                  marginLeft: "50px",
                },
              },
              `该意见显示在供应商系统，供应商可随时查看更新的意见`
            ),
          ]);
        },
        loading: true,
        onOk: () => {
          // 审样核价意见
          temp.reviewOpinion = this.reviewOpinion;
          this.$axios
            .post(api.batchlExamine, temp)
            .then((res) => {
              if (res.code === 0) {
                this.$Message.info("操作成功");
                this.search();
              }
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
      });
    },
    // 处理图片
    handlePic(url) {
      return url ? url.split(",")[0] : "";
    },
  },
};
</script>