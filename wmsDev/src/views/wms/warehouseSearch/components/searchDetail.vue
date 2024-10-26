<template> 
  <dyt-model :modalVisible.sync="modalVisible" @backList="backList" :pageLoading="pageLoading">
    <div slot="lefts">
      <Button type="primary" v-if="asyncPower" @click="refreshData">更新</Button>
      <Button class="ml10" @click="modalVisible = false;">取消</Button>
    </div>

    <Form ref="formCustom" :model="orderDetail" :label-width="110" :inline="true" class="detail-form">
      <div class="stock-block">
        <div class="title">仓库单信息</div>
        <div>
          <FormItem label="仓库单号:">
            <span class="span-block">{{ orderDetail.orderNumber || '' }}</span>
          </FormItem>
          <FormItem label="类型:">
            <span class="span-block">{{ orderDetail.autoFulfillmentEf }}</span>
          </FormItem>
          <FormItem label="生成时间:">
            <span class="span-block">{{ orderDetail.orderCreationTime || '' }}</span>
          </FormItem>
          <FormItem label="地区:">
            <span class="span-block">{{ getCountryName(orderDetail.country) }}
              <!-- <template v-for="(item, index) in countryList">
                <span v-if="item.twoCode === orderDetail.country" :key="index + 'countryList2'">
                  {{ item.cnName }}
                </span>
              </template> -->
            </span>
          </FormItem>
          <FormItem label="仓库单状态:">
            <span class="span-block">{{ orderDetail.orderStatus }}
              <!-- <template v-for="(item, index) in orderStatusList">
                <span v-if="item.list.includes(orderDetail.orderStatus)" :key="index + 'orderStatusList2'">
                  {{ item.label }}
                </span>
              </template> -->
            </span>
          </FormItem>
          <FormItem label="扩展订单号:">
            <span class="span-block">{{ orderDetail.extendedOrderId || '' }}</span>
          </FormItem>
          <FormItem label="ebay订单号:">
            <span class="span-block">{{ orderDetail.ebayOrderId || '' }}</span>
          </FormItem>
          <FormItem label="物流服务:">
            <span class="span-block">{{ orderDetail.shippingServiceCode }}</span>
          </FormItem>
          <div v-for="(item, index) in (orderDetail.efOutboundOrderTrackingDetailVOS || [])" :key="index">
            <FormItem label="运单号:">
              <span class="span-block">{{ item.trackingNumber || '' }}</span>
            </FormItem>
            <FormItem label="重量(g):">
              <span class="span-block">{{ Number((item.chargeacleWeight || 0)).toFixed(2) }}</span>
            </FormItem>
            <FormItem label="运费:">
              <span class="span-block">{{ Number((item.feeAmount || 0)).toFixed(2) }} {{ item.feeAmountCurrency
              }}</span>
            </FormItem>
          </div>
        </div>
      </div>

      <div class="stock-block">
        <div class="title">出库单信息</div>
        <div>
          <FormItem label="出库单编号:">
            <span class="span-block">{{ stockDetail.pickingNo }}</span>
          </FormItem>
          <FormItem label="出库单类型:">
            <span class="span-block">
              <template v-for="(item, index) in outListTypeList">
                <span v-if="item.value === stockDetail.pickingType" :key="index + 'outListTypeList2'">
                  {{ item.label }}
                </span>
              </template>
            </span>
          </FormItem>
          <FormItem label="发货仓库:">
            <span class="span-block">{{ stockDetail.warehouseName || '' }}</span>
          </FormItem>
          <FormItem label="订单号:">
            <span class="span-block">{{ data.orderId || '' }}</span>
          </FormItem>
          <FormItem label="创建时间:">
            <span class="span-block">{{ stockDetail.createdTime || '' }}</span>
          </FormItem>
          <FormItem label="创建人:">
            <span class="span-block">{{ stockDetail.createName }}
              <!-- <template v-for="(item, index) in userList">
                <span v-if="item.userId === stockDetail.createdBy" :key="index + 'outListTypeList2'">
                  {{ item.userName }}
                </span>
              </template> -->
            </span>
          </FormItem>
          <FormItem label="最后修改时间:">
            <span class="span-block">{{ stockDetail.updatedTime || '' }}</span>
          </FormItem>
          <FormItem label="最后修改人:">
            <span class="span-block">{{ stockDetail.updateName }}
              <!-- <template v-for="(item, index) in userList">
                <span v-if="item.userId === stockDetail.updatedBy" :key="index + 'outListTypeList2'">
                  {{ item.userName }}
                </span>
              </template> -->
            </span>
          </FormItem>
          <FormItem label="收货人名称:">
            <span class="span-block">{{ stockDetail.buyerName || '' }}</span>
          </FormItem>
          <FormItem label="国家:">
            <span class="span-block">{{ getCountryName(stockDetail.buyerCountryCode) }}
              <!-- <template v-for="(item, index) in countryList">
                <span v-if="item.twoCode === stockDetail.buyerCountryCode" :key="index + 'countryList3'">
                  {{ item.cnName }}
                </span>
              </template> -->
            </span>
          </FormItem>
          <FormItem label="联系人:">
            <span class="span-block">{{ stockDetail.buyerName || '' }}</span>
          </FormItem>
          <FormItem label="省/州:">
            <span class="span-block">{{ stockDetail.buyerState || '' }}</span>
          </FormItem>
          <FormItem label="固定电话:">
            <span class="span-block">{{ stockDetail.buyerPhone || '' }}</span>
          </FormItem>
          <FormItem label="城市:">
            <span class="span-block">{{ stockDetail.buyerCity || '' }}</span>
          </FormItem>
          <FormItem label="邮箱:">
            <span class="span-block">{{ stockDetail.buyerEmail || '' }}</span>
          </FormItem>
          <FormItem label="详细地址1:">
            <span class="span-block">{{ stockDetail.buyerAddress1 || '' }}</span>
          </FormItem>
          <FormItem label="详细地址2:">
            <span class="span-block">{{ stockDetail.buyerAddress2 || '' }}</span>
          </FormItem>
          <FormItem label="邮政编码:">
            <span class="span-block">{{ stockDetail.buyerPostalCode || '' }}</span>
          </FormItem>
          <FormItem label="物流商:">
            <span class="span-block">{{ stockDetail.carrierName || '' }}</span>
          </FormItem>
          <FormItem label="物流商仓库单号:">
            <span class="span-block">{{ stockDetail.thirdPartyNo || '' }}</span>
          </FormItem>
          <FormItem label="邮寄方式:">
            <span class="span-block">{{ stockDetail.merchantShippingMethodId || '' }}</span>
          </FormItem>
          <FormItem label="运单号:">
            <span class="span-block">{{ stockDetail.trackingNumber }}</span>
          </FormItem>
        </div>
      </div>

      <div class="stock-block">
        <div class="title">商品信息</div>
        <div>
          <Table border highlight-row :columns="columns" :data="stockDetail.packageGoodsResult || []">
            <template slot-scope="{ row, index }" slot="goodsUrl">
              <dyt-previewImg :url="row.goodsUrl"></dyt-previewImg>
            </template>
            <template slot-scope="{ row, index }" slot="goodsWeight">
              <span>{{ Number((row.goodsWeight || 0)).toFixed(2) }}</span>
            </template>
          </Table>
        </div>
      </div>
    </Form>
  </dyt-model>
