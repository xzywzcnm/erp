<template>
  <div class="auth-abnormal-warn">
    <div class="set-warn-btn" @click="openWarnModal">授权异常提醒设置</div>
    <Modal v-model="setWarnModalVisible" width="650px" title="授权异常提醒设置">
      <div class="auth-abnormal-modal-body">
        <Spin fix v-if="modalLoading"></Spin>
        <Form ref="modalFormRef" :model="modalFormData" :rules="modalFormRule" label-position="right" :label-width="0">
          <FormItem label="" :label-width="0" prop="userIdList">
            <div>异常提醒人：</div>
            <dytSelect v-model="modalFormData.userIdList" :multiple="true" placeholder="请选择异常提醒人" style="width: 80%;">
              <Option v-for="(item, index) in userInfoList" :value='item.userId' :key="`user-${index}`" :label="item.userName" />
            </dytSelect>
          </FormItem>
          <div class="txt-error mt60">异常提醒包括ERP弹窗提醒及钉钉提醒</div>
        </Form>
      </div>
      <div slot="footer">
        <Button @click="setWarnModalVisible = false">取消</Button>
        <Button type="primary" @click="saveAuthAbnormalWarn" :disabled="modalLoading">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api';

export default {
  name: 'authAbnormalWarnSet',
  props: {},
  data () {
    return {
      modalLoading: false,
      setWarnModalVisible: false,
      modalFormData: {
        settingId: '',
        paramValue: '',
        userIdList: []
      },
      modalFormRule: {},
    };
  },
  computed: {
    userInfoJson () {
      return this.$store.state.userInfoList || {};
    },
    userInfoList () {
      return Object.values(this.userInfoJson);
    }
  },
  watch: {
    setWarnModalVisible: {
      deep: true,
      immediate: true,
      handler (val) {
        if (val) return;
        this.closeWarnModal();
      }
    }
  },
  created () {},
  mounted () {},
  methods: {
    // 打开弹窗
    openWarnModal () {
      this.setWarnModalVisible = true;
      this.modalLoading = true;
      this.getSetDetails('saleAccountSettingAuthWarn', 'authWarnUserId').finally(() => {
        this.modalLoading = false;
      });
    },
    // 关闭弹窗
    closeWarnModal () {
      this.modalFormData = {
        settingId: '',
        paramValue: '',
        userIdList: []
      };
      this.modalLoading = false;
      this.setWarnModalVisible = false;
    },
    // 获取设置信息
    getSetDetails (businessId, paramKey) {
      return new Promise((resolve) => {
        this.axios.post(`${api.getAbnormalWarnSet}/${businessId}`).then(res => {
          if (!res || !res.data || res.data.code != 0) return resolve({ state: 'finally' });
          const setInfo = (res.data.datas || []).find(item => businessId == item.businessId && paramKey == item.paramKey);
          if (!this.$common.isEmpty(setInfo)) {
            this.modalFormData.settingId = setInfo.settingId;
            this.modalFormData.userIdList = (setInfo.paramValue || '').split(',');
          }
          resolve({ state: 'finally' });
        }).catch(() => {
          resolve({ state: 'finally' });
        })
      });
    },
    // 保存异常提醒信息
    saveAuthAbnormalWarn () {
      if (this.modalLoading) return;
      this.modalLoading = true;
      this.axios.put(api.updateAbnormalWarnSet, [{
        settingId: this.modalFormData.settingId,
        paramValue: this.modalFormData.userIdList.join(','),
      }]).then(res => {
        if (!res || !res.data || res.data.code != 0) return;
        this.$Message.success('操作成功');
        this.setWarnModalVisible = false;
      }).finally(() => {
        this.modalLoading = false;
      });
    }
  }
};
</script>
<style lang="less" scoped>
.auth-abnormal-warn{
  display: inline-block;
  .set-warn-btn{
    font-size: 16px;
    color: #00aaff;
    cursor: pointer;
  }
}
.auth-abnormal-modal-body{
  .txt-error {
    color: #f20;
  }
  .mt60{
    margin-top: 60px;
  }
}
</style>
