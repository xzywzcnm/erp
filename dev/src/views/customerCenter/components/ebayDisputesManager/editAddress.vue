<template>
  <Modal v-model="model3" class="edit-address" title="修改地址">
    <Form ref="editAddress" :label-width="110" :model="returnAddress" :rules="rules">
      <FormItem label="全名"  prop="fullName">
        <Input v-model="returnAddress.fullName" />
      </FormItem>
      <FormItem label="地址1" prop="addressLine1">
        <Input v-model="returnAddress.addressLine1" />
      </FormItem>
      <FormItem label="地址2"  prop="addressLine2">
        <Input v-model="returnAddress.addressLine2" />
      </FormItem>
      <FormItem label="县"  prop="county">
        <Input v-model="returnAddress.county" />
      </FormItem>
      <FormItem label="城市"  prop="city">
        <Input v-model="returnAddress.city" />
      </FormItem>
      <FormItem label="州"  prop="stateOrProvince">
        <Input v-model="returnAddress.stateOrProvince" />
      </FormItem>
      <FormItem label="国家"  prop="country">
        <Input v-model="returnAddress.country" />
      </FormItem>
      <FormItem label="邮政编码"  prop="postalCode">
        <Input v-model="returnAddress.postalCode" />
      </FormItem>
      <FormItem label="号码"  prop="number">
        <Input v-model="returnAddress.primaryPhone.number" >
          <Input v-model="returnAddress.primaryPhone.countryCode" slot="prepend" size="small" style="width: 100px" />
        </Input>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="primary" @click="save">保存</Button>
      <Button @click="model3=false">取消</Button>
    </div>
  </Modal>
</template>

<script>
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'editAddress',
  mixins: [Mixin],
  data () {
    const validateNumber = (rule, value, callback) => {
      if (!this.returnAddress.primaryPhone.number) {
        callback(new Error('不能为空'));
      } else if (!this.returnAddress.primaryPhone.countryCode) {
        callback(new Error('不能为空'));
      } else {
        callback();
      }
    };
    return {
      model3: false,
      rules: {
        name: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        addressLine1: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        city: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        country: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        county: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        fullName: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        postalCode: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        stateOrProvince: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        number: [
          { validator: validateNumber, required: true, trigger: 'blur' }
        ]
      },
      returnAddress: {
        'addressLine1': '',
        'addressLine2': '',
        'city': '',
        'country': '',
        'county': '',
        'fullName': '',
        'postalCode': '',
        'stateOrProvince': '',
        'primaryPhone': {
          'countryCode': '',
          'number': ''
        }
      }
    };
  },
  created () {

  },
  props: {},
  watch: {},
  methods: {
    open () {
      this.model3 = true;
    },
    save () {
      this.$refs.editAddress.validate(valid => {
        if (valid) {
          this.$emit('save', this.returnAddress);
          this.model3 = false;
        }
      });
    }
  }
};
</script>

<style>
.edit-address .ivu-input-group-prepend {
  padding: 3px 7px!important;
}
</style>
