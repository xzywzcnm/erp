<template>
  <div>
    <Modal v-model="frozenModal" :styles="{
      top: '80px',
      width: '95%',
      'min-width': '1300px',
      'max-width': '1500px',
    }" title="冻结分配" class="headerBar" @on-cancel="resetData" :mask-closable="false">
      <div>
        <Form class="setAllMarkRead" inline :model="searchParams">
          <Row>
            <Col span="24">
            <Form-item prop="searchType" style="width: 100px">
              <dyt-select v-model="searchParams.searchType" :clearable="false" filterable @on-change="changeData">
                <Option v-for="(item, index) in selectTypeData" :value="item.key" :key="index">{{ item.name }}</Option>
              </dyt-select>
            </Form-item>
            <Form-item prop="searchValueList" v-if="mulSearchInput">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="searchParams.searchValueList" style="width: 200px"
                placeholder="多个请用逗号或回车分隔" />
            </Form-item>
            <Form-item prop="searchValue" v-else>
              <Input v-model="searchParams.searchValue" clearable style="width: 200px"
                :placeholder="`请输入${[1].includes(searchParams.searchType) ? '入库' : '冻结'}单`" />
            </Form-item>
            <Form-item label="所属事业部:" style="width: 300px; margin-right: 15px" :label-width="90">
              <dyt-select :multiple="true" :max-tag-count="1" v-model="searchParams.businessDeptIdList"
                placeholder="请选择事业部">
                <Option v-for="(item, index) in businessDeptList" :value="item.id" :key="`${index}-${item.id}`"
                  :label="item.name"></Option>
              </dyt-select>
            </Form-item>
            <Button type="primary" @click="freezeBtn" :disabled="tableLoading">查询</Button>
            </Col>
          </Row>
        </Form>
        <div style="position: relative">
          <Table ref="selection" highlight-row border :columns="frozenColumns" :data="frozenData" :max-height="600"
            @on-selection-change="getSelectValue" />
          <Spin v-if="tableLoading" fix></Spin>
        </div>
      </div>
      <div slot="footer" style="text-align: center">
        <Button type="primary" @click="distributeBtn" :disabled="tableLoading || distributeLoading">解冻并分配</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
const pickingJson = {
  0: "收货库位",
  1: "拣货库位",
};

