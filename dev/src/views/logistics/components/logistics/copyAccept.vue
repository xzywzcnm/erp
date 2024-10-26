<template>
  <Modal v-model="modal1" title="复制物流渠道" @on-visible-change="visibleFn" width="700px">
    <div class="copy-accept-main">
      <Spin fix v-if="pageLoading"></Spin>
      <Form ref="modalFormRef" :model="formModel" :rules="formRule">
        <Form-item label="" prop="copyType">
          <RadioGroup v-model="formModel.copyType">
            <Radio label="1">复制新渠道</Radio>
            <Radio label="2" v-if="logistiOptionsData.length != 0">覆盖原有渠道</Radio>
          </RadioGroup>
        </Form-item>
        <Form-item label="" class="not-margin">
          <div style="display: flex;">
            <span>当前物流渠道：</span>
            <span style="flex: 100;">
              {{ isThirdParty ? `${chooseRow.carrierName || ''}-${formModel.oldName || ''}` : formModel.oldName }}
            </span>
          </div>
        </Form-item>
        <Form-item
          label="复制新渠道名称："
          prop="newName"
          :class="`${formModel.copyType == '1' ? 'ivu-form-item-required' : ''}`"
          v-show="formModel.copyType == '1'"
        >
          <Input placeholder="请输入新渠道名称" v-model="formModel.newName" @on-blur="newNameBlur" />
        </Form-item>
        <Form-item
          label="覆盖以下渠道："
          prop="coverShippingMethodIdList"
          :class="`${formModel.copyType == '2' ? 'ivu-form-item-required' : ''}`"
          v-show="formModel.copyType == '2'"
        >
        <!-- :max-tag-count="1" -->
          <dyt-select
            v-model="formModel.coverShippingMethodIdList"
            placeholder="请选择需要覆盖的渠道"
            :multiple="true"
          >
            <Option v-for="(item, index) in logistiOptionsData" :key="index" :value="item.shippingMethodId" :label="item.carrierShippingMethodName" />
          </dyt-select>
        </Form-item>
      </Form>
    </div>
    <div slot="footer">
      <Button @click="saveFn" type="primary" :loading="pageLoading">保存</Button>
      <Button @click="modal1 = false">关闭</Button>
    </div>
  </Modal>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'copyAccept',
  mixins: [Mixin],
  props: {
    logistiData: {
      type: Array,
      default: () => {
        return []
      }
    },
    // 其他数据
    otherData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    acceptName: {
      type: String
    },
    shippingMethodId: {
      type: String
    }
  },
  data () {
    return {
      modal1: false,
      pageLoading: false,
      logistiOptionsData: [],
      formModel: {
        copyType: '1',
        oldName: '',
        newName: '',
        coverShippingMethodIdList: []
      },
      formRule: {
        newName: [
          {
            getRequired: () => {
              return this.formModel.copyType == '1';
            },
            validator: this.verifyName,
            msg: '请输入新渠道名称',
            maxLength: 100,
            trigger: 'change'
          },
          {
            getRequired: () => {
              return this.formModel.copyType == '1';
            },
            validator: this.verifyName,
            msg: '请输入新渠道名称',
            maxLength: 100,
            trigger: 'blur'
          }
        ],
        coverShippingMethodIdList: [
          {
            getRequired: () => {
              return this.formModel.copyType == '2';
            },
            validator: this.formItemVerify,
            msg: '请选择需要覆盖的渠道',
            trigger: 'change'
          },
        ]
      }
    };
  },
  watch: {},
  computed: {
    // 所有第三方物流商对应的仓库信息
    thirdCarrierData () {
      if (this.$common.isEmpty(this.otherData) || this.$common.isEmpty(this.otherData.thirdCarrierJson)) return {};
      return this.otherData.thirdCarrierJson;
    },
    // 当前选中的物流商对应仓库信息
    carrierWarehouse () {
      if (this.$common.isEmpty(this.chooseRow.apiCode) || this.$common.isEmpty(this.thirdCarrierData)) return [];
      return this.thirdCarrierData[this.chooseRow.apiCode] || [];
    },
    // 选择的物流商信息
    chooseRow () {
      if (this.$common.isEmpty(this.otherData) || this.$common.isEmpty(this.otherData.row)) return {};
      return this.otherData.row;
    },
    // 是否第三方物流
    isThirdParty () {
      if (this.$common.isEmpty(this.otherData) || this.$common.isEmpty(this.otherData.thirdPartyLogistics)) return false;
      return this.otherData.thirdPartyLogistics;
    }
  },
  methods: {
    // 验证是否为空
    formItemVerify (rule, value, callback) {
      this.$nextTick(() => {
        this.$common.formItemVerify(rule, this.formModel[rule.field], callback);
      });
    },
    // 验证渠道名称
    verifyName (rule, value, callback) {
      this.$nextTick(() => {
        let newVal = this.formModel[rule.field];
        if (rule.trigger == 'blur') {
          newVal = (newVal || '').trim();
        }
        this.$common.strMaxVerify(rule, newVal, callback);
      });
    },
    // 渠道名称输入框失去焦点时
    newNameBlur () {
      this.$nextTick(() => {
        this.$set(this.formModel, 'newName', (this.formModel.newName || '').trim());
      })
    },
    visibleFn (open) {
      if (open) {
        this.pageLoading = true;
        this.getCarrierDataList(this.carrierWarehouse).finally(() => {
          this.formModel = {
            copyType: '1',
            oldName: this.acceptName,
            newName: '',
            coverShippingMethodIdList: []
          };
          this.$refs.modalFormRef && this.$refs.modalFormRef.resetFields();
          this.pageLoading = false;
        });
      } else {
        this.pageLoading = false;
      }
    },
    // 获取对应物流商的物流渠道
    getCarrierDataList (data = []) {
      this.logistiOptionsData = [];
      return new Promise((resolve) => {
        if (!this.isThirdParty) {
          this.logistiOptionsData = this.logistiData.filter(item => {
            return this.shippingMethodId != item.shippingMethodId && (this.$common.isEmpty(item.status) || item.status == 1);
          });
          return resolve({ state: 'finally' });
        }
        const awaitRes = data.map((item) => {
          return () => {
            return new Promise((resolve) => {
              this.axios.get(api.get_enableShippingMethods, {
                params: {
                  carrierId: item.carrierId,
                  status: 1
                },
                hiddenError: true
              }).then((res) => {
                if (!res || !res.data || res.data.code != 0) return resolve([]);
                const newRes = res.data.datas.map(m => {
                  return { ...m, carrierShippingMethodName: `${item.carrierName}-${m.carrierShippingMethodName}` }
                });
                resolve(newRes);
              }).catch(() => {
                resolve([]);
              });
            })
          }
        });
        this.$common.promiseAll(awaitRes).then(arrRes => {
          let newArrRes = {};
          (this.$common.flat(arrRes)).filter(item => {
            return this.shippingMethodId != item.shippingMethodId && (this.$common.isEmpty(item.status) || item.status == 1);
          }).forEach(item => {
            if (this.$common.isEmpty(newArrRes[item.shippingMethodId])) {
              newArrRes[item.shippingMethodId] = item;
            }
          });
          this.logistiOptionsData = Object.values(newArrRes);
          resolve({ state: 'finally' });
        });
      })
    },
    // 复制物流渠道的保存按钮
    saveFn () {
      this.$refs.modalFormRef.validate((valid) => {
        if (!valid) return;
        let params = {
          copyFromShippingMethodId: this.shippingMethodId
        };
        if (this.formModel.copyType == '1') {
          params.copyToCarrierShippingMethodName = this.formModel.newName;
        }
        if (this.formModel.copyType == '2') {
          params.coverShippingMethodIdList = this.formModel.coverShippingMethodIdList;
        }
        this.axios.post(api.copy_carrierShippingMethod, params).then((response) => {
          if (response.data.code === 0) {
            this.$Message.success('操作成功');
            this.modal1 = false;
            this.$emit('getList');
          }
        });
      })
    }
  }
};
</script>

<style lang="less" scoped>
.copy-accept-main{
  position: relative;
  :deep(.ivu-form){
    .ivu-form-item{
      &.not-margin {
        margin: 0;
        padding: 10px 0;
        .ivu-form-item-content{
          line-height: 1.4em;
        }
      }
    }
  }
}
</style>
