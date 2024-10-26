<template >
  <div >
    <div class="modalItemContent" >
      <div class="addModalData" >
        <Form
            :model="newWareHouseParams"
            label-position="right"
            :label-width="90"
            ref="newWareHouseParams"
            :rules="ruleWareSet" >
          <Form-item label="仓库代码：" prop="warehouseCode" >
            <Input
                v-model.trim="newWareHouseParams.warehouseCode" style="width:250px" placeholder="请输入仓库代码" ></Input >
          </Form-item >
          <Form-item label="仓库名称：" prop="warehouseName" >
            <Input
                v-model.trim="newWareHouseParams.warehouseName" style="width:250px" placeholder="'请输入仓库名称'" ></Input >
          </Form-item >
          <Form-item label="状态：" prop="selectStatus" >
            <Select v-model="newWareHouseParams.selectStatus" style="width:250px" > <Option value="0" >可用</Option >
            <Option value="1" >停用</Option > </Select >
          </Form-item >
          <Form-item label="类型：：" prop="selectType" >
            <Select v-model="newWareHouseParams.selectType" style="width:250px" > <Option value="0" >自营</Option >
            <Option value="1" >第三方</Option > </Select >
          </Form-item >
          <div class="line" ></div >
          <Form-item label="国家：" prop="country" >
            <Input v-model.trim="newWareHouseParams.country" style="width:250px" ></Input >
          </Form-item >
          <Form-item label="省份：" prop="province" >
            <Input v-model.trim="newWareHouseParams.province" style="width:250px" ></Input >
          </Form-item >
          <Form-item label="城市：" prop="city" >
            <Input v-model.trim="newWareHouseParams.city" style="width:250px" ></Input >
          </Form-item >
          <Form-item label="地址：" prop="address" >
            <Input v-model.trim="newWareHouseParams.address" style="width:250px" ></Input >
          </Form-item >
          <Form-item label="邮编：" prop="addressZipCode" >
            <Input v-model.trim="newWareHouseParams.addressZipCode" style="width:250px" ></Input >
          </Form-item >
          <Form-item label="联系人：" prop="userName" >
            <Input v-model.trim="newWareHouseParams.userName" style="width:250px" ></Input >
          </Form-item >
          <Form-item label="电话：" prop="telephone" >
            <Input v-model.trim="newWareHouseParams.telephone" style="width:250px" ></Input >
          </Form-item >
          <Form-item label="手机：" prop="mobile" >
            <Input v-model.trim="newWareHouseParams.mobile" style="width:250px" ></Input >
          </Form-item >
          <Form-item label="Email：" prop="email" >
            <Input v-model.trim="newWareHouseParams.email" style="width:250px" ></Input >
          </Form-item >
        </Form >
      </div >
    </div >
  </div >
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data () {
    return {
      newWareHouseParams: {
        selectStatus: '0', // 选择仓库状态
        selectType: '0', // 选择仓库类型
        warehouseCode: '', // 仓库代码
        warehouseName: '', // 仓库名称
        country: '', // 国家
        province: '', // 省份
        city: '', // 城市
        address: '', // 地址
        addressZipCode: '', // 邮编
        userName: '', // 用户名
        telephone: '', // 电话
        mobile: '', // 手机
        email: '' // email
      },
      ruleWareSet: {
        warehouseCode: [
          {
            required: true,
            message: '仓库代码不能为空',
            trigger: 'blur'
          }
        ],
        warehouseName: [
          {
            required: true,
            message: '仓库名称不能为空',
            trigger: 'blur'
          }
        ],
        telephone: [
          {
            validator: this.validateTelphone(),
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            validator: this.validateMobile(),
            trigger: 'blur'
          }
        ],
        email: [
          {
            validator: this.validateEmail(),
            trigger: 'blur'
          }
        ],
        addressZipCode: [
          {
            validator: this.validateZipCode(),
            trigger: 'blur'
          }
        ]
      }
    };
  },
  methods: {
    paramsObj () {
      var obj = {
        warehouseCode: this.newWareHouseParams.warehouseCode,
        warehouseName: this.newWareHouseParams.warehouseName,
        warehouseStatus: this.newWareHouseParams.selectStatus,
        warehouseType: this.newWareHouseParams.selectType,
        countryCnName: this.newWareHouseParams.country,
        stateCnName: this.newWareHouseParams.province,
        cityCnName: this.newWareHouseParams.city,
        address: this.newWareHouseParams.address,
        addressZipCode: this.newWareHouseParams.addressZipCode,
        linkMan: this.newWareHouseParams.userName,
        telephone: this.newWareHouseParams.telephone,
        mobilePhone: this.newWareHouseParams.mobile,
        email: this.newWareHouseParams.email
      };
      return obj;
    },
    getCreateParams (name) {
      var v = this;
      var obj = this.paramsObj();
      v.$refs[name].validate(valid => {
        if (valid) {
          v.axios.post(api.addWareSetData, obj).then(res => {
            if (res.data.code === 0) {
              v.$emit('createSuccess');
              v.$Message.success('新增仓库成功！');
            } else {
              v.$emit('createFail');
            }
          });
        } else {
          v.$Message.warning('新增仓库失败！');
        }
      });
    },
    handleReset (name) {
      this.$refs[name].resetFields();
    }, // 新增仓库
    addNewWareHouse () {
      this.getCreateParams('newWareHouseParams');
    }, // 重置表单
    resetNewWareHouse () {
      this.handleReset('newWareHouseParams');
    }, // 电话号码校验
    validateTelphone () {
      let v = this;
      var validateTelphone = function (rule, value, callback) {
        var re = v.$regular.fixedTelephone;
        var result = [];
        result = value.match(re);
        if (value !== '') {
          if (!!result === false) {
            callback(new Error('不是有效的固定电话或者格式不正确'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      };
      return validateTelphone;
    }, // 手机号码校验
    validateMobile () {
      let v = this;
      var validateMobile = function (rule, value, callback) {
        var re = v.$regular.isPhone;
        var result = [];
        result = value.match(re);
        if (value !== '') {
          if (!!result === false) {
            callback(new Error('不是有效的手机号码或者格式不正确'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      };
      return validateMobile;
    }, // 邮箱格式校验
    validateEmail () {
      let v = this;
      var validateEmail = function (rule, value, callback) {
        var re = v.$regular.isMailbox;
        var result = [];
        result = re.test(value);
        if (value !== '') {
          if (result === false) {
            callback(new Error('不是有效的邮箱或者邮箱格式不正确'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      };
      return validateEmail;
    }, // 邮政编码校验
    validateZipCode () {
      let v = this;
      var validateZipCode = function (rule, value, callback) {
        var re = v.$regular.postalCode;
        var result = [];
        result = re.test(value);
        if (value !== '') {
          if (result === false) {
            callback(new Error('不是有效的邮箱或者邮箱格式不正确'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      };
      return validateZipCode;
    }
  }
};
</script >
