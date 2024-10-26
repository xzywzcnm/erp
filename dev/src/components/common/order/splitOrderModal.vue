<template >
  <Modal v-model="pageVisible" :title="`${isEdit ? '拆单': '确认拆单'}`" :mask-closable="false" width="850">
    <div class="modal-body-main">
      <div>可拆单商品</div>
      <Form
        ref="formRefDemo"
        label-position="right"
        :model="formData"
        :label-width="100"
      >
        <div class="main-table-content">
          <template v-for="(item, index) in formData.tableData">
            <div class="main-table-row" :key="`row-${index}`" v-if="isEdit || item.splitingQuantity">
              <div class="row-image">
                <Poptip trigger="hover" placement="right-start" v-if="!$common.isEmpty(item.pictureUrl)" transfer>
                  <img :src="item.pictureUrl" />
                  <div slot="content" style="width: 500px;">
                    <img :src="(item.pictureUrl.includes('/thumb/') ? item.pictureUrl.replace('/thumb/', '/') : item.pictureUrl)" style="width: 100%;" />
                  </div>
                </Poptip>
                <img v-else :src="placeholderSrc" />
              </div>
              <div class="row-item flex40">
                <div class="display-flex">
                  <span>itemID：</span>
                  <span class="flex-full">{{ item.webstoreItemId }}</span>
                </div>
                <div class="display-flex">
                  <span>SKU：</span>
                  <span class="flex-full">{{ item.webstoreSku }}</span>
                </div>
              </div>
              <div class="row-item flex60">
                <div class="display-flex">
                  <span>名称：</span>
                  <span class="flex-full">{{ item.title }}</span>
                </div>
                <div class="display-flex line-height33" >
                  <span>数量：</span>
                  <div class="flex-full row-td-quantity">
                    <div class="item-quantity mb24">{{ item.notSplitQuantity }}</div>
                    <FormItem
                      v-if="formData.tableData[index].isCheckedRowData"
                      class="flex-full"
                      :prop="`tableData[${index}].splitingQuantity`"
                      :rules="[
                        { validator: verifySpiltNumber, nowData: formData.tableData[index], trigger: 'change' },
                        { validator: verifySpiltNumber, nowData: formData.tableData[index], trigger: 'blur' },
                      ]"
                      label="拆单数量："
                      :label-width="70"
                    >
                      <Input
                        v-model="formData.tableData[index].splitingQuantity"
                        type="text"
                        placeholder="请输入大于 0 的整数"
                        :disabled="!isEdit"
                      />
                    </FormItem>
                    <!-- <div v-else class="mr20">拆单数量：{{ item.splitingQuantity }}</div> -->
                  </div>
                </div>
              </div>
              <div class="row-check" v-if="isEdit">
                <Checkbox v-model="item.isCheckedRowData" @on-change="checkedChange($event, index)"></Checkbox>
              </div>
            </div>
          </template>
        </div>
      </Form>
    </div>
    <div slot="footer">
      <Button @click="pageVisible = false">{{ isEdit ? '取消' : '关闭' }}</Button>
      <Button @click="nextLastStep('last')" v-if="!isEdit">返回上一个窗口</Button>
      <Button type="primary" @click="nextLastStep('next')" v-if="isEdit">提交</Button>
      <Button type="primary" @click="handleSubmit" :loading="pageLoading" v-if="!isEdit">确定</Button>
    </div>
    <Spin v-if="pageLoading" fix></Spin>
  </Modal>
</template>
<script>
import api from '@/api/api';

