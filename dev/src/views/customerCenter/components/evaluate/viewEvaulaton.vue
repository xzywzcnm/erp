<template >
  <div :class="wrap">
    <template v-if="evaluateRow && orderInfo">
      <Row type="flex" :gutter="20">
        <Col>
        销售号： {{ evaluateRow.accountCode + '-' + evaluateRow.salesRecordNumber }}
        </Col>
        <Col>
        {{ evaluateRow.buyerFeedbackContent }} <span class="redColor normalLRMargin">
          {{ !evaluateRow.sellerFirstTime ? '未处理' : '已处理' }}
        </span>
        </Col>
      </Row>
      <Card shadow class="normalTop" style="background-color: #f6f6f6">
        <Row type="flex" :gutter="20">
          <Col :span='10'>
          <Form :label-width="70" label-position="left">
            <FormItem label="金额:">
              {{ orderInfo.totalProductsCurrency }} {{ orderInfo.totalPrice }}（商品：{{ orderInfo.totalPriceUsd }} + 运费：{{
                  orderInfo.totalShippingFeeIncome ? orderInfo.totalShippingFeeIncome : 0
                }} + 保险：{{
                  orderInfo.total_insurance_income ? orderInfo.total_insurance_income : 0
                }} + 税费：{{ orderInfo.total_tax_income ? orderInfo.total_tax_income : 0 }})
            </FormItem>
            <FormItem label="买家:">
              {{ orderInfo.buyerName }}
            </FormItem>
            <FormItem label="发货地址:">
              <div>{{ orderInfo.buyerName }}</div>
              <div v-if="orderInfo.buyerPhone">{{ orderInfo.buyerPhone }}</div>
              <div v-if="orderInfo.buyerMobile">{{ orderInfo.buyerMobile }}</div>
              <div>{{ orderInfo.buyerAddress1 }} {{ orderInfo.buyerAddress2 }}</div>
              <div>{{ orderInfo.buyerCity }} {{ orderInfo.buyerState }} {{ orderInfo.buyerPostalCode }}</div>
              <div>{{ orderInfo.buyerCountry }}</div>
            </FormItem>
            <FormItem label="发货仓库:">
              {{ warehouseName }}(勿删勿动)
            </FormItem>
            <FormItem label="邮寄方式:">
              {{ warehouseName }}
            </FormItem>
          </Form>
          </Col>
          <Col :span='14'>
          <Row type="flex">
            订单销售号：{{ evaluateRow.accountCode + '-' + evaluateRow.salesRecordNumber }}
          </Row>
          <Row type="flex" class="normalTop">
            <Table :columns="evaluateColumns" :data='evaluateData'></Table>
          </Row>
          </Col>
        </Row>
      </Card>
    </template>
  </div>
</template>
<style lang="less" >
.tongtool-customerCenter-evaluate-view {
  & .ivu-form-item {
    margin-bottom: 0;
  }
}
</style>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import publicService from '@/components/mixin/publicService_mixin';

const prefixCls = 'tongtool-customerCenter-evaluate-view';
export default {
  mixins: [Mixin, publicService],
  data () {
    return {
      evaluateColumns: [
        {
          title: '销售号',
          key: 'sale'
        }, {
          title: 'Item',
          key: 'Item'
        }, {
          title: '商品',
          key: 'Item'
        }
      ],
      evaluateData: [],
      orderInfo: null,
      orderDetailsData: null,
      warehouseName: ''
    };
  },
  watch: {
    evaluateRow (n, o) {
      if (n !== o) {
        this.getOrderDetails();
      }
    }
  },
  methods: {
    getOrderDetails () {
      let v = this;
      v.axios.get(api.get_orderDetails + '/' + v.evaluateRow.orderId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.orderDetailsData = data;
          v.orderInfo = data.orderInfo;// 基本信息
          if (v.orderInfo.warehouseId) {
            v.getWarehouseName();
          }
        }
      });
    },
    getWarehouseName () {
      let v = this;
      let vItem = v.allStorelist.map(n => {
        return v.orderInfo.warehouseId === n.warehouseId;
      });
      if (vItem) {
        v.warehouseName = vItem.warehouseName;
      }
    }
    // getShippingMethodName () { // 获取物流商名称
    //   v.axios.post(api.queryCarrierShippingName, JSON.stringify([merchantShippingMethodIdPos])).then(response => {
    //     if (response.data.code === 0) {}
    //   });
    // }
  },
  computed: {
    wrap () {
      return `${prefixCls}`;
    }
  },
  props: {
    evaluateRow: Object
  },
  mounted () {
    this.getAllstore(0, 3);
  }
};
</script>
