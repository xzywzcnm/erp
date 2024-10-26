<template>
  <div>
    <!-- eslint-disable-next-line vue/no-mutating-props -->
    <Modal class="modal-main" v-model="dialogObj.modelVisible" :mask-closable="false" title="商家系统管理设置" :width="800">
      <div class="content">

        <Form ref="formValidate" :model="formValidate" :label-width="90" :rules="ruleValidate">
          <div class="fmb10">
            <h2>基本信息</h2>
            <Row>
              <Col span="8">
              <FormItem label="代码:">
                <span>{{dialogObj.data.supplierCode || '-'}}</span>
              </FormItem>
              </Col>
              <Col span="8">
              <FormItem label="名称:">
                <span>{{dialogObj.data.supplierName || '-'}}</span>
              </FormItem>
              </Col>
              <Col span="8">
              <FormItem label="等级:">
                <span v-for="item in dialogObj.supplierLevelList" :key="item.dataValue">{{dialogObj.data.supplierLevel === item.dataValue ? item.dataDesc: ''}}</span>
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="8">
              <FormItem label="供应商类型:">
                <span v-for="item in dialogObj.supplierTypeList" :key="item.dataValue">{{dialogObj.data.supplierType === item.dataValue ? item.dataDesc: ''}}</span>
              </FormItem>
              </Col>
              <Col span="8">
              <FormItem label="开发人:">
                <span>{{dialogObj.data.developerName || '-'}}</span>
              </FormItem>
              </Col>
              <Col span="8">
              <FormItem label="采购人:">
                <span>{{dialogObj.data.purchaserName || '-'}}</span>
              </FormItem>
              </Col>
            </Row>
          </div>

          <div class="fmb16">
            <h2>开通信息</h2>
            <FormItem label="开通状态:" :label-width="130">
              <i-switch v-model="formValidate.openStatus"></i-switch>
            </FormItem>
            <FormItem label="开通账号:" prop="accountNumber" :label-width="130">
              <div class="wrapInput">
                <Input v-model="formValidate.accountNumber" placeholder="商家系统的管理员账号" clearable :disabled="dialogObj.data.accountNumber?true:false"></Input>
                <div style="color:#ed4014;">开通账号的初始化密码为：a123456</div>
              </div>
            </FormItem>
            <FormItem label="商家系统的权限:" :label-width="130">
              <RadioGroup v-model="formValidate.permission">
                <Radio label="1">全部权限</Radio>
                <Radio label="2">部分权限</Radio>
              </RadioGroup>
            </FormItem>

            <!-- <FormItem label="商家权限模板名称:" v-if="formValidate.permission == 2" prop="power" :label-width="130">
              <dyt-select v-model="formValidate.power" clearable style="width:200px" :transfer="true">
                <Option v-for="item in powerList" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </dyt-select>
              <a href="javascript:;" class="ml10" style="text-decoration:underline;" @click="powerDialog()">商家系统权限模板设置</a>
            </FormItem> -->

            <!-- <FormItem label="" v-if="formValidate.permission==='2'">
              <Tree :data="powerList" show-checkbox></Tree>
            </FormItem> -->
          </div>
        </Form>

      </div>
      <div slot="footer" style="text-align: center;">
        <Button type="primary" @click="handleSubmit('formValidate')" :loading="loading">保存 </Button>
        <!-- eslint-disable-next-line vue/no-mutating-props -->
        <Button @click="dialogObj.modelVisible = false">关闭</Button>
      </div>
    </Modal>

    <power-template :CURENMSG="CURENMSG"></power-template>
  </div>
</template>

<script>
import api from '@/api/api';
import powerTemplate from './powerTemplate.vue';
export default {
  components: { powerTemplate },
  data () {
    const validatePassCheck = (rule, value, callback) => {
      const reg = /^[\w-]+$/;//字符只能为字母、数字、横线、下横线
      if (value && !reg.test(value)) {
        callback(new Error('字符只能为字母、数字、横线、下横线'));
      } else {
        callback();
      }
    };
    return {
      formValidate: {
        openStatus: false,
        accountNumber: '',
        permission: '1',
        supplierId: '',//供应商id
        // power: ''
      },
      ruleValidate: {
        accountNumber: [
          { required: true, message: '请输入商家系统的管理员账号', trigger: 'blur' },
          { max: 20, message: '最多只能输入20个字符', trigger: 'blur' },
          { validator: validatePassCheck, trigger: 'blur' }
        ],
        power: [
          { required: true, type: 'number', message: '请选择商家系统的权限', trigger: 'change' },
        ],
      },
      loading: false,
      powerList: [{ label: '直供商家模板', value: 1 }],
      CURENMSG: {
        modelVisible: false
      },
      // powerList: []
    };
  },
  props: {
    dialogObj: {
      type: Object,
      default () {
        return {
          modelVisible: false,
          data: {},
          supplierTypeList: [],
          supplierLevelList: [],
        };
      }
    }
  },
  watch: {
    'dialogObj.modelVisible': {
      handler (newVal, oldVal) {
        if (newVal) {
          this.handleReset();
        } else {
          this.$refs['formValidate'] && this.$refs['formValidate'].resetFields();
        }
      },
      deep: true,
      immediate: true
    }
  },
  created () { },
  methods: {
    // 提交
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          // if (this.formValidate.permission === '2' && !this.powerList.length) {
          //   this.$Message.error('部分权限长度为0，请勾选~');
          //   return;
          // }
          let temp = Object.assign({}, this.formValidate);
          temp.openStatus = temp.openStatus ? 1 : 0;

          this.loading = true;
          this.axios.post(api.businessSave, temp).then(response => {
            if (response.data.code === 0) {
              this.$Message.info('操作成功');
              // eslint-disable-next-line vue/no-mutating-props
              this.dialogObj.modelVisible = false;
              this.$emit('search');
            }
          }).finally(() => {
            this.loading = false;
          });
        }
      });
    },
    // 重置
    handleReset () {
      let data = this.dialogObj.data;
      this.formValidate.permission = data.permission || '1';
      if (data.openStatus || data.openStatus === 0) {
        this.formValidate.openStatus = data.openStatus === 1 ? true : false;
      } else {
        this.formValidate.openStatus = false;
      }
      this.formValidate.supplierId = data.supplierId || '';
      this.formValidate.accountNumber = data.accountNumber || '';
    },
    // 获取权限列表
    getPower () { },
    // 权限模板
    powerDialog () {
      this.CURENMSG.modelVisible = true;
    }
  }
};
</script>
<style scoped>
.content h2 {
  font-size: 14px;
  padding: 6px 10px;
  background-color: #f3f3f3;
  margin-bottom: 10px;
}
.wrapInput .ivu-input-wrapper {
  width: 300px;
  margin-right: 10px;
}
.wrapInput {
  display: flex;
  align-items: center;
}
</style>