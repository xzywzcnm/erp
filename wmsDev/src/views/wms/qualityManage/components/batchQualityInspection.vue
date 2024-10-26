<template>
  <div>
    <Modal v-model="isVisible" title="批量质检" :width="1000" :mask-closable="false" :closable="modalClose"
      class="batchQualityInspection-page formDetail">
      <div>
        <Form ref="formBatch" :model="formData" :label-width="0" class="fmb0">
          <Table highlight-row border :columns="columns" :data="formData.tableList">
            <template slot-scope="{ row }" slot="goodsUrl">
              <dyt-previewImg :url="row.goodsUrl"></dyt-previewImg>
            </template>
            <template slot-scope="{ row }" slot="basicInfo">
              <div class="order-item">
                <div class="order-li">{{row.goodsSku}}</div>
                <div class="order-li">{{row.goodsCnDesc}}</div>
              </div>
            </template>
            <template slot-scope="{ row, index }" slot="passCheckNumber">
              <FormItem label="" :prop="'tableList.' + index + '.passCheckNumber'"
                :rules="{ validator: validateQualifyNum, trigger: 'change', row: row, rowType: 'passCheckNumber' }">
                <Input v-model.number="formData.tableList[index].passCheckNumber" type="number" class="spinButton" />
              </FormItem>
            </template>
            <template slot-scope="{ row, index }" slot="problemCheckNumber">
              <FormItem label="" :prop="'tableList.' + index + '.problemCheckNumber'"
                :rules="{ validator: validateQualifyNum, trigger: 'change', row: row, rowType: 'problemCheckNumber'}">
                <Input v-model.number="formData.tableList[index].problemCheckNumber" type="number" class="spinButton" />
              </FormItem>
            </template>
          </Table>
        </Form>
      </div>

      <div slot="footer">
        <Button type="primary" @click="submit" :loading="loading">提交结果</Button>
        <Button @click="isVisible = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import Big from 'big.js';
import regular from '@/utils/regular.js';
export default {
  name: 'batchQualityInspection',
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false
      }
    },
    modalData: {
      type: Array,
      default() {
        return []
      }
    },
  },
  data() {
    return {
      isVisible: false,
      formData: {
        tableList: []
      },
      columns: [
        {
          title: '图片',
          slot: 'goodsUrl',
          align: 'center',
          width: 100,
        },
        {
          title: 'SKU/产品名称',
          slot: 'basicInfo',
          align: 'center',
          minWidth: 160,
        },
        {
          title: '入库单号',
          key: 'receiptNo',
          align: 'center',
          minWidth: 120,
        },
        {
          title: '送检数量',
          key: 'expectedCheckNumber',
          align: 'center',
          width: 100,
        },
        {
          title: '已检数量',
          key: 'inspectedQuantity',
          align: 'center',
          width: 100,
        },
        {
          title: '待检数量',
          key: 'waitCheckNumber',
          align: 'center',
          width: 100,
        },
        {
          title: '合格数量',
          slot: 'passCheckNumber',
          align: 'center',
          minWidth: 100,
        },
        {
          title: '问题数量',
          slot: 'problemCheckNumber',
          align: 'center',
          minWidth: 100,
        },
      ],
      loading: false,
    }
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true
    },
    isVisible: {
      handler(val) {
        if (val) return;
        this.$emit('update:modelVisible', val);
      },
      deep: true
    }
  },
  computed: {
    modalClose() {
      return !this.$store.getters.getSelfPreviewDialog;
    }
  },
  methods: {
    // 窗口打开
    open() {
      this.isVisible = true;
      this.formData.tableList = this.modalData.map(k => {
        k.inspectedQuantity = Number(new Big(k.expectedCheckNumber || 0).minus(k.waitCheckNumber || 0));// 已检数量
        k.passCheckNumber = k.waitCheckNumber || 0;// 合格数默认为待检数量
        k.problemCheckNumber = 0;// 问题数默认0
        k.goodsId = k.productGoodsId;// 货品id
        return k;
      })
    },
    // 合格数量限制
    validateQualifyNum(rule, value, callback) {
      if (value === '' || value === undefined || value === null) {
        return callback(new Error('请输入内容'));
      }
      if (!regular.integer.test(value)) {
        return callback(new Error('限大于或等于0的整数'));
      }
      // 合格数
      if (rule.rowType === 'passCheckNumber') {
        let maxNum = Number(new Big(rule.row.waitCheckNumber || 0).minus(rule.row.problemCheckNumber));
        // console.log(rule, maxNum, value, 'passCheckNumber')
        if (value > maxNum) return callback(new Error('合格数不能大于 "待检数-问题数" '));
      }
      // 问题数
      if (rule.rowType === 'problemCheckNumber') {
        let maxNum = Number(new Big(rule.row.waitCheckNumber || 0).minus(rule.row.passCheckNumber));
        // console.log(rule, maxNum, value, 'problemCheckNumber')
        if (value > maxNum) return callback(new Error('问题数不能大于 "待检数-合格数" '));
      }
      return callback();
    },
    // 提交
    submit() {
      this.$refs['formBatch'].validate((valid) => {
        if (!valid) return;
        this.loading = true;
        this.axios.post(api.batchSubmit, this.formData.tableList).then(res => {
          if (res.data.code === 0) {
            this.$Message.success('提交成功');
            this.$emit('checkSearch');
            this.isVisible = false;
          }
        }).finally(() => {
          this.loading = false;
        });
      })
    }
  }
}
</script>

<style lang="less">
.batchQualityInspection-page {}
</style>
