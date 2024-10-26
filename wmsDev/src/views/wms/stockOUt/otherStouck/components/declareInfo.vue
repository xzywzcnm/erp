<template>
  <div>
    <div style="text-align:right;" class="mb10" v-if="!isDisabled">
      <Button type="primary" size="small" class="mr10" @click="addDeclare()">增加</Button>
    </div>
    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="0" class="fmb0 decalareinfo-form">
      <Table :columns="columnsDeclare" :data="formValidate.dataDeclare">
        <template slot-scope="{ index }" slot="goodsNameCn">
          <FormItem :prop="`dataDeclare.${index}.goodsNameCn`"
            :rules="{ required: true, message: '请输入', trigger: 'blur' }">
            <Input v-model="formValidate.dataDeclare[index].goodsNameCn" clearable :disabled="isDisabled"></Input>
          </FormItem>
        </template>
        <template slot-scope="{ index }" slot="goodsNameEn">
          <FormItem :prop="`dataDeclare.${index}.goodsNameEn`"
            :rules="{ required: true, message: '请输入', trigger: 'blur' }">
            <Input v-model="formValidate.dataDeclare[index].goodsNameEn" clearable :disabled="isDisabled"></Input>
          </FormItem>
        </template>
        <template slot-scope="{ index }" slot="unitPrice">
          <FormItem :prop="`dataDeclare.${index}.unitPrice`" :rules="{ required: true, message: '请输入', trigger: 'blur' }">
            <Input v-model="formValidate.dataDeclare[index].unitPrice" clearable :disabled="isDisabled"
              type="number"></Input>
          </FormItem>
        </template>
        <template slot-scope="{ index }" slot="declareCurrency">
          <FormItem :prop="`dataDeclare.${index}.declareCurrency`"
            :rules="{ required: true, message: '请输入', trigger: 'change' }">
            <Select v-model="formValidate.dataDeclare[index].declareCurrency" :transfer="true" clearable filterable
              :disabled="isDisabled">
              <Option v-for="v in currencyList" :value="v.value" :key="v.value">{{ v.label }}</Option>
            </Select>
          </FormItem>
        </template>
        <template slot-scope="{ index }" slot="unitWeight">
          <FormItem :prop="`dataDeclare.${index}.unitWeight`"
            :rules="{ required: true, message: '请输入', trigger: 'blur' }">
            <Input v-model="formValidate.dataDeclare[index].unitWeight" clearable :disabled="isDisabled"></Input>
          </FormItem>
        </template>
        <template slot-scope="{ index }" slot="quantity">
          <FormItem :prop="`dataDeclare.${index}.quantity`" :rules="{ required: true, message: '请输入', trigger: 'blur' }">
            <Input v-model="formValidate.dataDeclare[index].quantity" clearable :disabled="isDisabled"
              type="number"></Input>
          </FormItem>
        </template>
        <template slot-scope="{ index }" slot="hsCode">
          <FormItem :prop="`dataDeclare.${index}.hsCode`">
            <Input v-model="formValidate.dataDeclare[index].hsCode" clearable :disabled="isDisabled"></Input>
          </FormItem>
        </template>
        <template slot-scope="{ index }" slot="productUrl">
          <FormItem :prop="`dataDeclare.${index}.productUrl`">
            <Input v-model="formValidate.dataDeclare[index].productUrl" clearable :disabled="isDisabled"></Input>
          </FormItem>
        </template>
        <template slot-scope="{ row, index }" slot="action">
          <Icon class="action-ico" @click="formValidate.dataDeclare.splice(index, 1)" type="md-remove-circle" />
        </template>
      </Table>
    </Form>
  </div>
</template>

