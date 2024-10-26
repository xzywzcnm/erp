<template>
  <div>
    <Modal v-model="visible" title="发货单详情" :mask-closable="false" width="50%" >
      <!-- @on-visible-change="showPayModalChange" -->
      <div>
        <div ><h2 style="text-align:center; margin-bottom:20px">发货单明细</h2></div>
        <div class="titleLeft" style="font-size: 16px;font-weight: bold;margin-bottom:20px">基本信息</div>
        <Form :label-width="100" :model="formData">
          <template>
            <!-- 供应商信息 -->
            <div>
              <div style="margin-left:20px">
                <Row>
                  <Col :span="8">
                    <FormItem label="发货单号：">{{formData.wareOrderNum}}</FormItem>
                  </Col>
                  <Col :span="8">
                    <FormItem label="送货方式：">{{formData.wareOrderType}}</FormItem>
                  </Col>
                  <Col :span="8">
                    <FormItem label="快递公司：">{{formData.wareOrderStatus}}</FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col :span="8">
                    <FormItem label="快递单号：">{{formData.stockHouse}}</FormItem>
                  </Col>
                  <Col :span="8">
                    <FormItem label="包裹数量：">{{formData.refrenceNum}}</FormItem>
                  </Col>
                  <Col :span="8">
                    <FormItem label="包裹重量(kg)：">{{formData.supplierName}}</FormItem>
                  </Col>
                </Row>
              </div>
            </div>
          </template>
        </Form>
      </div>

      <div class="titleLeft" style="font-size: 16px;font-weight: bold;margin-bottom:20px">订单信息</div>
      <div style="margin-left:20px">
        <div class="orderTable normalTop deleteLabelWidth">
          <Table highlight-row :border="true" :data="tableData" :columns="columns">
            
            <template slot-scope="{ index }" slot="sortNo">
              <div v-if="index < (tableData.length -1)">{{index+1}}</div>
              <div v-else>合计</div>
            </template>
            <template slot-scope="{ row, index }" slot="status">
              <div v-if="index < (tableData.length -1)">{{row.status}}</div>
              <div v-else>{{tableData.length - 1}}</div>
            </template>
            <template slot-scope="{ row }" slot="skuNo">
              <div>{{row.skuNo}}</div>
            </template>
            <template slot-scope="{ row }" slot="sku">
              <div class="textOver" :title="row.sku">{{row.sku}}</div>
            </template>
            <template slot-scope="{ row }" slot="cnName">
              <div class="textOver" :title="row.cnName">{{row.cnName}}</div>
            </template>
            <template slot-scope="{ row, index }" slot="enName">
              <div v-if="index < (tableData.length -1)">{{row.enName}}</div>
              <div v-else>{{numTotal}}</div>
            </template>
          </Table>
        </div>
      </div>
      
      <div slot="footer">
        <Button @click="visible = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import Mixin from '@/components/mixin/common_mixin';

import {deliverTitle} from './configFile'

export default {
  mixins: [Mixin],

  props: {
    dialogObj: {
      type: Object,
      default() {
        return {
          deliverVisible: false,
          data: {}
        }
      }
    }
  },

  data() {
    return {
      tableData: [],
      visible: false,
      formData: {},
      columns: deliverTitle,
      numTotal: 0,
    }
  },
  watch: {
    'dialogObj.data': {
      handler(newVal, oldVal) {
        if(newVal) {
          console.log(this.dialogObj,"dialogObj")
          this.visible = this.dialogObj.deliverVisible;
          this.formData = this.dialogObj.data;
          this.tableData = this.formData.list;
          //表格最下面添加一列合计
          this.tableData.push({});
          let numArr = this.tableData.map(k => {
            if(k.enName) {
              return k.enName
            }
          })
          numArr.pop()
          this.numTotal = numArr.reduce((pre, cur) => {
            return pre + cur
          })
        }
      }
    }
  }
}
</script>