export default {
  props: {
    modelVisible: { type: Boolean, default: false },
    modelData: {
      type: Object,
      default () {
        return {
          orderDetails: {},
          orderInfo: {}
        }
      }
    }
  },
  data () {
    return {
      pageLoading: true,
      pageVisible: false,
      isExceedTotal: false,
      isEdit: true,
      placeholderSrc: './static/images/placeholder.jpg',
      verifyKeys: [],
      // 表单数据
      formData: {
        tableData: []
      }
    }
  },
  watch: {
    modelVisible: {
      deep: true,
      immediate: true,
      handler (newVal) {
        this.pageVisible = newVal;
        if (!newVal) return;
        this.pageLoading = true;
        this.$nextTick(() => {
          setTimeout(() => {
            this.initData();
          }, 300)
        })
      }
    },
    pageVisible: {
      deep: true,
      handler (newVal) {
        this.$emit('update:modelVisible', newVal);
        if (newVal) return;
        this.resetData();
      }
    },
    orderTransactions: {
      deep: true,
      immediate: true,
      handler (newVal) {
        const tableData = newVal.filter(fin => {
          if (this.$common.isEmpty(fin.quantity) || this.$common.isEmpty(Number(fin.quantity))) return false;
          if (this.$common.isEmpty(fin.splitQuantity) && this.$common.isEmpty(Number(fin.splitQuantity))) {
            return (Number(fin.quantity) - Number(fin.splitQuantity)) > 0
          }
          return true;
        }).map((row, index) => {
          return {
            ...row,
            notSplitQuantity: Number(row.quantity) - Number(row.splitQuantity || '0'),
            isCheckedRowData: false,
            splitingQuantity: null
          }
        })
        this.formData.tableData = tableData;
      }
    }
  },
  computed: {
    // 订单详情
    orderDetails () {
      return this.modelData.orderDetails || {};
    },
    // 订单信息
    orderInfo () {
      return this.modelData.orderInfo || {};
    },
    orderTransactions () {
      if (this.$common.isEmpty(this.orderInfo) || this.$common.isEmpty(this.orderInfo.orderTransactions)) return [];
      return this.orderInfo.orderTransactions;
    },
    // 订单ID
    getOrderId () {
      if (this.$common.isEmpty(this.orderInfo) || this.$common.isEmpty(this.orderInfo.orderId)) return '';
      return this.orderInfo.orderId;
    },
    // 拆单总数
    splitOrderNumber () {
      let total = 0;
      let splitTotal = 0;
      let isCheck = false;
      this.formData.tableData.forEach((row) => {
        if (!this.$common.isEmpty(Number(row.notSplitQuantity))) {
          total += Number(row.notSplitQuantity);
        }
        if (row.isCheckedRowData) {
          if (!isCheck) {
            isCheck = true;
          }
          if (!this.$common.isEmpty(Number(row.splitingQuantity))) {
            splitTotal += Number(row.splitingQuantity);
          }
        }
      });
      return { total: total, splitTotal: splitTotal, isCheck: isCheck }
    }
  },
  methods: {
    initData () {
      this.pageLoading = false;
    },
    // 重置数据
    resetData () {
      this.pageLoading = true;
      this.isEdit = true;
      this.verifyKeys = [];
      this.formData.tableData = [];
    },
    // 是的选中时
    checkedChange (val, index) {
      const key = `tableData[${index}].splitingQuantity`;
      this.$nextTick(() => {
        if (val) {
          if (!this.verifyKeys.includes(key)) {
            this.verifyKeys.push(key);
            const inputVal = this.formData.tableData[index].splitingQuantity;
            if (this.$refs.formRefDemo && !this.$common.isEmpty(inputVal)) {
              this.$refs.formRefDemo.validateField(key);
            }
          }
          return;
        }
        this.verifyKeys = this.verifyKeys.filter(item => key != item);
        if (this.isExceedTotal && this.$refs.formRefDemo) {
          this.isExceedTotal = false;
          this.verifyKeys.forEach(item => {
            this.$refs.formRefDemo.validateField(item);
          })
        }
      })
    },
    // 验证拆单数量
    verifySpiltNumber (rule, value, callback) {
      this.$nextTick(() => {
        let newRule = this.$common.copy(rule);
        const splitNum = this.splitOrderNumber;
        if (splitNum.splitTotal > (splitNum.total - 1)) {
          this.isExceedTotal = true;
          return callback(new Error(`拆单总数不能超过 ${splitNum.total - 1}`));
        }
        if (this.isExceedTotal) {
          this.isExceedTotal = false;
          this.verifyKeys.forEach(key => {
            this.$refs.formRefDemo.validateField(key);
          })
        }
        newRule = { ...newRule, min: 0, max: rule.nowData.notSplitQuantity, point: 0, notIncludes: ['min'], msg: '请输入不小于0的整数' };
        delete newRule.nowData;
        this.$common.validatorMaxNumber(newRule, value, callback);
      })
    },
    // 下一步(提交时) next or last
    nextLastStep (type) {
      this.$refs.formRefDemo.validate((valid) => {
        if (!valid) return this.$Message.error('拆单数量验证不通过，请检查！');
        const splitNum = this.splitOrderNumber;
        if (this.$common.isEmpty(splitNum.splitTotal) || splitNum.splitTotal <= 0) {
          if (!splitNum.isCheck) return this.$Message.error('请选择拆单商品并填写拆单数量');
          return this.$Message.error('请在选择的商品处填写拆单数量');
        }
        this.isEdit = type == 'last';
      })
    },
    // 确认-拆分订单
    handleSubmit () {
      this.pageLoading = true;
      this.axios.post(api.splitOrderInfo, {
        orderId: this.getOrderId,
        splitOrderInfoDetailList: this.formData.tableData.filter(item => {
          return item.isCheckedRowData && !this.$common.isEmpty(Number(item.splitingQuantity)) && item.splitingQuantity > 0;
        }).map(row => {
          return {
            orderTransactionId: row.orderTransactionId,
            splitingQuantity: Number(row.splitingQuantity)
          }
        })
      }).then(res => {
        if (!res || !res.data || res.data.code != 0) return;
        this.$Message.success('操作成功！');
        this.$nextTick(() => {
          this.$emit('updateOrderData', true);
          this.pageVisible = false;
        })
      }).finally(() => {
        this.pageLoading = false;
      })
    }
  }
};
</script>
<style lang="less" scoped>
.modal-body-main{
  position: relative;
  .main-table-content{
    margin-top: 15px;
    max-height: 550px;
    border: 1px solid #E8EAEC;
    overflow: auto;
    .main-table-row{
      display: flex;
      border-bottom: 1px solid #E8EAEC;
      justify-content: space-between;
      align-items: center;
      .row-item{
        flex: 100;
        padding: 5px;
        &.flex40{
          flex: 40;
        }
        &.flex60{
          flex: 60;
        }
      }
      .row-image{
        width: 70px;
        padding: 5px;
        img{
          width: 100%;
          max-height: 100px;
        }
      }
      .row-check{
        width: 40px;
        padding: 5px;
      }
      &:nth-last-of-type(1) {
        border-bottom: none;
      }
    }
  }
  .display-flex{
    display: flex;
    .flex-full{
      flex: 100;
    }
  }
  .line-height33{
    line-height: 33px;
  }
  .mb24{
    margin-bottom: 24px;
  }
  .row-td-quantity{
    display: flex;
    justify-content: space-between;
    .item-quantity{
      width: 120px;
    }
    :deep(.ivu-form-item) {
      // margin-bottom: 0;
      padding: 0 20px 0 10px;
      .ivu-form-item-label{
        padding: 10px 5px 10px 0;
      }
    }
  }
}
</style>
