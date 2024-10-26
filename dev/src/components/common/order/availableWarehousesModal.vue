<template>
  <div>
    <!-- 仓库解析 -->
    <Modal
      v-model="availableWarehouses"
      @on-cancel="closeMatchModal"
      :mask-closable="false"
      title="仓库解析"
      :width="950"
      @on-visible-change="visibleFn">
      <div class="info_title">
        <p class="line_box">
          <span class="title">收件国家/地区：</span> <span>{{ infolist.receivingCountry }}</span>
        </p>
        <p class="line_box">
          <span class="title">省/州：</span> <span>{{ infolist.provinceState }}</span>
        </p>
        <p class="line_box">
          <span class="title">城市：</span> <span>{{ infolist.city }}</span>
        </p>
        <p class="line_box">
          <span class="title">详细地址：</span> <span>{{ infolist.detailedAddress }}</span>
        </p>
      </div>
      <!--出库单商品-->
      <div
        class="orderTable normalTop" style="padding: 0;">
        <h3 class="commodity_title">出库单商品</h3>
        <Table
          highlight-row
          border
          max-height="420"
          :columns="commodityColumn"
          :data="commodityData">
        </Table>
      </div>
      <!--可用仓库-->
      <div
        class="orderTable normalTop" style="padding: 0;">
        <h3 class="commodity_title">以下为可用库存充足的仓库</h3>
        <Table
          highlight-row
          border
          max-height="420"
          :columns="adequateColumn"
          :data="adequateData">
        </Table>
      </div>
      <div
        slot="footer" style="padding: 20px 0 10px 0; text-align: center">
        <Button @click="selectBtn" type="primary" v-if="!disabled">选择</Button>
        <Button @click="closeMatchModal">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<style
  lang="less" scoped>
.info_title {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  .line_box {
    display: flex;
    align-items: center;
    margin: 0 35px 10px 0;

    .title {
      font-weight: bold;
      color: #333;
    }
  }
}

.commodity_title {
  color: #333;
  font-size: 14px;
  font-weight: bold;
  margin: 30px 0 8px 0;
}
</style>

<script type="text/ecmascript-6">
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  props: {
    orderDetailsData: Object,
    currentIndex: Number,
    disabled: { type: Boolean, default: false }
  },
  data () {
    var v = this;
    return {
      warehouseId: null,
      availableWarehouses: false,
      commodityColumn: [
        {
          title: '图片',
          key: 'pictureUrl',
          align: 'center',
          render: (h, params) => {
            return v.tableImg(h, params, 'pictureUrl');
          }
        }, {
          title: 'SKU/产品名称/SKU属性',
          key: 'skuinfo',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('div', params.row.sku), h('div', params.row.title), h('div', params.row.sku_attribute)
            ]);
          }
        }, {
          title: '订单数量',
          key: 'quantity',
          align: 'center'
        }
      ],
      commodityData: [],
      adequateData: [],
      adequateColumn: [
        {
          title: '操作',
          width: 80,
          align: 'center',
          render: (h, params) => {
            let id = params.row.warehouseId;
            let talg = false;
            v.warehouseId === id ? talg = true : talg = false;
            return h('Radio', {
              props: {
                size: 'small',
                value: talg,
                disabled: this.disabled
              },
              on: {
                'on-change': (value) => {
                  v.warehouseId = id;
                }
              }
            });
          }
        }, {
          title: '仓库代码',
          key: 'warehouseCode',
          align: 'center'
        }, {
          title: '仓库名称',
          key: 'warehouseName',
          align: 'center'
        }, {
          title: '仓库类型/服务商',
          key: 'type',
          align: 'center',
          render: (h, params) => {
            let warehouseType = '';
            switch (params.row.warehouseType) {
              case '0':
                warehouseType = '自营';
                break;
              case '1':
                warehouseType = '第三方';
                break;
              default:
                warehouseType = '';
            }
            return h('div', warehouseType);
          }
        }, {
          title: '仓库所在地',
          key: 'name',
          align: 'center',
          render: (h, params) => {
            let countryCnName = '';
            if (params.row.countryCnName !== '') {
              countryCnName = params.row.countryCnName;
            } else if (params.row.countryCode != null) {
              let countryData = JSON.parse(localStorage.getItem('area'));
              if (countryData.length > 0) {
                countryData.map((item) => {
                  if (item.twoCode === params.row.countryCode) {
                    countryCnName = item.cnName;
                  }
                });
              }
            } else {
              countryCnName = '';
            }
            return h('div', countryCnName);
          }
        }
      ],
      infolist: {},
      orderShippingId: null,
      orderShippingData: {}
    };
  },
  methods: {
    // 关闭弹窗时，重置数据
    closeMatchModal () {
      this.$emit('changeWarehouses', false);
    },

    // 处理详情数据
    handleInfo (data) {
      if (data && Object.keys(data).length > 0) {
        let countryData = JSON.parse(localStorage.getItem('area'));
        let receivingCountry = '';
        this.commodityData = [];
        if (countryData.length > 0) {
          countryData.map((item) => {
            if (item.twoCode === data.buyerCountryCode) {
              receivingCountry = item.cnName;
            }
          });
        }
        let address = data.buyerAddress1;
        if (data.buyerAddress2) {
          address = address + data.buyerAddress2;
        }
        this.infolist = {
          receivingCountry: receivingCountry,
          provinceState: data.buyerState,
          city: data.buyerCity,
          detailedAddress: address
        };
        this.orderShippingId = data.orderShippingId;

        // 出库单商品
        let commodity = data.orderShippingDetailList;
        if (commodity.length > 0) {
          commodity.map((ele) => {
            this.commodityData.push({
              productUrl: ele.productUrl,
              sku: ele.sku,
              title: ele.title,
              sku_attribute: ele.variations != null ? ele.variations : '',
              productGoodsId: ele.productGoodsId,
              quantity: ele.quantity
            });
          });
        }
      }
    },

    // 显示弹窗时
    visibleFn (value) {
      if (value) {
        // 获取可用的库存仓库数据
        if (this.commodityData.length > 0) {
          let query = [];
          this.commodityData.map((item) => {
            query.push({
              productGoodsId: item.productGoodsId,
              quantity: item.quantity
            });
          });
          this.axios.post(api.get_enoughInventoryWarehouses, query).then((response) => {
            if (response.data.code === 0) {
              this.adequateData = response.data.datas;
            }
          });
        }
      } else {
        this.warehouseId = null;
      }
    },

    // 选择仓库
    selectBtn () {
      let v = this;
      if (v.warehouseId === null) {
        v.$Message.error('请选择仓库');
        return false;
      }
      let obj = {
        orderShippingId: v.orderShippingId,
        warehouseId: v.warehouseId
      };
      v.$emit('selectWarehouse', obj, v.currentIndex);
    }
  },
  watch: {
    currentIndex: {
      handler (index) {
        let data = this.orderDetailsData.orderShippingInfoList[index];
        this.handleInfo(data);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
