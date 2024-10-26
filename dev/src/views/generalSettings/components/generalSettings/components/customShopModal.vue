<template >
  <Modal :transfer="true" :mask-closable="false" v-model="model1" :title="titleJson[modalType]||'查看新店铺'" @on-visible-change="visible">
    <Form ref="formInline" :model="formInline" :rules="ruleInline">
      <FormItem prop="platformId" label="归属渠道">
        <dyt-select v-model="formInline.platformId" :disabled="modalType === 'look'">
          <Option v-for="item in channelList" :key="item.merchantPlatformId" :value="item.platformId"
          >{{ item.name }}</Option>
        </dyt-select>
      </FormItem>
      <FormItem prop="accountCode" label="店铺代号">
        <Input type="text" v-model="formInline.accountCode" :disabled="modalType !== 'add'"></Input>
      </FormItem>
      <FormItem prop="account" label="店铺名称">
        <Input type="text" v-model="formInline.account" :disabled="modalType === 'look'"></Input>
      </FormItem>
      <FormItem label="iossNo" prop="iossNo">
        <Input v-model="formInline.iossNo" :disabled="modalType === 'look'" :maxlength="200"></Input>
      </FormItem>
      <FormItem label="vat No" prop="vatNo">
        <Input type="text" v-model="formInline.vatNo" :disabled="modalType === 'look'"></Input>
      </FormItem>
      <FormItem label="EORI" prop="eori">
        <Input type="text" v-model="formInline.eori" :disabled="modalType === 'look'"></Input>
      </FormItem>
      <FormItem label="token" prop="saleToken" v-if="isEditSaleToken">
        <Input type="text" v-model="formInline.saleToken" :disabled="modalType === 'look'"></Input>
      </FormItem>
      <!-- <Form-item label="托管类型" prop="fullyOrHalf" v-if="isShein">
        <dyt-select v-model="formInline.fullyOrHalf" :clearable="false" :disabled="modalType === 'look'" placeholder="请选择托管类型">
          <Option :value="1">全托管</Option>
          <Option :value="2">半托管</Option>
        </dyt-select>
      </Form-item> -->
      <FormItem label="店铺ID" prop="sheinAccountId" v-if="isShein">
        <Input type="text" v-model="formInline.sheinAccountId" :disabled="modalType === 'look'"></Input>
      </FormItem>
      <Form-item label="所属事业部" prop="businessDeptId">
        <dyt-select
          v-model="formInline.businessDeptId"
          placeholder="请选择所属事业部"
          :disabled="modalType === 'look'"
        >
          <Option v-for="(item, index) in businessDeptDataList" :value='item.id' :key="`business-${index}`">{{item.name}}</Option>
        </dyt-select>
      </Form-item>
      <Form-item label="对接类型" prop="temuTagSource" v-if="isShowButtJointType">
        <dyt-select v-model="formInline.temuTagSource" :clearable="false" :disabled="modalType === 'look'" placeholder="请选择对接类型">
          <Option :value="0">API对接</Option>
          <Option :value="1">无对接</Option>
        </dyt-select>
      </Form-item>
      <FormItem label="token" prop="temuToken" v-if="isEditToken">
        <Input type="text" v-model="formInline.temuToken" :disabled="modalType === 'look'"></Input>
      </FormItem>
      <FormItem
        :label="`${channelJson[formInline.platformId] ? channelJson[formInline.platformId].name || '' : ''} 店铺ID`"
        prop="temuAccount"
        v-if="isShowAccountId"
      >
        <Input type="text" v-model="formInline.temuAccount" :disabled="modalType === 'look'"></Input>
      </FormItem>
      <FormItem label="授权状态：" v-if="isShowAccreditStatus">
        {{ authStatusTxt.txt }}
      </FormItem>
      <Form-item label="店铺主体" prop="temuDeveloperId" v-if="isShowTemuDevId">
        <dyt-select
          v-model="formInline.temuDeveloperId"
          placeholder="请选店铺主体"
          :disabled="modalType === 'look'"
        >
          <Option v-for="(item, index) in developerIdList" :value='item.id' :key="`business-${index}`">{{item.name}}</Option>
        </dyt-select>
      </Form-item>
      <Form-item label="品牌" prop="brandId">
        <dyt-select v-model="formInline.brandId" :clearable="clearable" :disabled="modalType === 'look'">
          <Option v-for="(item, index) in brandList" :key="index" :value="item.productBrandId">{{ item.name }}</Option>
        </dyt-select>
      </Form-item>
      <FormItem prop="transactionRate" label="交易费比例">
        <InputNumber :max="1000000000" :min="0" v-model="formInline.transactionRate" :disabled="modalType === 'look'">
        </InputNumber>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button v-if="modalType !== 'look'" @click="saveMt" type="primary">保存</Button>
      <Button @click="model1 = false">关闭</Button>
    </div>
    <Spin size="large" fix v-if="spinShow" />
  </Modal>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

