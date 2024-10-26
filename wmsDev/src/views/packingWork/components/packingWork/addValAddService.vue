<template>
  <div>
    <Modal v-model="isVisible" title="增值服务" width="1300px" :mask-closable="false" :closable="modalClose"
      class="fbaAddValAddService packingWork_fbaAddValAddService">
      <Form ref="tableForm" :model="formData" :label-width="100" class="fmb0" inline>
        <Table highlight-row border :columns="columns" :data="formData.tableList" height="600" :loading="tableLoading"
          class="negativeDistance">
          <template slot-scope="{ row, index }" slot="vacuumizeNumber">
            <div class="flexCenter">
              <Checkbox v-model="formData.tableList[index].vacuumizeChecked"
                @on-change="checkChange(index, 'vacuumize')" />
              <Input v-model="formData.tableList[index].vacuumizeNumber" :disabled="!row.vacuumizeChecked" type="number"
                @on-blur="numberBlur(index, 'vacuumize')" />
            </div>
          </template>
          <template slot-scope="{ row, index }" slot="replacePackingNumber">
            <div class="flexCenter">
              <Checkbox v-model="formData.tableList[index].replacePackingChecked"
                @on-change="checkChange(index, 'replacePacking')" />
              <Input v-model="formData.tableList[index].replacePackingNumber" :disabled="!row.replacePackingChecked"
                type="number" @on-blur="numberBlur(index, 'replacePacking')" />
            </div>
          </template>
        </Table>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="handleData" :loading="submitLoading">确定</Button>
        <Button @click="isVisible = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
// import api from "@/api/api";
import Big from 'big.js';
import regular from '@/utils/regular.js';
import tableImg_mixin from "@/components/mixin/tableImg_mixin";

export default {
  name: "addValAddService",
  mixins: [tableImg_mixin],
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false;
      },
    },
    list: {
      type: Array,
      default() {
        return [];
      },
    },
    // addItemList: {
    //   type: Array,
    //   default() {
    //     return [];
    //   },
    // },
  },
  data() {
    return {
      isVisible: false,
      formData: {
        tableList: [],
      },
      tableLoading: false,
      submitLoading: false,
      apiLogisterList: {}, // 物流商下拉
    };
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true,
    },
    isVisible: {
      handler(val) {
        if (val) return;
        this.$emit("update:modelVisible", false);
      },
      deep: true,
    },
  },
  computed: {
    modalClose() {
      return !this.$store.getters.getSelfPreviewDialog;
    },
    columns() {
      let list = [];
      // let temp = this.$common.arrayToObj(this.addItemList, 'resourceName');
      // if ('vacuumizeProduct' in temp) {
      list.push({
        title: "抽真空数量",
        align: "center",
        minWidth: 150,
        slot: 'vacuumizeNumber',
      })
      // }
      // if ('inventoryOverTime' in temp) {
      list.push({
        title: "换包装",
        align: "center",
        minWidth: 150,
        slot: 'replacePackingNumber',
      })
      // }
      return [
        {
          type: 'index',
          title: '序号',
          width: 70,
          align: 'center'
        },
        {
          title: 'sku/名称/规格',
          align: 'left',
          minWidth: 150,
          render: (h, { row }) => {
            return h('div', [
              h('div', {
                style: {
                  color: "#377d22"
                }
              }, row.sku),
              h('div', row.name),
              h('div', row.variations),
            ])
          },
        },
        {
          title: "应发数量",
          align: "center",
          minWidth: 100,
          key: "quantity",
        },
        {
          title: "已扫描数量",
          align: "center",
          minWidth: 100,
          key: "scanQuantity",
        },
        {
          title: "核对",
          align: "center",
          minWidth: 100,
          render: (h, params) => {
            return params.row.check
              ? h(
                "span",
                {
                  attrs: {
                    class: "icon iconfont greenColor cursor",
                  },
                  style: {
                    margin: "0 10px",
                  },
                },
                ""
              )
              : "";
          },
        },
        ...list,
      ]
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.resetData();
      this.isVisible = true;
      // 重新置空为0
      this.formData.tableList = this.$common.copy(this.list).map(k => {
        k.vacuumizeNumber = k.vacuumizeNumber || 0;
        k.vacuumizeChecked = !!k.vacuumizeNumber;
        k.replacePackingNumber = k.replacePackingNumber || 0;
        k.replacePackingChecked = !!k.replacePackingNumber;
        return k;
      });
    },
    resetData() {
      this.formData.tableList = [];
    },
    checkChange(index, type) {
      let row = this.formData.tableList[index];
      if (!row[type + 'Checked']) {
        this.$set(this.formData.tableList[index], type + 'Number', 0);
      } else {
        this.$set(this.formData.tableList[index], type + 'Number', row.quantity || 0);
      }
    },
    numberBlur(index, type) {
      let row = this.formData.tableList[index];
      let num = row[type + 'Number'];
      if (this.$common.isEmpty(num)) {
        num = 0;
      }
      if (!regular.integerZero.test(num)) {
        num = 0;
      }
      let quantity = row.quantity || 0;
      if (new Big(num).minus(quantity) > 0) {
        num = quantity;
      }
      this.$set(this.formData.tableList[index], type + 'Number', num);
    },
    handleData() {
      this.$emit('addSuccess', this.formData.tableList);
      this.isVisible = false;
    },
  },
};
</script>

<style lang="less">
.packingWork_fbaAddValAddService {

  .flexCenter {
    display: flex;
    align-items: center;
  }

  .fmb0 {
    .ivu-form-item {
      margin-bottom: 0 !important;
    }
  }
}
</style>
