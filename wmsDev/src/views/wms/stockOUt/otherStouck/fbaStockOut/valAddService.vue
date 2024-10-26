<template>
  <div>
    <div class="flexCenter mb10">
      <Button type="primary" size="small" @click="addItems" v-if="editable" class="mr30">添加</Button>
      <span>提示：发货人在发货后3天内，可修改增值服务数据</span>
    </div>
    <div class="mb10">海外仓装车箱数：{{ valAddServiceData.overseasBoxesNumber || 0 }}</div>
    <Table border :columns="valAddColumns" :data="tableList"></Table>
    <!-- 增值服务添加 -->
    <addValAddService :modelVisible.sync="valAddServiceInfo.visible" :list="completeList"
      :valAddServiceData="valAddServiceData" @addSuccess="addSuccess" />
  </div>
</template>
<script>
import api from "@/api/api";
import addValAddService from "./addValAddService";
import tableImg_mixin from "@/components/mixin/tableImg_mixin";
export default {
  name: "valAddService",
  components: {
    addValAddService,
  },
  mixins: [tableImg_mixin],
  props: {
    valAddServiceData: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      valAddServiceInfo: {
        visible: false,
      },
    };
  },
  computed: {
    completeList() {
      let list = this.$common.copy(this.valAddServiceData.fbaPickingDetailList || []).map(k => {
        k.vacuumizeNumber = k.vacuumizeNumber || 0;
        k.qualityNumber = k.qualityNumber || 0;
        return k;
      });
      return list;
    },
    tableList() {
      return this.completeList.filter(k => {
        return k.vacuumizeNumber > 0 || k.qualityNumber > 0;
      });
    },
    editable() {
      let userFlag = false;
      let userInfo = this.$store.state.userInfo || {};
      let valAddServiceData = this.valAddServiceData;
      // 发货人为空，可以编辑
      if (!valAddServiceData.deliverUser || (userInfo.userId === valAddServiceData.deliverUser)) {
        userFlag = true;
      }
      let timeFlag = this.isDateWithinThreeDays(valAddServiceData.deliverFinishTime);
      return userFlag && timeFlag;
    },
    valAddColumns() {
      let isEdit = [];
      if (this.editable) {
        isEdit.push({
          title: "操作",
          width: 120,
          align: "center",
          render: (h, params) => {
            return h("Button", {
              props: {
                type: "error",
                size: "small",
              },
              on: {
                click: () => {
                  this.delProduct(params.index);
                },
              },
            }, '删除');
          },
        })
      }
      return [
        {
          title: "LAPA SKU",
          align: "center",
          minWidth: 120,
          key: "goodsSku",
        },
        {
          title: "图片",
          width: 100,
          align: "center",
          render: (h, params) => {
            return this.tableImg(h, params.row.goodsUrl);
          },
        },
        {
          title: "商品中文描述",
          align: "center",
          minWidth: 150,
          key: "goodsCnDesc",
        },
        {
          title: '规格',
          key: 'goodsAttributes',
          align: 'center',
          minWidth: 100,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.goodsAttributes)) return h('span', {}, '');
            return h('span', {
              style: {
                color: "#377d22"
              }
            }, row.goodsAttributes);
          },
        },
        {
          title: "订单数量",
          align: "center",
          width: 120,
          key: 'expectedNumber',
        },
        {
          title: "抽真空数量",
          align: "center",
          width: 120,
          key: "vacuumizeNumber",
        },
        {
          title: "质检数量",
          align: "center",
          width: 120,
          key: "qualityNumber",
        },
        ...isEdit,
      ]
    },
  },
  methods: {
    isDateWithinThreeDays(dateStr) {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const givenDate = new Date(dateStr);
      return givenDate >= threeDaysAgo;
    },
    addItems() {
      this.valAddServiceInfo.visible = true;
    },
    addSuccess() {
      this.$emit('searchData');
    },
    delProduct(index) {
      this.$Modal.confirm({
        title: '提示',
        content: '<p>确认进行删除操作？</p>',
        onOk: () => {
          let valAddServiceData = this.valAddServiceData;
          let row = this.tableList[index];
          let temp = {
            pickingDetailId: row.pickingDetailId,
            vacuumizeNumber: 0,
            qualityNumber: 0,
          }
          let list = [temp];
          this.submitLoading = true;
          this.axios.put(api.updateValueAddedService + valAddServiceData.pickingId, list).then((res) => {
            if (res.data.code === 0) {
              this.$Message.success("操作成功");
              this.addSuccess();
            }
          }).finally(() => {
            this.submitLoading = false;
          });
        },
        onCancel: () => {
          this.$Message.info('已取消');
        }
      });
    }
  },
};
</script>