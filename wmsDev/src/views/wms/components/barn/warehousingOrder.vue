<template>
  <div class="warehousingOrderPage listPage">
    <Form ref="pageParams" :label-width="100" class="commonFormItem fmb0">
      <Form-item label="下单状态:">
        <RadioGroup v-model="orderStatus" type="button" button-style="solid">
          <Radio :label="item.value" v-for="(item, index) in statusList" :key="index + 'status'">
            {{ item.label }}
          </Radio>
        </RadioGroup>
      </Form-item>
    </Form>
    <!-- 待下单 -->
    <waiteWarehouseOrder v-show="[0, 4].includes(orderStatus)" :tab="orderStatus"></waiteWarehouseOrder>
    <!-- 已下单 -->
    <hasWarehouseOrder v-show="[1, 2, 3].includes(orderStatus)" :tab="orderStatus"></hasWarehouseOrder>
  </div>
</template>
<script>
import waiteWarehouseOrder from './warehouse/waiteWarehouseOrder';
import hasWarehouseOrder from './warehouse/hasWarehouseOrder';
import { statusList } from './warehouse/fileData.js';
export default {
  name: 'warehousingOrder',
  components: { waiteWarehouseOrder, hasWarehouseOrder },
  data() {
    return {
      orderStatus: 0,
      statusList: statusList,
    }
  },
}
</script>
<style lang="less">
.warehousingOrderPage {
  position: relative;
  overflow: hidden;

  .commonFormItem {
    padding: 10px 10px 0;
    background-color: #fff;
  }
}
</style>