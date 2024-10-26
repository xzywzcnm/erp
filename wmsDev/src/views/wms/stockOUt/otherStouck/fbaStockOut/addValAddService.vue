<template>
  <div>
    <Modal v-model="isVisible" title="增值服务" width="1300px" :mask-closable="false" :closable="modalClose"
      class="fbaAddValAddService">
      <Form ref="tableForm" :model="formData" :label-width="100" class="fmb0 inline-form" inline>
        <div class="mb10">
          <FormItem :label-width="140">
            <div slot="label" class="flexCenter justifyEnd">
              <Checkbox v-model="overseasBoxesChecked" @on-change="overseasBoxesChange" />
              <span>海外仓装车箱数：</span>
            </div>
            <dytInput v-model.trim="formData.overseasBoxesNumber" :disabled="!overseasBoxesChecked" type="number"
              @on-blur="overseasBoxesBlur"></dytInput>
          </FormItem>
          <FormItem label="货箱数量：">
            <div>{{ pickingBoxes.boxedNum || 0 }}</div>
          </FormItem>
          <FormItem label="物流商：">
            <div v-if="apiLogisterList[fbaPickingBase.logisticsProvidersCode]">
              {{ apiLogisterList[fbaPickingBase.logisticsProvidersCode].name }}
            </div>
          </FormItem>
          <FormItem label="物流商单号：">
            <div>{{ fbaPickingBase.logisticsProvidersNo }}</div>
          </FormItem>
          <FormItem label="运输方式：">
            <div v-if="shippingList[fbaPickingBase.transportMethod]">
              {{ shippingList[fbaPickingBase.transportMethod].label }}
            </div>
          </FormItem>
        </div>
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
import { shippingList } from "../components/fileData";

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
      overseasBoxesChecked: false,
      formData: {
        overseasBoxesNumber: 0,
        tableList: [],
      },
      columns: [
        {
          type: 'index',
          title: '序号',
          width: 70,
          align: 'center'
        },
        {
          title: "产品图片",
          align: "center",
          width: 90,
          render: (h, params) => {
            return this.tableImg(h, params.row.goodsUrl);
          },
        },
        {
          title: '产品sku',
          align: 'center',
          width: 120,
          key: 'goodsSku'
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
          width: 100,
          key: "notAssignedNumber",
        },
        {
          title: "已拣货数量",
          align: "center",
          width: 100,
          key: "actualPickingNumber",
        },
        {
          title: "异常sku数量",
          align: "center",
          width: 100,
          key: "missNumber",
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
      ],
      tableLoading: false,
      submitLoading: false,
      apiLogisterList: {}, // 物流商下拉
      shippingList: this.$common.arrayToObj(shippingList),
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
    // 装箱数据
    pickingBoxes() {
      return this.valAddServiceData.pickingBoxes || {};
    },
    // 物流商信息
    fbaPickingBase() {
      return this.valAddServiceData.fbaPickingBase || {};
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.resetData();
      this.getlosgisList();
      this.isVisible = true;
      // 重新置空为0
      this.formData.tableList = this.$common.copy(this.list).map(k => {
        k.vacuumizeNumber = k.vacuumizeNumber || 0;
        k.vacuumizeChecked = !!k.vacuumizeNumber;
        k.qualityNumber = k.qualityNumber || 0;
        k.qualityChecked = !!k.qualityNumber;
        return k;
      });
      this.formData.overseasBoxesNumber = this.valAddServiceData.overseasBoxesNumber;
      this.overseasBoxesChecked = !!this.valAddServiceData.overseasBoxesNumber;
    },
    // 获取物流商列表
    getlosgisList() {
      if (this.apiLogisterList.length) return;
      return this.axios
        .get(api.get_logisterList + `?carrierId=${null}`)
        .then(({ data }) => {
          if (data && data.code === 0) {
            this.apiLogisterList = this.$common.arrayToObj(data.datas || [], 'code'); // 列表值如果是PMS 0,其他为 1
          }
        });
    },
    resetData() {
      this.formData.overseasBoxesNumber = 0;
      this.overseasBoxesChecked = false;
      this.formData.tableList = [];
    },
    overseasBoxesChange() {
      let boxedNum = this.pickingBoxes.boxedNum || 0;
      this.formData.overseasBoxesNumber = !this.overseasBoxesChecked ? 0 : boxedNum;
    },
    overseasBoxesBlur() {
      let num = this.formData.overseasBoxesNumber;
      if (this.$common.isEmpty(num)) {
        num = 0;
      }
      if (!regular.integerZero.test(num)) {
        num = 0;
      }
      let boxedNum = this.pickingBoxes.boxedNum || 0;
      if (new Big(num).minus(boxedNum) > 0) {
        num = boxedNum;
      }
      this.formData.overseasBoxesNumber = num;
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
      let { tableList, overseasBoxesNumber } = this.formData;
      let list = tableList.map(k => {
        return {
          pickingDetailId: k.pickingDetailId,
          vacuumizeNumber: k.vacuumizeNumber,
          qualityNumber: k.qualityNumber,
        }
      })
      let rqApi = `${api.updateValueAddedService}${valAddServiceData.pickingId}`;
      // if (!this.$common.isEmpty(overseasBoxesNumber)) {
      rqApi += `?overseasBoxesNumber=${overseasBoxesNumber || 0}`;
      // }
      // console.log(list, 'list')
      // return;
      this.submitLoading = true;
      this.axios.put(rqApi, list).then((res) => {
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

<style lang="less">
.fbaAddValAddService {
  .inline-form {
    .ivu-form-item-content {
      width: 135px;
    }
  }
}
</style>
