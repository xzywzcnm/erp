<template>
  <div>
    <Modal v-model="isVisible" title="增值服务" width="1300px" :mask-closable="false" :closable="modalClose">
      <Form ref="tableForm" :model="formData" :label-width="0" class="fmb0">
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
          <template slot-scope="{ row, index }" slot="qualityNumber">
            <div class="flexCenter">
              <Checkbox v-model="formData.tableList[index].qualityChecked" @on-change="checkChange(index, 'quality')" />
              <Input v-model="formData.tableList[index].qualityNumber" :disabled="!row.qualityChecked" type="number"
                @on-blur="numberBlur(index, 'quality')" />
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
import api from "@/api/api";
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
    valAddServiceData: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      isVisible: false,
      formData: {
        tableList: [],
      },
      columns: [
        {
          type: 'index',
          title: '序号',
          width: 60,
          align: 'center'
        },
        {
          title: "产品图片",
          align: "center",
          width: 80,
          render: (h, params) => {
            return this.tableImg(h, params.row.goodsUrl);
          },
        },
        {
          title: "产品sku",
          align: "center",
          key: "goodsSku",
          width: 120,
        },
        {
          title: "中文描述",
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
          title: "已分配数量",
          align: "center",
          width: 100,
          key: "doneAssignedNumber",
        },
        {
          title: "未分配数量",
          align: "center",
          width: 90,
          key: "notAssignedNumber",
        },
        {
          title: "已拣货数量",
          align: "center",
          width: 90,
          key: "actualPickingNumber",
        },
        {
          title: "抽真空数量",
          align: "center",
          width: 150,
          slot: 'vacuumizeNumber',
        },
        {
          title: "质检数量",
          align: "center",
          width: 150,
          slot: 'qualityNumber',
        },
        {
          title: "换包装数量",
          align: "center",
          width: 150,
          slot: 'replacePackingNumber',
        },
      ],
      tableLoading: false,
      submitLoading: false,
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
  },
  methods: {
    // 窗口打开
    open() {
      this.resetData();
      this.getDetail();
      this.isVisible = true;

      // 重新置空为0
      this.formData.tableList = this.$common.copy(this.list).map(k => {
        k.vacuumizeNumber = k.vacuumizeNumber || 0;
        k.vacuumizeChecked = !!k.vacuumizeNumber;
        k.qualityNumber = k.qualityNumber || 0;
        k.qualityChecked = !!k.qualityNumber;
        k.replacePackingNumber = k.replacePackingNumber || 0;
        k.replacePackingChecked = !!k.replacePackingNumber;
        return k;
      });
    },
    resetData() {
      this.formData.tableList = [];
    },
    getDetail() {

    },
    checkChange(index, type) {
      let row = this.formData.tableList[index];
      if (!row[type + 'Checked']) {
        this.$set(this.formData.tableList[index], type + 'Number', 0);
      } else {
        this.$set(this.formData.tableList[index], type + 'Number', row.actualPickingNumber || 0);
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
      let actualPickingNumber = row.actualPickingNumber || 0;
      if (new Big(num).minus(actualPickingNumber) > 0) {
        num = actualPickingNumber;
      }
      this.$set(this.formData.tableList[index], type + 'Number', num);
    },
    handleData() {
      let valAddServiceData = this.valAddServiceData;
      let list = this.formData.tableList.map(k => {
        return {
          pickingDetailId: k.pickingDetailId,
          vacuumizeNumber: k.vacuumizeNumber,
          qualityNumber: k.qualityNumber,
          replacePackingNumber: k.replacePackingNumber,
        }
      })
      // console.log(list, 'list')
      // return;
      this.submitLoading = true;
      this.axios.put(api.updateValueAddedService + valAddServiceData.pickingId, list).then((res) => {
        if (res.data.code === 0) {
          this.$Message.success("操作成功");
          this.$emit('addSuccess');
          this.isVisible = false;
        }
      }).finally(() => {
        this.submitLoading = false;
      });
    },
  },
};
</script>
