<template>
  <div>
    <Form class="formDetail" ref="formValidate" :label-width="120" :inline="true">
      <div class="fmb0 formWidth180">
        <slot name="firstLine"></slot>
        <FormItem label="质检单号:">
          <span>{{ data.receiptCheckNo || '' }}</span>
        </FormItem>
        <FormItem label="采购单号:">
          <span>{{ data.purchaseNo || '' }}</span>
        </FormItem>
        <FormItem label="入库单号:">
          <span>{{ data.receiptNo || '' }}</span>
        </FormItem>

        <FormItem label="供应商:">
          <span>{{ data.supplierName || '' }}</span>
        </FormItem>
        <FormItem label="采购员:">
          <span>{{ data.purchaserId }}</span>
        </FormItem>
        <FormItem label="创建时间:">
          <span v-if="data.createdTime">
            {{ $uDate.dealTime(data.createdTime) }}
          </span>
        </FormItem>

        <FormItem label="已检问题数:">
          <span>{{ data.failedCheckedNumber || 0 }}</span>
        </FormItem>
        <FormItem label="剩余数:">
          <span>{{ data.surplusNumber || 0 }}</span>
        </FormItem>

        <slot></slot>
      </div>
    </Form>
  </div>
</template>

<script>
export default {
  name: 'commonForm',
  props: {
    data: {
      type: Object,
      default() {
        return {}
      }
    },
  },
  data() {
    return {}
  },
  methods: {}
}
</script>