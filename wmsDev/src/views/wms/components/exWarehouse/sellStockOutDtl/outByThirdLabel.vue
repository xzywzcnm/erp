<template>
  <div>
    <Modal v-model="isVisible" title="操作提示" :width="600" :mask-closable="false">
      <div style="padding:0 50px;">

        <div style="display: flex;align-items: center;">
          <Icon type="md-alert" style="font-size:28px;color:#ff982d" class="mr10" />
          <span>如果{{ label }}的商品已经贴好了第三方标签，需要按第三方标签{{ label }}</span>
        </div>

        <Alert type="warning" style="display:inline-block;margin:10px 0 20px 40px;padding: 8px;">
          提示：如果要取消按第三方标签{{ label }}，第三方标签选择为空
        </Alert>

        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100"
          :class="{ 'detail-form': type === 'stockOut' }">
          <FormItem label="第三方标签：" :label-width="120" v-if="type === 'stockOut'" prop="overseaTagId">
            <dyt-select v-model="formValidate.overseaTagId">
              <Option :value="item.overseaTagId" v-for="(item, index) in thrdList" :key="index" :label="item.name" />
            </dyt-select>
          </FormItem>
          <template v-if="type === 'inStock'">
            <FormItem label="平台主体：" prop="platformId">
              <dyt-select v-model="formValidate.platformId" @on-change="platformChange">
                <Option v-for="item in platformList" :value="item.platformName" :key="item.platformId"
                  :label="item.platformName">
                </Option>
              </dyt-select>
            </FormItem>
            <FormItem label="店铺：" prop="saleAccountId">
              <dyt-select v-model="formValidate.saleAccountId">
                <Option v-for="item in shopList" :value="item.saleAccountId" :key="item.saleAccountId"
                  :label="item.account" />
              </dyt-select>
            </FormItem>
            <!-- <FormItem label="平台订单号：" prop="platformOrderNo" v-if="formValidate.platformId == 'tiktok'">
              <Input v-model.trim="formValidate.platformOrderNo"></Input>
            </FormItem> -->
          </template>
        </Form>
      </div>

      <div slot="footer">
        <Button type="primary" :loading="loading" @click="confirm">确认</Button>
        <Button @click="isVisible = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
export default {
  name: 'outByThirdLabel',
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false
      }
    },
    list: {
      type: Array,
      default() {
        return []
      }
    },
    data: {
      type: Object,
      default() {
        return {}
      }
    },
    type: {
      type: String,
      default() {
        return ''
      }
    },
  },
  data() {
    return {
      loading: false,
      isVisible: false,
      formValidate: {
        overseaTagId: '',
        platformId: '',
        saleAccountId: '',
        // platformOrderNo: '',
      },
      ruleValidate: {
        saleAccountId: [
          { validator: this.validateAccount, trigger: 'change', msg: '请选择店铺!' }
        ],
        // platformOrderNo: [
        //   { validator: this.validateAccount, trigger: 'change', msg: '请填写平台订单号!' }
        // ],
      },
      platformList: [],
      shopList: [],
      types: {
        inStock: {
          title: '入库',
          returnFun: this.inStockReturn
        },
        stockOut: {
          title: '出库',
          returnFun: this.stockOutReturn
        }
      },
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
    thrdJson() {
      let thrdJson = {};
      this.list.forEach(item => {
        thrdJson[item.overseaTagId] = item;
      })
      return thrdJson;
    },
    thrdList() {
      return Object.values(this.thrdJson);
    },
    label() {
      let typeItem = this.types[this.type] || {};
      return typeItem.title || '';
    },
  },
  methods: {
    validateAccount(rule, value, callback) {
      if (this.formValidate.platformId && ['', null, undefined].includes(value)) {
        callback(new Error(rule.msg));
      } else {
        callback();
      }
    },
    // 窗口打开
    open() {
      this.isVisible = true;
      this.type === 'inStock' && this.getPlatformList();
      this.$nextTick(() => {
        this.$refs['formValidate'].resetFields();
      })
    },
    confirm() {
      this.$refs['formValidate'].validate((valid) => {
        if (valid) {
          let fun = this.types[this.type] || {};
          fun.returnFun && fun.returnFun();
        }
      })
    },
    // 获取所有平台
    getPlatformList() {
      this.$store.dispatch('getAllPlatformList').then(list => {
        this.platformList = list;
      })
    },
    // 根据平台和入库单获取对应的店铺信息
    async platformChange(e) {
      this.formValidate.saleAccountId = '';
      if (!e) {
        this.shopList = [];
        return;
      }
      let item = this.platformList.filter(k => k.platformName === e)[0] || {};
      let allStoreList = await this.$store.dispatch('getAllStoreList', { platformId: item.platformId });
      const { receiptNo } = this.data;
      this.loading = true;
      this.axios.get(api.queryProductGoodsCommonOverseaTag + receiptNo + '/' + item.platformId)
        .then(({ data }) => {
          if (data.code !== 0) return;
          let list = data.datas || [];
          let temp = {};
          allStoreList.forEach(k => {
            if (list.includes(k.saleAccountId)) temp[k.saleAccountId] = k;
          });
          this.shopList = Object.values(temp);
        }).finally(() => {
          this.loading = false;
        })
    },
    inStockReturn() {
      let temp = {};
      let formValidate = this.formValidate;
      let accountList = this.shopList.filter(k => k.saleAccountId === formValidate.saleAccountId);
      let paramsList = ['platformId', 'saleAccountId'];//, 'platformOrderNo'
      paramsList.forEach(k => {
        temp[k] = formValidate[k] || '';
      })
      // if (formValidate.platformId !== 'tiktok') delete temp.platformOrderNo;
      temp.accountCode = accountList[0] ? accountList[0].accountCode : '';
      this.$emit('confirmLabel', temp);
    },
    stockOutReturn() {
      let { overseaTagId } = this.formValidate;
      let tag = this.thrdJson[overseaTagId];
      if (this.$common.isEmpty(tag)) {
        tag = { overseaTagId }
      }
      this.$emit('confirmLabel', tag);
    },
  },
}
</script>