const authStatusJson = {
  '0': {
    txt: '未授权',
    style: {
      color: '#e91e63'
    }
  },
  '1': {
    txt: '已授权',
    style: {
      color: '#3cb034'
    }
  },
  '2': {
    txt: '授权失效',
    style: {
      color: '#e91e63'
    }
  }
}

const formReplaceKey = {
  temuDeveloperId: 'developerId'
}

export default {
  name: 'customShopModal',
  mixins: [Mixin],
  props: {
    modalType: {
      default: 'add' // 操作类型  add  edit look
    },
    pageParamsStatus: {
      default: false
    }
  },
  data () {
    return {
      model1: false,
      spinShow: false,
      channelList: [],
      channelJson: {},
      brandList: [],
      clearable: true,
      businessDeptDataList: [],
      developerIdList: [],
      formInline: {
        businessDeptId: null, // 所属事业部
        temuTagSource: null, // 对接类型
        sheinAccountId: '', // shein店铺id
        fullyOrHalf: 1, // shein 全托管或半托管 1-全托管 2-半托管(默认全托管，半托管分离出去了)
        temuDeveloperId: null, // 店铺主体
        'temuAccount': '', // temu 店铺ID
        'temuToken': '', // temu 店铺 Token
        'saleToken': '', // Tiktok888 店铺的 Token
        'account': '', // 店铺名称
        'vatNo': '', // vat No
        'eori': '', // eori
        'brandId': '', // 品牌
        'accountCode': '', // 店铺编码
        'platformId': '', // 平台代码
        'platformType': 1, // 平台类型 1 自定义平台 ,
        'transactionRate': 0, // 交易费比率
        'iossNo': '' // iossNo
      },
      oldFormInline: {},
      ruleInline: {
        // 事业部验证
        businessDeptId: [
          { message: '请选择所属事业部', trigger: 'change', required: true, type: 'number' }
        ],
        temuDeveloperId: [
          { message: '请选择店铺主体', trigger: 'change', required: true, type: 'string' }
        ],
        account: [
          { required: true, message: '店铺名称不能为空', trigger: 'blur' }
        ],
        accountCode: [
          { required: true, message: '店铺代号不能为空', trigger: 'blur' }
        ],
        platformId: [
          { required: true, message: '渠道不能为空', trigger: 'change' }
        ],
        temuToken: [
          { required: true, validator: this.validateAccessToken, message: '店铺 token 不能为空', trigger: 'blur' },
          { required: true, validator: this.validateAccessToken, message: '店铺 token 不能为空', trigger: 'change' },
        ],
        temuAccount: [
          { required: true, validator: this.validateAccountId, trigger: 'blur' },
          { required: true, validator: this.validateAccountId, trigger: 'change' }
        ],
        temuTagSource: [
          { required: true, message: '请选择对接类型', trigger: 'change', type: 'number' }
        ],
        fullyOrHalf: [
          { required: true, validator: this.$common.formItemVerify, msg: '请选择托管类型', trigger: 'change' }
        ],
        sheinAccountId: [
          { required: true, validator: this.$common.formItemVerify, msg: '请输入店铺ID', trigger: 'blur' },
          { required: true, validator: this.$common.formItemVerify, msg: '请输入店铺ID', trigger: 'change' }
        ],
      },
      shopData: {},
      titleJson: {
        add: '添加新店铺',
        look: '查看新店铺',
        edit: '修改店铺信息'
      }
    };
  },
  computed: {
    // 是否显示对接类型
    isShowButtJointType () {
      return this.isTemu;
    },
    // 是否可以编辑 token
    isEditToken () {
      return this.isTemu && this.formInline.temuTagSource == 0;
    },
    // 是否可以编辑 saleToken
    isEditSaleToken () {
      return this.isTiktok888 || this.isShein;
    },
    // 是否 Shein 平台
    isShein () {
      if (this.$common.isEmpty(this.formInline.platformId)) return false;
      return ['shein'].includes(this.formInline.platformId.toLocaleLowerCase());
    },
    // 是否 Tiktok888 平台
    isTiktok888 () {
      if (this.$common.isEmpty(this.formInline.platformId)) return false;
      return ['tiktok888'].includes(this.formInline.platformId.toLocaleLowerCase());
    },
    // 是否显示授权状态
    isShowAccreditStatus () {
      return this.isTemu && this.formInline.temuTagSource == 0;
    },
    // 是否 Temu 平台
    isTemu () {
      if (this.$common.isEmpty(this.formInline.platformId)) return false;
      return ['temu'].includes(this.formInline.platformId.toLocaleLowerCase());
    },
    // 是否显示店铺 ID
    isShowAccountId () {
      return this.isTemu && this.formInline.temuTagSource == 0;
    },
    // 是否显示店铺主体
    isShowTemuDevId () {
      return this.isTemu && this.formInline.temuTagSource == 0;
    },
    //
    authStatusTxt () {
      if (this.$common.isEmpty(this.shopData.temuStatus)) return {};
      return authStatusJson[this.shopData.temuStatus] || {};
    }
  },
  created () {},
  watch: {
    shopData: {
      deep: true,
      handler (n, o) {
        if (n && n !== o) {
          if (this.modalType !== 'add') {
            const replaceKey = Object.keys(formReplaceKey);
            for (let key in this.formInline) {
              if (replaceKey.includes(key) && !this.$common.isUndefined(n[formReplaceKey[key]])) {
                this.formInline[key] = n[formReplaceKey[key]];
              } else if (!this.$common.isUndefined(n[key])) {
                this.formInline[key] = n[key];
              }
            }
            this.formInline.saleAccountId = n.saleAccountId;
          }
        }
      }
    }
  },
  methods: {
    open (saleAccountId = '') {
      this.model1 = true;
      this.oldFormInline = this.$common.copy(this.formInline);
      if (this.modalType === 'add') {
        for (let key in this.formInline) {
          this.formInline[key] = '';
        }
        this.formInline.platformType = 1; // 平台类型 1 自定义平台 ,
        this.formInline.transactionRate = 0; // 交易费比率
        this.spinShow = true;
        this.$common.promiseAll([
          this.getBrandList,
          // 获取事业部
          this.getBusinessDeptData,
          // 获取 Temu 店铺主体
          this.getDevList
        ]).then((resArr) => {
          // console.log(resArr);
        }).finally(() => {
          this.spinShow = false;
        })
        return;
      }
      if (this.saleAccountId) return;
      this.spinShow = true;
      this.$common.promiseAll([
        () => {
          return this.getSaleAccount(saleAccountId)
        },
        this.getBrandList,
        // 获取事业部
        this.getBusinessDeptData,
        // 获取 Temu 店铺主体
        this.getDevList
      ]).then((resArr) => {
        this.shopData = resArr[0];
      }).finally(() => {
        this.spinShow = false;
      })
    },
    // 获取 Temu 店铺主体
    getDevList () {
      return new Promise((resolve) => {
        // queryType=0 自定义渠道 temu，queryType=1 temu半托管
        this.axios.get(api.settingService.developerList, {
          params: {
            queryType: 0
          }
        }).then(res => {
          if (!res || !res.data || res.data.code != 0) return resolve([]);
          this.developerIdList = (res.data.datas || []).map(item => {
            return {
              ...item,
              id: this.$common.isEmpty(item.id) ? '' : item.id.toString()
            };
          });
          resolve(this.developerIdList);
        }).catch(() => {
          resolve([]);
        });
      })
    },
    // 新增保存 编辑保存
    saveMt () {
      this.$refs.formInline.validate((valid) => {
        if (!valid) return;
        this.spinShow = true;
        const formData = this.$common.copy(this.formInline);
        if (!this.isShowButtJointType) {
          delete formData.temuTagSource;
        }
        if (!this.isShowTemuDevId) {
          delete formData.temuDeveloperId;
        }
        if (!this.isEditToken) {
          delete formData.temuToken;
        }
        if (!this.isEditSaleToken) {
          delete formData.saleToken;
        }
        if (!this.isShein) {
          delete formData.sheinAccountId;
          delete formData.fullyOrHalf;
        }
        if (!this.isShowAccountId) {
          delete formData.temuAccount;
        }
        if (formData.hasOwnProperty('saleAccountId') && this.modalType === 'add') delete formData.saleAccountId;
        this.axios[this.modalType === 'add' ? 'post' : 'put'](api[this.modalType === 'add' ? 'create_saleAccount' : 'update_saleAccount'], {
          ...formData,
          brandId: formData.brandId || ''
        }).then(response => {
          this.spinShow = false;
          if (response.data.code === 0) {
            this.modalType === 'add' && this.superAdminHand(response.data.datas || '');
            this.$Message.success('操作成功');
            this.model1 = false;
            this.$parent.$parent.pageParamsStatus = true;//  刷新
          }
        }).catch(() => {
          this.spinShow = false;
        })
      });
    },
    superAdminHand (saleAccountId) {
      if (this.$common.isEmpty(saleAccountId)) return;
      this.axios.get(api.settingService.addStore, { params: { saleAccountId: saleAccountId } }).catch(e => {
        console.error(e)
      })
    },
    // 获取事业部
    getBusinessDeptData () {
      return new Promise((resolve) => {
        this.axios.get(api.get_businessDeptList).then(res => {
          if (res && res.data) {
            this.businessDeptDataList = res.data.data || [];
            resolve(res.data.data || []);
          } else {
            resolve([]);
          }
        }).catch(() => {
          resolve([]);
        });
      })
    },
    visible (open) {
      if (!open) {
        this.formInline = this.$common.copy(this.oldFormInline);
        this.$nextTick(() => {
          this.$refs.formInline && this.$refs.formInline.resetFields();
        })
        return;
      }
      this.getPlatformGroup(1, '/setting-service/erpCommon').then(() => {
        let list = [];
        (this.$store.state.platformGroup || []).forEach(i => {
          if (i.type === 2) {
            this.$set(this.channelJson, i.platformId, i);
            list.push(i);
          }
        });
        this.channelList = list;
      });
    },
    getBrandList () {
      return new Promise((resolve) => {
        // 获取商品管理中的品牌
        this.axios.get(api.getAll_productBrandcommon, { hiddenError: true }).then(response => {
          if (response.data.code == 0) {
            this.brandList = response.data.datas || [];
            resolve(response.data.datas || []);
          } else {
            resolve([]);
          }
        }).catch(() => {
          resolve([]);
        });
      })
    },
    // 验证 token
    validateAccessToken (rule, value, callback) {
      if (this.$common.isEmpty(value)) {
        return callback(new Error(rule.message));
      }
      if (value.length > 200) {
        return callback(new Error('token 不能超过 200 字符'));
      }
      callback();
    },
    getSaleAccount (saleAccountId) {
      return new Promise(resolve => {
        this.axios.get(api.get_saleAccount + saleAccountId).then(response => {
          if (response.data && response.data.code === 0) return resolve(response.data.datas || {});
          resolve({});
        }).catch(() => {
          resolve({});
        });
      })
    },
    // 验证 accountId
    validateAccountId (rule, value, callback) {
      if (this.$common.isEmpty(value)) {
        return callback(new Error(`${this.formInline.platformId} 店铺ID不能为空`));
      }
      if (value.length > 200) {
        return callback(new Error(`${this.formInline.platformId} 店铺ID不能超过 200 字符`));
      }
      callback();
    }
  }
};
</script>

<style scoped >
</style >