export default {
  mixins: [Mixin],
  name: "freezeAssignmentModal",
  props: {
    deliveryOrder: String,
    frozenModalTalg: String,
    frozenRequestApi: String,
    otherSearch: {
      //额外传参
      type: Object,
      default: () => {
        return {};
      },
    },
    mulSearchInput: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      frozenModal: false,
      tableLoading: false,
      distributeLoading: false,
      frozenData: [],
      businessDeptList: [],
      businessDeptJson: {},
      frozenColumns: [
        { type: "selection", width: 60, align: "center" },
        { title: "入库单", align: "center", key: "receiptNo" },
        { title: "冻结单", align: "center", key: "inventoryFrozenNo" },
        {
          title: "所属事业部",
          align: "center",
          key: "businessDeptName",
          render: (h, { row }) => {
            let txtItem = [];
            if (
              this.$common.isEmpty(row.businessDeptName) &&
              !this.$common.isEmpty(row.businessDeptId)
            ) {
              const businessDeptInfo = this.businessDeptJson[row.businessDeptId];
              !this.$common.isEmpty(businessDeptInfo) &&
                txtItem.push(h("div", {}, `${businessDeptInfo.name || ""}`));
            } else {
              txtItem.push(h("div", {}, `${row.businessDeptName || ""}`));
            }
            return h("div", {}, txtItem);
          },
        },
        { title: "产品ID", align: "center", key: "inventoryId" },
        {
          title: "中文描述",
          align: "center",
          key: "goodsCnDesc",
          render: (h, { row }) => {
            return h(
              "div",
              {
                style: {
                  display: "inline-block",
                  "text-align": "left",
                },
              },
              row.goodsCnDesc || ""
            );
          },
        },
        {
          title: "英文描述",
          align: "center",
          key: "goodsEnDesc",
          render: (h, { row }) => {
            return h(
              "div",
              {
                style: {
                  display: "inline-block",
                  "text-align": "left",
                },
              },
              row.goodsEnDesc || ""
            );
          },
        },
        { title: "批次号", align: "center", key: "receiptBatchNo" },
        { title: "库区", align: "center", width: 100, key: "warehouseBlockName" },
        { title: "库位", align: "center", width: 100, key: "warehouseLocationName" },
        {
          title: "库位使用",
          align: "center",
          key: "pickingFlag",
          width: 90,
          render: (h, { row }) => {
            const pickingName = pickingJson[row.pickingFlag] || "";
            return h("div", pickingName);
          },
        },
        { title: "冻结数量", align: "center", width: 90, key: "frozenInventoryNumber" },
        {
          title: "备注",
          align: "center",
          key: "remark",
          render: (h, { row }) => {
            return h(
              "div",
              {
                style: {
                  display: "inline-block",
                  "text-align": "left",
                },
              },
              row.remark || ""
            );
            // return h('div', {
            //   class: 'freezeAssignmentModal-remark',
            // },
            // [
            //   h('Tooltip', {
            //     props: {
            //       content: row.remark || '',
            //       'max-width': 500,
            //       transfer: true
            //     }
            //   }, row.remark || '')
            // ]);
          },
        },
      ],
      selectTypeData: [
        { key: 1, name: "入库单" },
        { key: 2, name: "冻结单" },
      ],
      searchParams: {
        businessDeptIdList: [],
        searchValueList: [],
        searchValue: "",
        searchType: 1,
      },
      SelectData: [],
    };
  },
  watch: {
    frozenModal: {
      handler(value) {
        if (value) {
          this.GetFrozenData();
        } else {
          this.resetData();
        }
      },
      deep: true,
    },
    getBusinessDept: {
      deep: true,
      immediate: true,
      handler(val) {
        this.businessDeptJson = {};
        (val || []).forEach((item) => {
          this.$set(this.businessDeptJson, item.id, item);
        });
        this.businessDeptList = val;
      },
    },
  },
  computed: {
    getBusinessDept() {
      return this.$store.getters.getBusinessDeptList;
    },
  },
  created() {
    // 海外仓出库单新增入库单备注显示
    // if (this.$route.path === '/fbaStockOut') {
    //   this.frozenColumns.push({
    //     title: '备注',
    //     align: 'center',
    //     key: 'remark',
    //     width: 140,
    //     tooltip: true
    //   })
    // }
  },
  methods: {
    GetFrozenData() {
      // 获取冻结分配列表的数据
      if (this.tableLoading) return;
      let searchParams = this.$common.copy(this.searchParams);
      if (this.mulSearchInput) {
        delete searchParams.searchValueList;
      } else {
        delete searchParams.searchValue;
      }
      let query = {
        warehouseId: this.getWarehouseId(),
        pickingNo: this.deliveryOrder,
        ...this.searchParams,
      };
      if (!this.$common.isEmpty(this.otherSearch)) {
        query = Object.assign(query, this.otherSearch);
      }
      this.tableLoading = true;
      this.SelectData = [];
      this.axios
        .post(api.get_FrozenInventory, query)
        .then((res) => {
          if (res.data.code === 0) {
            this.frozenData = res.data.datas;
          }
          this.tableLoading = false;
        })
        .catch(() => {
          this.tableLoading = false;
        });
    },
    getSelectValue(data) {
      // 获取勾选的列表数据
      this.SelectData = this.$common.isEmpty(data) ? [] : data;
    },
    freezeBtn() {
      // 冻结分配弹窗查询按钮
      this.GetFrozenData();
    },
    distributeBtn() {
      // 解冻并分配按钮
      if (this.tableLoading || this.distributeLoading) return;
      if (this.SelectData.length <= 0) {
        this.$Message.warning("请选择数据");
        return false;
      }
      let query = {
        warehouseId: this.getWarehouseId(),
        inventoryFrozenDetailIdList: this.SelectData.map(
          (m) => m.inventoryFrozenDetailId
        ),
        pickingNo: this.deliveryOrder,
      };
      this.distributeLoading = true;
      let rqApi = api.post_otherPickingDistributionFrozen;
      this.frozenRequestApi && (rqApi = this.frozenRequestApi);
      this.axios
        .post(rqApi, query)
        .then((res) => {
          if (res.data.code === 0) {
            this.SelectData = [];
            this.frozenData = res.data.datas;
            this.resetData();
            this.$emit("updateData", this.frozenModalTalg);
          }
          this.distributeLoading = false;
        })
        .catch(() => {
          this.distributeLoading = false;
        });
    },
    resetData() {
      // 重置弹窗数据
      this.searchParams.searchType = 1;
      this.searchParams.searchValue = "";
      this.searchParams.searchValueList = [];
      this.searchParams.businessDeptIdList = [];
      this.SelectData = [];
      this.frozenData = [];
      this.frozenModal = false;
    },
    changeData(val) {
      this.searchParams.searchValue = "";
    },
  },
};
</script>
<style lang="less" scoped>
.setAllMarkRead {
  margin-top: 10px;
}

:deep(.freezeAssignmentModal-remark) {
  width: 100%;

  .ivu-tooltip {
    width: 100%;
  }

  .ivu-tooltip-rel {
    width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
}
</style>
