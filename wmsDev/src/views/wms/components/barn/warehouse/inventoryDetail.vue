<template>
  <dyt-model :modalVisible.sync="modalVisible" @backList="backList" :pageLoading="pageLoading"
    class="inventoryDetailPage">
    <div slot="lefts">
      <Button class="ml10" type="primary" @click="submitSave" :loading="loading"
        v-if="getPermission('wmsGcInventory_save')">
        保 存
      </Button>
      <Button class="ml10" @click="modalVisible = false;">取 消</Button>
    </div>
    <div class="model-content">
      <Form ref="inventoryForm" :label-width="130" :model="formData" :inline="true" class="detail-form formDetail">
        <div class="stock-block stock-wordbreak">
          <div class="title">基本信息</div>
          <div>
            <FormItem label="商品编码:">
              <span>{{ orderDetail.productSku || '' }}</span>
            </FormItem>
            <FormItem label="客户参考号:">
              <span>{{ orderDetail.referenceNo || '' }}</span>
            </FormItem>
            <FormItem label="商品中文名称:">
              <span>{{ orderDetail.goodsCnDesc || '-' }}</span>
              <span>{{ orderDetail.goodsEnDesc || '-' }}</span>
            </FormItem>
            <FormItem label="商品英文名称:">
              <span>{{ orderDetail.goodsEnDesc || '' }}</span>
            </FormItem>

            <FormItem label="产品状态:">
              <span v-if="productStatusList[orderDetail.status]">
                {{ productStatusList[orderDetail.status].label }}
              </span>
            </FormItem>
            <FormItem label="重量(kg):">
              <span>{{ orderDetail.goodsWeight || 0 }}</span>
            </FormItem>
            <FormItem label="长宽高(cm):">
              <span>{{ orderDetail.goodsLength || 0 }}</span>
              <span>*{{ orderDetail.goodsWidth || 0 }}</span>
              <span>*{{ orderDetail.goodsHeight || 0 }}</span>
            </FormItem>
            <FormItem label="货物属性:">
              <span v-if="goodsAttributesList[orderDetail.goodsAttributes]">
                {{ goodsAttributesList[orderDetail.goodsAttributes].label }}
              </span>
            </FormItem>

            <FormItem label="LAPA SKU:">
              <span>{{ orderDetail.lapaSku || '' }}</span>
            </FormItem>
          </div>
        </div>

        <div class="stock-block stock-wordbreak ignore-width fmb0">
          <div class="title">产品入库明细</div>
          <div>
            <Table border highlight-row :columns="instockColumns" :data="formData.list">
              <template slot-scope="{ row, index }" slot="createTime">
                <div class="timeWidth">{{ row.createTime || '' }}</div>
              </template>
              <template slot-scope="{ row, index }" slot="shelvesTime">
                <div class="timeWidth">{{ row.shelvesTime || '' }}</div>
              </template>
              <template slot-scope="{ row, index }" slot="receiveQuantity">
                <div>{{ receiveComputed(row) }}</div>
              </template>
              <template slot-scope="{ row, index }" slot="ajustQuantity">
                <FormItem :label-width="0" class="tariffForm" :prop="'list.' + index + '.ajustQuantity'"
                  :rules="{ validator: validateNum, trigger: 'blur' }">
                  <dytInput v-model.number="formData.list[index].ajustQuantity" type="number" class="spinButton" />
                </FormItem>
              </template>
            </Table>
          </div>
        </div>
      </Form>
    </div>
  </dyt-model>