</template>
<script>
import api from '@/api/api';
import { getWarehouseId } from '@/utils/getService';
export default {
  name: "searchDetail",
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: () => { return {} }
    },
    countryList: {
      type: Array,
      default: () => { return [] }
    },
    orderStatusList: {
      type: Object,
      default: () => { return {} }
    },
    asyncPower: {// 同步权限
      type: Boolean,
      default: () => { return false }
    },
    warehouseId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      modalVisible: false,
      pageLoading: false,
      columns: [{
        type: 'index',
        title: '行号',
        align: 'center',
        width: 70
      },
      {
        title: '产品图片',
        slot: 'goodsUrl',
        align: 'center',
        width: 100
      },
      {
        title: '商品编码',
        align: 'center',
        key: 'skuCode',
        minWidth: 120
      },
      {
        title: '产品sku',
        align: 'center',
        key: 'goodsSku',
        minWidth: 140
      },
      {
        title: '中文描述',
        align: 'center',
        key: 'goodsCnDesc',
        minWidth: 120,
        tooltip: true
      },
      {
        title: '英文描述',
        align: 'center',
        key: 'goodsEnDesc',
        minWidth: 120,
        tooltip: true
      },
      {
        title: '订单数量',
        key: 'expectedNumber',
        align: 'center',
        width: 120
      },
      {
        title: '重量(g)',
        slot: 'goodsWeight',
        align: 'center',
        width: 120
      }],
      orderDetail: {},
      stockDetail: {},
      outListTypeList: [
        {
          label: "FBA出库",
          value: "O5"
        },
        {
          label: "WFS出库",
          value: "O6"
        },
        {
          label: "EF出库",
          value: "O7"
        },
        {
          label: "谷仓出库",
          value: "O8"
        },
        {
          label: "SHL出库",
          value: "O9"
        },
        {
          label: '其他出库',
          value: 'O3'
        },
        {
          label: '调拨出库',
          value: 'O1'
        },
        {
          label: '退货',
          value: 'O4'
        },
        {
          label: '销售出库',
          value: 'S1'
        }
      ]
    }
  },
  watch: {
    dialogVisible: {
      handler(nval, oval) {
        nval && this.open();
      },
      deep: true
    },
    modalVisible: {
      handler(nval, oval) {
        !nval && this.$emit('update:dialogVisible', nval);
      },
      deep: true
    }
  },
  // computed: {
  //   //用户列表
  //   userList() {
  //     return this.$store.state.userInfoList || [];
  //   },
  // },
  methods: {
    // 窗口打开
    open() {
      this.modalVisible = true;
      this.init();
    },
    // 关闭窗口
    backList() {
      this.modalVisible = false;
    },
    // 初始化
    init() {
      this.pageLoading = true;
      this.$common.allSettled([() => this.getStockDetail(), () => this.getStockLinkDetail()]).then((results) => {
        results.forEach((item, index) => {
          if (item.status != 'fulfilled') return;
          let data = item.value.data || {};
          index === 0 && (this.stockDetail = data.datas || {});
          index === 1 && (this.orderDetail = data.datas || {});
        })
      }).finally(() => {
        this.pageLoading = false;
      })
    },
    // 获取出库单详情
    getStockDetail() {
      let { packageCode } = this.data;
      let warehouseId = getWarehouseId();
      return this.axios.post(`${api.ef_queryPackageDetail}?packageCode=${packageCode || ''}&warehouseId=${warehouseId || ''}`);
    },
    // 获取仓库单详情
    getStockLinkDetail() {
      let { orderNumber } = this.data;
      return this.axios.post(`${api.ef_queryOutboundOrderDetail}?orderNumber=${orderNumber}`);
    },
    // 处理国家名称
    getCountryName(country) {
      let list = this.countryList.filter(k => {
        return k.twoCode === country;
      })
      if (list.length) return list[0].cnName;
      return country;
    },
    // 更新
    refreshData() {
      this.$Modal.confirm({
        title: '操作提示',
        content: `确认是否要更新出库单?`,
        loading: true,
        onOk: () => {
          let temp = {
            syncType: 0,
            accountId: this.orderDetail.accountId,
            orderNumberList: [{ orderNumber: this.data.orderNumber }],
            warehouseId: this.warehouseId
          }
          this.axios.post(api.ef_sync, temp).then(response => {
            if (response.data.code === 0) {
              this.$Message.success('操作成功~');
              this.init();
            }
          }).finally(() => {
            this.$Modal.remove();
          })
        },
        onCancel: () => { }
      });
    }
  }
}
</script>
