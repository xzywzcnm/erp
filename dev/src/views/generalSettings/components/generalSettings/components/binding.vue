<template >
  <div>
    <div class="addBinding" v-if="$store.state.SETTING_CHANNEL === 0" style="display: flex;">
      <div style="flex: 100;">
        <Button type="primary" icon="md-add" v-if="getPermission(`${shopPlatformType}Account_insert`)"
          @click="addNewBind(shopPlatformType)">添加新绑定</Button>
        <Button type="primary" class="ml10"
          v-if="shopPlatformType === 'ebay' && getPermission('ebayAccount_batchUpdateFeedback')"
          @click="batchUpdateFeedbackScore">批量更新信用评价</Button>
      </div>
      <slot name="shopSort" />
    </div>
    <div class="addBinding" v-if="$store.state.SETTING_CHANNEL === 1" style="display: flex;">
      <div style="flex: 100;">
        <Button type="primary" icon="md-add" v-if="getPermission('saleAccount_insert')" @click="addShop()">添加新店铺</Button>
      </div>
      <slot name="shopSort" />
    </div>
    <Modal :transfer="true" :mask-closable="false" v-model="newBindingModel" width="600" @on-visible-change="visibleMt">
      <p slot="header" style="color:#113f6d;text-align:left">
        <Icon type="md-information-circle"></Icon>
        <span style="color:#fff">{{ bindingTitle }}</span>
      </p>
      <addNewBinding v-if="newBindingModel" ref="addNewBinding" :step="step" :sid="shopModel.sid" :oType="oType"
        :thirdAuth="thirdAuth" :accountCode="shopModel.accountCode" :shopPlatformType="shopPlatformType"
        :detailsParams="showParams.row" @resetEvent="resetStep" @closeBindingModel="closeBindingModel" @stepMt="stepMt"
        @enterNext="nextStep" @nextStepEvent="nextStepFinish" :account="shopModel.account" :saveCode="saveCodeStatus"
        @finishSave="finishSave"></addNewBinding>
      <div slot="footer">
        <div>
          <Button @click.stop="closeBindingModel">取消</Button>
          <Button type="primary" @click.stop="nextStep" :loading="loading"
            v-if="bindingTitle === '添加新绑定' && shopPlatformType !== 'vova' && isEdit">{{ addEmpolyeeText }} </Button>
          <span v-else class="ml10">
            <span v-if="isEdit">
              <Button type="primary" @click.stop="saveCode" :loading="loading" v-if="bindingTitle === '编辑'">保存</Button>
              <Button type="primary" @click.stop="nextStep" :loading="loading" v-else>保存</Button>
            </span>
          </span>
        </div>
      </div>
    </Modal>
    <custom-shop-modal ref="customModal" modalType="add"></custom-shop-modal>
  </div>
</template>
<script>
import Mixin from '@/components/mixin/common_mixin';
import shopMixin from '../mixin/shopMixin';
import addNewBinding from './addNewBinding';
import CustomShopModal from '@/views/generalSettings/components/generalSettings/components/customShopModal';

export default {
  mixins: [Mixin, shopMixin],
  props: {
    shopPlatformType: String,
    thirdAuth: { type: Boolean, default: false },
    showParams: {
      typeo: Object,
      default: () => {
        return {
          sid: '',
          type: '',
          account: '',
          row: {}
        }
      }
    }
  },
  watch: {
    showParams: {
      handler(n, o) {
        let v = this;
        v.showModal(n.sid, n.type, n.account);
      },
      deep: true
    }
  },
  components: {
    CustomShopModal,
    addNewBinding
  },
  data() {
    return {
      bindingTitle: '添加新绑定',
      newBindingModel: false,
      step: '0',
      shopModel: {
        sid: null,
        account: null
      },
      isEdit: false,
      oType: '',
      loading: false,
      saveCodeStatus: false,
      addEmpolyeeText: '下一步'
    };
  },
  methods: {
    /**
     * 批量更新信用评价
     * @date: 2021/7/19 15:48
     */
    batchUpdateFeedbackScore() {
      let v = this;
      v.$emit('emitBatchUpdateFeedbackScore');
    },
    resetStepToOne() {
      this.step = '0';
    },
    addShop() {
      this.$refs.customModal.open();
    },
    stepMt() {
      this.step = '0';
    },
    visibleMt(open) {
      if (open) {
        this.addEmpolyeeText = '下一步';
      } else {
        this.$refs.addNewBinding.resetMt();
        this.shopModel.sid = null;
        this.oType = null;
      }
    },
    addNewBind() {
      // this.bindingTitle = '添加新绑定';
      // this.resetStep();
      // this.isEdit = true;
      // this.oType = 'add';
      // this.newBindingModel = true;
      // this.$nextTick(function () {
      //   this.step = '0';
      //   if (this.$refs.addNewBinding) {
      //     this.$refs.addNewBinding.resetMt();
      //   }
      // });
      const handleData = (talg) => {
        if (talg) {
          this.$parent.toAuth({
            platformId: this.shopPlatformType,
            action: 'edit'
          });
        } else {
          this.bindingTitle = '添加新绑定';
          this.resetStep();
          this.isEdit = true;
          this.oType = 'add';
          this.newBindingModel = true;
          this.$nextTick(() => {
            this.step = '0';
            if (this.$refs.addNewBinding) {
              this.$refs.addNewBinding.resetMt();
            }
          });
        }
      }
      if (this.$store.state.thirdAuthPlatform.includes('all')) {
        this.$parent.toAuth({
          platformId: this.shopPlatformType,
          action: 'edit'
        });
      } else {
        this.$parent.getPushThirdAuthAccountData().then((list) => {
          handleData(list.includes(this.shopPlatformType));
        })
      }
    },
    resetStep() {
      let v = this;
      // v.shopModel.sid = null;
      v.disabled = false;
      v.loading = false;
      v.step = '0';
    },
    finishSave() {
      let v = this;
      v.closeBindingModel();
      v.saveCodeStatus = false;
      v.$parent.pageParamsStatus = true;
    },
    closeBindingModel() {
      this.newBindingModel = false;
      this.resetStep();
    },
    saveCode() {
      let v = this;
      v.saveCodeStatus = new Date().getTime();
      v.oType = null;
      // v.loading = false;
    },
    nextStep() {
      let v = this;
      // v.loading = true;
      if (v.step === '0') {
        v.shopModel.account = '';
        v.step = '1';
      } else {
        v.newBindingModel = false;
      }
    },
    nextStepFinish() {
      let v = this;
      v.loading = false;
      if (v.shopPlatformType === 'vova') {
        v.$parent.pageParamsStatus = true;
        v.newBindingModel = false;
      } else {
        v.$parent.pageParamsStatus = true;
        v.addEmpolyeeText = '保存';
      }
    },
    showModal(sid, type, account) {
      let v = this;
      v.isEdit = true;
      v.oType = type;
      v.$nextTick(function () {
        if (type === 'check') {
          v.bindingTitle = '查看';
          v.isEdit = false;
        } else if (type === 'give') {
          v.bindingTitle = '授权';
        } else if (type === 'edit') {
          v.bindingTitle = '编辑';
        }
        v.shopModel.account = account;
        v.shopModel.sid = sid;
        v.step = '0';
        v.$nextTick(() => {
          v.newBindingModel = true;
        })
      });
    }
  }
};
</script>
<style>
.ivu-dropdown .ivu-select-dropdown {
  max-height: 400px !important;
  overflow-x: hidden !important;
  overflow-y: scroll !important;
}
</style>