</template>
<script>
import Big from 'big.js';
import api from '@/api/api';
import permission_mixin from '@/components/mixin/permission_mixin';
import { goodsAttributesList, productStatusList } from './fileData.js';
export default {
  name: "inventoryDetail",
  mixins: [permission_mixin],
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    modalData: {
      type: Object,
      default: () => { return {} }
    },
  },
  data() {
    return {
      loading: false,
      pageLoading: false,
      modalVisible: false,
      formData: {
        list: [],
      },
      orderDetail: {},
      instockColumns: [
        {
          title: '入库单',
          key: 'receiptNo',
          minWidth: 120,
          align: 'center',
        },
        {
          title: '创建时间',
          slot: 'createTime',
          width: 100,
          align: 'center',
        },
        {
          title: '上架时间',
          slot: 'shelvesTime',
          width: 100,
          align: 'center',
        },
        {
          title: '商品编码',
          key: 'goodSku',
          minWidth: 120,
          align: 'center',
        },
        {
          title: '采购价CNY',
          key: 'purchaseCost',
          width: 120,
          align: 'center',
        },
        {
          title: '增值费CNY',
          key: 'addedValueCost',
          width: 100,
          align: 'center',
        },
        {
          title: '头程费CNY',
          key: 'headTripCost',
          width: 100,
          align: 'center',
        },
        {
          title: '关税费CNY',
          key: 'tariffCost',
          width: 140,
          align: 'center',
        },
        {
          title: '预报数量',
          key: 'forecastQuantity',
          width: 100,
          align: 'center',
        },
        {
          title: '收货数量',
          slot: 'receiveQuantity',
          width: 100,
          align: 'center',
        },
        {
          title: '上架数量',
          key: 'shelvesQuantity',
          width: 100,
          align: 'center',
        },
        {
          title: '调整数量',
          slot: 'ajustQuantity',
          width: 120,
          align: 'center',
        },
        {
          title: '使用数量',
          key: 'useQuantity',
          width: 100,
          align: 'center',
        },
        {
          title: '剩余数量',
          key: 'remainingQuantity',
          width: 100,
          align: 'center',
        },
      ],
      goodsAttributesList: goodsAttributesList, // 货物属性
      productStatusList: productStatusList, // 产品状态
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
  methods: {
    // 窗口打开
    open() {
      this.modalVisible = true;
      this.getDetail();
    },
    // 获取详情
    getDetail() {
      let warehouseId = this.$store.state.warehouseId;
      let { productSku } = this.modalData;
      this.pageLoading = true;
      this.axios.get(api.queryDetail, { params: { productSku, warehouseId } }).then(({ data }) => {
        if (data.code !== 0) return;
        let temp = data.datas || {};
        this.orderDetail = temp;

        let list = this.$common.copy(temp.gcReceiptDetailBoResultList || []);
        this.formData.list = list.map(k => {
          k.ajustQuantity = Number(k.adjustmentQuantity || 0);
          return k;
        });
      }).finally(() => {
        this.pageLoading = false;
      });
    },
    // 关闭窗口
    backList() {
      this.modalVisible = false;
    },
    // 提交保存数据
    submitSave() {
      this.$refs['inventoryForm'].validate((valid) => {
        if (!valid) return false;
        let list = this.formData.list.map(k => {
          return {
            receiptNo: k.receiptNo,
            goodSku: k.goodSku,
            number: k.ajustQuantity,
          }
        })
        // console.log(list);

        this.loading = true;
        this.axios.post(api.updateDetail, list).then(({ data }) => {
          if (data.code !== 0) return;
          this.modalVisible = false;
          this.$Message.success('操作成功~');
          this.$emit('search');
        }).finally(() => {
          this.loading = false;
        });
      })
    },
    // 计算剩余数量(剩余数量=上架数量-调整数量-使用数量)
    receiveComputed(row) {
      let shelvesQuantity = row.shelvesQuantity || 0;
      let adjustmentQuantity = row.adjustmentQuantity || 0;
      let useQuantity = row.useQuantity || 0;
      let allNumber = this.$regular.AllNumber;// 校验是否为数字

      if (allNumber.test(shelvesQuantity) && allNumber.test(adjustmentQuantity) && allNumber.test(useQuantity)) {
        return Number(new Big(shelvesQuantity).minus(adjustmentQuantity).minus(useQuantity));
      } else {
        return 0;
      }
    },
    validateNum(rule, value, callback) {
      let list = this.formData.list;
      let fieldArr = rule.field && rule.field.split('.');
      let temp = list[fieldArr[1]] || {};
      if (!this.$regular.integerZero.test(temp.ajustQuantity)) {
        return callback(new Error('限大于或等于0的正整数'));
      }
      // 数量=上架数量-使用数量
      let maxNum = new Big(temp.shelvesQuantity || 0).minus(temp.useQuantity || 0);
      if (new Big(temp.ajustQuantity || 0).minus(maxNum) > 0) {
        return callback(new Error('数量不能超过上架-使用的剩余量'));
      }
      callback();
    }
  }
}
</script>
<style lang="less">
.feeDetailPage {
  .stock-wordbreak {
    .ivu-form-item-content {
      word-break: break-all;
    }

    .errorText {
      color: red;
    }

    .tariffForm {
      margin-right: 0px !important;
    }
  }
}
</style>