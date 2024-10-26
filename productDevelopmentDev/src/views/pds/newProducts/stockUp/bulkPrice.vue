<template>
  <div class="bulkPricePage">
    <h4 class="h4sty mb10">大货价格</h4>
    <Form ref="productInfo" :label-width="90" class="fmb16">
      <div v-for="(item, index) in list" :key="index">
        <FormItem label="颜色:"  :label-width="70"> 
          <div>{{ item.color }}</div>
          <div class="inline-form">
            <FormItem label="物料成本:">
              <div>{{ item.materialCost }}</div>
            </FormItem>
            <FormItem label="加工成本:">
              <div>{{ item.processingCost }}</div>
            </FormItem>
            <FormItem label="加工倍率:">
              <div>{{ item.processingRatio }}</div>
            </FormItem>
            <FormItem label="二次工艺:">
              <div>{{ item.secondaryProcessCost }}</div>
            </FormItem>
            <FormItem label="合计:">
              <div>{{ item.totalAmount }}(元)</div>
            </FormItem>
          </div>
        </FormItem>
      </div>
    </Form>
    <Spin v-if="pageLoading" fix></Spin>
  </div>
</template>
<script>
import api from '@/api/api.js';
export default {
  name: "bulkPrice",
  props: {
    openType: {type: String, default: 'info'},
    btnoperat: {type: String, default: ''},
    modelVisible: { type: Boolean, default: false },
    productData: {
      type: Object,
      default() {
        return {};
      }
    },
  },
  data() {
    return {
      pageLoading: false,
      list: [],
    };
  },
  watch: {
    modelVisible: {
      immediate: true,
      handler (val) {
        this.$nextTick(() => {
          setTimeout(() => {
            val && this.pageInit();
          }, 300);
        })
      }
    }
  },
  created() {},
  methods: {
    pageInit () {
      this.pageLoading = true;
      let awaitRes = [this.detail];
      this.$common.promiseAll(awaitRes).then(resArr => {
        this.pageLoading = false;
        // console.log(resArr);
      }).catch(() => {
        this.pageLoading = false;
      })
    },
    detail() {
      return new Promise((resolve) => {
        this.axios.get(`${api.queryPrice}?productId=${this.productData.productId}`).then((data) => {
          if (data && data.datas) {
            let obj = {};
            const transferKey = ['materialCost', 'processingCost', 'processingRatio', 'totalAmount', 'secondaryProcessCost'];
            this.list = (data.datas || []).map(item => {
              obj = {};
              Object.keys(item).forEach(key => {
                if (transferKey.includes(key)) {
                  obj[key] = this.$common.isEmpty(Number(item[key])) ? '0.00' : Number(item[key]).toFixed(2);
                } else {
                  obj[key] = item[key];
                }
              })
              return obj;
            });
            return resolve(this.list);
          }
          resolve([]);
        }).catch((err) => {
          console.error(err);
          resolve([]);
        })
      })
    }
  }
};
</script>
<style lang="less">
.bulkPricePage {
  position: relative;
  .h4sty {
    font-weight: bold;
    width: 80px;
  }
  .inline-form {
    display: flex;
    >div {
      flex:1;
      font-size: 16px;
      .ivu-form-item-label,.ivu-form-item-content {
        font-size: 16px;
      }
    }
  }
}
</style>