<script>
import api from "@/api/api";
import permission_mixin from '@/components/mixin/permission_mixin';
export default {
  name: 'declareInfo',
  mixins: [permission_mixin],
  data() {
    return {
      formValidate: {
        dataDeclare: [] // 申报信息数据
      },
      ruleValidate: {},
      currencyList: [],
    }
  },
  props: {
    detailData: {
      type: Object,
      default() {
        return {}
      }
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    detailData: {
      handler(val) {
        if (!val.pickingId) return;
        this.setData(JSON.parse(JSON.stringify(val)));
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    columnsDeclare() {
      let list = [
        {
          title: '中文申报名',
          slot: 'goodsNameCn',
          renderHeader: (h, params) => {
            return h('div',
              [
                h('span', { style: { color: 'red', marginRight: '4px' } }, '*'),
                h('span', '中文申报名')
              ]
            )
          }
        }, {
          title: '英文申报名',
          slot: 'goodsNameEn',
          renderHeader: (h, params) => {
            return h('div',
              [
                h('span', { style: { color: 'red', marginRight: '4px' } }, '*'),
                h('span', '英文申报名')
              ]
            )
          }
        }, {
          title: '申报价值',
          slot: 'unitPrice',
          renderHeader: (h, params) => {
            return h('div',
              [
                h('span', { style: { color: 'red', marginRight: '4px' } }, '*'),
                h('span', '申报价值')
              ]
            )
          }
        }, {
          title: '币种',
          slot: 'declareCurrency',
          renderHeader: (h, params) => {
            return h('div',
              [
                h('span', { style: { color: 'red', marginRight: '4px' } }, '*'),
                h('span', '币种')
              ]
            )
          }
        }, {
          title: '申报重量',
          slot: 'unitWeight',
          renderHeader: (h, params) => {
            return h('div',
              [
                h('span', { style: { color: 'red', marginRight: '4px' } }, '*'),
                h('span', '申报重量')
              ]
            )
          }
        }, {
          title: '申报数量',
          slot: 'quantity',
          renderHeader: (h, params) => {
            return h('div',
              [
                h('span', { style: { color: 'red', marginRight: '4px' } }, '*'),
                h('span', '申报数量')
              ]
            )
          }
        }, {
          title: '海关编码',
          slot: 'hsCode'
        }, {
          title: '销售链接',
          slot: 'productUrl'
        }
      ]
      if (!this.isDisabled && this.getPermission('wmsFbaPicking_saveDeclareMsg')) {
        list.push({
          title: '操作',
          width: 80,
          slot: 'action'
        })
      }
      return list;
    },
    isDisabled() {
      let pickingStatus = this.detailData.pickingStatus;
      return !(this.isEdit && (pickingStatus > 0 && pickingStatus < 99));
    }
  },
  created() {
    this.getCurrencyInfo();
  },
  methods: {
    // 获取币种下拉
    getCurrencyInfo() {
      return new Promise(resolve => {
        this.axios.get(api.get_currencyInfo + '?time=' + new Date().getTime()).then(response => {
          let data = response.data.datas || [];
          let pos = [];
          data.forEach(n => {
            let label = n.currencyCode + (n.currencyCnName ? '-' + n.currencyCnName : '');
            pos.push({
              label: label,
              value: n.currencyCode
            });
          });
          this.currencyList = pos;
          resolve(data);
        });
      });
    },
    setData(val) {
      let fbaDeclareBaseList = JSON.parse(JSON.stringify(val.fbaDeclareBaseList || []));
      fbaDeclareBaseList.forEach(k => {
        Object.keys(k).forEach(j => {
          k[j] = k[j] + '';
        })
      })
      this.formValidate.dataDeclare = fbaDeclareBaseList;
    },
    // 取消
    cancelEdit() {
      // 存在编辑未保存就取消的情况下，置空申报表格列表
      let idlist = this.formValidate.dataDeclare.filter(k => { return k.goodsId });
      if (!idlist.length) this.formValidate.dataDeclare = [];
    },
    // 添加申报行
    addDeclare() {
      let temp = {
        goodsNameCn: '',
        goodsNameEn: '',
        unitPrice: '',
        declareCurrency: '',
        unitWeight: '',
        quantity: '',
        hsCode: '',
        productUrl: '',
        pickingId: this.detailData.pickingId
      }
      this.formValidate.dataDeclare.push(temp);
    },
    // 保存申报信息
    handleSubmit() {
      return new Promise((resolve, reject) => {
        this.$refs['formValidate'].validate((valid) => {
          if (valid) {
            resolve(this.formValidate.dataDeclare);
          } else {
            resolve(false);
          }
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.decalareinfo-form {

  .ivu-input-wrapper-disabled,
  .ivu-input-disabled,
  .ivu-select-disabled,
  .ivu-select-disabled .ivu-select-input,
  .ivu-select-disabled .ivu-select-input[disabled] {
    color: #666;
    -webkit-text-fill-color: #666;
  }

  .action-ico {
    font-size: 24px;
    cursor: pointer;
  }
}
</style>
